import { useReveal } from '../lib/reveal'

const qa = [
  ['Is it cloud or local?', 'Fully local. CodeCanvas is a desktop app — your project, files and changes stay on your machine. Nothing is uploaded unless you choose to send something to the AI.'],
  ['Which AI models work today?', 'Claude is live. Codex and Kimi are coming soon and are marked as such in the app — we’d rather ship what actually works than fake it.'],
  ['Does it touch my real code?', 'Yes — that’s the point. Edits on the canvas write back to your real source files, so every change is reviewable like any other commit.'],
  ['What frameworks does it support?', 'It detects your project and works with plain HTML and the common component frameworks (React, Vue, Svelte and more).'],
  ['How do I run it?', 'Clone the repo and run `npm install && npm run dev` (see the README for the exact command). No account, no API key required to start — you only need a key for the AI features.'],
  ['Can I contribute?', 'Yes — the repo is public and the issues are open. Open a PR to fix something, or an issue to propose something.'],
]

export default function Faq() {
  const root = useReveal()
  return (
    <section id="faq" ref={root} className="relative border-t border-line bg-panel px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p data-reveal className="eyebrow mb-5">Questions</p>
          <h2 data-split className="display text-[2.4rem] sm:text-[3.4rem]">The honest answers.</h2>
        </div>
        <div data-reveal className="flex flex-col gap-3">
          {qa.map(([q, a]) => (
            <details key={q} className="group card cursor-pointer px-6 py-5 [&[open]_.plus]:rotate-45">
              <summary className="flex list-none items-center justify-between gap-4 text-lg font-semibold text-ink marker:hidden">
                {q}
                <span className="plus text-2xl font-light text-accent transition-transform duration-300">+</span>
              </summary>
              <p className="mt-4 max-w-xl leading-relaxed text-ink-2">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
