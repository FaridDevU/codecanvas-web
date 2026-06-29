import { useReveal } from '../lib/reveal'

const features = [
  { title: 'Edit on the canvas, keep real code', tags: ['Visual', 'Live'], media: '/media/01-edit-text.gif',
    body: 'Select any element on the live canvas and change it — your source files stay real and reviewable.' },
  { title: 'One project, every screen', tags: ['Responsive', 'Devices'], media: '/media/02-device-switch.gif',
    body: 'Switch desktop to phone in a click; the canvas reflows into a real device frame.' },
  { title: 'AI that knows what you point at', tags: ['AI', 'Context'], media: '/media/03-send-to-ai.gif',
    body: 'Right-click an element and send it to the AI — tag, styles and source already attached.' },
  { title: 'The full style panel, one click away', tags: ['Inspect', 'Properties'], media: '/media/05-inspect-elements.gif',
    body: 'Click any element and its complete properties appear: font, size, color, radius, spacing.' },
]

export default function Capabilities() {
  const root = useReveal()

  return (
    <section id="capabilities" ref={root} className="relative px-5 py-24 sm:px-8 sm:py-32">
      {/* Sticky-left statement; the real-app product cards scroll past it on the
          right — calm "product proof" pinning (CSS sticky, plays nice with Lenis). */}
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow mb-5">Captured from the real app</p>
          <h2 data-split className="display max-w-[15ch] text-[2.4rem] sm:text-[3.6rem]">
            Everything you'd want from a design tool. In real code.
          </h2>
          <p className="mt-6 max-w-sm text-[1.05rem] leading-relaxed text-ink-2">
            Real screens from CodeCanvas — not mockups. Edit on the live canvas,
            keep production code, and hand the AI exactly what you point at.
          </p>
        </div>

        <div className="grid gap-6">
          {features.map((f) => (
            <article key={f.title} data-reveal className="card group overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-1">
              <div className="media-round relative bg-paper">
                <img src={f.media} alt={f.title} loading="lazy" className="block w-full" />
                <div className="absolute left-4 top-4 flex gap-2">
                  {f.tags.map((t) => (
                    <span key={t} className="chip bg-white/85 px-3 py-1 backdrop-blur-md">{t}</span>
                  ))}
                </div>
              </div>
              <div className="px-3 pb-2 pt-6">
                <h3 className="font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">{f.title}</h3>
                <p className="mt-2.5 max-w-md text-[1.02rem] leading-relaxed text-ink-2">{f.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
