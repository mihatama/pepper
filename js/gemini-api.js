// Gemini API Integration Module
class GeminiAPI {
    constructor() {
        this.apiKey = null;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-pro';
        this.imageModel = 'imagen-3.0-generate-001';
        this.setupAPIKey();
    }

    setupAPIKey() {
        // Try to get API key from various sources
        // 1. From window object (set by build process)
        // 2. From meta tag (set by build process)
        // 3. Fallback to placeholder for development
        
        this.apiKey = window.VITE_GEMINI_API_KEY || 
                     window.REACT_APP_GEMINI_API_KEY ||
                     this.getMetaContent('gemini-api-key') ||
                     'YOUR_GEMINI_API_KEY_HERE';
        
        if (this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            console.warn('Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable in Netlify.');
        }
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

    // Generate dish image using Imagen
    async generateDishImage(dishName) {
        if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            // Return mock image for demo purposes
            return this.getMockDishImage(dishName);
        }

        try {
            const prompt = `A beautifully plated ${dishName}, professional food photography, high quality, appetizing, well-lit`;
            
            const response = await fetch(`${this.baseURL}/models/${this.imageModel}:generateImage?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: {
                        text: prompt
                    },
                    safetySettings: [
                        {
                            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates[0].image.data;
        } catch (error) {
            console.error('Image generation error:', error);
            // Fallback to mock image
            return this.getMockDishImage(dishName);
        }
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
        // Predefined profiles for common dishes
        const dishProfiles = {
            'pad thai': [70, 80, 85, 90, 75],
            'carbonara': [20, 70, 10, 40, 90],
            'tandoori chicken': [90, 85, 30, 50, 95],
            'sushi': [10, 60, 20, 95, 80],
            'pizza': [40, 75, 30, 60, 80],
            'curry': [85, 90, 40, 50, 95],
            'salad': [20, 60, 70, 95, 30],
            'steak': [30, 70, 10, 40, 95]
        };

        const normalizedName = dishName.toLowerCase();
        let profile = [50, 60, 40, 60, 70]; // Default profile

        // Find matching dish
        for (const [dish, dishProfile] of Object.entries(dishProfiles)) {
            if (normalizedName.includes(dish)) {
                profile = dishProfile;
                break;
            }
        }

        return {
            profile: profile,
            description: `A delicious ${dishName} with balanced flavors`,
            cuisine: 'International',
            characteristics: 'Mock analysis for demonstration'
        };
    }

    getMockDishImage(dishName) {
        // Return a placeholder image URL
        const encodedDishName = encodeURIComponent(dishName);
        return `https://via.placeholder.com/400x300/667eea/ffffff?text=${encodedDishName}`;
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
