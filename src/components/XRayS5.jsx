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
const SPINE = ['S1', 'S2', 'S3', 'S4', 'S5']
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

    // Fallback path: poster is the payoff, so static clients still see the resolved
    // mark. No GL on mobile / coarse pointer / reduced-motion / no-WebGL / low-core.
    const desktop = window.matchMedia('(min-width: 768px) and (pointer: fine)').matches
    const lowCore = (navigator.hardwareConcurrency || 8) < 4
    if (reduced() || !desktop || lowCore || !hasWebGL()) {
      stage.current.dataset.static = '1'
      setv('--rev', '1')
      setShown(true)
      return
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
    <section ref={section} id="xray-s5" className="relative px-[5vw] pt-[20vh] pb-[20vh] font-grotesk">
      <div className="relative mx-auto flex max-w-[1180px] gap-7">
        <aside aria-hidden className="hidden w-8 shrink-0 lg:block">
          <div className="sticky top-[46vh] flex flex-col gap-2.5 font-mono text-[11px] tracking-[0.22em]">
            {SPINE.map((s, i) => (
              <span key={s} className={i === 4 ? 'font-bold text-ink' : 'text-muted/50'}>{s}</span>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-6">05 · Surface ⇄ Structure</p>
          <h2 className="s1-head" style={{ fontFamily: 'var(--font-forum)' }}>
            <MaskLine shown={shown}>Surface and structure.</MaskLine>
            <MaskLine shown={shown} delay="0.09s">One object.</MaskLine>
          </h2>
          <p
            className="mt-7 max-w-[54ch] text-[1.06rem] leading-relaxed text-ink-2"
            style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(14px)', transition: 'opacity .7s ease .2s, transform .7s ease .2s' }}
          >
            Across the whole scroll you watched one thing seen two ways — the canvas and the
            code, the preview and the file, the screenshot and the element beneath it. That's the
            idea <span className="font-medium text-ink">CodeCanvas</span> is built on: surface and
            structure aren't two files to keep in sync. They're the same object, looked at from
            two sides.
          </p>

          <div ref={stage} className="s5-stage mt-12">
            {/* Poster = the settled end state of the reveal → the static fallback shows the payoff.
                Baked from the dense original mesh, so it's flawless. */}
            <img src="/models/logo-poster.png" alt="The CodeCanvas mark" className="s5-poster" decoding="async"
              style={{ opacity: glReady ? 0 : 1 }} />
            <canvas ref={canvas} className="s5-canvas" style={{ opacity: glReady ? 1 : 0 }} aria-hidden />
            {/* cobalt scan glow tracking the reveal height — the S1 scanline grammar, in 3D */}
            <span className="s5-scan" aria-hidden />
            <span className="s5-tag" aria-hidden style={{ opacity: glReady ? 1 : 0 }}>WebGL · rendered live</span>
          </div>

          <p className="mt-5 font-mono text-[11px] tracking-[0.14em] text-ink-2">
            THE CODECANVAS MARK · the full mesh drawn live in your browser — structure (cobalt wireframe)
            resolving to surface (satin metal). Reduced-motion and no-WebGL clients get the baked still.
          </p>
        </div>
      </div>
    </section>
  )
}
