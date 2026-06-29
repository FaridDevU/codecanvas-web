import { useEffect, useRef, useState } from 'react'

// SHOW, don't tell: a split panel that proves "edit the design = real code".
// LEFT = a live, selected CTA component on a design canvas. RIGHT = the JSX that
// renders it, hand-highlighted (no editor lib). Three controls — radius, accent,
// label — re-render the component AND update + flash the matching code line.
// Coarse-pointer / mobile / reduced-motion: auto-cycle the edits (attract loop)
// until the visitor touches a control. Pure React state, no dependencies.

const SWATCHES = ['#2f3df5', '#0c0d10', '#12a150', '#ef6351']
const LABELS = ['Start building', 'Get started', 'Open it']

// code token palette (calm, cobalt-led) for the dark code pane
const COL = {
  kw: '#7da0ff', fn: '#9bc1ff', tag: '#7da0ff', attr: '#aab1c4',
  prop: '#d4d9e3', str: '#76d6c2', num: '#e6b072', pu: '#7c8290',
  sp: '#7c8290', txt: '#eef1f6',
}

// each line = list of [tokenType, text]; flashKeys maps line index → control key
const buildLines = (cfg) => [
  [['kw', 'function'], ['sp', ' '], ['fn', 'CTA'], ['pu', '() {']],
  [['sp', '  '], ['kw', 'return'], ['sp', ' '], ['pu', '(']],
  [['sp', '    '], ['tag', '<button']],
  [['sp', '      '], ['attr', 'style'], ['pu', '={{']],
  [['sp', '        '], ['prop', 'background'], ['pu', ': '], ['str', `'${cfg.accent}'`], ['pu', ',']],
  [['sp', '        '], ['prop', 'borderRadius'], ['pu', ': '], ['num', String(cfg.radius)], ['pu', ',']],
  [['sp', '        '], ['prop', 'padding'], ['pu', ': '], ['str', "'14px 22px'"], ['pu', ',']],
  [['sp', '      '], ['pu', '}}']],
  [['sp', '    '], ['tag', '>']],
  [['sp', '      '], ['txt', cfg.label]],
  [['sp', '    '], ['tag', '</button>']],
  [['sp', '  '], ['pu', ')']],
  [['pu', '}']],
]
const FLASH_KEYS = [null, null, null, null, 'accent', 'radius', null, null, null, 'label', null, null, null]

