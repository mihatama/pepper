# Netlify デプロイメント設定ガイド

## 🚀 Netlifyでの環境変数設定

### 1. 必要な環境変数

Pepper Craft AIをNetlifyにデプロイする際に設定が必要な環境変数：

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `VITE_GEMINI_API_KEY` | Google Gemini APIキー | ✅ |
| `NODE_ENV` | 環境設定（production推奨） | ❌ |

### 2. Gemini APIキーの取得

1. [Google AI Studio](https://makersuite.google.com/) にアクセス
2. Googleアカウントでログイン
3. 「Get API Key」をクリック
4. 新しいAPIキーを作成
5. APIキーをコピーして保存

### 3. Netlifyでの環境変数設定

#### 方法1: Netlify管理画面での設定

1. Netlifyダッシュボードにログイン
2. プロジェクトを選択
3. 「Site settings」→「Environment variables」に移動
4. 「Add a variable」をクリック
5. 以下の変数を追加：
   ```
   Key: VITE_GEMINI_API_KEY
   Value: your-actual-gemini-api-key-here
   ```

#### 方法2: Netlify CLIでの設定

```bash
# Netlify CLIをインストール
npm install -g netlify-cli

# ログイン
netlify login

# 環境変数を設定
netlify env:set VITE_GEMINI_API_KEY "your-actual-gemini-api-key-here"

# 設定確認
netlify env:list
```

### 4. デプロイメント手順

#### 自動デプロイ（推奨）

1. GitHubリポジトリをNetlifyに接続
2. ビルド設定：
   - **Build command**: `npm run build`
   - **Publish directory**: `.`
3. 環境変数を設定（上記参照）
4. 「Deploy site」をクリック

#### 手動デプロイ

```bash
# プロジェクトをビルド
npm run build

# Netlify CLIでデプロイ
netlify deploy --prod
```

### 5. ビルドプロセスの詳細

`npm run build`コマンドは以下を実行します：

1. **環境変数の注入**: `VITE_GEMINI_API_KEY`をHTMLファイルに注入
2. **メタタグの追加**: APIキーをメタタグとして追加
3. **設定ファイル生成**: `config.json`ファイルを生成

### 6. セキュリティ設定

#### Content Security Policy (CSP)

`netlify.toml`で以下のCSPが設定されています：

```toml
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https: blob:; connect-src 'self' https://generativelanguage.googleapis.com https://via.placeholder.com; font-src 'self' https://cdn.jsdelivr.net;"
```

#### セキュリティヘッダー

- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 7. トラブルシューティング

#### APIキーが認識されない場合

1. Netlifyの環境変数設定を確認
2. 変数名が `VITE_GEMINI_API_KEY` であることを確認
3. サイトを再デプロイ
4. ブラウザの開発者ツールでコンソールログを確認

#### ビルドエラーが発生する場合

```bash
# ローカルでビルドテスト
VITE_GEMINI_API_KEY="test-key" npm run build

# Netlifyのビルドログを確認
netlify logs
```

#### APIが動作しない場合

1. ブラウザの開発者ツールを開く
2. コンソールで以下を確認：
   ```javascript
   console.log('API Key loaded:', !!window.VITE_GEMINI_API_KEY);
   console.log('Gemini API configured:', window.geminiAPI.isConfigured());
   ```

### 8. パフォーマンス最適化

#### キャッシュ設定

静的ファイルは1年間キャッシュされます：
- JavaScript: `Cache-Control: public, max-age=31536000`
- CSS: `Cache-Control: public, max-age=31536000`
- Assets: `Cache-Control: public, max-age=31536000`

#### 圧縮

Netlifyは自動的にファイルを圧縮します（gzip/brotli）。

### 9. モニタリング

#### 使用状況の確認

1. Netlifyダッシュボードで帯域幅使用量を確認
2. Google Cloud Consoleでgemini API使用量を確認
3. ブラウザの開発者ツールでパフォーマンスを監視

#### ログの確認

```bash
# Netlifyのビルドログ
netlify logs

# 関数ログ（使用している場合）
netlify functions:log
```

### 10. 本番環境での確認事項

- [ ] APIキーが正しく設定されている
- [ ] HTTPS接続が有効
- [ ] PWA機能が動作している
- [ ] 音声認識が動作している（HTTPS必須）
- [ ] 全ての機能が正常に動作している
- [ ] レスポンシブデザインが適用されている
- [ ] 多言語対応が動作している

## 📞 サポート

問題が発生した場合：

1. [Netlify Documentation](https://docs.netlify.com/)を確認
2. [Google AI Studio Documentation](https://ai.google.dev/)を確認
3. ブラウザの開発者ツールでエラーログを確認
4. GitHubのIssuesで報告

---

**注意**: APIキーは機密情報です。公開リポジトリにコミットしないよう注意してください。
