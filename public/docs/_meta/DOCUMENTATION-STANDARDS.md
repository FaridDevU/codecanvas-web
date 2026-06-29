# Documentation Standards & Diagram Design

> Research reference for the CodeCanvas docs. **Part A** captures how large
> software organizations document their systems; **Part B** is a practical guide
> to diagrams that teach. This file explains the *why* behind our conventions;
> the enforceable *how* lives in [STYLE-GUIDE.md](./STYLE-GUIDE.md).

---

# Part A — How large projects document software

## A1. Diátaxis: four modes, never mixed

Diátaxis (Daniele Procida, grew out of the Django docs effort) says there are
four distinct kinds of documentation because users are in one of four states.
The core discipline is simple: **keep the four apart.** A page that tries to
teach, instruct, list facts, and explain at once does all four badly.

| Mode | User is... | Answers | Shape | Failure if mixed |
| --- | --- | --- | --- | --- |
| **Tutorial** | learning, beginner | "teach me by doing" | a lesson on rails, guaranteed to work | drowns in options/theory |
| **How-to guide** | working, competent | "help me do X" | recipe for one real goal | becomes a tutorial or a wall of caveats |
| **Reference** | working, needs a fact | "what exactly is Y" | dry, complete, consistent | opinions/steps leak in, can't be scanned |
| **Explanation** | studying, wants context | "why is it like this" | discursive, background, trade-offs | turns into to-do steps, loses the "why" |

Axes: tutorials/how-to are **action** (doing); reference/explanation are
**cognition** (knowing). Tutorials/explanation serve **study**; how-to/reference
serve **work**. Adopted by Django, Cloudflare, Canonical, Gatsby, Kubernetes.

## A2. Architecture documentation

### C4 model (Simon Brown) — zoom levels, not one mega-diagram
Like Google Maps for code: pick a zoom level for your audience.

| Level | Shows | Audience | Boxes are |
| --- | --- | --- | --- |
| 1 Context | system + users + neighboring systems | everyone, non-technical OK | people & systems |
| 2 Container | apps/services/datastores inside the system | technical, ops | deployable/runnable units |
| 3 Component | major parts inside one container | developers | modules/groupings |
| 4 Code | classes/functions (rarely hand-drawn) | the author, briefly | code elements |

Rule of thumb: most teams maintain L1 and L2 by hand, generate or skip L3/L4.

### arc42 — the 12-section template
A pragmatic, tool-agnostic skeleton for an architecture document: intro/goals,
constraints, context, solution strategy, building-block view, runtime view,
deployment view, crosscutting concepts, **architecture decisions**, quality
requirements, risks/technical debt, glossary. Pairs cleanly with C4 (use C4 for
the views) and docs-as-code.

### ADRs — Architecture Decision Records (Michael Nygard format)
One short, **immutable, numbered** Markdown file per significant decision, in the
repo (e.g. `docs/adr/0007-use-stream-json.md`). You don't edit a decision; you
supersede it with a new one. Captures the *why* that code can't.

```text
# N. <short title of decision>
Date: YYYY-MM-DD
Status: Proposed | Accepted | Superseded by ADR-12
## Context     (the forces: what's true, what pressures the choice)
## Decision    (active voice: "We will ...")
## Consequences (what becomes easier, what becomes harder)
```

### Docs as code
Treat docs like source: plain text (Markdown) in the repo, reviewed in pull
requests, built in CI, versioned with the code that they describe. Benefits:
diffable, revertable, blameable; docs change in the *same PR* as the code, so a
reviewer can confirm the docs still match reality. Diagrams-as-text (Mermaid,
PlantUML, D2) extend this to visuals and kill diagram doc-rot.

## A3. Artifacts a mature codebase ships

