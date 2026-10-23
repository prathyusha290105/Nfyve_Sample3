import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../src/api/client';
import { 
  Phone, 
  Building2, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  Send,
  MapPin
} from 'lucide-react';

export const BookAppointmentPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [discipline, setDiscipline] = useState('Clinical Aesthetics & Skin Health');
  const [preferredTime, setPreferredTime] = useState('Morning (10 AM - 1 PM)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCallbackRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || phone.trim() === '+91') {
      alert('Please provide your name and phone number so our concierge can reach you.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createInquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || 'concierge-request@nfyve.com',
        subject: `Concierge Consultation Request: ${discipline}`,
        message: `Preferred Time: ${preferredTime}. Notes: ${notes || 'Requested call from Begumpet medical concierge.'}`
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit callback request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      
      {/* Editorial Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6EEE7] text-[#1E3B2E] text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Doctor-Supervised Sanctuary Scheduling</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#252923] tracking-tight">
          Consultation & Appointment Scheduling
        </h1>
        <p className="text-base sm:text-lg text-[#585B53] leading-relaxed">
          At NFYVE Begumpet, appointments are not booked through automated online algorithms. In adherence to medical diligence and personalised care, every transformation consultation is scheduled directly by our dedicated clinical call centre or front desk receptionists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Direct Phone & In-Person Scheduling */}
        <div className="lg:col-span-5 bg-[#1E3B2E] text-white p-8 rounded-2xl shadow-lg space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#A8B8A0] font-semibold">Immediate Assistance</span>
            <h2 className="font-serif text-2xl font-medium">Speak with our Medical Concierge</h2>
            <p className="text-xs text-[#C5C9BF] leading-relaxed">
              Our call centre team coordinates directly with our dermatologists, metabolic physicians, and movement directors to match your treatment room and specialist availability.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <a
              href="tel:+919000023050"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#244B3A] flex items-center justify-center text-white shrink-0">
                <Phone className="w-5 h-5 text-[#E6EEE7]" />
              </div>
              <div>
                <span className="block text-[10px] text-[#A8B8A0] uppercase font-semibold">Direct Call Center Line</span>
                <span className="text-lg font-bold text-white group-hover:underline tabular-nums">+91 9000023050</span>
              </div>
            </a>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#A8B8A0] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Visit Our Begumpet Sanctuary</strong>
                  <span className="text-[#C5C9BF]">4th Floor, Kura Towers, Begumpet, Hyderabad, Telangana 500016</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 pt-1 text-[#A8B8A0] text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>Mon – Sat: 7:00 AM – 9:00 PM · Valet Available</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-[#A8B8A0] space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#E6EEE7]" />
              <span>Zero double-booking guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#E6EEE7]" />
              <span>Private single-client treatment suites</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#E6EEE7]" />
              <span>Comprehensive 45-minute baseline health screen</span>
            </div>
          </div>
        </div>

        {/* Right Column: Request Concierge Callback Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-[#E7E5DC] shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-medium text-[#252923]">Request a Dedicated Callback</h2>
            <p className="text-xs text-[#777A70]">
              Leave your details below and our Begumpet concierge team will reach out within business hours to discuss your schedule.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-[#E6EEE7]/60 border border-[#244B3A]/20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#1E3B2E] text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-medium text-[#1E3B2E]">Callback Request Dispatched</h3>
                <p className="text-xs text-[#585B53] max-w-md mx-auto">
                  Thank you, {name}. Your inquiry has been routed to our clinical call centre. A transformation coordinator will phone you shortly at {phone}.
                </p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-[#1E3B2E] underline"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleCallbackRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl focus:outline-none focus:border-[#1E3B2E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Mobile Contact *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98490XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl focus:outline-none focus:border-[#1E3B2E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl focus:outline-none focus:border-[#1E3B2E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Transformation Pillar</label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl focus:outline-none focus:border-[#1E3B2E]"
                  >
                    <option value="Clinical Aesthetics & Skin Health">Clinical Aesthetics & Skin Health</option>
                    <option value="Medical Weight Loss & Metabolic Health">Medical Weight Loss & Metabolic Health</option>
                    <option value="Private Fitness & Movement Studio">Private Fitness & Movement Studio</option>
                    <option value="Luxury Hair, Scalp & Trichology">Luxury Hair, Scalp & Trichology</option>
                    <option value="Functional Nutrition & Gut Health">Functional Nutrition & Gut Health</option>
                    <option value="Integrated 360° Transformation">Integrated 360° Transformation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Preferred Time for Call</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl focus:outline-none focus:border-[#1E3B2E]"
                >
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                  <option value="As soon as possible">As soon as possible</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Specific Health or Aesthetic Goals</label>
                <textarea
                  rows={3}
                  placeholder="Tell us what you hope to achieve (e.g. skin barrier repair, stubborn abdominal fat, posture screen)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl focus:outline-none focus:border-[#1E3B2E]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#1E3B2E] text-white rounded-xl font-semibold uppercase tracking-wider text-xs hover:bg-[#2A5140] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Routing to Call Center...' : 'Request Concierge Callback'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
