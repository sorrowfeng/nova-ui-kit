// check-builder-file-size — the per-file ceiling that check-showcase-size does
// not cover.
//
// check-showcase-size ratchets BuilderShowcase.tsx only, so the eleven fat
// modules under builder/ were unmeasured and kept growing: monolith-module is
// 8631 lines against an 800-line house ceiling. docs/monolith-decomposition.md
// named this hole ("若要强制，需另开一条按文件量的门禁"); this is that gate.
//
// The table below is a ratchet, not a budget. Each ceiling is the size the file
// has today, so nothing has to shrink before the gate is useful — but nothing
// may grow either. When a file does shrink, tighten its ceiling in the same
// commit, exactly like MAX_LINES in check-showcase-size. An entry whose file
// has been deleted or renamed is an error: the table has to stay true.
//
// New files are not grandfathered. They get the house ceiling and have to fit.
import fs from "node:fs";
import path from "node:path";

const HOUSE_MAX_LINES = 800; // ~/.claude/rules/common/coding-style.md

/**
 * Ratcheted ceilings, one per file that is already over the house limit.
 * Lower these whenever a file shrinks. A ceiling may rise only in a commit that
 * adds behaviour and says which lines the behaviour is — the ratchet's job is
 * to make growth visible, not to make growth impossible. BuildView went
 * 4768 -> 4774 wiring the git conflict editor (4 destructure entries, the
 * onOpenConflict prop, and a refresh after Git 快照). monolith-module went
 * 8631 -> 8632 seeding a new project's release window shell from its page:
 * one `releaseWindowShellFromPage` import and the createProject call site.
 * The helper itself lives in release.ts — the monolith only pays for the call.
 * BuildView went 4774 -> 4779 showing the unverified count beside the audit
 * summary and the parity chips (a fifth summary tile and a fourth chip): the
 * product now says how many checks could not run, so the tile has to exist.
 *
 * `check:builder-file-size` fails on a missing entry's file and on any file
 * above its ceiling.
 */
const CEILINGS = {
  "monolith-module.tsx": 8632,
  "DesignView.tsx": 5768,
  "LogicView.tsx": 5713,
  "ShellView.tsx": 3365,
  "BuilderItemPreview.tsx": 4844,
  "BuildView.tsx": 4779,
  "component-palette.ts": 2534,
  "ProjectView.tsx": 2321,
  "types-project.ts": 923,
  "SelectionActionBar.tsx": 882,
  "change-impact.ts": 820,
};

const dir = path.join(process.cwd(), "src", "components", "showcase", "builder");
if (!fs.existsSync(dir)) {
  console.error("check-builder-file-size: missing src/components/showcase/builder");
  process.exit(1);
}

const failures = [];
const present = new Set();

for (const file of fs.readdirSync(dir).sort()) {
  if (!/\.(ts|tsx)$/.test(file)) continue;
  present.add(file);
  const lines = fs.readFileSync(path.join(dir, file), "utf8").split(/\r?\n/).length;
  const ceiling = CEILINGS[file] ?? HOUSE_MAX_LINES;
  if (lines > ceiling) {
    failures.push(`${file}: ${lines} lines (ceiling ${ceiling})`);
    continue;
  }
  // A ceiling left high after the file shrank hides the next growth. It has to
  // come down with the file, or the ratchet has already slipped.
  const slack = ceiling - lines;
  if (CEILINGS[file] !== undefined && slack > 200) {
    failures.push(
      `${file}: ${lines} lines but its ceiling is still ${ceiling} (${slack} slack) — lower the ceiling now that it fits`,
    );
  }
}

for (const file of Object.keys(CEILINGS)) {
  if (!present.has(file)) {
    failures.push(`${file}: listed in CEILINGS but the file is gone — delete the entry`);
  }
}

const overHouse = [...present].filter((f) => {
  const n = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/).length;
  return n > HOUSE_MAX_LINES;
}).length;

if (failures.length > 0) {
  console.error(`check-builder-file-size: ${failures.length} problem(s)`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

console.log(
  `check-builder-file-size ok: ${present.size} files under ${path.relative(process.cwd(), dir)}, ` +
    `${overHouse} grandfathered above the ${HOUSE_MAX_LINES}-line house ceiling (ratcheted, may only shrink).`,
);
