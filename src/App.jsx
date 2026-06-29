import { useEffect } from 'react'
import { initSmoothScroll } from './lib/smooth'
import { initSiteAnim } from './lib/anim'
import ScrollLine from './components/ScrollLine'
import StageHero from './components/StageHero'
import VideoPanel from './components/VideoPanel'

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
      </main>
    </>
  )
}
