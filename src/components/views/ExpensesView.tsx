import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Repeat,
  Check,
  ShieldAlert,
  Zap,
  ShieldCheck,
  PieChart,
  Filter,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseCategory, Expense } from '../../types';
import {
  EXPENSE_CATEGORY_LABELS,
  UTILITY_CATEGORY_LABELS,
  MANDATORY_CATEGORY_LABELS,
  formatUZS,
  formatUzbekDate,
  formatMonthName,
} from '../../utils/formatters';
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
  } = useFinance();
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
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit form state
  const [editDesc, setEditDesc] = useState('');
  const [editAmountStr, setEditAmountStr] = useState('');
  const [editCategory, setEditCategory] = useState<ExpenseCategory>('food');
  const [editDate, setEditDate] = useState('');
  const [editRecurring, setEditRecurring] = useState(false);
  const [editEssential, setEditEssential] = useState(true);

  // Month expenses
  const monthExpenses = expenses.filter((exp) => exp.date.startsWith(currentMonth));
  const filteredExpenses = monthExpenses.filter(
    (exp) => filterCategory === 'all' || exp.category === filterCategory
  );

  const totalMonthlyEveryday = monthExpenses.reduce((acc, cur) => acc + cur.amount, 0);
  const totalAllOutflows = totalMonthlyEveryday + summary.totalUtilities + summary.totalMandatory;

  // Category totals for everyday
  const categoryTotals: Record<string, number> = {};
  monthExpenses.forEach((exp) => {
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
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Central Outflow Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>Chiqimlar markazi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Xarajatlar ({formatMonthName(currentMonth)})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kundalik xarajatlar, kommunal toʻlovlar va majburiy soliqlarning yagona boshqaruvi
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-right">
              <span className="text-[11px] font-semibold text-slate-500 block">Jami barcha chiqimlar:</span>
              <span className="text-lg sm:text-xl font-extrabold text-rose-600 block">
                {formatUZS(totalAllOutflows)}
              </span>
            </div>

            {activeSubTab === 'everyday' && (
              <button
                onClick={() => openModal('expense')}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Xarajat qoʻshish</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Stat Cards across all outflow categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleSubTabChange('everyday')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeSubTab === 'everyday'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                : 'bg-white border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-rose-500" />
              <span>Kundalik</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold text-slate-900">
              {formatUZS(totalMonthlyEveryday)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{monthExpenses.length} ta xarid</div>
          </button>

          <button
            onClick={() => handleSubTabChange('utilities')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeSubTab === 'utilities'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                : 'bg-white border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Kommunal</span>
              </span>
              {summary.totalUnpaidBillsCount > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                  {summary.totalUnpaidBillsCount} kutilmoqda
                </span>
              )}
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold text-slate-900">
              {formatUZS(summary.totalUtilities)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{utilities.filter(u => u.month === currentMonth).length} ta hisob</div>
          </button>

          <button
            onClick={() => handleSubTabChange('mandatory')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeSubTab === 'mandatory'
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Soliq va majburiy</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold text-slate-900">
              {formatUZS(summary.totalMandatory)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{mandatoryPayments.filter(m => m.month === currentMonth).length} ta toʻlov</div>
          </button>

          <button
            onClick={() => handleSubTabChange('analytics')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeSubTab === 'analytics'
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                : 'bg-white border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-indigo-500" />
              <span>Xarajatlar tahlili</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-bold text-slate-900">
              Hisobotlar
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Kategoriya & taqsimot</div>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => handleSubTabChange('everyday')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'everyday'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Kundalik xarajatlar ({monthExpenses.length})</span>
        </button>

        <button
          onClick={() => handleSubTabChange('utilities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'utilities'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Kommunal toʻlovlar</span>
          {summary.totalUnpaidBillsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
              {summary.totalUnpaidBillsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSubTabChange('mandatory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'mandatory'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Soliq va majburiy</span>
        </button>

        <button
          onClick={() => handleSubTabChange('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Tahliliy hisobotlar</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeSubTab === 'everyday' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Barchasi ({monthExpenses.length})
            </button>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([catKey, { label }]) => {
              const count = monthExpenses.filter((e) => e.category === catKey).length;
              if (count === 0 && filterCategory !== catKey) return null;
              return (
                <button
                  key={catKey}
                  onClick={() => setFilterCategory(catKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    filterCategory === catKey
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Everyday Expenses List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Xarajatlar roʻyxati ({filteredExpenses.length} ta)
              </h3>
              {filterCategory !== 'all' && (
                <button
                  onClick={() => setFilterCategory('all')}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Filtrni tozalash
                </button>
              )}
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">Bu parametr boʻyicha xarajatlar yoʻq</p>
                <p className="text-xs text-slate-400 mt-1">«Xarajat qoʻshish» tugmasi orqali yangi yozuv kiriting</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => {
                  const catMeta = EXPENSE_CATEGORY_LABELS[exp.category] || { label: exp.category };
                  const isEditing = editingId === exp.id;

                  if (isEditing) {
                    return (
                      <div key={exp.id} className="p-4 bg-rose-50/40 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Tavsif"
                            className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={editAmountStr}
                            onChange={(e) => setEditAmountStr(e.target.value)}
                            placeholder="Summa"
                            className="px-3 py-1.5 text-sm font-semibold bg-white rounded-lg border border-slate-300 focus:outline-none"
                          />
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as ExpenseCategory)}
                            className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                          >
                            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editEssential}
                              onChange={(e) => setEditEssential(e.target.checked)}
                              className="rounded text-rose-600 focus:ring-rose-500"
                            />
                            <span>Zaruriy xarajat (oziq-ovqat, dori-darmon)</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                            >
                              Bekor qilish
                            </button>
                            <button
                              onClick={() => saveEdit(exp.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Saqlash</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={exp.id}
                      className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{exp.description}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                              {catMeta.label}
                            </span>
                            {exp.isEssential && (
                              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                Zaruriy
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatUzbekDate(exp.date)}
                            </span>
                            {exp.isRecurring && (
                              <span className="flex items-center gap-1 text-indigo-600">
                                <Repeat className="w-3 h-3" />
                                Doimiy
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-base font-extrabold text-slate-900">
                            {formatUZS(exp.amount)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Oʻchirish"
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
          {/* Outflow Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Outflow Distribution Bars */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Chiqimlar oqimi taqsimoti
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Barcha sarf-xarajatlarning umumiy chiqimdagi foiz ulushi
              </p>

              <div className="space-y-5">
                {/* Everyday expenses */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-rose-500" />
                      Kundalik xarajatlar
                    </span>
                    <span>
                      {formatUZS(totalMonthlyEveryday)} (
                      {totalAllOutflows > 0 ? Math.round((totalMonthlyEveryday / totalAllOutflows) * 100) : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
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
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Kommunal toʻlovlar
                    </span>
                    <span>
                      {formatUZS(summary.totalUtilities)} (
                      {totalAllOutflows > 0 ? Math.round((summary.totalUtilities / totalAllOutflows) * 100) : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
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
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      Soliq va majburiy toʻlovlar
                    </span>
                    <span>
                      {formatUZS(summary.totalMandatory)} (
                      {totalAllOutflows > 0 ? Math.round((summary.totalMandatory / totalAllOutflows) * 100) : 0}
                      %)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
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
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Kundalik toifalar boʻyicha
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Qaysi sohalarga eng koʻp pul sarflanayotgani
              </p>

              {sortedCategoryTotals.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Kundalik xarajatlar hali kiritilmagan
                </div>
              ) : (
                <div className="space-y-3.5">
                  {sortedCategoryTotals.map(([catKey, amount]) => {
                    const percent = totalMonthlyEveryday > 0 ? Math.round((amount / totalMonthlyEveryday) * 100) : 0;
                    const meta = EXPENSE_CATEGORY_LABELS[catKey as ExpenseCategory] || { label: catKey };

                    return (
                      <div key={catKey}>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span>{meta.label}</span>
                          <span className="text-slate-900">
                            {formatUZS(amount)} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
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
