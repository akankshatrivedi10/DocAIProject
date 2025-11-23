
import { CustomerProfile, SubscriptionPlan, UserRole, User } from '../types';

// Simulate backend latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface AuthResponse {
  user: User;
  profile: CustomerProfile;
  token: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  await delay(800);
  
  // Mock login validation
  if (email.includes('error')) {
    throw new Error('Invalid credentials');
  }

  // Return a mock existing user
  const user: User = {
    id: 'u_existing_1',
    name: 'Demo User',
    email: email,
    role: UserRole.ADMIN,
    status: 'Active',
    lastLogin: new Date()
  };

  const profile: CustomerProfile = {
    id: 'cust_demo_1',
    companyName: 'Demo Company Inc.',
    industry: 'Technology',
    domain: email.split('@')[1] || 'demo.com',
    subscription: {
      plan: SubscriptionPlan.PRO,
      status: 'Trialing',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days left
      seatsTotal: 5,
      seatsUsed: 1
    },
    users: [user],
    transactions: [],
    usage: {
      connectedOrgs: 1,
      metadataItemsAnalyzed: 450,
      documentsGenerated: 5,
      storageUsedMB: 12,
      apiCallsThisMonth: 120
    }
  };

  return { user, profile, token: 'mock-jwt-token' };
};

export const signup = async (fullName: string, companyName: string, email: string, password: string): Promise<AuthResponse> => {
  await delay(1200);

  // Create new User
  const newUser: User = {
    id: `u_${Date.now()}`,
    name: fullName,
    email: email,
    role: UserRole.ADMIN,
    status: 'Active',
    lastLogin: new Date()
  };

  // Calculate Trial Dates (1 Month Free)
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(now.getDate() + 30);

  // Create new Customer Profile
  const newProfile: CustomerProfile = {
    id: `cust_${Date.now()}`,
    companyName: companyName,
    industry: 'Unspecified',
    domain: email.split('@')[1] || 'domain.com',
    subscription: {
      plan: SubscriptionPlan.PRO,
      status: 'Trialing',
      startDate: now,
      endDate: trialEnd,
      trialStartDate: now,
      trialEndDate: trialEnd,
      seatsTotal: 5,
      seatsUsed: 1
    },
    users: [newUser],
    transactions: [
        {
            id: `tx_${Date.now()}`,
            date: now,
            amount: 0,
            currency: 'USD',
            description: 'Free Trial Activation (1 Month)',
            status: 'Paid',
            invoiceUrl: '#'
        }
    ],
    usage: {
      connectedOrgs: 0,
      metadataItemsAnalyzed: 0,
      documentsGenerated: 0,
      storageUsedMB: 0,
      apiCallsThisMonth: 0
    }
  };

  return { user: newUser, profile: newProfile, token: 'mock-jwt-token' };
};
