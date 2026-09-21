import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  Check,
  Search,
  CreditCard,
  History,
  ShieldCheck,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { UtilityCategory, UtilityBill } from '../../types';
import {
  UTILITY_CATEGORY_LABELS,
  formatUZS,
  formatUzbekDate,
  formatMonthName,
} from '../../utils/formatters';
import { CheckBalanceModal } from '../modals/CheckBalanceModal';
import { PaynetPaymentModal } from '../modals/PaynetPaymentModal';
import { paymentService } from '../../services/payment';

export const UtilitiesView: React.FC = () => {
  const {
    utilities,
    updateUtility,
    deleteUtility,
    toggleUtilityPaid,
    paymentTransactions,
    currentMonth,
    openModal,
  } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState<'bills' | 'history'>('bills');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modals state for payment architecture
  const [isCheckBalanceOpen, setIsCheckBalanceOpen] = useState(false);
  const [payingBill, setPayingBill] = useState<UtilityBill | null>(null);

  // Edit states
  const [editAmountStr, setEditAmountStr] = useState('');
  const [editCategory, setEditCategory] = useState<UtilityCategory>('electricity');
  const [editDueDate, setEditDueDate] = useState('');
  const [editMeter, setEditMeter] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const defaultProvider = paymentService.getDefaultProvider();

  // Previous month calculation
  const [yearNum, monthNum] = currentMonth.split('-').map(Number);
  const prevDate = new Date(yearNum, monthNum - 2, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  // Current month utilities
  const currentMonthUtilities = utilities.filter((u) => u.month === currentMonth);
  const prevMonthUtilities = utilities.filter((u) => u.month === prevMonthStr);

  const currentTotal = currentMonthUtilities.reduce((acc, cur) => acc + cur.amount, 0);
  const prevTotal = prevMonthUtilities.reduce((acc, cur) => acc + cur.amount, 0);
  const diff = currentTotal - prevTotal;
  const diffPercent = prevTotal > 0 ? Math.round((Math.abs(diff) / prevTotal) * 100) : 0;

  const unpaidItems = currentMonthUtilities.filter((u) => !u.isPaid);
  const unpaidTotal = unpaidItems.reduce((acc, cur) => acc + cur.amount, 0);
  const paidItems = currentMonthUtilities.filter((u) => u.isPaid);
  const paidTotal = paidItems.reduce((acc, cur) => acc + cur.amount, 0);

  // Filtered list
  const filteredUtilities = currentMonthUtilities.filter((u) => {
    if (filterCategory !== 'all' && u.category !== filterCategory) return false;
    if (filterStatus === 'unpaid' && u.isPaid) return false;
    if (filterStatus === 'paid' && !u.isPaid) return false;
    return true;
  });

  const startEdit = (u: UtilityBill) => {
    setEditingId(u.id);
    setEditAmountStr(u.amount.toString());
    setEditCategory(u.category);
    setEditDueDate(u.dueDate);
    setEditMeter(u.meterReading ? u.meterReading.toString() : '');
    setEditAccountNumber(u.accountNumber || '');
    setEditDesc(u.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    const rawAmount = parseInt(editAmountStr.replace(/[^\d]/g, ''), 10) || 0;
    if (rawAmount <= 0) return;

    updateUtility(id, {
      amount: rawAmount,
      category: editCategory,
      dueDate: editDueDate,
      meterReading: editMeter ? parseInt(editMeter, 10) : undefined,
      accountNumber: editAccountNumber.trim() || undefined,
      description: editDesc.trim() || undefined,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Alohida kommunal toʻlovlar boʻlimi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Kommunal Toʻlovlar ({formatMonthName(currentMonth)})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Elektr, gaz, suv, isitish hisoblagichlari monitoringi va milliy toʻlov provayderi (Paynet) arxitekturasi
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Check Balance Button */}
          <button
            onClick={() => setIsCheckBalanceOpen(true)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-2 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hisob balansini tekshirish</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Paynet
            </span>
          </button>

          {/* Add Utility Button */}
          <button
            onClick={() => openModal('utility')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Kommunal qoʻshish</span>
          </button>
        </div>
      </div>

      {/* View Sub-Tabs: Bills vs Payment History */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('bills')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'bills'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Kommunal hisoblar ({currentMonthUtilities.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'history'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Toʻlovlar tarixi</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
            Paynet
          </span>
        </button>
      </div>

      {activeSubTab === 'bills' ? (
        <>
          {/* 4 Cards: Current Month, Previous Month, Difference, Unpaid Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Month Total */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Joriy oy rejalashtirilgan
              </div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900">
                {formatUZS(currentTotal)}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {currentMonthUtilities.length} ta xizmat boʻyicha
              </div>
            </div>

            {/* Previous Month Total */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Oldingi oy ({formatMonthName(prevMonthStr)})
              </div>
              <div className="mt-2 text-2xl font-extrabold text-slate-600">
                {formatUZS(prevTotal)}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {prevMonthUtilities.length} ta hisob saqlangan
              </div>
            </div>

            {/* Difference */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Oylar farqi (Farq)
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`text-2xl font-extrabold ${
                    diff > 0 ? 'text-rose-600' : diff < 0 ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {diff > 0 ? `+${formatUZS(diff)}` : diff < 0 ? `-${formatUZS(Math.abs(diff))}` : "0 so'm"}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                {diff > 0 ? (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-rose-600 font-semibold">{diffPercent}% ga koʻp sarflandi</span>
                  </>
                ) : diff < 0 ? (
                  <>
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 font-semibold">{diffPercent}% ga tejab qolindi</span>
                  </>
                ) : (
                  <span>Oldingi oy bilan teng</span>
                )}
              </div>
            </div>

            {/* Confirmed Paid vs Unpaid Items */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Haqiqiy toʻlangan / Kutilayotgan
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900">
                <span className="text-emerald-600">{formatUZS(paidTotal)}</span>
                <span className="text-xs font-normal text-slate-400 mx-1.5">/</span>
                <span className="text-amber-600 text-base">{formatUZS(unpaidTotal)}</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Faqat tasdiqlangan toʻlovlar xarajat hisoblanadi</span>
              </div>
            </div>
          </div>

          {/* Category breakdown overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(UTILITY_CATEGORY_LABELS).map(([catKey, meta]) => {
              const item = currentMonthUtilities.find((u) => u.category === catKey);
              const amount = item ? item.amount : 0;
              const isSelected = filterCategory === catKey;

              return (
                <button
                  key={catKey}
                  onClick={() => setFilterCategory(isSelected ? 'all' : catKey)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate font-medium">{meta.label}</span>
                    {item?.isPaid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {amount > 0 ? formatUZS(amount) : 'Kiritilmagan'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Utilities Records List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-900">
                  Kommunal hisoblar ({filteredUtilities.length} ta)
                </h3>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    Barchasi
                  </button>
                  <button
                    onClick={() => setFilterStatus('unpaid')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      filterStatus === 'unpaid' ? 'bg-white text-amber-700 shadow-2xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    Toʻlanmagan ({unpaidItems.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('paid')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      filterStatus === 'paid' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600'
                    }`}
                  >
                    Toʻlangan ({paidItems.length})
                  </button>
                </div>
              </div>

              {filterCategory !== 'all' && (
                <button
                  onClick={() => setFilterCategory('all')}
                  className="text-xs font-semibold text-amber-700 hover:underline"
                >
                  Filtrni tozalash
                </button>
              )}
            </div>

            {filteredUtilities.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Zap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">Bu parametrlar boʻyicha kommunal hisob yoʻq</p>
                <p className="text-xs text-slate-400 mt-1">«Kommunal qoʻshish» orqali yangi toʻlov kiriting</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredUtilities.map((u) => {
                  const catMeta = UTILITY_CATEGORY_LABELS[u.category] || { label: u.category, unit: '' };
                  const isEditing = editingId === u.id;

                  if (isEditing) {
                    return (
                      <div key={u.id} className="p-4 bg-amber-50/40 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as UtilityCategory)}
                            className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                          >
                            {Object.entries(UTILITY_CATEGORY_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={editAmountStr}
                            onChange={(e) => setEditAmountStr(e.target.value)}
                            placeholder="Summa"
                            className="px-3 py-1.5 text-sm font-semibold bg-white rounded-lg border border-slate-300 focus:outline-none"
                          />
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={editMeter}
                            onChange={(e) => setEditMeter(e.target.value)}
                            placeholder="Hisoblagich koʻrsatkichi"
                            className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={editAccountNumber}
                            onChange={(e) => setEditAccountNumber(e.target.value)}
                            placeholder="Abonent hisob raqami"
                            className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Qoʻshimcha tavsif"
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
                            onClick={() => saveEdit(u.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 flex items-center gap-1"
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
                      key={u.id}
                      className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{catMeta.label}</h4>
                            <button
                              onClick={() => toggleUtilityPaid(u.id)}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                                u.isPaid
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              {u.isPaid ? '✓ Toʻlangan' : '⏳ Toʻlanmagan'}
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Muddat: {formatUzbekDate(u.dueDate)}
                            </span>
                            {u.accountNumber && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                                  Abonent: {u.accountNumber}
                                </span>
                              </>
                            )}
                            {u.meterReading !== undefined && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                                  <Gauge className="w-3 h-3 text-slate-400" />
                                  Hisoblagich: {u.meterReading} {catMeta.unit}
                                </span>
                              </>
                            )}
                            {u.description && (
                              <>
                                <span>•</span>
                                <span className="italic text-slate-400 max-w-xs truncate">
                                  «{u.description}»
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right actions: Amount + Pay via Paynet + Actions */}
                      <div className="flex items-center justify-between lg:justify-end gap-3 self-end lg:self-center w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        {/* Pay via Paynet Button */}
                        {!u.isPaid && (
                          <button
                            onClick={() => setPayingBill(u)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                            <span>Paynet orqali toʻlash</span>
                          </button>
                        )}

                        <div className="text-right">
                          <div className="text-base font-extrabold text-slate-900">
                            {formatUZS(u.amount)}
                          </div>
                          {u.paidDate && (
                            <div className="text-[11px] text-emerald-600">
                              Toʻlangan sana: {formatUzbekDate(u.paidDate)}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteUtility(u.id)}
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
        </>
      ) : (
        /* Payment History View */
        <div className="space-y-4">
          {/* Architecture info banner */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  P
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Toʻlov Provayderi: {defaultProvider.info.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {defaultProvider.info.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  Holati: Tez kunda («Coming soon»)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Toʻlov xavfsizligi va moliyaviy hisoblash standarti</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Paynet API bilan server darajasidagi integratsiya amalga oshirilgach, barcha elektron tranzaksiyalar ushbu jadvalda rasmiy kvitansiya raqamlari bilan qayd etiladi.
                Faqatgina <strong>tasdiqlangan («completed»)</strong> toʻlovlar oylik sof chiqimlarga xarajat sifatida qoʻshiladi.
              </p>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                Elektron Tranzaksiyalar Tarixi ({paymentTransactions.length})
              </h4>
            </div>

            {paymentTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">Hozircha elektron toʻlovlar tarixi mavjud emas</p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Paynet toʻlov shlyuzi ulangach, avtomatlashtirilgan toʻlov kvitansiyalari bu yerda saqlanadi
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {paymentTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">
                        {UTILITY_CATEGORY_LABELS[tx.utilityCategory]?.label || tx.utilityCategory}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Abonent: {tx.accountNumber} • {tx.providerName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{formatUZS(tx.amount)}</div>
                      <div className={`text-[10px] font-semibold ${
                        tx.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {tx.status === 'completed' ? '✓ Muvaffaqiyatli' : 'Kutilmoqda'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Check Balance Modal */}
      <CheckBalanceModal
        isOpen={isCheckBalanceOpen}
        onClose={() => setIsCheckBalanceOpen(false)}
      />

      {/* Pay via Paynet Modal */}
      <PaynetPaymentModal
        isOpen={payingBill !== null}
        onClose={() => setPayingBill(null)}
        bill={payingBill}
        onConfirmManualPaid={(id) => toggleUtilityPaid(id)}
      />
    </div>
  );
};
