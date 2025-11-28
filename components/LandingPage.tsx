import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthView } from '../types';
import { Button, Card } from './ui';
import {
  ArrowRight,
  CheckCircle,
  Database,
  Workflow,
  FileText,
  Shield,
  Zap,
  Layout,
  Code2,
  Bot,
  ChevronDown,
  ChevronUp,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Check,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  setView: (view: AuthView) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setView }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">SD</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">DocBot</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
              <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
            <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('LOGIN')}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => setView('SIGNUP')}
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-32 pb-40 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-gradient-to-tr from-indigo-400 to-pink-400 rounded-full blur-3xl opacity-25" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-300 to-blue-300 rounded-full blur-3xl opacity-20" style={{ animationDelay: '4s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center max-w-5xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 text-sm font-semibold mb-8 shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              ✨ v2.0 Now Available: Agentic Process Visualization
            </motion.div>

            <motion.h1
              className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight mb-10 leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Documentation that <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse">writes itself.</span>
            </motion.h1>

            <motion.p
              className="text-2xl text-slate-700 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Connect Salesforce, HubSpot, and Jira. <span className="text-blue-600 font-bold">DocBot's AI agents</span> analyze your metadata to generate technical specs, process maps, and GTM guides <span className="text-purple-600 font-bold">instantly</span>.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={() => setView('SIGNUP')}
                size="lg"
                className="w-full sm:w-auto text-lg px-10 py-6 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70"
              >
                <Sparkles size={22} className="animate-pulse" />
                Start 1-Month Free Trial
                <ArrowRight size={22} />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto text-lg px-10 py-6 bg-white/90 backdrop-blur-sm hover:bg-white shadow-xl"
              >
                <FileText size={20} />
                View Live Demo
              </Button>
            </motion.div>
            <motion.p
              className="text-sm text-slate-600 font-medium flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Shield size={16} className="text-green-600" />
                SOC2 Compliant
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle size={16} className="text-blue-600" />
                No credit card required
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Zap size={16} className="text-purple-600" />
                5-minute setup
              </span>
            </motion.p>
          </motion.div>

          {/* Enhanced UI Preview with Glassmorphism */}
          <motion.div
            className="relative max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
              <div className="h-12 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200/50 flex items-center px-6 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm"></div>
                <div className="ml-6 w-80 h-7 bg-white/80 rounded-lg opacity-70 border border-slate-200"></div>
              </div>
              <div className="flex h-[450px] md:h-[550px]">
                {/* Sidebar mock */}
                <div className="w-16 md:w-72 border-r border-white/30 bg-gradient-to-b from-slate-50/80 to-slate-100/60 backdrop-blur-sm p-6 space-y-5 hidden md:block">
                  <div className="h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl w-full shadow-lg"></div>
                  <div className="h-5 bg-slate-300/60 rounded-lg w-3/4"></div>
                  <div className="h-5 bg-slate-300/60 rounded-lg w-1/2"></div>
                  <div className="h-5 bg-slate-300/60 rounded-lg w-5/6"></div>
                </div>
                {/* Main Content mock */}
                <div className="flex-1 p-10 bg-gradient-to-br from-slate-50/40 to-blue-50/30 backdrop-blur-sm">
                  <div className="flex gap-6 mb-10">
                    <div className="flex-1 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-shadow">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl mb-5 shadow-lg"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                      <div className="h-10 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg w-1/3"></div>
                    </div>
                    <div className="flex-1 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-shadow">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl mb-5 shadow-lg"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                      <div className="h-10 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg w-1/3"></div>
                    </div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 p-8 flex gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-5 bg-slate-200 rounded w-full"></div>
                      <div className="h-5 bg-slate-200 rounded w-5/6"></div>
                    </div>
                    <div className="w-1/3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center border-2 border-blue-200">
                      <Workflow className="text-blue-400" size={64} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Floating Badge */}
            <motion.div
              className="absolute -bottom-8 -right-8 bg-white/95 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-xl shadow-lg">
                <CheckCircle className="text-white" size={28} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status</p>
                <p className="text-lg font-extrabold text-slate-900">Metadata Synced ✨</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-10 bg-white border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">Trusted by modern engineering teams</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Logos using text for demo */}
            <span className="text-xl font-bold text-slate-800 flex items-center gap-2"><Globe size={20} /> ACME Corp</span>
            <span className="text-xl font-bold text-slate-800 flex items-center gap-2"><Database size={20} /> DataFlow</span>
            <span className="text-xl font-bold text-slate-800 flex items-center gap-2"><Zap size={20} /> SparkLabs</span>
            <span className="text-xl font-bold text-slate-800 flex items-center gap-2"><Layout size={20} /> GridSystems</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to master your CRM</h2>
            <p className="text-lg text-slate-600">DocBot bridges the gap between technical complexity and business understanding.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText size={24} />}
              color="blue"
              title="Auto-Documentation"
              description="Stop writing docs manually. Generate detailed references for Apex classes, Triggers, and Objects automatically from metadata."
            />
            <FeatureCard
              icon={<Workflow size={24} />}
              color="purple"
              title="Process Visualization"
              description="Visualize Flows and cross-object logic with generated diagrams. Export to Mermaid.js, PDF, or Confluence instantly."
            />
            <FeatureCard
              icon={<Shield size={24} />}
              color="emerald"
              title="Governance & Security"
              description="Track metadata changes across Production and Sandbox. Identify PII risks and dependency impact before deploying."
            />
            <FeatureCard
              icon={<Code2 size={24} />}
              color="indigo"
              title="Developer Hub"
              description="A dedicated workspace for devs to map dependencies, view Apex triggers, and understand legacy codebases."
            />
            <FeatureCard
              icon={<Layout size={24} />}
              color="orange"
              title="GTM Enablement"
              description="Translate technical config into Sales Playbooks. Show BDRs exactly how lead routing and qualification works."
            />
            <FeatureCard
              icon={<Bot size={24} />}
              color="pink"
              title="AI Assistant"
              description="Ask questions like 'Why did this Opportunity close?' or 'Show me the lead scoring logic' and get instant answers."
            />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-3xl font-bold text-slate-900">From Chaos to Clarity in 3 Steps</h2>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                  <div className="w-0.5 h-full bg-blue-100 my-2"></div>
                </div>
                <div className="pb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Connect Your Org</h3>
                  <p className="text-slate-600">Securely connect via OAuth. We support Salesforce Production, Sandbox, HubSpot, and Jira.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                  <div className="w-0.5 h-full bg-blue-100 my-2"></div>
                </div>
                <div className="pb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Agentic Analysis</h3>
                  <p className="text-slate-600">Our AI agents scan your metadata, building a semantic map of objects, code, and automations.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Explore & Export</h3>
                  <p className="text-slate-600">Generate diagrams, ask questions, and export documentation to Confluence or PDF.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-inner">
              <div className="aspect-square relative rounded-xl overflow-hidden bg-white shadow-lg border border-slate-100 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50"></div>
                <div className="text-center p-8 relative z-10">
                  <Zap className="mx-auto text-yellow-500 mb-4" size={48} />
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Sync Complete</h4>
                  <p className="text-sm text-slate-500">1,402 Metadata items analyzed in 45 seconds.</p>
                  <div className="mt-6 flex justify-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"></span>
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce delay-100"></span>
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600">Start with our 30-day free trial on the Pro plan. No credit card required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <h3 className="text-xl font-bold text-slate-800">Free</h3>
              <p className="text-slate-500 text-sm mt-2">For individuals and small tests.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">$0</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <button
                onClick={() => setView('SIGNUP')}
                className="w-full py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign Up Free
              </button>
              <div className="mt-8 space-y-4 text-sm text-slate-600 flex-1">
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> 1 Connected Org</div>
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> Basic Documentation</div>
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> 1 User Seat</div>
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> 500 Metadata Items</div>
              </div>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-600 flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
              <h3 className="text-xl font-bold text-slate-800">Pro</h3>
              <p className="text-slate-500 text-sm mt-2">For growing teams and consultants.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">$49</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <button
                onClick={() => setView('SIGNUP')}
                className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Start Free Trial
              </button>
              <div className="mt-8 space-y-4 text-sm text-slate-600 flex-1">
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> 5 Connected Orgs</div>
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> Advanced Visualization</div>
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> 5 User Seats</div>
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> AI Chat Assistant</div>
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> Unlimited Metadata</div>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <h3 className="text-xl font-bold text-slate-800">Enterprise</h3>
              <p className="text-slate-500 text-sm mt-2">For large orgs requiring security.</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">Custom</span>
              </div>
              <button className="w-full py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                Contact Sales
              </button>
              <div className="mt-8 space-y-4 text-sm text-slate-600 flex-1">
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> Unlimited Orgs</div>
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> SSO & SAML</div>
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> Custom Integrations</div>
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> Dedicated Account Manager</div>
                <div className="flex items-center gap-3"><Check size={18} className="text-blue-600 flex-shrink-0" /> SLA Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FaqItem
              question="Do you store my Salesforce data?"
              answer="No. We only store metadata (field names, class names, flow definitions) to generate documentation. Actual customer record data is never persisted."
              isOpen={openFaq === 0}
              toggle={() => toggleFaq(0)}
            />
            <FaqItem
              question="Can I connect multiple orgs?"
              answer="Yes! Our Pro plan supports up to 5 concurrent org connections, perfect for comparing Sandbox vs Production environments."
              isOpen={openFaq === 1}
              toggle={() => toggleFaq(1)}
            />
            <FaqItem
              question="Is it compliant with SOC2?"
              answer="We are currently in the audit process for SOC2 Type II. We utilize AWS encryption at rest and in transit."
              isOpen={openFaq === 2}
              toggle={() => toggleFaq(2)}
            />
            <FaqItem
              question="How does the free trial work?"
              answer="You get full access to the Pro plan for 30 days. No credit card required. After 30 days, you can choose to upgrade or downgrade to the limited Free tier."
              isOpen={openFaq === 3}
              toggle={() => toggleFaq(3)}
            />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Get in touch</h2>
              <p className="text-lg text-slate-600 mb-8">
                Have questions about our security, roadmap, or enterprise plans? Our team is ready to answer your questions.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Email Support</h4>
                    <p className="text-slate-600 text-sm mb-1">Our team typically responds within 2 hours.</p>
                    <a href="mailto:support@docbot.ai" className="text-blue-600 font-medium hover:underline">support@docbot.ai</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 shrink-0">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Live Chat</h4>
                    <p className="text-slate-600 text-sm mb-1">Available 9am - 5pm EST.</p>
                    <button className="text-blue-600 font-medium hover:underline text-left">Start a conversation</button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Sales</h4>
                    <p className="text-slate-600 text-sm mb-1">Talk to an enterprise specialist.</p>
                    <a href="tel:+15551234567" className="text-blue-600 font-medium hover:underline">+1 (555) 123-4567</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tell us how we can help..."></textarea>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer Banner */}
      <div className="bg-slate-900 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to document your org in minutes?</h2>
          <p className="text-blue-200 text-lg mb-10">Join 500+ engineering teams using DocBot to maintain sanity in their Salesforce metadata.</p>
          <button
            onClick={() => setView('SIGNUP')}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50"
          >
            Get Started for Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 text-white">
              <div className="w-6 h-6 bg-blue-600 rounded text-white flex items-center justify-center font-bold text-xs">SD</div>
              <span className="font-semibold">DocBot</span>
            </div>
            <p className="text-sm">The AI-powered documentation assistant for Salesforce professionals.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Enterprise</a></li>
              <li><a href="#" className="hover:text-white">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Documentation</a></li>
              <li><a href="#" className="hover:text-white">API Reference</a></li>
              <li><a href="#" className="hover:text-white">Community</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Legal</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2024 DocBot Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, color, title, description }: { icon: any, color: string, title: string, description: string }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600',
  };

  return (
    <Card hoverEffect className="p-8 group">
      <motion.div
        className={`w - 12 h - 12 rounded - xl flex items - center justify - center mb - 6 ${colorClasses[color]} `}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">
        {description}
      </p>
    </Card>
  );
};

const FaqItem = ({ question, answer, isOpen, toggle }: { question: string, answer: string, isOpen: boolean, toggle: () => void }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left font-medium text-slate-800 hover:bg-slate-50 transition-colors"
      >
        {question}
        {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-0 text-slate-600 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
