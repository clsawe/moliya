import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { MandatoryCategory } from '../../types';
import { MANDATORY_CATEGORY_LABELS } from '../../utils/formatters';

export const AddMandatoryModal: React.FC = () => {
  const { activeModal, closeModal, addMandatory, currentMonth } = useFinance();
  const { t, formatCurrency } = useLanguage();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<MandatoryCategory>('tax');
  const [amountStr, setAmountStr] = useState('');
  const [month, setMonth] = useState(() => currentMonth);
  const [dueDate, setDueDate] = useState(() => `${currentMonth}-20`);
  const [notes, setNotes] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  if (activeModal !== 'mandatory') return null;

  const rawAmount = parseInt(amountStr.replace(/[^\d]/g, ''), 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rawAmount <= 0) return;

    addMandatory({
      name: name.trim(),
      category,
      amount: rawAmount,
      month,
      dueDate,
      notes: notes.trim() || undefined,
      isPaid,
      paidDate: isPaid ? new Date().toISOString().split('T')[0] : undefined,
    });

    closeModal();
    setName('');
    setAmountStr('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t('pillar_mandatory')}</h2>
          </div>
          <button
            onClick={closeModal}
            className="min-h-[36px] min-w-[36px] p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
            aria-label={t('btn_cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Toʻlov nomi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Daromad soligʻi, Yer soligʻi, Bolalar bogʻchasi toʻlovi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              {rawAmount > 0 && (
                <p className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  {formatCurrency(rawAmount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategoriya
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MandatoryCategory)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                {Object.entries(MANDATORY_CATEGORY_LABELS).map(([k, meta]) => (
                  <option key={k} value={k}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Toʻlov muddati
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Qaysi oy uchun
              </label>
              <input
                type="month"
                required
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Izoh (ixtiyoriy)
            </label>
            <input
              type="text"
              placeholder="Masalan: Yillik toʻlov kvitansiyasi boʻyicha"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Ushbu toʻlov toʻlangan (arxivlash)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {t('btn_save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
