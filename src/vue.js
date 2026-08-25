/**
 * Vue 3 封装 —— 薄薄一层，**不重写 SVG**。
 *
 * 它只做三件事：挂载时 new 一个 core 实例、props 变了调 setter、卸载时 destroy。
 * 形状、动效、状态逻辑全在 core 里，这里一行都不复制。
 *
 * 这是刻意的：如果 Vue 版自己画一遍 SVG，两份实现就会各自演进——
 * 改了眼形忘了改另一边，最后同一个库在两个框架下长得不一样。
 * 宁可这层薄到看起来「没干什么」，也不要两份真源。
 *
 *   <script setup>
 *   import { AgentOrb } from 'agent-orb/vue'
 *   </script>
 *   <template>
 *     <AgentOrb :state="state" :unseen="n" @click="open" />
 *   </template>
 */
import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { AgentOrb as Core, STATES, SHAPES } from './index.js'

export const AgentOrb = defineComponent({
  name: 'AgentOrb',
  props: {
    /** idle | thinking | working | asking | done | error */
    state: { type: String, default: 'idle', validator: (v) => STATES.includes(v) },
    /** 未读数，state='done' 且 >0 时显示角标 */
    unseen: { type: Number, default: 0 },
    /** 尺寸，数字按 px */
    size: { type: [Number, String], default: undefined },
    /** 眼睛跟随鼠标 */
    follow: { type: Boolean, default: true },
    /** 眨眼 */
    blink: { type: Boolean, default: true },
    /** 外形：circle / squircle / pill，只在挂载时读取 */
    shape: { type: String, default: undefined, validator: (v) => !v || SHAPES.includes(v) },
    /** 内置主题名，不传则用 CSS 默认值 */
    theme: { type: String, default: undefined },
    /** 覆盖无障碍文案，做多语言时用 */
    labels: { type: Object, default: undefined },
  },
  emits: ['click'],
  setup(props, { emit, expose }) {
    const host = ref(null)
    let orb = null

    onMounted(() => {
      orb = new Core(host.value, {
        state: props.state,
        unseen: props.unseen,
        size: props.size,
        follow: props.follow,
        blink: props.blink,
        shape: props.shape,
        theme: props.theme,
        labels: props.labels,
        onClick: (e) => emit('click', e),
      })
    })

    // follow / blink / size 只在挂载时读：它们是「这颗球是什么样的球」，
    // 不是会随业务变的状态。真要动态改，destroy 重建比在 core 里加一堆
    // 开关分支干净得多——而且现实里没人会中途关掉眨眼。
    watch(() => props.state, (v) => { if (orb) orb.state = v })
    watch(() => props.unseen, (v) => { if (orb) orb.unseen = v })
    watch(() => props.theme, (v) => { if (orb) orb.theme = v })

    onBeforeUnmount(() => { orb?.destroy(); orb = null })

    // 逃生口：需要直接操作 core 实例时（比如强制眨一下眼）能拿到
    expose({ orb: () => orb })

    return () => h('span', { ref: host, class: 'agent-orb-host', style: { display: 'inline-flex' } })
  },
})

export { STATES, DEFAULT_LABELS, SHAPES, THEMES, css, injectStyle } from './index.js'
export default AgentOrb
