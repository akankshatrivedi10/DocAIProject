export default async function handler(req, res) {
    // 1. Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, SalesforceProxy-Endpoint, SOAPAction, Sforce-Call-Options'
    );

    // 2. Handle Preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 3. Extract target URL and other params
    let { proxyUrl, ...otherParams } = req.query;

    if (!proxyUrl) {
        return res.status(400).json({ error: 'Missing "proxyUrl" query parameter' });
    }

    // 4. Normalize URL (fix Vercel/Browser slash stripping issues)
    // Sometimes https:// becomes https:/
    if (proxyUrl.startsWith('https:/') && !proxyUrl.startsWith('https://')) {
        proxyUrl = proxyUrl.replace('https:/', 'https://');
    } else if (proxyUrl.startsWith('http:/') && !proxyUrl.startsWith('http://')) {
        proxyUrl = proxyUrl.replace('http:/', 'http://');
    }

    // 5. Append original query parameters (e.g., SOQL query 'q')
    // Vercel parses the query string into req.query, separating them from the path rewrite
    if (Object.keys(otherParams).length > 0) {
        const urlObj = new URL(proxyUrl);
        Object.keys(otherParams).forEach(key => {
            urlObj.searchParams.append(key, otherParams[key]);
        });
        proxyUrl = urlObj.toString();
    }

    // 6. Prepare headers
    const headers = {};
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];
    if (req.headers['salesforceproxy-endpoint']) headers['SalesforceProxy-Endpoint'] = req.headers['salesforceproxy-endpoint'];
    if (req.headers['soapaction']) headers['SOAPAction'] = req.headers['soapaction'];
    if (req.headers['sforce-call-options']) headers['Sforce-Call-Options'] = req.headers['sforce-call-options'];

    // Forward x- headers
    Object.keys(req.headers).forEach(key => {
        if (key.toLowerCase().startsWith('x-')) {
            headers[key] = req.headers[key];
        }
    });

    try {
        const response = await fetch(proxyUrl, {
            method: req.method,
            headers: headers,
            body: (req.method !== 'GET' && req.method !== 'HEAD')
                ? (typeof req.body === 'object' ? JSON.stringify(req.body) : req.body)
                : undefined,
        });

        // 6. Forward response
        res.status(response.status);

        response.headers.forEach((value, key) => {
            if (['content-type', 'content-length', 'cache-control'].includes(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });

        const data = await response.text();
        res.send(data);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'Proxy Request Failed', details: error.message });
    }
}
