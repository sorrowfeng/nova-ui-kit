# 构建发布与安装包证据（工作流 F1/F2/F4）

> 对应《后续工作计划》F1–F2、F4 · 2026-07

---

## 1. 发布流水线记录（F1）

| 能力 | 位置 |
|------|------|
| 流水线步骤证据 | `release_pipeline.rs`、`.nova/pipelines/` |
| 构建历史 | Build 页 `build-history`、`BuildHistoryEntry` |
| 失败可诊断 | 步骤 log + artifact evidence 快照 |

**打开复查**：Build 页 → 发布流水线 → 历史记录（含 step 命令、产物路径、状态）。

---

## 2. 安装包冒烟三档（F2）

| 模式 | 含义 | 状态机字段 |
|------|------|------------|
| `artifact-only` | 只检查产物存在与大小 | `InstallerSmokeStatus::artifact-only` |
| `write-script` | 写出安装/校验脚本 | `write-script` |
| `vm-handoff` | 交接 VM/沙箱执行 | `vm-handoff` + `InstallerSandboxHandoffResult` |

状态机：`not-requested → pending → artifact-only|write-script|passed|failed`。

相关：`installer_smoke.rs`、`ReleaseInstallerSmokeMode`、`ReleaseInstallerSmokeRunnerMode`。

---

## 3. 多平台包矩阵（F4）

| 目标 | `ReleaseBundleTarget` | 支持级别 |
|------|----------------------|----------|
| app | `app` | 主路径（Windows exe 优先） |
| nsis | `nsis` | Windows 安装包 |
| msi | `msi` | Windows |
| appimage / deb | `appimage` `deb` | Linux（按需验证） |
| dmg | `dmg` | macOS（按需验证） |

配置：`ProjectReleaseConfig.bundleTargets`；打包入口 `bundle_editor_project`。

**README 支持级别**：Windows 为一级；Linux/macOS 为二级（命令可用，CI 矩阵未全开）。

---

## 4. 验收

```bash
cargo test --manifest-path src-tauri/Cargo.toml release_
cargo test --manifest-path src-tauri/Cargo.toml installer
npm run check:builder-runtime
```

| 项 | 验收 |
|----|------|
| F1 | 历史记录可打开复查 |
| F2 | `installer_smoke` 三档状态机清晰 |
| F4 | README 说明支持级别 |

---

## 5. 待续

- F3 release notes 已有脚本 `npm run release:notes`；接 CI 自动草稿。
- 全平台 CI 验证矩阵。