| Artifact | Diátaxis mode | Purpose | Owner moves on |
| --- | --- | --- | --- |
| **README** | mixed (entry) | what/why + fastest path to running | every release |
| **Architecture overview** | explanation | the big picture, C4 L1/L2 | major changes |
| **Per-subsystem deep-dives** | explanation + reference | how one area works, its flows | when the area changes |
| **API reference** | reference | every endpoint/param/error, generated where possible | per API change |
| **Code reference** | reference | public modules/services to reuse | per change |
| **Tutorials / onboarding / dev-setup** | tutorial | new contributor productive day one | when setup breaks |
| **How-to guides / runbooks** | how-to | do a task; operate/recover in prod | when ops change |
| **CHANGELOG** | reference | what changed, for humans (Keep a Changelog + SemVer) | every release |
| **Glossary** | reference | one definition per domain term | as vocabulary grows |
| **Security docs** | reference + how-to | threat model, reporting (SECURITY.md), secrets handling | as posture changes |

## A4. Admired docs and the one technique each nails

| Project | The technique to steal |
| --- | --- |
| **Stripe API** | Three-pane layout; runnable examples beside prose; live test keys and a language switcher so you copy-paste to success in ~30s. |
| **Twilio** | Task-based quickstarts that reach a working "hello world" fast, with credentials injected into copy-paste snippets. |
| **VS Code (wiki + CONTRIBUTING)** | An exhaustive, honest contributor guide + a "source code organization" wiki; the project is its own onboarding. |
| **Kubernetes** | Explicit Diátaxis split (Concepts / Tasks / Tutorials / Reference); concept pages teach the *why* before the *how*. |
| **React (react.dev)** | Inline runnable sandboxes; clean "Learn" vs "Reference" separation; "Pitfall" and "Note" callouts that pre-empt mistakes. |
| **The Rust Book** | Free, project-based long-form teaching, paired with runnable "Rust by Example" — learning by building, then by snippet. |
| **Django** | Tutorial-first ("write your first app") plus a hard topic-guides vs reference split — the docs that birthed Diátaxis. |
| **Supabase** | Framework-specific copy-paste quickstarts + auto-generated, project-aware client/API reference. |
| **Tailwind** | Searchable utility reference with copy-paste examples and live responsive previews next to each utility. |
| **GitLab Handbook** | Radically public, single-source-of-truth, version-controlled "handbook-first" docs — the company runs on the docs. |

Common thread: **low time-to-first-success**, runnable/real examples, ruthless
structure, and docs kept honest by living next to the code.

## A5. API documentation specifically

- **OpenAPI/Swagger.** Describe a REST API once in YAML/JSON (OpenAPI 3.1).
  Humans and machines read it; tools generate interactive docs (Swagger UI),
  server stubs, and client SDKs from the same spec — one source of truth.
- **The triad.** Good API docs ship three layers: **reference** (every endpoint,
  param, error — complete and dry), **guides** (task-oriented how-tos), and
  **examples** (copy-paste, real requests/responses). Reference alone is a parts
  list; guides + examples make it usable.
- **Interactive "try it".** A console that fires real calls against test
  credentials collapses the gap between reading and doing (Stripe Shell, Swagger
  "Try it out").
- **Versioning.** Version the API and the spec (SemVer or date strings like
  `2024-07-25`); keep old versions documented; mark deprecations with dates and
  migration notes. Generated SDKs/examples stay in sync because they derive from
  the versioned spec.

---

# Part B — Diagrams that teach (the priority)

A diagram is a teaching tool, not decoration. Every choice (shape, color, line,
position) should carry meaning. If it doesn't encode something, remove it.

## B1. Principles

- **One idea per diagram.** A component view *or* one flow — never both. If you
  need "and", you need two diagrams.
- **Progressive disclosure.** Overview first, detail on demand. Mirror C4: a
  small context picture, then drill in. Don't open with the 40-node monster.
- **Legend / key.** State what colors, shapes, and line styles mean — once,
  consistently, where the reader can see it. An unexplained convention is noise.
