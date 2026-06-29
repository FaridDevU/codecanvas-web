import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// One scroll-reveal pattern reused across sections: elements marked
// [data-reveal] rise + fade in as they enter. Keeps every section's motion
// consistent with the Hero without re-writing gsap.context each time.
// ponytail: single shared hook instead of per-component timelines.
export function useReveal() {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (reduced()) return
    const ctx = gsap.context(() => {
      // Scope to THIS root only — gsap.utils.toArray with a selector string is
      // NOT auto-scoped by gsap.context, so a bare '[data-reveal]' would make
      // every section's hook animate every other section's elements.
      const els = root.current ? root.current.querySelectorAll('[data-reveal]') : []
      gsap.utils.toArray(els).forEach((el) => {
        gsap.from(el, {
          y: 38,
          autoAlpha: 0,
          filter: 'blur(8px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return root
}
