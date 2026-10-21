// Extracted from generated_app_runtime.rs (workflow C1). Keep byte-stable.

pub const GENERATED_STYLES: &str = r#":root {
  color: #1d1b20;
  background: #f8f7fb;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #f8f7fb;
}

button,
input,
textarea,
select {
  font: inherit;
}

.app {
  --nova-runtime-radius: 18px;
  --nova-runtime-shadow: 0 18px 50px rgb(32 27 44 / 0.12);
  --nova-runtime-border: #d8d2e4;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8f7fb;
  color: #1d1b20;
  box-shadow: inset 0 0 0 1px var(--nova-runtime-border);
}

.app-titlebar-native,
.app-titlebar-hidden {
  background: #fffbff;
  box-shadow: none;
}

.app-dialog,
.app-tool {
  background: #f8f7fb;
}

.window-titlebar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  height: 40px;
  flex: 0 0 auto;
  user-select: none;
  border-bottom: 1px solid #d8d2e4;
  background:
    linear-gradient(180deg, rgb(255 251 255 / 0.97), rgb(248 247 251 / 0.94));
  padding: 0 10px 0 12px;
  color: #5f5a66;
  backdrop-filter: blur(18px);
}

.titlebar-hit-strip {
  position: absolute;
  inset: 0 112px 0 0;
  z-index: 0;
}

.app-dialog .window-titlebar {
  height: 38px;
}

.app-tool .window-titlebar {
  height: 36px;
  background: rgb(248 247 251 / 0.96);
}

.titlebar-drag-region {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  align-self: stretch;
}

.titlebar-brand {
  display: flex;
  min-width: 0;
  align-self: stretch;
  align-items: center;
  gap: 9px;
}

.titlebar-mark {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #e8def8;
  color: #4f378b;
  font-size: 12px;
}

