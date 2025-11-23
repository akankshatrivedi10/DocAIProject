
import { MetadataSummary, SyncStage, ObjectDef, FlowDef, ApexClassDef, ValidationRuleDef, ApexTriggerDef, ComponentDef, ProfileDef, SharingRuleDef } from '../types';

// Declare jsforce global since it's loaded via script tag
declare var jsforce: any;

const PROXY_URL = 'https://node-salesforce-proxy.herokuapp.com/proxy/';

export const performRealSync = async (
  credentials: { username: string; password?: string; securityToken?: string; loginUrl?: string },
  onProgress: (stage: SyncStage, progress: number, log: string) => void
): Promise<MetadataSummary> => {
  
  // 1. Initialize Connection
  onProgress(SyncStage.INIT, 5, "Initializing JSForce Connection...");
  
  // Explicitly check for sandbox URL if username indicates it, to warn user if mismatch
  if (credentials.username.includes('.dev') && (!credentials.loginUrl || credentials.loginUrl.includes('login.salesforce'))) {
      onProgress(SyncStage.INIT, 6, "WARNING: Username suggests Sandbox, but connecting to Production URL. This may fail.");
  }

  const conn = new jsforce.Connection({
    loginUrl: credentials.loginUrl || 'https://login.salesforce.com',
    proxyUrl: PROXY_URL
  });

  try {
    // 2. Login
    onProgress(SyncStage.INIT, 10, `Authenticating as ${credentials.username} to ${credentials.loginUrl || 'Default'}...`);
    const fullPassword = (credentials.password || '') + (credentials.securityToken || '');
    
    // JSForce login sends SOAP request to login endpoint
    await conn.login(credentials.username, fullPassword);
    
    onProgress(SyncStage.INIT, 15, "Authentication Successful. Session established.");
  } catch (err: any) {
    console.error("Login Failed", err);
    let errorMessage = `Salesforce Login Failed: ${err.message}.`;
    
    if (err.message.includes("INVALID_LOGIN")) {
        errorMessage += " \n\nCheck:\n1. Username/Password are correct.\n2. Security Token is appended (if required).\n3. You are connecting to the correct Environment (Production vs Sandbox). Your username indicates you might need 'Sandbox'.";
    } else {
        errorMessage += " Ensure CORS is enabled or Proxy is available.";
    }

    throw new Error(errorMessage);
  }

  // 3. Fetch Objects (Standard & Custom)
  onProgress(SyncStage.OBJECTS, 20, "Describing Global SObjects...");
  let globalDescribe;
  try {
      globalDescribe = await conn.describeGlobal();
  } catch (e: any) {
      throw new Error(`Failed to describe global: ${e.message}`);
  }

  const objectsToFetch = ['Account', 'Opportunity', 'Contact', 'Lead', 'Case']; // Start with core
  // Add some custom objects if found
  const customObjects = globalDescribe.sobjects.filter((o: any) => o.custom).slice(0, 5).map((o: any) => o.name);
  const targetObjects = [...objectsToFetch, ...customObjects];

  onProgress(SyncStage.OBJECTS, 25, `Found ${globalDescribe.sobjects.length} objects. Indexing ${targetObjects.length} key objects...`);

  const fetchedObjects: ObjectDef[] = [];

  for (let i = 0; i < targetObjects.length; i++) {
      const objName = targetObjects[i];
      onProgress(SyncStage.OBJECTS, 25 + Math.floor((i / targetObjects.length) * 10), `Describing ${objName}...`);
      
      try {
          const description = await conn.describe(objName);
          fetchedObjects.push({
              name: description.name,
              label: description.label,
              type: description.custom ? 'Custom' : 'Standard',
              fields: description.fields.map((f: any) => ({
                  name: f.name,
                  label: f.label,
                  type: f.type,
                  length: f.length,
                  required: !f.nillable,
                  helpText: f.inlineHelpText,
                  picklistValues: f.picklistValues?.map((p: any) => p.value)
              })),
              recordTypes: description.recordTypeInfos?.map((rt: any) => ({
                  name: rt.name,
                  developerName: rt.developerName,
                  active: rt.available,
                  businessProcess: rt.master ? 'Master' : undefined
              })) || [],
              relationships: description.fields
                  .filter((f: any) => f.type === 'reference')
                  .map((f: any) => ({
                      name: f.relationshipName,
                      type: 'Lookup', // Simplified
                      relatedTo: f.referenceTo?.[0]
                  }))
          });
      } catch (e) {
          console.warn(`Skipping object ${objName}`, e);
      }
  }

  // 4. Fetch Apex Classes (Tooling API)
  onProgress(SyncStage.APEX, 40, "Querying Apex Classes via Tooling API...");
  const apexRes = await conn.tooling.query("SELECT Id, Name, Body, ApiVersion, Status FROM ApexClass WHERE NamespacePrefix = null LIMIT 50");
  
  const apexClasses: ApexClassDef[] = apexRes.records.map((r: any) => ({
      name: r.Name,
      type: 'Class',
      apiVersion: r.ApiVersion,
      status: r.Status,
      body: r.Body,
      description: 'Fetched from Salesforce Tooling API'
  }));

  // 5. Fetch Triggers
  onProgress(SyncStage.APEX, 50, "Querying Apex Triggers...");
  const triggerRes = await conn.tooling.query("SELECT Id, Name, TableEnumOrId, Body, Status FROM ApexTrigger WHERE NamespacePrefix = null LIMIT 50");
  
  const triggers: ApexTriggerDef[] = triggerRes.records.map((r: any) => ({
      name: r.Name,
      object: r.TableEnumOrId,
      events: ['(Unknown - requires parsing)'],
      body: r.Body,
      status: r.Status
  }));

  // 6. Fetch Flows
  onProgress(SyncStage.FLOWS, 60, "Querying Flow Definitions...");
  // Note: FlowDefinition is deprecated but often easier. Flow object is better in newer API versions.
  // Using Flow object for v59.0+ usually
  const flowRes = await conn.query("SELECT Id, MasterLabel, ProcessType, Description, Status FROM FlowDefinitionView WHERE IsActive = true LIMIT 20");
  
  const flows: FlowDef[] = flowRes.records.map((r: any) => ({
      name: r.MasterLabel.replace(/\s+/g, '_'),
      label: r.MasterLabel,
      type: r.ProcessType === 'Workflow' ? 'Process Builder' : 'Screen Flow', // Approximation
      status: r.Status === 'Active' ? 'Active' : 'Draft',
      description: r.Description,
      nodes: [] // Nodes require retrieving the Metadata blob which is heavy for this demo
  }));

  // 7. Fetch Validation Rules
  onProgress(SyncStage.CONFIG, 75, "Querying Validation Rules...");
  const valRes = await conn.tooling.query("SELECT Id, ValidationName, EntityDefinition.DeveloperName, ErrorMessage, ErrorDisplayField FROM ValidationRule WHERE NamespacePrefix = null LIMIT 50");
  
  const validationRules: ValidationRuleDef[] = valRes.records.map((r: any) => ({
      name: r.ValidationName,
      object: r.EntityDefinition?.DeveloperName || 'Unknown',
      active: true,
      errorCondition: "Fetched from Tooling API",
      errorMessage: r.ErrorMessage
  }));

  // 8. Components (LWC/Aura)
  onProgress(SyncStage.COMPONENTS, 85, "Scanning Lightning Components...");
  const lwcRes = await conn.tooling.query("SELECT Id, DeveloperName, Description, ApiVersion FROM LightningComponentBundle LIMIT 20");
  
  const components: ComponentDef[] = lwcRes.records.map((r: any) => ({
      name: r.DeveloperName,
      type: 'LWC',
      apiVersion: r.ApiVersion,
      description: r.Description
  }));

  // 9. Profiles
  onProgress(SyncStage.CONFIG, 95, "Fetching Profiles...");
  const profileRes = await conn.query("SELECT Id, Name, UserType FROM Profile LIMIT 20");
  const profiles: ProfileDef[] = profileRes.records.map((r: any) => ({
      name: r.Name,
      userLicense: r.UserType,
      custom: r.UserType === 'Custom'
  }));

  onProgress(SyncStage.COMPLETE, 100, "Sync Complete. Index Built.");

  const fullPayload: MetadataSummary = {
      objects: fetchedObjects,
      apexClasses: apexClasses,
      triggers: triggers,
      flows: flows,
      validationRules: validationRules,
      components: components,
      profiles: profiles,
      sharingRules: [], // Sharing rules require Metadata API retrieve call (zip file), skipping for light sync
      permissions: 100,
      fetchedAt: new Date()
  };

  fullPayload.details = fullPayload; // Self-reference for AI context

  return fullPayload;
};
