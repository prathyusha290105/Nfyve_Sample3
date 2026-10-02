import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Please enter your full name, email address, and password.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await register(formData.name, formData.email, formData.phone, formData.password);
      navigate(redirectUrl || '/account');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try a different email.');
    } finally {
      setIsLoading(false);
    }
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
            Create Customer Account
          </h1>
          <p className="text-xs text-[#777A70]">
            Track appointments, consult clinical dossiers, and schedule treatments.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#585B53] font-medium mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>

          <div>
            <label className="block text-[#585B53] font-medium mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. priya.sharma@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>

          <div>
            <label className="block text-[#585B53] font-medium mb-1">
              Phone Number (For Appointment Confirmations) *
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +91 98490 12345"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>

          <div>
            <label className="block text-[#585B53] font-medium mb-1">
              Password (Min. 6 characters) *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>

          <div>
            <label className="block text-[#585B53] font-medium mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#244B3A]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#244B3A] hover:bg-[#1a372a] text-white font-semibold uppercase tracking-wider rounded-lg transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-[#777A70] pt-2 border-t border-[#F0EEE5]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#244B3A] hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};
