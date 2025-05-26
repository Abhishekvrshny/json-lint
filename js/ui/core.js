/**
 * Core UI Manager - Main UI controller
 */

class UIManager {
    constructor() {
        this.jsonEditor = null;
        this.isDarkMode = false;
        this.autoValidate = true;
        this.debounceTimer = null;
        this.debounceDelay = 500; // ms
        this.fontSize = 14; // Default font size in pixels
        this.minFontSize = 10;
        this.maxFontSize = 24;
        this.treeMode = false;
        this.treeNodeMap = new Map(); // Maps tree nodes to editor line numbers
        this.originalContent = ''; // Store original JSON for undo functionality
        this.currentFormat = 'json'; // Track current format
        
        // Initialize modules
        this.themeManager = new ThemeManager(this);
        this.editorManager = new EditorManager(this);
        this.formatManager = new FormatManager(this);
        this.conversionManager = new ConversionManager(this);
        this.treeManager = new TreeManager(this);
        this.fontManager = new FontManager(this);
        this.typeGeneratorManager = new TypeGeneratorManager(this);
        this.eventManager = new EventManager(this);
        
        this.themeManager.initialize();
        this.fontManager.initialize();
    }

    /**
     * Initialize the UI components
     */
    initialize() {
        this.editorManager.setupEditor();
        this.eventManager.bindEvents();
        this.themeManager.updateThemeIcon();
        
        // Load sample JSON on page load
        this.formatManager.loadSampleJSON();
    }

    /**
     * Get value from editor
     */
    getValue() {
        return this.editorManager.getValue();
    }

    /**
     * Set value in editor
     */
    setValue(value) {
        this.editorManager.setValue(value);
    }

    /**
     * Show toast notification
     */
    showToast(message, type = "success") {
        // Remove existing toast
        const existingToast = document.querySelector(".toast");
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add("hidden");
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    /**
     * Update status
     */
    updateStatus(message, type = '') {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status ${type}`;
        }
    }

    /**
     * Update statistics
     */
    updateStats() {
        const content = this.getValue();
        const linter = new JSONLinter();
        const stats = linter.getStats(content);
        
        const sizeElement = document.getElementById('size');
        if (sizeElement) {
            sizeElement.textContent = stats.sizeFormatted;
        }
    }

    /**
     * Hide error panel
     */
    hideErrorPanel() {
        const errorPanel = document.getElementById('errorPanel');
        if (errorPanel) {
            errorPanel.classList.add('hidden');
        }
    }

    /**
     * Show errors in status area
     */
    showErrors(errors) {
        if (errors && errors.length > 0) {
            this.showToast(errors[0], 'error');
        }
    }
}
