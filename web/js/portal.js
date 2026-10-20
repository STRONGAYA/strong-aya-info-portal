/**
 * STRONG-AYA Info Portal — shared page behaviour
 * - Subject carousel: horizontal scrolling via prev/next buttons
 * - "Explore all topics" dropdown on module pages
 * - Disabled header/footer links to strongaya.eu (with an explanation)
 * - Accessibility modes (contrast / dark), persisted in localStorage
 * - Page-specific Glossary and Help modals
 * - Articles from beatcancer.eu about the topic of a module page
 * - A national website for young people with cancer, for the visitor's country
 */

// ------------------------------------------------------------------
// Page-specific Glossary and Help content.
// The page id is derived from the file name (e.g. chemotherapy.html
// -> "chemotherapy"); entries marked "common" are shown on every
// module content page in addition to the page-specific terms.
// ------------------------------------------------------------------
const GLOSSARY_CONTENT = {
    common: [
        { term: 'AYA', definition: 'Adolescents and Young Adults: people who were between 15 and 39 years old when they were diagnosed with cancer.' },
        { term: 'Icon array', definition: 'The figure shown on this page. Each person icon stands for 1 out of 100 people. The coloured icons show how many people this happens to.' },
        { term: 'SURVAYA study', definition: 'A Dutch study of about 3300 AYAs who were treated in university medical centres in the Netherlands. The numbers shown here are test numbers based on this study.' },
        { term: 'Blood cancers', definition: 'Cancers of the blood, bone marrow or lymphatic system, such as leukaemia and lymphoma.' },
        { term: 'Solid tumours', definition: 'Cancers that form a lump in an organ or tissue. Examples at a young age are breast, testicular, ovarian, thyroid, bone and soft tissue cancers.' },
        { term: 'Skin cancer', definition: 'Cancers of the skin, such as melanoma.' },
        { term: 'Brain and nervous system tumours', definition: 'Tumours of the brain, spinal cord or nerves.' }
    ],
    chemotherapy: [
        { term: 'Chemotherapy', definition: 'Treatment with medicines that kill cancer cells or slow their growth in the whole body. You often get it through a drip (infusion) or as tablets.' }
    ],
    radiotherapy: [
        { term: 'Radiotherapy', definition: 'Treatment that aims strong rays (radiation) at one part of the body to destroy the cancer cells there.' }
    ],
    hormonetherapy: [
        { term: 'Hormone therapy', definition: 'Treatment that blocks or lowers the hormones that some cancers need to grow, for example some breast and prostate cancers.' }
    ],
    emotional_functioning: [
        { term: 'Emotional functioning', definition: 'How someone feels emotionally: for example tense, worried, irritable or down. It is measured with the EORTC QLQ-C30 questionnaire.' },
        { term: 'Declined', definition: 'The emotional functioning score is clearly lower (worse) than the value it is compared with.' },
        { term: 'Stable', definition: 'The emotional functioning score is about the same as the value it is compared with.' },
        { term: 'EORTC QLQ-C30', definition: 'A questionnaire that is used in many countries to measure the quality of life of people with cancer.' }
    ],
    physical_functioning: [
        { term: 'Physical functioning', definition: 'How well someone can do everyday physical activities, such as walking, climbing stairs, carrying shopping or washing themselves. It is measured with the EORTC QLQ-C30 questionnaire.' },
        { term: 'Declined', definition: 'The physical functioning score is clearly lower (worse) than the value it is compared with.' },
        { term: 'Stable', definition: 'The physical functioning score is about the same as the value it is compared with.' },
        { term: 'EORTC QLQ-C30', definition: 'A questionnaire that is used in many countries to measure the quality of life of people with cancer.' }
    ],
    role_functioning: [
        { term: 'Role functioning', definition: 'How well someone can do their daily tasks: work, study, tasks at home and hobbies. It is measured with the EORTC QLQ-C30 questionnaire.' },
        { term: 'Declined', definition: 'The role functioning score is clearly lower (worse) than the value it is compared with.' },
        { term: 'Stable', definition: 'The role functioning score is about the same as the value it is compared with.' },
        { term: 'EORTC QLQ-C30', definition: 'A questionnaire that is used in many countries to measure the quality of life of people with cancer.' }
    ],
    anxiety: [
        { term: 'Anxiety', definition: 'Feeling tense, nervous or afraid. Some anxiety is normal, but strong anxiety can make daily life hard.' },
        { term: 'HADS', definition: 'The Hospital Anxiety and Depression Scale: a short list of questions that measures signs of anxiety and depression.' },
        { term: 'Signs of anxiety', definition: 'A HADS anxiety score of 8 or higher. It does not mean someone is ill; it means their answers point to anxiety.' }
    ],
    depression: [
        { term: 'Depression', definition: 'Feeling down, sad or empty for a long time, and enjoying things less than before.' },
        { term: 'HADS', definition: 'The Hospital Anxiety and Depression Scale: a short list of questions that measures signs of anxiety and depression.' },
        { term: 'Signs of depression', definition: 'A HADS depression score of 8 or higher. It does not mean someone is ill; it means their answers point to depression.' }
    ],
    worry: [
        { term: 'Worry', definition: 'Thinking a lot about things that could go wrong, for example about health, work or the future.' },
        { term: 'EORTC QLQ-AYA', definition: 'A list of questions made for young people with cancer. It asks about worry and other things that matter at a young age.' }
    ],
    mental_health_support: [
        { term: 'Mental health support', definition: 'Help for your feelings and thoughts, for example from a psychologist, a counsellor or a support group.' },
        { term: 'Self-reported', definition: 'People answered the question themselves. The answer was not checked in medical records.' }
    ],
    romantic_life: [
        { term: 'Romantic life', definition: 'Dating, falling in love and being in a relationship with a partner.' },
        { term: 'Affected a lot', definition: 'Answering "quite a bit" or "very much" when asked if cancer has had a bad effect on your romantic life.' },
        { term: 'EORTC QLQ-AYA', definition: 'A list of questions made for young people with cancer. It asks about romantic life, sex life, relationships and other things that matter at a young age.' }
    ],
    sex_life: [
        { term: 'Sex life', definition: 'Having sex and being physically close to someone, and how you feel about that.' },
        { term: 'Affected a lot', definition: 'Answering "quite a bit" or "very much" when asked if cancer has had a bad effect on your sex life.' },
        { term: 'EORTC QLQ-AYA', definition: 'A list of questions made for young people with cancer. It asks about romantic life, sex life, relationships and other things that matter at a young age.' }
    ],
    relationships: [
        { term: 'Relationships', definition: 'How you get on with other people. The questions ask, for example, about feeling alone, being treated differently and needing help from others.' },
        { term: 'Affected a lot', definition: 'Answering these questions with "quite a bit" or "very much" on average.' },
        { term: 'EORTC QLQ-AYA', definition: 'A list of questions made for young people with cancer. It asks about romantic life, sex life, relationships and other things that matter at a young age.' }
    ],
    self_esteem: [
        { term: 'Self-esteem', definition: 'How you see yourself and how you feel about yourself. The questions ask about confidence, feeling in control of your life and changes to how you look.' },
        { term: 'Affected a lot', definition: 'Answering these questions with "quite a bit" or "very much" on average.' },
        { term: 'EORTC QLQ-AYA', definition: 'A list of questions made for young people with cancer. It asks about romantic life, sex life, relationships and other things that matter at a young age.' }
    ],
    modules: [
        { term: 'Subject', definition: 'A theme you can explore, such as treatment information or functioning after treatment. Each subject has several topics.' },
        { term: 'Treatment information', definition: 'Numbers about how many AYAs receive treatments such as chemotherapy, radiotherapy and hormone therapy.' },
        { term: 'Functioning after treatment', definition: 'Numbers about how AYAs are doing after their treatment: emotionally, physically and in their daily tasks.' },
        { term: 'Mental health', definition: 'Numbers about how AYAs feel mentally: anxiety, depression, worry and the support they get.' },
        { term: 'AYA', definition: 'Adolescents and Young Adults: people who were between 15 and 39 years old when they were diagnosed with cancer.' }
    ]
};

