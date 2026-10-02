import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { BusinessSettings } from '../../types';
import { Save, CheckCircle2, AlertCircle, Building2, Phone, Mail, Clock } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setSaveMsg('');

    try {
      const res = await api.updateSettings(settings);
      setSettings(res.settings);
      setSaveMsg('Business parameters and sanctuary hours updated successfully.');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Error updating settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return <div className="py-20 text-center text-xs text-[#777A70]">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      <div className="border-b border-[#E7E5DC] pb-4">
        <h1 className="font-serif text-3xl text-[#244B3A] font-medium tracking-tight">
          Business Profile & Sanctuary Settings
        </h1>
        <p className="text-xs text-[#777A70] mt-0.5">
          Configure official contact numbers, operating schedules, and cancellation policies.
        </p>
      </div>

      {saveMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E5DC] space-y-6 text-xs">
        
        {/* Basic Brand Info */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-medium text-[#244B3A] border-b border-[#F0EEE5] pb-2">
            Brand Identity & Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#585B53] font-medium mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
              />
            </div>

            <div>
              <label className="block text-[#585B53] font-medium mb-1">
                Area / City
              </label>
              <input
                type="text"
                required
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#585B53] font-medium mb-1">
              Complete Facility Address
            </label>
            <input
              type="text"
              required
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#585B53] font-medium mb-1">
                Concierge Contact Phone Number
              </label>
              <input
                type="tel"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
              />
            </div>

            <div>
              <label className="block text-[#585B53] font-medium mb-1">
                Customer Support Email
              </label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="space-y-4 pt-2">
          <h3 className="font-serif text-lg font-medium text-[#244B3A] border-b border-[#F0EEE5] pb-2">
            Sanctuary Operating Schedules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#585B53] font-medium mb-1">
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
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
              />
            </div>

            <div>
              <label className="block text-[#585B53] font-medium mb-1">
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
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
              />
            </div>

            <div>
              <label className="block text-[#585B53] font-medium mb-1">
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
                className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
              />
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="space-y-4 pt-2">
          <h3 className="font-serif text-lg font-medium text-[#244B3A] border-b border-[#F0EEE5] pb-2">
            Cancellation & Rescheduling Terms
          </h3>

          <div>
            <textarea
              rows={3}
              value={settings.cancellationPolicy}
              onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
              className="w-full bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-[#244B3A] hover:bg-[#1a372a] text-white font-semibold uppercase tracking-wider rounded-lg transition-smooth disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
