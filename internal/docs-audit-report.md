# Auditoría de Documentación Enterprise — CodeCanvas AI

**Fecha:** 2026-06-28 · **Alcance:** `public/docs/00..06`, `09-api-reference` (vía `api/openapi.yaml`), `10-diagrams` · **Método:** auditoría por página + verificación adversarial contra el código real, auditoría profunda OpenAPI y auditoría del mega-diagrama. Dos afirmaciones de columna vertebral re-verificadas en vivo en esta síntesis (`cliModelsContribution.ts:68-70`, `cliAgentMainService.ts:72/137`).

---

## 1. Veredicto ejecutivo

La documentación de CodeCanvas AI es **redaccionalmente sólida y de alta fidelidad dentro de su alcance declarado**: las citas `file:line` resuelven casi siempre al símbolo exacto, el OpenAPI tiene **cero operaciones alucinadas** sobre ~305 operaciones muestreadas, y el mega-diagrama está bien formado (122 nodos = 122 ids, 0 nodos fantasma, 0 huérfanos) y modela correctamente el bucle de write-back de Design de extremo a extremo.

Sin embargo, **no está a nivel enterprise** por tres motivos estructurales:

1. **Una afirmación técnica de columna vertebral está invertida y se repite en varias páginas.** Tanto el glosario del overview como la página de arquitectura y el diagrama atribuyen el backend del chat de IA a `src/vs/platform/agentHost`. El chat real enruta por `platform/cliAgent → NativeCliAgentService`, que lanza el CLI con **pipes de `child_process` (no un PTY, no agentHost)**. Además, Copilot se describe como proceso hijo spawneado cuando el código comenta explícitamente lo contrario. Es el dato más load-bearing de toda la documentación y está mal en tres sitios.
2. **Faltan secciones enterprise enteras:** no hay tratamiento de seguridad/frontera de confianza, modos de permiso del agente (con un default sensible a seguridad), autenticación/identidad GitHub, telemetría (app y CLI), límites operativos consolidados, ni despliegue/topología.
3. **El catálogo OpenAPI, aunque exacto, cubre solo ~25 % de la superficie real** de servicios y comandos del producto (toda la superficie `src/vs/sessions`, ~105 command IDs, está ausente), y la descripción del tag *Commands* implica completitud que no tiene.

A favor del producto: las inexactitudes son **corregibles y bien localizadas**, no hay invención de funcionalidad, y la base de evidencia es trazable. Con el plan de la sección 7 (sobre todo P0 + las secciones enterprise P1), la suite alcanza nivel enterprise en un esfuerzo acotado.

### Puntuación de preparación enterprise: **64 / 100**

| Dimensión | Nota | Comentario |
|---|---|---|
| Exactitud de lo escrito | 80 | Alta fidelidad de citas, pero una inversión arquitectónica sistémica y una inversión en el CLI |
| Completitud vs producto real | 58 | Faltan módulos enteros (cliAgent, DesignEditorBridge, analyzer, title-bar) y superficie OpenAPI |
| Secciones enterprise | 40 | Sin seguridad/auth/telemetría/límites/despliegue consolidados |
| Trazabilidad / evidencia | 88 | Citas `file:line` casi siempre exactas; cero alucinaciones OpenAPI |
| Diagramas | 82 | Mega-diagrama correcto y válido, con correcciones puntuales y nodos faltantes |

**enterpriseReady: false.**

---

## 2. Matriz de cobertura

| Página | Cobertura % | Exactitud % | Estado |
|---|---|---|---|
| `00-overview.md` | 70 | 78 | Requiere corrección (P0: agentHost/Copilot) |
| `01-architecture.md` | 72 | 68 | Requiere corrección (P0: misatribución repetida + módulos ausentes) |
| `02-design-environment.md` | 68 | 88 | Completar (módulos no documentados + derivas de citación) |
| `03-visual-editing-writeback.md` | 70 | 88 | Añadir seguridad (P1: frontera de confianza del bridge) |
| `04-ai-chat-multiagent.md` | 80 | 88 | Profundizar seguridad (P1: default de permisos) |
| `05-codecanvas-preview.md` | 68 | 86 | Añadir static-serve + red/auth (P1) |
| `06-cli.md` | 65 | 74 | Corregir inversión (P0) + telemetría (P1) |
| `07-core-platform-build.md` | N/D | N/D | No auditada en este ciclo |
| `09-api-reference` (OpenAPI) | ~25 (servicios/comandos) · ~95-100 (AHP/bridge) | ~99 | Ampliar catálogo / declarar alcance honesto |
| `10-diagrams.md` | 85 | 90 | Correcciones puntuales + nodos faltantes |

