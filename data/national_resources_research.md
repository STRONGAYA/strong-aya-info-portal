# National websites for young people with cancer: research notes

Automated web research of 2026-10-20 behind `web/data/national_resources.json`, in four batches. The chosen website per country, the rejected alternatives and the reasons; verify before publishing beyond testing.


---

## Western and northern Europe

# National AYA cancer resources - batch R1 (NL, BE, LU, DE, AT, CH, LI, DK, NO, SE, FI, IS)

Researched 2026-10-20. Every chosen URL was fetched and confirmed to be about young adults with cancer; "not fetched" marks alternates taken from search results only. Logos are in `../logos/` as `<ISO2>-<lang>.<ext>`. No SVG renderer was available in this environment, so the SVG logos were checked textually (paths, brand colours, no external references); the raster logos (BE-fr, DE, AT, CH) were checked visually.

## Summary

| Country | Chosen resource | URL | lang | Logo | Confidence |
|---|---|---|---|---|---|
| Netherlands | Jong & kanker (Kanker.nl) | https://www.kanker.nl/jong | nl | yes (NL-nl.svg) | high |
| Belgium | Jong en kanker?! (Kom op tegen Kanker / Alles over kanker) | https://www.allesoverkanker.be/jong-en-kanker | nl | yes (BE-nl.svg) | high |
| Belgium | Je suis jeune et j'ai le cancer (Fondation contre le Cancer) | https://cancer.be/vivre-avec-et-apres-le-cancer/je-suis-jeune-et-jai-le-cancer/ | fr | yes (BE-fr.png) | high |
| Luxembourg | none | - | - | - | - |
| Germany | Deutsche Stiftung für junge Erwachsene mit Krebs | https://junge-erwachsene-mit-krebs.de/ | de | yes (DE-de.png) | high |
| Austria | GenerationYZ: CancerClub (Österreichische Krebshilfe) | https://www.krebshilfe.net/generationyz | de | yes (AT-de.jpg; alt. AT-de-cancerclub.png) | medium |
| Switzerland | AYA Cancer Support CH | https://ayacancersupport.ch/ | de | yes (CH-de.png) | medium |
| Switzerland | none (fr), none (it) | - | fr, it | - | - |
| Liechtenstein | none | - | - | - | - |
| Denmark | Ung Kræft (Kræftens Bekæmpelse) | https://www.cancer.dk/ungkraeft/ | da | yes (DK-da.svg, organisation wordmark) | high |
| Norway | Ung Kreft | https://ungkreft.no/ | no | yes (NO-no.svg) | high |
| Sweden | Ung Cancer | https://ungcancer.se/ | sv | yes (SE-sv.svg) | high |
| Finland | Nuorelle aikuiselle (Sylva ry) | https://www.sylva.fi/tietoa-ja-tukea/nuorelle-aikuiselle/ | fi | yes (FI-fi.svg) | medium |
| Finland | none (sv) | - | sv | - | - |
| Iceland | Kraftur | https://kraftur.org/ | is | yes (IS-is.svg) | high |

Countries/languages with no suitable resource: Luxembourg; Switzerland (fr, it); Liechtenstein; Finland (sv).

## Netherlands (NL) - confidence high

**Chosen:** Jong & kanker, https://www.kanker.nl/jong (Kanker.nl = KWF, IKNL, NFK). Title "Jong & kanker | Kanker.nl"; menu label "Jong & kanker (16 t/m 39)"; for people under 40: information (studying, work, relationships, fertility, money), lotgenotenzoeker, discussion groups, blogs, "vraag het een professional", links to AYA Zorg Nederland.

Caveat: kanker.nl sits behind a Bunny Shield browser challenge; plain bots get HTTP 403 (WebFetch failed; curl with full browser headers succeeded). Real visitors are unaffected.

Logo: no standalone file on the site; the wordmark is `<symbol id="logo">` in `https://www.kanker.nl/themes/custom/kreeft_theme/dist/svg/sprite.svg`, extracted into NL-nl.svg (please eyeball once).

**Alternates (rejected for the card, listed in JSON):**
- AYA Zorg Nederland, https://ayazorgnederland.nl/ (ayazorgnetwerk.nl now 301-redirects here) - national AYA care network 18-39; patient themes + peer contact but care/research/professional oriented; kanker.nl/jong already links to it.
- Stichting Jongeren en Kanker, https://jongerenenkanker.nl/ - patient foundation 18-39, peer activities, advocacy, 40 years old in 2026; strong peer-support alternate, less information content.

Conclusion: kanker.nl/jong is not "clearly worse" than the others; keep it.

## Belgium (BE)

### Dutch - confidence high
**Chosen:** "Jong en kanker?!", https://www.allesoverkanker.be/jong-en-kanker (Kom op tegen Kanker's information site; title "Jong en kanker?! | Kom op tegen Kanker"). Information for young people (AYA = 16-35 in Belgium), stories, peer contact, buddies, A-team, meeting days, free youth holiday, Facebook group; events dated Oct 2026. Logo BE-nl.svg = Kom op tegen Kanker logo (the file served on allesoverkanker.be is byte-identical).

Rejected/alternates:
- Stichting tegen Kanker "Ik ben jong en heb kanker", https://kanker.be/leven-met-en-na-kanker/ik-ben-jong-en-heb-kanker/ - federal, bilingual, information only (mirror of the chosen French entry). Use this if the maintainers prefer one organisation for both languages.
- Kom op tegen Kanker "Gepaste steun voor jongvolwassenen", https://www.komoptegenkanker.be/wat-we-doen/patienten-en-naasten-steunen/gepaste-steun-voor-jongvolwassenen - organisation page about the AYA offer, less visitor-oriented.
- Note: Kom op tegen Kanker is the Flemish (Dutch-speaking community) charity, not federal; it is nevertheless the most active AYA actor in Belgium (AYA Movement, AYA klankbordgroep).

