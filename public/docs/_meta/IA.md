# CodeCanvas Docs — Information Architecture

The documentation is organized using a Diátaxis-influenced split (overview ->
explanation -> reference) plus a dedicated diagrams hub and a Swagger-style API
console. Each numbered page is owned by exactly one author/agent.

## Page map

| # | Page (file) | Scope | Owner |
| --- | --- | --- | --- |
| 00 | `00-overview.md` | What CodeCanvas is, philosophy (code = source of truth), the canvas↔code duality, the stack (VS Code OSS fork), repo layout, glossary | Architecture agent |
| 01 | `01-architecture.md` | System architecture, Electron process model (main / renderer / ext host / Design iframe stack), how the fork relates to upstream VS Code, where CodeCanvas code lives | Architecture agent |
| 02 | `02-design-environment.md` | The Design environment: entering the empty canvas, `codecanvasPreview` Design pane, the nested iframe stack, the Onlook React bundle, modes (Design/Preview) | Design Environment agent |
| 03 | `03-visual-editing-writeback.md` | Visual editing: inspector/preload (penpal), Moveable layer, convert-to-free-editing, html-writeback persistence, sync-engine, history/undo | Write-back agent |
| 04 | `04-ai-chat-multiagent.md` | Multi-agent AI chat: panel + agent selector/theming, per-agent routing, Claude CLI backend (agentHost/node/claude, child_process pipes, ProxyChannel), Copilot native path, sessions | AI Chat agent |
| 05 | `05-codecanvas-preview.md` | `codecanvasPreview` contrib internals: live preview, device switching, status bar, snapshots, designBridge, project analyzer, diffEngine | Preview agent |
| 06 | `06-cli.md` | The Rust CLI: command surface, tunnels, JSON-RPC / msgpack-RPC, serve-web, agent host, self-update | CLI agent |
| 07 | `07-core-platform-build.md` | Core platform (base/platform/workbench/editor), what changed vs VS Code, DI/services, build & watch pipeline (gulp, watch-client) | Architecture agent |
| 08 | `08-reusable-code.md` | Reusable code reference: shared utilities, services, design-editor components ported from React→native, how to reuse them | Reusable-code agent |
| 09 | `09-api-reference.md` | API reference (prose): IPC channels & ProxyChannel, DI services, commands, CLI RPC methods, penpal/design-editor API, html-writeback API | API agent |
| 10 | `10-diagrams.md` | Diagrams hub: the global legend, the mega system diagram, and a linked gallery of every per-subsystem diagram | Diagrams agent |

## Supporting artifacts
- `_meta/STYLE-GUIDE.md` — the writing + diagram contract (read first).
- `_meta/DOCUMENTATION-STANDARDS.md` — research: how large orgs document software + diagram design principles (Research agent).
- `_meta/PROGRESS.md` — orchestration tracker.
- `api/openapi.yaml` — OpenAPI 3 spec describing the API surface, rendered by the Swagger-style console (`/docs-api.html`).

## Viewer
- `public/docs.html` — the themed docs reader (sidebar nav from this map, renders markdown + Mermaid + code highlight). Matches the landing's paper/ink design.
- `public/docs-api.html` — Swagger UI console for `openapi.yaml`.

## Conventions for cross-links
- Link between pages with relative `?p=NN-name` query (the viewer reads `?p=`).
- When you mention another subsystem, link it once: `[AI chat](?p=04-ai-chat-multiagent)`.
