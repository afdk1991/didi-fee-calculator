# 代驾收费计算器

一个纯前端单页应用，快速估算滴滴代驾、E代驾、通用代驾的费用，支持自动按时段计价、路线测距、多服务类型切换。

## 功能特性

- ✅ 三平台一键切换：通用标准 / 滴滴代驾 / E代驾
- ✅ 多服务类型：日常代驾 / 长途套餐 / 商务代驾 / 代泊车
- ✅ 自动时段识别：根据当前时间自动匹配对应起步价时段，也可手动选择
- ✅ 高德地图路线测距：输入起终点自动获取驾车距离，支持当前定位
- ✅ 动态加价计算：支持接驾费、临时调价、路桥费、停车费等额外费用
- ✅ 等待时长计算：自动减去免费等待时长，超过部分计费，支持封顶
- ✅ 本地历史记录：自动保存最近50次计算结果
- ✅ 一键复制报价：生成可直接发给客户的报价文本
- ✅ 费率可自定义：所有平台价格都可在"费率微调"里调整，一键恢复默认
- ✅ PWA支持：可添加到手机桌面，离线打开使用
- ✅ 适配移动端：手机浏览器完美显示，无广告无需登录

## 项目结构

```
代驾距离收费计算/
├── index.html          # 主应用单文件（单一可信源）
├── manifest.json       # PWA应用清单
├── sw.js               # Service Worker离线缓存
├── sync-web.js         # 统一同步脚本：根 Web 资源 -> android assets
├── cloud-functions/
│   └── amap-proxy.js   # 【已上线·EdgeOne Makers Node 云函数】同域代理 /amap-proxy
│                       #   onRequest(context) + context.env.AMAP_KEY；白名单+缓存+签名
├── cloudfunctions/
│   └── amap-proxy/     # 高德地图API代理（腾讯云 SCF 等价实现，便于 SCF 部署）
│       ├── index.js    # v1.1：API白名单 + 内存缓存 + 参数校验 + 规范错误码
│       ├── package.json
│       └── scf_bootstrap
├── .test/
│   └── calc.test.js    # 计费逻辑单元测试（25 用例，node 运行）
├── android/            # Android WebView打包工程（assets 为 index.html 副本）
└── 代驾收费计算器-v1.0.0-debug.apk  # 已打包的Android安装包
```

## 部署方法

### 静态网站部署（推荐）
直接把根目录的 `index.html`、`manifest.json`、`sw.js` 上传到任意静态托管平台即可：
- EdgeOne Pages / Vercel / Netlify / GitHub Pages / 腾讯云静态网站托管
- 注意：需要HTTPS才能使用定位和PWA功能

### 高德地图代理部署
为了避免高德Key暴露在前端，测距功能走了云函数代理。两种等价实现：

**A. EdgeOne Makers 云函数（已上线，推荐同域）**
- 代码：`cloud-functions/amap-proxy.js`（`onRequest(context)`，路由 `/amap-proxy`）。
- 全栈部署：`deploy/` = `web-dist/` + `cloud-functions/`，执行
  `edgeone makers deploy ./deploy -n daijia-calc -t <TOKEN>`（已配项目守卫，复用 `makers-fanpewlpbwjz`）。
- ⚠️ **必须在 Makers 控制台「项目设置 → 环境变量」配置 `AMAP_KEY`**（以及可选 `AMAP_SECRET`），否则函数返回 500。
- 切换前端：把 `index.html` 的 `AMAP_PROXY` 改为同域 `https://<你的域名>/amap-proxy`，再 `node sync-web.js` 同步 assets 并重新部署 PWA。

**B. 腾讯云 SCF（等价实现）**
1. 注册腾讯云，新建 SCF 云函数，环境变量配置：
   - `AMAP_KEY`：你的高德Web服务Key
   - `AMAP_SECRET`：高德安全密钥（可选）
2. 把 `cloudfunctions/amap-proxy` 目录下的代码上传部署
3. 修改 `index.html` 里的 `AMAP_PROXY` 地址为你自己的云函数URL

> 当前线上 `index.html` 仍指向旧版 CloudBase 直转代理（功能正常，但无白名单/缓存）。待在控制台设置 `AMAP_KEY` 后，可切到方案 A 的同域函数以启用缓存与防滥用白名单。

### Android打包
项目里已经有打好的debug APK，如需重新打包：
```bash
cd android
./gradlew assembleDebug
```

## 运行测试
```bash
node .test/calc.test.js
```

## 保持网页与 App 一致（重要）
根目录 `index.html` / `manifest.json` / `sw.js` 是**单一可信源**，Android 壳运行时加载的是 `android/app/src/main/assets/` 下的副本。改了网页后务必同步，否则 App 内嵌页会过期：
```bash
node sync-web.js
```
脚本会比较并单向复制上述三个文件到 assets 目录，报告哪些更新了、哪些已一致。

## 高德代理说明
`amap-proxy` 仅放行白名单内的高德 API（`/v3/geocode/geo`、`/v3/geocode/regeo`、`/v3/direction/driving`、`/v3/distance`、`/v3/assistant/coordinate/convert`），并对成功响应做 60s 内存缓存以节省配额；Key 与安全密钥只在服务端注入。本地调试：
```bash
cd cloudfunctions/amap-proxy && AMAP_KEY=你的Key node index.js
```

## 价格说明
当前内置价格为2025-2026年公开标准，不同城市、天气、动态加价可能有差异，实际费用以平台APP发单为准。所有费率都可以在页面"费率微调"里根据当地实际情况调整。
