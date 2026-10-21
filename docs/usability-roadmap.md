# 可用性与体验优化建议

> 基于本轮交付后的盘点 · 2026-07  
> **状态：15 项建议已全部落地**（Linux/macOS 实机打包除外）

## 已交付（本轮 15 项）

| # | 项 | 交付 |
|---|-----|------|
| 1 | 首次启动 3 步引导 | `OnboardingGuide.tsx`，可跳过 / 重开 |
| 2 | 「打开示例」一键工程 | 命令面板「打开示例项目」→ dashboard 模板 |
| 3 | 快捷键速查浮层 | `KeyboardShortcutsOverlay.tsx`，F1 / `?`，可搜索 |
| 4 | Ctrl+C/V 跨文件粘贴 | Ctrl+C/X/V/D + `pasteClipboardItems` |
| 5 | 画布 Ctrl+F | `CanvasFindBar`，Enter 定位 / Esc 关闭 |
| 6 | 对齐按钮悬停预览 | `data-builder-align-preview` + hover |
| 7 | 多选批量改共有属性 | `BatchSelectToolbar`（对齐/等宽等高/批量标签） |
| 8 | 资源拖到画布生成 Image | `application/x-nova-asset` 拖放 |
| 9 | 一键「预览运行」 | 选择条旁「预览运行」→ ready-check + 输出 Dock |
| 10 | 生成前 diff 高亮 | 生成计划内「变更摘要预览」色条 |
| 11 | Project 健康检查面板 | `ProjectHealthPanel` + CLI `check:project-health` |
| 12 | 拆 BuilderShowcase | CanvasOverlays / ProjectHealthPanel / hooks |
| 13 | 冒烟按模式入口 | `check:builder-runtime:design` |
| 14 | `check:watch` | `npm run check:watch` |
| 15 | FAQ + 截图说明 | `docs/troubleshooting.md` + README |

---

## 后续可继续打磨（非阻塞）

| 项 | 痛点 | 建议 | 预估 |
|----|------|------|------|
| **继续拆 BuilderShowcase** | 仍约 54k 行 | 按模式拆主 JSX；HMR 与主包再降 | L |
| **真实对齐虚线预览** | 当前是 hover 数据标记 | 画布上画参考线 | M |
| **冒烟真分片** | design 入口仍跑全量 | 按 section 跳过 logic/build | M |
| **30s 操作 GIF** | README 仍是静态截图 | 录一段新建→绑定→exe | S |
| **Linux/macOS 实机打包** | 本机不可做 | 在对应 CI/主机跑 `tauri:build` | L |

---

## 一、上手与新手体验（优先）

| 项 | 痛点 | 建议 | 预估 |
|----|------|------|------|
| **首次启动引导** | 打开后是空编辑器，不知道从哪开始 | 首次运行显示 3 步引导：新建项目 → 插入按钮 → 绑定命令；可跳过 | M |
| **内置示例工程一键打开** | 手动搭项目慢 | 启动器提供「打开示例」：带按钮+搜索栏+绑定好的 `app_message` | S |
| **黄金路径图文** | 文档已有，缺截图步骤 | 在 `docs/golden-path.md` 配 6 张关键步骤截图 | S |
| **快捷键速查浮层** | 快捷键散落各处 | `?` 或 F1 打开快捷键面板（可搜索） | S |
| **命令面板增强** | 新人不易发现能力 | 命令面板加入「最近使用」与「相关命令」推荐 | M |

## 二、画布与编辑效率（核心手感）

| 项 | 痛点 | 建议 | 预估 |
|----|------|------|------|
| **撤销/重做更可靠** | 大操作后难回退 | 补齐批量操作的 history 粒度；显示「可撤销 N 步」 | M |
| **复制粘贴控件** | 只能复制选中项到内部剪贴板 | 支持 Ctrl+C/V 跨文件、跨项目粘贴（带 id 重生） | M |
| **对齐分布实时预览** | 点了才知道效果 | 悬停对齐按钮时画布显示虚线预览 | S |
| **拖入图片生成 Image** | 资源→画布步骤多 | 从资源面板拖到画布自动创建 Image 并绑定 asset | S |
| **多选后批量改文案** | 一次只能改一个 | 多选时检查器显示「共有属性」可批量编辑 | M |
| **画布搜索定位** | 大页面找控件难 | Ctrl+F 在画布按名称/类型过滤并高亮 | M |
| **参考线吸附开关** | 微调位置时吸附干扰 | 状态栏一键开关；Alt 已可临时暂停，可加提示 | S |

