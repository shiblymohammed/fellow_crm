"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface DripStep {
  id: string;
  stepNumber: number;
  delayDays: number;
  messageTemplate: string;
  stepType: 'whatsapp' | 'email';
}

interface DripSequence {
  id: string;
  name: string;
  triggerStage: string;
  isActive: boolean;
  steps: DripStep[];
  createdAt: string;
}

const TRIGGER_LABELS: Record<string, string> = {
  new_lead: '🆕 New Lead',
  quotation_sent: '📄 Quotation Sent',
  payment_pending: '💰 Payment Pending',
  docs_pending: '📋 Documents Pending',
  post_trip: '✈️ Post Trip',
};

const STEP_TYPE_LABELS: Record<string, string> = {
  whatsapp: '💬 WhatsApp',
  email: '📧 Email',
};

export default function DripSequencesPage() {
  const [sequences, setSequences] = useState<DripSequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [addingStepTo, setAddingStepTo] = useState<string | null>(null);

  // New sequence form
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('new_lead');

  // New step form
  const [stepNumber, setStepNumber] = useState(1);
  const [delayDays, setDelayDays] = useState(1);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [stepType, setStepType] = useState('whatsapp');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchSequences(); }, []);

  const fetchSequences = async () => {
    try {
      const { data } = await api.get<DripSequence[]>('/drip/sequences');
      setSequences(data);
    } catch {
      toast.error('Failed to load drip sequences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSequence = async () => {
    if (!newName) return toast.error('Sequence name is required');
    setIsSaving(true);
    try {
      await api.post('/drip/sequences', { name: newName, triggerStage: newTrigger });
      toast.success('Sequence created!');
      setShowCreate(false);
      setNewName('');
      fetchSequences();
    } catch { toast.error('Failed to create sequence'); }
    finally { setIsSaving(false); }
  };

  const handleToggle = async (seq: DripSequence) => {
    try {
      await api.patch(`/drip/sequences/${seq.id}/toggle`, { isActive: !seq.isActive });
      toast.success(seq.isActive ? 'Sequence disabled' : 'Sequence enabled');
      fetchSequences();
    } catch { toast.error('Failed to toggle sequence'); }
  };

  const handleDelete = async (seqId: string) => {
    if (!confirm('Delete this sequence and cancel all pending jobs?')) return;
    try {
      await api.delete(`/drip/sequences/${seqId}`);
      toast.success('Sequence deleted');
      fetchSequences();
    } catch { toast.error('Failed to delete sequence'); }
  };

  const handleAddStep = async (sequenceId: string) => {
    if (!messageTemplate) return toast.error('Message template is required');
    setIsSaving(true);
    try {
      await api.post(`/drip/sequences/${sequenceId}/steps`, {
        stepNumber, delayDays, messageTemplate, stepType,
      });
      toast.success('Step added!');
      setAddingStepTo(null);
      setMessageTemplate('');
      setDelayDays(1);
      fetchSequences();
    } catch { toast.error('Failed to add step'); }
    finally { setIsSaving(false); }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      await api.delete(`/drip/steps/${stepId}`);
      toast.success('Step removed');
      fetchSequences();
    } catch { toast.error('Failed to delete step'); }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">💧 Drip Sequences</h1>
          <p className="text-gray-500 text-sm mt-0.5">Automate WhatsApp follow-ups triggered by lead events</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-colors shadow-md"
        >
          + New Sequence
        </button>
      </div>

      {/* Create Sequence Form */}
      {showCreate && (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">New Drip Sequence</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Sequence Name *</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. New Lead Follow-up"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Trigger *</label>
              <select
                value={newTrigger}
                onChange={e => setNewTrigger(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
              >
                {Object.entries(TRIGGER_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreateSequence} disabled={isSaving}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
              {isSaving ? 'Creating...' : 'Create Sequence'}
            </button>
            <button onClick={() => setShowCreate(false)}
              className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sequence List */}
      {sequences.length === 0 ? (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-12 rounded-3xl border border-white/50 dark:border-gray-700/50 text-center">
          <div className="text-5xl mb-3">💧</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No drip sequences yet</h3>
          <p className="text-gray-500 text-sm">Create a sequence to automate WhatsApp follow-ups for your leads</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sequences.map(seq => (
            <div key={seq.id} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md overflow-hidden">
              {/* Sequence Header */}
              <div className="p-5 flex items-center gap-4">
                <button
                  onClick={() => setExpandedId(expandedId === seq.id ? null : seq.id)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <span className="text-2xl">{expandedId === seq.id ? '▼' : '▶'}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">{seq.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold">
                        {TRIGGER_LABELS[seq.triggerStage] || seq.triggerStage}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: seq.isActive ? '#d1fae5' : '#fee2e2', color: seq.isActive ? '#065f46' : '#991b1b' }}>
                        {seq.isActive ? '✅ Active' : '⏸ Paused'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{seq.steps.length} step{seq.steps.length !== 1 ? 's' : ''}</p>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(seq)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${seq.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${seq.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                  <button onClick={() => handleDelete(seq.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm">
                    🗑️
                  </button>
                </div>
              </div>

              {/* Steps */}
              {expandedId === seq.id && (
                <div className="px-5 pb-5 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                  {seq.steps.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No steps yet — add your first message below</p>
                  ) : (
                    seq.steps.map((step, i) => (
                      <div key={step.id} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-500">Day {step.delayDays}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-bold">
                              {STEP_TYPE_LABELS[step.stepType]}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{step.messageTemplate}</p>
                        </div>
                        <button onClick={() => handleDeleteStep(step.id)}
                          className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">✕</button>
                      </div>
                    ))
                  )}

                  {/* Add Step Form */}
                  {addingStepTo === seq.id ? (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-3">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">Add Step</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Step #</label>
                          <input type="number" value={stepNumber} onChange={e => setStepNumber(Number(e.target.value))} min={1}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none text-sm focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Send After (days)</label>
                          <input type="number" value={delayDays} onChange={e => setDelayDays(Number(e.target.value))} min={0}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none text-sm focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Type</label>
                          <select value={stepType} onChange={e => setStepType(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none text-sm focus:ring-2 focus:ring-primary/50">
                            <option value="whatsapp">💬 WhatsApp</option>
                            <option value="email">📧 Email</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                          Message Template <span className="text-gray-400 font-normal">(use {"{{customerName}}"}, {"{{destination}}"})</span>
                        </label>
                        <textarea value={messageTemplate} onChange={e => setMessageTemplate(e.target.value)} rows={3}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none text-sm resize-none focus:ring-2 focus:ring-primary/50"
                          placeholder={`Hi {{customerName}}! 👋 We wanted to follow up on your travel enquiry to {{destination}}...`} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAddStep(seq.id)} disabled={isSaving}
                          className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50">
                          {isSaving ? 'Adding...' : '+ Add Step'}
                        </button>
                        <button onClick={() => setAddingStepTo(null)}
                          className="px-4 py-2 text-gray-600 dark:text-gray-300 font-bold text-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setAddingStepTo(seq.id); setStepNumber(seq.steps.length + 1); }}
                      className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:border-primary hover:text-primary rounded-2xl text-sm font-bold transition-colors">
                      + Add Step
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