> Notas: "Cobertura" = cuánto del producto real está documentado; "Exactitud" = corrección de lo que sí está escrito. `07` (y cualquier `08` que exista) no entraron en este ciclo y deben auditarse antes de declarar la suite completa.

---

## 3. Problemas de exactitud confirmados (solo verificados)

### P0 — Crítico (corregir antes de uso enterprise)

**P0-1 · Inversión arquitectónica sistémica: agentHost vs cliAgent.**
El backend operativo del chat es `platform/cliAgent → NativeCliAgentService`, que hace `spawn` con `stdio:[…'pipe','pipe']` (pipes de `child_process`, **no PTY, no agentHost**) y mata por handle con `killTree`. La documentación lo atribuye a `src/vs/platform/agentHost`.
- `00-overview.md:99` (glosario "Agent host" remite a "See AI chat") y el diagrama (`CHAT -.->|spawn agent| AG`).
- `01-architecture.md:44, 113, 124, 133` (prosa + gotchas).
- Evidencia: `cliChatAgent.ts:50-68` (invoke→runCli→ICliAgentService), `cliAgentMainService.ts:6/68/72` (`spawn`, `stdio:['pipe','pipe']`), `:137` (`killTree`), `app.ts:1324-1325` (canal `cliAgent`), `cliAgentService.ts:11`. `agentHost/electron-main/electronAgentHostStarter.ts:149-167` es un `UtilityProcess` aparte, gateado por `chat.agentHost.enabled`.

**P0-2 · Copilot descrito como proceso hijo spawneado.**
El diagrama y `00-overview.md:99` presentan a Copilot como backend CLI lanzado. El código comenta explícitamente lo contrario.
- Evidencia (re-verificada en vivo): `cliModelsContribution.ts:68-70` — *"Copilot is intentionally NOT a CLI descriptor: it runs in VS Code's local chat session using the bundled GitHub Copilot extension's own models (vendor 'copilot') … not a spawned terminal."* Solo `claude-cli` (`:45`) y `codex-cli` (`:72`) son descriptores CLI.

**P0-3 · Inversión standalone/integrated del comando `update` en el CLI (auto-contradictoria).**
`06-cli.md:8` afirma que "el build standalone solo expone `update`". Es al revés: standalone expone el set completo **más** `update`; el build integrated es el que **carece** de `update`. La propia página se contradice en `:82` ("Standalone only") y `:301`.
- Evidencia: `cli/src/bin/code/main.rs:70-71` (ambas personalidades enrutan el `Commands` completo), `cli/src/commands/args.rs:94-100` (StandaloneCli aplana CliCore + añade `StandaloneCommands`), `:151-155` (StandaloneCommands solo tiene `Update`). La cita `main.rs:29` apunta a `try_parse_legacy`, no al dispatch.

> **Causa raíz documentada:** comentarios obsoletos "PTY headless" / "headless PTY" en `cliLanguageModelProvider.ts:26-30, 74-78` contradicen la implementación de pipes (`cliProcess.ts:36-40`, `cliAgentMainService.ts:68-73`) y muy probablemente sembraron el modelo mental erróneo de las páginas 00/01. Limpiar estos comentarios evita reintroducir el error.

### P1 — Alto (inexactitudes y huecos sensibles a seguridad)

**P1-1 · Modos de permiso del agente: default sensible a seguridad sin documentar.**
`codecanvas.design.permissionMode` (enum `default/acceptEdits/plan/bypassPermissions`) controla con qué libertad el agente edita ficheros y ejecuta acciones. El **default es `acceptEdits` (auto-aplica edits sin preguntar)** y `bypassPermissions` "ejecuta toda acción sin preguntar". El overview no lo menciona; `04` muestra solo la bandera `[--permission-mode]` (`:127`) sin el default ni la semántica por modo.
- Evidencia: `cliModelsContribution.ts:24-37` (registro + enumDescriptions, `default:'acceptEdits'`), `cliLanguageModelProvider.ts:32` (`PERMISSION_MODE_SETTING`). Matiz: el nombre del setting y los 4 valores **sí** están en `09-api-reference.md:171,179` y `openapi.yaml:3045-3052`; el hueco real es el default + semántica + cross-link.

