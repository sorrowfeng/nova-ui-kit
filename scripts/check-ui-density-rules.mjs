// check-ui-density-rules — regression tests for the density gate's verdict logic.
//
// check-ui-density.mjs decides whether a workbench is "simple enough" by calling
// findDensityOverages. A bug there silently reports a decorated surface as
// quiet, so the verdict itself is worth pinning down independently of the
// browser run.
import {
  DENSITY_BUDGETS,
  EXPANDED_BUDGETS,
  describeDensity,
  findDensityOverages,
} from "./usability/ui-density.mjs";
import {
  isQuietCountLabel,
  isQuietStateLabel,
  isReadoutStateLabel,
  isSignalStateLabel,
} from "../src/components/showcase/builder/view-labels.ts";

const failures = [];

function check(name, condition, detail) {
  if (condition) {
    console.log(`  ok   ${name}`);
    return;
  }
  failures.push(name);
  console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
}

function report(chipCount, controlCount, textChars) {
  return { chipCount, controlCount, namedControlCount: controlCount, textChars, chipSamples: [], chipHistogram: [] };
}

console.log("check-ui-density-rules: budget verdicts");

// Values are derived from the budgets rather than written out, so ratcheting a
// budget down cannot make these pass/fail cases disagree with the table.
const design = DENSITY_BUDGETS.design;
check(
  "a surface exactly at budget passes",
  findDensityOverages("design", report(design.maxChips, 100, design.maxTextChars), DENSITY_BUDGETS, "collapsed").length === 0,
);
check(
  "one chip over budget fails",
  findDensityOverages("design", report(design.maxChips + 1, 100, design.maxTextChars), DENSITY_BUDGETS, "collapsed").length === 1,
);
check(
  "text over budget fails even when chips are fine",
  findDensityOverages("design", report(design.maxChips, 100, design.maxTextChars + 1), DENSITY_BUDGETS, "collapsed").length === 1,
);
check(
  "chip and text overages both report",
  findDensityOverages("design", report(design.maxChips + 1, 100, design.maxTextChars + 1), DENSITY_BUDGETS, "collapsed").length === 2,
);

const unknown = findDensityOverages("nope", report(1, 1, 1), DENSITY_BUDGETS, "collapsed");
check("an unknown surface is a hard error", unknown.length === 1 && unknown[0].includes("unknown surface"));

const build = DENSITY_BUDGETS.build;
const chipProblem = findDensityOverages("build", report(build.maxChips + 5, 50, 100), DENSITY_BUDGETS, "collapsed")[0];
check(
  "the failure message names the surface, state and both numbers",
  chipProblem.includes("build (collapsed)") &&
    chipProblem.includes(String(build.maxChips + 5)) &&
    chipProblem.includes(String(build.maxChips)),
  chipProblem,
);

console.log("check-ui-density-rules: every surface has both budgets");
for (const surface of ["project", "design", "logic", "build"]) {
  check(`${surface} has a collapsed budget`, Boolean(DENSITY_BUDGETS[surface]));
  check(`${surface} has an expanded budget`, Boolean(EXPANDED_BUDGETS[surface]));
  // Expanded is the more decorated state by construction; if a round ever
  // ratchets collapsed below it the gate would stop making sense.
  check(
    `${surface} expanded budget is at least its collapsed budget`,
    EXPANDED_BUDGETS[surface].maxChips >= DENSITY_BUDGETS[surface].maxChips &&
      EXPANDED_BUDGETS[surface].maxTextChars >= DENSITY_BUDGETS[surface].maxTextChars,
  );
}

console.log("check-ui-density-rules: report formatting");
const line = describeDensity("build", report(76, 273, 17682), "expanded ");
check("the summary line names the surface", line.startsWith("build"));
check("the summary line carries the chip count", line.includes("chips= 76"));
check("the summary line carries the control count", line.includes("controls=273"));
check(
  "the decoration ratio is decoration over actions",
  line.includes("chip/action= 28%"),
  line,
);

console.log("check-ui-density-rules: label classification");

// The three-way split decides what the eye has to filter. Each case below is a
// label that actually appears in the workbenches; getting one wrong either
// hides a call to act or spends visual budget on a routine note.
const signalLabels = [
  "未保存", "待生成", "待构建", "失败", "运行中", "3 个槽待生成", "未连接 UI", "需处理",
  // A stale or drifted plan is unusable until it is regenerated.
  "已过期", "有变更",
  // In-flight work is the one state the user is waiting on.
  "正在构建 exe", "排队中", "运行中 · pid 3",
  // Negations of success are problems, not routine notes.
  "不通过", "校验不通过", "不同步", "无法同步", "不一致", "页面与发布不一致", "不匹配",
];
for (const label of signalLabels) {
  check(`"${label}" is a signal`, isSignalStateLabel(label) && !isQuietStateLabel(label) && !isReadoutStateLabel(label));
}

const quietLabels = [
  "就绪", "空", "已同步", "通过", "槽函数就绪", "全部同步", "页面与发布一致", "待开始", "一致",
  "完成", "已取消", "已跳过",
  // A negated need says there is nothing to do.
  "无需处理", "无需重建", "不必保存",
];
for (const label of quietLabels) {
  check(`"${label}" is quiet`, isQuietStateLabel(label) && !isSignalStateLabel(label) && !isReadoutStateLabel(label));
}

const readoutLabels = ["当前", "当前编辑", "目录", "推断", "release", "必填", "string", "尚无版本", "83%", "01.0", "desktop"];
for (const label of readoutLabels) {
  check(`"${label}" is a readout`, isReadoutStateLabel(label) && !isSignalStateLabel(label) && !isQuietStateLabel(label));
}

// A compound that mixes a routine noun with work still to do must not be
// swallowed by the quiet suffix rule.
check(
  "a routine ending does not silence outstanding work",
  isSignalStateLabel("槽函数待生成") && !isQuietStateLabel("槽函数待生成"),
);
check(
  "the quiet list beats a signal fragment",
  isQuietStateLabel("待开始") && !isSignalStateLabel("待开始"),
);
// A routine ending is routine even when the compound also carries a work
// fragment — "3 项待开始" is scheduling, and the quiet suffix has to win.
check(
  "a quiet ending beats an in-word work fragment",
  isQuietStateLabel("任务待开始") && !isSignalStateLabel("任务待开始"),
);
check(
  "a negated success still beats a quiet ending",
  isSignalStateLabel("页面与发布不同步") && !isQuietStateLabel("页面与发布不同步"),
);
check(
  "a quiet prefix beats the need fragment",
  isQuietStateLabel("无需处理") && !isSignalStateLabel("无需处理"),
);
check("zero counts are quiet", isQuietCountLabel("0"));
check("non-zero counts are not quiet", !isQuietCountLabel("3"));
check("a name is never mistaken for a zero count", !isQuietCountLabel("源码"));

if (failures.length > 0) {
  console.error(`\ncheck-ui-density-rules: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log("\ncheck-ui-density-rules ok: the gate's verdict logic holds.");
