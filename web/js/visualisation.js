/**
 * STRONG-AYA Info Portal Visualisation Module
 * Handles icon array, table, and pie chart visualisations using Plotly.js
 * Loads data from GitHub CSV files
 * Supports multiple page types and visualisation variants
 * Uses brand colour theme and colour-blind-safe palettes
 */

// Brand colour theme from existing CSS
const BRAND_COLORS = {
    primary: '#f7741e',      // Chocolate orange - main brand colour
    secondary: '#e36799',    // Pale violet red - existing accent
    blue: '#7607ff',        // Blue - existing accent
    dark: '#000000',        // Black
    light: '#ffffff',       // White
    silver: '#c9c6c4',      // Silver
    lightGray: '#d7d7d7',   // Light grey
    darkGray: '#aeaeae',    // Dark grey
    gainsboro: '#dbdbdb'    // Gainsboro
};

// Colour-blind-safe colour palettes
const COLORBLIND_SAFE = {
    // IBM Design Library colour-blind-safe palette
    category1: '#648FFF',    // Blue
    category2: '#DC267F',    // Magenta
    category3: '#FE6100',    // Orange (matches brand)
    category4: '#FFB000',    // Gold
    category5: '#785EF0',    // Purple
    
    // Additional accessible colours
    yes: '#648FFF',         // Blue for "Yes"
    no: '#DC267F',          // Magenta for "No" (avoids red-green)
    partial: '#FFB000',      // Gold for "Partial"
    
    // For functioning scores (avoiding red-green)
    high: '#648FFF',        // Blue for high/good
    medium: '#FE6100',      // Orange for medium
    low: '#DC267F',          // Magenta for low
    
    // For symptoms (colour-blind-safe)
    severe: '#648FFF',      // Blue
    moderate: '#FE6100',    // Orange
    mild: '#FFB000',        // Gold
    none: '#785EF0',        // Purple
    
    // Treatment colours (using brand colours)
    received: '#f7741e',     // Brand orange
    notReceived: '#d7d7d7', // Light grey
    planned: '#7607ff',      // Brand blue
    completed: '#648FFF',    // Accessible blue
    ongoing: '#FFB000'       // Gold
};

