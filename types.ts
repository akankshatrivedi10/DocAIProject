
export enum Tab {
  DASHBOARD = 'DASHBOARD',
  INTEGRATIONS = 'INTEGRATIONS',
  METADATA = 'METADATA',
  DEV_HUB = 'DEV_HUB',
  GTM_HUB = 'GTM_HUB',
  SALES_ENABLEMENT = 'SALES_ENABLEMENT',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS'
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
  OBJECTS = 'Fetching Objects & Record Types',
  APEX = 'Indexing Apex & Triggers',
  FLOWS = 'Analyzing Flows & Process Builders',
  COMPONENTS = 'Scanning LWC & Aura Components',
  CONFIG = 'Retrieving Profiles & Sharing Settings',
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
  // OAuth Fields
  accessToken?: string;
  refreshToken?: string;
  instanceUrl?: string;
  clientId?: string;
  clientSecret?: string;

  // Legacy fields (keeping for now to avoid breaking other parts immediately, but should be deprecated)
  consumerKey?: string;
  consumerSecret?: string;
  securityToken?: string;
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

// --- Detailed Metadata Models ---

export interface FieldDef {
  name: string;
  label: string;
  type: string;
  length?: number;
  required?: boolean;
  helpText?: string;
  picklistValues?: string[];
}

export interface RecordTypeDef {
  name: string;
  developerName: string;
  active: boolean;
  businessProcess?: string; // e.g. Support Process
}

export interface ObjectDef {
  name: string;
  label: string;
  type: 'Standard' | 'Custom';
  fields: FieldDef[];
  recordTypes: RecordTypeDef[];
  relationships?: { name: string; type: 'Lookup' | 'MasterDetail'; relatedTo: string }[];
}

export interface ApexClassDef {
  name: string;
  type: 'Class' | 'Interface';
  apiVersion: number;
  status: 'Active' | 'Inactive';
  body: string; // Simplified for mock
  description?: string;
  dependencies?: string[];
}

export interface ApexTriggerDef {
  name: string;
  object: string;
  events: string[]; // e.g., 'before insert'
  body?: string;
  status: 'Active' | 'Inactive';
}

export interface FlowNode {
  name: string;
  type: 'Screen' | 'Action' | 'Decision' | 'Assignment' | 'Loop';
  label: string;
  description?: string;
}

export interface FlowDef {
  name: string;
  label: string;
  type: 'Screen Flow' | 'Autolaunched Flow' | 'Triggered Flow' | 'Process Builder';
  status: 'Active' | 'Draft';
  triggerType?: 'RecordBeforeSave' | 'RecordAfterSave' | 'Schedule' | 'PlatformEvent';
  triggerObject?: string;
  nodes: FlowNode[];
  description?: string;
}

export interface ValidationRuleDef {
  name: string;
  object: string;
  active: boolean;
  errorCondition: string;
  errorMessage: string;
}

export interface ComponentDef {
  name: string;
  type: 'LWC' | 'Aura';
  apiVersion: number;
  description?: string;
}

export interface ProfileDef {
  name: string;
  userLicense: string;
  custom: boolean;
}

export interface SharingRuleDef {
  object: string;
  label: string;
  accessLevel: 'Read' | 'Edit' | 'All';
  type: 'OwnerBased' | 'CriteriaBased';
}

export interface MetadataSummary {
  objects: ObjectDef[];
  apexClasses: ApexClassDef[];
  triggers: ApexTriggerDef[];
  flows: FlowDef[];
  validationRules: ValidationRuleDef[];
  components: ComponentDef[];
  profiles: ProfileDef[];
  sharingRules: SharingRuleDef[];
  permissions?: number;
  fetchedAt: Date;
  details?: any; // Full JSON dump for AI context
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

export enum SystemRole {
  ADMIN = 'Admin',
  USER = 'User'
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
  systemRole: SystemRole; // Admin or User permission level
  organizationId: string;
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

export interface UsageLimits {
  maxConnectedOrgs: number;
  maxMetadataItems: number;
  maxDocuments: number;
  maxStorageMB: number;
  maxApiCalls: number;
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
  limits: UsageLimits;
}

export enum MetadataType {
  OBJECT = 'Object',
  APEX_CLASS = 'Apex Class',
  TRIGGER = 'Trigger',
  FLOW = 'Flow',
  COMPONENT = 'Component',
  LAYOUT = 'Layout',
  PERMISSION_SET = 'Permission Set',
  VALIDATION_RULE = 'Validation Rule',
  PROFILE = 'Profile'
}

export interface MetadataItem {
  id: string;
  name: string;
  label: string;
  type: string; // Can be string or MetadataType
  category: 'standard-objects' | 'custom-objects' | 'system-components' | 'global-metadata';
  children?: MetadataItem[];
  metadata?: any;
  lastModifiedDate?: string;
}
