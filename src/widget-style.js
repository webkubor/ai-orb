/** 客服面板默认视觉：紧凑空态、单层输入区域；所有主题值均由 token 控制。 */
export const widgetCss = `
:host {
  --aw-bg: #ffffff;
  --aw-bg-soft: #f6f5f3;
  --aw-bg-user: #fff0e5;
  --aw-text: #302b27;
  --aw-text-muted: #79716a;
  --aw-text-accent: #a64a21;
  --aw-border: #eae6e1;
  --aw-accent: #bc4c1d;
  --aw-accent-hover: #a53c12;
  --aw-accent-text: #ffffff;
  --aw-error-bg: #fff2ec;
  --aw-error-text: #92331e;
  --aw-focus: #a96c48;
  --aw-radius: 20px;
  --aw-control-radius: 12px;
  --aw-message-radius: 16px;
  --aw-pill-radius: 999px;
  --aw-shadow: 0 16px 56px #30251a1a, 0 2px 8px #30251a08;
  --aw-small-shadow: 0 4px 18px #30251a12;
  --aw-fast: 160ms;
  --aw-panel-duration: 220ms;
  --aw-offset: 24px;
  --aw-width: 368px;
  --aw-z-index: 2147483000;
  font: 14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--aw-text);
  text-align: start;
  color-scheme: light;
}
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
button, textarea { font: inherit; }
button { cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
button:disabled { cursor: not-allowed; }
button:focus-visible, .aw-log:focus-visible { outline: 2px solid var(--aw-focus); outline-offset: 2px; }
.aw-root {
  position: fixed; z-index: var(--aw-z-index);
  right: max(var(--aw-offset), env(safe-area-inset-right));
  bottom: max(var(--aw-offset), env(safe-area-inset-bottom));
  display: flex; flex-direction: column; align-items: flex-end; gap: 12px;
  width: max-content; max-width: calc(100vw - 32px); pointer-events: none;
}
.aw-root[data-position='left'] { left: max(var(--aw-offset), env(safe-area-inset-left)); right: auto; align-items: flex-start; }
.aw-panel {
  display: flex; flex-direction: column;
  width: min(var(--aw-width), calc(100vw - 32px));
  height: min(500px, calc(100dvh - 124px - env(safe-area-inset-bottom)));
  min-height: 0; overflow: hidden;
  border: 1px solid var(--aw-border); border-radius: var(--aw-radius);
  background: var(--aw-bg); box-shadow: var(--aw-shadow);
  opacity: 0; visibility: hidden; transform: translateY(10px) scale(.98); transform-origin: bottom right;
  transition: opacity var(--aw-panel-duration) ease-out, transform var(--aw-panel-duration) cubic-bezier(.16,1,.3,1), visibility 0s var(--aw-panel-duration);
}
.aw-root[data-position='left'] .aw-panel { transform-origin: bottom left; }
.aw-root[data-open='true'] .aw-panel { transition-delay: 0s; opacity: 1; visibility: visible; transform: none; pointer-events: auto; }
.aw-root[data-empty='true'] .aw-panel { height: auto; max-height: calc(100dvh - 124px - env(safe-area-inset-bottom)); }
.aw-header { display: flex; align-items: center; gap: 9px; padding: 14px 14px 13px; flex: 0 0 auto; }
.aw-avatar { display: flex; align-items: center; flex: 0 0 40px; }
.aw-avatar .agent-orb { pointer-events: none; }
.aw-heading { flex: 1; min-width: 0; }
.aw-heading h2 { margin: 0; color: var(--aw-text); font-size: 14px; font-weight: 650; line-height: 1.5; }
.aw-status { margin: 1px 0 0; color: var(--aw-text-muted); font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
.aw-close, .aw-dismiss {
  display: grid; place-items: center; min-width: 44px; min-height: 44px; padding: 12px;
  border: 0; border-radius: var(--aw-control-radius); background: transparent; color: var(--aw-text-muted);
  flex: 0 0 auto; transition: background var(--aw-fast) ease-out, color var(--aw-fast) ease-out;
}
.aw-close svg, .aw-dismiss svg { width: 16px; height: 16px; }
.aw-close:hover, .aw-dismiss:hover { color: var(--aw-text); background: var(--aw-bg-soft); }
.aw-log {
  display: flex; flex-direction: column; gap: 16px; flex: 1 1 auto; min-height: 0;
  overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin;
  padding: 12px 20px 20px; scroll-padding: 16px;
}
.aw-message {
  align-self: flex-start; max-width: 94%; flex: 0 0 auto;
  padding: 11px 14px; border-radius: var(--aw-message-radius);
  background: var(--aw-bg-soft); color: var(--aw-text);
  line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere;
}
.aw-message[data-role='assistant'] { border-end-start-radius: 4px; }
.aw-message[data-role='user'] { align-self: flex-end; background: var(--aw-bg-user); border-end-end-radius: 4px; }
.aw-root[data-empty='true'] .aw-log { flex: 0 1 auto; padding: 17px 22px 18px; }
.aw-root[data-empty='true'] .aw-message { background: transparent; padding: 0; border-radius: 0; max-width: 100%; font-size: 17px; font-weight: 500; line-height: 1.65; }
.aw-suggestions { display: flex; flex-direction: column; gap: 0; padding: 0 16px 20px; flex: 0 1 auto; min-height: 0; overflow-y: auto; }
.aw-suggestions button {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  min-height: 44px; flex: 0 0 auto; padding: 11px 12px;
  border: 0; border-radius: var(--aw-control-radius); background: transparent;
  color: var(--aw-text-muted); text-align: start; font-size: 13px;
  transition: background var(--aw-fast) ease-out, color var(--aw-fast) ease-out;
}
.aw-suggestions button svg { width: 15px; height: 15px; flex: 0 0 auto; opacity: .6; transition: transform var(--aw-fast) ease-out; }
.aw-suggestions button:hover { background: var(--aw-bg-soft); color: var(--aw-text); }
.aw-suggestions button:hover svg { transform: translateX(2px); }
:host([dir='rtl']) .aw-suggestions button svg { transform: rotate(180deg); }
.aw-error { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; padding: 8px 12px 8px 20px; margin-bottom: 12px; background: var(--aw-error-bg); color: var(--aw-error-text); font-size: 12px; }
.aw-error-text { flex: 1; overflow-wrap: anywhere; }
.aw-retry { min-height: 44px; border: 0; padding: 8px; background: transparent; color: inherit; text-decoration: underline; }
.aw-form {
  display: grid; grid-template-columns: minmax(0, 1fr) 44px; align-items: end; gap: 0 4px;
  padding: 5px; margin: 0 16px 16px; border: 1px solid var(--aw-border);
  border-radius: var(--aw-control-radius); background: var(--aw-bg-soft); flex: 0 0 auto;
  transition: border-color var(--aw-fast) ease-out;
}
.aw-form:focus-within { border-color: var(--aw-focus); }
.aw-label, .aw-button-label { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.aw-input {
  grid-column: 1; grid-row: 1; display: block; width: 100%; min-height: 44px; max-height: 108px;
  resize: none; padding: 11px 8px; border: 0; border-radius: 0;
  color: var(--aw-text); background: transparent; font-size: 14px; line-height: 22px;
}
.aw-input::placeholder { color: var(--aw-text-muted); opacity: 1; }
.aw-input:focus { outline: none; }
.aw-composer-actions { display: contents; }
.aw-hint { grid-column: 1 / -1; grid-row: 2; padding: 2px 8px 5px; color: var(--aw-text-muted); font-size: 10px; line-height: 1.5; }
.aw-send, .aw-stop {
  grid-column: 2; grid-row: 1; display: grid; place-items: center; width: 44px; height: 44px; padding: 10px;
  border: 0; border-radius: var(--aw-control-radius); color: var(--aw-accent-text);
  background: linear-gradient(130deg, var(--aw-accent), var(--aw-accent-hover));
  transition: background var(--aw-fast) ease-out, transform var(--aw-fast) ease-out;
}
.aw-send svg, .aw-stop svg { width: 20px; height: 20px; }
.aw-send:disabled { background: transparent; color: var(--aw-text-muted); opacity: .5; }
.aw-send:not(:disabled):hover { background: var(--aw-accent-hover); }
.aw-send:active, .aw-stop:active { transform: scale(.96); }
.aw-stop { background: var(--aw-bg); color: var(--aw-text); }
.aw-footer { margin: -6px 0 0; padding: 0 20px 14px; color: var(--aw-text-muted); font-size: 11px; text-align: center; flex: 0 0 auto; }
.aw-launcher { display: flex; align-items: center; gap: 12px; pointer-events: auto; }
.aw-root[data-position='left'] .aw-launcher { flex-direction: row-reverse; }
.aw-capsule { display: flex; align-items: center; max-width: min(264px, calc(100vw - 120px)); border: 1px solid var(--aw-border); border-radius: var(--aw-control-radius); background: var(--aw-bg); box-shadow: var(--aw-small-shadow); animation: aw-notice-in var(--aw-panel-duration) ease-out both; }
.aw-notice { border: 0; background: transparent; padding: 12px 0 12px 16px; min-height: 44px; color: var(--aw-text); text-align: start; overflow-wrap: anywhere; }
.aw-orb { display: flex; width: 64px; height: 64px; align-items: center; justify-content: center; flex: 0 0 auto; }
.aw-orb .agent-orb { --ao-badge-ring: var(--aw-bg); }
@keyframes aw-notice-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 480px) {
  :host { --aw-offset: 16px; }
  .aw-input { font-size: 16px; }
  .aw-hint { display: none; }
}
@media (max-height: 540px) {
  .aw-root[data-open='true'] .aw-launcher { display: none; }
  .aw-panel { height: calc(100dvh - 32px - env(safe-area-inset-bottom)); }
  .aw-root[data-empty='true'] .aw-panel { max-height: calc(100dvh - 32px - env(safe-area-inset-bottom)); }
  .aw-header { padding-block: 8px; }
  .aw-suggestions { padding-bottom: 8px; }
  .aw-form { margin-bottom: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
`
