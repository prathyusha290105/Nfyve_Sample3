import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  HeartHandshake, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Clock, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';
import { 
  HERO_IMAGE, 
  CLINICAL_IMAGE, 
  FITNESS_IMAGE, 
  SALON_IMAGE, 
  NUTRITION_IMAGE,
  INITIAL_CATEGORIES,
  INITIAL_REVIEWS 
} from '../data/initialData';

export const HomePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const benefits = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#244B3A]" />,
      title: 'Expert Medical Team',
      desc: 'Dermatologists, certified CSCS coaches & clinical dietitians.',
    },
    {
      icon: <Activity className="w-5 h-5 text-[#244B3A]" />,
      title: 'Personalized Care Plans',
      desc: 'Bespoke diagnostic protocols tailored to your physiology.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#244B3A]" />,
      title: 'Modern Clinical Tech',
      desc: 'Medical-grade laser, RF body contouring & cleanroom hygiene.',
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-[#244B3A]" />,
      title: 'All-In-One Sanctuary',
      desc: 'Aesthetics, gym, salon, and nutrition under one Begumpet roof.',
    },
  ];

  const serviceShowcase = [
    {
      title: 'Clinical Aesthetics & Skin Health',
      desc: 'Vortex hydra-infusion, collagen induction microneedling, and photorejuvenation lasers.',
      image: CLINICAL_IMAGE,
      link: '/services?category=clinical-aesthetics',
      tag: 'Medical Aesthetics',
    },
    {
      title: 'Medical Weight Loss & Body Contouring',
      desc: 'Bio-impedance metabolic mapping, doctor-led fat loss, and RF skin firming.',
      image: HERO_IMAGE,
      link: '/services?category=weight-loss',
      tag: 'Metabolic Care',
    },
    {
      title: 'Fitness & Private Gym Studio',
      desc: 'Functional 1-on-1 athletic training, biomechanical posture screens, and private suites.',
      image: FITNESS_IMAGE,
      link: '/services?category=fitness-gym',
      tag: 'Strength & Movement',
    },
    {
      title: 'Salon, Hair & Trichology',
      desc: 'Detoxifying scalp rituals, botanical keratin repair, and precision editorial styling.',
      image: SALON_IMAGE,
      link: '/services?category=salon-beauty',
      tag: 'Organic Hair Care',
    },
    {
      title: 'Nutri Food & Meal Blueprints',
      desc: 'Clinical dietitian blueprints, macro-calculated nutrition bowls, and antioxidant tonics.',
      image: NUTRITION_IMAGE,
      link: '/services?category=nutri-food',
      tag: 'Functional Fuel',
    },
    {
      title: '360° Integrated Wellness Programs',
      desc: 'Our signature multidisciplinary protocol uniting all five pillars into one transformation.',
      image: HERO_IMAGE,
      link: '/services?category=integrated-wellness',
      tag: 'Flagship Journey',
    },
  ];

  const faqs = [
    {
      q: 'What makes NFYVE – The Change different from standard clinics or gyms?',
      a: 'Most wellness journeys are fragmented—you visit a dermatologist in one part of the city, a gym in another, and attempt independent dieting. At NFYVE in Begumpet, your physician, fitness coach, trichologist, and dietitian collaborate directly under one roof to create a synchronized transformation.',
    },
    {
      q: 'Do I need a doctor consultation before starting aesthetic or weight loss treatments?',
      a: 'Yes. In adherence to medical safety, all aesthetic laser protocols, metabolic weight loss programs, and intensive wellness routines commence with a comprehensive assessment to ensure treatment suitability and zero adverse contraindications.',
    },
    {
      q: 'Can I book individual services or must I enroll in a full package?',
      a: 'You are welcome to book standalone sessions (such as a Hydra-Infusion facial, a 1-on-1 personal training workout, or a salon scalp ritual) or enroll in our coordinated 360° transformation protocols.',
    },
    {
      q: 'Where in Begumpet is NFYVE located and is parking available?',
      a: 'We are located on the 4th Floor of Kura Towers, Begumpet, Hyderabad. Dedicated valet parking and elevator access are provided for all clients.',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-16">
      
      {/* A. Hero Section (Split Screen, Bright, Editorial) */}
      <section className="relative pt-6 sm:pt-12 lg:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Text column with subtle staggered animation */}
          <motion.div 
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#244B3A]">
              <span>Begumpet · Hyderabad</span>
              <span aria-hidden="true">·</span>
              <span>Integrated Transformation Centre</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#244B3A] font-medium tracking-tight leading-[1.12]">
              Look Good. <br className="hidden sm:inline" />
              Feel Better. <br className="hidden sm:inline" />
              <span className="italic font-normal">Live Healthier.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#585B53] leading-relaxed max-w-xl">
              At NFYVE – The Change, we bring together comprehensive clinical aesthetics, metabolic weight loss, private fitness, salon care, and functional nutrition to help you thrive inside and out.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/book-appointment"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#244B3A] hover:bg-[#1a372a] rounded-lg shadow-sm hover:shadow-md transition-smooth"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#244B3A] bg-[#F0EEE5] hover:bg-[#E5E2D6] border border-[#DDD9CE] rounded-lg transition-smooth"
              >
                Explore Services
              </Link>
            </div>

            {/* Quiet trust marker */}
            <div className="pt-4 border-t border-[#E7E5DC] flex items-center gap-6 text-xs text-[#777A70]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#244B3A]" />
                <span>6 Core Disciplines</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#244B3A]" />
                <span>Physician Supervised</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#244B3A]" />
                <span>Kura Towers, Begumpet</span>
              </div>
            </div>
          </motion.div>

          {/* Visual Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#E7E5DC] bg-[#F0EEE5] aspect-[16/10] sm:aspect-[16/11]">
              <img
                src={HERO_IMAGE}
                alt="NFYVE – The Change sanctuary interior in Begumpet"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs flex justify-between items-end">
                <div>
                  <p className="font-serif text-lg font-medium">The Begumpet Sanctuary</p>
                  <p className="text-[#EDEBE2] text-[11px]">4th Floor, Kura Towers · Hyderabad</p>
                </div>
                <span className="bg-[#FAF9F5]/90 text-[#244B3A] px-2.5 py-1 rounded text-[11px] font-semibold backdrop-blur-xs">
                  Valet Available
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* B. Key Benefits Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F0EEE5] border border-[#DDD9CE] rounded-xl p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {benefits.map((b, i) => (
              <div key={i} className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-2xs border border-[#DDD9CE]">
                  {b.icon}
                </div>
                <h3 className="text-sm font-semibold text-[#252923]">{b.title}</h3>
                <p className="text-xs text-[#777A70] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* C. Services Overview (The 6 Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A] mb-1">
              Integrated Capabilities
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#244B3A] font-medium tracking-tight">
              The Six Pillars of Transformation
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#244B3A] hover:underline"
          >
            <span>View Full Service Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceShowcase.map((srv, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group bg-white rounded-xl border border-[#E7E5DC] overflow-hidden hover:border-[#244B3A]/40 transition-smooth flex flex-col"
            >
              <div className="aspect-[4/3] bg-[#F0EEE5] overflow-hidden relative">
                <img
                  src={srv.image}
                  alt={srv.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-smooth duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#FAF9F5]/95 text-[#244B3A] text-[10px] uppercase font-semibold px-2 py-0.5 rounded shadow-2xs backdrop-blur-xs">
                  {srv.tag}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-serif text-lg text-[#252923] group-hover:text-[#244B3A] transition-colors font-medium">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-[#777A70] leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#F0EEE5] flex items-center justify-between">
                  <Link
                    to={srv.link}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#244B3A] hover:underline"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/book-appointment"
                    className="text-[11px] font-medium text-[#777A70] hover:text-[#244B3A]"
                  >
                    Book Slot
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* D. About Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-2xl p-8 sm:p-12 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
                The Sanctuary Concept
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#244B3A] font-medium tracking-tight">
                Hyderabad’s First Truly Unified Wellness Destination
              </h2>
              <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
                Traditional approaches treat your skin, your metabolic health, and your fitness as disconnected silos. You receive skincare advice that contradicts your diet, or workout regimens that irritate your skin barrier.
              </p>
              <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
                At NFYVE, our multi-disciplinary staff conducts cross-discipline consultations. When you step into our 4th-floor Begumpet centre, you enter a private, serene space engineered for total transformation.
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#244B3A] hover:bg-[#1a372a] rounded-lg transition-smooth"
                >
                  <span>Our Story & Philosophy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden aspect-[4/5] bg-[#F0EEE5] border border-[#DDD9CE]">
                  <img
                    src={CLINICAL_IMAGE}
                    alt="Clinical treatment room"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden aspect-[4/5] bg-[#F0EEE5] border border-[#DDD9CE] mt-6">
                  <img
                    src={FITNESS_IMAGE}
                    alt="Fitness and movement suite"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E. Why Choose NFYVE (5 Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
            The NFYVE Advantage
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#244B3A] font-medium tracking-tight">
            Engineered for Measurable Change
          </h2>
          <p className="text-xs sm:text-sm text-[#777A70]">
            Experience five foundational reasons why Begumpet residents trust our integrated sanctuary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-3">
            <span className="font-serif text-2xl font-semibold text-[#244B3A]">01.</span>
            <h3 className="text-sm font-semibold text-[#252923]">Multi-Disciplinary Synergy</h3>
            <p className="text-xs text-[#777A70] leading-relaxed">
              Your doctor, trainer, and nutritionist meet to align treatments. No contradictory prescriptions or conflicting advice.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-3">
            <span className="font-serif text-2xl font-semibold text-[#244B3A]">02.</span>
            <h3 className="text-sm font-semibold text-[#252923]">Hospitality Meets Medicine</h3>
            <p className="text-xs text-[#777A70] leading-relaxed">
              Say goodbye to sterile, intimidating hospitals and chaotic commercial gyms. We cultivate calm, warm, boutique luxury.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-3">
            <span className="font-serif text-2xl font-semibold text-[#244B3A]">03.</span>
            <h3 className="text-sm font-semibold text-[#252923]">Evidence-Based Protocols</h3>
            <p className="text-xs text-[#777A70] leading-relaxed">
              Zero fad diets or untested gimmicks. We rely on certified medical technologies and peer-reviewed protocols.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-3">
            <span className="font-serif text-2xl font-semibold text-[#244B3A]">04.</span>
            <h3 className="text-sm font-semibold text-[#252923]">Total Time Efficiency</h3>
            <p className="text-xs text-[#777A70] leading-relaxed">
              Complete your skin consultation, training session, trichology rinse, and wholesome lunch in one uninterrupted visit.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-3">
            <span className="font-serif text-2xl font-semibold text-[#244B3A]">05.</span>
            <h3 className="text-sm font-semibold text-[#252923]">Uncompromising Hygiene</h3>
            <p className="text-xs text-[#777A70] leading-relaxed">
              Medical-grade autoclave sterilization, cleanroom air filters, and private single-occupancy treatment chambers.
            </p>
          </div>

          <div className="bg-[#244B3A] p-6 rounded-xl text-white space-y-3 flex flex-col justify-between">
            <div>
              <span className="font-serif text-2xl font-semibold text-[#A8B8A0]">06.</span>
              <h3 className="text-sm font-semibold text-white mt-1">Ready for Your Assessment?</h3>
              <p className="text-xs text-[#C5C9BF] leading-relaxed mt-1">
                Consult with our lead aesthetics physician and fitness director.
              </p>
            </div>
            <Link
              to="/book-appointment"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FAF9F5] underline hover:text-white"
            >
              <span>Schedule Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* F. Facilities Preview & Gallery Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A] mb-1">
              Architecture & Spaces
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#244B3A] font-medium tracking-tight">
              Tour Our Begumpet Sanctuary
            </h2>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#244B3A] hover:underline"
          >
            <span>View All Facilities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl overflow-hidden aspect-[4/3] bg-[#F0EEE5] border border-[#DDD9CE] group relative">
            <img
              src={HERO_IMAGE}
              alt="Reception and lounge"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-104 transition-smooth"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 text-white text-xs font-medium">
              Sanctuary Reception
            </div>
          </div>
          <div className="rounded-xl overflow-hidden aspect-[4/3] bg-[#F0EEE5] border border-[#DDD9CE] group relative">
            <img
              src={CLINICAL_IMAGE}
              alt="Clinical dermatological suite"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-104 transition-smooth"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 text-white text-xs font-medium">
              Clinical Aesthetic Suite
            </div>
          </div>
          <div className="rounded-xl overflow-hidden aspect-[4/3] bg-[#F0EEE5] border border-[#DDD9CE] group relative">
            <img
              src={FITNESS_IMAGE}
              alt="Private training floor"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-104 transition-smooth"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 text-white text-xs font-medium">
              Private Movement Floor
            </div>
          </div>
          <div className="rounded-xl overflow-hidden aspect-[4/3] bg-[#F0EEE5] border border-[#DDD9CE] group relative">
            <img
              src={SALON_IMAGE}
              alt="Hair & trichology lounge"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-104 transition-smooth"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 text-white text-xs font-medium">
              Bespoke Salon & Hair Care
            </div>
          </div>
        </div>
      </section>

      {/* G. Customer Testimonials Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A] mb-1">
              Member Experiences
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#244B3A] font-medium tracking-tight">
              Real Stories of Transformation
            </h2>
          </div>
          <Link
            to="/reviews"
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#244B3A] hover:underline"
          >
            <span>Read All Verified Reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_REVIEWS.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-xl border border-[#E7E5DC] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#585B53] leading-relaxed italic">
                  "{rev.reviewText}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#F0EEE5]">
                <p className="text-xs font-semibold text-[#252923]">{rev.customerName}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#777A70]">
                  <span>{rev.serviceCategory}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[10px] text-emerald-800 font-medium">Verified Client</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* H. Appointment CTA Band */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#244B3A] rounded-2xl p-8 sm:p-12 text-center text-white space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight">
              Ready to Experience The Change?
            </h2>
            <p className="text-xs sm:text-sm text-[#A8B8A0] leading-relaxed">
              Schedule your appointment online or contact our Begumpet concierge for guidance on customized wellness programs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/book-appointment"
              className="w-full sm:w-auto px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#244B3A] bg-[#FAF9F5] hover:bg-white rounded-lg shadow-sm transition-smooth whitespace-nowrap"
            >
              Book Appointment Online
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white border border-[#A8B8A0]/50 hover:border-white rounded-lg transition-smooth whitespace-nowrap"
            >
              Contact Sanctuary Concierge
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap justify-center items-center gap-6 text-xs text-[#C5C9BF]">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#A8B8A0]" /> Begumpet, Hyderabad
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#A8B8A0]" /> Open Daily 7 AM – 9 PM
            </span>
          </div>
        </div>
      </section>

      {/* I. FAQ Preview Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-1.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
            Questions & Answers
          </div>
          <h2 className="font-serif text-3xl text-[#244B3A] font-medium tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E7E5DC] rounded-xl overflow-hidden transition-smooth"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="text-xs sm:text-sm font-semibold text-[#252923]">
                  {faq.q}
                </span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#244B3A] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#777A70] shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#585B53] leading-relaxed border-t border-[#F0EEE5] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link to="/faq" className="text-xs font-semibold text-[#244B3A] hover:underline">
            View Complete FAQ Directory →
          </Link>
        </div>
      </section>

    </div>
  );
};
