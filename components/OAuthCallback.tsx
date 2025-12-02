import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { exchangeCodeForToken } from '../services/realSalesforceService';

interface OAuthCallbackProps {
    onSuccess: (accessToken: string, instanceUrl: string, refreshToken: string) => void;
    onError: (error: string) => void;
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ onSuccess, onError }) => {
    const [status, setStatus] = useState<'PROCESSING' | 'SUCCESS' | 'ERROR'>('PROCESSING');
    const [message, setMessage] = useState('Completing authentication...');

    useEffect(() => {
        const processCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');
            const errorDescription = urlParams.get('error_description');

            // 🚨 Prevent double processing in React Strict Mode
            // We check if THIS specific code has been processed.
            if (code && sessionStorage.getItem('last_processed_code') === code) {
                console.log('[OAuth] Code already processed. Skipping.');
                return;
            }

            // ❌ Salesforce returned an error
            if (error) {
                const errMsg = errorDescription || error;
                console.error('[OAuth] Salesforce Error:', errMsg);
                setStatus('ERROR');
                setMessage(`Salesforce Error: ${errMsg}`);
                onError(errMsg);
                return;
            }

            // ❌ Missing authorization code
            if (!code) {
                console.error('[OAuth] No authorization code found.');
                setStatus('ERROR');
                setMessage('No authorization code found.');
                onError('No authorization code found.');
                return;
            }

            // Mark as processed immediately to prevent race conditions
            sessionStorage.setItem('last_processed_code', code);

            try {
                setMessage('Exchanging code for access token...');

                const isSandbox = sessionStorage.getItem('is_sandbox') === 'true';

                // 🔁 Call server-side exchange
                const tokens = await exchangeCodeForToken(code, isSandbox);

                setStatus('SUCCESS');
                setMessage('Authentication successful! Redirecting...');

                // Small delay for UX
                setTimeout(() => {
                    onSuccess(tokens.access_token, tokens.instance_url, tokens.refresh_token);
                }, 800);

            } catch (err: any) {
                console.error('[OAuth] Token Exchange Failed:', err);
                setStatus('ERROR');
                setMessage(`Authentication Failed: ${err.message}`);
                onError(err.message);
                // If failed, maybe allow retry? But code is likely burned.
                // We keep it marked as processed to avoid loop.
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
                        <a href="/" className="text-blue-500 hover:underline font-medium">
                            Return to Home
                        </a>
                    </>
                )}

            </div>
        </div>
    );
};

export default OAuthCallback;
