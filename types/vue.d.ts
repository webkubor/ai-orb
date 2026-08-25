import type { DefineComponent } from 'vue'
import type { OrbState, ThemeName, ShapeName, AgentOrb as Core } from './index.js'

export interface AgentOrbProps {
  state?: OrbState
  unseen?: number
  size?: number | string
  /** 只在挂载时读取 */
  follow?: boolean
  /** 只在挂载时读取 */
  blink?: boolean
  /** 外形：circle / squircle / pill，只在挂载时读取 */
  shape?: ShapeName
  /** 内置主题名 */
  theme?: ThemeName | null
  /** 只在挂载时读取 */
  labels?: Partial<Record<OrbState, string>>
}

export declare const AgentOrb: DefineComponent<
  AgentOrbProps,
  { orb: () => Core | null },
  {},
  {},
  {},
  {},
  {},
  { click: (e: MouseEvent) => void }
>

export { STATES, DEFAULT_LABELS, SHAPES, THEMES, css, injectStyle } from './index.js'
export type { OrbState, ThemeName, ShapeName, AgentOrbOptions } from './index.js'
export default AgentOrb
