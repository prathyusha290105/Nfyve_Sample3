import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Customer, Service, Staff, RoomId, ROOMS } from '../../types';
import { 
  UserPlus, 
  Search, 
  Phone, 
  User, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const FrontDeskWalkInPage: React.FC = () => {
  const navigate = useNavigate();
  const [phoneSearch, setPhoneSearch] = useState('');
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+91 ');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomId>('Consult 1');
  const [appointmentDate, setAppointmentDate] = useState('2026-10-02');
  const [timeSlot, setTimeSlot] = useState('10:30 AM - 11:30 AM');
  const [isImmediate, setIsImmediate] = useState(true);
  const [notes, setNotes] = useState('');

  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    Promise.all([api.getServices(), api.getStaff()])
      .then(([srvs, stf]) => {
        setServices(srvs);
        setStaffList(stf);
        if (srvs.length > 0) setSelectedServiceId(srvs[0].id);
        if (stf.length > 0) setSelectedStaffId(stf[0].id);
      })
      .catch(console.error);
  }, []);

  const handleSearchPhone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneSearch.trim() || phoneSearch.trim() === '+91') return;

    setIsSearching(true);
    setFormError('');
    try {
      const res = await api.searchCustomerPhone(phoneSearch);
      if (res.exists && res.customer) {
        setExistingCustomer(res.customer);
        setCustomerName(res.customer.name);
        setCustomerPhone(res.customer.phone);
        if (res.customer.email) setCustomerEmail(res.customer.email);
        if (res.customer.interestedServiceId) setSelectedServiceId(res.customer.interestedServiceId);
      } else {
        setExistingCustomer(null);
        setCustomerPhone(phoneSearch);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error checking phone record.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegisterAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!customerName.trim() || !customerPhone.trim() || customerPhone.trim() === '+91') {
      setFormError('Customer name and valid phone number are required.');
      return;
    }

    const srv = services.find(s => s.id === selectedServiceId);
    const stf = staffList.find(s => s.id === selectedStaffId);

    try {
      let targetCustomer = existingCustomer;

      // 1. If new customer, register them first
      if (!targetCustomer) {
        const custRes = await api.createCustomer({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim() || undefined,
          leadSource: 'Walk-in',
          lifecycleStatus: 'appointment_confirmed',
          interestedServiceId: srv?.id,
          interestedServiceName: srv?.name,
          initialRemarks: notes || 'Front desk walk-in registration',
        });
        targetCustomer = custRes.customer;
      }

      // 2. Book appointment with room & staff overlap prevention
      const initialStatus = isImmediate ? 'checked_in' : 'confirmed';

      const aptRes = await api.createAppointment({
        customerId: targetCustomer.id,
        userId: targetCustomer.id,
        customerName: targetCustomer.name,
        customerPhone: targetCustomer.phone,
        customerEmail: targetCustomer.email,
        serviceId: srv?.id || 'srv-1',
        serviceName: srv?.name || 'Sanctuary Care',
        categoryName: srv?.categoryName || 'General Wellness',
        staffId: stf?.id || 'st-1',
        staffName: stf?.name || 'Specialist',
        room: selectedRoom,
        appointmentDate,
        timeSlot,
        durationMins: srv?.durationMins || 60,
        bookingChannel: 'Walk-in',
        notes: notes || 'Walk-in customer arrival',
        amountInr: srv?.priceInr || 3500,
        status: initialStatus
      });

      setFormSuccess(
        `Walk-in successfully registered! ${targetCustomer.name} booked in ${selectedRoom} for ${timeSlot}. ${isImmediate ? 'Status set to Checked In.' : ''}`
      );

      setTimeout(() => {
        navigate('/front-desk');
      }, 1500);

    } catch (err: any) {
      setFormError(err.message || 'Booking conflict detected for the selected room or specialist.');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1E3B2E]">
          <UserPlus className="w-4 h-4" />
          <span>Reception Desk Workflow</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#252923]">
          Walk-in Customer Registration
        </h1>
        <p className="text-xs text-[#777A70]">
          Look up client by mobile phone to prevent duplicates. Assign room and practitioner according to real-time availability.
        </p>
      </div>

      {/* Step 1: Phone Search Lookup */}
      <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-4">
        <h2 className="font-serif text-base font-medium text-[#1E3B2E]">
          Step 1: Check Existing Client Record
        </h2>
        <form onSubmit={handleSearchPhone} className="flex gap-3">
          <div className="relative flex-1">
            <Phone className="w-4 h-4 text-[#777A70] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search phone number (e.g. +91 9849012345)..."
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl text-xs focus:outline-none focus:border-[#1E3B2E]"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-[#1E3B2E] text-white rounded-xl text-xs font-semibold hover:bg-[#2A5140] transition-colors"
          >
            {isSearching ? 'Checking...' : 'Lookup Phone'}
          </button>
        </form>

        {existingCustomer && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Existing Customer Found: {existingCustomer.name} ({existingCustomer.id})</span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1">
                {existingCustomer.phone} · Lifecycle: {existingCustomer.lifecycleStatus} · Completed treatments: {existingCustomer.completedTreatments || 0}
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-semibold uppercase">
              Auto-Populated
            </span>
          </div>
        )}
      </div>

      {/* Step 2: Customer & Booking Form */}
      <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-4">
        <h2 className="font-serif text-base font-medium text-[#1E3B2E]">
          Step 2: Walk-in Details & Room Allocation
        </h2>

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

        <form onSubmit={handleRegisterAndBook} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#252923] mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                placeholder="Client Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#252923] mb-1">Mobile Contact *</label>
              <input
                type="text"
                required
                placeholder="+91 98490XXXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#252923] mb-1">Email (Optional)</label>
              <input
                type="email"
                placeholder="client@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#252923] mb-1">Interested Service Protocol *</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (₹{s.priceInr})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Room Resource & Specialist Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC]">
            <div>
              <label className="block font-semibold text-[#1E3B2E] mb-1">Sanctuary Room *</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value as RoomId)}
                className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg font-medium"
              >
                {ROOMS.map(r => (
                  <option key={r.id} value={r.id}>{r.displayName} — {r.type}</option>
                ))}
              </select>
              <span className="text-[10px] text-[#777A70] mt-1 block">5 scheduling resources managed</span>
            </div>

            <div>
              <label className="block font-semibold text-[#1E3B2E] mb-1">Assigned Specialist *</label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
              >
                {staffList.map(st => (
                  <option key={st.id} value={st.id}>{st.name} ({st.roleTitle})</option>
                ))}
              </select>
              <span className="text-[10px] text-[#777A70] mt-1 block">Checked against practitioner calendar</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#252923] mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#252923] mb-1">Time Slot *</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg font-medium"
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
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#252923]">
              <input
                type="checkbox"
                checked={isImmediate}
                onChange={(e) => setIsImmediate(e.target.checked)}
                className="rounded text-[#1E3B2E]"
              />
              <span>Client is present at reception right now (Check In Immediately)</span>
            </label>
          </div>

          <div>
            <label className="block font-semibold text-[#252923] mb-1">Desk Remarks / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Walked in for facial consultation, interested in skin barrier package..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/front-desk')}
              className="px-5 py-2.5 border border-[#DDD9CE] rounded-xl text-[#585B53] font-medium hover:bg-[#F0EEE5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1E3B2E] text-white rounded-xl font-semibold hover:bg-[#2A5140] transition-colors shadow-sm"
            >
              Register & Reserve Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
