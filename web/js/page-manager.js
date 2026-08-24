/**
 * STRONG-AYA Info Portal Page Manager
 * Manages different page types (use cases) and their modules
 * Allows easy addition of new page types and modules
 */

class PageManager {
    constructor() {
        this.currentPage = null;
        this.currentModule = null;
        this.init();
    }
    
    init() {
        // Determine current page and module from URL
        this.detectCurrentPage();
        
        // Initialize page-specific functionality
        this.initPageFeatures();
    }
    
    detectCurrentPage() {
        const path = window.location.pathname;
        
        // Check if we're on the main index page
        if (path.endsWith('/index.html') || path.endsWith('/') || path === '') {
            this.currentPage = 'profiles';
            return;
        }
        
        // Check if we're on the modules page
        if (path.endsWith('/modules.html')) {
            this.currentPage = 'modules';
            return;
        }
        
        // Check for module pages
        const moduleMatch = path.match(/(module_a|module_b|module_c|module_d)\/([^\/]+)\.html/);
        if (moduleMatch) {
            this.currentPage = moduleMatch[1]; // module_a, module_b, etc.
            this.currentModule = moduleMatch[2]; // chemotherapy, emotional_functioning, etc.
            
            // Map module to page type
            this.mapModuleToPageType();
        }
    }
    
    mapModuleToPageType() {
        // Map module names to page types
        const modulePageMap = {
            // Treatment modules
            chemotherapy: 'treatment',
            radiotherapy: 'treatment',
            hormonetherapy: 'treatment',
            surgery: 'treatment',
            immunotherapy: 'treatment',
            
            // Functioning modules
            emotional_functioning: 'functioning',
            physical_functioning: 'functioning',
            role_functioning: 'functioning',
            social_functioning: 'functioning',
            cognitive_functioning: 'functioning',
            
            // Symptoms modules
            fatigue: 'symptoms',
            pain: 'symptoms',
            nausea: 'symptoms',
            anxiety: 'symptoms',
            depression: 'symptoms',
            
            // Mental health modules
            stress: 'mental_health',
            coping: 'mental_health',
            resilience: 'mental_health',
            
            // Lifestyle modules
            physical_activity: 'lifestyle',
            diet: 'lifestyle',
            sleep: 'lifestyle',
            smoking: 'lifestyle',
            alcohol: 'lifestyle',
            
            // Demographics modules
            age: 'demographics',
            sex: 'demographics',
            education: 'demographics',
            employment: 'demographics',
            relationship_status: 'demographics'
        };
        
        if (this.currentModule && modulePageMap[this.currentModule]) {
            this.currentPage = modulePageMap[this.currentModule];
        }
    }
    
    initPageFeatures() {
        // Add page-specific classes to body
        if (this.currentPage) {
            document.body.classList.add(`page-${this.currentPage}`);
        }
        
        // Initialize module-specific navigation
        if (this.currentModule) {
            this.initModuleNavigation();
        }
    }
    
    initModuleNavigation() {
        // Add navigation to other modules in the same page type
        const pageType = this.getPageType();
        if (!pageType) return;
        
        const navContainer = document.createElement('div');
        navContainer.className = 'module-navigation';
        navContainer.innerHTML = `<h4>Related Topics</h4>`;
        
        const navList = document.createElement('div');
        navList.className = 'module-nav-list';
        
        // Add links to other modules in this page type
        pageType.modules.forEach(module => {
            if (module !== this.currentModule) {
                const link = document.createElement('a');
                link.href = this.getModuleUrl(module);
                link.className = 'module-nav-link';
                link.textContent = this.formatModuleName(module);
                link.title = `View ${this.formatModuleName(module)}`;
                navList.appendChild(link);
            }
        });
        
        navContainer.appendChild(navList);
        
        // Insert navigation after the main visualisation
        const visContainer = document.querySelector('.visualisation-container');
        if (visContainer && navList.children.length > 0) {
            visContainer.parentNode.insertBefore(navContainer, visContainer.nextSibling);
        }
    }
    
    getPageType() {
        if (!this.currentModule) return null;
        
        // Import page types from visualisation module
        if (typeof PAGE_TYPES !== 'undefined') {
            return PAGE_TYPES[this.currentPage];
        }
        return null;
    }
    
    getModuleUrl(moduleName) {
        // Map module names to file paths
        const modulePaths = {
            // Module A - Treatment
            chemotherapy: 'module_a/chemotherapy.html',
            radiotherapy: 'module_a/radiotherapy.html',
            hormonetherapy: 'module_a/hormonetherapy.html',
            surgery: 'module_a/surgery.html',
            immunotherapy: 'module_a/immunotherapy.html',
            
            // Module B - Functioning
            emotional_functioning: 'module_b/emotional_functioning.html',
            physical_functioning: 'module_b/physical_functioning.html',
            role_functioning: 'module_b/role_functioning.html',
            social_functioning: 'module_b/social_functioning.html',
            cognitive_functioning: 'module_b/cognitive_functioning.html',
            
            // Add more as needed
        };
        
        return modulePaths[moduleName] || `#${moduleName}`;
    }
    
    formatModuleName(name) {
        // Convert snake_case or kebab-case to readable format
        return name
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    // Method to add a new page type dynamically
    static addPageType(id, config) {
        if (typeof PAGE_TYPES !== 'undefined') {
            PAGE_TYPES[id] = config;
        }
    }
    
    // Method to add a new module to a page type
    static addModuleToPage(pageTypeId, moduleName, moduleConfig = {}) {
        if (typeof PAGE_TYPES !== 'undefined' && PAGE_TYPES[pageTypeId]) {
            if (!PAGE_TYPES[pageTypeId].modules) {
                PAGE_TYPES[pageTypeId].modules = [];
            }
            if (!PAGE_TYPES[pageTypeId].modules.includes(moduleName)) {
                PAGE_TYPES[pageTypeId].modules.push(moduleName);
            }
            
            // Also add to VISUALISATION_CONFIGS if not exists
            if (typeof VISUALISATION_CONFIGS !== 'undefined' && !VISUALISATION_CONFIGS[moduleName]) {
                VISUALISATION_CONFIGS[moduleName] = {
                    dataUrl: null,
                    title: this.formatModuleName(moduleName),
                    description: `Data for ${this.formatModuleName(moduleName)}`,
                    lastUpdated: new Date().toISOString().split('T')[0],
                    variable: moduleName,
                    pageType: pageTypeId,
                    defaultView: 'iconArraySimple'
                };
            }
        }
    }
}

// Page type definitions (mirrored from visualisation.js for reference)
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

// Initialize page manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.pageManager = new PageManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PageManager, PAGE_TYPES };
}
