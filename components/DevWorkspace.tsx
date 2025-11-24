import React, { useState } from 'react';
import { Bot, RefreshCw, FileText, Code2, Component, Sparkles, BookOpen, Database, Workflow, ShieldCheck } from 'lucide-react';
import { Org, Tab } from '../types';

interface DevWorkspaceProps {
    activeOrg: Org | null;
    setActiveTab: (tab: Tab) => void;
    onGenerateDoc: () => void;
    setChatInitialInput: (input: string) => void;
    isGeneratingDoc: boolean;
    docContent: string;
}

const DevWorkspace: React.FC<DevWorkspaceProps> = ({
    activeOrg,
    setActiveTab,
    onGenerateDoc,
    setChatInitialInput,
    isGeneratingDoc,
    docContent
}) => {
    const [selectedDevItems, setSelectedDevItems] = useState<Set<string>>(new Set());

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedDevItems);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedDevItems(newSet);
    };

    const getSelectedNames = () => {
        if (!activeOrg?.metadataSummary) return [];
        const selectedNames: string[] = [];

        // Apex Classes
        activeOrg.metadataSummary.apexClasses.forEach((a: any) => {
            if (selectedDevItems.has(`apex_${a.name}`)) selectedNames.push(`Apex Class: ${a.name}`);
        });

        // Triggers
        activeOrg.metadataSummary.triggers.forEach((t: any) => {
            if (selectedDevItems.has(`trigger_${t.name}`)) selectedNames.push(`Trigger: ${t.name}`);
        });

        // Components (LWC & Aura)
        activeOrg.metadataSummary.components.forEach((c: any) => {
            if (selectedDevItems.has(`component_${c.name}`)) selectedNames.push(`Component: ${c.name}`);
        });

        // Flows
        activeOrg.metadataSummary.flows.forEach((f: any) => {
            if (selectedDevItems.has(`flow_${f.name}`)) selectedNames.push(`Flow: ${f.label || f.name}`);
        });

        // Validation Rules
        activeOrg.metadataSummary.validationRules.forEach((v: any) => {
            if (selectedDevItems.has(`validation_${v.name}`)) selectedNames.push(`Validation Rule: ${v.name} (${v.object})`);
        });

        // Custom Objects
        activeOrg.metadataSummary.objects.forEach((o: any) => {
            if (selectedDevItems.has(`object_${o.name}`)) selectedNames.push(`Object: ${o.label || o.name}`);
        });

        return selectedNames;
    };

    const handleAskAI = () => {
        const selectedNames = getSelectedNames();
        if (selectedNames.length > 0) {
            setChatInitialInput(`I have questions about the following items:\n- ${selectedNames.join('\n- ')}\n\nCan you explain how they work?`);
            setActiveTab(Tab.CHAT);
            setSelectedDevItems(new Set());
        }
    };

    const handleEnhance = () => {
        const selectedNames = getSelectedNames();
        if (selectedNames.length > 0) {
            setChatInitialInput(`Please analyze the following components and suggest enhancements based on Salesforce best practices:\n- ${selectedNames.join('\n- ')}`);
            setActiveTab(Tab.CHAT);
            setSelectedDevItems(new Set());
        }
    };

    const handleDocumentSelection = () => {
        const selectedNames = getSelectedNames();
        if (selectedNames.length > 0) {
            setChatInitialInput(`Please generate detailed technical documentation for the following components:\n- ${selectedNames.join('\n- ')}`);
            setActiveTab(Tab.CHAT);
            setSelectedDevItems(new Set());
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border rounded-lg shadow-sm"><Code2 className="text-slate-700" size={24} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Developer Workspace</h2>
                        <p className="text-slate-500 text-sm">AI-powered workspace tailored for dev roles.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {selectedDevItems.size > 0 && (
                        <>
                            <button
                                onClick={handleEnhance}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2 animate-in fade-in zoom-in duration-200"
                            >
                                <Sparkles size={16} />
                                Enhance
                            </button>
                            <button
                                onClick={handleDocumentSelection}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2 animate-in fade-in zoom-in duration-200"
                            >
                                <BookOpen size={16} />
                                Document
                            </button>
                            <button
                                onClick={handleAskAI}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2 animate-in fade-in zoom-in duration-200"
                            >
                                <Bot size={16} />
                                Chat
                            </button>
                        </>
                    )}
                    <button
                        onClick={onGenerateDoc}
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
                    {activeOrg?.metadataSummary && (
                        <div className="space-y-4">
                            {/* Apex Classes */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h3 className="font-semibold mb-3 flex items-center gap-2"><Code2 size={16} /> Apex Classes</h3>
                                <div className="space-y-2">
                                    {activeOrg.metadataSummary.apexClasses.map((a: any, i: number) => (
                                        <div key={i} className={`p-3 rounded border text-sm transition-colors flex items-start gap-3 ${selectedDevItems.has(`apex_${a.name}`) ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedDevItems.has(`apex_${a.name}`)}
                                                onChange={() => toggleSelection(`apex_${a.name}`)}
                                                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div>
                                                <div className="font-mono text-blue-700 font-medium">{a.name}</div>
                                                <div className="text-slate-500 text-xs mt-1">v{a.apiVersion} • {a.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {activeOrg.metadataSummary.apexClasses.length === 0 && <div className="text-slate-400 text-sm">No Apex classes found.</div>}
                                </div>
                            </div>

                            {/* Apex Triggers */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h3 className="font-semibold mb-3 flex items-center gap-2"><Code2 size={16} /> Apex Triggers</h3>
                                <div className="space-y-2">
                                    {activeOrg.metadataSummary.triggers.map((t: any, i: number) => (
                                        <div key={i} className={`p-3 rounded border text-sm transition-colors flex items-start gap-3 ${selectedDevItems.has(`trigger_${t.name}`) ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedDevItems.has(`trigger_${t.name}`)}
                                                onChange={() => toggleSelection(`trigger_${t.name}`)}
                                                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div>
                                                <div className="font-mono text-blue-700 font-medium">{t.name}</div>
                                                <div className="text-slate-500 text-xs mt-1">on {t.object} ({t.events.join(', ')})</div>
                                            </div>
                                        </div>
                                    ))}
                                    {activeOrg.metadataSummary.triggers.length === 0 && <div className="text-slate-400 text-sm">No triggers found.</div>}
                                </div>
                            </div>

                            {/* LWC & Aura Components */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h3 className="font-semibold mb-3 flex items-center gap-2"><Component size={16} /> LWC & Aura</h3>
                                <div className="space-y-2">
                                    {activeOrg.metadataSummary.components.map((c: any, i: number) => (
                                        <div key={i} className={`p-3 rounded border text-sm transition-colors flex items-start gap-3 ${selectedDevItems.has(`component_${c.name}`) ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedDevItems.has(`component_${c.name}`)}
                                                onChange={() => toggleSelection(`component_${c.name}`)}
                                                className="mt-1 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <div>
                                                <div className="font-mono text-purple-700 font-medium">{c.name}</div>
                                                <div className="text-slate-500 text-xs mt-1">{c.type} • v{c.apiVersion}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {activeOrg.metadataSummary.components.length === 0 && <div className="text-slate-400 text-sm">No components found.</div>}
                                </div>
                            </div>

                            {/* Flows */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h3 className="font-semibold mb-3 flex items-center gap-2"><Workflow size={16} /> Flows</h3>
                                <div className="space-y-2">
                                    {activeOrg.metadataSummary.flows.map((f: any, i: number) => (
                                        <div key={i} className={`p-3 rounded border text-sm transition-colors flex items-start gap-3 ${selectedDevItems.has(`flow_${f.name}`) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedDevItems.has(`flow_${f.name}`)}
                                                onChange={() => toggleSelection(`flow_${f.name}`)}
                                                className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div>
                                                <div className="font-medium text-indigo-700">{f.label || f.name}</div>
                                                <div className="text-slate-500 text-xs mt-1">{f.type} • {f.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {activeOrg.metadataSummary.flows.length === 0 && <div className="text-slate-400 text-sm">No flows found.</div>}
                                </div>
                            </div>

                            {/* Validation Rules */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h3 className="font-semibold mb-3 flex items-center gap-2"><ShieldCheck size={16} /> Validation Rules</h3>
                                <div className="space-y-2">
                                    {activeOrg.metadataSummary.validationRules.map((v: any, i: number) => (
                                        <div key={i} className={`p-3 rounded border text-sm transition-colors flex items-start gap-3 ${selectedDevItems.has(`validation_${v.name}`) ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedDevItems.has(`validation_${v.name}`)}
                                                onChange={() => toggleSelection(`validation_${v.name}`)}
                                                className="mt-1 rounded border-slate-300 text-red-600 focus:ring-red-500"
                                            />
                                            <div>
                                                <div className="font-medium text-red-700">{v.name}</div>
                                                <div className="text-slate-500 text-xs mt-1">{v.object}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {activeOrg.metadataSummary.validationRules.length === 0 && <div className="text-slate-400 text-sm">No validation rules found.</div>}
                                </div>
                            </div>

                            {/* Custom Objects */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h3 className="font-semibold mb-3 flex items-center gap-2"><Database size={16} /> Custom Objects</h3>
                                <div className="space-y-2">
                                    {activeOrg.metadataSummary.objects.filter((o: any) => o.type === 'Custom').map((o: any, i: number) => (
                                        <div key={i} className={`p-3 rounded border text-sm transition-colors flex items-start gap-3 ${selectedDevItems.has(`object_${o.name}`) ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedDevItems.has(`object_${o.name}`)}
                                                onChange={() => toggleSelection(`object_${o.name}`)}
                                                className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <div>
                                                <div className="font-medium text-emerald-700">{o.label || o.name}</div>
                                                <div className="text-slate-500 text-xs mt-1">{o.fields?.length || 0} fields • {o.recordTypes?.length || 0} record types</div>
                                            </div>
                                        </div>
                                    ))}
                                    {activeOrg.metadataSummary.objects.filter((o: any) => o.type === 'Custom').length === 0 && <div className="text-slate-400 text-sm">No custom objects found.</div>}
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
                                <p>Click "Generate Guide" to create developer documentation.</p>
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

export default DevWorkspace;
