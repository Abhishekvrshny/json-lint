/**
 * Tree Manager - Handles tree view functionality
 */

class TreeManager {
    constructor(uiManager) {
        this.ui = uiManager;
    }

    /**
     * Toggle tree mode
     */
    toggleTreeMode() {
        console.log('Tree mode toggle called, current state:', this.ui.treeMode);
        this.ui.treeMode = !this.ui.treeMode;
        
        const editorContainer = document.getElementById('editorContainer');
        const editorPanel = document.getElementById('editorPanel');
        const treePanel = document.getElementById('treePanel');
        
        if (this.ui.treeMode) {
            console.log('Enabling tree mode');
            // Enable split view mode
            editorContainer.classList.add('tree-mode');
            editorPanel.classList.remove('hidden');
            treePanel.classList.remove('hidden');
            this.generateTreeView();
        } else {
            console.log('Disabling tree mode');
            // Disable split view mode
            editorContainer.classList.remove('tree-mode');
            editorPanel.classList.remove('hidden');
            treePanel.classList.add('hidden');
        }
    }

    /**
     * Generate tree view from JSON
     */
    generateTreeView() {
        const content = this.ui.getValue();
        const treeView = document.getElementById('jsonTreeView');
        
        if (!treeView) return;
        
        try {
            const jsonData = JSON.parse(content);
            
            // Create line mapping for tree nodes
            this.ui.treeNodeMap = new Map();
            this.createLineMapping(content);
            
            const treeHTML = this.createTreeHTML(jsonData);
            treeView.innerHTML = treeHTML;
            this.bindTreeEvents();
        } catch (error) {
            treeView.innerHTML = '<div class="tree-error">Invalid JSON - cannot generate tree view</div>';
        }
    }

