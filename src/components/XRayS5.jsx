// X-Ray · S5 — "Surface and structure. One object." The closing brand moment:
// the CodeCanvas mark, rendered live in WebGL, builds from a cobalt wireframe
// (structure) into solid satin metal (surface) as you scroll — bookending S1's
// "Every surface is also a structure." HONEST: no fabricated repo/CTA links (no
// real URL exists yet — see handoff constraint), so S5 is a statement, not a sales
// CTA. Asset = the FULL-mesh logo-hero.glb (the simplified logo-opt.glb was
// rejected for bevel fanning). Fallback (reduced-motion / mobile / no-WebGL /
// low-core) = logo-poster.png, which IS the settled end state of the reveal.
import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MaskLine from './MaskLine'
import { mountLogoRevealGL } from '../lib/logoRevealGL'

gsap.registerPlugin(ScrollTrigger)
const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const hasWebGL = () => {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch { return false }
}

export default function XRayS5() {
  const section = useRef(null)
  const stage = useRef(null)
  const canvas = useRef(null)
  const [shown, setShown] = useState(false)
  const [glReady, setGlReady] = useState(false)

  useLayoutEffect(() => {
    const el = section.current
    if (!el || !stage.current || !canvas.current) return
    const setv = (k, v) => el.style.setProperty(k, v)

    // Full static payoff (poster only, no motion): reduced-motion, no WebGL, or low-core.
    const fine = window.matchMedia('(min-width: 768px) and (pointer: fine)').matches
    const lowCore = (navigator.hardwareConcurrency || 8) < 4
    if (reduced() || !hasWebGL() || lowCore) {
      stage.current.dataset.static = '1'
      setv('--rev', '1')
      setShown(true)
      return
    }
    // Mobile / touch: NO heavy WebGL. A light, reversible 2D choreography on the poster —
    // a cobalt "structure" wash + scan band resolving to the metallic surface as --rev
    // advances (the S1 scanline grammar, lite). No 360° model, no model download.
    if (!fine) {
      stage.current.dataset.mobile = '1'
      const ctx = gsap.context(() => {
        ScrollTrigger.create({ trigger: el, start: 'top 80%', onEnter: () => setShown(true) })
        const st = ScrollTrigger.create({
          trigger: stage.current, start: 'top 85%', end: 'top 35%', scrub: true,
          onUpdate: (s) => setv('--rev', s.progress.toFixed(3)),
        })
        return () => st.kill()
      }, el)
      return () => ctx.revert()
    }

    const gl = mountLogoRevealGL(canvas.current, {
      src: '/models/logo-hero.glb',
      edgesSrc: '/models/logo-edges.glb',
      onReady: () => setGlReady(true),
    })
    if (!gl) { stage.current.dataset.static = '1'; setv('--rev', '1'); setShown(true); return }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: el, start: 'top 72%', onEnter: () => setShown(true) })
      // Short pin, wheel 1:1, fully reversible: reveal is a pure function of progress.
      const st = ScrollTrigger.create({
        trigger: stage.current, start: 'center center', end: '+=140%',
        pin: true, pinSpacing: true, scrub: true, anticipatePin: 1,
        onUpdate: (s) => { gl.setReveal(s.progress); setv('--rev', s.progress.toFixed(4)) },
      })
      return () => st.kill()
    }, el)

    return () => { ctx.revert(); gl.dispose() }
  }, [])

  return (
    <section ref={section} id="xray-s5" className="relative pt-[clamp(1.5rem,4vh,3rem)] pb-[clamp(3rem,8vh,6rem)] font-grotesk">
          <div className="s-head">
            <p className="eyebrow xray-eyebrow s-eyebrow">05 · The whole object</p>
            <div className="s-headrow">
              <h2 className="s1-head" style={{ fontFamily: 'var(--font-forum)' }}>
                <MaskLine shown={shown}>Surface and structure.</MaskLine>
                <MaskLine shown={shown} delay="0.09s">One object.</MaskLine>
              </h2>
              <p
                className="s-lead"
                style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(14px)', transition: 'opacity .7s ease .2s, transform .7s ease .2s' }}
              >
                Across the whole scroll you watched one thing seen two ways — the canvas and the
                code, the preview and the file, the screenshot and the element beneath it. That's the
                idea <span className="font-medium text-ink">CodeCanvas</span> is built on: surface and
                structure aren't two files to keep in sync. They're the same object, looked at from
                two sides.
              </p>
            </div>
          </div>

          <div ref={stage} className="s5-stage mt-8 md:mt-14">
            {/* Poster = the settled end state of the reveal → the static fallback shows the payoff.
                Baked from the dense original mesh, so it's flawless. */}
            <img src="/models/logo-poster.png" alt="The CodeCanvas mark" className="s5-poster" decoding="async"
              style={{ opacity: glReady ? 0 : 1 }} />
            <canvas ref={canvas} className="s5-canvas" style={{ opacity: glReady ? 1 : 0 }} aria-hidden />
            {/* cobalt scan glow tracking the reveal height — the S1 scanline grammar, in 3D */}
            <span className="s5-scan" aria-hidden />
            <span className="s5-tag" aria-hidden style={{ opacity: glReady ? 1 : 0 }}>WebGL · rendered live</span>
          </div>

          <p className="s-cap mt-5">{glReady ? 'LIVE WEBGL · full-resolution mark' : 'THE MARK · full-resolution still'}</p>
    </section>
  )
}
