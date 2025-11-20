import { MetadataSummary } from '../types';

// Simulating a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockMetadataPayload = {
  objects: [
    { name: "Account", label: "Account", type: "Standard", fields: ["Name", "Industry", "AnnualRevenue", "Custom_Priority__c"] },
    { name: "Opportunity", label: "Opportunity", type: "Standard", fields: ["Name", "StageName", "Amount", "CloseDate", "LeadSource"] },
    { name: "Project__c", label: "Project", type: "Custom", fields: ["Name", "Start_Date__c", "Budget__c", "Related_Opportunity__c"] }
  ],
  apexClasses: [
    { name: "AccountTriggerHandler", type: "Class", description: "Handles logic for Account insert/update" },
    { name: "ProjectService", type: "Class", description: "Service layer for Project__c logic" },
    { name: "LeadConverter", type: "Class", description: "Custom logic for converting Leads to Accounts" }
  ],
  flows: [
    { name: "New_Customer_Onboarding", type: "Screen Flow", description: "Guides reps through onboarding a closed-won client." },
    { name: "Project_Auto_Creation", type: "Autolaunched Flow", description: "Creates a Project__c record when Opportunity is Closed Won." }
  ],
  triggers: [
    { name: "AccountTrigger", object: "Account", events: ["before insert", "after update"] }
  ]
};

export const connectOrg = async (orgName: string): Promise<boolean> => {
  await delay(1500); // Simulate OAuth dance
  return true;
};

export const fetchMetadata = async (orgId: string): Promise<MetadataSummary> => {
  await delay(2000); // Simulate SOAP/REST API metadata retrieve
  
  return {
    apexClasses: 142,
    triggers: 12,
    flows: 28,
    customObjects: 15,
    permissions: 45,
    fetchedAt: new Date(),
    details: mockMetadataPayload
  };
};
