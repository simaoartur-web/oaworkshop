# O+A Workspace — Verificação Final de Memória, DOM e Recursos WebGL (Fase 04 Hardening)

- **Agente:** Gemini C (Performance, Arquitetura & Eficiência Técnica · Investigação Independente)
- **Commit integrado auditado:** `37265d5914f161bd9a45f688b8f85f48fffdd7b0` (`codex/f02-integration-preview`)
- **Worktree & Branch exclusivos:** `codex/f04c-memory-verification` (`D:\projects\O+A Architecture and Planners\Main\oaworkspace-f04c-memory-verification`)
- **Relatórios de referência:** `docs/audits/phase04-performance-postmerge.md` (branch `codex/f04c-postmerge-performance`) e [009-phase-04-integration.md](../../plans/009-phase-04-integration.md) (secção 5)
- **Data da recolha empírica:** `2026-11-17`
- **Âmbito:** Investigação empírica independente sem alterações ao código de produção nem merges.

---

## Sumário Executivo e Veredicto Técnico

**Conclusão principal:** **Não foi confirmada nenhuma fuga linear progressiva (`O(n)`) de memória JavaScript, nós DOM, event listeners ou recursos WebGL na aplicação após o hardening do commit `37265d5`.**

Quando o mesmo fluxo de 10 e **20 ciclos completos** (`Dossier -> /model -> trocar para .gltf -> voltar para .glb -> Voltar ao Dossier`) é reproduzido num browser Chromium limpo **sem reter handles de instrumentação (`ElementHandle`) nem referências fortes em `Set`**, os indicadores estabilizam completamente a partir do 1.º ciclo:

| Indicador Pós-GC (fluxo limpo `subY`, sem `waitForSelector`) | Baseline (Dossier) | Ciclo 1 (pós-saída) | Ciclo 10 (pós-saída) | Ciclo 20 (pós-saída) | Taxa após Ciclo 1 (C1 → C20) | Diagnóstico Final |
|---|---:|---:|---:|---:|---|---|
| **Nós CDP (`Nodes` / `DOMCounters.nodes`)** | `540` | `1 199` | `1 199` | **`1 199`** | **`0` / ciclo** | Estável (`O(1)`) |
| **`JSEventListeners` (CDP)** | `210` | `236` | `236` | **`236`** | **`0` / ciclo** | Estável (`O(1)`) |
| **Nós DOM *detached* (`HeapSnapshot det=2`)** | `0` | — | `527` | **`520`** | **`0` / ciclo** | `O(1)` (apenas último palco R3F) |
| **`WebGL2RenderingContext` vivos no heap** | `0` | — | `1` *(lost)* | **`1`** *(lost)* | **`0` / ciclo** | `9/10` (e `19/20`) recolhidos pelo GC |
| **`JSHeapUsed` pós duplo-GC (`MB`)** | `4.141` | `7.744` | `9.694` | **`9.940`** | Desacelera: `+0.296 -> +0.019 MB/ciclo` | Assintótico (JIT + buffers Chrome) |

### Origem exata das métricas apresentadas no relatório de integração (`plans/009`)

1. **`11` contextos WebGL em 10 ciclos (`1` `detect` + `10` `<Canvas>`):** **Confirmado e legítimo (`O(1)`).** É o resultado esperado do hardening: `detectWebGLSupport()` em `glbInspector.ts` corre `1` única vez em cache com `WEBGL_lose_context.loseContext()`, trocas internas `.glb <-> .gltf` preservam o mesmo `<canvas>` (`0` novos contextos), e sair/entrar de `/model` destrói `1` `<Canvas>` anterior (`forceContextLoss()`) e cria `1` novo.
2. **Nós CDP (`540 -> 9 369`) e `JSEventListeners` (`195 -> 644`):** **Artefacto de instrumentação (`ElementHandle` não descartado) + `1` resíduo constante `O(1)` do R3F.**
   - Nos scripts anteriores que usavam `await page.waitForSelector(...)` sem chamar `await handle.dispose()`, o Playwright retinha no grupo `InjectedScript / DevTools console` (`Global handles` do V8) um `ElementHandle` para o `<h1>` do Dossier e/ou elementos do `/model` por cada ciclo. Como o React remove apenas o nó-raiz ao desmontar uma página e mantém a subárvore interna ligada entre si, reter `<h1>` impedia o GC de recolher toda a página desmontada (`~235` nós no Dossier + `~659` nós no Viewer = `~894–924` nós/ciclo).
   - Provado por contraprova direta em `5` ciclos: `waitForSelector` **sem `.dispose()`** gera `+924` nós/ciclo (`545 -> 5 167`) e `+43` listeners/ciclo (`223 -> 438`); o mesmo código **com `.dispose()`** estabiliza em **`1 236` nós e `249` listeners do Ciclo 1 ao Ciclo 5 (`+0`/ciclo)**.
