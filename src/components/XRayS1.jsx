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

const SPINE = ['S1', 'S2', 'S3', 'S4', 'S5']
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
    <section ref={section} id="xray-s1" className="relative px-[5vw] pt-[16vh] pb-[26vh] font-grotesk">
      <div className="relative mx-auto flex max-w-[1180px] gap-7">
        {/* Section spine (graft 3 ← Two Hands): sticky mono wayfinding + non-color cue. */}
        <aside aria-hidden className="hidden w-8 shrink-0 lg:block">
          <div className="sticky top-[46vh] flex flex-col gap-2.5 font-mono text-[11px] tracking-[0.22em]">
            {SPINE.map((s, i) => (
              <span key={s} className={i === 0 ? 'font-bold text-ink' : 'text-muted/50'}>{s}</span>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-6">01 · Surface ⇄ Structure</p>
          <h2 className="s1-head" style={{ fontFamily: 'var(--font-forum)' }}>
            <MaskLine shown={shown}>Every surface</MaskLine>
            <MaskLine shown={shown} delay="0.09s">is also a structure.</MaskLine>
          </h2>
          <p
            className="mt-7 max-w-[48ch] text-[1.06rem] leading-relaxed text-ink-2"
            style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(14px)', transition: 'opacity .7s ease .2s, transform .7s ease .2s' }}
          >
            What you see on the canvas and what it is underneath — the selected element,
            its identity, its file — are one object. Scroll to x-ray it.
          </p>

          {/* The stage: a real capture, peeled to its structure by the cobalt scanline. */}
          <div ref={frame} className="s1-frame mt-12">
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

          <p className="mt-5 font-mono text-[11px] tracking-[0.14em] text-ink-2">
            REAL CAPTURE · codecanvas-demo — the &lt;h1&gt; "Ship your ideas faster" selected on the live canvas
          </p>

          {/* Start of the transition into S2 (not S2 itself): the structure we just
              exposed flows toward the code view. Text stays readable (not aria-hidden). */}
          <div className="s1-tonext">
            <span className="s1-tonext-rule" aria-hidden />
            <p className="eyebrow !text-[#2f3df5]">Next · S2</p>
            <p className="mt-2 text-[clamp(1.7rem,3.4vw,2.9rem)] tracking-tight text-ink" style={{ fontFamily: 'var(--font-forum)' }}>
              Two views. One file.
            </p>
            <p className="mt-2 font-mono text-[11px] tracking-[0.14em] text-ink-2">
              the same &lt;h1&gt; — on the canvas and in index.html
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
