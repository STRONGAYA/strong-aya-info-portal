/**
 * STRONG-AYA Info Portal — shared page behaviour
 * - Subject carousel: horizontal scrolling via prev/next buttons
 * - "Explore all topics" dropdown on module pages
 * - Disabled header/footer links to strongaya.eu (with an explanation)
 * - Accessibility modes (contrast / dark) and the text size, persisted in localStorage
 * - Page-specific Glossary and Help modals
 * - Articles from beatcancer.eu about the topic of a module page
 * - A national website for young people with cancer, for the visitor's country
 * - The Language dialog: the languages the portal is published in, and
 *   translation by the browser for the others
 * The text this script generates comes from web/i18n/<lang>.js through
 * t() (js/i18n.js), so the generated pages in other languages show it
 * in their own language.
 */

// ------------------------------------------------------------------
// The Glossary and Help texts live in web/i18n/<lang>.js (groups
// "glossary" and "help"). The page id is derived from the file name
// (e.g. chemotherapy.html -> "chemotherapy"); glossary entries marked
// "common" are shown on every module content page in addition to the
// page-specific terms.
// ------------------------------------------------------------------
function strings(group) {
    return (window.AYA_STRINGS && window.AYA_STRINGS[group]) || {};
}

// The language of the page ("nl" on the Dutch pages): names, dates
// and sorting follow it
function pageLanguage() {
    return document.documentElement.lang || 'en';
}

function isEnglishPage() {
    return pageLanguage().split('-')[0].toLowerCase() === 'en';
}

// ------------------------------------------------------------------
// Order of the subjects on the subjects page for each profile of the
// start page (modules.html?profile=...), the most relevant first. The
// ids are the data-subject attributes of the subject cards.
// ------------------------------------------------------------------
const SUBJECT_ORDER = {
    before: ['treatment', 'fertility', 'mental-health', 'relationships', 'functioning', 'survival'],
    beyond: ['functioning', 'mental-health', 'relationships', 'fertility', 'survival', 'treatment']
};

// ------------------------------------------------------------------
// Articles from beatcancer.eu, the website of the European Youth Cancer
// Network (YARN), at the bottom of the module pages. The site
// cannot be embedded, so web/data/beatcancer_resources.json (made by
// scripts/fetch_beatcancer_resources.py) lists a few of its articles
// per page. The text comes from another website: it is escaped, and
// only beatcancer.eu addresses are used for links and images.
// ------------------------------------------------------------------
const BEATCANCER_URL = 'https://beatcancer.eu/';
const EXTERNAL_ICON = '<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

function isBeatcancerUrl(url) {
    return typeof url === 'string' && url.indexOf(BEATCANCER_URL) === 0;
}

// A link that opens another website in a new tab, with a note for
// screen readers; content is HTML that has been escaped already
function externalLink(url, content, site, className) {
    return '<a' + (className ? ' class="' + className + '"' : '') + ' href="' + escapeHtml(url) +
        '" target="_blank" rel="noopener">' + content +
        '<span class="visually-hidden"> ' + escapeHtml(t('ui.opensInNewTabFrom', { site: site })) + '</span></a>';
}

function beatcancerLink(url, content, className) {
    return externalLink(url, content, 'beatcancer.eu', className);
}

function hostOf(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
        return url;
    }
}

// "2025-02-12" -> "February 2025" (in the language of the page)
function formatMonth(date) {
    const d = new Date(date + 'T00:00:00Z');
    try {
        return isNaN(d) ? '' : d.toLocaleDateString(pageLanguage(), { month: 'long', year: 'numeric', timeZone: 'UTC' });
    } catch (e) {
        return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    }
}

// Text from beatcancer.eu stays English on the pages in other
// languages: marked, so screen readers switch voice
function englishText(html) {
    return isEnglishPage() ? html : '<span lang="en">' + html + '</span>';
}

// The framed block with articles from beatcancer.eu: article cards (each
// opening the article in a new tab) and links to the matching topics on
// the site; '' when there is nothing to show. national is the national
// website for the visitor's country (see below): its card, with a short
// heading of its own, takes the place of the last article, on the
// right; the beatcancer.eu heading stays above the other two. country is the
// visitor's country ({ code, source }, see currentCountry), or null when
// the national websites could not be loaded. On the pages in other
// languages the (English) titles and summaries are marked as English
// and a note says so.
function beatcancerInsertHtml(page, national, country) {
    const articles = (page.resources || []).filter(function (r) {
        return isBeatcancerUrl(r.url);
    }).map(function (r) {
        // the smaller version of the image, used only when this one fails (see watchArticleImages)
        const fallback = isBeatcancerUrl(r.image_fallback) && r.image_fallback !== r.image
            ? ' data-fallback="' + escapeHtml(r.image_fallback) + '"' : '';
        const image = isBeatcancerUrl(r.image)
            ? '<img src="' + escapeHtml(r.image) + '" alt="" loading="lazy" referrerpolicy="no-referrer" data-article-image' +
                fallback + '/>'
            : '';
        const meta = [r.topic, formatMonth(r.date)].filter(Boolean).map(escapeHtml).join(' · ');
        return '<li class="bc-card">' +
            '<div class="bc-card-media">' + image + '</div>' +
            '<div class="bc-card-body">' +
            (r.type ? '<span class="bc-card-type">' + escapeHtml(r.type) + '</span>' : '') +
            '<h4 class="bc-card-title">' + beatcancerLink(r.url, englishText(escapeHtml(r.title))) + '</h4>' +
            (r.excerpt ? '<p class="bc-card-excerpt">' + englishText(escapeHtml(r.excerpt)) + '</p>' : '') +
            '<p class="bc-card-meta"><span>' + meta + '</span>' + EXTERNAL_ICON + '</p>' +
            '</div></li>';
    });
    if (!articles.length) return '';
    if (national && articles.length > 1) articles.pop();
    else national = null;

    const topics = (page.topics || []).filter(function (topic) {
        return isBeatcancerUrl(topic.url);
    }).map(function (topic) {
        // the count is read out with its noun
        return beatcancerLink(topic.url, englishText(escapeHtml(topic.label)) + ' <span class="bc-topic-count">' +
            '<span aria-hidden="true">' + escapeHtml(topic.count) + '</span>' +
            '<span class="visually-hidden">' + escapeHtml(t('beatcancer.articleCount', { count: topic.count })) +
            '</span></span>' + EXTERNAL_ICON, 'bc-topic-link');
    });

    const hint = !national && country && !country.code
        ? ' <span>' + escapeHtml(t('national.askCountry')) + '</span> ' +
            countryChangeButton(t('national.chooseCountry'))
        : '';
    const inEnglish = isEnglishPage() ? '' : ' <span>' + escapeHtml(t('beatcancer.inEnglish')) + '</span>';
    const yarnGroup = '<div class="bc-group bc-group-yarn">' +
        '<div class="bc-insert-head">' +
        '<img class="bc-insert-logo" src="' + SITE_ROOT + 'images/yarn-logo.png" alt="' +
        escapeHtml(t('beatcancer.yarnLogoAlt')) + '" width="119" height="40"/>' +
        '<div>' +
        '<h3 class="bc-insert-source">' + t('beatcancer.from', {
            site: '<a href="' + BEATCANCER_URL + '" target="_blank" rel="noopener"><span translate="no">beatcancer.eu</span>' +
                EXTERNAL_ICON + '<span class="visually-hidden"> ' + escapeHtml(t('ui.opensInNewTab')) + '</span></a>'
        }) + '</h3>' +
        '<p class="bc-insert-note"><span>' + t('beatcancer.intro') + '</span>' + inEnglish + hint + '</p>' +
        '<p class="bc-insert-note" data-read="skip"><span>' + t('beatcancer.credit') + '</span> ' +
        '<span>' + t('beatcancer.rights') + '</span></p>' +
        '</div></div>' +
        '<ul class="bc-cards">' + articles.join('') + '</ul>' +
        (topics.length ? '<p class="bc-insert-more"><span>' + escapeHtml(t('beatcancer.more')) + '</span>' +
            topics.join('') + '</p>' : '') +
        '</div>';

    let nationalGroup = '';
    if (national) {
        const organisation = nativeText(national.organisation, national.lang);
        const credit = national.logo
            ? '<p class="bc-insert-note"><span>' + (national.name !== national.organisation
                ? t('national.logoCredit', { name: nativeText(national.name, national.lang), organisation: organisation })
                : t('national.logoCreditPlain', { organisation: organisation })) + '</span></p>'
            : '';
        nationalGroup = '<div class="bc-group bc-group-national">' +
            '<div class="bc-insert-head"><div>' +
            '<h3 class="bc-insert-source">' + t('beatcancer.from', {
                site: externalLink(national.url, organisation + EXTERNAL_ICON, hostOf(national.url))
            }) + '</h3>' +
            '<p class="bc-insert-note"><span>' + t(COUNTRY_SOURCE_NOTE[country.source] || COUNTRY_SOURCE_NOTE.chosen, {
                country: escapeHtml(national.countryInProse),
                change: countryChangeButton(t('national.changeCountry'))
            }) + '</span></p>' +
            credit +
            '</div></div>' +
            '<ul class="bc-cards">' + nationalCardHtml(national) + '</ul>' +
            '</div>';
    }

    return '<div class="bc-groups' + (national ? ' has-national' : '') + '">' + yarnGroup + nationalGroup + '</div>';
}

