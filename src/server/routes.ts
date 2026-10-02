import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { User, Appointment, Review, ContactInquiry, Service, DateFilterPeriod } from '../types';

export const apiRouter = Router();

// In-memory token storage (Simple & robust for sessions)
const SESSIONS: Map<string, { userId: string; role: string; expiresAt: number }> = new Map();

function generateToken(userId: string, role: string): string {
  const token = `nfyve_token_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
  SESSIONS.set(token, {
    userId,
    role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  return token;
}

// Middleware: Authenticate user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const session = SESSIONS.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) SESSIONS.delete(token);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  const user = db.getUserById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists.' });
  }

  req.user = user;
  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access forbidden: Insufficient permissions for this resource.' });
      }
      next();
    });
  };
}

// ================= AUTHENTICATION ROUTES =================

// Register (Customer only)
apiRouter.post('/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser: User & { passwordHash: string } = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '+91 9000000000',
    role: 'customer',
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  db.createUser(newUser);

  const token = generateToken(newUser.id, newUser.role);
  const { passwordHash: _, ...safeUser } = newUser;

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: safeUser,
  });
});

// Login (Supports customer mode and staff_admin mode)
apiRouter.post('/auth/login', (req, res) => {
  const { email, password, mode } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Enforce mode separation as requested in prompt:
  if (mode === 'staff_admin' && user.role === 'customer') {
    return res.status(403).json({
      error: 'This account does not have staff or administrative privileges. Please use the Customer Login.',
    });
  }

  if (mode === 'customer' && user.role !== 'customer') {
    return res.status(403).json({
      error: 'Staff and Administrator accounts must sign in using the Staff / Admin Login option.',
    });
  }

  // If staff member, link staffId if missing
  if (user.role === 'staff' && !user.staffId) {
    const staff = db.getStaffByEmail(user.email);
    if (staff) {
      user.staffId = staff.id;
    }
  }

  const token = generateToken(user.id, user.role);
  const { passwordHash: _, ...safeUser } = user;

  res.json({
    message: 'Login successful',
    token,
    user: safeUser,
  });
});

// Current User
apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const { passwordHash: _, ...safeUser } = req.user as any;
  res.json({ user: safeUser });
});

// Logout
apiRouter.post('/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    SESSIONS.delete(token);
  }
  res.json({ message: 'Logged out successfully' });
});

// Forgot Password
apiRouter.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.getUserByEmail(email || '');
  res.json({
    message: 'If an account with that email exists, password reset instructions have been dispatched.',
    demoNotice: user ? `In demonstration mode: You can log in using email: ${email} and password: Customer@123 or reset using code NFYVE-RESET-2026.` : undefined
  });
});

// Reset Password
apiRouter.post('/auth/reset-password', (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);
  db.updateUser(user.id, { passwordHash } as any);

  res.json({ message: 'Password has been reset successfully. Please log in with your new credentials.' });
});

// Update Profile
apiRouter.put('/auth/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const { name, phone } = req.body;
  const updated = db.updateUser(req.user!.id, {
    name: name?.trim() || req.user!.name,
    phone: phone?.trim() || req.user!.phone,
  });
  const { passwordHash: _, ...safeUser } = updated as any;
  res.json({ user: safeUser });
});

// Notifications
apiRouter.get('/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
  const allNotifs = db.getNotifications();
  if (req.user!.role === 'staff') {
    const staff = db.getStaffByUserId(req.user!.id);
    const staffName = staff?.name.toLowerCase() || '';
    const filtered = allNotifs.filter(n => 
      n.type === 'booking' || 
      n.message.toLowerCase().includes(staffName) ||
      n.title.toLowerCase().includes('schedule')
    );
    return res.json(filtered);
  }
  res.json(allNotifs);
});

apiRouter.patch('/notifications/:id/read', requireAuth, (req, res) => {
  const notifs = db.getNotifications();
  const n = notifs.find(item => item.id === req.params.id);
  if (n) {
    n.read = true;
  }
  res.json({ success: true });
});

// ================= PUBLIC DATA ROUTES =================

// Categories
apiRouter.get('/categories', (req, res) => {
  res.json(db.getCategories());
});

// Services
apiRouter.get('/services', (req, res) => {
  res.json(db.getServices(true));
});

apiRouter.get('/services/:slug', (req, res) => {
  const service = db.getServiceBySlug(req.params.slug);
  if (!service) {
    return res.status(404).json({ error: 'Service not found.' });
  }
  res.json(service);
});

// Staff
apiRouter.get('/staff', (req, res) => {
  res.json(db.getStaff(true));
});

// Reviews
apiRouter.get('/reviews', (req, res) => {
  res.json(db.getReviews(true));
});

// Submit Review (Authenticated Customer)
apiRouter.post('/reviews', requireAuth, (req: AuthenticatedRequest, res) => {
  const { serviceCategory, serviceName, rating, reviewText } = req.body;
  if (!rating || !reviewText) {
    return res.status(400).json({ error: 'Rating and review comment are required.' });
  }

  const review: Review = {
    id: `rev-${Date.now()}`,
    userId: req.user!.id,
    customerName: req.user!.name,
    serviceCategory: serviceCategory || 'Integrated Wellness',
    serviceName: serviceName || 'General Treatment',
    rating: Math.min(5, Math.max(1, Number(rating))),
    reviewText: reviewText.trim(),
    reviewDate: new Date().toISOString().split('T')[0],
    isApproved: true,
    isSample: false,
  };

  db.createReview(review);
  res.status(201).json({ message: 'Thank you for your review!', review });
});

// Settings
apiRouter.get('/settings', (req, res) => {
  res.json(db.getSettings());
});

// Contact Inquiries
apiRouter.post('/inquiries', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const inquiry: ContactInquiry = {
    id: `inq-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : '',
    subject: subject ? subject.trim() : 'General Inquiry',
    message: message.trim(),
    status: 'unread',
    createdAt: new Date().toISOString(),
  };

  db.createInquiry(inquiry);
  res.status(201).json({ message: 'Your inquiry has been submitted. Our concierge team will reach out shortly.', inquiry });
});

