import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { k: 'Open', title: 'Open your project', body: 'CodeCanvas runs locally as a full IDE — your real files, your real stack, nothing leaves your machine.', media: '/media/01-ide-shell.png' },
  { k: 'Detect', title: 'Switch to Design mode', body: 'It reads your project, detects the framework and lists your pages. The canvas becomes editable.', media: '/media/02-design-sidebar.png' },
  { k: 'Edit', title: 'Edit on the live canvas', body: 'Your app renders live. Click, drag, retype — every change writes back to real source.', media: '/media/03-canvas-app-open.png' },
  { k: 'Inspect', title: 'Tune the details', body: 'Select any element and its full property panel opens: font, color, radius, spacing, opacity.', media: '/media/05-element-selected.png' },
  { k: 'Ask', title: 'Hand it to AI — with context', body: 'Send the selected element to the assistant with its tag, styles and source already attached.', media: '/media/07-ai-chat-element-context.png' },
]

export default function HowItWorks() {
  const root = useRef(null)
  const [active, setActive] = useState(0)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-step]').forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el, start: 'top 60%', end: 'bottom 60%',
          onToggle: (self) => self.isActive && setActive(i),
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const pct = ((active + 1) / steps.length) * 100

  return (
    <section id="how" ref={root} className="relative border-y border-line bg-panel px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div data-skew className="mb-16 max-w-2xl">
          <p className="eyebrow mb-5">How it works</p>
          <h2 data-split className="display text-[2.4rem] sm:text-[3.6rem]">
            Open your project.<br/>Edit it live.<br/>Keep the real code.
          </h2>
        </div>

        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <ol className="relative">
            {steps.map((s, i) => (
              <li key={s.k} data-step className="relative py-7 pl-14 transition-opacity duration-300"
                  style={{ opacity: active === i ? 1 : 0.35 }}>
                <span
                  className="absolute left-0 top-[1.8rem] flex h-10 w-10 items-center justify-center rounded-full border font-mono text-xs transition-all duration-300"
                  style={{
                    background: active === i ? 'var(--color-ink)' : 'var(--color-white)',
                    borderColor: active === i ? 'var(--color-ink)' : 'var(--color-line)',
                    color: active === i ? '#fff' : 'var(--color-muted)',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="eyebrow">{s.k}</span>
                <h3 className="mt-1.5 font-display text-xl font-semibold text-ink sm:text-2xl">{s.title}</h3>
                <p className="mt-2.5 max-w-md text-[1.02rem] leading-relaxed text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>

          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className="card overflow-hidden p-2">
                <div className="media-round relative aspect-[16/10] bg-paper">
                  {steps.map((s, i) => (
                    <img key={s.k} src={s.media} alt={s.title} loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
                      style={{ opacity: active === i ? 1 : 0 }} />
                  ))}
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="font-mono text-xs text-muted">{String(active + 1).padStart(2, '0')} / 0{steps.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
