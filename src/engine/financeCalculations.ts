import {
  Income,
  Expense,
  UtilityBill,
  MandatoryPayment,
  FinancialGoal,
  MonthlyFinancialSummary,
  GoalPlanAnalysis,
  FamilyMember,
  MemberFinanceSummary,
  FamilyFinanceSummary,
} from '../types';

/**
 * Calculates days in a given YYYY-MM month string.
 */
export function getDaysInMonth(monthStr: string): number {
  if (!monthStr) return 30;
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10);
  return new Date(year, month, 0).getDate();
}

/**
 * Calculates remaining days in month from a reference date.
 */
export function getRemainingDaysInMonth(monthStr: string, referenceDateStr?: string): {
  totalDays: number;
  currentDay: number;
  remainingDays: number;
} {
  const totalDays = getDaysInMonth(monthStr);
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
  
  // Format check if current month matches reference
  const currentYearMonth = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, '0')}`;
  
  if (monthStr === currentYearMonth) {
    const currentDay = Math.min(ref.getDate(), totalDays);
    const remainingDays = Math.max(1, totalDays - currentDay + 1);
    return { totalDays, currentDay, remainingDays };
  } else if (monthStr < currentYearMonth) {
    // Past month
    return { totalDays, currentDay: totalDays, remainingDays: 1 };
  } else {
    // Future month
    return { totalDays, currentDay: 1, remainingDays: totalDays };
  }
}

/**
 * Main Monthly Summary Calculation
 * Pure function: deterministic, handles all zero and negative edge cases.
 */
export function calculateMonthlySummary(
  monthStr: string,
  incomes: Income[],
  expenses: Expense[],
  utilities: UtilityBill[],
  mandatory: MandatoryPayment[],
  goals: FinancialGoal[],
  referenceDateStr?: string
): MonthlyFinancialSummary {
  // Filter items matching this month
  const monthIncomes = incomes.filter((item) => item.date.startsWith(monthStr));
  const monthExpenses = expenses.filter((item) => item.date.startsWith(monthStr));
  const monthUtilities = utilities.filter((item) => item.month === monthStr);
  const monthMandatory = mandatory.filter((item) => item.month === monthStr);
  
  // Active goals targeting this month or active overall
  const activeGoalsThisMonth = goals.filter(
    (g) => g.status !== 'completed' && (g.targetMonth === monthStr || g.deadline.startsWith(monthStr))
  );

  const totalIncome = monthIncomes.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const totalExpenses = monthExpenses.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const totalUtilities = monthUtilities.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const totalMandatory = monthMandatory.reduce((acc, cur) => acc + (cur.amount || 0), 0);

  // Confirmed vs Unpaid tracking (Financial calculations treat only confirmed payments as incurred expenses)
  const paidUtilities = monthUtilities.filter((u) => u.isPaid);
  const unpaidUtilities = monthUtilities.filter((u) => !u.isPaid);
  const actualPaidUtilities = paidUtilities.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const unpaidUtilitiesAmount = unpaidUtilities.reduce((acc, cur) => acc + (cur.amount || 0), 0);

  const paidMandatory = monthMandatory.filter((m) => m.isPaid);
  const unpaidMandatory = monthMandatory.filter((m) => !m.isPaid);
  const actualPaidMandatory = paidMandatory.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const unpaidMandatoryAmount = unpaidMandatory.reduce((acc, cur) => acc + (cur.amount || 0), 0);

  // Confirmed actual outflows (only confirmed payments are treated as real incurred expenses)
  const actualConfirmedExpenses = totalExpenses + actualPaidUtilities + actualPaidMandatory;

  const totalUnpaidBillsCount = unpaidUtilities.length + unpaidMandatory.length;
  const totalUnpaidBillsAmount = unpaidUtilitiesAmount + unpaidMandatoryAmount;

  // Committed essential obligations
  const essentialExpenses = monthExpenses
    .filter((e) => e.isEssential)
    .reduce((acc, cur) => acc + cur.amount, 0);
  const flexibleExpenses = totalExpenses - essentialExpenses;
  const totalCommittedNecessary = totalMandatory + totalUtilities + essentialExpenses;

  // Available money = Total Income - (Expenses + Utilities + Mandatory)
  const availableMoney = totalIncome - (totalExpenses + totalUtilities + totalMandatory);

  // Goal reserve calculation: sum of target remaining needed for this month's goals
  const goalReserve = activeGoalsThisMonth.reduce((acc, g) => {
    const needed = Math.max(0, g.targetAmount - (g.currentSavedAmount || 0));
    return acc + needed;
  }, 0);

  // Safe to spend remaining this month
  const remainingSafeToSpendMonth = availableMoney - goalReserve;

  // Day calculations for velocity
  const { remainingDays } = getRemainingDaysInMonth(monthStr, referenceDateStr);
  const safeRemainingToDistribute = Math.max(0, remainingSafeToSpendMonth);

  // Safe to spend daily and weekly (integer division rounded down to avoid overspending)
  const safeToSpendDaily = Math.floor(safeRemainingToDistribute / remainingDays);
  const safeToSpendWeekly = Math.min(
    safeRemainingToDistribute,
    Math.floor(safeRemainingToDistribute / Math.max(1, Math.ceil(remainingDays / 7)))
  );

  return {
    month: monthStr,
    totalIncome,
    totalExpenses,
    totalUtilities,
    totalMandatory,
    actualPaidUtilities,
    unpaidUtilitiesAmount,
    actualPaidMandatory,
    unpaidMandatoryAmount,
    actualConfirmedExpenses,
    totalCommittedNecessary,
    flexibleExpenses,
    availableMoney,
    goalReserve,
    remainingSafeToSpendMonth,
    safeToSpendDaily,
    safeToSpendWeekly,
    totalUnpaidBillsCount,
    totalUnpaidBillsAmount,
  };
}

/**
 * Flagship Goal Planner Engine
 *
 * Implements strict requirement:
 * "Do NOT simply divide the goal amount by days.
 *  First subtract mandatory expenses and planned necessary expenses from expected income.
 *  Then determine whether the goal is financially possible.
 *  If it is not possible, show: 'Your current plan does not allow this goal.'
 *  Then calculate:
 *  - shortfall amount
 *  - maximum affordable goal amount
 *  - additional income required
 *  - amount of spending that must be reduced"
 */
export function analyzeGoalPlan(
  targetGoalAmount: number,
  targetGoalName: string,
  targetMonthStr: string,
  summary: MonthlyFinancialSummary,
  referenceDateStr?: string,
  goalId?: string
): GoalPlanAnalysis {
  const goalAmount = Math.max(0, Math.round(targetGoalAmount));
  const expectedIncome = summary.totalIncome;
  
  // Mandatory obligations: Taxes + Utilities + Mandatory payments
  const mandatoryExpenses = summary.totalMandatory + summary.totalUtilities;
  
  // Planned everyday expenses
  const plannedEverydayExpenses = summary.totalExpenses;

  // Available before goal = Income - (Mandatory + Planned Everyday)
  const availableBeforeGoal = expectedIncome - (mandatoryExpenses + plannedEverydayExpenses);

  // Is achievable if availableBeforeGoal >= goalAmount
  const isAchievable = availableBeforeGoal >= goalAmount;
  const shortfall = isAchievable ? 0 : goalAmount - availableBeforeGoal;
  
  // Safe-to-spend remaining after setting aside this goal
  const safeToSpendRemainingMonth = availableBeforeGoal - goalAmount;

  // Maximum affordable goal given current income and expenses
  const maxAffordableGoal = Math.max(0, availableBeforeGoal);

  // If short, what adjustments can be made:
  // 1) Additional income needed = shortfall
  // 2) Spending reduction needed = shortfall
  // We can suggest a breakdown:
  // e.g. If flexible expenses exist, can reduce flexible spending up to flexibleExpenses,
  // and the remainder by additional income.
  const flexibleSpending = summary.flexibleExpenses > 0 ? summary.flexibleExpenses : plannedEverydayExpenses;
  const suggestedSpendingReduction = Math.min(shortfall, Math.round(flexibleSpending * 0.7));
  const suggestedIncomeIncrease = Math.max(0, shortfall - suggestedSpendingReduction);

  // Days velocity
  const { totalDays, remainingDays } = getRemainingDaysInMonth(targetMonthStr, referenceDateStr);

  const dailyGoalSaving = goalAmount > 0 ? Math.ceil(goalAmount / Math.max(1, remainingDays)) : 0;
  const weeklyGoalSaving = goalAmount > 0 ? Math.ceil(goalAmount / Math.max(1, Math.ceil(remainingDays / 7))) : 0;

  // Flexible spending limits left
  const dailyFlexibleLimit =
    safeToSpendRemainingMonth > 0 ? Math.floor(safeToSpendRemainingMonth / Math.max(1, remainingDays)) : 0;
  const weeklyFlexibleLimit =
    safeToSpendRemainingMonth > 0
      ? Math.min(safeToSpendRemainingMonth, Math.floor(safeToSpendRemainingMonth / Math.max(1, Math.ceil(remainingDays / 7))))
      : 0;

  const statusText = isAchievable
    ? 'Maqsadingiz toʻliq erishiladigan'
    : 'Joriy rejangiz bu maqsadga yetarli emas';

  return {
    goalId,
    goalName: targetGoalName || 'Yangi maqsad',
    targetAmount: goalAmount,
    targetMonth: targetMonthStr,
    expectedIncome,
    mandatoryExpenses,
    plannedEverydayExpenses,
    availableBeforeGoal,
    requiredGoalAmount: goalAmount,
    safeToSpendRemainingMonth,
    daysInPeriod: totalDays,
    daysRemainingInMonth: remainingDays,
    dailyGoalSaving,
    weeklyGoalSaving,
    dailyFlexibleLimit,
    weeklyFlexibleLimit,
    isAchievable,
    statusText,
    shortfall,
    maxAffordableGoal,
    additionalIncomeNeeded: shortfall,
    spendingReductionNeeded: shortfall,
    suggestedSpendingReduction,
    suggestedIncomeIncrease,
  };
}

/**
 * Family Balance calculation
 * Formula: Total Income - Total Expenses - Mandatory Payments = Available Family Balance
 */
export function calculateFamilyBalance(
  totalIncome: number,
  totalExpenses: number,
  mandatoryPayments: number
): number {
  return totalIncome - totalExpenses - mandatoryPayments;
}

/**
 * Filtered family income calculation.
 * If memberId is undefined: returns sum of all incomes.
 * If memberId is null or 'family': returns sum of incomes with no member assigned.
 * If memberId is a string: returns sum of incomes assigned to that member.
 */
export function calculateFamilyIncome(
  incomes: Income[],
  memberId?: string | null
): number {
  if (memberId === undefined) {
    return incomes.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  }
  if (memberId === null || memberId === 'family') {
    return incomes
      .filter((i) => !i.memberId || i.memberId === 'family')
      .reduce((acc, cur) => acc + (cur.amount || 0), 0);
  }
  return incomes
    .filter((i) => i.memberId === memberId)
    .reduce((acc, cur) => acc + (cur.amount || 0), 0);
}

/**
 * Filtered family expenses calculation.
 * If memberId is undefined: returns sum of all everyday expenses.
 * If memberId is null or 'family': returns sum of expenses with no member assigned.
 * If memberId is a string: returns sum of expenses assigned to that member.
 */
export function calculateFamilyExpenses(
  expenses: Expense[],
  memberId?: string | null
): number {
  if (memberId === undefined) {
    return expenses.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  }
  if (memberId === null || memberId === 'family') {
    return expenses
      .filter((e) => !e.memberId || e.memberId === 'family')
      .reduce((acc, cur) => acc + (cur.amount || 0), 0);
  }
  return expenses
    .filter((e) => e.memberId === memberId)
    .reduce((acc, cur) => acc + (cur.amount || 0), 0);
}

/**
 * Calculate financial summary for each family member, plus the collective 'Oila' (family-level) bucket.
 * Pure deterministic calculation.
 */
export function calculateMemberSummary(
  members: FamilyMember[],
  incomes: Income[],
  expenses: Expense[],
  utilities: UtilityBill[] = [],
  mandatory: MandatoryPayment[] = [],
  totalFamilyIncome: number = 0,
  totalFamilyExpenses: number = 0
): MemberFinanceSummary[] {
  const result: MemberFinanceSummary[] = [];

  const safeTotalIncome = Math.max(1, totalFamilyIncome);
  const safeTotalExpenses = Math.max(1, totalFamilyExpenses);

  // Individual members
  members.forEach((member) => {
    const memberIncomes = incomes.filter((i) => i.memberId === member.id);
    const memberEveryday = expenses.filter((e) => e.memberId === member.id);
    const memberUtils = utilities.filter((u) => u.memberId === member.id);
    const memberMandat = mandatory.filter((m) => m.memberId === member.id);

    const income = memberIncomes.reduce((acc, cur) => acc + (cur.amount || 0), 0);
    const everydayExpenses = memberEveryday.reduce((acc, cur) => acc + (cur.amount || 0), 0);
    const utilsSum = memberUtils.reduce((acc, cur) => acc + (cur.amount || 0), 0);
    const mandatSum = memberMandat.reduce((acc, cur) => acc + (cur.amount || 0), 0);
    const totalExp = everydayExpenses + utilsSum + mandatSum;
    const balance = income - totalExp;

    const percentOfTotalIncome = Math.min(100, Math.round((income / safeTotalIncome) * 100));
    const percentOfTotalExpenses = Math.min(100, Math.round((totalExp / safeTotalExpenses) * 100));

    result.push({
      memberId: member.id,
      memberName: member.name,
      memberRole: member.role,
      isActive: member.active,
      income,
      expenses: everydayExpenses,
      totalExpenses: totalExp,
      everydayExpenses,
      utilities: utilsSum,
      mandatory: mandatSum,
      balance,
      netBalance: balance,
      percentOfTotalIncome,
      percentOfTotalExpenses,
      safeToSpendShare: {
        daily: Math.round(Math.max(0, balance) / 30),
        weekly: Math.round(Math.max(0, balance) / 4),
        monthly: Math.max(0, balance),
      },
    });
  });

  // Collective Family-level (unassigned or explicitly 'family')
  const familyIncomes = incomes.filter((i) => !i.memberId || i.memberId === 'family');
  const familyEveryday = expenses.filter((e) => !e.memberId || e.memberId === 'family');
  const familyUtils = utilities.filter((u) => !u.memberId || u.memberId === 'family');
  const familyMandat = mandatory.filter((m) => !m.memberId || m.memberId === 'family');

  const famIncome = familyIncomes.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const famEveryday = familyEveryday.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const famUtils = familyUtils.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const famMandat = familyMandat.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const famTotalExp = famEveryday + famUtils + famMandat;
  const famBalance = famIncome - famTotalExp;

  result.push({
    memberId: null,
    memberName: 'Oilaviy umumiy',
    memberRole: 'Family',
    isActive: true,
    income: famIncome,
    expenses: famEveryday,
    totalExpenses: famTotalExp,
    everydayExpenses: famEveryday,
    utilities: famUtils,
    mandatory: famMandat,
    balance: famBalance,
    netBalance: famBalance,
    percentOfTotalIncome: Math.min(100, Math.round((famIncome / safeTotalIncome) * 100)),
    percentOfTotalExpenses: Math.min(100, Math.round((famTotalExp / safeTotalExpenses) * 100)),
    safeToSpendShare: {
      daily: Math.round(Math.max(0, famBalance) / 30),
      weekly: Math.round(Math.max(0, famBalance) / 4),
      monthly: Math.max(0, famBalance),
    },
  });

  return result;
}

/**
 * Calculate comprehensive Family Financial Summary
 */
export function calculateFamilySummary(
  monthStr: string,
  familyMembers: FamilyMember[],
  incomes: Income[],
  expenses: Expense[],
  utilities: UtilityBill[],
  mandatory: MandatoryPayment[],
  goals: FinancialGoal[]
): FamilyFinanceSummary {
  const monthIncomes = incomes.filter((item) => item.date.startsWith(monthStr));
  const monthExpenses = expenses.filter((item) => item.date.startsWith(monthStr));
  const monthUtilities = utilities.filter((item) => item.month === monthStr);
  const monthMandatory = mandatory.filter((item) => item.month === monthStr);

  const totalIncome = monthIncomes.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const totalExpenses = monthExpenses.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const totalUtilities = monthUtilities.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const totalMandatory = monthMandatory.reduce((acc, cur) => acc + (cur.amount || 0), 0);

  const totalMandatoryCombined = totalUtilities + totalMandatory;
  const allOutflows = totalExpenses + totalMandatoryCombined;
  const familyBalance = calculateFamilyBalance(totalIncome, totalExpenses, totalMandatoryCombined);

  const activeGoalsThisMonth = goals.filter(
    (g) => g.status !== 'completed' && (g.targetMonth === monthStr || g.deadline.startsWith(monthStr))
  );

  const goalReserve = activeGoalsThisMonth.reduce((acc, g) => {
    const needed = Math.max(0, g.targetAmount - (g.currentSavedAmount || 0));
    return acc + needed;
  }, 0);

  const safeToSpendMonth = familyBalance - goalReserve;

  // Unassigned
  const unassignedIncome = monthIncomes
    .filter((i) => !i.memberId || i.memberId === 'family')
    .reduce((acc, cur) => acc + (cur.amount || 0), 0);
  const unassignedExpenses = monthExpenses
    .filter((e) => !e.memberId || e.memberId === 'family')
    .reduce((acc, cur) => acc + (cur.amount || 0), 0);

  const memberBreakdown = calculateMemberSummary(
    familyMembers,
    monthIncomes,
    monthExpenses,
    monthUtilities,
    monthMandatory,
    totalIncome,
    allOutflows
  );

  return {
    totalIncome,
    totalExpenses,
    totalMandatory: totalMandatoryCombined,
    familyBalance,
    safeToSpendMonth,
    goalReserve,
    unassignedIncome,
    unassignedExpenses,
    memberBreakdown,
  };
}

