#!/usr/bin/env node
/**
 * sync-web.js — 统一 Web 资源
 * ------------------------------------------------------------
 * 根目录的 index.html / manifest.json / sw.js 是「单一可信源」。
 * Android 壳（android/app/src/main/assets/）里必须有一份一模一样的副本，
 * 否则 App 内嵌页面会与线上网页分叉、计费逻辑错位。
 *
 * 运行：node sync-web.js
 * 依赖：仅 Node 内置模块，无需安装任何包。
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const ASSETS = path.join(ROOT, 'android', 'app', 'src', 'main', 'assets');

// 需要单向同步的文件（根 -> assets）
const FILES = ['index.html', 'manifest.json', 'sw.js'];

function main() {
  if (!fs.existsSync(ASSETS)) {
    fs.mkdirSync(ASSETS, { recursive: true });
  }
  let changed = 0;
  for (const f of FILES) {
    const src = path.join(ROOT, f);
    const dst = path.join(ASSETS, f);
    if (!fs.existsSync(src)) {
      console.warn(`[跳过] 源文件不存在: ${f}`);
      continue;
    }
    const a = fs.readFileSync(src);
    const b = fs.existsSync(dst) ? fs.readFileSync(dst) : Buffer.alloc(0);
    if (Buffer.compare(a, b) !== 0) {
      fs.copyFileSync(src, dst);
      changed++;
      console.log(`[同步] ${f} -> assets/${f}  (${(a.length / 1024).toFixed(1)} KB)`);
    } else {
      console.log(`[一致] ${f} 无需更新`);
    }
  }
  console.log(changed ? `\n完成：更新了 ${changed} 个文件。` : '\n完成：assets 与根目录已完全一致。');
}

main();
