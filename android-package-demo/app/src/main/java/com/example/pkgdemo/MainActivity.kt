package com.example.pkgdemo

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/**
 * 【方法四入口】包名获取演示主页面
 *
 * 包含：
 *  - 4 种代码获取包名的结果展示
 *  - 跳转到 Java 版示例
 *  - 跳转到扩展场景演示
 */
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 动态构建 UI，避免依赖复杂布局
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 96, 48, 48)
        }

        val tvTitle = TextView(this).apply {
            text = "Android 包名获取演示"
            textSize = 22f
            setTypeface(android.graphics.Typeface.DEFAULT_BOLD)
            setPadding(0, 0, 0, 24)
        }
        root.addView(tvTitle)

        val tvResult = TextView(this).apply {
            textSize = 13f
            setTypeface(android.graphics.Typeface.MONOSPACE)
            setLineSpacing(6f, 1f)
        }
        root.addView(tvResult)

        // ── 4 种代码方式获取包名 ──
        val method1 = "1. context.packageName:\n   $packageName"
        val info = packageManager.getPackageInfo(packageName, 0)
        val method2 = "2. PackageInfo.packageName:\n   ${info.packageName}"
        val appInfo = packageManager.getApplicationInfo(packageName, 0)
        val method3 = "3. ApplicationInfo:\n   pkg=${appInfo.packageName}\n   label=${packageManager.getApplicationLabel(appInfo)}"
        val method4 = "4. BuildConfig.APPLICATION_ID:\n   ${BuildConfig.APPLICATION_ID}"

        tvResult.text = """
            ── 4 种代码方式结果 ──
            $method1

            $method2

            $method3

            $method4
        """.trimIndent()

        // ── 跳转按钮 ──
        val btnJava = Button(this).apply {
            text = "查看 Java 版示例 →"
            setOnClickListener {
                startActivity(Intent(this@MainActivity, MainActivityJava::class.java))
            }
        }
        root.addView(btnJava)

        val btnUtils = Button(this).apply {
            text = "查看扩展场景演示 →"
            setOnClickListener {
                startActivity(Intent(this@MainActivity, PkgUtilsActivity::class.java))
            }
        }
        root.addView(btnUtils)

        setContentView(root)
    }
}
