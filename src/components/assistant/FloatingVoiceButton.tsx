import React from 'react';
import { Mic } from 'lucide-react';
import { useAssistant } from '../../context/AssistantContext';

export const FloatingVoiceButton: React.FC = () => {
  const { openAssistant, startListening, isListening } = useAssistant();

  const handleClick = () => {
    openAssistant();
    // Auto-start listening on tap for fast voice command
    setTimeout(() => {
      startListening();
    }, 200);
  };

  return (
    <div
      className="fixed right-4 sm:right-6 z-40"
      style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <button
        onClick={handleClick}
        aria-label="Ovozli yordamchi"
        className={`relative group flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-xl transition-all duration-300 transform active:scale-95 ${
          isListening
            ? 'bg-rose-500 text-white shadow-rose-500/40 animate-pulse ring-4 ring-rose-400/40'
            : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/35 ring-2 ring-white/20 dark:ring-slate-800'
        }`}
      >
        {/* Pulsing ring indicator */}
        <span
          className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
            isListening ? 'animate-ping bg-rose-400 opacity-75' : 'opacity-0'
          }`}
        />
        
        <Mic className={`w-6 h-6 transition-transform duration-200 ${isListening ? 'scale-110' : 'group-hover:scale-105'}`} />

        {/* Small label badge for desktop */}
        <span className="sr-only">Yordamchi</span>
        <span className="hidden lg:block absolute right-full mr-3 px-2.5 py-1 bg-slate-900/90 dark:bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Ovozli Yordamchi
        </span>
      </button>
    </div>
  );
};
