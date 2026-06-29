import { useState } from 'react'

const COMMANDS = `git clone https://github.com/USER/codecanvas
cd codecanvas
npm install
npm run dev`

export default function Quickstart() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(COMMANDS).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section id="quickstart" className="relative border-y border-line bg-panel px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">

        {/* ── Intro ─────────────────────────────────────────────────────── */}
        <div data-skew className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow mb-5">GET STARTED · OPEN SOURCE · MIT LICENSE</p>
          <h2 data-split className="display text-[2.4rem] sm:text-[3.6rem]">
            Clone it. Run it. It's yours.
          </h2>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-muted">
            No account. No cloud subscription. No waitlist.
          </p>
        </div>

        {/* ── Code block ────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-xl">
          <div
            data-reveal
            className="relative rounded-[22px] p-6"
            style={{ background: '#0d1117', border: '1px solid #30363d' }}
          >
            {/* Copy button — top-right, no new deps */}
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Commands copied to clipboard' : 'Copy install commands to clipboard'}
              className="absolute right-4 top-4 rounded-md border px-3 py-1.5 font-mono text-xs transition-colors duration-150"
              style={{
                background: '#161b22',
                borderColor: copied ? 'rgba(74,222,128,.35)' : '#30363d',
                color: copied ? '#4ade80' : '#8b909a',
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>

            <pre
              className="m-0 overflow-x-auto pt-7 font-mono text-sm leading-7"
              style={{ color: '#e6edf3' }}
            >
              <code>{COMMANDS}</code>
            </pre>
          </div>

          {/* Trust line */}
          <p className="mt-4 text-center font-mono text-xs text-muted">
            Runs entirely on your machine — your files never leave it.
          </p>

          {/* CTA row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {/* ponytail: set real repo URL */}
            <a href="#" className="btn btn-dark">
              ★ Star on GitHub
            </a>
            <a href="/docs.html" className="btn btn-light">
              Read the docs →
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
