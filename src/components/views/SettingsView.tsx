import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Coins,
  Database,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Shield,
  Info,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { INITIAL_INCOMES, INITIAL_EXPENSES, INITIAL_UTILITIES, INITIAL_MANDATORY, INITIAL_GOALS } from '../../data/initialData';

export const SettingsView: React.FC = () => {
  const { currentMonth } = useFinance();
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleResetDemoData = () => {
    if (window.confirm("Barcha ma'lumotlarni boshlang'ich demo ma'lumotlarga qaytarishni xohlaysizmi?")) {
      localStorage.setItem('finplan_incomes', JSON.stringify(INITIAL_INCOMES));
      localStorage.setItem('finplan_expenses', JSON.stringify(INITIAL_EXPENSES));
      localStorage.setItem('finplan_utilities', JSON.stringify(INITIAL_UTILITIES));
      localStorage.setItem('finplan_mandatory', JSON.stringify(INITIAL_MANDATORY));
      localStorage.setItem('finplan_goals', JSON.stringify(INITIAL_GOALS));
      setResetSuccess("Boshlang'ich demo ma'lumotlar tiklandi. Sahifa yangilanmoqda...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Haqiqatan ham barcha ma'lumotlarni butunlay tozalab tashlamoqchimisiz?")) {
      localStorage.removeItem('finplan_incomes');
      localStorage.removeItem('finplan_expenses');
      localStorage.removeItem('finplan_utilities');
      localStorage.removeItem('finplan_mandatory');
      localStorage.removeItem('finplan_goals');
      setResetSuccess("Barcha ma'lumotlar tozalandi. Sahifa yangilanmoqda...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5 text-slate-600" />
          <span>Tizim sozlamalari</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Sozlamalar va Maʼlumotlar boshqaruvi
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Valyuta, til parametrlari, hisoblash qoidalari va mahalliy xotira (localStorage) holati
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resetSuccess}</span>
        </div>
      )}

      {/* Preferences Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
        <h3 className="text-base font-bold text-slate-900">Standart parametrlar</h3>

        {/* Currency setting */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Asosiy valyuta</div>
              <div className="text-xs text-slate-500">Barcha hisob-kitoblar Oʻzbekiston soʻmida (UZS) amalga oshiriladi</div>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-800">
            UZS (soʻm)
          </span>
        </div>

        {/* Language setting */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Interfeys tili</div>
              <div className="text-xs text-slate-500">Ilova toʻliq oʻzbek tilida faoliyat yuritadi</div>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-800">
            Oʻzbekcha
          </span>
        </div>

        {/* Financial engine spec */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Hisoblash mexanizmi</div>
              <div className="text-xs text-slate-500">Deterministik, suzuvchi nuqtasiz butun sonli matematika (Zero float errors)</div>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
            Faol & Aniq
          </span>
        </div>
      </div>

      {/* Local Storage Data Management */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-600" />
          <span>Lokal xotira (localStorage) boshqaruvi</span>
        </h3>
        <p className="text-xs text-slate-500">
          Barcha moliyaviy maʼlumotlaringiz (daromadlar, xarajatlar, kommunal va maqsadlar) brauzeringizning shaxsiy xotirasida xavfsiz saqlanadi.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleResetDemoData}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Demo maʼlumotlarni qayta yuklash</span>
          </button>

          <button
            onClick={handleClearAll}
            className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Barcha maʼlumotlarni tozalash</span>
          </button>
        </div>
      </div>
    </div>
  );
};
