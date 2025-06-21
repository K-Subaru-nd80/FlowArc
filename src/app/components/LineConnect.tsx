import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { requestNotificationPermission, subscribePush } from '../pushNotification';
import { registerServiceWorker } from '../serviceWorkerUtils';

const PushNotificationSettings: React.FC = () => {
  const [notifStatus, setNotifStatus] = useState<'idle' | 'loading' | 'enabled' | 'error'>('idle');
  const [notifMsg, setNotifMsg] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotifStatus('enabled');
        setNotifMsg('すでに通知が許可されています');
      } else if (Notification.permission === 'denied') {
        setNotifStatus('error');
        setNotifMsg('通知が拒否されています。ブラウザの設定から許可してください。');
      }
    }
  }, []);

  const handleEnablePush = async () => {
    setNotifStatus('loading');
    setNotifMsg('');
    try {
      console.log('通知許可リクエスト開始');
      
      // 通知対応チェック
      if (!('Notification' in window)) {
        throw new Error('このブラウザは通知に対応していません');
      }
      
      // 現在の許可状態をチェック
      console.log('現在の通知許可状態:', Notification.permission);
      
      const permission = await requestNotificationPermission();
      console.log('取得した許可状態:', permission);
      
      if (permission !== 'granted') {
        setNotifStatus('error');
        setNotifMsg(`通知が許可されませんでした (状態: ${permission})`);
        return;
      }
      
      console.log('Push購読を開始します...');
      
      // Service Worker登録の確認と手動登録
      try {
        const subscription = await subscribePush();
        console.log('Push購読結果:', subscription);
        
        if (!subscription) throw new Error('購読に失敗しました');
        
        console.log('ユーザー確認中...');
        const auth = getAuth();
        const user = auth.currentUser;
        console.log('現在のユーザー:', user?.uid);
        
        if (!user) throw new Error('ログインが必要です');
        
        console.log('API送信中...');
        const res = await fetch('/api/push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, subscription }),
        });
        console.log('API レスポンス status:', res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.log('API エラー:', errorText);
          throw new Error(`サーバー登録に失敗しました: ${errorText}`);
        }
        
        console.log('購読完了！');
        setNotifStatus('enabled');
        setNotifMsg('プッシュ通知が有効になりました！');
        
      } catch (swError: unknown) {
        if (swError instanceof Error) {
          console.log('Service Worker関連エラー:', swError.message);
          if (swError.message.includes('タイムアウト') || swError.message.includes('登録')) {
            console.log('Service Workerを手動登録します...');
            await registerServiceWorker();
            setNotifStatus('error');
            setNotifMsg('Service Workerを登録しました。ページをリロードして再度お試しください。');
          } else {
            throw swError;
          }
        } else {
          console.log('Service Worker関連エラー:', swError);
          throw swError;
        }
      }
      setNotifStatus('enabled');
      setNotifMsg('プッシュ通知が有効になりました！');
    } catch (e: unknown) {
      if (e instanceof Error) {
        setNotifStatus('error');
        setNotifMsg(e.message || 'エラーが発生しました');
      } else {
        setNotifStatus('error');
        setNotifMsg('エラーが発生しました');
      }
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '40px 20px',
      textAlign: 'center' 
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#4A90E2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>

        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#2d3748',
          margin: '0 0 16px 0',
          letterSpacing: '-0.5px'
        }}>
          プッシュ通知設定
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: '#718096',
          lineHeight: '1.6',
          margin: '0 0 32px 0',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          復習の時期になったら、ブラウザの通知でお知らせします。効率的な学習をサポートします。
        </p>

        <button
          onClick={handleEnablePush}
          style={{
            background: notifStatus === 'enabled' ? '#4A90E2' : 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: notifStatus === 'enabled' ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            margin: '0 auto',
            minWidth: '200px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(74, 144, 226, 0.3)',
            opacity: notifStatus === 'enabled' ? 0.7 : 1,
          }}
          disabled={notifStatus === 'enabled' || notifStatus === 'loading'}
          onMouseEnter={(e) => {
            if (notifStatus !== 'enabled') {
              (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLElement).style.boxShadow = '0 6px 24px rgba(74, 144, 226, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (notifStatus !== 'enabled') {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
              (e.target as HTMLElement).style.boxShadow = '0 4px 16px rgba(74, 144, 226, 0.3)';
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          {notifStatus === 'loading' ? '設定中...' : notifStatus === 'enabled' ? '通知ON' : '通知を有効にする'}
        </button>
        {notifMsg && <div style={{ color: notifStatus === 'error' ? 'red' : '#4A90E2', marginBottom: 12, marginTop: 16 }}>{notifMsg}</div>}

        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.5'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>� 通知について</p>
          <p style={{ margin: 0 }}>
            復習推奨日になったらブラウザ通知でお知らせします。通知は学習効率向上のためのみに使用されます。
          </p>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationSettings;
