import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, X, Trash2, ShieldAlert, Sparkles, Check, AlertCircle, Info, CalendarClock } from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';

export const AssistantModal: React.FC = () => {
  const {
    isOpen,
    closeAssistant,
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
  } = useAssistant();

  const [inputVal, setInputVal] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    processUserInput(inputVal);
    setInputVal('');
  };

  const handleQuickChip = (prompt: string) => {
    processUserInput(prompt);
  };

  const diagnostics = getDiagnostics();

  // Localized placeholders and chips
  const placeholders = {
    uz: 'Buyruqni yozing yoki mikrofonga gapiring...',
    ru: 'Напишите команду или говорите в микрофон...',
    en: 'Type a command or speak into the microphone...',
  };

  const quickChips = {
    uz: [
      { label: '🔁 Har kuni 20 ming yo‘l kira', cmd: 'Har kuni 20 ming so‘m yo‘l kira' },
      { label: '💰 Qoldiq qancha?', cmd: 'Qancha pulim qoldi?' },
      { label: '🍕 50 ming ovqatga', cmd: '50 ming so‘m ovqatga sarfladim' },
      { label: '🛡️ Safe-to-Spend', cmd: 'Kunlik sarflash mumkin bo‘lgan limit' },
    ],
    ru: [
      { label: '🔁 Каждый день 20 тысяч на дорогу', cmd: 'Каждый день 20 тысяч на дорогу' },
      { label: '💰 Сколько осталось?', cmd: 'Сколько денег осталось?' },
      { label: '🍕 50 тысяч на продукты', cmd: '50 тысяч на продукты' },
      { label: '🛡️ Safe-to-Spend', cmd: 'Лимит на день' },
    ],
    en: [
      { label: '🔁 Daily 20000 for transport', cmd: 'Daily 20000 for transport' },
      { label: '💰 Check balance', cmd: 'How much money left?' },
      { label: '🍕 Spent 50000 on food', cmd: 'Spent 50000 on food' },
      { label: '🛡️ Daily limit', cmd: 'How much can I spend daily?' },
    ],
  };

  return (
    <div
      onClick={closeAssistant}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {language === 'ru' ? 'Помощник' : language === 'en' ? 'Assistant' : 'Yordamchi'}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                  Offline
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ru' ? 'Голосовой помощник (ru-RU)' : language === 'en' ? 'Voice assistant (en-US)' : 'Ovozli yordamchi (uz-UZ)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              title="Diagnostika"
              className={`p-2 rounded-lg transition-colors ${
                showDiagnostics
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={clearHistory}
              title="Tarixni tozalash"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeAssistant}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language Selection Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {language === 'ru' ? 'Язык:' : language === 'en' ? 'Language:' : 'Til:'}
          </span>
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setLanguage('uz')}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                language === 'uz'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              🇺🇿 O‘zbek
            </button>
            <button
              onClick={() => setLanguage('ru')}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                language === 'ru'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              🇷🇺 Русский
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Diagnostics Card (Collapsible) */}
        {showDiagnostics && (
          <div className="bg-slate-100/95 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 px-4 py-3 text-xs space-y-2 animate-in slide-in-from-top-1 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                STT & TTS Diagnostika
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                {diagnostics.recognitionLanguage}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              <div>
                <span className="text-slate-500 dark:text-slate-400">STT status: </span>
                <span className={diagnostics.sttAvailable ? 'font-bold text-emerald-600' : 'font-bold text-rose-500'}>
                  {diagnostics.sttAvailable ? 'ACTIVE' : 'UNAVAILABLE'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">TTS status: </span>
                <span className={diagnostics.speechSynthesisAvailable ? 'font-bold text-emerald-600' : 'font-bold text-amber-500'}>
                  {diagnostics.speechSynthesisAvailable ? (diagnostics.hasVoice ? 'READY' : 'TEXT ONLY') : 'NONE'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Permission: </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{diagnostics.permissionState}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Voice: </span>
                <span className="truncate inline-block max-w-[120px] font-mono text-slate-700 dark:text-slate-300">
                  {diagnostics.selectedVoiceName || 'None'}
                </span>
              </div>
            </div>

            {diagnostics.recentEvents && diagnostics.recentEvents.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">So‘nggi hodisalar:</p>
                <div className="space-y-0.5 font-mono text-[10px] text-slate-600 dark:text-slate-300 max-h-24 overflow-y-auto">
                  {diagnostics.recentEvents.slice(-5).map((ev, i) => (
                    <div key={i} className="truncate">{ev}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                {/* Sensitive Action / Recurring Expense Confirmation Card */}
                {msg.status === 'pending_confirmation' && msg.action && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-medium mb-2">
                      {msg.action.type === 'ADD_RECURRING_EXPENSE' ? (
                        <>
                          <CalendarClock className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                            {language === 'ru'
                              ? 'Подтверждение регулярного платежа'
                              : language === 'en'
                              ? 'Recurring Expense Confirmation'
                              : 'Takrorlanuvchi xarajatni tasdiqlash'}
                          </span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>
                            {language === 'ru'
                              ? 'Действие требует подтверждения'
                              : language === 'en'
                              ? 'Action requires confirmation'
                              : 'Xavfsizlik: Ushbu amal tasdiqlashni talab qiladi'}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmPendingAction(msg.action!.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors ${
                          msg.action.type === 'ADD_RECURRING_EXPENSE'
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : 'bg-rose-600 hover:bg-rose-500'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {language === 'ru' ? 'Подтвердить' : language === 'en' ? 'Confirm' : 'Tasdiqlash'}
                      </button>
                      <button
                        onClick={() => cancelPendingAction(msg.action!.id)}
                        className="flex-1 py-2 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                      >
                        {language === 'ru' ? 'Отмена' : language === 'en' ? 'Cancel' : 'Bekor qilish'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickChips[language].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickChip(chip.cmd)}
              className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 bg-white dark:bg-slate-900"
        >
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            title={isListening ? "To‘xtatish" : "Ovoz bilan aytish"}
            className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={placeholders[language]}
            className="flex-1 px-3.5 py-2.5 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 disabled:opacity-40 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
