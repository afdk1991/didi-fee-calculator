# 代驾距离收费计算 项目记忆

## 项目定位
一个「代驾费用估算」工具，覆盖三大交付物：
1. **PWA 网页计算器**（根目录 index.html + manifest.json + sw.js）：估算滴滴 / E代驾 / 通用代驾费用，按里程计费。
2. **Android 外壳 App**（android/）：Kotlin + WebView，把网页打包进 assets 离线运行，包名 `com.nbdaijia.calculator`。
3. **微信云函数代理**（cloudfunctions/amap-proxy）：腾讯 SCF，代理高德地图 Web 服务 API（绕开 CORS / 隐藏 key）。

## 目录结构
- 根：`index.html`(计算器)、`manifest.json`、`sw.js`(离线缓存 v1.0.1)、`README.md`、`.test/calc.test.js`(费率单测)、`.gitignore`
- `android/`：Kotlin WebView 壳，assets 内含 index.html/manifest.json/sw.js 副本；gradle 8.9（腾讯镜像）
- `android-package-demo/`：与主线无关的「Android 包名获取工具」演示（adb/aapt/gradle 脚本 + 单测），包名 `com.example.pkgdemo`
- `cloudfunctions/amap-proxy/`：`index.js`(SCF handler)、`package.json`、`scf_bootstrap`、`.zip`+`base64.txt`(部署产物)

## 关键约定
- 网页核心逻辑在 `index.html`（内联 JS），`assets/` 下是同一份的 Android 内嵌副本。已新增 `sync-web.js` 单向同步脚本（根 -> assets），改网页后跑 `node sync-web.js`，勿手改 assets 副本。
- 高德 Key 经云函数代理，不直接暴露在前端。`cloudfunctions/amap-proxy` 已升级 v1.1：API 白名单 + 内存缓存 + 参数校验 + 规范错误码。
- 费率规则集中在 `index.html` 的 `PRESETS` 与 `.test/calc.test.js` 断言中（25 用例，node 运行全通过）。
- Android 壳 `MainActivity.kt` 已加 WebView 错误处理（离线/加载失败 Toast）、viewport 缩放优化、网络权限。
