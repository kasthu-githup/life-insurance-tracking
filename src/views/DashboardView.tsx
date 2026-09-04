import React from 'react';
import {
  Wallet,
  CalendarDays,
  Clock,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { DashboardData, Policy, PaymentItem } from '../types.ts';

interface DashboardViewProps {
  data: DashboardData | null;
  loading: boolean;
  currencySymbol: string;
  onSelectPolicy: (policy: Policy) => void;
  onOpenAddPolicy: () => void;
  onOpenAddExpense: () => void;
  onNavigateToTab: (tab: any) => void;
  onPayPayment: (payment: PaymentItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  loading,
  currencySymbol,
  onSelectPolicy,
  onOpenAddPolicy,
  onOpenAddExpense,
  onNavigateToTab,
  onPayPayment,
}) => {
  if (loading || !data) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-100 rounded-2xl" />
          <div className="h-80 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { summary, directVsIndirect, monthlyChart, policyWiseExpenses, upcomingPayments, activePolicies } = data;

  // Max value for monthly chart scaling
  const maxMonthly = Math.max(...monthlyChart.map((m) => m.total), 5000);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Summary Cards (6 Cards as requested) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Expenses
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {currencySymbol}
            {summary.totalExpenses.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400">Direct + Indirect</span>
        </div>

        {/* Paid This Month */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CalendarDays className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Paid This Month
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {currencySymbol}
            {summary.paidThisMonth.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> Up to date
          </span>
        </div>

        {/* Upcoming Premiums */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Upcoming Due
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {currencySymbol}
            {summary.upcomingPremiumsAmount.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-amber-600 font-medium">
            {summary.upcomingPremiumsCount} premiums scheduled
          </span>
        </div>

        {/* Overdue Payments */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-sm transition-all">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Overdue
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {currencySymbol}
            {summary.overdueAmount.toLocaleString('en-IN')}
          </p>
          <span
            className={`text-[10px] font-medium ${
              summary.overdueCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'
            }`}
          >
            {summary.overdueCount === 0 ? '0 overdue' : `${summary.overdueCount} pending action`}
          </span>
        </div>

        {/* Active Policies */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Policies
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {summary.activePoliciesCount}
          </p>
          <span className="text-[10px] text-slate-400">
            Out of {summary.totalPoliciesCount} total
          </span>
        </div>

        {/* Annual Insurance Cost */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all">
          <div className="w-8 h-8 rounded-xl bg-indigo-100/60 text-indigo-700 flex items-center justify-center mb-3">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Annual Cost
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {currencySymbol}
            {summary.annualInsuranceCost.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400">Projected yearly</span>
        </div>
      </div>

      {/* 2. Charts Section: Monthly Expense Bar Chart & Direct vs Indirect Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Expense Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Monthly Expense Overview</h2>
              <p className="text-xs text-slate-400">Direct premiums vs. indirect maintenance expenses</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Direct
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-200" /> Indirect
              </span>
            </div>
          </div>

          {/* SVG Bar Visualizer */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
            {monthlyChart.map((item, idx) => {
              const directHeight = (item.direct / maxMonthly) * 160;
              const indirectHeight = (item.indirect / maxMonthly) * 160;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 z-10 bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap">
                    {item.label}: {currencySymbol}{item.total.toLocaleString('en-IN')}
                  </div>

                  {/* Stacked Bars */}
                  <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-44">
                    <div
                      style={{ height: `${indirectHeight}px` }}
                      className="w-full bg-indigo-200 transition-all duration-500"
                    />
                    <div
                      style={{ height: `${directHeight}px` }}
                      className="w-full bg-indigo-600 transition-all duration-500"
                    />
                  </div>

                  <span className="text-[11px] font-medium text-slate-500 mt-2">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>6-Month Tracked History</span>
            <button
              onClick={() => onNavigateToTab('reports')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
            >
              Full report <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Direct vs Indirect Ratio & Policy Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Direct vs Indirect Expenses</h2>
            <p className="text-xs text-slate-400 mb-4">Cost breakdown proportion</p>

            {/* Split Visual Bar */}
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex mb-3">
              <div
                style={{ width: `${directVsIndirect.directPercentage}%` }}
                className="bg-indigo-600 h-full"
                title={`Direct: ${directVsIndirect.directPercentage}%`}
              />
              <div
                style={{ width: `${directVsIndirect.indirectPercentage}%` }}
                className="bg-indigo-300 h-full"
                title={`Indirect: ${directVsIndirect.indirectPercentage}%`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100">
                <p className="text-[11px] font-bold text-indigo-700 uppercase">Direct</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {currencySymbol}
                  {directVsIndirect.directTotal.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-indigo-600 font-medium">
                  {directVsIndirect.directPercentage}% of total
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-[11px] font-bold text-slate-600 uppercase">Indirect</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {currencySymbol}
                  {directVsIndirect.indirectTotal.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {directVsIndirect.indirectPercentage}% of total
                </p>
              </div>
            </div>

            {/* Policy-wise expense distribution */}
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              Policy-wise Expenses
            </h3>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {policyWiseExpenses.length === 0 ? (
                <p className="text-xs text-slate-400">No expenses recorded yet.</p>
              ) : (
                policyWiseExpenses.map((p, idx) => {
                  const percent = summary.totalExpenses > 0
                    ? Math.round((p.amount / summary.totalExpenses) * 100)
                    : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700 truncate max-w-[140px]">{p.name}</span>
                        <span className="text-slate-900 font-semibold">
                          {currencySymbol}{p.amount.toLocaleString('en-IN')} ({percent}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-indigo-600 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onOpenAddExpense}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              + Add Expense Record
            </button>
            <button
              onClick={() => onNavigateToTab('expenses')}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              View all
            </button>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Payments Table (As given in prompt Section 3) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Upcoming Payments Schedule</h2>
            <p className="text-xs text-slate-400">
              Immediate premium dues requiring attention
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab('calendar')}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              Premium Calendar
            </button>
            <button
              onClick={() => onNavigateToTab('payments')}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold transition-colors"
            >
              Payment History
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Policy</th>
                <th className="py-3 px-5">Premium</th>
                <th className="py-3 px-5">Due Date</th>
                <th className="py-3 px-5">Payment Method</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No scheduled payments found.
                  </td>
                </tr>
              ) : (
                upcomingPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5 font-semibold text-slate-900">
                      <div>{payment.policyName || 'Life Insurance Policy'}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {payment.companyName || payment.policyNumber || 'Active Plan'}
                      </div>
                    </td>
                    <td className="py-3 px-5 font-bold text-slate-900">
                      {currencySymbol}
                      {payment.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-5 text-slate-600 font-medium">
                      {payment.dueDate}
                    </td>
                    <td className="py-3 px-5 text-slate-500">
                      {payment.paymentMethod || 'Net Banking'}
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          payment.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : payment.status === 'Upcoming'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {payment.status === 'Paid' ? '🟢 Paid' : payment.status === 'Upcoming' ? '🟡 Upcoming' : '🔴 Overdue'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      {payment.status !== 'Paid' ? (
                        <button
                          onClick={() => onPayPayment(payment)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Active Policies Quick Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Your Active Policies</h2>
            <p className="text-xs text-slate-400">Click any policy to view full payment history and documents</p>
          </div>
          <button
            onClick={onOpenAddPolicy}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            + Add New Policy
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePolicies.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPolicy(p)}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs cursor-pointer transition-all bg-gradient-to-b from-white to-slate-50/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                    {p.policyType}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{p.policyName}</h4>
                  <p className="text-xs text-slate-500">{p.companyName}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400">Premium</span>
                  <p className="font-bold text-slate-800">
                    {currencySymbol}{p.premiumAmount.toLocaleString('en-IN')} / {p.premiumFrequency}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Sum Assured</span>
                  <p className="font-bold text-slate-800">
                    {currencySymbol}{(p.sumAssured || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
