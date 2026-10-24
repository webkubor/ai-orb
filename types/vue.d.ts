import type { DefineComponent } from 'vue'
import type { OrbState, ThemeName, ShapeName, MoodName, MotionMode, CreatureName, AgentOrb as Core } from './index.js'

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
  creature?: CreatureName
  theme?: ThemeName | null
  labels?: Partial<Record<OrbState, string>>
}

export declare const AgentOrb: DefineComponent<
  AgentOrbProps,
  {
    orb: () => Core | null
    poke: (tempMood?: MoodName | null) => Core | undefined
  },
  {},
  {},
  {},
  {},
  {},
  { click: (e: MouseEvent) => void; pet: () => void }
>

export { STATES, SHAPES, MOODS, MOTIONS, CREATURES, DEFAULT_LABELS, THEMES, css, injectStyle } from './index.js'
export type { OrbState, ThemeName, ShapeName, MoodName, MotionMode, CreatureName, AgentOrbOptions } from './index.js'
export default AgentOrb
