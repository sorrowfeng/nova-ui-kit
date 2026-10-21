#!/usr/bin/env node
// Layout smoke gate (P2-10): pixel/geometry assertions only.
// Independent from the functional gate — a layout regression fails here
// without blocking `check:builder-runtime:design`, and vice versa.
process.env.NOVA_SMOKE_MODE = "layout";
await import("./check-builder-runtime-smoke.mjs");