3. **`40` texturas, `20` programas e `30` framebuffers remanescentes:** **Falso positivo dos `Set` fortes na instrumentação + recursos internos do `Three.js` r187 já libertados na GPU por `forceContextLoss()`.**
   - `WebGLState` (`three.module.js:9889-9893`) cria `4` `emptyTextures` por renderer; `WebGLRenderer` (`linhas 16284-16286`) cria `3` framebuffers auxiliares (`_scratchFramebuffer`, `_srcFramebuffer`, `_dstFramebuffer`); e `programCache.dispose()` (`linhas 7766-7770`) não invoca `gl.deleteProgram` sobre os `2` shaders compilados (`Plinth_Travertine` e material de linha) antes de o R3F invocar `gl.forceContextLoss()`.
   - Instrumentando com **`WeakRef` + `FinalizationRegistry` + `isContextLost()`**, verifica-se que **`45/50` texturas, `38/40` programas e `27/30` framebuffers foram finalizados pelo GC**, `100%` dos `1 030` `WebGLBuffer` foram explicitamente eliminados via `gl.deleteBuffer()`, `10/11` contextos tinham `lostNow: "gc_collected"`, e o 11.º contexto (único vivo no wrapper) tinha **`isContextLost() === true`**.
4. **Causa do único bloco residual `O(1)` (`540 -> 1 199`, `520` nós *detached* e `1` `<canvas>` retido após sair de `/model`):** **Variável global de módulo `let state` em `@react-three/fiber@9.8.2` (`events-e51d7528.esm.js:17547`, minificada como `Jr`).** No final de `loop(timestamp)`, R3F nunca limpa `state = undefined`, mantendo o último snapshot pré-unmount (`state.events.connected` e `state.gl.domElement`) acessível até um novo `<Canvas>` executar `loop()`. Esse objeto retém **apenas 1** árvore desligada do último visualizador visitado e **nunca cresce entre ciclos (`527` no C10 vs `520` no C20)**.

---

## 1. Metodologia, Ambiente e Isolamento de Variáveis

