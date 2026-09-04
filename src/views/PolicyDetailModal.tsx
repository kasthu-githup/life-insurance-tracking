import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  CreditCard,
  Receipt,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Policy, ExpenseItem, PaymentItem, DocumentItem, BeneficiaryItem } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';

interface PolicyDetailModalProps {
  policy: Policy | null;
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onPolicyUpdated: () => void;
  onOpenAddExpenseWithPolicy?: (policyId: number) => void;
}

export const PolicyDetailModal: React.FC<PolicyDetailModalProps> = ({
  policy,
  isOpen,
  onClose,
  currencySymbol,
  onPolicyUpdated,
  onOpenAddExpenseWithPolicy,
}) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses' | 'documents' | 'nominees'>('payments');
  const [details, setDetails] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (isOpen && policy && token) {
      setLoading(true);
      setDeleteError('');
      api
        .getPolicyById(token, policy.id)
        .then((data) => setDetails(data))
        .catch((err) => console.error('Failed to load full policy:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, policy, token]);

  if (!isOpen || !policy) return null;

  const current = details || policy;

  const confirmDeletePolicy = async () => {
    if (!token) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await api.deletePolicy(token, current.id);
      setShowDeleteConfirm(false);
      onPolicyUpdated();
      onClose();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete policy');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs text-slate-200">
                  {current.policyType}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  {current.status}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
                {current.policyName}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {current.companyName} · Policy #{current.policyNumber}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="policy-detail-delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white text-xs transition-colors cursor-pointer"
                title="Delete Policy"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Premium Amount</span>
              <p className="text-base font-bold text-white mt-0.5">
                {currencySymbol}
                {current.premiumAmount.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-slate-400">/ {current.premiumFrequency}</span>
              </p>
            </div>
            <div>
              <span className="text-slate-400">Sum Assured</span>
              <p className="text-base font-bold text-white mt-0.5">
                {currencySymbol}{(current.sumAssured || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Next Premium Due</span>
              <p className="text-sm font-bold text-white mt-0.5">{current.nextDueDate}</p>
            </div>
            <div>
              <span className="text-slate-400">Policy Holder</span>
              <p className="text-sm font-bold text-white mt-0.5">{current.policyHolder}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 gap-2 sm:gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'payments'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment History ({current.payments?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'expenses'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Expenses ({current.expenses?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'documents'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documents ({current.documents?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('nominees')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'nominees'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Nominee Details</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[420px] overflow-y-auto">
          {/* Tab 1: Payments */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">
                  All premium payment transactions and scheduled dues.
                </p>
              </div>
              {!current.payments || current.payments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No payment records found for this policy.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {current.payments.map((pm) => (
                    <div
                      key={pm.id}
                      className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              pm.status === 'Paid'
                                ? 'text-emerald-700'
                                : pm.status === 'Upcoming'
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {pm.status === 'Paid' ? 'Paid Premium' : 'Upcoming Premium'}
                          </span>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {pm.paymentMethod || 'Net Banking'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Due: {pm.dueDate} {pm.paymentDate ? `· Paid: ${pm.paymentDate}` : ''}{' '}
                          {pm.transactionReference ? `· Ref: ${pm.transactionReference}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">
                          {currencySymbol}
                          {pm.amount.toLocaleString('en-IN')}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {pm.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Expenses */}
          {activeTab === 'expenses' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">
                  Direct and indirect costs attributed to this policy.
                </p>
                {onOpenAddExpenseWithPolicy && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAddExpenseWithPolicy(current.id);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    + Add Expense
                  </button>
                )}
              </div>
              {!current.expenses || current.expenses.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No expenses linked to this policy.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {current.expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{exp.expenseName}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              exp.expenseType === 'Direct'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {exp.expenseType} ({exp.category})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Date: {exp.expenseDate} · Paid via {exp.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">
                          {currencySymbol}
                          {exp.amount.toLocaleString('en-IN')}
                        </span>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          {exp.paymentStatus}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Stored insurance documents, bonds, receipts, and health reports.
              </p>
              {!current.documents || current.documents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No documents uploaded for this policy yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {current.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 hover:border-blue-300 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {doc.documentName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {doc.documentType} · {doc.fileSize}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Uploaded: {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Nominees */}
          {activeTab === 'nominees' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {current.nomineeName ? current.nomineeName.charAt(0) : 'N'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {current.nomineeName || 'Primary Beneficiary'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Relationship: <span className="font-semibold text-blue-700">{current.nomineeRelation || 'Nominee'}</span> · Share: 100%
                  </p>
                </div>
              </div>

              {current.beneficiaries && current.beneficiaries.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Registered Beneficiaries
                  </h5>
                  {current.beneficiaries.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{b.name}</span>
                        <span className="text-slate-500 ml-2">({b.relationship})</span>
                        {b.phone && <p className="text-[11px] text-slate-400">Phone: {b.phone}</p>}
                      </div>
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {b.sharePercentage}% Share
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {current.notes && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">Notes & Details:</span>
                  <p className="text-slate-600 leading-relaxed">{current.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Policy"
        message={`Are you sure you want to delete "${current.policyName}"? This will permanently remove this policy, its scheduled payments, linked expenses, reminders, and documents.`}
        confirmText="Delete Policy"
        isLoading={isDeleting}
        onConfirm={confirmDeletePolicy}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
