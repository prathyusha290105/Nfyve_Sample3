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
  SystemNotification
} from '../types';

const TOKEN_KEY = 'nfyve_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

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

  const data = await res.json().catch(() => ({}));

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

  updateProfile: (payload: { name: string; phone: string }) =>
    request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Notifications
  getNotifications: () => request<SystemNotification[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  // Public
  getCategories: () => request<ServiceCategory[]>('/categories'),
  getServices: () => request<Service[]>('/services'),
  getServiceBySlug: (slug: string) => request<Service>(`/services/${slug}`),
  getStaff: () => request<Staff[]>('/staff'),
  getReviews: () => request<Review[]>('/reviews'),
  getSettings: () => request<BusinessSettings>('/settings'),
  submitInquiry: (payload: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    request<{ message: string; inquiry: ContactInquiry }>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  submitReview: (payload: { serviceCategory: string; serviceName: string; rating: number; reviewText: string }) =>
    request<{ message: string; review: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  sendChatMessage: (message: string) =>
    request<{ reply: string; quickActions?: { label: string; action: string; url?: string }[] }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Appointments
  getAvailableSlots: (date: string, serviceId: string, staffId?: string) => {
    const params = new URLSearchParams({ date, serviceId });
    if (staffId) params.append('staffId', staffId);
    return request<{ slot: string; isAvailable: boolean }[]>(`/appointments/available-slots?${params.toString()}`);
  },

  createAppointment: (payload: {
    serviceId: string;
    staffId?: string;
    appointmentDate: string;
    timeSlot: string;
    notes?: string;
  }) =>
    request<{ message: string; appointment: Appointment }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyAppointments: () => request<Appointment[]>('/appointments/my'),

  cancelAppointment: (id: string) =>
    request<{ message: string; appointment: Appointment }>(`/appointments/${id}/cancel`, {
      method: 'PATCH',
    }),

  // ================= STAFF PERSONALIZED APIS =================
  getStaffMe: () => request<{ staff: Staff; user: User }>('/staff/me'),

  getStaffDashboard: (period: DateFilterPeriod = 'this_month', startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<StaffDashboardData>(`/staff/dashboard?${params.toString()}`);
  },

  getStaffAppointments: (filters?: {
    dateFilter?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.dateFilter) params.append('dateFilter', filters.dateFilter);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    return request<Appointment[]>(`/staff/appointments?${params.toString()}`);
  },

  completeStaffAppointment: (id: string) =>
    request<{ message: string; appointment: Appointment }>(`/staff/appointments/${id}/complete`, {
      method: 'PATCH',
    }),

  updateStaffAppointmentNotes: (id: string, notes: string) =>
    request<{ message: string; appointment: Appointment }>(`/staff/appointments/${id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),

  getStaffPerformance: (period: DateFilterPeriod = 'this_month', startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<StaffPerformanceData>(`/staff/performance?${params.toString()}`);
  },

  updateStaffProfile: (payload: { name?: string; phone?: string; bio?: string; currentPassword?: string; newPassword?: string }) =>
    request<{ message: string; staff: Staff }>('/staff/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // ================= ADMIN APIS =================
  getAdminMetrics: (period: DateFilterPeriod, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<AnalyticsSummary>(`/admin/metrics?${params.toString()}`);
  },

  getAdminAnalytics: (period: DateFilterPeriod, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request<AnalyticsSummary>(`/admin/analytics?${params.toString()}`);
  },

  getAdminAppointments: (filters?: {
    status?: string;
    categoryId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    staffId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.staffId) params.append('staffId', filters.staffId);
    return request<Appointment[]>(`/admin/appointments?${params.toString()}`);
  },

  updateAppointmentStatus: (id: string, payload: { status?: string; paymentStatus?: string; staffId?: string; notes?: string }) =>
    request<{ message: string; appointment: Appointment }>(`/admin/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  reassignAppointment: (id: string, staffId: string) =>
    request<{ message: string; appointment: Appointment }>(`/admin/appointments/${id}/reassign`, {
      method: 'PATCH',
      body: JSON.stringify({ staffId }),
    }),

  rescheduleAppointment: (id: string, appointmentDate: string, timeSlot: string) =>
    request<{ message: string; appointment: Appointment }>(`/admin/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ appointmentDate, timeSlot }),
    }),

  createWalkInBooking: (payload: any) =>
    request<{ message: string; appointment: Appointment }>('/admin/appointments/walkin', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAdminCustomers: () => request<any[]>('/admin/customers'),
  getAdminCustomerDetails: (id: string) => request<{ customer: User; appointments: Appointment[] }>(`/admin/customers/${id}`),

  getAdminStaff: () => request<(Staff & { totalAssigned: number; completedCount: number; totalRevenueGenerated: number })[]>('/admin/staff'),
  createAdminStaff: (payload: { name: string; email: string; phone: string; roleTitle: string; specialties: string[]; bio: string; password?: string }) =>
    request<{ message: string; staff: Staff }>('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateAdminStaff: (id: string, payload: Partial<Staff>) =>
    request<{ message: string; staff: Staff }>(`/admin/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  toggleAdminStaffStatus: (id: string) =>
    request<{ message: string; staff: Staff }>(`/admin/staff/${id}/toggle`, {
      method: 'PATCH',
    }),
  resetAdminStaffPassword: (id: string, newPassword: string) =>
    request<{ message: string }>(`/admin/staff/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),

  createService: (payload: any) =>
    request<{ message: string; service: Service }>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateService: (id: string, payload: any) =>
    request<{ message: string; service: Service }>(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteService: (id: string) =>
    request<{ message: string }>(`/admin/services/${id}`, {
      method: 'DELETE',
    }),

  getAdminInquiries: () => request<ContactInquiry[]>('/admin/inquiries'),
  updateInquiryStatus: (id: string, status: string) =>
    request<ContactInquiry>(`/admin/inquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getAdminReviews: () => request<Review[]>('/admin/reviews'),
  approveReview: (id: string, isApproved: boolean) =>
    request<Review>(`/admin/reviews/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved }),
    }),

  updateSettings: (payload: Partial<BusinessSettings>) =>
    request<{ message: string; settings: BusinessSettings }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};
