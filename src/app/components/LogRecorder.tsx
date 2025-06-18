import React, { useState } from 'react';
import VoiceInput from './VoiceInput';
import { analyzeLogWithLLM, sanitizeInput, AnalysisResult } from '../llmAnalysis';

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
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);

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
      const analysisResult = await analyzeLogWithLLM(sanitizedContent, skillName, userId);
      
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
          🎙️ 音声入力
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

      {/* 分析結果表示 */}
      {lastAnalysis && (
        <div style={{
          marginTop: 'var(--spacing-base)',
          padding: 'var(--spacing-base)',
          backgroundColor: '#f0f8ff',
          borderRadius: 'var(--border-radius)',
          border: '1px solid #e0e8ff',
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-small)', fontWeight: 'bold' }}>
            📊 分析結果
          </h4>
          <div style={{ fontSize: 'var(--font-size-small)', lineHeight: '1.4' }}>
            <div><strong>スキルレベル:</strong> {lastAnalysis.skillLevel}/10</div>
            <div><strong>提案:</strong> {lastAnalysis.suggestion}</div>
            {lastAnalysis.focusAreas && (
              <div><strong>重点領域:</strong> {lastAnalysis.focusAreas.join(', ')}</div>
            )}
            {lastAnalysis.emotionalState && (
              <div><strong>感情状態:</strong> {lastAnalysis.emotionalState}</div>
            )}
            {lastAnalysis.practiceQuality && (
              <div><strong>練習の質:</strong> {lastAnalysis.practiceQuality}/10</div>
            )}
            {lastAnalysis.timeSpent && (
              <div><strong>推定練習時間:</strong> {lastAnalysis.timeSpent}分</div>
            )}
            {lastAnalysis.motivation && (
              <div><strong>モチベーション:</strong> {lastAnalysis.motivation}/10</div>
            )}
            {/* --- ここから復習日推定の比較 --- */}
            {lastAnalysis.fsrsNextReview && (
              <div style={{marginTop:8}}>
                <strong>科学的推定（FSRS）:</strong> {new Date(lastAnalysis.fsrsNextReview).toLocaleDateString()}（{Math.ceil((new Date(lastAnalysis.fsrsNextReview).getTime() - Date.now())/(1000*60*60*24))}日後）
              </div>
            )}
            {lastAnalysis.nextReviewInterval && (
              <div>
                <strong>AI推定（Gemini/LLM）:</strong> {lastAnalysis.nextReviewInterval}日後（{new Date(Date.now() + lastAnalysis.nextReviewInterval*24*60*60*1000).toLocaleDateString()}）
              </div>
            )}
            {lastAnalysis.optimizedNextReview && (
              <div>
                <strong>最適化復習日:</strong> {new Date(lastAnalysis.optimizedNextReview).toLocaleDateString()}（{Math.ceil((new Date(lastAnalysis.optimizedNextReview).getTime() - Date.now())/(1000*60*60*24))}日後）
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogRecorder;
