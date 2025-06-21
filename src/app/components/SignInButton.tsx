import React from "react";
import { signInWithGoogle } from "../auth";
import Image from 'next/image';

const SignInButton: React.FC = () => {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      style={{
        width: '100%',
        maxWidth: 360,
        margin: '0 auto',
        padding: '14px 0',
        backgroundColor: '#fff',
        color: '#444',
        border: '1px solid #ddd',
        borderRadius: 8,
        fontSize: 18,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={24} height={24} style={{ marginRight: 8 }} />
      <span style={{ fontSize: 17 }}>Google でログイン</span>
    </button>
  );
};

export default SignInButton;
