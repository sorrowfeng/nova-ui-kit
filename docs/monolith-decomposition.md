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
| **2** | 收 scope 袋（省的行数在 `ShellView`，不在这里） | **18790** | **18820** | 中 |
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

### Phase 2 — 收 scope 袋（核心）

> **计划里那笔账写错了地方，记下来免得下次照着估。** 原表把 Phase 2 的省行数记在 `BuilderShowcase`（≈17000），实际上**省的行数几乎全在 `ShellView`**：`BuilderShowcase` 只动了 18783→18790（补类型标注反而涨了 7 行），而 `ShellView` 从 5278 掉到 **3365**。接线债分布在四层上，不在单体里。

> **实测到的地板是约 2400 行，不是 0。** 现在每份名字只剩两处手写：袋子被造出来那一次（1087 行），和子视图解构那一次（1069 行）。再往下只剩一条路——让视图不解构、改用 `project.foo` 这种限定名去点每一个使用点，那是给 1070 个标识符及其全部使用点改名，DOM 契约冒烟未必兜得住。**两处是「造对象」和「取名字」的固有成本，不是没删干净。**

原计划要把 1093 个平铺名换成 5–6 个**有类型的领域切片**，由自定义 hook 产出：

```
useBuilderProject() / useBuilderCanvas() / useBuilderLogic()
useBuilderBuild()  / useBuilderTasks()  / useBuilderDocks()
```

父组件顶部**无条件**调用这些 hook——state 所有权不动，只是换个地方声明。`scope={{ project, canvas, logic, … }}`，五个视图的解构跟着改。

收益不止行数：`tsc` 开始能查出漏接的键，白屏那个失败模式从机制上消失。

**分批做。** 先 `project`（109 个名，最小的一片）跑通全绿，再逐个推。每批独立提交，独立可回滚。

**2·1 起的实际做法（和原计划不一样，记下来免得重复踩）：** 先把每份 scope 从 `Record<string, any>` 收成**封闭键集**——`{ [K in ProjectViewScopeKey]: any }`，键集由视图自己的解构生成，不手抄。这一步只关门不查值，代价小、见效快：改错一个键名编译当场挂，还带「did you mean」，而以前是编译通过、面板空白。负例已经验过（把 `activeEditorTab` 写成 `activeEditorTabTYPO` 会报 `TS2339`）。

**2·2 把另一半也关上了。** `ShellView` 手里那四个视图组件本来是从 scope 袋里拿到的，袋的类型是 `Record<string, any>`，于是 `<ProjectView scope={{…}} />` 等于在调 `any`——子视图自己解构写错键名会被抓，`ShellView` 少传一个键不会。现在 `scope-shell.ts` 在袋边界上给这四个组件标了 `ComponentType<{ scope: XViewScope }>`，袋里其余名字仍然敞开（索引签名为 `any`；**声明过的属性优先于索引签名**，所以这四个不会被 `any` 吞掉）。

三种失败模式都验过能输：

| 写错 | 报什么 |
|------|--------|
| 子视图解构写错键名 | `TS2339` … does not exist on type 'ProjectViewScope'（带 did-you-mean） |
| `ShellView` 少传一个键 | `TS2741` Property 'activeEditorTab' is missing … but required |
| `ShellView` 多传一个键 | `TS2561` Object literal may only specify known properties |

**这正是 Phase 2 说的那个收益：白屏这个失败模式从机制上没了。** 以前这三种写法全部编译通过，然后面板空白。

**2·4 才是省行数的那一步。** `ShellView` 原来有两份手工抄写：自己那份 1090 行解构（把名字从袋里取出来），加上四份子视图字面量共 1089 行（再抄一遍塞回去）。现在直接 `scope={scope}` 把袋子递给子视图——`ShellViewScope` 是四个键集的**交集**再并上 ShellView 自己那 146 个名字（941+146=1087，正好是父字面量的大小），交集天然满足每一个成员，所以子视图那份封闭键集照样生效，不用再抄一遍。

抄写的那 838 行解构由 `tsc` 点名删掉（全是 `TS6133`），不是靠正则猜「哪些名字是 shell 自己在用」。`ShellView` 5278 → **3365**。

