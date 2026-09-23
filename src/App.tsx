import React, { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { IncomeView } from './components/views/IncomeView';
import { ExpensesView } from './components/views/ExpensesView';
import { GoalsView } from './components/views/GoalsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { AddIncomeModal } from './components/modals/AddIncomeModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AddUtilityModal } from './components/modals/AddUtilityModal';
import { AddMandatoryModal } from './components/modals/AddMandatoryModal';
import { AddGoalModal } from './components/modals/AddGoalModal';
import { AssistantProvider, useAssistant } from './context/AssistantContext';
import { FloatingVoiceButton } from './components/assistant/FloatingVoiceButton';
import { AssistantModal } from './components/assistant/AssistantModal';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, activeModal, closeModal } = useFinance();
  const { isOpen: assistantOpen, closeAssistant } = useAssistant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Android hardware back button and keyboard ESC handling
  useEffect(() => {
    let removeCapListener: (() => void) | undefined;
    try {
      const listenerPromise = CapApp.addListener('backButton', () => {
        if (assistantOpen) {
          closeAssistant();
          return;
        }
        if (activeModal) {
          closeModal();
          return;
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          return;
        }
        if (activeTab !== 'dashboard') {
          setActiveTab('dashboard');
          return;
        }
      });
      listenerPromise.then((handle) => {
        removeCapListener = () => handle.remove();
      }).catch(() => {});
    } catch {
      // Standard browser runtime
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (assistantOpen) closeAssistant();
        else if (activeModal) closeModal();
        else if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (removeCapListener) removeCapListener();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [assistantOpen, closeAssistant, activeModal, closeModal, mobileMenuOpen, activeTab, setActiveTab]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-150 overflow-x-hidden w-full relative">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 p-3 sm:p-5 lg:p-7 overflow-y-auto w-full max-w-full">
          {/* Primary View Routing */}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'income' && <IncomeView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'utilities' && <ExpensesView initialTab="utilities" />}
          {activeTab === 'mandatory' && <ExpensesView initialTab="mandatory" />}
          {activeTab === 'goals' && <GoalsView />}
          {activeTab === 'goal-planner' && <GoalsView initialTab="planner" />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Floating Offline Voice Assistant */}
      <FloatingVoiceButton />
      <AssistantModal />

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
    <ThemeProvider>
      <LanguageProvider>
        <FinanceProvider>
          <AssistantProvider>
            <AppContent />
          </AssistantProvider>
        </FinanceProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

