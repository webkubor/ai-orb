/** 客服入口的默认英文文案。外部可整体或按字段覆盖，不翻译已有对话内容。 */
export const DEFAULT_WIDGET_LABELS = {
  title: 'AI assistant',
  greeting: 'Hi! How can I help you?',
  placeholder: 'Type your question…',
  notice: '',
  open: 'Open assistant',
  close: 'Close assistant',
  dismiss: 'Dismiss notification',
  send: 'Send',
  stop: 'Stop',
  retry: 'Try again',
  you: 'You',
  inputLabel: 'Your message',
  inputHint: 'Enter to send · Shift + Enter for a new line',
  unread: (count) => `${count} unread ${count === 1 ? 'reply' : 'replies'}`,
  states: {
    idle: 'Ready to help', thinking: 'Thinking…', working: 'Working on it…',
    asking: 'Waiting for your reply', done: 'Reply ready', error: 'Unable to complete',
  },
  errors: {
    unavailable: 'Support is not connected yet. Please try again later.',
    failed: 'Could not get a reply. Please try again.',
    empty: 'No reply was received. Please try again.',
    tooLong: 'Please keep your message under 2,000 characters.',
    cancelled: 'Request stopped. You can try again.',
  },
}

/** 合并嵌套文案，仅接受已知字符串与未读格式函数。 */
export function mergeLabels(current, next = {}) {
  const strings = Object.fromEntries(Object.keys(current)
    .filter(key => typeof current[key] === 'string' && typeof next[key] === 'string')
    .map(key => [key, next[key]]))
  return {
    ...current, ...strings,
    unread: typeof next.unread === 'function' ? next.unread : current.unread,
    states: mergeStrings(current.states, next.states),
    errors: mergeStrings(current.errors, next.errors),
  }
}

function mergeStrings(current, next = {}) {
  return Object.fromEntries(Object.entries(current)
    .map(([key, value]) => [key, typeof next?.[key] === 'string' ? next[key] : value]))
}
