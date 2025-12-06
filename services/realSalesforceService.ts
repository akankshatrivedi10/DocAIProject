import { MetadataSummary, SyncStage, ObjectDef, FlowDef, ApexClassDef, ValidationRuleDef, ApexTriggerDef, ComponentDef, ProfileDef, SharingRuleDef, PageLayoutDef, FieldDef, RecordTypeDef } from '../types';
import { TEST_CREDENTIALS } from './testCredentials';

// Declare jsforce global since it's loaded via script tag
declare var jsforce: any;

// ============================================================================
// 🎯 REQUIREMENT #6: Persistent Storage Interfaces
// ============================================================================

export interface SalesforceConnection {
    id: string;
    org_id: string;
    salesforce_org_id: string;
    instance_url: string;
    access_token: string;
    refresh_token: string;
    issued_at: number;
    expires_in: number; // Seconds
    connectedAt: string; // ISO 8601
    lastUsedAt?: string; // ISO 8601
}

// ============================================================================
// 🎯 REQUIREMENT #1 & #3: Environment & Configuration
// ============================================================================

/**
 * Detects whether the app is running locally or in production (client-side)
 */
const detectLocalEnvironment = (): boolean => {
    try {
        if (typeof window !== 'undefined' && window.location) {
            const host = window.location.host || '';
            return host.includes('localhost') || host.startsWith('127.0.0.1');
        }
    } catch (e) {
        // ignore
    }
    return false;
};

import { getStoredEnvironment, ENV_CONFIG } from '../config/envConfig';

/**
 * Gets the runtime environment configuration
 */
const getEnvironmentConfig = (forceEnv?: 'local' | 'prod') => {
    // Check stored preference first
    const storedEnv = getStoredEnvironment(); // e.g., 'LOCALHOST' or 'PROD'

    // Determine mode: forceEnv > storedEnv > detection
    let isLocal: boolean;
    if (forceEnv) {
        isLocal = forceEnv === 'local';
    } else if (storedEnv) {
        isLocal = storedEnv.toUpperCase() === 'LOCALHOST';
    } else {
        isLocal = detectLocalEnvironment();
    }

    const envMode: 'local' | 'prod' = isLocal ? 'local' : 'prod';
    // pick config: LOCALHOST config expected to contain apiUrl and redirectUri
    const config = isLocal ? ENV_CONFIG.LOCALHOST : ENV_CONFIG.TEST_SERVER;

    // 🎯 REQUIREMENT #3: Environment-Aware Redirect
    const REDIRECT_URI = config.redirectUri;

    // 🎯 REQUIREMENT #5: Proxy usage (Local or Prod via Vercel)
    const PROXY_URL = config.apiUrl ? config.apiUrl.replace(/\/+$/, '') : '';

    // 🎯 REQUIREMENT #4: Server-Side Token Exchange Route (must not go through proxy)
    const API_URL = (typeof window !== 'undefined')
        ? `${window.location.origin}/api/salesforce/exchangeToken`
        : '/api/salesforce/exchangeToken'; // server-side fallback

    return {
        envMode,
        isLocal,
        REDIRECT_URI,
        PROXY_URL,
        API_URL,
        loginUrl: config.loginUrl
    };
};

// ============================================================================
// 🎯 REQUIREMENT #2: Multi-Tenant OAuth2 Web Server Flow (with PKCE)
// ============================================================================

/**
 * Generates a random PKCE code verifier
 */
