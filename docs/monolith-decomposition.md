# 单体拆解：让「结构债」可测、可还

> 目标不是把 `BuilderShowcase.tsx` 变小，是让**加功能必须先还债**。
> 这篇记录债在哪、哪些刀法安全、每期抽多少、上限收到哪，以及为什么这么排。

## 为什么要拆

「文件太大」没法验收——多大算大？所以先把债拆成三笔具体的，每一笔都有数字。

### ① 接线债：同一份名字手抄三遍，而且没类型

视图只收一个 `props.scope`，类型是 `Record<string, any>`，真正的契约是每个视图顶部那一大段一行一个名字的解构。同一份名单要过三层：

| 接线层 | 行数 |
|--------|-----:|
| `BuilderShowcase` → `ShellView` 的 scope 字面量 | 1095 |
| `ShellView` 解构 | 1155 |
| `ShellView` → 4 个子视图的 scope 字面量 | 1089 |
| 4 个子视图解构 | 1089 |
| **合计纯接线** | **4428** |

`Record<string, any>` 意味着 `tsc` 一个键都查不出来：漏接就是运行时 `undefined`。`BuildView.tsx:12-14` 那条注释记着它已经把整个工作台炸白过一次——「the scope bag needs the same symbol wired through BuilderShowcase and ShellView, which is how "X is not a function" once blanked this whole workbench」。

现在还留着约 20 个死接线（`outputExePath`、`confirmLabel`、`pipelinePresetTitle` 解构了却从不作为裸标识符使用，实际走的是 `activeProject.outputExePath` 这类嵌套访问）。这是无类型手抄名单的病征，不是崩溃。

### ② 复利债：棘轮没拧

轨迹（`BuilderShowcase.tsx` 行数）：

| 阶段 | 行数 | 说明 |
|------|-----:|------|
| `13b03823` | 54388 | 开始记录 |
| 7 轮抽取后 `d0efa172` | **19858** | 类型/纯函数/视图/外壳全部搬出 |
| 此后 10 个功能提交 `571758aa` | **19938** | 一点点吃掉余量 |

**抽取本身是成功的**（减 64%），**失败的是不让它长回来的机制**：`check-showcase-size` 的上限设在 20000，比达成的低点高 141 行，所以每个功能提交都能白拿一点。

这纪律项目本来有。`77c7e2fc` 的提交信息写着：「check-showcase-size's limit tightens from 37000 to 24000 so the next addition has to earn its place」。只是最后一轮抽完没跟着收。

### ③ 肿块债

`editorExperienceAuditItems` 一个 `useMemo` 就是 1037 行。另有 11 个 import 进来却一次没用（`InspectorDock`、`NavigatorDock`、`SelectionActionBar`、`BatchSelectToolbar`、`CanvasFindBar`、`ProjectHealthPanel`、`ConflictMergeEditor`、`GeneratedDiffView`、`ToolchainBanner`、`AlignGuideOverlay`、`ProjectDock`）。

`builder/` 顶层 11 个文件超过 800 行上限：`monolith-module` 8890、`DesignView` 5745、`LogicView` 5691、`ShellView` 5271、`BuilderItemPreview` 4843、`BuildView` 4746、`component-palette` 2533、`ProjectView` 2314、`types-project` 922、`SelectionActionBar` 872、`change-impact` 815。

## 一条铁律：新文件只能落 `builder/` 顶层

走错这一步会**静默失效**——门禁照样绿，断言却全落空。

`check-component-coverage`、`check-goal-coverage`、`check-editor-experience` 三者都是**非递归**拼接 `BuilderShowcase.tsx` + `src/components/showcase/builder/*.{ts,tsx}` 来做内容断言的：

- 放顶层 → 自动进拼接，`check-goal-coverage` 的 `parity(id)`、`check-editor-experience` 的 1501 条 `mustContain` 照常命中；`check:english-prose` 自动覆盖；`check:showcase-size` 只会变好。
- 放 `builder/xxx/` 子目录 → 三处扫描**静默丢掉**它。`check:english-prose` 会递归扫到，其余不会。

还有两类**硬路径耦合**，动到对应文件时要保留字面量：

- `check-editor-experience` 有 per-file 针：`DesignView.tsx` 必须含 `updatePage({ showRulers })`，`OutputDock.tsx` 55 条、`types.ts` 62 条等。
- `check-goal-coverage` 有 97 条断言直接钉在 `check-builder-runtime-smoke.mjs` 的字面量上（如 `verified.stableActionbar = true`）。

`check-showcase-size` 只量 `BuilderShowcase.tsx` 一个文件，口径是 `text.split(/\r?\n/).length`（行尾换行也算一段）。**把行搬走就是降数**，新文件从不计入——所以它天然是抽取的盟友。

## 安全模型：改什么会炸

冒烟 110 项绑的是 **DOM**，不是模块边界。React 换个组件渲染出同样的 DOM，测试无感。这正是敢在 2 万行上动刀的原因。

| 改动 | 安全性 | 为什么 |
|------|--------|--------|
| 移纯函数 / 常量 | 完全安全 | 渲染路径不变 |
| 移 state 进自定义 hook（父组件无条件调用） | 安全 | state 所有权还在父组件 |
| 拆 JSX 成子组件，**渲染 DOM 不变** | 安全 | 测试看的是 DOM |
| 改嵌套 / 套一层 wrapper | **炸** | 直接子选择器：`A > summary`、`A input`、`A textarea` |
| 调兄弟顺序 | **炸** | `.at(-1)` 取最后一个 button、`querySelector("span")` 取第一个 span |
| 增删 `data-builder-*` 钩子 | **炸** | 1130 处选择器、766 个不同钩子名 |
| 改中文文案 | **炸** | 文本断言写死 `"尺寸已统一"`、`"Rust 源码已格式化"`、`/(\d+)\s*文件/` |

