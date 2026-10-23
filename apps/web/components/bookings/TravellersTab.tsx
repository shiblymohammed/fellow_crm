"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Traveller, CreateTravellerDto, UpdateTravellerDto } from '@/types/traveller';
import { format } from 'date-fns';

interface TravellersTabProps {
  bookingId: string;
  travellers: Traveller[];
  onUpdate: () => void;
}

export default function TravellersTab({ bookingId, travellers, onUpdate }: TravellersTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTraveller, setEditingTraveller] = useState<Traveller | null>(null);
  const [formData, setFormData] = useState<Partial<CreateTravellerDto>>({
    bookingId,
    name: '',
    type: 'adult',
    gender: undefined,
    dateOfBirth: '',
    passportNumber: '',
    passportExpiry: '',
    placeOfBirth: '',
    nationality: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      bookingId,
      name: '',
      type: 'adult',
      gender: undefined,
      dateOfBirth: '',
      passportNumber: '',
      passportExpiry: '',
      placeOfBirth: '',
      nationality: '',
    });
    setEditingTraveller(null);
    setShowForm(false);
  };

  const handleEdit = (traveller: Traveller) => {
    setEditingTraveller(traveller);
    setFormData({
      bookingId,
      name: traveller.name,
      type: traveller.type,
      gender: traveller.gender,
      dateOfBirth: traveller.dateOfBirth || '',
      passportNumber: traveller.passportNumber || '',
      passportExpiry: traveller.passportExpiry || '',
      placeOfBirth: traveller.placeOfBirth || '',
      nationality: traveller.nationality || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTraveller) {
        // Update existing traveller
        const updateData: UpdateTravellerDto = {
          name: formData.name,
          type: formData.type,
          gender: formData.gender || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          passportNumber: formData.passportNumber || undefined,
          passportExpiry: formData.passportExpiry || undefined,
          placeOfBirth: formData.placeOfBirth || undefined,
          nationality: formData.nationality || undefined,
        };
        await api.patch(`/travellers/${editingTraveller.id}`, updateData);
        toast.success('Traveller updated successfully');
      } else {
        // Create new traveller
        const createData: CreateTravellerDto = {
          bookingId,
          name: formData.name!,
          type: formData.type!,
          gender: formData.gender || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          passportNumber: formData.passportNumber || undefined,
          passportExpiry: formData.passportExpiry || undefined,
          placeOfBirth: formData.placeOfBirth || undefined,
          nationality: formData.nationality || undefined,
        };
        await api.post('/travellers', createData);
        toast.success('Traveller added successfully');
      }
      
      resetForm();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${editingTraveller ? 'update' : 'add'} traveller`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (travellerId: string, travellerName: string) => {
    if (!confirm(`Are you sure you want to delete ${travellerName}?`)) {
      return;
    }

    try {
      await api.delete(`/travellers/${travellerId}`);
      toast.success('Traveller deleted successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete traveller');
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'adult': return '👤';
      case 'child': return '👦';
      case 'infant': return '👶';
      default: return '👤';
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'adult': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'child': return 'bg-green-50 text-green-700 border-green-200';
      case 'infant': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Travellers</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage traveller information for this booking
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Traveller
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingTraveller ? 'Edit Traveller' : 'Add New Traveller'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter full name"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="adult">Adult</option>
                  <option value="child">Child</option>
                  <option value="infant">Infant</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any || undefined })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Passport Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Passport Number
                </label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter passport number"
                />
              </div>

              {/* Passport Expiry */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Passport Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.passportExpiry}
                  onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Place of Birth */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Place of Birth
                </label>
                <input
                  type="text"
                  value={formData.placeOfBirth}
                  onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter place of birth"
                />
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter nationality"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : editingTraveller ? 'Update Traveller' : 'Add Traveller'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Travellers List */}
      <div className="space-y-4">
        {travellers.length === 0 ? (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No travellers added yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {showForm ? 'Fill out the form above to add the first traveller' : 'Click "Add Traveller" to get started'}
            </p>
          </div>
        ) : (
          travellers.map((traveller) => (
            <div
              key={traveller.id}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4 flex-1">
                  <div className="text-4xl">{getTypeIcon(traveller.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {traveller.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(traveller.type)}`}>
                        {traveller.type}
                      </span>
                      {traveller.customerId && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Primary Customer
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {traveller.dateOfBirth && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Date of Birth</p>
                          <p className="text-gray-900 dark:text-white font-bold">
                            {format(new Date(traveller.dateOfBirth), 'dd MMM yyyy')}
                          </p>
                        </div>
                      )}
                      {traveller.gender && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Gender</p>
                          <p className="text-gray-900 dark:text-white font-bold capitalize">
                            {traveller.gender}
                          </p>
                        </div>
                      )}
                      {traveller.passportNumber && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Passport</p>
                          <p className="text-gray-900 dark:text-white font-bold">
                            {traveller.passportNumber}
                          </p>
                        </div>
                      )}
                      {traveller.passportExpiry && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Passport Expiry</p>
                          <p className="text-gray-900 dark:text-white font-bold">
                            {format(new Date(traveller.passportExpiry), 'dd MMM yyyy')}
                          </p>
                        </div>
                      )}
                      {traveller.nationality && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Nationality</p>
                          <p className="text-gray-900 dark:text-white font-bold">
                            {traveller.nationality}
                          </p>
                        </div>
                      )}
                      {traveller.placeOfBirth && (
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Place of Birth</p>
                          <p className="text-gray-900 dark:text-white font-bold">
                            {traveller.placeOfBirth}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(traveller)}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(traveller.id, traveller.name)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
