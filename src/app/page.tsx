'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import SignInButton from './components/SignInButton';
import SkillForm from './components/SkillForm';
import SkillCard from './components/SkillCard';
import LogRecorder from './components/LogRecorder';
import LineConnect from './components/LineConnect';
import { addSkill, getUserSkills, Skill } from './firestore';
import './firebaseInit'; // Firebase初期化
import LogoutButton from './components/LogoutButton';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryTab, setCategoryTab] = useState<'all' | string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // const handleLogSaved = () => {
  //   if (user) {
  //     loadUserSkills(user.uid);
  //   }
  //   setSelectedSkill(null);
  // };

  const handleSkillDeleted = (deletedId: string) => {
    setSkills((prevSkills) => prevSkills.filter((skill) => skill.id !== deletedId));
  };

  // カテゴリ一覧を抽出
  const categories = Array.from(new Set(skills.map(s => s.category).filter(Boolean)));

  // カテゴリ選択UI
  const renderCategoryGrid = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: 20,
      marginTop: 24,
      marginBottom: 24,
    }}>
      {categories.map((cat) => (
        <div
          key={cat as string}
          onClick={() => setCategoryTab(cat as string)}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '2px solid #e9ecef',
            borderRadius: 16,
            minHeight: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 600,
            color: '#495057',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = '#6ccbc7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.borderColor = '#e9ecef';
          }}
        >
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            background: 'linear-gradient(45deg, rgba(108, 203, 199, 0.1) 0%, rgba(94, 142, 150, 0.1) 100%)',
            borderRadius: '50%',
            zIndex: 0
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>{cat}</span>
        </div>
      ))}
    </div>
  );

  // フィルタリング
  const filteredSkills = categoryTab === 'all' ? skills : skills.filter(s => s.category === categoryTab);

  // タブ切り替え関数
  const handleTabClick = (tab: 'all' | 'category-select') => {
    setCategoryTab(tab);
  };

  // カテゴリ名表示用
  const showCategoryName = categoryTab !== 'all' && categoryTab !== 'category-select';

  if (isLoading) {
    return (
      <main style={{ padding: 'var(--spacing-base)', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>読み込み中...</div>
      </main>
    );
  }

  return (
    <main className={user ? '' : 'login-bg'} style={{ minHeight: '100vh', width: '100vw' }}>
      {!user ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'flex-start', 
          height: '100vh', 
          width: '100vw',
          padding: '0'
        }}>
          {/* メインロゴ - レスポンシブ配置 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: isMobile ? 'flex-start' : 'center',
            width: '100%',
            paddingTop: isMobile ? '12vh' : 'clamp(8vh, 15vh, 20vh)',
            paddingLeft: isMobile ? '8vw' : '0px',
            paddingRight: '0px'
          }}>
            <h1 style={{
              fontFamily: `'Playfair Display', 'Bebas Neue', 'Montserrat', 'Noto Sans JP', sans-serif`,
              fontSize: isMobile ? 'clamp(4rem, 18vw, 4.5rem)' : 'clamp(5rem, 15vw, 12rem)',
              fontWeight: 300,
              color: '#fff',
              letterSpacing: '0.02em',
              marginBottom: 0,
              marginTop: 0,
              lineHeight: 0.9,
              textAlign: isMobile ? 'left' : 'center',
              userSelect: 'none',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}>
              Flow<br />Arc
            </h1>
            <div style={{
              marginTop: isMobile ? '3vh' : '4vh',
              fontSize: isMobile ? '1.1rem' : '1.5rem',
              color: 'rgba(255,255,255,0.92)',
              fontWeight: 400,
              letterSpacing: '0.3em',
              textAlign: isMobile ? 'left' : 'center',
              textShadow: '0 1px 8px rgba(0,0,0,0.18)',
              whiteSpace: 'pre-line',
              lineHeight: 1.6,
              maxWidth: 480,
            }}>
              忘れさせない、あなたの技能を。
            </div>
          </div>
          
          {/* スペーサー */}
          <div style={{ flex: 1 }} />
          
          {/* 下部のログインボタン */}
          <div style={{ 
            display: 'flex',
            alignItems: 'flex-end',
            width: '100%',
            maxWidth: '400px',
            paddingBottom: '8vh',
            paddingLeft: 'clamp(5vw, 5vw, 0px)',
            paddingRight: 'clamp(5vw, 5vw, 0px)'
          }}>
            <SignInButton />
          </div>
        </div>
      ) : (
        <>
          {/* ここにログイン後のUIを展開 */}
          {/* 既存のmainタグ内の内容をここに移動してください */}
          {showSettings ? (
            <main style={{ padding: 0, minHeight: '100vh', background: '#fff' }}>
              {/* ヘッダー */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #418089 0%, #5e8e96 100%)',
                color: '#fff',
                padding: '20px 32px 16px 32px',
                fontFamily: '"Times New Roman", "Yu Mincho", "Hiragino Mincho ProN", serif',
                fontWeight: 600,
                fontSize: 28,
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 4px 16px rgba(65, 128, 137, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <span 
                  onClick={() => setShowSettings(false)}
                  style={{ 
                    fontSize: 36, 
                    letterSpacing: 3,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
                >
                  FlowArc
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => setShowSettings(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <LogoutButton />
                </div>
              </div>
              <div style={{ padding: '20px 16px', background: 'linear-gradient(to bottom, #fafbfc 0%, #ffffff 100%)', minHeight: 'calc(100vh - 80px)' }}>
                <LineConnect />
              </div>
            </main>
          ) : selectedSkill ? (
            <main style={{ padding: 'var(--spacing-base)' }}>
              <LogRecorder
                skillId={selectedSkill.id}
                skillName={selectedSkill.name}
                category={selectedSkill.category}
                userId={user.uid}
                onBack={() => setSelectedSkill(null)}
              />
            </main>
          ) : (
            <main style={{ padding: 0, minHeight: '100vh', background: '#fff' }}>
              {/* ヘッダー */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #418089 0%, #5e8e96 100%)',
                color: '#fff',
                padding: '20px 32px 16px 32px',
                fontFamily: '"Times New Roman", "Yu Mincho", "Hiragino Mincho ProN", serif',
                fontWeight: 600,
                fontSize: 28,
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 4px 16px rgba(65, 128, 137, 0.15)',
                backdropFilter: 'blur(10px)'
              }}>
                <span 
                  style={{ 
                    fontSize: 36, 
                    letterSpacing: 3,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
                >
                  FlowArc
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => setShowSettings(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </button>
                  <LogoutButton />
                </div>
              </div>
              <div style={{ padding: '20px 16px 0 16px', background: 'linear-gradient(to bottom, #fafbfc 0%, #ffffff 100%)', minHeight: 'calc(100vh - 80px)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' }}>
                  <button
                    onClick={() => setShowSkillForm(true)}
                    style={{ 
                      padding: '10px 16px', 
                      background: '#6ccbc7', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 12, 
                      fontSize: 16, 
                      fontWeight: 600, 
                      letterSpacing: '0.5px', 
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', 
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    ＋新規入力
                  </button>
                  <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
                    <div
                      style={{
                        width: 170,
                        height: 48,
                        background: '#f8f9fa',
                        borderRadius: 24,
                        border: '2px solid #e9ecef',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                        position: 'relative',
                        display: 'flex',
                        userSelect: 'none',
                        overflow: 'hidden',
                      }}
                    >
                      {/* 水色のスイッチ部分をカテゴリ選択時は非表示に */}
                      {!(categoryTab !== 'all' && categoryTab !== 'category-select') && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 2, 
                            left: categoryTab === 'all' ? 4 : 86,
                            width: 80,
                            height: 40,
                            borderRadius: 20,
                            background: '#5e8e96',
                            zIndex: 1,
                            transition: 'left 0.2s ease, top 0.2s cubic-bezier(0.4,0,0.2,1)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleTabClick('all')}
                        style={{
                          flex: 1,
                          zIndex: 2,
                          background: 'transparent',
                          color: categoryTab === 'all' ? '#fff' : '#333',
                          fontWeight: 600,
                          fontSize: 14,
                          border: 'none',
                          borderRadius: 20,
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'color 0.2s ease',
                          padding: 0,
                          height: 48,
                        }}
                      >
                        全表示
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTabClick('category-select')}
                        style={{
                          flex: 1,
                          zIndex: 2,
                          background: 'transparent',
                          color: categoryTab === 'category-select' ? '#fff' : '#333',
                          fontWeight: 600,
                          fontSize: 14,
                          border: 'none',
                          borderRadius: 20,
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'color 0.2s ease',
                          padding: 0,
                          height: 48,
                        }}
                      >
                        カテゴリ
                      </button>
                    </div>
                  </div>
                </div>
                {showSkillForm && (
                  <div style={{ 
                    marginBottom: 24,
                    padding: 20,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    borderRadius: 16,
                    border: '2px solid #e9ecef',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}>
                    <SkillForm onSubmit={handleAddSkill} onCancel={() => setShowSkillForm(false)} />
                  </div>
                )}
                {/* カテゴリ選択画面 */}
                {categoryTab === 'category-select' ? (
                  <div>
                    <div style={{
                      textAlign: 'center',
                      marginBottom: 24,
                      padding: '20px 0'
                    }}>
                      <h2 style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#2d3748',
                        margin: '0 0 8px 0'
                      }}>
                        カテゴリを選択
                      </h2>
                      <p style={{
                        fontSize: 16,
                        color: '#718096',
                        margin: 0,
                        fontWeight: 400
                      }}>
                        学習したいスキルのカテゴリを選んでください
                      </p>
                    </div>
                    {renderCategoryGrid()}
                  </div>
                ) : (
                  <div style={{ minHeight: 400 }}>
                    {showCategoryName && (
                      <div style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: '#2d3748',
                        marginBottom: 16,
                        textAlign: 'center', 
                        letterSpacing: 1
                      }}>
                        カテゴリ: {categoryTab}
                      </div>
                    )}
                    {filteredSkills.length === 0 ? (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '80px 20px',
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                        borderRadius: 16,
                        border: '2px dashed #e9ecef',
                        margin: '40px 0'
                      }}>
                        <div style={{
                          fontSize: 48,
                          marginBottom: 16,
                          opacity: 0.6
                        }}>📚</div>
                        <h3 style={{
                          fontSize: 20,
                          fontWeight: 600,
                          color: '#6c757d',
                          margin: '0 0 8px 0'
                        }}>
                          スキルがまだありません
                        </h3>
                        <p style={{
                          fontSize: 16,
                          color: '#adb5bd',
                          margin: 0
                        }}>
                          「＋新規入力」ボタンから最初のスキルを追加してみましょう
                        </p>
                      </div>
                    ) : (
                      <div style={{
                        display: 'grid',
                        gap: 16,
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))'
                      }}>
                        {filteredSkills.map((skill) => (
                          <SkillCard
                            key={skill.id}
                            skill={skill}
                            onClick={() => setSelectedSkill(skill)}
                            onDelete={() => handleSkillDeleted(skill.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </main>
          )}
        </>
      )}
    </main>
  );
}
