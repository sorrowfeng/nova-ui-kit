#!/usr/bin/env node
// Design-only smoke: skips project workspace + Rust/logic sections.
process.env.NOVA_SMOKE_SCOPE = "design";
await import("./check-builder-runtime-smoke.mjs");
