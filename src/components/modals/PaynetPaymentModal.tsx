import React from 'react';
import { X, CreditCard, CheckCircle2 } from 'lucide-react';
import { UtilityBill } from '../../types';
import { UTILITY_CATEGORY_LABELS, formatUzbekDate } from '../../utils/formatters';
import { paymentService } from '../../services/payment';
import { useLanguage } from '../../i18n/LanguageContext';

interface PaynetPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: UtilityBill | null;
  onConfirmManualPaid: (billId: string) => void;
}

export const PaynetPaymentModal: React.FC<PaynetPaymentModalProps> = ({
  isOpen,
  onClose,
  bill,
  onConfirmManualPaid,
}) => {
  const { t, formatCurrency } = useLanguage();
  if (!isOpen || !bill) return null;

  const catMeta = UTILITY_CATEGORY_LABELS[bill.category] || { label: bill.category };
  const defaultProvider = paymentService.getDefaultProvider();

  const handleMarkAsPaidManually = () => {
    onConfirmManualPaid(bill.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Toʻlov (Paynet)
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {defaultProvider.info.name}
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
          {/* Bill Overview Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 rounded-xl space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Toʻlov turi:</span>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{catMeta.label}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Summa:</span>
                <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatCurrency(bill.amount)}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Abonent raqami: <strong>{bill.accountNumber || 'Kiritilmagan'}</strong></span>
              <span>Muddat: <strong>{formatUzbekDate(bill.dueDate)}</strong></span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <div className="font-bold mb-1">Toʻlov shlyuzi integratsiyasi</div>
            <p className="text-[11px]">
              Tashqi toʻlov ilovasi yoki bank orqali toʻlagan boʻlsangiz, quyidagi tugma orqali toʻlangan deb tasdiqlashingiz mumkin.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {t('btn_cancel')}
            </button>
            <button
              onClick={handleMarkAsPaidManually}
              className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Toʻlangan deb belgilash</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
