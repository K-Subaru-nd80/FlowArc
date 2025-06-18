import { Card, createEmptyCard, Grade, fsrs, formatDate } from 'ts-fsrs';
import { AnalysisResult } from './llmAnalysis';

// FSRS設定
let w = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61];
if (w.length < 21) {
  w = [...w, ...Array(21 - w.length).fill(0)];
}
const f = fsrs({
  w,
  enable_fuzz: true,
  enable_short_term: true,
});

export interface FSRSCard {
  cardId: string;
  skillId: string;
  card: Card;
  lastReviewed: Date;
  nextReview: Date;
}

// LLM分析結果からFSRSのGradeを決定
export const analysisToGrade = (analysis: AnalysisResult): Grade => {
  const { feeling, skillLevel, confidence } = analysis;
  
  // feelingとskillLevelを組み合わせてGradeを決定
  if (feeling === 'smooth' && skillLevel >= 7 && confidence >= 0.7) {
    return 4 as Grade; // Easy: 簡単
  } else if (feeling === 'smooth' && skillLevel >= 5) {
    return 3 as Grade; // Good: 良い
  } else if (feeling === 'normal' && skillLevel >= 4) {
    return 3 as Grade; // Good: 良い
  } else if (feeling === 'difficult' || skillLevel < 4) {
    if (confidence >= 0.6) {
      return 2 as Grade; // Hard: 難しい
    } else {
      return 1 as Grade; // Again: もう一度
    }
  }
  
  // デフォルトは「良い」
  return 3 as Grade;
};

// 新しいカードを作成
export const createNewFSRSCard = (skillId: string): FSRSCard => {
  const cardId = `${skillId}_${Date.now()}`;
  const emptyCard = createEmptyCard();
  const now = new Date();
  
  return {
    cardId,
    skillId,
    card: emptyCard,
    lastReviewed: now,
    nextReview: now,
  };
};

// カードを復習して次回復習日を計算
export const reviewCard = (fsrsCard: FSRSCard, analysis: AnalysisResult): FSRSCard => {
  const grade = analysisToGrade(analysis);
  const now = new Date();
  
  // FSRSアルゴリズムでカードを更新
  const result = f.next(fsrsCard.card, now, grade);
  
  return {
    ...fsrsCard,
    card: result.card,
    lastReviewed: now,
    nextReview: result.card.due,
  };
};

// 次回復習日までの日数を計算
export const getDaysUntilNextReview = (fsrsCard: FSRSCard): number => {
  const now = new Date();
  const diffTime = fsrsCard.nextReview.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// 復習が必要かどうかを判定
export const isReviewDue = (fsrsCard: FSRSCard): boolean => {
  const now = new Date();
  return fsrsCard.nextReview <= now;
};

// 復習の緊急度を計算（0-1の値）
export const getReviewUrgency = (fsrsCard: FSRSCard): number => {
  const daysUntil = getDaysUntilNextReview(fsrsCard);
  if (daysUntil <= 0) return 1.0; // 期限切れ
  if (daysUntil <= 1) return 0.8; // 明日まで
  if (daysUntil <= 3) return 0.6; // 3日以内
  if (daysUntil <= 7) return 0.4; // 1週間以内
  return 0.2; // それ以上
};

// 次回復習日を日本語で表示
export const formatNextReviewDate = (fsrsCard: FSRSCard): string => {
  const daysUntil = getDaysUntilNextReview(fsrsCard);
  
  if (daysUntil <= 0) {
    return '復習が必要';
  } else if (daysUntil === 1) {
    return '明日';
  } else if (daysUntil <= 7) {
    return `${daysUntil}日後`;
  } else {
    return formatDate(fsrsCard.nextReview);
  }
};

// 技能の習熟度レベルを計算（カードの状態から）
export const getSkillMasteryLevel = (fsrsCard: FSRSCard): 'beginner' | 'intermediate' | 'advanced' | 'expert' => {
  const { stability } = fsrsCard.card;
  
  if (stability >= 365) { // 1年以上の安定性
    return 'expert';
  } else if (stability >= 90) { // 3ヶ月以上の安定性
    return 'advanced';
  } else if (stability >= 30) { // 1ヶ月以上の安定性
    return 'intermediate';
  } else {
    return 'beginner';
  }
};