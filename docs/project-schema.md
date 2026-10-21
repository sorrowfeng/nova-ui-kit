# Nova 项目 Schema 与兼容策略（G2）

> 版本：2026-07 · 状态：草案  
> 范围：`.nova` 工作区、`nova.project.json`、生成文件计划、检查点

---

## 1. 项目目录布局

```text
<project-root>/
  nova.project.json      # 项目清单（名称、release、UI 文件、Rust 命令…）
  README.md              # 生成的项目说明（create-only starter）
  ui/                    # UI 页面与控件树
  rust/logic.rs          # 用户 Rust 逻辑（手改保护）
  rust/source-map.json   # 生成 Rust ↔ UI 映射
  .nova/
    editor-state.json    # 编辑器隐藏状态（面板、选择、缩放…）
    workspace.json       # 工作区元数据
    checkpoints/         # 项目快照
    builds/              # 构建证据
    pipelines/           # 发布流水线记录
    dependency-graph.json
  app/                   # 生成的 Tauri 目标应用（可再生成）
```

---

## 2. 关键文档字段

### 2.1 `nova.project.json`（摘要）

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` / `slug` | string | 项目名与包名 slug |
| `files[]` | DesignerFile | UI 文件列表（id/name/path/items/page） |
| `rustCommands[]` | RustCommand | 命令签名与结果 schema |
| `rustLogic` | string | 逻辑源码 |
| `release` | ProjectReleaseConfig | 窗口 chrome、打包目标、签名 |
| `backendIntegrations[]` | BackendIntegration | 插件后端 |
| `rootPath?` | string | 落盘根路径（缺省时按托管目录推导） |

### 2.2 `.nova/editor-state.json`

编辑器 UI 状态（非项目内容）。可随时删除重建；备份项目时可不含。

### 2.3 检查点 `checkpoints/`

- 每次关键写盘前可写快照；含 diff 与恢复入口。
- 格式由 `EditorProjectCheckpoint*` 类型定义（`types-project.ts`）。

### 2.4 生成文件计划

落盘前先计算 `PlannedGeneratedFile[]`：

| 状态 | 含义 |
|------|------|
| `create` | 磁盘无文件，将新建 |
| `update` | 内容有 diff，将覆盖 |
| `unchanged` | 字节一致，跳过（`incremental_io`） |
| `copy` | 从资源/starter 复制 |
| `managed` | 托管但不改写 |

**用户手改策略**：`create-only starter`（如 README、用户逻辑）不覆盖已有内容；`app/` 可整体再生。

---

## 3. 兼容与迁移策略

| 变更类型 | 策略 |
|----------|------|
| 新增可选字段 | 直接读；旧项目打开时补默认值 |
| 新增必填字段 | 读取时默认值 + 文档记录；下个 alpha 可收紧 |
| 删除/改名字段 | 保留读取别名 ≥1 个版本；写入仅新名 |
| 结构重构（files→items） | 版本字段 + 迁移函数；迁移可逆则保留备份 |
| 生成模板变更 | 目标 `app/` 可再生；不保证与旧 `app/` 字节兼容 |

**版本字段**：`nova.project.json` 含 `schemaVersion`（当前 **1**；无字段视为 v0）。

迁移入口（已实现）：`project_model::migrate_project_schema`，在 `read_editor_project` 时自动调用：

- v0 → v1：补默认 `files[]` / `rustCommands[]`，写入 `schemaVersion: 1`
- 更高版本：读取报错（防止旧编辑器破坏新项目）
- 单测：`project_model::migrate_tests`（4 项）

---

## 4. 相关类型位置

- `src/components/showcase/builder/types-project.ts` — 项目/文件/检查点
- `src/components/showcase/builder/types-release.ts` — 发布配置
- `src-tauri/src/project_persistence.rs` — 读写
- `src-tauri/src/project_paths.rs` — 路径
- `src-tauri/src/project_writer.rs` — 落盘与 incremental_io

验收：`npm run check:project-persistence`、`npm run check:runtime-contract`。

## 5. �������

```bash
npm run check:project-health -- <project-root>
```

��� JSON��`ok` / `issues` / `warnings` / `info`������ manifest��`schemaVersion`��`files`��`.nova/*`��`rust/logic.rs`��Ŀ¼�����ԡ��˳��� 0 ��ʾ�� issue��

i18n �Ǽܣ�`src/components/showcase/builder/generated-i18n.ts`��zh-CN / en-US ��Ϣ����������ģ��ѡ�ã���
