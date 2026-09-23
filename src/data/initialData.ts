import {
  Income,
  Expense,
  UtilityBill,
  MandatoryPayment,
  FinancialGoal,
  TaxProfile,
  Family,
  FamilyMember,
  Account,
  Transfer,
  RecurringExpense,
} from '../types';

export const INITIAL_MONTH = '2026-09';
export const PREVIOUS_MONTH = '2026-08';

/**
 * Standard 3 Family Groups
 * 1. Ota
 * 2. Ona
 * 3. Bolalar
 */
export const STANDARD_FAMILY_GROUPS: FamilyMember[] = [
  {
    id: 'mem-ota',
    familyId: 'fam-default',
    name: 'Ota',
    role: 'Owner',
    avatarEmoji: '👨',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'mem-ona',
    familyId: 'fam-default',
    name: 'Ona',
    role: 'Adult',
    avatarEmoji: '👩',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'mem-bolalar',
    familyId: 'fam-default',
    name: 'Bolalar',
    role: 'Child',
    avatarEmoji: '🧒',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_FAMILY: Family = {
  id: 'fam-default',
  name: 'Mening oilam',
  currency: 'UZS',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = STANDARD_FAMILY_GROUPS;
export const INITIAL_INCOMES: Income[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_RECURRING_EXPENSES: RecurringExpense[] = [];
export const INITIAL_UTILITIES: UtilityBill[] = [];
export const INITIAL_MANDATORY: MandatoryPayment[] = [];
export const INITIAL_GOALS: FinancialGoal[] = [];
export const INITIAL_ACCOUNTS: Account[] = [];
export const INITIAL_TRANSFERS: Transfer[] = [];

export const INITIAL_TAX_PROFILE: TaxProfile = {
  id: 'tax-prof-default',
  taxType: 'income_tax',
  profileType: 'individual',
  incomeSource: 'salary',
  calculationMethod: 'percentage',
  customRatePercent: 12,
  fixedMonthlyAmount: 0,
  paymentPeriod: 'monthly',
  dueDayOfMonth: 15,
  allocatedReserveAmount: 0,
  autoReserveFromIncome: false,
  remindersEnabled: true,
  reminderDaysBefore: [7, 3, 1, 0],
  notes: 'Standart jismoniy shaxs profili',
};

/**
 * Optional Demo Data for Testing
 * Loaded only when user explicitly clicks "Sinov uchun demo ma'lumotlarni yuklash" in Settings
 */
export const DEMO_FAMILY: Family = {
  id: 'fam-default',
  name: 'Bizning oila',
  currency: 'UZS',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

export const DEMO_FAMILY_MEMBERS: FamilyMember[] = STANDARD_FAMILY_GROUPS;

export const DEMO_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'UZCARD',
    type: 'card',
    openingBalance: 2000000,
    currency: 'UZS',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'acc-2',
    name: 'HUMO',
    type: 'card',
    openingBalance: 500000,
    currency: 'UZS',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

export const DEMO_INCOMES: Income[] = [
  {
    id: 'inc-1',
    name: 'Oylik maosh',
    amount: 5000000,
    date: '2026-09-05',
    isRecurring: true,
    category: 'salary',
    notes: 'Kompaniya tomonidan plastik kartaga oʻtkazilgan',
    memberId: 'mem-1',
    accountId: 'acc-1',
  },
];

export const DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    category: 'food',
    amount: 150000,
    date: '2026-09-03',
    description: 'Oziq-ovqat xaridi',
    isRecurring: false,
    isEssential: true,
    memberId: 'mem-2',
    accountId: 'acc-1',
  },
];

export const DEMO_TRANSFERS: Transfer[] = [
  {
    id: 'tr-1',
    fromAccountId: 'acc-1',
    toAccountId: 'acc-2',
    amount: 300000,
    date: '2026-09-10',
    notes: 'UZCARD dan HUMO ga oʻtkazma',
    createdAt: '2026-09-10T10:00:00.000Z',
  },
];

export const DEMO_UTILITIES: UtilityBill[] = [
  {
    id: 'ut-1',
    category: 'electricity',
    amount: 120000,
    month: '2026-09',
    dueDate: '2026-09-25',
    isPaid: false,
    description: 'Elektr energiyasi toʻlovi',
    accountNumber: '200456789',
  },
  {
    id: 'ut-2',
    category: 'gas',
    amount: 90000,
    month: '2026-09',
    dueDate: '2026-09-25',
    isPaid: true,
    paidDate: '2026-09-10',
    description: 'Tabiiy gaz toʻlovi',
    accountNumber: '100889922',
  },
];

export const DEMO_MANDATORY: MandatoryPayment[] = [
  {
    id: 'man-tax-1',
    name: 'Daromad soligʻi',
    category: 'tax',
    amount: 450000,
    month: '2026-09',
    dueDate: '2026-09-30',
    isPaid: false,
    taxType: 'income_tax',
    isOfficial: false,
    isEstimated: true,
    notes: 'Oylik taxminiy soliq',
  },
];

export const DEMO_GOALS: FinancialGoal[] = [
  {
    id: 'goal-1',
    name: 'Yangi maqsad',
    targetAmount: 6000000,
    currentSavedAmount: 1000000,
    deadline: '2027-03-31',
    targetMonth: '2027-03',
    priority: 'high',
    status: 'on_track',
    category: 'Jamgʻarma',
    notes: '6 oylik jamgʻarma rejasi',
  },
];

export const DEMO_TAX_PROFILE: TaxProfile = {
  id: 'tax-prof-demo',
  taxType: 'income_tax',
  profileType: 'individual',
  incomeSource: 'salary',
  calculationMethod: 'percentage',
  customRatePercent: 12,
  fixedMonthlyAmount: 0,
  paymentPeriod: 'monthly',
  dueDayOfMonth: 15,
  allocatedReserveAmount: 450000,
  autoReserveFromIncome: true,
  remindersEnabled: true,
  reminderDaysBefore: [7, 3, 1, 0],
  notes: 'Jismoniy shaxs 12% profili',
};
