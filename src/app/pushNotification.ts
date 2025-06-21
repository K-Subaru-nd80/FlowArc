// PWAプッシュ通知の購読・許可リクエスト用ユーティリティ
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('このブラウザは通知に対応していません');
  }
  
  console.log('Notification.permission (リクエスト前):', Notification.permission);
  
  // すでに許可済みの場合はそのまま返す
  if (Notification.permission === 'granted') {
    console.log('すでに許可済みです');
    return Notification.permission;
  }
  
  // 拒否されている場合はエラー
  if (Notification.permission === 'denied') {
    console.log('通知が拒否されています。ブラウザ設定で許可してください。');
    throw new Error('通知が拒否されています。ブラウザ設定で許可してください。');
  }
  
  console.log('通知許可をリクエストします...');
  const permission = await Notification.requestPermission();
  console.log('リクエスト結果:', permission);
  
  return permission;
}

export async function subscribePush(): Promise<PushSubscription | null> {
  console.log('subscribePush開始');
  
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker未対応');
    return null;
  }
  
  console.log('Service Worker登録確認中...');
  
  // Service Worker登録状況をチェック
  const registrations = await navigator.serviceWorker.getRegistrations();
  console.log('登録済みService Worker数:', registrations.length);
  registrations.forEach((reg, index) => {
    console.log(`Service Worker ${index}:`, reg.scope, reg.active ? reg.active.state : 'activeなし');
  });
  
  // タイムアウト付きでreadyを待つ
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Service Worker登録がタイムアウトしました')), 10000)
    )
  ]);
  
  console.log('Service Worker登録済み:', registration);
  console.log('Service Worker状態:', registration.active?.state);
  
  // VAPID公開鍵（本番運用時は.env等で管理）
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '<YOUR_VAPID_PUBLIC_KEY_HERE>';
  console.log('VAPID公開鍵:', vapidPublicKey?.substring(0, 20) + '...');
  
  if (vapidPublicKey === '<YOUR_VAPID_PUBLIC_KEY_HERE>') {
    throw new Error('VAPID公開鍵が設定されていません');
  }
  
  console.log('Push購読開始...');
  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
  console.log('VAPID鍵変換完了');
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });
  
  console.log('Push購読成功:', subscription);
  return subscription;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
