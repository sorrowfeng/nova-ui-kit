use crate::{
    append_rust_source_map_log, bundle_artifacts, cargo_check_diagnostic_args,
    generated_file_change_summary, generated_rust_source_map, managed_project_root,
    normalized_checkpoint_created_at, prepare_release_signing, project_name,
    project_paths_for_project, release_config, safe_file_name, save_project_files, slugify,
    terminate_process_tree, to_error, write_bundle_manifest, BuildResult,
    GeneratedFileChangeSummary, GeneratedRustSourceMap,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{
    collections::{BTreeMap, BTreeSet},
    fs,
    io::Write,
    path::{Path, PathBuf},
    process::{Command, Stdio},
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Mutex, OnceLock,
    },
    thread,
    time::Duration,
};

#[derive(Default)]
pub(super) struct EditorTaskState {
    tasks: Mutex<BTreeMap<String, Arc<Mutex<EditorBackgroundTask>>>>,
}

static EDITOR_PROJECT_TASK_LOCKS: OnceLock<Mutex<BTreeMap<String, Arc<Mutex<()>>>>> =
    OnceLock::new();
static EDITOR_TASK_SEQUENCE: AtomicU64 = AtomicU64::new(1);

struct EditorBackgroundTask {
    id: String,
    task_kind: String,
    check_kind: Option<String>,
    status: String,
    created_at: String,
    started_at: Option<String>,
    finished_at: Option<String>,
    root_path: String,
    log_path: String,
    current_command: Option<String>,
    pid: Option<u32>,
    cancel_requested: bool,
    summary: String,
    error: Option<String>,
    result: Option<Value>,
}

#[derive(Serialize)]
pub(super) struct EditorBackgroundTaskView {
    id: String,
    task_kind: String,
    check_kind: Option<String>,
    status: String,
    created_at: String,
    started_at: Option<String>,
    finished_at: Option<String>,
    root_path: String,
    log_path: String,
    current_command: Option<String>,
    pid: Option<u32>,
    summary: String,
    error: Option<String>,
    log_tail: String,
    result: Option<Value>,
}

#[derive(Serialize, Deserialize, Clone)]
struct EditorTaskRecord {
    id: String,
    task_kind: String,
    check_kind: Option<String>,
    status: String,
    created_at: String,
    started_at: Option<String>,
    finished_at: Option<String>,
    root_path: String,
    log_path: String,
    current_command: Option<String>,
    pid: Option<u32>,
    summary: String,
    error: Option<String>,
    result: Option<Value>,
}

