import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, Filter, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { submitReviewRecord, fetchReviews as fetchFirestoreReviews } from '../lib/firestore';
import { Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [serviceName, setServiceName] = useState('');
  const [categoryName, setCategoryName] = useState('Clinical Aesthetics & Skin Health');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviewsData = () => {
    setIsLoading(true);
    fetchFirestoreReviews(true)
      .then(setReviews)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadReviewsData();
  }, []);

  const categories = [
    'all',
    'Clinical Aesthetics & Skin Health',
    'Medical Weight Loss & Body Contouring',
    'Fitness & Gym',
    'Salon, Hair & Beauty',
    'Nutri Food & Personalized Nutrition',
    'Integrated Wellness Programs',
  ];

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'all') return true;
    return r.serviceCategory === selectedFilter;
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await submitReviewRecord({
        customerName: user?.name || 'Verified Client',
        serviceCategory: categoryName,
        serviceName: serviceName.trim() || 'General Consultation',
        rating,
        reviewText: reviewText.trim(),
      });
      setSubmitSuccess('Thank you! Your feedback has been submitted to the sanctuary.');
      setReviewText('');
      setServiceName('');
      loadReviewsData();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess('');
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#244B3A]">
            Client Testimonials
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#244B3A] font-medium tracking-tight">
            Verified Experiences from Begumpet
          </h1>
          <p className="text-xs sm:text-sm text-[#585B53] leading-relaxed">
            Authentic reflections from clients who have undertaken clinical treatments, fitness programs, trichology rituals, and nutrition plans at NFYVE.
          </p>
        </div>

        {/* Action Button: Submit Review */}
        <div className="shrink-0">
          {user ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#244B3A] hover:bg-[#1a372a] rounded-lg shadow-sm transition-smooth"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Share Your Feedback</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#244B3A] bg-[#F0EEE5] hover:bg-[#E5E2D6] border border-[#DDD9CE] rounded-lg transition-smooth"
            >
              <span>Sign In to Leave a Review</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E7E5DC] no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-smooth ${
              selectedFilter === cat
                ? 'bg-[#244B3A] text-white shadow-xs'
                : 'text-[#585B53] hover:text-[#252923] hover:bg-[#F0EEE5]'
            }`}
          >
            {cat === 'all' ? 'All Disciplines' : cat}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-[#777A70]">
          Loading client testimonials...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-20 text-center text-xs text-[#777A70] bg-white rounded-xl border border-[#E7E5DC]">
          No testimonials registered under this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-xl border border-[#E7E5DC] flex flex-col justify-between space-y-4 hover:border-[#244B3A]/40 transition-smooth"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#777A70] tabular-nums">
                    {rev.reviewDate}
                  </span>
                </div>

                <p className="text-xs text-[#585B53] leading-relaxed italic">
                  "{rev.reviewText}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#F0EEE5] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#252923]">
                    {rev.customerName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <div className="text-[11px] text-[#777A70] truncate">
                  {rev.serviceName} · {rev.serviceCategory}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#777A70] hover:text-[#252923]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-[#244B3A] font-medium mb-1">
              Share Your Experience
            </h3>
            <p className="text-xs text-[#777A70] mb-5">
              Posting as <span className="font-semibold text-[#252923]">{user?.name}</span>
            </p>

            {submitSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
                {submitSuccess}
              </div>
            )}

            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Service Category
                </label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
                >
                  <option>Clinical Aesthetics & Skin Health</option>
                  <option>Medical Weight Loss & Body Contouring</option>
                  <option>Fitness & Gym</option>
                  <option>Salon, Hair & Beauty</option>
                  <option>Nutri Food & Personalized Nutrition</option>
                  <option>Integrated Wellness Programs</option>
                </select>
              </div>

              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Specific Treatment or Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydra-Infusion Clinical Facial"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
                />
              </div>

              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setRating(num)}
                      className={`p-1.5 rounded-md border ${
                        rating >= num
                          ? 'border-amber-400 bg-amber-50 text-amber-500'
                          : 'border-[#DDD9CE] text-[#777A70]'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-[#252923] ml-2">
                    {rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Your Review / Observations
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your session, staff interactions, and outcome..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#244B3A] hover:bg-[#1a372a] text-white font-semibold uppercase tracking-wider rounded-lg transition-smooth disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Feedback...' : 'Submit Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