// ================= APPOINTMENTS (CUSTOMER / PUBLIC) =================

// Available Slots
apiRouter.get('/appointments/available-slots', (req, res) => {
  const { date, serviceId, staffId } = req.query;
  if (!date || !serviceId) {
    return res.status(400).json({ error: 'Date and serviceId query parameters are required.' });
  }

  const slots = db.getAvailableSlots(String(date), String(serviceId), staffId ? String(staffId) : undefined);
  res.json(slots);
});

// Create Appointment (Customer authenticated or Staff)
apiRouter.post('/appointments', requireAuth, (req: AuthenticatedRequest, res) => {
  const { serviceId, staffId, appointmentDate, timeSlot, notes } = req.body;

  if (!serviceId || !appointmentDate || !timeSlot) {
    return res.status(400).json({ error: 'Service, date, and time slot are required.' });
  }

  const service = db.getServiceById(serviceId);
  if (!service) {
    return res.status(404).json({ error: 'Specified service does not exist.' });
  }

  const staff = staffId ? db.getStaffById(staffId) : undefined;
  const bookingNum = Math.floor(1000 + Math.random() * 9000);

  const appointment: Appointment = {
    id: `apt-${Date.now()}`,
    bookingRef: `NF-2026-${bookingNum}`,
    userId: req.user!.id,
    customerName: req.user!.name,
    customerEmail: req.user!.email,
    customerPhone: req.user!.phone,
    serviceId: service.id,
    serviceName: service.name,
    categoryName: service.categoryName || 'Integrated Wellness',
    staffId: staff?.id,
    staffName: staff?.name || 'Assigned Specialist',
    appointmentDate,
    timeSlot,
    status: 'pending',
    paymentStatus: 'pending',
    amountInr: service.priceInr,
    notes: notes ? notes.trim() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const created = db.createAppointment(appointment);
    res.status(201).json({
      message: 'Appointment successfully requested! Our concierge will confirm your slot.',
      appointment: created,
    });
  } catch (err: any) {
    res.status(409).json({ error: err.message || 'Slot is no longer available. Please choose another time.' });
  }
});

// My Appointments (Customer)
apiRouter.get('/appointments/my', requireAuth, (req: AuthenticatedRequest, res) => {
  const list = db.getAppointments({ userId: req.user!.id });
  res.json(list);
});

