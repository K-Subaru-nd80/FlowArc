import React, { useState } from 'react';
import VoiceInput from './VoiceInput';
import { analyzeLogWithLLM, sanitizeInput, AnalysisResult } from '../llmAnalysis';

interface LogRecorderProps {
  skillId: string;
  skillName: string;
  category?: string;
  userId: string;
  onLogSaved: () => void;
  onBack: () => void;
}

const LogRecorder: React.FC<LogRecorderProps> = ({ skillId, skillName, category, userId, onLogSaved, onBack }) => {
  const [logContent, setLogContent] = useState('');
  const [feeling, setFeeling] = useState<'smooth' | 'difficult' | 'normal'>('normal');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);
  const [practiceTime, setPracticeTime] = useState<string>('');

  const handleVoiceResult = (transcript: string) => {
    setLogContent(transcript);
  };

  const handleVoiceError = (error: string) => {
    alert(`音声認識エラー: ${error}`);
  };

  const handleSubmit = async () => {
    if (!logContent.trim()) {
      alert('ログ内容を入力してください');
      return;
    }
    if (practiceTime === '' || isNaN(Number(practiceTime)) || Number(practiceTime) < 0) {
      alert('練習時間（分）を正しく入力してください');
      return;
    }

    setIsAnalyzing(true);
    try {
      // 入力をサニタイズ
      const sanitizedContent = sanitizeInput(logContent);
      
      // LLM分析を実行
      const analysisResult = await analyzeLogWithLLM(sanitizedContent, skillName, skillId, userId, Number(practiceTime));
      
      // Firestoreに保存
      const response = await fetch('/api/save-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillId,
          content: sanitizedContent,
          feeling,
          analysisResult,
          practiceTime: Number(practiceTime),
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('ログの保存に失敗しました');
      }

      // フォームをリセット
      setLogContent('');
      setFeeling('normal');
      setPracticeTime('');
      setLastAnalysis(analysisResult);
      onLogSaved();
      
      alert('ログを保存しました！');
    } catch (error) {
      console.error('ログ保存エラー:', error);
      alert('ログの保存中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      width: '100%',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    }}>
      {/* ヘッダー */}
      <div style={{
        backgroundColor: '#319795',
        color: 'white',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* 円形白背景＋太め矢印アイコン */}
        <div
          onClick={onBack}
          style={{
            width: 40,
            height: 40,
            background: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginRight: 12,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <polyline points="14 4 8 11 14 18" stroke="#319795" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <h2 style={{ 
          margin: 0, 
          fontSize: '18px',
          fontWeight: '600',
          flex: 1,
        }}>
          ノートを追加
        </h2>
      </div>

      {/* コンテンツ */}
      <div style={{ 
        padding: window.innerWidth <= 480 ? '16px' : '24px',
      }}>
        {/* スキル情報 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: window.innerWidth <= 480 ? '16px' : '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f7fafc',
            borderRadius: '20px',
            overflow: 'hidden',
          }}>
            <span style={{
              backgroundColor: '#e2e8f0',
              padding: '6px 12px',
              fontSize: '12px',
              color: '#4a5568',
              fontWeight: '500',
            }}>
              スキル
            </span>
            <span style={{
              backgroundColor: '#319795',
              color: 'white',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
            }}>
              {skillName}
            </span>
          </div>
          {category && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f7fafc',
              borderRadius: '20px',
              overflow: 'hidden',
            }}>
              <span style={{
                backgroundColor: '#e2e8f0',
                padding: '6px 12px',
                fontSize: '12px',
                color: '#4a5568',
                fontWeight: '500',
              }}>
                カテゴリ
              </span>
              <span style={{
                backgroundColor: '#319795',
                color: 'white',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '500',
              }}>
                {category}
              </span>
            </div>
          )}
        </div>

        {/* 練習時間 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: '#2d3748',
          }}>
            練習時間（分）
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={practiceTime}
            onChange={e => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) setPracticeTime(val);
            }}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
            placeholder="例: 30"
          />
        </div>

        {/* 入力モード切り替えボタン */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => setInputMode('voice')}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: inputMode === 'voice' ? '#319795' : '#f7fafc',
              color: inputMode === 'voice' ? 'white' : '#4a5568',
              border: inputMode === 'voice' ? 'none' : '1px solid #e2e8f0',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🎙️
          </button>
          <button
            onClick={() => setInputMode('text')}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: inputMode === 'text' ? '#319795' : '#f7fafc',
              color: inputMode === 'text' ? 'white' : '#4a5568',
              border: inputMode === 'text' ? 'none' : '1px solid #e2e8f0',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⌨️
          </button>
        </div>

        {/* 入力エリア */}
        {inputMode === 'voice' ? (
          <div style={{ 
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: '2px solid #e2e8f0',
              margin: '0 auto 16px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f9f9f9',
            }}>
              <VoiceInput
                onResult={handleVoiceResult}
                onError={handleVoiceError}
                disabled={isAnalyzing}
              />
            </div>
            {logContent && (
              <div style={{
                padding: '12px',
                backgroundColor: '#f0f8ff',
                borderRadius: '8px',
                fontSize: '14px',
                textAlign: 'left',
                marginTop: '16px',
              }}>
                <strong>認識結果:</strong> {logContent}
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={logContent}
            onChange={(e) => setLogContent(e.target.value)}
            placeholder="今日の練習内容や感じたことを入力してください"
            disabled={isAnalyzing}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              resize: 'vertical',
              boxSizing: 'border-box',
              marginBottom: '20px',
              fontFamily: 'inherit',
            }}
          />
        )}

        {/* 感覚選択 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#2d3748',
          }}>
            今日の感覚は？
          </label>
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            {[
              { value: 'smooth', label: 'A', emoji: '👍', color: '#48bb78' },
              { value: 'normal', label: 'B', emoji: '😐', color: '#ed8936' },
              { value: 'difficult', label: 'C', emoji: '👎', color: '#f56565' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFeeling(option.value as 'smooth' | 'difficult' | 'normal')}
                disabled={isAnalyzing}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: feeling === option.value ? option.color : '#f7fafc',
                  color: feeling === option.value ? 'white' : '#4a5568',
                  border: feeling === option.value ? 'none' : '1px solid #e2e8f0',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  opacity: isAnalyzing ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSubmit}
          disabled={!logContent.trim() || isAnalyzing}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#319795',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: (!logContent.trim() || isAnalyzing) ? 'not-allowed' : 'pointer',
            opacity: (!logContent.trim() || isAnalyzing) ? 0.5 : 1,
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          {isAnalyzing ? '分析中...' : '保存'}
        </button>

        {/* 分析結果表示 */}
        {lastAnalysis && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#f0f8ff',
            borderRadius: '8px',
            border: '1px solid #e0e8ff',
          }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '16px', 
              fontWeight: '600',
              color: '#2d3748',
            }}>
              📊 分析結果
            </h4>
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#4a5568' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>スキルレベル:</strong> {lastAnalysis.skillLevel}/10
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>提案:</strong> {lastAnalysis.suggestion}
              </div>
              {lastAnalysis.focusAreas && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>重点領域:</strong> {lastAnalysis.focusAreas.join(', ')}
                </div>
              )}
              {lastAnalysis.emotionalState && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>感情状態:</strong> {lastAnalysis.emotionalState}
                </div>
              )}
              {lastAnalysis.practiceQuality && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>練習の質:</strong> {lastAnalysis.practiceQuality}/10
                </div>
              )}
              {lastAnalysis.timeSpent && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>推定練習時間:</strong> {lastAnalysis.timeSpent}分
                </div>
              )}
              {lastAnalysis.motivation && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>モチベーション:</strong> {lastAnalysis.motivation}/10
                </div>
              )}
              {lastAnalysis.fsrsNextReview && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <strong>科学的推定（FSRS）:</strong> {new Date(lastAnalysis.fsrsNextReview).toLocaleDateString()}（{Math.ceil((new Date(lastAnalysis.fsrsNextReview).getTime() - Date.now())/(1000*60*60*24))}日後）
                </div>
              )}
              {lastAnalysis.nextReviewInterval && (
                <div style={{ marginTop: '8px' }}>
                  <strong>AI推定:</strong> {lastAnalysis.nextReviewInterval}日後
                </div>
              )}
              {lastAnalysis.optimizedNextReview && (
                <div style={{ marginTop: '8px', fontWeight: 'bold', color: '#319795' }}>
                  <strong>最適化後:</strong> {new Date(lastAnalysis.optimizedNextReview).toLocaleDateString()}（{Math.ceil((new Date(lastAnalysis.optimizedNextReview).getTime() - Date.now())/(1000*60*60*24))}日後）
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogRecorder;
