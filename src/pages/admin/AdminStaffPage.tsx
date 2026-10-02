import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Staff, StaffPerformanceData } from '../../types';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Key, 
  Power, 
  TrendingUp, 
  Sparkles, 
  CalendarCheck, 
  IndianRupee, 
  Star, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  ShieldCheck,
  Phone,
  Mail,
  Award
} from 'lucide-react';

interface StaffWithStats extends Staff {
  totalAssigned?: number;
  completedCount?: number;
  totalRevenueGenerated?: number;
}

const ALL_SPECIALTIES = [
  'Clinical Aesthetics & Dermatology',
  'Medical Weight Loss & Metabolism',
  'Fitness & Strength Conditioning',
  'Luxury Hair & Salon Artistry',
  'Clinical Nutrition & Gut Health',
  'Physiotherapy & Recovery',
];

export const AdminStaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [resetPasswordStaff, setResetPasswordStaff] = useState<Staff | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [performanceStaff, setPerformanceStaff] = useState<StaffWithStats | null>(null);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformanceData | null>(null);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleTitle: '',
    specialties: [] as string[],
    bio: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStaff = () => {
    setIsLoading(true);
    api.getAdminStaff()
      .then(setStaffList)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '+91 ',
      roleTitle: 'Senior Clinical Specialist',
      specialties: ['Clinical Aesthetics & Dermatology'],
      bio: '',
      password: 'NfyveStaff@2026',
    });
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      roleTitle: staff.roleTitle,
      specialties: staff.specialties || [staff.roleTitle],
      bio: staff.bio || '',
      password: '',
    });
    setFormError('');
    setFormSuccess('');
  };

  const handleSpecialtyToggle = (spec: string) => {
    setFormData(prev => {
      const exists = prev.specialties.includes(spec);
      if (exists) {
        return { ...prev, specialties: prev.specialties.filter(s => s !== spec) };
      } else {
        return { ...prev, specialties: [...prev.specialties, spec] };
      }
    });
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.roleTitle) {
      setFormError('Please enter practitioner name, email, and primary designation.');
      return;
    }
    if (formData.specialties.length === 0) {
      setFormError('Please select at least one wellness or clinical specialty.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      await api.createAdminStaff({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        roleTitle: formData.roleTitle.trim(),
        specialties: formData.specialties,
        bio: formData.bio.trim(),
        password: formData.password || undefined,
      });
      setIsAddModalOpen(false);
      loadStaff();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create staff account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (!formData.name || !formData.roleTitle) {
      setFormError('Name and role title are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      await api.updateAdminStaff(editingStaff.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        roleTitle: formData.roleTitle.trim(),
        specialties: formData.specialties,
        bio: formData.bio.trim(),
      });
      setEditingStaff(null);
      loadStaff();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const confirmMsg = currentStatus 
      ? 'Deactivate this staff member? They will no longer be bookable by clients.' 
      : 'Activate this staff member for appointment booking?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.toggleAdminStaffStatus(id);
      loadStaff();
    } catch (err: any) {
      alert(err.message || 'Status toggle failed.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordStaff) return;
    if (!newPassword || newPassword.length < 6) {
      setFormError('New password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      await api.resetAdminStaffPassword(resetPasswordStaff.id, newPassword);
      setFormSuccess('Staff access credentials updated successfully!');
      setTimeout(() => {
        setResetPasswordStaff(null);
        setNewPassword('');
        setFormSuccess('');
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Error updating password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewStaffPerformance = async (staff: StaffWithStats) => {
    setPerformanceStaff(staff);
    setIsLoadingPerformance(true);
    try {
      const data = await api.getStaffPerformance('this_month');
      setStaffPerformance(data);
    } catch (err: any) {
      console.error('Could not load specific staff performance data', err);
    } finally {
      setIsLoadingPerformance(false);
    }
  };

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.specialties && s.specialties.some(sp => sp.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesStatus = 
      statusFilter === 'all' ? true : statusFilter === 'active' ? s.isActive : !s.isActive;

    const matchesSpecialty = 
      specialtyFilter === 'all' ? true : s.specialties && s.specialties.includes(specialtyFilter);

    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  // Calculate totals
  const totalStaffCount = staffList.length;
  const activeStaffCount = staffList.filter(s => s.isActive).length;
  const totalAssignedSessions = staffList.reduce((acc, s) => acc + (s.totalAssigned || 0), 0);
  const totalStaffRevenue = staffList.reduce((acc, s) => acc + (s.totalRevenueGenerated || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl text-[#214D3B] font-bold tracking-tight">
              Staff & Practitioner Roster
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#214D3B] text-white rounded-full">
              {activeStaffCount} Active Specialists
            </span>
          </div>
          <p className="text-xs text-[#585B53] mt-1">
            Manage clinical dermatologists, weight-loss physicians, fitness coaches, salon artists, and nutrition consultants.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#214D3B] hover:bg-[#1a3e2f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4 text-[#D4AF37]" />
          <span>+ Add / Invite Practitioner</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#777A70]">
            <span className="font-medium">Total Specialists</span>
            <Users className="w-4 h-4 text-[#214D3B]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#214D3B] mt-1 tabular-nums">
            {totalStaffCount}
          </div>
          <p className="text-[11px] text-[#585B53] mt-1">
            <span className="text-emerald-700 font-semibold">{activeStaffCount} active</span> · {totalStaffCount - activeStaffCount} inactive
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#777A70]">
            <span className="font-medium">Consultations Assigned</span>
            <CalendarCheck className="w-4 h-4 text-[#2E6B50]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#252923] mt-1 tabular-nums">
            {totalAssignedSessions}
          </div>
          <p className="text-[11px] text-[#585B53] mt-1">
            Across all sanctuary disciplines
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#777A70]">
            <span className="font-medium">Specialist Revenue Attributed</span>
            <IndianRupee className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#214D3B] mt-1 tabular-nums">
            ₹{totalStaffRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#585B53] mt-1">
            Realized treatment delivery
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7E5DC] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#777A70]">
            <span className="font-medium">Client Satisfaction</span>
            <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#214D3B] mt-1 tabular-nums">
            4.9 / 5.0
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Verified post-treatment reviews
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#777A70] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by specialist name, email, designation, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg text-xs text-[#252923] focus:outline-none focus:border-[#214D3B]"
            />
          </div>

          {/* Specialty Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#777A70]" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-3 py-2 text-xs text-[#252923] font-medium focus:outline-none focus:border-[#214D3B]"
            >
              <option value="all">All Specialties ({staffList.length})</option>
              {ALL_SPECIALTIES.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-3 py-2 text-xs text-[#252923] font-medium focus:outline-none focus:border-[#214D3B]"
            >
              <option value="all">Status: All</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

        </div>
      </div>

      {/* Staff Table / Cards */}
      <div className="bg-white rounded-xl border border-[#E7E5DC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] text-[#585B53] border-b border-[#E7E5DC]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Specialist & Role</th>
                <th className="py-3.5 px-4 font-semibold">Contact Details</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Disciplines</th>
                <th className="py-3.5 px-4 font-semibold">Consultations</th>
                <th className="py-3.5 px-4 font-semibold">Revenue Attributed</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777A70]">
                    Loading Begumpet clinical staff...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777A70]">
                    No staff records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    
                    {/* Practitioner Name & Role */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#214D3B] text-white flex items-center justify-center font-serif font-bold text-sm shrink-0 border border-[#D4AF37]/40">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#252923] text-sm">{staff.name}</p>
                          <p className="text-[11px] text-[#2E6B50] font-medium">{staff.roleTitle}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="py-3.5 px-4">
                      <p className="text-[#252923] font-medium">{staff.email}</p>
                      <p className="text-[11px] text-[#777A70]">{staff.phone}</p>
                    </td>

                    {/* Specialties */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(staff.specialties || [staff.roleTitle]).map((sp, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 text-[10px] font-medium bg-[#F0EEE5] text-[#214D3B] rounded border border-[#E7E5DC]"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Consultations */}
                    <td className="py-3.5 px-4 tabular-nums">
                      <span className="font-semibold text-[#252923]">
                        {staff.completedCount || 0} completed
                      </span>
                      <span className="block text-[11px] text-[#777A70]">
                        {staff.totalAssigned || 0} total assigned
                      </span>
                    </td>

                    {/* Revenue Attributed */}
                    <td className="py-3.5 px-4 tabular-nums">
                      <span className="font-bold text-[#214D3B] font-serif text-sm">
                        ₹{(staff.totalRevenueGenerated || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(staff.id, staff.isActive)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                          staff.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${staff.isActive ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        <span>{staff.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* View Performance / Staff Dashboard Preview */}
                      <button
                        onClick={() => viewStaffPerformance(staff)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#214D3B] bg-[#F4F9F6] border border-[#214D3B]/20 rounded-md font-medium hover:bg-[#214D3B] hover:text-white transition-colors"
                        title="Inspect individual performance & appointments"
                      >
                        <TrendingUp className="w-3 h-3 text-[#D4AF37]" />
                        <span>Performance</span>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(staff)}
                        className="p-1.5 text-[#585B53] hover:text-[#214D3B] hover:bg-[#F0EEE5] rounded-md transition-colors"
                        title="Edit Profile"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Reset Password */}
                      <button
                        onClick={() => {
                          setResetPasswordStaff(staff);
                          setNewPassword('');
                          setFormError('');
                          setFormSuccess('');
                        }}
                        className="p-1.5 text-[#585B53] hover:text-[#2E6B50] hover:bg-[#F0EEE5] rounded-md transition-colors"
                        title="Reset Staff Access Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      {/* Link to appointments */}
                      <Link
                        to={`/admin/appointments?staffId=${staff.id}`}
                        className="inline-flex items-center p-1.5 text-[#2E6B50] hover:bg-[#F0EEE5] rounded-md transition-colors"
                        title="View All Bookings for this Specialist"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                      </Link>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Staff Member */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-xl w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#E7E5DC] pb-4">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                Begumpet Wellness Centre
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#214D3B]">
                Invite New Practitioner / Specialist
              </h2>
              <p className="text-xs text-[#777A70] mt-0.5">
                Create clinical or service credentials to enable client bookings and staff portal access.
              </p>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddStaff} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#252923] mb-1">Full Legal / Professional Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Priya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#252923] mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. dr.priya@nfyve.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#252923] mb-1">Direct Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 90000 23050"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#252923] mb-1">Primary Designation / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Aesthetic Dermatologist"
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                  />
                </div>
              </div>

              {/* Multiple Specialties Checkbox */}
              <div>
                <label className="block font-medium text-[#252923] mb-1.5">
                  Assigned Wellness & Clinical Specialties *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-white border border-[#DDD9CE] rounded-lg">
                  {ALL_SPECIALTIES.map((spec) => (
                    <label key={spec} className="flex items-center gap-2 cursor-pointer text-[#252923] hover:text-[#214D3B]">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(spec)}
                        onChange={() => handleSpecialtyToggle(spec)}
                        className="rounded border-[#DDD9CE] text-[#214D3B] focus:ring-[#214D3B]"
                      />
                      <span className="text-[11px] font-medium">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#252923] mb-1">Professional Bio & Credentials</label>
                <textarea
                  rows={3}
                  placeholder="Detail qualifications, years of clinical practice, certifications, and philosophy of care..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#252923] mb-1">Initial Portal Password</label>
                <input
                  type="text"
                  placeholder="NfyveStaff@2026"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                />
                <p className="text-[10px] text-[#777A70] mt-1">
                  Practitioner will use this password to sign in via the Staff Login tab.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E7E5DC] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-xs font-semibold text-[#585B53] hover:bg-[#F0EEE5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#214D3B] hover:bg-[#1a3e2f] text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Profile...' : 'Save & Onboard Practitioner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Staff Member */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-xl w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingStaff(null)}
              className="absolute top-5 right-5 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#E7E5DC] pb-4">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                Staff Profile Modification
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#214D3B]">
                Edit {editingStaff.name}
              </h2>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStaff} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#252923] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#252923] mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#252923] mb-1">Designation / Role Title</label>
                <input
                  type="text"
                  required
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#252923] mb-1.5">
                  Assigned Specialties
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-white border border-[#DDD9CE] rounded-lg">
                  {ALL_SPECIALTIES.map((spec) => (
                    <label key={spec} className="flex items-center gap-2 cursor-pointer text-[#252923]">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(spec)}
                        onChange={() => handleSpecialtyToggle(spec)}
                        className="rounded border-[#DDD9CE] text-[#214D3B] focus:ring-[#214D3B]"
                      />
                      <span className="text-[11px] font-medium">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#252923] mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div className="pt-4 border-t border-[#E7E5DC] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 border border-[#DDD9CE] rounded-lg text-xs font-semibold text-[#585B53] hover:bg-[#F0EEE5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#214D3B] hover:bg-[#1a3e2f] text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Staff Password */}
      {resetPasswordStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-md w-full p-6 border border-[#DDD9CE] shadow-2xl relative">
            <button
              onClick={() => setResetPasswordStaff(null)}
              className="absolute top-4 right-4 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#214D3B]">
              Reset Password for {resetPasswordStaff.name}
            </h3>
            <p className="text-xs text-[#777A70] mt-1">
              Provide a new temporary or permanent password for this practitioner's login.
            </p>

            {formError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#252923] mb-1">New Password (min. 6 characters)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nfyve2026!Pass"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD9CE] rounded-lg text-xs focus:outline-none focus:border-[#214D3B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordStaff(null)}
                  className="px-3.5 py-1.5 border border-[#DDD9CE] rounded-lg text-xs font-semibold text-[#585B53] hover:bg-[#F0EEE5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[#214D3B] hover:bg-[#1a3e2f] text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Staff Performance & Dashboard Drawer */}
      {performanceStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => {
                setPerformanceStaff(null);
                setStaffPerformance(null);
              }}
              className="absolute top-5 right-5 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#E7E5DC] pb-4">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                Practitioner Performance Dossier
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#214D3B]">
                {performanceStaff.name}
              </h2>
              <p className="text-xs text-[#2E6B50] font-medium">{performanceStaff.roleTitle}</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-[#E7E5DC]">
                <span className="text-[#777A70]">Total Assigned</span>
                <p className="font-serif text-xl font-bold text-[#252923] mt-0.5">
                  {performanceStaff.totalAssigned || 0}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E7E5DC]">
                <span className="text-[#777A70]">Completed</span>
                <p className="font-serif text-xl font-bold text-emerald-800 mt-0.5">
                  {performanceStaff.completedCount || 0}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E7E5DC]">
                <span className="text-[#777A70]">Revenue Realized</span>
                <p className="font-serif text-xl font-bold text-[#214D3B] mt-0.5">
                  ₹{(performanceStaff.totalRevenueGenerated || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E7E5DC]">
                <span className="text-[#777A70]">Rating Avg</span>
                <p className="font-serif text-xl font-bold text-[#D4AF37] mt-0.5 flex items-center gap-1">
                  <span>★</span> 4.9
                </p>
              </div>
            </div>

            {/* Specialties & Bio */}
            <div className="bg-white p-4 rounded-xl border border-[#E7E5DC] space-y-2 text-xs">
              <h4 className="font-semibold text-[#214D3B]">Assigned Specialties & Disciplines:</h4>
              <div className="flex flex-wrap gap-1.5">
                {(performanceStaff.specialties || [performanceStaff.roleTitle]).map((sp, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-[#F0EEE5] text-[#214D3B] font-medium rounded-md border border-[#E7E5DC]">
                    {sp}
                  </span>
                ))}
              </div>
              {performanceStaff.bio && (
                <div className="pt-2">
                  <span className="font-semibold text-[#585B53]">Bio / Philosophy:</span>
                  <p className="text-[#585B53] mt-1 leading-relaxed">{performanceStaff.bio}</p>
                </div>
              )}
            </div>

            {/* Quick Actions for this staff member */}
            <div className="pt-2 border-t border-[#E7E5DC] flex flex-wrap items-center justify-between gap-3 text-xs">
              <Link
                to={`/admin/appointments?staffId=${performanceStaff.id}`}
                className="px-4 py-2 bg-[#214D3B] text-white font-semibold rounded-lg hover:bg-[#1a3e2f] transition-colors"
              >
                Inspect All Assigned Bookings →
              </Link>
              <button
                onClick={() => {
                  setPerformanceStaff(null);
                  openEditModal(performanceStaff);
                }}
                className="px-4 py-2 bg-white border border-[#DDD9CE] text-[#252923] font-semibold rounded-lg hover:bg-[#F0EEE5] transition-colors"
              >
                Edit Practitioner Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
