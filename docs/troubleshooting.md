# 故障排查 FAQ

> 常见环境与使用问题 · 2026-07

---

## 启动与窗口

### 双击 exe 后什么都不显示
- **常见原因**：前端资源是绝对路径 `/assets/...`，Tauri 生产环境加载失败 → 白屏/空窗  
- **修复**：`vite.config.ts` 设 `base: "./"`，重新 `npm run tauri:exe`
- 自检：`dist/index.html` 里的 `src=` / `href=` 应为 `./assets/...` 而不是 `/assets/...`
- 仍无窗口：删除 `%APPDATA%\com.nova.ui-kit` 后再启动；确认 WebView2 已安装

### 窗口出现了但是黑屏/白屏
- 开发工具（右键 → 检查，若启用了 devtools）看 Console 报错
- 跑 `npm run dev` 用浏览器打开 `http://127.0.0.1:1420` 对比

---

## 安装与启动

### `npm install` 很慢或失败
- 使用国内镜像：`npm config set registry https://registry.npmmirror.com`
- 删除 `node_modules` 与 `package-lock.json` 后重装

### `npm run tauri:dev` 报 WebView / Rust 错误
- Windows：安装 [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/)
- Linux：`libwebkit2gtk-4.1-dev`、`librsvg2-dev`、`libappindicator3-dev`、`patchelf`
- macOS：安装 Xcode Command Line Tools

### 端口 1420 被占用
```powershell
# 查找占用
Get-NetTCPConnection -LocalPort 1420
# 或修改 vite.config.ts 中的 port / strictPort
```

### 页面白屏
- 浏览器打开 `http://127.0.0.1:1420` 看 Console
- 跑 `npm run build` 看 TypeScript 错误
- 清除 `localStorage`（开发工具 → Application）

---

## 构建与检查

### `npm run build` 失败在 check:*
- 按报错里的「should contain」定位是契约还是真的回归
- `check:showcase-size` 失败：新代码请放进 `src/components/showcase/builder/`
- `check:experience` 失败：对照 `scripts/check-editor-experience.mjs` 断言

### `check:builder-runtime` 超时 / Page.navigate timed out
- 机器负载高时首次编译 500KB+ 主文件较慢，可再跑一次
- 确保没有其它 vite 占用端口
- `npm run check:watch` 可在开发时增量验证

### `check:cpp-ffi` 失败
- 确认 `examples/cpp-ffi` 存在
- 本地已编译时会跑 demo；未编译只查源码契约

### Rust 测试失败
```bash
cargo test --manifest-path src-tauri/Cargo.toml
```

---

## 编辑器使用

### 画布上找不到控件
- **Ctrl+F** 打开画布搜索，按名称/类型定位
- Navigator / 项目树里展开层级

### 快捷键不生效
- **F1** 或 **?** 打开快捷键速查
- 输入框内会跳过全局快捷键（避免打字冲突）

### 生成的 `app/` 被覆盖了
- 属于预期：`app/` 是可再生区（见 `docs/generated-write-policy.md`）
- 手改请放在 `rust/logic.rs` 或 create-only starter

### 示例项目打不开
- 命令面板 →「打开示例项目」
- 需处于 builder 模式；失败时看 toast 提示

### 项目打不开 / schema 错误
```bash
npm run check:project-health -- <项目目录>
```
- `schemaVersion` 过新：用新版 Nova 打开
- `.nova` 损坏：删除 `.nova/editor-state.json` 可重建编辑器状态

---

## 发布与打包

### exe 被杀软误报
- 未签名构建常见；可添加信任或使用 `docs/release-pipeline.md` 的签名配置

### 只要 exe 不要安装包
```bash
npm run tauri:exe
```

### Linux / macOS 打包
- 见 `docs/platform-matrix.md`；需在对应系统上执行 `npm run tauri:build`

---

## 仍然卡住？

1. `npm run build` 完整输出
2. `node output/ui-audit/run-ui-text-audit.mjs`
3. 打开 issue（`.github/ISSUE_TEMPLATE/bug_report.md`）附上以上日志
