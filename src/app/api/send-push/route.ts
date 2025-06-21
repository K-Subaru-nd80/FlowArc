export const config = {
  schedule: '0 * * * *' // 毎時0分に自動実行
};

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import webpush from 'web-push';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = getFirestore();

// VAPID設定
webpush.setVapidDetails(
  'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// POST: userIdを指定してPush通知を送信
export async function POST(req: NextRequest) {
  try {
    const { userId, title, body } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
    const doc = await db.collection('push_subscriptions').doc(userId).get();
    if (!doc.exists) return NextResponse.json({ error: 'subscription not found' }, { status: 404 });
    const { subscription } = doc.data()!;
    await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
