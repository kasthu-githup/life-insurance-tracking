import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Receipt,
  Plus,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { PaymentItem, Policy } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface PaymentsViewProps {
  payments: PaymentItem[];
  policies: Policy[];
  loading: boolean;
  currencySymbol: string;
  onRefresh: () => void;
  activePayModalPayment: PaymentItem | null;
  setActivePayModalPayment: (payment: PaymentItem | null) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  policies,
  loading,
  currencySymbol,
  onRefresh,
  activePayModalPayment,
  setActivePayModalPayment,
}) => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentItem | null>(null);

  // Mark Paid Form State
  const [payFormData, setPayFormData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Net Banking',
    transactionReference: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    createExpenseRecord: true,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // New Schedule Payment Modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    policyId: policies[0]?.id?.toString() || '',
    amount: '',
    dueDate: '',
    paymentMethod: 'Net Banking',
  });

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      (p.policyName && p.policyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.transactionReference && p.transactionReference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.companyName && p.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activePayModalPayment) return;

    setSubmitting(true);
    try {
      await api.markPaymentComplete(token, activePayModalPayment.id, {
        paymentDate: payFormData.paymentDate,
        paymentMethod: payFormData.paymentMethod,
        transactionReference: payFormData.transactionReference,
        createExpenseRecord: payFormData.createExpenseRecord,
        notes: payFormData.notes,
      });

      setActivePayModalPayment(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to complete payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!scheduleFormData.policyId || !scheduleFormData.amount || !scheduleFormData.dueDate) {
      alert('Please fill in policy, amount, and due date.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createPayment(token, {
        policyId: parseInt(scheduleFormData.policyId, 10),
        amount: parseFloat(scheduleFormData.amount),
        dueDate: scheduleFormData.dueDate,
        paymentMethod: scheduleFormData.paymentMethod,
        status: 'Upcoming',
      });

      setIsScheduleOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReceipt = (pm: PaymentItem) => {
    const content = `===========================================
      LIFETRACK INSURANCE PREMIUM RECEIPT
===========================================
Receipt No: REC-${pm.id}-${Date.now().toString().slice(-6)}
Transaction Ref: ${pm.transactionReference || 'N/A'}
Date: ${pm.paymentDate || pm.dueDate}
Status: ${pm.status}

POLICY DETAILS:
Policy Name: ${pm.policyName || 'Life Insurance Policy'}
Company: ${pm.companyName || 'Insurance Provider'}
Policy Number: ${pm.policyNumber || 'N/A'}

PAYMENT SUMMARY:
Premium Amount: ${currencySymbol}${pm.amount.toLocaleString('en-IN')}
Payment Mode: ${pm.paymentMethod || 'Net Banking'}
Due Date: ${pm.dueDate}

This is a computer-generated permanent record.
===========================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${pm.policyName || 'Policy'}_${pm.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            Payment Records & History
          </h2>
          <p className="text-xs text-slate-500">
            Permanent record of all premium remittances, receipts, and scheduled transactions
          </p>
        </div>
        <button
          onClick={() => setIsScheduleOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Premium Due</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by policy or transaction reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">Payment ID</th>
                <th className="py-3.5 px-5">Policy</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Payment Date</th>
                <th className="py-3.5 px-5">Due Date</th>
                <th className="py-3.5 px-5">Payment Method</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No payment records match your filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pm) => (
                  <tr key={pm.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-500 font-medium">
                      #PAY-{pm.id.toString().padStart(4, '0')}
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-slate-900">{pm.policyName || 'Life Insurance'}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {pm.companyName} {pm.policyNumber ? `· #${pm.policyNumber}` : ''}
                      </p>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                      {currencySymbol}{pm.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {pm.paymentDate || <span className="text-slate-400 italic">Not paid yet</span>}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                      {pm.dueDate}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {pm.paymentMethod || 'Net Banking'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          pm.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : pm.status === 'Upcoming'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {pm.status === 'Paid' ? 'Paid' : pm.status === 'Upcoming' ? 'Upcoming' : 'Overdue'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {pm.status !== 'Paid' ? (
                          <button
                            onClick={() => setActivePayModalPayment(pm)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setSelectedReceipt(pm)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                              title="View Receipt"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadReceipt(pm)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                              title="Download Receipt"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {activePayModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white border-b border-slate-800">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                Record Premium Payment
              </span>
              <h3 className="text-lg font-bold mt-1">
                {activePayModalPayment.policyName || 'Life Insurance Policy'}
              </h3>
              <p className="text-xs text-slate-400">
                Amount Due: {currencySymbol}{activePayModalPayment.amount.toLocaleString('en-IN')} · Due Date: {activePayModalPayment.dueDate}
              </p>
            </div>

            <form onSubmit={handleCompletePayment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={payFormData.paymentDate}
                  onChange={(e) => setPayFormData({ ...payFormData, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Payment Method *
                </label>
                <select
                  value={payFormData.paymentMethod}
                  onChange={(e) => setPayFormData({ ...payFormData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  <option value="Net Banking">Net Banking</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Auto-Debit NACH">Auto-Debit NACH</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Transaction Reference / UTR
                </label>
                <input
                  type="text"
                  placeholder="e.g. TXN-892182093"
                  value={payFormData.transactionReference}
                  onChange={(e) => setPayFormData({ ...payFormData, transactionReference: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="create-expense-cb"
                  checked={payFormData.createExpenseRecord}
                  onChange={(e) => setPayFormData({ ...payFormData, createExpenseRecord: e.target.checked })}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="create-expense-cb" className="text-xs text-slate-700 cursor-pointer">
                  <span className="font-semibold text-slate-900 block">
                    Auto-record in Direct Expenses
                  </span>
                  Automatically logs a Direct Expense under the "Premium" category so your expense totals and charts update immediately.
                </label>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional confirmation note..."
                  value={payFormData.notes}
                  onChange={(e) => setPayFormData({ ...payFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActivePayModalPayment(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Confirm Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Due Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <h3 className="text-base font-bold text-slate-900">Schedule Premium Payment</h3>
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Policy *
                </label>
                <select
                  required
                  value={scheduleFormData.policyId}
                  onChange={(e) => {
                    const selected = policies.find((p) => p.id.toString() === e.target.value);
                    setScheduleFormData({
                      ...scheduleFormData,
                      policyId: e.target.value,
                      amount: selected ? selected.premiumAmount.toString() : scheduleFormData.amount,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id.toString()}>
                      {p.policyName} ({p.companyName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="2500"
                  value={scheduleFormData.amount}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, amount: e.target.value })}
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
                  value={scheduleFormData.dueDate}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Payment Mode
                </label>
                <select
                  value={scheduleFormData.paymentMethod}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
                >
                  <option value="Net Banking">Net Banking</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Auto-Debit NACH">Auto-Debit NACH</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal Preview */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 p-6 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Official Payment Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Ref:</span>
                <span className="font-bold text-slate-800">
                  {selectedReceipt.transactionReference || `REC-${selectedReceipt.id}-994`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Policy:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.policyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid Amount:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {currencySymbol}{selectedReceipt.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span>{selectedReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span>{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-700 font-bold">COMPLETED (PAID)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadReceipt(selectedReceipt)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
