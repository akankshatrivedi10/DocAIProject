import { MetadataSummary, SyncStage, ObjectDef, FlowDef, ApexClassDef, ValidationRuleDef, ApexTriggerDef, ComponentDef, ProfileDef, SharingRuleDef } from '../types';
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
 *
 * Important changes:
 * - API_URL is the server-side route for token exchange and MUST NOT go through proxy.
 * - If running in browser, API_URL resolves to `${window.location.origin}/api/salesforce/exchangeToken`
 *   which maps to your Next.js serverless endpoint in both local & Vercel.
 * - PROXY_URL may be used for direct Salesforce API calls from the browser (jsforce) in local dev,
 *   but token exchange is always server-side and direct.
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
    // If client-side (browser) environment, use window.location.origin so fetch('/api/...') resolves correctly.
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
        // fallback (not cryptographically strong) -- only for non-browser tests
        for (let i = 0; i < array.length; i++) array[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(array, (b) => ('0' + b.toString(16)).slice(-2)).join('');
};

/**
 * Generates a PKCE code challenge from the verifier
 */
export const generateCodeChallenge = async (verifier: string): Promise<string> => {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
        // fallback naive base64 for non-browser tests
        return btoa(verifier).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);

    // Base64Url encode
    const bytes = new Uint8Array(hash);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * Generates the Salesforce Authorization URL for the centralized Connected App
 */
export const getAuthorizationUrl = (codeChallenge?: string, forceEnv?: 'local' | 'prod', clientId?: string): string => {
    const { REDIRECT_URI, loginUrl } = getEnvironmentConfig(forceEnv);

    // 🎯 REQUIREMENT #1: Use Central Connected App (Client ID from test credentials)
    // Allow overriding Client ID for specific orgs/sandboxes
    const CLIENT_ID = clientId || TEST_CREDENTIALS.salesforce.consumerKey || import.meta.env.VITE_SALESFORCE_CONSUMER_KEY;
    const LOGIN_URL = loginUrl || 'https://login.salesforce.com'; // Default to prod login. UI can override for sandbox.

    const params = new URLSearchParams();
    params.append('response_type', 'code');
    params.append('client_id', CLIENT_ID);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('scope', 'api refresh_token openid'); // include openid for id token when needed
    params.append('prompt', 'login consent');

    if (codeChallenge) {
        params.append('code_challenge', codeChallenge);
        params.append('code_challenge_method', 'S256');
    }

    return `${LOGIN_URL}/services/oauth2/authorize?${params.toString()}`;
};

/**
 * Exchanges OAuth code for tokens using the Server-Side API Route
 * 🎯 REQUIREMENT #4: Never expose client_secret to browser
 *
 * Important:
 * - This function POSTS to your server-side endpoint (API_URL). API_URL must be reachable without proxy.
 * - The server endpoint must perform the actual call to Salesforce token endpoint directly.
 */
