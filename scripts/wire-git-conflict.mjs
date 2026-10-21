import fs from "node:fs";

const sp = "src-tauri/src/system_process.rs";
let t = fs.readFileSync(sp, "utf8");

if (!t.includes("read_git_conflict")) {
  t += `

#[derive(serde::Serialize)]
pub(super) struct GitConflictHunk {
    pub ours: String,
    pub theirs: String,
    pub start_line: usize,
}

#[derive(serde::Serialize)]
pub(super) struct GitConflictFile {
    pub path: String,
    pub hunks: Vec<GitConflictHunk>,
}

/// Read conflict markers (<<<<<<< / ======= / >>>>>>>) from a file.
#[tauri::command]
pub(super) fn read_git_conflict(root_path: String, file_path: String) -> Result<GitConflictFile, String> {
    let full = std::path::PathBuf::from(&root_path).join(&file_path);
    let text = std::fs::read_to_string(&full).map_err(to_error)?;
    let mut hunks = Vec::new();
    let mut ours = String::new();
    let mut theirs = String::new();
    let mut in_conflict = false;
    let mut in_ours = false;
    let mut in_theirs = false;
    let mut start_line = 0usize;
    for (idx, line) in text.lines().enumerate() {
        if line.starts_with("<<<<<<<") {
            in_conflict = true;
            in_ours = true;
            in_theirs = false;
            ours.clear();
            theirs.clear();
            start_line = idx + 1;
        } else if in_conflict && line.starts_with("=======") {
            in_ours = false;
            in_theirs = true;
        } else if in_conflict && line.starts_with(">>>>>>>") {
            hunks.push(GitConflictHunk {
                ours: ours.clone(),
                theirs: theirs.clone(),
                start_line,
            });
            in_conflict = false;
            in_ours = false;
            in_theirs = false;
        } else if in_ours {
            ours.push_str(line);
            ours.push('\\n');
        } else if in_theirs {
            theirs.push_str(line);
            theirs.push('\\n');
        }
    }
    Ok(GitConflictFile { path: file_path, hunks })
}

/// Resolve a conflicted file by taking ours / theirs / both (concat).
#[tauri::command]
pub(super) fn resolve_git_conflict(
    root_path: String,
    file_path: String,
    resolution: String,
) -> Result<String, String> {
    let full = std::path::PathBuf::from(&root_path).join(&file_path);
    let text = std::fs::read_to_string(&full).map_err(to_error)?;
    let mut out = String::new();
    let mut ours = String::new();
    let mut theirs = String::new();
    let mut in_conflict = false;
    let mut in_ours = false;
    let mut in_theirs = false;
    for line in text.lines() {
        if line.starts_with("<<<<<<<") {
            in_conflict = true;
            in_ours = true;
            in_theirs = false;
            ours.clear();
            theirs.clear();
        } else if in_conflict && line.starts_with("=======") {
            in_ours = false;
            in_theirs = true;
        } else if in_conflict && line.starts_with(">>>>>>>") {
            match resolution.as_str() {
                "ours" => out.push_str(&ours),
                "theirs" => out.push_str(&theirs),
                "both" => {
                    out.push_str(&ours);
                    out.push_str(&theirs);
                }
                _ => out.push_str(&ours),
            }
            in_conflict = false;
            in_ours = false;
            in_theirs = false;
        } else if in_ours {
            ours.push_str(line);
            ours.push('\\n');
        } else if in_theirs {
            theirs.push_str(line);
            theirs.push('\\n');
        } else {
            out.push_str(line);
            out.push('\\n');
        }
    }
    std::fs::write(&full, out).map_err(to_error)?;
    Ok(file_path)
}
`;
  fs.writeFileSync(sp, t);
  console.log("git conflict commands added");
}

let l = fs.readFileSync("src-tauri/src/lib.rs", "utf8");
if (!l.includes("read_git_conflict")) {
  l = l.replace(
    "git_project_status, init_project_git,",
    "git_project_status, init_project_git, read_git_conflict, resolve_git_conflict,",
  );
  l = l.replace(
    "            git_project_status,",
    "            git_project_status,\n            read_git_conflict,\n            resolve_git_conflict,",
  );
  fs.writeFileSync("src-tauri/src/lib.rs", l);
  console.log("registered");
}
