import React, { useState, useRef, useEffect } from 'react';
import { VoiceRecognition } from '../voiceRecognition';

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult, onError, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const voiceRecognition = useRef<VoiceRecognition | null>(null);

  useEffect(() => {
    voiceRecognition.current = new VoiceRecognition();
    setIsSupported(voiceRecognition.current.isVoiceRecognitionSupported());
  }, []);

  const startRecording = () => {
    if (!voiceRecognition.current || !isSupported) {
      onError('音声認識がサポートされていません');
      return;
    }

    voiceRecognition.current.startRecording(
      (transcript) => {
        onResult(transcript);
        setIsRecording(false);
      },
      (error) => {
        onError(error);
        setIsRecording(false);
      },
      () => setIsRecording(true),
      () => setIsRecording(false)
    );
  };

  const stopRecording = () => {
    if (voiceRecognition.current) {
      voiceRecognition.current.stopRecording();
      setIsRecording(false);
    }
  };

  if (!isSupported) {
    return (
      <div style={{
        padding: 'var(--spacing-base)',
        backgroundColor: '#f0f0f0',
        borderRadius: 'var(--border-radius)',
        textAlign: 'center',
      }}>
        音声認識はサポートされていません
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isRecording ? '#ff4444' : 'var(--color-primary)',
          color: 'white',
          fontSize: '24px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.3s ease',
          transform: isRecording ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        {isRecording ? '🛑' : '🎤'}
      </button>
      <div style={{
        marginTop: 'var(--spacing-base)',
        fontSize: 'var(--font-size-small)',
        color: isRecording ? '#ff4444' : 'var(--color-text)',
      }}>
        {isRecording ? '録音中...' : 'タップして話す'}
      </div>
    </div>
  );
};

export default VoiceInput;
