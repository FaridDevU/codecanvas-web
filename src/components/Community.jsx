import { useReveal } from '../lib/reveal'

export default function Community() {
  const root = useReveal()

  return (
    <section
      id="community"
      ref={root}
      className="relative border-y border-line bg-panel px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">

        {/* Eyebrow + Headline */}
        <div data-reveal className="mb-12 max-w-3xl">
          <p className="eyebrow mb-5">FREE · OPEN SOURCE · MIT LICENSE</p>
          <h2 className="display text-[2.4rem] sm:text-[3.6rem]">
            Built in the open. For developers who build in the open.
          </h2>
        </div>

        {/* Chip / badge row */}
        <div data-reveal className="mb-12 flex flex-wrap gap-2.5" role="list" aria-label="Project badges">
          <span className="chip" role="listitem">MIT License</span>
          <a
            href={"#" /* ponytail: set real URL */}
            className="chip transition-colors hover:border-ink-2"
            role="listitem"
            aria-label="Star the repo on GitHub"
          >
            ★ Star the repo
          </a>
          <span className="chip" role="listitem">Contributors</span>
          <a
            href={"#" /* ponytail: set real URL */}
            className="chip transition-colors hover:border-ink-2"
            role="listitem"
            aria-label="Join the Discord community"
          >
            Discord
          </a>
        </div>

        {/* Body paragraph — verbatim from spec */}
        <p data-reveal className="mb-14 max-w-2xl text-[1.05rem] leading-relaxed text-ink-2">
          CodeCanvas is a personal open-source project — not a company, not a SaaS product,
          not a waitlist. The source is public, the roadmap is public, and every fix ships to
          everyone who runs it. Open an issue if something is broken. Send a PR if you have a
          fix. The codebase is readable React — no mysteries.
        </p>

        {/* Contributors block — solo pre-launch fallback; no API, no fake avatars */}
        <div data-reveal className="card mb-14 p-8">
          <p className="eyebrow mb-4">CONTRIBUTORS</p>
          <p className="text-[1.02rem] leading-relaxed text-muted">
            Building this solo for now. Want to see your face here?{' '}
            <a
              href={"#" /* ponytail: set real URL */}
              className="text-ink-2 underline underline-offset-2 transition-colors hover:text-ink"
            >
              Check the open issues →
            </a>
          </p>
        </div>

        {/* CTA row */}
        <div data-reveal className="mb-10 flex flex-wrap gap-3">
          <a
            href={"#" /* ponytail: set real URL */}
            className="btn btn-dark"
          >
            ★ Star on GitHub
          </a>
          <a
            href={"#" /* ponytail: set real URL */}
            className="btn btn-light"
          >
            View Roadmap
          </a>
          <a
            href={"#" /* ponytail: set real URL */}
            className="btn btn-light"
          >
            Join Discord
          </a>
        </div>

        {/* Sponsor note */}
        <p data-reveal className="text-sm text-muted">
          If CodeCanvas saves you time, consider sponsoring on GitHub Sponsors — it keeps the
          project maintained.{' '}
          <a
            href={"#" /* ponytail: set real URL */}
            className="underline underline-offset-2 transition-colors hover:text-ink-2"
          >
            GitHub Sponsors →
          </a>
        </p>

      </div>
    </section>
  )
}
