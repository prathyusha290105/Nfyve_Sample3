import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { Appointment, Service, Staff, ServiceCategory, AppointmentStatus, PaymentStatus } from '../../types';
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
  AlertCircle,
  IndianRupee,
  UserCheck,
  CalendarCheck,
  Trash2,
  FileText,
  History,
  ArrowUpDown
} from 'lucide-react';

interface AuditLogEntry {
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

export const AdminAppointmentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>(searchParams.get('staffId') || 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'fee_desc' | 'fee_asc' | 'name_asc'>('date_desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modals & Drawers
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState<boolean>(searchParams.get('action') === 'walkin');
  const [reassignModalApt, setReassignModalApt] = useState<Appointment | null>(null);
  const [selectedNewStaffId, setSelectedNewStaffId] = useState<string>('');
  const [rescheduleModalApt, setRescheduleModalApt] = useState<Appointment | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState<string>('');
  const [newRescheduleSlot, setNewRescheduleSlot] = useState<string>('11:00 AM - 12:00 PM');
  const [cancellingApt, setCancellingApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Local Audit Logs for appointments (persisted in session)
  const [auditLogs, setAuditLogs] = useState<Record<string, AuditLogEntry[]>>({});

  // Walk-in form state
  const [walkinData, setWalkinData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    serviceId: '',
    staffId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '11:00 AM - 12:00 PM',
    paymentStatus: 'paid',
    notes: 'Walk-in booking created at Begumpet sanctuary reception desk',
  });
  const [walkinError, setWalkinError] = useState('');
  const [isSubmittingWalkin, setIsSubmittingWalkin] = useState(false);

  const addAuditLog = (aptId: string, action: string, details: string) => {
    const entry: AuditLogEntry = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      actor: 'Admin Console',
      details,
    };
    setAuditLogs(prev => ({
      ...prev,
      [aptId]: [entry, ...(prev[aptId] || [])]
    }));
  };

  const loadData = () => {
    setIsLoading(true);
    let start: string | undefined = undefined;
    let end: string | undefined = undefined;

    if (dateFilter === 'today') {
      start = '2026-10-02';
      end = '2026-10-02';
    } else if (dateFilter === 'tomorrow') {
      start = '2026-10-03';
      end = '2026-10-03';
    } else if (dateFilter === 'custom') {
      start = customStart || undefined;
      end = customEnd || undefined;
    }

    Promise.all([
      api.getAdminAppointments({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        staffId: staffFilter !== 'all' ? staffFilter : undefined,
        startDate: start,
        endDate: end,
      }),
      api.getServices(),
      api.getCategories(),
      api.getAdminStaff()
    ])
      .then(([apts, srvs, cats, stf]) => {
        setAppointments(apts);
        setServices(srvs);
        setCategories(cats);
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
  }, [statusFilter, categoryFilter, staffFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus, newPayment?: PaymentStatus) => {
    try {
      await api.updateAppointmentStatus(id, { 
        status: newStatus,
        paymentStatus: newPayment
      });
      addAuditLog(id, `Status set to ${newStatus}`, newPayment ? `Payment status set to ${newPayment}` : 'Status modified');
      setToastMessage(`Appointment updated to ${newStatus}`);
      setTimeout(() => setToastMessage(''), 4000);
      loadData();
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment(prev => prev ? { 
          ...prev, 
          status: newStatus, 
          paymentStatus: newPayment || prev.paymentStatus 
        } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleReassignStaff = async () => {
    if (!reassignModalApt || !selectedNewStaffId) return;
    try {
      await api.reassignAppointment(reassignModalApt.id, selectedNewStaffId);
      const staffMember = staffList.find(s => s.id === selectedNewStaffId);
      addAuditLog(reassignModalApt.id, 'Specialist Reassigned', `Reassigned to ${staffMember?.name || selectedNewStaffId}`);
      setToastMessage(`Reassigned to ${staffMember?.name}`);
      setTimeout(() => setToastMessage(''), 4000);
      setReassignModalApt(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Reassignment failed.');
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleModalApt || !newRescheduleDate || !newRescheduleSlot) {
      alert('Please select both date and time slot.');
      return;
    }
    try {
      await api.rescheduleAppointment(rescheduleModalApt.id, newRescheduleDate, newRescheduleSlot);
      addAuditLog(rescheduleModalApt.id, 'Rescheduled', `Rescheduled to ${newRescheduleDate} at ${newRescheduleSlot}`);
      setToastMessage(`Rescheduled to ${newRescheduleDate} (${newRescheduleSlot})`);
      setTimeout(() => setToastMessage(''), 4000);
      setRescheduleModalApt(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Rescheduling failed.');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingApt) return;
    try {
      await api.updateAppointmentStatus(cancellingApt.id, {
        status: 'cancelled',
        paymentStatus: cancellingApt.paymentStatus === 'paid' ? 'refunded' : 'pending',
        notes: cancelReason ? `${cancellingApt.notes || ''} [Cancellation reason: ${cancelReason}]` : cancellingApt.notes,
      });
      addAuditLog(cancellingApt.id, 'Appointment Cancelled', cancelReason || 'Cancelled by administrator');
      setToastMessage(`Appointment ${cancellingApt.bookingRef} cancelled`);
      setTimeout(() => setToastMessage(''), 4000);
      setCancellingApt(null);
      setCancelReason('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Cancellation failed.');
    }
  };

  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinData.customerName || !walkinData.customerPhone || !walkinData.serviceId) {
      setWalkinError('Please enter client name, contact phone, and select treatment.');
      return;
    }

    setIsSubmittingWalkin(true);
    setWalkinError('');

    try {
      const res = await api.createWalkInBooking(walkinData);
      addAuditLog(res.appointment.id, 'Walk-In Created', `Walk-in client ${walkinData.customerName} booked for ${res.appointment.serviceName}`);
      setIsWalkinModalOpen(false);
      setWalkinData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        serviceId: services[0]?.id || '',
        staffId: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: '11:00 AM - 12:00 PM',
        paymentStatus: 'paid',
        notes: 'Walk-in booking created at Begumpet sanctuary reception desk',
      });
      setToastMessage('Walk-in booking created and confirmed successfully!');
      setTimeout(() => setToastMessage(''), 4000);
      loadData();
    } catch (err: any) {
      setWalkinError(err.message || 'Failed to create walk-in booking.');
    } finally {
      setIsSubmittingWalkin(false);
    }
  };

  // Filter by payment status if chosen
  let filteredAppointments = appointments;
  if (paymentFilter !== 'all') {
    filteredAppointments = filteredAppointments.filter(a => a.paymentStatus === paymentFilter);
  }

  // Sorting
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === 'date_desc') return b.appointmentDate.localeCompare(a.appointmentDate);
    if (sortBy === 'date_asc') return a.appointmentDate.localeCompare(b.appointmentDate);
    if (sortBy === 'fee_desc') return b.amountInr - a.amountInr;
    if (sortBy === 'fee_asc') return a.amountInr - b.amountInr;
    if (sortBy === 'name_asc') return a.customerName.localeCompare(b.customerName);
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage) || 1;
  const paginatedAppointments = sortedAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-4">
        <div>
          <h1 className="font-serif text-3xl text-[#214D3B] font-bold tracking-tight">
            Appointments Management Register
          </h1>
          <p className="text-xs text-[#585B53] mt-0.5">
            Full administrative control: schedule, reassign practitioners, reschedule, record payments, and audit treatment intake.
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#214D3B] hover:bg-[#1a3e2f] text-white text-xs font-semibold rounded-lg shadow-xs transition-smooth"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>+ Walk-In / Phone Booking</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Multi-Dimensional Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-xs space-y-3">
        
        {/* Search row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-[#777A70] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by client name, reference ID (NF-2026-XXXX), phone, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
            />
          </form>

          {/* Sort By */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#777A70]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-3 py-2 text-xs text-[#252923] font-medium focus:outline-none focus:border-[#214D3B]"
            >
              <option value="date_desc">Sort: Date (Newest)</option>
              <option value="date_asc">Sort: Date (Oldest)</option>
              <option value="fee_desc">Sort: Fee (High to Low)</option>
              <option value="fee_asc">Sort: Fee (Low to High)</option>
              <option value="name_asc">Sort: Client Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filters Row: Date, Staff, Category, Status, Payment */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-[#F0EEE5] text-xs">
          
          {/* Date Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-[#777A70] mb-0.5">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-2.5 py-1.5 text-xs text-[#252923] font-medium"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Staff Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-[#777A70] mb-0.5">Specialist</label>
            <select
              value={staffFilter}
              onChange={(e) => {
                setStaffFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-2.5 py-1.5 text-xs text-[#252923] font-medium"
            >
              <option value="all">All Specialists ({staffList.length})</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>

          {/* Pillar / Category Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-[#777A70] mb-0.5">Discipline / Pillar</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-2.5 py-1.5 text-xs text-[#252923] font-medium"
            >
              <option value="all">All Disciplines</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-[#777A70] mb-0.5">Appointment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-2.5 py-1.5 text-xs text-[#252923] font-medium"
            >
              <option value="all">All Statuses ({appointments.length})</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-Show</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-[#777A70] mb-0.5">Payment Status</label>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-2.5 py-1.5 text-xs text-[#252923] font-medium"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

        </div>

        {/* Custom date range picker if custom selected */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-[#F0EEE5] text-xs">
            <span className="text-[#777A70]">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded text-xs"
            />
            <span className="text-[#777A70]">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded text-xs"
            />
            <button
              onClick={loadData}
              className="px-3 py-1 bg-[#214D3B] text-white font-medium rounded text-xs"
            >
              Filter
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
                <th className="py-3 px-3.5 font-semibold">Assigned Specialist</th>
                <th className="py-3 px-3.5 font-semibold">Fee & Payment</th>
                <th className="py-3 px-3.5 font-semibold">Status</th>
                <th className="py-3 px-3.5 font-semibold text-right">Quick Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#777A70]">
                    No appointment records matching the specified filters.
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((apt) => (
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

                    <td className="py-3.5 px-3.5 text-[#585B53]">
                      <span className="font-medium text-[#252923] block">{apt.staffName || 'Concierge Assigned'}</span>
                      <button
                        onClick={() => {
                          setReassignModalApt(apt);
                          setSelectedNewStaffId(apt.staffId || staffList[0]?.id || '');
                        }}
                        className="text-[10px] text-[#2E6B50] font-medium hover:underline inline-flex items-center gap-0.5 mt-0.5"
                      >
                        <UserCheck className="w-3 h-3 text-[#D4AF37]" />
                        <span>Reassign</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-3.5 tabular-nums">
                      <span className="font-bold text-[#214D3B] font-serif">
                        ₹{apt.amountInr.toLocaleString('en-IN')}
                      </span>
                      <span className={`block text-[10px] font-semibold uppercase tracking-wider ${
                        apt.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
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

                    <td className="py-3.5 px-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* View Details */}
                      <button
                        onClick={() => setSelectedAppointment(apt)}
                        className="p-1.5 text-[#585B53] hover:text-[#214D3B] hover:bg-[#F0EEE5] rounded-md transition-colors"
                        title="View Full Appointment Dossier & Audit Trail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Reschedule */}
                      <button
                        onClick={() => {
                          setRescheduleModalApt(apt);
                          setNewRescheduleDate(apt.appointmentDate);
                          setNewRescheduleSlot(apt.timeSlot);
                        }}
                        className="p-1.5 text-[#585B53] hover:text-[#2E6B50] hover:bg-[#F0EEE5] rounded-md transition-colors"
                        title="Reschedule Date & Time"
                      >
                        <CalendarCheck className="w-4 h-4" />
                      </button>

                      {/* Confirm status */}
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium text-[11px]"
                        >
                          Confirm
                        </button>
                      )}

                      {/* Mark Completed */}
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'completed', 'paid')}
                          className="px-2.5 py-1 bg-[#214D3B] hover:bg-[#1a3e2f] text-white rounded font-medium text-[11px]"
                        >
                          Complete
                        </button>
                      )}

                      {/* Cancel destructive button with confirmation */}
                      {apt.status !== 'cancelled' && (
                        <button
                          onClick={() => setCancellingApt(apt)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Cancel Booking (Requires Confirmation)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-[#FAF9F5] border-t border-[#E7E5DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#585B53]">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedAppointments.length)} of {sortedAppointments.length} bookings
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 border border-[#DDD9CE] rounded-lg bg-white font-medium hover:bg-[#F0EEE5] disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2.5 font-semibold text-[#214D3B] tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 border border-[#DDD9CE] rounded-lg bg-white font-medium hover:bg-[#F0EEE5] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Appointment Full Dossier & Audit Trail */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-xl w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-5 right-5 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#E7E5DC] pb-4">
              <span className="text-[10px] font-mono text-[#777A70] uppercase">
                {selectedAppointment.bookingRef}
              </span>
              <h3 className="font-serif text-2xl text-[#214D3B] font-bold">
                {selectedAppointment.serviceName}
              </h3>
              <p className="text-xs text-[#2E6B50] font-semibold">{selectedAppointment.categoryName}</p>
            </div>

            {/* Client and Treatment Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-[#E7E5DC]">
              <div>
                <span className="text-[#777A70] block">Client Full Name</span>
                <p className="font-semibold text-[#252923] text-sm mt-0.5">{selectedAppointment.customerName}</p>
              </div>
              <div>
                <span className="text-[#777A70] block">Phone Contact</span>
                <p className="font-semibold text-[#252923] text-sm mt-0.5">{selectedAppointment.customerPhone}</p>
              </div>
              <div>
                <span className="text-[#777A70] block">Scheduled Date</span>
                <p className="font-medium text-[#252923] tabular-nums mt-0.5">{selectedAppointment.appointmentDate}</p>
              </div>
              <div>
                <span className="text-[#777A70] block">Time Slot</span>
                <p className="font-medium text-[#252923] tabular-nums mt-0.5">{selectedAppointment.timeSlot}</p>
              </div>
              <div>
                <span className="text-[#777A70] block">Assigned Specialist</span>
                <p className="font-semibold text-[#214D3B] mt-0.5">{selectedAppointment.staffName || 'Front Desk Assigned'}</p>
              </div>
              <div>
                <span className="text-[#777A70] block">Treatment Fee</span>
                <p className="font-bold text-[#214D3B] font-serif text-base mt-0.5">
                  ₹{selectedAppointment.amountInr.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Intake Notes */}
            {selectedAppointment.notes && (
              <div className="p-3.5 bg-white rounded-xl border border-[#E7E5DC] text-xs">
                <span className="font-semibold text-[#214D3B] block mb-1">Intake & Treatment Notes:</span>
                <p className="text-[#585B53] leading-relaxed">{selectedAppointment.notes}</p>
              </div>
            )}

            {/* Status & Payment Adjustment Buttons */}
            <div className="p-4 bg-white rounded-xl border border-[#E7E5DC] space-y-2.5 text-xs">
              <span className="font-semibold text-[#214D3B] block">Update Appointment & Payment Status:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800"
                >
                  Confirm Slot
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed', 'paid')}
                  className="px-3 py-1.5 bg-[#214D3B] text-white rounded-lg font-semibold hover:bg-[#1a3e2f]"
                >
                  Mark Completed & Paid
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled', 'refunded')}
                  className="px-3 py-1.5 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800"
                >
                  Mark Cancelled & Refund
                </button>
              </div>
            </div>

            {/* Audit Trail Section */}
            <div className="p-4 bg-white rounded-xl border border-[#E7E5DC] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#214D3B] border-b border-[#F0EEE5] pb-1.5">
                <History className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Administrative Audit Trail</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                <div className="text-[11px] text-[#585B53] flex items-center justify-between">
                  <span>Initial booking recorded</span>
                  <span className="text-[#777A70]">{selectedAppointment.createdAt.split('T')[0]}</span>
                </div>
                {(auditLogs[selectedAppointment.id] || []).map((log, idx) => (
                  <div key={idx} className="text-[11px] text-[#585B53] flex items-start justify-between border-t border-[#F0EEE5] pt-1">
                    <div>
                      <span className="font-semibold text-[#214D3B]">{log.action}: </span>
                      <span>{log.details}</span>
                    </div>
                    <span className="text-[#777A70] shrink-0 ml-2">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal 2: Reassign Specialist */}
      {reassignModalApt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-md w-full p-6 border border-[#DDD9CE] shadow-2xl relative space-y-4">
            <button
              onClick={() => setReassignModalApt(null)}
              className="absolute top-4 right-4 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#214D3B]">
              Reassign Practitioner
            </h3>
            <p className="text-xs text-[#777A70]">
              Assign a different specialist for <strong className="text-[#252923]">{reassignModalApt.customerName}</strong> ({reassignModalApt.serviceName}).
            </p>

            <div className="text-xs space-y-2">
              <label className="block font-semibold text-[#252923]">Select Practitioner:</label>
              <select
                value={selectedNewStaffId}
                onChange={(e) => setSelectedNewStaffId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
              >
                {staffList.filter(s => s.isActive).map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} — {st.roleTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-[#E7E5DC] flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setReassignModalApt(null)}
                className="px-3.5 py-1.5 border border-[#DDD9CE] rounded-lg font-semibold text-[#585B53] hover:bg-[#F0EEE5]"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignStaff}
                className="px-4 py-1.5 bg-[#214D3B] hover:bg-[#1a3e2f] text-white rounded-lg font-bold shadow-xs"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Reschedule Date & Time */}
      {rescheduleModalApt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-md w-full p-6 border border-[#DDD9CE] shadow-2xl relative space-y-4">
            <button
              onClick={() => setRescheduleModalApt(null)}
              className="absolute top-4 right-4 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#214D3B]">
              Reschedule Appointment
            </h3>
            <p className="text-xs text-[#777A70]">
              Select a new date and consultation slot for <strong className="text-[#252923]">{rescheduleModalApt.customerName}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#252923] mb-1">New Appointment Date:</label>
                <input
                  type="date"
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">New Time Slot:</label>
                <select
                  value={newRescheduleSlot}
                  onChange={(e) => setNewRescheduleSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
                >
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                  <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                  <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7E5DC] flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setRescheduleModalApt(null)}
                className="px-3.5 py-1.5 border border-[#DDD9CE] rounded-lg font-semibold text-[#585B53] hover:bg-[#F0EEE5]"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                className="px-4 py-1.5 bg-[#214D3B] hover:bg-[#1a3e2f] text-white rounded-lg font-bold shadow-xs"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Destructive Action Confirmation (Cancel Booking) */}
      {cancellingApt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-md w-full p-6 border border-red-200 shadow-2xl relative space-y-4">
            <button
              onClick={() => setCancellingApt(null)}
              className="absolute top-4 right-4 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-serif text-xl font-bold">
                Confirm Booking Cancellation
              </h3>
            </div>

            <p className="text-xs text-[#585B53] leading-relaxed">
              Are you sure you want to cancel appointment <strong className="text-[#252923]">{cancellingApt.bookingRef}</strong> for <strong className="text-[#252923]">{cancellingApt.customerName}</strong>? The reserved practitioner slot will be released back to the sanctuary pool.
            </p>

            <div className="text-xs">
              <label className="block font-semibold text-[#252923] mb-1">Reason for Cancellation:</label>
              <textarea
                rows={2}
                placeholder="Client requested cancellation, medical contraindication, no-show..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
              />
            </div>

            <div className="pt-3 border-t border-[#E7E5DC] flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setCancellingApt(null)}
                className="px-3.5 py-1.5 border border-[#DDD9CE] rounded-lg font-semibold text-[#585B53] hover:bg-[#F0EEE5]"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold shadow-xs"
              >
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Create Walk-in / Phone Booking */}
      {isWalkinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsWalkinModalOpen(false)}
              className="absolute top-5 right-5 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#E7E5DC] pb-3">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                Begumpet Sanctuary Reception Desk
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#214D3B]">
                New Walk-In / Phone Booking
              </h2>
              <p className="text-xs text-[#777A70]">
                Record immediate client arrival or telephone consultation request.
              </p>
            </div>

            {walkinError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{walkinError}</span>
              </div>
            )}

            <form onSubmit={handleCreateWalkin} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Reddy"
                    value={walkinData.customerName}
                    onChange={(e) => setWalkinData({ ...walkinData, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 90000 00000"
                    value={walkinData.customerPhone}
                    onChange={(e) => setWalkinData({ ...walkinData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={walkinData.customerEmail}
                  onChange={(e) => setWalkinData({ ...walkinData, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Select Service *</label>
                  <select
                    value={walkinData.serviceId}
                    onChange={(e) => setWalkinData({ ...walkinData, serviceId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
                  >
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name} (₹{srv.priceInr})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Assign Specialist</label>
                  <select
                    value={walkinData.staffId}
                    onChange={(e) => setWalkinData({ ...walkinData, staffId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
                  >
                    <option value="">Concierge / First Available</option>
                    {staffList.filter(s => s.isActive).map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.roleTitle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={walkinData.appointmentDate}
                    onChange={(e) => setWalkinData({ ...walkinData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Time Slot *</label>
                  <select
                    value={walkinData.timeSlot}
                    onChange={(e) => setWalkinData({ ...walkinData, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
                  >
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                    <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                    <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Payment Status</label>
                <select
                  value={walkinData.paymentStatus}
                  onChange={(e) => setWalkinData({ ...walkinData, paymentStatus: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
                >
                  <option value="paid">Paid (Collected at Desk)</option>
                  <option value="pending">Pending (Pay Post-Treatment)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Intake Notes</label>
                <textarea
                  rows={2}
                  value={walkinData.notes}
                  onChange={(e) => setWalkinData({ ...walkinData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E7E5DC] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWalkinModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg font-semibold text-[#585B53] hover:bg-[#F0EEE5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWalkin}
                  className="px-5 py-2 bg-[#214D3B] hover:bg-[#1a3e2f] text-white rounded-lg font-bold shadow-xs disabled:opacity-50"
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
