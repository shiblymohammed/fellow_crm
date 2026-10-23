import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface FeaturesModalProps {
  tenantId: string;
  tenantName: string;
  onClose: () => void;
}

const AVAILABLE_FEATURES = [
  { key: 'leads_crm', name: 'Leads CRM', description: 'Manage and track prospective travelers.' },
  { key: 'itinerary_builder', name: 'Itinerary Builder', description: 'Create rich, interactive itineraries.' },
  { key: 'payments', name: 'Payments Integration', description: 'Accept online payments from clients.' },
  { key: 'custom_domain', name: 'Custom Domain', description: 'White-label the client portal.' },
  { key: 'api_access', name: 'API Access', description: 'Developer access to the agency data.' },
];

export function FeaturesModal({ tenantId, tenantName, onClose }: FeaturesModalProps) {
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const { data } = await api.get(`/features/tenant/${tenantId}`);
        const featureMap: Record<string, boolean> = {};
        data.forEach((f: any) => {
          featureMap[f.featureKey] = f.isEnabled;
        });
        setFeatures(featureMap);
      } catch (error) {
        toast.error('Failed to load features');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatures();
  }, [tenantId]);

  const handleToggle = (key: string) => {
    setFeatures(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save all features in parallel or sequentially. We'll do sequentially for simplicity and error tracking.
      for (const feature of AVAILABLE_FEATURES) {
        // Only save if it was toggled or explicitly set
        if (features[feature.key] !== undefined) {
           await api.patch(`/features/tenant/${tenantId}`, {
             featureKey: feature.key,
             isEnabled: features[feature.key]
           });
        }
      }
      toast.success('Features updated successfully', { icon: '🚀' });
      onClose();
    } catch (error) {
      toast.error('Failed to save features');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="p-8 pb-6 border-b border-gray-100 dark:border-gray-700/50 shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Toggles</h2>
              <p className="text-gray-500 text-sm mt-1">Manage platform capabilities for <span className="font-bold text-primary">{tenantName}</span></p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : (
            AVAILABLE_FEATURES.map((feature) => (
              <div key={feature.key} className="flex items-center justify-between p-5 rounded-2xl border-2 border-gray-50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 hover:border-primary/30 transition-colors group">
                <div className="pr-4">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{feature.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                </div>
                
                <label className="relative flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={features[feature.key] || false}
                    onChange={() => handleToggle(feature.key)}
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700/50 shrink-0 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="flex-1 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <span className="animate-pulse">Saving Changes...</span>
            ) : (
              'Save Feature Flags'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
