import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, X, Trash2, ShieldAlert, Sparkles, Check, AlertCircle, Info } from 'lucide-react';
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
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Yordamchi</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                  Offline
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ovozli & buyruqlar yordamchisi (uz-UZ)</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              title="Ovoz va til diagnostikasi"
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

        {/* Diagnostics Card (Collapsible) */}
        {showDiagnostics && (
          <div className="bg-slate-100/95 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 px-4 py-3 text-xs space-y-2 animate-in slide-in-from-top-1 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                STT Diagnostika Paneli
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                {diagnostics.recognitionLanguage}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              <div>
                <span className="text-slate-500 dark:text-slate-400">STT available: </span>
                <span className={diagnostics.sttAvailable ? 'font-bold text-emerald-600' : 'font-bold text-rose-500'}>
                  {diagnostics.sttAvailable ? 'YES' : 'NO'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Language: </span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                  {diagnostics.recognitionLanguage}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Permission: </span>
                <span className={`font-medium ${
                  diagnostics.permissionState === 'granted'
                    ? 'text-emerald-600'
                    : diagnostics.permissionState === 'denied'
                    ? 'text-rose-500'
                    : 'text-amber-500'
                }`}>
                  {diagnostics.permissionState}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Recognition started: </span>
                <span className={diagnostics.recognitionStarted ? 'font-medium text-emerald-600' : 'text-slate-500'}>
                  {diagnostics.recognitionStarted ? 'YES' : 'NO'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">window.SpeechRecognition: </span>
                <span className={diagnostics.hasStandardAPI ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  {diagnostics.hasStandardAPI ? 'YES' : 'NO'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">webkitSpeechRecognition: </span>
                <span className={diagnostics.hasWebkitAPI ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  {diagnostics.hasWebkitAPI ? 'YES' : 'NO'}
                </span>
              </div>

              <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Last error: </span>
                <span className="font-mono text-rose-500 text-[10px]">
                  {diagnostics.lastError || 'None'}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-slate-500 dark:text-slate-400">Last transcript: </span>
                <span className="font-mono text-slate-800 dark:text-slate-200 text-[10px]">
                  {diagnostics.lastTranscript ? `"${diagnostics.lastTranscript}"` : 'None'}
                </span>
              </div>

              {diagnostics.recentEvents.length > 0 && (
                <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-medium mb-1">So'nggi eventlar logi:</div>
                  <div className="bg-slate-200/60 dark:bg-slate-900/60 p-1.5 rounded font-mono text-[9px] text-slate-600 dark:text-slate-300 max-h-20 overflow-y-auto space-y-0.5">
                    {diagnostics.recentEvents.slice(-6).map((evt, idx) => (
                      <div key={idx}>{evt}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                {/* Sensitive Action Confirmation Card */}
                {msg.status === 'pending_confirmation' && msg.action && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-medium mb-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>Xavfsizlik: Ushbu amal tasdiqlashni talab qiladi</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmPendingAction(msg.action!.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => cancelPendingAction(msg.action!.id)}
                        className="flex-1 py-2 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Bekor qilish
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
          <button
            onClick={() => handleQuickChip('Qancha pulim qoldi?')}
            className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 transition-colors"
          >
            💰 Qoldiq qancha?
          </button>
          <button
            onClick={() => handleQuickChip('50 ming so‘m ovqatga sarfladim')}
            className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 transition-colors"
          >
            🍕 50 ming ovqatga
          </button>
          <button
            onClick={() => handleQuickChip('Kunlik sarflash mumkin bo‘lgan limit')}
            className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 transition-colors"
          >
            🛡️ Safe-to-Spend
          </button>
          <button
            onClick={() => handleQuickChip('Telefon uchun 6 million maqsad och')}
            className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300 transition-colors"
          >
            🎯 Telefon maqsadi
          </button>
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
            placeholder="Buyruqni yozing yoki mikrofonga gapiring..."
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