**P1-2 · Frontera de confianza del Design bridge no documentada (escribe en disco del usuario sin modelo de seguridad).**
Los mensajes entrantes se rechazan salvo que vengan del iframe Design de confianza, y toda op `fs.*` se confina al workspace. Salida con matiz: las respuestas/eventos se publican con `targetOrigin '*'`.
- Evidencia: `designBridge.ts:116-118` (`if (e.source !== this.iframe.contentWindow) return;`), `:338-353` (`resolveWorkspacePath` lanza *"Path outside the workspace"* vía `extUriBiasedIgnorePathCase.isEqualOrParent`), `:600-602` (openSourceFile confinado), `:146-150/530-535` (reply/eventos con `'*'`). La página 03 documenta escrituras a disco pero no tiene sección de seguridad.

**P1-3 · Servidor estático de preview con CORS `*` no documentado.**
`project.startDev` sirve apps estáticas con `npx --yes serve -n --cors -l <puerto>` en un puerto libre del rango **5500-5540**, y depende de `--cors` (`Access-Control-Allow-Origin: *`) para que el iframe Design haga fetch e inyecte el inspector.
- Evidencia: `designBridge.ts:251` (`findFreePort(5500,5540)`), `:262-265` (comando + comentario CORS). La sección de preview (05) describe el flujo `npm run dev` pero nunca el camino static-serve ni la relajación CORS.

**P1-4 · Comportamiento de red/auth del title-bar no documentado.**
El avatar lee la sesión nativa de GitHub y hace `fetch('https://api.github.com/user', { Authorization: Bearer <accessToken> })`; además se sobrescribe el chrome (sign-in de Copilot oculto, `menuBarVisibility=compact`, ítem Accounts forzado a oculto).
- Evidencia: `titleBarDeviceControl.ts:44-51` (overrides), `:158/176-184` (Bearer a api.github.com/user), `:211-247` (menú de cuenta + modal de foto), `:299` (`showAccounts=false`). Páginas 02 y 05 solo mencionan los "pills" History/Share/avatar.

**P1-5 · Telemetría del CLI Rust no cubierta.**
- Evidencia: `cli/src/options.rs:79-96` (`TelemetryLevel` off/crash/error/all), `cli/src/commands/args.rs:652-659` (`--disable-telemetry`/`--telemetry-level`, reenvío al editor `:670-675`), `cli/src/constants.rs:33-34` (`VSCODE_CLI_AI_KEY`/`VSCODE_CLI_AI_ENDPOINT` build-time). Complementa: el path CLI loguea run id/comando/exit/stderr vía `ILogService` (`cliAgentMainService.ts:63, 121`) — relevante para diagnóstico/PII-en-logs.

**P1-6 · Módulos load-bearing ausentes de la arquitectura.**
`platform/cliAgent` (el servicio que de verdad potencia el chat) y `DesignEditorBridge` (canal RPC primario workbench↔iframe Design: fs, terminal, dev server, click-to-source, open-chat, save-state, con validación de `e.source`) no aparecen en la página de arquitectura ni en el diagrama de contextos anidados (que solo muestra penpal React↔preview).
- Evidencia: `cliAgentMainService.ts:45/68/196/130-141/157`; `designBridge.ts:6-9/33-38/69`, `designEditorPane.ts:59-62`; `01-architecture.md` tabla `:123` lista solo `cliProviders/`.

### P2 — Medio (completitud, matices y derivas de citación)

Confirmados y bien evidenciados; no son errores graves pero impiden el "completeness bar" enterprise:

