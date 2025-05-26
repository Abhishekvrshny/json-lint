/**
 * Conversion Manager - Handles format conversion between JSON, YAML, TOML, XML
 */

class ConversionManager {
    constructor(uiManager) {
        this.ui = uiManager;
    }

    /**
     * Handle format conversion
     */
    handleConversion(targetFormat) {
        if (!targetFormat) return;

        const content = this.ui.getValue();
        if (!content.trim()) {
            this.ui.showToast('Please enter content to convert', 'warning');
            return;
        }

        // Disable tree mode when converting to any other format
        if (this.ui.treeMode) {
            this.ui.treeManager.toggleTreeMode();
            // Update the tree mode toggle checkbox to reflect the disabled state
            const treeModeToggle = document.getElementById('treeModeToggle');
            if (treeModeToggle) {
                treeModeToggle.checked = false;
            }
        }

        // Store original content for undo functionality
        if (this.ui.currentFormat === 'json') {
            this.ui.originalContent = content;
        }

        try {
            let convertedContent;
            let sourceData;

            // Parse the current content based on current format
            if (this.ui.currentFormat === 'json') {
                // Validate JSON before conversion
                const linter = new JSONLinter();
                const validationResult = linter.validate(content);
                
                if (!validationResult.isValid) {
                    this.ui.showToast('Cannot convert invalid JSON. Please fix validation errors first.', 'error');
                    this.ui.updateStatus(`Invalid JSON: ${validationResult.errors[0]}`, 'error');
                    return;
                }
                
                sourceData = validationResult.data;
            } else if (this.ui.currentFormat === 'yaml') {
                sourceData = jsyaml.load(content);
            } else if (this.ui.currentFormat === 'toml') {
                sourceData = TOML.parse(content);
            } else if (this.ui.currentFormat === 'xml') {
                // For XML, we need a simple parser or convert back to JSON first
                this.ui.showToast('XML to other format conversion not fully supported', 'warning');
                return;
            }

            // Convert to target format
            switch (targetFormat) {
                case 'yaml':
                    convertedContent = jsyaml.dump(sourceData, {
                        indent: 2,
                        lineWidth: -1,
                        noRefs: true,
                        sortKeys: false
                    });
                    break;

                case 'toml':
                    // Use the correct method name for @iarna/toml library
                    if (typeof TOML !== 'undefined' && TOML.stringify) {
                        convertedContent = TOML.stringify(sourceData);
                    } else if (typeof toml !== 'undefined' && toml.stringify) {
                        convertedContent = toml.stringify(sourceData);
                    } else {
                        // Fallback to the JSONLinter's TOML converter
                        const linter = new JSONLinter();
                        const result = linter.convertToTOML(JSON.stringify(sourceData));
                        if (result.success) {
                            convertedContent = result.converted;
                        } else {
                            throw new Error('TOML conversion failed: ' + (result.errors ? result.errors[0] : 'Unknown error'));
                        }
                    }
                    break;

                case 'xml':
                    convertedContent = this.jsonToXml(sourceData);
                    break;

                default:
                    this.ui.showToast('Unsupported conversion format', 'error');
                    return;
            }

            // Update editor content and mode
            this.ui.setValue(convertedContent);
            this.ui.editorManager.setMode(targetFormat);
            this.ui.currentFormat = targetFormat;

            // Show undo button
            const undoBtn = document.getElementById('undoBtn');
            if (undoBtn) {
                undoBtn.classList.remove('hidden');
            }

            // Disable dropdown when not in JSON format
            const dropdown = document.getElementById('convertDropdown');
            if (dropdown) {
                dropdown.disabled = true;
                dropdown.value = '';
            }

            this.ui.updateStatus(`Converted to ${targetFormat.toUpperCase()}`, 'success');
            this.ui.showToast(`Successfully converted to ${targetFormat.toUpperCase()}`);

        } catch (error) {
            console.error('Conversion error:', error);
            this.ui.updateStatus(`Conversion failed: ${error.message}`, 'error');
            this.ui.showToast(`Failed to convert: ${error.message}`, 'error');
            
            // Reset dropdown
            const dropdown = document.getElementById('convertDropdown');
            if (dropdown) {
                dropdown.value = '';
            }
        }
    }

    /**
     * Convert JSON object to XML string
     */
    jsonToXml(obj, rootName = 'root') {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>`;
        
        const convertValue = (value, key) => {
            if (value === null) {
                return `<${key} xsi:nil="true"/>`;
            } else if (typeof value === 'object') {
                if (Array.isArray(value)) {
                    return value.map(item => `<${key}>${convertValue(item, 'item')}</${key}>`).join('');
                } else {
                    let result = `<${key}>`;
                    for (const [subKey, subValue] of Object.entries(value)) {
                        result += convertValue(subValue, subKey);
                    }
                    result += `</${key}>`;
                    return result;
                }
            } else {
                return `<${key}>${String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${key}>`;
            }
        };

        for (const [key, value] of Object.entries(obj)) {
            xml += convertValue(value, key);
        }
        
        xml += `</${rootName}>`;
        return xml;
    }

    /**
     * Undo conversion back to original JSON
     */
    undoConversion() {
        if (this.ui.originalContent) {
            // Disable tree mode when converting back to JSON
            if (this.ui.treeMode) {
                this.ui.treeManager.toggleTreeMode();
                // Update the tree mode toggle checkbox to reflect the disabled state
                const treeModeToggle = document.getElementById('treeModeToggle');
                if (treeModeToggle) {
                    treeModeToggle.checked = false;
                }
            }
            
            this.ui.setValue(this.ui.originalContent);
            this.ui.editorManager.setMode('json');
            this.ui.currentFormat = 'json';
            
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
            
            this.ui.updateStatus('Reverted to original JSON', 'success');
            this.ui.showToast('Reverted to original JSON');
        }
    }

    /**
     * Copy content to clipboard
     */
    async copyToClipboard() {
        const content = this.ui.getValue();
        if (!content.trim()) {
            this.ui.showToast('Nothing to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(content);
            this.ui.showToast('Copied to clipboard');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.ui.showToast('Copied to clipboard');
        }
    }

    /**
     * Download content as file
     */
    downloadFile() {
        const content = this.ui.getValue();
        if (!content.trim()) {
            this.ui.showToast('Nothing to download', 'warning');
            return;
        }

        const format = this.ui.currentFormat;
        const filename = `data.${format}`;
        const mimeType = this.getMimeType(format);

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.ui.showToast(`Downloaded as ${filename}`);
    }

    /**
     * Get MIME type for format
     */
    getMimeType(format) {
        const mimeTypes = {
            'json': 'application/json',
            'yaml': 'text/yaml',
            'toml': 'text/plain',
            'xml': 'application/xml'
        };
        return mimeTypes[format] || 'text/plain';
    }
}