- **Runtime:** Windows (`win32-x64`), Node.js `v24.13.0`, Chromium/Edge Headless `157.0.4341.60` (`playwright-core`), servidor estático `vite preview` sobre `npm run build` limpo (`2 785` módulos, sem modificações ao código).
- **Normalização de GC:** Antes de cada leitura (`Performance.getMetrics` e `Memory.getDOMCounters`), executou-se duplo ciclo `HeapProfiler.collectGarbage` separado por `150 ms`. Para os snapshots V8 (`HeapProfiler.takeHeapSnapshot`), analisou-se o grafo completo (`nodes`, `edges`, `strings`, `detachedness`) calculando caminhos de retenção estritamente **fortes** a partir de `(GC roots)` (ignorando arestas `weak`).
- **Braços experimentais executados em contextos isolados (`1440 × 900`, `deviceScaleFactor: 1`):**
  1. **Braço `arm1A` (`waitForSelector` apenas no Dossier, 20 ciclos 3D + trocas `.gltf`/`.glb`):** zero hooks JS; 4 snapshots V8 (`baseline`, `cycle_1`, `cycle_10`, `cycle_20`) + leitura pós-repouso `+2s` e pós-saída para `/workspace/settings`.
  2. **Braço `arm1B` (`waitForSelector` no Dossier, 20 ciclos 3D sem troca de modelo):** isola o impacto das trocas `.gltf`/`.glb`.
  3. **Braço `arm1C` (controlo 2D com `waitForSelector`, 20 ciclos `Dossier <-> /workspace/projects` + alternância `Lista técnica`/`Galeria`):** 3 snapshots V8 (`baseline`, `cycle_10`, `cycle_20`).
  4. **Braço `subX` (20 ciclos 3D com `locator` + `waitForFunction`, zero `waitForSelector`).**
  5. **Braço `subY` (20 ciclos 3D por cliques DOM puros em `evaluate` + `waitForFunction`, zero `ElementHandle`/`locator`):** 2 snapshots V8 (`cycle_10`, `cycle_20`) + leitura pós-repouso `+2s`.
  6. **Braço `subZ` (controlo 2D por cliques DOM puros + `waitForFunction`, 20 ciclos):** 1 snapshot V8 (`cycle_20`).
  7. **Contraprova `verify-handle-proof` (5 ciclos 3D):** comparação direta A/B usando `waitForSelector` em `/model` e Dossier **com vs. sem `await handle.dispose()`**.
  8. **Braço `arm2` (10 ciclos WebGL com `WeakRef` + `FinalizationRegistry`):** identifica a origem (`stack` + shader) dos recursos criados e verifica finalização real sem `Set` fortes.
  9. **Braço `arm3` (P0 Segurança, `WEBGL_lose_context` -> recuperação, DPR/Idle GPU) + Gates (`lint`, `test`, `test:e2e`).**

---

## 2. Reprodução em 10 e 20 Ciclos: Comparação 3D vs 2D vs Instrumentação

### 2.1 Evolução completa de `Nodes`, `JSEventListeners` e `JSHeapUsed` (`0 -> 20` ciclos)

| Braço / Condição de Medição | Baseline (`0`) | Ciclo `1` | Ciclo `5` | Ciclo `10` | Ciclo `15` | Ciclo `20` | `+2s` pós-C20 | Declive C1 → C20 |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| **`plans/009` (relatório integração)** | `540` nós / `195` list. | `8.46 MB` | — | `9 369` nós / `644` list. (`11.61 MB`) | — | — | — | `+883` nós/ciclo · `+45` list./ciclo |
| **`arm1A` (3D swaps + `waitForSelector` Dossier)** | `545` / `223` (`5.09 MB`) | `1 471` / `266` (`8.79 MB`) | `2 411` / `334` (`10.22 MB`) | `3 586` / `419` (`11.14 MB`) | `4 761` / `504` (`11.49 MB`) | `5 936` / `589` (`11.72 MB`) | `5 936` / `589` (`11.72 MB`) | `+235.0` nós/ciclo · `+17.0` list./ciclo |
| **`arm1B` (3D sem swaps + `waitForSelector` Dossier)** | `545` / `223` (`5.11 MB`) | `1 449` / `266` (`8.24 MB`) | `2 389` / `334` (`9.68 MB`) | `3 564` / `419` (`10.78 MB`) | `4 739` / `504` (`11.04 MB`) | `5 914` / `589` (`11.31 MB`) | — | `+235.0` nós/ciclo · `+17.0` list./ciclo |
| **`arm1C` (2D controlo + `waitForSelector` Dossier)** | `545` / `223` (`5.10 MB`) | `780` / `240` (`5.43 MB`) | `1 720` / `308` (`5.98 MB`) | `2 895` / `393` (`6.44 MB`) | `4 070` / `478` (`6.66 MB`) | `5 245` / `563` (`6.86 MB`) | — | **`+235.0` nós/ciclo · `+17.0` list./ciclo** |
| **`subX` (3D swaps, `locator` + `waitForFunction`)** | `540` / `210` (`4.14 MB`) | `1 207` / `249` (`8.63 MB`) | `1 207` / `249` (`9.99 MB`) | **`1 207` / `249`** (`10.74 MB`) | `1 207` / `249` (`10.98 MB`) | **`1 207` / `249`** (`11.06 MB`) | — | **`0.0` nós/ciclo · `0.0` list./ciclo** |
| **`subY` (3D swaps, DOM puro sem handles)** | `540` / `210` (`4.14 MB`) | `1 199` / `236` (`7.74 MB`) | `1 199` / `236` (`8.93 MB`) | **`1 199` / `236`** (`9.69 MB`) | `1 199` / `236` (`9.84 MB`) | **`1 199` / `236`** (`9.94 MB`) | `1 199` / `236` (`9.94 MB`) | **`0.0` nós/ciclo · `0.0` list./ciclo** |
| **`subZ` (2D controlo, DOM puro sem handles)** | `540` / `210` (`4.14 MB`) | `540` / `210` (`4.31 MB`) | `540` / `210` (`4.63 MB`) | **`540` / `210`** (`4.92 MB`) | `540` / `210` (`4.96 MB`) | **`540` / `210`** (`5.02 MB`) | — | **`0.0` nós/ciclo · `0.0` list./ciclo** |

