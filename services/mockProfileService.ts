
import { CustomerProfile, SubscriptionPlan, UserRole } from '../types';

const MOCK_PROFILE: CustomerProfile = {
  id: 'cust_12345',
  companyName: 'Acme Innovations Inc.',
  industry: 'Technology',
  domain: 'acme.com',
  subscription: {
    plan: SubscriptionPlan.PRO,
    status: 'Trialing',
    startDate: new Date(new Date().setDate(new Date().getDate() - 5)), // Started 5 days ago
    endDate: new Date(new Date().setDate(new Date().getDate() + 25)), // Ends in 25 days
    trialStartDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    trialEndDate: new Date(new Date().setDate(new Date().getDate() + 25)),
    seatsTotal: 10,
    seatsUsed: 4
  },
  users: [
    { id: 'u1', name: 'Sarah Connor', email: 'sarah@acme.com', role: UserRole.ADMIN, status: 'Active', lastLogin: new Date() },
    { id: 'u2', name: 'John Doe', email: 'john.d@acme.com', role: UserRole.DEV, status: 'Active', lastLogin: new Date(new Date().setDate(new Date().getDate() - 1)) },
    { id: 'u3', name: 'Emily Chen', email: 'emily@acme.com', role: UserRole.GTM, status: 'Active', lastLogin: new Date(new Date().setDate(new Date().getDate() - 2)) },
    { id: 'u4', name: 'Mike Ross', email: 'mike@acme.com', role: UserRole.SALES, status: 'Invited' }
  ],
  transactions: [
    { id: 'tx_001', date: new Date(new Date().setDate(new Date().getDate() - 5)), amount: 0, currency: 'USD', description: 'Pro Plan Trial Start', status: 'Paid', invoiceUrl: '#' }
  ],
  usage: {
    connectedOrgs: 2,
    metadataItemsAnalyzed: 1450,
    documentsGenerated: 12,
    storageUsedMB: 45.2,
    apiCallsThisMonth: 892
  }
};

export const getCustomerProfile = async (): Promise<CustomerProfile> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  return MOCK_PROFILE;
};