export const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(array);
    } else {
        for (let i = 0; i < array.length; i++) array[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(array, (b) => ('0' + b.toString(16)).slice(-2)).join('');
};

/**
 * Generates a PKCE code challenge from the verifier
 */
export const generateCodeChallenge = async (verifier: string): Promise<string> => {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
        return btoa(verifier).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(hash);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * Generates the Salesforce Authorization URL
 */
export const getAuthorizationUrl = (codeChallenge?: string, forceEnv?: 'local' | 'prod', clientId?: string): string => {
    const { REDIRECT_URI, loginUrl } = getEnvironmentConfig(forceEnv);

    // 🎯 REQUIREMENT #1: Use Central Connected App (Client ID from test credentials)
    const CLIENT_ID = clientId || TEST_CREDENTIALS.salesforce.consumerKey || import.meta.env.VITE_SALESFORCE_CONSUMER_KEY;
    const LOGIN_URL = loginUrl || 'https://login.salesforce.com';

    const params = new URLSearchParams();
    params.append('response_type', 'code');
    params.append('client_id', CLIENT_ID);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('scope', 'api refresh_token openid');
    params.append('prompt', 'login consent');

    if (codeChallenge) {
        params.append('code_challenge', codeChallenge);
        params.append('code_challenge_method', 'S256');
    }

    return `${LOGIN_URL}/services/oauth2/authorize?${params.toString()}`;
};

/**
 * Exchanges OAuth code for tokens
 */
export const exchangeCodeForToken = async (
    code: string,
    isSandbox: boolean = false,
    customLoginUrl?: string,
    forceEnv?: 'local' | 'prod'
): Promise<SalesforceConnection> => {

    const { API_URL, REDIRECT_URI, envMode } = getEnvironmentConfig(forceEnv);

    const codeVerifier = (typeof sessionStorage !== 'undefined')
        ? sessionStorage.getItem('pkce_code_verifier')
        : null;

    console.log(`[OAuth] Exchanging code via ${envMode} API:`, API_URL);

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier,
            is_sandbox: isSandbox,
            login_url: customLoginUrl || getEnvironmentConfig(forceEnv).loginUrl
        })
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '<no body>');
        console.error('[OAuth] Token Exchange Failed:', response.status, response.statusText, errorText);
        throw new Error(`Token Exchange Failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    const connection: SalesforceConnection = {
        id: data.id || `conn_${Date.now()}`,
        org_id: data.organization_id || (data.id ? data.id.split('/')[4] : 'unknown'),
        salesforce_org_id: data.organization_id || (data.id ? data.id.split('/')[4] : 'unknown'),
        instance_url: data.instance_url,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        issued_at: data.issued_at ? parseInt(data.issued_at, 10) : Date.now(),
        expires_in: data.expires_in || 7200,
        connectedAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString()
    };

    try {
        saveSalesforceConnection(connection);
    } catch (e) {
        console.warn('[OAuth] Failed to persist connection locally:', e);
    }

    if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('pkce_code_verifier');
    }

    return connection;
};

// ============================================================================
// 🎯 REQUIREMENT #6: Helper Functions
// ============================================================================

const STORAGE_KEY = 'docbot_sf_connections';

export const saveSalesforceConnection = (connection: SalesforceConnection) => {
    if (typeof window === 'undefined') return;
    const connections = getSalesforceConnections();
    const index = connections.findIndex(c => c.salesforce_org_id === connection.salesforce_org_id);
    if (index >= 0) {
        connections[index] = connection;
    } else {
        connections.push(connection);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));

    // Auto-update active context if this is the first one or specifically requested
    if (connections.length === 1) {
        setActiveConnection(connection.salesforce_org_id);
    }
};

export const setActiveConnection = (orgId: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('docbot_active_org_id', orgId);

    // Update lastUsedAt
    const connections = getSalesforceConnections();
    const connIndex = connections.findIndex(c => c.salesforce_org_id === orgId);
    if (connIndex >= 0) {
        connections[connIndex].lastUsedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));

        // Update legacy keys for backward compatibility
        localStorage.setItem('sf_access_token', connections[connIndex].access_token);
        localStorage.setItem('sf_instance_url', connections[connIndex].instance_url);
        if (connections[connIndex].refresh_token) {
            localStorage.setItem('sf_refresh_token', connections[connIndex].refresh_token);
        }
    }
};

export const getActiveConnectionId = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('docbot_active_org_id');
};

export const getActiveConnection = (): SalesforceConnection | undefined => {
    const activeId = getActiveConnectionId();
    if (!activeId) return undefined;
    return getSalesforceConnectionByOrg(activeId);
};

export const removeConnection = (orgId: string) => {
    if (typeof window === 'undefined') return;
    let connections = getSalesforceConnections();
    connections = connections.filter(c => c.salesforce_org_id !== orgId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));

    // If we removed the active one, switch to another or clear
    if (getActiveConnectionId() === orgId) {
        if (connections.length > 0) {
            // Switch to most recently used
            connections.sort((a, b) => {
                const timeA = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
                const timeB = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
                return timeB - timeA;
            });
            setActiveConnection(connections[0].salesforce_org_id);
        } else {
            localStorage.removeItem('docbot_active_org_id');
            localStorage.removeItem('sf_access_token');
            localStorage.removeItem('sf_instance_url');
            localStorage.removeItem('sf_refresh_token');
        }
    }
};

export const getSalesforceConnections = (): SalesforceConnection[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const getSalesforceConnectionByOrg = (orgId: string): SalesforceConnection | undefined => {
    const connections = getSalesforceConnections();
    return connections.find(c => c.salesforce_org_id === orgId);
};

// ============================================================================
// 🎯 METADATA FETCHING HELPERS (Pagination & Robustness)
// ============================================================================

const queryAll = async (conn: any, soql: string, isTooling: boolean = false): Promise<any[]> => {
    let records: any[] = [];
    let done = false;
    let nextRecordsUrl: string | undefined;

    // Initial Query
    const res = isTooling ? await conn.tooling.query(soql) : await conn.query(soql);
    records = [...res.records];
    done = res.done;
    nextRecordsUrl = res.nextRecordsUrl;

    // Follow pagination
    while (!done && nextRecordsUrl) {
        console.log(`[Sync] Fetching next batch: ${nextRecordsUrl}`);
        // JSForce typically handles nextRecordsUrl if using queryMore, but let's manual for explicit control if needed.
        // Or simply use autoFetch if we trusted it, but manual ensure loop safety.
        const nextRes = await (isTooling ? conn.tooling.queryMore(nextRecordsUrl) : conn.queryMore(nextRecordsUrl));
        records = [...records, ...nextRes.records];
        done = nextRes.done;
        nextRecordsUrl = nextRes.nextRecordsUrl;
    }
    return records;
};

// ============================================================================
// 🎯 METADATA ENGINE
// ============================================================================

const buildProxiedInstanceUrl = (proxyBase: string, instanceUrl: string) => {
    if (!proxyBase) return instanceUrl;
    const proxy = proxyBase.replace(/\/+$/, '');
    return `${proxy}/${instanceUrl.replace(/\/+$/, '')}`;
};

export const performRealSync = async (
    accessToken: string,
    instanceUrl: string,
    onProgress: (stage: SyncStage, progress: number, log: string) => void,
    refreshToken?: string,
    onTokenRefreshed?: (newAccessToken: string) => void,
    forceEnv?: 'local' | 'prod'
): Promise<MetadataSummary> => {

    const { PROXY_URL, envMode } = getEnvironmentConfig(forceEnv);

    onProgress(SyncStage.INIT, 5, `[${envMode.toUpperCase()}] Initializing connection...`);

    const proxiedInstanceUrl = PROXY_URL
        ? buildProxiedInstanceUrl(PROXY_URL, instanceUrl)
        : instanceUrl;

    console.log(`[Sync] Using instance URL: ${proxiedInstanceUrl}`);

    const conn = new jsforce.Connection({
        instanceUrl: proxiedInstanceUrl,
        accessToken: accessToken,
        version: '57.0',
        proxyUrl: undefined
    });

    if (onTokenRefreshed) {
        conn.on("refresh", (newAccessToken: string) => {
            console.log("[Token Refresh] New Access Token:", newAccessToken);
            onTokenRefreshed(newAccessToken);
        });
    }

    // 2. Verify Identity
    try {
        onProgress(SyncStage.INIT, 10, `Verifying identity...`);
        const identity = await conn.identity();
        onProgress(SyncStage.INIT, 15, `Authenticated as ${identity.username}.`);
    } catch (err: any) {
        console.warn("Identity Check Failed", err);
        onProgress(SyncStage.INIT, 15, `Identity check skipped. Proceeding...`);
    }

    // -------------------------------------------------------------------------
    // 3. FETCH OBJECTS (Standard & Custom)
    // -------------------------------------------------------------------------
    onProgress(SyncStage.OBJECTS, 20, "Describing Global SObjects...");
    let sobjects: any[] = [];
    try {
        const describeGlobal = await conn.describeGlobal();
        sobjects = describeGlobal.sobjects;
    } catch (e: any) {
        console.error("describeGlobal failed:", e);
        throw new Error(`Failed to describe global: ${e.message || JSON.stringify(e)}`);
    }

    const fetchedObjects: ObjectDef[] = [];
    // Filter objects: Standard (common ones) + All Custom Objects. Limit standard to avoid clutter.
    const standardAllowList = ['Account', 'Contact', 'Opportunity', 'Lead', 'Case', 'User', 'Task', 'Event', 'Campaign', 'Product2', 'Pricebook2'];
    const targets = sobjects.filter(o =>
        (standardAllowList.includes(o.name)) ||
        (o.custom === true)
    );

    onProgress(SyncStage.OBJECTS, 25, `Found ${sobjects.length} total. Indexing ${targets.length} relevant objects...`);

    for (let i = 0; i < targets.length; i++) {
        const objName = targets[i].name;
        // Update progress every 5 items to reduce spam
        if (i % 5 === 0) {
            onProgress(SyncStage.OBJECTS, 25 + Math.floor((i / targets.length) * 15), `Describing ${objName} (${i + 1}/${targets.length})...`);
        }

        try {
            const d = await conn.describe(objName);
            fetchedObjects.push({
                name: d.name,
                label: d.label,
                type: d.custom ? 'Custom' : 'Standard',
                custom: d.custom,
                keyPrefix: d.keyPrefix,
                fields: d.fields.map((f: any) => ({
                    name: f.name,
                    label: f.label,
                    type: f.type,
                    length: f.length,
                    precision: f.precision,
                    scale: f.scale,
                    digits: f.digits,
                    required: !f.nillable && !f.defaultedOnCreate,
                    nillable: f.nillable,
                    formula: f.calculatedFormula,
                    defaultValue: typeof f.defaultValue === 'object' ? JSON.stringify(f.defaultValue) : String(f.defaultValue),
                    helpText: f.inlineHelpText,
                    picklistValues: f.picklistValues?.map((p: any) => p.value),
                    referenceTo: f.referenceTo,
                    relationshipName: f.relationshipName,
                    isCalculated: f.calculated
                })),
                recordTypes: d.recordTypeInfos?.map((rt: any) => ({
                    name: rt.name,
                    developerName: rt.developerName,
                    active: rt.available,
                    businessProcess: rt.master ? 'Master' : undefined
                })) || [],
                relationships: d.fields
                    .filter((f: any) => f.type === 'reference')
                    .map((f: any) => ({
                        name: f.relationshipName,
                        type: 'Lookup',
                        relatedTo: f.referenceTo?.[0]
                    })),
                childRelationships: d.childRelationships?.map((cr: any) => ({
                    field: cr.field,
                    childSObject: cr.childSObject,
                    relationshipName: cr.relationshipName,
                    cascadeDelete: cr.cascadeDelete
                })) || []
            });
        } catch (e) {
            console.warn(`Failed to describe object ${objName}`, e);
        }
    }

    // -------------------------------------------------------------------------
    // 4. FETCH APEX CLASSESS
    // -------------------------------------------------------------------------
    onProgress(SyncStage.APEX, 45, "Querying Apex Classes...");
    let apexClasses: ApexClassDef[] = [];
    try {
        const records = await queryAll(conn, "SELECT Id, Name, Body, ApiVersion, Status FROM ApexClass WHERE NamespacePrefix = null", true);
        apexClasses = records.map((r: any) => ({
            name: r.Name,
            type: 'Class',
            apiVersion: r.ApiVersion,
            status: r.Status,
            body: r.Body,
            description: 'Fetched from Tooling API'
        }));
    } catch (e) {
        console.error("Apex sync failed:", e);
    }

    // -------------------------------------------------------------------------
    // 5. FETCH APEX TRIGGERS
    // -------------------------------------------------------------------------
    onProgress(SyncStage.APEX, 55, "Querying Apex Triggers...");
    let triggers: ApexTriggerDef[] = [];
    try {
        const records = await queryAll(conn, "SELECT Id, Name, TableEnumOrId, Body, Status FROM ApexTrigger WHERE NamespacePrefix = null", true);
        triggers = records.map((r: any) => ({
            name: r.Name,
            object: r.TableEnumOrId,
            events: ['(Unknown)'], // Parsing requires regex on Body
            body: r.Body,
            status: r.Status
        }));
    } catch (e) {
        console.error("Trigger sync failed:", e);
    }

    // -------------------------------------------------------------------------
    // 6. FETCH FLOWS
    // -------------------------------------------------------------------------
    onProgress(SyncStage.FLOWS, 65, "Querying Flows...");
    let flows: FlowDef[] = [];
    try {
        // First try FlowDefinitionView (REST API)
        const records = await queryAll(conn, "SELECT Id, Label, ProcessType, Description, IsActive, ApiName FROM FlowDefinitionView WHERE IsActive = true");

        // For each flow, we might want newer FlowVersionView or Tooling API for body, 
        // but FlowDefinitionView gives high level info.
        // Let's try to get Flow metadata for details if possible for a few.
        // Warning: Metadata calls are heavy.

        flows = records.map((r: any) => ({
            name: r.ApiName || r.Label.replace(/\s+/g, '_'),
            label: r.Label,
            type: r.ProcessType === 'Workflow' ? 'Workflow' : (r.ProcessType === 'Flow' ? 'Screen Flow' : r.ProcessType),
            status: r.IsActive ? 'Active' : 'Draft',
            description: r.Description,
            nodes: [] // Nodes would require retrieving Metadata XML
        }));
    } catch (e) {
        console.warn("Flow sync skipped/failed:", e);
    }

    // -------------------------------------------------------------------------
    // 7. FETCH VALIDATION RULES
    // -------------------------------------------------------------------------
    onProgress(SyncStage.CONFIG, 75, "Querying Validation Rules...");
    let validationRules: ValidationRuleDef[] = [];
    try {
        const records = await queryAll(conn, "SELECT Id, ValidationName, EntityDefinition.DeveloperName, ErrorMessage, Description FROM ValidationRule WHERE NamespacePrefix = null", true);
        validationRules = records.map((r: any) => ({
            name: r.ValidationName,
            object: r.EntityDefinition?.DeveloperName || 'Unknown',
            active: true,
            errorCondition: "Fetched from Tooling API",
            errorMessage: r.ErrorMessage
        }));
    } catch (e) {
        console.warn("Validation Rule sync failed:", e);
    }

    // -------------------------------------------------------------------------
    // 8. FETCH LWC / AURA
    // -------------------------------------------------------------------------
    onProgress(SyncStage.COMPONENTS, 80, "Scanning Lightning Components...");
    let components: ComponentDef[] = [];
    try {
        const records = await queryAll(conn, "SELECT Id, DeveloperName, Description, ApiVersion FROM LightningComponentBundle", true);
        components = records.map((r: any) => ({
            name: r.DeveloperName,
            type: 'LWC',
            apiVersion: r.ApiVersion,
            description: r.Description
        }));
    } catch (e) {
        console.warn("LWC sync failed:", e);
    }

    // -------------------------------------------------------------------------
    // 9. FETCH PROFILES
    // -------------------------------------------------------------------------
    onProgress(SyncStage.CONFIG, 90, "Fetching Profiles...");
    let profiles: ProfileDef[] = [];
    try {
        const records = await queryAll(conn, "SELECT Id, Name, UserType FROM Profile");
        profiles = records.map((r: any) => ({
            name: r.Name,
            userLicense: r.UserType,
            custom: r.UserType === 'Custom'
        }));
    } catch (e) {
        console.warn("Profile sync failed:", e);
    }

    // -------------------------------------------------------------------------
    // 10. FETCH PAGE LAYOUTS (Sample)
    // -------------------------------------------------------------------------
    onProgress(SyncStage.CONFIG, 95, "Fetching Page Layouts...");
    let layouts: PageLayoutDef[] = [];
    try {
        // Layouts are hard to query via SOQL efficiently for details without Metadata API
        // We will just list them from Tooling API for now
        const records = await queryAll(conn, "SELECT Id, Name, TableEnumOrId FROM Layout", true);
        layouts = records.slice(0, 50).map((r: any) => ({
            name: r.Name,
            label: r.Name,
            objectType: r.TableEnumOrId,
            sections: []
        }));
    } catch (e) {
        console.warn("Layout sync failed:", e);
    }

    onProgress(SyncStage.COMPLETE, 100, "Sync Complete.");

    return {
        objects: fetchedObjects,
        apexClasses,
        triggers,
        flows,
        validationRules,
        components,
        profiles,
        layouts,
        sharingRules: [], // Sharing Rules require Metadata API retrieval (Zip) usually
        permissions: 100,
        fetchedAt: new Date()
    };
};
