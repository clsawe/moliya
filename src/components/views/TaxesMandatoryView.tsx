import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Check,
  AlertTriangle,
  Settings,
  HelpCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Receipt,
  Building2,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { MandatoryCategory, MandatoryPayment } from '../../types';
import {
  MANDATORY_CATEGORY_LABELS,
  formatUZS,
  formatUzbekDate,
  formatMonthName,
} from '../../utils/formatters';
import {
  UZBEKISTAN_TAX_CONFIG,
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Soliq va majburiyatlar tizimi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Soliqlar va Majburiy Toʻlovlar ({formatMonthName(currentMonth)})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Soliq profili, avtomatik zaxiralash, yaqinlashayotgan to‘lovlar va Safe to Spend himoyasi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>Soliq profili sozlamalari</span>
          </button>

          <button
            onClick={() => openModal('mandatory')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Majburiyat qoʻshish</span>
          </button>
        </div>
      </div>

      {/* 2. AUTOMATIC TAX ESTIMATION & TAX PROFILE OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Tax Estimation Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block">
                  Avtomatik soliq hisob-kitobi (Tax Estimation)
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold mt-0.5">
                  Taxminiy Soliq Majburiyati: {formatUZS(estimatedTax.amountToPay)}
                </h3>
              </div>

              <div className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold self-start sm:self-auto flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>Oylik daromaddan hisoblandi</span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-800/70 rounded-2xl p-3.5 border border-slate-700/70">
                <span className="text-[11px] text-slate-400 block font-medium">Joriy oylik daromad:</span>
                <div className="text-base sm:text-lg font-bold text-white mt-1">
                  {formatUZS(summary.totalIncome)}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Barcha tushumlar</span>
              </div>

              <div className="bg-slate-800/70 rounded-2xl p-3.5 border border-slate-700/70">
                <span className="text-[11px] text-slate-400 block font-medium">Qo‘llangan stavka:</span>
                <div className="text-base sm:text-lg font-bold text-blue-300 mt-1">
                  {taxProfile.calculationMethod === 'percentage'
                    ? `${taxProfile.customRatePercent ?? 12}% (${TAX_TYPE_INFO[taxProfile.taxType]?.label || 'Stavka'})`
                    : `${formatUZS(taxProfile.fixedMonthlyAmount ?? 350000)} (Qatʼiy)`}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {TAX_TYPE_INFO[taxProfile.taxType]?.legalReference}
                </span>
              </div>

              <div className="bg-slate-800/70 rounded-2xl p-3.5 border border-slate-700/70">
                <span className="text-[11px] text-slate-400 block font-medium">To‘lov muddati:</span>
                <div className="text-base sm:text-lg font-bold text-amber-300 mt-1">
                  Har oy {taxProfile.dueDayOfMonth}-sana
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {currentMonth}-{String(taxProfile.dueDayOfMonth).padStart(2, '0')} gacha
                </span>
              </div>
            </div>

            {/* Safe-to-Spend Protection Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-emerald-100">Safe to Spend himoyasi faol: </span>
                Soliq uchun hisoblangan <strong>{formatUZS(estimatedTax.amountToPay)}</strong> mablag‘
                erkin sarflanadigan pulingizdan ajratilgan. Bu sizga soliq mablag‘larini bilmasdan
                sarflab qo‘ymaslik kafolatini beradi.
              </div>
            </div>

            {/* Prominent Mandatory Legal Disclaimer */}
            <div className="p-3 rounded-xl bg-slate-800/90 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200/90">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong>Muhim eslatma: </strong>
                {UZBEKISTAN_TAX_CONFIG.DISCLAIMER_TEXT} Bu rasmiy soliq hisob-kitobi emas, balki
                foydalanuvchi kiritgan ma’lumotlar asosidagi taxminiy rejalashtirishdir.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Formulasi: <code className="text-slate-300">{estimatedTax.formulaDescription}</code>
            </span>

            <button
              onClick={() => syncEstimatedTaxToMonth(currentMonth)}
              className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Oylik zaxirani yangilash</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: User Tax Profile Summary & Official Integration Ready Card */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Tax Profile Details */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">Faol Soliq Profili</h4>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                O‘zgartirish
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Profil turi:</span>
                <span className="font-bold text-slate-800">
                  {TAX_PROFILE_TYPE_LABELS[taxProfile.profileType]}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Soliq turi:</span>
                <span className="font-bold text-slate-800">
                  {TAX_TYPE_INFO[taxProfile.taxType]?.label}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Daromad manbasi:</span>
                <span className="font-bold text-slate-800 capitalize">{taxProfile.incomeSource}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">To‘lov davri:</span>
                <span className="font-bold text-slate-800">
                  {taxProfile.paymentPeriod === 'monthly'
                    ? 'Har oy (Oylik)'
                    : taxProfile.paymentPeriod === 'quarterly'
                    ? 'Choraklik'
                    : 'Yillik'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Eslatmalar:</span>
                <span className="font-bold text-blue-700">
                  {taxProfile.reminderDaysBefore.length} ta bildirishnoma
                </span>
              </div>
            </div>
          </div>

          {/* 6. RASMIY INTEGRATSIYA UCHUN TAYYORGARLIK (Future State API Adapter) */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                  Soliq to‘lovlarini avtomatlashtirish
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                Tez kunda
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Soliq to‘lovchi kabineti (my.soliq.uz) bilan rasmiy davlat API integratsiyasi
              rejalashtirilgan. Kelajakda real hisob-fakturalar va qarzdorliklar avtomatik
              sinxronizatsiya qilinadi.
            </p>

            <button
              disabled
              className="w-full py-2.5 px-3 rounded-xl bg-slate-200/90 text-slate-500 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <span>Davlat soliq kabinetini ulash (Tez kunda)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Stat Cards for Current Month Obligations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Jami majburiyatlar
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatUZS(totalMandatory)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {currentMonthMandatory.length} ta belgilangan toʻlov
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Toʻlangan qism
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {formatUZS(totalMandatory - unpaidTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {currentMonthMandatory.filter((m) => m.isPaid).length} ta toʻlangan
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Kutilayotgan toʻlovlar
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {formatUZS(unpaidTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {unpaidItems.length} ta toʻlanishi zarur
          </div>
        </div>
      </div>

      {/* 4. Filters & Search bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Barchasi ({currentMonthMandatory.length})
        </button>

        <button
          onClick={() => setFilterCategory('tax')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterCategory === 'tax'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Soliqlar ({currentMonthMandatory.filter((m) => m.category === 'tax').length})
        </button>

        <button
          onClick={() => setFilterCategory('loan_repayment')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterCategory === 'loan_repayment'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Kreditlar ({currentMonthMandatory.filter((m) => m.category === 'loan_repayment').length})
        </button>

        <button
          onClick={() => setFilterCategory('insurance')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterCategory === 'insurance'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Sugʻurta ({currentMonthMandatory.filter((m) => m.category === 'insurance').length})
        </button>

        <button
          onClick={() => setFilterCategory('government')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterCategory === 'government'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Davlat toʻlovlari ({currentMonthMandatory.filter((m) => m.category === 'government').length})
        </button>

        <button
          onClick={() => setFilterCategory('other_mandatory')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterCategory === 'other_mandatory'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Boshqalar ({currentMonthMandatory.filter((m) => m.category === 'other_mandatory').length})
        </button>
      </div>

      {/* 5. Mandatory List with Deadlines, Countdown & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Majburiyatlar roʻyxati ({filteredMandatory.length})
          </h3>
          <span className="text-xs text-slate-400">
            {formatMonthName(currentMonth)} oyi boʻyicha
          </span>
        </div>

        {filteredMandatory.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">Ushbu toifada toʻlovlar mavjud emas</p>
            <button
              onClick={() => openModal('mandatory')}
              className="mt-3 text-xs font-bold text-blue-600 hover:underline"
            >
              + Yangi majburiy toʻlov kiritish
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMandatory.map((m) => {
              const catMeta = MANDATORY_CATEGORY_LABELS[m.category] || {
                label: 'Boshqa',
                color: 'bg-slate-50 text-slate-700',
              };

              const deadlineInfo = calculateDeadlineStatus(m.dueDate, m.isPaid);

              if (editingId === m.id) {
                return (
                  <div key={m.id} className="p-4 bg-blue-50/40 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nomi"
                        className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                      />
                      <input
                        type="number"
                        value={editAmountStr}
                        onChange={(e) => setEditAmountStr(e.target.value)}
                        placeholder="Summasi"
                        className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as MandatoryCategory)}
                        className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
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
                        className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Izoh"
                        className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none flex-1 max-w-md"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          Bekor qilish
                        </button>
                        <button
                          onClick={() => saveEdit(m.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Saqlash</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                        m.category === 'tax'
                          ? 'bg-rose-50 text-rose-600'
                          : m.category === 'loan_repayment'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{m.name}</h4>

                        {/* Paid toggle badge */}
                        <button
                          onClick={() => toggleMandatoryPaid(m.id)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                            m.isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          }`}
                        >
                          {m.isPaid ? '✓ Toʻlangan' : '⏳ Toʻlanmagan'}
                        </button>

                        {/* Countdown / Deadline Status badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${deadlineInfo.badgeColorClass}`}
                        >
                          {deadlineInfo.statusLabel}
                        </span>

                        {m.isEstimated && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                            Taxminiy zaxira
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="text-slate-600 font-medium">{catMeta.label}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Toʻlov sanasi: {formatUzbekDate(m.dueDate)}
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
                      <div className="text-base font-extrabold text-slate-900">
                        {formatUZS(m.amount)}
                      </div>
                      {m.paidDate && (
                        <div className="text-[11px] text-emerald-600">
                          Toʻlangan sana: {formatUzbekDate(m.paidDate)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(m)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMandatory(m.id)}
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