- **Derivas de citación `file:line`** (substancia correcta, línea desplazada): `02` `createEditor` está en `:43` (doc cita `:41`) y `loadBundle` en `:66` (doc cita `:64`, línea en blanco); `04` varias líneas desplazadas (`signOut` `:368` no `:350`; `getDefaultAccount` `ccAccountStatus.ts:78` no `:75`; comentario `agent-host-copilotcli` `:331` no `:330`); `01` `designEditorPane` iframe en `:52` no `:50`. `cliModelsContribution.ts`.
- **Inconsistencia `file://` vs `vscode-file://`** y **ruta de bundle built-vs-dev**: `02`/`01` documentan solo la ruta dev (`resources/app/design-editor/index.html`) llamándola "shipped"; la built real es `vs/../../design-editor/index.html` (`designEditorPane.ts:76-80`). El origen real es `vscode-file://`, contradicho por la propia doc (`02:257` vs `:10/88/198`).
- **`diffEngine` mal ubicado**: listado en las tablas de write-back de `03/05` como parte del sistema de estilos inline, pero pertenece a un comando aparte ("Edit CSS of Selected Element") que escribe reglas CSS por selector a un `.css` y **sí crea backup timestamp** (`diffEngine.ts:59-78`, `contribution.ts:1145/1253`) — en tensión con el bullet "undo es la única red de seguridad". Etiqueta de diagrama `05:204` dice `.backup-ts`; el sufijo real es `.codecanvas-backup-<timestamp>` (`diffEngine.ts:61`).
- **Click-to-source es JSX/React-only**: devuelve `undefined` sin fiber `_debugSource`; el escenario primario de HTML estático no produce mapeo a fuente, y la doc no lo advierte (`inspector-script.ts:48-55`).
- **Codex presentado como agente CLI vivo** cuando es `comingSoon` y no seleccionable (`agentSelectorControl.ts:27/171`); además el path Codex ignora `permissionMode` silenciosamente (`cliModelsContribution.ts:85`).
- **Internals no documentados** (completitud): orquestación del dev-server de live-preview (detección Vite/Next/Astro/Angular/Nuxt/Remix/Turbo, `detectConfigPort`, auto-reload debounced 500ms, timeout de carga 8s), panel **Snapshots**, `designProjectAnalyzer` (framework, `editable=React&&JSX`, routers Next, monorepo `workspaces`, `IGNORED_DIRS`, cache/invalidate), re-análisis en vivo del sidebar (race-guard `analysisVersion`), setting `codecanvas.language` (en/es, fallback inglés), enumeración de ops destructivas `fs.*` (writeFile/delete/rename/mkdir/copy), state-machine de guardado (idle/saving/saved/error), supresión de echo (`recentSelfWrites`, `SELF_WRITE_ECHO_MS=1500`), prompt Design→IA con invariante "LOCKED", telemetría neutralizada del editor (posthog stub a no-op en build), y caps numéricos (`JSX_MAX_DEPTH=3`, `JSX_MAX_FILES=60`, `SCAN_MAX_DEPTH=5`, `COMPONENT_SCAN_LIMIT=2000`, rango 5500-5540).
- **CLI `update --check`** (modo solo-comprobación) no documentado (`args.rs:157-162`); credential storage/encryption-at-rest del CLI sin cubrir (hallazgo parcial, datos de la página 06 truncados en origen).

> **Rechazos validados** (no son defectos): el overview *sí* enlaza la página de build y lista instaladores; *sí* menciona "Windows x64" y el self-update del CLI; la página 02 *sí* difiere legítimamente el modal preview-selector a p05; `ITelemetryService` en `DesignEditorPane` es plumbing de la clase base, no un hueco de telemetría. La regex de `diffEngine` y la robustez `@media` son una nota de código fuera de alcance, no un error de doc.

---

## 4. Brechas de documentación vs producto real (incl. secciones enterprise)

