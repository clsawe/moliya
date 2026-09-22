export type IncomeCategory =
  | 'salary'
  | 'business'
  | 'freelance'
  | 'additional'
  | 'investment'
  | 'other';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'clothing'
  | 'health'
  | 'education'
  | 'communication'
  | 'entertainment'
  | 'household'
  | 'shopping'
  | 'other';

export type UtilityCategory =
  | 'electricity'
  | 'gas'
  | 'water'
  | 'heating'
  | 'internet'
  | 'waste'
  | 'housing'
  | 'other';

export type MandatoryCategory =
  | 'tax'
  | 'insurance'
  | 'government'
  | 'mandatory_fee'
  | 'loan_repayment'
  | 'other_mandatory';

export type GoalPriority = 'low' | 'medium' | 'high';
export type GoalStatus = 'on_track' | 'at_risk' | 'completed';

export interface Family {
  id: string;
  name: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type FamilyRole = 'Owner' | 'Adult' | 'Child';

export interface FamilyMember {
  id: string;
  familyId: string;
  name: string;
  role: FamilyRole;
  avatar?: string;
  avatarEmoji?: string;
  active: boolean;
  createdAt: string;
}

export interface MemberFinanceSummary {
  memberId: string | null; // null for "Oila" (family-level)
  memberName: string;
  memberRole?: FamilyRole | 'Family';
  isActive?: boolean;
  income: number;
  expenses: number;
  totalExpenses: number;
  everydayExpenses: number;
  utilities: number;
  mandatory: number;
  balance: number;
  netBalance: number;
  percentOfTotalIncome: number;
  percentOfTotalExpenses: number;
  safeToSpendShare?: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface FamilyFinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  totalMandatory: number;
  familyBalance: number; // totalIncome - totalExpenses - totalMandatory
  safeToSpendMonth: number;
  goalReserve: number;
  unassignedIncome: number;
  unassignedExpenses: number;
  memberBreakdown: MemberFinanceSummary[];
}

export interface Income {
  id: string;
  name: string;
  amount: number; // in UZS (integer)
  date: string; // YYYY-MM-DD
  isRecurring: boolean;
  category: IncomeCategory;
  notes?: string;
  memberId?: string | null;
  accountId?: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number; // in UZS (integer)
  date: string; // YYYY-MM-DD
  description: string;
  isRecurring: boolean;
  isEssential?: boolean; // essential vs flexible/discretionary
  memberId?: string | null;
  accountId?: string;
}

export interface UtilityBill {
  id: string;
  category: UtilityCategory;
  amount: number; // in UZS (integer)
  month: string; // YYYY-MM
  dueDate: string; // YYYY-MM-DD
  isPaid: boolean;
  paidDate?: string;
  description?: string;
  meterReading?: number;
  accountNumber?: string; // Subscriber/personal account number for payment providers
  paymentTransactionId?: string; // Reference to PaymentTransaction once processed
  memberId?: string | null;
}

export interface MandatoryPayment {
  id: string;
  name: string;
  category: MandatoryCategory;
  amount: number; // in UZS (integer)
  month: string; // YYYY-MM
  dueDate: string; // YYYY-MM-DD
  isPaid: boolean;
  paidDate?: string;
  notes?: string;
  paymentTransactionId?: string;
  taxType?: TaxType;
  isOfficial?: boolean; // false if user-entered / estimated
  isEstimated?: boolean; // true if auto-calculated based on income
  memberId?: string | null;
}

export type TaxType =
  | 'income_tax' // JShODS (Jismoniy shaxs daromad solig'i - 12%)
  | 'turnover_tax' // YTT / Aylanmadan soliq (4%)
  | 'fixed_tax' // Qat'iy belgilangan soliq
  | 'self_employed' // O'zini o'zi band qilgan (0% daromad soliq + ijtimoiy to'lov)
  | 'property_tax' // Mol-mulk va yer solig'i
  | 'social_tax' // Ijtimoiy soliq
  | 'custom'; // Boshqa / maxsus soliq stavkasi

export type TaxProfileType =
  | 'individual' // Jismoniy shaxs (Oylik maosh oluvchi)
  | 'entrepreneur' // YTT (Yakka tartibdagi tadbirkor)
  | 'self_employed' // O'zini o'zi band qilgan shaxs
  | 'legal_entity'; // Kichik korxona / yuridik shaxs

export type TaxIncomeSource =
  | 'salary' // Rasmiy oylik maosh
  | 'business' // Savdo va tijorat
  | 'freelance' // Frilans, IT va masofaviy xizmatlar
  | 'rent' // Ko'chmas mulk ijarasi
  | 'other'; // Boshqa daromadlar

export type TaxCalculationMethod =
  | 'percentage' // Daromaddan foiz hisobida (masalan 12% yoki 4%)
  | 'fixed_amount' // Qat'iy belgilangan oylik summa
  | 'tiered' // Shkala / BHM karralik stavka
  | 'manual'; // Foydalanuvchi tomonidan kiritilgan summa

export type TaxPaymentPeriod =
  | 'monthly' // Har oyda
  | 'quarterly' // Har chorakda
  | 'annual'; // Yilda bir marta

export type TaxObligationStatus =
  | 'scheduled' // Rejalashtirilgan
  | 'approaching' // Yaqinlashmoqda (7 kun qoldi)
  | 'overdue' // Muddati o‘tgan
  | 'paid' // To‘langan
  | 'needs_review'; // Tekshirilishi kerak

export type ReminderTiming = 7 | 3 | 1 | 0; // 7 kun, 3 kun, 1 kun oldin va deadline kuni

export interface TaxProfile {
  id: string;
  taxType: TaxType;
  profileType: TaxProfileType;
  incomeSource: TaxIncomeSource;
  calculationMethod: TaxCalculationMethod;
  customRatePercent?: number; // e.g. 12 for 12%, 4 for 4%
  fixedMonthlyAmount?: number; // in UZS
  paymentPeriod: TaxPaymentPeriod;
  dueDayOfMonth: number; // e.g. 15 for 15th of the month
  allocatedReserveAmount: number; // Reserved amount for tax
  autoReserveFromIncome: boolean; // Auto update reserve when income changes
  remindersEnabled: boolean;
  reminderDaysBefore: ReminderTiming[]; // e.g. [7, 3, 1, 0]
  tinOrPinfl?: string; // Tax identification number (PINFL/STIR) - client-only label
  notes?: string;
}

export interface TaxEstimationResult {
  taxType: TaxType;
  profileType: TaxProfileType;
  calculationMethod: TaxCalculationMethod;
  taxableIncome: number;
  ratePercent: number;
  calculatedTaxAmount: number; // X UZS
  amountToPay: number; // X UZS
  periodLabel: string;
  formulaDescription: string;
  disclaimer: string; // "Taxminiy hisob-kitob. Rasmiy soliq majburiyati o‘rnini bosmaydi."
  isOfficialSource: boolean; // always false until official API is connected
}

export interface AppReminderNotification {
  id: string;
  sourceType: 'tax' | 'utility' | 'goal';
  sourceId: string;
  title: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
  status: TaxObligationStatus;
  message: string;
  isRead: boolean;
  timingTrigger: ReminderTiming | -1; // -1 for overdue
}

export interface UpcomingPaymentItem {
  id: string;
  type: 'tax' | 'utility' | 'goal';
  title: string;
  amount: number;
  dueDate: string;
  dueDateLabel: string;
  daysRemaining: number;
  status: TaxObligationStatus;
  statusLabel: string;
  badgeColorClass: string;
  iconType: 'tax' | 'utility' | 'goal' | 'mandatory';
  targetTab: 'expenses' | 'goals';
  targetSubTab?: 'mandatory' | 'utilities' | 'planner';
  memberId?: string | null;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number; // in UZS (integer)
  currentSavedAmount: number; // in UZS (integer)
  deadline: string; // YYYY-MM-DD
  targetMonth: string; // YYYY-MM
  priority: GoalPriority;
  status: GoalStatus;
  category?: string;
  notes?: string;
  memberId?: string | null;
  monthlyTargetSavings?: number;
}

export interface MonthlyFinancialSummary {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpenses: number;
  totalUtilities: number; // Planned/budgeted total utility bills
  totalMandatory: number; // Planned/budgeted total mandatory payments
  actualPaidUtilities: number; // Confirmed paid utility payments only
  unpaidUtilitiesAmount: number; // Pending unpaid utility bills
  actualPaidMandatory: number; // Confirmed paid mandatory payments only
  unpaidMandatoryAmount: number; // Pending unpaid mandatory payments
  actualConfirmedExpenses: number; // Confirmed outflows: everyday expenses + paid utilities + paid mandatory
  totalCommittedNecessary: number; // mandatory + utilities + essential expenses
  flexibleExpenses: number; // discretionary spending
  availableMoney: number; // Income - (Expenses + Utilities + Mandatory)
  goalReserve: number; // Sum allocated towards active goals this month
  remainingSafeToSpendMonth: number; // availableMoney after goal reserve
  safeToSpendDaily: number;
  safeToSpendWeekly: number;
  totalUnpaidBillsCount: number;
  totalUnpaidBillsAmount: number;
}

export interface GoalPlanAnalysis {
  goalId?: string;
  goalName: string;
  targetAmount: number;
  targetMonth: string;
  
