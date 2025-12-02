import { User, UserRole, SystemRole } from '../types';

export interface OnboardingArticle {
    id: string;
    title: string;
    category: 'Process' | 'Product' | 'Sales Skills' | 'Tools';
    content: string;
    author: string;
    lastUpdated: Date;
    tags: string[];
}

// Mock Data
let MOCK_ARTICLES: OnboardingArticle[] = [
    {
        id: '1',
        title: 'Sales Process Overview',
        category: 'Process',
        content: 'Our sales process consists of 5 stages: Lead Qualification, Discovery, Solution Presentation, Negotiation, and Closing. Each stage has specific exit criteria...',
        author: 'Sarah Smith (GTM Lead)',
        lastUpdated: new Date('2025-11-15'),
        tags: ['process', 'stages', 'qualification']
    },
    {
        id: '2',
        title: 'Product Value Proposition',
        category: 'Product',
        content: 'DocBot helps engineering teams automate documentation. Key value props: 1. Time savings (50%), 2. Accuracy (direct from metadata), 3. Compliance...',
        author: 'Mike Johnson (Admin)',
        lastUpdated: new Date('2025-11-20'),
        tags: ['value', 'pitch', 'product']
    },
    {
        id: '3',
        title: 'CRM Best Practices',
        category: 'Tools',
        content: 'Always log calls within 24 hours. Ensure Opportunity fields are updated weekly. Use the "Next Steps" field to drive accountability...',
        author: 'Sarah Smith (GTM Lead)',
        lastUpdated: new Date('2025-11-25'),
        tags: ['crm', 'salesforce', 'hygiene']
    }
];

export const getArticles = async (): Promise<OnboardingArticle[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...MOCK_ARTICLES];
};

export const searchArticles = async (query: string): Promise<OnboardingArticle[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowerQuery = query.toLowerCase();
    return MOCK_ARTICLES.filter(a =>
        a.title.toLowerCase().includes(lowerQuery) ||
        a.content.toLowerCase().includes(lowerQuery) ||
        a.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
};

export const uploadArticle = async (article: Omit<OnboardingArticle, 'id' | 'lastUpdated'>, user: User): Promise<OnboardingArticle> => {
    // Permission Check
    if (user.systemRole !== SystemRole.ADMIN && user.role !== UserRole.GTM) {
        throw new Error("You don’t have permission to manage onboarding content.");
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const newArticle: OnboardingArticle = {
        ...article,
        id: Date.now().toString(),
        lastUpdated: new Date(),
        author: user.name
    };

    MOCK_ARTICLES = [newArticle, ...MOCK_ARTICLES];
    return newArticle;
};

export const deleteArticle = async (id: string, user: User): Promise<void> => {
    // Permission Check
    if (user.systemRole !== SystemRole.ADMIN && user.role !== UserRole.GTM) {
        throw new Error("You don’t have permission to manage onboarding content.");
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    MOCK_ARTICLES = MOCK_ARTICLES.filter(a => a.id !== id);
};
