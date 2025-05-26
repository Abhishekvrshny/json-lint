/**
 * Go Struct Generator
 */

class GoGenerator {
    constructor() {
        this.structNames = new Set();
        this.generatedStructs = [];
    }

    /**
     * Generate Go structs from JSON data
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
                return `[]${elementType}`;
            }
            return '[]interface{}';
        }
        
        if (typeof data === 'object' && data !== null) {
            for (const [key, value] of Object.entries(data)) {
                const goType = this.getTypeFromValue(value, this.capitalize(key));
                const fieldName = this.capitalize(key);
                const jsonTag = this.getJsonTag(key, value);
                fields.push(`\t${fieldName} ${goType} ${jsonTag}`);
            }
        }

        const structCode = `type ${structName} struct {\n${fields.join('\n')}\n}`;
        this.generatedStructs.push(structCode);
        
        return structName;
    }

    /**
     * Get Go type from a value
     */
    getTypeFromValue(value, suggestedName) {
        if (value === null) {
            return '*interface{}';
        }
        
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return '[]interface{}';
            }
            
            // Get type of first element
            const elementType = this.getTypeFromValue(value[0], `${suggestedName}Item`);
            return `[]${elementType}`;
        }
        
        if (typeof value === 'object') {
            return this.generateStruct(value, suggestedName);
        }
        
        if (typeof value === 'string') {
            return 'string';
        }
        
        if (typeof value === 'number') {
            // Check if it's an integer or float
            if (Number.isInteger(value)) {
                return 'int';
            }
            return 'float64';
        }
        
        if (typeof value === 'boolean') {
            return 'bool';
        }
        
        return 'interface{}';
    }

    /**
     * Generate JSON tag for struct field
     */
    getJsonTag(key, value) {
        const omitEmpty = this.shouldOmitEmpty(value) ? ',omitempty' : '';
        return `\`json:"${key}${omitEmpty}"\``;
    }

    /**
     * Determine if field should have omitempty tag
     */
    shouldOmitEmpty(value) {
        return value === null || value === undefined || value === '';
    }

    /**
     * Capitalize first letter of a string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
