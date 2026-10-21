//! Git conflict marker parsing and per-hunk merge resolution (D2 / P0-1).
//!
//! Conflict markers look like:
//! ```text
//! <<<<<<< HEAD
//! ours line
//! =======
//! theirs line
//! >>>>>>> branch
//! ```
//! Each hunk can be resolved independently as `ours`, `theirs`, or `both`.

use crate::text_utils::to_error;
use serde::Serialize;
use std::path::PathBuf;

#[derive(Serialize, Debug, Clone, PartialEq, Eq)]
pub(super) struct GitConflictHunk {
    pub ours: String,
    pub theirs: String,
    pub start_line: usize,
}

#[derive(Serialize, Debug, Clone, PartialEq, Eq)]
pub(super) struct GitConflictFile {
    pub path: String,
    pub hunks: Vec<GitConflictHunk>,
}

/// A single conflict segment inside a file, plus the untouched lines around it.
#[derive(Debug, Clone, PartialEq, Eq)]
enum ParsedSegment {
    /// Lines outside any conflict block, kept verbatim.
    Context { text: String },
    /// One `<<<<<<< ... >>>>>>>` block split into ours/theirs.
    Conflict {
        ours: String,
        theirs: String,
        start_line: usize,
    },
}

/// How one conflict hunk is merged back into the file.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Resolution {
    Ours,
    Theirs,
    Both,
}

impl Resolution {
    fn parse(value: &str) -> Result<Self, String> {
        match value {
            "ours" => Ok(Self::Ours),
            "theirs" => Ok(Self::Theirs),
            "both" => Ok(Self::Both),
            other => Err(format!(
                "Unknown conflict resolution '{other}' (expected ours / theirs / both)"
            )),
        }
    }

    fn merge(self, ours: &str, theirs: &str) -> String {
        match self {
            Self::Ours => ours.to_string(),
            Self::Theirs => theirs.to_string(),
            Self::Both => format!("{ours}{theirs}"),
        }
    }
}

/// Split `text` into context lines and conflict segments, preserving order.
fn parse_segments(text: &str) -> Result<Vec<ParsedSegment>, String> {
    let mut segments: Vec<ParsedSegment> = Vec::new();
    let mut context = String::new();
    let mut ours = String::new();
    let mut theirs = String::new();
    let mut in_conflict = false;
    let mut in_ours = false;
    let mut in_theirs = false;
    let mut start_line = 0usize;

    for (idx, line) in text.lines().enumerate() {
        let line_no = idx + 1;
        if line.starts_with("<<<<<<<") {
            if in_conflict {
                return Err(format!(
                    "Nested conflict marker at line {line_no}: previous conflict starting at line {start_line} was never closed"
                ));
            }
            if !context.is_empty() {
                segments.push(ParsedSegment::Context {
                    text: std::mem::take(&mut context),
                });
            }
            in_conflict = true;
            in_ours = true;
            in_theirs = false;
            ours.clear();
            theirs.clear();
            start_line = line_no;
        } else if in_conflict && line.starts_with("=======") {
            if !in_ours {
                return Err(format!(
                    "Duplicate '=======' separator at line {line_no} inside conflict starting at line {start_line}"
                ));
            }
            in_ours = false;
            in_theirs = true;
        } else if in_conflict && line.starts_with(">>>>>>>") {
            if !in_theirs {
                return Err(format!(
                    "Conflict at line {start_line} is missing its '=======' separator (found '>>>>>>>' at line {line_no})"
                ));
            }
            segments.push(ParsedSegment::Conflict {
                ours: std::mem::take(&mut ours),
                theirs: std::mem::take(&mut theirs),
                start_line,
            });
            in_conflict = false;
            in_ours = false;
            in_theirs = false;
        } else if in_ours {
            ours.push_str(line);
            ours.push('\n');
        } else if in_theirs {
            theirs.push_str(line);
            theirs.push('\n');
        } else {
            context.push_str(line);
            context.push('\n');
        }
    }

    if in_conflict {
        return Err(format!(
            "Unterminated conflict starting at line {start_line}: missing '>>>>>>>' marker"
        ));
    }
    if !context.is_empty() {
        segments.push(ParsedSegment::Context { text: context });
    }
    Ok(segments)
}

