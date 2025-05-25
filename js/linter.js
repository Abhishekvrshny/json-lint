/**
 * JSON Linter - Core functionality for JSON validation and formatting
 */

class JSONLinter {
    constructor() {
        this.isValid = false;
        this.errors = [];
        this.formatted = '';
    }

    /**
     * Validate JSON string using jsonlint library for better error reporting
     * @param {string} jsonString - The JSON string to validate
     * @returns {Object} - Validation result with isValid, errors, and data
     */
    validate(jsonString) {
        this.reset();
        
        if (!jsonString || jsonString.trim() === '') {
            return {
                isValid: false,
                errors: ['Input is empty'],
                data: null
            };
        }

        try {
            // First try with jsonlint for better error messages
            if (typeof jsonlint !== 'undefined') {
                const result = jsonlint.parse(jsonString);
                this.isValid = true;
                return {
                    isValid: true,
                    errors: [],
                    data: result
                };
            } else {
                // Fallback to native JSON.parse
                const result = JSON.parse(jsonString);
                this.isValid = true;
                return {
                    isValid: true,
                    errors: [],
                    data: result
                };
            }
        } catch (error) {
            this.isValid = false;
            const errorMessage = this.parseError(error, jsonString);
            this.errors = [errorMessage];
            
            return {
                isValid: false,
                errors: this.errors,
                data: null
            };
        }
    }

    /**
     * Format JSON with proper indentation
     */
    format(jsonString, indent = 2) {
        try {
            if (!jsonString || !jsonString.trim()) {
                return {
                    success: false,
                    errors: ['Input is empty']
                };
            }

            const parsed = JSON.parse(jsonString);
            const formatted = JSON.stringify(parsed, null, indent);
            
            return {
                success: true,
                formatted: formatted,
                errors: []
            };
        } catch (error) {
            return {
                success: false,
                errors: [this.formatError(error)],
                formatted: null
            };
        }
    }

    /**
     * Compress/minify JSON by removing whitespace
     */
    compress(jsonString) {
        try {
            if (!jsonString || !jsonString.trim()) {
                return {
                    success: false,
                    errors: ['Input is empty']
                };
            }

            const parsed = JSON.parse(jsonString);
            const compressed = JSON.stringify(parsed);
            
            return {
                success: true,
                compressed: compressed,
                errors: []
            };
        } catch (error) {
            return {
                success: false,
                errors: [this.formatError(error)],
                compressed: null
            };
        }
    }

    /**
     * Parse and format error messages for better user experience
     * @param {Error} error - The error object
     * @param {string} jsonString - The original JSON string
     * @returns {string} - Formatted error message
     */
    parseError(error, jsonString) {
        let message = error.message;
        
        // Extract line and column information if available
        const lineMatch = message.match(/line (\d+)/i);
        const columnMatch = message.match(/column (\d+)/i);
        const positionMatch = message.match(/position (\d+)/i);
        
        if (lineMatch || columnMatch || positionMatch) {
            const line = lineMatch ? parseInt(lineMatch[1]) : null;
            const column = columnMatch ? parseInt(columnMatch[1]) : null;
            const position = positionMatch ? parseInt(positionMatch[1]) : null;
            
            let location = '';
            if (line && column) {
                location = ` at line ${line}, column ${column}`;
            } else if (line) {
                location = ` at line ${line}`;
            } else if (position) {
                const lineNumber = this.getLineFromPosition(jsonString, position);
                location = ` at line ${lineNumber}`;
            }
            
            return `${message}${location}`;
        }
        
        return message;
    }

    /**
     * Format error for consistent display
     */
    formatError(error) {
        return error.message || 'Unknown error occurred';
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
     * Get JSON statistics
     * @param {string} jsonString - The JSON string to analyze
     * @returns {Object} - Statistics about the JSON
     */
    getStats(jsonString) {
        if (!jsonString || jsonString.trim() === '') {
            return {
                size: 0,
                sizeFormatted: '0 Bytes',
                characters: 0,
                lines: 0,
                valid: false
            };
        }

        const lines = jsonString.split('\n').length;
        const characters = jsonString.length;
        const bytes = new Blob([jsonString]).size;
        
        return {
            size: bytes,
            sizeFormatted: this.formatBytes(bytes),
            characters: characters,
            lines: lines,
            valid: this.validate(jsonString).isValid
        };
    }

    /**
     * Get the type of JSON data
     * @param {*} data - The parsed JSON data
     * @returns {string} - Type description
     */
    getJSONType(data) {
        if (data === null) return 'null';
        if (Array.isArray(data)) return 'array';
        if (typeof data === 'object') return 'object';
        if (typeof data === 'string') return 'string';
        if (typeof data === 'number') return 'number';
        if (typeof data === 'boolean') return 'boolean';
        return 'unknown';
    }

    /**
     * Calculate maximum depth of nested JSON
     * @param {*} obj - The JSON object to analyze
     * @returns {number} - Maximum depth
     */
    getMaxDepth(obj) {
        if (obj === null || typeof obj !== 'object') {
            return 0;
        }
        
        let maxDepth = 0;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const depth = this.getMaxDepth(obj[key]);
                maxDepth = Math.max(maxDepth, depth);
            }
        }
        
        return maxDepth + 1;
    }

    /**
     * Format bytes to human readable format
     * @param {number} bytes - Number of bytes
     * @returns {string} - Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Reset internal state
     */
    reset() {
        this.isValid = false;
        this.errors = [];
        this.formatted = '';
    }

    /**
     * Generate sample JSON for testing
     * @returns {string} - Sample JSON string
     */
    static getSampleJSON() {
        return JSON.stringify({
            "name": "John Doe",
            "age": 30,
            "email": "john.doe@example.com",
            "address": {
                "street": "123 Main St",
                "city": "New York",
                "zipCode": "10001",
                "country": "USA"
            },
            "hobbies": ["reading", "swimming", "coding"],
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
                    "showEmail": false
                }
            },
            "metadata": null
        }, null, 2);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JSONLinter;
}
