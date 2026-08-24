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
        icon: '👥',
        requires: ['yes', 'no']
    },
    iconArrayComplex: {
        id: 'iconArrayComplex',
        name: 'Complex Icon Array',
        description: 'Multiple granular categories - Detailed breakdown',
        icon: '👥',
        requires: ['yes', 'no', 'partial']
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
    },
    groupedBarChart: {
        id: 'groupedBarChart',
        name: 'Grouped Bar Chart',
        description: 'Comparison across multiple groups',
        icon: '📊'
    },
    lineChart: {
        id: 'lineChart',
        name: 'Line Chart',
        description: 'Trends over time',
        icon: '📉'
    }
};

// Color schemes for different data types
const COLOR_SCHEMES = {
    default: {
        yes: '#f7741e',
        no: '#d7d7d7',
        partial: '#ffcc00',
        high: '#e74c3c',
        medium: '#f39c12',
        low: '#2ecc71',
        very_high: '#c0392b',
        very_low: '#27ae60'
    },
    treatment: {
        received: '#f7741e',
        notReceived: '#d7d7d7',
        partial: '#ffcc00',
        planned: '#3498db',
        completed: '#2ecc71',
        ongoing: '#f39c12'
    },
    functioning: {
        declined: '#e74c3c',
        stable: '#2ecc71',
        improved: '#3498db',
        significantly_declined: '#c0392b',
        significantly_improved: '#27ae60'
    },
    symptoms: {
        severe: '#c0392b',
        moderate: '#e74c3c',
        mild: '#f39c12',
        none: '#2ecc71',
        unknown: '#95a5a6'
    },
    qualityOfLife: {
        excellent: '#27ae60',
        good: '#2ecc71',
        fair: '#f1c40f',
        poor: '#e67e22',
        very_poor: '#d35400'
    }
};

