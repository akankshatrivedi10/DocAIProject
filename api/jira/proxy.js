const https = require('https');
const crypto = require('crypto');
const url = require('url');

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'dev-secret-key-32-chars-must-be-set';
const KEY = crypto.createHash('sha256').update(SECRET_KEY).digest();

const decryptTokenData = (text) => {
    try {
        const parts = text.split(':');
        if (parts.length !== 3) throw new Error('Invalid format');
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    } catch (e) {
        console.error("Decryption failed", e);
        return null;
    }
};

const encryptTokenData = (data) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

export default async function handler(req, res) {
    const { path } = req.query; // ?path=/rest/api/3/project
    const connectionId = req.headers['x-jira-connection-id'];

    if (!connectionId || !path) {
        return res.status(400).json({ error: 'Missing Connection ID or Path' });
    }

    let session = decryptTokenData(connectionId);
    if (!session) {
        return res.status(401).json({ error: 'Invalid Session' });
    }

    let accessToken = session.at;
    let newConnectionId = null;

    // Check Refresh
    if (Date.now() > session.exp - (5 * 60 * 1000) && session.rt) {
        console.log("Token expired, refreshing...");
        try {
            const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grant_type: 'refresh_token',
                    client_id: process.env.JIRA_CLIENT_ID,
                    client_secret: process.env.JIRA_CLIENT_SECRET,
                    refresh_token: session.rt
                })
            });

            const refreshData = await tokenResponse.json();
            if (tokenResponse.ok) {
                // Update session
                session.at = refreshData.access_token;
                session.rt = refreshData.refresh_token;
                session.exp = Date.now() + (refreshData.expires_in * 1000);
                accessToken = session.at;

                // Re-encrypt to send back
                newConnectionId = encryptTokenData(session);
                // We'll verify how to send this back. 
                // Currently returning it in a custom header
                res.setHeader('X-Jira-New-Connection-Id', newConnectionId);
            }
        } catch (e) {
            console.error("Refresh failed", e);
        }
    }

    // Proxy Request
    const targetUrl = `https://api.atlassian.com/ex/jira/${session.cid}${path}`;

    try {
        const proxyRes = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });

        const data = await proxyRes.json();
        return res.status(proxyRes.status).json(data);

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
