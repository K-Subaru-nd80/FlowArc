# FlowArc - Skill Decay Tracker PWA

## 概要

FlowArcは、習得した技能の劣化を防ぎ、効率的な維持を支援するPWAです。音声入力とLLMの分析を活用し、個人の忘却パターンに基づいて最適な復習タイミングを通知します。

## 技術スタック

- **フレームワーク**: Next.js (React)
- **言語**: TypeScript
- **認証**: Firebase Authentication
- **データベース**: Firebase Firestore
- **デプロイ**: Vercel
- **音声認識**: Web Speech API
- **LLM API**: OpenAI API / Google Gemini API

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env.local`にコピーして、各種APIキーを設定してください：

```bash
cp .env.example .env.local
```

以下の値を設定：
- Firebase設定情報（Firebaseコンソールから取得）
- OpenAI API キーまたはGoogle Gemini API キー

### 3. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authentication > Sign-in methodでGoogle認証を有効化
3. Firestore Databaseを作成
4. プロジェクト設定から設定情報を取得して`.env.local`に設定

### 4. Firestoreセキュリティルールのデプロイ

```bash
firebase deploy --only firestore:rules
```

### 5. PWAアイコンの準備

以下のサイズのアイコンを`public/`に配置してください：
- `icon-192x192.png` (192x192px)
- `icon-512x512.png` (512x512px)

### 6. 開発サーバーの起動

```bash
npm run dev
```

## 主要機能

### 1. ユーザー認証
- Google認証によるソーシャルログイン
- Firebase Authenticationによる安全な認証管理

### 2. スキル管理
- スキルの追加・削除
- カテゴリ別の整理
- 復習推奨日の表示

### 3. ログ記録
- **音声入力**: マイクボタンで音声を録音、Web Speech APIでテキスト化
- **手動入力**: テキスト入力とフィーリング選択
- **LLM分析**: ログ内容をAIが分析し、スキルレベルと復習間隔を算出

### 4. 復習リマインダー
- 個人の忘却パターンに基づく最適な復習タイミング
- プッシュ通知によるリマインダー（予定）

### 5. PWA機能
- オフライン対応
- ホーム画面への追加
- アプリライクなユーザー体験

## デプロイ

### Vercelへのデプロイ

1. Vercelアカウントを作成
2. GitHubリポジトリを接続
3. 環境変数を設定
4. 自動デプロイの設定

## セキュリティ

- LLMプロンプトインジェクション対策
- 入力サニタイズ
- Firestoreセキュリティルール
- 環境変数による秘密情報の管理

## ライセンス

MIT License
