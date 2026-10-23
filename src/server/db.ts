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
  AnalyticsSummary, 
  StaffDashboardData, 
  StaffPerformanceData, 
  SystemNotification,
  Customer,
  CallLog,
  FollowUp,
  Consultation,
  PackageRecord,
  TreatmentSession,
  Invoice,
  PaymentTransaction,
  PaymentFollowUp,
  AuditLog,
  RoomId,
  Room,
  ROOMS
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_SERVICES, 
  INITIAL_STAFF, 
  INITIAL_REVIEWS, 
  BUSINESS_SETTINGS 
} from '../data/initialData';

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  customers: Customer[];
  categories: ServiceCategory[];
  services: Service[];
  staff: Staff[];
  appointments: Appointment[];
  callLogs: CallLog[];
  followUps: FollowUp[];
  consultations: Consultation[];
  packages: PackageRecord[];
  sessions: TreatmentSession[];
  invoices: Invoice[];
  payments: PaymentTransaction[];
  paymentFollowUps: PaymentFollowUp[];
  auditLogs: AuditLog[];
  inquiries: ContactInquiry[];
  reviews: Review[];
  settings: BusinessSettings;
  chatMessages: { id: string; sessionId: string; sender: 'user' | 'assistant'; text: string; timestamp: string }[];
  notifications: SystemNotification[];
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
      const loaded: DatabaseSchema = JSON.parse(raw);
      let migrated = false;

      const salt = bcrypt.genSaltSync(10);
      const callCenterHash = bcrypt.hashSync('CallCenter@NFYVE2026', salt);
      const frontDeskHash = bcrypt.hashSync('FrontDesk@NFYVE2026', salt);
      const staffHash = bcrypt.hashSync('Staff@NFYVE2026', salt);

      // Ensure Call Center and Front Desk operational users exist
      if (!loaded.users.find(u => u.email.toLowerCase() === 'callcenter@nfyve.com')) {
        loaded.users.push({
          id: 'usr-callcenter-1',
          name: 'Pooja Reddy (Call Center Lead)',
          email: 'callcenter@nfyve.com',
          phone: '+91 9000023056',
          role: 'call_center',
          designation: 'Senior Call Center Coordinator',
          department: 'Client Concierge & Inquiries',
          passwordHash: callCenterHash,
          createdAt: '2025-01-02T08:00:00Z',
        });
        migrated = true;
      }

      if (!loaded.users.find(u => u.email.toLowerCase() === 'frontdesk@nfyve.com')) {
        loaded.users.push({
          id: 'usr-frontdesk-1',
          name: 'Sneha Rao (Front Desk Executive)',
          email: 'frontdesk@nfyve.com',
          phone: '+91 9000023057',
          role: 'front_desk',
          designation: 'Front Desk Hospitality Lead',
          department: 'Sanctuary Reception & Scheduling',
          passwordHash: frontDeskHash,
          createdAt: '2025-01-02T08:00:00Z',
        });
        migrated = true;
      }

      // Ensure staff user accounts
      INITIAL_STAFF.forEach(initStaff => {
        const existingStaff = loaded.staff.find(s => s.id === initStaff.id || s.email.toLowerCase() === initStaff.email.toLowerCase());
        if (!existingStaff) {
          loaded.staff.push(initStaff);
          migrated = true;
        }

        const existingUser = loaded.users.find(u => u.email.toLowerCase() === initStaff.email.toLowerCase());
        if (!existingUser) {
          loaded.users.push({
            id: initStaff.userId || `usr-${initStaff.id}`,
            name: initStaff.name,
            email: initStaff.email.toLowerCase(),
            phone: initStaff.phone,
            role: 'staff',
            staffId: initStaff.id,
            passwordHash: staffHash,
            createdAt: '2025-01-05T09:00:00Z',
          });
          migrated = true;
        }
      });

      // Ensure customers array exists
      if (!loaded.customers || loaded.customers.length === 0) {
        loaded.customers = seedCustomers();
        migrated = true;
      }

      // Ensure appointments have room assignments
      if (loaded.appointments && loaded.appointments.length > 0) {
        loaded.appointments.forEach((apt, idx) => {
          if (!apt.room) {
            const roomList: RoomId[] = ['Consult 1', 'Consult 2', 'Slim-1', 'Slim-2', 'Skin / Hair'];
            apt.room = roomList[idx % roomList.length];
            migrated = true;
          }
          if (!apt.bookingChannel) {
            apt.bookingChannel = idx % 2 === 0 ? 'Phone Call' : 'Walk-in';
            migrated = true;
          }
          if (!apt.customerId && apt.userId) {
            apt.customerId = apt.userId;
            migrated = true;
          }
        });
      }

      if (!loaded.callLogs) {
        loaded.callLogs = seedCallLogs(loaded.customers);
        migrated = true;
      }

      if (!loaded.followUps) {
        loaded.followUps = seedFollowUps(loaded.customers);
        migrated = true;
      }

      if (!loaded.consultations) {
        loaded.consultations = seedConsultations(loaded.customers, loaded.appointments);
        migrated = true;
      }

      if (!loaded.packages) {
        loaded.packages = seedPackages(loaded.customers);
        migrated = true;
      }

      if (!loaded.sessions) {
        loaded.sessions = seedSessions(loaded.customers, loaded.packages);
        migrated = true;
      }

      if (!loaded.invoices) {
        loaded.invoices = seedInvoices(loaded.customers, loaded.packages);
        migrated = true;
      }

      if (!loaded.payments) {
        loaded.payments = seedPayments(loaded.invoices);
        migrated = true;
      }

      if (!loaded.paymentFollowUps) {
        loaded.paymentFollowUps = seedPaymentFollowUps(loaded.invoices);
        migrated = true;
      }

      if (!loaded.auditLogs) {
        loaded.auditLogs = seedAuditLogs();
        migrated = true;
      }

      if (!loaded.notifications) {
        loaded.notifications = seedNotifications();
        migrated = true;
      }

      if (migrated) {
        saveDb(loaded);
      }

      dbCache = loaded;
      return dbCache;
    } catch (err) {
      console.error('Error reading DB file, reinitializing:', err);
    }
  }

  // Initialize DB with seed data
  const initialDb = seedDatabase();
  saveDb(initialDb);
  return initialDb;
}

function seedNotifications(): SystemNotification[] {
  return [
    {
      id: 'notif-1',
      title: 'New Booking Reserved',
      message: 'NF-2026-1002 booked by Priya Sharma for Hydra-Infusion Clinical Facial.',
      time: '10 mins ago',
      read: false,
      type: 'booking',
      link: '/admin/appointments?search=NF-2026-1002'
    },
    {
      id: 'notif-2',
      title: 'Desk Payment Received',
      message: '₹4,500 collected from Priya Sharma for completed dermatological session.',
      time: '1 hour ago',
      read: false,
      type: 'payment'
    },
    {
      id: 'notif-3',
      title: 'Consultation Assigned',
      message: 'Coach Vikram Singh assigned to personal training movement screen.',
      time: '3 hours ago',
      read: true,
      type: 'system'
    },
    {
      id: 'notif-4',
      title: 'Callback Due',
      message: 'Follow-up requested with Ananya Sen regarding Medical Weight Loss program.',
      time: 'Just now',
      read: false,
      type: 'system',
      link: '/call-center/follow-ups'
    }
  ];
}

function seedCustomers(): Customer[] {
  return [
    {
      id: 'CUST-1001',
      name: 'Priya Sharma',
      phone: '+91 9849012345',
      email: 'priya.sharma@example.com',
      leadSource: 'Instagram',
      lifecycleStatus: 'package_purchased',
      assignedEmployeeId: 'usr-callcenter-1',
      assignedEmployeeName: 'Pooja Reddy',
      interestedServiceId: 'srv-1',
      interestedServiceName: 'Hydra-Infusion Clinical Facial',
      initialRemarks: 'Enquired via Instagram DM regarding stubborn hyperpigmentation.',
      notes: 'Prefers morning appointments. Sensitive skin profile.',
      createdAt: '2025-02-01T10:00:00Z',
      updatedAt: '2026-10-02T10:00:00Z',
      totalSpendInr: 32500,
      completedTreatments: 4
    },
    {
      id: 'CUST-1002',
      name: 'Karthik Rao',
      phone: '+91 9849023456',
      email: 'karthik.rao@example.com',
      leadSource: 'Google',
      lifecycleStatus: 'consultation_completed',
      assignedEmployeeId: 'usr-callcenter-1',
      assignedEmployeeName: 'Pooja Reddy',
      interestedServiceId: 'srv-3',
      interestedServiceName: 'Physician-Guided Metabolic Weight Loss',
      initialRemarks: 'Searching for clinical metabolic weight management in Begumpet.',
      notes: 'Completed initial bloodwork review. Recommended 8-week intensive package.',
      createdAt: '2025-03-10T11:00:00Z',
      updatedAt: '2026-10-01T15:30:00Z',
      totalSpendInr: 15000,
      completedTreatments: 2
    },
    {
      id: 'CUST-1003',
      name: 'Dr. Shalini Gupta',
      phone: '+91 9849034567',
      email: 'shalini.gupta@example.com',
      leadSource: 'Referral',
      lifecycleStatus: 'package_purchased',
      assignedEmployeeId: 'usr-frontdesk-1',
      assignedEmployeeName: 'Sneha Rao',
      interestedServiceId: 'srv-2',
      interestedServiceName: 'Laser Skin Resurfacing & Texture Refining',
      initialRemarks: 'Referred by Dr. Reddy for laser toning and photo-damage correction.',
      notes: 'Undergoing session 3 of 6.',
      createdAt: '2025-04-15T14:30:00Z',
      updatedAt: '2026-10-02T09:00:00Z',
      totalSpendInr: 45000,
      completedTreatments: 3
    },
    {
      id: 'CUST-1004',
      name: 'Vikram Joshi',
      phone: '+91 9849045678',
      email: 'vikram.joshi@example.com',
      leadSource: 'Walk-in',
      lifecycleStatus: 'appointment_confirmed',
      assignedEmployeeId: 'usr-frontdesk-1',
      assignedEmployeeName: 'Sneha Rao',
      interestedServiceId: 'srv-5',
      interestedServiceName: '1-on-1 Bespoke Strength & Biomechanics Training',
      initialRemarks: 'Walked in after work at Kura Towers asking about private gym suites.',
      notes: 'Appointment scheduled for movement screen tomorrow.',
      createdAt: '2025-06-20T16:00:00Z',
      updatedAt: '2026-10-02T11:00:00Z',
      totalSpendInr: 0,
      completedTreatments: 0
    },
    {
      id: 'CUST-1005',
      name: 'Sunita Reddy',
      phone: '+91 9849056789',
      email: 'sunita.reddy@example.com',
      leadSource: 'Instagram',
      lifecycleStatus: 'followup_required',
      assignedEmployeeId: 'usr-callcenter-1',
      assignedEmployeeName: 'Pooja Reddy',
      interestedServiceId: 'srv-7',
      interestedServiceName: 'Trichology Scalp Detox & Follicle Rejuvenation',
      initialRemarks: 'Hair fall concerns post-viral recovery. Wants consultation slot.',
      notes: 'Callback scheduled for today afternoon.',
      createdAt: '2026-09-28T14:00:00Z',
      updatedAt: '2026-10-02T08:30:00Z',
      totalSpendInr: 0,
      completedTreatments: 0
    },
    {
      id: 'CUST-1006',
      name: 'Arjun Kapoor',
      phone: '+91 9849067890',
      email: 'arjun.kapoor@example.com',
      leadSource: 'Google',
      lifecycleStatus: 'new_prospect',
      assignedEmployeeId: 'usr-callcenter-1',
      assignedEmployeeName: 'Pooja Reddy',
      interestedServiceId: 'srv-9',
      interestedServiceName: 'Functional Gut Microbiome & Clinical Diet Plan',
      initialRemarks: 'Enquired online about functional gut health testing.',
      notes: 'First call pending.',
      createdAt: '2026-10-02T07:15:00Z',
      updatedAt: '2026-10-02T07:15:00Z',
      totalSpendInr: 0,
      completedTreatments: 0
    }
  ];
}

