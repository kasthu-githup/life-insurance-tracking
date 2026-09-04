import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar, NavItem } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { GlobalSearchModal } from './components/GlobalSearchModal.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { PoliciesView } from './views/PoliciesView.tsx';
import { PolicyDetailModal } from './views/PolicyDetailModal.tsx';
import { ExpensesView } from './views/ExpensesView.tsx';
import { PremiumCalendarView } from './views/PremiumCalendarView.tsx';
import { PaymentsView } from './views/PaymentsView.tsx';
import { RemindersView } from './views/RemindersView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { DocumentsView } from './views/DocumentsView.tsx';
import { ProfileSettingsView } from './views/ProfileSettingsView.tsx';
import { AuthView } from './views/AuthView.tsx';
import { api } from './services/api.ts';
import {
  DashboardData,
  Policy,
  ExpenseItem,
  PaymentItem,
  ReminderItem,
  DocumentItem,
} from './types.ts';

const MainApp: React.FC = () => {
  const { user, profile, token, loading: authLoading } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Modals & Active Selections
  const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseModalPolicyId, setExpenseModalPolicyId] = useState<number | undefined>(undefined);
  const [selectedPolicyForDetail, setSelectedPolicyForDetail] = useState<Policy | null>(null);
  const [activePayModalPayment, setActivePayModalPayment] = useState<PaymentItem | null>(null);

  // App Data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const currencySymbol = profile?.currency === 'USD' ? '$' : '₹';

  // Load All Core Data
  const loadData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const [dash, pols, exps, pays, rems, docs] = await Promise.all([
        api.getDashboard(token).catch(() => null),
        api.getPolicies(token).catch(() => []),
        api.getExpenses(token).catch(() => []),
        api.getPayments(token).catch(() => []),
        api.getReminders(token).catch(() => []),
        api.getDocuments(token).catch(() => []),
      ]);

      if (dash) setDashboardData(dash);
      setPolicies(pols);
      setExpenses(exps);
      setPayments(pays);
      setReminders(rems);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, loadData]);

  // Global search shortcut Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-xs font-semibold">Initializing LifeTrack...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, render Login & Signup
  if (!user) {
    return <AuthView />;
  }

  const unreadRemindersCount = reminders.filter((r) => !r.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col antialiased font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        reminderCount={unreadRemindersCount}
      />

      {/* Main Content Area (offset by 64 lg for sidebar) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Sticky Top Header */}
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAddPolicy={() => setIsAddPolicyModalOpen(true)}
          onOpenAddExpense={() => {
            setExpenseModalPolicyId(undefined);
            setIsAddExpenseModalOpen(true);
          }}
          reminders={reminders}
          onSelectReminderTab={() => setCurrentTab('reminders')}
        />

        {/* View Router */}
        <main className="flex-1 pb-16">
          {currentTab === 'dashboard' && (
            <DashboardView
              data={dashboardData}
              loading={dataLoading}
              currencySymbol={currencySymbol}
              onSelectPolicy={(policy) => setSelectedPolicyForDetail(policy)}
              onOpenAddPolicy={() => setIsAddPolicyModalOpen(true)}
              onOpenAddExpense={() => {
                setExpenseModalPolicyId(undefined);
                setIsAddExpenseModalOpen(true);
              }}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              onPayPayment={(payment) => {
                setActivePayModalPayment(payment);
                setCurrentTab('payments');
              }}
            />
          )}

          {currentTab === 'policies' && (
            <PoliciesView
              policies={policies}
              loading={dataLoading}
              currencySymbol={currencySymbol}
              onSelectPolicy={(policy) => setSelectedPolicyForDetail(policy)}
              onRefresh={loadData}
              isAddModalOpen={isAddPolicyModalOpen}
              setIsAddModalOpen={setIsAddPolicyModalOpen}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              policies={policies}
              loading={dataLoading}
              currencySymbol={currencySymbol}
              onRefresh={loadData}
              isAddModalOpen={isAddExpenseModalOpen}
              setIsAddModalOpen={setIsAddExpenseModalOpen}
              initialPolicyId={expenseModalPolicyId}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsView
              payments={payments}
              policies={policies}
              loading={dataLoading}
              currencySymbol={currencySymbol}
              onRefresh={loadData}
              activePayModalPayment={activePayModalPayment}
              setActivePayModalPayment={setActivePayModalPayment}
            />
          )}

          {currentTab === 'calendar' && (
            <PremiumCalendarView
              payments={payments}
              currencySymbol={currencySymbol}
              onPayPayment={(payment) => {
                setActivePayModalPayment(payment);
                setCurrentTab('payments');
              }}
            />
          )}

          {currentTab === 'reminders' && (
            <RemindersView
              reminders={reminders}
              policies={policies}
              loading={dataLoading}
              onRefresh={loadData}
              currencySymbol={currencySymbol}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              currencySymbol={currencySymbol}
              policies={policies}
              expenses={expenses}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentsView
              documents={documents}
              policies={policies}
              loading={dataLoading}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileSettingsView onRefresh={loadData} />
          )}

          {currentTab === 'settings' && (
            <ProfileSettingsView onRefresh={loadData} />
          )}
        </main>
      </div>

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        policies={policies}
        expenses={expenses}
        payments={payments}
        onSelectPolicy={(p) => setSelectedPolicyForDetail(p)}
        onNavigateToTab={(tab) => setCurrentTab(tab)}
        currencySymbol={currencySymbol}
      />

      {/* Policy Details Deep-Dive Modal */}
      <PolicyDetailModal
        policy={selectedPolicyForDetail}
        isOpen={!!selectedPolicyForDetail}
        onClose={() => setSelectedPolicyForDetail(null)}
        currencySymbol={currencySymbol}
        onPolicyUpdated={loadData}
        onOpenAddExpenseWithPolicy={(policyId) => {
          setExpenseModalPolicyId(policyId);
          setIsAddExpenseModalOpen(true);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
