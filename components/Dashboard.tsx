import React from 'react';
import { Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { Org, ConnectionStatus } from '../types';

interface DashboardProps {
    orgs: Org[];
}

const Dashboard: React.FC<DashboardProps> = ({ orgs }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1 relative z-10">Connected Orgs</h3>
                    <div className="text-3xl font-bold text-slate-800 relative z-10">{orgs.filter(o => o.status === ConnectionStatus.CONNECTED).length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1 relative z-10">Total Metadata Items</h3>
                    <div className="text-3xl font-bold text-slate-800 relative z-10">
                        {orgs.reduce((acc, org) => acc + (org.metadataSummary ? (org.metadataSummary.objects.length + org.metadataSummary.apexClasses.length + org.metadataSummary.flows.length) : 0), 0)}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Shield size={48} /></div>
                    <h3 className="text-indigo-100 text-sm font-medium mb-1">System Status</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="font-semibold">AWS Backend Ready</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Jobs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700">Recent Sync Jobs</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {orgs.length === 0 && <div className="p-8 text-center text-slate-400 italic">No sync jobs found. Connect an org to start.</div>}
                    {orgs.map(org => (
                        <div key={org.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${org.syncState.isSyncing ? 'bg-blue-100 text-blue-600' : (org.status === ConnectionStatus.ERROR ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600')}`}>
                                    {org.status === ConnectionStatus.ERROR ? <AlertCircle size={16} /> : <RefreshCw size={16} className={org.syncState.isSyncing ? 'animate-spin' : ''} />}
                                </div>
                                <div>
                                    <div className="font-medium text-slate-800">{org.name} ({org.alias})</div>
                                    <div className="text-xs text-slate-500">{org.syncState.stage}</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-500 ${org.status === ConnectionStatus.ERROR ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${org.syncState.progress}%` }}></div>
                                </div>
                                <span className="text-xs text-slate-400 mt-1">{org.syncState.progress}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
