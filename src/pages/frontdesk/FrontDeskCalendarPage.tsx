import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { RoomCalendar } from '../../components/calendar/RoomCalendar';
import { Appointment, RoomId, ROOMS, Service, Staff } from '../../types';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { 
  Calendar as CalendarIcon, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Clock, 
  Building2, 
  RotateCcw,
  Ban
} from 'lucide-react';

export const FrontDeskCalendarPage: React.FC = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);
  
  // Booking modal for slot click
  const [isSlotBookingOpen, setIsSlotBookingOpen] = useState(false);
  const [slotRoom, setSlotRoom] = useState<RoomId>('Consult 1');
  const [slotTime, setSlotTime] = useState('10:30 AM - 11:30 AM');
  const [slotDate, setSlotDate] = useState('2026-10-02');
  const [slotClientPhone, setSlotClientPhone] = useState('');
  const [slotClientName, setSlotClientName] = useState('');
  const [slotServiceId, setSlotServiceId] = useState('');
  const [slotStaffId, setSlotStaffId] = useState('');
  const [slotNotes, setSlotNotes] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [conflictError, setConflictError] = useState('');

  // Reschedule & Cancel States
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('2026-10-03');
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState('10:30 AM - 11:30 AM');
  const [rescheduleRoom, setRescheduleRoom] = useState<RoomId>('Consult 1');
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    Promise.all([api.getServices(), api.getStaff()])
      .then(([srvs, stf]) => {
        setServices(srvs);
        setStaffList(stf);
        if (srvs.length > 0) setSlotServiceId(srvs[0].id);
        if (stf.length > 0) setSlotStaffId(stf[0].id);
      })
      .catch(console.error);
  }, []);

  const handleSlotClick = (room: RoomId, timeSlot: string, date: string) => {
    setSlotRoom(room);
    setSlotTime(timeSlot);
    setSlotDate(date);
    setConflictError('');
    setIsSlotBookingOpen(true);
  };

  const handlePhoneBlur = async () => {
    if (slotClientPhone.replace(/[\s\-\(\)]/g, '').length >= 10) {
      try {
        const res = await api.searchCustomerPhone(slotClientPhone);
        if (res.exists && res.customer) {
          setSlotClientName(res.customer.name);
        }
      } catch (err) {
        // quiet
      }
    }
  };

  const handleSaveSlotBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError('');

    if (!slotClientName.trim() || !slotClientPhone.trim()) {
      setConflictError('Client name and mobile number are required.');
      return;
    }

    const srv = services.find(s => s.id === slotServiceId);
    const stf = staffList.find(s => s.id === slotStaffId);

    try {
      await api.createAppointment({
        customerName: slotClientName.trim(),
        customerPhone: slotClientPhone.trim(),
        serviceId: srv?.id || 'srv-1',
        serviceName: srv?.name || 'Sanctuary Care',
        categoryName: srv?.categoryName || 'General Wellness',
        staffId: stf?.id || 'st-1',
        staffName: stf?.name || 'Specialist',
        room: slotRoom,
        appointmentDate: slotDate,
        timeSlot: slotTime,
        durationMins: srv?.durationMins || 60,
        bookingChannel: 'Walk-in',
        notes: slotNotes || 'Front Desk slot reservation',
        amountInr: srv?.priceInr || 3500,
        status: 'confirmed'
      });

      setIsSlotBookingOpen(false);
      setSlotClientName('');
      setSlotClientPhone('');
      setSlotNotes('');
      window.location.reload(); // Refresh to reload appointments
    } catch (err: any) {
      setConflictError(err.message || 'Resource conflict detected.');
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment) return;
    try {
      await api.rescheduleAppointment(selectedAppointment.id, {
        newDate: rescheduleDate,
        newTimeSlot: rescheduleTimeSlot,
        newRoom: rescheduleRoom
      });
      alert('Appointment rescheduled successfully.');
      setIsRescheduling(false);
      setSelectedAppointment(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Reschedule conflict detected.');
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || !cancelReason.trim()) {
      alert('Please provide a reason for cancellation.');
      return;
    }
    try {
      await api.updateAppointmentStatus(selectedAppointment.id, 'cancelled', cancelReason.trim());
      alert('Appointment has been cancelled.');
      setIsCancelling(false);
      setSelectedAppointment(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel appointment.');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#252923]">
            Five-Room Scheduling Grid
          </h1>
          <p className="text-xs text-[#777A70]">
            Central calendar shared across Front Desk reception and Call Center. Double-booking prevented.
          </p>
        </div>
      </div>

      {/* Shared Room Calendar */}
      <RoomCalendar
        onSelectAppointment={(apt) => setSelectedAppointment(apt)}
        onNewBookingForSlot={handleSlotClick}
        canManageBookings={true}
      />

      {/* APPOINTMENT DETAILS & ACTION MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E3B2E] block">
                  {selectedAppointment.bookingRef}
                </span>
                <h3 className="font-serif text-lg font-medium text-[#252923]">
                  {selectedAppointment.customerName}
                </h3>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="text-[#777A70] hover:text-[#252923]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC]">
                <div>
                  <span className="text-[10px] text-[#777A70] uppercase block">Room</span>
                  <strong className="text-[#1E3B2E]">{selectedAppointment.room || 'Consult 1'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#777A70] uppercase block">Assigned Specialist</span>
                  <strong className="text-[#252923]">{selectedAppointment.assignedStaffName || selectedAppointment.staffName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#777A70] uppercase block">Date & Slot</span>
                  <strong>{selectedAppointment.appointmentDate} · {selectedAppointment.timeSlot}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#777A70] uppercase block">Status</span>
                  <span className="font-semibold uppercase text-[#1E3B2E]">{selectedAppointment.status.replace('_', ' ')}</span>
                </div>
              </div>

              {selectedAppointment.notes && (
                <p className="italic text-[#777A70] bg-white p-2.5 rounded border border-[#E7E5DC]">
                  “{selectedAppointment.notes}”
                </p>
              )}

              {/* Reschedule View */}
              {isRescheduling && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                  <h4 className="font-semibold text-amber-900">Reschedule Appointment</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="px-2 py-1.5 border rounded bg-white"
                    />
                    <select
                      value={rescheduleTimeSlot}
                      onChange={(e) => setRescheduleTimeSlot(e.target.value)}
                      className="px-2 py-1.5 border rounded bg-white"
                    >
                      <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                      <option value="10:30 AM - 11:30 AM">10:30 AM - 11:30 AM</option>
                      <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                      <option value="02:30 PM - 03:30 PM">02:30 PM - 03:30 PM</option>
                      <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                      <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setIsRescheduling(false)} className="px-2.5 py-1 text-[11px] bg-white border rounded">
                      Cancel
                    </button>
                    <button onClick={handleReschedule} className="px-2.5 py-1 text-[11px] bg-amber-800 text-white rounded font-semibold">
                      Confirm Move
                    </button>
                  </div>
                </div>
              )}

              {/* Cancellation View */}
              {isCancelling && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                  <h4 className="font-semibold text-rose-900">Cancel Appointment</h4>
                  <input
                    type="text"
                    placeholder="Enter reason for cancellation (e.g. Client requested postponement)..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded bg-white"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setIsCancelling(false)} className="px-2.5 py-1 text-[11px] bg-white border rounded">
                      Back
                    </button>
                    <button onClick={handleCancelAppointment} className="px-2.5 py-1 text-[11px] bg-rose-700 text-white rounded font-semibold">
                      Confirm Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!isRescheduling && !isCancelling && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsRescheduling(true)}
                      className="px-3 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#252923] rounded-lg font-medium inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reschedule</span>
                    </button>
                    <button
                      onClick={() => setIsCancelling(true)}
                      className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 rounded-lg font-medium inline-flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setActive360CustomerId(selectedAppointment.customerId || selectedAppointment.userId || null);
                      setSelectedAppointment(null);
                    }}
                    className="px-3 py-1.5 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140]"
                  >
                    Open 360° Dossier
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SLOT CLICK FAST BOOKING MODAL */}
      {isSlotBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#1E3B2E]">Reserve Sanctuary Slot</h3>
                <p className="text-xs text-[#777A70]">{slotRoom} · {slotDate} · {slotTime}</p>
              </div>
              <button onClick={() => setIsSlotBookingOpen(false)} className="text-[#777A70] hover:text-[#252923]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {conflictError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlotBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98490XXXXX"
                    value={slotClientPhone}
                    onChange={(e) => setSlotClientPhone(e.target.value)}
                    onBlur={handlePhoneBlur}
                    className="w-full px-3 py-2 border border-[#DDD9CE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Client Name"
                    value={slotClientName}
                    onChange={(e) => setSlotClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDD9CE] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Service Protocol *</label>
                <select
                  value={slotServiceId}
                  onChange={(e) => setSlotServiceId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DDD9CE] rounded-lg"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (₹{s.priceInr})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Attending Specialist *</label>
                <select
                  value={slotStaffId}
                  onChange={(e) => setSlotStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DDD9CE] rounded-lg"
                >
                  {staffList.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.roleTitle})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Reception Notes</label>
                <textarea
                  rows={2}
                  placeholder="Arrival or clinical notes..."
                  value={slotNotes}
                  onChange={(e) => setSlotNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlotBookingOpen(false)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140]"
                >
                  Confirm & Lock Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer 360 Drawer */}
      <Customer360Drawer
        customerId={active360CustomerId}
        onClose={() => setActive360CustomerId(null)}
      />
    </div>
  );
};
