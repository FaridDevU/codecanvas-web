import { useReveal } from '../lib/reveal'

const audience = [
  ['Frontend devs', 'who want to design without leaving the code they own.'],
  ['Designers who ship', 'tired of throwing mockups over a wall to be rebuilt.'],
  ['Indie builders', 'shipping real products solo, fast, on their own machine.'],
]

export default function Manifesto() {
  const root = useReveal()

  return (
    <div ref={root}>
      <section id="privacy" className="relative px-5 py-24 text-center sm:py-32">
        <div data-skew className="mx-auto max-w-4xl">
          <p data-reveal className="eyebrow mb-7">Local-first, on purpose</p>
          <h2 data-split className="display text-[2.4rem] sm:text-[3.8rem]">
            It runs on your machine. Your code never has to{' '}
            <span className="text-accent">leave it.</span>
          </h2>
          <p data-reveal className="mx-auto mt-7 max-w-2xl text-[1.05rem] leading-relaxed text-ink-2">
            CodeCanvas is a desktop app, not a cloud editor. Your project, your files and your
            changes stay local and reviewable — you decide what, if anything, the AI sees.
          </p>
        </div>
      </section>

      <section id="audience" className="relative px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p data-reveal className="eyebrow mb-10">Who it’s for</p>
          <div className="grid gap-5 sm:grid-cols-3">
            {audience.map(([who, why]) => (
              <div key={who} data-reveal className="card p-8 sm:p-10">
                <div className="mb-5 h-px w-10 bg-accent" />
                <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">{who}</h3>
                <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-2">{why}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
