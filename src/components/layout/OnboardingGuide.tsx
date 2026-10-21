import { useEffect, useState } from "react";
import { ArrowRight, Keyboard, MousePointer2, Play, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nova-onboarding-done";

export function isOnboardingCompleted() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function resetOnboarding() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

type Step = {
  title: string;
  body: string;
  icon: typeof Sparkles;
  hint: string;
};

const STEPS: Step[] = [
  {
    title: "1 · 新建或打开项目",
    body: "在 Project 模式创建本地项目，或点「打开示例」直接进入带控件与绑定的演示工程。",
    icon: Sparkles,
    hint: "菜单 → 文件 → 新建项目 · 或命令面板 Ctrl+K",
  },
  {
    title: "2 · 在画布插入控件",
    body: "Design 模式从左侧组件库拖放或单击插入。选中后用顶栏选择条对齐、复制、绑定事件。",
    icon: MousePointer2,
    hint: "常用控件一键插入 · 框选 / Ctrl 多选",
  },
  {
    title: "3 · 绑定命令并生成 exe",
    body: "Logic 页写 Rust 命令，把按钮 click 绑到命令；Build 页生成目标应用并产出 Windows 可执行文件。",
    icon: Play,
    hint: "一键预览运行 · 黄金路径见 docs/golden-path.md",
  },
];

export function OnboardingGuide({
  open,
  onOpenChange,
  onOpenSample,
  onShowShortcuts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSample?: () => void;
  onShowShortcuts?: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const last = step === STEPS.length - 1;

  const finish = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    onOpenChange(false);
  };

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-scrim/45 p-4"
      data-builder-onboarding=""
      role="dialog"
      aria-modal="true"
      aria-label="快速上手"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-m3-3">
        <div className="flex items-start justify-between gap-3 px-6 pt-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-primary-container-foreground">
            <Icon aria-hidden className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-on-surface">{current.title}</h2>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">{current.body}</p>
          </div>
          <button
            type="button"
            className="focus-ring flex size-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
            aria-label="跳过引导"
            onClick={finish}
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        <div className="mx-6 mt-4 rounded-2xl border border-outline-variant bg-surface-container px-4 py-3 text-xs text-on-surface-variant">
          {current.hint}
        </div>

        <div className="flex items-center gap-1.5 px-6 pt-4">
          {STEPS.map((s, index) => (
            <span
              key={s.title}
              className={cn("h-1.5 rounded-full transition-all", index === step ? "w-8 bg-primary" : "w-2 bg-outline-variant")}
              aria-hidden
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-6 pb-6 pt-4">
          <div className="flex gap-2">
            {onOpenSample ? (
              <Button size="sm" variant="secondary" onClick={() => { finish(); onOpenSample(); }}>
                打开示例
              </Button>
            ) : null}
            {onShowShortcuts ? (
              <Button size="sm" variant="ghost" onClick={() => { finish(); onShowShortcuts(); }}>
                <Keyboard aria-hidden className="size-4" />
                快捷键
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button size="sm" variant="ghost" onClick={() => setStep((value) => value - 1)}>
                上一步
              </Button>
            ) : null}
            {last ? (
              <Button size="sm" onClick={finish}>
                开始使用
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep((value) => value + 1)}>
                下一步
                <ArrowRight aria-hidden className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
