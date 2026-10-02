import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../../api/client';
import { AnalyticsSummary, DateFilterPeriod } from '../../types';
import { 
  TrendingUp, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  Users, 
  RefreshCw,
  Filter
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<DateFilterPeriod>('this_year');
  const [customStart, setCustomStart] = useState<string>('2026-01-01');
  const [customEnd, setCustomEnd] = useState<string>('2026-10-02');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAnalytics = () => {
    setIsLoading(true);
    api.getAdminAnalytics(period, period === 'custom' ? customStart : undefined, period === 'custom' ? customEnd : undefined)
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const allDateFilters: { id: DateFilterPeriod; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'this_week', label: 'This Week' },
    { id: 'last_7_days', label: 'Last 7 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'last_3_months', label: 'Last 3 Months' },
    { id: 'last_6_months', label: 'Last 6 Months' },
    { id: 'this_year', label: 'This Year' },
    { id: 'last_year', label: 'Last Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const PIE_COLORS = ['#244B3A', '#3C7058', '#5E947A', '#87B59F', '#B3D3C3', '#668073'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-5">
        <div>
          <h1 className="font-serif text-3xl text-[#244B3A] font-medium tracking-tight">
            Sales & Revenue Analytics
          </h1>
          <p className="text-xs text-[#777A70] mt-0.5">
            Database-aggregated performance across all six clinical & transformation pillars.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#585B53] text-xs font-semibold rounded-lg transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Date Filter Tabs Strip (Zero-Pill Discipline, Single-Line Controls) */}
      <div className="bg-white p-3 rounded-xl border border-[#E7E5DC] space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-semibold text-[#777A70] shrink-0 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Date Range:
          </span>
          {allDateFilters.map((df) => (
            <button
              key={df.id}
              onClick={() => setPeriod(df.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-smooth shrink-0 ${
                period === df.id
                  ? 'bg-[#244B3A] text-white shadow-xs font-semibold'
                  : 'text-[#585B53] hover:text-[#252923] hover:bg-[#F0EEE5]'
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>

        {/* Custom Range Inputs */}
        {period === 'custom' && (
          <div className="pt-2 border-t border-[#F0EEE5] flex flex-wrap items-center gap-3 text-xs">
            <span className="text-[#585B53] font-medium">Select Range:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-2.5 py-1 text-xs text-[#252923]"
            />
            <span className="text-[#777A70]">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-2.5 py-1 text-xs text-[#252923]"
            />
            <button
              onClick={fetchAnalytics}
              className="px-3 py-1 bg-[#244B3A] text-white rounded-lg font-medium hover:bg-[#1a372a]"
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>

      {/* Metrics Summary Strip */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="bg-white p-4 rounded-xl border border-[#E7E5DC]">
            <span className="text-[11px] text-[#777A70] uppercase font-semibold">Total Revenue</span>
            <p className="text-xl font-serif font-semibold text-[#244B3A] tabular-nums mt-1">
              ₹{analytics.totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E7E5DC]">
            <span className="text-[11px] text-[#777A70] uppercase font-semibold">Total Bookings</span>
            <p className="text-xl font-serif font-semibold text-[#252923] tabular-nums mt-1">
              {analytics.totalBookings}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E7E5DC]">
            <span className="text-[11px] text-[#777A70] uppercase font-semibold">Completed Visits</span>
            <p className="text-xl font-serif font-semibold text-emerald-800 tabular-nums mt-1">
              {analytics.completedBookings}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E7E5DC]">
            <span className="text-[11px] text-[#777A70] uppercase font-semibold">Avg Booking Value</span>
            <p className="text-xl font-serif font-semibold text-[#244B3A] tabular-nums mt-1">
              ₹{analytics.averageBookingValue.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E7E5DC]">
            <span className="text-[11px] text-[#777A70] uppercase font-semibold">Paid Collections</span>
            <p className="text-xl font-serif font-semibold text-[#244B3A] tabular-nums mt-1">
              ₹{analytics.paidPayments.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E7E5DC]">
            <span className="text-[11px] text-[#777A70] uppercase font-semibold">Pending Balance</span>
            <p className="text-xl font-serif font-semibold text-amber-800 tabular-nums mt-1">
              ₹{analytics.pendingPayments.toLocaleString('en-IN')}
            </p>
          </div>

        </div>
      )}

      {/* Primary Chart 1: Revenue Over Time (Area Chart) */}
      <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
          <div>
            <h2 className="font-serif text-xl font-medium text-[#244B3A]">
              Revenue Over Time (₹ INR)
            </h2>
            <p className="text-xs text-[#777A70]">
              Chronological revenue progression for the selected timeframe.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#244B3A] bg-[#F0EEE5] px-2.5 py-1 rounded-md capitalize">
            {period.replace('_', ' ')}
          </span>
        </div>

        {analytics && analytics.revenueByPeriod.length > 0 ? (
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueByPeriod}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#244B3A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#244B3A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5DC" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11, fill: '#777A70' }} 
                  stroke="#DDD9CE" 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#777A70' }} 
                  stroke="#DDD9CE"
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#DDD9CE', borderRadius: 8, fontSize: 12 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#244B3A" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-60 flex items-center justify-center text-xs text-[#777A70]">
            No financial transactions recorded for this specific date range.
          </div>
        )}
      </div>

      {/* Secondary Charts: Bookings Trend & Revenue by Discipline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Bookings Trend Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E7E5DC] space-y-4">
          <div className="border-b border-[#F0EEE5] pb-3">
            <h2 className="font-serif text-xl font-medium text-[#252923]">
              Consultation Volume Trend
            </h2>
            <p className="text-xs text-[#777A70]">
              Number of client appointments scheduled per time interval.
            </p>
          </div>

          {analytics && analytics.revenueByPeriod.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.revenueByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5DC" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#777A70' }} stroke="#DDD9CE" />
                  <YAxis tick={{ fontSize: 11, fill: '#777A70' }} stroke="#DDD9CE" />
                  <Tooltip 
                    formatter={(val: any) => [val, 'Bookings']}
                    contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#DDD9CE', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="bookings" fill="#3C7058" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-xs text-[#777A70]">
              No volume data for this filter.
            </div>
          )}
        </div>

        {/* Revenue by Discipline (Donut / Category Chart) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E7E5DC] space-y-4">
          <div className="border-b border-[#F0EEE5] pb-3">
            <h2 className="font-serif text-xl font-medium text-[#252923]">
              Revenue by Discipline
            </h2>
            <p className="text-xs text-[#777A70]">
              Distribution of sales across the six core pillars.
            </p>
          </div>

          {analytics && analytics.revenueByCategory.length > 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.revenueByCategory}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {analytics.revenueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#DDD9CE', borderRadius: 8, fontSize: 11 }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-xs text-[#777A70]">
              No category metrics available.
            </div>
          )}
        </div>

      </div>

      {/* Detailed Revenue Table */}
      <div className="bg-white rounded-xl border border-[#E7E5DC] p-6 space-y-4">
        <h3 className="font-serif text-lg font-medium text-[#252923]">
          Discipline Breakdown Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] text-[#585B53] border-b border-[#E7E5DC]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Discipline Pillar</th>
                <th className="py-2.5 px-3 font-semibold text-right">Appointments</th>
                <th className="py-2.5 px-3 font-semibold text-right">Revenue (₹ INR)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Avg Revenue/Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {analytics?.revenueByCategory.map((cat, idx) => (
                <tr key={idx} className="hover:bg-[#FAF9F5]">
                  <td className="py-3 px-3 font-medium text-[#252923]">{cat.category}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{cat.bookings}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-[#244B3A]">
                    ₹{cat.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[#777A70]">
                    ₹{cat.bookings > 0 ? Math.round(cat.revenue / cat.bookings).toLocaleString('en-IN') : 0}
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
