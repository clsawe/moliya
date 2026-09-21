import React from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Receipt,
  Zap,
  ShieldCheck,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatUZS,
  formatMonthName,
  EXPENSE_CATEGORY_LABELS,
  UTILITY_CATEGORY_LABELS,
} from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const { currentMonth, summary, expenses, utilities, mandatoryPayments, goals } = useFinance();

  // Filter current month items
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const monthUtilities = utilities.filter((u) => u.month === currentMonth);
  const monthMandatory = mandatoryPayments.filter((m) => m.month === currentMonth);

  // Expense categories aggregation
  const expenseCatTotals: Record<string, number> = {};
  monthExpenses.forEach((exp) => {
    expenseCatTotals[exp.category] = (expenseCatTotals[exp.category] || 0) + exp.amount;
  });

  const sortedExpenseCats = Object.entries(expenseCatTotals)
    .sort(([, a], [, b]) => b - a);

  // Overall financial inflow vs outflows
  const totalOutflows = summary.totalExpenses + summary.totalUtilities + summary.totalMandatory;
  const netSavings = summary.totalIncome - totalOutflows;
  const savingsRate = summary.totalIncome > 0 ? Math.round((netSavings / summary.totalIncome) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Vizual tahlil va koʻrsatkichlar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Moliyaviy Hisobotlar ({formatMonthName(currentMonth)})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daromad va xarajatlar nisbati, kommunal dinamikasi va maqsadlar tahlili
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right">
          <span className="text-[11px] font-semibold text-slate-500 block">Oylik sof jamgʻarma koʻrsatkichi:</span>
          <span
            className={`text-lg font-extrabold ${
              savingsRate >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {savingsRate}% ({formatUZS(netSavings)})
          </span>
        </div>
      </div>

      {/* Grid: Income vs Expenses & Outflows Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outflow Distribution Bars */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Xarajatlar oqimi taqsimoti
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Barcha sarf-xarajatlarning umumiy chiqimdagi ulushi
          </p>

          <div className="space-y-4">
            {/* Everyday expenses */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-rose-500" />
                  Kundalik xarajatlar
                </span>
                <span>
                  {formatUZS(summary.totalExpenses)} (
                  {totalOutflows > 0 ? Math.round((summary.totalExpenses / totalOutflows) * 100) : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
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
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Kommunal toʻlovlar
                </span>
                <span>
                  {formatUZS(summary.totalUtilities)} (
                  {totalOutflows > 0 ? Math.round((summary.totalUtilities / totalOutflows) * 100) : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
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
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  Soliqlar va majburiy toʻlovlar
                </span>
                <span>
                  {formatUZS(summary.totalMandatory)} (
                  {totalOutflows > 0 ? Math.round((summary.totalMandatory / totalOutflows) * 100) : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
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
              <div className="flex justify-between text-xs font-semibold text-emerald-800 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Sof zaxira (Jamgʻarma / Maqsad)
                </span>
                <span>{formatUZS(netSavings)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-emerald-100 overflow-hidden">
                <div
                  style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
                  className="h-full bg-emerald-600 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expense Categories Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Kundalik xarajatlar toifalari boʻyicha
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Qaysi sohalarga eng koʻp pul sarflanganligi tahlili
          </p>

          {sortedExpenseCats.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Bu oyda xarajatlar kiritilmagan
            </div>
          ) : (
            <div className="space-y-3">
              {sortedExpenseCats.map(([catKey, sum]) => {
                const meta = EXPENSE_CATEGORY_LABELS[catKey] || { label: catKey };
                const pct = summary.totalExpenses > 0 ? Math.round((sum / summary.totalExpenses) * 100) : 0;

                return (
                  <div key={catKey}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">{meta.label}</span>
                      <span className="font-bold text-slate-900">
                        {formatUZS(sum)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-slate-800 rounded-full transition-all"
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
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Kommunal xizmatlar taqsimoti
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Jami: {formatUZS(summary.totalUtilities)}
          </p>

          <div className="space-y-3">
            {monthUtilities.map((u) => {
              const meta = UTILITY_CATEGORY_LABELS[u.category] || { label: u.category };
              const pct = summary.totalUtilities > 0 ? Math.round((u.amount / summary.totalUtilities) * 100) : 0;

              return (
                <div key={u.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{meta.label}</span>
                    <span className="text-[11px] text-slate-500 block">
                      {u.isPaid ? '✓ Toʻlangan' : '⏳ Toʻlanmagan'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{formatUZS(u.amount)}</span>
                    <span className="text-[11px] text-slate-400">{pct}% ulush</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goal Progress Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Moliyaviy maqsadlar bajarilishi
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Barcha roʻyxatga olingan maqsadlar va ularning jamgʻarilish holati
          </p>

          <div className="space-y-3.5">
            {goals.map((g) => {
              const progress = Math.min(100, Math.round((g.currentSavedAmount / Math.max(1, g.targetAmount)) * 100));
              return (
                <div key={g.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex justify-between text-xs font-bold text-slate-900 mb-1">
                    <span>{g.name}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mb-2">
                    <div
                      style={{ width: `${progress}%` }}
                      className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Yigʻildi: {formatUZS(g.currentSavedAmount)}</span>
                    <span>Reja: {formatUZS(g.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
