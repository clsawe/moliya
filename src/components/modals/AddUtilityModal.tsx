import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { UtilityCategory } from '../../types';
import { UTILITY_CATEGORY_LABELS, formatUZS } from '../../utils/formatters';

export const AddUtilityModal: React.FC = () => {
  const { activeModal, closeModal, addUtility, currentMonth } = useFinance();

  const [category, setCategory] = useState<UtilityCategory>('electricity');
  const [amountStr, setAmountStr] = useState('');
  const [month, setMonth] = useState(() => currentMonth);
  const [dueDate, setDueDate] = useState(() => `${currentMonth}-25`);
  const [meterReadingStr, setMeterReadingStr] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  if (activeModal !== 'utility') return null;

  const rawAmount = parseInt(amountStr.replace(/[^\d]/g, ''), 10) || 0;
  const rawMeterReading = meterReadingStr ? parseInt(meterReadingStr.replace(/[^\d]/g, ''), 10) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0) return;

    addUtility({
      category,
      amount: rawAmount,
      month,
      dueDate,
      meterReading: rawMeterReading,
      accountNumber: accountNumber.trim() || undefined,
      description: description.trim() || undefined,
      isPaid,
      paidDate: isPaid ? new Date().toISOString().split('T')[0] : undefined,
    });

    closeModal();
    setAmountStr('');
    setAccountNumber('');
    setDescription('');
    setMeterReadingStr('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Kommunal toʻlov qoʻshish</h2>
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
              Kommunal xizmat turi <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as UtilityCategory)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
            >
              {Object.entries(UTILITY_CATEGORY_LABELS).map(([catKey, { label }]) => (
                <option key={catKey} value={catKey}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Toʻlov summasi (soʻmda) <span className="text-rose-500">*</span>
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
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
              {rawAmount > 0 && (
                <p className="mt-1 text-[11px] text-amber-700 font-medium">
                  {formatUZS(rawAmount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hisob oyi (YYYY-MM)
              </label>
              <input
                type="month"
                required
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setDueDate(`${e.target.value}-25`);
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Toʻlov oxirgi muddati
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hisoblagich koʻrsatkichi (ixtiyoriy)
              </label>
              <input
                type="text"
                placeholder="Masalan: 440"
                value={meterReadingStr}
                onChange={(e) => setMeterReadingStr(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Abonent / Shaxsiy hisob raqami (Paynet uchun)
              </label>
              <input
                type="text"
                placeholder="Masalan: 10023485"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qoʻshimcha izoh
              </label>
              <input
                type="text"
                placeholder="Masalan: Uy elektr taʼminoti"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="relative flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-xl border border-slate-200 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Bu toʻlov allaqachon toʻlangan</span>
                <span className="text-[11px] text-slate-500 block">Agar belgilanmasa, toʻlanmagan majburiyat sifatida ogohlantiriladi</span>
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
              disabled={rawAmount <= 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
