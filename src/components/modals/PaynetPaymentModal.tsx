import React from 'react';
import { X, CreditCard, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { UtilityBill } from '../../types';
import { UTILITY_CATEGORY_LABELS, formatUZS, formatUzbekDate } from '../../utils/formatters';
import { paymentService } from '../../services/payment';

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
  if (!isOpen || !bill) return null;

  const catMeta = UTILITY_CATEGORY_LABELS[bill.category] || { label: bill.category };
  const defaultProvider = paymentService.getDefaultProvider();

  const handleMarkAsPaidManually = () => {
    onConfirmManualPaid(bill.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Paynet Orqali Toʻlov
              </h2>
              <span className="text-[11px] text-slate-500">
                Provayder: <strong className="text-slate-700 font-semibold">{defaultProvider.info.name}</strong> • Integratsiya arxitekturasi
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Bill Overview Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Toʻlov xizmati:</span>
                <span className="text-sm font-bold text-slate-900">{catMeta.label}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block font-medium">Toʻlanishi kerak:</span>
                <span className="text-lg font-extrabold text-amber-600">{formatUZS(bill.amount)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex flex-wrap justify-between text-xs text-slate-600 gap-y-1">
              <span>Muddati: <strong>{formatUzbekDate(bill.dueDate)}</strong></span>
              {bill.accountNumber && (
                <span>Abonent hisob raqami: <strong>{bill.accountNumber}</strong></span>
              )}
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Toʻlov shlyuzi holati: Tez kunda («Coming Soon»)</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Paynet elektron toʻlov shlyuzi bilan integratsiya qilish uchun barcha dasturiy interfeyslar va abstraksiya qatlami hozirlangan.
              Haqiqiy server API kalitlari ulanguncha toʻlov tugmasi xavfsizlik maqsadida oʻchirilgan boʻlib, soxta tranzaksiya oʻtkazilmaydi.
            </p>
          </div>

          {/* Financial rule explanation */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <div className="font-bold mb-0.5">Moliyaviy aniqlik qoidasi:</div>
              Faqat haqiqatda tasdiqlangan toʻlovlar oylik xarajat sifatida inobatga olinadi. Agar ushbu toʻlovni bank kassasi yoki boshqa usulda amalga oshirgan boʻlsangiz, uni quyidagi tugma orqali qoʻlda tasdiqlashingiz mumkin.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleMarkAsPaidManually}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Qoʻlda toʻlangan deb belgilash</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={true}
                title="Paynet integratsiyasi faollashtirilgach toʻlov ochiladi"
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600/50 cursor-not-allowed rounded-xl opacity-60 flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Paynet orqali toʻlash (Tez kunda)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
