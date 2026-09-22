import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  Repeat,
  Check,
  X,
  Users,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { IncomeCategory, Income } from '../../types';
import { INCOME_CATEGORY_LABELS } from '../../utils/formatters';

export const IncomeView: React.FC = () => {
  const {
    incomes,
    updateIncome,
    deleteIncome,
    currentMonth,
    openModal,
    activeFamilyMembers,
    familyMembers,
  } = useFinance();

  const { t, formatCurrency, formatMonth, formatDate } = useLanguage();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editAmountStr, setEditAmountStr] = useState('');
  const [editCategory, setEditCategory] = useState<IncomeCategory>('salary');
  const [editDate, setEditDate] = useState('');
  const [editRecurring, setEditRecurring] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editMemberId, setEditMemberId] = useState<string>('family');

  // Current month incomes
  const monthIncomes = incomes.filter((inc) => inc.date.startsWith(currentMonth));

  // Apply both member filter and category filter
  const memberFilteredIncomes = monthIncomes.filter((inc) => {
    if (selectedMemberFilter === 'all') return true;
    if (selectedMemberFilter === 'family') return !inc.memberId;
    return inc.memberId === selectedMemberFilter;
  });

  const filteredIncomes = memberFilteredIncomes.filter(
    (inc) => filterCategory === 'all' || inc.category === filterCategory
  );

  const totalMonthlyIncome = memberFilteredIncomes.reduce((acc, cur) => acc + cur.amount, 0);

  // Category totals for current member selection
  const categoryTotals: Record<string, number> = {};
  memberFilteredIncomes.forEach((inc) => {
    categoryTotals[inc.category] = (categoryTotals[inc.category] || 0) + inc.amount;
  });

  const startEdit = (inc: Income) => {
    setEditingId(inc.id);
    setEditName(inc.name);
    setEditAmountStr(inc.amount.toString());
    setEditCategory(inc.category);
    setEditDate(inc.date);
    setEditRecurring(inc.isRecurring);
    setEditNotes(inc.notes || '');
    setEditMemberId(inc.memberId || 'family');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    const rawAmount = parseInt(editAmountStr.replace(/[^\d]/g, ''), 10) || 0;
    if (!editName.trim() || rawAmount <= 0) return;

    updateIncome(id, {
      name: editName.trim(),
      amount: rawAmount,
      category: editCategory,
      date: editDate,
      isRecurring: editRecurring,
      notes: editNotes.trim() || undefined,
      memberId: editMemberId === 'family' ? null : editMemberId,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('pillar_incomes')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('nav_incomes')} ({formatMonth(currentMonth)})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('app_subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              {t('pillar_incomes')}:
            </span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
              {formatCurrency(totalMonthlyIncome)}
            </span>
          </div>
          <button
            onClick={() => openModal('income')}
            className="min-h-[44px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('btn_add_income')}</span>
          </button>
        </div>
      </div>

      {/* Family Member Filter Bar */}
      {familyMembers.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Users className="w-3.5 h-3.5" />
            <span>{t('family_title')}:</span>
          </span>
          <button
            onClick={() => setSelectedMemberFilter('all')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedMemberFilter === 'all'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {t('family_all')} ({monthIncomes.length})
          </button>
          {activeFamilyMembers.map((member) => {
            const memberCount = monthIncomes.filter((i) => i.memberId === member.id).length;
            const isSelected = selectedMemberFilter === member.id;
            return (
              <button
                key={member.id}
                onClick={() => setSelectedMemberFilter(member.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{member.avatarEmoji || '👤'}</span>
                <span>{member.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {memberCount}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Category Breakdown Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(INCOME_CATEGORY_LABELS).map(([catKey, meta]) => {
          const catSum = categoryTotals[catKey] || 0;
          const isSelected = filterCategory === catKey;
          return (
            <button
              key={catKey}
              onClick={() => setFilterCategory(isSelected ? 'all' : catKey)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{meta.label}</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(catSum)}</div>
            </button>
          );
        })}
      </div>

      {/* Table / List of Income Records */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t('nav_incomes')} ({filteredIncomes.length})
          </h3>
          {(filterCategory !== 'all' || selectedMemberFilter !== 'all') && (
            <button
              onClick={() => {
                setFilterCategory('all');
                setSelectedMemberFilter('all');
              }}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Filtrni tozalash
            </button>
          )}
        </div>

        {filteredIncomes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500">
            <TrendingUp className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('incomes_empty')}</p>
            <button
              onClick={() => openModal('income')}
              className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('btn_add_income')}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredIncomes.map((inc) => {
              const catMeta = INCOME_CATEGORY_LABELS[inc.category] || { label: inc.category };
              const isEditing = editingId === inc.id;
              const assignedMember = inc.memberId
                ? familyMembers.find((m) => m.id === inc.memberId)
                : null;

              if (isEditing) {
                return (
                  <div key={inc.id} className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Daromad nomi"
                        className="px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editAmountStr}
                        onChange={(e) => setEditAmountStr(e.target.value)}
                        placeholder="Summa"
                        className="px-3.5 py-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as IncomeCategory)}
                        className="px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
                      >
                        {Object.entries(INCOME_CATEGORY_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <select
                        value={editMemberId}
                        onChange={(e) => setEditMemberId(e.target.value)}
                        className="px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none font-medium"
                      >
                        <option value="family">👥 {t('family_title')}</option>
                        {activeFamilyMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.avatarEmoji || '👤'} {m.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Qoʻshimcha izoh"
                        className="px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={cancelEdit}
                        className="min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        {t('btn_cancel')}
                      </button>
                      <button
                        onClick={() => saveEdit(inc.id)}
                        className="min-h-[40px] px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('btn_save')}</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={inc.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">{inc.name}</h4>
                        {assignedMember ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span>{assignedMember.avatarEmoji || '👤'}</span>
                            <span>{assignedMember.name}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <Users className="w-2.5 h-2.5" />
                            <span>{t('family_title')}</span>
                          </span>
                        )}
                        {inc.isRecurring && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="Doimiy"
                          >
                            <Repeat className="w-3 h-3 text-slate-400" />
                            <span>Doimiy</span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {catMeta.label}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(inc.date)}
                        </span>
                        {inc.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400 dark:text-slate-500 max-w-xs truncate">
                              «{inc.notes}»
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(inc.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(inc)}
                        className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                        title={t('btn_edit')}
                        aria-label={t('btn_edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteIncome(inc.id)}
                        className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center cursor-pointer transition-colors"
                        title={t('btn_delete')}
                        aria-label={t('btn_delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
