import { ENV_CONFIG } from '../config/envConfig';

export interface JiraStory {
    id: string;
    key: string;
    title: string;
    description: string;
    acceptanceCriteria: string; // Often custom field or description
    status: string;
    epic?: string;
    projectKey: string;
}

export interface JiraProject {
    key: string;
    name: string;
    id: string;
}

// Credentials Cache (in-memory) - synced with App.tsx via UI but good to have handy
let cachedCreds: { domain: string, email: string, token: string } | null = null;
const CRED_STORAGE_KEY = 'jira_credentials';

const getCredentials = () => {
    if (cachedCreds) return cachedCreds;
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(CRED_STORAGE_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
};

/**
 * Helper to construct Proxy URL based on environment
 */
const getProxyUrl = (targetUrl: string): string => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocal) {
        // Localhost: http://localhost:8080/https://domain...
        return `${ENV_CONFIG.LOCALHOST.apiUrl}/${targetUrl}`;
    } else {
        // Production: /api/proxy?proxyUrl=https://domain...
        // Ensure proxyUrl is encoded
        return `/api/proxy?proxyUrl=${encodeURIComponent(targetUrl)}`;
    }
};

/**
 * Authenticate with Jira by calling /myself
 */
export const authenticateJira = async (domain: string, email: string, token: string): Promise<boolean> => {
    // Normalize domain
    let cleanDomain = domain.replace(/https?:\/\//, '').replace(/\/$/, '');
    if (!cleanDomain.includes('.')) cleanDomain += '.atlassian.net'; // Fallback convenience

    const targetUrl = `https://${cleanDomain}/rest/api/3/myself`;
    const proxyUrl = getProxyUrl(targetUrl);

    // Basic Auth
    const authHeader = 'Basic ' + btoa(`${email}:${token}`);

    try {
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (response.status === 200) {
            // Success! Save credentials
            const creds = { domain: cleanDomain, email, token };
            cachedCreds = creds;
            localStorage.setItem(CRED_STORAGE_KEY, JSON.stringify(creds));
            return true;
        } else {
            console.warn('Jira Auth Failed:', response.status, await response.text());
            return false;
        }
    } catch (e) {
        console.error('Jira Auth Error:', e);
        return false;
    }
};

/**
 * Fetch accessible projects
 */
export const getJiraProjects = async (): Promise<JiraProject[]> => {
    const creds = getCredentials();
    if (!creds) throw new Error("Not authenticated with Jira");

    const targetUrl = `https://${creds.domain}/rest/api/3/project`;
    const proxyUrl = getProxyUrl(targetUrl);
    const authHeader = 'Basic ' + btoa(`${creds.email}:${creds.token}`);

    try {
        const response = await fetch(proxyUrl, {
            headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`Failed to fetch projects: ${response.statusText}`);

        const data = await response.json();
        return data.map((p: any) => ({
            key: p.key,
            name: p.name,
            id: p.id
        }));
    } catch (e) {
        console.error("getJiraProjects failed", e);
        return [];
    }
};

/**
 * Search stories (Issues of type 'Story' or similar) in a project
 */
export const searchJiraStories = async (
    projectKey: string,
    searchQuery: string = '',
    maxResults: number = 50
): Promise<JiraStory[]> => {
    const creds = getCredentials();
    if (!creds) throw new Error("Not authenticated with Jira");

    // JQL Construction
    // Default to type in (Story, Epic, Task) because strict "Story" might miss things user cares about
    let jql = `project = "${projectKey}" AND issuetype in (Story, Epic, Task, Bug)`;
    if (searchQuery) {
        jql += ` AND (summary ~ "${searchQuery}" OR description ~ "${searchQuery}")`;
    }
    jql += ' ORDER BY created DESC';

    const targetUrl = `https://${creds.domain}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=summary,description,status,issuetype,parent`;
    const proxyUrl = getProxyUrl(targetUrl);
    const authHeader = 'Basic ' + btoa(`${creds.email}:${creds.token}`);

    try {
        const response = await fetch(proxyUrl, {
            headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`Failed to search stories: ${response.statusText}`);

        const data = await response.json();
        const issues = data.issues || [];

        return issues.map((i: any) => ({
            id: i.id,
            key: i.key,
            projectKey,
            title: i.fields.summary,
            // Jira description is complex (ADF). Simple fallback to string if possible or "Complex Content"
            description: parseADF(i.fields.description),
            status: i.fields.status?.name || 'Unknown',
            acceptanceCriteria: '', // Custom field logic omitted for simplicity, can iterate later
            epic: i.fields.parent?.key
        }));
    } catch (e) {
        console.error("searchJiraStories failed", e);
        return [];
    }
};

// Simplified Atlassian Document Format parser fallback
const parseADF = (desc: any): string => {
    if (!desc) return '';
    if (typeof desc === 'string') return desc;
    if (desc.type === 'doc' && desc.content) {
        return desc.content.map((block: any) => {
            if (block.type === 'paragraph' && block.content) {
                return block.content.map((c: any) => c.text).join('');
            }
            return '';
        }).join('\n');
    }
    return 'Detailed description available in Jira.';
};
