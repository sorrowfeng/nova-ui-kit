use crate::{
    managed_project_root, project_name, project_paths_for_project, run_process, save_project_files,
    to_error, BreakpointValidationIssue, ValidationResult,
};
use serde_json::Value;
use std::{
    fs,
    path::{Path, PathBuf},
};

fn html_escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

pub(super) fn read_json_file(path: &Path) -> Option<Value> {
    fs::read_to_string(path)
        .ok()
        .and_then(|content| serde_json::from_str(&content).ok())
}

pub(super) fn breakpoint_validation_issues(
    project: &Value,
    validation: Option<&Value>,
) -> Vec<BreakpointValidationIssue> {
    let Some(validation) = validation else {
        return Vec::new();
    };
    let file = first_generated_file(project);
    let file_id = file.map(|value| value_string(value, "id")).unwrap_or("");
    let file_name = file.map(|value| value_string(value, "name")).unwrap_or("");
    validation
        .get("breakpoints")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .flat_map(|breakpoint| {
            let breakpoint_id = breakpoint
                .get("id")
                .and_then(Value::as_str)
                .unwrap_or("desktop")
                .to_string();
            breakpoint
                .get("runtimeAudit")
                .and_then(|audit| audit.get("issues"))
                .and_then(Value::as_array)
                .into_iter()
                .flatten()
                .enumerate()
                .map(move |(index, issue)| {
                    let item_id = issue
                        .get("itemId")
                        .and_then(Value::as_str)
                        .filter(|value| !value.is_empty())
                        .map(ToOwned::to_owned);
                    let item_name = issue
                        .get("itemName")
                        .and_then(Value::as_str)
                        .filter(|value| !value.is_empty())
                        .map(ToOwned::to_owned);
                    let item_type = issue
                        .get("itemType")
                        .and_then(Value::as_str)
                        .filter(|value| !value.is_empty())
                        .map(ToOwned::to_owned);
                    BreakpointValidationIssue {
                        id: format!(
                            "{}-{}-{}",
                            breakpoint_id,
                            item_id.as_deref().unwrap_or("window"),
                            index
                        ),
                        breakpoint: breakpoint_id.clone(),
                        severity: issue
                            .get("severity")
                            .and_then(Value::as_str)
                            .unwrap_or("warning")
                            .to_string(),
                        title: issue
                            .get("title")
                            .and_then(Value::as_str)
                            .unwrap_or("Breakpoint runtime issue")
                            .to_string(),
                        detail: issue
                            .get("detail")
                            .and_then(Value::as_str)
                            .unwrap_or("No detail provided.")
                            .to_string(),
                        file_id: file_id.to_string(),
                        file_name: file_name.to_string(),
                        item_id,
                        item_name,
                        item_type,
                    }
                })
        })
        .collect()
}

fn value_string<'a>(value: &'a Value, key: &str) -> &'a str {
    value.get(key).and_then(Value::as_str).unwrap_or("")
}

fn value_number(value: &Value, key: &str, fallback: f64) -> f64 {
    value.get(key).and_then(Value::as_f64).unwrap_or(fallback)
}

fn item_label(item: &Value) -> String {
    let props = item.get("props").unwrap_or(&Value::Null);
    [
        value_string(props, "title"),
        value_string(props, "label"),
        value_string(props, "value"),
        value_string(item, "name"),
        value_string(item, "type"),
    ]
    .into_iter()
    .find(|value| !value.trim().is_empty())
    .unwrap_or("Control")
    .to_string()
}

fn absolute_item_position(item: &Value, items: &[Value]) -> (f64, f64) {
    let mut x = value_number(item, "x", 0.0);
    let mut y = value_number(item, "y", 0.0);
    let mut parent_id = value_string(item, "parentId").to_string();
    let mut visited = Vec::new();

    while !parent_id.is_empty() && !visited.iter().any(|id| id == &parent_id) {
        visited.push(parent_id.clone());
        let Some(parent) = items
            .iter()
            .find(|candidate| value_string(candidate, "id") == parent_id)
        else {
            break;
        };
        x += value_number(parent, "x", 0.0);
        y += value_number(parent, "y", 0.0);
        parent_id = value_string(parent, "parentId").to_string();
    }

    (x, y)
}

