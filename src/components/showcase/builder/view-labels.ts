// Label classification behind the quiet-vs-signal rules.
//
// Kept free of JSX so the density gate's regression test can import it directly
// and pin the decisions. A misclassification here is silent: a real signal
// painted as a readout stops asking for action, and a routine label painted as
// a chip is pure decoration.

/**
 * States that need no visual weight: the panel is fine and there is nothing to
 * do. An idle task queue saying "空" on six sections tells the user nothing six
 * times over — only the sections that are running or failed do.
 */
export const QUIET_STATE_LABELS: ReadonlySet<string> = new Set([
  "就绪",
  "空",
  "已同步",
  "已完成",
  "完成",
  "已取消",
  "已跳过",
  "已绑定",
  "已连接",
  "正常",
  "无",
  "待开始",
  "通过",
  "已清理",
]);

/** Zero is not news; a count chip should paint when something is actually queued. */
export function isQuietCount(count: number): boolean {
  return !Number.isFinite(count) || count <= 0;
}

/**
 * Same rule for counts that arrive as display text. Non-numeric labels are
 * left alone — they are names, not tallies, and must not vanish on a parse.
 */
export function isQuietCountLabel(label: string): boolean {
  const count = Number(label.trim());
  return Number.isFinite(count) && count <= 0;
}

/**
 * Labels that always mean "act now". These earn a chip even when the row's
 * coarse status field looks benign — "待生成" arrives on a `pending` row that
 * also carries plain empty-state text like "尚无版本", and those two must not
 * be painted with the same weight.
 */
export const SIGNAL_STATE_LABELS: ReadonlySet<string> = new Set([
  "未保存",
  "设置未保存",
  "等待保存",
  "待同步",
  "待生成",
  "待构建",
  "已过期",
  "有变更",
  "运行中",
  "失败",
  "缺失",
  "阻塞",
  "错误",
]);

/**
 * Chinese status labels are noun + state: "槽函数就绪", "全部同步". The noun only
 * says which panel is fine, so a routine ending makes the whole token routine.
 * A label that still names work to do ("3 个槽待生成", "未连接 UI") keeps its chip.
 */
const QUIET_STATE_SUFFIXES = ["就绪", "已完成", "已同步", "同步", "正常", "通过", "已清理", "待开始", "一致"];

/**
 * "无需处理" reads like work but says there is none. A negated need is not a
 * call to act, and the `需` fragment below would otherwise chip it.
 */
const QUIET_STATE_PREFIXES = ["无需", "不必", "不用"];

/**
 * Negations of success ("不通过", "不同步") are problems, not routine notes. They
 * are checked before the quiet endings because "页面与发布一致" is routine while
 * "页面与发布不一致" is not.
 */
const SIGNAL_NEGATION_FRAGMENTS = ["不通过", "不同", "不一致", "不匹配", "无法", "未能"];

/**
 * Work that is unfinished, blocked, broken or in flight. The `正在` / `中`
 * entries are the in-progress family ("正在构建 exe", "排队中") — the one state
 * where the user is waiting on the app and needs to see that it is moving.
 */
const SIGNAL_STATE_FRAGMENTS = [
  "待", "未", "缺", "失败", "错误", "阻塞", "需",
  "正在", "运行中",
];

const SIGNAL_STATE_SUFFIXES = ["中"];

export function isSignalStateLabel(label: string): boolean {
  const trimmed = label.trim();
  // "待开始" is routine scheduling, not a call to act — the quiet list wins.
  if (QUIET_STATE_LABELS.has(trimmed)) return false;
  if (QUIET_STATE_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) return false;
  if (SIGNAL_STATE_LABELS.has(trimmed)) return true;
  // Negations of success beat a routine ending: "不同步" is a problem even
  // though "同步" is one of the quiet endings below.
  if (SIGNAL_NEGATION_FRAGMENTS.some((fragment) => trimmed.includes(fragment))) return true;
  // A routine ending makes the whole token routine, even when it also carries a
  // work fragment — "任务待开始" is scheduling, not a call to act.
  if (QUIET_STATE_SUFFIXES.some((suffix) => trimmed.endsWith(suffix))) return false;
  return (
    SIGNAL_STATE_FRAGMENTS.some((fragment) => trimmed.includes(fragment)) ||
    SIGNAL_STATE_SUFFIXES.some((suffix) => trimmed.endsWith(suffix))
  );
}

export function isQuietStateLabel(label: string): boolean {
  const trimmed = label.trim();
  if (QUIET_STATE_LABELS.has(trimmed)) return true;
  if (QUIET_STATE_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) return true;
  if (isSignalStateLabel(trimmed)) return false;
  return QUIET_STATE_SUFFIXES.some((suffix) => trimmed.endsWith(suffix));
}

/**
 * A value to read rather than a state to act on: a version, a tally, a mode.
 * Unknown labels default here — spending a chip on something nobody has
 * classified is how decoration accumulates.
 */
export function isReadoutStateLabel(label: string): boolean {
  const trimmed = label.trim();
  return !isSignalStateLabel(trimmed) && !isQuietStateLabel(trimmed);
}
