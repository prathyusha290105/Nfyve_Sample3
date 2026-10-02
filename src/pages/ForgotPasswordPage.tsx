import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorNotice('');
    setSuccessNotice('');

    try {
      await sendPasswordReset(email);
      setSuccessNotice('Password reset instructions have been dispatched. Please check your inbox.');
    } catch (err: any) {
      setErrorNotice(err.message || 'Error processing request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-[#E7E5DC] shadow-sm space-y-6">
        
        <div className="text-center space-y-1">
          <Link to="/" className="inline-block">
            <span className="font-serif text-2xl font-semibold text-[#244B3A]">
              NFYVE <span className="font-sans text-[10px] tracking-widest text-[#777A70] uppercase">· THE CHANGE</span>
            </span>
          </Link>
          <h1 className="font-serif text-2xl text-[#252923] font-medium pt-2">
            Recover Access
          </h1>
          <p className="text-xs text-[#777A70]">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {successNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
            <Link
              to={`/reset-password?email=${encodeURIComponent(email)}`}
              className="inline-block font-semibold text-emerald-900 underline mt-2"
            >
              Proceed to Reset Password Form →
            </Link>
          </div>
        )}

        {errorNotice && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#585B53] font-medium mb-1">
              Registered Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. priya.sharma@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#244B3A] hover:bg-[#1a372a] text-white font-semibold uppercase tracking-wider rounded-lg transition-smooth disabled:opacity-50"
          >
            {isLoading ? 'Searching Record...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div className="text-center text-xs text-[#777A70] pt-2 border-t border-[#F0EEE5]">
          <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-[#244B3A] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
