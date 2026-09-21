import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { GoalPriority, GoalStatus } from '../../types';
import { formatUZS } from '../../utils/formatters';

export const AddGoalModal: React.FC = () => {
  const { activeModal, closeModal, addGoal, currentMonth, activeFamilyMembers } = useFinance();

  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentSavedStr, setCurrentSavedStr] = useState('0');
  const [deadline, setDeadline] = useState(() => `${currentMonth}-30`);
  const [priority, setPriority] = useState<GoalPriority>('high');
  const [status, setStatus] = useState<GoalStatus>('on_track');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [category, setCategory] = useState('Texnika va buyumlar');
  const [notes, setNotes] = useState('');

  if (activeModal !== 'goal') return null;

  const rawTargetAmount = parseInt(targetAmountStr.replace(/[^\d]/g, ''), 10) || 0;
  const rawCurrentSaved = parseInt(currentSavedStr.replace(/[^\d]/g, ''), 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rawTargetAmount <= 0) return;

    const targetMonth = deadline.slice(0, 7);

    addGoal({
      name: name.trim(),
      targetAmount: rawTargetAmount,
      currentSavedAmount: rawCurrentSaved,
      deadline,
      targetMonth,
      priority,
      status: rawCurrentSaved >= rawTargetAmount ? 'completed' : status,
      category,
      notes: notes.trim() || undefined,
      memberId: selectedMemberId || null,
    });

    closeModal();
    setName('');
    setTargetAmountStr('');
    setCurrentSavedStr('0');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Yangi moliyaviy maqsad</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Maqsad nomi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Telefon sotib olish, Noutbuk, Taʼtil jamgʻarmasi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maqsad summasi (soʻmda) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="1 000 000"
                value={targetAmountStr}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setTargetAmountStr(val ? parseInt(val, 10).toLocaleString('ru-RU') : '');
                }}
                className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              {rawTargetAmount > 0 && (
                <p className="mt-1 text-[11px] text-indigo-700 font-medium">
                  {formatUZS(rawTargetAmount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mavjud jamgʻarma (boshlangʻich)
              </label>
              <input
                type="text"
                placeholder="0"
                value={currentSavedStr}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setCurrentSavedStr(val ? parseInt(val, 10).toLocaleString('ru-RU') : '');
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Erishish muddati (Deadline) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Muhimlik darajasi
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                <option value="high">Yuqori muhimlik</option>
                <option value="medium">Oʻrtacha</option>
                <option value="low">Past</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Maqsad egasi / Kim uchun?
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            >
              <option value="">Umumiy oilaviy maqsad</option>
              {activeFamilyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role === 'Owner' ? 'Boshliq' : member.role === 'Adult' ? 'Katta' : 'Farzand'}) - Shaxsiy maqsad
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Holati
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                <option value="on_track">Rejada ketmoqda (On track)</option>
                <option value="at_risk">Xavf ostida (At risk)</option>
                <option value="completed">Bajarildi (Completed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Toifa / Yoʻnalish
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Texnika, Taʼtil, Uy-joy"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Izoh
            </label>
            <textarea
              rows={2}
              placeholder="Masalan: Ushbu maqsad uchun kundalik kofe yoki kafeni qisqartirish mumkin"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={rawTargetAmount <= 0 || !name.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
            >
              Maqsadni yaratish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
