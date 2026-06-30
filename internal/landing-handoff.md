# CodeCanvas — Landing handoff (persistente)

> Registro durable del estado de la landing `/`. No basta con "está en memoria":
> este archivo es la fuente de verdad entre sesiones. Última actualización: 2026-06-29.

## Estado actual
- Dirección aprobada: **X-Ray — Surface ⇄ Structure** (una captura real es "radiografiada"
  por una scanline cobalto que revela su estructura y vuelve).
- Construido y montado en `src/App.jsx`: `ScrollLine` (ribbon global) · `StageHero` (hero) ·
  `VideoPanel` · `XRayS1` (S1, hecho) · `XRayS2` (**S2 CERRADO y APROBADO 2026-06-28**).
- **S3 CERRADO Y APROBADO** (2026-06-29). **S4 CERRADA Y APROBADA** (2026-06-29) — NO modificar salvo regresión.
  **S5 — 2ª PASADA DESKTOP-1440 HECHA** (2026-06-29; concepto + `logo-hero.glb` APROBADOS; blueprint limpio
  `logo-edges.glb`, cámara reencuadrada+fija, satin refinado, poster re-horneado a paridad; fwd/rev + side-by-side
  verificados, consola/red limpias) — **esperando aprobación**; pendiente responsive + pase global.
- Cadencia por sección: construir → verificar a 4 viewports + estados → panel adversarial →
  consolidar/corregir → **detenerse para aprobación** antes de la siguiente sección.

## PROHIBICIÓN ACTIVA
- **S4 CERRADA — no tocar salvo regresión.** **S5 2ª PASADA DESKTOP-1440 ENTREGADA** (concepto + `logo-hero.glb`
  aprobados; blueprint limpio `logo-edges.glb`, cámara reencuadrada+fija, satin refinado, poster a paridad — ver
  sección Modelo + S5). **DETENIDO antes de responsive, cursor-parallax y pase global**, como se pidió. No se tocó
  Hero/VideoPanel/S1–S4/docs/APIs. Esperando aprobación.
- **S3 — restricciones (persisten):** mismo `<h1>` protagonista; solo assets y estados REALES;
  **SIN** afirmación causal "Ask Copilot → Claude" y **SIN conector**; no inventar respuestas,
  payloads, estados de agente ni controles. (La batería responsive 375/768/1920 + reduced-motion
  + reversa + consola/red/rendimiento + panel adversarial YA están hechos — ver sección S3.)

## RIBBON GLOBAL — issue global OBLIGATORIO (diferido formalmente 2026-06-28)
- El ribbon de `ScrollLine` cruza la tipografía editorial en varias secciones. **Diferido a un
  pase específico antes del QA final**, a corregir **en conjunto para S1–S5** (waypoints de
  `buildPath`), NO con parches por-sección. Obligatorio; no se cierra el QA sin esto.

## S2 — estado: ✅ CERRADO Y APROBADO (2026-06-28)
Verificado a 375/768/1440/1920 + inicial/apertura/final/reversa + reduced-motion (capturas
en scratchpad: `s2v14c-*`, `s2v768-*`, `s2v1920-*`, `s2m375c-*`, `s2st-rm`, `s2st-rev*`).

1. ✅ **Crop código desktop** muestra el token completo `.hero {` con el punto inicial y la
   llave (`object-position:20% 74%; scale 1.5`). Nota: el code pane desborda en vertical, así
   que AMBOS ejes de object-position encuadran el archivo.
2. ✅ **Crop código móvil** centra `.hero` (línea 35), `:root` fuera de cuadro
   (`object-position:10% 50%; scale 2.4; transform-origin:30% 84%`). Nota: en móvil el pane es
   apaisado → `cover` desborda en HORIZONTAL, el `object-position-Y` es inerte; el control
   vertical es `transform-origin`.
4. ✅ **Conector ya no hardcodeado**: `drawConnector()` lee los rects vivos de los dos
   nodos-anillo y escribe el `d` del SVG en px (viewBox en px + non-scaling-stroke);
   recalculado en cada tick del scrub + `ResizeObserver`. Los anillos se posicionan por
   breakpoint en CSS (`.s2-node-canvas` 70/40, `.s2-node-code` 21/86) → anillo y línea se
   mueven juntos. Reduced-motion-desktop lo dibuja una vez estático (bug encontrado+corregido:
   antes retornaba sin dibujar → anillos flotando).
3. ✅ **Trazos cobalto (parte de S2)**: dentro del díptico el panel oscuro OCLUYE el ribbon
   global → solo seam (vertical) + conector (diagonal), distintos. S2 recibió `pt-[20vh]` de
   aire local. La parte *global* (el ribbon cruzando el tipo) se movió al issue global
   obligatorio de arriba — diferido formalmente al pase S1–S5.

### Ya corregido antes (no re-abrir)
- Conector hairline real (`vector-effect:non-scaling-stroke`) + nodos-anillo DOM (px-true).
- Seam glow suavizado.
- Móvil = secuencia vertical estática legible (pin solo desktop; reduced-motion = estado fijo).

