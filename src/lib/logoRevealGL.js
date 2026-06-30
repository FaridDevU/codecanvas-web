// X-Ray · S5 — the brand resolve. The CodeCanvas mark rendered live in WebGL:
// an empty cobalt BLUEPRINT (structure) fills with satin metal from the bottom up
// (surface), then the blueprint fades — closing the "surface ⇄ structure" arc on the
// brand itself. Assets:
//   - public/models/logo-hero.glb  : the FULL 196k-tri mesh (49k logo-opt.glb rejected
//                                    for bevel fanning — see handoff). The solid metal.
//   - public/models/logo-edges.glb : a CLEAN front-face boundary outline baked offline
//                                    (EdgesGeometry is useless on the rolled bevels; see
//                                    scratchpad/mt/edges.html). The blueprint.
// The camera is FIXED during the reveal (the protagonist is the material change, not a moving
// crop); once the reveal completes, the settled mark gently ROCKS (±~28°), shadow-lit, to show its
// 3D depth. Material/camera/light/shadow validated in scratchpad/mt/; poster.html mirrors them.
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const COBALT = 0x3a5bff
const smoothstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
// Settled look (mirrored in scratchpad/mt/poster.html, which re-bakes logo-poster.png from
// these EXACT values → the WebGL settled and the poster fallback are identical by construction).
const DIR = new THREE.Vector3(0.5, 0.16, 3.0).normalize()   // fixed 3/4 view direction
const FIT = 0.96                                            // < 1 leaves uniform margin around the mark
const MAT = { roughness: 0.40, normalScale: 0.5, envMapIntensity: 1.1 }   // glossier satin = more tonal range

