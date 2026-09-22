import React, { useState } from 'react';
import { X, Search, Info } from 'lucide-react';
import { UtilityCategory } from '../../types';
import { UTILITY_CATEGORY_LABELS } from '../../utils/formatters';
import { paymentService } from '../../services/payment';
import { useLanguage } from '../../i18n/LanguageContext';

interface CheckBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: UtilityCategory;
  initialAccountNumber?: string;
}

export const CheckBalanceModal: React.FC<CheckBalanceModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'electricity',
  initialAccountNumber = '',
}) => {
  const [category, setCategory] = useState<UtilityCategory>(initialCategory);
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber);
  const defaultProvider = paymentService.getDefaultProvider();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Hisob Balansini Tekshirish
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                Provayder: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{defaultProvider.info.name}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[36px] min-w-[36px] p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
            aria-label={t('btn_cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-0.5">
                <span>Integratsiya: Tez kunda</span>
              </div>
              <p className="text-[11px] mt-1">
                Rasmiy Paynet shlyuzi ulangach, abonent raqami kiritilganda haqiqiy qarzdorlik yoki avans summasi toʻgʻridan-toʻgʻri koʻrsatiladi.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Xizmat turi
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as UtilityCategory)}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              {Object.entries(UTILITY_CATEGORY_LABELS).map(([k, meta]) => (
                <option key={k} value={k}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Shaxsiy hisob raqami (LS)
            </label>
            <input
              type="text"
              placeholder="Masalan: 12345678"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {t('btn_close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
