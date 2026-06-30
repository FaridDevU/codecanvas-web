import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// A thick blue ribbon (Lusion style) that snakes top-to-bottom behind every
// section across the full width of the page. It draws itself as you scroll and
// un-draws on the way up. The SVG spans the WHOLE document height (user units =
// CSS px) so there's no aspect-ratio stretching.
//
// The draw front tracks your VERTICAL scroll position (not raw path length):
// because the line weaves side to side, equal path length ≠ equal height, so a
// length-proportional draw lags behind the viewport. We sample the path's y for
// each length fraction and draw up to wherever the viewport currently is.

// The ribbon threads NEGATIVE SPACE only. Across S1–S5 the editorial text moves
// side to side (S1 left, S2 right, S3 shifted, S4 two-col, S5 centred) and the
// full-width stages occupy the centre, so a wide weave can't avoid type anywhere.
// The one corridor free of text AND stages on every section/viewport is the outer
// LEFT gutter (content is centred with margin, and starts at ≥5vw on mobile). So
// the line lives there as a gentle gutter weave — Lusion's edge thread, never a
// slash across a headline. y stays monotonic so the scroll-draw sampling holds.
function buildPath(w, h) {
  // Stay INSIDE the page's 5vw padding (every section uses px-[5vw]) so the line is
  // always in the gutter, left of all text/stages, on every viewport.
  const gutter = Math.max(14, w * 0.04)
  const base = gutter * 0.35
  const amp = gutter * 0.5
  const xs = [base + amp, base, base + amp, base, base + amp, base]
  const ys = [-60, h * 0.2, h * 0.4, h * 0.62, h * 0.82, h + 60]
  let d = `M${xs[0]},${ys[0]}`
  for (let i = 1; i < xs.length; i++) {
    const dy = ys[i] - ys[i - 1]
    d += ` C${xs[i - 1]},${ys[i - 1] + dy * 0.55} ${xs[i]},${ys[i] - dy * 0.55} ${xs[i]},${ys[i]}`
  }
  return d
}

export default function ScrollLine() {
  const path = useRef(null)
  const [dims, setDims] = useState({ w: 1440, h: 3000 })

  // Keep the SVG the size of the whole document.
  useLayoutEffect(() => {
    const measure = () =>
      setDims({ w: window.innerWidth, h: document.documentElement.scrollHeight })
    measure()
    window.addEventListener('resize', measure)
    // Re-measure after pins/fonts settle (the FW horizontal pin adds page height).
    ScrollTrigger.addEventListener('refresh', measure)
    const t = setTimeout(measure, 600) // page height settles after images load
    return () => {
      window.removeEventListener('resize', measure)
      ScrollTrigger.removeEventListener('refresh', measure)
      clearTimeout(t)
    }
  }, [])

  // Sample path y per length fraction, then draw up to the viewport on scroll.
  useLayoutEffect(() => {
    const el = path.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.strokeDashoffset = '0'
      return
    }
    const total = el.getTotalLength()
    const N = 240
    const ys = []
    for (let i = 0; i <= N; i++) ys.push(el.getPointAtLength((total * i) / N).y)

    // length fraction (0..1) whose point sits at document y
    const fracAtY = (y) => {
      if (y <= ys[0]) return 0
      for (let i = 1; i <= N; i++) {
        if (ys[i] >= y) {
          const span = ys[i] - ys[i - 1] || 1
          return (i - 1 + (y - ys[i - 1]) / span) / N
        }
      }
      return 1
    }

    const update = () => {
      // draw a little ahead of the cursor (but still visibly drawing)
      const frac = fracAtY(window.scrollY + window.innerHeight * 0.7)
      el.style.strokeDashoffset = String(1 - frac)
    }
    update()
    // Route through ScrollTrigger's single rAF (shared with Lenis) instead of a
    // separate window 'scroll' listener + rAF. onRefresh redraws after layout.
    const st = ScrollTrigger.create({ onUpdate: update, onRefresh: update })
    return () => st.kill()
  }, [dims])

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 w-full"
      style={{ zIndex: -1, height: dims.h, opacity: 0.5 }}
      viewBox={`0 0 ${dims.w} ${dims.h}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        {/* Vertical gradient over the whole document — the ribbon shifts colour
            as it travels down through the sections. */}
        {/* lusion.co line is a glossy cobalt-blue tube — tight blue range with a
            lighter "lit" core, not a rainbow. */}
        <linearGradient id="scrollline-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={dims.h}>
          <stop offset="0" stopColor="#7da0ff" />
          <stop offset="0.5" stopColor="#2f4dff" />
          <stop offset="1" stopColor="#7da0ff" />
        </linearGradient>
      </defs>
      <path
        ref={path}
        d={buildPath(dims.w, dims.h)}
        stroke="url(#scrollline-grad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset="1"
      />
    </svg>
  )
}
