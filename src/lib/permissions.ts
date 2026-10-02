import { Role, User } from '../types';

export function isAuthenticated(user: User | null): boolean {
  return user !== null;
}

export function isAdmin(user: User | null): boolean {
  return user !== null && user.role === 'admin' && user.active !== false;
}

export function isStaff(user: User | null): boolean {
  return user !== null && user.role === 'staff' && user.active !== false;
}

export function canAccessAdmin(user: User | null): boolean {
  return isAdmin(user);
}

export function canAccessStaff(user: User | null): boolean {
  return user !== null && (user.role === 'staff' || user.role === 'admin') && user.active !== false;
}

export function canManageAppointments(user: User | null): boolean {
  return isAdmin(user);
}

export function canViewAllRevenue(user: User | null): boolean {
  return isAdmin(user);
}

export function canModerateReviews(user: User | null): boolean {
  return isAdmin(user);
}

export function canManageStaff(user: User | null): boolean {
  return isAdmin(user);
}

export function canEditBusinessSettings(user: User | null): boolean {
  return isAdmin(user);
}

export function canViewCustomerDatabase(user: User | null): boolean {
  return isAdmin(user);
}

export function canManageInquiries(user: User | null): boolean {
  return isAdmin(user);
}
