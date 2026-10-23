import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  TreatmentSession, 
  PackageRecord, 
  Customer, 
  Staff, 
  Service 
} from '../../types';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { 
  Sparkles, 
  Plus, 
  Search, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight,
  Package
} from 'lucide-react';

export const FrontDeskSessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<TreatmentSession[]>([]);
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  // Complete Session Modal
  const [completingSession, setCompletingSession] = useState<TreatmentSession | null>(null);
  const [primaryStaffId, setPrimaryStaffId] = useState('');
  const [secondaryStaffId, setSecondaryStaffId] = useState('');
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [nextSessionDate, setNextSessionDate] = useState('2026-10-09');
  const [nextSessionTime, setNextSessionTime] = useState('10:00 AM - 11:00 AM');
  const [scheduleNext, setScheduleNext] = useState(true);

  // New Package Enrollment Modal
  const [isNewPackageOpen, setIsNewPackageOpen] = useState(false);
  const [pkgCustomerId, setPkgCustomerId] = useState('');
  const [pkgServiceName, setPkgServiceName] = useState('');
  const [pkgName, setPkgName] = useState('');
  const [pkgTotalSessions, setPkgTotalSessions] = useState(6);
  const [pkgPrice, setPkgPrice] = useState(25000);
  const [pkgDiscount, setPkgDiscount] = useState(2000);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ses, pkgs, custs, stf] = await Promise.all([
        api.getSessions(),
        api.getPackages(),
        api.getCustomers(),
        api.getStaff()
      ]);
      setSessions(ses);
      setPackages(pkgs);
      setCustomers(custs);
      setStaffList(stf);
      if (custs.length > 0) setPkgCustomerId(custs[0].id);
      if (stf.length > 0) setPrimaryStaffId(stf[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCompleteModal = (s: TreatmentSession) => {
    setCompletingSession(s);
    setPrimaryStaffId(s.primaryStaffId || (staffList[0]?.id || ''));
    setSecondaryStaffId('');
    setCompletionRemarks('');
    setScheduleNext(true);
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingSession) return;

    const primStaff = staffList.find(st => st.id === primaryStaffId);
    const secStaff = staffList.find(st => st.id === secondaryStaffId);

    try {
      await api.completeSession(completingSession.id, {
        actualCompletedAt: new Date().toISOString(),
        primaryStaffId: primStaff?.id || 'st-1',
        primaryStaffName: primStaff?.name || 'Practitioner',
        secondaryStaffId: secStaff?.id,
        secondaryStaffName: secStaff?.name,
        remarks: completionRemarks || 'Session delivered in sanctuary room.',
        nextSessionDate: scheduleNext ? nextSessionDate : undefined,
        nextSessionTime: scheduleNext ? nextSessionTime : undefined
      });

      alert(`Session #${completingSession.sessionNumber} marked completed! Package balance recalculated.`);
      setCompletingSession(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to complete session.');
    }
  };

  const handleEnrollPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === pkgCustomerId);
    if (!cust) return;

    try {
      await api.createPackage({
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        serviceId: 'srv-1',
        serviceName: pkgServiceName || 'Clinical Protocol',
        packageName: pkgName || `${pkgTotalSessions}-Session Transformation Course`,
        purchaseDate: '2026-10-02',
        totalSessions: Number(pkgTotalSessions),
        packagePrice: Number(pkgPrice),
        discount: Number(pkgDiscount),
        packageStatus: 'active'
      });

      setIsNewPackageOpen(false);
      loadData();
      alert(`Enrolled ${cust.name} into ${pkgName}!`);
    } catch (err: any) {
      alert(err.message || 'Failed to enroll package.');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#252923]">Package & Session Operations</h1>
          <p className="text-xs text-[#777A70]">Ledger-calculated remaining sessions, doctor/staff attendance, and next-session booking.</p>
        </div>

        <button
          onClick={() => setIsNewPackageOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3B2E] text-white rounded-xl text-xs font-semibold hover:bg-[#2A5140] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Package</span>
        </button>
      </div>

      {/* Package Roster Cards */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-medium text-[#1E3B2E]">Active Client Packages ({packages.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <div key={pkg.id} className="p-5 bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-[#777A70] uppercase font-bold block">{pkg.customerName}</span>
                  <h3 className="font-serif font-bold text-base text-[#1E3B2E]">{pkg.packageName}</h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-emerald-100 text-emerald-800">
                  {pkg.packageStatus}
                </span>
              </div>

              {/* Remaining Sessions Calculation Indicator */}
              <div className="grid grid-cols-3 gap-2 text-center bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E7E5DC]">
                <div>
                  <span className="block text-[10px] text-[#777A70] uppercase font-medium">Total</span>
                  <span className="text-base font-bold text-[#1E3B2E]">{pkg.totalSessions}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#777A70] uppercase font-medium">Done</span>
                  <span className="text-base font-bold text-emerald-700">{pkg.completedSessions}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#777A70] uppercase font-medium">Remaining</span>
                  <span className="text-base font-bold text-amber-700">{pkg.remainingSessions}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#777A70] pt-1">
                <span>Fee: ₹{pkg.packagePrice.toLocaleString('en-IN')}</span>
                <button
                  onClick={() => setActive360CustomerId(pkg.customerId)}
                  className="text-[#1E3B2E] font-semibold hover:underline"
                >
                  View Dossier →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions Ledger Table */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-medium text-[#1E3B2E]">Treatment Session Ledger ({sessions.length})</h2>
        <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-[#E7E5DC] text-[11px] font-semibold text-[#777A70] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Session #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Service Protocol</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Practitioner</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE5]">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1E3B2E]">
                      #{s.sessionNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#252923]">
                      {s.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-[#585B53] font-medium">
                      {s.serviceName}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      {s.scheduledDate} · {s.scheduledTime}
                    </td>
                    <td className="py-3.5 px-4 text-[#777A70]">
                      {s.primaryStaffName} {s.secondaryStaffName && `& ${s.secondaryStaffName}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md border ${
                        s.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {s.status !== 'completed' ? (
                        <button
                          onClick={() => handleOpenCompleteModal(s)}
                          className="px-3 py-1 bg-[#1E3B2E] text-white rounded text-[11px] font-semibold hover:bg-[#2A5140] transition-colors"
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">✓ Completed</span>
                      )}
                      <button
                        onClick={() => setActive360CustomerId(s.customerId)}
                        className="px-2 py-1 text-[#1E3B2E] hover:bg-[#F0EEE5] rounded text-[11px] font-semibold"
                      >
                        Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: COMPLETE SESSION & PROMPT NEXT SESSION */}
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
              <button onClick={() => setCompletingSession(null)} className="text-[#777A70]">
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
                  <label className="block font-semibold text-[#252923] mb-1">Assisting Practitioner (Optional)</label>
                  <select
                    value={secondaryStaffId}
                    onChange={(e) => setSecondaryStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                  >
                    <option value="">None / Solo</option>
                    {staffList.filter(s => s.id !== primaryStaffId).map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#252923] mb-1">Treatment Session Notes *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Clinical observations, energy levels, parameters utilized..."
                  value={completionRemarks}
                  onChange={(e) => setCompletionRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              {/* Next Session Scheduling Option */}
              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] space-y-3">
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
                      <label className="block text-[11px] text-[#585B53] mb-1">Next Session Slot</label>
                      <select
                        value={nextSessionTime}
                        onChange={(e) => setNextSessionTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-[#DDD9CE] rounded-lg bg-white"
                      >
                        <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
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
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140]"
                >
                  Confirm Completion
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
              <button onClick={() => setIsNewPackageOpen(false)} className="text-[#777A70]">
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
                    onChange={(e) => setPkgTotalSessions(Number(e.target.value))}
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
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140]"
                >
                  Enroll Package
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