fn first_generated_file(project: &Value) -> Option<&Value> {
    let files = project.get("files").and_then(Value::as_array)?;
    let active_file_id = value_string(project, "activeFileId");
    files
        .iter()
        .find(|file| !active_file_id.is_empty() && value_string(file, "id") == active_file_id)
        .or_else(|| files.first())
}

fn svg_item_fill(item_type: &str) -> (&'static str, &'static str) {
    match item_type {
        "frame" => ("#f7f2fa", "#6750a4"),
        "button" => ("#6750a4", "#6750a4"),
        "image" => ("#e7e0ec", "#79747e"),
        "input" | "textarea" | "plain-text-edit" | "rich-text-editor" | "search-bar" | "select"
        | "combobox" | "date-picker" | "time-picker" | "calendar-widget" | "radio" | "slider"
        | "range-slider" | "segmented" | "chips" => ("#ffffff", "#79747e"),
        "checkbox" | "switch" | "tabs" | "menu" | "tooltip" | "banner" | "stepper" => {
            ("#f3edf7", "#79747e")
        }
        "table" | "card" | "empty-state" | "stat" | "progress" | "list" | "tree-view"
        | "toolbar" | "top-app-bar" | "bottom-app-bar" | "navigation" | "navigation-drawer"
        | "navigation-rail" | "side-sheet" | "dialog" | "avatar" | "snackbar" | "fab" => {
            ("#fffbfe", "#cac4d0")
        }
        "heading" | "label" | "link-label" | "text-browser" => ("#fffbfe", "#fffbfe"),
        _ => ("#fef7ff", "#cac4d0"),
    }
}

pub(super) fn generated_window_snapshot_svg(project: &Value) -> String {
    let Some(file) = first_generated_file(project) else {
        return r##"<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><rect width="960" height="540" fill="#fffbfe"/><text x="48" y="80" fill="#49454f" font-family="Inter, Segoe UI, sans-serif" font-size="28">No UI files</text></svg>"##.to_string();
    };
    let page = file.get("page").unwrap_or(&Value::Null);
    let page_width = value_number(page, "width", 960.0).max(320.0);
    let page_height = value_number(page, "height", 540.0).max(240.0);
    let titlebar_style = value_string(page, "titlebarStyle");
    let window_kind = value_string(page, "windowKind");
    let titlebar_height = match titlebar_style.as_ref() {
        "hidden" => 0.0,
        "native" => 32.0,
        _ => 40.0,
    };
    let items = file
        .get("items")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let mut svg = String::new();
    svg.push_str(&format!(
        r##"<svg xmlns="http://www.w3.org/2000/svg" width="{page_width:.0}" height="{page_height:.0}" viewBox="0 0 {page_width:.0} {page_height:.0}">
<rect width="100%" height="100%" rx="18" fill="#fffbfe"/>
<rect x="0.5" y="0.5" width="{w:.0}" height="{h:.0}" rx="18" fill="none" stroke="#cac4d0" stroke-width="1"/>
"##,
        w = page_width - 1.0,
        h = page_height - 1.0
    ));

    if titlebar_height > 0.0 {
        let chrome_label = if titlebar_style == "native" {
            format!("native titlebar · {window_kind}")
        } else {
            format!("nova titlebar · {window_kind}")
        };
        svg.push_str(&format!(
            r##"<g data-titlebar-style="{titlebar_style}" data-window-kind="{window_kind}">
  <rect x="1" y="1" width="{bar_w:.0}" height="{titlebar_height:.0}" rx="17" fill="#f3edf7"/>
  <text x="18" y="{label_y:.0}" fill="#49454f" font-family="Inter, Segoe UI, sans-serif" font-size="12" font-weight="600">{chrome_label}</text>
</g>
"##,
            bar_w = page_width - 2.0,
            label_y = titlebar_height * 0.62,
        ));
    }

    for item in &items {
        let item_type = value_string(item, "type");
        let (fill, stroke) = svg_item_fill(item_type);
        let (x, mut y) = absolute_item_position(item, &items);
        y += titlebar_height;
        let width = value_number(item, "width", 120.0).max(8.0);
        let height = value_number(item, "height", 48.0).max(8.0);
        let label = html_escape(&item_label(item));
        let text_fill = if item_type == "button" {
            "#ffffff"
        } else {
            "#1d1b20"
        };
        svg.push_str(&format!(
            r##"<g>
  <rect x="{x:.1}" y="{y:.1}" width="{width:.1}" height="{height:.1}" rx="10" fill="{fill}" stroke="{stroke}" stroke-width="1"/>
  <text x="{text_x:.1}" y="{text_y:.1}" fill="{text_fill}" font-family="Inter, Segoe UI, sans-serif" font-size="13" font-weight="600">{label}</text>
</g>
"##,
            text_x = x + 12.0,
            text_y = y + (height / 2.0).max(18.0),
        ));
    }

    svg.push_str("</svg>\n");
    svg
}

