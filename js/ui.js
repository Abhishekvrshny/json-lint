/**
 * UI Manager - Handles all user interface interactions and updates
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
        
        this.initializeTheme();
        this.initializeFontSize();
    }

    /**
     * Initialize the UI components
     */
    initialize() {
        this.setupEditor();
        this.bindEvents();
        this.updateThemeIcon();
    }

    /**
     * Setup CodeMirror editor
     */
    setupEditor() {
        // Single JSON editor
        const jsonTextarea = document.getElementById('jsonEditor');
        if (jsonTextarea && typeof CodeMirror !== 'undefined') {
            this.jsonEditor = CodeMirror.fromTextArea(jsonTextarea, {
                mode: 'application/json',
                theme: this.isDarkMode ? 'material-darker' : 'default',
                lineNumbers: true,
                lineWrapping: true,
                autoCloseBrackets: true,
                matchBrackets: true,
                indentUnit: 2,
                tabSize: 2,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                extraKeys: {
                    'Ctrl-Space': 'autocomplete',
                    'Cmd-Space': 'autocomplete',
                    'Ctrl-/': 'toggleComment',
                    'Cmd-/': 'toggleComment'
                }
            });

            // Auto-validate on input change
            this.jsonEditor.on('change', () => {
                this.debounceValidation();
                this.updateStats();
            });
        }

        // Apply font size to editor after it's created
        this.applyFontSize();
    }

    /**
     * Bind event listeners to UI elements
     */
    bindEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Sample JSON button
        const sampleBtn = document.getElementById('sampleBtn');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => this.loadSampleJSON());
        }

        // Clear button
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearInput());
        }

        // Format button
        const formatBtn = document.getElementById('formatBtn');
        if (formatBtn) {
            formatBtn.addEventListener('click', () => this.formatJSON());
        }

        // Validate button
        const validateBtn = document.getElementById('validateBtn');
        if (validateBtn) {
            validateBtn.addEventListener('click', () => this.validateJSON());
        }

        // Compress toggle checkbox
        const compressToggle = document.getElementById('compressToggle');
        if (compressToggle) {
            compressToggle.addEventListener('change', () => this.toggleCompression());
        }

        // Copy button
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyToClipboard());
        }

        // Download button
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadJSON());
        }

        // Font size controls
        const fontSizeIncrease = document.getElementById('fontSizeIncrease');
        if (fontSizeIncrease) {
            fontSizeIncrease.addEventListener('click', () => this.increaseFontSize());
        }

        const fontSizeDecrease = document.getElementById('fontSizeDecrease');
        if (fontSizeDecrease) {
            fontSizeDecrease.addEventListener('click', () => this.decreaseFontSize());
        }

        // Close error panel
        const closeErrorBtn = document.getElementById('closeErrorBtn');
        if (closeErrorBtn) {
            closeErrorBtn.addEventListener('click', () => this.hideErrorPanel());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

        if (ctrlKey) {
            switch (event.key.toLowerCase()) {
                case 'enter':
                    event.preventDefault();
                    this.formatJSON();
                    break;
                case 'l':
                    event.preventDefault();
                    this.loadSampleJSON();
                    break;
                case 'k':
                    event.preventDefault();
                    this.clearInput();
                    break;
                case 'd':
                    event.preventDefault();
                    this.toggleTheme();
                    break;
            }
        }
    }

    /**
     * Initialize theme from localStorage
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('json-lint-theme');
        this.isDarkMode = savedTheme === 'dark' || 
            (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
        this.applyTheme();
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        this.updateThemeIcon();
        localStorage.setItem('json-lint-theme', this.isDarkMode ? 'dark' : 'light');
    }

    /**
     * Apply the current theme
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        
        // Update CodeMirror theme
        if (this.jsonEditor) {
            this.jsonEditor.setOption('theme', this.isDarkMode ? 'material-darker' : 'default');
        }
    }

    /**
     * Update theme toggle icon
     */
    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.isDarkMode ? '☀️' : '🌙';
        }
    }

    /**
     * Get value from editor
     */
    getValue() {
        if (this.jsonEditor) {
            return this.jsonEditor.getValue();
        }
        const textarea = document.getElementById('jsonEditor');
        return textarea ? textarea.value : '';
    }

    /**
     * Set value in editor
     */
    setValue(value) {
        if (this.jsonEditor) {
            this.jsonEditor.setValue(value);
        } else {
            const textarea = document.getElementById('jsonEditor');
            if (textarea) {
                textarea.value = value;
            }
        }
    }

    /**
     * Load sample JSON
     */
    loadSampleJSON() {
        const sampleJSON = JSONLinter.getSampleJSON();
        this.setValue(sampleJSON);
        this.validateJSON();
        this.showToast('Sample JSON loaded', 'success');
    }

    /**
     * Clear input editor
     */
    clearInput() {
        this.setValue('');
        this.hideErrorPanel();
        this.clearErrorHighlights();
        this.updateStatus('');
        this.updateStats();
        
        if (this.jsonEditor) {
            this.jsonEditor.focus();
        }
        
        this.showToast('Input cleared', 'success');
    }

    /**
     * Format JSON with validation
     */
    formatJSON() {
        const input = this.getValue();
        const linter = new JSONLinter();
        const result = linter.format(input);

        if (result.success) {
            this.setValue(result.formatted);
            this.updateStatus('✓ Valid JSON', 'valid');
            this.hideErrorPanel();
            this.clearErrorHighlights();
            this.updateStats();
            this.showToast('JSON formatted successfully', 'success');
        } else {
            this.showErrors(result.errors);
            this.updateStatus('✗ Invalid JSON', 'invalid');
            this.highlightErrorLines(result.errors, input);
        }
    }

    /**
     * Validate JSON without formatting
     */
    validateJSON() {
        const input = this.getValue();
        const linter = new JSONLinter();
        const result = linter.validate(input);

        if (result.isValid) {
            this.updateStatus('✓ Valid JSON', 'valid');
            this.hideErrorPanel();
            this.clearErrorHighlights();
            this.showToast('JSON is valid', 'success');
        } else {
            this.updateStatus('✗ Invalid JSON', 'invalid');
            this.showErrors(result.errors);
            this.highlightErrorLines(result.errors, input);
        }
        
        this.updateStats();
    }

    /**
     * Toggle between compressed and formatted JSON based on checkbox state
     */
    toggleCompression() {
        const compressToggle = document.getElementById('compressToggle');
        const isCompressed = compressToggle && compressToggle.checked;
        
        const input = this.getValue();
        if (!input.trim()) {
            this.showToast('No JSON to process', 'error');
            return;
        }

        const linter = new JSONLinter();
        
        if (isCompressed) {
            // Compress the JSON
            const result = linter.compress(input);
            if (result.success) {
                this.setValue(result.compressed);
                this.updateStatus('✓ JSON compressed', 'valid');
                this.hideErrorPanel();
                this.clearErrorHighlights();
                this.updateStats();
                this.showToast('JSON compressed', 'success');
            } else {
                this.showErrors(result.errors);
                this.updateStatus('✗ Invalid JSON', 'invalid');
                this.highlightErrorLines(result.errors, input);
                // Uncheck the checkbox if compression failed
                compressToggle.checked = false;
            }
        } else {
            // Format the JSON (expand)
            const result = linter.format(input);
            if (result.success) {
                this.setValue(result.formatted);
                this.updateStatus('✓ JSON formatted', 'valid');
                this.hideErrorPanel();
                this.clearErrorHighlights();
                this.updateStats();
                this.showToast('JSON formatted', 'success');
            } else {
                this.showErrors(result.errors);
                this.updateStatus('✗ Invalid JSON', 'invalid');
                this.highlightErrorLines(result.errors, input);
            }
        }
    }

    /**
     * Debounced validation for auto-validation
     */
    debounceValidation() {
        if (!this.autoValidate) return;
        
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.validateJSON();
        }, this.debounceDelay);
    }

    /**
     * Copy content to clipboard
     */
    async copyToClipboard() {
        const content = this.getValue();
        
        if (!content.trim()) {
            this.showToast('Nothing to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(content);
            this.showToast('Copied to clipboard', 'success');
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(content);
        }
    }

    /**
     * Fallback copy method for older browsers
     */
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Copied to clipboard', 'success');
        } catch (err) {
            this.showToast('Failed to copy', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    /**
     * Download JSON as file
     */
    downloadJSON() {
        const content = this.getValue();
        
        if (!content.trim()) {
            this.showToast('Nothing to download', 'error');
            return;
        }

        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `json-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('JSON downloaded', 'success');
    }

    /**
     * Show errors in status area instead of popup
     */
    showErrors(errors) {
        // Don't show the popup panel, just show error in toast
        if (errors && errors.length > 0) {
            this.showToast(errors[0], 'error');
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
     * Highlight error lines in the editor
     */
    highlightErrorLines(errors, input) {
        if (!this.jsonEditor) return;
        
        this.clearErrorHighlights();
        
        errors.forEach(error => {
            // Look for line number in various formats
            const lineMatch = error.match(/(?:line|Line)\s+(\d+)/i);
            if (lineMatch) {
                const lineNumber = parseInt(lineMatch[1]) - 1; // CodeMirror uses 0-based indexing
                if (lineNumber >= 0 && lineNumber < this.jsonEditor.lineCount()) {
                    this.jsonEditor.addLineClass(lineNumber, 'background', 'error-line');
                }
            }
        });
    }

    /**
     * Clear error highlights from the editor
     */
    clearErrorHighlights() {
        if (!this.jsonEditor) return;
        
        const lineCount = this.jsonEditor.lineCount();
        for (let i = 0; i < lineCount; i++) {
            this.jsonEditor.removeLineClass(i, 'background', 'error-line');
        }
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
     * Initialize font size from localStorage
     */
    initializeFontSize() {
        const savedFontSize = localStorage.getItem("json-lint-font-size");
        if (savedFontSize) {
            this.fontSize = parseInt(savedFontSize);
        }
        this.applyFontSize();
    }

    /**
     * Increase font size
     */
    increaseFontSize() {
        if (this.fontSize < this.maxFontSize) {
            this.fontSize += 2;
            this.applyFontSize();
            this.saveFontSize();
            this.showToast(`Font size increased to ${this.fontSize}px`, "success");
        } else {
            this.showToast("Maximum font size reached", "warning");
        }
    }

    /**
     * Decrease font size
     */
    decreaseFontSize() {
        if (this.fontSize > this.minFontSize) {
            this.fontSize -= 2;
            this.applyFontSize();
            this.saveFontSize();
            this.showToast(`Font size decreased to ${this.fontSize}px`, "success");
        } else {
            this.showToast("Minimum font size reached", "warning");
        }
    }

    /**
     * Apply font size to editor
     */
    applyFontSize() {
        const fontSizeStyle = `${this.fontSize}px`;
        
        // Apply to CodeMirror editor
        if (this.jsonEditor) {
            this.jsonEditor.getWrapperElement().style.fontSize = fontSizeStyle;
            this.jsonEditor.refresh();
        }

        // Apply to fallback textarea (in case CodeMirror isnt loaded)
        const jsonTextarea = document.getElementById("jsonEditor");
        if (jsonTextarea) {
            jsonTextarea.style.fontSize = fontSizeStyle;
        }
    }

    /**
     * Save font size to localStorage
     */
    saveFontSize() {
        localStorage.setItem("json-lint-font-size", this.fontSize.toString());
    }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
    module.exports = UIManager;
}
