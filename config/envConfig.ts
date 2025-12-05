
// Configuration for environment selection
// This file allows easy replacement of the test hosted server URL in the future

export const ENV_CONFIG = {
    LOCALHOST: {
        label: 'Localhost (Dev)',
        appUrl: 'http://localhost:3000',
        apiUrl: 'http://localhost:8080',   // Point to Local Proxy for JSForce
        redirectUri: 'http://localhost:3000/oauth/callback',
        loginUrl: 'https://login.salesforce.com'
    },
    TEST_SERVER: {
        label: 'Test Hosted Server (Vercel)',
        appUrl: 'https://doc-ai-project.vercel.app',
        apiUrl: '',
        redirectUri: 'https://doc-ai-project.vercel.app/oauth/callback',
        loginUrl: 'https://login.salesforce.com'
    }
};


export type EnvironmentMode = 'LOCALHOST' | 'TEST_SERVER';

export const getStoredEnvironment = (): EnvironmentMode | null => {
    if (typeof window === 'undefined') return null;
    return (localStorage.getItem('docbot_env_mode') as EnvironmentMode) || null;
};

export const setStoredEnvironment = (mode: EnvironmentMode) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('docbot_env_mode', mode);
    // Force reload to apply changes if needed, or let the app handle reactivity
    window.location.reload();
};
