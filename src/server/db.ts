import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  User, 
  ServiceCategory, 
  Service, 
  Staff, 
  Appointment, 
  ContactInquiry, 
  Review, 
  BusinessSettings,
  AppointmentStatus,
  PaymentStatus,
  DateFilterPeriod,
  AnalyticsSummary
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_SERVICES, 
  INITIAL_STAFF, 
  INITIAL_REVIEWS, 
  BUSINESS_SETTINGS 
} from '../data/initialData';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  categories: ServiceCategory[];
  services: Service[];
  staff: Staff[];
  appointments: Appointment[];
  inquiries: ContactInquiry[];
  reviews: Review[];
  settings: BusinessSettings;
  chatMessages: { id: string; sessionId: string; sender: 'user' | 'assistant'; text: string; timestamp: string }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nfyve_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbCache: DatabaseSchema | null = null;

function saveDb(data: DatabaseSchema) {
  dbCache = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database file:', err);
  }
}

export function getDb(): DatabaseSchema {
  if (dbCache) return dbCache;

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(raw);
      return dbCache!;
    } catch (err) {
      console.error('Error reading DB file, reinitializing:', err);
    }
  }

  // Initialize DB with seed data
  const initialDb = seedDatabase();
  saveDb(initialDb);
  return initialDb;
}

function seedDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('Admin@NFYVE2026', salt);
  const staffHash = bcrypt.hashSync('Staff@NFYVE2026', salt);
  const customerHash = bcrypt.hashSync('Customer@123', salt);

  const users: (User & { passwordHash: string })[] = [
    {
      id: 'usr-admin-1',
      name: 'Priya Narayanan (Administrator)',
      email: 'admin@nfyve.com',
      phone: '+91 9000023050',
      role: 'admin',
      passwordHash: adminHash,
      createdAt: '2025-01-01T08:00:00Z',
    },
    {
      id: 'usr-staff-1',
      name: 'Rohan Mehra (Clinic Concierge)',
      email: 'staff@nfyve.com',
      phone: '+91 9000023055',
      role: 'staff',
      passwordHash: staffHash,
      createdAt: '2025-01-05T09:00:00Z',
    },
    {
      id: 'usr-cust-1',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 9849012345',
      role: 'customer',
      passwordHash: customerHash,
      createdAt: '2025-02-01T10:00:00Z',
    },
    {
      id: 'usr-cust-2',
      name: 'Karthik Rao',
      email: 'karthik.rao@example.com',
      phone: '+91 9849023456',
      role: 'customer',
      passwordHash: customerHash,
      createdAt: '2025-03-10T11:00:00Z',
    },
    {
      id: 'usr-cust-3',
      name: 'Dr. Shalini Gupta',
      email: 'shalini.gupta@example.com',
      phone: '+91 9849034567',
      role: 'customer',
      passwordHash: customerHash,
      createdAt: '2025-04-15T14:30:00Z',
    },
    {
      id: 'usr-cust-4',
      name: 'Vikram Joshi',
      email: 'vikram.joshi@example.com',
      phone: '+91 9849045678',
      role: 'customer',
      passwordHash: customerHash,
      createdAt: '2025-06-20T16:00:00Z',
    }
  ];

  // Generate historical appointments spanning the last 12 months up to current date (2026-10-02)
  const appointments: Appointment[] = [];
  const services = INITIAL_SERVICES;
  const sampleCustomers = [
    { id: 'usr-cust-1', name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91 9849012345' },
    { id: 'usr-cust-2', name: 'Karthik Rao', email: 'karthik.rao@example.com', phone: '+91 9849023456' },
    { id: 'usr-cust-3', name: 'Dr. Shalini Gupta', email: 'shalini.gupta@example.com', phone: '+91 9849034567' },
    { id: 'usr-cust-4', name: 'Vikram Joshi', email: 'vikram.joshi@example.com', phone: '+91 9849045678' },
    { id: 'usr-cust-5', name: 'Sunita Reddy', email: 'sunita.reddy@example.com', phone: '+91 9849056789' },
    { id: 'usr-cust-6', name: 'Arjun Kapoor', email: 'arjun.kapoor@example.com', phone: '+91 9849067890' },
  ];

  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:30 AM - 11:30 AM',
    '12:00 PM - 01:00 PM',
    '02:30 PM - 03:30 PM',
    '04:00 PM - 05:00 PM',
    '05:30 PM - 06:30 PM'
  ];

  // Helper date generation
  let bookingCounter = 1001;

  // Past 10 months generator
  const referenceDate = new Date('2026-10-02T12:00:00Z');

  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    // Distribute 8-15 bookings per month
    const countForMonth = 8 + (monthOffset % 5) * 2;
    for (let i = 0; i < countForMonth; i++) {
      const d = new Date(referenceDate);
      d.setMonth(d.getMonth() - monthOffset);
      const day = 1 + ((i * 3 + monthOffset * 2) % 27);
      d.setDate(day);

      const dateStr = d.toISOString().split('T')[0];
      const isPast = d < referenceDate;
      const cust = sampleCustomers[(i + monthOffset) % sampleCustomers.length];
      const srv = services[(i + monthOffset * 2) % services.length];
      const cat = INITIAL_CATEGORIES.find(c => c.id === srv.categoryId);
      const staffMember = INITIAL_STAFF[(i + monthOffset) % INITIAL_STAFF.length];

      let status: AppointmentStatus = 'completed';
      let paymentStatus: PaymentStatus = 'paid';

      if (!isPast) {
        status = i % 3 === 0 ? 'confirmed' : 'pending';
        paymentStatus = 'pending';
      } else if (i % 9 === 0) {
        status = 'cancelled';
        paymentStatus = 'refunded';
      }

      appointments.push({
        id: `apt-${bookingCounter}`,
        bookingRef: `NF-2026-${bookingCounter}`,
        userId: cust.id,
        customerName: cust.name,
        customerEmail: cust.email,
        customerPhone: cust.phone,
        serviceId: srv.id,
        serviceName: srv.name,
        categoryName: cat ? cat.name : 'Wellness',
        staffId: staffMember.id,
        staffName: staffMember.name,
        appointmentDate: dateStr,
        timeSlot: timeSlots[i % timeSlots.length],
        status,
        paymentStatus,
        amountInr: srv.priceInr,
        notes: isPast ? 'Treatment completed as scheduled.' : 'Customer requested early morning slot.',
        createdAt: new Date(d.getTime() - 86400000 * 2).toISOString(),
        updatedAt: d.toISOString(),
      });

      bookingCounter++;
    }
  }

  // Add specific bookings for Today (2026-10-02) and Yesterday (2026-10-01) for real-time testing
  appointments.push(
    {
      id: `apt-${bookingCounter++}`,
      bookingRef: `NF-2026-${bookingCounter}`,
      userId: 'usr-cust-1',
      customerName: 'Priya Sharma',
      customerEmail: 'priya.sharma@example.com',
      customerPhone: '+91 9849012345',
      serviceId: 'srv-101',
      serviceName: 'Hydra-Infusion Clinical Facial',
      categoryName: 'Clinical Aesthetics & Skin Health',
      staffId: 'st-1',
      staffName: 'Dr. Ananya Reddy',
      appointmentDate: '2026-10-02',
      timeSlot: '10:30 AM - 11:30 AM',
      status: 'confirmed',
      paymentStatus: 'paid',
      amountInr: 4500,
      notes: 'Skin sensitivity consultation requested.',
      createdAt: '2026-10-01T14:00:00Z',
      updatedAt: '2026-10-01T15:00:00Z',
    },
    {
      id: `apt-${bookingCounter++}`,
      bookingRef: `NF-2026-${bookingCounter}`,
      userId: 'usr-cust-2',
      customerName: 'Karthik Rao',
      customerEmail: 'karthik.rao@example.com',
      customerPhone: '+91 9849023456',
      serviceId: 'srv-301',
      serviceName: '1-on-1 Bespoke Personal Training Session',
      categoryName: 'Fitness & Gym',
      staffId: 'st-2',
      staffName: 'Coach Vikram Singh',
      appointmentDate: '2026-10-02',
      timeSlot: '04:00 PM - 05:00 PM',
      status: 'confirmed',
      paymentStatus: 'pending',
      amountInr: 2000,
      notes: 'Shoulder mobility focus.',
      createdAt: '2026-10-01T18:00:00Z',
      updatedAt: '2026-10-02T08:00:00Z',
    },
    {
      id: `apt-${bookingCounter++}`,
      bookingRef: `NF-2026-${bookingCounter}`,
      userId: 'usr-cust-3',
      customerName: 'Dr. Shalini Gupta',
      customerEmail: 'shalini.gupta@example.com',
      customerPhone: '+91 9849034567',
      serviceId: 'srv-401',
      serviceName: 'Botanical Keratin & Scalp Health Ritual',
      categoryName: 'Salon, Hair & Beauty',
      staffId: 'st-4',
      staffName: 'Sameer Khan',
      appointmentDate: '2026-10-01',
      timeSlot: '02:30 PM - 03:30 PM',
      status: 'completed',
      paymentStatus: 'paid',
      amountInr: 4200,
      notes: 'Completed session. Excellent client satisfaction.',
      createdAt: '2026-09-29T10:00:00Z',
      updatedAt: '2026-10-01T16:00:00Z',
    }
  );

  const inquiries: ContactInquiry[] = [
    {
      id: 'inq-1',
      name: 'Sunita Reddy',
      email: 'sunita.reddy@example.com',
      phone: '+91 9849056789',
      subject: 'Inquiry regarding 360° Transformation Protocol',
      message: 'Hello NFYVE team, I work nearby in Begumpet and would like to understand if the 360 program includes both medical body contouring and nutritional guidance.',
      status: 'in_progress',
      createdAt: '2026-10-01T09:30:00Z',
    },
    {
      id: 'inq-2',
      name: 'Kishore Kumar',
      email: 'kishore.k@example.com',
      phone: '+91 9988776655',
      subject: 'Corporate gym membership & wellness days',
      message: 'Do you offer private weekend wellness retreats or corporate packages for executive teams located in Hyderabad?',
      status: 'unread',
      createdAt: '2026-10-02T04:15:00Z',
    }
  ];

  return {
    users,
    categories: INITIAL_CATEGORIES,
    services: INITIAL_SERVICES,
    staff: INITIAL_STAFF,
    appointments,
    inquiries,
    reviews: INITIAL_REVIEWS,
    settings: BUSINESS_SETTINGS,
    chatMessages: []
  };
}

