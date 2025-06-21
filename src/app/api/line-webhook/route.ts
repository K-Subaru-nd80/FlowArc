import { NextRequest, NextResponse } from 'next/server';
import { saveLineUserId } from '../../firestore';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // userIdを含むイベントがあればFirestoreに保存
  if (body.events && body.events.length > 0) {
    const lineUserId = body.events[0]?.source?.userId;
    // TODO: アプリのuserId（Firebase Authのuid等）を取得して紐付ける
    // ここでは例としてappUserIdを仮で指定
    const appUserId = 'sample-app-user-id'; // 実際は認証やクエリ等で取得
    if (lineUserId) {
      await saveLineUserId(appUserId, lineUserId);
      console.log('LINE userId saved to Firestore:', lineUserId);
    }
  }
  // LINEのWebhookには200を返す必要あり
  return NextResponse.json({ status: 'ok' });
}
