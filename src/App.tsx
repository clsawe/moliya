import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { IncomeView } from './components/views/IncomeView';
import { ExpensesView } from './components/views/ExpensesView';
import { GoalsView } from './components/views/GoalsView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { AddIncomeModal } from './components/modals/AddIncomeModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AddUtilityModal } from './components/modals/AddUtilityModal';
import { AddMandatoryModal } from './components/modals/AddMandatoryModal';
import { AddGoalModal } from './components/modals/AddGoalModal';

const AppContent: React.FC = () => {
  const { activeTab } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sidebar Navigation - 4 items only */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Primary View Routing */}
          {(activeTab === 'dashboard' || activeTab === 'reports') && <DashboardView />}
          {activeTab === 'income' && <IncomeView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'utilities' && <ExpensesView initialTab="utilities" />}
          {activeTab === 'mandatory' && <ExpensesView initialTab="mandatory" />}
          {activeTab === 'goals' && <GoalsView />}
          {activeTab === 'goal-planner' && <GoalsView initialTab="planner" />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Data Input Modals */}
      <AddIncomeModal />
      <AddExpenseModal />
      <AddUtilityModal />
      <AddMandatoryModal />
      <AddGoalModal />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
