# CodeCanvas — Landing Rebuild Spec (below the video)

**Status:** Hero (`StageHero`) + scroll WebGL video (`VideoPanel`) are kept. Everything below
the video was deleted from `App.jsx` (Capabilities, CanvasCode, HowItWorks, FeaturedWork, CTA,
Footer — files remain on disk as reference). This is an **open-source project page**, not a
sales page. Build the new below-video sections from this spec.

Two subagents produced this: (1) OSS landing structure + copy, (2) Three.js animations.

---

# PART 1 — Structure & Copy (open-source voice)

## Research basis
Studied: Vite, Astro, Bun, Deno, Zed, Tauri, Trigger.dev, Coolify, Supabase, Biome, Cal.com,
plus Evil Martians' "100 dev-tool landing pages" study. Clearest finding: **OSS pages convert
with GitHub stars + a runnable install command + license + contributors + Discord/roadmap** —
not client logos, "join the list", or pricing language. The conversion action is "clone and
run", not "submit your email."

## A. Recommended structure (below the existing hero + video)
1. **Quickstart / Install** — "get it running right now" (replaces the deleted waitlist CTA). Primary OSS conversion. *(NEW component)*
2. **Canvas = Code (interactive demo)** — prove the core claim interactively. *(reuse `CanvasCode.jsx`)*
3. **How It Works** — 5-step workflow. *(reuse `HowItWorks.jsx`)*
4. **Capabilities** — real GIF proof per feature. *(reuse `Capabilities.jsx`)*
5. **Local-First / Privacy** — "nothing leaves your machine". *(reuse `Manifesto.jsx` privacy block)*
6. **Who It's For** — audience self-select. *(reuse `Manifesto.jsx` audience block)*
7. **Open Source / GitHub Community** — stars, license, contributors, Discord, roadmap. *(NEW — most important addition)*
8. **FAQ** — honest technical answers. *(reuse `Faq.jsx`, rewrite the "get access" item)*
9. **Footer** — links, license, wordmark. *(reuse `Footer.jsx`, 2 copy fixes + license line)*

## B. New / changed copy

### Section 1 — Quickstart / Install (NEW)
> **Install command below is a PLACEHOLDER — confirm the real one.** If it's an npm package use
> `npx`; if it's a cloned repo use git clone + npm install; if it's a binary, use a download
> button + "or build from source".

```
EYEBROW:   GET STARTED · OPEN SOURCE · MIT LICENSE
HEADLINE:  Clone it. Run it. It's yours.
SUBHEAD:   No account. No cloud subscription. No waitlist.

CODE BLOCK (dark, monospace, copy button):
  git clone https://github.com/USER/codecanvas
  cd codecanvas
  npm install
  npm run dev

TRUST LINE: Runs entirely on your machine — your files never leave it.
CTA ROW:    [★ Star on GitHub]   [Read the docs →]
```

### Section 7 — Open Source / Community (NEW, most important)
> Pre-launch: don't show a star count of ~0. Invite people to be among the first; swap in a live
> badge once it's meaningful (100+).

```
EYEBROW:   FREE · OPEN SOURCE · MIT LICENSE
HEADLINE:  Built in the open. For developers who build in the open.
BADGE ROW: [MIT License] [★ Star the repo] [Contributors / "Be one of the first"] [Discord]
BODY:      CodeCanvas is a personal open-source project — not a company, not a SaaS product,
           not a waitlist. The source is public, the roadmap is public, and every fix ships to
           everyone who runs it. Open an issue if something is broken. Send a PR if you have a
           fix. The codebase is readable React — no mysteries.
CONTRIBUTORS: avatar grid (GitHub contributors API) + "Want to see your face here? Check the
           open issues →"
CTA ROW:   [★ Star on GitHub]  [View Roadmap]  [Join Discord]
SPONSOR:   If CodeCanvas saves you time, consider sponsoring on GitHub Sponsors — it keeps the
           project maintained.  [GitHub Sponsors →]
```

### Reused-section copy tweaks
- **CanvasCode**: change label `'Try it free'` → `'Open it'` in the `LABELS` array.
- **HowItWorks** headline: `"From open project to AI hand-off."` → `"Open your project. Edit it live. Keep the real code."`
- **Capabilities** headline: `"Built for the way you actually work."` → `"Everything you'd want from a design tool. In real code."`
- **Faq**: replace the "How do I get access? / drop your email" item with: **"How do I run it?"** → "Clone the repo and `npm install && npm run dev` (see README for the exact command). No account, no API key to start. You only need a key for the AI features." Optionally add **"Can I contribute?"** → "Yes — repo is public, issues are open. PRs welcome."
- **Footer**: CTA `"Start building"` → `"★ Star on GitHub"`; nav links → `GitHub · Docs · Discord · Changelog · License`; legal line → add `· MIT License`.

## C. OSS elements to standardize (build once, reuse)
- **GitHub star CTA** (primary nav + footer): `★ Star on GitHub` → repo URL. Add a live count only once meaningful.
- **Install block**: dark panel, copy button, "Requires Node 18+. Runs entirely on your machine."
- **Local-first chips**: `Nothing leaves your machine` · `Local-first · No cloud · No account`.
- **License note**: `MIT License — free to use, modify, and distribute.`
- **Contributors block**: GitHub contributors API avatars; solo fallback: "Building this solo for now. Want to see your face here? → open issues".
- **Roadmap link**, **Discord/Issues/Discussions links**, **one-line sponsor note**.