## S3 — "Hand it to the agent" — ✅ CERRADO Y APROBADO (2026-06-29)
`src/components/XRayS3.jsx` + bloque `.s3-*` en `index.css`, montado en `App.jsx`.
Stage split. Beats del scrub (pin corto, reversible): `--menu` → `--ctx` → `--reply` → `--s4`.
Capturas: `s3f-1` (selección), `s3f-2` (menú), `s3e-2` (contexto), `s3e-4` (respuesta), `s3f-6` (teaser).
- **DECISIÓN DE HONESTIDAD (revisión del usuario):** el ÚNICO clip continuo
  (`03-send-to-ai.gif`, 164 frames) graba un elemento DISTINTO (`#odid-x4Diepq1T-tmmeIKixXDF`),
  así que NO puede probar el flujo Ask-Copilot→Claude para el protagonista
  (`#odid-9kJj4Z6DGhql1WQbINSGk`). Además la respuesta del gif difiere de `06` → `06`/`07a` son
  sesiones separadas. Por eso: **SIN afirmación causal, SIN conector.** Se muestran dos
  capturas reales independientes del MISMO `<h1>`, "side by side, not as a wired sequence".
- **Estados (5):** (1) selección = `07` recortado al canvas, `<h1>` sin menú; (2) menú real =
  cross-fade a `07a` (el menú **Ask Copilot** aparece, sin caja artificial, no toca la
  selección); (3) contexto = `06-claude-panel.png` (crop derivado de `06`, SOLO el panel Claude,
  sin franja de editor) con highlight de `[Design context]` (id protagonista visible); (4)
  respuesta = `object-position-Y` panea el crop real para revelar la respuesta de Claude + 4
  bullets (píxeles reales, sin DOM); (5) teaser "On your machine." → S4 (local-first, localhost).
- **Asset derivado:** `public/media/06-claude-panel.png` = crop de `06-code-panel.png`, solo el
  panel Claude. **Nativo 306×592** (re-cropeado más alto que la nota vieja `306:496` para incluir
  toda la respuesta). Píxeles reales, sin fabricar. La proporción del stage es **65% canvas /
  35% agente**; el panel se ve a ~**1.28×** por `cover` (≤1.3×, nítido, no ampliado destructivamente).
- **Teaser S4:** "On your machine." / "local-first — design and preview straight from localhost".
  NB: evitar "nothing leaves your project" — la IA (Claude) es nube; sería falso tras enviar
  contexto. "local-first / localhost" está respaldado por las capturas (View Preview, :5500, Local).
### Diagnóstico reportado — RESUELTO (2026-06-29)
Tras el cambio a 65/35 + asset 306×592, el box `.s3-hl-ctx` (calibrado para el crop viejo
306×496) quedaba **demasiado alto**: envolvía la línea gris "Reviewed H1 element…" (que NO es
design-context) y su borde superior partía la etiqueta "[Design context]". **Fix:** retune a
`top:12% / height:43%` (mapea la sub-card nativa y≈58..255 vía cover 1.281 a 12%..55%), enmarca
solo `[Design context]` + sus 3 bullets. Verificado a reply=0 real (reduced-motion) y a 768/1440.

### QA — batería completa (capturas en scratchpad de la sesión)
- **1440 / 768 / 1920:** scrub OK; panel legible; design-context y respuesta+bullets legibles
  durante el paneo `--reply`; el menú real NO invade el `<h1>` (titular legible); SIN conector;
  caption honesto visible. (768: el stage encoge → panel ~0.79× sub-nativo pero legible; tradeoff
  documentado.)
- **375 móvil:** secuencia vertical; ahora muestra el **panel COMPLETO** a ~native (contexto +
  respuesta + bullets) — ver fixes.
- **Reduced-motion (1440):** estado estático compuesto (`menu=1 ctx=1 reply=0 s4=1`), correcto.
- **Reversa del scrub:** retrace monótono, sin histéresis (vars son función pura del progreso;
  no hay dibujo imperativo como el conector de S2).
- **Consola/Red:** limpias (solo vite-connect + react-devtools info); 0 fallos de red; todo 200.
- **Rendimiento (1440, software-render, fwd+rev):** 1018 frames, 0 long-tasks >50ms, max 22ms.
- **Canvas "negro" en una captura mid-pan (`s3w-1`): ARTEFACTO de captura confirmado** (2026-06-29).
  Reproducido en la página real con las imágenes ya decodificadas: en todo el rango del paneo
  (reply 0.0→1.0) ambas imágenes del canvas reportan `opacity=1, display=block, visible,
  naturalWidth=1920, complete=true`. El negro fue una imagen `lazy` aún sin decodificar en el
  instante de la captura programática rápida; en uso real nunca desaparece. Sin fix.
  **RE-VERIFICADO 2026-06-29 (sesión 486be757)** como condición de cierre del usuario: 5 beats
  a 1440 (`s3chk-0..4`, reply 0.46/0/0/0.34/1.0), `canvasImgsLoaded=LOADED` antes del scrub,
  ambas imgs `complete=true nW=1920 op=1 visible` en todos; frame mid-pan inspeccionado a ojo =
  canvas + panel Claude renderizados. Artefacto confirmado. **S3 cerrado y aprobado.**

