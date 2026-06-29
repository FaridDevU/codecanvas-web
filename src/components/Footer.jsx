// Lusion-style footer: a CTA block, nav links, then a giant wordmark statement.
export default function Footer() {
  return (
    <footer className="relative z-10 px-[5vw] pb-10 pt-[6vh] font-grotesk">
      <div className="flex flex-col gap-10 border-t border-line pt-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-4">Local-first design IDE</p>
          <h2 className="font-bold tracking-tight text-ink" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1 }}>
            Build your next<br />interface in the open.
          </h2>
          <a href="#" className="btn btn-dark btn-ai mt-7 h-12 px-6">Star on GitHub</a>{/* ponytail: set real URL */}
        </div>
        <nav className="flex flex-wrap gap-x-10 gap-y-3 text-sm text-ink-2">
          <a href="#" className="transition-colors hover:text-ink">GitHub</a>{/* ponytail: set real URL */}
          <a href="/docs.html" className="transition-colors hover:text-ink">Docs</a>
          <a href="#" className="transition-colors hover:text-ink">Discord</a>{/* ponytail: set real URL */}
          <a href="#" className="transition-colors hover:text-ink">Changelog</a>{/* ponytail: set real URL */}
          <a href="#" className="transition-colors hover:text-ink">License</a>{/* ponytail: set real URL */}
        </nav>
      </div>

      {/* Giant wordmark — like lusion's full-width footer logotype. */}
      <div data-skew className="mt-16 select-none overflow-hidden">
        <span
          className="block whitespace-nowrap italic text-ink"
          style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(3rem, 15vw, 14rem)', lineHeight: 0.82 }}
        >
          CodeCanvas <span className="ai-gradient">AI</span>
        </span>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span>© 2026 CodeCanvas AI · MIT License</span>
        <span>Design it live. Keep the real code.</span>
      </div>
    </footer>
  )
}
