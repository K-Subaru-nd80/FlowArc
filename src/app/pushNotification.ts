// PWAプッシュ通知の購読・許可リクエスト用ユーティリティ
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('このブラウザは通知に対応していません');
  }
  const permission = await Notification.requestPermission();
  return permission;
}

export async function subscribePush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.ready;
  // VAPID公開鍵（本番運用時は.env等で管理）
  const vapidPublicKey = '<YOUR_VAPID_PUBLIC_KEY_HERE>';
  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });
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