- **Consistent semantics.** The same color/shape means the same thing in *every*
  diagram in the set. Readers learn the legend once and then read fast.
- **Short labels.** 1-4 words per node; push detail to the prose. A node crammed
  with a sentence is a paragraph wearing a box.
- **Right-size it.** Aim ~6-18 nodes. More than that, split or zoom out.

## B2. Color: encode meaning, stay accessible

Color is a *channel*, not paint. Use it for **categorical encoding** — each hue =
one category of thing (UI vs data vs external). Decorative color teaches nothing
and adds load.

- **Cap the palette.** ~5-7 categories max. Beyond ~8, distinct, nameable colors
  effectively don't exist; group or split instead.
- **Never rely on color alone.** ~8% of men have red-green color vision
  deficiency. Always back color with a second channel: a label, shape, border
  style, or position. Color should *reinforce*, not *carry*, the message.
- **Test it.** Simulate protanopia, deuteranopia, tritanopia; check every
  category still separates. Verify it survives grayscale (printing, dark mode).

| Need | Use | Why |
| --- | --- | --- |
| Categorical (distinct types) | Okabe-Ito (CUD, 8 colors) or ColorBrewer Set2/Dark2 | validated colorblind-safe, nameable |
| Sequential (low→high) | Viridis | perceptually uniform, CVD- and grayscale-safe |
| Diverging (±, around a midpoint) | RdBu / PiYG / blue-orange | readable across CVD types |
| **Avoid** | red/green pairing, rainbow/jet | unreadable for ~8% of men; jet invents false edges |

## B3. Arrows and edges

- **Direction = meaning.** An arrow is "calls / sends to / flows to". Keep
  arrowheads consistent; don't mix "depends on" and "data flows" without saying
  so in the legend.
- **Solid vs dashed convention.** Common across the industry: **solid =
  synchronous / direct call**, **dashed = asynchronous / event / message /
  return**. Pick one convention and hold it everywhere.
- **Label cross-boundary edges.** Put the method, message, or event on the edge
  (`loadBundle()`, `postMessage 'select'`). An unlabeled arrow crossing a
  boundary is a bug — the reader can't tell what travels on it.
- **Reading order.** Lay edges so the eye flows one way (top-down or
  left-to-right). The primary "happy path" should be the straightest line.
- **Avoid crossing edges.** Crossings are the #1 readability killer; they often
  signal too much in one diagram or a real design smell. Re-layout to remove
  them; if two must cross, use a line-hop (bridge). If you can't uncross, split.

## B4. Layout

- **Group with boundaries.** Enclose related nodes in a labeled box/subgraph
  (a service, a process, "our boundary" vs "external"). Boundaries do half the
  explaining.
- **Hierarchy via position.** Higher/left = upstream, callers, entry points;
  lower/right = downstream, dependencies, data at rest. Be consistent.
- **Whitespace is structure.** Don't pack the canvas. Space separates groups and
  gives the eye rest; density reads as complexity.
- **Direction by intent.** Top-down (TD) for flows and call/decision trees;
  left-to-right (LR) only for genuine pipelines (input → stages → output).

## B5. Notation systems — when to use each

| Notation | Reach for it when | Keep it light because |
| --- | --- | --- |
| **C4** | showing system/architecture at a chosen zoom | it's the default for "where does this fit / what's inside" |
| **Sequence diagram** | request/response, handshakes, multi-turn protocols, ordering over time | best at "who talks to whom, in what order" |
| **Flowchart / activity** | decisions, branches, a process with conditions | great for logic; bad for structure |
| **UML (class/component)** | precise contracts, type relationships | full UML is heavy — use a light subset, not all 14 diagram types |

Most product docs need only C4-style structure diagrams + sequence diagrams +
the occasional flowchart. Reserve heavyweight UML for where precision pays.

## B6. Tooling

