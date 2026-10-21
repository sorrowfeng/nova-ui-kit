from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1280, 720
out_dir = os.path.join("docs", "screenshots")
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "golden-path-demo.gif")

BG = (18, 18, 24)
PANEL = (32, 32, 42)
ACCENT = (120, 140, 255)
TEXT = (230, 230, 235)
DIM = (140, 140, 155)
OK = (90, 200, 140)

def font(size):
    for name in [
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]:
        if os.path.exists(name):
            return ImageFont.truetype(name, size)
    return ImageFont.load_default()

F_TITLE = font(36)
F_BODY = font(22)
F_SMALL = font(16)
F_BTN = font(18)

frames = []

def base(title, subtitle):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([40, 40, W - 40, H - 40], radius=24, fill=PANEL)
    d.rectangle([40, 40, W - 40, 110], fill=(40, 40, 55))
    d.text((70, 58), title, font=F_TITLE, fill=TEXT)
    d.text((70, 130), subtitle, font=F_BODY, fill=DIM)
    return img, d

def badge(d, x, y, label, color=ACCENT):
    tw = d.textlength(label, font=F_SMALL)
    d.rounded_rectangle([x, y, x + tw + 24, y + 32], radius=12, fill=color)
    d.text((x + 12, y + 6), label, font=F_SMALL, fill=(255, 255, 255))

# Frame 1: title
img, d = base("Nova UI Editor", "30 秒黄金路径 · 新建 → 设计 → 绑定 → 生成 → exe")
d.rounded_rectangle([420, 280, 860, 380], radius=16, fill=ACCENT)
d.text((500, 310), "开始演示", font=F_TITLE, fill=(255, 255, 255))
frames.append(img)

# Frame 2: new project
img, d = base("1 · 新建项目", "Project 模式 · 模板：仪表盘 / Qt 主窗口 / 设置")
for i, name in enumerate(["空白", "仪表盘", "设置表单", "对话框", "数据工具"]):
    x = 100 + (i % 3) * 360
    y = 220 + (i // 3) * 140
    d.rounded_rectangle([x, y, x + 320, y + 110], radius=14, fill=(50, 50, 68))
    d.text((x + 24, y + 30), name, font=F_BODY, fill=TEXT)
    if name == "仪表盘":
        d.rounded_rectangle([x - 4, y - 4, x + 324, y + 114], radius=16, outline=ACCENT, width=3)
        badge(d, x + 220, y + 70, "选中")
frames.append(img)

# Frame 3: design canvas
img, d = base("2 · 画布插入控件", "Design · 左侧组件库 · 顶栏选择条 · 右侧检查器")
d.rounded_rectangle([70, 180, 280, 620], radius=12, fill=(45, 45, 60))
d.text((90, 200), "组件库", font=F_BODY, fill=TEXT)
for i, name in enumerate(["按钮", "搜索栏", "表格", "卡片"]):
    d.rounded_rectangle([90, 250 + i * 60, 260, 295 + i * 60], radius=8, fill=(60, 60, 80))
    d.text((110, 260 + i * 60), name, font=F_SMALL, fill=TEXT)
d.rounded_rectangle([320, 200, 980, 560], radius=12, fill=(28, 28, 38), outline=DIM)
d.text((350, 220), "画布", font=F_BODY, fill=DIM)
d.rounded_rectangle([400, 300, 560, 360], radius=10, fill=ACCENT)
d.text((430, 318), "创建", font=F_BTN, fill=(255, 255, 255))
d.rounded_rectangle([396, 296, 564, 364], radius=12, outline=(255, 200, 80), width=2)
badge(d, 600, 300, "已选中 1 个控件", (255, 180, 60))
d.rounded_rectangle([1020, 180, 1210, 620], radius=12, fill=(45, 45, 60))
d.text((1040, 200), "检查器", font=F_BODY, fill=TEXT)
d.text((1040, 250), "标签: 创建", font=F_SMALL, fill=DIM)
frames.append(img)

# Frame 4: logic bind
img, d = base("3 · Logic 绑定命令", "事件 click → Rust command app_message → 槽函数")
d.rounded_rectangle([100, 220, 580, 520], radius=12, fill=(45, 45, 60))
d.text((130, 250), "信号 / 槽", font=F_BODY, fill=TEXT)
d.text((130, 310), "click  →  app_message()", font=F_BTN, fill=OK)
d.text((130, 360), "logic.rs:12", font=F_SMALL, fill=DIM)
badge(d, 130, 420, "已绑定", OK)
d.rounded_rectangle([640, 220, 1180, 520], radius=12, fill=(45, 45, 60))
d.text((670, 250), "Rust 命令", font=F_BODY, fill=TEXT)
d.text((670, 310), 'fn app_message() -> String {', font=F_SMALL, fill=(180, 200, 255))
d.text((670, 350), '    "Hello from Nova".into()', font=F_SMALL, fill=(180, 200, 255))
d.text((670, 390), "}", font=F_SMALL, fill=(180, 200, 255))
frames.append(img)

# Frame 5: generate
img, d = base("4 · 生成目标应用", "Build · 文件计划 create/update/unchanged · 窗口校验")
d.rounded_rectangle([100, 200, 1180, 480], radius=12, fill=(45, 45, 60))
rows = [
    ("+", "app/src/App.tsx", "update", OK),
    ("+", "app/src-tauri/src/main.rs", "unchanged", DIM),
    ("+", "rust/logic.rs", "create-only 保护", ACCENT),
    ("+", "nova.project.json", "update", OK),
]
for i, (mark, name, status, color) in enumerate(rows):
    y = 230 + i * 55
    d.text((140, y), mark, font=F_BTN, fill=color)
    d.text((180, y), name, font=F_BODY, fill=TEXT)
    d.text((700, y), status, font=F_SMALL, fill=color)
d.rounded_rectangle([480, 520, 800, 590], radius=14, fill=ACCENT)
d.text((560, 540), "预览运行", font=F_BTN, fill=(255, 255, 255))
frames.append(img)

# Frame 6: exe
img, d = base("5 · 产出 Windows exe", "tauri:exe · 任务队列 · 运行日志 · 发布证据")
d.rounded_rectangle([200, 240, 1080, 480], radius=16, fill=(30, 30, 42), outline=OK, width=2)
d.text((280, 300), "✓  Build succeeded", font=F_TITLE, fill=OK)
d.text((280, 370), "nova-ui-kit.exe", font=F_BODY, fill=TEXT)
d.text((280, 420), "src-tauri/target/release/", font=F_SMALL, fill=DIM)
badge(d, 280, 470, "任务完成 · 可双击运行", OK)
frames.append(img)

# Frame 7: end
img, d = base("完成", "完整路径见 docs/golden-path.md · 故障排查 docs/troubleshooting.md")
d.rounded_rectangle([420, 300, 860, 400], radius=16, fill=ACCENT)
d.text((500, 330), "开始你的应用", font=F_TITLE, fill=(255, 255, 255))
frames.append(img)

# hold first/last longer
frames = [frames[0]] * 3 + frames + [frames[-1]] * 3

frames[0].save(
    out_path,
    save_all=True,
    append_images=frames[1:],
    duration=2200,
    loop=0,
    optimize=True,
)
print("wrote", out_path, "frames", len(frames))
