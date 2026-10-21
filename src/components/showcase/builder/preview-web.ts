export type PreviewWebResult = {
  index_path: string;
  dist_dir: string;
  log: string;
};

export type ToolchainProbeResult = {
  node: boolean;
  npm: boolean;
  cargo: boolean;
  rustc: boolean;
  node_version: string;
  npm_version: string;
  cargo_version: string;
  rustc_version: string;
  missing: string[];
};

export async function previewGeneratedWebViaTauri<T>(
  invoke: (cmd: string, args: Record<string, unknown>) => Promise<T | null>,
  project: unknown,
  rustLogic: string,
): Promise<PreviewWebResult | null> {
  return (await invoke("preview_generated_web", { project, rustLogic })) as PreviewWebResult | null;
}

export async function probeToolchain<T>(
  invoke: (cmd: string, args: Record<string, unknown>) => Promise<T | null>,
): Promise<ToolchainProbeResult | null> {
  return (await invoke("check_toolchain", {})) as ToolchainProbeResult | null;
}
