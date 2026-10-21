# 后续任务清单

> 2026-10-22 · `main` @ `0fa0164f` 之后
> 状态：构建全绿 · 功能/布局冒烟全绿 · Rust 68 通过 · a11y 自动化 38/38 · 主包 699 kB · 主 monolith 19859 行

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
| 9 | **继续拆 BuilderShowcase** | 目标 2 万行 | ✅ 完成（52021 → **19859**，`check-showcase-size` 上限已收紧到 20000；五个模式视图 + item preview + view-helpers + 模块作用域 + shell chrome + 三个纯 project-file builder 已抽出，剩余为状态与事件层） |
| 10 | **冒烟布局套件单列** | `:layout` / `:functional` / `:design` 三套互不阻塞 | ✅ 完成 |
| 11 | **主包 &lt;1MB** | 按模式 lazy + vendor 分包 | ✅ 完成（ShowcasePage 1793 kB → **699 kB** raw / 236 kB gzip；`check:bundle-size` 已并入 `npm run build`） |
| 12 | **Linux/macOS 实机打包** | 配置、CI 与产物校验就绪 | 🟡 自动化 ✅（`check:platform-bundle` + `workflow_dispatch` job + tag 全平台 + `verify-release-artifacts.mjs` 校验产物头/体积并出 `SHA256SUMS.txt`）；**仍需对应主机装一次并启动** |

### P3 — 产品化

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 13 | **文档站部署** | `docs-site.yml` → GitHub Pages | ✅ 完成 |
| 14 | **版本号 / changelog 自动化** | `version:set` / `changelog` / `release:prepare` + `release.yml` | ✅ 完成 |
| 15 | **无障碍真机手测** | 自动化 47/47，清单带明确预期的行全覆盖 | ✅ 完成（`npm run check:a11y` 覆盖 1.2 / 1.4 / 1.6 / 2.x / 3.3 / 3.5 / 4.x / 5.x / 6.1–6.7 / 7.2 / 7.3；读屏措辞走 `Accessibility.getFullAXTree`，即读屏真正念出的内容） |

---

## 仍需人工/外部主机

| 项 | 阻塞点 | 解锁方式 |
|----|--------|----------|
| P2-12 实机安装 | 无 Linux/macOS 主机 | 触发 `build.yml` 的 `linux-bundle` / `macos-bundle`（workflow_dispatch），或打 tag 走 `release.yml`；产物完整性已由 `verify-release-artifacts.mjs` 自动判定，剩下的是装上并启动一次 |
| P3-15 高对比 + 读屏 | 需真人 + 系统高对比主题 + NVDA/Narrator | 按 `docs/accessibility-checklist.md` 走 1.6 与 6.x 并填记录表；其余手动项已由 `check:a11y` 覆盖 |

---

## 建议下一轮

```text
1. P2-12 / P3-15：等主机与真人，走一遍剩余实机验证
2. 打 v0.2.0 tag，验证 release.yml 端到端（version:set → changelog → tag → 产物校验 → 发布）
3. 可选的再拆：BuilderShowcase 仍留 19859 行，继续抽状态层（useBuilderState + 按域 handler）可再降一档
```

一句话：**清单 15 项的工程侧已全部铺完，剩下两项只有真人和真机能做。**
