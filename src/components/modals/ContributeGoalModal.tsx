import React, { useState } from 'react';
import { X, PiggyBank } from 'lucide-react';
import { FinancialGoal } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface ContributeGoalModalProps {
  goal: FinancialGoal | null;
  onClose: () => void;
  onContribute: (goalId: string, amount: number) => void;
}

export const ContributeGoalModal: React.FC<ContributeGoalModalProps> = ({
  goal,
  onClose,
  onContribute,
}) => {
  const { t, formatCurrency } = useLanguage();
  const [amountStr, setAmountStr] = useState('');

  if (!goal) return null;

  const rawAmount = parseInt(amountStr.replace(/[^\d]/g, ''), 10) || 0;
  const remainingNeeded = Math.max(0, goal.targetAmount - goal.currentSavedAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0) return;
    onContribute(goal.id, rawAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Maqsadga mablagʻ qoʻshish</h2>
          </div>
          <button
            onClick={onClose}
            className="min-h-[36px] min-w-[36px] p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
            aria-label={t('btn_cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tanlangan maqsad:</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{goal.name}</div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Hozirgi: <strong>{formatCurrency(goal.currentSavedAmount)}</strong></span>
              <span>Qolgan: <strong>{formatCurrency(remainingNeeded)}</strong></span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Qoʻshiladigan summa (soʻmda) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="0"
              value={amountStr}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, '');
                setAmountStr(val ? parseInt(val, 10).toLocaleString('ru-RU') : '');
              }}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            {rawAmount > 0 && (
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                +{formatCurrency(rawAmount)} qoʻshiladi
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              disabled={rawAmount <= 0}
              className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {t('btn_save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
