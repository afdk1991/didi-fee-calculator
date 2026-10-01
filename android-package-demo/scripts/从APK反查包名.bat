@echo off
chcp 65001 >nul
REM ============================================================
REM  【方法三扩展】不依赖 aapt，从 APK 反查包名
REM  原理：APK 本质是 zip，读取其中的 AndroidManifest.xml（二进制）
REM        用 pm 命令在设备上安装后查询，或解包读取。
REM ============================================================

echo.
set /p apkpath="请输入 APK 文件完整路径："

if not exist "%apkpath%" (
    echo [错误] 文件不存在: %apkpath%
    pause
    exit /b 1
)

echo.
echo ====== 方式 A：通过 aapt 读取（推荐，需 Android SDK build-tools）======
where aapt >nul 2>nul
if %errorlevel%==0 (
    aapt dump badging "%apkpath%" | findstr /i "package: name"
) else (
    echo [跳过] 未找到 aapt，请确认 Android SDK build-tools 已加入 PATH
)

echo.
echo ====== 方式 B：通过 aapt2 读取（新版 SDK）======
where aapt2 >nul 2>nul
if %errorlevel%==0 (
    aapt2 dump badging "%apkpath%" | findstr /i "package"
) else (
    echo [跳过] 未找到 aapt2
)

echo.
echo ====== 方式 C：通过 adb 安装后查询（需连接手机）======
adb get-state >nul 2>nul
if %errorlevel%==0 (
    echo 设备已连接，正在临时安装并查询...
    adb install -r "%apkpath%" >nul 2>nul
    REM 从 APK 路径推断不出包名，这里列出最近安装的第三方包
    echo 最近安装的应用包名列表：
    adb shell pm list packages -3 -3
    echo.
    echo 请在上面列表中找到你刚安装的包名。
) else (
    echo [跳过] 未检测到已连接的 Android 设备
)

echo.
echo 完成！
pause
