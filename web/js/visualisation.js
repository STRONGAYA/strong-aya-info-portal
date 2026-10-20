/**
 * STRONG-AYA Info Portal Visualisation Module
 * Handles icon array, table, and pie chart visualisations using Plotly.js
 * Loads the counts per category from web/data/<variable>.csv
 * Supports multiple page types and visualisation variants
 * Uses brand colour theme and colour-blind-safe palettes
 * The text it generates (view names, legends, table, charts, notices)
 * comes from web/i18n/<lang>.js through t() (js/i18n.js), so the
 * generated pages in other languages show it in their own language
 */

// The data directory (web/data/), from the site root that js/i18n.js
// reads from data-site-root on <html> (set per page: the generated pages
// in other languages are one level deeper), else from the address of
// this script. (portal.js declares SITE_ROOT; the scripts share one
// global scope, so no second declaration here.)
const DATA_DIR = (function () {
    if (window.AYA_I18N && window.AYA_I18N.siteRoot) return window.AYA_I18N.siteRoot + 'data/';
    try {
        const script = document.currentScript || document.querySelector('script[src*="js/visualisation.js"]');
        return new URL('../data/', script.src).href;
    } catch (e) {
        return '../data/';
    }
})();

// The font of the page (Poppins, self-hosted), for the Plotly charts
function pageFontFamily() {
    try {
        return getComputedStyle(document.body).fontFamily || 'Poppins, sans-serif';
    } catch (e) {
        return 'Poppins, sans-serif';
    }
}

// Brand colour theme, in the shades that keep at least 3:1 contrast
// against the white tile as graphics (EN 301 549 / WCAG 1.4.11): the
// icon array, the legend swatches and the charts use these. The brand
// orange #f7741e itself (2.8:1) stays for surfaces in the stylesheet.
const BRAND_COLORS = {
    primary: '#ef6409',      // the brand orange, one step darker (3.2:1)
    secondary: '#d5276d',    // the brand pink as text (4.8:1)
    blue: '#7607ff',        // the brand purple
    dark: '#000000',        // Black
    light: '#ffffff',       // White
    silver: '#8f8f8f',      // mid grey (3.2:1)
    lightGray: '#949494',   // grey for "not received" and "not at all" (3.0:1)
    darkGray: '#6d6d6d',    // dark grey (5.2:1)
    gainsboro: '#949494'    // same mid grey
};

// Colour-blind-safe colour palettes
const COLORBLIND_SAFE = {
    // IBM Design Library colour-blind-safe palette
    category1: '#648FFF',    // Blue
    category2: '#DC267F',    // Magenta
    category3: '#FE6100',    // Orange (matches brand)
    category4: '#c68900',    // Gold, darkened to 3:1 on white
    category5: '#785EF0',    // Purple
    
    // Additional accessible colours
    yes: '#648FFF',         // Blue for "Yes"
    no: '#DC267F',          // Magenta for "No" (avoids red-green)
    partial: '#c68900',      // Gold for "Partial"
    
    // For functioning scores (avoiding red-green)
    high: '#648FFF',        // Blue for high/good
    medium: '#FE6100',      // Orange for medium
    low: '#DC267F',          // Magenta for low
    
    // For symptoms (colour-blind-safe)
    severe: '#648FFF',      // Blue
    moderate: '#FE6100',    // Orange
    mild: '#c68900',        // Gold
    none: '#785EF0',        // Purple
    
    // Treatment colours (using brand colours)
    received: '#f7741e',     // Brand orange
    notReceived: '#949494', // Grey (3:1 on white)
    planned: '#7607ff',      // Brand blue
    completed: '#648FFF',    // Accessible blue
    ongoing: '#c68900'       // Gold
};

