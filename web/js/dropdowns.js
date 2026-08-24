/**
 * STRONG-AYA Info Portal Dropdown Module
 * Creates functional dropdown menus for filters
 */

class StrongAyaDropdown {
    constructor(buttonSelector, menuItems, options = {}) {
        this.button = document.querySelector(buttonSelector);
        this.menuItems = menuItems;
        this.options = {
            placeholder: 'Select an option',
            onSelect: null,
            ...options
        };
        
        this.selectedValue = null;
        this.isOpen = false;
        
        if (this.button) {
            this.init();
        }
    }
    
    init() {
        // Create dropdown structure
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        
        // Move button content to new structure
        const buttonContent = this.button.innerHTML;
        const buttonHtml = `
            <button class="dropdown-btn" type="button">
                <span class="dropdown-text">${this.options.placeholder}</span>
                <span class="dropdown-arrow">▼</span>
            </button>
            <div class="dropdown-content">
                ${this.menuItems.map(item => `
                    <a href="#" data-value="${item.value}">${item.label}</a>
                `).join('')}
            </div>
        `;
        
        dropdown.innerHTML = buttonHtml;
        this.button.innerHTML = '';
        this.button.appendChild(dropdown);
        
        // Store references
        this.dropdown = dropdown;
        this.dropdownBtn = dropdown.querySelector('.dropdown-btn');
        this.dropdownContent = dropdown.querySelector('.dropdown-content');
        this.dropdownText = dropdown.querySelector('.dropdown-text');
        this.dropdownArrow = dropdown.querySelector('.dropdown-arrow');
        
        // Add event listeners
        this.dropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });
        
        // Add click handlers for menu items
        this.dropdownContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const value = link.dataset.value;
                const label = link.textContent;
                this.select(value, label);
                this.close();
            });
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target)) {
                this.close();
            }
        });
        
        // Keyboard navigation
        this.dropdownBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.dropdownContent.classList.add('show');
        this.dropdownBtn.classList.add('active');
        
        // Focus first menu item
        const firstItem = this.dropdownContent.querySelector('a');
        if (firstItem) {
            firstItem.focus();
        }
    }
    
    close() {
        this.isOpen = false;
        this.dropdownContent.classList.remove('show');
        this.dropdownBtn.classList.remove('active');
        
        // Return focus to button
        this.dropdownBtn.focus();
    }
    
    select(value, label) {
        this.selectedValue = value;
        this.dropdownText.textContent = label;
        
        // Trigger callback if provided
        if (this.options.onSelect) {
            this.options.onSelect(value, label);
        }
        
        // Update button aria attributes
        this.dropdownBtn.setAttribute('aria-expanded', 'false');
        this.dropdownBtn.setAttribute('aria-label', `Selected: ${label}`);
    }
    
    getValue() {
        return this.selectedValue;
    }
    
    setValue(value) {
        const item = this.menuItems.find(item => item.value === value);
        if (item) {
            this.select(value, item.label);
        }
    }
    
    clear() {
        this.selectedValue = null;
        this.dropdownText.textContent = this.options.placeholder;
        
        if (this.options.onSelect) {
            this.options.onSelect(null, null);
        }
        
        this.dropdownBtn.setAttribute('aria-label', this.options.placeholder);
    }
    
    updateItems(newItems) {
        this.menuItems = newItems;
        
        // Rebuild dropdown content
        this.dropdownContent.innerHTML = newItems.map(item => `
            <a href="#" data-value="${item.value}">${item.label}</a>
        `).join('');
        
        // Reattach event listeners
        this.dropdownContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const value = link.dataset.value;
                const label = link.textContent;
                this.select(value, label);
                this.close();
            });
        });
    }
}

// Predefined filter options
const FILTER_OPTIONS = {
    sex: [
        { value: 'all', label: 'All' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other/Unknown' }
    ],
    cancerType: [
        { value: 'all', label: 'All Cancer Types' },
        { value: 'breast', label: 'Breast Cancer' },
        { value: 'lung', label: 'Lung Cancer' },
        { value: 'lymphoma', label: 'Lymphoma' },
        { value: 'leukaemia', label: 'Leukaemia' },
        { value: 'melanoma', label: 'Melanoma' },
        { value: 'other', label: 'Other' }
    ],
    timeSinceDiagnosis: [
        { value: 'all', label: 'All Time Periods' },
        { value: '0-1', label: '0-1 year' },
        { value: '1-5', label: '1-5 years' },
        { value: '5-10', label: '5-10 years' },
        { value: '10+', label: '10+ years' }
    ],
    ageGroup: [
        { value: 'all', label: 'All Age Groups' },
        { value: '15-19', label: '15-19 years' },
        { value: '20-24', label: '20-24 years' },
        { value: '25-29', label: '25-29 years' },
        { value: '30-34', label: '30-34 years' },
        { value: '35-39', label: '35-39 years' }
    ]
};

// Initialize dropdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sex dropdown
    const sexBtn = document.querySelector('.sex-btn');
    if (sexBtn) {
        new StrongAyaDropdown(
            '.sex-btn',
            FILTER_OPTIONS.sex,
            {
                placeholder: 'Sex',
                onSelect: (value, label) => {
                    console.log('Sex filter selected:', value, label);
                    // Here you would apply the filter to your visualisation
                }
            }
        );
    }
    
    // Initialize cancer type dropdown
    const cancerTypeBtn = document.querySelector('.cancertype-btn');
    if (cancerTypeBtn) {
        new StrongAyaDropdown(
            '.cancertype-btn',
            FILTER_OPTIONS.cancerType,
            {
                placeholder: 'Cancer type',
                onSelect: (value, label) => {
                    console.log('Cancer type filter selected:', value, label);
                }
            }
        );
    }
    
    // Initialize time since diagnosis dropdown (if exists)
    const timeBtn = document.querySelector('.time-btn');
    if (timeBtn) {
        new StrongAyaDropdown(
            '.time-btn',
            FILTER_OPTIONS.timeSinceDiagnosis,
            {
                placeholder: 'Time since diagnosis',
                onSelect: (value, label) => {
                    console.log('Time filter selected:', value, label);
                }
            }
        );
    }
    
    // Initialize all filters button
    const allFiltersBtn = document.querySelector('.all-filters-btn');
    if (allFiltersBtn) {
        allFiltersBtn.addEventListener('click', function() {
            // Show all filters modal
            showAllFiltersModal();
        });
    }
    
    // Initialize compare button
    const compareBtn = document.querySelector('.compare-info-btn');
    if (compareBtn) {
        compareBtn.addEventListener('click', function() {
            // Show compare functionality
            showCompareModal();
        });
    }
});

