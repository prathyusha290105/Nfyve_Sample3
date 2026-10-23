import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Customer, CustomerLifecycleStatus, LeadSource } from '../../types';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { 
  Users, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Calendar, 
  ArrowRight, 
  Plus, 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';

export const CallCenterProspectsPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  const loadCustomers = () => {
    setIsLoading(true);
    api.getCustomers({
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      source: sourceFilter !== 'all' ? sourceFilter : undefined
    })
      .then(res => setCustomers(Array.isArray(res) ? res : []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, [search, statusFilter, sourceFilter]);

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
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#252923]">Prospects & Client Directory</h1>
          <p className="text-xs text-[#777A70]">Comprehensive roster of enquiries, active prospects, and enrolled clients.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#777A70]" />
          <input
            type="text"
            placeholder="Search name, phone, or customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#777A70]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-2.5 py-1 text-xs"
            >
              <option value="all">All Lifecycles</option>
              <option value="new_prospect">New Prospect</option>
              <option value="contacted">Contacted</option>
              <option value="followup_required">Follow-up Required</option>
              <option value="appointment_confirmed">Appointment Confirmed</option>
              <option value="consultation_completed">Consultation Completed</option>
              <option value="package_purchased">Package Purchased</option>
              <option value="not_interested">Not Interested</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#777A70]">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-2.5 py-1 text-xs"
            >
              <option value="all">All Sources</option>
              <option value="Instagram">Instagram</option>
              <option value="Google">Google Search</option>
              <option value="Referral">Referral</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Website">Marketing Portal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E7E5DC] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E7E5DC] text-[11px] font-semibold text-[#777A70] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Client ID & Name</th>
                <th className="py-3 px-4">Phone / Email</th>
                <th className="py-3 px-4">Lead Source</th>
                <th className="py-3 px-4">Lifecycle Status</th>
                <th className="py-3 px-4">Interested Protocol</th>
                <th className="py-3 px-4">Enquiry Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#777A70]">Loading prospects directory...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#777A70]">No matching prospects found.</td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1E3B2E]">{c.name}</div>
                      <span className="text-[10px] text-[#777A70]">{c.id}</span>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <a href={`tel:${c.phone}`} className="font-medium text-[#252923] hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#1E3B2E]" />
                        <span>{c.phone}</span>
                      </a>
                      {c.email && <div className="text-[11px] text-[#777A70]">{c.email}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#585B53]">{c.leadSource}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(c.lifecycleStatus)}</td>
                    <td className="py-3.5 px-4 text-[#585B53] max-w-[200px] truncate">
                      {c.interestedServiceName || 'General Aesthetics'}
                    </td>
                    <td className="py-3.5 px-4 text-[#777A70] tabular-nums">
                      {c.createdAt.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActive360CustomerId(c.id)}
                        className="px-3 py-1.5 bg-[#FAF9F5] border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#1E3B2E] rounded-md font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        <span>360° Dossier</span>
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

      {/* Customer 360 Drawer */}
      <Customer360Drawer
        customerId={active360CustomerId}
        onClose={() => setActive360CustomerId(null)}
      />
    </div>
  );
};
