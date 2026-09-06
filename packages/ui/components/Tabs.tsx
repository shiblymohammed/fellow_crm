import React, { useState } from 'react';
import { cn } from '../lib/utils';

export interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (key: string) => void;
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, children, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key ?? '');

  function handleChange(key: string) {
    setActive(key);
    onChange?.(key);
  }

  return (
    <div className={className}>
      <div className="border-b border-gray-200" role="tablist" aria-label="Tabs">
        <div className="flex gap-1 px-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active === tab.key}
              onClick={() => handleChange(tab.key)}
              className={cn(
                'inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500',
                active === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" className="mt-4">
        {children(active)}
      </div>
    </div>
  );
}
