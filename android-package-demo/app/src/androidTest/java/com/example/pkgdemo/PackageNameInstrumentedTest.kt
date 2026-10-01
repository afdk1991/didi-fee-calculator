package com.example.pkgdemo

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith

/**
 * 【方法四测试】仪器测试（Instrumented Test）—— 需真机或模拟器运行
 *
 * 运行方式：./gradlew connectedDevDebugAndroidTest
 */
@RunWith(AndroidJUnit4::class)
class PackageNameInstrumentedTest {

    private val context: Context = ApplicationProvider.getApplicationContext()

    @Test
    fun useAppContext() {
        // 验证设备上安装的包名与 BuildConfig 一致
        assertEquals(BuildConfig.APPLICATION_ID, context.packageName)
    }

    @Test
    fun verifyBuildEnvironment() {
        // 验证 flavor 环境标识
        println("当前构建环境: ${BuildConfig.BUILD_ENV}")
        println("当前包名: ${context.packageName}")
        assert(BuildConfig.BUILD_ENV.isNotEmpty())
    }
}
