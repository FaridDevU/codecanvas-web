// Concept 3 — "code ↔ canvas duality" (LANDING-REBUILD-SPEC.md, PART 2).
// One full-bleed plane mix()-es two self-generated CanvasTextures — a dark code
// panel and a light rendered-UI mock — via a diagonal scanline wipe driven by a
// scroll `uProgress`, with a velocity-fed chromatic split on the RGB channels.
//
// Reuses videoPanelGL.js's ScrollTrigger -> uniform scrub pipeline and its
// velocity smoothing, but NOT its viewport-fixed canvas / DOM-rect coupling:
// this canvas lives INSIDE its section (absolute inset-0) and never collides with
// the existing fixed video-panel GL. Host plumbing (DPR clamp, IntersectionObserver
// pause-offscreen, ResizeObserver, full dispose chain) mirrors Ballpit.tsx.
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ---------- palette (mirrors src/index.css design tokens) ---------- */
const CODE_BG = '#0d1117'
const COBALT = '#2f3df5'
const COBALT2 = '#6b7cff'
const INK = '#0c0d10'
const INK2 = '#3b3f47'
const MUTED = '#8b909a'
const LINE = '#e7e7e2'
const WHITE = '#ffffff'

// code-token colours — blue/green forward (matches CanvasCode.jsx COL)
const TOK = {
  kw: '#7da0ff', fn: '#9bc1ff', str: '#7ee787', str2: '#76d6c2',
  num: '#e6b072', attr: '#aab1c4', prop: '#d4d9e3', pu: '#7c8290',
  txt: '#c9d1d9', cm: '#586277',
}

// The component that "compiles" into the UI mock on the right. Its string values
// ('#2f3df5', 'Get started', 'Build in the open.') are echoed in drawUiTexture so
// the two halves read as the same source rendered two ways.
const CODE_LINES = [
  [['kw', 'import'], ['txt', ' { '], ['fn', 'Button'], ['txt', ' } '], ['kw', 'from'], ['txt', ' '], ['str', "'@cc/ui'"]],
  [],
  [['kw', 'export'], ['txt', ' '], ['kw', 'default'], ['txt', ' '], ['kw', 'function'], ['txt', ' '], ['fn', 'Hero'], ['pu', '() {']],
  [['txt', '  '], ['kw', 'return'], ['txt', ' '], ['pu', '(']],
  [['txt', '    '], ['pu', '<'], ['fn', 'section'], ['txt', ' '], ['attr', 'className'], ['pu', '='], ['str', '"hero"'], ['pu', '>']],
  [['txt', '      '], ['pu', '<'], ['fn', 'h1'], ['pu', '>'], ['txt', 'Build in the open.'], ['pu', '</'], ['fn', 'h1'], ['pu', '>']],
  [['txt', '      '], ['pu', '<'], ['fn', 'Button']],
  [['txt', '        '], ['attr', 'accent'], ['pu', '='], ['str', "'#2f3df5'"]],
  [['txt', '        '], ['attr', 'radius'], ['pu', '={'], ['num', '14'], ['pu', '}>']],
  [['txt', '        '], ['txt', 'Get started']],
  [['txt', '      '], ['pu', '</'], ['fn', 'Button'], ['pu', '>']],
  [['txt', '    '], ['pu', '</'], ['fn', 'section'], ['pu', '>']],
  [['txt', '  '], ['pu', ')']],
  [['pu', '}']],
  [],
  [['cm', '// canvas edits write back to this file ->']],
]

/* ---------- offscreen 2D texture painters (no external assets) ---------- */
function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

