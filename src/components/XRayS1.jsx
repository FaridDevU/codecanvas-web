// X-Ray · S1 — "Every surface is also a structure."
// The signature grammar of the whole below-video experience: a real CodeCanvas
// capture (03-canvas-app-open) is x-rayed by a cobalt scanline that reveals the
// SAME object's structure underneath — the selected <h1>, its identity, its file —
// and (scrolling up) returns to surface. Pure CSS/SVG/scroll; NO WebGL, NO change
// to the kept hero/video. Honest: the overlay traces the product's real inspector
// vocabulary and uses only real values (the <h1> #odid… in index.html, codecanvas-demo).
import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MaskLine from './MaskLine'

gsap.registerPlugin(ScrollTrigger)

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp01 = (n) => Math.max(0, Math.min(1, n))

export default function XRayS1() {
  const section = useRef(null)
  const frame = useRef(null)
  const [shown, setShown] = useState(false)

  useLayoutEffect(() => {
    const el = section.current
    const fr = frame.current
    if (!el || !fr) return
    const setv = (k, v) => el.style.setProperty(k, v) // vars inherit to descendants

    // Reduced-motion: present a static split — structure held visibly revealed
    // alongside the surface, the answer readable without any motion.
    if (reduced()) {
      // Full static reveal — structure shown, selection on, teaser visible (no motion).
      setv('--rev', '1'); setv('--sel', '1'); setv('--s2', '1')
      setShown(true)
      return
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: el, start: 'top 72%', onEnter: () => setShown(true) })

      // Scrub-mapped, NO pin, wheel 1:1, reverses cleanly. rev ramps surface→structure
      // and HOLDS (so the structure flows into the S2 teaser); scrolling up reverses it
      // back to surface — the oscillation, experienced interactively.
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          // Reveal spans most of the scroll; selection lands just behind the scanline;
          // S2 teaser begins the instant the reveal completes (no frozen dead window).
          const p = self.progress
          setv('--rev', clamp01(p / 0.55).toFixed(3))
          setv('--sel', clamp01((p - 0.30) / 0.18).toFixed(3))
          setv('--s2', clamp01((p - 0.60) / 0.34).toFixed(3))
        },
      })
      return () => st.kill()
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={section} id="xray-s1" className="relative pt-[clamp(2.5rem,7vh,5rem)] pb-[clamp(3rem,8vh,6rem)] font-grotesk">
          <div className="s-head">
            <p className="eyebrow xray-eyebrow s-eyebrow">01 · Inspect the surface</p>
            <div className="s-headrow">
              <h2 className="s1-head" style={{ fontFamily: 'var(--font-forum)' }}>
                <MaskLine shown={shown}>Every surface</MaskLine>
                <MaskLine shown={shown} delay="0.09s">is also a structure.</MaskLine>
              </h2>
              <p
                className="s-lead"
                style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(14px)', transition: 'opacity .7s ease .2s, transform .7s ease .2s' }}
              >
                What you see on the canvas and what it is underneath — the selected element,
                its identity, its file — are one object. Scroll to x-ray it.
              </p>
            </div>
          </div>

          {/* The stage: a real capture, peeled to its structure by the cobalt scanline. */}
          <div ref={frame} className="s1-frame mt-8 md:mt-14">
            <img
              src="/media/03-canvas-app-open.png"
              alt="CodeCanvas editing the codecanvas-demo project on the live canvas"
              className="s1-surface"
              loading="lazy"
              decoding="async"
            />
            <div className="s1-structure" aria-hidden>
              <img src="/media/03-canvas-app-open.png" alt="" className="s1-structure-img" loading="lazy" decoding="async" />
              <div className="s1-tint" />
              <div className="s1-box">
                <span className="s1-corner tl" /><span className="s1-corner tr" />
                <span className="s1-corner bl" /><span className="s1-corner br" />
                <span className="s1-label">&lt;h1&gt; <span className="s1-label-id">#odid-9kJj4Z6DGhql1WQbINSGk</span> · index.html</span>
              </div>
            </div>
            <div className="s1-scan" aria-hidden />
            {/* Start-of-S2 hint: a code-view edge + index.html tab slide in at the end. */}
            <div className="s1-s2hint" aria-hidden><span className="s1-s2tab">index.html</span></div>
          </div>

          <p className="s-cap mt-5">LIVE CANVAS · selected &lt;h1&gt;</p>
    </section>
  )
}