### French - confidence high
**Chosen:** "Je suis jeune et j'ai le cancer", https://cancer.be/vivre-avec-et-apres-le-cancer/je-suis-jeune-et-jai-le-cancer/ (Fondation contre le Cancer; "Tu es jeune (entre 16 et 35 ans)"). Sections: cancers chez les AJA, diagnostic, traitement, fertilité, émotions, relations et sexualité, études, questions pratiques, brochures; CancerInfo 0800 15 801. Logo BE-fr.png (vertical FR logo, 600x331, white background).

Rejected: Institut Jules Bordet / H.U.B AJA team (single hospital; not fetched); Cap Rémission (association founded Sept 2026 in the Belgian province of Luxembourg, no website); KickCancer (research-funding foundation, not a support resource; not checked in depth). No francophone AYA patient association with a website was found.

## Luxembourg (LU) - no suitable resource

Checked:
- Fondation Cancer (cancer.lu, FR and DE): no AYA page; "Groupe de paroles pour jeunes adultes" (20-40 ans) listed at https://www.cancer.lu/fr/nos-groupes-de-paroles but "annulé jusqu'à nouvel ordre".
- Een Häerz fir kriibskrank Kanner asbl, https://kriibskrankkanner.lu/ - families of children/adolescents with cancer, no young-adult programme page (its 2016 "Survivors" brochure for 14-30-year-olds is an old government PDF).
- Fondatioun Kriibskrank Kanner, https://fondatioun.lu/ - paediatric, no AYA programme.
- Europa Donna Luxembourg (breast cancer only), ALGSO (sports, all ages).

Suggestion: keep the beatcancer.eu card, or reuse the DE / BE-fr entries for Luxembourg's language communities (maintainers' call).

## Germany (DE) - confidence high

**Chosen:** Deutsche Stiftung für junge Erwachsene mit Krebs, https://junge-erwachsene-mit-krebs.de/ (founded 2014 by the DGHO; 18-39; "Jung & Krebs - Erste Hilfe", Junges Krebsportal, Treffpunkte, podcast, stories; events Oct 2026; English version at /en/). Logo DE-de.png: the header file is named "4c_weiß" but is the colour logo on an opaque white background (checked visually).

Alternates: Junges Krebsportal https://www.junges-krebsportal.de/ (the foundation's advice portal, verified); Deutsche Krebshilfe "Du bist jung und hast Krebs" (not fetched); AYApedia / DGHO AYA-Netzwerk (URL not verified).

## Austria (AT) - confidence medium

**Chosen:** GenerationYZ: CancerClub, https://www.krebshilfe.net/generationyz (Österreichische Krebshilfe; Austria-wide free online exchange for 18-39-year-old patients, moderated by psycho-oncologists; sessions 3 Nov and 1 Dec 2026; regional "Young Patients" groups). Medium because Austria has no national AYA organisation and this is a single programme page rather than an information hub. https://www.krebshilfe.net/jung-und-krebs only returns the generic umbrella homepage.

Logos: AT-de.jpg (Österreichische Krebshilfe, 600x107 JPEG on white) and AT-de-cancerclub.png ("GenerationYZ #CancerClub" wordmark, 1919x982 transparent PNG) - choose either.

Rejected/alternates: Krebshilfe Wien "Jung und Krebs" (regional, not fetched); national brochure "Jung und Krebs - Du bist nicht allein" (PDF, 2021); Survivors Austria (childhood-cancer survivors, not fetched); "PAayaN" (mentioned once in search, could not be found).

## Switzerland (CH)

### German - confidence medium
**Chosen:** AYA Cancer Support CH, https://ayacancersupport.ch/ (Verein, Zürich, founded 2021 within an academic "Fresh Ideas for Cancer Care" project with Swiss cancer organisations; Switzerland-wide directory of AYA support programmes updated 6 May 2026, events 2026, closed Facebook group). Small volunteer association, German only - hence medium. Logo CH-de.png (round icon, 512x512).

Rejected/alternates: Krebsliga beider Basel AYA-Programm https://basel.krebsliga.ch/beratung/jung-und-krebs/aya-programm/ (most established Swiss AYA programme, 18-39, but a regional league; not fetched); Krebsliga Schweiz (no AYA page on krebsliga.ch / liguecancer.ch / legacancro.ch); Zoé4life https://zoe4life.org/ (childhood-cancer association, no AYA page).

### French and Italian - no suitable resource
liguecancer.ch and legacancro.ch have no AYA pages; Lega ticinese has only parent groups; Romandie searches surfaced only hospital teams and Zoé4life. Suggest the beatcancer.eu card (or BE-fr for fr-CH).

## Liechtenstein (LI) - no suitable resource

Krebshilfe Liechtenstein, https://www.krebshilfe.li/ (verified): general counselling for all ages, no young-adult offer. Suggest reusing CH-de or DE, or the beatcancer.eu card.

## Denmark (DK) - confidence high

**Chosen:** Ung Kræft, https://www.cancer.dk/ungkraeft/ (Kræftens Bekæmpelse; 18-39, patients, young relatives and bereaved; information, meetings, Fortællerkorpset, stories; Facebook group "UNG KRÆFT - UNGE MED OG EFTER KRÆFT"; featured story 1 Nov 2025). Logo: the page has no Ung Kræft logo image; DK-da.svg is the Kræftens Bekæmpelse wordmark extracted from the inline footer SVG (logo_url therefore null).

Rejected/alternates: English page https://www.cancer.dk/ungkraeft/ungmedkraeft/engelsk-side/ (not fetched); Børnecancerfonden (paediatric).

