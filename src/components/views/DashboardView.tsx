import React, { useState } from 'react';
import {
  TrendingUp,
  Receipt,
  Zap,
  ShieldCheck,
  Target,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Users,
  User,
  Home,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { ContributeGoalModal } from '../modals/ContributeGoalModal';
import { FinancialGoal } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    currentMonth,
    summary,
    goals,
    incomes,
    expenses,
    utilities,
    mandatoryPayments,
    setActiveTab,
    setExpensesSubTab,
    upcomingPayments,
    openModal,
    contributeToGoal,
    family,
    familyMembers,
    familySummary,
    activeFamilyMembers,
  } = useFinance();

  const { t, formatCurrency, formatMonth } = useLanguage();

  const [contributeGoal, setContributeGoal] = useState<FinancialGoal | null>(null);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');

  // Selected member data if filtered
  const selectedMember = familyMembers.find((m) => m.id === selectedMemberFilter);
  const selectedMemberData = familySummary.memberBreakdown.find(
    (b) => b.memberId === selectedMemberFilter
  );

  // Active goals targeting this month or active overall (filtered by member if selected)
  const activeGoals = goals.filter((g) => {
    if (g.status === 'completed') return false;
    if (selectedMemberFilter === 'all') return true;
    return g.memberId === selectedMemberFilter;
  });

  // Upcoming payments filtered if member selected
  const displayUpcomingPayments = upcomingPayments.filter((item) => {
    if (selectedMemberFilter === 'all') return true;
    return item.memberId === selectedMemberFilter || !item.memberId;
  });

  // Overall financial inflow vs outflows (dynamically adjusts if member filtered)
  const displayTotalIncome = selectedMemberData
    ? selectedMemberData.income
    : summary.totalIncome;

  const displayTotalExpenses = selectedMemberData
    ? selectedMemberData.everydayExpenses
    : summary.totalExpenses;

  const displayMandatoryAndUtilities = selectedMemberData
    ? selectedMemberData.mandatory + selectedMemberData.utilities
    : summary.totalMandatory + summary.totalUtilities;

  const displayGoalReserve = selectedMemberFilter === 'all'
    ? summary.goalReserve
    : activeGoals.reduce((acc, cur) => acc + (cur.monthlyTargetSavings || 0), 0);

  const displayTotalOutflows = displayTotalExpenses + displayMandatoryAndUtilities;
  const displayNetSavings = displayTotalIncome - displayTotalOutflows;
  const displaySavingsRate = displayTotalIncome > 0
    ? Math.round((displayNetSavings / displayTotalIncome) * 100)
    : 0;

  // Safe to spend dynamic calculation
  const displaySafeDaily = selectedMemberData
    ? (selectedMemberData.safeToSpendShare?.daily ?? Math.round(Math.max(0, displayNetSavings) / 30))
    : summary.safeToSpendDaily;

  const displaySafeWeekly = selectedMemberData
    ? (selectedMemberData.safeToSpendShare?.weekly ?? Math.round(Math.max(0, displayNetSavings) / 4))
    : summary.safeToSpendWeekly;

  const displaySafeMonth = selectedMemberData
    ? (selectedMemberData.safeToSpendShare?.monthly ?? displayNetSavings)
    : summary.remainingSafeToSpendMonth;

  // Calculation percentage helpers
  const totalInflow = Math.max(1, displayTotalIncome);
  const expensePercent = Math.min(100, Math.round((displayTotalExpenses / totalInflow) * 100));
  const utilitiesPercent = Math.min(
    100,
    Math.round(((selectedMemberData ? selectedMemberData.utilities : summary.totalUtilities) / totalInflow) * 100)
  );
  const mandatoryPercent = Math.min(
    100,
    Math.round(((selectedMemberData ? selectedMemberData.mandatory : summary.totalMandatory) / totalInflow) * 100)
  );
  const goalReservePercent = Math.min(100, Math.round((displayGoalReserve / totalInflow) * 100));
  const remainingPercent = Math.max(
    0,
    100 - (expensePercent + utilitiesPercent + mandatoryPercent + goalReservePercent)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* 0. HOUSEHOLD FAMILY CONTROL & MEMBER FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {family.name || t('family_title')}
              </h2>
              {activeFamilyMembers.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/70 dark:border-emerald-800/70">
                  {activeFamilyMembers.length} {t('family_members_count')}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                {t('family_balance')}: {formatCurrency(familySummary.familyBalance)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('app_subtitle')}
            </p>
          </div>
        </div>

        {/* Member Selector Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedMemberFilter('all')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedMemberFilter === 'all'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('family_all')}</span>
          </button>

          {familyMembers.map((m) => {
            const isSel = selectedMemberFilter === m.id;
            const b = familySummary.memberBreakdown.find((x) => x.memberId === m.id);
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMemberFilter(m.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSel
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: m.active ? (isSel ? '#ffffff' : '#10b981') : '#94a3b8' }}
                />
                <span>{m.name}</span>
                {b && (
                  <span className={`text-[10px] opacity-90 ${isSel ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    ({formatCurrency(b.income)})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Member Active Notification Banner if filtered */}
      {selectedMember && (
        <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl px-5 py-3 flex items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {t('member_filtered_note')} <strong>{selectedMember.name}</strong>
            </span>
          </div>
          <button
            onClick={() => setSelectedMemberFilter('all')}
            className="font-bold underline text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white"
          >
            {t('family_all')} →
          </button>
        </div>
      )}

      {/* 1. HERO BANNER: The Most Important Visual Element -> SAFE TO SPEND */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {selectedMember ? `${selectedMember.name}` : t('hero_safe_spend')} • {formatMonth(currentMonth)}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t('hero_safe_spend')}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {t('hero_safe_spend_desc')}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('goals')}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto whitespace-nowrap cursor-pointer"
            >
              <span>{t('hero_view_goals')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Core Velocity Cards: Today, This Week, This Month */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Today */}
            <div className="bg-slate-800/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-700/80">
              <div className="text-xs font-medium text-slate-400 mb-1">{t('card_safe_today')}:</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {formatCurrency(displaySafeDaily)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('card_safe_today_desc')}</span>
              </div>
            </div>

            {/* This week */}
            <div className="bg-slate-800/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-700/80">
              <div className="text-xs font-medium text-slate-400 mb-1">{t('card_safe_week')}:</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                {formatCurrency(displaySafeWeekly)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t('card_safe_week_desc')}</span>
              </div>
            </div>

            {/* This month */}
            <div className="bg-slate-800/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-700/80">
              <div className="text-xs font-medium text-slate-400 mb-1">{t('card_safe_month')}:</div>
              <div
                className={`text-2xl sm:text-3xl font-extrabold ${
                  displaySafeMonth >= 0 ? 'text-white' : 'text-rose-400'
                }`}
              >
                {formatCurrency(displaySafeMonth)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t('card_safe_month_desc')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unpaid Bills Alert if any */}
      {summary.totalUnpaidBillsCount > 0 && selectedMemberFilter === 'all' && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">
                {t('unpaid_bills_alert')}: {summary.totalUnpaidBillsCount} ({formatCurrency(summary.totalUnpaidBillsAmount)})
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300/80 mt-0.5">
                {t('unpaid_bills_desc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('expenses')}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            {t('btn_view_details')}
          </button>
        </div>
      )}

      {/* 2. THE 4 CORE FINANCIAL PILLARS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('pillar_incomes')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(displayTotalIncome)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              {selectedMember
                ? `${selectedMember.name}`
                : `${incomes.length} ${t('pillar_sources')}`}
            </span>
            <button
              onClick={() => setActiveTab('income')}
              className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline text-[11px]"
            >
              {t('nav_incomes')} →
            </button>
          </div>
        </div>

        {/* Total Everyday expenses */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('pillar_expenses')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(displayTotalExpenses)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              {selectedMember
                ? `${selectedMember.name}`
                : `${expenses.length} ${t('pillar_transactions')}`}
            </span>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-rose-700 dark:text-rose-400 font-medium hover:underline text-[11px]"
            >
              {t('nav_expenses')} →
            </button>
          </div>
        </div>

        {/* Mandatory & Utilities */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('pillar_mandatory')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(displayMandatoryAndUtilities)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              {mandatoryPayments.length + utilities.length} {t('pillar_obligations')}
            </span>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-blue-700 dark:text-blue-400 font-medium hover:underline text-[11px]"
            >
              {t('btn_view_details')} →
            </button>
          </div>
        </div>

        {/* Goal Reserve */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('pillar_goals')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(displayGoalReserve)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{activeGoals.length} {t('pillar_active_goals')}</span>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-indigo-700 dark:text-indigo-400 font-medium hover:underline text-[11px]"
            >
              {t('nav_goals')} →
            </button>
          </div>
        </div>
      </div>

      {/* 2.5 FAMILY MEMBERS FINANCIAL CONTRIBUTION BREAKDOWN */}
      {familyMembers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t('family_breakdown_title')}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('family_breakdown_desc')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 dark:text-slate-500 block">{t('family_balance')}:</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(familySummary.familyBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Member cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {familySummary.memberBreakdown.map((item) => {
              const memberFilterKey = item.memberId ?? 'family';
              const isSelected = selectedMemberFilter === memberFilterKey;
              return (
                <div
                  key={memberFilterKey}
                  onClick={() => setSelectedMemberFilter(isSelected ? 'all' : memberFilterKey)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                          {item.memberName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                            {item.memberName}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.memberRole || 'Oila'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          item.isActive
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.isActive ? 'Faol' : 'Nofaol'}
                      </span>
                    </div>

                    <div className="space-y-2 py-2 border-t border-b border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          {t('pillar_incomes')}:
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.income)} ({item.percentOfTotalIncome}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          {t('pillar_expenses')}:
                        </span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(item.totalExpenses)} ({item.percentOfTotalExpenses}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{t('family_balance')}:</span>
                    <span
                      className={`font-extrabold ${
                        item.netBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatCurrency(item.netBalance)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. UPCOMING PAYMENTS & OBLIGATIONS BLOCK */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('upcoming_payments_title')}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold text-xs">
                {displayUpcomingPayments.length} {t('upcoming_waiting')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('upcoming_payments_desc')}
            </p>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t('upcoming_safe_reserved')}</span>
          </div>
        </div>

        {displayUpcomingPayments.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1.5" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('upcoming_empty')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayUpcomingPayments.slice(0, 6).map((item) => {
              const isTax = item.type === 'tax';
              const isGoal = item.type === 'goal';

              let borderColor = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700';
              let bgColor = 'bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70';
              let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200';
              let iconNode = '📌';
              let badgeText = 'Majburiyat';

              if (isTax) {
                borderColor = 'border-rose-200 dark:border-rose-900 hover:border-rose-300';
                bgColor = 'bg-rose-50/20 dark:bg-rose-950/20 hover:bg-rose-50/50';
                badgeColor = 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 font-bold';
                iconNode = '⚠️';
                badgeText = 'Soliq';
              } else if (item.type === 'utility') {
                borderColor = 'border-amber-200 dark:border-amber-900 hover:border-amber-300';
                bgColor = 'bg-amber-50/20 dark:bg-amber-950/20 hover:bg-amber-50/50';
                badgeColor = 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-bold';
                iconNode = '🟡';
                badgeText = 'Kommunal';
              } else if (isGoal) {
                borderColor = 'border-indigo-200 dark:border-indigo-900 hover:border-indigo-300';
                bgColor = 'bg-indigo-50/20 dark:bg-indigo-950/20 hover:bg-indigo-50/50';
                badgeColor = 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 font-bold';
                iconNode = '🔵';
                badgeText = 'Maqsad';
              }

              const assignedMember = item.memberId
                ? familyMembers.find((m) => m.id === item.memberId)
                : null;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isGoal) {
                      setActiveTab('goals');
                    } else if (isTax) {
                      setExpensesSubTab('mandatory');
                      setActiveTab('expenses');
                    } else {
                      setExpensesSubTab('utilities');
                      setActiveTab('expenses');
                    }
                  }}
                  className={`p-4 rounded-xl border ${borderColor} ${bgColor} transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-xs`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base select-none">{iconNode}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] ${badgeColor}`}>
                          {badgeText}
                        </span>
                        {assignedMember ? (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            {assignedMember.name}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                            {t('family_title')}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.badgeColorClass}`}>
                        {item.statusLabel}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors line-clamp-1">
                      {item.title}
                    </h4>

                    <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {item.dueDateLabel}
                    </span>

                    <span className="text-slate-700 dark:text-slate-300 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
                      {t('btn_view_details')} →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. SIMPLE MONTHLY FINANCIAL SUMMARY & ALLOCATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Monthly Inflow Allocation & Balance */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('monthly_balance_title')} ({formatMonth(currentMonth)})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('monthly_balance_desc')}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 dark:text-slate-500 block">{t('card_safe_month')}:</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(displaySafeMonth)}
              </span>
            </div>
          </div>

          {/* Allocation Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>{t('monthly_allocation')}</span>
              <span>100% ({formatCurrency(displayTotalIncome)})</span>
            </div>

            <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
              <div
                style={{ width: `${expensePercent}%` }}
                className="h-full bg-rose-500 transition-all duration-500"
              />
              <div
                style={{ width: `${utilitiesPercent}%` }}
                className="h-full bg-amber-500 transition-all duration-500"
              />
              <div
                style={{ width: `${mandatoryPercent}%` }}
                className="h-full bg-blue-500 transition-all duration-500"
              />
              <div
                style={{ width: `${goalReservePercent}%` }}
                className="h-full bg-indigo-500 transition-all duration-500"
              />
              <div
                style={{ width: `${remainingPercent}%` }}
                className="h-full bg-emerald-500 transition-all duration-500"
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                <span>{t('pillar_expenses')}: {formatCurrency(displayTotalExpenses)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span>Kommunal: {formatCurrency(selectedMemberData ? selectedMemberData.utilities : summary.totalUtilities)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                <span>{t('pillar_mandatory')}: {formatCurrency(selectedMemberData ? selectedMemberData.mandatory : summary.totalMandatory)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
                <span>{t('pillar_goals')}: {formatCurrency(displayGoalReserve)}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <span>{t('card_safe_month')}: {formatCurrency(displaySafeMonth)}</span>
              </div>
            </div>
          </div>

          {/* Income vs Outflows Comparison Report */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {t('monthly_savings_rate')}
              </span>
              <div
                className={`text-xl font-extrabold mt-1 ${
                  displaySavingsRate >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {displaySavingsRate}% ({formatCurrency(displayNetSavings)})
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {t('monthly_outflows_share')}
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {formatCurrency(displayTotalOutflows)}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 col: Current Goals Quick Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{t('goals_active_title')}</span>
              </h3>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {t('btn_view_details')} ({goals.length})
              </button>
            </div>

            {activeGoals.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                <Target className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                <p className="text-xs font-medium">{t('goals_empty')}</p>
                <button
                  onClick={() => openModal('goal')}
                  className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + {t('btn_add_goal')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeGoals.slice(0, 3).map((goal) => {
                  const percent = Math.min(
                    100,
                    Math.round((goal.currentSavedAmount / Math.max(1, goal.targetAmount)) * 100)
                  );
                  const goalMember = goal.memberId
                    ? familyMembers.find((m) => m.id === goal.memberId)
                    : null;

                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{goal.name}</span>
                          {goalMember && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                              {goalMember.name}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 font-bold">{percent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-indigo-500 rounded-full"
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{formatCurrency(goal.currentSavedAmount)}</span>
                        <span>{formatCurrency(goal.targetAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={() => setActiveTab('goals')}
              className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200/80 dark:border-slate-700 cursor-pointer"
            >
              <span>{t('nav_goals')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Contribute Modal if triggered */}
      {contributeGoal && (
        <ContributeGoalModal
          goal={contributeGoal}
          onClose={() => setContributeGoal(null)}
          onContribute={(goalId, amount) => {
            contributeToGoal(goalId, amount);
            setContributeGoal(null);
          }}
        />
      )}
    </div>
  );
};