/// Merge conflict markers out of `text`, one resolution per conflict hunk.
///
/// `resolutions` may be shorter than the hunk count — missing entries default
/// to `ours` so a partially answered dialog still produces a valid file.
pub(super) fn merge_conflict_text(
    text: &str,
    resolutions: &[String],
) -> Result<String, String> {
    let segments = parse_segments(text)?;
    let mut parsed: Vec<Resolution> = Vec::with_capacity(resolutions.len());
    for value in resolutions {
        parsed.push(Resolution::parse(value)?);
    }

    let mut out = String::new();
    let mut hunk_index = 0usize;
    for segment in &segments {
        match segment {
            ParsedSegment::Context { text } => out.push_str(text),
            ParsedSegment::Conflict { ours, theirs, .. } => {
                let resolution = parsed.get(hunk_index).copied().unwrap_or(Resolution::Ours);
                out.push_str(&resolution.merge(ours, theirs));
                hunk_index += 1;
            }
        }
    }
    Ok(out)
}

/// Collect the per-hunk detail shown in the merge editor.
pub(super) fn conflict_hunks(text: &str) -> Result<Vec<GitConflictHunk>, String> {
    let segments = parse_segments(text)?;
    Ok(segments
        .into_iter()
        .filter_map(|segment| match segment {
            ParsedSegment::Conflict {
                ours,
                theirs,
                start_line,
            } => Some(GitConflictHunk {
                ours,
                theirs,
                start_line,
            }),
            ParsedSegment::Context { .. } => None,
        })
        .collect())
}

/// Read conflict markers (<<<<<<< / ======= / >>>>>>>) from a file.
#[tauri::command]
pub(super) fn read_git_conflict(
    root_path: String,
    file_path: String,
) -> Result<GitConflictFile, String> {
    let full = PathBuf::from(&root_path).join(&file_path);
    let text = std::fs::read_to_string(&full).map_err(to_error)?;
    Ok(GitConflictFile {
        path: file_path,
        hunks: conflict_hunks(&text)?,
    })
}

