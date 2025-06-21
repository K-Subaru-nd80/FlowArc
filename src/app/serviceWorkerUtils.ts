// Service Worker登録用ユーティリティ
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker未対応のブラウザです');
    return null;
  }

  try {
    console.log('Service Worker手動登録開始...');
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker登録成功:', registration);
    
    // インストール完了まで待機
    if (registration.installing) {
      console.log('Service Workerインストール中...');
      await new Promise<void>((resolve) => {
        const sw = registration.installing!;
        sw.addEventListener('statechange', () => {
          console.log('Service Worker状態変更:', sw.state);
          if (sw.state === 'installed' || sw.state === 'activated') {
            console.log('Service Workerインストール完了');
            resolve();
          }
        });
      });
    } else if (registration.active) {
      console.log('Service Workerはすでにactive状態です');
    }
    
    return registration;
  } catch (error) {
    console.error('Service Worker登録エラー:', error);
    return null;
  }
}
