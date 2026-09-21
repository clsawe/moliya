import React, { useState } from 'react';
import { X, Search, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { UtilityCategory } from '../../types';
import { UTILITY_CATEGORY_LABELS } from '../../utils/formatters';
import { paymentService } from '../../services/payment';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Hisob Balansini Tekshirish
              </h2>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                Provayder: <strong className="text-emerald-700 font-semibold">{defaultProvider.info.name}</strong>
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
          {/* Architecture Status Badge */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-0.5">
                <span>Integratsiya holati: Tez kunda («Coming soon»)</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-800 text-[10px] uppercase font-bold tracking-wider">
                  Arxitektura tayyor
                </span>
              </div>
              <p className="text-amber-800/90">
                Paynet toʻlov shlyuzi abstraksiya qatlami toʻliq shakllantirildi. Server tomonida xavfsiz API kalitlari ulangach, elektr, gaz, suv va boshqa kommunal xizmatlarning haqiqiy qarzdorlik va balans koʻrsatkichlari toʻgʻridan-toʻgʻri yuklanadi.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kommunal xizmat turi
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as UtilityCategory)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              {Object.entries(UTILITY_CATEGORY_LABELS).map(([catKey, { label }]) => (
                <option key={catKey} value={catKey}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Abonent / Shaxsiy hisob raqami
            </label>
            <input
              type="text"
              placeholder="Masalan: 10023485"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Kvitansiya yoki hisoblagich shartnomasidagi hisob raqamini kiriting
            </p>
          </div>

          {/* Security & Authenticity Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Maʼlumotlar xavfsizligi va haqqoniyligi</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              Tizim hech qachon soxta (mock) balans yoki uydirma qarzdorlik maʼlumotlarini koʻrsatmaydi. Hozirda joriy oylik koʻrsatkichlarni «Kommunal qoʻshish» orqali qoʻlda aniq kiritishingiz mumkin.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Server ulanishi kutilmoqda</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Yopish
              </button>
              <button
                type="button"
                disabled={true}
                title="Paynet integratsiyasi tez kunda ishga tushadi"
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600/60 cursor-not-allowed rounded-xl flex items-center gap-2 opacity-70"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Balansni tekshirish (Tez kunda)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
