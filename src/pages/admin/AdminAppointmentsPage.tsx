import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { Appointment, Service, Staff, AppointmentStatus, PaymentStatus } from '../../types';
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  X, 
  Eye,
  AlertCircle
} from 'lucide-react';

export const AdminAppointmentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState<boolean>(
    searchParams.get('action') === 'walkin'
  );

  // Walk-in form state
  const [walkinData, setWalkinData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    serviceId: '',
    staffId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '10:30 AM - 11:30 AM',
    paymentStatus: 'paid',
    notes: 'Walk-in / Phone reservation',
  });
  const [walkinError, setWalkinError] = useState('');
  const [isSubmittingWalkin, setIsSubmittingWalkin] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      api.getAdminAppointments({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
      api.getServices(),
      api.getStaff()
    ])
      .then(([apts, srvs, stf]) => {
        setAppointments(apts);
        setServices(srvs);
        setStaffList(stf);
        if (srvs.length > 0 && !walkinData.serviceId) {
          setWalkinData(prev => ({ ...prev, serviceId: srvs[0].id }));
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus, newPayment?: PaymentStatus) => {
    try {
      await api.updateAppointmentStatus(id, { 
        status: newStatus,
        paymentStatus: newPayment
      });
      loadData();
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment(prev => prev ? { ...prev, status: newStatus, paymentStatus: newPayment || prev.paymentStatus } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinData.customerName || !walkinData.customerPhone || !walkinData.serviceId) {
      setWalkinError('Please enter client name, phone number, and service.');
      return;
    }

    setIsSubmittingWalkin(true);
    setWalkinError('');

    try {
      await api.createWalkInBooking(walkinData);
      setIsWalkinModalOpen(false);
      setWalkinData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        serviceId: services[0]?.id || '',
        staffId: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: '10:30 AM - 11:30 AM',
        paymentStatus: 'paid',
        notes: 'Walk-in / Phone reservation',
      });
      loadData();
    } catch (err: any) {
      setWalkinError(err.message || 'Failed to create walk-in booking.');
    } finally {
      setIsSubmittingWalkin(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-4">
        <div>
          <h1 className="font-serif text-3xl text-[#244B3A] font-medium tracking-tight">
            Appointments Management Register
          </h1>
          <p className="text-xs text-[#777A70] mt-0.5">
            Manage scheduling, verify intake notes, confirm walk-ins, and record payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#585B53] rounded-lg transition-colors"
            title="Reload Appointments"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsWalkinModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#244B3A] hover:bg-[#1a372a] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-xs transition-smooth"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Walk-In Booking</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#777A70] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by client name, reference ID, phone, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#244B3A] text-white text-xs font-medium rounded-lg hover:bg-[#1a372a]"
          >
            Search
          </button>
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#777A70] font-medium shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-3 py-2 text-xs text-[#252923] font-medium focus:outline-none focus:border-[#244B3A]"
          >
            <option value="all">All Statuses ({appointments.length})</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-Show</option>
          </select>
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-[#E7E5DC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] text-[#585B53] border-b border-[#E7E5DC]">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Ref ID</th>
                <th className="py-3 px-3.5 font-semibold">Client Name & Phone</th>
                <th className="py-3 px-3.5 font-semibold">Discipline & Service</th>
                <th className="py-3 px-3.5 font-semibold">Date & Slot</th>
                <th className="py-3 px-3.5 font-semibold">Specialist</th>
                <th className="py-3 px-3.5 font-semibold">Amount</th>
                <th className="py-3 px-3.5 font-semibold">Status</th>
                <th className="py-3 px-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#777A70]">
                    No appointment records matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3 px-3.5 font-mono font-medium text-[#244B3A]">
                      {apt.bookingRef}
                    </td>

                    <td className="py-3 px-3.5">
                      <p className="font-semibold text-[#252923]">{apt.customerName}</p>
                      <p className="text-[11px] text-[#777A70]">{apt.customerPhone}</p>
                    </td>

                    <td className="py-3 px-3.5">
                      <p className="font-medium text-[#252923]">{apt.serviceName}</p>
                      <p className="text-[11px] text-[#777A70]">{apt.categoryName}</p>
                    </td>

                    <td className="py-3 px-3.5 tabular-nums">
                      <p className="font-medium text-[#252923]">{apt.appointmentDate}</p>
                      <p className="text-[11px] text-[#777A70]">{apt.timeSlot}</p>
                    </td>

                    <td className="py-3 px-3.5 text-[#585B53]">
                      {apt.staffName || 'Concierge Pool'}
                    </td>

                    <td className="py-3 px-3.5 tabular-nums">
                      <span className="font-semibold text-[#244B3A]">
                        ₹{apt.amountInr.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[10px] text-[#777A70] capitalize">
                        {apt.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-3.5">
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

                    <td className="py-3 px-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedAppointment(apt)}
                        className="text-[#244B3A] font-medium hover:underline inline-flex items-center gap-1"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      {apt.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                          className="text-emerald-700 font-semibold hover:underline"
                        >
                          Confirm
                        </button>
                      )}

                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'completed', 'paid')}
                          className="text-blue-700 font-semibold hover:underline"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-[#FAF9F5] border-t border-[#E7E5DC] flex items-center justify-between text-xs text-[#585B53]">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, appointments.length)} of {appointments.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-1 border border-[#DDD9CE] rounded bg-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-2 tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1 border border-[#DDD9CE] rounded bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Appointment Details & Management */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-4 right-4 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#E7E5DC] pb-3">
              <span className="text-[10px] font-mono text-[#777A70] uppercase">
                {selectedAppointment.bookingRef}
              </span>
              <h3 className="font-serif text-2xl text-[#244B3A] font-medium">
                {selectedAppointment.serviceName}
              </h3>
              <p className="text-xs text-[#777A70]">{selectedAppointment.categoryName}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#777A70]">Client Name</span>
                <p className="font-medium text-[#252923]">{selectedAppointment.customerName}</p>
              </div>
              <div>
                <span className="text-[#777A70]">Contact Phone</span>
                <p className="font-medium text-[#252923]">{selectedAppointment.customerPhone}</p>
              </div>
              <div>
                <span className="text-[#777A70]">Scheduled Date</span>
                <p className="font-medium text-[#252923] tabular-nums">{selectedAppointment.appointmentDate}</p>
              </div>
              <div>
                <span className="text-[#777A70]">Time Slot</span>
                <p className="font-medium text-[#252923] tabular-nums">{selectedAppointment.timeSlot}</p>
              </div>
              <div>
                <span className="text-[#777A70]">Specialist</span>
                <p className="font-medium text-[#252923]">{selectedAppointment.staffName || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-[#777A70]">Fee Amount</span>
                <p className="font-semibold text-[#244B3A] font-serif text-base">
                  ₹{selectedAppointment.amountInr.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div className="p-3 bg-white rounded-lg border border-[#E7E5DC] text-xs">
                <span className="font-semibold text-[#585B53]">Intake / Clinical Notes:</span>
                <p className="text-[#252923] mt-1">{selectedAppointment.notes}</p>
              </div>
            )}

            {/* Quick Status Control Buttons */}
            <div className="pt-2 border-t border-[#E7E5DC] space-y-2">
              <span className="text-xs font-semibold text-[#585B53]">Update Status:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-md font-medium hover:bg-emerald-800"
                >
                  Mark Confirmed
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed', 'paid')}
                  className="px-3 py-1.5 bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800"
                >
                  Mark Completed & Paid
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled', 'refunded')}
                  className="px-3 py-1.5 bg-red-700 text-white rounded-md font-medium hover:bg-red-800"
                >
                  Mark Cancelled
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'no-show')}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700"
                >
                  Mark No-Show
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Create Walk-in / Phone Booking */}
      {isWalkinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsWalkinModalOpen(false)}
              className="absolute top-4 right-4 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-serif text-2xl text-[#244B3A] font-medium">
                Record Walk-In / Phone Booking
              </h3>
              <p className="text-xs text-[#777A70]">
                Immediate reservation created directly by the Begumpet front desk concierge.
              </p>
            </div>

            {walkinError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
                {walkinError}
              </div>
            )}

            <form onSubmit={handleCreateWalkin} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#585B53] font-medium mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shalini Reddy"
                    value={walkinData.customerName}
                    onChange={(e) => setWalkinData({ ...walkinData, customerName: e.target.value })}
                    className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2 text-[#252923]"
                  />
                </div>
                <div>
                  <label className="block text-[#585B53] font-medium mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98490 12345"
                    value={walkinData.customerPhone}
                    onChange={(e) => setWalkinData({ ...walkinData, customerPhone: e.target.value })}
                    className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2 text-[#252923]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. client@example.com"
                  value={walkinData.customerEmail}
                  onChange={(e) => setWalkinData({ ...walkinData, customerEmail: e.target.value })}
                  className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2 text-[#252923]"
                />
              </div>

              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Service / Procedure *
                </label>
                <select
                  value={walkinData.serviceId}
                  onChange={(e) => setWalkinData({ ...walkinData, serviceId: e.target.value })}
                  className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2 text-[#252923]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (₹{s.priceInr.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#585B53] font-medium mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={walkinData.appointmentDate}
                    onChange={(e) => setWalkinData({ ...walkinData, appointmentDate: e.target.value })}
                    className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2 text-[#252923]"
                  />
                </div>
                <div>
                  <label className="block text-[#585B53] font-medium mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={walkinData.timeSlot}
                    onChange={(e) => setWalkinData({ ...walkinData, timeSlot: e.target.value })}
                    className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2 text-[#252923]"
                  >
                    <option>08:00 AM - 09:00 AM</option>
                    <option>09:15 AM - 10:15 AM</option>
                    <option>10:30 AM - 11:30 AM</option>
                    <option>11:45 AM - 12:45 PM</option>
                    <option>02:00 PM - 03:00 PM</option>
                    <option>03:15 PM - 04:15 PM</option>
                    <option>04:30 PM - 05:30 PM</option>
                    <option>05:45 PM - 06:45 PM</option>
                    <option>07:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Payment Status
                </label>
                <select
                  value={walkinData.paymentStatus}
                  onChange={(e) => setWalkinData({ ...walkinData, paymentStatus: e.target.value })}
                  className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2 text-[#252923]"
                >
                  <option value="paid">Paid (Collected at desk)</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingWalkin}
                  className="w-full py-3 bg-[#244B3A] hover:bg-[#1a372a] text-white font-semibold uppercase tracking-wider rounded-lg transition-smooth disabled:opacity-50"
                >
                  {isSubmittingWalkin ? 'Recording...' : 'Confirm Walk-In Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
