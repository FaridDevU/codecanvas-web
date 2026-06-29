import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { mountCodeCanvasDualityGL } from '../lib/codeCanvasDualityGL'

gsap.registerPlugin(ScrollTrigger)

// Concept 3 — "code <-> canvas duality". A self-contained scroll-shader section: a
// single full-bleed plane wipes a code panel into a rendered-UI mock as you scroll
// past (see ../lib/codeCanvasDualityGL.js). The canvas lives INSIDE this section
// (absolute inset-0), so it never collides with the fixed video-panel GL above.
// Reduced-motion or small screens skip WebGL entirely and render a static CSS mock.

const COBALT = '#2f3df5'
const COBALT2 = '#6b7cff'

// representative tinted code for the no-WebGL fallback (blue/green tokens)
const FALLBACK_CODE = [
  [['#7da0ff', 'export default'], ['#c9d1d9', ' '], ['#7da0ff', 'function'], ['#c9d1d9', ' '], ['#9bc1ff', 'Hero'], ['#7c8290', '() {']],
  [['#c9d1d9', '  '], ['#7da0ff', 'return'], ['#c9d1d9', ' '], ['#7c8290', '(']],
  [['#c9d1d9', '    '], ['#7c8290', '<'], ['#9bc1ff', 'h1'], ['#7c8290', '>'], ['#c9d1d9', 'Build in the open.'], ['#7c8290', '</h1>']],
  [['#c9d1d9', '    '], ['#7c8290', '<'], ['#9bc1ff', 'Button'], ['#c9d1d9', ' '], ['#aab1c4', 'accent'], ['#7c8290', '='], ['#7ee787', "'#2f3df5'"], ['#7c8290', '>']],
  [['#c9d1d9', '      Get started']],
  [['#c9d1d9', '    '], ['#7c8290', '</'], ['#9bc1ff', 'Button'], ['#7c8290', '>']],
  [['#c9d1d9', '  '], ['#7c8290', ')']],
  [['#7c8290', '}']],
]

// Two-panel CSS mock shown when WebGL is skipped or unavailable. Same content as
// the textures so the metaphor survives without a GL context.
function StaticDuality() {
  return (
    <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2">
      {/* code side */}
      <div className="flex flex-col overflow-hidden bg-[#0d1117] p-6 font-mono text-[12px] leading-[1.85] sm:p-8">
        <div className="mb-4 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-white/40">Hero.jsx</span>
        </div>
        {FALLBACK_CODE.map((toks, i) => (
          <div key={i} className="whitespace-pre">
            <span className="mr-3 select-none text-white/20">{i + 1}</span>
            {toks.map(([c, s], j) => (
              <span key={j} style={{ color: c }}>{s}</span>
            ))}
          </div>
        ))}
      </div>

      {/* UI side */}
      <div className="flex flex-col justify-center gap-5 bg-gradient-to-b from-[#f7f7f4] to-[#ebedf2] p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg" style={{ background: COBALT }} />
            <span className="font-display text-sm font-semibold text-ink">CodeCanvas</span>
          </div>
          <span className="rounded-full px-3 py-1 text-[10px] font-semibold text-white" style={{ background: COBALT }}>
            ★ Star
          </span>
        </div>
        <div>
          <p className="eyebrow">Open source · MIT</p>
          <h3 className="mt-1.5 font-display text-2xl font-semibold leading-tight text-ink">Build in the open.</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            A local-first design IDE — edit the live canvas, keep the real source code.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: COBALT }}>
            Get started
          </span>
          <span className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink">
            Read docs
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CodeCanvasDuality() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  // Decide up front so the very first paint is already correct (no canvas flash).
  const [fallback, setFallback] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        window.matchMedia('(max-width: 767px)').matches),
  )

  useLayoutEffect(() => {
    if (fallback) return
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    // defer one frame so fonts/layout settle before the stage is measured
    let dispose
    const id = requestAnimationFrame(() => {
      try {
        dispose = mountCodeCanvasDualityGL(canvas, { section })
      } catch {
        // WebGL unavailable / context creation failed -> static panel, never throws
        setFallback(true)
      }
    })
    return () => {
      cancelAnimationFrame(id)
      if (dispose) dispose()
    }
  }, [fallback])

  return (
    <section id="duality" ref={sectionRef} className="relative px-5 py-24 font-grotesk sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* heading */}
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow mb-5">Code ↔ Canvas</p>
          <h2 className="display text-[2.4rem] sm:text-[3.6rem]">
            One file. <span className="text-accent">Two views.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ink-2">
            Scroll and watch the source compile into the live canvas — same component,
            same file, rendered both ways at once.
          </p>
        </div>

        {/* stage: relative container, canvas fills it, labels overlaid */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[30px] border border-line bg-[#0d1117] shadow-[0_1px_2px_rgba(12,13,16,.04),0_40px_90px_-50px_rgba(20,30,90,.30)]">
          {!fallback && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}
          {fallback && <StaticDuality />}

          {/* overlaid corner labels (echo the diagonal: code top-left, canvas bottom-right) */}
          <span className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm">
            <span className="dot h-1.5 w-1.5" style={{ background: COBALT2 }} />
            Your code
          </span>
          <span className="pointer-events-none absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2 backdrop-blur-sm">
            <span className="dot h-1.5 w-1.5" style={{ background: COBALT }} />
            Live canvas
          </span>
        </div>
      </div>
    </section>
  )
}
