import React, { useState } from 'react';
import { Database, Code2, Workflow, ShieldCheck, Component, Shield, RefreshCw } from 'lucide-react';
import { Org } from '../types';

interface MetadataExplorerProps {
    activeOrg: Org | null;
}

const MetadataExplorer: React.FC<MetadataExplorerProps> = ({ activeOrg }) => {
    const [activeMetadataTab, setActiveMetadataTab] = useState<'OBJECTS' | 'APEX' | 'TRIGGERS' | 'FLOWS' | 'VALIDATIONS' | 'COMPONENTS' | 'PROFILES'>('OBJECTS');

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Metadata Explorer</h2>
                <p className="text-slate-500 text-sm">Raw metadata viewer. Select an org to view index.</p>
            </div>

            {!activeOrg ? (
                <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400">Select a connected org</div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-4 text-sm font-medium text-slate-600 overflow-x-auto whitespace-nowrap">
                        <button
                            onClick={() => setActiveMetadataTab('OBJECTS')}
                            className={`px-3 py-1 rounded border flex items-center gap-2 transition-colors ${activeMetadataTab === 'OBJECTS' ? 'bg-white border-slate-200 shadow-sm text-blue-600' : 'border-transparent hover:bg-slate-200'}`}>
                            <Database size={14} /> Objects ({activeOrg.metadataSummary?.objects.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveMetadataTab('APEX')}
                            className={`px-3 py-1 rounded border flex items-center gap-2 transition-colors ${activeMetadataTab === 'APEX' ? 'bg-white border-slate-200 shadow-sm text-blue-600' : 'border-transparent hover:bg-slate-200'}`}>
                            <Code2 size={14} /> Apex ({activeOrg.metadataSummary?.apexClasses.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveMetadataTab('TRIGGERS')}
                            className={`px-3 py-1 rounded border flex items-center gap-2 transition-colors ${activeMetadataTab === 'TRIGGERS' ? 'bg-white border-slate-200 shadow-sm text-blue-600' : 'border-transparent hover:bg-slate-200'}`}>
                            <Code2 size={14} /> Triggers ({activeOrg.metadataSummary?.triggers.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveMetadataTab('FLOWS')}
                            className={`px-3 py-1 rounded border flex items-center gap-2 transition-colors ${activeMetadataTab === 'FLOWS' ? 'bg-white border-slate-200 shadow-sm text-blue-600' : 'border-transparent hover:bg-slate-200'}`}>
                            <Workflow size={14} /> Flows ({activeOrg.metadataSummary?.flows.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveMetadataTab('VALIDATIONS')}
                            className={`px-3 py-1 rounded border flex items-center gap-2 transition-colors ${activeMetadataTab === 'VALIDATIONS' ? 'bg-white border-slate-200 shadow-sm text-blue-600' : 'border-transparent hover:bg-slate-200'}`}>
                            <ShieldCheck size={14} /> Validations ({activeOrg.metadataSummary?.validationRules.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveMetadataTab('COMPONENTS')}
                            className={`px-3 py-1 rounded border flex items-center gap-2 transition-colors ${activeMetadataTab === 'COMPONENTS' ? 'bg-white border-slate-200 shadow-sm text-blue-600' : 'border-transparent hover:bg-slate-200'}`}>
                            <Component size={14} /> Components ({activeOrg.metadataSummary?.components.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveMetadataTab('PROFILES')}
                            className={`px-3 py-1 rounded border flex items-center gap-2 transition-colors ${activeMetadataTab === 'PROFILES' ? 'bg-white border-slate-200 shadow-sm text-blue-600' : 'border-transparent hover:bg-slate-200'}`}>
                            <Shield size={14} /> Profiles ({activeOrg.metadataSummary?.profiles.length || 0})
                        </button>
                    </div>

                    <div className="p-0 overflow-y-auto flex-1 bg-slate-50/30">
                        {activeOrg.syncState.isSyncing && !activeOrg.metadataSummary ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <RefreshCw size={32} className="animate-spin text-blue-500 mb-4" />
                                <p className="font-medium">Syncing Metadata...</p>
                                <p className="text-sm text-slate-400 mt-1">{activeOrg.syncState.progress}% Complete</p>
                            </div>
                        ) : (
                            <>
                                {activeMetadataTab === 'OBJECTS' && (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                            <tr>
                                                <th className="p-4">Name</th>
                                                <th className="p-4">Type</th>
                                                <th className="p-4">Record Types</th>
                                                <th className="p-4">Fields</th>
                                                <th className="p-4">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {activeOrg.metadataSummary?.objects.map((obj: any, i: number) => (
                                                <tr key={i} className="hover:bg-white">
                                                    <td className="p-4 font-medium text-slate-700">
                                                        {obj.label}
                                                        <span className="block text-xs text-slate-400 font-mono mt-0.5">{obj.name}</span>
                                                    </td>
                                                    <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${obj.type === 'Standard' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{obj.type}</span></td>
                                                    <td className="p-4 text-slate-500">{obj.recordTypes?.length || 0}</td>
                                                    <td className="p-4 text-slate-500">{obj.fields?.length || 0}</td>
                                                    <td className="p-4"><button className="text-blue-600 hover:underline">View JSON</button></td>
                                                </tr>
                                            ))}
                                            {(!activeOrg.metadataSummary?.objects || activeOrg.metadataSummary.objects.length === 0) && (
                                                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No objects found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}

                                {activeMetadataTab === 'APEX' && (
                                    <div className="divide-y divide-slate-100">
                                        {activeOrg.metadataSummary?.apexClasses.map((cls: any, i: number) => (
                                            <div key={i} className="p-4 hover:bg-white flex justify-between items-center">
                                                <div>
                                                    <div className="font-mono text-blue-700 font-medium">{cls.name}</div>
                                                    <div className="text-xs text-slate-500 mt-1">v{cls.apiVersion} • {cls.status}</div>
                                                </div>
                                                <div className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Class</div>
                                            </div>
                                        ))}
                                        {(!activeOrg.metadataSummary?.apexClasses || activeOrg.metadataSummary.apexClasses.length === 0) && <div className="p-8 text-center text-slate-400">No Apex classes found.</div>}
                                    </div>
                                )}

                                {activeMetadataTab === 'TRIGGERS' && (
                                    <div className="divide-y divide-slate-100">
                                        {activeOrg.metadataSummary?.triggers.map((trig: any, i: number) => (
                                            <div key={i} className="p-4 hover:bg-white flex justify-between items-center">
                                                <div>
                                                    <div className="font-mono text-blue-700 font-medium">{trig.name}</div>
                                                    <div className="text-xs text-slate-500 mt-1">on {trig.object}</div>
                                                </div>
                                                <div className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Trigger</div>
                                            </div>
                                        ))}
                                        {(!activeOrg.metadataSummary?.triggers || activeOrg.metadataSummary.triggers.length === 0) && <div className="p-8 text-center text-slate-400">No Apex triggers found.</div>}
                                    </div>
                                )}

                                {activeMetadataTab === 'FLOWS' && (
                                    <div className="divide-y divide-slate-100">
                                        {activeOrg.metadataSummary?.flows.map((flow: any, i: number) => (
                                            <div key={i} className="p-4 hover:bg-white flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium text-slate-700">{flow.label}</div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">{flow.name}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${flow.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{flow.status}</span>
                                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{flow.type}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!activeOrg.metadataSummary?.flows || activeOrg.metadataSummary.flows.length === 0) && <div className="p-8 text-center text-slate-400">No flows found.</div>}
                                    </div>
                                )}

                                {activeMetadataTab === 'VALIDATIONS' && (
                                    <div className="divide-y divide-slate-100">
                                        {activeOrg.metadataSummary?.validationRules.map((rule: any, i: number) => (
                                            <div key={i} className="p-4 hover:bg-white">
                                                <div className="flex justify-between mb-1">
                                                    <div className="font-medium text-slate-700">{rule.name}</div>
                                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{rule.object}</span>
                                                </div>
                                                <div className="text-xs text-red-500 font-mono bg-red-50 p-2 rounded border border-red-100">
                                                    {rule.errorMessage || "No error message defined"}
                                                </div>
                                            </div>
                                        ))}
                                        {(!activeOrg.metadataSummary?.validationRules || activeOrg.metadataSummary.validationRules.length === 0) && <div className="p-8 text-center text-slate-400">No validation rules found.</div>}
                                    </div>
                                )}

                                {activeMetadataTab === 'COMPONENTS' && (
                                    <div className="divide-y divide-slate-100">
                                        {activeOrg.metadataSummary?.components.map((cmp: any, i: number) => (
                                            <div key={i} className="p-4 hover:bg-white flex justify-between items-center">
                                                <div>
                                                    <div className="font-mono text-purple-700 font-medium">{cmp.name}</div>
                                                    <div className="text-xs text-slate-500 mt-1">{cmp.description || 'No description'}</div>
                                                </div>
                                                <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">{cmp.type}</div>
                                            </div>
                                        ))}
                                        {(!activeOrg.metadataSummary?.components || activeOrg.metadataSummary.components.length === 0) && <div className="p-8 text-center text-slate-400">No components found.</div>}
                                    </div>
                                )}

                                {activeMetadataTab === 'PROFILES' && (
                                    <div className="divide-y divide-slate-100">
                                        {activeOrg.metadataSummary?.profiles.map((prof: any, i: number) => (
                                            <div key={i} className="p-4 hover:bg-white flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium text-slate-700">{prof.name}</div>
                                                    <div className="text-xs text-slate-500 mt-1">{prof.userLicense}</div>
                                                </div>
                                                <div className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{prof.custom ? 'Custom' : 'Standard'}</div>
                                            </div>
                                        ))}
                                        {(!activeOrg.metadataSummary?.profiles || activeOrg.metadataSummary.profiles.length === 0) && <div className="p-8 text-center text-slate-400">No profiles found.</div>}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetadataExplorer;