#[tauri::command]
pub(super) fn start_editor_project_task(
    state: tauri::State<'_, EditorTaskState>,
    project: Value,
    rust_logic: String,
    task_kind: String,
    check_kind: Option<String>,
) -> Result<EditorBackgroundTaskView, String> {
    let normalized_task_kind = task_kind.trim().to_ascii_lowercase();
    if !matches!(normalized_task_kind.as_str(), "check" | "build" | "bundle") {
        return Err("Background editor tasks support check, build, or bundle.".to_string());
    }

    let project_name = project_name(&project);
    let root = project
        .get("rootPath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| managed_project_root(&project_name))?;

    let live_task_ids = live_editor_task_ids_for_root(&state, &root)?;
    let existing_records = read_editor_task_records(&root).unwrap_or_default();
    let stale_records = existing_records
        .into_iter()
        .map(|record| {
            if live_task_ids.contains(&record.id) {
                record
            } else {
                stale_editor_task_record(record)
            }
        })
        .collect::<Vec<_>>();
    if !stale_records.is_empty() {
        let _ = write_editor_task_records(&root, &stale_records);
    }
    let queue_position = active_editor_task_count_for_root(&state, &root)? + 1;

    let created_at = normalized_checkpoint_created_at("");
    let sequence = EDITOR_TASK_SEQUENCE.fetch_add(1, Ordering::Relaxed);
    let id = format!(
        "task-{}-{}-{}",
        safe_file_name(&created_at),
        slugify(&normalized_task_kind),
        sequence
    );
    let tasks_dir = root.join(".nova").join("tasks");
    fs::create_dir_all(&tasks_dir).map_err(to_error)?;
    let log_path = tasks_dir.join(format!("{id}.log"));
    let task = Arc::new(Mutex::new(EditorBackgroundTask {
        id: id.clone(),
        task_kind: normalized_task_kind.clone(),
        check_kind: check_kind.clone(),
        status: "queued".to_string(),
        created_at,
        started_at: None,
        finished_at: None,
        root_path: root.display().to_string(),
        log_path: log_path.display().to_string(),
        current_command: None,
        pid: None,
        cancel_requested: false,
        summary: if queue_position > 1 {
            format!("Queued in Rust task registry. Position {queue_position} for this project.")
        } else {
            "Queued in Rust task registry.".to_string()
        },
        error: None,
        result: None,
    }));

    {
        let mut tasks = state.tasks.lock().map_err(to_error)?;
        tasks.insert(id, Arc::clone(&task));
    }
    {
        let task_guard = task.lock().map_err(to_error)?;
        upsert_editor_task_record(&editor_task_record(&task_guard))?;
    }

    let worker_task = Arc::clone(&task);
    thread::spawn(move || {
        run_editor_background_task(
            worker_task,
            root,
            project,
            rust_logic,
            normalized_task_kind,
            check_kind,
        );
    });

    editor_task_view(&task)
}

#[tauri::command]
pub(super) fn list_editor_project_tasks(
    state: tauri::State<'_, EditorTaskState>,
    project: Value,
) -> Result<Vec<EditorBackgroundTaskView>, String> {
    let project_name = project_name(&project);
    let root = project
        .get("rootPath")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from)
        .map(Ok)
        .unwrap_or_else(|| managed_project_root(&project_name))?;
    let mut records = read_editor_task_records(&root)
        .unwrap_or_default()
        .into_iter()
        .map(stale_editor_task_record)
        .collect::<Vec<_>>();

    {
        let tasks = state.tasks.lock().map_err(to_error)?;
        for task in tasks.values() {
            let task = task.lock().map_err(to_error)?;
            if same_path_text(&task.root_path, &root) {
                let live_record = editor_task_record(&task);
                records.retain(|record| record.id != live_record.id);
                records.push(live_record);
            }
        }
    }

    records.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    records.truncate(100);
    let _ = write_editor_task_records(&root, &records);
    Ok(records.iter().map(editor_task_view_from_record).collect())
}

#[tauri::command]
pub(super) fn read_editor_project_task(
    state: tauri::State<'_, EditorTaskState>,
    task_id: String,
) -> Result<EditorBackgroundTaskView, String> {
    let task = {
        let tasks = state.tasks.lock().map_err(to_error)?;
        tasks
            .get(&task_id)
            .cloned()
            .ok_or_else(|| format!("Unknown editor background task: {task_id}"))?
    };
    editor_task_view(&task)
}

#[tauri::command]
pub(super) fn cancel_editor_project_task(
    state: tauri::State<'_, EditorTaskState>,
    task_id: String,
) -> Result<EditorBackgroundTaskView, String> {
    let task = {
        let tasks = state.tasks.lock().map_err(to_error)?;
        tasks
            .get(&task_id)
            .cloned()
            .ok_or_else(|| format!("Unknown editor background task: {task_id}"))?
    };

    let pid = {
        let task = task.lock().map_err(to_error)?;
        task.pid
    };
    let status = task.lock().map_err(to_error)?.status.clone();
    if status == "queued" {
        update_editor_task(&task, |task| {
            task.cancel_requested = true;
            task.status = "canceled".to_string();
            task.finished_at = Some(normalized_checkpoint_created_at(""));
            task.current_command = None;
            task.pid = None;
            task.summary = "Canceled before the task started.".to_string();
            task.error = None;
        });
    } else if status == "running" {
        update_editor_task(&task, |task| {
            task.cancel_requested = true;
            task.summary = "Cancel requested from Nova Task Center.".to_string();
        });
    } else {
        update_editor_task(&task, |task| {
            task.summary = format!("Task already finished with status `{}`.", task.status);
        });
    }
    if let Some(pid) = pid {
        let _ = terminate_process_tree(pid);
    }

    editor_task_view(&task)
}

