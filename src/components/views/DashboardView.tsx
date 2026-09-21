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
  BarChart3,
  PieChart,
  Coins,
  Shield,
  Users,
  User,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatUZS, formatMonthName, GOAL_STATUS_LABELS } from '../../utils/formatters';
import { ContributeGoalModal } from '../modals/ContributeGoalModal';
import { FinancialGoal } from '../../types';

const ROLE_LABELS: Record<string, string> = {
  head: 'Oila boshligʻi',
  adult: 'Katta aʼzo',
  child: 'Farzand',
  other: 'Boshqa aʼzo',
};

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
    setSelectedPlannerGoalId,
    openModal,
    contributeToGoal,
    family,
    familyMembers,
    familySummary,
    activeFamilyMembers,
  } = useFinance();

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 0. HOUSEHOLD FAMILY CONTROL & MEMBER FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {family.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/70">
                {activeFamilyMembers.length} aʼzo faol
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                Oila balansi: {formatUZS(familySummary.familyBalance)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Oilaviy moliya va shaxsiy hisob-kitoblarning integratsiyalashgan boshqaruvi
            </p>
          </div>
        </div>

        {/* Member Selector Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedMemberFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedMemberFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Barcha oila</span>
          </button>

          {familyMembers.map((m) => {
            const isSel = selectedMemberFilter === m.id;
            const b = familySummary.memberBreakdown.find((x) => x.memberId === m.id);
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMemberFilter(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: m.active ? (isSel ? '#ffffff' : '#10b981') : '#94a3b8' }}
                />
                <span>{m.name}</span>
                {b && (
                  <span className={`text-[10px] opacity-90 ${isSel ? 'text-white' : 'text-slate-500'}`}>
                    ({formatUZS(b.income, false)})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Member Active Notification Banner if filtered */}
      {selectedMember && (
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl px-5 py-3 flex items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Hozir <strong>{selectedMember.name}</strong> ({ROLE_LABELS[selectedMember.role] || selectedMember.role}) koʻrsatkichlari filtrlandi.
            </span>
          </div>
          <button
            onClick={() => setSelectedMemberFilter('all')}
            className="font-bold underline text-emerald-800 hover:text-emerald-950"
          >
            Barcha oila koʻrinishiga qaytish
          </button>
        </div>
      )}

      {/* 1. HERO BANNER: The Most Important Visual Element -> SAFE TO SPEND */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {selectedMember ? `${selectedMember.name} uchun hisob` : 'Oilaviy xavfsiz meʼyor'} • {formatMonthName(currentMonth)}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Xavfsiz sarflash darajasi (Safe-to-Spend)
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {selectedMember
                  ? `${selectedMember.name}ning daromadlari, xarajatlari va unga yuklangan majburiyatlar asosida hisoblangan xavfsiz sarflash summasi.`
                  : 'Majburiy toʻlovlar, kommunal hisoblar va jamgʻarma maqsadlaringizga xalaqit bermasdan butun oila uchun sarflanishi mumkin boʻlgan kafolatlangan mablagʻ.'}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('goals')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto whitespace-nowrap"
            >
              <span>Maqsadlarni koʻrish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Core Velocity Cards: Today, This Week, This Month */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Today */}
            <div className="bg-slate-800/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-700/80">
              <div className="text-xs font-medium text-slate-400 mb-1">Bugun xavfsiz sarflash:</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {formatUZS(displaySafeDaily)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Kunlik tavsiya etilgan xavfsiz limit</span>
              </div>
            </div>

            {/* This week */}
            <div className="bg-slate-800/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-700/80">
              <div className="text-xs font-medium text-slate-400 mb-1">Bu hafta xavfsiz sarflash:</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                {formatUZS(displaySafeWeekly)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Haftalik limitni oshirmaslik tavsiya etiladi</span>
              </div>
            </div>

            {/* This month */}
            <div className="bg-slate-800/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-700/80">
              <div className="text-xs font-medium text-slate-400 mb-1">Bu oy boʻyicha erkin zaxira:</div>
              <div
                className={`text-2xl sm:text-3xl font-extrabold ${
                  displaySafeMonth >= 0 ? 'text-white' : 'text-rose-400'
                }`}
              >
                {formatUZS(displaySafeMonth)}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Barcha toʻlovlar va maqsad zaxirasidan soʻng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unpaid Bills Alert if any */}
      {summary.totalUnpaidBillsCount > 0 && selectedMemberFilter === 'all' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">
                Toʻlanmagan majburiyatlar mavjud: {summary.totalUnpaidBillsCount} ta ({formatUZS(summary.totalUnpaidBillsAmount)})
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Kommunal xizmatlar yoki majburiy soliqlarni oʻz vaqtida toʻlash xavfsiz sarflash hisob-kitobini aniq saqlaydi.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('expenses')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
          >
            Xarajatlar boʻlimida koʻrish
          </button>
        </div>
      )}

      {/* 2. THE 4 CORE FINANCIAL PILLARS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {selectedMember ? `${selectedMember.name} daromadi` : 'Oila jami daromadi'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {formatUZS(displayTotalIncome)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              {selectedMember
                ? `Oila daromadining ${selectedMemberData?.percentOfTotalIncome || 0}% qismi`
                : `${incomes.length} ta manba`}
            </span>
            <button
              onClick={() => setActiveTab('income')}
              className="text-emerald-700 font-medium hover:underline text-[11px]"
            >
              Daromadlar →
            </button>
          </div>
        </div>

        {/* Total Outflows (Everyday expenses) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {selectedMember ? `${selectedMember.name} xarajatlari` : 'Kundalik xarajatlar'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {formatUZS(displayTotalExpenses)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              {selectedMember
                ? `Oila xarajatining ${selectedMemberData?.percentOfTotalExpenses || 0}% qismi`
                : `${expenses.length} ta xarid`}
            </span>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-rose-700 font-medium hover:underline text-[11px]"
            >
              Xarajatlar →
            </button>
          </div>
        </div>

        {/* Mandatory & Utilities */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Majburiy & Kommunal
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {formatUZS(displayMandatoryAndUtilities)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              {selectedMember
                ? `${selectedMember.name}ga biriktirilgan`
                : `${mandatoryPayments.length + utilities.length} ta majburiyat`}
            </span>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-blue-700 font-medium hover:underline text-[11px]"
            >
              Tafsilotlar →
            </button>
          </div>
        </div>

        {/* Goal Reserve */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Maqsadlar zaxirasi
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-indigo-600">
            {formatUZS(displayGoalReserve)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{activeGoals.length} ta faol maqsad</span>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-indigo-700 font-medium hover:underline text-[11px]"
            >
              Maqsadlar →
            </button>
          </div>
        </div>
      </div>

      {/* 2.5 FAMILY MEMBERS FINANCIAL CONTRIBUTION BREAKDOWN */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Oila Aʼzolari Boʻyicha Moliyaviy Taqsimot
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Har bir oila aʼzosining jami daromadga hissasi, xarajatlari va sof moliyaviy balansi
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Jami oila sof balansi:</span>
              <span className="text-base font-extrabold text-emerald-600">
                {formatUZS(familySummary.familyBalance)}
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
                    ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                    : 'border-slate-200/90 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {item.memberName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {item.memberName}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {(item.memberRole && ROLE_LABELS[item.memberRole]) || item.memberRole || 'Oila'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        item.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>

                  <div className="space-y-2 py-2 border-t border-b border-slate-100 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                        Daromad hissasi:
                      </span>
                      <span className="font-bold text-emerald-600">
                        {formatUZS(item.income)} ({item.percentOfTotalIncome}%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1">
                        <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                        Xarajatlar hissasi:
                      </span>
                      <span className="font-bold text-rose-600">
                        {formatUZS(item.totalExpenses)} ({item.percentOfTotalExpenses}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Sof qoldiq:</span>
                  <span
                    className={`font-extrabold ${
                      item.netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {formatUZS(item.netBalance)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Unassigned Family Expenses / Inflows if any */}
          {(familySummary.unassignedIncome > 0 || familySummary.unassignedExpenses > 0) && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      Umumiy oilaviy xarajatlar
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Hech bir aʼzoga bogʻlanmagan
                    </span>
                  </div>
                </div>

                <div className="space-y-2 py-2 border-t border-b border-slate-200/70 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Umumiy daromad:</span>
                    <span className="font-bold text-emerald-600">
                      {formatUZS(familySummary.unassignedIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Umumiy xarajatlar:</span>
                    <span className="font-bold text-rose-600">
                      {formatUZS(familySummary.unassignedExpenses)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Umumiy chiqim:</span>
                <span className="font-bold text-slate-700">
                  {formatUZS(familySummary.unassignedExpenses)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. UPCOMING PAYMENTS & OBLIGATIONS BLOCK ("Yaqinlashayotgan to‘lovlar") */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Yaqinlashayotgan to‘lovlar
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                {displayUpcomingPayments.length} ta kutilayotgan
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Soliqlar, kommunal to‘lovlar va maqsad zaxiralarining to‘lov muddatlari va holati
            </p>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>To‘lovlar <strong>Safe to Spend</strong> hisobidan avtomatik zaxiralangan</span>
          </div>
        </div>

        {displayUpcomingPayments.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1.5" />
            <p className="text-xs font-semibold text-slate-700">
              {selectedMember
                ? `${selectedMember.name} uchun toʻlanmagan majburiyatlar topilmadi!`
                : 'Ushbu oy uchun barcha majburiy to‘lovlar to‘langan!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayUpcomingPayments.slice(0, 6).map((item) => {
              const isTax = item.type === 'tax';
              const isUtil = item.type === 'utility';
              const isGoal = item.type === 'goal';

              let borderColor = 'border-slate-200/90 hover:border-slate-300';
              let bgColor = 'bg-slate-50/50 hover:bg-slate-50';
              let badgeColor = 'bg-slate-100 text-slate-800';
              let iconNode = '📌';
              let badgeText = 'Majburiyat';

              if (isTax) {
                borderColor = 'border-rose-200 hover:border-rose-300';
                bgColor = 'bg-rose-50/20 hover:bg-rose-50/50';
                badgeColor = 'bg-rose-100 text-rose-800 border border-rose-200 font-bold';
                iconNode = '⚠️';
                badgeText = 'Soliq';
              } else if (isUtil) {
                borderColor = 'border-amber-200 hover:border-amber-300';
                bgColor = 'bg-amber-50/20 hover:bg-amber-50/50';
                badgeColor = 'bg-amber-100 text-amber-900 border border-amber-200 font-bold';
                iconNode = '🟡';
                badgeText = 'Elektr / Kommunal';
              } else if (isGoal) {
                borderColor = 'border-indigo-200 hover:border-indigo-300';
                bgColor = 'bg-indigo-50/20 hover:bg-indigo-50/50';
                badgeColor = 'bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold';
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
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 font-medium">
                            {assignedMember.name}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-500 font-medium">
                            Oilaviy
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.badgeColorClass}`}>
                        {item.statusLabel}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-slate-950 transition-colors line-clamp-1">
                      {item.title}
                    </h4>

                    <div className="mt-2 text-xl font-extrabold text-slate-900 tracking-tight">
                      {formatUZS(item.amount)}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.dueDateLabel}
                    </span>

                    <span className="text-slate-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
                      {isTax ? 'Soliqlarga o‘tish' : isUtil ? 'Kommunalga o‘tish' : 'Maqsadga o‘tish'} →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. SIMPLE MONTHLY FINANCIAL SUMMARY & INTEGRATED REPORTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Monthly Inflow Allocation & Balance */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Oylik Moliyaviy Balans ({formatMonthName(currentMonth)})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daromad, majburiyatlar va jamgʻarmaning toʻliq taqsimoti
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Kafolatlangan erkin qoldiq:</span>
              <span className="text-base font-extrabold text-emerald-600">
                {formatUZS(displaySafeMonth)}
              </span>
            </div>
          </div>

          {/* Allocation Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Daromadning sarflanish taqsimoti</span>
              <span>100% ({formatUZS(displayTotalIncome)})</span>
            </div>

            <div className="w-full h-4 rounded-full bg-slate-100 flex overflow-hidden">
              {/* Everyday expenses */}
              <div
                style={{ width: `${expensePercent}%` }}
                className="h-full bg-rose-500 transition-all duration-500"
                title={`Kundalik xarajatlar: ${expensePercent}%`}
              />
              {/* Utilities */}
              <div
                style={{ width: `${utilitiesPercent}%` }}
                className="h-full bg-amber-500 transition-all duration-500"
                title={`Kommunal toʻlovlar: ${utilitiesPercent}%`}
              />
              {/* Mandatory */}
              <div
                style={{ width: `${mandatoryPercent}%` }}
                className="h-full bg-blue-500 transition-all duration-500"
                title={`Soliq va majburiy: ${mandatoryPercent}%`}
              />
              {/* Goal reserve */}
              <div
                style={{ width: `${goalReservePercent}%` }}
                className="h-full bg-indigo-500 transition-all duration-500"
                title={`Maqsadlar zaxirasi: ${goalReservePercent}%`}
              />
              {/* Remaining safe */}
              <div
                style={{ width: `${remainingPercent}%` }}
                className="h-full bg-emerald-500 transition-all duration-500"
                title={`Erkin qoldiq: ${remainingPercent}%`}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                <span>Kundalik: {formatUZS(displayTotalExpenses)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span>Kommunal: {formatUZS(selectedMemberData ? selectedMemberData.utilities : summary.totalUtilities)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                <span>Majburiy: {formatUZS(selectedMemberData ? selectedMemberData.mandatory : summary.totalMandatory)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
                <span>Maqsadlar: {formatUZS(displayGoalReserve)}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <span>Erkin: {formatUZS(displaySafeMonth)}</span>
              </div>
            </div>
          </div>

          {/* Income vs Outflows Comparison Report */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Sof oylik tejov (Savings rate)
              </span>
              <div
                className={`text-xl font-extrabold mt-1 ${
                  displaySavingsRate >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {displaySavingsRate}% ({formatUZS(displayNetSavings)})
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Jami daromaddan barcha chiqimlar ayrilgandan keyin
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Chiqimlar ulushi
              </span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {formatUZS(displayTotalOutflows)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Daromadning {displayTotalIncome > 0 ? Math.round((displayTotalOutflows / displayTotalIncome) * 100) : 0}% qismi sarflanadi
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 col: Current Goals Quick Progress */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Joriy maqsadlar</span>
              </h3>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Barchasi ({goals.length})
              </button>
            </div>

            {activeGoals.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Target className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs font-medium">Faol maqsadlar topilmadi</p>
                <button
                  onClick={() => openModal('goal')}
                  className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
                >
                  + Yangi maqsad qoʻshish
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
                          <span className="font-semibold text-slate-800">{goal.name}</span>
                          {goalMember && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                              {goalMember.name}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 font-bold">{percent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-indigo-500 rounded-full"
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Jamgʻarildi: {formatUZS(goal.currentSavedAmount)}</span>
                        <span>Maqsad: {formatUZS(goal.targetAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setActiveTab('goals')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200/80"
            >
              <span>Maqsadlarni rejalashtirish boʻlimi</span>
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

