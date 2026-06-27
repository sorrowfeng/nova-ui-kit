export type InvoiceRow = {
  id: string;
  customer: string;
  plan: string;
  status: "活跃" | "试用" | "暂停" | "逾期";
  seats: number;
  arr: number;
  updated: string;
};

export const invoiceRows: InvoiceRow[] = [
  { id: "nova-1024", customer: "星图云", plan: "企业版", status: "活跃", seats: 86, arr: 62400, updated: "今天" },
  { id: "nova-1025", customer: "轨道实验室", plan: "增长版", status: "试用", seats: 24, arr: 12800, updated: "昨天" },
  { id: "nova-1026", customer: "北辰设计", plan: "团队版", status: "暂停", seats: 12, arr: 8400, updated: "6月21日" },
  { id: "nova-1027", customer: "峰顶智能", plan: "企业版", status: "活跃", seats: 142, arr: 97800, updated: "6月20日" },
  { id: "nova-1028", customer: "港湾工作室", plan: "团队版", status: "逾期", seats: 9, arr: 5200, updated: "6月18日" },
];

export const activityFeed = [
  {
    title: "设计令牌版本已草拟",
    description: "圆角、阴影和密度值已归入稳定的桌面端预设。",
    time: "09:42",
  },
  {
    title: "命令面板快捷键已更新",
    description: "导航动作现在与侧边栏共用同一个可搜索数据源。",
    time: "10:16",
  },
  {
    title: "表格选中行状态已验证",
    description: "键盘焦点和鼠标选中状态现在保持清晰区分。",
    time: "11:05",
  },
];

export const notifications = [
  { title: "组件审查完成", detail: "已更新 3 个焦点状态", unread: true },
  { title: "新的模式提案", detail: "设置面板已加入队列", unread: true },
  { title: "依赖扫描", detail: "Radix 基础组件保持最新", unread: false },
];

export const searchableItems = [
  "按钮变体",
  "分段密度控件",
  "抽屉浮层",
  "提示视口",
  "组合框触发器",
  "校验消息",
  "选中表格行",
  "日历气泡",
];

export const dashboardMetrics = [
  { label: "组件", value: "42", delta: "+8", tone: "primary" },
  { label: "模式", value: "12", delta: "+3", tone: "accent" },
  { label: "覆盖率", value: "91%", delta: "+6%", tone: "primary" },
  { label: "开放状态", value: "7", delta: "-2", tone: "muted" },
];
