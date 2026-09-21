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
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Soliq Profilini Sozlash</h3>
              <p className="text-xs text-slate-500">
                O‘zbekiston Respublikasi soliq tizimiga moslashtirilgan shaxsiy hisob-kitob
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Official Disclaimer Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Eslatma: </span>
              {UZBEKISTAN_TAX_CONFIG.DISCLAIMER_TEXT} Ushbu sozlamalar daromadingizdan soliqlarni
              avtomatik rejalashtirish va Safe to Spend pulingizdan zaxiralash uchun ishlatiladi.
            </div>
          </div>

          {/* 1. Profile Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
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
                    className={`p-3 rounded-xl border text-left transition-all text-xs font-semibold flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span>{TAX_PROFILE_TYPE_LABELS[typeKey]}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Tax Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
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
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{info.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
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
              <label className="text-xs font-bold text-slate-700">Daromad manbasi</label>
              <select
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value as TaxIncomeSource)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="salary">Rasmiy oylik maosh (Ish haqi)</option>
                <option value="freelance">Frilans / Dasturlash / Xizmatlar</option>
                <option value="business">Savdo va tadbirkorlik</option>
                <option value="rent">Ko‘chmas mulk ijarasi</option>
                <option value="other">Boshqa daromad manbasi</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Hisoblash usuli</label>
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCalculationMethod('percentage')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    calculationMethod === 'percentage'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Foiz stavkasi (%)
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationMethod('fixed_amount')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    calculationMethod === 'fixed_amount'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Qatʼiy summa (UZS)
                </button>
              </div>
            </div>
          </div>

          {/* Rate or Fixed Amount Input */}
          {calculationMethod === 'percentage' ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Belgilangan soliq foizi:</span>
                <span className="text-blue-700 font-extrabold text-sm">{customRatePercent}%</span>
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
                <span>0% (Imtiyozli)</span>
                <span>4% (YTT)</span>
                <span>12% (JShODS Standart)</span>
                <span>20%+</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Qatʼiy belgilangan oylik summa (UZS)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={fixedMonthlyAmount}
                onChange={(e) => setFixedMonthlyAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          )}

          {/* 4. Payment Schedule & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">To‘lov davri</label>
              <select
                value={paymentPeriod}
                onChange={(e) => setPaymentPeriod(e.target.value as TaxPaymentPeriod)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="monthly">Har oy (Oylik)</option>
                <option value="quarterly">Har chorakda (Choraklik)</option>
                <option value="annual">Yilda bir marta (Yillik)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">To‘lov muddati (kun)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dueDayOfMonth}
                  onChange={(e) => setDueDayOfMonth(Number(e.target.value))}
                  className="w-24 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-xs text-slate-500">
                  -sanasigacha (Soliq kodeksi bo‘yicha 15-sana tavsiya etiladi)
                </span>
              </div>
            </div>
          </div>

          {/* 5. Safe-to-Spend Reservation Toggle */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
            <input
              type="checkbox"
              id="autoReserve"
              checked={autoReserve}
              onChange={(e) => setAutoReserve(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
            />
            <label htmlFor="autoReserve" className="cursor-pointer text-xs space-y-1">
              <div className="font-bold text-emerald-950">
                Safe to Spend hisobidan avtomatik zaxiralash
              </div>
              <p className="text-emerald-800 leading-relaxed">
                Ushbu parametr yoqilganda, kiritilgan daromadingizdan hisoblangan soliq summasi
                erkin sarflanadigan pulingizdan alohida ajratib qo‘yiladi va bilmasdan sarflab
                yuborilishining oldi olinadi.
              </p>
            </label>
          </div>

          {/* 6. Reminder Settings */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Eslatmalar vaqtini belgilash
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleReminderTiming(3)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  reminderDaysBefore.includes(3)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                To‘lovdan 3 kun oldin
              </button>
              <button
                type="button"
                onClick={() => toggleReminderTiming(1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  reminderDaysBefore.includes(1)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                1 kun oldin (Ertaga to‘lov)
              </button>
              <button
                type="button"
                onClick={() => toggleReminderTiming(0)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  reminderDaysBefore.includes(0)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                To‘lov kunida
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Profilni saqlash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
