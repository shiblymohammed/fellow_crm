'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, ArrowLeft, Copy, CheckCheck, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const FIELD_TYPE_OPTIONS = [
  { value: 'text', label: 'Text', desc: 'Single line text input' },
  { value: 'image', label: 'Image URL', desc: 'Image URL pasted by user' },
  { value: 'number', label: 'Number', desc: 'Numeric input (price, nights, etc.)' },
  { value: 'textarea', label: 'Long Text', desc: 'Multi-line text area' },
  { value: 'repeatable', label: '🔁 Repeatable List', desc: 'Agency adds multiple items, each with custom sub-fields. Use {{#each key}} in template.' },
  { value: 'itinerary_days', label: '📅 Itinerary Days', desc: 'Full day-by-day builder with activities. Uses {{#each days}}.' },
];

const SUB_FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'image', label: 'Image URL' },
  { value: 'textarea', label: 'Long Text' },
];

const SOURCE_OPTIONS = [
  { value: 'user_input', label: '✏️ User Input', desc: 'Agency fills this in a form' },
  { value: 'user_upload', label: '🖼️ User Upload', desc: 'Agency pastes an image URL' },
  { value: 'auto:booking.destination', label: '⚡ Auto: Destination', desc: '{{booking.destination}}' },
  { value: 'auto:booking.customer.name', label: '⚡ Auto: Customer Name', desc: '{{booking.customer.name}}' },
  { value: 'auto:itinerary.days', label: '⚡ Auto: Days (built by agency)', desc: '{{#each days}}' },
];

// Variable cheatsheet grouped by category
const VARIABLE_CHEATSHEET = [
  {
    group: '📋 Template Inputs',
    vars: [
      { key: '{{trip_title}}', desc: 'Custom trip title (user_input)' },
      { key: '{{agency_phone}}', desc: 'Agency phone (user_input)' },
      { key: '{{cover_image_url}}', desc: 'Cover image URL (user_upload)' },
    ]
  },
  {
    group: '🔗 Auto: Booking',
    vars: [
      { key: '{{booking.destination}}', desc: 'Booking destination' },
      { key: '{{booking.customer.name}}', desc: 'Customer name' },
    ]
  },
  {
    group: '📅 Itinerary Days Loop',
    vars: [
      { key: '{{#each days}}', desc: 'Start loop over all days' },
      { key: '{{/each}}', desc: 'End loop' },
      { key: '{{dayNumber}}', desc: 'Day number (1, 2, 3...)' },
      { key: '{{zeroPad dayNumber}}', desc: 'Zero-padded (01, 02...)' },
      { key: '{{title}}', desc: 'Day title' },
      { key: '{{description}}', desc: 'Day description' },
      { key: '{{#each activities}}', desc: 'Loop over activities in a day' },
      { key: '{{icon}}', desc: 'Activity emoji icon' },
      { key: '{{time}}', desc: 'Activity time (e.g. 09:00)' },
      { key: '{{description}}', desc: 'Activity description' },
    ]
  },
];

