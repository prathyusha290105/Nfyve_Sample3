import { ServiceCategory, Service, Staff, Review, BusinessSettings } from '../types';

export const HERO_IMAGE = '/src/assets/images/nfyve_hero_wellness_1790943426252.jpg';
export const CLINICAL_IMAGE = '/src/assets/images/nfyve_clinical_aesthetics_1790943438599.jpg';
export const FITNESS_IMAGE = '/src/assets/images/nfyve_fitness_gym_1790943449793.jpg';
export const SALON_IMAGE = '/src/assets/images/nfyve_salon_beauty_1790943462385.jpg';
export const NUTRITION_IMAGE = '/src/assets/images/nfyve_nutrition_wellness_1790943477485.jpg';

export const INITIAL_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-1',
    name: 'Clinical Aesthetics & Skin Health',
    slug: 'clinical-aesthetics',
    description: 'Advanced medical-grade dermatology, precision facials, and evidence-based non-surgical skin rejuvenation.',
    displayOrder: 1,
  },
  {
    id: 'cat-2',
    name: 'Medical Weight Loss & Body Contouring',
    slug: 'weight-loss',
    description: 'Doctor-supervised metabolic transformation programs and non-invasive body sculpting protocols.',
    displayOrder: 2,
  },
  {
    id: 'cat-3',
    name: 'Fitness & Gym',
    slug: 'fitness-gym',
    description: 'Private functional strength studios, bespoke 1-on-1 athletic coaching, and corrective movement therapy.',
    displayOrder: 3,
  },
  {
    id: 'cat-4',
    name: 'Salon, Hair & Beauty',
    slug: 'salon-beauty',
    description: 'Editorial hair design, restorative scalp therapies, botanical grooming, and precision nail care.',
    displayOrder: 4,
  },
  {
    id: 'cat-5',
    name: 'Nutri Food & Personalized Nutrition',
    slug: 'nutri-food',
    description: 'Clinical dietary consultations, personalized metabolic meal plans, and nutrient-dense culinary selections.',
    displayOrder: 5,
  },
  {
    id: 'cat-6',
    name: 'Integrated Wellness Programs',
    slug: 'integrated-wellness',
    description: 'Holistic multi-disciplinary roadmaps combining aesthetics, fitness, salon restoration, and functional nutrition.',
    displayOrder: 6,
  },
];

