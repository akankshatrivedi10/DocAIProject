
import { MetadataSummary, SyncStage, ObjectDef, FlowDef, ApexClassDef, ValidationRuleDef, ApexTriggerDef, ComponentDef, ProfileDef, SharingRuleDef } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- DYNAMIC DATA GENERATORS ---

const getMockObjects = (alias: string): ObjectDef[] => {
    const isBrahmcloud = alias.toLowerCase().includes('brahm') || alias.toLowerCase().includes('akanksha');
    
    const standardObjects: ObjectDef[] = [
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
        }
    ];

    if (isBrahmcloud) {
        standardObjects.push({
            name: "Cloud_Subscription__c",
            label: "Cloud Subscription",
            type: "Custom",
            fields: [
                { name: "Plan_Type__c", label: "Plan Type", type: "Picklist", picklistValues: ["SaaS", "PaaS", "IaaS"] },
                { name: "Monthly_Cost__c", label: "Monthly Cost", type: "Currency" },
                { name: "Brahm_ID__c", label: "Brahm ID", type: "Text(10)", required: true, helpText: "Legacy ID from Brahmcloud Core" }
            ],
            recordTypes: [],
            relationships: [{ name: "Account__r", type: "MasterDetail", relatedTo: "Account" }]
        });
    } else {
         standardObjects.push({
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
        });
    }

    return standardObjects;
};

const getMockApex = (alias: string): ApexClassDef[] => {
    const isBrahmcloud = alias.toLowerCase().includes('brahm');
    
    if (isBrahmcloud) {
        return [
             { 
                name: "BrahmIntegrationService", 
                type: "Class", 
                apiVersion: 60.0, 
                status: "Active", 
                description: "Syncs subscription status with Brahmcloud external API.",
                body: "public class BrahmIntegrationService { ... }",
                dependencies: ["HttpUtils", "SubscriptionTriggerHandler"]
            },
            { 
                name: "SubscriptionTriggerHandler", 
                type: "Class", 
                apiVersion: 60.0, 
                status: "Active", 
                description: "Handles provisioning logic for Cloud_Subscription__c.",
                body: "public class SubscriptionTriggerHandler { ... }"
            }
        ];
    }

    return [
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
      }
    ];
};

const getMockTriggers = (alias: string): ApexTriggerDef[] => {
    const isBrahmcloud = alias.toLowerCase().includes('brahm');
    if (isBrahmcloud) {
        return [
            { name: "CloudSubscriptionTrigger", object: "Cloud_Subscription__c", events: ["before insert", "after update"], status: "Active" },
            { name: "AccountTrigger", object: "Account", events: ["after update"], status: "Active" }
        ];
    }
    return [
        { name: "AccountTrigger", object: "Account", events: ["before insert", "after update"], status: "Active" },
        { name: "OpportunityTrigger", object: "Opportunity", events: ["after update"], status: "Active" }
    ];
}

// --- SYNC LOGIC ---

export const performStagedSync = async (
  onProgress: (stage: SyncStage, progress: number, log: string) => void,
  orgAlias: string = 'Demo'
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
  
  const isBrahm = orgAlias.toLowerCase().includes('brahm');
  const customObjName = isBrahm ? 'Cloud_Subscription__c' : 'Project__c';

  onProgress(SyncStage.OBJECTS, 30, `Fetching definition for '${customObjName}' [Custom]...`);
  await delay(300);
  onProgress(SyncStage.OBJECTS, 35, "Indexing Field Sets and Record Types...");
  await delay(400);

  // Stage 3: Apex
  onProgress(SyncStage.APEX, 40, "Retrieving ApexManifest...");
  await delay(500);
  onProgress(SyncStage.APEX, 45, "Parsing Apex Classes...");
  await delay(400);
  onProgress(SyncStage.APEX, 50, "Analyzing Trigger architecture...");
  await delay(400);

  // Stage 4: Flows
  onProgress(SyncStage.FLOWS, 55, " querying Tooling API for FlowDefinitions...");
  await delay(500);
  onProgress(SyncStage.FLOWS, 60, "Downloading metadata for 'New_Customer_Onboarding' (Screen Flow)...");
  await delay(400);

  // Stage 5: Components
  onProgress(SyncStage.COMPONENTS, 70, "Scanning Lightning Bundles...");
  await delay(400);

  // Stage 6: Config
  onProgress(SyncStage.CONFIG, 80, "Retrieving Validation Rules...");
  await delay(300);
  onProgress(SyncStage.CONFIG, 95, "Mapping Dependency Graph...");
  await delay(500);

  // Complete
  onProgress(SyncStage.COMPLETE, 100, "Metadata sync completed successfully. Index built.");
  
  // Dynamic Data Construction
  const mockObjects = getMockObjects(orgAlias);
  const mockApexClasses = getMockApex(orgAlias);
  const mockTriggers = getMockTriggers(orgAlias);
  
  const mockFlows: FlowDef[] = [
    { 
        name: "New_Customer_Onboarding", 
        label: "New Customer Onboarding", 
        type: "Screen Flow", 
        status: "Active",
        description: "Guides reps through onboarding a closed-won client.",
        nodes: [
            { name: "Get_Account_Info", type: "Screen", label: "Confirm Account Details" },
            { name: "Create_Record", type: "Action", label: `Create ${customObjName}` }
        ]
    }
  ];

  const mockValidationRules: ValidationRuleDef[] = [
      { 
          name: "Required_Field_Validation", 
          object: customObjName, 
          active: true, 
          errorCondition: "ISBLANK(Name)", 
          errorMessage: "Name is required." 
      }
  ];
  
  const mockComponents: ComponentDef[] = [
      { name: "customPath", type: "LWC", apiVersion: 58, description: "Custom path component." }
  ];

  const mockProfiles: ProfileDef[] = [
      { name: "System Administrator", userLicense: "Salesforce", custom: false },
      { name: "Standard User", userLicense: "Salesforce", custom: false }
  ];

  const mockSharingRules: SharingRuleDef[] = [
      { object: customObjName, label: "Share with Managers", accessLevel: "Edit", type: "CriteriaBased" }
  ];

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

  fullPayload.details = fullPayload; 

  return fullPayload;
};
