import React, { useState } from 'react';
import { X, Receipt } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseCategory } from '../../types';
import { EXPENSE_CATEGORY_LABELS, formatUZS } from '../../utils/formatters';

export const AddExpenseModal: React.FC = () => {
  const { activeModal, closeModal, addExpense, currentMonth } = useFinance();

  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(() => `${currentMonth}-15`);
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isEssential, setIsEssential] = useState(true);

  if (activeModal !== 'expense') return null;

  const rawAmount = parseInt(amountStr.replace(/[^\d]/g, ''), 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || rawAmount <= 0) return;

    addExpense({
      description: description.trim(),
      amount: rawAmount,
      date,
      category,
      isRecurring,
      isEssential,
    });

    closeModal();
    setDescription('');
    setAmountStr('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Kundalik xarajat qoʻshish</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Xarajat tavsifi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Bozorlik mahsulotlari, Yoqilgʻi quyish, Dori-darmon"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Summa (soʻmda) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="0"
                value={amountStr}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setAmountStr(val ? parseInt(val, 10).toLocaleString('ru-RU') : '');
                }}
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
              {rawAmount > 0 && (
                <p className="mt-1 text-[11px] text-rose-700 font-medium">
                  {formatUZS(rawAmount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sana <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Xarajat toifasi
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 bg-white"
            >
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([catKey, { label }]) => (
                <option key={catKey} value={catKey}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="relative flex items-center gap-2.5 cursor-pointer select-none p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={isEssential}
                onChange={(e) => setIsEssential(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800 border-slate-300"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Zaruriy ehtiyoj</span>
                <span className="text-[11px] text-slate-400 block">Tejash qiyin boʻlgan sarf</span>
              </div>
            </label>

            <label className="relative flex items-center gap-2.5 cursor-pointer select-none p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800 border-slate-300"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Doimiy xarajat</span>
                <span className="text-[11px] text-slate-400 block">Har oy takrorlanadi</span>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={rawAmount <= 0 || !description.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
