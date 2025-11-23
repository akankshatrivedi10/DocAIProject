
import { MetadataSummary, SyncStage } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockMetadataPayload = {
  objects: [
    { name: "Account", label: "Account", type: "Standard", fields: ["Name", "Industry", "AnnualRevenue", "Custom_Priority__c"] },
    { name: "Opportunity", label: "Opportunity", type: "Standard", fields: ["Name", "StageName", "Amount", "CloseDate", "LeadSource", "NextStep"] },
    { name: "Lead", label: "Lead", type: "Standard", fields: ["FirstName", "LastName", "Company", "Status", "Email", "LeadSource"] },
    { name: "Project__c", label: "Project", type: "Custom", fields: ["Name", "Start_Date__c", "Budget__c", "Related_Opportunity__c"] }
  ],
  apexClasses: [
    { name: "AccountTriggerHandler", type: "Class", description: "Handles logic for Account insert/update" },
    { name: "ProjectService", type: "Class", description: "Service layer for Project__c logic" },
    { name: "LeadConverter", type: "Class", description: "Custom logic for converting Leads to Accounts" },
    { name: "OpportunityScoring", type: "Class", description: "Calculates propensity to close based on interaction history." }
  ],
  flows: [
    { name: "New_Customer_Onboarding", type: "Screen Flow", description: "Guides reps through onboarding a closed-won client." },
    { name: "Project_Auto_Creation", type: "Autolaunched Flow", description: "Creates a Project__c record when Opportunity is Closed Won." },
    { name: "Lead_Routing_Master", type: "Autolaunched Flow", description: "Routes leads based on region and company size." }
  ],
  triggers: [
    { name: "AccountTrigger", object: "Account", events: ["before insert", "after update"] },
    { name: "OpportunityTrigger", object: "Opportunity", events: ["after update"] }
  ],
  validationRules: [
    { name: "Project_Budget_Required", object: "Project__c", description: "Budget cannot be null if Status is Active." },
    { name: "Lead_Email_Format", object: "Lead", description: "Ensures email address is valid format before conversion." }
  ]
};

export const performStagedSync = async (
  onProgress: (stage: SyncStage, progress: number, log: string) => void
): Promise<MetadataSummary> => {
  
  // Stage 1: Handshake
  onProgress(SyncStage.INIT, 10, "Authenticating with Salesforce OAuth 2.0...");
  await delay(800);
  onProgress(SyncStage.INIT, 15, "Verifying API Scopes (api, refresh_token, web)...");
  await delay(800);

  // Stage 2: Objects
  onProgress(SyncStage.OBJECTS, 20, "Querying global describe...");
  await delay(600);
  onProgress(SyncStage.OBJECTS, 35, "Fetching Field definitions for 4 objects...");
  await delay(800);
  onProgress(SyncStage.OBJECTS, 40, "Indexing Relationship graph...");
  await delay(400);

  // Stage 3: Apex
  onProgress(SyncStage.APEX, 45, "Retrieving ApexClass bodies...");
  await delay(700);
  onProgress(SyncStage.APEX, 55, "Parsing Trigger dependency tree...");
  await delay(700);
  onProgress(SyncStage.APEX, 60, "Analyzing test coverage...");
  await delay(400);

  // Stage 4: Flows
  onProgress(SyncStage.FLOWS, 65, "Fetching FlowDefinitions via Tooling API...");
  await delay(800);
  onProgress(SyncStage.FLOWS, 75, "Mapping Flow nodes to Object IDs...");
  await delay(800);

  // Stage 5: Config
  onProgress(SyncStage.CONFIG, 85, "Downloading Validation Rules & Workflow...");
  await delay(600);
  onProgress(SyncStage.CONFIG, 95, "Indexing Permissions & Profiles...");
  await delay(600);

  // Complete
  onProgress(SyncStage.COMPLETE, 100, "Metadata sync completed successfully.");
  
  return {
    ...mockMetadataPayload,
    permissions: 45,
    fetchedAt: new Date(),
    details: mockMetadataPayload
  };
};
