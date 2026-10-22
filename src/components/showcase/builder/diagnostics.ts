import type { BuildDiagnostic, GeneratedRustSourceMap } from "./types";

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeDiagnosticPath(path = "") {
  return path.replace(/\\/g, "/").replace(/\/+/g, "/").toLowerCase();
}

function diagnosticPathMatches(diagnosticPath: string | undefined, mappedPath: string) {
  if (!diagnosticPath || !mappedPath) {
    return false;
  }
  const diagnostic = normalizeDiagnosticPath(diagnosticPath);
  const mapped = normalizeDiagnosticPath(mappedPath);
  return diagnostic === mapped || mapped.endsWith(`/${diagnostic}`);
}

export function normalizeGeneratedRustSourceMap(value: unknown): GeneratedRustSourceMap | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const source = value as Partial<GeneratedRustSourceMap>;
  const entries = Array.isArray(source.entries)
    ? source.entries
        .map((entry): GeneratedRustSourceMap["entries"][number] | null => {
          if (!entry || typeof entry !== "object") {
            return null;
          }
          const raw = entry as Partial<GeneratedRustSourceMap["entries"][number]>;
          if (typeof raw.source_path !== "string" || typeof raw.generated_path !== "string") {
            return null;
          }
          return {
            id: typeof raw.id === "string" && raw.id.trim() ? raw.id : `${raw.kind || "rust"}-${raw.generated_path}`,
            kind: typeof raw.kind === "string" && raw.kind.trim() ? raw.kind : "rust",
            source_path: raw.source_path,
            generated_path: raw.generated_path,
            source_start_line: Number(raw.source_start_line) || 1,
            source_end_line: Number(raw.source_end_line) || Number(raw.line_count) || 1,
            generated_start_line: Number(raw.generated_start_line) || 1,
            generated_end_line: Number(raw.generated_end_line) || Number(raw.line_count) || 1,
            line_offset: Number(raw.line_offset) || 0,
            line_count: Number(raw.line_count) || 1,
            summary: typeof raw.summary === "string" ? raw.summary : "",
          };
        })
        .filter((entry): entry is GeneratedRustSourceMap["entries"][number] => Boolean(entry))
    : [];
  if (entries.length === 0) {
    return null;
  }
  return {
    schema: typeof source.schema === "string" ? source.schema : "nova.rustSourceMap.v1",
    project_name: typeof source.project_name === "string" ? source.project_name : "",
    root_path: typeof source.root_path === "string" ? source.root_path : "",
    rust_logic_path: typeof source.rust_logic_path === "string" ? source.rust_logic_path : "",
    generated_lib_path: typeof source.generated_lib_path === "string" ? source.generated_lib_path : "",
    source_map_path: typeof source.source_map_path === "string" ? source.source_map_path : "",
    generated_source_map_path: typeof source.generated_source_map_path === "string" ? source.generated_source_map_path : "",
    entries,
  };
}

export function parseRustSourceMapFromLog(log = ""): GeneratedRustSourceMap | null {
  const matches = [...log.matchAll(/^NOVA_RUST_SOURCE_MAP_JSON=(.+)$/gm)];
  for (const match of matches.reverse()) {
    try {
      const parsed = JSON.parse(match[1]);
      const normalized = normalizeGeneratedRustSourceMap(parsed);
      if (normalized) {
        return normalized;
      }
    } catch {
      // Ignore stale or truncated source-map log lines.
    }
  }
  return null;
}

function mapBuildDiagnosticToSource(diagnostic: BuildDiagnostic, sourceMap: GeneratedRustSourceMap | null): BuildDiagnostic {
  if (!sourceMap || !diagnostic.line) {
    return diagnostic;
  }

  const generatedEntry = sourceMap.entries.find((entry) => {
    if (!diagnosticPathMatches(diagnostic.file, entry.generated_path)) {
      return false;
    }
    return diagnostic.line! >= entry.generated_start_line && diagnostic.line! <= entry.generated_end_line;
  });
  if (generatedEntry) {
    const sourceLine = diagnostic.line - generatedEntry.line_offset;
    return {
      ...diagnostic,
      sourceFile: generatedEntry.source_path,
      sourceLine,
      sourceColumn: diagnostic.column,
      sourceKind: generatedEntry.kind,
      sourceSummary: generatedEntry.summary,
      mappedToSource: sourceLine >= generatedEntry.source_start_line && sourceLine <= generatedEntry.source_end_line,
      sourceMapId: generatedEntry.id,
    };
  }

  const sourceEntry = sourceMap.entries.find((entry) => {
    if (!diagnosticPathMatches(diagnostic.file, entry.source_path)) {
      return false;
    }
    return diagnostic.line! >= entry.source_start_line && diagnostic.line! <= entry.source_end_line;
  });
  if (sourceEntry) {
    return {
      ...diagnostic,
      sourceFile: sourceEntry.source_path,
      sourceLine: diagnostic.line,
      sourceColumn: diagnostic.column,
      sourceKind: sourceEntry.kind,
      sourceSummary: sourceEntry.summary,
      mappedToSource: true,
      sourceMapId: sourceEntry.id,
    };
  }

  return diagnostic;
}

