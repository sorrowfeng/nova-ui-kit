#!/usr/bin/env node
// docs:site — build a static docs site from docs/*.md into docs-site/
// Usage: npm run docs:site

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs");
const outDir = path.join(root, "docs-site");

function mdToHtml(md) {
  let html = md;
  // headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  // bold / code
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)(\n(?!<li>))/g, "<ul>$1</ul>$2");
  // paragraphs
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      if (/^<(h\d|ul|pre|blockquote)/.test(block.trim())) return block;
      return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");
  return html;
}

function page(title, body, nav) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title} · Nova Docs</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; font: 15px/1.65 "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; color:#2a2438; background:#f7f5fb; }
  .layout { display:flex; min-height:100vh; }
  nav { width:240px; flex-shrink:0; padding:24px 16px; border-right:1px solid #e4dfe9; background:#fff; position:sticky; top:0; height:100vh; overflow:auto; }
  nav a { display:block; padding:6px 10px; border-radius:8px; color:#2a2438; text-decoration:none; font-size:13px; }
  nav a:hover, nav a.active { background:#eee6f7; color:#5b3fa8; }
  main { flex:1; padding:32px 40px; max-width:860px; }
  h1 { font-size:1.75rem; margin:0 0 1rem; }
  h2 { font-size:1.25rem; margin:1.75rem 0 0.75rem; border-bottom:1px solid #e4dfe9; padding-bottom:0.35rem; }
  h3 { font-size:1.05rem; margin:1.25rem 0 0.5rem; }
  code { background:#ebe4f4; padding:1px 6px; border-radius:4px; font-size:0.9em; }
  pre { background:#1e1b26; color:#e8e4f0; padding:14px 16px; border-radius:10px; overflow:auto; }
  pre code { background:transparent; color:inherit; padding:0; }
  a { color:#5b3fa8; }
  .search { width:100%; margin-bottom:16px; padding:8px 12px; border-radius:10px; border:1px solid #d5cce0; background:#fff; }
  @media (prefers-color-scheme: dark) {
    body { background:#16141c; color:#e8e4f0; }
    nav { background:#1e1b26; border-color:#332e3d; }
    nav a:hover, nav a.active { background:#2d2740; color:#c4b0ff; }
    code { background:#2d2740; }
    .search { background:#1e1b26; border-color:#332e3d; color:#e8e4f0; }
  }
</style>
</head>
<body>
<div class="layout">
<nav>
  <div style="font-weight:600;margin-bottom:12px;">Nova Docs</div>
  <input class="search" id="q" placeholder="搜索文档…" aria-label="搜索文档"/>
  <div id="nav-links">
  ${nav}
  </div>
</nav>
<main>
${body}
</main>
</div>
<script>
  const q = document.getElementById("q");
  q.addEventListener("input", () => {
    const v = q.value.toLowerCase();
    document.querySelectorAll("#nav-links a").forEach((a) => {
      a.style.display = !v || a.textContent.toLowerCase().includes(v) ? "" : "none";
    });
  });
</script>
</body>
</html>`;
}

// Collect markdown files
const mdFiles = fs.readdirSync(docsDir).filter((n) => n.endsWith(".md")).sort();
const nav = mdFiles
  .map((name) => {
    const title = name.replace(/\.md$/, "");
    const active = name === "README.md";
    const href = name === "README.md" ? "index.html" : `${title}.html`;
    return `<a href="${href}" class="${active ? "active" : ""}">${title === "README" ? "首页" : title}</a>`;
  })
  .join("\n  ");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const name of mdFiles) {
  const md = fs.readFileSync(path.join(docsDir, name), "utf8");
  const title = name.replace(/\.md$/, "");
  const body = mdToHtml(md);
  const outName = name === "README.md" ? "index.html" : `${title}.html`;
  fs.writeFileSync(path.join(outDir, outName), page(title === "README" ? "首页" : title, body, nav));
}

console.log(`docs:site built ${mdFiles.length} pages -> docs-site/`);
