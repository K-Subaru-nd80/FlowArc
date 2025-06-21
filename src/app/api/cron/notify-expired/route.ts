import { NextResponse } from 'next/server';
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

export async function GET() {
  const now = new Date();
  // nextReviewDate <= 今日 のスキルを取得
  const skillsSnapshot = await db.collection('skills').where('nextReviewDate', '<=', now).get();
  // userIdごとに該当スキル名をまとめる
  const userSkillMap: Record<string, string[]> = {};
  skillsSnapshot.forEach(doc => {
    const data = doc.data();
    if (!data.userId || !data.name) return;
    if (!userSkillMap[data.userId]) userSkillMap[data.userId] = [];
    userSkillMap[data.userId].push(data.name);
  });

  const notifiedUsers: string[] = [];
  for (const [userId, skillNames] of Object.entries(userSkillMap)) {
    // Push購読情報を取得
    const subDoc = await db.collection('push_subscriptions').doc(userId).get();
    if (!subDoc.exists) continue;
    const { subscription } = subDoc.data()!;
    // 通知内容
    const title = '復習リマインダー';
    const body = skillNames.length === 1
      ? `「${skillNames[0]}」の復習予定日です！アプリで進捗を記録しましょう。`
      : `本日復習予定のスキル: ${skillNames.map(n => `「${n}」`).join('、')}\nアプリで進捗を記録しましょう。`;
    try {
      await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
      notifiedUsers.push(userId);
    } catch (e) {
      console.error('Push通知送信エラー:', userId, e);
    }
  }
  return NextResponse.json({ status: 'done', notified: notifiedUsers });
}
