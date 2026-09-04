import React, { useState } from 'react';
import { Menu, Search, Bell, Plus, Shield, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { ReminderItem } from '../types.ts';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenSearch: () => void;
  onOpenAddPolicy: () => void;
  onOpenAddExpense: () => void;
  reminders: ReminderItem[];
  onSelectReminderTab: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenSearch,
  onOpenAddPolicy,
  onOpenAddExpense,
  reminders,
  onSelectReminderTab,
  title,
  subtitle,
}) => {
  const { profile, user } = useAuth();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const displayName = profile?.fullName || user?.name || 'Kasthuri';
  const currencySymbol = profile?.currency === 'USD' ? '$' : '₹';

  // Determine time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const unreadReminders = reminders.filter((r) => !r.isRead);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile trigger & Greeting */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              {title || `${getGreeting()}, ${displayName} 👋`}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {subtitle || "Here's your insurance and expense overview"}
            </p>
          </div>
        </div>

        {/* Center: Search trigger */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <button
            id="global-search-trigger"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search policies, expenses, payments...</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Add Dropdown */}
          <div className="relative">
            <button
              id="quick-add-menu-btn"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New</span>
            </button>

            {showQuickAdd && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowQuickAdd(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setShowQuickAdd(false);
                      onOpenAddPolicy();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span>Add New Policy</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickAdd(false);
                      onOpenAddExpense();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Add Expense (Direct/Indirect)</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notifications / Reminders Bell */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadReminders.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifs && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifs(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-3 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Reminders & Alerts ({unreadReminders.length})
                    </span>
                    <button
                      onClick={() => {
                        setShowNotifs(false);
                        onSelectReminderTab();
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      View All
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {reminders.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No active reminders
                      </div>
                    ) : (
                      reminders.slice(0, 4).map((rem) => (
                        <div
                          key={rem.id}
                          className={`p-3.5 text-xs hover:bg-slate-50 transition-colors ${
                            !rem.isRead ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-800 mb-0.5">
                            <span className="truncate">{rem.title}</span>
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium ml-2 shrink-0 border border-amber-200/60">
                              Due {rem.dueDate}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {rem.policyName || 'Life Insurance Policy'} · Remind {rem.remindDaysBefore} days before
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Currency Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100/80 border border-slate-200 rounded-lg">
            <span>Currency:</span>
            <span className="font-bold text-slate-900">{currencySymbol}</span>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