// The line after "You can also meet young people with the same
// experience at ... beatcancer.eu." about the national website
function supportNationalHtml(national) {
    const site = externalLink(national.url, nativeText(national.name, national.lang), hostOf(national.url)) +
        (national.organisation !== national.name ? ' (' + nativeText(national.organisation, national.lang) + ')' : '');
    return t('national.supportLine', { country: escapeHtml(national.countryInProse), site: site });
}

// Article images come from beatcancer.eu's image service, which sometimes
// fails to make the 640-pixel version of an image: it answers with an
// error, or not at all. The image is then loaded once more in the size
// beatcancer.eu's own cards use (data-fallback), and left out when that
// fails too, so the tile shows its plain background instead of a broken
// image. "Not at all" means: not loaded IMAGE_TIMEOUT_MS after the image
// came into view (the images load lazily, only near the screen).
const IMAGE_TIMEOUT_MS = 10000;

function watchArticleImages(root) {
    root.querySelectorAll('img[data-article-image]').forEach(function (img) {
        let timer = null;
        let inView = false;
        const wait = function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                if (img.isConnected && !(img.complete && img.naturalWidth)) giveUp();
            }, IMAGE_TIMEOUT_MS);
        };
        const giveUp = function () {
            clearTimeout(timer);
            if (!img.isConnected) return; // the block was drawn again meanwhile
            const fallback = img.getAttribute('data-fallback');
            if (fallback) {
                img.removeAttribute('data-fallback');
                img.src = fallback;
                if (inView) wait();
            } else {
                img.remove();
            }
        };
        img.addEventListener('error', giveUp);
        img.addEventListener('load', function () { clearTimeout(timer); });
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (entries) {
                if (!entries.some(function (e) { return e.isIntersecting; })) return;
                observer.disconnect();
                inView = true;
                if (!img.complete) wait();
            });
            observer.observe(img);
        }
    });
}

// A button in the beatcancer.eu block that opens the Country dialog
function countryChangeButton(text) {
    return '<button type="button" class="country-change" aria-haspopup="dialog">' + escapeHtml(text) + '</button>';
}

// ------------------------------------------------------------------
// National websites for young people with cancer (module pages).
// web/data/national_resources.json lists, per European country, a
// national website for young people with cancer. When the visitor's
// country has one, its card takes the place of the first beatcancer.eu
// article. The country is found in the browser, without asking
// anything: from the browser languages (a country in a language tag,
// e.g. nl-BE), then the time zone, then a language that belongs to one
// European country (e.g. pl). The Country button in the accessibility
// bar shows it on every page and lets the visitor choose another
// country, or find it with "Use my location": only then does the
// browser ask for the device position, and the coordinates are matched
// against the country outlines in web/data/europe_countries.json on the
// device itself. A choice is kept for this visit only (sessionStorage):
// the country code and how it was found, never the position.
// ------------------------------------------------------------------

// The site root (web/), from data-site-root on <html> (set per page:
// the generated pages in other languages are one level deeper), else
// from the address of this script (web/js/portal.js), so that every
// page finds the data files
const SITE_ROOT = (function () {
    if (window.AYA_I18N && window.AYA_I18N.siteRoot) return window.AYA_I18N.siteRoot;
    const declared = document.documentElement.getAttribute('data-site-root');
    try {
        if (declared) return new URL(declared, window.location.href).href;
        const script = document.currentScript || document.querySelector('script[src*="js/portal.js"]');
        return new URL('../', script.src).href;
    } catch (e) {
        return /\/module_[a-d]\//.test(window.location.pathname) ? '../' : '';
    }
})();
const NATIONAL_RESOURCES_URL = SITE_ROOT + 'data/national_resources.json';
const EUROPE_OUTLINES_URL = SITE_ROOT + 'data/europe_countries.json';
const NATIONAL_LOGO_DIR = SITE_ROOT + 'images/national/';
const NATIONAL_FALLBACK_IMAGE = SITE_ROOT + 'images/group.png';
const COUNTRY_STORAGE_KEY = 'aya-country-choice';
const OUTSIDE_EUROPE = 'outside';
const POSITION_TIMEOUT_MS = 15000;

// The countries the visitor can choose, with their English names
const EUROPE_COUNTRIES = {
    AL: 'Albania', AD: 'Andorra', AM: 'Armenia', AT: 'Austria', AZ: 'Azerbaijan', BY: 'Belarus',
    BE: 'Belgium', BA: 'Bosnia and Herzegovina', BG: 'Bulgaria', HR: 'Croatia', CY: 'Cyprus', CZ: 'Czechia',
    DK: 'Denmark', EE: 'Estonia', FI: 'Finland', FR: 'France', GE: 'Georgia', DE: 'Germany', GR: 'Greece',
    HU: 'Hungary', IS: 'Iceland', IE: 'Ireland', IT: 'Italy', XK: 'Kosovo', LV: 'Latvia', LI: 'Liechtenstein',
    LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', MD: 'Moldova', MC: 'Monaco', ME: 'Montenegro',
    NL: 'Netherlands', MK: 'North Macedonia', NO: 'Norway', PL: 'Poland', PT: 'Portugal', RO: 'Romania',
    RU: 'Russia', SM: 'San Marino', RS: 'Serbia', SK: 'Slovakia', SI: 'Slovenia', ES: 'Spain', SE: 'Sweden',
    CH: 'Switzerland', TR: 'Türkiye', UA: 'Ukraine', GB: 'United Kingdom', VA: 'Vatican City'
};

