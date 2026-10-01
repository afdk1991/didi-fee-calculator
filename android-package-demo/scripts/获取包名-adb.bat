@echo off
chcp 65001 >nul
REM ============================================================
REM  【方法三】通过 adb 命令获取 Android 应用包名
REM  使用前请确认：
REM    1. 手机已开启「开发者选项」→「USB调试」
REM    2. 手机已通过 USB 连接电脑并授权
REM    3. 电脑已安装 adb 并加入 PATH
REM ============================================================

echo.
echo ====== 方法 3-1：查看当前前台 App 的包名 ======
adb shell dumpsys window | findstr "mCurrentFocus mFocusedApp"
echo.

echo ====== 方法 3-2：列出设备上所有第三方应用包名 ======
adb shell pm list packages -3
echo.

echo ====== 方法 3-3：列出设备上所有系统应用包名 ======
adb shell pm list packages -s
echo.

echo ====== 方法 3-4：列出全部已安装应用包名 ======
adb shell pm list packages
echo.

echo ====== 方法 3-5：根据关键词搜索包名 ======
set /p keyword="请输入要搜索的关键词（如 wechat）："
adb shell pm list packages | findstr /i "%keyword%"
echo.

echo ====== 方法 3-6：从 APK 文件读取包名（需要 aapt）======
set /p apkpath="请输入 APK 文件完整路径："
aapt dump badging "%apkpath%" | findstr /i "package: name"
echo.

echo ====== 方法 3-7：查看指定包名的详细信息 ======
set /p pkgname="请输入要查询的包名："
adb shell dumpsys package %pkgname% | findstr /i "versionName versionCode firstInstallTime lastUpdateTime"
echo.

echo 完成！
pause
