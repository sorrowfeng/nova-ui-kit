use crate::incremental_io::files_have_same_content;
use serde::Serialize;
use std::{fs, path::Path, path::PathBuf};

#[derive(Serialize)]
pub struct GeneratedFilePreviewResult {
    pub root_path: String,
    pub summary: String,
    pub total_count: usize,
    pub changed_count: usize,
    pub created_count: usize,
    pub updated_count: usize,
    pub unchanged_count: usize,
    pub asset_count: usize,
    pub entries: Vec<GeneratedFilePreviewEntry>,
}

#[derive(Serialize, Clone)]
pub struct GeneratedFileChangeSummary {
    pub summary: String,
    pub total_count: usize,
    pub changed_count: usize,
    pub created_count: usize,
    pub updated_count: usize,
    pub unchanged_count: usize,
    pub asset_count: usize,
}

#[derive(Serialize)]
pub struct ApplyGeneratedFilesResult {
    pub root_path: String,
    pub checkpoint_path: String,
    pub requested_count: usize,
    pub applied_count: usize,
    pub skipped_count: usize,
    pub summary: String,
    pub entries: Vec<ApplyGeneratedFileEntry>,
}

#[derive(Serialize)]
pub struct ApplyGeneratedFileEntry {
    pub path: String,
    pub relative_path: String,
    pub kind: String,
    pub status: String,
    pub applied: bool,
    pub summary: String,
}

#[derive(Serialize)]
pub struct GeneratedFilePreviewEntry {
    pub path: String,
    pub relative_path: String,
    pub kind: String,
    pub status: String,
    pub changed: bool,
    pub exists: bool,
    pub size_bytes: usize,
    pub line_count: usize,
    pub preview: String,
    pub summary: String,
}

pub struct PlannedGeneratedFile {
    pub relative_path: String,
    pub kind: String,
    pub content: Option<String>,
    pub copy_source: Option<PathBuf>,
    pub summary: String,
}

pub fn summarize_generated_file_entries(
    entries: &[GeneratedFilePreviewEntry],
) -> GeneratedFileChangeSummary {
    let total_count = entries.len();
    let created_count = entries
        .iter()
        .filter(|entry| entry.status == "create" || entry.status == "copy")
        .count();
    let updated_count = entries
        .iter()
        .filter(|entry| entry.status == "update")
        .count();
    let unchanged_count = entries
        .iter()
        .filter(|entry| entry.status == "unchanged" || entry.status == "managed")
        .count();
    let asset_count = entries
        .iter()
        .filter(|entry| entry.kind == "asset" || entry.kind == "icon")
        .count();
    let changed_count = entries.iter().filter(|entry| entry.changed).count();
    let summary = format!(
        "{total_count} generated targets - {created_count} create/copy - {updated_count} update - {unchanged_count} unchanged - {asset_count} asset/icon copies"
    );
    GeneratedFileChangeSummary {
        summary,
        total_count,
        changed_count,
        created_count,
        updated_count,
        unchanged_count,
        asset_count,
    }
}

pub fn push_planned_text_file(
    files: &mut Vec<PlannedGeneratedFile>,
    relative_path: String,
    kind: &str,
    content: String,
    summary: String,
) {
    files.push(PlannedGeneratedFile {
        relative_path: normalize_preview_relative_path(&relative_path),
        kind: kind.to_string(),
        content: Some(content),
        copy_source: None,
        summary,
    });
}

pub fn push_planned_copy_file(
    files: &mut Vec<PlannedGeneratedFile>,
    relative_path: String,
    kind: &str,
    copy_source: Option<PathBuf>,
    summary: String,
) {
    files.push(PlannedGeneratedFile {
        relative_path: normalize_preview_relative_path(&relative_path),
        kind: kind.to_string(),
        content: None,
        copy_source,
        summary,
    });
}

pub fn normalize_preview_relative_path(path: &str) -> String {
    path.replace('\\', "/")
}

pub fn preview_text(value: &str) -> String {
    const LIMIT: usize = 4000;
    if value.len() <= LIMIT {
        value.to_string()
    } else {
        format!("{}... [preview truncated]", &value[..LIMIT])
    }
}

pub fn generated_file_preview_entry(
    root: &Path,
    planned: PlannedGeneratedFile,
) -> Result<GeneratedFilePreviewEntry, String> {
    let path = root.join(&planned.relative_path);
    let exists = path.exists();
    let (status, changed, size_bytes, line_count, preview) =
        if let Some(content) = planned.content.as_deref() {
            let next_bytes = content.as_bytes();
            let changed = if exists {
                fs::read(&path)
                    .map(|current| current != next_bytes)
                    .unwrap_or(true)
            } else {
                true
            };
            let status = if !exists {
                "create"
            } else if changed {
                "update"
            } else {
                "unchanged"
            };
            (
                status.to_string(),
                changed,
                next_bytes.len(),
                text_line_count(content),
                preview_text(content),
            )
        } else {
            let changed = if !exists {
                true
            } else if let Some(source) = planned
                .copy_source
                .as_ref()
                .filter(|source| source.is_file())
            {
                !files_have_same_content(source, &path).unwrap_or(false)
            } else {
                false
            };
            let status = if !exists {
                "copy"
            } else if changed {
                "update"
            } else {
                "unchanged"
            };
            let preview = planned
                .copy_source
                .as_ref()
                .map(|source| format!("{}\nSource: {}", planned.summary, source.display()))
                .unwrap_or_else(|| planned.summary.clone());
            (status.to_string(), changed, 0, 0, preview)
        };

    Ok(GeneratedFilePreviewEntry {
        path: path.display().to_string(),
        relative_path: planned.relative_path,
        kind: planned.kind,
        status,
        changed,
        exists,
        size_bytes,
        line_count,
        preview,
        summary: planned.summary,
    })
}

fn text_line_count(value: &str) -> usize {
    if value.is_empty() {
        1
    } else {
        value.lines().count().max(1)
    }
}
