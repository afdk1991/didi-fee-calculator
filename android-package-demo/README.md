# Android 应用包名获取 —— 5 种方法完整实现

本工程将「Android 如何获取 Package（应用包名）」的全部 5 种方法落地为可运行的代码、测试与脚本，是一个可直接用 Android Studio 导入的完整工程。

---

## 目录结构

```
android-package-demo/
├── build.gradle                              ← 项目级构建配置
├── settings.gradle                           ← 模块声明
├── gradle.properties                          ← Gradle 全局配置
├── local.properties.template                  ← SDK 路径模板
├── .gitignore                                 ← Git 忽略规则
├── gradle/wrapper/
│   └── gradle-wrapper.properties              ← Gradle Wrapper 版本配置
│
├── app/
│   ├── build.gradle                           ← 方法二 + flavor 多渠道配置
│   ├── proguard-rules.pro                     ← 混淆规则
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml            ← 方法一（已注册全部 3 个 Activity）
│       │   ├── java/com/example/pkgdemo/
│       │   │   ├── MainActivity.kt           ← 方法四 Kotlin 版：4 种代码写法
│       │   │   ├── MainActivityJava.java     ← 方法四 Java 版：对应 Java 写法
│       │   │   └── PkgUtilsActivity.kt       ← 方法四扩展：3 个实用场景
│       │   └── res/
│       │       ├── layout/activity_main.xml
│       │       ├── drawable/ic_launcher_foreground.xml
│       │       ├── mipmap-anydpi-v26/ic_launcher.xml
│       │       └── values/strings.xml, themes.xml, colors.xml
│       ├── test/                              ← 本地单元测试（Robolectric）
│       │   └── java/.../PackageNameUnitTest.kt
│       └── androidTest/                       ← 仪器测试（需真机）
│           └── java/.../PackageNameInstrumentedTest.kt
│
├── scripts/
│   ├── 获取包名-adb.bat                        ← 方法三：adb 命令（Windows）
│   ├── get-package-adb.sh                     ← 方法三：adb 命令（mac/Linux）
│   └── 从APK反查包名.bat                       ← 方法三扩展：从 APK 文件反查
│
└── README.md                                  ← 本文件
```

---

## 方法一：从 AndroidManifest.xml 查看

**文件位置：** `app/src/main/AndroidManifest.xml`