**但发现了一个更隐蔽的漏洞，并且补上了：`ShellView` 自己也是 `lazy()` 出来的。** 也就是说 `BuilderShowcase` 那份 1087 键的袋子字面量之前根本不被检查——组件是 `any`，prop 无从查起。给 lazy 外面加一层 `ComponentType<{ scope: ShellViewScope }>` 标注（不牺牲代码分割）之后，袋子里少一个键就报：

```
TS2322: Property 'activeEditorTab' is missing in type '{ … 1084 more … }'
        but required in type 'ProjectViewScope'.
```

现在整条链上只有两个真正会出错的地方，而两处都在编译器的管辖内：**袋子被造出来的那一次**，和**每个视图解构的那一次**。

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
| 2·0 | 清掉没人读的 scope 键：袋里 5 个（含 `name`＝`window.name`）、`ShellView` 四份子视图字面量里 9 个（含 `open`＝Tauri 的 dialog `open`，ShellView 自己还要用，只是子视图不解构）、以及随之变成死代码的 2 个声明。补 `check:builder-file-size` 按文件量棘轮 | **18789** | **18820** |
| 2·1 | 四个子视图的 scope 全部从 `Record<string, any>` 收成**封闭键集**（Project 108 / Logic 310 / Build 246 / Design 406 键，由各视图自己的解构生成 `builder/scope-*.ts`）。值仍是 `any`，只关门不查值 | **18789** | **18820** |
| 2·2 | `scope-shell.ts` 在袋边界上给四个视图组件标 `ComponentType<{ scope: XViewScope }>`，`ShellView` 那四份字面量从此也被查。少键、多键、写错键名三种都会编译报错 | **18789** | **18820** |
| 2·3 | 清掉 `checkingTarget`：没有 setter 的 `useState`，18 处读法全是死分支，连同 `BuildView` 那串永远为假的 `disabled` 条件一起删 | **18783** | **18820** |
| 2·4 | 子视图直接 `scope={scope}` 收袋子，删掉 `ShellView` 里两份手工抄写（1089 行字面量 + 838 行只为转发而存在的解构）。`ShellViewScope` 改由四个键集的交集派生；给 lazy 出来的 `ShellView` 补上类型标注，让袋子字面量本身也被查 | `ShellView` **3365** | **3365** |
| 2·5 | 删掉 5 个没有任何文件 import 过的模块（388 行），含 `CanvasContextMenu.tsx` 这份孤儿副本 | `builder/` **50326** | — |
| 3·0 | 审计表按域切成 4 片（surface/code/project/chrome + composer），39 个 flag 零共读才动手 | `editor-experience-audit.ts` **938 → 4 片全 <800** | 棘轮表划掉一行 |
| 3·1 | 删掉 5 个没人 invoke 的 Tauri 命令（`check/build/bundle_editor_project`、`create_editor_project`，连同永远跑不到的两个函数半边、随之孤儿的 `project_paths`/`write_readme`）；`applyBackendBuildResult` 补上一直漏写的 3 个 bundle 产物字段；`building`/`bundling` 改由后台任务驱动；Git 冲突编辑器接上（换项目/快照后重读状态，冲突可点开）；新增 `check:command-reachability` 两个方向把这类东西钉死 | `BuilderShowcase` **18726** | **18760** |
| 3·2 | 新项目的 exe 窗口跟自己的设计画布对上：页面和发布配置各自由 `defaultPage` / `defaultReleaseConfig` 播种，六个壳字段里四个不一致（标题、副标题、宽、高），于是每个项目一出生就是「需同步」，做出来的 exe 是 1200×800 而画布是 1440×900。`createProject` 改为用 `releaseWindowShellFromPage` 从页面播种发布壳；只有壳跟走，签名/打包/安装器设置原样保留。顺带把 TS 测试跑手从「只跑一个写死的入口」换成 `check:ts-tests` 跑 `scripts/*.test.ts`，新域不用借邻居的文件名 | Qt Creator 对齐 **74% → 79%**，第 6/7 条转 pass | — |
| 3·3 | 空画布被报成 8 个能力缺口：19 条里 8 条标「复核」，其实一条缺口都没有——检查根本没跑（没选中、光标不在符号里、还没构建）。新增第四种严重度 `unverified`（待验证），49 处「前提不存在就报 warning」翻过来；聚合逻辑抽成 `worstAuditSeverity` 并钉测试。**待验证不是软 pass**：未知证据 id 仍算 warning，混着真失败仍是 fail | 对齐 **11 pass / 8 unverified / 0 warning / 0 fail** | — |