/// Resolve a conflicted file with one resolution per hunk, then write it back.
#[tauri::command]
pub(super) fn resolve_git_conflict(
    root_path: String,
    file_path: String,
    resolutions: Vec<String>,
) -> Result<String, String> {
    let full = PathBuf::from(&root_path).join(&file_path);
    let text = std::fs::read_to_string(&full).map_err(to_error)?;
    let merged = merge_conflict_text(&text, &resolutions)?;
    std::fs::write(&full, merged).map_err(to_error)?;
    Ok(file_path)
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = "start\n\
<<<<<<< HEAD\n\
ours-a\n\
=======\n\
theirs-a\n\
>>>>>>> branch\n\
middle\n\
<<<<<<< HEAD\n\
ours-b1\n\
ours-b2\n\
=======\n\
theirs-b\n\
>>>>>>> branch\n\
end\n";

    #[test]
    fn parse_reads_every_hunk_with_start_line() {
        let hunks = conflict_hunks(SAMPLE).expect("sample parses");
        assert_eq!(hunks.len(), 2);
        assert_eq!(hunks[0].start_line, 2);
        assert_eq!(hunks[0].ours, "ours-a\n");
        assert_eq!(hunks[0].theirs, "theirs-a\n");
        assert_eq!(hunks[1].start_line, 8);
        assert_eq!(hunks[1].ours, "ours-b1\nours-b2\n");
        assert_eq!(hunks[1].theirs, "theirs-b\n");
    }

    #[test]
    fn per_hunk_resolutions_combine_independently() {
        let merged = merge_conflict_text(
            SAMPLE,
            &["ours".to_string(), "theirs".to_string()],
        )
        .expect("merge");
        assert_eq!(
            merged,
            "start\nours-a\nmiddle\ntheirs-b\nend\n"
        );
    }

    #[test]
    fn both_resolution_concatenates_ours_then_theirs() {
        let merged = merge_conflict_text(SAMPLE, &["both".to_string(), "both".to_string()])
            .expect("merge");
        assert_eq!(
            merged,
            "start\nours-a\ntheirs-a\nmiddle\nours-b1\nours-b2\ntheirs-b\nend\n"
        );
    }

    #[test]
    fn missing_resolutions_default_to_ours() {
        let merged = merge_conflict_text(SAMPLE, &[]).expect("merge");
        assert_eq!(merged, "start\nours-a\nmiddle\nours-b1\nours-b2\nend\n");
    }

    #[test]
    fn clean_text_passes_through() {
        let clean = "alpha\nbeta\n";
        assert_eq!(
            merge_conflict_text(clean, &[]).expect("merge"),
            clean.to_string()
        );
    }

    #[test]
    fn unknown_resolution_is_rejected() {
        let err = merge_conflict_text(SAMPLE, &["mine".to_string()]).unwrap_err();
        assert!(err.contains("mine"), "unexpected error: {err}");
    }

    #[test]
    fn unterminated_conflict_is_rejected() {
        let broken = "<<<<<<< HEAD\nours\n=======\ntheirs\n";
        let err = merge_conflict_text(broken, &[]).unwrap_err();
        assert!(err.contains("Unterminated"), "unexpected error: {err}");
    }

    #[test]
    fn resolve_round_trips_through_disk() {
        let dir = std::env::temp_dir().join(format!(
            "nova-conflict-roundtrip-{}",
            std::process::id()
        ));
        std::fs::create_dir_all(&dir).expect("temp dir");
        let file = "mod.rs";
        std::fs::write(dir.join(file), SAMPLE).expect("write sample");

        let read = read_git_conflict(dir.display().to_string(), file.to_string()).expect("read");
        assert_eq!(read.hunks.len(), 2);

        resolve_git_conflict(
            dir.display().to_string(),
            file.to_string(),
            vec!["theirs".into(), "ours".into()],
        )
        .expect("resolve");

        let merged = std::fs::read_to_string(dir.join(file)).expect("read back");
        assert_eq!(merged, "start\ntheirs-a\nmiddle\nours-b1\nours-b2\nend\n");
        assert!(conflict_hunks(&merged).expect("reparse").is_empty());
        let _ = std::fs::remove_dir_all(&dir);
    }

    /// End-to-end against a real `git` conflict (P0-4): create a repo, fork a
    /// branch, touch the same line on both sides, merge, and resolve per-hunk.
    #[test]
    fn real_git_conflict_resolves_per_hunk() {
        if std::process::Command::new("git")
            .arg("--version")
            .output()
            .map(|out| !out.status.success())
            .unwrap_or(true)
        {
            eprintln!("skipping real_git_conflict_resolves_per_hunk: git not available");
            return;
        }

        let dir = std::env::temp_dir().join(format!(
            "nova-git-conflict-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos())
                .unwrap_or(0)
        ));
        std::fs::create_dir_all(&dir).expect("temp repo");
        let git = |args: &[&str]| {
            let out = std::process::Command::new("git")
                .args(args)
                .current_dir(&dir)
                .env("GIT_AUTHOR_NAME", "Nova Test")
                .env("GIT_AUTHOR_EMAIL", "nova@test.local")
                .env("GIT_COMMITTER_NAME", "Nova Test")
                .env("GIT_COMMITTER_EMAIL", "nova@test.local")
                .output()
                .expect("git runs");
            assert!(
                out.status.success(),
                "git {} failed: {}",
                args.join(" "),
                String::from_utf8_lossy(&out.stderr)
            );
        };

        git(&["init", "-b", "main"]);
        git(&["config", "user.name", "Nova Test"]);
        git(&["config", "user.email", "nova@test.local"]);
        git(&["config", "commit.gpgsign", "false"]);
        let file = dir.join("settings.txt");
        std::fs::write(&file, "keep\nshared\nkeep\n").expect("seed file");
        git(&["add", "-A"]);
        git(&["commit", "-m", "seed"]);

        git(&["checkout", "-b", "feature"]);
        std::fs::write(&file, "keep\nshared-theirs\nkeep\n").expect("theirs edit");
        git(&["add", "-A"]);
        git(&["commit", "-m", "theirs edit"]);

        git(&["checkout", "main"]);
        std::fs::write(&file, "keep\nshared-ours\nkeep\n").expect("ours edit");
        git(&["add", "-A"]);
        git(&["commit", "-m", "ours edit"]);

        let merge = std::process::Command::new("git")
            .args(["merge", "feature"])
            .current_dir(&dir)
            .output()
            .expect("git merge runs");
        assert!(
            !merge.status.success(),
            "expected a conflict, merge unexpectedly succeeded"
        );

        let root = dir.display().to_string();
        let read = read_git_conflict(root.clone(), "settings.txt".into()).expect("read conflict");
        assert_eq!(read.hunks.len(), 1, "expected one conflicted hunk");
        assert_eq!(read.hunks[0].ours, "shared-ours\n");
        assert_eq!(read.hunks[0].theirs, "shared-theirs\n");

        resolve_git_conflict(root.clone(), "settings.txt".into(), vec!["theirs".into()])
            .expect("resolve");
        let resolved = std::fs::read_to_string(&file).expect("read resolved");
        assert_eq!(resolved, "keep\nshared-theirs\nkeep\n");
        assert!(!resolved.contains("<<<<<<<"));
        assert!(!resolved.contains(">>>>>>>"));

        let _ = std::fs::remove_dir_all(&dir);
    }
}