另外：`check:ui-density` 要求 `[data-builder-density-root]` 的值等于当前模式，且面板必须是 `<details>`（探针要能展开）；`check:a11y` 6.7 要求组件类型名保留 `[data-builder-palette-type]` 钩子（否则会被当成漏译英文）。

## 分期方案

抽多少是估算，收到哪是硬数——每期实测后立刻把上限拧到实测值附近留少量余量，和 `DENSITY_BUDGETS` 同一条规则。

| 期 | 动作 | `BuilderShowcase` | `MAX_LINES` 收到 | 风险 |
|----|------|------------------:|-----------------:|------|
| 现状 | | 19938 | 20000 | 余量 62 |
| **0** | 死 import + 死接线 + `window` 出袋 | ≈19900 | 19910 | 零 |
| **1** | 抽纯数据块 | ≈18430 | 18450 | 低 |
| **2** | 收 scope 袋为类型切片 | ≈17340 | 17360 | 中 |
| **3** | 拆胖视图 | 不变 | 不变 | 高 |

### Phase 0 — 止血（零风险）

清 11 个死 import、约 20 个死接线、`ShellView` 袋里的 `window`。**然后拧棘轮**。

这一期的真正产出不是省下的 30 行，是「加一行就得抽一行」重新生效。

### Phase 1 — 抽纯数据块（约 -1470 行）

`editorExperienceAuditItems`（1037 行）按它**已经写在变量名里的域**切成纯构造器，落到 `builder/editor-experience-audit.ts`：

- `projectTree*` / `projectFileRouting*` / `projectFolderHealth*` / `projectOwnership*` / `projectWorkingSet*` / `projectActionCenter*` → 项目域
- 其余按 design / logic / build 分

套路照抄 `d0efa172` 的 `buildProjectSaveManifestItems`：纯函数吃窄快照，不闭包组件状态。它现在读约 420 个外部标识符，切成域之后每个构造器的入参就窄了。

再抽 `projectActionCenterItems`（256 行）、`bottomDockLogLines`（175 行）。

### Phase 2 — 收 scope 袋（核心，约 -3200 行）

把 1093 个平铺名换成 5–6 个**有类型的领域切片**，由自定义 hook 产出：

```
useBuilderProject() / useBuilderCanvas() / useBuilderLogic()
useBuilderBuild()  / useBuilderTasks()  / useBuilderDocks()
```

父组件顶部**无条件**调用这些 hook——state 所有权不动，只是换个地方声明。`scope={{ project, canvas, logic, … }}`，五个视图的解构跟着改。

收益不止行数：`tsc` 开始能查出漏接的键，白屏那个失败模式从机制上消失。

**分批做。** 先 `project`（109 个名，最小的一片）跑通全绿，再逐个推。每批独立提交，独立可回滚。

### Phase 3 — 拆胖视图（长期）

`monolith-module` / `DesignView` / `LogicView` / `ShellView` / `BuilderItemPreview` / `BuildView` 按子面板拆。规则只有一条：**渲染结果必须逐字节等价**——同标签、同嵌套、同 `data-builder-*`、同中文文案。

拆之前先抓一份渲染 HTML 快照，拆完比对；这是最便宜的等价性证明。

## 怎么验

```bash
npx tsc --noEmit
npm run check:experience          # 含 full 冒烟 110 项
npm run check:showcase-size

# Phase 3 额外：
npm run check:ui-density          # chip 数不许动
npm run check:a11y                # 47 项，含中文界面无英文
npm run check:builder-runtime:full
```

## 不做什么

- **不做大爆炸重写。** 7 轮增量抽取已经证明路径可行；110 项交互冒烟是靠 DOM 契约才敢动的，一次改完就没了参照物。
- **不把 `Record<string, any>` 一次性收紧成严格类型。** 先分组，后收紧，两个动作分开——混在一起出问题时分不清是哪一半的锅。
- **不改 `data-builder-*` 钩子命名。** 那是测试契约，不是内部实现。
- **不为了行数而搬。** 每期都要有一个「为什么这样分」的领域理由；数字是结果，不是目标。

## 历期进度

| 期 | 改动 | 实测 | 上限 |
|----|------|-----:|-----:|
| — | 尚未开工 | 19938 | 20000 |

每完成一期在这里记一行：改了什么、实测降到多少、`MAX_LINES` 收到哪。

## 已知残留

- `check:showcase-size` 只量 `BuilderShowcase.tsx`。`builder/` 里那 11 个超 800 行的文件不在它管辖内，靠 Phase 3 和代码评审约束。若要强制，需另开一条按文件量的门禁。
- scope 袋的类型在 Phase 2 之前是 `Record<string, any>`，`tsc` 全程查不出漏键。Phase 0/1 期间靠 `check:experience` 的 110 项冒烟兜底。
- `check-goal-coverage` 有 97 条断言钉在冒烟脚本的字面量上。改冒烟脚本时这些会跟着挂——那是故意的，它们测的是「冒烟真的在断言」。
