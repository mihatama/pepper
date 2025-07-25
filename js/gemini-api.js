// Gemini API Integration Module
class GeminiAPI {
    constructor() {
        this.apiKey = null;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-1.5-flash';
        this.imageModel = 'imagen-3.0-generate-001'; // 公式ドキュメント推奨モデル
        this.imageCache = new Map(); // 画像キャッシュ
        this.maxCacheSize = 50; // 最大キャッシュサイズ
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

    // Generate dish image using Gemini Imagen API
    async generateDishImage(dishName) {
        // Check cache first
        const cacheKey = dishName.toLowerCase().trim();
        if (this.imageCache.has(cacheKey)) {
            console.log('🖼️ Using cached image for:', dishName);
            return this.imageCache.get(cacheKey);
        }

        if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            console.log('🔑 No API key, using enhanced canvas image');
            return this.getEnhancedDishImage(dishName);
        }

        try {
            // Try Gemini Imagen API first
            console.log('🎨 Generating AI image for:', dishName);
            const aiImageUrl = await this.generateDishImageWithAI(dishName);
            if (aiImageUrl) {
                this.addToCache(cacheKey, aiImageUrl);
                return aiImageUrl;
            }
        } catch (error) {
            console.log('🎨 Gemini image generation failed:', error.message);
        }

        try {
            // Fallback to free external APIs
            console.log('🌐 Trying external image APIs for:', dishName);
            const imageUrl = await this.fetchDishImageFromAPI(dishName);
            if (imageUrl) {
                this.addToCache(cacheKey, imageUrl);
                return imageUrl;
            }
        } catch (error) {
            console.log('🌐 External image API failed:', error.message);
        }

        // Final fallback to enhanced canvas image
        console.log('🎨 Using enhanced canvas image for:', dishName);
        const canvasImage = this.getEnhancedDishImage(dishName);
        this.addToCache(cacheKey, canvasImage);
        return canvasImage;
    }

