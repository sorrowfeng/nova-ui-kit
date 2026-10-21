# Alpha → Beta 发布清单

> 发版前逐项勾选 · 2026-07

## 质量门禁

- [ ] `npm run build` 全绿
- [ ] `npm run check:builder-runtime` 冒烟通过
- [ ] `cargo test --manifest-path src-tauri/Cargo.toml` 全绿
- [ ] `npm run check:cpp-ffi` 通过
- [ ] `npm run check:generated-runtime` 通过

## 体验

- [ ] `npm run docs:screenshots` 更新四模式截图
- [ ] `node output/ui-audit/run-ui-text-audit.mjs` 对照 `output/ui-audit/baseline-2026-07.md` 无关键回归
- [ ] `docs/accessibility-checklist.md` 抽测一轮并记录

## 文档

- [ ] README 脚本表 / Roadmap / 截图已同步
- [ ] `docs/后续工作计划.md` 进度表更新
- [ ] `npm run release:notes` 生成并校对变更草稿
- [ ] schema 兼容声明（`docs/project-schema.md`）与 `schemaVersion` 一致

## 发布物

- [ ] `npm run tauri:exe` 产物校验
- [ ] 安装包（如发）走 installer smoke 三档
- [ ] Release notes 附黄金路径与已知限制

## 已知限制（写进 notes）

- Bundle 主 chunk 仍偏大（模式懒加载后 ~1.7MB）
- ui-audit 调色板内部 text-overlap 仍有存量（见基线文档）
- Linux/macOS 安装包矩阵未全开
