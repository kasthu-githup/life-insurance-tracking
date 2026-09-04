import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ExpenseItem, Policy } from '../types.ts';

interface ReportsViewProps {
  currencySymbol: string;
  policies: Policy[];
  expenses: ExpenseItem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currencySymbol,
  policies,
  expenses,
}) => {
  const { token } = useAuth();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'Category' | 'Policy' | 'Month'>('Category');

  useEffect(() => {
    if (token) {
      api
        .getReports(token)
        .then((data) => setReportData(data))
        .catch((err) => console.error('Failed to load reports:', err))
        .finally(() => setLoading(false));
    }
  }, [token]);

  const directTotal = expenses
    .filter((e) => e.expenseType === 'Direct')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const indirectTotal = expenses
    .filter((e) => e.expenseType === 'Indirect')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const total = directTotal + indirectTotal;

  // Export CSV generator
  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Policy', 'Type', 'Category', 'Amount', 'Payment Method', 'Status', 'Notes'];
    const rows = expenses.map((e) => [
      e.id,
      e.expenseDate,
      `"${e.policyName || 'General'}"`,
      e.expenseType,
      `"${e.category}"`,
      e.amount,
      e.paymentMethod,
      e.paymentStatus,
      `"${e.notes || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeTrack_Insurance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Insurance Expense Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive audit reports segmented by direct/indirect, category, insurer, and month
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Insurance Outflow
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {currencySymbol}{total.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Sum of all policies & auxiliary expenditures
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-100/90 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" /> Direct Expenses
          </span>
          <p className="text-2xl font-black text-indigo-700 mt-1">
            {currencySymbol}{directTotal.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-indigo-600/80 mt-0.5">
            {total > 0 ? Math.round((directTotal / total) * 100) : 0}% of all expenditures (Premiums, Riders)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Indirect Expenses
          </span>
          <p className="text-2xl font-black text-amber-700 mt-1">
            {currencySymbol}{indirectTotal.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-amber-600/80 mt-0.5">
            {total > 0 ? Math.round((indirectTotal / total) * 100) : 0}% of all expenditures (Agent, Courier, Docs)
          </p>
        </div>
      </div>

      {/* Report Segment Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 print:border-none print:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold print:hidden">
            <button
              onClick={() => setReportType('Category')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                reportType === 'Category' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              By Category
            </button>
            <button
              onClick={() => setReportType('Policy')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                reportType === 'Policy' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              By Policy
            </button>
            <button
              onClick={() => setReportType('Month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                reportType === 'Month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              By Month
            </button>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Breakdown Tables */}
        {reportType === 'Category' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Expense Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Transactions</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.categoryBreakdown?.map((cat: any, idx: number) => {
                  const pct = total > 0 ? ((cat.total / total) * 100).toFixed(1) : '0';
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900">{cat.category}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            cat.type === 'Direct' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {cat.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{cat.count} payments</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {currencySymbol}{cat.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'Policy' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Policy Name</th>
                  <th className="py-3 px-4">Insurer</th>
                  <th className="py-3 px-4">Total Charges Recorded</th>
                  <th className="py-3 px-4">Cumulative Outflow</th>
                  <th className="py-3 px-4">% Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.policyBreakdown?.map((p: any, idx: number) => {
                  const pct = total > 0 ? ((p.total / total) * 100).toFixed(1) : '0';
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.policyName}</td>
                      <td className="py-3 px-4 text-slate-600">{p.company}</td>
                      <td className="py-3 px-4 text-slate-600">{p.count} transactions</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {currencySymbol}{p.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'Month' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Direct (Premiums)</th>
                  <th className="py-3 px-4">Indirect (Auxiliary)</th>
                  <th className="py-3 px-4">Total Expenses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.monthlyBreakdown?.map((m: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">{m.month}</td>
                    <td className="py-3 px-4 text-indigo-700 font-medium">
                      {currencySymbol}{m.direct.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-amber-700 font-medium">
                      {currencySymbol}{m.indirect.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {currencySymbol}{m.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
