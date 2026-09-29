import collections
import json
import os
import re
import sys
import time
import urllib.request
from html.parser import HTMLParser
from urllib.parse import urljoin

# beatcancer.eu, the website of the European Youth Cancer Network (YARN), has no API
# and cannot be embedded, so its resource listing is read page by page
BASE_URL = 'https://beatcancer.eu'
LISTING_URL = BASE_URL + '/resources/'
USER_AGENT = 'STRONG-AYA-info-portal (+https://github.com/STRONGAYA/strong-aya-info-portal)'
REQUEST_DELAY = 1  # seconds between requests, to go easy on the website
MAX_PAGES = 100
THUMBNAIL_WIDTH = '640w'  # the resized image beatcancer.eu itself serves for its cards


class ListingParser(HTMLParser):
    """
    Read one page of the beatcancer.eu resource listing: the resource cards and the options
    of its topic filter (label -> id, as used in ``?topic=<id>``).
    """

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.cards = []
        self.topic_ids = {}
        self._link = None  # href of the anchor that may wrap a card
        self._card = None  # the card being read
        self._field = None  # (tag, field) whose text is being collected
        self._text = []
        self._in_topic_filter = False
        self._option = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = (attrs.get('class') or '').split()
        if tag == 'select':
            self._in_topic_filter = attrs.get('name') == 'topic'
        elif tag == 'option' and self._in_topic_filter:
            self._option = attrs.get('value')
            self._start_field(tag, 'option')
        elif tag == 'a':
            href = attrs.get('href') or ''
            self._link = href if re.fullmatch(r'/resources/[^/?#]+/', href) else None
        elif tag == 'article' and self._link:
            self._card = {'url': urljoin(BASE_URL, self._link), 'title': '', 'excerpt': '', 'type': '',
                          'topics': [], 'date': '', 'image': ''}
        elif self._card is not None:
            if tag == 'h3':
                self._start_field(tag, 'title')
            elif tag == 'p' and not self._card['excerpt']:
                self._start_field(tag, 'excerpt')
            elif tag == 'span' and 'badge' in classes:
                # The resource type is the badge on the image, above the title
                if not self._card['title']:
                    self._start_field(tag, 'type')
                elif 'badge-accent' in classes:
                    self._start_field(tag, 'topics')
            elif tag == 'time':
                self._card['date'] = (attrs.get('datetime') or '')[:10]
            elif tag == 'img':
                self._card['image'] = _thumbnail(attrs)

    def handle_endtag(self, tag):
        if self._field and tag == self._field[0]:
            self._end_field()
        if tag == 'select':
            self._in_topic_filter = False
        elif tag == 'article' and self._card is not None:
            self.cards.append(self._card)
            self._card = None
        elif tag == 'a':
            self._link = None

    def handle_data(self, data):
        if self._field:
            self._text.append(data)

    def _start_field(self, tag, field):
        self._field = (tag, field)
        self._text = []

    def _end_field(self):
        field = self._field[1]
        text = ' '.join(''.join(self._text).split())
        self._field = None
        if field == 'option':
            if self._option:
                self.topic_ids[text] = self._option
        elif field == 'topics':
            self._card['topics'].append(text)
        else:
            self._card[field] = text


def _thumbnail(attrs):
    for candidate in (attrs.get('srcset') or '').split(','):
        parts = candidate.split()
        if len(parts) == 2 and parts[1] == THUMBNAIL_WIDTH:
            return urljoin(BASE_URL, parts[0])
    return urljoin(BASE_URL, attrs['src']) if attrs.get('src') else ''


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read().decode('utf-8')


def fetch_catalogue():
    """
    Read every page of the beatcancer.eu resource listing.

    :return: The resources (url, title, excerpt, type, topics, date, image) and the topic filter
        options (label -> id).
    :rtype: tuple[list[dict], dict]
    """
    resources, topic_ids = {}, {}
    for page in range(1, MAX_PAGES + 1):
        parser = ListingParser()
        parser.feed(fetch(f'{LISTING_URL}?page={page}'))
        topic_ids = topic_ids or parser.topic_ids
        new = [card for card in parser.cards if card['url'] not in resources]
        if not new:
            break
        resources.update((card['url'], card) for card in new)
        time.sleep(REQUEST_DELAY)
    return list(resources.values()), topic_ids