## 三、生成与运行反馈

| 项 | 痛点 | 建议 | 预估 |
|----|------|------|------|
| **生成 diff 预览更醒目** | 计划列表不够直观 | 生成前显示关键文件 diff 高亮（不只是状态标签） | M |
| **一键「运行预览」** | 生成→npm install→build→run 链路长 | Build 页加「预览运行」串起命令并跟日志 | M |
| **生成错误可点击修复** | 报错只有日志 | 诊断行带「定位到文件/控件」与 quick fix | M |
| **项目健康检查入口** | 只有 CLI 脚本 | Project 页加「健康检查」面板（读 `check-project-health`） | S |
| **增量生成提示** | 不知道哪些文件会被改 | 生成前 badge 显示 N create / M update / K unchanged | S |

## 四、Logic / 后端

| 项 | 痛点 | 建议 | 预估 |
|----|------|------|------|
| **绑定向导** | 事件→命令→槽函数步骤多 | 选中控件后「创建绑定」向导一步生成 command+binding+slot | M |
| **后端样例一键导入** | examples 要手动拷 | Logic 页「从样例添加后端」导入 python/cpp-ffi starter | S |
| **方法测试结果历史** | 只看最近一次 | 方法卡片保留最近 5 次测试记录 | S |
| **Rust 编辑器格式化反馈** | 不知道有没有生效 | 格式化后 toast 显示变更行数 | S |

## 五、性能与开发体验（贡献者）

| 项 | 痛点 | 建议 | 预估 |
|----|------|------|------|
| **继续拆 BuilderShowcase** | 54k 行仍难改 | 按模式拆 Project/Design/Logic/Build 主 JSX → 目标 ≤20k | L |
| **HMR 加速** | 500KB 单文件 babel 慢 | 拆文件后 dev 编译明显变快 | M |
| **主 chunk 再减** | 1.7MB 首屏 | 按模式 `import()`；检查器/生成模板懒加载 | M |
| **冒烟并行/分片** | check:builder-runtime 偏慢 | 按模式拆 smoke 脚本，可只跑 design | M |
| **check 脚本 watch 模式** | 改 UI 要反复手跑 | `npm run check:watch` 增量跑相关契约 | S |

## 六、文档与协作

| 项 | 痛点 | 建议 | 预估 |
|----|------|------|------|
| **视频/GIF 演示** | 静态截图不够 | README 嵌 30s 操作 GIF | S |
| **故障排查 FAQ** | 环境问题常见 | `docs/troubleshooting.md`：Tauri 依赖、端口占用、exe 杀软误报 | S |
| **组件贡献 playground** | 加组件要懂四端 | `npm run check:components` 失败时打印「缺哪一端」 | S |
| **变更日志自动化** | 手写 release notes 累 | release:notes 已有，接 tag 流程自动草稿 | S |

---

## 建议下一轮冲刺（高性价比）

1. **首次引导 + 打开示例** — 新手 1 分钟能跑通
2. **复制粘贴 / 画布 Ctrl+F** — 编辑手感立刻变好
3. **一键预览运行** — 生成链路可感知
4. **拆 BuilderShowcase + HMR** — 后续所有开发都更快
5. **快捷键浮层 + FAQ** — 降低学习成本

---

## 验收命令（保持全绿）

```bash
npm run build
npm run check:builder-runtime
npm run check:cpp-ffi
cargo test --manifest-path src-tauri/Cargo.toml
node output/ui-audit/run-ui-text-audit.mjs   # expect 0
```
