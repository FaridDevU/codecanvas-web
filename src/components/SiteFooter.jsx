// Closing footer. Dark, sober, no decoration. Only REAL destinations are linked
// (the docs pages and the repo already wired in the header); no Discord/license/
// sponsor/social, no email (none exists in the assets), no subscribe form. The
// tagline reuses existing copy (VideoPanel) — no new claims.
const toTop = () => {
  if (typeof window === 'undefined') return
  if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.1 })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Real, already-existing destinations only.
const LINKS = [
  { label: 'Docs', href: '/docs.html' },
  { label: 'API', href: '/docs-api.html' },
  { label: 'GitHub', href: 'https://github.com/FaridDevU/CodeCanvas-AI', external: true },
]

export default function SiteFooter() {
  return (
    <footer className="relative font-grotesk text-[#cdd2dc]" style={{ background: 'var(--color-night)' }}>
      <div className="mx-auto max-w-[1180px] px-[5vw] pb-10 pt-16 2xl:max-w-[1320px] md:pb-12 md:pt-24">
        {/* Top: wordmark + tagline | real nav */}
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <button
              type="button"
              onClick={toTop}
              aria-label="CodeCanvas AI — back to top"
              className="block cursor-pointer text-left italic leading-[0.95] text-white outline-offset-4"
              style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(2.6rem, 7vw, 5.5rem)' }}
            >
              CodeCanvas <span className="ai-gradient not-italic">AI</span>
            </button>
            <p className="mt-4 max-w-[42ch] text-[1rem] leading-relaxed text-[#8b93a4]">
              A local-first, open-source design IDE.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 md:justify-end" aria-label="Footer">
            {LINKS.map(({ label, href, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group inline-flex items-center gap-1 text-[15px] font-medium text-[#cdd2dc] transition-colors hover:text-white"
              >
                {label}
                {external && <span aria-hidden className="text-[#8b93a4] transition-colors group-hover:text-white">↗</span>}
              </a>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="mt-12 h-px w-full bg-white/10 md:mt-16" />

        {/* Bottom: copyright | back to top */}
        <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[12px] tracking-[0.04em] text-[#7d8493]">© 2026 CodeCanvas</p>
          <button
            type="button"
            onClick={toTop}
            className="inline-flex items-center gap-2 self-start font-mono text-[12px] uppercase tracking-[0.14em] text-[#cdd2dc] transition-colors hover:text-white sm:self-auto"
          >
            Back to top <span aria-hidden>↑</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
