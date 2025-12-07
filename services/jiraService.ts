import { ENV_CONFIG } from '../config/envConfig';

export interface JiraStory {
    id: string;
    key: string;
    title: string;
    description: string;
    acceptanceCriteria: string;
    status: string;
    epic?: string;
    projectKey: string;
}

export interface JiraProject {
    key: string;
    name: string;
    id: string;
}

const getStoredConnectionId = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('jira_connection_id');
};

/**
 * Helper to construct Proxy URL based on environment
 */
const getProxyApiUrl = (targetPath: string): string => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Target Path: e.g., /rest/api/3/project
    // API Route: /api/jira/proxy?path=...

    if (isLocal) {
        return `http://localhost:8080/api/jira/proxy?path=${encodeURIComponent(targetPath)}`;
    } else {
        return `/api/jira/proxy?path=${encodeURIComponent(targetPath)}`;
    }
};

/**
 * Authenticate with Jira - Decommissioned for OAuth 2.0
 */
export const authenticateJira = async (domain: string, email: string, token: string): Promise<boolean> => {
    console.warn("Legacy Auth called. Use OAuth 2.0 flow.");
    return false;
};

/**
 * Fetch accessible projects via OAuth Proxy
 */
export const getJiraProjects = async (): Promise<JiraProject[]> => {
    const connectionId = getStoredConnectionId();
    if (!connectionId) throw new Error("No Jira connection found. Please connect via Integration settings.");

    const proxyUrl = getProxyApiUrl('/rest/api/3/project');

    try {
        const response = await fetch(proxyUrl, {
            headers: {
                'Accept': 'application/json',
                'X-Jira-Connection-Id': connectionId
            }
        });

        if (response.status === 401) {
            // Token expired or invalid
            throw new Error("Jira Session Expired. Please reconnect.");
        }

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
    const connectionId = getStoredConnectionId();
    if (!connectionId) throw new Error("No Jira connection found.");

    // JQL Construction
    let jql = `project = "${projectKey}" AND issuetype in (Story, Epic, Task, Bug)`;
    if (searchQuery) {
        jql += ` AND (summary ~ "${searchQuery}" OR description ~ "${searchQuery}")`;
    }
    jql += ' ORDER BY created DESC';

    const targetPath = `/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=summary,description,status,issuetype,parent`;
    const proxyUrl = getProxyApiUrl(targetPath);

    try {
        const response = await fetch(proxyUrl, {
            headers: {
                'Accept': 'application/json',
                'X-Jira-Connection-Id': connectionId
            }
        });
        if (!response.ok) throw new Error(`Failed to search stories: ${response.statusText}`);

        const data = await response.json();
        const issues = data.issues || [];

        return issues.map((i: any) => ({
            id: i.id,
            key: i.key,
            projectKey,
            title: i.fields.summary,
            description: parseADF(i.fields.description),
            status: i.fields.status?.name || 'Unknown',
            acceptanceCriteria: '',
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
