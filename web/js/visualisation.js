/**
 * STRONG-AYA Info Portal Visualisation Module
 * Handles icon array, table, and pie chart visualisations using Plotly.js
 * Loads data from GitHub CSV files
 * Supports multiple page types and visualisation variants
 * Uses brand color theme and colorblind-safe palettes
 */

// Brand color theme from existing CSS
const BRAND_COLORS = {
    primary: '#f7741e',      // Chocolate orange - main brand color
    secondary: '#e36799',    // Pale violet red - existing accent
    blue: '#7607ff',        // Blue - existing accent
    dark: '#000000',        // Black
    light: '#ffffff',       // White
    silver: '#c9c6c4',      // Silver
    lightGray: '#d7d7d7',   // Light gray
    darkGray: '#aeaeae',    // Dark gray
    gainsboro: '#dbdbdb'    // Gainsboro
};

// Colorblind-safe color palettes
const COLORBLIND_SAFE = {
    // IBM Design Library colorblind-safe palette
    category1: '#648FFF',    // Blue
    category2: '#DC267F',    // Magenta
    category3: '#FE6100',    // Orange (matches brand)
    category4: '#FFB000',    // Gold
    category5: '#785EF0',    // Purple
    
    // Additional accessible colors
    yes: '#648FFF',         // Blue for "Yes"
    no: '#DC267F',          // Magenta for "No" (avoids red-green)
    partial: '#FFB000',      // Gold for "Partial"
    
    // For functioning scores (avoiding red-green)
    high: '#648FFF',        // Blue for high/good
    medium: '#FE6100',      // Orange for medium
    low: '#DC267F',          // Magenta for low
    
    // For symptoms (colorblind-safe)
    severe: '#648FFF',      // Blue
    moderate: '#FE6100',    // Orange
    mild: '#FFB000',        // Gold
    none: '#785EF0',        // Purple
    
    // Treatment colors (using brand colors)
    received: '#f7741e',     // Brand orange
    notReceived: '#d7d7d7', // Light gray
    planned: '#7607ff',      // Brand blue
    completed: '#648FFF',    // Accessible blue
    ongoing: '#FFB000'       // Gold
};