// Data Access API
export const db = {
  // Users
  getUserByEmail(email: string) {
    const data = getDb();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  getUserById(id: string) {
    const data = getDb();
    return data.users.find(u => u.id === id);
  },
  createUser(user: User & { passwordHash: string }) {
    const data = getDb();
    data.users.push(user);
    saveDb(data);
    return user;
  },
  updateUser(id: string, updates: Partial<User>) {
    const data = getDb();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      data.users[idx] = { ...data.users[idx], ...updates };
      saveDb(data);
      return data.users[idx];
    }
    return null;
  },
  getAllCustomers() {
    const data = getDb();
    return data.users.filter(u => u.role === 'customer');
  },

  // Categories & Services
  getCategories() {
    return getDb().categories;
  },
  getServices(onlyActive = true) {
    const services = getDb().services;
    const categories = getDb().categories;
    const enriched = services.map(s => ({
      ...s,
      categoryName: categories.find(c => c.id === s.categoryId)?.name || 'General'
    }));
    return onlyActive ? enriched.filter(s => s.isActive) : enriched;
  },
  getServiceBySlug(slug: string) {
    const services = this.getServices(false);
    return services.find(s => s.slug === slug);
  },
  getServiceById(id: string) {
    const services = this.getServices(false);
    return services.find(s => s.id === id);
  },
  createService(service: Service) {
    const data = getDb();
    data.services.push(service);
    saveDb(data);
    return service;
  },
  updateService(id: string, updates: Partial<Service>) {
    const data = getDb();
    const idx = data.services.findIndex(s => s.id === id);
    if (idx !== -1) {
      data.services[idx] = { ...data.services[idx], ...updates };
      saveDb(data);
      return data.services[idx];
    }
    return null;
  },
  deleteService(id: string) {
    const data = getDb();
    const idx = data.services.findIndex(s => s.id === id);
    if (idx !== -1) {
      data.services.splice(idx, 1);
      saveDb(data);
      return true;
    }
    return false;
  },

  // Staff
  getStaff(onlyActive = true) {
    const staff = getDb().staff;
    return onlyActive ? staff.filter(s => s.isActive) : staff;
  },
  getStaffById(id: string) {
    return getDb().staff.find(s => s.id === id);
  },

  // Appointments
  getAppointments(filters?: {
    userId?: string;
    status?: AppointmentStatus;
    categoryId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let list = [...getDb().appointments];

    if (filters) {
      if (filters.userId) {
        list = list.filter(a => a.userId === filters.userId);
      }
      if (filters.status) {
        list = list.filter(a => a.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(a => 
          a.bookingRef.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q) ||
          a.customerPhone.toLowerCase().includes(q) ||
          a.serviceName.toLowerCase().includes(q)
        );
      }
      if (filters.startDate) {
        list = list.filter(a => a.appointmentDate >= filters.startDate!);
      }
      if (filters.endDate) {
        list = list.filter(a => a.appointmentDate <= filters.endDate!);
      }
    }

    // Sort descending by date
    list.sort((a, b) => (b.appointmentDate + b.timeSlot).localeCompare(a.appointmentDate + a.timeSlot));
    return list;
  },
  getAppointmentById(id: string) {
    return getDb().appointments.find(a => a.id === id);
  },
  getAvailableSlots(date: string, serviceId: string, staffId?: string) {
    const allSlots = [
      '08:00 AM - 09:00 AM',
      '09:15 AM - 10:15 AM',
      '10:30 AM - 11:30 AM',
      '11:45 AM - 12:45 PM',
      '02:00 PM - 03:00 PM',
      '03:15 PM - 04:15 PM',
      '04:30 PM - 05:30 PM',
      '05:45 PM - 06:45 PM',
      '07:00 PM - 08:00 PM'
    ];

    const booked = getDb().appointments.filter(a => 
      a.appointmentDate === date && 
      (a.status === 'confirmed' || a.status === 'pending') &&
      (!staffId || a.staffId === staffId)
    );

    const bookedSlotSet = new Set(booked.map(b => b.timeSlot));

    return allSlots.map(slot => ({
      slot,
      isAvailable: !bookedSlotSet.has(slot),
    }));
  },
  createAppointment(apt: Appointment) {
    const data = getDb();

    // Check for concurrency collision
    const conflict = data.appointments.find(a => 
      a.appointmentDate === apt.appointmentDate &&
      a.timeSlot === apt.timeSlot &&
      (a.status === 'confirmed' || a.status === 'pending') &&
      a.staffId === apt.staffId
    );

    if (conflict) {
      throw new Error(`The slot ${apt.timeSlot} on ${apt.appointmentDate} is already reserved.`);
    }

    data.appointments.unshift(apt);
    saveDb(data);
    return apt;
  },
  updateAppointment(id: string, updates: Partial<Appointment>) {
    const data = getDb();
    const idx = data.appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      data.appointments[idx] = { 
        ...data.appointments[idx], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveDb(data);
      return data.appointments[idx];
    }
    return null;
  },

  // Analytics Engine
  getAnalytics(period: DateFilterPeriod = 'this_month', customStart?: string, customEnd?: string): AnalyticsSummary {
    const data = getDb();
    const now = new Date('2026-10-02T12:00:00Z'); // Match applet time context
    let startDate = new Date(now);
    let endDate = new Date(now);

    switch (period) {
      case 'today':
        startDate = new Date(now);
        endDate = new Date(now);
        break;
      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        endDate.setDate(now.getDate() - 1);
        break;
      case 'this_week':
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
        startDate = new Date(now.setDate(diff));
        endDate = new Date(now);
        break;
      case 'last_7_days':
        startDate.setDate(now.getDate() - 6);
        endDate = new Date(now);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last_3_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate = new Date(now);
        break;
      case 'last_6_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        endDate = new Date(now);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case 'custom':
        if (customStart) startDate = new Date(customStart);
        if (customEnd) endDate = new Date(customEnd);
        break;
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const filtered = data.appointments.filter(a => 
      a.appointmentDate >= startStr && a.appointmentDate <= endStr
    );

    let totalRevenue = 0;
    let completedBookings = 0;
    let confirmedBookings = 0;
    let pendingBookings = 0;
    let cancelledBookings = 0;
    let pendingPayments = 0;
    let paidPayments = 0;

    const catRevMap: Record<string, { revenue: number; bookings: number }> = {};
    const periodMap: Record<string, { revenue: number; bookings: number }> = {};

    filtered.forEach(a => {
      if (a.status === 'completed' || a.paymentStatus === 'paid') {
        totalRevenue += a.amountInr;
        paidPayments += a.amountInr;
      } else if (a.status !== 'cancelled') {
        pendingPayments += a.amountInr;
      }

      if (a.status === 'completed') completedBookings++;
      if (a.status === 'confirmed') confirmedBookings++;
      if (a.status === 'pending') pendingBookings++;
      if (a.status === 'cancelled') cancelledBookings++;

      // Category map
      if (!catRevMap[a.categoryName]) {
        catRevMap[a.categoryName] = { revenue: 0, bookings: 0 };
      }
      catRevMap[a.categoryName].bookings++;
      if (a.status === 'completed' || a.paymentStatus === 'paid') {
        catRevMap[a.categoryName].revenue += a.amountInr;
      }

      // Group by date or month depending on period length
      const dateKey = period.includes('year') || period.includes('6_months') 
        ? a.appointmentDate.slice(0, 7) 
        : a.appointmentDate;

      if (!periodMap[dateKey]) {
        periodMap[dateKey] = { revenue: 0, bookings: 0 };
      }
      periodMap[dateKey].bookings++;
      if (a.status === 'completed' || a.paymentStatus === 'paid') {
        periodMap[dateKey].revenue += a.amountInr;
      }
    });

    const revenueByPeriod = Object.keys(periodMap).sort().map(k => ({
      date: k,
      label: k,
      revenue: periodMap[k].revenue,
      bookings: periodMap[k].bookings,
    }));

    const revenueByCategory = Object.keys(catRevMap).map(k => ({
      category: k,
      revenue: catRevMap[k].revenue,
      bookings: catRevMap[k].bookings,
    }));

    const statusDistribution = [
      { status: 'Completed', count: completedBookings },
      { status: 'Confirmed', count: confirmedBookings },
      { status: 'Pending', count: pendingBookings },
      { status: 'Cancelled', count: cancelledBookings },
    ];

    const totalBookings = filtered.length;
    const averageBookingValue = totalBookings > 0 ? Math.round(totalRevenue / (completedBookings || 1)) : 0;
    const customerIds = new Set(filtered.map(a => a.userId));

    return {
      totalRevenue,
      totalBookings,
      completedBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      averageBookingValue,
      totalCustomers: customerIds.size,
      pendingPayments,
      paidPayments,
      revenueByPeriod,
      revenueByCategory,
      statusDistribution,
    };
  },

  // Contact Inquiries
  getInquiries() {
    return [...getDb().inquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  createInquiry(inq: ContactInquiry) {
    const data = getDb();
    data.inquiries.unshift(inq);
    saveDb(data);
    return inq;
  },
  updateInquiryStatus(id: string, status: 'unread' | 'in_progress' | 'resolved') {
    const data = getDb();
    const item = data.inquiries.find(i => i.id === id);
    if (item) {
      item.status = status;
      saveDb(data);
      return item;
    }
    return null;
  },

  // Reviews
  getReviews(onlyApproved = true) {
    const revs = getDb().reviews;
    return onlyApproved ? revs.filter(r => r.isApproved) : revs;
  },
  createReview(review: Review) {
    const data = getDb();
    data.reviews.unshift(review);
    saveDb(data);
    return review;
  },
  approveReview(id: string, isApproved: boolean) {
    const data = getDb();
    const item = data.reviews.find(r => r.id === id);
    if (item) {
      item.isApproved = isApproved;
      saveDb(data);
      return item;
    }
    return null;
  },

  // Settings
  getSettings() {
    return getDb().settings;
  },
  updateSettings(settings: Partial<BusinessSettings>) {
    const data = getDb();
    data.settings = { ...data.settings, ...settings };
    saveDb(data);
    return data.settings;
  }
};
