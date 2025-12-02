import React, { useState, useEffect } from 'react';
import { User, Opportunity } from '../../types';
import { getOpportunities } from '../../services/crmService';

interface OpportunityPipelineProps {
    currentUser: User;
}

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Closed Won', 'Closed Lost'];

const OpportunityPipeline: React.FC<OpportunityPipelineProps> = ({ currentUser }) => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

    useEffect(() => {
        loadOpps();
    }, []);

    const loadOpps = async () => {
        const data = await getOpportunities(currentUser);
        setOpportunities(data);
    };

    return (
        <div className="p-8 h-full overflow-x-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Opportunity Pipeline</h2>
            <div className="flex gap-4 min-w-max h-[calc(100vh-12rem)]">
                {STAGES.map(stage => (
                    <div key={stage} className="w-72 bg-slate-100 rounded-xl p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-700">{stage}</h3>
                            <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600">
                                {opportunities.filter(o => o.stage === stage).length}
                            </span>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto">
                            {opportunities.filter(o => o.stage === stage).map(opp => (
                                <div key={opp.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow">
                                    <h4 className="font-medium text-slate-800">{opp.name}</h4>
                                    <p className="text-sm text-slate-500 mt-1">Amount: <span className="font-semibold text-slate-700">${opp.amount.toLocaleString()}</span></p>
                                    <p className="text-xs text-slate-400 mt-2">Close: {new Date(opp.closeDate).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OpportunityPipeline;
