import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  EXPENSE_CATEGORY_LABELS,
  UTILITY_CATEGORY_LABELS,
} from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const { currentMonth, summary, expenses, utilities, goals } = useFinance();
  const { t, formatCurrency, formatMonth } = useLanguage();

  // Filter current month items
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const monthUtilities = utilities.filter((u) => u.month === currentMonth);

  // Expense categories aggregation
  const expenseCatTotals: Record<string, number> = {};
  monthExpenses.forEach((exp) => {
    expenseCatTotals[exp.category] = (expenseCatTotals[exp.category] || 0) + exp.amount;
  });

  const sortedExpenseCats = Object.entries(expenseCatTotals).sort(([, a], [, b]) => b - a);

  // Overall financial inflow vs outflows
  const totalOutflows = summary.totalExpenses + summary.totalUtilities + summary.totalMandatory;
  const netSavings = summary.totalIncome - totalOutflows;
  const savingsRate = summary.totalIncome > 0 ? Math.round((netSavings / summary.totalIncome) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>{t('nav_reports')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('nav_reports')} ({formatMonth(currentMonth)})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('monthly_balance_desc')}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Sof jamgʻarma koʻrsatkichi:
          </span>
          <span
            className={`text-lg font-extrabold ${
              savingsRate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {savingsRate}% ({formatCurrency(netSavings)})
          </span>
        </div>
      </div>

      {/* Grid: Income vs Expenses & Outflows Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outflow Distribution Bars */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            {t('monthly_allocation')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Barcha chiqimlarning umumiy nisbati
          </p>

          <div className="space-y-4">
            {/* Everyday expenses */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-rose-500" />
                  {t('pillar_expenses')}
                </span>
                <span>
                  {formatCurrency(summary.totalExpenses)} (
                  {totalOutflows > 0 ? Math.round((summary.totalExpenses / totalOutflows) * 100) : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{
                    width: `${totalOutflows > 0 ? (summary.totalExpenses / totalOutflows) * 100 : 0}%`,
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
                  Kommunal toʻlovlar
                </span>
                <span>
                  {formatCurrency(summary.totalUtilities)} (
                  {totalOutflows > 0 ? Math.round((summary.totalUtilities / totalOutflows) * 100) : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{
                    width: `${totalOutflows > 0 ? (summary.totalUtilities / totalOutflows) * 100 : 0}%`,
                  }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>

            {/* Taxes & Mandatory */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  {t('pillar_mandatory')}
                </span>
                <span>
                  {formatCurrency(summary.totalMandatory)} (
                  {totalOutflows > 0 ? Math.round((summary.totalMandatory / totalOutflows) * 100) : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{
                    width: `${totalOutflows > 0 ? (summary.totalMandatory / totalOutflows) * 100 : 0}%`,
                  }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>

            {/* Net Safe Reserve */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Sof zaxira (Jamgʻarma / Maqsad)
                </span>
                <span>{formatCurrency(netSavings)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden">
                <div
                  style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
                  className="h-full bg-emerald-600 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expense Categories Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            Kundalik xarajatlar toifalari boʻyicha
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Qaysi sohalarga eng koʻp pul sarflanganligi
          </p>

          {sortedExpenseCats.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              Bu oyda xarajatlar kiritilmagan
            </div>
          ) : (
            <div className="space-y-3">
              {sortedExpenseCats.map(([catKey, sum]) => {
                const meta = EXPENSE_CATEGORY_LABELS[catKey as keyof typeof EXPENSE_CATEGORY_LABELS] || { label: catKey };
                const pct = summary.totalExpenses > 0 ? Math.round((sum / summary.totalExpenses) * 100) : 0;

                return (
                  <div key={catKey}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{meta.label}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(sum)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-slate-800 dark:bg-slate-400 rounded-full transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Utilities Breakdown & Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilities Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            Kommunal xizmatlar taqsimoti
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Jami: {formatCurrency(summary.totalUtilities)}
          </p>

          {monthUtilities.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              Kommunal toʻlovlar kiritilmagan
            </div>
          ) : (
            <div className="space-y-3">
              {monthUtilities.map((u) => {
                const meta = UTILITY_CATEGORY_LABELS[u.category] || { label: u.category };
                const pct = summary.totalUtilities > 0 ? Math.round((u.amount / summary.totalUtilities) * 100) : 0;

                return (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{meta.label}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {u.isPaid ? '✓ Toʻlangan' : '⏳ Kutilmoqda'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{formatCurrency(u.amount)}</span>
                      <span className="text-[11px] text-slate-400">{pct}% ulush</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Goal Progress Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            {t('goals_title')} bajarilishi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Barcha maqsadlar va ularning holati
          </p>

          {goals.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              {t('goals_empty')}
            </div>
          ) : (
            <div className="space-y-3.5">
              {goals.map((g) => {
                const progress = Math.min(100, Math.round((g.currentSavedAmount / Math.max(1, g.targetAmount)) * 100));
                return (
                  <div key={g.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                      <span>{g.name}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
                      <div
                        style={{ width: `${progress}%` }}
                        className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Yigʻildi: {formatCurrency(g.currentSavedAmount)}</span>
                      <span>Reja: {formatCurrency(g.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
