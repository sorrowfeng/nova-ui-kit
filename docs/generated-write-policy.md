# 生成写盘策略（C4）

> 对应《后续工作计划》C4 · 2026-07

---

## 1. 目标

生成目标应用时：

1. **无变更不重写** — 避免 mtime 抖动与无意义 diff。
2. **可预期覆盖** — 管理文件可再生；用户文件不覆盖。
3. **冲突可诊断** — preview/apply 状态明确（create / update / unchanged / copy）。

---

## 2. 文件分类

| 类别 | 示例 | 策略 |
|------|------|------|
| **Managed regenerable** | `app/src/*`、`app/src-tauri/*`、生成的 `Cargo.toml` | 每次规划重算内容；`write_*_if_changed` 字节比对后写入或跳过 |
| **Create-only starter** | `README.md`、示例 sidecar 脚本、用户手改的 `rust/logic.rs` 起始内容 | **仅在磁盘不存在时写入**；存在则跳过 |
| **User-owned** | 用户手改的非模板资源 | 不删除、不覆盖（`remove_stale_generated_files` 只清理 `.rs` 且不在 expected/keep 列表） |
| **Asset copies** | 图标、资源 | `copy_file_if_changed` |

---

## 3. 实现入口

| 能力 | 位置 |
|------|------|
| 字节比对 / 增量写 | `src-tauri/src/incremental_io.rs` |
| 规划 preview / apply | `src-tauri/src/generated_files.rs` |
| 陈旧 `.rs` 清理 | `remove_stale_generated_files_with_keep` |
| create-only starter | `generated_project_files.rs`（`sidecar_starter_files_are_planned_only_when_missing` 测试） |
| 路径规范化 | `normalize_preview_relative_path`（`\` → `/`） |

---

## 4. 冲突场景

| 场景 | 期望行为 |
|------|----------|
| 生成内容与磁盘一致 | `unchanged`，不写盘 |
| 生成内容变化 | `update`，覆盖 managed 文件 |
| 磁盘无文件 | `create` |
| 用户改了 starter（README） | 保留用户内容，不覆盖 |
| 用户改了 managed `app/` 文件 | **下次生成会覆盖**（可再生成区）；preview 标 `update` |
| 用户删了 managed 文件 | 下次生成 `create` |
| expected 列表外的 `.rs` | 清理（keep 列表除外） |

**约定**：请勿手改 `app/`；要改逻辑请改 `rust/logic.rs` 或项目模型后重新生成。

---

## 5. 测试

- `incremental_io::tests::*` — 跳过相同内容、内容比对、stale 清理 + keep
- `generated_files::tests::*` — 路径规范化、preview 截断、汇总计数
- `generated_project_files::tests::sidecar_starter_files_are_planned_only_when_missing`
- `tests::save_project_files_preserves_unchanged_generated_file_mtime`
- `tests::apply_generated_files_writes_only_selected_targets_with_snapshot`

验收：`cargo test` + `npm run check:runtime-contract`。
