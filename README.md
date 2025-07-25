# Pepper Craft AI 🌶️

A Progressive Web Application for creating custom pepper blend recipes using AI-powered flavor analysis.

## 🌟 Features

### Core Functionality
- **Manual Blend Creation**: Use interactive sliders or directly drag radar chart points to create custom flavor profiles
- **Interactive Radar Charts**: Click and drag chart points to adjust flavor values in real-time
- **AI Taste Analysis**: Describe desired flavors in natural language and get AI-generated pepper blends
- **Dish Recipe Enhancement**: Enter any dish name to generate images and enhance flavors with peppers
- **Visual Flavor Profiles**: Interactive radar chart visualization with bidirectional synchronization

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
1. **Two ways to adjust flavor profiles**:
   - **Sliders**: Use the traditional sliders for precise numerical control
   - **Interactive Radar Chart**: Click and drag any point on the radar chart to adjust values visually
2. **Flavor dimensions**:
   - **Spiciness**: Heat level (1-5)
   - **Aroma**: Fragrance intensity (1-5)
   - **Citrusy**: Citrus notes (1-5)
   - **Freshness**: Bright, fresh qualities (1-5)
   - **Depth**: Rich, complex flavors (1-5)
3. **Real-time synchronization**: Changes in sliders update the chart, and dragging chart points updates the sliders
4. **Automatic calculation**: Get the calculated pepper blend recipe instantly as you adjust values
5. **Visual feedback**: The radar chart shape shows your flavor balance at a glance

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

## 📊 味の計算方法とアルゴリズム

### 基本的な考え方

Pepper Craft AIは、5つの味の要素を1-5段階で評価し、その合計値に基づいて動的に総量を決定してからブレンド比率を計算します。

### 5つの味の要素（1-5段階評価）

1. **辛味 (Spiciness)**: 1-5の段階で表現される熱さのレベル
2. **香り (Aroma)**: 香りの強さと複雑さ
3. **酸味 (Citrusy)**: 柑橘系の爽やかさ
4. **フレッシュ感 (Freshness)**: 明るく新鮮な特質
5. **深み (Depth)**: 豊かで複雑な風味

### 動的総量計算システム

味の強度に応じて総量が自動調整されます：

```javascript
// 1-5段階評価の合計値による総量決定
const totalScore = scaledProfile.reduce((sum, val) => sum + val, 0);

// 線形補完による総量計算
if (totalScore <= 15) {
    // 合計5-15: 6g-10gの範囲で線形補完
    dynamicAmount = 6 + (10 - 6) * (totalScore - 5) / (15 - 5);
} else {
    // 合計15-25: 10g-14gの範囲で線形補完
    dynamicAmount = 10 + (14 - 10) * (totalScore - 15) / (25 - 15);
}
```

### 総量の基準値

- **全て1（合計5）**: 6g - 控えめな味付け用
- **全て3（合計15）**: 10g - 標準的な味付け用
- **全て5（合計25）**: 14g - 濃厚な味付け用

### ペッパーの特性プロファイル

各ペッパーは独自の味プロファイルを持っています：

```javascript
const pepperProfiles = {
    redPepper: {
        spiciness: 0.8,   // 高い辛味
        aroma: 0.6,       // 中程度の香り
        citrusy: 0.3,     // 低い酸味
        freshness: 0.2,   // 低いフレッシュ感
        depth: 0.7        // 高い深み
    },
    pinkPepper: {
        spiciness: 0.3,   // 低い辛味
        aroma: 0.9,       // 非常に高い香り
        citrusy: 0.8,     // 高い酸味
        freshness: 0.6,   // 高いフレッシュ感
        depth: 0.4        // 中程度の深み
    },
    // ... 他のペッパー
};
```

### 計算アルゴリズム

#### 1. 味強度の評価と総量決定
```javascript
// 0-100スケールを1-5段階に変換
const scaledProfile = flavorProfile.map(value => 
    Math.max(1, Math.min(5, Math.round(value / 20)))
);

// 動的総量計算
this.baseAmount = this.calculateDynamicAmount(flavorProfile);
```

#### 2. 類似度スコア計算
```javascript
// 各ペッパーと目標プロファイルの類似度を計算
similarity = pepperProfile[i] * targetProfile[i] // 内積計算
```