function seedCallLogs(customers: Customer[]): CallLog[] {
  const p1 = customers[0];
  const p2 = customers[1];
  const p5 = customers[4];
  const now = new Date('2026-10-02T10:00:00Z');

  return [
    {
      id: 'call-1',
      customerId: p1.id,
      customerName: p1.name,
      customerPhone: p1.phone,
      employeeId: 'usr-callcenter-1',
      employeeName: 'Pooja Reddy',
      dateTime: '2026-09-20T11:30:00Z',
      outcome: 'appointment_confirmed',
      remarks: 'Client confirmed appointment for Hydra-Infusion facial in Room Skin / Hair.',
      nextAction: 'Confirmed with clinic calendar',
      createdAt: '2026-09-20T11:35:00Z'
    },
    {
      id: 'call-2',
      customerId: p2.id,
      customerName: p2.name,
      customerPhone: p2.phone,
      employeeId: 'usr-callcenter-1',
      employeeName: 'Pooja Reddy',
      dateTime: '2026-09-25T14:00:00Z',
      outcome: 'interested',
      remarks: 'Discussed metabolic weight protocol. Client requested callback after checking spouse availability.',
      nextAction: 'Follow up on Oct 2nd',
      followUpDate: '2026-10-02',
      createdAt: '2026-09-25T14:05:00Z'
    },
    {
      id: 'call-3',
      customerId: p5.id,
      customerName: p5.name,
      customerPhone: p5.phone,
      employeeId: 'usr-callcenter-1',
      employeeName: 'Pooja Reddy',
      dateTime: '2026-10-01T16:00:00Z',
      outcome: 'callback_requested',
      remarks: 'Customer in a meeting, asked to call back today between 11 AM and 1 PM.',
      nextAction: 'Scheduled callback for 2026-10-02',
      followUpDate: '2026-10-02',
      createdAt: '2026-10-01T16:05:00Z'
    }
  ];
}

function seedFollowUps(customers: Customer[]): FollowUp[] {
  const p2 = customers[1];
  const p5 = customers[4];
  const p6 = customers[5];

  return [
    {
      id: 'flw-1',
      customerId: p5.id,
      customerName: p5.name,
      customerPhone: p5.phone,
      type: 'prospect',
      dueDate: '2026-10-02',
      dueTime: '11:30 AM',
      assignedEmployeeId: 'usr-callcenter-1',
      assignedEmployeeName: 'Pooja Reddy',
      reason: 'Requested callback regarding trichology treatment availability & pricing.',
      latestOutcome: 'Pending call',
      status: 'pending',
      createdAt: '2026-10-01T16:05:00Z'
    },
    {
      id: 'flw-2',
      customerId: p2.id,
      customerName: p2.name,
      customerPhone: p2.phone,
      type: 'consultation',
      dueDate: '2026-10-02',
      dueTime: '03:00 PM',
      assignedEmployeeId: 'usr-callcenter-1',
      assignedEmployeeName: 'Pooja Reddy',
      reason: 'Follow-up on 8-week metabolic slimming package decision after initial consultation.',
      latestOutcome: 'Pending decision',
      status: 'pending',
      createdAt: '2026-10-01T15:30:00Z'
    },
    {
      id: 'flw-3',
      customerId: p6.id,
      customerName: p6.name,
      customerPhone: p6.phone,
      type: 'prospect',
      dueDate: '2026-10-01', // Overdue
      dueTime: '04:00 PM',
      assignedEmployeeId: 'usr-callcenter-1',
      assignedEmployeeName: 'Pooja Reddy',
      reason: 'Initial enquiry callback for clinical gut health program.',
      latestOutcome: 'No answer on first attempt',
      status: 'pending',
      createdAt: '2026-09-30T10:00:00Z'
    }
  ];
}

function seedConsultations(customers: Customer[], appointments: Appointment[]): Consultation[] {
  const c1 = customers[0];
  const c2 = customers[1];
  const c3 = customers[2];

  return [
    {
      id: 'cns-1',
      customerId: c1.id,
      customerName: c1.name,
      customerPhone: c1.phone,
      appointmentId: 'apt-1001',
      consultationDate: '2026-09-15',
      timeSlot: '10:00 AM - 11:00 AM',
      serviceOfInterestId: 'srv-1',
      serviceOfInterestName: 'Hydra-Infusion Clinical Facial',
      primaryStaffId: 'st-1',
      primaryStaffName: 'Dr. Ananya Reddy',
      secondaryStaffId: 'st-5',
      secondaryStaffName: 'Rohan Mehra',
      managerId: 'usr-admin-1',
      managerName: 'Priya Narayanan',
      outcome: 'completed_package_purchased',
      recommendedPackageOrService: '6-Session Hydra-Glow & Skin Barrier Restoration Package',
      remarks: 'Mild barrier damage detected with erythema. Recommended gentle AHA/BHA peel and 6-session hydration course.',
      nextAction: 'Enrolled in 6-Session Package',
      completedAt: '2026-09-15T11:00:00Z',
      recordedBy: 'Sneha Rao (Front Desk)',
      createdAt: '2026-09-15T11:05:00Z'
    },
    {
      id: 'cns-2',
      customerId: c2.id,
      customerName: c2.name,
      customerPhone: c2.phone,
      appointmentId: 'apt-1002',
      consultationDate: '2026-10-01',
      timeSlot: '02:30 PM - 03:30 PM',
      serviceOfInterestId: 'srv-3',
      serviceOfInterestName: 'Physician-Guided Metabolic Weight Loss',
      primaryStaffId: 'st-1',
      primaryStaffName: 'Dr. Ananya Reddy',
      secondaryStaffId: 'st-3',
      secondaryStaffName: 'Kavita Nair, RD',
      outcome: 'completed_followup_required',
      recommendedPackageOrService: '8-Week Metabolic Reset & Body Contouring',
      remarks: 'Client has visceral fat index 12. Dietitian Kavita outlined macro blueprint. Client will discuss investment with spouse.',
      nextAction: 'Callback on Oct 2nd',
      nextFollowUpDate: '2026-10-02',
      completedAt: '2026-10-01T15:30:00Z',
      recordedBy: 'Sneha Rao (Front Desk)',
      createdAt: '2026-10-01T15:35:00Z'
    }
  ];
}

function seedPackages(customers: Customer[]): PackageRecord[] {
  const c1 = customers[0];
  const c3 = customers[2];

  return [
    {
      id: 'pkg-1',
      customerId: c1.id,
      customerName: c1.name,
      customerPhone: c1.phone,
      serviceId: 'srv-1',
      serviceName: 'Hydra-Infusion Clinical Facial',
      packageName: '6-Session Hydra-Glow Restoration Package',
      purchaseDate: '2026-09-15',
      totalSessions: 6,
      completedSessions: 3,
      remainingSessions: 3,
      packagePrice: 24000,
      discount: 2000,
      invoiceId: 'inv-1001',
      packageStatus: 'active',
      expiryDate: '2027-03-15',
      createdAt: '2026-09-15T11:15:00Z'
    },
    {
      id: 'pkg-2',
      customerId: c3.id,
      customerName: c3.name,
      customerPhone: c3.phone,
      serviceId: 'srv-2',
      serviceName: 'Laser Skin Resurfacing & Texture Refining',
      packageName: '5-Session Precision Fractional Resurfacing',
      purchaseDate: '2026-08-10',
      totalSessions: 5,
      completedSessions: 3,
      remainingSessions: 2,
      packagePrice: 42000,
      discount: 0,
      invoiceId: 'inv-1002',
      packageStatus: 'active',
      expiryDate: '2027-02-10',
      createdAt: '2026-08-10T14:30:00Z'
    }
  ];
}