fn run_editor_background_task(
    task: Arc<Mutex<EditorBackgroundTask>>,
    root: PathBuf,
    project: Value,
    rust_logic: String,
    task_kind: String,
    check_kind: Option<String>,
) {
    let log_path = task
        .lock()
        .ok()
        .map(|task| task.log_path.clone())
        .unwrap_or_default();
    let project_lock = match editor_project_task_lock(&root) {
        Ok(lock) => lock,
        Err(error) => {
            update_editor_task(&task, |task| {
                task.status = "failed".to_string();
                task.finished_at = Some(normalized_checkpoint_created_at(""));
                task.summary = "Task failed before it could enter the project queue.".to_string();
                task.error = Some(error);
            });
            return;
        }
    };
    let _ = append_task_log(
        &log_path,
        &format!(
            "Nova background task queued at {}\nTask kind: {task_kind}\nRoot: {}\n\n",
            normalized_checkpoint_created_at(""),
            root.display()
        ),
    );
    update_editor_task(&task, |task| {
        if task.status == "queued" {
            task.summary = "Waiting for this project's background task slot.".to_string();
        }
    });

    let _project_execution_guard = match project_lock.lock() {
        Ok(guard) => guard,
        Err(error) => {
            update_editor_task(&task, |task| {
                task.status = "failed".to_string();
                task.finished_at = Some(normalized_checkpoint_created_at(""));
                task.summary = "Task failed while waiting for the project queue.".to_string();
                task.error = Some(error.to_string());
            });
            return;
        }
    };
    let canceled_before_start = task
        .lock()
        .ok()
        .map(|task| task.cancel_requested || task.status == "canceled")
        .unwrap_or(true);
    if canceled_before_start {
        let finished_at = normalized_checkpoint_created_at("");
        let _ = append_task_log(&log_path, "Task canceled before it entered execution.\n");
        update_editor_task(&task, |task| {
            task.status = "canceled".to_string();
            task.finished_at = Some(finished_at);
            task.pid = None;
            task.current_command = None;
            task.summary = "Task canceled before it started.".to_string();
            task.error = None;
        });
        return;
    }

    let started_at = normalized_checkpoint_created_at("");
    update_editor_task(&task, |task| {
        task.status = "running".to_string();
        task.started_at = Some(started_at.clone());
        task.summary = "Running in Rust task registry.".to_string();
    });
    let _ = append_task_log(
        &log_path,
        &format!(
            "Nova background task started at {started_at}\nTask kind: {task_kind}\nRoot: {}\n\n",
            root.display()
        ),
    );

    let result = execute_editor_background_task(
        &task,
        &root,
        &project,
        &rust_logic,
        &task_kind,
        check_kind.as_deref(),
    );
    let finished_at = normalized_checkpoint_created_at("");
    match result {
        Ok(build_result) => {
            let result_value = serde_json::to_value(&build_result).ok();
            let summary = background_build_result_summary(&build_result);
            update_editor_task(&task, |task| {
                task.status = "succeeded".to_string();
                task.finished_at = Some(finished_at);
                task.pid = None;
                task.current_command = None;
                task.summary = summary;
                task.error = None;
                task.result = result_value;
            });
        }
        Err(error) if error == "__NOVA_TASK_CANCELED__" => {
            let _ = append_task_log(&log_path, "\nTask canceled by user.\n");
            update_editor_task(&task, |task| {
                task.status = "canceled".to_string();
                task.finished_at = Some(finished_at);
                task.pid = None;
                task.current_command = None;
                task.summary = "Task canceled by user.".to_string();
                task.error = None;
            });
        }
        Err(error) => {
            let _ = append_task_log(&log_path, &format!("\nTask failed:\n{error}\n"));
            update_editor_task(&task, |task| {
                task.status = "failed".to_string();
                task.finished_at = Some(finished_at);
                task.pid = None;
                task.current_command = None;
                task.summary = "Task failed. See task log for details.".to_string();
                task.error = Some(error);
            });
        }
    }
}

