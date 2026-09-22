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
  Sun,
  Moon,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { currentMonth, setCurrentMonth, summary, openModal, setActiveTab, activeTab } = useFinance();
  const { t, formatCurrency, formatMonth } = useLanguage();
  const { theme, setTheme, resolvedTheme } = useTheme();
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

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 px-4 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden min-h-[44px] min-w-[44px] p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          aria-label={t('open_menu')}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Month Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          <button
            onClick={handlePrevMonth}
            className="min-h-[36px] min-w-[36px] p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center justify-center"
            title="Oldingi oy"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 select-none min-w-[120px] text-center">
            {formatMonth(currentMonth)}
          </span>
          <button
            onClick={handleNextMonth}
            className="min-h-[36px] min-w-[36px] p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center justify-center"
            title="Keyingi oy"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Safe-to-spend Quick Pill */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all text-xs font-medium cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('card_safe_today')}:</span>
          <span className="font-bold">{formatCurrency(summary.safeToSpendDaily)}</span>
        </button>

        {/* Quick Add Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="quick-add-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-500 text-sm font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">
              {t('btn_add')}
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t('section_quick_actions')}
              </div>

              <button
                id="add-income-menu-item"
                onClick={() => {
                  setDropdownOpen(false);
                  openModal('income');
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{t('btn_add_income')}</div>
                </div>
              </button>

              <button
                id="add-expense-menu-item"
                onClick={() => {
                  setDropdownOpen(false);
                  openModal('expense');
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{t('btn_add_expense')}</div>
                </div>
              </button>

              <button
                id="add-utility-menu-item"
                onClick={() => {
                  setDropdownOpen(false);
                  openModal('utility');
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{t('btn_add_utility')}</div>
                </div>
              </button>

              <button
                id="add-mandatory-menu-item"
                onClick={() => {
                  setDropdownOpen(false);
                  openModal('mandatory');
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{t('btn_add_mandatory')}</div>
                </div>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

              <button
                id="add-goal-menu-item"
                onClick={() => {
                  setDropdownOpen(false);
                  openModal('goal');
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{t('btn_add_goal')}</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Dark/Light Quick Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
          title={resolvedTheme === 'dark' ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}
          aria-label="Koʻrinish rejimini oʻzgartirish"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Settings Icon in Header */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl transition-colors flex items-center justify-center ${
            activeTab === 'settings'
              ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-2xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={t('settings_title')}
          aria-label={t('settings_title')}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
