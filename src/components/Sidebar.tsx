import React from 'react';
import {
  LayoutDashboard,
  Shield,
  Receipt,
  CreditCard,
  Calendar,
  Bell,
  BarChart3,
  FileText,
  User,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export type NavItem =
  | 'dashboard'
  | 'policies'
  | 'expenses'
  | 'payments'
  | 'calendar'
  | 'reminders'
  | 'reports'
  | 'documents'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  isOpen: boolean;
  onClose: () => void;
  reminderCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  reminderCount = 0,
}) => {
  const { logout, profile, user } = useAuth();

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'calendar', label: 'Premium Calendar', icon: Calendar },
    { id: 'reminders', label: 'Reminders', icon: Bell, badge: reminderCount },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  const bottomNavItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white text-slate-800 border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-indigo-600 leading-tight block">
                LifeTrack
              </span>
              <p className="text-[11px] text-slate-400 font-medium leading-none">
                Insurance Expense Manager
              </p>
            </div>
          </div>
          <button
            id="close-sidebar-button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id as NavItem);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-amber-100 text-amber-800">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="pt-5 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Preferences
          </div>
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id as NavItem);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                {(profile?.fullName || user?.name || 'K').charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {profile?.fullName || user?.name || 'Kasthuri'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'Authenticated'}
                </p>
              </div>
            </div>
            <button
              id="logout-button"
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