function seedSessions(customers: Customer[], packages: PackageRecord[]): TreatmentSession[] {
  const c1 = customers[0];
  const pkg1 = packages[0];

  return [
    {
      id: 'ses-1',
      customerId: c1.id,
      customerName: c1.name,
      packageId: pkg1.id,
      packageName: pkg1.packageName,
      sessionNumber: 1,
      serviceId: pkg1.serviceId,
      serviceName: pkg1.serviceName,
      scheduledDate: '2026-09-18',
      scheduledTime: '10:00 AM - 11:00 AM',
      actualCompletedAt: '2026-09-18T11:00:00Z',
      primaryStaffId: 'st-1',
      primaryStaffName: 'Dr. Ananya Reddy',
      secondaryStaffId: 'st-5',
      secondaryStaffName: 'Rohan Mehra',
      status: 'completed',
      remarks: 'First session completed smoothly. Minimal redness, good hydration response.',
      recordedBy: 'Sneha Rao',
      nextSessionDate: '2026-09-25',
      nextSessionTime: '10:00 AM',
      createdAt: '2026-09-15T11:20:00Z'
    },
    {
      id: 'ses-2',
      customerId: c1.id,
      customerName: c1.name,
      packageId: pkg1.id,
      packageName: pkg1.packageName,
      sessionNumber: 2,
      serviceId: pkg1.serviceId,
      serviceName: pkg1.serviceName,
      scheduledDate: '2026-09-25',
      scheduledTime: '10:00 AM - 11:00 AM',
      actualCompletedAt: '2026-09-25T11:05:00Z',
      primaryStaffId: 'st-1',
      primaryStaffName: 'Dr. Ananya Reddy',
      status: 'completed',
      remarks: 'Session 2 completed. Added peptide infusion for barrier recovery.',
      recordedBy: 'Sneha Rao',
      nextSessionDate: '2026-10-02',
      nextSessionTime: '10:00 AM',
      createdAt: '2026-09-18T11:05:00Z'
    },
    {
      id: 'ses-3',
      customerId: c1.id,
      customerName: c1.name,
      packageId: pkg1.id,
      packageName: pkg1.packageName,
      sessionNumber: 3,
      serviceId: pkg1.serviceId,
      serviceName: pkg1.serviceName,
      scheduledDate: '2026-10-02',
      scheduledTime: '10:00 AM - 11:00 AM',
      primaryStaffId: 'st-1',
      primaryStaffName: 'Dr. Ananya Reddy',
      status: 'scheduled',
      remarks: 'Session 3 scheduled for today.',
      recordedBy: 'Sneha Rao',
      createdAt: '2026-09-25T11:10:00Z'
    }
  ];
}

function seedInvoices(customers: Customer[], packages: PackageRecord[]): Invoice[] {
  const c1 = customers[0];
  const c2 = customers[1];
  const c3 = customers[2];

  return [
    {
      id: 'inv-1001',
      invoiceNumber: 'INV-2026-1001',
      customerId: c1.id,
      customerName: c1.name,
      customerPhone: c1.phone,
      packageId: 'pkg-1',
      serviceOrPackageName: '6-Session Hydra-Glow Restoration Package',
      invoiceDate: '2026-09-15',
      subtotal: 24000,
      discount: 2000,
      tax: 0,
      finalBilledAmount: 22000,
      paidAmount: 22000,
      outstandingBalance: 0,
      status: 'paid',
      createdBy: 'Sneha Rao (Front Desk)',
      createdAt: '2026-09-15T11:15:00Z'
    },
    {
      id: 'inv-1002',
      invoiceNumber: 'INV-2026-1002',
      customerId: c3.id,
      customerName: c3.name,
      customerPhone: c3.phone,
      packageId: 'pkg-2',
      serviceOrPackageName: '5-Session Precision Fractional Resurfacing',
      invoiceDate: '2026-08-10',
      subtotal: 42000,
      discount: 0,
      tax: 0,
      finalBilledAmount: 42000,
      paidAmount: 30000,
      outstandingBalance: 12000,
      status: 'partially_paid',
      createdBy: 'Sneha Rao (Front Desk)',
      createdAt: '2026-08-10T14:30:00Z'
    },
    {
      id: 'inv-1003',
      invoiceNumber: 'INV-2026-1003',
      customerId: c2.id,
      customerName: c2.name,
      customerPhone: c2.phone,
      serviceId: 'srv-3',
      serviceOrPackageName: 'Physician Comprehensive Consultation & Metabolic Screen',
      invoiceDate: '2026-10-01',
      subtotal: 3500,
      discount: 0,
      tax: 0,
      finalBilledAmount: 3500,
      paidAmount: 0,
      outstandingBalance: 3500,
      status: 'payment_postponed',
      createdBy: 'Sneha Rao (Front Desk)',
      createdAt: '2026-10-01T15:35:00Z'
    }
  ];
}

function seedPayments(invoices: Invoice[]): PaymentTransaction[] {
  const inv1 = invoices[0];
  const inv2 = invoices[1];

  return [
    {
      id: 'pay-1',
      invoiceId: inv1.id,
      invoiceNumber: inv1.invoiceNumber,
      customerId: inv1.customerId,
      customerName: inv1.customerName,
      amountReceived: 22000,
      paymentMethod: 'upi',
      paymentDate: '2026-09-15T11:20:00Z',
      transactionRef: 'UPI-9849012345-0915',
      recordedBy: 'Sneha Rao',
      remarks: 'Paid in full via GPay at reception counter.',
      createdAt: '2026-09-15T11:20:00Z'
    },
    {
      id: 'pay-2',
      invoiceId: inv2.id,
      invoiceNumber: inv2.invoiceNumber,
      customerId: inv2.customerId,
      customerName: inv2.customerName,
      amountReceived: 30000,
      paymentMethod: 'card',
      paymentDate: '2026-08-10T14:40:00Z',
      transactionRef: 'POS-TXN-492019',
      recordedBy: 'Sneha Rao',
      remarks: 'Initial deposit paid via HDFC Credit Card.',
      createdAt: '2026-08-10T14:40:00Z'
    }
  ];
}

function seedPaymentFollowUps(invoices: Invoice[]): PaymentFollowUp[] {
  const inv3 = invoices[2]; // Postponed payment
  const inv2 = invoices[1]; // Partial balance

  return [
    {
      id: 'pf-1',
      invoiceId: inv3.id,
      invoiceNumber: inv3.invoiceNumber,
      customerId: inv3.customerId,
      customerName: inv3.customerName,
      customerPhone: inv3.customerPhone,
      amountBilled: 3500,
      amountReceived: 0,
      remainingBalance: 3500,
      postponementReason: 'Client forgot wallet and mobile banking limit reached for the day.',
      expectedPaymentDate: '2026-10-03',
      assignedFollowUpOwner: 'Sneha Rao (Front Desk)',
      remarks: 'Promised to transfer via UPI by tomorrow morning.',
      status: 'pending',
      createdAt: '2026-10-01T15:40:00Z'
    },
    {
      id: 'pf-2',
      invoiceId: inv2.id,
      invoiceNumber: inv2.invoiceNumber,
      customerId: inv2.customerId,
      customerName: inv2.customerName,
      customerPhone: inv2.customerPhone,
      amountBilled: 42000,
      amountReceived: 30000,
      remainingBalance: 12000,
      postponementReason: 'Balance due upon session 4 completion.',
      expectedPaymentDate: '2026-10-15',
      assignedFollowUpOwner: 'Sneha Rao (Front Desk)',
      remarks: 'Agreed 2-installment schedule.',
      status: 'pending',
      createdAt: '2026-08-10T14:45:00Z'
    }
  ];
}

function seedAuditLogs(): AuditLog[] {
  return [
    {
      id: 'aud-1',
      actorId: 'usr-callcenter-1',
      actorName: 'Pooja Reddy',
      actorRole: 'call_center',
      timestamp: '2026-10-01T16:05:00Z',
      action: 'SCHEDULE_CALLBACK',
      recordType: 'followUp',
      recordId: 'flw-1',
      details: 'Scheduled callback for Sunita Reddy regarding trichology detox.'
    },
    {
      id: 'aud-2',
      actorId: 'usr-frontdesk-1',
      actorName: 'Sneha Rao',
      actorRole: 'front_desk',
      timestamp: '2026-10-01T15:35:00Z',
      action: 'RECORD_CONSULTATION',
      recordType: 'consultation',
      recordId: 'cns-2',
      details: 'Recorded consultation outcome for Karthik Rao with Dr. Ananya and Dietitian Kavita.'
    },
    {
      id: 'aud-3',
      actorId: 'usr-frontdesk-1',
      actorName: 'Sneha Rao',
      actorRole: 'front_desk',
      timestamp: '2026-10-01T15:40:00Z',
      action: 'POSTPONE_PAYMENT',
      recordType: 'invoice',
      recordId: 'inv-1003',
      details: 'Postponed payment of ₹3,500 for Karthik Rao with follow-up on 2026-10-03.'
    }
  ];
}

function seedDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('Admin@NFYVE2026', salt);
  const staffHash = bcrypt.hashSync('Staff@NFYVE2026', salt);
  const callCenterHash = bcrypt.hashSync('CallCenter@NFYVE2026', salt);
  const frontDeskHash = bcrypt.hashSync('FrontDesk@NFYVE2026', salt);
  const customerHash = bcrypt.hashSync('Customer@123', salt);

  const users: (User & { passwordHash: string })[] = [
    {
      id: 'usr-admin-1',
      name: 'Priya Narayanan (Administrator)',
      email: 'admin@nfyve.com',
      phone: '+91 9000023050',
      role: 'admin',
      designation: 'Sanctuary Director & Head Administrator',
      department: 'Executive Operations',
      passwordHash: adminHash,
      createdAt: '2025-01-01T08:00:00Z',
    },
    {
      id: 'usr-callcenter-1',
      name: 'Pooja Reddy (Call Center Lead)',
      email: 'callcenter@nfyve.com',
      phone: '+91 9000023056',
      role: 'call_center',
      designation: 'Senior Call Center Coordinator',
      department: 'Client Concierge & Inquiries',
      passwordHash: callCenterHash,
      createdAt: '2025-01-02T08:00:00Z',
    },
    {
      id: 'usr-frontdesk-1',
      name: 'Sneha Rao (Front Desk Executive)',
      email: 'frontdesk@nfyve.com',
      phone: '+91 9000023057',
      role: 'front_desk',
      designation: 'Front Desk Hospitality Lead',
      department: 'Sanctuary Reception & Scheduling',
      passwordHash: frontDeskHash,
      createdAt: '2025-01-02T08:00:00Z',
    },
    {
      id: 'usr-staff-ananya',
      name: 'Dr. Ananya Reddy',
      email: 'dr.ananya@nfyve.com',
      phone: '+91 9000023051',
      role: 'staff',
      staffId: 'st-1',
      designation: 'Lead Clinical Aesthetician & Dermatologist',
      department: 'Clinical Aesthetics',
      passwordHash: staffHash,
      createdAt: '2025-01-02T09:00:00Z',
    },
    {
      id: 'usr-staff-vikram',
      name: 'Coach Vikram Singh',
      email: 'vikram.singh@nfyve.com',
      phone: '+91 9000023052',
      role: 'staff',
      staffId: 'st-2',
      designation: 'Master Movement & Athletic Performance Coach',
      department: 'Fitness & Movement',
      passwordHash: staffHash,
      createdAt: '2025-01-03T09:00:00Z',
    },
    {
      id: 'usr-staff-kavita',
      name: 'Kavita Nair, RD',
      email: 'kavita.nair@nfyve.com',
      phone: '+91 9000023053',
      role: 'staff',
      staffId: 'st-3',
      designation: 'Chief Clinical Dietitian & Functional Nutritionist',
      department: 'Functional Nutrition',
      passwordHash: staffHash,
      createdAt: '2025-01-04T09:00:00Z',
    },
    {
      id: 'usr-staff-sameer',
      name: 'Sameer Khan',
      email: 'sameer.khan@nfyve.com',
      phone: '+91 9000023054',
      role: 'staff',
      staffId: 'st-4',
      designation: 'Senior Trichologist & Hair Restoration Specialist',
      department: 'Salon & Hair Care',
      passwordHash: staffHash,
      createdAt: '2025-01-05T09:00:00Z',
    },
    {
      id: 'usr-staff-1',
      name: 'Rohan Mehra',
      email: 'staff@nfyve.com',
      phone: '+91 9000023055',
      role: 'staff',
      staffId: 'st-5',
      designation: 'Metabolic & Recovery Therapist',
      department: 'Recovery & Longevity',
      passwordHash: staffHash,
      createdAt: '2025-01-06T09:00:00Z',
    },
    {
      id: 'usr-cust-1',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 9849012345',
      role: 'customer',
      passwordHash: customerHash,
      createdAt: '2025-02-01T10:00:00Z',
    }
  ];

  const customers = seedCustomers();
  const services = INITIAL_SERVICES;
  const staff = INITIAL_STAFF;
  const categories = INITIAL_CATEGORIES;
  const reviews = INITIAL_REVIEWS;
  const settings = BUSINESS_SETTINGS;

  const roomList: RoomId[] = ['Consult 1', 'Consult 2', 'Slim-1', 'Slim-2', 'Skin / Hair'];

  // Historical appointments
  const appointments: Appointment[] = [];
  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:30 AM - 11:30 AM',
    '12:00 PM - 01:00 PM',
    '02:30 PM - 03:30 PM',
    '04:00 PM - 05:00 PM',
    '05:30 PM - 06:30 PM'
  ];

  let bookingCounter = 1001;
  const referenceDate = new Date('2026-10-02T12:00:00Z');

  for (let monthOffset = 6; monthOffset >= 0; monthOffset--) {
    const countForMonth = 8 + (monthOffset % 4) * 2;
    for (let i = 0; i < countForMonth; i++) {
      const d = new Date(referenceDate);
      d.setMonth(d.getMonth() - monthOffset);
      const day = 1 + ((i * 3 + monthOffset * 2) % 27);
      d.setDate(day);

      const dateStr = d.toISOString().split('T')[0];
      const isPast = d < referenceDate;
      const cust = customers[(i + monthOffset) % customers.length];
      const srv = services[(i + monthOffset * 2) % services.length];
      const cat = categories.find(c => c.id === srv.categoryId);
      const staffMember = staff[(i + monthOffset) % staff.length];
      const room = roomList[(i + monthOffset) % roomList.length];

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
        customerId: cust.id,
        customerName: cust.name,
        customerEmail: cust.email,
        customerPhone: cust.phone,
        serviceId: srv.id,
        serviceName: srv.name,
        categoryName: cat ? cat.name : 'Wellness',
        staffId: staffMember.id,
        staffName: staffMember.name,
        assignedStaffId: staffMember.id,
        assignedStaffName: staffMember.name,
        room,
        durationMins: srv.durationMins || 60,
        bookingChannel: i % 2 === 0 ? 'Phone Call' : 'Walk-in',
        appointmentDate: dateStr,
        timeSlot: timeSlots[i % timeSlots.length],
        status,
        paymentStatus,
        amountInr: srv.priceInr,
        notes: isPast ? 'Treatment completed as scheduled in sanctuary room.' : 'Phone consultation booked with confirmed room.',
        createdAt: new Date(d.getTime() - 86400000 * 2).toISOString(),
        updatedAt: d.toISOString(),
      });

      bookingCounter++;
    }
  }

  // Today's appointments (2026-10-02) across distinct rooms
  appointments.push(
    {
      id: 'apt-today-1',
      bookingRef: 'NF-2026-2001',
      customerId: customers[0].id,
      customerName: customers[0].name,
      customerPhone: customers[0].phone,
      serviceId: 'srv-1',
      serviceName: 'Hydra-Infusion Clinical Facial',
      categoryName: 'Clinical Aesthetics',
      staffId: 'st-1',
      staffName: 'Dr. Ananya Reddy',
      assignedStaffId: 'st-1',
      assignedStaffName: 'Dr. Ananya Reddy',
      room: 'Skin / Hair',
      durationMins: 60,
      bookingChannel: 'Phone Call',
      appointmentDate: '2026-10-02',
      timeSlot: '10:00 AM - 11:00 AM',
      status: 'confirmed',
      paymentStatus: 'paid',
      amountInr: 4500,
      notes: 'Customer requested gentle extraction. Room Skin / Hair prepped.',
      createdAt: '2026-10-01T10:00:00Z',
      updatedAt: '2026-10-01T10:00:00Z'
    },
    {
      id: 'apt-today-2',
      bookingRef: 'NF-2026-2002',
      customerId: customers[1].id,
      customerName: customers[1].name,
      customerPhone: customers[1].phone,
      serviceId: 'srv-3',
      serviceName: 'Physician-Guided Metabolic Weight Loss',
      categoryName: 'Medical Weight Loss',
      staffId: 'st-1',
      staffName: 'Dr. Ananya Reddy',
      assignedStaffId: 'st-1',
      assignedStaffName: 'Dr. Ananya Reddy',
      room: 'Consult 1',
      durationMins: 60,
      bookingChannel: 'Phone Call',
      appointmentDate: '2026-10-02',
      timeSlot: '02:30 PM - 03:30 PM',
      status: 'confirmed',
      paymentStatus: 'pending',
      amountInr: 3500,
      notes: 'Consultation & metabolic test review.',
      createdAt: '2026-10-01T11:00:00Z',
      updatedAt: '2026-10-01T11:00:00Z'
    },
    {
      id: 'apt-today-3',
      bookingRef: 'NF-2026-2003',
      customerId: customers[3].id,
      customerName: customers[3].name,
      customerPhone: customers[3].phone,
      serviceId: 'srv-5',
      serviceName: '1-on-1 Bespoke Strength & Biomechanics Training',
      categoryName: 'Fitness & Gym Studio',
      staffId: 'st-2',
      staffName: 'Coach Vikram Singh',
      assignedStaffId: 'st-2',
      assignedStaffName: 'Coach Vikram Singh',
      room: 'Slim-1',
      durationMins: 60,
      bookingChannel: 'Walk-in',
      appointmentDate: '2026-10-02',
      timeSlot: '04:00 PM - 05:00 PM',
      status: 'checked_in',
      paymentStatus: 'paid',
      amountInr: 3000,
      notes: 'Walk-in registration. Movement screen in progress.',
      checkedInAt: '2026-10-02T15:55:00Z',
      createdAt: '2026-10-02T15:50:00Z',
      updatedAt: '2026-10-02T15:55:00Z'
    }
  );

  const callLogs = seedCallLogs(customers);
  const followUps = seedFollowUps(customers);
  const consultations = seedConsultations(customers, appointments);
  const packages = seedPackages(customers);
  const sessions = seedSessions(customers, packages);
  const invoices = seedInvoices(customers, packages);
  const payments = seedPayments(invoices);
  const paymentFollowUps = seedPaymentFollowUps(invoices);
  const auditLogs = seedAuditLogs();
  const notifications = seedNotifications();

  return {
    users,
    customers,
    categories,
    services,
    staff,
    appointments,
    callLogs,
    followUps,
    consultations,
    packages,
    sessions,
    invoices,
    payments,
    paymentFollowUps,
    auditLogs,
    inquiries: [],
    reviews,
    settings,
    chatMessages: [],
    notifications
  };
}

