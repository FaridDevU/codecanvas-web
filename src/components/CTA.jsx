import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function CTA() {
  const root = useRef(null)
  const word = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let ctx
    const start = () => {
      if (ctx) return
      ctx = gsap.context(() => {
        const split = new SplitText(word.current, { type: 'lines', mask: 'lines' })
        gsap.from(split.lines, {
          yPercent: 115, autoAlpha: 0, ease: 'power3.out', duration: 1, stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: 'top 70%' },
        })
        gsap.from('[data-cta-fade]', {
          autoAlpha: 0, y: 22, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 60%' },
        })
      }, root)
    }
    const fb = setTimeout(start, 500)
    document.fonts.ready.then(start)
    return () => { clearTimeout(fb); ctx && ctx.revert() }
  }, [])

  return (
    <section id="join" ref={root} className="relative px-5 py-16 sm:px-8 sm:py-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[30px] bg-night px-6 py-20 text-center sm:px-12 sm:py-28">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/3 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(47,107,255,.5), transparent 65%)', filter: 'blur(50px)' }}
        />
        <div className="relative mx-auto max-w-3xl">
          <p data-cta-fade className="eyebrow mb-7" style={{ color: 'rgba(255,255,255,.5)' }}>Early preview</p>
          <h2 ref={word} className="display text-[2.6rem] text-white sm:text-[4.4rem]">
            Start building on the canvas.
          </h2>
          <p data-cta-fade className="mx-auto mt-6 max-w-xl text-[1.05rem] leading-relaxed" style={{ color: 'rgba(255,255,255,.65)' }}>
            CodeCanvas AI is onboarding builders in small batches. Join the list.
          </p>

          <form
            data-cta-fade
            className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              const email = e.currentTarget.email.value.trim()
              if (!email) return
              window.location.href = `mailto:lokihaann@gmail.com?subject=${encodeURIComponent('CodeCanvas AI — preview access')}&body=${encodeURIComponent(`Please add me to the preview: ${email}`)}`
            }}
          >
            <input
              type="email" name="email" required placeholder="you@studio.com"
              className="w-full rounded-full border border-white/15 bg-white/10 px-5 py-3.5 text-white placeholder:text-white/45 outline-none backdrop-blur-md focus:border-white/50"
            />
            <button type="submit" className="btn btn-accent whitespace-nowrap">Join the preview</button>
          </form>
          <p data-cta-fade className="mt-4 font-mono text-[11px]" style={{ color: 'rgba(255,255,255,.4)' }}>
            Local-first · No spam · Leave anytime
          </p>
        </div>
      </div>
    </section>
  )
}
