// New page — step 1. Lusion-style hero: wordmark + pill nav, a 3-line headline,
// and a big rounded stage box holding the live cobalt 3D knot (the signature).
// Bottom row: corner "+" marks + SCROLL TO EXPLORE.
import { useEffect, useRef, useState } from 'react'
import Ballpit from './Ballpit'

function Plus({ className = '' }) {
  return (
    <span className={`select-none font-mono text-[1.7rem] font-normal leading-none text-ink-2 ${className}`}>
      +
    </span>
  )
}

export default function StageHero() {
  const stage = useRef(null)
  // Once the hero (with its dark stage) starts leaving, fade a translucent paper
  // backdrop behind the fixed header so the dark logo never sits dark-on-dark
  // over the stage/video panels. Content position is unchanged (locked).
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.5)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Menu dropdown (Lusion-style). Close on outside-click or Escape.
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const links = [
    ['Docs', '/docs.html', true],
    ['Architecture', '/docs.html?p=01-architecture'],
    ['API', '/docs-api.html'],
    ['Diagrams', '/docs.html?p=10-diagrams'],
  ]

  return (
    <section className="relative flex flex-col px-[5vw] pb-8 pt-10 font-grotesk">
      {/* Hero parallax layers (scrubbed in anim.js): a soft cobalt glow and a
          faint dot-grid drift behind the stage on the paper margins. */}
      <div
        data-parallax="-38"
        aria-hidden
        className="pointer-events-none absolute -z-10 left-1/2 top-[18vh] h-[60vh] w-[60vh] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(47,77,255,.18), transparent 65%)', filter: 'blur(40px)' }}
      />
      <div
        data-parallax="-18"
        aria-hidden
        className="dotgrid pointer-events-none absolute -z-10 inset-x-0 top-0 h-[82vh] opacity-50"
      />
      {/* Nav: wordmark + right buttons. FIXED so they follow on scroll, at the
          exact same spot/size as their resting position (same px-[5vw]/pt-10 and
          sizes — don't change them). Transparent full-width bar; only the two
          ends catch clicks so the centred headline stays clickable-through. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-[5vw] pt-10">
        {/* Frosted paper backdrop — fades in on scroll, keeps the logo legible
            over dark panels. Behind the content; doesn't shift its position. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-paper/70 shadow-[0_1px_0_rgba(12,13,16,.06)] backdrop-blur-md transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
        />
        <a
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}
          tabIndex={0}
          role="button"
          aria-label="CodeCanvas AI — back to top"
          className="pointer-events-auto cursor-pointer italic text-ink outline-offset-4"
          style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(1.5rem, 5vw, 3.9rem)', lineHeight: 1.15, paddingBlock: '0.06em' }}
        >
          CodeCanvas{' '}
          <span
            className="ai-gradient"
            style={{ display: 'inline-block', padding: '0.04em 0.18em 0.08em 0.14em', margin: '-0.04em -0.1em -0.08em -0.06em' }}
          >
            AI
          </span>
        </a>

        <div ref={menuRef} className="pointer-events-auto relative flex items-center gap-2 max-sm:gap-1.5">
          {/* Star on GitHub → the real repo. Hidden on mobile via a wrapper (the
              un-layered .btn rule beats Tailwind display utilities, so hiding must
              happen on a non-.btn element). */}
          <div className="hidden sm:block">
            <a
              href="https://github.com/FaridDevU/CodeCanvas-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark btn-ai h-11 px-5"
            >
              Star on GitHub
            </a>
          </div>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            className="btn btn-menu group h-11 px-5 max-sm:h-9 max-sm:px-3 max-sm:text-[13px]"
          >
            {menuOpen ? 'Close' : 'Menu'}
            <span className="relative ml-1 inline-flex h-4 w-4 items-center justify-center">
              <span className={`absolute leading-none tracking-[0.25em] transition-all duration-300 ${menuOpen ? 'scale-0 opacity-0' : 'group-hover:scale-0 group-hover:opacity-0'}`}>··</span>
              <span className={`ai-gradient absolute text-[16px] leading-none transition-all duration-300 ${menuOpen ? 'rotate-45 scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:rotate-[72deg] group-hover:scale-100 group-hover:opacity-100'}`}>
                {menuOpen ? '✕' : '★'}
              </span>
            </span>
          </button>

          {/* Lusion-style dropdown: links card + newsletter card + GitHub button */}
          {menuOpen && (
            <div
              className="absolute right-0 top-[calc(100%+12px)] flex w-[min(340px,calc(100vw-2.5rem))] origin-top-right flex-col gap-3 font-grotesk"
              style={{ animation: 'menu-pop .22s cubic-bezier(.2,.8,.2,1)' }}
            >
              <nav className="card px-5 py-3">
                {links.map(([label, href, active]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center justify-between py-2.5 text-[22px] font-medium tracking-tight text-ink transition-opacity hover:opacity-100"
                  >
                    <span>{label}</span>
                    <span className={`dot bg-ink transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                  </a>
                ))}
              </nav>

              {/* Subscribe/email-capture card removed — forbidden SaaS pattern for an
                  open-source project page. Menu "GitHub" → the author's profile
                  (the header "Star on GitHub" goes to the repo itself). */}
              <a
                href="https://github.com/FaridDevU"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark btn-ai flex items-center justify-between !rounded-[18px] px-5 py-4 text-base"
              >
                <span className="flex items-center gap-3"><span className="text-lg">★</span> GitHub</span>
                <span className="text-lg">↗</span>
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Centred headline stays in flow (scrolls away). min-height reserves the
          nav's row so the stage box keeps its position under the fixed bar. */}
      <div className="flex min-h-[2.75rem] items-start">
        <h1
          className="mx-auto hidden flex-1 px-4 text-center tracking-tight text-ink lg:block"
          style={{ fontFamily: 'var(--font-forum)', fontSize: 'clamp(1.4rem, 2.2vw, 3rem)', lineHeight: 1.35 }}
        >
          A local-first design IDE<br />
          to edit real code on live canvas<br />
          with AI that understands you
        </h1>
      </div>

      {/* Headline on small screens (stacks under the bar) */}
      <h1
        className="mt-5 text-[1.35rem] leading-snug tracking-tight text-ink lg:hidden"
        style={{ fontFamily: 'var(--font-forum)' }}
      >
        A local-first design IDE<br />
        to edit real code on live canvas<br />
        with AI that understands you
      </h1>

      {/* The stage — dark box with a soft cobalt glow for depth. */}
      <div
        ref={stage}
        data-stage
        data-parallax="-6"
        className="relative mt-3 h-[64vh] min-h-[320px] w-full overflow-hidden rounded-[34px]"
        style={{ background: 'var(--color-night)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(58% 58% at 50% 46%, rgba(70,92,255,.26), transparent 72%)' }}
        />
        <Ballpit
          className="absolute inset-0"
          count={100}
          gravity={0.5}
          friction={0.99}
          maxVelocity={0.3}
          wallBounce={0.95}
          followCursor={false}
          colors={[0x2f3df5, 0x6b7cff, 0xaab4ff]}
        />
      </div>

      {/* Bottom row: + ......... SCROLL TO EXPLORE ......... + */}
      <div className="mt-5 flex items-center justify-between">
        <Plus />
        <Plus className="hidden sm:inline" />
        <span className="eyebrow">Scroll to explore</span>
        <Plus className="hidden sm:inline" />
        <Plus />
      </div>
    </section>
  )
}
