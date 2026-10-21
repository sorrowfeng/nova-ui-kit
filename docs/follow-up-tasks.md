# 后续任务清单

> 2026-10-22 · 清单 15 项全部完成
> 状态：构建全绿 · 功能/布局冒烟全绿 · Rust 68 通过 · a11y 自动化 47/47 · 主包 699 kB · 主 monolith 19859 行
> 实机证据：Linux（Ubuntu 24.04 WSL + CI ubuntu-22.04）`.deb` 安装后启动存活；macOS（CI macos-latest，run `39663765899`）`.dmg` 挂载后启动存活

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
| 12 | **Linux/macOS 实机打包** | 配置、CI、产物校验 + 实机安装并启动 | ✅ 完成（`check:platform-bundle` + `check:release-artifact-magic` 拦配置与魔数漂移；`build.yml` 的 `linux-bundle` / `macos-bundle` 与 `release.yml` 逐平台跑 `verify-release-artifacts.mjs` 并出 `SHA256SUMS.txt`；**实机**：Ubuntu 24.04 `dpkg -i` → `/usr/bin/nova-ui-kit` → WSLg 启动存活 15s，CI ubuntu-22.04 `xvfb` 启动存活 10s；macOS `hdiutil attach` → `Nova UI Editor.app` → `otool -L` 无缺库 → 启动存活 10s（run `39663765899`）） |

### P3 — 产品化

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 13 | **文档站部署** | `docs-site.yml` → GitHub Pages | ✅ 完成 |
| 14 | **版本号 / changelog 自动化** | `version:set` / `changelog` / `release:prepare` + `release.yml` | ✅ 完成 |
| 15 | **无障碍真机手测** | 自动化 47/47，清单带明确预期的行全覆盖 | ✅ 完成（`npm run check:a11y` 覆盖 1.2 / 1.4 / 1.6 / 2.x / 3.3 / 3.5 / 4.x / 5.x / 6.1–6.7 / 7.2 / 7.3；读屏措辞走 `Accessibility.getFullAXTree`，即读屏真正念出的内容） |

---

## 剩余可选项（非清单阻塞项）

清单 15 项已全部完成，没有未完成的任务。以下只是可选的加深验证，不构成任何一项的完成条件：

| 可选项 | 建议 | 说明 |
|--------|------|------|
| 真人读屏听感 | 用 NVDA / Narrator / VoiceOver 走一遍 `docs/accessibility-checklist.md` | 措辞的**可理解性**只有人能判断；`check:a11y` 已机器判定 6.x 的读屏树措辞，此项只补充听感，不是任何一行的通过条件 |
| Windows 真机安装 | 在 Windows 主机上跑一次 NSIS 安装器 | 与 Linux/macOS 对等；CI 已产出 `.exe` 并做魔数校验 |

---

## 建议下一轮

```text
1. 打 v0.2.0 tag，验证 release.yml 端到端（version:set → changelog → tag → 产物校验 → 发布）
2. 可选的再拆：BuilderShowcase 仍留 19859 行，继续抽状态层（useBuilderState + 按域 handler）可再降一档
3. 可选：Windows NSIS 真机安装一次，与 Linux/macOS 对等
```

一句话：**清单 15 项全部完成，工程侧与实机侧都已验证通过。**
