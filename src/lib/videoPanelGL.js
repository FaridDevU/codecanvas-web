// Faithful port of lusion.co's WebGL "video panel": a shader plane reads two DOM
// anchor rects (#video-panel-start / #video-panel-end) and morphs the video from
// the small start rect to the big centred end rect as you scroll, with a tint
// that fades and a subtle tilt. Ported from the reverse-engineered lusion source
// (videoPanelShader.js + the glsl), adapted to run on its own transparent canvas.
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FRUSTUM = 10 // world height of the viewport (1 unit == FRUSTUM/innerHeight px)

/* ---------- shaders (common.glsl inlined; no glsl plugin needed) ---------- */
const COMMON = /* glsl */ `
vec2 getNdcUV(vec2 uv) { return uv * 2.0 - 1.0; }
float roundedCornerMask(vec2 uv, float borderRadius, float aspect, float taper) {
  vec2 uv_ndc = abs(getNdcUV(uv));
  vec2 corner;
  corner.x = uv_ndc.x - (1.0 - borderRadius - taper);
  corner.y = uv_ndc.y - (1.0 - borderRadius);
  corner = max(corner, vec2(0.0, 0.0));
  corner.x *= aspect;
  return step(length(corner), borderRadius);
}
float roundedCornerMask(vec2 uv, float borderRadius, float aspect) {
  return roundedCornerMask(uv, borderRadius, aspect, 0.0);
}
`

const VERT = /* glsl */ `
#define PI 3.14159265358979
${COMMON}
uniform float animateProgress;
uniform float uVelocity;
uniform vec4 startRect;
uniform vec4 endRect;
varying vec2 vUv;

vec2 rotateLocal(vec2 v, float a) {
  float s = sin(a); float c = cos(a);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}
vec2 getRectPos(vec4 rect, vec2 uv) {
  vec2 pos;
  pos.x = mix(rect.x, rect.x + rect.w, uv.x);
  pos.y = mix(rect.y - rect.z, rect.y, uv.y);
  return pos;
}
void main() {
  float transitionWeight = 1. - (pow(uv.x * uv.x, 0.75) + pow(uv.y, 1.5)) / 2.;
  float localProgress = smoothstep(transitionWeight * 0.3, 0.7 + transitionWeight * 0.3, animateProgress);

  vec2 startPos = getRectPos(startRect, uv);
  vec2 endPos = getRectPos(endRect, uv);
  vec2 posXY = mix(startPos, endPos, localProgress);

  float width = mix(startRect.w, endRect.w, localProgress);
  posXY.x += mix(width, 0., cos(localProgress * PI * 2.) * 0.5 + 0.5) * 0.1;

  float rot = (smoothstep(0., 1., localProgress) - localProgress) * -0.5;
  posXY = rotateLocal(posXY, rot);

  // Velocity bow — the plane bends subtly with fast scroll, settles when idle.
  posXY.x += sin(uv.y * PI) * (uVelocity / 120.) * 0.06 * sign(uVelocity);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(posXY, 0.0, 1.0);
  vUv = uv;
}
`

const FRAG = /* glsl */ `
#define REFERENCE_ASPECT 1.77777777778
${COMMON}
uniform float animateProgress;
uniform float borderRadius;
uniform vec4 startRect;
uniform vec4 endRect;
uniform vec3 tintColour;
uniform sampler2D map;
varying vec2 vUv;

float getAspect() {
  float width = mix(startRect.w, endRect.w, animateProgress);
  float height = mix(startRect.z, endRect.z, animateProgress);
  return width / height;
}
void main() {
  vec2 uv = vUv;
  float aspect = getAspect();
  float aspectScale = (aspect / REFERENCE_ASPECT) - 1.;
  aspectScale /= aspect;
  uv.y = mix(aspectScale, 1.0 - aspectScale, vUv.y);

  vec4 albedo = texture2D(map, uv);
  float tintCurve = 1.0 - smoothstep(1., 0.0, animateProgress);
  albedo.a = roundedCornerMask(vUv, borderRadius, aspect);
  albedo.rgb = mix(albedo.rgb * tintColour, albedo.rgb, tintCurve);
  gl_FragColor = albedo;
}
`

