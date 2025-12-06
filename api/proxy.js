import cors_anywhere from 'cors-anywhere';

// Initialize the proxy instance
const proxy = cors_anywhere.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: [], // Do not require specific headers
    removeHeaders: ['cookie', 'cookie2'], // Remove cookies for privacy/security
});

export default function handler(req, res) {
    // 🎯 rewrite rule in vercel.json sends the target url as a query param called 'proxyUrl'
    // e.g. /api/proxy/https://foo.com -> /api/proxy?proxyUrl=https://foo.com

    const { proxyUrl } = req.query;

    if (!proxyUrl) {
        res.status(400).send('Missing "proxyUrl" query parameter. Usage: /api/proxy/https://target.com');
        return;
    }

    // Rewrite req.url to just the target path (slash + url) as expected by cors-anywhere
    // e.g. /https://foo.com
    req.url = '/' + proxyUrl;

    // Pass the request to cors-anywhere
    proxy.emit('request', req, res);
}
