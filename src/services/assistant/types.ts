export type AssistantActionType =
  | 'QUERY_BALANCE'
  | 'QUERY_SAFE_TO_SPEND'
  | 'ADD_EXPENSE'
  | 'ADD_RECURRING_EXPENSE'
  | 'ADD_INCOME'
  | 'ADD_GOAL'
  | 'NAVIGATE'
  | 'DELETE_ITEM'
  | 'TRANSFER_FUNDS'
  | 'UNKNOWN';

export type AssistantLanguage = 'uz' | 'ru' | 'en';

export interface PendingAction {
  id: string;
  type: AssistantActionType;
  description: string;
  payload: any;
  requiresConfirmation: boolean;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: PendingAction;
  status?: 'pending_confirmation' | 'executed' | 'cancelled' | 'info';
}

export interface STTDiagnostics {
  sttAvailable: boolean;
  hasStandardAPI: boolean;
  hasWebkitAPI: boolean;
  language: string;
  permissionState: 'granted' | 'denied' | 'prompt' | 'unknown';
  recognitionStarted: boolean;
  lastError: string | null;
  lastTranscript: string | null;
  recentEvents: string[];
}

export interface SpeechRecognitionAdapter {
  isSupported: () => boolean;
  startListening: (onResult: (transcript: string) => void, onError: (err: string) => void) => void;
  stopListening: () => void;
  getLanguage?: () => string;
  setLanguage?: (lang: 'uz-UZ' | 'ru-RU' | 'en-US') => void;
  getDiagnostics?: () => STTDiagnostics;
  requestMicrophonePermission?: () => Promise<boolean>;
}

export interface SpeechSynthesisAdapter {
  isSupported: () => boolean;
  speak: (text: string, onNoVoice?: () => void) => void;
  stop: () => void;
  setLanguage?: (lang: 'uz-UZ' | 'ru-RU' | 'en-US') => void;
  getDiagnostics?: () => {
    isSupported: boolean;
    hasVoice: boolean;
    hasUzbekVoice: boolean;
    hasVoiceForLanguage?: boolean;
    currentLanguage?: string;
    selectedVoiceName: string | null;
    selectedVoiceLang: string | null;
    totalVoices: number;
  };
}
