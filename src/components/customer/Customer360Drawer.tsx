import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  Customer, 
  Appointment, 
  CallLog, 
  FollowUp, 
  Consultation, 
  PackageRecord, 
  TreatmentSession, 
  Invoice, 
  PaymentTransaction, 
  PaymentFollowUp,
  CustomerLifecycleStatus 
} from '../../types';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  CalendarCheck, 
  Clock, 
  Tag, 
  PhoneCall, 
  FileText, 
  IndianRupee, 
  Package, 
  Sparkles, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  MessageSquare,
  ShieldCheck,
  History
} from 'lucide-react';

interface Customer360DrawerProps {
  customerId: string | null;
  onClose: () => void;
  onBookAppointment?: (customer: Customer) => void;
  onLogCall?: (customer: Customer) => void;
  onScheduleFollowUp?: (customer: Customer) => void;
}

export const Customer360Drawer: React.FC<Customer360DrawerProps> = ({
  customerId,
  onClose,
  onBookAppointment,
  onLogCall,
  onScheduleFollowUp
}) => {
  const [data, setData] = useState<{
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
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'appointments' | 'consultations' | 'packages' | 'billing' | 'calls'>('timeline');

  useEffect(() => {
    if (!customerId) {
      setData(null);
      return;
    }

    setIsLoading(true);
    api.getCustomerById(customerId)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load customer 360 dossier:', err))
      .finally(() => setIsLoading(false));
  }, [customerId]);

  if (!customerId) return null;

  const getStatusBadge = (status: CustomerLifecycleStatus) => {
    const config: Record<CustomerLifecycleStatus, { label: string; color: string }> = {
      new_prospect: { label: 'New Prospect', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      contacted: { label: 'Contacted', color: 'bg-sky-50 text-sky-700 border-sky-200' },
      followup_required: { label: 'Follow-up Required', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      appointment_confirmed: { label: 'Appointment Confirmed', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      consultation_completed: { label: 'Consultation Completed', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      package_purchased: { label: 'Package Purchased', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      not_interested: { label: 'Not Interested', color: 'bg-stone-100 text-stone-600 border-stone-200' },
      unreachable: { label: 'Unreachable', color: 'bg-orange-50 text-orange-700 border-orange-200' },
      lost: { label: 'Lost Lead', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    };
    const c = config[status] || { label: status, color: 'bg-stone-50 text-stone-700 border-stone-200' };
    return (
      <span className={`px-2.5 py-0.5 text-[11px] font-semibold border rounded-full ${c.color}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="p-6 bg-[#1E3B2E] text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-serif font-medium">{data?.customer.name || 'Loading Dossier...'}</h2>
              {data && getStatusBadge(data.customer.lifecycleStatus)}
            </div>
            <p className="text-xs text-[#A8B8A0] flex items-center gap-4">
              <span>ID: <strong className="text-white">{data?.customer.id}</strong></span>
              <span>Lead: <strong className="text-white">{data?.customer.leadSource}</strong></span>
              <span>Enquiry: {data?.customer.createdAt.slice(0, 10)}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Contact & Action Ribbon */}
        {data && (
          <div className="px-6 py-3 bg-[#FAF9F5] border-b border-[#E7E5DC] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-[#585B53]">
              <a href={`tel:${data.customer.phone}`} className="flex items-center gap-1.5 font-semibold text-[#1E3B2E] hover:underline">
                <Phone className="w-3.5 h-3.5" />
                <span>{data.customer.phone}</span>
              </a>
              {data.customer.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{data.customer.email}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onBookAppointment && (
                <button
                  onClick={() => onBookAppointment(data.customer)}
                  className="px-3 py-1.5 bg-[#1E3B2E] text-white rounded-md text-xs font-semibold hover:bg-[#2A5140] transition-colors flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appt</span>
                </button>
              )}
              {onLogCall && (
                <button
                  onClick={() => onLogCall(data.customer)}
                  className="px-3 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] text-[#1E3B2E] rounded-md text-xs font-semibold hover:bg-[#F0EEE5] transition-colors flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Log Call</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 border-b border-[#E7E5DC] flex gap-6 text-xs font-semibold overflow-x-auto bg-white">
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`py-3 relative ${activeTab === 'timeline' ? 'text-[#1E3B2E] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1E3B2E]' : 'text-[#777A70] hover:text-[#252923]'}`}
          >
            Chronological Timeline
          </button>
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`py-3 relative ${activeTab === 'appointments' ? 'text-[#1E3B2E] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1E3B2E]' : 'text-[#777A70] hover:text-[#252923]'}`}
          >
            Appointments ({data?.appointments.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('consultations')}
            className={`py-3 relative ${activeTab === 'consultations' ? 'text-[#1E3B2E] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1E3B2E]' : 'text-[#777A70] hover:text-[#252923]'}`}
          >
            Consultations ({data?.consultations.length || 0})
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            className={`py-3 relative ${activeTab === 'packages' ? 'text-[#1E3B2E] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1E3B2E]' : 'text-[#777A70] hover:text-[#252923]'}`}
          >
            Packages & Sessions
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`py-3 relative ${activeTab === 'billing' ? 'text-[#1E3B2E] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1E3B2E]' : 'text-[#777A70] hover:text-[#252923]'}`}
          >
            Invoices & Payments
          </button>
          <button 
            onClick={() => setActiveTab('calls')}
            className={`py-3 relative ${activeTab === 'calls' ? 'text-[#1E3B2E] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1E3B2E]' : 'text-[#777A70] hover:text-[#252923]'}`}
          >
            Call History ({data?.callLogs.length || 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center text-xs text-[#777A70]">Loading client 360° dossier...</div>
          ) : !data ? (
            <div className="py-20 text-center text-xs text-rose-600">Could not retrieve dossier records.</div>
          ) : (
            <>
              {/* TAB 1: TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777A70]">Chronological Lifecycle Events</h3>
                  <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E7E5DC]">
                    {data.timeline.map((item) => (
                      <div key={item.id} className="relative group">
                        <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-[#1E3B2E] flex items-center justify-center" />
                        <div className="bg-[#FAF9F5] p-3.5 rounded-lg border border-[#E7E5DC] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1E3B2E]">{item.title}</span>
                            <span className="text-[11px] text-[#777A70] tabular-nums">{item.date.slice(0, 16).replace('T', ' ')}</span>
                          </div>
                          <p className="text-xs text-[#585B53]">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: APPOINTMENTS */}
              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777A70]">Appointment Ledger</h3>
                  {data.appointments.length === 0 ? (
                    <p className="text-xs text-[#777A70] py-6 text-center">No appointments on record.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.appointments.map(apt => (
                        <div key={apt.id} className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-[#1E3B2E]">{apt.serviceName}</span>
                            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-white border border-[#DDD9CE]">
                              {apt.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-[#585B53]">
                            <div>Ref: <strong className="text-[#252923]">{apt.bookingRef}</strong></div>
                            <div>Room: <strong className="text-[#252923]">{apt.room || 'Consult 1'}</strong></div>
                            <div>Date: <strong className="text-[#252923]">{apt.appointmentDate}</strong></div>
                            <div>Slot: <strong className="text-[#252923]">{apt.timeSlot}</strong></div>
                            <div>Specialist: <strong className="text-[#252923]">{apt.assignedStaffName || apt.staffName}</strong></div>
                            <div>Channel: <strong className="text-[#252923]">{apt.bookingChannel || 'Phone Call'}</strong></div>
                          </div>
                          {apt.notes && <p className="text-xs italic text-[#777A70] pt-1 border-t border-[#E7E5DC]">“{apt.notes}”</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CONSULTATIONS */}
              {activeTab === 'consultations' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777A70]">Doctor & Specialist Consultations</h3>
                  {data.consultations.length === 0 ? (
                    <p className="text-xs text-[#777A70] py-6 text-center">No consultations recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.consultations.map(c => (
                        <div key={c.id} className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-[#1E3B2E]">{c.serviceOfInterestName}</span>
                            <span className="text-[11px] text-[#777A70]">{c.consultationDate}</span>
                          </div>
                          <div className="text-xs text-[#585B53] space-y-1">
                            <p>Primary Attending: <strong>{c.primaryStaffName}</strong> {c.secondaryStaffName && `· Secondary: ${c.secondaryStaffName}`}</p>
                            <p>Outcome: <strong className="text-[#1E3B2E]">{c.outcome.replace(/_/g, ' ')}</strong></p>
                            {c.recommendedPackageOrService && (
                              <p>Recommended: <strong>{c.recommendedPackageOrService}</strong></p>
                            )}
                            <p className="italic text-[#777A70] bg-white p-2.5 rounded border border-[#E7E5DC]">“{c.remarks}”</p>
                            <p className="text-[11px] text-[#777A70]">Recorded by {c.recordedBy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PACKAGES & SESSIONS */}
              {activeTab === 'packages' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777A70] mb-3">Enrolled Packages</h3>
                    {data.packages.length === 0 ? (
                      <p className="text-xs text-[#777A70]">No packages enrolled.</p>
                    ) : (
                      <div className="space-y-3">
                        {data.packages.map(p => (
                          <div key={p.id} className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-serif font-semibold text-sm text-[#1E3B2E]">{p.packageName}</h4>
                              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 rounded">
                                {p.packageStatus}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center bg-white p-2.5 rounded-lg border border-[#E7E5DC]">
                              <div>
                                <span className="block text-[10px] text-[#777A70] uppercase">Total</span>
                                <span className="text-base font-bold text-[#1E3B2E]">{p.totalSessions}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-[#777A70] uppercase">Completed</span>
                                <span className="text-base font-bold text-emerald-700">{p.completedSessions}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-[#777A70] uppercase">Remaining</span>
                                <span className="text-base font-bold text-amber-700">{p.remainingSessions}</span>
                              </div>
                            </div>
                            <p className="text-xs text-[#777A70]">Enrolled: {p.purchaseDate} · Fee: ₹{p.packagePrice.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777A70] mb-3">Session Ledger</h3>
                    {data.sessions.length === 0 ? (
                      <p className="text-xs text-[#777A70]">No treatment sessions recorded.</p>
                    ) : (
                      <div className="space-y-2">
                        {data.sessions.map(s => (
                          <div key={s.id} className="p-3 bg-white rounded-lg border border-[#E7E5DC] flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-[#1E3B2E]">Session #{s.sessionNumber}</span>: {s.serviceName}
                              <p className="text-[11px] text-[#777A70]">Scheduled: {s.scheduledDate} · Specialist: {s.primaryStaffName}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase ${
                              s.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {s.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: BILLING & PAYMENTS */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777A70] mb-3">Invoices</h3>
                    {data.invoices.length === 0 ? (
                      <p className="text-xs text-[#777A70]">No invoices generated.</p>
                    ) : (
                      <div className="space-y-3">
                        {data.invoices.map(inv => (
                          <div key={inv.id} className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#1E3B2E]">{inv.invoiceNumber}</span>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded ${
                                inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {inv.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-[#585B53]">{inv.serviceOrPackageName}</p>
                            <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded border border-[#E7E5DC] text-xs">
                              <div>Billed: <strong>₹{inv.finalBilledAmount.toLocaleString('en-IN')}</strong></div>
                              <div>Paid: <strong className="text-emerald-700">₹{inv.paidAmount.toLocaleString('en-IN')}</strong></div>
                              <div>Balance: <strong className="text-rose-700">₹{inv.outstandingBalance.toLocaleString('en-IN')}</strong></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777A70] mb-3">Payment Receipts</h3>
                    {data.payments.length === 0 ? (
                      <p className="text-xs text-[#777A70]">No payment transactions on ledger.</p>
                    ) : (
                      <div className="space-y-2">
                        {data.payments.map(pay => (
                          <div key={pay.id} className="p-3 bg-white rounded-lg border border-[#E7E5DC] flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-[#1E3B2E]">₹{pay.amountReceived.toLocaleString('en-IN')}</span> via {pay.paymentMethod.toUpperCase()}
                              <p className="text-[11px] text-[#777A70]">Ref: {pay.transactionRef || 'Desk Collection'} · {pay.paymentDate.slice(0, 10)}</p>
                            </div>
                            <span className="text-[11px] text-[#777A70]">by {pay.recordedBy}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: CALLS & FOLLOW-UPS */}
              {activeTab === 'calls' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777A70]">Call Logs & Remarks</h3>
                  {data.callLogs.length === 0 ? (
                    <p className="text-xs text-[#777A70]">No calls logged yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.callLogs.map(log => (
                        <div key={log.id} className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#1E3B2E] uppercase">{log.outcome.replace(/_/g, ' ')}</span>
                            <span className="text-[11px] text-[#777A70]">{log.dateTime.slice(0, 16).replace('T', ' ')}</span>
                          </div>
                          <p className="text-[#585B53] bg-white p-2.5 rounded border border-[#E7E5DC]">“{log.remarks}”</p>
                          <p className="text-[11px] text-[#777A70]">Logged by {log.employeeName} {log.followUpDate && `· Follow-up scheduled: ${log.followUpDate}`}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