**接线债实测 4428 → 约 2400 行**，Phase 2 基本做完了（剩「查值」那一半，见「没做完的」）。`BuilderShowcase` 19938 → **18726**，`builder/` 51323 → **50326**。

每完成一期在这里记一行：改了什么、实测降到多少、`MAX_LINES` 收到哪。

## 已知残留

- **`editor-experience-audit.ts` 938 行，超了 800 行上限。** 它是 117 条审计条目的一字一项纯数据表，不是逻辑；按域拆（project / design / logic / build）是 Phase 3 的活。在那之前靠代码评审约束——`check-showcase-size` 只管 `BuilderShowcase.tsx`，见下条。
- **`check:a11y` 里曾经有两道关不掉的门，Phase 1 修好了，记下病症免得再犯。** 两处是同一类错：**量的不是它以为在量的东西。**
  1. *固定 `delay(5000)` 当等待用。* 慢机器上 shell 还在挂载，门就去点 `[data-builder-mode-button="design"]`，报「no element」——控件马上就来。失败原因是竞态，不是界面。改成 `waitFor(selector)` 有界轮询：元素没到就带着选择器名字失败。
  2. *折叠面板那两条断言对零条面板循环。* `shell.disclosures` 是首屏快照里 `<details>` 的集合，而面板在另外三个 mode 里；循环空转，checklist 5.1 一直是绿的、其实一条都没测。**空集合上的循环是不败的门。** 改成走四个 mode 收集，并且要求收集结果非零——收集本身也要能输。
- ~~**「快速检查」这功能在 UI 上根本进不去。**~~ → **已清掉。** `checkingTarget` 是个没有 setter 的 `useState`，永远是 `null`；它每一处读法都是死分支（`Boolean(checkingTarget) || x` 就是 `x`，`checkingTarget ?? y` 就是 `y`）。18 处引用连同 `BuildView` 上那一串 `disabled` 条件一起删了，行为逐条等价（冒烟仍 110/110）。
  ~~**功能缺失仍然在：`check_editor_project` 至今没有 UI 入口。**~~ → **这条记错了**，见「没做完的」第 3 条：UI 入口一直有，病是那几个命令本身没人调。同类的 `building`/`bundling`、`conflictFile` 也一起清/接了，见第 4 条。**空壳养不住功能，只会让人以为功能在**——但空壳也不一定是「没接 UI」，它可能整个功能都是死的。
- **`window` 这个名字在项目里有两个意思。** Phase 0 把 DOM 全局从 scope 袋里拿掉了：它被当普通键传过三层，`DesignView` 里 `window.prompt(...)` 实际拿到的是袋子里那个。今天袋子里没人供给 `window`，所以它回落到全局、侥幸能跑；而项目自己有「窗口壳」这个领域概念（`page.windowKind`、`releaseWindowKinds`、`data-builder-page-window-kind`），哪天谁加一个叫 `window` 的项目域对象，批量改标签那个弹窗当场就炸。**名字遮蔽比死代码危险**：死代码顶多占地，遮蔽会在别的文件里悄悄改行为。
  Phase 2 的清扫在同一类里又抓到一个：袋子里有个键叫 `name`，值是 `window.name`（另一个同名同姓的还有 `open`，那是 `@tauri-apps/plugin-dialog` 的 `open`）。**已清掉**，连同 `length`、`railNextStepLabel` 一共 5 个没人读的袋键，和 ShellView 四份子视图字面量里 9 个子视图根本不解构的键。
  顺带记一个 `tsc` 的盲区，Phase 0 的清扫就是被它挡住的：**对象字面量里的简写属性 `{ name }` 在编译器眼里是「用了 `name`」**，所以 `noUnusedLocals` 不报；只有真的没人解构、没人用 `scope.name` 去取，它才是死的。这类死键得靠「谁在读」来量，不能靠编译器。
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
- **`noUnusedLocals` 查不出死 export——导出本身就是一次「使用」。** Phase 0 清的是未用的局部变量和 import 绑定，所以这类东西全躲过去了。按「整个 `src/` 里标识符只出现一次（就是它自己那行定义）」扫一遍，抓到 12 个，其中 3 个被 check 脚本读着（`workflowStepStatusClassName`、`DEFAULT_RUST_LOGIC`、`STATUS_LABEL_DOMAINS`），另外 9 个躺在 5 个**没有任何文件 import 过的模块**里，已删（388 行）。`CanvasContextMenu.tsx` 最典型：它不是没用的组件，是**孤儿副本**——真正的右键菜单写在 `ShellView` 里，那些 `data-builder-canvas-context-*` 钩子也在那儿；冒烟 110 项能测到行为，所以这份没人接线的副本一直没人发现。
  现在有棘轮了：`check:dead-exports` 数 `src/components/showcase/` 里「没人 import 也没人 re-export」的导出名，钉在 **220** 上，**只许降不许涨**（`src/components/ui/` 不算在内——那是组件库，导出面就是它的 API，`ButtonProps` 没人用也仍然是文件的意义）。它也对自己断言：fixture 里一个被 import 的、一个孤儿的，分类不对就拒绝出结论。220 个是**要清的存量**，不是门禁坏了；每删一个就把上限拧下来一格。
  教训：**「冒烟全绿」不等于「没有死代码」**，冒烟测的是行为在不在，不是代码有没有人用。这两件事各有各的测法。