### 2.2 Contraprova direta em 5 ciclos: `waitForSelector` sem vs. com `.dispose()` (`f04-handle-proof.json`)

| Estratégia com os mesmos seletores (`#dossier-project-heading`, `[data-viewer-status="loaded"]`, `canvas`, `MOD-OA-101-*`) | Baseline | Ciclo 1 | Ciclo 2 | Ciclo 3 | Ciclo 4 | Ciclo 5 | Crescimento C1 → C5 |
|---|---:|---:|---:|---:|---:|---:|---|
| **`waitForSelector` SEM `.dispose()`** (`disposeHandles: false`) | `545` / `223` (`5.09 MB`) | `1 471` / `266` (`8.77 MB`) | `2 395` / `309` (`9.67 MB`) | `3 319` / `352` (`10.12 MB`) | `4 243` / `395` (`10.30 MB`) | **`5 167` / `438`** (`10.53 MB`) | **`+924` nós/ciclo · `+43` list./ciclo** |
| **`waitForSelector` COM `.dispose()`** (`disposeHandles: true`) | `545` / `223` (`5.05 MB`) | `1 236` / `249` (`8.74 MB`) | `1 236` / `249` (`9.54 MB`) | `1 236` / `249` (`9.87 MB`) | `1 236` / `249` (`9.94 MB`) | **`1 236` / `249`** (`10.07 MB`) | **`0` nós/ciclo · `0` list./ciclo** |

**Leitura objetiva:**
- A curva `+924` nós/ciclo e `+43` listeners/ciclo em `waitForSelector` sem `.dispose()` projeta **`9 785` nós** e **`653` listeners** ao 10.º ciclo — reproduzindo diretamente a ordem de grandeza observada em `plans/009` (`9 369` nós e `644` listeners).
- Os braços `arm1A`, `arm1B` e `arm1C` provam que esse crescimento de `+235` nós/ciclo era **idêntico no fluxo 2D puro e nos fluxos 3D**, porque todos partilhavam a chamada `await page.waitForSelector('#dossier-project-heading')` não libertada (`+1` subárvore `<article>` de Dossier com `6` `<dt>`, `1` `<h1 id="dossier-project-heading">` e `17` listeners por ciclo).
- Além disso, navegar de `/workspace/projects/sd-proj-oa-26-101` para `/workspace/settings` em `arm1A` após o Ciclo 20 manteve `liveDomNodes = 316` e `detachedEstimatedNodes = 5 775` (os handles aguardados permanecem vivos até `ctx.close()`).

---

## 3. Análise Forense de Heap Snapshots, R3F, WebGL e Recursos Gráficos

### 3.1 Objetos alcançáveis pós-GC entre Baseline, 3D Ciclo 10, 3D Ciclo 20 e 2D Ciclo 20 (`subY` e `subZ`, sem handles)

