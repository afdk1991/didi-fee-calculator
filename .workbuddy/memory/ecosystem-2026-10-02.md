# 2026-10-02 扩展能力接入与全流程智能化

## 已完成
- 用前端设计 Skill 给 PWA 增加系统暗色模式 + 键盘无障碍焦点环（不改计费逻辑）。
- 用 EdgeOne Makers 连接器准备部署（脚本 deploy.mjs 已就绪，但环境未登录 → 待用户授权）。
- 用 recommend-connectors / recommend-experts 盘点生态：建议启用 像素匠(FrontendDeveloper)、掌中灵(MobileApplicationDeveloper) 专家；建议接入 腾讯文档、腾讯云 CloudBase 连接器。
- 提交到本地 git（11 文件，+840/-136）；Gitee 推送因本机无 SSH Key 失败，待用户 push。
- 生成 docs/ARCHITECTURE.md（架构 + 扩展全景 + 工作流）。

## 待办（需用户授权/本机操作）
- ~~EdgeOne 部署需登录（浏览器或 API Token）。~~ ✅ 已完成：daijia-calc（Production，全球加速），访问地址见对话置顶。
- Gitee push 需本机 SSH Key（环境无密钥，提交已在本地完成）。

## 约定
- 计费逻辑以 index.html 的 PRESETS + .test/calc.test.js 为准；改费率后同步跑测试与 sync-web.js。
- 部署优先级：EdgeOne Makers 最高（已连）。
