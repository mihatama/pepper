# コンソールデバッグ情報

## 🔍 ブラウザコンソールで確認できる情報

再デプロイ後、https://peppercraftai.netlify.app/ にアクセスして、
ブラウザの開発者ツール（F12）のConsoleタブで以下の情報が表示されます：

## 📊 環境変数デバッグログ

### 正常な場合（ビルドスクリプト実行済み）
```
🔍 Environment Variables Debug:
- window.VITE_GEMINI_API_KEY: ✅ Set
- BUILD_TIME: 2024-01-15T10:30:45.123Z
- Meta tag API key: ✅ Found
🌐 Running on Netlify platform
📄 Config file loaded: {apiKey: "AIza...", buildTime: "2024-01-15T10:30:45.123Z", environment: "production"}
🔑 API key loaded from config file
✅ Gemini API key configured successfully
🤖 LLM-powered taste analysis is now active!
```

### 現在の状況（ビルドスクリプト未実行）
```
🔍 Environment Variables Debug:
- window.VITE_GEMINI_API_KEY: ❌ Not set
- BUILD_TIME: Not set
- Meta tag API key: ❌ Not found
🌐 Running on Netlify platform
📄 Config file not found or error: 404 Not Found
💡 Build script may not have run. Check Netlify build logs.
🔑 Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable in Netlify.
📝 For demo purposes, using mock data instead of real API calls.
💡 To enable LLM: Set VITE_GEMINI_API_KEY in Netlify → Site settings → Environment variables
💡 To manually set API key, use: setGeminiAPIKey("your-api-key-here")
```

## 🛠️ 手動テスト用コマンド

コンソールで以下のコマンドを実行してLLM機能をテスト：

```javascript
// APIキーを手動設定
setGeminiAPIKey("あなたのGeminiAPIキー")
```

成功すると以下が表示されます：
```
🔑 API key manually set. LLM functionality should now be active.
✅ Gemini API key configured successfully
🤖 LLM-powered taste analysis is now active!
```

## 🔧 デバッグ情報の読み方

### BUILD_TIME
- **表示される場合**: ビルドスクリプトが正常に実行された
- **"Not set"の場合**: ビルドスクリプトが実行されていない

### Meta tag API key
- **✅ Found**: HTMLにメタタグが注入された
- **❌ Not found**: メタタグの注入に失敗

### Config file
- **loaded**: config.jsonファイルが生成・読み込まれた
- **not found**: config.jsonファイルが存在しない

### window.VITE_GEMINI_API_KEY
- **✅ Set**: 環境変数が正常に読み込まれた
- **❌ Not set**: 環境変数の読み込みに失敗

## 📋 トラブルシューティング

### ケース1: すべて "Not set" / "Not found"
**原因**: ビルドスクリプトが実行されていない
**対策**: 
1. netlify.tomlの設定確認
2. Netlifyのビルドログ確認
3. 手動でAPIキーを設定してテスト

### ケース2: BUILD_TIMEはあるがAPIキーが空
**原因**: 環境変数は設定されているが値が空
**対策**: 
1. Netlify環境変数の値を再確認
2. 再デプロイを実行

### ケース3: すべて正常だがLLMが動作しない
**原因**: APIキーが無効またはクォータ超過
**対策**: 
1. Google AI StudioでAPIキーを確認
2. クォータ使用量を確認

## 💡 現在の推奨アクション

1. **変更をプッシュして再デプロイ**
2. **コンソールログを確認**
3. **問題が続く場合は手動でAPIキーを設定してテスト**

これにより、LLM機能の動作状況と問題の原因を正確に把握できます。