pub(super) fn generated_window_validation_report(
    project: &Value,
    log: &str,
    snapshot_path: &Path,
    screenshot_path: Option<&str>,
    screenshot_analysis_path: Option<&str>,
    screenshot_analysis: Option<&Value>,
    runtime_audit_path: Option<&str>,
    runtime_audit: Option<&Value>,
    breakpoint_validation_path: Option<&str>,
    breakpoint_validation: Option<&Value>,
) -> String {
    let safe_project_name = html_escape(&project_name(project));
    let file_name = first_generated_file(project)
        .map(|file| html_escape(value_string(file, "name")))
        .unwrap_or_else(|| "No UI file".to_string());
    let file_count = project
        .get("files")
        .and_then(Value::as_array)
        .map(Vec::len)
        .unwrap_or_default();
    let item_count = project
        .get("files")
        .and_then(Value::as_array)
        .map(|files| {
            files
                .iter()
                .map(|file| {
                    file.get("items")
                        .and_then(Value::as_array)
                        .map(Vec::len)
                        .unwrap_or_default()
                })
                .sum::<usize>()
        })
        .unwrap_or_default();
    let command_count = project
        .get("rustCommands")
        .and_then(Value::as_array)
        .map(Vec::len)
        .unwrap_or_default();
    let snapshot_name = snapshot_path
        .file_name()
        .map(|value| html_escape(&value.to_string_lossy()))
        .unwrap_or_else(|| "generated-window-snapshot.svg".to_string());
    let screenshot_section = screenshot_path
        .and_then(|value| Path::new(value).file_name())
        .map(|value| {
            let screenshot_name = html_escape(&value.to_string_lossy());
            format!(
                r#"<h2>Runtime screenshot</h2>
      <img src="{screenshot_name}" alt="Generated window runtime screenshot" />
"#
            )
        })
        .unwrap_or_else(|| {
            "<h2>Runtime screenshot</h2><p>Browser screenshot was unavailable on this machine. The generated SVG snapshot is still available below.</p>".to_string()
        });
    let screenshot_analysis_section = screenshot_analysis
        .map(|analysis| {
            let status = analysis
                .get("status")
                .and_then(Value::as_str)
                .unwrap_or("unknown");
            let captured_width = analysis
                .get("capturedSize")
                .and_then(|value| value.get("width"))
                .and_then(Value::as_i64)
                .unwrap_or_default();
            let captured_height = analysis
                .get("capturedSize")
                .and_then(|value| value.get("height"))
                .and_then(Value::as_i64)
                .unwrap_or_default();
            let unique_color_bins = analysis
                .get("uniqueColorBins")
                .and_then(Value::as_i64)
                .unwrap_or_default();
            let content_ratio = analysis
                .get("contentRatio")
                .and_then(Value::as_f64)
                .unwrap_or_default()
                * 100.0;
            let is_blank = analysis
                .get("isLikelyBlank")
                .and_then(Value::as_bool)
                .unwrap_or(false);
            let analysis_name = screenshot_analysis_path
                .and_then(|value| Path::new(value).file_name())
                .map(|value| html_escape(&value.to_string_lossy()))
                .unwrap_or_else(|| "generated-window-screenshot-analysis.json".to_string());
            let issues = analysis
                .get("issues")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();
            let issue_items = if issues.is_empty() {
                "<p class=\"ok\">No machine-detected screenshot issues.</p>".to_string()
            } else {
                let items = issues
                    .iter()
                    .map(|issue| {
                        let severity = issue
                            .get("severity")
                            .and_then(Value::as_str)
                            .unwrap_or("warning");
                        let title = html_escape(
                            issue
                                .get("title")
                                .and_then(Value::as_str)
                                .unwrap_or("Screenshot issue"),
                        );
                        let detail = html_escape(
                            issue
                                .get("detail")
                                .and_then(Value::as_str)
                                .unwrap_or("No detail provided."),
                        );
                        format!(
                            r#"<li><strong>{severity}</strong><span>{title}</span><p>{detail}</p></li>"#,
                            severity = html_escape(severity)
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("");
                format!(r#"<ul class="issues">{items}</ul>"#)
            };
            format!(
                r#"<h2>Machine screenshot analysis</h2>
      <p class="artifact">Analysis JSON: {analysis_name}</p>
      <div class="grid">
        <div class="metric"><strong>{status}</strong><span>Status</span></div>
        <div class="metric"><strong>{captured_width} x {captured_height}</strong><span>Captured size</span></div>
        <div class="metric"><strong>{content_ratio:.1}%</strong><span>Content coverage</span></div>
        <div class="metric"><strong>{unique_color_bins}</strong><span>Color bins</span></div>
        <div class="metric"><strong>{is_blank}</strong><span>Likely blank</span></div>
      </div>
      {issue_items}
"#,
                status = html_escape(status),
            )
        })
        .unwrap_or_else(|| {
            "<h2>Machine screenshot analysis</h2><p>Pixel analysis was unavailable because no runtime screenshot was captured.</p>".to_string()
        });
    let runtime_audit_section = runtime_audit
        .map(|audit| {
            let status = audit
                .get("status")
                .and_then(Value::as_str)
                .unwrap_or("unknown");
            let breakpoint = audit
                .get("breakpoint")
                .and_then(Value::as_str)
                .unwrap_or("unknown");
            let expected_control_count = audit
                .get("expectedControlCount")
                .and_then(Value::as_i64)
                .unwrap_or_default();
            let rendered_control_count = audit
                .get("renderedControlCount")
                .and_then(Value::as_i64)
                .unwrap_or_default();
            let visible_control_count = audit
                .get("visibleControlCount")
                .and_then(Value::as_i64)
                .unwrap_or_default();
            let bound_event_control_count = audit
                .get("boundEventControlCount")
                .and_then(Value::as_i64)
                .unwrap_or_default();
            let audit_name = runtime_audit_path
                .and_then(|value| Path::new(value).file_name())
                .map(|value| html_escape(&value.to_string_lossy()))
                .unwrap_or_else(|| "generated-window-runtime-audit.json".to_string());
            let issues = audit
                .get("issues")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();
            let issue_items = if issues.is_empty() {
                "<p class=\"ok\">No DOM runtime audit issues.</p>".to_string()
            } else {
                let items = issues
                    .iter()
                    .map(|issue| {
                        let severity = issue
                            .get("severity")
                            .and_then(Value::as_str)
                            .unwrap_or("warning");
                        let title = html_escape(
                            issue
                                .get("title")
                                .and_then(Value::as_str)
                                .unwrap_or("Runtime audit issue"),
                        );
                        let detail = html_escape(
                            issue
                                .get("detail")
                                .and_then(Value::as_str)
                                .unwrap_or("No detail provided."),
                        );
                        let item_label = [
                            issue.get("itemName").and_then(Value::as_str).unwrap_or(""),
                            issue.get("itemType").and_then(Value::as_str).unwrap_or(""),
                            issue.get("itemId").and_then(Value::as_str).unwrap_or(""),
                        ]
                        .into_iter()
                        .filter(|value| !value.is_empty())
                        .collect::<Vec<_>>()
                        .join(" / ");
                        format!(
                            r#"<li><strong>{severity}</strong><span>{title}</span><p>{detail}</p><p class="artifact">{item_label}</p></li>"#,
                            severity = html_escape(severity),
                            item_label = html_escape(&item_label)
                        )
                    })
                    .collect::<Vec<_>>()
                    .join("");
                format!(r#"<ul class="issues">{items}</ul>"#)
            };
            format!(
                r#"<h2>DOM runtime audit</h2>
      <p class="artifact">Runtime audit JSON: {audit_name}</p>
      <div class="grid">
        <div class="metric"><strong>{status}</strong><span>Status</span></div>
        <div class="metric"><strong>{breakpoint}</strong><span>Breakpoint</span></div>
        <div class="metric"><strong>{rendered_control_count} / {expected_control_count}</strong><span>Rendered controls</span></div>
        <div class="metric"><strong>{visible_control_count}</strong><span>Visible controls</span></div>
        <div class="metric"><strong>{bound_event_control_count}</strong><span>Bound event controls</span></div>
      </div>
      {issue_items}
"#,
                status = html_escape(status),
                breakpoint = html_escape(breakpoint),
            )
        })
        .unwrap_or_else(|| {
            "<h2>DOM runtime audit</h2><p>DOM runtime audit was unavailable because no browser runtime session completed.</p>".to_string()
        });
    let breakpoint_validation_section = breakpoint_validation
        .map(|validation| {
            let status = validation
                .get("status")
                .and_then(Value::as_str)
                .unwrap_or("unknown");
            let error_count = validation
                .get("errorCount")
                .and_then(Value::as_i64)
                .unwrap_or_default();
            let warning_count = validation
                .get("warningCount")
                .and_then(Value::as_i64)
                .unwrap_or_default();
            let validation_name = breakpoint_validation_path
                .and_then(|value| Path::new(value).file_name())
                .map(|value| html_escape(&value.to_string_lossy()))
                .unwrap_or_else(|| "generated-window-breakpoint-validation.json".to_string());
            let breakpoints = validation
                .get("breakpoints")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();
            let rows = breakpoints
                .iter()
                .map(|entry| {
                    let id = html_escape(entry.get("id").and_then(Value::as_str).unwrap_or("breakpoint"));
                    let viewport_width = entry
                        .get("viewport")
                        .and_then(|value| value.get("width"))
                        .and_then(Value::as_i64)
                        .unwrap_or_default();
                    let viewport_height = entry
                        .get("viewport")
                        .and_then(|value| value.get("height"))
                        .and_then(Value::as_i64)
                        .unwrap_or_default();
                    let analysis_status = html_escape(
                        entry
                            .get("analysis")
                            .and_then(|value| value.get("status"))
                            .and_then(Value::as_str)
                            .unwrap_or("unknown"),
                    );
                    let audit_status = html_escape(
                        entry
                            .get("runtimeAudit")
                            .and_then(|value| value.get("status"))
                            .and_then(Value::as_str)
                            .unwrap_or("unknown"),
                    );
                    let rendered = entry
                        .get("runtimeAudit")
                        .and_then(|value| value.get("renderedControlCount"))
                        .and_then(Value::as_i64)
                        .unwrap_or_default();
                    let screenshot = html_escape(entry.get("screenshotPath").and_then(Value::as_str).unwrap_or(""));
                    let analysis = html_escape(entry.get("screenshotAnalysisPath").and_then(Value::as_str).unwrap_or(""));
                    let audit = html_escape(entry.get("runtimeAuditPath").and_then(Value::as_str).unwrap_or(""));
                    format!(
                        r#"<tr><td>{id}</td><td>{viewport_width} x {viewport_height}</td><td>{analysis_status}</td><td>{audit_status}</td><td>{rendered}</td><td><span>{screenshot}</span><span>{analysis}</span><span>{audit}</span></td></tr>"#
                    )
                })
                .collect::<Vec<_>>()
                .join("");
            format!(
                r#"<h2>Breakpoint runtime validation</h2>
      <p class="artifact">Breakpoint summary JSON: {validation_name}</p>
      <div class="grid">
        <div class="metric"><strong>{status}</strong><span>Status</span></div>
        <div class="metric"><strong>{breakpoint_count}</strong><span>Breakpoints</span></div>
        <div class="metric"><strong>{error_count}</strong><span>Errors</span></div>
        <div class="metric"><strong>{warning_count}</strong><span>Warnings</span></div>
      </div>
      <table class="breakpoints"><thead><tr><th>Breakpoint</th><th>Viewport</th><th>Screenshot</th><th>DOM</th><th>Controls</th><th>Artifacts</th></tr></thead><tbody>{rows}</tbody></table>
"#,
                status = html_escape(status),
                breakpoint_count = breakpoints.len(),
            )
        })
        .unwrap_or_else(|| {
            "<h2>Breakpoint runtime validation</h2><p>Breakpoint validation was unavailable because no browser runtime session completed.</p>".to_string()
        });

    format!(
        r#"<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nova Generated Window Validation</title>
  <style>
    :root {{ color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }}
    body {{ margin: 0; background: #f7f2fa; color: #1d1b20; }}
    main {{ max-width: 1120px; margin: 0 auto; padding: 32px; }}
    .panel {{ border: 1px solid #cac4d0; border-radius: 22px; background: #fffbfe; padding: 20px; box-shadow: 0 18px 48px rgba(29, 27, 32, 0.08); }}
    .grid {{ display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 16px 0; }}
    .metric {{ border: 1px solid #e7e0ec; border-radius: 16px; padding: 14px; background: #fef7ff; }}
    .metric strong {{ display: block; font-size: 24px; }}
    .artifact {{ word-break: break-all; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; color: #625b71; }}
    .ok {{ border: 1px solid #d6e7d6; border-radius: 16px; background: #f6fff6; padding: 12px; color: #2d6a35; }}
    .issues {{ list-style: none; margin: 16px 0; padding: 0; display: grid; gap: 10px; }}
    .issues li {{ border: 1px solid #e7e0ec; border-radius: 16px; background: #fffbfe; padding: 12px; }}
    .issues strong {{ display: inline-block; margin-right: 8px; color: #ba1a1a; text-transform: uppercase; font-size: 11px; }}
    .issues p {{ margin: 6px 0 0; color: #625b71; }}
    .breakpoints {{ width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }}
    .breakpoints th, .breakpoints td {{ border: 1px solid #e7e0ec; padding: 10px; text-align: left; vertical-align: top; }}
    .breakpoints th {{ background: #fef7ff; color: #625b71; }}
    .breakpoints span {{ display: block; max-width: 360px; word-break: break-all; color: #625b71; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 11px; }}
    img {{ width: 100%; max-height: 680px; object-fit: contain; border: 1px solid #cac4d0; border-radius: 18px; background: white; }}
    pre {{ overflow: auto; max-height: 320px; border-radius: 16px; background: #1d1b20; color: #f5eff7; padding: 16px; font-size: 12px; line-height: 1.5; }}
    @media (max-width: 760px) {{ .grid {{ grid-template-columns: 1fr; }} main {{ padding: 16px; }} }}
  </style>
</head>
<body>
  <main>
    <section class="panel">
      <p>Nova UI Editor validation</p>
      <h1>{safe_project_name}</h1>
      <p>Generated app frontend build passed. The vector snapshot below is generated from the current project geometry and is stored next to this report.</p>
      <div class="grid">
        <div class="metric"><strong>{file_count}</strong><span>UI files</span></div>
        <div class="metric"><strong>{item_count}</strong><span>Controls</span></div>
        <div class="metric"><strong>{command_count}</strong><span>Rust commands</span></div>
      </div>
      {screenshot_section}
      {screenshot_analysis_section}
      {runtime_audit_section}
      {breakpoint_validation_section}
      <h2>Geometry snapshot: {file_name}</h2>
      <img src="{snapshot_name}" alt="Generated window validation snapshot" />
      <h2>Build log</h2>
      <pre>{log}</pre>
    </section>
  </main>
</body>
</html>
"#,
        log = html_escape(log)
    )
}

#[tauri::command]
pub(super) fn validate_generated_window(
    project: Value,
    rust_logic: String,
) -> Result<ValidationResult, String> {
    let project_name = project_name(&project);
    let root = project
        .get("rootPath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| managed_project_root(&project_name))?;

    save_project_files(&root, &project, &rust_logic)?;
    let app_dir = root.join("app");
    let mut log = String::new();

    if !app_dir.join("node_modules").exists() {
        let install = run_process(&app_dir, "npm", &["install"])?;
        log.push_str("$ npm install\n");
        log.push_str(&install);
        log.push('\n');
    }

    let build = run_process(&app_dir, "npm", &["run", "build"])?;
    log.push_str("$ npm run build\n");
    log.push_str(&build);

    let validation_dir = root.join("validation");
    fs::create_dir_all(&validation_dir).map_err(to_error)?;
    let snapshot_path = validation_dir.join("generated-window-snapshot.svg");
    let report_path = validation_dir.join("generated-window-validation.html");
    let screenshot_path = validation_dir.join("generated-window-runtime.png");
    let screenshot_analysis_path = validation_dir.join("generated-window-screenshot-analysis.json");
    let runtime_audit_path = validation_dir.join("generated-window-runtime-audit.json");
    let breakpoint_validation_path =
        validation_dir.join("generated-window-breakpoint-validation.json");
    let breakpoint_dir = validation_dir.join("breakpoints");
    let capture_status_path = validation_dir.join("browser-capture-status.json");
    let _ = fs::remove_file(&screenshot_path);
    let _ = fs::remove_file(&screenshot_analysis_path);
    let _ = fs::remove_file(&runtime_audit_path);
    let _ = fs::remove_file(&breakpoint_validation_path);
    let _ = fs::remove_dir_all(&breakpoint_dir);
    let _ = fs::remove_file(&capture_status_path);
    fs::write(&snapshot_path, generated_window_snapshot_svg(&project)).map_err(to_error)?;

    match run_process(&app_dir, "npm", &["run", "capture:window"]) {
        Ok(capture) => {
            log.push_str("\n$ npm run capture:window\n");
            log.push_str(&capture);
        }
        Err(capture) => {
            log.push_str("\n$ npm run capture:window (non-blocking)\n");
            log.push_str(&capture);
        }
    }
    if !capture_status_path.exists() {
        let status = serde_json::json!({
            "ok": false,
            "error": "Browser capture command finished without writing browser-capture-status.json",
        });
        let status_json = serde_json::to_string_pretty(&status).map_err(to_error)?;
        fs::write(&capture_status_path, status_json).map_err(to_error)?;
    }

    let screenshot_output = screenshot_path
        .exists()
        .then(|| screenshot_path.display().to_string());
    let screenshot_analysis_output = screenshot_analysis_path
        .exists()
        .then(|| screenshot_analysis_path.display().to_string());
    let screenshot_analysis = screenshot_analysis_output
        .as_ref()
        .and_then(|_| read_json_file(&screenshot_analysis_path));
    let runtime_audit_output = runtime_audit_path
        .exists()
        .then(|| runtime_audit_path.display().to_string());
    let runtime_audit = runtime_audit_output
        .as_ref()
        .and_then(|_| read_json_file(&runtime_audit_path));
    let breakpoint_validation_output = breakpoint_validation_path
        .exists()
        .then(|| breakpoint_validation_path.display().to_string());
    let breakpoint_validation = breakpoint_validation_output
        .as_ref()
        .and_then(|_| read_json_file(&breakpoint_validation_path));
    let breakpoint_issues = breakpoint_validation_issues(&project, breakpoint_validation.as_ref());
    fs::write(
        &report_path,
        generated_window_validation_report(
            &project,
            &log,
            &snapshot_path,
            screenshot_output.as_deref(),
            screenshot_analysis_output.as_deref(),
            screenshot_analysis.as_ref(),
            runtime_audit_output.as_deref(),
            runtime_audit.as_ref(),
            breakpoint_validation_output.as_deref(),
            breakpoint_validation.as_ref(),
        ),
    )
    .map_err(to_error)?;

    Ok(ValidationResult {
        success: true,
        paths: project_paths_for_project(&root, &project),
        log,
        report_path: report_path.display().to_string(),
        snapshot_path: snapshot_path.display().to_string(),
        screenshot_path: screenshot_output,
        screenshot_analysis_path: screenshot_analysis_output,
        runtime_audit_path: runtime_audit_output,
        breakpoint_validation_path: breakpoint_validation_output,
        breakpoint_issues,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn sample_project(titlebar_style: &str, window_kind: &str) -> Value {
        json!({
            "activeFileId": "file-1",
            "files": [{
                "id": "file-1",
                "name": "Main Window.ui",
                "page": {
                    "width": 960,
                    "height": 540,
                    "titlebarStyle": titlebar_style,
                    "windowKind": window_kind
                },
                "items": [{
                    "id": "btn-1",
                    "type": "button",
                    "name": "Create",
                    "x": 40,
                    "y": 80,
                    "width": 120,
                    "height": 40,
                    "z": 0,
                    "props": { "label": "Create" }
                }]
            }]
        })
    }

    #[test]
    fn snapshot_includes_nova_titlebar_chrome() {
        let svg = generated_window_snapshot_svg(&sample_project("nova", "main"));
        assert!(svg.contains("nova titlebar · main"));
        assert!(svg.contains("data-titlebar-style=\"nova\""));
        assert!(svg.contains("data-window-kind=\"main\""));
    }

    #[test]
    fn snapshot_includes_native_titlebar_chrome() {
        let svg = generated_window_snapshot_svg(&sample_project("native", "dialog"));
        assert!(svg.contains("native titlebar · dialog"));
    }

    #[test]
    fn snapshot_hides_titlebar_when_hidden() {
        let svg = generated_window_snapshot_svg(&sample_project("hidden", "frameless"));
        assert!(!svg.contains("titlebar ·"));
        assert!(svg.contains("Create"));
    }

    #[test]
    fn snapshot_covers_window_kind_matrix() {
        for window_kind in ["main", "dialog", "tool", "frameless"] {
            for titlebar in ["nova", "native", "hidden"] {
                let svg = generated_window_snapshot_svg(&sample_project(titlebar, window_kind));
                assert!(svg.starts_with("<svg"), "{titlebar}/{window_kind}");
                assert!(svg.contains("Create"), "{titlebar}/{window_kind}");
            }
        }
    }
}