fn execute_editor_background_task(
    task: &Arc<Mutex<EditorBackgroundTask>>,
    root: &Path,
    project: &Value,
    rust_logic: &str,
    task_kind: &str,
    check_kind: Option<&str>,
) -> Result<BuildResult, String> {
    let generated_files = generated_file_change_summary(root, project, rust_logic)?;
    save_project_files(root, project, rust_logic)?;
    let rust_source_map = generated_rust_source_map(root, project, rust_logic);
    let log_path = task.lock().map_err(to_error)?.log_path.clone();
    let mut source_map_log = String::new();
    append_rust_source_map_log(&mut source_map_log, &rust_source_map);
    append_task_log(&log_path, &source_map_log)?;
    let app_dir = root.join("app");

    match task_kind {
        "check" => run_editor_check_background_task(
            task,
            root,
            project,
            &app_dir,
            check_kind.unwrap_or("all"),
            &rust_source_map,
            &generated_files,
        ),
        "build" => run_editor_build_background_task(
            task,
            root,
            project,
            &app_dir,
            &rust_source_map,
            &generated_files,
        ),
        "bundle" => run_editor_bundle_background_task(
            task,
            root,
            project,
            &app_dir,
            &rust_source_map,
            &generated_files,
        ),
        _ => Err(format!("Unsupported background task kind: {task_kind}")),
    }
}

fn run_editor_check_background_task(
    task: &Arc<Mutex<EditorBackgroundTask>>,
    root: &Path,
    project: &Value,
    app_dir: &Path,
    check_kind: &str,
    rust_source_map: &GeneratedRustSourceMap,
    generated_files: &GeneratedFileChangeSummary,
) -> Result<BuildResult, String> {
    let normalized_kind = check_kind.trim().to_ascii_lowercase();
    let run_frontend = normalized_kind == "frontend" || normalized_kind == "all";
    let run_rust = normalized_kind == "rust" || normalized_kind == "all";
    if !run_frontend && !run_rust {
        return Err(format!(
            "Unknown check kind `{}`. Use frontend, rust, or all.",
            check_kind
        ));
    }

    if run_frontend {
        if !app_dir.join("node_modules").exists() {
            run_task_process(task, app_dir, "npm", &["install"])?;
        }
        run_task_process(task, app_dir, "npm", &["run", "build"])?;
    }
    if run_rust {
        run_task_process(
            task,
            &app_dir.join("src-tauri"),
            "cargo",
            cargo_check_diagnostic_args(),
        )?;
    }

    Ok(BuildResult {
        success: true,
        build_kind: format!("check:{normalized_kind}"),
        paths: project_paths_for_project(root, project),
        generated_files: generated_files.clone(),
        bundle_dir: None,
        bundle_paths: Vec::new(),
        bundle_manifest_path: None,
        bundle_smoke_status: None,
        bundle_artifact_count: 0,
        installer_smoke_script_path: None,
        installer_smoke_result_path: None,
        installer_smoke_status: None,
        installer_smoke_runner_mode: None,
        installer_smoke_vm_handoff_path: None,
        rust_source_map: rust_source_map.clone(),
        log: task_log_content(task),
    })
}

fn run_editor_build_background_task(
    task: &Arc<Mutex<EditorBackgroundTask>>,
    root: &Path,
    project: &Value,
    app_dir: &Path,
    rust_source_map: &GeneratedRustSourceMap,
    generated_files: &GeneratedFileChangeSummary,
) -> Result<BuildResult, String> {
    if !app_dir.join("node_modules").exists() {
        run_task_process(task, app_dir, "npm", &["install"])?;
    }
    run_task_process(task, app_dir, "npm", &["run", "tauri:exe"])?;

    Ok(BuildResult {
        success: true,
        build_kind: "exe".to_string(),
        paths: project_paths_for_project(root, project),
        generated_files: generated_files.clone(),
        bundle_dir: None,
        bundle_paths: Vec::new(),
        bundle_manifest_path: None,
        bundle_smoke_status: None,
        bundle_artifact_count: 0,
        installer_smoke_script_path: None,
        installer_smoke_result_path: None,
        installer_smoke_status: None,
        installer_smoke_runner_mode: None,
        installer_smoke_vm_handoff_path: None,
        rust_source_map: rust_source_map.clone(),
        log: task_log_content(task),
    })
}

