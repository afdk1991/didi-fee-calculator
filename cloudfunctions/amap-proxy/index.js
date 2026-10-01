const http = require('http');
const crypto = require('crypto');
const AMAP_KEY = process.env.AMAP_KEY || '';
const AMAP_SECRET = process.env.AMAP_SECRET || '';

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end('');
  }

  try {
    const url = new URL(req.url, 'http://localhost');
    const params = Object.fromEntries(url.searchParams);
    const apiPath = params.path || '/v3/geocode/geo';
    delete params.path;

    // 注入服务端 Key
    params.key = AMAP_KEY;

    // 数字签名（如果配置了安全密钥）
    if (AMAP_SECRET) {
      const sortedKeys = Object.keys(params).sort();
      const str = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + AMAP_SECRET;
      params.sig = crypto.createHash('md5').update(str, 'utf8').digest('hex');
    }

    const qs = new URLSearchParams(params).toString();
    const targetUrl = `https://restapi.amap.com${apiPath}?${qs}`;

    const resp = await fetch(targetUrl);
    const data = await resp.text();
    res.writeHead(200);
    res.end(data);
  } catch (err) {
    res.writeHead(502);
    res.end(JSON.stringify({ status: '0', info: '代理失败: ' + err.message }));
  }
});

const port = process.env.PORT || 9000;
server.listen(port, () => {
  console.log(`amap-proxy listening on ${port}`);
});
