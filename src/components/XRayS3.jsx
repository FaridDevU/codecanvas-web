// X-Ray · S3 — "Hand it to the agent."
// Honesty (revised): the ONLY continuous clip (03-send-to-ai.gif) records a DIFFERENT
// element (#odid-x4Diepq1T-tmmeIKixXDF), so it can't prove the Ask-Copilot→Claude flow for
// THIS protagonist (#odid-9kJj4Z6DGhql1WQbINSGk). We therefore make NO causal claim and draw
// NO connector between the panes. We show two real, independent captures of the SAME element:
//   left  — 07a: a selected element's context menu, where "Ask Copilot" is one action.
//   right — 06 (cropped to just the Claude panel): the CodeCanvas AI panel where Claude holds
//           this <h1>'s real design context (tag+id, inline styles, project) and its reply.
// The copy states these as two facts, never as a wired sequence. --reply pans the real panel
// crop down to reveal Claude's actual reply (intro + bullets) — real pixels, no DOM rebuild.
import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MaskLine from './MaskLine'

gsap.registerPlugin(ScrollTrigger)
const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp01 = (n) => Math.max(0, Math.min(1, n))

export default function XRayS3() {
  const section = useRef(null)
  const stage = useRef(null)
  const [shown, setShown] = useState(false)

  useLayoutEffect(() => {
    const el = section.current
    if (!el || !stage.current) return
    const setv = (k, v) => el.style.setProperty(k, v)

    // "mobile" = not a fine-pointer desktop (narrow OR coarse/touch, incl. ≥768 tablets):
    // pins require pointer:fine, coarse gets the non-pinned choreography.
    const mobile = !window.matchMedia('(min-width: 768px) and (pointer: fine)').matches
    if (reduced()) {
      setv('--menu', '1'); setv('--ctx', '1'); setv('--reply', '0'); setv('--m', '1'); setShown(true)
      return
    }
    // Mobile: light, reversible entry choreography (no pin) — the canvas/context band
    // appears, then the Claude panel rises in. Drives --m for the mobile CSS.
    if (mobile) {
      setv('--menu', '1'); setv('--ctx', '1'); setv('--reply', '0')
      const ctx = gsap.context(() => {
        ScrollTrigger.create({ trigger: el, start: 'top 80%', onEnter: () => setShown(true) })
        const st = ScrollTrigger.create({
          trigger: stage.current, start: 'top 85%', end: 'top 32%', scrub: true,
          onUpdate: (s) => setv('--m', s.progress.toFixed(3)),
        })
        return () => st.kill()
      }, el)
      return () => ctx.revert()
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: el, start: 'top 72%', onEnter: () => setShown(true) })
      // SHORT pin: Ask Copilot lights → Claude's design context (received) → pan to the reply
      // → release. Wheel 1:1, fully reversible (pure functions of progress, no hysteresis).
      const st = ScrollTrigger.create({
        trigger: stage.current, start: 'center center', end: '+=120%',
        pin: true, pinSpacing: true, scrub: true, anticipatePin: 1,
        onUpdate: (s) => {
          const p = s.progress
          setv('--menu', clamp01(p / 0.18).toFixed(3))
          setv('--ctx', clamp01((p - 0.2) / 0.22).toFixed(3))
          setv('--reply', clamp01((p - 0.46) / 0.34).toFixed(3))
        },
      })
      return () => st.kill()
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={section} id="xray-s3" className="relative pt-[clamp(2.5rem,7vh,5rem)] pb-[clamp(3rem,8vh,6rem)] font-grotesk">
          <div className="s-head">
            <p className="eyebrow xray-eyebrow s-eyebrow">03 · Context for the agent</p>
            <div className="s-headrow">
              <h2 className="s1-head" style={{ fontFamily: 'var(--font-forum)' }}>
                <MaskLine shown={shown}>Hand it</MaskLine>
                <MaskLine shown={shown} delay="0.09s">to the agent.</MaskLine>
              </h2>
              <p
                className="s-lead"
                style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(14px)', transition: 'opacity .7s ease .2s, transform .7s ease .2s' }}
              >
                A selected element&apos;s menu offers <span className="font-medium text-ink">Ask Copilot</span>. And in
                the CodeCanvas AI panel, <span className="font-medium text-ink">Claude</span> holds this
                <code className="font-mono text-[.95em] text-ink"> &lt;h1&gt;</code>&apos;s real design context — its
                tag and id, inline styles, and the project — with its reply below.
              </p>
            </div>
          </div>

          <div ref={stage} className="s3-stage mt-8 md:mt-14">
            <div className="s3-pane s3-canvas">
              {/* selección (07, no menu) cross-fades to the real menu (07a) — two aligned
                  captures of the SAME session; the menu just appears, no artificial box. */}
              <img src="/media/07-ai-chat-element-context.png" alt="The <h1> selected on the canvas" className="s3-img s3-img-sel" loading="lazy" decoding="async" />
              <img src="/media/07a-context-menu.png" alt="The element's context menu, with Ask Copilot as one action" className="s3-img s3-img-menu" loading="lazy" decoding="async" />
              <span className="s3-tag s3-tag-l">CANVAS · element menu</span>
            </div>
            <div className="s3-pane s3-agent">
              {/* 06 cropped to just the Claude panel (no editor strip). --reply pans it down. */}
              <img src="/media/06-claude-panel.png" alt="CodeCanvas AI panel (Claude) with the <h1> design context and reply" className="s3-img" loading="lazy" decoding="async" />
              <span className="s3-hl s3-hl-ctx" aria-hidden />
            </div>
            <div className="s3-seam" aria-hidden />
          </div>

          <p className="s-cap mt-5">REAL STATES · canvas context + Claude panel</p>
    </section>
  )
}
