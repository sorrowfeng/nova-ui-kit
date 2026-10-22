// ui-density — measurement half of the "simple and easy to use" goal.
//
// A Qt Creator-class surface shows a handful of status tokens and mostly
// actions. The builder's workbenches drift the other way: every row carries
// badges, so the eye has to filter decoration before it finds anything to do.
// This module turns "cluttered" into three numbers per surface so an
// optimization round can be verified rather than argued about.
//
// Pure functions here; the browser driving lives in check-ui-density.mjs.

/** Height at which a rounded token counts as a chip rather than a control. */
export const CHIP_MAX_HEIGHT = 28;

/** Longest text a status chip ever carries before it becomes prose. */
export const CHIP_MAX_TEXT = 24;

/**
 * Counts only elements that are actually painted in the viewport. Hidden
 * panels and collapsed <details> report zero-area rects and are excluded.
 */
export const DENSITY_PROBE = `(() => {
  const heightLimit = ${CHIP_MAX_HEIGHT};
  const textLimit = ${CHIP_MAX_TEXT};

  // Chrome (titlebar, status bar, bottom dock) is stable and expected; what the
  // user has to parse is the workbench itself. Measuring the whole viewport
  // hides surface noise behind a constant shared by every mode.
  const root =
    document.querySelector("[data-builder-readable-workbench]") || document.body;

  // Counted as "in the surface", not "in the viewport". Scrolling must not
  // change the answer: a panel does not get quieter by pushing its decoration
  // below the fold, and an expanded section would otherwise look better than
  // a collapsed one simply because it scrolled things out of view.
  const hasLayout = (rect) => rect.width > 0 && rect.height > 0;

  const all = Array.from(root.querySelectorAll("*"));
  const visible = all.filter((el) => {
    const rect = el.getBoundingClientRect();
    if (!hasLayout(rect)) return false;
    const style = window.getComputedStyle(el);
    if (style.visibility === "hidden" || style.opacity === "0" || style.display === "none") return false;
    // Screen-reader-only text is deliberately not painted; counting it would
    // charge the surface for content the eye never sees.
    if (el.closest(".sr-only, [aria-hidden='true'], .visually-hidden")) return false;
    // A closed <details> still reports a live rect for its body, so geometry
    // alone over-counts. Collapsed panels are not on screen.
    for (let host = el.parentElement; host; host = host.parentElement) {
      if (host instanceof HTMLDetailsElement && !host.open) return false;
    }
    if (style.position === "absolute" && (style.clipPath === "inset(50%)" || /rect\\(0(?:px)?,?\\s*0(?:px)?,?\\s*0(?:px)?,?\\s*0(?:px)?\\)/.test(style.clip || ""))) return false;
    return true;
  });

  // Only leaf text: textContent on a parent repeats its whole subtree, so
  // summing it over depth inflates the figure by the nesting factor.
  const leafTextOf = (el) => {
    let text = "";
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) text += node.textContent || "";
    }
    return text.replace(/\\s+/g, " ").trim();
  };

  const isInteractive = (el) =>
    el.matches(
      "button, a[href], input, select, textarea, summary, " +
        "[role=button], [role=link], [role=tab], [role=menuitem], " +
        "[role=checkbox], [role=switch], [role=option], [role=combobox], " +
        "[tabindex]:not([tabindex='-1'])",
    );

  const isChip = (el) => {
    const rect = el.getBoundingClientRect();
    if (rect.height > heightLimit) return false;
    const text = leafTextOf(el);
    if (!text || text.length > textLimit) return false;
    const style = window.getComputedStyle(el);
    if (parseFloat(style.borderRadius) < rect.height / 2 - 1) return false;
    const hasChipChild = Array.from(el.children).some((child) => {
      const childRect = child.getBoundingClientRect();
      return (
        childRect.height <= heightLimit &&
        leafTextOf(child).length > 0 &&
        leafTextOf(child).length <= textLimit &&
        window.getComputedStyle(child).borderRadius !== "0px"
      );
    });
    return !hasChipChild;
  };

  const chips = visible.filter((el) => !isInteractive(el) && isChip(el));
  const controls = visible.filter((el) => isInteractive(el));
  const namedControls = controls.filter((el) => {
    const label =
      (el.getAttribute("aria-label") || "") ||
      (el.getAttribute("title") || "") ||
      leafTextOf(el) ||
      (el.labels && el.labels[0] ? el.labels[0].textContent : "") ||
      (el.getAttribute("aria-labelledby")
        ? String(el.getAttribute("aria-labelledby"))
            .split(/\\s+/)
            .map((id) => (document.getElementById(id)?.textContent || ""))
            .join(" ")
        : "");
    return label.trim().length > 0;
  });

  // Badge's own classes are identical at every call site, so the useful label is
  // the nearest data-builder-* hook — the same identifier the tests use.
  const describe = (el) => {
    const cls = (el.className && typeof el.className === "string" ? el.className : "")
      .split(/\\s+/)
      .filter((token) => token && !token.startsWith("data-"))
      .slice(0, 3)
      .join(".");
    let hook = "";
    for (let host = el; host && !hook; host = host.parentElement) {
      for (const attr of host.attributes || []) {
        if (attr.name.startsWith("data-builder-")) {
          hook = attr.name.replace("data-builder-", "") + (attr.value ? "=" + attr.value.slice(0, 28) : "");
          break;
        }
      }
    }
    return el.tagName.toLowerCase() + (cls ? "." + cls : "") + (hook ? " @" + hook : "");
  };

  // Repeated chip text is the tell: "source" painted on every tree row is one
  // design decision made seventeen times. Grouping surfaces that pattern, and
  // keeping one sample tag so the source is one look away instead of a search.
  const histogram = new Map();
  for (const chip of chips) {
    const text = leafTextOf(chip).slice(0, textLimit);
    const entry = histogram.get(text) || { text, count: 0, sampleTag: describe(chip) };
    entry.count += 1;
    histogram.set(text, entry);
  }

  return {
    chipCount: chips.length,
    controlCount: controls.length,
    namedControlCount: namedControls.length,
    textChars: visible.reduce((sum, el) => sum + leafTextOf(el).length, 0),
    chipSamples: chips.slice(0, 12).map((el) => ({
      tag: describe(el),
      text: leafTextOf(el).slice(0, textLimit),
    })),
    chipHistogram: Array.from(histogram.values())
      .sort((a, b) => b.count - a.count || a.text.localeCompare(b.text))
      .slice(0, 15),
  };
})()`;

