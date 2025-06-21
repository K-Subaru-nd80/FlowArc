import { NextRequest, NextResponse } from 'next/server';
import { saveLineUserId } from '../../firestore';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // userIdを含むイベントがあればFirestoreに保存
  if (body.events && body.events.length > 0) {
    const lineUserId = body.events[0]?.source?.userId;
    // appUserIdをリクエストボディから取得（なければ保存しない）
    const appUserId = body.appUserId;
    if (lineUserId && appUserId) {
      await saveLineUserId(appUserId, lineUserId);
      console.log('LINE userId saved to Firestore:', lineUserId);
    } else if (!appUserId) {
      console.warn('appUserIdが指定されていません。Firestoreへの保存はスキップされました。');
    }
  }
  // LINEのWebhookには200を返す必要あり
  return NextResponse.json({ status: 'ok' });
}
