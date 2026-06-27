import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Box, CheckCircle2, Filter, Search, Users } from "lucide-react";
import { activityFeed, dashboardMetrics, invoiceRows, type InvoiceRow } from "@/data/demo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ComponentStack,
  PreviewCard,
  PreviewGrid,
  ShowcaseSection,
} from "@/components/showcase/ShowcaseScaffold";
import { cn } from "@/lib/utils";

type SortKey = "customer" | "arr" | "seats" | "status";
type SortDirection = "asc" | "desc";

const statusVariant: Record<InvoiceRow["status"], "default" | "secondary" | "destructive" | "accent"> = {
  活跃: "default",
  试用: "accent",
  暂停: "secondary",
  逾期: "destructive",
};

export function DataDisplayShowcase() {
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState("nova-1024");
  const [sortKey, setSortKey] = useState<SortKey>("arr");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const rows = useMemo(() => {
    const query = filter.toLowerCase();
    return invoiceRows
      .filter((row) => `${row.customer} ${row.plan} ${row.status}`.toLowerCase().includes(query))
      .sort((a, b) => {
        const first = a[sortKey];
        const second = b[sortKey];
        const result = first > second ? 1 : first < second ? -1 : 0;
        return sortDirection === "asc" ? result : -result;
      });
  }, [filter, sortDirection, sortKey]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  return (
    <ComponentStack>
      <ShowcaseSection
        title="实时预览"
        description="数据展示组件应支持快速扫描、比较和可靠的行级操作。"
      >
        <PreviewCard title="可排序客户表格" bodyClassName="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="筛选表格"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="筛选客户..."
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter aria-hidden />
              Status
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/70 text-muted-foreground">
                  <tr>
                    {[
                      ["customer", "客户"],
                      ["status", "状态"],
                      ["seats", "席位"],
                      ["arr", "ARR"],
                    ].map(([key, label]) => (
                      <th key={key} className="px-3 py-2 text-left font-medium">
                        <button
                          type="button"
                          className="focus-ring inline-flex items-center gap-1 rounded-sm"
                          onClick={() => toggleSort(key as SortKey)}
                          aria-label={`按${label}排序`}
                        >
                          {label}
                          {sortKey === key ? (
                            sortDirection === "asc" ? (
                              <ArrowUp aria-hidden className="size-3.5" />
                            ) : (
                              <ArrowDown aria-hidden className="size-3.5" />
                            )
                          ) : null}
                        </button>
                      </th>
                    ))}
                    <th className="px-3 py-2 text-left font-medium">更新</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const selected = row.id === selectedId;
                    return (
                      <tr
                        key={row.id}
                        style={{ height: "var(--row-height)" }}
                        className={cn(
                          "cursor-pointer border-t transition-colors hover:bg-muted/55",
                          selected && "bg-primary/8 hover:bg-primary/10",
                        )}
                        onClick={() => setSelectedId(row.id)}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback>{row.customer.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{row.customer}</p>
                              <p className="truncate text-xs text-muted-foreground">{row.plan}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
                        </td>
                        <td className="px-3 py-2 tabular-nums">{row.seats}</td>
                        <td className="px-3 py-2 tabular-nums">${row.arr.toLocaleString()}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.updated}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </PreviewCard>
      </ShowcaseSection>

      <ShowcaseSection title="变体" description="小型展示基础组件可以组合成更完整的仪表盘表面。">
        <PreviewGrid className="xl:grid-cols-4">
          {dashboardMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="p-4 pb-2">
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-2xl">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Badge variant={metric.tone === "accent" ? "accent" : metric.tone === "muted" ? "secondary" : "default"}>
                  {metric.delta}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </PreviewGrid>
      </ShowcaseSection>

      <ShowcaseSection title="状态" description="即使内容很少，空状态和活动流也能让产品保持可用感。">
        <PreviewGrid>
          <PreviewCard title="空状态">
            <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed bg-background p-8 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                <Box aria-hidden className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">没有匹配组件</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                清除筛选，或创建新的注册表条目来记录这个模式。
              </p>
              <Button size="sm" className="mt-4">
                创建条目
              </Button>
            </div>
          </PreviewCard>

          <PreviewCard title="时间线">
            <div className="space-y-4">
              {activityFeed.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border bg-background">
                    <CheckCircle2 aria-hidden className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </PreviewCard>
        </PreviewGrid>
      </ShowcaseSection>

      <ShowcaseSection title="内容基础组件" description="徽标、头像、卡片和统计元素在密集布局中保持一致尺寸。">
        <PreviewCard title="身份行">
          <div className="flex flex-wrap items-center gap-3">
            <Avatar>
              <AvatarFallback>NU</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Nova UI 核心团队</p>
              <p className="text-sm text-muted-foreground">维护共享基础组件和应用模式</p>
            </div>
            <Badge className="ml-auto" variant="accent">
              <Users aria-hidden className="mr-1 size-3" />
              8 位成员
            </Badge>
          </div>
        </PreviewCard>
      </ShowcaseSection>
    </ComponentStack>
  );
}
