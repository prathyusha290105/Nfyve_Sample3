import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Service, ServiceCategory } from '../../types';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Clock, IndianRupee, X } from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    shortDesc: '',
    fullDesc: '',
    durationMins: 60,
    priceInr: 3500,
    imageUrl: '/src/assets/images/nfyve_hero_wellness_1790943426252.jpg',
    benefits: 'Clinical consultation, Tailored protocol',
    precautions: 'Avoid sun exposure prior to session',
    isActive: true,
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([api.getServices(), api.getCategories()])
      .then(([srvs, cats]) => {
        setServices(srvs);
        setCategories(cats);
        if (cats.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingServiceId(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      shortDesc: '',
      fullDesc: '',
      durationMins: 60,
      priceInr: 3500,
      imageUrl: '/src/assets/images/nfyve_hero_wellness_1790943426252.jpg',
      benefits: 'Clinical consultation, Personalized treatment',
      precautions: 'Standard clinic prep',
      isActive: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingServiceId(service.id);
    setFormData({
      name: service.name,
      categoryId: service.categoryId,
      shortDesc: service.shortDesc,
      fullDesc: service.fullDesc,
      durationMins: service.durationMins,
      priceInr: service.priceInr,
      imageUrl: service.imageUrl,
      benefits: service.benefits.join(', '),
      precautions: service.precautions ? service.precautions.join(', ') : '',
      isActive: service.isActive,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.priceInr) {
      setFormError('Please enter service name, category, and fee.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const payload = {
      ...formData,
      benefits: formData.benefits.split(',').map((b) => b.trim()).filter(Boolean),
      precautions: formData.precautions.split(',').map((p) => p.trim()).filter(Boolean),
      durationMins: Number(formData.durationMins),
      priceInr: Number(formData.priceInr),
    };

    try {
      if (editingServiceId) {
        await api.updateService(editingServiceId, payload);
      } else {
        await api.createService(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await api.updateService(service.id, { isActive: !service.isActive });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service from the catalog?')) return;
    try {
      await api.deleteService(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E5DC] pb-4">
        <div>
          <h1 className="font-serif text-3xl text-[#244B3A] font-medium tracking-tight">
            Services & Pricing Management
          </h1>
          <p className="text-xs text-[#777A70] mt-0.5">
            Configure clinical offerings, session durations, and transparent pricing in INR.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#244B3A] hover:bg-[#1a372a] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-xs transition-smooth"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add New Service</span>
        </button>
      </div>

      {/* Services List Table */}
      <div className="bg-white rounded-xl border border-[#E7E5DC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] text-[#585B53] border-b border-[#E7E5DC]">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Service Name</th>
                <th className="py-3 px-3.5 font-semibold">Discipline Category</th>
                <th className="py-3 px-3.5 font-semibold">Duration</th>
                <th className="py-3 px-3.5 font-semibold">Fee (₹ INR)</th>
                <th className="py-3 px-3.5 font-semibold">Status</th>
                <th className="py-3 px-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE5]">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3 px-3.5">
                    <p className="font-semibold text-[#252923]">{srv.name}</p>
                    <p className="text-[11px] text-[#777A70] line-clamp-1">{srv.shortDesc}</p>
                  </td>

                  <td className="py-3 px-3.5 text-[#585B53]">
                    {srv.categoryName}
                  </td>

                  <td className="py-3 px-3.5 tabular-nums text-[#252923]">
                    {srv.durationMins} mins
                  </td>

                  <td className="py-3 px-3.5 tabular-nums font-semibold text-[#244B3A]">
                    ₹{srv.priceInr.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3.5">
                    <button
                      onClick={() => handleToggleActive(srv)}
                      className={`inline-block px-2.5 py-1 text-[10px] font-semibold rounded-md uppercase tracking-wider ${
                        srv.isActive
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {srv.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>

                  <td className="py-3 px-3.5 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(srv)}
                      className="text-[#244B3A] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(srv.id)}
                      className="text-red-700 hover:text-red-900 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#DDD9CE] shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#777A70] hover:text-[#252923]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-serif text-2xl text-[#244B3A] font-medium">
                {editingServiceId ? 'Edit Clinical Service' : 'Add New Service'}
              </h3>
              <p className="text-xs text-[#777A70]">
                Changes will reflect across the public services directory and scheduling wizard.
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laser Photorejuvenation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
                />
              </div>

              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Discipline Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#585B53] font-medium mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.priceInr}
                    onChange={(e) => setFormData({ ...formData, priceInr: Number(e.target.value) })}
                    className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
                  />
                </div>
                <div>
                  <label className="block text-[#585B53] font-medium mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    min={15}
                    value={formData.durationMins}
                    onChange={(e) => setFormData({ ...formData, durationMins: Number(e.target.value) })}
                    className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Short Summary (Card Preview)
                </label>
                <input
                  type="text"
                  placeholder="One sentence overview..."
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
                />
              </div>

              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Full Clinical Description
                </label>
                <textarea
                  rows={3}
                  value={formData.fullDesc}
                  onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
                  className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
                />
              </div>

              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Key Benefits (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
                />
              </div>

              <div>
                <label className="block text-[#585B53] font-medium mb-1">
                  Image URL / Asset Reference
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-white border border-[#DDD9CE] rounded-lg p-2.5 text-[#252923]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#244B3A] hover:bg-[#1a372a] text-white font-semibold uppercase tracking-wider rounded-lg transition-smooth disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingServiceId ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