    // Generate dish image using Gemini Imagen API
    async generateDishImageWithAI(dishName) {
        const prompt = this.createImagePrompt(dishName);
        
        console.log('🎨 Calling Gemini Imagen API with prompt:', prompt);
        
        try {
            // Check if we're in a browser environment that supports fetch with proper CORS
            if (typeof window === 'undefined') {
                throw new Error('Not in browser environment');
            }
            
            // Use the correct Imagen API endpoint according to the official documentation
            const imageEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.imageModel}:predict`;
            
            const response = await fetch(`${imageEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                mode: 'cors', // Explicitly set CORS mode
                body: JSON.stringify({
                    instances: [
                        {
                            prompt: prompt
                        }
                    ],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: "4:3",
                        negativePrompt: "blurry, low quality, cartoon, anime, drawing, sketch, ugly, distorted",
                        personGeneration: "dont_allow"
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log('🚨 Imagen API response error:', response.status, errorText);
                throw new Error(`Imagen API error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('🎨 Imagen API response:', data);
            
            // Extract image data from response according to the new format
            if (data.predictions && data.predictions.length > 0) {
                const prediction = data.predictions[0];
                
                // Handle different response formats
                if (prediction.bytesBase64Encoded) {
                    // Base64 encoded image
                    console.log('✅ Imagen API success: Base64 image received');
                    return `data:image/png;base64,${prediction.bytesBase64Encoded}`;
                } else if (prediction.mimeType && prediction.bytesBase64Encoded) {
                    // MIME type with data
                    console.log('✅ Imagen API success: MIME data received');
                    return `data:${prediction.mimeType};base64,${prediction.bytesBase64Encoded}`;
                }
            }
            
            throw new Error('No valid image data in response');
            
        } catch (error) {
            console.log('🚨 Imagen API detailed error:', error);
            
            // Check if it's a network/CORS issue
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                console.log('💡 This appears to be a CORS or network connectivity issue');
                console.log('💡 Imagen API may not be available from browser environments');
                console.log('💡 Note: Imagen API requires paid plan and may have regional restrictions');
                console.log('💡 Falling back to alternative image sources...');
            }
            
            throw error;
        }
    }

    // Create optimized prompt for dish image generation
    createImagePrompt(dishName) {
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
        
        // Base prompt for high-quality food photography
        let basePrompt = currentLang === 'ja' ? 
            `美味しそうな${dishName}の写真、プロの料理写真、高品質、美しい盛り付け、レストラン品質` :
            `A beautiful, appetizing photo of ${dishName}, professional food photography, high quality, restaurant presentation`;
        
        // Add dish-specific details
        const dishSpecific = this.getDishSpecificPrompt(dishName);
        if (dishSpecific) {
            basePrompt += `, ${dishSpecific}`;
        }
        
        // Add general quality enhancers
        const qualityEnhancers = currentLang === 'ja' ? 
            '、自然光、鮮やかな色彩、食欲をそそる、プロの撮影' :
            ', natural lighting, vibrant colors, appetizing, professional photography';
        
        return basePrompt + qualityEnhancers;
    }

    // Get dish-specific prompt details
    getDishSpecificPrompt(dishName) {
        const name = dishName.toLowerCase();
        
        const specificPrompts = {
            'sushi': 'elegant presentation on wooden board, fresh ingredients, wasabi and ginger',
            '寿司': 'elegant presentation on wooden board, fresh ingredients, wasabi and ginger',
            'ramen': 'steaming hot bowl, rich broth, perfect noodles, green onions, egg',
            'ラーメン': 'steaming hot bowl, rich broth, perfect noodles, green onions, egg',
            'curry': 'aromatic spices, colorful vegetables, rice on side, steam rising',
            'カレー': 'aromatic spices, colorful vegetables, rice on side, steam rising',
            'pasta': 'al dente noodles, rich sauce, fresh herbs, parmesan cheese',
            'パスタ': 'al dente noodles, rich sauce, fresh herbs, parmesan cheese',
            'pizza': 'melted cheese, fresh toppings, crispy crust, wood-fired oven style',
            'steak': 'perfectly grilled, juicy meat, grill marks, side vegetables',
            'salad': 'fresh greens, colorful vegetables, light dressing, healthy presentation',
            'サラダ': 'fresh greens, colorful vegetables, light dressing, healthy presentation',
            'tempura': 'light crispy batter, golden color, dipping sauce, artistic plating',
            '天ぷら': 'light crispy batter, golden color, dipping sauce, artistic plating'
        };
        
        // Find matching dish
        for (const [dish, prompt] of Object.entries(specificPrompts)) {
            if (name.includes(dish)) {
                return prompt;
            }
        }
        
        return 'beautifully plated, garnished, restaurant quality presentation';
    }

    // Cache management
    addToCache(key, value) {
        // Remove oldest entry if cache is full
        if (this.imageCache.size >= this.maxCacheSize) {
            const firstKey = this.imageCache.keys().next().value;
            this.imageCache.delete(firstKey);
        }
        
        this.imageCache.set(key, value);
        console.log(`📦 Cached image for: ${key} (cache size: ${this.imageCache.size})`);
    }

    // Clear image cache
    clearImageCache() {
        this.imageCache.clear();
        console.log('🗑️ Image cache cleared');
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
                // Convert 0-100 scale to 1-5 scale for radar chart
                const convertTo1to5 = (value) => Math.max(1, Math.min(5, Math.round((value / 100) * 4 + 1)));
                
                return {
                    profile: [
                        convertTo1to5(parsed.spiciness || 50),
                        convertTo1to5(parsed.aroma || 50),
                        convertTo1to5(parsed.citrusy || 50),
                        convertTo1to5(parsed.freshness || 50),
                        convertTo1to5(parsed.depth || 50)
                    ],
                    analysis: parsed.analysis || 'Analysis completed'
                };
            }
        } catch (error) {
            console.error('Error parsing taste response:', error);
        }
        
        // Fallback - convert default 50 to 1-5 scale
        const convertTo1to5 = (value) => Math.max(1, Math.min(5, Math.round((value / 100) * 4 + 1)));
        return {
            profile: [
                convertTo1to5(50),
                convertTo1to5(50),
                convertTo1to5(50),
                convertTo1to5(50),
                convertTo1to5(50)
            ],
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
                // Convert 0-100 scale to 1-5 scale for radar chart
                const convertTo1to5 = (value) => Math.max(1, Math.min(5, Math.round((value / 100) * 4 + 1)));
                
                return {
                    profile: [
                        convertTo1to5(parsed.spiciness || 50),
                        convertTo1to5(parsed.aroma || 50),
                        convertTo1to5(parsed.citrusy || 50),
                        convertTo1to5(parsed.freshness || 50),
                        convertTo1to5(parsed.depth || 50)
                    ],
                    description: parsed.description || '',
                    cuisine: parsed.cuisine || '',
                    characteristics: parsed.characteristics || ''
                };
            }
        } catch (error) {
            console.error('Error parsing dish response:', error);
        }
        
        // Fallback - convert default 50 to 1-5 scale
        const convertTo1to5 = (value) => Math.max(1, Math.min(5, Math.round((value / 100) * 4 + 1)));
        return {
            profile: [
                convertTo1to5(50),
                convertTo1to5(50),
                convertTo1to5(50),
                convertTo1to5(50),
                convertTo1to5(50)
            ],
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

    // Fetch dish image from external API
    async fetchDishImageFromAPI(dishName) {
        console.log('🌐 Attempting to fetch external image for:', dishName);
        
        try {
            // Use a CORS-friendly image service
            // Note: Many free image APIs have CORS restrictions
            const query = encodeURIComponent(`${dishName} food dish`);
            
            // Try using a proxy or CORS-enabled endpoint
            const corsProxy = 'https://api.allorigins.win/raw?url=';
            const unsplashUrl = `https://source.unsplash.com/400x300/?${query}`;
            
            console.log('🌐 Trying Unsplash via CORS proxy...');
            const response = await fetch(`${corsProxy}${encodeURIComponent(unsplashUrl)}`, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (response.ok) {
                console.log('✅ External image API success');
                return response.url;
            }
        } catch (error) {
            console.log('🌐 CORS proxy failed:', error.message);
        }

        try {
            // Try direct Unsplash (may fail due to CORS)
            const query = encodeURIComponent(`${dishName} food dish`);
            console.log('🌐 Trying direct Unsplash...');
            const response = await fetch(`https://source.unsplash.com/400x300/?${query}`, {
                method: 'GET',
                mode: 'no-cors' // This will work but we can't access the response
            });
            
            // With no-cors, we can't check response.ok, so we assume it worked
            // and return the URL for the browser to handle
            console.log('🌐 Direct Unsplash attempted (no-cors mode)');
            return `https://source.unsplash.com/400x300/?${query}`;
        } catch (error) {
            console.log('🌐 Direct Unsplash failed:', error.message);
        }

        try {
            // Alternative: Try a different free API
            console.log('🌐 Trying alternative food API...');
            // Use Lorem Picsum with food-related seed
            const seed = dishName.replace(/\s+/g, '').toLowerCase();
            const foodImageUrl = `https://picsum.photos/seed/${seed}/400/300`;
            
            // Test if the URL is accessible
            const testResponse = await fetch(foodImageUrl, {
                method: 'HEAD',
                mode: 'no-cors'
            });
            
            console.log('✅ Alternative image service success');
            return foodImageUrl;
        } catch (error) {
            console.log('🌐 Alternative image service failed:', error.message);
        }

        console.log('🌐 All external image APIs failed, will use canvas fallback');
        return null;
    }

    // Enhanced Canvas image generation
    getEnhancedDishImage(dishName) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        // Create a more sophisticated gradient based on dish type
        const dishType = this.getDishType(dishName);
        const colors = this.getDishColors(dishType);
        
        const gradient = ctx.createRadialGradient(200, 150, 0, 200, 150, 200);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(0.7, colors.secondary);
        gradient.addColorStop(1, colors.tertiary);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 300);
        
        // Add subtle pattern overlay
        this.addPatternOverlay(ctx, dishType);
        
        // Add decorative border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, 380, 280);
        
        // Add dish-specific emoji
        const emoji = this.getDishEmoji(dishName);
        ctx.font = '64px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(emoji, 200, 120);
        
        // Add dish name with better typography
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Split long dish names into multiple lines
        const maxWidth = 350;
        const words = dishName.split(' ');
        let lines = [];
        let currentLine = words[0] || dishName;
        
        ctx.font = 'bold 28px Arial';
        
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
        
        // Draw text lines with better spacing
        const lineHeight = 35;
        const startY = 200 - (lines.length - 1) * lineHeight / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, 200, startY + index * lineHeight);
        });
        
