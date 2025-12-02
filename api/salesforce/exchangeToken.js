
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { code, redirect_uri, code_verifier, is_sandbox } = req.body;

    if (!code || !redirect_uri) {
        return res.status(400).json({ error: 'Missing code or redirect_uri' });
    }

    const clientId = process.env.SF_CLIENT_ID;
    const clientSecret = process.env.SF_CLIENT_SECRET;

    // Use correct login URL based on environment (Sandbox vs Production)
    const loginUrl = is_sandbox ? 'https://test.salesforce.com' : 'https://login.salesforce.com';

    if (!clientId || !clientSecret) {
        console.error('Missing server-side credentials');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', redirect_uri);
    params.append('code', code);

    // Add PKCE verifier if present
    if (code_verifier) {
        params.append('code_verifier', code_verifier);
    }

    try {
        console.log('Exchanging token with Salesforce...');
        const response = await fetch(`${loginUrl}/services/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Salesforce Token Error:', data);
            return res.status(response.status).json(data);
        }

        console.log('Token exchange successful');
        return res.status(200).json(data);
    } catch (error) {
        console.error('Token Exchange Exception:', error);
        return res.status(500).json({ error: error.message });
    }
}
