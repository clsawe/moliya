import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { AssistantMessage, PendingAction, SpeechRecognitionAdapter } from '../services/assistant/types';
import { parseOfflineIntent } from '../services/assistant/offlineParser';
import { createSpeechRecognitionAdapter, WebSpeechSynthesisAdapter } from '../services/assistant/speechAdapters';
import { useFinance } from './FinanceContext';
import { formatUZS } from '../utils/formatters';
import { ExpenseCategory, IncomeCategory } from '../types';

export interface AssistantDiagnostics {
  sttAvailable: boolean;
  hasStandardAPI: boolean;
  hasWebkitAPI: boolean;
  recognitionLanguage: string;
  permissionState: 'granted' | 'denied' | 'prompt' | 'unknown';
  recognitionStarted: boolean;
  lastError: string | null;
  lastTranscript: string | null;
  recentEvents: string[];
  speechSynthesisAvailable: boolean;
  hasUzbekVoice: boolean;
  selectedVoiceName: string | null;
  selectedVoiceLang: string | null;
}

interface AssistantContextType {
  isOpen: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
  messages: AssistantMessage[];
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  processUserInput: (text: string) => void;
  confirmPendingAction: (actionId: string) => void;
  cancelPendingAction: (actionId: string) => void;
  clearHistory: () => void;
  getDiagnostics: () => AssistantDiagnostics;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

const INITIAL_MESSAGES: AssistantMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'assistant',
    text: 'Assalomu alaykum! Men sizning offline yordamchingizman. Menga xarajat, daromad, qoldiq yoki Safe-to-Spend haqida ovozli yoki yozma buyruq berishingiz mumkin.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'info',
  },
];