/* ---------- DOM-rect → world math (ported from utils.js) ---------- */
function updateCameraIntrinsics(cam, frustum) {
  const aspect = window.innerWidth / window.innerHeight
  cam.left = (-frustum * aspect) / 2
  cam.right = (frustum * aspect) / 2
  cam.top = frustum / 2
  cam.bottom = -frustum / 2
  cam.updateProjectionMatrix()
}
function pageToWorld(pageX, pageY, cam) {
  const nx = (pageX / window.innerWidth) * 2 - 1
  const ny = -(pageY / window.innerHeight) * 2 + 1
  const nearRel = cam.near + cam.position.z
  const farRel = -cam.far - cam.position.z
  const t = THREE.MathUtils.inverseLerp(farRel, nearRel, -cam.position.z)
  const p = new THREE.Vector3(nx, ny, -t)
  p.unproject(cam)
  return p
}
function pxToWorld(px, cam) {
  return px * ((cam.top - cam.bottom) / window.innerHeight)
}
function elPageCoords(id, anchor = { x: 0.5, y: 0.5 }) {
  const r = document.getElementById(id).getBoundingClientRect()
  return { x: r.left + r.width * anchor.x, y: r.top + r.height * anchor.y, width: r.width, height: r.height }
}
function elWorldRect(id, cam, anchor = { x: 0.5, y: 0.5 }) {
  const c = elPageCoords(id, anchor)
  return { position: pageToWorld(c.x, c.y, cam), width: pxToWorld(c.width, cam), height: pxToWorld(c.height, cam) }
}
function elLocalRect(id, parent, cam) {
  const { position, width, height } = elWorldRect(id, cam, { x: 0, y: 0 })
  parent.worldToLocal(position)
  return { position, width, height }
}
// x=pos.x, y=pos.y, z=height, w=width  (shader vec4 layout)
const rectToVec4 = (r) => new THREE.Vector4(r.position.x, r.position.y, r.height, r.width)

