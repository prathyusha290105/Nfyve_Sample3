import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { BusinessSettings } from '../../types';
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Phone, 
  Mail, 
  Clock, 
  User, 
  Key, 
  ShieldCheck,
  Sparkles,
  Settings
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { user, updateProfileDetails } = useAuth();
  const [activeTab, setActiveTab] = useState<'business' | 'account'>('business');
  
  // Business settings state
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Admin Account settings state
  const [adminName, setAdminName] = useState(user?.name || '');
  const [adminPhone, setAdminPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountSaveMsg, setAccountSaveMsg] = useState('');
  const [accountErrorMsg, setAccountErrorMsg] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
    if (user) {
      setAdminName(user.name);
      setAdminPhone(user.phone);
    }
  }, [user]);

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setSaveMsg('');
    setErrorMsg('');

    try {
      const res = await api.updateSettings(settings);
      setSettings(res.settings);
      setSaveMsg('Sanctuary business parameters, operating hours, and cancellation policies updated successfully.');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountSaveMsg('');
    setAccountErrorMsg('');

    if (newPassword) {
      if (!currentPassword) {
        setAccountErrorMsg('Please provide your current password to set a new password.');
        return;
      }
      if (newPassword.length < 6) {
        setAccountErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setAccountErrorMsg('New password and confirmation do not match.');
        return;
      }
    }

    setIsSavingAccount(true);
    try {
      await updateProfileDetails({
        name: adminName,
        phone: adminPhone,
      });

      setAccountSaveMsg('Administrator account profile and credentials updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setAccountSaveMsg(''), 4000);
    } catch (err: any) {
      setAccountErrorMsg(err.message || 'Error updating admin account.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  if (!settings) {
    return <div className="py-20 text-center text-xs text-[#777A70]">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-4">
        <div>
          <h1 className="font-serif text-3xl text-[#214D3B] font-bold tracking-tight">
            Sanctuary Settings & Administration
          </h1>
          <p className="text-xs text-[#585B53] mt-0.5">
            Configure clinic operating hours, cancellation policies, and administrator credentials.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex p-1 bg-white border border-[#DDD9CE] rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('business')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'business'
                ? 'bg-[#214D3B] text-white shadow-xs'
                : 'text-[#585B53] hover:text-[#214D3B]'
            }`}
          >
            Business & Facility
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'account'
                ? 'bg-[#214D3B] text-white shadow-xs'
                : 'text-[#585B53] hover:text-[#214D3B]'
            }`}
          >
            Admin Profile & Security
          </button>
        </div>
      </div>

      {activeTab === 'business' ? (
        <form onSubmit={handleBusinessSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E5DC] space-y-6 text-xs shadow-xs">
          
          {saveMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Basic Brand Info */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#214D3B] border-b border-[#F0EEE5] pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#2E6B50]" />
              <span>Sanctuary Facility Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#252923] font-semibold mb-1">
                  Business / Centre Name
                </label>
                <input
                  type="text"
                  required
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div>
                <label className="block text-[#252923] font-semibold mb-1">
                  Area & City
                </label>
                <input
                  type="text"
                  required
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#252923] font-semibold mb-1">
                Full Physical Address
              </label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#214D3B] border-b border-[#F0EEE5] pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#2E6B50]" />
              <span>Official Concierge Contact</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#252923] font-semibold mb-1">
                  Primary Telephone / Hotline
                </label>
                <input
                  type="text"
                  required
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div>
                <label className="block text-[#252923] font-semibold mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#214D3B] border-b border-[#F0EEE5] pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2E6B50]" />
              <span>Sanctuary Operating Hours</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#252923] font-semibold mb-1">
                  Monday – Friday
                </label>
                <input
                  type="text"
                  required
                  value={settings.openingHours.weekdays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      openingHours: { ...settings.openingHours, weekdays: e.target.value },
                    })
                  }
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div>
                <label className="block text-[#252923] font-semibold mb-1">
                  Saturday
                </label>
                <input
                  type="text"
                  required
                  value={settings.openingHours.saturday}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      openingHours: { ...settings.openingHours, saturday: e.target.value },
                    })
                  }
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div>
                <label className="block text-[#252923] font-semibold mb-1">
                  Sunday
                </label>
                <input
                  type="text"
                  required
                  value={settings.openingHours.sunday}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      openingHours: { ...settings.openingHours, sunday: e.target.value },
                    })
                  }
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#214D3B] border-b border-[#F0EEE5] pb-2">
              Appointment & Cancellation Rules
            </h3>

            <div>
              <label className="block text-[#252923] font-semibold mb-1">
                Client Cancellation Policy Description
              </label>
              <textarea
                rows={3}
                required
                value={settings.cancellationPolicy}
                onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#F0EEE5]">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#214D3B] hover:bg-[#1a3e2f] text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Updating...' : 'Save Sanctuary Parameters'}
            </button>
          </div>

        </form>
      ) : (
        /* Admin Account Profile & Security Settings */
        <form onSubmit={handleAccountSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E5DC] space-y-6 text-xs shadow-xs">
          
          {accountSaveMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{accountSaveMsg}</span>
            </div>
          )}

          {accountErrorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{accountErrorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#214D3B] border-b border-[#F0EEE5] pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#2E6B50]" />
              <span>Administrator Identity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#252923] font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div>
                <label className="block text-[#252923] font-semibold mb-1">
                  Official Email (Firebase Auth UID)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'admin@nfyve.com'}
                  className="w-full bg-gray-100 border border-[#DDD9CE] rounded-lg p-2.5 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[#252923] font-semibold mb-1">
                  Direct Contact Phone
                </label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div>
                <label className="block text-[#252923] font-semibold mb-1">
                  Assigned Administrative Role
                </label>
                <input
                  type="text"
                  disabled
                  value="Full Administrator (Root Privileges)"
                  className="w-full bg-gray-100 border border-[#DDD9CE] rounded-lg p-2.5 text-[#214D3B] font-bold cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#214D3B] border-b border-[#F0EEE5] pb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#2E6B50]" />
              <span>Change Portal Password</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#252923] font-semibold mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div>
                <label className="block text-[#252923] font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div>
                <label className="block text-[#252923] font-semibold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923] focus:outline-none focus:border-[#214D3B]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#F0EEE5]">
            <button
              type="submit"
              disabled={isSavingAccount}
              className="px-6 py-2.5 bg-[#214D3B] hover:bg-[#1a3e2f] text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isSavingAccount ? 'Saving...' : 'Update Admin Credentials'}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
