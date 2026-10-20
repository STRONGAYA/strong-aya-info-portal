imp# Plan: the "Audio" button — read the page aloud with the visitor's own browser

Status: investigation, 20 October 2026. Nothing implemented.

The accessibility bar of every page has an **Audio** button that still carries the "Coming soon" tooltip. This
document answers one question: can "read this page aloud" be built with what the visitor's browser already offers,
without a server of our own and without sending the text of the page to a third party, and how. Everything marked
*verified* was checked on 20 October 2026 against the source named in section 11; everything marked *reported* comes
from developer write-ups or bug trackers and must be confirmed on real devices during the test phase (section 9).

## 0. Decisions in one paragraph

Use the **Web Speech API** (`speechSynthesis` / `SpeechSynthesisUtterance`), which every current browser has and which
needs no account, no key, no build step and no third party. Read the main content of the page in document order, one
block or sentence per utterance (never more than about 200 characters, which also sidesteps Chrome's cut-off), and
highlight the block being read. Use a voice that is **installed on the device** for the language of the page; when the
only voice for that language is an online one (Chrome's "Google …" voices, Edge's "… Online (Natural)" voices), say so
and ask before using it, because the text then goes to Google or Microsoft; when there is no voice at all, say so and
point to the browser's own read-aloud feature and to the voice settings of the device. Play/pause/stop and a speed
control in a small toolbar under the accessibility bar, never autoplay, nothing remembered except the speed. Expect
honest limitations: voice quality and availability differ per device (Windows has no natural Dutch, Italian, Polish or
Romanian voice; iOS exposes only its compact voices to web pages; Linux often has none), word-level highlighting is
not reliable anywhere, and mobile browsers stop speaking when the screen locks. Pre-generated audio files (Mistral's Voxtral
TTS at build time, the only provider the maintainers allow, or a self-run open-weight model) remain the second step
"if need be" (§5.1), at about 6 MB and under one euro per language per build, for the static text only: they would not
follow the weekly beatcancer.eu titles or the browser translation, so they are not the first step.

## 1. What has to be read (measured 20 October 2026)

Measured with a throw-away `html.parser` script on the 17 English pages, counting the text inside `<main>` without
the accessibility bar, page toolbar, filter bar, topic navigation, "Explore all topics", visually-hidden spans and
`aria-hidden` elements:

| Page | Words in the HTML | Characters | Added by the scripts at run time |
|---|---|---|---|
| topic pages (14, e.g. `module_c/anxiety.html`) | 114–122 each | 680–725 each | figure summary (`aria-label`, ~200 chars), legend (150–400 chars), 3–4 beatcancer.eu titles (~250 chars, English), national website card (~200 chars): ~1,000 chars in total |
| `index.html` | 54 | 328 | — |
| `modules.html` | 62 | 397 | subject cards |
| `login.html` | 33 | 194 | — |

So a topic page is about **1,500–1,700 characters, 250–300 words, 1.5–2 minutes of speech** at a typical rate of
150 words per minute, not the ~2,000 words per page this investigation was briefed with. The whole portal is about
**25,000 characters per language**, close to the 21,500 unique characters DeepL translates (the DeepL translation, "Languages" in
`README.md`). The numbers in section 5 give both figures, measured and briefed, so the comparison holds if the pages grow.

## 2. The Web Speech API: facts that shape the design

### 2.1 Support (verified)

- caniuse "Speech Synthesis API" (20 October 2026): Chrome 33+, Edge 14+ and 79+, Safari 7+, Firefox 49+ (disabled by
  default in 31–48), Safari on iOS 7+, Chrome for Android, Firefox for Android, Samsung Internet 5+; not in Opera Mini.
  Global usage 95.9 %. No partial-support notes.
- MDN `SpeechSynthesis`: "Baseline: Widely available … available across browsers since September 2018". The
  `boundary` event is the exception: "Limited availability — not Baseline because it does not work in some of the most
  widely-used browsers".
- On iOS every browser (Chrome, Edge, Firefox) is a shell over WebKit, so the voices and the rules are Safari's
  (Readium documentation, and textintoaudio's table reviewed 4 October 2026).

### 2.2 Which voices exist offline, per operating system (verified unless marked)

The API lists what the operating system (or the browser maker) provides; a web page cannot ship a voice. For the
portal languages in the order of the translation plan (nl, fr, it, pl, ro, de, es, then the rest):

| OS | nl | fr | it | pl | ro | de | es | Other EU languages | Source |
|---|---|---|---|---|---|---|---|---|---|
| **Windows 10/11**, legacy ("OneCore") voices, installed per language from Settings or Narrator | Frank (nl-NL), Bart (nl-BE) | Paul, Hortence, Julie | Cosimo, Elsa | Adam, Paulina | Andrei | Stefan, Hedda, Katja | Pablo, Helena, Laura | pt-PT Helia, sv Bengt, da Helle, fi Heidi, cs Jakub, sk Filip, hu Szabolcs, el Stefanos, bg Ivan, hr Matej, sl Lado, no Jon, tr Tolga. **No et, lv, lt, ga, mt, uk** | Microsoft "Appendix A: Supported languages and voices" |
| **Windows 11** natural voices (offline once installed, 22H2+) | — | Henri, Denise | — | — | — | Conrad, Katja | Alvaro, Elvira (es-ES), Jorge, Dalia (es-MX) | pt Antonio, Francisca; en, zh, ja, ko | same page; Readium: "not properly listed in Chrome or Firefox currently", only Edge lists them |
| **macOS / iOS / iPadOS** | yes | yes (FR, BE, CA) | yes | yes | yes | yes | yes | pt, sv, da, fi, cs, sk, hu, el, bg, hr, sl, uk, tr, ca all listed under "VoiceOver, Live Speech, Read & Speak" | Apple "iOS and iPadOS 26 feature availability". Which of them a web page sees: §2.4 |
| **Android**, Google "Speech Recognition & Synthesis" engine | nl-NL, nl-BE | fr-FR, fr-CA | it | pl | ro | de | es-ES, es-US | pt, sv, da, fi, cs, sk, hu, el, bg, hr, sl, et, lv, lt, uk, tr | Wikipedia list; "Users must install voice data for each language" (Settings › Accessibility › Text-to-speech output › Install voice data). OEM engines (Samsung) differ |
| **Linux** | only what speech-dispatcher + espeak-ng/other modules provide (robotic, but every language) | | | | | | | | Mozilla KB "Speech Dispatcher required"; Chromium `tts_linux.cc` uses libspeechd |
| **Chrome, any desktop OS**: Google network voices (online only) | Google Nederlands | Google français | Google italiano | Google polski | **none** | Google Deutsch | Google español, … de Estados Unidos | pt-BR, ru; en ×3, hi, id, ja, ko, zh ×3: 19 voices, 15 languages | gist of `getVoices()` in Chrome 110, Feb 2023; Readium "19 high quality voices across 15 languages … require online access" |
| **Edge, desktop**: "Microsoft … Online (Natural)" voices (online only) | yes | yes | yes | yes | yes | yes | yes | "over 250 … across 75 languages" (April 2024) | Readium; Edge privacy statement |

Reading of the table: for the six Latin-script target languages a Windows visitor has at least one **installed** voice
once the language is added in Settings (legacy quality for nl, it, pl, ro); Apple and Android devices have voices for
all of them; Linux visitors usually have none or robotic ones. Romanian is the weakest: no Google network voice, no
Windows natural voice.

### 2.3 Local or remote: what leaves the device (verified)

- `SpeechSynthesisVoice.localService` is `true` for a voice "supplied by a local speech synthesizer service" and
  `false` for "a remote speech synthesizer service" (MDN). The Readium documentation confirms the flag "works as
  expected" for telling offline voices apart. All 19 Google voices in Chrome report `localService: false`; Apple,
  Windows and Android engine voices report `true`.
- **Edge**: Microsoft's Edge privacy statement, section "Read aloud": "Microsoft Edge uses the Web Speech API. … If
  your content is converted to speech by using a client-side library, no information is sent to Microsoft servers. If
  your content is converted to speech by using Azure Cognitive Services (as indicated by the word "Online" in any of
  the voice names), the text, along with a randomly generated token, is sent to Microsoft. … The text that's sent to
  Microsoft and the audio file that's generated are both deleted immediately after conversion occurs". The same
  voices are the "Online (Natural)" entries a page sees through `getVoices()`.
- **Chrome**: the Google voices come from a built-in component extension that calls Google's network synthesis
  (reported: puppeteer-extra issue #408; Chrome's 2014 developer post only says "Chrome might have to be online …
  examine the `localService` flag"). Google publishes no retention statement for this path that this investigation
  could find. Chromium builds without Google API keys have no such voices.
- **Safari, Firefox, Android engines**: synthesis is on the device; nothing is sent by the browser. (A third-party
  Android engine chosen by the visitor may behave differently; out of our control.)
- **Consequence for the portal**: a page that calls `speak()` with a `localService === false` voice sends the text of
  the page to Google or Microsoft. The text is public health information, no personal data, but the portal's rule
  (README, fonts self-hosted for the same reason) is that the visitor decides. Section 7.4 asks before using such a
  voice.

### 2.4 Known problems and their status on 20 October 2026

| Problem | What happens | Status | What the design does |
|---|---|---|---|
| **Chrome cut-off after ~15 s** with Google network voices | Speech stops silently; the API stays blocked until `cancel()` | Public Chromium issue 41346274 (formerly 679437) exists; the tracker now needs a Google sign-in, so the status could not be read. **Still reproduced** on Chrome/Ubuntu in a 3 November 2025 report (Caktus, citing Chromium issue 332002367), and listed as current by textintoaudio (reviewed 4 October 2026) and Readium ("utterances longer than 14 seconds trigger a bug") | Utterances of at most ~200 characters (one sentence or short block); local voices preferred. Keep-alive `pause(); resume()` every 10 s only on desktop Chromium with a remote voice (the 2025 report says `resume()` alone stopped working, the pair still works); never on Android |
| **`boundary` events** (word positions for highlighting) | Not fired by Google network voices in Chrome (Chromium issue 40715888, reported 2020; Readium: "do not return boundary events"); not on Chrome or Firefox on Android (reported); Safari gives `charIndex` but no `charLength` (reported); fired for local voices on Windows and macOS | Not Baseline (MDN) | Highlight **per block** from our own queue, not per word; use `boundary` only as a progressive enhancement where it arrives |
| **User gesture needed** | Chrome 71+ rejects `speak()` without user activation with error `not-allowed` (blink-dev "Intent to Deprecate", web-platform test `SpeechSynthesis-speak-without-activation-fails`); on iOS/WebKit the first `speak()` must run synchronously inside the tap or click handler (reported, consistent across sources) | By design, permanent | Reading only starts from a click on the Audio button or on a dialog button; the voice list is prepared beforehand so the click handler can call `speak()` synchronously |
| **`getVoices()` is asynchronous** | Chromium returns `[]` on the first call and fires `voiceschanged` later; Safari returns the list at once; Firefox after a moment; Edge on macOS lists 18 natural voices and 250+ after the first utterance (Readium) | By design | Call `getVoices()` at load and on every `voiceschanged`; the click handler uses the current list; if it is still empty, wait for `voiceschanged` once, then speak |
| **Firefox on Linux** | `getVoices()` is empty unless Speech Dispatcher ≥ 0.8.2 with a working module is installed ("Firefox depends on a minimal version of Speech Dispatcher v0.8.2", Mozilla KB) | Permanent | The "no voice" notice names the package |
| **Firefox on Windows** | Only SAPI5 "desktop" voices were listed; OneCore voices (Frank, Adam, …) arrived with Firefox 106 (Bugzilla 1544143 RESOLVED FIXED). Windows 11 natural voices are still not listed in Chrome or Firefox (Readium) | Partly fixed | Nothing to do; the test matrix covers it |
| **Safari / iOS hide voices** | `getVoices()` lists only the pre-installed set; Enhanced/Premium voices the visitor downloads and the Siri voices do not appear (WebKit bug 290497, NEW, reported 26 March 2025 against Safari 18; Apple developer forum reports since iOS 16). Readium: all voices report `default: true`; installing a higher-quality variant can make the pre-loaded one disappear | Open | Pick by `lang` and `localService`, never by name; accept compact quality on iOS; tell the visitor that Safari's own "Listen to Page" uses the better voices |
| **Android quirks** | `pause()` behaves like `cancel()` (reported by several sources; textintoaudio: "effectively unsupported in Chrome"); Chrome lists languages for which no voice data is installed and then falls back to an English voice (Readium); language tags may use `nl_NL` (Readium); Edge on Android returns no voices at all (Readium) | Open, OEM-dependent | Pause is implemented as "cancel and remember the block", resume as "speak from that block" on every platform; a notice tells how to install voice data; Edge Android gets the "no voice" notice |
| **Rate, pitch, volume** | `rate` 0.1–10 (1 = normal), `pitch` 0–2, `volume` 0–1 are in the spec; Edge's online voices ignore pitch (Readium); extreme rates are clamped per engine | — | Expose only the speed: 0.8, 1, 1.25, 1.5. No pitch, no volume (the device has one) |
| **`lang` and fallback** | The spec says the browser picks a default voice that "should support the current language" when `voice` is null; Chrome on Android needs `lang` set (reported) | — | Always set both `utterance.lang` and `utterance.voice`; when no voice matches the language, do not speak and show the notice (reading Dutch with an English voice is worse than silence) |
| **Cancel semantics** | `cancel()` may fire `error` with `interrupted`/`canceled` instead of `end` (textintoaudio) | — | The queue ignores those error codes |
| **Lifetime** | Mobile browsers stop speech when the tab is hidden or the screen locks (textintoaudio); on desktop, speech can outlive the page unless cancelled | — | `cancel()` on `pagehide` (covers the Language and Country dialogs, which navigate), and when the visitor presses Stop |
| **Pronunciation** | Abbreviations (HADS, AYA, YARN), "beatcancer.eu", dates and "3,300" are spoken as the voice guesses; SSML is not interpreted (textintoaudio) | — | Accept; a `data-read-as` attribute for a few terms is a later refinement |

## 3. The browsers' own read-aloud features (verified unless marked)

| Browser / OS | Feature | How the visitor starts it | Voices | What a page can do |
|---|---|---|---|---|
| Chrome, Android | **Listen to this page** (Chrome 125+, 2024) | ⋮ menu › *Listen to this page*; "If … isn't available in the menu, the page isn't available for playback" | Google voices, standard playback in "about 25 languages, including English, French, German, Japanese, and Spanish"; requires **"Make searches and browsing better" turned on** (page content goes to Google); AI playback English only | Nothing to trigger it. Make the page qualify: article-like structure (last paragraph of this section) |
| Chrome, desktop (Windows, macOS, Linux, ChromeOS) | **Reading mode** side panel with *Read aloud* | right-click › *Open in reading mode* or Alt+Shift+R (Cmd+Option+R); Play, previous/next sentence, speed, voice, word/sentence highlighting. "Not available on all websites" | downloaded per language on first use, system voices as fallback (reported) | Nothing to trigger it; reading mode needs the main content to be recognisable |
| Edge, desktop and mobile | **Read aloud** | right-click › *Read aloud*, Ctrl+Shift+U, or the Immersive Reader icon; words highlighted; speed; "can be used both online and offline" | installed Windows voices offline; "Online (Natural)" voices send the text to Microsoft (§2.3) | Nothing to trigger it |
| Firefox, desktop | **Reader View › Narrate** | the Reader View icon in the address bar, then the headphones button; "this option will show up only if Windows, macOS, or Linux has text-to-speech … in the language that the article is in" (Mozilla KB) | the same system voices as the Web Speech API | Reader View is "only available for articles, blog posts and other web pages that can be simplified" |
| Safari, iPhone and iPad (iOS 17+) | **Listen to Page** | Page menu (ᴬᴬ) › *Listen to Page*; pause/play in the same menu (Apple support guide) | Apple's full voices, including the downloaded ones Safari hides from pages | Needs Reader to be available for the page |
| macOS, iOS, iPadOS | **Spoken Content: Speak Selection / Speak Screen** (Settings › Accessibility › Spoken Content; two-finger swipe down from the top on iOS) | system-wide, any app | all installed voices | Nothing |
| Android | **Select to Speak** (Accessibility) | system-wide | the installed engine | Nothing |
| Windows | **Narrator** (screen reader) | Win+Ctrl+Enter | legacy and natural voices | Nothing |

No browser exposes an API, URL scheme or intent to start its read-aloud feature from a page: the help pages above
describe menus and shortcuts only, and the Web Speech specification contains nothing of the kind. What the page **can**
do is qualify for reading mode and Reader View: one `<main>` with one `<h1>`, headings in order, paragraphs rather than
`<div>` text, `lang` on `<html>` and on every foreign-language fragment, decorative icons `aria-hidden`, the figure with
an `aria-label` that reads as a sentence, no text in images. The portal already does all of this (the `translate_site`
extractor depends on it), so the browser features are a workable fallback today, with the caveat that Chrome Android's
"Listen to this page" is not offline and sends the page to Google, and that none of them highlights in our layout.

## 4. Accessibility guidance (verified)

- **WCAG 2.2** (Recommendation of 12 December 2024, 86 active success criteria): no success criterion requires
  text-to-speech or a read-aloud control. The words appear only in guideline text and definitions. Two criteria do
  apply to how the control behaves: **1.4.2 Audio Control (A)**, "If any audio on a web page plays automatically for
  more than 3 seconds, either a mechanism is available to pause or stop the audio, or … control audio volume" (so: no
  autoplay, and a visible pause/stop), and **3.1.5 Reading Level (AAA)**, whose sufficient techniques include "G79:
  Providing a spoken version of the text" and whose Understanding document notes "An audio version of the content may
  be helpful to some users".
- **EN 301 549**: clause 9 (web) is WCAG 2.1 AA; text-to-speech appears only in clause 6 (ICT with two-way voice
  communication), which does not apply to a website (reported from vendor guides; the ETSI text was not read).
- **W3C "Making Content Usable for People with Cognitive and Learning Disabilities"** (Working Group Note, 29 April
  2021): user story 3.7.2 "I need text-to-speech support, with synchronized highlighting, so I can follow along as words
  are read aloud"; Objective 8 "Support Adaptation and Personalization" and pattern 4.9.2 "Enable APIs and Extensions"
  name "support for text-to-speech with synchronized highlighting of the phrase being read"; patterns 4.4.6 and 4.4.7
  ask for clear punctuation and complete characters because "text-to-speech voices can recognize the format and phrase
  it correctly". The personas (Sam, Tal) use text-to-speech to understand text and to find content; one "does not
  like the sound of the synthesized speech".
- Who it is for: screen-reader users already have speech and will not use a page's read-aloud control (it would
  compete with their screen reader); the audience is **sighted readers** with dyslexia or reading difficulties,
  readers tired by treatment, readers of a second language, and people who prefer listening. The COGA note is the
  design reference, WCAG the behaviour baseline.
- How a read-aloud control should behave, from the above and from the browsers' own features: starts only on request;
  visible play/pause/stop with a visible focus style and an accessible name that changes with the state ("Pause",
  "Play"); synchronised highlighting of the phrase or block being read, scrolling it into view; skips hidden and
  decorative content (`[hidden]`, `aria-hidden`, visually-hidden notes written for screen readers such as "(opens in a
  new tab)"); reads the accessible description of a figure (the icon array's `aria-label`) rather than its 100
  icons; reads in the language of each fragment; the status region for the control is `role="status"` (polite) and
  short, so a screen reader that happens to be running is not flooded, and the page's existing `aria-live` statement
  is not touched.

## 5. Alternatives, for completeness

The maintainers' rule for this feature (20 October 2026): anything that does not run in the visitor's browser may use
**Mistral models only**; OpenAI, ElevenLabs, Google, Azure and Amazon speech APIs are excluded. The table keeps the
hosted read-aloud services for the record; the build-time option is worked out in §5.1 under that rule.

| Option | Where the text goes | Cost | Size on the site | Fits the portal? |
|---|---|---|---|---|
| **Web Speech API** (recommended first) | stays on the device with installed voices; to Google/Microsoft only with their online voices (§2.3) | none | ~300 lines of JS + CSS + strings | yes: no server, no account, follows every language, the browser translation and the weekly beatcancer titles |
| **ReadSpeaker webReader** (hosted button) | text is "either sent from the client web browser (POST) or fetched by our servers (GET)" and synthesised on ReadSpeaker servers (EU servers when the EU domain is used); IP addresses kept up to a month per the 2021 data-privacy document; CDN sees IP and user agent | quote-based (not published; TextAid for individuals is €49–89/year) | a script tag per page | no: a third party on every page view, a contract and a DPA; excluded by the rule above |
| **Texthelp ReachDeck** (ex BrowseAloud) | "text to be converted to speech is encrypted and posted to the Texthelp speech servers" in "a private texthelp cloud in Amazon located in North America"; translation goes to Google; anonymised Google Analytics | priced on monthly visitors (not published) | a script tag per page | no: same objections, plus US processing; excluded by the rule above |
| **AI speech model at build time** (§5.1): one audio file per block per language, generated in GitHub Actions from the translation cache, played with `<audio>` | the public page text goes to Mistral **once, at build time** (or nowhere, with a self-run open-weight model); visitors fetch static files from GitHub Pages: nothing leaves the device at run time | Mistral API: about **€0.45 per language per full build**, cents per weekly update; self-run: CPU minutes only | **~6 MB Opus per language** (measured text), ~41 MB under the briefed 2,000 words/page | possible as the second step, "if need be" (§5.1.5): one consistent, good voice per language on every device; the dynamic parts stay on the Web Speech API |

### 5.1 AI speech models at build time (verified 20 October 2026)

#### 5.1.1 What Mistral offers for speech, as of 20 October 2026

Voxtral is Mistral's speech family. It began as **speech-to-text and audio understanding** (Voxtral Small/Mini
24.07, July 2025: transcription, translation, summarisation and question answering over audio; Voxtral Transcribe 2
and Voxtral Mini Transcribe Realtime, 4 February 2026). Since **23 March 2026 Mistral also has a text-to-speech
model**, so the plain answer is: Voxtral is not *only* a transcription family any more; "Voxtral TTS" is the model
that applies here, and the transcription models do not.

