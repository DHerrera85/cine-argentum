const https = require('https');

exports.handler = async (event, context) => {
  const { code } = event.queryStringParameters || {};

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No code provided' })
    };
  }

  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  const postData = JSON.stringify({
    client_id,
    client_secret,
    code
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'github.com',
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/json',
        'User-Agent': 'Decap-CMS'
      }
    }, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            statusCode: 200,
            body: JSON.stringify(result)
          });
        } catch (e) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to parse response' })
          });
        }
      });
    });

    req.on('error', () => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: 'Request failed' })
      });
    });

    req.write(postData);
    req.end();
  });
};