### Panel adversarial (3 lentes read-only) — fixes APLICADOS
1. `hl-ctx` se quedaba sobre la card al panear → **fade completo por reply~0.15**
   (`opacity: ctx * clamp(0,(1-reply/0.15),1)`) + glow suavizado (quita doble-borde).
2. Tag derecho "CODECANVAS AI · Claude" tapaba texto real del panel (incl. el localhost:5500 en
   móvil = prueba de honestidad) → **eliminado** (el header propio "Claude" + el caption ya lo
   identifican). Tag izquierdo "CANVAS · element menu" permanece.
3. Móvil no mostraba la respuesta aunque el copy la promete → **stack vertical con panel completo**
   a ancho casi nativo (`@media ≤767px`: stage `aspect:auto`, panes en flujo, `.s3-agent .s3-img`
   `height:auto`); cumple "secuencia vertical legible, crop 306px cerca de nativo".

### Diferidos S3 (registrar; NO hacer ahora)
- **Díptico sin baseline compartida (mayor, dirección artística):** los dos panes reales no
  comparten horizonte/escala; el panel sugirió subir el crop del canvas (bajar `object-position-Y`
  de `.s3-canvas .s3-img`) para que la baseline del `<h1>` rime con la fila "Selected element".
  **Deferido al pase de dirección artística:** forzar el rime tensiona con la intención honesta
  "dos capturas reales independientes" y arriesga perder el contexto del demo izquierdo. Decidir
  con el usuario.
- **Contraste del eyebrow (.eyebrow global ≈2.95:1 < AA):** clase compartida → arreglar en el
  pase global de a11y, no parchear S3.
- **Reduced-motion DESKTOP** sigue mostrando solo `reply=0` (contexto): los últimos bullets de la
  respuesta quedan recortados (el stage desktop es aspect fijo; no se puede mostrar el panel
  completo sin tocar el scrub aprobado). Mitigado por el body-copy. Móvil ya resuelto.
- Paleta: la selección roja real vs acento cobalto — chrome auténtico del producto; la honestidad
  prohíbe recolorear. Aceptado.
- Ribbon global cruza stage/teaser → issue global (arriba). 1920 left-heavy → issue global.
- Estado "Considering" (`07`) disponible si se quiere un beat intermedio (no usado).

## S4 — "On your machine." — ✅ CERRADA Y APROBADA (2026-06-29) — NO TOCAR salvo regresión
**S4 está cerrada por el usuario.** Dirección, desktop-1440, batería responsive (375/768/1920 + reduced-motion +
reversa + consola/red) y panel adversarial formal: todo hecho y aprobado. No modificar salvo regresión. `src/components/XRayS4.jsx` + bloque `.s4-*` en `index.css` (tras `.s3-*`), montado en
`App.jsx` tras `<XRayS3/>`. Stage `aspect-ratio:1920/1032`, **DOS escenas**:
- **Escena IDE (`04e-ide-desktop.png` full):** frame LIMPIO y BRILLANTE del IDE local (Code explorer con los
  archivos del proyecto `index.html`/`pricing.html`, terminal loopback, canvas visible, **sin dropdown**). Es la
  MISMA fuente de la que sale 04c → el zoom IDE→canvas es continuo. Beats `--proj`/`--serve` con DOS cajas cobalto
  (idioma `.s3-hl` + label mono S1) — explorer de archivos, luego la TERMINAL loopback (`::1 GET / → 200`) + tag.
  **localhost es un beat propio antes del morph.** Un foco por beat; ninguna toca el panel Claude. Carga **eager**
  (sin negro lazy al llegar).
- **Escena canvas:** al entrar `--zoom`, 04e se desvanece + hace zoom hacia el canvas y la vista enfoca SOLO el
  canvas. Dos estados reales recortados a la MISMA rect AJUSTADA (986×680 @540,180 — **sin toolbar superior ni
  terminal**, solo la región preview/canvas): `04c-canvas-desktop.png` (frame del webm) y `04d-canvas-phone.png`
  (crop de 04b). `object-fit:contain` sobre fondo night **opaco** (para el wipe limpio); el dispositivo es el protagonista.
- **Beats (pin `+=150%`, reversible, vars = función pura del progreso; `--p` expone el progreso crudo):**
  `--proj`(0–.12) → `--serve`(.16–.30) → `--zoom`(.34–.48, "preview") → `--morph`(.52–.80, desktop→phone) →
  `--s5`(.88–1.0). El morph = **WIPE direccional center-out** (`clip-path: inset` anclado al centro): 04d (phone,
  opaco, encima) se revela del centro hacia afuera comiéndose el centro del desktop más ancho → **nunca dos
  titulares/layouts completos a la vez**. Sin blur.
