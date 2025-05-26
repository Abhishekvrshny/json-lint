/**
 * Rust Struct Generator
 */

class RustGenerator {
    constructor() {
        this.structNames = new Set();
        this.generatedStructs = [];
    }

    /**
     * Generate Rust structs from JSON data
     */
    generate(jsonData, rootName = 'Root') {
        this.structNames.clear();
        this.generatedStructs = [];
        
        this.generateStruct(jsonData, rootName);
        
        return this.generatedStructs.join('\n\n');
    }

    /**
     * Generate a single struct
     */
    generateStruct(data, structName) {
        if (this.structNames.has(structName)) {
            return structName;
        }

        this.structNames.add(structName);
        
        const fields = [];
        
        if (Array.isArray(data)) {
            // Handle arrays - get the type of array elements
            if (data.length > 0) {
                const elementType = this.getTypeFromValue(data[0], `${structName}Item`);
                return `Vec<${elementType}>`;
            }
            return 'Vec<serde_json::Value>';
        }
        
        if (typeof data === 'object' && data !== null) {
            for (const [key, value] of Object.entries(data)) {
                const rustType = this.getTypeFromValue(value, this.toPascalCase(key));
                const fieldName = this.toSnakeCase(key);
                const serdeAttribute = this.getSerdeAttribute(key, value);
                fields.push(`    ${serdeAttribute}pub ${fieldName}: ${rustType},`);
            }
        }

        const derives = '#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]';
        const structCode = `${derives}\npub struct ${structName} {\n${fields.join('\n')}\n}`;
        this.generatedStructs.push(structCode);
        
        return structName;
    }

    /**
     * Get Rust type from a value
     */
    getTypeFromValue(value, suggestedName) {
        if (value === null) {
            return 'Option<serde_json::Value>';
        }
        
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return 'Vec<serde_json::Value>';
            }
            
            // Get type of first element
            const elementType = this.getTypeFromValue(value[0], `${suggestedName}Item`);
            return `Vec<${elementType}>`;
        }
        
        if (typeof value === 'object') {
            return this.generateStruct(value, suggestedName);
        }
        
        if (typeof value === 'string') {
            return 'String';
        }
        
        if (typeof value === 'number') {
            // Check if it's an integer or float
            if (Number.isInteger(value)) {
                if (value >= -2147483648 && value <= 2147483647) {
                    return 'i32';
                }
                return 'i64';
            }
            return 'f64';
        }
        
        if (typeof value === 'boolean') {
            return 'bool';
        }
        
        return 'serde_json::Value';
    }

    /**
     * Generate serde attribute for field
     */
    getSerdeAttribute(key, value) {
        const snakeKey = this.toSnakeCase(key);
        const attributes = [];
        
        // Add rename attribute if field name differs from JSON key
        if (snakeKey !== key) {
            attributes.push(`rename = "${key}"`);
        }
        
        // Add skip_serializing_if for optional fields
        if (this.shouldBeOptional(value)) {
            attributes.push('skip_serializing_if = "Option::is_none"');
        }
        
        if (attributes.length > 0) {
            return `#[serde(${attributes.join(', ')})]\n    `;
        }
        
        return '';
    }

    /**
     * Determine if a field should be optional
     */
    shouldBeOptional(value) {
        return value === null || value === undefined;
    }

    /**
     * Convert string to snake_case
     */
    toSnakeCase(str) {
        return str
            .replace(/([A-Z])/g, '_$1')
            .toLowerCase()
            .replace(/^_/, '');
    }

    /**
     * Convert string to PascalCase
     */
    toPascalCase(str) {
        return str
            .split(/[-_\s]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }
}