- **Mermaid.** Text-to-diagram (flowchart, sequence, class, state, ER, gitgraph)
  rendered from fenced code blocks in Markdown. It fits docs-as-code perfectly:
  diagrams are plain text, so they diff in PRs, revert, blame, and travel in the
  *same* commit as the code — which is what keeps them from going stale. It loses
  fine pixel control vs draw.io, which is the right trade for living docs.
- **Repo-to-Mermaid generation exists.** Tools like *gitdiagram* turn a GitHub
  repo's file tree + README into an interactive Mermaid architecture diagram via
  an LLM pass — useful as a *first draft* to curate, not a finished diagram.

---

## Checklist: is this diagram good?

- [ ] **One idea** — a single component view or a single flow, nothing more.
- [ ] **Right size** — roughly 6-18 nodes; if bigger, it's split or zoomed out.
- [ ] **Legend honored** — colors/shapes/lines match the shared, documented key.
- [ ] **Color encodes meaning** — categorical, ≤~7 hues, no decorative color.
- [ ] **Accessible** — survives colorblind simulation and grayscale; color is
      never the only signal.
- [ ] **Edges labeled** — every cross-boundary arrow names its call/message/event.
- [ ] **Line styles consistent** — solid=sync, dashed=async (or your documented convention).
- [ ] **Clean flow** — no crossing edges; one clear reading direction; happy path straightest.
- [ ] **Short labels** — 1-4 words per node; detail lives in the prose.
- [ ] **Earns its place** — the prose doesn't already say it better; nothing on
      the canvas is unexplained.

---

## How CodeCanvas applies this

The CodeCanvas docs operationalize this research:

- **IA** follows a Diátaxis-influenced split (overview → explanation →
  reference) plus a diagrams hub and an OpenAPI console — see
  [IA.md](./IA.md).
- **Diagrams** use Mermaid (docs-as-code) with a fixed **semantic color code**
  (UI / core / AI / data / external / bridge), labeled cross-boundary edges, and
  the solid=sync / dashed=async convention — exactly the Part B principles, made
  enforceable in **[STYLE-GUIDE.md](./STYLE-GUIDE.md)**.
- **Architecture pages** lean on C4-style component views per subsystem, with the
  mega/system view deferred to the diagrams hub (progressive disclosure).
- **API** ships as an OpenAPI spec rendered in a Swagger-style try-it console.

Read **[STYLE-GUIDE.md](./STYLE-GUIDE.md)** before writing any page or diagram —
it is the binding contract; this file is the reasoning behind it.

---

## Sources

- Diátaxis — https://diataxis.fr/start-here/
- C4 model (Simon Brown) — https://c4model.com/
- arc42 (sections, ADRs) — https://docs.arc42.org/section-9/ , https://arc42.org/overview
- ADRs (Nygard format, examples) — https://github.com/architecture-decision-record/architecture-decision-record
- Docs-as-code with Mermaid — https://dev.to/darkmavis1980/why-mermaid-is-the-best-way-to-document-your-architecture-in-the-ai-era-2dgb
- Stripe DX & docs teardown — https://www.moesif.com/blog/best-practices/api-product-management/the-stripe-developer-experience-and-docs-teardown/
- Kubernetes documentation (Diátaxis in practice) — https://kubernetes.io/docs/home/
- OpenAPI / Swagger — https://swagger.io/specification/
- Colorblind-friendly data viz (Okabe-Ito, ColorBrewer, viridis) — https://thenode.biologists.com/data-visualization-with-flying-colors/research/ , https://colorblind.io/guides/data-visualization
- UML/diagram best practice (crossing edges, sequence vs flowchart) — https://bellekens.com/2012/02/21/uml-best-practice-5-rules-for-better-uml-diagrams/
- Mermaid — https://github.com/mermaid-js/mermaid
- gitdiagram (repo → Mermaid) — https://github.com/ahmedkhaleel2004/gitdiagram
