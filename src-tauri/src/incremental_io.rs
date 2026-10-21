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

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn temp_dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("nova-io-test-{name}-{}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn write_bytes_if_changed_skips_identical_content() {
        let dir = temp_dir("skip");
        let path = dir.join("a.bin");
        assert!(write_bytes_if_changed(&path, b"hello").unwrap());
        assert!(!write_bytes_if_changed(&path, b"hello").unwrap());
        assert!(write_bytes_if_changed(&path, b"world").unwrap());
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn files_have_same_content_detects_mismatch() {
        let dir = temp_dir("same");
        let left = dir.join("left.txt");
        let right = dir.join("right.txt");
        write_text_if_changed(&left, "abc").unwrap();
        write_text_if_changed(&right, "abc").unwrap();
        assert!(files_have_same_content(&left, &right).unwrap());
        write_text_if_changed(&right, "xyz").unwrap();
        assert!(!files_have_same_content(&left, &right).unwrap());
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn remove_stale_generated_files_keeps_expected_and_keep_list() {
        let dir = temp_dir("stale");
        fs::write(dir.join("keep.rs"), "a").unwrap();
        fs::write(dir.join("expected.rs"), "b").unwrap();
        fs::write(dir.join("stale.rs"), "c").unwrap();
        fs::write(dir.join("protected.rs"), "d").unwrap();
        let expected: BTreeSet<String> = ["expected.rs".to_string()].into();
        remove_stale_generated_files_with_keep(&dir, &expected, &["protected.rs"]).unwrap();
        assert!(dir.join("keep.rs").exists() == false);
        assert!(dir.join("expected.rs").exists());
        assert!(dir.join("stale.rs").exists() == false);
        assert!(dir.join("protected.rs").exists());
        let _ = fs::remove_dir_all(&dir);
    }

    use std::path::PathBuf;
}