/* ---------- mount ---------- */
export function mountVideoPanelGL(canvas, videoSrc, opts = {}) {
  const START_ID = 'video-panel-start'
  const END_ID = 'video-panel-end'

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch (e) {
    console.warn('videoPanelGL: WebGL unavailable, skipping plane.', e)
    return () => {}
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const camera = new THREE.OrthographicCamera()
  camera.near = 0
  camera.far = 1000
  camera.position.z = 10
  updateCameraIntrinsics(camera, FRUSTUM)

  const scene = new THREE.Scene()

  // video texture — videoSrc may be one clip or a list of short clips to cycle
  // (the panel shows small clips; the full reel plays elsewhere on a button).
  const clips = Array.isArray(videoSrc) ? videoSrc : [videoSrc]
  let clipIdx = 0
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.loop = clips.length === 1
  video.src = clips[0]
  video.play().catch(() => {})
  const nextClip = () => {
    clipIdx = (clipIdx + 1) % clips.length
    video.src = clips[clipIdx]
    video.play().catch(() => {})
  }
  if (clips.length > 1) video.addEventListener('ended', nextClip)
  const texture = new THREE.VideoTexture(video)
  texture.colorSpace = THREE.SRGBColorSpace

  // panel group placed at the start element's world position
  const group = new THREE.Group()
  group.position.copy(elWorldRect(START_ID, camera).position)
  scene.add(group)

  const uniforms = {
    startRect: { value: rectToVec4(elLocalRect(START_ID, group, camera)) },
    endRect: { value: rectToVec4(elLocalRect(END_ID, group, camera)) },
    animateProgress: { value: 0 },
    uVelocity: { value: 0 },
    borderRadius: { value: opts.borderRadius ?? 0.085 },
    tintColour: { value: new THREE.Color(opts.tint ?? 0x9a9aff) },
    map: { value: texture },
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 32, 32), material)
  mesh.frustumCulled = false
  group.add(mesh)

  // scroll thresholds (absolute document scrollY where each anchor hits a chosen
  // viewport line). startBias controls WHERE the start anchor is when the grow
  // begins: 0.5 = screen centre (lusion default), higher = lower on screen, so
  // the video grows in place instead of first drifting up to the centre.
  const startBias = opts.startBias ?? 0.5
  const endBias = opts.endBias ?? 0.5
  const holdVh = opts.holdVh ?? 0.2 // how long the video stays centred, in viewports
  let scrollStart = 0
  let scrollEnd = 0
  let scrollFollowEnd = 0
  function calcThresholds() {
    const ih = window.innerHeight
    scrollStart = elPageCoords(START_ID).y + window.scrollY - ih * startBias
    scrollEnd = elPageCoords(END_ID).y + window.scrollY - ih * endBias
    // Hold the centred video for a SHORT, fixed distance — decoupled from the
    // end-parent height (was 0.7×end-parent ≈ 441px, which felt like "3 scrolls
    // stuck in the middle"). Shrinking the hold no longer shrinks the video.
    scrollFollowEnd = scrollEnd + holdVh * ih
  }
  calcThresholds()

  let disposed = false

  function onScroll() {
    if (disposed) return
    camera.position.y = (-window.scrollY / window.innerHeight) * FRUSTUM

    let p = THREE.MathUtils.inverseLerp(scrollStart, scrollEnd, window.scrollY)
    uniforms.animateProgress.value = THREE.MathUtils.clamp(p, 0, 1)

    // after reaching the end, let the (now full) panel scroll away with the page
    const distWorld = pxToWorld(scrollFollowEnd - scrollEnd, camera)
    let follow = THREE.MathUtils.inverseLerp(scrollEnd, scrollFollowEnd, window.scrollY)
    follow = THREE.MathUtils.clamp(follow, 0, 1)
    mesh.position.y = -follow * distWorld

    // During the follow phase the plane is held CENTRED (the translate above
    // exactly cancels the camera scroll), but an HTML overlay would scroll away
    // normally and drift off the video. holdPx is how many px the plane is held
    // back by — the overlay must translateY(+holdPx) to stay locked to it.
    const holdPx = follow * (scrollFollowEnd - scrollEnd)
    opts.onProgress?.(uniforms.animateProgress.value, follow, holdPx)
  }

  // Measurement-only recalc of the anchor world rects + scroll thresholds. Never
  // touches the renderer size or the DOM, so it can't feed back into the observer.
  // Skips when anchors are hidden (mobile) or missing.
  function remeasure() {
    if (disposed) return
    const startEl = document.getElementById(START_ID)
    if (!startEl || startEl.offsetWidth === 0) return
    group.position.copy(elWorldRect(START_ID, camera).position)
    uniforms.startRect.value = rectToVec4(elLocalRect(START_ID, group, camera))
    uniforms.endRect.value = rectToVec4(elLocalRect(END_ID, group, camera))
    calcThresholds()
    onScroll()
  }

  function onResize() {
    if (disposed) return
    renderer.setSize(window.innerWidth, window.innerHeight)
    updateCameraIntrinsics(camera, FRUSTUM)
    remeasure()
  }

  let roPending = false
  function scheduleRemeasure() {
    if (roPending || disposed) return
    roPending = true
    requestAnimationFrame(() => { roPending = false; remeasure() })
  }

  // Smoothed scroll velocity → uVelocity, decayed every frame so the bow eases
  // back to flat when the page is idle (lerp(vel, raw, 0.1), clamp ±120).
  let velTarget = 0
  let velSmooth = 0

  onScroll()
  const renderLoop = () => {
    velTarget *= 0.9
    velSmooth += (velTarget - velSmooth) * 0.1
    uniforms.uVelocity.value = velSmooth
    renderer.render(scene, camera)
  }
  let looping = false
  const startLoop = () => { if (!looping && !disposed) { looping = true; renderer.setAnimationLoop(renderLoop) } }
  const stopLoop = () => { if (looping) { looping = false; renderer.setAnimationLoop(null) } }
  // Start PAUSED. The IntersectionObserver below starts the loop only while the
  // panel is on-screen — so the hero (Ballpit) and this plane never render at once,
  // and the loop no longer runs for the whole page lifetime (audit fix).
  const visObserver = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) { startLoop(); video.play().catch(() => {}) }
      else { stopLoop(); video.pause() }
    },
    { rootMargin: '140px' },
  )
  const visTarget = document.getElementById('video-panel-section')
  if (visTarget) visObserver.observe(visTarget)

  // Route scroll through ScrollTrigger's single rAF (no extra window 'scroll'
  // listener). onScroll keeps the morph/overlay math identical; getVelocity only
  // feeds the new plane bow.
  const st = ScrollTrigger.create({
    onUpdate: (self) => {
      onScroll()
      velTarget = THREE.MathUtils.clamp(self.getVelocity() / 40, -120, 120)
    },
  })
  window.addEventListener('resize', onResize)

  // Robust positioning: re-measure whenever layout ACTUALLY reflows (font swap,
  // image load, dynamic content, text re-wrap) instead of at guessed timeouts —
  // this is the real "video por los cielos" fix. Observing the section catches its
  // own height change; observing body catches reflow ABOVE it (which moves the
  // section's top without changing its size).
  const ro = new ResizeObserver(scheduleRemeasure)
  const sectionEl = document.getElementById('video-panel-section')
  if (sectionEl) ro.observe(sectionEl)
  ro.observe(document.body)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleRemeasure)

  return () => {
    disposed = true
    ro.disconnect()
    visObserver.disconnect()
    st.kill()
    renderer.setAnimationLoop(null)
    window.removeEventListener('resize', onResize)
    video.pause()
    if (clips.length > 1) video.removeEventListener('ended', nextClip)
    video.removeAttribute('src')
    video.load()
    mesh.geometry.dispose()
    material.dispose()
    texture.dispose()
    renderer.dispose()
  }
}
