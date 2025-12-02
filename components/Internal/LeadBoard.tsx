import React, { useState, useEffect } from 'react';
import { User, Lead } from '../../types';
import { getLeads, createLead, convertLead } from '../../services/crmService';
import { Button, Input, Modal } from '../ui';
import { Plus, Search, ArrowRight, CheckCircle } from 'lucide-react';

interface LeadBoardProps {
    currentUser: User;
}

const LeadBoard: React.FC<LeadBoardProps> = ({ currentUser }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', company: '', email: '', source: 'Manual' });

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        const data = await getLeads(currentUser);
        setLeads(data);
    };

    const handleCreate = async () => {
        await createLead({ ...newLead, status: 'New' }, currentUser);
        setShowModal(false);
        setNewLead({ name: '', company: '', email: '', source: 'Manual' });
        loadLeads();
    };

    const handleConvert = async (id: string) => {
        await convertLead(id, currentUser);
        loadLeads();
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Lead Management</h2>
                <Button onClick={() => setShowModal(true)}>
                    <Plus size={16} className="mr-2" /> Add Lead
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Source</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {leads.map(lead => (
                            <tr key={lead.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">{lead.name}</div>
                                    <div className="text-xs text-slate-500">{lead.email}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{lead.company}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${lead.status === 'New' ? 'bg-blue-100 text-blue-700' :
                                            lead.status === 'Converted' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">{lead.source}</td>
                                <td className="px-6 py-4 text-right">
                                    {lead.status !== 'Converted' && (
                                        <button
                                            onClick={() => handleConvert(lead.id)}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end gap-1 ml-auto"
                                        >
                                            Convert <ArrowRight size={14} />
                                        </button>
                                    )}
                                    {lead.status === 'Converted' && (
                                        <span className="text-sm text-green-600 flex items-center justify-end gap-1">
                                            <CheckCircle size={14} /> Done
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Lead">
                <div className="space-y-4">
                    <Input label="Name" value={newLead.name} onChange={(e: any) => setNewLead({ ...newLead, name: e.target.value })} />
                    <Input label="Company" value={newLead.company} onChange={(e: any) => setNewLead({ ...newLead, company: e.target.value })} />
                    <Input label="Email" value={newLead.email} onChange={(e: any) => setNewLead({ ...newLead, email: e.target.value })} />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Create Lead</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LeadBoard;