  // Step-by-step breakdown
  expectedIncome: number;
  mandatoryExpenses: number; // taxes + utilities + mandatory fees
  plannedEverydayExpenses: number;
  availableBeforeGoal: number; // expectedIncome - (mandatory + everyday)
  requiredGoalAmount: number;
  safeToSpendRemainingMonth: number; // availableBeforeGoal - requiredGoalAmount
  
  // Daily and weekly velocity
  daysInPeriod: number;
  daysRemainingInMonth: number;
  dailyGoalSaving: number;
  weeklyGoalSaving: number;
  dailyFlexibleLimit: number;
  weeklyFlexibleLimit: number;

  // Achievability assessment
  isAchievable: boolean;
  statusText: string;
  shortfall: number; // if not achievable, how much is missing
  maxAffordableGoal: number; // maximum safe goal amount given current finances
  additionalIncomeNeeded: number;
  spendingReductionNeeded: number;

  // Recommendations / possible adjustments
  suggestedSpendingReduction: number;
  suggestedIncomeIncrease: number;
}

export type ActiveTab =
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'utilities'
  | 'mandatory'
  | 'goals'
  | 'goal-planner'
  | 'reports'
  | 'settings';

export type AccountType = 'card' | 'cash' | 'bank' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  currency: string;
  notes?: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export * from './services/payment/types';
