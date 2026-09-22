import React, { useState } from 'react';
import { X, Receipt } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { ExpenseCategory } from '../../types';
import { EXPENSE_CATEGORY_LABELS } from '../../utils/formatters';

export const AddExpenseModal: React.FC = () => {
  const { activeModal, closeModal, addExpense, currentMonth, activeFamilyMembers } = useFinance();
  const { t, formatCurrency } = useLanguage();

  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(() => `${currentMonth}-15`);
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isEssential, setIsEssential] = useState(true);

  React.useEffect(() => {
    if (activeFamilyMembers.length > 0 && !selectedMemberId) {
      setSelectedMemberId(activeFamilyMembers[0].id);
    }
  }, [activeFamilyMembers, selectedMemberId]);

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
      memberId: selectedMemberId || null,
    });

    closeModal();
    setDescription('');
    setAmountStr('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t('btn_add_expense')}</h2>
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
              Xarajat tavsifi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Bozorlik, Dorixona, Benzin, Goʻsht"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
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
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
              {rawAmount > 0 && (
                <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
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
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              >
                {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Sana
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('family_title')}
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 font-medium"
              >
                <option value="">👥 Umumiy oilaviy xarajat</option>
                {activeFamilyMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatarEmoji || '👤'} {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isEssential}
                onChange={(e) => setIsEssential(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <span>Zaruriy xarajat (oziq-ovqat, dori, transport kabi kechiktirib boʻlmaydigan xarajat)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <span>Har oy takrorlanuvchi muntazam xarajat</span>
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
              className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {t('btn_save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
