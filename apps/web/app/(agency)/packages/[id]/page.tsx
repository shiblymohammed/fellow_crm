"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import ItineraryTemplateBuilder from '@/components/packages/ItineraryTemplateBuilder';
import GeneratePdfModal from '@/components/pdf/GeneratePdfModal';

interface PackageItem {
  id?: string;
  category: 'hotel' | 'flight' | 'transfer' | 'activity' | 'meal' | 'visa' | 'insurance' | 'other';
  name: string;
  description: string;
  supplierCost: number;
  markupType: 'fixed' | 'percentage';
  markupValue: number;
  customerPrice: number;
  sortOrder: number;
}

export default function PackageBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const [pkg, setPkg] = useState<any>(null);
  const [items, setItems] = useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'pricing' | 'itinerary'>('pricing');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    fetchPackage();
  }, [params.id]);

  const fetchPackage = async () => {
    try {
      const { data } = await api.get(`/packages/${params.id}`);
      setPkg(data);
      setItems(data.packageItems.map((item: any) => ({
        ...item,
        supplierCost: Number(item.supplierCost),
        markupValue: Number(item.markupValue),
        customerPrice: Number(item.customerPrice)
      })));
    } catch (error) {
      toast.error('Failed to load package');
      router.push('/packages');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePrice = (cost: number, type: string, value: number) => {
    if (type === 'fixed') return cost + value;
    if (type === 'percentage') return cost + (cost * value) / 100;
    return cost;
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        category: 'hotel',
        name: '',
        description: '',
        supplierCost: 0,
        markupType: 'percentage',
        markupValue: 10,
        customerPrice: 0,
        sortOrder: items.length
      }
    ]);
  };

  const handleItemChange = (index: number, field: keyof PackageItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto calculate if pricing fields changed
    if (field === 'supplierCost' || field === 'markupType' || field === 'markupValue') {
      newItems[index].customerPrice = calculatePrice(
        newItems[index].supplierCost,
        newItems[index].markupType,
        newItems[index].markupValue
      );
    }
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch(`/packages/${params.id}`, { items });
      toast.success('Package saved successfully!');
      fetchPackage();
    } catch (error) {
      toast.error('Failed to save package');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !pkg) return <div className="p-8 animate-pulse text-center">Loading builder...</div>;

  const totalSupplier = items.reduce((acc, item) => acc + item.supplierCost, 0);
  const totalCustomer = items.reduce((acc, item) => acc + item.customerPrice, 0);
  const totalProfit = totalCustomer - totalSupplier;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm">
        <div>
          <button onClick={() => router.push('/packages')} className="text-primary text-sm font-bold flex items-center gap-1 mb-2 hover:underline">
            ← Back to Packages
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            {pkg.name}
            {!pkg.is_active && <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-lg uppercase tracking-wider">Draft</span>}
          </h1>
          <p className="text-gray-500 mt-1">📍 {pkg.destination} • {pkg.duration_nights}N / {pkg.duration_days}D</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPdfModalOpen(true)}
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold py-3 px-6 rounded-2xl transition-all active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Generate PDF
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Save Package'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-sm">
          <p className="text-sm font-bold text-gray-500 uppercase">Total Supplier Cost</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">₹{totalSupplier.toLocaleString()}</p>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-sm">
          <p className="text-sm font-bold text-gray-500 uppercase">Customer Price</p>
          <p className="text-3xl font-extrabold text-primary mt-1">₹{totalCustomer.toLocaleString()}</p>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-sm">
          <p className="text-sm font-bold text-gray-500 uppercase">Gross Profit</p>
          <p className="text-3xl font-extrabold text-green-600 mt-1">₹{totalProfit.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-px">
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'pricing'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Pricing & Items
        </button>
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'itinerary'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Itinerary Builder
        </button>
      </div>

      {activeTab === 'pricing' ? (
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Itinerary Items</h2>
          <button onClick={handleAddItem} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-2 px-4 rounded-xl transition-colors text-sm">
            + Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            <p className="text-gray-500 font-medium">No items in this package yet.</p>
            <button onClick={handleAddItem} className="mt-2 text-primary font-bold hover:underline">Add the first item</button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 relative group">
                
                <button onClick={() => handleRemoveItem(index)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 hover:bg-red-200 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  ✕
                </button>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select 
                    value={item.category} 
                    onChange={e => handleItemChange(index, 'category', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:border-primary outline-none"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="flight">Flight</option>
                    <option value="transfer">Transfer</option>
                    <option value="activity">Activity</option>
                    <option value="meal">Meal</option>
                    <option value="visa">Visa</option>
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name & Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 3 Nights at Ritz Carlton" 
                    value={item.name} 
                    onChange={e => handleItemChange(index, 'name', e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:border-primary outline-none mb-2"
                  />
                  <input 
                    type="text" 
                    placeholder="Details (Optional)" 
                    value={item.description || ''} 
                    onChange={e => handleItemChange(index, 'description', e.target.value)}
                    className="w-full h-8 px-3 text-sm rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:border-primary outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Supplier Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input 
                      type="number" 
                      min="0"
                      value={item.supplierCost} 
                      onChange={e => handleItemChange(index, 'supplierCost', parseFloat(e.target.value) || 0)}
                      className="w-full h-10 pl-8 pr-3 rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Markup</label>
                  <div className="flex gap-2">
                    <select 
                      value={item.markupType} 
                      onChange={e => handleItemChange(index, 'markupType', e.target.value)}
                      className="w-16 h-10 px-1 rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:border-primary outline-none text-center"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">₹</option>
                    </select>
                    <input 
                      type="number" 
                      min="0"
                      value={item.markupValue} 
                      onChange={e => handleItemChange(index, 'markupValue', parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 rounded-lg border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Price</label>
                  <div className="w-full h-10 px-3 bg-primary/10 text-primary font-bold rounded-lg flex items-center">
                    ₹{item.customerPrice.toLocaleString()}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
      ) : (
        <div className="pt-2">
          <ItineraryTemplateBuilder packageId={params.id as string} durationDays={pkg.duration_days} />
        </div>
      )}
      
      <GeneratePdfModal 
        isOpen={isPdfModalOpen} 
        onClose={() => setIsPdfModalOpen(false)} 
        category="itinerary" 
        autoFieldsData={{ 
          booking: { 
            destination: pkg.destination, 
            customer: { name: 'Customer Name Placeholder' } 
          }, 
          itinerary: { 
            days: [] // We can populate this with actual itinerary days if we build it 
          } 
        }} 
      />
    </div>
  );
}
