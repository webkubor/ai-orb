/**
 * Crystal 形态（crystal）插件：白玉玻璃球 + 内部丝绸流体 + 无脸表态。
 *
 * 可选加载，核心包不含它：
 *   import 'ai-orb/crystal'
 *   new AgentOrb(el, { skin: 'crystal' })
 * 没加载插件时传 skin 会回落到 shape，老用法和体积都不受影响。
 *
 * 这是 4.0 的「下一个形态」：从「有脸有眼的生灵」转向「不说话但有质感的器物」。
 * 和生灵的差别是根本的 —— 生灵靠五官表态，crystal 靠流动表态：
 *   · 无脸。没有眼睛、没有嘴、没有腮红，只有光。
 *   · 内部丝绸。球体里裹着一层会流动的绸，绸的走向就是它的情绪。
 *   · 玻璃折射。光标移动时，高光在球体内偏移（视差），像隔着玻璃看。
 *
 * 实现手法（全部纯 SVG + CSS，不碰 canvas / WebGL）：
 *   · 球体：径向渐变打底 + 一圈冷调描边做出厚度，靠高斯模糊做软边
 *   · 丝绸：feTurbulence 生成静态噪声场，feDisplacementMap 把噪声当位移贴回绸面
 *     —— 这是纯 SVG 里唯一能出「真丝绸 / 大理石纹」的手段，靠噪声而非手画路径
 *   · 流动：噪声本身不动，动的是整层绸的 transform（旋转 + 呼吸），
 *     两层反向旋转叠出纵深。这样不用每帧重算滤镜，性能友好。
 *   · 折射：内层再套一层反向位移的双色渐变，位移量随状态变化，形成彩散边
 *   · 活感：复用核心的 .ao-eyes 通道做视差偏移（核心每帧写 transform 到那里），
 *     所以光标跟随、挤压倾斜、状态类名全部免费继承
 *
 * 坐标系与几何形态一致（viewBox 0 0 64 64），球心在 (32,32)，半径 27。
 */

import { defineSkins } from './index.js'

const NAMES = ['crystal']

/**
 * 一颗玻璃球。
 *
 * 分层（从后往前）：外晕 → 玻璃壳 → 内部绸面 → 折射彩边 → 高光 → 边光。
 * 绸面裁在球里（clipPath），所以流体不会溢出球外。
 */
