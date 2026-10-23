'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FileCode2, Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/marketplace-templates');
      setTemplates(res.data);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/marketplace-templates/admin/${id}`);
      setTemplates(templates.filter(t => t.id !== id));
      toast.success('Template deleted');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileCode2 className="w-8 h-8 text-indigo-500" /> Template Marketplace Builder
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Design and publish PDF templates for agencies</p>
        </div>
        <Link 
          href="/super-admin/templates/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold transition-all"
        >
          <Plus className="w-5 h-5" /> Create Template
        </Link>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-100 dark:border-gray-800 p-6 flex flex-col hover:border-indigo-500 transition-colors shadow-sm relative overflow-hidden">
              
              {template.isPremium && (
                <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Premium
                </div>
              )}

              <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 overflow-hidden">
                {template.previewImageUrl ? (
                  <img src={template.previewImageUrl} alt="Preview" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                ) : (
                  <>
                    <FileCode2 className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-sm font-semibold">No Preview Image</span>
                  </>
                )}
              </div>

              <div className="mb-2">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{template.category}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{template.name}</h3>
              </div>
              
              <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-grow">{template.description}</p>
              
              <div className="flex justify-between items-center mt-auto border-t border-gray-100 dark:border-gray-800 pt-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${template.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {template.isPublished ? 'Published' : 'Draft'}
                </span>
                
                <div className="flex gap-2">
                  <Link href={`/super-admin/templates/${template.id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                    Edit
                  </Link>
                  <button onClick={() => deleteTemplate(template.id)} className="text-sm font-bold text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="col-span-full h-40 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-gray-400 font-bold">
              No templates created yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
