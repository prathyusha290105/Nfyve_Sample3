import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { StaffDashboardData, Appointment } from '../../types';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  User, 
  Sparkles, 
  ArrowRight, 
  CalendarCheck, 
  FileText, 
  AlertCircle, 
  X,
  TrendingUp,
  Check,
  Building2,
  RefreshCw,
  Star
} from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<StaffDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completingApt, setCompletingApt] = useState<Appointment | null>(null);
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = () => {
    setIsLoading(true);
    api.getStaffDashboard('this_month')
      .then(setDashboardData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCompleteModal = (apt: Appointment) => {
    setCompletingApt(apt);
    setTreatmentNotes(apt.notes || '');
  };

  const handleConfirmComplete = async () => {
    if (!completingApt) return;
    setIsSubmitting(true);
    try {
      if (treatmentNotes.trim()) {
        await api.updateStaffAppointmentNotes(completingApt.id, treatmentNotes.trim());
      }
      await api.completeStaffAppointment(completingApt.id);
      setSuccessMessage(`Session for ${completingApt.customerName} marked as completed!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setCompletingApt(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error updating appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="py-20 text-center text-xs text-[#777A70] flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-[#214D3B]" />
        <span>Loading your personalized practitioner dashboard...</span>
      </div>
    );
  }

  const staff = dashboardData?.staff;
  const metrics = dashboardData?.metrics;
  const nextApt = dashboardData?.nextUpcoming;
  const todaySchedule = dashboardData?.todaySchedule || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Top Banner & Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl text-[#214D3B] font-bold tracking-tight">
              Welcome back, {staff?.name}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#214D3B] text-white rounded-full">
              {staff?.roleTitle}
            </span>
          </div>
          <p className="text-xs text-[#585B53] mt-1">
            Begumpet Sanctuary · Integrated Wellness Consultation & Treatment Desk
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#585B53] rounded-lg transition-colors"
            title="Refresh schedule"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/staff/appointments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#214D3B] hover:bg-[#1a3e2f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Full Schedule Register</span>
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span className="font-medium">Today's Schedule</span>
              <Calendar className="w-4 h-4 text-[#214D3B]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#214D3B] tabular-nums">
              {metrics.todayCount} Sessions
            </div>
            <p className="text-[11px] text-[#585B53]">
              {todaySchedule.filter(a => a.status === 'completed').length} completed today
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span className="font-medium">Upcoming Pipeline</span>
              <Clock className="w-4 h-4 text-[#2E6B50]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#252923] tabular-nums">
              {metrics.upcomingCount} Bookings
            </div>
            <p className="text-[11px] text-[#585B53]">
              Confirmed future appointments
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span className="font-medium">Attributed Revenue</span>
              <IndianRupee className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#214D3B] tabular-nums">
              ₹{metrics.personalRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">
              This month's completed sessions
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-[#777A70]">
              <span className="font-medium">Client Rating</span>
              <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#214D3B] tabular-nums flex items-center gap-1">
              4.9 <span className="text-xs font-normal text-[#777A70]">/ 5.0</span>
            </div>
            <p className="text-[11px] text-[#585B53]">
              {metrics.completedCount} total treatments delivered
            </p>
          </div>

        </div>
      )}

      {/* Focus: Next Upcoming Client Card */}
      {nextApt ? (
        <div className="bg-gradient-to-r from-[#214D3B] to-[#2c654e] text-white p-6 rounded-2xl shadow-md border border-[#1b3e30] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-[#D4AF37] text-[#214D3B] uppercase">
                Next Scheduled Session
              </span>
              <span className="text-xs text-white/80 font-mono">{nextApt.bookingRef}</span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-white">
              {nextApt.serviceName}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/90">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="font-semibold text-white">{nextApt.customerName}</span>
                <span className="text-white/70">({nextApt.customerPhone})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{nextApt.appointmentDate} · {nextApt.timeSlot}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>₹{nextApt.amountInr.toLocaleString('en-IN')} ({nextApt.paymentStatus})</span>
              </div>
            </div>

            {nextApt.notes && (
              <p className="text-xs text-white/80 bg-black/15 p-2 rounded-lg max-w-xl">
                <span className="font-semibold text-[#D4AF37]">Intake Note:</span> {nextApt.notes}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={() => handleOpenCompleteModal(nextApt)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-[#214D3B] font-bold text-xs rounded-xl shadow-sm hover:bg-[#F8F7F2] transition-colors"
            >
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Mark Session Completed</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#214D3B]">
            All Scheduled Sessions Completed!
          </h3>
          <p className="text-xs text-[#777A70]">
            You have no pending consultations for the remainder of today. Check your upcoming week's calendar below.
          </p>
        </div>
      )}

      {/* Main Grid: Today's Schedule Timeline & Upcoming Days Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Today's Schedule Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7E5DC] pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#214D3B]">
                Today's Consultations Timeline
              </h2>
              <p className="text-xs text-[#777A70]">
                All sessions assigned to your suite for today.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#2E6B50]">
              {todaySchedule.length} Assigned
            </span>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-[#E7E5DC] text-center text-xs text-[#777A70]">
              No sessions scheduled for today. Take time to review upcoming client protocols.
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((apt) => (
                <div
                  key={apt.id}
                  className={`bg-white p-4 rounded-xl border transition-all ${
                    apt.status === 'completed'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : apt.status === 'confirmed'
                      ? 'border-[#214D3B]/40 shadow-xs'
                      : 'border-[#E7E5DC]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#777A70]">{apt.bookingRef}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            apt.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                        <span className="text-xs font-semibold text-[#214D3B]">{apt.timeSlot}</span>
                      </div>

                      <h4 className="font-semibold text-sm text-[#252923]">
                        {apt.serviceName}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-[#585B53]">
                        <span className="font-medium text-[#252923]">{apt.customerName}</span>
                        <span>·</span>
                        <span>{apt.customerPhone}</span>
                        <span>·</span>
                        <span>₹{apt.amountInr.toLocaleString('en-IN')}</span>
                      </div>

                      {apt.notes && (
                        <p className="text-[11px] text-[#777A70] italic mt-1">
                          "{apt.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                        <button
                          onClick={() => handleOpenCompleteModal(apt)}
                          className="px-3.5 py-1.5 bg-[#214D3B] hover:bg-[#1a3e2f] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                        >
                          Complete & Notes
                        </button>
                      )}
                      {apt.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Finished</span>
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Upcoming 7 Days Workload & Quick Links */}
        <div className="space-y-6">
          
          {/* Upcoming Days Workload */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-4">
            <div className="border-b border-[#F0EEE5] pb-2">
              <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                Upcoming Days Workload
              </h3>
              <p className="text-xs text-[#777A70]">
                Anticipated appointment volume for next 7 days.
              </p>
            </div>

            <div className="space-y-2.5">
              {(dashboardData?.upcomingDays || []).map((day, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-[#FAF9F5]">
                  <div>
                    <span className="font-semibold text-[#252923]">{day.dayLabel}</span>
                    <span className="block text-[10px] text-[#777A70] tabular-nums">{day.date}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    day.count > 0 ? 'bg-[#214D3B] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {day.count} {day.count === 1 ? 'client' : 'clients'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Specialist Actions */}
          <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#214D3B]">
              Specialist Quick Links
            </h3>
            
            <Link
              to="/staff/clients"
              className="flex items-center justify-between p-2.5 rounded-lg border border-[#E7E5DC] text-xs font-medium text-[#252923] hover:border-[#214D3B] hover:text-[#214D3B] transition-colors"
            >
              <span>View Client Dossiers & Past Notes</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#2E6B50]" />
            </Link>

            <Link
              to="/staff/performance"
              className="flex items-center justify-between p-2.5 rounded-lg border border-[#E7E5DC] text-xs font-medium text-[#252923] hover:border-[#214D3B] hover:text-[#214D3B] transition-colors"
            >
              <span>Personal Revenue & Rating Analytics</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
            </Link>

            <Link
              to="/staff/profile"
              className="flex items-center justify-between p-2.5 rounded-lg border border-[#E7E5DC] text-xs font-medium text-[#252923] hover:border-[#214D3B] hover:text-[#214D3B] transition-colors"
            >
              <span>Update Bio & Working Hours</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#2E6B50]" />
            </Link>
          </div>

        </div>

      </div>

      {/* Modal: Complete Session & Record Treatment Notes */}
      {completingApt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative space-y-4">
            <button
              onClick={() => setCompletingApt(null)}
              className="absolute top-4 right-4 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#E7E5DC] pb-3">
              <span className="text-[10px] font-mono text-[#777A70] uppercase">
                {completingApt.bookingRef}
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#214D3B]">
                Complete Consultation & Treatment
              </h3>
              <p className="text-xs text-[#777A70]">
                Client: <strong className="text-[#252923]">{completingApt.customerName}</strong> · Service: <strong className="text-[#214D3B]">{completingApt.serviceName}</strong>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#E7E5DC] flex items-center justify-between">
                <div>
                  <span className="text-[#777A70]">Service Fee</span>
                  <p className="font-serif font-bold text-base text-[#214D3B]">
                    ₹{completingApt.amountInr.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded text-[11px]">
                  Will mark as Paid / Settled
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">
                  Treatment Outcome & Clinical Notes:
                </label>
                <textarea
                  rows={4}
                  placeholder="Record treatment parameters, product formulations used, client tolerance, aftercare advice given, or recommended next session date..."
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7E5DC] flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setCompletingApt(null)}
                className="px-4 py-2 border border-[#DDD9CE] rounded-lg font-semibold text-[#585B53] hover:bg-[#F0EEE5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#214D3B] hover:bg-[#1a3e2f] text-white rounded-lg font-bold shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Mark Completed & Save Dossier'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