// Legend configurations for different visualisation types
const LEGEND_CONFIGS = {
    treatment: {
        simple: [
            { id: 'received', label: 'Received Treatment', color: '#f7741e', description: 'Patients who received this treatment' },
            { id: 'notReceived', label: 'Did Not Receive', color: '#d7d7d7', description: 'Patients who did not receive this treatment' }
        ],
        complex: [
            { id: 'received', label: 'Received Treatment', color: '#f7741e', description: 'Completed treatment' },
            { id: 'partial', label: 'Partial Treatment', color: '#ffcc00', description: 'Received some but not all planned treatment' },
            { id: 'planned', label: 'Planned', color: '#3498db', description: 'Treatment planned but not yet started' },
            { id: 'notReceived', label: 'Not Received', color: '#d7d7d7', description: 'Did not receive treatment' }
        ]
    },
    functioning: {
        simple: [
            { id: 'declined', label: 'Declined', color: '#e74c3c', description: 'Functioning has declined' },
            { id: 'stable', label: 'Stable', color: '#2ecc71', description: 'Functioning remains stable' }
        ],
        complex: [
            { id: 'significantly_declined', label: 'Significantly Declined', color: '#c0392b', description: 'Major decline in functioning' },
            { id: 'declined', label: 'Declined', color: '#e74c3c', description: 'Moderate decline in functioning' },
            { id: 'stable', label: 'Stable', color: '#2ecc71', description: 'No significant change' },
            { id: 'improved', label: 'Improved', color: '#3498db', description: 'Functioning has improved' }
        ]
    },
    symptoms: {
        simple: [
            { id: 'present', label: 'Present', color: '#e74c3c', description: 'Symptom is present' },
            { id: 'absent', label: 'Absent', color: '#2ecc71', description: 'Symptom is not present' }
        ],
        complex: [
            { id: 'severe', label: 'Severe', color: '#c0392b', description: 'Severe symptoms' },
            { id: 'moderate', label: 'Moderate', color: '#e74c3c', description: 'Moderate symptoms' },
            { id: 'mild', label: 'Mild', color: '#f39c12', description: 'Mild symptoms' },
            { id: 'none', label: 'None', color: '#2ecc71', description: 'No symptoms' }
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
                // Use simple or complex based on current view
                this.legendData = legendConfig.simple || [];
                this.colorScheme = COLOR_SCHEMES[colorScheme];
            } else {
                // Fallback to default
                this.legendData = [
                    { id: 'yes', label: 'Yes', color: '#f7741e', description: 'Positive/Yes' },
                    { id: 'no', label: 'No', color: '#d7d7d7', description: 'Negative/No' }
                ];
                this.colorScheme = COLOR_SCHEMES.default;
            }
        } else {
            // Default legend
            this.legendData = [
                { id: 'yes', label: 'Yes', color: '#f7741e', description: 'Positive/Yes' },
                { id: 'no', label: 'No', color: '#d7d7d7', description: 'Negative/No' }
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
            return;
        }
        
        const firstRow = this.data[0];
        if (!firstRow || !firstRow.icons) {
            // No icon data, use defaults
            this.legendData.forEach(item => {
                this.categoryCounts[item.id] = 0;
            });
            return;
        }
        
        // Count icons by color/type
        const iconString = firstRow.icons;
        
        // Map icon types to legend categories
        const iconMappings = {
            'person-orange': 'yes',
            'person-grey': 'no',
            'person-yellow': 'partial',
            'person-green': 'stable',
            'person-red': 'declined'
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
        
        // Get available visualisation types for this page type
        const availableViews = this.pageType?.visualisationTypes || 
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
    
    switchView(viewType) {
        this.currentView = viewType;
        
        // Update legend based on view type
        this.updateLegendForView(viewType);
        
        const buttons = this.container.querySelectorAll('.vis-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewType);
        });
        
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
            case 'groupedBarChart':
                this.renderGroupedBarChart();
                break;
            case 'lineChart':
                this.renderLineChart();
                break;
            case 'iconArraySimple':
            default:
                this.renderIconArraySimple();
                break;
        }
    }
    
    renderIconArraySimple() {
        if (!this.categoryCounts || this.totalCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available for icon array visualisation.</p>';
            return;
        }
        
        const html = this.generateIconArrayHTML('simple');
        this.visArea.innerHTML = html;
    }
    
    renderIconArrayComplex() {
        // Check if we have enough categories for complex view
        const hasEnoughCategories = Object.keys(this.categoryCounts).length >= 3;
        
        if (!this.categoryCounts || this.totalCount === 0) {
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
                <div class="icon-category-row" style="display: flex; align-items: center; gap: 10px; margin: 10px 0;">
                    <div style="width: 30px; height: 30px; background: ${category.color}; border-radius: 3px; border: 1px solid #333; flex-shrink: 0;"></div>
                    <div style="flex: 1;">${icons}</div>
                    <span style="font-size: 14px; color: #666;">${count} (${percentage}%)</span>
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
        const subtitle = this.pageType ? this.pageType.description : 'Patient data from SURVAYA study';
        
        return `
            <div class="visualisation-wrapper">
                <div class="icon-array-visualisation">
                    <h3>${title}</h3>
                    <p class="visualisation-subtitle">${subtitle}</p>
                    <p class="visualisation-subtitle">Total: ${this.totalCount} people</p>
                    
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
            
            ${this.dataConfig.description ? `<p class="visualisation-description">${this.dataConfig.description}</p>` : ''}
            ${this.dataConfig.lastUpdated ? `<p class="visualisation-date">Last updated: ${this.dataConfig.lastUpdated}</p>` : ''}
        `;
    }
    
    generateIconHTML(count, color) {
        if (count === 0) return '<span style="color: #999;">—</span>';
        
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <svg width="20" height="30" viewBox="0 0 20 30" style="flex-shrink: 0;" aria-label="Person">
                    <rect width="20" height="30" fill="${color}" rx="3"/>
                </svg>
            `;
        }
        return html;
    }
    
    renderTable() {
        if (!this.categoryCounts || this.totalCount === 0) {
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
            <tr>
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
                
                <div class="visualisation-info">
                    <p><strong>Note:</strong> ${this.dataConfig.description || 'Patient-reported outcomes from the SURVAYA study'}.</p>
                    <p>Last updated: ${this.dataConfig.lastUpdated || 'August 2024'}</p>
                </div>
            </div>
        `;
        
        this.visArea.innerHTML = html;
    }
    
    renderPieChart() {
        if (!this.categoryCounts || this.totalCount === 0) {
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
            textinfo: 'label+percent+value',
            textposition: 'inside',
            hoverinfo: 'label+percent+value',
            hole: 0.3
        }];
        
        const layout = {
            title: {
                text: `${this.dataConfig.title || 'Distribution'} (n=${this.totalCount})`,
                x: 0.5,
                xanchor: 'center'
            },
            showlegend: false, // We'll use our custom legend
            height: 450,
            margin: { t: 60, b: 50, l: 20, r: 20 }
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
        if (!this.categoryCounts || this.totalCount === 0) {
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
            text: values,
            textposition: 'auto',
            hoverinfo: 'x+y'
        }];
        
        const layout = {
            title: {
                text: `${this.dataConfig.title || 'Count by Category'} (Total: ${this.totalCount})`,
                x: 0.5,
                xanchor: 'center'
            },
            xaxis: { title: 'Category' },
            yaxis: { title: 'Count' },
            showlegend: false,
            height: 450,
            margin: { t: 60, b: 50, l: 50, r: 20 }
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
    
    renderGroupedBarChart() {
        this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">Grouped bar chart requires multiple data series. Not yet implemented for this dataset.</p>';
    }
    
    renderLineChart() {
        this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">Line chart requires time-series data. Not applicable for current dataset.</p>';
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
    surgery: {
        dataUrl: null, // Placeholder - add your CSV URL
        title: 'Surgery',
        description: 'Percentage of AYA cancer patients who underwent surgery',
        lastUpdated: 'August 2024',
        variable: 'ther_surgery',
        pageType: 'treatment',
        colorScheme: 'treatment',
        defaultView: 'iconArraySimple'
    },
    immunotherapy: {
        dataUrl: null, // Placeholder - add your CSV URL
        title: 'Immunotherapy',
        description: 'Percentage of AYA cancer patients who received immunotherapy',
        lastUpdated: 'August 2024',
        variable: 'ther_immuno',
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
    },
    social_functioning: {
        dataUrl: null, // Placeholder - add your CSV URL
        title: 'Social Functioning',
        description: 'Percentage of AYA cancer patients with declined social functioning',
        lastUpdated: 'August 2024',
        variable: 'sf',
        pageType: 'functioning',
        colorScheme: 'functioning',
        defaultView: 'iconArraySimple'
    },
    cognitive_functioning: {
        dataUrl: null, // Placeholder - add your CSV URL
        title: 'Cognitive Functioning',
        description: 'Percentage of AYA cancer patients with declined cognitive functioning',
        lastUpdated: 'August 2024',
        variable: 'cf',
        pageType: 'functioning',
        colorScheme: 'functioning',
        defaultView: 'iconArraySimple'
    },
    
    // Symptoms modules (placeholders - add your CSV URLs)
    fatigue: {
        dataUrl: null,
        title: 'Fatigue',
        description: 'Percentage of AYA cancer patients experiencing fatigue',
        lastUpdated: 'August 2024',
        variable: 'fa',
        pageType: 'symptoms',
        colorScheme: 'symptoms',
        defaultView: 'iconArraySimple'
    },
    pain: {
        dataUrl: null,
        title: 'Pain',
        description: 'Percentage of AYA cancer patients experiencing pain',
        lastUpdated: 'August 2024',
        variable: 'pa',
        pageType: 'symptoms',
        colorScheme: 'symptoms',
        defaultView: 'iconArraySimple'
    },
    nausea: {
        dataUrl: null,
        title: 'Nausea',
        description: 'Percentage of AYA cancer patients experiencing nausea',
        lastUpdated: 'August 2024',
        variable: 'nu',
        pageType: 'symptoms',
        colorScheme: 'symptoms',
        defaultView: 'iconArraySimple'
    },
    
    // Mental health modules (placeholders)
    anxiety: {
        dataUrl: null,
        title: 'Anxiety',
        description: 'Anxiety levels among AYA cancer patients',
        lastUpdated: 'August 2024',
        variable: 'anxiety',
        pageType: 'mental_health',
        colorScheme: 'qualityOfLife',
        defaultView: 'iconArraySimple'
    },
    depression: {
        dataUrl: null,
        title: 'Depression',
        description: 'Depression levels among AYA cancer patients',
        lastUpdated: 'August 2024',
        variable: 'depression',
        pageType: 'mental_health',
        colorScheme: 'qualityOfLife',
        defaultView: 'iconArraySimple'
    }
};

// Helper function to add a new page type
definePageType(id, config) {
    PAGE_TYPES[id] = config;
}

// Helper function to add a new visualisation type
defineVisualisationType(id, config) {
    VISUALISATION_TYPES[id] = config;
}

// Helper function to add a new color scheme
defineColorScheme(id, colors) {
    COLOR_SCHEMES[id] = colors;
}

// Helper function to add a new legend configuration
defineLegendConfig(pageType, simple, complex) {
    if (!LEGEND_CONFIGS[pageType]) {
        LEGEND_CONFIGS[pageType] = {};
    }
    if (simple) LEGEND_CONFIGS[pageType].simple = simple;
    if (complex) LEGEND_CONFIGS[pageType].complex = complex;
}

// Initialize visualisations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a module page
    const path = window.location.pathname;
    const moduleMatch = path.match(/(chemotherapy|radiotherapy|hormonetherapy|emotional_functioning|physical_functioning|role_functioning|fatigue|pain|nausea|anxiety|depression|surgery|immunotherapy)/);
    
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
        LEGEND_CONFIGS,
        definePageType,
        defineVisualisationType,
        defineColorScheme,
        defineLegendConfig
    };
}
