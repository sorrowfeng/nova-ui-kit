// Checklist 1.6 — "关键操作仍可辨识；不依赖颜色单独传达状态".
//
// A control that says what it means only through a colour chip fails this as
// soon as the palette is overridden (Windows High Contrast, forced-colors, a
// red/green deficiency). The audit looks for tone-coloured elements that carry
// no text, no accessible name and no icon as a second channel.
//
// The expression is evaluated inside the page and must stay self-contained.

/** Classes that mean "this element is signalling state through colour". */
const TONE_CLASS = "(?:^|\\s)(?:bg|text|border)-(?:destructive|warning|success|info|primary|secondary|outline)(?:\\/\\d+)?(?:\\s|$)";

export const COLOR_ONLY_AUDIT = `(() => {
  const TONE = /(?:^|\\s)(?:bg|text|border)-(?:destructive|warning|success|info|primary|secondary|outline)(?:\\/\\d+)?(?:\\s|$)/;
  const describe = (el) => {
    const id = el.id ? '#' + el.id : '';
    const data = Array.from(el.attributes)
      .filter((a) => a.name.startsWith('data-') || a.name === 'role' || a.name.startsWith('aria-'))
      .map((a) => a.name + '=' + String(a.value).slice(0, 30));
    const label = el.getAttribute('aria-label') || (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 24);
    const cls = String(el.className || '').split(/\\s+/).filter(Boolean).slice(0, 5).join('.');
    return el.tagName.toLowerCase() + id + (data.length ? '[' + data.join(',') + ']' : '') + (label ? '{' + label + '}' : '') + (cls ? '.' + cls : '');
  };

  const candidates = Array.from(document.querySelectorAll('[class]')).filter((el) => {
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
  });

  const colorOnly = [];
  for (const el of candidates) {
    const cls = String(el.className || '');
    if (!TONE.test(cls)) continue;
    // The second channel: readable text, an accessible name, an icon/shape, an
    // ARIA state, or a nearby label (badge + caption is the common pattern).
    const ownText = (el.textContent || '').replace(/\\s+/g, ' ').trim();
    const name = el.getAttribute('aria-label') || el.getAttribute('title') || '';
    const labelledBy = el.getAttribute('aria-labelledby');
    const labelled = labelledBy
      ? labelledBy.split(/\\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ').trim()
      : '';
    const hasIcon = Boolean(el.querySelector('svg,img,[class*="rounded-full"],[class*="rounded-md"]'));
    const role = el.getAttribute('role') || '';
    const hasAriaState =
      el.hasAttribute('aria-checked') || el.hasAttribute('aria-expanded') ||
      el.hasAttribute('aria-pressed') || el.hasAttribute('aria-current') ||
      el.hasAttribute('aria-invalid') || el.hasAttribute('aria-valuenow') ||
      el.hasAttribute('aria-valuetext') || role === 'status' || role === 'alert' ||
      role === 'progressbar' || role === 'meter' || role === 'img';
    let nearText = '';
    let ancestor = el.parentElement;
    for (let depth = 0; ancestor && depth < 3; depth += 1, ancestor = ancestor.parentElement) {
      const text = (ancestor.textContent || '').replace(/\\s+/g, ' ').trim();
      if (text && text !== ownText) { nearText = text; break; }
    }
    if (ownText || name || labelled || hasIcon || hasAriaState || nearText) continue;
    colorOnly.push(describe(el));
  }

  // Forced-colors support is expected to keep the focus ring and the status
  // chips visible; the stylesheet should say so explicitly.
  const sheetText = Array.from(document.styleSheets).reduce((acc, sheet) => {
    try {
      for (const rule of sheet.cssRules) acc += rule.cssText + '\\n';
    } catch { /* cross-origin sheet */ }
    return acc;
  }, '');
  const hasForcedColorsRules = /forced-colors|prefers-contrast|Windows\\s*High\\s*Contrast|high-contrast/.test(sheetText);

  return {
    colorOnly: colorOnly.slice(0, 25),
    colorOnlyCount: colorOnly.length,
    hasForcedColorsRules,
  };
})()`;

export function describeColorOnly(report) {
  return {
    ok: report.colorOnlyCount === 0,
    detail: report.colorOnlyCount
      ? `${report.colorOnlyCount} tone-coloured elements with no text/name/icon e.g. ${report.colorOnly.slice(0, 5).join(", ")}`
      : "",
  };
}