### Qué se corrigió vs. la 1ª pasada (feedback del usuario)
1. **Continuidad 04a→webm→04b:** encuadre compartido en la región del canvas → SIN salto de chrome (el chrome
   distinto de cada sesión simplemente no está en cuadro).
2. **localhost** = beat separado ANTES del morph; durante el morph el protagonista es el canvas, no el IDE.
3. **Dropdown** retirado: solo en la escena IDE (04a), desaparece al hacer zoom; ausente en preview/morph.
4. **Cajas:** solo 2 (proyecto, localhost); la escena canvas no tiene cajas compitiendo (un foco por beat).
5. **Final negro (1ª pasada) — CAUSA REAL hallada, NO era artefacto:** el `<video>` v1 tenía `z-index:1` sobre
   `.s4-resolve` (sin z) → el video quedaba encima de 04b; en los seeks (webm = 1 keyframe) caía a `readyState 1`
   y pintaba **frame negro** (y el frame 118 del webm ES negro). **Fix v2:** eliminado el `<video>`; morph =
   crossfade de stills (sin decode → sin negro), 04d (phone) siempre encima y opaco al final. **Estable forward
   Y reversa** (verificado).
6. **Bordes suaves** vía crossfade corto + pillarbox que funde con el night bg; sin fabricar continuidad ni
   alterar capturas (crops honestos, mismo criterio que `06-claude-panel` en S3).
### Decisión clave: por qué NO se scrubbea el webm
El webm NO tiene reflow gradual: su arco es desktop → navegación del dropdown (la mayor parte) → **snap
instantáneo** al phone (~frame 88) → phone estable → **frame 118 NEGRO**. Scrubbearlo mostraba sobre todo el
dropdown y causaba el negro. Por eso v2 usa el frame desktop limpio del webm (→04c) y el phone de 04b (→04d)
crossfadeados en el encuadre del canvas. El webm sigue siendo una de las "tres fuentes", representado por sus
frames reales. Caption: "real captures (02-device-switch.webm · 04b) crossfaded on a shared frame, not one
continuous take".
### QA 2ª pasada (1440) — capturas `s4f-*` (forward) + `s4r-*` (reversa); grabación en `internal/s4-scrub.{mp4,gif}`
- Batería forward por progreso real `--p`: start(.03)/project(.10)/localhost(.28)/preview(.50)/**morphMID(.66,
  morph=.548 = mitad exacta)**/finalSettle(.84,phn=1)/finalTeaser(.97,phn=1).
- **Reversa idéntica al forward** (revMorphMID morph=.508, revPreview dsk=1, revFinalAgain phn=1) → sin
  histéresis; **final estable arriba y abajo, sin negro** (resuelve el reporte del usuario).
- **Consola 0 errores · Red 0 fallos** (04a/04c/04d 200; sin video). Compila limpio (HMR).
- reduced-motion/móvil: `[data-static]` muestra el phone-canvas (su tira de terminal mantiene la prueba local).
### Micro-pulido 1440 (3ª pasada, 2026-06-29) — feedback del usuario, los 4 puntos
1. **Crossfade → WIPE direccional center-out** (`clip-path: inset` anclado al centro): en ningún punto dos
   titulares/layouts completos; sin blur. (Resuelve el fantasma de la 2ª pasada.)
2. **Beat "project" más brillante:** base IDE 04a (oscuro + dropdown tapando el canvas) → **`04e`** (frame limpio
   del webm: canvas visible, sin dropdown, Code explorer con los archivos = contexto claro del proyecto). Eager.
3. **Encuadre del morph limpio:** crops 980×800 → **986×680 @540,180** (fuera el toolbar superior y la terminal;
   solo la región preview/canvas — el dispositivo es el protagonista).
4. **Fixes intactos:** sin video, sin negro, localhost beat separado, reversa estable, caption honesto.
- **Cite:** 04e muestra `::1` (loopback IPv6) en su terminal → tag/body/caption citan `::1` (no `127.0.0.1`, que
  vivía en 04a). Ambos son loopback = local. Body: "loopback (::1) … served from localhost".
- **Verificado a 1440** (`s4f-*`/`s4r-*` re-corridas): project brillante + caja en el file tree; localhost caja en
  terminal `::1`; inicio del wipe (desktop limpio); **mitad del wipe = un solo titular (el del phone)**; final phone
  estable + caption; reversa idéntica. **Consola 0 err · Red 0 fallos** (04c/04d/04e 200). Grabación del wipe en
  `internal/s4-scrub.{mp4,gif}`.
