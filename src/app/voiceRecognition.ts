// TypeScript用のグローバル型定義
declare global {
  interface Window {
    SpeechRecognition: unknown;
    webkitSpeechRecognition: unknown;
  }
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

export class VoiceRecognition {
  private recognition: SpeechRecognitionInstance | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = this.checkSupport();
    if (this.isSupported) {
      this.initializeRecognition();
    }
  }

  private checkSupport(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  private initializeRecognition(): void {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new (SpeechRecognition as new () => SpeechRecognitionInstance)();
    
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'ja-JP';
  }

  public startRecording(
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!this.isSupported || !this.recognition) {
      onError('音声認識がサポートされていません');
      return;
    }

    this.recognition.onstart = () => {
      onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onError(`音声認識エラー: ${event.error}`);
    };

    this.recognition.onend = () => {
      onEnd?.();
    };

    this.recognition.start();
  }

  public stopRecording(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  public isVoiceRecognitionSupported(): boolean {
    return this.isSupported;
  }
}
