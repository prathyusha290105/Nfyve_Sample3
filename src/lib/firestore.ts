import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  runTransaction,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { api } from '../api/client';
import { 
  Appointment, 
  Service, 
  ServiceCategory, 
  Staff, 
  User, 
  Review, 
  ContactInquiry, 
  BusinessSettings,
  AppointmentStatus,
  PaymentStatus 
} from '../types';

/**
 * Creates an appointment with double-booking prevention and persists it to Firestore (or local API fallback).
 */
export async function createBooking(payload: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  staffId?: string;
  appointmentDate: string;
  timeSlot: string;
  notes?: string;
  fee?: number;
}): Promise<Appointment> {
  const bookingNum = Math.floor(1000 + Math.random() * 9000);
  const bookingReference = `NF-2026-${bookingNum}`;

  // If Firebase is configured and connected:
  if (isFirebaseConfigured && db) {
    try {
      const appointmentsRef = collection(db, 'appointments');
      
      // Query to check if the staff member is already booked for this slot
      if (payload.staffId) {
        const conflictQuery = query(
          appointmentsRef,
          where('appointmentDate', '==', payload.appointmentDate),
          where('timeSlot', '==', payload.timeSlot),
          where('assignedStaffId', '==', payload.staffId),
          where('appointmentStatus', 'in', ['pending', 'confirmed'])
        );
        const conflictSnap = await getDocs(conflictQuery);
        if (!conflictSnap.empty) {
          throw new Error('This specialist is already booked for the selected date and time slot. Please choose another time.');
        }
      }

      // Fetch service details for accurate snapshot
      const serviceDoc = await getDoc(doc(db, 'services', payload.serviceId));
      let serviceName = 'Wellness Consultation';
      let categoryName = 'General Wellness';
      let fee = payload.fee || 3500;
      if (serviceDoc.exists()) {
        const sData = serviceDoc.data() as Service;
        serviceName = sData.name || serviceName;
        categoryName = sData.categoryName || categoryName;
        fee = sData.priceInr || sData.priceInr || fee;
      }

      let staffName = 'Concierge Specialist';
      if (payload.staffId) {
        const staffDoc = await getDoc(doc(db, 'users', payload.staffId));
        if (staffDoc.exists()) {
          staffName = staffDoc.data().name || staffName;
        }
      }

      const appointmentRecord: any = {
        bookingReference,
        bookingRef: bookingReference,
        customerName: payload.customerName.trim(),
        customerEmail: payload.customerEmail.trim().toLowerCase(),
        customerPhone: payload.customerPhone.trim(),
        serviceId: payload.serviceId,
        serviceName,
        categoryName,
        assignedStaffId: payload.staffId || null,
        staffId: payload.staffId || null,
        assignedStaffName: staffName,
        staffName,
        appointmentDate: payload.appointmentDate,
        timeSlot: payload.timeSlot,
        fee,
        amountInr: fee,
        paymentStatus: 'pending',
        appointmentStatus: 'confirmed',
        status: 'confirmed',
        notes: payload.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
      };

      const docRef = await addDoc(appointmentsRef, appointmentRecord);
      
      // Also upsert to customers collection
      const customersRef = collection(db, 'customers');
      const custQuery = query(customersRef, where('phone', '==', payload.customerPhone.trim()));
      const custSnap = await getDocs(custQuery);
      if (custSnap.empty) {
        await addDoc(customersRef, {
          name: payload.customerName.trim(),
          email: payload.customerEmail.trim().toLowerCase(),
          phone: payload.customerPhone.trim(),
          createdAt: new Date().toISOString(),
        });
      }

      return {
        id: docRef.id,
        ...appointmentRecord,
      };
    } catch (err: any) {
      console.warn('Firestore booking failed, falling back to local database layer:', err.message);
      // Fallback below
    }
  }

  // Graceful fallback to server API
  const res = await api.createAppointment({
    serviceId: payload.serviceId,
    staffId: payload.staffId,
    appointmentDate: payload.appointmentDate,
    timeSlot: payload.timeSlot,
    notes: payload.notes,
  });

  return res.appointment;
}

/**
 * Fetches appointments with role-based filtering (Admin gets all, Staff gets assigned only).
 */
