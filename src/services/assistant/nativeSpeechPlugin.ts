import { registerPlugin, PluginListenerHandle } from '@capacitor/core';

export interface NativeSpeechResult {
  transcript: string;
  isFinal: boolean;
}

export interface NativeSpeechError {
  error: string;
  code?: number;
}

export interface NativeSpeechPluginInterface {
  isAvailable(): Promise<{ available: boolean }>;
  startListening(options?: { language?: string }): Promise<void>;
  stopListening(): Promise<void>;
  addListener(
    eventName: 'onSpeechResult',
    listenerFunc: (data: NativeSpeechResult) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'onSpeechError',
    listenerFunc: (data: NativeSpeechError) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'onSpeechStateChange',
    listenerFunc: (data: { state: string }) => void
  ): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

export const NativeSpeechRecognizer = registerPlugin<NativeSpeechPluginInterface>('NativeSpeechRecognizer');
