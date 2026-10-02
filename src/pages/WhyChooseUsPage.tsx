import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Building2, 
  Layers, 
  UserCheck, 
  Cpu, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { HERO_IMAGE, CLINICAL_IMAGE } from '../data/initialData';

export const WhyChooseUsPage: React.FC = () => {
  const pillars = [
    {
      num: '01',
      icon: <Layers className="w-5 h-5 text-[#244B3A]" />,
      title: 'Integrated Care Under One Roof',
      desc: 'Eliminate fragmented appointments across the city. Your dermatologist, functional trainer, trichologist, and clinical nutritionist collaborate under a unified care plan.',
    },
    {
      num: '02',
      icon: <UserCheck className="w-5 h-5 text-[#244B3A]" />,
      title: 'Physician-Led Diagnostics',
      desc: 'No guesswork or generic templates. Every metabolic protocol and aesthetic plan is initiated with objective biomarker assessments and body composition data.',
    },
    {
      num: '03',
      icon: <Cpu className="w-5 h-5 text-[#244B3A]" />,
      title: 'State-of-the-Art Technology',
      desc: 'We invest exclusively in FDA-cleared, CE-certified technologies—including advanced laser systems, RF tissue firming, and medical-grade vortex infusion.',
    },
    {
      num: '04',
      icon: <Building2 className="w-5 h-5 text-[#244B3A]" />,
      title: 'Private Sanctuary Environment',
      desc: 'Escape noisy commercial gyms and sterile hospital corridors. Our Begumpet centre features private suites, soothing acoustic design, and dedicated concierge attention.',
    },
    {
      num: '05',
      icon: <Clock className="w-5 h-5 text-[#244B3A]" />,
      title: 'Uncompromised Time Efficiency',
      desc: 'Complete skin rejuvenation, personal training, and healthy meal pick-up during a single coordinated 90-minute window in your busy schedule.',
    },
    {
      num: '06',
      icon: <Sparkles className="w-5 h-5 text-[#244B3A]" />,
      title: 'Clean Nutrition Kitchen',
      desc: 'In-house Nutri Food culinary bar crafting chef-prepared, dietitian-approved meal bowls, cold-pressed botanical tonics, and healthy snacks daily.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 pb-24">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
          The NFYVE Distinction
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#244B3A] font-medium tracking-tight">
          Why Hyderabad Chooses NFYVE – The Change
        </h1>
        <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
          Wellness should not be stressful, contradictory, or fragmented. Discover how our integrated philosophy transforms your journey into a seamless, deeply restorative experience.
        </p>
      </div>

      {/* Hero Visual Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl text-[#244B3A] font-medium">
              The Problem with Fragmented Wellness
            </h2>
            <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
              When you consult multiple independent practitioners, nobody sees the complete picture. A dermatologist prescribes skincare that your gym trainer doesn’t understand, while an online diet plan impairs your metabolic energy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-red-200 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                Traditional Fragmented Care
              </span>
              <ul className="text-xs text-[#777A70] space-y-1.5">
                <li>• Conflicting advice from disconnected vendors</li>
                <li>• Wasted travel time across Hyderabad</li>
                <li>• Sterile clinic environments or noisy gyms</li>
                <li>• Unmonitored supplements and crash diets</li>
              </ul>
            </div>

            <div className="p-4 bg-[#F0EEE5] border border-[#244B3A]/30 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-[#244B3A] uppercase tracking-wider">
                The NFYVE Integrated Model
              </span>
              <ul className="text-xs text-[#252923] space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#244B3A]" />
                  <span>Single coordinated clinical team</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#244B3A]" />
                  <span>One location: Begumpet, Hyderabad</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#244B3A]" />
                  <span>Boutique luxury hospitality</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#244B3A]" />
                  <span>Physician-backed nutrition & safety</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl overflow-hidden border border-[#DDD9CE] bg-[#F0EEE5] aspect-[4/3] shadow-md">
            <img
              src={HERO_IMAGE}
              alt="NFYVE integrated sanctuary"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Six Pillars Grid */}
      <div className="space-y-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
          Six Foundational Pillars
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#F0EEE5] flex items-center justify-center">
                    {p.icon}
                  </div>
                  <span className="font-serif text-lg font-semibold text-[#777A70]">{p.num}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#252923]">{p.title}</h3>
                <p className="text-xs text-[#585B53] leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Location Advantage CTA */}
      <div className="bg-[#244B3A] text-white rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A8B8A0]">
            Central Hyderabad Location
          </span>
          <h3 className="font-serif text-3xl font-medium">
            Centrally Located at Kura Towers, Begumpet
          </h3>
          <p className="text-xs sm:text-sm text-[#C5C9BF] leading-relaxed">
            Conveniently situated with dedicated valet parking and direct elevator access. Tour our sanctuary and consult with our medical and fitness directors.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            to="/book-appointment"
            className="w-full sm:w-auto px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#244B3A] bg-[#FAF9F5] hover:bg-white rounded-lg shadow-sm transition-smooth whitespace-nowrap text-center"
          >
            Book Appointment
          </Link>
          <Link
            to="/contact"
            className="w-full sm:w-auto px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white border border-[#A8B8A0]/60 hover:border-white rounded-lg transition-smooth whitespace-nowrap text-center"
          >
            View Map & Details
          </Link>
        </div>
      </div>

    </div>
  );
};
