/**
 * Event Manager - Handles all UI event bindings
 */

class EventManager {
    constructor(uiManager) {
        this.ui = uiManager;
    }

    /**
     * Bind all event listeners to UI elements
     */
    bindEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.ui.themeManager.toggleTheme());
        }

        // Sample JSON button
        const sampleBtn = document.getElementById('sampleBtn');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => this.ui.formatManager.loadSampleJSON());
        }

        // Clear button
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.ui.formatManager.clearInput());
        }

        // Format button
        const formatBtn = document.getElementById('formatBtn');
        if (formatBtn) {
            formatBtn.addEventListener('click', () => this.ui.formatManager.formatJSON());
        }

        // Validate button
        const validateBtn = document.getElementById('validateBtn');
        if (validateBtn) {
            validateBtn.addEventListener('click', () => this.ui.formatManager.validateJSON());
        }

        // Compress toggle checkbox
        const compressToggle = document.getElementById('compressToggle');
        if (compressToggle) {
            console.log('Compress toggle element found, binding event');
            compressToggle.addEventListener('change', (e) => {
                console.log('Compress toggle event fired, checked:', e.target.checked);
                this.ui.formatManager.toggleCompression();
            });
        } else {
            console.error('Compress toggle element not found!');
        }

        // Tree mode toggle checkbox
        const treeModeToggle = document.getElementById('treeModeToggle');
        if (treeModeToggle) {
            console.log('Tree mode toggle element found, binding event');
            treeModeToggle.addEventListener('change', (e) => {
                console.log('Tree mode toggle event fired, checked:', e.target.checked);
                this.ui.treeManager.toggleTreeMode();
            });
        } else {
            console.error('Tree mode toggle element not found!');
        }

        // Copy button
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.ui.conversionManager.copyToClipboard());
        }

        // Download button
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.ui.conversionManager.downloadFile());
        }

        // Font size controls
        const fontSizeIncrease = document.getElementById('fontSizeIncrease');
        if (fontSizeIncrease) {
            fontSizeIncrease.addEventListener('click', () => this.ui.fontManager.increaseFontSize());
        }

        const fontSizeDecrease = document.getElementById('fontSizeDecrease');
        if (fontSizeDecrease) {
            fontSizeDecrease.addEventListener('click', () => this.ui.fontManager.decreaseFontSize());
        }

        // Close error panel
        const closeErrorBtn = document.getElementById('closeErrorBtn');
        if (closeErrorBtn) {
            closeErrorBtn.addEventListener('click', () => this.ui.hideErrorPanel());
        }

        // Conversion dropdown - remove CSV option and handle format switching properly
        const convertDropdown = document.getElementById('convertDropdown');
        if (convertDropdown) {
            // Remove CSV option if it exists
            this.removeCsvOption(convertDropdown);
            convertDropdown.addEventListener('change', (e) => this.ui.conversionManager.handleConversion(e.target.value));
        }

        // Undo button
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.ui.conversionManager.undoConversion());
        }

        // Generate types button
        const generateTypesBtn = document.getElementById('generateTypesBtn');
        if (generateTypesBtn) {
            generateTypesBtn.addEventListener('click', () => this.ui.typeGeneratorManager.showTypeGeneratorModal());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * Remove CSV option from conversion dropdown
     */
    removeCsvOption(dropdown) {
        const csvOption = dropdown.querySelector('option[value="csv"]');
        if (csvOption) {
            csvOption.remove();
        }
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
                    this.ui.formatManager.formatJSON();
                    break;
                case 'l':
                    event.preventDefault();
                    this.ui.formatManager.loadSampleJSON();
                    break;
                case 'k':
                    event.preventDefault();
                    this.ui.formatManager.clearInput();
                    break;
                case 'd':
                    event.preventDefault();
                    this.ui.themeManager.toggleTheme();
                    break;
                case 's':
                    event.preventDefault();
                    this.ui.conversionManager.downloadFile();
                    break;
                case 'c':
                    // Only handle Ctrl+C if not in an input field
                    if (!event.target.matches('input, textarea, [contenteditable]')) {
                        event.preventDefault();
                        this.ui.conversionManager.copyToClipboard();
                    }
                    break;
            }
        }
    }
}