// Customer Cancel Appointment
apiRouter.patch('/appointments/:id/cancel', requireAuth, (req: AuthenticatedRequest, res) => {
  const apt = db.getAppointmentById(req.params.id);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  if (req.user!.role === 'customer' && apt.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Unauthorized to modify this appointment.' });
  }

  if (apt.status === 'completed' || apt.status === 'cancelled') {
    return res.status(400).json({ error: `Cannot cancel an appointment that is already ${apt.status}.` });
  }

  const updated = db.updateAppointment(apt.id, {
    status: 'cancelled',
    paymentStatus: apt.paymentStatus === 'paid' ? 'refunded' : 'pending',
  });

  res.json({ message: 'Appointment has been cancelled.', appointment: updated });
});

// Customer Support Chatbot
apiRouter.post('/chat', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const text = message.toLowerCase();
  let reply = '';
  let quickActions: { label: string; action: string; url?: string }[] = [];

  if (text.includes('book') || text.includes('appointment') || text.includes('reserve') || text.includes('schedule')) {
    reply = 'You can book a consultation or treatment online seamlessly. Choose your preferred service, date, and specialist, and confirm your slot in under a minute.';
    quickActions = [
      { label: 'Book Appointment Now', action: 'navigate', url: '/book-appointment' },
      { label: 'View All Services', action: 'navigate', url: '/services' }
    ];
  } else if (text.includes('hour') || text.includes('timing') || text.includes('open') || text.includes('time')) {
    reply = 'NFYVE – The Change is open 7 days a week:\n• Weekdays: 7:00 AM – 9:00 PM\n• Saturdays: 8:00 AM – 8:00 PM\n• Sundays: 8:00 AM – 6:00 PM';
    quickActions = [
      { label: 'Book A Morning Slot', action: 'navigate', url: '/book-appointment' },
      { label: 'Contact Us', action: 'navigate', url: '/contact' }
    ];
  } else if (text.includes('where') || text.includes('location') || text.includes('address') || text.includes('begumpet') || text.includes('reach')) {
    reply = 'We are centrally located in Hyderabad at:\n4th Floor, Kura Towers, Begumpet, Hyderabad, Telangana 500016.\nValet parking and elevator access are readily available.';
    quickActions = [
      { label: 'View Map & Directions', action: 'navigate', url: '/contact' },
      { label: 'Call +91 9000023050', action: 'call', url: 'tel:+919000023050' }
    ];
  } else if (text.includes('service') || text.includes('treatment') || text.includes('offer') || text.includes('skin') || text.includes('gym') || text.includes('diet') || text.includes('hair')) {
    reply = 'NFYVE integrates six core pillars under one sanctuary roof:\n1. Clinical Aesthetics & Skin Health\n2. Medical Weight Loss & Body Contouring\n3. Fitness & Gym\n4. Salon, Hair & Beauty\n5. Nutri Food & Personalized Nutrition\n6. 360° Integrated Wellness Programs';
    quickActions = [
      { label: 'Explore All 6 Pillars', action: 'navigate', url: '/services' },
      { label: 'Book Consultation', action: 'navigate', url: '/book-appointment' }
    ];
  } else if (text.includes('price') || text.includes('cost') || text.includes('fee')) {
    reply = 'Our service fees are transparently listed for each treatment—from ₹1,800 for movement screens and ₹4,500 for Hydra-Infusion facials, up to our bespoke 360° transformations. No hidden fees.';
    quickActions = [
      { label: 'View Price List', action: 'navigate', url: '/services' },
      { label: 'Speak with Specialist', action: 'navigate', url: '/contact' }
    ];
  } else {
    reply = 'Thank you for reaching out to NFYVE – The Change! I can assist you with service details, scheduling an appointment, opening hours, or directions to our Begumpet sanctuary.';
    quickActions = [
      { label: 'Book Appointment', action: 'navigate', url: '/book-appointment' },
      { label: 'Browse Services', action: 'navigate', url: '/services' },
      { label: 'View Location', action: 'navigate', url: '/contact' }
    ];
  }

  res.json({ reply, quickActions });
});

// ================= PERSONALIZED STAFF PANEL ROUTES (/api/staff/*) =================

