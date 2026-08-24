/**
 * STRONG-AYA Info Portal Accessibility Module
 * Handles dark mode, high contrast, text size, and other accessibility features
 */

class AccessibilityManager {
    constructor() {
        this.storageKey = 'strongAyaAccessibility';
        this.settings = this.loadSettings();
        this.init();
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (e) {
            console.error('Could not save accessibility settings:', e);
        }
    }
    
    init() {
        // Apply saved settings
        this.applySettings();
        
        // Initialize button event listeners
        this.initButtons();
    }
    
    initButtons() {
        // Audio button
        const audioBtn = document.querySelector('.ad-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => this.toggleAudio());
            audioBtn.setAttribute('role', 'button');
            audioBtn.setAttribute('aria-label', 'Toggle audio assistance');
            audioBtn.setAttribute('tabindex', '0');
        }
        
        // Contrast button
        const contrastBtn = document.querySelector('.contrast-btn');
        if (contrastBtn) {
            contrastBtn.addEventListener('click', () => this.toggleContrast());
            contrastBtn.setAttribute('role', 'button');
            contrastBtn.setAttribute('aria-label', 'Toggle high contrast mode');
            contrastBtn.setAttribute('tabindex', '0');
        }
        
        // Dark mode button
        const darkBtn = document.querySelector('.dark-btn');
        if (darkBtn) {
            darkBtn.addEventListener('click', () => this.toggleDarkMode());
            darkBtn.setAttribute('role', 'button');
            darkBtn.setAttribute('aria-label', 'Toggle dark mode');
            darkBtn.setAttribute('tabindex', '0');
        }
        
        // Language button
        const languageBtn = document.querySelector('.language-btn');
        if (languageBtn) {
            languageBtn.addEventListener('click', () => this.changeLanguage());
            languageBtn.setAttribute('role', 'button');
            languageBtn.setAttribute('aria-label', 'Change language');
            languageBtn.setAttribute('tabindex', '0');
        }
        
        // Text size button
        const sizeBtn = document.querySelector('.size-btn');
        if (sizeBtn) {
            sizeBtn.addEventListener('click', () => this.cycleTextSize());
            sizeBtn.setAttribute('role', 'button');
            sizeBtn.setAttribute('aria-label', 'Change text size');
            sizeBtn.setAttribute('tabindex', '0');
        }
        
        // Keyboard navigation for all accessibility buttons
        document.querySelectorAll('.accessibility > div').forEach(btn => {
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    }
    
    toggleAudio() {
        this.settings.audioEnabled = !this.settings.audioEnabled;
        this.saveSettings();
        this.applyAudio();
        this.updateButtonState('.ad-btn', this.settings.audioEnabled);
        
        // Show feedback
        this.showFeedback('Audio assistance ' + (this.settings.audioEnabled ? 'enabled' : 'disabled'));
    }
    
    applyAudio() {
        // For now, this would integrate with a text-to-speech API
        // Placeholder for audio functionality
        if (this.settings.audioEnabled) {
            document.body.setAttribute('data-audio', 'enabled');
        } else {
            document.body.removeAttribute('data-audio');
        }
    }
    
    toggleContrast() {
        this.settings.highContrast = !this.settings.highContrast;
        this.saveSettings();
        this.applyContrast();
        this.updateButtonState('.contrast-btn', this.settings.highContrast);
        
        this.showFeedback('High contrast mode ' + (this.settings.highContrast ? 'enabled' : 'disabled'));
    }
    
    applyContrast() {
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast-mode');
        } else {
            document.body.classList.remove('high-contrast-mode');
        }
    }
    
    toggleDarkMode() {
        this.settings.darkMode = !this.settings.darkMode;
        this.saveSettings();
        this.applyDarkMode();
        this.updateButtonState('.dark-btn', this.settings.darkMode);
        
        this.showFeedback('Dark mode ' + (this.settings.darkMode ? 'enabled' : 'disabled'));
    }
    
    applyDarkMode() {
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
    
    changeLanguage() {
        // Cycle through available languages
        const languages = ['en', 'nl', 'fr', 'de', 'es'];
        const currentIndex = languages.indexOf(this.settings.language || 'en');
        const nextIndex = (currentIndex + 1) % languages.length;
        this.settings.language = languages[nextIndex];
        this.saveSettings();
        
        this.updateButtonState('.language-btn', true);
        this.showFeedback('Language changed to: ' + this.getLanguageName(this.settings.language));
        
        // This would integrate with i18n library in a full implementation
        this.applyLanguage();
    }
    
    getLanguageName(code) {
        const names = {
            en: 'English',
            nl: 'Dutch',
            fr: 'French',
            de: 'German',
            es: 'Spanish'
        };
        return names[code] || code;
    }
    
    applyLanguage() {
        // Placeholder for language change implementation
        // Would integrate with i18n framework
        document.body.setAttribute('lang', this.settings.language || 'en');
    }
    
    cycleTextSize() {
        // Cycle through text size options: normal, large, larger
        const sizes = ['normal', 'large', 'larger'];
        const currentIndex = sizes.indexOf(this.settings.textSize || 'normal');
        const nextIndex = (currentIndex + 1) % sizes.length;
        this.settings.textSize = sizes[nextIndex];
        this.saveSettings();
        
        this.applyTextSize();
        this.updateButtonState('.size-btn', true);
        
        const sizeNames = {
            normal: 'Normal',
            large: 'Large',
            larger: 'Larger'
        };
        this.showFeedback('Text size: ' + sizeNames[this.settings.textSize]);
    }
    
    applyTextSize() {
        // Remove all size classes first
        document.body.classList.remove('text-normal', 'text-large', 'text-larger');
        
        // Add the current size class
        if (this.settings.textSize) {
            document.body.classList.add('text-' + this.settings.textSize);
        }
    }
    
    updateButtonState(selector, active) {
        const btn = document.querySelector(selector);
        if (btn) {
            if (active) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        }
    }
    
    applySettings() {
        // Apply all saved settings
        this.applyAudio();
        this.applyContrast();
        this.applyDarkMode();
        this.applyTextSize();
        this.applyLanguage();
        
        // Update button states to reflect current settings
        if (this.settings.audioEnabled) {
            this.updateButtonState('.ad-btn', true);
        }
        if (this.settings.highContrast) {
            this.updateButtonState('.contrast-btn', true);
        }
        if (this.settings.darkMode) {
            this.updateButtonState('.dark-btn', true);
        }
    }
    
    showFeedback(message) {
        // Create feedback toast
        let toast = document.getElementById('accessibility-toast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'accessibility-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #f7741e;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-family: var(--font-poppins), sans-serif;
                font-size: 14px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            
            // Add animation keyframes
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.animation = 'slideIn 0.3s ease-out';
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (toast && toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Static method for easy initialization
    static init() {
        if (!window.accessibilityManager) {
            window.accessibilityManager = new AccessibilityManager();
        }
        return window.accessibilityManager;
    }
}

// Initialize accessibility manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AccessibilityManager.init();
});

// Also apply settings immediately to prevent flash of unstyled content
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AccessibilityManager.init();
    });
} else {
    AccessibilityManager.init();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}
