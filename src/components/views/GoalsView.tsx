import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  PiggyBank,
  Compass,
  Clock,
  Coins,
  Users,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { FinancialGoal } from '../../types';
import {
  GOAL_STATUS_LABELS,
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

  const { t, formatCurrency, formatDate } = useLanguage();

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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>{t('goals_title')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t('goals_title')} & {t('goals_planner_tab')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t('app_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openModal('goal')}
              className="min-h-[44px] px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('btn_add_goal')}</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('goals_active_title')}
            </div>
            <div className="mt-1 text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {activeGoals.length} ta
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {completedGoals.length} ta bajarilgan
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Koʻzlangan summa
            </div>
            <div className="mt-1 text-lg sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(totalTargetSum)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Barcha maqsadlar
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Jamgʻarilgan mablagʻ
            </div>
            <div className="mt-1 text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalSavedSum)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {totalTargetSum > 0 ? Math.round((totalSavedSum / totalTargetSum) * 100) : 0}% bajarildi
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('pillar_goals')}
            </div>
            <div className="mt-1 text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatCurrency(summary.goalReserve)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Joriy oydan
            </div>
          </div>
        </div>
      </div>

      {/* Mode Sub-navigation: List vs Planner */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTabMode('list')}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTabMode === 'list'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>{t('goals_list_tab')} ({goals.length})</span>
        </button>

        <button
          onClick={() => setActiveTabMode('planner')}
          className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTabMode === 'planner'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>{t('goals_planner_tab')}</span>
        </button>
      </div>

      {/* TAB: GOALS LIST */}
      {activeTabMode === 'list' && (
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
                {t('family_all')} ({goals.length})
              </button>
              {activeFamilyMembers.map((member) => {
                const memberCount = goals.filter((g) => g.memberId === member.id).length;
                const isSelected = selectedMemberFilter === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMemberFilter(member.id)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{member.avatarEmoji || '👤'}</span>
                    <span>{member.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {memberCount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t('family_all')} ({totalGoals})
            </button>
            <button
              onClick={() => setFilterStatus('on_track')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'on_track'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Reja boʻyicha ({memberFilteredGoals.filter((g) => g.status === 'on_track').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'completed'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Bajarilgan ({completedGoals.length})
            </button>
          </div>

          {/* Goals Detailed Grid */}
          {filteredGoals.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500">
              <Target className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('goals_empty')}</p>
              <button
                onClick={() => openModal('goal')}
                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('btn_add_goal')}</span>
              </button>
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
                const assignedMember = goal.memberId
                  ? familyMembers.find((m) => m.id === goal.memberId)
                  : null;

                const analysis = analyzeGoalPlan(
                  remainingAmount,
                  goal.name,
                  goal.targetMonth || currentMonth,
                  summary
                );

                return (
                  <div
                    key={goal.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between transition-all"
                  >
                    <div>
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{goal.name}</h3>
                            {assignedMember ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                <span>{assignedMember.avatarEmoji || '👤'}</span>
                                <span>{assignedMember.name}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <Users className="w-2.5 h-2.5" />
                                <span>{t('family_title')}</span>
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                goal.status === 'completed'
                                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : goal.status === 'at_risk'
                                  ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                  : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              }`}
                            >
                              {statusMeta.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="min-h-[38px] min-w-[38px] p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                            title={t('btn_delete')}
                            aria-label={t('btn_delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Numbers Grid */}
                      <div className="grid grid-cols-2 gap-3 my-4 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div>
                          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Koʻzlangan:</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatCurrency(goal.targetAmount)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Jamgʻarilgan:</div>
                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(goal.currentSavedAmount)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Qolgan:</div>
                          <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(remainingAmount)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Muddat:</div>
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{formatDate(goal.deadline)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                          <span>Bajarilish darajasi</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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

                      {/* Engine Insights */}
                      {goal.status !== 'completed' && (
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 space-y-2">
                          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-indigo-500" />
                              Kunlik tejash talabi:
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {formatCurrency(analysis.dailyGoalSaving)}/kun
                            </span>
                          </div>

                          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Coins className="w-3 h-3 text-indigo-500" />
                              Haftalik tejash talabi:
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {formatCurrency(analysis.weeklyGoalSaving)}/hafta
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handlePlanGoal(goal.id)}
                        className="min-h-[42px] flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
                        <span>{t('goals_planner_tab')}</span>
                      </button>

                      {goal.status !== 'completed' && (
                        <button
                          onClick={() => setContributeTarget(goal)}
                          className="min-h-[42px] py-2 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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

      {/* TAB: GOAL PLANNER */}
      {activeTabMode === 'planner' && (
        <div className="space-y-4">
          <div className="bg-slate-100/80 dark:bg-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>
              Tanlangan maqsad: <strong>{goals.find((g) => g.id === selectedPlannerGoalId)?.name || 'Maxsus maqsad'}</strong>
            </span>
            <button
              onClick={() => setActiveTabMode('list')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              ← {t('goals_list_tab')}
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
