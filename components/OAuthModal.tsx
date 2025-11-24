import React, { useState } from 'react';
import { Cloud, Lock, ShieldCheck, ExternalLink } from 'lucide-react';
import { OrgType } from '../types';

interface OAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Not used directly, but kept for interface compatibility
  orgType: OrgType;
}

const OAuthModal: React.FC<OAuthModalProps> = ({ isOpen, onClose, orgType }) => {
  const [selectedOrgType, setSelectedOrgType] = useState<OrgType>(orgType);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCustomDomain, setShowCustomDomain] = useState(true);
  const [customDomain, setCustomDomain] = useState('softwareag--devcpq.sandbox.my.salesforce.com');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');

  if (!isOpen) return null;

  const handleOAuthRedirect = () => {
    setLoading(true);

    // Use user-provided key or fallback to default (only for demo purposes)
    const finalClientId = consumerKey || '3MVG9zOb8H6wKLFB7zmZNpygP_lAVkRdqdrTzhSbY5eIg0WC1OIjHWegTNJ3qpjPxTPyrMMo9Av0R4mS8OQ5R';
    const finalClientSecret = consumerSecret || '908DF7011CBED34A72303BB95A30A009E4AB9BF26A889D16460CECD0D720C101';

    // Store in session storage for the callback to use
    sessionStorage.setItem('sf_consumer_key', finalClientId);
    sessionStorage.setItem('sf_consumer_secret', finalClientSecret);

    const redirectUri = `${window.location.origin}/oauth/callback`;

    let loginUrl = selectedOrgType === OrgType.SANDBOX
      ? 'https://test.salesforce.com'
      : 'https://login.salesforce.com';

    if (showCustomDomain && customDomain) {
      // Ensure protocol is present
      loginUrl = customDomain.startsWith('http') ? customDomain : `https://${customDomain}`;
    }

    const authUrl = `${loginUrl}/services/oauth2/authorize?response_type=code&client_id=${finalClientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    // Redirect to Salesforce
    window.location.href = authUrl;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        <div className="p-8 pb-6">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <Cloud className="text-blue-500 fill-blue-500" size={48} />
              <span className="text-2xl font-bold text-slate-700">salesforce</span>
            </div>
          </div>

          <h2 className="text-center text-lg font-medium text-slate-700 mb-2">
            Connect to Salesforce
          </h2>
          <p className="text-center text-slate-500 text-sm mb-6">
            You will be redirected to Salesforce to log in and authorize access.
          </p>

          {/* Environment Switcher */}
          <div className="flex justify-center mb-4">
            <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-medium w-full">
              <button
                type="button"
                onClick={() => setSelectedOrgType(OrgType.PRODUCTION)}
                className={`flex-1 px-3 py-2 rounded-md transition-all ${selectedOrgType === OrgType.PRODUCTION ? 'bg-white text-slate-800 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Production
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrgType(OrgType.SANDBOX)}
                className={`flex-1 px-3 py-2 rounded-md transition-all ${selectedOrgType === OrgType.SANDBOX ? 'bg-white text-slate-800 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sandbox
              </button>
            </div>
          </div>

          {/* Custom Domain Input */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="useCustomDomain"
                checked={showCustomDomain}
                onChange={(e) => setShowCustomDomain(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="useCustomDomain" className="text-xs text-slate-600">Use Custom Domain (My Domain)</label>
            </div>

            {showCustomDomain && (
              <div className="animate-in slide-in-from-top-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="e.g. mycompany--sandbox.my.salesforce.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">Enter the full domain without https://</p>
              </div>
            )}
          </div>

          <button
            onClick={handleOAuthRedirect}
            disabled={loading}
            className="w-full bg-[#00A1E0] hover:bg-[#008CC2] text-white font-semibold py-3 rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Redirecting...' : (
              <>
                <ExternalLink size={18} />
                Log In with Salesforce
              </>
            )}
          </button>

          <div className="mt-6 flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-blue-800">
              We use secure OAuth 2.0. Your password is never stored on our servers.
            </p>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-400 hover:text-blue-600 font-medium underline decoration-dotted"
            >
              {showAdvanced ? 'Hide Connected App Settings' : 'I have my own Connected App'}
            </button>
          </div>

          {/* Advanced Fields */}
          {showAdvanced && (
            <div className="mt-4 space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-left animate-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Consumer Key</label>
                <input
                  type="text"
                  value={consumerKey}
                  onChange={(e) => setConsumerKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                  placeholder="3MVG9..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Consumer Secret</label>
                <input
                  type="password"
                  value={consumerSecret}
                  onChange={(e) => setConsumerSecret(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                  placeholder="908D..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-8 py-4 text-center border-t border-slate-100 relative">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs font-medium">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default OAuthModal;
