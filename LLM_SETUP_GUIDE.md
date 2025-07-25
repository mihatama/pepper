# LLM（Gemini API）設定ガイド

## 🤖 現在の状況

現在、「味を分析」ボタンを押した時は **LLMを使用していません**。
代わりに、キーワードベースの簡単な分析（モックデータ）を使用しています。

**新機能**: Gemini APIのImagen 3.0による **AI画像生成機能** を実装済み！

## 🔧 LLMを有効にする方法

### 1. Gemini APIキーの取得

1. [Google AI Studio](https://makersuite.google.com/) にアクセス
2. Googleアカウントでログイン
3. 「Get API Key」をクリック
4. 新しいAPIキーを作成
5. APIキーをコピーして保存

### 2. Netlifyでの環境変数設定

1. **Netlifyダッシュボード**にログイン
2. **peppercraftai**プロジェクトを選択
3. **Site settings** → **Environment variables**に移動
4. **Add a variable**をクリック
5. 以下を入力：
   ```
   Key: VITE_GEMINI_API_KEY
   Value: [あなたのGemini APIキー]
   ```
6. **Save**をクリック

### 3. サイトの再デプロイ

1. **Deploys**タブに移動
2. **Trigger deploy** → **Deploy site**をクリック
3. デプロイ完了を待つ

## 🧠 LLM有効時の動作

APIキーが正しく設定されると、以下のように動作します：

### 味分析機能
- **入力例**: "辛くて香りが良い、肉料理に合う味"
- **LLM処理**: Gemini APIが自然言語を分析
- **出力**: 5つの味要素（辛味、香り、酸味、フレッシュ感、深み）のスコア

### 料理分析機能
- **入力例**: "パッドタイ"
- **LLM処理**: 料理の典型的な味プロファイルを分析
- **出力**: 味のバランスとペッパーブレンドの提案

### 🎨 AI画像生成機能（NEW!）
- **モデル**: Imagen 3.0 Fast Generate（高速生成）
- **入力例**: "sushi", "カレー", "pad thai"
- **処理**: 料理名から高品質な料理写真を生成
- **出力**: プロ品質の料理画像（4:3アスペクト比）
- **フォールバック**: 外部API → 高品質Canvas画像
- **キャッシュ**: 最大50枚の画像をキャッシュして高速表示

## 📊 現在のモックデータ vs LLM

### モックデータ（現在）
```javascript
// キーワードベースの簡単な分析
if (keywords.includes('辛い')) profile[0] = 80;
if (keywords.includes('香り')) profile[1] = 75;
// ...
```

### LLM使用時
```javascript
// Gemini APIへのリクエスト
const prompt = `以下の味の説明を分析して、5つの要素を評価してください...`;
const response = await this.callGeminiAPI(prompt);
```

## 🔍 動作確認方法

### 1. コンソールログの確認
ブラウザの開発者ツール（F12）でコンソールを確認：

**APIキー未設定時**:
```
⚠️ Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable in Netlify.
For demo purposes, using mock data instead of real API calls.
```

**APIキー設定済み時**:
```
✅ Gemini API key configured successfully
🤖 LLM-powered taste analysis is now active!
```

### 3. 画像生成ログの確認
**画像生成時のコンソールログ**:
```
🎨 Generating AI image for: sushi
🎨 Calling Gemini Imagen API with prompt: A beautiful, appetizing photo of sushi, professional food photography...
📦 Cached image for: sushi (cache size: 1)
```

**キャッシュ使用時**:
```
🖼️ Using cached image for: sushi
```

**フォールバック時**:
```
🎨 Gemini image generation failed: [error message]
🌐 Trying external image APIs for: sushi
🎨 Using enhanced canvas image for: sushi
```

### 2. 分析結果の違い
- **モック**: キーワードに基づく固定的な結果
- **LLM**: より自然で文脈を理解した分析結果

## 💰 API使用料金

Gemini APIの料金（2024年時点）:
- **無料枠**: 月15リクエスト/分、100万トークン/月
- **有料**: $0.00025/1000文字（入力）、$0.0005/1000文字（出力）

## 🚨 トラブルシューティング

### APIキーが認識されない場合
1. 環境変数名が `VITE_GEMINI_API_KEY` であることを確認
2. Netlifyで再デプロイを実行
3. ブラウザのキャッシュをクリア

### API呼び出しエラーの場合
1. APIキーが有効であることを確認
2. Google AI Studioでクォータを確認
3. ネットワーク接続を確認

## 📝 まとめ

現在は **デモ用のモックデータ** を使用していますが、
Netlifyで `VITE_GEMINI_API_KEY` を設定することで、
**実際のLLM（Gemini API）** を使用した高度な味分析が可能になります。

設定後は、より自然で精密な味の分析とペッパーブレンドの提案が行われます。
