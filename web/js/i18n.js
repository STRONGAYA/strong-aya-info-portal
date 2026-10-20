/**
 * STRONG-AYA Info Portal — languages
 * - t(key, params): the text that the scripts generate, read from web/i18n/<lang>.js (window.AYA_STRINGS)
 * - the language of the page: the portal is published once per language (web/<lang>/..., generated
 *   by scripts/translate_site.py and listed in web/i18n/languages.js). A visitor is sent to the page
 *   in the language of their browser when the portal has it; a choice made with the Language button
 *   is remembered in localStorage (like the contrast and dark modes) and followed from then on.
 * - fallback: when the portal does not have a language, the visitor's browser can translate the
 *   English page on the device: with the Translator API where the browser has it (Chrome and Edge
 *   138 or later), through the Language dialog, or with the browser's own translate feature. The
 *   portal itself sends nothing anywhere for this.
 * This script is loaded synchronously in <head>, right after web/i18n/languages.js, so that the
 * redirect to another language happens before anything is drawn.
 */
(function () {
    'use strict';

    var html = document.documentElement;
    var LANG_KEY = 'aya-lang';            // the chosen language code, e.g. 'nl'
    var LANG_MODE_KEY = 'aya-lang-mode';  // 'site': a page tree of the portal; 'browser': the browser translates
    var SOURCE_LANG = 'en';

    var languages = Array.isArray(window.AYA_LANGUAGES) && window.AYA_LANGUAGES.length
        ? window.AYA_LANGUAGES
        : [{ code: 'en', name: 'English', status: 'source' }];

    function primary(tag) {
        return String(tag || '').split('-')[0].toLowerCase();
    }

    function available(code) {
        return languages.some(function (l) { return l.code === code; });
    }

    function pageLang() {
        return primary(html.getAttribute('lang') || SOURCE_LANG);
    }

    function readStorage(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function writeStorage(key, value) {
        try {
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key, value);
        } catch (e) { /* storage unavailable: the choice holds for this page only */ }
    }

    // The visitor's explicit choice: { code, mode } or null
    function choice() {
        var code = primary(readStorage(LANG_KEY));
        var mode = readStorage(LANG_MODE_KEY);
        if (!/^[a-z]{2,3}$/.test(code)) return null;
        return { code: code, mode: mode === 'browser' ? 'browser' : 'site' };
    }

    function choose(code, mode) {
        writeStorage(LANG_KEY, primary(code));
        writeStorage(LANG_MODE_KEY, mode === 'browser' ? 'browser' : 'site');
    }

    // --- Where the other languages of this page live ---
    // The site root (web/) comes from data-site-root on <html>: "./" or "../" on English pages,
    // one more "../" on translated pages. The English tree has no language prefix.
    var siteRoot = (function () {
        try {
            return new URL(html.getAttribute('data-site-root') || './', location.href);
        } catch (e) {
            return null;
        }
    })();

    // The path of this page within the site, without a language prefix
    function pagePath() {
        if (!siteRoot) return '';
        var path = location.pathname.slice(siteRoot.pathname.length);
        var lang = pageLang();
        if (lang !== SOURCE_LANG && path.indexOf(lang + '/') === 0) path = path.slice(lang.length + 1);
        return path;
    }

    function urlFor(code) {
        if (!siteRoot) return null;
        var url = new URL((code === SOURCE_LANG ? '' : code + '/') + pagePath(), siteRoot);
        url.search = location.search;
        url.hash = location.hash;
        return url.href;
    }

    // --- The language to show ---
    // ?lang=nl in the address (e.g. in a newsletter) counts as a choice and is remembered.
    // Otherwise an earlier choice wins. Without a choice, an English page is shown in the first
    // browser language the portal has; a page in another language is left as it is, because a
    // visitor who follows a link to it meant to open it. Only explicit choices are stored, so a
    // visitor who changes the browser language is followed.
    function browserLanguages() {
        var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
        return Array.prototype.map.call(list || [], primary).filter(Boolean);
    }

    (function redirect() {
        var fromUrl = primary(new URLSearchParams(location.search).get('lang'));
        if (/^[a-z]{2,3}$/.test(fromUrl)) {
            choose(fromUrl, available(fromUrl) ? 'site' : 'browser');
        }
        var chosen = choice();
        var target = pageLang();
        if (chosen && chosen.mode === 'site' && available(chosen.code)) {
            target = chosen.code;
        } else if (chosen && chosen.mode === 'browser') {
            target = SOURCE_LANG; // the browser translates the English page after it has loaded
        } else if (pageLang() === SOURCE_LANG) {
            target = browserLanguages().filter(available)[0] || SOURCE_LANG;
        }
        // One hop at most: the target is a listed language, and after the hop it equals the page language
        if (target !== pageLang() && available(target)) {
            var url = urlFor(target);
            if (url && url !== location.href) location.replace(url);
        }
    })();

    // --- t(): the text the scripts generate ---
    // Reads window.AYA_STRINGS (web/i18n/<lang>.js, loaded before the page scripts). {name}
    // placeholders are filled from params; an entry with plural forms ({"one": ..., "other": ...})
    // is picked by params.count with the plural rules of the page language. An unknown key is
    // returned as it is, so a missing text is visible rather than empty.
    function lookup(key) {
        var value = window.AYA_STRINGS;
        String(key).split('.').forEach(function (part) {
            value = value !== null && value !== undefined ? value[part] : undefined;
        });
        return value;
    }

    function t(key, params) {
        var value = lookup(key);
        if (value && typeof value === 'object' && !Array.isArray(value) && params && params.count !== undefined) {
            var category = 'other';
            try {
                category = new Intl.PluralRules(html.getAttribute('lang') || SOURCE_LANG).select(Number(params.count));
            } catch (e) { /* no plural rules for this language: use "other" */ }
            value = value[category] !== undefined ? value[category] : value.other;
        }
        if (typeof value !== 'string') return String(key);
        return value.replace(/\{(\w+)\}/g, function (match, name) {
            return params && params[name] !== undefined && params[name] !== null ? String(params[name]) : match;
        });
    }

    // --- Browser translation (fallback when the portal does not have a language) ---
    // The Translator API (window.Translator, Chrome and Edge 138+) translates text on the device
    // with a language model the browser downloads once. Text nodes and the attributes that are
    // read out (alt, aria-label, title, placeholder, data-tooltip) are translated one by one, so
    // the markup (links, bold words, hidden notes) stays as it is; content that the scripts add
    // later (dialogs, the figure, the article cards) is translated as it appears. Elements marked
    // translate="no" or with a lang of their own (a national website's name) are left alone.
    var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, TEXTAREA: 1, CODE: 1, PRE: 1 };
    var ATTRIBUTES = ['alt', 'aria-label', 'title', 'placeholder', 'data-tooltip'];
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var LETTER = /[^\W\d_]/;
    var CONCURRENCY = 4;

    var browser = {
        active: null,       // the language the page is (being) translated into
        translator: null,
        observer: null,
        pending: 0,
        translatedText: new WeakMap(),       // text node -> the value this script set
        translatedAttributes: new WeakMap()  // element -> { attribute: value this script set }
    };

    function supported() {
        return typeof self.Translator !== 'undefined' && typeof self.Translator.create === 'function';
    }

    // 'available', 'downloadable', 'downloading' or 'unavailable'
    function availability(code) {
        if (!supported()) return Promise.resolve('unavailable');
        try {
            return Promise.resolve(self.Translator.availability({ sourceLanguage: SOURCE_LANG, targetLanguage: code }))
                .then(function (state) { return state || 'unavailable'; }, function () { return 'unavailable'; });
        } catch (e) {
            return Promise.resolve('unavailable');
        }
    }

    function translatable(element) {
        for (var e = element; e && e.nodeType === 1; e = e.parentNode) {
            if (e === html) break;
            if (SKIP_TAGS[e.tagName] || e.namespaceURI === SVG_NS) return false;
            if (e.getAttribute('translate') === 'no' || e.classList.contains('notranslate')) return false;
            var lang = e.getAttribute('lang');
            if (lang && primary(lang) !== SOURCE_LANG) return false;
        }
        return true;
    }

    function textNodesIn(root) {
        var nodes = [];
        if (root.nodeType === 3) {
            if (LETTER.test(root.nodeValue) && translatable(root.parentNode)) nodes.push(root);
            return nodes;
        }
        if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return nodes;
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                return LETTER.test(node.nodeValue) && translatable(node.parentNode)
                    ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        var node;
        while ((node = walker.nextNode())) nodes.push(node);
        return nodes;
    }

    function elementsIn(root) {
        if (root.nodeType !== 1) return [];
        var elements = [root];
        Array.prototype.push.apply(elements, root.querySelectorAll('*'));
        return elements;
    }

    // Translate a string, keeping the white space around it
    function translateText(text) {
        var match = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
        return Promise.resolve(browser.translator.translate(match[2])).then(function (result) {
            return match[1] + result + match[3];
        });
    }

    // Run the tasks (functions returning promises) a few at a time
    function runAll(tasks) {
        var index = 0;
        var worker = function () {
            if (index >= tasks.length) return Promise.resolve();
            var task = tasks[index++];
            return task().catch(function () { /* one failed text: leave it in English */ }).then(worker);
        };
        var workers = [];
        for (var i = 0; i < CONCURRENCY; i++) workers.push(worker());
        return Promise.all(workers);
    }

    function tasksFor(root) {
        var tasks = [];
        textNodesIn(root).forEach(function (node) {
            if (browser.translatedText.get(node) === node.nodeValue) return;
            tasks.push(function () {
                var original = node.nodeValue;
                return translateText(original).then(function (translated) {
                    if (node.nodeValue !== original) return; // changed meanwhile
                    browser.translatedText.set(node, translated);
                    node.nodeValue = translated;
                });
            });
        });
        elementsIn(root).forEach(function (element) {
            if (!translatable(element)) return;
            ATTRIBUTES.forEach(function (attribute) {
                var value = element.getAttribute(attribute);
                if (!value || !LETTER.test(value)) return;
                var done = browser.translatedAttributes.get(element) || {};
                if (done[attribute] === value) return;
                tasks.push(function () {
                    return translateText(value).then(function (translated) {
                        if (element.getAttribute(attribute) !== value) return;
                        done = browser.translatedAttributes.get(element) || {};
                        done[attribute] = translated;
                        browser.translatedAttributes.set(element, done);
                        element.setAttribute(attribute, translated);
                    });
                });
            });
        });
        return tasks;
    }

    function translateRoot(root) {
        var tasks = tasksFor(root);
        if (!tasks.length) return Promise.resolve();
        browser.pending += 1;
        return runAll(tasks).then(function () { browser.pending -= 1; });
    }

    // Content added or changed later is translated as it appears
    function observe() {
        if (browser.observer || typeof MutationObserver === 'undefined') return;
        var queue = [];
        var scheduled = false;
        var flush = function () {
            scheduled = false;
            var roots = queue.splice(0);
            roots.forEach(function (root) {
                if (root.isConnected) translateRoot(root);
            });
        };
        var enqueue = function (node) {
            queue.push(node);
            if (!scheduled) {
                scheduled = true;
                setTimeout(flush, 50);
            }
        };
        browser.observer = new MutationObserver(function (records) {
            records.forEach(function (record) {
                if (record.type === 'childList') {
                    Array.prototype.forEach.call(record.addedNodes, enqueue);
                } else if (record.type === 'characterData') {
                    enqueue(record.target);
                } else if (record.type === 'attributes') {
                    enqueue(record.target);
                }
            });
        });
        browser.observer.observe(document.body, {
            childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES
        });
    }

    // Translate the page into the language; onProgress(fraction) reports the download of the
    // language model when the browser does not have it yet. Resolves when the page is translated.
    function translatePage(code, onProgress) {
        if (!supported()) return Promise.reject(new Error('unsupported'));
        if (browser.active === code && browser.translator) return Promise.resolve();
        var options = { sourceLanguage: SOURCE_LANG, targetLanguage: code };
        if (onProgress) {
            options.monitor = function (monitor) {
                monitor.addEventListener('downloadprogress', function (e) {
                    onProgress(typeof e.loaded === 'number' && e.total ? e.loaded / e.total : e.loaded);
                });
            };
        }
        return Promise.resolve(self.Translator.create(options)).then(function (translator) {
            browser.translator = translator;
            browser.active = code;
            html.setAttribute('data-translation', 'browser');
            showNotice('browser');
            // watch from the start, so content that arrives during the first pass (the
            // article cards, the figure) is not missed; text this script set is skipped
            observe();
            var roots = [document.body];
            var title = document.querySelector('head > title');
            if (title && title.firstChild) roots.push(title.firstChild);
            return Promise.all(roots.map(translateRoot)).then(function () {
                html.setAttribute('lang', code);
            });
        });
    }

    // The notice under the purple banner: filled by the build on translated pages; here for a
    // page the browser translates (ours, or the browser's own feature: Chrome marks <html> with
    // the class translated-ltr/translated-rtl)
    function showNotice(kind) {
        var notice = document.querySelector('.translation-notice');
        if (!notice || notice.getAttribute('data-notice') === kind) return;
        if (!window.AYA_STRINGS) {
            document.addEventListener('DOMContentLoaded', function () { showNotice(kind); }, { once: true });
            return;
        }
        notice.setAttribute('data-notice', kind);
        notice.setAttribute('role', 'note');
        notice.textContent = '';
        var text = document.createElement('span');
        text.textContent = t('language.noticeBrowser');
        notice.appendChild(text);
        notice.appendChild(document.createTextNode(' '));
        var original = document.createElement('button');
        original.type = 'button';
        original.className = 'translation-notice-link';
        original.textContent = t('language.browserOriginal');
        original.addEventListener('click', function () { showOriginal(); });
        notice.appendChild(original);
        notice.hidden = false;
    }

    // Back to English: the choice becomes English, and the page is loaded afresh
    function showOriginal() {
        choose(SOURCE_LANG, 'site');
        var url = urlFor(SOURCE_LANG);
        if (url && url !== location.href) location.replace(url);
        else location.reload();
    }

    // The browser's own translate feature (Chrome, Edge) rewrites the page itself; show the
    // notice then too, so the reader knows the portal did not make the translation
    function watchBuiltInTranslation() {
        if (typeof MutationObserver === 'undefined') return;
        var check = function () {
            if (browser.active) return;
            if (/\btranslated-(ltr|rtl)\b/.test(html.className)) {
                html.setAttribute('data-translation', 'browser');
                showNotice('browser');
            }
        };
        new MutationObserver(check).observe(html, { attributes: true, attributeFilter: ['class'] });
        check();
    }

    // A remembered browser translation is applied again on every page, as soon as the page has
    // loaded; when the browser still has to download the language, the reader is asked first
    // (a download needs a click), through the Language button.
    function resumeBrowserTranslation() {
        var chosen = choice();
        if (!chosen || chosen.mode !== 'browser' || chosen.code === pageLang()) return;
        if (!supported()) return;
        availability(chosen.code).then(function (state) {
            if (state === 'available') {
                translatePage(chosen.code).catch(function () { /* the dialog offers it again */ });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        watchBuiltInTranslation();
        resumeBrowserTranslation();
    });

    // Languages the browser could be asked to translate into (for the Language dialog): the
    // European languages, without English and without the languages the portal has itself
    var BROWSER_LANGUAGE_CODES = ['bg', 'cs', 'da', 'de', 'el', 'es', 'et', 'fi', 'fr', 'ga', 'hr', 'hu', 'is',
        'it', 'lt', 'lv', 'mt', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sq', 'sr', 'sv', 'tr', 'uk'];

    // The name of a language in that language ("nl" -> "Nederlands"), from the browser
    function nativeName(code) {
        try {
            var name = new Intl.DisplayNames([code], { type: 'language' }).of(code);
            return name ? name.charAt(0).toUpperCase() + name.slice(1) : code;
        } catch (e) {
            return code;
        }
    }

    window.AYA_I18N = {
        languages: languages,
        sourceLang: SOURCE_LANG,
        siteRoot: siteRoot ? siteRoot.href : null, // the address of web/, for data and images
        pageLang: pageLang,
        available: available,
        urlFor: urlFor,
        choice: choice,
        choose: choose,
        browserLanguages: browserLanguages,
        nativeName: nativeName,
        browser: {
            supported: supported,
            availability: availability,
            translatePage: translatePage,
            showOriginal: showOriginal,
            candidates: function () {
                return BROWSER_LANGUAGE_CODES.filter(function (code) { return !available(code); });
            },
            active: function () { return browser.active; }
        }
    };
    window.t = t;
})();
