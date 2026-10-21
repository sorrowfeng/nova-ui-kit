# Nova UI Editor 后续计划

> 2026-07 · 基于当前 main（`075e842d`）  
> 现状：构建全绿 · ui-audit 0 · 文档齐 · 实时预览已上线 · `BuilderShowcase` 仍约 5.2 万行

---

## 一、近期冲刺（1–2 周，高性价比）

### A. 代码健康（开发效率）

| 项 | 说明 | 产出 |
|----|------|------|
| **A1 继续拆 `BuilderShowcase`** | 按模式拆主 JSX：Project 树 / Design 画布节点渲染 / Logic Rust 区 / Build 就绪区 各自独立文件 | 目标 ≤ 20k 行；HMR 从「500KB babel 慢」变为秒级 |
| **A2 冒烟真拆分** | `check:builder-runtime` 功能门禁硬失败；布局像素断言进 `:layout` 可选套件 | CI 稳定，不再被无头 Dock 点击 flaky 卡住 |
| **A3 主包继续降** | 拆完 monolith 后按模式 `import()`；PreviewDock/Inspector 懒加载 | 主包 1.7MB → &lt;1MB |

### B. 使用体验（用户能感知）

| 项 | 说明 | 产出 |
|----|------|------|
| **B1 预览自动刷新** | 设计改动后防抖自动重编译预览（可开关） | 改完即看，不必手点「生成预览」 |
| **B2 构建环境向导** | 缺 Node/Rust 时给可复制安装命令与文档链接 | 降低首次门槛 |
| **B3 失败任务定位** | 点错误条目跳到文件/控件 | 调试更快 |
| **B4 模板向导** | 新建：选模板 → 填名称 → 直接进 Design | 三步进设计 |

---

## 二、中期（1–2 月，beta 前）

### C. 生成链路深化

| 项 | 说明 |
|----|------|
| **C1 组件 slots / 双向绑定 schema** | 生成代码支持插槽与 v-model 风格状态 |
| **C2 多语言生成模板** | 生成 app 跟随编辑器语言（zh/en） |
| **C3 生成 diff 可视化** | 真正的行级 diff 高亮，而非摘要条 |
| **C4 C++ FFI 纳入 CI 编译冒烟** | 在 Linux CI 编译 `examples/cpp-ffi` |

### D. 后端与发布

| 项 | 说明 |
|----|------|
| **D1 方法测试批量化 + 历史** | 保留最近 N 次后端方法测试结果 |
| **D2 Linux/macOS 实机打包** | 配置已齐，跑 `tauri:build` 验证矩阵 |
| **D3 Release 自动化** | tag → `release:notes` → 上传 exe/安装包 |
| **D4 版本号 / changelog 流程** | alpha → beta 语义与 schema 兼容声明 |

### E. 测试与质量

| 项 | 说明 |
|----|------|
| **E1 无障碍清单真机手测** | 按 `docs/accessibility-checklist.md` 走一轮并记录 |
| **E2 ui-audit 进 PR 门禁** | 防止 clip/overlap 回归 |
| **E3 组件覆盖率扩展** | 新控件三端（palette/editor/runtime）自动校验已有，补边界用例 |

---

## 三、长期（beta 之后）

| 项 | 说明 |
|----|------|
| **F1 插件式后端市场** | 一键导入 Python/Go/Node sidecar 模板 |
| **F2 协作 / 版本** | 项目 git 化、冲突合并 UI |
| **F3 主题与设计令牌** | 生成 app 跟随 MD3 令牌定制 |
| **F4 文档站** | 独立 docs 站点（黄金路径 + API + 教程） |

---

## 建议的下一轮顺序

```text
1. A1 拆 BuilderShowcase（开发手感立刻变好）
2. A2 冒烟拆分（CI 稳定）
3. B1 预览自动刷新（日常用起来顺）
4. B2 环境向导 + B4 模板向导（新手友好）
5. C1 slots schema（生成能力）
```

**一句话**：先把「改代码快、跑 CI 稳、用起来顺」打牢，再加深生成能力与发布自动化。
