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
     * Parse and format error messages from json-parse-better-errors
     * @param {Error} error - The error object from json-parse-better-errors
     * @param {string} jsonString - The original JSON string
     * @returns {string} - Formatted error message
     */
    parseBetterError(error, jsonString) {
        let message = error.message;
        
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
     * Get statistics about the JSON content
     * @param {string} jsonString - The JSON string to analyze
     * @returns {Object} Statistics object
     */
    getStats(jsonString) {
        const stats = {
            size: jsonString.length,
            sizeFormatted: this.formatBytes(jsonString.length),
            lines: jsonString.split('\n').length,
            characters: jsonString.length
        };

        try {
            const parsed = JSON.parse(jsonString);
            stats.keys = this.countKeys(parsed);
            stats.depth = this.getDepth(parsed);
        } catch (error) {
            stats.keys = 0;
            stats.depth = 0;
        }

        return stats;
    }

    /**
     * Convert JSON to YAML format
     * @param {string} jsonString - The JSON string to convert
     * @returns {Object} Result object with success status and converted content or errors
     */
    convertToYAML(jsonString) {
        // Use our validate method for consistent error handling
        const validationResult = this.validate(jsonString);
        if (!validationResult.isValid) {
            return {
                success: false,
                errors: validationResult.errors
            };
        }

        try {
            const jsonData = validationResult.data;
            
            // Check if js-yaml library is available
            if (typeof jsyaml !== 'undefined') {
                const yamlString = jsyaml.dump(jsonData, {
                    indent: 2,
                    lineWidth: -1,
                    noRefs: true,
                    sortKeys: false
                });
                return {
                    success: true,
                    converted: yamlString
                };
            } else {
                // Fallback to simple YAML converter
                const yamlString = this.simpleYAMLConverter(jsonData);
                return {
                    success: true,
                    converted: yamlString
                };
            }
        } catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Convert JSON to TOML format
     * @param {string} jsonString - The JSON string to convert
     * @returns {Object} Result object with success status and converted content or errors
     */
    convertToTOML(jsonString) {
        // Use our validate method for consistent error handling
        const validationResult = this.validate(jsonString);
        if (!validationResult.isValid) {
            return {
                success: false,
                errors: validationResult.errors
            };
        }

        try {
            const jsonData = validationResult.data;
            
            // Check if TOML library is available
            if (typeof TOML !== 'undefined' && TOML.stringify) {
                const tomlString = TOML.stringify(jsonData);
                return {
                    success: true,
                    converted: tomlString
                };
            } else {
                // Fallback to simple TOML converter
                const tomlString = this.simpleTOMLConverter(jsonData);
                return {
                    success: true,
                    converted: tomlString
                };
            }
        } catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Convert JSON to CSV format
     * @param {string} jsonString - The JSON string to convert
     * @returns {Object} Result object with success status and converted content or errors
     */
    convertToCSV(jsonString) {
        // Use our validate method for consistent error handling
        const validationResult = this.validate(jsonString);
        if (!validationResult.isValid) {
            return {
                success: false,
                errors: validationResult.errors
            };
        }

        try {
            const jsonData = validationResult.data;
            
            // Check if Papa Parse library is available
            if (typeof Papa !== 'undefined') {
                if (Array.isArray(jsonData) && jsonData.length > 0 && typeof jsonData[0] === 'object') {
                    const csvString = Papa.unparse(jsonData);
                    return {
                        success: true,
                        converted: csvString
                    };
                } else {
                    return {
                        success: false,
                        errors: ['CSV conversion requires an array of objects']
                    };
                }
            } else {
                // Fallback to simple CSV converter
                const csvString = this.simpleCSVConverter(jsonData);
                return {
                    success: true,
                    converted: csvString
                };
            }
        } catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Convert JSON to XML format
     * @param {string} jsonString - The JSON string to convert
     * @returns {Object} Result object with success status and converted content or errors
     */
    convertToXML(jsonString) {
        // Use our validate method for consistent error handling
        const validationResult = this.validate(jsonString);
        if (!validationResult.isValid) {
            return {
                success: false,
                errors: validationResult.errors
            };
        }

        try {
            const jsonData = validationResult.data;
            const xmlString = this.simpleXMLConverter(jsonData);
            return {
                success: true,
                converted: xmlString
            };
        } catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Simple YAML converter (fallback implementation)
     * @param {*} obj - The object to convert
     * @param {number} indent - Current indentation level
     * @returns {string} YAML string
     */
    simpleYAMLConverter(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        let yaml = '';
        
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    yaml += spaces + '-\n' + this.simpleYAMLConverter(item, indent + 1);
                } else {
                    yaml += spaces + '- ' + (typeof item === 'string' ? `"${item}"` : item) + '\n';
                }
            });
        } else if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                if (typeof value === 'object' && value !== null) {
                    yaml += spaces + key + ':\n' + this.simpleYAMLConverter(value, indent + 1);
                } else {
                    yaml += spaces + key + ': ' + (typeof value === 'string' ? `"${value}"` : value) + '\n';
                }
            });
        }
        
        return yaml;
    }

    /**
     * Simple TOML converter (fallback implementation)
     * @param {*} obj - The object to convert
     * @returns {string} TOML string
     */
    simpleTOMLConverter(obj) {
        let toml = '';
        
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    toml += `\n[${key}]\n`;
                    Object.keys(value).forEach(subKey => {
                        const subValue = value[subKey];
                        if (typeof subValue !== 'object') {
                            toml += `${subKey} = ${typeof subValue === 'string' ? `"${subValue}"` : subValue}\n`;
                        }
                    });
                } else if (Array.isArray(value)) {
                    toml += `${key} = [${value.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ')}]\n`;
                } else {
                    toml += `${key} = ${typeof value === 'string' ? `"${value}"` : value}\n`;
                }
            });
        } else {
            toml = 'TOML conversion requires a top-level object';
        }
        
        return toml;
    }

    /**
     * Simple CSV converter (fallback implementation)
     * @param {*} obj - The object to convert
     * @returns {string} CSV string
     */
    simpleCSVConverter(obj) {
        if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') {
            const headers = Object.keys(obj[0]);
            let csv = headers.join(',') + '\n';
            
            obj.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' ? `"${value}"` : value;
                });
                csv += values.join(',') + '\n';
            });
            
            return csv;
        } else {
            return 'CSV conversion only supports arrays of objects';
        }
    }

    /**
     * Simple XML converter
     * @param {*} obj - The object to convert
     * @param {string} rootName - Root element name
     * @returns {string} XML string
     */
    simpleXMLConverter(obj, rootName = 'root') {
        function objectToXML(obj, indent = 0) {
            const spaces = '  '.repeat(indent);
            let xml = '';
            
            if (Array.isArray(obj)) {
                obj.forEach((item, index) => {
                    xml += spaces + `<item${index}>\n`;
                    if (typeof item === 'object' && item !== null) {
                        xml += objectToXML(item, indent + 1);
                    } else {
                        xml += spaces + '  ' + item + '\n';
                    }
                    xml += spaces + `</item${index}>\n`;
                });
            } else if (typeof obj === 'object' && obj !== null) {
                Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    xml += spaces + `<${key}>\n`;
                    if (typeof value === 'object' && value !== null) {
                        xml += objectToXML(value, indent + 1);
                    } else {
                        xml += spaces + '  ' + value + '\n';
                    }
                    xml += spaces + `</${key}>\n`;
                });
            }
            
            return xml;
        }
        
        return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${objectToXML(obj, 1)}</${rootName}>`;
    }

    /**
     * Format error for consistent display
     */
    formatError(error) {
        return error.message || 'Unknown error occurred';
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
     * Count keys in an object recursively
     * @param {*} obj - The object to count keys in
     * @returns {number} - Total number of keys
     */
    countKeys(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return 0;
        }
        
        let count = 0;
        if (Array.isArray(obj)) {
            count = obj.length;
            obj.forEach(item => {
                count += this.countKeys(item);
            });
        } else {
            count = Object.keys(obj).length;
            Object.values(obj).forEach(value => {
                count += this.countKeys(value);
            });
        }
        
        return count;
    }

    /**
     * Get the depth of nested objects
     * @param {*} obj - The object to analyze
     * @returns {number} - Maximum depth
     */
    getDepth(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return 0;
        }
        
        let maxDepth = 0;
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                const depth = this.getDepth(item);
                maxDepth = Math.max(maxDepth, depth);
            });
        } else {
            Object.values(obj).forEach(value => {
                const depth = this.getDepth(value);
                maxDepth = Math.max(maxDepth, depth);
            });
        }
        
        return maxDepth + 1;
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