- `check-goal-coverage` 有 97 条断言钉在冒烟脚本的字面量上。改冒烟脚本时这些会跟着挂——那是故意的，它们测的是「冒烟真的在断言」。
- **读数比代码更容易骗人，尤其是产品自己算出来的那个分。** Qt Creator 对齐矩阵一直在算分，冒烟一直只断言「面板在不在」，从没读过那个分。读出来是 79%、8 条「复核」——看着像产品还差八块能力，实际一条都不差，是八个检查没跑到前提。**分数没人打印，就等于分数没人负责。** 现在冒烟每次都打出来，并且把每行连到它的审计证据上（只看行级分数找不到病根：它只说「第 5 条是 warning」就停了）。
  顺着这条又抓到两个同类的：
  1. **测量属性名打错，空值照样打印。** 第一版抽取打出来是 `parity % of : 1:? 2:? …`——`score`/`total` 是挂在面板自己身上的属性，却去子孙节点上找；严重度属性叫 `-state` 不叫 `-severity`；标题取了整行的 `textContent`。空值照样 `console.log`，看起来像「产品没数据」。现在捕获本身有断言（行数对不对得上 total、每条证据能不能解析出已知严重度）。
  2. **读数是产品文案的时候，别把结果注回页面模板。** 自检那段第一版把报告 `JSON.stringify` 后塞回页面里的模板字符串，中文文案里一个反引号或 `${` 就把脚本截断了。改成在 Node 侧算好，只把布尔值注回去。
- **标签分类错了，装饰就会冒充信号。** 给 `unverified` 起名「待验证」之后，build 工作台的 status chip 从 10 个涨到 29 个，密度门当场红。原因是 `SIGNAL_STATE_FRAGMENTS` 里有「待」，`isSignalStateLabel("待验证")` 为真，于是每个待验证都画成徽章——而这个词说的是「没得可做」。和 `view-labels.ts` 开头写的那种病一模一样：**没分类的日常标签被画成 chip 就是纯装饰。** 已归入 `READOUT_STATE_LABELS` 并在 `check-ui-density-rules` 钉住。
- **同一个类型写两份，加成员的那次就会分叉。** `EditorExperienceAuditSeverity` 同时声明在 `status-labels.ts` 和 `monolith-module.tsx`，这次要加第四种严重度，两份当场对不上。单体那份改成 `import("./status-labels").…` 的别名，不再手抄。**别名是一行，分叉是一个下午。**

## 没做完的

按「现在不动手会怎样」排，不是按大小排。每条都写清楚**它卡在哪、动它之前要先拿到什么**，免得下次开工先花半小时重新摸一遍。

### 0. 发布物落后于代码（一行命令，但先做完再发）

**产品自己的 Qt Creator 对齐矩阵现在是 11 pass / 8 unverified / 0 warning / 0 fail**——19 条需求没有已知能力缺口，剩下 8 条只是空会话里跑不到前提（没选中、光标不在符号里、还没构建）。所以用户能看到的差距就剩这一条：发布物。剩下两条（拆胖文件、查值）是代码健康，不影响用户。

