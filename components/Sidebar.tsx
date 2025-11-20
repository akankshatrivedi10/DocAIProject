import React from 'react';
import { 
  LayoutDashboard, 
  Network, 
  Database, 
  FileText, 
  Workflow, 
  MessageSquareCode, 
  Puzzle 
} from 'lucide-react';
import { Tab } from '../types';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: Tab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: Tab.CONNECT, label: 'Connected Orgs', icon: Network },
    { id: Tab.METADATA, label: 'Metadata Explorer', icon: Database },
    { id: Tab.DOCS, label: 'Documentation', icon: FileText },
    { id: Tab.VISUALS, label: 'Process Visuals', icon: Workflow },
    { id: Tab.CHAT, label: 'Assistant', icon: MessageSquareCode },
    { id: Tab.INTEGRATIONS, label: 'Integrations', icon: Puzzle },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <h1 className="text-lg font-bold text-white tracking-tight">SalesforceDocBot</h1>
        </div>
        <p className="text-xs text-slate-500 mt-2">Agentic Metadata Assistant</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded p-3">
          <p className="text-xs text-slate-400 font-mono">v1.2.0 • Stable</p>
          <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            System Online
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;