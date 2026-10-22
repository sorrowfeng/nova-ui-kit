# 多平台安装包矩阵（F4）

> 2026-07 · 对应 `ReleaseBundleTarget` / `tauri.conf.json` bundle 配置

---

## 1. 支持级别

| 平台 | 目标 | `ReleaseBundleTarget` | 级别 | 验证状态 |
|------|------|----------------------|------|----------|
| Windows | app (exe) | `app` | **L1 主路径** | CI `tauri:exe` + 本地 verify:desktop |
| Windows | NSIS | `nsis` | L1 | `tauri:build` |
| Windows | MSI | `msi` | L2 | 按需 |
| Linux | AppImage | `appimage` | L2 | 配置已开；需 Linux 实机 |
| Linux | deb | `deb` | L2 | 配置已开；需 Linux 实机 |
| macOS | app + dmg | `dmg` | L2 | 配置已开；需 macOS 实机 + signing |

**L1** = CI/本地常规验证；**L2** = 配置就绪、按需实机验证。

---

## 2. 配置入口

| 文件 | 内容 |
|------|------|
| `src-tauri/tauri.conf.json` → `bundle` | targets、icon、linux.deb/appimage、macOS minimumSystemVersion、windows webviewInstallMode |
| `ProjectReleaseConfig.bundleTargets` | 项目内选择打包目标 |
| `docs/release-pipeline.md` | 流水线证据与 installer smoke |

---

## 3. 平台命令

```bash
# Windows
npm run tauri:exe          # 仅 exe
npm run tauri:build        # 全量 bundle（nsis/msi/…）

# Linux（在 Linux 主机）
sudo apt-get install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
npm run tauri:build        # 产出 AppImage / deb

# macOS（在 macOS 主机，需 Xcode + 证书）
npm run tauri:build        # 产出 .app / .dmg
```

---

## 4. 验证矩阵

| Job | OS | 命令 | 产物 | 触发 |
|-----|-----|------|------|------|
| web-build | ubuntu-22.04 | `npm run build` | — | push / PR |
| windows-exe | windows-latest | `npm run tauri:exe` | `.exe` | push / PR |
| linux-bundle | ubuntu-22.04 | `npm run tauri:build` | `.AppImage` `.deb` | `workflow_dispatch` / tag |
| macos-bundle | macos-latest | `npm run tauri:build` | `.app` `.dmg` | `workflow_dispatch` / tag |

`build.yml` 的 Linux/macOS job 只在手动触发时运行（避免 macOS runner 排队阻塞主门禁）；
打 tag 时 `release.yml` 一定跑全平台并把产物挂到 GitHub Release。

配置本身由 `npm run check:platform-bundle` 校验（bundle 段、icon.ico/icns/png、
linux.deb/appimage、macOS minimumSystemVersion、webviewInstallMode），已挂进
`npm run check:experience`，不需要实机也能拦住配置漂移。

产物本身由 `node scripts/verify-release-artifacts.mjs --dir <bundle目录> --platform <linux|macos|windows>`
判定：目标格式必须齐、体积过下限、文件头/尾魔数正确（`.deb` = ar 头、`.AppImage` = ELF、
`.dmg` = UDIF `koly` 尾块（512 字节 trailer 的**首** 4 字节，位于 `fileSize-512`）、
`.exe` = `MZ`、`.app` 需含 `Contents/Info.plist` 与 `Contents/MacOS/`），
并写出 `SHA256SUMS.txt`。`build.yml` 与 `release.yml` 的各平台 job 在上传前都会跑这一步，
`release.yml` 发布时还会逐平台点名校验并开启 `fail_on_unmatched_files`，产物缺失不再静默通过。

---

## 5. 安装包冒烟

见 `docs/release-pipeline.md`：artifact-only / write-script / vm-handoff 三档。

`build.yml` 与 `release.yml` 对三个平台都执行「产出 → 校验 → **装上并启动**」，
不只验证文件存在：

| 平台 | 安装 | 启动存活判据 |
|------|------|-------------|
| Linux | `dpkg -i` 后 `ldd` 无缺库 | `xvfb` 下 10s 后进程仍在 |
| macOS | `hdiutil attach` 后 `otool -L` 无缺库 | 挂载卷内启动，10s 后仍在 |
| Windows | `check:desktop-exe`（GUI 子系统、标题、最大化） | `Start-Process` 后 15s 后仍在 |

```bash
npm run verify:desktop
npm run check:desktop-exe
```

---

## 6. 已知限制

- Linux/macOS 产物需对应主机编译；交叉打包未配置。
- macOS 未配置签名/公证时 dmg 仅供本地测试。
- `targets: "all"` 会按宿主 OS 打包可用目标；跨平台请在各 OS 上跑 `tauri:build`。