## Norway (NO) - confidence high

**Chosen:** Ung Kreft, https://ungkreft.no/ (independent organisation affiliated with Kreftforeningen; 15-35, patients and relatives; likepersoner, county groups, events to Oct 2026, Ung Kreft-rommet). Logo NO-no.svg (dark variant; white variant also on site).

Alternate: Kreftforeningen (general national cancer society; not fetched).

## Sweden (SE) - confidence high

**Chosen:** Ung Cancer, https://ungcancer.se/ (independent non-profit, founded 2010; 16-35 patients, relatives, bereaved; free membership, peer meet-ups, rehabilitation, financial/psychosocial support; activities Oct 2026). Logo SE-sv.svg.

Rejected/alternates: Cancerfonden (general; not fetched); Barncancerfonden (paediatric).

## Finland (FI)

### Finnish - confidence medium
**Chosen:** "Nuorelle aikuiselle", https://www.sylva.fi/tietoa-ja-tukea/nuorelle-aikuiselle/ (Sylva ry, national association for children and young people with cancer, with an explicit young-adult programme: peer support, VOIMA weekends for 18-35-year-olds (2-4 Oct 2026), events, everyday help, information). Medium because Sylva is primarily a children-and-young-people organisation and the section page itself does not state the age range. Logo FI-fi.svg.

Rejected/alternates: Suomen Syöpäpotilaat ry peer support https://syopapotilaat.fi/vertaistuki/ (Young Cancer Finland ry now operates within it; no dedicated web section; not fetched); Syöpäjärjestöt / Kaikki syövästä (articles only).

### Swedish - no suitable resource
Sylva is Finnish only; alltomcancer.fi / cancerforeningen.fi have only general content.

## Iceland (IS) - confidence high

**Chosen:** Kraftur, https://kraftur.org/ (support association for people aged 18-40 diagnosed with cancer and relatives; nationwide; peer support, counselling with the Icelandic Cancer Society, grants, support groups, education; English at /english/, Polish at /polski/; news 19 Oct 2026). Logo IS-is.svg.

Alternate: Krabbameinsfélagið (general national cancer society).


---

## United Kingdom, Ireland and south-western Europe

# National AYA cancer resources - batch R2 (GB, FR, IT, IE, ES, PT, MT, MC, AD, SM, VA)

Researched 2026-10-20 for the STRONG AYA information portal. Every chosen URL was fetched and confirmed to be about adolescents/young adults with cancer; final URLs after redirects are recorded. Logos are in `../logos/` (shared directory; this batch wrote GB-en.svg, FR-fr.png, IT-it.svg, IE-en.svg, ES-es.png, PT-pt.png). Machine-readable version: `R2.json`.

| Country | Chosen resource | URL | Lang | Logo | Confidence |
|---|---|---|---|---|---|
| United Kingdom | Teenage Cancer Trust - Information about cancer | https://www.teenagecancertrust.org/information-about-cancer | en | yes (SVG) | high |
| France | INCa - Adolescent / Jeune adulte (pediatrie.cancer.fr) | https://pediatrie.cancer.fr/adolescent-jeune-adulte | fr | yes (PNG) | high |
| Italy | Fondazione Umberto Veronesi - Tema: tumori giovanili (fallback) | https://www.fondazioneveronesi.it/temi/tumori-giovanili | it | yes (SVG, extracted) | low |
| Ireland | Irish Cancer Society - Adolescents and young adult support | https://www.cancer.ie/adolescents-and-young-adult-support | en | yes (white SVG) | medium |
| Spain | Fundación Caíco - Adolescentes y jóvenes con cáncer | https://adolescentesyjovenesconcancer.com/ | es | yes (PNG) | medium |
| Portugal | Acreditar - Grupo Barnabés | https://acreditar.org.pt/para-criancas-e-jovens/caminhos-partilhados/grupo-barnabes/ | pt | yes (PNG) | low |
| Malta | none | - | - | - | - |
| Monaco | none | - | - | - | - |
| Andorra | none | - | - | - | - |
| San Marino | none | - | - | - | - |
| Vatican City | none | - | - | - | - |

## United Kingdom (GB) - confidence: high

**Chosen:** Teenage Cancer Trust, "Information about cancer" - https://www.teenagecancertrust.org/information-about-cancer (the `/information` URL redirects here). The UK's established national AYA charity; the information section (signs and symptoms, diagnosis, treatment, feelings, life after cancer) is written by cancer experts, reviewed by young people, and carries the PIF TICK. Covers ages 13-24. Site answers 403 to non-browser clients; use a browser User-Agent when checking links. Logo: header SVG `https://www.teenagecancertrust.org/themes/custom/numiko/tct-logo.svg` (GB-en.svg).

**Alternates (verified by fetch):**
- Trekstock - https://www.trekstock.com/ - charity for people in their 20s, 30s and 40s (exercise, nutrition, wellbeing). Best fit for visitors aged 25-39; narrower topical focus, so not chosen as the single card.
- Shine Cancer Support - https://shinecancersupport.org/ - adults in their 20s-40s; peer-support programmes and networks. Peer support rather than information, so not chosen.
- Young Lives vs Cancer - https://www.younglivesvscancer.org.uk/ - children and young people 0-25; practical/financial/social-care support. Broad paediatric remit, so not chosen.
- Macmillan Cancer Support, teenagers and young adults hub - https://www.macmillan.org.uk/cancer-information-and-support/get-help/teenagers-and-young-adults - reviewed 1 July 2026 but mostly signposts to the charities above.

**Maintainer note:** if the portal ever selects by age, use Teenage Cancer Trust for 15-24 and Trekstock for 25-39.

## France (FR) - confidence: high

