import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { AnalyticsSummary, Appointment, DateFilterPeriod } from '../../types';
import { 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users, 
  IndianRupee, 
  AlertCircle, 
  ArrowRight,
  Plus,
  RefreshCw
} from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const [period, setPeriod] = useState<DateFilterPeriod>('this_month');
  const [metrics, setMetrics] = useState<AnalyticsSummary | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      api.getAdminMetrics(period),
      api.getAdminAppointments()
    ])
      .then(([m, apts]) => {
        setMetrics(m);
        setRecentAppointments(apts.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const periods: { label: string; value: DateFilterPeriod }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'this_week' },
    { label: 'Last 7 Days', value: 'last_7_days' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Last 3 Months', value: 'last_3_months' },
    { label: 'This Year', value: 'this_year' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header & Reporting Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-5">
        <div>
          <h1 className="font-serif text-3xl text-[#244B3A] font-medium tracking-tight">
            Sanctuary Operations Console
          </h1>
          <p className="text-xs text-[#777A70] mt-0.5">
            Real-time Begumpet clinic appointment tracking, customer dossier logs, and financial telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as DateFilterPeriod)}
            className="bg-white border border-[#DDD9CE] rounded-lg px-3 py-1.5 text-xs text-[#252923] font-medium focus:outline-none focus:border-[#244B3A]"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                Period: {p.label}
              </option>
            ))}
          </select>

          <button
            onClick={loadData}
            className="p-2 bg-white border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#585B53] rounded-lg transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/admin/appointments?action=walkin"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#244B3A] hover:bg-[#1a372a] text-white text-xs font-semibold rounded-lg shadow-xs transition-smooth"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Walk-In Booking</span>
          </Link>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Revenue */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span>Realized Revenue</span>
              <IndianRupee className="w-4 h-4 text-[#244B3A]" />
            </div>
            <div className="text-2xl font-serif font-semibold text-[#244B3A] tabular-nums">
              ₹{metrics.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#777A70] flex items-center justify-between">
              <span>Avg/Booking: ₹{metrics.averageBookingValue.toLocaleString('en-IN')}</span>
              <span className="text-emerald-700 font-medium">Paid</span>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span>Total Bookings</span>
              <Calendar className="w-4 h-4 text-[#244B3A]" />
            </div>
            <div className="text-2xl font-serif font-semibold text-[#252923] tabular-nums">
              {metrics.totalBookings}
            </div>
            <div className="text-[11px] text-[#777A70]">
              <span>Completed: {metrics.completedBookings} · Pending: {metrics.pendingBookings}</span>
            </div>
          </div>

          {/* Active Customers */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span>Unique Clients</span>
              <Users className="w-4 h-4 text-[#244B3A]" />
            </div>
            <div className="text-2xl font-serif font-semibold text-[#252923] tabular-nums">
              {metrics.totalCustomers}
            </div>
            <div className="text-[11px] text-[#777A70]">
              <span>Active in selected period</span>
            </div>
          </div>

          {/* Pending Collections */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span>Pending Collections</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-serif font-semibold text-amber-800 tabular-nums">
              ₹{metrics.pendingPayments.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#777A70]">
              <span>Payable at clinic desk</span>
            </div>
          </div>

        </div>
      )}

      {/* Quick Action Drawer & Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/analytics"
          className="bg-white p-6 rounded-xl border border-[#E7E5DC] hover:border-[#244B3A]/50 transition-smooth group flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1">
            <TrendingUp className="w-6 h-6 text-[#244B3A]" />
            <h3 className="font-serif text-lg font-medium text-[#252923] group-hover:text-[#244B3A] transition-colors">
              Sales & Revenue Analytics
            </h3>
            <p className="text-xs text-[#777A70]">
              Interactive revenue area graphs, bookings trends, and category distribution across all 11 date range presets.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#244B3A]">
            <span>Open Analytics Deck</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/appointments"
          className="bg-white p-6 rounded-xl border border-[#E7E5DC] hover:border-[#244B3A]/50 transition-smooth group flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1">
            <Calendar className="w-6 h-6 text-[#244B3A]" />
            <h3 className="font-serif text-lg font-medium text-[#252923] group-hover:text-[#244B3A] transition-colors">
              Appointments Management Table
            </h3>
            <p className="text-xs text-[#777A70]">
              Search by reference ID or name, filter by service or status, confirm walk-ins, and update attendance.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#244B3A]">
            <span>Manage Appointments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/customers"
          className="bg-white p-6 rounded-xl border border-[#E7E5DC] hover:border-[#244B3A]/50 transition-smooth group flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1">
            <Users className="w-6 h-6 text-[#244B3A]" />
            <h3 className="font-serif text-lg font-medium text-[#252923] group-hover:text-[#244B3A] transition-colors">
              Customer Dossier Database
            </h3>
            <p className="text-xs text-[#777A70]">
              Inspect client lifetime spending, appointment frequency, recent treatment history, and direct contact details.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#244B3A]">
            <span>View Customers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Recent Bookings Feed */}
      <div className="bg-white rounded-xl border border-[#E7E5DC] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
          <div>
            <h2 className="font-serif text-xl font-medium text-[#252923]">
              Recent Sanctuary Bookings
            </h2>
            <p className="text-xs text-[#777A70]">
              Live appointments booked across Begumpet clinical and wellness suites.
            </p>
          </div>
          <Link
            to="/admin/appointments"
            className="text-xs font-semibold text-[#244B3A] hover:underline"
          >
            View Complete Register →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] text-[#585B53] border-b border-[#E7E5DC]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Ref ID</th>
                <th className="py-2.5 px-3 font-semibold">Client Name</th>
                <th className="py-2.5 px-3 font-semibold">Service</th>
                <th className="py-2.5 px-3 font-semibold">Date & Slot</th>
                <th className="py-2.5 px-3 font-semibold">Fee</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {recentAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-[#244B3A]">
                    {apt.bookingRef}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-[#252923]">{apt.customerName}</p>
                    <p className="text-[11px] text-[#777A70]">{apt.customerPhone}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-[#252923]">{apt.serviceName}</p>
                    <p className="text-[11px] text-[#777A70]">{apt.categoryName}</p>
                  </td>
                  <td className="py-3 px-3 tabular-nums">
                    <p className="font-medium text-[#252923]">{apt.appointmentDate}</p>
                    <p className="text-[11px] text-[#777A70]">{apt.timeSlot}</p>
                  </td>
                  <td className="py-3 px-3 tabular-nums font-semibold text-[#252923]">
                    ₹{apt.amountInr.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wider ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-800'
                          : apt.status === 'completed'
                          ? 'bg-blue-50 text-blue-800'
                          : apt.status === 'cancelled'
                          ? 'bg-red-50 text-red-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/admin/appointments?search=${apt.bookingRef}`}
                      className="text-[#244B3A] font-semibold hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