| Construtor / Nó no V8 HeapSnapshot | `arm1a_baseline` (Dossier) | `subY_3d_cycle_10` (3D C10) | `subY_3d_cycle_20` (3D C20) | `subZ_2d_cycle_20` (2D C20) | Variação Real C10 → C20 (3D) |
|---|---:|---:|---:|---:|---|
| **Nós DOM *detached* (`detachedness === 2`)** | `0` | `527` | **`520`** | `0` | **`-7` (zero fuga)** |
| `object:HTMLCanvasElement` *(com `[det=2]`)* | `0` | `1` | **`1`** | `0` | **`0` (`1` último palco)** |
| `native:WebGL2RenderingContext` | `0` | `1` | **`1`** | `0` | **`0` (`1` último renderer)** |
| `object:GS` (`THREE.WebGLRenderer`) | `0` | `1` | **`1`** | `0` | **`0`** |
| `native:WebGLProgram` / `object:WebGLProgram` | `0` / `0` | `2` / `1` | **`2` / `1`** | `0` / `0` | **`0` / `0`** |
| `native:WebGLTexture` / `object:WebGLTexture` | `0` / `0` | `5` / `1` | **`5` / `1`** | `0` / `0` | **`0` / `0`** |
| `native:WebGLFramebuffer` / `object:WebGLFramebuffer` | `0` / `0` | `3` / `1` | **`3` / `1`** | `0` / `0` | **`0` / `0`** |
| `native:EventListener` | `234` | `247` | **`247`** | `221` | **`0`** |
| `object:JE` (`React FiberNode`) | `827` | `913` | **`913`** | `826` | **`0`** |
| `ResizeObserver` / `OrbitControls` extras retidos | `0` | `0` | **`0`** | `0` | **`0`** |
| `native:NavigationHistoryEntry` *(nativo Blink `history`)* | `5` | `25` | **`45`** | `45` | **`+20`** (`2` `navigate()`/ciclo) |
| `native:PerformanceResourceTiming` *(fetches `.glb`)* | `14` | `61` | **`103`** | `78` | **`+42`** (buffer Chrome) |
| `native:PerformanceScriptTiming` *(Long Animation Frames)* | `15` | `57` | **`102`** | `12` | **`+45`** (telemetria Chrome) |
| **Total de nós no `.heapsnapshot` (`totalNodes`)** | `141 105` | `219 040` | `221 310` | `133 382` | `+2 270` (`+1.0%` JIT/Perf) |

**O que explica o pequeno aumento residual de `JSHeapUsed` em `subY` (`7.74 -> 9.69 -> 9.94 MB`)?**
Entre os ciclos `10` e `20` (`+305 kB` em `totalSelfSizeBytes` do snapshot / `+246 kB` no `JSHeapUsed`):
- **`+230 kB` em artefactos de compilação JIT do V8:** `code::system / InstructionStream` (`+146.5 kB`, `+123`), `system / TrustedByteArray` (`+38.6 kB`), `ProtectedFixedArray` (`+21.8 kB`), `Code` (`+8.9 kB`), `AllocationSite` e `Map` conforme funções quentes do `GLTFLoader` / Three.js atingem otimização TurboFan.
- **Buffer nativo de telemetria e histórico do Chromium:** `NavigationHistoryEntry` (`+20` entradas de `BrowserRouter`, `+3.8 kB`), `PerformanceResourceTiming` + `NetworkResourcesData` (`+42` entradas dos `fetch()` de `.glb`, `+18.1 kB`), `LayoutShift` + `DOMRectReadOnly` (`+240` objetos, `+25.8 kB`) e `PerformanceLongAnimationFrameTiming` / `PerformanceScriptTiming` (`+18.9 kB`). O ritmo cai de `+0.296 MB/ciclo` (`C1->C5`) para `+0.154 MB/ciclo` (`C5->C10`), `+0.030 MB/ciclo` (`C10->C15`) e **`+0.019 MB/ciclo` (`C15->C20`)**.

---

### 3.2 Cadeia de retenção forte real no Heap (`subY_3d_cycle_20.heapsnapshot`)

O rastreio BFS de caminhos fortes a partir de `(GC roots)` (excluindo arestas `weak`) demonstrou com exatidão porque o **último** palco `<Canvas>` (`520` nós *detached*) permanece alcançável após sair de `/model`:

