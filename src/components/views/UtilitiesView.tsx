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
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { UtilityCategory, UtilityBill } from '../../types';
import {
  UTILITY_CATEGORY_LABELS,
  formatUzbekDate,
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

  const { t, formatCurrency, formatMonth } = useLanguage();

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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>{t('pillar_utilities')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('pillar_utilities')} ({formatMonth(currentMonth)})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Elektr, gaz, suv va isitish toʻlovlari monitoringi
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCheckBalanceOpen(true)}
            className="min-h-[44px] px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Hisob balansini tekshirish</span>
          </button>

          <button
            onClick={() => openModal('utility')}
            className="min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('btn_add')}</span>
          </button>
        </div>
      </div>

      {/* View Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('bills')}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'bills'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Kommunal hisoblar ({currentMonthUtilities.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Toʻlovlar tarixi</span>
        </button>
      </div>

      {activeSubTab === 'bills' ? (
        <>
          {/* 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Joriy oy
              </div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {formatCurrency(currentTotal)}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {currentMonthUtilities.length} ta xizmat boʻyicha
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Oldingi oy ({formatMonth(prevMonthStr)})
              </div>
              <div className="mt-2 text-2xl font-extrabold text-slate-600 dark:text-slate-300">
                {formatCurrency(prevTotal)}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {prevMonthUtilities.length} ta hisob saqlangan
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Oylar farqi
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`text-2xl font-extrabold ${
                    diff > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : diff < 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {diff > 0 ? `+${formatCurrency(diff)}` : diff < 0 ? `-${formatCurrency(Math.abs(diff))}` : '0'}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                {diff > 0 ? (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">{diffPercent}% ga koʻp</span>
                  </>
                ) : diff < 0 ? (
                  <>
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{diffPercent}% ga tejaldi</span>
                  </>
                ) : (
                  <span>Teng</span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Toʻlangan / Kutilayotgan
              </div>
              <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-slate-100">
                <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(paidTotal)}</span>
                <span className="text-xs font-normal text-slate-400 mx-1.5">/</span>
                <span className="text-amber-600 dark:text-amber-400 text-base">{formatCurrency(unpaidTotal)}</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Nazorat qilib boring</span>
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
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate font-medium">{meta.label}</span>
                    {item?.isPaid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {amount > 0 ? formatCurrency(amount) : 'Kiritilmagan'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Utilities Records List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Kommunal hisoblar ({filteredUtilities.length})
                </h3>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      filterStatus === 'all'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Barchasi
                  </button>
                  <button
                    onClick={() => setFilterStatus('unpaid')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      filterStatus === 'unpaid'
                        ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Toʻlanmagan ({unpaidItems.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('paid')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      filterStatus === 'paid'
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Toʻlangan ({paidItems.length})
                  </button>
                </div>
              </div>

              {filterCategory !== 'all' && (
                <button
                  onClick={() => setFilterCategory('all')}
                  className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Filtrni tozalash
                </button>
              )}
            </div>

            {filteredUtilities.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Zap className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Kommunal hisob yoʻq</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">«Qoʻshish» orqali yangi toʻlov kiriting</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUtilities.map((u) => {
                  const catMeta = UTILITY_CATEGORY_LABELS[u.category] || { label: u.category, unit: '' };
                  const isEditing = editingId === u.id;

                  if (isEditing) {
                    return (
                      <div key={u.id} className="p-4 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as UtilityCategory)}
                            className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
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
                            className="px-3 py-1.5 text-sm font-semibold bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                          />
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={cancelEdit}
                            className="min-h-[36px] px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                          >
                            {t('btn_cancel')}
                          </button>
                          <button
                            onClick={() => saveEdit(u.id)}
                            className="min-h-[36px] px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{t('btn_save')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={u.id}
                      className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{catMeta.label}</h4>
                            <button
                              onClick={() => toggleUtilityPaid(u.id)}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                                u.isPaid
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {u.isPaid ? '✓ Toʻlangan' : '⏳ Kutilmoqda'}
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Muddat: {formatUzbekDate(u.dueDate)}
                            </span>
                            {u.accountNumber && (
                              <>
                                <span>•</span>
                                <span>Abonent: {u.accountNumber}</span>
                              </>
                            )}
                            {u.meterReading !== undefined && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 font-medium">
                                  <Gauge className="w-3 h-3 text-slate-400" />
                                  Koʻrsatkich: {u.meterReading} {catMeta.unit}
                                </span>
                              </>
                            )}
                            {u.description && (
                              <>
                                <span>•</span>
                                <span className="italic text-slate-400 truncate max-w-xs">
                                  «{u.description}»
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center justify-between lg:justify-end gap-3 self-end lg:self-center w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                        {!u.isPaid && (
                          <button
                            onClick={() => setPayingBill(u)}
                            className="min-h-[38px] px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Toʻlash</span>
                          </button>
                        )}

                        <div className="text-right">
                          <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                            {formatCurrency(u.amount)}
                          </div>
                          {u.paidDate && (
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                              Toʻlangan: {formatUzbekDate(u.paidDate)}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(u)}
                            className="min-h-[36px] min-w-[36px] p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                            title={t('btn_edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteUtility(u.id)}
                            className="min-h-[36px] min-w-[36px] p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center cursor-pointer"
                            title={t('btn_delete')}
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
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  P
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Toʻlov Provayderi: {defaultProvider.info.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {defaultProvider.info.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Elektron Tranzaksiyalar Tarixi ({paymentTransactions.length})
              </h4>
            </div>

            {paymentTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <History className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Hozircha elektron toʻlovlar tarixi mavjud emas</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {paymentTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {UTILITY_CATEGORY_LABELS[tx.utilityCategory]?.label || tx.utilityCategory}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Abonent: {tx.accountNumber} • {tx.providerName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(tx.amount)}</div>
                      <div
                        className={`text-[10px] font-semibold ${
                          tx.status === 'completed'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
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
