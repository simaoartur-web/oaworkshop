# Auditoria Independente de Performance — O+A Workspace (Fase 04.5)

- **Responsável:** Agente C (Performance, Arquitectura e Eficiência Técnica)
- **Commit consolidado auditado (`codex/f02-integration-preview`):** `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5`
- **Commit base de comparação:** `37265d5914f161bd9a45f688b8f85f48fffdd7b0`
- **Branch / Worktree de auditoria:** `codex/f045c-performance-final` (`oaworkspace-f045c-performance-final`)
- **Documento de referência consultado:** [plans/013-phase-045-integration.md](../../plans/013-phase-045-integration.md)
- **Política:** Auditoria pura e independente — zero alterações a código de produção e zero merges.

---

## Sumário Executivo

As optimizações da Fase 04.5 alcançaram ganhos reais e reproduzíveis em três frentes fundamentais:
1. **Isolamento completo do motor 3D:** zero bytes de `vendor-three`, `vendor-r3f`, `ModelViewerStage`, `ProjectModelEnginePage` ou activos `.glb`/`.gltf` antes da navegação explícita para `/workspace/projects/:id/model` (confirmado em acesso directo e em fluxo SPA completo).
2. **Entrada inicial (`/login`) significativamente mais leve:** `-48.5%` de JS raw (`830.16 -> 427.94 KiB`), `-42.5%` em zlib gzip (`233.48 -> 134.21 KiB`; `-42.6%` em `encodedBodySize` HTTP `234.14 -> 134.46 KiB`), reduzindo o tempo até pronta interacção em `-17.4%` sem fontes externas (`689.4 -> 569.4 ms`), `-13.8%` em Fast 4G + CPU 4× (`3 095.2 -> 2 667.7 ms`) e `-13.3%` em Mobile Lento + CPU 4× (`5 865.9 -> 5 086.0 ms`).
3. **Pesquisa Global e cache canónico em O(1):** eliminação integral de `localStorage.getItem` (`10 -> 0` por 10 teclas) e `JSON.parse` (`10 -> 0` em 50/200 projectos), com redução do processamento síncrono `ScriptDuration` de `-41.6%` (`N=50`) a **`-69.8%` (`N=200`: `138.54 -> 41.78 ms`)**.

Contudo, a investigação independente **confirmou e explicou fisicamente** as regressões de mediana reportadas em `plans/013` para `/welcome`, `/workspace` (Studio Desk) e `/model`, identificando **quatro mecanismos estruturais concretos**:

1. **Bloqueio de `preloadInitialBrowserRoute()` pelo `<link rel="stylesheet">` de Google Fonts (`index.html:10-13`):** em loopback conectado, a folha de estilos externa bloqueou a execução do módulo de entrada durante **`702–853 ms`**. Na Base (`37265d5`), todo o código não-3D já vinha no bundle inicial paralelo; na Final (`4197c2e`), `preloadInitialBrowserRoute()` só corre quando `index-PUOSDjJu.js` executa *após* as fontes (`t = 799–951 ms`), empurrando toda a 2.ª vaga de chunks para depois do bloqueio das fontes.
2. **Duplo ciclo `<Suspense>` + montagem síncrona de skeletons em cache fria/quente (mesmo sem Google Fonts):** em loopback com fontes bloqueadas, `/welcome` regride **`+44.6%` frio (`391.1 -> 565.5 ms`)** e **`+63.7%` quente (`392.0 -> 641.9 ms`)**; `/workspace` regride **`+31.4%` frio (`553.0 -> 726.8 ms`)** e **`+56.0%` quente (`500.1 -> 780.3 ms`)**. O CDP Tracing prova que o `<EditorialEntryLoadingFallback>` monta primeiro (`t = 158.7–193.8 ms`), consome um ciclo inteiro de `Layout + Paint` (`FCP` prematuro) e força o escalonamento subsequente do conteúdo real (`h1` atrasado de `268.1 -> 461.4 ms` em `/welcome` e de `564.9 -> 730.4 ms` em `/workspace`), agravado por `framer-motion` (`vendor-motion`, `122.74 kB` raw / `39.06 KiB` gzip) usado apenas para dois fades iniciais com `opacity: 0` em `StudioDeskPage.tsx` e `StudioOpening.tsx`.
3. **Serialização em 3 ondas no `/model` sob latência + CPU modesta (`+32.3%` em Fast 4G + CPU 4×):** a abertura fria directa em Fast 4G (`40 ms` RTT, `10 Mbps`) + CPU 4× sobe de **`6 807.8 ms` para `9 005.8 ms` (`+32.3%`)** devido a: Onda 1 (`4` JS) → Fallback 1 → Onda 2 (`7` JS, saturando as 6 ligações simultâneas HTTP/1.1 por origem até `1 071.7 ms`) → Fallback 2 → só aos `6 909.2 ms` inicia o fetch `.glb` → só após o parsing (`status === 'loaded'` em `ArchitecturalModelViewer.tsx:913`) dispara a Onda 3 (`ModelViewerStage` + `vendor-r3f` aos `7 174.2 ms`), somando `+572.6 ms` de `ScriptDuration` e `+611.0 ms` de `LayoutDuration`.
4. **Abertura do Studio Desk com 200 projectos sintéticos sem virtualização de DOM:** quando os projectos pertencem a outros colaboradores (`200_mixed`), o filtro padrão `my_work` renderiza apenas `2` cartões (`757.8 ms` @ 1× CPU), mascarando o custo de UI. Quando `200` projectos pertencem ao utilizador activo (`200_owned` -> `197` cartões, **`10 670` nós DOM**), `ProjectOverviewPanel` renderiza todos os artigos sem virtualização nem paginação, levando a abertura fria em CPU 4× para **`14 335.5 ms` (`14.34 s`)** e a troca de âmbito para `Todos os registos` para **`3 327.57 ms` (`3.33 s`)**.

---

## 0. Metodologia, Ambiente e Instrumentação

- **Alvos comparados em A/B estrito (`vite preview --host 127.0.0.1`):**
  - **Base (`37265d5`):** worktree `oaworkspace-f04c-memory-verification` (diferencial `git diff --stat 37265d5..HEAD -- src vite.config.ts index.html package.json` vazio — binário e código de aplicação idênticos a `37265d5`).
  - **Final (`4197c2e`):** worktree `oaworkspace-f045c-performance-final` (`HEAD = 4197c2ef4c71dbdc7bd00617d16d77111eba0bc5`).
