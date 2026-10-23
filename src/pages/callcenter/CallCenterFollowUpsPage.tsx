import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { FollowUp, Customer } from '../../types';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { 
  CalendarClock, 
  ClockAlert, 
  PhoneForwarded, 
  Search, 
  Phone, 
  CheckCircle2, 
  X, 
  Calendar, 
  Filter, 
  Clock, 
  ArrowRight,
  Plus
} from 'lucide-react';

export const CallCenterFollowUpsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'today';

  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [customDate, setCustomDate] = useState('2026-10-02');
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  // Complete Follow-up Modal
  const [completingFollowUp, setCompletingFollowUp] = useState<FollowUp | null>(null);
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [scheduleNextFollowUp, setScheduleNextFollowUp] = useState(false);
  const [nextFollowUpDate, setNextFollowUpDate] = useState('2026-10-05');
  const [nextFollowUpReason, setNextFollowUpReason] = useState('');

  const loadFollowUps = () => {
    setIsLoading(true);
    let period: string | undefined = undefined;
    if (activeTab === 'today') period = 'today';
    else if (activeTab === 'overdue') period = 'overdue';
    else if (activeTab === 'upcoming') period = 'upcoming';

    api.getFollowUps({ period })
      .then(res => setFollowUps(res))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadFollowUps();
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingFollowUp) return;

    try {
      // 1. Mark current follow-up completed
      await api.updateFollowUp(completingFollowUp.id, {
        status: 'completed',
        latestOutcome: completionRemarks
      });

      // 2. If user requested another callback, create a new record
      if (scheduleNextFollowUp && nextFollowUpDate) {
        await api.createFollowUp({
          customerId: completingFollowUp.customerId,
          customerName: completingFollowUp.customerName,
          customerPhone: completingFollowUp.customerPhone,
          type: completingFollowUp.type,
          dueDate: nextFollowUpDate,
          dueTime: '11:00 AM',
          reason: nextFollowUpReason || 'Continued follow-up',
          latestOutcome: 'Scheduled follow-up'
        });
      }

      setCompletingFollowUp(null);
      setCompletionRemarks('');
      setScheduleNextFollowUp(false);
      loadFollowUps();
    } catch (err: any) {
      alert(err.message || 'Failed to update follow-up.');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#252923]">Callback Queues & Scheduling</h1>
          <p className="text-xs text-[#777A70]">Follow up on client inquiries, consultations, and decisions without dropping prospects.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7E5DC] gap-6 text-xs font-semibold">
        <button
          onClick={() => handleTabChange('today')}
          className={`py-3 relative ${activeTab === 'today' ? 'text-[#1E3B2E] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1E3B2E]' : 'text-[#777A70]'}`}
        >
          Today's Callbacks
        </button>
        <button
          onClick={() => handleTabChange('overdue')}
          className={`py-3 relative ${activeTab === 'overdue' ? 'text-rose-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-rose-700' : 'text-[#777A70]'}`}
        >
          Overdue Tasks
        </button>
        <button
          onClick={() => handleTabChange('upcoming')}
          className={`py-3 relative ${activeTab === 'upcoming' ? 'text-[#1E3B2E] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1E3B2E]' : 'text-[#777A70]'}`}
        >
          Upcoming Pipeline
        </button>
        <button
          onClick={() => handleTabChange('all')}
          className={`py-3 relative ${activeTab === 'all' ? 'text-[#1E3B2E] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1E3B2E]' : 'text-[#777A70]'}`}
        >
          All Records
        </button>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E7E5DC] text-[11px] font-semibold text-[#777A70] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Due Date & Time</th>
                <th className="py-3 px-4">Client Contact</th>
                <th className="py-3 px-4">Reason / Protocol</th>
                <th className="py-3 px-4">Assigned Agent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#777A70]">Loading callback queues...</td>
                </tr>
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#777A70]">No callbacks in this view.</td>
                </tr>
              ) : (
                followUps.map(flw => (
                  <tr key={flw.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 tabular-nums">
                      <span className="font-semibold text-[#1E3B2E] block">{flw.dueDate}</span>
                      <span className="text-[11px] text-[#777A70]">{flw.dueTime || '11:00 AM'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#252923] block">{flw.customerName}</span>
                      <a href={`tel:${flw.customerPhone}`} className="text-[#1E3B2E] hover:underline flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{flw.customerPhone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-[#585B53] font-medium">{flw.reason}</p>
                      {flw.latestOutcome && (
                        <p className="text-[10px] text-[#777A70] italic">Latest: {flw.latestOutcome}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#777A70]">{flw.assignedEmployeeName}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md border ${
                        flw.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        flw.dueDate < '2026-10-02' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {flw.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {flw.status === 'pending' && (
                        <button
                          onClick={() => setCompletingFollowUp(flw)}
                          className="px-2.5 py-1 bg-[#1E3B2E] text-white rounded text-[11px] font-semibold hover:bg-[#2A5140] transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                      <button
                        onClick={() => setActive360CustomerId(flw.customerId)}
                        className="px-2.5 py-1 bg-[#FAF9F5] border border-[#DDD9CE] text-[#1E3B2E] rounded text-[11px] font-semibold hover:bg-[#F0EEE5]"
                      >
                        360 Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: COMPLETE FOLLOW-UP */}
      {completingFollowUp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E5DC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EEE5] pb-3">
              <h3 className="font-serif text-lg font-medium text-[#1E3B2E]">Complete Callback</h3>
              <button onClick={() => setCompletingFollowUp(null)} className="text-[#777A70]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#252923] mb-1">Call Remarks & Summary *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize the outcome of this call (e.g. Spoke with client, will visit next week)..."
                  value={completionRemarks}
                  onChange={(e) => setCompletionRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg"
                />
              </div>

              <div className="pt-2 border-t border-[#E7E5DC] space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleNextFollowUp}
                    onChange={(e) => setScheduleNextFollowUp(e.target.checked)}
                    className="rounded text-[#1E3B2E]"
                  />
                  <span className="font-semibold text-[#252923]">Schedule another follow-up callback</span>
                </label>

                {scheduleNextFollowUp && (
                  <div className="space-y-3 pl-5 border-l-2 border-[#1E3B2E]/20">
                    <div>
                      <label className="block font-medium text-[#252923] mb-1">Next Follow-up Date *</label>
                      <input
                        type="date"
                        required={scheduleNextFollowUp}
                        value={nextFollowUpDate}
                        onChange={(e) => setNextFollowUpDate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-[#DDD9CE] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#252923] mb-1">Reason for Next Callback</label>
                      <input
                        type="text"
                        placeholder="e.g. Confirm appointment time with spouse"
                        value={nextFollowUpReason}
                        onChange={(e) => setNextFollowUpReason(e.target.value)}
                        className="w-full px-3 py-1.5 border border-[#DDD9CE] rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompletingFollowUp(null)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-[#585B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E3B2E] text-white rounded-lg font-semibold hover:bg-[#2A5140]"
                >
                  Save & Complete
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