// code side: #0d1117 panel, traffic-light title bar, line numbers + tokens
function drawCodeTexture(cv) {
  const w = cv.width, h = cv.height
  const x = cv.getContext('2d')
  x.clearRect(0, 0, w, h)
  x.fillStyle = CODE_BG
  x.fillRect(0, 0, w, h)

  // title bar
  const bar = Math.round(h * 0.072)
  x.fillStyle = '#0a0c11'
  x.fillRect(0, 0, w, bar)
  x.fillStyle = 'rgba(255,255,255,0.05)'
  x.fillRect(0, bar - 2, w, 2)
  const tr = Math.round(bar * 0.15)
  const baseX = bar * 0.7
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    x.beginPath()
    x.fillStyle = c
    x.arc(baseX + i * bar * 0.5, bar / 2, tr, 0, Math.PI * 2)
    x.fill()
  })
  x.fillStyle = '#6b7686'
  x.textBaseline = 'middle'
  x.textAlign = 'left'
  x.font = `${Math.round(bar * 0.4)}px "Space Mono", Consolas, monospace`
  x.fillText('Hero.jsx', bar * 2.4, bar / 2 + 1)

  // code body — line height derived from the count so it always fits
  const n = CODE_LINES.length
  const lh = (h - bar) / (n + 1.6)
  const fs = Math.round(lh * 0.6)
  const padL = Math.round(w * 0.045)
  const codeX = padL + fs * 2.4
  x.textBaseline = 'alphabetic'
  x.font = `${fs}px "Space Mono", Consolas, monospace`
  let y = bar + lh * 1.2
  for (let i = 0; i < n; i++) {
    x.textAlign = 'right'
    x.fillStyle = '#39414e'
    x.fillText(String(i + 1), codeX - fs * 0.8, y)
    x.textAlign = 'left'
    let cx = codeX
    for (const [t, s] of CODE_LINES[i]) {
      x.fillStyle = TOK[t] || TOK.txt
      x.fillText(s, cx, y)
      cx += x.measureText(s).width
    }
    y += lh
  }
}

