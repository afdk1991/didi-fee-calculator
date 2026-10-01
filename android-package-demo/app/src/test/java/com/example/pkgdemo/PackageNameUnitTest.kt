package com.example.pkgdemo

import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment

/**
 * 【方法四测试】本地单元测试（Robolectric）—— 在 JVM 上跑，无需真机
 *
 * 验证：代码中获取的 packageName 是否与 BuildConfig.APPLICATION_ID 一致。
 * 运行方式：./gradlew testDevDebugUnitTest
 */
@RunWith(RobolectricTestRunner::class)
class PackageNameUnitTest {

    private val context = RuntimeEnvironment.getApplication()

    @Test
    fun `packageName should match BuildConfig`() {
        val runtimePkg = context.packageName
        val buildConfigPkg = BuildConfig.APPLICATION_ID

        // 运行时包名应等于 BuildConfig 中定义的 applicationId
        assertEquals("运行时包名与 BuildConfig 不一致！", buildConfigPkg, runtimePkg)
    }

    @Test
    fun `packageName should not be empty`() {
        assert(context.packageName.isNotEmpty())
        assert(context.packageName.contains("."))  // 包名至少包含一个点
    }

    @Test
    fun `ApplicationInfo label should not be null`() {
        val appInfo = context.packageManager.getApplicationInfo(context.packageName, 0)
        val label = context.packageManager.getApplicationLabel(appInfo).toString()
        assert(label.isNotEmpty())
    }
}
