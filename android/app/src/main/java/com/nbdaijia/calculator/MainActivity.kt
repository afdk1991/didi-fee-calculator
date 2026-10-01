package com.nbdaijia.calculator

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.webkit.GeolocationPermissions
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat

class MainActivity : AppCompatActivity() {

    private lateinit var web: WebView

    private val locationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
            // 无论用户是否授权，都继续加载页面；HTML 里有失败兜底
        }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        web = findViewById(R.id.webview)
        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true           // localStorage 必须开（状态持久化依赖它）
            databaseEnabled = true
            setGeolocationEnabled(true)
            allowFileAccess = true
            allowContentAccess = true
            allowUniversalAccessFromFileURLs = true   // file:// 页面 fetch https 接口
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT

            // 移动端视口与缩放优化
            loadWithOverviewMode = true
            useWideViewPort = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            // 适配网页中的 viewport-fit=cover 安全区
            @Suppress("DEPRECATION")
            saveFormData = false
        }

        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url ?: return false
                // 外部链接（高德控制台等）交给系统浏览器
                if (url.toString().startsWith("http") &&
                    url.host != null &&
                    url.host!!.contains("amap.com").not() &&
                    url.host!!.contains("restapi.amap.com").not()
                ) {
                    startActivity(Intent(Intent.ACTION_VIEW, url))
                    return true
                }
                return false
            }

            // 主框架加载失败（如资源缺失 / 离线）：给出友好提示而非白屏
            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                if (request?.isForMainFrame != false) {
                    val msg = when (error?.errorCode) {
                        ERROR_CONNECT -> "网络异常，请检查网络后重试"
                        ERROR_HOST_LOOKUP, ERROR_TIMEOUT -> "无法连接，请检查网络"
                        else -> "页面加载失败，请重试"
                    }
                    showToast(msg)
                }
            }
        }

        web.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                // HTML 里 navigator.geolocation 的权限弹窗：直接放行（本地计算器场景）
                callback?.invoke(origin, true, false)
            }

            // 便于本地调试时查看网页 console 输出
            override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                consoleMessage?.let {
                    android.util.Log.d("DJWebView", "${it.message()} @ ${it.lineNumber()}")
                }
                return true
            }
        }

        // 请求定位权限
        ensureLocationPermission()

        if (savedInstanceState == null) {
            web.loadUrl("file:///android_asset/index.html")
        } else {
            web.restoreState(savedInstanceState)
        }
    }

    private fun showToast(msg: String) {
        android.widget.Toast.makeText(this, msg, android.widget.Toast.LENGTH_SHORT).show()
    }

    private fun ensureLocationPermission() {
        val perms = arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        val need = perms.any {
            ActivityCompat.checkSelfPermission(this, it) != android.content.pm.PackageManager.PERMISSION_GRANTED
        }
        if (need) locationPermissionLauncher.launch(perms)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (web.canGoBack()) {
            web.goBack()
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web.saveState(outState)
    }

    override fun onPause() {
        super.onPause()
        web.onPause()
    }

    override fun onResume() {
        super.onResume()
        web.onResume()
    }

    override fun onDestroy() {
        web.destroy()
        super.onDestroy()
    }
}
