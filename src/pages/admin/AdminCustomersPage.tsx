import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Search, User, Calendar, IndianRupee, Eye, X, Phone, Mail, Sparkles, CheckCircle2, Clock, History } from 'lucide-react';
import { Appointment } from '../../types';

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  totalBookings: number;
  completedBookings: number;
  upcomingCount?: number;
  totalSpendInr: number;
  lastBooking: string;
  preferredService?: string;
}

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<{
    customer: any;
    appointments: Appointment[];
  } | null>(null);

  const loadCustomers = () => {
    setIsLoading(true);
    api.getAdminCustomers()
      .then(setCustomers)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleViewCustomer = async (id: string) => {
    try {
      const details = await api.getAdminCustomerDetails(id);
      setSelectedCustomerDetails(details);
    } catch (err: any) {
      alert(err.message || 'Error loading details.');
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.preferredService && c.preferredService.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalClients = customers.length;
  const totalLifetimeValue = customers.reduce((sum, c) => sum + (c.totalSpendInr || 0), 0);
  const totalCompletedTreatments = customers.reduce((sum, c) => sum + (c.completedBookings || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-4">
        <div>
          <h1 className="font-serif text-3xl text-[#214D3B] font-bold tracking-tight">
            Customer Dossier Database
          </h1>
          <p className="text-xs text-[#585B53] mt-0.5">
            Registered Begumpet sanctuary clientele, treatment frequency, lifetime value, and appointment history.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#777A70]">
            <span className="font-medium">Total Registered Clients</span>
            <User className="w-4 h-4 text-[#214D3B]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#214D3B] tabular-nums">
            {totalClients}
          </div>
          <p className="text-[11px] text-[#585B53]">In verified sanctuary directory</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#777A70]">
            <span className="font-medium">Client Lifetime Spending</span>
            <IndianRupee className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#214D3B] tabular-nums">
            ₹{totalLifetimeValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">Realized clinic collections</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#777A70]">
            <span className="font-medium">Completed Treatments</span>
            <CheckCircle2 className="w-4 h-4 text-[#2E6B50]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#252923] tabular-nums">
            {totalCompletedTreatments}
          </div>
          <p className="text-[11px] text-[#585B53]">Delivered by specialists</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#777A70] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client name, email, phone, or preferred service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E7E5DC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] text-[#585B53] border-b border-[#E7E5DC]">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Client Name</th>
                <th className="py-3 px-3.5 font-semibold">Contact Email & Phone</th>
                <th className="py-3 px-3.5 font-semibold">Preferred Service</th>
                <th className="py-3 px-3.5 font-semibold">Treatments Completed</th>
                <th className="py-3 px-3.5 font-semibold">Upcoming</th>
                <th className="py-3 px-3.5 font-semibold">Lifetime Spend</th>
                <th className="py-3 px-3.5 font-semibold">Registered</th>
                <th className="py-3 px-3.5 font-semibold text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#777A70]">
                    Loading customer directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#777A70]">
                    No client records matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    
                    <td className="py-3.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#214D3B] text-white flex items-center justify-center font-serif font-bold text-xs shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#252923]">{c.name}</p>
                          <span className="text-[10px] text-[#777A70]">ID: {c.id.slice(0, 10)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <p className="text-[#252923] font-medium">{c.email}</p>
                      <p className="text-[11px] text-[#777A70]">{c.phone}</p>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-[#F0EEE5] text-[#214D3B] rounded-md border border-[#E7E5DC]">
                        {c.preferredService || 'Hydra-Infusion Facial'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5 tabular-nums">
                      <span className="font-semibold text-[#252923]">
                        {c.completedBookings} completed
                      </span>
                      <span className="block text-[10px] text-[#777A70]">
                        {c.totalBookings} total booked
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5 tabular-nums">
                      <span className="font-semibold text-[#2E6B50]">
                        {c.upcomingCount || 0} scheduled
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5 tabular-nums">
                      <span className="font-bold text-[#214D3B] font-serif text-sm">
                        ₹{c.totalSpendInr.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5 text-[#777A70] tabular-nums">
                      {c.registrationDate}
                    </td>

                    <td className="py-3.5 px-3.5 text-right">
                      <button
                        onClick={() => handleViewCustomer(c.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#214D3B] bg-[#F4F9F6] border border-[#214D3B]/20 rounded-md hover:bg-[#214D3B] hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dossier</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Full Profile & Appointment History Modal */}
      {selectedCustomerDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setSelectedCustomerDetails(null)}
              className="absolute top-5 right-5 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#E7E5DC] pb-4">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                Begumpet Sanctuary Client Dossier
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#214D3B]">
                {selectedCustomerDetails.customer.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#585B53] mt-1">
                <span>Email: <strong className="text-[#252923]">{selectedCustomerDetails.customer.email}</strong></span>
                <span>Phone: <strong className="text-[#252923]">{selectedCustomerDetails.customer.phone}</strong></span>
                <span>Joined: <strong className="text-[#252923]">{selectedCustomerDetails.customer.createdAt?.split('T')[0]}</strong></span>
              </div>
            </div>

            {/* Lifetime Summary */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#E7E5DC]">
                <span className="text-[#777A70] block">Lifetime Value</span>
                <p className="font-serif font-bold text-lg text-[#214D3B] mt-0.5">
                  ₹{selectedCustomerDetails.appointments
                    .filter(a => a.status === 'completed' || a.paymentStatus === 'paid')
                    .reduce((sum, a) => sum + a.amountInr, 0)
                    .toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E7E5DC]">
                <span className="text-[#777A70] block">Total Sessions</span>
                <p className="font-serif font-bold text-lg text-[#252923] mt-0.5">
                  {selectedCustomerDetails.appointments.length}
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#E7E5DC]">
                <span className="text-[#777A70] block">Completed Treatments</span>
                <p className="font-serif font-bold text-lg text-emerald-800 mt-0.5">
                  {selectedCustomerDetails.appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>

            {/* Complete Appointments & Payment History */}
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#214D3B]">
                Appointment & Payment History
              </h3>

              {selectedCustomerDetails.appointments.length === 0 ? (
                <p className="text-xs text-[#777A70] bg-white p-6 rounded-xl border border-[#E7E5DC] text-center">
                  No appointment records found for this client.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {selectedCustomerDetails.appointments.map((apt) => (
                    <div key={apt.id} className="bg-white p-3.5 rounded-xl border border-[#E7E5DC] text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-semibold text-[#214D3B]">{apt.bookingRef}</span>
                          <span className="font-semibold text-sm text-[#252923]">{apt.serviceName}</span>
                        </div>
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

                      <div className="flex items-center justify-between text-[#777A70] text-[11px] tabular-nums">
                        <span>Date: {apt.appointmentDate} ({apt.timeSlot})</span>
                        <span>Specialist: {apt.staffName || 'Unassigned'}</span>
                        <span className="font-semibold text-[#214D3B]">
                          ₹{apt.amountInr.toLocaleString('en-IN')} ({apt.paymentStatus})
                        </span>
                      </div>

                      {apt.notes && (
                        <p className="text-[11px] text-[#585B53] bg-[#FAF9F5] p-2 rounded border border-[#E7E5DC]">
                          <strong className="text-[#214D3B]">Intake/Treatment Note:</strong> {apt.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E7E5DC] text-right">
              <button
                onClick={() => setSelectedCustomerDetails(null)}
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
