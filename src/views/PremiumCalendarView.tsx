import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Plus,
} from 'lucide-react';
import { PaymentItem } from '../types.ts';

interface PremiumCalendarViewProps {
  payments: PaymentItem[];
  currencySymbol: string;
  onPayPayment: (payment: PaymentItem) => void;
}

export const PremiumCalendarView: React.FC<PremiumCalendarViewProps> = ({
  payments,
  currencySymbol,
  onPayPayment,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Default to Sep 2026
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-09-10');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Map payments by due date
  const paymentsByDate = useMemo(() => {
    const map: Record<string, PaymentItem[]> = {};
    payments.forEach((pm) => {
      const dateStr = pm.dueDate;
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(pm);
    });
    return map;
  }, [payments]);

  // Selected date agenda
  const selectedPayments = selectedDate ? paymentsByDate[selectedDate] || [] : [];

  // Monthly summary stats
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const thisMonthPayments = payments.filter((p) => p.dueDate.startsWith(currentMonthPrefix));
  const paidCount = thisMonthPayments.filter((p) => p.status === 'Paid').length;
  const upcomingCount = thisMonthPayments.filter((p) => p.status === 'Upcoming').length;
  const overdueCount = thisMonthPayments.filter((p) => p.status === 'Overdue').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Premium Calendar & Schedules
          </h2>
          <p className="text-xs text-slate-500">
            Interactive visual schedule of all upcoming, paid, and overdue premiums
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 bg-white p-2 px-3 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
          <span className="flex items-center gap-1 text-slate-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Paid
          </span>
          <span className="flex items-center gap-1 text-slate-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Upcoming
          </span>
          <span className="flex items-center gap-1 text-slate-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Overdue
          </span>
        </div>
      </div>

      {/* Month Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase">Paid Premiums</span>
            <p className="text-lg font-bold text-slate-900">{paidCount} Policies</p>
          </div>
          <span className="text-xl font-mono">🟢</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-600 uppercase">Upcoming Dues</span>
            <p className="text-lg font-bold text-slate-900">{upcomingCount} Due Soon</p>
          </div>
          <span className="text-xl font-mono">🟡</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-rose-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-600 uppercase">Overdue Premiums</span>
            <p className="text-lg font-bold text-slate-900">{overdueCount} Pending</p>
          </div>
          <span className="text-xl font-mono">🔴</span>
        </div>
      </div>

      {/* Calendar Grid & Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Box */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-2 border-b border-slate-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {/* Empty slots for month start offset */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 sm:h-24 p-1 rounded-xl bg-slate-50/50" />
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayPayments = paymentsByDate[dateString] || [];
              const isSelected = selectedDate === dateString;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDate(dateString)}
                  className={`h-20 sm:h-24 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : dayPayments.length > 0
                      ? 'border-slate-300 bg-white hover:border-indigo-300'
                      : 'border-slate-100 bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-indigo-600' : 'text-slate-800'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayPayments.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayPayments.length}
                      </span>
                    )}
                  </div>

                  {/* Badges / Dots */}
                  <div className="space-y-1 overflow-hidden">
                    {dayPayments.slice(0, 2).map((pm) => (
                      <div
                        key={pm.id}
                        className={`text-[9px] font-medium px-1 py-0.5 rounded truncate flex items-center gap-1 ${
                          pm.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : pm.status === 'Upcoming'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current" />
                        <span className="truncate">{pm.policyName || 'Premium'}</span>
                      </div>
                    ))}
                    {dayPayments.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-semibold block text-center">
                        +{dayPayments.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Agenda Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Agenda for {selectedDate || 'Selected Date'}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {selectedPayments.length} schedule(s)
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {selectedPayments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No premium payments scheduled on this date.
                </div>
              ) : (
                selectedPayments.map((pm) => (
                  <div
                    key={pm.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                            pm.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pm.status === 'Upcoming'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {pm.status === 'Paid' ? '🟢 Paid' : pm.status === 'Upcoming' ? '🟡 Upcoming' : '🔴 Overdue'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">
                          {pm.policyName || 'Life Insurance'}
                        </h4>
                        <p className="text-[11px] text-slate-500">{pm.companyName}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">
                          {currencySymbol}{pm.amount.toLocaleString('en-IN')}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {pm.paymentMethod || 'Net Banking'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Due: {pm.dueDate}</span>
                      {pm.status !== 'Paid' ? (
                        <button
                          onClick={() => onPayPayment(pm)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Payments sync directly with Cloud SQL PostgreSQL permanent storage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
