import React from 'react';

const LineConnect: React.FC = () => {
  const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
  // 環境によってリダイレクトURIを切り替え
  const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const redirectUri = isLocal
    ? process.env.NEXT_PUBLIC_LINE_REDIRECT_URI_LOCAL || 'http://localhost:3000/api/line-callback'
    : process.env.NEXT_PUBLIC_LINE_REDIRECT_URI || 'https://flow-arc-zeta.vercel.app/api/line-callback';
  // stateには必要に応じてuidなどを埋め込む
  const state = 'sample-app-user-id';
  const LINE_LOGIN_URL = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&state=${state}&scope=profile%20openid`;

  const handleLineLogin = () => {
    window.location.href = LINE_LOGIN_URL;
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
          backgroundColor: '#06C755',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.631-.63.346 0 .627.285.627.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.771.039 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
        </div>

        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#2d3748',
          margin: '0 0 16px 0',
          letterSpacing: '-0.5px'
        }}>
          LINE通知連携
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
          LINEアカウントと連携することで、学習の進捗や目標達成の通知をLINEで受け取ることができます。
        </p>

        <button
          onClick={handleLineLogin}
          style={{
            background: 'linear-gradient(135deg, #06C755 0%, #04B04A 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            margin: '0 auto',
            minWidth: '200px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(6, 199, 85, 0.3)',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.transform = 'translateY(-2px)';
            (e.target as HTMLElement).style.boxShadow = '0 6px 24px rgba(6, 199, 85, 0.4)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.transform = 'translateY(0)';
            (e.target as HTMLElement).style.boxShadow = '0 4px 16px rgba(6, 199, 85, 0.3)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.631-.63.346 0 .627.285.627.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.771.039 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          LINEで連携する
        </button>

        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.5'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>🔒 プライバシーについて</p>
          <p style={{ margin: 0 }}>
            お客様のプライバシーを尊重します。取得した情報は通知送信のためのみに使用し、第三者と共有することはありません。
          </p>
        </div>
      </div>
    </div>
  );
};

export default LineConnect;