// Helper to resolve current authenticated staff member
function getStaffForUser(user: User) {
  if (user.staffId) {
    const staff = db.getStaffById(user.staffId);
    if (staff) return staff;
  }
  return db.getStaffByEmail(user.email);
}

// Staff Profile
apiRouter.get('/staff/me', requireRole(['staff']), (req: AuthenticatedRequest, res) => {
  const staff = getStaffForUser(req.user!);
  if (!staff) {
    return res.status(404).json({ error: 'Staff profile not found.' });
  }
  res.json({ staff, user: req.user });
});

// Staff Personalized Dashboard
apiRouter.get('/staff/dashboard', requireRole(['staff']), (req: AuthenticatedRequest, res) => {
  const staff = getStaffForUser(req.user!);
  if (!staff) {
    return res.status(404).json({ error: 'Staff profile not associated with this account.' });
  }

  const { period, startDate, endDate } = req.query;
  try {
    const dashboardData = db.getStaffDashboard(
      staff.id,
      (period as DateFilterPeriod) || 'this_month',
      startDate ? String(startDate) : undefined,
      endDate ? String(endDate) : undefined
    );
    res.json(dashboardData);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error generating staff dashboard.' });
  }
});

// Staff My Appointments (Strictly scoped to logged-in staff member)
apiRouter.get('/staff/appointments', requireRole(['staff']), (req: AuthenticatedRequest, res) => {
  const staff = getStaffForUser(req.user!);
  if (!staff) {
    return res.status(404).json({ error: 'Staff profile not found.' });
  }

  const { status, dateFilter, search, startDate, endDate } = req.query;
  const todayStr = '2026-10-02';

  let start = startDate ? String(startDate) : undefined;
  let end = endDate ? String(endDate) : undefined;

  if (dateFilter === 'today') {
    start = todayStr;
    end = todayStr;
  } else if (dateFilter === 'tomorrow') {
    const tomorrow = new Date('2026-10-02T12:00:00Z');
    tomorrow.setDate(tomorrow.getDate() + 1);
    start = tomorrow.toISOString().split('T')[0];
    end = start;
  } else if (dateFilter === 'this_week') {
    const range = db.calculateDateRange('this_week');
    start = range.startStr;
    end = range.endStr;
  } else if (dateFilter === 'this_month') {
    const range = db.calculateDateRange('this_month');
    start = range.startStr;
    end = range.endStr;
  }

  const appointments = db.getAppointments({
    staffId: staff.id,
    status: status ? String(status) : undefined,
    search: search ? String(search) : undefined,
    startDate: start,
    endDate: end,
  });

  res.json(appointments);
});

// Staff Mark Appointment Completed
apiRouter.patch('/staff/appointments/:id/complete', requireRole(['staff']), (req: AuthenticatedRequest, res) => {
  const staff = getStaffForUser(req.user!);
  if (!staff) return res.status(404).json({ error: 'Staff profile not found' });

  const apt = db.getAppointmentById(req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });

  // Security check: staff member can only complete appointments assigned to them!
  if (apt.staffId !== staff.id) {
    return res.status(403).json({ error: 'Unauthorized: This appointment is assigned to another practitioner.' });
  }

  const updated = db.updateAppointment(apt.id, {
    status: 'completed',
    paymentStatus: 'paid', // Mark collected
  });

  res.json({ message: 'Appointment marked as completed.', appointment: updated });
});

// Staff Update Treatment Notes
apiRouter.patch('/staff/appointments/:id/notes', requireRole(['staff']), (req: AuthenticatedRequest, res) => {
  const staff = getStaffForUser(req.user!);
  if (!staff) return res.status(404).json({ error: 'Staff profile not found' });

  const apt = db.getAppointmentById(req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });

  if (apt.staffId !== staff.id) {
    return res.status(403).json({ error: 'Unauthorized: This appointment is assigned to another practitioner.' });
  }

  const { notes } = req.body;
  const updated = db.updateAppointment(apt.id, { notes: String(notes).trim() });
  res.json({ message: 'Treatment notes updated.', appointment: updated });
});

