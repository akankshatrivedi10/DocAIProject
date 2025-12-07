import React, { useEffect, useState } from 'react';
import { ENV_CONFIG } from '../config/envConfig';
import { Loader2 } from 'lucide-react';
import { ConnectionStatus, IntegrationType } from '../types';

interface JiraOAuthCallbackProps {
    onSuccess: (connectionId: string, cloudId: string) => void;
    onError: (error: string) => void;
}

const JiraOAuthCallback: React.FC<JiraOAuthCallbackProps> = ({ onSuccess, onError }) => {
    const [status, setStatus] = useState('Exchanging token...');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
            onError('No authorization code received.');
            return;
        }

        const exchangeToken = async () => {
            try {
                // Determine API URL (Local vs Prod)
                const isLocal = window.location.hostname === 'localhost';
                const apiUrl = isLocal
                    ? 'http://localhost:8080/api/jira/exchangeToken'
                    : '/api/jira/exchangeToken'; // Serve via Next.js API route in prod

                const redirectUri = isLocal
                    ? ENV_CONFIG.LOCALHOST.redirectUri.replace('oauth/callback', 'jira/oauth/callback')
                    : ENV_CONFIG.TEST_SERVER.redirectUri.replace('oauth/callback', 'jira/oauth/callback'); // Adjust logic as needed

                // NOTE: Hardcoding redirect URI here to match instructions if needed
                // "http://localhost:3000/jira/oauth/callback"
                const activeRedirect = isLocal ? 'http://localhost:3000/jira/oauth/callback' : 'https://doc-ai-project.vercel.app/jira/oauth/callback';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, redirectUri: activeRedirect })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setStatus('Success! Redirecting...');
                    // Store Connection ID
                    localStorage.setItem('jira_connection_id', data.connectionId);
                    localStorage.setItem('jira_cloud_id', data.resources[0].id); // Just taking first for now

                    setTimeout(() => onSuccess(data.connectionId, data.resources[0].id), 500);
                } else {
                    throw new Error(data.error || 'Token exchange failed');
                }
            } catch (e: any) {
                console.error("Jira OAuth Error", e);
                onError(e.message);
            }
        };

        exchangeToken();
    }, []);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-slate-800">{status}</h2>
            <p className="text-slate-500 mt-2">Please wait while we connect to Atlassian.</p>
        </div>
    );
};

export default JiraOAuthCallback;
