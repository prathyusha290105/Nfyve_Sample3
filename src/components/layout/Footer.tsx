import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1E3B2E] text-[#EDEBE2] border-t border-[#2D5342]">
      {/* Upper newsletter / CTA strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-[#2D5342]/70">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium tracking-tight">
              Begin Your Integrated Transformation in Begumpet
            </h3>
            <p className="mt-2 text-sm text-[#A8B8A0] max-w-xl">
              Discover medical aesthetics, clinical weight loss, functional fitness, holistic salon therapies, and personalized nutrition harmonized under one sanctuary roof.
            </p>
          </div>
          <div className="md:col-span-5 flex flex-col sm:flex-row gap-3 md:justify-end">
            <Link
              to="/book-appointment"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#1E3B2E] bg-[#FAF9F5] hover:bg-white rounded-lg shadow-sm transition-smooth whitespace-nowrap"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white border border-[#A8B8A0]/40 hover:border-white rounded-lg transition-smooth whitespace-nowrap"
            >
              Contact Concierge
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand & Address */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                NFYVE <span className="font-sans text-xs tracking-widest text-[#A8B8A0] uppercase font-normal">· THE CHANGE</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[#C5C9BF]">
              Hyderabad’s premier multi-disciplinary transformation sanctuary. Founded on evidence-based dermatology, physician-guided metabolic health, bespoke movement, and clean nutrition.
            </p>
            <div className="space-y-2 text-xs text-[#C5C9BF] pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#A8B8A0] shrink-0 mt-0.5" />
                <span>4th Floor, Kura Towers, Begumpet, Hyderabad, Telangana 500016</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#A8B8A0] shrink-0" />
                <a href="tel:+919000023050" className="hover:text-white transition-colors tabular-nums">
                  +91 9000023050
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#A8B8A0] shrink-0" />
                <a href="mailto:support@nfyve.com" className="hover:text-white transition-colors">
                  support@nfyve.com
                </a>
              </div>
            </div>
          </div>

          {/* Six Service Pillars */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A8B8A0]">
              The Six Pillars
            </h4>
            <ul className="space-y-2 text-xs text-[#C5C9BF]">
              <li>
                <Link to="/services?category=clinical-aesthetics" className="hover:text-white transition-colors">
                  Clinical Aesthetics & Skin Health
                </Link>
              </li>
              <li>
                <Link to="/services?category=weight-loss" className="hover:text-white transition-colors">
                  Medical Weight Loss & Contouring
                </Link>
              </li>
              <li>
                <Link to="/services?category=fitness-gym" className="hover:text-white transition-colors">
                  Fitness & Private Gym Studio
                </Link>
              </li>
              <li>
                <Link to="/services?category=salon-beauty" className="hover:text-white transition-colors">
                  Salon, Hair & Trichology
                </Link>
              </li>
              <li>
                <Link to="/services?category=nutri-food" className="hover:text-white transition-colors">
                  Nutri Food & Meal Blueprints
                </Link>
              </li>
              <li>
                <Link to="/services?category=integrated-wellness" className="hover:text-white transition-colors">
                  360° Integrated Transformations
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A8B8A0]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#C5C9BF]">
              <li><Link to="/about" className="hover:text-white transition-colors">About NFYVE</Link></li>
              <li><Link to="/why-choose-us" className="hover:text-white transition-colors">Why Choose Us</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">Centre Gallery</Link></li>
              <li><Link to="/reviews" className="hover:text-white transition-colors">Verified Reviews</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Staff & Customer Portal</Link></li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A8B8A0]">
              Sanctuary Hours
            </h4>
            <div className="space-y-2 text-xs text-[#C5C9BF]">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#A8B8A0] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Monday – Friday</p>
                  <p className="text-[11px] tabular-nums">7:00 AM – 9:00 PM</p>
                </div>
              </div>
              <div className="pl-6">
                <p className="font-medium text-white">Saturday</p>
                <p className="text-[11px] tabular-nums">8:00 AM – 8:00 PM</p>
              </div>
              <div className="pl-6">
                <p className="font-medium text-white">Sunday</p>
                <p className="text-[11px] tabular-nums">8:00 AM – 6:00 PM</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-[#2D5342]/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#98A392]">
          <p>© {new Date().getFullYear()} NFYVE – The Change. All rights reserved. Begumpet, Hyderabad.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Clinical Disclaimers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