### Ajuste final 1440 (2026-06-29) — 2 residuos corregidos antes de responsive
1. **Final sin negro / teléfono visible hasta el final:** quitado el teaser `.s1-tonext` (la "salida" hacia S5,
   que no existe) → eliminada la var `--s5`. Beats reacomodados para que el **morph asiente el teléfono ~p=0.90 y
   se MANTENGA** a 1.0 como estado terminal estable. `pb-26vh → pb-14vh`. Verificado: a p=1.0 y **más allá del pin**
   (`s4-pastpin`) se ve el teléfono + caption en papel, **sin vacío negro**. La salida se reintroducirá cuando S5
   exista (transición real).
2. **Bajón oscuro en la transición zoom (lo que se percibía como "blackout de localhost"):** el crossfade IDE→canvas
   dejaba ver el fondo night a mitad. **Fix:** `.s4-ide` queda **opaco** (opacity 1; solo lo cubre la capa canvas
   opaca al hacer zoom) → sin hueco al night; `.s4-cv-desktop` cubre más rápido (`min(1, zoom/0.5)`) → menos
   doble-exposición. El beat localhost en sí ya era brillante (04e). Verificado `s4f-1`.
- Verificado a 1440 (`s4f-*`/`s4r-*` + `s4-pastpin`): localhost brillante; zoom sin bajón; .90/.95/1.0 + reversa
  estables con el teléfono; post-pin sin negro.
### Batería responsive (2026-06-29) — capturas `resp-{375,768,1920}-*`
- **375 (móvil):** el stage pinned-scrub no sirve a 375px (quedaba ancho-bajo, teléfono diminuto). **Nuevo
  `@media (max-width:767px)`:** el stage fluye en **columna** mostrando una **secuencia vertical legible** —
  `04c` (desktop canvas) sobre `04d` (phone canvas), a ancho completo, redondeados; se ocultan IDE/cajas/tag y se
  anula el wipe (`opacity/clip-path/transform` con `!important`). El copy + caption llevan la prueba local
  (localhost, `::1`, archivos). Cadencia S2/S3. Verificado.
- **768 (tablet):** usa el scrub desktop (mobile es ≤767); funciona a ancho completo (stage llena el contenedor).
- **1920 (wide):** scrub OK, contenido centrado en `max-w-[1180px]`; el "left-heavy" en ≥1536 es **issue global
  diferido** (no específico de S4).
- **reduced-motion DESKTOP:** `[data-static]` muestra el phone-canvas payoff (sin cambios; el `@media` es mobile-only).
- **Consola 0 err · Red 0 fallos.** Compila limpio. Grabación final del scrub en `internal/s4-scrub.{mp4,gif}`.
- **Pendiente de cadencia:** panel adversarial formal (multi-agente) NO corrido aún — disponible si se quiere
  escrutinio extra. Auto-revisión continua hecha a lo largo de las pasadas.
### Panel adversarial formal (3 críticos read-only + consolidación, 2026-06-29)
Veredicto `resp-768-b`: **doble titular REAL** (mismo offset geométrico a 768 y 1440 → no es tear de captura).
**0 blockers; 6 majors S4-específicos — TODOS corregidos y verificados:**
1. **RM-desktop perdía la prueba local** (mostraba solo el phone-crop, sin terminal) → `[data-static]` ahora
   muestra el **IDE 04e** (terminal `::1`, archivos, canvas) + caja terminal + tag. (`rm-1440`).
2. **Doble-exposición IDE→canvas** (`.s4-cv-desktop` cubría lento sobre el IDE opaco) → `opacity:min(1,zoom/0.08)`
   (cubre en el primer tramo del zoom; el `scale` mantiene el push-in). Un solo titular (`resp-768-b`).
3. **Caja/tag localhost flotaban sobre el canvas** tras cubrirse la terminal → fade por `(1-min(1,zoom/0.06))`
   (se van antes de que el canvas cubra).
4. **Teléfono móvil/RM ilegible** (04d landscape en columna) → `@media` caja **portrait** `aspect-ratio:10/14` +
   `object-fit:cover` → el teléfono llena la columna (`resp-375-c`). + `aspect-ratio` en desktop-crop (anti-CLS).
5. **Móvil descargaba el IDE 300KB solo para ocultarlo** → 04e en `<picture>` con `source (min-width:768px)` →
   a 375px solo se piden 04c/04d (verificado).
6. **`clip-path` del wipe sin `will-change`** (repaint por frame) → `will-change:clip-path` en `.s4-cv-phone`.
- **Consola 0 err · Red 0 fallos.** Minors (chrome del canvas en el crop, end-state dark-heavy, hygiene de
  código `--p`/`once:true`) quedan registrados como pulido no-bloqueante.
### Diferidos S4 (registrar; NO hacer ahora)
- **Fragmentos laterales del desktop** durante el wipe (nav/cards en los bordes que retroceden): no son layout
  completo ni titular; inherente al wipe. Aceptable; afinable si se quiere un borde aún más limpio.
