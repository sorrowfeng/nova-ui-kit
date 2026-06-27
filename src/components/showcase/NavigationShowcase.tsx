import { useState } from "react";
import { Check, ChevronRight, Command, FileText, MoreHorizontal, PanelsTopLeft, Pin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ComponentStack,
  PreviewCard,
  PreviewGrid,
  ShowcaseSection,
} from "@/components/showcase/ShowcaseScaffold";
import { cn } from "@/lib/utils";

const navRows = ["概览", "组件", "令牌", "更新记录"];

export function NavigationShowcase({ onOpenCommand }: { onOpenCommand: () => void }) {
  const [activeRow, setActiveRow] = useState("组件");
  const [starred, setStarred] = useState(true);
  const [pinned, setPinned] = useState(false);

  return (
    <ComponentStack>
      <ShowcaseSection
        title="实时预览"
        description="导航模式应帮助用户快速移动，同时不抢占工作区注意力。"
      >
        <PreviewCard title="工作区导航组合" bodyClassName="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink>Nova</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>组件库</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>导航</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Tabs defaultValue="preview">
              <TabsList>
                <TabsTrigger value="preview">预览</TabsTrigger>
                <TabsTrigger value="props">属性</TabsTrigger>
                <TabsTrigger value="a11y">无障碍</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">预览标签</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  标签页切换面板内容，同时保持键盘焦点结构。
                </p>
              </TabsContent>
              <TabsContent value="props" className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">属性标签</p>
                <p className="mt-1 text-sm text-muted-foreground">记录尺寸、变体、状态和组合 API。</p>
              </TabsContent>
              <TabsContent value="a11y" className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">无障碍标签</p>
                <p className="mt-1 text-sm text-muted-foreground">Radix 负责游走焦点和 ARIA 状态管理。</p>
              </TabsContent>
            </Tabs>
          </div>

          <div className="rounded-lg border bg-background p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-medium">项目页面</p>
              <Button variant="ghost" size="icon-sm" aria-label="更多项目页面操作">
                <MoreHorizontal />
              </Button>
            </div>
            <div className="space-y-1">
              {navRows.map((row) => (
                <button
                  key={row}
                  type="button"
                  onClick={() => setActiveRow(row)}
                  className={cn(
                    "focus-ring flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                    activeRow === row ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <FileText aria-hidden className={cn("size-4", activeRow === row && "text-primary")} />
                  <span className="min-w-0 flex-1 truncate">{row}</span>
                  {activeRow === row ? <ChevronRight aria-hidden className="size-4" /> : null}
                </button>
              ))}
            </div>
          </div>
        </PreviewCard>
      </ShowcaseSection>

      <ShowcaseSection title="变体" description="导航控件在不同上下文中共享选中、悬停和焦点处理。">
        <PreviewGrid>
          <PreviewCard title="命令面板触发器">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={onOpenCommand}>
                <Command aria-hidden />
                打开命令面板
              </Button>
              <Button variant="outline" onClick={onOpenCommand}>
                搜索动作
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              命令面板会作为真实对话框打开，并与侧栏搜索共享数据。
            </p>
          </PreviewCard>

          <PreviewCard title="下拉菜单">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <PanelsTopLeft aria-hidden />
                  视图选项
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>布局</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={starred} onCheckedChange={setStarred}>
                  <Star aria-hidden className="mr-2 size-4" />
                  已收藏
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={pinned} onCheckedChange={setPinned}>
                  <Pin aria-hidden className="mr-2 size-4" />
                  已固定
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Check aria-hidden className="size-4" />
                  应用布局
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="mt-3 text-sm text-muted-foreground">
              菜单复选状态：{starred ? "已收藏" : "未收藏"}，{pinned ? "已固定" : "未固定"}。
            </p>
          </PreviewCard>
        </PreviewGrid>
      </ShowcaseSection>

      <ShowcaseSection title="状态" description="当前位置和临时菜单状态需要清晰可见，但不应过度装饰。">
        <PreviewCard title="侧栏项结构">
          <div className="grid gap-3 md:grid-cols-3">
            {["默认", "可悬停", "选中"].map((state) => (
              <div
                key={state}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
                  state === "选中" ? "border-primary/30 bg-primary/10" : "bg-background",
                )}
              >
                <FileText aria-hidden className={cn("size-4", state === "选中" ? "text-primary" : "text-muted-foreground")} />
                <span className="flex-1 truncate">{state}</span>
                {state === "选中" ? <span className="size-1.5 rounded-full bg-primary" /> : null}
              </div>
            ))}
          </div>
        </PreviewCard>
      </ShowcaseSection>
    </ComponentStack>
  );
}
