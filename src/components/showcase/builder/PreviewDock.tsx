import { RefreshCw, ExternalLink, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * In-dock live preview of the generated app frontend.
 * Uses Tauri asset protocol URL so the webview can iframe local dist files.
 */
export function PreviewDock({
  previewUrl,
  distDir,
  onRefresh,
  onOpenExternal,
  onGenerate,
  busy,
  autoRefresh,
  onToggleAutoRefresh,
  previewVersion,
}: {
  previewUrl: string | null;
  distDir: string | null;
  onRefresh: () => void;
  onOpenExternal: () => void;
  onGenerate: () => void;
  busy?: boolean;
  autoRefresh?: boolean;
  onToggleAutoRefresh?: () => void;
  previewVersion?: number;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col" data-builder-preview-dock="">
      <div className="flex shrink-0 items-center gap-1.5 border-b border-outline-variant px-2 py-1">
        <MonitorPlay aria-hidden className="size-3.5 text-primary" />
        <span className="text-xs font-semibold text-on-surface">实时预览</span>
        <span className="min-w-0 flex-1 truncate text-[0.62rem] text-on-surface-variant">
          {previewUrl ? (distDir ?? "") : "尚未生成预览，点「生成预览」编译前端（秒级）"}
        </span>
        <Button size="sm" variant="secondary" className="h-7 px-2 text-[0.68rem]" onClick={onGenerate} disabled={busy} data-builder-preview-dock-generate="">
          {busy ? "编译中…" : "生成预览"}
        </Button>
        <Button
          size="icon-sm"
          variant={autoRefresh ? "secondary" : "ghost"}
          className="size-7"
          aria-label="自动刷新"
          title={
            autoRefresh
              ? "自动刷新已开（设计改动约 1.2 秒后重新生成预览）"
              : "自动刷新已关（设计改动后需手动点「生成预览」）"
          }
          data-builder-preview-dock-auto={autoRefresh ? "on" : "off"}
          onClick={onToggleAutoRefresh}
        >
          <RefreshCw aria-hidden className={autoRefresh ? "size-3.5 text-primary" : "size-3.5"} />
        </Button>
        <Button size="icon-sm" variant="ghost" className="size-7" aria-label="重新载入预览" title="重新载入预览（不重新生成）" onClick={onRefresh} disabled={!previewUrl}>
          <RefreshCw aria-hidden className="size-3.5" />
        </Button>
        <Button size="icon-sm" variant="ghost" className="size-7" aria-label="在浏览器打开" title="在浏览器打开" onClick={onOpenExternal} disabled={!previewUrl}>
          <ExternalLink aria-hidden className="size-3.5" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 bg-white">
        {previewUrl ? (
          <iframe
            key={`${previewUrl}#v=${previewVersion ?? 0}`}
            src={previewUrl + (previewVersion ? "#v=" + previewVersion : "")}
            title="生成应用预览"
            className="h-full w-full border-0"
            data-builder-preview-dock-frame=""
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <MonitorPlay aria-hidden className="size-8 text-on-surface-variant" />
            <p className="text-sm text-on-surface-variant">预览会在生成后显示在这里</p>
            <p className="text-xs text-on-surface-variant">改完设计点「生成预览」即可看到效果，比完整构建 exe 快很多</p>
          </div>
        )}
      </div>
    </div>
  );
}
