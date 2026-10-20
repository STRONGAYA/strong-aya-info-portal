"""
Tests of scripts/translate_site.py against the real English pages (web/) and against temporary copies for
everything that writes. Run from the repository root:

    python3 -m unittest scripts.test_translate_site
    python3 scripts/test_translate_site.py
"""
import contextlib
import io
import json
import os
import re
import shutil
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import translate_site as ts  # noqa: E402

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = os.path.join(REPO, 'web')
TRANSLATIONS = os.path.join(REPO, 'translations')
PAGE_COUNT = 17


class FakeClient:
    """Stands in for DeepL: a marker in front of every text (identity when marker is '')."""

    def __init__(self, marker='[nl] '):
        self.marker = marker
        self.requests = []
        self.glossaries = {}

    def translate(self, texts, target_lang, parameters):
        self.requests.append((list(texts), target_lang, dict(parameters)))
        return [(self.marker + text, len(text)) for text in texts]

    def usage(self):
        return {'character_count': 123, 'character_limit': 1000000}

    def create_glossary(self, name, dictionaries):
        self.glossaries['g1'] = (name, dictionaries)
        return {'glossary_id': 'g1'}

    def replace_dictionary(self, glossary_id, dictionary):
        if glossary_id not in self.glossaries:
            raise ts.DeepLError('DeepL: PUT failed with 404: not found')
        return {}


def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_strings(path):
    """The JSON of a strings file (web/i18n/<lang>.js)."""
    text = ts.read_text(path)
    return json.loads(text[ts.STRINGS_PREFIX.search(text).end():].strip().rstrip(';'))


def dump_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def quiet(function, *args, **kwargs):
    """Run with the script's log output captured; returns (result, output)."""
    output = io.StringIO()
    with contextlib.redirect_stdout(output):
        result = function(*args, **kwargs)
    return result, output.getvalue()


def copy_site(destination):
    """A copy of the English sources and the translations directory, without the heavy assets."""
    web = os.path.join(destination, 'web')
    os.makedirs(os.path.join(web, 'i18n'))
    for name in os.listdir(WEB):
        source = os.path.join(WEB, name)
        if name.endswith('.html'):
            shutil.copy(source, web)
        elif name.startswith('module_') and os.path.isdir(source):
            shutil.copytree(source, os.path.join(web, name))
    shutil.copy(os.path.join(WEB, 'i18n', 'en.js'), os.path.join(web, 'i18n'))
    shutil.copy(os.path.join(WEB, 'i18n', 'languages.js'), os.path.join(web, 'i18n'))
    os.makedirs(os.path.join(web, 'data'))
    shutil.copy(os.path.join(WEB, 'data', 'national_resources.json'), os.path.join(web, 'data'))
    translations = os.path.join(destination, 'translations')
    os.makedirs(translations)
    for name in ('config.json', 'glossary.tsv', 'glossary.json'):
        shutil.copy(os.path.join(TRANSLATIONS, name), translations)
    return web, translations


class ExtractorTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.site = ts.Site(WEB, TRANSLATIONS)

    def page(self, rel):
        return next(page for page in self.site.pages if page.rel == rel)

    def test_pages_found(self):
        self.assertEqual(len(self.site.pages), PAGE_COUNT)
        self.assertEqual(self.site.pages[0].rel, 'index.html')
        self.assertIn('module_a/chemotherapy.html', [page.rel for page in self.site.pages])

    def test_every_page_has_units(self):
        for page in self.site.pages:
            self.assertGreater(len(page.units), 30, page.rel)
            self.assertGreater(len(page.attr_units), 0, page.rel)

    def test_shared_units_deduplicate(self):
        total = sum(len(page.units) + len(page.attr_units) for page in self.site.pages)
        unique = sum(1 for unit in self.site.units.values() if unit.kind != 'string')
        self.assertLess(unique, total / 4)
        notice = [unit for unit in self.site.units.values() if unit.source.startswith('<b>Please note')]
        self.assertEqual(len(notice), 1)

    def test_protected_text_is_not_a_unit(self):
        sources = [unit.source for unit in self.site.units.values()]
        for protected in ('INFO@STRONGAYA.EU', '+31 020 512 9111', 'Plesmanlaan', 'STRONG-AYA" translate'):
            self.assertFalse(any(protected in source for source in sources), protected)
        self.assertNotIn('STRONG-AYA', [unit.source for unit in self.site.units.values() if unit.kind == 'attr'])
        self.assertNotIn('LinkedIn', sources)

    def test_statement_unit_keeps_count_span(self):
        page = self.page('module_a/chemotherapy.html')
        statement = [unit for unit in page.units if unit.node.classes() == ['vis-statement']]
        self.assertEqual(len(statement), 1)
        self.assertIn('<span class="vis-count">56</span> out of 100 people', statement[0].source)
        self.assertIn('<br/> receive <b>chemotherapy</b>', statement[0].source)

    def test_inline_rules(self):
        modules = self.page('modules.html')
        sources = [unit.source for unit in modules.units]
        # the subject card link is not a unit (no direct text): its label span is, its image alt is an attribute
        self.assertIn('Treatment information', sources)
        self.assertFalse(any('subject-label' in source for source in sources))
        self.assertIn('A young man being treated by a doctor', [unit.source for unit in modules.attr_units])
        # a list item wrapping a link is the unit, link included
        self.assertIn('<a href="https://strongaya.eu/project/">Project</a>', sources)
        # a paragraph of spans is one unit
        topic = self.page('module_a/chemotherapy.html')
        self.assertIn('<span>If you need help,</span> <span>talk to a health professional such as your doctor or nurse.</span>',
                      [unit.source for unit in topic.units])

    def test_tooltip_attribute_unit(self):
        page = self.page('modules.html')
        tooltips = [unit for unit in page.attr_units if unit.attr == 'data-tooltip']
        self.assertTrue(tooltips)
        self.assertEqual({unit.source for unit in tooltips}, {'Coming soon'})
        self.assertEqual(len({unit.key for unit in tooltips}), 1)
        # the tooltip on the own-data card sits outside any unit; the one on the fertility span is on the unit itself
        self.assertTrue(all(unit.inside is None for unit in tooltips))

    def test_attribute_inside_unit_is_noted(self):
        source = '<!DOCTYPE html>\n<html lang="en-GB"><body><p>Look <img src="images/a.png" alt="A cat"/> here</p></body></html>'
        page = ts.Page('x.html', 'x.html', source=source)
        self.assertEqual(len(page.units), 1)
        self.assertEqual(len(page.attr_units), 1)
        self.assertIs(page.attr_units[0].inside, page.units[0].node)
        self.assertEqual(page.path_attrs[0].value, 'images/a.png')

    def test_links_and_paths(self):
        page = self.page('module_a/chemotherapy.html')
        self.assertEqual(page.links, {'../modules.html', 'chemotherapy.html', 'hormonetherapy.html', 'radiotherapy.html'})
        values = {attr.value for attr in page.path_attrs}
        self.assertIn('../css/portal.css', values)
        self.assertIn('../i18n/en.js', values)
        self.assertIn('../images/weblogo1@2x.png', values)
        self.assertNotIn('https://strongaya.eu/', values)

    def test_strings_file(self):
        # every string of the file is a unit: count them independently of the extractor
        def count(node):
            if isinstance(node, dict):
                return sum(count(value) for value in node.values())
            if isinstance(node, list):
                return sum(count(value) for value in node)
            return 1 if isinstance(node, str) else 0
        expected = count(load_strings(os.path.join(WEB, 'i18n', 'en.js')))
        self.assertGreater(expected, 300)
        self.assertEqual(len(self.site.strings.leaves), expected)
        paths = {unit.path for unit in self.site.strings.leaves}
        self.assertIn('language.noticeMachine', paths)
        self.assertIn('glossary.common.0.term', paths)
        self.assertIn('beatcancer.articleCount.one', paths)

    def test_placeholders(self):
        text = 'In {country}, there is also {site}.'
        wrapped = ts.wrap_placeholders(text)
        self.assertEqual(wrapped, 'In <span translate="no">{country}</span>, there is also <span translate="no">{site}</span>.')
        self.assertEqual(ts.unwrap_placeholders(wrapped), text)
        self.assertEqual(ts.missing_placeholders(text, 'Nur {country}.'), ['site'])

    def test_normalise_and_key(self):
        self.assertEqual(ts.normalise('  a \n   b  '), 'a b')
        self.assertEqual(ts.sha256('a b'), ts.sha256(ts.normalise(' a\nb ')))

    def test_batches(self):
        units = [ts.Unit('string', 'x' * 30000) for _ in range(5)] + [ts.Unit('string', 'y') for _ in range(60)]
        sizes = [len(batch) for batch in ts.batches(units)]
        self.assertEqual(sum(sizes), 65)
        self.assertTrue(all(size <= ts.MAX_TEXTS_PER_REQUEST for size in sizes))
        self.assertEqual(sizes[0], 3)  # 3 x 30 KB fit in 100 KiB, the fourth does not


class GenerationTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.mkdtemp(prefix='translate_site_')
        self.web, self.translations = copy_site(self.temp)
        self.client = FakeClient()

    def tearDown(self):
        shutil.rmtree(self.temp)

    def run_script(self, *args, client=None, env_key=None):
        old = os.environ.get('DEEPL_AUTH_KEY')
        os.environ['DEEPL_AUTH_KEY'] = env_key or ''
        try:
            return quiet(ts.main, ['--web-dir', self.web, '--translations-dir', self.translations] + list(args),
                         client=client)
        finally:
            if old is None:
                os.environ.pop('DEEPL_AUTH_KEY', None)
            else:
                os.environ['DEEPL_AUTH_KEY'] = old

    def read(self, *parts):
        return ts.read_text(os.path.join(*parts))

    def test_dry_run_counts_and_writes_nothing(self):
        code, output = self.run_script('--languages', 'nl', '--dry-run')
        self.assertEqual(code, 0)
        self.assertRegex(output, r'nl: \d+ untranslated units, \d+ characters would be sent to DeepL')
        self.assertFalse(os.path.exists(os.path.join(self.translations, 'nl.json')))
        self.assertFalse(os.path.exists(os.path.join(self.web, 'nl')))

    def test_no_key_skips_language(self):
        code, output = self.run_script('--languages', 'nl')
        self.assertEqual(code, 0)
        self.assertIn('DEEPL_AUTH_KEY is not set: nl has', output)
        self.assertIn('Visitors can translate the English pages with their browser', output)
        self.assertFalse(os.path.exists(os.path.join(self.web, 'nl')))
        # the English pages and languages.js are untouched (English only)
        self.assertEqual(self.read(self.web, 'index.html'), self.read(WEB, 'index.html'))
        self.assertEqual(self.read(self.web, 'i18n', 'languages.js'), self.read(WEB, 'i18n', 'languages.js'))

    def test_generation(self):
        code, output = self.run_script('--languages', 'nl', client=self.client)
        self.assertEqual(code, 0, output)
        self.assertIn('nl: pages written', output)
        self.assertIn('available languages: en, nl', output)

        # the requests: html tag handling, the configured parameters, placeholders protected
        self.assertTrue(self.client.requests)
        texts, target, parameters = self.client.requests[0]
        self.assertEqual(target, 'NL')
        self.assertEqual(parameters['tag_handling'], 'html')
        self.assertEqual(parameters['model_type'], 'quality_optimized')
        self.assertEqual(parameters['formality'], 'prefer_less')
        self.assertIn('custom_instructions', parameters)
        self.assertNotIn('glossary_id', parameters)  # no glossary synced yet
        sent = [text for request in self.client.requests for text in request[0]]
        self.assertIn('In <span translate="no">{country}</span>, there is also <span translate="no">{site}</span>.', sent)

        # the cache
        cache = load_json(os.path.join(self.translations, 'nl.json'))
        entry = next(iter(cache.values()))
        self.assertEqual(set(entry), {'source', 'target', 'status', 'engine', 'glossary', 'billed', 'date', 'reviewer'})
        self.assertEqual(entry['status'], 'machine')
        self.assertEqual(entry['engine'], 'deepl/quality_optimized')
        self.assertEqual(entry['target'], '[nl] ' + entry['source'])
        self.assertEqual(cache[ts.sha256('Coming soon')]['target'], '[nl] Coming soon')
        placeholder_entry = cache[ts.sha256('In {country}, there is also {site}.')]
        self.assertEqual(placeholder_entry['target'], '[nl] In {country}, there is also {site}.')

        # the tree
        site = ts.Site(self.web, self.translations)
        for page in site.pages:
            self.assertTrue(os.path.exists(os.path.join(self.web, 'nl', page.rel)), page.rel)
        topic = self.read(self.web, 'nl', 'module_a', 'chemotherapy.html')
        self.assertTrue(topic.startswith('<!DOCTYPE html>\n<!-- Generated by scripts/translate_site.py from web/module_a/chemotherapy.html'))
        self.assertIn('<html lang="nl" data-site-root="../../" data-translation="machine">', topic)
        self.assertIn('<link rel="stylesheet" href="../../css/portal.css"/>', topic)
        self.assertIn('<script src="../../i18n/nl.js" defer></script>', topic)
        self.assertIn('<script src="../../js/i18n.js"></script>', topic)
        self.assertIn('<img src="../../images/weblogo1@2x.png" alt="STRONG-AYA" translate="no"/>', topic)
        self.assertIn('<a class="return-link" href="../modules.html">', topic)
        self.assertIn('<a href="chemotherapy.html" class="current">[nl] Chemotherapy</a>', topic)
        self.assertIn('<title>[nl] STRONG-AYA Info Portal — Chemotherapy</title>', topic)
        self.assertIn('<h1 class="card-title">[nl] Chemotherapy</h1>', topic)
        self.assertIn('data-tooltip="[nl] Coming soon"', topic)
        self.assertIn('<p class="vis-statement" aria-live="polite">[nl] <span class="vis-count">56</span> out of 100 people', topic)
        self.assertIn('<div translate="no">INFO@STRONGAYA.EU</div>', topic)
        self.assertIn('<div class="translation-notice" role="note"><span>[nl] This page was translated automatically with DeepL',
                      topic)
        self.assertIn('<a href="../../module_a/chemotherapy.html">[nl] English version</a></div>', topic)
        self.assertIn('hreflang="x-default" href="https://strongaya.github.io/strong-aya-info-portal/module_a/chemotherapy.html"', topic)
        self.assertIn('    <link rel="alternate" hreflang="nl" href="https://strongaya.github.io/strong-aya-info-portal/nl/module_a/chemotherapy.html"/>\n    <!-- hreflang:end -->', topic)
        self.assertNotIn('data-site-root="../"', topic)
        root_page = self.read(self.web, 'nl', 'index.html')
        self.assertIn('<html lang="nl" data-site-root="../" data-translation="machine">', root_page)
        self.assertIn('<script src="../i18n/nl.js" defer></script>', root_page)
        self.assertIn('<a class="outline-btn" href="modules.html?profile=before">[nl] Explore</a>', root_page)
        self.assertIn('<a href="../index.html">[nl] English version</a>', root_page)
        modules = self.read(self.web, 'nl', 'modules.html')
        self.assertIn('alt="[nl] A young man being treated by a doctor"', modules)
        self.assertIn('<a class="subject-card" href="module_a/chemotherapy.html" data-subject="treatment">', modules)

        # the strings file
        strings = self.read(self.web, 'i18n', 'nl.js')
        self.assertTrue(strings.startswith('// Generated by scripts/translate_site.py from web/i18n/en.js (DeepL); do not edit: edit translations/nl.json\nwindow.AYA_STRINGS = {'))
        data = json.loads(strings[strings.index('= ') + 2:].strip().rstrip(';'))
        self.assertEqual(data['ui']['close'], '[nl] Close')
        self.assertEqual(data['beatcancer']['articleCount']['one'], '[nl] {count} article')
        self.assertEqual(data['glossary']['common'][0]['term'], '[nl] AYA')

        # languages.js and the English hreflang blocks
        languages = self.read(self.web, 'i18n', 'languages.js')
        self.assertTrue(languages.startswith(ts.LANGUAGES_HEADER))
        self.assertIn('window.AYA_LANGUAGES = [\n  {"code": "en", "name": "English", "status": "source"},\n'
                      '  {"code": "nl", "name": "Nederlands", "status": "machine"}\n];\n', languages)
        english = self.read(self.web, 'module_a', 'chemotherapy.html')
        self.assertIn('    <link rel="alternate" hreflang="en" href="https://strongaya.github.io/strong-aya-info-portal/module_a/chemotherapy.html"/>\n'
                      '    <link rel="alternate" hreflang="nl" href="https://strongaya.github.io/strong-aya-info-portal/nl/module_a/chemotherapy.html"/>\n'
                      '    <!-- hreflang:end -->', english)
        self.assertIn('<html lang="en-GB" data-site-root="../">', english)

        # generated pages extract the same units as the English ones
        generated = ts.Page(os.path.join(self.web, 'nl', 'module_a', 'chemotherapy.html'), 'module_a/chemotherapy.html')
        original = next(page for page in site.pages if page.rel == 'module_a/chemotherapy.html')
        self.assertEqual(len(generated.units), len(original.units))
        self.assertEqual(len(generated.attr_units), len(original.attr_units))
        self.assertEqual(generated.links, original.links)

        # a second run has nothing to translate, changes nothing and --check passes
        requests_before = len(self.client.requests)
        code, output = self.run_script(client=self.client)
        self.assertEqual(code, 0)
        self.assertEqual(len(self.client.requests), requests_before)
        code, output = self.run_script('--check')
        self.assertEqual(code, 0, output)
        self.assertIn('OK', output)

    def test_check_detects_hand_edits_and_staleness(self):
        self.run_script('--languages', 'nl', client=self.client)
        path = os.path.join(self.web, 'nl', 'modules.html')
        ts.write_text(path, self.read(path).replace('[nl] Mental health', 'Geestelijke gezondheid'))
        code, output = self.run_script('--check')
        self.assertEqual(code, 1)
        self.assertIn('nl/modules.html: hand-edited or stale generated file', output.replace(self.web + '/', ''))
        # a reviewer's change in the cache makes the generated page stale in the same way
        self.run_script('--languages', 'nl', client=self.client)  # regenerate
        self.assertEqual(self.run_script('--check')[0], 0)
        cache_path = os.path.join(self.translations, 'nl.json')
        cache = load_json(cache_path)
        cache[ts.sha256('Mental health')]['target'] = 'Geestelijke gezondheid'
        dump_json(cache_path, cache)
        code, output = self.run_script('--check')
        self.assertEqual(code, 1)
        # a changed English text is reported as stale but does not fail the check
        self.run_script('--languages', 'nl', client=self.client)
        index = os.path.join(self.web, 'index.html')
        ts.write_text(index, self.read(index).replace('What suits you best?', 'What suits you?'))
        code, output = self.run_script('--check')
        self.assertEqual(code, 0, output)
        self.assertIn('stale: nl/index.html has 1 untranslated units', output)
        # a missing generated file fails
        os.remove(os.path.join(self.web, 'nl', 'login.html'))
        code, output = self.run_script('--check')
        self.assertEqual(code, 1)
        self.assertIn('missing generated file', output)
        # a language whose cache exists but whose tree was never written: hreflang/languages.js are consistent
        # (the language is not listed) but its pages are missing
        shutil.rmtree(os.path.join(self.web, 'nl'))
        code, output = self.run_script('--check')
        self.assertEqual(code, 1)

    def test_reviewed_entries_are_kept(self):
        self.run_script('--languages', 'nl', client=self.client)
        cache_path = os.path.join(self.translations, 'nl.json')
        cache = load_json(cache_path)
        key = ts.sha256('Mental health')
        cache[key].update({'target': 'Geestelijke gezondheid', 'status': 'reviewed', 'reviewer': 'A reviewer'})
        dump_json(cache_path, cache)
        # a glossary change re-sends machine entries but never the reviewed one
        site = ts.Site(self.web, self.translations)
        site.glossary_info = {'id': 'g1', 'version': 'abc'}
        cache_object = site.cache('nl')
        self.assertFalse(cache_object.set_machine(key, 'Mental health', '[nl] Mental health', 13, None, 'x'))
        self.assertEqual(cache_object.target(key), 'Geestelijke gezondheid')
        misses = site.misses('nl', retranslate_glossary=True)
        self.assertNotIn(key, [unit.key for unit in misses])
        self.assertTrue(misses)
        # regenerated pages carry the reviewed text; the page stays "machine" while other units are not reviewed
        self.run_script(client=self.client)
        modules = self.read(self.web, 'nl', 'modules.html')
        self.assertIn('>Geestelijke gezondheid</a>', modules)
        self.assertIn('data-translation="machine"', modules)

    def test_reviewed_page_and_language(self):
        self.run_script('--languages', 'nl', client=self.client)
        cache_path = os.path.join(self.translations, 'nl.json')
        cache = load_json(cache_path)
        for entry in cache.values():
            entry['status'] = 'reviewed'
            entry['reviewer'] = 'Reviewer'
        dump_json(cache_path, cache)
        config_path = os.path.join(self.translations, 'config.json')
        config = load_json(config_path)
        config['languages'] = {'nl': {'reviewer': 'the NKI team', 'reviewed': '2026-11'}}
        dump_json(config_path, config)
        code, output = self.run_script(client=self.client)
        self.assertEqual(code, 0, output)
        page = self.read(self.web, 'nl', 'index.html')
        self.assertIn('data-translation="reviewed"', page)
        self.assertIn('checked by the NKI team in 2026-11', page)
        self.assertIn('{"code": "nl", "name": "Nederlands", "status": "reviewed"}', self.read(self.web, 'i18n', 'languages.js'))
        self.assertEqual(self.run_script('--check')[0], 0)

    def test_review_round_trip(self):
        self.run_script('--languages', 'nl', client=self.client)
        code, output = self.run_script('--export-review', 'nl')
        self.assertEqual(code, 0)
        path = os.path.join(self.translations, 'review', 'nl.csv')
        self.assertTrue(os.path.exists(path))
        text = self.read(path)
        self.assertTrue(text.startswith('key,status,source,target,reviewer\r\n'))
        key = ts.sha256('Mental health')
        rows = text.split('\r\n')
        row = next(row for row in rows if row.startswith(key))
        self.assertIn(',machine,Mental health,[nl] Mental health,', row)
        text = text.replace(row, '%s,reviewed,Mental health,Geestelijke gezondheid,Someone' % key)
        ts.write_text(path, text)
        code, output = self.run_script('--import-review', 'nl', client=self.client)
        self.assertEqual(code, 0, output)
        self.assertIn('1 entries updated', output)
        cache = load_json(os.path.join(self.translations, 'nl.json'))
        self.assertEqual(cache[key]['status'], 'reviewed')
        self.assertEqual(cache[key]['target'], 'Geestelijke gezondheid')
        self.assertEqual(cache[key]['reviewer'], 'Someone')
        self.assertIn('>Geestelijke gezondheid</a>', self.read(self.web, 'nl', 'modules.html'))
        self.assertEqual(self.run_script('--check')[0], 0)

    def test_prune(self):
        self.run_script('--languages', 'nl', client=self.client)
        cache_path = os.path.join(self.translations, 'nl.json')
        cache = load_json(cache_path)
        cache['0' * 64] = {'source': 'Old text', 'target': 'Oude tekst', 'status': 'machine', 'engine': 'x',
                           'glossary': None, 'billed': 8, 'date': '2026-01-01', 'reviewer': ''}
        dump_json(cache_path, cache)
        code, output = self.run_script('--prune')
        self.assertEqual(code, 0)
        self.assertIn('nl: 1 orphaned entries removed', output)
        self.assertNotIn('0' * 64, load_json(cache_path))

    def test_glossary(self):
        header, rows = ts.load_glossary(os.path.join(self.translations, 'glossary.tsv'))
        self.assertEqual(header[:2], ['en', '*'])
        self.assertIn('nl', header)
        pairs = dict(ts.glossary_entries(header, rows, 'nl'))
        self.assertEqual(pairs['STRONG-AYA'], 'STRONG-AYA')
        self.assertNotIn('chemotherapy', pairs)  # empty nl cell: for the reviewer to fill
        self.assertEqual(ts.glossary_entries(header, rows, 'fr'), [])  # no column
        code, output = self.run_script('--sync-glossary', '--languages', 'nl', client=self.client)
        self.assertEqual(code, 0, output)
        info = load_json(os.path.join(self.translations, 'glossary.json'))
        self.assertEqual(info['id'], 'g1')
        self.assertEqual(len(info['version']), 12)
        self.assertEqual(info['languages'], ['nl'])
        self.assertEqual(self.client.glossaries['g1'][1][0]['target_lang'], 'nl')
        self.assertIn('STRONG-AYA\tSTRONG-AYA', self.client.glossaries['g1'][1][0]['entries'])
        # the translation requests then carry the glossary and the cache entries its version
        parameters = self.client.requests[0][2]
        self.assertEqual(parameters['glossary_id'], 'g1')
        cache = load_json(os.path.join(self.translations, 'nl.json'))
        self.assertEqual(next(iter(cache.values()))['glossary'], info['version'])

    def test_national_descriptions(self):
        """The descriptions of the national websites are translated into national.descriptions of the strings
        file, keyed by country code and position, as portal.js looks them up."""
        code, output = self.run_script('--languages', 'nl', client=self.client)
        self.assertEqual(code, 0, output)
        strings = self.read(self.web, 'i18n', 'nl.js')
        data = json.loads(strings[strings.index('window.AYA_STRINGS = ') + len('window.AYA_STRINGS = '):].strip().rstrip(';'))
        national = load_json(os.path.join(self.web, 'data', 'national_resources.json'))['countries']
        descriptions = data['national']['descriptions']
        self.assertIn('NL/0', descriptions)
        self.assertEqual(descriptions['NL/0'], '[nl] ' + national['NL']['resources'][0]['description'])
        self.assertEqual(len(descriptions), sum(len(c['resources']) for c in national.values()))
        # the English strings file has none: portal.js then shows the description from the data file
        self.assertNotIn('descriptions', load_strings(os.path.join(self.web, 'i18n', 'en.js'))['national'])

    def test_identity_round_trip(self):
        """With a translation equal to the source, a generated page differs from the English one only in
        the generated parts: comment, html tag, asset paths, hreflang and notice."""
        code, output = self.run_script('--languages', 'nl', client=FakeClient(marker=''))
        self.assertEqual(code, 0, output)
        english = self.read(self.web, 'module_a', 'chemotherapy.html')
        generated = self.read(self.web, 'nl', 'module_a', 'chemotherapy.html')
        generated = generated.replace('<!-- Generated by scripts/translate_site.py from web/module_a/chemotherapy.html (DeepL); '
                                      'do not edit: edit the English page or translations/nl.json -->\n', '')
        generated = generated.replace('<html lang="nl" data-site-root="../../" data-translation="machine">',
                                      '<html lang="en-GB" data-site-root="../">')
        generated = generated.replace('"../../', '"../').replace('i18n/nl.js', 'i18n/en.js')
        generated = re.sub(r'<div class="translation-notice" role="note">.*?</div>', ts.NOTICE_PLACEHOLDER, generated)
        generated = generated.replace('    <link rel="alternate" hreflang="nl" href="https://strongaya.github.io/strong-aya-info-portal/nl/module_a/chemotherapy.html"/>\n', '')
        english = english.replace('    <link rel="alternate" hreflang="nl" href="https://strongaya.github.io/strong-aya-info-portal/nl/module_a/chemotherapy.html"/>\n', '')
        # the units themselves are written with normalised whitespace, so compare without any whitespace
        self.assertEqual(re.sub(r'\s+', '', generated), re.sub(r'\s+', '', english))

    def test_generated_page_is_validated(self):
        class BrokenClient(FakeClient):
            def translate(self, texts, target_lang, parameters):
                # a "translation" that adds a link to another page, which the validation must catch
                return [(text.replace('Chemotherapy', '<a href="extra.html">Chemotherapy</a>'), len(text)) for text in texts]

        with self.assertRaises(ValueError):
            quiet(ts.main, ['--web-dir', self.web, '--translations-dir', self.translations, '--languages', 'nl'],
                  client=BrokenClient())

    def test_apply_edits(self):
        self.assertEqual(ts.apply_edits('abcdef', [(1, 2, 'X'), (4, 5, 'YY')]), 'aXcdYYf')
        with self.assertRaises(ValueError):
            ts.apply_edits('abcdef', [(1, 3, 'X'), (2, 5, 'Y')])

    def test_languages_argument(self):
        with self.assertRaises(SystemExit):
            ts.parse_languages('en')
        with self.assertRaises(SystemExit):
            ts.parse_languages('dutch')
        self.assertEqual(ts.parse_languages(' nl, FR '), ['nl', 'fr'])


if __name__ == '__main__':
    unittest.main()
