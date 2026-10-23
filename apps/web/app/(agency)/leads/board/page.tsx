"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Briefcase, MoreHorizontal, Calendar, Clock, AlertTriangle, X, Phone, MessageSquare, Mail, Users, Snail, Flame } from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useDroppable } from '@dnd-kit/core';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getLeadAge(createdAt: string) {
  const hours = differenceInHours(new Date(), new Date(createdAt));
  const days  = differenceInDays(new Date(), new Date(createdAt));

  if (hours < 1)  return { label: 'Just now',      color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' };
  if (hours < 24) return { label: `${hours}h old`,  color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' };
  if (days === 1) return { label: '1 day old',      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' };
  if (days <= 3)  return { label: `${days} days old`, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' };
  if (days <= 7)  return { label: `${days} days old`, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' };
  return            { label: `${days} days old`,    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' };
}

function isSlaBreached(lead: any) {
  if (lead.status !== 'new') return false;
  return differenceInHours(new Date(), new Date(lead.createdAt)) >= 2;
}

// Stale: any lead (not won/lost) with no activity for 5+ days
function isStale(lead: any) {
  if (['won', 'lost', 'cold'].includes(lead.status)) return false;
  const lastActivity = lead.updatedAt || lead.createdAt;
  return differenceInDays(new Date(), new Date(lastActivity)) >= 5;
}

// Score out of 10
function getLeadScore(lead: any) {
  let score = 0;
  if (lead.customer?.phone) score += 3;
  if (lead.customer?.email) score += 2;
  if (lead.destination) score += 2;
  if (lead.travelDate || lead.budgetPerPerson || lead.specialRequests || lead.adults > 1) score += 3;
  return Math.min(10, score);
}

function validateTransition(lead: any, toStatus: string): { valid: boolean; error?: string } {
  const fromStatus = lead.status;
  if (fromStatus === toStatus) return { valid: true };

  if (fromStatus === 'won' && toStatus !== 'lost') {
    return { valid: false, error: 'Cannot move a Won lead backward. Mark as Lost if cancelled.' };
  }

  if ((toStatus === 'proposal' || toStatus === 'won') && (!lead._count || lead._count.quotations === 0)) {
    return { valid: false, error: `Must create a Quotation before moving to ${toStatus === 'won' ? 'Won' : 'Proposal Sent'}.` };
  }

  if (fromStatus === 'new' && !['contacted', 'lost', 'cold'].includes(toStatus)) {
    return { valid: false, error: 'New leads must be moved to Contacted first.' };
  }

  return { valid: true };
}

// ─── Columns ─────────────────────────────────────────────────────────────────

const COLUMNS = [
  { id: 'new',       title: 'New Leads',    color: 'bg-blue-50 dark:bg-blue-900/20',   borderColor: 'border-blue-200 dark:border-blue-800' },
  { id: 'contacted', title: 'Contacted',    color: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-200 dark:border-yellow-800' },
  { id: 'qualified', title: 'Qualified',    color: 'bg-purple-50 dark:bg-purple-900/20', borderColor: 'border-purple-200 dark:border-purple-800' },
  { id: 'proposal',  title: 'Proposal Sent', color: 'bg-indigo-50 dark:bg-indigo-900/20', borderColor: 'border-indigo-200 dark:border-indigo-800' },
  { id: 'won',       title: 'Won',           color: 'bg-green-50 dark:bg-green-900/20',   borderColor: 'border-green-200 dark:border-green-800' },
];

// ─── Mandatory Follow-up Modal ────────────────────────────────────────────────

interface FollowUpModalProps {
  lead: any;
  onConfirm: (data: { type: string; dueAt: string; note: string }) => void;
  onCancel: () => void;
}

function FollowUpModal({ lead, onConfirm, onCancel }: FollowUpModalProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().slice(0, 16);

  const [type, setType]   = useState('call');
  const [dueAt, setDueAt] = useState(defaultDate);
  const [note, setNote]   = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!dueAt) { toast.error('Please set a follow-up date.'); return; }
    setSaving(true);
    onConfirm({ type, dueAt, note });
  };

  const typeOptions = [
    { value: 'call',     label: 'Phone Call',  icon: <Phone className="w-4 h-4" /> },
    { value: 'whatsapp', label: 'WhatsApp',    icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'email',    label: 'Email',       icon: <Mail className="w-4 h-4" /> },
    { value: 'visit',    label: 'Visit',       icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-extrabold text-lg">Set a Follow-up First!</h2>
              <p className="text-yellow-100 text-sm mt-0.5">
                Before moving <strong>{lead?.customer?.name}</strong> to Contacted, schedule your next action.
              </p>
            </div>
            <button onClick={onCancel} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              How will you follow up?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all ${
                    type === opt.value
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date/time */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              When? <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={e => setDueAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Quick note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Customer interested in Bali, call to discuss dates..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel (keep in New)
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !dueAt}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Move Lead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function SortableItem({ id, lead }: { id: string; lead: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const age         = getLeadAge(lead.createdAt);
  const slaBreached = isSlaBreached(lead);
  const stale       = isStale(lead);
  const score       = getLeadScore(lead);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm cursor-grab active:cursor-grabbing mb-3 group hover:border-primary/50 transition-colors ${
        slaBreached
          ? 'border-red-300 dark:border-red-700 ring-1 ring-red-300 dark:ring-red-700'
          : stale
          ? 'border-gray-400 dark:border-gray-500 ring-1 ring-gray-300 dark:ring-gray-600'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {slaBreached && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 -mx-4 -mt-4 px-4 py-1.5 rounded-t-xl mb-3 border-b border-red-200 dark:border-red-800">
          <AlertTriangle className="w-3 h-3" />
          No response in 2+ hours!
        </div>
      )}
      {!slaBreached && stale && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 -mx-4 -mt-4 px-4 py-1.5 rounded-t-xl mb-3 border-b border-gray-200 dark:border-gray-600">
          <Snail className="w-3 h-3" />
          Stale — no activity in 5+ days
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{lead.customer?.name}</h4>
        <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
        <Briefcase className="w-3 h-3" /> {lead.destination || 'TBD'}
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${age.color}`}>
          <Clock className="w-2.5 h-2.5" />
          {age.label}
        </div>
        
        {/* Lead Score Pill */}
        <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          score >= 8 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
          score >= 5 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
          'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          <Flame className={`w-2.5 h-2.5 ${score >= 8 ? 'text-orange-500' : ''}`} />
          {score}/10
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {format(new Date(lead.createdAt), 'MMM d')}
        </span>
        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] px-2 py-0.5 rounded-full font-medium">
          {lead.adults || 0} Adults
        </span>
      </div>
    </div>
  );
}

// ─── Droppable Column ─────────────────────────────────────────────────────────

function DroppableColumn({ id, title, color, borderColor, count, children }: any) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div className={`w-80 flex flex-col h-full max-h-[75vh] rounded-2xl border ${borderColor} ${color}`}>
      <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20 rounded-t-2xl">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700 dark:text-gray-300">{title}</h3>
        <span className="bg-white dark:bg-gray-800 text-gray-500 text-xs px-2 py-1 rounded-full font-bold shadow-sm">{count}</span>
      </div>
      <div ref={setNodeRef} className="p-4 flex-1 overflow-y-auto scrollbar-hide min-h-[150px]">
        {children}
      </div>
    </div>
  );
}

// ─── Main Board Page ──────────────────────────────────────────────────────────

export default function KanbanBoardPage() {
  const [leads, setLeads]       = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Follow-up modal state
  const [pendingMove, setPendingMove] = useState<{ lead: any; toStatus: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    const { data } = await api.get('/leads');
    setLeads(Array.isArray(data) ? data : (data?.data ?? []));
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeLead   = leads.find(l => l.id === active.id);
    const overLead     = leads.find(l => l.id === over.id);
    const overColumnId = overLead ? overLead.status : (over.id as string);

    if (!activeLead || !COLUMNS.map(c => c.id).includes(overColumnId)) return;
    if (activeLead.status === overColumnId) return;

    // Validate Transition Rules
    const validation = validateTransition(activeLead, overColumnId);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // 🚦 If moving to "contacted", show the mandatory follow-up modal first
    if (overColumnId === 'contacted' && activeLead.status === 'new') {
      setPendingMove({ lead: activeLead, toStatus: overColumnId });
      return; // Don't save yet — wait for modal confirmation
    }

    // For all other moves, apply directly
    await applyStatusChange(activeLead, overColumnId);
  };

  const applyStatusChange = async (lead: any, newStatus: string) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));
    try {
      await api.patch(`/leads/${lead.id}`, { status: newStatus });
    } catch {
      toast.error('Failed to update status');
      fetchLeads();
    }
  };

  const handleFollowUpConfirm = async ({ type, dueAt, note }: { type: string; dueAt: string; note: string }) => {
    if (!pendingMove) return;
    const { lead, toStatus } = pendingMove;

    try {
      // 1. Create the follow-up
      await api.post('/followups', {
        leadId: lead.id,
        type,
        dueAt: new Date(dueAt).toISOString(),
        note: note || undefined,
      });

      // 2. Now actually move the lead
      await applyStatusChange(lead, toStatus);

      toast.success('Follow-up saved! Lead moved to Contacted.');
    } catch (err: any) {
      toast.error('Failed to save follow-up.');
    } finally {
      setPendingMove(null);
    }
  };

  const handleFollowUpCancel = () => {
    // Snap the card back — do nothing, state was never changed
    setPendingMove(null);
    toast('Lead kept in New. Set a follow-up when ready.', { icon: '↩️' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Mandatory Follow-up Modal */}
      {pendingMove && (
        <FollowUpModal
          lead={pendingMove.lead}
          onConfirm={handleFollowUpConfirm}
          onCancel={handleFollowUpCancel}
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Board</h1>
        <p className="text-gray-500 text-sm">Drag and drop leads to update their pipeline status.</p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full items-start w-max">
            {COLUMNS.map((col) => {
              const columnLeads = leads.filter(l => l.status === col.id);
              return (
                <DroppableColumn key={col.id} id={col.id} title={col.title} color={col.color} borderColor={col.borderColor} count={columnLeads.length}>
                  <SortableContext id={col.id} items={columnLeads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    <div className="min-h-[100px]" id={col.id}>
                      {columnLeads.map(lead => (
                        <SortableItem key={lead.id} id={lead.id} lead={lead} />
                      ))}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              );
            })}
          </div>

          <DragOverlay>
            {activeId ? (
              <SortableItem id={activeId} lead={leads.find(l => l.id === activeId)} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