// Modal for all filters
function showAllFiltersModal() {
    // Check if modal already exists
    let modal = document.getElementById('all-filters-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'all-filters-modal';
        modal.className = 'modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background-color: white;
            margin: 5% auto;
            padding: 20px;
            border-radius: 10px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">All Filters</h2>
                <button id="close-filters-modal" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
            </div>
            <div id="modal-filters-container" style="display: flex; flex-direction: column; gap: 15px;"></div>
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                <button id="clear-all-filters" style="padding: 10px 20px; background: #ccc; border: none; border-radius: 5px; cursor: pointer;">Clear All</button>
                <button id="apply-all-filters" style="padding: 10px 20px; background: #f7741e; color: white; border: none; border-radius: 5px; cursor: pointer;">Apply Filters</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('close-filters-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('clear-all-filters').addEventListener('click', () => {
            // Clear all filters
            console.log('Clearing all filters');
        });
        
        document.getElementById('apply-all-filters').addEventListener('click', () => {
            // Apply all filters
            console.log('Applying all filters');
            modal.style.display = 'none';
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Show modal
    modal.style.display = 'block';
    
    // Initialize dropdowns in modal
    const modalContainer = document.getElementById('modal-filters-container');
    modalContainer.innerHTML = '';
    
    // Add each filter type
    Object.entries(FILTER_OPTIONS).forEach(([filterType, options]) => {
        const filterDiv = document.createElement('div');
        filterDiv.style.cssText = 'display: flex; flex-direction: column; gap: 5px;';
        
        const label = document.createElement('label');
        label.textContent = filterType.charAt(0).toUpperCase() + filterType.slice(1);
        label.style.cssText = 'font-weight: 600; font-size: 16px;';
        
        const dropdownDiv = document.createElement('div');
        dropdownDiv.className = 'dropdown';
        dropdownDiv.innerHTML = `
            <button class="dropdown-btn" type="button">
                <span class="dropdown-text">Select an option</span>
                <span class="dropdown-arrow">▼</span>
            </button>
            <div class="dropdown-content">
                ${options.map(item => `<a href="#" data-value="${item.value}">${item.label}</a>`).join('')}
            </div>
        `;
        
        filterDiv.appendChild(label);
        filterDiv.appendChild(dropdownDiv);
        modalContainer.appendChild(filterDiv);
        
        // Initialize dropdown
        const dropdownBtn = dropdownDiv.querySelector('.dropdown-btn');
        const dropdownContent = dropdownDiv.querySelector('.dropdown-content');
        const dropdownText = dropdownDiv.querySelector('.dropdown-text');
        const dropdownArrow = dropdownDiv.querySelector('.dropdown-arrow');
        
        dropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
            dropdownBtn.classList.toggle('active');
        });
        
        dropdownContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const value = link.dataset.value;
                const label = link.textContent;
                dropdownText.textContent = label;
                dropdownContent.classList.remove('show');
                dropdownBtn.classList.remove('active');
            });
        });
    });
}

// Modal for compare functionality
function showCompareModal() {
    // Check if modal already exists
    let modal = document.getElementById('compare-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'compare-modal';
        modal.className = 'modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background-color: white;
            margin: 5% auto;
            padding: 20px;
            border-radius: 10px;
            width: 90%;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">Compare Data</h2>
                <button id="close-compare-modal" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
            </div>
            <p style="margin-bottom: 20px;">Select multiple datasets to compare side by side.</p>
            <div id="compare-options" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" value="chemotherapy"> Chemotherapy
                </label>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" value="radiotherapy"> Radiotherapy
                </label>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" value="hormonetherapy"> Hormone Therapy
                </label>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" value="emotional_functioning"> Emotional Functioning
                </label>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" value="physical_functioning"> Physical Functioning
                </label>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" value="role_functioning"> Role Functioning
                </label>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="cancel-compare" style="padding: 10px 20px; background: #ccc; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
                <button id="start-compare" style="padding: 10px 20px; background: #f7741e; color: white; border: none; border-radius: 5px; cursor: pointer;">Compare</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('close-compare-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('cancel-compare').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('start-compare').addEventListener('click', () => {
            // Get selected options
            const checkboxes = modalContent.querySelectorAll('#compare-options input[type="checkbox"]:checked');
            const selected = Array.from(checkboxes).map(cb => cb.value);
            
            if (selected.length < 2) {
                alert('Please select at least 2 datasets to compare.');
                return;
            }
            
            console.log('Comparing datasets:', selected);
            // Here you would show the comparison
            modal.style.display = 'none';
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Show modal
    modal.style.display = 'block';
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StrongAyaDropdown, FILTER_OPTIONS, showAllFiltersModal, showCompareModal };
}