function crystalSvg(name, id) {
  const g = `${id}-g`
  const silk = `${id}-silk`
  const silk2 = `${id}-silk2`
  const refr = `${id}-refr`
  const shell = `${id}-shell`

  return `
<svg class="ao-svg ao-crystal-svg" viewBox="0 0 64 64" aria-hidden="true">
  <defs>
    <!-- 球体：中心亮、边缘冷，玉质而非塑料 -->
    <radialGradient id="${g}" cx="36%" cy="30%" r="76%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="34%" stop-color="#f4f6f9"/>
      <stop offset="72%" stop-color="#dde2ea"/>
      <stop offset="100%" stop-color="#bcc4d0"/>
    </radialGradient>

    <!-- 绸面底色：冷白玉质打底，色相由状态变量注入。
         注意：var() 在 SVG 表现属性（stop-color）里不生效，必须走 style，
         否则整条渐变退化成黑色，绸面就没了。 -->
    <linearGradient id="${silk}" x1="14%" y1="4%" x2="88%" y2="96%">
      <stop offset="0%" style="stop-color:var(--cx-c1)"/>
      <stop offset="38%" style="stop-color:var(--cx-c2)"/>
      <stop offset="72%" style="stop-color:var(--cx-c3)"/>
      <stop offset="100%" style="stop-color:var(--cx-c4)"/>
    </linearGradient>

    <!-- 第二层绸：换个角度叠上去，制造深浅不一的褶皱 -->
    <linearGradient id="${silk2}" x1="92%" y1="6%" x2="8%" y2="90%">
      <stop offset="0%" style="stop-color:var(--cx-c2);stop-opacity:.92"/>
      <stop offset="52%" style="stop-color:var(--cx-c3);stop-opacity:.72"/>
      <stop offset="100%" style="stop-color:var(--cx-c1);stop-opacity:.85"/>
    </linearGradient>

    <!-- 折射彩边：冷暖双色，制造玻璃边缘的色散 -->
    <linearGradient id="${refr}" x1="10%" y1="4%" x2="94%" y2="96%">
      <stop offset="0%" stop-color="#8fd8ff" stop-opacity=".85"/>
      <stop offset="34%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ffb3d9" stop-opacity=".85"/>
    </linearGradient>

    <!-- 玻璃壳：把边缘压暗、中心提亮，做出厚度 -->
    <radialGradient id="${shell}" cx="50%" cy="50%" r="50%">
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="91%" stop-color="#ffffff" stop-opacity=".5"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>

    <!-- 丝绸褶皱：噪声高度场 + 漫反射光照 = 立体绸面。
         对比过 6 种做法（遮罩 / 位移 / 灰度填充 / 光照），只有光照能出
         「真丝绸」的立体褶皱 —— 噪声当高度场，光从左上打过来，
         凸起处亮、凹处暗，绸缎的光影就长出来了。
         最后与绸面渐变做乘法（k1），颜色只留一点点冷调。
         每颗球用不同 seed，同页多颗不会撞纹理。 -->
    <filter id="${id}-weave" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <!-- 低频大波浪：绸缎的褶是大尺度流动的，频率必须低，高了就成皱纹纸 -->
      <feTurbulence type="turbulence" baseFrequency="0.009 0.016" numOctaves="3" seed="${3 + (Number(id.slice(2)) || 0) % 7}" result="f"/>
      <feDiffuseLighting in="f" lighting-color="#ffffff" surfaceScale="1.6" diffuseConstant="1" result="l">
        <feDistantLight azimuth="225" elevation="62"/>
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="0.9" k2="0.08" k3="0" k4="0"/>
    </filter>

    <!-- 硬褶版本：思考 / 干活时波纹变深变密一点 —— 注意频率只比软档高一点，
         高太多会变「揉皱的纸」，绸的高级感来自大波浪而非碎褶 -->
    <filter id="${id}-weave-hard" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feTurbulence type="turbulence" baseFrequency="0.014 0.024" numOctaves="3" seed="${3 + (Number(id.slice(2)) || 0) % 7}" result="f"/>
      <feDiffuseLighting in="f" lighting-color="#ffffff" surfaceScale="2.4" diffuseConstant="1.06" result="l">
        <feDistantLight azimuth="225" elevation="56"/>
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
    </filter>

    <clipPath id="${id}-clip">
      <circle cx="32" cy="32" r="26.2"/>
    </clipPath>
  </defs>

  <!-- 外晕：球体投在空气里的辉光 -->
  <circle class="ao-cx-halo" cx="32" cy="32" r="27"/>

  <g class="ao-body-wrap"><g class="ao-bob">
    <!-- 玻璃壳本体 -->
    <circle class="ao-cx-shell" cx="32" cy="32" r="27" fill="url(#${g})"/>

    <g clip-path="url(#${id}-clip)">
      <!-- 内部绸面：一层主绸（光照褶皱）+ 一层薄薄的流转高光。
           两层都做褶皱会互相打架出碎纹，所以第二层只留颜色流动。
           滤镜挂在静态的 rect 上（噪声不动，一次栅格化），
           旋转交给祖先 .ao-cx-silk 的合成层 transform —— 不然每帧重算
           feTurbulence + 光照，多颗同页会烧 CPU。 -->
      <g class="ao-cx-fabric" style="--cx-f:url(#${id}-weave);--cx-f-hard:url(#${id}-weave-hard)">
        <g class="ao-cx-silk ao-cx-silk-a">
          <rect class="ao-cx-weave" x="-10" y="-10" width="84" height="84" fill="url(#${silk})" filter="var(--cx-f)"/>
        </g>
        <g class="ao-cx-silk ao-cx-silk-b">
          <rect class="ao-cx-weave ao-cx-weave-2" x="-10" y="-10" width="84" height="84" fill="url(#${silk2})"/>
        </g>
      </g>

      <!-- 折射彩边：内部的高光边缘 -->
      <ellipse class="ao-cx-refr" cx="32" cy="32" rx="24" ry="24" fill="url(#${refr})"/>

      <!-- 视差层：核心写 transform 到 .ao-eyes，这里放高光，像隔着玻璃看 -->
      <g class="ao-eyes ao-cx-parallax">
        <ellipse class="ao-cx-spec" cx="24" cy="21" rx="8.5" ry="6"/>
        <ellipse class="ao-cx-spec-2" cx="42" cy="43" rx="5" ry="3.4"/>
      </g>
    </g>

    <!-- 玻璃壳：边缘高光 + 底部反光 -->
    <circle class="ao-cx-glass" cx="32" cy="32" r="27" fill="url(#${shell})"/>
    <ellipse class="ao-cx-gloss" cx="23" cy="19" rx="7" ry="4.2"/>

    <!-- 边光：左上一道冷光，勾出球体轮廓 -->
    <path class="ao-cx-rim" d="M14.6 24.2 A21 21 0 0 1 40 11.4" fill="none"/>
  </g></g>
</svg>
<span class="ao-badge"></span>`
}

