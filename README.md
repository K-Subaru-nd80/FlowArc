# FlowArc - Skill Decay Tracker PWA

FlowArcは、音声入力・AI分析・科学的アルゴリズム（FSRS）で「技能の忘却」を防ぐPWAです。

- Google認証・Firebase Firestoreで安全にデータ管理
- Gemini/OpenAIで練習ログをAI分析（1日10回/ユーザー）
- FSRSで最適な復習日を自動計算
- PWA対応（オフライン・ホーム追加）

## セットアップ
1. `npm install`
2. `.env.local`を用意しFirebase/Gemini APIキー等を設定
3. Firebase認証・Firestoreを有効化、セキュリティルールをデプロイ
4. `npm run dev` で起動

## デプロイ
- Vercel推奨。GitHub連携・環境変数設定で自動デプロイ

## ライセンス・画像
- MIT License

---
