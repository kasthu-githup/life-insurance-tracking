import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  FileCheck,
} from 'lucide-react';
import {
  ExpenseItem,
  ExpenseType,
  DirectCategory,
  IndirectCategory,
  Policy,
} from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';

interface ExpensesViewProps {
  expenses: ExpenseItem[];
  policies: Policy[];
  loading: boolean;
  currencySymbol: string;
  onRefresh: () => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  initialPolicyId?: number;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  policies,
  loading,
  currencySymbol,
  onRefresh,
  isAddModalOpen,
  setIsAddModalOpen,
  initialPolicyId,
}) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'All' | 'Direct' | 'Indirect'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicyFilter, setSelectedPolicyFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Form State
  const [formType, setFormType] = useState<ExpenseType>('Direct');
  const [formData, setFormData] = useState({
    policyId: initialPolicyId ? initialPolicyId.toString() : '',
    expenseName: '',
    category: 'Premium',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const directCategories: DirectCategory[] = [
    'Premium',
    'Renewal Charges',
    'Policy Fees',
    'Rider Premium',
    'Late Payment Fee',
    'GST/Tax',
    'Medical Examination Fee',
  ];

  const indirectCategories: IndirectCategory[] = [
    'Agent Commission',
    'Travel Expense',
    'Documentation Charges',
    'Bank Charges',
    'Service Charges',
    'Consultation Fee',
    'Courier Charges',
    'Other',
  ];

  // Totals
  const directTotal = expenses
    .filter((e) => e.expenseType === 'Direct')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const indirectTotal = expenses
    .filter((e) => e.expenseType === 'Indirect')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const grandTotal = directTotal + indirectTotal;

  // Filtered List
  const filteredExpenses = expenses.filter((e) => {
    const matchesTab = activeTab === 'All' || e.expenseType === activeTab;
    const matchesSearch =
      e.expenseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.policyName && e.policyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPolicy =
      selectedPolicyFilter === 'All' ||
      (e.policyId && e.policyId.toString() === selectedPolicyFilter);
    const matchesCategory =
      selectedCategoryFilter === 'All' || e.category === selectedCategoryFilter;

    return matchesTab && matchesSearch && matchesPolicy && matchesCategory;
  });

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formData.expenseName || !formData.amount || !formData.expenseDate) {
      setFormError('Please enter expense name, amount, and date.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.createExpense(token, {
        policyId: formData.policyId ? parseInt(formData.policyId, 10) : null,
        expenseName: formData.expenseName,
        expenseType: formType,
        category: formData.category,
        amount: parseFloat(formData.amount),
        expenseDate: formData.expenseDate,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes,
      });

      setIsAddModalOpen(false);
      onRefresh();
      // Reset form
      setFormData({
        policyId: '',
        expenseName: '',
        category: formType === 'Direct' ? 'Premium' : 'Agent Commission',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        notes: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const [deletingExpense, setDeletingExpense] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const confirmDeleteExpense = async () => {
    if (!token || !deletingExpense) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await api.deleteExpense(token, deletingExpense.id);
      setDeletingExpense(null);
      onRefresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete expense');
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
            <Receipt className="w-6 h-6 text-indigo-600" />
            Insurance Expense Tracking
          </h2>
          <p className="text-xs text-slate-500">
            Track policy premiums (Direct) and auxiliary maintenance costs (Indirect)
          </p>
        </div>
        <button
          onClick={() => {
            setFormType('Direct');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary Highlight Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Expenses</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {currencySymbol}{grandTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-400">All recorded transactions</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-100/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-indigo-600 uppercase">Direct Expenses</p>
            <p className="text-xl font-bold text-indigo-700 mt-0.5">
              {currencySymbol}{directTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-indigo-500">
              Premiums, riders, taxes ({grandTotal > 0 ? Math.round((directTotal / grandTotal) * 100) : 0}%)
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-amber-600 uppercase">Indirect Expenses</p>
            <p className="text-xl font-bold text-amber-700 mt-0.5">
              {currencySymbol}{indirectTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-amber-500">
              Agent commission, travel, docs ({grandTotal > 0 ? Math.round((indirectTotal / grandTotal) * 100) : 0}%)
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Direct vs Indirect Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab('All')}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'All'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Expenses ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab('Direct')}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'Direct'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-300" />
              Direct Expenses
            </button>
            <button
              onClick={() => setActiveTab('Indirect')}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'Indirect'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-300" />
              Indirect Expenses
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Category & Policy Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500">Filters:</span>

          <select
            value={selectedPolicyFilter}
            onChange={(e) => setSelectedPolicyFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="All">All Policies</option>
            {policies.map((p) => (
              <option key={p.id} value={p.id.toString()}>
                {p.policyName}
              </option>
            ))}
          </select>

          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="All">All Categories</option>
            {(activeTab === 'Indirect' ? indirectCategories : directCategories).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Expense Details</th>
                <th className="py-3 px-5">Type & Category</th>
                <th className="py-3 px-5">Policy Link</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Payment Method</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading expense records...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-slate-900">{exp.expenseName}</p>
                      {exp.notes && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{exp.notes}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mr-1.5 ${
                          exp.expenseType === 'Direct'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                        }`}
                      >
                        {exp.expenseType}
                      </span>
                      <span className="text-slate-600 font-medium">{exp.category}</span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {exp.policyName || <span className="text-slate-400 italic">General / None</span>}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                      {exp.expenseDate}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">
                      {exp.paymentMethod || 'UPI'}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                      {currencySymbol}{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setDeletingExpense({ id: exp.id, name: exp.expenseName })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                    formType === 'Direct' ? 'bg-indigo-600' : 'bg-amber-600'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Insurance Expense</h3>
                  <p className="text-xs text-slate-500">Record direct premiums or indirect auxiliary charges</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              {/* Expense Type Switcher (Direct vs Indirect) */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Expense Type *
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('Direct');
                      setFormData({ ...formData, category: 'Premium' });
                    }}
                    className={`py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      formType === 'Direct'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Direct Expense</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('Indirect');
                      setFormData({ ...formData, category: 'Agent Commission' });
                    }}
                    className={`py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      formType === 'Indirect'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Indirect Expense</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {formType === 'Direct'
                    ? 'Direct expenses include regular premiums, renewal fees, GST, and riders.'
                    : 'Indirect expenses include commissions, agent travel, courier, and documentation.'}
                </p>
              </div>

              {/* Expense Title */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Expense Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formType === 'Direct'
                      ? 'e.g. Annual LIC Jeevan Premium 2026'
                      : 'e.g. Agent Documentation & Courier Charges'
                  }
                  value={formData.expenseName}
                  onChange={(e) => setFormData({ ...formData, expenseName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    {(formType === 'Direct' ? directCategories : indirectCategories).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Policy Link */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Linked Policy
                  </label>
                  <select
                    value={formData.policyId}
                    onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="">None (General Insurance Expense)</option>
                    {policies.map((p) => (
                      <option key={p.id} value={p.id.toString()}>
                        {p.policyName} ({p.companyName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Notes / Receipt Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="Receipt number, payment reference, or remarks..."
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
                  className={`px-5 py-2 text-white rounded-xl font-bold shadow-xs transition-colors disabled:opacity-50 ${
                    formType === 'Direct' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {submitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingExpense}
        title="Delete Expense Record"
        message={
          deletingExpense
            ? `Are you sure you want to delete the expense "${deletingExpense.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Expense"
        isLoading={isDeleting}
        onConfirm={confirmDeleteExpense}
        onCancel={() => setDeletingExpense(null)}
      />
    </div>
  );
};
