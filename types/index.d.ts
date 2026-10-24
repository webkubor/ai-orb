export type OrbState = 'idle' | 'thinking' | 'working' | 'asking' | 'done' | 'error'
export type ThemeName = 'orange' | 'blue' | 'green' | 'violet' | 'rose' | 'gold' | 'cyan' | 'graphite'
export type ShapeName = 'circle' | 'squircle' | 'pill' | 'diamond' | 'hex' | 'shield' | 'drop' | 'bean' | 'star'
export type MoodName = 'neutral' | 'happy' | 'curious' | 'focused' | 'playful' | 'sparkle' | 'zen' | 'surprised'
export type MotionMode = 'breathe' | 'float' | 'bounce' | 'pulse' | 'orbit'

export declare const STATES: readonly OrbState[]
export declare const SHAPES: readonly ShapeName[]
export declare const MOODS: readonly MoodName[]
export declare const MOTIONS: readonly MotionMode[]
export declare const DEFAULT_LABELS: Record<OrbState, string>
export declare const THEMES: Record<ThemeName, Record<string, string>>

export interface AgentOrbOptions {
  /** 初始状态，默认 'idle'。未知值会回落到 'idle' 而不是抛错 */
  state?: OrbState | string
  /** 初始情绪表情，默认 'neutral' */
  mood?: MoodName | string
  /** 独立运动节奏模式：breathe | float | bounce | pulse | orbit */
  motion?: MotionMode | string
  /** 未读数，state='done' 且 >0 时显示角标 */
  unseen?: number
  /** 尺寸，数字按 px 处理；不传则用 CSS 里的 56px */
  size?: number | string
  /** 眼睛是否跟随鼠标，默认 true */
  follow?: boolean
  /** 果冻弹性形变，默认 true */
  squish?: boolean
  /** 是否眨眼，默认 true */
  blink?: boolean
  /** 外形几何：circle / squircle / pill / diamond / hex / shield / drop / bean / star */
  shape?: ShapeName
  /** 内置主题名 */
  theme?: ThemeName | null
  /** 覆盖无障碍文案 */
  labels?: Partial<Record<OrbState, string>>
  /** 点击回调 */
  onClick?: (e: MouseEvent) => void
  /** 自定义 document */
  document?: Document
  /** 自动注入样式；默认 true */
  injectStyle?: boolean
}

export declare class AgentOrb {
  constructor(host: Element, options?: AgentOrbOptions)

  readonly el: HTMLButtonElement

  state: OrbState
  mood: MoodName
  motion: MotionMode | null
  unseen: number
  theme: ThemeName | null
  readonly shape: ShapeName

  /** 触发果冻弹性挤压微弹与临时情绪 */
  poke(tempMood?: MoodName): this

  set(state: OrbState, unseen?: number): this

  destroy(): void
}

export declare const css: string
export declare function injectStyle(doc?: Document): void

export default AgentOrb
