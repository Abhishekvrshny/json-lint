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
- **Responsive Design**: Works on desktop, tablet, and mobile devices
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

#### Theme Support
- Automatic detection of system preference
- Manual toggle between light and dark themes
- Persistent theme selection (saved in localStorage)

## 🏗️ Technical Details

### Architecture

The application follows a modular architecture with three main components:

- **JSONLinter**: Core JSON validation and formatting logic
- **UIManager**: User interface interactions and DOM manipulation
- **JSONLintApp**: Main application controller and initialization

### Dependencies

- **CodeMirror 5**: Advanced code editor with syntax highlighting
- **JSONLint**: Enhanced JSON parsing with better error messages (optional)

### Browser Support

- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📁 Project Structure

```
json-tool/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Application styles
├── js/
│   ├── main.js            # Application entry point
│   ├── linter.js          # JSON validation logic
│   ├── ui.js              # UI management
│   ├── generators/        # Type generators for different languages
│   │   ├── typescript.js
│   │   ├── go.js
│   │   ├── kotlin.js
│   │   ├── rust.js
│   │   └── jsonSchema.js
│   └── ui/               # Modular UI components
│       ├── conversion.js
│       ├── core.js
│       ├── editor.js
│       ├── events.js
│       ├── font.js
│       ├── format.js
│       ├── theme.js
│       ├── tree.js
│       └── typeGenerator.js
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

### Adding Features

The modular architecture makes it easy to add new features:

1. Add new methods to the appropriate class (`JSONLinter`, `UIManager`, or `JSONLintApp`)
2. Update the UI in `index.html` if needed
3. Add corresponding styles in `css/styles.css`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow the existing code style and structure
2. Add comments for complex logic
3. Test your changes across different browsers
4. Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CodeMirror](https://codemirror.net/) for the excellent code editor
- [JSONLint](https://github.com/zaach/jsonlint) for enhanced JSON parsing
- The open-source community for inspiration and best practices

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Abhishekvrshny/json-tool/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide as much detail as possible, including browser version and steps to reproduce

---

Made with ❤️ for the developer community
