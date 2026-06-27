import { useMemo, useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CalendarDays, Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ComponentStack,
  PreviewCard,
  PreviewGrid,
  ShowcaseSection,
} from "@/components/showcase/ShowcaseScaffold";
import { cn } from "@/lib/utils";

const frameworks = ["React", "Vue", "Svelte", "Solid", "Qwik", "Astro"];

export function FormControlsShowcase() {
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [comboboxQuery, setComboboxQuery] = useState("");
  const [framework, setFramework] = useState("React");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2026, 5, 27));
  const [sliderValue, setSliderValue] = useState([64]);
  const [mode, setMode] = useState("preview");
  const [emailEnabled, setEmailEnabled] = useState(true);

  const filteredFrameworks = useMemo(
    () => frameworks.filter((item) => item.toLowerCase().includes(comboboxQuery.toLowerCase())),
    [comboboxQuery],
  );

  return (
    <ComponentStack>
      <ShowcaseSection
        title="实时预览"
        description="一个紧凑的属性检查器，展示控件在桌面软件里的真实使用场景。"
      >
        <PreviewCard title="组件属性检查器" bodyClassName="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="component-name">组件名称</Label>
              <Input id="component-name" defaultValue="命令菜单" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="component-notes">备注</Label>
              <Textarea id="component-notes" defaultValue="用于动作发现、工作区切换和快速导航。" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="email-alerts">邮件提醒</Label>
                <p className="mt-1 text-sm text-muted-foreground">当 API 变化时通知维护者。</p>
              </div>
              <Switch id="email-alerts" checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>运行环境</Label>
              <Select defaultValue="tauri">
                <SelectTrigger>
                  <SelectValue placeholder="选择运行环境" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tauri">Tauri 桌面端</SelectItem>
                  <SelectItem value="web">Web 预览</SelectItem>
                  <SelectItem value="storybook">Storybook 嵌入</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>模式</Label>
              <SegmentedControl
                aria-label="Preview mode"
                value={mode}
                onValueChange={setMode}
                options={[
                  { value: "preview", label: "预览" },
                  { value: "docs", label: "文档" },
                  { value: "code", label: "代码" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>缩放：{sliderValue[0]}%</Label>
              <Slider min={25} max={125} step={1} value={sliderValue} onValueChange={setSliderValue} />
            </div>
          </div>
        </PreviewCard>
      </ShowcaseSection>

      <ShowcaseSection title="变体" description="表单基础控件共享圆角、焦点环和禁用行为。">
        <PreviewGrid>
          <PreviewCard title="文本输入">
            <div className="grid gap-3 sm:grid-cols-3">
              <Input inputSize="sm" placeholder="小尺寸" />
              <Input placeholder="中尺寸" />
              <Input inputSize="lg" placeholder="大尺寸" />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input placeholder="已禁用" disabled />
              <Input placeholder="错误状态" invalid defaultValue="broken@" />
            </div>
          </PreviewCard>

          <PreviewCard title="选择器与组合框">
            <div className="grid gap-3 sm:grid-cols-2">
              <Select defaultValue="weekly">
                <SelectTrigger aria-label="节奏">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">每日</SelectItem>
                  <SelectItem value="weekly">每周</SelectItem>
                  <SelectItem value="monthly">每月</SelectItem>
                </SelectContent>
              </Select>

              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={comboboxOpen} className="justify-between">
                    {framework}
                    <ChevronsUpDown aria-hidden className="opacity-55" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2">
                  <div className="relative mb-2">
                    <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      aria-label="搜索框架"
                      value={comboboxQuery}
                      onChange={(event) => setComboboxQuery(event.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div role="listbox" className="space-y-1">
                    {filteredFrameworks.map((item) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={framework === item}
                        key={item}
                        className="focus-ring flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                        onClick={() => {
                          setFramework(item);
                          setComboboxOpen(false);
                        }}
                      >
                        {item}
                        <Check aria-hidden className={cn("size-4", framework === item ? "opacity-100" : "opacity-0")} />
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </PreviewCard>
        </PreviewGrid>
      </ShowcaseSection>

      <ShowcaseSection title="状态" description="选择类控件需要保持清晰标签和准确点击区域。">
        <PreviewGrid>
          <PreviewCard title="复选框、单选和开关">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="terms" defaultChecked />
                  <Label htmlFor="terms">已接受</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="readonly" disabled />
                  <Label htmlFor="readonly" className="text-muted-foreground">
                    已禁用
                  </Label>
                </div>
              </div>
              <RadioGroup defaultValue="system" aria-label="主题偏好">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="theme-system" value="system" />
                  <Label htmlFor="theme-system">系统</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="theme-dark" value="dark" />
                  <Label htmlFor="theme-dark">深色</Label>
                </div>
              </RadioGroup>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="auto-save">自动保存</Label>
                  <Switch id="auto-save" defaultChecked />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="muted-switch" className="text-muted-foreground">
                    已禁用
                  </Label>
                  <Switch id="muted-switch" disabled />
                </div>
              </div>
            </div>
          </PreviewCard>

          <PreviewCard title="日期选择">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarDays aria-hidden />
                  {selectedDate ? format(selectedDate, "PPP", { locale: zhCN }) : "选择日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={{ before: new Date(2026, 0, 1) }}
                />
              </PopoverContent>
            </Popover>
            <p className="mt-3 text-sm text-muted-foreground">
              日历使用 Radix 气泡容器，并把选择结果保存在本地 React 状态中。
            </p>
          </PreviewCard>
        </PreviewGrid>
      </ShowcaseSection>
    </ComponentStack>
  );
}
