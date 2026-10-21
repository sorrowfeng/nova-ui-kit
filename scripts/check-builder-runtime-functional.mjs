#!/usr/bin/env node
// Functional smoke gate: core editor workflows only.
// Chrome/layout pixel checks are skipped (see check-builder-runtime-smoke.mjs full mode).
process.env.NOVA_SMOKE_MODE = "functional";
await import("./check-builder-runtime-smoke.mjs");
