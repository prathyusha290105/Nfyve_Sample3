import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { CallLog } from '../../types';
import { Customer360Drawer } from '../../components/customer/Customer360Drawer';
import { PhoneCall, Search, Calendar, Phone, ArrowRight } from 'lucide-react';

export const CallCenterHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active360CustomerId, setActive360CustomerId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.getCallLogs()
      .then(res => setLogs(res))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = logs.filter(l => 
    l.customerName.toLowerCase().includes(search.toLowerCase()) ||
    l.customerPhone.includes(search) ||
    l.remarks.toLowerCase().includes(search.toLowerCase()) ||
    l.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#252923]">Call History Ledger</h1>
          <p className="text-xs text-[#777A70]">Permanent audit record of all client telephone conversations and outcomes.</p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#777A70] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search remarks, client, phone..."
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
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Client Contact</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Conversation Remarks</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#777A70]">Loading call logs...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#777A70]">No call logs found.</td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 tabular-nums text-[#777A70]">
                      {log.dateTime.slice(0, 16).replace('T', ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#1E3B2E] block">{log.customerName}</span>
                      <a href={`tel:${log.customerPhone}`} className="text-[11px] text-[#585B53] hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#1E3B2E]" />
                        <span>{log.customerPhone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-[#E6EEE7] text-[#1E3B2E]">
                        {log.outcome.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#585B53] max-w-sm">
                      <p className="font-medium">“{log.remarks}”</p>
                      {log.nextAction && (
                        <p className="text-[11px] text-[#777A70] mt-0.5">Next Action: {log.nextAction}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#777A70]">{log.employeeName}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActive360CustomerId(log.customerId)}
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
