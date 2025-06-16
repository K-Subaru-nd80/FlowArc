import React from 'react';
import { getAuth, signOut } from 'firebase/auth';

const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      alert('ログアウトしました');
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      ログアウト
    </button>
  );
};

export default LogoutButton;
