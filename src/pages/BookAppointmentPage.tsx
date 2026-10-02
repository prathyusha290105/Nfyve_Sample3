import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Service, ServiceCategory, Staff, Appointment } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export const BookAppointmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

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

  // Load initial data
  useEffect(() => {
    Promise.all([api.getCategories(), api.getServices(), api.getStaff()])
      .then(([cats, srvs, stf]) => {
        setCategories(cats);
        setServices(srvs);
        setStaffList(stf);

        const initialSrvId = searchParams.get('serviceId');
        if (initialSrvId) {
          const match = srvs.find((s) => s.id === initialSrvId);
          if (match) {
            setSelectedCategoryId(match.categoryId);
            setSelectedServiceId(match.id);
          }
        } else if (cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
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
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent('/book-appointment?serviceId=' + selectedServiceId)}`);
      return;
    }

    if (!selectedServiceId || !appointmentDate || !timeSlot) {
      setBookingError('Please choose your service, date, and available time slot.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      const res = await api.createAppointment({
        serviceId: selectedServiceId,
        staffId: selectedStaffId || undefined,
        appointmentDate,
        timeSlot,
        notes: notes.trim(),
      });
      setConfirmedBooking(res.appointment);
    } catch (err: any) {
      setBookingError(err.message || 'Slot reservation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already confirmed, render success screen
  if (confirmedBooking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#244B3A] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#244B3A]">
            Booking Request Confirmed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#252923] font-medium">
            We Look Forward to Welcoming You
          </h1>
          <p className="text-xs sm:text-sm text-[#777A70] max-w-md mx-auto">
            Your appointment has been registered in our Begumpet sanctuary scheduling system.
          </p>
        </div>

        {/* Reference Dossier Card */}
        <div className="bg-white border border-[#DDD9CE] rounded-2xl p-6 sm:p-8 text-left space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
            <div>
              <span className="text-[11px] text-[#777A70] uppercase font-semibold">Reference ID</span>
              <p className="text-sm font-semibold text-[#244B3A] font-mono tabular-nums">
                {confirmedBooking.bookingRef}
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-md">
              {confirmedBooking.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#777A70]">Service</span>
              <p className="font-medium text-[#252923]">{confirmedBooking.serviceName}</p>
            </div>
            <div>
              <span className="text-[#777A70]">Scheduled Date & Slot</span>
              <p className="font-medium text-[#252923] tabular-nums">
                {confirmedBooking.appointmentDate} · {confirmedBooking.timeSlot}
              </p>
            </div>
            <div>
              <span className="text-[#777A70]">Client</span>
              <p className="font-medium text-[#252923]">{confirmedBooking.customerName}</p>
              <p className="text-[#777A70] text-[11px]">{confirmedBooking.customerPhone}</p>
            </div>
            <div>
              <span className="text-[#777A70]">Assigned Specialist</span>
              <p className="font-medium text-[#252923]">{confirmedBooking.staffName || 'Sanctuary Clinical Staff'}</p>
            </div>
            <div>
              <span className="text-[#777A70]">Treatment Fee</span>
              <p className="font-semibold text-[#244B3A] font-serif text-base">
                ₹{confirmedBooking.amountInr.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-[#777A70]">(Payable at clinic desk or prepaid)</span>
            </div>
            <div>
              <span className="text-[#777A70]">Sanctuary Address</span>
              <p className="font-medium text-[#252923]">4th Floor, Kura Towers, Begumpet</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/account/appointments"
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#244B3A] hover:bg-[#1a372a] rounded-lg transition-smooth"
          >
            View in My Appointments
          </Link>
          <button
            onClick={() => {
              setConfirmedBooking(null);
              setTimeSlot('');
            }}
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#244B3A] border border-[#244B3A] rounded-lg transition-smooth"
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
        <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
          Online Scheduling
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#244B3A] font-medium tracking-tight">
          Reserve Your Appointment at NFYVE
        </h1>
        <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
          Select your service, choose an available time slot, and confirm your visit. Our clinical team coordinates your intake directly.
        </p>
      </div>

      {bookingError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{bookingError}</span>
        </div>
      )}

      {/* Booking Form Layout */}
      <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Step 1: Category & Service */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#244B3A] text-white text-xs flex items-center justify-center font-semibold">1</span>
              <h3 className="font-serif text-lg font-medium text-[#252923]">
                Select Clinical Discipline & Service
              </h3>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-medium text-[#585B53] mb-1.5">
                Core Discipline
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  const matchingSrv = services.find((s) => s.categoryId === e.target.value);
                  if (matchingSrv) setSelectedServiceId(matchingSrv.id);
                }}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#244B3A]"
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
                Specific Treatment
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#244B3A]"
              >
                {categoryServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMins} mins · ₹{s.priceInr.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Date & Available Slots */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#244B3A] text-white text-xs flex items-center justify-center font-semibold">2</span>
              <h3 className="font-serif text-lg font-medium text-[#252923]">
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
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#244B3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#585B53] mb-1.5">
                  Assigned Specialist (Optional)
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#244B3A]"
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
                  Verifying clinic slot calendar...
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
                      className={`p-2.5 text-xs font-medium rounded-lg border text-center transition-smooth tabular-nums ${
                        timeSlot === s.slot
                          ? 'bg-[#244B3A] text-white border-[#244B3A] shadow-xs'
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

          {/* Step 3: Special Notes */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#244B3A] text-white text-xs flex items-center justify-center font-semibold">3</span>
              <h3 className="font-serif text-lg font-medium text-[#252923]">
                Clinical Notes or Requests
              </h3>
            </div>

            <div>
              <textarea
                rows={3}
                placeholder="Mention any skin allergies, past injuries, or specific concerns for the treating specialist..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#244B3A]"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Summary Card & Authenticated Confirmation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E5DC] shadow-sm space-y-5 sticky top-24">
            <h3 className="font-serif text-xl font-medium text-[#244B3A] border-b border-[#F0EEE5] pb-3">
              Booking Overview
            </h3>

            {selectedService ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[#777A70]">Service Selected</span>
                  <p className="font-semibold text-sm text-[#252923] mt-0.5">
                    {selectedService.name}
                  </p>
                  <p className="text-[11px] text-[#777A70]">{selectedService.categoryName}</p>
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
                  <span className="text-[#777A70]">Consultation / Fee</span>
                  <span className="font-serif text-2xl font-semibold text-[#244B3A]">
                    ₹{selectedService.priceInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#777A70]">Please choose a service to see fee details.</p>
            )}

            {/* Authentication status reminder */}
            {!user ? (
              <div className="p-4 bg-[#F0EEE5] border border-[#DDD9CE] rounded-xl space-y-3">
                <div className="flex items-start gap-2 text-xs text-[#585B53]">
                  <ShieldCheck className="w-4 h-4 text-[#244B3A] shrink-0 mt-0.5" />
                  <span>
                    To protect health dossiers, please sign in or register before confirming your appointment.
                  </span>
                </div>
                <Link
                  to={`/login?redirect=${encodeURIComponent('/book-appointment?serviceId=' + selectedServiceId)}`}
                  className="block text-center w-full py-2.5 bg-[#244B3A] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#1a372a] transition-smooth"
                >
                  Sign In to Complete Booking
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs space-y-1">
                  <p className="text-[#777A70]">Booking under client profile:</p>
                  <p className="font-semibold text-[#252923]">{user.name}</p>
                  <p className="text-[11px] text-[#777A70]">{user.email} · {user.phone}</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !timeSlot}
                  className="w-full py-3.5 bg-[#244B3A] hover:bg-[#1a372a] text-white font-semibold uppercase tracking-wider text-xs rounded-lg shadow-sm transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Reserving...' : 'Confirm Appointment'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="text-[11px] text-[#777A70] leading-relaxed space-y-1 pt-2 border-t border-[#F0EEE5]">
              <p>• Zero cancellation penalty up to 12 hours prior to slot.</p>
              <p>• Valet parking included at Kura Towers, Begumpet.</p>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
