import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { SpeechRecognitionAdapter, SpeechSynthesisAdapter, STTDiagnostics } from './types';
import { NativeSpeechRecognizer } from './nativeSpeechPlugin';

// Android Native SpeechRecognizer Adapter (Uses Capacitor Native Bridge)
export class NativeSpeechRecognitionAdapter implements SpeechRecognitionAdapter {
  private isListening = false;
  private currentLanguage = 'uz-UZ';
  private permissionState: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';
  private lastError: string | null = null;
  private lastTranscript: string | null = null;
  private isAvailable = true;
  private eventsLog: string[] = [];
  private hasHandledFinalResult = false;
  private listenersAttached = false;
  private onResultCallback: ((transcript: string) => void) | null = null;
  private onErrorCallback: ((err: string) => void) | null = null;

  constructor() {
    this.checkAvailability();
  }

  private logEvent(name: string, detail?: any): void {
    const time = new Date().toLocaleTimeString();
    const entry = detail !== undefined ? `[${time}] ${name}: ${JSON.stringify(detail)}` : `[${time}] ${name}`;
    console.log(`[Native STT] ${entry}`);
    this.eventsLog.push(entry);
    if (this.eventsLog.length > 25) {
      this.eventsLog.shift();
    }
  }

  private async checkAvailability(): Promise<void> {
    try {
      const res = await NativeSpeechRecognizer.isAvailable();
      this.isAvailable = !!res.available;
      this.logEvent('NativeSpeechRecognizer.isAvailable', res);
    } catch (err: any) {
      this.isAvailable = false;
      this.logEvent('NativeSpeechRecognizer.isAvailable check error', err?.message);
    }
  }

  isSupported(): boolean {
    return this.isAvailable;
  }

  getLanguage(): string {
    return this.currentLanguage;
  }

  getDiagnostics(): STTDiagnostics {
    return {
      sttAvailable: this.isAvailable,
      hasStandardAPI: false,
      hasWebkitAPI: false,
      language: this.currentLanguage,
      permissionState: this.permissionState,
      recognitionStarted: this.isListening,
      lastError: this.lastError,
      lastTranscript: this.lastTranscript,
      recentEvents: [...this.eventsLog],
    };
  }

  async startListening(
    onResult: (transcript: string) => void,
    onError: (err: string) => void
  ): Promise<void> {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.hasHandledFinalResult = false;
    this.lastError = null;

    this.logEvent('startListening initiated (Android Native SpeechRecognizer)');

    if (!this.listenersAttached) {
      await this.attachListeners();
    }

    try {
      this.isListening = true;
      this.permissionState = 'granted';
      await NativeSpeechRecognizer.startListening({ language: this.currentLanguage });
      this.logEvent('NativeSpeechRecognizer.startListening() called successfully');
    } catch (err: any) {
      this.isListening = false;
      const msg = err?.message || String(err);
      this.lastError = msg;
      this.logEvent('NativeSpeechRecognizer.startListening() failed', msg);
      if (msg.includes('Qurilmangizda Android Speech Recognition servisi mavjud emas')) {
        onError('Qurilmangizda Android Speech Recognition servisi mavjud emas. Google Speech Services o‘rnatilganligini tekshiring.');
      } else if (msg.includes('ruxsat')) {
        this.permissionState = 'denied';
        onError('Mikrofon ruxsati berilmadi. Ilova sozlamalaridan mikrofonni yoqing.');
      } else {
        onError(msg);
      }
    }
  }

  private async attachListeners(): Promise<void> {
    try {
      await NativeSpeechRecognizer.removeAllListeners();

      await NativeSpeechRecognizer.addListener('onSpeechResult', (data) => {
        this.logEvent('onSpeechResult received', data);
        if (data && data.transcript) {
          this.lastTranscript = data.transcript;
          if (data.isFinal && !this.hasHandledFinalResult) {
            this.hasHandledFinalResult = true;
            this.isListening = false;
            this.onResultCallback?.(data.transcript);
          }
        }
      });

      await NativeSpeechRecognizer.addListener('onSpeechError', (data) => {
        this.isListening = false;
        this.lastError = data.error;
        this.logEvent('onSpeechError received', data);
        this.onErrorCallback?.(data.error);
      });

      await NativeSpeechRecognizer.addListener('onSpeechStateChange', (data) => {
        this.logEvent('onSpeechStateChange', data.state);
        if (data.state === 'ready' || data.state === 'listening') {
          this.isListening = true;
        }
      });

      this.listenersAttached = true;
      this.logEvent('Native speech listeners successfully attached');
    } catch (err: any) {
      this.logEvent('Failed to attach native listeners', err?.message);
    }
  }