1. **`<main id="workspace-main-content">` (DOM vivo em `WorkspaceShell.tsx`)** guarda `__reactFiber$...` (`JE`).
2. Na sua cadeia React `Fiber.child`, o objeto de `React.Context` envolvido por `its-fine` (`node_modules/its-fine/dist/index.js:18-33`, usado pelo `<Canvas>` do `@react-three/fiber`) expõe `get _currentRenderer2`.
3. V8 agrupa as closures do chunk `ModelViewerStage-*.js` no mesmo contexto lexical de módulo (`object:system / Context / scope`). Nesse mesmo módulo encontra-se a variável de módulo do `@react-three/fiber@9.8.2`:
   - Ficheiro fonte: `node_modules/@react-three/fiber/dist/events-e51d7528.esm.js:17547-17566` (`let state;` minificado para `Jr` em `ModelViewerStage-Ds5jXT5m.js`).
   - Dentro de `function loop(timestamp)`, linha `17560`: `state = root.store.getState();`.
   - Ao desmontar `<Canvas>`, `unmountComponentAtNode` (`linha 17456`) chama `state.events.disconnect()` (`linha 17819`), que remove corretamente todos os listeners do DOM e faz `set(state => ({ events: { ...state.events, connected: undefined } }))` — criando um **novo** objeto de estado na store Zustand, enquanto a variável de módulo `let state` continua a apontar para o **snapshot antigo pré-unmount**.
   - Quando `_roots` fica vazio e `loop()` termina (`cancelAnimationFrame`), `state` nunca é reposto a `undefined`.
4. Esse único snapshot antigo aponta para:
   - `state.gl` (`WebGLRenderer`) -> `domElement` (`<canvas data-engine="three.js r187">` `[det=2]`) -> `WebGL2RenderingContext` *(já perdido com `forceContextLoss()`)*;
   - `state.events.connected` -> `<div ...>` do `CanvasImpl` -> elemento pai `<div data-testid="model-viewer-stage">` -> toda a subárvore interna desligada dessa última visita (`520` nós `[det=2]`, `1` conjunto de botões e SVGs da última prancha).
5. **Por que razão não acumula?** Na próxima abertura de `/model`, `loop()` sobrescreve a mesma variável única `let state` com o novo `RootState`, libertando imediatamente para o GC toda a visita anterior.

---

### 3.3 Investigação WebGL, `ResizeObserver`, `OrbitControls` e limpeza de contexto (`arm2_webgl_weakref_10cycles`)

Executados `10` ciclos completos (`Dossier -> /model -> .gltf -> .glb -> Dossier`) substituindo `Set`s fortes por `WeakRef` + `WeakMap` + `FinalizationRegistry` para não interferir com o GC:

| Recurso / Métrica (`arm2`, 10 ciclos) | Criados Total | `delete*` Explícitos | Não Chamou `delete*` | Finalizados por GC (`FinalizationRegistry`) | Wrappers JS Vivos pós-GC (`WeakRef`) | Estado Real |
|---|---:|---:|---:|---:|---:|---|
| **Contextos `detectWebGLSupport()`** | `1` | `1` (`loseContext()`) | `0` | — | `0` (`gc_collected`) | Em cache + perdido na origem (`glbInspector.ts:59-73`) |
| **Contextos `<Canvas>` (`stage`)** | `10` | `10` (`loseContext()`) | `0` | — | `1` (Ciclo 10: `lostNow === true`) | `9/10` recolhidos; `10.º` perdido via `forceContextLoss()` |
| **`WebGLBuffer`** | `1 030` | `1 030` | **`0`** | `1 030` | **`0`** | **100% libertados** (`disposeThreeObjectResources`) |
| **`WebGLTexture`** | `50` | `10` | `40` | **`45`** | `5` *(Ciclo 10)* | Os `40` não-eliminados são as `4` `emptyTextures` de `new WebGLState` (`three.module.js:9889-9893`) por contexto |
| **`WebGLProgram`** | `40` | `20` | `20` | **`38`** | `2` *(Ciclo 10)* | Os `2` por contexto (`Plinth_Travertine` + shader linha) ficam em `programCache.programs` até `forceContextLoss()` (`three.module.js:7766-7770`) |
| **`WebGLFramebuffer`** | `30` | `0` | `30` | **`27`** | `3` *(Ciclo 10)* | Os `3` por contexto são `_scratch`, `_src` e `_dst` internos do `WebGLRenderer` (`three.module.js:16284-16286`) |

