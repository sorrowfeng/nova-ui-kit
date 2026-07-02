import { spawnSync } from "node:child_process";
import process from "node:process";

const cargoBin = process.platform === "win32" ? "cargo.exe" : "cargo";
const tests = [
  {
    name: "save_project_files_writes_editor_state_metadata",
    label: ".nova editor-state and workspace metadata write",
  },
  {
    name: "read_editor_project_merges_hidden_editor_state_metadata",
    label: ".nova editor-state readback merge",
  },
  {
    name: "save_project_files_writes_gitignore_without_overwriting_user_rules",
    label: "project .gitignore preserves reusable .nova metadata",
  },
];

for (const test of tests) {
  console.log(`\n==> cargo test ${test.name}`);
  const result = spawnSync(
    cargoBin,
    ["test", "--manifest-path", "src-tauri/Cargo.toml", "--lib", test.name],
    {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false,
    },
  );

  if (result.error) {
    console.error(`Project persistence Rust check failed while starting ${test.label}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Project persistence Rust check failed in ${test.label} with exit code ${result.status}.`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\nProject persistence Rust checks ok: ${tests.length} targeted tests.`);
