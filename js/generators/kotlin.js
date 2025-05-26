/**
 * Kotlin Data Class Generator
 */

class KotlinGenerator {
    constructor() {
        this.classNames = new Set();
        this.generatedClasses = [];
    }

    /**
     * Generate Kotlin data classes from JSON data
     */
    generate(jsonData, rootName = 'Root') {
        this.classNames.clear();
        this.generatedClasses = [];
        
        this.generateDataClass(jsonData, rootName);
        
        return this.generatedClasses.join('\n\n');
    }

    /**
     * Generate a single data class
     */
    generateDataClass(data, className) {
        if (this.classNames.has(className)) {
            return className;
        }

        this.classNames.add(className);
        
        const properties = [];
        
        if (Array.isArray(data)) {
            // Handle arrays - get the type of array elements
            if (data.length > 0) {
                const elementType = this.getTypeFromValue(data[0], `${className}Item`);
                return `List<${elementType}>`;
            }
            return 'List<Any>';
        }
        
        if (typeof data === 'object' && data !== null) {
            for (const [key, value] of Object.entries(data)) {
                const kotlinType = this.getTypeFromValue(value, this.capitalize(key));
                const nullable = this.shouldBeNullable(value) ? '?' : '';
                const annotation = this.getSerialNameAnnotation(key);
                properties.push(`    ${annotation}val ${key}: ${kotlinType}${nullable}`);
            }
        }

        const classCode = `@Serializable\ndata class ${className}(\n${properties.join(',\n')}\n)`;
        this.generatedClasses.push(classCode);
        
        return className;
    }

    /**
     * Get Kotlin type from a value
     */
    getTypeFromValue(value, suggestedName) {
        if (value === null) {
            return 'Any';
        }
        
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return 'List<Any>';
            }
            
            // Get type of first element
            const elementType = this.getTypeFromValue(value[0], `${suggestedName}Item`);
            return `List<${elementType}>`;
        }
        
        if (typeof value === 'object') {
            return this.generateDataClass(value, suggestedName);
        }
        
        if (typeof value === 'string') {
            return 'String';
        }
        
        if (typeof value === 'number') {
            // Check if it's an integer or float
            if (Number.isInteger(value)) {
                return 'Int';
            }
            return 'Double';
        }
        
        if (typeof value === 'boolean') {
            return 'Boolean';
        }
        
        return 'Any';
    }

    /**
     * Generate SerialName annotation for property
     */
    getSerialNameAnnotation(key) {
        // Only add SerialName if the key contains special characters or starts with uppercase
        if (key.includes('_') || key.includes('-') || /^[A-Z]/.test(key)) {
            return `@SerialName("${key}") `;
        }
        return '';
    }

    /**
     * Determine if a property should be nullable
     */
    shouldBeNullable(value) {
        return value === null || value === undefined;
    }

    /**
     * Capitalize first letter of a string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
