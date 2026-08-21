export type OrbState = 'idle' | 'thinking' | 'working' | 'asking' | 'done' | 'error'

export declare const STATES: readonly OrbState[]
export declare const DEFAULT_LABELS: Record<OrbState, string>

export interface AgentOrbOptions {
  /** 初始状态，默认 'idle'。未知值会回落到 'idle' 而不是抛错 */
  state?: OrbState | string
  /** 未读数，state='done' 且 >0 时显示角标 */
  unseen?: number
  /** 尺寸，数字按 px 处理；不传则用 CSS 里的 56px */
  size?: number | string
  /** 眼睛是否跟随鼠标，默认 true */
  follow?: boolean
  /** 是否眨眼，默认 true */
  blink?: boolean
  /** 覆盖无障碍文案，做多语言时用 */
  labels?: Partial<Record<OrbState, string>>
  /** 点击回调 */
  onClick?: (e: MouseEvent) => void
  /** 自定义 document（测试 / 多窗口场景） */
  document?: Document
}

export declare class AgentOrb {
  /**
   * @param host 挂载点。球作为它的子节点插入，host 本身不会被替换。
   * @throws 传入空 host 时抛错——静默失败会被当成样式问题查半天
   */
  constructor(host: Element, options?: AgentOrbOptions)

  /** 生成的 button 元素。想直接改 CSS 变量换主题就用它 */
  readonly el: HTMLButtonElement

  state: OrbState
  unseen: number

  /** 语义糖：orb.set('done', 3) */
  set(state: OrbState, unseen?: number): this

  /** 摘监听、清定时器、移除 DOM。SPA 卸载时必须调 */
  destroy(): void
}

/** 全部样式的字符串形式。默认会自动注入，这个导出留给 SSR / 严格 CSP / 自管样式的场景 */
export declare const css: string
/** 手动注入样式，重复调用只注一次 */
export declare function injectStyle(doc?: Document): void

export default AgentOrb