// Staff Personal Performance Analytics
apiRouter.get('/staff/performance', requireRole(['staff']), (req: AuthenticatedRequest, res) => {
  const staff = getStaffForUser(req.user!);
  if (!staff) return res.status(404).json({ error: 'Staff profile not found' });

  const { period, startDate, endDate } = req.query;
  try {
    const perf = db.getStaffPerformance(
      staff.id,
      (period as DateFilterPeriod) || 'this_month',
      startDate ? String(startDate) : undefined,
      endDate ? String(endDate) : undefined
    );
    res.json(perf);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error generating performance metrics.' });
  }
});

// Staff Account Settings & Password Update
apiRouter.put('/staff/profile', requireRole(['staff']), (req: AuthenticatedRequest, res) => {
  const staff = getStaffForUser(req.user!);
  if (!staff) return res.status(404).json({ error: 'Staff profile not found' });

  const { name, phone, bio, currentPassword, newPassword } = req.body;

  // Handle password change if requested
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to set a new password.' });
    }
    const fullUser = db.getUserById(req.user!.id) as any;
    const isMatch = bcrypt.compareSync(currentPassword, fullUser.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    db.updateUser(req.user!.id, { passwordHash } as any);
  }

  // Update staff details
  const updatedStaff = db.updateStaffMember(staff.id, {
    name: name?.trim() || staff.name,
    phone: phone?.trim() || staff.phone,
    bio: bio?.trim() || staff.bio,
  });

  res.json({ message: 'Profile details saved successfully.', staff: updatedStaff });
});

// ================= ADMIN PROTECTED ROUTES (/api/admin/*) =================

// Admin Metrics (Calculated dynamically with comparison vs previous period)
apiRouter.get('/admin/metrics', requireRole(['admin']), (req, res) => {
  const { period, startDate, endDate } = req.query;
  const analytics = db.getAnalytics(
    (period as any) || 'this_month',
    startDate ? String(startDate) : undefined,
    endDate ? String(endDate) : undefined
  );
  res.json(analytics);
});

// Admin Analytics
apiRouter.get('/admin/analytics', requireRole(['admin']), (req, res) => {
  const { period, startDate, endDate } = req.query;
  const analytics = db.getAnalytics(
    (period as any) || 'this_month',
    startDate ? String(startDate) : undefined,
    endDate ? String(endDate) : undefined
  );
  res.json(analytics);
});

// Admin Appointments Management Table
apiRouter.get('/admin/appointments', requireRole(['admin']), (req, res) => {
  const { status, categoryId, search, startDate, endDate, staffId } = req.query;
  const list = db.getAppointments({
    status: status ? (String(status) as any) : undefined,
    categoryId: categoryId ? String(categoryId) : undefined,
    search: search ? String(search) : undefined,
    startDate: startDate ? String(startDate) : undefined,
    endDate: endDate ? String(endDate) : undefined,
    staffId: staffId ? String(staffId) : undefined,
  });
  res.json(list);
});

// Admin Status Updates
apiRouter.patch('/admin/appointments/:id/status', requireRole(['admin']), (req, res) => {
  const { status, paymentStatus, staffId, notes } = req.body;
  const apt = db.getAppointmentById(req.params.id);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }

  const updates: Partial<Appointment> = {};
  if (status) updates.status = status;
  if (paymentStatus) updates.paymentStatus = paymentStatus;
  if (staffId) {
    const st = db.getStaffById(staffId);
    updates.staffId = staffId;
    if (st) updates.staffName = st.name;
  }
  if (notes !== undefined) updates.notes = notes;

  const updated = db.updateAppointment(apt.id, updates);
  res.json({ message: 'Appointment updated successfully.', appointment: updated });
});

// Admin Reassign Staff
apiRouter.patch('/admin/appointments/:id/reassign', requireRole(['admin']), (req, res) => {
  const { staffId } = req.body;
  if (!staffId) return res.status(400).json({ error: 'Staff ID is required.' });

  const staff = db.getStaffById(staffId);
  if (!staff) return res.status(404).json({ error: 'Selected staff member not found.' });

  const updated = db.updateAppointment(req.params.id, {
    staffId: staff.id,
    staffName: staff.name,
  });

  res.json({ message: `Appointment reassigned to ${staff.name}.`, appointment: updated });
});