  async stopListening(): Promise<void> {
    this.isListening = false;
    try {
      this.logEvent('Calling NativeSpeechRecognizer.stopListening()');
      await NativeSpeechRecognizer.stopListening();
    } catch (err: any) {
      this.logEvent('NativeSpeechRecognizer.stopListening() error', err?.message);
    }
  }
}

// Browser-based Speech Recognition Adapter (Offline/Native Web Speech Fallback)
export class WebSpeechRecognitionAdapter implements SpeechRecognitionAdapter {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage = 'uz-UZ';
  private hasStandardAPI = false;
  private hasWebkitAPI = false;
  private recognitionStarted = false;
  private permissionState: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';
  private lastError: string | null = null;
  private lastTranscript: string | null = null;
  private eventsLog: string[] = [];

  constructor() {
    this.initRecognition();
    this.checkInitialPermission();
  }

  private logEvent(name: string, detail?: any): void {
    const time = new Date().toLocaleTimeString();
    const entry = detail !== undefined ? `[${time}] ${name}: ${JSON.stringify(detail)}` : `[${time}] ${name}`;
    console.log(`[Web STT Diagnostic] ${entry}`);
    this.eventsLog.push(entry);
    if (this.eventsLog.length > 25) {
      this.eventsLog.shift();
    }
  }

