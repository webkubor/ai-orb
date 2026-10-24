import type { DefineComponent } from 'vue'
import type { OrbState, ThemeName, ShapeName, MoodName, MotionMode, AgentOrb as Core } from './index.js'

export interface AgentOrbProps {
  state?: OrbState
  mood?: MoodName
  motion?: MotionMode
  unseen?: number
  size?: number | string
  follow?: boolean
  squish?: boolean
  blink?: boolean
  shape?: ShapeName
  theme?: ThemeName | null
  labels?: Partial<Record<OrbState, string>>
}

export declare const AgentOrb: DefineComponent<
  AgentOrbProps,
  {
    orb: () => Core | null
    poke: (tempMood?: MoodName) => Core | undefined
  },
  {},
  {},
  {},
  {},
  {},
  { click: (e: MouseEvent) => void }
>

export { STATES, SHAPES, MOODS, MOTIONS, DEFAULT_LABELS, THEMES, css, injectStyle } from './index.js'
export type { OrbState, ThemeName, ShapeName, MoodName, MotionMode, AgentOrbOptions } from './index.js'
export default AgentOrb
