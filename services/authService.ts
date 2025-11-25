
import { CustomerProfile, SubscriptionPlan, UserRole, User, SystemRole } from '../types';
import { TEST_CREDENTIALS } from './testCredentials';

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

  let user: User;
  let profile: CustomerProfile;

  // Specific Test User Logic
  if (email === TEST_CREDENTIALS.app.email) {
    user = {
      id: 'u_akanksha',
      name: TEST_CREDENTIALS.app.name,
      email: TEST_CREDENTIALS.app.email,
      role: UserRole.ADMIN,
      systemRole: SystemRole.ADMIN,
      organizationId: 'cust_brahmcloud',
      status: 'Active',
      lastLogin: new Date()
    };

    profile = {
      id: 'cust_brahmcloud',
      companyName: TEST_CREDENTIALS.app.company,
      industry: 'Technology',
      domain: 'brahmcloud.com',
      subscription: {
        plan: SubscriptionPlan.PRO,
        status: 'Active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        seatsTotal: 20,
        seatsUsed: 1
      },
      users: [user],
      transactions: [
        { id: 'tx_b1', date: new Date(), amount: 490, currency: 'USD', description: 'Annual Pro Plan', status: 'Paid', invoiceUrl: '#' }
      ],
      usage: {
        connectedOrgs: 0,
        metadataItemsAnalyzed: 0,
        documentsGenerated: 0,
        storageUsedMB: 0,
        apiCallsThisMonth: 0
      },
      limits: {
        maxConnectedOrgs: 5,
        maxMetadataItems: 10000,
        maxDocuments: 50,
        maxStorageMB: 1024, // 1GB
        maxApiCalls: 1000
      }
    };
  } else {
    // Default Mock User
    user = {
      id: 'u_existing_1',
      name: 'Demo User',
      email: email,
      role: UserRole.ADMIN,
      systemRole: SystemRole.ADMIN,
      organizationId: 'cust_demo_1',
      status: 'Active',
      lastLogin: new Date()
    };

    profile = {
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
      },
      limits: {
        maxConnectedOrgs: 3,
        maxMetadataItems: 5000,
        maxDocuments: 20,
        maxStorageMB: 512, // 512MB
        maxApiCalls: 500
      }
    };
  }

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
    systemRole: SystemRole.ADMIN,
    organizationId: `cust_${Date.now()}`,
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
    },
    limits: {
      maxConnectedOrgs: 3,
      maxMetadataItems: 5000,
      maxDocuments: 20,
      maxStorageMB: 512,
      maxApiCalls: 500
    }
  };

  return { user: newUser, profile: newProfile, token: 'mock-jwt-token' };
};