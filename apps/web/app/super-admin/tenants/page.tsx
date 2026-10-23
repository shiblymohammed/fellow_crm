"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FeaturesModal } from '@/components/super-admin/FeaturesModal';
import BillingModal from '@/components/super-admin/BillingModal';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  ownerName: string | null;
  ownerEmail: string;
  ownerPhone: string | null;
  status: string;
  planId: string | null;
  plan?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Plan {
  id: string;
  name: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  
  // Feature Modal states
  const [selectedFeatureTenant, setSelectedFeatureTenant] = useState<{id: string, name: string} | null>(null);
  
  // Billing Modal states
  const [selectedBillingTenant, setSelectedBillingTenant] = useState<{id: string, name: string} | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    status: 'trial',
    planId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTenants();
    fetchPlans();
  }, []);

  const fetchTenants = async () => {
    try {
      const { data } = await api.get('/tenants');
      setTenants(data);
    } catch (error) {
      toast.error('Failed to load agencies');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/plans');
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans for dropdown', error);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentTenantId(null);
    setFormData({
      name: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      status: 'trial',
      planId: plans[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setIsEditing(true);
    setCurrentTenantId(tenant.id);
    setFormData({
      name: tenant.name,
      ownerName: tenant.ownerName || '',
      ownerEmail: tenant.ownerEmail,
      ownerPhone: tenant.ownerPhone || '',
      status: tenant.status,
      planId: tenant.planId || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing && currentTenantId) {
        await api.patch(`/tenants/${currentTenantId}`, formData);
        toast.success('Agency updated successfully');
      } else {
        const { data } = await api.post('/tenants', formData);
        if (data.defaultPassword) {
          toast.success(`Agency created! Temporary Password: ${data.defaultPassword}`, { duration: 15000, icon: '🔐' });
        } else {
          toast.success('Agency created successfully');
        }
      }
      setIsModalOpen(false);
      fetchTenants();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isEditing ? 'Failed to update agency' : 'Failed to create agency'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'trial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suspended': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Agencies (Tenants)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Manage travel agencies and their subscriptions on the platform.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="relative z-10 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Agency
        </button>
      </div>

      {/* List of Agencies */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-white/50 dark:bg-gray-700/50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No agencies found</h3>
            <p className="text-gray-500 mt-1">Start by adding a travel agency to the platform.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100/50 dark:divide-gray-700/50">
            {tenants.map(tenant => (
              <div key={tenant.id} className="p-5 sm:p-6 hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm shrink-0">
                    <span className="text-lg font-bold text-primary uppercase">{tenant.name.substring(0, 2)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {tenant.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {tenant.ownerEmail}
                      </span>
                      {tenant.ownerPhone && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <span className="text-sm font-medium text-gray-500">{tenant.ownerPhone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto md:justify-end border-t md:border-t-0 border-gray-100 dark:border-gray-700/50 pt-4 md:pt-0">
                  <div className="flex flex-col items-start md:items-end flex-1 md:flex-none">
                    <span className={`px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-lg border ${getStatusColor(tenant.status)} shadow-sm`}>
                      {tenant.status}
                    </span>
                    <span className="text-sm font-semibold text-gray-500 mt-1">
                      Plan: {tenant.plan?.name || 'None'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedFeatureTenant({ id: tenant.id, name: tenant.name });
                    }}
                    className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50 transition-all shadow-sm active:scale-95 shrink-0"
                    title="Manage Features"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBillingTenant({ id: tenant.id, name: tenant.name });
                    }}
                    className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50 transition-all shadow-sm active:scale-95 shrink-0"
                    title="Billing History"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(tenant)}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary border border-gray-200 dark:border-gray-700 transition-all shadow-sm active:scale-95 shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {isEditing ? 'Edit Agency' : 'Add Agency'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-2">Agency Info</h3>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Agency Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors"
                        placeholder="e.g. Dream Travels"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Plan</label>
                      <select
                        value={formData.planId}
                        onChange={e => setFormData({...formData, planId: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors appearance-none"
                      >
                        <option value="">Select a plan</option>
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors appearance-none"
                      >
                        <option value="trial">Trial</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-2">Owner Info</h3>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Owner Name</label>
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={e => setFormData({...formData, ownerName: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Owner Email</label>
                      <input
                        type="email"
                        required
                        value={formData.ownerEmail}
                        onChange={e => setFormData({...formData, ownerEmail: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Owner Phone</label>
                      <input
                        type="text"
                        value={formData.ownerPhone}
                        onChange={e => setFormData({...formData, ownerPhone: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-0 outline-none transition-colors"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-14 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Agency'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedFeatureTenant && (
        <FeaturesModal
          tenantId={selectedFeatureTenant.id}
          tenantName={selectedFeatureTenant.name}
          onClose={() => setSelectedFeatureTenant(null)}
        />
      )}

      {selectedBillingTenant && (
        <BillingModal
          tenantId={selectedBillingTenant.id}
          tenantName={selectedBillingTenant.name}
          onClose={() => setSelectedBillingTenant(null)}
        />
      )}
    </div>
  );
}
