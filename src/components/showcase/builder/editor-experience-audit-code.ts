// Editor-experience audit: Rust 编辑器与补全、签名帮助、大纲、逻辑命令中心、连接矩阵、流程板、信号槽、问题导航。
//
// One of four domain slices of editor-experience-audit.ts (phase 3 of
// docs/monolith-decomposition.md). Pure data: no refs, no effects, no DOM.
// The seam is derived — every flag below is read by this slice alone.
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  getItemSummary,
  rustCompletionKindLabel,
  rustOutlineKindTitle,
  type EditorExperienceAuditItem,
} from "./monolith-module";
import { sanitizeRustCommandName } from "./rust-commands";


export function buildCodeAuditItems(s: Record<string, any>): EditorExperienceAuditItem[] {
  const signalSlotModelValid = Number.isFinite(s.logicConnectionHealthScore);
  const hasSignalSlotWarnings = s.missingRustSlotEntries.length > 0 || s.logicSignalSlotUnboundCount > 0;
  const logicFlowBoardReady = Boolean(s.logicWorkflowRow);
  const logicFlowBoardComplete = Boolean(s.logicWorkflowRow?.command && s.logicWorkflowOutlineEntry?.line);
  const logicContextSummaryReady =
    s.logicContextSummaryItems.length >= 4 &&
    ["logic-context-signal", "logic-context-cursor", "logic-context-command", "logic-context-evidence"].every((id) =>
      s.logicContextSummaryItems.some((item: any) => item.id === id),
    );
  return [
    {
      id: "rust-editor",
      title: "Rust 编辑与补全",
      severity: s.activeProject.rustLogic.trim().length > 0 && s.activeProject.rustCommands.length > 0 ? "pass" : "fail",
      detail: `${s.activeProject.rustCommands.length} 个命令，${s.activeProject.rustModules.length} 个模块，${s.activeProject.cargoDependencies.length} 个依赖。`,
    },
    {
      id: "rust-editor-completion-detail",
      title: "Rust 补全来源详情",
      severity: s.rustCompletionItems.length > 0 || s.activeProject.rustLogic.trim().length > 0 ? "pass" : "warning",
      detail: s.activeRustCompletion
        ? `${s.activeRustCompletion.label} 来自 ${s.activeRustCompletion.sourceLabel ?? rustCompletionKindLabel(s.activeRustCompletion.kind)}，预览 ${s.activeRustCompletion.insertPreview ?? s.rustCompletionInsertPreview(s.activeRustCompletion.insertText)}。`
        : "补全候选会显示来源、插入预览，并能从源码符号补全跳回对应 logic.rs 行号。",
    },
    {
      id: "rust-editor-completion-commit",
      title: "Rust 补全提交闭环",
      severity: s.rustCompletionCommit || s.activeProject.rustLogic.trim().length > 0 ? "pass" : "warning",
      detail: s.rustCompletionCommit
        ? `${s.rustCompletionCommit.label} 已插入 ${s.rustCompletionCommit.insertedLength} 个字符，光标停在 ${s.rustCompletionCommit.cursor}。`
        : "Ctrl+Space 打开补全后，ArrowUp/ArrowDown 选择，Enter/Tab 或详情插入按钮会提交候选并在状态栏确认。",
    },
    {
      id: "rust-editor-signature-help",
      title: "Rust 签名帮助",
      severity: s.rustSignatureHelp ? "pass" : "warning",
      detail: s.rustSignatureHelp
        ? `${s.rustSignatureHelp.signature}，${s.rustSignatureHelp.parameters.length} 个参数，${s.rustSignatureHelp.bindingCount} 个 UI 调用，返回 ${s.rustSignatureHelp.resultSummary}。`
        : "逻辑页会根据光标所在槽函数或当前命令显示 Rust command 签名、参数来源和返回结构。",
    },
    {
      id: "rust-editor-format",
      title: "Rust 源码格式化",
      severity: s.activeProject.rustLogic.trim().length > 0 ? "pass" : "warning",
      detail: "逻辑页支持 Ctrl+Shift+F 轻量格式化，整理缩进、尾随空白和多余空行。",
    },
    {
      id: "rust-editor-line-comment",
      title: "Rust 行注释切换",
      severity: s.activeProject.rustLogic.length > 0 ? "pass" : "warning",
      detail: "逻辑页支持 Ctrl+/ 对当前行或选区执行 // 注释与取消注释。",
    },
    {
      id: "rust-editor-smart-pairs",
      title: "Rust 成对符号输入",
      severity: s.activeProject.rustLogic.length > 0 ? "pass" : "warning",
      detail: "逻辑页支持括号/引号成对输入、成对符号中间 Backspace 同步删除，以及 Enter 自动缩进。",
    },
    {
      id: "rust-editor-word-wrap",
      title: "Rust 自动折行",
      severity: "pass",
      detail: s.rustEditorWordWrap
        ? "逻辑页已开启自动折行，长命令和 JSON 片段会保持在编辑器宽度内。"
        : "逻辑页可一键切换自动折行，默认保持横向滚动，适合查看生成代码。",
    },
    {
      id: "rust-editor-duplicate-line",
      title: "Rust 复制行/选区",
      severity: s.activeProject.rustLogic.length > 0 ? "pass" : "warning",
      detail: "逻辑页支持 Ctrl+D 复制当前行或所选 Rust 代码片段。",
    },
    {
      id: "rust-editor-move-line",
      title: "Rust 行块移动",
      severity: s.activeProject.rustLogic.length > 0 ? "pass" : "warning",
      detail: "逻辑页支持 Alt+Up / Alt+Down 移动当前行或所选 Rust 行块。",
    },
    {
      id: "rust-editor-replace",
      title: "Rust 查找替换",
      severity: s.rustFindQuery.trim().length > 0 ? (s.rustFindMatches.length > 0 ? "pass" : "warning") : "pass",
      detail: s.rustFindQuery.trim().length > 0
        ? `${s.rustFindMatches.length} 个源码匹配项，可替换当前或全部替换。`
        : "逻辑页支持查找、大小写匹配、替换当前和全部替换。",
    },
    {
      id: "rust-editor-goto-line",
      title: "Rust 跳转行列",
      severity: s.rustEditorLines.length > 0 ? "pass" : "warning",
      detail: `逻辑页支持 Ctrl+G 聚焦行号输入，并跳转到 1-${s.rustEditorLines.length} 行内的指定位置。`,
    },
    {
      id: "rust-editor-minimap",
      title: "Rust 代码概览",
      severity: s.rustEditorMinimapMarkers.length > 0 ? "pass" : "warning",
      detail: `${s.rustEditorMinimapMarkers.length} 个 minimap 标记覆盖大纲、诊断、查找命中、当前符号和光标行，可点击跳转源码。`,
    },
    {
      id: "rust-editor-breadcrumbs",
      title: "Rust 当前位置 Breadcrumbs",
      severity: s.rustCursorOutlineEntry ? "pass" : "warning",
      detail: s.rustCursorOutlineEntry
        ? `Breadcrumbs 可从项目、logic.rs、${rustOutlineKindTitle(s.rustCursorOutlineEntry.kind)} 和${s.rustCursorSignalSlotRow ? "绑定控件" : "当前源码"}逐级跳转。`
        : "移动光标到函数、槽函数或类型内后，Breadcrumbs 会显示可点击的 Rust 上下文路径。",
    },
    {
      id: "rust-editor-rename-symbol",
      title: "Rust 符号重命名",
      severity: s.rustCurrentIdentifier ? "pass" : "warning",
      detail: s.rustCurrentIdentifier
        ? `当前符号 ${s.rustCurrentIdentifier.name} 有 ${s.rustCurrentIdentifierOccurrences.length} 处词法匹配，可用 F2 快速重命名。`
        : "逻辑页支持 F2 对光标处 Rust 标识符执行词法级快速重命名。",
    },
    {
      id: "rust-editor-references",
      title: "Rust 符号引用",
      severity: s.rustCurrentIdentifierReferences.length > 0 ? "pass" : "warning",
      detail: s.rustCurrentIdentifier
        ? `${s.rustCurrentIdentifier.name} 有 ${s.rustCurrentIdentifierReferences.length} 处引用，引用面板显示行列、源码片段并可点击选中。`
        : "把光标放到 Rust 标识符上后，逻辑页会列出当前符号引用并支持逐条跳转。",
    },
    {
      id: "rust-editor-copy-location",
      title: "Rust 位置复制",
      severity: s.rustEditorSelection.line > 0 && s.rustEditorSelection.column > 0 ? "pass" : "warning",
      detail: `逻辑页可复制 rust/logic.rs:${s.rustEditorSelection.line}:${s.rustEditorSelection.column}，便于从日志、任务和笔记回跳。`,
    },
    {
      id: "rust-editor-select-symbol-range",
      title: "Rust 符号范围选择",
      severity: s.rustCursorOutlineEntry?.line ? "pass" : "warning",
      detail: s.rustCursorOutlineEntry?.line
        ? `Alt+Enter 可选择 ${rustOutlineKindTitle(s.rustCursorOutlineEntry.kind)} ${s.rustCursorOutlineEntry.label} 的完整范围，便于复制、重构和批量编辑。`
        : "移动光标到函数、槽函数、module、impl、type 或 const 内后，可一键选择整个符号范围。",
    },
    {
      id: "rust-diagnostic-gutter",
      title: "Rust 诊断 Gutter",
      severity: "pass",
      detail: s.buildDiagnostics.length > 0
        ? `${s.buildDiagnostics.length} 个构建诊断映射到 ${s.rustDiagnosticsBySourceLine.size} 个可点击源码行。`
        : "Rust 编辑器左侧行号可直接跳转；出现构建诊断时，红/黄标记可点击打开问题并定位源码。",
    },
    {
      id: "rust-editor-quick-fixes",
      title: "Rust 快速修复",
      severity: s.actionableRustQuickFixCount > 0 ? "pass" : "warning",
      detail: `逻辑页提供 ${s.rustEditorQuickFixes.length} 个 quick fix，覆盖缺失槽函数、构建诊断、格式化、命令草稿、引用浏览和符号重命名。`,
    },
    {
      id: "rust-editor-evidence-toolbar",
      title: "Rust 证据回跳",
      severity: "pass",
      detail: `Rust 逻辑页可直接打开 ${s.builderIssueCount} 个问题、${s.activeProjectTasks.length} 个任务和运行日志 Dock。`,
    },
    {
      id: "rust-codelens-callers",
      title: "Rust CodeLens 调用者",
      severity: s.activeRustCommandCodeLensRows.length > 0 ? "pass" : "warning",
      detail: `${sanitizeRustCommandName(s.activeRustCommand.name)} CodeLens 当前显示 ${s.activeRustCommandCodeLensRows.length} 行，${s.activeRustCommandBindingRows.length} 个已绑定 UI 调用；可从编辑器上下文直接跳控件、跳槽函数、运行或打开映射。`,
    },
    {
      id: "logic-command-center",
      title: "当前命令操作中心",
      severity: s.activeProject.rustCommands.length > 0 ? "pass" : "warning",
      detail: `${sanitizeRustCommandName(s.activeRustCommand.name)} 的槽函数、主调用控件、运行、映射、连接矩阵和调试响应片段集中在 Rust 编辑器上方操作区。`,
    },
    {
      id: "rust-command-source-inspector",
      title: "Rust Command 源码检查器",
      severity: s.activeProject.rustCommands.length > 0 ? (s.activeRustCommandOutlineEntry ? "pass" : "warning") : "fail",
      detail: `${s.activeRustCommandInvokeName} 映射到 ${s.activeRustCommandSourceLineLabel}，${s.activeRustCommandBindingRows.length} 个 UI 调用，可直接复制 invoke、打开源码、运行主调用或检查映射。`,
    },
    {
      id: "signal-slot",
      title: "UI 到后端槽函数链接",
      severity: signalSlotModelValid ? (hasSignalSlotWarnings ? "warning" : "pass") : "fail",
      detail: `${s.logicSignalSlotBoundCount}/${s.logicSignalSlotRows.length} 个控件事件已绑定，${s.missingRustSlotEntries.length} 个槽函数待生成，健康度 ${s.logicConnectionHealthScore}%。`,
    },
    {
      id: "logic-connection-matrix",
      title: "信号槽连接矩阵",
      severity: s.logicSignalSlotRows.length > 0 ? "pass" : "warning",
      detail:
        s.logicSignalSlotRows.length > 0
          ? `${s.filteredLogicConnectionRows.length} 条连接按控件信号、Rust command、槽函数状态和结果回写对齐展示。`
          : "添加 Button、Input、Switch、Select 等交互控件后，逻辑页会显示可直接绑定和运行的连接矩阵。",
    },
    {
      id: "logic-flow-board",
      title: "逻辑链路板",
      severity: logicFlowBoardReady ? (logicFlowBoardComplete ? "pass" : "warning") : "warning",
      detail: s.logicWorkflowRow
        ? `${getItemSummary(s.logicWorkflowRow.item)}.${s.logicWorkflowRow.eventName} -> ${
            s.logicWorkflowRow.command ? sanitizeRustCommandName(s.logicWorkflowRow.command.name) : "待绑定 command"
          }，槽函数${s.logicWorkflowOutlineEntry?.line ? `位于 logic.rs:${s.logicWorkflowOutlineEntry.line}` : "需要生成或连接"}。`
        : "选择一个有事件的控件后，逻辑页会显示控件信号、Rust command、槽函数源码和运行回写四段链路。",
    },
    {
      id: "logic-context-summary",
      title: "逻辑上下文摘要",
      severity: logicContextSummaryReady ? "pass" : "warning",
      detail: `${s.logicContextSummaryItems.length} 个上下文入口把 UI 信号、Rust 光标、活跃 command 和运行/诊断证据集中显示；当前 command 为 ${sanitizeRustCommandName(s.activeRustCommand.name)}。`,
    },
    {
      id: "logic-workbench-next-actions",
      title: "逻辑页下一步工作台",
      severity: s.logicWorkbenchNextActions.length > 0 && s.logicWorkbenchPrimaryAction ? "pass" : "warning",
      detail: s.logicWorkbenchPrimaryAction
        ? `${s.logicWorkbenchPrimaryAction.title} 是当前推荐动作；逻辑页共提供 ${s.logicWorkbenchNextActions.length} 个下一步入口，覆盖绑定、生成槽、运行验证和证据回看。`
        : "逻辑页需要根据当前信号/槽状态自动推荐下一步动作。",
    },
    {
      id: "rust-command-binding-preview",
      title: "Rust 命令调用关系",
      severity: s.activeProject.rustCommands.length > 0 ? "pass" : "warning",
      detail: `${sanitizeRustCommandName(s.activeRustCommand.name)} 当前有 ${s.activeRustCommandBindingRows.length} 个 UI 调用；右侧命令属性可查看输入、输出、跳回控件、运行和映射设置。`,
    },
    {
      id: "rust-command-slot-card",
      title: "当前命令槽函数卡片",
      severity: s.activeRustCommandOutlineEntry ? "pass" : "warning",
      detail: `${sanitizeRustCommandName(s.activeRustCommand.name)} 槽函数状态：${s.activeRustCommandSlotLocationLabel}；右侧卡片可打开源码、生成缺失槽或切到调用者列表。`,
    },
    {
      id: "logic-command-impact-panel",
      title: "Rust 命令影响面板",
      severity: s.activeProject.rustCommands.length > 0 ? "pass" : "warning",
      detail: `${sanitizeRustCommandName(s.activeRustCommand.name)} 汇总 ${s.activeRustCommandBindingRows.length} 个 UI 调用、${s.activeRustCommandParameters.length} 个输入参数、${s.activeRustCommandResultImpacts.length} 个结果影响和 ${s.activeRustCommandSlotLocationLabel}。`,
    },
    {
      id: "rust-debug-workbench",
      title: "Rust 调试工作台",
      severity: s.rustDebuggerTabs.length === 4 && s.rustDebuggerBreakpointRows.length > 0 && s.rustDebuggerWatchRows.length > 0 ? "pass" : "warning",
      detail: `Problems ${s.rustDebuggerProblemRows.length} / Breakpoints ${s.rustDebuggerBreakpointRows.length} / Watch ${s.rustDebuggerWatchRows.length} / Call Stack ${s.rustDebuggerCallStackRows.length}，可在逻辑页右侧直接查看诊断、断点、观察值和调用链。`,
    },
    {
      id: "selection-signal-slot-strip",
      title: "选择栏 Signal/Slot 快捷链路",
      severity: s.logicSignalSlotRows.length > 0 ? "pass" : "warning",
      detail:
        s.selectedItem && s.selectedEventName
          ? `${getItemSummary(s.selectedItem)}.${s.selectedEventName} -> ${
              s.selectedEventCommand ? sanitizeRustCommandName(s.selectedEventCommand.name) : "待创建 Rust command"
            } -> ${s.selectedSignalSlotOutlineEntry?.line ? `logic.rs:${s.selectedSignalSlotOutlineEntry.line}` : s.selectedEventCommand ? "定位函数" : "创建槽函数"}。`
          : "单选可交互控件时，固定选择栏会显示事件、Rust command 和 logic.rs 槽函数入口。",
    },
    {
      id: "problem-navigation",
      title: "问题导航",
      severity: "pass",
      detail: s.builderIssueCount > 0
        ? `底部 输出面板 当前有 ${s.builderIssueCount} 个问题，可用 F8 / Shift+F8 在诊断、属性问题和构建错误之间跳转。`
        : "底部 输出面板 支持 F8 / Shift+F8 问题导航；当前没有活跃问题。",
    },
  ];
}