export const exchangeCodeForToken = async (
    code: string,
    isSandbox: boolean = false,
    customLoginUrl?: string,
    forceEnv?: 'local' | 'prod'
): Promise<SalesforceConnection> => {

    const { API_URL, REDIRECT_URI, envMode } = getEnvironmentConfig(forceEnv);

    // Retrieve PKCE verifier if available
    const codeVerifier = (typeof sessionStorage !== 'undefined')
        ? sessionStorage.getItem('pkce_code_verifier')
        : null;

    console.log(`[OAuth] Exchanging code via ${envMode} API:`, API_URL);

    // Ensure we call our server route directly (do NOT use proxy here).
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier,
            is_sandbox: isSandbox, // server decides login vs test endpoint
            login_url: customLoginUrl || getEnvironmentConfig(forceEnv).loginUrl // 🎯 Pass specific login URL
        })
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '<no body>');
        console.error('[OAuth] Token Exchange Failed:', response.status, response.statusText, errorText);
        throw new Error(`Token Exchange Failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    // Map response to SalesforceConnection interface
    const connection: SalesforceConnection = {
        id: data.id || `conn_${Date.now()}`,
        org_id: data.organization_id || (data.id ? data.id.split('/')[4] : 'unknown'),
        salesforce_org_id: data.organization_id || (data.id ? data.id.split('/')[4] : 'unknown'),
        instance_url: data.instance_url,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        issued_at: data.issued_at ? parseInt(data.issued_at, 10) : Date.now(),
        expires_in: data.expires_in || 7200
    };

    // 🎯 REQUIREMENT #6: Save connection
    try {
        saveSalesforceConnection(connection);
    } catch (e) {
        console.warn('[OAuth] Failed to persist connection locally:', e);
    }

    // Clean up PKCE verifier
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

    // Get existing connections
    const connections = getSalesforceConnections();

    // Update or add
    const index = connections.findIndex(c => c.salesforce_org_id === connection.salesforce_org_id);
    if (index >= 0) {
        connections[index] = connection;
    } else {
        connections.push(connection);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
    // Also save as 'active' connection for backward compatibility
    localStorage.setItem('sf_access_token', connection.access_token);
    localStorage.setItem('sf_instance_url', connection.instance_url);
    if (connection.refresh_token) {
        localStorage.setItem('sf_refresh_token', connection.refresh_token);
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
// 🎯 REQUIREMENT #5: Updated performRealSync
// ============================================================================

/**
 * Helper: safely construct proxied instance URL for local proxies.
 *
 * Some CORS proxies accept a path like: http://localhost:8080/<target-host>/<path>
 * Others expect: http://localhost:8080/https://target/...
 * There is no universal format — ensure your local proxy supports the pattern below.
 *
 * This function attempts a safe approach:
 * - Strip protocol from instanceUrl
 * - Join proxy + stripped host/path with a single slash
 *
 * Example:
 * - instanceUrl = "https://na123.salesforce.com"
 * - returns "http://localhost:8080/na123.salesforce.com"
 *
 * NOTE: If your proxy expects the full URL after the slash (e.g. /https://...), adapt the proxy or this function.
 */
const buildProxiedInstanceUrl = (proxyBase: string, instanceUrl: string) => {
    if (!proxyBase) return instanceUrl;
    // Remove trailing slash from proxyBase
    const proxy = proxyBase.replace(/\/+$/, '');

    // 🎯 FIX: Do NOT strip protocol. cors-anywhere expects /https://target.com
    // So we just append the full instanceUrl (without trailing slash) to the proxy base
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

    onProgress(SyncStage.INIT, 5, `[${envMode.toUpperCase()}] Initializing JSForce Connection...`);

    // 🎯 REQUIREMENT #5: Support proxy only in local mode and build it safely
    const proxiedInstanceUrl = PROXY_URL
        ? buildProxiedInstanceUrl(PROXY_URL, instanceUrl)
        : instanceUrl;

    console.log(`[Sync] Using instance URL: ${proxiedInstanceUrl}`);

    const conn = new jsforce.Connection({
        instanceUrl: proxiedInstanceUrl,
        accessToken: accessToken,
        version: '57.0',
        // Do not set proxyUrl here to avoid double-prefixing; we control the instanceUrl above.
        proxyUrl: undefined
    });

    if (onTokenRefreshed) {
        conn.on("refresh", (newAccessToken: string) => {
            console.log("[Token Refresh] New Access Token:", newAccessToken);
            onTokenRefreshed(newAccessToken);
        });
    }

    try {
        // 2. Verify Identity
        onProgress(SyncStage.INIT, 10, `Verifying identity...`);
        const identity = await conn.identity();
        onProgress(SyncStage.INIT, 15, `Authenticated as ${identity.username}.`);
    } catch (err: any) {
        console.warn("Identity Check Failed", err);
        onProgress(SyncStage.INIT, 15, `Identity check skipped. Proceeding...`);
    }

    // 3. Fetch Objects (Standard & Custom)
    onProgress(SyncStage.OBJECTS, 20, "Describing Global SObjects...");
    let globalDescribe;
    try {
        globalDescribe = await conn.describeGlobal();
    } catch (e: any) {
        console.error("describeGlobal failed details:", JSON.stringify(e, null, 2));
        throw new Error(`Failed to describe global: ${e.message || JSON.stringify(e)}`);
    }

    if (!globalDescribe || !globalDescribe.sobjects) {
        throw new Error("Failed to retrieve SObject list.");
    }

    const objectsToFetch = ['Account', 'Opportunity', 'Contact', 'Lead', 'Case'];
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
                        type: 'Lookup',
                        relatedTo: f.referenceTo?.[0]
                    }))
            });
        } catch (e) {
            console.warn(`Skipping object ${objName}`, e);
        }
    }

    // 4. Fetch Apex Classes
    onProgress(SyncStage.APEX, 40, "Querying Apex Classes...");
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
        events: ['(Unknown)'],
        body: r.Body,
        status: r.Status
    }));

    // 6. Fetch Flows
    onProgress(SyncStage.FLOWS, 60, "Querying Flows...");
    const flows: FlowDef[] = [];
    try {
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
    } catch (e) {
        console.warn("Flow sync skipped");
    }

    // 7. Validation Rules
    onProgress(SyncStage.CONFIG, 75, "Querying Validation Rules...");
    const valRes = await conn.tooling.query("SELECT Id, ValidationName, EntityDefinition.DeveloperName, ErrorMessage FROM ValidationRule WHERE NamespacePrefix = null LIMIT 50");
    const validationRules: ValidationRuleDef[] = valRes.records.map((r: any) => ({
        name: r.ValidationName,
        object: r.EntityDefinition?.DeveloperName || 'Unknown',
        active: true,
        errorCondition: "Fetched from Tooling API",
        errorMessage: r.ErrorMessage
    }));

    // 8. Components
    onProgress(SyncStage.COMPONENTS, 85, "Scanning Components...");
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

    onProgress(SyncStage.COMPLETE, 100, "Sync Complete.");

    return {
        objects: fetchedObjects,
        apexClasses,
        triggers,
        flows,
        validationRules,
        components,
        profiles,
        sharingRules: [],
        permissions: 100,
        fetchedAt: new Date()
    };
};
