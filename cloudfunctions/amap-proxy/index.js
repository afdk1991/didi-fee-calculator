/**
 * amap-proxy — 高德地图 Web 服务代理（腾讯云 SCF）
 * ------------------------------------------------------------
 * 作用：前端（网页 / Android WebView）统一走本代理请求高德，
 *       - Key 与安全密钥只在服务端注入，前端不暴露；
 *       - 仅放行白名单内的高德 API，避免被当作开放代理滥用；
 *       - 对相同请求做短期内存缓存，节省高德配额；
 *       - 规范错误码与回包结构。
 *
 * 环境变量：
 *   AMAP_KEY      高德 Web 服务 Key（必填）
 *   AMAP_SECRET   高德安全密钥（签名用，可选但推荐）
 *   PORT          监听端口（SCF 由平台注入，本地默认 9000）
 *   CACHE_TTL_MS  缓存有效期（默认 60000）
 */
const http = require('http');
const crypto = require('crypto');

const AMAP_KEY = process.env.AMAP_KEY || '';
const AMAP_SECRET = process.env.AMAP_SECRET || '';
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 60000);

// 允许访问的高德 API 路径白名单（防开放代理）
const ALLOWED_PATHS = new Set([
  '/v3/geocode/geo',        // 地理编码（地址 -> 坐标）
  '/v3/geocode/regeo',      // 逆地理编码（坐标 -> 地址）
  '/v3/direction/driving',  // 驾车路线规划（用于测距）
  '/v3/distance',           // 距离测量
  '/v3/assistant/coordinate/convert' // 坐标转换
]);

// 简单内存缓存：key = path + '?' + 排序后的 query
const cache = new Map();
function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit && !cache.has(key)) return undefined;
  if (!hit) return undefined;
  if (Date.now() - hit.t > CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return hit.v;
}
function cacheSet(key, val) {
  if (cache.size > 500) cache.clear(); // 防止无限增长
  cache.set(key, { t: Date.now(), v: val });
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  // CORS：允许网页 / WebView 跨域调用
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  try {
    if (!AMAP_KEY) {
      return sendJson(res, 500, { status: '0', info: '服务端未配置 AMAP_KEY' });
    }

    const url = new URL(req.url, 'http://localhost');
    const params = Object.fromEntries(url.searchParams);
    const apiPath = params.path || '';
    delete params.path;

    if (!apiPath || !ALLOWED_PATHS.has(apiPath)) {
      return sendJson(res, 400, {
        status: '0',
        info: `不允许的 API 路径：${apiPath || '(空)'}。仅支持：` + [...ALLOWED_PATHS].join(', ')
      });
    }

    // 注入服务端 Key
    params.key = AMAP_KEY;

    // 数字签名（配置了安全密钥时）
    if (AMAP_SECRET) {
      const sortedKeys = Object.keys(params).sort();
      const str = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + AMAP_SECRET;
      params.sig = crypto.createHash('md5').update(str, 'utf8').digest('hex');
    }

    const qs = new URLSearchParams(params).toString();
    const targetUrl = `https://restapi.amap.com${apiPath}?${qs}`;
    const cacheKey = `${apiPath}?${qs}`;

    // 命中缓存直接返回
    const cached = cacheGet(cacheKey);
    if (cached !== undefined) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'HIT' });
      return res.end(cached);
    }

    const resp = await fetch(targetUrl);
    const text = await resp.text();

    // 仅缓存成功的响应，减少高德配额消耗
    try {
      const json = JSON.parse(text);
      if (json && json.status === '1') cacheSet(cacheKey, text);
    } catch (_) { /* 非 JSON 不缓存 */ }

    res.writeHead(resp.ok ? 200 : 502, {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Cache': 'MISS'
    });
    res.end(text);
  } catch (err) {
    sendJson(res, 502, { status: '0', info: '代理请求失败: ' + (err && err.message ? err.message : String(err)) });
  }
});

const port = process.env.PORT || 9000;
server.listen(port, () => {
  console.log(`amap-proxy listening on ${port}`);
});