| Sección enterprise | Estado actual | Qué falta (evidencia) |
|---|---|---|
| **Seguridad / Trust boundary** | Ausente | Validación de `e.source` y confinamiento `fs.*` al workspace; salida `targetOrigin '*'` + CORS `*` del static server; modal e iframes anidados como superficie de confianza (`designBridge.ts:116-118/338-353/146-150`) |
| **Permisos del agente** | Parcial | Default `acceptEdits` (auto-aplica), `bypassPermissions` (ejecuta todo sin preguntar), `default` salta escrituras en headless; Codex ignora el setting (`cliModelsContribution.ts:24-37/85`) |
| **Auth / Identidad** | Ausente | Sesión nativa GitHub, fetch a `api.github.com/user` con Bearer; descubrimiento de credenciales CLI (`~/.claude.json`, `~/.codex/auth.json`), decodificación JWT sin verificar firma (solo para etiqueta de email) (`titleBarDeviceControl.ts:176-184`, `ccAccountStatus.ts:42-85`) |
| **Telemetría / Observabilidad** | Ausente (app) / Ausente (CLI) | CLI `TelemetryLevel` + flags + claves build-time; logging de run id/command/exit/stderr; editor posthog stub a no-op; OTel del agentHost (`options.rs:79-96`, `cliAgentMainService.ts:63/121`, `stubs/posthog.ts`) |
| **Límites / Known issues** | Ausente (consolidado) | Edición visual solo `position:absolute/fixed`; timeout de carga 8s; caps de scan; rango de puertos 5500-5540; click-to-source inert en HTML estático |
| **Despliegue / Topología** | Ausente | Sin vista de fronteras de máquina/proceso (workstation local vs UtilityProcess agent-host vs Dev Tunnels cloud vs servicio de update); built-vs-dev bundle path |
| **Manejo de errores** | Parcial | stderr inline en chat, status-bar de preview, `renderError` del analyzer; sin sección consolidada |
| **Versionado** | Parcial | `PROTOCOL_VERSION 0.3.0` (AHP) documentado; sin política de canal de update de la app; sin historia de version-skew (bundle+workbench se envían juntos, defendible) |
| **Prerequisitos / Onboarding** | Ausente | Usar Claude/Codex exige instalar el CLI y autenticar en terminal; runner resuelve binario probando dirs (`cliAgentMainService.ts:157-187`, `ccAccountStatus.ts:20-24`) |
| **Persistencia de datos** | Ausente | Historial de agente en SQLite (`sessionDatabase.ts`: tablas `turns`/`file_edits`/`file_edits_v3`/`session_metadata`) — relevante para auditoría/retención |

---

## 5. Hallazgos OpenAPI (`api/openapi.yaml`)

**Resumen:** ~305 operaciones muestreadas en 3 grupos · **0 alucinadas** · fidelidad de citas ~99 % · completitud desigual.

| Grupo | Ops verificadas | Veredicto | Cobertura |
|---|---|---|---|
| Agent Host (Claude) + AHP (8 familias) | 100 | **PASS (alta confianza)** | ~100 % — toda la superficie del árbol `protocol/` modelada; `PROTOCOL_VERSION 0.3.0` confirmado (`version/registry.ts:19`). Ficheros auto-generados → fidelidad casi perfecta |
| Design Bridge / Editor Engine / CLI RPC+Commands | 160 | **PASS (alta fidelidad)** | ~95 % — workbench bridge 17/17, CLI RPC 31/31, write-back 20/20, penpal 46/46; faltan métodos públicos menores del engine |
| IPC / Services / Commands | 45 (de 91 listadas) | **PASS exactitud / FAIL completitud** | IPC honesto (3/3); Services ~14 % (6/44); Commands ~20-25 % (18/80+) |

**Operaciones alucinadas:** ninguna en ningún grupo.

**Operaciones faltantes (las más materiales):**
- Toda la superficie `src/vs/sessions`: ~38 servicios DI (`ISessionsManagementService`, `ISessionDataService`, `ICodeReviewService`, `IChatDashboardService`, `IGitHubService`, …) y **~105 command IDs** `sessions.*`/`sessionsViewPane.*` (familia de ~25 miembros: archive/rename/pin/markRead/sort*/group*/filter*).
- Servicios agentHost no modelados: `IAgentHostCheckpointService`, `IAgentHostPermissionService`, `IDiffComputeService`, `IAgentHostGitService`, `IAgentHostChangesetService`, `ITunnelAgentHostService`.
- Comandos: `workbench.action.agenticSignIn/agenticSignOut`, `agentHost.exportDebugLogs/openSessionEventsFile`.
- Métodos públicos del Editor Engine: `StyleManager.updateStyleNoAction`, `ActionManager.refreshAndClickMutatedElement`, `debouncedRefreshDomElement`, `EditorEngine.clearUI`.

