
import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Visualizer from './components/Visualizer';
import CustomerProfilePage from './components/CustomerProfile';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPages';
import OAuthModal from './components/OAuthModal';
import OAuthCallback from './components/OAuthCallback';
import { Tab, Org, OrgType, ConnectionStatus, SyncStage, Integration, IntegrationType, SyncState, CustomerProfile, AuthView, User, MetadataItem, MetadataType, SystemRole } from './types';
import { login } from './services/authService';
import SignUp from './components/Auth/SignUp';
import EmailVerification from './components/Auth/EmailVerification';
import SalesConsole from './components/Internal/SalesConsole';
// Switched to real service
// Switched to real service
import { performRealSync, getActiveConnectionId, setActiveConnection as saveActiveConnection, removeConnection } from './services/realSalesforceService';
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
  const [authView, setAuthView] = useState<AuthView>('LANDING');
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
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
    // Check for existing session (mock)
    // In a real app, we'd check localStorage or a cookie
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

        // Restore active org from persistent service
        const storedActiveId = getActiveConnectionId();
        const activeExists = parsed.find((o: any) => o.id === storedActiveId);

        if (activeExists) {
          setActiveOrgId(storedActiveId);
        } else if (parsed.length > 0) {
          // Fallback to first if stored active not found
          setActiveOrgId(parsed[0].id);
          saveActiveConnection(parsed[0].id);
        }
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

  // Safety: If user is logged in, show app; if logged out, show landing
  useEffect(() => {
    if (currentUser && authView === 'LANDING' && !isOAuthCallback) {
      setAuthView('APP');
    }
    // Don't auto-redirect to landing - let explicit logout handle it
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting login with:", email);
    setIsLoading(true);
    setLoginError('');
    try {
      const { user, profile } = await login(email, password);
      console.log("Login successful:", user);
      setCurrentUser(user);
      setCustomerProfile(profile);

      // Persist session
      localStorage.setItem('docai_user', JSON.stringify(user));
      localStorage.setItem('docai_profile', JSON.stringify(profile));

      setAuthView('APP');
    } catch (err: any) {
      console.error("Login error:", err);
      setLoginError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCustomerProfile(null);
    localStorage.removeItem('docai_user');
    localStorage.removeItem('docai_profile');
    setAuthView('LANDING');
    setActiveTab(Tab.DASHBOARD);
    setEmail('');
    setPassword('');
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
    saveActiveConnection(newOrgId); // Force new org as active context

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

  const resolvedSelectedItems = React.useMemo(() => {
    if (!activeOrg?.metadataSummary) return [];
    const summary = activeOrg.metadataSummary;
    const resolved: MetadataItem[] = [];

    // Helper to check and add
    const check = (id: string, name: string, type: MetadataType, label?: string, metadata?: any) => {
      if (selectedMetadataItems.has(id)) {
        resolved.push({
          id,
          name,
          label: label || name,
          type,
          category: 'system-components', // Defaulting for now
          metadata,
          lastModifiedDate: new Date().toLocaleDateString() // Mock date
        });
      }
    };

    summary.objects.forEach(o => check(`object-${o.name}`, o.name, MetadataType.OBJECT, o.label, o));
    summary.apexClasses.forEach(a => check(`apex-${a.name}`, a.name, MetadataType.APEX_CLASS, a.name, a));
    summary.triggers.forEach(t => check(`trigger-${t.name}`, t.name, MetadataType.TRIGGER, t.name, t));
    summary.flows.forEach(f => check(`flow-${f.name}`, f.name, MetadataType.FLOW, f.label, f));
    summary.components.forEach(c => check(`component-${c.name}`, c.name, MetadataType.COMPONENT, c.name, c));
    summary.validationRules.forEach(v => check(`validation-${v.name}`, v.name, MetadataType.VALIDATION_RULE, v.name, v));
    summary.profiles.forEach(p => check(`profile-${p.name}`, p.name, MetadataType.PROFILE, p.name, p));

    return resolved;
  }, [activeOrg, selectedMetadataItems]);

  const handleGenerateDoc = async (role: 'DEV' | 'GTM' | 'SALES' = 'DEV', specificRole?: string, processName?: string) => {
    if (!activeOrg?.metadataSummary) return;
    setIsGeneratingDoc(true);
    const jiraIntegration = integrations.find(i => i.type === IntegrationType.JIRA);
    const isJiraConnected = jiraIntegration?.status === ConnectionStatus.CONNECTED;
    const content = await generateRoleBasedDoc(role, specificRole, processName, activeOrg.metadataSummary, isJiraConnected);
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

  // --- Landing Page (Public) ---
  if (authView === 'LANDING') {
    return <LandingPage setView={setAuthView} />;
  }

  // --- Auth Views ---
  if (authView === 'SIGNUP') {
    return <SignUp onNavigate={(view) => setAuthView(view as AuthView)} />;
  }

  if (authView === 'VERIFY') {
    return <EmailVerification onSuccess={(user) => { setCurrentUser(user); setAuthView('APP'); }} />;
  }

  if (authView === 'LOGIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-blue-200">
              DB
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
            <p className="text-slate-500 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="john@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <p className="text-red-500 text-sm">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button onClick={() => setAuthView('SIGNUP')} className="text-blue-600 font-medium hover:underline">
              Start free trial
            </button>
          </div>

          {/* Quick Login for Testing */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center mb-3">Quick Login (Testing)</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEmail('info@brahmcloud');
                  setPassword('test123');
                }}
                className="flex-1 px-3 py-2 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
              >
                🔧 Internal User
              </button>
              <button
                onClick={() => {
                  setEmail('akankshatrivedi45@gmail.com');
                  setPassword('test123');
                }}
                className="flex-1 px-3 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
              >
                👤 Customer User
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Internal Console Routing ---
  if (currentUser?.tenantId === 'internal') {
    return <SalesConsole currentUser={currentUser} onLogout={handleLogout} />;
  }

  // --- Main SaaS App ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
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
          <div className="flex justify-end items-center gap-4 mb-6">
            {customerProfile && customerProfile.subscription.status === 'Trialing' && activeTab !== Tab.PROFILE && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab(Tab.PROFILE)}>
                Trial Active: {Math.ceil((new Date(customerProfile.subscription.trialEndDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days Left
              </div>
            )}
            {activeOrg && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border shadow-sm">
                <div className={`w-2 h-2 rounded-full ${activeOrg.status === ConnectionStatus.CONNECTED ? 'bg-green-500' : (activeOrg.status === ConnectionStatus.ERROR ? 'bg-red-500' : 'bg-amber-500')}`}></div>
                Current Context:
                <select
                  value={activeOrgId || ''}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setActiveOrgId(newId);
                    saveActiveConnection(newId);
                  }}
                  className="font-semibold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer py-0 pl-1 pr-6 text-xs"
                >
                  {orgs.filter(o => o.status !== ConnectionStatus.DISCONNECTED).map(o => (
                    <option key={o.id} value={o.id}>{o.alias || o.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === Tab.DASHBOARD && <Dashboard orgs={orgs} />}
          {activeTab === Tab.INTEGRATIONS && <Integrations
            orgs={orgs}
            integrations={integrations}
            activeOrgId={activeOrgId}
            setActiveOrgId={(id) => {
              setActiveOrgId(id);
              saveActiveConnection(id);
            }}
            onDisconnectOrg={(id) => {
              const confirmed = window.confirm("Are you sure you want to disconnect this org? Metadata cache will be cleared.");
              if (confirmed) {
                removeConnection(id);
                setOrgs(prev => prev.filter(o => o.id !== id));

                // Logic to switch active if current was deleted
                if (activeOrgId === id) {
                  const remaining = orgs.filter(o => o.id !== id);
                  if (remaining.length > 0) {
                    const nextId = remaining[0].id;
                    setActiveOrgId(nextId);
                    saveActiveConnection(nextId);
                  } else {
                    setActiveOrgId(null);
                  }
                }
              }
            }}
            initiateAddOrg={(type) => { setOauthOrgType(type); setIsOAuthOpen(true); }}
            onConnectJira={(env) => {
              setIntegrations(prev => prev.map(i =>
                i.type === IntegrationType.JIRA ? { ...i, status: ConnectionStatus.CONNECTED, environment: env } : i
              ));
            }}
          />}
          {activeTab === Tab.METADATA && <MetadataExplorer activeOrg={activeOrg} selectedItems={selectedMetadataItems} onSelectionChange={setSelectedMetadataItems} />}
          {activeTab === Tab.DEV_HUB && <DevWorkspace activeOrg={activeOrg} setActiveTab={setActiveTab} onGenerateDoc={(story) => handleGenerateDoc('DEV', undefined, story)} setChatInitialInput={setChatInitialInput} isGeneratingDoc={isGeneratingDoc} docContent={docContent} selectedItems={resolvedSelectedItems} isJiraConnected={integrations.find(i => i.type === IntegrationType.JIRA)?.status === ConnectionStatus.CONNECTED} />}
          {activeTab === Tab.GTM_HUB && <GTMWorkspace activeOrg={activeOrg} role="GTM" setActiveTab={setActiveTab} onGenerateDoc={(role, specificRole, processName) => handleGenerateDoc(role, specificRole, processName)} isGeneratingDoc={isGeneratingDoc} docContent={docContent} currentUser={currentUser} />}
          {activeTab === Tab.SALES_ENABLEMENT && <GTMWorkspace activeOrg={activeOrg} role="SALES" setActiveTab={setActiveTab} onGenerateDoc={(role, specificRole, processName) => handleGenerateDoc(role, specificRole, processName)} isGeneratingDoc={isGeneratingDoc} docContent={docContent} currentUser={currentUser} />}
          {activeTab === Tab.CHAT && <ChatInterface activeOrg={activeOrg} orgs={orgs} initialInput={chatInitialInput} />}
          {activeTab === Tab.SETTINGS && customerProfile && currentUser && (
            currentUser.systemRole === SystemRole.ADMIN ? (
              <Settings customerProfile={customerProfile} currentUser={currentUser} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <ShieldCheck size={48} className="mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700">Access Denied</h3>
                <p>You don’t have permission to access Admin features.</p>
              </div>
            )
          )}
          {activeTab === Tab.PROFILE && customerProfile && currentUser && <CustomerProfilePage profile={customerProfile} currentUser={currentUser} />}
        </div>
      </main>

      {/* OAuth Modal */}
      <OAuthModal
        isOpen={isOAuthOpen}
        onClose={() => setIsOAuthOpen(false)}
        onSuccess={() => { }} // Not used in Web Server Flow, modal redirects
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