def check_catalogue(resources, topic_ids, config):
    """Fail loudly when the listing could not be read (e.g. after a redesign of beatcancer.eu)."""
    problems = []
    if not resources:
        problems.append('no resources found')
    elif sum(1 for r in resources if r['title'] and r['topics'] and r['date']) < 0.9 * len(resources):
        problems.append('most resources lack a title, topic or date')
    unknown = sorted({topic for page in config['pages'].values() for topic in page['topics']} - set(topic_ids))
    if unknown:
        problems.append('unknown topics: ' + ', '.join(unknown))
    if problems:
        raise RuntimeError('Could not read the beatcancer.eu resource listing: ' + '; '.join(problems))


def pick_resources(resources, page, config):
    """
    Pick the resources for one portal page: first those with a word of the page's first keyword
    group in their title, then of its next group, and so on; any places left go to the newest
    resources of the page's beatcancer.eu topics. Within each step the newest resources come first.

    :param list resources: The beatcancer.eu resources.
    :param dict page: The page's 'topics' and 'keywords' (a list of groups of words) from the config.
    :param dict config: The config, with 'resources_per_page' and the unsuitable resources to skip
        ('exclude_types' and 'exclude_title_words').
    :return: The picked resources.
    :rtype: list[dict]
    """
    suitable = sorted((r for r in resources if _is_suitable(r, config)), key=lambda r: r['date'], reverse=True)
    picked = []
    for words in page.get('keywords', []) + [None]:
        for resource in suitable:
            if len(picked) == config['resources_per_page']:
                return picked
            matches = _title_has(resource, words) if words else any(t in page['topics'] for t in resource['topics'])
            if matches and resource not in picked and not _is_near_duplicate(resource, picked):
                picked.append(resource)
    return picked


def _is_suitable(resource, config):
    return (resource['type'] not in config['exclude_types']
            and not _title_has(resource, config['exclude_title_words']))


def _title_has(resource, words):
    # Whole words or phrases only, so e.g. 'work' does not match 'network'
    return any(re.search(r'\b' + re.escape(word) + r'\b', resource['title'], re.IGNORECASE) for word in words)


def _is_near_duplicate(resource, picked):
    # Avoid near-identical titles (e.g. a series of exercise pages) side by side
    words = _title_words(resource['title'])
    for other in picked:
        other_words = _title_words(other['title'])
        if len(words & other_words) >= 0.5 * len(words | other_words):
            return True
    return False


def _title_words(title):
    return {word.rstrip('s') for word in re.findall(r'[a-z]+', title.lower()) if len(word) > 3} - {'cancer'}


def _tidy_excerpt(excerpt):
    # The listing cuts its excerpts off mid-word ('... with preparation. Th...');
    # end them at the last whole word (or sentence) instead
    if not excerpt.endswith('...'):
        return excerpt
    text = excerpt[:-3]
    if ' ' in text:
        text = text[:text.rindex(' ')]
    text = text.rstrip(' ,;:-–—')
    return text if text.endswith(('.', '!', '?')) else text + '…'


def build_resource_lists(resources, topic_ids, config):
    """
    :return: Per portal page, its beatcancer.eu topics (label, listing url, number of resources)
        and the picked resources.
    :rtype: dict
    """
    counts = collections.Counter(topic for resource in resources for topic in resource['topics'])
    pages = {}
    for page_id, page in config['pages'].items():
        pages[page_id] = {
            'topics': [{'label': topic, 'url': f'{LISTING_URL}?topic={topic_ids[topic]}', 'count': counts[topic]}
                       for topic in page['topics']],
            'resources': [{'title': r['title'], 'url': r['url'], 'excerpt': _tidy_excerpt(r['excerpt']), 'type': r['type'],
                           'topic': r['topics'][0] if r['topics'] else '', 'date': r['date'], 'image': r['image']}
                          for r in pick_resources(resources, page, config)],
        }
    return {'source': LISTING_URL, 'pages': pages}


if __name__ == '__main__':
    # Get command line arguments
    config_path = sys.argv[1]
    output_path = sys.argv[2]

    # Load the portal page -> beatcancer.eu topics and keywords mapping
    with open(config_path, 'r') as f:
        config = json.load(f)

    resources, topic_ids = fetch_catalogue()
    check_catalogue(resources, topic_ids, config)
    resource_lists = build_resource_lists(resources, topic_ids, config)

    # Write the resource lists for the website
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(resource_lists, f, indent=2, ensure_ascii=False)
        f.write('\n')

    print(f'{len(resources)} resources read; written to {output_path}')
    for page_id, page in resource_lists['pages'].items():
        print(page_id, [resource['title'] for resource in page['resources']])
