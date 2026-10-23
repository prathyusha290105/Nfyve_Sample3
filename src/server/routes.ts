import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { 
  User, 
  Appointment, 
  Review, 
  ContactInquiry, 
  Service, 
  DateFilterPeriod,
  RoomId,
  AppointmentStatus,
  ROOMS
} from '../types';

import fs from 'fs';
import path from 'path';

export const apiRouter = Router();

// File-backed token storage for active sessions across server reloads
const SESSIONS_FILE = path.resolve(process.cwd(), 'data', 'nfyve_sessions.json');
const SESSIONS: Map<string, { userId: string; role: string; expiresAt: number }> = new Map();

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        const now = Date.now();
        for (const [k, v] of Object.entries(parsed)) {
          const val = v as { userId: string; role: string; expiresAt: number };
          if (val && val.expiresAt > now) {
            SESSIONS.set(k, val);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load sessions from file, starting with empty session map:', err);
  }
}

function saveSessions() {
  try {
    const obj: Record<string, { userId: string; role: string; expiresAt: number }> = {};
    for (const [k, v] of SESSIONS.entries()) {
      if (v.expiresAt > Date.now()) {
        obj[k] = v;
      }
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to save sessions to file:', err);
  }
}

// Initial session load
loadSessions();

function generateToken(userId: string, role: string): string {
  const token = `nfyve_token_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
  SESSIONS.set(token, {
    userId,
    role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  saveSessions();
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

  const isInternalRole = ['admin', 'staff', 'call_center', 'front_desk', 'manager'].includes(user.role);

  // Enforce mode separation:
  if (mode === 'staff_admin' && !isInternalRole) {
    return res.status(403).json({
      error: 'This account does not have staff or operational privileges. Please use the Customer Login.',
    });
  }

  if (mode === 'customer' && isInternalRole) {
    return res.status(403).json({
      error: 'Operational and Staff accounts must sign in using the Staff / Console Login option.',
    });
  }

  const token = generateToken(user.id, user.role);
  const { passwordHash: _, ...safeUser } = user;

  res.json({
    message: 'Login successful',
    token,
    user: safeUser,
  });
});

// Firebase Auth Session Exchange / Synchronization
apiRouter.post('/auth/firebase-session', (req, res) => {
  const { email, uid, name } = req.body;
  if (!email && !uid) {
    return res.status(400).json({ error: 'Email or UID is required for Firebase session verification.' });
  }

  let user: any = email ? db.getUserByEmail(email) : null;
  if (!user && uid) {
    user = db.getUserById(uid);
  }

  // If user does not exist in local db yet (e.g. newly signed up via Firebase Auth), create them
  if (!user && email) {
    const role = email.includes('admin') ? 'admin' 
      : email.includes('frontdesk') ? 'front_desk' 
      : email.includes('callcenter') ? 'call_center' 
      : email.includes('staff') || email.includes('dr.') ? 'staff' 
      : 'customer';
    
    user = {
      id: uid || `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email: email.toLowerCase().trim(),
      phone: '+91 9000023050',
      role,
      passwordHash: '',
      createdAt: new Date().toISOString()
    };
    db.createUser(user);
  }

  if (!user) {
    return res.status(404).json({ error: 'User account could not be found or provisioned.' });
  }

  const token = generateToken(user.id, user.role);
  const { passwordHash: _, ...safeUser } = user as any;

  res.json({
    message: 'Firebase session verified',
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
    saveSessions();
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

// ================= ROOMS & SHARED SCHEDULING RESOURCES =================
apiRouter.get('/rooms', (req, res) => {
  res.json(db.getRooms());
});

// ================= CUSTOMERS & PROSPECTS (CALL CENTER / FRONT DESK / ADMIN) =================
apiRouter.get('/customers', requireRole(['admin', 'call_center', 'front_desk', 'manager']), (req, res) => {
  const { search, status, source } = req.query;
  const customers = db.getCustomers({
    search: search ? String(search) : undefined,
    status: status ? String(status) : undefined,
    source: source ? String(source) : undefined,
  });
  res.json(customers);
});

apiRouter.get('/customers/search-phone', requireRole(['admin', 'call_center', 'front_desk', 'manager']), (req, res) => {
  const phone = req.query.phone ? String(req.query.phone) : '';
  if (!phone) {
    return res.status(400).json({ error: 'Phone parameter required' });
  }
  const customer = db.getCustomerByPhone(phone);
  res.json({ exists: Boolean(customer), customer });
});

apiRouter.get('/customers/:id', requireRole(['admin', 'call_center', 'front_desk', 'manager', 'staff']), (req, res) => {
  const data360 = db.getCustomer360(req.params.id);
  if (!data360) {
    return res.status(404).json({ error: 'Customer not found.' });
  }
  res.json(data360);
});

apiRouter.post('/customers', requireRole(['admin', 'call_center', 'front_desk', 'manager']), (req: AuthenticatedRequest, res) => {
  try {
    const actorName = req.user?.name || 'Staff Member';
    const customer = db.createCustomer(req.body, actorName);
    res.status(201).json({ message: 'Customer record created successfully.', customer });
  } catch (err: any) {
    res.status(409).json({ error: err.message || 'Failed to create customer.' });
  }
});

apiRouter.put('/customers/:id', requireRole(['admin', 'call_center', 'front_desk', 'manager']), (req: AuthenticatedRequest, res) => {
  const actorName = req.user?.name || 'Staff Member';
  const updated = db.updateCustomer(req.params.id, req.body, actorName);
  if (!updated) {
    return res.status(404).json({ error: 'Customer not found.' });
  }
  res.json({ message: 'Customer updated successfully.', customer: updated });
});

// ================= CALL LOGS (CALL CENTER / ADMIN) =================
apiRouter.get('/call-logs', requireRole(['admin', 'call_center', 'front_desk', 'manager']), (req, res) => {
  const customerId = req.query.customerId ? String(req.query.customerId) : undefined;
  const logs = db.getCallLogs(customerId);
  res.json(logs);
});

apiRouter.post('/call-logs', requireRole(['admin', 'call_center']), (req: AuthenticatedRequest, res) => {
  const { customerId, customerName, customerPhone, outcome, remarks, nextAction, followUpDate } = req.body;
  if (!customerId || !outcome) {
    return res.status(400).json({ error: 'Customer and call outcome are required.' });
  }

  const newLog = db.createCallLog({
    customerId,
    customerName: customerName || 'Client',
    customerPhone: customerPhone || '+91 9000023050',
    employeeId: req.user!.id,
    employeeName: req.user!.name,
    dateTime: new Date().toISOString(),
    outcome,
    remarks: remarks || '',
    nextAction,
    followUpDate
  });

  res.status(201).json({ message: 'Call log saved successfully.', callLog: newLog });
});

// ================= FOLLOW-UPS & CALLBACK QUEUE =================
apiRouter.get('/follow-ups', requireRole(['admin', 'call_center', 'front_desk', 'manager']), (req, res) => {
  const { status, period, employeeId, todayDate } = req.query;
  const list = db.getFollowUps({
    status: status ? String(status) : undefined,
    period: period ? String(period) : undefined,
    employeeId: employeeId ? String(employeeId) : undefined,
    todayDate: todayDate ? String(todayDate) : undefined
  });
  res.json(list);
});

apiRouter.post('/follow-ups', requireRole(['admin', 'call_center', 'front_desk', 'manager']), (req: AuthenticatedRequest, res) => {
  const { customerId, customerName, customerPhone, type, dueDate, dueTime, reason } = req.body;
  if (!customerId || !dueDate || !reason) {
    return res.status(400).json({ error: 'Customer, due date, and reason are required.' });
  }

  const item = db.createFollowUp({
    customerId,
    customerName: customerName || 'Client',
    customerPhone: customerPhone || '+91 9000023050',
    type: type || 'prospect',
    dueDate,
    dueTime: dueTime || '11:00 AM',
    assignedEmployeeId: req.user!.id,
    assignedEmployeeName: req.user!.name,
    reason,
    status: 'pending'
  });

  res.status(201).json({ message: 'Follow-up task scheduled.', followUp: item });
});

apiRouter.patch('/follow-ups/:id', requireRole(['admin', 'call_center', 'front_desk', 'manager']), (req: AuthenticatedRequest, res) => {
  const actorName = req.user?.name || 'Staff Member';
  const updated = db.updateFollowUp(req.params.id, req.body, actorName);
  if (!updated) {
    return res.status(404).json({ error: 'Follow-up not found.' });
  }
  res.json({ message: 'Follow-up updated.', followUp: updated });
});

// ================= APPOINTMENTS WITH OVERLAP PREVENTION =================
apiRouter.get('/appointments/my', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || '';
  const userEmail = (req.user?.email || '').toLowerCase();
  const userPhone = (req.user?.phone || '').replace(/\D/g, '');
  const all = db.getAppointments();
  const mine = all.filter(a => 
    (a.userId && a.userId === userId) ||
    (a.customerEmail && a.customerEmail.toLowerCase() === userEmail) ||
    (userPhone && a.customerPhone && a.customerPhone.replace(/\D/g, '') === userPhone)
  );
  res.json(mine);
});

apiRouter.post('/chat', (req, res) => {
  const msg = (req.body.message || '').toLowerCase();
  let reply = 'Welcome to NFYVE – The Change sanctuary in Begumpet, Hyderabad. How may our concierge assist your journey today?';
  const quickActions = [
    { label: 'Direct Call (+91 9000023050)', action: 'navigate', url: 'tel:+919000023050' },
    { label: 'Explore Services', action: 'navigate', url: '/services' },
    { label: 'Schedule Consultation', action: 'navigate', url: '/book-appointment' },
    { label: 'Contact Reception', action: 'navigate', url: '/contact' }
  ];

  if (msg.includes('book') || msg.includes('appointment') || msg.includes('schedule')) {
    reply = 'At NFYVE Begumpet, all appointments are scheduled through our dedicated clinical call centre (+91 90000 23050) or front desk to ensure doctor alignment and treatment room reservation.';
  } else if (msg.includes('price') || msg.includes('cost')) {
    reply = 'All aesthetic, metabolic, and wellness programs include bespoke physician diagnostics. Our concierge will be delighted to explain treatment packages and pricing.';
  } else if (msg.includes('location') || msg.includes('address') || msg.includes('where')) {
    reply = 'We are situated at 1-10-72/2, 2nd Floor, Grand View, Begumpet, Hyderabad, Telangana 500016. Valet parking is available for all visitors.';
  }

  res.json({ reply, quickActions });
});

apiRouter.get('/appointments/check-conflict', requireRole(['admin', 'call_center', 'front_desk', 'manager', 'staff']), (req, res) => {
  const { date, timeSlot, room, staffId, excludeId } = req.query;
  if (!date || !timeSlot) {
    return res.status(400).json({ error: 'date and timeSlot query params are required.' });
  }

  const result = db.checkConflict(
    String(date), 
    String(timeSlot), 
    room ? (String(room) as RoomId) : undefined, 
    staffId ? String(staffId) : undefined,
    excludeId ? String(excludeId) : undefined
  );
  res.json(result);
});

apiRouter.get('/appointments', requireRole(['admin', 'call_center', 'front_desk', 'manager', 'staff']), (req: AuthenticatedRequest, res) => {
  const { date, room, staffId, status, search } = req.query;
  
  // Attending Staff can only view their own appointments unless Admin / FrontDesk
  let filterStaffId = staffId ? String(staffId) : undefined;
  if (req.user!.role === 'staff') {
    filterStaffId = req.user!.staffId || req.user!.id;
  }

  const appointments = db.getAppointments({
    date: date ? String(date) : undefined,
    room: room ? (String(room) as RoomId) : undefined,
    staffId: filterStaffId,
    status: status ? String(status) : undefined,
    search: search ? String(search) : undefined,
  });

  res.json(appointments);
});

apiRouter.get('/appointments/:id', requireRole(['admin', 'call_center', 'front_desk', 'manager', 'staff']), (req, res) => {
  const apt = db.getAppointmentById(req.params.id);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found.' });
  }
  res.json(apt);
});

