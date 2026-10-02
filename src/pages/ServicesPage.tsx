import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, IndianRupee, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { Service, ServiceCategory } from '../types';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedCategorySlug = searchParams.get('category') || 'all';

  useEffect(() => {
    Promise.all([api.getCategories(), api.getServices()])
      .then(([cats, srvs]) => {
        setCategories(cats);
        setServices(srvs);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleCategorySelect = (slug: string) => {
    if (slug === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: slug });
    }
  };

  const filteredServices = services.filter((srv) => {
    if (selectedCategorySlug === 'all') return true;
    const cat = categories.find((c) => c.slug === selectedCategorySlug);
    return cat ? srv.categoryId === cat.id : true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-24">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
          Clinical & Wellness Directory
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#244B3A] font-medium tracking-tight">
          Evidence-Based Care. Tailored to Your Physiology.
        </h1>
        <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
          Explore treatments across our six foundational disciplines. All aesthetic, metabolic, and intensive physical protocols include an initial assessment by our Begumpet practitioners.
        </p>
      </div>

      {/* Category Tabs (Segmented Button Control, Zero-Pill) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E7E5DC] no-scrollbar">
        <button
          onClick={() => handleCategorySelect('all')}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-smooth ${
            selectedCategorySlug === 'all'
              ? 'bg-[#244B3A] text-white shadow-xs'
              : 'text-[#585B53] hover:text-[#252923] hover:bg-[#F0EEE5]'
          }`}
        >
          All Offerings ({services.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.slug)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-smooth ${
              selectedCategorySlug === cat.slug
                ? 'bg-[#244B3A] text-white shadow-xs'
                : 'text-[#585B53] hover:text-[#252923] hover:bg-[#F0EEE5]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-[#777A70]">
          Loading clinical offerings...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl border border-[#E7E5DC] overflow-hidden hover:border-[#244B3A]/50 transition-smooth flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-[#F0EEE5] overflow-hidden relative">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-103 transition-smooth duration-500"
                    />
                    <div className="absolute bottom-3 left-3 bg-[#FAF9F5]/95 text-[#244B3A] text-[11px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
                      {service.categoryName}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-serif text-xl font-medium text-[#252923]">
                        {service.name}
                      </h3>
                      <p className="text-xs text-[#585B53] leading-relaxed line-clamp-3">
                        {service.shortDesc}
                      </p>
                    </div>

                    {/* Metadata strip: tabular numbers, unboxed */}
                    <div className="flex items-center gap-4 text-xs text-[#777A70] pt-2 border-t border-[#F0EEE5]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#244B3A]" />
                        <span className="tabular-nums">{service.durationMins} mins</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-[#244B3A]">
                        <span>₹</span>
                        <span className="tabular-nums">{service.priceInr.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Benefits preview */}
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[11px] font-semibold text-[#585B53] uppercase tracking-wider">
                        Key Advantages:
                      </div>
                      <ul className="space-y-1 text-xs text-[#585B53]">
                        {service.benefits.slice(0, 2).map((benefit, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#244B3A] shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 border-t border-[#F0EEE5] mt-4 flex items-center justify-between">
                  <Link
                    to={`/services/${service.slug}`}
                    className="text-xs font-semibold text-[#244B3A] hover:underline"
                  >
                    Details & Protocols
                  </Link>
                  <Link
                    to={`/book-appointment?serviceId=${service.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#244B3A] hover:bg-[#1a372a] rounded-lg transition-smooth"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Clinical Disclaimer Notice */}
      <div className="bg-[#F0EEE5] border border-[#DDD9CE] rounded-xl p-5 flex items-start gap-3 text-xs text-[#585B53] leading-relaxed">
        <AlertCircle className="w-5 h-5 text-[#244B3A] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#252923]">Clinical Transparency Note: </span>
          Individual results may vary based on physiological baselines, compliance with dietary protocols, and metabolic factors. A formal medical consultation is required prior to commencing advanced dermatological, laser, or metabolic weight loss programs.
        </div>
      </div>

    </div>
  );
};
