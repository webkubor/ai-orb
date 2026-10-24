/**
 * ai-orb 3.0 Vue 3 组件封装
 */
import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { AgentOrb as Core, STATES, SHAPES, MOODS, MOTIONS } from './index.js'

export const AgentOrb = defineComponent({
  name: 'AgentOrb',
  props: {
    /** 运行状态：idle | thinking | working | asking | done | error */
    state: { type: String, default: 'idle', validator: (v) => STATES.includes(v) },
    /** 情绪表情：neutral | happy | curious | focused | playful | sparkle | zen | surprised */
    mood: { type: String, default: 'neutral', validator: (v) => MOODS.includes(v) },
    /** 独立动效模式：breathe | float | bounce | pulse | orbit */
    motion: { type: String, default: undefined, validator: (v) => !v || MOTIONS.includes(v) },
    /** 未读数，state='done' 且 >0 时显示角标 */
    unseen: { type: Number, default: 0 },
    /** 尺寸，数字按 px */
    size: { type: [Number, String], default: undefined },
    /** 眼睛跟随鼠标 */
    follow: { type: Boolean, default: true },
    /** 3.0 果冻弹性形变 */
    squish: { type: Boolean, default: true },
    /** 眨眼 */
    blink: { type: Boolean, default: true },
    /** 几何形态：circle/squircle/pill/diamond/hex/shield/drop/bean/star */
    shape: { type: String, default: undefined, validator: (v) => !v || SHAPES.includes(v) },
    /** 内置主题名 */
    theme: { type: String, default: undefined },
    /** 覆盖无障碍文案 */
    labels: { type: Object, default: undefined },
  },
  emits: ['click'],
  setup(props, { emit, expose }) {
    const host = ref(null)
    let orb = null

    onMounted(() => {
      orb = new Core(host.value, {
        state: props.state,
        mood: props.mood,
        motion: props.motion,
        unseen: props.unseen,
        size: props.size,
        follow: props.follow,
        squish: props.squish,
        blink: props.blink,
        shape: props.shape,
        theme: props.theme,
        labels: props.labels,
        onClick: (e) => emit('click', e),
      })
    })

    watch(() => props.state, (v) => { if (orb) orb.state = v })
    watch(() => props.mood, (v) => { if (orb) orb.mood = v })
    watch(() => props.motion, (v) => { if (orb) orb.motion = v })
    watch(() => props.unseen, (v) => { if (orb) orb.unseen = v })
    watch(() => props.theme, (v) => { if (orb) orb.theme = v })

    onBeforeUnmount(() => { orb?.destroy(); orb = null })

    // 暴露 poke 与 core 实例
    expose({
      orb: () => orb,
      poke: (tempMood) => orb?.poke(tempMood),
    })

    return () => h('span', { ref: host, class: 'agent-orb-host', style: { display: 'inline-flex' } })
  },
})

export { STATES, SHAPES, MOODS, MOTIONS, DEFAULT_LABELS, THEMES, css, injectStyle } from './index.js'
export default AgentOrb
