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

名单里还混着没人读的名字。`outputExePath`、`confirmLabel`、`pipelinePresetTitle`、`railNextStepLabel` 解构了却从不作为裸标识符使用（实际走的是 `activeProject.outputExePath` 这类嵌套访问），甚至还有 `div`、`span`、`nav`、`h1`、`p`、`map`、`length` 这种占着解构位、遮蔽掉同名全局的键。这是无类型手抄名单的病征，不是崩溃。

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

`editorExperienceAuditItems` 一个 `useMemo` 就是 1037 行。

死重比一开始估的多得多。用 `tsc --noUnusedLocals --noUnusedParameters` 量才是准的——**569 个未用符号，100% 落在 showcase 树**，项目其余部分干净。其中 491 个是 import 绑定、82 个是解构出来的死键、16 条 import 整条未用，剩下 13 个是没人调用过的函数（`checkActiveProject`、`centerCanvasView`、整套 `handlePalette*` 指针拖拽……）。`tsconfig` 里根本没有 `noUnusedLocals`，这就是它们能攒下来的原因。

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
| 开工前 | | 19938 | 20000 | 余量 62 |
| **0** | 死重清扫 + 拧棘轮 | **19544** | **19600** | 零 |
| **1** | 抽纯数据块 | **18802** | **18850** | 低 |
| **2** | 收 scope 袋为类型切片 | ≈17000 | 17020 | 中 |
| **3** | 拆胖视图 | 不变 | 不变 | 高 |

### Phase 0 — 止血（已完成）

清死重，然后把棘轮拧到实测值旁边。**这一期的真正产出不是省下的 394 行，是「加一行就得抽一行」重新生效，而且死代码再也攒不回来。**

做法是让 `tsc` 当裁判，不用自己写正则猜。启发式有两个已经踩过的坑：`from "./x/Name"` 里的路径包含符号名，数原始文本会漏判；整文件懒匹配又会把中间所有 import 一起吞掉，把每个图标都报成死的。改成读 `TS6133`/`TS6196`/`TS6192` 的报告、只删它点名的绑定，就不可能和编译器对不上。

删的时候也有两处差点删坏，都是「改完立刻被 `tsc` 抓住」：

- 正则忘了 `{` 这个前缀，`import { A, B }` 删 A 会变成 `import {, B }`。改成按子句列表拆、按本地名删（`KeyboardEvent as ReactKeyboardEvent` 要删的是 `as` 后面那个，因为 tsc 报的就是本地名）。
- `dropBinding` 找不到名字时也会顺手把语句重排一遍，返回值变了就被误判成「已删」，于是从待删集合里划掉，后面的语句全部空转。**找不到就原样返回**。

最后拧两道棘轮：

1. `check-showcase-size` 的 `MAX_LINES` 20000 → **19600**（实测 19544，余量 56）。
2. `tsconfig.json` 打开 `noUnusedLocals` + `noUnusedParameters`。这才是防回潮的那道——以后再写一个没人调的函数，`tsc` 当场报，不用等谁记得去看。

### Phase 1 — 抽纯数据块（已完成）

`editorExperienceAuditItems` 整块落到 `builder/editor-experience-audit.ts`：`buildEditorExperienceAuditItems(s)` 吃一个快照字面量，返回 117 项审计条目，组件里只剩 `useMemo` + 157 个快照字段的调用点。**依赖数组逐字保留**——构造器是纯的，但 memo 才是阻止它每次敲键重跑的东西，改依赖数组等于把行为变化藏进重构里。

计划原本要按域切成多个构造器（`projectTree*` / `projectFileRouting*` / …），实测没做：切域的收益要到 Phase 2 收窄入参类型时才兑现，Phase 1 先求「搬出来且逐条等价」。两个动作分开，出问题时分得清是哪一半的锅。

顺带记两笔账，免得下次照着估算开工：

- 计划里的「再抽 `projectActionCenterItems` 256 行、`bottomDockLogLines` 175 行」是 Phase 0 之前的估数。实测 `projectActionCenterItems` **156 行**、`bottomDockLogLines` **18 行**，后者不值得单独开文件，前者留给 Phase 3 一并处理。
- `editor-experience-audit.ts` 现在 **938 行**，超了 800 行的文件上限。它是纯数据表（117 个条目一字一项），按域拆是 Phase 3 的活，见「已知残留」。

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
npx tsc --noEmit        # 现在自带 noUnusedLocals / noUnusedParameters
npm run check:experience          # 含 full 冒烟 110 项
npm run check:showcase-size       # 只管 BuilderShowcase.tsx
npm run check:builder-file-size   # builder/ 每个文件的行数棘轮

