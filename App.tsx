
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Visualizer from './components/Visualizer';
import CustomerProfilePage from './components/CustomerProfile';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPages';
import OAuthModal from './components/OAuthModal';
import OAuthCallback from './components/OAuthCallback';
import { Tab, Org, OrgType, ConnectionStatus, SyncStage, Integration, IntegrationType, SyncState, CustomerProfile, AuthView, User } from './types';
// Switched to real service
// Switched to real service
import { performRealSync } from './services/realSalesforceService';
import { generateRoleBasedDoc } from './services/geminiService';
import { Plus, RefreshCw, CheckCircle, AlertCircle, FileText, ExternalLink, Database, Code2, Workflow, GraduationCap, Shield, Lock, Play, Component, ShieldCheck } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Integrations from './components/Integrations';
import MetadataExplorer from './components/MetadataExplorer';
import DevWorkspace from './components/DevWorkspace';
import GTMWorkspace from './components/GTMWorkspace';
import Settings from './components/Settings';
import UserHeader from './components/UserHeader';

const App: React.FC = () => {
  // Navigation State
  const [authView, setAuthView] = useState<AuthView>('LANDING'); // Start at Landing Page
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);

  // Dev Workspace Selection State
  const [selectedDevItems, setSelectedDevItems] = useState<Set<string>>(new Set());
  const [selectedMetadataItems, setSelectedMetadataItems] = useState<Set<string>>(new Set());
  const [chatInitialInput, setChatInitialInput] = useState<string>('');
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

  const [isOAuthCallback, setIsOAuthCallback] = useState(window.location.pathname === '/oauth/callback');

  useEffect(() => {
    // Load persisted session
    const savedUser = localStorage.getItem('docai_user');
    const savedProfile = localStorage.getItem('docai_profile');

    if (savedUser && savedProfile) {
      setCurrentUser(JSON.parse(savedUser));
      setCustomerProfile(JSON.parse(savedProfile));
      // Only set to APP if not in callback mode (callback handles its own transition)
      if (window.location.pathname !== '/oauth/callback') {
        setAuthView('APP');
      }
    }

    // Load persisted orgs
    const savedOrgs = localStorage.getItem('docai_orgs');
    if (savedOrgs) {
      try {
        const parsed = JSON.parse(savedOrgs);
        // Restore dates
        parsed.forEach((o: any) => {
          if (o.metadataSummary) o.metadataSummary.fetchedAt = new Date(o.metadataSummary.fetchedAt);
        });
        setOrgs(parsed);
        if (parsed.length > 0) setActiveOrgId(parsed[0].id);
      } catch (e) {
        console.error("Failed to load orgs", e);
      }
    }
  }, []);

  // Persist orgs whenever they change
  useEffect(() => {
    // Only persist orgs that have successfully connected and synced
    const connectedOrgs = orgs.filter(o => o.status === ConnectionStatus.CONNECTED);
    localStorage.setItem('docai_orgs', JSON.stringify(connectedOrgs));
  }, [orgs]);

  // Safety: If user is logged in, don't show landing page (unless in callback)
  useEffect(() => {
    if (currentUser && authView === 'LANDING' && !isOAuthCallback) {
      setAuthView('APP');
    }
  }, [currentUser, authView, isOAuthCallback]);

  const activeOrg = orgs.find(o => o.id === activeOrgId) || null;

  const handleAuthSuccess = (user: User, profile: CustomerProfile) => {
    setCurrentUser(user);
    setCustomerProfile(profile);

    // Persist session
    localStorage.setItem('docai_user', JSON.stringify(user));
    localStorage.setItem('docai_profile', JSON.stringify(profile));

    setAuthView('APP');

    // If no orgs connected, prompt to connect
    if (orgs.length === 0) {
      setActiveTab(Tab.INTEGRATIONS);
      setTimeout(() => {
        setIsOAuthOpen(true);
      }, 500);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCustomerProfile(null);
    localStorage.removeItem('docai_user');
    localStorage.removeItem('docai_profile');
    setAuthView('LANDING');
    setActiveTab(Tab.DASHBOARD);
  };

  const initiateAddOrg = (type: OrgType) => {
    setOauthOrgType(type);
    setIsOAuthOpen(true);
  };

  // Updated to accept full credentials from OAuthModal
  const handleOAuthSuccess = async (accessToken: string, instanceUrl: string, refreshToken: string) => {
    console.log("[App] handleOAuthSuccess called", { accessToken: '***', instanceUrl });
    setIsOAuthOpen(false);
    setIsOAuthCallback(false);

    // Reset URL to root
    window.history.replaceState({}, document.title, "/");

    const newOrgId = Date.now().toString();
    const isSandbox = instanceUrl.includes('test') || instanceUrl.includes('cs');

    const newOrg: Org = {
      id: newOrgId,
      name: isSandbox ? 'Sandbox Org' : 'Production Org',
      alias: `SF-${isSandbox ? 'SAND' : 'PROD'}`,
      type: isSandbox ? OrgType.SANDBOX : OrgType.PRODUCTION,
      status: ConnectionStatus.CONNECTING,
      syncState: {
        stage: SyncStage.INIT,
        progress: 0,
        logs: [],
        isSyncing: true
      },
      // Store tokens for persistence and refresh
      accessToken: accessToken,
      refreshToken: refreshToken,
      instanceUrl: instanceUrl,
      clientId: sessionStorage.getItem('sf_consumer_key') || undefined,
      clientSecret: sessionStorage.getItem('sf_consumer_secret') || undefined,

      // Legacy mapping (can remove later)
      consumerKey: accessToken,
      consumerSecret: refreshToken,
      securityToken: instanceUrl
    };

    setOrgs(prev => [...prev, newOrg]);
    setActiveOrgId(newOrgId);
    setAuthView('APP'); // Ensure we are in the app view
    setActiveTab(Tab.METADATA); // Redirect to Metadata Tab

    // Start Async Job using Real Service with Tokens
    try {
      const metadata = await performRealSync(
        accessToken,
        instanceUrl,
        (stage, progress, log) => {
          setOrgs(currentOrgs => currentOrgs.map(org => {
            if (org.id === newOrgId) {
              return {
                ...org,
                syncState: {
                  stage,
                  progress,
                  logs: [...org.syncState.logs, log],
                  isSyncing: true
                }
              };
            }
            return org;
          }));
        },
        refreshToken,
        sessionStorage.getItem('sf_consumer_key') || undefined,
        sessionStorage.getItem('sf_consumer_secret') || undefined,
        (newAccessToken) => {
          console.log("[App] Updating access token for org", newOrgId);
          setOrgs(currentOrgs => currentOrgs.map(org => {
            if (org.id === newOrgId) {
              return { ...org, accessToken: newAccessToken };
            }
            return org;
          }));
        }
      );

      // Update Org with Metadata
      setOrgs(currentOrgs => currentOrgs.map(org => {
        if (org.id === newOrgId) {
          return {
            ...org,
            status: ConnectionStatus.CONNECTED,
            lastSync: new Date().toISOString(),
            metadataSummary: metadata,
            syncState: {
              ...org.syncState,
              stage: SyncStage.COMPLETE,
              progress: 100,
              isSyncing: false,
              logs: [...org.syncState.logs, "Sync Completed Successfully."]
            }
          };
        }
        return org;
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

    } catch (e: any) {
      console.error("Sync failed", e);
      // Update org status to error
      setOrgs(currentOrgs => currentOrgs.map(o => {
        if (o.id === newOrgId) {
          return {
            ...o,
            status: ConnectionStatus.ERROR,
            syncState: {
              ...o.syncState,
              isSyncing: false,
              logs: [...o.syncState.logs, `[ERROR] ${e.message}`]
            }
          };
        }
        return o;
      }));
    }
  };

  const handleGenerateDoc = async (role: 'DEV' | 'GTM' | 'SALES' = 'DEV', specificRole?: string, processName?: string) => {
    if (!activeOrg?.metadataSummary) return;
    setIsGeneratingDoc(true);
    const content = await generateRoleBasedDoc(role, specificRole, processName, activeOrg.metadataSummary);
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
      });
    }
  };

  // --- View Switching Logic ---

  // --- View Switching Logic ---

  if (isOAuthCallback) {
    return (
      <OAuthCallback
        onSuccess={handleOAuthSuccess}
        onError={(err) => {
          console.error("OAuth Callback Error", err);
          setIsOAuthCallback(false);
          alert(`Connection Failed: ${err}`);
        }}
      />
    );
  }

  if (authView === 'LANDING') {
    return <LandingPage setView={setAuthView} />;
  }

  if (authView === 'LOGIN' || authView === 'SIGNUP') {
    return <AuthPage view={authView} setView={setAuthView} onAuthSuccess={handleAuthSuccess} />;
  }

  // --- Main App Logic ---

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* User Header */}
        {currentUser && customerProfile && (
          <UserHeader
            user={currentUser}
            organizationName={customerProfile.companyName}
            onLogout={handleLogout}
          />
        )}

        <div className="flex-1 p-8 overflow-y-auto relative">
          {/* Global Context Bar */}
          <div className="flex justify-end items-center gap-4 mb-4">
            {customerProfile && customerProfile.subscription.status === 'Trialing' && activeTab !== Tab.PROFILE && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab(Tab.PROFILE)}>
                Trial Active: {Math.ceil((new Date(customerProfile.subscription.trialEndDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days Left
              </div>
            )}
            {activeOrg && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border shadow-sm">
                <div className={`w-2 h-2 rounded-full ${activeOrg.status === ConnectionStatus.CONNECTED ? 'bg-green-500' : (activeOrg.status === ConnectionStatus.ERROR ? 'bg-red-500' : 'bg-amber-500')}`}></div>
                Current Context: <span className="font-semibold text-slate-700">{activeOrg.alias}</span>
              </div>
            )}
          </div>
        </div>

        {activeTab === Tab.DASHBOARD && <Dashboard orgs={orgs} />}
        {activeTab === Tab.INTEGRATIONS && <Integrations orgs={orgs} integrations={integrations} activeOrgId={activeOrgId} setActiveOrgId={setActiveOrgId} initiateAddOrg={(type) => { setOauthOrgType(type); setIsOAuthOpen(true); }} />}
        {activeTab === Tab.METADATA && <MetadataExplorer activeOrg={activeOrg} selectedItems={selectedMetadataItems} onSelectionChange={setSelectedMetadataItems} />}
        {activeTab === Tab.DEV_HUB && <DevWorkspace activeOrg={activeOrg} setActiveTab={setActiveTab} onGenerateDoc={() => handleGenerateDoc('DEV')} setChatInitialInput={setChatInitialInput} isGeneratingDoc={isGeneratingDoc} docContent={docContent} selectedItems={selectedMetadataItems} />}
        {activeTab === Tab.GTM_HUB && <GTMWorkspace activeOrg={activeOrg} role="GTM" setActiveTab={setActiveTab} onGenerateDoc={(role, specificRole, processName) => handleGenerateDoc(role, specificRole, processName)} isGeneratingDoc={isGeneratingDoc} docContent={docContent} />}
        {activeTab === Tab.SALES_ENABLEMENT && <GTMWorkspace activeOrg={activeOrg} role="SALES" setActiveTab={setActiveTab} onGenerateDoc={(role, specificRole, processName) => handleGenerateDoc(role, specificRole, processName)} isGeneratingDoc={isGeneratingDoc} docContent={docContent} />}
        {activeTab === Tab.CHAT && <ChatInterface activeOrg={activeOrg} orgs={orgs} initialInput={chatInitialInput} />}
        {activeTab === Tab.SETTINGS && customerProfile && currentUser && <Settings customerProfile={customerProfile} currentUser={currentUser} />}
        {activeTab === Tab.PROFILE && customerProfile && currentUser && <CustomerProfilePage profile={customerProfile} currentUser={currentUser} />}
      </main>

      {/* OAuth Modal */}
      <OAuthModal
        isOpen={isOAuthOpen}
        onClose={() => setIsOAuthOpen(false)}
        onSuccess={() => { }} // Not used in Web Server Flow, modal redirects
        orgType={OrgType.PRODUCTION}
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