// Territories that count as the country they belong to
const TERRITORY_OF = { AX: 'FI', FO: 'DK', GG: 'GB', GI: 'GB', IM: 'GB', JE: 'GB' };

// IANA time zone -> country (Europe and the Council of Europe members
// in Asia), including old zone names that browsers may still report
const EUROPE_TIME_ZONES = {
    'Europe/Amsterdam': 'NL', 'Europe/Andorra': 'AD', 'Europe/Astrakhan': 'RU', 'Europe/Athens': 'GR',
    'Europe/Belfast': 'GB', 'Europe/Belgrade': 'RS', 'Europe/Berlin': 'DE', 'Europe/Bratislava': 'SK',
    'Europe/Brussels': 'BE', 'Europe/Bucharest': 'RO', 'Europe/Budapest': 'HU', 'Europe/Busingen': 'DE',
    'Europe/Chisinau': 'MD', 'Europe/Copenhagen': 'DK', 'Europe/Dublin': 'IE', 'Europe/Gibraltar': 'GI',
    'Europe/Guernsey': 'GG', 'Europe/Helsinki': 'FI', 'Europe/Isle_of_Man': 'IM', 'Europe/Istanbul': 'TR',
    'Europe/Jersey': 'JE', 'Europe/Kaliningrad': 'RU', 'Europe/Kiev': 'UA', 'Europe/Kirov': 'RU',
    'Europe/Kyiv': 'UA', 'Europe/Lisbon': 'PT', 'Europe/Ljubljana': 'SI', 'Europe/London': 'GB',
    'Europe/Luxembourg': 'LU', 'Europe/Madrid': 'ES', 'Europe/Malta': 'MT', 'Europe/Mariehamn': 'FI',
    'Europe/Minsk': 'BY', 'Europe/Monaco': 'MC', 'Europe/Moscow': 'RU', 'Europe/Nicosia': 'CY',
    'Europe/Oslo': 'NO', 'Europe/Paris': 'FR', 'Europe/Podgorica': 'ME', 'Europe/Prague': 'CZ',
    'Europe/Riga': 'LV', 'Europe/Rome': 'IT', 'Europe/Samara': 'RU', 'Europe/San_Marino': 'SM',
    'Europe/Sarajevo': 'BA', 'Europe/Saratov': 'RU', 'Europe/Simferopol': 'UA', 'Europe/Skopje': 'MK',
    'Europe/Sofia': 'BG', 'Europe/Stockholm': 'SE', 'Europe/Tallinn': 'EE', 'Europe/Tirane': 'AL',
    'Europe/Tiraspol': 'MD', 'Europe/Ulyanovsk': 'RU', 'Europe/Uzhgorod': 'UA', 'Europe/Vaduz': 'LI',
    'Europe/Vatican': 'VA', 'Europe/Vienna': 'AT', 'Europe/Vilnius': 'LT', 'Europe/Volgograd': 'RU',
    'Europe/Warsaw': 'PL', 'Europe/Zagreb': 'HR', 'Europe/Zaporozhye': 'UA', 'Europe/Zurich': 'CH',
    'Atlantic/Reykjavik': 'IS', 'Atlantic/Faroe': 'FO', 'Atlantic/Faeroe': 'FO', 'Atlantic/Canary': 'ES',
    'Atlantic/Madeira': 'PT', 'Atlantic/Azores': 'PT', 'Atlantic/Jan_Mayen': 'NO', 'Arctic/Longyearbyen': 'NO',
    'Africa/Ceuta': 'ES', 'Asia/Nicosia': 'CY', 'Asia/Famagusta': 'CY', 'Asia/Istanbul': 'TR',
    'Asia/Tbilisi': 'GE', 'Asia/Yerevan': 'AM', 'Asia/Baku': 'AZ',
    'Eire': 'IE', 'GB': 'GB', 'GB-Eire': 'GB', 'Iceland': 'IS', 'Poland': 'PL', 'Portugal': 'PT',
    'Turkey': 'TR', 'W-SU': 'RU'
};

// Languages that are spoken mainly in one European country (world
// languages such as English, French or Spanish say too little)
const SINGLE_COUNTRY_LANGUAGES = {
    nl: 'NL', de: 'DE', it: 'IT', pl: 'PL', ro: 'RO', hu: 'HU', cs: 'CZ', sk: 'SK', da: 'DK', sv: 'SE',
    nb: 'NO', nn: 'NO', no: 'NO', fi: 'FI', is: 'IS', et: 'EE', lv: 'LV', lt: 'LT', sl: 'SI', hr: 'HR',
    bs: 'BA', sr: 'RS', mk: 'MK', sq: 'AL', bg: 'BG', el: 'GR', tr: 'TR', uk: 'UA', be: 'BY', ka: 'GE',
    hy: 'AM', az: 'AZ', mt: 'MT', ga: 'IE', lb: 'LU'
};

// The note on the national card: how the country was found
const COUNTRY_SOURCE_NOTE = {
    settings: 'national.cardNoteSettings',
    chosen: 'national.cardNoteChosen',
    position: 'national.cardNotePosition'
};

// "NL" -> "Netherlands", "nl" -> "Dutch": names from the browser in the
// language of the page (the English pages use the list above, so that
// the names stay as they are)
function displayName(type, code, fallback) {
    try {
        return new Intl.DisplayNames([pageLanguage(), 'en'], { type: type }).of(code) || fallback;
    } catch (e) {
        return fallback;
    }
}

function browserLanguages() {
    return (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''])
        .map(function (tag) { return String(tag); });
}

// The code if it is one of the countries above (a territory counts as
// its country), else null
function europeanCountry(code) {
    const upper = String(code || '').toUpperCase();
    const country = TERRITORY_OF[upper] || upper;
    return Object.prototype.hasOwnProperty.call(EUROPE_COUNTRIES, country) ? country : null;
}

function countryName(code) {
    if (code === OUTSIDE_EUROPE) return t('national.outsideEurope');
    const english = EUROPE_COUNTRIES[code] || String(code);
    return isEnglishPage() ? english : displayName('region', code, english);
}

// The country name as it reads in a sentence ("the Netherlands"): the
// strings file lists the exceptions per country and, under "*", the
// pattern for every other country ("{name}")
function countryInProse(code) {
    const prose = strings('national').countryInProse || {};
    if (code !== OUTSIDE_EUROPE && typeof prose[code] === 'string') return prose[code];
    return (typeof prose['*'] === 'string' ? prose['*'] : '{name}').replace('{name}', countryName(code));
}