// ─────────────────────────────────────────────────────
// FieldCard: renders one field definition in the editor
// ─────────────────────────────────────────────────────
function FieldCard({ field, index, onUpdate, onRemove, onInsert }: {
  field: any;
  index: number;
  onUpdate: (i: number, key: string, value: any) => void;
  onRemove: (i: number) => void;
  onInsert: (v: string) => void;
}) {
  const addSubField = () => {
    const subs = [...(field.subFields || []), { key: '', type: 'text', label: '' }];
    onUpdate(index, 'subFields', subs);
  };

  const updateSubField = (si: number, key: string, value: string) => {
    const subs = [...(field.subFields || [])];
    subs[si] = { ...subs[si], [key]: value };
    onUpdate(index, 'subFields', subs);
  };

  const removeSubField = (si: number) => {
    const subs = (field.subFields || []).filter((_: any, i: number) => i !== si);
    onUpdate(index, 'subFields', subs);
  };

  const getHandlebarsSnippet = () => {
    if (field.type === 'itinerary_days') return '{{#each days}}\n\n{{/each}}';
    if (field.type === 'repeatable' && field.key) return `{{#each ${field.key}}}\n\n{{/${field.key}}}`;
    return field.key ? `{{${field.key}}}` : '';
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 relative group overflow-hidden">
      {/* Field Header */}
      <div className="p-4 space-y-3">
        <button onClick={() => onRemove(index)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Key</label>
            <input
              value={field.key}
              onChange={e => onUpdate(index, 'key', e.target.value)}
              placeholder="e.g. hotels"
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-indigo-500 outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Type</label>
            <select
              value={field.type}
              onChange={e => onUpdate(index, 'type', e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none"
            >
              {FIELD_TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Display Label</label>
          <input
            value={field.label}
            onChange={e => onUpdate(index, 'label', e.target.value)}
            placeholder="Hotels"
            className="w-full h-8 px-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Source — only for non-repeatable, non-days fields */}
        {field.type !== 'repeatable' && field.type !== 'itinerary_days' && (
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Source</label>
            <select
              value={field.source || 'user_input'}
              onChange={e => onUpdate(index, 'source', e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none"
            >
              {SOURCE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Handlebars snippet */}
        {field.key && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
            <code className="text-[10px] text-indigo-600 font-mono truncate">
              {getHandlebarsSnippet()}
            </code>
            <button
              onClick={() => onInsert(getHandlebarsSnippet())}
              className="text-[10px] text-indigo-500 font-bold hover:text-indigo-700 shrink-0"
            >
              Insert →
            </button>
          </div>
        )}
      </div>

      {/* Sub-fields builder for repeatable lists */}
      {field.type === 'repeatable' && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sub-fields (columns per item)</p>
            <button onClick={addSubField} className="flex items-center gap-1 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 px-2 py-1 rounded-lg">
              <Plus className="w-3 h-3" /> Add Sub-field
            </button>
          </div>

          {(!field.subFields || field.subFields.length === 0) && (
            <p className="text-[10px] text-gray-400 text-center py-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              Add sub-fields — e.g. name, image, nights
            </p>
          )}

          {(field.subFields || []).map((sf: any, si: number) => (
            <div key={si} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-950 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-800 group/sf">
              <input
                value={sf.key}
                onChange={e => updateSubField(si, 'key', e.target.value)}
                placeholder="key"
                className="w-20 h-7 px-2 text-[10px] font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-indigo-500 outline-none"
              />
              <select
                value={sf.type}
                onChange={e => updateSubField(si, 'type', e.target.value)}
                className="w-20 h-7 px-1 text-[10px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none"
              >
                {SUB_FIELD_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input
                value={sf.label}
                onChange={e => updateSubField(si, 'label', e.target.value)}
                placeholder="Label"
                className="flex-1 h-7 px-2 text-[10px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-indigo-500 outline-none"
              />
              <button onClick={() => removeSubField(si)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover/sf:opacity-100 transition-opacity shrink-0">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {field.key && (field.subFields || []).length > 0 && (
            <div className="bg-gray-900 dark:bg-black rounded-xl p-3 mt-1">
              <p className="text-[9px] text-gray-500 font-bold uppercase mb-1.5">Handlebars Usage in Template:</p>
              <pre className="text-[10px] text-green-400 font-mono leading-relaxed whitespace-pre-wrap">{`{{#each ${field.key}}}\n${(field.subFields || []).map((sf: any) => `  {{${sf.key || 'key'}}}  ← ${sf.label || 'label'}`).join('\n')}\n{{/each}}`}</pre>
            </div>
          )}
        </div>
      )}

      {/* Itinerary days hint */}
      {field.type === 'itinerary_days' && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
          <div className="bg-gray-900 dark:bg-black rounded-xl p-3">
            <p className="text-[9px] text-gray-500 font-bold uppercase mb-1.5">Handlebars Usage in Template:</p>
            <pre className="text-[10px] text-green-400 font-mono leading-relaxed">{`{{#each days}}\n  <h2>Day {{zeroPad dayNumber}} — {{title}}</h2>\n  <p>{{description}}</p>\n  {{#each activities}}\n    <li>{{icon}} {{time}} — {{description}}</li>\n  {{/each}}\n{{/each}}`}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplateEditorPage({ params }: { params: { id: string } }) {
  const isNew = params.id === 'new';
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fields' | 'vars'>('fields');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'itinerary',
    htmlTemplate: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; margin: 0; }
  </style>
</head>
<body>
  <h1>{{trip_title}}</h1>
  <p>Destination: {{booking.destination}}</p>

  {{#each days}}
  <div style="margin: 20px 0; padding: 16px; border-left: 4px solid #6366f1;">
    <h2>Day {{zeroPad dayNumber}} — {{title}}</h2>
    <p>{{description}}</p>
    <ul>
      {{#each activities}}
      <li>{{icon}} <strong>{{time}}</strong> — {{description}}</li>
      {{/each}}
    </ul>
  </div>
  {{/each}}
</body>
</html>`,
    isPremium: false,
    price: 0,
    isPublished: false,
    previewImageUrl: ''
  });

  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    if (!isNew) fetchTemplate();
  }, [params.id]);

  const fetchTemplate = async () => {
    try {
      const res = await api.get('/marketplace-templates');
      const tmpl = res.data.find((t: any) => t.id === params.id);
      if (tmpl) {
        setFormData({
          name: tmpl.name,
          description: tmpl.description || '',
          category: tmpl.category,
          htmlTemplate: tmpl.htmlTemplate,
          isPremium: tmpl.isPremium,
          price: tmpl.price,
          isPublished: tmpl.isPublished,
          previewImageUrl: tmpl.previewImageUrl || ''
        });
        const parsedFields = typeof tmpl.fieldSchema === 'string' ? JSON.parse(tmpl.fieldSchema) : (tmpl.fieldSchema || []);
        setFields(parsedFields);
      }
    } catch (error) {
      toast.error('Failed to load template');
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error('Template name is required');
    setIsSaving(true);
    try {
      const payload = { ...formData, fieldSchema: fields };
      if (isNew) {
        await api.post('/marketplace-templates/admin', payload);
        toast.success('Template created!');
        router.push('/super-admin/templates');
      } else {
        await api.put(`/marketplace-templates/admin/${params.id}`, payload);
        toast.success('Template saved!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const addField = () => {
    setFields([...fields, { key: '', type: 'text', label: '', source: 'user_input' }]);
  };

  const updateField = (index: number, key: string, value: string) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  // Auto-insert variable at cursor in textarea
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
    if (!textarea) { copyToClipboard(variable); return; }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = formData.htmlTemplate;
    const newVal = current.substring(0, start) + variable + current.substring(end);
    setFormData({ ...formData, htmlTemplate: newVal });
    setTimeout(() => {
      textarea.selectionStart = start + variable.length;
      textarea.selectionEnd = start + variable.length;
      textarea.focus();
    }, 10);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Sticky Top Bar */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 px-5 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/super-admin/templates" className="text-gray-400 hover:text-gray-600 p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {isNew ? 'Create Template' : formData.name || 'Edit Template'}
            </h1>
            <p className="text-xs text-gray-400">{isNew ? 'Define layout, fields & Handlebars code' : 'Template · ' + formData.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
              className={`w-10 h-5 rounded-full transition-colors relative ${formData.isPublished ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow ${formData.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
              {formData.isPublished ? 'Published' : 'Draft'}
            </span>
          </label>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-md shadow-indigo-200 dark:shadow-none"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ─── LEFT PANEL ─── */}
        <div className="xl:col-span-1 space-y-4">

          {/* Metadata */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Template Info</h2>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Name *</label>
              <input
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Luxury Itinerary — Dark Theme"
                className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:border-indigo-500 outline-none font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
              <textarea
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="What makes this template special..."
                rows={2}
                className="w-full p-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:border-indigo-500 outline-none text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Preview Image URL</label>
              <input
                value={formData.previewImageUrl} onChange={e => setFormData({ ...formData, previewImageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:border-indigo-500 outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                <select
                  value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:border-indigo-500 outline-none text-sm"
                >
                  <option value="itinerary">Itinerary</option>
                  <option value="quotation">Quotation</option>
                  <option value="invoice">Invoice</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isPremium} onChange={e => setFormData({ ...formData, isPremium: e.target.checked })} className="w-4 h-4 rounded text-amber-500" />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Premium</span>
                </label>
              </div>
            </div>
          </div>

          {/* Tabs: Fields / Variables */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              {(['fields', 'vars'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeTab === tab
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {tab === 'fields' ? '📋 Fields' : '⚡ Variables'}
                </button>
              ))}
            </div>

            {/* Fields Panel */}
            {activeTab === 'fields' && (
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-500 leading-snug">Fields define what the agency fills in when generating a PDF.</p>
                  </div>
                  <button onClick={addField} className="shrink-0 flex items-center gap-1 text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {fields.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      <p className="text-xs text-gray-400">No fields yet. Add fields agencies can customize.</p>
                    </div>
                  )}
                  {fields.map((field, i) => (
                    <FieldCard
                      key={i}
                      field={field}
                      index={i}
                      onUpdate={updateField}
                      onRemove={removeField}
                      onInsert={insertVariable}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Variables Panel */}
            {activeTab === 'vars' && (
              <div className="p-5 max-h-96 overflow-y-auto space-y-4">
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-xl">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">Click any variable to insert it at your cursor in the editor.</p>
                </div>
                {VARIABLE_CHEATSHEET.map((group, gi) => (
                  <div key={gi}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{group.group}</p>
                    <div className="space-y-1">
                      {group.vars.map((v, vi) => (
                        <div
                          key={vi}
                          onClick={() => insertVariable(v.key)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer group transition-colors"
                        >
                          <div>
                            <code className="text-xs font-mono text-indigo-600">{v.key}</code>
                            <p className="text-[10px] text-gray-400 mt-0.5">{v.desc}</p>
                          </div>
                          {copied === v.key
                            ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            : <Copy className="w-3 h-3 text-gray-300 group-hover:text-indigo-400 shrink-0 transition-colors" />
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT PANEL: Code Editor ─── */}
        <div className="xl:col-span-2">
          <div className="bg-[#1e1e1e] rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '80vh' }}>
            <div className="bg-[#2d2d2d] px-5 py-3 flex items-center justify-between border-b border-black/30 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-gray-400 font-mono">template.hbs — HTML + Handlebars + CSS</span>
              <span className="text-xs text-gray-500">{formData.htmlTemplate.length} chars</span>
            </div>

            <textarea
              id="html-editor"
              value={formData.htmlTemplate}
              onChange={e => setFormData({ ...formData, htmlTemplate: e.target.value })}
              className="flex-grow w-full bg-[#1e1e1e] text-[#d4d4d4] p-6 font-mono text-sm focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
              style={{ tabSize: 2 }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
