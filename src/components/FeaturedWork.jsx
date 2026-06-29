import { useEffect, useRef, useState } from 'react'

// Lusion's "Featured Work": a 2-col grid of rounded media tiles, each captioned
// media → eyebrow tags (mono, dot-separated) → title. We use the real product
// teardown clips and CodeCanvas capability tags.
const TILES = [
  { src: '/media/clips/04-live-preview.webm', title: 'Code, meet canvas', tags: 'LIVE PREVIEW · REAL APP · SYNC' },
  { src: '/media/clips/01-edit-text.webm', title: 'Edit on the canvas', tags: 'DESIGN · LIVE DOM · NO HANDOFF' },
  { src: '/media/clips/03-send-to-ai.webm', title: 'Send it to the AI', tags: 'AI · CONTEXT · CHAT' },
  { src: '/media/clips/02-device-switch.webm', title: 'Every breakpoint', tags: 'RESPONSIVE · DEVICES · REFLOW' },
  { src: '/media/clips/05-inspect-elements.webm', title: 'Inspect anything', tags: 'INSPECT · REAL DOM · STYLES' },
]

function Tile({ src, title, tags, className = '' }) {
  const el = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const node = el.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVis(true); return }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect() } },
      { threshold: 0.15 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <figure ref={el} className={`group ${className}`}>
      {/* lusion's tile reveal: a horizontal mask opens from a centre band to full
          width on enter (clip-path), smooth eased. */}
      <div
        className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-[#0d0f14]"
        style={{
          clipPath: vis ? 'inset(0% round 16px)' : 'inset(0% 34% round 16px)',
          transition: 'clip-path 1s cubic-bezier(.65,.05,.2,1)',
        }}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          autoPlay muted loop playsInline
        >
          <source src={src} type="video/webm" />
        </video>
      </div>
      <figcaption
        className="mt-4"
        style={{
          opacity: vis ? 1 : 0,
          transform: vis ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity .8s ease, transform .8s cubic-bezier(.22,.7,.2,1)',
          transitionDelay: '.15s',
        }}
      >
        <p className="eyebrow">{tags}</p>
        <h3 className="mt-1.5 text-[1.3rem] font-semibold tracking-tight text-ink">{title}</h3>
      </figcaption>
    </figure>
  )
}

export default function FeaturedWork() {
  return (
    <section id="work" className="relative z-10 bg-paper pt-[6vh] pb-[6vh] font-grotesk">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 px-[5vw]" data-skew>
        <h2 data-split className="font-bold tracking-tight text-ink" style={{ fontSize: 'clamp(2.6rem, 7vw, 6rem)', lineHeight: 0.98 }}>
          Featured work
        </h2>
        <p className="max-w-sm text-[1.05rem] leading-relaxed text-ink-2">
          A local-first IDE where the canvas <em>is</em> the code — here's what
          that looks like in motion.
        </p>
      </div>

      {/* On desktop anim.js adds `.fw-h` → the track pins and scrolls horizontally.
          Without it (mobile / reduced-motion) this is a plain wrapping grid. */}
      <div data-fw-wrap className="relative">
        <div data-fw-track className="fw-track flex flex-wrap gap-x-8 gap-y-14 px-[5vw]">
          {TILES.map((t) => (
            <Tile key={t.src} {...t} className="fw-tile w-full sm:w-[calc(50%-1rem)]" />
          ))}
        </div>
      </div>
    </section>
  )
}
