import fs from "node:fs";
const lines = fs.readFileSync("src/components/showcase/BuilderShowcase.tsx", "utf8").split(/\r?\n/);

// Find the JSX block that renders the canvas context menu
// Starts with {canvasContextMenu ? ( or similar
let start = -1;
for (let i = 53300; i < 53500; i++) {
  if (lines[i].includes("canvasContextMenu ?") || (lines[i].includes("{canvasContextMenu") && lines[i].includes("?"))) {
    start = i;
    break;
  }
}
console.log("start", start + 1, lines[start]?.trim());

// find matching end - look for the ternary close
let depth = 0;
let end = -1;
for (let i = start; i < Math.min(lines.length, start + 900); i++) {
  const opens = (lines[i].match(/\{/g) || []).length;
  const closes = (lines[i].match(/\}/g) || []).length;
  depth += opens - closes;
  if (i > start && depth === 0) {
    end = i;
    break;
  }
}
console.log("end", end + 1, "span", end - start + 1, "lines");
if (start >= 0 && end > start) {
  console.log("first:", lines[start].trim().slice(0, 80));
  console.log("last:", lines[end].trim().slice(0, 80));
}

// Collect identifiers used in the block that need to be props/callbacks
const block = lines.slice(start, end + 1).join("\n");
const ids = new Set();
for (const m of block.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_]{2,})\b/g)) {
  ids.add(m[1]);
}
const skip = new Set([
  "div","span","button","const","true","false","return","null","className","type","role","key","data","builder","aria","label","hidden","min","max","flex","items","justify","gap","text","size","px","py","rounded","border","bg","on","Click","Pointer","Down","Context","Menu","for","map","if","else","String","Number","Boolean","Math","JSON","document","window","event","target","currentTarget","preventDefault","stopPropagation","the","and","for",
]);
const candidates = [...ids].filter((id) => !skip.has(id) && !/^(h|w|p|m|mt|mb|ml|mr|px|py|text|bg|border|rounded|flex|grid|gap|items|justify|overflow|truncate|min|max|font|leading|tracking|shadow|opacity|pointer|cursor|transition|hover|focus|disabled|group|sr|absolute|relative|fixed|sticky|inset|z|top|left|right|bottom|size|space|block|inline|hidden|uppercase|lowercase|capitalize|whitespace|break|align|self|order|col|row|place|content|auto|fr|minmax|span|divide|outline|ring|fill|stroke|object|aspect|table|list|decoration|underline|italic|not|isolate|isolation|will|transform|origin|scale|rotate|translate|skew|filter|backdrop|mix|bg|from|via|to)$/i.test(id));
console.log("\ncandidates", candidates.slice(0, 60).join(", "));
