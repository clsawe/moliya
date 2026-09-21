import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  Receipt,
  Zap,
  ShieldCheck,
  Target,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatUZS, formatMonthName } from '../utils/formatters';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { currentMonth, setCurrentMonth, summary, openModal, setActiveTab, activeTab } = useFinance();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle month prev/next
  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const newMonthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const newMonthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonthStr);
  };

  return (
    <header className="h-16 px-4 md:px-8 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Menyuni ochish"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Month Selector */}
        <div className="flex items-center bg-slate-100/90 rounded-xl p-1 border border-slate-200/60 shadow-2xs">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white transition-all"
            title="Oldingi oy"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs font-semibold text-slate-800 select-none min-w-[110px] text-center">
            {formatMonthName(currentMonth)}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white transition-all"
            title="Keyingi oy"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Safe-to-spend Quick Pill */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 cursor-pointer hover:bg-emerald-100/80 transition-all"
          title="Bosh sahifada xavfsiz sarflash darajasini koʻrish"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-medium">Xavfsiz (bugun):</span>
          <span className="text-xs font-bold">{formatUZS(summary.safeToSpendDaily)}</span>
        </div>

        {/* Quick Add Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="quick-add-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Yangi qoʻshish</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Yangi maʼlumot kiritish
              </div>
              
              <button
                id="add-income-menu-item"
                onClick={() => {
                  setDropdownOpen(false);
                  openModal('income');
                }}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Daromad qoʻshish</div>
                  <div className="text-[11px] text-slate-400">Maosh, biznes yoki frilans</div>
                </div>
              </button>

              <button
                id="add-expense-menu-item"
                onClick={() => {
                  setDropdownOpen(false);
                  openModal('expense');
                }}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Kundalik xarajat</div>
                  <div className="text-[11px] text-slate-400">Oziq-ovqat, transport, kiyim</div>
                </div>
              </button>

              <button
                id="add-utility-menu-item"
                onClick={() => {
                  setDropdownOpen(false);
                  openModal('utility');
                }}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Kommunal toʻlov</div>
                  <div className="text-[11px] text-slate-400">Elektr, gaz, suv, internet</div>
                </div>
              </button>

              <button
                id="add-mandatory-menu-item"
                onClick={() => {
                  setDropdownOpen(false);
                  openModal('mandatory');
                }}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Soliq va majburiy</div>
                  <div className="text-[11px] text-slate-400">Soliqlar, sugʻurta, kredit</div>
                </div>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                id="add-goal-menu-item"
                onClick={() => {
                  setDropdownOpen(false);
                  openModal('goal');
                }}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Moliyaviy maqsad</div>
                  <div className="text-[11px] text-slate-400">Yangi xarid yoki jamgʻarma</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Small Settings Icon in Header */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-2 rounded-xl transition-colors ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Sozlamalar"
          aria-label="Sozlamalar"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