function stringFromRecord(value: Record<string, unknown>, key: string) {
  const nextValue = value[key];
  return typeof nextValue === "string" ? nextValue : undefined;
}

function numberFromRecord(value: Record<string, unknown>, key: string) {
  const nextValue = value[key];
  return typeof nextValue === "number" && Number.isFinite(nextValue) ? nextValue : undefined;
}

function parseCargoJsonDiagnostics(log = "", sourceMap: GeneratedRustSourceMap | null): BuildDiagnostic[] {
  const diagnostics: BuildDiagnostic[] = [];
  for (const rawLine of log.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line.startsWith("{") || !line.endsWith("}")) {
      continue;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(line);
    } catch {
      continue;
    }
    if (!isPlainRecord(payload) || payload.reason !== "compiler-message" || !isPlainRecord(payload.message)) {
      continue;
    }

    const message = payload.message;
    const level = stringFromRecord(message, "level")?.toLowerCase();
    if (level !== "error" && level !== "warning") {
      continue;
    }
    const spans = Array.isArray(message.spans) ? message.spans.filter(isPlainRecord) : [];
    const primarySpan = spans.find((span) => span.is_primary === true) ?? spans[0];
    const codeRecord = isPlainRecord(message.code) ? message.code : null;
    const diagnostic: BuildDiagnostic = {
      severity: level,
      message: stringFromRecord(message, "message") ?? "Cargo 诊断",
      code: codeRecord ? stringFromRecord(codeRecord, "code") : undefined,
      file: primarySpan ? stringFromRecord(primarySpan, "file_name") : undefined,
      line: primarySpan ? numberFromRecord(primarySpan, "line_start") : undefined,
      column: primarySpan ? numberFromRecord(primarySpan, "column_start") : undefined,
      lineEnd: primarySpan ? numberFromRecord(primarySpan, "line_end") : undefined,
      columnEnd: primarySpan ? numberFromRecord(primarySpan, "column_end") : undefined,
      rendered: stringFromRecord(message, "rendered"),
      origin: "cargo-json",
    };
    diagnostics.push(mapBuildDiagnosticToSource(diagnostic, sourceMap));
  }
  return diagnostics;
}

export function parseBuildDiagnostics(log = "", sourceMap: GeneratedRustSourceMap | null = parseRustSourceMapFromLog(log)): BuildDiagnostic[] {
  const lines = log.split(/\r?\n/);
  const diagnostics: BuildDiagnostic[] = parseCargoJsonDiagnostics(log, sourceMap);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trimEnd();
    const errorMatch = line.match(/^(error(?:\[[^\]]+\])?|warning):\s*(.+)$/i);
    if (!errorMatch) {
      continue;
    }

    const locationLine = lines.slice(index + 1, index + 6).find((candidate) => candidate.trimStart().startsWith("-->"));
    const locationMatch = locationLine?.match(/-->\s+(.+?):(\d+):(\d+)/);

    diagnostics.push(
      mapBuildDiagnosticToSource(
        {
          severity: errorMatch[1].toLowerCase().startsWith("warning") ? "warning" : "error",
          message: errorMatch[2],
          file: locationMatch?.[1],
          line: locationMatch ? Number(locationMatch[2]) : undefined,
          column: locationMatch ? Number(locationMatch[3]) : undefined,
          origin: "rustc-text",
        },
        sourceMap,
      ),
    );
  }

  return diagnostics;
}

function textLineCount(value: string) {
  return value.length === 0 ? 1 : value.split(/\r?\n/).length;
}

export function isEditableRustDiagnostic(diagnostic: BuildDiagnostic) {
  if (diagnostic.mappedToSource && diagnostic.sourceLine) {
    return true;
  }
  if (!diagnostic.line) {
    return false;
  }
  if (!diagnostic.file) {
    return true;
  }
  const file = diagnostic.file.replace(/\\/g, "/").toLowerCase();
  return file.endsWith("/src/lib.rs") || file.endsWith("src/lib.rs") || file.endsWith("/rust/logic.rs") || file.endsWith("logic.rs");
}

export function rustDiagnosticSourceLocation(diagnostic: BuildDiagnostic, rustLogic: string) {
  if (diagnostic.mappedToSource && diagnostic.sourceLine) {
    const rustLineCount = textLineCount(rustLogic);
    const sourceLine = Math.min(Math.max(1, diagnostic.sourceLine), rustLineCount);
    return {
      sourceLine,
      column: diagnostic.sourceColumn ?? diagnostic.column ?? 1,
      mappedToSource: sourceLine === diagnostic.sourceLine,
    };
  }

  if (!isEditableRustDiagnostic(diagnostic) || !diagnostic.line) {
    return null;
  }

  const rustLineCount = textLineCount(rustLogic);
  const sourceLine = Math.min(Math.max(1, diagnostic.line), rustLineCount);
  return {
    sourceLine,
    column: diagnostic.line <= rustLineCount ? diagnostic.column ?? 1 : 1,
    mappedToSource: diagnostic.line <= rustLineCount,
  };
}
