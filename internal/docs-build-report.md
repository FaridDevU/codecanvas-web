# Reporte — Documentación CodeCanvas AI a nivel empresa

**Fecha:** 2026-06-28
**Alcance:** reconstruir el mega-diagrama al tamaño real del sistema y llevar el catálogo de APIs a una interfaz Swagger completa, nivel empresa. Recopilación hecha por agentes leyendo el código real (no inventado).

---

## 1. Mega-diagrama del sistema — RECONSTRUIDO

El anterior era demasiado pequeño (22 nodos) para representar el sistema real.

- **Antes:** 22 nodos / 26 aristas / 7 subgrafos.
- **Ahora:** ~90 nodos / ~120 aristas / **9 subgrafos por frontera de proceso** — `EXTERNAL`, `RUST CLI`, `ELECTRON-MAIN`, `AHP PROTOCOL`, `RENDERER · WORKBENCH`, `DESIGN BUNDLE (iframe)`, `USER PREVIEW (iframe anidado)`, `DISK`, `BUILD`.
- Construido con **8 agentes** mapeando cada subsistema desde el código real (291 nodos / 403 aristas en bruto), sintetizados en un solo diagrama coherente.
- Conserva el "spine" grueso del *design loop*: arrastrar elemento → `html-writeback` → `IFileService.writeFile` al `.html` real en disco → recién entonces live-patch del preview.
- Cada arista cruza frontera con su método/mensaje/canal real (paleta semántica ui/core/ai/data/ext/bridge).
- **Verificado:** renderiza limpio en el visor (`docs.html?p=10-diagrams`) — 122 grupos de nodos en el SVG, **0 errores** de Mermaid. Pan/zoom + Fullscreen + Fit funcionan a esa escala.

Archivo: `public/docs/10-diagrams.md` (sección "The whole system (mega diagram)").

## 2. Catálogo de APIs (Swagger) — EXPANDIDO A NIVEL EMPRESA

El catálogo OpenAPI ya existía (97 ops). Auditado contra el código y completado.

- **Antes:** 97 operaciones / 7 tags.
- **Ahora:** **352 operaciones / 18 tags / 149 component schemas** — OpenAPI **3.0.3**, versión **2.0.0**, validado limpio por `openapi-spec-validator` (sin `$ref` rotos, sin operationIds duplicados, sin tabs).
- Construido con **7 agentes** auditando+enumerando cada superficie desde el código (349 ops relevadas: 255 nuevas, 7 correcciones).
- **Tags agrupados** vía `x-tagGroups` en 5 secciones: **Electron IPC**, **AI / Agent Host**, **Workbench Commands**, **Design Editor**, **Rust CLI**.
- Superficies nuevas modeladas (antes ausentes): **Agent Host Protocol (AHP)** — 8 familias de canal (Lifecycle, Root, Session, Terminal, Changeset, Resource, Resource Watch, OTLP, ~97 ops); **Design Bridge (workbench)** (17); **Editor Engine** (23); **CLI Commands** (23).
- Cada operación tiene: `operationId`, `tags`, `summary`, `description`, `requestBody` (schema), respuesta `200` (schema), respuesta `default` (error compartido `ResponseError`) y `x-source` con el `file:line` real. 18 cuerpos de ejemplo.
- `externalDocs` enlaza a la referencia en prosa (`docs.html`).
- **Verificado:** renderiza limpio en la consola Swagger (`docs-api.html`) — **352 opblocks, 18 secciones de tag, 0 errores** de consola. Título "CodeCanvas Internal API 2.0.0 OAS 3.0".

Archivos: `public/docs/api/openapi.yaml` (13.771 líneas). Respaldo del original 97-ops en scratchpad (`openapi.orig.yaml`).

### Conteo por tag
IPC Channels 34 · Services 40 · Commands 18 · Agent Host (Claude) 3 · AHP Lifecycle 10 · AHP Resource 9 · AHP Root 10 · AHP Session 44 · AHP Terminal 13 · AHP Changeset 6 · AHP Resource Watch 2 · AHP Telemetry (OTLP) 3 · Design Bridge (penpal) 46 · HTML Write-back 20 · Design Bridge (workbench) 17 · Editor Engine 23 · CLI RPC 31 · CLI Commands 23.

### Correcciones aplicadas (7)
`codecanvas.preview.choosePage` (flag `_forceChoosePage` sin uso) · `penpal onWindowMutated` (payload `{added, removed}` real) · `penpal moveElement` (firma `(domId, newIndex)`) · `penpal insertImage` (no-op tipado, ruta real = `insertElement`) · `cliRpc stream_data` / `stream_ended` (auto-registrados por RpcBuilder, notificación, sin auth) · `cliRpc streams_started` (notificación saliente server→client).

### Omitidos a propósito (para no inventar endpoints)
`cc.gh.viewPhoto` (acción de menú contextual, no registrada) · `workbench.action.toggleWindowAlwaysOnTop` (item de menú sobre comando stock de VS Code) · `codecanvas.preview.startDevServer` (id de correlación de terminal, no comando).

## 3. Sincronización de referencias cruzadas

- `09-api-reference.md`: conteos actualizados (18 tags / 352 ops), secciones de prosa nuevas para AHP, Design Bridge (workbench), Editor Engine y CLI Commands.
- `_meta/PROGRESS.md`: totales actualizados (mega-diagrama + 352 ops / 18 tags / 149 schemas).
- `dist/` reconstruido con `npm run build` — la carpeta desplegada refleja todo (353 `operationId`, 122 nodos mega, 4 superficies nuevas, ambos consoles presentes).

## 4. Cómo verlo

```
cd "Nueva carpeta"
npm run dev          # o: npm run preview  (usa dist/)
```
- Docs:    `http://localhost:<puerto>/docs.html`
- Mega:    `http://localhost:<puerto>/docs.html?p=10-diagrams`
- Swagger: `http://localhost:<puerto>/docs-api.html`

## 5. Pendiente (opcional, no bloqueante)

- Click-through manual de las 11 páginas en navegador real (el visor y la consola ya fueron verificados headless; esto es solo confirmación visual humana).
- Si en el futuro se agregan superficies (p. ej. nuevas familias AHP), re-correr el flujo de relevamiento por agentes y re-autorizar el spec.

**Estado: completo a nivel empresa.** Mega-diagrama y catálogo Swagger reconstruidos desde el código real y verificados renderizando sin errores.