/**
 * Crystal 形态样式。
 *
 * 状态怎么表态（无脸，全靠流动）：
 *   idle     绸几乎静止，只有极慢的呼吸式漂移 —— 安静在场
 *   thinking 褶皱加深、流速加快，像在翻找思路
 *   working  绸被拉成环状旋转，像齿轮咬合 —— 在干活
 *   asking   绸向上收缩聚拢，像在举手 —— 要你回话
 *   done     绸绽放舒展、色相转暖 —— 好了
 *   error    绸褪成灰、位移归零 —— 出问题了
 */
const crystalCss = `
/* ── 容器 ────────────────────────────────────────────────────────────── */
.ao-skin-crystal{--ao-focus-radius:50%;width:var(--ao-size);height:var(--ao-size)}
.ao-skin-crystal .ao-crystal-svg{overflow:visible}

/* 状态变量：色相、流速、褶皱强度集中在根上，各层用 var() 取用，改一处即可换表情。
   默认是冷白玉（低饱和、偏青），这是「高级感」的底子 —— 粉紫会立刻掉回卡通。 */
.ao-skin-crystal{
  --cx-hue:196;
  --cx-sat:12%;
  --cx-light:86%;
  --cx-flow:1;
  --cx-spin:0deg;
  --cx-zoom:1;
  /* 绸面的四个色标：连续渐变，位移后形成褶皱的深浅 */
  --cx-c1:hsl(var(--cx-hue) calc(var(--cx-sat) + 4%) calc(var(--cx-light) + 8%));
  --cx-c2:hsl(var(--cx-hue) var(--cx-sat) var(--cx-light));
  --cx-c3:hsl(calc(var(--cx-hue) - 12) calc(var(--cx-sat) + 8%) calc(var(--cx-light) - 12%));
  --cx-c4:hsl(calc(var(--cx-hue) - 26) var(--cx-sat) calc(var(--cx-light) - 20%));
}

/* ── 球体 ────────────────────────────────────────────────────────────── */
.ao-cx-halo{
  fill:hsl(var(--cx-hue),calc(var(--cx-sat) + 30%),62%);
  opacity:.13;
  filter:blur(6px);
  transform-origin:32px 32px;
  animation:ao-cx-breathe 4.6s ease-in-out infinite;
  animation-delay:var(--ao-phase);
}
.ao-cx-shell{
  /* 外壳自带一圈极淡的暗边，球才不是贴纸 */
  stroke:rgba(118,130,150,.26);
  stroke-width:.9;
}
.ao-cx-glass{pointer-events:none}

/* ── 内部绸面 ────────────────────────────────────────────────────────── */
.ao-cx-fabric{
  transform-origin:32px 32px;
}
/* 主绸的褶皱滤镜挂在静态 rect 上（一次栅格化），硬褶档切滤镜引用 */
.ao-cx-silk-a .ao-cx-weave{filter:var(--cx-f)}
.is-thinking .ao-cx-silk-a .ao-cx-weave,
.is-working .ao-cx-silk-a .ao-cx-weave,
.is-asking .ao-cx-silk-a .ao-cx-weave{filter:var(--cx-f-hard)}
.ao-cx-silk{
  transform-origin:32px 32px;
  transform-box:view-box;
}
/* 两层反向旋转：一快一慢，叠出纵深，比单层更像流动的绸 */
.ao-cx-silk-a{
  animation:ao-cx-swirl calc(26s / var(--cx-flow)) linear infinite;
  animation-delay:var(--ao-phase);
}
.ao-cx-silk-b{
  animation:ao-cx-swirl-rev calc(34s / var(--cx-flow)) linear infinite;
  animation-delay:var(--ao-phase);
  opacity:.86;
}
.ao-cx-fold-1{fill:hsla(var(--cx-hue),var(--cx-sat),calc(var(--cx-light) + 11%),.9)}
.ao-cx-fold-2{fill:hsla(calc(var(--cx-hue) + 24),calc(var(--cx-sat) + 6%),calc(var(--cx-light) - 5%),.82)}
.ao-cx-fold-3{fill:hsla(calc(var(--cx-hue) - 20),var(--cx-sat),calc(var(--cx-light) - 12%),.7)}
/* 绸面主体：主绸承载褶皱；次绸只做颜色流动，soft-light 轻叠 */
.ao-cx-weave{mix-blend-mode:normal}
.ao-cx-weave-2{mix-blend-mode:soft-light;opacity:.35}

.ao-cx-refr{
  mix-blend-mode:screen;
  opacity:.4;
  transform-origin:32px 32px;
  transition:opacity .5s ease;
}

/* ── 视差与高光 ──────────────────────────────────────────────────────── */
/* .ao-eyes 由核心每帧写 transform，这里承载球体里的高光偏移 */
.ao-cx-parallax{transform-origin:32px 32px}
.ao-cx-spec{
  fill:rgba(255,255,255,.6);
  filter:blur(1.1px);
  transform-origin:24px 21px;
}
.ao-cx-spec-2{fill:rgba(255,255,255,.3);filter:blur(1.4px)}

.ao-cx-gloss{
  fill:rgba(255,255,255,.42);
  filter:blur(2.4px);
}
.ao-cx-rim{
  stroke:rgba(255,255,255,.8);
  stroke-width:2;
  stroke-linecap:round;
  filter:blur(.5px);
}

/* ── 状态的表态 ──────────────────────────────────────────────────────── */
/* 六态必须一眼可分 —— 这是「无脸」方案能成立的前提：没有五官，就靠
   色相、流速、褶皱、缩放四个维度拉开差距。 */
.is-thinking{--cx-flow:2.6;--cx-sat:22%;--cx-hue:206;--cx-zoom:1.03}
.is-working{--cx-flow:3.4;--cx-spin:12deg;--cx-zoom:1.06;--cx-sat:16%;--cx-hue:188}
.is-asking{--cx-flow:1.6;--cx-zoom:.92;--cx-sat:26%;--cx-hue:266}
.is-done{--cx-flow:1.5;--cx-hue:44;--cx-sat:42%;--cx-light:88%;--cx-zoom:1.05}
.is-error{--cx-hue:212;--cx-sat:4%;--cx-light:70%;--cx-flow:.5}

/* 褶皱强度：强弱两档滤镜对调 —— 安静的场合用软褶，忙碌时用硬褶 */
.is-done .ao-cx-halo{opacity:.28}
.is-error .ao-cx-halo{opacity:.05}
.is-error .ao-cx-refr{opacity:.1}
.is-working .ao-cx-refr{opacity:.6}

/* ── 动效 ────────────────────────────────────────────────────────────── */
@keyframes ao-cx-swirl{
  from{transform:rotate(0deg) scale(var(--cx-zoom)) translate(0,0)}
  50%{transform:rotate(180deg) scale(calc(var(--cx-zoom) * 1.03)) translate(1px,-.8px)}
  to{transform:rotate(360deg) scale(var(--cx-zoom)) translate(0,0)}
}
@keyframes ao-cx-swirl-rev{
  from{transform:rotate(0deg) scale(var(--cx-zoom))}
  50%{transform:rotate(-180deg) scale(calc(var(--cx-zoom) * .97)) translate(-.8px,.9px)}
  to{transform:rotate(-360deg) scale(var(--cx-zoom))}
}
@keyframes ao-cx-breathe{
  0%,100%{transform:scale(1);opacity:.13}
  50%{transform:scale(1.05);opacity:.19}
}

/* 光标靠近：玻璃微微聚光，像被注视 */
.ao-near .ao-cx-spec{opacity:1}
.ao-near .ao-cx-halo{opacity:.24}
.ao-near .ao-cx-rim{stroke:rgba(255,255,255,1)}

/* ── 无障碍：尊重减弱动效 ────────────────────────────────────────────── */
@media (prefers-reduced-motion:reduce){
  .ao-cx-halo,.ao-cx-silk-a,.ao-cx-silk-b{animation:none !important}
  .ao-cx-fabric,.ao-cx-refr,.ao-cx-spec{transition:none !important}
}
`

defineSkins({ names: NAMES, svg: crystalSvg, css: crystalCss, styleKey: 'data-agent-orb-crystal' })

export { crystalCss, NAMES as CRYSTAL_SKINS }
