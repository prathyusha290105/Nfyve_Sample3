import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Appointment } from '../../types';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  X, 
  FileText, 
  IndianRupee, 
  Check, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const StaffAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [completingApt, setCompletingApt] = useState<Appointment | null>(null);
  const [editingNotesApt, setEditingNotesApt] = useState<Appointment | null>(null);
  const [notesContent, setNotesContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadAppointments = () => {
    setIsLoading(true);
    api.getStaffAppointments({
      dateFilter: dateFilter !== 'all' && dateFilter !== 'custom' ? dateFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchQuery || undefined,
      startDate: dateFilter === 'custom' && startDate ? startDate : undefined,
      endDate: dateFilter === 'custom' && endDate ? endDate : undefined,
    })
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAppointments();
  };

  const handleOpenComplete = (apt: Appointment) => {
    setCompletingApt(apt);
    setNotesContent(apt.notes || '');
  };

  const handleConfirmComplete = async () => {
    if (!completingApt) return;
    setIsSubmitting(true);
    try {
      if (notesContent.trim()) {
        await api.updateStaffAppointmentNotes(completingApt.id, notesContent.trim());
      }
      await api.completeStaffAppointment(completingApt.id);
      setToastMessage(`Session ${completingApt.bookingRef} marked completed!`);
      setTimeout(() => setToastMessage(''), 4000);
      setCompletingApt(null);
      loadAppointments();
    } catch (err: any) {
      alert(err.message || 'Error updating appointment status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNotesOnly = async () => {
    if (!editingNotesApt) return;
    setIsSubmitting(true);
    try {
      await api.updateStaffAppointmentNotes(editingNotesApt.id, notesContent.trim());
      setToastMessage('Clinical treatment notes saved successfully!');
      setTimeout(() => setToastMessage(''), 4000);
      setEditingNotesApt(null);
      loadAppointments();
    } catch (err: any) {
      alert(err.message || 'Error updating notes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-4">
        <div>
          <h1 className="font-serif text-3xl text-[#214D3B] font-bold tracking-tight">
            My Appointments & Consultations Register
          </h1>
          <p className="text-xs text-[#585B53] mt-0.5">
            View, track, and complete treatment sessions assigned directly to your specialist schedule.
          </p>
        </div>

        <button
          onClick={loadAppointments}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#585B53] text-xs font-semibold rounded-lg transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Register</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-[#777A70] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by client name, booking reference ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
            />
          </form>

          {/* Date Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#777A70] font-medium">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-3 py-2 text-xs text-[#252923] font-medium focus:outline-none focus:border-[#214D3B]"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-3 py-2 text-xs text-[#252923] font-medium focus:outline-none focus:border-[#214D3B]"
            >
              <option value="all">All Statuses ({appointments.length})</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

        </div>

        {/* Custom Date Range pickers if selected */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-[#F0EEE5] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#777A70]">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#777A70]">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded text-xs"
              />
            </div>
            <button
              onClick={loadAppointments}
              className="px-3 py-1.5 bg-[#214D3B] text-white font-medium rounded text-xs"
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-[#E7E5DC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] text-[#585B53] border-b border-[#E7E5DC]">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Ref ID</th>
                <th className="py-3 px-3.5 font-semibold">Client Name & Phone</th>
                <th className="py-3 px-3.5 font-semibold">Service Protocol</th>
                <th className="py-3 px-3.5 font-semibold">Date & Time</th>
                <th className="py-3 px-3.5 font-semibold">Fee & Payment</th>
                <th className="py-3 px-3.5 font-semibold">Status</th>
                <th className="py-3 px-3.5 font-semibold text-right">Clinical Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777A70]">
                    Loading your schedule...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777A70]">
                    No consultations matching criteria found in your roster.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    
                    <td className="py-3.5 px-3.5 font-mono font-medium text-[#214D3B]">
                      {apt.bookingRef}
                    </td>

                    <td className="py-3.5 px-3.5">
                      <p className="font-semibold text-[#252923]">{apt.customerName}</p>
                      <p className="text-[11px] text-[#777A70]">{apt.customerPhone}</p>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <p className="font-medium text-[#252923]">{apt.serviceName}</p>
                      <p className="text-[11px] text-[#2E6B50] font-medium">{apt.categoryName}</p>
                    </td>

                    <td className="py-3.5 px-3.5 tabular-nums">
                      <p className="font-medium text-[#252923]">{apt.appointmentDate}</p>
                      <p className="text-[11px] text-[#777A70]">{apt.timeSlot}</p>
                    </td>

                    <td className="py-3.5 px-3.5 tabular-nums">
                      <span className="font-bold text-[#214D3B] font-serif">
                        ₹{apt.amountInr.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[10px] text-[#777A70] capitalize">
                        {apt.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5">
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

                    <td className="py-3.5 px-3.5 text-right space-x-2">
                      {/* Edit Notes button */}
                      <button
                        onClick={() => {
                          setEditingNotesApt(apt);
                          setNotesContent(apt.notes || '');
                        }}
                        className="p-1.5 text-[#585B53] hover:text-[#214D3B] hover:bg-[#F0EEE5] rounded-md transition-colors"
                        title="View / Edit Clinical Notes"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Complete Treatment Action */}
                      {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                        <button
                          onClick={() => handleOpenComplete(apt)}
                          className="px-3 py-1.5 bg-[#214D3B] hover:bg-[#1a3e2f] text-white font-semibold text-xs rounded-md shadow-xs transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}

                      {apt.status === 'completed' && (
                        <span className="text-emerald-700 font-medium text-xs inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Finished</span>
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Mark Treatment Completed */}
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
                Finish & Settle Session
              </h3>
              <p className="text-xs text-[#777A70]">
                Client: <strong className="text-[#252923]">{completingApt.customerName}</strong> · Service: <strong className="text-[#214D3B]">{completingApt.serviceName}</strong>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#E7E5DC] flex items-center justify-between">
                <div>
                  <span className="text-[#777A70]">Treatment Fee</span>
                  <p className="font-serif font-bold text-base text-[#214D3B]">
                    ₹{completingApt.amountInr.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded text-[11px]">
                  Will mark as Paid & Completed
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">
                  Treatment Notes / Outcomes / Recommendations:
                </label>
                <textarea
                  rows={4}
                  placeholder="Record treatment parameters, skin reaction, products used, or next recommended session date..."
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
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
                {isSubmitting ? 'Saving...' : 'Confirm Completion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View / Edit Treatment Notes Only */}
      {editingNotesApt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative space-y-4">
            <button
              onClick={() => setEditingNotesApt(null)}
              className="absolute top-4 right-4 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#E7E5DC] pb-3">
              <span className="text-[10px] font-mono text-[#777A70] uppercase">
                {editingNotesApt.bookingRef}
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#214D3B]">
                Treatment & Consultation Notes
              </h3>
              <p className="text-xs text-[#777A70]">
                Client: <strong className="text-[#252923]">{editingNotesApt.customerName}</strong>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#252923] mb-1">
                  Practitioner Dossier Notes:
                </label>
                <textarea
                  rows={5}
                  placeholder="Record treatment notes, client medical history, allergy alerts, skin observations, or ongoing fitness progression..."
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7E5DC] flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setEditingNotesApt(null)}
                className="px-4 py-2 border border-[#DDD9CE] rounded-lg font-semibold text-[#585B53] hover:bg-[#F0EEE5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotesOnly}
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#214D3B] hover:bg-[#1a3e2f] text-white rounded-lg font-bold shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
