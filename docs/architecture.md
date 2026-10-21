# Nova UI Kit 架构模块地图

> 对应《后续工作计划》B2.6 · 2026-07  
> 目标：按「改 X 去哪」定位，不必先读完 `BuilderShowcase.tsx`。

---

## 1. 顶层结构

| 路径 | 职责 | 何时改这里 |
|------|------|------------|
| `src/App.tsx` | 应用壳、主题、i18n、命令面板入口 | 语言/主题/全局快捷键 |
| `src/components/layout/` | 桌面壳、导航轨、状态栏、标题栏 | 窗口 chrome、全局导航 |
| `src/components/ui/` | shadcn 风格原子组件 | 通用控件外观与 a11y |
| `src/components/showcase/BuilderShowcase.tsx` | 编辑器主体编排（体积有守卫） | 尽量不加长；新功能进 `builder/` |
| `src/components/showcase/builder/` | 领域模块与 Dock/面板 | **日常功能开发主战场** |
| `src-tauri/src/` | Tauri command、持久化、目标应用生成 | 桌面能力、生成链路 |
| `scripts/check-*.mjs` | 契约与冒烟 | 验收门禁 |
| `output/ui-audit/` `output/goal-audit/` | 文本裁切 / 密度审计 | 体验回归 |

---

## 2. `builder/` 模块职责

### 2.1 类型（已按域拆分）

| 文件 | 职责 |
|------|------|
| `types-canvas.ts` | 组件类型联合、画布/断点/布局/控件尺寸 |
| `types-project.ts` | 项目模型、控件树、事件、Rust 命令、后端、历史、拖拽 |
| `types-release.ts` | 发布/安装包/流水线/窗口 chrome |
| `types.ts` | 兼容桶 `export *`；新代码可直连域模块 |

### 2.2 领域逻辑（无 JSX）

| 文件 | 职责 |
|------|------|
| `layout.ts` | Frame 布局度量、约束、归一化 |
| `responsive.ts` | 断点覆盖 |
| `event-bindings.ts` | UI 事件 ↔ Rust command |
| `rust-commands.ts` | 命令名清洗、签名、source map |
| `diagnostics.ts` | 诊断聚合 |
| `change-impact.ts` | 变更影响图 |
| `backend.ts` | 后端集成 / sidecar |
| `task-center.ts` | 任务队列与步骤 |
| `release.ts` | 发布流水线模型 |
| `simulator.ts` | 事件模拟轨迹 |
| `project-templates.ts` | 项目/组件脚手架 |
| `build-results.ts` | 构建结果摘要 |
| `ids.ts` | id 生成 |

### 2.3 UI 面板

| 文件 | 职责 |
|------|------|
| `SelectionActionBar.tsx` | 画布顶选择条（idle/single/multi + overflow） |
| `OutputDock.tsx` | 底部输出 Dock |
| `ProjectDock.tsx` | 项目树 / DockTabList |
| `InspectorDock.tsx` | 属性检查器壳 |
| `NavigatorDock.tsx` | 导航器壳 |
| `DesignWorkspace.tsx` / `LogicWorkspace.tsx` / `BuildWorkspace.tsx` | 各模式页壳 |

---

## 3. `BuilderShowcase.tsx` 导航（约）

| 行号 | 内容 |
|------|------|
| 1–400 | 导入 |
| 400–6000 | 调色板、组件定义、纯 helper |
| 6000–16000 | 项目/文件/持久化 |
| 16000–22000 | 选择、画布几何、拖拽 |
| 22000–31000 | 内联编辑、快捷键、模拟 |
| 31000–34000 | 选择条派生、体验审计 |
| 34000–36000 | 模式轨运行区、顶栏 |
| 36000–49000 | 各模式主 JSX |
| 49000–53000 | SelectionActionBar / OutputDock 调用 |

**约定（B2.1）**：新面板/大块 JSX 进 `builder/*.tsx`；`check-showcase-size` 禁止 `BuilderShowcase` 行数回涨（当前上限见脚本）。

---

## 4. 生成链路（Tauri）

| 文件 | 职责 |
|------|------|
| `generated_app_runtime.rs` | 目标应用源码/配置生成（C1 目标：模板分段） |
| `generated_app_config.rs` | 生成配置 |
| `project_persistence.rs` | `.nova` 读写 |
| `project_paths.rs` | 路径规范化 |
| `project_writer.rs` | 落盘与 incremental_io |
| `lib.rs` | command 注册 |

---

## 5. 验收命令

```bash
npm run build
npm run check:builder-runtime
npm run check:components
npm run check:experience
node output/ui-audit/run-ui-text-audit.mjs
node output/goal-audit/run-goal-audit.mjs
```
