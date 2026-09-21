import React, { useState } from 'react';
import { X, PiggyBank } from 'lucide-react';
import { FinancialGoal } from '../../types';
import { formatUZS } from '../../utils/formatters';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Maqsadga mablagʻ qoʻshish</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Tanlangan maqsad:</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{goal.name}</div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>Hozirgi jamgʻarma: <strong>{formatUZS(goal.currentSavedAmount)}</strong></span>
              <span>Kerak: <strong>{formatUZS(remainingNeeded)}</strong></span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Qoʻshilayotgan summa (soʻmda)
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
              className="w-full px-3.5 py-2.5 text-base font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            {rawAmount > 0 && (
              <p className="mt-1 text-xs text-indigo-700 font-medium">
                {formatUZS(rawAmount)}
              </p>
            )}
          </div>

          {/* Quick Amount Suggestion Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[100000, 200000, 500000, remainingNeeded].filter((v) => v > 0).map((preset, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setAmountStr(preset.toLocaleString('ru-RU'))}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                +{formatUZS(preset, false)}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={rawAmount <= 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
            >
              Jamgʻarish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
