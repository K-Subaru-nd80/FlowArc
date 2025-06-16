'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import SignInButton from './components/SignInButton';
import SkillForm from './components/SkillForm';
import SkillCard from './components/SkillCard';
import LogRecorder from './components/LogRecorder';
import { addSkill, getUserSkills, Skill } from './firestore';
import './firebaseInit'; // Firebase初期化
import LogoutButton from './components/LogoutButton';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
      if (user) {
        loadUserSkills(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserSkills = async (userId: string) => {
    try {
      const userSkills = await getUserSkills(userId);
      setSkills(userSkills);
    } catch (error) {
      console.error('スキル取得エラー:', error);
    }
  };

  const handleAddSkill = async (skillName: string, category?: string) => {
    if (!user) return;

    try {
      await addSkill(user.uid, skillName, category);
      await loadUserSkills(user.uid);
      setShowSkillForm(false);
    } catch (error) {
      console.error('スキル追加エラー:', error);
      alert('スキルの追加に失敗しました');
    }
  };

  const handleLogSaved = () => {
    if (user) {
      loadUserSkills(user.uid);
    }
    setSelectedSkill(null);
  };

  const handleSkillDeleted = (deletedId: string) => {
    setSkills((prevSkills) => prevSkills.filter((skill) => skill.id !== deletedId));
  };

  if (isLoading) {
    return (
      <main style={{ 
        padding: 'var(--spacing-base)', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div>読み込み中...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ 
        padding: 'var(--spacing-base)', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <h1 style={{ marginBottom: 'var(--spacing-base)' }}>FlowArc</h1>
        <p style={{ 
          marginBottom: 'calc(var(--spacing-base) * 2)',
          color: '#666',
          fontSize: 'var(--font-size-large)',
        }}>
          忘れさせない、あなたの技能を。
        </p>
        <SignInButton />
      </main>
    );
  }

  if (selectedSkill) {
    return (
      <main style={{ padding: 'var(--spacing-base)' }}>
        <div style={{ marginBottom: 'var(--spacing-base)' }}>
          <button
            onClick={() => setSelectedSkill(null)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-small)',
            }}
          >
            ← 戻る
          </button>
        </div>
        <LogRecorder
          skillId={selectedSkill.id}
          skillName={selectedSkill.name}
          userId={user.uid}
          onLogSaved={handleLogSaved}
        />
      </main>
    );
  }

  return (
    <main style={{ padding: 'var(--spacing-base)' }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'calc(var(--spacing-base) * 2)',
      }}>
        <div>
          <h1 style={{ margin: 0 }}>FlowArc</h1>
          <p style={{ margin: 0, color: '#666', fontSize: 'var(--font-size-small)' }}>
            ようこそ、{user.displayName || 'ユーザー'}さん
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => setShowSkillForm(true)}
            style={{
              padding: 'var(--spacing-base)',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-base)',
              marginRight: 'var(--spacing-base)',
            }}
          >
            + スキル追加
          </button>
          <LogoutButton />
        </div>
      </div>

      {/* スキル追加フォーム */}
      {showSkillForm && (
        <div style={{ marginBottom: 'calc(var(--spacing-base) * 2)' }}>
          <SkillForm
            onSubmit={handleAddSkill}
            onCancel={() => setShowSkillForm(false)}
          />
        </div>
      )}

      {/* スキル一覧 */}
      {skills.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'calc(var(--spacing-base) * 4)',
          color: '#666',
        }}>
          <p>まだスキルが登録されていません</p>
          <p style={{ fontSize: 'var(--font-size-small)' }}>
            「+ スキル追加」ボタンから最初のスキルを追加してみましょう
          </p>
        </div>
      ) : (
        <div>
          <h2 style={{ marginBottom: 'var(--spacing-base)' }}>あなたのスキル</h2>
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onClick={() => setSelectedSkill(skill)}
              onDelete={() => handleSkillDeleted(skill.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
