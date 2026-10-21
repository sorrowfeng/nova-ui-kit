# 后续任务清单

> 2026-10-22 · `main` @ `704bf452` 之后
> 状态：构建全绿 · 功能/布局冒烟全绿 · Rust 68 通过 · a11y 自动化 24/24 · 主包 803 kB

---

## 已完成（本轮累计）

| 领域 | 交付 |
|------|------|
| 编辑体验 | 引导、快捷键浮层、一键运行、实时预览 Dock、右键搜索、资源拖放、批量编辑、画布 Ctrl+F |
| 生成链路 | slots/双向绑定 schema、多语言 locale、行级 diff、写盘策略、模板分段 |
| 后端 | Python/C++/Node/Go 模板库、方法测试、健康检查、Git 快照、冲突合并编辑器 |
| 质量 | ui-audit 0、功能冒烟门禁、布局冒烟门禁、Rust 68 tests、CI（含 C++ FFI）、a11y 自动化 |
| 文档 | 17 篇 + 静态文档站（导航/全文搜索）+ CLI 检索 + GitHub Pages 部署工作流 |
| 发布 | 版本号三处对齐 + changelog 生成 + tag → release:notes → 多平台产物上传 |

---

## 后续任务（按优先级）

### P0 — 稳定性与正确性

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 1 | **冲突合并 per-hunk 应用** | 逐 hunk 组合后写回；`git_conflict.rs` + `ConflictMergeEditor` | ✅ 完成 |
| 2 | **生成 diff 行级高亮** | Myers diff + `GeneratedDiffView` 行级标注 | ✅ 完成 |
| 3 | **多语言/主题写入生成样式** | `generated_theme.rs` 写入 CSS 变量与文案 | ✅ 完成 |
| 4 | **真实冲突场景测试** | `real_git_conflict_resolves_per_hunk` 走真 git 仓库 | ✅ 完成 |

### P1 — 体验深化

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 5 | **文档站搜索全文内容** | 标题加权 + 正文命中 + `<mark>` 片段 + `?q=` 页内高亮 | ✅ 完成 |
| 6 | **冲突合并键盘操作** | 1/2/3 选边，Alt+↑/↓ 遍历 hunk | ✅ 完成 |
| 7 | **预览热重载** | `useDebouncedPreviewReload` 1.2s 防抖 | ✅ 完成 |
| 8 | **模板向导多模板** | 引导接入 dashboard/settings/dialog/data-tool 模板 | ✅ 完成 |

### P2 — 工程健康

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 9 | **继续拆 BuilderShowcase** | 目标 2 万行 | 🔄 52021 → **31190**（Project/Logic/Build/Design 视图 + item preview + view-helpers 已抽出；剩余为状态与事件层） |
| 10 | **冒烟布局套件单列** | `:layout` / `:functional` / `:design` 三套互不阻塞 | ✅ 完成 |
| 11 | **主包 &lt;1MB** | 按模式 lazy + vendor 分包 | ✅ 完成（ShowcasePage 1793 kB → **803 kB**） |
| 12 | **Linux/macOS 实机打包** | 配置与 CI 就绪 | 🟡 配置/CI ✅（`check:platform-bundle` + `workflow_dispatch` job + tag 全平台）；**产物验证仍需对应主机** |

### P3 — 产品化

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 13 | **文档站部署** | `docs-site.yml` → GitHub Pages | ✅ 完成 |
| 14 | **版本号 / changelog 自动化** | `version:set` / `changelog` / `release:prepare` + `release.yml` | ✅ 完成 |
| 15 | **无障碍真机手测** | 自动化子集 24/24 + 手动项清单 | 🟡 自动化 ✅（`npm run check:a11y`）；**读屏/系统缩放仍需真人走一轮** |

---

## 仍需人工/外部主机

| 项 | 阻塞点 | 解锁方式 |
|----|--------|----------|
| P2-12 产物实机验证 | 无 Linux/macOS 主机 | 触发 `build.yml` 的 `linux-bundle` / `macos-bundle`（workflow_dispatch），或打 tag 走 `release.yml` |
| P12-15 读屏手测 | 需真人 + NVDA/Narrator + 系统缩放 | 按 `docs/accessibility-checklist.md` 手动项（1.4 / 1.6 / 2.7 / 3.3 / 6.x / 7.3）走一轮并填记录表 |
| P2-9 余量 | 状态/事件层与 JSX 耦合 | 下一步：把 reducer/hook 抽成 `useBuilderState` 等模块，再按域拆 handler |

---

## 建议下一轮

```text
1. P2-9 收尾：把 BuilderShowcase 的状态层抽成自定义 hook，冲 2 万行
2. P2-12 / P3-15：等主机与真人，走一遍剩余实机验证
3. 打 v0.2.0 tag，验证 release.yml 端到端（version:set → changelog → tag → 产物）
```

一句话：**工程侧的自动化已经铺完，剩下的都是需要真实主机或真实人的验证。**
