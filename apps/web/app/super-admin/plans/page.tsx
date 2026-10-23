"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  is_active: boolean;
  features: string[];
}

const AVAILABLE_FEATURES = [
  { key: 'leads_crm', name: 'Leads CRM', description: 'Manage and track prospective travelers.' },
  { key: 'itinerary_builder', name: 'Itinerary Builder', description: 'Create rich, interactive itineraries.' },
  { key: 'payments', name: 'Payments Integration', description: 'Accept online payments from clients.' },
  { key: 'custom_domain', name: 'Custom Domain', description: 'White-label the client portal.' },
  { key: 'api_access', name: 'API Access', description: 'Developer access to the agency data.' },
];

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly',
    isActive: true,
    features: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/plans');
      setPlans(data);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentPlanId(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      billingCycle: 'monthly',
      isActive: true,
      features: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setIsEditing(true);
    setCurrentPlanId(plan.id);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price || 0,
      billingCycle: plan.billing_cycle || 'monthly',
      isActive: plan.is_active,
      features: plan.features || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing && currentPlanId) {
        await api.patch(`/plans/${currentPlanId}`, formData);
        toast.success('Plan updated successfully');
      } else {
        await api.post('/plans', formData);
        toast.success('Plan created successfully');
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update plan' : 'Failed to create plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Subscription Plans
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Manage the pricing tiers available for agencies.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Plan
        </button>
      </div>

      {/* Grid of Plans */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white/50 dark:bg-gray-800/50 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No plans found</h3>
          <p className="text-gray-500 mt-1">Create your first subscription plan to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl p-8 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col h-full overflow-hidden">
              
              {/* Glassmorphism accent blurs */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                    {!plan.is_active && (
                      <span className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-lg">Inactive</span>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-3">{plan.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.features?.map(feat => {
                      const fInfo = AVAILABLE_FEATURES.find(f => f.key === feat);
                      return (
                        <span key={feat} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-md">
                          {fInfo?.name || feat}
                        </span>
                      );
                    })}
                    {(!plan.features || plan.features.length === 0) && (
                      <span className="text-xs text-gray-400 italic">No features assigned</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-8 relative z-10">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹{plan.price}</span>
                <span className="text-gray-500 font-medium ml-2">/{plan.billing_cycle}</span>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700/50 relative z-10">
                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="w-full py-3 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Edit Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {isEditing ? 'Edit Plan' : 'Create Plan'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors"
                    placeholder="e.g. Pro Plan"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors resize-none"
                    placeholder="Plan features summary..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Price</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Billing Cycle</label>
                    <select
                      value={formData.billingCycle}
                      onChange={e => setFormData({...formData, billingCycle: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors appearance-none"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Included Features</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                    {AVAILABLE_FEATURES.map((feature) => (
                      <label key={feature.key} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer hover:border-primary/50 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{feature.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{feature.description}</p>
                        </div>
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-md border-gray-300 text-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-600"
                          checked={formData.features.includes(feature.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, features: [...formData.features, feature.key] });
                            } else {
                              setFormData({ ...formData, features: formData.features.filter(f => f !== feature.key) });
                            }
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer mt-2 group">
                  <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${formData.isActive ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Active Plan</span>
                </label>

                <div className="pt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-12 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
