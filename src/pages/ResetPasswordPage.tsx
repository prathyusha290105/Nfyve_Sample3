import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [resetCode, setResetCode] = useState('NFYVE-RESET-2026');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setErrorNotice('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorNotice('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorNotice('');

    try {
      const res = await api.resetPassword({ email, resetCode, newPassword });
      setSuccessNotice(res.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setErrorNotice(err.message || 'Error updating password.');
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
            Set New Password
          </h1>
          <p className="text-xs text-[#777A70]">
            Update your sanctuary account credentials securely.
          </p>
        </div>

        {successNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successNotice} Redirecting to login...</span>
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
              Account Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>

          <div>
            <label className="block text-[#585B53] font-medium mb-1">
              Reset Security Code
            </label>
            <input
              type="text"
              required
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>

          <div>
            <label className="block text-[#585B53] font-medium mb-1">
              New Password (Min. 6 characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>

          <div>
            <label className="block text-[#585B53] font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#244B3A] hover:bg-[#1a372a] text-white font-semibold uppercase tracking-wider rounded-lg transition-smooth disabled:opacity-50"
          >
            {isLoading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>

        <div className="text-center text-xs text-[#777A70] pt-2 border-t border-[#F0EEE5]">
          <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-[#244B3A] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel & Return to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
