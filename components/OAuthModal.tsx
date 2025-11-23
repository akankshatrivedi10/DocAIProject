
import React, { useState, useEffect } from 'react';
import { Loader2, Check, Lock, Cloud, KeyRound } from 'lucide-react';
import { OrgType } from '../types';
import { TEST_CREDENTIALS } from '../services/testCredentials';

interface OAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (username: string) => void;
  orgType: OrgType;
}

const OAuthModal: React.FC<OAuthModalProps> = ({ isOpen, onClose, onSuccess, orgType }) => {
  const [step, setStep] = useState<'LOGIN' | 'CONSENT'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Auto-fill credentials when modal opens for demo purposes
  useEffect(() => {
    if (isOpen) {
      setUsername(TEST_CREDENTIALS.salesforce.username);
      setPassword(TEST_CREDENTIALS.salesforce.password);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(!username || !password) return;
    setLoading(true);
    // Simulate auth check latency
    setTimeout(() => {
      setLoading(false);
      setStep('CONSENT');
    }, 1500);
  };

  const handleAllow = () => {
    setLoading(true);
    // Simulate token exchange latency
    setTimeout(() => {
      setLoading(false);
      onSuccess(username);
      // Reset state for next time (though component might unmount)
      setStep('LOGIN');
      setUsername('');
      setPassword('');
    }, 1500);
  };

  const fillTestCredentials = () => {
    setUsername(TEST_CREDENTIALS.salesforce.username);
    setPassword(TEST_CREDENTIALS.salesforce.password);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      {step === 'LOGIN' ? (
        <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-8 pb-4">
             <div className="flex justify-center mb-8">
               <div className="flex items-center gap-2">
                 <Cloud className="text-blue-500 fill-blue-500" size={48} />
                 <span className="text-2xl font-bold text-slate-700">salesforce</span>
               </div>
             </div>

             <h2 className="text-center text-lg font-medium text-slate-700 mb-6">
                Log In to {orgType === OrgType.PRODUCTION ? 'Production' : 'Sandbox'}
             </h2>

             <form onSubmit={handleLogin} className="space-y-4">
               <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Username</label>
                 <input 
                   type="text" 
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                   placeholder="user@company.com"
                 />
               </div>
               <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Password</label>
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                   placeholder="••••••••"
                 />
               </div>
               
               <button 
                 type="submit" 
                 disabled={loading || !username || !password}
                 className="w-full bg-[#00A1E0] hover:bg-[#008CC2] text-white font-semibold py-3 rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {loading ? <Loader2 size={20} className="animate-spin" /> : 'Log In'}
               </button>
             </form>
             
             <div className="mt-4 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                   <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500"/>
                   Remember me
                </label>
                <a href="#" className="text-blue-500 hover:underline">Forgot Password?</a>
             </div>
             
             <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                 <button 
                    type="button" 
                    onClick={fillTestCredentials}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-1 mx-auto bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 hover:border-emerald-200 transition-colors"
                 >
                    <KeyRound size={12} /> Re-fill Test Credentials
                 </button>
             </div>
          </div>
          <div className="bg-slate-50 px-8 py-4 text-center border-t border-slate-100 relative">
             <button onClick={onClose} className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 text-xs">Cancel</button>
             <p className="text-xs text-slate-500">Not a customer? <a href="#" className="text-blue-500 hover:underline">Try for Free</a></p>
          </div>
        </div>
      ) : (
        <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-[#00A1E0] p-6 text-white flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Cloud size={28} className="text-white fill-white" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold">Allow Access?</h2>
                    <p className="text-blue-100 text-sm">DocBot is requesting permission to access your Salesforce org.</p>
                 </div>
            </div>
            
            <div className="p-8">
               <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">SD</div>
                  <div className="flex-1">
                     <div className="font-semibold text-slate-800">DocBot - AI Architect</div>
                     <div className="text-xs text-slate-500">connected app via docbot.ai</div>
                  </div>
               </div>

               <h3 className="font-semibold text-slate-700 mb-4">Access Requested:</h3>
               <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                     <Check className="text-green-500 shrink-0 mt-0.5" size={16} />
                     <span>Access your basic profile information</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                     <Check className="text-green-500 shrink-0 mt-0.5" size={16} />
                     <span>Access and manage your data (API)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                     <Check className="text-green-500 shrink-0 mt-0.5" size={16} />
                     <span>Perform requests on your behalf at any time (refresh_token, offline_access)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                     <Check className="text-green-500 shrink-0 mt-0.5" size={16} />
                     <span>Manage metadata (Tooling API)</span>
                  </li>
               </ul>

               <div className="flex gap-4">
                  <button 
                    onClick={onClose}
                    className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Deny
                  </button>
                  <button 
                    onClick={handleAllow}
                    disabled={loading}
                    className="flex-1 py-3 bg-[#00A1E0] hover:bg-[#008CC2] text-white font-semibold rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Allow'}
                  </button>
               </div>
            </div>
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Lock size={10} /> Secure Connection</span>
                <span>•</span>
                <span>Privacy Policy</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default OAuthModal;
