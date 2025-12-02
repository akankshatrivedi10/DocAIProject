import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Briefcase, Building2, LogOut } from 'lucide-react';
import { User } from '../../types';
import LeadBoard from './LeadBoard';
import OpportunityPipeline from './OpportunityPipeline';
import { getLeads, getAccounts, getOpportunities } from '../../services/crmService';

interface SalesConsoleProps {
    currentUser: User;
    onLogout: () => void;
}

const SalesConsole: React.FC<SalesConsoleProps> = ({ currentUser, onLogout }) => {
    const [activeView, setActiveView] = useState<'DASHBOARD' | 'LEADS' | 'ACCOUNTS' | 'OPPORTUNITIES'>('DASHBOARD');
    const [stats, setStats] = useState({ leads: 0, accounts: 0, opportunities: 0, pipelineValue: 0 });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const [leads, accounts, opportunities] = await Promise.all([
            getLeads(currentUser),
            getAccounts(currentUser),
            getOpportunities(currentUser)
        ]);

        const pipelineValue = opportunities.reduce((sum, opp) => sum + opp.amount, 0);
        setStats({
            leads: leads.length,
            accounts: accounts.length,
            opportunities: opportunities.length,
            pipelineValue
        });
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            {/* Internal Sidebar */}
            <div className="w-64 bg-slate-900 text-slate-300 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                            DB
                        </div>
                        <div>
                            <h1 className="font-bold text-white">Internal Console</h1>
                            <p className="text-xs text-slate-500">Sales & CRM</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <button
                        onClick={() => setActiveView('DASHBOARD')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeView === 'DASHBOARD' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'}`}
                    >
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveView('LEADS')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeView === 'LEADS' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'}`}
                    >
                        <Users size={18} /> Leads
                    </button>
                    <button
                        onClick={() => setActiveView('ACCOUNTS')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeView === 'ACCOUNTS' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'}`}
                    >
                        <Building2 size={18} /> Accounts
                    </button>
                    <button
                        onClick={() => setActiveView('OPPORTUNITIES')}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeView === 'OPPORTUNITIES' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50'}`}
                    >
                        <Briefcase size={18} /> Opportunities
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                            <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {activeView === 'DASHBOARD' && (
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Sales Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-sm text-slate-500 font-medium">Total Leads</p>
                                <p className="text-3xl font-bold text-slate-800 mt-2">{stats.leads}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-sm text-slate-500 font-medium">Active Accounts</p>
                                <p className="text-3xl font-bold text-slate-800 mt-2">{stats.accounts}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-sm text-slate-500 font-medium">Open Opportunities</p>
                                <p className="text-3xl font-bold text-slate-800 mt-2">{stats.opportunities}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-sm text-slate-500 font-medium">Pipeline Value</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">${stats.pipelineValue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'LEADS' && <LeadBoard currentUser={currentUser} />}
                {activeView === 'OPPORTUNITIES' && <OpportunityPipeline currentUser={currentUser} />}
                {activeView === 'ACCOUNTS' && (
                    <div className="p-8 text-center text-slate-500">
                        <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Account Management Module</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesConsole;
