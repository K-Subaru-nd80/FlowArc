import { NextRequest, NextResponse } from 'next/server';
import { addLog } from '../../firestore';

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

    // ログをFirestoreに保存
    const logId = await addLog({
      skillId,
      content,
      feeling,
      analysisResult,
      userId,
      createdAt: new Date(),
    });

    return NextResponse.json({ logId, success: true });
  } catch (error) {
    console.error('ログ保存エラー:', error);
    return NextResponse.json(
      { error: 'ログの保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