fn run_editor_bundle_background_task(
    task: &Arc<Mutex<EditorBackgroundTask>>,
    root: &Path,
    project: &Value,
    app_dir: &Path,
    rust_source_map: &GeneratedRustSourceMap,
    generated_files: &GeneratedFileChangeSummary,
) -> Result<BuildResult, String> {
    if !app_dir.join("node_modules").exists() {
        run_task_process(task, app_dir, "npm", &["install"])?;
    }
    let project_name = project_name(project);
    let release = release_config(project, &project_name);
    let mut signing_log = String::new();
    prepare_release_signing(&release, &mut signing_log)?;
    let log_path = task.lock().map_err(to_error)?.log_path.clone();
    append_task_log(&log_path, &signing_log)?;

    run_task_process(task, app_dir, "npm", &["run", "tauri:bundle"])?;
    let (bundle_dir, bundle_paths) = bundle_artifacts(root)?;
    let bundle_manifest =
        write_bundle_manifest(root, &project_name, &release, &bundle_dir, &bundle_paths)?;
    append_task_log(
        &log_path,
        &format!(
            "\nBundle manifest: {}\n{}",
            bundle_manifest.path,
            bundle_manifest
                .installer_smoke_vm_handoff_path
                .as_ref()
                .map(|path| format!("Installer smoke VM handoff: {path}\n"))
                .unwrap_or_default()
        ),
    )?;

    Ok(BuildResult {
        success: true,
        build_kind: "bundle".to_string(),
        paths: project_paths_for_project(root, project),
        generated_files: generated_files.clone(),
        bundle_dir,
        bundle_paths,
        bundle_manifest_path: Some(bundle_manifest.path),
        bundle_smoke_status: Some(bundle_manifest.smoke_status),
        bundle_artifact_count: bundle_manifest.artifact_count,
        installer_smoke_script_path: bundle_manifest.installer_smoke_script_path,
        installer_smoke_result_path: bundle_manifest.installer_smoke_result_path,
        installer_smoke_status: Some(bundle_manifest.installer_smoke_status),
        installer_smoke_runner_mode: Some(bundle_manifest.installer_smoke_runner_mode),
        installer_smoke_vm_handoff_path: bundle_manifest.installer_smoke_vm_handoff_path,
        rust_source_map: rust_source_map.clone(),
        log: task_log_content(task),
    })
}

fn run_task_process(
    task: &Arc<Mutex<EditorBackgroundTask>>,
    cwd: &Path,
    program: &str,
    args: &[&str],
) -> Result<(), String> {
    if task.lock().map_err(to_error)?.cancel_requested {
        return Err("__NOVA_TASK_CANCELED__".to_string());
    }

    let executable = if cfg!(target_os = "windows") && program == "npm" {
        "npm.cmd"
    } else {
        program
    };
    let command_label = if args.is_empty() {
        program.to_string()
    } else {
        format!("{program} {}", args.join(" "))
    };
    let log_path = task.lock().map_err(to_error)?.log_path.clone();
    append_task_log(&log_path, &format!("$ {command_label}\n"))?;

    let stdout = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .map_err(to_error)?;
    let stderr = stdout.try_clone().map_err(to_error)?;
    let mut command = Command::new(executable);
    command
        .args(args)
        .current_dir(cwd)
        .stdout(Stdio::from(stdout))
        .stderr(Stdio::from(stderr));
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }

    let mut child = command.spawn().map_err(to_error)?;
    let pid = child.id();
    update_editor_task(task, |task| {
        task.pid = Some(pid);
        task.current_command = Some(command_label.clone());
        task.summary = format!("Running `{command_label}`.");
    });

    loop {
        if task.lock().map_err(to_error)?.cancel_requested {
            let _ = terminate_process_tree(pid);
            let _ = child.kill();
            let _ = child.wait();
            update_editor_task(task, |task| {
                task.pid = None;
                task.current_command = None;
            });
            return Err("__NOVA_TASK_CANCELED__".to_string());
        }

        match child.try_wait().map_err(to_error)? {
            Some(status) => {
                update_editor_task(task, |task| {
                    task.pid = None;
                    task.current_command = None;
                });
                append_task_log(&log_path, "\n")?;
                if status.success() {
                    return Ok(());
                }
                return Err(editor_task_log_tail(&log_path, 8000));
            }
            None => thread::sleep(Duration::from_millis(250)),
        }
    }
}