// The visitor's country guessed from the browser settings, without
// asking anything (see the note above); null when nothing fits
function guessCountry() {
    const languages = browserLanguages();
    for (const tag of languages) {
        const match = /^[a-z]{2,3}(?:-[a-z]{4})?-([a-z]{2})(?:-|$)/i.exec(tag);
        const country = match && europeanCountry(match[1]);
        if (country) return country;
    }
    let zone = '';
    try {
        zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (e) { /* no time zone support */ }
    const fromZone = europeanCountry(EUROPE_TIME_ZONES[zone]);
    if (fromZone) return fromZone;
    for (const tag of languages) {
        const country = europeanCountry(SINGLE_COUNTRY_LANGUAGES[tag.split('-')[0].toLowerCase()]);
        if (country) return country;
    }
    return null;
}

// The visitor's country for the national website: the visitor's own
// choice during this visit, else the guess from the browser settings.
// Returns { code, source }: code is a country code, OUTSIDE_EUROPE or
// null (unknown); source is 'chosen', 'position' or 'settings'.
let countryChoiceThisPage = null; // when sessionStorage is unavailable
function currentCountry() {
    let stored = countryChoiceThisPage;
    try {
        stored = JSON.parse(sessionStorage.getItem(COUNTRY_STORAGE_KEY)) || stored;
    } catch (e) { /* storage unavailable or unreadable */ }
    if (stored && (stored.source === 'chosen' || stored.source === 'position')) {
        const code = stored.code === OUTSIDE_EUROPE ? OUTSIDE_EUROPE : europeanCountry(stored.code);
        if (code) return { code: code, source: stored.source };
    }
    return { code: guessCountry(), source: 'settings' };
}

function storeCountry(code, source) {
    countryChoiceThisPage = { code: code, source: source };
    try {
        sessionStorage.setItem(COUNTRY_STORAGE_KEY, JSON.stringify(countryChoiceThisPage));
    } catch (e) { /* storage unavailable: the choice holds on this page only */ }
}

// JSON from the site, fetched once per page
const jsonRequests = {};
function loadJson(url) {
    if (!jsonRequests[url]) {
        jsonRequests[url] = fetch(url).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        });
        jsonRequests[url].catch(function () { delete jsonRequests[url]; });
    }
    return jsonRequests[url];
}

