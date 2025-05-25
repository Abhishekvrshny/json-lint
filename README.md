# JSON Lint

A modern, minimalistic JSON linting tool for validation, formatting, and error highlighting. Built entirely with frontend technologies and hosted on GitHub Pages.

## 🚀 Features

- **JSON Validation** - Real-time validation with detailed error messages
- **JSON Formatting** - Pretty-print JSON with proper indentation
- **Error Highlighting** - Clear error messages with line/column information
- **Dark/Light Mode** - Toggle between themes with system preference detection
- **Copy to Clipboard** - One-click copy of formatted JSON
- **Download JSON** - Save formatted JSON as a file
- **Sample JSON** - Load sample data for quick testing
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Keyboard Shortcuts** - Efficient workflow with hotkeys
- **Statistics** - View JSON size, character count, and structure info

## 🎯 Live Demo

Visit the live application: [https://abhishekvarshney.github.io/json-lint](https://abhishekvarshney.github.io/json-lint)

## 🛠️ Technologies Used

- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with CSS variables and grid layout
- **JavaScript (ES6+)** - Modular application architecture
- **CodeMirror** - Syntax highlighting and code editing
- **JSONLint** - Enhanced JSON validation and error reporting

## 📋 Usage

### Basic Usage

1. **Paste or type JSON** into the input panel
2. **Auto-validation** occurs as you type
3. **Click "Format"** to prettify valid JSON
4. **Copy or download** the formatted result

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter` - Format JSON
- `Ctrl/Cmd + L` - Load sample JSON
- `Ctrl/Cmd + K` - Clear input
- `Ctrl/Cmd + D` - Toggle dark/light mode

### Features in Detail

#### JSON Validation
- Real-time validation as you type
- Detailed error messages with line/column information
- Support for nested objects and arrays
- Handles various JSON data types

#### JSON Formatting
- Customizable indentation (default: 2 spaces)
- Preserves data structure and types
- Handles large JSON files efficiently
- Maintains proper JSON syntax

#### Error Highlighting
- Visual error indicators in the status bar
- Detailed error panel with specific error messages
- Line and column information for syntax errors
- Clear error descriptions for quick debugging

## 🏗️ Project Structure

```
json-lint/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Application styles
├── js/
│   ├── linter.js           # JSON validation and formatting logic
│   ├── ui.js               # User interface management
│   └── main.js             # Application entry point
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT License
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/abhishekvarshney/json-lint.git
   cd json-lint
   ```

2. **Open in browser**
   ```bash
   # Using Python (if installed)
   python -m http.server 8000
   
   # Using Node.js (if installed)
   npx http-server
   
   # Or simply open index.html in your browser
   open index.html
   ```

3. **Start developing**
   - Edit files in your preferred code editor
   - Refresh browser to see changes
   - No build process required!

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages:

1. **Fork or clone** this repository
2. **Enable GitHub Pages** in repository settings
3. **Select source** as "Deploy from a branch"
4. **Choose branch** as "main" and folder as "/ (root)"
5. **Your site** will be available at `https://yourusername.github.io/json-lint`

## 🎨 Customization

### Themes
The application supports both light and dark themes with CSS variables for easy customization:

```css
:root {
    --primary-color: #3b82f6;
    --success-color: #10b981;
    --error-color: #ef4444;
    /* ... more variables */
}
```

### Adding Features
The modular architecture makes it easy to add new features:

1. **Add UI elements** in `index.html`
2. **Style components** in `css/styles.css`
3. **Implement logic** in appropriate JS modules
4. **Wire up events** in `js/ui.js`

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and patterns
- Add comments for complex logic
- Test thoroughly across different browsers
- Ensure responsive design works on all devices
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CodeMirror](https://codemirror.net/) - For the excellent code editor
- [JSONLint](https://github.com/zaach/jsonlint) - For enhanced JSON validation
- [GitHub Pages](https://pages.github.com/) - For free hosting

## 📞 Support

If you encounter any issues or have questions:

1. **Check existing issues** on GitHub
2. **Create a new issue** with detailed information
3. **Include browser version** and steps to reproduce

## 🔮 Future Enhancements

- [ ] JSON Schema validation
- [ ] JSONPath query support
- [ ] Import/Export settings
- [ ] Multiple file support
- [ ] Diff comparison tool
- [ ] API integration examples
- [ ] Progressive Web App (PWA) features

---

Made with ❤️ for JSON validation and formatting
