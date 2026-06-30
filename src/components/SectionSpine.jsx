// One global wayfinding spine for the whole S1–S5 story. Mounted ONCE (in App) as
// the left column of the story container, so the list never duplicates. Sticky
// within the story → it rides the scroll from S1 to S5 and releases at the footer
// (the story container ends before the footer); it is NOT page-fixed. The active
// step is driven by an IntersectionObserver watching a thin middle band, so exactly
// one section is "current" at a time. On mobile the vertical list is replaced by a
// compact "0X / 05" indicator that only shows while inside the story.
import { useEffect, useState } from 'react'

const IDS = ['xray-s1', 'xray-s2', 'xray-s3', 'xray-s4', 'xray-s5']
const LABELS = ['S1', 'S2', 'S3', 'S4', 'S5']

export default function SectionSpine() {
  const [active, setActive] = useState(0)
  const [inStory, setInStory] = useState(false)
  const [atFooter, setAtFooter] = useState(false)

  useEffect(() => {
    const els = IDS.map((id) => document.getElementById(id)).filter(Boolean)
    if (!els.length) return
    const visible = new Set()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            visible.add(e.target.id)
            const i = IDS.indexOf(e.target.id)
            if (i !== -1) setActive(i)
          } else {
            visible.delete(e.target.id)
          }
        })
        setInStory(visible.size > 0) // false at the hero (above) and footer (below)
      },
      { rootMargin: '-45% 0px -45% 0px' }, // a thin band across the viewport middle
    )
    els.forEach((el) => io.observe(el))

    // Hide the mobile chip the moment the footer appears (S5 is tall enough to still
    // cross the band at max scroll, so the section observer alone keeps it on).
    const footer = document.querySelector('footer')
    let footerIO
    if (footer) {
      footerIO = new IntersectionObserver(([e]) => setAtFooter(e.isIntersecting), { threshold: 0 })
      footerIO.observe(footer)
    }
    return () => { io.disconnect(); footerIO?.disconnect() }
  }, [])

  const go = (i) => (e) => {
    e.preventDefault()
    setActive(i)
    const el = document.getElementById(IDS[i])
    if (!el) return
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -window.innerHeight * 0.28 })
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* Desktop: vertical list, sticky within the story (stops at the footer). */}
      <aside aria-label="Section progress" className="hidden w-8 shrink-0 lg:block">
        <nav className="sticky top-[46vh] flex flex-col gap-2.5 font-mono text-[11px] tracking-[0.22em]">
          {LABELS.map((s, i) => (
            <a
              key={s}
              href={`#${IDS[i]}`}
              onClick={go(i)}
              aria-current={i === active ? 'step' : undefined}
              className={`outline-offset-4 transition-colors ${i === active ? 'font-bold text-ink' : 'text-muted/40 hover:text-muted'}`}
            >
              {s}
            </a>
          ))}
        </nav>
      </aside>

      {/* Mobile/tablet: a single compact indicator, only while inside the story. */}
      <div
        aria-hidden
        className={`pointer-events-none fixed bottom-5 right-5 z-40 rounded-full border border-line bg-white/85 px-3 py-1.5 font-mono text-[11px] tracking-[0.18em] text-ink-2 shadow-sm backdrop-blur transition-opacity duration-300 lg:hidden ${inStory && !atFooter ? 'opacity-100' : 'opacity-0'}`}
      >
        0{active + 1} <span className="text-muted">/ 05</span>
      </div>
    </>
  )
}