.titlebar-title {
  max-width: 260px;
  overflow: hidden;
  color: #1d1b20;
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.titlebar-subtitle,
.titlebar-status {
  min-width: 0;
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.titlebar-runtime-chip {
  display: inline-flex;
  height: 20px;
  flex: 0 0 auto;
  align-items: center;
  border: 1px solid rgb(103 80 164 / 0.22);
  border-radius: 999px;
  background: rgb(232 222 248 / 0.58);
  color: #4f378b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
  padding: 0 8px;
}

.titlebar-status {
  justify-self: end;
  max-width: 34vw;
}

.window-controls {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 2px;
}

.window-controls button {
  position: relative;
  display: inline-flex;
  width: 34px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  align-items: center;
  background: transparent;
  color: #49454f;
  cursor: pointer;
  justify-content: center;
  padding: 0;
  transition: background-color 120ms ease, color 120ms ease;
}

.window-controls button:hover {
  background: #f0edf4;
}

.window-controls .window-close:hover {
  background: #ba1a1a;
  color: white;
}

.window-control-icon {
  position: relative;
  display: inline-block;
  width: 12px;
  height: 12px;
  color: currentColor;
}

.window-minimize-icon::before,
.window-maximize-icon::before,
.window-close-icon::before,
.window-close-icon::after {
  position: absolute;
  content: "";
  background: currentColor;
}

.window-minimize-icon::before {
  left: 1px;
  right: 1px;
  top: 8px;
  height: 1.5px;
  border-radius: 999px;
}

.window-maximize-icon::before {
  inset: 2px;
  border: 1.5px solid currentColor;
  border-radius: 2px;
  background: transparent;
}

.window-close-icon::before,
.window-close-icon::after {
  left: 1px;
  top: 5px;
  width: 10px;
  height: 1.5px;
  border-radius: 999px;
}

.window-close-icon::before {
  transform: rotate(45deg);
}

.window-close-icon::after {
  transform: rotate(-45deg);
}

.app-body {
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
  background: #f8f7fb;
  padding: 0;
}

.app-titlebar-native .app-body,
.app-titlebar-hidden .app-body {
  background: #fffbff;
  padding-top: 0;
}

.app-frameless .app-body {
  padding: 0;
}

h1,
h2,
p {
  margin: 0;
}

.eyebrow {
  color: #6750a4;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace {
  display: grid;
  height: 100%;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  gap: 0;
}

.workspace[data-runtime-panel="visible"] {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 18px;
  padding: 18px;
  background: #f8f7fb;
}

[data-runtime-style-contract="nova-desktop-shell"] .workspace[data-runtime-panel="visible"] {
  border-radius: var(--nova-runtime-radius);
}

.canvas-viewport {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  border: 0;
  border-radius: 0;
  background: #f8f7fb;
  padding: 0;
  box-shadow: none;
}

[data-runtime-surface="viewport"] {
  scrollbar-color: #cac4d0 transparent;
}

.app-titlebar-native .canvas-viewport,
.app-titlebar-hidden .canvas-viewport {
  background: #fffbff;
}

.app-frameless .canvas-viewport {
  border: 0;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

.canvas {
  position: relative;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: #fffbff;
  box-shadow: none;
}

.canvas-background-soft {
  background:
    radial-gradient(circle at 18% 0%, rgb(103 80 164 / 0.08), transparent 32%),
    #fffbff;
}

.canvas-background-plain {
  background: #fffbff;
}

.runtime-panel {
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 56px);
  overflow: auto;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: rgb(255 255 255 / 0.94);
  padding: 14px;
  box-shadow: 0 14px 34px rgb(31 28 38 / 0.1);
}

.runtime-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.runtime-header h2 {
  font-size: 16px;
}

.runtime-header span {
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  padding: 4px 8px;
  color: #5f5a66;
  font-size: 11px;
}

.state-snapshot,
.backend-health,
.trace-entry,
.trace-empty {
  border: 1px solid #e7e0ec;
  border-radius: 14px;
  background: #fbf8ff;
  padding: 10px;
}

.backend-health {
  display: grid;
  gap: 10px;
  margin-bottom: 10px;
}

.backend-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.backend-actions button {
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: white;
  padding: 6px 10px;
  color: #1d1b20;
  font-size: 12px;
  cursor: pointer;
}

.backend-actions button:disabled {
  color: #938f99;
  cursor: not-allowed;
}

.backend-log-preview {
  max-height: 180px;
  overflow: auto;
  margin: 8px 0 0;
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #1d1b20;
  color: #f8f7fb;
  padding: 9px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 11px;
  line-height: 1.5;
}

.backend-log-error {
  background: #fff3f3;
  color: #7d1b1b;
}

.state-snapshot {
  margin-bottom: 10px;
}

.state-snapshot strong,
.backend-health strong,
.trace-empty strong {
  font-size: 12px;
}

.state-snapshot dl {
  display: grid;
  gap: 6px;
  margin: 8px 0 0;
}

.state-snapshot div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.state-snapshot dt,
.state-snapshot dd,
.trace-entry p,
.trace-entry small,
.trace-empty p {
  margin: 0;
  color: #5f5a66;
  font-size: 11px;
}

.state-snapshot dd {
  max-width: 170px;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trace-list {
  display: grid;
  gap: 8px;
}

.trace-entry {
  display: grid;
  gap: 6px;
}

.trace-running {
  border-color: #c9b7ff;
}

.trace-success {
  border-color: #b7d8c7;
}

.trace-error {
  border-color: #efb8c8;
}

.trace-title {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
}

.trace-title span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trace-entry code {
  display: block;
  max-height: 72px;
  overflow: auto;
  border-radius: 10px;
  background: #f0edf6;
  padding: 7px;
  color: #3b3542;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 10px;
  white-space: pre-wrap;
  word-break: break-word;
}

.node {
  position: absolute;
  overflow: hidden;
}

.node-flow {
  position: relative;
  flex: 0 0 auto;
}

.text-label {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  color: #1d192b;
  padding: 4px;
}

.text-label strong,
.text-label small {
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-label strong {
  font-size: 14px;
  white-space: nowrap;
}

.text-label small {
  display: -webkit-box;
  margin-top: 4px;
  color: #79747e;
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.link-label {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  color: #6750a4;
  padding: 12px 14px;
  text-align: left;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.link-label:not(:disabled):hover {
  border-color: #d0bcff;
  background: #f7f2fa;
}

.link-label strong,
.link-label small,
.link-label code {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-label strong {
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.link-label small {
  margin-top: 4px;
  color: #79747e;
  font-size: 11px;
}

.link-label code {
  margin-top: 4px;
  color: #7d5260;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
}

.text-browser {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.text-browser header {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #d8d2e4;
  padding: 0 14px;
}

.text-browser header strong,
.text-browser header span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-browser header strong {
  font-size: 13px;
}

.text-browser header span {
  color: #79747e;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.text-browser > div {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 12px 14px;
}

.text-browser p {
  margin: 0 0 8px;
  color: #49454f;
  font-size: 12px;
  line-height: 1.5;
}

.image {
  width: 100%;
  height: 100%;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: white;
  display: block;
}

.image-cover {
  object-fit: cover;
}

.image-contain {
  object-fit: contain;
}

.image-fill {
  object-fit: fill;
}

.image-list {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.image-list header {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.image-list header span {
  min-width: 0;
}

.image-list strong,
.image-list small,
.image-list em,
.image-list-item strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-list small {
  display: block;
  margin-top: 3px;
  color: #79747e;
  font-size: 11px;
}

.image-list em {
  flex: 0 0 auto;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
}

.image-list > div {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  overflow: hidden;
  margin: 12px 0;
}

.image-list-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 16px;
  background: #f9f6fb;
  color: #49454f;
  padding: 0;
  text-align: left;
}

.image-list-item-active {
  border-color: #6750a4;
  box-shadow: 0 8px 18px rgb(31 28 38 / 0.1);
}

.image-list-thumb {
  display: block;
  height: 58px;
  flex: 0 0 auto;
}

.image-list-thumb-1 {
  background: linear-gradient(135deg, #d7e3ff, #eaddff);
}

.image-list-thumb-2 {
  background: linear-gradient(135deg, #d2e7d6, #f3edf7);
}

.image-list-thumb-3 {
  background: linear-gradient(135deg, #ffd8e4, #e8def8);
}

.image-list-item strong {
  padding: 7px 8px;
  font-size: 11px;
}

.image-list > .button {
  width: 100%;
  height: 34px;
}

.web-view {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.web-view header {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 8px 10px;
}

.web-view header span {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #fffbff;
  color: #79747e;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  padding: 6px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.web-view header button {
  border: 0;
  border-radius: 10px;
  background: #eaddff;
  color: #4f378b;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 800;
  padding: 7px 9px;
}

.web-view main {
  display: flex;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.web-view aside {
  display: flex;
  width: 96px;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 5px;
  overflow: hidden;
  border-right: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 10px 8px;
}

.web-tab {
  min-width: 0;
  overflow: hidden;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  padding: 7px 8px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.web-tab-active {
  background: #eaddff;
  color: #4f378b;
}

.web-view article {
  display: grid;
  min-width: 0;
  min-height: 0;
  flex: 1;
  grid-template-rows: auto auto 12px 12px minmax(0, 1fr);
  gap: 9px;
  overflow: hidden;
  background: #fffbff;
  padding: 16px;
}

.web-view article strong,
.web-view article p {
  overflow: hidden;
  text-overflow: ellipsis;
}

.web-view article strong {
  font-size: 15px;
  white-space: nowrap;
}

.web-view article p {
  display: -webkit-box;
  color: #79747e;
  font-size: 12px;
  line-height: 1.45;
  margin: 0;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.web-view article span,
.web-view article i {
  border-radius: 999px;
  background: #f3edf7;
}

.web-view article span:nth-of-type(2) {
  width: 66%;
}

.web-view article i {
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #f9f6fb;
}

.web-view footer {
  overflow: hidden;
  border-top: 1px solid #d8d2e4;
  background: #f9f6fb;
  color: #79747e;
  font-size: 11px;
  padding: 7px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-player {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #2b2930;
  border-radius: 22px;
  background: #17151b;
  color: #f7f2fa;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.18);
}

.media-screen {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background:
    radial-gradient(circle at 35% 25%, rgb(208 188 255 / 0.35), transparent 30%),
    linear-gradient(135deg, #211f26, #101116);
}

.media-screen > span {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  min-width: 0;
}

.media-screen strong,
.media-screen small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-screen small {
  color: #cac4d0;
  font-size: 11px;
  margin-top: 3px;
}

.media-play {
  position: absolute;
  left: 50%;
  top: 50%;
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.14);
  color: white;
  font-size: 22px;
  transform: translate(-50%, -50%);
  box-shadow: 0 12px 28px rgb(0 0 0 / 0.24);
}

.media-player footer {
  border-top: 1px solid rgb(255 255 255 / 0.1);
  background: #211f26;
  padding: 12px;
}

.media-controls {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.media-controls button {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  color: #f7f2fa;
}

.media-controls small {
  color: #cac4d0;
  font-size: 11px;
  white-space: nowrap;
}

.media-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
}

.media-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #d0bcff;
}

.media-chapters {
  display: flex;
  gap: 6px;
  overflow: hidden;
  margin-top: 9px;
}

.media-chip {
  min-width: 0;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  color: #cac4d0;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-chip-active {
  background: #d0bcff;
  color: #381e72;
}

.pdf-viewer {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.pdf-viewer header {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: 9px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 8px 12px;
}

.pdf-viewer header span {
  min-width: 0;
  flex: 1;
}

.pdf-viewer header strong,
.pdf-viewer header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-viewer header small {
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.pdf-viewer header em {
  border-radius: 999px;
  background: #f3edf7;
  color: #79747e;
  flex: 0 0 auto;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  padding: 5px 8px;
}

.pdf-viewer header button,
.map-view header button {
  border: 0;
  border-radius: 10px;
  background: #eaddff;
  color: #4f378b;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 800;
  padding: 7px 9px;
}

.pdf-viewer main {
  display: flex;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.pdf-viewer aside {
  display: flex;
  width: 96px;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border-right: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 10px 8px;
}

.pdf-page {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #fffbff;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  padding: 7px;
  text-align: left;
}

.pdf-page-active {
  border-color: #6750a4;
  background: #eaddff;
  color: #4f378b;
}

.pdf-page i {
  display: block;
  height: 40px;
  border-radius: 6px;
  background: #f3edf7;
  margin-bottom: 6px;
}

.pdf-page span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-viewer article {
  display: flex;
  width: min(260px, 72%);
  min-width: 160px;
  max-height: 230px;
  flex: 0 1 auto;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 3px;
  background: white;
  color: #1d192b;
  margin: auto;
  padding: 16px;
  box-shadow: 0 12px 28px rgb(31 28 38 / 0.16);
}

.pdf-viewer article strong,
.pdf-viewer article span,
.pdf-viewer article p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-viewer article strong {
  font-size: 12px;
}

.pdf-viewer article span {
  display: block;
  height: 8px;
  border-radius: 999px;
  background: #d8d2e4;
}

.pdf-viewer article span:nth-of-type(2) {
  width: 66%;
}

.pdf-viewer article div {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: 1fr 0.8fr;
  gap: 8px;
  overflow: hidden;
}

.pdf-viewer article p {
  height: 6px;
  border-radius: 999px;
  background: #cac4d0;
  margin: 0 0 6px;
}

.pdf-viewer article b {
  display: block;
  height: 48px;
  border-radius: 8px;
  background: #f3edf7;
}

.pdf-viewer footer {
  display: flex;
  height: 36px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  overflow: hidden;
  border-top: 1px solid #d8d2e4;
  background: #f9f6fb;
  color: #79747e;
  font-size: 11px;
  padding: 0 12px;
}

.pdf-viewer footer span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-view {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.map-view header {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: 9px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 8px 12px;
}

.map-view header span {
  min-width: 0;
  flex: 1;
}

.map-view header strong,
.map-view header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-view header small {
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.map-canvas {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgb(20 108 67 / 0.13) 1px, transparent 1px),
    linear-gradient(180deg, rgb(20 108 67 / 0.13) 1px, transparent 1px),
    #eef4ef;
  background-size: 34px 34px;
}

.map-canvas svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: #146c43;
  opacity: 0.9;
}

.map-canvas path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 3;
}

.map-marker {
  position: absolute;
  display: flex;
  max-width: 38%;
  min-width: 0;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  border: 1px solid #146c43;
  border-radius: 999px;
  background: white;
  color: #146c43;
  font-size: 11px;
  font-weight: 800;
  padding: 6px 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow: 0 8px 18px rgb(31 28 38 / 0.12);
}

.map-marker i {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: currentColor;
}

.map-marker-1 {
  left: 15%;
  top: 58%;
}

.map-marker-2 {
  left: 48%;
  top: 34%;
}

.map-marker-3 {
  right: 14%;
  top: 24%;
  border-color: #ba1a1a;
  background: #ffdad6;
  color: #ba1a1a;
}

.map-canvas aside {
  position: absolute;
  left: 12px;
  bottom: 12px;
  max-width: 68%;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: rgb(255 255 255 / 0.9);
  padding: 9px 10px;
  box-shadow: 0 8px 18px rgb(31 28 38 / 0.12);
}

.map-canvas aside strong,
.map-canvas aside small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-canvas aside strong {
  font-size: 11px;
}

.map-canvas aside small {
  color: #49454f;
  font-size: 11px;
  margin-top: 3px;
}

.graphics-view {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.graphics-view header {
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 8px 12px;
}

.graphics-view header span {
  min-width: 0;
  flex: 1;
}

.graphics-view header strong,
.graphics-view header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.graphics-view header small {
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.graphics-view header em {
  border-radius: 999px;
  background: rgb(103 80 164 / 0.12);
  color: #6750a4;
  flex: 0 0 auto;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  padding: 5px 8px;
}

.graphics-scene {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgb(202 196 208 / 0.42) 1px, transparent 1px),
    linear-gradient(180deg, rgb(202 196 208 / 0.42) 1px, transparent 1px),
    #f9f6fb;
  background-size: 32px 32px;
}

.graphics-scene svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: rgb(103 80 164 / 0.48);
  pointer-events: none;
}

.graphics-scene path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 3;
}

.graphics-node {
  position: absolute;
  min-width: 108px;
  max-width: 46%;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  color: #49454f;
  padding: 9px 11px;
  text-align: left;
  box-shadow: 0 8px 18px rgb(31 28 38 / 0.12);
}

.graphics-node:hover,
.graphics-node-1 {
  border-color: #6750a4;
  background: #eaddff;
  color: #4f378b;
}

.graphics-node-1 {
  left: 12%;
  top: 18%;
}

.graphics-node-2 {
  right: 10%;
  top: 32%;
}

.graphics-node-3 {
  left: 30%;
  bottom: 16%;
}

.graphics-node strong {
  display: block;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.graphics-node span {
  display: block;
  width: 66%;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  margin-top: 7px;
  opacity: 0.22;
}

.graphics-view footer {
  display: flex;
  height: 40px;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  border-top: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 0 10px;
}

.graphics-view footer small {
  min-width: 0;
  overflow: hidden;
  border-radius: 999px;
  background: #f3edf7;
  color: #79747e;
  padding: 5px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.button {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 999px;
  background: #6750a4;
  color: white;
  font-weight: 700;
}

.button:disabled {
  cursor: not-allowed;
  background: #8b8495;
  opacity: 0.72;
}

.button-muted {
  border: 1px solid #d8d2e4;
  background: #f4eff7;
  color: #49454f;
}

.button-group {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  align-items: stretch;
  gap: 4px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  padding: 4px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.button-group-item {
  min-width: 0;
  flex: 1 1 0;
  overflow: hidden;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: #49454f;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  padding: 0 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.button-group-item:hover {
  background: #f4eff7;
}

.button-group-item-active {
  background: #e8def8;
  color: #4f378b;
  box-shadow: 0 4px 14px rgb(31 28 38 / 0.08);
}

.button-group-item:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.dialog-button-box {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  padding: 8px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.dialog-button {
  min-width: 76px;
  max-width: 140px;
  height: 36px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: transparent;
  color: #6750a4;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  padding: 0 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-button:hover {
  background: #f4eff7;
}

.dialog-button-primary {
  border-color: #6750a4;
  background: #6750a4;
  color: #fff;
}

.dialog-button-primary:hover {
  background: #5b4695;
}

.dialog-button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.command-link-button {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  grid-template-rows: 1fr 1fr;
  align-items: center;
  column-gap: 12px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px 14px;
  text-align: left;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.command-link-button:disabled {
  cursor: not-allowed;
  opacity: 0.64;
}

.command-link-button:not(:disabled):hover {
  border-color: #d0bcff;
  background: #f7f1fb;
}

.command-link-button span {
  display: grid;
  grid-row: 1 / 3;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 999px;
  background: #eaddff;
  color: #6750a4;
  font-size: 18px;
  font-weight: 800;
}

.command-link-button strong,
.command-link-button small,
.command-link-button em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-link-button strong {
  align-self: end;
  font-size: 14px;
}

.command-link-button small {
  align-self: start;
  color: #79747e;
  font-size: 12px;
}

.command-link-button em {
  grid-row: 1 / 3;
  border-radius: 999px;
  background: #f3edf7;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 5px 9px;
}

.split-button {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid rgb(103 80 164 / 0.18);
  border-radius: 999px;
  background: #6750a4;
  color: white;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.16);
}

.split-button button {
  min-width: 0;
  border: 0;
  background: transparent;
  color: inherit;
}

.split-button button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.split-button-main {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
}

.split-button-main strong,
.split-button-main small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.split-button-main strong {
  font-size: 13px;
}

.split-button-main small {
  max-width: 88px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.16);
  padding: 3px 8px;
  font-size: 11px;
}

.split-button-menu {
  width: 44px;
  flex: 0 0 auto;
  border-left: 1px solid rgb(255 255 255 / 0.2) !important;
  background: rgb(0 0 0 / 0.06) !important;
  font-size: 18px;
}

.split-button:not(.split-button-loading) button:hover {
  background: rgb(255 255 255 / 0.1);
}

.tool-button {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #f3edf7;
  color: #49454f;
  padding: 8px;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.07);
}

.tool-button:disabled {
  cursor: not-allowed;
  opacity: 0.64;
}

.tool-button:not(:disabled):hover {
  border-color: #d0bcff;
  background: #eaddff;
  color: #21005d;
}

.toggle-button-active {
  border-color: #6750a4;
  background: #eaddff;
  color: #21005d;
}

.toggle-button-active span {
  color: #4f378b;
}

.tool-button-danger {
  border-color: rgb(186 26 26 / 0.35);
  background: rgb(186 26 26 / 0.1);
  color: #ba1a1a;
}

.tool-button span {
  color: #6750a4;
  font-size: 16px;
  line-height: 1;
}

.tool-button strong {
  max-width: 100%;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  height: 100%;
  color: #49454f;
  font-size: 13px;
}

.field input,
.field textarea,
.field select {
  min-height: 40px;
  width: 100%;
  flex: 1;
  border: 1px solid #d8d2e4;
  border-radius: 12px;
  background: white;
  padding: 10px 12px;
}

.range-slider {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  color: #49454f;
  padding: 12px 14px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.range-slider > span,
.range-slider > small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.range-slider > span {
  font-size: 12px;
  font-weight: 700;
}

.range-slider > div {
  position: relative;
  height: 28px;
}

.range-slider > div::before {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 4px;
  border-radius: 999px;
  background: #e7e0ec;
  content: "";
  transform: translateY(-50%);
}

.range-slider > div i {
  position: absolute;
  top: 50%;
  height: 4px;
  border-radius: 999px;
  background: #6750a4;
  transform: translateY(-50%);
}

.range-slider input {
  position: absolute;
  inset: 0;
  width: 100%;
  margin: 0;
  appearance: none;
  background: transparent;
  pointer-events: none;
}

.range-slider input::-webkit-slider-thumb {
  width: 18px;
  height: 18px;
  border: 2px solid #6750a4;
  border-radius: 999px;
  appearance: none;
  background: #fffbff;
  box-shadow: 0 2px 10px rgb(31 28 38 / 0.18);
  pointer-events: auto;
}

.range-slider input:last-of-type::-webkit-slider-thumb {
  background: #6750a4;
}

.range-slider input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: 2px solid #6750a4;
  border-radius: 999px;
  background: #fffbff;
  box-shadow: 0 2px 10px rgb(31 28 38 / 0.18);
  pointer-events: auto;
}

.range-slider > small {
  color: #79747e;
  font-size: 11px;
}

.plain-text-edit,
.rich-text-editor,
.calendar-widget {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.plain-text-edit {
  background: #17151b;
  color: #f7f2fa;
}

.plain-text-edit > span,
.rich-text-editor header,
.calendar-widget header {
  display: flex;
  min-height: 38px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgb(216 210 228 / 0.82);
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 700;
}

.plain-text-edit > span {
  border-bottom-color: rgb(255 251 255 / 0.12);
  color: #eaddff;
}

.plain-text-edit textarea,
.rich-text-editor textarea {
  min-height: 0;
  min-width: 0;
  flex: 1;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  padding: 12px;
  line-height: 1.55;
}

.plain-text-edit textarea {
  color: #f7f2fa;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}

.plain-text-edit textarea::placeholder {
  color: rgb(247 242 250 / 0.48);
}

.plain-text-edit small,
.rich-text-editor > small,
.calendar-widget > small {
  overflow: hidden;
  border-top: 1px solid rgb(216 210 228 / 0.68);
  padding: 7px 12px;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plain-text-edit small {
  border-top-color: rgb(255 251 255 / 0.12);
  color: rgb(247 242 250 / 0.66);
}

.code-editor {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #2b2930;
  border-radius: 18px;
  background: #17151b;
  color: #f7f2fa;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.18);
}

.code-editor header,
.code-editor footer {
  display: flex;
  min-height: 38px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgb(255 251 255 / 0.1);
  background: #211f26;
  padding: 8px 12px;
}

.code-editor header span {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #f7f2fa;
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-editor header em,
.code-editor header b {
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  color: #d0bcff;
  flex: 0 0 auto;
  font-size: 10px;
  font-style: normal;
  font-weight: 800;
  padding: 4px 7px;
}

.code-editor > div {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: 42px minmax(0, 1fr);
  overflow: hidden;
}

.code-editor pre {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  overflow: hidden;
  border-right: 1px solid rgb(255 251 255 / 0.08);
  color: #79747e;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
  margin: 0;
  padding: 12px 9px;
  user-select: none;
}

.code-editor textarea {
  min-width: 0;
  min-height: 0;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  color: #f7f2fa;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
  padding: 12px;
}

.code-editor textarea::placeholder {
  color: rgb(247 242 250 / 0.46);
}

.code-editor footer {
  min-height: 32px;
  justify-content: space-between;
  border-top: 1px solid rgb(255 251 255 / 0.1);
  border-bottom: 0;
  color: #cac4d0;
  font-size: 11px;
}

.code-editor footer small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rich-text-editor header {
  justify-content: flex-start;
}

.rich-text-editor header small {
  min-width: 0;
  margin-left: auto;
  overflow: hidden;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rich-text-editor header button {
  width: 28px;
  height: 26px;
  border: 1px solid #d8d2e4;
  border-radius: 8px;
  background: #f7f2fa;
  color: #49454f;
  font-size: 12px;
  font-weight: 800;
}

.rich-text-editor header button:hover {
  border-color: #7d5260;
  background: #fceeee;
  color: #633b48;
}

.rich-text-editor textarea {
  color: #1d192b;
  font-size: 13px;
}

.calendar-widget {
  padding-bottom: 10px;
}

.calendar-widget header strong,
.calendar-widget header small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-widget header small {
  color: #79747e;
  font-size: 11px;
  font-weight: 600;
}

.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 5px;
  padding: 8px 10px 0;
}

.calendar-weekdays span {
  color: #79747e;
  font-size: 10px;
  font-weight: 800;
  text-align: center;
}

.calendar-day {
  min-width: 0;
  height: 30px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  font-weight: 700;
}

.calendar-day:hover {
  border-color: #d8d2e4;
  background: #f7f2fa;
}

.calendar-day-active {
  border-color: #7d5260;
  background: #ffd8e4;
  color: #633b48;
}

.password-field-control {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 8px;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  padding: 4px 4px 4px 10px;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.07);
}

.password-field-control > span {
  flex: 0 0 auto;
  color: #79747e;
  font-size: 14px;
}

.password-field .password-field-control input {
  min-width: 0;
  min-height: 34px;
  flex: 1;
  border: 0;
  background: transparent;
  color: #1d192b;
  padding: 0;
}

.password-field .password-field-control button {
  height: 34px;
  flex: 0 0 auto;
  border: 1px solid transparent;
  border-radius: 10px;
  background: #f3edf7;
  color: #49454f;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
}

.password-field .password-field-control button:hover {
  border-color: #d0bcff;
  background: #eaddff;
  color: #21005d;
}

.password-field small {
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.number-field-control {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 8px;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  padding: 4px;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.07);
}

.number-field .number-field-control input {
  min-width: 0;
  min-height: 34px;
  flex: 1;
  border: 0;
  background: transparent;
  color: #1d192b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  text-align: right;
}

.number-field .number-field-control button {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border: 1px solid transparent;
  border-radius: 10px;
  background: #f3edf7;
  color: #49454f;
  font-size: 18px;
  font-weight: 700;
}

.number-field .number-field-control button:hover {
  border-color: #d0bcff;
  background: #eaddff;
  color: #21005d;
}

.number-field small {
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spin-box-control {
  display: flex;
  min-height: 42px;
  flex: 1;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.07);
}

.spin-box input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1d192b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 14px;
  font-weight: 700;
  padding: 0 10px;
  text-align: right;
}

.spin-box-control > span {
  display: grid;
  width: 36px;
  flex: 0 0 auto;
  grid-template-rows: 1fr 1fr;
  border-left: 1px solid #d8d2e4;
}

.spin-box-control button {
  border: 0;
  background: #f3edf7;
  color: #49454f;
  font-size: 12px;
}

.spin-box-control button + button {
  border-top: 1px solid #d8d2e4;
}

.spin-box-control button:hover {
  background: #eaddff;
  color: #21005d;
}

.spin-box small {
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.double-spin-box .spin-box-control > span {
  width: 42px;
}

.double-spin-box .spin-box-control button {
  font-size: 10px;
  font-weight: 700;
}

.dial {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #49454f;
  padding: 10px;
  text-align: center;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.dial > span,
.dial small {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dial > span {
  color: #49454f;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.dial-face {
  position: relative;
  display: grid;
  width: 78px;
  height: 78px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: radial-gradient(circle, #fffbff 0 48%, #f3edf7 49% 100%);
  color: #1d192b;
}

.dial-face i {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 4px;
  height: 27px;
  transform-origin: 50% 31px;
  border-radius: 999px;
  background: #6750a4;
}

.dial-face strong {
  font-size: 14px;
}

.dial input[type="range"] {
  width: 86%;
  height: 18px;
  accent-color: #6750a4;
  margin-top: 7px;
}

.dial small {
  color: #79747e;
  font-size: 11px;
}

.scroll-bar {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  color: #49454f;
  padding: 8px 10px;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.07);
}

.scroll-bar > span,
.scroll-bar small {
  overflow: hidden;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scroll-bar div {
  display: grid;
  min-width: 0;
  grid-template-columns: 30px minmax(0, 1fr) 30px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 12px;
  background: #f9f6fb;
}

.scroll-bar button {
  border: 0;
  background: #f3edf7;
  color: #49454f;
  font-size: 11px;
}

.scroll-bar button:first-child {
  border-right: 1px solid #d8d2e4;
}

.scroll-bar button:last-child {
  border-left: 1px solid #d8d2e4;
}

.scroll-bar input[type="range"] {
  width: 100%;
  height: 28px;
  accent-color: #6750a4;
}

.scroll-bar small {
  color: #79747e;
}

.color-picker,
.file-picker,
.shortcut-recorder {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  gap: 9px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  color: #49454f;
  padding: 12px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.color-picker header,
.file-picker > span,
.shortcut-recorder > span {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
}

.color-picker code {
  overflow: hidden;
  color: #79747e;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.color-picker-body,
.file-picker div,
.shortcut-recorder div {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.color-picker input[type="color"] {
  width: 42px;
  height: 34px;
  flex: 0 0 auto;
  border: 1px solid #d8d2e4;
  border-radius: 12px;
  background: white;
  padding: 3px;
}

.color-swatch {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgb(31 28 38 / 0.1);
}

.color-swatch-active {
  outline: 2px solid rgb(103 80 164 / 0.35);
  outline-offset: 2px;
}

.color-picker small,
.file-picker small {
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-picker input {
  min-width: 0;
  height: 40px;
  flex: 1;
  border: 1px solid #d8d2e4;
  border-radius: 12px;
  background: #f9f6fb;
  color: #1d192b;
  padding: 0 10px;
}

.file-picker .button {
  width: auto;
  height: 40px;
  min-width: 82px;
  padding: 0 14px;
}

.shortcut-recorder {
  border: 1px solid #d8d2e4;
  cursor: pointer;
  text-align: left;
}

.shortcut-recorder div {
  overflow: hidden;
}

.shortcut-recorder kbd {
  flex: 0 0 auto;
  border: 1px solid #d8d2e4;
  border-bottom-color: #c8c0d4;
  border-radius: 9px;
  background: #f3edf7;
  color: #1d192b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 9px;
  box-shadow: inset 0 -1px 0 rgb(31 28 38 / 0.12);
}

.shortcut-recorder small {
  min-width: 0;
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.combobox input {
  background-image: linear-gradient(45deg, transparent 50%, #79747e 50%), linear-gradient(135deg, #79747e 50%, transparent 50%);
  background-position: calc(100% - 18px) 18px, calc(100% - 13px) 18px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  padding-right: 34px;
}

.autocomplete-field {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 120px;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  padding: 12px;
  box-shadow: 0 10px 28px rgb(31 28 38 / 0.08);
}

.autocomplete-field label {
  display: grid;
  gap: 6px;
  color: #49454f;
  font-size: 12px;
  font-weight: 700;
}

.autocomplete-field input {
  width: 100%;
  min-width: 0;
  height: 38px;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fef7ff;
  color: #1d192b;
  font-size: 14px;
  outline: none;
  padding: 0 12px;
}

.autocomplete-field input:focus {
  border-color: #6750a4;
  box-shadow: 0 0 0 3px rgb(103 80 164 / 0.14);
}

.autocomplete-options {
  display: grid;
  min-height: 0;
  gap: 4px;
  overflow: hidden;
}

.autocomplete-option {
  display: flex;
  min-width: 0;
  height: 30px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #49454f;
  cursor: pointer;
  font: inherit;
  padding: 0 9px;
  text-align: left;
}

.autocomplete-option span:first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.autocomplete-option:hover {
  background: #f4eff7;
}

.autocomplete-option-active {
  background: #eaddff;
  color: #21005d;
  font-weight: 700;
}

.autocomplete-empty {
  border: 1px dashed #cac4d0;
  border-radius: 10px;
  color: #79747e;
  font-size: 12px;
  padding: 8px;
}

.autocomplete-field > small {
  min-width: 0;
  overflow: hidden;
  color: #79747e;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-combo-box select {
  min-height: 42px;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background-color: #fffbff;
  color: #1d192b;
  font-size: 14px;
  padding: 0 34px 0 12px;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.07);
}

.search-bar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 10px;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: #f4eff7;
  padding: 0 16px;
  color: #49454f;
}

.search-bar input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1d1b20;
}

.search-bar small {
  max-width: 35%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-picker input {
  flex: 1;
}

.date-range-picker {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #f9f6fb;
  color: #1d192b;
  padding: 14px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.date-range-picker header {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.date-range-picker header strong,
.date-range-picker header small,
.date-range-presets button {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-range-picker header small {
  color: #79747e;
  font-size: 12px;
}

.date-range-fields {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 8px;
}

.date-range-fields label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
  color: #79747e;
  font-size: 11px;
  font-weight: 650;
}

.date-range-fields input {
  min-width: 0;
  height: 38px;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  color: #1d192b;
  padding: 0 10px;
}

.date-range-presets {
  display: flex;
  min-width: 0;
  gap: 6px;
  overflow: hidden;
}

.date-range-presets button {
  min-width: 0;
  border: 0;
  border-radius: 999px;
  background: #e8def8;
  color: #4f378b;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 750;
}

.time-picker input {
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 16px;
  font-weight: 700;
}

.date-time-picker input {
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  font-weight: 700;
}

.feedback {
  color: #5f5a68;
  font-size: 11px;
}

.feedback-error {
  color: #b3261e;
}

.check,
.panel-row,
.card {
  display: flex;
  width: 100%;
  height: 100%;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: white;
  padding: 16px;
}

.check {
  align-items: center;
  gap: 10px;
}

.panel-row {
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.card {
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.system-tray {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.system-tray header {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #f9f6fb;
  padding: 8px 10px;
}

.system-tray-mark {
  position: relative;
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 16px;
  background: #eaddff;
  color: #6750a4;
  font-size: 18px;
  font-weight: 900;
}

.system-tray-mark i {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border: 2px solid #fffbff;
  border-radius: 999px;
  background: #006b5f;
}

.system-tray header div {
  min-width: 0;
  flex: 1;
}

.system-tray strong,
.system-tray small,
.system-tray p,
.system-tray em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.system-tray header strong {
  display: block;
  font-size: 13px;
}

.system-tray header small {
  display: block;
  margin-top: 2px;
  color: #79747e;
  font-size: 11px;
}

.system-tray header em {
  max-width: 58px;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
}

.system-tray p {
  margin: 0;
  color: #79747e;
  font-size: 12px;
}

.system-tray-menu {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 6px;
  overflow: hidden;
}

.system-tray-row {
  display: grid;
  width: 100%;
  min-width: 0;
  grid-template-columns: 16px minmax(0, 1fr) 42px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  background: #f9f6fb;
  color: #49454f;
  padding: 8px 9px;
  text-align: left;
}

.system-tray-row-active,
.system-tray-row:hover {
  background: #eaddff;
  color: #4f378b;
}

.system-tray-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #6750a4;
}

.system-tray-dot-warn {
  background: #7d5260;
}

.system-tray-dot-danger {
  background: #ba1a1a;
}

.system-tray-row small {
  color: inherit;
  font-size: 10px;
  text-align: right;
}

.runtime-card {
  overflow: hidden;
  border-radius: 22px;
  background: #fffbff;
  padding: 18px;
  color: #1d192b;
  text-align: left;
}

button.runtime-card {
  cursor: pointer;
}

button.runtime-card:hover {
  filter: brightness(0.985);
}

.elevated-card {
  border-color: transparent;
  background: #fffbff;
  box-shadow: 0 12px 30px rgb(31 28 38 / 0.16);
}

.filled-card {
  border-color: transparent;
  background: #f3edf7;
  box-shadow: 0 4px 14px rgb(31 28 38 / 0.08);
}

.outlined-card {
  border-color: #79747e;
  background: #fffbff;
  box-shadow: none;
}

.runtime-card-header {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.runtime-card-header span {
  min-width: 0;
}

.runtime-card-header strong,
.runtime-card-header p,
.runtime-card small {
  overflow: hidden;
  text-overflow: ellipsis;
}

.runtime-card-header strong {
  display: block;
  color: #1d192b;
  font-size: 15px;
  font-weight: 750;
  white-space: nowrap;
}

.runtime-card-header p {
  display: -webkit-box;
  margin: 8px 0 0;
  color: #79747e;
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.runtime-card-header em {
  flex: 0 0 auto;
  max-width: 84px;
  overflow: hidden;
  border-radius: 999px;
  background: #e8def8;
  color: #4f378b;
  padding: 5px 9px;
  font-size: 11px;
  font-style: normal;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runtime-card progress {
  margin-top: auto;
}

.runtime-card small {
  display: block;
  color: #79747e;
  font-size: 11px;
  white-space: nowrap;
}

.group-box {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 18px 16px 16px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.group-box legend {
  max-width: 80%;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: #fffbff;
  color: #1d192b;
  font-size: 12px;
  font-weight: 800;
  padding: 5px 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-box p {
  display: -webkit-box;
  overflow: hidden;
  color: #79747e;
  font-size: 12px;
  line-height: 1.5;
  margin: 0 0 10px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.group-box > div {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 8px;
  overflow: hidden;
}

.group-box label {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 58px;
  align-items: center;
  gap: 10px;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #f9f6fb;
  color: #49454f;
  font-size: 12px;
  padding: 8px 10px;
}

.group-box label span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-box-meter {
  height: 8px;
  border-radius: 999px;
  background: #e7e0ec;
}

.group-box-meter-active {
  background: #6750a4;
}

.spacer {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px dashed #79747e;
  border-radius: 18px;
  background: #f9f6fb;
  color: #79747e;
  padding: 10px;
  text-align: center;
}

.spacer span {
  color: #6750a4;
  font-size: 18px;
  line-height: 1;
}

.spacer strong,
.spacer small {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spacer strong {
  color: #1d192b;
  font-size: 12px;
  margin-top: 4px;
}

.spacer small {
  font-size: 11px;
  margin-top: 2px;
}

.tab-row,
.toolbar-actions {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.tab-row .button,
.toolbar-actions .button {
  width: auto;
  height: 32px;
  padding: 0 12px;
  white-space: nowrap;
}

.segmented {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 4px;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: #f3edf7;
  padding: 4px;
}

.segment {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #49454f;
  padding: 9px 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.segment-active {
  background: #e8def8;
  color: #1d192b;
  box-shadow: 0 4px 14px rgb(31 28 38 / 0.12);
}

.rating-control {
  justify-content: center;
  gap: 8px;
}

.rating-stars {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 4px;
}

.rating-star {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 12px;
  background: #f3edf7;
  color: #79747e;
  font-size: 17px;
}

.rating-star-active {
  background: #e8def8;
  color: #6750a4;
}

.chip-set {
  display: flex;
  width: 100%;
  height: 100%;
  flex-wrap: wrap;
  align-content: center;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  padding: 10px;
}

.tag-input {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  padding: 10px;
}

.tag-input label {
  display: grid;
  min-width: 0;
  gap: 6px;
}

.tag-input label span {
  overflow: hidden;
  color: #49454f;
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-input input {
  width: 100%;
  min-width: 0;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #f9f6fb;
  color: #1d192b;
  padding: 8px 10px;
}

.tag-input .chip-set {
  height: auto;
  min-height: 0;
  align-content: start;
  overflow: hidden;
  padding: 6px;
}

.chip {
  max-width: 100%;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: #f9f6fb;
  color: #49454f;
  padding: 8px 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-active {
  border-color: #6750a4;
  background: #e8def8;
  color: #1d192b;
}

.md3-chip {
  display: inline-flex;
  height: 40px;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.md3-chip span,
.md3-chip em {
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgb(103 80 164 / 0.12);
  color: #6750a4;
  font-style: normal;
}

.floating-toolbar {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: rgb(255 251 255 / 0.94);
  padding: 8px;
  box-shadow: 0 10px 28px rgb(31 28 38 / 0.18);
}

.floating-toolbar > span {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #eaddff;
  color: #6750a4;
}

.floating-toolbar strong {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #1d192b;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.floating-toolbar-action {
  max-width: 72px;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #49454f;
  padding: 8px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 800;
}

.floating-toolbar-action-active {
  background: #e8def8;
  color: #1d192b;
}

.menu-card {
  padding: 10px;
}

.menu-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #1d1b20;
  padding: 10px 12px;
  text-align: left;
}

.menu-item:hover {
  background: #f3edf7;
}

.menu-item-active {
  background: #e8def8;
  color: #21005d;
  font-weight: 700;
}

.menu-item-active:hover {
  background: #eaddff;
}

.list-row {
  width: 100%;
  border: 0;
  border-radius: 12px;
  background: #f9f6fb;
  color: #1d1b20;
  padding: 10px 12px;
  text-align: left;
}

.command-list {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.1);
}

.command-list header {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
  border-bottom: 1px solid #d8d2e4;
  padding: 12px 14px 10px;
}

.command-list header strong,
.command-list header small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-list header small {
  color: #79747e;
}

.command-list label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 12px 8px;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  background: #f9f6fb;
  color: #6750a4;
  padding: 0 12px;
}

.command-list input {
  min-width: 0;
  height: 38px;
  flex: 1;
  border: 0;
  background: transparent;
  color: #1d192b;
  outline: none;
}

.search-view > small {
  margin: 0 12px 10px;
}

.command-list-results {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 0 8px 8px;
}

.command-list-row {
  display: grid;
  width: 100%;
  grid-template-columns: 28px minmax(0, 1fr) 46px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #49454f;
  padding: 8px;
  text-align: left;
}

.command-list-row:hover,
.command-list-row-active {
  background: #e8def8;
  color: #1d192b;
}

.command-list-row span {
  display: flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #fffbff;
  color: #6750a4;
  font-size: 11px;
  font-weight: 700;
}

.command-list-row strong,
.command-list-row small,
.command-list-empty {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-list-row strong {
  min-width: 0;
  font-size: 13px;
}

.command-list-row small {
  justify-self: end;
  color: #79747e;
  font-size: 11px;
}

.command-list-empty {
  border: 1px dashed #d8d2e4;
  border-radius: 14px;
  color: #79747e;
  padding: 14px;
  text-align: center;
}

.tree-view {
  padding: 14px;
}

.tree-root,
.tree-row {
  display: block;
  width: 100%;
  overflow: hidden;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #49454f;
  padding: 8px 10px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-row {
  margin-left: 16px;
  width: calc(100% - 16px);
}

.tree-row-active {
  background: #e8def8;
  color: #1d192b;
}

.tree-table {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.tree-table header {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
  border-bottom: 1px solid #d8d2e4;
  padding: 12px 14px;
}

.tree-table header strong,
.tree-table header small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-table header small {
  color: #79747e;
}

.tree-table-head,
.tree-table-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 82px 70px;
  align-items: center;
  gap: 8px;
}

.tree-table-head {
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 12px;
  text-transform: uppercase;
}

.tree-table-body {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.tree-table-row {
  width: 100%;
  border: 0;
  border-bottom: 1px solid #d8d2e4;
  background: transparent;
  color: #49454f;
  padding: 9px 12px;
  text-align: left;
}

.tree-table-row:hover,
.tree-table-row-active {
  background: rgb(103 80 164 / 0.1);
  color: #1d192b;
}

.tree-table-row span,
.tree-table-row b,
.tree-table-row small,
.tree-table-row em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-table-row span {
  display: flex;
  min-width: 0;
  gap: 6px;
}

.tree-table-row b {
  min-width: 0;
  font-size: 13px;
}

.tree-table-row small {
  border-radius: 999px;
  background: #e8def8;
  color: #1d192b;
  padding: 3px 8px;
  font-size: 11px;
}

.tree-table-row em {
  color: #79747e;
  font-style: normal;
  font-size: 12px;
}

.top-app-bar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: white;
  padding: 10px 12px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.top-app-bar > span {
  min-width: 0;
  flex: 1;
}

.top-app-bar small {
  display: block;
  overflow: hidden;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-app-bar > div {
  display: flex;
  gap: 6px;
}

.bottom-app-bar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 24px;
  background: white;
  padding: 10px 12px;
  box-shadow: 0 10px 28px rgb(31 28 38 / 0.1);
}

.bottom-app-bar > span {
  min-width: 0;
  flex: 1;
}

.bottom-app-bar small {
  display: block;
  overflow: hidden;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-app-bar > div {
  display: flex;
  gap: 6px;
}

.bottom-app-bar .button {
  width: auto;
  height: 34px;
  padding: 0 12px;
  white-space: nowrap;
}

.icon-button {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 999px;
  background: #f3edf7;
  color: #49454f;
  font-weight: 700;
}

.icon-action-button {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 999px;
  background: #e8def8;
  color: #1d192b;
  font-size: 18px;
  font-weight: 700;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.12);
}

.carousel {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 26px;
  background: #f9f6fb;
  padding: 12px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.carousel-card {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px;
  text-align: left;
}

.carousel-card-active {
  flex: 1.35;
  background: #e8def8;
}

.carousel-card span {
  width: 32px;
  height: 32px;
  margin-bottom: auto;
  border-radius: 14px;
  background: rgb(255 251 255 / 0.72);
  color: #6750a4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.carousel-card strong,
.carousel-card small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.carousel-card small {
  color: #79747e;
}

.fab-mini {
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 18px;
  background: #6750a4;
  color: white;
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 8px 20px rgb(31 28 38 / 0.18);
}

.navigation-bar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-around;
  gap: 4px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 28px;
  background: #f9f6fb;
  padding: 8px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.nav-bar-item {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  border: 0;
  border-radius: 18px;
  background: transparent;
  color: #79747e;
  padding: 6px;
  font-size: 12px;
  font-weight: 600;
}

.nav-bar-item span {
  display: flex;
  min-width: 54px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
}

.nav-bar-item-active {
  color: #1d192b;
}

.nav-bar-item-active span {
  background: #e8def8;
}

.navigation-suite {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 78px minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) 72px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 28px;
  background: #f9f6fb;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.1);
}

.navigation-suite aside {
  display: flex;
  min-height: 0;
  grid-row: 1 / span 2;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid #d8d2e4;
  background: #f3edf7;
  padding: 12px 8px;
}

.navigation-suite aside > strong {
  display: flex;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #6750a4;
  color: white;
  font-size: 12px;
  margin: 0 auto;
}

.navigation-suite main {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
}

.navigation-suite main header {
  min-width: 0;
}

.navigation-suite main small,
.navigation-suite main strong,
.navigation-suite main p,
.navigation-suite footer,
.navigation-suite-bar-item,
.navigation-suite-rail-item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navigation-suite main small {
  color: #6750a4;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
}

.navigation-suite main strong {
  display: block;
  margin-top: 4px;
  font-size: 16px;
}

.navigation-suite main p {
  color: #79747e;
  font-size: 12px;
}

.navigation-suite main div {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 8px;
}

.navigation-suite main div span,
.navigation-suite main div i {
  border-radius: 16px;
  background: #f3edf7;
}

.navigation-suite main div span:first-child {
  width: 78%;
}

.navigation-suite main div span:nth-child(2) {
  width: 56%;
}

.navigation-suite main div i {
  min-height: 54px;
  background: #e8def8;
}

.navigation-suite footer {
  border-radius: 999px;
  background: #fffbff;
  color: #6750a4;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 750;
}

.navigation-suite nav {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-around;
  gap: 4px;
  border-top: 1px solid #d8d2e4;
  background: #f3edf7;
  padding: 8px;
}

.navigation-suite-rail-item,
.navigation-suite-bar-item {
  min-width: 0;
  border: 0;
  border-radius: 18px;
  background: transparent;
  color: #79747e;
  font-size: 11px;
  font-weight: 650;
}

.navigation-suite-rail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
}

.navigation-suite-bar-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px;
}

.navigation-suite-item-active {
  background: #e8def8;
  color: #1d192b;
}

.menu-bar,
.breadcrumb-bar,
.status-bar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  padding: 4px 8px;
  box-shadow: 0 6px 18px rgb(31 28 38 / 0.08);
}

.menu-bar span,
.status-bar span,
.breadcrumb-bar span {
  min-width: 0;
}

.menu-bar > span,
.status-bar > span {
  flex: 1;
  overflow: hidden;
  color: #79747e;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-bar-item,
.breadcrumb-item,
.status-bar button {
  height: 30px;
  min-width: 0;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #49454f;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}

.menu-bar-item-active,
.breadcrumb-item-active,
.status-bar button {
  background: #e8def8;
  color: #1d192b;
}

.breadcrumb-bar {
  gap: 2px;
}

.breadcrumb-bar > span {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #79747e;
  font-size: 12px;
}

.status-bar small {
  flex: 0 0 auto;
  border-radius: 999px;
  background: #f3edf7;
  color: #79747e;
  padding: 4px 8px;
  font-size: 11px;
}

.split-view {
  display: grid;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 24px;
  background: #f9f6fb;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.split-pane {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border: 0;
  background: transparent;
  color: #1d192b;
  padding: 12px;
  text-align: left;
}

.split-pane span {
  height: 28px;
  border-radius: 10px;
  background: #f3edf7;
}

.split-pane i {
  min-height: 0;
  flex: 1;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
}

.split-pane-main i {
  background: linear-gradient(90deg, #f3edf7 0 48%, #fffbff 48% 100%);
}

.split-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d8d2e4;
}

.split-handle::after {
  width: 4px;
  height: 40px;
  border-radius: 999px;
  background: #79747e;
  content: "";
}

.splitter {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #f9f6fb;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.splitter header {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #d8d2e4;
  padding: 9px 12px;
}

.splitter header span {
  min-width: 0;
  flex: 1;
}

.splitter header strong,
.splitter header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.splitter header small {
  color: #79747e;
  font-size: 11px;
}

.splitter header em {
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
}

.splitter-body {
  display: grid;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.splitter-pane {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  padding: 12px;
}

.splitter-pane strong,
.splitter-pane small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.splitter-pane span {
  height: 28px;
  border-radius: 10px;
  background: #f3edf7;
}

.splitter-pane-main span {
  min-height: 0;
  flex: 1;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
}

.splitter-handle {
  position: relative;
  display: grid;
  min-width: 0;
  place-items: center;
  background: #d8d2e4;
  cursor: col-resize;
}

.splitter-handle input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: col-resize;
  opacity: 0;
}

.splitter-handle i {
  width: 5px;
  height: 44px;
  border-radius: 999px;
  background: #6750a4;
  pointer-events: none;
}

.size-grip {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px;
  text-align: left;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
  cursor: nwse-resize;
}

.size-grip span {
  min-width: 0;
  max-width: calc(100% - 34px);
}

.size-grip strong,
.size-grip small,
.size-grip em {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size-grip strong {
  font-size: 12px;
}

.size-grip small {
  margin-top: 4px;
  color: #79747e;
  font-size: 11px;
}

.size-grip em {
  width: fit-content;
  max-width: 100%;
  margin-top: 10px;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
}

.size-grip i {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 34px;
  height: 34px;
  border-right: 2px solid #79747e;
  border-bottom: 2px solid #79747e;
  border-bottom-right-radius: 12px;
}

.size-grip b {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 22px;
  height: 22px;
  border-right: 2px solid #d8d2e4;
  border-bottom: 2px solid #d8d2e4;
  border-bottom-right-radius: 8px;
}

.size-grip b:last-child {
  right: 16px;
  bottom: 16px;
  width: 10px;
  height: 10px;
}

.size-grip:hover {
  border-color: #6750a4;
  background: #f7f2fa;
}

.supporting-pane {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: minmax(0, 1fr) minmax(150px, 220px);
  grid-template-rows: minmax(0, 1fr) 48px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 26px;
  background: #f9f6fb;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.1);
}

.supporting-pane main {
  min-width: 0;
  min-height: 0;
  padding: 16px;
}

.supporting-pane main header {
  min-width: 0;
}

.supporting-pane main small,
.supporting-pane main strong,
.supporting-pane main p,
.supporting-pane aside header strong,
.supporting-pane-item strong,
.supporting-pane-item small,
.supporting-pane footer {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.supporting-pane main small {
  color: #6750a4;
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
}

.supporting-pane main strong {
  display: block;
  margin-top: 4px;
  font-size: 16px;
}

.supporting-pane main p {
  color: #79747e;
  font-size: 12px;
}

.supporting-pane main div {
  display: grid;
  min-height: 0;
  height: calc(100% - 70px);
  gap: 8px;
  margin-top: 14px;
}

.supporting-pane main div span,
.supporting-pane main div i,
.supporting-pane main div b {
  border-radius: 16px;
  background: #f3edf7;
}

.supporting-pane main div span:first-child {
  width: 74%;
  height: 12px;
}

.supporting-pane main div span:nth-child(2) {
  width: 52%;
  height: 12px;
}

.supporting-pane main div i {
  min-height: 54px;
  background: #e8def8;
}

.supporting-pane main div b {
  min-height: 0;
  border: 1px solid #d8d2e4;
  background: #fffbff;
}

.supporting-pane aside {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-left: 1px solid #d8d2e4;
  background: #f3edf7;
  padding: 12px;
}

.supporting-pane aside header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.supporting-pane aside header em {
  flex: 0 0 auto;
  border-radius: 999px;
  background: #e8def8;
  color: #4f378b;
  padding: 4px 8px;
  font-size: 11px;
  font-style: normal;
  font-weight: 750;
}

.supporting-pane-item {
  display: block;
  width: 100%;
  min-width: 0;
  border: 0;
  border-radius: 18px;
  background: #fffbff;
  color: #49454f;
  margin-bottom: 8px;
  padding: 10px;
  text-align: left;
}

.supporting-pane-item strong,
.supporting-pane-item small {
  display: block;
}

.supporting-pane-item small {
  margin-top: 4px;
  color: #79747e;
  font-size: 11px;
}

.supporting-pane-item-active {
  background: #e8def8;
  color: #1d192b;
  box-shadow: 0 4px 14px rgb(31 28 38 / 0.1);
}

.supporting-pane footer {
  grid-column: 1 / span 2;
  border-top: 1px solid #d8d2e4;
  color: #79747e;
  padding: 14px 16px;
  font-size: 12px;
}

.scroll-area {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.scroll-area header {
  display: grid;
  min-height: 50px;
  grid-template-columns: 22px minmax(0, 1fr) 8px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d8d2e4;
  padding: 10px 12px;
}

.scroll-area header > span {
  color: #6750a4;
}

.scroll-area header div,
.scroll-area header strong,
.scroll-area header small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scroll-area header small {
  display: block;
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.scroll-area header i {
  width: 6px;
  height: 30px;
  border-radius: 999px;
  background: #d8d2e4;
}

.scroll-area-body {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 8px 10px 8px 8px;
}

.scroll-area-row {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) 54px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #49454f;
  padding: 8px 10px;
  text-align: left;
}

.scroll-area-row:hover,
.scroll-area-row-active {
  background: rgb(103 80 164 / 0.1);
  color: #1d192b;
}

.scroll-area-row strong,
.scroll-area-row small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scroll-area-row strong {
  min-width: 0;
  font-size: 12px;
}

.scroll-area-row small {
  color: #79747e;
  font-size: 11px;
  text-align: right;
}

.stacked-pages {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.stacked-pages header {
  display: grid;
  min-height: 50px;
  grid-template-columns: 22px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d8d2e4;
  padding: 10px 12px;
}

.stacked-pages header > span {
  color: #6750a4;
}

.stacked-pages header div,
.stacked-pages header strong,
.stacked-pages header small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stacked-pages header small {
  display: block;
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.stacked-pages nav {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  padding: 6px 8px;
}

.stacked-page-tab {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #79747e;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stacked-page-tab-active {
  background: #eaddff;
  color: #4f378b;
}

.stacked-page-body {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 10px;
  padding: 12px;
}

.stacked-page-body strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stacked-page-body span,
.stacked-page-body i {
  border-radius: 12px;
  background: #f3edf7;
}

.stacked-page-body span {
  height: 26px;
}

.stacked-page-body i {
  min-height: 0;
  border: 1px solid #d8d2e4;
  background: #fffbff;
}

.tool-box {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.tool-box header {
  border-bottom: 1px solid #d8d2e4;
  padding: 12px 14px;
}

.tool-box header strong,
.tool-box header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-box header small {
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.tool-box-item {
  display: grid;
  width: calc(100% - 16px);
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #49454f;
  margin: 4px 8px;
  padding: 9px 10px;
  text-align: left;
}

.tool-box-item:hover,
.tool-box-item-active {
  background: rgb(103 80 164 / 0.1);
  color: #1d192b;
}

.tool-box-item span,
.tool-box-item strong,
.tool-box-item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-box-item span {
  color: #6750a4;
}

.tool-box-item strong {
  min-width: 0;
  font-size: 13px;
}

.tool-box-item small {
  grid-column: 2;
  color: #79747e;
  font-size: 11px;
  margin-top: -2px;
}

.dock-panel {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.dock-panel header {
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 8px 10px 8px 12px;
}

.dock-panel header span {
  min-width: 0;
  flex: 1;
}

.dock-panel header small {
  display: block;
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dock-panel header button {
  width: 26px;
  height: 26px;
  border: 1px solid #d8d2e4;
  border-radius: 8px;
  background: #f3edf7;
  color: #49454f;
}

.dock-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  padding: 6px 8px;
}

.dock-tab {
  min-width: 0;
  flex: 1;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #79747e;
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  padding: 7px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dock-tab-active {
  background: #eaddff;
  color: #4f378b;
}

.dock-panel-body {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 10px;
  padding: 12px;
}

.dock-panel-body span,
.dock-panel-body i {
  border-radius: 12px;
  background: #f3edf7;
}

.dock-panel-body span {
  height: 28px;
}

.dock-panel-body i {
  min-height: 0;
  border: 1px solid #d8d2e4;
  background: #fffbff;
}

.chart-view {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.chart-view header {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 9px 12px;
}

.chart-view header span {
  min-width: 0;
  flex: 1;
}

.chart-view header strong,
.chart-view header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-view header small {
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.chart-view header em {
  border-radius: 999px;
  background: rgb(103 80 164 / 0.12);
  color: #6750a4;
  flex: 0 0 auto;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  padding: 5px 8px;
}

.chart-plot {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background: #fffbff;
  margin: 12px;
  border: 1px solid #d8d2e4;
  border-radius: 16px;
}

.chart-plot svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.chart-grid {
  fill: none;
  stroke: #d8d2e4;
  stroke-width: 1;
}

.chart-line {
  fill: none;
  stroke: #6750a4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 4;
}

.chart-bars {
  position: absolute;
  inset: auto 14px 12px;
  display: flex;
  height: 48%;
  align-items: flex-end;
  gap: 7px;
}

.chart-bars i {
  min-width: 0;
  flex: 1;
  border-radius: 10px 10px 0 0;
  background: rgb(103 80 164 / 0.16);
}

.chart-view footer {
  display: flex;
  height: 40px;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  border-top: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 0 10px;
}

.chart-legend {
  min-width: 0;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: #f3edf7;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-legend-active {
  background: #eaddff;
  color: #4f378b;
}

.mdi-area {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.mdi-area header {
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 8px 12px;
}

.mdi-area header span {
  min-width: 0;
  flex: 1;
}

.mdi-area header strong,
.mdi-area header small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mdi-area header small {
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.mdi-area header em {
  border-radius: 999px;
  background: rgb(103 80 164 / 0.12);
  color: #6750a4;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  padding: 5px 8px;
}

.mdi-stage {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  background: #f3edf7;
}

.mdi-window {
  position: absolute;
  display: flex;
  min-width: 132px;
  min-height: 92px;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  color: #49454f;
  padding: 0;
  text-align: left;
  box-shadow: 0 10px 24px rgb(31 28 38 / 0.12);
}

.mdi-window-active {
  z-index: 4;
  border-color: #6750a4;
  color: #1d192b;
  box-shadow: 0 14px 32px rgb(31 28 38 / 0.18);
}

.mdi-window-a {
  left: 5%;
  top: 14%;
  width: 56%;
  height: 58%;
}

.mdi-window-b {
  right: 7%;
  top: 24%;
  width: 46%;
  height: 50%;
}

.mdi-window-c {
  left: 24%;
  bottom: 8%;
  width: 50%;
  height: 38%;
}

.mdi-window-title {
  display: flex;
  min-height: 32px;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 7px 9px;
}

.mdi-window-active .mdi-window-title {
  border-color: rgb(103 80 164 / 0.24);
  background: #eaddff;
  color: #4f378b;
}

.mdi-window-title i {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #cac4d0;
}

.mdi-window-title i:nth-child(1) {
  background: #ba1a1a;
}

.mdi-window-title i:nth-child(2) {
  background: #7d5260;
}

.mdi-window-title i:nth-child(3) {
  background: #6750a4;
}

.mdi-window-title strong {
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mdi-window-body {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-rows: 10px 10px minmax(0, 1fr);
  gap: 8px;
  padding: 12px;
}

.mdi-window-body b,
.mdi-window-body small {
  border-radius: 999px;
  background: #f3edf7;
}

.mdi-window-body b:nth-child(2) {
  width: 66%;
}

.mdi-window-body small {
  border: 1px solid #d8d2e4;
  border-radius: 12px;
  background: #f9f6fb;
}

.data-grid,
.table-view,
.list-view,
.column-view,
.icon-view,
.property-grid,
.key-value-list,
.inspector-section {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.data-grid header,
.table-view header,
.list-view header,
.column-view header,
.icon-view header,
.property-grid header,
.key-value-list header,
.inspector-section header {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #d8d2e4;
  padding: 10px 12px;
}

.data-grid header span,
.table-view header span,
.list-view header span,
.column-view header span,
.icon-view header span,
.property-grid header span,
.key-value-list header span {
  min-width: 0;
  flex: 1;
}

.inspector-section header strong {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-view header em,
.list-view header em,
.column-view header em,
.icon-view header em,
.property-grid header em,
.key-value-list header em {
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
}

.data-grid small,
.table-view small,
.list-view small,
.column-view small,
.icon-view small,
.property-grid small,
.key-value-list small,
.inspector-section small,
.form-layout small {
  display: block;
  overflow: hidden;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-grid-head,
.data-grid-row {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 82px 56px;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.data-grid-head {
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.data-grid-row {
  border: 0;
  border-bottom: 1px solid #ece6f0;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  text-align: left;
}

.data-grid-row-active {
  background: #f3edf7;
  color: #1d192b;
}

.data-grid-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-view-head,
.table-view-row {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(76px, 0.75fr) minmax(76px, 0.75fr);
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.table-view-head {
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.table-view-body {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.table-view-row {
  width: 100%;
  border: 0;
  border-bottom: 1px solid #ece6f0;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  text-align: left;
}

.table-view-row:nth-child(even) {
  background: #fffbff;
}

.table-view-row:hover,
.table-view-row-active {
  background: #f3edf7;
  color: #1d192b;
}

.table-view-row span,
.table-view-head span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-view-row span:first-child {
  font-weight: 700;
}

.list-view-body {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 4px;
  overflow: hidden;
  padding: 8px;
}

.list-view-row {
  display: grid;
  width: 100%;
  min-width: 0;
  grid-template-columns: 34px minmax(0, 1fr);
  grid-template-rows: auto auto;
  align-items: center;
  column-gap: 10px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: #49454f;
  padding: 9px 10px;
  text-align: left;
}

.list-view-row:hover,
.list-view-row-active {
  background: #f3edf7;
  color: #1d192b;
}

.list-view-row > span {
  display: grid;
  grid-row: 1 / 3;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 12px;
  background: #eaddff;
  color: #6750a4;
  font-size: 12px;
  font-weight: 800;
}

.list-view-row strong,
.list-view-row small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-view-row strong {
  font-size: 13px;
}

.list-view-row small {
  color: #79747e;
  font-size: 11px;
}

.column-view-body {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
}

.column-view-column {
  min-width: 0;
  overflow: hidden;
  border-right: 1px solid #d8d2e4;
}

.column-view-column:last-child {
  border-right: 0;
}

.column-view-column > strong {
  display: block;
  overflow: hidden;
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  color: #79747e;
  font-size: 11px;
  padding: 8px 10px;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.column-view-row {
  display: flex;
  width: calc(100% - 12px);
  min-width: 0;
  height: 32px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  margin: 6px;
  padding: 0 8px;
  text-align: left;
}

.column-view-row:hover,
.column-view-row-active {
  background: #f3edf7;
  color: #1d192b;
}

.column-view-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.column-view-row em {
  color: #79747e;
  font-style: normal;
}

.icon-view-body {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  overflow: hidden;
  padding: 10px;
}

.icon-view-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 16px;
  background: #fef7ff;
  color: #49454f;
  padding: 10px 8px;
  text-align: center;
}

.icon-view-item:hover,
.icon-view-item-active {
  border-color: #6750a4;
  background: #eaddff;
  color: #21005d;
}

.icon-view-item > span {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 16px;
  background: #fffbff;
  color: #6750a4;
  font-weight: 800;
}

.icon-view-item strong,
.icon-view-item small {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-view-item strong {
  font-size: 12px;
}

.icon-view-item small {
  color: #79747e;
  font-size: 11px;
}

.property-grid-head,
.property-grid-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr) 74px;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.property-grid-head {
  border-bottom: 1px solid #d8d2e4;
  background: #f3edf7;
  color: #79747e;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.property-grid-row {
  border: 0;
  border-bottom: 1px solid #ece6f0;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  text-align: left;
}

.property-grid-row-active {
  background: #f3edf7;
  color: #1d192b;
}

.property-grid-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.property-grid-row span:nth-child(2) {
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #f9f6fb;
  padding: 5px 8px;
}

.property-grid-row span:nth-child(3) {
  color: #79747e;
  font-size: 11px;
  text-transform: uppercase;
}

.key-value-row {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  align-items: center;
  gap: 10px;
  border: 0;
  border-bottom: 1px solid #ece6f0;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  padding: 9px 12px;
  text-align: left;
}

.key-value-row-active {
  background: #f3edf7;
  color: #1d192b;
}

.key-value-row span,
.key-value-row strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.key-value-row strong {
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #f9f6fb;
  color: #1d192b;
  font-weight: 600;
  padding: 5px 8px;
}

.inspector-section {
  background: #f9f6fb;
}

.inspector-section header {
  min-height: 44px;
  background: #fffbff;
}

.inspector-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 92px;
  align-items: center;
  gap: 8px;
  margin: 6px 8px 0;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #49454f;
  font-size: 12px;
  padding: 8px;
  text-align: left;
}

.inspector-row-active {
  background: #eaddff;
  color: #4f378b;
}

.inspector-row span,
.inspector-row em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspector-row em {
  border: 1px solid #d8d2e4;
  border-radius: 10px;
  background: #fffbff;
  color: #1d192b;
  font-style: normal;
  padding: 5px 8px;
  text-align: right;
}

.console-panel {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #2b2930;
  border-radius: 22px;
  background: #17151b;
  color: #f7f2fa;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.18);
}

.console-panel header {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
  padding: 9px 12px;
}

.console-panel header strong {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.console-panel header small {
  max-width: 42%;
  overflow: hidden;
  color: #cac4d0;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.console-panel > div {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 10px;
}

.console-row {
  display: grid;
  width: 100%;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #cac4d0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  padding: 7px 8px;
  text-align: left;
}

.console-row-active {
  background: rgb(255 255 255 / 0.1);
  color: white;
}

.console-row span,
.console-row code {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.console-row span {
  color: #8bd5ca;
}

.console-row code {
  font-family: inherit;
}

.terminal-view {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #2b2930;
  border-radius: 22px;
  background: #101116;
  color: #f7f2fa;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.18);
}

.terminal-view header {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
  background: #1b1c22;
  padding: 9px 12px;
}

.terminal-view header strong {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-view header small {
  overflow: hidden;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  color: #d0bcff;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 7px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-view > div {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 10px 12px;
}

.terminal-cwd,
.terminal-success {
  overflow: hidden;
  margin: 0 0 4px;
  color: #79747e;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-success {
  color: #a6da95;
}

.terminal-line {
  display: grid;
  width: 100%;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #cac4d0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  padding: 5px 6px;
  text-align: left;
}

.terminal-line-active {
  background: rgb(255 255 255 / 0.08);
  color: #f7f2fa;
}

.terminal-line span,
.terminal-view label span {
  color: #8bd5ca;
}

.terminal-line code {
  overflow: hidden;
  font-family: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-view label {
  display: grid;
  min-height: 40px;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  border-top: 1px solid rgb(255 255 255 / 0.1);
  background: #1b1c22;
  padding: 8px 12px;
}

.terminal-view input {
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #f7f2fa;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}

.terminal-view input::placeholder {
  color: rgb(247 242 250 / 0.45);
}

.timeline {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.timeline header {
  display: grid;
  min-height: 48px;
  grid-template-columns: 22px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d8d2e4;
  padding: 10px 12px;
}

.timeline header span {
  color: #6750a4;
}

.timeline header strong,
.timeline header small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline header small {
  grid-column: 2;
  color: #79747e;
  font-size: 11px;
}

.timeline > div {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 10px;
}

.timeline-row {
  display: grid;
  width: 100%;
  grid-template-columns: 24px minmax(0, 1fr) 48px 62px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #49454f;
  padding: 8px;
  text-align: left;
}

.timeline-row:hover,
.timeline-row-active {
  background: rgb(103 80 164 / 0.1);
  color: #1d192b;
}

.timeline-rail {
  position: relative;
  display: flex;
  justify-content: center;
}

.timeline-rail i {
  position: absolute;
  top: 13px;
  width: 1px;
  height: 26px;
  background: #d8d2e4;
}

.timeline-rail b {
  position: relative;
  z-index: 1;
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #6750a4;
}

.timeline-row strong,
.timeline-row small,
.timeline-row em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-row strong {
  min-width: 0;
  font-size: 13px;
}

.timeline-row small {
  color: #79747e;
  font-size: 11px;
}

.timeline-row em {
  border-radius: 999px;
  background: #f3edf7;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 3px 8px;
  text-align: center;
}

.status-indicator {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.status-indicator header {
  display: grid;
  min-height: 42px;
  grid-template-columns: 34px minmax(0, 1fr) minmax(52px, auto);
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.status-indicator-icon {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 999px;
  background: #eaddff;
  color: #6750a4;
  font-weight: 700;
}

.status-indicator header div,
.status-indicator header strong,
.status-indicator header small,
.status-indicator header em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-indicator header small {
  display: block;
  color: #79747e;
  font-size: 11px;
  margin-top: 2px;
}

.status-indicator header em {
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
  text-align: center;
}

.status-indicator > div {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 6px;
  overflow: hidden;
}

.status-indicator-row {
  display: grid;
  width: 100%;
  grid-template-columns: 12px minmax(0, 1fr) 58px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #49454f;
  padding: 8px 10px;
  text-align: left;
}

.status-indicator-row:hover,
.status-indicator-row-active {
  background: rgb(103 80 164 / 0.1);
  color: #1d192b;
}

.status-indicator-row span {
  width: 9px;
  height: 9px;
  border-radius: 999px;
}

.status-indicator-good span {
  background: #006a60;
}

.status-indicator-warn span {
  background: #7d5700;
}

.status-indicator-bad span {
  background: #ba1a1a;
}

.status-indicator-row strong,
.status-indicator-row small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-indicator-row strong {
  min-width: 0;
  font-size: 13px;
}

.status-indicator-row small {
  color: #79747e;
  font-size: 11px;
  text-align: right;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #6750a4;
}

.dot-muted {
  background: #79747e;
}

.form-layout {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  padding: 14px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.form-layout header,
.form-layout footer {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.form-layout header {
  flex-direction: column;
  align-items: flex-start;
}

.form-layout label {
  display: grid;
  min-width: 0;
  grid-template-columns: 110px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.form-layout label span {
  overflow: hidden;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.form-layout input {
  min-width: 0;
  height: 34px;
  border: 1px solid #d8d2e4;
  border-radius: 12px;
  background: #f9f6fb;
  color: #1d192b;
  padding: 0 10px;
}

.form-layout input[aria-invalid="true"] {
  border-color: #ba1a1a;
  background: #ffdad6;
  color: #410002;
}

.accordion {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.accordion header {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
  border-bottom: 1px solid #d8d2e4;
  padding: 12px 14px;
}

.accordion header strong,
.accordion header small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.accordion header small {
  color: #79747e;
}

.accordion-item {
  display: grid;
  width: 100%;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr) 24px;
  gap: 8px;
  border: 0;
  border-bottom: 1px solid #d8d2e4;
  background: transparent;
  color: #49454f;
  padding: 10px 12px;
  text-align: left;
}

.accordion-item:hover {
  background: #f7f2fa;
}

.accordion-item-active {
  background: rgb(103 80 164 / 0.1);
  color: #1d192b;
}

.accordion-item span {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.accordion-item b,
.accordion-item i,
.accordion-item small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.accordion-item b {
  min-width: 0;
  font-size: 13px;
}

.accordion-item i {
  flex: 0 0 auto;
  border: 1px solid #d8d2e4;
  border-radius: 999px;
  color: #79747e;
  font-size: 11px;
  font-style: normal;
  padding: 2px 7px;
}

.accordion-item em {
  justify-self: end;
  color: #6750a4;
  font-style: normal;
}

.accordion-item small {
  grid-column: 1 / -1;
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #fffbff;
  color: #79747e;
  padding: 9px 10px;
}

.navigation-drawer {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 28px;
  background: #f9f6fb;
  padding: 14px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.navigation-drawer header {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
  padding: 4px 8px 10px;
}

.navigation-drawer small {
  overflow: hidden;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawer-item {
  width: 100%;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #49454f;
  padding: 10px 14px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawer-item-active {
  background: #e8def8;
  color: #1d192b;
}

.side-sheet {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 28px 18px 18px 28px;
  background: white;
  padding: 16px;
  box-shadow: 0 12px 32px rgb(31 28 38 / 0.12);
}

.side-sheet p {
  overflow: hidden;
  margin: 0;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sheet-section {
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-radius: 14px;
  background: #f9f6fb;
  padding: 10px 12px;
}

.sheet-section small {
  color: #79747e;
}

.bottom-sheet {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 28px 28px 18px 18px;
  background: white;
  padding: 10px 16px 16px;
  box-shadow: 0 12px 32px rgb(31 28 38 / 0.14);
}

.sheet-handle {
  width: 42px;
  height: 4px;
  flex: 0 0 auto;
  align-self: center;
  border-radius: 999px;
  background: #cac4d0;
}

.bottom-sheet p {
  overflow: hidden;
  margin: 0;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-sheet-options {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.bottom-sheet .sheet-section {
  border: 0;
  color: #1d192b;
  text-align: center;
}

.empty-state {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px dashed #cac4d0;
  border-radius: 24px;
  background: #fffbff;
  padding: 20px;
  text-align: center;
}

.empty-state > span {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: #e8def8;
  color: #4f378b;
  font-size: 22px;
  font-weight: 700;
}

.empty-state p {
  display: -webkit-box;
  max-width: 100%;
  overflow: hidden;
  color: #79747e;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.empty-state .button {
  width: auto;
  height: 34px;
  padding: 0 14px;
}

.empty-panel {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  overflow: hidden;
  border: 1px dashed #cac4d0;
  border-radius: 22px;
  background: #fffbff;
  padding: 16px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.empty-panel > span {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 20px;
  background: #f3edf7;
  color: #6750a4;
  font-size: 22px;
  font-weight: 800;
}

.empty-panel div,
.empty-panel strong,
.empty-panel p,
.empty-panel small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-panel strong {
  display: block;
  white-space: nowrap;
}

.empty-panel p {
  display: -webkit-box;
  margin: 5px 0 0;
  color: #79747e;
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.empty-panel footer {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.empty-panel .button {
  width: auto;
  height: 32px;
  padding: 0 12px;
}

.empty-panel small {
  color: #79747e;
  white-space: nowrap;
}

.stepper {
  justify-content: center;
}

.step-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.step {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: #f9f6fb;
  color: #49454f;
  padding: 8px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step span {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f0edf4;
  font-size: 12px;
  font-weight: 700;
}

.step-active {
  background: #e8def8;
  color: #1d192b;
}

.step-active span {
  background: #6750a4;
  color: white;
}

.wizard {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: minmax(132px, 0.42fr) minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 24px;
  background: #fffbff;
  color: #1d192b;
  box-shadow: 0 10px 28px rgb(31 28 38 / 0.1);
}

.wizard aside {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 16px;
}

.wizard aside > strong,
.wizard aside > small {
  overflow: hidden;
  text-overflow: ellipsis;
}

.wizard aside > strong {
  white-space: nowrap;
}

.wizard aside > small {
  display: -webkit-box;
  color: #79747e;
  font-size: 11px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.wizard-step {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: #49454f;
  padding: 8px 10px;
  text-align: left;
}

.wizard-step:hover,
.wizard-step-active {
  background: #eaddff;
  color: #4f378b;
}

.wizard-step span {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f0edf4;
  font-size: 12px;
  font-weight: 800;
}

.wizard-step-active span {
  background: #6750a4;
  color: white;
}

.wizard-step b {
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wizard main {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.wizard main header {
  border-bottom: 1px solid #d8d2e4;
  padding: 12px 16px;
}

.wizard main header small,
.wizard main header strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wizard main header small {
  color: #6750a4;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.wizard main header strong {
  margin-top: 3px;
  font-size: 16px;
}

.wizard main > div {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-rows: 12px 12px minmax(0, 1fr);
  gap: 10px;
  padding: 16px;
}

.wizard main > div span,
.wizard main > div i {
  border-radius: 999px;
  background: #f3edf7;
}

.wizard main > div span:nth-child(2) {
  width: 66%;
}

.wizard main > div i {
  border: 1px solid #d8d2e4;
  border-radius: 14px;
  background: #f9f6fb;
}

.wizard footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #d8d2e4;
  background: #f9f6fb;
  padding: 12px 16px;
}

.banner {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 12px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  padding: 16px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.banner p {
  overflow: hidden;
  margin: 0;
  color: #79747e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner .button {
  grid-row: 1 / span 2;
  grid-column: 2;
  align-self: center;
  width: auto;
  height: 34px;
  padding: 0 14px;
}

.banner-danger {
  border-color: #f2b8b5;
  background: #fff8f7;
}

.alert-card {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 12px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: #fffbff;
  color: #1d192b;
  padding: 14px;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.alert-card > span {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 999px;
  background: #e8def8;
  color: #4f378b;
  font-weight: 900;
}

.alert-card strong,
.alert-card p {
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-card strong {
  display: block;
  white-space: nowrap;
}

.alert-card p {
  display: -webkit-box;
  margin: 4px 0 0;
  color: #79747e;
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.alert-card .button {
  width: auto;
  height: 30px;
  margin-top: 8px;
  padding: 0 12px;
}

.alert-card-danger {
  border-color: #f2b8b5;
  background: #fff8f7;
}

.alert-card-danger > span {
  background: #ba1a1a;
  color: white;
}

.navigation-rail {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 26px;
  background: #f9f6fb;
  padding: 12px 8px;
}

.navigation-rail strong {
  max-width: 100%;
  overflow: hidden;
  color: #79747e;
  font-size: 11px;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.rail-item {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: 0;
  border-radius: 18px;
  background: transparent;
  color: #49454f;
  padding: 8px 4px;
  font-size: 11px;
}

.rail-item span {
  display: inline-flex;
  width: 44px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f0edf4;
}

.rail-item-active span {
  background: #e8def8;
  color: #4f378b;
}

.dialog-card {
  border-radius: 28px;
  padding: 22px;
}

.popover-card {
  position: relative;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 12px;
  overflow: hidden;
}

.popover-panel {
  width: 100%;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  padding: 14px;
  box-shadow: 0 18px 44px rgb(31 28 38 / 0.16);
}

.popover-panel div {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.popover-panel span {
  max-width: 100%;
  overflow: hidden;
  border-radius: 999px;
  background: #e8def8;
  color: #21005d;
  padding: 5px 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
}

.tooltip-demo {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  border: 1px solid #d8d2e4;
  border-radius: 18px;
  background: white;
}

.tooltip-anchor {
  border-radius: 999px;
  background: #f3edf7;
  color: #1d1b20;
  padding: 10px 16px;
  font-weight: 700;
}

.tooltip-bubble {
  position: absolute;
  left: 50%;
  bottom: 10px;
  max-width: calc(100% - 24px);
  transform: translateX(-50%);
  overflow: hidden;
  border-radius: 12px;
  background: #322f35;
  color: #f5eff7;
  padding: 8px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.snackbar {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 14px;
  border-radius: 18px;
  background: #322f35;
  color: #f5eff7;
  padding: 12px 16px;
  box-shadow: 0 10px 28px rgb(31 28 38 / 0.22);
}

.snackbar span {
  min-width: 0;
  flex: 1;
}

.snackbar p {
  overflow: hidden;
  margin: 3px 0 0;
  color: #cac4d0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.snackbar button {
  border: 0;
  border-radius: 999px;
  background: #e8def8;
  color: #1d192b;
  padding: 8px 12px;
  font-weight: 800;
}

.toast-card {
  display: grid;
  width: 100%;
  height: 100%;
  min-width: 0;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 12px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 20px;
  background: #fffbff;
  color: #1d192b;
  padding: 12px;
  box-shadow: 0 16px 38px rgb(31 28 38 / 0.16);
}

.toast-card > span {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 999px;
  background: #e8def8;
  color: #4f378b;
  font-weight: 900;
}

.toast-card header {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.toast-card strong,
.toast-card small,
.toast-card p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-card small {
  color: #79747e;
  font-size: 10px;
}

.toast-card p {
  margin: 4px 0 0;
  color: #79747e;
  font-size: 12px;
}

.toast-card button {
  width: auto;
  height: 28px;
  margin-top: 8px;
  border: 0;
  border-radius: 999px;
  background: #e8def8;
  color: #1d192b;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 800;
}

.fab {
  display: inline-flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 0;
  border-radius: 22px;
  background: #6750a4;
  color: white;
  padding: 0 18px;
  font-weight: 800;
  box-shadow: 0 10px 24px rgb(31 28 38 / 0.22);
}

.fab span {
  font-size: 20px;
  line-height: 1;
}

.extended-fab {
  min-width: 0;
  border-radius: 18px;
}

.extended-fab strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar-row {
  justify-content: flex-start;
  text-align: left;
}

.avatar {
  display: inline-flex;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #6750a4;
  color: white;
  font-weight: 800;
}

.avatar-group {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 14px 16px;
  text-align: left;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.avatar-group > span {
  min-width: 0;
}

.avatar-group strong,
.avatar-group p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar-group p {
  margin: 3px 0 0;
  color: #79747e;
  font-size: 12px;
}

.avatar-group > div {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
}

.avatar-group-item {
  width: 38px;
  height: 38px;
  border: 2px solid #fffbff;
  font-size: 11px;
}

.avatar-group-item + .avatar-group-item {
  margin-left: -12px;
}

.avatar-group-item-2 {
  background: #625b71;
}

.avatar-group-item-3 {
  background: #006b5f;
}

.avatar-group-item-4 {
  background: #7d5260;
}

.avatar-group em {
  display: grid;
  width: 34px;
  height: 34px;
  margin-left: -8px;
  place-items: center;
  border: 2px solid #fffbff;
  border-radius: 999px;
  background: #f3edf7;
  color: #49454f;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
}

.lcd-display {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 22px;
  background: #17151b;
  color: #f7f2fa;
  padding: 16px;
  box-shadow: 0 10px 26px rgb(31 28 38 / 0.22);
}

.lcd-display small,
.lcd-display strong,
.lcd-display footer span,
.lcd-display footer em {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lcd-display small {
  color: #cac4d0;
  font-size: 12px;
}

.lcd-display strong {
  color: #8bd5ca;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 36px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  margin-top: 8px;
}

.lcd-display footer {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}

.lcd-display footer span {
  color: #cac4d0;
  font-size: 11px;
}

.lcd-display footer em {
  flex: 0 0 auto;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  color: #f7f2fa;
  font-size: 11px;
  font-style: normal;
  padding: 4px 8px;
}

progress {
  width: 100%;
  height: 8px;
  accent-color: #6750a4;
}

.circular-progress {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #d8d2e4;
  border-radius: 22px;
  background: #fffbff;
  color: #1d192b;
  padding: 16px;
  text-align: center;
  box-shadow: 0 8px 24px rgb(31 28 38 / 0.08);
}

.circular-progress-ring {
  display: grid;
  width: 82px;
  height: 82px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
  margin-bottom: 12px;
}

.circular-progress-ring span {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 999px;
  background: #fffbff;
  color: #1d192b;
  font-size: 14px;
  font-weight: 800;
}

.circular-progress strong,
.circular-progress small,
.circular-progress p {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.circular-progress strong {
  font-size: 14px;
}

.circular-progress small,
.circular-progress p {
  color: #79747e;
  font-size: 11px;
  margin: 2px 0 0;
}

.frame {
  position: relative;
  overflow: hidden;
}

.frame-children {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.frame-children-auto {
  overflow: auto;
}

.badge {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  border-radius: 999px;
  background: #e8def8;
  color: #4f378b;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #e6e1e5;
    background: #111318;
    color-scheme: dark;
  }

  body,
  .app,
  .app-dialog,
  .app-tool,
  .app-body,
  .workspace[data-runtime-panel="visible"],
  .canvas-viewport {
    background: #111318;
    color: #e6e1e5;
  }

  .app {
    box-shadow: inset 0 0 0 1px #44464f;
  }

  .app-titlebar-native,
  .app-titlebar-hidden,
  .app-titlebar-native .app-body,
  .app-titlebar-hidden .app-body,
  .app-titlebar-native .canvas-viewport,
  .app-titlebar-hidden .canvas-viewport,
  .canvas,
  .canvas-background-plain {
    background: #111318;
  }

  .canvas-background-soft {
    background:
      radial-gradient(circle at 18% 0%, rgb(208 188 255 / 0.12), transparent 32%),
      #111318;
  }

  .window-titlebar {
    border-bottom-color: #44464f;
    background:
      linear-gradient(180deg, rgb(29 27 32 / 0.97), rgb(20 19 24 / 0.94));
    color: #cac4d0;
  }

  .app-tool .window-titlebar {
    background: rgb(29 27 32 / 0.96);
  }

  .titlebar-mark {
    background: #4f378b;
    color: #eaddff;
  }

  .titlebar-title {
    color: #e6e1e5;
  }

  .titlebar-subtitle,
  .titlebar-status {
    color: #cac4d0;
  }

  .window-controls button {
    color: #cac4d0;
  }

  .window-controls button:hover {
    background: #2b2930;
  }

  .runtime-panel,
  .state-snapshot,
  .backend-health,
  .backend-log-card,
  .card,
  .group-box,
  .text-browser,
  .image-list,
  .command-link-button,
  .carousel-card,
  .field,
  .plain-text-edit,
  .rich-text-editor,
  .search-bar,
  .web-view,
  .pdf-viewer,
  .map-view,
  .panel-row,
  .graphics-view,
  .tree-table,
  .command-list,
  .scroll-area,
  .stacked-pages,
  .tool-box,
  .splitter,
  .size-grip,
  .dock-panel,
  .mdi-area,
  .navigation-drawer,
  .side-sheet,
  .bottom-sheet,
  .accordion,
  .empty-state,
  .empty-panel,
  .banner,
  .alert-card,
  .dialog-card,
  .popover-card,
  .toast-card,
  .wizard,
  .chart-view,
  .data-grid,
  .table-view,
  .list-view,
  .column-view,
  .icon-view,
  .property-grid,
  .key-value-list,
  .inspector-section,
  .form-layout,
  .console-panel,
  .timeline,
  .status-indicator,
  .avatar-group,
  .circular-progress {
    border-color: #44464f;
    background: #1d1b20;
    color: #e6e1e5;
    box-shadow: 0 12px 28px rgb(0 0 0 / 0.22);
  }

  .elevated-card {
    border-color: transparent;
    background: #211f26;
  }

  .filled-card {
    border-color: transparent;
    background: #2b2930;
  }

  .outlined-card {
    border-color: #938f99;
    background: #1d1b20;
    box-shadow: none;
  }

  .runtime-card-header strong {
    color: #e6e1e5;
  }

  .runtime-card-header p,
  .runtime-card small {
    color: #cac4d0;
  }

  .splitter header,
  .splitter header em,
  .splitter-pane-main span {
    border-color: #44464f;
  }

  .splitter header small,
  .splitter-pane small {
    color: #cac4d0;
  }

  .splitter-pane span,
  .splitter-pane-main span {
    background: #211f26;
  }

  .splitter-handle {
    background: #44464f;
  }

  .splitter-handle i {
    background: #d0bcff;
  }

  .size-grip,
  .size-grip em {
    border-color: #44464f;
  }

  .size-grip small {
    color: #cac4d0;
  }

  .size-grip em {
    background: #141218;
    color: #cac4d0;
  }

  .size-grip i {
    border-color: #d0bcff;
  }

  .size-grip b {
    border-color: #44464f;
  }

  .size-grip:hover {
    border-color: #d0bcff;
    background: #211f26;
  }

  .mdi-area header,
  .mdi-window-title,
  .dock-panel header,
  .stacked-pages nav,
  .dock-tabs {
    border-color: #44464f;
    background: #2b2930;
  }

  .mdi-stage {
    background: #141218;
  }

  .mdi-window {
    border-color: #44464f;
    background: #211f26;
    color: #cac4d0;
    box-shadow: 0 14px 28px rgb(0 0 0 / 0.28);
  }

  .mdi-window-active {
    border-color: #d0bcff;
    color: #e6e1e5;
  }

  .mdi-window-active .mdi-window-title {
    border-color: rgb(208 188 255 / 0.28);
    background: #4f378b;
    color: #eaddff;
  }

  .mdi-window-body b,
  .mdi-window-body small {
    border-color: #44464f;
    background: #2b2930;
  }

  .wizard aside,
  .wizard footer,
  .wizard main header {
    border-color: #44464f;
    background: #2b2930;
  }

  .wizard-step {
    color: #cac4d0;
  }

  .wizard-step:hover,
  .wizard-step-active {
    background: #4f378b;
    color: #eaddff;
  }

  .wizard-step span,
  .wizard main > div span,
  .wizard main > div i {
    border-color: #44464f;
    background: #1d1b20;
  }

  .wizard-step-active span {
    background: #d0bcff;
    color: #381e72;
  }

  .graphics-view header,
  .graphics-view footer {
    border-color: #44464f;
    background: #2b2930;
  }

  .graphics-scene {
    background:
      linear-gradient(90deg, rgb(147 143 153 / 0.24) 1px, transparent 1px),
      linear-gradient(180deg, rgb(147 143 153 / 0.24) 1px, transparent 1px),
      #141218;
    background-size: 32px 32px;
  }

  .graphics-node {
    border-color: #44464f;
    background: #211f26;
    color: #cac4d0;
  }

  .graphics-node:hover,
  .graphics-node-1 {
    border-color: #d0bcff;
    background: #4f378b;
    color: #eaddff;
  }

  .graphics-view footer small {
    background: #1d1b20;
    color: #cac4d0;
  }

  .web-view header,
  .web-view aside,
  .web-view footer {
    border-color: #44464f;
    background: #2b2930;
  }

  .web-view header span,
  .web-view article i {
    border-color: #44464f;
    background: #141218;
    color: #cac4d0;
  }

  .web-view article {
    background: #1d1b20;
  }

  .web-view article span,
  .web-view article i {
    background: #2b2930;
  }

  .web-tab {
    color: #cac4d0;
  }

  .web-tab-active,
  .web-view header button {
    background: #4f378b;
    color: #eaddff;
  }

  .pdf-viewer header,
  .pdf-viewer aside,
  .pdf-viewer footer,
  .map-view header {
    border-color: #44464f;
    background: #2b2930;
  }

  .pdf-viewer header small,
  .pdf-viewer header em,
  .pdf-viewer footer,
  .map-view header small {
    color: #cac4d0;
  }

  .pdf-viewer header em,
  .pdf-page,
  .pdf-page i {
    border-color: #44464f;
    background: #211f26;
    color: #cac4d0;
  }

  .pdf-page-active,
  .pdf-viewer header button,
  .map-view header button {
    border-color: #d0bcff;
    background: #4f378b;
    color: #eaddff;
  }

  .map-canvas {
    background:
      linear-gradient(90deg, rgb(208 188 255 / 0.12) 1px, transparent 1px),
      linear-gradient(180deg, rgb(208 188 255 / 0.12) 1px, transparent 1px),
      #111318;
  }

  .map-canvas svg {
    color: #80d4a5;
  }

  .map-marker {
    border-color: #80d4a5;
    background: #1d1b20;
    color: #80d4a5;
  }

  .map-marker-3 {
    border-color: #ffb4ab;
    background: #410002;
    color: #ffb4ab;
  }

  .map-canvas aside {
    border-color: #44464f;
    background: rgb(29 27 32 / 0.92);
    color: #e6e1e5;
  }

  .map-canvas aside small {
    color: #cac4d0;
  }

  .chart-view header,
  .chart-view footer {
    border-color: #44464f;
    background: #2b2930;
  }

  .chart-plot {
    border-color: #44464f;
    background: #141218;
  }

  .chart-grid {
    stroke: #44464f;
  }

  .chart-line {
    stroke: #d0bcff;
  }

  .chart-bars i {
    background: rgb(208 188 255 / 0.18);
  }

  .chart-legend {
    background: #1d1b20;
    color: #cac4d0;
  }

  .chart-legend-active {
    background: #4f378b;
    color: #eaddff;
  }

  input,
  textarea,
  select,
  .field input,
  .field textarea,
  .field select,
  .combobox input,
  .autocomplete-field input,
  .search-bar input,
  .command-list input,
  .form-layout input {
    border-color: #44464f;
    background: #141218;
    color: #e6e1e5;
  }

  input::placeholder,
  textarea::placeholder {
    color: #938f99;
  }

  .autocomplete-field {
    border-color: #44464f;
    background: #1d1b20;
    box-shadow: 0 10px 28px rgb(0 0 0 / 0.26);
  }

  .autocomplete-field label,
  .autocomplete-field > small,
  .autocomplete-empty {
    color: #cac4d0;
  }

  .autocomplete-field input:focus {
    border-color: #d0bcff;
    box-shadow: 0 0 0 3px rgb(208 188 255 / 0.18);
  }

  .autocomplete-option {
    color: #cac4d0;
  }

  .autocomplete-option:hover {
    background: #2b2930;
  }

  .autocomplete-option-active {
    background: #4f378b;
    color: #eaddff;
  }

  .autocomplete-empty {
    border-color: #44464f;
  }

  .button-group {
    border-color: #44464f;
    background: #1d1b20;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.24);
  }

  .button-group-item {
    color: #cac4d0;
  }

  .button-group-item:hover {
    background: #2b2930;
  }

  .button-group-item-active {
    background: #4f378b;
    color: #eaddff;
  }

  .dialog-button-box {
    border-color: #44464f;
    background: #1d1b20;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.24);
  }

  .dialog-button {
    border-color: #44464f;
    color: #d0bcff;
  }

  .dialog-button:hover {
    background: #2b2930;
  }

  .dialog-button-primary {
    border-color: #d0bcff;
    background: #d0bcff;
    color: #381e72;
  }

  .dialog-button-primary:hover {
    background: #eaddff;
  }

  .button-muted,
  .list-row,
  .tree-row,
  .tree-table-row,
  .command-list-row,
  .scroll-area-row,
  .inspector-row,
  .timeline-row,
  .status-indicator-row,
  .property-grid-row,
  .key-value-row,
  .data-grid-row,
  .table-view-row,
  .list-view-row,
  .column-view-row,
  .icon-view-item,
  .drawer-item,
  .accordion-item,
  .chip,
  .md3-chip,
  .floating-toolbar,
  .floating-toolbar-action,
  .segment,
  .dock-tab,
  .stacked-page-tab {
    border-color: #44464f;
    background: #211f26;
    color: #cac4d0;
  }

  .floating-toolbar strong {
    color: #e6e1e5;
  }

  .floating-toolbar > span,
  .md3-chip span,
  .md3-chip em,
  .floating-toolbar-action-active {
    background: #4f378b;
    color: #eaddff;
  }

  .system-tray,
  .system-tray header,
  .system-tray header em {
    border-color: #44464f;
    background: #1d1b20;
    color: #e6e1e5;
  }

  .system-tray header,
  .system-tray-row {
    background: #211f26;
  }

  .system-tray p,
  .system-tray header small {
    color: #cac4d0;
  }

  .system-tray-mark {
    background: #4f378b;
    color: #eaddff;
  }

  .system-tray-mark i {
    border-color: #1d1b20;
  }

  .system-tray-row {
    color: #cac4d0;
  }

  .system-tray-row-active,
  .system-tray-row:hover {
    background: #4f378b;
    color: #eaddff;
  }

  .data-grid-head,
  .table-view-head,
  .property-grid-head,
  .column-view-column > strong {
    border-color: #44464f;
    background: #141218;
    color: #cac4d0;
  }

  .column-view-column {
    border-color: #44464f;
  }

  .table-view-row:nth-child(even) {
    background: #211f26;
  }

  .button,
  .fab,
  .fab-mini,
  .badge,
  .chip-active,
  .segment-active,
  .dock-tab-active,
  .stacked-page-tab-active,
  .drawer-item-active,
  .accordion-item-active,
  .command-list-row-active,
  .tree-row-active,
  .tree-table-row-active,
  .scroll-area-row-active,
  .inspector-row-active,
  .timeline-row-active,
  .status-indicator-row-active,
  .property-grid-row-active,
  .key-value-row-active,
  .data-grid-row-active,
  .table-view-row-active,
  .list-view-row-active,
  .column-view-row-active {
    background: #4f378b;
    color: #eaddff;
  }

  .column-view-row em {
    color: #cac4d0;
  }

  .icon-view-item {
    border-color: #44464f;
    background: #211f26;
    color: #cac4d0;
  }

  .icon-view-item:hover,
  .icon-view-item-active {
    border-color: #d0bcff;
    background: #4f378b;
    color: #eaddff;
  }

  .icon-view-item > span {
    background: #141218;
    color: #d0bcff;
  }

  .icon-view-item small {
    color: #cac4d0;
  }

  .list-view-row > span {
    background: #4f378b;
    color: #eaddff;
  }

  .list-view-row small {
    color: #cac4d0;
  }

  .key-value-row strong,
  .property-grid-row span:nth-child(2) {
    border-color: #44464f;
    background: #141218;
    color: #e6e1e5;
  }

  .circular-progress-ring span {
    background: #111318;
    color: #e6e1e5;
  }
}

@media (max-width: 1100px) {
  .workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .runtime-panel {
    position: static;
    max-height: none;
  }
}
"#;
