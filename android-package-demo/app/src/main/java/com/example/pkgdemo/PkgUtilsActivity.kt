package com.example.pkgdemo

import android.app.ActivityManager
import android.content.Context
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/**
 * 【方法四扩展】更多代码获取包名的实用场景
 *
 * 除了最基础的 packageName，这里补充 3 个常见实际开发中
 * 会用到的「通过包名判断」的场景。
 */
class PkgUtilsActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 用代码动态生成一个简单界面，不依赖额外布局文件
        val root = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(48, 96, 48, 48)
        }

        val tvTitle = TextView(this).apply {
            text = "包名实用场景扩展"
            textSize = 20f
            setPadding(0, 0, 0, 32)
        }
        root.addView(tvTitle)

        val tvResult = TextView(this).apply {
            textSize = 13f
            setTypeface(android.graphics.Typeface.MONOSPACE)
            setLineSpacing(8f, 1f)
        }
        root.addView(tvResult)

        setContentView(root)

        // ── 场景 1：判断当前 App 是否在前台运行 ──
        val am = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val runningApps = am.runningAppProcesses
        val isForeground = runningApps.any {
            it.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
                    && it.processName == packageName
        }

        // ── 场景 2：获取当前进程名（多进程应用常用）──
        val myPid = android.os.Process.myPid()
        var processName = "unknown"
        for (process in runningApps) {
            if (process.pid == myPid) {
                processName = process.processName
                break
            }
        }

        // ── 场景 3：判断本应用是否为系统签名/系统应用 ──
        val isSystemApp = applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_SYSTEM != 0

        tvResult.text = """
            扩展场景演示
            ─────────────────────
            场景1 是否前台运行: ${if (isForeground) "是 ✓" else "否"}
            场景2 当前进程名: $processName
            场景3 是否系统应用: ${if (isSystemApp) "是" else "否（普通应用）"}

            ─────────────────────
            基础包名回顾:
            packageName = $packageName
        """.trimIndent()
    }
}
