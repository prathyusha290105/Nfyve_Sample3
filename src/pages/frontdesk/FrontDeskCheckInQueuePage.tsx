import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Appointment, AppointmentStatus } from '../../types';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { 
  CheckSquare, 
  Clock, 
  User, 
  Phone, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const FrontDeskCheckInQueuePage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  const todayStr = '2026-10-02';

  const loadData = () => {
    setIsLoading(true);
    api.getAppointments({ date: todayStr })
      .then(res => setAppointments(res))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusTransition = async (id: string, status: AppointmentStatus) => {
    try {
      await api.updateAppointmentStatus(id, status);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Status transition failed.');
    }
  };

  const activeQueue = appointments.filter(a => 
    ['confirmed', 'checked_in', 'in_consultation', 'in_progress'].includes(a.status)
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#252923]">Reception Check-in Queue</h1>
          <p className="text-xs text-[#777A70]">Live progression: Confirmed → Checked In → In Consultation / Session → Completed.</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs font-semibold text-[#1E3B2E] hover:bg-[#F0EEE5]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E7E5DC] text-[11px] font-semibold text-[#777A70] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Time Slot</th>
                <th className="py-3 px-4">Client Name & Ref</th>
                <th className="py-3 px-4">Room & Specialist</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4 text-right">Advance Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#777A70]">Loading reception queue...</td>
                </tr>
              ) : activeQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#777A70]">No clients currently waiting or in session.</td>
                </tr>
              ) : (
                activeQueue.map(apt => (
                  <tr key={apt.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 tabular-nums font-semibold text-[#1E3B2E]">
                      {apt.timeSlot}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#252923] block">{apt.customerName}</span>
                      <span className="text-[10px] text-[#777A70]">{apt.bookingRef} · {apt.customerPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#1E3B2E] block">{apt.room || 'Consult 1'}</span>
                      <span className="text-[11px] text-[#777A70]">{apt.assignedStaffName || apt.staffName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#585B53]">{apt.serviceName}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${
                        apt.status === 'checked_in' ? 'bg-blue-100 text-blue-900 border-blue-200' :
                        apt.status === 'in_consultation' || apt.status === 'in_progress' ? 'bg-purple-100 text-purple-900 border-purple-200' :
                        'bg-amber-100 text-amber-900 border-amber-200'
                      }`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusTransition(apt.id, 'checked_in')}
                          className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          Check In
                        </button>
                      )}
                      {apt.status === 'checked_in' && (
                        <button
                          onClick={() => handleStatusTransition(apt.id, 'in_consultation')}
                          className="px-3 py-1.5 bg-purple-600 text-white font-semibold rounded text-xs hover:bg-purple-700 transition-colors"
                        >
                          Send to Room
                        </button>
                      )}
                      {(apt.status === 'in_consultation' || apt.status === 'in_progress') && (
                        <button
                          onClick={() => handleStatusTransition(apt.id, 'completed')}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded text-xs hover:bg-emerald-700 transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                      <button
                        onClick={() => setActive360CustomerId(apt.customerId || apt.userId || null)}
                        className="px-2 py-1 text-[#1E3B2E] hover:bg-[#F0EEE5] rounded text-xs font-semibold"
                      >
                        Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Customer360Drawer
        customerId={active360CustomerId}
        onClose={() => setActive360CustomerId(null)}
      />
    </div>
  );
};