apiRouter.post('/appointments', requireRole(['admin', 'call_center', 'front_desk', 'manager']), (req: AuthenticatedRequest, res) => {
  try {
    const actor = req.user?.name || 'Staff Member';
    const created = db.createAppointment(req.body, actor);
    res.status(201).json({ message: 'Appointment booked successfully.', appointment: created });
  } catch (err: any) {
    res.status(409).json({ error: err.message || 'Unable to book appointment due to resource conflict.' });
  }
});

apiRouter.patch('/appointments/:id/status', requireRole(['admin', 'call_center', 'front_desk', 'manager', 'staff']), (req: AuthenticatedRequest, res) => {
  const { status, reason } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  try {
    const updated = db.updateAppointmentStatus(req.params.id, status as AppointmentStatus, {
      reason,
      actor: req.user?.name || 'Staff'
    });

    if (!updated) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    res.json({ message: 'Appointment status updated.', appointment: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Invalid status transition.' });
  }
});

apiRouter.post('/appointments/:id/reschedule', requireRole(['admin', 'call_center', 'front_desk', 'manager']), (req: AuthenticatedRequest, res) => {
  const { newDate, newTimeSlot, newRoom, newStaffId } = req.body;
  if (!newDate || !newTimeSlot) {
    return res.status(400).json({ error: 'newDate and newTimeSlot are required.' });
  }

  try {
    const actor = req.user?.name || 'Staff Member';
    const rescheduled = db.rescheduleAppointment(req.params.id, newDate, newTimeSlot, newRoom, newStaffId, actor);
    res.json({ message: 'Appointment successfully rescheduled.', appointment: rescheduled });
  } catch (err: any) {
    res.status(409).json({ error: err.message || 'Could not reschedule due to resource conflict.' });
  }
});

// ================= CONSULTATIONS =================
apiRouter.get('/consultations', requireRole(['admin', 'call_center', 'front_desk', 'manager', 'staff']), (req, res) => {
  const customerId = req.query.customerId ? String(req.query.customerId) : undefined;
  const list = db.getConsultations(customerId);
  res.json(list);
});

apiRouter.post('/consultations', requireRole(['admin', 'front_desk', 'manager', 'staff']), (req: AuthenticatedRequest, res) => {
  const actor = req.user?.name || 'Staff Member';
  const newConsultation = db.createConsultation(req.body, actor);
  res.status(201).json({ message: 'Consultation recorded successfully.', consultation: newConsultation });
});

// ================= PACKAGES =================
apiRouter.get('/packages', requireRole(['admin', 'front_desk', 'manager', 'staff']), (req, res) => {
  const customerId = req.query.customerId ? String(req.query.customerId) : undefined;
  const list = db.getPackages(customerId);
  res.json(list);
});

apiRouter.post('/packages', requireRole(['admin', 'front_desk', 'manager']), (req: AuthenticatedRequest, res) => {
  const actor = req.user?.name || 'Staff Member';
  const pkg = db.createPackage(req.body, actor);
  res.status(201).json({ message: 'Package enrolled successfully.', package: pkg });
});

// ================= TREATMENT SESSIONS =================
apiRouter.get('/sessions', requireRole(['admin', 'front_desk', 'manager', 'staff']), (req, res) => {
  const { packageId, customerId } = req.query;
  const list = db.getSessions(
    packageId ? String(packageId) : undefined, 
    customerId ? String(customerId) : undefined
  );
  res.json(list);
});

apiRouter.post('/sessions', requireRole(['admin', 'front_desk', 'manager']), (req: AuthenticatedRequest, res) => {
  const actor = req.user?.name || 'Staff Member';
  const session = db.createSession(req.body, actor);
  res.status(201).json({ message: 'Treatment session scheduled.', session });
});

apiRouter.post('/sessions/:id/complete', requireRole(['admin', 'front_desk', 'manager', 'staff']), (req: AuthenticatedRequest, res) => {
  try {
    const actor = req.user?.name || 'Specialist';
    const completed = db.completeSession(req.params.id, req.body, actor);
    res.json({ message: 'Session marked as completed. Package updated.', session: completed });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to complete session.' });
  }
});

// ================= INVOICES & BILLING =================
apiRouter.get('/invoices', requireRole(['admin', 'front_desk', 'manager']), (req, res) => {
  const customerId = req.query.customerId ? String(req.query.customerId) : undefined;
  const list = db.getInvoices(customerId);
  res.json(list);
});

apiRouter.get('/invoices/:id', requireRole(['admin', 'front_desk', 'manager']), (req, res) => {
  const inv = db.getInvoiceById(req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found.' });
  res.json(inv);
});

apiRouter.post('/invoices', requireRole(['admin', 'front_desk']), (req: AuthenticatedRequest, res) => {
  const actor = req.user?.name || 'Front Desk';
  const inv = db.createInvoice(req.body, actor);
  res.status(201).json({ message: 'Invoice created successfully.', invoice: inv });
});

// ================= PAYMENTS =================
apiRouter.get('/payments', requireRole(['admin', 'front_desk', 'manager']), (req, res) => {
  const { invoiceId, customerId } = req.query;
  const list = db.getPayments(
    invoiceId ? String(invoiceId) : undefined,
    customerId ? String(customerId) : undefined
  );
  res.json(list);
});

apiRouter.post('/payments', requireRole(['admin', 'front_desk']), (req: AuthenticatedRequest, res) => {
  const actor = req.user?.name || 'Front Desk';
  const payment = db.createPayment(req.body, actor);
  res.status(201).json({ message: 'Payment recorded successfully.', payment });
});

// ================= PAYMENT POSTPONEMENTS & FOLLOW-UPS =================
apiRouter.get('/payment-postponements', requireRole(['admin', 'front_desk', 'manager']), (req, res) => {
  const { status } = req.query;
  const list = db.getPaymentFollowUps(status ? String(status) : undefined);
  res.json(list);
});

apiRouter.post('/payment-postponements', requireRole(['admin', 'front_desk']), (req: AuthenticatedRequest, res) => {
  const actor = req.user?.name || 'Front Desk';
  const postponement = db.createPaymentPostponement(req.body, actor);
  res.status(201).json({ message: 'Payment postponement recorded.', postponement });
});

// ================= AUDIT LOGS =================
apiRouter.get('/audit-logs', requireRole(['admin', 'manager']), (req, res) => {
  const { recordType, recordId } = req.query;
  const logs = db.getAuditLogs(
    recordType ? String(recordType) : undefined,
    recordId ? String(recordId) : undefined
  );
  res.json(logs);
});

// ================= OPERATIONAL ANALYTICS & KPIS =================
apiRouter.get('/analytics', requireRole(['admin', 'manager']), (req, res) => {
  const period = (req.query.period as DateFilterPeriod) || 'this_month';
  const summary = db.getAnalyticsSummary(period);
  res.json(summary);
});

// ================= STAFF DASHBOARD & PERFORMANCE =================
apiRouter.get('/staff/me', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res) => {
  const staffId = req.user?.staffId || req.user?.id || '';
  const staff = (staffId ? db.getStaffById(staffId) : null) || db.getStaff()[0];
  res.json({ staff, user: req.user });
});

apiRouter.patch('/staff/:id/toggle', requireRole(['admin']), (req, res) => {
  const staff = db.getStaffById(req.params.id);
  if (!staff) return res.status(404).json({ error: 'Staff member not found.' });
  const updated = db.updateStaff(req.params.id, { isActive: !staff.isActive });
  res.json(updated);
});

apiRouter.post('/staff/:id/reset-password', requireRole(['admin']), (req, res) => {
  res.json({ message: 'Temporary reset instructions dispatched.' });
});

apiRouter.get('/staff/my-dashboard', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res) => {
  const staffId = req.user?.staffId || req.user?.id || '';
  const data = staffId ? db.getStaffDashboardData(staffId) : null;
  if (!data) {
    // If admin viewing staff route, fallback to first staff
    const firstStaff = db.getStaff()[0];
    if (firstStaff) {
      return res.json(db.getStaffDashboardData(firstStaff.id));
    }
    return res.status(404).json({ error: 'Staff profile not found.' });
  }
  res.json(data);
});

apiRouter.get('/staff/:id/dashboard', requireRole(['admin', 'manager']), (req, res) => {
  const data = db.getStaffDashboardData(req.params.id);
  if (!data) return res.status(404).json({ error: 'Staff member not found.' });
  res.json(data);
});

// ================= PUBLIC / SHARED CONTENT ROUTES =================
apiRouter.get('/categories', (req, res) => {
  res.json(db.getCategories());
});

apiRouter.get('/services', (req, res) => {
  res.json(db.getServices(true));
});

apiRouter.get('/services/:id', (req, res) => {
  const service = db.getServiceById(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found.' });
  res.json(service);
});

apiRouter.post('/services', requireRole(['admin']), (req, res) => {
  const created = db.createService(req.body);
  res.status(201).json(created);
});

apiRouter.put('/services/:id', requireRole(['admin']), (req, res) => {
  const updated = db.updateService(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Service not found.' });
  res.json(updated);
});

apiRouter.delete('/services/:id', requireRole(['admin']), (req, res) => {
  const ok = db.deleteService(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Service not found.' });
  res.json({ success: true });
});

apiRouter.get('/staff', (req, res) => {
  res.json(db.getStaff(true));
});

apiRouter.get('/staff/:id', (req, res) => {
  const stf = db.getStaffById(req.params.id);
  if (!stf) return res.status(404).json({ error: 'Staff member not found.' });
  res.json(stf);
});

apiRouter.post('/staff', requireRole(['admin']), (req, res) => {
  const created = db.createStaff(req.body);
  res.status(201).json(created);
});

apiRouter.put('/staff/:id', requireRole(['admin']), (req, res) => {
  const updated = db.updateStaff(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Staff not found.' });
  res.json(updated);
});

apiRouter.get('/reviews', (req, res) => {
  res.json(db.getReviews(true));
});

apiRouter.get('/reviews/all', requireRole(['admin']), (req, res) => {
  res.json(db.getReviews(false));
});

apiRouter.post('/reviews', (req, res) => {
  const review = db.createReview(req.body);
  res.status(201).json(review);
});

apiRouter.patch('/reviews/:id/approve', requireRole(['admin']), (req, res) => {
  const updated = db.approveReview(req.params.id, req.body.isApproved);
  if (!updated) return res.status(404).json({ error: 'Review not found.' });
  res.json(updated);
});

apiRouter.get('/inquiries', requireRole(['admin', 'call_center', 'front_desk']), (req, res) => {
  res.json(db.getInquiries());
});

apiRouter.post('/inquiries', (req, res) => {
  const inq = db.createInquiry(req.body);
  res.status(201).json(inq);
});

apiRouter.patch('/inquiries/:id/status', requireRole(['admin', 'call_center', 'front_desk']), (req, res) => {
  const updated = db.updateInquiryStatus(req.params.id, req.body.status);
  if (!updated) return res.status(404).json({ error: 'Inquiry not found.' });
  res.json(updated);
});

apiRouter.get('/settings', (req, res) => {
  res.json(db.getSettings());
});

apiRouter.put('/settings', requireRole(['admin']), (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});
