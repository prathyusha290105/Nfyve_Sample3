import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { 
  Appointment, 
  Consultation, 
  TreatmentSession, 
  PaymentFollowUp, 
  AppointmentStatus 
} from '../../types';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { 
  Building2, 
  Calendar, 
  CheckSquare, 
  UserPlus, 
  Clock, 
  User, 
  Phone, 
  Stethoscope, 
  Sparkles, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ClockAlert
} from 'lucide-react';

export const FrontDeskOverviewPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [sessions, setSessions] = useState<TreatmentSession[]>([]);
  const [paymentFollowUps, setPaymentFollowUps] = useState<PaymentFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  const todayStr = '2026-10-02';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [apts, cns, ses, pf] = await Promise.all([
        api.getAppointments({ date: todayStr }),
        api.getConsultations(),
        api.getSessions(),
        api.getPaymentFollowUps('pending')
      ]);
      setAppointments(apts);
      setConsultations(cns);
      setSessions(ses);
      setPaymentFollowUps(pf);
    } catch (err) {
      console.error('Error loading Front Desk overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    try {
      await api.updateAppointmentStatus(id, newStatus);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  // Metrics
  const todayAppointments = appointments.filter(a => a.status !== 'cancelled');
  const checkedInCount = appointments.filter(a => a.status === 'checked_in').length;
  const inConsultationCount = appointments.filter(a => a.status === 'in_consultation').length;
  const inProgressCount = appointments.filter(a => a.status === 'in_progress').length;
  const completedTodayCount = appointments.filter(a => a.status === 'completed' || a.status === 'consultation_completed').length;
  const paymentFollowUpsCount = paymentFollowUps.length;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1E3B2E]">
            <Building2 className="w-4 h-4" />
            <span>Begumpet Reception Desk</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#252923]">
            Sanctuary Operations Console
          </h1>
          <p className="text-xs text-[#777A70]">
            Manage client arrivals, room occupancy, practitioner assignments, and front counter billing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/front-desk/walk-in"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3B2E] text-white rounded-xl text-xs font-semibold hover:bg-[#2A5140] transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Walk-in</span>
          </Link>
          <Link
            to="/front-desk/calendar"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#DDD9CE] text-[#1E3B2E] rounded-xl text-xs font-semibold hover:bg-[#F0EEE5] transition-colors shadow-2xs"
          >
            <Calendar className="w-4 h-4" />
            <span>5-Room Calendar</span>
          </Link>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777A70] font-semibold">Today's Appts</span>
          <p className="text-2xl font-serif font-bold text-[#1E3B2E]">{todayAppointments.length}</p>
          <span className="text-[10px] text-[#777A70]">Scheduled today</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777A70] font-semibold">Checked-In</span>
          <p className="text-2xl font-serif font-bold text-blue-700">{checkedInCount}</p>
          <span className="text-[10px] text-blue-800 font-medium">In waiting lounge</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777A70] font-semibold">In Consultation</span>
          <p className="text-2xl font-serif font-bold text-purple-700">{inConsultationCount}</p>
          <span className="text-[10px] text-purple-800 font-medium">Doctor review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777A70] font-semibold">Sessions Active</span>
          <p className="text-2xl font-serif font-bold text-indigo-700">{inProgressCount}</p>
          <span className="text-[10px] text-indigo-800 font-medium">Treatment rooms</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777A70] font-semibold">Completed Today</span>
          <p className="text-2xl font-serif font-bold text-emerald-700">{completedTodayCount}</p>
          <span className="text-[10px] text-emerald-800 font-medium">Sessions & reviews</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777A70] font-semibold">Payment Dues</span>
          <p className="text-2xl font-serif font-bold text-amber-700">{paymentFollowUpsCount}</p>
          <Link to="/front-desk/payment-follow-ups" className="text-[10px] text-amber-800 font-semibold hover:underline">
            Follow up →
          </Link>
        </div>
      </div>

      {/* Main Split Sections: Live Queue & Immediate Action Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Today's Arrival & Room Progression Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium text-[#252923]">
              Today's Sanctuary Schedule ({todayAppointments.length})
            </h2>
            <Link to="/front-desk/calendar" className="text-xs font-semibold text-[#1E3B2E] hover:underline">
              Open 5-Room Grid View →
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs divide-y divide-[#F0EEE5]">
            {todayAppointments.map(apt => (
              <div key={apt.id} className="p-4 hover:bg-[#FAF9F5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#1E3B2E]">{apt.customerName}</span>
                    <span className="text-[10px] text-[#777A70]">({apt.bookingRef})</span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md border ${
                      apt.status === 'checked_in' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      apt.status === 'in_consultation' || apt.status === 'in_progress' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                      apt.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      'bg-stone-50 text-stone-800 border-stone-200'
                    }`}>
                      {apt.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#585B53]">
                    {apt.serviceName} · <strong className="text-[#1E3B2E]">{apt.room || 'Consult 1'}</strong>
                  </p>
                  <p className="text-[11px] text-[#777A70] flex items-center gap-3">
                    <span>Slot: <strong className="text-[#252923]">{apt.timeSlot}</strong></span>
                    <span>Specialist: <strong>{apt.assignedStaffName || apt.staffName}</strong></span>
                    <span>Channel: {apt.bookingChannel || 'Desk'}</span>
                  </p>
                </div>

                {/* Workflow Transitions */}
                <div className="flex items-center gap-2 shrink-0">
                  {apt.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'checked_in')}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Check In
                    </button>
                  )}

                  {apt.status === 'checked_in' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'in_consultation')}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Start Session
                    </button>
                  )}

                  {(apt.status === 'in_consultation' || apt.status === 'in_progress') && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'completed')}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Mark Completed
                    </button>
                  )}

                  <button
                    onClick={() => setActive360CustomerId(apt.customerId || apt.userId || null)}
                    className="p-1.5 text-[#777A70] hover:text-[#1E3B2E] hover:bg-[#F0EEE5] rounded-lg"
                    title="View 360 Dossier"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {todayAppointments.length === 0 && (
              <div className="p-8 text-center text-xs text-[#777A70]">
                No appointments scheduled for today. Register walk-ins or select another date on the calendar.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reception Fast-Actions & Pending Invoices */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Desk Actions */}
          <div className="bg-white p-5 rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-3">
            <h3 className="font-serif text-sm font-semibold text-[#1E3B2E]">Reception Actions</h3>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <Link 
                to="/front-desk/walk-in"
                className="p-2.5 rounded-lg border border-[#DDD9CE] hover:bg-[#FAF9F5] flex items-center justify-between font-semibold text-[#252923] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#1E3B2E]" />
                  <span>Register Walk-in Customer</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#777A70]" />
              </Link>

              <Link 
                to="/front-desk/consultations"
                className="p-2.5 rounded-lg border border-[#DDD9CE] hover:bg-[#FAF9F5] flex items-center justify-between font-semibold text-[#252923] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#1E3B2E]" />
                  <span>Record Doctor Consultation</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#777A70]" />
              </Link>

              <Link 
                to="/front-desk/sessions"
                className="p-2.5 rounded-lg border border-[#DDD9CE] hover:bg-[#FAF9F5] flex items-center justify-between font-semibold text-[#252923] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1E3B2E]" />
                  <span>Treatment Session Completion</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#777A70]" />
              </Link>

              <Link 
                to="/front-desk/billing"
                className="p-2.5 rounded-lg border border-[#DDD9CE] hover:bg-[#FAF9F5] flex items-center justify-between font-semibold text-[#252923] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#1E3B2E]" />
                  <span>Create Invoice & Record Payment</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#777A70]" />
              </Link>
            </div>
          </div>

          {/* Pending Payment Postponements */}
          <div className="bg-white p-5 rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                <ClockAlert className="w-4 h-4" />
                <span>Payment Postponements</span>
              </h3>
              <Link to="/front-desk/payment-follow-ups" className="text-[11px] font-semibold text-[#1E3B2E] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {paymentFollowUps.slice(0, 3).map(pf => (
                <div key={pf.id} className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E7E5DC] text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-[#252923]">{pf.customerName}</span>
                    <span className="text-rose-700">₹{pf.remainingBalance.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[11px] text-[#777A70]">Expected: {pf.expectedPaymentDate} · {pf.postponementReason}</p>
                </div>
              ))}

              {paymentFollowUps.length === 0 && (
                <p className="text-xs text-[#777A70] py-2 text-center">Zero overdue balances.</p>
              )}
            </div>
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
