import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Staff } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  UserCheck, 
  Key, 
  Clock, 
  Building2, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Award,
  Sparkles
} from 'lucide-react';

export const StaffProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api.getStaffMe()
      .then(res => {
        setStaff(res.staff);
        setName(res.staff.name || '');
        setPhone(res.staff.phone || '');
        setBio(res.staff.bio || '');
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword) {
      if (!currentPassword) {
        setErrorMsg('Please enter your current password to set a new password.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation do not match.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await api.updateStaffProfile({
        name,
        phone,
        bio,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      setStaff(res.staff);
      setSuccessMsg('Profile and credentials updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !staff) {
    return (
      <div className="py-20 text-center text-xs text-[#777A70]">
        Loading practitioner profile...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="border-b border-[#E7E5DC] pb-4">
        <h1 className="font-serif text-3xl text-[#214D3B] font-bold tracking-tight">
          Practitioner Profile & Hours
        </h1>
        <p className="text-xs text-[#585B53] mt-0.5">
          Manage your clinical bio, direct contact details, sanctuary shift hours, and authentication credentials.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      {staff && (
        <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-[#214D3B] text-white flex items-center justify-center font-serif font-bold text-2xl shrink-0 border-2 border-[#D4AF37]/50 shadow-sm">
            {staff.name.charAt(0)}
          </div>
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#214D3B]">{staff.name}</h2>
                <p className="text-xs text-[#2E6B50] font-semibold">{staff.roleTitle}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full self-center sm:self-auto">
                Active On-Duty
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#777A70] pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#2E6B50]" />
                <span>{staff.email}</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#2E6B50]" />
                <span>{staff.phone}</span>
              </span>
            </div>

            {/* Specialties */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-[#585B53] block mb-1.5">
                Accredited Specialties & Disciplines:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(staff.specialties || [staff.roleTitle]).map((sp, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-[11px] font-medium bg-[#F0EEE5] text-[#214D3B] rounded-md border border-[#E7E5DC]"
                  >
                    {sp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#214D3B] border-b border-[#F0EEE5] pb-2">
            Professional Profile Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#252923] mb-1">Professional Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#252923] mb-1">Direct Consultation Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-[#252923] mb-1">
              Practitioner Bio & Clinical Philosophy
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Detail your clinical approach, years of practice, or specific wellness modalities..."
              className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
            />
            <p className="text-[10px] text-[#777A70] mt-1">
              This overview is visible to clients in their appointment dossier and booking flow.
            </p>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-xs space-y-4">
          <div className="border-b border-[#F0EEE5] pb-2 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#214D3B]">
              Change Access Password
            </h3>
            <span className="text-[11px] text-[#777A70]">Leave blank to keep unchanged</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#252923] mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#252923] mb-1">New Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#252923] mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
              />
            </div>
          </div>
        </div>

        {/* Clinic Business Hours & Shift Schedule */}
        <div className="bg-white p-6 rounded-2xl border border-[#E7E5DC] shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#214D3B] border-b border-[#F0EEE5] pb-2">
            Sanctuary Operational Hours & Shift Reference
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] space-y-1">
              <span className="font-semibold text-[#214D3B]">Monday – Saturday</span>
              <p className="text-sm font-bold text-[#252923]">09:00 AM – 08:00 PM</p>
              <p className="text-[10px] text-[#777A70]">Full clinical & salon services</p>
            </div>
            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] space-y-1">
              <span className="font-semibold text-[#214D3B]">Sunday</span>
              <p className="text-sm font-bold text-[#252923]">10:00 AM – 06:00 PM</p>
              <p className="text-[10px] text-[#777A70]">Wellness & recovery appointments</p>
            </div>
            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E5DC] space-y-1">
              <span className="font-semibold text-[#214D3B]">Practitioner Location</span>
              <p className="text-sm font-bold text-[#252923]">4th Floor, Kura Towers</p>
              <p className="text-[10px] text-[#777A70]">Begumpet, Hyderabad, Telangana</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#214D3B] hover:bg-[#1a3e2f] text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save Profile & Settings'}
          </button>
        </div>

      </form>

    </div>
  );
};
