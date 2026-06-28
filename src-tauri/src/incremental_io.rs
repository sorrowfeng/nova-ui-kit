use std::{collections::BTreeSet, fs, path::Path};

fn to_error(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn same_existing_file(left: &Path, right: &Path) -> bool {
    match (fs::canonicalize(left), fs::canonicalize(right)) {
        (Ok(left), Ok(right)) => left == right,
        _ => false,
    }
}

pub fn files_have_same_content(left: &Path, right: &Path) -> Result<bool, String> {
    if same_existing_file(left, right) {
        return Ok(true);
    }
    if !left.is_file() || !right.is_file() {
        return Ok(false);
    }
    let left_meta = fs::metadata(left).map_err(to_error)?;
    let right_meta = fs::metadata(right).map_err(to_error)?;
    if left_meta.len() != right_meta.len() {
        return Ok(false);
    }
    Ok(fs::read(left).map_err(to_error)? == fs::read(right).map_err(to_error)?)
}

pub fn write_bytes_if_changed(path: &Path, content: &[u8]) -> Result<bool, String> {
    if let Ok(current) = fs::read(path) {
        if current == content {
            return Ok(false);
        }
    }
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(to_error)?;
    }
    fs::write(path, content).map_err(to_error)?;
    Ok(true)
}

pub fn write_text_if_changed(path: &Path, content: &str) -> Result<bool, String> {
    write_bytes_if_changed(path, content.as_bytes())
}

pub fn copy_file_if_changed(source: &Path, target: &Path) -> Result<bool, String> {
    if files_have_same_content(source, target)? {
        return Ok(false);
    }
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(to_error)?;
    }
    fs::copy(source, target).map_err(to_error)?;
    Ok(true)
}

pub fn remove_stale_generated_files(
    dir: &Path,
    expected_file_names: &BTreeSet<String>,
) -> Result<(), String> {
    remove_stale_generated_files_with_keep(dir, expected_file_names, &[])
}

pub fn remove_stale_generated_files_with_keep(
    dir: &Path,
    expected_file_names: &BTreeSet<String>,
    keep_file_names: &[&str],
) -> Result<(), String> {
    if !dir.exists() {
        return Ok(());
    }
    let keep_file_names = keep_file_names
        .iter()
        .map(|value| value.to_string())
        .collect::<BTreeSet<_>>();
    for entry in fs::read_dir(dir).map_err(to_error)? {
        let entry = entry.map_err(to_error)?;
        let path = entry.path();
        if !path.is_file() || path.extension().and_then(|value| value.to_str()) != Some("rs") {
            continue;
        }
        let Some(file_name) = path
            .file_name()
            .and_then(|value| value.to_str())
            .map(str::to_string)
        else {
            continue;
        };
        if !expected_file_names.contains(&file_name) && !keep_file_names.contains(&file_name) {
            fs::remove_file(path).map_err(to_error)?;
        }
    }
    Ok(())
}
