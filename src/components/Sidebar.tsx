import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Target,
  Settings,
  X,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTab } from '../types';
import { formatUZS } from '../utils/formatters';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, summary } = useFinance();

  // ONLY 4 primary navigation items as required
  const primaryNavItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Bosh sahifa',
      icon: LayoutDashboard,
    },
    {
      id: 'income',
      label: 'Daromadlar',
      icon: TrendingUp,
      badge: summary.totalIncome > 0 ? formatUZS(summary.totalIncome, false) : undefined,
    },
    {
      id: 'expenses',
      label: 'Xarajatlar',
      icon: Receipt,
      badge: summary.totalUnpaidBillsCount > 0 ? `${summary.totalUnpaidBillsCount} toʻlov` : undefined,
    },
    {
      id: 'goals',
      label: 'Maqsadlar',
      icon: Target,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  // Check if activeTab matches or belongs to sub-area
  const isTabActive = (id: ActiveTab) => {
    if (activeTab === id) return true;
    if (id === 'expenses' && (activeTab === 'utilities' || activeTab === 'mandatory')) return true;
    if (id === 'goals' && activeTab === 'goal-planner') return true;
    if (id === 'dashboard' && activeTab === 'reports') return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Oila va Moliya</h1>
              <p className="text-[11px] text-slate-500 font-medium">Rejalashtirish ilovasi</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Menyuni yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Primary Navigation Items ONLY */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isTabActive(item.id);

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
                      active
                        ? 'bg-slate-800 text-emerald-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Safe to Spend Metric */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/60">
          {/* Compact Safe-to-Spend Status Card */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Xavfsiz sarflash (kunlik):</span>
            </div>
            <p className="mt-1 text-sm font-extrabold text-emerald-700">
              {formatUZS(summary.safeToSpendDaily)}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
