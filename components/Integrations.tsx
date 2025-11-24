import React from 'react';
import { Plus, AlertCircle, RefreshCw, CheckCircle, Lock } from 'lucide-react';
import { Org, Integration, OrgType, ConnectionStatus, IntegrationType } from '../types';

interface IntegrationsProps {
    orgs: Org[];
    integrations: Integration[];
    activeOrgId: string | null;
    setActiveOrgId: (id: string) => void;
    initiateAddOrg: (type: OrgType) => void;
}

const Integrations: React.FC<IntegrationsProps> = ({
    orgs,
    integrations,
    activeOrgId,
    setActiveOrgId,
    initiateAddOrg
}) => {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Integrations & Connections</h2>
                    <p className="text-slate-500 text-sm">Manage your CRM and Tooling connections securely.</p>
                </div>
            </div>

            {/* Salesforce Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Salesforce Orgs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Add New Cards */}
                    <button
                        onClick={() => initiateAddOrg(OrgType.PRODUCTION)}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group h-32"
                    >
                        <div className="bg-white p-2 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform"><Plus className="text-blue-600" size={20} /></div>
                        <span className="font-medium text-slate-600">Connect Production</span>
                    </button>
                    <button
                        onClick={() => initiateAddOrg(OrgType.SANDBOX)}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group h-32"
                    >
                        <div className="bg-white p-2 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform"><Plus className="text-emerald-600" size={20} /></div>
                        <span className="font-medium text-slate-600">Connect Sandbox</span>
                    </button>

                    {/* Existing Orgs */}
                    {orgs.map(org => (
                        <div
                            key={org.id}
                            onClick={() => setActiveOrgId(org.id)}
                            className={`relative p-5 rounded-xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all ${activeOrgId === org.id ? 'border-blue-500 ring-1 ring-blue-500 bg-white' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${org.type === OrgType.PRODUCTION ? 'bg-blue-600' : 'bg-emerald-500'}`}>SF</div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{org.alias}</h4>
                                        <p className="text-xs text-slate-500">{org.name}</p>
                                    </div>
                                </div>
                                {org.status === ConnectionStatus.ERROR ? (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1"><AlertCircle size={10} /> Error</span>
                                ) : org.syncState.isSyncing ? (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> Syncing</span>
                                ) : (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={10} /> Active</span>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                                <span>Last Sync: {org.lastSync || 'Never'}</span>
                                <span className="flex items-center gap-1"><Lock size={10} /> TLS 1.2</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* External Integrations */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">External Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map(int => (
                        <div key={int.id} className="p-5 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${int.type === IntegrationType.HUBSPOT ? 'bg-orange-500' : 'bg-blue-700'}`}>
                                    {int.type === IntegrationType.HUBSPOT ? 'H' : 'J'}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">{int.name}</h4>
                                    <p className="text-xs text-slate-500">Read/Write Access</p>
                                </div>
                            </div>
                            <button className="text-sm text-slate-600 font-medium px-3 py-1.5 border rounded hover:bg-slate-50">Connect</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Integrations;
