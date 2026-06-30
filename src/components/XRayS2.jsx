// X-Ray · S2 — "Two views. One file."
// Honest framing (condition #2): 06-code-panel does NOT show the <h1> markup, so we
// never claim it. We show two REAL captures side by side — the <h1> selected on the
// live canvas (07) ‖ index.html open in the editor (06) — and a cobalt connector that
// links the selected element to the real, visible .hero rule (line 35) that lays it out.
// The claim is only "same file", which the captures + the agent-context project path prove.
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

export default function XRayS2() {
  const section = useRef(null)
  const dip = useRef(null)
  const svg = useRef(null)
  const pathRef = useRef(null)
  const nodeCanvas = useRef(null) // ring sitting on the selected <h1> (canvas pane)
  const nodeCode = useRef(null)   // ring sitting on the .hero { token (code pane)
  const [shown, setShown] = useState(false)

  useLayoutEffect(() => {
    const el = section.current
    if (!el || !dip.current) return
    const setv = (k, v) => el.style.setProperty(k, v)

    // The connector endpoints are READ from the live ring-node rects — never hardcoded
    // viewBox coords. The rings are positioned (in CSS, per breakpoint) on the actual
    // tokens, so the line always lands where they render and survives any crop/resize.
    // Recomputed on every scrub tick AND via ResizeObserver. viewBox is set in px so
    // 1 user-unit == 1px; non-scaling-stroke keeps the hairline true.
    const drawConnector = () => {
      const d = dip.current, a = nodeCanvas.current, b = nodeCode.current
      const p = pathRef.current, s = svg.current
      if (!d || !a || !b || !p || !s) return
      const dr = d.getBoundingClientRect()
      if (!dr.width || !dr.height) return
      s.setAttribute('viewBox', `0 0 ${dr.width.toFixed(1)} ${dr.height.toFixed(1)}`)
      const ar = a.getBoundingClientRect(), br = b.getBoundingClientRect()
      const ax = ar.left + ar.width / 2 - dr.left, ay = ar.top + ar.height / 2 - dr.top
      const bx = br.left + br.width / 2 - dr.left, by = br.top + br.height / 2 - dr.top
      const mx = dr.width * 0.5 // single elbow on the seam — reads as inspector bracket
      p.setAttribute(
        'd',
        `M ${ax.toFixed(1)} ${ay.toFixed(1)} L ${mx.toFixed(1)} ${((ay + by) / 2).toFixed(1)} L ${bx.toFixed(1)} ${by.toFixed(1)}`,
      )
    }

    // Mobile (+ reduced-motion): static full state, no pin/scrub — a legible vertical
    // sequence rather than a "stuck" pinned transformation.
    const mobile = window.matchMedia('(max-width: 767px)').matches
    if (reduced() || mobile) {
      setv('--open', '1'); setv('--draw', '1'); setv('--s3', '1'); setShown(true)
      // Mobile hides the connector (CSS); reduced-motion desktop still needs it drawn
      // once (statically) so the rings aren't left floating without a line.
      if (mobile) return
      const ro = new ResizeObserver(drawConnector)
      ro.observe(dip.current)
      requestAnimationFrame(drawConnector)
      return () => ro.disconnect()
    }

    const ro = new ResizeObserver(drawConnector)
    ro.observe(dip.current)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: el, start: 'top 72%', onEnter: () => setShown(true) })
      // SHORT pin: hold the diptych centred while the seam opens, the file reveals
      // beside the canvas, and the connector lands on .hero — then release. Wheel 1:1.
      const st = ScrollTrigger.create({
        trigger: dip.current, start: 'center center', end: '+=90%',
        pin: true, pinSpacing: true, scrub: true, anticipatePin: 1,
        onUpdate: (s) => {
          const p = s.progress
          setv('--open', clamp01(p / 0.42).toFixed(3))
          setv('--draw', clamp01((p - 0.46) / 0.4).toFixed(3))
          setv('--s3', clamp01((p - 0.92) / 0.08).toFixed(3))
          drawConnector() // endpoints track the canvas pane as it retracts
        },
      })
      requestAnimationFrame(drawConnector)
      return () => st.kill()
    }, el)
    return () => { ro.disconnect(); ctx.revert() }
  }, [])

  return (
    <section ref={section} id="xray-s2" className="relative px-[5vw] pt-[20vh] pb-[26vh] font-grotesk">
      <div className="relative mx-auto flex max-w-[1180px] gap-7">
        <aside aria-hidden className="hidden w-8 shrink-0 lg:block">
          <div className="sticky top-[46vh] flex flex-col gap-2.5 font-mono text-[11px] tracking-[0.22em]">
            {SPINE.map((s, i) => (
              <span key={s} className={i === 1 ? 'font-bold text-ink' : 'text-muted/50'}>{s}</span>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-6">02 · Surface ⇄ Structure</p>
          <h2 className="s1-head" style={{ fontFamily: 'var(--font-forum)' }}>
            <MaskLine shown={shown}>Two views.</MaskLine>
            <MaskLine shown={shown} delay="0.09s">One file.</MaskLine>
          </h2>
          <p
            className="mt-7 max-w-[48ch] text-[1.06rem] leading-relaxed text-ink-2"
            style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(14px)', transition: 'opacity .7s ease .2s, transform .7s ease .2s' }}
          >
            The <code className="font-mono text-[.95em] text-ink">&lt;h1&gt;</code> you select on the canvas is
            rendered from the same <code className="font-mono text-[.95em] text-ink">index.html</code> open beside
            it — one source, two ways to see it.
          </p>

          <div ref={dip} className="s2-diptych mt-12">
            <div className="s2-pane s2-canvas">
              <img src="/media/07-ai-chat-element-context.png" alt="The <h1> selected on the CodeCanvas live canvas" className="s2-img" loading="lazy" decoding="async" />
              <span className="s2-tag s2-tag-l">CANVAS · design</span>
              <span ref={nodeCanvas} className="s2-node s2-node-canvas" aria-hidden />
            </div>
            <div className="s2-pane s2-code">
              <img src="/media/06-code-panel.png" alt="index.html open in the CodeCanvas editor" className="s2-img" loading="lazy" decoding="async" />
              <span className="s2-tag s2-tag-r">CODE · index.html · L35</span>
              <span ref={nodeCode} className="s2-node s2-node-code" aria-hidden />
            </div>
            <div className="s2-seam" aria-hidden />
            {/* viewBox is set in px by drawConnector(); preserveAspectRatio none = 1:1 */}
            <svg ref={svg} className="s2-connector" preserveAspectRatio="none" aria-hidden>
              <path ref={pathRef} pathLength="1" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          <p className="mt-5 font-mono text-[11px] tracking-[0.14em] text-ink-2">
            REAL CAPTURES · codecanvas-demo — the &lt;h1&gt; selected on the canvas, and index.html (line 35) open with the .hero rule that lays it out
          </p>

          <div className="s1-tonext" style={{ opacity: 'var(--s3)', transform: 'translateY(calc((1 - var(--s3)) * 26px))' }}>
            <span className="s1-tonext-rule" aria-hidden />
            <p className="eyebrow !text-[#2f3df5]">Next · S3</p>
            <p className="mt-2 text-[clamp(1.7rem,3.4vw,2.9rem)] tracking-tight text-ink" style={{ fontFamily: 'var(--font-forum)' }}>
              Hand it to the agent.
            </p>
            <p className="mt-2 font-mono text-[11px] tracking-[0.14em] text-ink-2">
              with its real context — tag, styles, project
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