// UI side: light paper bg, app card with nav + hero + primary/ghost buttons + chips
function drawUiTexture(cv) {
  const w = cv.width, h = cv.height
  const x = cv.getContext('2d')
  x.clearRect(0, 0, w, h)

  const bg = x.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#f7f7f4')
  bg.addColorStop(1, '#ebedf2')
  x.fillStyle = bg
  x.fillRect(0, 0, w, h)
  const glow = x.createRadialGradient(w * 0.82, h * 0.18, 0, w * 0.82, h * 0.18, w * 0.55)
  glow.addColorStop(0, 'rgba(47,61,245,0.10)')
  glow.addColorStop(1, 'rgba(47,61,245,0)')
  x.fillStyle = glow
  x.fillRect(0, 0, w, h)

  // app window card
  const cx0 = Math.round(w * 0.05)
  const cy0 = Math.round(h * 0.06)
  const cW = w - cx0 * 2
  const cH = h - cy0 * 2
  const cr = Math.round(w * 0.016)
  x.save()
  x.shadowColor = 'rgba(20,30,90,0.16)'
  x.shadowBlur = w * 0.025
  x.shadowOffsetY = h * 0.015
  x.fillStyle = WHITE
  roundRect(x, cx0, cy0, cW, cH, cr)
  x.fill()
  x.restore()
  x.strokeStyle = LINE
  x.lineWidth = Math.max(1, w * 0.0009)
  roundRect(x, cx0, cy0, cW, cH, cr)
  x.stroke()

  const pad = Math.round(cW * 0.055)
  const left = cx0 + pad
  const right = cx0 + cW - pad

  // nav
  const navY = cy0
  const navH = Math.round(cH * 0.13)
  const navMid = navY + navH / 2
  const bs = Math.round(navH * 0.42)
  x.fillStyle = COBALT
  roundRect(x, left, navMid - bs / 2, bs, bs, bs * 0.28)
  x.fill()
  x.strokeStyle = 'rgba(255,255,255,0.95)'
  x.lineWidth = Math.max(2, bs * 0.1)
  x.beginPath()
  x.moveTo(left + bs * 0.36, navMid + bs * 0.22)
  x.lineTo(left + bs * 0.64, navMid - bs * 0.22)
  x.stroke()
  x.fillStyle = INK
  x.textBaseline = 'middle'
  x.textAlign = 'left'
  x.font = `600 ${Math.round(navH * 0.34)}px "Space Grotesk", "Segoe UI", sans-serif`
  x.fillText('CodeCanvas', left + bs + bs * 0.5, navMid + 1)

  const pillH = Math.round(navH * 0.52)
  const pillTxt = '★ Star'
  x.font = `600 ${Math.round(pillH * 0.42)}px "Switzer", "Segoe UI", sans-serif`
  const pillW = x.measureText(pillTxt).width + pillH * 1.2
  const pillX = right - pillW
  x.fillStyle = COBALT
  roundRect(x, pillX, navMid - pillH / 2, pillW, pillH, pillH / 2)
  x.fill()
  x.fillStyle = WHITE
  x.textAlign = 'center'
  x.fillText(pillTxt, pillX + pillW / 2, navMid + 1)

  x.fillStyle = MUTED
  x.textAlign = 'right'
  x.font = `500 ${Math.round(navH * 0.26)}px "Switzer", "Segoe UI", sans-serif`
  let lx = pillX - pad * 0.6
  for (const t of ['Community', 'Docs']) {
    x.fillText(t, lx, navMid + 1)
    lx -= x.measureText(t).width + pad * 0.7
  }

  x.strokeStyle = LINE
  x.lineWidth = Math.max(1, w * 0.0007)
  x.beginPath()
  x.moveTo(left, navY + navH)
  x.lineTo(right, navY + navH)
  x.stroke()

  // hero
  x.textBaseline = 'alphabetic'
  x.textAlign = 'left'
  let hy = navY + navH + Math.round(cH * 0.1)
  x.fillStyle = MUTED
  x.font = `${Math.round(cH * 0.028)}px "Space Mono", Consolas, monospace`
  x.fillText('OPEN SOURCE · MIT LICENSE', left, hy)
  hy += Math.round(cH * 0.1)
  x.fillStyle = INK
  x.font = `600 ${Math.round(cH * 0.11)}px "Space Grotesk", "Segoe UI", sans-serif`
  x.fillText('Build in the open.', left, hy)
  hy += Math.round(cH * 0.075)
  x.fillStyle = INK2
  x.font = `400 ${Math.round(cH * 0.034)}px "Switzer", "Segoe UI", sans-serif`
  x.fillText('A local-first design IDE — edit the live canvas,', left, hy)
  hy += Math.round(cH * 0.05)
  x.fillText('and keep the real source code.', left, hy)
  hy += Math.round(cH * 0.075)

  // buttons
  const btnH = Math.round(cH * 0.082)
  x.textBaseline = 'middle'
  x.font = `600 ${Math.round(btnH * 0.42)}px "Switzer", "Segoe UI", sans-serif`
  const t1 = 'Get started'
  x.textAlign = 'left'
  const b1W = x.measureText(t1).width + btnH * 1.3
  x.fillStyle = COBALT
  roundRect(x, left, hy, b1W, btnH, btnH / 2)
  x.fill()
  x.fillStyle = WHITE
  x.textAlign = 'center'
  x.fillText(t1, left + b1W / 2, hy + btnH / 2 + 1)

  const t2 = 'Read docs'
  x.textAlign = 'left'
  const b2W = x.measureText(t2).width + btnH * 1.3
  const b2X = left + b1W + Math.round(btnH * 0.4)
  x.fillStyle = WHITE
  x.strokeStyle = LINE
  x.lineWidth = Math.max(1, w * 0.001)
  roundRect(x, b2X, hy, b2W, btnH, btnH / 2)
  x.fill()
  x.stroke()
  x.fillStyle = INK
  x.textAlign = 'center'
  x.fillText(t2, b2X + b2W / 2, hy + btnH / 2 + 1)
  x.textBaseline = 'alphabetic'

  // feature cards row
  const fcY = cy0 + cH - Math.round(cH * 0.26)
  const fcH = Math.round(cH * 0.18)
  const gap = Math.round(pad * 0.5)
  const fcW = Math.round((right - left - gap * 2) / 3)
  const icons = [COBALT, COBALT2, '#9fb0ff']
  for (let i = 0; i < 3; i++) {
    const fx = left + i * (fcW + gap)
    x.fillStyle = '#fbfbf9'
    x.strokeStyle = LINE
    x.lineWidth = Math.max(1, w * 0.0007)
    roundRect(x, fx, fcY, fcW, fcH, Math.round(w * 0.012))
    x.fill()
    x.stroke()
    const ip = Math.round(fcW * 0.12)
    const is = Math.round(fcH * 0.26)
    x.fillStyle = icons[i]
    roundRect(x, fx + ip, fcY + ip, is, is, is * 0.28)
    x.fill()
    x.fillStyle = '#d8dbe2'
    roundRect(x, fx + ip, fcY + ip + is + ip * 0.6, fcW * 0.6, fcH * 0.1, fcH * 0.05)
    x.fill()
    x.fillStyle = '#e7e9ee'
    roundRect(x, fx + ip, fcY + ip + is + ip * 0.6 + fcH * 0.18, fcW * 0.42, fcH * 0.1, fcH * 0.05)
    x.fill()
  }
}