// Admin Reschedule Appointment
apiRouter.patch('/admin/appointments/:id/reschedule', requireRole(['admin']), (req, res) => {
  const { appointmentDate, timeSlot } = req.body;
  if (!appointmentDate || !timeSlot) {
    return res.status(400).json({ error: 'Date and time slot are required.' });
  }

  const updated = db.updateAppointment(req.params.id, {
    appointmentDate,
    timeSlot,
    status: 'confirmed',
  });

  res.json({ message: 'Appointment rescheduled successfully.', appointment: updated });
});

// Admin Walk-In / Phone Booking Creation
apiRouter.post('/admin/appointments/walkin', requireRole(['admin']), (req, res) => {
  const { customerName, customerEmail, customerPhone, serviceId, staffId, appointmentDate, timeSlot, paymentStatus, notes } = req.body;

  if (!customerName || !customerPhone || !serviceId || !appointmentDate || !timeSlot) {
    return res.status(400).json({ error: 'Customer name, phone, service, date, and slot are required.' });
  }

  const service = db.getServiceById(serviceId);
  if (!service) {
    return res.status(404).json({ error: 'Service not found.' });
  }

  const staff = staffId ? db.getStaffById(staffId) : undefined;
  const bookingNum = Math.floor(1000 + Math.random() * 9000);

  let cust = db.getUserByEmail(customerEmail || '');
  let custId = cust ? cust.id : `usr-walkin-${Date.now()}`;

  const apt: Appointment = {
    id: `apt-${Date.now()}`,
    bookingRef: `NF-2026-${bookingNum}`,
    userId: custId,
    customerName: customerName.trim(),
    customerEmail: customerEmail ? customerEmail.trim() : 'walkin@nfyve.com',
    customerPhone: customerPhone.trim(),
    serviceId: service.id,
    serviceName: service.name,
    categoryName: service.categoryName || 'General',
    staffId: staff?.id,
    staffName: staff?.name || 'Front Desk Assigned',
    appointmentDate,
    timeSlot,
    status: 'confirmed',
    paymentStatus: paymentStatus || 'paid',
    amountInr: service.priceInr,
    notes: notes || 'Walk-in / Phone reservation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const created = db.createAppointment(apt);
    res.status(201).json({ message: 'Walk-in appointment recorded successfully.', appointment: created });
  } catch (err: any) {
    res.status(409).json({ error: err.message || 'Slot already booked.' });
  }
});

// Customer Database Management
apiRouter.get('/admin/customers', requireRole(['admin']), (req, res) => {
  const customers = db.getAllCustomers();
  const allAppointments = db.getAppointments();

  const customerData = customers.map(c => {
    const userApts = allAppointments.filter(a => a.userId === c.id);
    const totalSpend = userApts
      .filter(a => a.status === 'completed' || a.paymentStatus === 'paid')
      .reduce((sum, a) => sum + a.amountInr, 0);

    const lastBooking = userApts[0]?.appointmentDate || 'None';
    const completedApts = userApts.filter(a => a.status === 'completed');
    const upcomingApts = userApts.filter(a => a.appointmentDate >= '2026-10-02' && a.status !== 'cancelled');

    // Preferred services
    const srvCount: Record<string, number> = {};
    userApts.forEach(a => {
      srvCount[a.serviceName] = (srvCount[a.serviceName] || 0) + 1;
    });
    const preferredService = Object.keys(srvCount).sort((a, b) => srvCount[b] - srvCount[a])[0] || 'Hydra-Infusion Facial';

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      registrationDate: c.createdAt.split('T')[0],
      totalBookings: userApts.length,
      completedBookings: completedApts.length,
      upcomingCount: upcomingApts.length,
      totalSpendInr: totalSpend,
      lastBooking,
      preferredService,
    };
  });

  res.json(customerData);
});

apiRouter.get('/admin/customers/:id', requireRole(['admin']), (req, res) => {
  const customer = db.getUserById(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found.' });
  }
  const appointments = db.getAppointments({ userId: customer.id });
  const { passwordHash: _, ...safeCustomer } = customer as any;
  res.json({ customer: safeCustomer, appointments });
});

// Admin Staff Management (CRUD + Performance summary)
apiRouter.get('/admin/staff', requireRole(['admin']), (req, res) => {
  const staff = db.getStaff(false);
  const appointments = db.getAppointments();

  const enriched = staff.map(s => {
    const staffApts = appointments.filter(a => a.staffId === s.id);
    const completedApts = staffApts.filter(a => a.status === 'completed');
    const revenue = completedApts.reduce((sum, a) => sum + a.amountInr, 0);

    return {
      ...s,
      totalAssigned: staffApts.length,
      completedCount: completedApts.length,
      totalRevenueGenerated: revenue,
    };
  });

  res.json(enriched);
});