| | **Voxtral TTS** (`voxtral-mini-tts-2603`, weights `mistralai/Voxtral-4B-TTS-2603`) | **Voxtral Mini TTS 3.0** / "Voxtral Speech 3" (`voxtral-mini-tts-3-0`), announced **today**, 20 October 2026, public preview |
|---|---|---|
| What it does | text-to-speech with zero-shot voice cloning from 2–25 s of reference audio, cross-lingual prompts, streaming (~90 ms time-to-first-audio), 24 kHz output | text-to-speech "built for real-time conversation", batch and realtime on the same API, "Pro Voice" adaptation from 30 minutes of audio |
| Languages | **9: English, French, Spanish, German, Italian, Portuguese, Dutch, Arabic, Hindi** (model card and docs) — so nl, fr, it, de, es, pt of the portal's list; **not Polish, not Romanian**, none of the phase-3 languages | "35+ languages and 50+ dialects" per the announcement, whose sample library shows Dutch, German, Hungarian, Italian, Norwegian, Polish, **Romanian**, Russian, Turkish, Ukrainian, Portuguese, Catalan, French, Spanish and others; no complete list yet, and the docs model page still says "Supports 9 languages" (text copied from the 2603 card, apparently). **Unverified until the model card appears** |
| Open weights and licence | yes: BF16 weights on Hugging Face under **CC BY-NC 4.0** ("the provided voice-references … are licensed under CC BY-NC 4. Thus, this model inherits the same license"): **non-commercial use only**; GGUF conversions inherit it | not stated in the announcement or the docs; the announcement says organisations "can self-deploy on their own infrastructure" (which may mean a commercial self-deployment contract rather than open weights) |
| Running it yourself | vLLM-Omni ≥ 0.18 on "a single GPU with >= 16GB memory" (model card); the vLLM recipe says ≥ 24 GB and measured ~20.5 GiB on an RTX 4090. A CPU runtime exists (CrispASR `voxtral-tts` backend, GGUF Q4 ≈ 2.4 GB, "fits comfortably in 8 GB RAM") with **no published speed**. GitHub-hosted runners for public repositories are 4 vCPU / 16 GB RAM / no GPU (GPU "larger runners" exist only on Team and Enterprise plans), so self-hosting means a university GPU machine, not the Actions job | unknown |
| API | `POST /v1/audio/speech` with `input`, `model`, `voice_id` (a preset or a voice created from a sample) or `ref_audio`, `stream`; output `pcm`, `wav`, `mp3`, `flac`, `opus`; docs advise "under 300 words" per request, numbers and abbreviations spelled out, markdown avoided; content moderation (403 on rejected text) | same endpoint |
| Price | **$16 per 1 M characters** on the docs pricing page (the March announcement called $0.016 per 1 k characters "special introductory pricing"); cached input $1.6 per 1 M | **$13 per 1 M characters** per the announcement; the docs model page shows $16 — inconsistent on day one |
| Quality claim (vendor) | native-speaker listening tests "more natural than ElevenLabs Flash v2.5" and "at parity with ElevenLabs v3"; zero-shot custom voice preferred 68.4 % vs 31.6 % against Flash v2.5. Mistral's own evaluation, not independent; the portal's reviewers must judge the nl/fr/it/de/es voices themselves | not yet comparable |

