import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { AnalyticsSummary, Appointment, DateFilterPeriod, Staff } from '../../types';
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
  RefreshCw,
  XCircle,
  UserCheck,
  Sparkles,
  Filter,
  Eye,
  CreditCard,
  Building2,
  CalendarCheck
} from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const [period, setPeriod] = useState<DateFilterPeriod>('this_month');
  const [customStart, setCustomStart] = useState<string>('2026-01-01');
  const [customEnd, setCustomEnd] = useState<string>('2026-10-02');
  const [metrics, setMetrics] = useState<AnalyticsSummary | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'recent' | 'upcoming' | 'pending_payment'>('recent');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    const start = period === 'custom' ? customStart : undefined;
    const end = period === 'custom' ? customEnd : undefined;

    Promise.all([
      api.getAdminMetrics(period, start, end),
      api.getAdminAppointments()
    ])
      .then(([m, apts]) => {
        setMetrics(m);
        setAppointments(apts);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
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

  const PIE_COLORS = ['#214D3B', '#2E6B50', '#4A8C6F', '#7DB89F', '#B4D6C6', '#D4AF37'];
  const STATUS_COLORS: Record<string, string> = {
    'confirmed': '#2E6B50',
    'completed': '#214D3B',
    'pending': '#D4AF37',
    'cancelled': '#DC2626',
    'no-show': '#6B7280',
  };

  // Appointments partitions
  const todayStr = '2026-10-02';
  const recentList = appointments.slice(0, 7);
  const upcomingList = appointments.filter(a => a.appointmentDate >= todayStr && a.status !== 'cancelled').slice(0, 7);
  const pendingPaymentsList = appointments.filter(a => a.paymentStatus === 'pending' && a.status !== 'cancelled').slice(0, 7);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Top Header & Reporting Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-5">
        <div>
          <h1 className="font-serif text-3xl text-[#214D3B] font-bold tracking-tight">
            Sanctuary Operations Console
          </h1>
          <p className="text-xs text-[#585B53] mt-0.5">
            Real-time Begumpet clinical appointment tracking, financial telemetry, and practitioner operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#585B53] rounded-lg transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/admin/appointments?action=walkin"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#214D3B] hover:bg-[#1a3e2f] text-white text-xs font-semibold rounded-lg shadow-xs transition-smooth"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>+ Walk-In / Phone Booking</span>
          </Link>
        </div>
      </div>

      {/* Global Date Filter Strip (All 11 Presets) */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-[#214D3B] shrink-0 mr-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" /> Period:
          </span>
          {allDateFilters.map((df) => (
            <button
              key={df.id}
              onClick={() => setPeriod(df.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-smooth shrink-0 ${
                period === df.id
                  ? 'bg-[#214D3B] text-white shadow-xs font-semibold'
                  : 'bg-[#FAF9F5] text-[#585B53] hover:bg-[#F0EEE5] hover:text-[#214D3B] border border-[#E7E5DC]'
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#F0EEE5] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#777A70] font-medium">From:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#777A70] font-medium">To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs"
              />
            </div>
            <button
              onClick={loadData}
              className="px-3.5 py-1.5 bg-[#214D3B] text-white font-semibold rounded-lg text-xs shadow-xs"
            >
              Apply Custom Range
            </button>
          </div>
        )}
      </div>

      {/* 8 Required KPI Cards with Percentage Comparisons */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Total Appointments */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span className="font-medium">Total Appointments</span>
              <Calendar className="w-4 h-4 text-[#214D3B]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#252923] tabular-nums">
              {metrics.totalBookings}
            </div>
            <div className="text-[11px] flex items-center justify-between">
              <span className={metrics.comparison.bookingsChangePct >= 0 ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                {metrics.comparison.bookingsChangePct >= 0 ? '↑ +' : '↓ '}
                {Math.abs(metrics.comparison.bookingsChangePct)}% vs prev
              </span>
              <span className="text-[#777A70] text-[10px]">in period</span>
            </div>
          </div>

          {/* 2. Confirmed Appointments */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span className="font-medium">Confirmed</span>
              <CalendarCheck className="w-4 h-4 text-[#2E6B50]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#2E6B50] tabular-nums">
              {metrics.confirmedBookings}
            </div>
            <div className="text-[11px] text-[#585B53]">
              <span>Ready & scheduled on calendar</span>
            </div>
          </div>

          {/* 3. Completed Appointments */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span className="font-medium">Completed Treatments</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-serif font-bold text-emerald-800 tabular-nums">
              {metrics.completedBookings}
            </div>
            <div className="text-[11px] flex items-center justify-between">
              <span className={metrics.comparison.completedChangePct >= 0 ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                {metrics.comparison.completedChangePct >= 0 ? '↑ +' : '↓ '}
                {Math.abs(metrics.comparison.completedChangePct)}% vs prev
              </span>
              <span className="text-[#777A70] text-[10px]">delivered</span>
            </div>
          </div>

          {/* 4. Cancelled Appointments */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span className="font-medium">Cancelled / No-Show</span>
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-serif font-bold text-red-700 tabular-nums">
              {metrics.cancelledBookings}
            </div>
            <div className="text-[11px] text-[#585B53]">
              <span>Cancelled or slot released</span>
            </div>
          </div>

          {/* 5. Total Revenue */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span className="font-medium">Total Realized Revenue</span>
              <IndianRupee className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#214D3B] tabular-nums">
              ₹{metrics.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] flex items-center justify-between">
              <span className={metrics.comparison.revenueChangePct >= 0 ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                {metrics.comparison.revenueChangePct >= 0 ? '↑ +' : '↓ '}
                {Math.abs(metrics.comparison.revenueChangePct)}% vs prev
              </span>
              <span className="text-[#777A70] text-[10px]">Avg: ₹{metrics.averageBookingValue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* 6. Pending Collections */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span className="font-medium">Pending Collections</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-serif font-bold text-amber-800 tabular-nums">
              ₹{metrics.pendingPayments.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#585B53]">
              <span>Payable at clinic desk reception</span>
            </div>
          </div>

          {/* 7. Total Registered Customers */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span className="font-medium">Registered Clients</span>
              <Users className="w-4 h-4 text-[#214D3B]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#252923] tabular-nums">
              {metrics.totalCustomers}
            </div>
            <div className="text-[11px] flex items-center justify-between">
              <span className="text-emerald-700 font-semibold">
                Active clientele
              </span>
              <span className="text-[#777A70] text-[10px]">in database</span>
            </div>
          </div>

          {/* 8. Active Staff Members */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span className="font-medium">Active Specialists</span>
              <UserCheck className="w-4 h-4 text-[#214D3B]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#214D3B] tabular-nums">
              {metrics.activeStaffCount}
            </div>
            <div className="text-[11px] text-[#585B53]">
              <span>Across all 6 wellness pillars</span>
            </div>
          </div>

        </div>
      )}

      {/* Main Charts Grid */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Trend Area Chart */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                  Revenue Realization Trend
                </h3>
                <p className="text-xs text-[#777A70]">
                  Realized collections in INR over selected date period.
                </p>
              </div>
              <span className="text-xs font-serif font-bold text-[#214D3B]">
                ₹{metrics.totalRevenue.toLocaleString('en-IN')} Total
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.revenueByPeriod}>
                  <defs>
                    <linearGradient id="overviewRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#214D3B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#214D3B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE5" vertical={false} />
                  <XAxis dataKey="label" stroke="#777A70" fontSize={10} tickLine={false} />
                  <YAxis 
                    stroke="#777A70" 
                    fontSize={10} 
                    tickLine={false} 
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip 
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Realized Revenue']}
                    contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#DDD9CE', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#214D3B" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#overviewRevGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Appointment Volume Trend Bar Chart */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                  Appointment Volume Velocity
                </h3>
                <p className="text-xs text-[#777A70]">
                  Booking frequency per time segment.
                </p>
              </div>
              <span className="text-xs font-bold text-[#252923]">
                {metrics.totalBookings} Total Bookings
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.revenueByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE5" vertical={false} />
                  <XAxis dataKey="label" stroke="#777A70" fontSize={10} tickLine={false} />
                  <YAxis stroke="#777A70" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    formatter={(val: any) => [`${val} Bookings`, 'Session Count']}
                    contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#DDD9CE', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="bookings" fill="#2E6B50" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Breakdown by Service Pillar (Donut) */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] shadow-xs space-y-4">
            <div className="border-b border-[#F0EEE5] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                Revenue by Service Pillar
              </h3>
              <p className="text-xs text-[#777A70]">
                Proportional contribution from each wellness discipline.
              </p>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.revenueByCategory}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {metrics.revenueByCategory.map((entry, index) => (
                      <Cell key={`pillar-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#DDD9CE', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0EEE5]">
              {metrics.revenueByCategory.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span className="text-[#252923] font-medium truncate">{cat.category}</span>
                  </div>
                  <span className="font-bold text-[#214D3B] tabular-nums shrink-0 ml-1">
                    ₹{cat.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Status Distribution */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] shadow-xs space-y-4">
            <div className="border-b border-[#F0EEE5] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                Appointment Status Distribution
              </h3>
              <p className="text-xs text-[#777A70]">
                Breakdown of confirmed, pending, completed, and cancelled treatments.
              </p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.statusDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE5" horizontal={false} />
                  <XAxis type="number" stroke="#777A70" fontSize={10} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="status" stroke="#777A70" fontSize={11} tickLine={false} width={80} />
                  <Tooltip 
                    formatter={(val: any) => [`${val} Bookings`, 'Count']}
                    contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#DDD9CE', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {metrics.statusDistribution.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={STATUS_COLORS[entry.status] || '#214D3B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F0EEE5] text-xs">
              {metrics.statusDistribution.map((st, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[st.status] || '#214D3B' }} />
                  <span className="capitalize text-[#252923] font-medium">{st.status}:</span>
                  <span className="font-bold text-[#214D3B]">{st.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Top Performing Staff & Most-Booked Services Grid */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top-performing Staff Members */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                  Top-Performing Specialists
                </h3>
                <p className="text-xs text-[#777A70]">
                  Highest revenue and session fulfillment in selected period.
                </p>
              </div>
              <Link to="/admin/staff" className="text-xs font-semibold text-[#214D3B] hover:underline">
                Manage All Staff →
              </Link>
            </div>

            <div className="space-y-3">
              {metrics.topStaff.length === 0 ? (
                <p className="text-xs text-[#777A70] py-6 text-center">No staff performance data in period.</p>
              ) : (
                metrics.topStaff.map((staff, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#FAF9F5] border border-[#E7E5DC]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#214D3B] text-white flex items-center justify-center font-serif font-bold text-xs shrink-0">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-[#252923]">{staff.name}</h4>
                        <p className="text-[11px] text-[#2E6B50] font-medium">{staff.roleTitle}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-serif font-bold text-xs text-[#214D3B] block">
                        ₹{staff.revenue.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#777A70]">
                        {staff.bookings} {staff.bookings === 1 ? 'treatment' : 'treatments'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Most-Booked Services */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                  Most-Booked Wellness Protocols
                </h3>
                <p className="text-xs text-[#777A70]">
                  Popular client treatments across Begumpet suites.
                </p>
              </div>
              <Link to="/admin/services" className="text-xs font-semibold text-[#214D3B] hover:underline">
                Service Catalogue →
              </Link>
            </div>

            <div className="space-y-3">
              {metrics.topServices.length === 0 ? (
                <p className="text-xs text-[#777A70] py-6 text-center">No service booking data in period.</p>
              ) : (
                metrics.topServices.map((srv, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#FAF9F5] border border-[#E7E5DC]">
                    <div>
                      <h4 className="font-semibold text-xs text-[#252923]">{srv.name}</h4>
                      <p className="text-[11px] text-[#777A70]">{srv.category}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-serif font-bold text-xs text-[#214D3B] block">
                        ₹{srv.revenue.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-800 font-medium">
                        {srv.bookings} bookings
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* Appointments Management Quick Tabs: Recent, Upcoming, Pending Collections */}
      <div className="bg-white rounded-xl border border-[#E7E5DC] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EEE5] pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'recent'
                  ? 'bg-[#214D3B] text-white shadow-xs'
                  : 'text-[#585B53] hover:bg-[#F0EEE5]'
              }`}
            >
              Recent Appointments ({recentList.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-[#214D3B] text-white shadow-xs'
                  : 'text-[#585B53] hover:bg-[#F0EEE5]'
              }`}
            >
              Upcoming Appointments ({upcomingList.length})
            </button>
            <button
              onClick={() => setActiveTab('pending_payment')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'pending_payment'
                  ? 'bg-[#214D3B] text-white shadow-xs'
                  : 'text-[#585B53] hover:bg-[#F0EEE5]'
              }`}
            >
              Pending Collections ({pendingPaymentsList.length})
            </button>
          </div>

          <Link
            to="/admin/appointments"
            className="text-xs font-semibold text-[#214D3B] hover:underline"
          >
            Open Full Appointments Register →
          </Link>
        </div>

        {/* Tab Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] text-[#585B53] border-b border-[#E7E5DC]">
              <tr>
                <th className="py-2.5 px-3.5 font-semibold">Ref ID</th>
                <th className="py-2.5 px-3.5 font-semibold">Client Name & Phone</th>
                <th className="py-2.5 px-3.5 font-semibold">Service Protocol</th>
                <th className="py-2.5 px-3.5 font-semibold">Specialist</th>
                <th className="py-2.5 px-3.5 font-semibold">Date & Time</th>
                <th className="py-2.5 px-3.5 font-semibold">Amount</th>
                <th className="py-2.5 px-3.5 font-semibold">Status</th>
                <th className="py-2.5 px-3.5 font-semibold text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {(activeTab === 'recent'
                ? recentList
                : activeTab === 'upcoming'
                ? upcomingList
                : pendingPaymentsList
              ).map((apt) => (
                <tr key={apt.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3 px-3.5 font-mono font-medium text-[#214D3B]">
                    {apt.bookingRef}
                  </td>
                  <td className="py-3 px-3.5">
                    <p className="font-semibold text-[#252923]">{apt.customerName}</p>
                    <p className="text-[11px] text-[#777A70]">{apt.customerPhone}</p>
                  </td>
                  <td className="py-3 px-3.5">
                    <p className="font-medium text-[#252923]">{apt.serviceName}</p>
                    <p className="text-[11px] text-[#2E6B50]">{apt.categoryName}</p>
                  </td>
                  <td className="py-3 px-3.5 text-[#585B53]">
                    {apt.staffName || 'Concierge Assigned'}
                  </td>
                  <td className="py-3 px-3.5 tabular-nums">
                    <p className="font-medium text-[#252923]">{apt.appointmentDate}</p>
                    <p className="text-[11px] text-[#777A70]">{apt.timeSlot}</p>
                  </td>
                  <td className="py-3 px-3.5 tabular-nums">
                    <span className="font-serif font-bold text-[#214D3B]">
                      ₹{apt.amountInr.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-[#777A70] capitalize">
                      {apt.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : apt.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <Link
                      to={`/admin/appointments?search=${apt.bookingRef}`}
                      className="text-xs font-semibold text-[#214D3B] hover:underline"
                    >
                      Manage →
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
