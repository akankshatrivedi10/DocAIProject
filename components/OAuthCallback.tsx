import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { exchangeCodeForToken } from '../services/realSalesforceService';

interface OAuthCallbackProps {
    onSuccess: (accessToken: string, instanceUrl: string, refreshToken: string) => void;
    onError: (error: string) => void;
}

let hasProcessed = false;

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ onSuccess, onError }) => {
    const [status, setStatus] = useState<'PROCESSING' | 'SUCCESS' | 'ERROR'>('PROCESSING');
    const [message, setMessage] = useState('Completing authentication...');

    useEffect(() => {
        const processCallback = async () => {
            if (hasProcessed) return;
            hasProcessed = true;

            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');
            const errorDescription = urlParams.get('error_description');

            if (error) {
                setStatus('ERROR');
                setMessage(`Salesforce Error: ${errorDescription || error}`);
                onError(errorDescription || error);
                return;
            }

            if (!code) {
                setStatus('ERROR');
                setMessage('No authorization code found in URL.');
                onError('No authorization code found.');
                return;
            }

            try {
                setMessage('Exchanging code for access token...');

                // Retrieve stored credentials
                const clientId = sessionStorage.getItem('sf_consumer_key');
                const clientSecret = sessionStorage.getItem('sf_consumer_secret');

                if (!clientId || !clientSecret) {
                    throw new Error("Missing OAuth credentials in session. Please try connecting again.");
                }

                const tokens = await exchangeCodeForToken(code, clientId, clientSecret);

                setStatus('SUCCESS');
                setMessage('Authentication successful! Redirecting...');

                // Short delay to show success state
                setTimeout(() => {
                    onSuccess(tokens.access_token, tokens.instance_url, tokens.refresh_token);
                }, 1000);

            } catch (err: any) {
                console.error('Token Exchange Failed', err);
                setStatus('ERROR');
                setMessage(`Authentication Failed: ${err.message}`);
                onError(err.message);
            }
        };

        processCallback();
    }, [onSuccess, onError]);

    return (
        <div className="fixed inset-0 bg-slate-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
                {status === 'PROCESSING' && (
                    <>
                        <Loader2 size={48} className="text-blue-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Connecting to Salesforce</h2>
                        <p className="text-slate-500">{message}</p>
                    </>
                )}

                {status === 'SUCCESS' && (
                    <>
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Connected!</h2>
                        <p className="text-slate-500">{message}</p>
                    </>
                )}

                {status === 'ERROR' && (
                    <>
                        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Failed</h2>
                        <p className="text-red-500 mb-6">{message}</p>
                        <a href="/" className="text-blue-500 hover:underline font-medium">Return to Home</a>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuthCallback;
