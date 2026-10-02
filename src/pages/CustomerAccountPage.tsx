import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Appointment } from '../types';
import { 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

export const CustomerAccountPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile'>(
    location.pathname.includes('appointments') ? 'appointments' : 'appointments'
  );

  // Profile update state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Appointments filter
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [actionMsg, setActionMsg] = useState('');

  const loadAppointments = () => {
    api.getMyAppointments().then(setAppointments).catch(console.error);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setProfileMsg('');
    try {
      await api.updateProfile({ name, phone });
      await refreshUser();
      setProfileMsg('Profile details successfully updated.');
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled appointment?')) return;
    try {
      await api.cancelAppointment(id);
      setActionMsg('Appointment cancelled.');
      loadAppointments();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Cancellation failed.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((a) => {
    if (appointmentFilter === 'upcoming') {
      return a.appointmentDate >= todayStr && a.status !== 'cancelled';
    }
    if (appointmentFilter === 'past') {
      return a.appointmentDate < todayStr || a.status === 'completed';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24">
      
      {/* Top Profile Summary Bar */}
      <div className="bg-white rounded-2xl border border-[#E7E5DC] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#F0EEE5] border border-[#DDD9CE] flex items-center justify-center text-[#244B3A] font-serif text-2xl font-semibold">
            {user?.name.charAt(0)}
          </div>
          <div className="space-y-0.5">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#252923] font-medium">
              {user?.name}
            </h1>
            <p className="text-xs text-[#777A70] flex items-center gap-2">
              <span>{user?.email}</span>
              <span aria-hidden="true">·</span>
              <span>{user?.phone}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/book-appointment"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#244B3A] hover:bg-[#1a372a] rounded-lg transition-smooth shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book New Service</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7E5DC] pb-2">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-smooth ${
            activeTab === 'appointments'
              ? 'bg-[#244B3A] text-white shadow-xs'
              : 'text-[#585B53] hover:bg-[#F0EEE5]'
          }`}
        >
          My Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-smooth ${
            activeTab === 'profile'
              ? 'bg-[#244B3A] text-white shadow-xs'
              : 'text-[#585B53] hover:bg-[#F0EEE5]'
          }`}
        >
          Profile Settings
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Tab 1: Appointments */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          
          {/* Sub-filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#777A70] font-medium">Filter:</span>
            {(['all', 'upcoming', 'past'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setAppointmentFilter(f)}
                className={`px-3 py-1 rounded-md capitalize transition-smooth ${
                  appointmentFilter === f
                    ? 'bg-[#E5E2D6] text-[#244B3A] font-semibold'
                    : 'text-[#777A70] hover:text-[#252923]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-[#E7E5DC] space-y-3">
              <Calendar className="w-10 h-10 text-[#A8B8A0] mx-auto" />
              <h3 className="font-serif text-xl text-[#252923]">No Appointments Found</h3>
              <p className="text-xs text-[#777A70] max-w-sm mx-auto">
                You do not have any registered sessions under this filter. Explore our 6 transformation pillars to schedule a visit.
              </p>
              <Link
                to="/book-appointment"
                className="inline-block mt-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#244B3A] rounded-lg"
              >
                Browse & Book
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-xl border border-[#E7E5DC] p-6 space-y-4 shadow-2xs hover:border-[#244B3A]/40 transition-smooth"
                >
                  <div className="flex items-start justify-between border-b border-[#F0EEE5] pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#777A70] uppercase">
                        {apt.bookingRef}
                      </span>
                      <h4 className="font-serif text-lg font-medium text-[#252923] mt-0.5">
                        {apt.serviceName}
                      </h4>
                      <p className="text-[11px] text-[#777A70]">{apt.categoryName}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md uppercase tracking-wider ${
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
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#777A70]">Date & Time</span>
                      <p className="font-medium text-[#252923] tabular-nums mt-0.5">
                        {apt.appointmentDate} · {apt.timeSlot}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#777A70]">Specialist</span>
                      <p className="font-medium text-[#252923] mt-0.5">
                        {apt.staffName || 'Sanctuary Practitioner'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#777A70]">Fee Status</span>
                      <p className="font-medium text-[#252923] mt-0.5 capitalize">
                        ₹{apt.amountInr.toLocaleString('en-IN')} · {apt.paymentStatus}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#777A70]">Location</span>
                      <p className="font-medium text-[#252923] mt-0.5">
                        4th Fl, Kura Towers, Begumpet
                      </p>
                    </div>
                  </div>

                  {apt.notes && (
                    <div className="text-[11px] text-[#585B53] bg-[#FAF9F5] p-2.5 rounded-lg border border-[#E7E5DC]">
                      <span className="font-semibold">Notes: </span>{apt.notes}
                    </div>
                  )}

                  {/* Actions */}
                  {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                    <div className="pt-2 border-t border-[#F0EEE5] flex justify-end gap-3 text-xs">
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="text-red-700 hover:text-red-900 font-medium transition-colors"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Tab 2: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white p-8 rounded-2xl border border-[#E7E5DC] space-y-6">
          <div>
            <h3 className="font-serif text-2xl text-[#244B3A] font-medium">
              Client Profile Settings
            </h3>
            <p className="text-xs text-[#777A70] mt-1">
              Keep your contact information updated for appointment reminders and SMS confirmations.
            </p>
          </div>

          {profileMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#585B53] font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
              />
            </div>

            <div>
              <label className="block text-[#585B53] font-medium mb-1">
                Email Address (Permanent Identifier)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[#585B53] font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-3 bg-[#244B3A] hover:bg-[#1a372a] text-white font-semibold uppercase tracking-wider rounded-lg transition-smooth disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
