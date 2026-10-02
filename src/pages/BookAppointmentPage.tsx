import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { createBooking } from '../lib/firestore';
import { Service, ServiceCategory, Staff, Appointment } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Phone,
  Mail,
  Building2,
  Check
} from 'lucide-react';

export const BookAppointmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // Customer Contact Fields
  const [customerName, setCustomerName] = useState<string>(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState<string>(user?.phone || '+91 ');

  // Selection states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(searchParams.get('serviceId') || '');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // default tomorrow
  );
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Slots fetching
  const [availableSlots, setAvailableSlots] = useState<{ slot: string; isAvailable: boolean }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Booking result
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);
  const [bookingError, setBookingError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync user profile if user logs in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone || customerPhone === '+91 ') setCustomerPhone(user.phone);
    }
  }, [user]);

  // Load initial data
  useEffect(() => {
    Promise.all([api.getCategories(), api.getServices(), api.getStaff()])
      .then(([cats, srvs, stf]) => {
        setCategories(cats);
        setServices(srvs);
        setStaffList(stf.filter(s => s.isActive));

        const initialSrvId = searchParams.get('serviceId');
        if (initialSrvId) {
          const match = srvs.find((s) => s.id === initialSrvId);
          if (match) {
            setSelectedCategoryId(match.categoryId);
            setSelectedServiceId(match.id);
          }
        } else if (cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
          const firstCatSrvs = srvs.filter(s => s.categoryId === cats[0].id);
          if (firstCatSrvs.length > 0 && !selectedServiceId) {
            setSelectedServiceId(firstCatSrvs[0].id);
          }
        }
      })
      .catch(console.error);
  }, [searchParams]);

  // Load available slots when date, service, or staff changes
  useEffect(() => {
    if (!appointmentDate || !selectedServiceId) {
      setAvailableSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    api.getAvailableSlots(appointmentDate, selectedServiceId, selectedStaffId || undefined)
      .then((slots) => {
        setAvailableSlots(slots);
        // Reset selected timeSlot if it is no longer available
        if (timeSlot && !slots.find((s) => s.slot === timeSlot && s.isAvailable)) {
          setTimeSlot('');
        }
      })
      .catch((err) => {
        console.error(err);
        setAvailableSlots([]);
      })
      .finally(() => setIsLoadingSlots(false));
  }, [appointmentDate, selectedServiceId, selectedStaffId]);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const categoryServices = services.filter((s) => !selectedCategoryId || s.categoryId === selectedCategoryId);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setBookingError('Please enter your full name, email address, and contact phone number.');
      return;
    }

    if (!selectedServiceId || !appointmentDate || !timeSlot) {
      setBookingError('Please select your preferred treatment, date, and an available consultation time slot.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      // Use Firestore transactional/atomic booking method
      const created = await createBooking({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        serviceId: selectedServiceId,
        staffId: selectedStaffId || undefined,
        appointmentDate,
        timeSlot,
        notes: notes.trim(),
        fee: selectedService?.priceInr,
      });

      setConfirmedBooking(created);
    } catch (err: any) {
      setBookingError(err.message || 'Slot reservation failed. The selected specialist or slot may already be reserved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already confirmed, render high-end success screen
  if (confirmedBooking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#214D3B] flex items-center justify-center mx-auto border-2 border-[#D4AF37]/50 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#214D3B] bg-[#F0EEE5] px-3 py-1 rounded-full border border-[#E7E5DC]">
            Booking Confirmed & Recorded in Firestore
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#214D3B] font-bold">
            We Look Forward to Welcoming You
          </h1>
          <p className="text-xs sm:text-sm text-[#585B53] max-w-md mx-auto">
            Your appointment has been registered in the Begumpet sanctuary clinical schedule.
          </p>
        </div>

        {/* Reference Dossier Card */}
        <div className="bg-white border border-[#DDD9CE] rounded-2xl p-6 sm:p-8 text-left space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
            <div>
              <span className="text-[11px] text-[#777A70] uppercase font-semibold">Unique Booking Reference</span>
              <p className="text-base font-bold text-[#214D3B] font-mono tabular-nums">
                {confirmedBooking.bookingRef}
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full uppercase tracking-wider">
              {confirmedBooking.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#777A70]">Service Protocol</span>
              <p className="font-semibold text-sm text-[#252923]">{confirmedBooking.serviceName}</p>
              <p className="text-[11px] text-[#2E6B50]">{confirmedBooking.categoryName}</p>
            </div>
            <div>
              <span className="text-[#777A70]">Scheduled Date & Slot</span>
              <p className="font-medium text-[#252923] tabular-nums">
                {confirmedBooking.appointmentDate} · {confirmedBooking.timeSlot}
              </p>
            </div>
            <div>
              <span className="text-[#777A70]">Client Details</span>
              <p className="font-medium text-[#252923]">{confirmedBooking.customerName}</p>
              <p className="text-[#777A70] text-[11px]">{confirmedBooking.customerPhone} · {confirmedBooking.customerEmail}</p>
            </div>
            <div>
              <span className="text-[#777A70]">Assigned Specialist</span>
              <p className="font-medium text-[#252923]">{confirmedBooking.staffName || 'Sanctuary Clinical Specialist'}</p>
            </div>
            <div>
              <span className="text-[#777A70]">Treatment Fee</span>
              <p className="font-bold text-[#214D3B] font-serif text-lg">
                ₹{confirmedBooking.amountInr.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-[#777A70]">(Payable at clinic desk upon arrival)</span>
            </div>
            <div>
              <span className="text-[#777A70]">Sanctuary Address</span>
              <p className="font-medium text-[#252923]">4th Floor, Kura Towers, Begumpet, Hyderabad</p>
            </div>
          </div>

          {confirmedBooking.notes && (
            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] text-xs">
              <span className="font-semibold text-[#214D3B]">Intake Notes:</span>
              <p className="text-[#585B53] mt-0.5">{confirmedBooking.notes}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/account/appointments"
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#214D3B] hover:bg-[#1a3e2f] rounded-xl transition-smooth shadow-xs"
          >
            View in My Appointments
          </Link>
          <button
            onClick={() => {
              setConfirmedBooking(null);
              setTimeSlot('');
            }}
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#214D3B] border border-[#214D3B] rounded-xl hover:bg-[#F0EEE5] transition-smooth"
          >
            Book Another Treatment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-24">
      
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#214D3B]">
          Online Scheduling & Consultation Intake
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#214D3B] font-bold tracking-tight">
          Reserve Your Appointment at NFYVE
        </h1>
        <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
          Select your discipline, choose an available time slot, and confirm your visit. Our clinical concierge coordinates your protocol directly.
        </p>
      </div>

      {bookingError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{bookingError}</span>
        </div>
      )}

      {/* Booking Form Layout */}
      <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Customer Details */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#214D3B] text-white text-xs flex items-center justify-center font-bold">1</span>
              <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                Your Contact Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-medium text-[#252923] mb-1">Full Legal Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#777A70] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#252923] mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#777A70] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#252923] mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#777A70] absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 90000 23050"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Category & Service */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#214D3B] text-white text-xs flex items-center justify-center font-bold">2</span>
              <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                Select Wellness Discipline & Service
              </h3>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-medium text-[#585B53] mb-1.5">
                Core Discipline / Pillar
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  const matchingSrv = services.find((s) => s.categoryId === e.target.value);
                  if (matchingSrv) setSelectedServiceId(matchingSrv.id);
                }}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Specific Service */}
            <div>
              <label className="block text-xs font-medium text-[#585B53] mb-1.5">
                Specific Treatment Protocol
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
              >
                {categoryServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMins} mins · ₹{s.priceInr.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 3: Date & Available Slots */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#214D3B] text-white text-xs flex items-center justify-center font-bold">3</span>
              <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                Preferred Date & Available Time Slot
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#585B53] mb-1.5">
                  Select Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#585B53] mb-1.5">
                  Preferred Specialist (Optional)
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
                >
                  <option value="">Any Available Specialist</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.roleTitle})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live slot picker */}
            <div>
              <label className="block text-xs font-medium text-[#585B53] mb-2">
                Available Slots on {appointmentDate}:
              </label>

              {isLoadingSlots ? (
                <div className="py-6 text-center text-xs text-[#777A70]">
                  Checking clinic slot calendar...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#777A70] bg-[#FAF9F5] rounded-lg">
                  No slots currently available on this date. Please choose another day.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!s.isAvailable}
                      onClick={() => setTimeSlot(s.slot)}
                      className={`p-2.5 text-xs font-semibold rounded-lg border text-center transition-all tabular-nums ${
                        timeSlot === s.slot
                          ? 'bg-[#214D3B] text-white border-[#214D3B] shadow-xs'
                          : s.isAvailable
                          ? 'bg-[#FAF9F5] hover:bg-[#F0EEE5] text-[#252923] border-[#DDD9CE]'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                      }`}
                    >
                      {s.slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Special Notes */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#214D3B] text-white text-xs flex items-center justify-center font-bold">4</span>
              <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                Intake Notes or Medical Requests
              </h3>
            </div>

            <div>
              <textarea
                rows={3}
                placeholder="Mention any skin sensitivities, allergies, past injuries, or specific concerns for the treating practitioner..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Summary Card & Instant Confirmation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E5DC] shadow-sm space-y-5 sticky top-24">
            <h3 className="font-serif text-xl font-bold text-[#214D3B] border-b border-[#F0EEE5] pb-3">
              Booking Overview
            </h3>

            {selectedService ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[#777A70]">Service Selected</span>
                  <p className="font-semibold text-sm text-[#252923] mt-0.5">
                    {selectedService.name}
                  </p>
                  <p className="text-[11px] text-[#2E6B50] font-medium">{selectedService.categoryName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#F0EEE5]">
                  <div>
                    <span className="text-[#777A70]">Date</span>
                    <p className="font-medium text-[#252923] tabular-nums">{appointmentDate}</p>
                  </div>
                  <div>
                    <span className="text-[#777A70]">Time Slot</span>
                    <p className="font-medium text-[#252923] tabular-nums">
                      {timeSlot || 'Select slot on left'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-[#777A70]">Consultation Fee</span>
                  <span className="font-serif text-2xl font-bold text-[#214D3B]">
                    ₹{selectedService.priceInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#777A70]">Please choose a service to view fee details.</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !timeSlot || !customerName || !customerPhone}
              className="w-full py-3.5 bg-[#214D3B] hover:bg-[#1a3e2f] text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-xs transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Reserving in Firestore...' : 'Confirm Appointment'}</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </button>

            <div className="text-[11px] text-[#777A70] leading-relaxed space-y-1 pt-3 border-t border-[#F0EEE5]">
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero cancellation penalty up to 12 hours prior to slot.</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Valet parking included at Kura Towers, Begumpet.</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Saved directly to Cloud Firestore appointment register.</span>
              </p>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
