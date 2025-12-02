import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, Workflow, GraduationCap, CheckCircle, ChevronDown, Search, Upload, Trash2, BookOpen, MessageSquare } from 'lucide-react';
import { Org, Tab, User, SystemRole, UserRole } from '../types';
import Visualizer from './Visualizer';
import { getArticles, searchArticles, uploadArticle, deleteArticle, OnboardingArticle } from '../services/onboardingService';
import { Button, Input, Modal } from './ui';

interface GTMWorkspaceProps {
    activeOrg: Org | null;
    role: 'GTM' | 'SALES';
    setActiveTab: (tab: Tab) => void;
    onGenerateDoc: (role: 'GTM' | 'SALES', specificRole?: string, processName?: string) => void;
    isGeneratingDoc: boolean;
    docContent: string;
    currentUser: User | null;
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
    docContent,
    currentUser
}) => {
    const [selectedRole, setSelectedRole] = useState<string>(SPECIFIC_ROLES[0]);
    const [selectedProcess, setSelectedProcess] = useState<string>(PROCESSES[0]);

    // Onboarding State
    const [articles, setArticles] = useState<OnboardingArticle[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newArticle, setNewArticle] = useState({ title: '', category: 'Process', content: '', tags: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const canManageContent = currentUser && (currentUser.systemRole === SystemRole.ADMIN || currentUser.role === UserRole.GTM);

    useEffect(() => {
        if (role === 'SALES') {
            loadArticles();
        }
    }, [role]);

    const loadArticles = async () => {
        const data = await getArticles();
        setArticles(data);
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            const results = await searchArticles(query);
            setArticles(results);
        } else {
            loadArticles();
        }
    };

    const handleUpload = async () => {
        if (!currentUser) return;
        setIsUploading(true);
        setUploadError(null);
        try {
            await uploadArticle({
                title: newArticle.title,
                category: newArticle.category as any,
                content: newArticle.content,
                tags: newArticle.tags.split(',').map(t => t.trim()),
                author: currentUser.name
            }, currentUser);
            setShowUploadModal(false);
            setNewArticle({ title: '', category: 'Process', content: '', tags: '' });
            loadArticles();
        } catch (err: any) {
            setUploadError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!currentUser) return;
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            await deleteArticle(id, currentUser);
            loadArticles();
        } catch (err: any) {
            alert(err.message);
        }
    };

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
                        <div className="space-y-6">
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

                            {/* Onboarding Knowledge Base */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold flex items-center gap-2"><BookOpen size={16} /> Onboarding Knowledge</h3>
                                    {canManageContent && (
                                        <button
                                            onClick={() => setShowUploadModal(true)}
                                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1 font-medium"
                                        >
                                            <Upload size={12} /> Upload
                                        </button>
                                    )}
                                </div>

                                <div className="relative mb-4">
                                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search guides, scripts, playbooks..."
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {articles.map(article => (
                                        <div key={article.id} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-sm font-medium text-slate-800">{article.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{article.content}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{article.category}</span>
                                                        {article.tags.map(tag => (
                                                            <span key={tag} className="text-[10px] text-slate-400">#{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {canManageContent && (
                                                    <button
                                                        onClick={() => handleDelete(article.id)}
                                                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {articles.length === 0 && (
                                        <div className="text-center py-8 text-slate-400 text-sm">
                                            No articles found.
                                        </div>
                                    )}
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
            <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Onboarding Content">
                <div className="space-y-4">
                    {uploadError && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {uploadError}
                        </div>
                    )}
                    <Input
                        label="Title"
                        value={newArticle.title}
                        onChange={(e: any) => setNewArticle({ ...newArticle, title: e.target.value })}
                        placeholder="e.g. Sales Playbook Q4"
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select
                            className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newArticle.category}
                            onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                        >
                            <option value="Process">Process</option>
                            <option value="Product">Product</option>
                            <option value="Sales Skills">Sales Skills</option>
                            <option value="Tools">Tools</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Content / Description</label>
                        <textarea
                            className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                            value={newArticle.content}
                            onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                            placeholder="Enter the content or a brief description..."
                        />
                    </div>
                    <Input
                        label="Tags (comma separated)"
                        value={newArticle.tags}
                        onChange={(e: any) => setNewArticle({ ...newArticle, tags: e.target.value })}
                        placeholder="e.g. sales, playbook, q4"
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                        <Button onClick={handleUpload} isLoading={isUploading}>Upload Article</Button>
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default GTMWorkspace;
