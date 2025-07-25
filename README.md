# Pepper Craft AI 🌶️

A Progressive Web Application for creating custom pepper blend recipes using AI-powered flavor analysis.

## 🌟 Features

### Core Functionality
- **Manual Blend Creation**: Use interactive sliders to create custom flavor profiles
- **AI Taste Analysis**: Describe desired flavors in natural language and get AI-generated pepper blends
- **Dish Recipe Enhancement**: Enter any dish name to generate images and enhance flavors with peppers
- **Radar Chart Visualization**: Visual representation of flavor profiles using interactive charts

### Technical Features
- **Progressive Web App (PWA)**: Install and use offline on any device
- **Multilingual Support**: Full English and Japanese localization
- **Voice Input**: Speech recognition for hands-free input
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Cross-Platform**: Works on Android, iPhone, tablets, and PC

## 🚀 Live Demo

**Live Site**: [https://peppercraftai.netlify.app/](https://peppercraftai.netlify.app/)

The app is deployed on Netlify and ready to use. All features including AI-powered pepper blend calculations, dish analysis, and multilingual support are available.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js with radar chart visualization
- **AI Integration**: Google Gemini API for taste analysis and image generation
- **PWA**: Service Worker for offline functionality
- **Internationalization**: Custom i18n system with JSON translation files
- **Speech**: Web Speech API for voice recognition and synthesis

## 📱 Installation

### As a Web App
1. Visit the deployed URL
2. Click the "Install" button in your browser
3. The app will be added to your home screen

### For Development
1. Clone this repository
2. Open `index.html` in a modern web browser
3. For full functionality, serve from a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

## 🔧 Configuration

### Gemini API Setup

#### For Local Development
1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/)
2. Update the API key in `js/gemini-api.js`:
   ```javascript
   this.apiKey = 'YOUR_ACTUAL_API_KEY_HERE';
   ```

#### For Netlify Deployment
1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/)
2. Set the environment variable in Netlify:
   - Go to Site settings → Environment variables
   - Add variable: `VITE_GEMINI_API_KEY` = `your-actual-api-key`
3. Deploy the site (the build process will automatically inject the API key)

For detailed Netlify setup instructions, see [NETLIFY_SETUP.md](NETLIFY_SETUP.md).

### PWA Icons
1. Create icon files in the `assets/icons/` directory
2. Use the sizes specified in `assets/icons/README.md`
3. Update `manifest.json` if needed

## 📖 Usage Guide

### Manual Blend Mode
1. Adjust the five flavor sliders:
   - **Spiciness**: Heat level
   - **Aroma**: Fragrance intensity
   - **Citrusy**: Citrus notes
   - **Freshness**: Bright, fresh qualities
   - **Depth**: Rich, complex flavors
2. View the radar chart visualization
3. Get the calculated pepper blend recipe

### AI Taste Mode
1. Click the microphone button or type your taste description
2. Describe what you want (e.g., "I want something spicy and aromatic for grilled meat")
3. The AI will analyze your description and generate a flavor profile
4. Get a custom pepper blend based on the analysis

### Dish Recipe Mode
1. Enter any dish name (works with international cuisines)
2. The app will:
   - Generate an image of the dish
   - Analyze the dish's typical flavor profile
   - Suggest peppers to enhance the dish
   - Show how the enhanced profile creates a more balanced pentagon shape

## 🌍 Internationalization

The app supports:
- **English**: Default language
- **Japanese**: Full translation including UI and voice recognition

Switch languages using the toggle button in the header.

## 🎯 Pepper Types

The app calculates blends using five pepper types:

1. **Red Pepper**: High spiciness and depth
2. **Pink Pepper**: Aromatic with citrusy notes
3. **Black Pepper**: Classic spiciness with earthy depth
4. **Green Pepper**: Fresh and bright
5. **Coriander**: Aromatic with citrusy warmth

## 📊 Algorithm

The pepper calculation algorithm:
1. Analyzes the desired flavor profile (5 dimensions)
2. Matches each pepper's characteristics to the target profile
3. Calculates optimal ratios using weighted similarity scoring
4. Ensures minimum amounts for balanced blends
5. Provides measurements in grams with percentage breakdowns

## 🔧 Development

### File Structure
```
pepper-craft-ai/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── css/
│   ├── style.css          # Main styles
│   └── responsive.css     # Responsive design
├── js/
│   ├── app.js             # Main application logic
│   ├── i18n.js            # Internationalization
│   ├── radar-chart.js     # Chart functionality
│   ├── pepper-calculator.js # Blend calculation
│   ├── speech-recognition.js # Voice features
│   └── gemini-api.js      # AI integration
├── locales/
│   ├── en.json            # English translations
│   └── ja.json            # Japanese translations
└── assets/
    └── icons/             # PWA icons
```

### Adding New Languages
1. Create a new JSON file in `locales/` (e.g., `fr.json`)
2. Add the language to the `getFallbackTranslations` method in `i18n.js`
3. Update the language toggle functionality

### Customizing Pepper Types
1. Modify the `pepperTypes` object in `pepper-calculator.js`
2. Update the translation files with new pepper names
3. Adjust the calculation algorithm if needed

## 🚀 Deployment

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set build command: (none needed for static site)
3. Set publish directory: `/` (root)
4. Deploy!

### Environment Variables
For production deployment, set:
- `GEMINI_API_KEY`: Your Google Gemini API key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on multiple devices
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Chart.js for beautiful radar charts
- Web Speech API for voice features
- The pepper and spice community for inspiration

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Ensure you have a stable internet connection for AI features
3. Verify microphone permissions for voice input
4. Try refreshing the page or clearing browser cache

---

**Made with ❤️ for pepper enthusiasts worldwide**