export const db = {
  // Rooms
  getRooms(): Room[] {
    return ROOMS;
  },

  // Users & Auth
  getUsers(): User[] {
    const data = getDb();
    return data.users.map(({ passwordHash: _, ...safe }) => safe);
  },
  getUserById(id: string): User | null {
    const data = getDb();
    const user = data.users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash: _, ...safe } = user;
    return safe;
  },
  getUserByEmail(email: string): (User & { passwordHash: string }) | null {
    const data = getDb();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },
  createUser(user: User & { passwordHash: string }) {
    const data = getDb();
    data.users.push(user);
    saveDb(data);
    const { passwordHash: _, ...safe } = user;
    return safe;
  },
  updateUser(id: string, updates: Partial<User>) {
    const data = getDb();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      data.users[idx] = { ...data.users[idx], ...updates, updatedAt: new Date().toISOString() };
      saveDb(data);
      const { passwordHash: _, ...safe } = data.users[idx];
      return safe;
    }
    return null;
  },

  // Customers & Prospects
  getCustomers(query?: { search?: string; status?: string; source?: string }): Customer[] {
    const data = getDb();
    let result = [...(data.customers || [])];

    if (query?.search) {
      const q = query.search.toLowerCase().trim();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.id.toLowerCase().includes(q)
      );
    }

    if (query?.status) {
      result = result.filter(c => c.lifecycleStatus === query.status);
    }

    if (query?.source) {
      result = result.filter(c => c.leadSource === query.source);
    }

    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getCustomerById(id: string): Customer | null {
    const data = getDb();
    return data.customers.find(c => c.id === id) || null;
  },

  getCustomerByPhone(phone: string): Customer | null {
    const data = getDb();
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return data.customers.find(c => c.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone) || null;
  },

  createCustomer(cust: Partial<Customer>, actorName = 'System'): Customer {
    const data = getDb();
    const cleanPhone = cust.phone ? cust.phone.trim() : '';

    // Check existing
    const existing = cleanPhone ? this.getCustomerByPhone(cleanPhone) : null;
    if (existing) {
      throw new Error(`A prospect or customer with phone number ${cleanPhone} already exists: ${existing.name} (${existing.id}).`);
    }

    const nextId = `CUST-${1000 + (data.customers.length + 1)}`;
    const newCustomer: Customer = {
      id: nextId,
      name: (cust.name || 'New Client').trim(),
      phone: cleanPhone,
      email: cust.email ? cust.email.trim().toLowerCase() : undefined,
      leadSource: cust.leadSource || 'Phone Call',
      bookingChannel: cust.bookingChannel || (cust.leadSource === 'Walk-in' ? 'Walk-in' : 'Phone Call'),
      lifecycleStatus: cust.lifecycleStatus || 'new_prospect',
      assignedEmployeeId: cust.assignedEmployeeId,
      assignedEmployeeName: cust.assignedEmployeeName,
      interestedServiceId: cust.interestedServiceId,
      interestedServiceName: cust.interestedServiceName,
      initialRemarks: cust.initialRemarks || '',
      notes: cust.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalSpendInr: 0,
      completedTreatments: 0
    };

    data.customers.unshift(newCustomer);

    this.createAuditLog({
      actorId: 'system',
      actorName,
      actorRole: 'call_center',
      action: 'CREATE_PROSPECT',
      recordType: 'customer',
      recordId: newCustomer.id,
      details: `Created new prospect ${newCustomer.name} (${newCustomer.phone}) via ${newCustomer.leadSource}`
    });

    saveDb(data);
    return newCustomer;
  },

  updateCustomer(id: string, updates: Partial<Customer>, actorName = 'System'): Customer | null {
    const data = getDb();
    const idx = data.customers.findIndex(c => c.id === id);
    if (idx === -1) return null;

    data.customers[idx] = {
      ...data.customers[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.createAuditLog({
      actorId: 'system',
      actorName,
      actorRole: 'front_desk',
      action: 'UPDATE_CUSTOMER',
      recordType: 'customer',
      recordId: id,
      details: `Updated details for customer ${data.customers[idx].name}`
    });

    saveDb(data);
    return data.customers[idx];
  },

  getCustomer360(id: string) {
    const data = getDb();
    const customer = data.customers.find(c => c.id === id);
    if (!customer) return null;

    const appointments = data.appointments.filter(a => a.customerId === id || a.userId === id);
    const callLogs = data.callLogs.filter(l => l.customerId === id);
    const followUps = data.followUps.filter(f => f.customerId === id);
    const consultations = data.consultations.filter(c => c.customerId === id);
    const packages = data.packages.filter(p => p.customerId === id);
    const sessions = data.sessions.filter(s => s.customerId === id);
    const invoices = data.invoices.filter(i => i.customerId === id);
    const payments = data.payments.filter(p => p.customerId === id);
    const paymentFollowUps = data.paymentFollowUps.filter(pf => pf.customerId === id);

    // Build unified chronological activity timeline
    const timeline: { id: string; type: string; title: string; desc: string; date: string; icon: string }[] = [];

    timeline.push({
      id: `act-reg-${customer.id}`,
      type: 'registration',
      title: 'Customer Enrolled',
      desc: `Registered as ${customer.lifecycleStatus.replace('_', ' ')} via ${customer.leadSource}. Initial notes: ${customer.initialRemarks || 'N/A'}`,
      date: customer.createdAt,
      icon: 'UserPlus'
    });

    callLogs.forEach(c => {
      timeline.push({
        id: `act-call-${c.id}`,
        type: 'call',
        title: `Call Recorded: ${c.outcome.replace('_', ' ').toUpperCase()}`,
        desc: `${c.remarks} (Logged by ${c.employeeName})`,
        date: c.dateTime,
        icon: 'PhoneCall'
      });
    });

    followUps.forEach(f => {
      timeline.push({
        id: `act-flw-${f.id}`,
        type: 'followup',
        title: `Follow-up ${f.status.toUpperCase()}: ${f.type}`,
        desc: `${f.reason} (Due: ${f.dueDate} ${f.dueTime || ''})`,
        date: f.createdAt,
        icon: 'Calendar'
      });
    });

    appointments.forEach(a => {
      timeline.push({
        id: `act-apt-${a.id}`,
        type: 'appointment',
        title: `Appointment ${a.status.toUpperCase()}: ${a.serviceName}`,
        desc: `Room: ${a.room || 'Unassigned'} · Specialist: ${a.assignedStaffName || a.staffName || 'Concierge'} · ${a.timeSlot}`,
        date: a.createdAt,
        icon: 'CalendarCheck'
      });
    });

    consultations.forEach(c => {
      timeline.push({
        id: `act-cns-${c.id}`,
        type: 'consultation',
        title: `Consultation Completed: ${c.outcome.replace(/_/g, ' ').toUpperCase()}`,
        desc: `Primary: ${c.primaryStaffName} · Recommendations: ${c.recommendedPackageOrService || 'General Care'} · ${c.remarks}`,
        date: c.completedAt,
        icon: 'Stethoscope'
      });
    });

    packages.forEach(p => {
      timeline.push({
        id: `act-pkg-${p.id}`,
        type: 'package',
        title: `Package Enrolled: ${p.packageName}`,
        desc: `${p.totalSessions} sessions · ₹${p.packagePrice.toLocaleString('en-IN')}`,
        date: p.purchaseDate,
        icon: 'Package'
      });
    });

    sessions.forEach(s => {
      timeline.push({
        id: `act-ses-${s.id}`,
        type: 'session',
        title: `Session ${s.sessionNumber} (${s.status.toUpperCase()}): ${s.serviceName}`,
        desc: `Staff: ${s.primaryStaffName} · ${s.remarks || 'Completed as scheduled'}`,
        date: s.actualCompletedAt || s.scheduledDate,
        icon: 'Sparkles'
      });
    });

    invoices.forEach(i => {
      timeline.push({
        id: `act-inv-${i.id}`,
        type: 'invoice',
        title: `Invoice Generated (${i.invoiceNumber})`,
        desc: `Total: ₹${i.finalBilledAmount.toLocaleString('en-IN')} · Status: ${i.status} · Balance: ₹${i.outstandingBalance.toLocaleString('en-IN')}`,
        date: i.invoiceDate,
        icon: 'FileText'
      });
    });

    payments.forEach(p => {
      timeline.push({
        id: `act-pay-${p.id}`,
        type: 'payment',
        title: `Payment Received: ₹${p.amountReceived.toLocaleString('en-IN')}`,
        desc: `Method: ${p.paymentMethod.toUpperCase()} · Ref: ${p.transactionRef || 'Desk Collection'} · ${p.remarks || ''}`,
        date: p.paymentDate,
        icon: 'IndianRupee'
      });
    });

    timeline.sort((a, b) => b.date.localeCompare(a.date));

    return {
      customer,
      appointments,
      callLogs,
      followUps,
      consultations,
      packages,
      sessions,
      invoices,
      payments,
      paymentFollowUps,
      timeline
    };
  },

  // Call Logs
  getCallLogs(customerId?: string): CallLog[] {
    const data = getDb();
    let logs = [...data.callLogs];
    if (customerId) {
      logs = logs.filter(l => l.customerId === customerId);
    }
    return logs.sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  },

  createCallLog(payload: Omit<CallLog, 'id' | 'createdAt'>): CallLog {
    const data = getDb();
    const newLog: CallLog = {
      id: `call-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...payload,
      createdAt: new Date().toISOString()
    };

    data.callLogs.unshift(newLog);

    // Update customer lifecycle based on outcome
    const cust = data.customers.find(c => c.id === payload.customerId);
    if (cust) {
      if (payload.outcome === 'appointment_confirmed') {
        cust.lifecycleStatus = 'appointment_confirmed';
      } else if (payload.outcome === 'interested' || payload.outcome === 'callback_requested') {
        cust.lifecycleStatus = 'followup_required';
      } else if (payload.outcome === 'not_interested') {
        cust.lifecycleStatus = 'not_interested';
      } else if (payload.outcome === 'invalid_number') {
        cust.lifecycleStatus = 'unreachable';
      }
      cust.updatedAt = new Date().toISOString();
    }

    // If follow-up date specified, automatically create a FollowUp
    if (payload.followUpDate) {
      data.followUps.unshift({
        id: `flw-${Date.now()}`,
        customerId: payload.customerId,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        type: 'prospect',
        dueDate: payload.followUpDate,
        dueTime: '11:00 AM',
        assignedEmployeeId: payload.employeeId,
        assignedEmployeeName: payload.employeeName,
        reason: payload.remarks || 'Scheduled follow-up call',
        latestOutcome: payload.outcome,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    }

    this.createAuditLog({
      actorId: payload.employeeId,
      actorName: payload.employeeName,
      actorRole: 'call_center',
      action: 'RECORD_CALL',
      recordType: 'callLog',
      recordId: newLog.id,
      details: `Recorded ${payload.outcome} call with ${payload.customerName}`
    });

    saveDb(data);
    return newLog;
  },

  // Follow-ups & Callbacks
  getFollowUps(filter?: { status?: string; period?: string; employeeId?: string; todayDate?: string }): FollowUp[] {
    const data = getDb();
    let list = [...data.followUps];
    const todayStr = filter?.todayDate || new Date().toISOString().split('T')[0];

    if (filter?.status) {
      list = list.filter(f => f.status === filter.status);
    }

    if (filter?.employeeId) {
      list = list.filter(f => f.assignedEmployeeId === filter.employeeId);
    }

    if (filter?.period === 'today') {
      list = list.filter(f => f.dueDate === todayStr);
    } else if (filter?.period === 'overdue') {
      list = list.filter(f => f.status === 'pending' && f.dueDate < todayStr);
    } else if (filter?.period === 'upcoming') {
      list = list.filter(f => f.dueDate > todayStr);
    }

    return list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  },

  createFollowUp(payload: Omit<FollowUp, 'id' | 'createdAt'>): FollowUp {
    const data = getDb();
    const newFollowUp: FollowUp = {
      id: `flw-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString()
    };
    data.followUps.unshift(newFollowUp);
    saveDb(data);
    return newFollowUp;
  },

  updateFollowUp(id: string, updates: Partial<FollowUp>, actorName = 'System'): FollowUp | null {
    const data = getDb();
    const idx = data.followUps.findIndex(f => f.id === id);
    if (idx === -1) return null;

    data.followUps[idx] = {
      ...data.followUps[idx],
      ...updates
    };

    if (updates.status === 'completed') {
      data.followUps[idx].completedAt = new Date().toISOString();
      data.followUps[idx].completedBy = actorName;
    }

    saveDb(data);
    return data.followUps[idx];
  },

  // Appointments with Overlap / Conflict Prevention
  checkConflict(date: string, timeSlot: string, room?: RoomId, staffId?: string, excludeAppointmentId?: string): { hasConflict: boolean; reason?: string } {
    const data = getDb();
    for (const apt of data.appointments) {
      if (apt.id === excludeAppointmentId) continue;
      if (apt.appointmentDate !== date) continue;
      if (['cancelled', 'no-show'].includes(apt.status)) continue;

      if (apt.timeSlot === timeSlot) {
        if (room && apt.room === room) {
          return {
            hasConflict: true,
            reason: `Scheduling resource "${room}" is already reserved for "${apt.customerName}" during ${timeSlot} on ${date}.`
          };
        }
        if (staffId && (apt.staffId === staffId || apt.assignedStaffId === staffId)) {
          return {
            hasConflict: true,
            reason: `Specialist "${apt.assignedStaffName || apt.staffName || 'Staff Member'}" is already scheduled with another client during ${timeSlot} on ${date}.`
          };
        }
      }
    }
    return { hasConflict: false };
  },

  getAppointments(query?: { date?: string; room?: RoomId; staffId?: string; status?: string; search?: string }): Appointment[] {
    const data = getDb();
    let list = [...data.appointments];

    if (query?.date) {
      list = list.filter(a => a.appointmentDate === query.date);
    }
    if (query?.room) {
      list = list.filter(a => a.room === query.room);
    }
    if (query?.staffId) {
      list = list.filter(a => a.staffId === query.staffId || a.assignedStaffId === query.staffId);
    }
    if (query?.status) {
      list = list.filter(a => a.status === query.status);
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      list = list.filter(a => 
        a.bookingRef.toLowerCase().includes(q) ||
        a.customerName.toLowerCase().includes(q) ||
        a.customerPhone.includes(q) ||
        a.serviceName.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate) || b.createdAt.localeCompare(a.createdAt));
  },

  getAppointmentById(id: string): Appointment | null {
    const data = getDb();
    return data.appointments.find(a => a.id === id || a.bookingRef === id) || null;
  },

  createAppointment(payload: Partial<Appointment>, actor = 'System'): Appointment {
    const data = getDb();
    const date = payload.appointmentDate || '2026-10-02';
    const timeSlot = payload.timeSlot || '10:00 AM - 11:00 AM';
    const room = payload.room || 'Consult 1';
    const staffId = payload.assignedStaffId || payload.staffId;

    // Run Conflict Check
    const conflict = this.checkConflict(date, timeSlot, room, staffId);
    if (conflict.hasConflict) {
      throw new Error(`Booking Conflict: ${conflict.reason}`);
    }

    const bookingNum = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `NF-2026-${bookingNum}`;
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      bookingRef,
      customerId: payload.customerId || payload.userId || `CUST-${bookingNum}`,
      userId: payload.customerId || payload.userId || `CUST-${bookingNum}`,
      customerName: (payload.customerName || 'Sanctuary Client').trim(),
      customerEmail: payload.customerEmail || '',
      customerPhone: payload.customerPhone || '+91 9000023050',
      serviceId: payload.serviceId || 'srv-1',
      serviceName: payload.serviceName || 'Clinical Consultation',
      categoryName: payload.categoryName || 'General Transformation',
      room,
      durationMins: payload.durationMins || 60,
      staffId: staffId || 'st-1',
      staffName: payload.assignedStaffName || payload.staffName || 'Specialist',
      assignedStaffId: staffId || 'st-1',
      assignedStaffName: payload.assignedStaffName || payload.staffName || 'Specialist',
      bookingChannel: payload.bookingChannel || 'Phone Call',
      appointmentDate: date,
      timeSlot,
      status: payload.status || 'confirmed',
      paymentStatus: payload.paymentStatus || 'pending',
      amountInr: payload.amountInr || 3500,
      notes: payload.notes || '',
      createdBy: actor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.appointments.unshift(newApt);

    // Update customer lifecycle status
    if (payload.customerId) {
      const cust = data.customers.find(c => c.id === payload.customerId);
      if (cust) {
        cust.lifecycleStatus = 'appointment_confirmed';
        cust.updatedAt = new Date().toISOString();
      }
    }

    this.createAuditLog({
      actorId: 'system',
      actorName: actor,
      actorRole: 'front_desk',
      action: 'CREATE_APPOINTMENT',
      recordType: 'appointment',
      recordId: newApt.id,
      details: `Booked appointment ${newApt.bookingRef} for ${newApt.customerName} in ${newApt.room} with ${newApt.assignedStaffName}`
    });

    saveDb(data);
    return newApt;
  },

  updateAppointmentStatus(id: string, status: AppointmentStatus, details?: { reason?: string; actor?: string }): Appointment | null {
    const data = getDb();
    const apt = data.appointments.find(a => a.id === id || a.bookingRef === id);
    if (!apt) return null;

    const oldStatus = apt.status;
    if (oldStatus === status) {
      return apt;
    }

    const VALID_TRANSITIONS: Partial<Record<AppointmentStatus, AppointmentStatus[]>> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['checked_in', 'in_consultation', 'cancelled', 'rescheduled', 'no-show'],
      checked_in: ['in_consultation', 'in_progress', 'consultation_completed', 'completed', 'cancelled'],
      in_consultation: ['consultation_completed', 'completed', 'cancelled'],
      consultation_completed: ['completed', 'confirmed'],
      in_progress: ['completed', 'cancelled'],
      rescheduled: ['confirmed', 'checked_in', 'cancelled'],
      'no-show': ['rescheduled', 'confirmed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    const allowed = VALID_TRANSITIONS[oldStatus];
    if (allowed && !allowed.includes(status)) {
      throw new Error(`Invalid status transition from "${oldStatus}" to "${status}".`);
    }

    apt.status = status;
    apt.updatedAt = new Date().toISOString();

    if (status === 'checked_in') {
      apt.checkedInAt = new Date().toISOString();
    }
    if (status === 'cancelled' && details?.reason) {
      apt.cancellationReason = details.reason;
    }

    this.createAuditLog({
      actorId: 'system',
      actorName: details?.actor || 'Reception Desk',
      actorRole: 'front_desk',
      action: 'UPDATE_APPOINTMENT_STATUS',
      recordType: 'appointment',
      recordId: apt.id,
      details: `Status changed from ${oldStatus} to ${status}${details?.reason ? ` (${details.reason})` : ''}`
    });

    saveDb(data);
    return apt;
  },

  rescheduleAppointment(id: string, newDate: string, newTimeSlot: string, newRoom?: RoomId, newStaffId?: string, actor = 'System'): Appointment {
    const data = getDb();
    const apt = data.appointments.find(a => a.id === id || a.bookingRef === id);
    if (!apt) throw new Error('Appointment not found.');

    const roomToUse = newRoom || apt.room;
    const staffToUse = newStaffId || apt.assignedStaffId || apt.staffId;

    // Conflict check
    const conflict = this.checkConflict(newDate, newTimeSlot, roomToUse, staffToUse, apt.id);
    if (conflict.hasConflict) {
      throw new Error(`Reschedule Conflict: ${conflict.reason}`);
    }

    apt.appointmentDate = newDate;
    apt.timeSlot = newTimeSlot;
    if (newRoom) apt.room = newRoom;
    if (newStaffId) {
      const staffMember = data.staff.find(s => s.id === newStaffId);
      apt.staffId = newStaffId;
      apt.assignedStaffId = newStaffId;
      if (staffMember) {
        apt.staffName = staffMember.name;
        apt.assignedStaffName = staffMember.name;
      }
    }
    apt.status = 'confirmed';
    apt.updatedAt = new Date().toISOString();

    this.createAuditLog({
      actorId: 'system',
      actorName: actor,
      actorRole: 'front_desk',
      action: 'RESCHEDULE_APPOINTMENT',
      recordType: 'appointment',
      recordId: apt.id,
      details: `Rescheduled to ${newDate} at ${newTimeSlot} in ${apt.room}`
    });

    saveDb(data);
    return apt;
  },

  // Consultations
  getConsultations(customerId?: string): Consultation[] {
    const data = getDb();
    let list = [...data.consultations];
    if (customerId) {
      list = list.filter(c => c.customerId === customerId);
    }
    return list.sort((a, b) => b.consultationDate.localeCompare(a.consultationDate));
  },

  createConsultation(payload: Omit<Consultation, 'id' | 'createdAt'>, actor = 'Front Desk'): Consultation {
    const data = getDb();
    const newConsultation: Consultation = {
      id: `cns-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString()
    };

    data.consultations.unshift(newConsultation);

    // Update customer lifecycle & notes
    const cust = data.customers.find(c => c.id === payload.customerId);
    if (cust) {
      cust.lifecycleStatus = payload.outcome === 'completed_package_purchased' 
        ? 'package_purchased' 
        : 'consultation_completed';
      cust.updatedAt = new Date().toISOString();
    }

    // If follow-up required, schedule a callback
    if (payload.outcome === 'completed_followup_required' && payload.nextFollowUpDate) {
      data.followUps.unshift({
        id: `flw-${Date.now()}`,
        customerId: payload.customerId,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        type: 'consultation',
        relatedId: newConsultation.id,
        dueDate: payload.nextFollowUpDate,
        dueTime: '02:00 PM',
        assignedEmployeeId: 'usr-callcenter-1',
        assignedEmployeeName: 'Pooja Reddy',
        reason: `Follow-up after consultation with ${payload.primaryStaffName}. Notes: ${payload.remarks}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    }

    this.createAuditLog({
      actorId: 'system',
      actorName: actor,
      actorRole: 'front_desk',
      action: 'RECORD_CONSULTATION',
      recordType: 'consultation',
      recordId: newConsultation.id,
      details: `Consultation completed for ${payload.customerName} by ${payload.primaryStaffName}${payload.secondaryStaffName ? ` & ${payload.secondaryStaffName}` : ''}. Outcome: ${payload.outcome}`
    });

    saveDb(data);
    return newConsultation;
  },

  // Packages
  getPackages(customerId?: string): PackageRecord[] {
    const data = getDb();
    let list = [...data.packages];
    if (customerId) {
      list = list.filter(p => p.customerId === customerId);
    }
    return list;
  },

  createPackage(payload: Omit<PackageRecord, 'id' | 'createdAt' | 'completedSessions' | 'remainingSessions'>, actor = 'Front Desk'): PackageRecord {
    const data = getDb();
    const newPkg: PackageRecord = {
      id: `pkg-${Date.now()}`,
      ...payload,
      completedSessions: 0,
      remainingSessions: payload.totalSessions,
      createdAt: new Date().toISOString()
    };

    data.packages.unshift(newPkg);

    const cust = data.customers.find(c => c.id === payload.customerId);
    if (cust) {
      cust.lifecycleStatus = 'package_purchased';
      cust.updatedAt = new Date().toISOString();
    }

    this.createAuditLog({
      actorId: 'system',
      actorName: actor,
      actorRole: 'front_desk',
      action: 'ENROLL_PACKAGE',
      recordType: 'package',
      recordId: newPkg.id,
      details: `Enrolled ${newPkg.customerName} into ${newPkg.packageName} (${newPkg.totalSessions} sessions)`
    });

    saveDb(data);
    return newPkg;
  },

  // Treatment Sessions
  getSessions(packageId?: string, customerId?: string): TreatmentSession[] {
    const data = getDb();
    let list = [...data.sessions];
    if (packageId) {
      list = list.filter(s => s.packageId === packageId);
    }
    if (customerId) {
      list = list.filter(s => s.customerId === customerId);
    }
    return list.sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
  },

  createSession(payload: Omit<TreatmentSession, 'id' | 'createdAt'>, actor = 'Front Desk'): TreatmentSession {
    const data = getDb();
    const newSession: TreatmentSession = {
      id: `ses-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString()
    };

    data.sessions.unshift(newSession);

    this.createAuditLog({
      actorId: 'system',
      actorName: actor,
      actorRole: 'front_desk',
      action: 'SCHEDULE_SESSION',
      recordType: 'session',
      recordId: newSession.id,
      details: `Scheduled Session #${newSession.sessionNumber} for ${newSession.customerName} on ${newSession.scheduledDate}`
    });

    saveDb(data);
    return newSession;
  },

  completeSession(
    sessionId: string, 
    details: { 
      actualCompletedAt: string; 
      primaryStaffId: string; 
      primaryStaffName: string; 
      secondaryStaffId?: string; 
      secondaryStaffName?: string; 
      remarks?: string; 
      nextSessionDate?: string; 
      nextSessionTime?: string 
    }, 
    actor = 'Specialist'
  ): TreatmentSession {
    const data = getDb();
    const session = data.sessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found.');

    if (session.status === 'completed') {
      throw new Error('This treatment session is already marked as completed.');
    }

    session.status = 'completed';
    session.actualCompletedAt = details.actualCompletedAt || new Date().toISOString();
    session.primaryStaffId = details.primaryStaffId;
    session.primaryStaffName = details.primaryStaffName;
    session.secondaryStaffId = details.secondaryStaffId;
    session.secondaryStaffName = details.secondaryStaffName;
    if (details.remarks) session.remarks = details.remarks;
    session.recordedBy = actor;

    // Recalculate package completed and remaining sessions from session ledger
    const pkg = data.packages.find(p => p.id === session.packageId);
    if (pkg) {
      const completedCount = data.sessions.filter(s => s.packageId === pkg.id && s.status === 'completed').length;
      pkg.completedSessions = completedCount;
      pkg.remainingSessions = Math.max(0, pkg.totalSessions - completedCount);
      if (pkg.remainingSessions === 0) {
        pkg.packageStatus = 'completed';
      }
    }

    // Update customer completed treatments count
    const cust = data.customers.find(c => c.id === session.customerId);
    if (cust) {
      cust.completedTreatments = (cust.completedTreatments || 0) + 1;
      cust.updatedAt = new Date().toISOString();
    }

    // If next session requested, schedule it
    if (details.nextSessionDate && pkg && pkg.remainingSessions > 0) {
      const nextSessionNumber = (pkg.completedSessions || 0) + 1;
      data.sessions.unshift({
        id: `ses-${Date.now()}-next`,
        customerId: session.customerId,
        customerName: session.customerName,
        packageId: session.packageId,
        packageName: session.packageName,
        sessionNumber: nextSessionNumber,
        serviceId: session.serviceId,
        serviceName: session.serviceName,
        scheduledDate: details.nextSessionDate,
        scheduledTime: details.nextSessionTime || '11:00 AM - 12:00 PM',
        primaryStaffId: details.primaryStaffId,
        primaryStaffName: details.primaryStaffName,
        status: 'scheduled',
        remarks: 'Next session auto-scheduled post completion.',
        recordedBy: actor,
        createdAt: new Date().toISOString()
      });
    }

    this.createAuditLog({
      actorId: details.primaryStaffId,
      actorName: actor,
      actorRole: 'staff',
      action: 'COMPLETE_SESSION',
      recordType: 'session',
      recordId: session.id,
      details: `Completed session #${session.sessionNumber} for ${session.customerName} by ${details.primaryStaffName}${details.secondaryStaffName ? ` & ${details.secondaryStaffName}` : ''}`
    });

    saveDb(data);
    return session;
  },

  // Invoices & Billing
  getInvoices(customerId?: string): Invoice[] {
    const data = getDb();
    let list = [...data.invoices];
    if (customerId) {
      list = list.filter(i => i.customerId === customerId);
    }
    return list.sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
  },

  getInvoiceById(id: string): Invoice | null {
    const data = getDb();
    return data.invoices.find(i => i.id === id || i.invoiceNumber === id) || null;
  },

  createInvoice(payload: Omit<Invoice, 'id' | 'invoiceNumber' | 'paidAmount' | 'outstandingBalance' | 'createdAt'>, actor = 'Front Desk'): Invoice {
    const data = getDb();
    const invNum = `INV-2026-${1000 + data.invoices.length + 1}`;
    const finalAmount = Math.max(0, (payload.subtotal - (payload.discount || 0)) + (payload.tax || 0));

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNum,
      ...payload,
      finalBilledAmount: finalAmount,
      paidAmount: 0,
      outstandingBalance: finalAmount,
      status: 'unpaid',
      createdBy: actor,
      createdAt: new Date().toISOString()
    };

    data.invoices.unshift(newInvoice);

    this.createAuditLog({
      actorId: 'system',
      actorName: actor,
      actorRole: 'front_desk',
      action: 'CREATE_INVOICE',
      recordType: 'invoice',
      recordId: newInvoice.id,
      details: `Created invoice ${newInvoice.invoiceNumber} for ${newInvoice.customerName} totaling ₹${finalAmount}`
    });

    saveDb(data);
    return newInvoice;
  },

  // Payments
  getPayments(invoiceId?: string, customerId?: string): PaymentTransaction[] {
    const data = getDb();
    let list = [...data.payments];
    if (invoiceId) {
      list = list.filter(p => p.invoiceId === invoiceId);
    }
    if (customerId) {
      list = list.filter(p => p.customerId === customerId);
    }
    return list.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  },

  createPayment(payload: Omit<PaymentTransaction, 'id' | 'createdAt'>, actor = 'Front Desk'): PaymentTransaction {
    const data = getDb();
    const newPayment: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString()
    };

    data.payments.unshift(newPayment);

    // Update invoice ledger
    const invoice = data.invoices.find(i => i.id === payload.invoiceId || i.invoiceNumber === payload.invoiceNumber);
    if (invoice) {
      const allPaymentsForInvoice = data.payments.filter(p => p.invoiceId === invoice.id || p.invoiceNumber === invoice.invoiceNumber);
      const totalPaid = allPaymentsForInvoice.reduce((acc, p) => acc + p.amountReceived, 0);
      invoice.paidAmount = totalPaid;
      invoice.outstandingBalance = Math.max(0, invoice.finalBilledAmount - totalPaid);

      if (invoice.outstandingBalance <= 0) {
        invoice.status = 'paid';
      } else {
        invoice.status = 'partially_paid';
      }
    }

    // Update customer spend
    const cust = data.customers.find(c => c.id === payload.customerId);
    if (cust) {
      cust.totalSpendInr = (cust.totalSpendInr || 0) + payload.amountReceived;
      cust.updatedAt = new Date().toISOString();
    }

    this.createAuditLog({
      actorId: 'system',
      actorName: actor,
      actorRole: 'front_desk',
      action: 'RECORD_PAYMENT',
      recordType: 'payment',
      recordId: newPayment.id,
      details: `Received ₹${payload.amountReceived} from ${payload.customerName} via ${payload.paymentMethod} for invoice ${payload.invoiceNumber}`
    });

    saveDb(data);
    return newPayment;
  },

  // Payment Postponement & Follow-ups
  getPaymentFollowUps(status?: string): PaymentFollowUp[] {
    const data = getDb();
    let list = [...data.paymentFollowUps];
    if (status) {
      list = list.filter(pf => pf.status === status);
    }
    return list.sort((a, b) => a.expectedPaymentDate.localeCompare(b.expectedPaymentDate));
  },

  createPaymentPostponement(payload: Omit<PaymentFollowUp, 'id' | 'createdAt'>, actor = 'Front Desk'): PaymentFollowUp {
    const data = getDb();
    const newPostponement: PaymentFollowUp = {
      id: `pf-${Date.now()}`,
      ...payload,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    data.paymentFollowUps.unshift(newPostponement);

    const invoice = data.invoices.find(i => i.id === payload.invoiceId || i.invoiceNumber === payload.invoiceNumber);
    if (invoice) {
      invoice.status = 'payment_postponed';
    }

    this.createAuditLog({
      actorId: 'system',
      actorName: actor,
      actorRole: 'front_desk',
      action: 'POSTPONE_PAYMENT',
      recordType: 'invoice',
      recordId: payload.invoiceId,
      details: `Postponed balance of ₹${payload.remainingBalance} for ${payload.customerName} until ${payload.expectedPaymentDate}. Reason: ${payload.postponementReason}`
    });

    saveDb(data);
    return newPostponement;
  },

  // Audit Logs
  getAuditLogs(recordType?: string, recordId?: string): AuditLog[] {
    const data = getDb();
    let list = [...data.auditLogs];
    if (recordType) list = list.filter(l => l.recordType === recordType);
    if (recordId) list = list.filter(l => l.recordId === recordId);
    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  createAuditLog(payload: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const data = getDb();
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...payload,
      timestamp: new Date().toISOString()
    };
    if (!data.auditLogs) data.auditLogs = [];
    data.auditLogs.unshift(log);
    // Keep max 500 audit logs
    if (data.auditLogs.length > 500) data.auditLogs.pop();
    return log;
  },

  // Analytics & KPIs
  getAnalyticsSummary(period: DateFilterPeriod = 'this_month'): AnalyticsSummary {
    const data = getDb();
    const referenceDate = new Date('2026-10-02T12:00:00Z');
    let startDate: Date;
    let endDate: Date = new Date(referenceDate);

    if (period === 'today') {
      startDate = new Date(referenceDate);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'yesterday') {
      startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'this_week') {
      startDate = new Date(referenceDate);
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - (day === 0 ? 6 : day - 1));
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'last_7_days') {
      startDate = new Date(referenceDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'this_month') {
      startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    } else if (period === 'last_month') {
      startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
      endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0, 23, 59, 59);
    } else if (period === 'this_year') {
      startDate = new Date(referenceDate.getFullYear(), 0, 1);
    } else {
      startDate = new Date(referenceDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const filtered = data.appointments.filter(a => a.appointmentDate >= startStr && a.appointmentDate <= endStr);

    let totalRevenue = 0;
    let completedBookings = 0;
    let pendingBookings = 0;
    let confirmedBookings = 0;
    let cancelledBookings = 0;
    let paidPayments = 0;
    let pendingPayments = 0;

    filtered.forEach(a => {
      if (a.status === 'completed' || a.paymentStatus === 'paid') {
        totalRevenue += a.amountInr;
      }
      if (a.status === 'completed') completedBookings++;
      if (a.status === 'pending') pendingBookings++;
      if (a.status === 'confirmed') confirmedBookings++;
      if (a.status === 'cancelled') cancelledBookings++;

      if (a.paymentStatus === 'paid') paidPayments++;
      if (a.paymentStatus === 'pending') pendingPayments++;
    });

    const totalBookings = filtered.length;
    const averageBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

    // Operational counts
    const todayStr = '2026-10-02';
    const totalProspects = data.customers.length;
    const todayAppointmentsCount = data.appointments.filter(a => a.appointmentDate === todayStr && a.status !== 'cancelled').length;
    const todayFollowUpsCount = data.followUps.filter(f => f.dueDate === todayStr).length;
    const overdueFollowUpsCount = data.followUps.filter(f => f.status === 'pending' && f.dueDate < todayStr).length;
    const consultationsCompletedCount = data.consultations.length;
    const sessionsCompletedCount = data.sessions.filter(s => s.status === 'completed').length;
    const outstandingPaymentsAmount = data.invoices.reduce((sum, inv) => sum + (inv.outstandingBalance || 0), 0);

    // Distribution by Status
    const statusMap = new Map<string, number>();
    filtered.forEach(a => {
      statusMap.set(a.status, (statusMap.get(a.status) || 0) + 1);
    });
    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    // Lead Sources
    const sourceMap = new Map<string, number>();
    data.customers.forEach(c => {
      sourceMap.set(c.leadSource, (sourceMap.get(c.leadSource) || 0) + 1);
    });
    const leadSourceDistribution = Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count }));

    // Funnel Stages
    const funnelStages = [
      { stage: 'New Prospect', count: data.customers.length, percentage: 100 },
      { stage: 'Contacted', count: data.customers.filter(c => c.lifecycleStatus !== 'new_prospect').length, percentage: 85 },
      { stage: 'Follow-up Required', count: data.followUps.length, percentage: 65 },
      { stage: 'Appointment Confirmed', count: data.appointments.length, percentage: 48 },
      { stage: 'Consultation Completed', count: data.consultations.length, percentage: 32 },
      { stage: 'Package Purchased', count: data.packages.length, percentage: 22 }
    ];

    // Revenue by Period Trend
    const periodMap = new Map<string, { revenue: number; bookings: number }>();
    filtered.forEach(a => {
      const key = a.appointmentDate;
      const cur = periodMap.get(key) || { revenue: 0, bookings: 0 };
      if (a.status === 'completed' || a.paymentStatus === 'paid') cur.revenue += a.amountInr;
      cur.bookings++;
      periodMap.set(key, cur);
    });

    const revenueByPeriod = Array.from(periodMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-10)
      .map(([date, val]) => ({
        date,
        label: date.slice(5),
        revenue: val.revenue,
        bookings: val.bookings
      }));

    // Revenue by Category
    const catMap = new Map<string, { revenue: number; bookings: number }>();
    filtered.forEach(a => {
      const cat = a.categoryName || 'General';
      const cur = catMap.get(cat) || { revenue: 0, bookings: 0 };
      if (a.status === 'completed' || a.paymentStatus === 'paid') cur.revenue += a.amountInr;
      cur.bookings++;
      catMap.set(cat, cur);
    });
    const revenueByCategory = Array.from(catMap.entries()).map(([category, val]) => ({
      category,
      revenue: val.revenue,
      bookings: val.bookings
    }));

    // Top services
    const srvMap = new Map<string, { category: string; bookings: number; revenue: number }>();
    filtered.forEach(a => {
      const cur = srvMap.get(a.serviceName) || { category: a.categoryName || 'General', bookings: 0, revenue: 0 };
      cur.bookings++;
      if (a.status === 'completed' || a.paymentStatus === 'paid') cur.revenue += a.amountInr;
      srvMap.set(a.serviceName, cur);
    });
    const topServices = Array.from(srvMap.entries())
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    // Top staff
    const stfMap = new Map<string, { name: string; roleTitle: string; bookings: number; revenue: number }>();
    filtered.forEach(a => {
      const sId = a.assignedStaffId || a.staffId || 'unknown';
      const sName = a.assignedStaffName || a.staffName || 'Specialist';
      const cur = stfMap.get(sId) || { name: sName, roleTitle: 'Specialist', bookings: 0, revenue: 0 };
      cur.bookings++;
      if (a.status === 'completed' || a.paymentStatus === 'paid') cur.revenue += a.amountInr;
      stfMap.set(sId, cur);
    });
    const topStaff = Array.from(stfMap.entries())
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalBookings,
      completedBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      averageBookingValue,
      totalCustomers: data.customers.length,
      activeStaffCount: data.staff.filter(s => s.isActive).length,
      pendingPayments,
      paidPayments,
      totalProspects,
      todayAppointmentsCount,
      todayFollowUpsCount,
      overdueFollowUpsCount,
      consultationsCompletedCount,
      sessionsCompletedCount,
      outstandingPaymentsAmount,
      revenueByPeriod,
      revenueByCategory,
      statusDistribution,
      leadSourceDistribution,
      funnelStages,
      topServices,
      topStaff,
      comparison: {
        revenueChangePct: 14.5,
        bookingsChangePct: 10.2,
        completedChangePct: 8.5,
        customerChangePct: 12.0
      }
    };
  },

  // Staff Dashboard Data
  getStaffDashboardData(staffId: string): StaffDashboardData | null {
    const data = getDb();
    const staff = data.staff.find(s => s.id === staffId);
    if (!staff) return null;

    const todayStr = '2026-10-02';
    const staffApts = data.appointments.filter(a => a.staffId === staffId || a.assignedStaffId === staffId);
    const todaySchedule = staffApts.filter(a => a.appointmentDate === todayStr && a.status !== 'cancelled');
    const assignedConsultations = data.consultations.filter(c => c.primaryStaffId === staffId || c.secondaryStaffId === staffId);
    const assignedSessions = data.sessions.filter(s => s.primaryStaffId === staffId || s.secondaryStaffId === staffId);

    const completed = staffApts.filter(a => a.status === 'completed');
    const upcoming = staffApts.filter(a => a.appointmentDate >= todayStr && a.status !== 'cancelled');
    const personalRevenue = completed.reduce((sum, a) => sum + a.amountInr, 0);

    return {
      staff,
      metrics: {
        todayCount: todaySchedule.length,
        upcomingCount: upcoming.length,
        completedCount: completed.length,
        pendingCount: staffApts.filter(a => a.status === 'pending').length,
        cancelledCount: staffApts.filter(a => a.status === 'cancelled').length,
        personalRevenue,
        assignedConsultationsCount: assignedConsultations.length,
        assignedSessionsCount: assignedSessions.length
      },
      todaySchedule,
      nextUpcoming: upcoming[0] || null,
      recentCompleted: completed.slice(0, 5),
      assignedConsultations,
      assignedSessions,
      statusDistribution: [
        { status: 'confirmed', count: staffApts.filter(a => a.status === 'confirmed').length },
        { status: 'completed', count: completed.length },
        { status: 'pending', count: staffApts.filter(a => a.status === 'pending').length },
      ],
      upcomingDays: [
        { date: '2026-10-02', dayLabel: 'Today', count: todaySchedule.length },
        { date: '2026-10-03', dayLabel: 'Tomorrow', count: staffApts.filter(a => a.appointmentDate === '2026-10-03').length },
        { date: '2026-10-04', dayLabel: 'Sun', count: 1 },
      ],
      notifications: data.notifications || []
    };
  },

  // Services & Categories
  getCategories(): ServiceCategory[] {
    return getDb().categories;
  },
  getServices(onlyActive = true): Service[] {
    const list = getDb().services;
    return onlyActive ? list.filter(s => s.isActive) : list;
  },
  getServiceById(id: string): Service | null {
    return getDb().services.find(s => s.id === id || s.slug === id) || null;
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
  getStaff(onlyActive = true): Staff[] {
    const list = getDb().staff;
    return onlyActive ? list.filter(s => s.isActive) : list;
  },
  getStaffById(id: string): Staff | null {
    return getDb().staff.find(s => s.id === id) || null;
  },
  createStaff(staffMember: Staff) {
    const data = getDb();
    data.staff.push(staffMember);
    saveDb(data);
    return staffMember;
  },
  updateStaff(id: string, updates: Partial<Staff>) {
    const data = getDb();
    const idx = data.staff.findIndex(s => s.id === id);
    if (idx !== -1) {
      data.staff[idx] = { ...data.staff[idx], ...updates };
      saveDb(data);
      return data.staff[idx];
    }
    return null;
  },

  // Notifications
  getNotifications(): SystemNotification[] {
    return getDb().notifications || [];
  },

  // Inquiries
  getInquiries(): ContactInquiry[] {
    return [...getDb().inquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  createInquiry(inq: ContactInquiry) {
    const data = getDb();
    data.inquiries.unshift(inq);
    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Client Inquiry',
      message: `${inq.name} sent: ${inq.subject}`,
      time: 'Just now',
      read: false,
      type: 'system',
      link: '/admin/inquiries'
    });
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
  getReviews(onlyApproved = true): Review[] {
    const revs = getDb().reviews;
    return onlyApproved ? revs.filter(r => r.isApproved) : revs;
  },
  createReview(review: Review): Review {
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
  getSettings(): BusinessSettings {
    return getDb().settings;
  },
  updateSettings(settings: Partial<BusinessSettings>): BusinessSettings {
    const data = getDb();
    data.settings = { ...data.settings, ...settings };
    saveDb(data);
    return data.settings;
  }
};
