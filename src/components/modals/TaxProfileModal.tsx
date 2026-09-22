import React, { useState } from 'react';
import {
  X,
  Shield,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  TaxProfile,
  TaxProfileType,
  TaxType,
  TaxCalculationMethod,
  TaxPaymentPeriod,
  TaxIncomeSource,
  ReminderTiming,
} from '../../types';
import {
  TAX_TYPE_INFO,
  TAX_PROFILE_TYPE_LABELS,
  UZBEKISTAN_TAX_CONFIG,
} from '../../config/taxRatesConfig';
import { useLanguage } from '../../i18n/LanguageContext';

interface TaxProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxProfile: TaxProfile;
  onSave: (updated: Partial<TaxProfile>) => void;
}

export const TaxProfileModal: React.FC<TaxProfileModalProps> = ({
  isOpen,
  onClose,
  taxProfile,
  onSave,
}) => {
  const { t } = useLanguage();

  const [profileType, setProfileType] = useState<TaxProfileType>(taxProfile.profileType);
  const [taxType, setTaxType] = useState<TaxType>(taxProfile.taxType);
  const [incomeSource, setIncomeSource] = useState<TaxIncomeSource>(taxProfile.incomeSource);
  const [calculationMethod, setCalculationMethod] = useState<TaxCalculationMethod>(
    taxProfile.calculationMethod
  );
  const [customRatePercent, setCustomRatePercent] = useState<number>(
    taxProfile.customRatePercent ?? TAX_TYPE_INFO[taxProfile.taxType]?.defaultRate ?? 12
  );
  const [fixedMonthlyAmount, setFixedMonthlyAmount] = useState<number>(
    taxProfile.fixedMonthlyAmount ?? 350000
  );
  const [paymentPeriod, setPaymentPeriod] = useState<TaxPaymentPeriod>(taxProfile.paymentPeriod);
  const [dueDayOfMonth, setDueDayOfMonth] = useState<number>(taxProfile.dueDayOfMonth);
  const [autoReserve, setAutoReserve] = useState<boolean>(taxProfile.autoReserveFromIncome);
  const [reminderDaysBefore, setReminderDaysBefore] = useState<ReminderTiming[]>(
    taxProfile.reminderDaysBefore || [3, 1, 0]
  );

  if (!isOpen) return null;

  const toggleReminderTiming = (timing: ReminderTiming) => {
    if (reminderDaysBefore.includes(timing)) {
      setReminderDaysBefore(reminderDaysBefore.filter((t) => t !== timing));
    } else {
      setReminderDaysBefore([...reminderDaysBefore, timing]);
    }
  };

  const handleTaxTypeChange = (newTaxType: TaxType) => {
    setTaxType(newTaxType);
    const info = TAX_TYPE_INFO[newTaxType];
    if (info) {
      if (newTaxType === 'fixed_tax') {
        setCalculationMethod('fixed_amount');
        setFixedMonthlyAmount(UZBEKISTAN_TAX_CONFIG.FIXED_TAX_DEFAULT_ESTIMATE_UZS);
      } else if (newTaxType === 'self_employed') {
        setCalculationMethod('percentage');
        setCustomRatePercent(0);
      } else {
        setCalculationMethod('percentage');
        setCustomRatePercent(info.defaultRate);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      profileType,
      taxType,
      incomeSource,
      calculationMethod,
      customRatePercent: calculationMethod === 'percentage' ? Number(customRatePercent) : undefined,
      fixedMonthlyAmount: calculationMethod === 'fixed_amount' ? Number(fixedMonthlyAmount) : undefined,
      paymentPeriod,
      dueDayOfMonth: Number(dueDayOfMonth) || 15,
      autoReserveFromIncome: autoReserve,
      reminderDaysBefore,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Soliq Profilini Sozlash</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                O‘zbekiston Respublikasi soliq tizimiga moslashtirilgan hisob-kitob
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
            aria-label={t('btn_cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <span className="font-bold">Eslatma: </span>
              {UZBEKISTAN_TAX_CONFIG.DISCLAIMER_TEXT} Ushbu sozlamalar daromadingizdan soliqlarni
              avtomatik rejalashtirish va Safe-to-Spend pulingizdan zaxiralash uchun ishlatiladi.
            </div>
          </div>

          {/* 1. Profile Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              1. Soliq to‘lovchi profili
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(TAX_PROFILE_TYPE_LABELS) as TaxProfileType[]).map((typeKey) => {
                const isSelected = profileType === typeKey;
                return (
                  <button
                    type="button"
                    key={typeKey}
                    onClick={() => setProfileType(typeKey)}
                    className={`min-h-[44px] p-3 rounded-xl border text-left transition-all text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <span>{TAX_PROFILE_TYPE_LABELS[typeKey]}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Tax Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              2. Soliq turi va stavkasi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(TAX_TYPE_INFO) as TaxType[]).map((typeKey) => {
                const info = TAX_TYPE_INFO[typeKey];
                const isSelected = taxType === typeKey;
                return (
                  <button
                    type="button"
                    key={typeKey}
                    onClick={() => handleTaxTypeChange(typeKey)}
                    className={`min-h-[48px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{info.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {info.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Income Source & Calculation Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Daromad manbasi</label>
              <select
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value as TaxIncomeSource)}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="salary">Rasmiy oylik maosh</option>
                <option value="freelance">Frilans / Dasturlash / Xizmatlar</option>
                <option value="business">Savdo va tadbirkorlik</option>
                <option value="rent">Ijara</option>
                <option value="other">Boshqa</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hisoblash usuli</label>
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCalculationMethod('percentage')}
                  className={`flex-1 min-h-[38px] py-1.5 rounded-lg transition-all cursor-pointer ${
                    calculationMethod === 'percentage'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Foiz (%)
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationMethod('fixed_amount')}
                  className={`flex-1 min-h-[38px] py-1.5 rounded-lg transition-all cursor-pointer ${
                    calculationMethod === 'fixed_amount'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Qatʼiy (UZS)
                </button>
              </div>
            </div>
          </div>

          {/* Rate or Fixed Amount Input */}
          {calculationMethod === 'percentage' ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Belgilangan foiz:</span>
                <span className="text-blue-700 dark:text-blue-400 font-extrabold text-sm">{customRatePercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={customRatePercent}
                onChange={(e) => setCustomRatePercent(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0%</span>
                <span>4%</span>
                <span>12%</span>
                <span>20%+</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Qatʼiy summa (UZS)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={fixedMonthlyAmount}
                onChange={(e) => setFixedMonthlyAmount(Number(e.target.value))}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          )}

          {/* 4. Payment Schedule & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">To‘lov davri</label>
              <select
                value={paymentPeriod}
                onChange={(e) => setPaymentPeriod(e.target.value as TaxPaymentPeriod)}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="monthly">Har oy (Oylik)</option>
                <option value="quarterly">Har chorakda (Choraklik)</option>
                <option value="annual">Yilda bir marta (Yillik)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">To‘lov muddati (oyning kuni)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dueDayOfMonth}
                onChange={(e) => setDueDayOfMonth(Number(e.target.value))}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Safe-to-Spend Reservation Toggle */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900 flex items-start gap-3">
            <input
              type="checkbox"
              id="autoReserve"
              checked={autoReserve}
              onChange={(e) => setAutoReserve(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
            />
            <label htmlFor="autoReserve" className="cursor-pointer text-xs space-y-1">
              <div className="font-bold text-emerald-950 dark:text-emerald-300">
                Safe-to-Spend hisobidan avtomatik zaxiralash
              </div>
              <p className="text-emerald-800 dark:text-emerald-400 text-[11px] leading-relaxed">
                Daromadingizdan hisoblangan soliq summasi erkin sarflanadigan pulingizdan alohida ajratib qo‘yiladi.
              </p>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('btn_save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
