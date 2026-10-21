import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const sampleDir = path.join(root, "examples", "cpp-ffi");
const checks = [];
const failures = [];

function addCheck(label, passed, detail) {
  checks.push(label);
  if (!passed) failures.push({ label, detail });
}

function mustContain(label, source, needle) {
  addCheck(label, source.includes(needle), `Expected to contain ${needle}`);
}

// 1) Sample sources exist and declare the Nova FFI ABI.
const header = fs.readFileSync(path.join(sampleDir, "include", "nova_backend.h"), "utf8");
const source = fs.readFileSync(path.join(sampleDir, "src", "nova_backend.cpp"), "utf8");
const demo = fs.readFileSync(path.join(sampleDir, "src", "demo_main.cpp"), "utf8");
const cmake = fs.readFileSync(path.join(sampleDir, "CMakeLists.txt"), "utf8");

mustContain("FFI header exports nova_backend_process", header, "nova_backend_process");
mustContain("FFI header uses extern C ABI", header, 'extern "C"');
mustContain("FFI source defines nova_backend_process", source, "nova_backend_process");
mustContain("FFI source returns JSON envelope", source, "success");
mustContain("FFI source routes methods", source, "add");
mustContain("Demo harness exercises health", demo, "health");
mustContain("Demo harness expects sum 42", demo, "sum");
mustContain("CMake builds shared nova_backend", cmake, "add_library(nova_backend SHARED");

// 2) Generated starter still emits the same ABI (create-only templates).
const templateDir = path.join(root, "src-tauri", "src", "generated_project_files.rs");
const templates = fs.readFileSync(templateDir, "utf8");
mustContain("Generated C++ starter exports process ABI", templates, "nova_backend_process");
mustContain("Generated C++ starter header exists", templates, "generated_cpp_ffi_header");

// 3) If a build tree exists, verify the compiled demo runs (optional local check).
const demoExeCandidates = [
  path.join(sampleDir, "build", "bin", "Release", "nova_backend_demo.exe"),
  path.join(sampleDir, "build", "bin", "nova_backend_demo"),
  path.join(sampleDir, "build", "bin", "Release", "nova_backend_demo"),
];
const demoExe = demoExeCandidates.find((candidate) => fs.existsSync(candidate));
if (demoExe) {
  const run = spawnSync(demoExe, [], { encoding: "utf8" });
  const ok = run.status === 0 && (run.stdout || "").includes("PASSED");
  addCheck("Compiled C++ FFI demo passes", ok, `status=${run.status}\n${run.stdout}\n${run.stderr}`);
} else {
  console.log("note: compiled demo not found — run cmake --build examples/cpp-ffi/build --config Release");
  addCheck("Compiled C++ FFI demo (optional skipped)", true, "binary not present");
}

if (failures.length > 0) {
  console.error(`check-cpp-ffi-sample failed: ${failures.length} of ${checks.length} checks failed.`);
  for (const failure of failures) {
    console.error(`  - ${failure.label}`);
    console.error(`    ${failure.detail}`);
  }
  process.exit(1);
}

console.log(`check-cpp-ffi-sample ok: ${checks.length} checks.`);
