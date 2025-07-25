# トラブルシューティングガイド

## 🚨 404 Page Not Found エラーの解決方法

### 問題の症状
- Netlifyにデプロイ後、サイトにアクセスすると「Page not found」エラーが表示される
- URLは正しいが、コンテンツが表示されない

### 解決手順

#### 1. Netlifyの設定確認

1. **Netlifyダッシュボード**にログイン
2. **プロジェクトを選択**
3. **Site settings** → **Build & deploy** → **Deploy settings**を確認

#### 2. ビルド設定の確認

以下の設定になっているか確認：

```
Build command: (空白のまま)
Publish directory: .
```

#### 3. ファイル構造の確認

リポジトリのルートディレクトリに以下のファイルがあることを確認：

```
/
├── index.html          ← 必須
├── manifest.json
├── netlify.toml
├── css/
├── js/
├── locales/
└── assets/
```

#### 4. netlify.tomlの確認

`netlify.toml`ファイルが正しく設定されているか確認：

```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 5. 手動デプロイでのテスト

1. **Netlifyダッシュボード** → **Deploys**
2. **Deploy manually**をクリック
3. プロジェクトフォルダ全体をドラッグ&ドロップ

#### 6. GitHubリポジトリの確認

1. GitHubリポジトリに`index.html`がルートにあることを確認
2. ファイルが正しくコミット・プッシュされていることを確認

```bash
git add .
git commit -m "Fix deployment structure"
git push origin main
```

#### 7. Netlifyの再デプロイ

1. **Netlifyダッシュボード** → **Deploys**
2. **Trigger deploy** → **Deploy site**をクリック

### よくある原因と解決方法

#### 原因1: ビルドコマンドの問題
**症状**: ビルドが失敗している
**解決方法**: 
```toml
[build]
  # コメントアウトまたは削除
  # command = ""
  publish = "."
```

#### 原因2: パブリッシュディレクトリの設定ミス
**症状**: ファイルが見つからない
**解決方法**: 
- Publish directoryを `.` に設定
- `dist`や`build`ではなく、ルートディレクトリを指定

#### 原因3: index.htmlの場所
**症状**: メインページが表示されない
**解決方法**: 
- `index.html`をリポジトリのルートに配置
- サブディレクトリに入れない

#### 原因4: リダイレクト設定の問題
**症状**: 直接URLアクセスで404エラー
**解決方法**: 
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### デバッグ方法

#### 1. Netlifyのデプロイログを確認

```bash
# Netlify CLIを使用
netlify logs

# または、ダッシュボードでDeploy logを確認
```

#### 2. ファイルの存在確認

デプロイ後、以下のURLで直接ファイルにアクセス：
- `https://your-site.netlify.app/index.html`
- `https://your-site.netlify.app/css/style.css`
- `https://your-site.netlify.app/js/app.js`

#### 3. ブラウザの開発者ツール

1. F12で開発者ツールを開く
2. **Network**タブで404エラーの詳細を確認
3. **Console**タブでJavaScriptエラーを確認

### 緊急対応手順

#### 手動デプロイによる即座の修正

1. ローカルでプロジェクトフォルダを準備
2. 不要なファイルを削除（`node_modules`, `.git`など）
3. Netlifyダッシュボードで手動デプロイ
4. フォルダ全体をドラッグ&ドロップ

#### 最小構成でのテスト

問題を特定するため、最小構成でテスト：

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>
```

### 予防策

#### 1. ローカルテスト

デプロイ前にローカルサーバーでテスト：

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

#### 2. 段階的デプロイ

1. 最小構成でデプロイ
2. 動作確認後、機能を追加
3. 各段階で動作確認

#### 3. バックアップ

動作する構成をGitでタグ付け：

```bash
git tag -a v1.0 -m "Working deployment"
git push origin v1.0
```

### サポート

問題が解決しない場合：

1. [Netlify Community](https://community.netlify.com/)で質問
2. [Netlify Support](https://www.netlify.com/support/)に連絡
3. GitHubのIssuesで報告

### チェックリスト

デプロイ前の確認事項：

- [ ] `index.html`がルートディレクトリにある
- [ ] `netlify.toml`が正しく設定されている
- [ ] 必要なファイルがすべてコミットされている
- [ ] ローカルでサイトが正常に動作する
- [ ] ビルドコマンドが不要な静的サイトとして設定されている

---

**注意**: 変更後は必ずNetlifyで再デプロイを実行してください。
