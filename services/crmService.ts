import { Lead, Account, Contact, Opportunity, User, SystemRole } from '../types';

// Mock Data
let LEADS: Lead[] = [
    { id: '1', name: 'Alice Johnson', company: 'TechCorp', email: 'alice@techcorp.com', status: 'New', source: 'Website', createdAt: new Date() },
    { id: '2', name: 'Bob Smith', company: 'Innovate Inc', email: 'bob@innovate.com', status: 'Contacted', source: 'LinkedIn', createdAt: new Date() }
];

let ACCOUNTS: Account[] = [
    { id: '1', name: 'MegaSoft', industry: 'Software', status: 'Customer', createdAt: new Date('2025-01-15') }
];

let OPPORTUNITIES: Opportunity[] = [
    { id: '1', name: 'MegaSoft Expansion', accountId: '1', stage: 'Proposal', amount: 50000, closeDate: new Date('2025-12-31'), createdAt: new Date() }
];

const checkInternalAccess = (user: User) => {
    if (user.tenantId !== 'internal') {
        throw new Error('Access Denied: Internal use only.');
    }
};

export const getLeads = async (user: User): Promise<Lead[]> => {
    checkInternalAccess(user);
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...LEADS];
};

export const createLead = async (lead: Omit<Lead, 'id' | 'createdAt'>, user: User): Promise<Lead> => {
    checkInternalAccess(user);
    await new Promise(resolve => setTimeout(resolve, 300));
    const newLead: Lead = {
        ...lead,
        id: Date.now().toString(),
        createdAt: new Date()
    };
    LEADS = [newLead, ...LEADS];
    return newLead;
};

export const convertLead = async (leadId: string, user: User): Promise<void> => {
    checkInternalAccess(user);
    await new Promise(resolve => setTimeout(resolve, 500));
    const leadIndex = LEADS.findIndex(l => l.id === leadId);
    if (leadIndex === -1) throw new Error('Lead not found');

    const lead = LEADS[leadIndex];
    LEADS[leadIndex] = { ...lead, status: 'Converted' };

    // Create Account & Opportunity automatically
    const newAccount: Account = {
        id: Date.now().toString(),
        name: lead.company,
        industry: 'Technology', // Default
        status: 'Prospect',
        createdAt: new Date()
    };
    ACCOUNTS.push(newAccount);

    const newOpp: Opportunity = {
        id: (Date.now() + 1).toString(),
        name: `${lead.company} Deal`,
        accountId: newAccount.id,
        stage: 'Prospecting',
        amount: 10000, // Default start
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        createdAt: new Date()
    };
    OPPORTUNITIES.push(newOpp);
};

export const getAccounts = async (user: User): Promise<Account[]> => {
    checkInternalAccess(user);
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...ACCOUNTS];
};

export const getOpportunities = async (user: User): Promise<Opportunity[]> => {
    checkInternalAccess(user);
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...OPPORTUNITIES];
};