- **Motor de browser:** Google Chrome **`157.0.8103.79`** (`--headless=new`, `--enable-webgl`, `--use-gl=angle`, `--use-angle=swiftshader`), viewport `1440×900`, sessões e caches isoladas por iteração com execução intercalada Base/Final para eliminar deriva térmica.
- **Perfis controlados avaliados:**
  1. `loopback_noblock_cold` (`N=5`): HTTP/1.1 localhost sem throttling, fontes Google Fonts activas, cache HTTP limpa (`Network.clearBrowserCache` + `setCacheDisabled(true)`).
  2. `loopback_fontsblocked_cold` (`N=7`): HTTP/1.1 localhost, `fonts.googleapis.com` e `fonts.gstatic.com` abortados para isolar transferência/execução/render de código próprio, cache fria.
  3. `loopback_fontsblocked_warm` (`N=5`): segundo carregamento em contexto aquecido com HTTP cache activa (registado comportamento real `cache-control: no-cache` emitido pelo `vite preview`).
  4. `fast4g_cpu4x_cold` (`N=5`) e `fast4g_cpu4x_warm` (`N=5`): CDP `10 Mbps` download / `5 Mbps` upload / **`40 ms` RTT** + **`Emulation.setCPUThrottlingRate(4)`**, fontes bloqueadas.
  5. `slow4g_cpu4x_cold` (`N=3`): CDP `1.6 Mbps` / `750 kbps` / **`150 ms` RTT** + **CPU `4×`**, fontes bloqueadas.
  6. **CDP Tracing:** captura directa de `devtools.timeline,v8.execute,blink.user_timing,loading` combinada com `MutationObserver` para datar montagem do skeleton vs `h1` real vs `telemetry-mounted` vs `<canvas>`.
- **Métricas colectadas:** `routeReadyMs` (`performance.now()` após selector específico de conteúdo real + ausência de loading skeletons + `2× requestAnimationFrame`), `FCP`, `LCP`, `DCL`, `load`, CDP `ScriptDuration`, `LayoutDuration`, `RecalcStyleDuration`, `TaskDuration`, `LongTasks (>50 ms)`, `Nodes`, `JSHeapUsedSize` e `PerformanceResourceTiming` por recurso.

---

## 1. Validação dos Ganhos de Bundle e Isolamento 3D

A auditoria binária directa sobre `dist/assets/` confirma integralmente a decomposição de bundles relatada em `plans/013-phase-045-integration.md` (§3.1) e a configuração de `resolveManualChunk` em `vite.config.ts`:

| Artefacto JS / CSS (`4197c2e`) | Raw (`kB` Vite / `KiB`) | Gzip (`KiB`) | Brotli (`KiB`) | Carregamento |
|---|---:|---:|---:|---|
| `index-PUOSDjJu.js` | `160.11 kB` (`156.36 KiB`) | `47.30` | `40.54` | Entrada (Onda 1) |
| `vendor-react-Bhi6XC7t.js` | `223.06 kB` (`217.83 KiB`) | `67.80` | `58.50` | Entrada (Onda 1) |
| `vendor-router-DtzEAF4P.js` | `39.20 kB` (`38.28 KiB`) | `13.79` | `12.41` | Entrada (Onda 1) |
| `vendor-icons-IyKiPRs-.js` | `15.85 kB` (`15.48 KiB`) | `5.32` | `4.57` | Entrada (Onda 1) |
| **Subtotal Entrada (`/login`)** *(Base: `830.16 KiB`)* | `438.22 kB` (**`427.94 KiB`**) | **`134.21`** | **`116.02`** | **4 pedidos JS (`-48.5%` raw)** |
| `WelcomePage-BmMflb8C.js` | `14.06 kB` (`13.73 KiB`) | `3.60` | `3.20` | Lazy (`/welcome`) |
| `WorkspaceShell-DDyY75Nc.js` + `shellNavigation` + `shellUiContext` | `39.55 kB` (`38.62 KiB`) | `10.60` | `9.33` | Lazy (`/workspace/*`) |
| `StudioDeskPage-Cyt5oaNE.js` + `useProjectLibrary` | `90.89 kB` (`88.76 KiB`) | `19.96` | `16.96` | Lazy (`/workspace`) |
| `vendor-motion-ezKDFZLS.js` | `122.74 kB` (`119.87 KiB`) | `39.06` | `34.99` | Lazy (só `/workspace`) |
| `ProjectLibraryCatalogPage` + `i18n-DtTWracp` + `projectExperienceContract` | `73.29 kB` (`71.56 KiB`) | `18.24` | `15.98` | Lazy (Biblioteca / Criação / Dossier) |
| `ProjectCreateEnginePage-w7gQJEcc.js` | `29.25 kB` (`28.56 KiB`) | `6.37` | `5.62` | Lazy (`/workspace/projects/new`) |
| `ProjectDossierShellPage-CwKWICks.js` + `i18n-yV620PlM` | `55.61 kB` (`54.31 KiB`) | `12.17` | `10.70` | Lazy (`/workspace/projects/:id`) |
| `WorkspaceSettingsPage` + `PlannedModuleView` | `17.68 kB` (`17.26 KiB`) | `4.27` | `3.76` | Lazy (`/settings` / planeadas) |
| `ProjectModelEnginePage-D3-4d6lf.js` | `91.31 kB` (`89.17 KiB`) | `21.72` | `19.05` | Lazy (só `/model` Onda 2) |
| `vendor-three-C7nzwtxH.js` | `798.92 kB` (`780.20 KiB`) | `200.59` | `163.13` | Lazy (só `/model` Onda 2) |
| `ModelViewerStage-BCrZfF1L.js` | `8.36 kB` (`8.16 KiB`) | `3.05` | `2.73` | Lazy (só `/model` Onda 3) |
| `vendor-r3f-DFAmaKRO.js` | `192.65 kB` (`188.13 KiB`) | `59.14` | `52.05` | Lazy (só `/model` Onda 3) |
| `index-Ehwn4u1S.css` *(Base: `61.38 KiB`)* | `63.70 kB` (`62.20 KiB`) | `10.84` | `8.76` | Entrada |
| **Total JS em `dist/`** *(Base: `1 899.50 KiB` / gzip `518.69` / br `429.84`)* | `1 963.18 kB` (**`1 917.16 KiB`**) | **`532.99`** | **`453.51`** | **+0.9% raw total; 3D isolado** |

