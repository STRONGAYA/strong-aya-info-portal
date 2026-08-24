/**
 * STRONG-AYA Info Portal Visualisation Module
 * Handles icon array, table, and pie chart visualisations using Plotly.js
 * Loads data from GitHub CSV files
 */

class StrongAyaVisualisation {
    constructor(containerId, dataConfig) {
        this.containerId = containerId;
        this.dataConfig = dataConfig;
        this.container = document.getElementById(containerId);
        this.currentView = 'iconArray';
        this.data = null;
        this.filters = {};
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error(`Container ${this.containerId} not found`);
            return;
        }
        
        this.loadData();
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
    
    createVisualisationContainer() {
        this.container.innerHTML = '';
        
        // Create view selector
        const viewSelector = document.createElement('div');
        viewSelector.className = 'visualisation-selector';
        
        const views = [
            { id: 'iconArray', label: 'Icon Array' },
            { id: 'table', label: 'Data Table' },
            { id: 'pieChart', label: 'Pie Chart' },
            { id: 'barChart', label: 'Bar Chart' }
        ];
        
        views.forEach(view => {
            const btn = document.createElement('button');
            btn.className = `vis-btn ${this.currentView === view.id ? 'active' : ''}`;
            btn.textContent = view.label;
            btn.dataset.view = view.id;
            btn.addEventListener('click', () => this.switchView(view.id));
            viewSelector.appendChild(btn);
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
        const buttons = this.container.querySelectorAll('.vis-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewType);
        });
        
        this.render();
    }
    
    render() {
        if (!this.data || !this.visArea) return;
        
        switch (this.currentView) {
            case 'table':
                this.renderTable();
                break;
            case 'pieChart':
                this.renderPieChart();
                break;
            case 'barChart':
                this.renderBarChart();
                break;
            case 'iconArray':
            default:
                this.renderIconArray();
                break;
        }
    }
    
    renderIconArray() {
        // Parse icon data from CSV
        const iconData = this.parseIconData();
        
        if (iconData.orangeCount === 0 && iconData.greyCount === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data available for icon array visualisation.</p>';
            return;
        }
        
        const total = iconData.orangeCount + iconData.greyCount;
        const percentage = Math.round((iconData.orangeCount / total) * 100);
        
        const html = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3>${this.dataConfig.title || 'Treatment Distribution'}</h3>
                <p style="font-size: 18px; margin: 10px 0;">
                    ${iconData.orangeCount} out of ${total} people (${percentage}%)
                </p>
            </div>
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
            <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 20px; height: 30px; background: #f7741e; border-radius: 3px;"></div>
                    <span>Yes: ${iconData.orangeCount} (${percentage}%)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 20px; height: 30px; background: #d7d7d7; border-radius: 3px;"></div>
                    <span>No: ${iconData.greyCount} (${100 - percentage}%)</span>
                </div>
            </div>
        `;
        
        this.visArea.innerHTML = html;
    }
    
    parseIconData() {
        if (!this.data || this.data.length === 0) return { orangeCount: 0, greyCount: 0 };
        
        // The CSV contains person icons as images
        // Count orange and grey person icons
        const firstRow = this.data[0];
        if (!firstRow || !firstRow.icons) return { orangeCount: 0, greyCount: 0 };
        
        const orangeIcons = (firstRow.icons.match(/person-orange/g) || []).length;
        const greyIcons = (firstRow.icons.match(/person-grey/g) || []).length;
        
        return { orangeCount: orangeIcons, greyCount: greyIcons };
    }
    
    generateIconHTML(count, colour) {
        const colourMap = {
            orange: '#f7741e',
            grey: '#d7d7d7'
        };
        
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <svg width="20" height="30" viewBox="0 0 20 30" style="flex-shrink: 0;">
                    <rect width="20" height="30" fill="${colourMap[colour]}" rx="3"/>
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
        const total = iconData.orangeCount + iconData.greyCount;
        const percentage = Math.round((iconData.orangeCount / total) * 100);
        
        const html = `
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
            <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                <p><strong>Note:</strong> Data represents ${this.dataConfig.description || 'patient-reported outcomes from the SURVAYA study'}.</p>
                <p>Last updated: ${this.dataConfig.lastUpdated || 'August 2024'}</p>
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
        const total = iconData.orangeCount + iconData.greyCount;
        
        if (total === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data to display.</p>';
            return;
        }
        
        const data = [{
            values: [iconData.orangeCount, iconData.greyCount],
            labels: ['Yes', 'No'],
            type: 'pie',
            marker: {
                colors: ['#f7741e', '#d7d7d7']
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
            margin: { t: 50, b: 50, l: 20, r: 20 }
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
        const total = iconData.orangeCount + iconData.greyCount;
        
        if (total === 0) {
            this.visArea.innerHTML = '<p style="text-align: center; padding: 20px;">No data to display.</p>';
            return;
        }
        
        const data = [{
            x: ['Yes', 'No'],
            y: [iconData.orangeCount, iconData.greyCount],
            type: 'bar',
            marker: {
                color: ['#f7741e', '#d7d7d7']
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
        // For now, filters are stored but not applied
        // In a full implementation, this would filter the data
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
        variable: 'ther_chemo'
    },
    radiotherapy: {
        dataUrl: 'https://raw.githubusercontent.com/STRONGAYA/strong-aya-info-portal/main/data/flashcards/ther_rt_flashcard.csv',
        title: 'Radiotherapy Treatment',
        description: 'Percentage of AYA cancer patients who received radiotherapy',
        lastUpdated: 'August 2024',
        variable: 'ther_rt'
    },
    hormonetherapy: {
        dataUrl: 'https://raw.githubusercontent.com/STRONGAYA/strong-aya-info-portal/main/data/flashcards/ther_ht_flashcard.csv',
        title: 'Hormone Therapy',
        description: 'Percentage of AYA cancer patients who received hormone therapy',
        lastUpdated: 'August 2024',
        variable: 'ther_ht'
    },
    emotional_functioning: {
        dataUrl: 'https://raw.githubusercontent.com/STRONGAYA/strong-aya-info-portal/main/data/flashcards/ef_flashcard.csv',
        title: 'Emotional Functioning',
        description: 'Percentage of AYA cancer patients with declined emotional functioning',
        lastUpdated: 'August 2024',
        variable: 'ef'
    },
    physical_functioning: {
        dataUrl: 'https://raw.githubusercontent.com/STRONGAYA/strong-aya-info-portal/main/data/flashcards/pf_flashcard.csv',
        title: 'Physical Functioning',
        description: 'Percentage of AYA cancer patients with declined physical functioning',
        lastUpdated: 'August 2024',
        variable: 'pf'
    },
    role_functioning: {
        dataUrl: 'https://raw.githubusercontent.com/STRONGAYA/strong-aya-info-portal/main/data/flashcards/rf_flashcard.csv',
        title: 'Role Functioning',
        description: 'Percentage of AYA cancer patients with declined role functioning',
        lastUpdated: 'August 2024',
        variable: 'rf'
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
    module.exports = { StrongAyaVisualisation, VISUALISATION_CONFIGS };
}