**Problemas de esquema (no invalidantes):**
- `operationId` con guiones bajos vs path keys con puntos para la misma op (cosmético).
- `x-source` ambiguos: `localAgentHostService.ts` sin prefijo (está en `electron-browser/`); `cliExtension` cita el enum de args, no el handler.
- **Honestidad de alcance desigual:** los tags IPC y Services declaran explícitamente su alcance estrecho (correcto), pero la descripción del tag **Commands implica completitud** cubriendo <25 %. Debe declararse el alcance parcial o ampliarse el catálogo.
- Transporte sintético: bridge/engine/penpal/CLI se modelan como paths POST aunque son postMessage/llamadas en proceso/JSON-RPC sobre socket. Es un mapa de superficie válido, pero debería declararse como convención.

---

## 6. Hallazgos de diagramas (`10-diagrams.md`)

**Veredicto:** preciso y de alta fidelidad; Mermaid bien formado (122 nodos = 122 ids, 0 fantasma, 0 huérfanos). El bucle write-back de Design está correcto de extremo a extremo (persistir a HistoryManager + `.html` **antes** del patch DOM en vivo; `html-source-writer` parse5 como primario con fallback DOMParser; cruce de iframe vía bridge a `fs.writeFile → fileService.writeFile`; reselect por identidad; supresión de echo).

**Inexactitudes confirmadas:**
- **Edge mal atribuido:** `db_sourcewriter ==>|workbench.writeFile| db_wbbridge` es incorrecto — `html-source-writer.ts` es un módulo puro que solo devuelve string; la llamada `writeFile` vive en `html-writeback.ts` (`db_writeback`, líneas 150/184/401). El edge debe salir de `db_writeback`.
- **Conflación de procesos:** el backend agent-host (`ah_utility` UtilityProcess, `ah_wsserver`, `ah_reverserpc`) se dibuja **dentro** de ELECTRON-MAIN, pero corre en un UtilityProcess separado (contexto node). Para un diagrama cuya premisa es "agrupar por frontera de proceso", esto induce a error sobre aislamiento.
- **Conteo obsoleto:** el doc-set cita ~90 nodos / ~120 edges; el real es ~122 / ~189 (9 subgrafos). Cualquier cross-reference a ~90/120 está desactualizada.
- **Inconsistencia paleta/leyenda:** la leyenda define `ext` (gris) como "Copilot, GitHub, procesos hijos", pero `ext_copilot` se clasifica `:::ai` (naranja), contradiciendo su propio ejemplo.
- "9 subgrafos por frontera de proceso" es laxo: AHP PROTOCOL es una capa lógica cross-proceso y BUILD PIPELINE es build-time (solo 7 de 9 son procesos runtime).

**Nodos faltantes:** persistencia SQLite de sesiones (`sessionDatabase.ts`) en el subgrafo DISK; subsistema changeset/checkpoint del host (`agentHostChangesetService`, `agentHostCheckpointService`); el **edge de write-to-disk del agente** (changeset → reverse-RPC FS → IFileService → disco), simétrico al de Design pero ausente.

**Diagramas nuevos recomendados (orden de valor enterprise):**
1. **Despliegue / topología** — fronteras de máquina y confianza (workstation vs agent-host process vs Dev Tunnels cloud vs update service). La vista enterprise más valiosa ausente.
2. **Secuencias de autenticación** — device-flow OAuth GitHub/Microsoft, descubrimiento de credential-files del CLI, gate VSDA de tunnels.
3. **State-machine AHP** (`stateDiagram-v2`) — ciclo de turn/tool-call con write-ahead optimista y reconcile `clientSeq`.
4. **Data-flow de edición del agente** — changeset → reverse-RPC FileSystemProvider → IFileService → disco → checkpoint, espejo del write-back de Design.
5. **ER de SQLite** — `turns`, `file_edits`/`file_edits_v3`, `session_metadata` (retención/auditoría).
6. **DFD de seguridad / trust-boundary** — dónde cruzan credenciales y código de usuario las fronteras de iframe, proceso y nube.
7. **Secuencia de reconexión/errores AHP** — handshake → ping → reconnect y fallo de negociación de versión (`AHP_UNSUPPORTED_PROTOCOL_VERSION`).

---

## 7. Plan de acción priorizado para alcanzar nivel enterprise

