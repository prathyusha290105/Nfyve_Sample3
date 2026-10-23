import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { 
  Customer, 
  CallLog, 
  FollowUp, 
  Appointment, 
  Service, 
  Staff, 
  RoomId, 
  ROOMS,
  LeadSource,
  CallOutcome 
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { 
  Headphones, 
  UserPlus, 
  PhoneCall, 
  CalendarClock, 
  ClockAlert, 
  CalendarCheck, 
  Search, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Phone, 
  User, 
  Calendar, 
  MessageSquare,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export const CallCenterOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);

  // Modals & Drawers
  const [isNewProspectOpen, setIsNewProspectOpen] = useState(false);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [isBookApptOpen, setIsBookApptOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  // New Prospect Form State
  const [prospectName, setProspectName] = useState('');
  const [prospectPhone, setProspectPhone] = useState('+91 ');
  const [prospectEmail, setProspectEmail] = useState('');
  const [prospectSource, setProspectSource] = useState<LeadSource>('Instagram');
  const [prospectServiceId, setProspectServiceId] = useState('');
  const [prospectRemarks, setProspectRemarks] = useState('');
  const [prospectFollowUpDate, setProspectFollowUpDate] = useState('2026-10-02');
  const [phoneWarning, setPhoneWarning] = useState<Customer | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Log Call Form State
  const [callOutcome, setCallOutcome] = useState<CallOutcome>('interested');
  const [callRemarks, setCallRemarks] = useState('');
  const [callNextAction, setCallNextAction] = useState('');
  const [callFollowUpDate, setCallFollowUpDate] = useState('');

  // Book Appointment Form State
  const [apptServiceId, setApptServiceId] = useState('');
  const [apptStaffId, setApptStaffId] = useState('');
  const [apptRoom, setApptRoom] = useState<RoomId>('Consult 1');
  const [apptDate, setApptDate] = useState('2026-10-02');
  const [apptTimeSlot, setApptTimeSlot] = useState('10:30 AM - 11:30 AM');
  const [apptNotes, setApptNotes] = useState('');
  const [bookingConflictError, setBookingConflictError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [custs, calls, flws, apts, srvs, stf] = await Promise.all([
        api.getCustomers(),
        api.getCallLogs(),
        api.getFollowUps(),
        api.getAppointments({ date: '2026-10-02' }),
        api.getServices(),
        api.getStaff()
      ]);
      setCustomers(custs);
      setCallLogs(calls);
      setFollowUps(flws);
      setAppointments(apts);
      setServices(srvs);
      setStaffList(stf);
      if (srvs.length > 0) {
        setProspectServiceId(srvs[0].id);
        setApptServiceId(srvs[0].id);
      }
      if (stf.length > 0) {
        setApptStaffId(stf[0].id);
      }
    } catch (err) {
      console.error('Error loading Call Center dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Phone deduplication check
  const handlePhoneChange = async (val: string) => {
    setProspectPhone(val);
    setPhoneWarning(null);
    if (val.replace(/[\s\-\(\)]/g, '').length >= 10) {
      try {
        const res = await api.searchCustomerPhone(val);
        if (res.exists && res.customer) {
          setPhoneWarning(res.customer);
        }
      } catch (err) {
        // quiet error
      }
    }
  };

  const handleGlobalSearch = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    const q = val.toLowerCase();
    const matches = customers.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q)
    );
    setSearchResults(matches);
  };

  const handleCreateProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!prospectName.trim() || !prospectPhone.trim() || prospectPhone.trim() === '+91') {
      setFormError('Customer name and a valid phone number are required.');
      return;
    }

    const selectedSrv = services.find(s => s.id === prospectServiceId);

    try {
      const res = await api.createCustomer({
        name: prospectName.trim(),
        phone: prospectPhone.trim(),
        email: prospectEmail.trim() || undefined,
        leadSource: prospectSource,
        lifecycleStatus: 'new_prospect',
        assignedEmployeeId: user?.id,
        assignedEmployeeName: user?.name,
        interestedServiceId: selectedSrv?.id,
        interestedServiceName: selectedSrv?.name,
        initialRemarks: prospectRemarks.trim(),
      });

      // If follow-up date requested, create callback
      if (prospectFollowUpDate) {
        await api.createFollowUp({
          customerId: res.customer.id,
          customerName: res.customer.name,
          customerPhone: res.customer.phone,
          type: 'prospect',
          dueDate: prospectFollowUpDate,
          dueTime: '11:00 AM',
          reason: prospectRemarks || 'Initial enquiry follow-up',
        });
      }

      setFormSuccess(`Prospect ${res.customer.name} (${res.customer.id}) created successfully.`);
      // Reset form
      setProspectName('');
      setProspectPhone('+91 ');
      setProspectEmail('');
      setProspectRemarks('');
      setPhoneWarning(null);
      loadData();
      setTimeout(() => setIsNewProspectOpen(false), 1200);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create prospect.');
    }
  };

  const handleSaveCallLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      await api.createCallLog({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        outcome: callOutcome,
        remarks: callRemarks,
        nextAction: callNextAction,
        followUpDate: callFollowUpDate || undefined
      });

      setIsLogCallOpen(false);
      setCallRemarks('');
      setCallNextAction('');
      setCallFollowUpDate('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record call log.');
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setBookingConflictError('');

    const srv = services.find(s => s.id === apptServiceId);
    const staff = staffList.find(s => s.id === apptStaffId);

    try {
      await api.createAppointment({
        customerId: selectedCustomer.id,
        userId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerEmail: selectedCustomer.email,
        serviceId: srv?.id || 'srv-1',
        serviceName: srv?.name || 'Sanctuary Care',
        categoryName: srv?.categoryName || 'General Wellness',
        staffId: staff?.id || 'st-1',
        staffName: staff?.name || 'Specialist',
        room: apptRoom,
        appointmentDate: apptDate,
        timeSlot: apptTimeSlot,
        durationMins: srv?.durationMins || 60,
        bookingChannel: 'Phone Call',
        notes: apptNotes || 'Booked via Call Center',
        amountInr: srv?.priceInr || 3500,
        status: 'confirmed'
      });

      setIsBookApptOpen(false);
      setApptNotes('');
      loadData();
      alert(`Appointment successfully confirmed in ${apptRoom} for ${selectedCustomer.name}! Immediately synchronized with Front Desk.`);
    } catch (err: any) {
      setBookingConflictError(err.message || 'Booking conflict detected for the selected room or specialist.');
    }
  };

  // KPIs
  const todayStr = '2026-10-02';
  const newLeadsToday = customers.filter(c => c.createdAt.startsWith(todayStr)).length;
  const callsToday = callLogs.filter(c => c.dateTime.startsWith(todayStr)).length;
  const callbacksDueToday = followUps.filter(f => f.dueDate === todayStr && f.status === 'pending').length;
  const overdueCallbacks = followUps.filter(f => f.dueDate < todayStr && f.status === 'pending').length;
  const apptsBookedToday = appointments.filter(a => a.bookingChannel === 'Phone Call').length;
  const leadsAwaitingDecision = customers.filter(c => c.lifecycleStatus === 'followup_required' || c.lifecycleStatus === 'contacted').length;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1E3B2E]">
            <Headphones className="w-4 h-4" />
            <span>Call Center Command</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#252923]">
            Client Enquiries & Callbacks
          </h1>
          <p className="text-xs text-[#777A70]">
            Log inbound/outbound calls, schedule callbacks, and confirm doctor-approved appointments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewProspectOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3B2E] text-white rounded-xl text-xs font-semibold hover:bg-[#2A5140] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Prospect</span>
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#777A70] absolute left-3.5" />
          <input
            type="text"
            placeholder="Search prospects & clients by name, phone number (+91...), or ID (e.g. CUST-1001)..."
            value={searchQuery}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#DDD9CE] rounded-xl text-xs shadow-2xs focus:outline-none focus:border-[#1E3B2E] transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="absolute right-3 text-xs text-[#777A70] hover:text-[#252923]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#E7E5DC] z-30 max-h-72 overflow-y-auto divide-y divide-[#F0EEE5]">
            {searchResults.map(c => (
              <div 
                key={c.id} 
                className="p-3.5 hover:bg-[#FAF9F5] flex items-center justify-between cursor-pointer transition-colors"
                onClick={() => { setActive360CustomerId(c.id); setSearchResults([]); }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#1E3B2E]">{c.name}</span>
                    <span className="text-[10px] text-[#777A70]">({c.id})</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6EEE7] text-[#1E3B2E] font-medium">
                      {c.lifecycleStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#585B53] flex items-center gap-3 mt-0.5">
                    <span>{c.phone}</span>
                    <span>· Lead: {c.leadSource}</span>
                    {c.interestedServiceName && <span>· Interested: {c.interestedServiceName}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); setIsLogCallOpen(true); }}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#F0EEE5] text-[#1E3B2E] rounded hover:bg-[#E5E2D6]"
                  >
                    Log Call
                  </button>
                  <ChevronRight className="w-4 h-4 text-[#777A70]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6 Key Operational KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777A70] font-semibold">New Leads Today</span>
          <p className="text-2xl font-serif font-bold text-[#1E3B2E]">{newLeadsToday}</p>
          <span className="text-[10px] text-emerald-700">Enquiries recorded</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777A70] font-semibold">Calls Logged</span>
          <p className="text-2xl font-serif font-bold text-[#1E3B2E]">{callsToday}</p>
          <span className="text-[10px] text-[#777A70]">Today's call outcomes</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777A70] font-semibold">Callbacks Due Today</span>
          <p className="text-2xl font-serif font-bold text-amber-700">{callbacksDueToday}</p>
          <Link to="/call-center/follow-ups?tab=today" className="text-[10px] text-amber-800 font-semibold hover:underline">
            View queue →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777A70] font-semibold">Overdue Callbacks</span>
          <p className="text-2xl font-serif font-bold text-rose-700">{overdueCallbacks}</p>
          <Link to="/call-center/follow-ups?tab=overdue" className="text-[10px] text-rose-800 font-semibold hover:underline">
            Needs attention →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777A70] font-semibold">Appts Booked</span>
          <p className="text-2xl font-serif font-bold text-[#1E3B2E]">{apptsBookedToday}</p>
          <span className="text-[10px] text-[#777A70]">Via phone channel</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#777A70] font-semibold">Awaiting Decision</span>
          <p className="text-2xl font-serif font-bold text-[#1E3B2E]">{leadsAwaitingDecision}</p>
          <span className="text-[10px] text-[#777A70]">In follow-up funnel</span>
        </div>
      </div>

      {/* Main Split Sections: Today's High Priority Callbacks & Recent Prospects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Today's & Overdue Follow-ups */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium text-[#252923]">
              Active Callback Queue
            </h2>
            <Link to="/call-center/follow-ups" className="text-xs font-semibold text-[#1E3B2E] hover:underline">
              View All ({followUps.filter(f => f.status === 'pending').length})
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs divide-y divide-[#F0EEE5]">
            {followUps.filter(f => f.status === 'pending').slice(0, 5).map(flw => (
              <div key={flw.id} className="p-4 hover:bg-[#FAF9F5] transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#1E3B2E]">{flw.customerName}</span>
                    <a href={`tel:${flw.customerPhone}`} className="text-xs text-[#585B53] font-medium hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#1E3B2E]" />
                      <span>{flw.customerPhone}</span>
                    </a>
                    {flw.dueDate < todayStr && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-rose-100 text-rose-800">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#585B53]">{flw.reason}</p>
                  <p className="text-[11px] text-[#777A70]">
                    Due: <strong className="text-[#252923]">{flw.dueDate}</strong> at {flw.dueTime || '11:00 AM'} · Assigned: {flw.assignedEmployeeName}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const cust = customers.find(c => c.id === flw.customerId);
                      if (cust) setSelectedCustomer(cust);
                      setIsLogCallOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#1E3B2E] text-white rounded-lg text-xs font-semibold hover:bg-[#2A5140] transition-colors"
                  >
                    Call & Log
                  </button>
                  <button
                    onClick={() => setActive360CustomerId(flw.customerId)}
                    className="p-1.5 text-[#777A70] hover:text-[#1E3B2E] hover:bg-[#F0EEE5] rounded-lg"
                    title="View 360 Dossier"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {followUps.filter(f => f.status === 'pending').length === 0 && (
              <div className="p-8 text-center text-xs text-[#777A70]">
                All callbacks completed! No pending follow-ups in queue.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Prospects & Quick Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium text-[#252923]">
              Recent Prospects
            </h2>
            <Link to="/call-center/prospects" className="text-xs font-semibold text-[#1E3B2E] hover:underline">
              View All ({customers.length})
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs divide-y divide-[#F0EEE5]">
            {customers.slice(0, 5).map(c => (
              <div key={c.id} className="p-4 hover:bg-[#FAF9F5] transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#1E3B2E]">{c.name}</span>
                    <span className="text-[10px] text-[#777A70]">{c.id}</span>
                  </div>
                  <p className="text-[11px] text-[#585B53] mt-0.5">
                    {c.phone} · <span className="text-[#1E3B2E] font-medium">{c.leadSource}</span>
                  </p>
                  {c.interestedServiceName && (
                    <p className="text-[10px] text-[#777A70] truncate max-w-[200px]">{c.interestedServiceName}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setSelectedCustomer(c); setIsBookApptOpen(true); }}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-[#E6EEE7] text-[#1E3B2E] rounded-md hover:bg-[#D5E2D7] transition-colors"
                  >
                    Book
                  </button>
                  <button
                    onClick={() => setActive360CustomerId(c.id)}
                    className="p-1 text-[#777A70] hover:text-[#1E3B2E]"
                    title="View 360 Dossier"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL 1: NEW PROSPECT */}
      {isNewProspectOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#1E3B2E]">Register New Prospect</h3>
              <button onClick={() => setIsNewProspectOpen(false)} className="text-[#777A70] hover:text-[#252923]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Deduplication Warning */}
            {phoneWarning && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Existing Record Detected!</span>
                </div>
                <p>
                  A customer with this phone number already exists: <strong>{phoneWarning.name}</strong> ({phoneWarning.id}).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewProspectOpen(false);
                    setActive360CustomerId(phoneWarning.id);
                  }}
                  className="px-3 py-1.5 bg-amber-800 text-white rounded font-medium text-[11px] hover:bg-amber-900"
                >
                  Open Existing Customer Dossier
                </button>
              </div>
            )}

            <form onSubmit={handleCreateProspect} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252923] mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Sharma"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg focus:outline-none focus:border-[#1E3B2E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98490XXXXX"
                    value={prospectPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg focus:outline-none focus:border-[#1E3B2E]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={prospectEmail}
                    onChange={(e) => setProspectEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg focus:outline-none focus:border-[#1E3B2E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Lead Source</label>
                  <select
                    value={prospectSource}
                    onChange={(e) => setProspectSource(e.target.value as LeadSource)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg focus:outline-none focus:border-[#1E3B2E]"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Google">Google Search</option>
                    <option value="Referral">Client Referral</option>
                    <option value="Walk-in">Walk-in Inquiry</option>
                    <option value="Website">Marketing Portal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Interested Discipline</label>
                  <select
                    value={prospectServiceId}
                    onChange={(e) => setProspectServiceId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg focus:outline-none focus:border-[#1E3B2E]"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Initial Remarks / Concern</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Inquired about hyperpigmentation facial; requested price list."
                  value={prospectRemarks}
                  onChange={(e) => setProspectRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg focus:outline-none focus:border-[#1E3B2E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Schedule Follow-up Date (Optional)</label>
                <input
                  type="date"
                  value={prospectFollowUpDate}
                  onChange={(e) => setProspectFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg focus:outline-none focus:border-[#1E3B2E]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewProspectOpen(false)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53] hover:bg-[#F0EEE5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140]"
                >
                  Register Prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD CALL OUTCOME */}
      {isLogCallOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#1E3B2E]">Record Call Outcome</h3>
                <p className="text-xs text-[#777A70]">{selectedCustomer.name} ({selectedCustomer.phone})</p>
              </div>
              <button onClick={() => setIsLogCallOpen(false)} className="text-[#777A70] hover:text-[#252923]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCallLog} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252923] mb-1">Call Outcome *</label>
                <select
                  value={callOutcome}
                  onChange={(e) => setCallOutcome(e.target.value as CallOutcome)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg font-medium"
                >
                  <option value="interested">Interested — Follow-up Required</option>
                  <option value="appointment_confirmed">Appointment Confirmed</option>
                  <option value="callback_requested">Callback Requested</option>
                  <option value="no_answer">No Answer</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="invalid_number">Invalid Number</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Call Remarks & Summary *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail client conversation points, preferences, and objections..."
                  value={callRemarks}
                  onChange={(e) => setCallRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Next Action</label>
                <input
                  type="text"
                  placeholder="e.g. Dispatch WhatsApp brochure / callback tomorrow morning"
                  value={callNextAction}
                  onChange={(e) => setCallNextAction(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Schedule Follow-up Date (If applicable)</label>
                <input
                  type="date"
                  value={callFollowUpDate}
                  onChange={(e) => setCallFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogCallOpen(false)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140]"
                >
                  Save Call Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BOOK INTERNAL APPOINTMENT */}
      {isBookApptOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#1E3B2E]">Book Phone Appointment</h3>
                <p className="text-xs text-[#777A70]">{selectedCustomer.name} · {selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setIsBookApptOpen(false)} className="text-[#777A70] hover:text-[#252923]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingConflictError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingConflictError}</span>
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252923] mb-1">Service Protocol *</label>
                <select
                  value={apptServiceId}
                  onChange={(e) => setApptServiceId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (₹{s.priceInr})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Sanctuary Room *</label>
                  <select
                    value={apptRoom}
                    onChange={(e) => setApptRoom(e.target.value as RoomId)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg font-medium"
                  >
                    {ROOMS.map(r => (
                      <option key={r.id} value={r.id}>{r.name} — {r.type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Assigned Specialist *</label>
                  <select
                    value={apptStaffId}
                    onChange={(e) => setApptStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  >
                    {staffList.map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.roleTitle})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Time Slot *</label>
                  <select
                    value={apptTimeSlot}
                    onChange={(e) => setApptTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  >
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:30 AM - 11:30 AM">10:30 AM - 11:30 AM</option>
                    <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                    <option value="02:30 PM - 03:30 PM">02:30 PM - 03:30 PM</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                    <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes from customer phone conversation..."
                  value={apptNotes}
                  onChange={(e) => setApptNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookApptOpen(false)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140]"
                >
                  Confirm & Reserve Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER 360 DRAWER */}
      <Customer360Drawer
        customerId={active360CustomerId}
        onClose={() => setActive360CustomerId(null)}
        onBookAppointment={(cust) => {
          setSelectedCustomer(cust);
          setIsBookApptOpen(true);
        }}
        onLogCall={(cust) => {
          setSelectedCustomer(cust);
          setIsLogCallOpen(true);
        }}
      />

    </div>
  );
};
