const cors_proxy = require('cors-anywhere');
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

// Load .env manually since we don't want to add dotenv dependency
try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                if (key && value && !key.startsWith('#')) {
                    process.env[key] = value;
                }
            }
        });
        console.log('Loaded environment variables from .env');
    }
} catch (e) {
    console.warn('Could not load .env file', e);
}

const host = 'localhost';
const port = 8080;

// Initialize CORS Anywhere
const proxyServer = cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin'],
    removeHeaders: ['cookie', 'cookie2']
});

// Create a custom server that routes API calls or delegates to proxy
http.createServer((req, res) => {
    // Enable CORS for all responses from this server
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    };

    // Handle Preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }

    // API Route: /api/salesforce/exchangeToken
    if (req.url === '/api/salesforce/exchangeToken' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { code, redirect_uri, code_verifier, is_sandbox } = JSON.parse(body);

                const clientId = process.env.SF_CLIENT_ID;
                const clientSecret = process.env.SF_CLIENT_SECRET;

                // 🎯 Use correct login URL based on environment (Sandbox vs Production)
                const loginUrl = is_sandbox ? 'https://test.salesforce.com' : 'https://login.salesforce.com';

                if (!clientId || !clientSecret) {
                    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders });
                    res.end(JSON.stringify({ error: 'Missing server configuration' }));
                    return;
                }

                console.log(`[Local API] Exchanging token for code: ${code?.substring(0, 5)}... [${is_sandbox ? 'SANDBOX' : 'PRODUCTION'}]`);

                const params = new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirect_uri,
                    code: code
                });

                if (code_verifier) {
                    params.append('code_verifier', code_verifier);
                }

                const postData = params.toString();

                const sfReq = https.request(`${loginUrl}/services/oauth2/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                }, (sfRes) => {
                    let data = '';
                    sfRes.on('data', (chunk) => data += chunk);
                    sfRes.on('end', () => {
                        console.log(`[Local API] Salesforce response: ${sfRes.statusCode}`);
                        res.writeHead(sfRes.statusCode, {
                            'Content-Type': 'application/json',
                            ...corsHeaders
                        });
                        res.end(data);
                    });
                });

                sfReq.on('error', (e) => {
                    console.error('[Local API] Request error:', e);
                    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders });
                    res.end(JSON.stringify({ error: e.message }));
                });

                sfReq.write(postData);
                sfReq.end();

            } catch (e) {
                console.error('[Local API] Error:', e);
                res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders });
                res.end(JSON.stringify({ error: 'Invalid JSON or Request' }));
            }
        });
        return;
    }

    // Fallback to CORS Proxy for all other requests
    // cors-anywhere expects the URL to start with /https://... or /http://...
    // Our client sends requests to http://localhost:8080/https://...
    // So req.url will be /https://... which is exactly what cors-anywhere wants.

    console.log(`[Proxy] Proxying request to: ${req.url}`);
    proxyServer.emit('request', req, res);

}).listen(port, host, function () {
    console.log('Running Local Proxy + API on ' + host + ':' + port);
});