**Chosen:** Institut national du cancer (INCa), "Adolescent / Jeune adulte" section of pediatrie.cancer.fr - https://pediatrie.cancer.fr/adolescent-jeune-adulte. The national cancer institute's dedicated AJA section, written directly to young people ("tu"), with dossiers on cancers and treatments, hospital life, sexuality and fertility, health and wellbeing, school and work, friends and family, life after cancer, plus maps of associations and specialised units. Direct analogue of kanker.nl/jong. AJA in France is usually 15-24/25. Logo: `https://pediatrie.cancer.fr/build/images/logo.png` (INCa logo, 219x114, FR-fr.png).

**Alternates:**
- Association Aïda - https://associationaida.org/ (fetched; JavaScript-rendered, little text) - youth-led association for 15-25 year olds, present in about 75 hospital units; the most established AYA-specific association if an organisation is preferred over the INCa section.
- Cheer Up ! - https://cheer-up.fr/ (fetched) - confederation of student associations (about 500 volunteers, 20 hospitals, 11 cities); hospital visits and project funding; no dated content on the site.
- On est là - https://asso-onestla.fr/ (fetched) - peer community for ages 13-30; current activity unclear.
- GO-AJA - https://go-aja.fr/ (fetched) - national professional AJA network with a care-team map and a patient section; aimed mainly at professionals.
- Ligue contre le cancer FAQ "Je suis jeune et je voudrais partager avec des malades de mon âge" - https://www.ligue-cancer.net/mes-droits-mes-demarches/38708-je-suis-jeune-et-je-voudrais-partager-avec-des-malades-de-mon-age (from search results, not fetched) - the Ligue has no dedicated AJA section.
- Rejected: Jeunes Solidarité Cancer (only 2007-era mentions; no live site found).

## Italy (IT) - confidence: low

**Chosen (fallback):** Fondazione Umberto Veronesi, topic page "tumori giovanili" - https://www.fondazioneveronesi.it/temi/tumori-giovanili. A national, trusted foundation; the page lists 2025 magazine articles and patient stories about cancer in adolescents and young adults (15-39) and early-onset cancer. It is a listing page, not a support resource, so treat it as a weak card. Logo: inline header SVG extracted from fondazioneveronesi.it (no standalone image URL; IT-it.svg, CSS-variable fills replaced by the brand hex colours).

