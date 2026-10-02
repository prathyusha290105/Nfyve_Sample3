import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { ContactInquiry } from '../../types';
import { Mail, Phone, Clock, CheckCircle2, MessageSquare, RefreshCw } from 'lucide-react';

export const AdminInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInquiries = () => {
    setIsLoading(true);
    api.getAdminInquiries()
      .then(setInquiries)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateInquiryStatus(id, status);
      loadInquiries();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      <div className="flex items-center justify-between border-b border-[#E7E5DC] pb-4">
        <div>
          <h1 className="font-serif text-3xl text-[#244B3A] font-medium tracking-tight">
            Contact & Consultation Inquiries
          </h1>
          <p className="text-xs text-[#777A70] mt-0.5">
            Public messages submitted through the website contact form and concierge assistant.
          </p>
        </div>

        <button
          onClick={loadInquiries}
          className="p-2 bg-white border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#585B53] rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-[#E7E5DC] text-xs text-[#777A70]">
            No inquiries received yet.
          </div>
        ) : (
          inquiries.map((inq) => (
            <div
              key={inq.id}
              className="bg-white p-6 rounded-xl border border-[#E7E5DC] space-y-3 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EEE5] pb-3">
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#252923]">
                    {inq.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#777A70] mt-0.5">
                    <span className="font-semibold text-[#244B3A]">{inq.name}</span>
                    <span aria-hidden="true">·</span>
                    <a href={`mailto:${inq.email}`} className="hover:underline flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{inq.email}</span>
                    </a>
                    {inq.phone && (
                      <>
                        <span aria-hidden="true">·</span>
                        <a href={`tel:${inq.phone}`} className="hover:underline flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="tabular-nums">{inq.phone}</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={inq.status}
                    onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                    className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-2.5 py-1 text-xs text-[#252923] font-medium"
                  >
                    <option value="unread">Unread</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-[#585B53] leading-relaxed bg-[#FAF9F5] p-3.5 rounded-lg border border-[#E7E5DC]">
                {inq.message}
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#777A70] pt-1">
                <span>Submitted: {new Date(inq.createdAt).toLocaleString()}</span>
                <a
                  href={`mailto:${inq.email}?subject=RE: ${encodeURIComponent(inq.subject)}`}
                  className="font-semibold text-[#244B3A] hover:underline"
                >
                  Reply via Email →
                </a>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