`src-tauri\target\release\nova-ui-kit.exe` 上一次构建是 2026-10-22 23:41（本地），早于 `9d7cde84`（删掉 5 个没人 import 的模块）。**行为没变**（那些模块本来就没被接线，冒烟 110/110 已在删除后复跑过），但产物和源码不同源。发之前跑一次：

```bash
npm run tauri:exe && npm run check:desktop-exe
```

### 1. Phase 3 只做完了第一刀：还剩 11 个胖文件

第一刀落在 `editor-experience-audit.ts`（938 → 拆成 4 个域切片 + 30 行 composer，全部低于 800）。剩下的目标是把子面板从这些文件里拆出去，规则只有一条：**渲染结果逐字节等价**（同标签、同嵌套、同 `data-builder-*`、同中文文案）。拆之前先抓一份渲染 HTML 快照，拆完比对。

| 文件 | 现在 | 备注 |
|------|-----:|------|
| `monolith-module.tsx` | 8632 | 杂物间，纯函数/常量/类型混在一起，最该按域拆 |
| `DesignView.tsx` | 5768 | |
| `LogicView.tsx` | 5713 | |
| `BuilderItemPreview.tsx` | 4844 | |
| `BuildView.tsx` | 4779 | Git 冲突编辑器 +6（棘轮 4774），unverified 计数块 +5（棘轮 4779），两次都写清了是哪几行 |
| `ShellView.tsx` | 3365 | Phase 2·4 之后已经掉了 1913 行 |
| `component-palette.ts` | 2534 | |
| `ProjectView.tsx` | 2321 | |
| `types-project.ts` | 923 | |
| `SelectionActionBar.tsx` | 882 | |
| `change-impact.ts` | 820 | |

11 个文件都钉在 `check:builder-file-size` 的棘轮上，**只许降不许涨**（涨要写清是哪几行是干什么的）；拆下去之后记得把上限一并拧下来，否则那条门禁会报「缩了就得把上限拧下来」。

`editor-experience-audit.ts` 已经拆完，从这张表里划掉了。它是纯数据表，**是这张表里最安全的一刀，也是唯一已经验证过的一刀**：39 个派生 flag 全部只被一个域读，没有跨域依赖——先量出这条，再切。

### 2. Phase 2 的另一半没做：查值

现在每个名字的**键**是查的，**值**还是 `any`。计划里写的就是「先分组，后收紧」，目前只做完了分组。收紧是 1087 个值的类型，是个长活，建议按域一个一个来（先 `project` 那 108 个），每收紧一片就跑一遍冒烟——**别把「收键」和「收值」混在一次提交里**，出问题会分不清是哪一半的锅。

### 3. ~~`check_editor_project` 还是没有 UI 入口~~ → **记错了，真问题在别处**

这条原先写的结论是错的，留着改正是为了下次别再照着错的开工。

`check_editor_project` **一直有 UI 入口**，而且不止一个：Build 页「更多检查」下拉里的前端检查 / Rust 检查 / 全部检查、标题栏菜单的「运行检查」、快捷键、任务中心的 preset、change-impact 的 nextActions，全都走 `enqueueProjectTask("quick-check-*")` → `waitForBackendProjectTask(..., "check", ...)` → `start_editor_project_task` → `run_editor_check_background_task`。

**真正的病是反的：命令没人调。** `check_editor_project`、`build_editor_project`、`bundle_editor_project` 三个 `#[tauri::command]` 注册了但前端一处都没 invoke——它们的逻辑在 `editor_tasks.rs` 的后台任务跑手里被重写了一遍，UI 走的是后台那条。`buildActiveProject` / `bundleActiveProject` 看着在调它们，但这两个函数只在「被就绪度问题挡住」那个分支里被调用，而函数第一件事就是 `if (errorCount > 0) return null`——**invoke 那段永远跑不到**。`create_editor_project` 同理（前端自己 `createProject` 建好再 `save_editor_project` 存）。

和 `CanvasContextMenu.tsx` 是同一类：**孤儿副本**。冒烟 110 项测得到行为，因为行为在活的那份里，所以死的那份一直没人发现。已删（5 个命令 + 两个永远跑不到的函数半边 + 随之变成孤儿的 `project_paths` / `write_readme`）。

