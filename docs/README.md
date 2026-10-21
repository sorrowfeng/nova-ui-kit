# Nova 文档站索引

> 入口页 · 按角色导航

## 快速开始

- [黄金路径](golden-path.md) — 新建 → 设计 → 绑定 → 生成 → exe
- [故障排查](troubleshooting.md) — 环境、构建、启动问题
- [可用性路线图](usability-roadmap.md) / [实测审计](usability-audit-run.md)

## 架构与规范

- [架构模块地图](architecture.md) — 改 X 去哪
- [项目 Schema](project-schema.md) — `.nova` 与迁移策略
- [生成写盘策略](generated-write-policy.md) — 覆盖 / create-only
- [主题令牌](../src/components/showcase/builder/theme-tokens.ts) — MD3 变量与生成样式

## 生成与后端

- [后端集成](backend-integration.md) — sidecar / FFI
- [插件后端模板库](backend-template-library.md) — 模板注册与导入
- [示例](../examples/) — Python / C++ FFI

## 版本管理

- **Git 快照**：Project → 健康检查 → Git 快照（init + commit）
- **冲突合并**：健康检查列出冲突文件 → 点击打开合并编辑器（保留本方 / 采用对方 / 两者都留）
- 命令：`read_git_conflict` / `resolve_git_conflict` / `git_project_status`

## 发布与质量

- [发布流水线](release-pipeline.md) / [平台矩阵](platform-matrix.md)
- [发布清单](release-checklist.md)
- [无障碍手测](accessibility-checklist.md)
- [后续计划](next-steps.md) / [工作计划](后续工作计划.md)

## 文档站工具

```bash
npm run docs:site    # 生成 docs-site/ 静态站点（导航+搜索）
npm run docs:search -- "关键词"   # CLI 全文检索
```