// Page type configurations
const PAGE_TYPES = {
    treatment: {
        id: 'treatment',
        name: 'Treatment Information',
        description: 'Information about cancer treatments that young people with cancer receive',
        modules: ['chemotherapy', 'radiotherapy', 'hormonetherapy', 'surgery', 'immunotherapy'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'],
        colorScheme: 'treatment'
    },
    functioning: {
        id: 'functioning',
        name: 'Quality of Life & Functioning',
        description: 'Functioning scores and quality of life metrics from EORTC QLQ-C30 questionnaires',
        modules: ['emotional_functioning', 'physical_functioning', 'role_functioning', 'social_functioning', 'cognitive_functioning'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'],
        colorScheme: 'functioning'
    },
    symptoms: {
        id: 'symptoms',
        name: 'Symptoms & Side Effects',
        description: 'Common symptoms and treatment side effects reported by young people with cancer',
        modules: ['fatigue', 'pain', 'nausea', 'anxiety', 'depression'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'],
        colorScheme: 'symptoms'
    },
    mental_health: {
        id: 'mental_health',
        name: 'Mental Health',
        description: 'How young people with cancer feel mentally, and the support they get',
        modules: ['anxiety', 'depression', 'worry', 'mental_health_support'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'],
        colorScheme: 'default'
    },
    lifestyle: {
        id: 'lifestyle',
        name: 'Lifestyle Factors',
        description: 'Lifestyle factors that affect young people with cancer',
        modules: ['physical_activity', 'diet', 'sleep', 'smoking', 'alcohol'],
        visualisationTypes: ['iconArraySimple', 'table', 'pieChart', 'barChart'],
        colorScheme: 'default'
    },
    demographics: {
        id: 'demographics',
        name: 'Demographic Information',
        description: 'Background information about young people with cancer',
        modules: ['age', 'sex', 'education', 'employment', 'relationship_status'],
        visualisationTypes: ['table', 'pieChart', 'barChart'],
        colorScheme: 'default'
    }
};

// Visualisation type configurations
const VISUALISATION_TYPES = {
    iconArraySimple: {
        id: 'iconArraySimple',
        name: 'Simple Icon Array',
        description: 'Person icons in two groups — simple and clear',
        icon: '👥'
    },
    iconArrayComplex: {
        id: 'iconArrayComplex',
        name: 'Complex Icon Array',
        description: 'Person icons in more groups — more detail',
        icon: '👥'
    },
    table: {
        id: 'table',
        name: 'Data Table',
        description: 'A table with all numbers and percentages',
        icon: '📊'
    },
    pieChart: {
        id: 'pieChart',
        name: 'Pie Chart',
        description: 'A circle chart that shows the share of each group',
        icon: '🥧'
    },
    barChart: {
        id: 'barChart',
        name: 'Bar Chart',
        description: 'Bars that make the groups easy to compare',
        icon: '📈'
    }
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

// Legend configurations for different visualisation types
const LEGEND_CONFIGS = {
    treatment: {
        simple: [
            { id: 'received', label: 'Received Treatment', color: COLOR_SCHEMES.treatment.received, description: 'People who receive this treatment' },
            { id: 'notReceived', label: 'Did Not Receive', color: COLOR_SCHEMES.treatment.notReceived, description: 'People who do not receive this treatment' }
        ],
        complex: [
            { id: 'received', label: 'Completed Treatment', color: COLOR_SCHEMES.treatment.completed, description: 'People who completed the whole treatment' },
            { id: 'partial', label: 'Partial Treatment', color: COLOR_SCHEMES.treatment.partial, description: 'People who received a part of the treatment' },
            { id: 'planned', label: 'Planned', color: COLOR_SCHEMES.treatment.planned, description: 'People whose treatment is planned but has not started yet' },
            { id: 'notReceived', label: 'Not Received', color: COLOR_SCHEMES.treatment.notReceived, description: 'People who did not receive the treatment' }
        ]
    },
    functioning: {
        // The explicit icon lists keep both views working with today's
        // two-colour flashcards and with the more granular flashcards
        // (purple/magenta/gold/blue icons) that will become available
        simple: [
            { id: 'declined', label: 'Declined', color: COLOR_SCHEMES.functioning.declined, icons: ['person-orange', 'person-purple', 'person-magenta'], description: 'People whose score got worse' },
            { id: 'stable', label: 'Stable or improved', color: COLOR_SCHEMES.functioning.stable, icons: ['person-grey', 'person-gold', 'person-blue'], description: 'People whose score stayed about the same or got better' }
        ],
        complex: [
            { id: 'significantly_declined', label: 'Declined a lot', color: COLOR_SCHEMES.functioning.significantly_declined, icons: ['person-purple'], description: 'People whose score got much worse' },
            { id: 'declined', label: 'Declined', color: COLOR_SCHEMES.functioning.declined, icons: ['person-orange', 'person-magenta'], description: 'People whose score got worse' },
            { id: 'stable', label: 'Stable', color: COLOR_SCHEMES.functioning.stable, icons: ['person-grey', 'person-gold'], description: 'People whose score stayed about the same' },
            { id: 'improved', label: 'Improved', color: COLOR_SCHEMES.functioning.improved, icons: ['person-blue'], description: 'People whose score got better' }
        ]
    },
    symptoms: {
        simple: [
            { id: 'present', label: 'Present', color: COLOR_SCHEMES.symptoms.moderate, description: 'People who have this symptom' },
            { id: 'absent', label: 'Absent', color: COLOR_SCHEMES.symptoms.none, description: 'People who do not have this symptom' }
        ],
        complex: [
            { id: 'severe', label: 'Severe', color: COLOR_SCHEMES.symptoms.severe, description: 'People with severe symptoms' },
            { id: 'moderate', label: 'Moderate', color: COLOR_SCHEMES.symptoms.moderate, description: 'People with moderate symptoms' },
            { id: 'mild', label: 'Mild', color: COLOR_SCHEMES.symptoms.mild, description: 'People with mild symptoms' },
            { id: 'none', label: 'None', color: COLOR_SCHEMES.symptoms.none, description: 'People without symptoms' }
        ]
    }
};

// ------------------------------------------------------------------
// PLACEHOLDER filter data (work in progress)
// Number of people out of 100 that fall in the *first* legend
// category (e.g. "received treatment" / "declined functioning") for
// each cancer type / sex combination. `null` means "use the real,
// unfiltered CSV data". Simply update these numbers once the real
// filtered figures become available.
// ------------------------------------------------------------------
const FILTER_PLACEHOLDER_COUNTS = {
    all:   { all: null, male: 48, female: 62, intersex: 55 },
    blood: { all: 58,   male: 54, female: 61, intersex: 57 },
    solid: { all: 52,   male: 49, female: 56, intersex: 53 },
    skin:  { all: 41,   male: 38, female: 44, intersex: 42 },
    brain: { all: 66,   male: 63, female: 68, intersex: 65 }
};

class StrongAyaVisualisation {
    constructor(containerId, dataConfig) {
        this.containerId = containerId;
        this.dataConfig = dataConfig;
        this.container = document.getElementById(containerId);
        this.currentView = dataConfig.defaultView || 'iconArraySimple';
        this.data = null;
        this.filters = {};
        this.legendData = [];
        this.pageType = null;
        this.categoryCounts = {};
        this.iconColourCounts = {};
        this.activePlaceholder = null;
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
                this.legendData = [
                    { id: 'yes', label: 'Yes', color: COLOR_SCHEMES.default.yes, description: 'Positive/Yes' },
                    { id: 'no', label: 'No', color: COLOR_SCHEMES.default.no, description: 'Negative/No' }
                ];
                this.colorScheme = COLOR_SCHEMES.default;
            }
        } else {
            // Default legend
            this.legendData = [
                { id: 'yes', label: 'Yes', color: COLOR_SCHEMES.default.yes, description: 'Positive/Yes' },
                { id: 'no', label: 'No', color: COLOR_SCHEMES.default.no, description: 'Negative/No' }
            ];
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
            
            const csvText = await response.text();
            this.data = this.parseCSV(csvText);
            
            // Extract metadata from first line if present
            if (this.data.length > 0) {
                this.metadata = this.data[0];
                this.data = this.data.slice(1);
            }
            
            // Parse data to get counts for each category
            this.parseDataCategories();
            
            this.render();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('We could not load the data. Please try again later.');
        }
    }
    
    parseCSV(csvText) {
        // Flashcard CSV format: first line is the variable name (header),
        // subsequent lines contain the icon markdown (e.g. person-orange/person-grey images)
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            return [];
        }
        
        const variable = lines[0].trim();
        const icons = lines.slice(1).join('\n');
        
        return [
            { variable: variable },
            { variable: variable, icons: icons }
        ];
    }
    
    parseDataCategories() {
        // Count how often each icon colour occurs in the CSV, then map
        // the colours onto the categories of the current legend
        this.iconColourCounts = {};
        
        const firstRow = this.data && this.data[0];
        if (firstRow && firstRow.icons) {
            (firstRow.icons.match(/person-[a-z]+/g) || []).forEach(token => {
                this.iconColourCounts[token] = (this.iconColourCounts[token] || 0) + 1;
            });
        }
        
        this.computeCountsForLegend();
        
        // Remember the unfiltered counts so filters can be reset
        this.baseCounts = Object.assign({}, this.categoryCounts);
    }
    
    // Turn the raw icon colour counts into counts per legend category.
    // A legend entry can list its own icon colours (icons: [...]);
    // otherwise the default mapping is used: orange icons belong to the
    // first legend entry (e.g. received/declined) and grey icons to the
    // second (e.g. notReceived/stable).
    computeCountsForLegend() {
        const colourCounts = this.iconColourCounts || {};
        this.categoryCounts = {};
        this.legendData.forEach(item => {
            this.categoryCounts[item.id] = 0;
        });
        
        if (this.legendData.some(item => item.icons)) {
            this.legendData.forEach(item => {
                (item.icons || []).forEach(icon => {
                    this.categoryCounts[item.id] += colourCounts[icon] || 0;
                });
            });
        } else {
            const positiveId = this.legendData[0] ? this.legendData[0].id : 'yes';
            const negativeId = this.legendData[1] ? this.legendData[1].id : 'no';
            
            const iconMappings = {
                'person-orange': positiveId,
                'person-grey': negativeId,
                'person-yellow': 'partial',
                'person-gold': 'partial',
                'person-blue': 'improved',
                'person-magenta': 'declined',
                'person-purple': 'significantly_declined'
            };
            
            Object.entries(iconMappings).forEach(([iconType, category]) => {
                if (this.categoryCounts[category] !== undefined) {
                    this.categoryCounts[category] += colourCounts[iconType] || 0;
                }
            });
        }
        
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
        
        // Place the "View" selection button next to the other tool buttons
        // (Glossary, Help, Compare) in the page toolbar when available;
        // fall back to a selector row above the visualisation otherwise.
        const toolButtons = document.querySelector('.vis-card .tool-buttons');
        if (toolButtons) {
            if (!toolButtons.querySelector('.view-selection-btn')) {
                const selectorBtn = document.createElement('button');
                selectorBtn.className = 'tool-btn view-selection-btn';
                selectorBtn.innerHTML = '<i class="fas fa-eye"></i>View';
                selectorBtn.title = 'Click to select visualisation type';
                selectorBtn.addEventListener('click', () => this.openViewSelectorModal());
                toolButtons.insertBefore(selectorBtn, toolButtons.firstChild);
            }
        } else {
            const viewSelector = document.createElement('div');
            viewSelector.className = 'visualisation-selector';
            
            const selectorBtn = document.createElement('button');
            selectorBtn.className = 'vis-btn view-selection-btn';
            selectorBtn.innerHTML = 'View Selection <span class="view-type-indicator">(' + this.getCurrentViewName() + ')</span>';
            selectorBtn.title = 'Click to select visualisation type';
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
    
    // Views available for this page. The complex icon array needs a
    // complex legend; when that legend maps icon colours explicitly
    // (icons: [...]), more granular levels are (or will be) available,
    // so the view is always offered. Without such a mapping it is only
    // offered when the data actually has 3+ icon colours (two-colour
    // data renders identically in the simple array).
    getAvailableViews() {
        let views = this.pageType?.visualisationTypes ||
                    ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'];
        const distinctColours = Object.values(this.iconColourCounts || {}).filter(c => c > 0).length;
        const complexLegend = (this.dataConfig.legend && this.dataConfig.legend.complex) ||
                              (LEGEND_CONFIGS[this.pageType?.id] || {}).complex || null;
        const hasIconMapping = !!complexLegend && complexLegend.some(item => item.icons);
        if (!complexLegend || (!hasIconMapping && distinctColours > 0 && distinctColours < 3)) {
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
        title.textContent = 'Choose how you want to see this information';
        title.style.cssText = 'margin: 0 0 20px 0; font-size: 24px; color: black; font-weight: 600; font-family: Poppins, sans-serif;';
        modal.appendChild(title);
        
        const description = document.createElement('p');
        description.textContent = 'Pick the option that works best for you.';
        description.style.cssText = 'font-size: 14px; color: #a2a2a2; margin: 0 0 25px 0; line-height: 1.6;';
        modal.appendChild(description);
        
        const grid = document.createElement('div');
        grid.id = 'view-selector-grid';
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px;';
        modal.appendChild(grid);
        
        const footer = document.createElement('div');
        footer.style.cssText = 'display: flex; justify-content: flex-end; gap: 10px; border-top: 2px solid #d7d7d7; padding-top: 20px;';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = 'padding: 12px 24px; border-radius: 8px; font-family: Poppins, sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; background: #d7d7d7; color: black; border: none;';
        cancelBtn.addEventListener('click', () => modal.close());
        footer.appendChild(cancelBtn);
        
        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.textContent = 'Apply';
        applyBtn.style.cssText = 'padding: 12px 24px; border-radius: 8px; font-family: Poppins, sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; background: #f7741e; color: white; border: none;';
        applyBtn.addEventListener('click', () => {
            this.switchView(this.pendingView || this.currentView);
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
        const markSelected = (card, selected) => {
            card.style.borderColor = selected ? '#f7741e' : '#d7d7d7';
            card.style.background = selected ? 'rgba(247, 116, 30, 0.05)' : 'white';
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
                name.style.cssText = 'font-size: 16px; font-weight: 600; color: black; margin: 0 0 5px 0;';
                card.appendChild(name);
                
                const desc = document.createElement('div');
                desc.textContent = visType.description;
                desc.style.cssText = 'font-size: 14px; color: #a2a2a2; margin: 0; line-height: 1.4;';
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
        
        // Update the view selection button text (fallback selector row only;
        // the toolbar "View" tool button keeps its compact label)
        const selectorBtn = this.container.querySelector('.visualisation-selector .view-selection-btn');
        if (selectorBtn) {
            selectorBtn.innerHTML = 'View Selection <span class="view-type-indicator">(' + this.getCurrentViewName() + ')</span>';
        }
        const toolbarBtn = document.querySelector('.vis-card .tool-buttons .view-selection-btn');
        if (toolbarBtn) {
            toolbarBtn.innerHTML = '<i class="fas fa-eye"></i>View';
            toolbarBtn.title = 'Current view: ' + this.getCurrentViewName() + ' — click to change';
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
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available.</p>';
            return;
        }
        
        const html = this.generateIconArrayHTML('simple');
        this.visArea.innerHTML = html;
    }
    
    renderIconArrayComplex() {
        // Check if we have enough categories for complex view
        const hasEnoughCategories = Object.keys(this.categoryCounts).length >= 3;
        
        if (this.totalCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available.</p>';
            return;
        }
        
        if (!hasEnoughCategories) {
            this.visArea.innerHTML = `
                <p style="text-align: center; padding: 20px; color: #666;">
                    This detailed view needs data with at least 3 groups.
                    This data has ${Object.keys(this.categoryCounts).length}.
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
        const summaryParts = [];
        
        this.legendData.forEach(category => {
            const count = this.categoryCounts[category.id] || 0;
            const percentage = this.totalCount > 0 ? Math.round((count / this.totalCount) * 100) : 0;
            summaryParts.push(`${category.label}: ${count} of ${this.totalCount}`);
            
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
            
            // Build legend item (kept simple: swatch + label; the full
            // explanation is shown as a tooltip when hovering the item)
            legendItems += `
                <div class="legend-item" data-tooltip="${category.description || category.label}">
                    <div class="legend-color-box" style="background: ${category.color};"></div>
                    <div class="legend-label">
                        <strong>${category.label}</strong>
                    </div>
                </div>
            `;
        });
        
        // The simple grid is one image to a screen reader: a single
        // description instead of 100 individual (decorative) icons
        const summary = `Icon array of ${this.totalCount} people. ${summaryParts.join('. ')}.`;
        const iconArea = isComplex
            ? `<div class="icon-array-container">${iconRows}</div>`
            : `<div class="icon-array-grid" role="img" aria-label="${summary}">${combinedIcons}</div>`;
        
        // No textual header around the icon arrays: the statement below the
        // figure and the info note already provide the context and the
        // update date. Both views are presented as a large, centred figure
        // with the legend middle-aligned next to it.
        return `
            <div class="visualisation-wrapper">
                <div class="icon-array-visualisation">
                    ${iconArea}
                </div>
                
                <div class="legend-container">
                    <h4>Legend</h4>
                    <div class="legend-items">
                        ${legendItems}
                    </div>
                </div>
            </div>
        `;
    }
    
    generateIconHTML(count, color) {
        if (count === 0) return '<span class="no-icons">—</span>';
        
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `<i class="fas fa-person person-icon" style="color: ${color};" aria-hidden="true"></i>`;
        }
        return html;
    }
    
    renderTable() {
        if (this.totalCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available.</p>';
            return;
        }
        
        let tableRows = '';
        let legendItems = '';
        
        this.legendData.forEach(category => {
            const count = this.categoryCounts[category.id] || 0;
            const percentage = this.totalCount > 0 ? Math.round((count / this.totalCount) * 100) : 0;
            
            tableRows += `
                <tr>
                    <td><strong>${category.label}</strong></td>
                    <td>${count}</td>
                    <td>${percentage}%</td>
                    <td>${category.description || '-'}</td>
                </tr>
            `;
            
            legendItems += `
                <div class="legend-item">
                    <div class="legend-color-box" style="background: ${category.color};"></div>
                    <span><strong>${category.label}</strong></span>
                </div>
            `;
        });
        
        // Add total row
        tableRows += `
            <tr class="table-total">
                <td><strong>Total</strong></td>
                <td>${this.totalCount}</td>
                <td>100%</td>
                <td>All people together</td>
            </tr>
        `;
        
        const html = `
            <div class="visualisation-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Group</th>
                            <th>Number</th>
                            <th>Percentage</th>
                            <th>What it means</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                
                <div class="legend-container">
                    <h4>Legend</h4>
                    <div class="legend-items">
                        ${legendItems}
                    </div>
                </div>
            </div>
        `;
        
        this.visArea.innerHTML = html;
    }
    
    renderPieChart() {
        if (this.totalCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available.</p>';
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
                text: `${this.dataConfig.title || 'Distribution'} (n=${this.totalCount})`,
                x: 0.5,
                xanchor: 'center',
                font: {
                    size: 18,
                    family: 'Poppins, sans-serif'
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
        chartDiv.style.flex = '1';
        chartDiv.style.minWidth = '0';
        
        const legendDiv = document.createElement('div');
        legendDiv.className = 'legend-container';
        legendDiv.innerHTML = `
            <h4>Legend</h4>
            <div class="legend-items">
                ${this.legendData.map(c => `
                    <div class="legend-item">
                        <div class="legend-color-box" style="background: ${c.color};"></div>
                        <span><strong>${c.label}</strong></span>
                    </div>
                `).join('')}
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
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">We could not show the chart. Please reload the page.</p>';
        }
    }
    
    renderBarChart() {
        if (this.totalCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available.</p>';
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
                text: `${this.dataConfig.title || 'Numbers by group'} (Total: ${this.totalCount})`,
                x: 0.5,
                xanchor: 'center',
                font: {
                    size: 18,
                    family: 'Poppins, sans-serif'
                }
            },
            xaxis: { 
                title: 'Group',
                tickfont: { family: 'Poppins, sans-serif' }
            },
            yaxis: { 
                title: 'Number of people',
                tickfont: { family: 'Poppins, sans-serif' }
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
        chartDiv.style.flex = '1';
        chartDiv.style.minWidth = '0';
        
        const legendDiv = document.createElement('div');
        legendDiv.className = 'legend-container';
        legendDiv.innerHTML = `
            <h4>Legend</h4>
            <div class="legend-items">
                ${this.legendData.map(c => `
                    <div class="legend-item">
                        <div class="legend-color-box" style="background: ${c.color};"></div>
                        <span><strong>${c.label}</strong></span>
                    </div>
                `).join('')}
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
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">We could not show the chart. Please reload the page.</p>';
        }
    }
    
    showError(message) {
        this.visArea.innerHTML = `<p style="text-align: center; padding: 20px; color: ${BRAND_COLORS.secondary};">${message}</p>`;
    }
    
    applyFilters(filters) {
        this.filters = Object.assign({}, this.filters, filters);
        
        const cancerType = this.filters.cancerType || 'all';
        const sex = this.filters.sex || 'all';
        const placeholder = (FILTER_PLACEHOLDER_COUNTS[cancerType] || {})[sex];
        
        // A null/undefined placeholder means: use the real CSV counts
        this.activePlaceholder = (placeholder === null || placeholder === undefined) ? null : placeholder;
        
        this.computeCountsForLegend();
        this.render();
        
        // The statement always follows the first group of the simple legend
        const simpleLegend = (this.dataConfig.legend && this.dataConfig.legend.simple) ||
                             (LEGEND_CONFIGS[this.pageType?.id] || {}).simple || this.legendData;
        const positiveId = simpleLegend[0] ? simpleLegend[0].id : 'yes';
        const statementCount = this.activePlaceholder !== null
            ? this.activePlaceholder
            : ((this.baseCounts && this.baseCounts[positiveId]) || 0);
        this.updateStatement(statementCount);
    }
    
    // Keep the "N out of 100 people ..." statement below the figure in
    // sync with the (filtered) data
    updateStatement(count) {
        const statement = document.querySelector('.vis-card .vis-statement');
        if (statement) {
            statement.innerHTML = statement.innerHTML.replace(/^\s*\d+/, count);
        }
    }
}

// Data configurations for different visualisations
const VISUALISATION_CONFIGS = {
    // Treatment modules
    chemotherapy: {
        dataUrl: '../data/ther_chemo_flashcard.csv',
        title: 'Chemotherapy Treatment',
        description: 'How many young people with cancer receive chemotherapy',
        lastUpdated: 'August 2024',
        variable: 'ther_chemo',
        pageType: 'treatment',
        colorScheme: 'treatment',
        defaultView: 'iconArraySimple'
    },
    radiotherapy: {
        dataUrl: '../data/ther_rt_flashcard.csv',
        title: 'Radiotherapy Treatment',
        description: 'How many young people with cancer receive radiotherapy',
        lastUpdated: 'August 2024',
        variable: 'ther_rt',
        pageType: 'treatment',
        colorScheme: 'treatment',
        defaultView: 'iconArraySimple'
    },
    hormonetherapy: {
        dataUrl: '../data/ther_ht_flashcard.csv',
        title: 'Hormone Therapy',
        description: 'How many young people with cancer receive hormone therapy',
        lastUpdated: 'August 2024',
        variable: 'ther_ht',
        pageType: 'treatment',
        colorScheme: 'treatment',
        defaultView: 'iconArraySimple'
    },
    
    // Functioning modules
    emotional_functioning: {
        dataUrl: '../data/ef_flashcard.csv',
        title: 'Emotional Functioning',
        description: 'How many young people with cancer feel worse emotionally after treatment',
        lastUpdated: 'August 2024',
        variable: 'ef',
        pageType: 'functioning',
        colorScheme: 'functioning',
        defaultView: 'iconArraySimple'
    },
    physical_functioning: {
        dataUrl: '../data/pf_flashcard.csv',
        title: 'Physical Functioning',
        description: 'How many young people with cancer find everyday physical activities harder after treatment',
        lastUpdated: 'August 2024',
        variable: 'pf',
        pageType: 'functioning',
        colorScheme: 'functioning',
        defaultView: 'iconArraySimple'
    },
    role_functioning: {
        dataUrl: '../data/rf_flashcard.csv',
        title: 'Role Functioning',
        description: 'How many young people with cancer have more trouble with daily tasks after treatment',
        lastUpdated: 'August 2024',
        variable: 'rf',
        pageType: 'functioning',
        colorScheme: 'functioning',
        defaultView: 'iconArraySimple'
    },
    
    // Mental health modules (HADS, EORTC QLQ-AYA and self-reported support)
    anxiety: {
        dataUrl: '../data/hads_anx_flashcard.csv',
        title: 'Anxiety',
        description: 'How many young people with cancer show signs of anxiety after treatment',
        lastUpdated: 'August 2024',
        variable: 'hads_anx',
        pageType: 'mental_health',
        colorScheme: 'default',
        defaultView: 'iconArraySimple',
        legend: {
            simple: [
                { id: 'signs', label: 'Signs of anxiety', color: BRAND_COLORS.primary, icons: ['person-magenta', 'person-orange', 'person-gold'], description: 'People whose HADS answers show signs of anxiety (score 8 or higher)' },
                { id: 'noSigns', label: 'No signs', color: BRAND_COLORS.lightGray, icons: ['person-grey'], description: 'People whose HADS answers show no signs of anxiety (score 0 to 7)' }
            ],
            complex: [
                { id: 'severe', label: 'Strong signs', color: COLORBLIND_SAFE.category2, icons: ['person-magenta'], description: 'People with strong signs of anxiety (HADS score 15 to 21)' },
                { id: 'moderate', label: 'Clear signs', color: COLORBLIND_SAFE.category3, icons: ['person-orange'], description: 'People with clear signs of anxiety (HADS score 11 to 14)' },
                { id: 'mild', label: 'Mild signs', color: COLORBLIND_SAFE.category4, icons: ['person-gold'], description: 'People with mild signs of anxiety (HADS score 8 to 10)' },
                { id: 'none', label: 'No signs', color: BRAND_COLORS.lightGray, icons: ['person-grey'], description: 'People with no signs of anxiety (HADS score 0 to 7)' }
            ]
        }
    },
    depression: {
        dataUrl: '../data/hads_dep_flashcard.csv',
        title: 'Depression',
        description: 'How many young people with cancer show signs of depression after treatment',
        lastUpdated: 'August 2024',
        variable: 'hads_dep',
        pageType: 'mental_health',
        colorScheme: 'default',
        defaultView: 'iconArraySimple',
        legend: {
            simple: [
                { id: 'signs', label: 'Signs of depression', color: BRAND_COLORS.primary, icons: ['person-magenta', 'person-orange', 'person-gold'], description: 'People whose HADS answers show signs of depression (score 8 or higher)' },
                { id: 'noSigns', label: 'No signs', color: BRAND_COLORS.lightGray, icons: ['person-grey'], description: 'People whose HADS answers show no signs of depression (score 0 to 7)' }
            ],
            complex: [
                { id: 'severe', label: 'Strong signs', color: COLORBLIND_SAFE.category2, icons: ['person-magenta'], description: 'People with strong signs of depression (HADS score 15 to 21)' },
                { id: 'moderate', label: 'Clear signs', color: COLORBLIND_SAFE.category3, icons: ['person-orange'], description: 'People with clear signs of depression (HADS score 11 to 14)' },
                { id: 'mild', label: 'Mild signs', color: COLORBLIND_SAFE.category4, icons: ['person-gold'], description: 'People with mild signs of depression (HADS score 8 to 10)' },
                { id: 'none', label: 'No signs', color: BRAND_COLORS.lightGray, icons: ['person-grey'], description: 'People with no signs of depression (HADS score 0 to 7)' }
            ]
        }
    },
    worry: {
        dataUrl: '../data/qlq_aya_worry_flashcard.csv',
        title: 'Worry',
        description: 'How many young people with cancer say they worry a lot',
        lastUpdated: 'August 2024',
        variable: 'qlq_aya_worry',
        pageType: 'mental_health',
        colorScheme: 'default',
        defaultView: 'iconArraySimple',
        legend: {
            simple: [
                { id: 'worryALot', label: 'Worry a lot', color: BRAND_COLORS.primary, icons: ['person-magenta', 'person-orange'], description: 'People who say they worry very much or quite a bit' },
                { id: 'worryLittle', label: 'Worry a little or not', color: BRAND_COLORS.lightGray, icons: ['person-gold', 'person-grey'], description: 'People who say they worry a little or not at all' }
            ],
            complex: [
                { id: 'veryMuch', label: 'Very much', color: COLORBLIND_SAFE.category2, icons: ['person-magenta'], description: 'People who say they worry very much' },
                { id: 'quiteABit', label: 'Quite a bit', color: COLORBLIND_SAFE.category3, icons: ['person-orange'], description: 'People who say they worry quite a bit' },
                { id: 'aLittle', label: 'A little', color: COLORBLIND_SAFE.category4, icons: ['person-gold'], description: 'People who say they worry a little' },
                { id: 'notAtAll', label: 'Not at all', color: BRAND_COLORS.lightGray, icons: ['person-grey'], description: 'People who say they do not worry' }
            ]
        }
    },
    mental_health_support: {
        dataUrl: '../data/mh_support_flashcard.csv',
        title: 'Mental health support',
        description: 'How many young people with cancer say they received mental health support',
        lastUpdated: 'August 2024',
        variable: 'mh_support',
        pageType: 'mental_health',
        colorScheme: 'default',
        defaultView: 'iconArraySimple',
        legend: {
            simple: [
                { id: 'received', label: 'Received support', color: BRAND_COLORS.primary, icons: ['person-orange'], description: 'People who say they received mental health support' },
                { id: 'notReceived', label: 'No support', color: BRAND_COLORS.lightGray, icons: ['person-grey'], description: 'People who say they did not receive mental health support' }
            ]
        }
    }
};

// Wire up the working filter dropdowns (cancer type / sex) in the
// filter bar; selecting an option updates the visualisation through
// vis.applyFilters() using the placeholder data above
function initFilterDropdowns(vis) {
    document.querySelectorAll('.filter-wrap').forEach(function (wrap) {
        const toggle = wrap.querySelector('.filter-toggle');
        const dropdown = wrap.querySelector('.filter-dropdown');
        const valueLabel = toggle ? toggle.querySelector('.filter-value') : null;
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
                dropdown.querySelectorAll('button[data-value]').forEach(function (o) {
                    o.classList.remove('current');
                });
                option.classList.add('current');
                if (valueLabel) {
                    valueLabel.textContent = option.dataset.value === 'all' ? 'All' : option.textContent.trim();
                }
                dropdown.hidden = true;
                toggle.setAttribute('aria-expanded', 'false');
                
                const update = {};
                update[wrap.dataset.filter] = option.dataset.value;
                vis.applyFilters(update);
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
    const moduleMatch = path.match(/(chemotherapy|radiotherapy|hormonetherapy|emotional_functioning|physical_functioning|role_functioning|anxiety|depression|worry|mental_health_support)/);
    
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
