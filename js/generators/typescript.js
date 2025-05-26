/**
 * TypeScript Type Generator
 */

class TypeScriptGenerator {
    constructor() {
        this.interfaceNames = new Set();
        this.generatedInterfaces = [];
    }

    /**
     * Generate TypeScript interfaces from JSON data
     */
    generate(jsonData, rootName = 'Root') {
        this.interfaceNames.clear();
        this.generatedInterfaces = [];
        
        this.generateInterface(jsonData, rootName);
        
        return this.generatedInterfaces.join('\n\n');
    }

    /**
     * Generate a single interface
     */
    generateInterface(data, interfaceName) {
        if (this.interfaceNames.has(interfaceName)) {
            return interfaceName;
        }

        this.interfaceNames.add(interfaceName);
        
        const properties = [];
        
        if (Array.isArray(data)) {
            // Handle arrays - get the type of array elements
            if (data.length > 0) {
                const elementType = this.getTypeFromValue(data[0], `${interfaceName}Item`);
                return `${elementType}[]`;
            }
            return 'any[]';
        }
        
        if (typeof data === 'object' && data !== null) {
            for (const [key, value] of Object.entries(data)) {
                const type = this.getTypeFromValue(value, this.capitalize(key));
                const optional = this.shouldBeOptional(value) ? '?' : '';
                properties.push(`  ${key}${optional}: ${type};`);
            }
        }

        const interfaceCode = `export interface ${interfaceName} {\n${properties.join('\n')}\n}`;
        this.generatedInterfaces.push(interfaceCode);
        
        return interfaceName;
    }

    /**
     * Get TypeScript type from a value
     */
    getTypeFromValue(value, suggestedName) {
        if (value === null) {
            return 'null';
        }
        
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return 'any[]';
            }
            
            // Check if all elements have the same type
            const firstElementType = this.getTypeFromValue(value[0], `${suggestedName}Item`);
            const allSameType = value.every(item => 
                this.getTypeFromValue(item, `${suggestedName}Item`) === firstElementType
            );
            
            if (allSameType) {
                return `${firstElementType}[]`;
            } else {
                // Mixed types in array
                const types = [...new Set(value.map(item => this.getTypeFromValue(item, `${suggestedName}Item`)))];
                return `(${types.join(' | ')})[]`;
            }
        }
        
        if (typeof value === 'object') {
            return this.generateInterface(value, suggestedName);
        }
        
        if (typeof value === 'string') {
            return 'string';
        }
        
        if (typeof value === 'number') {
            return 'number';
        }
        
        if (typeof value === 'boolean') {
            return 'boolean';
        }
        
        return 'any';
    }

    /**
     * Determine if a property should be optional
     */
    shouldBeOptional(value) {
        return value === null || value === undefined;
    }

    /**
     * Capitalize first letter of a string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

/**
 * TypeScript Combined Generator - generates all interfaces in a single type
 */
class TypeScriptCombinedGenerator extends TypeScriptGenerator {
    generate(jsonData, rootName = 'Root') {
        this.interfaceNames.clear();
        this.generatedInterfaces = [];
        
        this.generateInterface(jsonData, rootName);
        
        // Combine all interfaces into a single string
        return this.generatedInterfaces.join('\n\n');
    }
}
