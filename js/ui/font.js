/**
 * Font Manager - Handles font size controls
 */

class FontManager {
    constructor(uiManager) {
        this.ui = uiManager;
    }

    /**
     * Initialize font size from localStorage
     */
    initialize() {
        const savedFontSize = localStorage.getItem('json-lint-font-size');
        if (savedFontSize) {
            this.ui.fontSize = parseInt(savedFontSize, 10);
        }
    }

    /**
     * Increase font size
     */
    increaseFontSize() {
        if (this.ui.fontSize < this.ui.maxFontSize) {
            this.ui.fontSize += 2;
            this.updateFontSize();
        }
    }

    /**
     * Decrease font size
     */
    decreaseFontSize() {
        if (this.ui.fontSize > this.ui.minFontSize) {
            this.ui.fontSize -= 2;
            this.updateFontSize();
        }
    }

    /**
     * Update font size in editor and save to localStorage
     */
    updateFontSize() {
        if (this.ui.editorManager) {
            this.ui.editorManager.updateFontSize();
        }
        localStorage.setItem('json-lint-font-size', this.ui.fontSize.toString());
    }
}
