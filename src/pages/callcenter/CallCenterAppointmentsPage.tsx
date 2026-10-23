import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Appointment } from '../../types';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { CalendarCheck, Search, Phone, Calendar, Clock, ArrowRight } from 'lucide-react';

export const CallCenterAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.getAppointments()
      .then(res => setAppointments(Array.isArray(res) ? res : []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const filtered = safeAppointments.filter(a => 
    (a.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.customerPhone || '').includes(search) ||
    (a.bookingRef || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.serviceName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#252923]">Confirmed Appointments</h1>
          <p className="text-xs text-[#777A70]">Synchronized appointments across Call Center, Front Desk reception, and doctor schedules.</p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#777A70] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search booking ref, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E7E5DC] text-[11px] font-semibold text-[#777A70] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref & Date</th>
                <th className="py-3 px-4">Client Contact</th>
                <th className="py-3 px-4">Service Protocol</th>
                <th className="py-3 px-4">Room & Specialist</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#777A70]">Loading appointments...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#777A70]">No appointments found.</td>
                </tr>
              ) : (
                filtered.map(apt => (
                  <tr key={apt.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 tabular-nums">
                      <span className="font-bold text-[#1E3B2E] block">{apt.bookingRef}</span>
                      <span className="text-[11px] text-[#777A70]">{apt.appointmentDate} · {apt.timeSlot.split(' - ')[0]}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#252923] block">{apt.customerName}</span>
                      <a href={`tel:${apt.customerPhone}`} className="text-[11px] text-[#585B53] hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#1E3B2E]" />
                        <span>{apt.customerPhone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#585B53]">{apt.serviceName}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#1E3B2E] block">{apt.room || 'Consult 1'}</span>
                      <span className="text-[11px] text-[#777A70]">{apt.assignedStaffName || apt.staffName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#777A70]">{apt.bookingChannel || 'Phone Call'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md border ${
                        apt.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        apt.status === 'checked_in' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        apt.status === 'cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        'bg-stone-50 text-stone-800 border-stone-200'
                      }`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActive360CustomerId(apt.customerId || apt.userId || null)}
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

      <Customer360Drawer
        customerId={active360CustomerId}
        onClose={() => setActive360CustomerId(null)}
      />
    </div>
  );
};
