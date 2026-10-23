"use client";

import Link from 'next/link';

const settingsCards = [
  {
    title: 'WhatsApp Integration',
    description: 'Connect your Meta Business WhatsApp for lead capture, automated messages, and chatbot.',
    icon: '💬',
    href: '/settings/whatsapp',
    badge: 'New',
    color: 'bg-green-500',
  },
  {
    title: 'Drip Sequences',
    description: 'Build automated WhatsApp follow-up sequences triggered by lead events.',
    icon: '💧',
    href: '/settings/drip',
    badge: 'New',
    color: 'bg-blue-500',
  },
  {
    title: 'Lead Integrations',
    description: 'Capture leads automatically from Google Sheets, Google Forms, or your Website.',
    icon: '🔗',
    href: '/settings/integrations',
    badge: 'New',
    color: 'bg-purple-500',
  },
  {
    title: 'Agency Profile',
    description: 'Update your agency name, logo, contact details, and branding colors.',
    icon: '🏢',
    href: '/settings/profile',
    badge: null,
    color: 'bg-blue-500',
  },
  {
    title: 'Team Members',
    description: 'Manage users, roles, and permissions for your agency.',
    icon: '👥',
    href: '/settings/team',
    badge: null,
    color: 'bg-purple-500',
  },
  {
    title: 'Billing & Plan',
    description: 'View your current plan, usage, and billing history.',
    icon: '💳',
    href: '/settings/billing',
    badge: null,
    color: 'bg-orange-500',
  },
];

export default function SettingsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">⚙️ Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your agency configuration and integrations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {settingsCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center text-white text-2xl shadow-lg flex-shrink-0`}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  {card.badge && (
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">
                      {card.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{card.description}</p>
              </div>
              <span className="text-gray-300 dark:text-gray-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
