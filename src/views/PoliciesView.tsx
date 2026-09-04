import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  Layers,
  Trash2,
} from 'lucide-react';
import { Policy, PolicyType, PremiumFrequency } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';

interface PoliciesViewProps {
  policies: Policy[];
  loading: boolean;
  currencySymbol: string;
  onSelectPolicy: (policy: Policy) => void;
  onRefresh: () => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({
  policies,
  loading,
  currencySymbol,
  onSelectPolicy,
  onRefresh,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const { token, profile, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Add Policy Form State
  const [formData, setFormData] = useState({
    policyName: '',
    companyName: '',
    policyNumber: '',
    policyType: 'Term Life Insurance' as PolicyType,
    policyHolder: profile?.fullName || user?.name || 'Kasthuri',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    premiumAmount: '',
    premiumFrequency: 'Yearly' as PremiumFrequency,
    nextDueDate: '',
    sumAssured: '',
    paymentMethod: 'Net Banking',
    nomineeName: '',
    nomineeRelation: 'Spouse',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [isDeletingPolicy, setIsDeletingPolicy] = useState(false);

  const handleConfirmDeletePolicy = async () => {
    if (!token || !policyToDelete) return;
    setIsDeletingPolicy(true);
    try {
      await api.deletePolicy(token, policyToDelete.id);
      setPolicyToDelete(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete policy:', err);
    } finally {
      setIsDeletingPolicy(false);
    }
  };

  const policyTypes: PolicyType[] = [
    'Term Life Insurance',
    'Whole Life',
    'Endowment',
    'ULIP',
    'Money Back',
    'Child Insurance',
    'Other',
  ];

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      p.policyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.policyNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || p.policyType === typeFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formData.policyName || !formData.companyName || !formData.policyNumber || !formData.premiumAmount || !formData.nextDueDate) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.createPolicy(token, {
        policyName: formData.policyName,
        companyName: formData.companyName,
        policyNumber: formData.policyNumber,
        policyType: formData.policyType,
        policyHolder: formData.policyHolder,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        premiumAmount: parseFloat(formData.premiumAmount),
        premiumFrequency: formData.premiumFrequency,
        nextDueDate: formData.nextDueDate,
        sumAssured: formData.sumAssured ? parseFloat(formData.sumAssured) : 0,
        paymentMethod: formData.paymentMethod,
        nomineeName: formData.nomineeName,
        nomineeRelation: formData.nomineeRelation,
        status: 'Active',
        notes: formData.notes,
      });

      setIsAddModalOpen(false);
      onRefresh();
      // Reset form
      setFormData({
        policyName: '',
        companyName: '',
        policyNumber: '',
        policyType: 'Term Life Insurance',
        policyHolder: profile?.fullName || user?.name || 'Kasthuri',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        premiumAmount: '',
        premiumFrequency: 'Yearly',
        nextDueDate: '',
        sumAssured: '',
        paymentMethod: 'Net Banking',
        nomineeName: '',
        nomineeRelation: 'Spouse',
        notes: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to create policy');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Insurance Policies
          </h2>
          <p className="text-xs text-slate-500">
            Manage your life insurance plans, coverage, frequencies, and nominee details
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Policy</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by policy name, insurer or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
          {/* Policy Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Policy Types</option>
            {policyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Lapsed">Lapsed</option>
            <option value="Matured">Matured</option>
            <option value="Surrendered">Surrendered</option>
          </select>
        </div>
      </div>

      {/* Policies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Policies Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || typeFilter !== 'All'
              ? 'No policies match your search filters.'
              : 'Add your first life insurance policy to begin tracking premiums and expenses.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-xs"
          >
            + Add First Policy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPolicies.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPolicy(p)}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 hover:shadow-sm transition-all cursor-pointer overflow-hidden flex flex-col justify-between group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {p.policyType}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        p.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.status}
                    </span>
                    <button
                      id={`policy-card-delete-${p.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPolicyToDelete(p);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Policy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {p.policyName}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {p.companyName}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Policy #{p.policyNumber}
                </p>

                {/* Values strip */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Premium Amount</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {currencySymbol}{p.premiumAmount.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {p.premiumFrequency}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px]">Sum Assured</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                      {currencySymbol}{(p.sumAssured || 0).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-indigo-600 font-medium">
                      Life Cover
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Next Due: <strong className="text-slate-700">{p.nextDueDate}</strong></span>
                </div>
                <span className="text-indigo-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Policy Modal (Full Fields per Section 4) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Insurance Policy</h3>
                  <p className="text-xs text-slate-500">Enter policy details, sum assured, and payment schedule</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Policy Name */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Policy Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LIC Jeevan Labh"
                    value={formData.policyName}
                    onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Insurance Company */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Insurance Company *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Life Insurance Corporation / HDFC Life"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Policy Number */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Policy Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POL-98765432"
                    value={formData.policyNumber}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Policy Type */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Policy Type *
                  </label>
                  <select
                    value={formData.policyType}
                    onChange={(e) => setFormData({ ...formData, policyType: e.target.value as PolicyType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    {policyTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Policy Holder */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Policy Holder
                  </label>
                  <input
                    type="text"
                    value={formData.policyHolder}
                    onChange={(e) => setFormData({ ...formData, policyHolder: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Premium Amount */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Premium Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2500"
                    value={formData.premiumAmount}
                    onChange={(e) => setFormData({ ...formData, premiumAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Premium Frequency */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Premium Frequency *
                  </label>
                  <select
                    value={formData.premiumFrequency}
                    onChange={(e) =>
                      setFormData({ ...formData, premiumFrequency: e.target.value as PremiumFrequency })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                {/* Next Due Date */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Next Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Sum Assured */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Sum Assured ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    placeholder="1000000"
                    value={formData.sumAssured}
                    onChange={(e) => setFormData({ ...formData, sumAssured: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Net Banking">Net Banking</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Auto-Debit NACH">Auto-Debit NACH</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Maturity / End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Nominee Name */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nominee / Beneficiary Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Raman"
                    value={formData.nomineeName}
                    onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Nominee Relation */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nominee Relationship
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Spouse / Child / Parent"
                    value={formData.nomineeRelation}
                    onChange={(e) => setFormData({ ...formData, nomineeRelation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Policy Notes / Riders
                </label>
                <textarea
                  rows={2}
                  placeholder="Accidental benefit, critical illness rider, agent contact, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving Policy...' : 'Save Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(policyToDelete)}
        title="Delete Policy"
        message={
          policyToDelete
            ? `Are you sure you want to permanently delete "${policyToDelete.policyName}" (Policy #${policyToDelete.policyNumber})? All associated payment schedules, direct/indirect expenses, and linked documents will also be removed.`
            : ''
        }
        confirmText="Yes, Delete Policy"
        isLoading={isDeletingPolicy}
        onConfirm={handleConfirmDeletePolicy}
        onClose={() => setPolicyToDelete(null)}
      />
    </div>
  );
};
