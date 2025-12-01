import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Link,
  Database,
  Code2,
  Workflow,
  GraduationCap,
  MessageSquareCode,
  Settings,
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import { Tab, User, SystemRole } from '../types';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  currentUser: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser }) => {
  const navItems = [
    { id: Tab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, color: 'blue' },
    { id: Tab.INTEGRATIONS, label: 'Integrations', icon: Link, color: 'purple' },
    { id: Tab.METADATA, label: 'Metadata Explorer', icon: Database, color: 'emerald' },
    { id: Tab.DEV_HUB, label: 'Dev Workspace', icon: Code2, color: 'indigo' },
    { id: Tab.GTM_HUB, label: 'BA & GTM Hub', icon: Workflow, color: 'pink' },
    { id: Tab.SALES_ENABLEMENT, label: 'Sales Onboarding', icon: GraduationCap, color: 'orange' },
    { id: Tab.CHAT, label: 'Assistant', icon: MessageSquareCode, color: 'teal' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800/50 shadow-2xl">
      {/* Header */}
      <motion.div
        className="p-6 border-b border-slate-800/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            SD
          </motion.div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">DocBot</h1>
            <p className="text-xs text-slate-500 font-medium">AI Metadata Architect</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 relative overflow-hidden group ${isActive
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50'
                : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={18} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto relative z-10"
                >
                  <Sparkles size={14} className="text-blue-200" />
                </motion.div>
              )}
            </motion.button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800/50 space-y-1.5">
          {currentUser?.systemRole === SystemRole.ADMIN && (
            <motion.button
              onClick={() => setActiveTab(Tab.SETTINGS)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === Tab.SETTINGS
                ? 'bg-slate-800 text-white'
                : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings size={18} />
              Organization Settings
            </motion.button>
          )}

          <motion.button
            onClick={() => setActiveTab(Tab.PROFILE)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === Tab.PROFILE
              ? 'bg-slate-800 text-white'
              : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
              }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <UserIcon size={18} />
            My Profile
          </motion.button>
        </div>
      </nav>

      {/* Footer */}
      <motion.div
        className="p-4 border-t border-slate-800/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
          <p className="text-xs text-slate-400 font-mono">v2.0.0 • SaaS Beta</p>
          <motion.div
            className="mt-2 flex items-center gap-2"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-xs text-emerald-400 font-semibold">AWS Connect Ready</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;