// Page type configurations
const PAGE_TYPES = {
    treatment: {
        id: 'treatment',
        name: 'Treatment Information',
        description: 'Information about cancer treatments received by AYA patients',
        modules: ['chemotherapy', 'radiotherapy', 'hormonetherapy', 'surgery', 'immunotherapy'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'],
        colorScheme: 'treatment'
    },
    functioning: {
        id: 'functioning',
        name: 'Quality of Life & Functioning',
        description: 'Functioning scores and quality of life metrics from EORTC QLQ-C30 questionnaires',
        modules: ['emotional_functioning', 'physical_functioning', 'role_functioning', 'social_functioning', 'cognitive_functioning'],
        visualisationTypes: ['iconArraySimple', 'table', 'pieChart', 'barChart'],
        colorScheme: 'functioning'
    },
    symptoms: {
        id: 'symptoms',
        name: 'Symptoms & Side Effects',
        description: 'Common symptoms and treatment side effects reported by AYA patients',
        modules: ['fatigue', 'pain', 'nausea', 'anxiety', 'depression'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'],
        colorScheme: 'symptoms'
    },
    mental_health: {
        id: 'mental_health',
        name: 'Mental Health & Wellbeing',
        description: 'Mental health metrics and psychological wellbeing indicators',
        modules: ['anxiety', 'depression', 'stress', 'coping', 'resilience'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart'],
        colorScheme: 'qualityOfLife'
    },
    lifestyle: {
        id: 'lifestyle',
        name: 'Lifestyle Factors',
        description: 'Lifestyle factors affecting AYA cancer survivors',
        modules: ['physical_activity', 'diet', 'sleep', 'smoking', 'alcohol'],
        visualisationTypes: ['iconArraySimple', 'table', 'pieChart', 'barChart'],
        colorScheme: 'default'
    },
    demographics: {
        id: 'demographics',
        name: 'Demographic Information',
        description: 'Demographic characteristics of AYA cancer survivors',
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
        description: 'Two categories: Yes/No - Clear binary representation',
        icon: '👥'
    },
    iconArrayComplex: {
        id: 'iconArrayComplex',
        name: 'Complex Icon Array',
        description: 'Multiple granular categories - Detailed breakdown',
        icon: '👥'
    },
    table: {
        id: 'table',
        name: 'Data Table',
        description: 'Verbose table with all numbers and percentages',
        icon: '📊'
    },
    pieChart: {
        id: 'pieChart',
        name: 'Pie Chart',
        description: 'Visual percentage representation',
        icon: '🥧'
    },
    barChart: {
        id: 'barChart',
        name: 'Bar Chart',
        description: 'Side-by-side comparison',
        icon: '📈'
    }
};

// Color schemes for different data types (using brand and colorblind-safe colors)
const COLOR_SCHEMES = {
    default: {
        yes: BRAND_COLORS.primary,     // Brand orange #f7741e
        no: BRAND_COLORS.lightGray,    // Light gray #d7d7d7
        partial: COLORBLIND_SAFE.category4, // Gold #FFB000
        high: COLORBLIND_SAFE.category1,    // Blue #648FFF
        medium: COLORBLIND_SAFE.category3,  // Orange #FE6100
        low: COLORBLIND_SAFE.category2      // Magenta #DC267F
    },
    treatment: {
        received: BRAND_COLORS.primary,    // Brand orange #f7741e
        notReceived: BRAND_COLORS.lightGray, // Light gray #d7d7d7
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
            { id: 'received', label: 'Received Treatment', color: COLOR_SCHEMES.treatment.received, description: 'Patients who received this treatment' },
            { id: 'notReceived', label: 'Did Not Receive', color: COLOR_SCHEMES.treatment.notReceived, description: 'Patients who did not receive this treatment' }
        ],
        complex: [
            { id: 'received', label: 'Completed Treatment', color: COLOR_SCHEMES.treatment.completed, description: 'Completed full treatment' },
            { id: 'partial', label: 'Partial Treatment', color: COLOR_SCHEMES.treatment.partial, description: 'Received some but not all planned treatment' },
            { id: 'planned', label: 'Planned', color: COLOR_SCHEMES.treatment.planned, description: 'Treatment planned but not yet started' },
            { id: 'notReceived', label: 'Not Received', color: COLOR_SCHEMES.treatment.notReceived, description: 'Did not receive treatment' }
        ]
    },
    functioning: {
        simple: [
            { id: 'declined', label: 'Declined', color: COLOR_SCHEMES.functioning.declined, description: 'Functioning has declined' },
            { id: 'stable', label: 'Stable', color: COLOR_SCHEMES.functioning.stable, description: 'Functioning remains stable' }
        ],
        complex: [
            { id: 'significantly_declined', label: 'Significantly Declined', color: COLOR_SCHEMES.functioning.significantly_declined, description: 'Major decline in functioning' },
            { id: 'declined', label: 'Declined', color: COLOR_SCHEMES.functioning.declined, description: 'Moderate decline in functioning' },
            { id: 'stable', label: 'Stable', color: COLOR_SCHEMES.functioning.stable, description: 'No significant change' },
            { id: 'improved', label: 'Improved', color: COLOR_SCHEMES.functioning.improved, description: 'Functioning has improved' }
        ]
    },
    symptoms: {
        simple: [
            { id: 'present', label: 'Present', color: COLOR_SCHEMES.symptoms.moderate, description: 'Symptom is present' },
            { id: 'absent', label: 'Absent', color: COLOR_SCHEMES.symptoms.none, description: 'Symptom is not present' }
        ],
        complex: [
            { id: 'severe', label: 'Severe', color: COLOR_SCHEMES.symptoms.severe, description: 'Severe symptoms' },
            { id: 'moderate', label: 'Moderate', color: COLOR_SCHEMES.symptoms.moderate, description: 'Moderate symptoms' },
            { id: 'mild', label: 'Mild', color: COLOR_SCHEMES.symptoms.mild, description: 'Mild symptoms' },
            { id: 'none', label: 'None', color: COLOR_SCHEMES.symptoms.none, description: 'No symptoms' }
        ]
    }
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
        // Load legend based on page type and color scheme
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
        
        // Apply colors from scheme to legend
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
            this.showError('Failed to load visualisation data. Please try again later.');
        }
    }
    
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        return lines.map(line => {
            // Handle CSV with images (like the flashcard files)
            const match = line.match(/^([^\n]+)\n?([\s\S]*)/);
            if (match) {
                return { variable: match[1].trim(), icons: match[2] };
            }
            return { variable: line.trim() };
        });
    }
    
    parseDataCategories() {
        // Parse the icon data to get counts for each category
        this.categoryCounts = {};
        
        if (!this.data || this.data.length === 0) {
            // Initialize with default categories
            this.legendData.forEach(item => {
                this.categoryCounts[item.id] = 0;
            });
            this.totalCount = 0;
            return;
        }
        
        const firstRow = this.data[0];
        if (!firstRow || !firstRow.icons) {
            // No icon data, use defaults
            this.legendData.forEach(item => {
                this.categoryCounts[item.id] = 0;
            });
            this.totalCount = 0;
            return;
        }
        
        // Count icons by color/type
        const iconString = firstRow.icons;
        
        // Map icon types to legend categories
        const iconMappings = {
            'person-orange': 'yes',
            'person-grey': 'no',
            'person-yellow': 'partial',
            'person-gold': 'partial',
            'person-blue': 'improved',
            'person-magenta': 'declined',
            'person-purple': 'significantly_declined'
        };
        
        // Initialize counts
        this.legendData.forEach(item => {
            this.categoryCounts[item.id] = 0;
        });
        
        // Count each icon type
        Object.entries(iconMappings).forEach(([iconType, category]) => {
            const count = (iconString.match(new RegExp(iconType, 'g')) || []).length;
            if (this.categoryCounts[category] !== undefined) {
                this.categoryCounts[category] += count;
            }
        });
        
        // Calculate total
        this.totalCount = Object.values(this.categoryCounts).reduce((sum, count) => sum + count, 0);
    }
    
    createVisualisationContainer() {
        this.container.innerHTML = '';
        
        // Create view selector
        const viewSelector = document.createElement('div');
        viewSelector.className = 'visualisation-selector';
        
        // Create single button to open modal
        const selectorBtn = document.createElement('button');
        selectorBtn.className = 'vis-btn view-selection-btn';
        selectorBtn.innerHTML = 'View Selection <span class="view-type-indicator">(' + this.getCurrentViewName() + ')</span>';
        selectorBtn.title = 'Click to select visualisation type';
        selectorBtn.addEventListener('click', () => this.openViewSelectorModal());
        viewSelector.appendChild(selectorBtn);
        
        this.container.appendChild(viewSelector);
        
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
    
    openViewSelectorModal() {
        // Create modal dynamically
        if (document.getElementById('view-selector-modal')) {
            this.updateViewSelectorModal();
            document.getElementById('view-selector-modal').style.display = 'flex';
            document.getElementById('view-selector-overlay').style.display = 'flex';
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.id = 'view-selector-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10000;';
        
        const modal = document.createElement('div');
        modal.id = 'view-selector-modal';
        modal.style.cssText = 'background: white; border-radius: 15px; padding: 25px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);';
        
        const title = document.createElement('h3');
        title.textContent = 'Select Visualisation';
        title.style.cssText = 'margin: 0 0 20px 0; font-size: 26px; color: black; font-weight: 600; font-family: Poppins, sans-serif;';
        modal.appendChild(title);
        
        const description = document.createElement('p');
        description.textContent = 'Choose how you want to view the data. Each visualisation provides a different perspective.';
        description.style.cssText = 'font-size: 14px; color: #a2a2a2; margin: 0 0 25px 0; line-height: 1.6;';
        modal.appendChild(description);
        
        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px;';
        
        // Get available views
        const availableViews = this.pageType?.visualisationTypes || 
                            ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'];
        
        availableViews.forEach(viewId => {
            const visType = VISUALISATION_TYPES[viewId];
            if (visType) {
                const card = document.createElement('div');
                card.style.cssText = 'background: white; border: 2px solid #d7d7d7; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.3s ease; text-align: left;';
                if (this.currentView === viewId) {
                    card.style.borderColor = '#f7741e';
                    card.style.background = 'rgba(247, 116, 30, 0.05)';
                }
                
                const name = document.createElement('div');
                name.textContent = visType.name;
                name.style.cssText = 'font-size: 16px; font-weight: 600; color: black; margin: 0 0 5px 0;';
                card.appendChild(name);
                
                const desc = document.createElement('div');
                desc.textContent = visType.description;
                desc.style.cssText = 'font-size: 14px; color: #a2a2a2; margin: 0; line-height: 1.4;';
                card.appendChild(desc);
                
                card.addEventListener('click', () => {
                    // Remove selection from all cards
                    grid.querySelectorAll('div').forEach(d => {
                        d.style.borderColor = '#d7d7d7';
                        d.style.background = 'white';
                    });
                    // Select this card
                    card.style.borderColor = '#f7741e';
                    card.style.background = 'rgba(247, 116, 30, 0.05)';
                    this.currentView = viewId;
                });
                
                grid.appendChild(card);
            }
        });
        modal.appendChild(grid);
        
        const footer = document.createElement('div');
        footer.style.cssText = 'display: flex; justify-content: flex-end; gap: 10px; border-top: 2px solid #d7d7d7; padding-top: 20px;';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = 'padding: 12px 24px; border-radius: 8px; font-family: Poppins, sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; background: #d7d7d7; color: black; border: none;';
        cancelBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
        });
        footer.appendChild(cancelBtn);
        
        const applyBtn = document.createElement('button');
        applyBtn.textContent = 'Apply';
        applyBtn.style.cssText = 'padding: 12px 24px; border-radius: 8px; font-family: Poppins, sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; background: #f7741e; color: white; border: none;';
        applyBtn.addEventListener('click', () => {
            this.switchView(this.currentView);
            overlay.style.display = 'none';
        });
        footer.appendChild(applyBtn);
        modal.appendChild(footer);
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        });
    }
    
    updateViewSelectorModal() {
        const modal = document.getElementById('view-selector-modal');
        if (!modal) return;
        
        const grid = modal.querySelector('div[style*="grid-template-columns"]');
        if (!grid) return;
        
        const availableViews = this.pageType?.visualisationTypes || 
                            ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'];
        
        grid.innerHTML = '';
        
        availableViews.forEach(viewId => {
            const visType = VISUALISATION_TYPES[viewId];
            if (visType) {
                const card = document.createElement('div');
                card.style.cssText = 'background: white; border: 2px solid #d7d7d7; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.3s ease; text-align: left;';
                if (this.currentView === viewId) {
                    card.style.borderColor = '#f7741e';
                    card.style.background = 'rgba(247, 116, 30, 0.05)';
                }
                
                const name = document.createElement('div');
                name.textContent = visType.name;
                name.style.cssText = 'font-size: 16px; font-weight: 600; color: black; margin: 0 0 5px 0;';
                card.appendChild(name);
                
                const desc = document.createElement('div');
                desc.textContent = visType.description;
                desc.style.cssText = 'font-size: 14px; color: #a2a2a2; margin: 0; line-height: 1.4;';
                card.appendChild(desc);
                
                card.addEventListener('click', () => {
                    grid.querySelectorAll('div').forEach(d => {
                        d.style.borderColor = '#d7d7d7';
                        d.style.background = 'white';
                    });
                    card.style.borderColor = '#f7741e';
                    card.style.background = 'rgba(247, 116, 30, 0.05)';
                    this.currentView = viewId;
                });
                
                grid.appendChild(card);
            }
        });
    }
    
    switchView(viewType) {
        this.currentView = viewType;
        
        // Update legend based on view type
        this.updateLegendForView(viewType);
        
        // Update the view selection button text
        const selectorBtn = this.container.querySelector('.view-selection-btn');
        if (selectorBtn) {
            selectorBtn.innerHTML = 'View Selection <span class="view-type-indicator">(' + this.getCurrentViewName() + ')</span>';
        }
        
        // Update modal if open
        this.updateViewSelectorModal();
        
        this.render();
    }
    
    updateLegendForView(viewType) {
        // For complex views, use complex legend if available
        if (viewType === 'iconArrayComplex') {
            const pageId = this.pageType?.id;
            const legendConfig = LEGEND_CONFIGS[pageId];
            if (legendConfig && legendConfig.complex) {
                this.legendData = legendConfig.complex;
                // Apply colors from scheme
                this.legendData.forEach(item => {
                    if (this.colorScheme[item.id]) {
                        item.color = this.colorScheme[item.id];
                    }
                });
            }
        } else {
            // Use simple legend
            this.loadLegendConfig();
        }
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
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available for icon array visualisation.</p>';
            return;
        }
        
        const html = this.generateIconArrayHTML('simple');
        this.visArea.innerHTML = html;
    }
    
    renderIconArrayComplex() {
        // Check if we have enough categories for complex view
        const hasEnoughCategories = Object.keys(this.categoryCounts).length >= 3;
        
        if (this.totalCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available for complex icon array.</p>';
            return;
        }
        
        if (!hasEnoughCategories) {
            this.visArea.innerHTML = `
                <p style="text-align: center; padding: 20px; color: #666;">
                    Complex view requires data with at least 3 categories. 
                    Currently showing ${Object.keys(this.categoryCounts).length} category/categories.
                </p>
            `;
            return;
        }
        
        const html = this.generateIconArrayHTML('complex');
        this.visArea.innerHTML = html;
    }
    
    generateIconArrayHTML(type) {
        const isComplex = type === 'complex';
        
        // Build icon rows for each category
        let iconRows = '';
        let legendItems = '';
        
        this.legendData.forEach(category => {
            const count = this.categoryCounts[category.id] || 0;
            const percentage = this.totalCount > 0 ? Math.round((count / this.totalCount) * 100) : 0;
            
            // Generate icons for this category
            const icons = this.generateIconHTML(count, category.color);
            
            iconRows += `
                <div class="icon-category-row">
                    <div class="icon-category-header">
                        <div class="icon-color-indicator" style="background: ${category.color};"></div>
                        <span class="icon-category-label">${category.label}</span>
                        <span class="icon-category-count">${count} (${percentage}%)</span>
                    </div>
                    <div class="icon-category-icons">
                        ${icons}
                    </div>
                </div>
            `;
            
            // Build legend item
            legendItems += `
                <div class="legend-item">
                    <div class="legend-color-box" style="background: ${category.color};"></div>
                    <div class="legend-label">
                        <strong>${category.label}</strong>
                        <span>${category.description || ''}</span>
                    </div>
                </div>
            `;
        });
        
        const title = this.dataConfig.title || (isComplex ? 'Detailed Distribution' : 'Distribution');
        const subtitle = this.dataConfig.description || this.pageType?.description || 'Patient data from SURVAYA study';
        
        return `
            <div class="visualisation-wrapper">
                <div class="icon-array-visualisation">
                    <h3 class="vis-title">${title}</h3>
                    <p class="vis-subtitle">${subtitle}</p>
                    <p class="vis-total">Total: ${this.totalCount} people</p>
                    
                    <div class="icon-array-container">
                        ${iconRows}
                    </div>
                </div>
                
                <div class="legend-container">
                    <h4>Legend</h4>
                    <div class="legend-items">
                        ${legendItems}
                    </div>
                </div>
            </div>
            
            ${this.dataConfig.lastUpdated ? `<p class="vis-date">Last updated: ${this.dataConfig.lastUpdated}</p>` : ''}
        `;
    }
    
    generateIconHTML(count, color) {
        if (count === 0) return '<span class="no-icons">—</span>';
        
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <svg width="20" height="30" viewBox="0 0 20 30" class="person-icon" aria-label="Person">
                    <rect width="20" height="30" fill="${color}" rx="3"/>
                </svg>
            `;
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
                <td>Total population</td>
            </tr>
        `;
        
        const html = `
            <div class="visualisation-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Count</th>
                            <th>Percentage</th>
                            <th>Description</th>
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
                
                <div class="vis-info">
                    <p><strong>Note:</strong> ${this.dataConfig.description || 'Patient-reported outcomes from the SURVAYA study'}.</p>
                    <p>Last updated: ${this.dataConfig.lastUpdated || 'August 2024'}</p>
                </div>
            </div>
        `;
        
        this.visArea.innerHTML = html;
    }
    
    renderPieChart() {
        if (this.totalCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available for pie chart.</p>';
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
            displayModeBar: true
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
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">Error rendering chart. Please ensure Plotly.js is loaded.</p>';
        }
    }
    
    renderBarChart() {
        if (this.totalCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available for bar chart.</p>';
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
                text: `${this.dataConfig.title || 'Count by Category'} (Total: ${this.totalCount})`,
                x: 0.5,
                xanchor: 'center',
                font: {
                    size: 18,
                    family: 'Poppins, sans-serif'
                }
            },
            xaxis: { 
                title: 'Category',
                tickfont: { family: 'Poppins, sans-serif' }
            },
            yaxis: { 
                title: 'Count',
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
            displayModeBar: true
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
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">Error rendering chart. Please ensure Plotly.js is loaded.</p>';
        }
    }
    
    showError(message) {
        this.visArea.innerHTML = `<p style="text-align: center; padding: 20px; color: ${BRAND_COLORS.secondary};">${message}</p>`;
    }
    
    applyFilters(filters) {
        this.filters = filters;
        console.log('Filters applied:', filters);
        this.render();
    }
}

