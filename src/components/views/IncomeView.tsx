import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  Repeat,
  Check,
  X,
  Users,
  User,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { IncomeCategory, Income } from '../../types';
import {
  INCOME_CATEGORY_LABELS,
  formatUZS,
  formatUzbekDate,
  formatMonthName,
} from '../../utils/formatters';

export const IncomeView: React.FC = () => {
  const {
    incomes,
    addIncome,
    updateIncome,
    deleteIncome,
    currentMonth,
    openModal,
    activeFamilyMembers,
    familyMembers,
  } = useFinance();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editAmountStr, setEditAmountStr] = useState('');
  const [editCategory, setEditCategory] = useState<IncomeCategory>('salary');
  const [editDate, setEditDate] = useState('');
  const [editRecurring, setEditRecurring] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editMemberId, setEditMemberId] = useState<string>('family');

  // Current month incomes
  const monthIncomes = incomes.filter((inc) => inc.date.startsWith(currentMonth));
  
  // Apply both member filter and category filter
  const memberFilteredIncomes = monthIncomes.filter((inc) => {
    if (selectedMemberFilter === 'all') return true;
    if (selectedMemberFilter === 'family') return !inc.memberId;
    return inc.memberId === selectedMemberFilter;
  });

  const filteredIncomes = memberFilteredIncomes.filter(
    (inc) => filterCategory === 'all' || inc.category === filterCategory
  );

  const totalMonthlyIncome = memberFilteredIncomes.reduce((acc, cur) => acc + cur.amount, 0);

  // Category totals for current member selection
  const categoryTotals: Record<string, number> = {};
  memberFilteredIncomes.forEach((inc) => {
    categoryTotals[inc.category] = (categoryTotals[inc.category] || 0) + inc.amount;
  });

  const startEdit = (inc: Income) => {
    setEditingId(inc.id);
    setEditName(inc.name);
    setEditAmountStr(inc.amount.toString());
    setEditCategory(inc.category);
    setEditDate(inc.date);
    setEditRecurring(inc.isRecurring);
    setEditNotes(inc.notes || '');
    setEditMemberId(inc.memberId || 'family');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    const rawAmount = parseInt(editAmountStr.replace(/[^\d]/g, ''), 10) || 0;
    if (!editName.trim() || rawAmount <= 0) return;

    updateIncome(id, {
      name: editName.trim(),
      amount: rawAmount,
      category: editCategory,
      date: editDate,
      isRecurring: editRecurring,
      notes: editNotes.trim() || undefined,
      memberId: editMemberId === 'family' ? null : editMemberId,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Oylik daromad manbalari</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Daromadlar ({formatMonthName(currentMonth)})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Oylik maosh, kichik biznes, frilans va boshqa daromadlaringiz hisobi
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Jami oylik tushum:</span>
            <span className="text-xl font-extrabold text-emerald-600 block">
              {formatUZS(totalMonthlyIncome)}
            </span>
          </div>
          <button
            onClick={() => openModal('income')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Daromad qoʻshish</span>
          </button>
        </div>
      </div>

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
          Barchasi ({monthIncomes.length})
        </button>
        {activeFamilyMembers.map((member) => {
          const memberCount = monthIncomes.filter((i) => i.memberId === member.id).length;
          const isSelected = selectedMemberFilter === member.id;
          return (
            <button
              key={member.id}
              onClick={() => setSelectedMemberFilter(member.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{member.avatarEmoji || '👤'}</span>
              <span>{member.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
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
            {monthIncomes.filter((i) => !i.memberId).length}
          </span>
        </button>
      </div>

      {/* Category Breakdown Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(INCOME_CATEGORY_LABELS).map(([catKey, meta]) => {
          const catSum = categoryTotals[catKey] || 0;
          const isSelected = filterCategory === catKey;
          return (
            <button
              key={catKey}
              onClick={() => setFilterCategory(isSelected ? 'all' : catKey)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-500 truncate">{meta.label}</div>
              <div className="text-sm font-bold text-slate-900 mt-1">{formatUZS(catSum)}</div>
            </button>
          );
        })}
      </div>

      {/* Table / List of Income Records */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Barcha daromadlar ({filteredIncomes.length} ta yozuv)
          </h3>
          {(filterCategory !== 'all' || selectedMemberFilter !== 'all') && (
            <button
              onClick={() => {
                setFilterCategory('all');
                setSelectedMemberFilter('all');
              }}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>

        {filteredIncomes.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <TrendingUp className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">Bu oy uchun daromad topilmadi</p>
            <p className="text-xs text-slate-400 mt-1">«Daromad qoʻshish» tugmasi orqali yangi manba kiriting</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredIncomes.map((inc) => {
              const catMeta = INCOME_CATEGORY_LABELS[inc.category] || { label: inc.category };
              const isEditing = editingId === inc.id;
              const assignedMember = inc.memberId
                ? familyMembers.find((m) => m.id === inc.memberId)
                : null;

              if (isEditing) {
                return (
                  <div key={inc.id} className="p-4 bg-emerald-50/40 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Daromad nomi"
                        className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editAmountStr}
                        onChange={(e) => setEditAmountStr(e.target.value)}
                        placeholder="Summa"
                        className="px-3 py-1.5 text-sm font-semibold bg-white rounded-lg border border-slate-300 focus:outline-none"
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as IncomeCategory)}
                        className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                      >
                        {Object.entries(INCOME_CATEGORY_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <select
                        value={editMemberId}
                        onChange={(e) => setEditMemberId(e.target.value)}
                        className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none font-medium"
                      >
                        <option value="family">👥 Umumiy oilaviy daromad</option>
                        {activeFamilyMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.avatarEmoji || '👤'} {m.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Qoʻshimcha izoh"
                        className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        Bekor qilish
                      </button>
                      <button
                        onClick={() => saveEdit(inc.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Saqlash</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={inc.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{inc.name}</h4>
                        {/* Member badge */}
                        {assignedMember ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span>{assignedMember.avatarEmoji || '👤'}</span>
                            <span>{assignedMember.name}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                            <Users className="w-2.5 h-2.5" />
                            <span>Umumiy oila</span>
                          </span>
                        )}
                        {inc.isRecurring && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                            title="Har oy takrorlanuvchi daromad"
                          >
                            <Repeat className="w-3 h-3 text-slate-400" />
                            <span>Doimiy</span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {catMeta.label}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatUzbekDate(inc.date)}
                        </span>
                        {inc.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400 max-w-xs truncate">
                              «{inc.notes}»
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-base font-extrabold text-emerald-600">
                      +{formatUZS(inc.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(inc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteIncome(inc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Oʻchirish"
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
      </div>
    </div>
  );
};
