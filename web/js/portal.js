/**
 * STRONG-AYA Info Portal — shared page behaviour
 * - Subject carousel: horizontal scrolling via prev/next buttons
 * - "Explore all topics" dropdown on module pages
 * - Disabled header/footer links to strongaya.eu (with an explanation)
 * - Accessibility modes (contrast / dark), persisted in localStorage
 * - Page-specific Glossary and Help modals
 * - Articles from beatcancer.eu about the topic of a module page
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
        'The <b>figure</b> shows 100 person icons; each icon stands for 1 out of 100 people. The <b>legend</b> next to it explains what each colour means.',
        'Use the <b>arrow buttons</b> below the figure to go to the topic before or after this one.',
        '<b>Explore all topics</b> opens a list of all topics in this subject.',
        '<b>Glossary</b> explains the words used on this page; <b>Compare</b> is coming soon.',
        '<b>Want to know more, or is it too much?</b> (near the bottom) tells you where to find support. It also shows articles about this topic from beatcancer.eu. They open in a new tab.',
        'The note at the end of the page explains where the numbers come from.'
    ],
    modules: [
        '<b>Return to profiles</b> (top left) brings you back to the start page.',
        'Click a <b>subject card</b> to explore that subject; grey cards are coming soon.',
        'Use the <b>round arrow buttons</b> (or scroll sideways) to see more subject cards.',
        '<b>Explore all subjects</b> opens a list of all subjects.',
        'The order of the subjects depends on the profile you chose on the start page.',
        '<b>Glossary</b> explains the words used on this page.',
        'Use the <b>accessibility buttons</b> below the purple banner to turn on contrast or dark mode.'
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
const NEW_TAB_NOTE = '<span class="visually-hidden"> (beatcancer.eu, opens in a new tab)</span>';
const EXTERNAL_ICON = '<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>';

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

function isBeatcancerUrl(url) {
    return typeof url === 'string' && url.indexOf(BEATCANCER_URL) === 0;
}

function beatcancerLink(url, content, className) {
    return '<a' + (className ? ' class="' + className + '"' : '') + ' href="' + escapeHtml(url) +
        '" target="_blank" rel="noopener">' + content + NEW_TAB_NOTE + '</a>';
}

// "2025-02-12" -> "February 2025"
function formatMonth(date) {
    const d = new Date(date + 'T00:00:00Z');
    return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// The framed "From beatcancer.eu" block: article cards (each opening the
// article in a new tab) and links to the matching topics on the site;
// '' when there is nothing to show
function beatcancerInsertHtml(page) {
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

    const topics = (page.topics || []).filter(function (t) {
        return isBeatcancerUrl(t.url);
    }).map(function (t) {
        return beatcancerLink(t.url, escapeHtml(t.label) + ' <span class="bc-topic-count">' + escapeHtml(t.count) +
            '<span class="visually-hidden"> articles</span></span>' + EXTERNAL_ICON, 'bc-topic-link');
    });

    return '<div class="bc-insert-head">' +
        '<img class="bc-insert-logo" src="../images/yarn-logo.png" alt="YARN – European Youth Cancer Network"' +
        ' width="119" height="40"/>' +
        '<div>' +
        '<h3 class="bc-insert-source">From <a href="' + BEATCANCER_URL + '" target="_blank" rel="noopener">' +
        'beatcancer.eu' + EXTERNAL_ICON + '<span class="visually-hidden"> (opens in a new tab)</span></a></h3>' +
        '<p class="bc-insert-note">Articles about this topic, picked automatically from the library of the ' +
        'European Youth Cancer Network (YARN). They open in a new tab.</p>' +
        '</div></div>' +
        '<ul class="bc-cards">' + cards.join('') + '</ul>' +
        (topics.length ? '<p class="bc-insert-more"><span>More on beatcancer.eu:</span>' + topics.join('') + '</p>' : '');
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

    // --- Articles from beatcancer.eu (module pages) ---
    // Replaces the plain link to the beatcancer.eu library with a few
    // articles about the page's topic; the link stays if the list
    // cannot be loaded.
    const beatcancerInsert = document.querySelector('.beatcancer-insert');
    if (beatcancerInsert) {
        fetch('../data/beatcancer_resources.json')
            .then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(function (data) {
                const html = data.pages && data.pages[pageId] ? beatcancerInsertHtml(data.pages[pageId]) : '';
                if (html) beatcancerInsert.innerHTML = html;
            })
            .catch(function () { /* keep the plain link to beatcancer.eu */ });
    }
});
