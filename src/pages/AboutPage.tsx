import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Award, HeartPulse, Sparkles, Building2, Users } from 'lucide-react';
import { HERO_IMAGE, CLINICAL_IMAGE, FITNESS_IMAGE, SALON_IMAGE, NUTRITION_IMAGE } from '../data/initialData';
import { api } from '../api/client';
import { Staff } from '../types';

export const AboutPage: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);

  useEffect(() => {
    api.getStaff().then(setStaffList).catch(console.error);
  }, []);

  return (
    <div className="space-y-20 pb-20">
      
      {/* Editorial Header */}
      <section className="pt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-4"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
            The NFYVE Genesis
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#244B3A] font-medium tracking-tight">
            A sanctuary where medical precision meets mindful restoration.
          </h1>
          <p className="text-base sm:text-lg text-[#585B53] leading-relaxed">
            Founded in Begumpet, Hyderabad, NFYVE – The Change emerged from a simple observation: modern wellness is fragmented. We set out to dissolve the barriers between clinical dermatology, metabolic physiology, private athletic coaching, and trichological care.
          </p>
        </motion.div>
      </section>

      {/* Alternating Story Section 1: The Integrated Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-5"
          >
            <div className="w-10 h-10 rounded-lg bg-[#F0EEE5] border border-[#DDD9CE] flex items-center justify-center text-[#244B3A]">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#244B3A] font-medium">
              Synchronized Care Across Disciplines
            </h2>
            <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
              When skin health is impaired, gut inflammation or hormonal imbalances are frequently at play. When weight loss stalls, metabolic adaptation and stress cortisol levels require clinical review rather than starvation diets.
            </p>
            <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
              At NFYVE, our specialists do not operate in silos. A dermatological consultation connects directly with dietary blueprints; private training sessions take joint mobility and recovery markers into account. Every recommendation strengthens the others.
            </p>
            <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-[#252923]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#244B3A]" />
                <span>Single Patient Dossier</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#244B3A]" />
                <span>Multi-Specialist Rounds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#244B3A]" />
                <span>Evidence-Backed Diagnostics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#244B3A]" />
                <span>Zero Gimmick Philosophy</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <div className="rounded-2xl overflow-hidden border border-[#DDD9CE] bg-[#F0EEE5] aspect-[4/3] shadow-md">
              <img
                src={HERO_IMAGE}
                alt="Begumpet transformation centre"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Alternating Story Section 2: Sanctuary Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden aspect-[3/4] bg-[#F0EEE5] border border-[#DDD9CE]">
                <img
                  src={CLINICAL_IMAGE}
                  alt="Clinical treatment room"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-[3/4] bg-[#F0EEE5] border border-[#DDD9CE] mt-8">
                <img
                  src={FITNESS_IMAGE}
                  alt="Private gym training"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-5 order-1 lg:order-2"
          >
            <div className="w-10 h-10 rounded-lg bg-[#F0EEE5] border border-[#DDD9CE] flex items-center justify-center text-[#244B3A]">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#244B3A] font-medium">
              Architectural Calm at Kura Towers
            </h2>
            <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
              Occupying the 4th floor of Kura Towers in Begumpet, NFYVE was purposefully built to counteract urban sensory overload. We utilized warm cream limestone, organic acoustic dampening, and lush interior greenery to create an atmosphere of quiet renewal.
            </p>
            <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
              Every room—from our sterile micro-needling suites to our private personal training studio and trichological hair sanctuary—is individually climate-controlled and maintained to the highest clinical hygiene thresholds.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Specialized Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
            Leadership & Practitioners
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#244B3A] font-medium">
            Guided by Seasoned Professionals
          </h2>
          <p className="text-xs sm:text-sm text-[#777A70]">
            Our physicians, certified movement specialists, and registered dietitians bring decades of combined clinical expertise to Hyderabad.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {staffList.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-xl border border-[#E7E5DC] p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#F0EEE5] border border-[#DDD9CE] flex items-center justify-center text-[#244B3A] font-serif text-lg font-semibold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#252923]">{member.name}</h3>
                  <p className="text-xs font-medium text-[#244B3A]">{member.roleTitle}</p>
                  <p className="text-[11px] text-[#777A70]">{member.specialty}</p>
                </div>
                <p className="text-xs text-[#585B53] leading-relaxed pt-1 border-t border-[#F0EEE5]">
                  {member.bio}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-[#777A70]">
                <span>Begumpet Centre · Full-Time Faculty</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-2xl p-8 sm:p-12 text-center space-y-5">
          <h2 className="font-serif text-3xl text-[#244B3A] font-medium">
            Consult With Our Multidisciplinary Team
          </h2>
          <p className="text-xs sm:text-sm text-[#777A70] max-w-xl mx-auto">
            Book an initial assessment to tour our facilities, review your biomarkers, and co-design a treatment plan that fits your life.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/book-appointment"
              className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#244B3A] hover:bg-[#1a372a] rounded-lg transition-smooth"
            >
              Book Consultation
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#244B3A] border border-[#244B3A] rounded-lg transition-smooth"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
