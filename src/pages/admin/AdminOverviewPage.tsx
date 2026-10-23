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
import { AnalyticsSummary, Appointment, DateFilterPeriod, FollowUp, PaymentFollowUp } from '../../types';
import { RoomCalendar } from '../../components/calendar/RoomCalendar';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
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
  CalendarCheck,
  Stethoscope,
  ClockAlert,
  Headphones,
  ShieldCheck
} from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const [period, setPeriod] = useState<DateFilterPeriod>('this_month');
  const [metrics, setMetrics] = useState<AnalyticsSummary | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [paymentFollowUps, setPaymentFollowUps] = useState<PaymentFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      api.getAnalytics(period),
      api.getAppointments({ date: '2026-10-02' }),
      api.getFollowUps({ period: 'overdue' }),
      api.getPaymentFollowUps('pending')
    ])
      .then(([m, apts, flws, pfs]) => {
        setMetrics(m);
        setAppointments(apts);
        setFollowUps(flws);
        setPaymentFollowUps(pfs);
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
    { id: 'this_year', label: 'This Year' },
  ];

  const PIE_COLORS = ['#214D3B', '#2E6B50', '#4A8C6F', '#7DB89F', '#B4D6C6', '#D4AF37'];

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
      
      {/* Header & Quick Workspace Portals */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1E3B2E]">
            <ShieldCheck className="w-4 h-4" />
            <span>Executive Operations & Intelligence</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#252923]">
            NFYVE Transformation Centre Overview
          </h1>
          <p className="text-xs text-[#777A70]">
            Begumpet Sanctuary · Unified Call Center, Front Desk, Room Resources & Financial Performance
          </p>
        </div>

        {/* Workspace Quick Links for Admin */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/call-center"
            className="px-3 py-2 bg-white border border-[#DDD9CE] rounded-xl text-xs font-semibold text-[#1E3B2E] hover:bg-[#F0EEE5] shadow-2xs flex items-center gap-1.5"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Call Center</span>
          </Link>
          <Link
            to="/front-desk"
            className="px-3 py-2 bg-white border border-[#DDD9CE] rounded-xl text-xs font-semibold text-[#1E3B2E] hover:bg-[#F0EEE5] shadow-2xs flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Front Desk</span>
          </Link>
          <Link
            to="/staff"
            className="px-3 py-2 bg-white border border-[#DDD9CE] rounded-xl text-xs font-semibold text-[#1E3B2E] hover:bg-[#F0EEE5] shadow-2xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Staff Portal</span>
          </Link>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3 rounded-xl border border-[#E7E5DC] shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#585B53]">
          <Filter className="w-4 h-4 text-[#1E3B2E]" />
          <span>Report Period:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {allDateFilters.map(f => (
            <button
              key={f.id}
              onClick={() => setPeriod(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                period === f.id
                  ? 'bg-[#1E3B2E] text-white shadow-xs'
                  : 'text-[#585B53] hover:bg-[#F0EEE5]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 5: 8 REQUESTED KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        
        {/* 1. Total Prospects */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#777A70] block">Total Prospects</span>
          <p className="text-xl font-serif font-bold text-[#1E3B2E]">{metrics?.totalProspects ?? 0}</p>
          <span className="text-[10px] text-emerald-700">Enquiries logged</span>
        </div>

        {/* 2. Today's Appointments */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#777A70] block">Today's Appts</span>
          <p className="text-xl font-serif font-bold text-[#1E3B2E]">{metrics?.todayAppointmentsCount ?? 0}</p>
          <span className="text-[10px] text-[#777A70]">Active in rooms</span>
        </div>

        {/* 3. Today's Follow-ups */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#777A70] block">Today's Callbacks</span>
          <p className="text-xl font-serif font-bold text-[#1E3B2E]">{metrics?.todayFollowUpsCount ?? 0}</p>
          <span className="text-[10px] text-[#777A70]">Scheduled calls</span>
        </div>

        {/* 4. Overdue Follow-ups */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-rose-700 block">Overdue Follow-ups</span>
          <p className="text-xl font-serif font-bold text-rose-700">{metrics?.overdueFollowUpsCount ?? 0}</p>
          <span className="text-[10px] text-rose-800 font-semibold">Needs action</span>
        </div>

        {/* 5. Consultations Completed */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#777A70] block">Consultations Done</span>
          <p className="text-xl font-serif font-bold text-purple-700">{metrics?.consultationsCompletedCount ?? 0}</p>
          <span className="text-[10px] text-purple-800 font-medium">Doctor reviewed</span>
        </div>

        {/* 6. Treatment Sessions Completed */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#777A70] block">Sessions Done</span>
          <p className="text-xl font-serif font-bold text-emerald-700">{metrics?.sessionsCompletedCount ?? 0}</p>
          <span className="text-[10px] text-emerald-800 font-medium">Package delivered</span>
        </div>

        {/* 7. Revenue Collected */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#777A70] block">Revenue Collected</span>
          <p className="text-xl font-serif font-bold text-[#1E3B2E] tabular-nums">
            ₹{((metrics?.totalRevenue ?? 0) / 1000).toFixed(0)}k
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">Ledger receipts</span>
        </div>

        {/* 8. Outstanding Payments */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-800 block">Outstanding Balances</span>
          <p className="text-xl font-serif font-bold text-amber-800 tabular-nums">
            ₹{((metrics?.outstandingPaymentsAmount ?? 0) / 1000).toFixed(0)}k
          </p>
          <span className="text-[10px] text-amber-900 font-medium">Deferred fees</span>
        </div>
      </div>

      {/* ACTION REQUIRED QUEUE */}
      {(followUps.length > 0 || paymentFollowUps.length > 0) && (
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-semibold text-amber-900 flex items-center gap-2">
              <ClockAlert className="w-4 h-4 text-amber-700" />
              <span>Action Required Queue (Callbacks & Deferred Balances)</span>
            </h2>
            <span className="text-xs text-amber-800 font-medium">Immediate Attention</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Overdue Callbacks */}
            <div className="space-y-2">
              <span className="font-semibold text-rose-800 block uppercase tracking-wider text-[10px]">
                Overdue Call Center Callbacks ({followUps.length})
              </span>
              <div className="space-y-2">
                {followUps.slice(0, 3).map(f => (
                  <div key={f.id} className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-900">{f.customerName}</span> ({f.customerPhone})
                      <p className="text-[11px] text-rose-800 truncate">{f.reason}</p>
                    </div>
                    <Link to="/call-center/follow-ups?tab=overdue" className="text-rose-900 font-bold hover:underline">
                      Call →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Overdue Balances */}
            <div className="space-y-2">
              <span className="font-semibold text-amber-800 block uppercase tracking-wider text-[10px]">
                Pending Payment Postponements ({paymentFollowUps.length})
              </span>
              <div className="space-y-2">
                {paymentFollowUps.slice(0, 3).map(pf => (
                  <div key={pf.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-900">{pf.customerName}</span> · Balance: <strong className="text-rose-700">₹{pf.remainingBalance}</strong>
                      <p className="text-[11px] text-amber-800 truncate">Expected: {pf.expectedPaymentDate} · {pf.postponementReason}</p>
                    </div>
                    <Link to="/front-desk/payment-follow-ups" className="text-amber-900 font-bold hover:underline">
                      Collect →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5-ROOM SCHEDULING CALENDAR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-medium text-[#1E3B2E]">
            Five-Room Scheduling Grid (Today's Facility Allocation)
          </h2>
          <span className="text-xs text-[#777A70]">Shared across Front Desk & Call Center</span>
        </div>
        <RoomCalendar
          onSelectAppointment={(apt) => setActive360CustomerId(apt.customerId || apt.userId || null)}
          canManageBookings={true}
        />
      </div>

      {/* LEAD FUNNEL PROGRESSION */}
      {metrics?.funnelStages && (
        <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-4">
          <h2 className="font-serif text-base font-semibold text-[#1E3B2E]">
            Transformation Lead Funnel Conversion
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {metrics.funnelStages.map((stage, idx) => (
              <div key={stage.stage} className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] space-y-1 relative text-center">
                <span className="text-[10px] text-[#777A70] uppercase font-bold block truncate">{stage.stage}</span>
                <p className="text-xl font-serif font-bold text-[#1E3B2E]">{stage.count}</p>
                <div className="w-full bg-[#E7E5DC] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1E3B2E] h-full" style={{ width: `${stage.percentage}%` }} />
                </div>
                <span className="text-[10px] text-[#777A70]">{stage.percentage}% rate</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHARTS: REVENUE TREND & DISCIPLINE PIE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-semibold text-[#252923]">
              Revenue & Booking Momentum (₹ INR)
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              +{metrics?.comparison.revenueChangePct}% vs previous
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.revenueByPeriod || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#214D3B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#214D3B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE4" vertical={false} />
                <XAxis dataKey="label" stroke="#777A70" tick={{ fontSize: 11 }} />
                <YAxis stroke="#777A70" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#E7E5DC', borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#214D3B" strokeWidth={2.5} fillOpacity={1} fill="url(#adminRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-4">
          <h3 className="font-serif text-base font-semibold text-[#252923]">
            Lead Acquisition Sources
          </h3>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.leadSourceDistribution || []}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                >
                  {(metrics?.leadSourceDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#E7E5DC', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {(metrics?.leadSourceDistribution || []).map((item, idx) => (
              <div key={item.source} className="flex items-center justify-between text-[#585B53]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span>{item.source}</span>
                </div>
                <strong className="text-[#252923]">{item.count} leads</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Customer 360 Drawer */}
      <Customer360Drawer
        customerId={active360CustomerId}
        onClose={() => setActive360CustomerId(null)}
      />

    </div>
  );
};
