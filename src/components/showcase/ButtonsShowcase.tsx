import { Archive, ChevronDown, Copy, MoreHorizontal, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ComponentStack,
  PreviewCard,
  PreviewGrid,
  ShowcaseSection,
} from "@/components/showcase/ShowcaseScaffold";

export function ButtonsShowcase() {
  return (
    <ComponentStack>
      <ShowcaseSection
        title="实时预览"
        description="桌面端主操作需要安静、清晰、可扫描，并且完整支持键盘访问。"
      >
        <PreviewCard
          title="工具栏操作组"
          description="包含层级、图标、加载和分组操作的真实命令行。"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <Plus aria-hidden />
              新建组件
            </Button>
            <Button variant="secondary">
              <RefreshCw aria-hidden />
              刷新
            </Button>
            <Button variant="outline">
              <Archive aria-hidden />
              归档
            </Button>
            <Button variant="ghost">
              <Copy aria-hidden />
              复制
            </Button>
            <Button variant="destructive">
              <Trash2 aria-hidden />
              删除
            </Button>
            <Button variant="outline" size="icon" aria-label="更多操作">
              <MoreHorizontal />
            </Button>
          </div>
        </PreviewCard>
      </ShowcaseSection>

      <ShowcaseSection title="变体" description="先表达意图，再考虑装饰。按钮变体应直接映射产品语义。">
        <PreviewGrid>
          <PreviewCard title="意图变体">
            <div className="flex flex-wrap gap-2">
              <Button>主按钮</Button>
              <Button variant="secondary">次按钮</Button>
              <Button variant="outline">描边</Button>
              <Button variant="ghost">文本</Button>
              <Button variant="destructive">危险</Button>
              <Button variant="subtle">浮起</Button>
            </div>
          </PreviewCard>
          <PreviewCard title="尺寸">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">小</Button>
              <Button size="md">中</Button>
              <Button size="lg">大</Button>
              <Button variant="outline" size="icon-sm" aria-label="添加小项">
                <Plus />
              </Button>
              <Button variant="outline" size="icon" aria-label="添加项">
                <Plus />
              </Button>
            </div>
          </PreviewCard>
        </PreviewGrid>
      </ShowcaseSection>

      <ShowcaseSection title="状态" description="加载和禁用状态需要保持按钮宽度稳定，指针行为也要可预测。">
        <PreviewGrid>
          <PreviewCard title="加载与禁用">
            <div className="flex flex-wrap items-center gap-2">
              <Button loading>保存中</Button>
              <Button variant="secondary" loading>
                同步中
              </Button>
              <Button disabled>已禁用</Button>
              <Button variant="outline" disabled>
                禁用描边
              </Button>
            </div>
          </PreviewCard>
          <PreviewCard title="按钮组">
            <div className="inline-flex overflow-hidden rounded-md border bg-background shadow-sm">
              <Button variant="ghost" className="rounded-none border-r">
                日
              </Button>
              <Button variant="ghost" className="rounded-none border-r bg-muted">
                周
              </Button>
              <Button variant="ghost" className="rounded-none border-r">
                月
              </Button>
              <Button variant="ghost" className="rounded-none">
                <ChevronDown aria-hidden />
                更多
              </Button>
            </div>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              按钮组共用边框，只用一个选中填充，适合高密度桌面工具栏。
            </p>
          </PreviewCard>
        </PreviewGrid>
      </ShowcaseSection>
    </ComponentStack>
  );
}