  private async checkInitialPermission(): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      try {
        const res = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        this.permissionState = res.state as any;
        this.logEvent('navigator.permissions.query microphone', this.permissionState);
        res.onchange = () => {
          this.permissionState = res.state as any;
          this.logEvent('permission changed', this.permissionState);
        };
      } catch {
        this.permissionState = 'unknown';
      }
    }
  }

  private initRecognition(): void {
    if (typeof window === 'undefined') return;

    this.hasStandardAPI = typeof (window as any).SpeechRecognition !== 'undefined';
    this.hasWebkitAPI = typeof (window as any).webkitSpeechRecognition !== 'undefined';

    this.logEvent('API Availability Check', {
      SpeechRecognition: this.hasStandardAPI,
      webkitSpeechRecognition: this.hasWebkitAPI,
      userAgent: navigator.userAgent,
    });

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = this.currentLanguage;
        this.setupRecognitionListeners();
      } catch (err: any) {
        this.logEvent('SpeechRecognition instantiation error', err?.message);
      }
    } else {
      this.logEvent('SpeechRecognition NOT available on window/WebView');
    }
  }

  private setupRecognitionListeners(): void {
    if (!this.recognition) return;

    this.recognition.onaudiostart = () => {
      this.logEvent('onaudiostart (Microphone audio capturing started)');
    };

    this.recognition.onsoundstart = () => {
      this.logEvent('onsoundstart (Sound detected in stream)');
    };

    this.recognition.onspeechstart = () => {
      this.logEvent('onspeechstart (Speech recognized in audio stream)');
    };

    this.recognition.onspeechend = () => {
      this.logEvent('onspeechend (Speech stream stopped)');
    };

    this.recognition.onsoundend = () => {
      this.logEvent('onsoundend (Sound stopped)');
    };

    this.recognition.onaudioend = () => {
      this.logEvent('onaudioend (Microphone audio capturing ended)');
    };
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  getLanguage(): string {
    return this.currentLanguage;
  }

  getDiagnostics(): STTDiagnostics {
    return {
      sttAvailable: this.isSupported(),
      hasStandardAPI: this.hasStandardAPI,
      hasWebkitAPI: this.hasWebkitAPI,
      language: this.currentLanguage,
      permissionState: this.permissionState,
      recognitionStarted: this.recognitionStarted,
      lastError: this.lastError,
      lastTranscript: this.lastTranscript,
      recentEvents: [...this.eventsLog],
    };
  }

  async requestMicrophonePermission(): Promise<boolean> {
    this.logEvent('Requesting runtime microphone permission via getUserMedia');
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        this.permissionState = 'granted';
        this.logEvent('Runtime microphone permission GRANTED');
        return true;
      } catch (err: any) {
        this.permissionState = 'denied';
        this.logEvent('Runtime microphone permission DENIED or FAILED', err?.name || err?.message);
        return false;
      }
    }
    return true;
  }

  async startListening(
    onResult: (transcript: string) => void,
    onError: (err: string) => void
  ): Promise<void> {
    this.logEvent('startListening triggered (Microphone button clicked)');
    this.lastError = null;

    if (!this.recognition) {
      const errMsg =
        'Qurilmangizda yoki WebView ichida ovozli kiritish (Speech Recognition API) mavjud emas. Matn orqali buyruq berishingiz mumkin.';
      this.lastError = 'Web Speech API is unavailable in this environment (Android WebView does not expose SpeechRecognition)';
      this.logEvent('SpeechRecognition check failed: API unavailable');
      onError(errMsg);
      return;
    }

    if (this.isListening) {
      this.logEvent('Already listening, stopping first');
      this.stopListening();
    }

    // Try requesting runtime permission if not granted
    if (this.permissionState !== 'granted') {
      await this.requestMicrophonePermission();
    }

    this.recognition.lang = this.currentLanguage;
    this.logEvent('Setting recognition.lang', this.currentLanguage);

    let hasHandledResult = false;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.recognitionStarted = true;
      hasHandledResult = false;
      this.logEvent('onstart (SpeechRecognition started listening)');
    };

    this.recognition.onresult = (event: any) => {
      this.isListening = false;
      this.logEvent('onresult event received', {
        resultsLength: event.results?.length,
        resultIndex: event.resultIndex,
      });

      let finalTranscript = '';
      if (event.results && event.results.length > 0) {
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item && item[0] && item[0].transcript) {
            finalTranscript += item[0].transcript;
          }
        }
      }

      const cleanTranscript = finalTranscript.trim();
      this.lastTranscript = cleanTranscript;
      this.logEvent('Processed transcript', cleanTranscript);

      if (cleanTranscript && !hasHandledResult) {
        hasHandledResult = true;
        onResult(cleanTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      this.recognitionStarted = false;
      const errorType = event.error || 'unknown_error';
      this.lastError = errorType;
      this.logEvent('onerror event triggered', {
        error: errorType,
        message: event.message,
      });

      if (errorType === 'not-allowed') {
        this.permissionState = 'denied';
        onError('Mikrofondan foydalanish taqiqlandi (not-allowed). Android ilova sozlamalaridan mikrofon ruxsatini yoqing.');
      } else if (errorType === 'service-not-allowed') {
        onError('Qurilma nutq servisi (service-not-allowed) ruxsat bermadi. Google Speech Services yoqilganligini tekshiring.');
      } else if (errorType === 'language-not-supported') {
        onError('O‘zbekcha ovozli tanish (uz-UZ) qurilma nutq servisi tomonidan qo‘llab-quvvatlanmaydi. Matn orqali buyruq bering.');
      } else if (errorType === 'no-speech') {
        onError('Ovoz eshitilmadi (no-speech). Qaytadan mikrofonga yaqinroq gapirib ko‘ring.');
      } else if (errorType === 'audio-capture') {
        onError('Mikrofon topilmadi yoki audio qabul qilinmadi (audio-capture).');
      } else if (errorType === 'network') {
        onError('Ovozni aniqlashda tarmoq xatoligi (network). Internet mavjudligini yoki offline nutq paketini tekshiring.');
      } else if (errorType === 'aborted') {
        onError('Ovoz yozish to‘xtatildi (aborted).');
      } else {
        onError(`Ovozni aniqlashda xatolik: ${errorType}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.recognitionStarted = false;
      this.logEvent('onend (SpeechRecognition session ended)');
    };

    try {
      this.logEvent('Calling recognition.start()');
      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      this.recognitionStarted = false;
      this.lastError = e?.message || 'start() exception';
      this.logEvent('Exception when calling recognition.start()', e?.message);
      onError(e?.message || 'Ovoz yozishni boshlab bo‘lmadi.');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.logEvent('Calling recognition.stop()');
        this.recognition.stop();
      } catch (err: any) {
        this.logEvent('Error in recognition.stop()', err?.message);
      }
    }
    this.isListening = false;
    this.recognitionStarted = false;
  }
}

// Unified Factory function for SpeechRecognitionAdapter
export function createSpeechRecognitionAdapter(): SpeechRecognitionAdapter {
  if (Capacitor.isNativePlatform()) {
    console.log('[STT Factory] Native platform detected. Using NativeSpeechRecognitionAdapter.');
    return new NativeSpeechRecognitionAdapter();
  }
  console.log('[STT Factory] Browser/Web environment detected. Using WebSpeechRecognitionAdapter.');
  return new WebSpeechRecognitionAdapter();
}

// Browser-based Speech Synthesis Adapter (Offline/Native TTS)
export class WebSpeechSynthesisAdapter implements SpeechSynthesisAdapter {
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private hasUzbekVoice = false;

  constructor() {
    this.initVoices();
  }

  private initVoices(): void {
    if (!this.isSupported()) return;

    const loadVoices = () => {
      try {
        this.voices = window.speechSynthesis.getVoices() || [];
        this.findUzbekVoice();
      } catch {
        this.voices = [];
      }
    };

    loadVoices();
    if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  private findUzbekVoice(): void {
    if (!this.voices || this.voices.length === 0) {
      this.selectedVoice = null;
      this.hasUzbekVoice = false;
      return;
    }

    // Priority 1: exact match for uz-UZ or uz_UZ
    let found = this.voices.find(
      (v) => v.lang.toLowerCase() === 'uz-uz' || v.lang.toLowerCase() === 'uz_uz'
    );

    // Priority 2: starts with 'uz'
    if (!found) {
      found = this.voices.find((v) => v.lang.toLowerCase().startsWith('uz'));
    }

    // Priority 3: name contains uzbek or oʻzbek
    if (!found) {
      found = this.voices.find(
        (v) =>
          v.name.toLowerCase().includes('uzbek') ||
          v.name.toLowerCase().includes("o'zbek") ||
          v.name.toLowerCase().includes('oʻzbek')
      );
    }

    if (found) {
      this.selectedVoice = found;
      this.hasUzbekVoice = true;
    } else {
      // STRICT: If no Uzbek voice exists, DO NOT fallback to Russian or English voice!
      this.selectedVoice = null;
      this.hasUzbekVoice = false;
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  getDiagnostics(): {
    isSupported: boolean;
    hasUzbekVoice: boolean;
    selectedVoiceName: string | null;
    selectedVoiceLang: string | null;
    totalVoices: number;
  } {
    if (this.voices.length === 0 && this.isSupported()) {
      try {
        this.voices = window.speechSynthesis.getVoices() || [];
        this.findUzbekVoice();
      } catch {}
    }
    return {
      isSupported: this.isSupported(),
      hasUzbekVoice: this.hasUzbekVoice,
      selectedVoiceName: this.selectedVoice ? this.selectedVoice.name : null,
      selectedVoiceLang: this.selectedVoice ? this.selectedVoice.lang : null,
      totalVoices: this.voices.length,
    };
  }

  speak(text: string, onNoVoice?: () => void): void {
    if (!this.isSupported()) return;

    this.stop();

    if (this.voices.length === 0) {
      this.initVoices();
    }

    // Strict rule: If Uzbek voice is not available, do NOT read with Russian voice!
    if (!this.hasUzbekVoice || !this.selectedVoice) {
      if (onNoVoice) {
        onNoVoice();
      }
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.selectedVoice;
      utterance.lang = this.selectedVoice.lang;
      // Natural cadence settings
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error handled gracefully
    }
  }

  stop(): void {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }
}
