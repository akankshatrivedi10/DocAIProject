import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle, RefreshCw, CheckCircle, Lock, Zap, ExternalLink } from 'lucide-react';
import { Org, Integration, OrgType, ConnectionStatus, IntegrationType } from '../types';
import { Button, Card, Input, Modal } from './ui';
import { TEST_CREDENTIALS } from '../services/testCredentials';

interface IntegrationsProps {
    orgs: Org[];
    integrations: Integration[];
    activeOrgId: string | null;
    setActiveOrgId: (id: string) => void;
    onDisconnectOrg: (id: string) => void;
    initiateAddOrg: (type: OrgType) => void;
    onConnectJira?: (env: 'test' | 'production') => void;
}

const Integrations: React.FC<IntegrationsProps> = ({
    orgs,
    integrations,
    activeOrgId,
    setActiveOrgId,
    onDisconnectOrg,
    initiateAddOrg,
    onConnectJira
}) => {
    const [showJiraModal, setShowJiraModal] = React.useState(false);
    const [jiraCreds, setJiraCreds] = React.useState({ domain: '', email: '', token: '' });
    const [isConnectingJira, setIsConnectingJira] = React.useState(false);
    const [jiraError, setJiraError] = React.useState('');
    const [jiraEnvironment, setJiraEnvironment] = React.useState<'production' | 'test'>('production');

    const handleConnectJira = () => {
        // OAuth 2.0 Flow
        const clientId = import.meta.env.VITE_JIRA_CLIENT_ID;

        if (!clientId || clientId === 'PENDING_ENV_VAR') {
            alert('Configuration Error: VITE_JIRA_CLIENT_ID is missing in .env file.\nPlease add your Atlassian Client ID and restart the app.');
            return;
        }

        const redirectUri = window.location.hostname === 'localhost'
            ? 'http://localhost:3000/jira/oauth/callback'
            : 'https://doc-ai-project.vercel.app/jira/oauth/callback';

        const scope = 'read:jira-work read:jira-user';
        const state = Math.random().toString(36).substring(7);
        const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=code&prompt=consent`;

        window.location.href = authUrl;
    };

    const handleUseMockConnection = () => {
        setJiraCreds({
            domain: TEST_CREDENTIALS.jira.domain,
            email: TEST_CREDENTIALS.jira.email,
            token: TEST_CREDENTIALS.jira.token
        });
        setJiraEnvironment('test');
    };

    return (
        <div className="space-y-8 relative">
            <Modal isOpen={showJiraModal} onClose={() => setShowJiraModal(false)} title="Connect Jira">
                <div className="space-y-4">
                    {/* Environment Toggle */}
                    <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
                        <button
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${jiraEnvironment === 'production'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                            onClick={() => setJiraEnvironment('production')}
                        >
                            Production
                        </button>
                        <button
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${jiraEnvironment === 'test'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                            onClick={() => setJiraEnvironment('test')}
                        >
                            Test / Sandbox
                        </button>
                    </div>

                    <Input
                        label="Jira Domain"
                        type="text"
                        placeholder="your-domain.atlassian.net"
                        value={jiraCreds.domain}
                        onChange={e => setJiraCreds({ ...jiraCreds, domain: e.target.value })}
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="email@example.com"
                        value={jiraCreds.email}
                        onChange={e => setJiraCreds({ ...jiraCreds, email: e.target.value })}
                    />
                    <Input
                        label="API Token"
                        type="password"
                        placeholder="Atlassian API Token"
                        value={jiraCreds.token}
                        onChange={e => setJiraCreds({ ...jiraCreds, token: e.target.value })}
                        error={jiraError}
                    />
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={handleUseMockConnection}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                            Use Mock Connection
                        </button>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setShowJiraModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleConnectJira} isLoading={isConnectingJira}>
                                <Zap size={16} />
                                Connect
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Integrations & Connections
                </h2>
                <p className="text-slate-600">Manage your CRM and tooling connections securely.</p>
            </motion.div>

            {/* Salesforce Section */}
            <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Salesforce Orgs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Add Production */}
                    <AddOrgCard
                        onClick={() => initiateAddOrg(OrgType.PRODUCTION)}
                        title="Connect Production"
                        gradient="from-blue-500 to-indigo-600"
                        delay={0.15}
                    />

                    {/* Add Sandbox */}
                    <AddOrgCard
                        onClick={() => initiateAddOrg(OrgType.SANDBOX)}
                        title="Connect Sandbox"
                        gradient="from-emerald-500 to-teal-600"
                        delay={0.2}
                    />

                    {/* Existing Orgs */}
                    {orgs.map((org, index) => (
                        <OrgCard
                            key={org.id}
                            org={org}
                            isActive={activeOrgId === org.id}
                            onClick={() => setActiveOrgId(org.id)}
                            onDisconnectOrg={onDisconnectOrg}
                            delay={0.25 + index * 0.05}
                        />
                    ))}
                </div>
            </motion.div>

            {/* External Integrations */}
            <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    External Tools
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map((int, index) => (
                        <IntegrationCard
                            key={int.id}
                            integration={int}
                            onConnect={() => int.type === IntegrationType.JIRA ? handleConnectJira() : null}
                            delay={0.35 + index * 0.05}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

// Add Org Card Component
const AddOrgCard = ({ onClick, title, gradient, delay }: any) => (
    <motion.button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-transparent transition-all group h-48 overflow-hidden`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
        <motion.div
            className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg mb-3`}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
        >
            <Plus size={24} />
        </motion.div>
        <span className="font-bold text-slate-700 group-hover:text-slate-900">{title}</span>
        <span className="text-xs text-slate-400 mt-1">OAuth 2.0 Secure Connection</span>
    </motion.button>
);

// Org Card Component
const OrgCard = ({ org, isActive, onClick, onDisconnectOrg, delay }: any) => (
    <motion.div
        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all h-48 flex flex-col justify-between ${isActive
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/20'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
            }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
    >
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <motion.div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${org.type === OrgType.PRODUCTION ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        }`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                >
                    SF
                </motion.div>
                <div>
                    <h4 className="font-bold text-slate-900">{org.alias}</h4>
                    <p className="text-xs text-slate-500">{org.name}</p>
                    {org.instanceUrl && (
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]" title={org.instanceUrl}>
                            {tryGetDomain(org.instanceUrl)}
                        </p>
                    )}
                </div>
            </div>
            {org.status === ConnectionStatus.ERROR ? (
                <StatusBadge icon={<AlertCircle size={12} />} text="Error" color="red" />
            ) : org.syncState.isSyncing ? (
                <StatusBadge icon={<RefreshCw size={12} className="animate-spin" />} text="Syncing" color="blue" />
            ) : (
                <StatusBadge icon={<CheckCircle size={12} />} text="Active" color="green" />
            )}
        </div>

        <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Last Sync: {org.lastSync || 'Never'}</span>
                <span className="flex items-center gap-1">
                    <Lock size={10} />
                    TLS 1.2
                </span>
            </div>
            <div className="flex gap-2">
                {(!org.status || org.status === ConnectionStatus.DISCONNECTED) ? (
                    <button className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                        Connect
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClick} // Use the onClick prop passed to OrgCard for setting active
                            disabled={isActive}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${isActive ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            {isActive ? 'Active Context' : 'Set Active'}
                        </button>
                        <button
                            onClick={() => onDisconnectOrg(org.id)}
                            className="text-xs px-2 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            title="Disconnect Org"
                        >
                            Disconnect
                        </button>
                    </div>
                )}
            </div>
        </div>
    </motion.div>
);

