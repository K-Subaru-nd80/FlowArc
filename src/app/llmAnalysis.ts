export interface AnalysisResult {
  skillLevel: number; // 1-10のスキルレベル
  confidence: number; // 0-1の信頼度
  suggestion: string; // 改善提案
  feeling: 'smooth' | 'difficult' | 'normal';
  nextReviewInterval: number; // 次回復習までの日数
}

export const analyzeLogWithLLM = async (logContent: string, skillName: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch('/api/analyze-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        logContent,
        skillName,
      }),
    });

    if (!response.ok) {
      throw new Error('LLM分析に失敗しました');
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