### Prova de Isolamento 3D Antes de `/model`

Verificado via `PerformanceResourceTiming` em **todas** as execuções (acessos directos a `/login`, `/welcome`, `/workspace`, `/workspace/projects`, `/workspace/projects/sd-proj-oa-26-101`, `/workspace/settings` e jornada SPA sequencial `/login → /welcome → /workspace → /workspace/projects → /workspace/projects/sd-proj-oa-26-101`):
- **Activos 3D antes de `/model` (`vendor-three`, `vendor-r3f`, `ModelViewerStage`, `ProjectModelEnginePage`, `.glb`, `.gltf`):** **`0` pedidos · `0` bytes** tanto em Base como em Final.
- **Activos 3D ao abrir `/model`:** exactamente **`5`** artefactos (`ProjectModelEnginePage-D3-4d6lf.js`, `vendor-three-C7nzwtxH.js`, `oa-ponta-vermelha-pavilion-demo.glb`, `ModelViewerStage-BCrZfF1L.js`, `vendor-r3f-DFAmaKRO.js`).

---

## 2. Validação da Pesquisa Global e do Cache de Repositório

### 2.1 Pesquisa Global (`5`, `50` e `200` projectos sintéticos válidos)

Medições de 5 execuções limpas por escala em `/workspace/settings` com espiões em `Storage.prototype.getItem('oa_workspace_project_library_v1')` e `JSON.parse`, inserindo a consulta de 10 teclas `Arquitectu` via `pressSequentially(..., { delay: 0 })`:

| Escala (`N`) | Versão | Abertura Modal Mediana (`ms`) | Script Abertura (`ms`) | Digitação 10 teclas Total + 2 rAF Mediana / P95 (`ms`) | `ScriptDuration` 10 teclas Mediana / P95 (`ms`) | `getItemLibrary` (abrir / 10 teclas) | `JSON.parse` (abrir / 10 teclas) |
|---|---|---:|---:|---:|---:|:---:|:---:|
| **5** | Base (`37265d5`) | `386.44` (`P95 472.79`) | `31.19` | `316.79 / 435.64` | `45.15 / 53.18` | `1 / 10` | `0 / 0` |
| **5** | **Final (`4197c2e`)** | **`353.84`** (`-8.4%`) | `34.28` | `371.60 / 509.68` | **`40.97 / 60.32`** (`-9.3%`) | `1 / 0` | `0 / 0` |
| **50** | Base (`37265d5`) | `375.59` (`P95 417.67`) | `42.43` | `421.87 / 510.99` | `83.53 / 114.79` | `1 / 10` | `1 / 10` |
| **50** | **Final (`4197c2e`)** | **`322.69`** (`-14.1%`) | `42.36` | `392.39 / 427.28` | **`48.79 / 60.09`** (`-41.6%`) | `1 / 0` | `1 / 0` |
| **200** | Base (`37265d5`) | `360.21` (`P95 487.60`) | `46.14` | `347.74 / 736.23` | `138.54 / 297.18` | `1 / 10` | `1 / 10` |
| **200** | **Final (`4197c2e`)** | **`302.67`** (`-16.0%`) | `41.01` | `363.06 / 371.29` | **`41.78 / 61.47`** (`-69.8%`) | `1 / 0` | `1 / 0` |

**Conclusão:** Os ganhos na Pesquisa Global são sólidos e escalam em O(1) para o processamento por tecla (`~41–49 ms` síncronos para 10 teclas de `N=5` até `N=200`, P95 estabilizado em `60–61 ms` vs `297 ms` na Base) e confirmam **`0` leituras de `localStorage` e `0` `JSON.parse` por tecla**.

### 2.2 Custo real de invalidação e reconstrução do cache (`buildLibrarySnapshot`)

Testada a reconstrução completa do snapshot em Chrome real via disparo de `StorageEvent('storage', { key: 'oa_workspace_project_library_v1' })` sobre o Studio Desk:

| Escala em `localStorage` | CPU | Tempo até 2 rAF Mediana (`ms`) | `ScriptDuration` de reconstrução (`ms`) | Notas observadas em `src/data/projectLibraryRepository.ts` |
|---|---:|---:|---:|---|
| `5` projectos | 1× | `31.09` | `14.68` | Lê + constrói snapshot inicial |
| `50` projectos (`45` locais) | 1× | `38.75` | `26.08` | `+11.4 ms` face a `N=5` |
| `200` projectos (`195` locais) | 1× | `69.10` | `56.82` | `+42.1 ms` face a `N=5` (~0.22 ms/registo) |
| **`200` projectos (`195` locais)** | **4×** | **`373.34`** | **`304.70`** | Custo aceitável por mutação, mas agravado por `deepFreezeValue` multi-passagem (linhas 660–696) |

---

## 3. Investigação Prioritária das Regressões de Mediana (`Welcome +23%`, `Studio Desk +12%`, `/model +28%`)

### 3.1 Matriz A/B Controlada (Base `37265d5` vs Final `4197c2e`)

#### A) Loopback HTTP/1.1 sem throttling (`1× CPU`) — Google Fonts Live vs Google Fonts Bloqueadas + Warm Cache

