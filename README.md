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
├── index.html          # 主应用单文件，所有代码都在这
├── manifest.json       # PWA应用清单
├── sw.js               # Service Worker离线缓存
├── cloudfunctions/
│   └── amap-proxy/     # 高德地图API代理云函数（避免Key暴露在前端）
│       ├── index.js
│       ├── package.json
│       └── scf_bootstrap
├── .test/
│   └── calc.test.js    # 计费逻辑单元测试
├── android/            # Android WebView打包工程
└── 代驾收费计算器-v1.0.0-debug.apk  # 已打包的Android安装包
```

## 部署方法

### 静态网站部署（推荐）
直接把根目录的 `index.html`、`manifest.json`、`sw.js` 上传到任意静态托管平台即可：
- EdgeOne Pages / Vercel / Netlify / GitHub Pages / 腾讯云静态网站托管
- 注意：需要HTTPS才能使用定位和PWA功能

### 高德地图代理部署
为了避免高德Key暴露在前端，测距功能走了云函数代理，部署步骤：
1. 注册腾讯云CloudBase，新建云函数，环境变量配置：
   - `AMAP_KEY`：你的高德Web服务Key
   - `AMAP_SECRET`：高德安全密钥（可选）
2. 把 `cloudfunctions/amap-proxy` 目录下的代码上传部署
3. 修改 `index.html` 里的 `AMAP_PROXY` 地址为你自己的云函数URL

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

## 价格说明
当前内置价格为2025-2026年公开标准，不同城市、天气、动态加价可能有差异，实际费用以平台APP发单为准。所有费率都可以在页面"费率微调"里根据当地实际情况调整。
