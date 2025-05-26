/**
 * JSON Lint - Main Application Entry Point
 * Uses modular UI system to handle format conversion and validation
 */

// Global UI manager instance
let uiManager;

/**
 * Initialize the application
 */
function initializeApp() {
    try {
        // Create UI manager instance
        uiManager = new UIManager();
        
        // Initialize the UI
        uiManager.initialize();
        
        console.log('JSON Lint application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize JSON Lint application:', error);
        
        // Show fallback error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        errorDiv.textContent = 'Failed to initialize application. Please refresh the page.';
        document.body.appendChild(errorDiv);
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

/**
 * Wait for DOM to be ready, then initialize
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}

/**
 * Export UI manager for global access (if needed)
 */
if (typeof window !== 'undefined') {
    window.uiManager = uiManager;
}