**Fase 0 — Correcciones de exactitud (P0, bloqueante).** Corregir las inversiones agentHost↔cliAgent (00, 01, diagrama), la descripción de Copilot como spawn, y la inversión standalone/integrated del CLI. Limpiar los comentarios "headless PTY" en `cliLanguageModelProvider.ts` para no reintroducir el error. Coste bajo, impacto máximo: hoy la documentación describe el subsistema que el chat NO usa y omite el que sí.

**Fase 1 — Secciones enterprise (P1).** Añadir páginas/secciones de Seguridad (frontera de confianza del bridge), Permisos del agente (default `acceptEdits` + semántica por modo), Auth/Identidad GitHub, Telemetría (app + CLI), y Límites/Known-issues consolidados. Añadir `platform/cliAgent` y `DesignEditorBridge` a la arquitectura y al diagrama de contextos anidados.

**Fase 2 — Completitud (P2).** Corregir derivas de citación, documentar los módulos no cubiertos (analyzer, live-preview orchestration, Snapshots, save-state, ops `fs.*` destructivas, `codecanvas.language`), aclarar built-vs-dev y `vscode-file://`, y corregir las inexactitudes de diagrama + añadir nodos faltantes.

**Fase 3 — OpenAPI + diagramas nuevos.** Ampliar el catálogo OpenAPI con la superficie `src/vs/sessions` (o declarar honestamente el alcance del tag Commands), y añadir los 7 diagramas recomendados (empezando por topología de despliegue y secuencias de auth). Auditar `07` (y `08` si existe).

---

*Auditoría sintetizada a partir de verificación por página (7 páginas), auditoría profunda OpenAPI (3 grupos, ~305 ops) y auditoría del mega-diagrama, todas contra el código fuente real. Dos afirmaciones de columna vertebral re-confirmadas en vivo en esta síntesis.*
---

## 8. Correcciones P0 aplicadas (2026-06-28)

Tras la auditoría se corrigieron en el acto los 3 errores factuales P0 de la web (y se reconstruyó `dist/`):

- **P0-1 (agentHost vs cliAgent):** `00-overview.md` (nodo del diagrama + glosario) y `01-architecture.md` (línea de proceso main, ejemplo de canal, tabla de ubicaciones) ahora atribuyen el backend del chat a `src/vs/platform/cliAgent` (`NativeCliAgentService`, pipes `child_process`, `killTree`, canal `cliAgent`). `agentHost` se describe como subsistema separado y opcional (UtilityProcess, gateado por `chat.agentHost.enabled`).
- **P0-2 (Copilot):** el glosario y el diagrama de `00-overview.md` ahora describen Copilot como chat local nativo (vendor `copilot`), no como proceso hijo spawneado.
- **P0-3 (CLI `update`):** `06-cli.md` línea 8 corregida — ambas personalidades exponen el set completo; solo el build *standalone* añade `update`.

El mega-diagrama (`10-diagrams.md`) ya era correcto en este punto (`NativeCliAgentService spawn pipes`, `vendor copilot local chat`, agentHost como UtilityProcess aparte): no requirió cambios.

**Pendiente (no aplicado):** P0-4 (limpiar comentarios obsoletos "headless PTY" en `cliLanguageModelProvider.ts:28,75` y `cliModelsContribution.ts:41` del repo de código — es la causa raíz que sembró el error; es un cambio en el repo, no en la web). Y todo el bloque P1/P2 (secciones enterprise: seguridad/auth/telemetría/despliegue/límites, modos de permiso, frontera de confianza del bridge; ampliar cobertura OpenAPI de servicios/comandos).

---

## 9. P1 aplicado (2026-06-28) — secciones enterprise + OpenAPI

Tras aprobar el alcance, se ejecutó el bloque P1 (7 subagentes leyendo el código real) y se integró:

### Páginas nuevas (registradas en el nav, grupo "Operations")
- **`11-security-permissions.md`** — Modelo de seguridad y fronteras de confianza (confinamiento al workspace en `designBridge`, validación de origen del iframe, guard de self-write echo, CSP, `--no-sandbox`), Modos de permiso del agente (enum + default `acceptEdits` + semántica/implicaciones), Autenticación e identidad (Copilot nativo vía `IDefaultAccountService`, Claude CLI, OAuth device-flow del CLI Rust). 4 diagramas. 101 citas `file:line`.
- **`12-operations.md`** — Telemetría y egreso de datos (`enableTelemetry:false`, OTLP de AHP, logging del CLI), Límites y timeouts operativos (puertos 5500-5540, `waitForPort` 60s, preload fallback, media por FileReader), Build/packaging/deploy (pipeline gulp win32, asar, bundle Design, instalador Inno Setup, firma/SmartScreen, self-update). 122 citas `file:line`.