- **`ResizeObserver` e `OrbitControls`:** Sem fugas. Em `CanvasImpl` (`react-three-fiber.esm.js:42`), `react-use-measure` desliga o `ResizeObserver` na desmontagem; em `OrbitControls.js:37`, `controls.dispose()` remove todos os listeners de ponteiro/roda/teclado (confirmado por `Native:EventListener` constante em `247` entre o Ciclo 10 e o Ciclo 20).
- **Ordem de efeitos no React / R3F:** Em `ModelViewerStage.tsx:140-145` e `322-328`, `renderLists?.dispose()` e `THREE.Cache.clear()` executam corretamente no cleanup; em `ArchitecturalModelViewer.tsx:240-244`, `releaseCurrentScene()`, `revokeActiveObjectUrl()` e `localBuffers.clear()` executam na desmontagem. Como melhoria opcional menor em `ModelViewerStage.tsx`, o único aviso de consola nos 20 ciclos foi `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` (emitido internamente pelo R3F em `three@^0.187.0`, `20` avisos em `20` montagens).

---

## 4. Classificação Final dos Achados (`P0` / `P1` / `P2` / Descartado)

| Código | Classificação | Problema Analisado | Veredicto Técnico & Evidência |
|---|---|---|---|
| **F04-MEM-01** | **Artefacto de Teste** *(Não é bug da app)* | Crescimento linear de Nós CDP (`540 -> 9 369`) e `JSEventListeners` (`195 -> 644`) | Causado por chamadas `page.waitForSelector(...)` no harness de verificação sem `handle.dispose()`, retendo as subárvores *detached* via CDP `InjectedScript / Global handles`. Sem `waitForSelector` (ou com `.dispose()`), a taxa cai para **`0` nós/ciclo** até ao Ciclo 20. |
| **F04-MEM-02** | **Artefacto de Medição + Interno `Three.js` (`O(1)`)** | Contagem remanescente de `40` texturas, `20` programas e `30` framebuffers | `4` `emptyTextures` (`WebGLState`), `3` FBOs internos (`WebGLRenderer`) e `2` programas em `programCache` não chamam `gl.delete*` antes de `forceContextLoss()`. Os contadores globais em `Set` acumulavam handles já destruídos pelo contexto perdido e impediam o GC dos wrappers. Com `WeakRef` + `FinalizationRegistry`, `45/50`, `38/40` e `27/30` são finalizados e `9/10` contextos recolhidos. |
| **F04-MEM-03** | **`P2` / Opcional (`O(1)` externo em `@react-three/fiber@9.8.2`)** | Retenção constante do último palco desmontado (`520` nós `det=2`, `1` `<canvas>` com contexto perdido, `+26` listeners) | Causado por `let state` de módulo em `events-e51d7528.esm.js:17547` nunca reposto a `undefined` quando `_roots` esvazia. **Não cresce linearmente** (C1 = C10 = C20 = `1 199` nós) e o contexto WebGL está explicitamente perdido (`isContextLost() === true`). Recomenda-se correção apenas se se pretender `0` nós *detached* após saída do `/model`. |
| **F04-MEM-04** | **Normal / Esperado** | Delta inicial `4.14 -> 7.74 MB` e abrandamento assintótico `7.74 -> 9.94 MB` até C20 | Carregamento sob demanda único dos chunks 3D (`1.09 MB` JS), compilação JIT `InstructionStream` do V8 e entradas nativas do Chromium (`NavigationHistoryEntry`, `PerformanceResourceTiming`, `PerformanceScriptTiming`). Não há retenção crescente de aplicação (`+0.019 MB/ciclo` em C15->C20). |

### Recomendação da menor correção possível (se aplicável)

