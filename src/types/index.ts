export type Role = 'customer' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
}

export interface Service {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  shortDesc: string;
  fullDesc: string;
  durationMins: number;
  priceInr: number;
  imageUrl: string;
  benefits: string[];
  precautions?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleTitle: string;
  specialty: string;
  bio: string;
  avatarUrl?: string;
  isActive: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Appointment {
  id: string;
  bookingRef: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  staffId?: string;
  staffName?: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM - 11:00 AM"
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  amountInr: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface Review {
  id: string;
  userId?: string;
  customerName: string;
  serviceCategory: string;
  serviceName: string;
  rating: number; // 1 - 5
  reviewText: string;
  reviewDate: string;
  isApproved: boolean;
  isSample: boolean;
}

export interface BusinessSettings {
  businessName: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  openingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  cancellationPolicy: string;
}

export type DateFilterPeriod = 
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_7_days'
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'last_year'
  | 'custom';

export interface AnalyticsSummary {
  totalRevenue: number;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  totalCustomers: number;
  pendingPayments: number;
  paidPayments: number;
  revenueByPeriod: { date: string; label: string; revenue: number; bookings: number }[];
  revenueByCategory: { category: string; revenue: number; bookings: number }[];
  statusDistribution: { status: string; count: number }[];
}
