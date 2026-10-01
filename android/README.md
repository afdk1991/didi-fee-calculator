# 代驾收费计算器 · Android 版

把项目根目录的 `index.html`（纯前端代驾计费器）套了一个 WebView 原生壳，编译成可安装的 APK。

## 直接安装

把下面这个 APK 传到手机（微信/QQ/数据线/网盘均可），点击安装：

```
代驾收费计算器-v1.0.0-debug.apk
```

首次安装若提示「未知来源」，允许浏览器/文件管理器安装即可。

## 第一次打开要做的事

1. 启动后会弹窗请求**定位权限**，选「允许」（用于「📍当前位置」一键填起点）。
2. 展开底部「**费率微调 & 高德 Key**」，把你的**高德 Web 服务 Key** 粘贴进去（和你之前在浏览器里用的是同一个 Key，不是 Android 平台 Key）。
   - 没有就去 https://console.amap.com/dev/key/app → 创建应用 → 服务平台选 **Web 服务** → 把生成的 Key 复制过来。
3. 之后起终点测距、定位都能用了。计费逻辑和浏览器版完全一致（通用 / 滴滴代驾 / E代驾 三档切换）。

## 技术参数（已烧进 APK）

| 项 | 值 |
|---|---|
| applicationId | `com.nbdaijia.calculator` |
| versionCode / versionName | 1 / 1.0.0 |
| minSdk / targetSdk | 24 (Android 7.0) / 34 |
| 包结构 | `android/app/src/main/java/com/nbdaijia/calculator/MainActivity.kt` |
| 页面 | `android/app/src/main/assets/index.html`（与项目根目录 `index.html` 同一份，改完重新编译即可） |
| 签名 | debug.keystore（`C:\Users\addk1\.android\debug.keystore`，密码 `android`） |
| debug SHA1 | `5C:BD:D0:A1:B6:8D:50:39:F9:CC:5A:45:AE:42:61:C5:38:7F:E8:ED` |

> 说明：WebView 壳走的是高德 **Web 服务 REST API**（地理编码 + 驾车路径规划 + 逆地理编码），**不需要**在高德后台绑定 SHA1。上面这个 SHA1 是给以后升级成原生高德地图 SDK（3D 地图、原生定位）时用的。

## 重新编译

```powershell
cd D:\网站全栈项目\代驾距离收费计算\android
gradle :app:assembleDebug
```

产物在 `android\app\build\outputs\apk\debug\app-debug.apk`。

改页面：直接编辑 `android\app\src\main\assets\index.html`（或先改项目根目录的 `index.html` 再 `Copy-Item` 过去），重新跑上面那条命令即可。

## 工程结构

```
android/
├── settings.gradle / build.gradle / gradle.properties / local.properties
└── app/
    ├── build.gradle
    └── src/main/
        ├── AndroidManifest.xml          # 权限 + 竖屏 + 启动 Activity
        ├── assets/index.html            # 页面本体
        ├── java/com/nbdaijia/calculator/MainActivity.kt   # WebView 壳
        └── res/                         # 布局、主题、图标
```

## 已知限制

- 当前是 **debug 签名**，能装自己手机，不能上架应用市场。要上架需要：
  1. 生成你自己的 release keystore
  2. 在 `app/build.gradle` 加 `signingConfigs`
  3. 跑 `gradle :app:assembleRelease`
- WebView 里 `allowUniversalAccessFromFileURLs` 有 deprecated 警告，但不影响运行；这是 file:// 页面能 fetch https 接口所必需的。
- 中文路径（`D:\网站全栈项目\...`）下构建靠 `android.overridePathCheck=true` 绕过，理论上极少数 NDK 工具链会出问题；本工程无 NDK，实测通过。
