import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Settings,
  Check,
  RefreshCw,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { MandatoryCategory, MandatoryPayment } from '../../types';
import {
  MANDATORY_CATEGORY_LABELS,
  formatUzbekDate,
} from '../../utils/formatters';
import {
  TAX_TYPE_INFO,
  TAX_PROFILE_TYPE_LABELS,
  calculateDeadlineStatus,
} from '../../config/taxRatesConfig';
import { TaxProfileModal } from '../modals/TaxProfileModal';

export const TaxesMandatoryView: React.FC = () => {
  const {
    mandatoryPayments,
    updateMandatory,
    deleteMandatory,
    toggleMandatoryPaid,
    currentMonth,
    openModal,
    summary,
    taxProfile,
    updateTaxProfile,
    estimatedTax,
    syncEstimatedTaxToMonth,
  } = useFinance();

  const { t, formatCurrency, formatMonth } = useLanguage();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Edit states for inline editing
  const [editName, setEditName] = useState('');
  const [editAmountStr, setEditAmountStr] = useState('');
  const [editCategory, setEditCategory] = useState<MandatoryCategory>('tax');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Current month mandatory payments
  const currentMonthMandatory = mandatoryPayments.filter((m) => m.month === currentMonth);
  const totalMandatory = currentMonthMandatory.reduce((acc, cur) => acc + cur.amount, 0);

  const unpaidItems = currentMonthMandatory.filter((m) => !m.isPaid);
  const unpaidTotal = unpaidItems.reduce((acc, cur) => acc + cur.amount, 0);

  // Filtered list
  const filteredMandatory = currentMonthMandatory.filter(
    (m) => filterCategory === 'all' || m.category === filterCategory
  );

  const startEdit = (m: MandatoryPayment) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditAmountStr(m.amount.toString());
    setEditCategory(m.category);
    setEditDueDate(m.dueDate);
    setEditNotes(m.notes || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    const rawAmount = parseInt(editAmountStr.replace(/[^\d]/g, ''), 10) || 0;
    if (!editName.trim() || rawAmount <= 0) return;

    updateMandatory(id, {
      name: editName.trim(),
      amount: rawAmount,
      category: editCategory,
      dueDate: editDueDate,
      notes: editNotes.trim() || undefined,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('pillar_mandatory')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('pillar_mandatory')} ({formatMonth(currentMonth)})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Soliq profili, qatʼiy toʻlovlar va Safe-to-Spend himoyasi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="min-h-[44px] px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Soliq sozlamalari</span>
          </button>

          <button
            onClick={() => openModal('mandatory')}
            className="min-h-[44px] px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('btn_add')}</span>
          </button>
        </div>
      </div>

      {/* 2. AUTOMATIC TAX ESTIMATION & TAX PROFILE OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Tax Estimation Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block">
                  Avtomatik soliq hisob-kitobi
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold mt-0.5">
                  Taxminiy Soliq: {formatCurrency(estimatedTax.amountToPay)}
                </h3>
              </div>

              <div className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold self-start sm:self-auto flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>Daromaddan hisoblandi</span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-800/70 rounded-2xl p-3.5 border border-slate-700/70">
                <span className="text-[11px] text-slate-400 block font-medium">Joriy daromad:</span>
                <div className="text-base sm:text-lg font-bold text-white mt-1">
                  {formatCurrency(summary.totalIncome)}
                </div>
              </div>

              <div className="bg-slate-800/70 rounded-2xl p-3.5 border border-slate-700/70">
                <span className="text-[11px] text-slate-400 block font-medium">Stavka:</span>
                <div className="text-base sm:text-lg font-bold text-blue-300 mt-1">
                  {taxProfile.calculationMethod === 'percentage'
                    ? `${taxProfile.customRatePercent ?? 12}% (${TAX_TYPE_INFO[taxProfile.taxType]?.label || 'Stavka'})`
                    : `${formatCurrency(taxProfile.fixedMonthlyAmount ?? 350000)}`}
                </div>
              </div>

              <div className="bg-slate-800/70 rounded-2xl p-3.5 border border-slate-700/70">
                <span className="text-[11px] text-slate-400 block font-medium">To‘lov muddati:</span>
                <div className="text-base sm:text-lg font-bold text-amber-300 mt-1">
                  Har oy {taxProfile.dueDayOfMonth}-sana
                </div>
              </div>
            </div>

            {/* Safe-to-Spend Protection Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-emerald-100">Safe-to-Spend himoyasi: </span>
                Soliq uchun hisoblangan <strong>{formatCurrency(estimatedTax.amountToPay)}</strong> avtomatik ravishda erkin sarflanadigan pulingizdan ajratilgan.
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 text-[11px]">
              Formulasi: <code className="text-slate-300">{estimatedTax.formulaDescription}</code>
            </span>

            <button
              onClick={() => syncEstimatedTaxToMonth(currentMonth)}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Zaxirani yangilash</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: User Tax Profile Summary */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Soliq Profili</h4>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                O‘zgartirish
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Profil turi:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {TAX_PROFILE_TYPE_LABELS[taxProfile.profileType]}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Soliq turi:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {TAX_TYPE_INFO[taxProfile.taxType]?.label}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Daromad manbasi:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{taxProfile.incomeSource}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">To‘lov davri:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {taxProfile.paymentPeriod === 'monthly' ? 'Har oy' : taxProfile.paymentPeriod === 'quarterly' ? 'Choraklik' : 'Yillik'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Stat Cards for Current Month Obligations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Jami majburiyatlar
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(totalMandatory)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {currentMonthMandatory.length} ta toʻlov
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Toʻlangan qism
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalMandatory - unpaidTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {currentMonthMandatory.filter((m) => m.isPaid).length} ta toʻlangan
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Kutilayotgan toʻlovlar
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(unpaidTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {unpaidItems.length} ta toʻlanishi zarur
          </div>
        </div>
      </div>

      {/* 4. Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCategory('all')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filterCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Barchasi ({currentMonthMandatory.length})
        </button>

        <button
          onClick={() => setFilterCategory('tax')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filterCategory === 'tax'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Soliqlar ({currentMonthMandatory.filter((m) => m.category === 'tax').length})
        </button>

        <button
          onClick={() => setFilterCategory('loan_repayment')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filterCategory === 'loan_repayment'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Kreditlar ({currentMonthMandatory.filter((m) => m.category === 'loan_repayment').length})
        </button>
      </div>

      {/* 5. Mandatory List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Majburiyatlar roʻyxati ({filteredMandatory.length})
          </h3>
          <span className="text-xs text-slate-400">
            {formatMonth(currentMonth)}
          </span>
        </div>

        {filteredMandatory.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium">Ushbu toifada toʻlovlar mavjud emas</p>
            <button
              onClick={() => openModal('mandatory')}
              className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              + Yangi toʻlov kiritish
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredMandatory.map((m) => {
              const catMeta = MANDATORY_CATEGORY_LABELS[m.category] || {
                label: 'Boshqa',
                color: 'bg-slate-50 text-slate-700',
              };

              const deadlineInfo = calculateDeadlineStatus(m.dueDate, m.isPaid);

              if (editingId === m.id) {
                return (
                  <div key={m.id} className="p-4 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nomi"
                        className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="number"
                        value={editAmountStr}
                        onChange={(e) => setEditAmountStr(e.target.value)}
                        placeholder="Summasi"
                        className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as MandatoryCategory)}
                        className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      >
                        <option value="tax">Soliq</option>
                        <option value="loan_repayment">Kredit</option>
                        <option value="insurance">Sugʻurta</option>
                        <option value="government">Davlat toʻlovi</option>
                        <option value="mandatory_fee">Majburiy toʻlov</option>
                        <option value="other_mandatory">Boshqa</option>
                      </select>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Izoh"
                        className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 flex-1 max-w-md"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={cancelEdit}
                          className="min-h-[36px] px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                        >
                          {t('btn_cancel')}
                        </button>
                        <button
                          onClick={() => saveEdit(m.id)}
                          className="min-h-[36px] px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('btn_save')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                        m.category === 'tax'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          : m.category === 'loan_repayment'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{m.name}</h4>

                        <button
                          onClick={() => toggleMandatoryPaid(m.id)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                            m.isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {m.isPaid ? '✓ Toʻlangan' : '⏳ Kutilmoqda'}
                        </button>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${deadlineInfo.badgeColorClass}`}
                        >
                          {deadlineInfo.statusLabel}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium">{catMeta.label}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Sana: {formatUzbekDate(m.dueDate)}
                        </span>
                        {m.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400 max-w-xs truncate">
                              «{m.notes}»
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(m.amount)}
                      </div>
                      {m.paidDate && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          Toʻlangan: {formatUzbekDate(m.paidDate)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(m)}
                        className="min-h-[36px] min-w-[36px] p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                        title={t('btn_edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMandatory(m.id)}
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

      {/* Tax Profile Configuration Modal */}
      <TaxProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        taxProfile={taxProfile}
        onSave={(updated) => updateTaxProfile(updated)}
      />
    </div>
  );
};
