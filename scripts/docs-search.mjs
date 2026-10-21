#!/usr/bin/env node
// docs:search — lightweight docs site search over docs/*.md
// Usage: node scripts/docs-search.mjs "query"

import fs from "node:fs";
import path from "node:path";

const query = process.argv.slice(2).join(" ").trim().toLowerCase();
if (!query) {
  console.log("Usage: npm run docs:search -- \"keyword\"");
  process.exit(1);
}

const docsDir = path.join(process.cwd(), "docs");
const files = fs.readdirSync(docsDir).filter((n) => n.endsWith(".md"));
const results = [];

for (const name of files) {
  const text = fs.readFileSync(path.join(docsDir, name), "utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (line.toLowerCase().includes(query)) {
      results.push({ file: `docs/${name}`, line: i + 1, text: line.trim().slice(0, 120) });
    }
  });
}

if (results.length === 0) {
  console.log(`No matches for "${query}"`);
  process.exit(0);
}
console.log(`${results.length} match(es) for "${query}":\n`);
for (const r of results.slice(0, 30)) {
  console.log(`${r.file}:${r.line}  ${r.text}`);
}