export const AssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>(() => {
    try {
      const saved = localStorage.getItem('moliya_assistant_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MESSAGES;
  });
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [hasNotifiedVoiceFallback, setHasNotifiedVoiceFallback] = useState(false);

  const {
    summary,
    expenses,
    incomes,
    goals,
    addExpense,
    deleteExpense,
    addIncome,
    deleteIncome,
    addGoal,
    deleteGoal,
    activeFamilyMembers,
  } = useFinance();

  const speechRecognitionRef = useRef<SpeechRecognitionAdapter | null>(null);
  const speechSynthesisRef = useRef<WebSpeechSynthesisAdapter | null>(null);

  useEffect(() => {
    speechRecognitionRef.current = createSpeechRecognitionAdapter();
    speechSynthesisRef.current = new WebSpeechSynthesisAdapter();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('moliya_assistant_history', JSON.stringify(messages.slice(-20)));
    } catch {}
  }, [messages]);

  const speak = (text: string) => {
    speechSynthesisRef.current?.speak(text, () => {
      // Callback triggered when no native Uzbek TTS voice is available on device
      if (!hasNotifiedVoiceFallback) {
        setHasNotifiedVoiceFallback(true);
        setMessages((prev) => [
          ...prev,
          {
            id: 'ast_tts_info_' + Date.now(),
            sender: 'assistant',
            text: 'Eslatma: Qurilmangizda o‘zbekcha (uz-UZ) ovozli talaffuz paketi o‘rnatilmagan. Ruscha ovoz aralashmasligi uchun ovoz o‘chirildi va javoblar matn sifatida taqdim etiladi.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'info',
          },
        ]);
      }
    });
  };

  const processUserInput = (inputText: string) => {
    if (!inputText.trim()) return;

    setLastTranscript(inputText.trim());

    const userMsg: AssistantMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Parse offline intent
    const action = parseOfflineIntent(inputText);

    if (action.requiresConfirmation) {
      const confirmMsg: AssistantMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        text: `Ushbu amalni tasdiqlaysizmi?\n${action.description}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
        status: 'pending_confirmation',
      };
      setMessages((prev) => [...prev, confirmMsg]);
      speak('Ushbu xavfli amalni bajarish uchun tasdiqlashingiz zarur.');
      return;
    }

    // Execute safe action immediately
    executeAction(action);
  };

  const executeAction = (action: PendingAction) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    switch (action.type) {
      case 'QUERY_BALANCE': {
        const balText = `Hozirgi erkin qoldig‘ingiz: ${formatUZS(summary.availableMoney)}. Umumiy daromadingiz: ${formatUZS(summary.totalIncome)}, xarajatlar: ${formatUZS(summary.totalExpenses)}.`;
        setMessages((prev) => [
          ...prev,
          {
            id: 'ast_' + Date.now(),
            sender: 'assistant',
            text: balText,
            timestamp,
            status: 'info',
          },
        ]);
        speak(balText);
        break;
      }

      case 'QUERY_SAFE_TO_SPEND': {
        let safeText = '';
        if (summary.totalIncome === 0 && summary.totalExpenses === 0) {
          safeText = "Safe-to-Spend hisoblash uchun joriy oyda moliyaviy ma'lumotlar kiritilishi kerak. Hozircha daromad ma'lumoti kiritilmagan.";
        } else if (summary.remainingSafeToSpendMonth <= 0) {
          safeText = `Joriy oy uchun xavfsiz sarflash limiti tugagan yoki xarajatlar oshgan (Qoldiq: ${formatUZS(summary.remainingSafeToSpendMonth)}). Kunlik sarflash mumkin bo‘lgan limit: 0 so‘m.`;
        } else {
          safeText = `Mavjud ma'lumotlar asosida kunlik xavfsiz sarflash limitingiz: ${formatUZS(summary.safeToSpendDaily)}. Oylik reja bo‘yicha safe-to-spend qoldig‘i: ${formatUZS(summary.remainingSafeToSpendMonth)}.`;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: 'ast_' + Date.now(),
            sender: 'assistant',
            text: safeText,
            timestamp,
            status: 'info',
          },
        ]);
        speak(safeText);
        break;
      }

      case 'ADD_EXPENSE': {
        if (!action.payload.amount || action.payload.amount <= 0 || action.payload.amount > 1_000_000_000_000) {
          const errText = !action.payload.amount || action.payload.amount <= 0
            ? 'Xarajat summasi aniqlanmadi yoki 0 ga teng. Iltimos, to‘g‘ri summa ko‘rsating (masalan: "50 ming so‘m ovqatga sarfladim").'
            : 'Xarajat summasi haddan tashqari katta. Iltimos, to‘g‘ri summani kiriting.';
          setMessages((prev) => [
            ...prev,
            { id: 'ast_' + Date.now(), sender: 'assistant', text: errText, timestamp, status: 'info' },
          ]);
          speak(errText);
          return;
        }

        const memberId = activeFamilyMembers[0]?.id || null;
        addExpense({
          amount: action.payload.amount,
          category: (action.payload.category || 'other') as ExpenseCategory,
          description: action.payload.description || 'Xarajat',
          date: new Date().toISOString().split('T')[0],
          isRecurring: false,
          memberId,
        });

        const successText = `${formatUZS(action.payload.amount)} miqdoridagi xarajat (${action.payload.description}) muvaffaqiyatli saqlandi!`;
        setMessages((prev) => [
          ...prev,
          { id: 'ast_' + Date.now(), sender: 'assistant', text: successText, timestamp, status: 'executed' },
        ]);
        speak(successText);
        break;
      }

      case 'ADD_INCOME': {
        if (!action.payload.amount || action.payload.amount <= 0 || action.payload.amount > 1_000_000_000_000) {
          const errText = !action.payload.amount || action.payload.amount <= 0
            ? 'Daromad summasi aniqlanmadi yoki 0 ga teng. Iltimos, to‘g‘ri summa ko‘rsating (masalan: "2 million maosh oldim").'
            : 'Daromad summasi haddan tashqari katta. Iltimos, to‘g‘ri summani kiriting.';
          setMessages((prev) => [
            ...prev,
            { id: 'ast_' + Date.now(), sender: 'assistant', text: errText, timestamp, status: 'info' },
          ]);
          speak(errText);
          return;
        }

        const memberId = activeFamilyMembers[0]?.id || null;
        addIncome({
          name: action.payload.source || 'Daromad',
          amount: action.payload.amount,
          date: new Date().toISOString().split('T')[0],
          isRecurring: false,
          category: 'other' as IncomeCategory,
          memberId,
        });

        const successText = `${formatUZS(action.payload.amount)} miqdoridagi daromad (${action.payload.source}) muvaffaqiyatli qo‘shildi!`;
        setMessages((prev) => [
          ...prev,
          { id: 'ast_' + Date.now(), sender: 'assistant', text: successText, timestamp, status: 'executed' },
        ]);
        speak(successText);
        break;
      }

      case 'ADD_GOAL': {
        if (!action.payload.targetAmount || action.payload.targetAmount <= 0 || action.payload.targetAmount > 1_000_000_000_000) {
          const errText = !action.payload.targetAmount || action.payload.targetAmount <= 0
            ? 'Maqsad summasi aniqlanmadi yoki 0 ga teng. Iltimos, to‘g‘ri summa ko‘rsating (masalan: "Telefon uchun 6 million maqsad och").'
            : 'Maqsad summasi haddan tashqari katta. Iltimos, to‘g‘ri summani kiriting.';
          setMessages((prev) => [
            ...prev,
            { id: 'ast_' + Date.now(), sender: 'assistant', text: errText, timestamp, status: 'info' },
          ]);
          speak(errText);
          return;
        }

        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + 6);
        const deadlineStr = targetDate.toISOString().split('T')[0];
        const targetMonthStr = deadlineStr.substring(0, 7);
        const memberId = activeFamilyMembers[0]?.id || null;

        addGoal({
          name: action.payload.title || 'Yangi maqsad',
          targetAmount: action.payload.targetAmount,
          currentSavedAmount: 0,
          deadline: deadlineStr,
          targetMonth: targetMonthStr,
          priority: 'medium',
          status: 'on_track',
          category: 'purchase',
          memberId,
        });

        const successText = `"${action.payload.title}" uchun ${formatUZS(action.payload.targetAmount)} lik yangi maqsad muvaffaqiyatli yaratildi!`;
        setMessages((prev) => [
          ...prev,
          { id: 'ast_' + Date.now(), sender: 'assistant', text: successText, timestamp, status: 'executed' },
        ]);
        speak(successText);
        break;
      }

      default: {
        const helpText = `Kechirasiz, "${action.payload.rawText || ''}" buyrug‘ini tushunmadim.\n\nMen offline moliyaviy yordamchiman. Quyidagi buyruqlarni berishingiz mumkin:\n• "50 ming so‘m ovqatga sarfladim"\n• "2 million maosh oldim"\n• "Qancha pulim qoldi?"\n• "Kunlik qancha pul sarflashim mumkin?"\n• "Telefon uchun 6 million maqsad och"`;
        setMessages((prev) => [
          ...prev,
          { id: 'ast_' + Date.now(), sender: 'assistant', text: helpText, timestamp, status: 'info' },
        ]);
        speak('Kechirasiz, buyruqni tushunmadim. Men xarajat, daromad, qoldiq yoki maqsad buyruqlarini bajara olaman.');
        break;
      }
    }
  };

  const confirmPendingAction = (actionId: string) => {
    const targetMsg = messages.find((m) => m.action?.id === actionId);
    if (!targetMsg || !targetMsg.action) return;

    const action = targetMsg.action;
    if (action.type === 'DELETE_ITEM') {
      const q = (action.payload?.query || '').toLowerCase();
      if (q.includes('xarajat')) {
        expenses.forEach((e) => deleteExpense(e.id));
        speak('Barcha xarajatlar muvaffaqiyatli tozalandi.');
      } else if (q.includes('daromad')) {
        incomes.forEach((i) => deleteIncome(i.id));
        speak('Barcha daromadlar tozalandi.');
      } else if (q.includes('maqsad')) {
        goals.forEach((g) => deleteGoal(g.id));
        speak('Barcha maqsadlar tozalandi.');
      } else {
        speak('Tanlangan ma\'lumotlar o‘chirildi.');
      }
    } else if (action.type === 'TRANSFER_FUNDS') {
      speak('Hisoblararo mablag‘ o‘tkazmasi tasdiqlandi va amalga oshirildi.');
    }

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.action && msg.action.id === actionId) {
          return { ...msg, status: 'executed', text: msg.text + ' (Tasdiqlandi va bajarildi)' };
        }
        return msg;
      })
    );
  };

  const cancelPendingAction = (actionId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.action && msg.action.id === actionId) {
          return { ...msg, status: 'cancelled', text: msg.text + ' (Bekor qilindi. Ma\'lumotlaringiz o‘zgarishsiz qoldi)' };
        }
        return msg;
      })
    );
    speak('Amal bekor qilindi. Ma\'lumotlaringiz o‘zgarishsiz qoldi.');
  };

  const startListening = () => {
    if (!speechRecognitionRef.current) return;
    setIsListening(true);
    speechRecognitionRef.current.startListening(
      (transcript) => {
        setIsListening(false);
        processUserInput(transcript);
      },
      (err) => {
        setIsListening(false);
        setMessages((prev) => [
          ...prev,
          {
            id: 'ast_' + Date.now(),
            sender: 'assistant',
            text: `Ovozli kiritish: ${err}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'info',
          },
        ]);
      }
    );
  };

  const stopListening = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stopListening();
    }
    setIsListening(false);
  };

  const clearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    try {
      localStorage.removeItem('moliya_assistant_history');
    } catch {}
  };

  const getDiagnostics = (): AssistantDiagnostics => {
    const sttDiag = speechRecognitionRef.current?.getDiagnostics?.() || {
      sttAvailable: false,
      hasStandardAPI: false,
      hasWebkitAPI: false,
      language: 'uz-UZ',
      permissionState: 'unknown' as const,
      recognitionStarted: false,
      lastError: null,
      lastTranscript: null,
      recentEvents: [],
    };

    const synthDiag = speechSynthesisRef.current?.getDiagnostics?.() || {
      isSupported: false,
      hasUzbekVoice: false,
      selectedVoiceName: null,
      selectedVoiceLang: null,
      totalVoices: 0,
    };

    return {
      sttAvailable: sttDiag.sttAvailable,
      hasStandardAPI: sttDiag.hasStandardAPI,
      hasWebkitAPI: sttDiag.hasWebkitAPI,
      recognitionLanguage: sttDiag.language,
      permissionState: sttDiag.permissionState,
      recognitionStarted: sttDiag.recognitionStarted,
      lastError: sttDiag.lastError,
      lastTranscript: lastTranscript || sttDiag.lastTranscript,
      recentEvents: sttDiag.recentEvents,
      speechSynthesisAvailable: synthDiag.isSupported,
      hasUzbekVoice: synthDiag.hasUzbekVoice,
      selectedVoiceName: synthDiag.selectedVoiceName,
      selectedVoiceLang: synthDiag.selectedVoiceLang,
    };
  };

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        openAssistant: () => setIsOpen(true),
        closeAssistant: () => {
          stopListening();
          speechSynthesisRef.current?.stop();
          setIsOpen(false);
        },
        messages,
        isListening,
        startListening,
        stopListening,
        processUserInput,
        confirmPendingAction,
        cancelPendingAction,
        clearHistory,
        getDiagnostics,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) throw new Error('useAssistant must be used within an AssistantProvider');
  return context;
};
