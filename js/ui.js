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
        this.treeMode = false;
        this.treeNodeMap = new Map(); // Maps tree nodes to editor line numbers
        this.originalContent = ''; // Store original JSON for undo functionality
        this.currentFormat = 'json'; // Track current format
        
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

        // Tree mode toggle checkbox
        const treeModeToggle = document.getElementById('treeModeToggle');
        if (treeModeToggle) {
            treeModeToggle.addEventListener('change', () => this.toggleTreeMode());
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

        // Conversion dropdown
        const convertDropdown = document.getElementById('convertDropdown');
        if (convertDropdown) {
            convertDropdown.addEventListener('change', (e) => this.handleConversion(e.target.value));
        }

        // Undo button
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undoConversion());
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
        // Default to dark theme if no saved preference exists
        this.isDarkMode = savedTheme === 'dark' || !savedTheme;
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
        
        // Reset to JSON format when loading sample
        this.resetToJSONFormat();
        
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
        
        // Reset format to JSON and enable validation controls
        this.resetToJSONFormat();
        
        // Clear tree view if tree mode is enabled
        if (this.treeMode) {
            this.refreshTreeView();
        }
        
        if (this.jsonEditor) {
            this.jsonEditor.focus();
        }
        
        this.showToast('Input cleared', 'success');
    }

    /**
     * Reset to JSON format and enable all controls
     */
    resetToJSONFormat() {
        this.currentFormat = 'json';
        this.updateEditorMode('json');
        this.enableValidationControls();
        this.hideUndoButton();
        this.resetConversionDropdown();
        this.originalContent = '';
    }

    /**
     * Format JSON with validation
     */
    formatJSON() {
        if (this.currentFormat !== 'json') {
            this.showToast('Format is only available for JSON content', 'error');
            return;
        }

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
            
            // Refresh tree view if tree mode is enabled
            if (this.treeMode) {
                this.refreshTreeView();
            }
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
        if (this.currentFormat !== 'json') {
            this.showToast('Validation is only available for JSON content', 'error');
            return;
        }

        const input = this.getValue();
        const linter = new JSONLinter();
        const result = linter.validate(input);

        if (result.isValid) {
            this.updateStatus('✓ Valid JSON', 'valid');
            this.hideErrorPanel();
            this.clearErrorHighlights();
            this.showToast('JSON is valid', 'success');
            
            // Refresh tree view if tree mode is enabled
            if (this.treeMode) {
                this.refreshTreeView();
            }
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
        if (this.currentFormat !== 'json') {
            this.showToast('Compression is only available for JSON content', 'error');
            const compressToggle = document.getElementById('compressToggle');
            if (compressToggle) compressToggle.checked = false;
            return;
        }

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
        if (!this.autoValidate || this.currentFormat !== 'json') return;
        
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
     * Download content as file
     */
    downloadJSON() {
        const content = this.getValue();
        
        if (!content.trim()) {
            this.showToast('Nothing to download', 'error');
            return;
        }

        // Determine file extension based on current format
        let extension = 'json';
        let mimeType = 'application/json';
        
        switch (this.currentFormat) {
            case 'yaml':
                extension = 'yaml';
                mimeType = 'text/yaml';
                break
