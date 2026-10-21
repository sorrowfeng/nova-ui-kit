//! Line-level diff between the on-disk file and the planned generated output.
//!
//! The merge/preview UI shows which exact lines are added, removed, or kept
//! (P0-2). Myers' O(ND) algorithm is used so typical generated-file edits stay
//! cheap; absurdly divergent inputs fall back to a positional walk.

use serde::Serialize;

/// Summary counters shown next to each generated file entry.
#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
pub struct LineDiffSummary {
    pub added: usize,
    pub removed: usize,
    pub unchanged: usize,
}

/// One rendered line of the side-by-side / unified diff preview.
#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
pub struct DiffLine {
    /// `"add"` | `"remove"` | `"context"`.
    pub kind: String,
    pub text: String,
    /// 1-based line number in the old file, if this line still exists there.
    pub old_line: Option<usize>,
    /// 1-based line number in the new file, if this line is part of it.
    pub new_line: Option<usize>,
}

/// A full diff result, with counts plus the rows the preview pane renders.
#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
pub struct LineDiff {
    pub summary: LineDiffSummary,
    pub lines: Vec<DiffLine>,
    /// True when `lines` was capped to keep the payload small.
    pub truncated: bool,
}

/// Cap on returned diff rows; the preview only needs a readable window.
pub const MAX_DIFF_LINES: usize = 2000;

/// Myers refuses to build an edit script when the inputs are this far apart;
/// those fall back to the positional walk (still correct, just less pretty).
const MAX_MYERS_DISTANCE: usize = 1500;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Edit {
    Equal(usize, usize),
    Delete(usize),
    Insert(usize),
}

/// Diff two texts line-by-line.
pub fn diff_text(old: &str, new: &str) -> LineDiff {
    let old_lines: Vec<&str> = old.lines().collect();
    let new_lines: Vec<&str> = new.lines().collect();
    let edits = diff_lines(&old_lines, &new_lines);

    let mut added = 0usize;
    let mut removed = 0usize;
    let mut unchanged = 0usize;
    let mut lines: Vec<DiffLine> = Vec::new();
    let mut truncated = false;

    for edit in &edits {
        let (kind, text, old_line, new_line) = match *edit {
            Edit::Equal(o, n) => {
                unchanged += 1;
                ("context", old_lines[o], Some(o + 1), Some(n + 1))
            }
            Edit::Delete(o) => {
                removed += 1;
                ("remove", old_lines[o], Some(o + 1), None)
            }
            Edit::Insert(n) => {
                added += 1;
                ("add", new_lines[n], None, Some(n + 1))
            }
        };
        if lines.len() >= MAX_DIFF_LINES {
            truncated = true;
            // Keep counting so the summary stays accurate even when capped.
            continue;
        }
        lines.push(DiffLine {
            kind: kind.to_string(),
            text: text.to_string(),
            old_line,
            new_line,
        });
    }

    LineDiff {
        summary: LineDiffSummary {
            added,
            removed,
            unchanged,
        },
        lines,
        truncated,
    }
}

/// Summary-only helper (kept for the compact per-entry badge).
pub fn diff_summary(old: &str, new: &str) -> LineDiffSummary {
    diff_text(old, new).summary
}

fn diff_lines(old: &[&str], new: &[&str]) -> Vec<Edit> {
    let mut edits = Vec::new();
    let mut old_start = 0usize;
    let mut new_start = 0usize;
    let mut old_end = old.len();
    let mut new_end = new.len();

    // Trim the common prefix/suffix first: generated files usually share most
    // of their shape, which makes the expensive middle section tiny.
    while old_start < old_end && new_start < new_end && old[old_start] == new[new_start] {
        edits.push(Edit::Equal(old_start, new_start));
        old_start += 1;
        new_start += 1;
    }
    let mut suffix: Vec<Edit> = Vec::new();
    while old_start < old_end && new_start < new_end && old[old_end - 1] == new[new_end - 1] {
        old_end -= 1;
        new_end -= 1;
        suffix.push(Edit::Equal(old_end, new_end));
    }
    suffix.reverse();

    let middle = myers_diff(&old[old_start..old_end], &new[new_start..new_end], old_start, new_start)
        .unwrap_or_else(|| positional_diff(&old[old_start..old_end], &new[new_start..new_end], old_start, new_start));

    edits.extend(middle);
    edits.extend(suffix);
    edits
}

