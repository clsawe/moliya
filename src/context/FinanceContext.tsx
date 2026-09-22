import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Income,
  Expense,
  UtilityBill,
  MandatoryPayment,
  FinancialGoal,
  MonthlyFinancialSummary,
  GoalPlanAnalysis,
  ActiveTab,
  PaymentTransaction,
  TaxProfile,
  TaxEstimationResult,
  AppReminderNotification,
  UpcomingPaymentItem,
  Family,
  FamilyMember,
  FamilyFinanceSummary,
  MemberFinanceSummary,
  Account,
  Transfer,
} from '../types';
import {
  INITIAL_MONTH,
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_UTILITIES,
  INITIAL_MANDATORY,
  INITIAL_GOALS,
  INITIAL_TAX_PROFILE,
  INITIAL_FAMILY,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSFERS,
  DEMO_FAMILY,
  DEMO_FAMILY_MEMBERS,
  DEMO_ACCOUNTS,
  DEMO_INCOMES,
  DEMO_EXPENSES,
  DEMO_TRANSFERS,
  DEMO_UTILITIES,
  DEMO_MANDATORY,
  DEMO_GOALS,
  DEMO_TAX_PROFILE,
} from '../data/initialData';
import {
  calculateMonthlySummary,
  analyzeGoalPlan,
  calculateFamilySummary,
  calculateFamilyBalance,
  calculateAccountBalance as calcAccBal,
  calculateTotalAssets as calcTotAssets,
} from '../engine/financeCalculations';
import { calculateEstimatedTax, calculateDeadlineStatus } from '../config/taxRatesConfig';
import { generateUpcomingReminders } from '../services/reminder/ReminderService';
import { formatUzbekDate } from '../utils/formatters';

interface FinanceContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  expensesSubTab: 'everyday' | 'utilities' | 'mandatory' | 'analytics';
  setExpensesSubTab: (tab: 'everyday' | 'utilities' | 'mandatory' | 'analytics') => void;
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  
  // Data
  incomes: Income[];
  expenses: Expense[];
  utilities: UtilityBill[];
  mandatoryPayments: MandatoryPayment[];
  goals: FinancialGoal[];
  paymentTransactions: PaymentTransaction[];
  accounts: Account[];
  transfers: Transfer[];

  // Tax Profile & Automation
  taxProfile: TaxProfile;
  updateTaxProfile: (updates: Partial<TaxProfile>) => void;
  estimatedTax: TaxEstimationResult;
  syncEstimatedTaxToMonth: (monthStr?: string) => void;

  // Reminders & Upcoming Payments
  reminders: AppReminderNotification[];
  upcomingPayments: UpcomingPaymentItem[];

  // Summaries
  summary: MonthlyFinancialSummary;
  familySummary: FamilyFinanceSummary;

  // Family & Members
  family: Family;
  familyMembers: FamilyMember[];
  activeFamilyMembers: FamilyMember[];
  createFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'familyId'>) => FamilyMember;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  toggleFamilyMemberStatus: (id: string) => void;
  updateFamily: (updates: Partial<Family>) => void;
  
  // Goal Planner
  selectedPlannerGoalId: string | null;
  setSelectedPlannerGoalId: (id: string | null) => void;
  activeGoalPlan: GoalPlanAnalysis;
  planCustomGoal: (amount: number, name: string, month?: string) => GoalPlanAnalysis;

  // Actions
  addIncome: (income: Omit<Income, 'id'>) => void;
  updateIncome: (id: string, updates: Partial<Income>) => void;
  deleteIncome: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  addUtility: (utility: Omit<UtilityBill, 'id'>) => void;
  updateUtility: (id: string, updates: Partial<UtilityBill>) => void;
  deleteUtility: (id: string) => void;
  toggleUtilityPaid: (id: string) => void;

  addMandatory: (mandatory: Omit<MandatoryPayment, 'id'>) => void;
  updateMandatory: (id: string, updates: Partial<MandatoryPayment>) => void;
  deleteMandatory: (id: string) => void;
  toggleMandatoryPaid: (id: string) => void;

  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  // Payment transactions
  recordPaymentTransaction: (transaction: PaymentTransaction) => void;

  // Accounts & Transfers
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => Account;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addTransfer: (transfer: Omit<Transfer, 'id' | 'createdAt'>) => Transfer;
  deleteTransfer: (id: string) => void;
  calculateAccountBalance: (accountId: string) => number;
  calculateTotalAssets: () => number;

  // Utility Actions
  resetToDemoData: () => void;
  loadDemoData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;

  // Modals helper
  activeModal: 'income' | 'expense' | 'utility' | 'mandatory' | 'goal' | null;
  openModal: (type: 'income' | 'expense' | 'utility' | 'mandatory' | 'goal' | null) => void;
  closeModal: () => void;
}

