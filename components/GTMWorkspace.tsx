import React, { useState } from 'react';
import { RefreshCw, FileText, Workflow, GraduationCap, CheckCircle, ChevronDown } from 'lucide-react';
import { Org, Tab } from '../types';
import Visualizer from './Visualizer';

interface GTMWorkspaceProps {
    activeOrg: Org | null;
    role: 'GTM' | 'SALES';
    setActiveTab: (tab: Tab) => void;
    onGenerateDoc: (role: 'GTM' | 'SALES', specificRole?: string, processName?: string) => void;
    isGeneratingDoc: boolean;
    docContent: string;
}

const SPECIFIC_ROLES = [
    'BDR',
    'BDM',
    'Salesperson (AE)',
    'Sales Manager',
    'Account Manager',
    'Customer Success',
    'Partner Enablement'
];

const PROCESSES = [
    'Lead Qualification',
    'Opportunity Management',
    'Forecasting',
    'Onboarding',
    'Renewal',
    'Partner Registration',
    'General Overview'
];

const GTMWorkspace: React.FC<GTMWorkspaceProps> = ({
    activeOrg,
    role,
    setActiveTab,
    onGenerateDoc,
    isGeneratingDoc,
    docContent
}) => {
    const [selectedRole, setSelectedRole] = useState<string>(SPECIFIC_ROLES[0]);
    const [selectedProcess, setSelectedProcess] = useState<string>(PROCESSES[0]);

    let Icon;
    switch (role) {
        case 'GTM': Icon = Workflow; break;
        case 'SALES': Icon = GraduationCap; break;
        default: Icon = FileText;
    }

    const title = role === 'GTM' ? 'BA & GTM Hub' : 'Sales Onboarding';

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
                <div className="flex gap-2 items-center">
                    {/* Selectors */}
                    <div className="flex gap-2 mr-2">
                        <div className="relative">
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            >
                                {SPECIFIC_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select
                                value={selectedProcess}
                                onChange={(e) => setSelectedProcess(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            >
                                {PROCESSES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {role === 'GTM' && <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700" onClick={() => setActiveTab(Tab.GTM_HUB)}>Visualize Flows</button>}
                    <button
                        onClick={() => onGenerateDoc(role, selectedRole, selectedProcess)}
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
                    {role === 'GTM' && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <h3 className="font-semibold mb-3 flex items-center gap-2"><Workflow size={16} /> Process Maps</h3>
                            <Visualizer activeOrg={activeOrg} role={selectedRole} process={selectedProcess} />
                        </div>
                    )}
                    {role === 'SALES' && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <h3 className="font-semibold mb-3 flex items-center gap-2"><GraduationCap size={16} /> Enablement Checks</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <CheckCircle size={14} className="text-green-500" />
                                    Lead Validation Rules Analyzed ({activeOrg?.metadataSummary?.validationRules.length || 0})
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <CheckCircle size={14} className="text-green-500" />
                                    Opportunity Stages: {activeOrg?.metadataSummary?.objects.find(o => o.name === 'Opportunity')?.fields.find(f => f.name === 'StageName')?.picklistValues?.join(', ') || 'Standard'}
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
                                <p>Select a Role and Process, then click "Generate Guide".</p>
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

export default GTMWorkspace;