| Rota | Perfil | Base Mediana / P95 (`ms`) | Final Mediana / P95 (`ms`) | Delta Mediana | Script Base → Final (`ms`) | Layout Base → Final (`ms`) | Style Base → Final (`ms`) | JS Pedidos (`KiB` gzip) |
|---|---|---:|---:|:---:|---:|---:|---:|---:|
| `/login` | Live Fonts Cold | `1 497.8` / `1 800.6` | `1 428.7` / `1 479.8` | `-4.6%` | `193.8 → 155.7` | `233.4 → 227.4` | `29.3 → 29.4` | `1 (234.1) → 4 (134.5)` |
| `/welcome` | Live Fonts Cold | `1 356.2` / `1 793.3` | `1 429.2` / `2 362.8` | **`+5.4%`** | `193.4 → 156.6` | `213.6 → 207.4` | `25.3 → 17.6` | `1 (234.1) → 5 (138.1)` |
| `/workspace` | Live Fonts Cold | `1 695.7` / `1 954.4` | `1 505.9` / `1 593.4` | `-11.2%` | `166.8 → 233.1` | `219.1 → 189.3` | `48.0 → 38.8` | `1 (234.1) → 10 (204.3)` |
| `/model` | Live Fonts Cold | `2 374.6` / `2 658.6` | `2 145.7` / `2 395.1` | `-9.6%` | `569.6 → 422.1` | `275.2 → 263.3` | `39.8 → 44.3` | `3 (520.2) → 13 (434.2)` |
| `/login` | Fonts Bloq. Cold | `689.4` / `912.6` | **`569.4`** / `856.4` | **`-17.4%`** | `178.9 → 115.0` | `149.0 → 94.8` | `23.5 → 14.5` | `1 (234.1) → 4 (134.5)` |
| `/welcome` | Fonts Bloq. Cold | `391.1` / `452.5` | `565.5` / `612.7` | **`+44.6%`** | `95.7 → 66.0` | `61.3 → 68.5` | `10.0 → 7.6` | `1 (234.1) → 5 (138.1)` |
| `/workspace` | Fonts Bloq. Cold | `553.0` / `807.1` | `726.8` / `978.6` | **`+31.4%`** | `111.0 → 124.9` | `112.2 → 122.0` | `35.0 → 20.7` | `1 (234.1) → 10 (204.3)` |
| `/projects` | Fonts Bloq. Cold | `418.6` / `516.8` | `586.6` / `613.3` | **`+40.1%`** | `97.0 → 72.5` | `68.5 → 67.2` | `15.7 → 9.4` | `1 (234.1) → 10 (163.0)` |
| `/dossier` | Fonts Bloq. Cold | `530.9` / `890.7` | `717.2` / `894.6` | **`+35.1%`** | `102.9 → 109.7` | `89.6 → 99.6` | `16.4 → 14.7` | `1 (234.1) → 12 (171.8)` |
| `/settings` | Fonts Bloq. Cold | `523.6` / `667.7` | `761.3` / `949.7` | **`+45.4%`** | `136.7 → 122.4` | `102.1 → 116.4` | `16.1 → 11.7` | `1 (234.1) → 8 (147.1)` |
| `/model` | Fonts Bloq. Cold | `1 485.8` / `1 757.6` | `1 365.3` / `1 478.3` | `-8.1%` | `352.2 → 307.8` | `152.2 → 159.0` | `24.4 → 26.0` | `3 (520.2) → 13 (434.2)` |
| `/login` | Fonts Bloq. Warm | `482.4` / `507.4` | **`426.8`** / `455.1` | **`-11.5%`** | `22.0 → 23.7` | `3.4 → 2.7` | `14.5 → 17.4` | `cache-control: no-cache` |
| `/welcome` | Fonts Bloq. Warm | `392.0` / `473.7` | `641.9` / `689.2` | **`+63.7%`** | `31.0 → 33.5` | `2.7 → 2.9` | `17.7 → 11.2` | `5` ondas vs `1` |
| `/workspace` | Fonts Bloq. Warm | `500.1` / `568.0` | `780.3` / `862.7` | **`+56.0%`** | `45.4 → 59.4` | `5.5 → 8.4` | `39.1 → 36.3` | `10` ondas vs `1` |
| `/model` | Fonts Bloq. Warm | `1 229.3` / `1 299.0` | `1 213.0` / `1 506.9` | `-1.3%` | `169.3 → 167.9` | `7.1 → 9.0` | `25.6 → 30.2` | `13` ondas vs `3` |

#### B) Rede e CPU Controladas (Fast 4G `10 Mbps / 40 ms RTT` + CPU `4×` & Mid-Mobile `1.6 Mbps / 150 ms RTT` + CPU `4×`)

| Rota | Perfil | Base Mediana / P95 (`ms`) | Final Mediana / P95 (`ms`) | Delta Mediana | Script Base → Final (`ms`) | Layout Base → Final (`ms`) | Style Base → Final (`ms`) | `jsMaxResponseEnd` (`ms`) |
|---|---|---:|---:|:---:|---:|---:|---:|---:|
| `/login` | Fast4G + 4× Cold | `3 095.2` / `4 790.7` | **`2 667.7`** / `3 004.5` | **`-13.8%`** | `1 060.4 → 633.8` | `941.6 → 733.3` | `114.9 → 90.8` | `427.5 → 349.9` |
| `/welcome` | Fast4G + 4× Cold | `4 182.1` / `5 586.3` | `4 130.3` / `5 427.5` | `-1.2%` | `1 552.2 → 1 012.3` | `1 241.6 → 1 144.0` | `216.8 → 92.9` | `473.4 → 740.0` |
| `/workspace` | Fast4G + 4× Cold | `6 157.6` / `6 839.7` | `6 186.5` / `9 241.0` | **`+0.5%`** | `2 147.9 → 1 861.4` | `1 882.2 → 2 044.7` | `541.3 → 391.9` | `450.0 → 678.3` |
| **`/model`** | **Fast4G + 4× Cold** | **`6 807.8`** / `10 998.9` | **`9 005.8`** / `10 418.4` | **`+32.3%`** | `3 121.8 → 3 694.4` | `1 500.4 → 2 111.4` | `196.8 → 463.6` | `5 122.2 → 6 833.8` |
| `/login` | Fast4G + 4× Warm | `1 210.6` / `1 904.8` | **`1 042.0`** / `1 446.6` | **`-13.9%`** | `163.9 → 146.0` | `25.6 → 12.5` | `109.0 → 77.8` | `448.4 → 363.3` |
| `/welcome` | Fast4G + 4× Warm | `1 313.1` / `2 323.9` | `1 241.7` / `2 019.5` | `-5.4%` | `261.6 → 177.3` | `17.1 → 59.7` | `169.4 → 122.7` | `421.7 → 500.2` |
| `/workspace` | Fast4G + 4× Warm | `2 703.4` / `3 143.2` | `2 323.6` / `3 799.7` | `-14.0%` | `389.7 → 480.3` | `91.2 → 144.4` | `502.7 → 413.8` | `462.4 → 608.0` |
| `/model` | Fast4G + 4× Warm | `3 904.5` / `4 743.0` | `4 162.7` / `5 670.9` | **`+6.6%`** | `1 218.3 → 1 408.4` | `106.5 → 141.7` | `450.6 → 402.4` | `2 875.9 → 2 261.9` |
| `/login` | Slow4G + 4× Cold | `5 865.9` / `6 121.6` | **`5 086.0`** / `5 198.8` | **`-13.3%`** | `1 822.7 → 852.6` | `1 066.8 → 1 466.6` | `90.2 → 123.1` | `1 850.1 → 1 386.1` |
| `/welcome` | Slow4G + 4× Cold | `7 548.6` / `9 235.8` | **`6 840.5`** / `7 350.3` | `-9.4%` | `1 518.9 → 1 495.5` | `1 989.9 → 2 158.9` | `368.0 → 311.9` | `1 728.7 → 2 125.1` |
| `/workspace` | Slow4G + 4× Cold | `7 701.5` / `10 643.9` | `8 813.9` / `8 838.3` | **`+14.4%`** | `2 191.0 → 2 502.9` | `1 888.7 → 2 523.8` | `650.2 → 563.5` | `1 757.1 → 2 297.1` |
| `/model` | Slow4G + 4× Cold | `11 767.9` / `13 395.6` | **`8 623.8`** / `9 800.1` | **`-26.7%`** | `4 598.2 → 3 523.4` | `2 392.4 → 1 257.2` | `494.1 → 445.4` | `9 212.0 → 7 252.3` |

