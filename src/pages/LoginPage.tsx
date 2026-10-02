import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User as UserIcon, Lock, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState<'customer' | 'staff_admin'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const loggedUser = await login(email, password, mode);
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedUser.role === 'staff') {
        navigate('/staff');
      } else {
        navigate(redirectUrl || '/account');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCustomerDemo = () => {
    setMode('customer');
    setEmail('priya.sharma@example.com');
    setPassword('Customer@123');
    setErrorMsg('');
  };

  const fillAdminDemo = () => {
    setMode('staff_admin');
    setEmail('admin@nfyve.com');
    setPassword('Admin@NFYVE2026');
    setErrorMsg('');
  };

  const fillStaffAnanya = () => {
    setMode('staff_admin');
    setEmail('dr.ananya@nfyve.com');
    setPassword('Staff@NFYVE2026');
    setErrorMsg('');
  };

  const fillStaffVikram = () => {
    setMode('staff_admin');
    setEmail('vikram.singh@nfyve.com');
    setPassword('Staff@NFYVE2026');
    setErrorMsg('');
  };

  const fillStaffRohan = () => {
    setMode('staff_admin');
    setEmail('staff@nfyve.com');
    setPassword('Staff@NFYVE2026');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-[#E7E5DC] shadow-sm space-y-6">
        
        {/* Brand header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-block">
            <span className="font-serif text-2xl font-semibold text-[#244B3A]">
              NFYVE <span className="font-sans text-[10px] tracking-widest text-[#777A70] uppercase">· THE CHANGE</span>
            </span>
          </Link>
          <h1 className="font-serif text-2xl text-[#252923] font-medium pt-2">
            Sanctuary Portal Sign In
          </h1>
          <p className="text-xs text-[#777A70]">
            Access your appointments, medical dossiers, or operational console.
          </p>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex p-1 bg-[#F0EEE5] rounded-xl border border-[#DDD9CE]">
          <button
            type="button"
            onClick={() => {
              setMode('customer');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-smooth ${
              mode === 'customer'
                ? 'bg-white text-[#244B3A] shadow-xs'
                : 'text-[#777A70] hover:text-[#252923]'
            }`}
          >
            Customer Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('staff_admin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-smooth ${
              mode === 'staff_admin'
                ? 'bg-white text-[#244B3A] shadow-xs'
                : 'text-[#777A70] hover:text-[#252923]'
            }`}
          >
            Staff / Admin Login
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#585B53] font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === 'customer' ? 'e.g. priya.sharma@example.com' : 'e.g. admin@nfyve.com'}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[#585B53] font-medium">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-[#244B3A] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#244B3A] hover:bg-[#1a372a] text-white font-semibold uppercase tracking-wider rounded-lg transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Verifying...' : mode === 'customer' ? 'Sign In to Account' : 'Sign In to Admin Console'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Fast-Fill Strip */}
        <div className="p-3 bg-[#FAF9F5] border border-[#DDD9CE] rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#585B53]">
            <KeyRound className="w-3.5 h-3.5 text-[#244B3A]" />
            <span>Demonstration Credentials Quick Fill:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={fillCustomerDemo}
              className="px-2.5 py-1 text-[11px] bg-white border border-[#DDD9CE] rounded hover:border-[#244B3A] text-[#252923] transition-colors"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="px-2.5 py-1 text-[11px] bg-white border border-[#DDD9CE] rounded hover:border-[#244B3A] text-[#252923] transition-colors font-medium"
            >
              Demo Admin (Priya)
            </button>
            <button
              type="button"
              onClick={fillStaffAnanya}
              className="px-2.5 py-1 text-[11px] bg-white border border-[#DDD9CE] rounded hover:border-[#244B3A] text-[#252923] transition-colors"
            >
              Staff: Dr. Ananya (Aesthetics)
            </button>
            <button
              type="button"
              onClick={fillStaffVikram}
              className="px-2.5 py-1 text-[11px] bg-white border border-[#DDD9CE] rounded hover:border-[#244B3A] text-[#252923] transition-colors"
            >
              Staff: Vikram (Fitness)
            </button>
            <button
              type="button"
              onClick={fillStaffRohan}
              className="px-2.5 py-1 text-[11px] bg-white border border-[#DDD9CE] rounded hover:border-[#244B3A] text-[#252923] transition-colors"
            >
              Staff: Rohan (Concierge)
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-[#777A70] pt-2 border-t border-[#F0EEE5]">
          New to NFYVE?{' '}
          <Link to="/register" className="font-semibold text-[#244B3A] hover:underline">
            Create a Customer Account
          </Link>
        </div>

      </div>
    </div>
  );
};