// Data configurations for different visualisations
const VISUALISATION_CONFIGS = {
    // Treatment modules
    chemotherapy: {
        dataUrl: 'https://raw.githubusercontent.com/STRONGAYA/strong-aya-info-portal/main/data/flashcards/ther_chemo_flashcard.csv',
        title: 'Chemotherapy Treatment',
        description: 'Percentage of AYA cancer patients who received chemotherapy',
        lastUpdated: 'August 2024',
        variable: 'ther_chemo',
        pageType: 'treatment',
        colorScheme: 'treatment',
        defaultView: 'iconArraySimple'
    },
    radiotherapy: {
        dataUrl: 'https://raw.githubusercontent.com/STRONGAYA/strong-aya-info-portal/main/data/flashcards/ther_rt_flashcard.csv',
        title: 'Radiotherapy Treatment',
        description: 'Percentage of AYA cancer patients who received radiotherapy',
        lastUpdated: 'August 2024',
        variable: 'ther_rt',
        pageType: 'treatment',
        colorScheme: 'treatment',
        defaultView: 'iconArraySimple'
    },
    hormonetherapy: {
        dataUrl: 'https://raw.githubusercontent.com/STRONGAYA/strong-aya-info-portal/main/data/flashcards/ther_ht_flashcard.csv',
        title: 'Hormone Therapy',
        description: 'Percentage of AYA cancer patients who received hormone therapy',
        lastUpdated: 'August 2024',
        variable: 'ther_ht',
        pageType: 'treatment',
        colorScheme: 'treatment',
        defaultView: 'iconArraySimple'
    },
    
    // Functioning modules
    emotional_functioning: {
        dataUrl: 'https://raw.githubusercontent.com/STRONGAYA/strong-aya-info-portal/main/data/flashcards/ef_flashcard.csv',
        title: 'Emotional Functioning',
        description: 'Percentage of AYA cancer patients with declined emotional functioning',
        lastUpdated: 'August 2024',
        variable: 'ef',
        pageType: 'functioning',
        colorScheme: 'functioning',
        defaultView: 'iconArraySimple'
    },
    physical_functioning: {
        dataUrl: 'https://raw.githubusercontent.com/STRONGAYA/strong-aya-info-portal/main/data/flashcards/pf_flashcard.csv',
        title: 'Physical Functioning',
        description: 'Percentage of AYA cancer patients with declined physical functioning',
        lastUpdated: 'August 2024',
        variable: 'pf',
        pageType: 'functioning',
        colorScheme: 'functioning',
        defaultView: 'iconArraySimple'
    },
    role_functioning: {
        dataUrl: 'https://raw.githubusercontent.com/STRONGAYA/strong-aya-info-portal/main/data/flashcards/rf_flashcard.csv',
        title: 'Role Functioning',
        description: 'Percentage of AYA cancer patients with declined role functioning',
        lastUpdated: 'August 2024',
        variable: 'rf',
        pageType: 'functioning',
        colorScheme: 'functioning',
        defaultView: 'iconArraySimple'
    }
};

// Initialize visualisations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a module page
    const path = window.location.pathname;
    const moduleMatch = path.match(/(chemotherapy|radiotherapy|hormonetherapy|emotional_functioning|physical_functioning|role_functioning)/);
    
    if (moduleMatch) {
        const moduleType = moduleMatch[1];
        const config = VISUALISATION_CONFIGS[moduleType];
        
        if (config) {
            // Replace DataWrapper div with our visualisation
            const datawrapperDiv = document.querySelector('div[id^="datawrapper-vis"]');
            if (datawrapperDiv) {
                datawrapperDiv.innerHTML = '';
                datawrapperDiv.id = 'visualisation-container';
                datawrapperDiv.className = 'visualisation-container';
                
                // Initialize visualisation
                new StrongAyaVisualisation('visualisation-container', config);
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
