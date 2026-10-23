import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  Consultation, 
  Customer, 
  Staff, 
  Service, 
  Appointment, 
  ConsultationOutcome 
} from '../../types';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const FrontDeskConsultationsPage: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  // Record Consultation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [primaryStaffId, setPrimaryStaffId] = useState('');
  const [secondaryStaffId, setSecondaryStaffId] = useState('');
  const [managerName, setManagerName] = useState('');
  const [consultationDate, setConsultationDate] = useState('2026-10-02');
  const [timeSlot, setTimeSlot] = useState('10:30 AM - 11:30 AM');
  const [outcome, setOutcome] = useState<ConsultationOutcome>('completed_package_purchased');
  const [recommendedPackage, setRecommendedPackage] = useState('');
  const [remarks, setRemarks] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cns, custs, stf, srvs] = await Promise.all([
        api.getConsultations(),
        api.getCustomers(),
        api.getStaff(),
        api.getServices()
      ]);
      setConsultations(cns);
      setCustomers(custs);
      setStaffList(stf);
      setServices(srvs);
      if (custs.length > 0) setCustomerId(custs[0].id);
      if (srvs.length > 0) setServiceId(srvs[0].id);
      if (stf.length > 0) {
        setPrimaryStaffId(stf[0].id);
        if (stf.length > 1) setSecondaryStaffId(stf[1].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const targetCustomer = customers.find(c => c.id === customerId);
    const targetService = services.find(s => s.id === serviceId);
    const primStaff = staffList.find(s => s.id === primaryStaffId);
    const secStaff = staffList.find(s => s.id === secondaryStaffId);

    if (!targetCustomer || !primStaff || !targetService) {
      setFormError('Please select a customer, service, and primary attending specialist.');
      return;
    }

    try {
      await api.createConsultation({
        customerId: targetCustomer.id,
        customerName: targetCustomer.name,
        customerPhone: targetCustomer.phone,
        consultationDate,
        timeSlot,
        serviceOfInterestId: targetService.id,
        serviceOfInterestName: targetService.name,
        primaryStaffId: primStaff.id,
        primaryStaffName: primStaff.name,
        secondaryStaffId: secStaff?.id,
        secondaryStaffName: secStaff?.name,
        managerName: managerName || undefined,
        outcome,
        recommendedPackageOrService: recommendedPackage,
        remarks: remarks || 'Consultation concluded.',
        nextAction,
        nextFollowUpDate: nextFollowUpDate || undefined,
        completedAt: new Date().toISOString(),
        recordedBy: 'Sneha Rao (Front Desk)'
      });

      setIsModalOpen(false);
      setRemarks('');
      setRecommendedPackage('');
      setNextFollowUpDate('');
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to record consultation.');
    }
  };

  const filtered = consultations.filter(c => 
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.primaryStaffName.toLowerCase().includes(search.toLowerCase()) ||
    c.serviceOfInterestName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#252923]">Consultation Register</h1>
          <p className="text-xs text-[#777A70]">Document clinical diagnoses, recommendations, and up to two attending practitioners.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3B2E] text-white rounded-xl text-xs font-semibold hover:bg-[#2A5140] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Consultation</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E7E5DC] text-[11px] font-semibold text-[#777A70] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Client Contact</th>
                <th className="py-3 px-4">Service of Interest</th>
                <th className="py-3 px-4">Attending Specialists</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Recommendations & Notes</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#777A70]">Loading consultation logs...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#777A70]">No consultations recorded.</td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 tabular-nums">
                      <span className="font-bold text-[#1E3B2E] block">{c.consultationDate}</span>
                      <span className="text-[11px] text-[#777A70]">{c.timeSlot}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#252923] block">{c.customerName}</span>
                      <span className="text-[10px] text-[#777A70]">{c.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#585B53]">{c.serviceOfInterestName}</td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <span className="font-semibold text-[#1E3B2E] block">1. {c.primaryStaffName}</span>
                      {c.secondaryStaffName && (
                        <span className="text-[11px] text-[#585B53] block">2. {c.secondaryStaffName}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-[#E6EEE7] text-[#1E3B2E] border border-[#C5D5C8]">
                        {c.outcome.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#585B53] max-w-xs">
                      {c.recommendedPackageOrService && (
                        <p className="font-semibold text-[#1E3B2E]">{c.recommendedPackageOrService}</p>
                      )}
                      <p className="italic text-[#777A70]">“{c.remarks}”</p>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActive360CustomerId(c.customerId)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-[#FAF9F5] border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#1E3B2E] rounded inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: RECORD CONSULTATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#1E3B2E]">Record Clinical Consultation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#777A70]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Customer *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Service of Interest *</label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Two Attending Staff Members (Section 9 Requirement) */}
              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] space-y-3">
                <span className="font-semibold text-[#1E3B2E] block">Attending Practitioners (Up to 2)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#585B53] mb-1">Primary Staff *</label>
                    <select
                      value={primaryStaffId}
                      onChange={(e) => setPrimaryStaffId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg font-medium"
                    >
                      {staffList.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.roleTitle})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#585B53] mb-1">Secondary Staff (Optional)</label>
                    <select
                      value={secondaryStaffId}
                      onChange={(e) => setSecondaryStaffId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                    >
                      <option value="">None / Solo Practitioner</option>
                      {staffList.filter(s => s.id !== primaryStaffId).map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.roleTitle})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Consultation Date</label>
                  <input
                    type="date"
                    value={consultationDate}
                    onChange={(e) => setConsultationDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#252923] mb-1">Outcome *</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as ConsultationOutcome)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg font-semibold"
                  >
                    <option value="completed_package_purchased">Completed — Package Purchased</option>
                    <option value="completed_followup_required">Completed — Follow-up Required</option>
                    <option value="completed_not_interested">Completed — Not Interested</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="no_show">No-Show</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Recommended Treatment Protocol / Package</label>
                <input
                  type="text"
                  placeholder="e.g. 6-Session Hydra-Glow & Skin Barrier Restoration"
                  value={recommendedPackage}
                  onChange={(e) => setRecommendedPackage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Doctor Remarks & Clinical Notes *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Document diagnostics, contraindications, and tailored plan..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              {outcome === 'completed_followup_required' && (
                <div>
                  <label className="block font-semibold text-amber-800 mb-1">Next Follow-up Date (Callback will be queued)</label>
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140]"
                >
                  Save Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Customer360Drawer
        customerId={active360CustomerId}
        onClose={() => setActive360CustomerId(null)}
      />
    </div>
  );
};
