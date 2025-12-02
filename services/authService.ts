import { User, UserRole, SystemRole } from '../types';

// Mock User Database
const USERS: User[] = [
  {
    id: 'admin-user',
    name: 'Admin User',
    email: 'admin@docbot.com',
    role: UserRole.ADMIN,
    systemRole: SystemRole.ADMIN,
    organizationId: 'org-1',
    tenantId: 'internal', // Internal Employee
    status: 'Active'
  },
  {
    id: 'sales-user',
    name: 'Sales Rep',
    email: 'sales@docbot.com',
    role: UserRole.SALES,
    systemRole: SystemRole.USER,
    organizationId: 'org-1',
    tenantId: 'internal', // Internal Employee
    status: 'Active'
  },
  {
    id: 'internal-brahmcloud',
    name: 'Brahmcloud Internal',
    email: 'info@brahmcloud',
    role: UserRole.ADMIN,
    systemRole: SystemRole.ADMIN,
    organizationId: 'org-1',
    tenantId: 'internal', // Internal Employee
    status: 'Active'
  },
  {
    id: 'customer-akanksha',
    name: 'Akanksha Trivedi',
    email: 'akankshatrivedi45@gmail.com',
    role: UserRole.ADMIN,
    systemRole: SystemRole.ADMIN,
    organizationId: 'org-brahmcloud',
    tenantId: 'tenant-brahmcloud-001', // Customer Tenant
    status: 'Active'
  }
];

export const login = async (email: string, password?: string): Promise<{ user: User; profile: any }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new Error('User not found');
  }

  // Mock profile data
  const profile = {
    id: `profile-${user.organizationId}`,
    companyName: user.organizationId === 'org-brahmcloud' ? 'Brahmcloud' : 'Acme Corp',
    industry: 'Technology',
    domain: user.email.split('@')[1],
    subscription: {
      plan: 'Pro',
      status: 'Active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      seatsTotal: 10,
      seatsUsed: 4
    },
    users: USERS.filter(u => u.organizationId === user.organizationId),
    transactions: [
      {
        id: 'tx-101',
        date: new Date('2025-11-01'),
        amount: 99.00,
        currency: 'USD',
        description: 'Pro Plan - Monthly',
        status: 'Paid',
        invoiceUrl: '#'
      }
    ],
    usage: {
      connectedOrgs: 1,
      metadataItemsAnalyzed: 1250,
      documentsGenerated: 45,
      storageUsedMB: 120,
      apiCallsThisMonth: 8500
    },
    limits: {
      maxConnectedOrgs: 5,
      maxMetadataItems: 10000,
      maxDocuments: 100,
      maxStorageMB: 1024,
      maxApiCalls: 100000
    }
  };

  return { user, profile };
};

export const signup = async (
  fullName: string,
  companyName: string,
  email: string,
  password: string
): Promise<{ user: User; profile: any }> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  // Create a new customer user
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: fullName,
    email: email.toLowerCase(),
    role: UserRole.ADMIN,
    systemRole: SystemRole.ADMIN,
    organizationId: `org-${companyName.toLowerCase().replace(/\s+/g, '-')}`,
    tenantId: `tenant-${Date.now()}`,
    status: 'Active'
  };

  // Add to USERS array (in real app, this would go to database)
  USERS.push(newUser);

  // Mock profile data
  const profile = {
    id: `profile-${newUser.organizationId}`,
    companyName: companyName,
    industry: 'Technology',
    domain: email.split('@')[1],
    subscription: {
      plan: 'Free',
      status: 'Trialing',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      seatsTotal: 5,
      seatsUsed: 1
    },
    users: [newUser],
    transactions: [],
    usage: {
      connectedOrgs: 0,
      metadataItemsAnalyzed: 0,
      documentsGenerated: 0,
      storageUsedMB: 0,
      apiCallsThisMonth: 0
    },
    limits: {
      maxConnectedOrgs: 1,
      maxMetadataItems: 1000,
      maxDocuments: 10,
      maxStorageMB: 100,
      maxApiCalls: 1000
    }
  };

  console.log(`New user signed up: ${email} for ${companyName}`);

  return { user: newUser, profile };
};

export const register = async (name: string, email: string, companyName: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  // In a real app, this would create a pending user and send an email
  // For mock, we'll just simulate success
  console.log(`Registered: ${email} for ${companyName}`);
};

export const verifyEmail = async (code: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (code !== '123456') {
    throw new Error('Invalid verification code');
  }

  // Create a new Customer User on the fly
  const newUser: User = {
    id: Date.now().toString(),
    name: 'New Customer',
    email: 'customer@example.com',
    role: UserRole.ADMIN,
    systemRole: SystemRole.ADMIN,
    organizationId: `org-${Date.now()}`,
    tenantId: `tenant-${Date.now()}`, // Customer Tenant
    status: 'Active'
  };
  return newUser;
};