// Integration Card Component
const IntegrationCard = ({ integration, onConnect, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <Card hoverEffect className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <motion.div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg ${integration.type === IntegrationType.HUBSPOT
                        ? 'bg-gradient-to-br from-orange-500 to-red-600'
                        : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                        }`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                >
                    {integration.type === IntegrationType.HUBSPOT ? 'H' : 'J'}
                </motion.div>
                <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        {integration.name}
                        <ExternalLink size={14} className="text-slate-400" />
                    </h4>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500">Read/Write Access</p>
                        {integration.status === ConnectionStatus.CONNECTED && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${integration.environment === 'test'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-50 text-blue-600'
                                }`}>
                                {integration.environment === 'test' ? 'TEST' : 'PROD'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <Button
                variant={integration.status === ConnectionStatus.CONNECTED ? 'secondary' : 'primary'}
                size="sm"
                onClick={onConnect}
            >
                {integration.status === ConnectionStatus.CONNECTED ? (
                    <>
                        <CheckCircle size={14} />
                        Connected
                    </>
                ) : (
                    <>
                        <Zap size={14} />
                        Connect
                    </>
                )}
            </Button>
        </Card>
    </motion.div>
);

// Status Badge Component
const StatusBadge = ({ icon, text, color }: any) => {
    const colors = {
        red: 'bg-red-100 text-red-700',
        blue: 'bg-blue-100 text-blue-700',
        green: 'bg-green-100 text-green-700',
    };
    return (
        <motion.span
            className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold ${colors[color]}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
        >
            {icon}
            {text}
        </motion.span>
    );
};

const tryGetDomain = (url: string) => {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
};

export default Integrations;
