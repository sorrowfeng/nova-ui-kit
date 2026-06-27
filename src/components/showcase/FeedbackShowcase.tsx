import { useState } from "react";
import { AlertCircle, BellRing, Info, Loader2, MessageSquare, PanelRightOpen, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ComponentStack,
  PreviewCard,
  PreviewGrid,
  ShowcaseSection,
} from "@/components/showcase/ShowcaseScaffold";

export function FeedbackShowcase({ onToast }: { onToast: () => void }) {
  const [progress, setProgress] = useState(68);

  return (
    <ComponentStack>
      <ShowcaseSection
        title="实时预览"
        description="反馈组件用于确认结果、展示细节，并只在工作流需要时打断用户。"
      >
        <PreviewCard title="交互反馈工具行">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onToast}>
              <BellRing aria-hidden />
              显示通知
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MessageSquare aria-hidden />
                  打开对话框
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>发布组件变更？</DialogTitle>
                  <DialogDescription>
                    这会更新本地注册表预览，并把组件标记为已审查。
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
                  4 个文件变更，新增 2 个交互状态，更新 1 个视觉令牌。
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">取消</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={onToast}>发布</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary">
                  <PanelRightOpen aria-hidden />
                  打开抽屉
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>通知中心</SheetTitle>
                  <SheetDescription>最近的组件库检查和审查事件。</SheetDescription>
                </SheetHeader>
                <div className="mt-5 space-y-3">
                  {["令牌同步完成", "深色模式检查就绪", "表格状态已审查"].map((item) => (
                    <div key={item} className="rounded-lg border bg-background p-3">
                      <p className="text-sm font-medium">{item}</p>
                      <p className="mt-1 text-sm text-muted-foreground">刚刚</p>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="显示工具提示">
                  <Info />
                </Button>
              </TooltipTrigger>
              <TooltipContent>小型上下文帮助，不造成布局跳动。</TooltipContent>
            </Tooltip>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost">打开气泡卡片</Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <div className="space-y-2">
                  <p className="text-sm font-medium">气泡详情</p>
                  <p className="text-sm text-muted-foreground">
                    适合轻量检查、快速筛选或上下文元数据。
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </PreviewCard>
      </ShowcaseSection>

      <ShowcaseSection title="变体" description="反馈语气需要明确，但不应该改变整个界面的情绪。">
        <PreviewGrid>
          <PreviewCard title="警告状态">
            <div className="space-y-3">
              <div className="flex gap-3 rounded-lg border bg-background p-3">
                <ShieldCheck aria-hidden className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">注册表检查通过</p>
                  <p className="text-sm text-muted-foreground">所有组件导出均可访问。</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/8 p-3">
                <AlertCircle aria-hidden className="mt-0.5 size-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">校验失败</p>
                  <p className="text-sm text-muted-foreground">发布前必须填写 API 名称。</p>
                </div>
              </div>
            </div>
          </PreviewCard>

          <PreviewCard title="进度">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">构建就绪度</p>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setProgress(Math.max(0, progress - 12))}>
                  降低
                </Button>
                <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 12))}>
                  提高
                </Button>
              </div>
            </div>
          </PreviewCard>
        </PreviewGrid>
      </ShowcaseSection>

      <ShowcaseSection title="状态" description="加载占位能在数据到达前保持布局稳定。">
        <PreviewGrid>
          <PreviewCard title="骨架卡片">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          </PreviewCard>
          <PreviewCard title="忙碌状态">
            <div className="flex items-center gap-3 rounded-lg border bg-background p-4">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Loader2 aria-hidden className="size-4 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-medium">正在保存组件库预设</p>
                <p className="text-sm text-muted-foreground">操作等待期间，控件保持禁用。</p>
              </div>
              <Button className="ml-auto" loading>
                <Save aria-hidden />
                保存中
              </Button>
            </div>
          </PreviewCard>
        </PreviewGrid>
      </ShowcaseSection>
    </ComponentStack>
  );
}
