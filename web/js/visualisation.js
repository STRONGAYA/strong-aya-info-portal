/**
 * STRONG-AYA Info Portal Visualisation Module
 * Handles icon array, table, and pie chart visualisations using Plotly.js
 * Loads data from GitHub CSV files
 * Supports multiple page types and visualisation variants
 */

// Page type configurations
const PAGE_TYPES = {
    treatment: {
        id: 'treatment',
        name: 'Treatment Information',
        description: 'Information about cancer treatments received by AYA patients',
        modules: ['chemotherapy', 'radiotherapy', 'hormonetherapy'],
        visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart']
    },
    functioning: {
        id: 'functioning',
        name: 'Quality of Life & Functioning',
        description: 'Functioning scores and quality of life metrics',
        modules: ['emotional_functioning', 'physical_functioning', 'role_functioning'],
        visualisationTypes: ['iconArraySimple', 'table', 'pieChart', 'barChart']
    },
    // Add new page types here
    // Example:
    // mental_health: {
    //     id: 'mental_health',
    //     name: 'Mental Health',
    //     description: 'Mental health and wellbeing metrics',
    //     modules: ['anxiety', 'depression', 'stress'],
    //     visualisationTypes: ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart']
    // }
};

// Visualisation type configurations
const VISUALISATION_TYPES = {
    iconArraySimple: {
        id: 'iconArraySimple',
        name: 'Simple Icon Array',
        description: 'Two categories: Yes/No',
        icon: '👥',
        requires: ['yes', 'no'] // Needs at least these categories
    },
    iconArrayComplex: {
        id: 'iconArrayComplex',
        name: 'Complex Icon Array',
        description: 'Multiple granular categories',
        icon: '👥',
        requires: ['yes', 'no', 'partial'] // Needs more granular data
    },
    table: {
        id: 'table',
        name: 'Data Table',
        description: 'Verbose table with all numbers',
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

// Color schemes for different data types
const COLOR_SCHEMES = {
    default: {
        yes: '#f7741e',      // Orange
        no: '#d7d7d7',       // Grey
        partial: '#ffcc00',  // Yellow
        high: '#e74c3c',     // Red
        medium: '#f39c12',   // Orange
        low: '#2ecc71'      // Green
    },
    treatment: {
        received: '#f7741e',
        notReceived: '#d7d7d7'
    },
    functioning: {
        declined: '#e74c3c',
        stable: '#2ecc71',
        improved: '#3498db'
    },
    qualityOfLife: {
        excellent: '#2ecc71',
        good: '#3498db',
        fair: '#f39c12',
        poor: '#e74c3c'
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
        this.legendData = {};
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error(`Container ${this.containerId} not found`);
            return;
        }
        
        // Load data if config has dataUrl
        if (this.dataConfig.dataUrl) {
            this.loadData();
        }
        
        this.createVisualisationContainer();
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
            
            // Parse legend data if available
            this.parseLegendData();
            
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
    
    parseLegendData() {
        // Parse legend information from data
        if (!this.data || this.data.length === 0) {
            // Use default legend
            this.legendData = {
                yes: { color: COLOR_SCHEMES.default.yes, label: 'Yes' },
                no: { color: COLOR_SCHEMES.default.no, label: 'No' }
            };
            return;
        }
        
        // Try to extract legend from CSV or use defaults
        const firstRow = this.data[0];
        if (firstRow && firstRow.icons) {
            // Count different icon types
            const orangeIcons = (firstRow.icons.match(/person-orange/g) || []).length;
            const greyIcons = (firstRow.icons.match(/person-grey/g) || []).length;
            
            this.legendData = {
                yes: { color: COLOR_SCHEMES.default.yes, label: 'Yes', count: orangeIcons },
                no: { color: COLOR_SCHEMES.default.no, label: 'No', count: greyIcons }
            };
        } else {
            // Use default legend
            this.legendData = {
                yes: { color: COLOR_SCHEMES.default.yes, label: 'Yes' },
                no: { color: COLOR_SCHEMES.default.no, label: 'No' }
            };
        }
        
        // Apply color scheme if specified in config
        if (this.dataConfig.colorScheme) {
            const scheme = COLOR_SCHEMES[this.dataConfig.colorScheme] || COLOR_SCHEMES.default;
            Object.keys(this.legendData).forEach(key => {
                if (scheme[key]) {
                    this.legendData[key].color = scheme[key];
                }
            });
        }
    }
    
    createVisualisationContainer() {
        this.container.innerHTML = '';
        
        // Create view selector
        const viewSelector = document.createElement('div');
        viewSelector.className = 'visualisation-selector';
        
        // Get available visualisation types for this page type
        const pageType = this.getPageType();
        const availableViews = pageType?.visualisationTypes || 
                            ['iconArraySimple', 'iconArrayComplex', 'table', 'pieChart', 'barChart'];
        
        availableViews.forEach(view => {
            const visType = VISUALISATION_TYPES[view];
            if (visType) {
                const btn = document.createElement('button');
                btn.className = `vis-btn ${this.currentView === view ? 'active' : ''}`;
                btn.textContent = visType.name;
                btn.dataset.view = view;
                btn.title = visType.description;
                btn.addEventListener('click', () => this.switchView(view));
                viewSelector.appendChild(btn);
            }
        });
        
        this.container.appendChild(viewSelector);
        
        // Create visualisation area
        const visArea = document.createElement('div');
        visArea.id = `${this.containerId}-vis-area`;
        visArea.className = 'visualisation-content';
        this.container.appendChild(visArea);
        
        this.visArea = visArea;
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
        
        return null;
    }
    
    switchView(viewType) {
        this.currentView = viewType;
        const buttons = this.container.querySelectorAll('.vis-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewType);
        });
        
        this.render();
    }
    
    render() {
        if (!this.data && this.dataConfig.dataUrl && !this.visArea) return;
        
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
        // Parse icon data from CSV
        const iconData = this.parseIconData();
        
        if (iconData.total === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available for icon array visualisation.</p>';
            return;
        }
        
        const percentage = Math.round((iconData.orangeCount / iconData.total) * 100);
        
        const html = `
            <div class="visualisation-wrapper">
                <div class="icon-array-visualisation">
                    <h3>${this.dataConfig.title || 'Treatment Distribution'}</h3>
                    <p class="visualisation-subtitle">
                        ${iconData.orangeCount} out of ${iconData.total} people (${percentage}%)
                    </p>
                    
                    <div class="icon-array-container" style="
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 5px;
                        margin: 20px 0;
                    ">
                        ${this.generateIconHTML(iconData.orangeCount, 'orange')}
                        ${this.generateIconHTML(iconData.greyCount, 'grey')}
                    </div>
                </div>
                
                <div class="legend-container">
                    <h4>Legend</h4>
                    <div class="legend-items">
                        <div class="legend-item" style="display: flex; align-items: center; gap: 10px; margin: 10px 0;">
                            <div style="width: 30px; height: 30px; background: ${this.legendData.yes?.color || '#f7741e'}; border-radius: 3px; border: 1px solid #333;"></div>
                            <span><strong>${this.legendData.yes?.label || 'Yes'}:</strong> ${iconData.orangeCount} (${percentage}%)</span>
                        </div>
                        <div class="legend-item" style="display: flex; align-items: center; gap: 10px; margin: 10px 0;">
                            <div style="width: 30px; height: 30px; background: ${this.legendData.no?.color || '#d7d7d7'}; border-radius: 3px; border: 1px solid #333;"></div>
                            <span><strong>${this.legendData.no?.label || 'No'}:</strong> ${iconData.greyCount} (${100 - percentage}%)</span>
                        </div>
                    </div>
                </div>
            </div>
            
            ${this.dataConfig.description ? `<p class="visualisation-description">${this.dataConfig.description}</p>` : ''}
        `;
        
        this.visArea.innerHTML = html;
    }
    
    renderIconArrayComplex() {
        // For complex icon array, we need more granular data
        // This would be used when data has multiple categories
        const iconData = this.parseIconData();
        
        if (iconData.total === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available for complex icon array. Consider using simple icon array.</p>';
            return;
        }
        
        // For now, if we only have yes/no data, show it with a note
        const percentage = Math.round((iconData.orangeCount / iconData.total) * 100);
        
        const html = `
            <div class="visualisation-wrapper">
                <div class="icon-array-visualisation">
                    <h3>${this.dataConfig.title || 'Detailed Distribution'}</h3>
                    <p class="visualisation-subtitle">
                        Complex view with granular categories
                    </p>
                    
                    <div class="icon-array-container" style="
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 5px;
                        margin: 20px 0;
                    ">
                        ${this.generateIconHTML(iconData.orangeCount, 'orange')}
                        ${this.generateIconHTML(iconData.greyCount, 'grey')}
                    </div>
                    
                    <p style="text-align: center; color: #666; margin-top: 20px;">
                        <em>Note: Complex view requires multi-category data. Currently showing simple yes/no distribution.</em>
                    </p>
                </div>
                
                <div class="legend-container">
                    <h4>Legend</h4>
                    <div class="legend-items">
                        <div class="legend-item" style="display: flex; align-items: center; gap: 10px; margin: 10px 0;">
                            <div style="width: 30px; height: 30px; background: ${this.legendData.yes?.color || '#f7741e'}; border-radius: 3px; border: 1px solid #333;"></div>
                            <span><strong>${this.legendData.yes?.label || 'Yes'}:</strong> Received treatment / Positive response</span>
                        </div>
                        <div class="legend-item" style="display: flex; align-items: center; gap: 10px; margin: 10px 0;">
                            <div style="width: 30px; height: 30px; background: ${this.legendData.no?.color || '#d7d7d7'}; border-radius: 3px; border: 1px solid #333;"></div>
                            <span><strong>${this.legendData.no?.label || 'No'}:</strong> Did not receive treatment / Negative response</span>
                        </div>
                        <div class="legend-item" style="display: flex; align-items: center; gap: 10px; margin: 10px 0; opacity: 0.5;">
                            <div style="width: 30px; height: 30px; background: ${COLOR_SCHEMES.default.partial}; border-radius: 3px; border: 1px solid #333;"></div>
                            <span><strong>Partial:</strong> Would appear if data available</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.visArea.innerHTML = html;
    }
    
    parseIconData() {
        if (!this.data || this.data.length === 0) return { orangeCount: 0, greyCount: 0, total: 0 };
        
        // The CSV contains person icons as images
        // Count orange and grey person icons
        const firstRow = this.data[0];
        if (!firstRow || !firstRow.icons) return { orangeCount: 0, greyCount: 0, total: 0 };
        
        const orangeIcons = (firstRow.icons.match(/person-orange/g) || []).length;
        const greyIcons = (firstRow.icons.match(/person-grey/g) || []).length;
        const total = orangeIcons + greyIcons;
        
        return { orangeCount: orangeIcons, greyCount: greyIcons, total };
    }
    
    generateIconHTML(count, colour) {
        const colourMap = {
            orange: '#f7741e',
            grey: '#d7d7d7',
            yellow: '#ffcc00',
            green: '#2ecc71',
            red: '#e74c3c',
            blue: '#3498db'
        };
        
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <svg width="20" height="30" viewBox="0 0 20 30" style="flex-shrink: 0;" aria-label="Person icon">
                    <rect width="20" height="30" fill="${colourMap[colour] || colour}" rx="3"/>
                </svg>
            `;
        }
        return html;
    }
    
    renderTable() {
        if (!this.data || this.data.length === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available.</p>';
            return;
        }
        
        const iconData = this.parseIconData();
        const total = iconData.total;
        const percentage = Math.round((iconData.orangeCount / total) * 100);
        
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
                        <tr>
                            <td><strong>Yes</strong></td>
                            <td>${iconData.orangeCount}</td>
                            <td>${percentage}%</td>
                            <td>Received treatment or experienced condition</td>
                        </tr>
                        <tr>
                            <td><strong>No</strong></td>
                            <td>${iconData.greyCount}</td>
                            <td>${100 - percentage}%</td>
                            <td>Did not receive treatment or experience condition</td>
                        </tr>
                        <tr>
                            <td><strong>Total</strong></td>
                            <td>${total}</td>
                            <td>100%</td>
                            <td>Total population (per 100)</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="legend-container" style="margin-top: 20px;">
                    <h4>Legend</h4>
                    <div class="legend-items">
                        <div class="legend-item" style="display: flex; align-items: center; gap: 10px; margin: 10px 0;">
                            <div style="width: 20px; height: 20px; background: ${this.legendData.yes?.color || '#f7741e'}; border-radius: 3px;"></div>
                            <span><strong>Yes</strong></span>
                        </div>
                        <div class="legend-item" style="display: flex; align-items: center; gap: 10px; margin: 10px 0;">
                            <div style="width: 20px; height: 20px; background: ${this.legendData.no?.color || '#d7d7d7'}; border-radius: 3px;"></div>
                            <span><strong>No</strong></span>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                    <p><strong>Note:</strong> ${this.dataConfig.description || 'Patient-reported outcomes from the SURVAYA study'}.</p>
                    <p>Last updated: ${this.dataConfig.lastUpdated || 'August 2024'}</p>
                </div>
            </div>
        `;
        
        this.visArea.innerHTML = html;
    }
    
    renderPieChart() {
        if (!this.data || this.data.length === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available for pie chart.</p>';
            return;
        }
        
        const iconData = this.parseIconData();
        const total = iconData.total;
        
        if (total === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data to display.</p>';
            return;
        }
        
        const data = [{
            values: [iconData.orangeCount, iconData.greyCount],
            labels: [this.legendData.yes?.label || 'Yes', this.legendData.no?.label || 'No'],
            type: 'pie',
            marker: {
                colors: [this.legendData.yes?.color || '#f7741e', this.legendData.no?.color || '#d7d7d7']
            },
            textinfo: 'label+percent+value',
            textposition: 'inside',
            hoverinfo: 'label+percent+value'
        }];
        
        const layout = {
            title: `${this.dataConfig.title || 'Distribution'} (n=${total})`,
            showlegend: true,
            legend: {
                orientation: 'h',
                y: -0.1
            },
            height: 400,
            margin: { t: 50, b: 80, l: 20, r: 20 }
        };
        
        const config = {
            responsive: true,
            displayModeBar: true
        };
        
        this.renderPlotly(data, layout, config);
    }
    
    renderBarChart() {
        if (!this.data || this.data.length === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available for bar chart.</p>';
            return;
        }
        
        const iconData = this.parseIconData();
        const total = iconData.total;
        
        if (total === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data to display.</p>';
            return;
        }
        
        const data = [{
            x: [this.legendData.yes?.label || 'Yes', this.legendData.no?.label || 'No'],
            y: [iconData.orangeCount, iconData.greyCount],
            type: 'bar',
            marker: {
                color: [this.legendData.yes?.color || '#f7741e', this.legendData.no?.color || '#d7d7d7']
            },
            text: [iconData.orangeCount, iconData.greyCount],
            textposition: 'auto',
            hoverinfo: 'x+y'
        }];
        
        const layout = {
            title: `${this.dataConfig.title || 'Count by Category'} (Total: ${total})`,
            xaxis: { title: 'Category' },
            yaxis: { title: 'Count' },
            height: 400,
            margin: { t: 50, b: 50, l: 50, r: 20 }
        };
        
        const config = {
            responsive: true,
            displayModeBar: true
        };
        
        this.renderPlotly(data, layout, config);
    }
    
    renderPlotly(data, layout, config) {
        if (typeof Plotly === 'undefined') {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px; color: orange;">Plotly.js not loaded. Loading from CDN...</p>';
            this.loadPlotlyThenRender(data, layout, config);
            return;
        }
        
        try {
            Plotly.newPlot(this.visArea, data, layout, config);
        } catch (error) {
            console.error('Error rendering Plotly chart:', error);
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">Error rendering chart. Please ensure Plotly.js is loaded.</p>';
        }
    }
    
    loadPlotlyThenRender(data, layout, config) {
        const script = document.createElement('script');
        script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
        script.onload = () => {
            try {
                Plotly.newPlot(this.visArea, data, layout, config);
            } catch (error) {
                console.error('Error rendering Plotly chart after loading:', error);
                this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">Failed to render chart.</p>';
            }
        };
        script.onerror = () => {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px; color: red;">Failed to load Plotly.js. Please check your internet connection.</p>';
        };
        document.head.appendChild(script);
    }
    
    showError(message) {
        this.visArea.innerHTML = `<p style="text-align: center; padding: 20px; color: red;">${message}</p>`;
    }
    
    applyFilters(filters) {
        this.filters = filters;
        console.log('Filters applied:', filters);
        this.render();
    }
}

// Data configurations for different visualisations
const VISUALISATION_CONFIGS = {
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
        COLOR_SCHEMES
    };
}
