/**
 * JSON Schema Generator
 */

class JsonSchemaGenerator {
    constructor() {
        this.definitions = new Map();
        this.rootSchema = null;
    }

    /**
     * Generate JSON Schema from JSON data
     */
    generate(jsonData, rootName = 'Root') {
        this.definitions.clear();
        this.rootSchema = null;
        
        const schema = this.generateSchema(jsonData, rootName);
        
        // Create the complete JSON Schema
        const jsonSchema = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": `https://example.com/${rootName.toLowerCase()}.schema.json`,
            "title": rootName,
            "description": `Schema for ${rootName}`,
            ...schema
        };

        // Add definitions if any were created
        if (this.definitions.size > 0) {
            jsonSchema["$defs"] = Object.fromEntries(this.definitions);
        }

        return JSON.stringify(jsonSchema, null, 2);
    }

    /**
     * Generate schema for a value
     */
    generateSchema(data, name = 'Root') {
        if (data === null) {
            return { "type": "null" };
        }
        
        if (Array.isArray(data)) {
            return this.generateArraySchema(data, name);
        }
        
        if (typeof data === 'object') {
            return this.generateObjectSchema(data, name);
        }
        
        if (typeof data === 'string') {
            return { "type": "string" };
        }
        
        if (typeof data === 'number') {
            if (Number.isInteger(data)) {
                return { "type": "integer" };
            }
            return { "type": "number" };
        }
        
        if (typeof data === 'boolean') {
            return { "type": "boolean" };
        }
        
        return {};
    }

    /**
     * Generate schema for an array
     */
    generateArraySchema(data, name) {
        const schema = {
            "type": "array"
        };

        if (data.length === 0) {
            schema.items = {};
            return schema;
        }

        // Analyze all items to determine if they have the same schema
        const itemSchemas = data.map((item, index) => 
            this.generateSchema(item, `${name}Item`)
        );

        // Check if all items have the same type
        const firstType = itemSchemas[0].type;
        const allSameType = itemSchemas.every(schema => schema.type === firstType);

        if (allSameType && firstType !== 'object') {
            schema.items = itemSchemas[0];
        } else if (allSameType && firstType === 'object') {
            // All objects - merge properties to create a comprehensive schema
            schema.items = this.mergeObjectSchemas(itemSchemas);
        } else {
            // Mixed types - use anyOf
            schema.items = {
                "anyOf": itemSchemas
            };
        }

        return schema;
    }

    /**
     * Generate schema for an object
     */
    generateObjectSchema(data, name) {
        const schema = {
            "type": "object",
            "properties": {},
            "required": []
        };

        for (const [key, value] of Object.entries(data)) {
            const propertyName = this.capitalize(key);
            schema.properties[key] = this.generateSchema(value, propertyName);
            
            // Add to required if not null/undefined
            if (value !== null && value !== undefined) {
                schema.required.push(key);
            }
        }

        // Remove required array if empty
        if (schema.required.length === 0) {
            delete schema.required;
        }

        return schema;
    }

    /**
     * Merge multiple object schemas into one
     */
    mergeObjectSchemas(schemas) {
        const merged = {
            "type": "object",
            "properties": {},
            "required": []
        };

        const allProperties = new Set();
        const requiredCounts = new Map();

        // Collect all properties and count required occurrences
        schemas.forEach(schema => {
            if (schema.properties) {
                Object.keys(schema.properties).forEach(prop => {
                    allProperties.add(prop);
                    if (schema.required && schema.required.includes(prop)) {
                        requiredCounts.set(prop, (requiredCounts.get(prop) || 0) + 1);
                    }
                });
            }
        });

        // Merge properties
        allProperties.forEach(prop => {
            const propSchemas = schemas
                .filter(schema => schema.properties && schema.properties[prop])
                .map(schema => schema.properties[prop]);

            if (propSchemas.length === 1) {
                merged.properties[prop] = propSchemas[0];
            } else {
                // Multiple schemas for same property - use anyOf
                merged.properties[prop] = {
                    "anyOf": propSchemas
                };
            }

            // Property is required if it appears in more than half the schemas
            if (requiredCounts.get(prop) > schemas.length / 2) {
                merged.required.push(prop);
            }
        });

        // Remove required array if empty
        if (merged.required.length === 0) {
            delete merged.required;
        }

        return merged;
    }

    /**
     * Capitalize first letter of a string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