// Ray casting: is the point inside the ring? A ring is a flat array
// [x0, y0, x1, y1, ...] of longitudes and latitudes, closed (last
// point = first point), as written by scripts/fetch_europe_countries.py
function ringContains(ring, x, y) {
    let inside = false;
    const count = ring.length / 2;
    for (let i = 0, j = count - 1; i < count; j = i++) {
        const xi = ring[2 * i], yi = ring[2 * i + 1];
        const xj = ring[2 * j], yj = ring[2 * j + 1];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

// Distance (in degrees of latitude) from the point to the ring's edge
function ringDistance(ring, x, y, cosLat) {
    let best = Infinity;
    for (let i = 0; i < ring.length - 2; i += 2) {
        const ax = (ring[i] - x) * cosLat, ay = ring[i + 1] - y;
        const bx = (ring[i + 2] - x) * cosLat, by = ring[i + 3] - y;
        const dx = bx - ax, dy = by - ay;
        const lengthSquared = dx * dx + dy * dy;
        const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
        const distanceSquared = (ax + t * dx) * (ax + t * dx) + (ay + t * dy) * (ay + t * dy);
        if (distanceSquared < best) best = distanceSquared;
    }
    return Math.sqrt(best);
}

// The country code of the country containing the point, else of the
// nearest country within outlines.near_degrees (the simplified
// coastlines leave coastal cities just offshore), else null. The same
// algorithm as country_at() in scripts/fetch_europe_countries.py.
function countryAtPoint(outlines, x, y) {
    const near = outlines.near_degrees || 0.1;
    const cosLat = Math.cos(y * Math.PI / 180);
    let nearest = null, nearestDistance = near;
    for (const country of outlines.countries) {
        const b = country.bbox;
        if (x < b[0] - near || x > b[2] + near || y < b[1] - near || y > b[3] + near) continue;
        for (const polygon of country.polygons) {
            if (ringContains(polygon[0], x, y)) {
                if (!polygon.slice(1).some(function (hole) { return ringContains(hole, x, y); })) return country.iso2;
                continue;
            }
            const distance = ringDistance(polygon[0], x, y, cosLat);
            if (distance < nearestDistance) {
                nearest = country.iso2;
                nearestDistance = distance;
            }
        }
    }
    return nearest;
}

// The country at the device position, for "Use my location": the
// browser asks the visitor's permission first. The coordinates are
// matched against the country outlines on this device and then
// forgotten. Resolves to a country code or OUTSIDE_EUROPE; rejects
// with 'denied' or 'unavailable'.
function locateCountry() {
    return new Promise(function (resolve, reject) {
        if (!navigator.geolocation) return reject('unavailable');
        navigator.geolocation.getCurrentPosition(
            function (position) { resolve(position.coords); },
            function (error) { reject(error && error.code === 1 ? 'denied' : 'unavailable'); },
            { timeout: POSITION_TIMEOUT_MS, maximumAge: 600000 }
        );
    }).then(function (coords) {
        return loadJson(EUROPE_OUTLINES_URL).then(function (outlines) {
            return europeanCountry(countryAtPoint(outlines, coords.longitude, coords.latitude)) || OUTSIDE_EUROPE;
        }, function () {
            throw 'unavailable';
        });
    });
}

// The national website for the country: the one in the visitor's
// browser language when the country lists several, else the first;
// null when the country has none
function pickNationalResource(data, country) {
    const entry = data && data.countries && Object.prototype.hasOwnProperty.call(data.countries, country)
        ? data.countries[country] : null;
    const resources = (entry && entry.resources || []).filter(function (r) {
        return /^https?:\/\//.test(r.url || '');
    });
    if (!resources.length) return null;
    let chosen = null;
    for (const tag of browserLanguages()) {
        const language = tag.split('-')[0].toLowerCase();
        chosen = resources.find(function (r) { return String(r.lang || '').toLowerCase() === language; });
        if (chosen) break;
    }
    const picked = chosen || resources[0];
    return Object.assign({
        iso2: country,
        country: countryName(country),
        countryInProse: countryInProse(country),
        index: entry.resources.indexOf(picked)
    }, picked);
}

// The one-sentence description of a national website, in the language
// of the page when scripts/translate_site.py translated it (strings
// group national.descriptions, keyed "<country>/<index>"), else as it
// is in web/data/national_resources.json (English)
function nationalDescription(n) {
    const translated = strings('national').descriptions || {};
    return translated[n.iso2 + '/' + n.index] || n.description || '';
}

// Text in the language of a national website (e.g. its name), marked
// so that screen readers pronounce it in that language
function nativeText(text, lang) {
    const safe = escapeHtml(text);
    return /^[a-z]{2,3}$/i.test(lang || '') ? '<span lang="' + lang.toLowerCase() + '">' + safe + '</span>' : safe;
}

function nationalCardHtml(n) {
    const image = '<img src="' + escapeHtml(n.logo ? NATIONAL_LOGO_DIR + n.logo : NATIONAL_FALLBACK_IMAGE) +
        '" alt="" loading="lazy"/>';
    // a logo drawn in white needs a dark plate (logo_background: a hex colour)
    const plate = n.logo && /^#[0-9a-f]{3,8}$/i.test(n.logo_background || '')
        ? ' style="background:' + n.logo_background + '"' : '';
    const language = n.lang ? displayName('language', n.lang, n.lang) : '';
    const meta = [n.organisation ? nativeText(n.organisation, n.lang) : '',
        language ? escapeHtml(t('national.inLanguage', { language: language })) : '']
        .filter(Boolean).join(' · ');
    return '<li class="bc-card bc-card-national">' +
        '<div class="bc-card-media bc-card-logo' + (n.logo ? '' : ' bc-card-illustration') + '"' + plate + '>' + image + '</div>' +
        '<div class="bc-card-body">' +
        '<span class="bc-card-type">' + escapeHtml(t('national.cardType', { country: n.country })) + '</span>' +
        '<h4 class="bc-card-title">' + externalLink(n.url, nativeText(n.name, n.lang), hostOf(n.url)) + '</h4>' +
        (nationalDescription(n) ? '<p class="bc-card-excerpt">' + escapeHtml(nationalDescription(n)) + '</p>' : '') +
        '<p class="bc-card-meta"><span>' + meta + '</span>' + EXTERNAL_ICON + '</p>' +
        '</div></li>';
}

document.addEventListener('DOMContentLoaded', function () {
    // --- Subject order for the chosen profile ---
    // The cards and the "Explore all subjects" list follow the profile's
    // order; subjects that are not available yet stay after the available
    // ones. The elements themselves are moved, so screen readers and the
    // keyboard follow the same order. The profile is remembered during
    // the visit, so "Return to subjects" on a topic page keeps the order.
    const profile = (function () {
        const fromUrl = new URLSearchParams(window.location.search).get('profile');
        try {
            if (SUBJECT_ORDER[fromUrl]) {
                sessionStorage.setItem('aya-profile', fromUrl);
                return fromUrl;
            }
            return sessionStorage.getItem('aya-profile');
        } catch (e) {
            return fromUrl; /* storage unavailable: only the link sets the order */
        }
    })();
    const subjectOrder = SUBJECT_ORDER[profile];
    if (subjectOrder) {
        const rank = function (el) {
            return (el.classList.contains('disabled') ? subjectOrder.length : 0) + subjectOrder.indexOf(el.dataset.subject);
        };
        document.querySelectorAll('.subject-grid, .subjects-card .topics-dropdown').forEach(function (list) {
            Array.from(list.children)
                .filter(function (el) { return el.dataset.subject; })
                .sort(function (a, b) { return rank(a) - rank(b); })
                .forEach(function (el) { list.appendChild(el); });
            // Start the carousel at its (new) first card: with scroll
            // snapping the browser would stay on the card it was showing
            if (list.classList.contains('subject-grid')) {
                list.style.scrollBehavior = 'auto';
                list.scrollLeft = 0;
                list.style.scrollBehavior = '';
            }
        });
    }

    // --- Subject carousel buttons ---
    document.querySelectorAll('.subject-carousel').forEach(function (carousel) {
        const track = carousel.querySelector('.subject-grid');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next');
        if (!track) return;

        const gap = function () {
            return parseFloat(getComputedStyle(track).gap) || 24;
        };

        const step = function () {
            const card = track.querySelector('.subject-card');
            return card ? card.offsetWidth + gap() : 320;
        };

        // Centre two full tiles in the scroll window: the side padding
        // is sized so that two tiles (plus their gap) sit neatly in the
        // middle and the next tile is just slightly visible at the edge,
        // flowing in under the fade. Recomputed on resize.
        const layoutTrack = function () {
            const card = track.querySelector('.subject-card');
            if (!card) return;
            const twoTiles = 2 * card.offsetWidth + gap();
            const pad = Math.max((track.clientWidth - twoTiles) / 2, gap());
            track.style.paddingLeft = pad + 'px';
            track.style.paddingRight = pad + 'px';
            track.style.scrollPaddingLeft = pad + 'px';
            track.style.scrollPaddingRight = pad + 'px';
        };
        layoutTrack();
        window.addEventListener('resize', layoutTrack);

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                track.scrollBy({ left: -step(), behavior: 'smooth' });
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                track.scrollBy({ left: step(), behavior: 'smooth' });
            });
        }
    });

    // --- "Explore all topics" dropdown ---
    document.querySelectorAll('.explore-topics-wrap').forEach(function (wrap) {
        const btn = wrap.querySelector('.explore-topics');
        const dropdown = wrap.querySelector('.topics-dropdown');
        if (!btn || !dropdown) return;

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const open = !dropdown.hidden;
            dropdown.hidden = open;
            btn.setAttribute('aria-expanded', String(!open));
        });

        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target) && !dropdown.hidden) {
                dropdown.hidden = true;
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // --- Disabled links to strongaya.eu ---
    // This test portal is not linked from strongaya.eu, so visitors who
    // follow a header/footer link there have no way back. Those links
    // are disabled and explain this in a tooltip instead; the original
    // address is kept in data-href.
    const OFFSITE_NOTE = t('ui.offsiteNote');
    const TIP_WIDTH = 260; // width of .offsite-link[data-tooltip]::after
    const TIP_MARGIN = 8;

    document.querySelectorAll('.site-header a[href], .site-footer a[href]').forEach(function (link) {
        if (!/(^|\.)strongaya\.eu$/.test(link.hostname)) return;
        link.dataset.href = link.getAttribute('href');
        link.removeAttribute('href');
        link.classList.add('offsite-link');
        link.setAttribute('role', 'link');
        link.setAttribute('aria-disabled', 'true');
        link.tabIndex = 0;
        link.dataset.tooltip = OFFSITE_NOTE;

        // Centre the tooltip on the link, but keep it inside the
        // viewport (links sit at the edges of the header and footer)
        const placeTooltip = function () {
            const rect = link.getBoundingClientRect();
            const maxLeft = document.documentElement.clientWidth - TIP_WIDTH - TIP_MARGIN;
            const left = Math.max(TIP_MARGIN, Math.min(rect.left + (rect.width - TIP_WIDTH) / 2, maxLeft));
            link.style.setProperty('--tip-left', (left - rect.left) + 'px');
        };
        link.addEventListener('mouseenter', placeTooltip);
        link.addEventListener('focus', placeTooltip);
    });

    // --- Tooltips for screen readers ---
    // A tooltip (data-tooltip) only shows on hover or keyboard focus, so
    // screen readers get its text too: as the description of a control
    // or link, or as hidden text in other elements. "Coming soon"
    // controls are marked as unavailable. The name stays the visible
    // text, so the tooltip is not read twice.
    const tooltipIds = {};
    document.querySelectorAll('[data-tooltip]').forEach(function (el) {
        const text = el.dataset.tooltip;
        if (!el.matches('a[href], button, [tabindex]')) {
            const hidden = document.createElement('span');
            hidden.className = 'visually-hidden';
            hidden.textContent = ' (' + text + ')';
            el.appendChild(hidden);
            return;
        }
        if (!tooltipIds[text]) {
            const note = document.createElement('span');
            note.id = 'tooltip-text-' + (Object.keys(tooltipIds).length + 1);
            note.hidden = true;
            note.textContent = text;
            document.body.appendChild(note);
            tooltipIds[text] = note.id;
        }
        el.setAttribute('aria-describedby', tooltipIds[text]);
        const image = el.querySelector('img[alt]');
        const name = el.textContent.trim() || (image ? image.alt : '');
        if (name && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', name);
        if (text === t('ui.comingSoon') || text === 'Coming soon') el.setAttribute('aria-disabled', 'true');
    });

    // Escape hides the tooltips (WCAG 1.4.13: dismissable without moving
    // the pointer or the focus); they come back on the next hover or focus
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') document.body.classList.add('tooltips-dismissed');
    });
    ['mouseover', 'focusin'].forEach(function (type) {
        document.addEventListener(type, function () {
            document.body.classList.remove('tooltips-dismissed');
        });
    });

    // --- Accessibility modes (contrast / dark) ---
    // The chosen modes are stored as classes on <html> and persisted
    // in localStorage; the other controls are not implemented yet
    // (they carry a "Coming soon" data-tooltip).
    const rootEl = document.documentElement;
    const MODES = ['contrast', 'dark'];

    function syncAccessButtons() {
        MODES.forEach(function (mode) {
            const active = rootEl.classList.contains('mode-' + mode);
            document.querySelectorAll('.access-btn[data-access="' + mode + '"]').forEach(function (btn) {
                btn.classList.toggle('active', active);
                btn.setAttribute('aria-pressed', String(active));
            });
        });
    }

    MODES.forEach(function (mode) {
        try {
            if (localStorage.getItem('aya-mode-' + mode) === '1') {
                rootEl.classList.add('mode-' + mode);
            }
        } catch (e) { /* storage unavailable: modes simply don't persist */ }
    });
    syncAccessButtons();

    document.querySelectorAll('.access-btn[data-access]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const mode = btn.dataset.access;
            const active = rootEl.classList.toggle('mode-' + mode);
            try {
                localStorage.setItem('aya-mode-' + mode, active ? '1' : '0');
            } catch (e) { /* storage unavailable: modes simply don't persist */ }
            syncAccessButtons();
        });
    });

    // --- Text size ---
    // The Size button opens a dialog with four sizes (one smaller than
    // normal, two larger); the choice is a
    // class on <html> (the stylesheet sizes text in rem) and is kept in
    // localStorage, where js/i18n.js reads it before the page is drawn.
    const SIZES = ['small', 'normal', 'large', 'larger'];
    const SIZE_PERCENT = { small: 85, normal: 100, large: 115, larger: 130 };
    const SIZE_KEY = 'aya-size';
    const sizeButtons = document.querySelectorAll('.size-btn');

    function currentSize() {
        return SIZES.find(function (size) { return size !== 'normal' && rootEl.classList.contains('size-' + size); }) || 'normal';
    }

    function applySize(size) {
        SIZES.forEach(function (s) { rootEl.classList.toggle('size-' + s, s === size && s !== 'normal'); });
        try {
            if (size === 'normal') localStorage.removeItem(SIZE_KEY);
            else localStorage.setItem(SIZE_KEY, size);
        } catch (e) { /* storage unavailable: the size holds on this page only */ }
        updateSizeButtons();
    }

    // The label stays "Size"; the current size is in the accessible
    // name and the tooltip (title)
    function updateSizeButtons() {
        const label = t('size.button', { size: t('size.' + currentSize()) });
        sizeButtons.forEach(function (btn) {
            btn.setAttribute('aria-label', label);
            btn.title = label;
        });
    }

    function openSizeDialog() {
        const items = SIZES.map(function (size) {
            return '<li><button type="button" class="size-option" data-size="' + size + '"' +
                (size === currentSize() ? ' aria-current="true"' : '') + '>' +
                '<span class="size-name">' + escapeHtml(t('size.' + size)) + '</span>' +
                '<span class="size-percent">' + escapeHtml(t('size.percent', { percent: SIZE_PERCENT[size] })) + '</span>' +
                '</button></li>';
        });
        openPortalModal(t('size.title'), t('size.intro'), '<ul class="size-list">' + items.join('') + '</ul>');
        const dialog = document.getElementById('portal-modal');
        // a size applies at once, so the reader sees the effect; Close keeps it
        dialog.querySelectorAll('.size-option').forEach(function (option) {
            option.addEventListener('click', function () {
                applySize(option.dataset.size);
                dialog.querySelectorAll('.size-option').forEach(function (o) {
                    if (o === option) o.setAttribute('aria-current', 'true');
                    else o.removeAttribute('aria-current');
                });
            });
        });
    }

    try {
        const stored = localStorage.getItem(SIZE_KEY);
        if (SIZES.indexOf(stored) >= 0 && stored !== 'normal') rootEl.classList.add('size-' + stored);
    } catch (e) { /* storage unavailable */ }
    sizeButtons.forEach(function (btn) {
        btn.addEventListener('click', openSizeDialog);
    });
    updateSizeButtons();

    // --- Glossary / Help modals ---
    // Content is page specific; the page id is the file name without
    // the extension (index.html and "/" fall back to "index").
    const pageId = (window.location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
    const isModulePage = /module_[a-d]/.test(window.location.pathname);

    // Native <dialog> + showModal(): the browser moves focus into the
    // dialog, keeps it there, closes on Escape and returns focus to the
    // button that opened it — no custom focus management needed.
    // action: optional { label, run } for a dialog that changes a
    // setting: its footer then has Cancel and an orange action button
    // (as in the View dialog) instead of Close
    function openPortalModal(title, intro, bodyHtml, action) {
        let dialog = document.getElementById('portal-modal');
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.id = 'portal-modal';
            dialog.className = 'portal-modal';
            dialog.setAttribute('aria-labelledby', 'portal-modal-title');
            dialog.innerHTML =
                '<h3 id="portal-modal-title"></h3><p class="modal-intro"></p>' +
                '<div class="modal-body"></div>' +
                '<div class="modal-footer"><button type="button" class="modal-close">' + escapeHtml(t('ui.close')) +
                '</button></div>';
            document.body.appendChild(dialog);

            // A click on the backdrop targets the dialog element itself;
            // the bounds check keeps clicks on the dialog's own padding
            // from closing it
            dialog.addEventListener('click', function (e) {
                if (e.target.closest && e.target.closest('.modal-close')) {
                    dialog.close();
                    return;
                }
                if (e.target.closest && e.target.closest('.modal-action')) {
                    if (dialog.portalAction) dialog.portalAction();
                    dialog.close();
                    return;
                }
                if (e.target !== dialog) return;
                const r = dialog.getBoundingClientRect();
                if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
                    dialog.close();
                }
            });
        }
        dialog.querySelector('.modal-footer').innerHTML = action
            ? '<button type="button" class="modal-close modal-cancel">' + escapeHtml(t('ui.cancel')) + '</button>' +
                '<button type="button" class="modal-action">' + escapeHtml(action.label) + '</button>'
            : '<button type="button" class="modal-close">' + escapeHtml(t('ui.close')) + '</button>';
        dialog.portalAction = action ? action.run : null;
        dialog.querySelector('h3').textContent = title;
        dialog.querySelector('.modal-intro').textContent = intro;
        dialog.querySelector('.modal-body').innerHTML = bodyHtml;
        dialog.showModal();
    }
    // The dialog is shared with read_aloud.js
    window.AYA_PORTAL = { openModal: openPortalModal };

    function openGlossary() {
        const glossary = strings('glossary');
        const pageTerms = glossary[pageId] || [];
        const commonTerms = isModulePage ? (glossary.common || []) : [];
        // Alphabetical order (of the page language) makes terms easier to find
        const terms = pageTerms.concat(commonTerms)
            .sort(function (a, b) { return a.term.localeCompare(b.term, pageLanguage()); });
        if (terms.length === 0) return;

        const items = terms.map(function (entry) {
            return '<dt>' + entry.term + '</dt><dd>' + entry.definition + '</dd>';
        }).join('');
        openPortalModal(
            t('ui.glossaryTitle'),
            t('ui.glossaryIntro'),
            '<dl class="glossary-list">' + items + '</dl>'
        );
    }

    function openHelp() {
        const help = strings('help');
        const steps = (isModulePage ? help.module : (help[pageId] || help.modules)) || [];
        const items = steps.map(function (s) {
            return '<li>' + s + '</li>';
        }).join('');
        openPortalModal(
            t('ui.helpTitle'),
            t('ui.helpIntro'),
            '<ul class="help-list">' + items + '</ul>'
        );
    }

    document.querySelectorAll('.tool-btn[data-tool="glossary"]').forEach(function (btn) {
        btn.addEventListener('click', openGlossary);
    });
    document.querySelectorAll('.tool-btn[data-tool="help"]').forEach(function (btn) {
        btn.addEventListener('click', openHelp);
    });

    // --- Country (accessibility bar) ---
    // The Country button shows the visitor's country for the national
    // website on the topic pages (see "National websites" above) and
    // opens a dialog to choose another country, or to find it with
    // "Use my location": only that button makes the browser ask for
    // the position.
    const countryButtons = document.querySelectorAll('.country-btn');
    const canLocate = 'geolocation' in navigator && window.isSecureContext !== false;
    let locating = false;

    // The label stays "Country"; the chosen country is in the
    // accessible name and the tooltip (title)
    function updateCountryButtons() {
        const country = currentCountry();
        const name = country.code ? countryName(country.code) : t('national.notChosen');
        countryButtons.forEach(function (btn) {
            btn.setAttribute('aria-label', t('national.button', { country: name }));
            btn.title = t('national.button', { country: name });
        });
    }

    function setCountry(code, source) {
        storeCountry(code, source);
        updateCountryButtons();
        document.dispatchEvent(new CustomEvent('aya-countrychange'));
    }

    // What the country means for the topic pages (HTML); pending: the
    // visitor picked it in the dialog but has not applied it yet
    function countryResultHtml(country, national, pending) {
        if (!country.code) return escapeHtml(t('national.resultChoose'));
        const suffix = pending ? 'Pending' : '';
        const site = national && pickNationalResource(national, country.code);
        let result;
        if (!site) {
            result = country.code === OUTSIDE_EUROPE || !national
                ? t('national.resultArticles' + suffix)
                : t('national.resultNoSite' + suffix, { country: escapeHtml(countryInProse(country.code)) });
        } else {
            result = t('national.resultSite' + suffix, {
                site: nativeText(site.name, site.lang) + (site.organisation && site.organisation !== site.name
                    ? ' (' + nativeText(site.organisation, site.lang) + ')' : '')
            });
        }
        return result + (pending ? ' <strong>' + escapeHtml(t('national.pressApply')) + '</strong>' : '');
    }

    const COUNTRY_SOURCE_STATUS = {
        settings: 'national.statusSettings',
        chosen: '',
        position: 'national.statusPosition'
    };

    function openCountryDialog() {
        const opener = document.activeElement;
        const country = currentCountry();
        const names = {};
        Object.keys(EUROPE_COUNTRIES).forEach(function (code) { names[code] = countryName(code); });
        const options = Object.keys(EUROPE_COUNTRIES).sort(function (a, b) {
            return names[a].localeCompare(names[b], pageLanguage());
        }).map(function (code) {
            return '<option value="' + code + '">' + escapeHtml(names[code]) + '</option>';
        });
        openPortalModal(
            t('national.dialogTitle'),
            t('national.dialogIntro'),
            '<div class="country-form">' +
            '<label class="country-label" for="country-select">' + escapeHtml(t('national.countryLabel')) + '</label>' +
            '<select id="country-select" class="country-select" aria-describedby="country-status">' +
            (country.code ? '' : '<option value="" disabled selected>' + escapeHtml(t('national.chooseCountry')) + '</option>') +
            options.join('') +
            '<option value="' + OUTSIDE_EUROPE + '">' + escapeHtml(t('national.outsideEurope')) + '</option>' +
            '</select>' +
            '<p id="country-status" class="country-status" role="status"></p>' +
            (canLocate
                ? '<div class="country-locate">' +
                '<button type="button" class="country-locate-btn">' +
                '<i class="fas fa-location-crosshairs" aria-hidden="true"></i>' + escapeHtml(t('national.useLocation')) + '</button>' +
                '<p class="country-privacy">' + escapeHtml(t('national.privacy')) + '</p>' +
                '</div>'
                : '') +
            '</div>',
            { label: t('ui.apply'), run: function () { applyChoice(); } }
        );
        const dialog = document.getElementById('portal-modal');
        const select = dialog.querySelector('.country-select');
        const status = dialog.querySelector('.country-status');
        const locateButton = dialog.querySelector('.country-locate-btn');
        const applyButton = dialog.querySelector('.modal-action');
        if (country.code) select.value = country.code;
        applyButton.disabled = !select.value;
        // what Apply stores: the selected country, found with the
        // location or chosen from the list
        let pendingSource = country.source === 'settings' ? 'chosen' : country.source;
        const applyChoice = function () {
            const code = select.value === OUTSIDE_EUROPE ? OUTSIDE_EUROPE : europeanCountry(select.value);
            if (code) setCountry(code, pendingSource);
        };

        const showStatus = function (lead, shown, pending) {
            const show = function (national) {
                status.innerHTML = (lead ? escapeHtml(lead) + ' ' : '') + countryResultHtml(shown, national, pending);
            };
            loadJson(NATIONAL_RESOURCES_URL).then(show, function () { show(null); });
        };
        showStatus(country.code
            ? (COUNTRY_SOURCE_STATUS[country.source] ? t(COUNTRY_SOURCE_STATUS[country.source]) : '')
            : t('national.notGuessed'), country);

        let choices = 0;
        select.addEventListener('change', function () {
            const code = select.value === OUTSIDE_EUROPE ? OUTSIDE_EUROPE : europeanCountry(select.value);
            if (!code) return;
            choices += 1;
            pendingSource = 'chosen';
            applyButton.disabled = false;
            showStatus('', { code: code, source: 'chosen' }, true);
        });

        if (locateButton) {
            locateButton.addEventListener('click', function () {
                if (locating) return;
                locating = true;
                const before = choices;
                status.textContent = t('national.finding');
                const done = function () { locating = false; };
                locateCountry().then(function (code) {
                    if (choices !== before) return; // the visitor chose a country meanwhile
                    select.value = code;
                    pendingSource = 'position';
                    applyButton.disabled = false;
                    showStatus(code === OUTSIDE_EUROPE
                        ? t('national.foundOutside')
                        : t('national.found', { country: countryName(code) }), { code: code, source: 'position' }, true);
                }, function (reason) {
                    if (choices !== before) return;
                    status.textContent = reason === 'denied' ? t('national.denied') : t('national.notFound');
                }).then(done, done);
            });
        }

        // The browser returns focus to the button that opened the
        // dialog; a "Change country" button in the beatcancer.eu block
        // is replaced when the country changes, so focus its successor
        dialog.addEventListener('close', function () {
            if (opener && opener !== document.body && !document.contains(opener)) {
                const successor = document.querySelector('.beatcancer-insert .country-change') || countryButtons[0];
                if (successor) successor.focus();
            }
        }, { once: true });
    }

    countryButtons.forEach(function (btn) {
        btn.addEventListener('click', openCountryDialog);
    });
    updateCountryButtons();

    // --- Language (accessibility bar) ---
    // The Language button lists the languages the portal is published
    // in (web/i18n/languages.js); a choice is remembered (js/i18n.js)
    // and this page opens in that language. When the visitor's language
    // is not among them, the browser can translate the page on the
    // device (Translator API, Chrome and Edge 138 or later): the dialog
    // offers that, and otherwise points to the browser's own translate
    // feature. A browser translation is remembered too, and applied
    // again on the next page.
    const i18n = window.AYA_I18N;
    const languageButtons = document.querySelectorAll('.language-btn');
    const LANGUAGE_STATUS = {
        source: 'language.statusSource',
        machine: 'language.statusMachine',
        reviewed: 'language.statusReviewed',
        browser: 'language.statusBrowser'
    };

    // The language of this page as the visitor sees it: the page
    // language, or the language the browser translated it into
    function shownLanguage() {
        return (i18n && i18n.browser.active()) || (i18n ? i18n.pageLang() : 'en');
    }

    function languageName(code) {
        const entry = i18n && i18n.languages.find(function (l) { return l.code === code; });
        return entry ? entry.name : (i18n ? i18n.nativeName(code) : code);
    }

    // The label stays "Language"; the current language is in the
    // accessible name and the tooltip (title)
    function updateLanguageButtons() {
        const label = t('language.title') + ': ' + languageName(shownLanguage());
        languageButtons.forEach(function (btn) {
            btn.setAttribute('aria-label', label);
            btn.title = label;
        });
    }

    function languageOptionHtml(code, name, status, current) {
        return '<li><button type="button" class="language-option" lang="' + escapeHtml(code) + '" data-lang="' +
            escapeHtml(code) + '"' + (current ? ' aria-current="true"' : '') + '>' +
            '<span class="language-name">' + escapeHtml(name) + '</span>' +
            '<span class="language-status" lang="' + escapeHtml(pageLanguage()) + '">' +
            escapeHtml(t(LANGUAGE_STATUS[status] || LANGUAGE_STATUS.machine)) + '</span></button></li>';
    }

    function openLanguageDialog() {
        if (!i18n) return;
        const browserActive = i18n.browser.active();
        const current = shownLanguage();
        const options = i18n.languages.map(function (l) {
            return languageOptionHtml(l.code, l.name, l.status, l.code === current && !browserActive);
        });
        if (browserActive) options.push(languageOptionHtml(browserActive, languageName(browserActive), 'browser', true));

        // Translation by the browser, for the languages the portal does not have
        const supported = i18n.browser.supported();
        const candidates = supported ? i18n.browser.candidates() : [];
        const preferred = i18n.browserLanguages().filter(function (code) { return candidates.indexOf(code) >= 0; })[0] ||
            browserActive || candidates[0];
        const browserHtml = '<div class="language-browser">' +
            '<h4>' + escapeHtml(t('language.browserTitle')) + '</h4>' +
            (supported && candidates.length
                ? '<p>' + escapeHtml(t('language.browserIntro')) + '</p>' +
                    '<div class="language-browser-form">' +
                    '<label for="language-browser-select">' + escapeHtml(t('language.browserSelect')) + '</label>' +
                    '<select id="language-browser-select" class="language-browser-select">' +
                    candidates.map(function (code) {
                        return '<option value="' + escapeHtml(code) + '" lang="' + escapeHtml(code) + '"' +
                            (code === preferred ? ' selected' : '') + '>' + escapeHtml(i18n.nativeName(code)) + '</option>';
                    }).join('') +
                    '</select>' +
                    '<button type="button" class="language-browser-btn">' + escapeHtml(t('language.browserButton')) + '</button>' +
                    '</div>' +
                    '<p class="language-browser-status" role="status"></p>'
                : '<p>' + escapeHtml(t('language.browserHelp')) + '</p>') +
            '</div>';

        openPortalModal(
            t('language.title'),
            t('language.intro'),
            '<ul class="language-list">' + options.join('') + '</ul>' + browserHtml
        );
        const dialog = document.getElementById('portal-modal');

        // A language of the portal: remember it and open this page in it
        dialog.querySelectorAll('.language-option').forEach(function (option) {
            option.addEventListener('click', function () {
                const code = option.dataset.lang;
                if (code === browserActive) {
                    dialog.close();
                    return;
                }
                i18n.choose(code, 'site');
                const url = i18n.urlFor(code);
                if (code === i18n.pageLang() && !browserActive) {
                    dialog.close();
                } else if (url === window.location.href) {
                    window.location.reload(); // the English page, translated by the browser
                } else if (url) {
                    window.location.href = url;
                }
            });
        });

        // Translation by the browser
        const translateButton = dialog.querySelector('.language-browser-btn');
        if (translateButton) {
            const select = dialog.querySelector('.language-browser-select');
            const status = dialog.querySelector('.language-browser-status');
            translateButton.addEventListener('click', function () {
                const code = select.value;
                translateButton.disabled = true;
                status.textContent = t('language.browserTranslating');
                i18n.browser.availability(code).then(function (state) {
                    if (state === 'unavailable') throw new Error('unavailable');
                    return i18n.browser.translatePage(code, function (fraction) {
                        status.textContent = t('language.browserDownloading', { percent: Math.round(fraction * 100) });
                    });
                }).then(function () {
                    i18n.choose(code, 'browser');
                    status.textContent = t('language.browserDone');
                    dialog.querySelectorAll('.language-option').forEach(function (option) {
                        option.removeAttribute('aria-current');
                    });
                    updateLanguageButtons();
                }, function (error) {
                    status.textContent = error && error.message === 'unavailable'
                        ? t('language.browserUnavailable') : t('language.browserFailed');
                }).then(function () {
                    translateButton.disabled = false;
                });
            });
        }
    }

    languageButtons.forEach(function (btn) {
        btn.addEventListener('click', openLanguageDialog);
    });
    updateLanguageButtons();

    // --- Articles from beatcancer.eu (module pages) ---
    // Replaces the plain link to the beatcancer.eu library with a few
    // articles about the page's topic and, for the visitor's country,
    // the card of its national website (shown again when the visitor
    // changes the country); the link stays if the articles cannot be
    // loaded.
    const beatcancerInsert = document.querySelector('.beatcancer-insert');
    if (beatcancerInsert) {
        Promise.all([
            loadJson(SITE_ROOT + 'data/beatcancer_resources.json'),
            loadJson(NATIONAL_RESOURCES_URL).catch(function () { return null; })
        ]).then(function (results) {
            const page = results[0].pages && results[0].pages[pageId];
            const national = results[1];
            if (!page) return;
            const community = document.querySelector('.support-section a[href^="https://beatcancer.eu/community"]');
            const supportLine = community && community.closest('.support-line');
            let supportNational = null;
            if (supportLine) {
                // its own line, right after the one about beatcancer.eu
                supportNational = document.createElement('span');
                supportNational.className = 'support-line support-national';
                supportNational.hidden = true;
                supportLine.after(supportNational);
            }
            const render = function () {
                const country = currentCountry();
                const site = national && country.code ? pickNationalResource(national, country.code) : null;
                const html = beatcancerInsertHtml(page, site, national ? country : null);
                if (html) {
                    beatcancerInsert.innerHTML = html;
                    watchArticleImages(beatcancerInsert);
                }
                if (supportNational) {
                    supportNational.innerHTML = site ? supportNationalHtml(site) : '';
                    supportNational.hidden = !site;
                }
            };
            render();
            document.addEventListener('aya-countrychange', render);
        }).catch(function () { /* keep the plain link to beatcancer.eu */ });

        beatcancerInsert.addEventListener('click', function (e) {
            if (e.target.closest && e.target.closest('.country-change')) openCountryDialog();
        });
    }
});