### Catálogo OpenAPI ampliado
- **353 → 511 operaciones (+158)**; nuevo tag **`Sessions`** (superficie `src/vs/sessions` + command IDs ausentes); `info.version` 2.0.0 → **2.1.0**.
- Validado limpio: `openapi_spec_validator` → **VALID**; sin operationIds/paths duplicados; cada op nueva con `x-source` real.

### Código (repo CodeCanvas, commit `8948f3e3`, pushed)
- P0-4: comentarios obsoletos "headless PTY" corregidos a "child_process pipes" en `cliLanguageModelProvider.ts` y `cliModelsContribution.ts` (causa raíz del error arquitectónico).

`dist/` reconstruido y verificado (511 ops en source y dist; páginas 11/12 presentes; nav actualizado). Servidor de preview: `npm run preview` → `http://localhost:4173/docs.html`.

---

## 10. P2 aplicado (2026-06-28) — los 10 ítems

Ejecutado vía 2 workflows (un agente por archivo, editando in situ; el 1er pase tocó tope de sesión a las 16:50 y se reanudó tras el reset):

- **P2-1 derivas de citación** — corregidas en 01 (iframe :52), 02 (createEditor :43, loadBundle :66), 04 (`openNewChatSessionInPlace.local` :334). El resto de citas se re-verificaron y estaban correctas.
- **P2-2 ruta bundle built-vs-dev** — 01 y 02 ahora explican el branch `isBuilt` (`vs/../../design-editor` empaquetado vs `…/resources/app/design-editor` dev) y el origen `vscode-file://` (no `file://`).
- **P2-3 diffEngine** — reubicado al comando "Edit CSS of Selected Element" (escribe reglas CSS + backup `.codecanvas-backup-<ts>`); etiqueta de diagrama corregida en 05.
- **P2-4 click-to-source** — documentado como React/JSX-only (lee `_debugSource`), inerte en HTML estático.
- **P2-5 Codex** — marcado comingSoon/no-seleccionable y se nota que su path ignora `permissionMode`.
- **P2-6 internals** — añadidos a 05: orquestación del dev-server (detección de framework, `detectConfigPort`, auto-reload 500ms, timeout 8s), panel Snapshots, `designProjectAnalyzer` (framework/editable/Next routers/monorepo/cache/re-análisis), setting `codecanvas.language`.
- **P2-7 CLI** — `code update --check` documentado + almacenamiento de credenciales (keyring/file, `auth.rs`).
- **P2-8 OpenAPI** — página 09 sincronizada (511 ops / v2.1.0 / tag `Sessions`) y alcance del tag `Commands` declarado con honestidad.
- **P1-1..P1-6 residuales** — DesignEditorBridge + `cliAgent` añadidos a 01 (prosa + diagrama de contextos), title-bar GitHub fetch en 02, static-server CORS en 05, cross-links a 11/12.
- **P2-9 mega-diagrama** — edge de write-back corregido, agent-host UtilityProcess separado de electron-main, conteo actualizado (~125 nodos / 194 aristas).
- **P2-10 diagramas nuevos** — añadidos los 7 a `10-diagrams.md`: (1) Despliegue/topología, (2) Autenticación (Copilot + OAuth CLI), (3) State-machine AHP, (4) Data-flow de edición del agente, (5) ER de la BD SQLite de sesiones, (6) DFD de seguridad/frontera de confianza, (7) Reconexión AHP. + auditadas las páginas 07 y 08 (con sección "## Gaps").

`dist/` reconstruido y verificado: 8 diagramas Mermaid en `10-diagrams` (1 mega + 7), 511 ops OpenAPI (válido), páginas 11/12 y "Gaps" de 07/08 presentes, todas las cercas de código balanceadas.

**Estado: P0 + P1 + P2 cerrados.** Documentación reconstruida y verificada contra el código real a nivel empresa.
