# 插件式后端模板库

> 对应长期项 D1 · 把 `examples/` 形式化为可导入的后端模板注册表

---

## 模板注册表

| id | kind | language | 入口 | 健康检查 | 说明 |
|----|------|----------|------|----------|------|
| `python-local-service` | local-service | python | `service.py` | `--health` | stdio JSON，方法路由 |
| `cpp-ffi` | cpp-ffi | cpp | `nova_backend.dll` | `nova_backend_version` | extern "C" ABI |
| `node-sidecar` | sidecar | node | `src/index.mjs` | `--health` | stdio JSON（生成计划内置） |
| `go-sidecar` | sidecar | go | `main.go` | `--health` | stdio JSON（生成计划内置） |

## 导入方式

### 1) Nova UI（推荐）

Logic 页 → 添加后端集成 → kind/language 选择后，生成计划会写入 create-only starter（不覆盖手改）。

### 2) 手动拷贝

```bash
# Python
cp -r examples/python-local-service <project>/backend/my-service
python <project>/backend/my-service/service.py --health

# C++ FFI
cmake -S examples/cpp-ffi -B examples/cpp-ffi/build
cmake --build examples/cpp-ffi/build --config Release
# artifact: examples/cpp-ffi/build/bin/Release/nova_backend.dll
```

### 3) 作为模板库复用

```ts
import { novaBackendTemplates } from "@/components/showcase/builder/backend-templates";

const tpl = novaBackendTemplates.find((t) => t.id === "python-local-service");
// tpl.files -> 相对路径与内容（或 read 命令）
```

## 约定

- **协议**：stdio JSON，`{method, params, id}` → `{success, message, patch, result, id}`
- **健康检查**：`--health` 返回 `{"success":true,...}`
- **create-only**：starter 不覆盖用户修改
- **资源路径**：`resourcePath` 用于 Tauri bundle resources

## 新增模板 checklist

- [ ] `examples/<id>/README.md` 含构建/运行命令
- [ ] `--health` 或等价探针
- [ ] 至少 2 个业务方法（如 add/echo）
- [ ] 生成计划注册（`generated_project_files.rs`）
- [ ] 文档表格补一行
