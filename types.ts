
export enum Tab {
  DASHBOARD = 'DASHBOARD',
  INTEGRATIONS = 'INTEGRATIONS',
  METADATA = 'METADATA',
  DEV_HUB = 'DEV_HUB',
  GTM_HUB = 'GTM_HUB',
  SALES_ENABLEMENT = 'SALES_ENABLEMENT',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE'
}

export type AuthView = 'LANDING' | 'LOGIN' | 'SIGNUP' | 'APP';

export enum OrgType {
  PRODUCTION = 'Production',
  SANDBOX = 'Sandbox',
  SCRATCH = 'Scratch Org'
}

export enum IntegrationType {
  SALESFORCE = 'Salesforce',
  HUBSPOT = 'HubSpot',
  JIRA = 'Jira',
  CONFLUENCE = 'Confluence'
}

export enum ConnectionStatus {
  DISCONNECTED = 'Disconnected',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  ERROR = 'Error'
}

export enum SyncStage {
  IDLE = 'Idle',
  INIT = 'Initializing Handshake',
  OBJECTS = 'Fetching Objects & Fields',
  APEX = 'Indexing Apex & Triggers',
  FLOWS = 'Analyzing Flows & Processes',
  CONFIG = 'Retrieving Settings & Permissions',
  COMPLETE = 'Sync Complete'
}

export interface SyncState {
  stage: SyncStage;
  progress: number; // 0 to 100
  logs: string[];
  isSyncing: boolean;
}

export interface Org {
  id: string;
  name: string;
  alias: string;
  type: OrgType;
  status: ConnectionStatus;
  lastSync?: string;
  metadataSummary?: MetadataSummary;
  syncState: SyncState;
}

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  status: ConnectionStatus;
  connectedAt?: Date;
}

export interface MetadataSummary {
  objects: any[];
  apexClasses: any[];
  triggers: any[];
  flows: any[];
  validationRules: any[];
  permissions?: number;
  fetchedAt: Date;
  details?: any; 
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  orgId?: string;
}

// --- Customer Profile & SaaS Models ---

export enum SubscriptionPlan {
  FREE = 'Free',
  PRO = 'Pro',
  ENTERPRISE = 'Enterprise'
}

export enum UserRole {
  ADMIN = 'Admin',
  DEV = 'Developer',
  BA = 'Business Analyst',
  GTM = 'GTM Lead',
  SALES = 'Sales',
  BDR = 'BDR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'Active' | 'Invited' | 'Deactivated';
  lastLogin?: Date;
}

export interface Subscription {
  plan: SubscriptionPlan;
  status: 'Active' | 'Past Due' | 'Canceled' | 'Trialing';
  startDate: Date;
  endDate: Date; // Renews on
  trialStartDate?: Date;
  trialEndDate?: Date;
  seatsTotal: number;
  seatsUsed: number;
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  description: string;
  status: 'Paid' | 'Pending' | 'Failed';
  invoiceUrl: string;
}

export interface UsageMetrics {
  connectedOrgs: number;
  metadataItemsAnalyzed: number;
  documentsGenerated: number;
  storageUsedMB: number;
  apiCallsThisMonth: number;
}

export interface CustomerProfile {
  id: string;
  companyName: string;
  industry: string;
  domain: string;
  subscription: Subscription;
  users: User[];
  transactions: Transaction[];
  usage: UsageMetrics;
}
