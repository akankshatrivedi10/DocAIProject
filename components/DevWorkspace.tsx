import React from 'react';
import { Bot, RefreshCw, FileText, Code2, Component, Sparkles, BookOpen, Database, Workflow, ShieldCheck } from 'lucide-react';
import { Org, Tab } from '../types';

interface DevWorkspaceProps {
    activeOrg: Org | null;
    setActiveTab: (tab: Tab) => void;
    onGenerateDoc: () => void;
    setChatInitialInput: (input: string) => void;
    isGeneratingDoc: boolean;
    docContent: string;
    selectedItems: Set<string>;
}

const DevWorkspace: React.FC<DevWorkspaceProps> = ({
    activeOrg,
    setActiveTab,
    onGenerateDoc,
    setChatInitialInput,
    isGeneratingDoc,
    docContent,
    selectedItems
}) => {
    const groupedItems = React.useMemo(() => {
        const groups = {
            objects: [] as string[],
            apex: [] as string[],
            triggers: [] as string[],
            flows: [] as string[],
            components: [] as string[],
            validations: [] as string[],
            profiles: [] as string[]
        };

        selectedItems.forEach(id => {
            const [type, ...nameParts] = id.split('-');
            const name = nameParts.join('-');
            if (type === 'object') groups.objects.push(name);
            else if (type === 'apex') groups.apex.push(name);
            else if (type === 'trigger') groups.triggers.push(name);
            else if (type === 'flow') groups.flows.push(name);
            else if (type === 'component') groups.components.push(name);
            else if (type === 'validation') groups.validations.push(name);
            else if (type === 'profile') groups.profiles.push(name);
        });

        return groups;
    }, [selectedItems]);

    const getSelectedNames = () => {
        const names: string[] = [];
        selectedItems.forEach(id => {
            const [type, ...nameParts] = id.split('-');
            const name = nameParts.join('-');

            if (type === 'object') names.push(`Object: ${name}`);
            else if (type === 'apex') names.push(`Apex Class: ${name}`);
            else if (type === 'trigger') names.push(`Trigger: ${name}`);
            else if (type === 'flow') names.push(`Flow: ${name}`);
            else if (type === 'component') names.push(`Component: ${name}`);
            else if (type === 'validation') names.push(`Validation Rule: ${name}`);
            else if (type === 'profile') names.push(`Profile: ${name}`);
        });
        return names;
    };

    const handleAskAI = () => {
        const names = getSelectedNames();
        if (names.length > 0) {
            setChatInitialInput(`I have questions about the following items:\n- ${names.join('\n- ')}\n\nCan you explain how they work?`);
            setActiveTab(Tab.CHAT);
        }
    };

    const handleEnhance = () => {
        const names = getSelectedNames();
        if (names.length > 0) {
            setChatInitialInput(`Please analyze the following components and suggest enhancements based on Salesforce best practices:\n- ${names.join('\n- ')}`);
            setActiveTab(Tab.CHAT);
        }
    };

    const handleDocumentSelection = () => {
        const names = getSelectedNames();
        if (names.length > 0) {
            setChatInitialInput(`Please generate detailed technical documentation for the following components:\n- ${names.join('\n- ')}`);
            setActiveTab(Tab.CHAT);
        }
    };

    const renderGroup = (title: string, items: string[], icon: React.ElementType, color: string) => {
        if (items.length === 0) return null;
        return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-3">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    {React.createElement(icon, { size: 16, className: `text-${color}-600` })}
                    <h3 className="font-semibold text-sm text-slate-700">{title}</h3>
                    <span className="text-xs bg-white border border-slate-200 px-1.5 rounded text-slate-500">{items.length}</span>
                </div>
                <div className="p-2 space-y-1">
                    {items.map((item, i) => (
                        <div key={i} className="px-3 py-2 text-sm text-slate-600 bg-white border border-slate-100 rounded hover:border-blue-300 transition-colors">
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border rounded-lg shadow-sm"><Code2 className="text-slate-700" size={24} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Developer Workspace</h2>
                        <p className="text-slate-500 text-sm">AI-powered workspace for selected metadata.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {selectedItems.size > 0 && (
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
                {/* Left Panel: Selected Context */}
                <div className="space-y-6 overflow-y-auto pr-2">
                    {selectedItems.size === 0 ? (
                        <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                            <Database className="mx-auto text-slate-300 mb-3" size={32} />
                            <p className="text-slate-500 font-medium">No metadata selected</p>
                            <p className="text-slate-400 text-sm mt-1">Go to Metadata Explorer to select items for analysis.</p>
                            <button
                                onClick={() => setActiveTab(Tab.METADATA)}
                                className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
                            >
                                Go to Explorer
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Selected Context</h3>
                            {renderGroup('Objects', groupedItems.objects, Database, 'emerald')}
                            {renderGroup('Apex Classes', groupedItems.apex, Code2, 'blue')}
                            {renderGroup('Triggers', groupedItems.triggers, Code2, 'blue')}
                            {renderGroup('Flows', groupedItems.flows, Workflow, 'indigo')}
                            {renderGroup('Components', groupedItems.components, Component, 'purple')}
                            {renderGroup('Validation Rules', groupedItems.validations, ShieldCheck, 'red')}
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
                                <p>Click "Generate Guide" or use the action buttons above.</p>
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
