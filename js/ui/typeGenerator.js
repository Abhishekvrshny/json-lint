/**
 * Type Generator Manager - Handles type generation for multiple languages
 */

class TypeGeneratorManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.generators = new Map();
        this.currentLanguage = 'typescript';
        this.isModalOpen = false;
        
        // Initialize language generators
        this.initializeGenerators();
    }

    /**
     * Initialize all language generators
     */
    initializeGenerators() {
        this.generators.set('typescript', new TypeScriptGenerator());
        this.generators.set('typescript-combined', new TypeScriptCombinedGenerator());
        this.generators.set('go', new GoGenerator());
        this.generators.set('kotlin', new KotlinGenerator());
        this.generators.set('rust', new RustGenerator());
        this.generators.set('json-schema', new JsonSchemaGenerator());
    }

    /**
     * Show type generation modal
     */
    showTypeGeneratorModal() {
        if (this.isModalOpen) return;
        
        const jsonContent = this.ui.getValue();
        if (!jsonContent.trim()) {
            this.ui.showToast('Please enter some JSON data first', 'error');
            return;
        }

        try {
            JSON.parse(jsonContent);
        } catch (error) {
            this.ui.showToast('Please fix JSON syntax errors before generating types', 'error');
            return;
        }

        this.createModal();
        this.generateTypes(jsonContent);
        this.isModalOpen = true;
    }

    /**
     * Create the type generator modal
     */
    createModal() {
        // Remove existing modal if any
        this.removeModal();

        const modal = document.createElement('div');
        modal.id = 'typeGeneratorModal';
        modal.className = 'type-generator-modal';
        modal.innerHTML = `
            <div class="type-generator-content">
                <div class="type-generator-header">
                    <h3>Generate Types</h3>
                    <button id="closeTypeGeneratorBtn" class="btn btn-icon" title="Close">✕</button>
                </div>
                <div class="type-generator-controls">
                    <select id="languageSelector" class="language-selector">
                        <option value="typescript">TypeScript</option>
                        <option value="typescript-combined">TypeScript (combined)</option>
                        <option value="go">Go</option>
                        <option value="kotlin">Kotlin</option>
                        <option value="rust">Rust</option>
                        <option value="json-schema">JSON Schema</option>
                    </select>
                    <button id="copyGeneratedTypeBtn" class="btn btn-secondary" title="Copy to clipboard">
                        <span class="btn-icon">📋</span>
                    </button>
                </div>
                <div class="type-generator-output">
                    <pre id="generatedTypeOutput" class="generated-type-code"></pre>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindModalEvents();
    }

    /**
     * Bind events for the modal
     */
    bindModalEvents() {
        const closeBtn = document.getElementById('closeTypeGeneratorBtn');
        const languageSelector = document.getElementById('languageSelector');
        const copyBtn = document.getElementById('copyGeneratedTypeBtn');
        const modal = document.getElementById('typeGeneratorModal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                this.currentLanguage = e.target.value;
                this.generateTypes(this.ui.getValue());
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyGeneratedType());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.closeModal();
            }
        });
    }

    /**
     * Generate types for the current language
     */
    generateTypes(jsonContent) {
        try {
            const jsonData = JSON.parse(jsonContent);
            const generator = this.generators.get(this.currentLanguage);
            
            if (!generator) {
                throw new Error(`Generator for ${this.currentLanguage} not found`);
            }

            const generatedCode = generator.generate(jsonData);
            this.displayGeneratedCode(generatedCode);
        } catch (error) {
            this.displayError(error.message);
        }
    }

    /**
     * Display generated code in the output area
     */
    displayGeneratedCode(code) {
        const outputElement = document.getElementById('generatedTypeOutput');
        if (outputElement) {
            outputElement.textContent = code;
            outputElement.className = `generated-type-code language-${this.currentLanguage}`;
        }
    }

    /**
     * Display error message
     */
    displayError(message) {
        const outputElement = document.getElementById('generatedTypeOutput');
        if (outputElement) {
            outputElement.textContent = `Error: ${message}`;
            outputElement.className = 'generated-type-code error';
        }
    }

    /**
     * Copy generated type to clipboard
     */
    copyGeneratedType() {
        const outputElement = document.getElementById('generatedTypeOutput');
        if (outputElement && outputElement.textContent) {
            navigator.clipboard.writeText(outputElement.textContent).then(() => {
                this.ui.showToast('Type definition copied to clipboard!', 'success');
            }).catch(() => {
                this.ui.showToast('Failed to copy to clipboard', 'error');
            });
        }
    }

    /**
     * Close the modal
     */
    closeModal() {
        this.removeModal();
        this.isModalOpen = false;
    }

    /**
     * Remove modal from DOM
     */
    removeModal() {
        const modal = document.getElementById('typeGeneratorModal');
        if (modal) {
            modal.remove();
        }
    }
}
