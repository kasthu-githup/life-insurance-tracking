import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Shield,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { ReminderItem, Policy } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';

interface RemindersViewProps {
  reminders: ReminderItem[];
  policies: Policy[];
  loading: boolean;
  onRefresh: () => void;
  currencySymbol: string;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  policies,
  loading,
  onRefresh,
  currencySymbol,
}) => {
  const { token } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Active'>('Active');

  const [formData, setFormData] = useState({
    policyId: policies[0]?.id?.toString() || '',
    title: '',
    reminderType: 'Premium Due Reminder',
    dueDate: '',
    remindDaysBefore: 7,
  });
  const [submitting, setSubmitting] = useState(false);

  const activeReminders = reminders.filter((r) => !r.isDismissed);
  const displayedReminders = reminders.filter((r) => {
    if (filter === 'Unread') return !r.isRead && !r.isDismissed;
    if (filter === 'Active') return !r.isDismissed;
    return true;
  });

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formData.title || !formData.dueDate) {
      alert('Please fill in title and due date.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createReminder(token, {
        policyId: formData.policyId ? parseInt(formData.policyId, 10) : null,
        title: formData.title,
        reminderType: formData.reminderType,
        dueDate: formData.dueDate,
        remindDaysBefore: formData.remindDaysBefore,
      });

      setIsAddOpen(false);
      onRefresh();
      setFormData({
        policyId: policies[0]?.id?.toString() || '',
        title: '',
        reminderType: 'Premium Due Reminder',
        dueDate: '',
        remindDaysBefore: 7,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to create reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    if (!token) return;
    try {
      await api.markReminderRead(token, id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = async (id: number) => {
    if (!token) return;
    try {
      await api.dismissReminder(token, id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const [deletingReminder, setDeletingReminder] = useState<ReminderItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteReminder = async () => {
    if (!token || !deletingReminder) return;
    setIsDeleting(true);
    try {
      await api.deleteReminder(token, deletingReminder.id);
      setDeletingReminder(null);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            Reminders & Alerts
          </h2>
          <p className="text-xs text-slate-500">
            Never miss an insurance premium payment with automated advance due alerts
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set Custom Reminder</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('Active')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'Active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Active ({activeReminders.length})
          </button>
          <button
            onClick={() => setFilter('Unread')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'Unread' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Unread ({reminders.filter((r) => !r.isRead && !r.isDismissed).length})
          </button>
          <button
            onClick={() => setFilter('All')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All History ({reminders.length})
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : displayedReminders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Reminders Found</h3>
            <p className="text-xs text-slate-500 mt-1">You are up to date on all premium schedules.</p>
          </div>
        ) : (
          displayedReminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !rem.isRead
                  ? 'bg-amber-50/40 border-amber-200/80 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    !rem.isRead
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      {rem.reminderType}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Remind {rem.remindDaysBefore} days before
                    </span>
                    {!rem.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{rem.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Policy: <strong className="text-slate-800">{rem.policyName || 'General Policy'}</strong> · Due Date: <span className="font-semibold text-rose-600">{rem.dueDate}</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {!rem.isRead && (
                  <button
                    onClick={() => handleMarkRead(rem.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mark as Read</span>
                  </button>
                )}
                <button
                  onClick={() => handleDismiss(rem.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-amber-600 transition-colors"
                  title="Dismiss reminder"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Dismiss</span>
                </button>
                <button
                  id={`delete-reminder-${rem.id}`}
                  onClick={() => setDeletingReminder(rem)}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                  title="Delete reminder permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Reminder Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <h3 className="text-base font-bold text-slate-900">Create New Reminder</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Reminder Type *
                </label>
                <select
                  value={formData.reminderType}
                  onChange={(e) => setFormData({ ...formData, reminderType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  <option value="Premium Due Reminder">Premium Due Reminder</option>
                  <option value="Policy Renewal Reminder">Policy Renewal Reminder</option>
                  <option value="Policy Expiry Reminder">Policy Expiry Reminder</option>
                  <option value="Grace Period Alert">Grace Period Alert</option>
                  <option value="Payment Reminder">Payment Reminder</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Policy Link
                </label>
                <select
                  value={formData.policyId}
                  onChange={(e) => {
                    const p = policies.find((item) => item.id.toString() === e.target.value);
                    setFormData({
                      ...formData,
                      policyId: e.target.value,
                      title: p ? `Your ${p.policyName} premium of ${currencySymbol}${p.premiumAmount.toLocaleString('en-IN')} is due` : formData.title,
                      dueDate: p ? p.nextDueDate : formData.dueDate,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  <option value="">Select a policy...</option>
                  {policies.map((p) => (
                    <option key={p.id} value={p.id.toString()}>
                      {p.policyName} ({p.companyName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Alert Message / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Your LIC Jeevan premium of ₹2,500 is due on 10 Jan"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Remind options: 1 day, 3 days, 7 days, 15 days */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Notification Schedule *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 7, 15].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormData({ ...formData, remindDaysBefore: d })}
                      className={`py-2 text-center rounded-xl font-semibold border transition-colors ${
                        formData.remindDaysBefore === d
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {d} {d === 1 ? 'day' : 'days'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  You will receive in-app alert and notification banner {formData.remindDaysBefore} days before the due date.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Setting...' : 'Set Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Reminder Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingReminder)}
        title="Delete Reminder"
        message={
          deletingReminder
            ? `Are you sure you want to permanently delete the reminder "${deletingReminder.title}"?`
            : ''
        }
        confirmText="Delete Reminder"
        isLoading={isDeleting}
        onConfirm={confirmDeleteReminder}
        onClose={() => setDeletingReminder(null)}
      />
    </div>
  );
};