1. **Correção imediata de verificação (sem alterar `src/`):** Substituir `page.waitForSelector(...)` por `page.locator(...).waitFor(...)` / `page.waitForFunction(...)` ou invocar `await handle.dispose()`, e rastrear recursos WebGL com `WeakRef` + verificação de `ctx.isContextLost()` nos scripts de auditoria.
2. **Menor correção possível para o resíduo `O(1)` de `520` nós após saída de `/model` (opcional / baixa prioridade):**
   - O bloqueio reside em `node_modules/@react-three/fiber/dist/events-e51d7528.esm.js:17547-17566`, onde limpar `state = undefined;` imediatamente após o loop `for (const root of _roots.values())` (ou quando `_roots.size === 0`) elimina `100%` da retenção pós-unmount num único patch de 1 linha (`patch-package` ou upgrade upstream do R3F quando corrigido), fazendo descer `subY` pós-saída de `1 199` nós para os `540` nós exatos da baseline.
   - **Nota sobre impacto no código da app:** Não é necessário nem aconselhável aplicar workarounds invasivos em React DOM sobre nós geridos pelo `CanvasImpl`; como o comportamento atual já é estritamente `O(1)` e liberta 100% do contexto WebGL e dos `WebGLBuffer`s em cada desmontagem, **nenhuma alteração urgente ao código de produção é necessária para aprovar a Fase 04**.

---

## 5. Verificação de Não-Regressão P0 (Segurança, Ciclo de Vida e GPU)

Confirmado integralmente no commit `37265d5` (braço `arm3` em Chromium D3D11 + suítes oficiais do repositório):

| Verificação P0 | Resultado Exato Observado |
|---|---|
| **Isolamento do motor 3D antes de `/model`** | `0` pedidos de chunks `ModelEngine`, `ModelViewer`, `three` ou `.glb`/`.gltf` até entrar na rota 3D (`preModel3DRequests: []`). |
| **Preservação do `<Canvas>` nas trocas `.glb <-> .gltf`** | `allSameCanvasAcrossSwaps: true` durante 20 ciclos seguidos (`1` contexto stage por visita, `0` recriações em trocas internas). |
| **Perfis GPU, DPR & `preserveDrawingBuffer`** | A `deviceScaleFactor = 2` (`636.7 × 468 CSS px`), backing store `954 × 702 px` (**`effectiveDpr = 1.498`**, teto `1.5`), `gl.getContextAttributes().preserveDrawingBuffer === false`, `powerPreference === "default"`. Em `3 000 ms` de repouso: `rafCalls: 0`, `drawCalls: 0`, `clearCalls: 0`. |
| **Recuperação real de perda WebGL (`WEBGL_lose_context`)** | Com `MOD-OA-101-GLTF` ativo, invocar `loseContext()` transitou para `data-viewer-status="webgl_unavailable"` (`loadState="error"`); clicar no botão de recuperação restaurou o palco para `data-viewer-status="loaded"`, `loadState="ready"` e **`recoveredModelCode="MOD-OA-101-GLTF"`** preservado. |
| **Bloqueio de segurança `.gltf` (`data:image/svg+xml` e URI externa)** | Uploads de `malicious-svg.gltf` e `external-deps.gltf` falharam honestamente em `data-viewer-status="error_invalid"` (`loadState="error"`) com **`0` pedidos de rede externos** (`blockedUriExternalRequests: []`). |
| **`npm run lint` (`eslint .`)** | **Passou** (`0` erros, `0` avisos, `LINT_EXIT=0`). |
| **`npm run test` (`vitest run`)** | **Passou** (`11/11` ficheiros, **`86/86` testes** em `60.34 s`, `TEST_EXIT=0`; inclui `modelEngineSecurity.test.tsx`, `projectLibrarySecurity.test.tsx`, `modelViewer.test.tsx` e `modelEngine.test.tsx`). Emite apenas `THREE_CJS_DEPRECATED` esperado em ambiente `jsdom`. |
| **`npm run test:e2e` (`scripts/e2e-verify-entry.mjs`)** | **Passou** (`E2E Verification PASSED cleanly`, `E2E_EXIT=0` nas larguras `1440×900`, `1440×680`, `768×1024`, `720×450` e `375×812` com WebGL real). |
