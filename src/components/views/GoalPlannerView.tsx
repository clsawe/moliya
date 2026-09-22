import React, { useState, useMemo } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertOctagon,
  Scissors,
  PlusCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { analyzeGoalPlan } from '../../engine/financeCalculations';

export const GoalPlannerView: React.FC = () => {
  const {
    goals,
    selectedPlannerGoalId,
    setSelectedPlannerGoalId,
    summary,
    currentMonth,
    addIncome,
  } = useFinance();

  const { t, formatCurrency } = useLanguage();

  // Selected existing goal or custom
  const selectedGoal = goals.find((g) => g.id === selectedPlannerGoalId);

  // User input states (prefilled with selected goal or custom 1,000,000 UZS)
  const [goalName, setGoalName] = useState(() => selectedGoal?.name || 'Telefon sotib olish');
  const [targetAmountStr, setTargetAmountStr] = useState(() =>
    (selectedGoal?.targetAmount || 1000000).toLocaleString('ru-RU')
  );

  // What-if interactive adjustment sliders for user simulation
  const [simulatedIncomeAdd, setSimulatedIncomeAdd] = useState(0);
  const [simulatedExpenseCut, setSimulatedExpenseCut] = useState(0);

  const rawTargetAmount = parseInt(targetAmountStr.replace(/[^\d]/g, ''), 10) || 0;

  // When selected goal changes from dropdown
  const handleSelectGoal = (goalId: string) => {
    setSelectedPlannerGoalId(goalId);
    const g = goals.find((item) => item.id === goalId);
    if (g) {
      setGoalName(g.name);
      setTargetAmountStr(g.targetAmount.toLocaleString('ru-RU'));
      setSimulatedIncomeAdd(0);
      setSimulatedExpenseCut(0);
    }
  };

  // Base plan analysis using current real data
  const basePlan = useMemo(() => {
    return analyzeGoalPlan(rawTargetAmount, goalName, currentMonth, summary);
  }, [rawTargetAmount, goalName, currentMonth, summary]);

  // Adjusted plan analysis if user is testing simulated levers
  const adjustedSummary = useMemo(() => {
    const adjustedTotalIncome = summary.totalIncome + simulatedIncomeAdd;
    const adjustedTotalExpenses = Math.max(0, summary.totalExpenses - simulatedExpenseCut);
    const adjustedAvailableMoney =
      adjustedTotalIncome - (adjustedTotalExpenses + summary.totalUtilities + summary.totalMandatory);

    return {
      ...summary,
      totalIncome: adjustedTotalIncome,
      totalExpenses: adjustedTotalExpenses,
      availableMoney: adjustedAvailableMoney,
      safeToSpendRemainingMonth: adjustedAvailableMoney,
    };
  }, [summary, simulatedIncomeAdd, simulatedExpenseCut]);

  const simulatedPlan = useMemo(() => {
    if (simulatedIncomeAdd === 0 && simulatedExpenseCut === 0) return null;
    return analyzeGoalPlan(rawTargetAmount, goalName, currentMonth, adjustedSummary);
  }, [rawTargetAmount, goalName, currentMonth, adjustedSummary, simulatedIncomeAdd, simulatedExpenseCut]);

  const activeDisplayPlan = simulatedPlan || basePlan;
  const hasActiveSimulations = simulatedIncomeAdd > 0 || simulatedExpenseCut > 0;

  // Apply simulated income into real context
  const applyIncomeAdjustment = () => {
    if (simulatedIncomeAdd <= 0) return;
    addIncome({
      name: `Qoʻshimcha tushum («${goalName}» uchun)`,
      amount: simulatedIncomeAdd,
      date: `${currentMonth}-15`,
      category: 'other',
      isRecurring: false,
      notes: 'Maqsad rejalashtirgich orqali rejalashtirilgan qoʻshimcha daromad',
    });
    setSimulatedIncomeAdd(0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Flagship Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-200/60 dark:border-emerald-800">
              <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('goals_planner_tab')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('goals_planner_tab')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Katta xarajatlar va maqsadlar uchun xavfsiz tejash va muddat hisob-kitobi.
            </p>
          </div>

          {/* Existing Goals Picker Dropdown */}
          {goals.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Mavjud maqsadni tanlash:
              </span>
              <select
                value={selectedPlannerGoalId || ''}
                onChange={(e) => handleSelectGoal(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({formatCurrency(g.targetAmount)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Input Target Bar & Fast Test Scenarios */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Xarid yoki maqsad nomi:
            </label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="Masalan: Telefon sotib olish"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="md:col-span-6">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Maqsad summasi (soʻmda):
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetAmountStr}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setTargetAmountStr(val ? parseInt(val, 10).toLocaleString('ru-RU') : '');
                }}
                placeholder="1 000 000"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-base font-extrabold rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <span className="absolute right-3.5 top-3 text-xs font-semibold text-slate-400 select-none">
                UZS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Achievability Result Box */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition-all ${
          activeDisplayPlan.isAchievable
            ? 'bg-gradient-to-br from-emerald-900 to-slate-900 text-white border-emerald-800'
            : 'bg-gradient-to-br from-rose-950 to-slate-900 text-white border-rose-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                activeDisplayPlan.isAchievable
                  ? 'bg-emerald-500 text-slate-950 shadow-lg'
                  : 'bg-rose-500 text-white shadow-lg'
              }`}
            >
              {activeDisplayPlan.isAchievable ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <AlertOctagon className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider font-bold opacity-80 mb-1">
                Hisob-kitob xulosasi:
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {activeDisplayPlan.statusText}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
                {activeDisplayPlan.isAchievable
                  ? `Siz bu oyda boshqa majburiyatlaringizni buzmagan holda «${goalName}» uchun ${formatCurrency(
                      rawTargetAmount
                    )} ajrata olasiz.`
                  : `Joriy reja ushbu maqsadni toʻliq qoplashga yetarli emas. Yetishmayotgan summa: ${formatCurrency(
                      activeDisplayPlan.shortfall
                    )}.`}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 min-w-[240px]">
            <div className="text-xs text-slate-300 font-medium mb-1">
              {activeDisplayPlan.isAchievable ? 'Xarid amalga oshgach qoladigan sof mablagʻ:' : 'Hozir erishish mumkin boʻlgan maksimal:'}
            </div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold ${
                activeDisplayPlan.isAchievable ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {activeDisplayPlan.isAchievable
                ? formatCurrency(activeDisplayPlan.safeToSpendRemainingMonth)
                : formatCurrency(activeDisplayPlan.maxAffordableGoal)}
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              {activeDisplayPlan.isAchievable
                ? 'Ushbu pulni erkin sarflashingiz mumkin'
                : 'Hozirgi byudjet bilan xavfsiz chegara'}
            </div>
          </div>
        </div>

        {/* Dynamic Velocity Limits */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-slate-300 font-medium">Kunlik zarur jamgʻarma:</div>
            <div className="text-xl font-bold text-white mt-1">
              {formatCurrency(activeDisplayPlan.dailyGoalSaving)}/kun
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Oy oxirigacha {activeDisplayPlan.daysRemainingInMonth} kunga taqsimlanganda
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-slate-300 font-medium">Haftalik zarur jamgʻarma:</div>
            <div className="text-xl font-bold text-white mt-1">
              {formatCurrency(activeDisplayPlan.weeklyGoalSaving)}/hafta
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Haftalik meʼyor
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-slate-300 font-medium">Kunlik xavfsiz sarflash meʼyori:</div>
            <div
              className={`text-xl font-bold mt-1 ${
                activeDisplayPlan.isAchievable ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {formatCurrency(activeDisplayPlan.dailyFlexibleLimit)}/kun
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Maqsad mablagʻi ajratilgandan keyin
            </div>
          </div>
        </div>
      </div>

      {/* Mathematical Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          Hisob-kitob bosqichlari
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Qatʼiy moliyaviy tartib: Majburiy toʻlovlar va kundalik ehtiyojlar birinchi navbatda chegiriladi
        </p>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t('pillar_incomes')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Jami oylik tushum</span>
              </div>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(activeDisplayPlan.expectedIncome)}
            </span>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t('pillar_mandatory')} va kommunal
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Soliqlar ({formatCurrency(summary.totalMandatory)}) + Kommunal ({formatCurrency(summary.totalUtilities)})
                </span>
              </div>
            </div>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
              -{formatCurrency(activeDisplayPlan.mandatoryExpenses)}
            </span>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Kundalik xarajatlar
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Oziq-ovqat, transport, ehtiyojlar</span>
              </div>
            </div>
            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
              -{formatCurrency(activeDisplayPlan.plannedEverydayExpenses)}
            </span>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  {t('pillar_balance')}
                </span>
                <span className="text-[11px] text-indigo-700 dark:text-indigo-300 block">
                  1 - (2 + 3)
                </span>
              </div>
            </div>
            <span className="text-sm font-extrabold text-indigo-900 dark:text-indigo-200">
              ={formatCurrency(activeDisplayPlan.availableBeforeGoal)}
            </span>
          </div>

          {/* Step 5 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                5
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Maqsad summasi
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">«{goalName}»</span>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(activeDisplayPlan.requiredGoalAmount)}
            </span>
          </div>

          {/* Step 6 */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-center shrink-0">
                6
              </span>
              <div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  {t('pillar_safe_spend')}
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">
                  Mavjud qoldiq - Maqsad summasi
                </span>
              </div>
            </div>
            <span
              className={`text-sm font-extrabold ${
                activeDisplayPlan.safeToSpendRemainingMonth >= 0
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {formatCurrency(activeDisplayPlan.safeToSpendRemainingMonth)}
            </span>
          </div>
        </div>
      </div>

      {/* Levers & Simulation Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Rejani toʻgʻrilash va sinov
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Xarajatni kamaytirish yoki qoʻshimcha daromad orqali natijani koʻring.
            </p>
          </div>
          {hasActiveSimulations && (
            <button
              onClick={() => {
                setSimulatedIncomeAdd(0);
                setSimulatedExpenseCut(0);
              }}
              className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
            >
              Bekor qilish
            </button>
          )}
        </div>

        {!basePlan.isAchievable && !hasActiveSimulations && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 mb-6 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
            <strong className="font-bold text-rose-950 dark:text-rose-100 block text-sm mb-1">
              Kamomad: {formatCurrency(basePlan.shortfall)}
            </strong>
            Ushbu maqsadga toʻliq erishish uchun tavsiya:
            <ul className="list-disc list-inside mt-2 space-y-1 font-medium">
              <li>
                Xarajatlarni <strong>{formatCurrency(basePlan.suggestedSpendingReduction)}</strong> ga kamaytirish
              </li>
              <li>
                Yoki <strong>{formatCurrency(basePlan.suggestedIncomeIncrease)}</strong> miqdorida qoʻshimcha daromad topish
              </li>
            </ul>
          </div>
        )}

        {/* Interactive Levers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lever 1 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-rose-500" />
                <span>Xarajatni qisqartirish:</span>
              </span>
              <span className="text-xs font-extrabold text-rose-700 dark:text-rose-400">
                -{formatCurrency(simulatedExpenseCut)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.min(summary.totalExpenses, 2000000)}
              step={50000}
              value={simulatedExpenseCut}
              onChange={(e) => setSimulatedExpenseCut(Number(e.target.value))}
              className="w-full accent-rose-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              <span>0</span>
              <span>{formatCurrency(Math.min(summary.totalExpenses, 2000000))}</span>
            </div>
          </div>

          {/* Lever 2 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Qoʻshimcha daromad sinovi:</span>
              </span>
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                +{formatCurrency(simulatedIncomeAdd)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={3000000}
              step={100000}
              value={simulatedIncomeAdd}
              onChange={(e) => setSimulatedIncomeAdd(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              <span>0</span>
              <span>{formatCurrency(3000000)}</span>
            </div>
            {simulatedIncomeAdd > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={applyIncomeAdjustment}
                  className="min-h-[38px] px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Haqiqiy daromadga kiritish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
