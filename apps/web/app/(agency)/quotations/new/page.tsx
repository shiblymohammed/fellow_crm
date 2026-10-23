"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function NewQuotationPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    leadId: '',
    packageId: '',
    destination: '',
    adults: 2,
    children: 0,
    infants: 0,
    travelDate: '',
    returnDate: '',
    notes: '',
  });

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, packRes] = await Promise.all([
        api.get('/customers'),
        api.get('/packages'),
      ]);
      setCustomers(custRes.data);
      setPackages(packRes.data);
    } catch (error) {
      toast.error('Failed to load initial data');
    }
  };

  const handleCustomerChange = async (customerId: string) => {
    setFormData({ ...formData, customerId, leadId: '' });
    if (!customerId) return setLeads([]);
    try {
      const { data } = await api.get(`/customers/${customerId}`);
      setLeads(data.leads || []);
    } catch (error) {
      toast.error('Failed to load customer leads');
    }
  };

  const handlePackageChange = async (packageId: string) => {
    setFormData({ ...formData, packageId });
    if (!packageId) return setItems([]);
    try {
      const { data } = await api.get(`/packages/${packageId}`);
      setFormData(prev => ({ ...prev, destination: data.destination || prev.destination }));
      setItems(data.packageItems.map((item: any) => ({
        category: item.category,
        name: item.name,
        description: item.description,
        supplierCost: Number(item.supplierCost),
        markupType: item.markupType,
        markupValue: Number(item.markupValue),
        customerPrice: Number(item.customerPrice),
        sortOrder: item.sortOrder
      })));
    } catch (error) {
      toast.error('Failed to load package details');
    }
  };

  const calculatePrice = (cost: number, type: string, value: number) => {
    if (type === 'fixed') return cost + value;
    if (type === 'percentage') return cost + (cost * value) / 100;
    return cost;
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (['supplierCost', 'markupType', 'markupValue'].includes(field)) {
      newItems[index].customerPrice = calculatePrice(
        newItems[index].supplierCost,
        newItems[index].markupType,
        newItems[index].markupValue
      );
    }
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { category: 'other', name: '', description: '', supplierCost: 0, markupType: 'percentage', markupValue: 10, customerPrice: 0, sortOrder: items.length }
    ]);
  };

  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return toast.error('Please select a customer');
    
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData };
      if (!payload.leadId) delete payload.leadId;
      if (!payload.packageId) delete payload.packageId;
      
      await api.post('/quotations', {
        ...payload,
        items
      });
      toast.success('Quotation generated!');
      router.push(`/quotations`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSupplier = items.reduce((acc, item) => acc + item.supplierCost, 0);
  const totalCustomer = items.reduce((acc, item) => acc + item.customerPrice, 0);
  const totalProfit = totalCustomer - totalSupplier;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Create Quotation</h1>
          <p className="text-gray-500">Draft a new proposal for your client.</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70"
        >
          {isSubmitting ? 'Generating...' : 'Generate Quote'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Client Details</h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Select Customer *</label>
              <select value={formData.customerId} onChange={e => handleCustomerChange(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary outline-none">
                <option value="">-- Choose --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
              </select>
            </div>
            {leads.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Link to Lead (Optional)</label>
                <select value={formData.leadId} onChange={e => setFormData({...formData, leadId: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary outline-none">
                  <option value="">-- None --</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.destination || 'Unnamed Lead'} - {l.status}</option>)}
                </select>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Base Package</label>
              <select value={formData.packageId} onChange={e => handlePackageChange(e.target.value)} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary outline-none">
                <option value="">-- Custom Build --</option>
                {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-2">Selecting a package will auto-fill the itinerary below. You can customize costs per client.</p>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Trip Details</h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Destination</label>
              <input type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Travel Date</label>
                <input type="date" value={formData.travelDate} onChange={e => setFormData({...formData, travelDate: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Return Date</label>
                <input type="date" value={formData.returnDate} onChange={e => setFormData({...formData, returnDate: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Adults</label>
                <input type="number" min="1" value={formData.adults} onChange={e => setFormData({...formData, adults: parseInt(e.target.value)||1})} className="w-full h-10 px-2 text-center rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Child</label>
                <input type="number" min="0" value={formData.children} onChange={e => setFormData({...formData, children: parseInt(e.target.value)||0})} className="w-full h-10 px-2 text-center rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Infant</label>
                <input type="number" min="0" value={formData.infants} onChange={e => setFormData({...formData, infants: parseInt(e.target.value)||0})} className="w-full h-10 px-2 text-center rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-2xl border border-white/60 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-500 uppercase">Supplier Cost</p>
              <p className="text-2xl font-extrabold mt-1">₹{totalSupplier.toLocaleString()}</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-2xl border border-white/60 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-500 uppercase">Customer Price</p>
              <p className="text-2xl font-extrabold text-primary mt-1">₹{totalCustomer.toLocaleString()}</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-2xl border border-white/60 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-500 uppercase">Profit</p>
              <p className="text-2xl font-extrabold text-green-600 mt-1">₹{totalProfit.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Custom Itinerary</h2>
              <button onClick={handleAddItem} className="bg-gray-100 text-gray-900 font-bold py-2 px-4 rounded-xl text-sm">+ Add Item</button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 relative group">
                  <button onClick={() => handleRemoveItem(index)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  <div className="md:col-span-3">
                    <select value={item.category} onChange={e => handleItemChange(index, 'category', e.target.value)} className="w-full h-10 px-2 rounded-lg border-2 bg-gray-50 text-sm">
                      <option value="hotel">Hotel</option>
                      <option value="flight">Flight</option>
                      <option value="transfer">Transfer</option>
                      <option value="activity">Activity</option>
                      <option value="meal">Meal</option>
                      <option value="visa">Visa</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-9 flex flex-col gap-2">
                    <input type="text" placeholder="Name" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} className="w-full h-10 px-3 rounded-lg border-2 bg-gray-50" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-gray-400 text-sm">Cost ₹</span>
                        <input type="number" value={item.supplierCost} onChange={e => handleItemChange(index, 'supplierCost', parseFloat(e.target.value)||0)} className="w-full h-9 pl-14 pr-2 text-sm rounded-lg border-2 bg-gray-50" />
                      </div>
                      <div className="flex gap-1">
                        <select value={item.markupType} onChange={e => handleItemChange(index, 'markupType', e.target.value)} className="w-12 h-9 text-sm rounded-lg border-2 bg-gray-50 text-center px-0">
                          <option value="percentage">%</option><option value="fixed">₹</option>
                        </select>
                        <input type="number" value={item.markupValue} onChange={e => handleItemChange(index, 'markupValue', parseFloat(e.target.value)||0)} className="w-full h-9 px-2 text-sm rounded-lg border-2 bg-gray-50" />
                      </div>
                      <div className="h-9 px-3 bg-primary/10 text-primary font-bold rounded-lg flex items-center text-sm justify-center">
                        Price ₹{item.customerPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
