// X-Ray · S4 — "On your machine."
// Local-first told only with REAL pixels, in two scenes on ONE stage:
//   IDE scene (04a, full) — two inspector boxes prove the project is local and SERVED FROM LOCALHOST
//     (the loopback terminal logs 127.0.0.1 / ::1 → 200). Localhost is its OWN beat, before the morph.
//   Canvas scene — the view focuses on the canvas/preview (a stable shared frame, cropped to JUST the
//     canvas) and the same local preview re-renders desktop → iPhone 16 Pro Max.
// The desktop/phone canvas stills (04c from 02-device-switch.webm frame, 04d from 04b) are cropped to
// the SAME rect, so the frame never jumps between the different capture sessions — the IDE chrome that
// differs is simply not in frame. They crossfade (a short, soft boundary); we make NO continuity claim.
// HONESTY: local is claimed ONLY for project/files/canvas/preview/localhost — NEVER Claude/the AI (its
// panel + "Local" footer pill are never boxed). No "nothing leaves your machine". No WebGL (→ S5).
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

export default function XRayS4() {
  const section = useRef(null)
  const stage = useRef(null)
  const [shown, setShown] = useState(false)

  useLayoutEffect(() => {
    const el = section.current
    if (!el || !stage.current) return
    const setv = (k, v) => el.style.setProperty(k, v)

    // Mobile (+ reduced-motion): static full state = the payoff (the phone canvas, which keeps the
    // loopback terminal strip in frame as the local proof). No scrub, no morph.
    const mobile = window.matchMedia('(max-width: 767px)').matches
    if (reduced() || mobile) {
      stage.current.dataset.static = '1'
      setv('--proj', '1'); setv('--serve', '1'); setv('--zoom', '1'); setv('--morph', '1')
      setShown(true)
      return
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: el, start: 'top 72%', onEnter: () => setShown(true) })
      // SHORT pin, wheel 1:1, fully reversible (every var is a pure function of progress — no video,
      // no decode, so the start/morph/settle are identical going up or down).
      const st = ScrollTrigger.create({
        trigger: stage.current, start: 'center center', end: '+=150%',
        pin: true, pinSpacing: true, scrub: true, anticipatePin: 1,
        onUpdate: (s) => {
          const p = s.progress
          setv('--p', p.toFixed(4))                             // raw scrub progress (inert; aids verification)
          setv('--proj', clamp01(p / 0.10).toFixed(3))           // box: project files (04e)
          setv('--serve', clamp01((p - 0.14) / 0.14).toFixed(3)) // box: terminal loopback (04e) — localhost beat
          setv('--zoom', clamp01((p - 0.32) / 0.16).toFixed(3))  // IDE → canvas focus; the live preview
          // morph settles the phone by p≈0.90; it then HOLDS to 1.0 as the stable terminal state (no S5 yet,
          // so there is no exit — the phone stays visible to the end of the section).
          setv('--morph', clamp01((p - 0.54) / 0.36).toFixed(3))
        },
      })
      return () => st.kill()
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={section} id="xray-s4" className="relative px-[5vw] pt-[20vh] pb-[14vh] font-grotesk">
      <div className="relative mx-auto flex max-w-[1180px] gap-7">
        <aside aria-hidden className="hidden w-8 shrink-0 lg:block">
          <div className="sticky top-[46vh] flex flex-col gap-2.5 font-mono text-[11px] tracking-[0.22em]">
            {SPINE.map((s, i) => (
              <span key={s} className={i === 3 ? 'font-bold text-ink' : 'text-muted/50'}>{s}</span>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-6">04 · Surface ⇄ Structure</p>
          <h2 className="s1-head" style={{ fontFamily: 'var(--font-forum)' }}>
            <MaskLine shown={shown}>On your</MaskLine>
            <MaskLine shown={shown} delay="0.09s">machine.</MaskLine>
          </h2>
          <p
            className="mt-7 max-w-[52ch] text-[1.06rem] leading-relaxed text-ink-2"
            style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(14px)', transition: 'opacity .7s ease .2s, transform .7s ease .2s' }}
          >
            The project, its files, the canvas, and the live preview run on your machine — the terminal
            logs every request to <span className="font-medium text-ink">loopback (::1)</span> returning
            <span className="font-medium text-ink"> 200</span>, served from
            <span className="font-medium text-ink"> localhost</span>. The same local preview re-renders from the
            full-width canvas to an <span className="font-medium text-ink">iPhone 16 Pro Max</span> —
            same local server, a different viewport.
          </p>

          <div ref={stage} className="s4-stage mt-12">
            {/* IDE scene — 04e (clean, bright frame of the local IDE: Code explorer with the project files +
                loopback terminal, canvas visible, no occluding dropdown). It's the SAME source 04c is cropped
                from, so the zoom into the canvas is continuous. Eager-loaded so the first beat is never blank. */}
            {/* desktop-only source → ≤767px never fetches the ~300KB IDE PNG (it's display:none on mobile) */}
            <picture>
              <source media="(min-width: 768px)" srcSet="/media/04e-ide-desktop.png" />
              <img alt="CodeCanvas running codecanvas-demo locally — Code explorer with the project files and the loopback terminal" className="s4-ide" decoding="async" />
            </picture>
            {/* Canvas scene — two real canvas states cropped to the SAME frame; a directional wipe (not a
                crossfade) takes desktop→phone, so two layouts/headlines are never both fully visible. */}
            <img src="/media/04c-canvas-desktop.png" alt="The live preview rendering the page at desktop width on the canvas" className="s4-cv s4-cv-desktop" decoding="async" />
            <img src="/media/04d-canvas-phone.png" alt="The same local preview re-rendered on an iPhone 16 Pro Max" className="s4-cv s4-cv-phone" decoding="async" />

            {/* one focus per beat: project, then localhost — never near the Claude panel */}
            <span className="s4-hl s4-hl-proj" aria-hidden><span className="s4-hl-label">project · local</span></span>
            <span className="s4-hl s4-hl-serve" aria-hidden><span className="s4-hl-label">localhost</span></span>
            {/* mono tag — cites only what 04e's own terminal shows (no :5500, no path, no "Local" pill) */}
            <span className="s4-tag" aria-hidden>::1 GET / · 200 in 1 ms</span>
          </div>

          <p className="mt-5 font-mono text-[11px] tracking-[0.14em] text-ink-2">
            REAL CAPTURE · codecanvas-demo (HTML) — Code explorer (index.html · pricing.html) + loopback terminal (::1 GET / → 200). The local preview, framed on the canvas, wiped desktop → iPhone 16 Pro Max — real captures (02-device-switch.webm · 04b) on a shared frame, not one continuous take.
          </p>

          {/* S5 teaser intentionally omitted: S5 isn't built yet, so the phone stays the stable terminal
              state to the end of the section — its exit is postponed until there's a real transition to S5. */}
        </div>
      </div>
    </section>
  )
}