#### 3. 重み付きスコア
```javascript
// 目標強度による重み付け
const targetIntensity = targetProfile.reduce((sum, val) => sum + val, 0) / 5;
contribution = similarity * targetIntensity;
```

#### 4. 比率計算と配分
```javascript
// 各ペッパーの比率を計算
ratio = pepperContribution / totalContributions;
// 動的総量での配分
amount = ratio * dynamicAmount;
// 最小量を保証（5%以上）
finalAmount = Math.max(dynamicAmount * 0.05, amount);
```

### AI味分析の仕組み

#### 1. 自然言語処理
- **Gemini API**を使用して自然言語の味の説明を解析
- 「辛くて香りが良い」→ 辛味:80, 香り:85 のような数値に変換

#### 2. プロンプト設計
```javascript
const prompt = `
以下の味の説明を分析して、5つの要素を0-100のスケールで評価してください。
味の説明: "${description}"
JSON形式で回答:
{
  "spiciness": 数値(0-100),
  "aroma": 数値(0-100),
  "citrusy": 数値(0-100),
  "freshness": 数値(0-100),
  "depth": 数値(0-100)
}
`;
```

#### 3. 結果の解析
- AIの回答からJSONを抽出
- 数値の妥当性をチェック
- エラー時はフォールバック値を使用

### 料理レシピ分析の考え方

#### 1. 料理の味プロファイル推定

各料理には典型的な味の特徴があります：

```javascript
const dishProfiles = {
    'pad thai': [70, 80, 85, 90, 75],  // 辛味, 香り, 酸味, フレッシュ感, 深み
    'carbonara': [20, 70, 10, 40, 90], // クリーミーで深みがある
    'sushi': [10, 60, 20, 95, 80]      // フレッシュで繊細
};
```

#### 2. 料理画像生成

- **Canvas API**を使用してプレースホルダー画像を生成
- 料理名を美しいグラデーション背景に表示
- 食べ物絵文字🍽️を追加してビジュアル効果を向上

#### 3. 味の強化アルゴリズム

```javascript
// より正五角形に近い形にするための強化
function calculateEnhancedProfile(originalProfile) {
    const average = originalProfile.reduce((sum, val) => sum + val, 0) / 5;
    const targetRegularity = 0.7; // 70%の正規化
    
    return originalProfile.map(value => {
        const difference = average - value;
        return Math.round(value + (difference * targetRegularity));
    });
}
```

#### 4. ペッパーによる補完

- 元の料理プロファイルと強化プロファイルの差分を計算
- 不足している味要素をペッパーで補う
- レーダーチャートでビフォー・アフターを視覚化

### 精度向上の仕組み

#### 1. エラーハンドリング
- API呼び出し失敗時はモックデータを使用
- 不正な数値は50（中間値）で補正
- ネットワークエラー時の適切なフォールバック

#### 2. 多言語対応
- 日本語と英語の両方でAI分析が可能
- 料理名も国際的に対応（「寿司」「sushi」両方認識）

#### 3. リアルタイム計算
- スライダー操作時の即座な再計算
- チャートとブレンドレシピの同期更新

### 使用例

#### 入力: "辛くて香りが良い、肉料理に合う複雑な味"
```
AI分析結果:
- 辛味: 85 (「辛い」キーワードから高値)
- 香り: 90 (「香りが良い」から高値)
- 酸味: 30 (言及なしで中低値)
- フレッシュ感: 40 (「複雑」で低め)
- 深み: 95 (「複雑」「肉料理」で高値)

計算されるブレンド:
- レッドペッパー: 35% (辛味と深みが高い)
- ブラックペッパー: 25% (辛味と深み)
- ピンクペッパー: 20% (香り)
- コリアンダー: 15% (香りと深み)
- グリーンペッパー: 5% (バランス調整)
```

この詳細なアルゴリズムにより、ユーザーの曖昧な表現からも精密なペッパーブレンドを生成できます。

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

## 📞 サポート

問題や質問がある場合：
1. ブラウザのコンソールでエラーメッセージを確認
2. AI機能には安定したインターネット接続が必要
3. 音声入力にはマイクの許可が必要
4. ページの更新やブラウザキャッシュのクリアを試す

---

**ペッパー愛好家のために作成 🌶️**
