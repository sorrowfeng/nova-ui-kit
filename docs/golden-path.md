# Nova 黄金路径（新项目 → 可执行文件）

> 对应阶段 2 出口条件 · 2026-07  
> 前置：`npm install`，本机已装 Rust / Tauri 依赖

---

## 路径总览

```text
新建项目 → 设计画布 → 绑定 Rust 命令 → 生成目标应用 → 构建 exe
   Project      Design         Logic            Build           Build
```

---

## 1. 新建项目（Project）

1. 启动：`npm run tauri:dev`（或 `npm run dev` 看前端）。
2. 左轨 **Project** 模式 → 新建 / 打开项目。
3. 确认 `.nova/` 与 `nova.project.json` 已生成（见 `docs/project-schema.md`）。
4. `schemaVersion` 会自动迁移；旧项目可直接打开。

**验收**：项目树出现 `ui/`、`rust/logic.rs`、`app/`（生成区）。

---

## 2. 设计画布（Design）

1. 切到 **Design** 模式。
2. 从左侧组件库插入控件（或用「常用控件」快速插入）。
3. 画布上拖动、对齐、多选（Ctrl/Shift）；顶选择条显示 idle/single/multi。
4. 右侧检查器改文案、尺寸、布局。
5. 顶栏可切换断点 / 窗口 chrome 预览。

**验收**：选择条状态正确；`npm run check:builder-runtime` 含 singleSelection / multiSelection。

---

## 3. 绑定 Rust 命令（Logic）

1. 切到 **Logic** 模式。
2. 在命令中心添加 command（如 `app_message`）。
3. 回到 Design：选中按钮 → 选择条「连接 / 创建绑定」→ 绑定 `click`。
4. Logic 页可「转到槽函数」；source map 支持回跳。
5. （可选）添加后端集成：
   - Python：`examples/python-local-service/`
   - C++ FFI：`examples/cpp-ffi/`（`npm run check:cpp-ffi`）

**验收**：事件显示「已绑定」；`goToSlotRuntime` 冒烟通过。

---

## 4. 生成目标应用（Build）

1. 切到 **Build** 模式。
2. 「生成文件计划」→ 预览 create/update/unchanged。
3. 落盘：`app/` 更新；用户手改的 starter 不覆盖（`docs/generated-write-policy.md`）。
4. 「生成窗口校验」可看 titlebar/windowKind 矩阵快照。

**验收**：`check:runtime-contract` / `check:generated-runtime` 通过。

---

## 5. 构建 exe（Build）

1. 就绪检查全绿后点 **exe**（`tauri build --no-bundle`）。
2. 或完整打包：**打包** → nsis/msi 等（见 `docs/release-pipeline.md`）。
3. 任务队列 / 运行日志可复查证据。
4. 安装包冒烟：artifact-only / write-script / vm-handoff 三档。

**验收**：

```bash
npm run build
npm run check:builder-runtime
npm run verify:desktop   # 桌面 release 路径
npm run tauri:exe
```

---

## 6. 发版前勾选

- [ ] `npm run docs:screenshots` 更新四模式截图
- [ ] `node output/ui-audit/run-ui-text-audit.mjs` 无回归
- [ ] `docs/accessibility-checklist.md` 抽测一轮
- [ ] `npm run release:notes` 生成变更草稿
- [ ] README / Roadmap / 脚本表已同步

---

## 相关文档

| 文档 | 用途 |
|------|------|
| `docs/architecture.md` | 改哪里 |
| `docs/project-schema.md` | 项目格式 |
| `docs/generated-write-policy.md` | 生成/覆盖策略 |
| `docs/backend-integration.md` | Sidecar/FFI |
| `docs/release-pipeline.md` | 发布证据 |
| `docs/accessibility-checklist.md` | 无障碍 |
| `examples/` | Python / C++ 样例 |
