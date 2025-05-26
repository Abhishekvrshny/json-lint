# JSON Tool - Online JSON Validator and Formatter

[![GitHub Repository](https://img.shields.io/badge/GitHub-json--tool-blue?logo=github)](https://github.com/Abhishekvrshny/json-tool)

A powerful, frontend-only JSON validation and formatting tool built with vanilla JavaScript. Perfect for developers who need to quickly validate, format, and work with JSON data.

## 🚀 Features

- **JSON Validation**: Real-time validation with detailed error messages
- **JSON Formatting**: Beautiful syntax highlighting and proper indentation
- **JSON Compression**: Minify JSON by removing unnecessary whitespace
- **Dark/Light Theme**: Toggle between themes with automatic system preference detection
- **Copy to Clipboard**: One-click copying of formatted JSON
- **Download JSON**: Save formatted JSON as a file
- **Sample Data**: Load sample JSON for testing
- **Keyboard Shortcuts**: Efficient workflow with keyboard shortcuts
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices with touch support
- **Tree View Mode**: Interactive JSON tree visualization with collapsible nodes
- **Format Conversion**: Convert JSON to YAML, TOML, and XML formats
- **Type Generation**: Generate TypeScript, Go, Kotlin, Rust, and JSON Schema types
- **Touch Gestures**: Swipe navigation for mobile tree mode
- **Adaptive Layout**: Smart layout adjustments based on device orientation
- **No Backend Required**: Completely client-side application

## 🎯 Live Demo

Visit the live application: [JSON Tool](https://abhishekvrshny.github.io/json-tool)

## 🛠️ Usage

### Basic Operations

1. **Validate JSON**: Paste your JSON in the input panel and click "Validate"
2. **Format JSON**: Click "Format" to beautify your JSON with proper indentation
3. **Compress JSON**: Check the "Compress" checkbox to minify your JSON
4. **Copy Result**: Click "Copy" to copy the formatted JSON to clipboard
5. **Download**: Click "Download" to save the JSON as a file

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Format JSON
- `Ctrl/Cmd + L`: Load Sample JSON
- `Ctrl/Cmd + K`: Clear Input
- `Ctrl/Cmd + D`: Toggle Dark Mode

### Features in Detail

#### JSON Validation
- Real-time validation as you type (with debouncing)
- Detailed error messages with line and column information
- Visual error highlighting in the editor

#### Syntax Highlighting
- Color-coded JSON elements (keys, strings, numbers, booleans, null)
- Different color schemes for light and dark themes
- Line numbers and code folding

#### Tree View Mode
- Interactive JSON tree visualization with collapsible nodes
- Split-screen layout showing both editor and tree view
- Click on tree nodes to highlight corresponding lines in editor
- Swipe gestures on mobile for easy navigation between editor and tree

#### Format Conversion
- Convert JSON to YAML, TOML, and XML formats
- One-click conversion with undo functionality
- Maintains formatting and structure during conversion

#### Type Generation
- Generate TypeScript interfaces and types
- Create Go structs with proper tags
- Generate Kotlin data classes
- Create Rust structs with serialization
- Generate JSON Schema definitions

#### Theme Support
- Automatic detection of system preference
- Manual toggle between light and dark themes
- Persistent theme selection (saved in localStorage)

#### Responsive Design
- **Mobile Optimized**: Touch-friendly interface with larger buttons and improved spacing
- **Tablet Support**: Adaptive layout that works in both portrait and landscape orientations
- **Desktop Experience**: Full-featured interface with all controls visible
- **Touch Gestures**: Swipe left/right in tree mode to switch between editor and tree view on mobile
- **Virtual Keyboard Handling**: Smart layout adjustments when mobile keyboard is open
- **Orientation Support**: Automatic layout changes based on device orientation
- **Device Detection**: Intelligent detection of device type and capabilities
- **Accessibility**: High contrast colors and proper touch targets for all devices

## 🏗️ Technical Details

### Architecture

The application follows a modular architecture with specialized components:

- **JSONLinter**: Core JSON validation and formatting logic
- **UIManager**: Main UI controller and component coordination
- **ResponsiveManager**: Device detection and responsive behavior handling
- **ThemeManager**: Theme switching and persistence
- **EditorManager**: CodeMirror integration and editor functionality
- **TreeManager**: JSON tree visualization and interaction
- **ConversionManager**: Format conversion between JSON, YAML, TOML, XML
- **TypeGeneratorManager**: Code generation for multiple programming languages

### Responsive Features

The application includes a comprehensive responsive system:

#### Device Detection
- Automatic detection of mobile, tablet, and desktop devices
- Touch capability detection
- Orientation change handling
- Viewport dimension tracking

#### Adaptive Layouts
- **Mobile (≤480px)**: Vertical layout, larger touch targets, simplified controls
- **Tablet (481px-768px)**: Flexible layout adapting to orientation
- **Desktop (>768px)**: Full horizontal layout with all features visible

#### Touch Optimizations
- Larger touch targets (minimum 44px) for better accessibility
- Touch feedback with visual states
- Swipe gestures for navigation
- Prevention of accidental zoom on double-tap

#### Performance Optimizations
- Debounced resize event handling
- Efficient DOM updates
- Optimized font sizes for different screen sizes
- Reduced motion support for accessibility

### Dependencies

- **CodeMirror 5**: Advanced code editor with syntax highlighting
- **js-yaml**: YAML parsing and generation
- **@iarna/toml**: TOML parsing and generation
- **PapaParse**: CSV parsing capabilities

### Browser Support

- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 7+)

## 📁 Project Structure

```
json-tool/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Application styles with responsive design
├── js/
│   ├── main.js            # Application entry point
│   ├── linter.js          # JSON validation logic
│   ├── ui.js              # Legacy UI management
│   ├── generators/        # Type generators for different languages
│   │   ├── typescript.js
│   │   ├── go.js
│   │   ├── kotlin.js
│   │   ├── rust.js
│   │   └── jsonSchema.js
│   └── ui/               # Modular UI components
│       ├── conversion.js  # Format conversion handling
│       ├── core.js       # Main UI manager
│       ├── editor.js     # CodeMirror integration
│       ├── events.js     # Event handling
│       ├── font.js       # Font size management
│       ├── format.js     # JSON formatting
│       ├── responsive.js # Responsive behavior (NEW)
│       ├── theme.js      # Theme management
│       ├── tree.js       # Tree view functionality
│       └── typeGenerator.js # Type generation UI
├── .gitignore             # Git ignore rules
├── LICENSE                # MIT License
└── README.md              # This file
```

## 🚀 Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages:

1. Push your code to the `main` branch
2. GitHub Actions will automatically deploy to GitHub Pages
3. Your site will be available at `https://abhishekvrshny.github.io/json-tool`

### Manual Deployment

Since this is a static site, you can deploy it anywhere:

1. Upload all files to your web server
2. Ensure `index.html` is accessible
3. No server-side configuration required

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Abhishekvrshny/json-tool.git
   cd json-tool
   ```

2. Open `index.html` in your browser or serve with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. Navigate to `http://localhost:8000`

## 📱 Mobile Usage

The JSON Tool is fully optimized for mobile devices:

### Mobile Features
- **Touch-Friendly Interface**: All buttons and controls are sized for easy touch interaction
- **Swipe Navigation**: In tree mode, swipe left/right to switch between editor and tree view
- **Adaptive Header**: Controls automatically reorganize based on screen size
- **Virtual Keyboard Support**: Layout adjusts when mobile keyboard appears
- **Orientation Support**: Works seamlessly in both portrait and landscape modes

### Mobile Gestures
- **Swipe Right**: Show tree panel (in tree mode)
- **Swipe Left**: Show editor panel (in tree mode)
- **Tap**: Standard interaction for all buttons and controls
- **Long Press**: Context-sensitive actions where applicable

## 🎨 Customization

### Themes

The application supports custom themes through CSS variables. You can modify the color scheme by updating the CSS variables in `css/styles.css`:

```css
:root {
    --primary-color: #3b82f6;
    --success-color: #10b981;
    --error-color: #ef4444;
    /* ... other variables */
}
```

### Responsive Breakpoints

Customize responsive behavior by modifying breakpoints in `js/ui/responsive.js`:

```javascript
this.breakpoints = {
    mobile: 480,
    tablet: 768,
    desktop: 1024
};
```

### Adding Features

The modular architecture makes it easy to add new features:

1. Add new methods to the appropriate manager class
2. Update the UI in `index.html` if needed
3. Add corresponding styles in `css/styles.css`
4. Consider responsive behavior in `js/ui/responsive.js`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow the existing code style and structure
2. Add comments for complex logic
3. Test your changes across different browsers and devices
4. Update documentation as needed
5. Consider responsive design in all UI changes

### Testing Responsive Design

When contributing responsive features:

1. Test on actual mobile devices when possible
2. Use browser developer tools to simulate different screen sizes
3. Test both portrait and landscape orientations
4. Verify touch interactions work properly
5. Check that text remains readable at all sizes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CodeMirror](https://codemirror.net/) for the excellent code editor
- [js-yaml](https://github.com/nodeca/js-yaml) for YAML parsing
- [@iarna/toml](https://github.com/iarna/iarna-toml) for TOML support
- The open-source community for inspiration and best practices

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Abhishekvrshny/json-tool/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide as much detail as possible, including:
   - Browser version and device type
   - Screen size and orientation
   - Steps to reproduce the issue
   - Expected vs actual behavior

---

Made with ❤️ for the developer community