- **Coords de las 2 cajas (escena IDE) re-ancladas a 04e** (explorer top-left, terminal bottom) — retune px-true fino si hace falta.
- **`--p`** es una var de verificación inerte en `onUpdate`; quitar en el pase de limpieza si se quiere.
- **04a/04b** ya no se usan en el componente (04a → 04e; 04b es la fuente de 04d). Archivos en disco; sin borrar.
- Email/foto: uso **AUTORIZADO** por el usuario (NO difuminar — confirmado 2026-06-29).
- **HECHO:** batería responsive de S4 + panel adversarial formal (arriba). **S4 CERRADA.** Siguiente = **S5** (abajo).

## S5 — "Surface and structure. One object." — 🟡 2ª PASADA DESKTOP-1440 HECHA (2026-06-29) — esperando aprobación
**Concepto de S5 y `logo-hero.glb` APROBADOS por el usuario (2026-06-29).** 2ª pasada = refinamiento desktop-1440
(blueprint limpio, reencuadre, material, scan). **Feedback posterior aplicado:** el settled **mece (±28°)** + subida
de **calidad (sombras: self-shadow + contact; luces de turntable).** Sigue pendiente responsive + pase global (NO hacer aún).
El cierre de marca: el mark 3D de CodeCanvas renderizado **en vivo (WebGL)** cierra el arco "surface ⇄ structure"
sobre el propio logo, haciendo bookend con S1 ("Every surface is also a structure"). Archivos nuevos:
`src/components/XRayS5.jsx` + `src/lib/logoRevealGL.js` + bloque `.s5-*` en `index.css`; montado en `App.jsx`
tras `<XRayS4/>`. **NO se tocó** Hero/VideoPanel/S1–S4/docs/APIs.
- **Concepto del reveal (validado fwd+rev a 1440):** un **blueprint cobalto vacío** del mark; al hacer scroll, la
  **superficie metálica satinada SE LLENA de abajo-arriba** dentro del blueprint (se clipa el SÓLIDO, no el
  blueprint → sin open-cut feo), con una **banda de scan cobalto** (idioma `.s1-scan`) barriendo la línea de
  llenado; al final el blueprint se desvanece → **mark de metal limpio** = el payoff (idéntico al poster). Pin
  corto (`+=140%`), reversible (reveal = función pura del progreso; sin histéresis).
- **BLUEPRINT — asset limpio (fix 2ª pasada):** EdgesGeometry daba líneas fragmentadas/duplicadas/punteadas
  (la silueta del mark es un BISEL redondeado = sin arista geométrica; cuantización i16 añadía huecos). Solución:
  **`public/models/logo-edges.glb`** (216 KB) horneado OFFLINE desde el **original SIN cuantizar** (weld/merge) —
  contorno de la **frontera de las caras frontales** (normal.z>0.55, boundary = count 1): líneas **continuas y
  limpias** (silueta + muesca + costura diagonal), sin bevel ni doble línea. Validado a ojo (4 variantes) ANTES de
  integrar. Harness: `scratchpad/mt/edges.html` + `cap-edges.ps1`. (EdgesGeometry en runtime ELIMINADO.) El
  componente carga hero (sólido) + edges (LineSegments), recentra ambos por el centro del SÓLIDO.
- **CÁMARA — reencuadre + estable (fix 2ª pasada):** `fitCamera()` ajusta la distancia a la bounding-sphere
  (`FIT 0.96`) → **mark completo, centrado, aire uniforme, nada toca/sale del stage**. Dirección 3/4 FIJA
  (`DIR=(0.5,0.16,3.0)`); **se quitó el yaw del grupo** → la cámara NO se mueve durante structure→surface (el
  protagonista es el cambio de material, no un crop). Recalcula en resize.
- **MATERIAL — satin refinado (fix 2ª pasada):** `roughness 0.40` (más separación tonal que 0.48), `metalness 1`,
  `normalScale 0.5` (menos ruido brushed), `envMapIntensity 1.1`, exposición `0.95` (sin reflejos quemados); rig:
  key 0.85 (forma) + fill 0.16 (no muddy = profundidad) + **rim cobalto 0.55 controlado**. Sin fanning (malla densa).
- **MOVIMIENTO + SOMBRAS + CALIDAD (feedback post-aprobación, 2026-06-29):** tras completar el reveal el mark
  **MECE suavemente** (oscilación seno **±28°**, `OSC_SPEED 0.55`, gateada por `smoothstep(0.965,1)` → 0 durante el
  reveal y al hacer scroll atrás; cámara sigue FIJA durante structure→surface). Se eligió mece y NO un 360° porque
  esta marca cóncava y plana pasa por un **edge-on** (sliver) y un **interior cóncavo casi negro** en ángulos
  profundos (el metal se ilumina por reflexión de entorno, no por luces difusas). *(360° = swap de 1 línea: `phase +=…; rotation.y = phase`.)*
  **Sombras:** `shadowMap` PCFSoft 2048 — **self-shadows** entre los flaps superpuestos (profundidad real) +
  **contact shadow** suave detrás (plano `ShadowMaterial` opacity 0.10, hugging). **Luces para todo el arco:** key
  0.95 (+shadow) + **kick 0.5 en azimut opuesto** + fill 0.3 + rim cobalto 0.6, **env 1.28** → legible y bien
  iluminado en todo el mece. Verificado `s5-spin-a/b` (ambos ángulos premium, sin negro ni edge-on). Console 0/0.
