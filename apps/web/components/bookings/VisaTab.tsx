'use client';

import { useState, useEffect, useCallback } from 'react';
import { visaApplicationsApi, bookingsApi } from '@/lib/api';
import type { VisaApplication, VisaChecklistItem } from '@/types/visa';
import type { Traveller } from '@/types/traveller';
import {
  VisaStatus,
  VisaChecklistStatus,
  VISA_STATUS_LABELS,
  VISA_STATUS_COLORS,
  VISA_STATUS_INDICATORS,
  VISA_CHECKLIST_STATUS_LABELS,
  VISA_CHECKLIST_STATUS_COLORS,
  VISA_CHECKLIST_STATUS_INDICATORS,
} from '@/types/visa';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface VisaTabProps {
  bookingId: string;
  travellers: Traveller[];
  destination: string;
  onUpdate?: () => void;
}

export default function VisaTab({ bookingId, travellers, destination, onUpdate }: VisaTabProps) {
  const [visaApplications, setVisaApplications] = useState<VisaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedVisa, setSelectedVisa] = useState<VisaApplication | null>(null);
  const [generating, setGenerating] = useState(false);

  const fetchVisaApplications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await visaApplicationsApi.getAll({ bookingId });
      setVisaApplications(data);
    } catch (error) {
      console.error('Failed to fetch visa applications:', error);
      toast.error('Failed to load visa applications');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchVisaApplications();
  }, [fetchVisaApplications]);

  const handleGenerateVisas = async () => {
    try {
      setGenerating(true);
      await bookingsApi.generateVisas(bookingId);
      toast.success('Visa applications generated successfully');
      await fetchVisaApplications();
      onUpdate?.();
    } catch (error: any) {
      console.error('Failed to generate visas:', error);
      toast.error(error.response?.data?.message || 'Failed to generate visa applications');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (visaId: string, newStatus: VisaStatus) => {
    try {
      await visaApplicationsApi.updateStatus(visaId, newStatus);
      toast.success('Visa status updated');
      await fetchVisaApplications();
      onUpdate?.();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleChecklistStatusChange = async (itemId: string, newStatus: VisaChecklistStatus) => {
    try {
      await visaApplicationsApi.checklist.update(itemId, { status: newStatus });
      toast.success('Checklist updated');
      await fetchVisaApplications();
    } catch (error: any) {
      console.error('Failed to update checklist:', error);
      toast.error('Failed to update checklist item');
    }
  };

  const handleUpdateVisa = async (visaId: string, data: any) => {
    try {
      await visaApplicationsApi.update(visaId, data);
      toast.success('Visa application updated');
      await fetchVisaApplications();
      setSelectedVisa(null);
      onUpdate?.();
    } catch (error: any) {
      console.error('Failed to update visa:', error);
      toast.error(error.response?.data?.message || 'Failed to update visa application');
    }
  };

  const groupedByStatus = (visaApplications || []).reduce((acc, visa) => {
    if (!acc[visa.status]) {
      acc[visa.status] = [];
    }
    acc[visa.status].push(visa);
    return acc;
  }, {} as Record<VisaStatus, VisaApplication[]>);

  const statusColumns: VisaStatus[] = [
    VisaStatus.NOT_STARTED,
    VisaStatus.COLLECTING_DOCS,
    VisaStatus.SUBMITTED,
    VisaStatus.PROCESSING,
    VisaStatus.APPROVED,
    VisaStatus.REJECTED,
  ];

  if (loading) {
    return <div className="text-center py-12 animate-pulse">Loading visa applications...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Visa Applications for {destination}
          </h3>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
            {(visaApplications || []).length} {(visaApplications || []).length === 1 ? 'Application' : 'Applications'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              📊 Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              📋 List
            </button>
          </div>

          {(visaApplications || []).length === 0 && travellers.length > 0 && (
            <button
              onClick={handleGenerateVisas}
              disabled={generating}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Generating...
                </>
              ) : (
                <>
                  ➕ Generate Visa Applications
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {(visaApplications || []).length === 0 ? (
        <div className="text-center py-16 bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <span className="text-4xl">🛂</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Visa Applications Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {travellers.length === 0
              ? 'Add travellers to this booking first, then generate visa applications.'
              : 'Click "Generate Visa Applications" to create visa applications for all travellers.'}
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statusColumns.map((status) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{VISA_STATUS_INDICATORS[status]}</span>
                  <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                    {VISA_STATUS_LABELS[status]}
                  </h4>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-600 dark:text-gray-400">
                  {groupedByStatus[status]?.length || 0}
                </span>
              </div>
              
              <div className="space-y-2">
                {groupedByStatus[status]?.map((visa) => (
                  <div
                    key={visa.id}
                    onClick={() => setSelectedVisa(visa)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                        {visa.traveller?.name}
                      </h5>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <p>📍 {visa.destination}</p>
                      {visa.visaType && <p>🎫 {visa.visaType}</p>}
                      {visa.expectedDate && (
                        <p>📅 {format(new Date(visa.expectedDate), 'dd MMM yyyy')}</p>
                      )}
                      {visa.expiryDate && (
                        <p className="text-red-500 dark:text-red-400">
                          ⌛ {format(new Date(visa.expiryDate), 'dd MMM yyyy')}
                        </p>
                      )}
                      {visa.checklistItems && visa.checklistItems.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs">
                            ✅ {visa.checklistItems.filter(i => i.status === VisaChecklistStatus.RECEIVED).length}/
                            {visa.checklistItems.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {visaApplications.map((visa) => (
            <div
              key={visa.id}
              onClick={() => setSelectedVisa(visa)}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="font-bold text-lg text-gray-900 dark:text-white">
                      {visa.traveller?.name}
                    </h5>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${VISA_STATUS_COLORS[visa.status]}`}>
                      {VISA_STATUS_INDICATORS[visa.status]} {VISA_STATUS_LABELS[visa.status]}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Destination</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{visa.destination}</p>
                    </div>
                    {visa.visaType && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Visa Type</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{visa.visaType}</p>
                      </div>
                    )}
                    {visa.expectedDate && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Expected Date</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {format(new Date(visa.expectedDate), 'dd MMM yyyy')}
                        </p>
                      </div>
                    )}
                    {visa.expiryDate && (
                      <div>
                        <p className="text-red-500 dark:text-red-400">Expiry Date</p>
                        <p className="font-semibold text-red-600 dark:text-red-300">
                          {format(new Date(visa.expiryDate), 'dd MMM yyyy')}
                        </p>
                      </div>
                    )}
                    {visa.checklistItems && visa.checklistItems.length > 0 && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Checklist Progress</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {visa.checklistItems.filter(i => i.status === VisaChecklistStatus.RECEIVED).length}/
                          {visa.checklistItems.length} received
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visa Detail Modal */}
      {selectedVisa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedVisa(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {selectedVisa.traveller?.name} - Visa Application
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedVisa.destination}
                </p>
              </div>
              <button
                onClick={() => setSelectedVisa(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={selectedVisa.status}
                  onChange={(e) => handleStatusChange(selectedVisa.id, e.target.value as VisaStatus)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  {statusColumns.map((status) => (
                    <option key={status} value={status}>
                      {VISA_STATUS_INDICATORS[status]} {VISA_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Checklist */}
              {selectedVisa.checklistItems && selectedVisa.checklistItems.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Document Checklist</h4>
                  <div className="space-y-2">
                    {selectedVisa.checklistItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{VISA_CHECKLIST_STATUS_INDICATORS[item.status]}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.itemName}
                              {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </p>
                          </div>
                        </div>
                        <select
                          value={item.status}
                          onChange={(e) => handleChecklistStatusChange(item.id, e.target.value as VisaChecklistStatus)}
                          className={`px-3 py-1 rounded-md text-xs font-bold border-0 ${VISA_CHECKLIST_STATUS_COLORS[item.status]}`}
                        >
                          {Object.values(VisaChecklistStatus).map((status) => (
                            <option key={status} value={status}>
                              {VISA_CHECKLIST_STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedVisa.visaNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Visa Number
                    </label>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedVisa.visaNumber}</p>
                  </div>
                )}
                {selectedVisa.submittedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Submitted On
                    </label>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {format(new Date(selectedVisa.submittedAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                )}
                {selectedVisa.approvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Approved On
                    </label>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {format(new Date(selectedVisa.approvedAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                )}
                {selectedVisa.expiryDate && (
                  <div>
                    <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                      Expiry Date
                    </label>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {format(new Date(selectedVisa.expiryDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                )}
              </div>

              {selectedVisa.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Rejection Reason</p>
                  <p className="text-red-700 dark:text-red-300">{selectedVisa.rejectionReason}</p>
                </div>
              )}

              {selectedVisa.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    {selectedVisa.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