#### C) Transições SPA Directas (Sem Preload por Hover — Loopback e Fast 4G + CPU 4×, `N=5`)

| Transição SPA | Perfil | Base Mediana / P95 (`ms`) | Final Mediana / P95 (`ms`) | Delta Mediana | Chunks carregados na transição (Final) |
|---|---|---:|---:|:---:|---|
| `/login` → `/welcome` | Loopback | `270.78` / `1 169.31` | `552.05` / `610.86` | **`+103.9%`** | `WelcomePage` (`3.6 KiB`) + `welcome-maquette-study.webp` |
| `/welcome` → `/workspace` | Loopback | `522.43` / `789.98` | `689.44` / `696.69` | **`+32.0%`** | `WorkspaceShell`, `shellNav`, `shellUi`, `StudioDeskPage`, `useProjectLibrary`, `vendor-motion` |
| `/workspace` → `/workspace/projects` | Loopback | `324.60` / `1 535.04` | `456.79` / `552.21` | **`+40.7%`** | `ProjectLibraryCatalogPage`, `i18n-DtTWracp` + imagens |
| `/projects` → `/dossier` | Loopback | `570.03` / `925.43` | `995.45` / `1 106.91` | **`+74.6%`** | `ProjectDossierShellPage`, `i18n-yV620PlM`, `projectExperienceContract` |
| `/dossier` → `/model` | Loopback | `1 328.76` / `1 659.87` | `1 311.44` / `1 648.08` | `-1.3%` | `ProjectModelEnginePage`, `vendor-three` → `.glb` → `ModelViewerStage`, `vendor-r3f` |
| `/login` → `/welcome` | Fast4G + 4× | `1 242.02` / `2 332.68` | `1 698.74` / `2 075.48` | **`+36.8%`** | Sem prefetch prévio no formulário `/login` |
| `/welcome` → `/workspace` | Fast4G + 4× | `2 737.55` / `6 269.91` | `3 794.17` / `4 138.51` | **`+38.6%`** | `fastTrackCta` sem `onPointerEnter` / `onFocus` + 6 JS chunks |
| `/projects` → `/dossier` | Fast4G + 4× | `946.36` / `1 667.27` | `1 626.85` / `1 971.03` | **`+71.9%`** | Cartões `ProjectGalleryView` sem preload |
| `/dossier` → `/model` | Fast4G + 4× | `4 962.79` / `6 201.81` | `4 418.50` / `7 146.57` | `-11.0%` | `WorkspaceShell` já em memória reduz carga nesta etapa |

---

### 3.2 Decomposição Física das Causas Raiz (Transferência vs Fontes vs Parsing vs Execução vs Renderização)

#### 1) Porque o `/login` acelerou (`-17.4%`), mas o `/welcome` regrediu (`+23%` em `plans/013`, `+44.6%` sem fontes, `+63.7%` warm)
- **A única rota não-lazy é `/login` (`App.tsx:16`).** Como `WelcomePage` (`14.06 kB` / `13.73 KiB` raw; `3.60 KiB` gzip) e as restantes rotas foram divididas sem `<link rel="modulepreload">` estático por URL e sem aguardar a resolução imediata, duas patologias ocorrem:
  1. **Efeito Google Fonts + `preloadInitialBrowserRoute()`:** em `loopback_noblock_cold`, os recursos de entrada (`index.js`, `vendor-react`, `vendor-icons`, `vendor-router`) terminam de transferir em **`t = 52.1 ms`**, mas o `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` (`index.html:10-13`) bloqueia a execução do módulo `index-PUOSDjJu.js` até **`t = 716.3–872.3 ms` (`702–853 ms`)**. Como `preloadInitialBrowserRoute()` só é invocada dentro de `index-PUOSDjJu.js` (`App.tsx:39`), a Onda 2 (`WelcomePage`, `WorkspaceShell` + `StudioDesk` ou `/model`) **fica parada à espera das fontes** (`t = 799–951 ms`), enquanto na Base o chunk único já estava descarregado em memória desde `t = 123–143 ms`.
  2. **Duplo commit `<Suspense>` provado pelo CDP Tracing (fontes bloqueadas):** em `/welcome`:
     - **Base (`37265d5`):** `DOMContentLoaded = 197.7 ms` → **`h1-mounted` (página real) = `268.1 ms`**, `1× Layout` (`129.6 ms`), `LCP = FCP = 344 ms` (`loopback_fontsblocked_cold`).
     - **Final (`4197c2e`):** `DOMContentLoaded = 133.1 ms` (`-64.6 ms`!), **mas** como `WelcomePage.js` (`t = 106.0 → 120.2 ms`) resolve de forma assíncrona após a avaliação inicial da árvore `<App>`, o React compromete primeiro `<EditorialEntryLoadingFallback>` aos **`158.7 ms`**, dispara **`FCP = 164–232 ms`** e executa `Layout + Paint` do fallback (`Layout #1`, `2× Layout = 132.1 ms`), atrasando o `h1` real de `WelcomePage` para **`461.4 ms`** (`+193.3 ms`) e o **`LCP` real de `344 -> 512 ms`**!
     - Em **cache quente (`loopback_fontsblocked_warm`)**, a discrepância agrava-se para **`+63.7%` (`392.0 -> 641.9 ms`)**: o servidor `vite preview` envia `cache-control: no-cache` em todos os `.js`, obrigando à revalidação HTTP de 5 módulos em 2 ondas (`t = 76.9 → 200.2 ms`, Onda 2 `t = 230.6 → 306.3 ms`) vs 1 único módulo na Base (`t = 22.2 → 180.2 ms`).

