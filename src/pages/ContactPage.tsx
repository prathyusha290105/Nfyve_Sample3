import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Consultation Inquiry',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.submitInquiry(formData);
      setSuccessMsg(res.message);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Consultation Inquiry',
        message: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please call our concierge desk directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 pb-24">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
          Concierge & Visits
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#244B3A] font-medium tracking-tight">
          Connect with Our Begumpet Sanctuary
        </h1>
        <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
          Whether inquiring about doctor-supervised weight loss, specialized dermatological protocols, private gym coaching, or booking a private tour, our concierge desk is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Information & Map */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-5">
            <h2 className="font-serif text-xl text-[#244B3A] font-medium">
              Sanctuary Details
            </h2>

            <div className="space-y-4 text-xs text-[#585B53]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#244B3A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#252923]">NFYVE – The Change</p>
                  <p>4th Floor, Kura Towers, Begumpet</p>
                  <p>Hyderabad, Telangana 500016, India</p>
                  <span className="inline-block mt-1 text-[11px] text-[#244B3A] font-medium">
                    (Valet parking & direct elevator available)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#244B3A] shrink-0" />
                <div>
                  <p className="font-semibold text-[#252923]">Direct Phone</p>
                  <a href="tel:+919000023050" className="hover:text-[#244B3A] tabular-nums">
                    +91 9000023050
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#244B3A] shrink-0" />
                <div>
                  <p className="font-semibold text-[#252923]">Support & Concierge Email</p>
                  <a href="mailto:support@nfyve.com" className="hover:text-[#244B3A]">
                    support@nfyve.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-[#F0EEE5]">
                <Clock className="w-4 h-4 text-[#244B3A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-[#252923]">Sanctuary Operating Hours</p>
                  <p>Monday – Friday: <span className="tabular-nums">7:00 AM – 9:00 PM</span></p>
                  <p>Saturday: <span className="tabular-nums">8:00 AM – 8:00 PM</span></p>
                  <p>Sunday: <span className="tabular-nums">8:00 AM – 6:00 PM</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Embed */}
          <div className="rounded-xl overflow-hidden border border-[#E7E5DC] bg-[#F0EEE5] aspect-[4/3] relative">
            <iframe
              title="NFYVE Location Map Begumpet Hyderabad"
              src="https://maps.google.com/maps?q=Kura%20Towers%20Begumpet%20Hyderabad&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>

        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-[#E7E5DC] space-y-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#244B3A] font-medium">
                Send an Inquiry
              </h2>
              <p className="text-xs text-[#777A70] mt-1">
                Our clinical concierge reviews inquiries daily and responds within two business hours.
              </p>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#585B53] font-medium mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shalini Reddy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
                  />
                </div>
                <div>
                  <label className="block text-[#585B53] font-medium mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. shalini@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#585B53] font-medium mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98490 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
                  />
                </div>
                <div>
                  <label className="block text-[#585B53] font-medium mb-1">
                    Inquiry Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
                  >
                    <option>General Consultation Inquiry</option>
                    <option>360° Integrated Transformation Program</option>
                    <option>Clinical Dermatology & Aesthetics</option>
                    <option>Medical Weight Loss Consultation</option>
                    <option>Private 1-on-1 Fitness Coaching</option>
                    <option>Trichology & Salon Rituals</option>
                    <option>Corporate Wellness & Executive Packages</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Message / Health Goals *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Share any specific goals, questions about treatments, or preferred appointment dates..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#244B3A] hover:bg-[#1a372a] text-white font-semibold uppercase tracking-wider rounded-lg transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending to Concierge...' : 'Submit Inquiry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
