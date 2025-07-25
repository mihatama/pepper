// Gemini API Integration Module
class GeminiAPI {
    constructor() {
        this.apiKey = null;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-1.5-flash';
        this.imageModel = 'imagen-3.0-generate-001';
        this.setupAPIKey();
    }

    async setupAPIKey() {
        // Try to get API key from various sources
        // 1. From window object (set by build process)
        // 2. From meta tag (set by build process)
        // 3. From config.json file (generated at build time)
        // 4. Fallback to placeholder for development
        
        this.apiKey = window.VITE_GEMINI_API_KEY || 
                     window.REACT_APP_GEMINI_API_KEY ||
                     this.getMetaContent('gemini-api-key');
        
        // If no API key found, try to load from config.json
        if (!this.apiKey || this.apiKey.trim() === '') {
            try {
                const response = await fetch('/config.json');
                if (response.ok) {
                    const config = await response.json();
                    if (config.apiKey && config.apiKey.trim() !== '') {
                        this.apiKey = config.apiKey;
                        console.log('🔑 API key loaded from config.json');
                    }
                }
            } catch (error) {
                console.log('📄 Could not load config.json:', error.message);
            }
        }
        
        // Remove empty strings and whitespace
        if (this.apiKey && this.apiKey.trim() === '') {
            this.apiKey = 'YOUR_GEMINI_API_KEY_HERE';
        }
        
        if (this.apiKey === 'YOUR_GEMINI_API_KEY_HERE' || !this.apiKey) {
            console.warn('🔑 Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable in Netlify.');
            console.log('📝 For demo purposes, using mock data instead of real API calls.');
            console.log('💡 To enable LLM: Set VITE_GEMINI_API_KEY in Netlify → Site settings → Environment variables');
        } else {
            console.log('✅ Gemini API key configured successfully');
            console.log('🤖 LLM-powered taste analysis is now active!');
        }
    }

    // Try to get environment variable from Netlify context
    getNetlifyEnvVar() {
        // Check if we're on Netlify and try to access environment variables
        if (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('netlify.com')) {
            // In a real Netlify deployment, environment variables would be injected at build time
            // For now, return null to use mock data
            return null;
        }
        return null;
    }

    // Helper method to get content from meta tags
    getMetaContent(name) {
        const meta = document.querySelector(`meta[name="${name}"]`);
        return meta ? meta.getAttribute('content') : null;
    }

    // Analyze taste description and return flavor profile
    async analyzeTaste(description) {
        if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            // Return mock data for demo purposes
            return this.getMockTasteAnalysis(description);
        }

        const prompt = this.createTasteAnalysisPrompt(description);
        
