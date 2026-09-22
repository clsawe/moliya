import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Target,
  Sparkles,
  Settings,
  X,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../i18n/LanguageContext';
import { ActiveTab } from '../types';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, summary } = useFinance();
  const { t, formatCurrency } = useLanguage();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    {
      id: 'dashboard',
      label: t('nav_dashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'income',
      label: t('nav_incomes'),
      icon: TrendingUp,
    },
    {
      id: 'expenses',
      label: t('nav_expenses'),
      icon: Receipt,
    },
    {
      id: 'goals',
      label: t('nav_goals'),
      icon: Target,
    },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  const isTabActive = (tabId: ActiveTab) => {
    if (tabId === 'dashboard') return activeTab === 'dashboard' || activeTab === 'reports';
    if (tabId === 'expenses') return activeTab === 'expenses' || activeTab === 'utilities' || activeTab === 'mandatory';
    if (tabId === 'goals') return activeTab === 'goals' || activeTab === 'goal-planner';
    return activeTab === tabId;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight block leading-tight">
                {t('app_title')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t('app_subtitle')}
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg flex items-center justify-center"
            aria-label={t('btn_cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isTabActive(item.id);

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full min-h-[48px] flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      active ? 'text-emerald-400 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Secondary: Settings (Separate from 4 main navigation tabs) */}
        <div className="px-3 pb-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <button
            id="sidebar-settings-btn"
            onClick={() => handleNavClick('settings')}
            className={`w-full min-h-[44px] flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" />
            <span>{t('nav_settings')}</span>
          </button>
        </div>

        {/* Bottom Section: Safe to Spend Metric */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/50">
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t('card_safe_today')}:</span>
            </div>
            <p className="mt-1 text-base font-extrabold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(summary.safeToSpendDaily)}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
