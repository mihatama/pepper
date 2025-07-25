#!/usr/bin/env node

/**
 * Netlify Build Script for Pepper Craft AI
 * 環境変数をクライアントサイドで使用可能にするためのビルドスクリプト
 */

const fs = require('fs');
const path = require('path');

// 環境変数を取得
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

console.log('🔧 Building Pepper Craft AI...');
console.log('📦 Environment variables:');
console.log(`   GEMINI_API_KEY: ${GEMINI_API_KEY ? '✅ Set' : '❌ Not set'}`);

// HTMLファイルに環境変数を注入
function injectEnvironmentVariables() {
    const indexPath = path.join(__dirname, 'index.html');
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // 環境変数をwindowオブジェクトに注入するスクリプトを作成
    const envScript = `
    <script>
        // Environment variables injected at build time
        window.VITE_GEMINI_API_KEY = '${GEMINI_API_KEY || ''}';
        window.BUILD_TIME = '${new Date().toISOString()}';
        console.log('🌍 Environment variables loaded:', {
            hasGeminiKey: !!window.VITE_GEMINI_API_KEY,
            buildTime: window.BUILD_TIME
        });
    </script>`;
    
    // </head>タグの直前に環境変数スクリプトを挿入
    indexContent = indexContent.replace('</head>', `${envScript}\n</head>`);
    
    // ファイルを書き戻し
    fs.writeFileSync(indexPath, indexContent);
    
    console.log('✅ Environment variables injected into index.html');
}

// メタタグとして環境変数を注入（代替方法）
function injectMetaTags() {
    const indexPath = path.join(__dirname, 'index.html');
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // メタタグを作成
    const metaTags = `
    <meta name="gemini-api-key" content="${GEMINI_API_KEY || ''}" />
    <meta name="build-time" content="${new Date().toISOString()}" />`;
    
    // </head>タグの直前にメタタグを挿入
    if (!indexContent.includes('name="gemini-api-key"')) {
        indexContent = indexContent.replace('</head>', `${metaTags}\n</head>`);
        fs.writeFileSync(indexPath, indexContent);
        console.log('✅ Meta tags injected into index.html');
    }
}

// 設定ファイルを生成（JSONファイルとして）
function generateConfigFile() {
    const config = {
        apiKey: GEMINI_API_KEY || '',
        buildTime: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
    };
    
    const configPath = path.join(__dirname, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log('✅ Configuration file generated: config.json');
}

// ビルドプロセスを実行
try {
    // ファイルが存在するかチェック
    if (fs.existsSync(path.join(__dirname, 'index.html'))) {
        injectEnvironmentVariables();
        injectMetaTags();
        generateConfigFile();
        
        console.log('🎉 Build completed successfully!');
    } else {
        console.log('⚠️  index.html not found, skipping build process');
    }
    
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Set VITE_GEMINI_API_KEY in Netlify environment variables');
    console.log('2. Deploy to Netlify');
    console.log('3. Test the API functionality');
    
} catch (error) {
    console.warn('⚠️  Build process encountered an issue:', error.message);
    console.log('Continuing with deployment...');
    // Don't exit with error to allow deployment to continue
}