# Phase 3 额外：
npm run check:ui-density          # chip 数不许动
npm run check:a11y                # 116 项，含中文界面无英文、四个 mode 的折叠面板
npm run check:builder-runtime:full
```

Phase 0 之后 `tsc` 一个未用符号都不放。再写一个没人调的函数、再解构一个没人读的键，编译当场挂——不用等谁记得回头数。

## 不做什么

- **不做大爆炸重写。** 7 轮增量抽取已经证明路径可行；110 项交互冒烟是靠 DOM 契约才敢动的，一次改完就没了参照物。
- **不把 `Record<string, any>` 一次性收紧成严格类型。** 先分组，后收紧，两个动作分开——混在一起出问题时分不清是哪一半的锅。
- **不改 `data-builder-*` 钩子命名。** 那是测试契约，不是内部实现。
- **不为了行数而搬。** 每期都要有一个「为什么这样分」的领域理由；数字是结果，不是目标。

## 历期进度

| 期 | 改动 | 实测 | 上限 |
|----|------|-----:|-----:|
| 0 | 死重清扫：491 个未用 import 绑定、16 条整条未用的 import、82 个解构死键、13 个没人调用过的函数；DOM 全局 `window` 出袋。`tsconfig` 打开 `noUnusedLocals`/`noUnusedParameters`，`MAX_LINES` 拧到实测旁边 | **19544** | **19600** |
| 1 | `editorExperienceAuditItems`（1037 行）搬进 `builder/editor-experience-audit.ts`，依赖数组逐字保留；顺带修好 `check:a11y` 两处「关不掉的门」（见下） | **18802** | **18850** |

每完成一期在这里记一行：改了什么、实测降到多少、`MAX_LINES` 收到哪。

## 已知残留

- **`editor-experience-audit.ts` 938 行，超了 800 行上限。** 它是 117 条审计条目的一字一项纯数据表，不是逻辑；按域拆（project / design / logic / build）是 Phase 3 的活。在那之前靠代码评审约束——`check-showcase-size` 只管 `BuilderShowcase.tsx`，见下条。
- **`check:a11y` 里曾经有两道关不掉的门，Phase 1 修好了，记下病症免得再犯。** 两处是同一类错：**量的不是它以为在量的东西。**
  1. *固定 `delay(5000)` 当等待用。* 慢机器上 shell 还在挂载，门就去点 `[data-builder-mode-button="design"]`，报「no element」——控件马上就来。失败原因是竞态，不是界面。改成 `waitFor(selector)` 有界轮询：元素没到就带着选择器名字失败。
  2. *折叠面板那两条断言对零条面板循环。* `shell.disclosures` 是首屏快照里 `<details>` 的集合，而面板在另外三个 mode 里；循环空转，checklist 5.1 一直是绿的、其实一条都没测。**空集合上的循环是不败的门。** 改成走四个 mode 收集，并且要求收集结果非零——收集本身也要能输。
- **「快速检查」这功能在 UI 上根本进不去。** Phase 0 删掉的 `checkActiveProject`（57 行，调 `check_editor_project`）是 `checkingTarget` 的唯一写入者，而 tsc 证明它从来没被调用过。现在 `checkingTarget` 永远是 `null`，`dirty` 那一项永远不为真，Build 面上「正在检查」的分支是死的。删它是对的（删除前后行为完全一致），但**功能缺失是真的**——要么接回 UI，要么把这堆状态一起清掉。不是 Phase 0 的事，记在这里免得忘。
- **`window` 这个名字在项目里有两个意思。** Phase 0 把 DOM 全局从 scope 袋里拿掉了：它被当普通键传过三层，`DesignView` 里 `window.prompt(...)` 实际拿到的是袋子里那个。今天袋子里没人供给 `window`，所以它回落到全局、侥幸能跑；而项目自己有「窗口壳」这个领域概念（`page.windowKind`、`releaseWindowKinds`、`data-builder-page-window-kind`），哪天谁加一个叫 `window` 的项目域对象，批量改标签那个弹窗当场就炸。**名字遮蔽比死代码危险**：死代码顶多占地，遮蔽会在别的文件里悄悄改行为。
- ~~`check:showcase-size` 只量 `BuilderShowcase.tsx`~~ → 已补 `check:builder-file-size`：`builder/` 下每个 `.ts`/`.tsx` 一条行数棘轮，12 个超标的文件钉在实测值上，只许降不许涨；新文件按 800 行硬顶。**棘轮会往回滑**——文件缩了、上限还挂得很高，下一次膨胀就被盖住了，所以这条门禁同时报「缩了就得把上限拧下来」。
- **Phase 2 的切片不能按「领域」分，得按「谁在读」分。** 计划里写的「先 project，109 个名」是 `ProjectView` 整个解构块的行数，不是 project 独占的量。实测按每个视图自己的解构块统计（不是搜标识符——`name`、`page`、`length` 这种词在每个文件里都是属性名，会误报）：

  | 归属 | 名字数 |
  |------|-------:|
  | 只有 `ProjectView` 读 | 44 |
  | 只有 `DesignView` 读 | 323 |
  | 只有 `LogicView` 读 | 267 |
  | 只有 `BuildView` 读 | 205 |
  | **多个子视图共读** | **103** |
  | 只有 `ShellView` 读（从不下发） | 148 |

  共读的 103 个塞不进任何单一领域切片——真按领域切，要么一个名字出现在两个切片里（那就不是切片了），要么逼着视图改用 `scope.project.foo` 这种限定名去点每一个使用点。**按视图切**和代码现在的组织一致，也正好是 Phase 3 拆胖视图的边界。共读的那 103 个进共享袋，谁都不许藏。
- scope 袋的类型在 Phase 2 之前是 `Record<string, any>`，`tsc` 全程查不出漏键。Phase 0/1 期间靠 `check:experience` 的 110 项冒烟兜底。
- `check-goal-coverage` 有 97 条断言钉在冒烟脚本的字面量上。改冒烟脚本时这些会跟着挂——那是故意的，它们测的是「冒烟真的在断言」。
