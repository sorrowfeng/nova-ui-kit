#!/usr/bin/env node
// docs:site — build a static docs site from docs/*.md into docs-site/
// Usage: npm run docs:site
//
// Search covers full page text (not just nav titles) and highlights hits
// both in the result list and in the page body (P1-5).

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs");
const outDir = path.join(root, "docs-site");

/** Escape text for safe HTML interpolation. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

/** Plain-text projection of the rendered HTML, used to build the search index. */
function htmlToPlainText(html) {
  return html
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ") // drop code blocks from snippets
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function page({ title, body, nav, href, searchText }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(title)} · Nova Docs</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; font: 15px/1.65 "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; color:#2a2438; background:#f7f5fb; }
  .layout { display:flex; min-height:100vh; }
  nav { width:260px; flex-shrink:0; padding:24px 16px; border-right:1px solid #e4dfe9; background:#fff; position:sticky; top:0; height:100vh; overflow:auto; }
  nav a { display:block; padding:6px 10px; border-radius:8px; color:#2a2438; text-decoration:none; font-size:13px; }
  nav a:hover, nav a.active { background:#eee6f7; color:#5b3fa8; }
  main { flex:1; padding:32px 40px; max-width:860px; min-width:0; }
  h1 { font-size:1.75rem; margin:0 0 1rem; }
  h2 { font-size:1.25rem; margin:1.75rem 0 0.75rem; border-bottom:1px solid #e4dfe9; padding-bottom:0.35rem; }
  h3 { font-size:1.05rem; margin:1.25rem 0 0.5rem; }
  code { background:#ebe4f4; padding:1px 6px; border-radius:4px; font-size:0.9em; }
  pre { background:#1e1b26; color:#e8e4f0; padding:14px 16px; border-radius:10px; overflow:auto; }
  pre code { background:transparent; color:inherit; padding:0; }
  a { color:#5b3fa8; }
  .search { width:100%; margin-bottom:12px; padding:8px 12px; border-radius:10px; border:1px solid #d5cce0; background:#fff; }
  .search-results { margin:0 0 16px; padding:0; list-style:none; max-height:280px; overflow:auto; }
  .search-results li { margin:0 0 6px; }
  .search-results a { display:block; padding:8px 10px; border-radius:8px; background:#f3eefb; text-decoration:none; color:#2a2438; }
  .search-results a:hover { background:#e9defa; }
  .search-results .hit-title { font-weight:600; font-size:13px; color:#5b3fa8; }
  .search-results .hit-snippet { font-size:12px; color:#5b5266; margin-top:3px; line-height:1.5; }
  .search-empty { font-size:12px; color:#7a7188; padding:6px 10px; }
  mark { background:#ffe08a; color:inherit; padding:0 2px; border-radius:3px; }
  main mark.hit { background:#ffd24d; }
  .hit-count { font-size:12px; color:#7a7188; margin:0 0 16px; }
  @media (prefers-color-scheme: dark) {
    body { background:#16141c; color:#e8e4f0; }
    nav { background:#1e1b26; border-color:#332e3d; }
    nav a:hover, nav a.active { background:#2d2740; color:#c4b0ff; }
    code { background:#2d2740; }
    .search { background:#1e1b26; border-color:#332e3d; color:#e8e4f0; }
    .search-results a { background:#2d2740; color:#e8e4f0; }
    .search-results a:hover { background:#3a3350; }
    .search-results .hit-title { color:#c4b0ff; }
    .search-results .hit-snippet { color:#b7aec6; }
    .search-empty, .hit-count { color:#9a91a8; }
    mark, main mark.hit { background:#8a6d1f; color:#fff; }
  }
</style>
</head>
<body>
<div class="layout">
<nav>
  <div style="font-weight:600;margin-bottom:12px;">Nova Docs</div>
  <input class="search" id="q" placeholder="搜索全文内容…" aria-label="搜索文档全文" autocomplete="off"/>
  <div id="search-status" class="hit-count" aria-live="polite"></div>
  <ul class="search-results" id="search-results" hidden></ul>
  <div id="nav-links">
  ${nav}
  </div>
</nav>
<main id="content">
${body}
</main>
</div>
<script>
(function () {
  var INDEX = ${searchText};
  var q = document.getElementById("q");
  var resultsEl = document.getElementById("search-results");
  var statusEl = document.getElementById("search-status");
  var contentEl = document.getElementById("content");

  function escapeRegExp(value) {
    return value.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&");
  }

  function markHtml(text, terms) {
    if (!terms.length) return escapeHtml(text);
    var pattern = new RegExp("(" + terms.map(escapeRegExp).join("|") + ")", "gi");
    return escapeHtml(text).replace(pattern, "<mark>$1</mark>");
  }

  function snippet(text, terms) {
    if (!terms.length) return text.slice(0, 140);
    var lower = text.toLowerCase();
    var at = -1;
    for (var i = 0; i < terms.length && at < 0; i += 1) at = lower.indexOf(terms[i].toLowerCase());
    if (at < 0) return text.slice(0, 140);
    var start = Math.max(0, at - 50);
    return (start > 0 ? "…" : "") + text.slice(start, start + 160);
  }

  function termsFor(value) {
    return value.toLowerCase().split(/\\s+/).filter(Boolean);
  }

  function search(value) {
    var terms = termsFor(value);
    if (!terms.length) {
      resultsEl.hidden = true;
      resultsEl.innerHTML = "";
      statusEl.textContent = "";
      filterNav("");
      return;
    }
    var hits = [];
    INDEX.forEach(function (entry) {
      var titleLower = entry.title.toLowerCase();
      var textLower = entry.text.toLowerCase();
      var score = 0;
      var matchedAll = true;
      terms.forEach(function (term) {
        var inTitle = titleLower.indexOf(term) >= 0;
        var inText = textLower.indexOf(term) >= 0;
        if (!inTitle && !inText) matchedAll = false;
        if (inTitle) score += 6;
        if (inText) score += 1;
      });
      if (matchedAll) hits.push({ entry: entry, score: score });
    });
    hits.sort(function (a, b) { return b.score - a.score || a.entry.title.localeCompare(b.entry.title); });

    statusEl.textContent = hits.length ? hits.length + " 条匹配" : "无匹配";
    resultsEl.hidden = false;
    resultsEl.innerHTML = hits.length
      ? hits.slice(0, 20).map(function (hit) {
          return (
            '<li><a href="' + hit.entry.href + '?q=' + encodeURIComponent(value) + '">' +
            '<div class="hit-title">' + markHtml(hit.entry.title, terms) + "</div>" +
            '<div class="hit-snippet">' + markHtml(snippet(hit.entry.text, terms), terms) + "</div>" +
            "</a></li>"
          );
        }).join("")
      : '<li class="search-empty">没有包含全部关键词的文档。可尝试更短的关键词。</li>';
  }

  function filterNav(value) {
    var v = value.toLowerCase();
    document.querySelectorAll("#nav-links a").forEach(function (a) {
      var title = a.textContent.toLowerCase();
      var entry = INDEX.filter(function (item) { return item.href === a.getAttribute("href"); })[0];
      var inBody = entry && entry.text.toLowerCase().indexOf(v) >= 0;
      a.style.display = !v || title.indexOf(v) >= 0 || inBody ? "" : "none";
    });
  }

  function highlightPage(value) {
    var terms = termsFor(value);
    if (!terms.length) return 0;
    var walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        var tag = parent.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "MARK") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var count = 0;
    var pattern = new RegExp("(" + terms.map(escapeRegExp).join("|") + ")", "gi");
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      if (text.search(pattern) < 0) return;
      var frag = document.createDocumentFragment();
      var last = 0;
      var match;
      while ((match = pattern.exec(text)) !== null) {
        if (match.index > last) frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        var mark = document.createElement("mark");
        mark.className = "hit";
        mark.textContent = match[0];
        frag.appendChild(mark);
        count += 1;
        last = match.index + match[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      if (node.parentNode) node.parentNode.replaceChild(frag, node);
    });
    return count;
  }

  q.addEventListener("input", function () {
    search(q.value);
    filterNav(q.value);
  });

  var params = new URLSearchParams(window.location.search);
  var initial = params.get("q") || "";
  if (initial) {
    q.value = initial;
    search(initial);
    filterNav(initial);
    var marked = highlightPage(initial);
    if (marked) statusEl.textContent = statusEl.textContent + " · 本页高亮 " + marked + " 处";
    var first = contentEl.querySelector("mark.hit");
    if (first && first.scrollIntoView) first.scrollIntoView({ block: "center" });
  }
})();
</script>
</body>
</html>`;
}

// Collect markdown files
const mdFiles = fs.readdirSync(docsDir).filter((n) => n.endsWith(".md")).sort();

const pages = mdFiles.map((name) => {
  const md = fs.readFileSync(path.join(docsDir, name), "utf8");
  const title = name.replace(/\.md$/, "");
  const body = mdToHtml(md);
  return {
    name,
    title: title === "README" ? "首页" : title,
    href: name === "README.md" ? "index.html" : `${title}.html`,
    body,
    text: htmlToPlainText(body),
  };
});

const nav = pages
  .map((pageEntry) => {
    const active = pageEntry.name === "README.md";
    return `<a href="${pageEntry.href}" class="${active ? "active" : ""}">${escapeHtml(pageEntry.title)}</a>`;
  })
  .join("\n  ");

const searchText = pages.map((pageEntry) => ({
  title: pageEntry.title,
  href: pageEntry.href,
  text: pageEntry.text.slice(0, 4000),
}));

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const pageEntry of pages) {
  const html = page({
    title: pageEntry.title,
    body: pageEntry.body,
    nav,
    href: pageEntry.href,
    searchText: JSON.stringify(searchText).replace(/</g, "\\u003c"),
  });
  fs.writeFileSync(path.join(outDir, pageEntry.href), html);
}

console.log(`docs:site built ${pages.length} pages -> docs-site/ (full-text search index embedded)`);
