import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { GoalPriority, GoalStatus } from '../../types';

export const AddGoalModal: React.FC = () => {
  const { activeModal, closeModal, addGoal, currentMonth, activeFamilyMembers } = useFinance();
  const { t, formatCurrency } = useLanguage();

  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentSavedStr, setCurrentSavedStr] = useState('0');
  const [deadline, setDeadline] = useState(() => `${currentMonth}-30`);
  const [priority, setPriority] = useState<GoalPriority>('high');
  const [status, setStatus] = useState<GoalStatus>('on_track');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [category, setCategory] = useState('Texnika va jihozlar');
  const [notes, setNotes] = useState('');

  if (activeModal !== 'goal') return null;

  const rawTargetAmount = parseInt(targetAmountStr.replace(/[^\d]/g, ''), 10) || 0;
  const rawCurrentSaved = parseInt(currentSavedStr.replace(/[^\d]/g, ''), 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rawTargetAmount <= 0) return;

    const targetMonth = deadline.slice(0, 7);

    addGoal({
      name: name.trim(),
      targetAmount: rawTargetAmount,
      currentSavedAmount: rawCurrentSaved,
      deadline,
      targetMonth,
      priority,
      status: rawCurrentSaved >= rawTargetAmount ? 'completed' : status,
      category,
      notes: notes.trim() || undefined,
      memberId: selectedMemberId || null,
    });

    closeModal();
    setName('');
    setTargetAmountStr('');
    setCurrentSavedStr('0');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t('btn_add_goal')}</h2>
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
              Maqsad nomi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Yangi noutbuk, Umra safari, Avtomobil, Xonadon ta'miri"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Koʻzlangan summa (soʻmda) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="0"
                value={targetAmountStr}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setTargetAmountStr(val ? parseInt(val, 10).toLocaleString('ru-RU') : '');
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              {rawTargetAmount > 0 && (
                <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  {formatCurrency(rawTargetAmount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Hozirgacha jamgʻarilgan
              </label>
              <input
                type="text"
                placeholder="0"
                value={currentSavedStr}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setCurrentSavedStr(val ? parseInt(val, 10).toLocaleString('ru-RU') : '');
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              {rawCurrentSaved > 0 && (
                <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {formatCurrency(rawCurrentSaved)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Muddat (oxirgi sana)
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('family_title')}
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
              >
                <option value="">👥 Umumiy oilaviy maqsad</option>
                {activeFamilyMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatarEmoji || '👤'} {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Muhimlik darajasi
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="high">Yuqori (birlamchi)</option>
                <option value="medium">Oʻrtacha</option>
                <option value="low">Past</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategoriya
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Masalan: Ta'lim, Sayohat, Uy"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Izoh (ixtiyoriy)
            </label>
            <input
              type="text"
              placeholder="Qoʻshimcha eslatma"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
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
              className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {t('btn_save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