/**
 * Opens every disclosure on the workbench so a surface can be measured the way
 * it looks once someone has drilled into it. The default collapsed state is the
 * first impression; the expanded state is what a working session lives in.
 */
export const EXPAND_DISCLOSURES = `(() => {
  const root =
    document.querySelector("[data-builder-readable-workbench]") || document.body;
  const panels = Array.from(root.querySelectorAll("details"));
  let opened = 0;
  for (const panel of panels) {
    if (!panel.open) {
      panel.open = true;
      opened += 1;
    }
  }
  return opened;
})()`;

/**
 * Per-surface budgets, in both disclosure states.
 *
 * Counts are of the whole workbench, not just the current scroll window, so
 * expanding a panel that pushes its decoration below the fold still counts.
 *
 * `collapsed` is the first impression. `expanded` is what someone lives in
 * once they have opened the panels they need. Budgets sit just above the
 * measured state so adding decoration fails while adding a feature does not;
 * every optimization round should ratchet them down.
 */
export const DENSITY_BUDGETS = {
  project: { maxChips: 17, maxTextChars: 1350 },
  design: { maxChips: 11, maxTextChars: 410 },
  logic: { maxChips: 17, maxTextChars: 380 },
  build: { maxChips: 9, maxTextChars: 265 },
};

export const EXPANDED_BUDGETS = {
  project: { maxChips: 68, maxTextChars: 5700 },
  design: { maxChips: 14, maxTextChars: 1180 },
  logic: { maxChips: 43, maxTextChars: 3550 },
  build: { maxChips: 78, maxTextChars: 18100 },
};

/**
 * Compare one surface report against its budget.
 * Returns problem strings; empty means the surface is within budget.
 */
export function findDensityOverages(surface, report, budgets, state = "collapsed") {
  const budget = budgets[surface];
  if (!budget) return [`unknown surface "${surface}"`];
  const problems = [];
  if (report.chipCount > budget.maxChips) {
    problems.push(
      `${surface} (${state}): ${report.chipCount} status chips on screen, budget is ${budget.maxChips}`,
    );
  }
  if (report.textChars > budget.maxTextChars) {
    problems.push(
      `${surface} (${state}): ${report.textChars} visible text characters, budget is ${budget.maxTextChars}`,
    );
  }
  return problems;
}

/** One line per surface, for the report mode. */
export function describeDensity(surface, report, state = "") {
  const actionRatio =
    report.controlCount === 0 ? 0 : Math.round((report.chipCount / report.controlCount) * 100);
  const tag = state ? `${state}:` : "";
  return (
    `${surface.padEnd(8)} ${tag.padEnd(10)} chips=${String(report.chipCount).padStart(3)}` +
    `  controls=${String(report.controlCount).padStart(3)}` +
    `  chip/action=${String(actionRatio).padStart(3)}%` +
    `  text=${String(report.textChars).padStart(5)}c`
  );
}