## D. Surviving-section copy fixes (DONE in this pass)
- `StageHero` CTA `Start building` (→ broken `#join`) → **`Star on GitHub`** (placeholder repo URL, `target=_blank`). ✅
- `VideoPanel` paragraph: dropped "production-ready" + "from first sketch to shipped UI" sales arc → element-level, OSS wording. ✅
- `Nav.jsx` is **not mounted** (App imports only ScrollLine/StageHero/VideoPanel; the real header lives inside StageHero). Left untouched / effectively dead.

### Implementation notes
- Do **not** re-add `FeaturedWork` (its 5 clips already appear in VideoPanel + Capabilities) or `CTA` (email waitlist is incompatible with OSS).
- Reserve the `btn-ai` gradient for ONE primary accent; GitHub star can be plain `btn-dark`.
- In technical/community copy, prefer "CodeCanvas" over "CodeCanvas AI".

---

# PART 2 — Three.js / WebGL animations

## What the existing code gives you for free (stay on these rails)
- **`Ballpit.tsx` `X` class**: Three host with `IntersectionObserver` auto-pause, debounced `ResizeObserver`, DPR clamping (`min(devicePixelRatio, 2)`), full dispose chain ending in `renderer.forceContextLoss()`. Reuse for every new GL canvas.
- **`videoPanelGL.js`**: DOM-rect→world math (`pageToWorld`, `elLocalRect`, `rectToVec4`) + `ScrollTrigger.create → onUpdate → uniform` pipeline (`scrub`). New scroll-driven shader planes inherit this verbatim.
- **`smooth.js`**: Lenis `lerp 0.08` feeding `ScrollTrigger.update`; read scroll via `ScrollTrigger.getVelocity()`, never raw scroll.
- **`anim.js`**: `gsap.matchMedia` gated on `prefers-reduced-motion: no-preference` and `(min-width:768px) and (pointer:fine)`. All new GL must sit inside these gates or fall back to a static image.

## Concepts
1. **Particle Field Morph — "code becomes canvas"**: ~12k points drift in a noise field (raw "code"), then a scroll `uProgress` morphs them into a UI wireframe (rendered "canvas"), per-particle delay = compiler-pass flow. Pinned hero. **M**.
2. **Cursor-Reactive Displacement Grid — "inspect element"**: subdivided plane, simplex-noise Z displacement + Gaussian "well" under the cursor; CSS bracket overlay mimics a DevTools inspector. Features-section background. **S–M**.
3. **Scroll Shader Plane — "code ↔ canvas duality"** *(reuses `videoPanelGL.js` almost verbatim)*: one plane `mix()`-es a code texture and a UI texture via a diagonal scanline wipe driven by scroll; `getVelocity()` adds chromatic aberration. **S**.
4. **Instanced Code-Token Quads → UI wireframe**: 600 `InstancedMesh` quads textured with code tokens scatter→assemble into a UI card on scroll. "How it works". **M**.
5. **Glitch / CRT Terminal Reveal**: shader plane behind a headline — scanlines + barrel distortion + RGB split decaying on enter ("booting the IDE"). Use 1–2× max. **S**.
6. **3D Split Coin Flip — "source and visual are one object"**: two planes (code / UI) back-to-back, scroll scrubs a full Y flip; `MeshPhysicalMaterial` clearcoat + shared `RoomEnvironment` from Ballpit. **M–L**.

## Performance rules
- DPR clamp `max 2`; mobile force `1` and cut counts (concept 1: 12k→4k; concept 2: 120²→60²).
- One draw call each (Points / Mesh / InstancedMesh — never 600 meshes).
- Prefer uniform-driven shader animation over `BufferAttribute` updates (exception: concept 4).
- No GPGPU needed at these counts (available in the installed three if pushing 50k+).
- Mirror Ballpit's `IntersectionObserver` pause-offscreen on every canvas.
- `prefers-reduced-motion` / mobile / `hardwareConcurrency < 4` → skip GL, render a static PNG.
- Dispose chain: ScrollTrigger.kill → observers.disconnect → cancelAF → geometry/material/texture.dispose → renderer.dispose → forceContextLoss (reuse `X.clear()`).

## Build first (impact-to-effort)
1. **Concept 3** (shader plane) — reuses `videoPanelGL.js`, ~80 GLSL + ~60 JS lines, near-zero risk, states the metaphor centrally.
2. **Concept 1** (particle morph) — the memorable hero moment; M complexity, hosted by Ballpit's `X` class.
3. **Concept 2** (cursor displacement grid) — interactive features bg; one static draw call + pointer tracking + a CSS bracket overlay.

## References
Codrops (GPGPU particles 2024; cinematic GSAP 3D scroll 2025; on-scroll 3D text 2025),
Three.js Journey (GPGPU flow field), Frontend Horse (three + ScrollTrigger), GSAP demos
(threejs scroll waypoints), Ashima glsl-noise (inline simplex), clicktorelease (vertex
displacement).