        try {
            const response = await this.callGeminiAPI(prompt);
            return this.parseTasteResponse(response);
        } catch (error) {
            console.error('Gemini API error:', error);
            // Fallback to mock data
            return this.getMockTasteAnalysis(description);
        }
    }

    // Analyze dish and return flavor profile
    async analyzeDish(dishName) {
        if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            // Return mock data for demo purposes
            return this.getMockDishAnalysis(dishName);
        }

        const prompt = this.createDishAnalysisPrompt(dishName);
        
        try {
            const response = await this.callGeminiAPI(prompt);
            return this.parseDishResponse(response);
        } catch (error) {
            console.error('Gemini API error:', error);
            // Fallback to mock data
            return this.getMockDishAnalysis(dishName);
        }
    }

    // Generate dish image using Canvas (Gemini API doesn't support image generation)
    async generateDishImage(dishName) {
        // Always use Canvas-generated image since Gemini API doesn't support image generation
        return this.getMockDishImage(dishName);
    }

    // Create taste analysis prompt
    createTasteAnalysisPrompt(description) {
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
        
        const prompt = currentLang === 'ja' ? 
            `以下の味の説明を分析して、5つの要素（辛味、香り、酸味、フレッシュ感、深み）を0-100のスケールで評価してください。

味の説明: "${description}"

以下のJSON形式で回答してください：
{
  "spiciness": 数値(0-100),
  "aroma": 数値(0-100),
  "citrusy": 数値(0-100),
  "freshness": 数値(0-100),
  "depth": 数値(0-100),
  "analysis": "分析の説明"
}` :
            `Analyze the following taste description and rate it on 5 flavor dimensions (spiciness, aroma, citrusy, freshness, depth) on a scale of 0-100.

Taste description: "${description}"

Please respond in the following JSON format:
{
  "spiciness": number(0-100),
  "aroma": number(0-100),
  "citrusy": number(0-100),
  "freshness": number(0-100),
  "depth": number(0-100),
  "analysis": "explanation of the analysis"
}`;

        return prompt;
    }

    // Create dish analysis prompt
    createDishAnalysisPrompt(dishName) {
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
        
        const prompt = currentLang === 'ja' ? 
            `料理「${dishName}」の典型的な味のプロファイルを分析して、5つの要素（辛味、香り、酸味、フレッシュ感、深み）を0-100のスケールで評価してください。

以下のJSON形式で回答してください：
{
  "spiciness": 数値(0-100),
  "aroma": 数値(0-100),
  "citrusy": 数値(0-100),
  "freshness": 数値(0-100),
  "depth": 数値(0-100),
  "description": "料理の説明",
  "cuisine": "料理の種類",
  "characteristics": "味の特徴"
}` :
            `Analyze the typical flavor profile of the dish "${dishName}" and rate it on 5 flavor dimensions (spiciness, aroma, citrusy, freshness, depth) on a scale of 0-100.

Please respond in the following JSON format:
{
  "spiciness": number(0-100),
  "aroma": number(0-100),
  "citrusy": number(0-100),
  "freshness": number(0-100),
  "depth": number(0-100),
  "description": "description of the dish",
  "cuisine": "type of cuisine",
  "characteristics": "flavor characteristics"
}`;

        return prompt;
    }

    // Call Gemini API
    async callGeminiAPI(prompt) {
        const response = await fetch(`${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    // Parse taste analysis response
    parseTasteResponse(response) {
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    profile: [
                        parsed.spiciness || 50,
                        parsed.aroma || 50,
                        parsed.citrusy || 50,
                        parsed.freshness || 50,
                        parsed.depth || 50
                    ],
                    analysis: parsed.analysis || 'Analysis completed'
                };
            }
        } catch (error) {
            console.error('Error parsing taste response:', error);
        }
        
        // Fallback
        return {
            profile: [50, 50, 50, 50, 50],
            analysis: 'Unable to parse analysis'
        };
    }

    // Parse dish analysis response
    parseDishResponse(response) {
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    profile: [
                        parsed.spiciness || 50,
                        parsed.aroma || 50,
                        parsed.citrusy || 50,
                        parsed.freshness || 50,
                        parsed.depth || 50
                    ],
                    description: parsed.description || '',
                    cuisine: parsed.cuisine || '',
                    characteristics: parsed.characteristics || ''
                };
            }
        } catch (error) {
            console.error('Error parsing dish response:', error);
        }
        
        // Fallback
        return {
            profile: [50, 50, 50, 50, 50],
            description: 'Dish analysis unavailable',
            cuisine: 'Unknown',
            characteristics: 'Unable to analyze'
        };
    }

    // Mock data for demo purposes
    getMockTasteAnalysis(description) {
        // Simple keyword-based analysis for demo
        const keywords = description.toLowerCase();
        let profile = [50, 50, 50, 50, 50];

        if (keywords.includes('spicy') || keywords.includes('hot') || keywords.includes('辛い')) {
            profile[0] = 80;
        }
        if (keywords.includes('aromatic') || keywords.includes('fragrant') || keywords.includes('香り')) {
            profile[1] = 75;
        }
        if (keywords.includes('citrus') || keywords.includes('lemon') || keywords.includes('酸味')) {
            profile[2] = 70;
        }
        if (keywords.includes('fresh') || keywords.includes('bright') || keywords.includes('フレッシュ')) {
            profile[3] = 80;
        }
        if (keywords.includes('rich') || keywords.includes('deep') || keywords.includes('深み')) {
            profile[4] = 85;
        }

        return {
            profile: profile,
            analysis: 'Mock analysis based on keywords'
        };
    }

    getMockDishAnalysis(dishName) {
        // Predefined profiles for common dishes (English and Japanese)
        const dishProfiles = {
            'pad thai': [70, 80, 85, 90, 75],
            'carbonara': [20, 70, 10, 40, 90],
            'tandoori chicken': [90, 85, 30, 50, 95],
            'sushi': [10, 60, 20, 95, 80],
            'pizza': [40, 75, 30, 60, 80],
            'curry': [85, 90, 40, 50, 95],
            'salad': [20, 60, 70, 95, 30],
            'steak': [30, 70, 10, 40, 95],
            // Japanese dishes
            'ラーメン': [60, 80, 30, 50, 90],
            'ramen': [60, 80, 30, 50, 90],
            'カレー': [85, 90, 40, 50, 95],
            'シチュー': [30, 70, 20, 40, 85],
            'stew': [30, 70, 20, 40, 85],
            'ホワイトシチュー': [20, 60, 15, 45, 80],
            'white stew': [20, 60, 15, 45, 80],
            '鶏肉': [40, 70, 25, 60, 75],
            'chicken': [40, 70, 25, 60, 75],
            'パスタ': [35, 65, 40, 55, 70],
            'pasta': [35, 65, 40, 55, 70],
            '寿司': [10, 60, 20, 95, 80],
            '天ぷら': [25, 55, 30, 70, 65],
            'tempura': [25, 55, 30, 70, 65]
        };

        const normalizedName = dishName.toLowerCase();
        let profile = [50, 60, 40, 60, 70]; // Default profile
        let matchedDish = '';

        // Find matching dish
        for (const [dish, dishProfile] of Object.entries(dishProfiles)) {
            if (normalizedName.includes(dish.toLowerCase())) {
                profile = dishProfile;
                matchedDish = dish;
                break;
            }
        }

        // Generate more realistic description based on the dish
        let description = `A delicious ${dishName} with balanced flavors`;
        let cuisine = 'International';
        let characteristics = 'Mock analysis for demonstration';

        if (matchedDish) {
            if (matchedDish.includes('curry') || matchedDish.includes('カレー')) {
                description = `${dishName} is a rich, aromatic dish with complex spices`;
                cuisine = 'Asian';
                characteristics = 'Rich, spicy, and deeply flavorful';
            } else if (matchedDish.includes('sushi') || matchedDish.includes('寿司')) {
                description = `${dishName} features fresh, clean flavors with subtle complexity`;
                cuisine = 'Japanese';
                characteristics = 'Fresh, clean, and delicate';
            } else if (matchedDish.includes('pasta') || matchedDish.includes('パスタ')) {
                description = `${dishName} offers comforting flavors with Italian flair`;
                cuisine = 'Italian';
                characteristics = 'Comforting and satisfying';
            }
        }

        return {
            profile: profile,
            description: description,
            cuisine: cuisine,
            characteristics: characteristics
        };
    }

    getMockDishImage(dishName) {
        // Use a more reliable image service or create a data URL
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 300);
        
        // Add text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Split long dish names into multiple lines
        const maxWidth = 350;
        const words = dishName.split(' ');
        let lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        
        // Draw text lines
        const lineHeight = 30;
        const startY = 150 - (lines.length - 1) * lineHeight / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, 200, startY + index * lineHeight);
        });
        
        // Add food emoji
        ctx.font = '48px Arial';
        ctx.fillText('🍽️', 200, 100);
        
        return canvas.toDataURL('image/png');
    }

    // Utility method to check if API is configured
    isConfigured() {
        return this.apiKey && this.apiKey !== 'YOUR_GEMINI_API_KEY_HERE';
    }

    // Set API key (for configuration)
    setAPIKey(apiKey) {
        this.apiKey = apiKey;
    }
}

// Initialize Gemini API
const geminiAPI = new GeminiAPI();

// Export for global use
window.GeminiAPI = GeminiAPI;
window.geminiAPI = geminiAPI;
