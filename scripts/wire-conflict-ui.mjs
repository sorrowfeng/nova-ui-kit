import fs from "node:fs";

const bs = "src/components/showcase/BuilderShowcase.tsx";
let t = fs.readFileSync(bs, "utf8");

if (!t.includes("ConflictMergeEditor")) {
  t = t.replace(
    'import { ProjectHealthPanel } from "./builder/ProjectHealthPanel";',
    'import { ProjectHealthPanel } from "./builder/ProjectHealthPanel";\nimport { ConflictMergeEditor, type ConflictFile } from "./builder/ConflictMergeEditor";',
  );

  t = t.replace(
    "  const [projectGitStatus, setProjectGitStatus] = useState<{ clean: boolean; conflicted: string[]; changed: string[] } | null>(null);",
    `  const [projectGitStatus, setProjectGitStatus] = useState<{ clean: boolean; conflicted: string[]; changed: string[] } | null>(null);
  const [conflictFile, setConflictFile] = useState<ConflictFile | null>(null);`,
  );

  // Replace git status conflicted list with clickable buttons
  t = t.replace(
    `                {gitStatus.conflicted.map((file) => (
                  <li key={file} className="truncate text-destructive">
                    {file}
                  </li>
                ))}`,
    `                {gitStatus.conflicted.map((file) => (
                  <li key={file}>
                    <button
                      type="button"
                      className="focus-ring truncate text-destructive hover:underline"
                      data-builder-open-conflict={file}
                      onClick={() => {
                        void invokeIfAvailable<ConflictFile>("read_git_conflict", {
                          rootPath: activeProject.rootPath ?? "",
                          filePath: file,
                        }).then((result) => {
                          if (result) setConflictFile(result);
                        });
                      }}
                    >
                      {file}
                    </button>
                  </li>
                ))}`,
  );

  // Render ConflictMergeEditor near OnboardingGuide / ToolchainBanner
  if (!t.includes("<ConflictMergeEditor")) {
    t = t.replace(
      "<ToolchainBanner status={toolchainStatus} />",
      `<ToolchainBanner status={toolchainStatus} />
              {conflictFile ? (
                <ConflictMergeEditor
                  file={conflictFile}
                  onClose={() => setConflictFile(null)}
                  onResolve={(resolution) => {
                    void invokeIfAvailable<string>("resolve_git_conflict", {
                      rootPath: activeProject.rootPath ?? "",
                      filePath: conflictFile.path,
                      resolution,
                    }).then(() => {
                      setConflictFile(null);
                      void invokeIfAvailable<{ clean: boolean; conflicted: string[]; changed: string[] }>(
                        "git_project_status",
                        { rootPath: activeProject.rootPath ?? "" },
                      ).then(setProjectGitStatus);
                      showProjectJumpFeedback("success", "冲突已解决", conflictFile.path);
                    });
                  }}
                />
              ) : null}`,
    );
    console.log("conflict editor mounted");
  }

  fs.writeFileSync(bs, t);
  console.log("conflict merge wired");
}
