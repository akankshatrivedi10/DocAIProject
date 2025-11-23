
import { MetadataSummary, SyncStage, ObjectDef, FlowDef, ApexClassDef, ValidationRuleDef } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK DATA ---

const mockObjects: ObjectDef[] = [
  { 
    name: "Account", 
    label: "Account", 
    type: "Standard", 
    fields: [
        { name: "Name", label: "Account Name", type: "Text(255)", required: true },
        { name: "Industry", label: "Industry", type: "Picklist", picklistValues: ["Technology", "Finance", "Healthcare"] },
        { name: "AnnualRevenue", label: "Annual Revenue", type: "Currency" },
        { name: "SLA__c", label: "SLA Level", type: "Picklist", picklistValues: ["Gold", "Silver", "Bronze"], helpText: "Determines support response time." }
    ],
    recordTypes: [
        { name: "Enterprise_Customer", developerName: "Enterprise_Customer", active: true },
        { name: "SMB_Customer", developerName: "SMB_Customer", active: true }
    ],
    relationships: []
  },
  { 
    name: "Opportunity", 
    label: "Opportunity", 
    type: "Standard", 
    fields: [
        { name: "StageName", label: "Stage", type: "Picklist", required: true, picklistValues: ["Prospecting", "Qualification", "Closed Won", "Closed Lost"] },
        { name: "Amount", label: "Amount", type: "Currency" },
        { name: "CloseDate", label: "Close Date", type: "Date", required: true },
        { name: "AccountId", label: "Account ID", type: "Lookup" }
    ],
    recordTypes: [
        { name: "New_Business", developerName: "New_Business", active: true, businessProcess: "Sales Process V2" },
        { name: "Renewal", developerName: "Renewal", active: true }
    ],
    relationships: [{ name: "Account", type: "Lookup", relatedTo: "Account" }]
  },
  {
    name: "Project__c",
    label: "Project",
    type: "Custom",
    fields: [
        { name: "Status__c", label: "Status", type: "Picklist", picklistValues: ["Planned", "Active", "Completed"] },
        { name: "Budget__c", label: "Total Budget", type: "Currency" },
        { name: "Opportunity__c", label: "Related Opportunity", type: "MasterDetail" }
    ],
    recordTypes: [],
    relationships: [{ name: "Opportunity__r", type: "MasterDetail", relatedTo: "Opportunity" }]
  }
];

const mockApexClasses: ApexClassDef[] = [
  { 
      name: "AccountTriggerHandler", 
      type: "Class", 
      apiVersion: 58.0, 
      status: "Active", 
      description: "Handles logic for Account insert/update. Enforces SLA defaults.",
      body: "public class AccountTriggerHandler { ... }",
      dependencies: ["AccountService", "LogUtils"]
  },
  { 
      name: "ProjectService", 
      type: "Class", 
      apiVersion: 59.0, 
      status: "Active", 
      description: "Service layer for Project__c logic. Handles auto-creation from Won Opportunities.",
      body: "public with sharing class ProjectService { ... }"
  },
  { 
      name: "OpportunityScoringBatch", 
      type: "Class", 
      apiVersion: 57.0, 
      status: "Active", 
      description: "Nightly batch job to recalculate opportunity health scores.",
      body: "global class OpportunityScoringBatch implements Database.Batchable { ... }"
  }
];

const mockFlows: FlowDef[] = [
  { 
      name: "New_Customer_Onboarding", 
      label: "New Customer Onboarding", 
      type: "Screen Flow", 
      status: "Active",
      description: "Guides reps through onboarding a closed-won client. Collects contact details and kicks off Project.",
      nodes: [
          { name: "Get_Account_Info", type: "Screen", label: "Confirm Account Details" },
          { name: "Create_Project", type: "Action", label: "Create Project Record" },
          { name: "Email_Finance", type: "Action", label: "Notify Finance Team" }
      ]
  },
  { 
      name: "Opportunity_Auto_Close", 
      label: "Opportunity Auto Close", 
      type: "Triggered Flow", 
      triggerType: "RecordAfterSave",
      triggerObject: "Opportunity",
      status: "Active",
      description: "Automatically creates a Renewal Opportunity when a New Business opp is Closed Won.",
      nodes: [
          { name: "Check_Stage", type: "Decision", label: "Is Closed Won?" },
          { name: "Create_Renewal", type: "Action", label: "Create Renewal Opp" }
      ]
  }
];

const mockValidationRules: ValidationRuleDef[] = [
    { 
        name: "Project_Budget_Required", 
        object: "Project__c", 
        active: true, 
        errorCondition: "ISBLANK(Budget__c) && ISPICKVAL(Status__c, 'Active')", 
        errorMessage: "Budget cannot be null if Status is Active." 
    },
    { 
        name: "Lead_Email_Format", 
        object: "Lead", 
        active: true, 
        errorCondition: "NOT(REGEX(Email, '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'))", 
        errorMessage: "Please enter a valid email address." 
    }
];

