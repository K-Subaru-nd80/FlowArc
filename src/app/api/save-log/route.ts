import { NextRequest, NextResponse } from 'next/server';
import { addLog, getSkillFSRSCard, updateSkillFSRSCard } from '../../firestore';
import { createNewFSRSCard, reviewCard } from '../../fsrs';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import app from '../../firebaseInit';

export async function POST(request: NextRequest) {
  try {
    const { skillId, content, feeling, analysisResult, userId } = await request.json();

    // 入力検証
    if (!skillId || !content || !feeling || !userId) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // 既存のFSRSカードを取得または新規作成
    let fsrsCard = await getSkillFSRSCard(skillId, userId);
    if (!fsrsCard) {
      fsrsCard = createNewFSRSCard(skillId);
    }

    // FSRSアルゴリズムで復習スケジュールを更新
    const updatedFSRSCard = reviewCard(fsrsCard, analysisResult);

    // ログをFirestoreに保存
    const logId = await addLog({
      skillId,
      content,
      feeling,
      analysisResult,
      userId,
      createdAt: new Date(),
      fsrsData: {
        nextReview: updatedFSRSCard.nextReview,
        lastReviewed: updatedFSRSCard.lastReviewed,
        stability: updatedFSRSCard.card.stability,
        difficulty: updatedFSRSCard.card.difficulty,
        state: updatedFSRSCard.card.state,
      },
    });

    // FSRSカードを更新
    await updateSkillFSRSCard(skillId, userId, updatedFSRSCard);

    // --- ここでskillsのnextReviewDateをoptimizedNextReviewで即時更新 ---
    if (analysisResult && analysisResult.optimizedNextReview) {
      const db = getFirestore(app);
      const skillDocRef = doc(db, 'skills', skillId);
      let nextReviewDate;
      if (typeof analysisResult.optimizedNextReview === 'string') {
        nextReviewDate = new Date(analysisResult.optimizedNextReview);
      } else {
        nextReviewDate = analysisResult.optimizedNextReview;
      }
      await setDoc(skillDocRef, { nextReviewDate }, { merge: true });
    }

    return NextResponse.json({ 
      logId, 
      success: true,
      nextReview: updatedFSRSCard.nextReview,
      daysUntilNext: Math.ceil((updatedFSRSCard.nextReview.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    });
  } catch (error) {
    console.error('ログ保存エラー:', error);
    return NextResponse.json(
      { error: 'ログの保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
