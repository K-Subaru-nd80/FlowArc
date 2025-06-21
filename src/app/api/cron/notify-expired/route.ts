import { NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import app from '../../../firebaseInit';

const db = getFirestore(app);

export async function GET() {
  const now = new Date();
  // 期限切れ（nextReviewDate <= now）のスキルを取得
  const q = query(
    collection(db, 'skills'),
    where('nextReviewDate', '<=', now)
  );
  const snapshot = await getDocs(q);
  const notifiedUsers = new Set();
  for (const skillDoc of snapshot.docs) {
    const skill = skillDoc.data();
    const appUserId = skill.userId;
    if (!appUserId || notifiedUsers.has(appUserId)) continue;
    // FirestoreからLINE userId取得
    const userDoc = await getDoc(doc(db, 'users', appUserId));
    const lineUserId = userDoc.exists() ? userDoc.data().lineUserId : null;
    if (!lineUserId) continue;
    // LINE通知送信
    await fetch('https://api.line.me/v2/bot/message/push', {
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
            text: `「${skill.name}」の復習期限が来ています！アプリで進捗を記録しましょう。`,
          },
        ],
      }),
    });
    notifiedUsers.add(appUserId);
  }
  return NextResponse.json({ status: 'done', notified: Array.from(notifiedUsers) });
}
