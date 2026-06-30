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
        <XRayS1 />
        <XRayS2 />
        <XRayS3 />
        <XRayS4 />
        <XRayS5 />
      </main>
    </>
  )
}
