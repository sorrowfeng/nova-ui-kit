// verify-release-artifacts — P2-12. Bundle directories have to be checked on
// the host that produced them; this script is what "verified" means. It
// asserts the expected artifact kinds exist, are non-empty, and start (or end)
// with the bytes that format should have, then writes SHA256SUMS.txt so a
// release can be checked after download too.
//
// Usage:
//   node scripts/verify-release-artifacts.mjs --dir <bundle-dir> --platform <linux|macos|windows>
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const EXPECTED = {
  linux: {
    label: "Linux bundles",
    kinds: [
      { ext: ".deb", minBytes: 1_000_000, describe: "Debian package" },
      { ext: ".AppImage", minBytes: 1_000_000, describe: "AppImage" },
    ],
  },
  macos: {
    label: "macOS bundle",
    kinds: [
      { ext: ".dmg", minBytes: 1_000_000, describe: "disk image" },
    ],
    // `.app` is a directory bundle, checked separately.
    requireAppBundle: true,
  },
  windows: {
    label: "Windows exe",
    kinds: [{ ext: ".exe", minBytes: 1_000_000, describe: "executable" }],
  },
};

const DMG_TRAILER = Buffer.from("koly", "ascii");

function parseArgs(argv) {
  const args = { dir: null, platform: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--dir") args.dir = argv[i + 1];
    else if (argv[i] === "--platform") args.platform = argv[i + 1];
    else if (argv[i] === "--help" || argv[i] === "-h") args.help = true;
  }
  return args;
}

function fail(message) {
  console.error(`verify-release-artifacts: ${message}`);
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function headBytes(file, count) {
  const fd = fs.openSync(file, "r");
  try {
    const buffer = Buffer.alloc(count);
    const read = fs.readSync(fd, buffer, 0, count, 0);
    return buffer.subarray(0, read);
  } finally {
    fs.closeSync(fd);
  }
}

function tailBytes(file, count, fileSize) {
  const fd = fs.openSync(file, "r");
  try {
    const buffer = Buffer.alloc(count);
    const read = fs.readSync(fd, buffer, 0, count, Math.max(0, fileSize - count));
    return buffer.subarray(0, read);
  } finally {
    fs.closeSync(fd);
  }
}

function checkMagic(file, ext, size) {
  if (ext === ".exe") {
    return headBytes(file, 2).toString("ascii") === "MZ" ? null : "missing MZ header";
  }
  if (ext === ".deb") {
    return headBytes(file, 8).toString("ascii") === "!<arch>\n" ? null : "missing ar archive header";
  }
  if (ext === ".AppImage") {
    return headBytes(file, 4).equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46])) ? null : "missing ELF header";
  }
  if (ext === ".dmg") {
    return tailBytes(file, 4, size).equals(DMG_TRAILER) ? null : "missing UDIF koly trailer";
  }
  return null;
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function checkAppBundle(dir) {
  const apps = walk(dir).filter((p) => p.endsWith(".app") || p.includes(".app/"));
  const roots = fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && e.name.endsWith(".app"))
    : [];
  const problems = [];
  for (const root of roots) {
    const appDir = path.join(dir, root.name);
    if (!fs.existsSync(path.join(appDir, "Contents", "Info.plist"))) {
      problems.push(`${root.name}: missing Contents/Info.plist`);
    }
    const macosDir = path.join(appDir, "Contents", "MacOS");
    if (!fs.existsSync(macosDir) || fs.readdirSync(macosDir).length === 0) {
      problems.push(`${root.name}: missing Contents/MacOS binary`);
    }
  }
  return { apps: roots.map((r) => r.name), problems };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.dir || !args.platform) {
    console.log("usage: node scripts/verify-release-artifacts.mjs --dir <bundle-dir> --platform <linux|macos|windows>");
    process.exit(args.help ? 0 : 1);
  }

  const spec = EXPECTED[args.platform];
  if (!spec) fail(`unknown platform "${args.platform}" (expected linux, macos or windows)`);

  const dir = path.resolve(args.dir);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) fail(`not a directory: ${dir}`);

  const files = walk(dir).filter((file) => !path.basename(file).startsWith("SHA256SUMS"));
  const problems = [];
  const verified = [];

  for (const kind of spec.kinds) {
    const matches = files.filter((file) => file.endsWith(kind.ext));
    if (matches.length === 0) {
      problems.push(`no ${kind.describe} (${kind.ext}) produced under ${dir}`);
      continue;
    }
    for (const file of matches) {
      const size = fs.statSync(file).size;
      const rel = path.relative(dir, file).replace(/\\/g, "/");
      if (size < kind.minBytes) {
        problems.push(`${rel}: only ${size} bytes, expected at least ${kind.minBytes}`);
        continue;
      }
      const magic = checkMagic(file, kind.ext, size);
      if (magic) {
        problems.push(`${rel}: ${magic}`);
        continue;
      }
      verified.push({ rel, size, sha256: sha256(file) });
    }
  }

  if (spec.requireAppBundle) {
    const { apps, problems: appProblems } = checkAppBundle(dir);
    problems.push(...appProblems);
    for (const app of apps) verified.push({ rel: app, size: 0, sha256: "-", note: "directory bundle" });
    if (apps.length === 0) problems.push(`no .app bundle produced under ${dir}`);
  }

  if (problems.length > 0) {
    console.error(`verify-release-artifacts: ${spec.label} failed`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  const sums = verified.map((entry) => `${entry.sha256}  ${path.basename(entry.rel)}`).join("\n") + "\n";
  fs.writeFileSync(path.join(dir, "SHA256SUMS.txt"), sums);

  console.log(`verify-release-artifacts ok: ${spec.label} (${verified.length} artifact${verified.length === 1 ? "" : "s"})`);
  for (const entry of verified) {
    const size = entry.size ? `${(entry.size / 1024 / 1024).toFixed(1)} MB` : "dir";
    console.log(`  ${entry.rel}  ${size}  ${entry.sha256 === "-" ? entry.note : entry.sha256.slice(0, 16) + "…"}`);
  }
}

main();