抓这类东西的办法也留下来了：`check:command-reachability`，两个方向都查——注册了没调、调了没注册。它就是靠 `read_git_conflict` 那一条红的逼出了下面第 4 条。

### 4. 一个功能可以整块是死的：Git 冲突编辑器

`check_editor_project` 那条顺手量出来的，比它本身严重。

`ConflictMergeEditor` 组件在，`resolve_git_conflict` 接好了，`read_git_conflict` 后端和测试都在。**但 `conflictFile` 只被写过 `null`**——`setConflictFile` 全项目没有一处传非空值。于是编辑器永远不渲染，`read_git_conflict` 永远没人调，`git_project_status` 也只有「解决完冲突之后」才被调用一次（那一步同样永远走不到）。**整块功能是闭环的死代码**，面板上「Git 工作区」那一段也一直是空的。

这是**第三次**踩同一个坑：`checkingTarget`（清了）、`building`/`bundling`（setters 根本没被调用过，按钮的 disabled 一直是假的）、`conflictFile`。三次都是「`useState` 的 setter 只被传过 `null`/`false`」。

已经接上了：换项目时重读 git 状态，Git 快照之后也重读，冲突文件可以点开进合并编辑器。`building`/`bundling` 改由后台任务的真实状态驱动。

**留个检测办法，别再靠人眼：** 新写 `useState` 时问一句「这个 setter 有没有一处传非空？」——`tsc --noUnusedLocals` 只能告诉你 setter 有没有被调用，告诉不了你它是不是只被传了初值。

现在有门禁了：`check:dead-usestate` 扫 `src/` 里每个 `useState` 绑定，报「setter 永远改不了它拥有的那份状态」。它对自己断言——先跑一份已知形状的 fixture（该报的 3 个、不该报的 3 个）再扫真代码，**fixture 分类不对就拒绝出结论**，否则「扫到 0 个」和「瞎了」分不清。也验过它会红：往 `App.tsx` 塞一个真死的 setter，门禁 exit 1。

写它的过程又踩了两个坑，都是「量错了」那一类：
1. **第一版把 `setBuilding`/`setBundling` 报成从未调用**——它们是作为值传出去的（`taskKind === "build" ? setBuilding : …`），语法上确实没有 `setBuilding(...)`。照着删就等于删掉刚接上的线。所以「被当值用过」就算活。
2. **`ts.isLiteralExpression` 不含 `null`/`false`**（那是关键字表达式不是字面量），于是 `setConflictFile(null)` 这个最典型的形状根本看不见。fixture 才把它照出来。

### 5. 两次踩到的同一类坑，别再踩

- **门禁要能输。** 固定 `delay()` 当等待用、对空数组循环断言、正则去量符号有没有被用——这三种都会让门「绿着但什么都没测」。现在 `check:a11y` 的 `waitFor`、`check:builder-file-size` 的「缩了就得拧上限」、以及 `phase2-drop-dead-scope-keys.mjs` 里那道 25 处的熔断，都是被坑过之后补的。新写门禁时先问一句：**它输了会是什么样？**
- **测量工具自己的 bug 会伪装成结论。** 至少有六次是量错了而不是代码错了：正则多打一个 `)` 让整份 import 被吞掉、`replace` 只换第一处结果删错了行、脚本把全路径再拼一次目录于是全部 MISS 还被 `catch` 吞了、行号 1-based 去索引 0-based 数组、CRLF 文件被脚本重写成 LF、**用正则去扫 TS 而不是用编译器**。最后这条最贵：`invoke` 是产品文案里的一个词（「用 invoke 调用 Rust commands」），`invoke("${name}")` 是显示给用户看的代码预览，`function invokeIfAvailable<T>(...)` 是定义不是调用——正则三样全数成调用。**改用 TypeScript 的 AST 之后一次就对了。** 测量脚本要对自己断言。
- **别自己写词法分析器。** `maskStringsAndComments` 那版为了躲开文案里的 `invoke` 去把字符串和注释抹掉，结果在正则字面量上失同步，把真代码抹了，`inspect_release_pipeline_artifact` 这个明明有调用的命令被报成孤儿。**能用编译器就别用正则。**
