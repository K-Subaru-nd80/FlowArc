import { NextRequest, NextResponse } from 'next/server';
import { saveLineUserId } from '../../firestore';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  // stateにアプリのuserId（Firebase Authのuid）を埋め込んでおく想定
  const appUserId = state || 'sample-app-user-id';

  if (!code) {
    return NextResponse.json({ error: 'No code' }, { status: 400 });
  }

  // LINEのアクセストークン取得
  const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI!,
      client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID!,
      client_secret: process.env.LINE_CLIENT_SECRET!,
    }),
  });
  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;

  // LINEのプロフィール取得
  const profileRes = await fetch('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profile = await profileRes.json();
  const lineUserId = profile.userId;

  // Firestoreに保存
  if (appUserId && lineUserId) {
    await saveLineUserId(appUserId, lineUserId);
  }

  // 完了画面やトップページにリダイレクト
  return NextResponse.redirect('/', 302);
}
