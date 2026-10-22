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

if (failures.length > 0) {
  console.error(`\ncheck-ui-density-rules: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log("\ncheck-ui-density-rules ok: the gate's verdict logic holds.");
