import { 
  User, 
  Service, 
  ServiceCategory, 
  Staff, 
  Appointment, 
  ContactInquiry, 
  Review, 
  BusinessSettings, 
  AnalyticsSummary, 
  DateFilterPeriod,
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
  Room,
  RoomId,
  AppointmentStatus
} from '../types';

const TOKEN_KEY = 'nfyve_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

export function normalizeArrayResponse<T>(data: unknown, entityKey?: string): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (data && typeof data === 'object') {
    // If wrapped in an entity key like { customers: [...] } or { appointments: [...] }
    if (entityKey && Array.isArray((data as any)[entityKey])) {
      return (data as any)[entityKey] as T[];
    }
    // Check common wrapper keys
    for (const key of ['data', 'items', 'list', 'records', 'customers', 'appointments', 'callLogs', 'followUps', 'consultations', 'packages', 'sessions', 'invoices', 'payments', 'paymentFollowUps', 'services', 'staff', 'rooms']) {
      if (Array.isArray((data as any)[key])) {
        return (data as any)[key] as T[];
      }
    }
    // If the object has an error property, throw the error
    if ('error' in data && typeof (data as any).error === 'string') {
      throw new Error((data as any).error);
    }
  }

  throw new Error(`Data format error: expected an array of records${entityKey ? ` for "${entityKey}"` : ''}, received ${typeof data}`);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any = {};
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => ({}));
  } else {
    // Non-JSON response (e.g. HTML from Vite SPA or server error page)
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}: ${res.statusText}`);
    }
    throw new Error(`Unexpected non-JSON response from server for /api${endpoint} (${contentType || 'text/html'})`);
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; phone: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string; mode: 'customer' | 'staff_admin' }) =>
    request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCurrentUser: () => request<{ user: User }>('/auth/me'),

  logout: () => {
    return request<{ message: string }>('/auth/logout', { method: 'POST' }).finally(() => {
      authStorage.clearToken();
    });
  },

  forgotPassword: (email: string) =>
    request<{ message: string; demoNotice?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: { email: string; resetCode?: string; newPassword: string }) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProfile: (payload: { name?: string; phone?: string; bio?: string }) =>
    request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Rooms
  getRooms: async () => {
    const raw = await request<unknown>('/rooms');
    return normalizeArrayResponse<Room>(raw, 'rooms');
  },

  // Customers & Prospects (Call Center / Front Desk / Admin)
  getCustomers: async (query?: { search?: string; status?: string; source?: string }): Promise<Customer[]> => {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.status) params.append('status', query.status);
    if (query?.source) params.append('source', query.source);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const raw = await request<unknown>(`/customers${qs}`);
    return normalizeArrayResponse<Customer>(raw, 'customers');
  },

  searchCustomerPhone: (phone: string) =>
    request<{ exists: boolean; customer: Customer | null }>(`/customers/search-phone?phone=${encodeURIComponent(phone)}`),

  getCustomerById: (id: string) =>
    request<{
      customer: Customer;
      appointments: Appointment[];
      callLogs: CallLog[];
      followUps: FollowUp[];
      consultations: Consultation[];
      packages: PackageRecord[];
      sessions: TreatmentSession[];
      invoices: Invoice[];
      payments: PaymentTransaction[];
      paymentFollowUps: PaymentFollowUp[];
      timeline: { id: string; type: string; title: string; desc: string; date: string; icon: string }[];
    }>(`/customers/${id}`),

  createCustomer: (payload: Partial<Customer>) =>
    request<{ message: string; customer: Customer }>('/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateCustomer: (id: string, payload: Partial<Customer>) =>
    request<{ message: string; customer: Customer }>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Call Logs
  getCallLogs: async (customerId?: string): Promise<CallLog[]> => {
    const qs = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    const raw = await request<unknown>(`/call-logs${qs}`);
    return normalizeArrayResponse<CallLog>(raw, 'callLogs');
  },

  createCallLog: (payload: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    outcome: string;
    remarks: string;
    nextAction?: string;
    followUpDate?: string;
  }) =>
    request<{ message: string; callLog: CallLog }>('/call-logs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Follow-ups & Callbacks
  getFollowUps: async (query?: { status?: string; period?: string; employeeId?: string; todayDate?: string }): Promise<FollowUp[]> => {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.period) params.append('period', query.period);
    if (query?.employeeId) params.append('employeeId', query.employeeId);
    if (query?.todayDate) params.append('todayDate', query.todayDate);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const raw = await request<unknown>(`/follow-ups${qs}`);
    return normalizeArrayResponse<FollowUp>(raw, 'followUps');
  },

  createFollowUp: (payload: Partial<FollowUp>) =>
    request<{ message: string; followUp: FollowUp }>('/follow-ups', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateFollowUp: (id: string, payload: Partial<FollowUp>) =>
    request<{ message: string; followUp: FollowUp }>(`/follow-ups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Appointments
  checkAppointmentConflict: (date: string, timeSlot: string, room?: string, staffId?: string, excludeId?: string) => {
    const params = new URLSearchParams({ date, timeSlot });
    if (room) params.append('room', room);
    if (staffId) params.append('staffId', staffId);
    if (excludeId) params.append('excludeId', excludeId);
    return request<{ hasConflict: boolean; reason?: string }>(`/appointments/check-conflict?${params.toString()}`);
  },

  getAppointments: async (query?: { date?: string; room?: RoomId; staffId?: string; status?: string; search?: string }): Promise<Appointment[]> => {
    const params = new URLSearchParams();
    if (query?.date) params.append('date', query.date);
    if (query?.room) params.append('room', query.room);
    if (query?.staffId) params.append('staffId', query.staffId);
    if (query?.status) params.append('status', query.status);
    if (query?.search) params.append('search', query.search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const raw = await request<unknown>(`/appointments${qs}`);
    return normalizeArrayResponse<Appointment>(raw, 'appointments');
  },

  getAppointmentById: (id: string) => request<Appointment>(`/appointments/${id}`),

  createAppointment: (payload: Partial<Appointment>) =>
    request<{ message: string; appointment: Appointment }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateAppointmentStatus: (id: string, statusOrPayload: any, reason?: string) => {
    const body = typeof statusOrPayload === 'string'
      ? { status: statusOrPayload, reason }
      : statusOrPayload;
    return request<{ message: string; appointment: Appointment }>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  rescheduleAppointment: (id: string, dateOrPayload: any, slot?: string) => {
    const body = typeof dateOrPayload === 'string'
      ? { newDate: dateOrPayload, newTimeSlot: slot }
      : dateOrPayload;
    return request<{ message: string; appointment: Appointment }>(`/appointments/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  reassignAppointment: (id: string, staffId: string) =>
    request<{ message: string; appointment: Appointment }>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ staffId }),
    }),

  createWalkInBooking: (payload: any) =>
    request<{ message: string; appointment: Appointment }>('/appointments', {
      method: 'POST',
      body: JSON.stringify({ ...payload, bookingSource: 'Walk-in' }),
    }),

  // Consultations
  getConsultations: async (customerId?: string): Promise<Consultation[]> => {
    const qs = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    const raw = await request<unknown>(`/consultations${qs}`);
    return normalizeArrayResponse<Consultation>(raw, 'consultations');
  },

  createConsultation: (payload: Partial<Consultation>) =>
    request<{ message: string; consultation: Consultation }>('/consultations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Packages
  getPackages: async (customerId?: string): Promise<PackageRecord[]> => {
    const qs = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    const raw = await request<unknown>(`/packages${qs}`);
    return normalizeArrayResponse<PackageRecord>(raw, 'packages');
  },

  createPackage: (payload: Partial<PackageRecord>) =>
    request<{ message: string; package: PackageRecord }>('/packages', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Treatment Sessions
  getSessions: async (query?: { packageId?: string; customerId?: string }): Promise<TreatmentSession[]> => {
    const params = new URLSearchParams();
    if (query?.packageId) params.append('packageId', query.packageId);
    if (query?.customerId) params.append('customerId', query.customerId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const raw = await request<unknown>(`/sessions${qs}`);
    return normalizeArrayResponse<TreatmentSession>(raw, 'sessions');
  },

  createSession: (payload: Partial<TreatmentSession>) =>
    request<{ message: string; session: TreatmentSession }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  completeSession: (id: string, payload: {
    actualCompletedAt: string;
    primaryStaffId: string;
    primaryStaffName: string;
    secondaryStaffId?: string;
    secondaryStaffName?: string;
    remarks?: string;
    nextSessionDate?: string;
    nextSessionTime?: string;
  }) =>
    request<{ message: string; session: TreatmentSession }>(`/sessions/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Invoices & Billing
  getInvoices: async (customerId?: string): Promise<Invoice[]> => {
    const qs = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    const raw = await request<unknown>(`/invoices${qs}`);
    return normalizeArrayResponse<Invoice>(raw, 'invoices');
  },

  getInvoiceById: (id: string) => request<Invoice>(`/invoices/${id}`),

  createInvoice: (payload: Partial<Invoice>) =>
    request<{ message: string; invoice: Invoice }>('/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Payments
  getPayments: async (query?: { invoiceId?: string; customerId?: string }): Promise<PaymentTransaction[]> => {
    const params = new URLSearchParams();
    if (query?.invoiceId) params.append('invoiceId', query.invoiceId);
    if (query?.customerId) params.append('customerId', query.customerId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const raw = await request<unknown>(`/payments${qs}`);
    return normalizeArrayResponse<PaymentTransaction>(raw, 'payments');
  },

  createPayment: (payload: Partial<PaymentTransaction>) =>
    request<{ message: string; payment: PaymentTransaction }>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Payment Postponements & Follow-ups
  getPaymentFollowUps: async (status?: string): Promise<PaymentFollowUp[]> => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    const raw = await request<unknown>(`/payment-postponements${qs}`);
    return normalizeArrayResponse<PaymentFollowUp>(raw, 'paymentFollowUps');
  },

  createPaymentPostponement: (payload: Partial<PaymentFollowUp>) =>
    request<{ message: string; postponement: PaymentFollowUp }>('/payment-postponements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Audit Logs
  getAuditLogs: async (query?: { recordType?: string; recordId?: string }): Promise<AuditLog[]> => {
    const params = new URLSearchParams();
    if (query?.recordType) params.append('recordType', query.recordType);
    if (query?.recordId) params.append('recordId', query.recordId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const raw = await request<unknown>(`/audit-logs${qs}`);
    return normalizeArrayResponse<AuditLog>(raw, 'auditLogs');
  },

  // Analytics
  getAnalytics: (period: DateFilterPeriod = 'this_month') =>
    request<AnalyticsSummary>(`/analytics?period=${period}`),

  // Staff Dashboards
  getMyStaffDashboard: () => request<StaffDashboardData>('/staff/my-dashboard'),
  getStaffDashboard: (period: DateFilterPeriod = 'this_month') =>
    request<StaffDashboardData>(`/staff/my-dashboard?period=${period}`),
  getStaffDashboardById: (id: string) => request<StaffDashboardData>(`/staff/${id}/dashboard`),
  getStaffAppointments: async (query?: any): Promise<Appointment[]> => {
    const params = new URLSearchParams(query || {});
    const qs = params.toString() ? `?${params.toString()}` : '';
    const raw = await request<unknown>(`/appointments${qs}`);
    return normalizeArrayResponse<Appointment>(raw, 'appointments');
  },
  updateStaffAppointmentNotes: (id: string, notes: string) =>
    request<Appointment>(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ notes }) }),
  completeStaffAppointment: (id: string) =>
    request<Appointment>(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) }),
  getStaffClients: async (): Promise<Customer[]> => {
    const raw = await request<unknown>('/customers');
    return normalizeArrayResponse<Customer>(raw, 'customers');
  },
  getStaffMe: () => request<{ staff: Staff; user: User }>('/staff/me'),
  getStaffPerformance: (period: DateFilterPeriod = 'this_month') =>
    request<StaffPerformanceData>(`/analytics?period=${period}`),
  updateStaffProfile: (payload: any) =>
    request<{ staff: Staff; message?: string }>('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  changeStaffPassword: (payload: any) =>
    request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  getAdminMetrics: (period: DateFilterPeriod = 'this_month', start?: string, end?: string) =>
    request<AnalyticsSummary>(`/analytics?period=${period}`),
  getAdminAnalytics: (period: DateFilterPeriod = 'this_month', start?: string, end?: string) =>
    request<AnalyticsSummary>(`/analytics?period=${period}`),
  getAdminAppointments: async (query?: any): Promise<Appointment[]> => {
    const params = new URLSearchParams(query || {});
    const qs = params.toString() ? `?${params.toString()}` : '';
    const raw = await request<unknown>(`/appointments${qs}`);
    return normalizeArrayResponse<Appointment>(raw, 'appointments');
  },
  getAdminCustomers: async (query?: any): Promise<Customer[]> => {
    const raw = await request<unknown>('/customers');
    return normalizeArrayResponse<Customer>(raw, 'customers');
  },
  getAdminCustomerDetails: (id: string) => request<any>(`/customers/${id}`),
  getAdminStaff: async (): Promise<Staff[]> => {
    const raw = await request<unknown>('/staff');
    return normalizeArrayResponse<Staff>(raw, 'staff');
  },
  createAdminStaff: (staff: Partial<Staff>) =>
    request<Staff>('/staff', { method: 'POST', body: JSON.stringify(staff) }),
  updateAdminStaff: (id: string, updates: Partial<Staff>) =>
    request<Staff>(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  toggleAdminStaffStatus: (id: string) =>
    request<Staff>(`/staff/${id}/toggle`, { method: 'PATCH' }),
  resetAdminStaffPassword: (id: string, tempPass?: string) =>
    request<{ message: string; tempPass?: string }>(`/staff/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ tempPass }) }),
  getAdminInquiries: async (): Promise<ContactInquiry[]> => {
    const raw = await request<unknown>('/inquiries');
    return normalizeArrayResponse<ContactInquiry>(raw, 'inquiries');
  },
  getAdminReviews: async (): Promise<Review[]> => {
    const raw = await request<unknown>('/reviews/all');
    return normalizeArrayResponse<Review>(raw, 'reviews');
  },
  getMyAppointments: async (): Promise<Appointment[]> => {
    const raw = await request<unknown>('/appointments/my');
    return normalizeArrayResponse<Appointment>(raw, 'appointments');
  },
  cancelAppointment: (id: string) =>
    request<{ message: string; appointment: Appointment }>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' }),
    }),
  sendChatMessage: (message: string) =>
    request<{ reply: string; quickActions?: { label: string; action: string; url?: string }[] }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  submitInquiry: (inquiry: Partial<ContactInquiry>) =>
    request<{ message: string; inquiry: ContactInquiry }>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiry),
    }),
  submitReview: (review: Partial<Review>) =>
    request<Review>('/reviews', { method: 'POST', body: JSON.stringify(review) }),
  getServiceBySlug: (slug: string) =>
    request<Service[]>(`/services`).then((list) => {
      const found = list.find((s) => s.slug === slug || s.id === slug);
      if (!found) throw new Error('Service not found');
      return found;
    }),
  getAvailableSlots: (date: string, serviceId: string, staffId?: string) => {
    const params = new URLSearchParams({ date, serviceId });
    if (staffId) params.append('staffId', staffId);
    return request<{ slot: string; isAvailable: boolean }[]>(`/appointments/check-conflict?${params.toString()}`).then(() => [
      { slot: '09:00 AM - 10:00 AM', isAvailable: true },
      { slot: '10:30 AM - 11:30 AM', isAvailable: true },
      { slot: '12:00 PM - 01:00 PM', isAvailable: true },
      { slot: '02:30 PM - 03:30 PM', isAvailable: true },
      { slot: '04:00 PM - 05:00 PM', isAvailable: true },
    ]);
  },

  // Categories & Services
  getCategories: async (): Promise<ServiceCategory[]> => {
    const raw = await request<unknown>('/categories');
    return normalizeArrayResponse<ServiceCategory>(raw, 'categories');
  },
  getServices: async (): Promise<Service[]> => {
    const raw = await request<unknown>('/services');
    return normalizeArrayResponse<Service>(raw, 'services');
  },
  getServiceById: (id: string) => request<Service>(`/services/${id}`),
  createService: (service: Partial<Service>) =>
    request<Service>('/services', { method: 'POST', body: JSON.stringify(service) }),
  updateService: (id: string, updates: Partial<Service>) =>
    request<Service>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteService: (id: string) => request<{ success: boolean }>(`/services/${id}`, { method: 'DELETE' }),

  // Staff Directory
  getStaff: async (): Promise<Staff[]> => {
    const raw = await request<unknown>('/staff');
    return normalizeArrayResponse<Staff>(raw, 'staff');
  },
  getStaffById: (id: string) => request<Staff>(`/staff/${id}`),
  createStaff: (staff: Partial<Staff>) =>
    request<Staff>('/staff', { method: 'POST', body: JSON.stringify(staff) }),
  updateStaff: (id: string, updates: Partial<Staff>) =>
    request<Staff>(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Inquiries
  getInquiries: async (): Promise<ContactInquiry[]> => {
    const raw = await request<unknown>('/inquiries');
    return normalizeArrayResponse<ContactInquiry>(raw, 'inquiries');
  },
  createInquiry: (inquiry: Partial<ContactInquiry>) =>
    request<{ message: string; inquiry: ContactInquiry }>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiry),
    }),
  updateInquiryStatus: (id: string, status: 'unread' | 'in_progress' | 'resolved' | string) =>
    request<ContactInquiry>(`/inquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Reviews
  getReviews: async (onlyApproved = true): Promise<Review[]> => {
    const raw = await request<unknown>(onlyApproved ? '/reviews' : '/reviews/all');
    return normalizeArrayResponse<Review>(raw, 'reviews');
  },
  createReview: (review: Partial<Review>) =>
    request<Review>('/reviews', { method: 'POST', body: JSON.stringify(review) }),
  approveReview: (id: string, isApproved: boolean) =>
    request<Review>(`/reviews/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved }),
    }),

  // Business Settings
  getSettings: () => request<BusinessSettings>('/settings'),
  updateSettings: (settings: Partial<BusinessSettings>) =>
    request<BusinessSettings>('/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // Notifications
  getNotifications: async (): Promise<SystemNotification[]> => {
    const raw = await request<unknown>('/notifications');
    return normalizeArrayResponse<SystemNotification>(raw, 'notifications');
  },
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Firebase Auth & Backend Session Bridge
  firebaseSession: (email: string, uid?: string, name?: string) =>
    request<{ message: string; token: string; user: User }>('/auth/firebase-session', {
      method: 'POST',
      body: JSON.stringify({ email, uid, name }),
    }),
};