const HELP_CONTENT = {
    module: [
        '<b>Return to subjects</b> (top left) brings you back to the list of subjects.',
        '<b>View</b> (to the right of the filters) lets you choose how the data is shown: as person icons, a table with all topics of this subject, a pie chart or a bar chart.',
        '<b>Filters</b>: use <b>Cancer type</b> and <b>Sex</b> to see the numbers for one group only. The other filters are coming soon.',
        'Your choice of <b>View</b> and <b>Filters</b> stays the same when you go to another topic.',
        'The <b>figure</b> shows 100 person icons; each icon stands for 1 out of 100 people. The <b>legend</b> next to it explains what each colour means.',
        'Use the <b>arrow buttons</b> below the figure to go to the topic before or after this one.',
        '<b>Explore all topics</b> opens a list of all topics in this subject.',
        '<b>Glossary</b> explains the words used on this page; <b>Compare</b> is coming soon.',
        '<b>Want to know more, or is it too much?</b> (near the bottom) tells you where to find support. It also shows articles about this topic from beatcancer.eu and, if your country has one, a national website for young people with cancer. They open in a new tab.',
        '<b>Country</b> (in the accessibility bar at the top) shows the country for that national website. The portal guesses it from the settings of your browser. You can choose another country there, or let your browser find it with your location.',
        'The note at the end of the page explains where the numbers come from, and how to contact us.'
    ],
    modules: [
        '<b>Return to profiles</b> (top left) brings you back to the start page.',
        'Click a <b>subject card</b> to explore that subject; grey cards are coming soon.',
        'Use the <b>round arrow buttons</b> (or scroll sideways) to see more subject cards.',
        '<b>Explore all subjects</b> opens a list of all subjects.',
        'The order of the subjects depends on the profile you chose on the start page.',
        '<b>Glossary</b> explains the words used on this page.',
        'Use the <b>accessibility buttons</b> below the purple banner to turn on contrast or dark mode.',
        '<b>Country</b> (in the accessibility bar) chooses the country for the national website for young people with cancer on the topic pages.'
    ]
};

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
        '<span class="visually-hidden"> (' + escapeHtml(site) + ', opens in a new tab)</span></a>';
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

