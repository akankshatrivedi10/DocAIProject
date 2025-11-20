import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Visualizer from './components/Visualizer';
import { Tab, Org, OrgType, ConnectionStatus, MetadataSummary } from './types';
import { connectOrg, fetchMetadata } from './services/mockSalesforceService';
import { generateTechnicalDoc } from './services/geminiService';
import { Plus, RefreshCw, CheckCircle, AlertCircle, FileText, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [docContent, setDocContent] = useState<string>('');
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  const activeOrg = orgs.find(o => o.id === activeOrgId) || null;

  const handleConnect = async (type: OrgType) => {
    setIsConnecting(true);
    const success = await connectOrg(type);
    if (success) {
      const newOrg: Org = {
        id: Date.now().toString(),
        name: `${type} Org ${orgs.length + 1}`,
        alias: `SF-${type.substring(0, 3).toUpperCase()}-0${orgs.length + 1}`,
        type: type,
        status: ConnectionStatus.CONNECTED,
        lastSync: new Date().toLocaleTimeString()
      };
      
      // Auto fetch metadata upon connection
      const metadata = await fetchMetadata(newOrg.id);
      newOrg.metadataSummary = metadata;
      
      setOrgs([...orgs, newOrg]);
      setActiveOrgId(newOrg.id);
    }
    setIsConnecting(false);
  };

  const handleGenerateDoc = async (type: string) => {
    if (!activeOrg || !activeOrg.metadataSummary) return;
    setIsGeneratingDoc(true);
    const content = await generateTechnicalDoc(type, activeOrg.metadataSummary);
    setDocContent(content);
    setIsGeneratingDoc(false);
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-slate-500 text-sm font-medium mb-1">Connected Orgs</h3>
        <div className="text-3xl font-bold text-slate-800">{orgs.length}</div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-slate-500 text-sm font-medium mb-1">Total Metadata Items</h3>
        <div className="text-3xl font-bold text-slate-800">
          {orgs.reduce((acc, org) => acc + (org.metadataSummary ? (org.metadataSummary.apexClasses + org.metadataSummary.flows) : 0), 0)}
        </div>
      </div>
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white">
        <h3 className="text-blue-100 text-sm font-medium mb-1">Status</h3>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-semibold">Agent Active</span>
        </div>
      </div>
    </div>
  );

  const renderConnections = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Org Connections</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => handleConnect(OrgType.PRODUCTION)}
            disabled={isConnecting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isConnecting ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
            Connect Production
          </button>
          <button 
            onClick={() => handleConnect(OrgType.SANDBOX)}
            disabled={isConnecting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {isConnecting ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
            Connect Sandbox
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {orgs.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-400">No organizations connected yet.</p>
            </div>
        ) : (
            orgs.map(org => (
            <div key={org.id} onClick={() => setActiveOrgId(org.id)} className={`p-6 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${activeOrgId === org.id ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${org.type === OrgType.PRODUCTION ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <div className="font-bold text-xs uppercase">{org.type.substring(0, 4)}</div>
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">{org.name}</h3>
                    <p className="text-sm text-slate-500 font-mono">{org.alias}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <RefreshCw size={12} />
                        Last Sync: {org.lastSync}
                    </div>
                </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} /> {org.status}
                    </span>
                    <button className="text-xs text-blue-600 hover:underline">View Metadata</button>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );

  const renderDocs = () => (
    <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Documentation Generator</h2>
            <div className="flex gap-2">
                <button 
                    onClick={() => handleGenerateDoc('Technical Specification')}
                    disabled={isGeneratingDoc || !activeOrg}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                    {isGeneratingDoc ? 'Generating...' : 'Generate Technical Spec'}
                </button>
                <button 
                    onClick={() => handleGenerateDoc('User Guide')}
                    disabled={isGeneratingDoc || !activeOrg}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50"
                >
                    Generate User Guide
                </button>
            </div>
        </div>
        
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
             {!activeOrg ? (
                 <div className="flex-1 flex items-center justify-center text-slate-400">Select an org to generate docs</div>
             ) : !docContent ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                     <FileText size={48} className="opacity-20" />
                     <p>Select a template above to generate documentation using GenAI.</p>
                 </div>
             ) : (
                 <div className="flex-1 overflow-y-auto p-8 prose max-w-none">
                     <pre className="whitespace-pre-wrap font-sans text-slate-700">{docContent}</pre>
                 </div>
             )}
        </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        {activeTab === Tab.DASHBOARD && renderDashboard()}
        {activeTab === Tab.CONNECT && renderConnections()}
        
        {activeTab === Tab.METADATA && (
           <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
               <Database size={48} className="mx-auto text-slate-300 mb-4" />
               <h3 className="text-lg font-medium text-slate-800">Metadata Explorer</h3>
               <p className="text-slate-500 mt-2">Detailed metadata tree view is available when an org is connected.</p>
               {activeOrg && activeOrg.metadataSummary && (
                   <div className="mt-8 text-left max-w-md mx-auto bg-slate-50 p-4 rounded border font-mono text-sm">
                       <pre>{JSON.stringify(activeOrg.metadataSummary, null, 2)}</pre>
                   </div>
               )}
           </div>
        )}

        {activeTab === Tab.DOCS && renderDocs()}
        {activeTab === Tab.VISUALS && <Visualizer activeOrg={activeOrg} />}
        {activeTab === Tab.CHAT && <ChatInterface activeOrg={activeOrg} orgs={orgs} />}
        
        {activeTab === Tab.INTEGRATIONS && (
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-lg font-semibold mb-4">External Integrations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center text-white font-bold">H</div>
                            <div>
                                <div className="font-medium">HubSpot</div>
                                <div className="text-xs text-slate-500">CRM Data Sync</div>
                            </div>
                        </div>
                        <button className="text-sm text-blue-600 font-medium">Connect</button>
                    </div>
                    <div className="p-4 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">J</div>
                            <div>
                                <div className="font-medium">Jira</div>
                                <div className="text-xs text-slate-500">Ticket Creation</div>
                            </div>
                        </div>
                        <button className="text-sm text-blue-600 font-medium">Connect</button>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Status Bar */}
      {activeOrg && (
          <div className="fixed bottom-4 right-8 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 text-sm z-50">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="font-semibold text-slate-700">{activeOrg.alias}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">Metadata Cached</span>
          </div>
      )}
    </div>
  );
};

// Icon import fix for display
import { Database } from 'lucide-react';

export default App;