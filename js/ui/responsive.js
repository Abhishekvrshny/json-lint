/**
 * Responsive Manager - Handles device-specific behaviors and responsive features
 */

class ResponsiveManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.isMobile = false;
        this.isTablet = false;
        this.isTouch = false;
        this.orientation = 'portrait';
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            desktop: 1024
        };
        
        // Debounce timer for resize events
        this.resizeTimer = null;
        this.resizeDelay = 250;
        
        // Track viewport dimensions
        this.viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    /**
     * Initialize responsive features
     */
    initialize() {
        this.detectDevice();
        this.setupEventListeners();
        this.applyResponsiveFeatures();
        this.handleInitialLayout();
    }

    /**
     * Detect device type and capabilities
     */
    detectDevice() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Update viewport
        this.viewport.width = width;
        this.viewport.height = height;
        
        // Detect device type based on screen size
        this.isMobile = width <= this.breakpoints.mobile;
        this.isTablet = width > this.breakpoints.mobile && width <= this.breakpoints.tablet;
        this.isDesktop = width > this.breakpoints.tablet;
        
        // Detect touch capability
        this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Detect orientation
        this.orientation = height > width ? 'portrait' : 'landscape';
        
        // Add device classes to body
        this.updateBodyClasses();
        
        console.log('Device detected:', {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            isDesktop: this.isDesktop,
            isTouch: this.isTouch,
            orientation: this.orientation,
            viewport: this.viewport
        });
    }

    /**
     * Update body classes based on device type
     */
    updateBodyClasses() {
        const body = document.body;
        
        // Remove existing device classes
        body.classList.remove('mobile', 'tablet', 'desktop', 'touch', 'no-touch', 'portrait', 'landscape');
        
        // Add current device classes
        if (this.isMobile) body.classList.add('mobile');
        if (this.isTablet) body.classList.add('tablet');
        if (this.isDesktop) body.classList.add('desktop');
        
        body.classList.add(this.isTouch ? 'touch' : 'no-touch');
        body.classList.add(this.orientation);
    }

    /**
     * Setup event listeners for responsive behavior
     */
    setupEventListeners() {
        // Window resize handler with debouncing
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                this.handleResize();
            }, this.resizeDelay);
        });

        // Orientation change handler
        window.addEventListener('orientationchange', () => {
            // Small delay to ensure viewport dimensions are updated
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });

        // Touch event handlers for better mobile experience
        if (this.isTouch) {
            this.setupTouchHandlers();
        }

        // Keyboard handlers for mobile
        if (this.isMobile) {
            this.setupMobileKeyboardHandlers();
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const oldIsMobile = this.isMobile;
        const oldIsTablet = this.isTablet;
        const oldOrientation = this.orientation;
        
        this.detectDevice();
        
        // Check if device type changed
        if (oldIsMobile !== this.isMobile || oldIsTablet !== this.isTablet) {
            this.applyResponsiveFeatures();
        }
        
        // Check if orientation changed
        if (oldOrientation !== this.orientation) {
            this.handleOrientationChange();
        }
        
        // Refresh editor if needed
        if (this.uiManager.jsonEditor) {
            setTimeout(() => {
                this.uiManager.jsonEditor.refresh();
            }, 100);
        }
    }

    /**
     * Handle orientation change
     */
    handleOrientationChange() {
        this.detectDevice();
        this.applyResponsiveFeatures();
        
        // Adjust tree mode layout for orientation
        this.adjustTreeModeForOrientation();
        
        // Refresh editor layout
        if (this.uiManager.jsonEditor) {
            setTimeout(() => {
                this.uiManager.jsonEditor.refresh();
            }, 200);
        }
    }

    /**
     * Apply responsive features based on device type
     */
    applyResponsiveFeatures() {
        if (this.isMobile) {
            this.applyMobileFeatures();
        } else if (this.isTablet) {
            this.applyTabletFeatures();
        } else {
            this.applyDesktopFeatures();
        }
    }

    /**
     * Apply mobile-specific features
     */
    applyMobileFeatures() {
        // Adjust font size for mobile
        this.adjustFontSizeForMobile();
        
        // Optimize header layout
        this.optimizeHeaderForMobile();
        
        // Adjust tree mode for mobile
        this.adjustTreeModeForMobile();
        
        // Enable mobile-specific gestures
        this.enableMobileGestures();
    }

    /**
     * Apply tablet-specific features
     */
    applyTabletFeatures() {
        // Tablet-specific optimizations
        this.optimizeHeaderForTablet();
        
        // Adjust tree mode for tablet
        this.adjustTreeModeForTablet();
    }

    /**
     * Apply desktop-specific features
     */
    applyDesktopFeatures() {
        // Desktop-specific optimizations
        this.optimizeHeaderForDesktop();
    }

    /**
     * Adjust font size for mobile devices
     */
    adjustFontSizeForMobile() {
        if (this.isMobile && this.uiManager.fontManager) {
            // Ensure font size is readable on mobile
            const currentSize = this.uiManager.fontManager.fontSize;
            if (currentSize < 12) {
                this.uiManager.fontManager.setFontSize(12);
            }
        }
    }

    /**
     * Optimize header layout for mobile
     */
    optimizeHeaderForMobile() {
        const header = document.querySelector('.compact-header');
        const headerControls = document.querySelector('.header-controls');
        
        if (header && headerControls) {
            // Ensure header is properly stacked on mobile
            header.style.flexDirection = 'column';
            headerControls.style.flexWrap = 'wrap';
            headerControls.style.justifyContent = 'center';
        }
    }

    /**
     * Optimize header layout for tablet
     */
    optimizeHeaderForTablet() {
        const header = document.querySelector('.compact-header');
        const headerControls = document.querySelector('.header-controls');
        
        if (header && headerControls) {
            // Allow header to wrap on tablet
            headerControls.style.flexWrap = 'wrap';
        }
    }

    /**
     * Optimize header layout for desktop
     */
    optimizeHeaderForDesktop() {
        const header = document.querySelector('.compact-header');
        const headerControls = document.querySelector('.header-controls');
        
        if (header && headerControls) {
            // Reset to default desktop layout
            header.style.flexDirection = 'row';
            headerControls.style.flexWrap = 'nowrap';
            headerControls.style.justifyContent = 'flex-end';
        }
    }

    /**
     * Adjust tree mode for mobile
     */
    adjustTreeModeForMobile() {
        const editorContainer = document.querySelector('.editor-container');
        if (editorContainer && editorContainer.classList.contains('tree-mode')) {
            // Force vertical layout on mobile
            editorContainer.style.flexDirection = 'column';
        }
    }

    /**
     * Adjust tree mode for tablet
     */
    adjustTreeModeForTablet() {
        const editorContainer = document.querySelector('.editor-container');
        if (editorContainer && editorContainer.classList.contains('tree-mode')) {
            // Use vertical layout on tablet in portrait mode
            if (this.orientation === 'portrait') {
                editorContainer.style.flexDirection = 'column';
            } else {
                editorContainer.style.flexDirection = 'row';
            }
        }
    }

    /**
     * Adjust tree mode layout based on orientation
     */
    adjustTreeModeForOrientation() {
        const editorContainer = document.querySelector('.editor-container');
        if (editorContainer && editorContainer.classList.contains('tree-mode')) {
            if (this.isMobile) {
                // Always vertical on mobile
                editorContainer.style.flexDirection = 'column';
            } else if (this.isTablet) {
                // Vertical in portrait, horizontal in landscape
                editorContainer.style.flexDirection = this.orientation === 'portrait' ? 'column' : 'row';
            } else {
                // Always horizontal on desktop
                editorContainer.style.flexDirection = 'row';
            }
        }
    }

    /**
     * Setup touch handlers for better mobile experience
     */
    setupTouchHandlers() {
        // Prevent zoom on double tap for buttons
        const buttons = document.querySelectorAll('.btn, .checkbox-container, .convert-dropdown');
        buttons.forEach(button => {
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                // Trigger click after preventing default
                setTimeout(() => {
                    button.click();
                }, 10);
            });
        });

        // Add touch feedback for tree nodes
        const treeView = document.querySelector('.tree-view');
        if (treeView) {
            treeView.addEventListener('touchstart', (e) => {
                const treeNode = e.target.closest('.tree-node-content');
                if (treeNode) {
                    treeNode.style.backgroundColor = 'var(--bg-tertiary)';
                }
            });

            treeView.addEventListener('touchend', (e) => {
                const treeNode = e.target.closest('.tree-node-content');
                if (treeNode) {
                    setTimeout(() => {
                        treeNode.style.backgroundColor = '';
                    }, 150);
                }
            });
        }
    }

    /**
     * Setup mobile keyboard handlers
     */
    setupMobileKeyboardHandlers() {
        // Handle virtual keyboard appearance/disappearance
        let initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            // If height decreased significantly, keyboard is likely open
            if (heightDifference > 150) {
                document.body.classList.add('keyboard-open');
                this.adjustLayoutForKeyboard(true);
            } else {
                document.body.classList.remove('keyboard-open');
                this.adjustLayoutForKeyboard(false);
            }
        });
    }

    /**
     * Adjust layout when virtual keyboard is open
     */
    adjustLayoutForKeyboard(keyboardOpen) {
        const editorContainer = document.querySelector('.editor-container');
        const errorPanel = document.querySelector('.error-panel');
        
        if (keyboardOpen) {
            // Reduce editor height when keyboard is open
            if (editorContainer) {
                editorContainer.style.maxHeight = '50vh';
            }
            
            // Hide error panel when keyboard is open
            if (errorPanel && !errorPanel.classList.contains('hidden')) {
                errorPanel.style.display = 'none';
            }
        } else {
            // Restore normal layout
            if (editorContainer) {
                editorContainer.style.maxHeight = '';
            }
            
            // Restore error panel
            if (errorPanel && !errorPanel.classList.contains('hidden')) {
                errorPanel.style.display = '';
            }
        }
    }

    /**
     * Enable mobile-specific gestures
     */
    enableMobileGestures() {
        // Add swipe gesture for tree mode toggle on mobile
        if (this.isMobile) {
            this.setupSwipeGestures();
        }
    }

    /**
     * Setup swipe gestures for mobile
     */
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        const editorContainer = document.querySelector('.editor-container');
        if (!editorContainer) return;
        
        editorContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        editorContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Check if it's a horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                // Only handle swipes in tree mode
                if (editorContainer.classList.contains('tree-mode')) {
                    if (deltaX > 0) {
                        // Swipe right - show tree panel
                        this.showTreePanel();
                    } else {
                        // Swipe left - show editor panel
                        this.showEditorPanel();
                    }
                }
            }
        });
    }

    /**
     * Show tree panel (mobile tree mode)
     */
    showTreePanel() {
        const editorPanel = document.querySelector('.editor-panel');
        const treePanel = document.querySelector('.tree-panel');
        
        if (editorPanel && treePanel) {
            editorPanel.style.display = 'none';
            treePanel.style.display = 'block';
            treePanel.style.flex = '1';
        }
    }

    /**
     * Show editor panel (mobile tree mode)
     */
    showEditorPanel() {
        const editorPanel = document.querySelector('.editor-panel');
        const treePanel = document.querySelector('.tree-panel');
        
        if (editorPanel && treePanel) {
            editorPanel.style.display = 'block';
            editorPanel.style.flex = '1';
            treePanel.style.display = 'none';
        }
    }

    /**
     * Handle initial layout setup
     */
    handleInitialLayout() {
        // Ensure proper initial layout based on device
        setTimeout(() => {
            if (this.uiManager.jsonEditor) {
                this.uiManager.jsonEditor.refresh();
            }
        }, 100);
    }

    /**
     * Get current device info
     */
    getDeviceInfo() {
        return {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            isDesktop: this.isDesktop,
            isTouch: this.isTouch,
            orientation: this.orientation,
            viewport: this.viewport
        };
    }
}
