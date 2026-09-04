import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Shield, Receipt, CreditCard, ArrowRight } from 'lucide-react';
import { Policy, ExpenseItem, PaymentItem } from '../types.ts';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies: Policy[];
  expenses: ExpenseItem[];
  payments: PaymentItem[];
  onSelectPolicy: (policy: Policy) => void;
  onNavigateToTab: (tab: any) => void;
  currencySymbol: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  policies,
  expenses,
  payments,
  onSelectPolicy,
  onNavigateToTab,
  currencySymbol,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return { policies: [], expenses: [], payments: [] };
    }
    const q = query.toLowerCase();

    const matchedPolicies = policies.filter(
      (p) =>
        p.policyName.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q) ||
        p.policyNumber.toLowerCase().includes(q) ||
        p.policyType.toLowerCase().includes(q)
    );

    const matchedExpenses = expenses.filter(
      (e) =>
        e.expenseName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.expenseType.toLowerCase().includes(q) ||
        (e.policyName && e.policyName.toLowerCase().includes(q))
    );

    const matchedPayments = payments.filter(
      (pm) =>
        (pm.policyName && pm.policyName.toLowerCase().includes(q)) ||
        (pm.transactionReference && pm.transactionReference.toLowerCase().includes(q)) ||
        pm.status.toLowerCase().includes(q)
    );

    return {
      policies: matchedPolicies.slice(0, 5),
      expenses: matchedExpenses.slice(0, 5),
      payments: matchedPayments.slice(0, 5),
    };
  }, [query, policies, expenses, payments]);

  if (!isOpen) return null;

  const totalMatches =
    results.policies.length + results.expenses.length + results.payments.length;

  return (
    <div
      id="global-search-modal"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search policies, expenses, payments (e.g. 'LIC', 'Premium', 'HDFC')..."
            className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd
            onClick={onClose}
            className="px-2 py-0.5 text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded cursor-pointer hover:bg-slate-200"
          >
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type to search policies, expenses, and payments across your records
            </div>
          ) : totalMatches === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No results found for <span className="font-semibold text-slate-700">"{query}"</span>
            </div>
          ) : (
            <>
              {/* Policies Results */}
              {results.policies.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      Policies ({results.policies.length})
                    </span>
                    <button
                      onClick={() => {
                        onNavigateToTab('policies');
                        onClose();
                      }}
                      className="text-indigo-600 hover:underline flex items-center gap-1 lowercase font-semibold"
                    >
                      all policies <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.policies.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectPolicy(p);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{p.policyName}</p>
                          <p className="text-[11px] text-slate-500">
                            {p.companyName} · {p.policyNumber} · {p.policyType}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-indigo-600">
                            {currencySymbol}
                            {p.premiumAmount.toLocaleString('en-IN')}/{p.premiumFrequency}
                          </p>
                          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expenses Results */}
              {results.expenses.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                      Expenses ({results.expenses.length})
                    </span>
                    <button
                      onClick={() => {
                        onNavigateToTab('expenses');
                        onClose();
                      }}
                      className="text-emerald-600 hover:underline flex items-center gap-1 lowercase"
                    >
                      all expenses <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.expenses.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => {
                          onNavigateToTab('expenses');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{e.expenseName}</p>
                          <p className="text-[11px] text-slate-500">
                            {e.category} · {e.expenseType} · {e.expenseDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900">
                            {currencySymbol}
                            {e.amount.toLocaleString('en-IN')}
                          </p>
                          <span
                            className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              e.expenseType === 'Direct'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {e.expenseType}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payments Results */}
              {results.payments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                      Payments ({results.payments.length})
                    </span>
                    <button
                      onClick={() => {
                        onNavigateToTab('payments');
                        onClose();
                      }}
                      className="text-indigo-600 hover:underline flex items-center gap-1 lowercase"
                    >
                      all payments <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {results.payments.map((pm) => (
                      <div
                        key={pm.id}
                        onClick={() => {
                          onNavigateToTab('payments');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            {pm.policyName || 'Policy Premium'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Due: {pm.dueDate} {pm.paymentDate ? `· Paid: ${pm.paymentDate}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900">
                            {currencySymbol}
                            {pm.amount.toLocaleString('en-IN')}
                          </p>
                          <span
                            className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              pm.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : pm.status === 'Upcoming'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {pm.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
