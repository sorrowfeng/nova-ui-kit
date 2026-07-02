import { spawnSync } from "node:child_process";
import process from "node:process";

const cargoBin = process.platform === "win32" ? "cargo.exe" : "cargo";
const tests = [
  {
    name: "generated_runtime_uses_nova_drag_titlebar_without_editor_grid",
    label: "generated runtime Nova shell and grid-off contract",
  },
  {
    name: "active_ui_window_shape_drives_generated_exe_shell",
    label: "active UI window shell drives generated exe shell",
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
    console.error(`Generated runtime Rust check failed while starting ${test.label}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Generated runtime Rust check failed in ${test.label} with exit code ${result.status}.`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\nGenerated runtime Rust checks ok: ${tests.length} targeted tests.`);
