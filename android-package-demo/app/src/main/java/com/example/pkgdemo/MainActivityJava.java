package com.example.pkgdemo;

import android.content.pm.PackageInfo;
import android.content.pm.ApplicationInfo;
import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

/**
 * 【方法四补充】Java 版代码动态获取包名示例
 *
 * 与 MainActivity.kt 对应，展示 Java 写法。
 * 如果项目使用 Java 开发，可直接参考此类。
 */
public class MainActivityJava extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        TextView tvResult = findViewById(R.id.tvResult);
        StringBuilder sb = new StringBuilder();

        // ── 方式 1：最常用 —— getPackageName() ──
        String method1 = getPackageName();
        sb.append("【Java 版】\n");
        sb.append("方法1 getPackageName():\n  ").append(method1).append("\n\n");

        // ── 方式 2：PackageManager + PackageInfo ──
        try {
            PackageInfo info = getPackageManager().getPackageInfo(getPackageName(), 0);
            sb.append("方法2 PackageInfo:\n  ").append(info.packageName).append("\n\n");
        } catch (Exception e) {
            sb.append("方法2 异常: ").append(e.getMessage()).append("\n\n");
        }

        // ── 方式 3：ApplicationInfo ──
        try {
            ApplicationInfo appInfo = getPackageManager().getApplicationInfo(getPackageName(), 0);
            sb.append("方法3 ApplicationInfo:\n  packageName=").append(appInfo.packageName);
            sb.append("\n  label=").append(getPackageManager().getApplicationLabel(appInfo));
            sb.append("\n\n");
        } catch (Exception e) {
            sb.append("方法3 异常: ").append(e.getMessage()).append("\n\n");
        }

        // ── 方式 4：BuildConfig.APPLICATION_ID ──
        sb.append("方法4 BuildConfig.APPLICATION_ID:\n  ")
          .append(BuildConfig.APPLICATION_ID);

        tvResult.setText(sb.toString());
    }
}
