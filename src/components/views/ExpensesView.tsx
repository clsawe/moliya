import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Repeat,
  Check,
  Zap,
  ShieldCheck,
  PieChart,
  Users,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { ExpenseCategory, Expense } from '../../types';
import { EXPENSE_CATEGORY_LABELS } from '../../utils/formatters';
import { UtilitiesView } from './UtilitiesView';
import { TaxesMandatoryView } from './TaxesMandatoryView';

interface ExpensesViewProps {
  initialTab?: 'everyday' | 'utilities' | 'mandatory' | 'analytics';
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ initialTab = 'everyday' }) => {
  const {
    expenses,
    updateExpense,
    deleteExpense,
    currentMonth,
    openModal,
    summary,
    utilities,
    mandatoryPayments,
    expensesSubTab,
    setExpensesSubTab,
    activeFamilyMembers,
    familyMembers,
  } = useFinance();

  const { t, formatCurrency, formatMonth, formatDate } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'everyday' | 'utilities' | 'mandatory' | 'analytics'>(
    expensesSubTab || initialTab
  );

  React.useEffect(() => {
    if (expensesSubTab) {
      setActiveSubTab(expensesSubTab);
    }
  }, [expensesSubTab]);

  const handleSubTabChange = (tab: 'everyday' | 'utilities' | 'mandatory' | 'analytics') => {
    setActiveSubTab(tab);
    setExpensesSubTab(tab);
  };

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit form state
  const [editDesc, setEditDesc] = useState('');
  const [editAmountStr, setEditAmountStr] = useState('');
  const [editCategory, setEditCategory] = useState<ExpenseCategory>('food');
  const [editDate, setEditDate] = useState('');
  const [editRecurring, setEditRecurring] = useState(false);
  const [editEssential, setEditEssential] = useState(true);
  const [editMemberId, setEditMemberId] = useState<string>('family');

  // Month expenses
  const monthExpenses = expenses.filter((exp) => exp.date.startsWith(currentMonth));

  // Member filtered expenses
  const memberFilteredExpenses = monthExpenses.filter((exp) => {
    if (selectedMemberFilter === 'all') return true;
    if (selectedMemberFilter === 'family') return !exp.memberId;
    return exp.memberId === selectedMemberFilter;
  });

  const filteredExpenses = memberFilteredExpenses.filter(
    (exp) => filterCategory === 'all' || exp.category === filterCategory
  );

  const totalMonthlyEveryday = memberFilteredExpenses.reduce((acc, cur) => acc + cur.amount, 0);
  const totalAllOutflows = totalMonthlyEveryday + summary.totalUtilities + summary.totalMandatory;

  // Category totals for everyday
  const categoryTotals: Record<string, number> = {};
  memberFilteredExpenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const sortedCategoryTotals = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);

  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setEditDesc(exp.description);
    setEditAmountStr(exp.amount.toString());
    setEditCategory(exp.category);
    setEditDate(exp.date);
    setEditRecurring(exp.isRecurring);
    setEditEssential(exp.isEssential ?? true);
    setEditMemberId(exp.memberId || 'family');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    const rawAmount = parseInt(editAmountStr.replace(/[^\d]/g, ''), 10) || 0;
    if (!editDesc.trim() || rawAmount <= 0) return;

    updateExpense(id, {
      description: editDesc.trim(),
      amount: rawAmount,
      category: editCategory,
      date: editDate,
      isRecurring: editRecurring,
      isEssential: editEssential,
      memberId: editMemberId === 'family' ? null : editMemberId,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Central Outflow Overview Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>{t('pillar_expenses')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t('nav_expenses')} ({formatMonth(currentMonth)})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t('app_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                {t('monthly_outflows_share')}:
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400 block">
                {formatCurrency(totalAllOutflows)}
              </span>
            </div>

            {activeSubTab === 'everyday' && (
              <button
                onClick={() => openModal('expense')}
                className="min-h-[44px] px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('btn_add_expense')}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Stat Cards across all outflow categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleSubTabChange('everyday')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeSubTab === 'everyday'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 ring-2 ring-rose-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-rose-500" />
              <span>Kundalik</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalMonthlyEveryday)}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{monthExpenses.length} ta</div>
          </button>

          <button
            onClick={() => handleSubTabChange('utilities')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeSubTab === 'utilities'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Kommunal</span>
              </span>
              {summary.totalUnpaidBillsCount > 0 && (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-bold px-1.5 py-0.2 rounded-full">
                  {summary.totalUnpaidBillsCount}
                </span>
              )}
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(summary.totalUtilities)}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {utilities.filter((u) => u.month === currentMonth).length} ta
            </div>
          </button>

          <button
            onClick={() => handleSubTabChange('mandatory')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeSubTab === 'mandatory'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 ring-2 ring-blue-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('pillar_mandatory')}</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(summary.totalMandatory)}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {mandatoryPayments.filter((m) => m.month === currentMonth).length} ta
            </div>
          </button>

          <button
            onClick={() => handleSubTabChange('analytics')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeSubTab === 'analytics'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 ring-2 ring-indigo-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t('monthly_allocation')}</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Tahlil
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Taqsimot</div>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => handleSubTabChange('everyday')}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'everyday'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Kundalik ({monthExpenses.length})</span>
        </button>

        <button
          onClick={() => handleSubTabChange('utilities')}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'utilities'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Kommunal</span>
          {summary.totalUnpaidBillsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
              {summary.totalUnpaidBillsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSubTabChange('mandatory')}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'mandatory'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('pillar_mandatory')}</span>
        </button>

        <button
          onClick={() => handleSubTabChange('analytics')}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'analytics'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Tahlil</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeSubTab === 'everyday' && (
        <div className="space-y-6">
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
                {t('family_all')} ({monthExpenses.length})
              </button>
              {activeFamilyMembers.map((member) => {
                const memberCount = monthExpenses.filter((e) => e.memberId === member.id).length;
                const isSelected = selectedMemberFilter === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMemberFilter(member.id)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{member.avatarEmoji || '👤'}</span>
                    <span>{member.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-rose-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {memberCount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterCategory('all')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t('family_all')} ({memberFilteredExpenses.length})
            </button>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([catKey, { label }]) => {
              const count = memberFilteredExpenses.filter((e) => e.category === catKey).length;
              if (count === 0 && filterCategory !== catKey) return null;
              return (
                <button
                  key={catKey}
                  onClick={() => setFilterCategory(catKey)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    filterCategory === catKey
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Everyday Expenses List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('nav_expenses')} ({filteredExpenses.length})
              </h3>
              {(filterCategory !== 'all' || selectedMemberFilter !== 'all') && (
                <button
                  onClick={() => {
                    setFilterCategory('all');
                    setSelectedMemberFilter('all');
                  }}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Filtrni tozalash
                </button>
              )}
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('expenses_empty')}</p>
                <button
                  onClick={() => openModal('expense')}
                  className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('btn_add_expense')}</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExpenses.map((exp) => {
                  const catMeta = EXPENSE_CATEGORY_LABELS[exp.category] || { label: exp.category };
                  const isEditing = editingId === exp.id;
                  const assignedMember = exp.memberId
                    ? familyMembers.find((m) => m.id === exp.memberId)
                    : null;

                  if (isEditing) {
                    return (
                      <div key={exp.id} className="p-4 bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Tavsif"
                            className="px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={editAmountStr}
                            onChange={(e) => setEditAmountStr(e.target.value)}
                            placeholder="Summa"
                            className="px-3.5 py-2 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
                          />
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as ExpenseCategory)}
                            className="px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
                          >
                            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v.label}
                              </option>
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
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
                          />

                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editEssential}
                                onChange={(e) => setEditEssential(e.target.checked)}
                                className="rounded text-rose-600 focus:ring-rose-500"
                              />
                              <span>Zaruriy xarajat</span>
                            </label>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={cancelEdit}
                                className="min-h-[40px] px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                              >
                                {t('btn_cancel')}
                              </button>
                              <button
                                onClick={() => saveEdit(exp.id)}
                                className="min-h-[40px] px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{t('btn_save')}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={exp.id}
                      className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">{exp.description}</h4>
                            {assignedMember ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                <span>{assignedMember.avatarEmoji || '👤'}</span>
                                <span>{assignedMember.name}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                <Users className="w-2.5 h-2.5" />
                                <span>{t('family_title')}</span>
                              </span>
                            )}
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                              {catMeta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {formatDate(exp.date)}
                            </span>
                            {exp.isRecurring && (
                              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                                <Repeat className="w-3 h-3" />
                                Doimiy
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                            {formatCurrency(exp.amount)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(exp)}
                            className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                            title={t('btn_edit')}
                            aria-label={t('btn_edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
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
      )}

      {/* TAB: UTILITIES */}
      {activeSubTab === 'utilities' && <UtilitiesView />}

      {/* TAB: MANDATORY & TAXES */}
      {activeSubTab === 'mandatory' && <TaxesMandatoryView />}

      {/* TAB: EXPENSES ANALYTICS & REPORTS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Outflow Distribution Bars */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                {t('monthly_allocation')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                {t('monthly_balance_desc')}
              </p>

              <div className="space-y-5">
                {/* Everyday expenses */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-rose-500" />
                      {t('pillar_expenses')}
                    </span>
                    <span>
                      {formatCurrency(totalMonthlyEveryday)} (
                      {totalAllOutflows > 0 ? Math.round((totalMonthlyEveryday / totalAllOutflows) * 100) : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{
                        width: `${totalAllOutflows > 0 ? (totalMonthlyEveryday / totalAllOutflows) * 100 : 0}%`,
                      }}
                      className="h-full bg-rose-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Utilities */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Kommunal
                    </span>
                    <span>
                      {formatCurrency(summary.totalUtilities)} (
                      {totalAllOutflows > 0 ? Math.round((summary.totalUtilities / totalAllOutflows) * 100) : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{
                        width: `${totalAllOutflows > 0 ? (summary.totalUtilities / totalAllOutflows) * 100 : 0}%`,
                      }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Mandatory */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      {t('pillar_mandatory')}
                    </span>
                    <span>
                      {formatCurrency(summary.totalMandatory)} (
                      {totalAllOutflows > 0 ? Math.round((summary.totalMandatory / totalAllOutflows) * 100) : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{
                        width: `${totalAllOutflows > 0 ? (summary.totalMandatory / totalAllOutflows) * 100 : 0}%`,
                      }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Everyday Categories Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                Kategoriyalar boʻyicha
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Chiqimlarning taqsimoti
              </p>

              {sortedCategoryTotals.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  {t('expenses_empty')}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {sortedCategoryTotals.map(([catKey, amount]) => {
                    const percent = totalMonthlyEveryday > 0 ? Math.round((amount / totalMonthlyEveryday) * 100) : 0;
                    const meta = EXPENSE_CATEGORY_LABELS[catKey as ExpenseCategory] || { label: catKey };

                    return (
                      <div key={catKey}>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>{meta.label}</span>
                          <span className="text-slate-900 dark:text-slate-100">
                            {formatCurrency(amount)} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className="h-full bg-rose-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
