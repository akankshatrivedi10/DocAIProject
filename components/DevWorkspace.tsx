import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Org, MetadataItem, MetadataType, Tab } from '../types';
import { FileCode, Database, Zap, Layout, Shield, Workflow, Box, MessageSquare, Sparkles, Lightbulb, Search, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getJiraProjects, searchJiraStories, JiraProject, JiraStory } from '../services/jiraService';
import { generateBestPractices } from '../services/bestPracticesService';
import { Button, Card, Input } from './ui';

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
    const [storySearchQuery, setStorySearchQuery] = useState<string>('');

    // Best Practices State
    const [bestPracticesContent, setBestPracticesContent] = useState<string>('');
    const [isGeneratingBestPractices, setIsGeneratingBestPractices] = useState(false);

    useEffect(() => {
        if (isJiraConnected) {
            getJiraProjects().then(setJiraProjects);
        }
    }, [isJiraConnected]);

    // Search stories when project or query changes
    useEffect(() => {
        if (selectedProject) {
            searchJiraStories(selectedProject, storySearchQuery).then(setJiraStories);
        } else {
            setJiraStories([]);
        }
    }, [selectedProject, storySearchQuery]);

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

    const handleBestPractices = async () => {
        if (selectedItems.length === 0) return;

        setIsGeneratingBestPractices(true);
        try {
            const firstItem = selectedItems[0];
            const practices = await generateBestPractices(firstItem.type as MetadataType, firstItem);
            setBestPracticesContent(practices);
        } catch (error) {
            console.error('Failed to generate best practices:', error);
        } finally {
            setIsGeneratingBestPractices(false);
        }
    };

    const handleMetadataChat = () => {
        const metadataContext = selectedItems.map(item =>
            `${item.type}: ${item.name}`
        ).join(', ');
        setChatInitialInput(`I need help with these metadata components: ${metadataContext}`);
        setActiveTab(Tab.CHAT);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Developer Workspace</h2>
                        <p className="text-slate-500 text-sm">Generate technical documentation and architecture guides.</p>
                    </div>
                </div>

                {/* Three Core Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleGenerateClick}
                        disabled={isGeneratingDoc || selectedItems.length === 0}
                        isLoading={isGeneratingDoc}
                        className="w-full"
                    >
                        {!isGeneratingDoc && <FileCode size={20} />}
                        Generate Technical Documentation
                    </Button>

                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={handleBestPractices}
                        disabled={isGeneratingBestPractices || selectedItems.length === 0}
                        isLoading={isGeneratingBestPractices}
                        className="w-full"
                    >
                        {!isGeneratingBestPractices && <Lightbulb size={20} />}
                        Best Practices Guidance
                    </Button>

                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={handleMetadataChat}
                        disabled={selectedItems.length === 0}
                        className="w-full border-2 border-slate-300 hover:border-slate-400"
                    >
                        <MessageSquare size={20} />
                        Metadata Chat Assistant
                    </Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Left Panel: Selected Context */}
                <div className="space-y-6 overflow-y-auto pr-2">

                    {/* Jira Context Section */}
                    <Card className="p-4 overflow-visible">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jira Story Context</h3>
                            {isJiraConnected && (
                                <motion.span
                                    className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    Connected
                                </motion.span>
                            )}
                        </div>

                        {isJiraConnected ? (
                            <div className="space-y-4">
                                {/* Project Selector */}
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

                                {/* Story Search & List */}
                                <div className="relative">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Search Stories</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder={selectedProject ? "Search by key or title..." : "Select a project first"}
                                            value={storySearchQuery}
                                            onChange={(e) => setStorySearchQuery(e.target.value)}
                                            disabled={!selectedProject}
                                        />
                                    </div>

                                    {/* Story Results Dropdown */}
                                    {selectedProject && storySearchQuery && !selectedStoryId && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                            {jiraStories.length > 0 ? (
                                                jiraStories.map(story => (
                                                    <div
                                                        key={story.id}
                                                        className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors cursor-pointer"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault(); // Prevent focus loss
                                                            setSelectedStoryId(story.id);
                                                            setStorySearchQuery('');
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-semibold text-slate-700 text-sm">{story.key}</span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${story.status === 'Done' ? 'bg-green-100 text-green-700' :
                                                                story.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {story.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 line-clamp-1">{story.title}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-3 text-xs text-slate-500 text-center">No stories found</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Story Preview */}
                                <AnimatePresence>
                                    {selectedStoryDetails && (
                                        <motion.div
                                            className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden group"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>

                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-blue-600 text-sm">{selectedStoryDetails.key}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${selectedStoryDetails.status === 'Done' ? 'bg-green-100 text-green-700' :
                                                            selectedStoryDetails.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-slate-100 text-slate-600'
                                                            }`}>
                                                            {selectedStoryDetails.status}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStoryId('');
                                                            setSelectedStoryDetails(null);
                                                        }}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>

                                                <h4 className="font-semibold text-slate-800 text-sm mb-2">{selectedStoryDetails.title}</h4>
                                                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                    {selectedStoryDetails.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                    </Card>

                    {/* Selected Metadata Section */}
                    <Card className="p-4">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Selected Metadata</h3>
                        {selectedItems.length === 0 ? (
                            <motion.div
                                className="text-center py-8 text-slate-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Database size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No items selected.</p>
                                <p className="text-xs mt-1">Select components from the Metadata Explorer.</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(groupedItems).map(([type, items]) => (
                                    <motion.div
                                        key={type}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h4 className="text-xs font-medium text-slate-400 mb-2 pl-1">{type}</h4>
                                        <div className="space-y-2">
                                            {items.map(item => (
                                                <motion.div
                                                    key={item.id}
                                                    className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100"
                                                    whileHover={{ x: 2, backgroundColor: '#f1f5f9' }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                >
                                                    {getIconForType(item.type as MetadataType)}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                                                        <p className="text-xs text-slate-500 truncate">{item.lastModifiedDate}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Panel: Generated Content */}
                <Card className="flex flex-col min-h-0">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                        <h3 className="font-medium text-slate-700 flex items-center gap-2">
                            <FileCode size={18} className="text-blue-500" />
                            Generated Documentation
                        </h3>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto prose prose-slate max-w-none">
                        <AnimatePresence mode="wait">
                            {docContent ? (
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ReactMarkdown>{docContent}</ReactMarkdown>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    className="h-full flex flex-col items-center justify-center text-slate-400"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Sparkles size={48} className="mb-4 text-slate-200 animate-float" />
                                    <p>Select metadata and click Generate Guide</p>
                                    <p className="text-sm mt-2">AI will analyze dependencies and create technical docs.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DevWorkspace;
