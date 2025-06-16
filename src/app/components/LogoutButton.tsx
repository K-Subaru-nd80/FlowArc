import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';

const LogoutButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      // メッセージ表示なし
    } catch (error) {
      // エラー時もメッセージ表示なし
    }
    setShowConfirm(false);
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative', verticalAlign: 'top' }}>
      <button onClick={() => setShowConfirm(true)} className="logout-button">
        ログアウト
      </button>
      {showConfirm && (
        <div className="logout-confirm-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid #1976d2',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            padding: '20px 24px',
            minWidth: 220,
            textAlign: 'center',
            maxWidth: '90vw',
          }}>
            <div style={{ color: '#222', fontWeight: 700, marginBottom: 12, fontSize: 18 }}>本当にログアウトしますか？</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              <button
                style={{
                  background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 16
                }}
                onClick={handleLogout}
              >
                ログアウト
              </button>
              <button
                style={{
                  background: '#fff', color: '#1976d2', border: '1px solid #1976d2', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 16
                }}
                onClick={() => setShowConfirm(false)}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoutButton;
