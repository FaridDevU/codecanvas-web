import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { mountVideoPanelGL } from '../lib/videoPanelGL'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const VIDEO = '/media/codecanvas-overview.mp4' // the full reel (for the play button, later)

// Small product clips the panel teases (cycled). Full reel stays behind the button.
const CLIPS = [
  '/media/clips/04-live-preview.webm',
  '/media/clips/01-edit-text.webm',
  '/media/clips/03-send-to-ai.webm',
  '/media/clips/02-device-switch.webm',
  '/media/clips/05-inspect-elements.webm',
]

// A gutter rail (dark, on the paper gutter above/below the video). At rest: "+"
// registration marks. When the PLAY button is hovered (`active`): a "▶▶▶ PLAY REEL"
// MARQUEE that scrolls — `dir="fwd"` advances, `dir="rev"` recedes, so the top and
// bottom rails move in opposite directions.
function Rail({ className = '', active = false, dir = 'fwd' }) {
  const strip = Array.from({ length: 8 }).map((_, i) => (
    <span key={i} className="whitespace-nowrap px-[1.4vw]">▶▶▶ Play reel</span>
  ))
  return (
    <div className={`absolute inset-x-1 overflow-hidden text-ink-2 ${className}`}>
      <div className={`flex justify-between text-[14px] leading-none transition-opacity duration-300 ${active ? 'opacity-0' : 'opacity-100'}`}>
        {Array.from({ length: 7 }).map((_, i) => <span key={i}>+</span>)}
      </div>
      <div className={`absolute inset-x-0 top-0 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}>
        <div
          className="flex w-max text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ animation: `marquee-${dir} 16s linear infinite` }}
        >
          {strip}
          {strip}
        </div>
      </div>
    </div>
  )
}

// Lusion's "video panel", ported for real: huge left headline + right paragraph,
// and a WebGL video (videoPanelGL) that grows from a small start rect to a big
// centred end rect as you scroll. The two empty #video-panel-* divs are the
// anchors the shader measures; the actual pixels are drawn on a fixed canvas.
export default function VideoPanel() {
  const headline = useRef(null)
  const canvas = useRef(null)
  const reelOverlay = useRef(null)
  const playBtn = useRef(null)
  const fullVideo = useRef(null)
  const [shown, setShown] = useState(false)
  const [playHover, setPlayHover] = useState(false)
  const [reelOpen, setReelOpen] = useState(false)
  // Custom player state (lusion-style fullscreen reel — no native controls).
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0) // 0..1
  const [cursorIn, setCursorIn] = useState(false)
  const cursorEl = useRef(null)
  const cursorTarget = useRef({ x: 0, y: 0 }) // where the mouse is
  const cursorPos = useRef({ x: 0, y: 0 })    // where the blob is (lags)
  const cursorStretch = useRef(0)             // smoothed squish amount

  // Click the PLAY ▷ REEL → play the FULL reel (overview.mp4) with sound. Started in
  // the click gesture so audio is allowed; the modal is always mounted (hidden, not
  // display:none) so the gesture has a video to start.
  const openReel = () => {
    const v = fullVideo.current
    if (v) { v.currentTime = 0; v.muted = false; setMuted(false); v.play().catch(() => {}) }
    setReelOpen(true)
  }
  const closeReel = () => {
    if (fullVideo.current) fullVideo.current.pause()
    setReelOpen(false)
  }
  const togglePlay = () => {
    const v = fullVideo.current
    if (!v) return
    if (v.paused) v.play().catch(() => {}); else v.pause()
  }
  const toggleMute = () => {
    const v = fullVideo.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }
  const seek = (e) => {
    const v = fullVideo.current
    if (v && v.duration) v.currentTime = Number(e.target.value) * v.duration
  }
  useEffect(() => {
    if (!reelOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeReel()
      else if (e.key === ' ') { e.preventDefault(); togglePlay() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reelOpen])

  // Soft trailing cursor: the × blob follows the mouse slowly (exponential ease, no
  // bounce → smooth) and stretches a little toward the mouse while it's catching up
  // (jelly), easing back to a clean circle when it arrives. rAF writes the transform
  // straight to the node — no per-frame React.
  useEffect(() => {
    if (!reelOpen) return
    let raf
    const ease = 0.075 // lower = slower, lazier trail
    const tick = () => {
      const p = cursorPos.current, t = cursorTarget.current
      p.x += (t.x - p.x) * ease
      p.y += (t.y - p.y) * ease
      const dx = t.x - p.x, dy = t.y - p.y
      const lag = Math.min(Math.hypot(dx, dy) / 220, 1)   // 0..1 by how far behind
      cursorStretch.current += (lag - cursorStretch.current) * 0.1 // smooth in/out
      const s = cursorStretch.current * 0.3                // max ~30% stretch — subtle
      const angle = Math.atan2(dy, dx) * 180 / Math.PI
      const el = cursorEl.current
      if (el) el.style.transform =
        `translate(${p.x}px, ${p.y}px) translate(-50%,-50%) rotate(${angle}deg) scale(${1 + s},${1 - s * 0.6}) rotate(${-angle}deg)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reelOpen])

  // Headline rises in when it scrolls into view (once).
  useLayoutEffect(() => {
    if (reduced()) { setShown(true); return }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } },
      { threshold: 0.5 },
    )
    if (headline.current) io.observe(headline.current)
    return () => io.disconnect()
  }, [])

  // Mount the WebGL panel (desktop only — needs the anchor layout + is heavy).
  useEffect(() => {
    if (reduced() || window.matchMedia('(max-width: 767px)').matches) return
    if (!canvas.current) return
    // wait a tick so fonts/layout settle before measuring the anchors
    let dispose
    const id = requestAnimationFrame(() => {
      dispose = mountVideoPanelGL(canvas.current, CLIPS, {
        tint: 0x6a6aff,
        // Show the overlay ONLY when the plane is fully flat & centred. The shader's
        // per-vertex tilt only returns to 0 at progress 1, so anything earlier shows
        // the overlay over a still-tilted video. Fade in over [0.93,1], and fade out
        // again via `follow` as the settled plane scrolls away.
        onProgress: (p, follow = 0, holdPx = 0) => {
          const el = reelOverlay.current
          if (!el) return
          const settle = Math.max(0, Math.min(1, (p - 0.93) / 0.07))
          el.style.opacity = String(settle)
          // keep the overlay locked onto the plane while it's held centred, then
          // it rides off-screen together with the video as you scroll past.
          el.style.transform = `translateY(${holdPx}px)`
          // ONLY the play button is interactive, and only when the reel is settled —
          // so the hover fill/marquee fire over the button, not the whole video.
          const btn = playBtn.current
          if (btn) btn.style.pointerEvents = settle > 0.85 ? 'auto' : 'none'
        },
      })
    })
    return () => { cancelAnimationFrame(id); dispose?.() }
  }, [])

  return (
    <>
      {/* The video is rendered here, in viewport space, over the page bg but under
          the text (z-1). Transparent except where the plane is on screen. */}
      <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[1] hidden md:block" />

      <section id="video-panel-section" className="relative flex flex-col px-[5vw] pt-[19vh] pb-[10vh] font-grotesk">
        {/* Huge headline, top-left (masked reveal). */}
        <div ref={headline} className="about-headers relative z-10 pb-[10vh]">
          <div className="h1-clip">
            <h2 className={`h1-topline${shown ? ' animate' : ''}`}>Design it live,</h2>
          </div>
          <div className="h1-clip">
            <h2 className={`h1-tagline${shown ? ' animate' : ''}`}>keep the real code.</h2>
          </div>
        </div>

        {/* Right paragraph column + CTA pill (lusion's "Our approach"). */}
        <div className="about-paragraphs relative z-10 flex flex-col items-end pb-[10vh]">
          <div className="w-full md:w-[42vw]">
            <p className="text-[1.9rem] font-medium leading-[1.35] text-ink-2 [text-wrap:balance]">
              CodeCanvas is a local-first, open-source design IDE. Edit any element on
              the live canvas — font, color, layout — and the change writes back to your
              actual source files. No throwaway prototypes, no translation gap between
              what you see and what ships.
            </p>
            <button className="mt-7 inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-5 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink">
              <span className="dot" style={{ background: 'var(--color-accent)' }} />
              Watch overview
            </button>
          </div>
        </div>

        {/* GL anchors (desktop). Empty — the shader measures these rects.
            START = small, left, 16:9. END = full width, 70vh, centred. */}
        <div id="video-panel-start" className="hidden aspect-video w-1/2 md:block" />
        {/* Reserve box kept SHORT (h-25vh) so there's little dead scroll after the
            video — the 70vh video height is now fixed on #video-panel-end itself, not
            inherited from this box (that decoupling is what removes the "3 scrolls to
            get out" trailing). top offset keeps the video's centred position the same. */}
        <div id="video-panel-end-parent" className="relative z-10 mx-auto mb-[8vh] mt-[20vh] hidden h-[25vh] w-full md:block">
          <div id="video-panel-end" className="absolute top-[-45vh] h-[70vh] w-full">
            {/* PLAY ▷ REEL overlay (lusion). Hidden until the video is fully flat &
                centred (gated in onProgress). The "+ / ▶▶▶ PLAY REEL" rails live in
                the page gutters ABOVE and BELOW the video (dark on the paper bg, not
                white-on-video). '+' at rest, ticker on hover. */}
            <div ref={reelOverlay} className="pointer-events-none absolute inset-0 opacity-0">
              <Rail className="bottom-full mb-3" active={playHover} dir="fwd" />

              {/* Centre the button, but ONLY the PLAY ▷ REEL lockup is the hover/click
                  target — NOT the whole video. The wrapper is pointer-events-none; the
                  button's own pointer-events is toggled on by onProgress when settled.
                  Hover → pill grows + fills bottom→top with AI gradient + rails marquee.
                  Click → full reel with sound. */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <button
                ref={playBtn}
                type="button"
                onMouseEnter={() => setPlayHover(true)}
                onMouseLeave={() => setPlayHover(false)}
                onClick={openReel}
                aria-label="Play the reel with sound"
                className="pointer-events-none flex cursor-pointer items-center gap-[2.5vw] text-white"
                style={{ textShadow: '0 1px 22px rgba(0,0,0,.45)' }}
              >
                <span className="font-medium tracking-[0.1em]" style={{ fontSize: 'clamp(2.2rem,5.5vw,5.5rem)' }}>PLAY</span>
                <span
                  className="relative flex items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_8px_30px_-8px_rgba(0,0,0,.4)] transition-transform duration-300 ease-out"
                  style={{
                    width: 'clamp(74px,7.5vw,128px)',
                    height: 'clamp(46px,4.6vw,80px)',
                    transform: playHover ? 'scale(1.12)' : 'scale(1)',
                  }}
                >
                  <span
                    className="ai-fill absolute inset-x-0 bottom-0"
                    style={{ height: playHover ? '100%' : '0%', transition: 'height .7s cubic-bezier(.4,0,.2,1)' }}
                  />
                  <svg
                    viewBox="0 0 24 24"
                    className="relative ml-[6%] h-[38%]"
                    style={{ color: playHover ? '#fff' : '#34373f', transition: 'color .35s' }}
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M6 4 L19 12 L6 20 Z" />
                  </svg>
                </span>
                <span className="font-medium tracking-[0.1em]" style={{ fontSize: 'clamp(2.2rem,5.5vw,5.5rem)' }}>REEL</span>
              </button>
              </div>

              <Rail className="top-full mt-3" active={playHover} dir="rev" />
            </div>
          </div>
        </div>

        {/* Mobile fallback: a plain video (no WebGL on phones). Tap → full reel + sound. */}
        <button onClick={openReel} className="mt-10 block w-full overflow-hidden rounded-2xl shadow-[0_30px_80px_-40px_rgba(20,30,90,.5)] md:hidden">
          <video className="aspect-video w-full object-cover" autoPlay muted loop playsInline>
            <source src={VIDEO} type="video/mp4" />
          </video>
        </button>
      </section>

      {/* Full reel — custom fullscreen player (lusion). No native controls: PLAY left,
          scrubber centre, MUTE right; the video fills the screen and click-to-close,
          with a circular × cursor over it. Always mounted (hidden, not display:none) so
          the open click can start playback with audio. */}
      <div
        className="reel-modal fixed inset-0 z-[100] bg-black"
        style={{ opacity: reelOpen ? 1 : 0, visibility: reelOpen ? 'visible' : 'hidden', pointerEvents: reelOpen ? 'auto' : 'none' }}
      >
        <video
          ref={fullVideo}
          src={VIDEO}
          playsInline
          onClick={closeReel}
          onMouseMove={(e) => {
            cursorTarget.current = { x: e.clientX, y: e.clientY }
            if (!cursorIn) setCursorIn(true)
          }}
          onMouseLeave={() => setCursorIn(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setProgress(e.target.duration ? e.target.currentTime / e.target.duration : 0)}
          className="reel-video h-full w-full object-cover"
        />

        {/* Soft × blob that trails the mouse (transform driven by the rAF loop). */}
        <div
          ref={cursorEl}
          className="reel-cursor pointer-events-none fixed left-0 top-0 z-[101] flex h-[78px] w-[78px] items-center justify-center rounded-full bg-white"
          style={{ opacity: cursorIn ? 1 : 0, transition: 'opacity .3s' }}
        >
          <svg viewBox="0 0 24 24" className="h-[34%] w-[34%] text-ink" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
            <path d="M5 5 L19 19 M19 5 L5 19" />
          </svg>
        </div>

        {/* Bottom bar: PLAY · scrubber · MUTE. Its own pointer events; doesn't close. */}
        <div
          className="absolute inset-x-0 bottom-0 z-[102] flex items-center gap-6 px-8 pb-7 pt-16"
          onMouseEnter={() => setCursorIn(false)}
        >
          <button
            type="button"
            onClick={togglePlay}
            className="shrink-0 text-xs font-semibold uppercase tracking-[0.22em] text-white/90 transition-colors hover:text-white"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step="any"
            value={progress}
            onChange={seek}
            aria-label="Seek"
            className="reel-range w-full"
            style={{ background: `linear-gradient(to right, #fff ${progress * 100}%, rgba(255,255,255,.25) ${progress * 100}%)` }}
          />
          <button
            type="button"
            onClick={toggleMute}
            className="shrink-0 text-xs font-semibold uppercase tracking-[0.22em] text-white/90 transition-colors hover:text-white"
          >
            {muted ? 'Unmute' : 'Mute'}
          </button>
        </div>
      </div>
    </>
  )
}
