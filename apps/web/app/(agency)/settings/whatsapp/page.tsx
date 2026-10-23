"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface WaConfig {
  id?: string;
  waPhoneNumberId?: string;
  waBusinessAccountId?: string;
  waWebhookVerified?: boolean;
  bspProvider?: string;
  connectedAt?: string;
  updatedAt?: string;
}

type Step = 1 | 2 | 3;

export default function WhatsAppSetupPage() {
  const [config, setConfig] = useState<WaConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form fields
  const [waPhoneNumberId, setWaPhoneNumberId] = useState('');
  const [waAccessToken, setWaAccessToken] = useState('');
  const [waBusinessAccountId, setWaBusinessAccountId] = useState('');
  const [bspProvider, setBspProvider] = useState('meta_direct');
  const [bspApiKey, setBspApiKey] = useState('');

  const webhookUrl = typeof window !== 'undefined'
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/whatsapp/webhook`
    : '';

  const verifyToken = 'fellow-crm-verify';

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await api.get<WaConfig>('/whatsapp/config');
      if (data?.waPhoneNumberId) {
        setConfig(data);
        setWaPhoneNumberId(data.waPhoneNumberId || '');
        setWaBusinessAccountId(data.waBusinessAccountId || '');
        setBspProvider(data.bspProvider || 'meta_direct');
        if (data.waWebhookVerified) setCurrentStep(3);
        else setCurrentStep(2);
      }
    } catch {
      // No config yet
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!waPhoneNumberId || !waAccessToken) {
      toast.error('Phone Number ID and Access Token are required');
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/whatsapp/config', {
        waPhoneNumberId,
        waAccessToken,
        waBusinessAccountId: waBusinessAccountId || undefined,
        bspProvider,
        bspApiKey: bspApiKey || undefined,
      });
      toast.success('WhatsApp credentials saved!');
      setCurrentStep(2);
      fetchConfig();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save config');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading WhatsApp settings...</div>;
  }

  const steps = [
    { n: 1, label: 'Credentials' },
    { n: 2, label: 'Webhook Setup' },
    { n: 3, label: 'Connected' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white text-2xl shadow-lg">
            💬
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">WhatsApp Integration</h1>
            <p className="text-gray-500 text-sm mt-0.5">Connect your Meta Business WhatsApp to automate lead capture and customer messaging</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
              currentStep === s.n
                ? 'bg-primary text-white shadow'
                : currentStep > s.n
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>
              {currentStep > s.n ? '✓' : s.n}. {s.label}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 rounded ${currentStep > s.n ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Credentials */}
      {currentStep === 1 && (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Step 1: Enter Meta Credentials</h2>
            <p className="text-sm text-gray-500">
              Get these from{' '}
              <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                developers.facebook.com
              </a>{' '}
              → Your App → WhatsApp → API Setup
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">BSP Provider *</label>
              <select
                value={bspProvider}
                onChange={e => setBspProvider(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="meta_direct">Meta Direct (Cloud API)</option>
                <option value="wati">WATI</option>
                <option value="interakt">Interakt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number ID *</label>
              <input
                type="text"
                value={waPhoneNumberId}
                onChange={e => setWaPhoneNumberId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                placeholder="e.g. 123456789012345"
              />
              <p className="text-xs text-gray-400 mt-1">Found in Meta App Dashboard → WhatsApp → API Setup → Phone number ID</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Permanent Access Token *</label>
              <input
                type="password"
                value={waAccessToken}
                onChange={e => setWaAccessToken(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                placeholder="EAABxxxxxx..."
              />
              <p className="text-xs text-gray-400 mt-1">⚠️ Use a System User token for permanent access. Tokens are encrypted at rest.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Business Account ID (optional)</label>
              <input
                type="text"
                value={waBusinessAccountId}
                onChange={e => setWaBusinessAccountId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                placeholder="e.g. 987654321098765"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save & Continue →'}
          </button>
        </div>
      )}

      {/* Step 2: Webhook Setup */}
      {currentStep === 2 && (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Step 2: Configure Webhook in Meta</h2>
            <p className="text-sm text-gray-500">Go to your Meta App → WhatsApp → Configuration → Webhooks and set these values:</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Callback URL</span>
                <button onClick={() => copyToClipboard(webhookUrl)} className="text-xs text-primary hover:underline font-bold">
                  Copy
                </button>
              </div>
              <code className="text-sm text-gray-900 dark:text-white break-all">{webhookUrl}</code>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Verify Token</span>
                <button onClick={() => copyToClipboard(verifyToken)} className="text-xs text-primary hover:underline font-bold">
                  Copy
                </button>
              </div>
              <code className="text-sm text-gray-900 dark:text-white">{verifyToken}</code>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
              <strong>Subscribe to fields:</strong> messages, message_deliveries, message_reads
            </div>
          </div>

          {config?.waWebhookVerified ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 font-bold flex items-center gap-2">
              ✅ Webhook is verified and connected!
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-yellow-700 dark:text-yellow-300 text-sm">
              ⏳ Waiting for Meta to verify your webhook. Once done, send any message to your WhatsApp number to test.
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => { fetchConfig(); setCurrentStep(config?.waWebhookVerified ? 3 : 2); }}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              🔄 Check Status
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Connected */}
      {currentStep === 3 && (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md text-center space-y-4">
          <div className="text-6xl mb-2">🎉</div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">WhatsApp is Connected!</h2>
          <p className="text-gray-500">Your agency's WhatsApp is live. Inbound messages will automatically go through the lead capture chatbot.</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: '🤖', title: 'Lead Chatbot', desc: 'Automatically qualifies new leads through 4-step conversation' },
              { icon: '📨', title: 'Pipeline Triggers', desc: 'Sends updates when quotations, payments, and visas change status' },
              { icon: '💼', title: 'Staff Alerts', desc: 'Notifies your team about new leads, overdue payments, and more' },
            ].map(f => (
              <div key={f.title} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{f.title}</div>
                <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(1)}
            className="mt-4 text-sm text-primary hover:underline font-bold"
          >
            Update credentials →
          </button>
        </div>
      )}
    </div>
  );
}
