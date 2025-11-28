import { ConnectionStatus } from '../types';

export interface JiraStory {
    id: string;
    key: string;
    title: string;
    description: string;
    acceptanceCriteria: string;
    status: string;
    epic?: string;
}

export interface JiraProject {
    key: string;
    name: string;
}

// Mock data for simulation
const MOCK_PROJECTS: JiraProject[] = [
    { key: 'PROJ', name: 'Core Platform' },
    { key: 'MOB', name: 'Mobile App' },
    { key: 'API', name: 'API Gateway' }
];

const MOCK_STORIES: Record<string, JiraStory[]> = {
    'PROJ': [
        {
            id: '10001',
            key: 'PROJ-1234',
            title: 'Implement Lead Conversion Flow',
            description: 'As a Sales Rep, I need to convert Leads to Opportunities with specific mapping rules so that data integrity is maintained.',
            acceptanceCriteria: '- Lead Status must be "Qualified" before conversion\n- Opportunity Amount must be calculated based on Lead Score\n- Contact must be created if not exists',
            status: 'In Progress',
            epic: 'PROJ-1000'
        },
        {
            id: '10002',
            key: 'PROJ-1235',
            title: 'Automate Opportunity Stage Updates',
            description: 'Automatically update Opportunity Stage to "Negotiation" when a Quote is approved.',
            acceptanceCriteria: '- Trigger on Quote Status Change\n- Update Opp Stage\n- Send Email Notification',
            status: 'To Do',
            epic: 'PROJ-1000'
        }
    ],
    'MOB': [
        {
            id: '20001',
            key: 'MOB-55',
            title: 'Login Screen Redesign',
            description: 'Update the login screen to match the new design system.',
            acceptanceCriteria: '- Use new color palette\n- Add biometric login option',
            status: 'Done'
        }
    ]
};

export const authenticateJira = async (domain: string, email: string, token: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(() => {
            if (domain && email && token) {
                resolve(true);
            } else {
                resolve(false);
            }
        }, 1500);
    });
};

export const getJiraProjects = async (): Promise<JiraProject[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_PROJECTS), 500);
    });
};

export const getJiraStories = async (projectKey: string): Promise<JiraStory[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_STORIES[projectKey] || []), 500);
    });
};
