
import React from 'react';
import { AuthView } from '../types';
import { ArrowRight, CheckCircle, Database, Workflow, FileText, Shield } from 'lucide-react';

interface LandingPageProps {
  setView: (view: AuthView) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">SD</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">DocBot</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('LOGIN')}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => setView('SIGNUP')}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-24">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            New: Agentic Process Visualization
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Understand your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Salesforce Metadata</span> instantly.
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect your CRM. DocBot analyzes your Objects, Apex, and Flows to automatically generate technical documentation, ERDs, and business process maps.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setView('SIGNUP')}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start 1-Month Free Trial <ArrowRight size={20} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors">
              View Demo
            </button>
          </div>
          
          <p className="mt-4 text-sm text-slate-400">No credit card required for trial. SOC2 Compliant.</p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-slate-50 rounded-3xl mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Auto-Documentation</h3>
            <p className="text-slate-600 leading-relaxed">
              Stop writing docs manually. Generate detailed references for Apex classes, Triggers, and Objects automatically from metadata.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6">
              <Workflow size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Process Visualization</h3>
            <p className="text-slate-600 leading-relaxed">
              Visualize Flows and cross-object logic with generated diagrams. Export to Mermaid.js, PDF, or Confluence.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Multi-Org Support</h3>
            <p className="text-slate-600 leading-relaxed">
              Connect Production and Sandboxes simultaneously. Compare metadata and track changes across environments.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded text-white flex items-center justify-center font-bold text-xs">SD</div>
            <span className="font-semibold text-slate-900">DocBot</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900">Terms of Service</a>
            <a href="#" className="hover:text-slate-900">Security</a>
            <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
          <div className="text-sm text-slate-400">
            © 2024 DocBot Inc.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
