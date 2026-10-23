export type Role = 'customer' | 'staff' | 'admin' | 'call_center' | 'front_desk' | 'manager';

export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  staffId?: string;
  designation?: string;
  department?: string;
  active?: boolean;
  avatarUrl?: string;
  photoURL?: string;
  specialties?: string[];
  bio?: string;
  createdAt: string;
  updatedAt?: string;
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
  userId?: string;
  name: string;
  email: string;
  phone: string;
  roleTitle: string;
  specialty?: string;
  specialties: string[];
  bio: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt?: string;
}

// 5 Scheduling Resources / Rooms
export type RoomId = 'Consult 1' | 'Consult 2' | 'Slim-1' | 'Slim-2' | 'Skin / Hair';

export interface Room {
  id: RoomId;
  name: string;
  displayName: string;
  type: 'consultation' | 'slimming' | 'skin_hair';
  description: string;
}

export const ROOMS: Room[] = [
  { id: 'Consult 1', name: 'Consult 1', displayName: 'Consultation Room 1', type: 'consultation', description: 'Physician diagnostics & comprehensive health analysis' },
  { id: 'Consult 2', name: 'Consult 2', displayName: 'Consultation Room 2', type: 'consultation', description: 'Clinical nutrition & trichology review' },
  { id: 'Slim-1', name: 'Slim-1', displayName: 'Slimming Treatment Room 1', type: 'slimming', description: 'Targeted RF body contouring & fat loss suite' },
  { id: 'Slim-2', name: 'Slim-2', displayName: 'Slimming Treatment Room 2', type: 'slimming', description: 'Lymphatic drainage & metabolic conditioning' },
  { id: 'Skin / Hair', name: 'Skin / Hair', displayName: 'Skin and Hair Treatment Room', type: 'skin_hair', description: 'Medical aesthetics, Hydra-infusion & scalp trichology' }
];

// Customer & Prospect Entities
export type LeadSource = 'Instagram' | 'Google' | 'Walk-in' | 'Referral' | 'Website' | 'Phone Call' | 'Other';

export type CustomerLifecycleStatus = 
  | 'new_prospect'
  | 'contacted'
  | 'followup_required'
  | 'appointment_confirmed'
  | 'consultation_completed'
  | 'package_purchased'
  | 'not_interested'
  | 'unreachable'
  | 'lost';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  leadSource: LeadSource;
  bookingChannel?: 'Walk-in' | 'Phone Call' | 'Online' | string;
  lifecycleStatus: CustomerLifecycleStatus;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  interestedServiceId?: string;
  interestedServiceName?: string;
  initialRemarks?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  totalSpendInr?: number;
  completedTreatments?: number;
}

// Call Logs
export type CallOutcome = 
  | 'interested'
  | 'appointment_confirmed'
  | 'callback_requested'
  | 'no_answer'
  | 'not_interested'
  | 'invalid_number'
  | 'other';

export interface CallLog {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  employeeId: string;
  employeeName: string;
  dateTime: string;
  outcome: CallOutcome;
  remarks: string;
  nextAction?: string;
  followUpDate?: string;
  createdAt: string;
}

// Follow-Ups & Callbacks
export type FollowUpStatus = 'pending' | 'completed' | 'rescheduled' | 'cancelled';
export type FollowUpType = 'prospect' | 'consultation' | 'payment' | 'general';

export interface FollowUp {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: FollowUpType;
  relatedId?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // e.g. "11:30 AM"
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  reason: string;
  latestOutcome?: string;
  status: FollowUpStatus;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
}

// Appointments
export type AppointmentStatus = 
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_consultation'
  | 'consultation_completed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'
  | 'no-show';

export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'postponed' | 'refunded';

export interface Appointment {
  id: string;
  bookingRef: string;
  userId?: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  categoryName?: string;
  staffId?: string;
  staffName?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  room?: RoomId;
  durationMins?: number;
  bookingChannel?: 'Phone Call' | 'Walk-in' | 'Internal';
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM - 11:00 AM"
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  amountInr: number;
  notes?: string;
  checkedInAt?: string;
  cancellationReason?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Consultations
export type ConsultationOutcome = 
  | 'completed_package_purchased'
  | 'completed_followup_required'
  | 'completed_not_interested'
  | 'rescheduled'
  | 'no_show';

export interface Consultation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  appointmentId?: string;
  consultationDate: string;
  timeSlot: string;
  serviceOfInterestId: string;
  serviceOfInterestName: string;
  primaryStaffId: string;
  primaryStaffName: string;
  secondaryStaffId?: string;
  secondaryStaffName?: string;
  managerId?: string;
  managerName?: string;
  outcome: ConsultationOutcome;
  recommendedPackageOrService?: string;
  remarks: string;
  nextAction?: string;
  nextFollowUpDate?: string;
  completedAt: string;
  recordedBy: string;
  createdAt: string;
}