export const INITIAL_SERVICES: Service[] = [
  // 1. Clinical Aesthetics
  {
    id: 'srv-101',
    categoryId: 'cat-1',
    name: 'Hydra-Infusion Clinical Facial',
    slug: 'hydra-infusion-clinical-facial',
    shortDesc: 'Multi-step vortex dermal cleansing, non-irritating lactic exfoliation, and targeted hyaluronic serum infusion.',
    fullDesc: 'Our signature Hydra-Infusion Clinical Facial combines deep vacuum vortex extraction with medical-grade antioxidant and peptide infusions. Designed to restore barrier hydration, soften fine lines, and clarify congested pores without downtime. Every session begins with a computerized 3D skin moisture assessment.',
    durationMins: 60,
    priceInr: 4500,
    imageUrl: CLINICAL_IMAGE,
    benefits: [
      'Deep pore clarification and blackhead extraction',
      'Intense multi-molecular hyaluronic acid hydration',
      'Visible immediate radiance with zero post-treatment peeling',
      'Customized antioxidant infusion tailored to skin sensitivity'
    ],
    precautions: [
      'Avoid active retinoids or AHA/BHA exfoliants 48 hours prior',
      'Use broad-spectrum SPF 50+ sunscreen following treatment'
    ],
    isActive: true,
    createdAt: '2025-01-10T09:00:00Z',
  },
  {
    id: 'srv-102',
    categoryId: 'cat-1',
    name: 'Laser Skin Photorejuvenation',
    slug: 'laser-skin-photorejuvenation',
    shortDesc: 'Targeted broad-band light energy addressing hyperpigmentation, vascular redness, and collagen synthesis.',
    fullDesc: 'A non-invasive clinical laser protocol targeting stubborn sun spots, acne pigmentation, and diffuse facial flushing. Focused light pulses stimulate deep dermal fibroblasts to synthesize new collagen, resulting in unified skin tone and improved skin elasticity.',
    durationMins: 45,
    priceInr: 6800,
    imageUrl: CLINICAL_IMAGE,
    benefits: [
      'Noticeable reduction in sun-induced pigmentation and brown spots',
      'Calms vascular redness and broken capillaries',
      'Stimulates endogenous collagen and elastin remodeling'
    ],
    precautions: [
      'Comprehensive patch test performed during consultation',
      'Direct sun exposure strictly avoided for 7 days post-procedure'
    ],
    isActive: true,
    createdAt: '2025-01-12T10:00:00Z',
  },
  {
    id: 'srv-103',
    categoryId: 'cat-1',
    name: 'Medical Micro-Needling with Growth Factors',
    slug: 'medical-micro-needling',
    shortDesc: 'Automated fractional microneedling paired with bio-identical growth factors for scar revision and texture refinement.',
    fullDesc: 'Medical-grade automated micro-needles create calibrated vertical micro-channels that trigger the skin’s wound-healing cascade. Infused with sterile recombinant growth factors and polynucleotides to visibly improve acne scarring, textural irregularities, and enlarged pores.',
    durationMins: 75,
    priceInr: 8500,
    imageUrl: CLINICAL_IMAGE,
    benefits: [
      'Clinically proven remodeling of atrophic acne scars',
      'Refines pore diameter and epidermal texture',
      'Deep stimulation of structural dermal collagen fibers'
    ],
    precautions: [
      'Mild erythema (sunburn-like sensation) expected for 24-48 hours',
      'No makeup application for 24 hours post-session'
    ],
    isActive: true,
    createdAt: '2025-01-15T11:00:00Z',
  },

  // 2. Weight Loss & Body Contouring
  {
    id: 'srv-201',
    categoryId: 'cat-2',
    name: 'Doctor-Led Metabolic Assessment & Protocol',
    slug: 'metabolic-weight-loss-protocol',
    shortDesc: 'Comprehensive bio-impedance body composition, hormonal profile review, and personalized metabolic stabilization.',
    fullDesc: 'Our clinical weight transformation begins with an in-depth medical evaluation. We measure visceral fat index, basal metabolic rate (BMR), and skeletal muscle mass, developing an individualized medical roadmap that pairs nutritional biochemistry with lifestyle coaching for sustainable fat reduction.',
    durationMins: 60,
    priceInr: 3500,
    imageUrl: HERO_IMAGE,
    benefits: [
      'Gold-standard segmental body composition scan',
      'Physician-reviewed hormonal and metabolic markers',
      'Sustainable non-crash nutrition protocol designed for long-term health'
    ],
    precautions: [
      'Fasting for 4 hours prior to initial scan recommended',
      'Bring recent blood test panels if available'
    ],
    isActive: true,
    createdAt: '2025-01-20T09:00:00Z',
  },
  {
    id: 'srv-202',
    categoryId: 'cat-2',
    name: 'Non-Invasive RF Body Contouring',
    slug: 'non-invasive-rf-body-contouring',
    shortDesc: 'Controlled thermal radiofrequency and vacuum therapy to tighten skin laxity and target stubborn localized fat deposits.',
    fullDesc: 'Safe, pain-free therapeutic radiofrequency warms deep subcutaneous tissue layers to induce immediate collagen contraction and gradual apoptosis in adipocytes. Ideal for the abdomen, flanks, arms, and thighs without incisions or recovery downtime.',
    durationMins: 60,
    priceInr: 7200,
    imageUrl: HERO_IMAGE,
    benefits: [
      'Non-surgical reduction in circumference for target regions',
      'Firms lax post-weight-loss skin tissue',
      'Comfortable warming sensation with immediate return to daily activities'
    ],
    precautions: [
      'Hydration before and after treatment is essential for lymphatic drainage',
      'Not suitable during pregnancy or with metal implants in the treatment zone'
    ],
    isActive: true,
    createdAt: '2025-01-22T10:00:00Z',
  },

  // 3. Fitness & Gym
  {
    id: 'srv-301',
    categoryId: 'cat-3',
    name: '1-on-1 Bespoke Personal Training Session',
    slug: 'personal-training-session',
    shortDesc: 'Private, uncrowded functional fitness coaching tailored to mobility, muscle architecture, and cardiovascular resilience.',
    fullDesc: 'Train directly with our certified strength & conditioning specialists in our private Begumpet fitness facility. Each session focuses on biomechanical alignment, progressive resistance training, and functional mobility routines customized to your current fitness tier.',
    durationMins: 60,
    priceInr: 2000,
    imageUrl: FITNESS_IMAGE,
    benefits: [
      'Dedicated private training space with premium equipment',
      'Real-time posture, kinetic chain, and form corrections',
      'Periodized workout plans logged directly into your customer profile'
    ],
    isActive: true,
    createdAt: '2025-01-25T08:00:00Z',
  },
  {
    id: 'srv-302',
    categoryId: 'cat-3',
    name: 'Kinetic Movement & Posture Assessment',
    slug: 'posture-movement-assessment',
    shortDesc: 'Biomechanical screen identifying muscle imbalances, spinal articulation restrictions, and joint mobility bottlenecks.',
    fullDesc: 'A 45-minute clinical movement analysis evaluating your gait, thoracic mobility, hip hinging, and core stability. Essential for desk workers, athletes recovering from injury, or individuals seeking injury-free fitness progression.',
    durationMins: 45,
    priceInr: 1800,
    imageUrl: FITNESS_IMAGE,
    benefits: [
      'Pinpoint chronic neck, back, and hip tension triggers',
      'Receive a custom corrective exercise prescription',
      'Direct coordination with our personal training and massage teams'
    ],
    isActive: true,
    createdAt: '2025-01-28T14:00:00Z',
  },

  // 4. Salon, Hair & Beauty
  {
    id: 'srv-401',
    categoryId: 'cat-4',
    name: 'Botanical Keratin & Scalp Health Ritual',
    slug: 'botanical-keratin-scalp-ritual',
    shortDesc: 'Detoxifying trichological scalp exfoliation followed by organic botanical protein restructuring for silky hair resilience.',
    fullDesc: 'A therapeutic sanctuary ritual for tired hair and compromised scalps. Begins with high-frequency micro-circulation stimulation and an organic clay scalp scrub, followed by an intensive plant-derived keratin infusion under gentle steam.',
    durationMins: 90,
    priceInr: 4200,
    imageUrl: SALON_IMAGE,
    benefits: [
      'Removes micro-pollutants and sebum buildup from the follicular base',
      'Reconstructs damaged cuticle bonds without harsh formaldehydes',
      'Leaves hair visibly supple, frizz-free, and luminously radiant'
    ],
    isActive: true,
    createdAt: '2025-02-01T11:00:00Z',
  },
  {
    id: 'srv-402',
    categoryId: 'cat-4',
    name: 'Executive Hair Styling & Consultation',
    slug: 'executive-hair-styling',
    shortDesc: 'Bespoke facial framing haircut, luxury wash with botanical conditioning, and blow-dry styling by master stylists.',
    fullDesc: 'Refined precision cutting adapted to your facial proportions, hair density, and lifestyle habits. Includes an aromatic tension-relief head massage, nourishing botanical shampoo, and customized blow-dry styling.',
    durationMins: 60,
    priceInr: 2200,
    imageUrl: SALON_IMAGE,
    benefits: [
      'Consultation with senior master stylists',
      'Scalp-relaxing botanical massage included',
      'Personalized at-home maintenance styling guidance'
    ],
    isActive: true,
    createdAt: '2025-02-03T12:00:00Z',
  },

  // 5. Nutri Food & Personalized Nutrition
  {
    id: 'srv-501',
    categoryId: 'cat-5',
    name: 'Clinical Dietitian Consultation & Meal Blueprint',
    slug: 'clinical-nutrition-consultation',
    shortDesc: 'One-on-one nutrition mapping based on gut health, blood glucose stability, energy demands, and taste preferences.',
    fullDesc: 'Collaborate with our registered senior nutritionist to build a culturally grounded, realistic nutrition plan. We replace fad diets with nutrient-dense regional Indian whole foods, optimizing gut microbiota, daily focus, and body fat regulation.',
    durationMins: 45,
    priceInr: 2500,
    imageUrl: NUTRITION_IMAGE,
    benefits: [
      '7-day customized grocery and meal composition guide',
      'Practical portion guidance and dining-out strategies',
      'Integration with NFYVE Nutri Food culinary bar subscriptions'
    ],
    isActive: true,
    createdAt: '2025-02-05T09:30:00Z',
  },
  {
    id: 'srv-502',
    categoryId: 'cat-5',
    name: 'Nutri Food Cleanse & Functional Bowl Plan (Weekly)',
    slug: 'nutri-food-weekly-plan',
    shortDesc: 'Chef-crafted, dietitian-approved fresh daily wellness meals prepared at our Begumpet nutrition kitchen.',
    fullDesc: 'Wholesome, macro-balanced daily bowls, cold-pressed antioxidant elixirs, and high-protein clean snacks prepared fresh every morning with organic regional ingredients. Fully aligned with your metabolic goals.',
    durationMins: 30,
    priceInr: 5500,
    imageUrl: NUTRITION_IMAGE,
    benefits: [
      'Fresh daily preparation with zero refined sugars or artificial additives',
      'Precisely calculated calorie and macronutrient breakdown on each bowl',
      'Convenient pickup or local Hyderabad delivery coordination'
    ],
    isActive: true,
    createdAt: '2025-02-07T10:00:00Z',
  },

  // 6. Integrated Wellness Programs
  {
    id: 'srv-601',
    categoryId: 'cat-6',
    name: 'The 360° NFYVE Transformation Protocol',
    slug: '360-transformation-protocol',
    shortDesc: 'Our signature 8-week coordinated program uniting aesthetics, metabolic weight loss, fitness, nutrition, and salon care.',
    fullDesc: 'The definitive manifestation of NFYVE – The Change. A collaborative multidisciplinary journey where your clinical aesthetician, fitness coach, senior nutritionist, and salon stylist work as one unified team to recalibrate your wellness and appearance inside and out.',
    durationMins: 90,
    priceInr: 28500,
    imageUrl: HERO_IMAGE,
    benefits: [
      'Full cross-disciplinary team coordination under one roof',
      'Bi-weekly clinical metric tracking and program calibration',
      'Includes dedicated aesthetic sessions, 1-on-1 gym coaching, and nutrition supply'
    ],
    precautions: [
      'Initial 60-minute health clearance consultation required prior to enrollment'
    ],
    isActive: true,
    createdAt: '2025-02-10T14:00:00Z',
  }
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'st-1',
    userId: 'usr-staff-ananya',
    name: 'Dr. Ananya Reddy',
    email: 'dr.ananya@nfyve.com',
    phone: '+91 9000023051',
    roleTitle: 'Chief Aesthetics Physician',
    specialty: 'Clinical Dermatology & Laser Rejuvenation',
    specialties: ['Clinical Aesthetics & Skin Health', 'Laser Photorejuvenation', 'Medical Micro-Needling'],
    bio: 'Over 12 years of specialized practice in medical aesthetics, focused on non-surgical facial harmony and skin barrier rehabilitation.',
    isActive: true,
    createdAt: '2025-01-02T09:00:00Z',
  },
  {
    id: 'st-2',
    userId: 'usr-staff-vikram',
    name: 'Coach Vikram Singh',
    email: 'vikram.singh@nfyve.com',
    phone: '+91 9000023052',
    roleTitle: 'Head of Fitness & Movement',
    specialty: 'Functional Strength & Corrective Biomechanics',
    specialties: ['Fitness & Gym', 'Kinetic Posture Assessment', 'Personal Athletic Coaching'],
    bio: 'Former national athlete and certified CSCS coach dedicated to sustainable joint-friendly strength building.',
    isActive: true,
    createdAt: '2025-01-03T09:00:00Z',
  },
  {
    id: 'st-3',
    userId: 'usr-staff-kavita',
    name: 'Kavita Nair, RD',
    email: 'kavita.nair@nfyve.com',
    phone: '+91 9000023053',
    roleTitle: 'Lead Clinical Nutritionist',
    specialty: 'Metabolic Health & Functional Meal Design',
    specialties: ['Nutri Food & Personalized Nutrition', 'Medical Weight Loss', 'Metabolic Assessments'],
    bio: 'Specialist in endocrine nutrition, sustainable fat loss, and customized gut-health restoration protocols.',
    isActive: true,
    createdAt: '2025-01-04T09:00:00Z',
  },
  {
    id: 'st-4',
    userId: 'usr-staff-sameer',
    name: 'Sameer Khan',
    email: 'sameer.khan@nfyve.com',
    phone: '+91 9000023054',
    roleTitle: 'Master Hair & Scalp Specialist',
    specialty: 'Trichology Rituals & Precision Styling',
    specialties: ['Salon, Hair & Beauty', 'Botanical Scalp Health', 'Precision Styling'],
    bio: 'International salon veteran bringing bespoke European cutting craft and organic scalp restorative techniques.',
    isActive: true,
    createdAt: '2025-01-05T09:00:00Z',
  },
  {
    id: 'st-5',
    userId: 'usr-staff-1',
    name: 'Rohan Mehra',
    email: 'staff@nfyve.com',
    phone: '+91 9000023055',
    roleTitle: 'Clinic Concierge & Operations',
    specialty: 'Integrated Transformation Logistics',
    specialties: ['Integrated Wellness Programs', 'Consultation Triage', 'Sanctuary Concierge'],
    bio: 'Over 8 years managing premier hospitality and luxury wellness centers across Hyderabad.',
    isActive: true,
    createdAt: '2025-01-06T09:00:00Z',
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customerName: 'Meera Rao',
    serviceCategory: 'Clinical Aesthetics & Skin Health',
    serviceName: 'Hydra-Infusion Clinical Facial',
    rating: 5,
    reviewText: 'Having all wellness aspects under one roof at Kura Towers in Begumpet is an absolute game-changer. The Hydra-Infusion facial left my skin visibly nourished without any redness, and the clinic ambiance is so serene.',
    reviewDate: '2026-08-14',
    isApproved: true,
    isSample: true,
  },
  {
    id: 'rev-2',
    customerName: 'Aditya Varma',
    serviceCategory: 'Fitness & Gym',
    serviceName: '1-on-1 Bespoke Personal Training Session',
    rating: 5,
    reviewText: 'Coach Vikram’s biomechanical assessment pinpointed my chronic lower back stiffness on day one. Training in a calm, private space without loud commercial gym chaos made my consistency effortless.',
    reviewDate: '2026-07-28',
    isApproved: true,
    isSample: true,
  },
  {
    id: 'rev-3',
    customerName: 'Sanjana K.',
    serviceCategory: 'Nutri Food & Personalized Nutrition',
    serviceName: 'Clinical Dietitian Consultation & Meal Blueprint',
    rating: 5,
    reviewText: 'Kavita designed a realistic meal plan that works seamlessly with my corporate work schedule in Hyderabad. Paired with the Nutri Food bowls, I feel noticeably lighter and more energetic throughout the day.',
    reviewDate: '2026-09-02',
    isApproved: true,
    isSample: true,
  },
  {
    id: 'rev-4',
    customerName: 'Rahul Deshmukh',
    serviceCategory: 'Medical Weight Loss & Body Contouring',
    serviceName: 'Doctor-Led Metabolic Assessment & Protocol',
    rating: 5,
    reviewText: 'I appreciated the medical grounding behind their weight loss program. Instead of unrealistic crash diets, we tracked visceral fat and muscle mass. A thoroughly scientific and empathetic approach.',
    reviewDate: '2026-06-19',
    isApproved: true,
    isSample: true,
  },
  {
    id: 'rev-5',
    customerName: 'Pooja Agarwal',
    serviceCategory: 'Salon, Hair & Beauty',
    serviceName: 'Botanical Keratin & Scalp Health Ritual',
    rating: 5,
    reviewText: 'The botanical scalp massage and keratin ritual revived my hair completely after months of heat damage. Sameer and the salon staff were courteous, attentive, and exceptionally skilled.',
    reviewDate: '2026-09-18',
    isApproved: true,
    isSample: true,
  }
];

export const BUSINESS_SETTINGS: BusinessSettings = {
  businessName: 'NFYVE – The Change',
  location: 'Begumpet, Hyderabad',
  address: '4th Floor, Kura Towers, Begumpet, Hyderabad, Telangana 500016, India',
  phone: '+91 9000023050',
  email: 'support@nfyve.com',
  openingHours: {
    weekdays: '7:00 AM – 9:00 PM',
    saturday: '8:00 AM – 8:00 PM',
    sunday: '8:00 AM – 6:00 PM',
  },
  cancellationPolicy: 'Appointments may be cancelled or rescheduled up to 12 hours prior to the scheduled slot with zero cancellation penalty. Late cancellations can be rescheduled through our concierge team.',
};
