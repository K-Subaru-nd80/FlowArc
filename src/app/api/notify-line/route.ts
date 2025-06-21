import { NextRequest, NextResponse } from 'next/server';

// FirestoreからユーザーのLINE userIdを取得する関数
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from '../../firebaseInit';

const db = getFirestore(app);

// LINE通知API
export async function POST(req: NextRequest) {
  const { appUserId, message } = await req.json();
  if (!appUserId || !message) {
    return NextResponse.json({ error: 'appUserId and message are required' }, { status: 400 });
  }

  // FirestoreからLINE userIdを取得
  const userDoc = await getDoc(doc(db, 'users', appUserId));
  const lineUserId = userDoc.exists() ? userDoc.data().lineUserId : null;
  if (!lineUserId) {
    return NextResponse.json({ error: 'LINE userId not found for this user' }, { status: 404 });
  }

  // LINE通知送信
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [
        {
          type: 'text',
          text: message,
        },
      ],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ status: 'ok' });
}
