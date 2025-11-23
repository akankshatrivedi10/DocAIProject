
import React, { useState } from 'react';
import { AuthView } from '../types';
import { login, signup } from '../services/authService';
import { Loader2, ArrowLeft, Mail, Lock, Building, User } from 'lucide-react';

interface AuthPageProps {
  view: 'LOGIN' | 'SIGNUP';
  setView: (view: AuthView) => void;
  onAuthSuccess: (user: any, profile: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ view, setView, onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'LOGIN') {
        const { user, profile } = await login(email, password);
        onAuthSuccess(user, profile);
      } else {
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
        }
        if (!agreed) {
            throw new Error("You must agree to the Terms of Service");
        }
        const { user, profile } = await signup(fullName, companyName, email, password);
        onAuthSuccess(user, profile);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <button 
           onClick={() => setView('LANDING')}
           className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8">
            <div className="flex justify-center mb-6">
               <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">SD</div>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
              {view === 'LOGIN' ? 'Welcome Back' : 'Start Your Free Trial'}
            </h2>
            <p className="text-center text-slate-500 text-sm mb-8">
              {view === 'LOGIN' 
                ? 'Sign in to access your documentation workspace.' 
                : 'No credit card required. 1-month full access.'}
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'SIGNUP' && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {view === 'SIGNUP' && (
                 <div className="relative">
                   <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                   <input
                     type="password"
                     required
                     placeholder="Confirm Password"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                   />
                 </div>
              )}

              {view === 'SIGNUP' && (
                <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="mt-1"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span>I agree to the <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> and <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>.</span>
                </label>
              )}

              {view === 'LOGIN' && (
                 <div className="flex justify-end">
                     <a href="#" className="text-xs text-blue-600 hover:underline">Forgot Password?</a>
                 </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {view === 'LOGIN' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <p className="text-sm text-slate-600">
              {view === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setView(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                className="ml-2 font-medium text-blue-600 hover:underline"
              >
                {view === 'LOGIN' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
