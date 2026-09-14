# Website support widget

`ai-orb/widget` adds an optional website support entry: an orb, a dismissible notification capsule and a chat panel. The original `ai-orb` entry stays small and independent. Both have zero runtime dependencies.

## Connect your service

```js
import { AgentWidget } from 'ai-orb/widget'

const widget = new AgentWidget({
  theme: 'orange',
  position: 'right',
  suggestions: ['How can I get started?', 'I need help with an order'],
  onSend: async (text, { signal, messages, setState }) => {
    setState('working')
    // This endpoint belongs to your website. Keep service credentials on your server.
    const response = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, messages }),
      signal,
    })
    if (!response.ok) throw new Error('Support request failed')
    // Return a string or { text, state: 'done' | 'asking' }.
    return response.json()
  },
})

// On SPA unmount:
widget.destroy()
```

A missing handler shows a localized unavailable message. The component never fabricates a response. The interactive example at `demo/embed.html` uses an explicitly labeled local simulation.

## Localization

Every built-in user-facing string, including accessibility labels, can be supplied externally. Partial overrides fall back to English. Supply all fields for a complete translation. Suggestions, replies and custom status messages are application-owned content.

```js
const zh = {
  title: '客服助手',
  greeting: '你好，有什么可以帮你？',
  placeholder: '请输入你的问题…',
  notice: '请勿发送密码或验证码。',
  open: '打开客服', close: '关闭客服', dismiss: '关闭提示',
  send: '发送', stop: '停止', retry: '重试', you: '你',
  inputLabel: '你的消息',
  inputHint: 'Enter 发送 · Shift + Enter 换行',
  unread: count => `${count} 条未读回复`,
  states: {
    idle: '随时为你解答', thinking: '正在理解你的问题…',
    working: '正在处理…', asking: '需要你补充信息',
    done: '回复已就绪', error: '暂时未能完成',
  },
  errors: {
    unavailable: '客服服务尚未连接，请稍后再试。',
    failed: '回复失败，请重试。', empty: '暂未收到回复，请重试。',
    tooLong: '请将消息控制在 2,000 字以内。',
    cancelled: '已停止处理，你可以重试。',
  },
}

widget.setLabels(zh) // Also accepted as constructor option: { labels: zh }.
widget.setSuggestions(['如何开始使用？', '查询订单'])
widget.setDirection('ltr') // 'rtl' for right-to-left languages.
```

Switching labels updates controls, status, current errors, unread formatting and screen-reader text. It does not translate existing messages, drafts, suggestions or a custom message passed to `setState`; update application-owned content alongside your locale.

## Behavior

- `open()`, `close()`, `toggle()`: a non-modal panel, with keyboard focus and Escape support. Closing preserves the draft and conversation and lets a pending request finish. The host website remains operable.
- `send(text)`: trims whitespace, limits requests to 2,000 characters and allows one pending request. Enter sends; Shift + Enter inserts a line break; IME composition is respected.
- `cancel()`: aborts the provided signal, immediately unlocks input and ignores late replies or progress. Your backend should respect cancellation where possible; abort does not undo work already performed remotely.
- Retry reuses the failed user message without duplicating it in history. Failures show your `labels.errors` messages, never a raw server exception.
- `setState(state, message?)`: sets any of the six orb states and an optional application-supplied capsule/status message. For external demonstrations, call `cancel()` first to stop a request from updating the preview later.
- A reply received while closed adds an unread notification. Opening clears the count. Dismissing the capsule leaves the conversation intact.
- `messages` returns copies of the user/assistant history. The initial greeting is not included.
- Messages are rendered as plain text. HTML from a service is not executed.
- Motion respects `prefers-reduced-motion`. Mobile panels use viewport height and safe-area insets.

## Embed styling and lifecycle

The widget uses Shadow DOM to isolate styles from the host page. Mount with `container` (default: `document.body`), preferably outside transformed or clipped ancestors. Set `position: 'left'` for a left-side launcher. Each instance manages its own conversation, locale and requests.

The implementation keeps all content in memory. It does not set cookies, use local storage or make background analytics calls. Persist or restore business conversations in your service if needed. Instantiate after the DOM is available and call `destroy()` when unmounting.

CSS variables are inherited through the widget host. See `src/widget-style.js` for supported `--aw-*` color, spacing and layering tokens. For example, set a variable on `widget.el.style` to adapt it to your website. Restrictive CSP must allow the component's injected styles; no script evaluation is required.
