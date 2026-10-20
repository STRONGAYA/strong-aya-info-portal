// STRONG-AYA Info Portal — the English text that the scripts generate (glossary, help, the dialogs,
// the figure and table, the beatcancer.eu block, the national website card, the language dialog).
// English is the source: scripts/translate_site.py translates this file into web/i18n/<lang>.js with
// DeepL, so everything after the "=" must be strict JSON (double quotes, no comments, no trailing
// commas). portal.js and visualisation.js read the text with t('group.key', { name: value }):
// {name} placeholders are filled in, and an entry with "one"/"other" forms is picked by the number
// in {count} (Intl.PluralRules; reviewers add the forms their language needs, e.g. "few", "many").
window.AYA_STRINGS = {
  "language": {
    "title": "Language",
    "intro": "Choose the language of the portal. The pages in other languages are translations of the English pages.",
    "current": "current language",
    "statusSource": "original",
    "statusMachine": "translated automatically, not yet checked by a person",
    "statusReviewed": "translated and checked by a person",
    "statusBrowser": "translated by your browser",
    "noticeMachine": "This page was translated automatically with DeepL and has not yet been checked by a person. If in doubt, the English version applies.",
    "noticeReviewed": "This page was translated with DeepL and checked by {reviewer} in {month}. If in doubt, the English version applies.",
    "noticeBrowser": "This page is translated by your browser. The translation is automatic and may contain mistakes. If in doubt, the English version applies.",
    "noticeEnglish": "English version",
    "browserTitle": "Not in your language?",
    "browserIntro": "Your browser can translate this page on your device. The translation is automatic and may contain mistakes; the portal itself does not send or receive anything for it.",
    "browserSelect": "Translate into",
    "browserButton": "Translate with your browser",
    "browserOriginal": "Show the English version",
    "browserDownloading": "Your browser is downloading the language ({percent}%)…",
    "browserTranslating": "Translating…",
    "browserDone": "Translated.",
    "browserFailed": "Your browser could not translate this page.",
    "browserUnavailable": "Your browser cannot translate into this language.",
    "browserHelp": "Your browser may be able to translate this page itself: look for a translate option in the address bar, or in the menu that opens with a right click on the page. The translation is then made by your browser, not by the portal."
  },
  "ui": {
    "close": "Close",
    "cancel": "Cancel",
    "apply": "Apply",
    "all": "All",
    "comingSoon": "Coming soon",
    "opensInNewTab": "(opens in a new tab)",
    "opensInNewTabFrom": "({site}, opens in a new tab)",
    "offsiteNote": "This link does not work in this test version. You can visit strongaya.eu yourself, but from there you cannot get back to this test portal.",
    "glossaryTitle": "Glossary",
    "glossaryIntro": "What the words on this page mean.",
    "helpTitle": "Help",
    "helpIntro": "How to use this page.",
    "viewButton": "View: {view}",
    "viewSelection": "View Selection",
    "viewSelectionHint": "Click to select visualisation type",
    "viewTitle": "Choose how you want to see this information",
    "viewIntro": "Pick the option that works best for you.",
    "legend": "Legend",
    "iconArray": "Icon array",
    "pieChart": "Pie chart",
    "barChart": "Bar chart",
    "tableCaption": "{subject}: all topics",
    "tableTopic": "Topic",
    "tableGroup": "Group",
    "tableOutOf100": "Out of 100 people",
    "tableMeaning": "What it means",
    "tableThisPage": "(this page)",
    "tableNoData": "No data available",
    "loadingTable": "Loading the table…",
    "thisSubject": "This subject",
    "pieTitle": "{title} (n={total})",
    "barTitle": "{title} (Total: {total})",
    "barXAxis": "Group",
    "barYAxis": "Number of people",
    "distribution": "Distribution",
    "numbersByGroup": "Numbers by group",
    "thisTopic": "this topic",
    "selectedFilters": "selected filters"
  },
  "messages": {
    "noData": "No data available.",
    "loadError": "We could not load the data. Please try again later.",
    "chartError": "We could not show the chart. Please reload the page.",
    "needsGroups": "This detailed view needs data with at least 3 groups. This data has {count}.",
    "insufficient": "There is insufficient data for the filter combination <b>{filters}</b> and the outcome <b>{outcome}</b> to display anything.",
    "comeBack": "Please consider coming back later when more data is included.",
    "summary": "{kind} of {total} people. {parts}.",
    "summaryPart": "{count} out of {total}: {description}"
  },
  "views": {
    "iconArraySimple": {
      "name": "Simple icon array",
      "description": "Person icons in two groups — simple and clear"
    },
    "iconArrayComplex": {
      "name": "Complex icon array",
      "description": "Person icons in more groups — more detail"
    },
    "table": {
      "name": "Data table",
      "description": "A table with the numbers of all topics in this subject"
    },
    "pieChart": {
      "name": "Pie chart",
      "description": "A circle chart that shows the share of each group"
    },
    "barChart": {
      "name": "Bar chart",
      "description": "Bars that make the groups easy to compare"
    }
  },
  "subjects": {
    "treatment": "Treatment information",
    "functioning": "Functioning after treatment",
    "mental_health": "Mental health",
    "relationships": "Intimacy and relationships"
  },
  "topics": {
    "chemotherapy": "Chemotherapy",
    "radiotherapy": "Radiotherapy",
    "hormonetherapy": "Hormone therapy",
    "emotional_functioning": "Emotional functioning",
    "physical_functioning": "Physical functioning",
    "role_functioning": "Role functioning",
    "anxiety": "Anxiety",
    "depression": "Depression",
    "worry": "Worry",
    "mental_health_support": "Mental health support",
    "romantic_life": "Romantic life",
    "sex_life": "Sex life",
    "relationships": "Relationships",
    "self_esteem": "Self-esteem"
  },
  "legends": {
    "treatment": {
      "simple": {
        "received": { "label": "Received treatment", "description": "People who receive this treatment" },
        "notReceived": { "label": "Did not receive", "description": "People who do not receive this treatment" }
      },
      "complex": {
        "received": { "label": "Completed treatment", "description": "People who completed the whole treatment" },
        "partial": { "label": "Partial treatment", "description": "People who received a part of the treatment" },
        "planned": { "label": "Planned", "description": "People whose treatment is planned but has not started yet" },
        "notReceived": { "label": "Not received", "description": "People who did not receive the treatment" }
      }
    },
    "functioning": {
      "simple": {
        "declined": { "label": "Declined", "description": "People whose score got worse" },
        "stable": { "label": "Stable or improved", "description": "People whose score stayed about the same or got better" }
      },
      "complex": {
        "significantly_declined": { "label": "Declined a lot", "description": "People whose score got much worse" },
        "declined": { "label": "Declined", "description": "People whose score got worse" },
        "stable": { "label": "Stable", "description": "People whose score stayed about the same" },
        "improved": { "label": "Improved", "description": "People whose score got better" }
      }
    },
    "symptoms": {
      "simple": {
        "present": { "label": "Present", "description": "People who have this symptom" },
        "absent": { "label": "Absent", "description": "People who do not have this symptom" }
      },
      "complex": {
        "severe": { "label": "Severe", "description": "People with severe symptoms" },
        "moderate": { "label": "Moderate", "description": "People with moderate symptoms" },
        "mild": { "label": "Mild", "description": "People with mild symptoms" },
        "none": { "label": "None", "description": "People without symptoms" }
      }
    },
    "default": {
      "simple": {
        "yes": { "label": "Yes", "description": "Positive/Yes" },
        "no": { "label": "No", "description": "Negative/No" }
      }
    },
    "anxiety": {
      "simple": {
        "signs": { "label": "Signs of anxiety", "description": "People whose HADS answers show signs of anxiety (score 8 or higher)" },
        "noSigns": { "label": "No signs", "description": "People whose HADS answers show no signs of anxiety (score 0 to 7)" }
      },
      "complex": {
        "severe": { "label": "Strong signs", "description": "People with strong signs of anxiety (HADS score 15 to 21)" },
        "moderate": { "label": "Clear signs", "description": "People with clear signs of anxiety (HADS score 11 to 14)" },
        "mild": { "label": "Mild signs", "description": "People with mild signs of anxiety (HADS score 8 to 10)" },
        "none": { "label": "No signs", "description": "People with no signs of anxiety (HADS score 0 to 7)" }
      }
    },
    "depression": {
      "simple": {
        "signs": { "label": "Signs of depression", "description": "People whose HADS answers show signs of depression (score 8 or higher)" },
        "noSigns": { "label": "No signs", "description": "People whose HADS answers show no signs of depression (score 0 to 7)" }
      },
      "complex": {
        "severe": { "label": "Strong signs", "description": "People with strong signs of depression (HADS score 15 to 21)" },
        "moderate": { "label": "Clear signs", "description": "People with clear signs of depression (HADS score 11 to 14)" },
        "mild": { "label": "Mild signs", "description": "People with mild signs of depression (HADS score 8 to 10)" },
        "none": { "label": "No signs", "description": "People with no signs of depression (HADS score 0 to 7)" }
      }
    },
    "worry": {
      "simple": {
        "worryALot": { "label": "Worry a lot", "description": "People who say they worry very much or quite a bit" },
        "worryLittle": { "label": "Worry a little or not", "description": "People who say they worry a little or not at all" }
      },
      "complex": {
        "veryMuch": { "label": "Very much", "description": "People who say they worry very much" },
        "quiteABit": { "label": "Quite a bit", "description": "People who say they worry quite a bit" },
        "aLittle": { "label": "A little", "description": "People who say they worry a little" },
        "notAtAll": { "label": "Not at all", "description": "People who say they do not worry" }
      }
    },
    "mental_health_support": {
      "simple": {
        "received": { "label": "Received support", "description": "People who say they received mental health support" },
        "notReceived": { "label": "No support", "description": "People who say they did not receive mental health support" }
      }
    },
    "romantic_life": {
      "simple": {
        "affectedALot": { "label": "Affected a lot", "description": "People who say their romantic life has been affected quite a bit or very much" },
        "affectedLittle": { "label": "A little or not at all", "description": "People who say their romantic life has been affected a little or not at all" }
      },
      "complex": {
        "veryMuch": { "label": "Very much", "description": "People who say their romantic life has been affected very much" },
        "quiteABit": { "label": "Quite a bit", "description": "People who say their romantic life has been affected quite a bit" },
        "aLittle": { "label": "A little", "description": "People who say their romantic life has been affected a little" },
        "notAtAll": { "label": "Not at all", "description": "People who say their romantic life has not been affected" }
      }
    },
    "sex_life": {
      "simple": {
        "affectedALot": { "label": "Affected a lot", "description": "People who say their sex life has been affected quite a bit or very much" },
        "affectedLittle": { "label": "A little or not at all", "description": "People who say their sex life has been affected a little or not at all" }
      },
      "complex": {
        "veryMuch": { "label": "Very much", "description": "People who say their sex life has been affected very much" },
        "quiteABit": { "label": "Quite a bit", "description": "People who say their sex life has been affected quite a bit" },
        "aLittle": { "label": "A little", "description": "People who say their sex life has been affected a little" },
        "notAtAll": { "label": "Not at all", "description": "People who say their sex life has not been affected" }
      }
    },
    "relationships": {
      "simple": {
        "affectedALot": { "label": "Affected a lot", "description": "People who say their relationships have been affected quite a bit or very much" },
        "affectedLittle": { "label": "A little or not at all", "description": "People who say their relationships have been affected a little or not at all" }
      },
      "complex": {
        "veryMuch": { "label": "Very much", "description": "People who say their relationships have been affected very much" },
        "quiteABit": { "label": "Quite a bit", "description": "People who say their relationships have been affected quite a bit" },
        "aLittle": { "label": "A little", "description": "People who say their relationships have been affected a little" },
        "notAtAll": { "label": "Not at all", "description": "People who say their relationships have not been affected" }
      }
    },
    "self_esteem": {
      "simple": {
        "affectedALot": { "label": "Affected a lot", "description": "People who say their self-esteem has been affected quite a bit or very much" },
        "affectedLittle": { "label": "A little or not at all", "description": "People who say their self-esteem has been affected a little or not at all" }
      },
      "complex": {
        "veryMuch": { "label": "Very much", "description": "People who say their self-esteem has been affected very much" },
        "quiteABit": { "label": "Quite a bit", "description": "People who say their self-esteem has been affected quite a bit" },
        "aLittle": { "label": "A little", "description": "People who say their self-esteem has been affected a little" },
        "notAtAll": { "label": "Not at all", "description": "People who say their self-esteem has not been affected" }
      }
    }
  },
  "glossary": {
    "common": [
      { "term": "AYA", "definition": "Adolescents and Young Adults: people who were between 15 and 39 years old when they were diagnosed with cancer." },
      { "term": "Icon array", "definition": "The figure shown on this page. Each person icon stands for 1 out of 100 people. The coloured icons show how many people this happens to." },
      { "term": "SURVAYA study", "definition": "A Dutch study of about 3300 AYAs who were treated in university medical centres in the Netherlands. The numbers shown here are test numbers based on this study." },
      { "term": "Blood cancers", "definition": "Cancers of the blood, bone marrow or lymphatic system, such as leukaemia and lymphoma." },
      { "term": "Solid tumours", "definition": "Cancers that form a lump in an organ or tissue. Examples at a young age are breast, testicular, ovarian, thyroid, bone and soft tissue cancers." },
      { "term": "Skin cancer", "definition": "Cancers of the skin, such as melanoma." },
      { "term": "Brain and nervous system tumours", "definition": "Tumours of the brain, spinal cord or nerves." }
    ],
    "chemotherapy": [
      { "term": "Chemotherapy", "definition": "Treatment with medicines that kill cancer cells or slow their growth in the whole body. You often get it through a drip (infusion) or as tablets." }
    ],
    "radiotherapy": [
      { "term": "Radiotherapy", "definition": "Treatment that aims strong rays (radiation) at one part of the body to destroy the cancer cells there." }
    ],
    "hormonetherapy": [
      { "term": "Hormone therapy", "definition": "Treatment that blocks or lowers the hormones that some cancers need to grow, for example some breast and prostate cancers." }
    ],
    "emotional_functioning": [
      { "term": "Emotional functioning", "definition": "How someone feels emotionally: for example tense, worried, irritable or down. It is measured with the EORTC QLQ-C30 questionnaire." },
      { "term": "Declined", "definition": "The emotional functioning score is clearly lower (worse) than the value it is compared with." },
      { "term": "Stable", "definition": "The emotional functioning score is about the same as the value it is compared with." },
      { "term": "EORTC QLQ-C30", "definition": "A questionnaire that is used in many countries to measure the quality of life of people with cancer." }
    ],
    "physical_functioning": [
      { "term": "Physical functioning", "definition": "How well someone can do everyday physical activities, such as walking, climbing stairs, carrying shopping or washing themselves. It is measured with the EORTC QLQ-C30 questionnaire." },
      { "term": "Declined", "definition": "The physical functioning score is clearly lower (worse) than the value it is compared with." },
      { "term": "Stable", "definition": "The physical functioning score is about the same as the value it is compared with." },
      { "term": "EORTC QLQ-C30", "definition": "A questionnaire that is used in many countries to measure the quality of life of people with cancer." }
    ],
    "role_functioning": [
      { "term": "Role functioning", "definition": "How well someone can do their daily tasks: work, study, tasks at home and hobbies. It is measured with the EORTC QLQ-C30 questionnaire." },
      { "term": "Declined", "definition": "The role functioning score is clearly lower (worse) than the value it is compared with." },
      { "term": "Stable", "definition": "The role functioning score is about the same as the value it is compared with." },
      { "term": "EORTC QLQ-C30", "definition": "A questionnaire that is used in many countries to measure the quality of life of people with cancer." }
    ],
    "anxiety": [
      { "term": "Anxiety", "definition": "Feeling tense, nervous or afraid. Some anxiety is normal, but strong anxiety can make daily life hard." },
      { "term": "HADS", "definition": "The Hospital Anxiety and Depression Scale: a short list of questions that measures signs of anxiety and depression." },
      { "term": "Signs of anxiety", "definition": "A HADS anxiety score of 8 or higher. It does not mean someone is ill; it means their answers point to anxiety." }
    ],
    "depression": [
      { "term": "Depression", "definition": "Feeling down, sad or empty for a long time, and enjoying things less than before." },
      { "term": "HADS", "definition": "The Hospital Anxiety and Depression Scale: a short list of questions that measures signs of anxiety and depression." },
      { "term": "Signs of depression", "definition": "A HADS depression score of 8 or higher. It does not mean someone is ill; it means their answers point to depression." }
    ],
    "worry": [
      { "term": "Worry", "definition": "Thinking a lot about things that could go wrong, for example about health, work or the future." },
      { "term": "EORTC QLQ-AYA", "definition": "A list of questions made for young people with cancer. It asks about worry and other things that matter at a young age." }
    ],
    "mental_health_support": [
      { "term": "Mental health support", "definition": "Help for your feelings and thoughts, for example from a psychologist, a counsellor or a support group." },
      { "term": "Self-reported", "definition": "People answered the question themselves. The answer was not checked in medical records." }
    ],
    "romantic_life": [
      { "term": "Romantic life", "definition": "Dating, falling in love and being in a relationship with a partner." },
      { "term": "Affected a lot", "definition": "Answering \"quite a bit\" or \"very much\" when asked if cancer has had a bad effect on your romantic life." },
      { "term": "EORTC QLQ-AYA", "definition": "A list of questions made for young people with cancer. It asks about romantic life, sex life, relationships and other things that matter at a young age." }
    ],
    "sex_life": [
      { "term": "Sex life", "definition": "Having sex and being physically close to someone, and how you feel about that." },
      { "term": "Affected a lot", "definition": "Answering \"quite a bit\" or \"very much\" when asked if cancer has had a bad effect on your sex life." },
      { "term": "EORTC QLQ-AYA", "definition": "A list of questions made for young people with cancer. It asks about romantic life, sex life, relationships and other things that matter at a young age." }
    ],
    "relationships": [
      { "term": "Relationships", "definition": "How you get on with other people. The questions ask, for example, about feeling alone, being treated differently and needing help from others." },
      { "term": "Affected a lot", "definition": "Answering these questions with \"quite a bit\" or \"very much\" on average." },
      { "term": "EORTC QLQ-AYA", "definition": "A list of questions made for young people with cancer. It asks about romantic life, sex life, relationships and other things that matter at a young age." }
    ],
    "self_esteem": [
      { "term": "Self-esteem", "definition": "How you see yourself and how you feel about yourself. The questions ask about confidence, feeling in control of your life and changes to how you look." },
      { "term": "Affected a lot", "definition": "Answering these questions with \"quite a bit\" or \"very much\" on average." },
      { "term": "EORTC QLQ-AYA", "definition": "A list of questions made for young people with cancer. It asks about romantic life, sex life, relationships and other things that matter at a young age." }
    ],
    "modules": [
      { "term": "Subject", "definition": "A theme you can explore, such as treatment information or functioning after treatment. Each subject has several topics." },
      { "term": "Treatment information", "definition": "Numbers about how many AYAs receive treatments such as chemotherapy, radiotherapy and hormone therapy." },
      { "term": "Functioning after treatment", "definition": "Numbers about how AYAs are doing after their treatment: emotionally, physically and in their daily tasks." },
      { "term": "Mental health", "definition": "Numbers about how AYAs feel mentally: anxiety, depression, worry and the support they get." },
      { "term": "AYA", "definition": "Adolescents and Young Adults: people who were between 15 and 39 years old when they were diagnosed with cancer." }
    ]
  },
  "help": {
    "module": [
      "<b>Return to subjects</b> (top left) brings you back to the list of subjects.",
      "<b>View</b> (to the right of the filters) lets you choose how the data is shown: as person icons, a table with all topics of this subject, a pie chart or a bar chart.",
      "<b>Filters</b>: use <b>Cancer type</b> and <b>Sex</b> to see the numbers for one group only. The other filters are coming soon.",
      "Your choice of <b>View</b> and <b>Filters</b> stays the same when you go to another topic.",
      "The <b>figure</b> shows 100 person icons; each icon stands for 1 out of 100 people. The <b>legend</b> next to it explains what each colour means.",
      "Use the <b>arrow buttons</b> below the figure to go to the topic before or after this one.",
      "<b>Explore all topics</b> opens a list of all topics in this subject.",
      "<b>Glossary</b> explains the words used on this page; <b>Compare</b> is coming soon.",
      "<b>Want to know more, or is it overwhelming?</b> (near the bottom) tells you where to find support. It also shows articles about this topic from beatcancer.eu and, if your country has one, a national website for young people with cancer. They open in a new tab.",
      "<b>Country</b> (in the accessibility bar at the top) sets the country for that national website. The portal guesses it from the settings of your browser. You can choose another country there, or let your browser find it with your location.",
      "<b>Language</b> (in the accessibility bar) shows the languages the portal is available in. If yours is not among them, your browser may be able to translate the page.",
      "The note at the end of the page explains where the numbers come from, and how to contact us."
    ],
    "modules": [
      "<b>Return to profiles</b> (top left) brings you back to the start page.",
      "Click a <b>subject card</b> to explore that subject; grey cards are coming soon.",
      "Use the <b>round arrow buttons</b> (or scroll sideways) to see more subject cards.",
      "<b>Explore all subjects</b> opens a list of all subjects.",
      "The order of the subjects depends on the profile you chose on the start page.",
      "<b>Glossary</b> explains the words used on this page.",
      "Use the <b>accessibility buttons</b> below the purple banner to turn on contrast or dark mode.",
      "<b>Country</b> (in the accessibility bar) chooses the country for the national website for young people with cancer on the topic pages.",
      "<b>Language</b> (in the accessibility bar) shows the languages the portal is available in."
    ]
  },
  "beatcancer": {
    "from": "From {site}",
    "yarnLogoAlt": "YARN – European Youth Cancer Network",
    "intro": "Articles about this topic, picked automatically from the library of the European Youth Cancer Network (YARN). They open in a new tab.",
    "credit": "Titles, summaries, images and&nbsp;logo: beatcancer.eu (YARN).",
    "rights": "All rights belong to them.",
    "more": "More on beatcancer.eu:",
    "inEnglish": "These articles are in English.",
    "articleCount": { "one": "{count} article", "other": "{count} articles" }
  },
  "national": {
    "button": "Country: {country}",
    "notChosen": "not chosen",
    "outsideEurope": "Outside Europe",
    "countryInProse": { "*": "{name}", "NL": "the Netherlands", "GB": "the United Kingdom" },
    "askCountry": "Is there a website for young people with cancer in your country?",
    "chooseCountry": "Choose your country",
    "changeCountry": "change country",
    "cardNoteSettings": "A website for young people with cancer in {country}, guessed from the settings of your browser ({change}).",
    "cardNoteChosen": "A website for young people with cancer in {country} ({change}).",
    "cardNotePosition": "A website for young people with cancer in {country}, found with your location ({change}).",
    "logoCredit": "{name} logo: {organisation}.",
    "logoCreditPlain": "Logo: {organisation}.",
    "supportLine": "In {country}, there is also {site}.",
    "cardType": "National · {country}",
    "inLanguage": "In {language}",
    "dialogTitle": "Your country",
    "dialogIntro": "The topic pages can show a website for young people with cancer in your country, next to the articles from beatcancer.eu.",
    "countryLabel": "Country",
    "useLocation": "Use my location",
    "privacy": "Your browser asks you first. The portal uses your location only on this device, to find your country, and does not send or store it.",
    "resultChoose": "Choose your country from the list.",
    "resultArticles": "The topic pages show the articles from beatcancer.eu.",
    "resultArticlesPending": "The topic pages will show the articles from beatcancer.eu.",
    "resultNoSite": "There is no national website for {country} that is referenced in this portal yet: the topic pages show the articles from beatcancer.eu.",
    "resultNoSitePending": "There is no national website for {country} that is referenced in this portal yet: the topic pages will show the articles from beatcancer.eu.",
    "resultSite": "The topic pages show {site} next to the articles from beatcancer.eu.",
    "resultSitePending": "The topic pages will show {site} next to the articles from beatcancer.eu.",
    "pressApply": "Press Apply to use this country.",
    "statusSettings": "Guessed from the settings of your browser.",
    "statusPosition": "Found with your location.",
    "notGuessed": "Your country could not be guessed from the settings of your browser.",
    "finding": "Finding your location…",
    "foundOutside": "Your location is outside Europe.",
    "found": "Found with your location: {country}.",
    "denied": "Your browser did not share your location. You can choose your country from the list.",
    "notFound": "Your location could not be found. You can choose your country from the list."
  }
};
