// Shared scroll-animation system, registered once from App on mount. Everything
// is gated through gsap.matchMedia so it self-reverts on breakpoint changes and
// fully respects prefers-reduced-motion (the queries below require
// `no-preference`, so reduced-motion users get the static, un-transformed page).
//
//  - velocity skew        on [data-skew]      (cap ±6°, settle to 0 when idle)
//  - masked line reveals  on [data-split] h2  (SplitText, scrubbed-in on enter)
//  - hero parallax        on [data-parallax]  (yPercent = the attribute value)
//  - magnetic pull        on .btn-dark/.btn-light/[data-magnetic] (fine pointer)
//  - horizontal pinned    Featured-Work track [data-fw-wrap]/[data-fw-track]
//
// The video-plane velocity bow lives in videoPanelGL.js (it owns that GL plane).
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

const MOTION = '(prefers-reduced-motion: no-preference)'
const DESKTOP = '(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

export function initSiteAnim() {
  // One rAF for everything: ignore the spurious mobile resize (URL bar) reflow.
  ScrollTrigger.config({ ignoreMobileResize: true })

  const mm = gsap.matchMedia()

  /* ---- effects that also run on mobile (motion only, not pointer-gated) ---- */
  mm.add(MOTION, () => {
    // 1) Velocity skew — the page leans into the scroll, settles when idle.
    const skewEls = gsap.utils.toArray('[data-skew]')
    if (skewEls.length) {
      const setters = skewEls.map((el) =>
        gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' }),
      )
      let idle
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-6, 6, self.getVelocity() / -420)
          setters.forEach((s) => s(v))
          clearTimeout(idle)
          idle = setTimeout(() => setters.forEach((s) => s(0)), 120)
        },
      })
    }

    // 2) Masked headline reveals — each [data-split] h2's lines rise out of a clip.
    const splits = []
    gsap.utils.toArray('[data-split]').forEach((el) => {
      splits.push(
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 115,
              duration: 1,
              stagger: 0.12,
              ease: 'power4.out',
              scrollTrigger: { trigger: el, start: 'top 82%' },
            }),
        }),
      )
    })

    // 3) Hero parallax — glow/dotgrid/foreground layers drift at their own speed.
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 0
      gsap.to(el, {
        yPercent: amt,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })

    return () => splits.forEach((s) => s.revert())
  })

  /* ---- desktop + fine-pointer only ---- */
  mm.add(DESKTOP, () => {
    // 4) Magnetic CTAs — pull 0.35× toward the cursor, release on leave.
    const removers = []
    gsap.utils.toArray('.btn-dark, .btn-light, [data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' })
      const move = (e) => {
        const r = el.getBoundingClientRect()
        xTo((e.clientX - (r.left + r.width / 2)) * 0.35)
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35)
      }
      const leave = () => { xTo(0); yTo(0) }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      removers.push(() => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
        gsap.set(el, { x: 0, y: 0 })
      })
    })

    // 5) Signature moment — Featured Work scrolls HORIZONTALLY while pinned.
    //    `fw-h` switches the track from the wrapping grid to a nowrap row; the
    //    default (no class) is the mobile / reduced-motion fallback.
    const wrap = document.querySelector('[data-fw-wrap]')
    const track = document.querySelector('[data-fw-track]')
    if (wrap && track) {
      wrap.classList.add('fw-h')
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)
      gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
          end: () => '+=' + dist(),
        },
      })
    }

    return () => {
      removers.forEach((fn) => fn())
      wrap?.classList.remove('fw-h')
    }
  })

  // Fonts change line-wrapping → re-measure once they're ready (and after the
  // SplitText/pin geometry settles).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  }

  return () => mm.revert()
}
