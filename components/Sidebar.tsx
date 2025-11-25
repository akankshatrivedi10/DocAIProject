import React from 'react';
import {
  LayoutDashboard,
  Link,
  Database,
  Code2,
  Workflow,
  GraduationCap,
  MessageSquareCode,
  Settings
} from 'lucide-react';
import { Tab, User, SystemRole } from '../types';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  currentUser: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser }) => {
  const navItems = [
    { id: Tab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: Tab.INTEGRATIONS, label: 'Integrations', icon: Link },
    { id: Tab.METADATA, label: 'Metadata Explorer', icon: Database },
    { id: Tab.DEV_HUB, label: 'Dev Workspace', icon: Code2 },
    { id: Tab.GTM_HUB, label: 'BA & GTM Hub', icon: Workflow },
    { id: Tab.SALES_ENABLEMENT, label: 'Sales Onboarding', icon: GraduationCap },
    { id: Tab.CHAT, label: 'Assistant', icon: MessageSquareCode },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">SD</div>
          <h1 className="text-lg font-bold text-white tracking-tight">DocBot</h1>
        </div>
        <p className="text-xs text-slate-500 mt-2">AI Metadata Architect</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 translate-x-1'
                : 'hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800">
          {currentUser?.systemRole === SystemRole.ADMIN ? (
            <button
              onClick={() => setActiveTab(Tab.SETTINGS)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === Tab.SETTINGS
                ? 'bg-slate-800 text-white'
                : 'hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Settings size={18} />
              Settings & Billing
            </button>
          ) : (
            <button
              onClick={() => setActiveTab(Tab.PROFILE)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === Tab.PROFILE
                ? 'bg-slate-800 text-white'
                : 'hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Settings size={18} />
              My Profile
            </button>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded p-3 border border-slate-700/50">
          <p className="text-xs text-slate-400 font-mono">v2.0.0 • SaaS Beta</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-xs text-emerald-500">AWS Connect Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
