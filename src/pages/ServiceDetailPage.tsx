import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, IndianRupee, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { Service } from '../types';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    api.getServiceBySlug(slug)
      .then(setService)
      .catch((err) => {
        console.error(err);
        setService(null);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#777A70]">
        Loading service details...
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl text-[#244B3A]">Service Not Found</h2>
        <p className="text-xs text-[#777A70]">The requested service could not be located in our clinical catalog.</p>
        <Link
          to="/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#244B3A] underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to All Services</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-24">
      
      {/* Back button */}
      <div>
        <Link
          to="/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#585B53] hover:text-[#244B3A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Offerings</span>
        </Link>
      </div>

      {/* Main Hero Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Visual */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-[#DDD9CE] bg-[#F0EEE5] aspect-[4/3] shadow-md">
            <img
              src={service.imageUrl}
              alt={service.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="bg-[#FAF9F5] border border-[#DDD9CE] p-4 rounded-xl flex items-center justify-between text-xs text-[#585B53]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#244B3A]" />
              <span>Medical-grade protocol</span>
            </div>
            <span>Begumpet Centre · Suite 402</span>
          </div>
        </div>

        {/* Right Column: Key Info & CTA */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
              {service.categoryName || 'Integrated Wellness'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#244B3A] font-medium leading-tight">
              {service.name}
            </h1>
          </div>

          {/* Pricing & Duration Bar */}
          <div className="p-4 bg-[#F0EEE5] border border-[#DDD9CE] rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-[#777A70] uppercase font-semibold">Treatment Fee</span>
              <div className="text-2xl font-serif font-semibold text-[#244B3A]">
                ₹{service.priceInr.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[11px] text-[#777A70] uppercase font-semibold">Session Duration</span>
              <div className="flex items-center gap-1 text-sm font-semibold text-[#252923]">
                <Clock className="w-4 h-4 text-[#244B3A]" />
                <span className="tabular-nums">{service.durationMins} minutes</span>
              </div>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-[#585B53] leading-relaxed space-y-3">
            <p>{service.fullDesc}</p>
          </div>

          {/* Booking CTA */}
          <div className="pt-2">
            <button
              onClick={() => navigate(`/book-appointment?serviceId=${service.id}`)}
              className="w-full py-3.5 px-6 bg-[#244B3A] hover:bg-[#1a372a] text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm transition-smooth flex items-center justify-center gap-2"
            >
              <span>Book This Service Online</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center text-[#777A70] mt-2">
              Free rescheduling up to 12 hours prior to your scheduled slot.
            </p>
          </div>
        </div>

      </div>

      {/* Benefits & Precautions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#E7E5DC]">
        
        <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-4">
          <h3 className="font-serif text-xl font-medium text-[#244B3A] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#244B3A]" />
            <span>Targeted Clinical Benefits</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-[#585B53]">
            {service.benefits.map((b, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#244B3A] mt-1.5 shrink-0" />
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-4">
          <h3 className="font-serif text-xl font-medium text-[#244B3A] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Preparation & Guidelines</span>
          </h3>
          {service.precautions && service.precautions.length > 0 ? (
            <ul className="space-y-2.5 text-xs text-[#585B53]">
              {service.precautions.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#777A70] leading-relaxed">
              Standard clinic hydration recommended. Please arrive 10 minutes prior to your session for baseline vitals and intake documentation.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
