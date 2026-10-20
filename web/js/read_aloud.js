/**
 * STRONG-AYA Info Portal — read aloud (the Audio button)
 * Reads the main content of the page with the browser's own speech
 * synthesis (the Web Speech API): no account, no server, no third party.
 * - What is read: the blocks of <main> in document order (title,
 *   statement, the figure's accessible summary, support text, article
 *   titles, info note). Header, footer, navigation, filters, hidden and
 *   decorative text, and anything marked data-read="skip", are left out.
 * - One sentence (or one short block) per utterance, never more than
 *   about 200 characters, so Chrome's cut-off with online voices cannot
 *   bite; the block being read is highlighted and scrolled into view.
 *   The text is taken from the page when a block is due, so the article
 *   cards, the figure after a filter change and a browser translation
 *   are read as they are at that moment.
 * - The language of an utterance comes from the closest lang attribute;
 *   the voice from the device, local voices first. An online voice
 *   (Google in Chrome, Microsoft in Edge: the text then leaves the
 *   device) is used only after the visitor agrees, for this visit. With
 *   no voice for the language, a dialog names the browser's own
 *   read-aloud feature and how to add a voice.
 * - Controls: the Audio button (play/pause) and a small toolbar under
 *   the accessibility bar (play/pause, stop, previous, next, speed and a
 *   status line). Never autoplay; only the speed is remembered.
 * See docs/plan_audio_read_aloud.md. Speaking one utterance is kept in
 * one place (speakUtterance), so that pre-generated audio files could
 * take its place later without touching the rest.
 */
