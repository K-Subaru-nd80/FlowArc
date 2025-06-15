import React, { useState } from 'react';
import VoiceInput from './VoiceInput';
import { analyzeLogWithLLM, sanitizeInput } from '../llmAnalysis';

interface LogRecorderProps {
  skillId: string;
  skillName: string;
  userId: string;
  onLogSaved: () => void;
}

const LogRecorder: React.FC<LogRecorderProps> = ({ skillId, skillName, userId, onLogSaved }) => {
  const [logContent, setLogContent] = useState('');
  const [feeling, setFeeling] = useState<'smooth' | 'difficult' | 'normal'>('normal');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

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

    setIsAnalyzing(true);
    try {
      // 入力をサニタイズ
      const sanitizedContent = sanitizeInput(logContent);
      
      // LLM分析を実行
      const analysisResult = await analyzeLogWithLLM(sanitizedContent, skillName);
      
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
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('ログの保存に失敗しました');
      }

      // フォームをリセット
      setLogContent('');
      setFeeling('normal');
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
      padding: 'var(--spacing-base)',
      border: '1px solid #e0e0e0',
      borderRadius: 'var(--border-radius)',
      backgroundColor: 'var(--color-background)',
    }}>
      <h3 style={{ margin: '0 0 var(--spacing-base) 0' }}>
        {skillName}の練習ログ
      </h3>

      {/* 入力モード切り替え */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-base)',
        marginBottom: 'var(--spacing-base)',
      }}>
        <button
          onClick={() => setInputMode('voice')}
          style={{
            padding: '4px 8px',
            backgroundColor: inputMode === 'voice' ? 'var(--color-primary)' : '#f0f0f0',
            color: inputMode === 'voice' ? 'white' : 'var(--color-text)',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-small)',
          }}
        >
          🎤 音声入力
        </button>
        <button
          onClick={() => setInputMode('text')}
          style={{
            padding: '4px 8px',
            backgroundColor: inputMode === 'text' ? 'var(--color-primary)' : '#f0f0f0',
            color: inputMode === 'text' ? 'white' : 'var(--color-text)',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-small)',
          }}
        >
          ✏️ テキスト入力
        </button>
      </div>

      {/* 入力エリア */}
      {inputMode === 'voice' ? (
        <div style={{ marginBottom: 'var(--spacing-base)' }}>
          <VoiceInput
            onResult={handleVoiceResult}
            onError={handleVoiceError}
            disabled={isAnalyzing}
          />
          {logContent && (
            <div style={{
              marginTop: 'var(--spacing-base)',
              padding: 'var(--spacing-base)',
              backgroundColor: '#f9f9f9',
              borderRadius: 'var(--border-radius)',
              fontSize: 'var(--font-size-small)',
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
            minHeight: '80px',
            padding: 'var(--spacing-base)',
            fontSize: 'var(--font-size-base)',
            border: '1px solid #ccc',
            borderRadius: 'var(--border-radius)',
            resize: 'vertical',
            boxSizing: 'border-box',
            marginBottom: 'var(--spacing-base)',
          }}
        />
      )}

      {/* 感覚選択 */}
      <div style={{ marginBottom: 'var(--spacing-base)' }}>
        <label style={{
          display: 'block',
          marginBottom: '4px',
          fontSize: 'var(--font-size-small)',
          fontWeight: 'bold',
        }}>
          今日の感覚は？
        </label>
        <div style={{ display: 'flex', gap: 'var(--spacing-base)' }}>
          {[
            { value: 'smooth', label: '👍 スムーズ', color: '#4caf50' },
            { value: 'normal', label: '😐 普通', color: '#ff9800' },
            { value: 'difficult', label: '👎 苦手', color: '#f44336' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFeeling(option.value as 'smooth' | 'difficult' | 'normal')}
              disabled={isAnalyzing}
              style={{
                padding: '8px 12px',
                backgroundColor: feeling === option.value ? option.color : '#f0f0f0',
                color: feeling === option.value ? 'white' : 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                fontSize: 'var(--font-size-small)',
                opacity: isAnalyzing ? 0.5 : 1,
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
          padding: 'var(--spacing-base)',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--border-radius)',
          cursor: (!logContent.trim() || isAnalyzing) ? 'not-allowed' : 'pointer',
          opacity: (!logContent.trim() || isAnalyzing) ? 0.5 : 1,
          fontSize: 'var(--font-size-base)',
        }}
      >
        {isAnalyzing ? '分析中...' : 'ログを保存'}
      </button>
    </div>
  );
};

export default LogRecorder;