// Page type configurations: the name of the subject (table caption) is
// t('subjects.<id>'), filled in by localiseConfigs() below
const PAGE_TYPES = {
    treatment: {
        id: 'treatment',
        modules: ['chemotherapy', 'radiotherapy', 'hormonetherapy', 'surgery', 'immunotherapy'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'],
        colorScheme: 'treatment'
    },
    functioning: {
        id: 'functioning',
        modules: ['emotional_functioning', 'physical_functioning', 'role_functioning', 'social_functioning', 'cognitive_functioning'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'],
        colorScheme: 'functioning'
    },
    symptoms: {
        id: 'symptoms',
        modules: ['fatigue', 'pain', 'nausea', 'anxiety', 'depression'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'],
        colorScheme: 'symptoms'
    },
    mental_health: {
        id: 'mental_health',
        modules: ['anxiety', 'depression', 'worry', 'mental_health_support'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'],
        colorScheme: 'default'
    },
    relationships: {
        id: 'relationships',
        modules: ['romantic_life', 'sex_life', 'relationships', 'self_esteem'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'],
        colorScheme: 'default'
    },
    lifestyle: {
        id: 'lifestyle',
        modules: ['physical_activity', 'diet', 'sleep', 'smoking', 'alcohol'],
        visualisationTypes: ['iconArraySimple', 'table', 'pieChart', 'barChart'],
        colorScheme: 'default'
    },
    demographics: {
        id: 'demographics',
        modules: ['age', 'sex', 'education', 'employment', 'relationship_status'],
        visualisationTypes: ['table', 'pieChart', 'barChart'],
        colorScheme: 'default'
    }
};

// Visualisation type configurations: name and description are
// t('views.<id>.name') and t('views.<id>.description'), filled in by
// localiseConfigs() below
const VISUALISATION_TYPES = {
    iconArraySimple: { id: 'iconArraySimple', icon: '👥' },
    iconArrayComplex: { id: 'iconArrayComplex', icon: '👥' },
    table: { id: 'table', icon: '📊' },
    pieChart: { id: 'pieChart', icon: '🥧' },
    barChart: { id: 'barChart', icon: '📈' }
};

// Colour schemes for different data types (using brand and colour-blind-safe colours)
const COLOR_SCHEMES = {
    default: {
        yes: BRAND_COLORS.primary,     // Brand orange #f7741e
        no: BRAND_COLORS.lightGray,    // Light grey #d7d7d7
        partial: COLORBLIND_SAFE.category4, // Gold #FFB000
        high: COLORBLIND_SAFE.category1,    // Blue #648FFF
        medium: COLORBLIND_SAFE.category3,  // Orange #FE6100
        low: COLORBLIND_SAFE.category2      // Magenta #DC267F
    },
    treatment: {
        received: BRAND_COLORS.primary,    // Brand orange #f7741e
        notReceived: BRAND_COLORS.lightGray, // Light grey #d7d7d7
        partial: COLORBLIND_SAFE.category4,  // Gold #FFB000
        planned: BRAND_COLORS.secondary,    // Pale violet red #e36799
        completed: BRAND_COLORS.blue,       // Brand blue #7607ff
        ongoing: COLORBLIND_SAFE.category4   // Gold #FFB000
    },
    functioning: {
        // Avoid red-green for functioning scores
        declined: COLORBLIND_SAFE.category2,   // Magenta #DC267F (instead of red)
        stable: COLORBLIND_SAFE.category4,    // Gold #FFB000 (neutral)
        improved: COLORBLIND_SAFE.category1,  // Blue #648FFF (instead of green)
        significantly_declined: COLORBLIND_SAFE.category5, // Purple #785EF0
        significantly_improved: BRAND_COLORS.blue // Brand blue #7607ff
    },
    symptoms: {
        // Colorblind-safe symptom colors
        severe: COLORBLIND_SAFE.category2,     // Magenta #DC267F
        moderate: COLORBLIND_SAFE.category3,   // Orange #FE6100
        mild: COLORBLIND_SAFE.category4,       // Gold #FFB000
        none: COLORBLIND_SAFE.category1,       // Blue #648FFF
        unknown: BRAND_COLORS.silver           // Silver #c9c6c4
    },
    qualityOfLife: {
        // Colorblind-safe QoL colors
        excellent: COLORBLIND_SAFE.category1,  // Blue #648FFF
        good: COLORBLIND_SAFE.category4,       // Gold #FFB000
        fair: COLORBLIND_SAFE.category3,       // Orange #FE6100
        poor: COLORBLIND_SAFE.category2,       // Magenta #DC267F
        very_poor: COLORBLIND_SAFE.category5   // Purple #785EF0
    }
};

// Legend configurations for different visualisation types.
// The data CSVs (web/data/<variable>.csv) hold one `category,count` row
// per category, named after the ids of the *complex* legend. A simple
// legend entry covers its own id plus the finer categories listed in
// `categories`, so both views are counted from the same rows. The label
// and description of an entry are t('legends.<page type>.<simple or
// complex>.<id>.label' / '.description'), filled in by localiseConfigs().
const LEGEND_CONFIGS = {
    treatment: {
        simple: [
            { id: 'received', color: COLOR_SCHEMES.treatment.received, categories: ['partial', 'planned'] },
            { id: 'notReceived', color: COLOR_SCHEMES.treatment.notReceived }
        ],
        complex: [
            { id: 'received', color: COLOR_SCHEMES.treatment.completed },
            { id: 'partial', color: COLOR_SCHEMES.treatment.partial },
            { id: 'planned', color: COLOR_SCHEMES.treatment.planned },
            { id: 'notReceived', color: COLOR_SCHEMES.treatment.notReceived }
        ]
    },
    functioning: {
        simple: [
            { id: 'declined', color: COLOR_SCHEMES.functioning.declined, categories: ['significantly_declined'] },
            { id: 'stable', color: COLOR_SCHEMES.functioning.stable, categories: ['improved'] }
        ],
        complex: [
            { id: 'significantly_declined', color: COLOR_SCHEMES.functioning.significantly_declined },
            { id: 'declined', color: COLOR_SCHEMES.functioning.declined },
            { id: 'stable', color: COLOR_SCHEMES.functioning.stable },
            { id: 'improved', color: COLOR_SCHEMES.functioning.improved }
        ]
    }
};

// ------------------------------------------------------------------
// PLACEHOLDER filter data (work in progress)
// Number of people out of 100 that fall in the *first* legend
// category (e.g. "received treatment" / "declined functioning") for
// each cancer type / sex combination. `null` means "use the real,
// unfiltered CSV data"; INSUFFICIENT_DATA means the group is too small
// to show anything (the visualisation is replaced by a notice). Simply
// update these values once the real filtered figures become available.
// ------------------------------------------------------------------
const INSUFFICIENT_DATA = 'insufficient';

const FILTER_PLACEHOLDER_COUNTS = {
    all:   { all: null, male: 48, female: 62, intersex: INSUFFICIENT_DATA },
    blood: { all: 58,   male: 54, female: 61, intersex: INSUFFICIENT_DATA },
    solid: { all: 52,   male: 49, female: 56, intersex: INSUFFICIENT_DATA },
    skin:  { all: 41,   male: 38, female: 44, intersex: INSUFFICIENT_DATA },
    brain: { all: 66,   male: 63, female: 68, intersex: INSUFFICIENT_DATA }
};

// A yes/no legend for a page without a legend configuration
function defaultLegend() {
    return localisedLegendEntries([
        { id: 'yes', color: COLOR_SCHEMES.default.yes },
        { id: 'no', color: COLOR_SCHEMES.default.no }
    ], 'legends.default.simple');
}

// Raw number of people covered by a legend entry: its own category plus
// the finer categories it groups (categories: [...])
function rawCountForEntry(rawCounts, item) {
    return [item.id].concat(item.categories || [])
        .reduce((sum, id) => sum + (rawCounts[id] || 0), 0);
}

// Turn raw counts into "people out of 100" (largest-remainder rounding,
// so the groups always add up to exactly 100)
function peopleOutOf100(raw) {
    const rawTotal = raw.reduce((sum, count) => sum + count, 0);
    const exact = raw.map(count => rawTotal > 0 ? (count / rawTotal) * 100 : 0);
    const scaled = exact.map(Math.floor);
    const remainders = exact.map((value, i) => ({ i, rest: value - scaled[i] }))
        .sort((a, b) => b.rest - a.rest);
    let left = rawTotal > 0 ? 100 - scaled.reduce((sum, count) => sum + count, 0) : 0;
    for (let k = 0; left > 0 && k < remainders.length; k++, left--) {
        scaled[remainders[k].i]++;
    }
    return scaled;
}

// The two groups a topic is summarised in (its headline statement and
// simple icon array)
function simpleLegendFor(config) {
    return (config.legend && config.legend.simple) || (LEGEND_CONFIGS[config.pageType] || {}).simple || [];
}

// The topics of a subject: the pages of its page type that exist, in order
function subjectTopicIds(pageTypeId) {
    return ((PAGE_TYPES[pageTypeId] || {}).modules || []).filter(id => VISUALISATION_CONFIGS[id]);
}

// The chosen view and filters are kept during the visit (sessionStorage),
// so every topic page opens the way the previous one was left
const VIS_STATE_KEY = 'aya-visualisation-state';

function loadVisState() {
    try {
        return JSON.parse(sessionStorage.getItem(VIS_STATE_KEY)) || {};
    } catch (e) {
        return {}; /* storage unavailable or unreadable: start with the defaults */
    }
}

function saveVisState(changes) {
    try {
        sessionStorage.setItem(VIS_STATE_KEY, JSON.stringify(Object.assign(loadVisState(), changes)));
    } catch (e) { /* storage unavailable: the choices are simply not kept */ }
}

class StrongAyaVisualisation {
    constructor(containerId, dataConfig) {
        this.containerId = containerId;
        this.dataConfig = dataConfig;
        this.container = document.getElementById(containerId);
        this.currentView = dataConfig.defaultView || 'iconArraySimple';
        this.filters = {};
        this.legendData = [];
        this.pageType = null;
        this.categoryCounts = {};
        this.rawCounts = {};
        this.activePlaceholder = null;
        this.insufficientData = false;
        this.totalCount = 0;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error(`Container ${this.containerId} not found`);
            return;
        }
        
        // Determine page type
        this.pageType = this.getPageType();
        
        // Load legend configuration
        this.loadLegendConfig();
        
        // Load data if config has dataUrl
        if (this.dataConfig.dataUrl) {
            this.loadData();
        }
        
        this.createVisualisationContainer();
    }
    
    getPageType() {
        // Determine page type from config or URL
        if (this.dataConfig.pageType) {
            return PAGE_TYPES[this.dataConfig.pageType];
        }
        
        // Try to determine from variable
        if (this.dataConfig.variable) {
            const varLower = this.dataConfig.variable.toLowerCase();
            if (varLower.includes('ther_') || varLower.includes('treatment')) {
                return PAGE_TYPES.treatment;
            }
            if (varLower.includes('ef') || varLower.includes('pf') || varLower.includes('rf') || varLower.includes('functioning')) {
                return PAGE_TYPES.functioning;
            }
        }
        
        // Default to treatment if not determined
        return PAGE_TYPES.treatment;
    }
    
    loadLegendConfig() {
        // Page-specific legend from the config wins over the page-type one
        if (this.dataConfig.legend && this.dataConfig.legend.simple) {
            this.legendData = this.dataConfig.legend.simple;
            this.colorScheme = COLOR_SCHEMES[this.dataConfig.colorScheme] || COLOR_SCHEMES.default;
            return;
        }
        
        // Load legend based on page type and colour scheme
        if (this.pageType) {
            const pageId = this.pageType.id;
            const colorScheme = this.dataConfig.colorScheme || this.pageType.colorScheme || 'default';
            
            // Get legend config for this page type
            const legendConfig = LEGEND_CONFIGS[pageId];
            if (legendConfig) {
                // Use simple legend by default
                this.legendData = legendConfig.simple || [];
                this.colorScheme = COLOR_SCHEMES[colorScheme];
            } else {
                // Fallback to default
                this.legendData = defaultLegend();
                this.colorScheme = COLOR_SCHEMES.default;
            }
        } else {
            // Default legend
            this.legendData = defaultLegend();
            this.colorScheme = COLOR_SCHEMES.default;
        }
        
        // Apply colours from scheme to legend
        this.legendData.forEach(item => {
            if (this.colorScheme[item.id]) {
                item.color = this.colorScheme[item.id];
            }
        });
    }
    
    async loadData() {
        try {
            const response = await fetch(this.dataConfig.dataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.rawCounts = this.parseCSV(await response.text());
            
            // Flag rows that no legend knows about (typically a typo in the CSV)
            const knownIds = new Set(this.allLegendEntries().flatMap(item => [item.id].concat(item.categories || [])));
            Object.keys(this.rawCounts)
                .filter(id => !knownIds.has(id))
                .forEach(id => console.warn(`${this.dataConfig.dataUrl}: unknown category "${id}" is ignored`));
            
            this.computeCountsForLegend();
            
            // Remember the unfiltered counts so filters can be reset
            this.baseCounts = Object.assign({}, this.categoryCounts);

            this.restoreState();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError(t('messages.loadError'));
        }
    }
    
    // Open this topic the way the previous one was left: the same view
    // and filters. A view this page cannot show (e.g. the complex icon
    // array for two groups) falls back to the default; the choice is kept
    // for the next page.
    restoreState() {
        const saved = loadVisState();
        const filters = saved.filters || {};
        let rendered = false;
        if (saved.view && saved.view !== this.currentView) {
            this.switchView(saved.view);
            rendered = true;
        }
        if (Object.keys(filters).some(key => filters[key] && filters[key] !== 'all')) {
            setFilterControls(filters);
            this.applyFilters(filters);
            rendered = true;
        }
        if (!rendered) this.render();
    }

    // Data CSV format: a `category,count` header followed by one row per
    // category, e.g. `received,1830`. Counts are plain numbers of people;
    // they do not need to add up to 100.
    parseCSV(csvText) {
        const counts = {};
        csvText.split('\n').slice(1).forEach(line => {
            const [category, count] = line.split(',').map(part => part.trim());
            if (category && !Number.isNaN(Number(count))) {
                counts[category] = Number(count);
            }
        });
        return counts;
    }
    
    // Simple and complex legend entries for this page
    allLegendEntries() {
        const legend = this.dataConfig.legend || LEGEND_CONFIGS[this.pageType?.id] || {};
        return (legend.simple || []).concat(legend.complex || []);
    }
    
    rawCountFor(item) {
        return rawCountForEntry(this.rawCounts, item);
    }

    // Turn the raw counts into "people out of 100" per legend category
    computeCountsForLegend() {
        const scaled = peopleOutOf100(this.legendData.map(item => this.rawCountFor(item)));

        this.categoryCounts = {};
        this.legendData.forEach((item, i) => {
            this.categoryCounts[item.id] = scaled[i];
        });
        
        // Placeholder filter data overrides the counts (two-group legends only)
        if (this.activePlaceholder !== null && this.activePlaceholder !== undefined &&
            this.legendData.length === 2) {
            this.categoryCounts[this.legendData[0].id] = this.activePlaceholder;
            this.categoryCounts[this.legendData[1].id] = 100 - this.activePlaceholder;
        }
        
        this.totalCount = Object.values(this.categoryCounts).reduce((sum, count) => sum + count, 0);
    }
    
    createVisualisationContainer() {
        this.container.innerHTML = '';
        
        // Place the "View" selection button at the right end of the filter
        // row, just above the figure it changes, shaped like the filters;
        // fall back to a selector row above the visualisation otherwise.
        const filterBar = document.querySelector('.vis-card .filter-bar');
        if (filterBar) {
            if (!filterBar.querySelector('.view-selection-btn')) {
                const selectorBtn = document.createElement('button');
                selectorBtn.type = 'button';
                selectorBtn.className = 'filter-btn view-selection-btn';
                selectorBtn.innerHTML = this.getViewButtonLabel();
                selectorBtn.setAttribute('aria-haspopup', 'dialog');
                selectorBtn.addEventListener('click', () => this.openViewSelectorModal());
                filterBar.appendChild(selectorBtn);
            }
        } else {
            const viewSelector = document.createElement('div');
            viewSelector.className = 'visualisation-selector';
            
            const selectorBtn = document.createElement('button');
            selectorBtn.className = 'vis-btn view-selection-btn';
            selectorBtn.innerHTML = t('ui.viewSelection') + ' <span class="view-type-indicator">(' + this.getCurrentViewName() + ')</span>';
            selectorBtn.title = t('ui.viewSelectionHint');
            selectorBtn.addEventListener('click', () => this.openViewSelectorModal());
            viewSelector.appendChild(selectorBtn);
            
            this.container.appendChild(viewSelector);
        }
        
        // Create visualisation area
        const visArea = document.createElement('div');
        visArea.id = `${this.containerId}-vis-area`;
        visArea.className = 'visualisation-content';
        this.container.appendChild(visArea);
        
        this.visArea = visArea;
    }
    
    getCurrentViewName() {
        const viewType = VISUALISATION_TYPES[this.currentView];
        return viewType ? viewType.name : this.currentView;
    }

    // "View: <current view>", in the same form as the filter buttons
    getViewButtonLabel() {
        return t('ui.viewButton', { view: '<span class="filter-value">' + this.getCurrentViewName() + '</span>' }) +
            ' <i class="fas fa-eye"></i>';
    }
    
    // Views available for this page. The complex icon array is only
    // offered when it actually shows more than the simple one, i.e. when
    // the data has more non-empty groups in the complex legend than in
    // the simple legend (e.g. received/not received data has nothing to
    // gain from a completed/partial/planned/not received breakdown).
    getAvailableViews() {
        let views = this.pageType?.visualisationTypes ||
                    ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'];
        const legend = this.dataConfig.legend || LEGEND_CONFIGS[this.pageType?.id] || {};
        const nonEmpty = entries => (entries || []).filter(item => this.rawCountFor(item) > 0).length;
        if (!legend.complex || nonEmpty(legend.complex) <= nonEmpty(legend.simple)) {
            views = views.filter(v => v !== 'iconArrayComplex');
        }
        return views;
    }
    
    openViewSelectorModal() {
        // Track the selection separately so "Cancel" (or clicking the
        // overlay) never leaves a half-committed view behind
        this.pendingView = this.currentView;
        
        // Reuse the modal if it was created before. It is a native
        // <dialog>: showModal() moves focus inside, traps it there,
        // closes on Escape and returns focus to the "View" button.
        const existingModal = document.getElementById('view-selector-modal');
        if (existingModal) {
            this.updateViewSelectorModal();
            existingModal.showModal();
            return;
        }
        
        const modal = document.createElement('dialog');
        modal.id = 'view-selector-modal';
        modal.className = 'portal-modal';
        modal.setAttribute('aria-labelledby', 'view-selector-title');
        
        const title = document.createElement('h3');
        title.id = 'view-selector-title';
        title.textContent = t('ui.viewTitle');
        title.style.cssText = 'margin: 0 0 20px 0; font-size: 1.6rem; color: black; font-weight: 600; font-family: inherit;';
        modal.appendChild(title);
        
        const description = document.createElement('p');
        description.textContent = t('ui.viewIntro');
        description.style.cssText = 'font-size: 0.9333rem; color: #6d6d6d; margin: 0 0 25px 0; line-height: 1.6;';
        modal.appendChild(description);
        
        const grid = document.createElement('div');
        grid.id = 'view-selector-grid';
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px;';
        modal.appendChild(grid);
        
        const footer = document.createElement('div');
        footer.style.cssText = 'display: flex; justify-content: flex-end; gap: 10px; border-top: 2px solid #d7d7d7; padding-top: 20px;';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = t('ui.cancel');
        cancelBtn.style.cssText = 'padding: 12px 24px; border-radius: 8px; font-family: inherit; font-size: 0.9333rem; font-weight: 600; cursor: pointer; background: #d7d7d7; color: black; border: none;';
        cancelBtn.addEventListener('click', () => modal.close());
        footer.appendChild(cancelBtn);
        
        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.textContent = t('ui.apply');
        applyBtn.style.cssText = 'padding: 12px 24px; border-radius: 8px; font-family: inherit; font-size: 0.9333rem; font-weight: 600; cursor: pointer; background: #f7741e; color: #1c1c1c; border: none;';
        applyBtn.addEventListener('click', () => {
            this.switchView(this.pendingView || this.currentView);
            saveVisState({ view: this.currentView });
            modal.close();
        });
        footer.appendChild(applyBtn);
        modal.appendChild(footer);
        
        document.body.appendChild(modal);
        
        // Close on backdrop click (the click then targets the dialog
        // itself; the bounds check excludes clicks on its own padding)
        modal.addEventListener('click', (e) => {
            if (e.target !== modal) return;
            const r = modal.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
                modal.close();
            }
        });
        
        this.updateViewSelectorModal();
        modal.showModal();
    }
    
    // (Re)build the option cards in the view-selector modal; the grid is
    // rebuilt on every open so the available views and the highlighted
    // selection always reflect the current state
    updateViewSelectorModal() {
        const grid = document.getElementById('view-selector-grid');
        if (!grid) return;
        
        const selectedView = this.pendingView || this.currentView;
        const availableViews = this.getAvailableViews();
        
        grid.innerHTML = '';
        
        // Real buttons, so keyboard users get tab focus and Enter/Space
        // for free; aria-pressed tells screen readers which one is chosen
        // the chosen card differs in colour and in border width (not colour alone, WCAG 1.4.1)
        const markSelected = (card, selected) => {
            card.style.borderColor = selected ? '#be4f07' : '#8a8a8a';
            card.style.borderWidth = selected ? '3px' : '1px';
            card.style.padding = selected ? '13px' : '15px';
            card.style.background = selected ? 'rgba(247, 116, 30, 0.08)' : 'white';
            card.setAttribute('aria-pressed', String(selected));
        };
        
        availableViews.forEach(viewId => {
            const visType = VISUALISATION_TYPES[viewId];
            if (visType) {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'view-option-card';
                card.style.cssText = 'background: white; border: 2px solid #d7d7d7; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.3s ease; text-align: left; font-family: inherit; width: 100%;';
                markSelected(card, selectedView === viewId);
                
                const name = document.createElement('div');
                name.textContent = visType.name;
                name.style.cssText = 'font-size: 1.0667rem; font-weight: 600; color: black; margin: 0 0 5px 0;';
                card.appendChild(name);
                
                const desc = document.createElement('div');
                desc.textContent = visType.description;
                desc.style.cssText = 'font-size: 0.9333rem; color: #6d6d6d; margin: 0; line-height: 1.4;';
                card.appendChild(desc);
                
                card.addEventListener('click', () => {
                    grid.querySelectorAll('.view-option-card').forEach(d => markSelected(d, false));
                    markSelected(card, true);
                    this.pendingView = viewId;
                });
                
                grid.appendChild(card);
            }
        });
    }
    
    switchView(viewType) {
        // Never switch to a view that is not available for this data
        // (e.g. the complex icon array on two-category data)
        if (!this.getAvailableViews().includes(viewType)) {
            viewType = 'iconArraySimple';
        }
        this.currentView = viewType;
        this.pendingView = viewType;
        
        // Update legend based on view type
        this.updateLegendForView(viewType);
        
        // Update the view selection button text (filter row or fallback
        // selector row) to show the chosen view
        const selectorBtn = this.container.querySelector('.visualisation-selector .view-selection-btn');
        if (selectorBtn) {
            selectorBtn.innerHTML = t('ui.viewSelection') + ' <span class="view-type-indicator">(' + this.getCurrentViewName() + ')</span>';
        }
        const filterBarBtn = document.querySelector('.vis-card .filter-bar .view-selection-btn');
        if (filterBarBtn) {
            filterBarBtn.innerHTML = this.getViewButtonLabel();
        }
        
        // Keep the modal cards in sync for the next open
        this.updateViewSelectorModal();
        
        this.render();
    }
    
    updateLegendForView(viewType) {
        // For complex views, use complex legend if available
        if (viewType === 'iconArrayComplex') {
            if (this.dataConfig.legend && this.dataConfig.legend.complex) {
                // Page-specific complex legend from the config
                this.legendData = this.dataConfig.legend.complex;
            } else {
                const pageId = this.pageType?.id;
                const legendConfig = LEGEND_CONFIGS[pageId];
                if (legendConfig && legendConfig.complex) {
                    this.legendData = legendConfig.complex;
                    // Apply colours from scheme
                    this.legendData.forEach(item => {
                        if (this.colorScheme[item.id]) {
                            item.color = this.colorScheme[item.id];
                        }
                    });
                }
            }
        } else {
            // Use simple legend
            this.loadLegendConfig();
        }
        
        // Recount the icons for the new legend
        this.computeCountsForLegend();
    }
    
    render() {
        if (!this.visArea) return;
        
        // Too few people in the selected group: show the notice instead
        // of any visualisation, whatever view is selected
        if (this.insufficientData) {
            this.renderInsufficientData();
            return;
        }
        
        switch (this.currentView) {
            case 'iconArrayComplex':
                this.renderIconArrayComplex();
                break;
            case 'table':
                this.renderTable();
                break;
            case 'pieChart':
                this.renderPieChart();
                break;
            case 'barChart':
                this.renderBarChart();
                break;
            case 'iconArraySimple':
            default:
                this.renderIconArraySimple();
                break;
        }
    }
    
    renderIconArraySimple() {
        if (this.totalCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">' + t('messages.noData') + '</p>';
            return;
        }
        
        const html = this.generateIconArrayHTML('simple');
        this.visArea.innerHTML = html;
    }
    
    renderIconArrayComplex() {
        // Check if we have enough categories for complex view
        const hasEnoughCategories = Object.keys(this.categoryCounts).length >= 3;
        
        if (this.totalCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">' + t('messages.noData') + '</p>';
            return;
        }
        
        if (!hasEnoughCategories) {
            this.visArea.innerHTML = `
                <p style="text-align: center; padding: 20px; color: #6d6d6d;">
                    ${t('messages.needsGroups', { count: Object.keys(this.categoryCounts).length })}
                </p>
            `;
            return;
        }
        
        const html = this.generateIconArrayHTML('complex');
        this.visArea.innerHTML = html;
    }
    
    generateIconArrayHTML(type) {
        const isComplex = type === 'complex';
        
        // Build icons and legend items for each category
        let iconRows = '';
        let combinedIcons = '';
        let legendItems = '';
        
        this.legendData.forEach(category => {
            const count = this.categoryCounts[category.id] || 0;
            const percentage = this.totalCount > 0 ? Math.round((count / this.totalCount) * 100) : 0;
            
            // Generate icons for this category
            const icons = this.generateIconHTML(count, category.color);
            
            if (isComplex) {
                // The icons only repeat what the row header already says,
                // so they are hidden from assistive technology
                iconRows += `
                    <div class="icon-category-row">
                        <div class="icon-category-header">
                            <div class="icon-color-indicator" style="background: ${category.color};"></div>
                            <span class="icon-category-label">${category.label}</span>
                            <span class="icon-category-count">${count} (${percentage}%)</span>
                        </div>
                        <div class="icon-category-icons" aria-hidden="true">
                            ${icons}
                        </div>
                    </div>
                `;
            } else if (count > 0) {
                // Simple view: single combined grid, 10 icons per row
                combinedIcons += icons;
            }
            
            legendItems += this.generateLegendItemHTML(category);
        });
        
        // The simple grid is one image to a screen reader: a single
        // description instead of 100 individual (decorative) icons
        const summary = this.accessibleSummary(t('ui.iconArray')).replace(/"/g, '&quot;');
        const iconArea = isComplex
            ? `<div class="icon-array-container">${iconRows}</div>`
            : `<div class="icon-array-grid" role="img" aria-label="${summary}">${combinedIcons}</div>`;
        
        // No textual header around the icon arrays: the statement above the
        // figure and the info note already provide the context and the
        // update date. Both views are presented as a large figure centred
        // in the tile, with the legend in its own column next to it (the
        // CSS moves it below the figure on narrow screens).
        return `
            <div class="visualisation-wrapper">
                <div class="icon-array-visualisation">
                    ${iconArea}
                </div>
                
                <div class="legend-container">
                    <h2>${t('ui.legend')}</h2>
                    <div class="legend-items">
                        ${legendItems}
                    </div>
                </div>
            </div>
        `;
    }
    
    // One description of the whole figure for screen readers, e.g. "Icon
    // array of 100 people. 27 out of 100: People who say ...". The icons,
    // slices or bars themselves are hidden from assistive technology.
    accessibleSummary(kind) {
        const parts = this.legendData.map(category => {
            const count = this.categoryCounts[category.id] || 0;
            return t('messages.summaryPart', {
                count: count, total: this.totalCount, description: category.description || category.label
            });
        });
        return t('messages.summary', { kind: kind, total: this.totalCount, parts: parts.join('. ') });
    }
    
    generateIconHTML(count, color) {
        if (count === 0) return '<span class="no-icons">—</span>';
        
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `<i class="fas fa-person person-icon" style="color: ${color};" aria-hidden="true"></i>`;
        }
        return html;
    }
    
    // Legend item: swatch, label and the explanation written out in
    // full. The explanation is essential, so it is plain text rather
    // than a hover tooltip (which keyboard and screen-reader users miss).
    generateLegendItemHTML(category) {
        const description = category.description && category.description !== category.label
            ? `<span>${category.description}</span>`
            : '';
        return `
            <div class="legend-item">
                <div class="legend-color-box" style="background: ${category.color};" aria-hidden="true"></div>
                <div class="legend-label">
                    <strong>${category.label}</strong>
                    ${description}
                </div>
            </div>
        `;
    }
    
    // Table view: the numbers of every topic of this subject side by side,
    // two groups per topic (as in their headline statements). The other
    // topics' CSVs are loaded the first time the table is shown.
    renderTable() {
        if (!this.subjectTopics) {
            this.visArea.innerHTML = '<p class="vis-loading" role="status">' + t('ui.loadingTable') + '</p>';
            this.subjectTopicsRequest = this.subjectTopicsRequest || this.loadSubjectTopics().then(() => {
                if (this.currentView === 'table') this.render();
            });
            return;
        }
        
        const rowGroups = this.subjectTopics.map(topic => {
            const isCurrent = topic.config === this.dataConfig;
            const legend = isCurrent ? this.legendData : simpleLegendFor(topic.config);
            const counts = isCurrent
                ? (this.totalCount > 0 ? legend.map(item => this.categoryCounts[item.id] || 0) : null)
                : this.countsForTopic(topic, legend);
            const name = isCurrent
                ? `${topic.config.title} <span class="table-this-page">${t('ui.tableThisPage')}</span>`
                : `<a href="${topic.id}.html">${topic.config.title}</a>`;
            const rows = counts ? legend.map((item, i) => `
                    <tr>
                        ${i === 0 ? `<th scope="rowgroup" rowspan="${legend.length}">${name}</th>` : ''}
                        <th scope="row">${item.label}<span class="table-note">${item.description || ''}</span></th>
                        <td>${counts[i]}</td>
                        <td class="table-meaning">${item.description || ''}</td>
                    </tr>`).join('') : `
                    <tr>
                        <th scope="rowgroup">${name}</th>
                        <td colspan="3">${t('ui.tableNoData')}</td>
                    </tr>`;
            return `<tbody${isCurrent ? ' class="table-current-topic"' : ''}>${rows}</tbody>`;
        }).join('');
        
        this.visArea.innerHTML = `
            <div class="data-table-wrapper">
                <table class="data-table">
                    <caption>${t('ui.tableCaption', { subject: this.pageType?.subject || t('ui.thisSubject') })}</caption>
                    <thead>
                        <tr>
                            <th scope="col">${t('ui.tableTopic')}</th>
                            <th scope="col">${t('ui.tableGroup')}</th>
                            <th scope="col">${t('ui.tableOutOf100')}</th>
                            <th scope="col" class="table-meaning">${t('ui.tableMeaning')}</th>
                        </tr>
                    </thead>
                    ${rowGroups}
                </table>
            </div>
        `;
    }
    
    // The raw counts of every topic of this subject, for the table view
    async loadSubjectTopics() {
        const ids = subjectTopicIds(this.pageType?.id);
        const currentId = Object.keys(VISUALISATION_CONFIGS).find(id => VISUALISATION_CONFIGS[id] === this.dataConfig);
        if (currentId && !ids.includes(currentId)) ids.unshift(currentId);
        
        this.subjectTopics = await Promise.all(ids.map(async id => {
            const config = VISUALISATION_CONFIGS[id];
            if (config === this.dataConfig) return { id, config };
            try {
                const response = await fetch(config.dataUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return { id, config, rawCounts: this.parseCSV(await response.text()) };
            } catch (error) {
                console.error(`Error loading ${config.dataUrl}:`, error);
                return { id, config, rawCounts: null };
            }
        }));
    }
    
    // People out of 100 per group for another topic of this subject, with
    // the same (placeholder) filters as this page; null without data
    countsForTopic(topic, legend) {
        if (!topic.rawCounts) return null;
        const raw = legend.map(item => rawCountForEntry(topic.rawCounts, item));
        if (raw.every(count => count === 0)) return null;
        if (this.activePlaceholder !== null && this.activePlaceholder !== undefined && legend.length === 2) {
            return [this.activePlaceholder, 100 - this.activePlaceholder];
        }
        return peopleOutOf100(raw);
    }
    
    renderPieChart() {
        if (this.totalCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">' + t('messages.noData') + '</p>';
            return;
        }
        
        const labels = this.legendData.map(c => c.label);
        const values = this.legendData.map(c => this.categoryCounts[c.id] || 0);
        const colors = this.legendData.map(c => c.color);
        
        const data = [{
            values: values,
            labels: labels,
            type: 'pie',
            marker: {
                colors: colors
            },
            textinfo: 'label+percent',
            textposition: 'inside',
            hoverinfo: 'label+percent+value',
            hole: 0.3
        }];
        
        const layout = {
            title: {
                text: t('ui.pieTitle', { title: this.dataConfig.title || t('ui.distribution'), total: this.totalCount }),
                x: 0.5,
                xanchor: 'center',
                font: {
                    size: 18,
                    family: pageFontFamily()
                }
            },
            showlegend: false,
            height: 450,
            margin: { t: 60, b: 50, l: 20, r: 20 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };
        
        const config = {
            responsive: true,
            displayModeBar: false
        };
        
        // Create wrapper with custom legend
        const wrapper = document.createElement('div');
        wrapper.className = 'visualisation-wrapper';
        
        const chartDiv = document.createElement('div');
        chartDiv.setAttribute('role', 'img');
        chartDiv.setAttribute('aria-label', this.accessibleSummary(t('ui.pieChart')));
        
        const legendDiv = document.createElement('div');
        legendDiv.className = 'legend-container';
        legendDiv.innerHTML = `
            <h2>${t('ui.legend')}</h2>
            <div class="legend-items">
                ${this.legendData.map(c => this.generateLegendItemHTML(c)).join('')}
            </div>
        `;
        
        wrapper.appendChild(chartDiv);
        wrapper.appendChild(legendDiv);
        this.visArea.innerHTML = '';
        this.visArea.appendChild(wrapper);
        
        try {
            Plotly.newPlot(chartDiv, data, layout, config);
        } catch (error) {
            console.error('Error rendering Plotly chart:', error);
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">' + t('messages.chartError') + '</p>';
        }
    }
    
    renderBarChart() {
        if (this.totalCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">' + t('messages.noData') + '</p>';
            return;
        }
        
        const labels = this.legendData.map(c => c.label);
        const values = this.legendData.map(c => this.categoryCounts[c.id] || 0);
        const colors = this.legendData.map(c => c.color);
        
        const data = [{
            x: labels,
            y: values,
            type: 'bar',
            marker: {
                color: colors
            },
            text: values.map(v => v.toString()),
            textposition: 'auto',
            hoverinfo: 'x+y'
        }];
        
        const layout = {
            title: {
                text: t('ui.barTitle', { title: this.dataConfig.title || t('ui.numbersByGroup'), total: this.totalCount }),
                x: 0.5,
                xanchor: 'center',
                font: {
                    size: 18,
                    family: pageFontFamily()
                }
            },
            xaxis: { 
                title: t('ui.barXAxis'),
                tickfont: { family: pageFontFamily() }
            },
            yaxis: { 
                title: t('ui.barYAxis'),
                tickfont: { family: pageFontFamily() }
            },
            showlegend: false,
            height: 450,
            margin: { t: 60, b: 50, l: 50, r: 20 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };
        
        const config = {
            responsive: true,
            displayModeBar: false
        };
        
        // Create wrapper with custom legend
        const wrapper = document.createElement('div');
        wrapper.className = 'visualisation-wrapper';
        
        const chartDiv = document.createElement('div');
        chartDiv.setAttribute('role', 'img');
        chartDiv.setAttribute('aria-label', this.accessibleSummary(t('ui.barChart')));
        
        const legendDiv = document.createElement('div');
        legendDiv.className = 'legend-container';
        legendDiv.innerHTML = `
            <h2>${t('ui.legend')}</h2>
            <div class="legend-items">
                ${this.legendData.map(c => this.generateLegendItemHTML(c)).join('')}
            </div>
        `;
        
        wrapper.appendChild(chartDiv);
        wrapper.appendChild(legendDiv);
        this.visArea.innerHTML = '';
        this.visArea.appendChild(wrapper);
        
        try {
            Plotly.newPlot(chartDiv, data, layout, config);
        } catch (error) {
            console.error('Error rendering Plotly chart:', error);
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">' + t('messages.chartError') + '</p>';
        }
    }
    
    // Notice shown in place of the visualisation when the selected group
    // is too small to report on. It names the active filter combination
    // and the outcome so the reader knows exactly what is missing.
    renderInsufficientData() {
        const filterLabels = this.describeActiveFilters();
        const outcome = this.dataConfig.title || t('ui.thisTopic');
        this.visArea.innerHTML = `
            <div class="insufficient-data" role="status">
                <i class="fas fa-info-circle" aria-hidden="true"></i>
                <p>${t('messages.insufficient', { filters: filterLabels, outcome: outcome })}</p>
                <p>${t('messages.comeBack')}</p>
            </div>
        `;
    }
    
    // Human-readable summary of the current filter bar selection, e.g.
    // "Cancer type: All, Sex: Intersex" (read from the filter buttons so
    // it always matches what the reader selected)
    describeActiveFilters() {
        const labels = [];
        document.querySelectorAll('.filter-wrap .filter-toggle').forEach(toggle => {
            labels.push(toggle.textContent.replace(/\s+/g, ' ').trim());
        });
        if (labels.length) return labels.join(', ');
        return Object.keys(this.filters)
            .map(key => `${key}: ${this.filters[key]}`)
            .join(', ') || t('ui.selectedFilters');
    }
    
    showError(message) {
        this.visArea.innerHTML = `<p style="text-align: center; padding: 20px; color: ${BRAND_COLORS.secondary};">${message}</p>`;
    }
    
    applyFilters(filters) {
        this.filters = Object.assign({}, this.filters, filters);
        
        const cancerType = this.filters.cancerType || 'all';
        const sex = this.filters.sex || 'all';
        const placeholder = (FILTER_PLACEHOLDER_COUNTS[cancerType] || {})[sex];
        
        // Too small a group to show: no counts, no statement, just the notice
        this.insufficientData = placeholder === INSUFFICIENT_DATA;
        
        // A null/undefined placeholder means: use the real CSV counts
        this.activePlaceholder = (this.insufficientData || placeholder === null || placeholder === undefined)
            ? null : placeholder;
        
        this.computeCountsForLegend();
        this.render();
        this.toggleInfoNote(!this.insufficientData);
        
        if (this.insufficientData) {
            this.updateStatement(null);
            return;
        }
        
        // The statement always follows the first group of the simple legend
        const simpleLegend = (this.dataConfig.legend && this.dataConfig.legend.simple) ||
                             (LEGEND_CONFIGS[this.pageType?.id] || {}).simple || this.legendData;
        const positiveId = simpleLegend[0] ? simpleLegend[0].id : 'yes';
        const statementCount = this.activePlaceholder !== null
            ? this.activePlaceholder
            : ((this.baseCounts && this.baseCounts[positiveId]) || 0);
        this.updateStatement(statementCount);
    }
    
    // Keep the "N out of 100 people ..." statement above the figure in
    // sync with the (filtered) data; `null` hides it (nothing to report).
    // The number sits in its own span (.vis-count), so a translation
    // can put it anywhere in the sentence.
    updateStatement(count) {
        const statement = document.querySelector('.vis-card .vis-statement');
        if (!statement) return;
        if (count === null) {
            statement.hidden = true;
            return;
        }
        statement.hidden = false;
        const number = statement.querySelector('.vis-count');
        if (number) {
            number.textContent = String(count);
        } else {
            statement.innerHTML = statement.innerHTML.replace(/^\s*\d+/, count);
        }
    }
    
    // The "these numbers are based on ..." sentence of the note below the
    // tile only makes sense when a figure is shown; "Contact us" stays
    toggleInfoNote(show) {
        document.querySelectorAll('.info-note-data').forEach(el => { el.hidden = !show; });
    }
}

// Legend of the EORTC QLQ-AYA intimacy and relationships pages. The
// questions ask whether a part of life has been negatively affected: not
// at all, a little, quite a bit or very much. Scored like the QLQ-C30
// (0-100), a single question scores 0, 33, 67 or 100; a scale (the average
// of a few questions) falls in the range of the nearest answer (0, up to
// 33, up to 67, above 67). The QLQ-AYA has no thresholds for clinical
// importance yet (its validation study runs until 2029), so "affected a
// lot" is quite a bit or very much, as on the worry page. The labels
// and descriptions are complete sentences per topic in the strings file
// (legends.<topic>), as "has/have been affected" does not carry over
// into other languages.
function qlqAyaLegend() {
    return {
        simple: [
            { id: 'affectedALot', color: BRAND_COLORS.primary, categories: ['veryMuch', 'quiteABit'] },
            { id: 'affectedLittle', color: BRAND_COLORS.lightGray, categories: ['aLittle', 'notAtAll'] }
        ],
        complex: [
            { id: 'veryMuch', color: COLORBLIND_SAFE.category2 },
            { id: 'quiteABit', color: COLORBLIND_SAFE.category3 },
            { id: 'aLittle', color: COLORBLIND_SAFE.category4 },
            { id: 'notAtAll', color: BRAND_COLORS.lightGray }
        ]
    };
}

// Data configurations for different visualisations. The title of a
// topic is t('topics.<id>'); the label and description of a legend
// entry are t('legends.<id>.<simple or complex>.<entry id>.label' /
// '.description'); localiseConfigs() below fills them in.
const VISUALISATION_CONFIGS = {
    // Treatment modules
    chemotherapy: {
        dataUrl: DATA_DIR + 'ther_chemo.csv',
        lastUpdated: 'August 2024',
        variable: 'ther_chemo',
        pageType: 'treatment',
        colorScheme: 'treatment',
        defaultView: 'iconArraySimple'
    },
    radiotherapy: {
        dataUrl: DATA_DIR + 'ther_rt.csv',
        lastUpdated: 'August 2024',
        variable: 'ther_rt',
        pageType: 'treatment',
        colorScheme: 'treatment',
        defaultView: 'iconArraySimple'
    },
    hormonetherapy: {
        dataUrl: DATA_DIR + 'ther_ht.csv',
        lastUpdated: 'August 2024',
        variable: 'ther_ht',
        pageType: 'treatment',
        colorScheme: 'treatment',
        defaultView: 'iconArraySimple'
    },
    
    // Functioning modules
    emotional_functioning: {
        dataUrl: DATA_DIR + 'ef.csv',
        lastUpdated: 'August 2024',
        variable: 'ef',
        pageType: 'functioning',
        colorScheme: 'functioning',
        defaultView: 'iconArraySimple'
    },
    physical_functioning: {
        dataUrl: DATA_DIR + 'pf.csv',
        lastUpdated: 'August 2024',
        variable: 'pf',
        pageType: 'functioning',
        colorScheme: 'functioning',
        defaultView: 'iconArraySimple'
    },
    role_functioning: {
        dataUrl: DATA_DIR + 'rf.csv',
        lastUpdated: 'August 2024',
        variable: 'rf',
        pageType: 'functioning',
        colorScheme: 'functioning',
        defaultView: 'iconArraySimple'
    },
    
    // Mental health modules (HADS, EORTC QLQ-AYA and self-reported support)
    anxiety: {
        dataUrl: DATA_DIR + 'hads_anx.csv',
        lastUpdated: 'August 2024',
        variable: 'hads_anx',
        pageType: 'mental_health',
        colorScheme: 'default',
        defaultView: 'iconArraySimple',
        legend: {
            simple: [
                { id: 'signs', color: BRAND_COLORS.primary, categories: ['severe', 'moderate', 'mild'] },
                { id: 'noSigns', color: BRAND_COLORS.lightGray, categories: ['none'] }
            ],
            complex: [
                { id: 'severe', color: COLORBLIND_SAFE.category2 },
                { id: 'moderate', color: COLORBLIND_SAFE.category3 },
                { id: 'mild', color: COLORBLIND_SAFE.category4 },
                { id: 'none', color: BRAND_COLORS.lightGray }
            ]
        }
    },
    depression: {
        dataUrl: DATA_DIR + 'hads_dep.csv',
        lastUpdated: 'August 2024',
        variable: 'hads_dep',
        pageType: 'mental_health',
        colorScheme: 'default',
        defaultView: 'iconArraySimple',
        legend: {
            simple: [
                { id: 'signs', color: BRAND_COLORS.primary, categories: ['severe', 'moderate', 'mild'] },
                { id: 'noSigns', color: BRAND_COLORS.lightGray, categories: ['none'] }
            ],
            complex: [
                { id: 'severe', color: COLORBLIND_SAFE.category2 },
                { id: 'moderate', color: COLORBLIND_SAFE.category3 },
                { id: 'mild', color: COLORBLIND_SAFE.category4 },
                { id: 'none', color: BRAND_COLORS.lightGray }
            ]
        }
    },
    worry: {
        dataUrl: DATA_DIR + 'qlq_aya_worry.csv',
        lastUpdated: 'August 2024',
        variable: 'qlq_aya_worry',
        pageType: 'mental_health',
        colorScheme: 'default',
        defaultView: 'iconArraySimple',
        legend: {
            simple: [
                { id: 'worryALot', color: BRAND_COLORS.primary, categories: ['veryMuch', 'quiteABit'] },
                { id: 'worryLittle', color: BRAND_COLORS.lightGray, categories: ['aLittle', 'notAtAll'] }
            ],
            complex: [
                { id: 'veryMuch', color: COLORBLIND_SAFE.category2 },
                { id: 'quiteABit', color: COLORBLIND_SAFE.category3 },
                { id: 'aLittle', color: COLORBLIND_SAFE.category4 },
                { id: 'notAtAll', color: BRAND_COLORS.lightGray }
            ]
        }
    },
    mental_health_support: {
        dataUrl: DATA_DIR + 'mh_support.csv',
        lastUpdated: 'August 2024',
        variable: 'mh_support',
        pageType: 'mental_health',
        colorScheme: 'default',
        defaultView: 'iconArraySimple',
        legend: {
            simple: [
                { id: 'received', color: BRAND_COLORS.primary },
                { id: 'notReceived', color: BRAND_COLORS.lightGray }
            ]
        }
    },

    // Intimacy and relationships modules (EORTC QLQ-AYA single questions
    // on romantic life and sex life, and the relationships and self-esteem scales)
    romantic_life: {
        dataUrl: DATA_DIR + 'qlq_aya_romantic_life.csv',
        lastUpdated: 'September 2026',
        variable: 'qlq_aya_romantic_life',
        pageType: 'relationships',
        colorScheme: 'default',
        defaultView: 'iconArraySimple',
        legend: qlqAyaLegend()
    },
    sex_life: {
        dataUrl: DATA_DIR + 'qlq_aya_sex_life.csv',
        lastUpdated: 'September 2026',
        variable: 'qlq_aya_sex_life',
        pageType: 'relationships',
        colorScheme: 'default',
        defaultView: 'iconArraySimple',
        legend: qlqAyaLegend()
    },
    relationships: {
        dataUrl: DATA_DIR + 'qlq_aya_relationships.csv',
        lastUpdated: 'September 2026',
        variable: 'qlq_aya_relationships',
        pageType: 'relationships',
        colorScheme: 'default',
        defaultView: 'iconArraySimple',
        legend: qlqAyaLegend()
    },
    self_esteem: {
        dataUrl: DATA_DIR + 'qlq_aya_self_esteem.csv',
        lastUpdated: 'September 2026',
        variable: 'qlq_aya_self_esteem',
        pageType: 'relationships',
        colorScheme: 'default',
        defaultView: 'iconArraySimple',
        legend: qlqAyaLegend()
    }
};

// The label and description of legend entries from the strings file
// (web/i18n/<lang>.js), under the given key ('legends.treatment.simple');
// a missing text shows its key, so it is noticed
function localisedLegendEntries(entries, key) {
    entries.forEach(entry => {
        const path = key + '.' + entry.id;
        entry.label = t(path + '.label');
        entry.description = t(path + '.description');
    });
    return entries;
}

// Fill the configurations above with the text of the page language
function localiseConfigs() {
    Object.keys(PAGE_TYPES).forEach(id => {
        PAGE_TYPES[id].subject = t('subjects.' + id);
    });
    Object.keys(VISUALISATION_TYPES).forEach(id => {
        VISUALISATION_TYPES[id].name = t('views.' + id + '.name');
        VISUALISATION_TYPES[id].description = t('views.' + id + '.description');
    });
    const localiseLegend = (legend, key) => {
        ['simple', 'complex'].forEach(kind => {
            if (legend && legend[kind]) localisedLegendEntries(legend[kind], key + '.' + kind);
        });
    };
    Object.keys(LEGEND_CONFIGS).forEach(id => localiseLegend(LEGEND_CONFIGS[id], 'legends.' + id));
    Object.keys(VISUALISATION_CONFIGS).forEach(id => {
        VISUALISATION_CONFIGS[id].title = t('topics.' + id);
        localiseLegend(VISUALISATION_CONFIGS[id].legend, 'legends.' + id);
    });
}
localiseConfigs();

// Show an option as the chosen value of its filter in the filter bar
function markFilterOption(wrap, option) {
    wrap.querySelectorAll('.filter-dropdown button[data-value]').forEach(function (o) {
        o.classList.remove('current');
    });
    option.classList.add('current');
    const valueLabel = wrap.querySelector('.filter-toggle .filter-value');
    if (valueLabel) {
        valueLabel.textContent = option.dataset.value === 'all' ? t('ui.all') : option.textContent.trim();
    }
}

// Show saved filter values ({ cancerType: 'blood', sex: 'female' }) in the filter bar
function setFilterControls(filters) {
    Object.keys(filters).forEach(function (key) {
        const wrap = document.querySelector(`.filter-wrap[data-filter="${key}"]`);
        const option = wrap && wrap.querySelector(`.filter-dropdown button[data-value="${filters[key]}"]`);
        if (option) markFilterOption(wrap, option);
    });
}

// Wire up the working filter dropdowns (cancer type / sex) in the
// filter bar; selecting an option updates the visualisation through
// vis.applyFilters() using the placeholder data above, and is kept for
// the other topic pages
function initFilterDropdowns(vis) {
    document.querySelectorAll('.filter-wrap').forEach(function (wrap) {
        const toggle = wrap.querySelector('.filter-toggle');
        const dropdown = wrap.querySelector('.filter-dropdown');
        if (!toggle || !dropdown) return;
        
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            // Close any other open filter dropdown first
            document.querySelectorAll('.filter-dropdown').forEach(function (d) {
                if (d !== dropdown) d.hidden = true;
            });
            const open = !dropdown.hidden;
            dropdown.hidden = open;
            toggle.setAttribute('aria-expanded', String(!open));
        });
        
        dropdown.querySelectorAll('button[data-value]').forEach(function (option) {
            option.addEventListener('click', function () {
                markFilterOption(wrap, option);
                dropdown.hidden = true;
                toggle.setAttribute('aria-expanded', 'false');
                
                const update = {};
                update[wrap.dataset.filter] = option.dataset.value;
                vis.applyFilters(update);
                saveVisState({ filters: vis.filters });
            });
        });
        
        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target) && !dropdown.hidden) {
                dropdown.hidden = true;
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

// Initialise visualisations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a module page
    const path = window.location.pathname;
    const moduleMatch = path.match(/(chemotherapy|radiotherapy|hormonetherapy|emotional_functioning|physical_functioning|role_functioning|anxiety|depression|worry|mental_health_support|romantic_life|sex_life|relationships|self_esteem)/);
    
    if (moduleMatch) {
        const moduleType = moduleMatch[1];
        const config = VISUALISATION_CONFIGS[moduleType];
        
        if (config) {
            // Use the dedicated container if present, otherwise
            // replace a legacy DataWrapper div with our visualisation
            let container = document.getElementById('visualisation-container');
            
            if (!container) {
                const datawrapperDiv = document.querySelector('div[id^="datawrapper-vis"]');
                if (datawrapperDiv) {
                    datawrapperDiv.innerHTML = '';
                    datawrapperDiv.id = 'visualisation-container';
                    datawrapperDiv.className = 'visualisation-container';
                    container = datawrapperDiv;
                }
            }
            
            if (container) {
                // Initialise visualisation
                const vis = new StrongAyaVisualisation('visualisation-container', config);
                initFilterDropdowns(vis);
            }
        }
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        StrongAyaVisualisation, 
        VISUALISATION_CONFIGS,
        PAGE_TYPES,
        VISUALISATION_TYPES,
        COLOR_SCHEMES,
        COLORBLIND_SAFE,
        BRAND_COLORS,
        LEGEND_CONFIGS
    };
}
