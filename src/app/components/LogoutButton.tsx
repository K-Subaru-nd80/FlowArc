'use client';

import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';

const LogoutButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch {
      // エラー時もメッセージ表示なし
    }
    setShowConfirm(false);
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative', verticalAlign: 'top' }}>
      <button
        onClick={() => setShowConfirm(true)}
        className="logout-button"
        style={{
          fontFamily: '"Geist", "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif',
          fontSize: 15,
          background: '#fff',
          color: '#333',
          border: 'none',
          borderRadius: 8,
          padding: '6px 18px',
          fontWeight: 500,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
          outline: 'none',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span style={{ fontFamily: 'inherit', fontSize: 15, fontWeight: 500 }}>ログアウト</span>
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
            borderRadius: 14,
            boxShadow: '0 2px 16px rgba(0,0,0,0.13)',
            padding: '20px 24px',
            minWidth: 220,
            textAlign: 'center',
            maxWidth: '90vw',
            fontFamily: '"Geist", "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif',
          }}>
            <div style={{ color: '#222', fontWeight: 600, marginBottom: 12, fontSize: 16, fontFamily: 'inherit' }}>本当にログアウトしますか？</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              <button
                style={{
                  background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit', boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                }}
                onClick={handleLogout}
              >
                ログアウト
              </button>
              <button
                style={{
                  background: '#fff', color: '#1976d2', border: '1px solid #1976d2', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit', boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
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
