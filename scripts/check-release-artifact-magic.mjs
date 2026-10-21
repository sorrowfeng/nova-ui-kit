#!/usr/bin/env node
// check-release-artifact-magic — regression test for verify-release-artifacts.
// The dmg case in particular is easy to get wrong: the UDIF trailer is 512
// bytes at the end of the file and its signature sits at fileSize-512, not at
// fileSize-4. A fixture that merely appends "koly" passes the wrong check and
// then fails on a real tauri .dmg.
//
// Usage: node scripts/check-release-artifact-magic.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const verifier = path.join(here, "verify-release-artifacts.mjs");
const scratch = path.join(here, ".test-out", "release-artifact-magic");

const KOLY_TRAILER = Buffer.alloc(512);
KOLY_TRAILER.write("koly", 0, "ascii");

const failures = [];

function writeFixture(dir, name, bytes) {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name);
  fs.writeFileSync(file, bytes);
  return file;
}

function runVerifier(dir, platform) {
  try {
    const out = execFileSync(process.execPath, [verifier, "--dir", dir, "--platform", platform], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, out };
  } catch (error) {
    return { code: error.status ?? 1, out: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
}

function expect(name, condition, detail) {
  if (condition) {
    console.log(`  ok   ${name}`);
    return;
  }
  failures.push(name);
  console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
}

fs.rmSync(scratch, { recursive: true, force: true });

console.log("check-release-artifact-magic: fixtures");

// A genuine UDIF image: payload, then the 512-byte trailer ending the file.
// The macos platform also requires an .app bundle, so assert only that the dmg
// itself produced no trailer complaint.
{
  const dir = path.join(scratch, "dmg-ok");
  writeFixture(dir, "App_0.1.0_aarch64.dmg", Buffer.concat([Buffer.alloc(2_000_000, 1), KOLY_TRAILER]));
  const result = runVerifier(dir, "macos");
  expect("real 512-byte trailer at fileSize-512 is accepted", !/koly/.test(result.out), result.out.trim());
}

// The naive fixture that used to pass the wrong check must now be rejected.
{
  const dir = path.join(scratch, "dmg-wrong-offset");
  writeFixture(dir, "App_0.1.0_aarch64.dmg", Buffer.concat([Buffer.alloc(2_000_000), Buffer.from("koly", "ascii")]));
  const result = runVerifier(dir, "macos");
  expect("koly appended at fileSize-4 is rejected", /missing UDIF koly trailer/.test(result.out), result.out.trim());
}

// Trailer present but signature overwritten.
{
  const dir = path.join(scratch, "dmg-bad-signature");
  const trailer = Buffer.alloc(512);
  trailer.write("KOLY", 0, "ascii");
  writeFixture(dir, "App_0.1.0_aarch64.dmg", Buffer.concat([Buffer.alloc(2_000_000), trailer]));
  const result = runVerifier(dir, "macos");
  expect("wrong signature in the trailer is rejected", /missing UDIF koly trailer/.test(result.out), result.out.trim());
}

// File too short to hold a trailer at all.
{
  const dir = path.join(scratch, "dmg-too-small");
  writeFixture(dir, "App_0.1.0_aarch64.dmg", Buffer.alloc(100));
  const result = runVerifier(dir, "macos");
  expect("a file under 512 bytes is rejected", /too small|only \d+ bytes/.test(result.out), result.out.trim());
}

if (failures.length > 0) {
  console.error(`check-release-artifact-magic: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log("check-release-artifact-magic ok: the dmg trailer check reads the UDIF trailer, not the last four bytes.");