/* ---------- shaders ---------- */
// fullscreen quad: PlaneGeometry(2,2) positions are already clip-space, so we skip
// the camera entirely (no projection math, resolution-independent).
const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
varying vec2 vUv;
uniform sampler2D uCodeTex;
uniform sampler2D uUiTex;
uniform float uProgress;   // 0 = all code, 1 = all UI (scroll-driven)
uniform float uVelocity;   // smoothed scroll velocity, ~[-1,1]
uniform float uAspect;     // container w/h
uniform float uTexAspect;  // texture w/h
uniform vec3  uAccent;
uniform vec3  uAccent2;

// background-size: cover — keep textures filled without distortion
vec2 coverUv(vec2 uv) {
  vec2 s = (uAspect < uTexAspect)
    ? vec2(uAspect / uTexAspect, 1.0)
    : vec2(1.0, uTexAspect / uAspect);
  return (uv - 0.5) * s + 0.5;
}
float hash(float n) { return fract(sin(n) * 43758.5453123); }

// the duality at one screen-uv. rgb = code/ui mix, a = wipe-front glow.
vec4 scene(vec2 uv) {
  vec2 tuv = clamp(coverUv(uv), 0.0, 1.0);
  vec3 codeCol = texture2D(uCodeTex, tuv).rgb;
  vec3 uiCol   = texture2D(uUiTex,  tuv).rgb;

  // diagonal coord: 0 at bottom-right (UI reveals first), 1 at top-left (code last)
  float diag = ((1.0 - uv.x) + uv.y) * 0.5;

  // break the wipe edge into horizontal scan bands that lead/lag => scanline wipe
  float bands = 26.0;
  float band = floor(uv.y * bands);
  float jitter = hash(band) - 0.5;
  float w = 0.16;
  float diagScan = diag + jitter * w * 0.9;

  // front expanded by the edge width so both corners fully clear at 0 and 1
  float p = uProgress * (1.0 + 2.0 * w) - w;
  float m = smoothstep(diagScan - w * 0.5, diagScan + w * 0.5, p);

  float edge = 1.0 - smoothstep(0.0, w * 0.85, abs(p - diagScan));
  edge *= step(0.001, uProgress) * step(uProgress, 0.999);

  return vec4(mix(codeCol, uiCol, m), edge);
}