#### 2) Porque o Studio Desk (`/workspace`) regrediu (`+12%` em `plans/013`, `+31.4%` sem fontes, `+56.0%` warm)
1. **Cascata de 10 pedidos JS em 2 ondas + duplo ciclo de Layout/Timer:** no CDP Tracing (`/workspace`), a Base monta o `h1` real em `564.9 ms` (`1× Layout` `174.9 ms`, `4× FunctionCall`). Na Final, `<EditorialEntryLoadingFallback>` monta aos `193.8 ms`, pinta aos `300 ms`, dispara **`TimerFire = 232.8 ms`** e `2× Layout` (`226.2 ms`, `18× FunctionCall`), empurrando o `h1` real para **`730.4 ms`** (`+165.5 ms`).
2. **Peso de `vendor-motion` (`122.74 kB` raw / `39.06 KiB` gzip) retido para duas animações triviais:** o `rg` confirmou que `framer-motion` apenas anima `initial={{ opacity: 0, y: 6/8 }}` em `StudioDeskPage.tsx:1060-1071` e `StudioOpening.tsx:63-74`. Além de acrescentar `39.06 KiB` gzip (`40 119 B` `encodedBodySize` HTTP) de rede e compilação JS ao `/workspace`, começar a prancha principal com `opacity: 0` durante `300–350 ms` penaliza o tempo até visibilidade útil do painel.
3. **Saturação de ligações HTTP/1.1 na Onda 2 (`6` JS + imagens em simultâneo):** `WorkspaceShell`, `shellNavigation`, `shellUiContext`, `StudioDeskPage`, `useProjectLibrary` e `vendor-motion` disparam todos em simultâneo aos `t = 132.9–134.1 ms` junto com `favicon.png`, competindo pelas **6 ligações HTTP/1.1** por origem.

#### 3) Porque o Visualizador 3D (`/model`) regrediu (`+28%` em `plans/013`, `+32.3%` em Fast 4G + CPU 4×: `6 807.8 -> 9 005.8 ms`)
A inspeção directa dos timestamps de `ResourceTiming` em `fast4g_cpu4x_cold` revela uma **serialização tripla**:
- **Onda 1 (`t = 121.8 → 378.7 ms`):** 4 chunks entry + CSS + Google Fonts CSS. Após DCL (`671 ms`), monta `<EditorialEntryLoadingFallback>`.
- **Onda 2 (`t = 724.1 → 1 071.7 ms`):** **7 ficheiros JS** (`WorkspaceShell`, `shellNavigation`, `shellUiContext`, `ProjectModelEnginePage`, `i18n-yV620PlM`, `vendor-three`, `useProjectLibrary`) disputam as 6 ligações HTTP/1.1 (`useProjectLibrary` fica em fila até `754.5 ms`; `vendor-three` `206.1 KiB` termina aos `1 071.7 ms`).
- **Atraso interno até ao `.glb` (`t = 1 071.7 → 6 909.2 ms`):** antes de `ArchitecturalModelViewer` iniciar o `fetch('...glb')` (`6 909.2 ms` na Final vs `5 143.9 ms` na Base, `+1 765 ms`), a aplicação passa por `<EditorialEntryLoadingFallback>`, `<WorkspaceShell>` + `<WorkspaceContentLoadingState>`, compilação V8 de `vendor-three` (`798.92 kB` raw) e montagem de `ProjectModelEnginePage`. Por isso, sob CPU 4×, `ScriptDuration` subiu **`+572.6 ms`** (`3 121.8 -> 3 694.4 ms`), `LayoutDuration` subiu **`+611.0 ms`** (`1 500.4 -> 2 111.4 ms`) e `RecalcStyleDuration` subiu **`+266.8 ms`** (`196.8 -> 463.6 ms`).
- **Onda 3 bloqueada por `status === 'loaded'` (`ArchitecturalModelViewer.tsx:913`):** `<LazyModelViewerStage>` só entra na árvore React *depois* de `fetch(.glb)` + `parseGlbSceneAndTelemetry()` concluírem. Por isso, `ModelViewerStage` e `vendor-r3f` (`192.65 kB` raw / `59.14 KiB` gzip) só começam a descarregar aos **`t = 7 174.2 → 7 329.6 ms`**, adicionando mais uma ronda de rede + `<Suspense>` fallback + compilação WebGL no momento mais crítico.
- **Nota de contraste em rede muito lenta (`slow4g_cpu4x_cold`):** em `1.6 Mbps / 150 ms RTT`, a economia de bytes transferidos (`520.23 -> 434.21 KiB`) sobrepôs-se ao overhead da cascata (`11 767.9 -> 8 623.8 ms`, `-26.7%`). Ou seja: o code-splitting ajuda em ligações lentas, mas a serialização em 3 ondas + duplo fallback `<Suspense>` penaliza ligações rápidas/médias e CPU modesta.

---

## 4. Abertura Fria e Escala do Studio Desk (`5`, `50` e `200` Projectos Sintéticos)

### Nota Metodológica Crítica (Base `37265d5` vs Final `4197c2e`)
Na **Base (`37265d5`)**, `StudioDeskPage.tsx` lia apenas os `5` fixtures estáticos (`STUDIO_DESK_PROJECTS`), **ignorando totalmente `oa_workspace_project_library_v1`** (`getItemLibrary = 0`). Na **Final (`4197c2e`)**, o Studio Desk passou a ler e sincronizar os projectos reais da Biblioteca (`useProjectLibrary()`).

### 4.1 Impacto real: projectos não-atribuídos (`mixed`) vs atribuídos (`owned`) & filtro `Todos os registos`

