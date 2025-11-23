
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Visualizer from './components/Visualizer';
import CustomerProfilePage from './components/CustomerProfile';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPages';
import OAuthModal from './components/OAuthModal';
import { Tab, Org, OrgType, ConnectionStatus, SyncStage, Integration, IntegrationType, SyncState, CustomerProfile, AuthView, User } from './types';
import { performStagedSync } from './services/mockSalesforceService';
import { generateRoleBasedDoc } from './services/geminiService';
import { Plus, RefreshCw, CheckCircle, AlertCircle, FileText, ExternalLink, Database, Code2, Workflow, GraduationCap, Shield, Lock, Play } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [authView, setAuthView] = useState<AuthView>('LANDING'); // Start at Landing Page
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  
  // App Data State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'h1', type: IntegrationType.HUBSPOT, name: 'HubSpot CRM', status: ConnectionStatus.DISCONNECTED },
    { id: 'j1', type: IntegrationType.JIRA, name: 'Atlassian Jira', status: ConnectionStatus.DISCONNECTED },
  ]);
  const [docContent, setDocContent] = useState<string>('');
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  // OAuth State
  const [isOAuthOpen, setIsOAuthOpen] = useState(false);
  const [oauthOrgType, setOauthOrgType] = useState<OrgType>(OrgType.PRODUCTION);

  const activeOrg = orgs.find(o => o.id === activeOrgId) || null;

  const handleAuthSuccess = (user: User, profile: CustomerProfile) => {
    setCurrentUser(user);
    setCustomerProfile(profile);
    setAuthView('APP');
    // If it's a new signup, maybe direct them to dashboard or profile? Defaulting to Dashboard.
  };

  const initiateAddOrg = (type: OrgType) => {
    setOauthOrgType(type);
    setIsOAuthOpen(true);
  };

  const handleOAuthSuccess = async (username: string) => {
    setIsOAuthOpen(false);
    
    const newOrgId = Date.now().toString();
    const aliasFromEmail = username.split('@')[0];
    const newOrg: Org = {
      id: newOrgId,
      name: `${oauthOrgType} Org`,
      alias: aliasFromEmail || `SF-${oauthOrgType === OrgType.PRODUCTION ? 'PROD' : 'SAND'}`,
      type: oauthOrgType,
      status: ConnectionStatus.CONNECTING,
      syncState: {
        stage: SyncStage.INIT,
        progress: 0,
        logs: [],
        isSyncing: true
      }
    };

    setOrgs(prev => [...prev, newOrg]);
    setActiveOrgId(newOrgId);

    // Start Async Job
    try {
      const metadata = await performStagedSync((stage, progress, log) => {
        setOrgs(currentOrgs => currentOrgs.map(o => {
          if (o.id === newOrgId) {
            return {
              ...o,
              syncState: {
                stage,
                progress,
                logs: [...o.syncState.logs, `[${new Date().toLocaleTimeString()}] ${log}`],
                isSyncing: stage !== SyncStage.COMPLETE
              },
              status: stage === SyncStage.COMPLETE ? ConnectionStatus.CONNECTED : ConnectionStatus.CONNECTING,
              lastSync: stage === SyncStage.COMPLETE ? new Date().toLocaleString() : undefined
            };
          }
          return o;
        }));
      });

      // Finalize
      setOrgs(currentOrgs => currentOrgs.map(o => {
        if (o.id === newOrgId) {
          return { ...o, metadataSummary: metadata };
        }
        return o;
      }));
      
      // Update local profile stats (mock update)
      if (customerProfile) {
          setCustomerProfile({
              ...customerProfile,
              usage: {
                  ...customerProfile.usage,
                  connectedOrgs: customerProfile.usage.connectedOrgs + 1,
                  metadataItemsAnalyzed: customerProfile.usage.metadataItemsAnalyzed + (metadata.objects.length * 5)
              }
          })
      }

    } catch (e) {
      console.error("Sync failed", e);
    }
  };

  const handleGenerateRoleDoc = async (role: 'DEV' | 'GTM' | 'SALES') => {
    if (!activeOrg || !activeOrg.metadataSummary) return;
    setIsGeneratingDoc(true);
    const content = await generateRoleBasedDoc(role, activeOrg.metadataSummary);
    setDocContent(content);
    setIsGeneratingDoc(false);
    
    // Mock usage update
    if (customerProfile) {
         setCustomerProfile({
              ...customerProfile,
              usage: {
                  ...customerProfile.usage,
                  documentsGenerated: customerProfile.usage.documentsGenerated + 1
              }
          })
    }
  };

  // -- RENDERERS --

  const renderDashboard = () => (
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
            {orgs.reduce((acc, org) => acc + (org.metadataSummary ? (org.metadataSummary.apexClasses.length + org.metadataSummary.flows.length) : 0), 0)}
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
                 <div className={`p-2 rounded-lg ${org.syncState.isSyncing ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                   <RefreshCw size={16} className={org.syncState.isSyncing ? 'animate-spin' : ''} />
                 </div>
                 <div>
                   <div className="font-medium text-slate-800">{org.name} ({org.alias})</div>
                   <div className="text-xs text-slate-500">{org.syncState.stage}</div>
                 </div>
               </div>
               <div className="flex flex-col items-end">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${org.syncState.progress}%` }}></div>
                  </div>
                  <span className="text-xs text-slate-400 mt-1">{org.syncState.progress}%</span>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
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
                        {org.syncState.isSyncing ? (
                             <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1"><RefreshCw size={10} className="animate-spin"/> Syncing</span>
                        ) : (
                             <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={10}/> Active</span>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                        <span>Last Sync: {org.lastSync || 'Never'}</span>
                        <span className="flex items-center gap-1"><Lock size={10}/> TLS 1.2</span>
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

  const renderMetadataExplorer = () => (
    <div className="h-full flex flex-col">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Metadata Explorer</h2>
            <p className="text-slate-500 text-sm">Raw metadata viewer. Select an org to view index.</p>
        </div>
        
        {!activeOrg ? (
             <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400">Select a connected org</div>
        ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-4 text-sm font-medium text-slate-600 overflow-x-auto">
                   <div className="px-3 py-1 bg-white rounded border shadow-sm text-blue-600">Objects ({activeOrg.metadataSummary?.objects.length})</div>
                   <div className="px-3 py-1 rounded hover:bg-slate-200 cursor-pointer">Apex Classes ({activeOrg.metadataSummary?.apexClasses.length})</div>
                   <div className="px-3 py-1 rounded hover:bg-slate-200 cursor-pointer">Flows ({activeOrg.metadataSummary?.flows.length})</div>
                   <div className="px-3 py-1 rounded hover:bg-slate-200 cursor-pointer">Validation Rules ({activeOrg.metadataSummary?.validationRules.length})</div>
                </div>
                <div className="p-0 overflow-y-auto flex-1 bg-slate-50/30">
                   {/* Simple list view for objects */}
                   <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                           <tr>
                               <th className="p-4">Name</th>
                               <th className="p-4">Type</th>
                               <th className="p-4">Field Count</th>
                               <th className="p-4">Action</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {activeOrg.metadataSummary?.objects.map((obj: any, i: number) => (
                               <tr key={i} className="hover:bg-white">
                                   <td className="p-4 font-medium text-slate-700">{obj.label} <span className="text-xs text-slate-400 ml-1 font-mono">({obj.name})</span></td>
                                   <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${obj.type === 'Standard' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{obj.type}</span></td>
                                   <td className="p-4 text-slate-500">{obj.fields.length}</td>
                                   <td className="p-4"><button className="text-blue-600 hover:underline">View JSON</button></td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
                </div>
            </div>
        )}
    </div>
  );

  const renderWorkspace = (title: string, role: 'DEV' | 'GTM' | 'SALES', icon: any) => {
    const Icon = icon;
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border rounded-lg shadow-sm"><Icon className="text-slate-700" size={24} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                        <p className="text-slate-500 text-sm">AI-powered workspace tailored for {role.toLowerCase()} roles.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {role === 'GTM' && <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700" onClick={() => setActiveTab(Tab.GTM_HUB)}>Visualize Flows</button>}
                    <button 
                        onClick={() => handleGenerateRoleDoc(role)}
                        disabled={isGeneratingDoc || !activeOrg}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isGeneratingDoc ? <RefreshCw className="animate-spin" size={14} /> : <FileText size={14} />}
                        Generate Guide
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Left Panel: Context/Shortcuts */}
                <div className="space-y-6 overflow-y-auto pr-2">
                   {/* Role specific content cards */}
                   {role === 'DEV' && activeOrg?.metadataSummary && (
                       <div className="bg-white p-4 rounded-xl border border-slate-200">
                           <h3 className="font-semibold mb-3 flex items-center gap-2"><Code2 size={16}/> Code Insights</h3>
                           <div className="space-y-2">
                               {activeOrg.metadataSummary.apexClasses.slice(0, 3).map((c: any, i: number) => (
                                   <div key={i} className="p-3 bg-slate-50 rounded border border-slate-100 text-sm">
                                       <div className="font-mono text-blue-700 font-medium">{c.name}</div>
                                       <div className="text-slate-500 text-xs mt-1">{c.description}</div>
                                   </div>
                               ))}
                           </div>
                       </div>
                   )}
                    {role === 'GTM' && (
                       <div className="bg-white p-4 rounded-xl border border-slate-200">
                           <h3 className="font-semibold mb-3 flex items-center gap-2"><Workflow size={16}/> Process Maps</h3>
                           <Visualizer activeOrg={activeOrg} />
                       </div>
                   )}
                   {role === 'SALES' && (
                       <div className="bg-white p-4 rounded-xl border border-slate-200">
                           <h3 className="font-semibold mb-3 flex items-center gap-2"><GraduationCap size={16}/> Enablement Checks</h3>
                           <div className="space-y-2">
                               <div className="flex items-center gap-2 text-sm text-slate-600">
                                   <CheckCircle size={14} className="text-green-500" />
                                   Lead Validation Rules Analyzed
                               </div>
                               <div className="flex items-center gap-2 text-sm text-slate-600">
                                   <CheckCircle size={14} className="text-green-500" />
                                   Opportunity Stage Gates Mapped
                               </div>
                           </div>
                       </div>
                   )}
                </div>

                {/* Right Panel: Generated Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
                    <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Generative Output</span>
                        {docContent && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">AI Generated</span>}
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none">
                         {!docContent ? (
                             <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                 <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                     <FileText className="opacity-20" size={24} />
                                 </div>
                                 <p>Click "Generate Guide" to create {role.toLowerCase()} documentation.</p>
                             </div>
                         ) : (
                             <div className="whitespace-pre-wrap font-sans text-slate-700">{docContent}</div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  // --- View Switching Logic ---
  
  if (authView === 'LANDING') {
      return <LandingPage setView={setAuthView} />;
  }

  if (authView === 'LOGIN' || authView === 'SIGNUP') {
      return <AuthPage view={authView} setView={setAuthView} onAuthSuccess={handleAuthSuccess} />;
  }

  // --- Main App Logic ---

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-8 h-screen overflow-y-auto relative">
        {/* Global Context Bar */}
        <div className="flex justify-end items-center gap-4 mb-4">
           {customerProfile && customerProfile.subscription.status === 'Trialing' && activeTab !== Tab.PROFILE && (
             <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab(Tab.PROFILE)}>
                Trial Active: {Math.ceil((new Date(customerProfile.subscription.trialEndDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days Left
             </div>
           )}
           {activeOrg && (
             <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border shadow-sm">
                <div className={`w-2 h-2 rounded-full ${activeOrg.status === ConnectionStatus.CONNECTED ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                Current Context: <span className="font-semibold text-slate-700">{activeOrg.alias}</span>
             </div>
           )}
           {currentUser && (
               <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                       {currentUser.name.split(' ').map((n: string) => n[0]).join('')}
                   </div>
               </div>
           )}
        </div>

        {activeTab === Tab.DASHBOARD && renderDashboard()}
        {activeTab === Tab.INTEGRATIONS && renderIntegrations()}
        {activeTab === Tab.METADATA && renderMetadataExplorer()}
        {activeTab === Tab.DEV_HUB && renderWorkspace('Developer Workspace', 'DEV', Code2)}
        {activeTab === Tab.GTM_HUB && renderWorkspace('BA & GTM Hub', 'GTM', Workflow)}
        {activeTab === Tab.SALES_ENABLEMENT && renderWorkspace('Sales Onboarding', 'SALES', GraduationCap)}
        {activeTab === Tab.CHAT && <ChatInterface activeOrg={activeOrg} orgs={orgs} />}
        {activeTab === Tab.PROFILE && customerProfile && <CustomerProfilePage profile={customerProfile} />}
      </main>
      
      {/* OAuth Modal */}
      <OAuthModal 
        isOpen={isOAuthOpen} 
        onClose={() => setIsOAuthOpen(false)} 
        onSuccess={handleOAuthSuccess}
        orgType={oauthOrgType}
      />

      {/* Syncing Overlay Toast */}
      {activeOrg?.syncState.isSyncing && (
          <div className="fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 p-4 z-50 animate-slide-up">
              <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm text-slate-800">Syncing Metadata...</span>
                  <span className="text-xs font-mono text-blue-600">{activeOrg.syncState.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${activeOrg.syncState.progress}%` }}></div>
              </div>
              <div className="text-xs text-slate-500 truncate">
                  {activeOrg.syncState.logs[activeOrg.syncState.logs.length - 1]}
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