// "2025-02-12" -> "February 2025"
function formatMonth(date) {
    const d = new Date(date + 'T00:00:00Z');
    return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// The framed "From beatcancer.eu" block: article cards (each opening the
// article in a new tab) and links to the matching topics on the site;
// '' when there is nothing to show. national is the national website
// for the visitor's country (see below), whose card takes the place of
// the first article; country is the visitor's country ({ code, source },
// see currentCountry), or null when the national websites could not be
// loaded.
function beatcancerInsertHtml(page, national, country) {
    const cards = (page.resources || []).filter(function (r) {
        return isBeatcancerUrl(r.url);
    }).map(function (r) {
        const image = isBeatcancerUrl(r.image)
            ? '<img src="' + escapeHtml(r.image) + '" alt="" loading="lazy" referrerpolicy="no-referrer"/>'
            : '';
        const meta = [r.topic, formatMonth(r.date)].filter(Boolean).map(escapeHtml).join(' · ');
        return '<li class="bc-card">' +
            '<div class="bc-card-media">' + image + '</div>' +
            '<div class="bc-card-body">' +
            (r.type ? '<span class="bc-card-type">' + escapeHtml(r.type) + '</span>' : '') +
            '<h4 class="bc-card-title">' + beatcancerLink(r.url, escapeHtml(r.title)) + '</h4>' +
            (r.excerpt ? '<p class="bc-card-excerpt">' + escapeHtml(r.excerpt) + '</p>' : '') +
            '<p class="bc-card-meta"><span>' + meta + '</span>' + EXTERNAL_ICON + '</p>' +
            '</div></li>';
    });
    if (!cards.length) return '';
    if (national) {
        cards.pop();
        cards.unshift(nationalCardHtml(national));
    }

    const topics = (page.topics || []).filter(function (t) {
        return isBeatcancerUrl(t.url);
    }).map(function (t) {
        return beatcancerLink(t.url, escapeHtml(t.label) + ' <span class="bc-topic-count">' + escapeHtml(t.count) +
            '<span class="visually-hidden"> articles</span></span>' + EXTERNAL_ICON, 'bc-topic-link');
    });

    const sources = '<a href="' + BEATCANCER_URL + '" target="_blank" rel="noopener">beatcancer.eu' + EXTERNAL_ICON +
        '<span class="visually-hidden"> (opens in a new tab)</span></a>' +
        (national ? ' and ' + externalLink(national.url, nativeText(national.organisation, national.lang) +
            EXTERNAL_ICON, hostOf(national.url)) : '');
    let countryNote = '';
    if (national) {
        countryNote = ' <span>The first card is ' + nativeText(national.name, national.lang) +
            ', for young people with cancer in ' + escapeHtml(national.countryInProse) + ' (' +
            COUNTRY_SOURCE_NOTE[country.source] + ').</span> ' + countryChangeButton('Change country');
    } else if (country && !country.code) {
        countryNote = ' <span>Is there a website for young people with cancer in your country?</span> ' +
            countryChangeButton('Choose your country');
    }
    const nationalCredit = national && national.logo
        ? ' <span>' + (national.name !== national.organisation ? nativeText(national.name, national.lang) + ' logo' : 'Logo') +
            ': ' + nativeText(national.organisation, national.lang) + '.</span>'
        : '';

    return '<div class="bc-insert-head">' +
        '<img class="bc-insert-logo" src="../images/yarn-logo.png" alt="YARN – European Youth Cancer Network"' +
        ' width="119" height="40"/>' +
        '<div>' +
        '<h3 class="bc-insert-source">From ' + sources + '</h3>' +
        '<p class="bc-insert-note"><span>Articles about this topic, picked automatically from the library of the ' +
        'European Youth Cancer Network (YARN). They open in a new tab.</span>' + countryNote + '</p>' +
        '<p class="bc-insert-note"><span>Titles, summaries, images and&nbsp;logo: beatcancer.eu (YARN).</span> ' +
        '<span>All rights belong to them.</span>' + nationalCredit + '</p>' +
        '</div></div>' +
        '<ul class="bc-cards">' + cards.join('') + '</ul>' +
        (topics.length ? '<p class="bc-insert-more"><span>More on beatcancer.eu:</span>' + topics.join('') + '</p>' : '');
}

// A button in the beatcancer.eu block that opens the Country dialog
function countryChangeButton(text) {
    return '<button type="button" class="country-change" aria-haspopup="dialog">' + text + '</button>';
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

// The site root (web/), from the address of this script
// (web/js/portal.js), so that every page finds the data files
const SITE_ROOT = (function () {
    try {
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

// Country names that take an article in running text
const COUNTRY_IN_PROSE = { NL: 'the Netherlands', GB: 'the United Kingdom' };

// How the country was found, in the note above the cards
const COUNTRY_SOURCE_NOTE = {
    settings: 'your country, guessed from the settings of your browser',
    chosen: 'the country you chose',
    position: 'your country, found with your location'
};

// "NL" -> "Netherlands", "nl" -> "Dutch" (English names from the browser)
function displayName(type, code, fallback) {
    try {
        return new Intl.DisplayNames(['en'], { type: type }).of(code) || fallback;
    } catch (e) {
        return fallback;
    }
}

function browserLanguages() {
    return (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''])
        .map(function (tag) { return String(tag); });
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
    return code === OUTSIDE_EUROPE ? 'Outside Europe' : (EUROPE_COUNTRIES[code] || String(code));
}

function countryInProse(code) {
    return COUNTRY_IN_PROSE[code] || countryName(code);
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
    return Object.assign({
        iso2: country,
        country: countryName(country),
        countryInProse: countryInProse(country)
    }, chosen || resources[0]);
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
    const meta = [n.organisation ? nativeText(n.organisation, n.lang) : '', language ? 'In ' + escapeHtml(language) : '']
        .filter(Boolean).join(' · ');
    return '<li class="bc-card bc-card-national">' +
        '<div class="bc-card-media bc-card-logo' + (n.logo ? '' : ' bc-card-illustration') + '"' + plate + '>' + image + '</div>' +
        '<div class="bc-card-body">' +
        '<span class="bc-card-type">National · ' + escapeHtml(n.country) + '</span>' +
        '<h4 class="bc-card-title">' + externalLink(n.url, nativeText(n.name, n.lang), hostOf(n.url)) + '</h4>' +
        (n.description ? '<p class="bc-card-excerpt">' + escapeHtml(n.description) + '</p>' : '') +
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
    const OFFSITE_NOTE = 'This link does not work in this test version. You can visit strongaya.eu yourself, ' +
        'but from there you cannot get back to this test portal.';
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
        if (text === 'Coming soon') el.setAttribute('aria-disabled', 'true');
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

    // --- Glossary / Help modals ---
    // Content is page specific; the page id is the file name without
    // the extension (index.html and "/" fall back to "index").
    const pageId = (window.location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
    const isModulePage = /module_[a-d]/.test(window.location.pathname);

    // Native <dialog> + showModal(): the browser moves focus into the
    // dialog, keeps it there, closes on Escape and returns focus to the
    // button that opened it — no custom focus management needed.
    function openPortalModal(title, intro, bodyHtml) {
        let dialog = document.getElementById('portal-modal');
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.id = 'portal-modal';
            dialog.className = 'portal-modal';
            dialog.setAttribute('aria-labelledby', 'portal-modal-title');
            dialog.innerHTML =
                '<h3 id="portal-modal-title"></h3><p class="modal-intro"></p>' +
                '<div class="modal-body"></div>' +
                '<div class="modal-footer"><button type="button" class="modal-close">Close</button></div>';
            document.body.appendChild(dialog);

            // A click on the backdrop targets the dialog element itself;
            // the bounds check keeps clicks on the dialog's own padding
            // from closing it
            dialog.addEventListener('click', function (e) {
                if (e.target !== dialog) return;
                const r = dialog.getBoundingClientRect();
                if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
                    dialog.close();
                }
            });
            dialog.querySelector('.modal-close').addEventListener('click', function () {
                dialog.close();
            });
        }
        dialog.querySelector('h3').textContent = title;
        dialog.querySelector('.modal-intro').textContent = intro;
        dialog.querySelector('.modal-body').innerHTML = bodyHtml;
        dialog.showModal();
    }

    function openGlossary() {
        const pageTerms = GLOSSARY_CONTENT[pageId] || [];
        const commonTerms = isModulePage ? GLOSSARY_CONTENT.common : [];
        // Alphabetical order makes terms easier to find
        const terms = pageTerms.concat(commonTerms)
            .sort(function (a, b) { return a.term.localeCompare(b.term); });
        if (terms.length === 0) return;

        const items = terms.map(function (t) {
            return '<dt>' + t.term + '</dt><dd>' + t.definition + '</dd>';
        }).join('');
        openPortalModal(
            'Glossary',
            'What the words on this page mean.',
            '<dl class="glossary-list">' + items + '</dl>'
        );
    }

    function openHelp() {
        const steps = isModulePage ? HELP_CONTENT.module : (HELP_CONTENT[pageId] || HELP_CONTENT.modules);
        const items = steps.map(function (s) {
            return '<li>' + s + '</li>';
        }).join('');
        openPortalModal(
            'Help',
            'How to use this page.',
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

    function updateCountryButtons() {
        const country = currentCountry();
        const name = country.code ? countryName(country.code) : '';
        countryButtons.forEach(function (btn) {
            const label = btn.querySelector('.country-btn-label');
            if (label) label.textContent = name || 'Country';
            btn.setAttribute('aria-label', 'Country: ' + (name || 'not chosen'));
        });
    }

    function setCountry(code, source) {
        storeCountry(code, source);
        updateCountryButtons();
        document.dispatchEvent(new CustomEvent('aya-countrychange'));
    }

    // What the country means for the topic pages (HTML)
    function countryResultHtml(country, national) {
        if (!country.code) return 'Choose your country from the list.';
        const site = national && pickNationalResource(national, country.code);
        if (!site) {
            return country.code === OUTSIDE_EUROPE || !national
                ? 'The topic pages show the articles from beatcancer.eu.'
                : 'There is no national website for ' + escapeHtml(countryInProse(country.code)) +
                    ' in this portal yet: the topic pages show the articles from beatcancer.eu.';
        }
        return 'The topic pages show ' + nativeText(site.name, site.lang) +
            (site.organisation && site.organisation !== site.name
                ? ' (' + nativeText(site.organisation, site.lang) + ')' : '') +
            ' next to the articles from beatcancer.eu.';
    }

    const COUNTRY_SOURCE_STATUS = {
        settings: 'Guessed from the settings of your browser.',
        chosen: '',
        position: 'Found with your location.'
    };

    function openCountryDialog() {
        const opener = document.activeElement;
        const country = currentCountry();
        const options = Object.keys(EUROPE_COUNTRIES).sort(function (a, b) {
            return EUROPE_COUNTRIES[a].localeCompare(EUROPE_COUNTRIES[b], 'en');
        }).map(function (code) {
            return '<option value="' + code + '">' + escapeHtml(EUROPE_COUNTRIES[code]) + '</option>';
        });
        openPortalModal(
            'Your country',
            'The topic pages can show a website for young people with cancer in your country, next to the ' +
            'articles from beatcancer.eu.',
            '<div class="country-form">' +
            '<label class="country-label" for="country-select">Country</label>' +
            '<select id="country-select" class="country-select" aria-describedby="country-status">' +
            (country.code ? '' : '<option value="" disabled selected>Choose your country</option>') +
            options.join('') +
            '<option value="' + OUTSIDE_EUROPE + '">Outside Europe</option>' +
            '</select>' +
            '<p id="country-status" class="country-status" role="status"></p>' +
            (canLocate
                ? '<div class="country-locate">' +
                '<button type="button" class="country-locate-btn">' +
                '<i class="fas fa-location-crosshairs" aria-hidden="true"></i>Use my location</button>' +
                '<p class="country-privacy">Your browser asks you first. The portal uses your location only on ' +
                'this device, to find your country, and does not send or store it.</p>' +
                '</div>'
                : '') +
            '</div>'
        );
        const dialog = document.getElementById('portal-modal');
        const select = dialog.querySelector('.country-select');
        const status = dialog.querySelector('.country-status');
        const locateButton = dialog.querySelector('.country-locate-btn');
        if (country.code) select.value = country.code;

        const showStatus = function (lead, shown) {
            const show = function (national) {
                status.innerHTML = (lead ? escapeHtml(lead) + ' ' : '') + countryResultHtml(shown, national);
            };
            loadJson(NATIONAL_RESOURCES_URL).then(show, function () { show(null); });
        };
        showStatus(country.code
            ? COUNTRY_SOURCE_STATUS[country.source]
            : 'Your country could not be guessed from the settings of your browser.', country);

        let choices = 0;
        select.addEventListener('change', function () {
            const code = select.value === OUTSIDE_EUROPE ? OUTSIDE_EUROPE : europeanCountry(select.value);
            if (!code) return;
            choices += 1;
            setCountry(code, 'chosen');
            showStatus('', { code: code, source: 'chosen' });
        });

        if (locateButton) {
            locateButton.addEventListener('click', function () {
                if (locating) return;
                locating = true;
                const before = choices;
                status.textContent = 'Finding your location…';
                const done = function () { locating = false; };
                locateCountry().then(function (code) {
                    if (choices !== before) return; // the visitor chose a country meanwhile
                    setCountry(code, 'position');
                    select.value = code;
                    showStatus(code === OUTSIDE_EUROPE
                        ? 'Your location is outside Europe.'
                        : 'Found with your location: ' + countryName(code) + '.', { code: code, source: 'position' });
                }, function (reason) {
                    if (choices !== before) return;
                    status.textContent = reason === 'denied'
                        ? 'Your browser did not share your location. You can choose your country from the list.'
                        : 'Your location could not be found. You can choose your country from the list.';
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
            const render = function () {
                const country = currentCountry();
                const site = national && country.code ? pickNationalResource(national, country.code) : null;
                const html = beatcancerInsertHtml(page, site, national ? country : null);
                if (html) beatcancerInsert.innerHTML = html;
            };
            render();
            document.addEventListener('aya-countrychange', render);
        }).catch(function () { /* keep the plain link to beatcancer.eu */ });

        beatcancerInsert.addEventListener('click', function (e) {
            if (e.target.closest && e.target.closest('.country-change')) openCountryDialog();
        });
    }
});