- **POSTER re-horneado (paridad):** `logo-poster.png` re-generado (~700 KB) con la **MISMA cámara/material/luz/sombras**
  que el settled WebGL en su **front pose** (`scratchpad/mt/poster.html` espeja `logoRevealGL`) → **WebGL settled (front) ≡
  poster por construcción** (side-by-side `s5-sbs.png`). El mece es solo-WebGL (el poster es el snapshot front estático).
- **Stage PAPER** (no night como S1–S4): el arco resuelve fuera de los stages técnicos oscuros a una declaración
  de marca limpia, y empata con el poster horneado (bg paper) → **paridad de fallback perfecta**.
- **Fallback (verificado):** reduced-motion / móvil / coarse-pointer / sin-WebGL / `hardwareConcurrency<4` →
  **poster** `logo-poster.png` (que ES el estado final del reveal, así que los clientes estáticos ven el payoff).
  Gate en `XRayS5.jsx` (`[data-static]`); el GL nunca monta en esos casos. `<picture>`/IO/dispose completos.
- **Honestidad:** SIN CTA/links de repo falsos (no hay URL real → no `href="#"`); S5 es una **declaración**, no
  un CTA de venta. Copy ata el arco (canvas‖code, preview‖file, screenshot‖element) y nombra "CodeCanvas" 1 vez.
- **QA 1440 (capturas en scratchpad 461f7d66):** beats `s5f-0..4` = blueprint(.03)/25%/50%/75%/settled(.97)
  + rev `s5r-0..1` mid(.50)/blueprint(.03) **idénticos** (reversible, sin histéresis); blueprint limpio/continuo;
  settled = metal premium con self-shadow + contact shadow, sin fanning ni quemados; **mece** `s5-spin-a/b` legible
  y bien iluminado a ±28°; banda de scan legible; **side-by-side `s5-sbs.png`** WebGL(front)≡poster;
  **Consola 0 err/0 warn · Red 0 fallos.** Harness: `s5-batt.ps1` (`-RM`; captura el mece tras pasar el pin) ·
  `s5-audit.ps1` · `mt/{edges,poster,sbs}.html`.
### RESUELTO en la 2ª pasada (no re-abrir)
- Blueprint fragmentado/duplicado/punteado → `logo-edges.glb` (front-boundary, offline desde el original).
- Mark grande/cropeado + cámara que se movía (yaw) → `fitCamera()` margen uniforme + cámara FIJA.
- Material plano → satin 0.40 con separación tonal/profundidad/rim controlado. Poster re-horneado → paridad.
### Diferidos S5 (registrar; NO hacer ahora — el usuario pidió parar antes de responsive y del pase global)
- **PENDIENTE (autorizado siguiente, tras aprobación):** batería **responsive** S5 (375/768/1920) + **pase global**.
  Esta pasada es **solo desktop-1440**.
- **Panel adversarial formal** (multi-agente) NO corrido — disponible si se quiere escrutinio extra (cadencia S4).
- **Cursor micro-parallax** tras el settle (model-report Fase D) — pulido diferido (el usuario pidió NO hacerlo aún).
- **Transición S4→S5:** S4 (cerrada) quitó su `--s5`/teaser. La costura S4→S5 es un ítem del **pase global** (no tocar S4).
- Ribbon global (`ScrollLine`) cruza también S5 → issue global de arriba.
- NB harness: `s5-pastpin` vía `window.scrollTo` pelea con Lenis — **artefacto de captura**, no bug; el reveal
  mantiene rev=1 pasado el pin (función pura).
- Líneas del blueprint a 1px (LineBasicMaterial). Si se quiere un trazo más grueso/premium → migrar a Line2/fat
  lines (no bloqueante; el trazo continuo actual lee limpio).

## Decisiones aprobadas (constraints duros — persisten)
- **Alcance: landing `/` SOLO.** Nunca leer/analizar/modificar/testear `/docs.html`,
  `/docs-api.html`, `public/docs/**`, OpenAPI/Swagger. Los links a docs pueden quedar pero
  sus páginas están fuera de alcance.
- **Hero (StageHero+Ballpit) y VideoPanel BLOQUEADOS** — solo correcciones críticas
  autorizadas (responsive, reduced-motion, pausa offscreen, preload video, controles inertes,
  cleanup de listeners, sin `href="#"`). No recolorear/rediseñar "para unificar".
- **Honestidad (regla dura):** solo capturas reales y hechos confirmados. No fabricar UI de
  producto, diffs, inspectores, controles "Keep/discard", estados de agente, repos, comandos
  de instalación, URLs, licencias, comunidad o frameworks. El demo es un proyecto HTML
  (`index.html`), NO React/JSX. Panel de agentes muestra solo "Claude" (único real).
