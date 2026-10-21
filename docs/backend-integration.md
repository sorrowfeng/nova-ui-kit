# 后端集成与 Sidecar 样例（工作流 E）

> 对应《后续工作计划》E1–E5 · 2026-07

---

## 1. 能力现状

| 能力 | 状态 | 位置 |
|------|------|------|
| Sidecar start/stop/status/日志 | 已有 | `backend_method_runner.rs`、Logic 页 |
| 方法级测试 `test_backend_integration_method` | 已有 | Tauri command + Logic UI |
| 资源检查 `inspect_backend_artifacts` | 已有 | `backend_artifact_inspector.rs` |
| C++ FFI starter | 已有（create-only） | `generated_project_files.rs` → `push_cpp_ffi_starter_files` |
| Sidecar / local-service starter | 已有（create-only） | `push_sidecar_starter_files` |
| 诊断与 source map | 已有 | `rust_source_map.rs`、Logic 跳转 |

---

## 2. 样例工程（E4）

**可运行样例**：

| 样例 | 路径 | 状态 |
|------|------|------|
| Python local-service | [`examples/python-local-service/`](../examples/python-local-service/) | 已跑通（health/add/echo/upper） |
| C++ FFI | [`examples/cpp-ffi/`](../examples/cpp-ffi/) | 已编译运行（MSVC，`nova_backend.dll` + demo PASSED） |

```bash
# Python
python examples/python-local-service/service.py --health
echo '{"method":"add","params":{"a":2,"b":40}}' | python examples/python-local-service/service.py

# C++ FFI (Windows)
cmake -S examples/cpp-ffi -B examples/cpp-ffi/build
cmake --build examples/cpp-ffi/build --config Release
.\examples\cpp-ffi\build\bin\Release\nova_backend_demo.exe
```

生成计划在识别到 `backendIntegrations[].kind` 时写入 **create-only starter**（不覆盖用户修改）：

| kind | 产物 |
|------|------|
| `cpp-ffi` | `README.md`、`include/nova_backend.h`、CMake/构建说明、加载脚本 |
| `sidecar` / `local-service` | 可执行入口脚本、健康检查、stdio/http 约定说明 |

**推荐黄金路径（Python local-service）**：

1. Project 页新建项目 → Logic 页添加 Backend Integration（kind=`local-service`, language=`python`）。
2. 生成计划包含 `backend/<name>/` starter；落盘后按 README 填实现。
3. `healthCheckCommand` 可用后，在 Logic 页跑方法测试 → `passed/failed/skipped` 可追溯。
4. Build 页 `inspect_backend_artifacts` 确认资源路径；打包后可执行。

---

## 3. 生命周期与失败路径（E1）

- start：按 `command` + `startupTimeoutMs` 启动；失败写任务日志。
- stop：进程结束 / 任务取消。
- status：pid + 最近 stdout/stderr 预览。
- 重试：方法测试失败可手动重跑；starter 不覆盖用户修复。

---

## 4. 验收命令

```bash
cargo test --manifest-path src-tauri/Cargo.toml backend_
npm run check:experience
npm run check:builder-runtime
```

| 项 | 验收 |
|----|------|
| E1 | `backend_method_runner` / `installer_smoke` 覆盖失败路径 |
| E2 | Logic 页方法测试状态可追溯 |
| E3 | `inspect_backend_artifacts` |
| E4 | starter 生成且 `sidecar_starter_files_are_planned_only_when_missing` |
| E5 | source map 回跳稳定 |

---

## 5. 待续

- 非 Rust 端到端「一键可运行」演示工程（需本机编译器/运行时）。
- 方法测试批量套件与 CI 集成。
