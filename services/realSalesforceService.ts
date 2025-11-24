
import { MetadataSummary, SyncStage, ObjectDef, FlowDef, ApexClassDef, ValidationRuleDef, ApexTriggerDef, ComponentDef, ProfileDef, SharingRuleDef } from '../types';

// Declare jsforce global since it's loaded via script tag
declare var jsforce: any;

const PROXY_URL = 'http://localhost:8080/';

export const exchangeCodeForToken = async (code: string, clientId: string, clientSecret: string): Promise<{ access_token: string, instance_url: string, refresh_token: string }> => {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', 'http://localhost:3000/oauth/callback');
    params.append('code', code);

    // Use local proxy to bypass CORS on token endpoint
    const tokenUrl = PROXY_URL + 'https://test.salesforce.com/services/oauth2/token';

    console.log('[exchangeCodeForToken] Sending request to:', tokenUrl);
    console.log('[exchangeCodeForToken] Params:', params.toString());

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'http://localhost:3000'
        },
        body: params
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[exchangeCodeForToken] Error Response:', errorText);
        throw new Error(`Token Exchange Failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
};

export const performRealSync = async (
    accessToken: string,
    instanceUrl: string,
    onProgress: (stage: SyncStage, progress: number, log: string) => void,
    refreshToken?: string,
    clientId?: string,
    clientSecret?: string,
    onTokenRefreshed?: (newAccessToken: string) => void
): Promise<MetadataSummary> => {

    // 1. Initialize Connection
    onProgress(SyncStage.INIT, 5, "Initializing JSForce Connection with Access Token...");

    // Determine Connection Mode: OAuth2 or Standard SOAP
    let conn;

    // Manually prepend proxy to instance URL to ensure all requests go through it correctly
    // This avoids issues where jsforce's proxyUrl config doesn't construct the URL as expected for cors-anywhere
    const proxiedInstanceUrl = PROXY_URL + instanceUrl;

    conn = new jsforce.Connection({
        instanceUrl: proxiedInstanceUrl,
        accessToken: accessToken,
        refreshToken: refreshToken,
        version: '57.0', // Enforce newer API version for FlowDefinitionView
        oauth2: (clientId && clientSecret) ? {
            clientId: clientId,
            clientSecret: clientSecret,
            redirectUri: 'http://localhost:3000/oauth/callback'
        } : undefined
        // proxyUrl: PROXY_URL // Removed to rely on manual prefixing
    });

    // Auto-refresh support
    if (onTokenRefreshed) {
        conn.on("refresh", (newAccessToken: string) => {
            console.log("[Token Refresh] New Access Token:", newAccessToken);
            onTokenRefreshed(newAccessToken);
        });
    }

    // Explicitly set instance URL to proxied version
    conn.instanceUrl = proxiedInstanceUrl;

    try {
        // 2. Verify Identity
        onProgress(SyncStage.INIT, 10, `Verifying identity...`);
        const identity = await conn.identity();
        onProgress(SyncStage.INIT, 15, `Authenticated as ${identity.username}. Session established.`);
    } catch (err: any) {
        console.warn("Identity Check Failed", err);
        onProgress(SyncStage.INIT, 15, `Identity check skipped: ${err.message}. Proceeding with token...`);
        // Do not throw, proceed to describeGlobal
    }

    // 3. Fetch Objects (Standard & Custom)
    onProgress(SyncStage.OBJECTS, 20, "Describing Global SObjects...");
    let globalDescribe;
    try {
        globalDescribe = await conn.describeGlobal();
        console.log('[performRealSync] describeGlobal result:', globalDescribe);
    } catch (e: any) {
        throw new Error(`Failed to describe global: ${e.message}`);
    }

    if (!globalDescribe || !globalDescribe.sobjects) {
        console.error('[performRealSync] Invalid describeGlobal response', globalDescribe);
        throw new Error("Failed to retrieve SObject list from Salesforce. Check console logs for details.");
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
    onProgress(SyncStage.APEX, 45, `Retrieved ${apexClasses.length} Apex Classes.`);

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
    onProgress(SyncStage.APEX, 55, `Retrieved ${triggers.length} Apex Triggers.`);

    // 6. Fetch Flows
    onProgress(SyncStage.FLOWS, 60, "Querying Flow Definitions...");
    const flows: FlowDef[] = [];
    try {
        // Using FlowDefinitionView (available in v45.0+)
        // Note: Use 'Label' instead of 'MasterLabel' for FlowDefinitionView
        const flowRes = await conn.query("SELECT Id, Label, ProcessType, Description, IsActive FROM FlowDefinitionView WHERE IsActive = true LIMIT 20");

        flowRes.records.forEach((r: any) => {
            flows.push({
                name: r.Label.replace(/\s+/g, '_'),
                label: r.Label,
                type: r.ProcessType === 'Workflow' ? 'Process Builder' : 'Screen Flow',
                status: r.IsActive ? 'Active' : 'Draft',
                description: r.Description,
                nodes: []
            });
        });
        onProgress(SyncStage.FLOWS, 70, `Retrieved ${flows.length} Flows.`);
    } catch (e: any) {
        console.warn("Flow sync failed", e);
        onProgress(SyncStage.FLOWS, 70, `Flow sync skipped: ${e.message}`);
    }

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
    onProgress(SyncStage.CONFIG, 80, `Retrieved ${validationRules.length} Validation Rules.`);

    // 8. Components (LWC/Aura)
    onProgress(SyncStage.COMPONENTS, 85, "Scanning Lightning Components...");
    const lwcRes = await conn.tooling.query("SELECT Id, DeveloperName, Description, ApiVersion FROM LightningComponentBundle LIMIT 20");

    const components: ComponentDef[] = lwcRes.records.map((r: any) => ({
        name: r.DeveloperName,
        type: 'LWC',
        apiVersion: r.ApiVersion,
        description: r.Description
    }));
    onProgress(SyncStage.COMPONENTS, 90, `Retrieved ${components.length} Lightning Components.`);

    // 9. Profiles
    onProgress(SyncStage.CONFIG, 95, "Fetching Profiles...");
    const profileRes = await conn.query("SELECT Id, Name, UserType FROM Profile LIMIT 20");
    const profiles: ProfileDef[] = profileRes.records.map((r: any) => ({
        name: r.Name,
        userLicense: r.UserType,
        custom: r.UserType === 'Custom'
    }));
    onProgress(SyncStage.CONFIG, 98, `Retrieved ${profiles.length} Profiles.`);

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

    // fullPayload.details = fullPayload; // REMOVED: Causes circular reference error in JSON.stringify

    return fullPayload;
};