(function () {
    'use strict';

    var synth = window.speechSynthesis;
    var MAX_CHARS = 200;
    var RATE_KEY = 'aya-read-rate';
    var CONSENT_KEY = 'aya-read-online-voice';
    var KEEP_ALIVE_MS = 10000;
    var RATES = [
        { value: 0.8, key: 'speedSlow' },
        { value: 1, key: 'speedNormal' },
        { value: 1.25, key: 'speedFast' },
        { value: 1.5, key: 'speedFaster' }
    ];

    // Never read (the whole subtree); see the plan, section 6
    var SKIP = 'header, footer, nav, script, style, svg, dialog, template, [hidden], [aria-hidden="true"], ' +
        '.visually-hidden, .accessibility-strip, .page-toolbar, .filter-bar, .topic-nav, .explore-topics-wrap, ' +
        '.tile-divider, .read-aloud-bar, .legend-container, .table-note, .bc-insert-source, .bc-card-meta, ' +
        '.bc-insert-more, .bc-card-type, .bc-card:not(.bc-card-national) .bc-card-excerpt, .translation-notice, ' +
        '[data-read="skip"]';
    // A block is the unit of highlighting; its text is read sentence by sentence
    var BLOCKS = 'h1, h2, h3, h4, p, li, dt, dd, caption, tr, .subject-label, .icon-category-header, ' +
        '[role="img"][aria-label]';
    var LETTER = /[^\W\d_]/;

    function t(key, params) {
        return typeof window.t === 'function' ? window.t('readAloud.' + key, params) : key;
    }

    function readStorage(storage, key) {
        try {
            return window[storage].getItem(key);
        } catch (e) {
            return null;
        }
    }

    function writeStorage(storage, key, value) {
        try {
            window[storage].setItem(key, value);
        } catch (e) { /* storage unavailable: the setting holds on this page only */ }
    }

    function primary(tag) {
        return String(tag || '').replace('_', '-').split('-')[0].toLowerCase();
    }

    function region(tag) {
        var parts = String(tag || '').replace('_', '-').split('-');
        return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
    }

    function pageLang() {
        return document.documentElement.getAttribute('lang') || 'en';
    }

    // The language of an element: its closest lang attribute, else the page's
    function langOf(element) {
        var el = element && element.nodeType === 1 ? element : (element ? element.parentNode : null);
        var carrier = el && el.closest ? el.closest('[lang]') : null;
        return (carrier && carrier.getAttribute('lang')) || pageLang();
    }

    // --- What is read ---

    function skipped(element) {
        return element.nodeType === 1 && element.matches(SKIP);
    }

    // Is anything between the element and the block (exclusive) skipped?
    function skippedWithin(element, block) {
        for (var e = element; e && e !== block; e = e.parentNode) {
            if (skipped(e)) return true;
        }
        return false;
    }

    // The readable blocks of <main>, in document order
    function collectBlocks(root) {
        var blocks = [];
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
            acceptNode: function (element) {
                if (skipped(element)) return NodeFilter.FILTER_REJECT;
                if (element.matches(BLOCKS)) {
                    blocks.push(element);
                    return NodeFilter.FILTER_REJECT; // no blocks inside a block
                }
                return NodeFilter.FILTER_SKIP;
            }
        });
        while (walker.nextNode()) { /* the filter collects */ }
        return blocks;
    }

    // Runs of text of a block with their language, hidden parts left out
    function textRuns(block) {
        if (block.matches('[role="img"][aria-label]')) {
            return [{ text: block.getAttribute('aria-label') || '', lang: langOf(block) }];
        }
        var runs = [];
        var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                return skippedWithin(node.parentNode, block) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }
        });
        var node;
        while ((node = walker.nextNode())) {
            var lang = langOf(node.parentNode);
            var last = runs[runs.length - 1];
            // a table row is read cell by cell
            var cellBreak = block.tagName === 'TR' && last && last.cell !== node.parentNode.closest('th, td');
            if (last && last.lang === lang && !cellBreak) {
                last.text += node.nodeValue;
            } else {
                runs.push({ text: (cellBreak ? ', ' : '') + node.nodeValue, lang: lang,
                    cell: block.tagName === 'TR' ? node.parentNode.closest('th, td') : null });
            }
        }
        return runs;
    }

    function splitLong(text, pattern) {
        return text.replace(pattern, '$1\u0000').split('\u0000');
    }

    // Sentences of at most MAX_CHARS: split after . ! ? : then at ; and , then at a space
    function sentences(text) {
        var pieces = [];
        splitLong(text, /([.!?:])\s+/g).forEach(function (piece) {
            if (piece.length <= MAX_CHARS) {
                pieces.push(piece);
                return;
            }
            splitLong(piece, /([;,])\s+/g).forEach(function (part) {
                while (part.length > MAX_CHARS) {
                    var cut = part.lastIndexOf(' ', MAX_CHARS);
                    if (cut <= 0) cut = MAX_CHARS;
                    pieces.push(part.slice(0, cut));
                    part = part.slice(cut).trim();
                }
                pieces.push(part);
            });
        });
        return pieces.map(function (piece) { return piece.trim(); }).filter(function (piece) { return LETTER.test(piece); });
    }

    // The utterances of a block: { text, lang }, one sentence each
    function utterancesOf(block) {
        var list = [];
        textRuns(block).forEach(function (run) {
            var text = run.text.replace(/\s+/g, ' ').trim();
            if (!LETTER.test(text)) return;
            sentences(text).forEach(function (sentence) {
                list.push({ text: sentence, lang: run.lang });
            });
        });
        return list;
    }

    // --- Voices ---

    function allVoices() {
        try {
            return synth.getVoices() || [];
        } catch (e) {
            return [];
        }
    }

    // The voices for a language, best first: installed on the device,
    // then the region of the page or the browser, eSpeak last, then the
    // browser's default. Never by name: names differ per device.
    function voicesFor(lang) {
        var want = primary(lang);
        var wantRegion = region(lang) || region(navigator.language);
        var ranked = allVoices().map(function (voice, order) { return { voice: voice, order: order }; })
            .filter(function (item) { return primary(item.voice.lang) === want; });
        var score = function (item) {
            var v = item.voice;
            return (v.localService ? 0 : 100) + (region(v.lang) === wantRegion ? 0 : 10) +
                (/^espeak/i.test(v.name) ? 50 : 0) + (v.default ? 0 : 1);
        };
        ranked.sort(function (a, b) { return (score(a) - score(b)) || (a.order - b.order); });
        return ranked.map(function (item) { return item.voice; });
    }

    // "Google" for Chrome's online voices, "Microsoft" for Edge's, else the voice's name
    function makerOf(voice) {
        if (/^Google/i.test(voice.name)) return 'Google';
        if (/Microsoft/i.test(voice.name) || /Online/i.test(voice.name)) return 'Microsoft';
        return voice.name;
    }

    function consented() {
        return readStorage('sessionStorage', CONSENT_KEY) === '1';
    }

    // --- The reader ---

    var reader = {
        state: 'idle',       // idle, speaking, paused
        blocks: [],
        index: 0,
        utterances: [],
        uIndex: 0,
        voice: null,         // the voice for the page language, chosen per run
        rate: 1,
        current: null,       // the utterance being spoken
        keepAlive: null,
        main: null,
        bar: null,
        status: null,
        audioButtons: [],
        highlighted: null
    };

    function isDesktopChromium() {
        var ua = navigator.userAgent;
        return /Chrom(e|ium)\//.test(ua) && !/Android|Mobile|iPhone|iPad/.test(ua);
    }

    function setStatus(text) {
        if (reader.status) reader.status.textContent = text;
    }

    function highlight(block) {
        clearHighlight();
        if (!block) return;
        block.classList.add('reading-now');
        reader.highlighted = block;
        try {
            var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            block.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
        } catch (e) { /* older browser: no scrolling */ }
    }

    function clearHighlight() {
        if (reader.highlighted) reader.highlighted.classList.remove('reading-now');
        reader.highlighted = null;
    }

    function updateButtons() {
        var speaking = reader.state === 'speaking';
        var label = reader.state === 'speaking' ? t('pause')
            : reader.state === 'paused' ? t('resume')
                : (reader.voice ? t('button', { voice: reader.voice.name }) : t('title'));
        reader.audioButtons.forEach(function (btn) {
            btn.setAttribute('aria-pressed', String(reader.state !== 'idle'));
            btn.classList.toggle('active', reader.state !== 'idle');
            btn.setAttribute('aria-label', label);
            btn.title = label;
        });
        if (reader.bar) {
            var play = reader.bar.querySelector('.read-play');
            play.setAttribute('aria-label', speaking ? t('pause') : (reader.state === 'paused' ? t('resume') : t('play')));
            play.title = play.getAttribute('aria-label');
            play.querySelector('i').className = speaking ? 'fas fa-pause' : 'fas fa-play';
            reader.bar.querySelector('.read-prev').disabled = reader.index <= 0;
            reader.bar.querySelector('.read-next').disabled = reader.index >= reader.blocks.length - 1;
        }
    }

    function startKeepAlive(voice) {
        stopKeepAlive();
        // Chrome stops an online voice after about 15 s; pausing and resuming keeps it going (desktop only:
        // on Android pause() cancels)
        if (!voice || voice.localService || !isDesktopChromium()) return;
        reader.keepAlive = setInterval(function () {
            if (reader.state === 'speaking' && synth.speaking && !synth.paused) {
                synth.pause();
                synth.resume();
            }
        }, KEEP_ALIVE_MS);
    }

    function stopKeepAlive() {
        if (reader.keepAlive) clearInterval(reader.keepAlive);
        reader.keepAlive = null;
    }

    function cancelSpeech() {
        reader.current = null;
        stopKeepAlive();
        try {
            synth.cancel();
        } catch (e) { /* nothing to cancel */ }
    }

    // One utterance, in its language, with the best voice for it (the
    // page voice when the fragment's language has none). The only place
    // that speaks: pre-generated audio could replace it.
    function speakUtterance(utterance) {
        var speech = new SpeechSynthesisUtterance(utterance.text);
        var voice = primary(utterance.lang) === primary(pageLang()) ? reader.voice : (voicesFor(utterance.lang)[0] || reader.voice);
        if (voice && !voice.localService && !consented()) voice = reader.voice;
        speech.lang = voice ? voice.lang : utterance.lang;
        if (voice) speech.voice = voice;
        speech.rate = reader.rate;
        speech.onend = function () {
            if (reader.current !== speech) return; // cancelled meanwhile
            reader.current = null;
            speakNext();
        };
        speech.onerror = function (event) {
            if (reader.current !== speech) return;
            var code = event && event.error;
            if (code === 'interrupted' || code === 'canceled') return;
            reader.current = null;
            fail();
        };
        reader.current = speech;
        try {
            synth.speak(speech);
        } catch (e) {
            reader.current = null;
            fail();
            return;
        }
        startKeepAlive(voice);
    }

    function speakNext() {
        if (reader.state !== 'speaking') return;
        if (reader.uIndex >= reader.utterances.length) {
            reader.index += 1;
            speakBlock();
            return;
        }
        speakUtterance(reader.utterances[reader.uIndex++]);
    }

    function speakBlock() {
        if (reader.state !== 'speaking') return;
        // the page may have changed (article cards, a new figure): take the blocks afresh when one is gone
        if (reader.index < reader.blocks.length && !reader.blocks[reader.index].isConnected) {
            reader.blocks = collectBlocks(reader.main);
        }
        if (reader.index >= reader.blocks.length) {
            finish();
            return;
        }
        var block = reader.blocks[reader.index];
        reader.utterances = utterancesOf(block);
        reader.uIndex = 0;
        if (!reader.utterances.length) {
            reader.index += 1;
            speakBlock();
            return;
        }
        highlight(block);
        setStatus(t('statusReading', { current: reader.index + 1, total: reader.blocks.length }));
        updateButtons();
        speakNext();
    }

    function finish() {
        cancelSpeech();
        reader.state = 'idle';
        reader.index = 0;
        clearHighlight();
        setStatus(t('statusDone'));
        updateButtons();
    }

    function fail() {
        cancelSpeech();
        reader.state = 'idle';
        clearHighlight();
        setStatus(t('failed'));
        updateButtons();
    }

    function stop() {
        cancelSpeech();
        reader.state = 'idle';
        reader.index = 0;
        clearHighlight();
        setStatus('');
        if (reader.bar) reader.bar.hidden = true;
        updateButtons();
    }

    // Pause is "stop here, remember the sentence": pause() is unreliable
    // (on Android it cancels), and the sentence is short enough to repeat
    function pause() {
        cancelSpeech();
        reader.state = 'paused';
        reader.uIndex = Math.max(0, reader.uIndex - 1);
        setStatus(t('statusPaused'));
        updateButtons();
    }

    function resume() {
        reader.state = 'speaking';
        setStatus(t('statusReading', { current: reader.index + 1, total: reader.blocks.length }));
        updateButtons();
        if (reader.utterances.length) speakNext();
        else speakBlock();
    }

    function jumpTo(index) {
        cancelSpeech();
        reader.index = Math.max(0, Math.min(index, reader.blocks.length - 1));
        reader.utterances = [];
        reader.uIndex = 0;
        if (reader.state === 'speaking') {
            speakBlock();
        } else {
            reader.state = 'paused';
            highlight(reader.blocks[reader.index]);
            setStatus(t('statusPaused'));
            updateButtons();
        }
    }

    // --- Starting: the voice for the page, with the dialogs ---

    function openDialog(title, intro, bodyHtml, action) {
        if (window.AYA_PORTAL && window.AYA_PORTAL.openModal) {
            window.AYA_PORTAL.openModal(title, intro, bodyHtml, action);
        } else {
            window.alert(title + '\n\n' + intro);
        }
    }

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // The browser's own read-aloud feature and how to add a voice, for this browser and device (coarse)
    function helpKeys() {
        var ua = navigator.userAgent;
        var ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        if (ios) return ['helpSafariIos'];
        if (/Android/.test(ua)) return ['helpChromeAndroid'];
        var keys = [];
        if (/Edg\//.test(ua)) keys.push('helpEdge');
        else if (/Firefox\//.test(ua)) keys.push('helpFirefox');
        else if (/Chrome\//.test(ua)) keys.push('helpChromeDesktop');
        if (/Windows/.test(ua)) keys.push('helpWindows');
        else if (/Mac OS X/.test(ua)) keys.push('helpMacos');
        else if (/Linux/.test(ua) && keys.indexOf('helpFirefox') < 0) keys.push('helpFirefox');
        return keys.length ? keys : ['helpChromeDesktop'];
    }

    function helpHtml() {
        return helpKeys().map(function (key) { return '<p>' + escapeHtml(t(key)) + '</p>'; }).join('');
    }

    function languageName(lang) {
        var i18n = window.AYA_I18N;
        return i18n && i18n.nativeName ? i18n.nativeName(primary(lang)) : primary(lang);
    }

    function noVoiceDialog(lang) {
        openDialog(t('noVoiceTitle', { language: languageName(lang) }),
            t('noVoiceIntro', { language: languageName(lang) }), '<div class="read-help">' + helpHtml() + '</div>');
    }

    function unsupportedDialog() {
        openDialog(t('title'), t('unsupportedIntro'), '<div class="read-help">' + helpHtml() + '</div>');
    }

    // Start reading from a block with a voice for the page language;
    // called from a click (speech needs a user gesture)
    function start(fromIndex) {
        if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
            unsupportedDialog();
            return;
        }
        var lang = pageLang();
        var voices = voicesFor(lang);
        if (!voices.length) {
            noVoiceDialog(lang);
            return;
        }
        var voice = voices[0];
        var begin = function () {
            reader.voice = voice;
            reader.blocks = collectBlocks(reader.main);
            if (!reader.blocks.length) {
                setStatus(t('statusNothing'));
                return;
            }
            reader.index = Math.max(0, Math.min(fromIndex || 0, reader.blocks.length - 1));
            reader.utterances = [];
            reader.uIndex = 0;
            reader.state = 'speaking';
            if (reader.bar) reader.bar.hidden = false;
            speakBlock();
        };
        if (voice.localService || consented()) {
            begin();
            return;
        }
        // Only an online voice: the text of the page would go to its maker; ask first
        var maker = makerOf(voice);
        openDialog(t('onlineVoiceTitle'), t('onlineVoiceIntro', { voice: voice.name, maker: maker }), '', {
            label: t('onlineVoiceContinue'),
            run: function () {
                writeStorage('sessionStorage', CONSENT_KEY, '1');
                begin();
            }
        });
    }

    // A browser translation in progress rewrites the text: wait for its first pass
    function startWhenReady(fromIndex) {
        var i18n = window.AYA_I18N;
        var pending = i18n && i18n.browser && i18n.browser.pending ? i18n.browser.pending() : null;
        if (pending) {
            setStatus(t('waitTranslation'));
            if (reader.bar) reader.bar.hidden = false;
            pending.then(function () { start(fromIndex); }, function () { start(fromIndex); });
            return;
        }
        start(fromIndex);
    }

    function toggle() {
        if (reader.state === 'speaking') pause();
        else if (reader.state === 'paused') resume();
        else startWhenReady(0);
    }

    // --- The toolbar ---

    function buildBar() {
        var bar = document.createElement('div');
        bar.className = 'read-aloud-bar';
        bar.setAttribute('role', 'group');
        bar.setAttribute('aria-label', t('title'));
        bar.hidden = true;
        var button = function (cls, icon, label) {
            return '<button type="button" class="read-btn ' + cls + '" aria-label="' + escapeHtml(label) + '" title="' +
                escapeHtml(label) + '"><i class="fas ' + icon + '" aria-hidden="true"></i></button>';
        };
        bar.innerHTML =
            button('read-play', 'fa-play', t('play')) +
            button('read-stop', 'fa-stop', t('stop')) +
            button('read-prev', 'fa-backward-step', t('previous')) +
            button('read-next', 'fa-forward-step', t('next')) +
            '<label class="read-speed"><span>' + escapeHtml(t('speed')) + '</span><select class="read-rate">' +
            RATES.map(function (rate) {
                return '<option value="' + rate.value + '"' + (rate.value === reader.rate ? ' selected' : '') + '>' +
                    escapeHtml(t(rate.key)) + '</option>';
            }).join('') + '</select></label>' +
            '<span class="read-status" role="status" aria-live="polite"></span>';
        bar.querySelector('.read-play').addEventListener('click', toggle);
        bar.querySelector('.read-stop').addEventListener('click', stop);
        bar.querySelector('.read-prev').addEventListener('click', function () { jumpTo(reader.index - 1); });
        bar.querySelector('.read-next').addEventListener('click', function () { jumpTo(reader.index + 1); });
        bar.querySelector('.read-rate').addEventListener('change', function (e) {
            reader.rate = parseFloat(e.target.value) || 1;
            writeStorage('localStorage', RATE_KEY, String(reader.rate));
        });
        reader.status = bar.querySelector('.read-status');
        return bar;
    }

    document.addEventListener('DOMContentLoaded', function () {
        reader.main = document.querySelector('main');
        reader.audioButtons = Array.prototype.slice.call(document.querySelectorAll('.audio-btn'));
        if (!reader.main || !reader.audioButtons.length) return;

        var storedRate = parseFloat(readStorage('localStorage', RATE_KEY));
        if (RATES.some(function (rate) { return rate.value === storedRate; })) reader.rate = storedRate;

        reader.bar = buildBar();
        var strip = reader.main.querySelector('.accessibility-strip');
        if (strip) strip.insertAdjacentElement('afterend', reader.bar);
        else reader.main.insertBefore(reader.bar, reader.main.firstChild);

        reader.audioButtons.forEach(function (btn) {
            btn.addEventListener('click', toggle);
        });
        updateButtons();

        // The voice list arrives asynchronously in some browsers; the
        // button's name shows the voice once it is known
        if (synth) {
            var refresh = function () {
                if (reader.state === 'idle' && !reader.voice) {
                    var voice = voicesFor(pageLang())[0];
                    if (voice && (voice.localService || consented())) {
                        reader.voice = voice;
                        updateButtons();
                    }
                }
            };
            refresh();
            if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refresh);
        }

        // A click on a block while reading starts from that block (links and buttons keep working)
        reader.main.addEventListener('click', function (e) {
            if (reader.state === 'idle') return;
            if (e.target.closest('a, button, select, input, label, dialog, .read-aloud-bar')) return;
            var block = e.target.closest(BLOCKS);
            var index = block ? reader.blocks.indexOf(block) : -1;
            if (index >= 0) jumpTo(index);
        });

        // Speech must not outlive the page (the Language and Country choices navigate)
        window.addEventListener('pagehide', function () {
            if (reader.state !== 'idle') stop();
        });
    });

    window.AYA_READ_ALOUD = { toggle: toggle, stop: stop, state: function () { return reader.state; } };
})();
