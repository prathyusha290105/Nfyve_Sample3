import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/client';
import { 
  TreatmentSession, 
  PackageRecord, 
  Customer, 
  Staff, 
  Service,
  ServiceCategory,
  Appointment,
  Invoice,
  FollowUp,
  PaymentFollowUp
} from '../../types';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  IndianRupee, 
  Package as PackageIcon, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  FileText, 
  Stethoscope, 
  Check, 
  ArrowRight,
  Filter,
  Users
} from 'lucide-react';

// Operational date constant representing "Today" in clinic calendar
const OPERATIONAL_TODAY = '2026-10-02';

type DateFilterType = 'today' | 'tomorrow' | 'this_week' | 'this_month' | 'custom' | 'all';
type SortField = 'name' | 'nextAppointment' | 'outstandingBalance' | 'remainingSessions';
type SortDirection = 'asc' | 'desc';

interface CustomerSessionRow {
  customer: Customer;
  customerId: string;
  customerName: string;
  phone: string;
  packages: PackageRecord[];
  sessions: TreatmentSession[];
  appointments: Appointment[];
  invoices: Invoice[];
  serviceNames: string[];
  totalSessions: number;
  completedSessions: number;
  upcomingSessionsCount: number;
  remainingSessions: number;
  nextAppointment: {
    date: string;
    time: string;
    title: string;
    source: 'session' | 'appointment';
  } | null;
  paymentStatus: 'paid' | 'partially_paid' | 'pending' | 'postponed';
  outstandingBalance: number;
  totalBilled: number;
  totalPaid: number;
  lastSessionDate: string | null;
  hasActivePackage: boolean;
  requiresFollowUp: boolean;
}

