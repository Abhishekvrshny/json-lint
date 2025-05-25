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
     * Format/prettify JSON string
     * @param {string} jsonString - The JSON string to format
     * @param {number} indent - Number of spaces for indentation (default: 2)
     * @returns {Object} - Formatting result
     */
    format(jsonString, indent = 2) {
        const validation = this.validate(jsonString);
        
        if (!validation.isValid) {
            return {
                success: false,
                formatted: '',
                errors: validation.errors
            };
        }

        try {
            this.formatted = JSON.stringify(validation.data, null, indent);
            return {
                success: true,
                formatted: this.formatted,
                errors: []
            };
        } catch (error) {
            return {
                success: false,
                formatted: '',
                errors: [`Formatting error: ${error.message}`]
            };
        }
    }

    /**
     * Minify JSON string (remove all unnecessary whitespace)
     * @param {string} jsonString - The JSON string to minify
     * @returns {Object} - Minification result
     */
    minify(jsonString) {
        const validation = this.validate(jsonString);
        
        if (!validation.isValid) {
            return {
                success: false,
                minified: '',
                errors: validation.errors
            };
        }

        try {
            const minified = JSON.stringify(validation.data);
            return {
                success: true,
                minified: minified,
                errors: []
            };
        } catch (error) {
            return {
                success: false,
                minified: '',
                errors: [`Minification error: ${error.message}`]
            };
        }
    }

    /**
     * Get JSON statistics
     * @param {string} jsonString - The JSON string to analyze
     * @returns {Object} - Statistics about the JSON
     */
    getStats(jsonString) {
        const validation = this.validate(jsonString);
        
        if (!validation.isValid) {
            return {
                size: jsonString.length,
                sizeFormatted: this.formatBytes(jsonString.length),
                characters: jsonString.length,
                lines: jsonString.split('\n').length,
                valid: false
            };
        }

        const formatted = this.format(jsonString);
        const minified = this.minify(jsonString);
        
        return {
            size: jsonString.length,
            sizeFormatted: this.formatBytes(jsonString.length),
            characters: jsonString.length,
            lines: jsonString.split('\n').length,
            formattedSize: formatted.success ? formatted.formatted.length : 0,
            minifiedSize: minified.success ? minified.minified.length : 0,
            valid: true,
            type: this.getJSONType(validation.data),
            depth: this.getMaxDepth(validation.data)
        };
    }

    /**
     * Parse error message to provide better user feedback
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
            } else if (position) {
                const lines = jsonString.substring(0, position).split('\n');
                const lineNum = lines.length;
                const colNum = lines[lines.length - 1].length + 1;
                location = ` at line ${lineNum}, column ${colNum}`;
            }
            
            return `${message}${location}`;
        }
        
        return message;
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
