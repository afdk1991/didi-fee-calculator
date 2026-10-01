// 高德地图 Web 服务代理 —— EdgeOne Makers Cloud Function（Node.js v20）
// ------------------------------------------------------------------
// 作用：前端（网页 / Android WebView）统一走本函数请求高德，
//   - Key 与安全密钥只在服务端注入（context.env），前端不暴露；
//   - 仅放行白名单内的高德 API，避免被当作开放代理滥用；
//   - 对相同请求做短期内存缓存，节省高德配额；
//   - 规范错误码与回包结构。
//
// 路由：GET /amap-proxy?path=/v3/geocode/geo&address=...&city=...
// 环境变量（在 EdgeOne Makers 控制台「项目设置 → 环境变量」配置）：
//   AMAP_KEY      高德 Web 服务 Key（必填）
//   AMAP_SECRET   高德安全密钥（签名用，可选但推荐）
//   CACHE_TTL_MS  缓存有效期毫秒（默认 60000）
// ------------------------------------------------------------------
import crypto from 'node:crypto';

const ALLOWED_PATHS = new Set([
  '/v3/geocode/geo',                     // 地理编码（地址 -> 坐标）
  '/v3/geocode/regeo',                   // 逆地理编码（坐标 -> 地址）
  '/v3/direction/driving',               // 驾车路线规划（用于测距）
  '/v3/distance',                        // 距离测量
  '/v3/assistant/coordinate/convert',    // 坐标转换
]);

// 简单内存缓存：key = path + '?' + 排序后的 query
const cache = new Map();
function cacheGet(key, ttl) {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.t > ttl) {
    cache.delete(key);
    return undefined;
  }
  return hit.v;
}
function cacheSet(key, val) {
  if (cache.size > 500) cache.clear(); // 防止无限增长
  cache.set(key, { t: Date.now(), v: val });
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;

  // 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const AMAP_KEY = env.AMAP_KEY || '';
  const AMAP_SECRET = env.AMAP_SECRET || '';
  const CACHE_TTL_MS = Number(env.CACHE_TTL_MS || 60000);

  try {
    if (!AMAP_KEY) {
      return json({ status: '0', info: '服务端未配置 AMAP_KEY（请在 Makers 控制台设置环境变量）' }, 500);
    }

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    const apiPath = params.path || '';
    delete params.path;

    if (!apiPath || !ALLOWED_PATHS.has(apiPath)) {
      return json({
        status: '0',
        info: `不允许的 API 路径：${apiPath || '(空)'}。仅支持：` + [...ALLOWED_PATHS].join(', '),
      }, 400);
    }

    // 注入服务端 Key
    params.key = AMAP_KEY;

    // 数字签名（配置了安全密钥时）
    if (AMAP_SECRET) {
      const sortedKeys = Object.keys(params).sort();
      const str = sortedKeys.map((k) => `${k}=${params[k]}`).join('&') + AMAP_SECRET;
      params.sig = crypto.createHash('md5').update(str, 'utf8').digest('hex');
    }

    const qs = new URLSearchParams(params).toString();
    const targetUrl = `https://restapi.amap.com${apiPath}?${qs}`;
    const cacheKey = `${apiPath}?${qs}`;

    // 命中缓存直接返回
    const cached = cacheGet(cacheKey, CACHE_TTL_MS);
    if (cached !== undefined) {
      return new Response(cached, {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'HIT' },
      });
    }

    const resp = await fetch(targetUrl);
    const text = await resp.text();

    // 仅缓存成功的响应，减少高德配额消耗
    try {
      const j = JSON.parse(text);
      if (j && j.status === '1') cacheSet(cacheKey, text);
    } catch (_) { /* 非 JSON 不缓存 */ }

    return new Response(text, {
      status: resp.ok ? 200 : 502,
      headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'MISS' },
    });
  } catch (err) {
    return json({ status: '0', info: '代理请求失败: ' + (err && err.message ? err.message : String(err)) }, 502);
  }
}
