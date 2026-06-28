use crate::generated_bridge::generated_lib_module_block;
use crate::{
    backend_integrations, project_name, rust_module_source, rust_modules, rust_source, to_error,
};
use serde::Serialize;
use serde_json::Value;
use std::path::Path;

#[derive(Serialize, Clone)]
pub(super) struct GeneratedRustSourceMap {
    pub(super) schema: String,
    pub(super) project_name: String,
    pub(super) root_path: String,
    pub(super) rust_logic_path: String,
    pub(super) generated_lib_path: String,
    pub(super) source_map_path: String,
    pub(super) generated_source_map_path: String,
    pub(super) entries: Vec<GeneratedRustSourceMapEntry>,
}

#[derive(Serialize, Clone)]
pub(super) struct GeneratedRustSourceMapEntry {
    pub(super) id: String,
    pub(super) kind: String,
    pub(super) source_path: String,
    pub(super) generated_path: String,
    pub(super) source_start_line: usize,
    pub(super) source_end_line: usize,
    pub(super) generated_start_line: usize,
    pub(super) generated_end_line: usize,
    pub(super) line_offset: isize,
    pub(super) line_count: usize,
    pub(super) summary: String,
}

fn generated_source_line_count(source: &str) -> usize {
    if source.is_empty() {
        1
    } else {
        source.split('\n').count()
    }
}

fn generated_start_line_after(prefix: &str) -> usize {
    prefix.bytes().filter(|byte| *byte == b'\n').count() + 1
}

pub(super) fn generated_rust_source_map(
    root: &Path,
    project: &Value,
    rust_logic: &str,
) -> GeneratedRustSourceMap {
    let project_name = project_name(project);
    let project_modules = rust_modules(project);
    let project_backend_integrations = backend_integrations(project);
    let module_block = generated_lib_module_block(&project_modules, &project_backend_integrations);
    let logic_source = rust_source(rust_logic);
    let logic_line_count = generated_source_line_count(&logic_source);
    let logic_generated_start_line = generated_start_line_after(&module_block);
    let logic_generated_end_line = logic_generated_start_line + logic_line_count.saturating_sub(1);
    let rust_logic_path = root.join("rust").join("logic.rs");
    let generated_lib_path = root
        .join("app")
        .join("src-tauri")
        .join("src")
        .join("lib.rs");
    let source_map_path = root.join("rust").join("source-map.json");
    let generated_source_map_path = root
        .join("app")
        .join("src-tauri")
        .join("src")
        .join("nova_source_map.json");
    let mut entries = vec![GeneratedRustSourceMapEntry {
        id: "rust-logic".to_string(),
        kind: "rust-logic".to_string(),
        source_path: rust_logic_path.display().to_string(),
        generated_path: generated_lib_path.display().to_string(),
        source_start_line: 1,
        source_end_line: logic_line_count,
        generated_start_line: logic_generated_start_line,
        generated_end_line: logic_generated_end_line,
        line_offset: logic_generated_start_line as isize - 1,
        line_count: logic_line_count,
        summary: "Editable Rust logic embedded into generated src-tauri/src/lib.rs".to_string(),
    }];

    for module in &project_modules {
        let module_source = rust_module_source(&module.source);
        let module_line_count = generated_source_line_count(&module_source);
        let source_path = root
            .join("rust")
            .join("modules")
            .join(format!("{}.rs", module.name));
        let generated_path = root
            .join("app")
            .join("src-tauri")
            .join("src")
            .join(format!("{}.rs", module.name));
        entries.push(GeneratedRustSourceMapEntry {
            id: format!("rust-module-{}", module.name),
            kind: "rust-module".to_string(),
            source_path: source_path.display().to_string(),
            generated_path: generated_path.display().to_string(),
            source_start_line: 1,
            source_end_line: module_line_count,
            generated_start_line: 1,
            generated_end_line: module_line_count,
            line_offset: 0,
            line_count: module_line_count,
            summary: format!("Project Rust module {}", module.name),
        });
    }

    GeneratedRustSourceMap {
        schema: "nova.rustSourceMap.v1".to_string(),
        project_name,
        root_path: root.display().to_string(),
        rust_logic_path: rust_logic_path.display().to_string(),
        generated_lib_path: generated_lib_path.display().to_string(),
        source_map_path: source_map_path.display().to_string(),
        generated_source_map_path: generated_source_map_path.display().to_string(),
        entries,
    }
}

pub(super) fn generated_rust_source_map_json(
    root: &Path,
    project: &Value,
    rust_logic: &str,
) -> Result<String, String> {
    serde_json::to_string_pretty(&generated_rust_source_map(root, project, rust_logic))
        .map_err(to_error)
}

pub(super) fn append_rust_source_map_log(log: &mut String, source_map: &GeneratedRustSourceMap) {
    log.push_str("NOVA_RUST_SOURCE_MAP_PATH=");
    log.push_str(&source_map.source_map_path);
    log.push('\n');
    if let Ok(payload) = serde_json::to_string(source_map) {
        log.push_str("NOVA_RUST_SOURCE_MAP_JSON=");
        log.push_str(&payload);
        log.push('\n');
    }
}

pub(super) fn cargo_check_diagnostic_args() -> &'static [&'static str] {
    &["check", "--message-format=json"]
}