export default function CanvasCode() {
  const [cfg, setCfg] = useState({ radius: 16, accent: '#2f3df5', label: 'Start building' })
  const [flash, setFlash] = useState(null)
  const [paused, setPaused] = useState(false)
  const flashTimer = useRef()

  // update a value + briefly flash its code line
  const edit = (patch, key) => {
    setCfg((c) => ({ ...c, ...patch }))
    setFlash(key)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 900)
  }
  const stop = () => setPaused(true) // hand control to the visitor on first touch

  // attract loop where dragging is awkward (touch) or motion is reduced
  useEffect(() => {
    const auto =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(max-width: 767px)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!auto || paused) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let t = 0
    const id = setInterval(() => {
      const step = t % 3
      if (step === 0) edit({ radius: [16, 4, 26, 10][Math.floor(t / 3) % 4] }, 'radius')
      else if (step === 1) edit({ accent: SWATCHES[Math.floor(t / 3) % SWATCHES.length] }, 'accent')
      else edit({ label: LABELS[Math.floor(t / 3) % LABELS.length] }, 'label')
      t++
    }, reduce ? 2200 : 1500)
    return () => clearInterval(id)
  }, [paused])

  useEffect(() => () => clearTimeout(flashTimer.current), [])

  const lines = buildLines(cfg)

  return (
    <section id="live" className="relative px-5 py-24 font-grotesk sm:px-8 sm:py-32">
      {/* soft cobalt depth glow behind the panel (shape, not a box) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(47,61,245,.10), transparent 65%)', filter: 'blur(50px)' }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <p className="eyebrow mb-5">Canvas = code</p>
          <h2 data-split className="display text-[2.4rem] sm:text-[3.6rem]">
            Edit the design. <span className="text-accent">It&apos;s already real code.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ink-2">
            Change it on the canvas — radius, colour, label. The source on the right
            updates in the same breath. No handoff, no redraw.
          </p>
        </div>

        {/* The split panel */}
        <div className="grid overflow-hidden rounded-[30px] border border-line bg-white shadow-[0_1px_2px_rgba(12,13,16,.04),0_40px_90px_-50px_rgba(20,30,90,.30)] lg:grid-cols-2">
          {/* ---------- LEFT: live canvas ---------- */}
          <div className="dotgrid relative flex min-h-[460px] flex-col p-7 sm:p-9">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Canvas</p>
              <span className="chip text-[10px]">
                <span className="dot" style={{ background: cfg.accent }} /> button — selected
              </span>
            </div>

            {/* the live component, wrapped in a design-tool selection box */}
            <div className="grid flex-1 place-items-center py-8">
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={stop}
                  className="font-sans text-[1.05rem] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(20,30,90,.5)] transition-[border-radius,background-color] duration-300"
                  style={{ background: cfg.accent, borderRadius: cfg.radius, padding: '14px 22px' }}
                >
                  {cfg.label}
                </button>
                {/* selection outline + corner handles */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-2 rounded-[12px]"
                  style={{ outline: '1.5px dashed rgba(47,61,245,.65)' }}
                />
                {[
                  '-left-2.5 -top-2.5', '-right-2.5 -top-2.5',
                  '-left-2.5 -bottom-2.5', '-right-2.5 -bottom-2.5',
                ].map((p) => (
                  <span
                    key={p}
                    aria-hidden
                    className={`pointer-events-none absolute ${p} h-2.5 w-2.5 rounded-[2px] bg-white`}
                    style={{ border: '1.5px solid #2f3df5' }}
                  />
                ))}
              </div>
            </div>

            {/* ---------- controls (editing the design) ---------- */}
            <div className="rounded-2xl border border-line bg-paper/70 p-4 backdrop-blur-sm">
              {/* radius */}
              <div className="flex items-center gap-3">
                <span className="eyebrow w-16 shrink-0">Radius</span>
                <input
                  type="range" min="2" max="28" value={cfg.radius}
                  onChange={(e) => edit({ radius: +e.target.value }, 'radius')}
                  onPointerDown={stop}
                  className="h-1 flex-1 cursor-pointer accent-[#2f3df5]"
                  aria-label="Corner radius"
                />
                <span className="w-10 shrink-0 text-right font-mono text-xs text-ink-2">{cfg.radius}px</span>
              </div>
              {/* accent */}
              <div className="mt-3 flex items-center gap-3">
                <span className="eyebrow w-16 shrink-0">Accent</span>
                <div className="flex gap-2">
                  {SWATCHES.map((c) => (
                    <button
                      key={c} type="button" aria-label={`Accent ${c}`} aria-pressed={cfg.accent === c}
                      onClick={() => { stop(); edit({ accent: c }, 'accent') }}
                      className="h-6 w-6 rounded-full transition-transform duration-200 hover:scale-110"
                      style={{ background: c, boxShadow: cfg.accent === c ? '0 0 0 2px #fff, 0 0 0 4px #2f3df5' : '0 0 0 1px rgba(12,13,16,.12)' }}
                    />
                  ))}
                </div>
              </div>
              {/* label */}
              <div className="mt-3 flex items-center gap-3">
                <span className="eyebrow w-16 shrink-0">Label</span>
                <div className="flex flex-wrap gap-1.5">
                  {LABELS.map((l) => (
                    <button
                      key={l} type="button" aria-pressed={cfg.label === l}
                      onClick={() => { stop(); edit({ label: l }, 'label') }}
                      className={`rounded-full px-3 py-1 font-mono text-[11px] transition-colors ${
                        cfg.label === l ? 'bg-ink text-white' : 'border border-line bg-white text-ink-2 hover:border-ink'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ---------- RIGHT: code ---------- */}
          <div className="relative flex flex-col border-t border-line bg-[#0d0f14] lg:border-l lg:border-t-0" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-mono text-[11px] text-white/40">CTA.jsx</span>
              <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                <span className="dot h-1.5 w-1.5" style={{ background: '#28c840' }} /> live
              </span>
            </div>

            <div className="overflow-x-auto px-2 py-5 font-mono text-[13px] leading-[1.95]">
              {lines.map((toks, i) => {
                const lit = flash && FLASH_KEYS[i] === flash
                return (
                  <div
                    key={i}
                    className="flex px-3"
                    style={{
                      background: lit ? 'rgba(47,61,245,.16)' : 'transparent',
                      boxShadow: lit ? 'inset 3px 0 0 #2f3df5' : 'inset 3px 0 0 transparent',
                      transition: 'background-color .5s ease, box-shadow .5s ease',
                    }}
                  >
                    <span className="mr-4 select-none text-right text-white/20" style={{ width: '1.4em' }}>{i + 1}</span>
                    <span className="whitespace-pre">
                      {toks.map((tk, j) => (
                        <span key={j} style={{ color: COL[tk[0]] }}>{tk[1]}</span>
                      ))}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
