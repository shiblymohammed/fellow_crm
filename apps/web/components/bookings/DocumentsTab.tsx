'use client';

import { useState, useEffect, useCallback } from 'react';
import { documentsApi } from '@/lib/api';
import type { TravellerDocument, DocumentType, DocumentStatus } from '@/types/document';
import type { Traveller } from '@/types/traveller';
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_COLORS,
  DOCUMENT_STATUS_INDICATORS,
} from '@/types/document';
import { DocumentType as DocTypeEnum } from '@/types/document';

interface DocumentsTabProps {
  bookingId: string;
  travellers: Traveller[];
  onUpdate?: () => void;
}

export default function DocumentsTab({ bookingId, travellers, onUpdate }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<TravellerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedTraveller, setSelectedTraveller] = useState<string>('');
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>(DocTypeEnum.PASSPORT);
  const [dragActive, setDragActive] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentsApi.getAll({ bookingId });
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileSelect = async (file: File) => {
    if (!selectedTraveller) {
      alert('Please select a traveller first');
      return;
    }

    try {
      setUploading(true);
      await documentsApi.upload(file, {
        travellerId: selectedTraveller,
        bookingId,
        docType: selectedDocType,
      });
      await fetchDocuments();
      onUpdate?.();
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleVerify = async (docId: string) => {
    try {
      await documentsApi.verify(docId);
      await fetchDocuments();
      onUpdate?.();
    } catch (error) {
      console.error('Verify failed:', error);
    }
  };

  const handleReject = async (docId: string) => {
    if (!rejectionNote.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    try {
      await documentsApi.reject(docId, rejectionNote);
      await fetchDocuments();
      setRejectingDocId(null);
      setRejectionNote('');
      onUpdate?.();
    } catch (error) {
      console.error('Reject failed:', error);
    }
  };

  const handleMarkMissing = async (docId: string) => {
    try {
      await documentsApi.markMissing(docId);
      await fetchDocuments();
      onUpdate?.();
    } catch (error) {
      console.error('Mark missing failed:', error);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentsApi.delete(docId);
      await fetchDocuments();
      onUpdate?.();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleCreatePlaceholders = async () => {
    try {
      await documentsApi.createPlaceholders(bookingId);
      await fetchDocuments();
      onUpdate?.();
    } catch (error) {
      console.error('Create placeholders failed:', error);
    }
  };

  const getDocumentsForTraveller = (travellerId: string) => {
    return (documents || []).filter((doc) => doc.travellerId === travellerId);
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const indicator = DOCUMENT_STATUS_INDICATORS[status];
    const label = DOCUMENT_STATUS_LABELS[status];
    const colorClass = DOCUMENT_STATUS_COLORS[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        <span>{indicator}</span>
        <span>{label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with action button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Travel Documents</h3>
          <p className="text-sm text-gray-500 mt-1">
            Upload and verify documents for each traveller
          </p>
        </div>
        <button
          onClick={handleCreatePlaceholders}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Create Document Checklist
        </button>
      </div>

      {/* Upload Widget */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Upload Document</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Traveller
            </label>
            <select
              value={selectedTraveller}
              onChange={(e) => setSelectedTraveller(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose traveller...</option>
              {travellers.map((traveller) => (
                <option key={traveller.id} value={traveller.id}>
                  {traveller.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          {uploading ? (
            <div className="text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Uploading...</p>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, JPG, PNG, DOC up to 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Documents by Traveller */}
      <div className="space-y-6">
        {travellers.map((traveller) => {
          const travellerDocs = getDocumentsForTraveller(traveller.id);

          return (
            <div key={traveller.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{traveller.name}</h4>
                  <p className="text-sm text-gray-500">
                    {travellerDocs.length} {travellerDocs.length === 1 ? 'document' : 'documents'}
                  </p>
                </div>
              </div>

              {travellerDocs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No documents uploaded yet
                </div>
              ) : (
                <div className="space-y-3">
                  {travellerDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {DOCUMENT_TYPE_LABELS[doc.docType]}
                            </span>
                            {getStatusBadge(doc.status)}
                          </div>
                          {doc.fileName && (
                            <p className="text-sm text-gray-500">{doc.fileName}</p>
                          )}
                          {doc.rejectionNote && (
                            <p className="text-sm text-red-600 mt-1">
                              ❌ Reason: {doc.rejectionNote}
                            </p>
                          )}
                          {doc.uploadedAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* View button */}
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View
                            </a>
                          )}

                          {/* Verify button */}
                          {(doc.status === 'received' || doc.status === 'rejected') && doc.fileUrl && (
                            <button
                              onClick={() => handleVerify(doc.id)}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              ✓ Verify
                            </button>
                          )}

                          {/* Reject button */}
                          {(doc.status === 'received' || doc.status === 'verified') && doc.fileUrl && (
                            <>
                              {rejectingDocId === doc.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={rejectionNote}
                                    onChange={(e) => setRejectionNote(e.target.value)}
                                    placeholder="Rejection reason..."
                                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                  <button
                                    onClick={() => handleReject(doc.id)}
                                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                  >
                                    Submit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingDocId(null);
                                      setRejectionNote('');
                                    }}
                                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setRejectingDocId(doc.id)}
                                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  ✗ Reject
                                </button>
                              )}
                            </>
                          )}

                          {/* Mark Missing button */}
                          {doc.status === 'pending' && (
                            <button
                              onClick={() => handleMarkMissing(doc.id)}
                              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              Mark Missing
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {travellers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No travellers added yet. Add travellers first to manage documents.</p>
        </div>
      )}
    </div>
  );
}
