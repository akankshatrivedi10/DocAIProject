import React, { useState } from 'react';
import { Cloud, Lock, ShieldCheck, ExternalLink } from 'lucide-react';
import { OrgType } from '../types';
import { getAuthorizationUrl, generateCodeVerifier, generateCodeChallenge } from '../services/realSalesforceService';

interface OAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orgType: OrgType;
}

const OAuthModal: React.FC<OAuthModalProps> = ({ isOpen, onClose, orgType }) => {
  const [selectedOrgType, setSelectedOrgType] = useState<OrgType>(orgType);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');

  // Sync state with prop when modal opens/prop changes
  React.useEffect(() => {
    setSelectedOrgType(orgType);
  }, [orgType, isOpen]);

  if (!isOpen) return null;

  const handleOAuthRedirect = async () => {
    setLoading(true);

    // 🎯 REQUIREMENT #2: Use Centralized Connected App with PKCE

    // 1. Generate PKCE Verifier & Challenge
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    // 2. Store Verifier for Token Exchange step
    sessionStorage.setItem('pkce_code_verifier', verifier);

    // Store Sandbox status so Callback knows which endpoint to use
    const isSandbox = selectedOrgType === OrgType.SANDBOX;
    sessionStorage.setItem('is_sandbox', isSandbox ? 'true' : 'false');

    // 3. Generate URL with Challenge
    let authUrl = getAuthorizationUrl(challenge, undefined, consumerKey);

    // Check for missing Client ID
    if (authUrl.includes('client_id=undefined') || authUrl.includes('client_id=&')) {
      setLoading(false);
      setShowAdvanced(true);
      alert('Salesforce Client ID is missing. Please enter it in the "Advanced Options" below (Consumer Key).');
      return;
    }

    if (showCustomDomain && customDomain) {
      // If custom domain is used, we need to replace login.salesforce.com with the custom domain
      const domain = customDomain.startsWith('http') ? customDomain : `https://${customDomain}`;
      authUrl = authUrl.replace('https://login.salesforce.com', domain);
      sessionStorage.setItem('sf_custom_domain', domain);
    } else if (selectedOrgType === OrgType.SANDBOX) {
      authUrl = authUrl.replace('https://login.salesforce.com', 'https://test.salesforce.com');
      sessionStorage.setItem('sf_custom_domain', 'https://test.salesforce.com');
    } else {
      sessionStorage.removeItem('sf_custom_domain');
    }

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

          {/* Advanced Options Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>
          </div>

          {/* Advanced Options Section */}
          {showAdvanced && (
            <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100 animate-in slide-in-from-top-2">
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">Consumer Key (Client ID)</label>
                <input
                  type="text"
                  value={consumerKey}
                  onChange={(e) => setConsumerKey(e.target.value)}
                  placeholder="Paste your Connected App Consumer Key"
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">Leave empty to use default credentials</p>
              </div>
            </div>
          )}

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
              We use secure OAuth 2.0. Your credentials are never stored on our servers.
            </p>
          </div>
        </div>


        <div className="bg-slate-50 px-8 py-4 text-center border-t border-slate-100 relative">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs font-medium">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default OAuthModal;