**Hosting and data policy of the API (verified from Mistral's help centre, inference page and docs, 20 October 2026):**
"By default, your data is hosted in the European Union"; a dedicated EU regional endpoint `api.eu.mistral.ai` exists
"at a 10 % upcharge" (the global endpoint may transfer data "temporarily … outside of the European Union" to
sub-processors listed in the Trust Center, under standard contractual clauses). The inference page states "Data sent
through our API isn't used for model training"; the help centre nevertheless has an "Anonymous improvement data"
toggle under Admin › Privacy that an organisation should switch off ("prevents API calls and related data from being
used to improve Mistral's services"). **Zero data retention** is available on paid plans, on request with a stated
reason, and explicitly covers `/v1/audio/speech`: Mistral then "does not store or log inputs and outputs for supported
API requests longer than required to generate the output". For the portal this is more than enough: only the public,
reviewed page text goes to the API, from a GitHub Actions job, never anything about a visitor.

**Cost for the portal at $16 per 1 M characters (+10 % on the EU endpoint):** the measured ~25,000 characters per
language → **about €0.40–0.45 per language per full build**; a weekly regeneration of changed blocks (a few hundred to
2,000 characters) → under €0.05; all seven first languages from scratch → about €3; under the briefed 2,000 words per
page (204,000 characters) → about €3.60 per language. The paid plan needed for zero data retention, not the characters,
is the budget item — the same conclusion as for DeepL.

#### 5.1.2 Self-run open-weight models (no provider at all)

Running a model inside the GitHub Actions job sends the text nowhere, so it respects the rule by construction. The
limits are the runner (4 vCPU, 16 GB, 6 hours per job, no GPU) and the licences. Measured and documented on
20 October 2026:

| Model | Licence | Portal languages covered | Size | CPU in the Actions job? | Reputation |
|---|---|---|---|---|---|
| **Piper** (OHF-Voice/piper1-gpl, voices `rhasspy/piper-voices`) | code MIT; **each voice has its own licence in its `MODEL_CARD`** (several trained on non-commercial data) | nl_BE, nl_NL, fr_FR, it_IT, pl_PL, **ro_RO**, de_DE, es_ES, plus pt_PT, sv, da, fi, cs, sk, hu, el, sl, lv, tr, uk, no, is, ca, cy, lb; **no bg, et, lt, ga, mt** | 20–120 MB per voice (ONNX) | **yes**: measured ×8.3 real time with `fr_FR-siwis-medium` on 2 ARM cores (obole-ia benchmark, 2026); the ~34 minutes of audio of one language take **about 5 minutes** | "medium"/"high" per voice; intelligible, noticeably synthetic (reported widely; Home Assistant's default engine) |
| **Kokoro-82M** | Apache 2.0 | en, fr, it, es, pt-BR, hi, ja, zh — **no nl, pl, ro, de** | 82 M parameters (~330 MB) | borderline: ×0.87–0.93 real time on 2 ARM cores → ~40 minutes per language | good English, fewer languages (reported) |
| **Chatterbox Multilingual V3** (Resemble AI) | MIT | 23 languages: nl, fr, it, pl, de, es, pt, da, fi, el, sv, no, tr, … — **no ro**, no cs/sk/hu/bg/hr/sl | 500 M parameters | code accepts `device="cpu"`, but Resemble recommends a GPU and publishes no CPU speed; a 500 M model on 4 vCPU is hours per language at best: **measure before counting on it** (Chatterbox Nano, 110 M, runs "3x faster than realtime on 8 CPU cores" but is English-only) | reported as the top clearly open-weight model on TTS Arena (secondary sources) |
| **OmniVoice** (k2-fsa, arXiv 2604.00688, April 2026) | Apache 2.0 | 646 languages: **every EU language incl. ro, pl, et, lv, lt, ga, mt** | not stated | GPU: RTF 0.025 on an H100, Apple and Intel GPUs listed; no CPU figures | new; no independent quality data yet |
| **Qwen3-TTS** (0.6B/1.7B, 22 Jan 2026) | Apache 2.0 | de, fr, es, it, pt, ru, en, zh, ja, ko — **no nl, pl, ro** | 0.6–1.7 B | CUDA examples only | strong reputation (reported) |
| **Fun-CosyVoice 3** (0.5B, Dec 2025) | Apache 2.0 | de, es, fr, it, ru, en, zh, ja, ko — **no nl, pl, ro** | 0.5 B | NVIDIA/vLLM deployment | strong reputation (reported) |
| **Voxtral TTS weights** (§5.1.1) | **CC BY-NC 4.0** | nl, fr, it, de, es, pt | 4 B | GPU in practice | Mistral's claims above |
| Excluded by licence | XTTS v2 (Coqui Public Model License, non-commercial; 17 languages incl. nl, pl, cs, hu, no ro), Fish Audio S2-Pro ("Fish Audio Research License", commercial use needs a separate licence; ~100 languages), Meta MMS-TTS (CC BY-NC 4.0; 1,100+ languages incl. ro and pl), Orpheus multilingual (Apache 2.0 but a research preview with unnamed languages) | | | | |

Reading of the table: with no GPU, **Piper is the only self-run model that finishes inside the Actions job for every
first-wave language, Romanian included**, and it is also the one whose quality is closest to the device voices the
feature is meant to improve on. The models with the quality the maintainers are after (Chatterbox, OmniVoice, Qwen3,
CosyVoice, Voxtral) want a GPU: either a one-off generation on a university machine with the files committed (the
cache in §5.1.4 makes this a rare, small job), or a GPU runner on a paid GitHub plan. Chatterbox on CPU is the one
experiment worth an afternoon before deciding.

#### 5.1.3 Hosted text-to-speech APIs other than Mistral

OpenAI (`gpt-4o-mini-tts`), ElevenLabs (whose Eleven v3 covers all 24 EU languages), Google Cloud, Azure and Amazon
Polly all offer the portal's languages at $4–30 per million characters with "no training" terms in their paid tiers;
**they are excluded by the maintainers' rule and are not compared further**.

#### 5.1.4 How it plugs into this design

- **Source of truth**: the translation cache `translations/<lang>.json` (and the English units) already holds every
  static text unit keyed by the SHA-256 of its English source, with `status` `machine`/`reviewed`. A new script
  `scripts/generate_audio.py` (standard library + `requests`, modelled on `translate_site.py`) walks the units of a
  language, derives the **spoken text** of each block with the same rules as the reader (§6: no visually-hidden or
  `aria-hidden` text, whitespace normalised), and generates audio for the units that are new or changed. Audio is
  generated **per block**, never per sentence (Mistral advises under 300 words per request; the portal's blocks are
  far shorter), so the reader plays one file per block and highlights exactly as it does now.
- **Engine**: `POST https://api.eu.mistral.ai/v1/audio/speech` with `model: voxtral-mini-tts-2603` (or `-3-0` once it
  leaves preview and lists pl/ro), one preset `voice_id` per language chosen by the reviewers, `response_format:
  opus`; re-encoded with `opusenc --bitrate 24` so every file is the same format; the key in the repository secret
  `MISTRAL_API_KEY`, exactly as `DEEPL_AUTH_KEY`. A `--engine piper` option runs Piper locally for languages Mistral
  does not have (ro, pl today), with the voice name per language in `translations/config.json`.
- **Output**: `web/audio/<lang>/<sha>.opus` plus one `web/audio/<lang>/manifest.json`:
  `{"<sha>": {"text": "...", "file": "<sha>.opus", "seconds": 4.2, "engine": "mistral/voxtral-mini-tts-2603",
  "voice": "...", "date": "2026-11-03"}}`, where `<sha>` is the SHA-256 of the spoken target text. The manifest also
  holds the plain text, so a mismatch between the build's and the reader's text derivation is visible in the debug
  mode. The same sentence on all 17 pages is one file (same deduplication as DeepL); `reviewed` units are generated,
  `machine` units only when the maintainers allow publishing machine translations (open question 2 of the DeepL plan).
- **Workflow**: a job in `.github/workflows/translate_site.yml` after the translation step, with
  `MISTRAL_API_KEY: ${{ secrets.MISTRAL_API_KEY }}`, `--dry-run` reporting the characters that would be billed,
  `--check` (no key) verifying that every unit in the cache has a file or is listed as missing; new files are committed
  on the same `translations/<date>` branch so reviewers can listen before merging. `publish_web.yml` needs no change
  (`paths: web/**`). Alternative if the repository grows too much: generate into the Pages artifact only and keep the
  Opus files in the Actions cache keyed by manifest; simpler to commit at these sizes.
- **Size**: ~34 minutes of speech per language at 24 kbit/s Opus ≈ **6 MB per language** (16 MB as 64 kbit/s MP3),
  ~42 MB for the seven first languages, ~150 MB for all EU languages; well inside GitHub's 1 GB Pages limit and the
  "keep repositories under 1 GB" recommendation. Under the briefed 2,000 words per page: ~41 MB per language, at
  which point the artifact-only alternative becomes the better choice.
- **The reader**: the "speak one utterance" step is isolated. When Play is pressed on a page whose language has a
  manifest (`web/audio/<lang>/manifest.json`, fetched only then, ~30 KB), the reader hashes each block's spoken text
  with `crypto.subtle.digest('SHA-256', …)` (available in every target browser on https; on `file://` it is not, and
  the reader falls back) and, on a hit, plays the file through one shared `<audio>` element (`playbackRate` for the
  Speed control, `ended` → next block, `pause()`/`currentTime` for a real pause this time); on a miss (the figure
  summary with its filter-dependent numbers, the table rows, the article titles that change weekly, the national card
  of a country whose description is not cached, a block edited after the last build) it uses `speechSynthesis` as in
  §7. The two paths share the queue, the highlight, the toolbar and the status; a page can mix them block by block.
  The online-voice consent dialog is not needed for the files (nothing leaves the device). The `pagehide` cancel
  covers both. The English article titles and the browser-translated pages (Translator API) always use
  `speechSynthesis`, because their text is not in any cache.
- **Mixed-language blocks** (the national website's name in `lang="nl"` inside a French support line): one file in the
  page voice; Voxtral is multilingual ("code-mixing" is a documented feature), so the name is pronounced acceptably.

#### 5.1.5 Decision rule for "if need be", and the recommended first choice

Trigger the build-time audio for a language when, at the end of that language's pilot (Dutch first), **either** of
these is true:

1. The reviewers who check the DeepL translation also listen to three pages (the anxiety page, the chemotherapy page
   and `modules.html`) read by the Web Speech reader on three mainstream devices (a Windows 11 PC with the language
   installed, an iPhone, an Android phone) and rate, 1–5, intelligibility of the numbers in the statement and legend,
   pronunciation of the medical terms, and overall naturalness; the **median rating is below 3 on any one of the
   three devices**, or the reviewers judge the voice unfit for the audience (an adolescent should not have to listen
   to a robotic voice about anxiety).
2. The language has **no installed voice on a mainstream platform** that cannot be fixed from the "no voice" dialog
   (today: Romanian has no Windows natural voice and no Google voice, and nothing on Linux; Linux is a minor platform
   for this audience, Windows is not).

When triggered, in this order:

- **First choice: Mistral's API, `voxtral-mini-tts-2603`, on `api.eu.mistral.ai`, with the "Anonymous improvement
  data" toggle off and zero data retention requested**, Opus output, one preset voice per language chosen by the
  reviewers, generated at build time for the static text only, with the reader falling back to `speechSynthesis` for
  the dynamic text. It respects the privacy rule (public page text only, from the build, to an EU-hosted provider that
  does not train on it; nothing about visitors) and the Mistral-only rule, costs under €0.50 per language per full
  build, and covers nl, fr, it, de, es, pt today.
- **For pl and ro**: wait for the Voxtral Mini TTS 3.0 model card (announced today with Polish and Romanian samples)
  and move the whole pipeline to it once it is out of preview and the card lists the languages; until then **Piper**
  (`pl_PL`, `ro_RO` voices, licence per voice to be checked) in the same job, because it is the only rule-compliant
  engine that runs on the Actions runner, or simply leave those two languages on the device voices. Chatterbox
  Multilingual (MIT, Polish but not Romanian) only if a CPU run proves acceptable in a test.
- **Not recommended**: self-hosting the Voxtral weights. The CC BY-NC 4.0 licence would need a legal opinion that an
  EU-funded, free research portal is "non-commercial" in CC's sense, and the model needs a 16–24 GB GPU that the
  Actions job does not have; the API gives the same voices without either problem.

Effort for this step, when triggered: the generation script with `--dry-run`/`--check` and tests (1.5 days), the
workflow job and secret (0.5 day), the reader's file path and manifest lookup (1 day), reviewer listening session and
voice choice per language (0.5 day each), README (0.5 day): **about 4 developer days** plus the pilot sessions.

## 6. What is read, in which order

Root: `<main>`. Skipped entirely: `header`, `footer`, `.accessibility-strip`, `.page-toolbar`, `.filter-bar`,
`.topic-nav`, `.explore-topics-wrap`, `.tile-divider`, `dialog`, `[hidden]`, `[aria-hidden="true"]`,
`.visually-hidden`, `script`, `style`, `svg`, and anything marked `data-read="skip"` (an escape hatch in the HTML,
like `translate="no"` for DeepL). A **block** is the unit of highlighting and the upper bound of an utterance:

| Order on a topic page | Element | Spoken text |
|---|---|---|
| 1 | `h1.card-title` | the title |
| 2 | `p.vis-statement` | "33 out of 100 people aged 15 to 39 years old show signs of anxiety after treatment" (`innerText` of the block; the `.vis-count` span and the `<br/>` need nothing special) |
| 3 | `.icon-array-grid[role="img"]` or the Plotly chart `div[aria-label]` | the `aria-label`: the accessible summary that `visualisation.js` already writes ("Icon array of 100 people. 33 out of 100: …"), which also covers the legend, so `.legend-container` is skipped. Table view: the caption, then one utterance per row (cells joined with commas) |
| 4 | `.support-section h2`, its `p` with the `.support-line` spans (the national line included), `p.support-care` | each `p` is one block; a block is split into sentences and at **`lang` boundaries** (the national website's name in `lang="nl"` becomes its own utterance) |
| 5 | `.beatcancer-insert`: `.bc-insert-head`, each `.bc-card-title`, the national website card's title and description, `.bc-insert-note` | titles carry `lang="en"` on translated pages (`portal.js` wraps them), so they are spoken with an English voice; excerpts, "From beatcancer.eu", counts and the hidden "(opens in a new tab)" are not read |
| 6 | `.info-note p` (data note, contact line) | as written |

`index.html`: the two profile cards (`h2`, `p`) and the "What suits you best?" block; `modules.html`: the intro and the
subject cards' names and descriptions; `login.html`: the heading and paragraph. Link and button labels ("Explore",
"Set as default") are not read: for a sighted listener they are noise, and the Help dialog explains the page.

Text is taken from the DOM **at the moment a block is due**, not snapshotted when Play is pressed, because the article
cards and the national card arrive asynchronously and because the browser translation (§7.6) rewrites text nodes
after load. Sentence splitting: on `.`, `!`, `?`, `:` followed by white space, then on `;` or `,` when a piece is still
longer than 200 characters; a block shorter than that is one utterance. The same TreeWalker rules as `i18n.js`
(`SKIP_TAGS`, `aria-hidden`, `lang` inheritance) are reused, so the two features agree on what counts as text.

## 7. Design

### 7.1 The queue

`web/js/read_aloud.js`, loaded with `defer` after `portal.js` on every page (the build adds it to the translated trees
like the other scripts). One module-level reader object: `blocks` (computed when Play is pressed, recomputed when a
block is reached whose element is gone), `index`, `state` (`idle`, `speaking`, `paused`), `voice`, `rate`. Speaking one
utterance at a time and queuing the next from its `end` event (not pushing all utterances at once) keeps Stop
immediate and the highlight in step. `end` missing after `cancel()` is expected; `error` events with code
`interrupted` or `canceled` are ignored, any other error stops reading and shows `readAloud.failed`.

### 7.2 Chunk size and the Chrome cut-off

An utterance is one sentence or one short block, never more than ~200 characters (≈ 15 seconds at the normal rate),
so the Chrome cut-off cannot trigger even with a remote voice. In addition, when the chosen voice has
`localService === false` and the browser is desktop Chromium (not Android), a timer calls `pause()` then `resume()`
every 10 seconds while `speaking` is true and stops at `end`: the November 2025 report says this pair still keeps the
Google voices alive. Not needed with local voices; never on Android, where `pause()` cancels.

### 7.3 Highlighting

The block being read gets `class="reading-now"` (an outline plus a tint from CSS variables so that the Contrast and
Dark modes restyle it) and `scrollIntoView({ block: 'nearest', behavior: prefers-reduced-motion ? 'auto' : 'smooth' })`.
Word-level highlighting from `boundary` events is a later enhancement, only where the events arrive (local voices on
Windows and macOS); the design must not depend on it (§2.4). Text nodes are never rewrapped for highlighting, so the
browser translation's `WeakMap` of text nodes and DeepL's unit structure stay valid.

### 7.4 Language per utterance and the choice of voice

1. The language of an utterance is the closest `lang` ancestor of its text (page language from `<html lang>`, which
   `i18n.js` updates after a browser translation; `lang="nl"` on a national website's name; `lang="en"` on article
   titles of translated pages).
2. `voicesFor(lang)`: all voices whose `lang` primary subtag (after replacing `_` with `-`) equals the utterance's;
   ranked: `localService === true` first; region equal to the page's region or the browser's `navigator.language`
   next (nl-NL before nl-BE for a Dutch page, unless the browser says nl-BE); names starting with "eSpeak" last;
   otherwise the browser's `default`, then list order. No voice names are hard-coded (Apple localises names; Windows
   and Android names vary).
3. If the best voice is local: speak. If the only voices are remote: open the dialog `readAloud.onlineVoiceTitle`
   with the maker's name ("Google" for names starting with "Google", "Microsoft" for "… Online (Natural)", else the
   voice's name), the sentence that the text of the page is sent there, and **Continue** / **Cancel**; Continue (a
   click, so the activation rule is met) speaks and remembers the consent in `sessionStorage` for this visit only.
4. If there is no voice for the page language: the dialog `readAloud.noVoiceTitle` with (a) the browser's own feature
   for this browser/OS and (b) how to install a voice (from `navigator.userAgent`/`platform` heuristics, kept coarse:
   Windows, macOS, iOS/iPadOS, Android, Linux, other). A fragment in another language without a voice (the Dutch
   website name on an English page, an English title on a Polish page) is spoken with the page voice instead,
   without a dialog.
5. If `speechSynthesis` is absent (Opera Mini, old WebViews, Edge on Android reporting no voices): the same dialog
   with text (a) only.
6. The voice is chosen once per Play, per language, and kept for the run; the Audio button's `aria-label` and
   `title` name it ("Read aloud: Frank, Dutch (Netherlands)"), as the Language and Size buttons name their state.

### 7.5 Controls

The **Audio** button keeps its label and loses the "Coming soon" tooltip (`data-access="audio"`, `aria-pressed`):

- Idle: click → compute the blocks, choose the voice (§7.4), speak, show the toolbar.
- Speaking: the button reads "Pause" via `aria-label` and `aria-pressed="true"`; click → pause (implemented as
  `cancel()` + remember `index` on every platform, so Android and the stuck-engine case behave the same; resume
  restarts the current sentence, which is acceptable at this chunk size).
- Toolbar `.read-aloud-bar` (`role="group"`, `aria-label` = `readAloud.title`), inserted right under the accessibility
  bar, hidden until the first Play: **Play/Pause** (mirrors the Audio button for touch reach), **Stop** (cancels,
  clears the highlight, index back to 0, hides the toolbar), **Previous** and **Next** block, a **Speed** `<select>`
  (0.8 ×, 1 ×, 1.25 ×, 1.5 ×; applied from the next utterance), and a `role="status"` span: "Reading 3 of 12",
  "Paused", "Finished". All buttons are native `<button>`s with the portal's existing focus style; Escape does nothing
  (it is reserved for the dialogs); a click on a readable block while reading starts from that block (small, worth
  having from the start because it replaces a progress bar).
- Stop happens automatically at the end, on `pagehide`, and when the Language or Country choice navigates.
- No autoplay, ever: reading never resumes by itself on the next page (WCAG 1.4.2 and the activation rule agree).

### 7.6 Coexistence with the other features

- **Browser translation (Translator API)**: `i18n.js` rewrites text nodes and sets `<html lang>` to the target when
  done. The reader reads node text at speak time and takes the language from the DOM, so a page translated before
  Play is read in the target language with a voice for it. If Play is pressed while the translation is running
  (`AYA_I18N.browser.active()` set and nodes still English), the status says `readAloud.waitTranslation` and reading
  starts when the first pass resolves (`translatePage()`'s promise); mid-run mutations are simply picked up at the next
  block. Content translated by **Chrome's own translate feature** has no API: the reader reads what is on the page,
  with the page language from `<html lang>` (Chrome does not change it), so the voice may not match; the test matrix
  has a row for it, and the notice bar already tells the visitor the page is browser-translated.
- **Size, Contrast, Dark**: independent. The highlight uses the mode variables; `scrollIntoView` works at every size
  (`size-large`, `size-larger` on `<html>`); the toolbar reflows at 320 px like the accessibility bar.
- **Dialogs (Glossary, Help, View)**: reading continues underneath; the highlight is outside the dialog; Stop is
  reachable after closing. (Pausing automatically when a modal opens is a possible refinement.)
- **Visualisation changes** (filter, view): the figure block is re-read from the DOM when its turn comes, so the new
  `aria-label` is spoken; the `aria-live` statement is untouched.
- **Storage**: only `aya-read-rate` in `localStorage` (like `aya-size`), nothing else; the online-voice consent in
  `sessionStorage`. Nothing to add to the cookie statement beyond what the Size/Contrast entries already cover (open
  question 4).

### 7.7 Strings for `web/i18n/en.js` (group `readAloud`)

```json
"readAloud": {
  "title": "Read aloud",
  "button": "Read aloud: {voice}",
  "play": "Play", "pause": "Pause", "resume": "Resume", "stop": "Stop",
  "previous": "Previous paragraph", "next": "Next paragraph",
  "speed": "Speed", "speedSlow": "Slower (0.8×)", "speedNormal": "Normal", "speedFast": "Faster (1.25×)", "speedFaster": "Fastest (1.5×)",
  "statusReading": "Reading {current} of {total}", "statusPaused": "Paused", "statusDone": "Finished reading",
  "waitTranslation": "Waiting for your browser to finish translating the page…",
  "onlineVoiceTitle": "Only an online voice is available",
  "onlineVoiceIntro": "Your browser can read this page with the voice \"{voice}\", but that voice is provided over the internet by {maker}: the text of this page is sent to {maker} to be turned into speech. The portal itself sends nothing. A voice installed on your device avoids this.",
  "onlineVoiceContinue": "Read with the online voice",
  "noVoiceTitle": "No voice for {language}",
  "noVoiceIntro": "Your browser has no voice installed for {language}, so this page cannot be read aloud here. You can add a voice to your device, or use your browser's own read-aloud feature.",
  "unsupportedIntro": "Your browser cannot read pages aloud through this button. You can use your browser's or your device's own read-aloud feature.",
  "helpChromeAndroid": "Chrome on Android: open the ⋮ menu and choose \"Listen to this page\" (the page is then sent to Google). To add a voice: Settings › Accessibility › Text-to-speech output › Install voice data.",
  "helpChromeDesktop": "Chrome: right-click the page, choose \"Open in reading mode\", then the Play button in the side panel.",
  "helpEdge": "Edge: right-click the page and choose \"Read aloud\", or press Ctrl+Shift+U.",
  "helpFirefox": "Firefox: open Reader View (the icon in the address bar) and choose the headphones button. On Linux, Firefox needs the speech-dispatcher package and a voice such as espeak-ng.",
  "helpSafariIos": "Safari on iPhone or iPad: tap the page menu (ᴬᴬ) and choose \"Listen to Page\", or turn on Speak Screen under Settings › Accessibility › Spoken Content and swipe down with two fingers.",
  "helpMacos": "macOS: System Settings › Accessibility › Spoken Content › System voice › Manage voices to add a voice, then select text and press the Speak Selection shortcut.",
  "helpWindows": "Windows: Settings › Time & language › Speech › Manage voices › Add voices to install a voice for your language.",
  "failed": "Reading stopped because of an error in your browser. Press Play to try again."
}
```

These strings go through the DeepL cache like all of `en.js`; `{voice}`, `{maker}`, `{language}` are protected
placeholders. `{language}` is the native name from `AYA_I18N.nativeName()`.

### 7.8 Files to add or change

Add: `web/js/read_aloud.js` (reader: block extraction, queue, voice choice, keep-alive, toolbar, dialogs; ~300–400
lines in the style of `portal.js`), a `readAloud` section in `web/i18n/en.js`, CSS for `.read-aloud-bar`,
`.reading-now` and the dialog lists in `web/css/portal.css`.
Change: the Audio button in all 17 English pages (`data-access="audio"`, `type="button"`, `aria-pressed="false"`, no
tooltip), the `<script>` list of every page (the build copies it to the trees), `scripts/translate_site.py` only if
the Audio button's new attributes need extraction rules (they do not: no text changes), `README.md` (the "Audio"
sentence in the accessibility paragraph), open question 9 of the (discarded) DeepL plan (answered by this plan).
Optional later: `data-read="skip"` on elements the maintainers decide not to read; `data-read-as` for pronunciations.

## 8. Effort

| Step | Days |
|---|---|
| Block extraction with the shared walker rules, sentence splitting, a debug mode (`?readaloud=debug` lists the blocks and languages on the page) | 1 |
| Queue, voice choice, keep-alive, pause/resume/stop semantics, `pagehide` | 1 |
| Toolbar, Audio button states, highlight CSS at three sizes and three modes, dialogs and strings | 1 |
| Testing on the matrix in section 9 (needs a Windows, a macOS, an iPhone, an Android phone and a Linux machine), fixes | 1.5–2 |
| README, DeepL plan cross-reference, regenerating the translated trees for the new script tag and strings | 0.5 |
| **Total** | **5–5.5 developer days** |

## 9. Test checklist per browser

Run each row on: Chrome/Windows 11, Edge/Windows 11, Firefox/Windows 11, Safari/macOS, Chrome/macOS, Safari/iOS (and
Chrome/iOS, expected identical), Chrome/Android (Pixel and one Samsung), Firefox/Android, Firefox/Linux with and
without speech-dispatcher, Chromium/Linux. English page, Dutch page (when it exists), and the English page translated
by the browser (Translator API in Chrome/Edge, and Chrome's own translate feature).

1. Audio button: starts reading on the first click, no console error about activation; the toolbar appears; focus
   stays on the button; `aria-pressed` and the accessible name change.
2. Voice: an installed voice for the page language is chosen when one exists; `localService` of the chosen voice logged
   in debug mode; the online-voice dialog appears when only Google/Online voices exist (Chrome on Linux without
   speech-dispatcher; Edge with the Windows voice for the language removed); the no-voice dialog appears for a
   language without voices (Romanian on Windows without the language added) and names the right feature for the
   browser.
3. Order and content: title, statement, figure summary, support, article titles, info note; nothing from the header,
   filters, navigation, footer, hidden spans or icons; the table view reads caption and rows; after a filter change
   the new statement and summary are read.
4. Languages: the national website's name is read in its language (or with the page voice without a dialog); English
   article titles on a translated page use an English voice; the browser-translated page is read in the target
   language with a matching voice.
5. Chunking: a page read end-to-end without a silent stop in Chrome with a Google voice (remove the local voice to
   force it); no gaps longer than a second between sentences with local voices.
6. Pause/resume/stop: resume restarts the current sentence; Stop clears the highlight and the `speaking` flag;
   Previous/Next move the highlight; Android pause does not leave the engine silent for the next Play.
7. Highlight: visible in normal, Contrast and Dark modes at all three text sizes; the block scrolls into view; no
   layout shift; `prefers-reduced-motion` respected.
8. Speed: each of the four rates audible; the chosen rate is remembered on the next page and shown in the select.
9. Lifetime: speech stops on navigation (Return to subjects, Language dialog, Country dialog, browser back), on tab
   close, and — on mobile — note what happens on screen lock (expected: stops; the toolbar must show "Paused" after
   unlock rather than "Reading").
10. Dialogs: Glossary/Help open and close while reading; the Speed select and the buttons are reachable by keyboard
    with a visible focus; a screen reader (NVDA on Windows, VoiceOver on macOS/iOS) announces the status changes once
    and is not flooded.
11. No requests: the network panel shows no request from the portal during reading with a local voice; with an online
    voice, only the browser's own request (to confirm the dialog text is accurate).
12. Build: `scripts/translate_site.py --check` passes after the script tag and strings are added; the translated trees
    load `read_aloud.js` from the right path.

## 10. Recommendation, with its limitations

**Build the Web Speech API reader as described, with the consent dialog for online voices and the "no voice" dialog
that hands over to the browser's own feature; no third party, no server, no build-time audio for now.** It gives the
AYA audience a read-aloud control on the great majority of devices for the first seven languages at no running cost,
keeps the portal's privacy stance (nothing leaves the device unless the visitor says so), follows every language the
portal has or the browser produces, and reads the weekly article titles and the national card without extra work.

What it will not do, stated plainly:

1. **Voice quality and availability are the device's.** A Windows visitor hears the legacy "Frank" for Dutch unless
   they use Edge's online voices (text to Microsoft); iOS visitors hear the compact voices because Safari hides the
   better ones from web pages (WebKit bug 290497, open); Linux visitors mostly hear nothing or espeak; Romanian has the
   fewest voices everywhere. The portal cannot change that; the dialog explains it.
2. **Highlighting is per block, not per word**, because `boundary` events do not arrive from Google voices, on Android,
   or completely in Safari. Chrome's and Edge's own read-aloud features highlight words; ours will not, at first.
3. **Mobile playback stops when the screen locks or the tab is hidden**, and Android's `pause()` is unreliable, so
   pause means "stop here and restart this sentence". A visitor who wants to listen with the phone in the pocket is
   better served by Chrome's "Listen to this page" or Safari's "Listen to Page", which the dialog names.
4. Pronunciation of abbreviations, numbers and "beatcancer.eu" is the voice's guess; there is no SSML.
5. Chrome's 15-second bug is worked around, not fixed; if Google changes the component, the keep-alive may need
   revisiting (one place in the code, behind a flag).

If the pilot shows that the device voices are not good enough for a language (the measurable rule is in §5.1.5),
the second step is build-time audio with **Mistral's Voxtral TTS API** on the EU endpoint, generated per block from the
translation cache and served as Opus files with the same toolbar (§5.1.4); Piper only for the languages Mistral does
not have yet (Polish and Romanian, until Voxtral Mini TTS 3.0 leaves preview). The Web Speech reader stays for the
dynamic parts (figure summary, table, article titles, browser-translated pages) and as the fallback, which is why the
"speak one utterance" step is kept separate from the rest of the reader from the start.

## 11. Sources checked on 20 October 2026

- caniuse, Speech Synthesis API — https://caniuse.com/speech-synthesis
- MDN, `SpeechSynthesis` (Baseline) — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis; `boundary` event (not Baseline) — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/boundary_event; `localService` — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService
- Readium, "SpeechSynthesis in browsers and OSes" (voice counts as of April 2024) — https://readium.org/speech/docs/WebSpeech.html; Readium Speech library (BSD-3) — https://github.com/readium/speech; recommended voices per language — https://github.com/HadrienGardeur/web-speech-recommended-voices
- textintoaudio, "Web Speech API Browser Support (2026)", last reviewed 4 October 2026 — https://textintoaudio.com/browser-support
- Caktus Group, "The Halting Problem", 3 November 2025 (Chrome cut-off still present, pause/resume pair) — https://www.caktusgroup.com/blog/2025/11/03/the-halting-problem/
- Chromium issues 41346274 (cut-off), 40715888 (`boundary` with Google voices), 332002367 — https://issues.chromium.org/ (sign-in required; status not read)
- Blink "Intent to Deprecate: speechSynthesis.speak without user activation" — https://groups.google.com/a/chromium.org/g/blink-dev/c/XpkevOngqUs; WPT `SpeechSynthesis-speak-without-activation-fails.tentative.html`
- `getVoices()` dump of Chrome 110 (19 Google voices, `localService: false`) — https://gist.github.com/PingNote/a9c4d0cf95690fa9eb6e3d06318ae8f1
- Microsoft, Edge privacy statement, "Read aloud" — https://learn.microsoft.com/en-us/legal/microsoft-edge/privacy; "Appendix A: Supported languages and voices" — https://support.microsoft.com/en-us/windows/appendix-a-supported-languages-and-voices-4486e345-7730-53da-fcfe-55cc64300f01; Edge "Customize Read aloud settings" — https://www.microsoft.com/en-us/edge/learning-center/customize-read-aloud-settings
- Mozilla, "Speech Dispatcher required for SpeechSynthesis API" — https://support.mozilla.org/en-US/kb/speechd-setup; "Firefox Reader View for clutter-free web pages" (Narrate) — https://support.mozilla.org/en-US/kb/firefox-reader-view-clutter-free-web-pages; Bugzilla 1544143 (OneCore voices, fixed in Firefox 106) — https://bugzilla.mozilla.org/show_bug.cgi?id=1544143
- WebKit bug 290497, "not all voices installed listed" (NEW, 26 March 2025) — https://bugs.webkit.org/show_bug.cgi?id=290497
- Apple, "iOS and iPadOS 26 feature availability" (Read & Speak languages) — https://www.apple.com/ios/feature-availability/; "Listen to a webpage in Safari on iPhone" — https://support.apple.com/guide/iphone/listen-to-a-webpage-iph449fc616c/ios
- Google, "Use Listen to this page mode in Chrome" (Android) — https://support.google.com/chrome/answer/14768725; "Use reading mode in Chrome" (desktop read aloud) — https://support.google.com/chrome/answer/14218344; Android "Text-to-speech output" — https://support.google.com/accessibility/android/answer/6006983; Google TTS engine languages — https://en.wikipedia.org/wiki/Speech_Recognition_%26_Synthesis
- Chromium `content/browser/speech/tts_linux.cc` (speech-dispatcher backend) — https://chromium.googlesource.com/chromium/src/+/lkgr/content/browser/speech/tts_linux.cc
- W3C, WCAG 2.2 — https://www.w3.org/TR/WCAG22/; Understanding 1.4.2 — https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html; Understanding 3.1.5 — https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html; "Making Content Usable for People with Cognitive and Learning Disabilities" — https://www.w3.org/TR/coga-usable/
- ReadSpeaker webReader security/privacy documents — https://docs.readspeaker.com/; Texthelp ReachDeck security document — https://support.texthelp.com/help/reachdeck-security-document
- Amazon Polly pricing — https://aws.amazon.com/polly/pricing/; Azure Speech pricing (only the free tier readable) — https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/; Google Cloud TTS pricing (script-rendered, figures from aggregators) — https://cloud.google.com/text-to-speech/pricing
- Piper voices — https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md; Kokoro-82M language list (secondary sources)
- Mistral: "Speaking of Voxtral" (Voxtral TTS, 23 March 2026) — https://mistral.ai/news/voxtral-tts; "Voxtral 3" (20 October 2026) — https://mistral.ai/news/voxtral-3; model pages — https://docs.mistral.ai/models/voxtral-tts-26-03 and https://docs.mistral.ai/models/voxtral-mini-tts-3-0; pricing — https://docs.mistral.ai/inference/pricing; text-to-speech docs and endpoint — https://docs.mistral.ai/studio/audio/text_to_speech, https://docs.mistral.ai/api/endpoint/audio/speech; weights and licence — https://huggingface.co/mistralai/Voxtral-4B-TTS-2603; vLLM recipe — https://recipes.vllm.ai/mistralai/Voxtral-4B-TTS-2603; GGUF/CPU runtime — https://huggingface.co/cstr/voxtral-4b-tts-GGUF; zero data retention — https://docs.mistral.ai/admin/monitor-comply/zero-data-retention; data location — https://help.mistral.ai/en/articles/347629-where-do-you-store-my-data-or-my-organization-s-data; training opt-out — https://help.mistral.ai/en/articles/455207-can-i-opt-out-of-my-input-or-output-data-being-used-for-training; inference/regional endpoints — https://mistral.ai/cloud/inference/
- Self-run models: Chatterbox — https://github.com/resemble-ai/chatterbox; Kokoro-82M — https://huggingface.co/hexgrad/Kokoro-82M; OmniVoice — https://github.com/k2-fsa/OmniVoice (languages: docs/languages.md; paper arXiv 2604.00688); Qwen3-TTS — https://github.com/QwenLM/Qwen3-TTS; CosyVoice — https://github.com/FunAudioLLM/CosyVoice; Orpheus — https://github.com/canopyai/Orpheus-TTS; XTTS v2 — https://huggingface.co/coqui/XTTS-v2; Fish Speech — https://github.com/fishaudio/fish-speech; CPU benchmark of Piper and Kokoro — https://github.com/obole-ia/tts-cpu-benchmark
- GitHub-hosted runners (4 vCPU/16 GB for public repositories; GPU runners on Team/Enterprise only) — https://docs.github.com/en/actions/reference/runners/github-hosted-runners; limits (6 hours per job) — https://docs.github.com/en/actions/reference/limits
- Opus bitrates for speech — https://wiki.hydrogenaud.io/index.php?title=Opus

## 12. Open questions for the maintainers

1. **Online voices**: ask every visit (sessionStorage, as proposed), remember the consent in localStorage, or never
   offer Google/Microsoft online voices at all (then Chrome on Linux and Edge without an installed voice get the
   "no voice" dialog)?
2. **The notices**: should the purple test-version banner and the translation notice be read first, before the title?
   They are in the header and skipped by the proposed rules.
3. **The figure**: read the accessible summary (proposed), the visible legend, or both? And the table view: rows or
   caption only?
4. **Cookie statement**: `aya-read-rate` in localStorage is a functional preference like `aya-size`; confirm that the
   statement's wording covers it.
5. **Scope of the first release**: topic pages only, or all 17 pages (the cost of the index/modules pages is small)?
6. **Chrome's own translate feature**: the voice then follows `<html lang>`, which Chrome leaves unchanged, so a page
   translated that way is read with the wrong voice; acceptable with the existing notice, or should the reader detect
   `translated-ltr` on `<html>` and refuse with a hint to use the Language dialog's Translator path?
7. **Build-time audio later?** Only if the pilot shows that device voices are unacceptable for a language (Romanian is
   the candidate); it would need a decision on the engine (Piper licence per voice, or a cloud account) and on hosting
   ~6 MB per language in the repository.
8. **Build-time audio, when triggered**: a Mistral account under UM or NKI with a paid plan (for zero data retention),
   who chooses the preset voice per language, and whether Piper's per-voice licences for `pl_PL`/`ro_RO` are acceptable
   as a stopgap, or those languages stay on device voices until Voxtral Mini TTS 3.0 is final?
9. **Devices for testing**: who can lend an iPhone, a Samsung phone and a Windows 11 machine with the Dutch, Polish and
   Romanian languages installed for the matrix in section 9?
