const stacks = ['HTML', 'React', 'Vue', 'Svelte', 'Next.js', 'Astro', 'Vite', 'Tailwind', 'TypeScript']

export default function TechStrip() {
  const row = [...stacks, ...stacks]
  return (
    <section className="relative overflow-hidden border-y border-line py-10">
      <p className="eyebrow mb-7 text-center">Drops into the project you already have</p>
      <div className="marquee-mask relative flex">
        <div className="flex shrink-0 animate-[strip_30s_linear_infinite] items-center gap-3 pr-3 hover:[animation-play-state:paused]">
          {row.map((s, i) => (
            <span key={i} className="chip shrink-0 text-sm">{s}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