| Cenário (`localStorage` validado) | CPU | Cartões renderizados | Nós DOM | `Heap` JS (`MB`) | Ready Mediana (`ms`) | `Script` (`ms`) | `Layout` (`ms`) | `RecalcStyle` (`ms`) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `5_default` (Base / **Final**) | 1× | `2` / `2` | `997` / `1 310` | `4.02` / `4.44` | `717.2` / `752.9` | `225.7` / `205.2` | `154.8` / `208.3` | `54.2` / `32.2` |
| `50_mixed` (`45` outros autores) | 1× | `2` | `1 310` | `5.47` | `722.1` | `244.4` | `148.5` | `25.2` |
| `50_owned` (`45` do próprio perfil) | 1× | **`47`** | **`3 470`** | `6.07` | **`889.7`** | `242.0` | `167.0` | `54.5` |
| `200_mixed` (`195` outros autores) | 1× | `2` | `1 310` | `6.80` | `757.8` | `180.4` | `152.5` | `28.5` |
| **`200_owned`** (`195` do próprio) | **1×** | **`197`** | **`10 670`** | `8.61` | **`1 118.7`** | `275.3` | `314.3` | **`129.1`** |
| **`200_owned`** (`195` do próprio) | **4×** | **`197`** | **`10 397`** | `8.45` | **`14 335.5`** *(Base `4 813.8`)* | **`4 246.6`** | **`3 631.8`** | **`2 673.3`** |

### 4.2 Troca de âmbito para `Todos os registos` (`scope='all'`) após abertura fria

| Transição (`2 → N` cartões) | CPU | Nós DOM após clique | Tempo clique até 2 rAF Mediana (`ms`) | `Script` (`ms`) | `Layout` (`ms`) | `RecalcStyle` (`ms`) |
|---|---:|---:|---:|---:|---:|---:|
| `2 → 5` (`5_mixed`) | 1× | `2 020` | `181.63` | `24.72` | `26.98` | `14.95` |
| `2 → 50` (`50_mixed`) | 1× | `4 180` | `206.40` | `68.15` | `15.31` | `38.00` |
| `2 → 200` (`200_mixed`) | 1× | **`11 380`** | `279.04` | `75.51` | `38.95` | `83.26` |
| **`2 → 200` (`200_mixed`)** | **4×** | **`11 107`** | **`3 327.57`** | `792.63` | `786.66` | **`1 459.79`** |

**Diagnóstico de escala:** O armazenamento e indexação em `projectLibraryRepository.ts` escalam bem (`56.82 ms` @ 1× CPU e `304.70 ms` @ 4× CPU para 200 projectos), mas **`ProjectOverviewPanel.tsx` renderiza `projects.map(...)` sem virtualização, janela de lista, paginação nem `content-visibility: auto`**. Com `200` projectos visíveis (`~10 400–11 380` nós DOM), dispositivos de gama modesta (4× CPU) sofrem **`14.34 s`** na abertura fria do Studio Desk e **`3.33 s`** de bloqueio de UI ao clicar em `Todos os registos`. *(Nota: `ProjectGalleryView.tsx` em `/workspace/projects` aplica o mesmo padrão `map()` sem virtualização).*

---

## 5. Verificação dos Quality Gates Oficiais em `4197c2ef`

Executados directamente sobre a branch auditada sem alterações de código de produção:

- **`npm run lint` (`eslint .`):** **PASSOU** (`0` erros, `0` avisos).
- **`npm run build` (`tsc -b && vite build`):** **PASSOU** (`2 787` módulos transformados, `0` dependências circulares).
- **`npm run test:e2e` (`node scripts/e2e-verify-entry.mjs`):** **PASSOU** (`E2E Verification PASSED cleanly`).
- **`npm run test` (`vitest run` v3.2.7, `maxWorkers: 4`):** **FALHOU por fragilidade temporal em 3 execuções independentes** no hardware testado (sempre nos primeiros carregamentos a frio de `WorkspaceShell` + `StudioDeskPage` via `React.lazy`):
  - Execução 1: **96/99 passaram · 3 falharam** (`workspaceShell.test.tsx:45`, `integrationPreview.test.tsx:49`, `projectLibraryConsistency.test.tsx:246`).
  - Execução 2: **97/99 passaram · 2 falharam** (`workspaceShell.test.tsx:45`, `integrationPreview.test.tsx:49`).
  - Execução 3: **96/99 passaram · 3 falharam** (`entryExperience.test.tsx:92`, `loadingPerformance.test.tsx`, `projectLibraryConsistency.test.tsx:246`).
  - **Causa observada no HTML de erro do Vitest:** todas as ocorrências falharam em chamadas `screen.findByRole('heading', ...)` **sem opção `{ timeout }`**, herdando o limite por omissão de **`1 000 ms`** do `@testing-library/dom`. Em arranque paralelo a frio (`maxWorkers: 4`), a compilação sob demanda de `WorkspaceShell` + `StudioDeskPage` + `framer-motion` via `React.lazy` excede `1 000 ms` no worker inicial, deixando o DOM ainda em `data-testid="editorial-entry-loading"` ou `<WorkspaceContentLoadingState />` quando a asserção expira.

---

## 6. Classificação `P0 / P1 / P2` e Plano de Recomendações

Não foi encontrado nenhum defeito **P0** (sem regressão funcional, de segurança, fugas de bundles 3D antes de `/model` ou degradação de dados). Os achados concentram-se em **P1** (regressões reais de carregamento/escala) e **P2** (afinações estruturais e higiene de testes):

