const https = require('https');
const crypto = require('crypto');

// Shared encryption logic (must match proxy.js)
const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'dev-secret-key-32-chars-must-be-set';
// Ensure key is 32 bytes
const KEY = crypto.createHash('sha256').update(SECRET_KEY).digest();

const encryptTokenData = (data) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { code, redirectUri } = req.body;
    const clientId = process.env.JIRA_CLIENT_ID;
    const clientSecret = process.env.JIRA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return res.status(500).json({ error: 'Missing Jira server configuration' });
    }

    try {
        // 1. Exchange Code for Tokens
        const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                redirect_uri: redirectUri
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            throw new Error(tokenData.error_description || tokenData.error || 'Token exchange failed');
        }

        // 2. Get Cloud ID
        const resourcesResponse = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
            headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        });

        const resources = await resourcesResponse.json();
        if (!resources || resources.length === 0) {
            throw new Error('No Jira resources found');
        }

        const cloudId = resources[0].id;

        // 3. Encrypt Session (Stateless)
        // We store the tokens + expiry + cloudId in the blob
        const sessionData = {
            at: tokenData.access_token,
            rt: tokenData.refresh_token,
            exp: Date.now() + (tokenData.expires_in * 1000),
            cid: cloudId
        };

        const connectionId = encryptTokenData(sessionData);

        return res.status(200).json({
            success: true,
            connectionId: connectionId, // This blob acts as the ID
            resources: resources
        });

    } catch (error) {
        console.error('Exchange Logic Error:', error);
        return res.status(400).json({ error: error.message });
    }
}
