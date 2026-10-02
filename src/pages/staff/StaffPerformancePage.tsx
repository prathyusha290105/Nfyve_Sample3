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
import { StaffPerformanceData, DateFilterPeriod } from '../../types';
import { 
  TrendingUp, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  Star, 
  RefreshCw, 
  Filter,
  Award,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export const StaffPerformancePage: React.FC = () => {
  const [period, setPeriod] = useState<DateFilterPeriod>('this_month');
  const [perfData, setPerfData] = useState<StaffPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPerformance = () => {
    setIsLoading(true);
    api.getStaffPerformance(period)
      .then(setPerfData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadPerformance();
  }, [period]);

  const periods: { label: string; value: DateFilterPeriod }[] = [
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Last 3 Months', value: 'last_3_months' },
    { label: 'This Year', value: 'this_year' },
  ];

  const PIE_COLORS = ['#214D3B', '#2E6B50', '#4A8C6F', '#7DB89F', '#B4D6C6'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-4">
        <div>
          <h1 className="font-serif text-3xl text-[#214D3B] font-bold tracking-tight">
            Practitioner Performance & Feedback
          </h1>
          <p className="text-xs text-[#585B53] mt-0.5">
            Personal productivity telemetry, revenue attribution, discipline delivery, and client reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period dropdown */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as DateFilterPeriod)}
            className="bg-white border border-[#DDD9CE] rounded-lg px-3 py-1.5 text-xs text-[#252923] font-medium focus:outline-none focus:border-[#214D3B]"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <button
            onClick={loadPerformance}
            className="p-2 bg-white border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#585B53] rounded-lg transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading && !perfData ? (
        <div className="py-20 text-center text-xs text-[#777A70]">
          Loading performance telemetry...
        </div>
      ) : perfData ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Revenue Generated */}
            <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#777A70]">
                <span className="font-medium">Attributed Revenue</span>
                <IndianRupee className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#214D3B] tabular-nums">
                ₹{perfData.personalRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#585B53]">
                <span className={perfData.comparisonVsPrevious.revenueDiffPct >= 0 ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                  {perfData.comparisonVsPrevious.revenueDiffPct >= 0 ? '↑ +' : '↓ '}
                  {Math.abs(perfData.comparisonVsPrevious.revenueDiffPct)}% vs prev period
                </span>
              </div>
            </div>

            {/* Completed Sessions */}
            <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#777A70]">
                <span className="font-medium">Treatments Delivered</span>
                <CheckCircle2 className="w-4 h-4 text-[#2E6B50]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#252923] tabular-nums">
                {perfData.totalCompleted}
              </div>
              <div className="text-[11px] text-[#585B53]">
                <span className="text-emerald-700 font-semibold">
                  {perfData.completionRate}% completion rate
                </span>
              </div>
            </div>

            {/* Satisfaction Rating */}
            <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#777A70]">
                <span className="font-medium">Client Rating</span>
                <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#214D3B] tabular-nums flex items-center gap-1">
                {perfData.ratingAverage} <span className="text-xs text-[#777A70] font-normal">/ 5.0</span>
              </div>
              <div className="text-[11px] text-[#585B53]">
                {perfData.feedbackCount} authenticated client reviews
              </div>
            </div>

            {/* Daily Velocity */}
            <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#777A70]">
                <span className="font-medium">Daily Consultation Avg</span>
                <TrendingUp className="w-4 h-4 text-[#214D3B]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#252923] tabular-nums">
                {perfData.avgDailyAppointments} / day
              </div>
              <div className="text-[11px] text-[#777A70]">
                {perfData.totalAssigned} sessions assigned total
              </div>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Trend Over Time */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#E7E5DC] shadow-xs space-y-4">
              <div className="border-b border-[#F0EEE5] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                    Treatment Delivery & Attributed Revenue Trend
                  </h3>
                  <p className="text-xs text-[#777A70]">
                    Performance progression across the selected time period.
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={perfData.trendOverTime}>
                    <defs>
                      <linearGradient id="staffRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#214D3B" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#214D3B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE5" vertical={false} />
                    <XAxis dataKey="label" stroke="#777A70" fontSize={11} tickLine={false} />
                    <YAxis 
                      stroke="#777A70" 
                      fontSize={11} 
                      tickLine={false} 
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip 
                      formatter={(val: any, name: any) => [
                        name === 'revenue' ? `₹${Number(val).toLocaleString('en-IN')}` : `${val} sessions`,
                        name === 'revenue' ? 'Revenue Realized' : 'Completed Sessions'
                      ]}
                      contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#DDD9CE', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name="revenue" 
                      stroke="#214D3B" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#staffRevGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right 1 Col: Category Breakdown */}
            <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] shadow-xs space-y-4">
              <div className="border-b border-[#F0EEE5] pb-3">
                <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                  Discipline Breakdown
                </h3>
                <p className="text-xs text-[#777A70]">
                  Treatments completed by wellness pillar.
                </p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={perfData.servicesByCategory}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {perfData.servicesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any, name: any, item: any) => [
                        `${val} sessions (₹${item.payload.revenue.toLocaleString('en-IN')})`,
                        item.payload.category
                      ]}
                      contentStyle={{ backgroundColor: '#FAF9F5', borderColor: '#DDD9CE', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#F0EEE5]">
                {perfData.servicesByCategory.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-[#252923] font-medium truncate max-w-[130px]">{cat.category}</span>
                    </div>
                    <span className="font-semibold text-[#214D3B] tabular-nums">
                      {cat.count} ({Math.round((cat.revenue / (perfData.personalRevenue || 1)) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Client Reviews Section */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] shadow-xs space-y-4">
            <div className="border-b border-[#F0EEE5] pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#214D3B]">
                  Client Feedback & Testimonials
                </h3>
                <p className="text-xs text-[#777A70]">
                  Verified feedback from clientele treated at your suite.
                </p>
              </div>
              <span className="px-3 py-1 bg-[#F4F9F6] text-[#214D3B] text-xs font-bold rounded-lg border border-[#214D3B]/20">
                ★ 4.9 Average Rating
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(perfData.reviews || []).slice(0, 4).map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E7E5DC] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#252923]">{rev.customerName}</span>
                      <span className="text-[11px] text-[#777A70] block">{rev.serviceName}</span>
                    </div>
                    <div className="flex text-[#D4AF37]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[#585B53] italic leading-relaxed">
                    "{rev.reviewText}"
                  </p>
                  <span className="text-[10px] text-[#777A70] block tabular-nums">
                    Reviewed on {rev.reviewDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

    </div>
  );
};