const STORAGE_KEYS = {
  INCOMES: 'moliya_incomes_v1',
  EXPENSES: 'moliya_expenses_v1',
  UTILITIES: 'moliya_utilities_v1',
  MANDATORY: 'moliya_mandatory_v1',
  GOALS: 'moliya_goals_v1',
  CURRENT_MONTH: 'moliya_active_month_v1',
  TRANSACTIONS: 'moliya_payment_transactions_v1',
  TAX_PROFILE: 'moliya_tax_profile_v1',
  EXPENSES_SUBTAB: 'moliya_expenses_subtab_v1',
  FAMILY: 'moliya_family_v1',
  FAMILY_MEMBERS: 'moliya_family_members_v1',
  ACCOUNTS: 'moliya_accounts_v1',
  TRANSFERS: 'moliya_transfers_v1',
  SCHEMA_VERSION: 'moliya_schema_version',
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [expensesSubTab, setExpensesSubTab] = useState<'everyday' | 'utilities' | 'mandatory' | 'analytics'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.EXPENSES_SUBTAB) as any) || 'everyday';
  });
  const [currentMonth, setCurrentMonthState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_MONTH) || INITIAL_MONTH;
  });

  // Family & Members state with safe migration check
  const [family, setFamily] = useState<Family>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAMILY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading family:', e);
    }
    return INITIAL_FAMILY;
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading family members:', e);
    }
    return INITIAL_FAMILY_MEMBERS;
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INCOMES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_INCOMES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_EXPENSES;
  });

  const [utilities, setUtilities] = useState<UtilityBill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UTILITIES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_UTILITIES;
  });

  const [mandatoryPayments, setMandatoryPayments] = useState<MandatoryPayment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MANDATORY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MANDATORY;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_GOALS;
  });

  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [taxProfile, setTaxProfile] = useState<TaxProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TAX_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TAX_PROFILE;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACCOUNTS;
  });

  const [transfers, setTransfers] = useState<Transfer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TRANSFERS;
  });

  const [selectedPlannerGoalId, setSelectedPlannerGoalId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      } catch {}
    }
    return INITIAL_GOALS.length > 0 ? INITIAL_GOALS[0].id : null;
  });

  const [activeModal, setActiveModal] = useState<'income' | 'expense' | 'utility' | 'mandatory' | 'goal' | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_MONTH, currentMonth);
  }, [currentMonth]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES_SUBTAB, expensesSubTab);
  }, [expensesSubTab]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UTILITIES, JSON.stringify(utilities));
  }, [utilities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MANDATORY, JSON.stringify(mandatoryPayments));
  }, [mandatoryPayments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(paymentTransactions));
  }, [paymentTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TAX_PROFILE, JSON.stringify(taxProfile));
  }, [taxProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(family));
  }, [family]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(familyMembers));
  }, [familyMembers]);

  // Safe migration check to ensure existing data is preserved and new family structure initialized
  useEffect(() => {
    try {
      const version = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
      if (!version || parseInt(version, 10) < 2) {
        if (!localStorage.getItem(STORAGE_KEYS.FAMILY)) {
          localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(INITIAL_FAMILY));
        }
        if (!localStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS)) {
          localStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(INITIAL_FAMILY_MEMBERS));
        }
        localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, '2');
      }
    } catch (err) {
      console.error('Migration error:', err);
    }
  }, []);

  const activeFamilyMembers = useMemo(() => {
    return familyMembers.filter((m) => m.active);
  }, [familyMembers]);

  const setCurrentMonth = (month: string) => {
    setCurrentMonthState(month);
  };

  // Live recalculate summary
  const summary = useMemo(() => {
    return calculateMonthlySummary(currentMonth, incomes, expenses, utilities, mandatoryPayments, goals);
  }, [currentMonth, incomes, expenses, utilities, mandatoryPayments, goals]);

  // Live recalculate family summary with member breakdown
  const familySummary = useMemo(() => {
    return calculateFamilySummary(
      currentMonth,
      familyMembers,
      incomes,
      expenses,
      utilities,
      mandatoryPayments,
      goals
    );
  }, [currentMonth, familyMembers, incomes, expenses, utilities, mandatoryPayments, goals]);

  // Family CRUD actions
  const createFamilyMember = (member: Omit<FamilyMember, 'id' | 'createdAt' | 'familyId'>): FamilyMember => {
    const newMember: FamilyMember = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      familyId: family.id,
      name: member.name.trim(),
      role: member.role,
      avatar: member.avatar,
      active: member.active ?? true,
      createdAt: new Date().toISOString(),
    };
    setFamilyMembers((prev) => [...prev, newMember]);
    return newMember;
  };

  const updateFamilyMember = (id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const toggleFamilyMemberStatus = (id: string) => {
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  const updateFamily = (updates: Partial<Family>) => {
    setFamily((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Tax Estimation based on current income and user tax profile
  const estimatedTax = useMemo(() => {
    return calculateEstimatedTax(taxProfile, summary.totalIncome);
  }, [taxProfile, summary.totalIncome]);

  // Auto-sync tax reservation if profile has autoReserveFromIncome enabled
  useEffect(() => {
    if (taxProfile.autoReserveFromIncome) {
      const taxAmount = estimatedTax.amountToPay;
      setMandatoryPayments((prev) => {
        const existingIdx = prev.findIndex(
          (m) => m.category === 'tax' && m.month === currentMonth && (m.isEstimated || m.id.startsWith('man-tax'))
        );

        if (existingIdx >= 0) {
          const existing = prev[existingIdx];
          if (!existing.isPaid && existing.amount !== taxAmount) {
            const copy = [...prev];
            copy[existingIdx] = {
              ...existing,
              amount: taxAmount,
              taxType: taxProfile.taxType,
              isEstimated: true,
            };
            return copy;
          }
        }
        return prev;
      });
    }
  }, [estimatedTax.amountToPay, currentMonth, taxProfile.autoReserveFromIncome, taxProfile.taxType]);

  const updateTaxProfile = (updates: Partial<TaxProfile>) => {
    setTaxProfile((prev) => ({ ...prev, ...updates }));
  };

  const syncEstimatedTaxToMonth = (targetMonth = currentMonth) => {
    const currentIncomeTotal = incomes
      .filter((i) => i.date.startsWith(targetMonth))
      .reduce((acc, cur) => acc + cur.amount, 0);

    const calc = calculateEstimatedTax(taxProfile, currentIncomeTotal);
    const taxAmount = calc.amountToPay;

    setMandatoryPayments((prev) => {
      const existingIdx = prev.findIndex(
        (m) => m.category === 'tax' && m.month === targetMonth && (m.isEstimated || m.id.startsWith('man-tax'))
      );

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        if (!existing.isPaid) {
          const copy = [...prev];
          copy[existingIdx] = {
            ...existing,
            amount: taxAmount,
            taxType: taxProfile.taxType,
            isEstimated: true,
          };
          return copy;
        }
        return prev;
      }

      const newTax: MandatoryPayment = {
        id: `man-tax-${Date.now()}`,
        name: `JShODS / Daromad solig‘i (${targetMonth})`,
        category: 'tax',
        amount: taxAmount,
        month: targetMonth,
        dueDate: `${targetMonth}-${String(taxProfile.dueDayOfMonth || 15).padStart(2, '0')}`,
        isPaid: false,
        taxType: taxProfile.taxType,
        isOfficial: false,
        isEstimated: true,
        notes: 'Oylik daromaddan hisoblangan taxminiy soliq zaxirasi',
      };
      return [newTax, ...prev];
    });
  };

  // Generate Reminders
  const reminders = useMemo(() => {
    return generateUpcomingReminders(mandatoryPayments, utilities, taxProfile);
  }, [mandatoryPayments, utilities, taxProfile]);

  // Upcoming Payments for Dashboard
  const upcomingPayments = useMemo(() => {
    const items: UpcomingPaymentItem[] = [];

    // 1. Mandatory Payments & Taxes for current month
    const monthMandatory = mandatoryPayments.filter((m) => !m.isPaid && m.month === currentMonth);
    monthMandatory.forEach((m) => {
      const { status, daysRemaining, statusLabel, badgeColorClass } = calculateDeadlineStatus(m.dueDate, m.isPaid);
      const isTax = m.category === 'tax';
      items.push({
        id: m.id,
        type: 'tax',
        title: isTax ? (m.name.includes('Soliq') ? m.name : `Soliq (${m.name})`) : m.name,
        amount: m.amount,
        dueDate: m.dueDate,
        dueDateLabel: formatUzbekDate(m.dueDate),
        daysRemaining,
        status,
        statusLabel,
        badgeColorClass,
        iconType: isTax ? 'tax' : 'mandatory',
        targetTab: 'expenses',
        targetSubTab: 'mandatory',
        memberId: m.memberId,
      });
    });

    // 2. Unpaid Utilities for current month
    const monthUtilities = utilities.filter((u) => !u.isPaid && u.month === currentMonth);
    monthUtilities.forEach((u) => {
      const { status, daysRemaining, statusLabel, badgeColorClass } = calculateDeadlineStatus(u.dueDate, u.isPaid);
      const utilName =
        u.category === 'electricity'
          ? 'Elektr'
          : u.category === 'gas'
          ? 'Tabiiy gaz'
          : u.category === 'water'
          ? 'Suv taʼminoti'
          : u.category === 'internet'
          ? 'Internet'
          : u.description || u.category;

      items.push({
        id: u.id,
        type: 'utility',
        title: utilName,
        amount: u.amount,
        dueDate: u.dueDate,
        dueDateLabel: formatUzbekDate(u.dueDate),
        daysRemaining,
        status,
        statusLabel,
        badgeColorClass,
        iconType: 'utility',
        targetTab: 'expenses',
        targetSubTab: 'utilities',
        memberId: u.memberId,
      });
    });

    // 3. Active Financial Goals
    const activeGoals = goals.filter((g) => g.status !== 'completed');
    activeGoals.forEach((g) => {
      const needed = Math.max(0, g.targetAmount - g.currentSavedAmount);
      items.push({
        id: g.id,
        type: 'goal',
        title: g.name,
        amount: needed,
        dueDate: g.deadline,
        dueDateLabel: formatUzbekDate(g.deadline),
        daysRemaining: 0,
        status: 'scheduled',
        statusLabel: 'Rejalashtirilgan zaxira',
        badgeColorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        iconType: 'goal',
        targetTab: 'goals',
        targetSubTab: 'planner',
        memberId: g.memberId,
      });
    });

    return items;
  }, [mandatoryPayments, utilities, goals, currentMonth]);

  // Goal plan analysis for the currently selected goal or fallback
  const activeGoalPlan = useMemo(() => {
    const activeGoal = goals.find((g) => g.id === selectedPlannerGoalId) || goals[0];
    if (activeGoal) {
      return analyzeGoalPlan(
        activeGoal.targetAmount,
        activeGoal.name,
        currentMonth,
        summary,
        undefined,
        activeGoal.id
      );
    }
    return analyzeGoalPlan(0, '', currentMonth, summary);
  }, [goals, selectedPlannerGoalId, currentMonth, summary]);

  const planCustomGoal = (amount: number, name: string, month = currentMonth) => {
    return analyzeGoalPlan(amount, name, month, summary);
  };

  // CRUD Incomes
  const addIncome = (income: Omit<Income, 'id'>) => {
    const newRecord: Income = {
      ...income,
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      amount: Math.round(Number(income.amount) || 0),
    };
    setIncomes((prev) => [newRecord, ...prev]);
  };

  const updateIncome = (id: string, updates: Partial<Income>) => {
    setIncomes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, amount: updates.amount !== undefined ? Math.round(Number(updates.amount)) : item.amount } : item))
    );
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((item) => item.id !== id));
  };

  // CRUD Expenses
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newRecord: Expense = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      amount: Math.round(Number(expense.amount) || 0),
    };
    setExpenses((prev) => [newRecord, ...prev]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, amount: updates.amount !== undefined ? Math.round(Number(updates.amount)) : item.amount } : item))
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // CRUD Utilities
  const addUtility = (utility: Omit<UtilityBill, 'id'>) => {
    const newRecord: UtilityBill = {
      ...utility,
      id: `ut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      amount: Math.round(Number(utility.amount) || 0),
    };
    setUtilities((prev) => [newRecord, ...prev]);
  };

  const updateUtility = (id: string, updates: Partial<UtilityBill>) => {
    setUtilities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, amount: updates.amount !== undefined ? Math.round(Number(updates.amount)) : item.amount } : item))
    );
  };

  const deleteUtility = (id: string) => {
    setUtilities((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleUtilityPaid = (id: string) => {
    setUtilities((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextPaid = !item.isPaid;
          return {
            ...item,
            isPaid: nextPaid,
            paidDate: nextPaid ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return item;
      })
    );
  };

  // CRUD Mandatory
  const addMandatory = (mandatory: Omit<MandatoryPayment, 'id'>) => {
    const newRecord: MandatoryPayment = {
      ...mandatory,
      id: `man-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      amount: Math.round(Number(mandatory.amount) || 0),
    };
    setMandatoryPayments((prev) => [newRecord, ...prev]);
  };

  const updateMandatory = (id: string, updates: Partial<MandatoryPayment>) => {
    setMandatoryPayments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, amount: updates.amount !== undefined ? Math.round(Number(updates.amount)) : item.amount } : item))
    );
  };

  const deleteMandatory = (id: string) => {
    setMandatoryPayments((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleMandatoryPaid = (id: string) => {
    setMandatoryPayments((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextPaid = !item.isPaid;
          return {
            ...item,
            isPaid: nextPaid,
            paidDate: nextPaid ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return item;
      })
    );
  };

  // CRUD Goals
  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const targetAmount = Math.round(Number(goal.targetAmount) || 0);
    const currentSavedAmount = Math.round(Number(goal.currentSavedAmount) || 0);
    const newRecord: FinancialGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      targetAmount,
      currentSavedAmount,
      status: currentSavedAmount >= targetAmount ? 'completed' : goal.status,
    };
    setGoals((prev) => [newRecord, ...prev]);
    setSelectedPlannerGoalId(newRecord.id);
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setGoals((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const targetAmount = updates.targetAmount !== undefined ? Math.round(Number(updates.targetAmount)) : item.targetAmount;
          const currentSavedAmount = updates.currentSavedAmount !== undefined ? Math.round(Number(updates.currentSavedAmount)) : item.currentSavedAmount;
          let status = updates.status || item.status;
          if (currentSavedAmount >= targetAmount) {
            status = 'completed';
          }
          return { ...item, ...updates, targetAmount, currentSavedAmount, status };
        }
        return item;
      })
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => {
      const remaining = prev.filter((item) => item.id !== id);
      if (selectedPlannerGoalId === id) {
        setSelectedPlannerGoalId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  const contributeToGoal = (id: string, amount: number) => {
    const cleanAmount = Math.round(Number(amount) || 0);
    if (cleanAmount <= 0) return;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newSaved = g.currentSavedAmount + cleanAmount;
          return {
            ...g,
            currentSavedAmount: newSaved,
            status: newSaved >= g.targetAmount ? 'completed' : g.status,
          };
        }
        return g;
      })
    );
  };

  // Record payment transaction (strictly links confirmed payments to utility expense)
  const recordPaymentTransaction = (transaction: PaymentTransaction) => {
    setPaymentTransactions((prev) => [transaction, ...prev]);

    // If transaction is completed and linked to a utility bill, mark the utility as confirmed paid
    if (transaction.status === 'completed' && transaction.utilityBillId) {
      setUtilities((prev) =>
        prev.map((u) => {
          if (u.id === transaction.utilityBillId) {
            return {
              ...u,
              isPaid: true,
              paidDate: transaction.completedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
              paymentTransactionId: transaction.id,
            };
          }
          return u;
        })
      );
    }
  };

  // Accounts CRUD
  const addAccount = (acc: Omit<Account, 'id' | 'createdAt'>): Account => {
    const newAcc: Account = {
      ...acc,
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      openingBalance: Math.round(Number(acc.openingBalance) || 0),
    };
    setAccounts((prev) => [...prev, newAcc]);
    return newAcc;
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, openingBalance: updates.openingBalance !== undefined ? Math.round(Number(updates.openingBalance) || 0) : a.openingBalance } : a))
    );
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  // Transfers CRUD
  const addTransfer = (tr: Omit<Transfer, 'id' | 'createdAt'>): Transfer => {
    const newTr: Transfer = {
      ...tr,
      id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      amount: Math.round(Number(tr.amount) || 0),
    };
    setTransfers((prev) => [newTr, ...prev]);
    return newTr;
  };

  const deleteTransfer = (id: string) => {
    setTransfers((prev) => prev.filter((t) => t.id !== id));
  };

  const calculateAccountBalance = (accountId: string): number => {
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return 0;
    return calcAccBal(acc, incomes, expenses, transfers);
  };

  const calculateTotalAssets = (): number => {
    return calcTotAssets(accounts, incomes, expenses, transfers);
  };

  // Demo & Reset
  const loadDemoData = () => {
    setFamily(DEMO_FAMILY);
    setFamilyMembers(DEMO_FAMILY_MEMBERS);
    setIncomes(DEMO_INCOMES);
    setExpenses(DEMO_EXPENSES);
    setUtilities(DEMO_UTILITIES);
    setMandatoryPayments(DEMO_MANDATORY);
    setGoals(DEMO_GOALS);
    setAccounts(DEMO_ACCOUNTS);
    setTransfers(DEMO_TRANSFERS);
    setTaxProfile(DEMO_TAX_PROFILE);
    setPaymentTransactions([]);
    setSelectedPlannerGoalId(DEMO_GOALS[0]?.id || null);
    setCurrentMonthState(INITIAL_MONTH);
  };

  const clearAllData = () => {
    setFamily(INITIAL_FAMILY);
    setFamilyMembers([]);
    setIncomes([]);
    setExpenses([]);
    setUtilities([]);
    setMandatoryPayments([]);
    setGoals([]);
    setAccounts([]);
    setTransfers([]);
    setPaymentTransactions([]);
    setSelectedPlannerGoalId(null);
  };

  const resetToDemoData = () => {
    loadDemoData();
  };

  const exportDataJSON = () => {
    const payload = {
      currentMonth,
      family,
      familyMembers,
      accounts,
      transfers,
      incomes,
      expenses,
      utilities,
      mandatoryPayments,
      goals,
      paymentTransactions,
      taxProfile,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.family) setFamily(parsed.family);
      if (parsed.familyMembers && Array.isArray(parsed.familyMembers)) setFamilyMembers(parsed.familyMembers);
      if (parsed.accounts && Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
      if (parsed.transfers && Array.isArray(parsed.transfers)) setTransfers(parsed.transfers);
      if (parsed.incomes && Array.isArray(parsed.incomes)) setIncomes(parsed.incomes);
      if (parsed.expenses && Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
      if (parsed.utilities && Array.isArray(parsed.utilities)) setUtilities(parsed.utilities);
      if (parsed.mandatoryPayments && Array.isArray(parsed.mandatoryPayments)) setMandatoryPayments(parsed.mandatoryPayments);
      if (parsed.goals && Array.isArray(parsed.goals)) setGoals(parsed.goals);
      if (parsed.paymentTransactions && Array.isArray(parsed.paymentTransactions)) setPaymentTransactions(parsed.paymentTransactions);
      if (parsed.taxProfile) setTaxProfile(parsed.taxProfile);
      if (parsed.currentMonth && typeof parsed.currentMonth === 'string') setCurrentMonthState(parsed.currentMonth);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const openModal = (type: 'income' | 'expense' | 'utility' | 'mandatory' | 'goal' | null) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        expensesSubTab,
        setExpensesSubTab,
        currentMonth,
        setCurrentMonth,
        incomes,
        expenses,
        utilities,
        mandatoryPayments,
        goals,
        paymentTransactions,
        accounts,
        transfers,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransfer,
        deleteTransfer,
        calculateAccountBalance,
        calculateTotalAssets,
        taxProfile,
        updateTaxProfile,
        estimatedTax,
        syncEstimatedTaxToMonth,
        reminders,
        upcomingPayments,
        summary,
        familySummary,
        family,
        familyMembers,
        activeFamilyMembers,
        createFamilyMember,
        updateFamilyMember,
        toggleFamilyMemberStatus,
        updateFamily,
        selectedPlannerGoalId,
        setSelectedPlannerGoalId,
        activeGoalPlan,
        planCustomGoal,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        addUtility,
        updateUtility,
        deleteUtility,
        toggleUtilityPaid,
        addMandatory,
        updateMandatory,
        deleteMandatory,
        toggleMandatoryPaid,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        recordPaymentTransaction,
        resetToDemoData,
        loadDemoData,
        clearAllData,
        exportDataJSON,
        importDataJSON,
        activeModal,
        openModal,
        closeModal,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