export const FrontDeskSessionsPage: React.FC = () => {
  // Raw data from server
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [sessions, setSessions] = useState<TreatmentSession[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [paymentFollowUps, setPaymentFollowUps] = useState<PaymentFollowUp[]>([]);

  // Page state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState(OPERATIONAL_TODAY);
  const [customEndDate, setCustomEndDate] = useState(OPERATIONAL_TODAY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sessionStatusFilter, setSessionStatusFilter] = useState('all');
  const [packageStatusFilter, setPackageStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>('nextAppointment');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Customer Detail Drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  // Complete Session Modal
  const [completingSession, setCompletingSession] = useState<TreatmentSession | null>(null);
  const [primaryStaffId, setPrimaryStaffId] = useState('');
  const [secondaryStaffId, setSecondaryStaffId] = useState('');
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [scheduleNext, setScheduleNext] = useState(true);
  const [nextSessionDate, setNextSessionDate] = useState('2026-10-09');
  const [nextSessionTime, setNextSessionTime] = useState('10:00 AM - 11:00 AM');
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  // New Package Enrollment Modal
  const [isNewPackageOpen, setIsNewPackageOpen] = useState(false);
  const [pkgCustomerId, setPkgCustomerId] = useState('');
  const [pkgServiceId, setPkgServiceId] = useState('');
  const [pkgName, setPkgName] = useState('');
  const [pkgTotalSessions, setPkgTotalSessions] = useState(6);
  const [pkgPrice, setPkgPrice] = useState(24000);
  const [pkgDiscount, setPkgDiscount] = useState(2000);
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [custs, pkgs, ses, apts, invs, stf, srv, cat, pfu] = await Promise.all([
        api.getCustomers().catch(() => []),
        api.getPackages().catch(() => []),
        api.getSessions().catch(() => []),
        api.getAppointments().catch(() => []),
        api.getInvoices().catch(() => []),
        api.getStaff().catch(() => []),
        api.getServices().catch(() => []),
        api.getCategories().catch(() => []),
        api.getPaymentFollowUps().catch(() => [])
      ]);

      setCustomers(custs);
      setPackages(pkgs);
      setSessions(ses);
      setAppointments(apts);
      setInvoices(invs);
      setStaffList(stf);
      setServices(srv);
      setCategories(cat);
      setPaymentFollowUps(pfu);

      if (custs.length > 0 && !pkgCustomerId) {
        setPkgCustomerId(custs[0].id);
      }
      if (stf.length > 0 && !primaryStaffId) {
        setPrimaryStaffId(stf[0].id);
      }
      if (srv.length > 0 && !pkgServiceId) {
        setPkgServiceId(srv[0].id);
        setPkgName(`6-Session ${srv[0].name} Course`);
      }
    } catch (err: any) {
      console.error('Failed to load sessions dashboard data:', err);
      setError(err.message || 'Failed to retrieve package and session records.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update suggested package name when service changes
  const handleServiceChange = (serviceId: string) => {
    setPkgServiceId(serviceId);
    const srv = services.find(s => s.id === serviceId);
    if (srv) {
      setPkgName(`${pkgTotalSessions}-Session ${srv.name} Course`);
      if (srv.priceInr) {
        setPkgPrice(srv.priceInr * pkgTotalSessions * 0.9); // 10% course discount
      }
    }
  };

  // Helper date window calculation
  const dateRange = useMemo<{ start: string; end: string } | null>(() => {
    if (dateFilter === 'all') return null;
    if (dateFilter === 'today') return { start: OPERATIONAL_TODAY, end: OPERATIONAL_TODAY };
    if (dateFilter === 'tomorrow') {
      const t = new Date(OPERATIONAL_TODAY);
      t.setDate(t.getDate() + 1);
      const iso = t.toISOString().split('T')[0];
      return { start: iso, end: iso };
    }
    if (dateFilter === 'this_week') {
      return { start: '2026-09-28', end: '2026-10-04' };
    }
    if (dateFilter === 'this_month') {
      return { start: '2026-10-01', end: '2026-10-31' };
    }
    if (dateFilter === 'custom') {
      return { start: customStartDate, end: customEndDate };
    }
    return null;
  }, [dateFilter, customStartDate, customEndDate]);

  // Aggregate Customer-Level Rows
  const customerRows = useMemo<CustomerSessionRow[]>(() => {
    if (!customers || customers.length === 0) return [];

    return customers.map(cust => {
      // Find all packages for this customer (match by customerId or matching normalized phone)
      const custPackages = packages.filter(
        p => p.customerId === cust.id || (p.customerPhone && p.customerPhone === cust.phone)
      );

      // Find all treatment sessions for this customer
      const custSessions = sessions.filter(
        s => s.customerId === cust.id || custPackages.some(pkg => pkg.id === s.packageId)
      );

      // Find all appointments for this customer
      const custAppointments = appointments.filter(
        a => a.customerId === cust.id || (a.customerPhone && a.customerPhone === cust.phone)
      );

      // Find all invoices for this customer
      const custInvoices = invoices.filter(
        i => i.customerId === cust.id || (i.customerPhone && i.customerPhone === cust.phone)
      );

      // Unique Service / Package Names
      const nameSet = new Set<string>();
      custPackages.forEach(p => {
        if (p.packageName) nameSet.add(p.packageName);
        if (p.serviceName) nameSet.add(p.serviceName);
      });
      custSessions.forEach(s => {
        if (s.serviceName) nameSet.add(s.serviceName);
      });
      if (nameSet.size === 0 && cust.interestedServiceName) {
        nameSet.add(cust.interestedServiceName);
      }
      const serviceNames = Array.from(nameSet);

      // Total sessions, completed sessions, remaining sessions
      let totalSessions = 0;
      let completedSessions = 0;
      let remainingSessions = 0;

      if (custPackages.length > 0) {
        custPackages.forEach(p => {
          totalSessions += p.totalSessions || 0;
          completedSessions += p.completedSessions || 0;
          remainingSessions += p.remainingSessions !== undefined ? p.remainingSessions : Math.max(0, (p.totalSessions || 0) - (p.completedSessions || 0));
        });
      } else {
        completedSessions = custSessions.filter(s => s.status === 'completed').length;
        totalSessions = completedSessions + custSessions.filter(s => s.status === 'scheduled').length;
        remainingSessions = Math.max(0, totalSessions - completedSessions);
      }

      const upcomingSessionsCount = custSessions.filter(s => s.status === 'scheduled').length;

      // Determine next upcoming valid appointment or scheduled session
      const upcomingItems: { date: string; time: string; title: string; source: 'session' | 'appointment' }[] = [];

      custSessions
        .filter(s => s.status === 'scheduled' && s.scheduledDate)
        .forEach(s => {
          upcomingItems.push({
            date: s.scheduledDate,
            time: s.scheduledTime || 'Scheduled Slot',
            title: s.serviceName || s.packageName,
            source: 'session'
          });
        });

      custAppointments
        .filter(a => a.status !== 'cancelled' && a.status !== 'completed' && a.status !== 'no-show' && a.appointmentDate)
        .forEach(a => {
          upcomingItems.push({
            date: a.appointmentDate,
            time: a.timeSlot || 'Scheduled Slot',
            title: a.serviceName,
            source: 'appointment'
          });
        });

      upcomingItems.sort((a, b) => {
        const cmp = a.date.localeCompare(b.date);
        return cmp !== 0 ? cmp : a.time.localeCompare(b.time);
      });

      // Prefer future/today items if available
      const nextAppointment = upcomingItems.find(item => item.date >= OPERATIONAL_TODAY) || upcomingItems[0] || null;

      // Determine most recent completed session date
      const completedList = custSessions
        .filter(s => s.status === 'completed')
        .sort((a, b) => {
          const dateA = a.actualCompletedAt || a.scheduledDate || '';
          const dateB = b.actualCompletedAt || b.scheduledDate || '';
          return dateB.localeCompare(dateA);
        });
      const lastSessionDate = completedList.length > 0
        ? (completedList[0].actualCompletedAt?.split('T')[0] || completedList[0].scheduledDate)
        : null;

      // Financials
      let totalBilled = 0;
      let totalPaid = 0;
      let outstandingBalance = 0;

      if (custInvoices.length > 0) {
        custInvoices.forEach(inv => {
          totalBilled += inv.finalBilledAmount || 0;
          totalPaid += inv.paidAmount || 0;
          outstandingBalance += inv.outstandingBalance || 0;
        });
      } else if (custPackages.length > 0) {
        custPackages.forEach(p => {
          const price = (p.packagePrice || 0) - (p.discount || 0);
          totalBilled += price;
          // If invoice not linked, assume active package has partial balance
          outstandingBalance += p.packageStatus === 'completed' ? 0 : Math.round(price * 0.3);
          totalPaid += price - outstandingBalance;
        });
      }

      // Payment Status
      const hasPostponement = custInvoices.some(i => i.status === 'payment_postponed') ||
        paymentFollowUps.some(pf => pf.customerId === cust.id && pf.status === 'pending');

      let paymentStatus: 'paid' | 'partially_paid' | 'pending' | 'postponed' = 'paid';
      if (hasPostponement) {
        paymentStatus = 'postponed';
      } else if (outstandingBalance > 0 && totalPaid > 0) {
        paymentStatus = 'partially_paid';
      } else if (outstandingBalance > 0) {
        paymentStatus = 'pending';
      } else {
        paymentStatus = 'paid';
      }

      const hasActivePackage = custPackages.some(p => p.packageStatus === 'active');
      const requiresFollowUp = 
        cust.lifecycleStatus === 'followup_required' ||
        hasPostponement ||
        custSessions.some(s => s.status === 'scheduled' && s.scheduledDate < OPERATIONAL_TODAY);

      return {
        customer: cust,
        customerId: cust.id,
        customerName: cust.name,
        phone: cust.phone,
        packages: custPackages,
        sessions: custSessions,
        appointments: custAppointments,
        invoices: custInvoices,
        serviceNames,
        totalSessions,
        completedSessions,
        upcomingSessionsCount,
        remainingSessions,
        nextAppointment,
        paymentStatus,
        outstandingBalance,
        totalBilled,
        totalPaid,
        lastSessionDate,
        hasActivePackage,
        requiresFollowUp
      };
    });
  }, [customers, packages, sessions, appointments, invoices, paymentFollowUps]);

  // Top Live Summary Metrics
  const summaryMetrics = useMemo(() => {
    // 1. Total Customers with Packages
    const customersWithPackages = customerRows.filter(r => r.packages.length > 0);

    // 2. Active Packages
    const activePackagesCount = packages.filter(p => p.packageStatus === 'active').length;

    // 3 & 4. Sessions Scheduled & Completed for selected date/range
    let scheduledInWindow = 0;
    let completedInWindow = 0;

    sessions.forEach(s => {
      const sDate = s.scheduledDate;
      const cDate = s.actualCompletedAt?.split('T')[0] || s.scheduledDate;

      if (dateRange) {
        if (s.status === 'scheduled' && sDate >= dateRange.start && sDate <= dateRange.end) {
          scheduledInWindow++;
        }
        if (s.status === 'completed' && cDate >= dateRange.start && cDate <= dateRange.end) {
          completedInWindow++;
        }
      } else {
        // When 'all' dates selected, show scheduled today or total
        if (s.status === 'scheduled' && sDate === OPERATIONAL_TODAY) {
          scheduledInWindow++;
        }
        if (s.status === 'completed' && cDate === OPERATIONAL_TODAY) {
          completedInWindow++;
        }
      }
    });

    // 5. Customers with Outstanding Payments
    const customersWithDebt = customerRows.filter(r => r.outstandingBalance > 0);

    // 6. Customers Requiring Follow-up
    const customersNeedingFollowUp = customerRows.filter(r => r.requiresFollowUp);

    return {
      totalCustomersWithPackages: customersWithPackages.length,
      activePackages: activePackagesCount,
      sessionsScheduled: scheduledInWindow,
      sessionsCompleted: completedInWindow,
      customersWithDebt: customersWithDebt.length,
      customersRequiringFollowUp: customersNeedingFollowUp.length
    };
  }, [customerRows, packages, sessions, dateRange]);

  // Multi-Filter Filtering Logic
  const filteredRows = useMemo(() => {
    return customerRows.filter(row => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = row.customerName.toLowerCase().includes(q);
        const matchesPhone = row.phone.toLowerCase().includes(q);
        const matchesId = row.customerId.toLowerCase().includes(q);
        const matchesPackage = row.packages.some(p => p.packageName.toLowerCase().includes(q));
        const matchesBookingRef = row.appointments.some(a => a.bookingRef && a.bookingRef.toLowerCase().includes(q));
        const matchesInvoice = row.invoices.some(i => i.invoiceNumber && i.invoiceNumber.toLowerCase().includes(q));

        if (!matchesName && !matchesPhone && !matchesId && !matchesPackage && !matchesBookingRef && !matchesInvoice) {
          return false;
        }
      }

      // 2. Date Filter
      if (dateRange) {
        // Customer matches if they have a session or appointment in this date range
        const hasSessionInRange = row.sessions.some(
          s => s.scheduledDate >= dateRange.start && s.scheduledDate <= dateRange.end
        );
        const hasAppointmentInRange = row.appointments.some(
          a => a.appointmentDate >= dateRange.start && a.appointmentDate <= dateRange.end
        );
        const hasCompletedInRange = row.sessions.some(s => {
          const compDate = s.actualCompletedAt?.split('T')[0] || s.scheduledDate;
          return s.status === 'completed' && compDate >= dateRange.start && compDate <= dateRange.end;
        });

        if (!hasSessionInRange && !hasAppointmentInRange && !hasCompletedInRange) {
          return false;
        }
      }

      // 3. Service Category Filter
      if (selectedCategory !== 'all') {
        const cat = selectedCategory.toLowerCase();
        const matchesCat = row.serviceNames.some(name => name.toLowerCase().includes(cat)) ||
          row.packages.some(p => p.serviceName?.toLowerCase().includes(cat) || p.packageName?.toLowerCase().includes(cat));
        if (!matchesCat) return false;
      }

      // 4. Session Status Filter
      if (sessionStatusFilter !== 'all') {
        const hasMatchingSession = row.sessions.some(s => s.status === sessionStatusFilter);
        if (!hasMatchingSession) return false;
      }

      // 5. Package Status Filter
      if (packageStatusFilter !== 'all') {
        if (packageStatusFilter === 'active') {
          if (!row.packages.some(p => p.packageStatus === 'active')) return false;
        } else if (packageStatusFilter === 'completed') {
          if (!row.packages.some(p => p.packageStatus === 'completed')) return false;
        } else if (packageStatusFilter === 'expired') {
          if (!row.packages.some(p => p.packageStatus === 'expired' || p.packageStatus === 'cancelled')) return false;
        }
      }

      // 6. Payment Status Filter
      if (paymentStatusFilter !== 'all') {
        if (paymentStatusFilter === 'paid' && row.paymentStatus !== 'paid') return false;
        if (paymentStatusFilter === 'partially_paid' && row.paymentStatus !== 'partially_paid') return false;
        if (paymentStatusFilter === 'pending' && row.paymentStatus !== 'pending') return false;
        if (paymentStatusFilter === 'postponed' && row.paymentStatus !== 'postponed') return false;
      }

      return true;
    });
  }, [customerRows, searchQuery, dateRange, selectedCategory, sessionStatusFilter, packageStatusFilter, paymentStatusFilter]);

  // Sorting
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortField === 'nextAppointment') {
        const dateA = a.nextAppointment?.date || '9999-99-99';
        const dateB = b.nextAppointment?.date || '9999-99-99';
        comparison = dateA.localeCompare(dateB);
      } else if (sortField === 'outstandingBalance') {
        comparison = b.outstandingBalance - a.outstandingBalance;
      } else if (sortField === 'remainingSessions') {
        comparison = b.remainingSessions - a.remainingSessions;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredRows, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, selectedCategory, sessionStatusFilter, packageStatusFilter, paymentStatusFilter, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleClearFilters = () => {
    setDateFilter('all');
    setSearchQuery('');
    setSelectedCategory('all');
    setSessionStatusFilter('all');
    setPackageStatusFilter('all');
    setPaymentStatusFilter('all');
    setSortField('nextAppointment');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  // Open Complete Session Modal
  const handleOpenCompleteModal = (s: TreatmentSession) => {
    setCompletingSession(s);
    setPrimaryStaffId(s.primaryStaffId || (staffList[0]?.id || ''));
    setSecondaryStaffId(s.secondaryStaffId || '');
    setCompletionRemarks(s.remarks || '');
    setScheduleNext(true);
    setNextSessionDate('2026-10-09');
    setNextSessionTime('10:00 AM - 11:00 AM');
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingSession) return;

    const primStaff = staffList.find(st => st.id === primaryStaffId);
    const secStaff = staffList.find(st => st.id === secondaryStaffId);

    setIsSubmittingComplete(true);
    try {
      await api.completeSession(completingSession.id, {
        actualCompletedAt: new Date().toISOString(),
        primaryStaffId: primStaff?.id || 'st-1',
        primaryStaffName: primStaff?.name || 'Dr. Ananya Reddy',
        secondaryStaffId: secStaff?.id,
        secondaryStaffName: secStaff?.name,
        remarks: completionRemarks || 'Clinical treatment delivered in sanctuary chamber.',
        nextSessionDate: scheduleNext ? nextSessionDate : undefined,
        nextSessionTime: scheduleNext ? nextSessionTime : undefined
      });

      showToast(`Session #${completingSession.sessionNumber} marked completed! Package balance recalculated.`);
      setCompletingSession(null);
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Failed to complete session.');
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  // Enroll New Package Submission
  const handleEnrollPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === pkgCustomerId);
    if (!cust) return;
    const srv = services.find(s => s.id === pkgServiceId);

    setIsSubmittingPackage(true);
    try {
      await api.createPackage({
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        serviceId: srv?.id || 'srv-1',
        serviceName: srv?.name || 'Clinical Transformation',
        packageName: pkgName || `${pkgTotalSessions}-Session Transformation Course`,
        purchaseDate: OPERATIONAL_TODAY,
        totalSessions: Number(pkgTotalSessions),
        packagePrice: Number(pkgPrice),
        discount: Number(pkgDiscount),
        packageStatus: 'active'
      });

      showToast(`Enrolled ${cust.name} in ${pkgName}!`);
      setIsNewPackageOpen(false);
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Failed to enroll package.');
    } finally {
      setIsSubmittingPackage(false);
    }
  };

  // Currently inspected customer for details drawer
  const activeCustomerRow = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customerRows.find(r => r.customerId === selectedCustomerId) || null;
  }, [customerRows, selectedCustomerId]);

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full text-[#252923]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E3B2E] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#2A5140] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E3B2E] tracking-tight">
            Package & Session Operations
          </h1>
          <p className="text-xs text-[#777A70] mt-1 max-w-2xl">
            Manage customer packages, completed sessions, attendance, payments, and upcoming appointments.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#DDD9CE] hover:border-[#1E3B2E] text-[#585B53] hover:text-[#1E3B2E] rounded-xl text-xs font-semibold transition-colors shadow-2xs"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#1E3B2E]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              if (selectedCustomerId) {
                setPkgCustomerId(selectedCustomerId);
              }
              setIsNewPackageOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3B2E] text-white rounded-xl text-xs font-semibold hover:bg-[#2A5140] transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Package</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData()}
            className="px-3 py-1 bg-white border border-rose-300 rounded font-semibold text-rose-700 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#777A70]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Clients</span>
            <Users className="w-4 h-4 text-[#1E3B2E]" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#1E3B2E] tabular-nums">
            {summaryMetrics.totalCustomersWithPackages}
          </div>
          <p className="text-[10px] text-[#777A70]">With package courses</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#777A70]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Packages</span>
            <PackageIcon className="w-4 h-4 text-[#1E3B2E]" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#1E3B2E] tabular-nums">
            {summaryMetrics.activePackages}
          </div>
          <p className="text-[10px] text-[#777A70]">In active delivery</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#777A70]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Scheduled</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-blue-900 tabular-nums">
            {summaryMetrics.sessionsScheduled}
          </div>
          <p className="text-[10px] text-[#777A70]">
            {dateFilter === 'all' ? 'Scheduled today' : 'In selected date'}
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#777A70]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-800 tabular-nums">
            {summaryMetrics.sessionsCompleted}
          </div>
          <p className="text-[10px] text-[#777A70]">
            {dateFilter === 'all' ? 'Completed today' : 'In selected date'}
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#777A70]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Balance</span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-amber-900 tabular-nums">
            {summaryMetrics.customersWithDebt}
          </div>
          <p className="text-[10px] text-[#777A70]">Clients with dues</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#777A70]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Follow-up Due</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-purple-900 tabular-nums">
            {summaryMetrics.customersRequiringFollowUp}
          </div>
          <p className="text-[10px] text-[#777A70]">Action required</p>
        </div>
      </div>

      {/* Multi-Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E7E5DC] p-5 shadow-2xs space-y-4">
        {/* Top Filter Row: Search & Date Range */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-[#777A70] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, phone, ID, booking ref, package..."
              className="w-full pl-10 pr-9 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl text-xs focus:outline-none focus:border-[#1E3B2E] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777A70] hover:text-[#252923]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Presets */}
          <div className="lg:col-span-7 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#777A70] mr-1">Date:</span>
            {[
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Today' },
              { id: 'tomorrow', label: 'Tomorrow' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'custom', label: 'Custom Range' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id as DateFilterType)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  dateFilter === tab.id
                    ? 'bg-[#1E3B2E] text-white shadow-xs'
                    : 'bg-[#FAF9F5] text-[#585B53] hover:bg-[#F0EEE5] border border-[#DDD9CE]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Pickers (if custom selected) */}
        {dateFilter === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#F0EEE5] text-xs">
            <span className="text-[#777A70] font-semibold">Custom Range:</span>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-[#585B53]">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 bg-white border border-[#DDD9CE] rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-[#585B53]">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 bg-white border border-[#DDD9CE] rounded-lg text-xs"
              />
            </div>
          </div>
        )}

        {/* Second Filter Row: Service, Session Status, Package Status, Payment Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#F0EEE5] text-xs">
          {/* Service / Category */}
          <div>
            <label className="block text-[11px] font-semibold text-[#777A70] mb-1">Service Specialty</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1E3B2E]"
            >
              <option value="all">All Services & Programs</option>
              <option value="slimming">Slimming & Weight Management</option>
              <option value="skin">Skin Aesthetics</option>
              <option value="hair">Hair Restoration</option>
              <option value="salon">Sanctuary Salon</option>
              <option value="gym">Gym & Fitness</option>
              <option value="nutrition">Clinical Nutrition</option>
              {categories.map(c => (
                <option key={c.id} value={c.name.toLowerCase()}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Session Status */}
          <div>
            <label className="block text-[11px] font-semibold text-[#777A70] mb-1">Session Status</label>
            <select
              value={sessionStatusFilter}
              onChange={(e) => setSessionStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1E3B2E]"
            >
              <option value="all">All Session Statuses</option>
              <option value="scheduled">Scheduled Sessions</option>
              <option value="completed">Completed Sessions</option>
              <option value="cancelled">Cancelled Sessions</option>
            </select>
          </div>

          {/* Package Status */}
          <div>
            <label className="block text-[11px] font-semibold text-[#777A70] mb-1">Package Course Status</label>
            <select
              value={packageStatusFilter}
              onChange={(e) => setPackageStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1E3B2E]"
            >
              <option value="all">All Package Statuses</option>
              <option value="active">Active Packages</option>
              <option value="completed">Completed Packages</option>
              <option value="expired">Expired / Paused</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-[11px] font-semibold text-[#777A70] mb-1">Payment Status</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1E3B2E]"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Fully Settled (Paid)</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="pending">Payment Pending</option>
              <option value="postponed">Payment Postponed</option>
            </select>
          </div>
        </div>

        {/* Filter Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F0EEE5] text-[11px]">
          <div className="text-[#585B53]">
            Showing <span className="font-bold text-[#1E3B2E]">{sortedRows.length}</span> of <span className="font-bold">{customerRows.length}</span> clients
            {dateFilter !== 'all' && (
              <span className="ml-2 text-[#777A70]">
                (Filtered by {dateFilter === 'custom' ? `${customStartDate} to ${customEndDate}` : dateFilter.replace('_', ' ')})
              </span>
            )}
          </div>

          {(searchQuery || dateFilter !== 'all' || selectedCategory !== 'all' || sessionStatusFilter !== 'all' || packageStatusFilter !== 'all' || paymentStatusFilter !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="text-[#1E3B2E] font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Customer Session Overview Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-medium text-[#1E3B2E]">
            Customer Session Overview
          </h2>
          <div className="text-xs text-[#777A70]">
            One record per client · Live package & session tracking
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-[#1E3B2E] animate-spin mx-auto" />
              <p className="text-xs text-[#777A70]">Retrieving customer session roster...</p>
            </div>
          ) : paginatedRows.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <PackageIcon className="w-8 h-8 text-[#777A70] mx-auto opacity-40" />
              <h3 className="font-serif text-base text-[#1E3B2E]">No matching customer records found</h3>
              <p className="text-xs text-[#777A70] max-w-sm mx-auto">
                No clients match your currently selected date range, search query, or status filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-2 px-4 py-2 bg-[#1E3B2E] text-white rounded-xl text-xs font-semibold hover:bg-[#2A5140]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F5] border-b border-[#E7E5DC] text-[11px] font-semibold text-[#777A70] uppercase tracking-wider">
                  <tr>
                    <th
                      onClick={() => handleSort('name')}
                      className="py-3 px-4 cursor-pointer hover:text-[#1E3B2E] select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Customer</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Services / Packages</th>
                    <th className="py-3 px-3 text-center">Total</th>
                    <th className="py-3 px-3 text-center">Done</th>
                    <th className="py-3 px-3 text-center">Upcoming</th>
                    <th
                      onClick={() => handleSort('remainingSessions')}
                      className="py-3 px-3 text-center cursor-pointer hover:text-[#1E3B2E] select-none"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Remaining</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('nextAppointment')}
                      className="py-3 px-4 cursor-pointer hover:text-[#1E3B2E] select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Next Appointment</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center">Payment</th>
                    <th
                      onClick={() => handleSort('outstandingBalance')}
                      className="py-3 px-4 text-right cursor-pointer hover:text-[#1E3B2E] select-none"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Outstanding</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center">Last Session</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EEE5]">
                  {paginatedRows.map(row => (
                    <tr
                      key={row.customerId}
                      onClick={() => setSelectedCustomerId(row.customerId)}
                      className="hover:bg-[#FAF9F5] transition-colors cursor-pointer group"
                    >
                      {/* Customer */}
                      <td className="py-3.5 px-4 font-semibold text-[#252923]">
                        <div className="font-bold text-[#1E3B2E] group-hover:text-[#2A5140] transition-colors">
                          {row.customerName}
                        </div>
                        <div className="text-[10px] text-[#777A70] font-mono tabular-nums">
                          {row.customerId}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-[#585B53] font-mono tabular-nums whitespace-nowrap">
                        {row.phone}
                      </td>

                      {/* Services / Packages */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        {row.serviceNames.length > 0 ? (
                          <div className="space-y-0.5">
                            <div className="font-medium text-[#252923] truncate" title={row.serviceNames[0]}>
                              {row.serviceNames[0]}
                            </div>
                            {row.serviceNames.length > 1 && (
                              <div className="text-[10px] text-[#777A70]">
                                +{row.serviceNames.length - 1} more package
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#777A70] italic">No active package</span>
                        )}
                      </td>

                      {/* Total Sessions */}
                      <td className="py-3.5 px-3 text-center font-semibold text-[#252923] font-mono tabular-nums">
                        {row.totalSessions}
                      </td>

                      {/* Completed */}
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-700 font-mono tabular-nums">
                        {row.completedSessions}
                      </td>

                      {/* Upcoming */}
                      <td className="py-3.5 px-3 text-center font-medium text-blue-700 font-mono tabular-nums">
                        {row.upcomingSessionsCount}
                      </td>

                      {/* Remaining */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono tabular-nums ${
                          row.remainingSessions > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {row.remainingSessions}
                        </span>
                      </td>

                      {/* Next Appointment */}
                      <td className="py-3.5 px-4 tabular-nums">
                        {row.nextAppointment ? (
                          <div>
                            <div className="font-semibold text-[#1E3B2E]">
                              {row.nextAppointment.date}
                            </div>
                            <div className="text-[10px] text-[#777A70] truncate max-w-[140px]" title={row.nextAppointment.title}>
                              {row.nextAppointment.time}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#777A70] text-[11px] italic">None scheduled</span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-3 text-center">
                        {row.paymentStatus === 'paid' && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Paid
                          </span>
                        )}
                        {row.paymentStatus === 'partially_paid' && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            Partial
                          </span>
                        )}
                        {row.paymentStatus === 'pending' && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                            Pending
                          </span>
                        )}
                        {row.paymentStatus === 'postponed' && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                            Postponed
                          </span>
                        )}
                      </td>

                      {/* Outstanding Balance */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold">
                        {row.outstandingBalance > 0 ? (
                          <span className="text-amber-800">₹{row.outstandingBalance.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-emerald-700">₹0</span>
                        )}
                      </td>

                      {/* Last Session */}
                      <td className="py-3.5 px-4 text-center font-mono tabular-nums text-[#585B53]">
                        {row.lastSessionDate || '—'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerId(row.customerId);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#FAF9F5] border border-[#DDD9CE] hover:bg-[#1E3B2E] hover:text-white hover:border-[#1E3B2E] text-[#1E3B2E] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Pagination */}
          {!isLoading && sortedRows.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-[#FAF9F5] border-t border-[#E7E5DC] text-xs">
              <div className="flex items-center gap-2 text-[#777A70]">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 bg-white border border-[#DDD9CE] rounded text-xs"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length} clients
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-[#DDD9CE] rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-[#1E3B2E]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-[#DDD9CE] rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOMER DETAIL DRAWER */}
      {activeCustomerRow && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-[#FAF9F5] w-full max-w-2xl h-full shadow-2xl border-l border-[#E7E5DC] flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 bg-white border-b border-[#E7E5DC] flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase rounded bg-[#FAF9F5] border border-[#DDD9CE] text-[#585B53]">
                    {activeCustomerRow.customerId}
                  </span>
                  <span className="text-xs text-[#777A70]">Lead Source: {activeCustomerRow.customer.leadSource}</span>
                </div>
                <h2 className="font-serif text-2xl font-medium text-[#1E3B2E]">
                  {activeCustomerRow.customerName}
                </h2>
                <div className="flex items-center gap-4 text-xs text-[#585B53] mt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#777A70]" />
                    {activeCustomerRow.phone}
                  </span>
                  {activeCustomerRow.customer.email && (
                    <span>{activeCustomerRow.customer.email}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const cid = activeCustomerRow.customerId;
                    setSelectedCustomerId(null);
                    setActive360CustomerId(cid);
                  }}
                  className="px-3 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#1E3B2E] rounded-lg text-xs font-semibold"
                >
                  Full 360
                </button>
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="p-1.5 text-[#777A70] hover:text-[#252923] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 gap-2 p-4 bg-white border-b border-[#E7E5DC] text-center text-xs">
              <div className="p-2 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC]">
                <span className="block text-[10px] text-[#777A70] uppercase">Packages</span>
                <span className="text-base font-bold text-[#1E3B2E] tabular-nums">{activeCustomerRow.packages.length}</span>
              </div>
              <div className="p-2 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC]">
                <span className="block text-[10px] text-[#777A70] uppercase">Delivered</span>
                <span className="text-base font-bold text-emerald-700 tabular-nums">{activeCustomerRow.completedSessions}</span>
              </div>
              <div className="p-2 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC]">
                <span className="block text-[10px] text-[#777A70] uppercase">Remaining</span>
                <span className="text-base font-bold text-[#1E3B2E] tabular-nums">{activeCustomerRow.remainingSessions}</span>
              </div>
              <div className="p-2 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC]">
                <span className="block text-[10px] text-[#777A70] uppercase">Balance Due</span>
                <span className="text-base font-bold text-amber-800 tabular-nums font-mono">
                  ₹{activeCustomerRow.outstandingBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Unique Client Packages Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-medium text-[#1E3B2E] flex items-center gap-2">
                    <PackageIcon className="w-4 h-4 text-[#1E3B2E]" />
                    <span>Enrolled Transformation Packages ({activeCustomerRow.packages.length})</span>
                  </h3>
                  <button
                    onClick={() => {
                      setPkgCustomerId(activeCustomerRow.customerId);
                      setIsNewPackageOpen(true);
                    }}
                    className="text-xs font-semibold text-[#1E3B2E] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Package</span>
                  </button>
                </div>

                {activeCustomerRow.packages.length === 0 ? (
                  <div className="p-4 bg-white rounded-xl border border-[#E7E5DC] text-center text-xs text-[#777A70]">
                    No formal course packages enrolled yet for this customer.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeCustomerRow.packages.map(pkg => {
                      const completed = pkg.completedSessions || 0;
                      const total = pkg.totalSessions || 1;
                      const pct = Math.min(100, Math.round((completed / total) * 100));
                      const price = (pkg.packagePrice || 0) - (pkg.discount || 0);

                      return (
                        <div key={pkg.id} className="p-4 bg-white rounded-xl border border-[#E7E5DC] shadow-2xs space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] text-[#777A70] uppercase font-bold block">{pkg.serviceName}</span>
                              <h4 className="font-serif font-bold text-base text-[#1E3B2E]">{pkg.packageName}</h4>
                              <p className="text-[11px] text-[#777A70]">
                                Purchased: {pkg.purchaseDate} {pkg.expiryDate && `· Valid until: ${pkg.expiryDate}`}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md border ${
                              pkg.packageStatus === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}>
                              {pkg.packageStatus}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-[#585B53]">
                              <span>Delivered: {completed} of {total} sessions</span>
                              <span className="font-bold">{pct}%</span>
                            </div>
                            <div className="w-full bg-[#FAF9F5] h-2 rounded-full overflow-hidden border border-[#E7E5DC]">
                              <div
                                className="bg-[#1E3B2E] h-full rounded-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>

                          {/* Package Financial Details */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#F0EEE5] text-[11px] text-[#777A70]">
                            <span>Package Investment: <strong className="text-[#252923] font-mono">₹{price.toLocaleString('en-IN')}</strong></span>
                            <span>Remaining: <strong className="text-[#1E3B2E] font-mono">{pkg.remainingSessions ?? (total - completed)} sessions</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Treatment Session Ledger */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-medium text-[#1E3B2E] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1E3B2E]" />
                    <span>Session Treatment Ledger ({activeCustomerRow.sessions.length})</span>
                  </h3>
                </div>

                {activeCustomerRow.sessions.length === 0 ? (
                  <div className="p-4 bg-white rounded-xl border border-[#E7E5DC] text-center text-xs text-[#777A70]">
                    No sessions logged yet for this client.
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-[#E7E5DC] shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF9F5] border-b border-[#E7E5DC] text-[10px] font-semibold text-[#777A70] uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Session #</th>
                            <th className="py-2.5 px-3">Protocol</th>
                            <th className="py-2.5 px-3">Scheduled</th>
                            <th className="py-2.5 px-3">Practitioner</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EEE5]">
                          {activeCustomerRow.sessions.map(s => (
                            <tr key={s.id} className="hover:bg-[#FAF9F5]">
                              <td className="py-3 px-3 font-bold text-[#1E3B2E]">
                                #{s.sessionNumber}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-medium text-[#252923]">{s.serviceName}</div>
                                {s.remarks && (
                                  <div className="text-[10px] text-[#777A70] truncate max-w-[140px]" title={s.remarks}>
                                    Note: {s.remarks}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 tabular-nums text-[#585B53]">
                                <div>{s.scheduledDate}</div>
                                <div className="text-[10px] text-[#777A70]">{s.scheduledTime}</div>
                              </td>
                              <td className="py-3 px-3 text-[#585B53]">
                                {s.primaryStaffName}
                                {s.secondaryStaffName && ` & ${s.secondaryStaffName}`}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md border ${
                                  s.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}>
                                  {s.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                {s.status !== 'completed' ? (
                                  <button
                                    onClick={() => handleOpenCompleteModal(s)}
                                    className="px-2.5 py-1 bg-[#1E3B2E] text-white rounded text-[11px] font-semibold hover:bg-[#2A5140] transition-colors"
                                  >
                                    Complete
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-emerald-700 font-semibold">✓ Done</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Appointments */}
              {activeCustomerRow.appointments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-serif text-base font-medium text-[#1E3B2E] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1E3B2E]" />
                    <span>Linked Appointments ({activeCustomerRow.appointments.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {activeCustomerRow.appointments.map(apt => (
                      <div key={apt.id} className="p-3 bg-white rounded-xl border border-[#E7E5DC] flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-[#1E3B2E]">{apt.serviceName}</div>
                          <div className="text-[11px] text-[#777A70]">
                            {apt.appointmentDate} · {apt.timeSlot} · Room: {apt.room || 'General'}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-stone-100 text-[#585B53]">
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMPLETE SESSION & SCHEDULE NEXT */}
      {completingSession && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#1E3B2E]">Record Session Completion</h3>
                <p className="text-xs text-[#777A70]">
                  Session #{completingSession.sessionNumber} · {completingSession.customerName} ({completingSession.serviceName})
                </p>
              </div>
              <button onClick={() => setCompletingSession(null)} className="text-[#777A70] hover:text-[#252923]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Primary Practitioner *</label>
                  <select
                    value={primaryStaffId}
                    onChange={(e) => setPrimaryStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  >
                    {staffList.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Assisting Specialist (Optional)</label>
                  <select
                    value={secondaryStaffId}
                    onChange={(e) => setSecondaryStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  >
                    <option value="">None / Solo Delivery</option>
                    {staffList.filter(s => s.id !== primaryStaffId).map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Treatment & Clinical Notes *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Clinical observations, energy parameters utilized, patient response..."
                  value={completionRemarks}
                  onChange={(e) => setCompletionRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              {/* Next Session Scheduling Option */}
              <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1E3B2E]">
                  <input
                    type="checkbox"
                    checked={scheduleNext}
                    onChange={(e) => setScheduleNext(e.target.checked)}
                    className="rounded text-[#1E3B2E]"
                  />
                  <span>Prompt & Schedule Next Treatment Session Immediately</span>
                </label>

                {scheduleNext && (
                  <div className="grid grid-cols-2 gap-3 pl-5 border-l-2 border-[#1E3B2E]/20">
                    <div>
                      <label className="block text-[11px] text-[#585B53] mb-1">Next Session Date</label>
                      <input
                        type="date"
                        value={nextSessionDate}
                        onChange={(e) => setNextSessionDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#DDD9CE] rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#585B53] mb-1">Next Session Time Slot</label>
                      <select
                        value={nextSessionTime}
                        onChange={(e) => setNextSessionTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#DDD9CE] rounded-lg bg-white"
                      >
                        <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                        <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                        <option value="10:30 AM - 11:30 AM">10:30 AM - 11:30 AM</option>
                        <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                        <option value="02:30 PM - 03:30 PM">02:30 PM - 03:30 PM</option>
                        <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompletingSession(null)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53] hover:bg-[#FAF9F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingComplete}
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140] transition-colors"
                >
                  {isSubmittingComplete ? 'Updating Ledger...' : 'Confirm Completion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ENROLL NEW PACKAGE */}
      {isNewPackageOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#1E3B2E]">Enroll Transformation Package</h3>
              <button onClick={() => setIsNewPackageOpen(false)} className="text-[#777A70] hover:text-[#252923]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollPackage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252923] mb-1">Customer *</label>
                <select
                  value={pkgCustomerId}
                  onChange={(e) => setPkgCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Service Program *</label>
                <select
                  value={pkgServiceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.categoryName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Session Hydra-Glow Restoration Package"
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Total Sessions</label>
                  <input
                    type="number"
                    min="1"
                    value={pkgTotalSessions}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      setPkgTotalSessions(num);
                      const srv = services.find(s => s.id === pkgServiceId);
                      if (srv) {
                        setPkgName(`${num}-Session ${srv.name} Course`);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    value={pkgDiscount}
                    onChange={(e) => setPkgDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPackageOpen(false)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53] hover:bg-[#FAF9F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPackage}
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140] transition-colors"
                >
                  {isSubmittingPackage ? 'Enrolling...' : 'Enroll Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer 360 Drawer */}
      <Customer360Drawer
        customerId={active360CustomerId}
        onClose={() => setActive360CustomerId(null)}
      />
    </div>
  );
};