根标签 `<manifest>` 的 `package` 属性即为应用包名。

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.pkgdemo">
```

> ⚠️ **注意：** AGP 7.0 及以后版本，`package` 字段已从 Manifest 中移除，统一由 `build.gradle` 的 `namespace` 控制。

---

## 方法二：从 build.gradle 查看

**文件位置：** `app/build.gradle`

有两个关键字段，作用不同：

```groovy
android {
    namespace 'com.example.pkgdemo'        // 代码包名：R 类、BuildConfig 所在目录
    defaultConfig {
        applicationId "com.example.pkgdemo" // 应用包名：安装到设备后的唯一标识
    }
}
```

### 本工程已配置多渠道 flavor（包名变体）

通过 `productFlavors`，同一套代码可以打出**不同包名**的 APK：

| 构建变体 | 最终包名 | 说明 |
|---------|---------|------|
| `devDebug` | `com.example.pkgdemo.dev.debug` | 开发调试包 |
| `devRelease` | `com.example.pkgdemo.dev` | 开发正式包 |
| `prodDebug` | `com.example.pkgdemo.debug` | 生产调试包 |
| `prodRelease` | `com.example.pkgdemo` | 线上正式包 |

> 这就是为什么 `applicationId` 和 `namespace` 必须分开——发布渠道/环境区分靠的是 `applicationId` 的后缀。

---

## 方法三：通过 adb 命令获取

**脚本位置：**
- Windows：`scripts/获取包名-adb.bat`（双击即可运行）
- macOS / Linux：`scripts/get-package-adb.sh`
- APK 反查：`scripts/从APK反查包名.bat`

包含的命令：

| 命令 | 作用 |
|------|------|
| `adb shell dumpsys window \| grep mCurrentFocus` | 查看当前前台 App 的包名 |
| `adb shell pm list packages -3` | 列出所有第三方应用包名 |
| `adb shell pm list packages -s` | 列出所有系统应用包名 |
| `adb shell pm list packages` | 列出全部已安装应用 |
| `adb shell pm list packages \| grep 关键词` | 按关键词搜索包名 |
| `aapt dump badging app-release.apk \| grep package` | 从 APK 文件读取包名 |
| `adb shell dumpsys package <包名>` | 查看指定包的详细信息 |

---

## 方法四：在代码中动态获取

### 4.1 Kotlin 版 —— `MainActivity.kt`

```kotlin
val pkg1 = packageName                                    // 最常用
val info = packageManager.getPackageInfo(packageName, 0)  // PackageInfo
val appInfo = packageManager.getApplicationInfo(packageName, 0) // ApplicationInfo
val pkg4 = BuildConfig.APPLICATION_ID                     // 编译期常量
```

### 4.2 Java 版 —— `MainActivityJava.java`

```java
String pkg1 = getPackageName();
PackageInfo info = getPackageManager().getPackageInfo(getPackageName(), 0);
ApplicationInfo appInfo = getPackageManager().getApplicationInfo(getPackageName(), 0);
String pkg4 = BuildConfig.APPLICATION_ID;
```

### 4.3 扩展场景 —— `PkgUtilsActivity.kt`

| 场景 | 说明 |
|------|------|
| 判断 App 是否前台运行 | ActivityManager + processName == packageName |
| 获取当前进程名 | 多进程应用区分主/子进程 |
| 判断是否系统应用 | ApplicationInfo.FLAG_SYSTEM 标志位 |

### 4.4 自动化测试验证

- **本地单元测试** `test/.../PackageNameUnitTest.kt`：用 Robolectric 在 JVM 上验证 `packageName == BuildConfig.APPLICATION_ID`，无需真机。
- **仪器测试** `androidTest/.../PackageNameInstrumentedTest.kt`：在真机/模拟器上验证运行时包名。

运行命令：
```bash
./gradlew testDevDebugUnitTest          # 跑本地单元测试
./gradlew connectedDevDebugAndroidTest  # 跑仪器测试（需连真机）
```

---

## 方法五：手机设置中查看

### 方式 A：通过系统设置
设置 → 应用管理 → 目标应用 → 应用信息 → 部分品牌在底部直接显示包名。

### 方式 B：通过开发者选项
开启开发者选项 → 开启"显示布局边界" → 桌面长按图标查看。

### 方式 C：第三方工具
安装「App Inspector」「APK 信息查看器」等应用直接列出所有包名。

---

## 如何在 Android Studio 中打开

1. 复制 `local.properties.template` 为 `local.properties`，修改 `sdk.dir` 为你本机 SDK 路径
2. Android Studio → Open → 选择本文件夹
3. 等待 Gradle 同步完成
4. 在 Build Variants 窗口选择 `devDebug` 或 `prodRelease` 构建变体
5. 点击运行，即可在手机上看到包名演示结果

---

## namespace vs applicationId 速查表

| 对比项 | namespace | applicationId |
|--------|-----------|---------------|
| 位置 | build.gradle 顶层 android {} | defaultConfig {} / productFlavors {} |
| 作用 | R 类 / BuildConfig 的 Java 包名 | 设备上的唯一应用标识 |
| 修改影响 | 需同步迁移 java 目录结构 | 仅改变设备识别，不影响代码 |
| 多渠道区分 | 不支持 | 通过 applicationIdSuffix 实现（见本工程 flavor 配置） |
| 最终 APK 上的包名 | 不影响 | 决定一切 |

---

## 快速验证清单

- [ ] 根目录 `build.gradle` / `settings.gradle` / `gradle.properties` 齐全
- [ ] `local.properties` 已配置本机 SDK 路径
- [ ] Gradle Wrapper 配置存在（`gradle/wrapper/gradle-wrapper.properties`）
- [ ] `AndroidManifest.xml` 已注册全部 3 个 Activity
- [ ] `app/build.gradle` 含 flavor 多渠道配置（dev/prod）
- [ ] 运行 `scripts/获取包名-adb.bat` 验证 adb 连接
- [ ] 运行 `./gradlew testDevDebugUnitTest` 单元测试通过
- [ ] 编译安装 App 后，MainActivity 界面显示 4 种代码方式的结果
- [ ] 运行 PkgUtilsActivity，验证 3 个扩展场景输出
- [ ] 在手机设置中确认包名与 applicationId 一致
