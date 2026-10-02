import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, MapPin } from 'lucide-react';
import { 
  HERO_IMAGE, 
  CLINICAL_IMAGE, 
  FITNESS_IMAGE, 
  SALON_IMAGE, 
  NUTRITION_IMAGE 
} from '../data/initialData';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  aspect: string;
}

export const GalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Spaces' },
    { id: 'interiors', label: 'Clinic Interiors' },
    { id: 'aesthetics', label: 'Aesthetic Suites' },
    { id: 'fitness', label: 'Fitness & Movement' },
    { id: 'salon', label: 'Salon & Hair' },
    { id: 'nutrition', label: 'Nutri Food Lounge' },
  ];

  const galleryItems: GalleryItem[] = [
    {
      id: 'g-1',
      title: 'Sanctuary Reception & Botanical Lounge',
      category: 'interiors',
      description: 'Warm cream travertine reception designed with acoustic dampening and natural daylight to soothe the senses.',
      imageUrl: HERO_IMAGE,
      aspect: 'aspect-[16/10]',
    },
    {
      id: 'g-2',
      title: 'Clinical Laser & Hydra Suite',
      category: 'aesthetics',
      description: 'Sterile dermatological procedure suite equipped with medical-grade lasers and vortex dermal infusion systems.',
      imageUrl: CLINICAL_IMAGE,
      aspect: 'aspect-[4/3]',
    },
    {
      id: 'g-3',
      title: 'Private Movement & Athletic Coaching Floor',
      category: 'fitness',
      description: 'Uncrowded functional training arena with matte black calibrated weights and posture assessment grids.',
      imageUrl: FITNESS_IMAGE,
      aspect: 'aspect-[4/3]',
    },
    {
      id: 'g-4',
      title: 'Trichology & Botanical Hair Care Studio',
      category: 'salon',
      description: 'Bespoke European styling stations with ergonomic wash lounges and gentle scalp steam rituals.',
      imageUrl: SALON_IMAGE,
      aspect: 'aspect-[4/3]',
    },
    {
      id: 'g-5',
      title: 'Nutri Food Culinary Bar & Consultation Table',
      category: 'nutrition',
      description: 'Organic cold-pressed elixir counter and clinical dietary mapping space.',
      imageUrl: NUTRITION_IMAGE,
      aspect: 'aspect-[4/3]',
    },
    {
      id: 'g-6',
      title: 'Contouring & Body Sculpting Chamber',
      category: 'aesthetics',
      description: 'Therapeutic radiofrequency and lymphatic drainage therapy suite.',
      imageUrl: HERO_IMAGE,
      aspect: 'aspect-[4/3]',
    },
  ];

  const filtered = galleryItems.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-24">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
          Visual Tour
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#244B3A] font-medium tracking-tight">
          Spaces Crafted for Deep Restoration
        </h1>
        <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
          Step inside our 4th-floor sanctuary at Kura Towers, Begumpet. Every room is balanced with acoustic privacy, medical-grade hygiene, and natural botanical warmth.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E7E5DC] no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-smooth ${
              selectedCategory === c.id
                ? 'bg-[#244B3A] text-white shadow-xs'
                : 'text-[#585B53] hover:text-[#252923] hover:bg-[#F0EEE5]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Staggered Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              onClick={() => setActiveImage(item)}
              className="group cursor-pointer rounded-xl overflow-hidden border border-[#E7E5DC] bg-[#F0EEE5] relative"
            >
              <div className={`${item.aspect} overflow-hidden`}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-104 transition-smooth duration-500"
                />
              </div>

              {/* Hover overlay with zoom hint */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                <div className="flex justify-end">
                  <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-xs">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium">{item.title}</h3>
                  <p className="text-xs text-[#EDEBE2] line-clamp-2 mt-0.5">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveImage(null)}
        >
          <div 
            className="bg-[#FAF9F5] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#DDD9CE] relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
              aria-label="Close image viewer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[16/10] bg-black">
              <img
                src={activeImage.imageUrl}
                alt={activeImage.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 space-y-2 bg-[#FAF9F5]">
              <div className="flex items-center justify-between text-xs text-[#777A70]">
                <span className="uppercase font-semibold tracking-wider text-[#244B3A]">
                  {activeImage.category}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#244B3A]" /> 4th Floor, Kura Towers, Begumpet
                </span>
              </div>
              <h3 className="font-serif text-2xl text-[#252923] font-medium">
                {activeImage.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
                {activeImage.description}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
