import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PiggyBank,
  Compass,
  Sliders,
  TrendingUp,
  Clock,
  Coins,
  Users,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialGoal, GoalStatus, GoalPriority } from '../../types';
import {
  formatUZS,
  formatUzbekDate,
  GOAL_STATUS_LABELS,
  GOAL_PRIORITY_LABELS,
} from '../../utils/formatters';
import { analyzeGoalPlan } from '../../engine/financeCalculations';
import { ContributeGoalModal } from '../modals/ContributeGoalModal';
import { GoalPlannerView } from './GoalPlannerView';

interface GoalsViewProps {
  initialTab?: 'list' | 'planner';
}

export const GoalsView: React.FC<GoalsViewProps> = ({ initialTab = 'list' }) => {
  const {
    goals,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    openModal,
    setSelectedPlannerGoalId,
    selectedPlannerGoalId,
    summary,
    currentMonth,
    activeFamilyMembers,
    familyMembers,
  } = useFinance();

  const [activeTabMode, setActiveTabMode] = useState<'list' | 'planner'>(initialTab);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [contributeTarget, setContributeTarget] = useState<FinancialGoal | null>(null);

  // Filter goals by member first
  const memberFilteredGoals = goals.filter((g) => {
    if (selectedMemberFilter === 'all') return true;
    if (selectedMemberFilter === 'family') return !g.memberId;
    return g.memberId === selectedMemberFilter;
  });

  // Quick stats
  const totalGoals = memberFilteredGoals.length;
  const completedGoals = memberFilteredGoals.filter((g) => g.status === 'completed');
  const activeGoals = memberFilteredGoals.filter((g) => g.status !== 'completed');
  const totalTargetSum = memberFilteredGoals.reduce((acc, cur) => acc + cur.targetAmount, 0);
  const totalSavedSum = memberFilteredGoals.reduce((acc, cur) => acc + cur.currentSavedAmount, 0);

  const filteredGoals = memberFilteredGoals.filter(
    (g) => filterStatus === 'all' || g.status === filterStatus
  );

  // Plan a specific goal
  const handlePlanGoal = (goalId: string) => {
    setSelectedPlannerGoalId(goalId);
    setActiveTabMode('planner');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>Moliyaviy maqsadlar va hisob-kitob</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Maqsadlar va Rejalashtirgich
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Katta xaridlar uchun jamgʻarish, erishish tezligi va xavfsiz sarflash tahlili
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openModal('goal')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi maqsad</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Faol maqsadlar
            </div>
            <div className="mt-1 text-lg sm:text-2xl font-extrabold text-slate-900">
              {activeGoals.length} ta
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {completedGoals.length} ta bajarilgan
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Koʻzlangan summa
            </div>
            <div className="mt-1 text-lg sm:text-2xl font-extrabold text-indigo-600">
              {formatUZS(totalTargetSum)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Barcha maqsadlar boʻyicha
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Jamgʻarilgan mablagʻ
            </div>
            <div className="mt-1 text-lg sm:text-2xl font-extrabold text-emerald-600">
              {formatUZS(totalSavedSum)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {totalTargetSum > 0 ? Math.round((totalSavedSum / totalTargetSum) * 100) : 0}% bajarildi
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Oylik maqsad zaxirasi
            </div>
            <div className="mt-1 text-lg sm:text-2xl font-extrabold text-slate-900">
              {formatUZS(summary.goalReserve)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Joriy oy byudjetidan
            </div>
          </div>
        </div>
      </div>

      {/* Mode Sub-navigation: List vs Planner */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTabMode('list')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTabMode === 'list'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Maqsadlar roʻyxati ({goals.length})</span>
        </button>

        <button
          onClick={() => setActiveTabMode('planner')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTabMode === 'planner'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Maqsad rejalashtirgich (Goal Planner)</span>
        </button>
      </div>

      {/* TAB: GOALS LIST */}
      {activeTabMode === 'list' && (
        <div className="space-y-6">
          {/* Family Member Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
              <Users className="w-3.5 h-3.5" />
              <span>A'zo bo'yicha:</span>
            </span>
            <button
              onClick={() => setSelectedMemberFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedMemberFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Barchasi ({goals.length})
            </button>
            {activeFamilyMembers.map((member) => {
              const memberCount = goals.filter((g) => g.memberId === member.id).length;
              const isSelected = selectedMemberFilter === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberFilter(member.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{member.avatarEmoji || '👤'}</span>
                  <span>{member.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {memberCount}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => setSelectedMemberFilter('family')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedMemberFilter === 'family'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>👥</span>
              <span>Umumiy oila</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedMemberFilter === 'family' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {goals.filter((g) => !g.memberId).length}
              </span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Barchasi ({totalGoals})
            </button>
            <button
              onClick={() => setFilterStatus('on_track')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === 'on_track'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Reja boʻyicha ({memberFilteredGoals.filter((g) => g.status === 'on_track').length})
            </button>
            <button
              onClick={() => setFilterStatus('at_risk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === 'at_risk'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Xavf ostida ({memberFilteredGoals.filter((g) => g.status === 'at_risk').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === 'completed'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Bajarilgan ({completedGoals.length})
            </button>
          </div>

          {/* Goals Detailed Grid */}
          {filteredGoals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400">
              <Target className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">Tanlangan toifa boʻyicha maqsadlar yoʻq</p>
              <p className="text-xs text-slate-400 mt-1">«Yangi maqsad» tugmasi orqali maqsad qoʻshing</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredGoals.map((goal) => {
                const remainingAmount = Math.max(0, goal.targetAmount - goal.currentSavedAmount);
                const percent = Math.min(
                  100,
                  Math.round((goal.currentSavedAmount / Math.max(1, goal.targetAmount)) * 100)
                );
                const statusMeta = GOAL_STATUS_LABELS[goal.status] || { label: goal.status };
                const priorityMeta = GOAL_PRIORITY_LABELS[goal.priority] || { label: goal.priority };
                const assignedMember = goal.memberId
                  ? familyMembers.find((m) => m.id === goal.memberId)
                  : null;

                // Calculate required daily and weekly velocity
                const analysis = analyzeGoalPlan(
                  remainingAmount,
                  goal.name,
                  goal.targetMonth || currentMonth,
                  summary
                );

                return (
                  <div
                    key={goal.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 flex flex-col justify-between transition-all"
                  >
                    <div>
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900">{goal.name}</h3>
                            {/* Member badge */}
                            {assignedMember ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                                <span>{assignedMember.avatarEmoji || '👤'}</span>
                                <span>{assignedMember.name}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                <Users className="w-2.5 h-2.5" />
                                <span>Umumiy oilaviy</span>
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                goal.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : goal.status === 'at_risk'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {statusMeta.label}
                            </span>
                          </div>
                          {goal.category && (
                            <span className="text-xs text-slate-400 mt-0.5 block">{goal.category}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Oʻchirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Numbers Grid */}
                      <div className="grid grid-cols-2 gap-3 my-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                        <div>
                          <div className="text-[10px] font-medium text-slate-500">Koʻzlangan summa:</div>
                          <div className="text-sm font-bold text-slate-900">{formatUZS(goal.targetAmount)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-slate-500">Jamgʻarilgan:</div>
                          <div className="text-sm font-bold text-emerald-600">{formatUZS(goal.currentSavedAmount)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-slate-500">Qolgan mablagʻ:</div>
                          <div className="text-sm font-bold text-slate-700">{formatUZS(remainingAmount)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-slate-500">Muddat:</div>
                          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{formatUzbekDate(goal.deadline)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>Bajarilish darajasi</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className={`h-full rounded-full transition-all duration-300 ${
                              percent >= 100
                                ? 'bg-emerald-500'
                                : percent >= 50
                                ? 'bg-indigo-500'
                                : 'bg-blue-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Real Engine Insights for this goal */}
                      {goal.status !== 'completed' && (
                        <div className="border-t border-slate-100 pt-3.5 space-y-2">
                          <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-indigo-500" />
                              Kunlik jamgʻarma talabi:
                            </span>
                            <span className="font-bold text-slate-900">
                              {formatUZS(analysis.dailyGoalSaving)}/kun
                            </span>
                          </div>

                          <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Coins className="w-3 h-3 text-indigo-500" />
                              Haftalik jamgʻarma talabi:
                            </span>
                            <span className="font-bold text-slate-900">
                              {formatUZS(analysis.weeklyGoalSaving)}/hafta
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-slate-500">Erishish imkoniyati:</span>
                            {analysis.isAchievable ? (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                Reja boʻyicha erishiladi
                              </span>
                            ) : (
                              <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                                {formatUZS(analysis.shortfall)} yetishmovchilik
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => handlePlanGoal(goal.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Rejalashtirish</span>
                      </button>

                      {goal.status !== 'completed' && (
                        <button
                          onClick={() => setContributeTarget(goal)}
                          className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <PiggyBank className="w-3.5 h-3.5" />
                          <span>Mablagʻ qoʻshish</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: GOAL PLANNER (Directly integrated) */}
      {activeTabMode === 'planner' && (
        <div className="space-y-4">
          <div className="bg-slate-100/80 p-3 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span>
              Tanlangan maqsad: <strong>{goals.find((g) => g.id === selectedPlannerGoalId)?.name || 'Maxsus maqsad'}</strong>
            </span>
            <button
              onClick={() => setActiveTabMode('list')}
              className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              ← Maqsadlar roʻyxatiga qaytish
            </button>
          </div>
          <GoalPlannerView />
        </div>
      )}

      {/* Modal: Contribute to goal */}
      {contributeTarget && (
        <ContributeGoalModal
          goal={contributeTarget}
          onClose={() => setContributeTarget(null)}
          onContribute={(goalId, amount) => {
            contributeToGoal(goalId, amount);
            setContributeTarget(null);
          }}
        />
      )}
    </div>
  );
};
