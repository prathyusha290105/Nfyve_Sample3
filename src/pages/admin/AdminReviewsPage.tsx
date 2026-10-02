import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Review } from '../../types';
import { Star, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = () => {
    setIsLoading(true);
    api.getAdminReviews()
      .then(setReviews)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      await api.approveReview(id, isApproved);
      loadReviews();
    } catch (err: any) {
      alert(err.message || 'Moderation update failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      <div className="flex items-center justify-between border-b border-[#E7E5DC] pb-4">
        <div>
          <h1 className="font-serif text-3xl text-[#244B3A] font-medium tracking-tight">
            Client Review Moderation
          </h1>
          <p className="text-xs text-[#777A70] mt-0.5">
            Approve or withhold client feedback before it displays on the public website.
          </p>
        </div>

        <button
          onClick={loadReviews}
          className="p-2 bg-white border border-[#DDD9CE] hover:bg-[#F0EEE5] text-[#585B53] rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white p-5 rounded-xl border border-[#E7E5DC] space-y-3 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EEE5] pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#252923]">{rev.customerName}</span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  {rev.isSample && (
                    <span className="text-[10px] bg-[#F0EEE5] text-[#777A70] px-2 py-0.5 rounded font-medium">
                      Sample Data
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#777A70]">
                  {rev.serviceName} · {rev.serviceCategory} · {rev.reviewDate}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase font-semibold px-2.5 py-1 rounded-md ${
                    rev.isApproved
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {rev.isApproved ? 'Approved & Live' : 'Pending Moderation'}
                </span>

                <button
                  onClick={() => handleApprove(rev.id, !rev.isApproved)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    rev.isApproved
                      ? 'text-red-700 bg-red-50 hover:bg-red-100'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {rev.isApproved ? 'Unapprove' : 'Approve Review'}
                </button>
              </div>
            </div>

            <p className="text-xs text-[#585B53] leading-relaxed italic">
              "{rev.reviewText}"
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
