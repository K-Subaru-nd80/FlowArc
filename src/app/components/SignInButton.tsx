import React from "react";
import { signInWithGoogle } from "../auth";

const SignInButton: React.FC = () => {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      alert("ログイン成功！");
    } catch (err) {
      console.error("Login error:", err);
      alert("ログインに失敗しました。");
    }
  };

  return (
    <button onClick={handleSignIn} style={{
      padding: "var(--spacing-base)",
      backgroundColor: "var(--color-primary)",
      color: "var(--color-background)",
      border: "none",
      borderRadius: "var(--border-radius)",
      cursor: "pointer",
    }}>
      Googleでログイン
    </button>
  );
};

export default SignInButton;
