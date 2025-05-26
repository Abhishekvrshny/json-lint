/**
 * Format Manager - Handles JSON formatting and validation
 */

class FormatManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.isCompressed = false;
    }

    /**
     * Format JSON content
     */
    formatJSON() {
        const content = this.ui.getValue();
        if (!content.trim()) {
            this.ui.showToast('Please enter some JSON to format', 'warning');
            return;
        }

        const linter = new JSONLinter();
        const result = linter.validate(content);

        if (result.isValid) {
            try {
                const formatted = this.isCompressed 
                    ? JSON.stringify(result.data)
                    : JSON.stringify(result.data, null, 2);
                
                this.ui.setValue(formatted);
                this.ui.updateStatus('JSON formatted successfully', 'success');
                this.ui.showToast('JSON formatted successfully');
            } catch (error) {
                this.ui.updateStatus('Format failed', 'error');
                this.ui.showToast('Failed to format JSON', 'error');
            }
        } else {
            this.ui.updateStatus(`Invalid JSON: ${result.errors[0]}`, 'error');
            this.ui.showErrors(result.errors);
        }

        this.ui.updateStats();
    }

    /**
     * Validate JSON content
     */
    validateJSON() {
        const content = this.ui.getValue();
        
        if (!content.trim()) {
            this.ui.updateStatus('Enter JSON to validate', '');
            return;
        }

        // Only validate if current format is JSON
        if (this.ui.currentFormat !== 'json') {
            this.ui.updateStatus(`Content is in ${this.ui.currentFormat.toUpperCase()} format`, 'success');
            this.ui.updateStats();
            return;
        }

        const linter = new JSONLinter();
        const result = linter.validate(content);

        if (result.isValid) {
            this.ui.updateStatus('JSON is valid', 'success');
            this.ui.editorManager.clearErrorHighlights();
        } else {
            this.ui.updateStatus(`Invalid JSON: ${result.errors[0]}`, 'error');
            this.ui.showErrors(result.errors);
            this.ui.editorManager.highlightErrorLine(result.errors[0]);
        }

        this.ui.updateStats();
    }

    /**
     * Toggle compression mode
     */
    toggleCompression() {
        this.isCompressed = !this.isCompressed;
        
        // If there's content, reformat it with the new compression setting
        const content = this.ui.getValue();
        if (content.trim()) {
            this.formatJSON();
        }
    }

    /**
     * Load sample JSON
     */
    loadSampleJSON() {
        const sampleJSON = {
            "name": "John Doe",
            "age": 30,
            "email": "john.doe@example.com",
            "address": {
                "street": "123 Main St",
                "city": "New York",
                "zipCode": "10001",
                "country": "USA"
            },
            "hobbies": [
                "reading",
                "swimming",
                "coding"
            ],
            "isActive": true,
            "balance": 1250.75,
            "lastLogin": "2025-05-25T10:30:00Z",
            "preferences": {
                "theme": "dark",
                "notifications": {
                    "email": true,
                    "push": false,
                    "sms": true
                },
                "privacy": {
                    "profileVisible": true,
                    "dataSharing": false
                }
            }
        };

        const formatted = JSON.stringify(sampleJSON, null, 2);
        this.ui.setValue(formatted);
        this.ui.updateStatus('Sample JSON loaded', 'success');
        this.ui.showToast('Sample JSON loaded');
        this.ui.updateStats();
    }

    /**
     * Clear input
     */
    clearInput() {
        this.ui.setValue('');
        this.ui.updateStatus('Ready', '');
        this.ui.hideErrorPanel();
        this.ui.updateStats();
        this.ui.showToast('Input cleared');
        
        // Reset format tracking
        this.ui.currentFormat = 'json';
        this.ui.originalContent = '';
        
        // Hide undo button
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.classList.add('hidden');
        }
        
        // Reset and re-enable dropdown
        const dropdown = document.getElementById('convertDropdown');
        if (dropdown) {
            dropdown.value = '';
            dropdown.disabled = false;
        }
        
        // Reset editor mode
        if (this.ui.editorManager) {
            this.ui.editorManager.setMode('json');
        }
    }
}
