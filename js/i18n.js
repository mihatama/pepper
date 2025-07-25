// Internationalization Module
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('pepper-craft-lang') || 'en';
        this.translations = {};
        this.loadTranslations();
    }

    async loadTranslations() {
        try {
            const [enResponse, jaResponse] = await Promise.all([
                fetch('./locales/en.json'),
                fetch('./locales/ja.json')
            ]);
            
            this.translations.en = await enResponse.json();
            this.translations.ja = await jaResponse.json();
            
            this.updateUI();
        } catch (error) {
            console.warn('Failed to load translation files, using fallback translations:', error);
            // Fallback translations
            this.translations = {
                en: this.getFallbackTranslations('en'),
                ja: this.getFallbackTranslations('ja')
            };
            this.updateUI();
        }
    }

    getFallbackTranslations(lang) {
        const fallbacks = {
            en: {
                "tab": {
                    "manual": "Manual Blend",
                    "aiTaste": "AI Taste",
                    "dish": "Dish Recipe"
                },
                "manual": {
                    "title": "Flavor Profile"
                },
                "flavor": {
                    "spiciness": "Spiciness",
                    "aroma": "Aroma",
                    "citrusy": "Citrusy",
                    "freshness": "Freshness",
                    "depth": "Depth"
                },
                "result": {
                    "title": "Pepper Blend Recipe"
                },
                "aiTaste": {
                    "title": "Describe Your Desired Taste",
                    "placeholder": "Describe the taste you want...",
                    "analyze": "Analyze Taste",
                    "profile": "AI Generated Profile"
                },
                "dish": {
                    "title": "Enter Dish Name",
                    "placeholder": "Enter dish name...",
                    "generate": "Generate Recipe",
                    "image": "Dish Image",
                    "imagePlaceholder": "Image will appear here",
                    "profile": "Dish Flavor Profile",
                    "enhanced": "Enhanced with Peppers"
                },
                "voice": {
                    "start": "Start Voice",
                    "stop": "Stop Voice"
                },
                "loading": {
                    "text": "Processing..."
                },
                "peppers": {
                    "red": "Red Pepper",
                    "pink": "Pink Pepper",
                    "black": "Black Pepper",
                    "green": "Green Pepper",
                    "coriander": "Coriander"
                }
            },
            ja: {
                "tab": {
                    "manual": "手動ブレンド",
                    "aiTaste": "AI味覚",
                    "dish": "料理レシピ"
                },
                "manual": {
                    "title": "フレーバープロファイル"
                },
                "flavor": {
                    "spiciness": "辛味",
                    "aroma": "香り",
                    "citrusy": "酸味",
                    "freshness": "フレッシュ感",
                    "depth": "深み"
                },
                "result": {
                    "title": "ペッパーブレンドレシピ"
                },
                "aiTaste": {
                    "title": "希望する味を説明してください",
                    "placeholder": "欲しい味を説明してください...",
                    "analyze": "味を分析",
                    "profile": "AI生成プロファイル"
                },
                "dish": {
                    "title": "料理名を入力",
                    "placeholder": "料理名を入力してください...",
                    "generate": "レシピ生成",
                    "image": "料理画像",
                    "imagePlaceholder": "画像がここに表示されます",
                    "profile": "料理のフレーバープロファイル",
                    "enhanced": "ペッパーで強化"
                },
                "voice": {
                    "start": "音声開始",
                    "stop": "音声停止"
                },
                "loading": {
                    "text": "処理中..."
                },
                "peppers": {
                    "red": "レッドペッパー",
                    "pink": "ピンクペッパー",
                    "black": "ブラックペッパー",
                    "green": "グリーンペッパー",
                    "coriander": "コリアンダー"
                }
            }
        };
        return fallbacks[lang] || fallbacks.en;
    }

    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                break;
            }
        }
        
        // Fallback to English if translation not found
        if (!value && this.currentLang !== 'en') {
            value = this.translations.en;
            for (const k of keys) {
                if (value && typeof value === 'object') {
                    value = value[k];
                } else {
                    break;
                }
            }
        }
        
        return value || key;
    }

    setLanguage(lang) {
        if (lang !== this.currentLang && (lang === 'en' || lang === 'ja')) {
            this.currentLang = lang;
            localStorage.setItem('pepper-craft-lang', lang);
            this.updateUI();
            
            // Update document language
            document.documentElement.lang = lang;
            
            // Dispatch language change event
            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: lang } 
            }));
        }
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    updateUI() {
        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // Update placeholder texts
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // Update language toggle button
        const langText = document.getElementById('langText');
        if (langText) {
            langText.textContent = this.currentLang.toUpperCase();
        }

        // Update document title
        document.title = this.currentLang === 'ja' ? 'ペッパークラフト AI' : 'Pepper Craft AI';
    }

    // Format numbers according to locale
    formatNumber(number, options = {}) {
        const locale = this.currentLang === 'ja' ? 'ja-JP' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    }

    // Format percentages
    formatPercentage(number) {
        return this.formatNumber(number, { 
            style: 'percent', 
            minimumFractionDigits: 1,
            maximumFractionDigits: 1 
        });
    }

    // Get localized pepper names
    getPepperName(pepperType) {
        return this.t(`peppers.${pepperType}`);
    }

    // Get speech recognition language code
    getSpeechLang() {
        return this.currentLang === 'ja' ? 'ja-JP' : 'en-US';
    }

    // Get appropriate voice for speech synthesis
    getVoiceLang() {
        return this.currentLang === 'ja' ? 'ja-JP' : 'en-US';
    }
}

// Initialize i18n
const i18n = new I18n();

// Export for use in other modules
window.i18n = i18n;

// Language toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const newLang = i18n.getCurrentLanguage() === 'en' ? 'ja' : 'en';
            i18n.setLanguage(newLang);
        });
    }
});
