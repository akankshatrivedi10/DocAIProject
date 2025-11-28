import React, { useState, useMemo } from 'react';
import {
    Database,
    Code2,
    Workflow,
    ShieldCheck,
    Component,
    Shield,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    Search,
    FileCode,
    Layers,
    Globe,
    X,
    Eye,
    GitBranch,
    CheckSquare,
    Square
} from 'lucide-react';
import { Org, MetadataSummary, MetadataItem } from '../types';

interface MetadataExplorerProps {
    activeOrg: Org | null;
    selectedItems: Set<string>;
    onSelectionChange: (items: Set<string>) => void;
}

type ViewMode = 'object-centric' | 'component-centric';


const MetadataExplorer: React.FC<MetadataExplorerProps> = ({ activeOrg, selectedItems, onSelectionChange }) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [selectedItem, setSelectedItem] = useState<MetadataItem | null>(null);
    // Removed local selectedItems state
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('object-centric');

    // Organize metadata into the four-level categorization
    const organizedMetadata = useMemo(() => {
        if (!activeOrg?.metadataSummary) return null;

        const categories = {
            'standard-objects': [] as MetadataItem[],
            'custom-objects': [] as MetadataItem[],
            'system-components': [] as MetadataItem[],
            'global-metadata': [] as MetadataItem[]
        };

        // Process Objects
        activeOrg.metadataSummary.objects.forEach((obj: any) => {
            const category = obj.type === 'Custom' ? 'custom-objects' : 'standard-objects';
            const children: MetadataItem[] = [];

            // Add triggers for this object
            const objectTriggers = activeOrg.metadataSummary.triggers.filter((t: any) => t.object === obj.name);
            objectTriggers.forEach((trigger: any) => {
                children.push({
                    id: `trigger-${trigger.name}`,
                    name: trigger.name,
                    label: trigger.name,
                    type: 'Trigger',
                    category: category,
                    metadata: trigger
                });
            });

            // Add validation rules for this object
            const objectValidations = activeOrg.metadataSummary.validationRules.filter((v: any) => v.object === obj.name);
            objectValidations.forEach((validation: any) => {
                children.push({
                    id: `validation-${validation.name}`,
                    name: validation.name,
                    label: validation.name,
                    type: 'Validation Rule',
                    category: category,
                    metadata: validation
                });
            });

            categories[category].push({
                id: `object-${obj.name}`,
                name: obj.name,
                label: obj.label,
                type: 'Object',
                category: category,
                children: children.length > 0 ? children : undefined,
                metadata: obj
            });
        });

        // Process Apex Classes (System Components)
        activeOrg.metadataSummary.apexClasses.forEach((cls: any) => {
            categories['system-components'].push({
                id: `apex-${cls.name}`,
                name: cls.name,
                label: cls.name,
                type: 'Apex Class',
                category: 'system-components',
                metadata: cls
            });
        });

        // Process Flows (System Components)
        activeOrg.metadataSummary.flows.forEach((flow: any) => {
            categories['system-components'].push({
                id: `flow-${flow.name}`,
                name: flow.name,
                label: flow.label,
                type: flow.type,
                category: 'system-components',
                metadata: flow
            });
        });

        // Process LWC/Aura Components (System Components)
        activeOrg.metadataSummary.components.forEach((cmp: any) => {
            categories['system-components'].push({
                id: `component-${cmp.name}`,
                name: cmp.name,
                label: cmp.name,
                type: cmp.type,
                category: 'system-components',
                metadata: cmp
            });
        });

        // Process Profiles (Global Metadata)
        activeOrg.metadataSummary.profiles.forEach((prof: any) => {
            categories['global-metadata'].push({
                id: `profile-${prof.name}`,
                name: prof.name,
                label: prof.name,
                type: 'Profile',
                category: 'global-metadata',
                metadata: prof
            });
        });

        return categories;
    }, [activeOrg]);

    // Flatten all items for search
    const allItems = useMemo(() => {
        if (!organizedMetadata) return [];
        const items: MetadataItem[] = [];

        (Object.values(organizedMetadata) as MetadataItem[][]).forEach(categoryItems => {
            categoryItems.forEach(item => {
                items.push(item);
                if (item.children) {
                    items.push(...item.children);
                }
            });
        });

        return items;
    }, [organizedMetadata]);

    // Filter items based on search
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return organizedMetadata;
        if (!organizedMetadata) return null;

        const query = searchQuery.toLowerCase();
        const filtered = {
            'standard-objects': [] as MetadataItem[],
            'custom-objects': [] as MetadataItem[],
            'system-components': [] as MetadataItem[],
            'global-metadata': [] as MetadataItem[]
        };

        (Object.entries(organizedMetadata) as [string, MetadataItem[]][]).forEach(([category, items]) => {
            items.forEach(item => {
                const matches =
                    item.name.toLowerCase().includes(query) ||
                    item.label.toLowerCase().includes(query) ||
                    item.type.toLowerCase().includes(query);

                if (matches) {
                    filtered[category as keyof typeof filtered].push(item);
                }
            });
        });

        return filtered;
    }, [organizedMetadata, searchQuery]);

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const toggleSelection = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        onSelectionChange(newSelected);
    };

    const toggleCategorySelection = (categoryKey: string) => {
        if (!filteredItems) return;
        const items = filteredItems[categoryKey as keyof typeof filteredItems];
        const allSelected = items.length > 0 && items.every(item => selectedItems.has(item.id));

        const newSelected = new Set(selectedItems);
        items.forEach(item => {
            if (allSelected) {
                newSelected.delete(item.id);
                if (item.children) {
                    item.children.forEach(child => newSelected.delete(child.id));
                }
            } else {
                newSelected.add(item.id);
                if (item.children) {
                    item.children.forEach(child => newSelected.add(child.id));
                }
            }
        });
        onSelectionChange(newSelected);
    };

    const renderCategorySection = (
        categoryKey: 'standard-objects' | 'custom-objects' | 'system-components' | 'global-metadata',
        title: string,
        icon: React.ElementType,
        color: string
    ) => {
        if (!filteredItems) return null;

        const items = filteredItems[categoryKey];
        const isExpanded = expandedSections.has(categoryKey);
        const Icon = icon;

        // Check if all items in this category are selected
        const allSelected = items.length > 0 && items.every(item => selectedItems.has(item.id));
        const someSelected = items.some(item => selectedItems.has(item.id));

        return (
            <div className="border-b border-slate-200 last:border-0">
                <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors group">
                    <div
                        className="flex items-center gap-2 cursor-pointer flex-1"
                        onClick={() => toggleSection(categoryKey)}
                    >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <Icon size={16} className={`text-${color}-600`} />
                        <span className="font-medium text-sm text-slate-800">{title}</span>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                            {items.length}
                        </span>
                    </div>
                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => toggleCategorySelection(categoryKey)}
                            className="p-1 text-slate-400 hover:text-blue-600"
                            title={allSelected ? "Deselect All" : "Select All"}
                        >
                            {allSelected ? (
                                <CheckSquare size={16} className="text-blue-600" />
                            ) : someSelected ? (
                                <div className="relative">
                                    <Square size={16} className="text-slate-300" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-blue-600 rounded-sm" />
                                    </div>
                                </div>
                            ) : (
                                <Square size={16} className="text-slate-300 group-hover:text-slate-400" />
                            )}
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="bg-white">
                        {items.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-sm">No items found</div>
                        ) : (
                            items.map(item => renderMetadataItem(item))
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderMetadataItem = (item: MetadataItem) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedSections.has(item.id);
        const isActive = selectedItem?.id === item.id;
        const isSelected = selectedItems.has(item.id);

        return (
            <div key={item.id}>
                <div
                    className={`flex items-center justify-between p-2 px-4 hover:bg-blue-50 cursor-pointer transition-colors group ${isActive ? 'bg-blue-50 border-l-2 border-blue-600' : 'border-l-2 border-transparent'
                        }`}
                    onClick={() => {
                        setSelectedItem(item);
                        if (hasChildren) {
                            toggleSection(item.id);
                        }
                    }}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}>
                            {isSelected ? (
                                <CheckSquare size={16} className="text-blue-600" />
                            ) : (
                                <Square size={16} className="text-slate-300 hover:text-slate-400" />
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {hasChildren && (
                                <span onClick={(e) => { e.stopPropagation(); toggleSection(item.id); }}>
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </span>
                            )}
                            <Database size={14} className="text-slate-400 shrink-0" />
                            <span className="text-sm text-slate-700 truncate">{item.label}</span>
                            <span className="text-xs text-slate-400 font-mono shrink-0">{item.type}</span>
                        </div>
                    </div>
                    <Eye size={14} className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-300 group-hover:text-blue-400'}`} />
                </div>

                {hasChildren && isExpanded && (
                    <div className="ml-8 border-l border-slate-200">
                        {item.children!.map(child => renderMetadataItem(child))}
                    </div>
                )}
            </div>
        );
    };

    const renderDetailView = () => {
        if (!selectedItem) {
            return (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <FileCode size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium">Select an item to view details</p>
                        <p className="text-sm mt-2">Click any metadata item from the left panel</p>
                    </div>
                </div>
            );
        }

        const metadata = selectedItem.metadata;

        return (
            <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-slate-800">{selectedItem.label}</h2>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 font-mono">{selectedItem.name}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{selectedItem.type}</span>
                        </div>
                    </div>

                    {/* Object Details */}
                    {selectedItem.type === 'Object' && metadata && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Fields ({metadata.fields?.length || 0})</h3>
                                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead className="bg-slate-100 text-slate-600">
                                            <tr>
                                                <th className="p-2 text-left">Name</th>
                                                <th className="p-2 text-left">Type</th>
                                                <th className="p-2 text-left">Required</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {metadata.fields?.slice(0, 10).map((field: any, i: number) => (
                                                <tr key={i} className="hover:bg-white">
                                                    <td className="p-2 font-mono">{field.name}</td>
                                                    <td className="p-2">{field.type}</td>
                                                    <td className="p-2">{field.required ? 'Yes' : 'No'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {selectedItem.children && selectedItem.children.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Related Metadata</h3>
                                    <div className="space-y-2">
                                        {selectedItem.children.map(child => (
                                            <div
                                                key={child.id}
                                                className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200 hover:border-blue-300 cursor-pointer"
                                                onClick={() => setSelectedItem(child)}
                                            >
                                                <GitBranch size={14} className="text-slate-400" />
                                                <span className="text-sm">{child.label}</span>
                                                <span className="text-xs text-slate-500">{child.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Apex Class Details */}
                    {selectedItem.type === 'Apex Class' && metadata && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Class Information</h3>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-sm">
                                    <div><span className="font-medium">API Version:</span> {metadata.apiVersion}</div>
                                    <div><span className="font-medium">Status:</span> {metadata.status}</div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Code</h3>
                                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                                    <pre>{metadata.body || '// No code available'}</pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trigger Details */}
                    {selectedItem.type === 'Trigger' && metadata && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Trigger Information</h3>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-sm">
                                    <div><span className="font-medium">Object:</span> {metadata.object}</div>
                                    <div><span className="font-medium">Events:</span> {metadata.events?.join(', ')}</div>
                                    <div><span className="font-medium">Status:</span> {metadata.status}</div>
                                </div>
                            </div>
                            {metadata.body && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Code</h3>
                                    <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                                        <pre>{metadata.body}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Validation Rule Details */}
                    {selectedItem.type === 'Validation Rule' && metadata && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-2">Error Message</h3>
                                <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
                                    {metadata.errorMessage}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-2">Condition</h3>
                                <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-xs">
                                    {metadata.errorCondition}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Flow Details */}
                    {(selectedItem.type === 'Screen Flow' || selectedItem.type === 'Autolaunched Flow') && metadata && (
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-sm">
                                <div><span className="font-medium">Type:</span> {metadata.type}</div>
                                <div><span className="font-medium">Status:</span> {metadata.status}</div>
                                {metadata.description && <div><span className="font-medium">Description:</span> {metadata.description}</div>}
                            </div>
                        </div>
                    )}

                    {/* Component Details */}
                    {(selectedItem.type === 'LWC' || selectedItem.type === 'Aura') && metadata && (
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-sm">
                                <div><span className="font-medium">Type:</span> {metadata.type}</div>
                                <div><span className="font-medium">API Version:</span> {metadata.apiVersion}</div>
                                {metadata.description && <div><span className="font-medium">Description:</span> {metadata.description}</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Metadata Explorer</h2>
                <p className="text-slate-500 text-sm">360-degree view of your Salesforce org</p>
            </div>

            {!activeOrg ? (
                <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                    Select a connected org to explore metadata
                </div>
            ) : activeOrg.syncState.isSyncing && !activeOrg.metadataSummary ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <RefreshCw size={48} className="animate-spin text-blue-500 mb-4" />
                    <p className="font-medium text-lg">Syncing Metadata...</p>
                    <p className="text-sm text-slate-400 mt-1">{activeOrg.syncState.progress}% Complete</p>
                </div>
            ) : (
                <>
                    {/* Search and View Toggle */}
                    <div className="mb-4 flex gap-3">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search across all metadata..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('object-centric')}
                                className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'object-centric'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Layers size={14} className="inline mr-1" />
                                Object View
                            </button>
                            <button
                                onClick={() => setViewMode('component-centric')}
                                className={`px-3 py-2 text-xs font-medium transition-colors border-l border-slate-300 ${viewMode === 'component-centric'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Code2 size={14} className="inline mr-1" />
                                Component View
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex gap-4 overflow-hidden">
                        {/* Left Navigation */}
                        <div className="w-80 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
                            {renderCategorySection('standard-objects', 'Standard Objects', Database, 'blue')}
                            {renderCategorySection('custom-objects', 'Custom Objects', Database, 'purple')}
                            {renderCategorySection('system-components', 'System Components', Code2, 'indigo')}
                            {renderCategorySection('global-metadata', 'Global Metadata', Globe, 'green')}
                        </div>

                        {/* Detail View */}
                        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            {renderDetailView()}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MetadataExplorer;