**No established national AYA-specific organisation with an active website was found.** Checked and rejected:
- Il Progetto Giovani, Istituto Nazionale dei Tumori Milano - https://ilprogettogiovani.org/ (fetched; active, news May 2026; ages 15-25; Italian/English) - Italy's reference AYA programme but a single institution. Strongest alternative if the single-hospital rule is relaxed. (ilprogettogiovani.it is an unrelated commercial site.)
- La Lampada di Aladino ETS, AYA section - https://www.lampada-aladino.it/aya-adolescent-and-young-adult (fetched) - regional patient association (Brugherio, Lombardy), AYA information page updated 2025.
- Humanitas Progetto AYA - https://www.humanitas.it/centri/cancer-center/servizi/progetto-aya/ (from search, not fetched) - single hospital, 16-39, haematological cancers.
- AIRC - only news articles (e.g. https://www.airc.it/news/soluzioni-su-misura-per-i-giovani-pazienti); no AYA section.
- AIMaC - general patient association; no youth section found on aimac.it.
- FIAGOP adolescents page - returns 404.
- SIAMO (www.progettosiamo.it) - offline.
- "Adolescenti e cancro" (adolescentiecancro.org) - domain for sale.
- AGITO (agito.it) - bone-tumour parents' association.
- AIEOP / AIOM-AIEOP AYA working groups - professional; ALTEG - no website found; Area Giovani CRO Aviano - single hospital.

## Ireland (IE) - confidence: medium

**Chosen:** Irish Cancer Society, "Adolescents and young adult support" - https://www.cancer.ie/adolescents-and-young-adult-support. National cancer society AYA hub: support line, counselling, transport and Travel2Care grant, fertility service, creative arts therapy, free 16-24 guide and care kit, the three AYA shared-care centres; copyright 2026. Most services cap at 24-25. Logo: only a white-on-transparent SVG is served (`.../logo-ics-white.svg`, IE-en.svg); it needs a coloured background or a fill change - request a colour logo from the Society.

**Alternates:**
- CanTeen Ireland - https://www.canteen.ie/ (fetched) - the national AYA-specific peer group (12-25, since 1990) but the website was last updated in 2019 (latest event November 2019); social media active in 2025. Rejected on the "updated within two years" criterion.
- Childhood Cancer Ireland, "Adolescent or Young Adult with Cancer" - https://childhoodcancer.ie/young-adult-with-cancer/ (from search, not fetched).
- HSE NCCP AYA framework PDF (from search, not fetched) - policy document, not a patient resource.

## Spain (ES) - confidence: medium

**Chosen:** "Adolescentes y jóvenes con cáncer" by Fundación Caíco (Madrid) - https://adolescentesyjovenesconcancer.com/. Dedicated Spanish information and support site for adolescents and young adults with cancer (treatments, emotional management, studies and work, social life, rights and benefits, FAQs, testimonials from people aged about 12-34); active (copyright 2026, uploads to July 2026); no advertising; EU co-funding logo; collaborators Hospital Infantil Universitario Niño Jesús and SEHOP. Fundación Caíco itself is little documented online, hence medium confidence - maintainers may wish to confirm its registration. Logo: `https://adolescentesyjovenesconcancer.com/wp-content/uploads/2025/12/logo_texto-Photoroom.png` (2172x724, ES-es.png).

**Alternates:**
- AAA, Asociación española de Adolescentes y Adultos jóvenes con cáncer - https://aaacancer.org/ (fetched) - the national AYA-specific association (est. 2010-2011; awareness talks; "Kit de la cuestión" for 12-25 year olds). Its own site has no content dated after 2019 and links to the chosen site as its resource for young patients, so it was not chosen.
- AECC - no AYA section; only a 2021 user forum post announcing a Telegram group (https://www.contraelcancer.es/es/red-social/sobre-foros/grupo-telegram-adolescentes-adultos-jovenes-con-cancer) and local teen groups/workshops.
- Fundación Josep Carreras blog "El cáncer en la adolescencia" - https://fcarreras.org/blog/adolescentesycancer/ (from search, not fetched) - blood cancers only.
- Fundación Aladina, AFANOC - paediatric/regional, not checked further.

## Portugal (PT) - confidence: low

**Chosen:** Acreditar, "Grupo Barnabés" - https://acreditar.org.pt/para-criancas-e-jovens/caminhos-partilhados/grupo-barnabes/. Acreditar is the national paediatric cancer parents' association (since 1994; Lisbon, Coimbra, Porto, Funchal; site active 2026). The Barnabés are its young members who had cancer before 18 (page says 12-17; other Acreditar text says up to 25): regional and national meetings, activities, camps, advocacy. A teen programme, not an 18-39 resource - hence low confidence. Logo: `https://acreditar.org.pt/wp-content/uploads/2022/09/logo_cores.png` (993x355, PT-pt.png).

**Alternates / rejected:**
- Liga Portuguesa Contra o Cancro - https://www.ligacontracancro.pt/ - national cancer league, YARN beneficiary, ran the OACCUs AYA project (2022-2024), but has no AYA section (news items only).
- Fundação Rui Osório de Castro - adolescent diagnosis guide https://froc.pt/diagnostico-de-um-cancro-para-adolescentes-e-jovens-adultos/ (from search, not fetched).
- No AYA-specific Portuguese association was found (AAPC, Careca Power, APLL, Evita are general or disease-specific).

## Countries with no suitable resource

- **Malta (MT):** nothing AYA-specific. Checked Puttinu Cares (children only, fetched), National Cancer Platform, Lumiere Support Group (haematology), Europa Donna Malta (breast), Hospice Malta, Karl Vella Foundation, Malta Community Chest Fund; a 25-40 peer group mentioned in a Lovin Malta article has no organisation or website. Maltese AYA patients are often treated in the UK, so the UK card may be a reasonable fallback.
- **Monaco (MC):** only Fondation Flavien (paediatric), Écoute Cancer Réconfort / GEMLUC (general) and the Centre Scientifique de Monaco (research). French resources apply in practice.
- **Andorra (AD):** only ASSANDCA (general cancer association) and the La Massana oncology support programme. Spanish/French resources apply.
- **San Marino (SM):** only the ISS state health service oncology unit and unnamed volunteer groups. Italian resources apply.
- **Vatican City (VA):** nothing; only papal audiences with Italian cancer organisations (AIL, LILT).


---

## Central and eastern Europe

# R3 – National AYA cancer resources: PL, RO, CZ, SK, HU, LT, LV, EE, UA, MD, BY

Researched 20 Oct 2026. Every chosen URL was fetched and confirmed to be about young people with cancer; final URLs after redirects are recorded. Logos are in `../logos/` (`<ISO2>-<lang>.<ext>`). Machine-readable version: `R3.json` (entries with `"status": "none"` have `url: null`; their `confidence` refers to the negative result).

## Summary table

| Country | Chosen resource | URL | lang | Logo | Confidence |
|---|---|---|---|---|---|
| Poland | Fundacja Pani Ani – AYA Survivors Academy | https://fundacjapaniani.org/ | pl | yes (PL-pl.jpg) | medium |
| Romania | Clubul Temerarii (Asociația Little People) | https://www.thelittlepeople.ro/ro/despre-noi/cum-facem/temerarii/ | ro | yes (RO-ro.png) | high |
| Czechia | Fuck Cancer, z.s. | https://www.fuckcancer.cz/ | cs | yes (CZ-cs.svg) | medium |
| Slovakia | Liga 18-25 (Liga proti rakovine) | https://www.lpr.sk/liga-18-25/ | sk | yes (SK-sk.png) | high |
| Hungary | Érintettek Egyesület | https://erintettek.hu/ | hu | yes (HU-hu.png) | low |
| Lithuania | none suitable | – | lt | – | – |
| Latvia | none suitable | – | lv | – | – |
| Estonia | none suitable | – | et | – | – |
| Ukraine | none suitable | – | uk | – | – |
| Moldova | Clubul Temerarii (Little People; cross-border) | https://www.thelittlepeople.ro/ro/despre-noi/cum-facem/temerarii/ | ro | yes (MD-ro.png, copy of RO) | low |
| Belarus | none suitable | – | ru | – | – |

---

## Poland (PL) – Fundacja Pani Ani – AYA Survivors Academy — confidence: medium

- **URL:** https://fundacjapaniani.org/ (HTTP 200, no redirect; single-page site, PL/EN toggle, `html lang="pl"`, Last-Modified 6 Aug 2026)
- **Why:** The only Polish organisation that is explicitly AYA-specific and national: "Polska sieć dla nastolatków i młodych dorosłych po chorobie nowotworowej (AYA survivors)", peer-led, founded 2004 in Kraków (KRS 0000209091), programmes AYA Survivors Academy (workshops, camps, group sessions), mentoring, advocacy ("right to be forgotten"); associated partner of EU-CAYAS-NET; presented the "A'YA?! Polish Network for AYA Survivors" session on the YARN platform (June 2024).
- **Caveats:** Focus is survivors (after treatment); no explicit age range; no dated news on the site (activity evidenced by server dates and third-party sources). Logo only as JPEG (1244x1134, white background): https://fundacjapaniani.org/assets/images/aya/logo-fundacja.jpg
- **Rejected alternates:**
  - Fundacja Rak'n'Roll. Wygraj Życie! (https://www.raknroll.pl/) – general foundation, all ages, no AYA section (Onkopłodność fertility site and iPoRaku after-treatment group are the closest).
  - Alivia Onkofundacja (https://alivia.org.pl/) – general, no AYA page.
  - Fundacja OnkoCafe – Razem Lepiej (https://onkocafe.pl/) – general, no AYA page.
  - Fundacja PoCancerowani (https://pocancerowani.pl/) – cited in AYA-month campaigns, but site blocks automated access (Cloudflare 403) and the KRS record reportedly carries a 2019 liquidation resolution; unverifiable.
  - Fundacja Cancer Fighters (https://cancerfighters.pl/) – nationwide, all ages; only a teen-stories section.
  - NIO AYA guidelines / KOM training – professional material, not patient-facing.

## Romania (RO) – Clubul Temerarii, Asociația Little People — confidence: high

- **URL:** https://www.thelittlepeople.ro/ro/despre-noi/cum-facem/temerarii/ (HTTP 200)
- **Why:** Established national community of adolescent and young-adult cancer survivors (300+ members from 85+ localities; outings, summer camp and Christmas gala in their 6th edition, career guidance, reintegration support, free Temerarii magazine). Little People is a YARN partner; latest news May 2026; Temerarii camp 2026 announced.
- **Caveats:** Members were treated in paediatric oncology (ages 14-29 per the "Ce facem" page; press says 18-35); young adults diagnosed in adult oncology are not the core audience. Logo is the 140x73 transparent header PNG (no larger version on site). EN/RU site versions exist.
- **Alternates:**
  - Resurse: Adolescenți și tineri (https://www.thelittlepeople.ro/ro/resurse/adolescenti-si-tineri/) – information page with magazine PDFs, interviews and articles; older content; good secondary link if an information page is preferred.
  - Registration form (https://www.thelittlepeople.ro/ro/inregistreaza-te-in-clubul-temerarii/).
  - Youth Cancer Europe (https://www.youthcancereurope.org/) – European network headquartered in Cluj, English; not national.
  - FABC (https://fabc.ro/) – national umbrella, not AYA.
  - temerarii.ro – unrelated TV show; do not use.

## Czechia (CZ) – Fuck Cancer, z.s. — confidence: medium

- **URL:** https://www.fuckcancer.cz/ (HTTP 200; EN at /en)
- **Why:** Ministry-of-Health-listed patient organisation founded and run by young (former) cancer patients; online community, stories, podcasts, financial support, map of support contacts, awareness "primarily among young patients"; news Aug 2026. No Czech organisation covers the full 15-39 range; this is the closest national, active, youth-flavoured one.
- **Caveats:** Not formally age-restricted. The maintainers should decide whether the name is acceptable for the portal; if not, use Společně k úsměvu.
- **Rejected alternates:**
  - Společně k úsměvu, z.s. (https://www.spolecnekusmevu.cz/) – young people treated in paediatric oncology; nationwide aim, ASTRA late-effects programme, news Apr 2026; good second choice but excludes people diagnosed as adults.
  - Nadační fond Pink Bubble (https://www.pinkbubble.cz/) – children and young people (recipients roughly 10-18).
  - Linkos.cz AYA page (https://www.linkos.cz/pacient-a-rodina/lecba/vekova-specifika/specifika-pece-o-mlade-dospele-se-zhoubnymi-nadory/) – Czech Oncological Society information page on young adults, but dated 2007 and without support-organisation links.
  - Bellis (https://www.bellisky.cz/) – young women with breast cancer only.

## Slovakia (SK) – Liga 18-25, Liga proti rakovine SR — confidence: high

- **URL:** https://www.lpr.sk/liga-18-25/ (HTTP 200)
- **Why:** The national cancer league's dedicated group for people aged 18-25 who have or had cancer: monthly meetings (first Monday, from 5 Oct 2026) at the Centrum pomoci in Bratislava, led by a young patient guide, plus trips; registration by e-mail.
- **Caveats:** New programme (page may change – fall back to https://www.lpr.sk/); in-person in Bratislava; 18-25 is narrower than 15-39. Logo PNG 200x71.
- **Rejected alternates:** OZ Lymfoma a Leukémia Slovensko (https://lymfom.sk/) – diagnosis-specific; Nie rakovine – general; Liga proti rakovine main site – general services.

## Hungary (HU) – Érintettek Egyesület — confidence: low

- **URL:** https://erintettek.hu/ (HTTP 200; survivorship page https://erintettek.hu/kezeles-utan/)
- **Why:** Hungarian YARN partner and the only verified, active (news 4 Oct 2026) organisation with a community of young cancer survivors: after-treatment information, late-effects booklets, PanCare summaries, stories, helpline, Érintettek Akadémia.
- **Caveats:** Framed around childhood cancer (survivors, parents, GPs); young adults diagnosed in adult oncology are not covered. Logo PNG 187x71.
- **Rejected / unverifiable alternates:**
  - Magyar Rákellenes Liga – "Fiatal rákbetegek klubja" (https://rakliga.hu/hogyan-segitunk/klubjaink/) – the national cancer league's young patients' club in Budapest would be the preferred pick, but rakliga.hu blocks automated access (Cloudflare 403, also on dev.rakliga.hu); last confirmed listings 2019. Please check manually.
  - Rákbetegek Országos Szervezete "Fiatal Rák-Barát Klub" – archived page, likely inactive.
  - Együtt a Daganatos Gyermekekért Alapítvány "Gyógyult Fiatalok Klubja" (https://dgy.hu/) – childhood-cancer foundation.
  - Bátor Tábor – camps for ages 7-18.

## Lithuania (LT) – none suitable

Checked: POLA (https://pola.lt/, national coalition, YARN platform coordinator, Youth Cancer Europe member – no youth page, news Oct 2026); its member "Onkologinės ligos paliesto jaunimo asociacija" (Onkojaunimas, contact onkojaunimas@gmail.com – no website found); Nacionalinis vėžio institutas patient-group list (fetch failed); Mamų unija, Rugutė (children); priesvezi.lt, onkologija.lt (general). Closest general fallback: POLA. Suggest asking POLA whether Onkojaunimas has a public page.

## Latvia (LV) – none suitable

Checked: "Kopā Ceļā" youth cancer community of Bērnu slimnīcas fonds (only AYA-specific initiative found; its page https://www.bsf.lv/lv/ziedot/kam-ziedot/kopa-cela-atbalsta-kopiena-jauniesiem-ar-onkologisku-saslimsanu-1 now returns 404 and no own website/social channel exists); Dzīvības koks (https://www.dzivibaskoks.lv/lv/, national, no youth programme, news Sep 2026 – closest general fallback); Par Dzīvot (general); BSF oncology project pages (no youth community).

## Estonia (EE) – none suitable

Checked: Eesti Vähiliit (https://cancer.ee/) member list – no youth group; Vähiühing KAEV ("working-age" patients; kaev.ee does not resolve); Eesti Vähihaigete Laste Vanemate Liit (parents of children); TÜ Kliinikum support group and regional associations (general). Closest general fallback: Eesti Vähiliit.

## Ukraine (UA) – none suitable

Checked: Inspiration Family (https://inspirationfamily.org/, national adult-patient foundation, YARN partner, active 2026 – no AYA programme; closest fallback and natural contact); "Із янголом на плечі" (https://www.angelfund.com.ua/, Lviv-based children/youth fund plus military aid); Таблеточки (under 18); Athena (women); Svoї (adults); Youth Cancer Europe Ukrainian site (European, not national).

## Moldova (MD) – Clubul Temerarii (Little People), cross-border — confidence: low

Same page and logo as Romania (MD-ro.png). Little People runs its psychosocial programme in the Chișinău Oncology Institute's paediatric wards, the Temerarii club lists a Chișinău coordinator and Moldovan survivors join its national events. Use only if a cross-border, Romanian-language resource is acceptable; otherwise treat as "none". Checked alternates: Asociația „Viața continuă" (first Moldovan survivors' association, Feb 2025, general, no website found); Viața fără Leucemie (children). A Russian version of the Little People site exists (https://www.thelittlepeople.ro/ru/).

## Belarus (BY) – none suitable

Checked: oncopatient.by (community/information site of the Minsk "Центр поддержки онкопациентов", events Oct 2026, no youth content); UniHelp (children); Belarusian Society of Oncologists (professional). Russian-language searches for young-adult organisations found only dated general support groups.


---

## South-eastern Europe and the Caucasus

# R4 – National AYA cancer resources: Greece, Cyprus, Bulgaria, Slovenia, Croatia, Serbia, Bosnia and Herzegovina, Montenegro, North Macedonia, Albania, Kosovo, Turkey, Russia, Georgia, Armenia, Azerbaijan

Researched 2026-10-20. All chosen URLs were fetched and checked; final URLs after redirects are given. Logos are in `../logos/`.
General finding: none of these countries has an established AYA-specific organisation of the kanker.nl/jong or Teenage Cancer Trust type. The five entries below are the closest credible fits: national organisations or programme pages for *young people who had cancer* (mostly survivors of childhood/adolescent cancer). None is a service for people first diagnosed at 18–39, so the maintainers may decide these are not good enough; the notes say so explicitly. The YARN associated-partner list (https://beatcancer.eu/yarn/) was used as a cross-check: it names partners in GR, CY, BG, SI and HR only.

## Chosen resources

### GR – Greece: Κύτταρο — https://tokyttaro.gr/ — lang el — confidence medium — logo GR-el.png
Pan-Hellenic association of people who had cancer in childhood or adolescence, founded and run by young survivors; information events, seminars, late-effects awareness, support. Newest post July 2025. YARN associated partner.
Rejected alternates:
- Καρκινάκι, https://karkinaki.gr/ – very active national information site on childhood and adolescent cancer (psychological support, Parent2Parent); aimed at families/under-18s; good second choice for the 15–18 segment.
- Ελληνική Αντικαρκινική Εταιρεία, https://cancerhellas.org/ – YARN coordinator; site behind a Cloudflare bot challenge, no AYA page verifiable.
- Κάπα3, https://www.kapa3.gr – general patient guidance centre.
- ΕΛΛΟΚ (Hellenic Cancer Federation) – umbrella federation, no AYA page found.

### SI – Slovenia: Ustanova Mali vitez — https://ustanova-malivitez.si/ — lang sl — confidence medium — logo SI-sl.png
Foundation "for young people cured of cancer": psychological and medical counselling, late-effects follow-up, regional self-help groups, scholarships, rehabilitation camps. Describes itself as the only Slovenian NGO in this field. Newest post 13 Oct 2026. YARN associated partner.
Rejected alternates:
- Inštitut Zlata pentljica, https://zlatapentljica.si/ – children with cancer; runs the "Nisem nevidna" campaign about under-18s; no teen/young-adult programme page.
- Europa Donna Slovenija, https://europadonna.si/ – breast cancer; YARN beneficiary; not AYA.
- Onkološki inštitut Ljubljana – late-effects clinic exists, no young-adult information page found.

### HR – Croatia: Mladi Krijesnice (Udruga Krijesnica) — https://krijesnica.hr/mladi-krijesnice/ — lang hr — confidence medium — logo HR-hr.png
Programme page of the national children's cancer association for members over 16 who had cancer "in childhood or early adulthood": monthly meetups, individual psychological support, education, camps, advocacy. Site active (Oct 2026); programme page undated. YARN associated partner. Logo is the association's logo (no separate youth mark).
Rejected alternates:
- Hrvatska liga protiv raka, https://www.hlpr.hr/ – umbrella league, no AYA page.
- Udruga P.I.N.K. life, Nisi sama – prevention / breast-cancer groups, not age-specific (not verified).

### RS – Serbia: MladiCe — https://info.mladice.org/ (www.mladice.org redirects here) — lang sr — confidence medium — logo RS-sr.png
Network of young people treated for cancer in childhood/adolescence (founded 2011); the site offers 44 plain-language publications for young people and families: during treatment, psychological health, life after treatment, education and career. Peer-support line (e-mail/WhatsApp/Messenger) is run with Udruženje Čika Boca according to press (Danas). Pages undated; uploads 2025–2026.
Rejected alternates:
- Udruženje Čika Boca – children's association co-running MladiCe peer support (not fetched).
- NURDOR, https://www.nurdor.org/ – parents of children with cancer.
- Zvončica, Uvek sa decom – children's charities.

### BA – Bosnia and Herzegovina: MladiCe (Srce za djecu) — https://srcezadjecu.ba/bs/sta-radimo/mladice — lang bs — confidence low — logo BA-bs.png
Dedicated page of the Federation-of-BiH children's cancer association for its group of ~60 young survivors (empowerment, scholarships, late-effects follow-up, volunteering, awareness). Page undated (footer 2016) though the site posts news dated Sept 2026; covers the Federation (Sarajevo, Tuzla), not Republika Srpska. Logo only 293 px wide. Site also in English (/en).
Rejected alternates:
- Srce za djecu main site, https://srcezadjecu.ba/ – children's charity as a whole.
- Patient groups in the 2024 Takeda disclosure (myeloma, prostate) – not AYA.

## Countries where nothing suitable was found

- **CY – Cyprus**: none. Checked ΠΑΣΥΚΑΦ / PASYKAF (https://pasykaf.org/, YARN associated partner; psychosocial programmes ΑλλάΖΩ/ΦροντίΖΩ/ΣυνεχίΖΩ are not age-specific; youth activity is school prevention only) and the Cyprus Anti-Cancer Society (https://anticancersociety.org.cy/, full menu reviewed, no youth page). "Ένα Όνειρο Μια Ευχή" is a children's charity.
- **BG – Bulgaria**: none. Checked Фондация "Злато"/Foundation Gold (https://www.fgold.org/, YARN associated partner: paediatric clinic support at Tsaritsa Joanna–ISUL, summer camps for children and "youth over 10", "Golden Care" centre; mission mentions adolescents/young adults but there is no AYA page; footer 2023) and АПОЗ (general patient association, no youth programme). Bulgarian-language searches returned only beatcancer.eu/bg material.
- **ME – Montenegro**: none. Only NVO "Fenix Crna Gora" (parents of children with cancer) appears; a young survivor spoke at its 2025/26 childhood-cancer-day event, but there is no youth programme or website for young adults.
- **MK – North Macedonia**: none. "Борка – за секој нов ден" (https://borka.org.mk/, general cancer association; site returned HTTP 522 / empty response on two attempts), ОДРАЗ Bitola (psychosocial support, all ages), ХЕМА (haematology patients). No youth-specific group found.
- **AL – Albania**: none. Searches in Albanian returned only statistics, the planned National Oncology Institute, and Kosovo organisations; no Albanian patient organisation for young people.
- **XK – Kosovo**: none. Renesansa (Prizren; women with breast cancer, UICC member), "Action for Health" (programme for children who survived cancer, run with IPKO/BONEVET, no website found), Association of Oncologists of Kosovo (professional body).
- **TR – Turkey**: none AYA-specific. Checked Türk Kanser Derneği (https://turkkanserdernegi.org/, general, founded 1964), Kanserle Dans Derneği (patient-founded, focus breast/colon/lung/gynaecological cancers, no website found, Facebook/Instagram only), Genç Birikim Derneği (https://gencbirikim.org/kanser – youth association in Muş/Ankara with a cancer programme; page lists only five headings, no target group or dates, footer 2023; too thin and regional). LÖSEV/KAÇUV are paediatric.
- **RU – Russia**: none AYA-specific. Фонд «Подари жизнь» (https://podari-zhizn.ru/, children and young adults up to 25 treated in paediatric clinics; no "молодые взрослые" page found in its navigation), «Добрый дом» (up to 23/25, same model), AdVita (children and adults), «Онкологика» (adults 18+, closed "Следуй за мной" community), Фонд борьбы с лейкемией (adults with blood cancers). Two Russian-language searches found no AYA community or page.
- **GE – Georgia**: none. Pink Space Centre (breast cancer, Tbilisi), Youth for Public Health (prevention NGO), Georgia Patients' Union (general). Georgian-language search found nothing for young adults with cancer.
- **AM – Armenia**: none strictly AYA. City of Smile Charitable Foundation (https://cityofsmile.org/, Armenian and English) pays for treatment of children and young adults up to 25 and calls itself the only Armenian foundation for "children and young adults battling cancer", but its site is paediatric ("Kids can't fight cancer alone") with no young-adult page. Maintainers could use it if a 0–25 foundation is acceptable; logo would be https://cityofsmile.org/wp-content/uploads/2022/03/ct-logo-1.svg (not downloaded).
- **AZ – Azerbaijan**: none. Azerbaijani-language search returned only the Azerbaijan Youth Foundation (not health-related) and foreign organisations.