- **Sin datos como acciones funcionales** (repo/descarga/instalación/licencia/Discord/
  roadmap/issues/sponsors/changelog) hasta que el usuario dé valores reales. Sin `href="#"`.
- **El mismo `<h1>`** real ("Ship your ideas faster", id `#odid-9kJj4Z6DGhql1WQbINSGk`) debe
  protagonizar S1, S2 y S3.
- **S2 framing honesto (condición #2):** `06-code-panel.png` muestra `index.html` abierto
  pero solo el bloque `<style>` (`:root` + la regla `.hero{...}`); **NO muestra el markup
  `<h1>`**. Por eso S2 nunca afirma mostrar la línea `<h1>` fuente: el conector va del `<h1>`
  seleccionado en el canvas (07) a la **regla `.hero` real visible** que lo maqueta. La
  afirmación es solo "mismo archivo", probada por las capturas + el project path del contexto
  del agente (`codecanvas-demo / index.html`).

## Modelo 3D — ✅ RESUELTO (re-validado 2026-06-29, sesión 461f7d66)
Re-validación del fanning (gate del usuario antes de S5), render headless 3-way bajo el look real de S5
(env-dominante + satin 0.48 + rim cobalto). **Hallazgo clave:** el fanning es **estructural del paso de
SIMPLIFICACIÓN**, NO de la cuantización ni de las texturas — se reprodujo a 49k (catastrófico) y a 97k (más
leve pero presente); f32 vs i16 vs i8 de normales = idénticos (descarta la cuantización). Por eso:
- **RECHAZADO `logo-opt.glb`** (2.48 MB, 49,926 tris simplificados) — bevel fanning visible; ya NO es el hero.
  Se conserva en disco (referencia), pero NO se usa.
- **HERO QUE SE ENVÍA: `public/models/logo-hero.glb`** (3.20 MB, **196,726 tris = malla COMPLETA**, sin
  simplificar; solo compresión: meshopt i8 + KHR-quant + texturas WebP 2048, normal near-lossless). Render
  **impecable** (idéntico al original, sin fanning) tanto satin como glossy. La i8 en malla densa es invisible
  (los triángulos del bevel se conservan; solo se cuantizan sus normales). Más pequeño que el 49k y sin defecto.
- **Material de S5 (validado):** `roughness ≈ 0.48` (satin), `roughnessMap=null`, env-dominante
  (PMREM RoomEnvironment, `environmentIntensity ≈ 1.2`), key suave ~0.5 desde sup-derecha, rim cobalto
  `#3a5bff` ~0.45 desde atrás-izq. Cámara `fov 32`, rest `pos (0.55,0.18,3.25)` mirando al origen.
- Poster `public/models/logo-poster.png` — **RE-HORNEADO (2ª pasada S5, 686 KB)** con la misma cámara/material/luz
  que el settled WebGL (`scratchpad/mt/poster.html`) → paridad exacta con el live. Fallback no-WebGL/móvil/RM.
- **Blueprint `public/models/logo-edges.glb`** (216 KB) — contorno de front-boundary horneado offline desde el
  original sin cuantizar (`scratchpad/mt/edges.html`); líneas limpias/continuas para el reveal de S5 (ver sección S5).
- **Original intacto** en `C:\Users\lokih\Downloads\Nueva carpeta (2)\logo.glb` — NUNCA sobrescribir.
- Harness de re-validación: `scratchpad/mt/` (serve.cjs:5181 + index.html 3-cell + cap.ps1). Notas viejas:
  `…/991ec9e8/scratchpad/model-report.md` (su escalada "97k = liso" resultó OPTIMISTA; el fix real es no simplificar).

## Issues diferidos globales (registrados, no perder)
- Ribbon (`ScrollLine` `buildPath`) cruza la tipografía editorial — afinar waypoints para que
  el ribbon hile el espacio negativo, nunca sobre headline/body.
- 1920+: contenido S1 pegado a la izquierda (`max-w-[1180px]`), spine huérfano, tercio
  derecho vacío. Ensanchar/centrar para ≥1536.
- `.s1-frame` usa `object-fit:cover` → corta la UI de la captura; considerar crop autoral / contain.
- Reel modal (`VideoPanel`) sin semántica de diálogo: `role="dialog" aria-modal`, focus trap +
  restore, Close visible.
- Spine S1..S5 anuncia secciones aún no construidas.

## Harness de verificación (scratchpad de la sesión)
- `s1-cap.ps1` (`-W -H -Prefix -Frames -Sel`) — scroll vía CDP wheel, viewport exacto vía
  `Emulation.setDeviceMetricsOverride` (las ventanas remote-debug clampan a ~484px).
- `cdp-audit.ps1` (consola+red), `states-cap.ps1` (reduced-motion + no-WebGL), `measure.ps1`.
- Dev server: `npm run dev` → http://localhost:5173. Extensión de browser NO conectada;
  Playwright vetado. Usar headless Chrome CDP.
