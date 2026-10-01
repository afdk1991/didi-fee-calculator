@echo off
chcp 65001 >nul
REM ============================================================
REM  【方法二扩展】命令行直接打印最终包名（无需打开 Android Studio）
REM  原理：执行 gradlew 任务，从 build 配置中读取 applicationId
REM ============================================================

echo.
echo ====== 方式 1：gradlew 直接打印所有 variant 的 applicationId ======
cd /d "%~dp0\.."
if exist gradlew.bat (
    call gradlew.bat :app:printAllApplicationIds
) else (
    echo [提示] 未找到 gradlew.bat，尝试用系统 gradle...
    gradle :app:printAllApplicationIds
)
echo.

echo ====== 方式 2：从 APK 输出目录读取（build 后）======
if exist "app\build\outputs\apk" (
    echo 已构建的 APK 文件：
    dir /s /b app\build\outputs\apk\*.apk
) else (
    echo [提示] 尚未构建 APK，先运行: gradlew assembleDevDebug
)
echo.

pause
