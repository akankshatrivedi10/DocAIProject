import React from 'react';
import { Plus, AlertCircle, RefreshCw, CheckCircle, Lock } from 'lucide-react';
import { Org, Integration, OrgType, ConnectionStatus, IntegrationType } from '../types';

interface IntegrationsProps {
    orgs: Org[];
    integrations: Integration[];
    activeOrgId: string | null;
    setActiveOrgId: (id: string) => void;
    initiateAddOrg: (type: OrgType) => void;
    onConnectJira?: () => void;
}

const Integrations: React.FC<IntegrationsProps> = ({
    orgs,
    integrations,
    activeOrgId,
    setActiveOrgId,
    initiateAddOrg,
    onConnectJira
}) => {
    const [showJiraModal, setShowJiraModal] = React.useState(false);
    const [jiraCreds, setJiraCreds] = React.useState({ domain: '', email: '', token: '' });
    const [isConnectingJira, setIsConnectingJira] = React.useState(false);
    const [jiraError, setJiraError] = React.useState('');

    const handleConnectJira = async () => {
        setIsConnectingJira(true);
        setJiraError('');
        try {
            const success = await import('../services/jiraService').then(m => m.authenticateJira(jiraCreds.domain, jiraCreds.email, jiraCreds.token));
            if (success) {
                // In a real app, we would update the global integrations state here
                // For now, we'll just close the modal and pretend it worked
                if (onConnectJira) onConnectJira();
                setShowJiraModal(false);
                alert("Jira integration connected successfully. You can now select a Jira Story to include its context in your Technical Documentation.");
            } else {
                setJiraError('Jira authentication failed. Please check your credentials or permissions.');
            }
        } catch (e) {
            setJiraError('An error occurred while connecting to Jira.');
        } finally {
            setIsConnectingJira(false);
        }
    };

    return (
        <div className="space-y-8 relative">
            {showJiraModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
                        <h3 className="text-lg font-bold mb-4">Connect Jira</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Jira Domain</label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2 text-sm"
                                    placeholder="your-domain.atlassian.net"
                                    value={jiraCreds.domain}
                                    onChange={e => setJiraCreds({ ...jiraCreds, domain: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full border rounded p-2 text-sm"
                                    placeholder="email@example.com"
                                    value={jiraCreds.email}
                                    onChange={e => setJiraCreds({ ...jiraCreds, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">API Token</label>
                                <input
                                    type="password"
                                    className="w-full border rounded p-2 text-sm"
                                    placeholder="Atlassian API Token"
                                    value={jiraCreds.token}
                                    onChange={e => setJiraCreds({ ...jiraCreds, token: e.target.value })}
                                />
                            </div>
                            {jiraError && <p className="text-xs text-red-500">{jiraError}</p>}
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => setShowJiraModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                                <button
                                    onClick={handleConnectJira}
                                    disabled={isConnectingJira}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isConnectingJira ? 'Connecting...' : 'Connect'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            <button
                                onClick={() => int.type === IntegrationType.JIRA ? setShowJiraModal(true) : null}
                                className="text-sm text-slate-600 font-medium px-3 py-1.5 border rounded hover:bg-slate-50"
                            >
                                {int.status === ConnectionStatus.CONNECTED ? 'Connected' : 'Connect'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Integrations;
