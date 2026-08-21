import type { DefineComponent } from 'vue'
import type { OrbState, AgentOrb as Core } from './index.js'

export interface AgentOrbProps {
  state?: OrbState
  unseen?: number
  size?: number | string
  /** 只在挂载时读取 */
  follow?: boolean
  /** 只在挂载时读取 */
  blink?: boolean
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

export { STATES, DEFAULT_LABELS, css, injectStyle } from './index.js'
export type { OrbState, AgentOrbOptions } from './index.js'
export default AgentOrb
