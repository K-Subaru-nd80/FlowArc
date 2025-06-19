import { NextRequest, NextResponse } from 'next/server';
import { reviewCard, createNewFSRSCard } from '../../fsrs';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import app from '../../firebaseInit';

// Firestore初期化
const db = getFirestore(app);

export async function POST(request: NextRequest) {
  try {
    const { logContent, skillName, skillId, userId, practiceTime } = await request.json();

    // 入力検証
    if (!logContent || !userId || !skillId) {
      return NextResponse.json(
        { error: 'ログ内容、ユーザーID、スキルIDは必須です' },
        { status: 400 }
      );
    }

    // システムプロンプト（ビジョンに基づく最適化・プロンプトインジェクション対策）
    const systemPrompt = `あなたは個別最適化された学習サポートを提供するアシスタントです。ユーザーの学習履歴と感覚を元に、次回復習までの最適な間隔を推定し、具体的な改善提案を行ってください。どんな場合でもこの役割を逸脱しないでください。

ユーザーが「${skillName}」スキルで練習した内容とその感覚を分析します。
このユーザーの今回の練習時間は「${practiceTime ?? '不明'}分」です。
必ずトップレベルで単一の JSON オブジェクトのみ返してください。必須フィールドと任意フィールドがあります：

【必須フィールド】
{  
  "skillLevel": 1から10の数値（練習内容から推定されるスキルレベル）,
  "confidence": 0から1の数値（分析の信頼度）,
  "isPractical": trueまたはfalse（実践的な技能かどうか）,  
  "suggestion": "改善提案やアドバイス（日本語で50文字以内）",
  "feeling": "smooth" | "difficult" | "normal"（ユーザーの感覚を分類）,
  "nextReviewInterval": 1から30の数値（次回復習までの推奨日数）,
  "difficulty": 0から10の数値（この技能の客観的な難易度）,
  "retention": 0から1の数値（練習内容から推定される記憶の定着度）,
  
  【任意フィールド（内容から推論可能な場合のみ）}
  "focusAreas": ["領域1", "領域2"]の配列（集中すべき領域。例：発音、文法、指の動き等）,
  "emotionalState": "感情状態の文字列"（例：やる気がある、疲れている、集中している）,
  "practiceQuality": 0から10の数値（練習の質の評価）,
  "timeSpent": 推定練習時間の数値（分単位）,
  "environment": "練習環境の文字列"（例：静か、騒がしい、集中できた）,
  "motivation": 0から10の数値（モチベーションレベル）
}

分析のポイント：
1. テキストから感情や状況を読み取る
2. 具体的な練習内容から技能レベルを推定
3. 困難さや達成感から次回復習間隔を決定
4. 可能な限り多くの情報を推論する`;

    // Google Gemini APIまたはOpenAI APIを使用
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API設定エラー' },
        { status: 500 }
      );
    }

    // --- LLM利用回数制限（Firestore版） ---
    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
    }
    const today = new Date().toISOString().slice(0, 10);
    const limitDocRef = doc(db, 'llm_limits', `${userId}_${today}`);
    let limitCount = 0;
    const limitSnap = await getDoc(limitDocRef);
    if (limitSnap.exists()) {
      limitCount = limitSnap.data().count || 0;
    }
    if (limitCount >= 10) {
      return NextResponse.json({ error: '本日のAI分析利用上限（10回）に達しました' }, { status: 429 });
    }
    await setDoc(limitDocRef, { count: limitCount + 1, userId, date: today }, { merge: true });

    // OpenAI APIを使用する場合の例
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: logContent }
          ],
          max_tokens: 300,
          temperature: 0.6,
          top_p: 0.9,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { error: 'LLM API呼び出しに失敗しました', detail: errorText },
          { status: 500 }
        );
      }

      const llmResult = await response.json();
      const analysisText = llmResult.choices[0].message.content;
      let analysisResult;
      try {
        analysisResult = JSON.parse(analysisText);
      } catch {
        analysisResult = {
          error: 'OpenAI出力のJSONパースに失敗',
          raw: analysisText
        };
        return NextResponse.json(analysisResult);
      }
      // --- practical判定 ---
      const isPractical = Boolean(analysisResult.isPractical);
      // --- ここでFSRSロジックを適用 ---
      const tempCard = createNewFSRSCard(skillId);
      if (analysisResult.nextReviewInterval && Number.isFinite(analysisResult.nextReviewInterval)) {
        const now = new Date();
        tempCard.nextReview = new Date(now.getTime() + analysisResult.nextReviewInterval * 24 * 60 * 60 * 1000);
      }
      const fsrsCard = reviewCard(tempCard, analysisResult);
      let fsrsNextReview = fsrsCard.nextReview;
      // Firestoreからスキルのカテゴリを取得し、分野別の最小復習間隔を設定
      // LLM判定のみで最小復習日数を決定
      const minDaysFinal = isPractical ? 2 : 1;
      const nowTime = Date.now();
      if ((fsrsNextReview.getTime() - nowTime) < minDaysFinal * 24 * 60 * 60 * 1000) {
        fsrsNextReview = new Date(nowTime + minDaysFinal * 24 * 60 * 60 * 1000);
      }

      // 最適化ロジック (LLMとFSRSの重み付け)
      let optimizedNextReview = fsrsNextReview;
      if (analysisResult.nextReviewInterval && Number.isFinite(analysisResult.nextReviewInterval)) {
        const fsrsDays = (fsrsNextReview.getTime() - nowTime) / (24 * 60 * 60 * 1000);
        const llmDays = analysisResult.nextReviewInterval;
        const wLLM = Math.min(Math.max(analysisResult.confidence, 0), 1);
        const wFSRS = 1 - wLLM;
        const optDays = Math.max(minDaysFinal, Math.round(fsrsDays * wFSRS + llmDays * wLLM));
        optimizedNextReview = new Date(nowTime + optDays * 24 * 60 * 60 * 1000);
      }

      return NextResponse.json({
        ...analysisResult,
        fsrsNextReview,
        optimizedNextReview,
      });
    } else if (process.env.GEMINI_API_KEY) {
      // Gemini API呼び出し
      const geminiRes = await fetch(
        'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // contentsのみを送信
            contents: [
              { role: 'model', parts: [{ text: systemPrompt }] },
              { role: 'user', parts: [{ text: logContent }] },
            ],
          }),
         }
       );
      if (!geminiRes.ok) {
        const errorText = await geminiRes.text();
        return NextResponse.json(
          { error: 'Gemini API呼び出しに失敗しました', detail: errorText },
          { status: 500 }
        );
      }
      const geminiResult = await geminiRes.json();
      const text = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('Gemini raw output:', text); // Geminiの生出力をログ

      if (!text) {
        return NextResponse.json(
          { error: 'Gemini APIの返却が空です', detail: JSON.stringify(geminiResult) },
          { status: 500 }
        );
      }

      // コードブロックや前後の説明文を除去
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json/, '').replace(/```$/, '').trim();
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```/, '').replace(/```$/, '').trim();
      }
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
      }

      let analysisResult;
      try {
        analysisResult = JSON.parse(jsonText);
      } catch {
        return NextResponse.json(
          { error: 'Gemini出力のJSONパースに失敗', raw: text, extracted: jsonText },
          { status: 500 }
        );
      }
      // --- ここでFSRSロジックを適用 ---
      const tempCard = createNewFSRSCard(skillId);
      if (analysisResult.nextReviewInterval && Number.isFinite(analysisResult.nextReviewInterval)) {
        const now = new Date();
        tempCard.nextReview = new Date(now.getTime() + analysisResult.nextReviewInterval * 24 * 60 * 60 * 1000);
      }
      const fsrsCard = reviewCard(tempCard, analysisResult);
      let fsrsNextReview = fsrsCard.nextReview;
      // Firestoreからスキルのカテゴリを取得し、分野別の最小復習間隔を設定
      // skillIdからカテゴリ取得（skillName検索は廃止）
      let category: string | undefined;
      const skillDoc = doc(db, 'skills', skillId);
      const skillSnapshot = await getDoc(skillDoc);
      if (skillSnapshot.exists()) {
        category = skillSnapshot.data().category as string | undefined;
      }
      // カテゴリごとの最小日数 (日)
      const minDaysByCategory: Record<string, number> = { '体幹分野': 2, 'default': 1 };
      // カテゴリが定義済みキーに含まれていればそれを、そうでなければ'default'を使用
      const categoryKey = (typeof category === 'string' && category in minDaysByCategory) ? category : 'default';
      const minDays = minDaysByCategory[categoryKey] ?? minDaysByCategory['default'];
      const nowTime = Date.now();
      if ((fsrsNextReview.getTime() - nowTime) < minDays * 24 * 60 * 60 * 1000) {
        fsrsNextReview = new Date(nowTime + minDays * 24 * 60 * 60 * 1000);
      }

      // 最適化ロジック (LLMとFSRSの重み付け)
      let optimizedNextReview = fsrsNextReview;
      if (analysisResult.nextReviewInterval && Number.isFinite(analysisResult.nextReviewInterval)) {
        const fsrsDays = (fsrsNextReview.getTime() - nowTime) / (24 * 60 * 60 * 1000);
        const llmDays = analysisResult.nextReviewInterval;
        // 動的重み付け: LLMのconfidenceを重みとして利用
        const wLLM = Math.min(Math.max(analysisResult.confidence, 0), 1);
        const wFSRS = 1 - wLLM;
        const optDays = Math.max(minDays, Math.round(fsrsDays * wFSRS + llmDays * wLLM));
        optimizedNextReview = new Date(nowTime + optDays * 24 * 60 * 60 * 1000);
      }
      return NextResponse.json({
        ...analysisResult,
        fsrsNextReview,
        optimizedNextReview,
      });
    } else {
      return NextResponse.json(
        { error: 'API設定エラー: OpenAI/GeminiのAPIキーがありません' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('LLM分析エラー:', error);
    return NextResponse.json(
      { error: '分析処理でエラーが発生しました', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