        // Add subtitle
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('AI Generated Dish Profile', 200, 260);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        return canvas.toDataURL('image/png');
    }

    // Determine dish type for styling
    getDishType(dishName) {
        const name = dishName.toLowerCase();
        
        if (name.includes('curry') || name.includes('カレー') || name.includes('spicy')) {
            return 'spicy';
        } else if (name.includes('sushi') || name.includes('寿司') || name.includes('sashimi')) {
            return 'japanese';
        } else if (name.includes('pasta') || name.includes('pizza') || name.includes('パスタ')) {
            return 'italian';
        } else if (name.includes('salad') || name.includes('サラダ') || name.includes('fresh')) {
            return 'fresh';
        } else if (name.includes('steak') || name.includes('meat') || name.includes('肉')) {
            return 'meat';
        } else if (name.includes('soup') || name.includes('stew') || name.includes('シチュー')) {
            return 'soup';
        } else {
            return 'general';
        }
    }

    // Get color scheme based on dish type
    getDishColors(dishType) {
        const colorSchemes = {
            spicy: {
                primary: '#ff6b6b',
                secondary: '#ee5a24',
                tertiary: '#c44569'
            },
            japanese: {
                primary: '#74b9ff',
                secondary: '#0984e3',
                tertiary: '#6c5ce7'
            },
            italian: {
                primary: '#fdcb6e',
                secondary: '#e17055',
                tertiary: '#d63031'
            },
            fresh: {
                primary: '#00b894',
                secondary: '#00cec9',
                tertiary: '#55a3ff'
            },
            meat: {
                primary: '#a29bfe',
                secondary: '#6c5ce7',
                tertiary: '#fd79a8'
            },
            soup: {
                primary: '#fdcb6e',
                secondary: '#f39c12',
                tertiary: '#e17055'
            },
            general: {
                primary: '#667eea',
                secondary: '#764ba2',
                tertiary: '#f093fb'
            }
        };
        
        return colorSchemes[dishType] || colorSchemes.general;
    }

    // Add pattern overlay for visual interest
    addPatternOverlay(ctx, dishType) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#ffffff';
        
        // Create different patterns based on dish type
        if (dishType === 'japanese') {
            // Wave pattern
            for (let i = 0; i < 400; i += 20) {
                ctx.beginPath();
                ctx.arc(i, Math.sin(i * 0.02) * 50 + 150, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (dishType === 'italian') {
            // Dots pattern
            for (let x = 0; x < 400; x += 30) {
                for (let y = 0; y < 300; y += 30) {
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        } else {
            // Default geometric pattern
            for (let i = 0; i < 10; i++) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + i * 0.01})`;
                ctx.lineWidth = 1;
                ctx.strokeRect(i * 40, i * 30, 400 - i * 80, 300 - i * 60);
            }
        }
        
        ctx.globalAlpha = 1;
    }

    // Get appropriate emoji for dish
    getDishEmoji(dishName) {
        const name = dishName.toLowerCase();
        
        if (name.includes('curry') || name.includes('カレー')) return '🍛';
        if (name.includes('sushi') || name.includes('寿司')) return '🍣';
        if (name.includes('ramen') || name.includes('ラーメン')) return '🍜';
        if (name.includes('pizza')) return '🍕';
        if (name.includes('pasta') || name.includes('パスタ')) return '🍝';
        if (name.includes('burger') || name.includes('ハンバーガー')) return '🍔';
        if (name.includes('steak') || name.includes('meat')) return '🥩';
        if (name.includes('chicken') || name.includes('鶏')) return '🍗';
        if (name.includes('fish') || name.includes('魚')) return '🐟';
        if (name.includes('salad') || name.includes('サラダ')) return '🥗';
        if (name.includes('soup') || name.includes('スープ')) return '🍲';
        if (name.includes('rice') || name.includes('ご飯')) return '🍚';
        if (name.includes('bread') || name.includes('パン')) return '🍞';
        if (name.includes('cake') || name.includes('ケーキ')) return '🍰';
        if (name.includes('ice cream') || name.includes('アイス')) return '🍦';
        
        return '🍽️'; // Default
    }

    getMockDishImage(dishName) {
        // Fallback to enhanced image generation
        return this.getEnhancedDishImage(dishName);
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
