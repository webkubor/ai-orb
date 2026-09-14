/** 网站嵌入客服入口的接口与国际化文案。 */
import type { AgentOrb, OrbState, ThemeName } from './index.js'

/** 对话记录；greeting 不计入发送给服务端的历史。 */
export interface WidgetMessage {
  role: 'assistant' | 'user'
  text: string
}

/** 服务端返回的文本及完成/追问状态。 */
export interface WidgetReply {
  text: string
  state?: 'done' | 'asking'
}

/** 所有用户可见默认文案均可覆盖；业务消息由服务端自行本地化。 */
export interface WidgetLabels {
  title: string
  greeting: string
  placeholder: string
  notice: string
  open: string
  close: string
  dismiss: string
  send: string
  stop: string
  retry: string
  you: string
  inputLabel: string
  inputHint: string
  unread: (count: number) => string
  states: Record<OrbState, string>
  errors: {
    unavailable: string
    failed: string
    empty: string
    tooLong: string
    cancelled: string
  }
}

/** 可按需覆盖文案，states/errors 也支持部分字段。 */
export type WidgetLabelOverrides = Partial<Omit<WidgetLabels, 'states' | 'errors'>> & {
  states?: Partial<WidgetLabels['states']>
  errors?: Partial<WidgetLabels['errors']>
}

/** 发送上下文：取消信号、当前历史副本和处理进度。 */
export interface WidgetSendContext {
  signal: AbortSignal
  messages: WidgetMessage[]
  setState: (state: 'thinking' | 'working') => void
}

/** 无默认网络请求；接入方提供 onSend 并负责服务鉴权。 */
export interface AgentWidgetOptions {
  container?: Element
  labels?: WidgetLabelOverrides
  theme?: ThemeName
  position?: 'left' | 'right'
  dir?: 'ltr' | 'rtl'
  suggestions?: string[]
  onSend?: (text: string, context: WidgetSendContext) =>
    string | WidgetReply | Promise<string | WidgetReply>
}

/** 独立引入的球→胶囊→非模态面板；destroy 时清理请求与实例。 */
export declare class AgentWidget {
  constructor(options?: AgentWidgetOptions)
  readonly el: HTMLDivElement
  readonly root: ShadowRoot
  readonly orb: AgentOrb
  readonly state: OrbState
  readonly isOpen: boolean
  readonly messages: WidgetMessage[]
  open(): void
  close(): void
  toggle(): void
  setState(state: OrbState, message?: string): void
  setLabels(labels: WidgetLabelOverrides): void
  setDirection(dir: 'ltr' | 'rtl'): void
  setSuggestions(suggestions: string[]): void
  /** 自动过滤空白与重复发送，失败显示本地化错误，不抛出服务错误。 */
  send(text: string): Promise<void>
  /** 中止当前请求，忽略迟到回复；支持重试。 */
  cancel(): void
  destroy(): void
}

export declare const DEFAULT_WIDGET_LABELS: WidgetLabels
export default AgentWidget
