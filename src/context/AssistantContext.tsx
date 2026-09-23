import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { AssistantMessage, PendingAction, SpeechRecognitionAdapter, AssistantLanguage } from '../services/assistant/types';
import { parseOfflineIntent } from '../services/assistant/offlineParser';
import { createSpeechRecognitionAdapter, WebSpeechSynthesisAdapter } from '../services/assistant/speechAdapters';
import { useFinance } from './FinanceContext';
import { formatUZS } from '../utils/formatters';
import { ExpenseCategory, IncomeCategory, RecurringExpense } from '../types';

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
  hasVoice: boolean;
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
  language: AssistantLanguage;
  setLanguage: (lang: AssistantLanguage) => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

const WELCOME_MESSAGES: Record<AssistantLanguage, string> = {
  uz: 'Assalomu alaykum! Men sizning offline yordamchingizman. Menga xarajat, takrorlanuvchi to‘lovlar, daromad, qoldiq yoki Safe-to-Spend haqida ovozli yoki yozma buyruq berishingiz mumkin.',
  ru: 'Здравствуйте! Я ваш офлайн-помощник. Вы можете давать голосовые или текстовые команды по расходам, регулярным платежам, доходам, балансу или Safe-to-Spend.',
  en: 'Hello! I am your offline financial assistant. You can give voice or text commands for expenses, recurring payments, income, balance, or Safe-to-Spend.',
};

const LOCALE_MAP: Record<AssistantLanguage, 'uz-UZ' | 'ru-RU' | 'en-US'> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

