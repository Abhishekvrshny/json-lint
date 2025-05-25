/**
 * Main Application - Entry point for the JSON Lint tool
 */

class JSONLintApp {
    constructor() {
        this.linter = new JSONLinter();
        this.ui = new UIManager();
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    init() {
        if (this.isInitialized) return;

        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Failed to initialize JSON Lint App:', error);
            this.showFallbackError();
        }
    }

    /**
     * Initialize the application components
     */
    initializeApp() {
        try {
            // Initialize UI components
            this.ui.initialize();
            
            // Set up global error handling
            this.setupErrorHandling();
            
            // Add performance monitoring
            this.setupPerformanceMonitoring();
            
            // Initialize keyboard shortcuts help
            this.setupKeyboardShortcuts();
            
            // Check for URL parameters
            this.handleURLParameters();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('JSON Lint App initialized successfully');
            
            // Show welcome message if first visit
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Error during app initialization:', error);
            this.showFallbackError();
        }
    }

    /**
     * Set up global error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.ui.showToast('An unexpected error occurred', 'error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.ui.showToast('An unexpected error occurred', 'error');
        });
    }

    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor large JSON processing
        const originalFormat = this.linter.format.bind(this.linter);
        this.linter.format = (jsonString, indent = 2) => {
            const startTime = performance.now();
            const result = originalFormat(jsonString, indent);
            const endTime = performance.now();
            
            const processingTime = endTime - startTime;
            if (processingTime > 1000) { // More than 1 second
                console.warn(`JSON formatting took ${processingTime.toFixed(2)}ms`);
            }
            
            return result;
        };
    }

    /**
     * Set up keyboard shortcuts help
     */
    setupKeyboardShortcuts() {
        // Add keyboard shortcuts info to the page
        const shortcuts = [
            { key: 'Ctrl/Cmd + Enter', action: 'Format JSON' },
            { key: 'Ctrl/Cmd + L', action: 'Load Sample JSON' },
            { key: 'Ctrl/Cmd + K', action: 'Clear Input' },
            { key: 'Ctrl/Cmd + D', action: 'Toggle Dark Mode' }
        ];

        // You could add a help modal or tooltip here
        // For now, we'll just log them for developers
        console.log('Available keyboard shortcuts:', shortcuts);
    }

    /**
     * Handle URL parameters for sharing JSON
     */
    handleURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const jsonData = urlParams.get('json');
        
        if (jsonData) {
            try {
                const decodedJSON = decodeURIComponent(jsonData);
                this.ui.setInputValue(decodedJSON);
                this.ui.validateJSON();
                
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Error loading JSON from URL:', error);
                this.ui.showToast('Invalid JSON in URL parameter', 'error');
            }
        }
    }

    /**
     * Show welcome message for first-time users
     */
    showWelcomeMessage() {
        const hasVisited = localStorage.getItem('json-lint-visited');
        
        if (!hasVisited) {
            setTimeout(() => {
                this.ui.showToast('Welcome! Try pasting JSON or click "Sample" to get started', 'success');
                localStorage.setItem('json-lint-visited', 'true');
            }, 1000);
        }
    }

    /**
     * Show fallback error when app fails to initialize
     */
    showFallbackError() {
        const errorHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #fee;
                border: 2px solid #f00;
                padding: 20px;
                border-radius: 8px;
                font-family: Arial, sans-serif;
                max-width: 400px;
                text-align: center;
                z-index: 9999;
            ">
                <h3 style="color: #c00; margin-top: 0;">Application Error</h3>
                <p>The JSON Lint tool failed to initialize properly.</p>
                <p>Please try refreshing the page or check the browser console for more details.</p>
                <button onclick="window.location.reload()" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Refresh Page</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHTML);
    }

    /**
     * Generate shareable URL with JSON data
     */
    generateShareableURL(jsonString) {
        try {
            const encodedJSON = encodeURIComponent(jsonString);
            const baseURL = window.location.origin + window.location.pathname;
            return `${baseURL}?json=${encodedJSON}`;
        } catch (error) {
            console.error('Error generating shareable URL:', error);
            return null;
        }
    }

    /**
     * Export application state for debugging
     */
    exportDebugInfo() {
        return {
            version: '1.0.0',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            theme: this.ui.isDarkMode ? 'dark' : 'light',
            hasCodeMirror: typeof CodeMirror !== 'undefined',
            hasJsonLint: typeof jsonlint !== 'undefined',
            inputLength: this.ui.getInputValue().length,
            isValid: this.linter.isValid,
            errors: this.linter.errors
        };
    }

    /**
     * Handle app updates or version changes
     */
    checkForUpdates() {
        // In a real application, you might check for updates here
        // For now, we'll just ensure localStorage is clean
        const version = localStorage.getItem('json-lint-version');
        const currentVersion = '1.0.0';
        
        if (version !== currentVersion) {
            // Clear old data if version changed
            localStorage.setItem('json-lint-version', currentVersion);
            console.log(`Updated to version ${currentVersion}`);
        }
    }

    /**
     * Cleanup resources when page unloads
     */
    cleanup() {
        // Clear any timers
        if (this.ui.debounceTimer) {
            clearTimeout(this.ui.debounceTimer);
        }
        
        // Save any important state
        // (Theme is already saved in localStorage)
        
        console.log('JSON Lint App cleaned up');
    }
}

// Initialize the application
const app = new JSONLintApp();

// Start the app
app.init();

// Handle page unload
window.addEventListener('beforeunload', () => {
    app.cleanup();
});

// Expose app instance for debugging
if (typeof window !== 'undefined') {
    window.JSONLintApp = app;
}

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JSONLintApp;
}
