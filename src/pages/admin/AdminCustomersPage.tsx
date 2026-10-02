import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Search, User, Calendar, IndianRupee, Eye, X, Phone, Mail } from 'lucide-react';
import { Appointment } from '../../types';

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  totalBookings: number;
  completedBookings: number;
  totalSpendInr: number;
  lastBooking: string;
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
      c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-4">
        <div>
          <h1 className="font-serif text-3xl text-[#244B3A] font-medium tracking-tight">
            Customer Dossier Database
          </h1>
          <p className="text-xs text-[#777A70] mt-0.5">
            Registered Begumpet sanctuary clientele, treatment frequency, and lifetime value.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E5DC]">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#777A70] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs text-[#252923] focus:outline-none focus:border-[#244B3A]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-[#E7E5DC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] text-[#585B53] border-b border-[#E7E5DC]">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Client Name</th>
                <th className="py-3 px-3.5 font-semibold">Contact Info</th>
                <th className="py-3 px-3.5 font-semibold">Registration</th>
                <th className="py-3 px-3.5 font-semibold text-center">Bookings</th>
                <th className="py-3 px-3.5 font-semibold text-right">Lifetime Spend</th>
                <th className="py-3 px-3.5 font-semibold">Last Booking</th>
                <th className="py-3 px-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777A70]">
                    No client records match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E5E2D6] text-[#244B3A] font-serif font-semibold text-xs flex items-center justify-center shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-[#252923]">{c.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      <p className="text-[#252923]">{c.email}</p>
                      <p className="text-[11px] text-[#777A70]">{c.phone}</p>
                    </td>

                    <td className="py-3 px-3.5 tabular-nums text-[#585B53]">
                      {c.registrationDate}
                    </td>

                    <td className="py-3 px-3.5 text-center tabular-nums font-medium text-[#252923]">
                      {c.totalBookings}
                    </td>

                    <td className="py-3 px-3.5 text-right tabular-nums font-semibold text-[#244B3A]">
                      ₹{c.totalSpendInr.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-3.5 tabular-nums text-[#585B53]">
                      {c.lastBooking}
                    </td>

                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => handleViewCustomer(c.id)}
                        className="text-[#244B3A] font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile & History Modal */}
      {selectedCustomerDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCustomerDetails(null)}
              className="absolute top-4 right-4 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#E7E5DC] pb-3">
              <h3 className="font-serif text-2xl text-[#244B3A] font-medium">
                {selectedCustomerDetails.customer.name}
              </h3>
              <p className="text-xs text-[#777A70]">
                {selectedCustomerDetails.customer.email} · {selectedCustomerDetails.customer.phone}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#585B53]">
                Appointment History ({selectedCustomerDetails.appointments.length})
              </h4>

              {selectedCustomerDetails.appointments.length === 0 ? (
                <p className="text-xs text-[#777A70]">No appointment records logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomerDetails.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3 bg-white rounded-lg border border-[#E7E5DC] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#777A70]">{apt.bookingRef}</span>
                          <span className="font-semibold text-[#252923]">{apt.serviceName}</span>
                        </div>
                        <p className="text-[11px] text-[#777A70] tabular-nums mt-0.5">
                          {apt.appointmentDate} · {apt.timeSlot}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-semibold text-[#244B3A]">
                          ₹{apt.amountInr.toLocaleString('en-IN')}
                        </span>
                        <span className="block text-[10px] uppercase font-semibold text-emerald-800">
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