export async function fetchAppointments(filters?: {
  staffId?: string;
  status?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Appointment[]> {
  if (isFirebaseConfigured && db) {
    try {
      const appointmentsRef = collection(db, 'appointments');
      let q = query(appointmentsRef);

      if (filters?.staffId) {
        q = query(q, where('assignedStaffId', '==', filters.staffId));
      }
      if (filters?.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      const snap = await getDocs(q);
      let list: Appointment[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
        bookingRef: d.data().bookingRef || d.data().bookingReference || d.id,
        status: d.data().status || d.data().appointmentStatus || 'confirmed',
        paymentStatus: d.data().paymentStatus || 'pending',
        amountInr: d.data().amountInr || d.data().fee || 3500,
        staffName: d.data().staffName || d.data().assignedStaffName || 'Concierge Assigned',
      }));

      if (filters?.startDate) {
        list = list.filter(a => a.appointmentDate >= filters.startDate!);
      }
      if (filters?.endDate) {
        list = list.filter(a => a.appointmentDate <= filters.endDate!);
      }
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        list = list.filter(a => 
          a.customerName.toLowerCase().includes(s) ||
          a.customerPhone.includes(s) ||
          a.bookingRef.toLowerCase().includes(s) ||
          a.serviceName.toLowerCase().includes(s)
        );
      }

      // Sort descending by date
      return list.sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate));
    } catch (err) {
      console.warn('Firestore fetchAppointments error, using fallback API:', err);
    }
  }

  // Fallback to server API
  if (filters?.staffId) {
    return api.getStaffAppointments({
      status: filters.status,
      search: filters.search,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  }

  return api.getAdminAppointments(filters);
}

/**
 * Updates an appointment in Firestore (or local API fallback).
 */
export async function updateAppointmentRecord(id: string, updates: Partial<Appointment>): Promise<Appointment> {
  if (isFirebaseConfigured && db) {
    try {
      const aptDoc = doc(db, 'appointments', id);
      const payload: any = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      if (updates.status) payload.appointmentStatus = updates.status;
      if (updates.staffId) payload.assignedStaffId = updates.staffId;
      if (updates.staffName) payload.assignedStaffName = updates.staffName;

      await updateDoc(aptDoc, payload);
      const refreshed = await getDoc(aptDoc);
      return { id: refreshed.id, ...(refreshed.data() as any) };
    } catch (err) {
      console.warn('Firestore updateAppointment error, using fallback API:', err);
    }
  }

  const res = await api.updateAppointmentStatus(id, {
    status: updates.status,
    paymentStatus: updates.paymentStatus,
    staffId: updates.staffId,
    notes: updates.notes,
  });

  return res.appointment;
}

/**
 * Submits a contact inquiry to Firestore.
 */
export async function submitInquiryRecord(payload: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<ContactInquiry> {
  if (isFirebaseConfigured && db) {
    try {
      const ref = collection(db, 'contactInquiries');
      const docData = {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone?.trim() || '',
        subject: payload.subject?.trim() || 'General Inquiry',
        message: payload.message.trim(),
        status: 'unread',
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(ref, docData);
      return { id: docRef.id, ...docData } as ContactInquiry;
    } catch (err) {
      console.warn('Firestore submitInquiry error, falling back:', err);
    }
  }

  const res = await api.submitInquiry(payload);
  return res.inquiry;
}

/**
 * Submits a customer review with pending moderation status to Firestore.
 */
export async function submitReviewRecord(payload: {
  customerName: string;
  serviceCategory: string;
  serviceName: string;
  rating: number;
  reviewText: string;
}): Promise<Review> {
  if (isFirebaseConfigured && db) {
    try {
      const ref = collection(db, 'reviews');
      const reviewData = {
        customerName: payload.customerName.trim(),
        serviceCategory: payload.serviceCategory,
        serviceName: payload.serviceName,
        rating: Number(payload.rating),
        reviewText: payload.reviewText.trim(),
        reviewDate: new Date().toISOString().split('T')[0],
        moderationStatus: 'pending',
        isApproved: false,
        isSample: false,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(ref, reviewData);
      return { id: docRef.id, ...reviewData } as Review;
    } catch (err) {
      console.warn('Firestore submitReview error, falling back:', err);
    }
  }

  const res = await api.submitReview({
    serviceCategory: payload.serviceCategory,
    serviceName: payload.serviceName,
    rating: payload.rating,
    reviewText: payload.reviewText,
  });

  return res.review;
}

/**
 * Fetches reviews (approved only for public, all for admin moderation).
 */
export async function fetchReviews(approvedOnly: boolean = true): Promise<Review[]> {
  if (isFirebaseConfigured && db) {
    try {
      const ref = collection(db, 'reviews');
      const q = approvedOnly 
        ? query(ref, where('isApproved', '==', true))
        : query(ref);
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      if (list.length > 0) return list;
    } catch (err) {
      console.warn('Firestore fetchReviews error, falling back to API:', err);
    }
  }

  if (approvedOnly) {
    return api.getReviews();
  }
  return api.getAdminReviews();
}
