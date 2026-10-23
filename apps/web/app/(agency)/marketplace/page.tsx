'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Store, Star, Download, CheckCircle2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/marketplace-templates');
      setTemplates(res.data);
    } catch (error) {
      toast.error('Failed to load marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async (id: string) => {
    setInstallingId(id);
    try {
      await api.post(`/marketplace-templates/${id}/install`);
      toast.success('Template installed successfully!');
      
      // Update local state to show installed checkmark
      setTemplates(templates.map(t => 
        t.id === id ? { ...t, isInstalled: true } : t
      ));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to install template');
    } finally {
      setInstallingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-indigo-900/40 blur-3xl"></div>

        <div className="relative z-10 flex-1 space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-bold mb-2">
            <Store className="w-4 h-4" /> Template Marketplace
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Supercharge Your PDFs</h1>
          <p className="text-indigo-100 max-w-lg">
            Discover beautiful, conversion-optimized PDF templates for your itineraries and quotations. Install them instantly.
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="w-full md:w-64 h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-80 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white dark:bg-[#1a1c23] rounded-3xl border border-gray-100 dark:border-gray-800/50 p-2 flex flex-col hover:shadow-xl transition-all shadow-sm group">
              
              <div className="relative w-full h-56 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-4">
                {template.isPremium && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 z-10 shadow-lg">
                    <Star className="w-3 h-3 fill-white" /> Premium
                  </div>
                )}
                
                {template.previewImageUrl ? (
                  <img src={template.previewImageUrl} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Store className="w-10 h-10 opacity-30" />
                    <span className="text-sm font-semibold opacity-50">No Preview</span>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors pointer-events-none" />
              </div>

              <div className="px-4 pb-4 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest">{template.category}</span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{template.name}</h3>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 flex-grow">{template.description}</p>
                
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {template.isPremium ? (
                      <span className="flex items-center gap-1">
                        ${template.price}
                      </span>
                    ) : (
                      <span className="text-emerald-500">Free</span>
                    )}
                  </div>
                  
                  {template.isInstalled ? (
                    <button disabled className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-xl font-bold text-sm cursor-default">
                      <CheckCircle2 className="w-4 h-4" /> Installed
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleInstall(template.id)}
                      disabled={installingId === template.id}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" /> 
                      {installingId === template.id ? 'Installing...' : 'Install'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-gray-400 font-bold">
              <Store className="w-12 h-12 mb-4 opacity-50" />
              <p>No templates available in the marketplace yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