const mockTriggers = [
    { name: "AccountTrigger", object: "Account", events: ["before insert", "after update"], status: "Active" as const },
    { name: "OpportunityTrigger", object: "Opportunity", events: ["after update"], status: "Active" as const }
];

const mockComponents = [
    { name: "opportunityPath", type: "LWC" as const, apiVersion: 58, description: "Custom path component with guidance." },
    { name: "projectGanttChart", type: "LWC" as const, apiVersion: 59, description: "Visualizes Project__c timelines." }
];

const mockProfiles = [
    { name: "System Administrator", userLicense: "Salesforce", custom: false },
    { name: "Standard User", userLicense: "Salesforce", custom: false },
    { name: "Sales User Custom", userLicense: "Salesforce", custom: true }
];

const mockSharingRules = [
    { object: "Project__c", label: "Share Active Projects with Managers", accessLevel: "Edit" as const, type: "CriteriaBased" as const },
    { object: "Opportunity", label: "Share Closed Won with Finance", accessLevel: "Read" as const, type: "CriteriaBased" as const }
];

// --- SYNC LOGIC ---

export const performStagedSync = async (
  onProgress: (stage: SyncStage, progress: number, log: string) => void
): Promise<MetadataSummary> => {
  
  // Stage 1: Handshake
  onProgress(SyncStage.INIT, 5, "Authenticating with Salesforce OAuth 2.0...");
  await delay(600);
  onProgress(SyncStage.INIT, 10, "Verifying API Scopes (api, refresh_token, web)...");
  await delay(600);
  onProgress(SyncStage.INIT, 12, "Establishing Metadata API Session (v59.0)...");
  await delay(400);

  // Stage 2: Objects
  onProgress(SyncStage.OBJECTS, 15, "Querying global describe for sObjects...");
  await delay(500);
  onProgress(SyncStage.OBJECTS, 20, "Fetching definition for 'Account' [Standard]...");
  await delay(300);
  onProgress(SyncStage.OBJECTS, 25, "Fetching definition for 'Opportunity' [Standard]...");
  await delay(300);
  onProgress(SyncStage.OBJECTS, 30, "Fetching definition for 'Project__c' [Custom]...");
  await delay(300);
  onProgress(SyncStage.OBJECTS, 35, "Indexing Field Sets and Record Types...");
  await delay(400);

  // Stage 3: Apex
  onProgress(SyncStage.APEX, 40, "Retrieving ApexManifest...");
  await delay(500);
  onProgress(SyncStage.APEX, 45, "Parsing 3 Apex Classes...");
  await delay(400);
  onProgress(SyncStage.APEX, 50, "Analyzing Trigger architecture on Account, Opportunity...");
  await delay(400);

  // Stage 4: Flows
  onProgress(SyncStage.FLOWS, 55, " querying Tooling API for FlowDefinitions...");
  await delay(500);
  onProgress(SyncStage.FLOWS, 60, "Downloading metadata for 'New_Customer_Onboarding' (Screen Flow)...");
  await delay(400);
  onProgress(SyncStage.FLOWS, 65, "Downloading metadata for 'Opportunity_Auto_Close' (Record-Triggered)...");
  await delay(400);

  // Stage 5: Components
  onProgress(SyncStage.COMPONENTS, 70, "Scanning Lightning Bundles...");
  await delay(400);
  onProgress(SyncStage.COMPONENTS, 75, "Indexing LWC: 'projectGanttChart', 'opportunityPath'...");
  await delay(400);

  // Stage 6: Config
  onProgress(SyncStage.CONFIG, 80, "Retrieving Validation Rules...");
  await delay(300);
  onProgress(SyncStage.CONFIG, 85, "Fetching Sharing Rules & Criteria...");
  await delay(400);
  onProgress(SyncStage.CONFIG, 90, "Analyzing Profile permissions for 'System Administrator'...");
  await delay(400);
  onProgress(SyncStage.CONFIG, 95, "Mapping Dependency Graph...");
  await delay(500);

  // Complete
  onProgress(SyncStage.COMPLETE, 100, "Metadata sync completed successfully. Index built.");
  
  const fullPayload: MetadataSummary = {
    objects: mockObjects,
    apexClasses: mockApexClasses,
    triggers: mockTriggers,
    flows: mockFlows,
    validationRules: mockValidationRules,
    components: mockComponents,
    profiles: mockProfiles,
    sharingRules: mockSharingRules,
    permissions: 88,
    fetchedAt: new Date(),
  };

  fullPayload.details = fullPayload; // Self-reference for simple context passing

  return fullPayload;
};
