import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Appointment } from '../../types';
import { 
  Users, 
  Search, 
  Calendar, 
  FileText, 
  Phone, 
  Mail, 
  X, 
  Clock, 
  Sparkles,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface ClientRecord {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  appointments: Appointment[];
  totalSessions: number;
  completedSessions: number;
  lastSessionDate: string;
  recentService: string;
}

export const StaffClientsPage: React.FC = () => {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const apts = await api.getStaffAppointments();
      
      // Group by client
      const map: Record<string, ClientRecord> = {};
      apts.forEach(a => {
        const key = a.customerEmail || a.customerPhone || a.customerName;
        if (!map[key]) {
          map[key] = {
            customerId: a.userId,
            name: a.customerName,
            email: a.customerEmail,
            phone: a.customerPhone,
            appointments: [],
            totalSessions: 0,
            completedSessions: 0,
            lastSessionDate: a.appointmentDate,
            recentService: a.serviceName,
          };
        }
        map[key].appointments.push(a);
        map[key].totalSessions += 1;
        if (a.status === 'completed') map[key].completedSessions += 1;
        if (a.appointmentDate > map[key].lastSessionDate) {
          map[key].lastSessionDate = a.appointmentDate;
          map[key].recentService = a.serviceName;
        }
      });

      setClients(Object.values(map));
    } catch (err) {
      console.error('Error loading client list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.recentService.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-4">
        <div>
          <h1 className="font-serif text-3xl text-[#214D3B] font-bold tracking-tight">
            My Client Dossiers
          </h1>
          <p className="text-xs text-[#585B53] mt-0.5">
            Personalized client care directory, visit histories, and ongoing treatment observations.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#585B53] text-xs font-semibold rounded-lg transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Dossiers</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#777A70] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client name, email, phone, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[#777A70]">
          Loading client dossiers...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-[#E7E5DC] text-center space-y-2">
          <Users className="w-8 h-8 text-[#777A70] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#214D3B]">No client records found</h3>
          <p className="text-xs text-[#777A70]">
            Clients will automatically appear here once sessions are assigned to your schedule.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs hover:border-[#214D3B]/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#214D3B] text-white flex items-center justify-center font-serif font-bold text-sm shrink-0">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#252923]">{client.name}</h3>
                      <p className="text-[11px] text-[#777A70]">{client.phone}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#F0EEE5] text-[#214D3B] rounded-full">
                    {client.completedSessions} Finished
                  </span>
                </div>

                <div className="text-xs space-y-1 bg-[#FAF9F5] p-2.5 rounded-lg border border-[#E7E5DC]/60">
                  <div className="flex items-center justify-between text-[#585B53]">
                    <span>Recent Protocol:</span>
                    <span className="font-medium text-[#214D3B] text-right truncate max-w-[150px]">
                      {client.recentService}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#777A70] text-[11px]">
                    <span>Latest Visit:</span>
                    <span className="tabular-nums font-medium text-[#252923]">{client.lastSessionDate}</span>
                  </div>
                </div>

                {/* Show snippet of latest clinical notes if present */}
                {client.appointments.some(a => a.notes) && (
                  <div className="text-[11px] text-[#585B53] border-l-2 border-[#D4AF37] pl-2 line-clamp-2">
                    "{client.appointments.find(a => a.notes)?.notes}"
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedClient(client)}
                className="w-full py-2 bg-[#F4F9F6] hover:bg-[#214D3B] text-[#214D3B] hover:text-white font-semibold text-xs rounded-lg border border-[#214D3B]/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>View Full Care History ({client.totalSessions})</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Client Dossier & Full Session History */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute top-5 right-5 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#E7E5DC] pb-4">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                Practitioner Client Dossier
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#214D3B]">
                {selectedClient.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#777A70] mt-1">
                <span>Phone: <strong className="text-[#252923]">{selectedClient.phone}</strong></span>
                <span>Email: <strong className="text-[#252923]">{selectedClient.email}</strong></span>
                <span>Total Sessions: <strong className="text-[#214D3B]">{selectedClient.totalSessions}</strong></span>
              </div>
            </div>

            {/* Session Timeline */}
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                Consultation & Treatment Logs
              </h3>

              <div className="space-y-3">
                {selectedClient.appointments.map((apt) => (
                  <div key={apt.id} className="bg-white p-4 rounded-xl border border-[#E7E5DC] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#252923]">{apt.serviceName}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider ${
                        apt.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[#777A70] text-[11px] tabular-nums">
                      <span>Date: {apt.appointmentDate}</span>
                      <span>Slot: {apt.timeSlot}</span>
                      <span>Fee: ₹{apt.amountInr.toLocaleString('en-IN')}</span>
                    </div>

                    {apt.notes ? (
                      <div className="bg-[#FAF9F5] p-2.5 rounded-lg border border-[#E7E5DC] text-[#252923] text-xs">
                        <span className="font-semibold text-[#214D3B] block mb-0.5">Clinical Observation:</span>
                        {apt.notes}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#777A70] italic">
                        No specific clinical observations recorded for this session.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7E5DC] text-right">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-[#214D3B] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3e2f]"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