apiRouter.post('/admin/staff', requireRole(['admin']), (req, res) => {
  const { name, email, phone, roleTitle, specialties, bio, password } = req.body;
  if (!name || !email || !roleTitle) {
    return res.status(400).json({ error: 'Name, email, and role title are required.' });
  }

  try {
    const newStaff = db.createStaffMember({
      name,
      email,
      phone: phone || '+91 9000000000',
      roleTitle,
      specialties: Array.isArray(specialties) && specialties.length > 0 ? specialties : [roleTitle],
      bio: bio || '',
      password,
    });
    res.status(201).json({ message: 'Staff member created successfully.', staff: newStaff });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Error creating staff member.' });
  }
});

apiRouter.put('/admin/staff/:id', requireRole(['admin']), (req, res) => {
  const updated = db.updateStaffMember(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Staff member not found.' });
  res.json({ message: 'Staff profile updated.', staff: updated });
});

apiRouter.patch('/admin/staff/:id/toggle', requireRole(['admin']), (req, res) => {
  const updated = db.toggleStaffStatus(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Staff member not found.' });
  res.json({ message: `Staff status set to ${updated.isActive ? 'Active' : 'Inactive'}.`, staff: updated });
});

apiRouter.post('/admin/staff/:id/reset-password', requireRole(['admin']), (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  try {
    db.resetStaffPassword(req.params.id, newPassword);
    res.json({ message: 'Staff access password reset successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Error resetting password.' });
  }
});

// Services Management (Admin only)
apiRouter.post('/admin/services', requireRole(['admin']), (req, res) => {
  const { name, categoryId, shortDesc, fullDesc, durationMins, priceInr, imageUrl, benefits, precautions } = req.body;
  if (!name || !categoryId || !priceInr) {
    return res.status(400).json({ error: 'Name, category, and price are required.' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newService: Service = {
    id: `srv-${Date.now()}`,
    categoryId,
    name: name.trim(),
    slug,
    shortDesc: shortDesc?.trim() || '',
    fullDesc: fullDesc?.trim() || '',
    durationMins: Number(durationMins) || 60,
    priceInr: Number(priceInr),
    imageUrl: imageUrl || '/src/assets/images/nfyve_hero_wellness_1790943426252.jpg',
    benefits: Array.isArray(benefits) ? benefits : [benefits || 'Consultation with specialist'],
    precautions: Array.isArray(precautions) ? precautions : [],
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  db.createService(newService);
  res.status(201).json({ message: 'Service created successfully.', service: newService });
});

apiRouter.put('/admin/services/:id', requireRole(['admin']), (req, res) => {
  const updated = db.updateService(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Service not found.' });
  }
  res.json({ message: 'Service updated.', service: updated });
});

apiRouter.delete('/admin/services/:id', requireRole(['admin']), (req, res) => {
  const success = db.deleteService(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Service not found.' });
  }
  res.json({ message: 'Service removed.' });
});

// Inquiries Management (Admin only)
apiRouter.get('/admin/inquiries', requireRole(['admin']), (req, res) => {
  res.json(db.getInquiries());
});

apiRouter.patch('/admin/inquiries/:id/status', requireRole(['admin']), (req, res) => {
  const { status } = req.body;
  const updated = db.updateInquiryStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Inquiry not found.' });
  }
  res.json(updated);
});

// Review Moderation (Admin only)
apiRouter.get('/admin/reviews', requireRole(['admin']), (req, res) => {
  res.json(db.getReviews(false));
});

apiRouter.patch('/admin/reviews/:id/approve', requireRole(['admin']), (req, res) => {
  const { isApproved } = req.body;
  const updated = db.approveReview(req.params.id, Boolean(isApproved));
  if (!updated) {
    return res.status(404).json({ error: 'Review not found.' });
  }
  res.json(updated);
});

// Settings Update (Admin only)
apiRouter.put('/admin/settings', requireRole(['admin']), (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json({ message: 'Settings saved.', settings: updated });
});
