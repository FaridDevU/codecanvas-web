import { useEffect } from 'react'
import { initSmoothScroll } from './lib/smooth'
import { initSiteAnim } from './lib/anim'
import ScrollLine from './components/ScrollLine'
import StageHero from './components/StageHero'
import VideoPanel from './components/VideoPanel'
import XRayS1 from './components/XRayS1'
import XRayS2 from './components/XRayS2'
import XRayS3 from './components/XRayS3'
import XRayS4 from './components/XRayS4'
import XRayS5 from './components/XRayS5'
import SectionSpine from './components/SectionSpine'
import SiteFooter from './components/SiteFooter'

export default function App() {
  useEffect(() => {
    const lenis = initSmoothScroll()
    const disposeAnim = initSiteAnim()
    return () => {
      disposeAnim?.()
      lenis?.destroy()
    }
  }, [])

  return (
    <>
      <main className="relative">
        {/* Cobalt ribbon threaded behind every section (z -1). */}
        <ScrollLine />
        <StageHero />
        <VideoPanel />
        {/* The whole S1–S5 story shares ONE spine (left col) + one main column.
            Single source of wayfinding — the per-section asides were removed. */}
        <div className="relative mx-auto flex max-w-[1180px] gap-7 px-[5vw] 2xl:max-w-[1320px]">
          <SectionSpine />
          <div className="min-w-0 flex-1">
            <XRayS1 />
            <XRayS2 />
            <XRayS3 />
            <XRayS4 />
            {/* visual bridge S4 → S5: scanline grammar carried into the brand resolve */}
            <span className="s-bridge" aria-hidden />
            <XRayS5 />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
