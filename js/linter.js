/**
 * JSON Linter - Core functionality for JSON validation and formatting
 * Uses json-parse-better-errors library for superior error detection with accurate line numbers
 */

class JSONLinter {
    constructor() {
        this.isValid = false;
        this.errors = [];
        this.formatted = '';
    }

    /**
     * Validate JSON string using json-parse-better-errors library for precise error reporting
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
            // Use json-parse-better-errors for better error reporting if available
            if (typeof JSONParseBetterErrors !== 'undefined') {
                try {
                    const data = JSONParseBetterErrors(jsonString);
                    this.isValid = true;
                    return {
                        isValid: true,
                        errors: [],
                        data: data
                    };
                } catch (betterError) {
                    this.isValid = false;
                    const errorMessage = this.parseBetterError(betterError, jsonString);
                    this.errors = [errorMessage];
                    
                    return {
                        isValid: false,
                        errors: this.errors,
                        data: null
                    };
                }
            } else {
                // Fallback to native JSON.parse with enhanced error parsing
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
     * Parse json-parse-better-errors error for enhanced error messages
     * @param {Error} error - The error object from json-parse-better-errors
     * @param {string} jsonString - The original JSON string
     * @returns {string} - Formatted error message
     */
    parseBetterError(error, jsonString) {
        let message = error.message || 'Parse error';
        
        // json-parse-better-errors provides excellent location information
        if (error.line !== undefined && error.column !== undefined) {
            const line = error.line;
            const column = error.column;
            
            // Get the actual line content for context
            const lines = jsonString.split('\n');
            const lineContent = lines[line - 1] || '';
            const contextStart = Math.max(0, column - 25);
            const contextEnd = Math.min(lineContent.length, column + 25);
            const context = lineContent.substring(contextStart, contextEnd);
            const pointer = ' '.repeat(Math.max(0, column - contextStart - 1)) + '^';
            
            return `Parse error at line ${line}, column ${column}: ${message}\n\nContext:\n${context}\n${pointer}`;
        }
        
        // If we have offset information, convert to line/column
        if (error.offset !== undefined || error.index !== undefined) {
            const position = error.offset || error.index;
            const lineInfo = this.getLineColumnFromPosition(jsonString, position);
            const lines = jsonString.split('\n');
            const lineContent = lines[lineInfo.line - 1] || '';
            const contextStart = Math.max(0, lineInfo.column - 25);
            const contextEnd = Math.min(lineContent.length, lineInfo.column + 25);
            const context = lineContent.substring(contextStart, contextEnd);
            const pointer = ' '.repeat(Math.max(0, lineInfo.column - contextStart - 1)) + '^';
            
            return `Parse error at line ${lineInfo.line}, column ${lineInfo.column}: ${message}\n\nContext:\n${context}\n${pointer}`;
        }
        
        return `Parse error: ${message}`;
    }

    /**
     * Convert character position to line and column numbers
     * @param {string} text - The text content
     * @param {number} position - Character position
     * @returns {Object} - Object with line and column properties
     */
    getLineColumnFromPosition(text, position) {
        if (position <= 0) return { line: 1, column: 1 };
        
        const beforeError = text.substring(0, position);
        const lines = beforeError.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        
        return { line, column };
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

            // Use our validate method to parse the JSON
            const validationResult = this.validate(jsonString);
            if (!validationResult.isValid) {
                return {
                    success: false,
                    errors: validationResult.errors,
                    formatted: null
                };
            }

            const formatted = JSON.stringify(validationResult.data, null, indent);
            
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

            // Use our validate method to parse the JSON
            const validationResult = this.validate(jsonString);
            if (!validationResult.isValid) {
                return {
                    success: false,
                    errors: validationResult.errors,
                    compressed: null
                };
            }

            const compressed = JSON.stringify(validationResult.data);
            
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
     * Parse and format error messages for better user experience (enhanced fallback)
     * @param {Error} error - The error object
     * @param {string} jsonString - The original JSON string
     * @returns {string} - Formatted error message
     */
    parseError(error, jsonString) {
        let message = error.message;
        
        // Extract line and column information from error message
        const lineMatch = message.match(/line (\d+)/i);
        const columnMatch = message.match(/column (\d+)/i);
        const positionMatch = message.match(/position (\d+)/i);
        
        if (lineMatch) {
            const line = parseInt(lineMatch[1]);
            const column = columnMatch ? parseInt(columnMatch[1]) : null;
            
            if (column) {
                return `Parse error on line ${line}, column ${column}: ${message}`;
            } else {
                return `Parse error on line ${line}: ${message}`;
            }
        } else if (positionMatch) {
            const position = parseInt(positionMatch[1]);
            const lineInfo = this.getLineColumnFromPosition(jsonString, position);
            return `Parse error on line ${lineInfo.line}, column ${lineInfo.column}: ${message}`;
        }
        
        // Enhanced parsing for native JSON.parse errors
        const nativeErrorMatch = message.match(/Unexpected token (.+) in JSON at position (\d+)/);
        if (nativeErrorMatch) {
            const token = nativeErrorMatch[1];
            const position = parseInt(nativeErrorMatch[2]);
            const lineInfo = this.getLineColumnFromPosition(jsonString, position);
            const lines = jsonString.split('\n');
            const lineContent = lines[lineInfo.line - 1] || '';
            const contextStart = Math.max(0, lineInfo.column - 25);
            const contextEnd = Math.min(lineContent.length, lineInfo.column + 25);
            const context = lineContent.substring(contextStart, contextEnd);
            const pointer = ' '.repeat(Math.max(0, lineInfo.column - contextStart - 1)) + '^';
            
            return `Parse error at line ${lineInfo.line}, column ${lineInfo.column}: Unexpected token ${token}\n\nContext:\n${context}\n${pointer}`;
        }
        
        // Handle other common JSON.parse error patterns
        const unexpectedEndMatch = message.match(/Unexpected end of JSON input/);
        if (unexpectedEndMatch) {
            const lines = jsonString.split('\n');
            const lastLine = lines.length;
            const lastColumn = lines[lines.length - 1].length + 1;
            
            return `Parse error at line ${lastLine}, column ${lastColumn}: Unexpected end of JSON input (missing closing bracket, brace, or quote?)`;
        }
        
        const unexpectedTokenMatch = message.match(/Unexpected token '(.+)'/);
        if (unexpectedTokenMatch) {
            const token = unexpectedTokenMatch[1];
            const lines = jsonString.split('\n');
            
            // Find the line containing this token
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const tokenIndex = line.indexOf(token);
                
                if (tokenIndex !== -1) {
                    const contextStart = Math.max(0, tokenIndex - 25);
                    const contextEnd = Math.min(line.length, tokenIndex + 25);
                    const context = line.substring(contextStart, contextEnd);
                    const pointer = ' '.repeat(Math.max(0, tokenIndex - contextStart)) + '^';
                    
                    return `Parse error at line ${i + 1}, column ${tokenIndex + 1}: Unexpected token '${token}'\n\nContext:\n${context}\n${pointer}`;
                }
            }
        }
        
        return `Parse error: ${message}`;
    }

    /**
     * Format error for consistent display
     */
    formatError(error) {
        return error.message || 'Unknown error occurred';
    }

    /**
     * Convert character position to line number (legacy method)
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
