import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Bell,
  Moon,
  Sun,
  ShieldCheck,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface ProfileSettingsViewProps {
  onRefresh: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({ onRefresh }) => {
  const { profile, user, token, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || user?.name || 'Kasthuri');
  const [phone, setPhone] = useState(profile?.phone || '+91 98765 43210');
  const [address, setAddress] = useState(profile?.address || 'Chennai, Tamil Nadu, India');
  const [dob, setDob] = useState(profile?.dob || '1992-05-14');
  const [currency, setCurrency] = useState(profile?.currency || 'INR');
  const [emailNotifications, setEmailNotifications] = useState(profile?.emailNotifications ?? true);
  const [reminderDays, setReminderDays] = useState(profile?.reminderDays || 7);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setDob(profile.dob || '');
      setCurrency(profile.currency || 'INR');
      setEmailNotifications(profile.emailNotifications ?? true);
      setReminderDays(profile.reminderDays || 7);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setSuccessMsg('');
    try {
      await api.updateProfile(token, {
        fullName,
        phone,
        address,
        dob,
        currency,
        emailNotifications,
        reminderDays,
      });

      await refreshProfile();
      onRefresh();
      setSuccessMsg('Profile & preferences saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600" />
          User Profile & Application Settings
        </h2>
        <p className="text-xs text-slate-500">
          Manage your personal insurance account details, notification rules, and default currency
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
              {(fullName || 'K').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{fullName}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Cloud SQL Verified User
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Address / City
              </label>
              <input
                type="text"
                placeholder="Residential Address for policy records..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Preferences & Settings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Settings className="w-5 h-5 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Application Preferences</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Currency */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Display Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD (US Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
                <option value="GBP">£ GBP (British Pound)</option>
                <option value="SGD">S$ SGD (Singapore Dollar)</option>
                <option value="AED">AED (UAE Dirham)</option>
              </select>
            </div>

            {/* Default Reminder Lead Time */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Default Premium Alert Trigger
              </label>
              <select
                value={reminderDays}
                onChange={(e) => setReminderDays(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-medium"
              >
                <option value={1}>1 Day before due date</option>
                <option value={3}>3 Days before due date</option>
                <option value={7}>7 Days before due date (Recommended)</option>
                <option value={15}>15 Days before due date</option>
              </select>
            </div>
          </div>

          {/* Email Notification Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Email & In-App Alerts</p>
                <p className="text-[11px] text-slate-500">
                  Notify before policy due dates and grace period deadlines
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Security Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-950">PostgreSQL Cloud SQL Isolation</p>
              <p className="text-[11px] text-indigo-800/80 leading-relaxed mt-0.5">
                Your life insurance policies, payment schedules, and expense ledgers are isolated and encrypted per your user ID in region <code className="font-mono bg-white/60 px-1 py-0.5 rounded text-indigo-900">asia-southeast1</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
