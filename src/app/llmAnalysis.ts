export interface AnalysisResult {
  skillLevel: number; // 1-10のスキルレベル
  confidence: number; // 0-1の信頼度
  suggestion: string; // 改善提案
  feeling: 'smooth' | 'difficult' | 'normal';
  nextReviewInterval?: number; // 次回復習までの日数
  difficulty: number; // 0-10の技能の客観的難易度
  retention: number; // 0-1の記憶定着度

  // 追加のLLM推論パラメーター
  focusAreas?: string[]; // 集中すべき領域（例：「発音」、「文法」、「リズム」）
  emotionalState?: string; // 感情状態（例：「やる気がある」、「疲れている」、「集中している」）
  practiceQuality?: number; // 0-10の練習の質
  timeSpent?: number; // 推定練習時間（分）
  environment?: string; // 練習環境（例：「静か」、「騒がしい」、「集中できた」）
  motivation?: number; // 0-10のモチベーションレベル

  // --- 追加: 復習日推定の比較用 ---
  fsrsNextReview?: string | Date;
  optimizedNextReview?: string | Date;
}

export const analyzeLogWithLLM = async (logContent: string, skillName: string, userId: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch('/api/analyze-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        logContent,
        skillName,
        userId, // userIdを必ず含める
      }),
    });

    if (!response.ok) {
      // サーバーから返されたエラー詳細を取得
      const errorDetail = await response.json();
      console.error('LLM分析APIエラー:', errorDetail);
      throw new Error('LLM分析に失敗しました: ' + (errorDetail?.error || '') + (errorDetail?.detail ? ' / ' + errorDetail.detail : ''));
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('LLM分析エラー:', error);
    throw error;
  }
};

// 入力サニタイズ関数（セキュリティ対策）
export const sanitizeInput = (input: string): string => {
  // 基本的なプロンプトインジェクション対策
  const suspiciousPatterns = [
    /ignore\s+previous\s+instructions/i,
    /you\s+are\s+now/i,
    /forget\s+everything/i,
    /new\s+role/i,
    /system\s*:/i,
    /assistant\s*:/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return input.replace(pattern, '[フィルタリング済み]');
    }
  }

  return input;
};

// 既存の呼び出し箇所を修正
// analyzeLogWithLLM(sanitizedContent, skillName) → analyzeLogWithLLM(sanitizedContent, skillName, userId)
