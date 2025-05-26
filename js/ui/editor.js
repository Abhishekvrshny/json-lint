/**
 * Editor Manager - Handles CodeMirror editor setup and operations
 */

class EditorManager {
    constructor(uiManager) {
        this.ui = uiManager;
    }

    /**
     * Setup CodeMirror editor
     */
    setupEditor() {
        const textarea = document.getElementById('jsonEditor');
        if (!textarea) return;

        this.ui.jsonEditor = CodeMirror.fromTextArea(textarea, {
            mode: 'application/json',
            theme: this.ui.isDarkMode ? 'material-darker' : 'default',
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
                'Ctrl-/': 'toggleComment',
                'Ctrl-Enter': () => this.ui.formatManager.formatJSON(),
                'Ctrl-L': () => this.ui.formatManager.loadSampleJSON(),
                'Ctrl-K': () => this.ui.formatManager.clearInput()
            }
        });

        // Auto-validate on change with debouncing
        this.ui.jsonEditor.on('change', () => {
            if (this.ui.debounceTimer) {
                clearTimeout(this.ui.debounceTimer);
            }
            
            this.ui.debounceTimer = setTimeout(() => {
                if (this.ui.autoValidate && this.ui.currentFormat === 'json') {
                    this.ui.formatManager.validateJSON();
                }
                this.ui.updateStats();
                
                // Update diff availability
                if (this.ui.diffManager) {
                    this.ui.diffManager.updateDiffAvailability();
                }
            }, this.ui.debounceDelay);
        });

        // Update font size
        this.updateFontSize();
    }

    /**
     * Get value from editor
     */
    getValue() {
        return this.ui.jsonEditor ? this.ui.jsonEditor.getValue() : '';
    }

    /**
     * Set value in editor
     */
    setValue(value) {
        if (this.ui.jsonEditor) {
            this.ui.jsonEditor.setValue(value);
        }
    }

    /**
     * Update editor font size
     */
    updateFontSize() {
        if (this.ui.jsonEditor) {
            const wrapper = this.ui.jsonEditor.getWrapperElement();
            wrapper.style.fontSize = `${this.ui.fontSize}px`;
            this.ui.jsonEditor.refresh();
        }
    }

    /**
     * Set editor mode for different formats
     */
    setMode(mode) {
        if (this.ui.jsonEditor) {
            let mimeType;
            switch (mode) {
                case 'yaml':
                    mimeType = 'text/x-yaml';
                    break;
                case 'xml':
                    mimeType = 'application/xml';
                    break;
                case 'toml':
                    mimeType = 'text/x-toml';
                    break;
                default:
                    mimeType = 'application/json';
            }
            this.ui.jsonEditor.setOption('mode', mimeType);
        }
    }

    /**
     * Focus the editor
     */
    focus() {
        if (this.ui.jsonEditor) {
            this.ui.jsonEditor.focus();
        }
    }

    /**
     * Refresh the editor display
     */
    refresh() {
        if (this.ui.jsonEditor) {
            this.ui.jsonEditor.refresh();
        }
    }

    /**
     * Highlight error line in the editor
     */
    highlightErrorLine(errorMessage) {
        if (!this.ui.jsonEditor) return;

        // Clear previous error highlights
        this.clearErrorHighlights();

        // Extract line number from error message
        const lineMatch = errorMessage.match(/line (\d+)/i);
        if (lineMatch) {
            const lineNumber = parseInt(lineMatch[1]) - 1; // CodeMirror uses 0-based line numbers
            
            // Add error line class
            this.ui.jsonEditor.addLineClass(lineNumber, 'background', 'error-line');
            
            // Scroll to the error line
            this.ui.jsonEditor.scrollIntoView({line: lineNumber, ch: 0});
            
            // Store the highlighted line for later clearing
            this.ui.errorLineNumber = lineNumber;
        }
    }

    /**
     * Clear error line highlights
     */
    clearErrorHighlights() {
        if (!this.ui.jsonEditor) return;

        if (this.ui.errorLineNumber !== undefined) {
            this.ui.jsonEditor.removeLineClass(this.ui.errorLineNumber, 'background', 'error-line');
            this.ui.errorLineNumber = undefined;
        }
    }

    /**
     * Highlight a specific line (for tree mode selection)
     */
    highlightLine(lineNumber) {
        if (!this.ui.jsonEditor) {
            console.log('No jsonEditor available');
            return;
        }

        console.log('Attempting to highlight line:', lineNumber);

        // Clear previous highlights
        this.clearLineHighlights();

        // Validate line number
        const totalLines = this.ui.jsonEditor.lineCount();
        if (lineNumber < 0 || lineNumber >= totalLines) {
            console.log('Invalid line number:', lineNumber, 'total lines:', totalLines);
            return;
        }

        try {
            // Add highlight class using both background and wrap methods for better compatibility
            this.ui.jsonEditor.addLineClass(lineNumber, 'background', 'highlighted-line');
            this.ui.jsonEditor.addLineClass(lineNumber, 'wrap', 'highlighted-line');
            
            // Also try using markText as a fallback
            const lineHandle = this.ui.jsonEditor.getLineHandle(lineNumber);
            if (lineHandle) {
                const from = {line: lineNumber, ch: 0};
                const to = {line: lineNumber, ch: this.ui.jsonEditor.getLine(lineNumber).length};
                
                // Clear previous text marks
                if (this.ui.highlightedTextMark) {
                    this.ui.highlightedTextMark.clear();
                }
                
                this.ui.highlightedTextMark = this.ui.jsonEditor.markText(from, to, {
                    className: 'highlighted-line-text'
                });
            }
            
            // Scroll to the line
            this.ui.jsonEditor.scrollIntoView({line: lineNumber, ch: 0});
            
            // Store the highlighted line for later clearing
            this.ui.highlightedLineNumber = lineNumber;
            
            console.log('Line highlighted successfully:', lineNumber);
        } catch (error) {
            console.error('Error highlighting line:', error);
        }
    }

    /**
     * Clear line highlights (for tree mode)
     */
    clearLineHighlights() {
        if (!this.ui.jsonEditor) return;

        try {
            if (this.ui.highlightedLineNumber !== undefined) {
                this.ui.jsonEditor.removeLineClass(this.ui.highlightedLineNumber, 'background', 'highlighted-line');
                this.ui.jsonEditor.removeLineClass(this.ui.highlightedLineNumber, 'wrap', 'highlighted-line');
                this.ui.highlightedLineNumber = undefined;
            }
            
            if (this.ui.highlightedTextMark) {
                this.ui.highlightedTextMark.clear();
                this.ui.highlightedTextMark = undefined;
            }
        } catch (error) {
            console.error('Error clearing line highlights:', error);
        }
    }
}
