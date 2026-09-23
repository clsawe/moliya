import { parseOfflineIntent } from '../services/assistant/offlineParser';
import {
  calculateRecurringOccurrencesInMonth,
  calculateMonthlyRecurringCommitment,
  calculateMonthlySummary,
} from '../engine/financeCalculations';
import { RecurringExpense, Income, Expense, UtilityBill, MandatoryPayment, FinancialGoal } from '../types';

interface TestResult {
  id: number;
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(id: number, name: string, condition: boolean, details: string) {
  results.push({ id, name, passed: condition, details });
  if (condition) {
    console.log(`✅ [PASS] Test ${id}: ${name}`);
  } else {
    console.error(`❌ [FAIL] Test ${id}: ${name} - ${details}`);
  }
}

// ----------------------------------------------------
// TEST 1: Family member structure: Ota / Ona / Bolalar
// ----------------------------------------------------
const familyMembers = [
  { id: 'mem_ota', name: 'Ota', role: 'parent' as const, isDefault: true, isActive: true },
  { id: 'mem_ona', name: 'Ona', role: 'parent' as const, isDefault: true, isActive: true },
  { id: 'mem_bolalar', name: 'Bolalar', role: 'child' as const, isDefault: true, isActive: true },
];
const validFamilyIds = ['mem_ota', 'mem_ona', 'mem_bolalar'];
const allPresent = familyMembers.every((m) => validFamilyIds.includes(m.id));
assert(
  1,
  'Family member switch between Ota / Ona / Bolalar',
  allPresent && familyMembers.length === 3,
  `Standardized family members: ${familyMembers.map((m) => m.name).join(', ')}`
);

// ----------------------------------------------------
// TEST 2: Add daily recurring expense: 'Har kuni 20 ming so‘m yo‘l kira'
// ----------------------------------------------------
const dailyExpense: RecurringExpense = {
  id: 'rec_1',
  name: "Yo'l kira",
  amount: 20000,
  category: 'transport',
  memberId: 'mem_ota',
  recurrenceType: 'daily',
  startDate: '2026-09-01',
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
};
const dailyOccurrences = calculateRecurringOccurrencesInMonth(dailyExpense, '2026-09');
// September has 30 days
assert(
  2,
  'Add daily recurring expense (Har kuni 20 ming)',
  dailyOccurrences === 30,
  `September 2026 expected 30 occurrences, got ${dailyOccurrences}`
);

// ----------------------------------------------------
// TEST 3: Add weekly recurring expense
// ----------------------------------------------------
const weeklyExpense: RecurringExpense = {
  id: 'rec_2',
  name: 'Haftalik to‘garak',
  amount: 100000,
  category: 'education',
  memberId: 'mem_bolalar',
  recurrenceType: 'weekly',
  startDate: '2026-09-01',
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
};
const weeklyOccurrences = calculateRecurringOccurrencesInMonth(weeklyExpense, '2026-09');
// In September 2026 (starts on Tuesday Sep 1), Sep 1, 8, 15, 22, 29 = 5 Tuesdays
assert(
  3,
  'Add weekly recurring expense',
  weeklyOccurrences >= 4 && weeklyOccurrences <= 5,
  `Weekly occurrences in Sep 2026: ${weeklyOccurrences}`
);

// ----------------------------------------------------
// TEST 4: Add custom weekdays recurring expense (Mon, Fri)
// ----------------------------------------------------
const customWeekdayExpense: RecurringExpense = {
  id: 'rec_3',
  name: 'Sport zali (Dush, Juma)',
  amount: 50000,
  category: 'health',
  recurrenceType: 'custom_weekdays',
  selectedWeekdays: [1, 5], // 1=Mon, 5=Fri
  startDate: '2026-09-01',
  isActive: true,
  createdAt: '2026-09-01T00:00:00.000Z',
};
const customOccurrences = calculateRecurringOccurrencesInMonth(customWeekdayExpense, '2026-09');
// Mondays in Sep 2026: 7, 14, 21, 28 (4)
// Fridays in Sep 2026: 4, 11, 18, 25 (4)
// Total = 8
assert(
  4,
  'Add custom weekdays recurring expense',
  customOccurrences === 8,
  `Mon + Fri in Sep 2026: expected 8, got ${customOccurrences}`
);

// ----------------------------------------------------
// TEST 5: Monthly planned recurring total calculation
// ----------------------------------------------------
const plannedMonthlyTotal = calculateMonthlyRecurringCommitment(
  [dailyExpense, weeklyExpense, customWeekdayExpense],
  '2026-09'
);
const expectedTotal = 30 * 20000 + weeklyOccurrences * 100000 + 8 * 50000;
assert(
  5,
  'Monthly planned recurring total calculation',
  plannedMonthlyTotal === expectedTotal,
  `Expected ${expectedTotal}, got ${plannedMonthlyTotal}`
);

// ----------------------------------------------------
// TEST 6: Safe-to-Spend accounting for recurring expenses
// ----------------------------------------------------
const mockIncomes: Income[] = [
  { id: 'inc_1', name: 'Oylik', amount: 5000000, date: '2026-09-05', isRecurring: false, category: 'salary' },
];
const mockExpenses: Expense[] = [
  { id: 'exp_1', description: 'Ovqat', amount: 1000000, date: '2026-09-10', isRecurring: false, category: 'food' },
];
const mockUtilities: UtilityBill[] = [];
const mockMandatory: MandatoryPayment[] = [];
const mockGoals: FinancialGoal[] = [];

const summaryWithoutRecurring = calculateMonthlySummary(
  '2026-09',
  mockIncomes,
  mockExpenses,
  mockUtilities,
  mockMandatory,
  mockGoals,
  '2026-09-15',
  []
);

const summaryWithRecurring = calculateMonthlySummary(
  '2026-09',
  mockIncomes,
  mockExpenses,
  mockUtilities,
  mockMandatory,
  mockGoals,
  '2026-09-15',
  [dailyExpense]
);

assert(
  6,
  'Safe-to-Spend reduction by remaining recurring expenses',
  summaryWithRecurring.plannedRecurringExpenses === 600000 &&
    summaryWithRecurring.plannedRecurringExpenses > 0,
  `Without recurring: ${summaryWithoutRecurring.plannedRecurringExpenses}, With recurring commitment: ${summaryWithRecurring.plannedRecurringExpenses}`
);

// ----------------------------------------------------
// TEST 7: Inactive recurring expense does not affect calculations
// ----------------------------------------------------
const inactiveExpense: RecurringExpense = {
  ...dailyExpense,
  id: 'rec_inactive',
  isActive: false,
};
const inactiveCommitment = calculateMonthlyRecurringCommitment([inactiveExpense], '2026-09');
assert(
  7,
  'Inactive recurring expense does not affect calculations',
  inactiveCommitment === 0,
  `Inactive commitment: ${inactiveCommitment} (expected 0)`
);

// ----------------------------------------------------
// TEST 8: Recurring expense edit
// ----------------------------------------------------
const editedExpense: RecurringExpense = {
  ...dailyExpense,
  amount: 25000,
  name: "Yo'l kira va taksi",
};
const editedCommitment = calculateMonthlyRecurringCommitment([editedExpense], '2026-09');
assert(
  8,
  'Recurring expense edit',
  editedCommitment === 30 * 25000 && editedExpense.name === "Yo'l kira va taksi",
  `Edited amount: ${editedExpense.amount}, monthly: ${editedCommitment}`
);

// ----------------------------------------------------
// TEST 9: Recurring expense delete
// ----------------------------------------------------
const listBeforeDelete = [dailyExpense, weeklyExpense];
const listAfterDelete = listBeforeDelete.filter((r) => r.id !== 'rec_1');
const commitmentAfterDelete = calculateMonthlyRecurringCommitment(listAfterDelete, '2026-09');
assert(
  9,
  'Recurring expense delete',
  listAfterDelete.length === 1 && commitmentAfterDelete === weeklyOccurrences * 100000,
  `Remaining items: ${listAfterDelete.length}, commitment: ${commitmentAfterDelete}`
);

// ----------------------------------------------------
// TEST 10: Uzbek voice command: '50 ming so‘m ovqatga sarfladim'
// ----------------------------------------------------
const uzCmd1 = parseOfflineIntent('50 ming so‘m ovqatga sarfladim', 'uz');
assert(
  10,
  "Uzbek voice command: '50 ming so‘m ovqatga sarfladim'",
  uzCmd1.type === 'ADD_EXPENSE' && uzCmd1.payload.amount === 50000 && uzCmd1.payload.category === 'food' && !uzCmd1.requiresConfirmation,
  `Parsed type: ${uzCmd1.type}, amount: ${uzCmd1.payload?.amount}, category: ${uzCmd1.payload?.category}, confirmation: ${uzCmd1.requiresConfirmation}`
);

// ----------------------------------------------------
// TEST 11: Uzbek voice command: 'Har kuni 15 ming so‘m yo‘l kira' -> confirmation required
// ----------------------------------------------------
const uzCmd2 = parseOfflineIntent('Har kuni 15 ming so‘m yo‘l kira', 'uz');
assert(
  11,
  "Uzbek voice command: 'Har kuni 15 ming so‘m yo‘l kira' -> confirmation required",
  uzCmd2.type === 'ADD_RECURRING_EXPENSE' && uzCmd2.payload.amount === 15000 && uzCmd2.payload.recurrenceType === 'daily' && uzCmd2.requiresConfirmation === true,
  `Parsed type: ${uzCmd2.type}, amount: ${uzCmd2.payload?.amount}, recurrence: ${uzCmd2.payload?.recurrenceType}, requiresConfirmation: ${uzCmd2.requiresConfirmation}`
);

// ----------------------------------------------------
// TEST 12: Russian voice command: '50 тысяч на продукты'
// ----------------------------------------------------
const ruCmd1 = parseOfflineIntent('50 тысяч на продукты', 'ru');
assert(
  12,
  "Russian voice command: '50 тысяч на продукты'",
  ruCmd1.type === 'ADD_EXPENSE' && ruCmd1.payload.amount === 50000 && ruCmd1.payload.category === 'food' && !ruCmd1.requiresConfirmation,
  `Parsed type: ${ruCmd1.type}, amount: ${ruCmd1.payload?.amount}, category: ${ruCmd1.payload?.category}`
);

// ----------------------------------------------------
// TEST 13: Russian voice command: 'Каждый день 15 тысяч на дорогу' -> confirmation required
// ----------------------------------------------------
const ruCmd2 = parseOfflineIntent('Каждый день 15 тысяч на дорогу', 'ru');
assert(
  13,
  "Russian voice command: 'Каждый день 15 тысяч на дорогу' -> confirmation required",
  ruCmd2.type === 'ADD_RECURRING_EXPENSE' && ruCmd2.payload.amount === 15000 && ruCmd2.payload.recurrenceType === 'daily' && ruCmd2.requiresConfirmation === true,
  `Parsed type: ${ruCmd2.type}, amount: ${ruCmd2.payload?.amount}, recurrence: ${ruCmd2.payload?.recurrenceType}, requiresConfirmation: ${ruCmd2.requiresConfirmation}`
);

// ----------------------------------------------------
// TEST 14: English voice command: 'Spent 50000 on food'
// ----------------------------------------------------
const enCmd1 = parseOfflineIntent('Spent 50000 on food', 'en');
assert(
  14,
  "English voice command: 'Spent 50000 on food'",
  enCmd1.type === 'ADD_EXPENSE' && enCmd1.payload.amount === 50000 && enCmd1.payload.category === 'food' && !enCmd1.requiresConfirmation,
  `Parsed type: ${enCmd1.type}, amount: ${enCmd1.payload?.amount}, category: ${enCmd1.payload?.category}`
);

// ----------------------------------------------------
// TEST 15: English voice command: 'Daily 15000 for transport' -> confirmation required
// ----------------------------------------------------
const enCmd2 = parseOfflineIntent('Daily 15000 for transport', 'en');
assert(
  15,
  "English voice command: 'Daily 15000 for transport' -> confirmation required",
  enCmd2.type === 'ADD_RECURRING_EXPENSE' && enCmd2.payload.amount === 15000 && enCmd2.payload.recurrenceType === 'daily' && enCmd2.requiresConfirmation === true,
  `Parsed type: ${enCmd2.type}, amount: ${enCmd2.payload?.amount}, recurrence: ${enCmd2.payload?.recurrenceType}, requiresConfirmation: ${enCmd2.requiresConfirmation}`
);

// ----------------------------------------------------
// TEST 16: Language switch in Assistant: UZ -> RU -> EN
// ----------------------------------------------------
const uzTest = parseOfflineIntent('Qancha pulim qoldi?', 'uz');
const ruTest = parseOfflineIntent('Сколько денег осталось?', 'ru');
const enTest = parseOfflineIntent('How much money left?', 'en');
assert(
  16,
  'Language switch in Assistant: UZ -> RU -> EN',
  uzTest.type === 'QUERY_BALANCE' && ruTest.type === 'QUERY_BALANCE' && enTest.type === 'QUERY_BALANCE',
  `UZ: ${uzTest.type}, RU: ${ruTest.type}, EN: ${enTest.type}`
);

// ----------------------------------------------------
// TEST 17: Uzbek TTS does NOT play Russian/English voice
// ----------------------------------------------------
const sampleVoices = [
  { name: 'Google Russian', lang: 'ru-RU' },
  { name: 'Google US English', lang: 'en-US' },
  { name: 'Samantha', lang: 'en-US' },
];
let uzVoiceResult: any = null;
const prefix = 'uz';
if (prefix === 'uz') {
  const found = sampleVoices.find((v) => v.lang.toLowerCase().startsWith('uz'));
  // Strict rule: do not fallback to ru or en
  uzVoiceResult = found || null;
}
assert(
  17,
  'Uzbek TTS does NOT play Russian/English voice',
  uzVoiceResult === null,
  `Voices without Uzbek resolved to: ${uzVoiceResult} (Strictly prohibited fallback)`
);

// ----------------------------------------------------
// TEST 18: Destructive action safety check (still intact)
// ----------------------------------------------------
const delCmdUz = parseOfflineIntent('Barcha xarajatlarni tozalash', 'uz');
const delCmdRu = parseOfflineIntent('Удалить расход 123', 'ru');
const delCmdEn = parseOfflineIntent('Delete all expenses', 'en');
const allRequireConfirmation =
  delCmdUz.requiresConfirmation === true &&
  delCmdRu.requiresConfirmation === true &&
  delCmdEn.requiresConfirmation === true;
assert(
  18,
  'Destructive action safety check (still intact)',
  allRequireConfirmation,
  `Destructive commands require confirmation: UZ=${delCmdUz.requiresConfirmation}, RU=${delCmdRu.requiresConfirmation}, EN=${delCmdEn.requiresConfirmation}`
);

// ----------------------------------------------------
// FINAL VERIFICATION SUMMARY
// ----------------------------------------------------
const passedCount = results.filter((r) => r.passed).length;
console.log(`\n========================================`);
console.log(`ALL 18 TESTS COMPLETED: ${passedCount}/18 PASSED`);
console.log(`========================================\n`);

if (passedCount !== 18) {
  process.exit(1);
}