    /**
     * Create mapping between JSON paths and line numbers
     */
    createLineMapping(content) {
        const lines = content.split('\n');
        const pathToLine = new Map();
        
        try {
            // Parse JSON to understand structure
            const jsonData = JSON.parse(content);
            
            // Create comprehensive mapping using both structure analysis and line scanning
            this.mapJsonStructureToLines(jsonData, lines, pathToLine, []);
            
            // Also scan lines for additional patterns
            lines.forEach((line, index) => {
                const trimmed = line.trim();
                
                // Match JSON keys (quoted strings followed by colon)
                const keyMatch = trimmed.match(/^"([^"]+)"\s*:/);
                if (keyMatch) {
                    const key = keyMatch[1];
                    if (!pathToLine.has(key)) {
                        pathToLine.set(key, index);
                    }
                }
                
                // Match array elements and object starts
                if (trimmed === '{' || trimmed === '[') {
                    pathToLine.set(`__line_${index}`, index);
                }
            });
            
        } catch (error) {
            // Fallback to simple line scanning if JSON parsing fails
            lines.forEach((line, index) => {
                const trimmed = line.trim();
                const keyMatch = trimmed.match(/^"([^"]+)"\s*:/);
                if (keyMatch) {
                    const key = keyMatch[1];
                    pathToLine.set(key, index);
                }
            });
        }
        
        this.ui.treeNodeMap = pathToLine;
        console.log('Line mapping created:', pathToLine);
    }

    /**
     * Map JSON structure to line numbers recursively
     */
    mapJsonStructureToLines(data, lines, pathToLine, currentPath) {
        if (Array.isArray(data)) {
            // For arrays, find the line where each element starts
            data.forEach((item, index) => {
                const elementPath = [...currentPath, index];
                const elementKey = `${currentPath.join('.')}.${index}`;
                
                // Find the line number for this array element
                const lineNumber = this.findArrayElementLine(lines, currentPath, index);
                if (lineNumber !== -1) {
                    pathToLine.set(elementKey, lineNumber);
                    // Use full path for array elements to avoid conflicts
                    pathToLine.set(`${currentPath.join('.')}.${index}`, lineNumber);
                }
                
                // Recursively map nested structures
                if (typeof item === 'object' && item !== null) {
                    this.mapJsonStructureToLines(item, lines, pathToLine, elementPath);
                }
            });
        } else if (typeof data === 'object' && data !== null) {
            // For objects, map each key with full path to avoid conflicts
            Object.entries(data).forEach(([key, value]) => {
                const keyPath = [...currentPath, key];
                const fullKey = keyPath.join('.');
                
                // Find the line number for this key considering its context
                const lineNumber = this.findObjectKeyLineWithContext(lines, key, currentPath);
                if (lineNumber !== -1) {
                    // Use full path as primary key to avoid conflicts with duplicate keys
                    pathToLine.set(fullKey, lineNumber);
                    // Only set simple key if it doesn't exist (first occurrence)
                    if (!pathToLine.has(key)) {
                        pathToLine.set(key, lineNumber);
                    }
                }
                
                // Recursively map nested structures
                if (typeof value === 'object' && value !== null) {
                    this.mapJsonStructureToLines(value, lines, pathToLine, keyPath);
                }
            });
        }
    }

    /**
     * Find the line number where an array element starts
     */
    findArrayElementLine(lines, parentPath, elementIndex) {
        // For arrays nested under a parent key, find the parent first
        if (parentPath.length > 0) {
            const parentKey = parentPath[parentPath.length - 1];
            const parentLine = this.findObjectKeyLine(lines, parentKey, parentPath.slice(0, -1));
            if (parentLine === -1) return -1;
            
            // Look for array elements starting from the parent line
            let elementCount = 0;
            let inArray = false;
            let bracketDepth = 0;
            let foundArrayStart = false;
            
            for (let i = parentLine; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                
                // Track bracket depth
                for (let char of line) {
                    if (char === '[') {
                        bracketDepth++;
                        if (bracketDepth === 1) {
                            inArray = true;
                            foundArrayStart = true;
                        }
                    } else if (char === ']') {
                        bracketDepth--;
                        if (bracketDepth === 0) {
                            inArray = false;
                            break;
                        }
                    }
                }
                
                // Only start counting elements after we've found the array opening bracket
                if (inArray && foundArrayStart && bracketDepth === 1) {
                    // Skip the line that contains the opening bracket
                    if (trimmed.includes('[') && !trimmed.match(/^\s*\[.*".*"\s*,?\s*$/)) {
                        continue;
                    }
                    
                    // Look for lines that contain array elements (quoted strings)
                    if (trimmed.match(/^\s*"[^"]*"\s*,?\s*$/)) {
                        if (elementCount === elementIndex) {
                            return i;
                        }
                        elementCount++;
                    }
                }
                
                if (!inArray && bracketDepth === 0 && i > parentLine) {
                    break;
                }
            }
        } else {
            // For root level arrays, use a simpler approach
            let elementCount = 0;
            let inArray = false;
            let bracketDepth = 0;
            let foundArrayStart = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                
                // Track bracket depth
                for (let char of line) {
                    if (char === '[') {
                        bracketDepth++;
                        if (bracketDepth === 1) {
                            inArray = true;
                            foundArrayStart = true;
                        }
                    } else if (char === ']') {
                        bracketDepth--;
                        if (bracketDepth === 0) {
                            inArray = false;
                            break;
                        }
                    }
                }
                
                // Only start counting elements after we've found the array opening bracket
                if (inArray && foundArrayStart && bracketDepth === 1) {
                    // Skip the line that contains the opening bracket
                    if (trimmed.includes('[') && !trimmed.match(/^\s*\[.*".*"\s*,?\s*$/)) {
                        continue;
                    }
                    
                    // Look for lines that contain array elements (quoted strings)
                    if (trimmed.match(/^\s*"[^"]*"\s*,?\s*$/)) {
                        if (elementCount === elementIndex) {
                            return i;
                        }
                        elementCount++;
                    }
                }
                
                if (!inArray && bracketDepth === 0 && i > 0) {
                    break;
                }
            }
        }
        
        return -1;
    }

    /**
     * Find the line number where an object key is defined
     */
    findObjectKeyLine(lines, key, parentPath) {
        const keyPattern = new RegExp(`^\\s*"${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:`);
        
        for (let i = 0; i < lines.length; i++) {
            if (keyPattern.test(lines[i])) {
                return i;
            }
        }
        
        return -1;
    }

    /**
     * Find the line number where an object key is defined with context awareness
     */
    findObjectKeyLineWithContext(lines, key, parentPath) {
        const keyPattern = new RegExp(`^\\s*"${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:`);
        
        if (parentPath.length === 0) {
            // Root level - find first occurrence
            for (let i = 0; i < lines.length; i++) {
                if (keyPattern.test(lines[i])) {
                    return i;
                }
            }
        } else {
            // Nested - find parent context first
            const parentKey = parentPath[parentPath.length - 1];
            const parentLine = this.findObjectKeyLineWithContext(lines, parentKey, parentPath.slice(0, -1));
            
            if (parentLine === -1) return -1;
            
            // Look for the key within the parent object scope
            let braceDepth = 0;
            let inParentObject = false;
            
            for (let i = parentLine; i < lines.length; i++) {
                const line = lines[i];
                
                // Track brace depth to stay within parent object
                for (let char of line) {
                    if (char === '{') {
                        braceDepth++;
                        if (i === parentLine || (i > parentLine && braceDepth === 1)) {
                            inParentObject = true;
                        }
                    } else if (char === '}') {
                        braceDepth--;
                        if (braceDepth === 0 && inParentObject) {
                            return -1; // End of parent object, key not found
                        }
                    }
                }
                
                // Look for the key within the parent object
                if (inParentObject && braceDepth >= 1 && keyPattern.test(line)) {
                    return i;
                }
            }
        }
        
        return -1;
    }

    /**
     * Create HTML for tree structure
     */
    createTreeHTML(data, key = null, level = 0, parentPath = []) {
        let html = '';
        const currentPath = key !== null ? [...parentPath, key] : parentPath;
        
        // Try multiple mapping strategies to find the line number
        let lineNumber = null;
        if (key !== null) {
            // Try full path mapping first (most accurate)
            const fullPath = currentPath.join('.');
            lineNumber = this.ui.treeNodeMap.get(fullPath);
            
            // For array elements, try the specific array element path
            if (lineNumber === undefined && typeof key === 'number') {
                const arrayElementPath = `${parentPath.join('.')}.${key}`;
                lineNumber = this.ui.treeNodeMap.get(arrayElementPath);
            }
            
            // Fallback to direct key mapping (less accurate for nested objects)
            if (lineNumber === undefined) {
                lineNumber = this.ui.treeNodeMap.get(key);
            }
            
            // Try string version of numeric keys (for arrays)
            if (lineNumber === undefined && typeof key === 'number') {
                lineNumber = this.ui.treeNodeMap.get(key.toString());
            }
        }
        
        if (Array.isArray(data)) {
            html += `<div class="tree-node array-node" data-level="${level}" data-key="${key}" data-line="${lineNumber}" data-path="${currentPath.join('.')}">`;
            html += `<div class="tree-node-content" data-clickable="true">`;
            html += `<span class="tree-toggle">▼</span>`;
            if (key !== null) {
                html += `<span class="tree-key">"${key}"</span><span class="tree-colon">:</span> `;
            }
            html += `<span class="tree-value tree-value-array">[${data.length} items]</span>`;
            html += `</div>`;
            html += `<div class="tree-children">`;
            
            data.forEach((item, index) => {
                html += this.createTreeHTML(item, index, level + 1, currentPath);
            });
            
            html += `</div>`;
            html += `</div>`;
        } else if (typeof data === 'object' && data !== null) {
            const keys = Object.keys(data);
            html += `<div class="tree-node object-node" data-level="${level}" data-key="${key}" data-line="${lineNumber}" data-path="${currentPath.join('.')}">`;
            html += `<div class="tree-node-content" data-clickable="true">`;
            html += `<span class="tree-toggle">▼</span>`;
            if (key !== null) {
                html += `<span class="tree-key">"${key}"</span><span class="tree-colon">:</span> `;
            }
            html += `<span class="tree-value tree-value-object">{${keys.length} keys}</span>`;
            html += `</div>`;
            html += `<div class="tree-children">`;
            
            Object.entries(data).forEach(([objKey, value]) => {
                html += this.createTreeHTML(value, objKey, level + 1, currentPath);
            });
            
            html += `</div>`;
            html += `</div>`;
        } else {
            // Leaf node
            html += `<div class="tree-node leaf-node" data-level="${level}" data-key="${key}" data-line="${lineNumber}" data-path="${currentPath.join('.')}">`;
            html += `<div class="tree-node-content" data-clickable="true">`;
            html += `<span class="tree-toggle" style="visibility: hidden;">▼</span>`;
            if (key !== null) {
                html += `<span class="tree-key">"${key}"</span><span class="tree-colon">:</span> `;
            }
            html += `<span class="tree-value tree-value-${this.getValueType(data)}">${this.formatValue(data)}</span>`;
            html += `</div>`;
            html += `</div>`;
        }
        
        return html;
    }

    /**
     * Get value type for CSS class
     */
    getValueType(value) {
        if (value === null) return 'null';
        if (typeof value === 'string') return 'string';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'boolean') return 'boolean';
        return 'unknown';
    }

    /**
     * Format value for display
     */
    formatValue(value) {
        if (typeof value === 'string') {
            return `"${value}"`;
        } else if (value === null) {
            return 'null';
        } else if (typeof value === 'boolean') {
            return value.toString();
        } else {
            return value.toString();
        }
    }

    /**
     * Bind tree interaction events
     */
    bindTreeEvents() {
        const toggles = document.querySelectorAll('.tree-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const node = toggle.closest('.tree-node');
                const children = node.querySelector('.tree-children');
                
                if (children) {
                    const isCollapsed = children.style.display === 'none';
                    children.style.display = isCollapsed ? 'block' : 'none';
                    toggle.textContent = isCollapsed ? '▼' : '▶';
                }
            });
        });

        // Bind click events for line highlighting
        const nodeContents = document.querySelectorAll('.tree-node-content[data-clickable="true"]');
        console.log('Found tree node contents:', nodeContents.length);
        
        nodeContents.forEach(content => {
            content.addEventListener('click', (e) => {
                // Don't trigger if clicking on toggle
                if (e.target.classList.contains('tree-toggle')) {
                    return;
                }
                
                const node = content.closest('.tree-node');
                const lineNumber = node.getAttribute('data-line');
                const key = node.getAttribute('data-key');
                
                console.log('Tree node clicked:', key, 'line:', lineNumber);
                
                if (lineNumber !== null && lineNumber !== 'null' && lineNumber !== 'undefined') {
                    // Remove previous selection
                    document.querySelectorAll('.tree-node-content.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    
                    // Add selection to current node
                    content.classList.add('selected');
                    
                    // Highlight corresponding line in editor
                    const line = parseInt(lineNumber);
                    console.log('Highlighting line:', line);
                    this.ui.editorManager.highlightLine(line);
                } else {
                    console.log('No valid line number found for node:', key);
                }
            });
        });
    }
}