/// Myers O(ND) diff with backtracking. Returns `None` when the edit distance
/// would exceed `MAX_MYERS_DISTANCE`.
fn myers_diff(
    old: &[&str],
    new: &[&str],
    old_offset: usize,
    new_offset: usize,
) -> Option<Vec<Edit>> {
    let n = old.len();
    let m = new.len();
    if n == 0 && m == 0 {
        return Some(Vec::new());
    }
    let max_d = (n + m).min(MAX_MYERS_DISTANCE);
    let width = 2 * max_d + 1;
    let center = max_d as isize;

    // v[k + center] = furthest x reached on diagonal k.
    let mut v = vec![0isize; width];
    let mut trace: Vec<Vec<isize>> = Vec::new();

    let mut found: Option<usize> = None;
    for d in 0..=max_d {
        trace.push(v.clone());
        let mut k = -(d as isize);
        while k <= d as isize {
            let idx = (k + center) as usize;
            let mut x = if k == -(d as isize)
                || (k != d as isize && v[idx - 1] < v[idx + 1])
            {
                v[idx + 1]
            } else {
                v[idx - 1] + 1
            };
            let mut y = x - k;
            while (x as usize) < n && (y as usize) < m && old[x as usize] == new[y as usize] {
                x += 1;
                y += 1;
            }
            v[idx] = x;
            if x as usize >= n && y as usize >= m {
                found = Some(d);
                break;
            }
            k += 2;
        }
        if found.is_some() {
            break;
        }
    }

    let d_final = found?;
    let mut edits: Vec<Edit> = Vec::new();
    let mut x = n as isize;
    let mut y = m as isize;
    let mut d = d_final;
    while d > 0 {
        let v_prev = &trace[d];
        let k = x - y;
        let idx = (k + center) as usize;
        let prev_k = if k == -(d as isize)
            || (k != d as isize && v_prev[idx - 1] < v_prev[idx + 1])
        {
            k + 1
        } else {
            k - 1
        };
        let prev_x = v_prev[(prev_k + center) as usize];
        let prev_y = prev_x - prev_k;

        while x > prev_x && y > prev_y {
            x -= 1;
            y -= 1;
            edits.push(Edit::Equal(
                x as usize + old_offset,
                y as usize + new_offset,
            ));
        }
        if x == prev_x {
            y -= 1;
            edits.push(Edit::Insert(y as usize + new_offset));
        } else {
            x -= 1;
            edits.push(Edit::Delete(x as usize + old_offset));
        }
        d -= 1;
    }
    while x > 0 && y > 0 {
        x -= 1;
        y -= 1;
        edits.push(Edit::Equal(x as usize + old_offset, y as usize + new_offset));
    }
    edits.reverse();
    Some(edits)
}

/// Fallback walk when Myers bails out: pair lines by position.
fn positional_diff(
    old: &[&str],
    new: &[&str],
    old_offset: usize,
    new_offset: usize,
) -> Vec<Edit> {
    let mut edits = Vec::new();
    let max = old.len().max(new.len());
    for i in 0..max {
        match (old.get(i), new.get(i)) {
            (Some(a), Some(b)) if a == b => {
                edits.push(Edit::Equal(i + old_offset, i + new_offset))
            }
            (Some(_), Some(_)) => {
                edits.push(Edit::Delete(i + old_offset));
                edits.push(Edit::Insert(i + new_offset));
            }
            (Some(_), None) => edits.push(Edit::Delete(i + old_offset)),
            (None, Some(_)) => edits.push(Edit::Insert(i + new_offset)),
            (None, None) => {}
        }
    }
    edits
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn identical_text_is_all_context() {
        let diff = diff_text("a\nb\nc\n", "a\nb\nc\n");
        assert_eq!(diff.summary.added, 0);
        assert_eq!(diff.summary.removed, 0);
        assert_eq!(diff.summary.unchanged, 3);
        assert!(diff.lines.iter().all(|line| line.kind == "context"));
    }

    #[test]
    fn added_line_is_marked_with_new_line_number() {
        let diff = diff_text("a\nc\n", "a\nb\nc\n");
        assert_eq!(diff.summary.added, 1);
        assert_eq!(diff.summary.removed, 0);
        assert_eq!(diff.summary.unchanged, 2);
        let added = diff
            .lines
            .iter()
            .find(|line| line.kind == "add")
            .expect("an added line");
        assert_eq!(added.text, "b");
        assert_eq!(added.new_line, Some(2));
        assert_eq!(added.old_line, None);
    }

    #[test]
    fn removed_line_keeps_old_line_number() {
        let diff = diff_text("a\nb\nc\n", "a\nc\n");
        assert_eq!(diff.summary.removed, 1);
        assert_eq!(diff.summary.added, 0);
        let removed = diff
            .lines
            .iter()
            .find(|line| line.kind == "remove")
            .expect("a removed line");
        assert_eq!(removed.text, "b");
        assert_eq!(removed.old_line, Some(2));
        assert_eq!(removed.new_line, None);
    }

    #[test]
    fn replaced_line_is_remove_plus_add() {
        let diff = diff_text("a\nold\nc\n", "a\nnew\nc\n");
        assert_eq!(diff.summary.added, 1);
        assert_eq!(diff.summary.removed, 1);
        assert_eq!(diff.summary.unchanged, 2);
    }

    #[test]
    fn diff_tracks_shifted_block_without_false_changes() {
        // Inserting a header at the top should not mark every later line.
        let old = "one\ntwo\nthree\nfour\nfive\n";
        let new = "zero\none\ntwo\nthree\nfour\nfive\n";
        let diff = diff_text(old, new);
        assert_eq!(diff.summary.added, 1);
        assert_eq!(diff.summary.removed, 0);
        assert_eq!(diff.summary.unchanged, 5);
    }

    #[test]
    fn summary_matches_positional_counts_on_divergent_input() {
        let old = "a\nb\nc\n";
        let new = "x\ny\nz\n";
        let diff = diff_text(old, new);
        assert_eq!(diff.summary.unchanged, 0);
        assert_eq!(diff.summary.added, 3);
        assert_eq!(diff.summary.removed, 3);
    }

    #[test]
    fn preview_is_capped_but_summary_is_full() {
        let old = String::new();
        let new = (0..MAX_DIFF_LINES + 50)
            .map(|i| format!("line {i}"))
            .collect::<Vec<_>>()
            .join("\n");
        let diff = diff_text(&old, &new);
        assert!(diff.truncated);
        assert_eq!(diff.lines.len(), MAX_DIFF_LINES);
        assert_eq!(diff.summary.added, MAX_DIFF_LINES + 50);
    }

    #[test]
    fn empty_to_empty_has_no_lines() {
        let diff = diff_text("", "");
        assert_eq!(diff.summary.added, 0);
        assert_eq!(diff.summary.removed, 0);
        assert_eq!(diff.summary.unchanged, 0);
        assert!(diff.lines.is_empty());
    }
}