fn update_editor_task(
    task: &Arc<Mutex<EditorBackgroundTask>>,
    update: impl FnOnce(&mut EditorBackgroundTask),
) {
    if let Ok(mut task) = task.lock() {
        update(&mut task);
        let record = editor_task_record(&task);
        drop(task);
        let _ = upsert_editor_task_record(&record);
    }
}

fn editor_task_view(
    task: &Arc<Mutex<EditorBackgroundTask>>,
) -> Result<EditorBackgroundTaskView, String> {
    let task = task.lock().map_err(to_error)?;
    Ok(EditorBackgroundTaskView {
        id: task.id.clone(),
        task_kind: task.task_kind.clone(),
        check_kind: task.check_kind.clone(),
        status: task.status.clone(),
        created_at: task.created_at.clone(),
        started_at: task.started_at.clone(),
        finished_at: task.finished_at.clone(),
        root_path: task.root_path.clone(),
        log_path: task.log_path.clone(),
        current_command: task.current_command.clone(),
        pid: task.pid,
        summary: task.summary.clone(),
        error: task.error.clone(),
        log_tail: editor_task_log_tail(&task.log_path, 8000),
        result: task.result.clone(),
    })
}

fn editor_task_record(task: &EditorBackgroundTask) -> EditorTaskRecord {
    EditorTaskRecord {
        id: task.id.clone(),
        task_kind: task.task_kind.clone(),
        check_kind: task.check_kind.clone(),
        status: task.status.clone(),
        created_at: task.created_at.clone(),
        started_at: task.started_at.clone(),
        finished_at: task.finished_at.clone(),
        root_path: task.root_path.clone(),
        log_path: task.log_path.clone(),
        current_command: task.current_command.clone(),
        pid: task.pid,
        summary: task.summary.clone(),
        error: task.error.clone(),
        result: task.result.clone(),
    }
}

fn editor_task_view_from_record(record: &EditorTaskRecord) -> EditorBackgroundTaskView {
    EditorBackgroundTaskView {
        id: record.id.clone(),
        task_kind: record.task_kind.clone(),
        check_kind: record.check_kind.clone(),
        status: record.status.clone(),
        created_at: record.created_at.clone(),
        started_at: record.started_at.clone(),
        finished_at: record.finished_at.clone(),
        root_path: record.root_path.clone(),
        log_path: record.log_path.clone(),
        current_command: record.current_command.clone(),
        pid: record.pid,
        summary: record.summary.clone(),
        error: record.error.clone(),
        log_tail: editor_task_log_tail(&record.log_path, 8000),
        result: record.result.clone(),
    }
}

fn editor_tasks_dir(root: &Path) -> PathBuf {
    root.join(".nova").join("tasks")
}

fn editor_task_registry_path(root: &Path) -> PathBuf {
    editor_tasks_dir(root).join("tasks.json")
}

fn read_editor_task_records(root: &Path) -> Result<Vec<EditorTaskRecord>, String> {
    let path = editor_task_registry_path(root);
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(&path).map_err(to_error)?;
    serde_json::from_str(content.trim_start_matches('\u{feff}')).map_err(to_error)
}

fn write_editor_task_records(root: &Path, records: &[EditorTaskRecord]) -> Result<(), String> {
    let tasks_dir = editor_tasks_dir(root);
    fs::create_dir_all(&tasks_dir).map_err(to_error)?;
    let path = editor_task_registry_path(root);
    let content = serde_json::to_string_pretty(records).map_err(to_error)?;
    fs::write(path, content).map_err(to_error)
}

