/**
 * JSON Diff Manager - Handles JSON comparison and diff visualization
 */

class DiffManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.isDiffMode = false;
        this.isCompareMode = false;
        this.leftEditor = null;
        this.rightEditor = null;
        this.originalContent = '';
        this.diffResults = null;
    }

    /**
     * Initialize diff functionality
     */
    initialize() {
        this.createDiffButton();
        this.bindEvents();
    }

    /**
     * Create the diff button in the header
     */
    createDiffButton() {
        const headerControls = document.querySelector('.header-controls');
        const firstDivider = headerControls.querySelector('.divider');
        
        // Create diff button
        const diffBtn = document.createElement('button');
        diffBtn.id = 'diffBtn';
        diffBtn.className = 'btn btn-secondary';
        diffBtn.title = 'Compare JSON';
        diffBtn.innerHTML = '<span class="btn-icon">⚖️</span> Diff';
        diffBtn.disabled = true;
        
        // Insert before the first divider
        headerControls.insertBefore(diffBtn, firstDivider);
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        const diffBtn = document.getElementById('diffBtn');
        if (diffBtn) {
            diffBtn.addEventListener('click', () => this.toggleDiffMode());
        }
    }

    /**
     * Check if diff should be enabled based on JSON validity
     */
    updateDiffAvailability() {
        const diffBtn = document.getElementById('diffBtn');
        if (!diffBtn) return;

        const content = this.uiManager.getValue();
        const linter = new JSONLinter();
        const validation = linter.validate(content);
        
        // Enable diff only if JSON is valid and not empty
        const shouldEnable = validation.isValid && content.trim() !== '';
        diffBtn.disabled = !shouldEnable;
        
        if (!shouldEnable && this.isDiffMode) {
            this.exitDiffMode();
        }
    }

    /**
     * Toggle diff mode on/off
     */
    toggleDiffMode() {
        if (this.isDiffMode) {
            this.exitDiffMode();
        } else {
            this.enterDiffMode();
        }
    }

    /**
     * Enter diff mode - show two-panel layout
     */
    enterDiffMode() {
        this.isDiffMode = true;
        this.originalContent = this.uiManager.getValue();
        
        // Hide other panels (tree mode, error panel, etc.)
        this.hideOtherPanels();
        
        // Create diff layout
        this.createDiffLayout();
        
        // Update button state
        const diffBtn = document.getElementById('diffBtn');
        if (diffBtn) {
            diffBtn.innerHTML = '<span class="btn-icon">✕</span> Exit Diff';
            diffBtn.className = 'btn btn-primary';
        }
        
        // Disable other controls
        this.disableOtherControls();
    }

    /**
     * Exit diff mode - return to normal view
     */
    exitDiffMode() {
        this.isDiffMode = false;
        this.isCompareMode = false;
        
        // Restore original layout
        this.restoreOriginalLayout();
        
        // Update button state
        const diffBtn = document.getElementById('diffBtn');
        if (diffBtn) {
            diffBtn.innerHTML = '<span class="btn-icon">⚖️</span> Diff';
            diffBtn.className = 'btn btn-secondary';
        }
        
        // Re-enable other controls
        this.enableOtherControls();
        
        // Show other panels if they were visible
        this.restoreOtherPanels();
    }

    /**
     * Hide other panels when in diff mode
     */
    hideOtherPanels() {
        const treePanel = document.getElementById('treePanel');
        const errorPanel = document.getElementById('errorPanel');
        
        if (treePanel) {
            treePanel.classList.add('hidden');
        }
        if (errorPanel) {
            errorPanel.classList.add('hidden');
        }
        
        // Disable tree mode
        const treeModeToggle = document.getElementById('treeModeToggle');
        if (treeModeToggle) {
            treeModeToggle.checked = false;
        }
    }

    /**
     * Restore other panels when exiting diff mode
     */
    restoreOtherPanels() {
        // Panels will be restored by their respective managers if needed
    }

    /**
     * Disable other controls during diff mode
     */
    disableOtherControls() {
        const controlsToDisable = [
            'treeModeToggle',
            'convertDropdown',
            'generateTypesBtn'
        ];
        
        controlsToDisable.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = true;
                element.style.opacity = '0.5';
            }
        });
    }

    /**
     * Re-enable other controls when exiting diff mode
     */
    enableOtherControls() {
        const controlsToEnable = [
            'treeModeToggle',
            'convertDropdown',
            'generateTypesBtn'
        ];
        
        controlsToEnable.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = false;
                element.style.opacity = '1';
            }
        });
    }

    /**
     * Create the diff layout with two panels
     */
    createDiffLayout() {
        const editorContainer = document.getElementById('editorContainer');
        
        // Store original content
        editorContainer.innerHTML = `
            <div class="diff-container">
                <div class="diff-panel left-panel">
                    <div class="diff-panel-header">
                        <h3>Original JSON</h3>
                        <div class="diff-panel-controls">
                            <span class="diff-status" id="leftStatus">Valid JSON</span>
                        </div>
                    </div>
                    <div class="diff-editor-wrapper">
                        <textarea id="leftEditor" readonly></textarea>
                    </div>
                </div>
                <div class="diff-panel right-panel">
                    <div class="diff-panel-header">
                        <h3>Compare JSON</h3>
                        <div class="diff-panel-controls">
                            <button id="compareBtn" class="btn btn-primary" disabled>
                                <span class="btn-icon">🔍</span> Compare
                            </button>
                            <span class="diff-status" id="rightStatus">Paste JSON to compare</span>
                        </div>
                    </div>
                    <div class="diff-editor-wrapper">
                        <textarea id="rightEditor" placeholder="Paste JSON here to compare..."></textarea>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize editors
        this.initializeDiffEditors();
        
        // Bind compare button
        const compareBtn = document.getElementById('compareBtn');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => this.toggleCompareMode());
        }
    }

    /**
     * Initialize the diff editors
     */
    initializeDiffEditors() {
        // Initialize left editor (editable)
        const leftTextarea = document.getElementById('leftEditor');
        if (leftTextarea && typeof CodeMirror !== 'undefined') {
            this.leftEditor = CodeMirror.fromTextArea(leftTextarea, {
                mode: 'application/json',
                theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'material-darker' : 'default',
                lineNumbers: true,
                readOnly: false,
                lineWrapping: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
            });
            this.leftEditor.setValue(this.originalContent);
            
            // Listen for changes in left editor
            this.leftEditor.on('change', () => {
                this.validateLeftEditor();
            });
        }
        
        // Initialize right editor (editable)
        const rightTextarea = document.getElementById('rightEditor');
        if (rightTextarea && typeof CodeMirror !== 'undefined') {
            this.rightEditor = CodeMirror.fromTextArea(rightTextarea, {
                mode: 'application/json',
                theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'material-darker' : 'default',
                lineNumbers: true,
                readOnly: false,
                lineWrapping: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
            });
            
            // Listen for changes in right editor
            this.rightEditor.on('change', () => {
                this.validateRightEditor();
            });
        }
    }

    /**
     * Validate the left editor content
     */
    validateLeftEditor() {
        const content = this.leftEditor.getValue();
        const leftStatus = document.getElementById('leftStatus');
        const compareBtn = document.getElementById('compareBtn');
        
        const linter = new JSONLinter();
        const validation = linter.validate(content);
        
        if (validation.isValid) {
            leftStatus.textContent = 'Valid JSON';
            leftStatus.className = 'diff-status valid';
        } else {
            leftStatus.textContent = 'Invalid JSON';
            leftStatus.className = 'diff-status invalid';
        }
        
        // Update compare button state based on both editors
        this.updateCompareButtonState();
    }

    /**
     * Validate the right editor content
     */
    validateRightEditor() {
        const content = this.rightEditor.getValue();
        const rightStatus = document.getElementById('rightStatus');
        
        if (!content.trim()) {
            rightStatus.textContent = 'Paste JSON to compare';
            rightStatus.className = 'diff-status';
            this.updateCompareButtonState();
            return;
        }
        
        const linter = new JSONLinter();
        const validation = linter.validate(content);
        
        if (validation.isValid) {
            rightStatus.textContent = 'Valid JSON';
            rightStatus.className = 'diff-status valid';
        } else {
            rightStatus.textContent = 'Invalid JSON';
            rightStatus.className = 'diff-status invalid';
        }
        
        // Update compare button state based on both editors
        this.updateCompareButtonState();
    }

    /**
     * Update compare button state based on both editors' validity
     */
    updateCompareButtonState() {
        const compareBtn = document.getElementById('compareBtn');
        if (!compareBtn || this.isCompareMode) return;
        
        const leftContent = this.leftEditor.getValue();
        const rightContent = this.rightEditor.getValue();
        
        const linter = new JSONLinter();
        const leftValid = linter.validate(leftContent).isValid;
        const rightValid = rightContent.trim() !== '' && linter.validate(rightContent).isValid;
        
        compareBtn.disabled = !(leftValid && rightValid);
    }

    /**
     * Toggle compare mode
     */
    toggleCompareMode() {
        if (this.isCompareMode) {
            this.exitCompareMode();
        } else {
            this.enterCompareMode();
        }
    }

    /**
     * Enter compare mode - show diff results
     */
    enterCompareMode() {
        this.isCompareMode = true;
        
        // Perform diff
        const leftContent = this.leftEditor.getValue();
        const rightContent = this.rightEditor.getValue();
        
        this.diffResults = this.performDiff(leftContent, rightContent);
        
        // Make both editors readonly during comparison
        this.leftEditor.setOption('readOnly', true);
        this.rightEditor.setOption('readOnly', true);
        
        // Update compare button
        const compareBtn = document.getElementById('compareBtn');
        if (compareBtn) {
            compareBtn.innerHTML = '<span class="btn-icon">📝</span> Edit';
            compareBtn.className = 'btn btn-secondary';
        }
        
        // Apply diff highlighting
        this.applyDiffHighlighting();
        
        // Update status
        this.updateDiffStatus();
    }

    /**
     * Exit compare mode - return to edit mode
     */
    exitCompareMode() {
        this.isCompareMode = false;
        
        // Make both editors editable again
        this.leftEditor.setOption('readOnly', false);
        this.rightEditor.setOption('readOnly', false);
        
        // Update compare button
        const compareBtn = document.getElementById('compareBtn');
        if (compareBtn) {
            compareBtn.innerHTML = '<span class="btn-icon">🔍</span> Compare';
            compareBtn.className = 'btn btn-primary';
        }
        
        // Clear diff highlighting
        this.clearDiffHighlighting();
        
        // Reset status to show validation results
        this.validateLeftEditor();
        this.validateRightEditor();
    }

    /**
     * Perform JSON diff comparison
     */
    performDiff(leftJson, rightJson) {
        try {
            const leftObj = JSON.parse(leftJson);
            const rightObj = JSON.parse(rightJson);
            
            return this.deepDiff(leftObj, rightObj, '');
        } catch (error) {
            return { error: 'Failed to parse JSON for comparison' };
        }
    }

    /**
     * Deep diff algorithm for JSON objects
     */
    deepDiff(left, right, path = '') {
        const changes = {
            added: [],
            removed: [],
            modified: [],
            unchanged: []
        };
        
        // Handle different types
        if (typeof left !== typeof right) {
            changes.modified.push({
                path: path || 'root',
                leftValue: left,
                rightValue: right,
                type: 'type_change'
            });
            return changes;
        }
        
        if (Array.isArray(left) && Array.isArray(right)) {
            return this.diffArrays(left, right, path, changes);
        } else if (typeof left === 'object' && left !== null && right !== null) {
            return this.diffObjects(left, right, path, changes);
        } else {
            // Primitive values
            if (left !== right) {
                changes.modified.push({
                    path: path || 'root',
                    leftValue: left,
                    rightValue: right,
                    type: 'value_change'
                });
            } else {
                changes.unchanged.push({
                    path: path || 'root',
                    value: left
                });
            }
        }
        
        return changes;
    }

    /**
     * Diff two objects
     */
    diffObjects(left, right, path, changes) {
        const leftKeys = Object.keys(left);
        const rightKeys = Object.keys(right);
        const allKeys = new Set([...leftKeys, ...rightKeys]);
        
        for (const key of allKeys) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (!(key in left)) {
                changes.added.push({
                    path: currentPath,
                    value: right[key],
                    type: 'property_added'
                });
            } else if (!(key in right)) {
                changes.removed.push({
                    path: currentPath,
                    value: left[key],
                    type: 'property_removed'
                });
            } else {
                const subDiff = this.deepDiff(left[key], right[key], currentPath);
                changes.added.push(...subDiff.added);
                changes.removed.push(...subDiff.removed);
                changes.modified.push(...subDiff.modified);
                changes.unchanged.push(...subDiff.unchanged);
            }
        }
        
        return changes;
    }

    /**
     * Diff two arrays using content-based comparison instead of position-based
     */
    diffArrays(left, right, path, changes) {
        if (left.length === 0 && right.length === 0) {
            return changes;
        }
        
        // Use content-based comparison for arrays
        const leftItems = left.map((item, index) => ({ item, index, used: false }));
        const rightItems = right.map((item, index) => ({ item, index, used: false }));
        
        // First pass: find exact matches (unchanged items)
        for (let i = 0; i < leftItems.length; i++) {
            if (leftItems[i].used) continue;
            
            for (let j = 0; j < rightItems.length; j++) {
                if (rightItems[j].used) continue;
                
                if (this.deepEqual(leftItems[i].item, rightItems[j].item)) {
                    // Mark as unchanged
                    const currentPath = path ? `${path}[${leftItems[i].index}]` : `[${leftItems[i].index}]`;
                    changes.unchanged.push({
                        path: currentPath,
                        value: leftItems[i].item
                    });
                    
                    leftItems[i].used = true;
                    rightItems[j].used = true;
                    break;
                }
            }
        }
        
        // Second pass: handle removed items (items in left but not matched in right)
        for (let i = 0; i < leftItems.length; i++) {
            if (!leftItems[i].used) {
                const currentPath = path ? `${path}[${leftItems[i].index}]` : `[${leftItems[i].index}]`;
                changes.removed.push({
                    path: currentPath,
                    value: leftItems[i].item,
                    type: 'array_item_removed',
                    arrayIndex: leftItems[i].index
                });
            }
        }
        
        // Third pass: handle added items (items in right but not matched in left)
        for (let j = 0; j < rightItems.length; j++) {
            if (!rightItems[j].used) {
                const currentPath = path ? `${path}[${rightItems[j].index}]` : `[${rightItems[j].index}]`;
                changes.added.push({
                    path: currentPath,
                    value: rightItems[j].item,
                    type: 'array_item_added',
                    arrayIndex: rightItems[j].index
                });
            }
        }
        
        return changes;
    }

    /**
     * Deep equality check for array items
     */
    deepEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (typeof a !== typeof b) return false;
        
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!this.deepEqual(a[i], b[i])) return false;
            }
            return true;
        }
        
        if (typeof a === 'object') {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;
            
            for (const key of keysA) {
                if (!keysB.includes(key)) return false;
                if (!this.deepEqual(a[key], b[key])) return false;
            }
            return true;
        }
        
        return false;
    }

    /**
     * Apply diff highlighting to both editors
     */
    applyDiffHighlighting() {
        if (!this.diffResults || this.diffResults.error) {
            return;
        }
        
        // Clear existing highlights
        this.clearDiffHighlighting();
        
        // Apply highlights based on diff results
        this.highlightChanges(this.leftEditor, this.diffResults, 'left');
        this.highlightChanges(this.rightEditor, this.diffResults, 'right');
    }

    /**
     * Clear diff highlighting from both editors
     */
    clearDiffHighlighting() {
        if (this.leftEditor) {
            this.leftEditor.getAllMarks().forEach(mark => mark.clear());
        }
        if (this.rightEditor) {
            this.rightEditor.getAllMarks().forEach(mark => mark.clear());
        }
    }

    /**
     * Highlight changes in an editor
     */
    highlightChanges(editor, diffResults, side) {
        const content = editor.getValue();
        const lines = content.split('\n');
        
        // Highlight removed items (only in left editor)
        if (side === 'left') {
            diffResults.removed.forEach(change => {
                const lineInfo = this.findLineForPath(change.path, content);
                if (lineInfo) {
                    editor.markText(
                        { line: lineInfo.line, ch: 0 },
                        { line: lineInfo.line, ch: lines[lineInfo.line].length },
                        { className: 'diff-removed' }
                    );
                }
            });
        }
        
        // Highlight added items (only in right editor)
        if (side === 'right') {
            diffResults.added.forEach(change => {
                const lineInfo = this.findLineForPath(change.path, content);
                if (lineInfo) {
                    editor.markText(
                        { line: lineInfo.line, ch: 0 },
                        { line: lineInfo.line, ch: lines[lineInfo.line].length },
                        { className: 'diff-added' }
                    );
                }
            });
        }
        
        // Highlight modified items (in both editors)
        diffResults.modified.forEach(change => {
            const lineInfo = this.findLineForPath(change.path, content);
            if (lineInfo) {
                editor.markText(
                    { line: lineInfo.line, ch: 0 },
                    { line: lineInfo.line, ch: lines[lineInfo.line].length },
                    { className: 'diff-modified' }
                );
            }
        });
    }

    /**
     * Find the line number for a given JSON path with improved array handling
     */
    findLineForPath(path, content) {
        try {
            const lines = content.split('\n');
            
            // Handle array indices in path
            if (path.includes('[') && path.includes(']')) {
                return this.findArrayElementLine(path, lines);
            }
            
            // Handle object properties
            const pathParts = path.split(/[.\[\]]+/).filter(part => part !== '');
            
            if (pathParts.length > 0) {
                const lastKey = pathParts[pathParts.length - 1];
                
                // Look for property key
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    // Match property key with quotes and colon
                    if (line.includes(`"${lastKey}"`) && line.includes(':')) {
                        return { line: i, column: 0 };
                    }
                }
                
                // Fallback: look for any occurrence of the key
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes(`"${lastKey}"`)) {
                        return { line: i, column: 0 };
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error finding line for path:', path, error);
            return null;
        }
    }

    /**
     * Find line number for array elements
     */
    findArrayElementLine(path, lines) {
        try {
            // Extract array path and index
            const arrayMatch = path.match(/^(.*?)\[(\d+)\]$/);
            if (!arrayMatch) return null;
            
            const [, arrayPath, indexStr] = arrayMatch;
            const targetIndex = parseInt(indexStr, 10);
            
            // Find the array start
            let arrayStartLine = -1;
            let currentArrayIndex = -1;
            let bracketDepth = 0;
            let inArray = false;
            
            // If we have an array path (nested), find the parent first
            if (arrayPath) {
                const pathParts = arrayPath.split(/[.\[\]]+/).filter(part => part !== '');
                if (pathParts.length > 0) {
                    const arrayKey = pathParts[pathParts.length - 1];
                    
                    // Find the array property line
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line.includes(`"${arrayKey}"`) && line.includes(':') && line.includes('[')) {
                            arrayStartLine = i;
                            break;
                        }
                    }
                }
            } else {
                // Root level array
                arrayStartLine = 0;
            }
            
            if (arrayStartLine === -1) return null;
            
            // Count array elements from the array start
            for (let i = arrayStartLine; i < lines.length; i++) {
                const line = lines[i];
                
                // Track bracket depth
                for (const char of line) {
                    if (char === '[') {
                        bracketDepth++;
                        if (bracketDepth === 1) inArray = true;
                    } else if (char === ']') {
                        bracketDepth--;
                        if (bracketDepth === 0) inArray = false;
                    }
                }
                
                // If we're in the target array and find a value line
                if (inArray && bracketDepth === 1) {
                    const trimmedLine = line.trim();
                    // Skip empty lines and lines with just brackets
                    if (trimmedLine && !trimmedLine.match(/^[\[\],\s]*$/)) {
                        currentArrayIndex++;
                        if (currentArrayIndex === targetIndex) {
                            return { line: i, column: 0 };
                        }
                    }
                }
                
                // If we've exited the array, stop searching
                if (!inArray && bracketDepth === 0 && i > arrayStartLine) {
                    break;
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error finding array element line:', error);
            return null;
        }
    }

    /**
     * Update diff status display
     */
    updateDiffStatus() {
        if (!this.diffResults || this.diffResults.error) {
            return;
        }
        
        const leftStatus = document.getElementById('leftStatus');
        const rightStatus = document.getElementById('rightStatus');
        
        const addedCount = this.diffResults.added.length;
        const removedCount = this.diffResults.removed.length;
        const modifiedCount = this.diffResults.modified.length;
        
        if (addedCount === 0 && removedCount === 0 && modifiedCount === 0) {
            leftStatus.textContent = 'No differences';
            rightStatus.textContent = 'Identical';
            leftStatus.className = 'diff-status identical';
            rightStatus.className = 'diff-status identical';
        } else {
            leftStatus.textContent = `${removedCount} removed, ${modifiedCount} modified`;
            rightStatus.textContent = `${addedCount} added, ${modifiedCount} modified`;
            leftStatus.className = 'diff-status differences';
            rightStatus.className = 'diff-status differences';
        }
    }

    /**
     * Restore original layout when exiting diff mode
     */
    restoreOriginalLayout() {
        const editorContainer = document.getElementById('editorContainer');
        
        // Restore original editor layout
        editorContainer.innerHTML = `
            <div class="editor-panel" id="editorPanel">
                <textarea id="jsonEditor" placeholder="Paste your JSON here..."></textarea>
            </div>
            <div class="tree-panel hidden" id="treePanel">
                <div class="tree-view" id="jsonTreeView"></div>
            </div>
        `;
        
        // Reinitialize the main editor with original content
        this.uiManager.editorManager.setupEditor();
        this.uiManager.setValue(this.originalContent);
        
        // Clear diff-related properties
        this.leftEditor = null;
        this.rightEditor = null;
        this.diffResults = null;
    }

    /**
     * Update theme for diff editors
     */
    updateTheme() {
        if (this.leftEditor) {
            const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'material-darker' : 'default';
            this.leftEditor.setOption('theme', theme);
        }
        if (this.rightEditor) {
            const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'material-darker' : 'default';
            this.rightEditor.setOption('theme', theme);
        }
    }
}
