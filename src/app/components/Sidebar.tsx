import React from 'react';
import { Network, Code, Key, Frame, Copy, Zap } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: 'agentic', label: 'Agentic Engine', icon: Zap },
  { id: 'network', label: 'Network', icon: Network },
  { id: 'injector', label: 'Script Injector', icon: Code },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'iframes', label: 'Iframes', icon: Frame },
  { id: 'ui-copier', label: 'UI Copier', icon: Copy },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Tools</h3>
      </div>
      <div className="sidebar-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={clsx('sidebar-tab', { active: activeTab === tab.id })}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

