/**
 * UI Manager - Handles all user interface interactions and updates
 */

class UIManager {
    constructor() {
        this.inputEditor = null;
        this.outputEditor = null;
        this.isDarkMode = false;
        this.autoValidate = true;
        this.debounceTimer = null;
        this.debounceDelay = 500; // ms
        
        this.initializeTheme();
    }

    /**
     * Initialize the UI components
     */
    initialize() {
        this.setupEditors();
        this.bindEvents();
        this.updateThemeIcon();
    }

    /**
     * Setup CodeMirror editors
     */
    setupEditors() {
        // Input editor
        const inputTextarea = document.getElementById('inputEditor');
        if (inputTextarea && typeof CodeMirror !== 'undefined') {
            this.inputEditor = CodeMirror.fromTextArea(inputTextarea, {
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
            this.inputEditor.on('change', () => {
                this.debounceValidation();
                this.updateInputStats();
            });
        }

        // Output editor
        const outputTextarea = document.getElementById('outputEditor');
        if (outputTextarea && typeof CodeMirror !== 'undefined') {
            this.outputEditor = CodeMirror.fromTextArea(outputTextarea, {
                mode: 'application/json',
                theme: this.isDarkMode ? 'material-darker' : 'default',
                lineNumbers: true,
                lineWrapping: true,
                readOnly: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
            });
        }
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

        // Compress button
        const compressBtn = document.getElementById('compressBtn');
        if (compressBtn) {
            compressBtn.addEventListener('click', () => this.compressJSON());
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
        
        // Update CodeMirror themes
        if (this.inputEditor) {
            this.inputEditor.setOption('theme', this.isDarkMode ? 'material-darker' : 'default');
        }
        if (this.outputEditor) {
            this.outputEditor.setOption('theme', this.isDarkMode ? 'material-darker' : 'default');
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
     * Get input value from editor
     */
    getInputValue() {
        if (this.inputEditor) {
            return this.inputEditor.getValue();
        }
        const textarea = document.getElementById('inputEditor');
        return textarea ? textarea.value : '';
    }

    /**
     * Set input value in editor
     */
    setInputValue(value) {
        if (this.inputEditor) {
            this.inputEditor.setValue(value);
        } else {
            const textarea = document.getElementById('inputEditor');
            if (textarea) {
                textarea.value = value;
            }
        }
    }

    /**
     * Set output value in editor
     */
    setOutputValue(value) {
        if (this.outputEditor) {
            this.outputEditor.setValue(value);
        } else {
            const textarea = document.getElementById('outputEditor');
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
        this.setInputValue(sampleJSON);
        this.validateJSON();
        this.showToast('Sample JSON loaded', 'success');
    }

    /**
     * Clear input editor
     */
    clearInput() {
        this.setInputValue('');
        this.setOutputValue('');
        this.hideErrorPanel();
        this.clearErrorHighlights();
        this.updateInputStatus('');
        this.updateOutputStatus('');
        this.updateInputStats();
        this.updateOutputStats();
        
        if (this.inputEditor) {
            this.inputEditor.focus();
        }
        
        this.showToast('Input cleared', 'success');
    }

    /**
     * Format JSON with validation
     */
    formatJSON() {
        const input = this.getInputValue();
        const linter = new JSONLinter();
        const result = linter.format(input);

        if (result.success) {
            this.setOutputValue(result.formatted);
            this.updateOutputStatus('✓ Valid JSON', 'valid');
            this.hideErrorPanel();
            this.clearErrorHighlights();
            this.updateOutputStats();
            this.showToast('JSON formatted successfully', 'success');
        } else {
            this.showErrors(result.errors);
            this.updateOutputStatus('✗ Invalid JSON', 'invalid');
            this.highlightErrorLines(result.errors, input);
            this.setOutputValue('');
        }
    }

    /**
     * Validate JSON without formatting
     */
    validateJSON() {
        const input = this.getInputValue();
        const linter = new JSONLinter();
        const result = linter.validate(input);

        if (result.isValid) {
            this.updateInputStatus('✓ Valid JSON', 'valid');
            this.hideErrorPanel();
            this.clearErrorHighlights();
            this.showToast('JSON is valid', 'success');
        } else {
            this.updateInputStatus('✗ Invalid JSON', 'invalid');
            this.showErrors(result.errors);
            this.highlightErrorLines(result.errors, input);
        }
        
        this.updateInputStats();
    }

    /**
     * Compress/minify JSON
     */
    compressJSON() {
        const input = this.getInputValue();
        const linter = new JSONLinter();
        const result = linter.compress(input);

        if (result.success) {
            this.setOutputValue(result.compressed);
            this.updateOutputStatus('✓ JSON compressed', 'valid');
            this.hideErrorPanel();
            this.clearErrorHighlights();
            this.updateOutputStats();
            this.showToast('JSON compressed successfully', 'success');
        } else {
            this.showErrors(result.errors);
            this.updateOutputStatus('✗ Invalid JSON', 'invalid');
            this.highlightErrorLines(result.errors, input);
            this.setOutputValue('');
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
     * Copy output to clipboard
     */
    async copyToClipboard() {
        const output = this.outputEditor ? this.outputEditor.getValue() : 
                      document.getElementById('outputEditor').value;
        
        if (!output.trim()) {
            this.showToast('Nothing to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(output);
            this.showToast('Copied to clipboard', 'success');
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(output);
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
        const output = this.outputEditor ? this.outputEditor.getValue() : 
                      document.getElementById('outputEditor').value;
        
        if (!output.trim()) {
            this.showToast('Nothing to download', 'error');
            return;
        }

        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `formatted-json-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('JSON downloaded', 'success');
    }

    /**
     * Show error panel with errors
     */
    showErrors(errors) {
        const errorPanel = document.getElementById('errorPanel');
        const errorContent = document.getElementById('errorContent');
        
        if (errorPanel && errorContent) {
            errorContent.textContent = errors.join('\n');
            errorPanel.classList.remove('hidden');
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
     * Update input status
     */
    updateInputStatus(message, type = '') {
        const statusElement = document.getElementById('inputStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status ${type}`;
        }
    }

    /**
     * Update output status
     */
    updateOutputStatus(message, type = '') {
        const statusElement = document.getElementById('outputStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status ${type}`;
        }
    }

    /**
     * Update input statistics
     */
    updateInputStats() {
        const input = this.getInputValue();
        const linter = new JSONLinter();
        const stats = linter.getStats(input);
        
        const sizeElement = document.getElementById('inputSize');
        if (sizeElement) {
            if (input.trim()) {
                sizeElement.textContent = `${stats.characters} chars, ${stats.lines} lines, ${stats.sizeFormatted}`;
            } else {
                sizeElement.textContent = '';
            }
        }
    }

    /**
     * Update output statistics
     */
    updateOutputStats() {
        const output = this.outputEditor ? this.outputEditor.getValue() : 
                      document.getElementById('outputEditor').value;
        
        const sizeElement = document.getElementById('outputSize');
        if (sizeElement && output.trim()) {
            const lines = output.split('\n').length;
            const chars = output.length;
            const bytes = new Blob([output]).size;
            const linter = new JSONLinter();
            const sizeFormatted = linter.formatBytes(bytes);
            
            sizeElement.textContent = `${chars} chars, ${lines} lines, ${sizeFormatted}`;
        } else if (sizeElement) {
            sizeElement.textContent = '';
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = '') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }

    /**
     * Highlight line in editor (for error highlighting)
     */
    highlightLine(editor, lineNumber) {
        if (editor && typeof editor.addLineClass === 'function') {
            // Clear previous highlights
            editor.eachLine((line) => {
                editor.removeLineClass(line, 'background', 'error-line');
            });
            
            // Add highlight to specific line
            if (lineNumber > 0 && lineNumber <= editor.lineCount()) {
                editor.addLineClass(lineNumber - 1, 'background', 'error-line');
                editor.scrollIntoView({ line: lineNumber - 1, ch: 0 });
            }
        }
    }

    /**
     * Get editor line count
     */
    getLineCount(editor) {
        return editor ? editor.lineCount() : 0;
    }

    /**
     * Highlight error lines in the input editor
     */
    highlightErrorLines(errors, jsonString) {
        if (!this.inputEditor || !errors || errors.length === 0) return;

        // Clear previous error highlights
        this.clearErrorHighlights();

        errors.forEach(error => {
            const lineNumber = this.extractLineNumber(error, jsonString);
            if (lineNumber > 0) {
                this.highlightLine(this.inputEditor, lineNumber);
            }
        });
    }

    /**
     * Clear all error highlights from the input editor
     */
    clearErrorHighlights() {
        if (!this.inputEditor) return;

        // Remove error-line class from all lines
        this.inputEditor.eachLine((line) => {
            this.inputEditor.removeLineClass(line, 'background', 'error-line');
        });
    }

    /**
     * Extract line number from error message
     */
    extractLineNumber(errorMessage, jsonString) {
        // Try to extract line number from various error message formats
        const lineMatches = [
            /line (\d+)/i,
            /at line (\d+)/i,
            /on line (\d+)/i,
            /line:?\s*(\d+)/i
        ];

        for (const regex of lineMatches) {
            const match = errorMessage.match(regex);
            if (match) {
                return parseInt(match[1], 10);
            }
        }

        // Try to extract position and convert to line number
        const positionMatch = errorMessage.match(/position (\d+)/i);
        if (positionMatch) {
            const position = parseInt(positionMatch[1], 10);
            return this.getLineFromPosition(jsonString, position);
        }

        // If no line number found, try to parse the error and find approximate location
        return this.findErrorLineByContent(errorMessage, jsonString);
    }

    /**
     * Convert character position to line number
     */
    getLineFromPosition(text, position) {
        if (position <= 0) return 1;
        
        const beforeError = text.substring(0, position);
        const lines = beforeError.split('\n');
        return lines.length;
    }

    /**
     * Find error line by analyzing the error content
     */
    findErrorLineByContent(errorMessage, jsonString) {
        // Look for common JSON syntax errors and try to locate them
        const lines = jsonString.split('\n');
        
        // Check for common error patterns
        if (errorMessage.toLowerCase().includes('unexpected token')) {
            // Try to find the unexpected token
            const tokenMatch = errorMessage.match(/unexpected token '?(.)'?/i);
            if (tokenMatch) {
                const token = tokenMatch[1];
                // Find the first occurrence of this token that might be problematic
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.includes(token)) {
                        // Simple heuristic: if it's a structural character in wrong place
                        if (['{', '}', '[', ']', ',', ':'].includes(token)) {
                            return i + 1;
                        }
                    }
                }
            }
        }

        // Check for unterminated strings
        if (errorMessage.toLowerCase().includes('unterminated string') || 
            errorMessage.toLowerCase().includes('unexpected end')) {
            // Find lines with unmatched quotes
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const quotes = (line.match(/"/g) || []).length;
                if (quotes % 2 !== 0) {
                    return i + 1;
                }
            }
        }

        // Default to line 1 if we can't determine the error location
        return 1;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
