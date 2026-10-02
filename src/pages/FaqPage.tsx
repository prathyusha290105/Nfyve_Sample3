import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FaqPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1-1');

  const faqSections = [
    {
      title: 'Clinical Aesthetics & Skin Health',
      items: [
        {
          id: 'faq-1-1',
          q: 'What should I anticipate during my initial dermatological consultation?',
          a: 'Your session begins with high-resolution digital skin moisture and pore imaging. Our aesthetics physician reviews your skin barrier, active products, and dermatological goals before recommending medical-grade peels, hydra-infusion, or laser therapies.',
        },
        {
          id: 'faq-1-2',
          q: 'Is there downtime associated with Hydra-Infusion or Laser treatments?',
          a: 'Hydra-Infusion requires zero downtime—you leave with immediate skin glow. Fractional microneedling and specific laser photorejuvenation treatments may produce mild redness resembling a light sunburn for 24–48 hours, fully manageable with post-procedure barrier balms.',
        },
      ],
    },
    {
      title: 'Medical Weight Loss & Body Contouring',
      items: [
        {
          id: 'faq-2-1',
          q: 'How does medical weight loss differ from traditional dieting?',
          a: 'Our physician-led protocol evaluates visceral adipose tissue, resting metabolic rate, and underlying hormonal markers. Rather than restrictive starvation that triggers muscle catabolism, we preserve lean mass while targeting stubborn fat stores through supervised metabolic calibration.',
        },
        {
          id: 'faq-2-2',
          q: 'Is non-invasive RF body contouring painful?',
          a: 'Not at all. Therapeutic radiofrequency feels like a soothing warm stone massage on the treatment region. It stimulates endogenous collagen remodeling and adipocyte drainage without surgery, anesthetics, or incisions.',
        },
      ],
    },
    {
      title: 'Fitness & Private Movement Studio',
      items: [
        {
          id: 'faq-3-1',
          q: 'Can beginners with zero gym experience join NFYVE fitness?',
          a: 'Absolutely. Over 60% of our fitness clientele are professionals or beginners seeking joint-friendly, sustainable strength. We commence with a kinetic movement screen to ensure every exercise protects your spine and joints.',
        },
        {
          id: 'faq-3-2',
          q: 'Are the fitness studios shared or private?',
          a: 'Our Begumpet gym features private 1-on-1 coaching bays. You will never experience crowded queues, distracting crowds, or noisy commercial interruptions.',
        },
      ],
    },
    {
      title: 'Appointments, Policies & Sanctuary Logistics',
      items: [
        {
          id: 'faq-4-1',
          q: 'What is your appointment cancellation and rescheduling policy?',
          a: 'Appointments can be rescheduled or cancelled through your online customer dashboard up to 12 hours prior to the slot with zero fee. For same-day emergencies, please contact our concierge desk directly at +91 9000023050.',
        },
        {
          id: 'faq-4-2',
          q: 'Where do I park when arriving at Kura Towers in Begumpet?',
          a: 'NFYVE provides complimentary valet parking at the main entrance of Kura Towers. Proceed directly to the 4th-floor elevators where our concierge team will welcome you.',
        },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-24">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
          Help & Guidance
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#244B3A] font-medium tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
          Clear answers about treatments, clinical safety standards, appointment procedures, and our Begumpet sanctuary.
        </p>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-10">
        {faqSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#244B3A] border-b border-[#E7E5DC] pb-2">
              {sec.title}
            </h2>

            <div className="space-y-3">
              {sec.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E7E5DC] rounded-xl overflow-hidden transition-smooth"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-[#252923]">
                      {item.q}
                    </span>
                    {openFaq === item.id ? (
                      <ChevronUp className="w-4 h-4 text-[#244B3A] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#777A70] shrink-0" />
                    )}
                  </button>

                  {openFaq === item.id && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#585B53] leading-relaxed border-t border-[#F0EEE5] pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions banner */}
      <div className="bg-[#F0EEE5] border border-[#DDD9CE] rounded-xl p-6 sm:p-8 text-center space-y-4">
        <h3 className="font-serif text-2xl text-[#244B3A]">
          Still Have a Specific Question?
        </h3>
        <p className="text-xs text-[#585B53] max-w-md mx-auto">
          Our clinical concierge desk is ready to answer specific health inquiries, discuss bespoke programs, or arrange a private facility walkthrough.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/contact"
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#244B3A] hover:bg-[#1a372a] rounded-lg transition-smooth"
          >
            Contact Sanctuary
          </Link>
          <a
            href="tel:+919000023050"
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#244B3A] border border-[#244B3A] rounded-lg transition-smooth"
          >
            Call +91 9000023050
          </a>
        </div>
      </div>

    </div>
  );
};
