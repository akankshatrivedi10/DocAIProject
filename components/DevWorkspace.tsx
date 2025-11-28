import React, { useEffect, useState } from 'react';
import { Org, MetadataItem, MetadataType, Tab } from '../types';
import { FileCode, Database, Zap, Layout, Shield, Workflow, Box, MessageSquare, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getJiraProjects, getJiraStories, JiraProject, JiraStory } from '../services/jiraService';

interface DevWorkspaceProps {
    activeOrg: Org | null;
    setActiveTab: (tab: Tab) => void;
    onGenerateDoc: (story?: string) => void;
    setChatInitialInput: (input: string) => void;
    isGeneratingDoc: boolean;
    docContent: string;
    selectedItems: MetadataItem[];
    isJiraConnected?: boolean;
}

const DevWorkspace: React.FC<DevWorkspaceProps> = ({
    activeOrg,
    setActiveTab,
    onGenerateDoc,
    setChatInitialInput,
    isGeneratingDoc,
    docContent,
    selectedItems,
    isJiraConnected = false
}) => {
    const [jiraStoryInput, setJiraStoryInput] = useState('');

    // Jira Selection State
    const [jiraProjects, setJiraProjects] = useState<JiraProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [jiraStories, setJiraStories] = useState<JiraStory[]>([]);
    const [selectedStoryId, setSelectedStoryId] = useState<string>('');
    const [selectedStoryDetails, setSelectedStoryDetails] = useState<JiraStory | null>(null);

    useEffect(() => {
        if (isJiraConnected) {
            getJiraProjects().then(setJiraProjects);
        }
    }, [isJiraConnected]);

    useEffect(() => {
        if (selectedProject) {
            getJiraStories(selectedProject).then(setJiraStories);
        } else {
            setJiraStories([]);
        }
    }, [selectedProject]);

    useEffect(() => {
        if (selectedStoryId) {
            const story = jiraStories.find(s => s.id === selectedStoryId);
            setSelectedStoryDetails(story || null);
        } else {
            setSelectedStoryDetails(null);
        }
    }, [selectedStoryId, jiraStories]);

    const getIconForType = (type: MetadataType) => {
        switch (type) {
            case MetadataType.APEX_CLASS: return <FileCode size={16} className="text-blue-600" />;
            case MetadataType.FLOW: return <Workflow size={16} className="text-purple-600" />;
            case MetadataType.OBJECT: return <Database size={16} className="text-emerald-600" />;
            case MetadataType.TRIGGER: return <Zap size={16} className="text-orange-600" />;
            case MetadataType.LAYOUT: return <Layout size={16} className="text-indigo-600" />;
            case MetadataType.PERMISSION_SET: return <Shield size={16} className="text-red-600" />;
            default: return <Box size={16} className="text-slate-600" />;
        }
    };

    const groupedItems = selectedItems.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, {} as Record<MetadataType, MetadataItem[]>);

    const handleGenerateClick = () => {
        if (isJiraConnected && selectedStoryDetails) {
            // Format the story details into a context string
            const context = `
Story ID: ${selectedStoryDetails.key}
Title: ${selectedStoryDetails.title}
Description: ${selectedStoryDetails.description}
Acceptance Criteria: ${selectedStoryDetails.acceptanceCriteria}
Status: ${selectedStoryDetails.status}
Epic: ${selectedStoryDetails.epic || 'None'}
            `.trim();
            onGenerateDoc(context);
        } else {
            onGenerateDoc(jiraStoryInput);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Developer Workspace</h2>
                    <p className="text-slate-500 text-sm">Generate technical documentation and architecture guides.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setChatInitialInput("Analyze this component structure")}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <MessageSquare size={18} />
                        Chat
                    </button>
                    <button
                        onClick={handleGenerateClick}
                        disabled={isGeneratingDoc || selectedItems.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {isGeneratingDoc ? <span className="animate-spin">⏳</span> : <Sparkles size={18} />}
                        Generate Guide
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Left Panel: Selected Context */}
                <div className="space-y-6 overflow-y-auto pr-2">

                    {/* Jira Context Section */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jira Story Context</h3>
                            {isJiraConnected && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Connected</span>}
                        </div>

                        {isJiraConnected ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Project</label>
                                        <select
                                            className="w-full text-sm border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={selectedProject}
                                            onChange={(e) => setSelectedProject(e.target.value)}
                                        >
                                            <option value="">Select Project...</option>
                                            {jiraProjects.map(p => <option key={p.key} value={p.key}>{p.name} ({p.key})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Story</label>
                                        <select
                                            className="w-full text-sm border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={selectedStoryId}
                                            onChange={(e) => setSelectedStoryId(e.target.value)}
                                            disabled={!selectedProject}
                                        >
                                            <option value="">Select Story...</option>
                                            {jiraStories.map(s => <option key={s.id} value={s.id}>{s.key}: {s.title}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {selectedStoryDetails && (
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                                        <p className="font-medium text-slate-800">{selectedStoryDetails.title}</p>
                                        <p className="text-slate-500 mt-1 line-clamp-2">{selectedStoryDetails.description}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <textarea
                                className="w-full text-sm border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                rows={3}
                                placeholder="Paste Jira story or additional context here..."
                                value={jiraStoryInput}
                                onChange={(e) => setJiraStoryInput(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Selected Metadata Section */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Selected Metadata</h3>
                        {selectedItems.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <Database size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No items selected.</p>
                                <p className="text-xs mt-1">Select components from the Metadata Explorer.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(groupedItems).map(([type, items]) => (
                                    <div key={type}>
                                        <h4 className="text-xs font-medium text-slate-400 mb-2 pl-1">{type}</h4>
                                        <div className="space-y-2">
                                            {items.map(item => (
                                                <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                    {getIconForType(item.type as MetadataType)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                                                        <p className="text-xs text-slate-500 truncate">{item.lastModifiedDate}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Generated Content */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-0">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                        <h3 className="font-medium text-slate-700 flex items-center gap-2">
                            <FileCode size={18} className="text-blue-500" />
                            Generated Documentation
                        </h3>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto prose prose-slate max-w-none">
                        {docContent ? (
                            <ReactMarkdown>{docContent}</ReactMarkdown>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Sparkles size={48} className="mb-4 text-slate-200" />
                                <p>Select metadata and click Generate Guide</p>
                                <p className="text-sm mt-2">AI will analyze dependencies and create technical docs.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevWorkspace;
