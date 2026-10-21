import fs from "node:fs";

const path = "scripts/check-builder-runtime-smoke.mjs";
let t = fs.readFileSync(path, "utf8");

const oldSoftWait = `async function softWait(send, expression, label, timeoutMs = 4000) {
  if (SMOKE_MODE === "functional") {
    log(\`skip wait (\${SMOKE_MODE}): \${label}\`);
    return false;
  }
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if (await evaluate(send, expression)) return true;
    } catch {
      // poll
    }
    await delay(200);
  }
  log(\`soft-skip wait: \${label}\`);
  return false;
}`;

const newSoftWait = `async function softWait(send, expression, label, timeoutMs = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if (await evaluate(send, expression)) return true;
    } catch {
      // poll
    }
    await delay(250);
  }
  // Never fail the process; layout/chrome waits are advisory.
  log(\`soft-skip wait: \${label}\`);
  return false;
}`;

if (t.includes(oldSoftWait)) {
  t = t.replace(oldSoftWait, newSoftWait);
  console.log("softWait fixed");
} else {
  // looser replace
  const start = t.indexOf("async function softWait");
  const end = t.indexOf("\n}", start);
  if (start >= 0 && end > start) {
    t = t.slice(0, start) + newSoftWait + t.slice(end + 3);
    console.log("softWait replaced loosely");
  }
}

// softAssert should also not skip in functional mode - it should still run and only not fail
const oldSoftAssert = `async function softAssert(send, expression, label) {
  try {
    const result = await evaluate(send, expression);
    if (result && result.passed) return true;
    if (SMOKE_MODE === "functional") {
      log(\`skip assert (\${SMOKE_MODE}): \${label}\`);
      return false;
    }
    log(\`soft-skip assert: \${label} -> \${result?.detail || "did not pass"}\`);
    return false;
  } catch (error) {
    if (SMOKE_MODE === "functional") {
      log(\`skip assert (\${SMOKE_MODE}): \${label}\`);
      return false;
    }
    log(\`soft-skip assert: \${label} -> \${String(error)}\`);
    return false;
  }
}`;

const newSoftAssert = `async function softAssert(send, expression, label) {
  try {
    const result = await evaluate(send, expression);
    if (result && result.passed) return true;
    log(\`soft-skip assert: \${label} -> \${result?.detail || "did not pass"}\`);
    return false;
  } catch (error) {
    log(\`soft-skip assert: \${label} -> \${String(error)}\`);
    return false;
  }
}`;

if (t.includes(oldSoftAssert)) {
  t = t.replace(oldSoftAssert, newSoftAssert);
  console.log("softAssert fixed");
} else {
  const start = t.indexOf("async function softAssert");
  const end = t.indexOf("\n}", start);
  if (start >= 0 && end > start) {
    t = t.slice(0, start) + newSoftAssert + t.slice(end + 3);
    console.log("softAssert replaced loosely");
  }
}

fs.writeFileSync(path, t);
console.log("done");
