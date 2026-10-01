# 【proguard-rules.pro】—— 混淆规则（当前为空，release 构建时使用）

# 保留 BuildConfig 类（包名获取依赖它）
-keep class com.example.pkgdemo.BuildConfig { *; }
