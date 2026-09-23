import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Check,
  X,
  Users,
  AlertCircle,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { RecurringExpense, RecurrenceType, ExpenseCategory } from '../../types';
import { EXPENSE_CATEGORY_LABELS } from '../../utils/formatters';
import {
  calculateRecurringOccurrencesInMonth,
  calculateMonthlyRecurringCommitment,
} from '../../engine/financeCalculations';

const WEEKDAYS = [
  { day: 1, label: 'Dush', full: 'Dushanba' },
  { day: 2, label: 'Sesh', full: 'Seshanba' },
  { day: 3, label: 'Chor', full: 'Chorshanba' },
  { day: 4, label: 'Pay', full: 'Payshanba' },
  { day: 5, label: 'Juma', full: 'Juma' },
  { day: 6, label: 'Shan', full: 'Shanba' },
  { day: 7, label: 'Yak', full: 'Yakshanba' },
];

export const RecurringExpensesView: React.FC = () => {
  const {
    recurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    toggleRecurringExpenseActive,
    currentMonth,
    familyMembers,
    summary,
  } = useFinance();

  const { formatCurrency, formatMonth } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [memberId, setMemberId] = useState<string>('none');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [specificDate, setSpecificDate] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const openAddModal = () => {
    setEditingExpense(null);
    setName('');
    setAmountStr('');
    setCategory('transport');
    setMemberId('none');
    setRecurrenceType('daily');
    setSelectedWeekdays([1, 2, 3, 4, 5]);
    setSpecificDate('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (expense: RecurringExpense) => {
    setEditingExpense(expense);
    setName(expense.name);
    setAmountStr(expense.amount.toString());
    setCategory(expense.category);
    setMemberId(expense.memberId || 'none');
    setRecurrenceType(expense.recurrenceType);
    setSelectedWeekdays(expense.selectedWeekdays || [1, 2, 3, 4, 5]);
    setSpecificDate(expense.specificDate || '');
    setStartDate(expense.startDate);
    setEndDate(expense.endDate || '');
    setIsModalOpen(true);
  };

  const handleWeekdayToggle = (day: number) => {
    if (selectedWeekdays.includes(day)) {
      setSelectedWeekdays(selectedWeekdays.filter((d) => d !== day));
    } else {
      setSelectedWeekdays([...selectedWeekdays, day].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(/\s+/g, ''));
    if (!name.trim() || isNaN(amount) || amount <= 0) return;

    const payload = {
      name: name.trim(),
      amount,
      category,
      memberId: memberId === 'none' ? null : memberId,
      recurrenceType,
      selectedWeekdays: recurrenceType === 'custom_weekdays' ? selectedWeekdays : undefined,
      specificDate: recurrenceType === 'specific_date' ? specificDate : undefined,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate ? endDate : undefined,
      isActive: editingExpense ? editingExpense.isActive : true,
    };

    if (editingExpense) {
      updateRecurringExpense(editingExpense.id, payload);
    } else {
      addRecurringExpense(payload);
    }

    setIsModalOpen(false);
  };

  const activeExpenses = recurringExpenses.filter((r) => r.isActive);
  const plannedMonthlyTotal = summary.plannedRecurringExpenses || 0;

  return (
    <div className="space-y-6">
      {/* Information Header & Stats */}
      <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-slate-500/5 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900/40 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-800/60 pb-5 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
              <Repeat className="w-3.5 h-3.5" />
              <span>Takrorlanuvchi xarajatlar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Rejalashtirilgan to‘lovlar ({formatMonth(currentMonth)})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Har kuni yoki har hafta takrorlanadigan xarajatlarni bir marta belgilang. Tizim ularni joriy oydagi kunlar soniga qarab Safe-to-Spend limitida avtomatik hisoblab boradi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 text-right shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Joriy oylik majburiyat:
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-purple-600 dark:text-purple-400 block">
                {formatCurrency(plannedMonthlyTotal)}
              </span>
            </div>

            <button
              onClick={openAddModal}
              className="min-h-[44px] px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi qo‘shish</span>
            </button>
          </div>
        </div>

        {/* Quick summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50">
            <span className="text-xs text-slate-500 dark:text-slate-400">Jami qoidalar</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">{recurringExpenses.length} ta</p>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50">
            <span className="text-xs text-slate-500 dark:text-slate-400">Faol qoidalar</span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeExpenses.length} ta</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50">
            <span className="text-xs text-slate-500 dark:text-slate-400">Safe-to-Spend ta’siri</span>
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-300 mt-1">Avtomatik chegiriladi</p>
          </div>
        </div>
      </div>

      {/* List of Recurring Expenses */}
      {recurringExpenses.length === 0 ? (
        <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 shadow-xs">
            <Repeat className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Hozircha takrorlanuvchi xarajatlar yo‘q
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Har kungi yo‘l kira, tushlik, haftalik to‘garaklar yoki oylik ijara kabi xarajatlarni rejalashtiring.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Birinchi xarajatni qo‘shish</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recurringExpenses.map((expense) => {
            const occurrences = calculateRecurringOccurrencesInMonth(expense, currentMonth);
            const monthlyTotal = calculateMonthlyRecurringCommitment([expense], currentMonth);
            const member = familyMembers.find((m) => m.id === expense.memberId);

            return (
              <div
                key={expense.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-4.5 transition-all shadow-2xs flex flex-col justify-between ${
                  expense.isActive
                    ? 'border-slate-200 dark:border-slate-800'
                    : 'border-slate-200/50 dark:border-slate-800/50 opacity-60 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{expense.name}</h4>
                        {member && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                            {member.name}
                          </span>
                        )}
                        {!member && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            Umumiy
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {EXPENSE_CATEGORY_LABELS[expense.category]?.label || expense.category}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(expense.amount)}
                      </div>
                      <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 block">
                        {expense.recurrenceType === 'daily' && 'Har kuni'}
                        {expense.recurrenceType === 'weekly' && 'Har hafta'}
                        {expense.recurrenceType === 'custom_weekdays' && 'Hafta kunlari'}
                        {expense.recurrenceType === 'monthly' && 'Har oy'}
                        {expense.recurrenceType === 'specific_date' && `Sana: ${expense.specificDate}`}
                      </span>
                    </div>
                  </div>

                  {/* Recurrence Details */}
                  {expense.recurrenceType === 'custom_weekdays' && expense.selectedWeekdays && (
                    <div className="flex items-center gap-1 my-2">
                      {WEEKDAYS.map((wd) => {
                        const isSelected = expense.selectedWeekdays?.includes(wd.day);
                        return (
                          <span
                            key={wd.day}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              isSelected
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {wd.label}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Monthly Projection badge */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Joriy oyda ({formatMonth(currentMonth)}):
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {expense.isActive ? (
                        <>
                          {occurrences} marta = <span className="text-purple-600 dark:text-purple-400">{formatCurrency(monthlyTotal)}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Nofaol (0 so‘m)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions bottom row */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => toggleRecurringExpenseActive(expense.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                  >
                    {expense.isActive ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Faol</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-slate-400" />
                        <span>Nofaol</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(expense)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRecurringExpense(expense.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="O‘chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Repeat className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingExpense ? 'Takrorlanuvchi xarajatni tahrirlash' : 'Yangi takrorlanuvchi xarajat'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Xarajat nomi *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Yo‘l kira, Tushlik, Ijara"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Miqdor (so‘m) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="20 000"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="food">Oziq-ovqat & Tushlik</option>
                    <option value="transport">Transport & Yo‘l kira</option>
                    <option value="household">Uy-ro‘zg‘or & Ijara</option>
                    <option value="health">Salomatlik & Dori</option>
                    <option value="clothing">Kiyim-kechak</option>
                    <option value="other">Boshqa xarajat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Oila a’zosi (ixtiyoriy)
                </label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="none">Umumiy oilaviy xarajat</option>
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Takrorlanish davriyligi *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRecurrenceType('daily')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      recurrenceType === 'daily'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Har kuni
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecurrenceType('weekly')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      recurrenceType === 'weekly'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Har hafta
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecurrenceType('custom_weekdays')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      recurrenceType === 'custom_weekdays'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Hafta kunlari
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecurrenceType('monthly')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                      recurrenceType === 'monthly'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Har oy
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecurrenceType('specific_date')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer col-span-2 sm:col-span-1 ${
                      recurrenceType === 'specific_date'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Muayyan sana
                  </button>
                </div>
              </div>

              {/* Custom Weekdays Picker */}
              {recurrenceType === 'custom_weekdays' && (
                <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/40">
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Xarajat qilinadigan hafta kunlarini belgilang:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {WEEKDAYS.map((wd) => {
                      const isSelected = selectedWeekdays.includes(wd.day);
                      return (
                        <button
                          key={wd.day}
                          type="button"
                          onClick={() => handleWeekdayToggle(wd.day)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {wd.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Specific Date Picker */}
              {recurrenceType === 'specific_date' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Muayyan to‘lov sanasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Boshlanish sanasi
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tugash sanasi (ixtiyoriy)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingExpense ? 'Saqlash' : 'Qo‘shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
