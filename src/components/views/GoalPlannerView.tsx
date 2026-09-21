import React, { useState, useMemo } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Receipt,
  ShieldCheck,
  Target,
  Sparkles,
  Sliders,
  DollarSign,
  Calendar,
  Clock,
  HelpCircle,
  PlusCircle,
  Scissors,
  Check,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatUZS, formatMonthName } from '../../utils/formatters';
import { analyzeGoalPlan } from '../../engine/financeCalculations';

export const GoalPlannerView: React.FC = () => {
  const {
    goals,
    selectedPlannerGoalId,
    setSelectedPlannerGoalId,
    summary,
    currentMonth,
    addIncome,
    addExpense,
    updateGoal,
  } = useFinance();

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
    };
  }, [summary, simulatedIncomeAdd, simulatedExpenseCut]);

  const simulatedPlan = useMemo(() => {
    return analyzeGoalPlan(rawTargetAmount, goalName, currentMonth, adjustedSummary);
  }, [rawTargetAmount, goalName, currentMonth, adjustedSummary]);

  const hasActiveSimulations = simulatedIncomeAdd > 0 || simulatedExpenseCut > 0;
  const activeDisplayPlan = hasActiveSimulations ? simulatedPlan : basePlan;

  // Apply simulated adjustments to real data
  const applyIncomeAdjustment = () => {
    if (simulatedIncomeAdd <= 0) return;
    addIncome({
      name: `Qoʻshimcha daromad (${goalName} uchun)`,
      amount: simulatedIncomeAdd,
      date: `${currentMonth}-20`,
      category: 'additional',
      isRecurring: false,
      notes: 'Maqsad rejalashtirgich orqali rejalashtirilgan qoʻshimcha daromad',
    });
    setSimulatedIncomeAdd(0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Flagship Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-200/60">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dasturning asosiy flagman vositasi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Maqsad Rejalashtirgich (Goal Planner)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              «Bu oy 1 000 000 soʻmga telefon sotib olmoqchiman». Tizim daromadingiz, qatʼiy majburiyatlaringiz va rejalashtirilgan kundalik xarajatlaringizni tahlil qilib, maqsadga xavfsiz erishish formulasini hisoblab beradi.
            </p>
          </div>

          {/* Existing Goals Picker Dropdown */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Mavjud maqsadni tanlash:
            </span>
            <select
              value={selectedPlannerGoalId || ''}
              onChange={(e) => handleSelectGoal(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({formatUZS(g.targetAmount)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Target Bar & Fast Test Scenarios */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Xarid yoki maqsad nomi:
            </label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="Masalan: Telefon sotib olish"
              className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                className="w-full px-3.5 py-2.5 text-sm font-extrabold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-900"
              />
              <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 select-none">
                UZS
              </span>
            </div>
          </div>

          {/* Quick Scenario Buttons */}
          <div className="md:col-span-3 flex flex-col justify-end">
            <span className="text-[11px] font-semibold text-slate-400 mb-1.5 block">
              Tezkor ssenariylar:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  setGoalName('Telefon sotib olish');
                  setTargetAmountStr('1 000 000');
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                1 000 000 (Telefon)
              </button>
              <button
                onClick={() => {
                  setGoalName('Qimmat telefon sinovi');
                  setTargetAmountStr('1 500 000');
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                1 500 000
              </button>
              <button
                onClick={() => {
                  setGoalName('Katta xarid (Kamomad sinovi)');
                  setTargetAmountStr('2 500 000');
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
              >
                2 500 000 (Kamomad)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Achievability Result Box (Prompt Specification #7) */}
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
                Hisob-kitob natijasi:
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {activeDisplayPlan.statusText}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
                {activeDisplayPlan.isAchievable
                  ? `Siz ushbu oyni boshqa majburiyatlaringizni buzmagan holda «${goalName}» uchun ${formatUZS(
                      rawTargetAmount
                    )} ajratishga toʻliq qodirsiz.`
                  : `Joriy reja va xarajatlar tuzilmasi ushbu maqsadni toʻliq qoplashga yetarli emas. Kamomad: ${formatUZS(
                      activeDisplayPlan.shortfall
                    )}.`}
              </p>
            </div>
          </div>

          {/* Prominent numbers box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 min-w-[240px]">
            <div className="text-xs text-slate-300 font-medium mb-1">
              {activeDisplayPlan.isAchievable ? 'Xarid amalga oshgach qoladigan sof mablagʻ:' : 'Mavjud maksimal maqsad summasi:'}
            </div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold ${
                activeDisplayPlan.isAchievable ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {activeDisplayPlan.isAchievable
                ? formatUZS(activeDisplayPlan.safeToSpendRemainingMonth)
                : formatUZS(activeDisplayPlan.maxAffordableGoal)}
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              {activeDisplayPlan.isAchievable
                ? 'Ushbu pulni erkin sarflashingiz mumkin'
                : `Hozirgi byudjet bilan xavfsiz erishish chegarasi`}
            </div>
          </div>
        </div>

        {/* Dynamic Velocity Limits (Daily & Weekly Limits) */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-slate-300 font-medium">Kunlik zarur jamgʻarma meʼyori:</div>
            <div className="text-xl font-bold text-white mt-1">
              {formatUZS(activeDisplayPlan.dailyGoalSaving)}/kun
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Oy oxirigacha qolgan {activeDisplayPlan.daysRemainingInMonth} kunga taqsimlanganda
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-slate-300 font-medium">Haftalik zarur jamgʻarma:</div>
            <div className="text-xl font-bold text-white mt-1">
              {formatUZS(activeDisplayPlan.weeklyGoalSaving)}/hafta
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Haftalik meʼyorni nazorat qilib boring
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-slate-300 font-medium">Kunlik erkin sarflash chegarasi:</div>
            <div
              className={`text-xl font-bold mt-1 ${
                activeDisplayPlan.isAchievable ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {formatUZS(activeDisplayPlan.dailyFlexibleLimit)}/kun
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Maqsad mablagʻi olib qoʻyilgandan soʻng
            </div>
          </div>
        </div>
      </div>

      {/* 9-Step Mathematical Breakdown (Deterministic Engine Output) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Hisob-kitob formulasi va qadamma-qadam tahlil
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Qatʼiy moliyaviy tartib: Majburiy toʻlovlar va kundalik ehtiyojlar birinchi navbatda chegiriladi
        </p>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-800">
                  Kutilayotgan umumiy oylik daromad (Total expected income)
                </span>
                <span className="text-[11px] text-slate-500 block">Maosh, biznes va frilans tushumlari</span>
              </div>
            </div>
            <span className="text-sm font-bold text-emerald-600">
              +{formatUZS(activeDisplayPlan.expectedIncome)}
            </span>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-800">
                  Majburiy toʻlovlar va kommunal (Mandatory expenses)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Soliqlar ({formatUZS(summary.totalMandatory)}) + Kommunal ({formatUZS(summary.totalUtilities)})
                </span>
              </div>
            </div>
            <span className="text-sm font-bold text-rose-600">
              -{formatUZS(activeDisplayPlan.mandatoryExpenses)}
            </span>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-800">
                  Rejalashtirilgan kundalik xarajatlar (Planned everyday expenses)
                </span>
                <span className="text-[11px] text-slate-500 block">Oziq-ovqat, transport, kiyim va boshqalar</span>
              </div>
            </div>
            <span className="text-sm font-bold text-rose-600">
              -{formatUZS(activeDisplayPlan.plannedEverydayExpenses)}
            </span>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-800 text-xs font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <span className="text-xs font-bold text-indigo-950">
                  Maqsaddan oldingi mavjud boʻsh qoldiq (Available money)
                </span>
                <span className="text-[11px] text-indigo-700 block">
                  1-bosqich - (2-bosqich + 3-bosqich)
                </span>
              </div>
            </div>
            <span className="text-sm font-extrabold text-indigo-900">
              ={formatUZS(activeDisplayPlan.availableBeforeGoal)}
            </span>
          </div>

          {/* Step 5 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                5
              </span>
              <div>
                <span className="text-xs font-semibold text-slate-800">
                  Talab qilinadigan maqsad summasi (Required goal amount)
                </span>
                <span className="text-[11px] text-slate-500 block">«{goalName}»</span>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {formatUZS(activeDisplayPlan.requiredGoalAmount)}
            </span>
          </div>

          {/* Step 6 */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                6
              </span>
              <div>
                <span className="text-xs font-bold text-emerald-950">
                  Xavfsiz sarflash mumkin boʻlgan qoldiq (Safe to spend remaining)
                </span>
                <span className="text-[11px] text-emerald-700 block">
                  Mavjud qoldiq - Maqsad summasi
                </span>
              </div>
            </div>
            <span
              className={`text-sm font-extrabold ${
                activeDisplayPlan.safeToSpendRemainingMonth >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatUZS(activeDisplayPlan.safeToSpendRemainingMonth)}
            </span>
          </div>
        </div>
      </div>

      {/* If Goal Is NOT Achievable OR User wants to simulate adjustments (Prompt Specification #7 Levers) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Rejani toʻgʻrilash va moslashuvchanlik sinovi (Simulation & Adjustments)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dastur siz uchun oʻzboshimchalik bilan qaror qilmaydi. Siz xarajatni kamaytirish yoki qoʻshimcha daromad topish orqali maqsadga erishish yoʻlini tanlaysiz.
            </p>
          </div>
          {hasActiveSimulations && (
            <button
              onClick={() => {
                setSimulatedIncomeAdd(0);
                setSimulatedExpenseCut(0);
              }}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              Simulyatsiyani bekor qilish
            </button>
          )}
        </div>

        {!basePlan.isAchievable && !hasActiveSimulations && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 mb-6 text-xs text-rose-900 leading-relaxed">
            <strong className="font-bold text-rose-950 block text-sm mb-1">
              Kamomad: {formatUZS(basePlan.shortfall)}
            </strong>
            Ushbu maqsadga toʻliq erishish uchun quyidagi tuzatishlardan birini yoki birgalikda tanlang:
            <ul className="list-disc list-inside mt-2 space-y-1 font-medium">
              <li>
                Kundalik erkin xarajatlarni <strong>{formatUZS(basePlan.suggestedSpendingReduction)}</strong> ga kamaytirish
              </li>
              <li>
                Yoki <strong>{formatUZS(basePlan.suggestedIncomeIncrease)}</strong> miqdorida qoʻshimcha daromad topish
              </li>
            </ul>
          </div>
        )}

        {/* Interactive Levers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lever 1: Reduce flexible spending */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-rose-500" />
                <span>Kundalik xarajatlarni qisqartirish:</span>
              </span>
              <span className="text-xs font-extrabold text-rose-700">
                -{formatUZS(simulatedExpenseCut)}
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
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0 soʻm</span>
              <span>100 000</span>
              <span>200 000</span>
              <span>500 000</span>
              <span>{formatUZS(Math.min(summary.totalExpenses, 2000000), false)}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Masalan: kafe, koʻngilochar yoki ixtiyoriy xaridlarni vaqtincha cheklash
            </p>
          </div>

          {/* Lever 2: Add additional income */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Qoʻshimcha daromad kiritish testi:</span>
              </span>
              <span className="text-xs font-extrabold text-emerald-700">
                +{formatUZS(simulatedIncomeAdd)}
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
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0 soʻm</span>
              <span>500 000</span>
              <span>1 000 000</span>
              <span>2 000 000</span>
              <span>3 000 000</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">
                Frilans, kutilmagan bonus yoki qoʻshimcha xizmat
              </p>
              {simulatedIncomeAdd > 0 && (
                <button
                  onClick={applyIncomeAdjustment}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  Haqiqiy daromadga kiritish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