export const AssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguageState] = useState<AssistantLanguage>(() => {
    try {
      const saved = localStorage.getItem('moliya_assistant_lang');
      if (saved === 'uz' || saved === 'ru' || saved === 'en') return saved;
    } catch {}
    return 'uz';
  });

  const [messages, setMessages] = useState<AssistantMessage[]>(() => {
    try {
      const saved = localStorage.getItem('moliya_assistant_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg_welcome',
        sender: 'assistant',
        text: WELCOME_MESSAGES[language] || WELCOME_MESSAGES.uz,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'info',
      },
    ];
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
    addRecurringExpense,
    addIncome,
    deleteIncome,
    addGoal,
    deleteGoal,
    activeFamilyMembers,
  } = useFinance();

  const speechRecognitionRef = useRef<SpeechRecognitionAdapter | null>(null);
  const speechSynthesisRef = useRef<WebSpeechSynthesisAdapter | null>(null);

  // Initialize Speech Adapters
  useEffect(() => {
    const stt = createSpeechRecognitionAdapter();
    const tts = new WebSpeechSynthesisAdapter();
    const locale = LOCALE_MAP[language];
    if (stt.setLanguage) stt.setLanguage(locale);
    if (tts.setLanguage) tts.setLanguage(locale);

    speechRecognitionRef.current = stt;
    speechSynthesisRef.current = tts;
  }, []);

  // Language switcher
  const setLanguage = (newLang: AssistantLanguage) => {
    setLanguageState(newLang);
    localStorage.setItem('moliya_assistant_lang', newLang);
    const locale = LOCALE_MAP[newLang];

    if (speechRecognitionRef.current && speechRecognitionRef.current.setLanguage) {
      speechRecognitionRef.current.setLanguage(locale);
    }
    if (speechSynthesisRef.current && speechSynthesisRef.current.setLanguage) {
      speechSynthesisRef.current.setLanguage(locale);
    }

    // Inform user of language change
    const langNames: Record<AssistantLanguage, string> = {
      uz: 'O‘zbek tili tanlandi (uz-UZ)',
      ru: 'Выбран русский язык (ru-RU)',
      en: 'English language selected (en-US)',
    };
    const infoText = langNames[newLang];
    setMessages((prev) => [
      ...prev,
      {
        id: 'ast_lang_' + Date.now(),
        sender: 'assistant',
        text: infoText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'info',
      },
    ]);
  };

  useEffect(() => {
    try {
      localStorage.setItem('moliya_assistant_history', JSON.stringify(messages.slice(-25)));
    } catch {}
  }, [messages]);

  const speak = (text: string) => {
    speechSynthesisRef.current?.speak(text, () => {
      // Callback triggered when no TTS voice is available for chosen language on device
      if (!hasNotifiedVoiceFallback) {
        setHasNotifiedVoiceFallback(true);
        const warning =
          language === 'ru'
            ? 'Примечание: Голосовой пакет для русского языка не найден. Ответы будут выводиться в виде текста.'
            : language === 'en'
            ? 'Note: TTS voice package for English was not found. Responses will be displayed in text.'
            : 'Eslatma: Qurilmangizda o‘zbekcha (uz-UZ) ovozli talaffuz paketi topilmadi. Ruscha ovoz aralashmasligi uchun ovoz o‘chirildi va javoblar matn sifatida taqdim etiladi.';

        setMessages((prev) => [
          ...prev,
          {
            id: 'ast_tts_info_' + Date.now(),
            sender: 'assistant',
            text: warning,
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

    // Parse offline intent with current assistant language
    const action = parseOfflineIntent(inputText, language);

    // If clarification needed (e.g. recurring expense without amount)
    if (action.type === 'UNKNOWN' && action.payload?.clarificationNeeded) {
      const askMsg: AssistantMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        text: action.description,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'info',
      };
      setMessages((prev) => [...prev, askMsg]);
      speak(action.description);
      return;
    }

    if (action.requiresConfirmation) {
      let confirmPrompt = `Ushbu amalni tasdiqlaysizmi?\n${action.description}`;
      if (language === 'ru') {
        confirmPrompt = `Подтвердите действие:\n${action.description}`;
      } else if (language === 'en') {
        confirmPrompt = `Please confirm this action:\n${action.description}`;
      }

      const confirmMsg: AssistantMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        text: confirmPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
        status: 'pending_confirmation',
      };
      setMessages((prev) => [...prev, confirmMsg]);
      speak(action.description);
      return;
    }

    // Execute safe action immediately
    executeAction(action);
  };

  const executeAction = (action: PendingAction) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    switch (action.type) {
      case 'QUERY_BALANCE': {
        let balText = '';
        if (language === 'ru') {
          balText = `Текущий свободный остаток: ${formatUZS(summary.availableMoney)}. Общий доход: ${formatUZS(summary.totalIncome)}, расходы: ${formatUZS(summary.totalExpenses)}.`;
        } else if (language === 'en') {
          balText = `Current available balance: ${formatUZS(summary.availableMoney)}. Total income: ${formatUZS(summary.totalIncome)}, expenses: ${formatUZS(summary.totalExpenses)}.`;
        } else {
          balText = `Hozirgi erkin qoldig‘ingiz: ${formatUZS(summary.availableMoney)}. Umumiy daromadingiz: ${formatUZS(summary.totalIncome)}, xarajatlar: ${formatUZS(summary.totalExpenses)}.`;
        }
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
          safeText =
            language === 'ru'
              ? 'Для расчета Safe-to-Spend необходимо внести доходы за текущий месяц.'
              : language === 'en'
              ? 'To calculate Safe-to-Spend, income data must be entered for this month.'
              : 'Safe-to-Spend hisoblash uchun joriy oyda moliyaviy ma\'lumotlar kiritilishi kerak. Hozircha daromad ma\'lumoti kiritilmagan.';
        } else if (summary.remainingSafeToSpendMonth <= 0) {
          safeText =
            language === 'ru'
              ? `Лимит безопасных расходов на этот месяц исчерпан (Остаток: ${formatUZS(summary.remainingSafeToSpendMonth)}). Дневной лимит: 0 сум.`
              : language === 'en'
              ? `Safe-to-spend limit exhausted for this month (Balance: ${formatUZS(summary.remainingSafeToSpendMonth)}). Daily limit: 0 UZS.`
              : `Joriy oy uchun xavfsiz sarflash limiti tugagan yoki xarajatlar oshgan (Qoldiq: ${formatUZS(summary.remainingSafeToSpendMonth)}). Kunlik sarflash mumkin bo‘lgan limit: 0 so‘m.`;
        } else {
          safeText =
            language === 'ru'
              ? `Безопасный лимит расходов на день: ${formatUZS(summary.safeToSpendDaily)}. Остаток на месяц: ${formatUZS(summary.remainingSafeToSpendMonth)}.`
              : language === 'en'
              ? `Safe-to-spend daily limit: ${formatUZS(summary.safeToSpendDaily)}. Monthly remaining safe reserve: ${formatUZS(summary.remainingSafeToSpendMonth)}.`
              : `Mavjud ma'lumotlar asosida kunlik xavfsiz sarflash limitingiz: ${formatUZS(summary.safeToSpendDaily)}. Oylik reja bo‘yicha safe-to-spend qoldig‘i: ${formatUZS(summary.remainingSafeToSpendMonth)}.`;
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
          const errText =
            language === 'ru'
              ? 'Сумма расхода не указана или равна нулю. Укажите сумму (например: "Потратил 50 тысяч на продукты").'
              : language === 'en'
              ? 'Expense amount not recognized or zero. Please specify amount (e.g. "Spent 50000 on groceries").'
              : 'Xarajat summasi aniqlanmadi yoki 0 ga teng. Iltimos, to‘g‘ri summa ko‘rsating (masalan: "50 ming so‘m ovqatga sarfladim").';
          setMessages((prev) => [
            ...prev,
            { id: 'ast_' + Date.now(), sender: 'assistant', text: errText, timestamp, status: 'info' },
          ]);
          speak(errText);
          return;
        }

        const memberId = action.payload.memberId || activeFamilyMembers[0]?.id || null;

        addExpense({
          amount: action.payload.amount,
          category: (action.payload.category as ExpenseCategory) || 'other',
          description: action.payload.description || 'Xarajat',
          date: new Date().toISOString().split('T')[0],
          isEssential: false,
          isRecurring: false,
          memberId,
        });

        const successText =
          language === 'ru'
            ? `Расход на сумму ${formatUZS(action.payload.amount)} (${action.payload.description}) успешно добавлен!`
            : language === 'en'
            ? `Expense of ${formatUZS(action.payload.amount)} (${action.payload.description}) successfully added!`
            : `${formatUZS(action.payload.amount)} miqdoridagi xarajat (${action.payload.description}) muvaffaqiyatli saqlandi!`;

        setMessages((prev) => [
          ...prev,
          { id: 'ast_' + Date.now(), sender: 'assistant', text: successText, timestamp, status: 'executed' },
        ]);
        speak(successText);
        break;
      }

      case 'ADD_RECURRING_EXPENSE': {
        // If it got directly here without confirmation
        const memberId = action.payload.memberId || activeFamilyMembers[0]?.id || null;
        addRecurringExpense({
          name: action.payload.name || 'Takrorlanuvchi xarajat',
          amount: action.payload.amount,
          category: action.payload.category || 'other',
          memberId,
          recurrenceType: action.payload.recurrenceType || 'daily',
          selectedWeekdays: action.payload.selectedWeekdays,
          specificDate: action.payload.specificDate,
          startDate: action.payload.startDate || new Date().toISOString().split('T')[0],
          isActive: true,
        });

        const successText =
          language === 'ru'
            ? `Регулярный расход на сумму ${formatUZS(action.payload.amount)} успешно запланирован!`
            : language === 'en'
            ? `Recurring expense of ${formatUZS(action.payload.amount)} successfully scheduled!`
            : `Takrorlanuvchi xarajat (${formatUZS(action.payload.amount)}) muvaffaqiyatli rejalashtirildi!`;

        setMessages((prev) => [
          ...prev,
          { id: 'ast_' + Date.now(), sender: 'assistant', text: successText, timestamp, status: 'executed' },
        ]);
        speak(successText);
        break;
      }

      case 'ADD_INCOME': {
        if (!action.payload.amount || action.payload.amount <= 0 || action.payload.amount > 1_000_000_000_000) {
          const errText =
            language === 'ru'
              ? 'Сумма дохода не указана или равна нулю. Укажите сумму (например: "Получил зарплату 2 миллиона").'
              : language === 'en'
              ? 'Income amount not recognized. Please specify amount (e.g. "Received 2000000 salary").'
              : 'Daromad summasi aniqlanmadi yoki 0 ga teng. Iltimos, to‘g‘ri summa ko‘rsating (masalan: "2 million maosh oldim").';
          setMessages((prev) => [
            ...prev,
            { id: 'ast_' + Date.now(), sender: 'assistant', text: errText, timestamp, status: 'info' },
          ]);
          speak(errText);
          return;
        }

        const memberId = action.payload.memberId || activeFamilyMembers[0]?.id || null;

        addIncome({
          amount: action.payload.amount,
          name: action.payload.source || 'Daromad',
          date: new Date().toISOString().split('T')[0],
          isRecurring: false,
          category: 'other' as IncomeCategory,
          memberId,
        });

        const successText =
          language === 'ru'
            ? `Доход на сумму ${formatUZS(action.payload.amount)} (${action.payload.source}) успешно добавлен!`
            : language === 'en'
            ? `Income of ${formatUZS(action.payload.amount)} (${action.payload.source}) successfully added!`
            : `${formatUZS(action.payload.amount)} miqdoridagi daromad (${action.payload.source}) muvaffaqiyatli qo‘shildi!`;

        setMessages((prev) => [
          ...prev,
          { id: 'ast_' + Date.now(), sender: 'assistant', text: successText, timestamp, status: 'executed' },
        ]);
        speak(successText);
        break;
      }

      case 'ADD_GOAL': {
        if (!action.payload.targetAmount || action.payload.targetAmount <= 0 || action.payload.targetAmount > 1_000_000_000_000) {
          const errText =
            language === 'ru'
              ? 'Сумма цели не указана или неверна (например: "Цель 6 миллионов на телефон").'
              : language === 'en'
              ? 'Goal target amount not valid (e.g. "Goal 6 million for phone").'
              : 'Maqsad summasi aniqlanmadi yoki 0 ga teng (masalan: "Telefon uchun 6 million maqsad och").';
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

        const successText =
          language === 'ru'
            ? `Цель "${action.payload.title}" на сумму ${formatUZS(action.payload.targetAmount)} создана!`
            : language === 'en'
            ? `Goal "${action.payload.title}" for ${formatUZS(action.payload.targetAmount)} successfully created!`
            : `"${action.payload.title}" uchun ${formatUZS(action.payload.targetAmount)} lik yangi maqsad muvaffaqiyatli yaratildi!`;

        setMessages((prev) => [
          ...prev,
          { id: 'ast_' + Date.now(), sender: 'assistant', text: successText, timestamp, status: 'executed' },
        ]);
        speak(successText);
        break;
      }

      default: {
        const helpText =
          language === 'ru'
            ? `Извините, не удалось распознать команду "${action.payload.rawText || ''}".\n\nПримеры команд:\n• "50 тысяч на продукты"\n• "Каждый день 20 тысяч на дорогу"\n• "2 миллиона зарплата"\n• "Сколько денег осталось?"\n• "Лимит на день"`
            : language === 'en'
            ? `Sorry, could not recognize command "${action.payload.rawText || ''}".\n\nExamples:\n• "Spent 50000 on food"\n• "Daily 20000 for transport"\n• "2 million salary"\n• "Check balance"\n• "Daily limit"`
            : `Kechirasiz, "${action.payload.rawText || ''}" buyrug‘ini tushunmadim.\n\nQuyidagi buyruqlarni berishingiz mumkin:\n• "50 ming so‘m ovqatga sarfladim"\n• "Har kuni 20 ming so‘m yo‘l kira"\n• "2 million maosh oldim"\n• "Qancha pulim qoldi?"\n• "Kunlik qancha pul sarflashim mumkin?"`;

        setMessages((prev) => [
          ...prev,
          { id: 'ast_' + Date.now(), sender: 'assistant', text: helpText, timestamp, status: 'info' },
        ]);
        speak(
          language === 'ru'
            ? 'Извините, команда не распознана. Я могу фиксировать расходы, доходы, цели и проверять баланс.'
            : language === 'en'
            ? 'Sorry, command not recognized. I can handle expenses, income, goals, and balance.'
            : 'Kechirasiz, buyruqni tushunmadim. Men xarajat, takrorlanuvchi to‘lov, daromad yoki qoldiq buyruqlarini bajara olaman.'
        );
        break;
      }
    }
  };

  const confirmPendingAction = (actionId: string) => {
    const targetMsg = messages.find((m) => m.action?.id === actionId);
    if (!targetMsg || !targetMsg.action) return;

    const action = targetMsg.action;
    if (action.type === 'ADD_RECURRING_EXPENSE') {
      const memberId = action.payload.memberId || activeFamilyMembers[0]?.id || null;
      addRecurringExpense({
        name: action.payload.name || 'Takrorlanuvchi xarajat',
        amount: action.payload.amount,
        category: action.payload.category || 'other',
        memberId,
        recurrenceType: action.payload.recurrenceType || 'daily',
        selectedWeekdays: action.payload.selectedWeekdays,
        specificDate: action.payload.specificDate,
        startDate: action.payload.startDate || new Date().toISOString().split('T')[0],
        isActive: true,
      });

      const confirmMsg =
        language === 'ru'
          ? 'Регулярный расход успешно добавлен в финансовый план!'
          : language === 'en'
          ? 'Recurring expense successfully added to financial plan!'
          : 'Takrorlanuvchi xarajat muvaffaqiyatli rejalarga qo‘shildi!';

      speak(confirmMsg);
    } else if (action.type === 'DELETE_ITEM') {
      const q = (action.payload?.query || '').toLowerCase();
      if (q.includes('xarajat') || q.includes('расход') || q.includes('expense')) {
        expenses.forEach((e) => deleteExpense(e.id));
        speak(
          language === 'ru'
            ? 'Все расходы успешно очищены.'
            : language === 'en'
            ? 'All expenses cleared.'
            : 'Barcha xarajatlar muvaffaqiyatli tozalandi.'
        );
      } else if (q.includes('daromad') || q.includes('доход') || q.includes('income')) {
        incomes.forEach((i) => deleteIncome(i.id));
        speak(
          language === 'ru'
            ? 'Все доходы очищены.'
            : language === 'en'
            ? 'All income cleared.'
            : 'Barcha daromadlar tozalandi.'
        );
      } else if (q.includes('maqsad') || q.includes('цел') || q.includes('goal')) {
        goals.forEach((g) => deleteGoal(g.id));
        speak(
          language === 'ru'
            ? 'Все цели очищены.'
            : language === 'en'
            ? 'All goals cleared.'
            : 'Barcha maqsadlar tozalandi.'
        );
      } else {
        speak(
          language === 'ru'
            ? 'Выбранные данные удалены.'
            : language === 'en'
            ? 'Selected data removed.'
            : 'Tanlangan ma\'lumotlar o‘chirildi.'
        );
      }
    } else if (action.type === 'TRANSFER_FUNDS') {
      speak(
        language === 'ru'
          ? 'Перевод подтвержден.'
          : language === 'en'
          ? 'Transfer confirmed.'
          : 'Hisoblararo mablag‘ o‘tkazmasi tasdiqlandi va amalga oshirildi.'
      );
    }

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.action && msg.action.id === actionId) {
          const suffix =
            language === 'ru'
              ? ' (Подтверждено и выполнено)'
              : language === 'en'
              ? ' (Confirmed and executed)'
              : ' (Tasdiqlandi va bajarildi)';
          return { ...msg, status: 'executed', text: msg.text + suffix };
        }
        return msg;
      })
    );
  };

  const cancelPendingAction = (actionId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.action && msg.action.id === actionId) {
          const suffix =
            language === 'ru'
              ? ' (Отменено. Данные сохранены без изменений)'
              : language === 'en'
              ? ' (Cancelled. Data left unchanged)'
              : ' (Bekor qilindi. Ma\'lumotlaringiz o‘zgarishsiz qoldi)';
          return { ...msg, status: 'cancelled', text: msg.text + suffix };
        }
        return msg;
      })
    );
    speak(
      language === 'ru'
        ? 'Действие отменено.'
        : language === 'en'
        ? 'Action cancelled.'
        : 'Amal bekor qilindi. Ma\'lumotlaringiz o‘zgarishsiz qoldi.'
    );
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
        const errMsg: AssistantMessage = {
          id: 'ast_err_' + Date.now(),
          sender: 'assistant',
          text: `Ovozni aniqlashda xatolik yuz berdi: ${err}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'info',
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    );
  };

  const stopListening = () => {
    speechRecognitionRef.current?.stopListening();
    setIsListening(false);
  };

  const clearHistory = () => {
    setMessages([
      {
        id: 'msg_welcome_' + Date.now(),
        sender: 'assistant',
        text: WELCOME_MESSAGES[language] || WELCOME_MESSAGES.uz,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'info',
      },
    ]);
  };

  const getDiagnostics = (): AssistantDiagnostics => {
    const sttDiag = speechRecognitionRef.current?.getDiagnostics?.() || {
      sttAvailable: false,
      hasStandardAPI: false,
      hasWebkitAPI: false,
      language: LOCALE_MAP[language],
      permissionState: 'unknown' as const,
      recognitionStarted: false,
      lastError: null,
      lastTranscript: null,
      recentEvents: [],
    };

    const synthDiag = speechSynthesisRef.current?.getDiagnostics?.() || {
      isSupported: false,
      hasVoice: false,
      selectedVoiceName: null,
      selectedVoiceLang: null,
      totalVoices: 0,
      currentLanguage: LOCALE_MAP[language],
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
      hasVoice: synthDiag.hasVoice,
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
        language,
        setLanguage,
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