// Packages
export interface PackageRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  packageName: string;
  purchaseDate: string;
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  packagePrice: number;
  discount: number;
  invoiceId?: string;
  packageStatus: 'active' | 'completed' | 'expired' | 'cancelled';
  expiryDate?: string;
  createdAt: string;
}

// Sessions
export interface TreatmentSession {
  id: string;
  customerId: string;
  customerName: string;
  packageId: string;
  packageName: string;
  sessionNumber: number;
  serviceId: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  actualCompletedAt?: string;
  primaryStaffId: string;
  primaryStaffName: string;
  secondaryStaffId?: string;
  secondaryStaffName?: string;
  managerId?: string;
  managerName?: string;
  status: 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled';
  remarks?: string;
  recordedBy?: string;
  nextSessionDate?: string;
  nextSessionTime?: string;
  createdAt: string;
}

// Invoices & Billing
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  packageId?: string;
  serviceId?: string;
  serviceOrPackageName: string;
  invoiceDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  finalBilledAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'payment_postponed' | 'refund_pending' | 'refunded';
  createdBy: string;
  createdAt: string;
}

// Payment Transactions
export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amountReceived: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';
  paymentDate: string;
  transactionRef?: string;
  recordedBy: string;
  remarks?: string;
  createdAt: string;
}

// Payment Follow-ups (Postponement)
export interface PaymentFollowUp {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amountBilled: number;
  amountReceived: number;
  remainingBalance: number;
  postponementReason: string;
  expectedPaymentDate: string;
  assignedFollowUpOwner: string;
  remarks: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

// Audit Logs
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  action: string;
  recordType: string;
  recordId: string;
  details?: string;
}

// Inquiries, Reviews & Settings
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
  staffId?: string;
  customerName: string;
  serviceCategory: string;
  serviceName: string;
  rating: number;
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
  activeStaffCount: number;
  pendingPayments: number;
  paidPayments: number;
  // New Operational KPIs
  totalProspects: number;
  todayAppointmentsCount: number;
  todayFollowUpsCount: number;
  overdueFollowUpsCount: number;
  consultationsCompletedCount: number;
  sessionsCompletedCount: number;
  outstandingPaymentsAmount: number;
  revenueByPeriod: { date: string; label: string; revenue: number; bookings: number }[];
  revenueByCategory: { category: string; revenue: number; bookings: number }[];
  statusDistribution: { status: string; count: number }[];
  leadSourceDistribution: { source: string; count: number }[];
  funnelStages: { stage: string; count: number; percentage: number }[];
  topServices: { name: string; category: string; bookings: number; revenue: number }[];
  topStaff: { id: string; name: string; roleTitle: string; bookings: number; revenue: number }[];
  comparison: {
    revenueChangePct: number;
    bookingsChangePct: number;
    completedChangePct: number;
    customerChangePct: number;
  };
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'booking' | 'payment' | 'system' | 'cancellation';
  link?: string;
}

export interface StaffDashboardData {
  staff: Staff;
  metrics: {
    todayCount: number;
    upcomingCount: number;
    completedCount: number;
    pendingCount: number;
    cancelledCount: number;
    personalRevenue: number;
    assignedConsultationsCount: number;
    assignedSessionsCount: number;
  };
  todaySchedule: Appointment[];
  nextUpcoming: Appointment | null;
  recentCompleted: Appointment[];
  assignedConsultations: Consultation[];
  assignedSessions: TreatmentSession[];
  statusDistribution: { status: string; count: number }[];
  upcomingDays: { date: string; dayLabel: string; count: number }[];
  notifications: SystemNotification[];
}

export interface StaffPerformanceData {
  staff: Staff;
  period: DateFilterPeriod;
  totalCompleted: number;
  completionRate: number;
  personalRevenue: number;
  totalAssigned: number;
  avgDailyAppointments: number;
  servicesByCategory: { category: string; count: number; revenue: number }[];
  trendOverTime: { label: string; date: string; completed: number; revenue: number }[];
  ratingAverage: number;
  feedbackCount: number;
  reviews: Review[];
  comparisonVsPrevious: {
    revenueDiffPct: number;
    completedDiffPct: number;
  };
}
