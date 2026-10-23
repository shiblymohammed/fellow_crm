import React, { useState, useEffect } from 'react';
import { supplierBookingsApi, suppliersApi } from '@/lib/api';
import { SupplierBooking, PackageCategory, SupplierBookingStatus } from '@/types/supplier-booking';
import { Supplier } from '@/types/supplier';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Props {
  bookingId: string;
  onUpdate: () => void;
}

export default function SupplierBookingsTab({ bookingId, onUpdate }: Props) {
  const [supplierBookings, setSupplierBookings] = useState<SupplierBooking[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [supplierId, setSupplierId] = useState('');
  const [serviceType, setServiceType] = useState<PackageCategory>('hotel');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<SupplierBookingStatus>('pending');
  const [description, setDescription] = useState('');
  const [confirmationRef, setConfirmationRef] = useState('');

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookingsData, suppliersData] = await Promise.all([
        supplierBookingsApi.getAllByBooking(bookingId),
        suppliersApi.getAll({ isActive: true }),
      ]);
      setSupplierBookings(bookingsData);
      setSuppliers(suppliersData);
    } catch (error) {
      toast.error('Failed to load supplier bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSupplierId('');
    setServiceType('hotel');
    setAmount('');
    setStatus('pending');
    setDescription('');
    setConfirmationRef('');
  };

  const handleEdit = (booking: SupplierBooking) => {
    setEditingId(booking.id);
    setSupplierId(booking.supplierId);
    setServiceType(booking.serviceType);
    setAmount(booking.amount.toString());
    setStatus(booking.status);
    setDescription(booking.description || '');
    setConfirmationRef(booking.confirmationRef || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier booking?')) return;
    
    try {
      await supplierBookingsApi.delete(id);
      toast.success('Supplier booking deleted');
      fetchData();
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete supplier booking');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !amount || isNaN(Number(amount))) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    try {
      const payload = {
        supplierId,
        bookingId,
        serviceType,
        amount: Number(amount),
        status,
        description,
        confirmationRef,
      };

      if (editingId) {
        await supplierBookingsApi.update(editingId, payload);
        toast.success('Supplier booking updated');
      } else {
        await supplierBookingsApi.create(payload);
        toast.success('Supplier booking added');
      }

      setIsModalOpen(false);
      resetForm();
      fetchData();
      onUpdate();
    } catch (error) {
      toast.error('Failed to save supplier booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading supplier bookings...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Supplier Bookings</h3>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-bold transition-colors"
        >
          + Add Supplier
        </button>
      </div>

      {supplierBookings.length === 0 ? (
        <div className="text-center py-12 bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No suppliers assigned to this booking yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {supplierBookings.map((booking) => (
            <div key={booking.id} className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {booking.supplier?.companyName}
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                    {booking.serviceType}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="font-bold text-gray-900 dark:text-white">₹{Number(booking.amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Confirmation Ref</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{booking.confirmationRef || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{booking.description || '-'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex sm:flex-col gap-2 justify-start sm:justify-center">
                <button 
                  onClick={() => handleEdit(booking)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-semibold transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(booking.id)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingId ? 'Edit Supplier Booking' : 'Add Supplier Booking'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Supplier *</label>
                <select 
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Select a supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.companyName} ({s.destination || 'Global'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Service Type *</label>
                  <select 
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value as PackageCategory)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="flight">Flight</option>
                    <option value="transfer">Transfer</option>
                    <option value="activity">Activity</option>
                    <option value="tour">Tour</option>
                    <option value="meal">Meal</option>
                    <option value="visa">Visa</option>
                    <option value="insurance">Insurance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount (Cost) *</label>
                  <input 
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="0.00"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select 
                    value={status}
                    onChange={e => setStatus(e.target.value as SupplierBookingStatus)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Confirmation Ref</label>
                  <input 
                    type="text"
                    value={confirmationRef}
                    onChange={e => setConfirmationRef(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. HILTON-123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description / Notes</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors"
                >
                  {editingId ? 'Save Changes' : 'Add Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