// Mounts the reveal on `canvas`. Returns an API immediately; the assets load async and
// onReady() fires once both are ready. setReveal(0..1) drives the fill.
export function mountLogoRevealGL(canvas, { src, edgesSrc, onReady } = {}) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch (e) {
    console.warn('logoRevealGL: WebGL unavailable, using poster.', e)
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95          // tamed so the glossier metal never blows out
  renderer.localClippingEnabled = true
  renderer.shadowMap.enabled = true            // self-shadows between the overlapping flaps = depth
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const roomEnv = new RoomEnvironment()
  const envRT = pmrem.fromScene(roomEnv, 0.04)   // 0.04 ≈ what 0.45 clamps to (no warning)
  scene.environment = envRT.texture
  scene.environmentIntensity = 1.28          // brighter reflections keep the metal alive at every spin angle

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  // Light rig (fixed in world space → as the mark turns, the light/reflections sweep across it). Two
  // keys at opposite azimuths + fill so NO rotation angle goes near-black, plus a controlled cobalt
  // back-rim for edge id. The front (right) key casts the self-shadows between the overlapping flaps.
  const key = new THREE.DirectionalLight(0xffffff, 0.95); key.position.set(2.6, 3.2, 4); scene.add(key)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 1; key.shadow.camera.far = 14
  key.shadow.camera.left = -1.7; key.shadow.camera.right = 1.7
  key.shadow.camera.top = 1.7; key.shadow.camera.bottom = -1.7
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 5
  const kick = new THREE.DirectionalLight(0xffffff, 0.5); kick.position.set(-3, 2, -2.2); scene.add(kick)  // opposite azimuth
  const fill = new THREE.DirectionalLight(0xeaf0ff, 0.3); fill.position.set(-2, -0.6, 2.5); scene.add(fill)
  const rim = new THREE.DirectionalLight(COBALT, 0.6); rim.position.set(-3, 1.2, -2.6); scene.add(rim)

  // The SOLID metal is clipped to show only BELOW the sweep line (kept where y < constant).
  // Raising constant fills the mark with surface from the bottom up, into the blueprint.
  const clipSolid = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1)
  const group = new THREE.Group()
  scene.add(group)

  let minY = -0.95, maxY = 0.95, sphere = null
  let disposed = false
  let solidMat, wireMat, geom, edgeGeom, catcher
  let curReveal = 0

  function fitCamera() {
    if (!sphere) { camera.position.copy(DIR).multiplyScalar(4.9); camera.lookAt(0, 0, 0); return }
    const fovV = camera.fov * Math.PI / 180
    const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect)
    const d = Math.max(sphere.radius / Math.sin(fovV / 2), sphere.radius / Math.sin(fovH / 2)) / FIT
    camera.position.copy(DIR).multiplyScalar(d)
    camera.lookAt(0, 0, 0)
  }
  function sizeToCanvas() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    fitCamera()
  }

  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  ;(async () => {
    try {
      const [gltfSolid, gltfEdges] = await Promise.all([loader.loadAsync(src), loader.loadAsync(edgesSrc)])
      if (disposed) return
      let mesh; gltfSolid.scene.traverse((n) => { if (n.isMesh && !mesh) mesh = n })
      if (!mesh) return
      const root = gltfSolid.scene
      geom = mesh.geometry

      // Surface: satin metal. roughnessMap=null + a measured satin roughness (the validated
      // fan-free look), normalScale eased so the brushed micro-detail reads as sheen, not noise.
      solidMat = mesh.material
      solidMat.roughnessMap = null
      solidMat.roughness = MAT.roughness
      solidMat.metalness = 1.0
      solidMat.envMapIntensity = MAT.envMapIntensity
      if (solidMat.normalScale) solidMat.normalScale.set(MAT.normalScale, MAT.normalScale)
      solidMat.side = THREE.DoubleSide
      solidMat.clippingPlanes = [clipSolid]
      solidMat.clipShadows = true               // the cast shadow tracks the clipped (filled) solid
      solidMat.needsUpdate = true
      mesh.castShadow = true
      mesh.receiveShadow = true

      // Structure: the pre-baked clean outline (LineSegments), NOT clipped — present from the
      // start; the metal rises into it, then it fades, leaving the clean mark.
      let edgeObj; gltfEdges.scene.traverse((n) => { if (n.isLineSegments && !edgeObj) edgeObj = n })
      edgeGeom = edgeObj ? edgeObj.geometry : new THREE.BufferGeometry()
      wireMat = new THREE.LineBasicMaterial({ color: COBALT, transparent: true, opacity: 0.92, depthWrite: false })
      const wire = new THREE.LineSegments(edgeGeom, wireMat)

      // Recenter BOTH by the SOLID's bbox center so the outline registers on the metal.
      const box = new THREE.Box3().setFromObject(root)
      const center = box.getCenter(new THREE.Vector3())
      root.position.sub(center)
      wire.position.sub(center)
      minY = box.min.y - center.y
      maxY = box.max.y - center.y
      sphere = box.getBoundingSphere(new THREE.Sphere()); sphere.center.set(0, 0, 0)

      // Soft grounding shadow on a STATIC catcher plane just behind the mark (ShadowMaterial only
      // paints the shadow → on the transparent canvas it darkens the paper, a subtle lift). Kept
      // CLOSE behind so the shadow hugs the mark (a tight contact shadow, not a detached blob).
      catcher = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.ShadowMaterial({ opacity: 0.1 }))
      catcher.position.z = (box.min.z - center.z) - 0.14
      catcher.receiveShadow = true
      scene.add(catcher)

      group.add(root, wire)
      setReveal(0)
      sizeToCanvas()
      onReady?.()
    } catch (err) {
      console.warn('logoRevealGL: asset load failed, using poster.', err)
    }
  })()

  // reveal 0 = empty cobalt blueprint (structure); 1 = clean satin metal (surface).
  function setReveal(p) {
    p = Math.max(0, Math.min(1, p))
    curReveal = p
    clipSolid.constant = minY - 0.05 + (maxY - minY + 0.1) * p     // metal shown where y < this
    if (wireMat) wireMat.opacity = 0.92 * (1 - smoothstep(0.72, 1.0, p))
  }

  // Render only while the canvas is on screen. Once the reveal is COMPLETE, the settled mark gently
  // ROCKS (±~28°) — enough to show its 3D depth (bevels, reflections sweeping, self-shadows shifting)
  // while staying readable and well-lit. (A full 360° on this concave flat mark hits an edge-on sliver
  // and a near-black concave back — for a continuous spin, swap to `phase += …; rotation.y = phase`.)
  // During the reveal it stays front-on (the material change is the protagonist); the `* g` gate eases
  // the mark back to the front pose when scrolled back up to re-watch.
  const OSC_SPEED = 0.55, OSC_AMP = 0.5
  let looping = false, phase = 0, lastT = 0
  const render = (now) => {
    const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0
    lastT = now
    const g = smoothstep(0.965, 1.0, curReveal)
    phase += dt * OSC_SPEED * g
    group.rotation.y = Math.sin(phase) * OSC_AMP * g
    renderer.render(scene, camera)
  }
  const start = () => { if (!looping && !disposed) { looping = true; renderer.setAnimationLoop(render) } }
  const stop = () => { if (looping) { looping = false; renderer.setAnimationLoop(null) } }
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '120px' })
  io.observe(canvas)

  let roPending = false
  const ro = new ResizeObserver(() => {
    if (roPending || disposed) return
    roPending = true
    requestAnimationFrame(() => { roPending = false; if (!disposed) sizeToCanvas() })
  })
  ro.observe(canvas)

  return {
    setReveal,
    dispose() {
      disposed = true
      io.disconnect(); ro.disconnect()
      renderer.setAnimationLoop(null)
      geom?.dispose(); edgeGeom?.dispose()
      catcher?.geometry.dispose(); catcher?.material.dispose()
      solidMat?.dispose(); wireMat?.dispose()
      envRT?.dispose(); pmrem.dispose(); roomEnv.dispose?.()
      renderer.dispose(); renderer.forceContextLoss()
    },
  }
}
