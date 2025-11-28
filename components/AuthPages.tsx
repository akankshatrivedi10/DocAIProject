
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthView } from '../types';
import { login, signup } from '../services/authService';
import { TEST_CREDENTIALS } from '../services/testCredentials';
import { Button, Input, Card } from './ui';
import { ArrowLeft, Mail, Lock, Building, User, KeyRound, Sparkles, FileText, Zap, Shield } from 'lucide-react';

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

  const fillTestUser = () => {
    setEmail(TEST_CREDENTIALS.app.email);
    setPassword(TEST_CREDENTIALS.app.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-20" style={{ animationDelay: '1s' }} />

      <motion.div
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Side - Branding & Features */}
        <motion.div
          className="hidden lg:block space-y-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">SD</div>
            <span className="text-2xl font-bold text-slate-900">DocBot</span>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              {view === 'LOGIN' ? 'Welcome Back!' : 'Start Your Free Trial'}
            </h1>
            <p className="text-lg text-slate-600">
              {view === 'LOGIN'
                ? 'Sign in to access your AI-powered documentation workspace.'
                : 'No credit card required. Full access for 30 days.'}
            </p>
          </div>

          <div className="space-y-4">
            <FeatureBadge icon={<Sparkles size={18} />} text="AI-powered documentation generation" />
            <FeatureBadge icon={<FileText size={18} />} text="Metadata analysis & visualization" />
            <FeatureBadge icon={<Zap size={18} />} text="Instant Salesforce, Jira integration" />
            <FeatureBadge icon={<Shield size={18} />} text="SOC2 compliant & secure" />
          </div>
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('LANDING')}
            className="mb-4 lg:hidden"
          >
            <ArrowLeft size={16} /> Back to Home
          </Button>

          <Card className="p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">SD</div>
            </div>

            <motion.h2
              className="text-2xl font-bold text-center text-slate-800 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {view === 'LOGIN' ? 'Sign In' : 'Create Account'}
            </motion.h2>
            <motion.p
              className="text-center text-slate-500 text-sm mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {view === 'LOGIN'
                ? 'Enter your credentials to continue'
                : 'Join thousands of teams using DocBot'}
            </motion.p>

            {error && (
              <motion.div
                className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ⚠️ {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'SIGNUP' && (
                <>
                  <Input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    icon={<User size={18} />}
                  />
                  <Input
                    type="text"
                    required
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    icon={<Building size={18} />}
                  />
                </>
              )}

              <Input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
              />

              <Input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
              />

              {view === 'SIGNUP' && (
                <Input
                  type="password"
                  required
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock size={18} />}
                />
              )}

              {view === 'SIGNUP' && (
                <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
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

              <Button
                type="submit"
                isLoading={loading}
                className="w-full"
                size="lg"
              >
                {view === 'LOGIN' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            {view === 'LOGIN' && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fillTestUser}
                  className="mx-auto text-emerald-600 bg-emerald-50 border border-emerald-100 hover:border-emerald-200"
                >
                  <KeyRound size={14} /> Auto-fill Test User (Brahmcloud)
                </Button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
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
          </Card>

          <motion.div
            className="hidden lg:block mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('LANDING')}
            >
              <ArrowLeft size={16} /> Back to Home
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

const FeatureBadge = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <motion.div
    className="flex items-center gap-3"
    whileHover={{ x: 4 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
      {icon}
    </div>
    <span className="text-slate-700">{text}</span>
  </motion.div>
);

export default AuthPage;