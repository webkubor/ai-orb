/** 嵌入客服的隔离样式。所有可配置颜色、尺寸与动效均由 CSS 变量控制。 */
export const widgetCss = `
:host {
  --aw-bg: #ffffff;
  --aw-bg-soft: #f5f4f2;
  --aw-bg-user: #ffeddf;
  --aw-text: #29231e;
  --aw-text-muted: #73675d;
  --aw-text-accent: #a94318;
  --aw-border: #e8e1da;
  --aw-accent: #bc4c1d;
  --aw-accent-hover: #a53c12;
  --aw-accent-text: #ffffff;
  --aw-error-bg: #fff0eb;
  --aw-error-text: #92331e;
  --aw-focus: #a94318;
  --aw-radius: 24px;
  --aw-control-radius: 13px;
  --aw-message-radius: 18px;
  --aw-pill-radius: 999px;
  --aw-shadow: 0 20px 80px #38261726, 0 4px 20px #38261714;
  --aw-small-shadow: 0 5px 24px #3826171f;
  --aw-fast: 160ms;
  --aw-panel-duration: 240ms;
  --aw-offset: 24px;
  --aw-width: 368px;
  --aw-z-index: 2147483000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--aw-text);
  font-size: 14px;
  line-height: 1.5;
  text-align: start;
  color-scheme: light;
}
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
button, textarea { font: inherit; }
button { cursor: pointer; touch-action: manipulation; }
button:disabled { cursor: not-allowed; opacity: .55; }
button:focus-visible, textarea:focus-visible {
  outline: 3px solid var(--aw-focus);
  outline-offset: 3px;
}
button { -webkit-tap-highlight-color: transparent; }
.aw-root {
  position: fixed;
  z-index: var(--aw-z-index);
  right: max(var(--aw-offset), env(safe-area-inset-right));
  bottom: max(var(--aw-offset), env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 18px;
  width: max-content;
  max-width: calc(100vw - 32px);
  pointer-events: none;
}
.aw-root[data-position='left'] {
  left: max(var(--aw-offset), env(safe-area-inset-left));
  right: auto;
  align-items: flex-start;
}
.aw-panel {
  display: flex;
  flex-direction: column;
  width: min(var(--aw-width), calc(100vw - 32px));
  height: min(540px, calc(100vh - 140px));
  height: min(540px, calc(100dvh - 140px - env(safe-area-inset-bottom)));
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--aw-border);
  border-radius: var(--aw-radius);
  background: var(--aw-bg);
  box-shadow: var(--aw-shadow);
  opacity: 0;
  visibility: hidden;
  transform: translateY(12px) scale(.98);
  transform-origin: bottom right;
  transition: opacity var(--aw-panel-duration) ease-out,
    transform var(--aw-panel-duration) cubic-bezier(.16, 1, .3, 1),
    visibility 0s var(--aw-panel-duration);
}
.aw-root[data-position='left'] .aw-panel { transform-origin: bottom left; }
.aw-root[data-open='true'] .aw-panel {
  transition-delay: 0s;
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
.aw-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  border-bottom: 1px solid var(--aw-border);
  flex: 0 0 auto;
}
.aw-avatar { display: flex; align-items: center; flex: 0 0 44px; }
.aw-avatar .agent-orb { pointer-events: none; }
.aw-heading { flex: 1; min-width: 0; }
.aw-heading h2 { margin: 0; color: var(--aw-text); font-size: 16px; font-weight: 650; line-height: 1.4; }
.aw-status { margin: 3px 0 0; color: var(--aw-text-muted); font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
.aw-close, .aw-dismiss {
  display: grid;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
  padding: 10px;
  border: 0;
  border-radius: var(--aw-control-radius);
  background: transparent;
  color: var(--aw-text-muted);
  flex: 0 0 auto;
  transition: background var(--aw-fast) ease-out, color var(--aw-fast) ease-out;
}
.aw-close svg, .aw-dismiss svg { width: 18px; height: 18px; }
.aw-close:hover, .aw-dismiss:hover { color: var(--aw-text); background: var(--aw-bg-soft); }
.aw-log {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1 1 auto;
  min-height: 36px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  padding: 22px 18px 16px;
  scroll-padding: 16px;
}
.aw-message {
  align-self: flex-start;
  max-width: 92%;
  padding: 12px 15px;
  border-radius: var(--aw-message-radius);
  background: var(--aw-bg-soft);
  color: var(--aw-text);
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.aw-message[data-role='assistant'] { border-end-start-radius: 5px; }
.aw-message[data-role='user'] {
  align-self: flex-end;
  background: var(--aw-bg-user);
  border-end-end-radius: 5px;
}
.aw-suggestions { display: flex; flex-wrap: wrap; flex: 0 0 auto; gap: 7px; padding: 0 18px 16px; }
.aw-suggestions button {
  min-height: 44px;
  padding: 10px 13px;
  border: 1px solid var(--aw-border);
  border-radius: var(--aw-pill-radius);
  background: var(--aw-bg);
  color: var(--aw-text-accent);
  text-align: start;
  transition: background var(--aw-fast) ease-out, border-color var(--aw-fast) ease-out;
}
.aw-suggestions button:hover { background: var(--aw-bg-user); border-color: var(--aw-accent); }
.aw-error {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  padding: 8px 12px 8px 18px;
  background: var(--aw-error-bg);
  color: var(--aw-error-text);
  font-size: 12px;
}
.aw-error-text { flex: 1; overflow-wrap: anywhere; }
.aw-retry { min-height: 44px; border: 0; padding: 8px; background: transparent; color: inherit; text-decoration: underline; }
.aw-form { padding: 14px 16px 12px; border-top: 1px solid var(--aw-border); flex: 0 0 auto; }
.aw-label {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.aw-input {
  display: block;
  width: 100%;
  min-height: 52px;
  max-height: 108px;
  resize: none;
  padding: 14px;
  border: 1px solid var(--aw-border);
  border-radius: var(--aw-control-radius);
  color: var(--aw-text);
  background: var(--aw-bg-soft);
  font-size: 16px;
  line-height: 1.5;
  transition: border-color var(--aw-fast) ease-out;
}
.aw-input::placeholder { color: var(--aw-text-muted); opacity: 1; }
.aw-input:focus { border-color: var(--aw-accent); }
.aw-composer-actions { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.aw-hint { flex: 1; color: var(--aw-text-muted); font-size: 11px; line-height: 1.4; }
.aw-send, .aw-stop {
  min-height: 44px;
  min-width: 64px;
  padding: 10px 16px;
  border: 0;
  border-radius: var(--aw-control-radius);
  color: var(--aw-accent-text);
  background: linear-gradient(130deg, var(--aw-accent), var(--aw-accent-hover));
  font-weight: 600;
  transition: background var(--aw-fast) ease-out, transform var(--aw-fast) ease-out;
}
.aw-send:hover { background: var(--aw-accent-hover); }
.aw-send:active, .aw-stop:active { transform: scale(.96); }
.aw-stop { background: var(--aw-bg-soft); color: var(--aw-text); }
.aw-footer { margin: 0; padding: 0 16px 14px; color: var(--aw-text-muted); font-size: 11px; text-align: center; flex: 0 0 auto; }
.aw-launcher { display: flex; align-items: center; gap: 14px; pointer-events: auto; }
.aw-root[data-position='left'] .aw-launcher { flex-direction: row-reverse; }
.aw-capsule {
  display: flex;
  align-items: center;
  max-width: min(264px, calc(100vw - 120px));
  border: 1px solid var(--aw-border);
  border-radius: var(--aw-control-radius);
  background: var(--aw-bg);
  box-shadow: var(--aw-small-shadow);
  animation: aw-notice-in var(--aw-panel-duration) ease-out both;
}
.aw-notice { border: 0; background: transparent; padding: 12px 0 12px 16px; min-height: 44px; color: var(--aw-text); text-align: start; overflow-wrap: anywhere; }
.aw-dismiss { min-width: 44px; border-radius: var(--aw-control-radius); }
.aw-orb { display: flex; width: 64px; height: 64px; align-items: center; justify-content: center; flex: 0 0 auto; }
.aw-orb .agent-orb { --ao-badge-ring: var(--aw-bg); }
@keyframes aw-notice-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 480px) {
  :host { --aw-offset: 16px; --aw-radius: 20px; }
  .aw-root { gap: 12px; }
  .aw-panel { height: min(540px, calc(100dvh - 120px - env(safe-area-inset-bottom))); }
  .aw-header { padding-block: 14px; }
  .aw-log { padding-top: 16px; }
}
@media (max-height: 540px) {
  .aw-root[data-open='true'] .aw-launcher { display: none; }
  .aw-panel { height: calc(100dvh - 32px - env(safe-area-inset-bottom)); }
  .aw-header { padding-block: 8px; }
  .aw-suggestions { max-height: 56px; overflow-y: auto; padding-bottom: 8px; }
  .aw-form { padding-block: 8px; }
  .aw-footer { padding-bottom: 8px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
`