fn upsert_editor_task_record(record: &EditorTaskRecord) -> Result<(), String> {
    let root = PathBuf::from(&record.root_path);
    let mut records = read_editor_task_records(&root)?;
    records.retain(|candidate| candidate.id != record.id);
    records.insert(0, record.clone());
    records.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    records.truncate(100);
    write_editor_task_records(&root, &records)
}

fn stale_editor_task_record(mut record: EditorTaskRecord) -> EditorTaskRecord {
    if record.status == "queued" || record.status == "running" {
        record.status = "canceled".to_string();
        record.finished_at = Some(normalized_checkpoint_created_at(""));
        record.pid = None;
        record.current_command = None;
        record.summary =
            "Task was interrupted when the editor task registry restarted.".to_string();
    }
    record
}

fn live_editor_task_ids_for_root(
    state: &tauri::State<'_, EditorTaskState>,
    root: &Path,
) -> Result<BTreeSet<String>, String> {
    let tasks = state.tasks.lock().map_err(to_error)?;
    let mut ids = BTreeSet::new();
    for task in tasks.values() {
        let task = task.lock().map_err(to_error)?;
        if same_path_text(&task.root_path, root) {
            ids.insert(task.id.clone());
        }
    }
    Ok(ids)
}

fn active_editor_task_count_for_root(
    state: &tauri::State<'_, EditorTaskState>,
    root: &Path,
) -> Result<usize, String> {
    let tasks = state.tasks.lock().map_err(to_error)?;
    let mut count = 0;
    for task in tasks.values() {
        let task = task.lock().map_err(to_error)?;
        if same_path_text(&task.root_path, root)
            && (task.status == "queued" || task.status == "running")
        {
            count += 1;
        }
    }
    Ok(count)
}

fn editor_project_task_lock(root: &Path) -> Result<Arc<Mutex<()>>, String> {
    let key = editor_project_task_lock_key(root);
    let locks = EDITOR_PROJECT_TASK_LOCKS.get_or_init(|| Mutex::new(BTreeMap::new()));
    let mut locks = locks.lock().map_err(to_error)?;
    Ok(Arc::clone(
        locks.entry(key).or_insert_with(|| Arc::new(Mutex::new(()))),
    ))
}

fn editor_project_task_lock_key(root: &Path) -> String {
    root.display().to_string().to_ascii_lowercase()
}

fn same_path_text(left: &str, right: &Path) -> bool {
    left.eq_ignore_ascii_case(&right.display().to_string())
}

fn append_task_log(path: &str, content: &str) -> Result<(), String> {
    if path.trim().is_empty() || content.is_empty() {
        return Ok(());
    }
    let path = PathBuf::from(path);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(to_error)?;
    }
    let mut file = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(to_error)?;
    file.write_all(content.as_bytes()).map_err(to_error)
}

fn editor_task_log_tail(path: &str, max_bytes: usize) -> String {
    let Ok(content) = fs::read(path) else {
        return String::new();
    };
    let start = content.len().saturating_sub(max_bytes);
    String::from_utf8_lossy(&content[start..]).to_string()
}

fn task_log_content(task: &Arc<Mutex<EditorBackgroundTask>>) -> String {
    task.lock()
        .ok()
        .map(|task| editor_task_log_tail(&task.log_path, 64 * 1024))
        .unwrap_or_default()
}

fn background_build_result_summary(result: &BuildResult) -> String {
    let generated_suffix = format!(
        " Generated targets: {}/{} changed.",
        result.generated_files.changed_count, result.generated_files.total_count
    );
    let summary = match result.build_kind.as_str() {
        "exe" => result
            .paths
            .output_exe_path
            .as_ref()
            .map(|path| format!("Release executable built: {path}"))
            .unwrap_or_else(|| "Release executable build finished.".to_string()),
        "bundle" => format!(
            "Installer bundle build finished with {} artifact(s).",
            result.bundle_artifact_count
        ),
        value if value.starts_with("check:") => format!("Quick check finished: {value}"),
        _ => "Background task finished.".to_string(),
    };
    format!("{summary}{generated_suffix}")
}