void main() {
  float ca = uVelocity * 0.012;                 // velocity -> horizontal RGB split
  vec4 sR = scene(vUv + vec2(ca, 0.0));
  vec4 sG = scene(vUv);
  vec4 sB = scene(vUv - vec2(ca, 0.0));
  vec3 col = vec3(sR.r, sG.g, sB.b);
  col += mix(uAccent, uAccent2, 0.5) * sG.a * 0.5;   // cobalt glow on the wipe front
  gl_FragColor = vec4(col, 1.0);
}
`

/* ---------- mount ---------- */
export function mountCodeCanvasDualityGL(canvas, opts = {}) {
  const section = opts.section || canvas.closest('section')
  const parent = canvas.parentElement
  if (!section || !parent) throw new Error('codeCanvasDualityGL: missing section / parent')

  const TEX_W = opts.texW || 1600
  const TEX_H = opts.texH || 1000

  const codeCanvas = document.createElement('canvas')
  codeCanvas.width = TEX_W
  codeCanvas.height = TEX_H
  const uiCanvas = document.createElement('canvas')
  uiCanvas.width = TEX_W
  uiCanvas.height = TEX_H
  drawCodeTexture(codeCanvas)
  drawUiTexture(uiCanvas)

  // renderer.create throws when WebGL is unavailable — the caller try/catches it.
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
  })
  const isMobile = window.matchMedia('(max-width: 767px)').matches
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2))

  const scene = new THREE.Scene()
  const camera = new THREE.Camera() // identity — vertex shader emits clip coords

  const codeTex = new THREE.CanvasTexture(codeCanvas)
  const uiTex = new THREE.CanvasTexture(uiCanvas)
  for (const t of [codeTex, uiTex]) {
    t.colorSpace = THREE.SRGBColorSpace
    t.minFilter = THREE.LinearMipmapLinearFilter
    t.magFilter = THREE.LinearFilter
    t.generateMipmaps = true
    t.anisotropy = renderer.capabilities.getMaxAnisotropy()
    t.needsUpdate = true
  }

  const uniforms = {
    uCodeTex: { value: codeTex },
    uUiTex: { value: uiTex },
    uProgress: { value: 0 },
    uVelocity: { value: 0 },
    uAspect: { value: 1 },
    uTexAspect: { value: TEX_W / TEX_H },
    uAccent: { value: new THREE.Color(opts.accent || COBALT) },
    uAccent2: { value: new THREE.Color(opts.accent2 || COBALT2) },
  }
  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.frustumCulled = false
  scene.add(mesh)

  let disposed = false

  function size() {
    // measure the canvas's own content box (no border) so the drawing buffer maps
    // 1:1 to the displayed pixels; fall back to the parent if it hasn't laid out.
    const w = Math.max(1, canvas.clientWidth || parent.clientWidth)
    const h = Math.max(1, canvas.clientHeight || parent.clientHeight)
    renderer.setSize(w, h, false) // CSS (absolute inset-0) governs layout size
    uniforms.uAspect.value = w / h
  }
  size()

  // velocity smoothing — decays to flat when idle (mirrors videoPanelGL.js)
  let velTarget = 0
  let velSmooth = 0
  function frame() {
    velTarget *= 0.9
    velSmooth += (velTarget - velSmooth) * 0.1
    uniforms.uVelocity.value = THREE.MathUtils.clamp(velSmooth / 120, -1, 1)
    renderer.render(scene, camera)
  }
  renderer.render(scene, camera) // initial paint

  // pause/resume the rAF loop when offscreen (Ballpit pattern)
  let running = false
  const start = () => { if (!running && !disposed) { running = true; renderer.setAnimationLoop(frame) } }
  const stop = () => { if (running) { running = false; renderer.setAnimationLoop(null) } }
  const io = new IntersectionObserver(
    (entries) => { entries[0] && entries[0].isIntersecting ? start() : stop() },
    { threshold: 0 },
  )
  io.observe(canvas)

  // scroll -> uProgress + velocity. Pin the stage so it stays centred while the
  // morph plays out over an extended scroll distance — otherwise it flies past
  // before you can watch the whole code->canvas transition.
  const st = ScrollTrigger.create({
    trigger: parent,
    pin: parent,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    start: opts.start || 'center center',
    end: opts.end || '+=130%',
    scrub: true,
    onUpdate: (self) => {
      uniforms.uProgress.value = self.progress
      velTarget = THREE.MathUtils.clamp(self.getVelocity() / 40, -120, 120)
    },
  })

  // resize: re-measure the stage, rAF-debounced
  let roPending = false
  const ro = new ResizeObserver(() => {
    if (roPending || disposed) return
    roPending = true
    requestAnimationFrame(() => {
      roPending = false
      if (disposed) return
      size()
      if (!running) renderer.render(scene, camera)
    })
  })
  ro.observe(parent)

  // fonts swap in late -> repaint crisp text + re-measure trigger positions
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (disposed) return
      drawCodeTexture(codeCanvas)
      drawUiTexture(uiCanvas)
      codeTex.needsUpdate = true
      uiTex.needsUpdate = true
      ScrollTrigger.refresh()
      if (!running) renderer.render(scene, camera)
    })
  }

  return () => {
    disposed = true
    st.kill()
    io.disconnect()
    ro.disconnect()
    renderer.setAnimationLoop(null)
    geometry.dispose()
    material.dispose()
    codeTex.dispose()
    uiTex.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }
}
