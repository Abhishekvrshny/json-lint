/**
 * Theme Manager - Handles theme switching and persistence
 */

class ThemeManager {
    constructor(uiManager) {
        this.ui = uiManager;
    }

    /**
     * Initialize theme from localStorage
     */
    initialize() {
        const savedTheme = localStorage.getItem('json-lint-theme');
        // Default to dark theme if no saved preference exists
        this.ui.isDarkMode = savedTheme === 'dark' || !savedTheme;
        this.applyTheme();
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        this.ui.isDarkMode = !this.ui.isDarkMode;
        this.applyTheme();
        this.updateThemeIcon();
        localStorage.setItem('json-lint-theme', this.ui.isDarkMode ? 'dark' : 'light');
    }

    /**
     * Apply the current theme
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.ui.isDarkMode ? 'dark' : 'light');
        
        // Update CodeMirror theme
        if (this.ui.jsonEditor) {
            this.ui.jsonEditor.setOption('theme', this.ui.isDarkMode ? 'material-darker' : 'default');
        }
        
        // Update diff editors theme
        if (this.ui.diffManager) {
            this.ui.diffManager.updateTheme();
        }
    }

    /**
     * Update theme toggle icon
     */
    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.ui.isDarkMode ? '☀️' : '🌙';
        }
    }
}
