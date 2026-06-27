import { FormEvent, useMemo, useState } from "react";
import { Bell, Check, CreditCard, Search, Settings, Shield, UserRound } from "lucide-react";
import { dashboardMetrics, notifications, searchableItems } from "@/data/demo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ComponentStack,
  PreviewCard,
  PreviewGrid,
  ShowcaseSection,
} from "@/components/showcase/ShowcaseScaffold";
import { cn } from "@/lib/utils";

export function ApplicationPatternsShowcase({ onToast }: { onToast: () => void }) {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [saved, setSaved] = useState(false);

  const filteredItems = useMemo(
    () => searchableItems.filter((item) => item.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!form.name.trim()) {
      nextErrors.name = "请填写姓名。";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "请输入有效邮箱地址。";
    }
    setErrors(nextErrors);
    setSaved(Object.keys(nextErrors).length === 0);
    if (Object.keys(nextErrors).length === 0) {
      onToast();
    }
  };

  return (
    <ComponentStack>
      <ShowcaseSection
        title="实时预览"
        description="应用模式展示基础控件组合到完整桌面工作流后的表现。"
      >
        <PreviewGrid>
          <PreviewCard title="设置面板">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg border bg-background">
                  <Settings aria-hidden className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">工作区设置</p>
                  <p className="text-sm text-muted-foreground">配置生成组件文档时使用的默认值。</p>
                </div>
              </div>
              <div className="space-y-3 rounded-lg border bg-background p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor="auto-layout">自动布局提示</Label>
                    <p className="mt-1 text-sm text-muted-foreground">显示间距和状态建议。</p>
                  </div>
                  <Switch id="auto-layout" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>默认密度</Label>
                  <Select defaultValue="cozy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">紧凑</SelectItem>
                      <SelectItem value="cozy">标准</SelectItem>
                      <SelectItem value="comfortable">舒展</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PreviewCard>

          <PreviewCard title="账号面板">
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
                <Avatar className="size-12">
                  <AvatarFallback>李</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">李安然</p>
                  <p className="truncate text-sm text-muted-foreground">设计系统负责人</p>
                </div>
                <Badge variant="accent">专业版</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <Button variant="outline">
                  <UserRound aria-hidden />
                  资料
                </Button>
                <Button variant="outline">
                  <Shield aria-hidden />
                  安全
                </Button>
                <Button variant="outline">
                  <CreditCard aria-hidden />
                  账单
                </Button>
              </div>
            </div>
          </PreviewCard>
        </PreviewGrid>
      </ShowcaseSection>

      <ShowcaseSection title="变体" description="常见应用模式依赖清晰层级和克制的重复行。">
        <PreviewGrid>
          <PreviewCard title="通知中心">
            <div className="space-y-2">
              {notifications.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-lg border bg-background p-3">
                  <div
                    className={cn(
                      "mt-1 size-2 rounded-full",
                      item.unread ? "bg-primary" : "bg-muted-foreground/35",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                  <Bell aria-hidden className="size-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </PreviewCard>

          <PreviewCard title="可搜索列表">
            <div className="space-y-3">
              <div className="relative">
                <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="搜索模式列表"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索模式..."
                  className="pl-9"
                />
              </div>
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="focus-ring flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                  >
                    {item}
                    <Check aria-hidden className="size-4 text-muted-foreground" />
                  </button>
                ))}
                {filteredItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                    没有匹配模式。
                  </div>
                ) : null}
              </div>
            </div>
          </PreviewCard>
        </PreviewGrid>
      </ShowcaseSection>

      <ShowcaseSection title="状态" description="校验和紧凑仪表盘能在不离开当前屏幕的情况下暴露产品状态。">
        <PreviewGrid>
          <PreviewCard title="紧凑仪表盘">
            <div className="space-y-4">
              {dashboardMetrics.map((metric, index) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{metric.label}</span>
                    <span className="text-muted-foreground">{metric.value}</span>
                  </div>
                  <Progress value={[76, 58, 91, 35][index]} />
                </div>
              ))}
            </div>
          </PreviewCard>

          <PreviewCard title="表单校验">
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="profile-name">姓名</Label>
                <Input
                  id="profile-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  invalid={Boolean(errors.name)}
                  placeholder="李安然"
                />
                {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">邮箱</Label>
                <Input
                  id="profile-email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  invalid={Boolean(errors.email)}
                  placeholder="anran@nova.dev"
                />
                {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="profile-public" defaultChecked />
                <Label htmlFor="profile-public">在团队目录中展示该资料</Label>
              </div>
              <Button type="submit">保存资料</Button>
              {saved ? <p className="text-sm text-primary">资料已校验并保存到本地。</p> : null}
            </form>
          </PreviewCard>
        </PreviewGrid>
      </ShowcaseSection>
    </ComponentStack>
  );
}