| ID | Sev. | Problema Identificado | Ficheiro(s) Alvo | Recomendação Cirúrgica | Impacto Esperado |
|---|---|---|---|---|---|
| **PERF-01** | **P1** | Cascata síncrona de Google Fonts bloqueando `preloadInitialBrowserRoute()` (`702–853 ms`) + atraso de rotas lazy no arranque inicial | `index.html:10-13`, `src/app/routePreload.ts`, `vite.config.ts` | Carregar CSS de fontes de forma não-bloqueante (`media="print" onload="this.media='all'"` ou font-face local opcional mantendo `Outfit`/`Playfair Display` e `fallback`) e/ou injectar `<link rel="modulepreload">` crítico conforme rota/sessão via pequeno script inline síncrono no `<head>` antes do CSS externo. | Estimado: elimina o bloqueio de **`702–853 ms`** medido antes da Onda 2 em acessos autenticados (`/welcome`, `/workspace`, `/model`). |
| **PERF-02** | **P1** | Duplo commit de `<EditorialEntryLoadingFallback>`/`Layout` a frio atrasando `h1` e `LCP` em `/welcome` (`+44.6%`) e `/workspace` (`+31.4%`) | `src/app/App.tsx:39,55-84,167`, `src/features/welcome/WelcomePage.tsx` | Fundir `WelcomePage` (`14.06 kB` raw / `3.60 KiB` gzip) ou eliminar fallback síncrono imediato durante os primeiros `~80–120 ms` (ex.: `ModulePreload` paralelo ou `WorkspaceShell` + rota activa com delay visual mínimo antes de mostrar skeleton full-screen), evitando pagar 2 ciclos completos de Layout/Paint em chunks de 3–9 KiB. | Estimado: recupera o atraso do `h1` medido no trace (`+193.3 ms` `/welcome`, `+165.5 ms` `/workspace`) mantendo entrada leve (`427.94 KiB` raw em `/login`). |
| **PERF-03** | **P1** | Retenção de `vendor-motion` (`122.74 kB` raw / `39.06 KiB` gzip) e `initial={{ opacity: 0 }}` no Studio Desk | `src/features/studio-desk/StudioDeskPage.tsx:1,1060-1071`, `src/features/studio-desk/StudioOpening.tsx:1,63-74`, `vite.config.ts:26-32` | Substituir as 2 animações simples de entrada (`opacity`/`translateY`) por CSS transitions/keyframes com suporte a `prefers-reduced-motion` / `[data-reduce-motion]`, removendo `framer-motion` de `/workspace`. | Economia directa de **`122.74 kB` raw / `39.06 KiB` gzip** em `/workspace`, menor `ScriptDuration` e remoção do atraso inicial por `opacity: 0`. |
| **PERF-04** | **P1** | Onda 3 do `/model` (`ModelViewerStage` + `vendor-r3f` **`62.19 KiB`** gzip) bloqueada atrás de `.glb` + `status === 'loaded'`, + 7 chunks em fila HTTP/1.1 | `src/features/model-viewer/ArchitecturalModelViewer.tsx:48,359,913`, `src/app/routePreload.ts:27` | Disparar `void import('./ModelViewerStage')` em paralelo assim que `ArchitecturalModelViewer` começa a carregar o `.glb` (ou dentro de `loadProjectModelEnginePage`), sobrepondo o download/parse de `vendor-r3f` ao fetch+parse `.glb` e mantendo `<Suspense>` sem bloquear o palco. | Estimado: suprime 1 geração de rede e sobrepõe o carregamento de **`62.19 KiB`** gzip (`ModelViewerStage` + `vendor-r3f`) ao parsing `.glb`. |
| **PERF-05** | **P1** | `ProjectOverviewPanel` (e `ProjectGalleryView`) sem virtualização/paginação para `200` projectos visíveis (`10 670–11 380` nós DOM, `14.34 s` frio / `3.33 s` switch @ 4× CPU) | `src/features/studio-desk/ProjectOverviewPanel.tsx:252`, `src/features/project-experience/ProjectGalleryView.tsx` | Limitar o lote inicial a janela visível paginada ou aplicar virtualização leve / `content-visibility: auto; contain-intrinsic-size` + lote "Carregar mais" (`ex. 24–36` cartões por página) no Studio Desk e Galeria. | Estimado: reduz nós DOM dos `10 397–11 380` medidos em `200` cartões para ordem equivalente a `<=50` cartões (`~3 470` nós / `889.7 ms` @ 1× CPU). |
| **PERF-06** | **P2** | Ausência de *intent-preloading* em `LoginPage`, `fastTrackCta`, `ArchitecturalRail`, `ProjectGalleryView` e `ProjectDossierShellPage` (`+32% a +104%` em SPA) | `src/features/auth-demo/LoginPage.tsx`, `src/features/welcome/WelcomePage.tsx:100`, `src/features/workspace-shell/ArchitecturalRail.tsx:149`, `src/features/project-library/ProjectDossierShellPage.tsx:234` | Ligar `preloadRouteKey` a `onPointerEnter` / `onFocus` nos botões `fastTrackCta`, links do Rail, cartões da Biblioteca, botão `Abrir câmara 3D` (só em hover/focus no dossier), e pré-carregar `welcome` ao seleccionar perfil ou submeter em `/login`. | Estimado: elimina o fetch frio nas transições SPA sem hover (`+32% a +104%` medidos), mantendo `0` bytes 3D antes de intenção explícita no dossier. |
| **PERF-07** | **P2** | `deepFreezeValue` executado 3 vezes sobre objectos já congelados em `buildLibrarySnapshot` | `src/data/projectLibraryRepository.ts:660-696` | Evitar re-percorrer `envelope.createdRecords` e `overridesById` após `allRecords` já ter congelado as instâncias (ou usar freeze apenas em `dev`/shallow em produção após parsing novo). | Estimado: reduz trabalho redundante nos `56.82 ms` (@ 1× CPU) / `304.70 ms` (@ 4× CPU) medidos para reconstruir 200 projectos. |
| **PERF-08** | **P2** | Flakiness em `vitest run` (`96/99`, `97/99`, `96/99`) por `findByRole` com timeout implícito de `1 000 ms` sobre chunks `React.lazy` | `src/test/entryExperience.test.tsx:92`, `src/test/workspaceShell.test.tsx:45`, `src/test/integrationPreview.test.tsx:49`, `src/test/projectLibraryConsistency.test.tsx:246`, `src/test/loadingPerformance.test.tsx` | Especificar `{ timeout: 10000 }` (ou pré-aquecer `preloadRouteKey('shell')` / `'desk'` no `beforeAll`) nos testes de integração que montam rotas lazy sob `maxWorkers: 4`. | Elimina as falhas observadas por timeout por omissão de `1 000 ms` durante compilação a frio via `React.lazy`. |
| **PERF-09** | **P2** | Servidores HTTP/1.1 sem cache longo para assets hashed (`cache-control: no-cache` no `vite preview`) | Configuração de deploy / headers estáticos | Em ambiente de produção real (CDN / Nginx / Vercel / Netlify), garantir `HTTP/2+` (multiplexing sem tecto de 6 ligações) e `Cache-Control: public, max-age=31536000, immutable` para `/assets/*-*.{js,css}`. | Estimado: suprime a revalidação HTTP/1.1 sequencial observada em warm cache (`+56.0%` a `+63.7%` no `vite preview`). |
