#!/bin/bash
# ============================================================
#  【方法三】通过 adb 命令获取 Android 应用包名（macOS / Linux 版）
# ============================================================

echo ""
echo "====== 方法 3-1：查看当前前台 App 的包名 ======"
adb shell dumpsys window | grep -E "mCurrentFocus|mFocusedApp"
echo ""

echo "====== 方法 3-2：列出所有第三方应用包名 ======"
adb shell pm list packages -3
echo ""

echo "====== 方法 3-3：列出所有系统应用包名 ======"
adb shell pm list packages -s
echo ""

echo "====== 方法 3-4：列出全部已安装应用包名 ======"
adb shell pm list packages
echo ""

echo "====== 方法 3-5：根据关键词搜索包名 ======"
read -p "请输入要搜索的关键词（如 wechat）：" keyword
adb shell pm list packages | grep -i "$keyword"
echo ""

echo "====== 方法 3-6：从 APK 文件读取包名（需要 aapt）======"
read -p "请输入 APK 文件完整路径：" apkpath
aapt dump badging "$apkpath" | grep -i "package: name"
echo ""

echo "====== 方法 3-7：查看指定包名的详细信息 ======"
read -p "请输入要查询的包名：" pkgname
adb shell dumpsys package "$pkgname" | grep -iE "versionName|versionCode|firstInstallTime|lastUpdateTime"
echo ""

echo "完成！"
read -n 1 -s -r -p "按任意键继续..."
