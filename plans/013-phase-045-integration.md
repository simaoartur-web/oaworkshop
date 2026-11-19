# Plano 013 · Fase 04.5 — Integração da Equipa 1 (Agentes A + B) e Quality Gate

- **Branch de Integração (Preview):** `codex/f02-integration-preview`
- **Base anterior:** `37265d5914f161bd9a45f688b8f85f48fffdd7b0`
- **Commit Agente A (`codex/f045a-data-consistency`):** `5eae684c3be4e87ca589a2f2be5c7976dd6973cd` (merge `--no-ff`: `93c6814`)
- **Commit Agente B (`codex/f045b-loading-performance`):** `7874f9f81ac8c78a8aa96211897d1d5e1d5c5360` (merge `--no-ff`: `224b528`)
- **Commit final de correcções P1/P2, documentação e Quality Gate:** registado na entrega final em `codex/f02-integration-preview`
- **Estado:** Concluído e verificado (`lint`, `13/13` suites / `99/99` testes Vitest, `build`, `test:e2e`, Quality Gate Chromium e benchmarks multi-execução)

---

## 1. Resumo da Integração Sequencial

As branches dos Agentes A e B foram integradas sequencialmente no worktree exclusivo do preview (`oaworkspace-f02-preview`) através de `git merge --no-ff`, sem conflitos de ficheiros e preservando intactos o histórico, `main`, website público, SEO, segurança da Fase 04 e limites persistentes (`MAX_LOCAL_PROJECTS = 50`).

---

## 2. Correcções Obrigatórias P1/P2 e Descobertas de Integração

1. **P1 — Pesquisa (Investigação 5 e 50 projectos + breakdown separado):**
   - Medições limpas multi-execução (5 execuções independentes por escala em Chromium sobre `vite preview`) separando **processamento síncrono de pesquisa/reconciliação**, **render/paint (`requestAnimationFrame`)** e **digitação Playwright (`pressSequentially` sem atraso artificial)** confirmaram que a oscilação anterior em 5 e 50 projectos resultou de ruído de temporização de digitação em execução única.
   - Em todas as escalas (`5`, `50` e `200` projectos), a pesquisa integrada reduz o processamento síncrono em **-53% a -71%** (mediana `11.1–12.8 ms` para 10 teclas, P95 `11.4–17.5 ms`), o tempo total de digitação em **-51% a -80%**, e mantém **`0` chamadas `localStorage.getItem` e `0` `JSON.parse` por tecla**.

2. **P1 — Welcome (`2 328 ms -> 3 566 ms`):**
   - Executadas 9 medições limpas em condições equivalentes sobre a Base (`37265d59`) e sobre o build integrado.
   - A regressão de `+1 238 ms` (`2 328 -> 3 566 ms`) **não é reproduzível**; o perfilamento de `PerformanceResourceTiming` em Chromium provou que `WelcomePage-*.js` (`14.06 kB` raw / `3.20 KiB` Brotli) e `welcome-maquette-study.webp` carregam em `~12 ms` e `~10 ms` respectivamente, enquanto o `link rel="stylesheet"` externo de `fonts.googleapis.com` introduziu `~774 ms` de latência de rede externa bloqueante (e variações maiores sob `networkidle`).
   - Adicionado `preloadInitialBrowserRoute()` em [src/app/routePreload.ts](../src/app/routePreload.ts) para disparar o pré-carregamento do chunk exacto da rota autenticada (`/welcome` ou `/workspace/*`) logo no arranque do módulo (sem pré-carregar nada em `/login`, sem sessão, nem puxar 3D fora de `/model`), mantendo a separação total de bundles. Mediana final de `/welcome` em 9 execuções: **`1 073.22 ms`** (P95 **`1 096.82 ms`**, vs Base `870.51 ms` / P95 `973.11 ms`, uma diferença residual de `~200 ms` em localhost HTTP/1.1 pela transição de 1 para 5 módulos, com `-46.8%` de JS transferido).

3. **P1 — Pré-carregamento seguro e recuperação de falha de chunk:**
   - Criado [src/app/routePreload.ts](../src/app/routePreload.ts) com `preloadRouteKey`, `preloadMatchedWorkspaceChild`, `preloadWorkspaceEntry` e `createRetryableLazy`.
   - Promessas rejeitadas são tratadas internamente sem gerar `unhandledrejection`; a rota só é marcada como concluída em `.then()` após sucesso, e o registo *in-flight* é limpo em `.finally()` permitindo novas tentativas.
   - Adicionado `RouteChunkErrorBoundary` em [src/features/loading/RouteLoadingStates.tsx](../src/features/loading/RouteLoadingStates.tsx) envolvendo `/welcome`, `<WorkspaceShell>` e `<Outlet />` em [src/app/App.tsx](../src/app/App.tsx), garantindo fallback acessível (`role="alert"`, PT/EN), preservação do `WorkspaceShell` e recuperação *in-place* (validada em Vitest e em Chromium com `page.route(...abort)` → `unroute` → botão `Tentar novamente`, `recoveredInPlace: true`).

4. **P1 — Reset de scroll determinístico com `React.startTransition` + `Suspense`:**
   - Detectada no Quality Gate E2E (`scripts/e2e-verify-entry.mjs`) uma condição de corrida onde `React.startTransition` (React Router v7) mantinha o conteúdo anterior (`scrollTop = 900`) montado até o chunk lazy de `/workspace/settings` resolver.
   - Resolvida adicionando `key={pathname}` no `<Suspense>` interno ao `<WorkspaceShell>` persistente em [src/app/App.tsx](../src/app/App.tsx), garantindo reset imediato de scroll (`0`), preservação de `Back/Forward` e exibição imediata de `WorkspaceContentLoadingState` sem desmontar Header ou Rail.

5. **P2 — Estados extremos (Todos os projectos arquivados + encapsulamento de `lookupMap`):**
   - Corrigido [src/features/studio-desk/StudioDeskPage.tsx](../src/features/studio-desk/StudioDeskPage.tsx), [src/features/studio-desk/QuickActionsBar.tsx](../src/features/studio-desk/QuickActionsBar.tsx) e [src/features/studio-desk/i18n.ts](../src/features/studio-desk/i18n.ts): quando todos os projectos estão arquivados (`activeDeskProjects.length === 0`), `featuredProject` é `null` e `attentionProject` é `undefined`, nunca exibindo um projecto arquivado como destaque activo; o botão de destaque fica desactivado de forma honesta e uma prancha vazia editorial oferece atalho directo para o filtro `Arquivado`.
   - Encapsulado `lookupMap` em [src/data/projectLibraryRepository.ts](../src/data/projectLibraryRepository.ts) através de `createImmutableLookupMap` (`Object.freeze` sobre fachada `ReadonlyMap` sem métodos `set`, `delete` ou `clear`), impedindo qualquer mutação em runtime por consumidores externos.

---

## 3. Métricas de Performance (Antes `37265d5` vs Depois — Build Final)

### 3.1 Artefactos de Bundle (`dist/assets/`) — Raw, Gzip e Brotli

| Artefacto | Raw (`kB` Vite / `KiB`) | Gzip (`KiB`) | Brotli (`KiB`) | Carregamento |
|---|---:|---:|---:|---|
| `index-*.js` (entry app) | `160.11 kB` (`156.36 KiB`) | `47.30` | `40.54` | Entrada |
| `vendor-react-*.js` | `223.06 kB` (`217.83 KiB`) | `67.80` | `58.50` | Entrada |
| `vendor-router-*.js` | `39.20 kB` (`38.28 KiB`) | `13.79` | `12.41` | Entrada |
| `vendor-icons-*.js` | `15.85 kB` (`15.48 KiB`) | `5.32` | `4.57` | Entrada |
| `WelcomePage-*.js` | `14.06 kB` (`13.73 KiB`) | `3.60` | `3.20` | Lazy (`/welcome`) |
| `WorkspaceShell-*.js` | `34.64 kB` (`33.83 KiB`) | `8.83` | `7.88` | Lazy (`/workspace/*`) |
| `StudioDeskPage-*.js` | `89.52 kB` (`87.42 KiB`) | `19.40` | `16.48` | Lazy (`/workspace`) |
| `vendor-motion-*.js` | `122.74 kB` (`119.87 KiB`) | `39.06` | `34.99` | Lazy (`/workspace`) |
| `ProjectLibraryCatalogPage-*.js` | `19.90 kB` (`19.44 KiB`) | `4.36` | `3.88` | Lazy (`/projects`) |
| `ProjectCreateEnginePage-*.js` | `29.25 kB` (`28.56 KiB`) | `6.37` | `5.62` | Lazy (`/projects/new`) |
| `ProjectDossierShellPage-*.js` | `46.09 kB` (`45.01 KiB`) | `8.99` | `7.87` | Lazy (`/projects/:id`) |
| `WorkspaceSettingsPage-*.js` | `8.34 kB` (`8.14 KiB`) | `1.99` | `1.76` | Lazy (`/settings`) |
| `PlannedModuleView-*.js` | `9.34 kB` (`9.12 KiB`) | `2.28` | `2.00` | Lazy (módulos planeados) |
| `ProjectModelEnginePage-*.js` | `91.31 kB` (`89.17 KiB`) | `21.72` | `19.05` | Lazy (só `/model`) |
| `ModelViewerStage-*.js` | `8.36 kB` (`8.16 KiB`) | `3.05` | `2.73` | Lazy (só `/model`) |
| `vendor-r3f-*.js` | `192.65 kB` (`188.13 KiB`) | `59.14` | `52.05` | Lazy (só `/model`) |
| `vendor-three-*.js` | `798.92 kB` (`780.20 KiB`) | `200.59` | `163.13` | Lazy (só `/model`) |
| Chunks partilhados (`i18n`, `shellNavigation`, `projectExperienceContract`, `useProjectLibrary`, `shellUiContext`) | `59.07 kB` (`57.68 KiB`) | `19.39` | `16.86` | Sob procura |
| `index-*.css` | `63.70 kB` (`62.20 KiB`) | `10.84` | `8.76` | Entrada |
| **Total JS em `dist/`** *(Base `1 899.50` → Final `1 917.16 KiB`)* | `1 963.17 kB` (`1 917.16 KiB`) | `532.99` | `453.51` | **0 dependências circulares** |

> **Separação confirmada:** `vendor-react`, `vendor-router`, `vendor-icons`, `vendor-motion`, `vendor-r3f` e `vendor-three` encontram-se totalmente separados sem dependências circulares. O custo inicial real em `/login` inclui os 4 chunks iniciais (`427.94 KiB` raw / `134.21 KiB` gzip / `116.02 KiB` Brotli), nunca apenas `index-*.js`.

### 3.2 Custo JS por Rota, Pedidos, Tempo Frio, Mediana e P95 (Chromium Headless — Base vs Final)

| Rota | JS Raw (`KiB`) Antes → Depois | JS Gzip / Brotli (`KiB`) Depois | Pedidos JS Antes → Depois | Frio (`ms`) Antes → Depois | Mediana (`ms`) Antes → Depois | P95 (`ms`) Antes → Depois | 3D? |
|---|---:|---:|:---:|---:|---:|---:|:---:|
| `/login` (5 runs) | `830.16` → **`427.94`** (`-48.5%`) | `134.21` / `116.02` | `1 → 4` | `838.07` → **`753.74`** | `839.99` → **`772.24`** | `1 040.49` → **`784.51`** | Não |
| `/welcome` (9 runs) | `830.16` → **`441.67`** (`-46.8%`) | `137.81` / `119.22` | `1 → 5` | `823.59` → `1 086.71` | `870.51` → `1 073.22` | `973.11` → `1 096.82` | Não |
| `/workspace` (5 proj., 5 runs) | `830.16` → **`675.20`** (`-18.7%`) | `203.84` / `177.29` | `1 → 10` | `1 004.67` → `1 302.57` | `1 004.67` → `1 124.10` | `1 144.33` → `1 302.57` | Não |
| `/workspace` (**200 proj. frio**, 5 runs) | `830.16` → **`675.20`** (`-18.7%`) | `203.84` / `177.29` | `1 → 10` | `938.12` → `1 162.80` | `1 176.22` → **`1 108.99`** | `1 241.50` → **`1 162.80`** | Não |
| `/workspace/projects` (5 runs) | `830.16` → **`527.66`** (`-36.4%`) | `162.64` / `140.95` | `1 → 10` | `1 083.74` → **`1 067.81`** | `1 083.74` → `1 089.04` | `1 157.04` → `1 331.80` | Não |
| `/workspace/projects/:id` (5 runs) | `830.16` → **`565.22`** (`-31.9%`) | `171.43` / `148.62` | `1 → 12` | `1 515.19` → **`1 122.43`** | `1 127.51` → **`1 058.10`** | `1 515.19` → **`1 236.86`** | Não |
| `/workspace/settings` (5 runs) | `830.16` → **`474.71`** (`-42.8%`) | `146.81` / `127.10` | `1 → 8` | `1 005.76` → `1 091.56` | `940.01` → `1 091.56` | `1 005.76` → `1 377.76` | Não |
| `/workspace/projects/:id/model` (5 runs) | `1 899.50` → **`1 542.87`** (`-18.8%`) | `433.06` / `365.61` | `3 → 13` | `2 106.08` → `2 388.71` | `1 843.24` → `2 358.01` | `2 106.08` → `3 357.20` | **Sim (só aqui)** |

### 3.3 Pesquisa Global — Breakdown Separado (5 execuções limpas por escala, Base vs Final)

| Escala | Abertura Pesquisa Mediana (`ms`) | Processamento Síncrono 10 teclas Mediana / P95 (`ms`) | Render/Paint 10 frames Mediana (`ms`) | Digitação Playwright 10 teclas Mediana / P95 (`ms`) | `getItemLibrary` (10 teclas) | `JSON.parse` (10 teclas) |
|---|---:|---:|---:|---:|:---:|:---:|
| **5 projectos** | `182.36` → **`81.60`** | `25.90 / 46.30` → **`12.10 / 16.00`** | `142.20` → `148.30` | `127.54 / 163.55` → **`62.93 / 77.19`** | `11 → 0` | `0 → 0` |
| **50 projectos** | `172.51` → **`81.36`** | `38.30 / 44.10` → **`11.10 / 11.40`** | `141.60` → `151.00` | `313.11 / 412.32` → **`63.01 / 63.36`** | `11 → 0` | `11 → 0` |
| **200 projectos** | `112.22` → **`81.85`** | `34.70 / 62.50` → **`12.80 / 17.50`** | `123.60` → `148.90` | `130.21 / 289.73` → **`63.49 / 97.37`** | `11 → 0` | `11 → 0` |

---

## 4. Resultado Exato dos Quality Gates

- **`npm run lint`:** PASSOU (`0` erros, `0` avisos).
- **`npm run test` (Vitest integrado):** PASSOU — **13/13 ficheiros · 99/99 testes**:
  - `entryExperience.test.tsx` (9), `hardeningAndTime.test.tsx` (4), `workspaceShell.test.tsx` (8), `studioDesk.test.tsx` (17), `projectLibrary.test.tsx` (10), `projectExperience.test.tsx` (6), `modelEngine.test.tsx` (7), `modelEngineSecurity.test.tsx` (5), `modelViewer.test.tsx` (10), `projectLibrarySecurity.test.tsx` (3), `integrationPreview.test.tsx` (7), `projectLibraryConsistency.test.tsx` (7 — inclui testes P2 de encapsulamento `lookupMap` e todos arquivados), `loadingPerformance.test.tsx` (6 — inclui testes P1 de falha em `preloadMatchedWorkspaceChild` e recuperação de chunk em `RouteChunkErrorBoundary`).
- **`npm run build`:** PASSOU (`tsc -b && vite build`, `2 787` módulos, `0` dependências circulares).
- **`npm run test:e2e`:** PASSOU (`E2E Verification PASSED cleanly`).
- **Validação Chromium (`qa-phase045-chromium.mjs`):** PASSOU (exit `0`):
  - Login → Welcome → Studio Desk → Settings (loading `WorkspaceContentLoadingState` observado em Shell persistente: `sameHeader: true`, `sameNav: true`) → Biblioteca → Criação 4 passos → Dossier → Studio Desk (`createdVisibleInDesk: true`) → Pesquisa (`createdVisibleInSearch: true`) → Back/Forward → `/model` 3D real (`hasCanvas: true`, `has3DOnModel: true`, `has3DBeforeModel: false`).
  - PT/EN (`enSwitchPassed: true`) e 6 perfis demonstrativos (`all6Passed: true`).
  - Responsividade `375px`, `768px` e `1440px` (`allClean: true`, `0` overflow horizontal em todas as rotas).
  - Simulação real de falha de chunk (`PlannedModuleView-*.js` abortado via `page.route`): fallback `RouteChunkErrorBoundary` exibido preservando `WorkspaceShell` (`sameHeader: true`, `sameNav: true`), `0` `pageerror`, recuperação *in-place* ao clicar `Tentar novamente` (`recoveredInPlace: true`).
  - `0` erros de consola (`consoleErrors: []`) e `0` erros de página (`pageErrors: []`).

---

## 5. Riscos e Limitações Remanescentes

1. **Google Fonts externas em `index.html`:** O carregamento síncrono de `fonts.googleapis.com` representa o principal componente de variância de tempo a frio em medições conectadas (`~450–800 ms`), embora seja independente do código-fonte da Fase 04.5 e preservado para respeitar a tipografia editorial O+A (`Outfit` e `Playfair Display`).
2. **`vendor-three` (`798.92 kB` raw / `163.13 KiB` Brotli):** Permanece acima do aviso padrão de `500 kB` do Vite, mas encontra-se estritamente isolado à rota `/workspace/projects/:id/model` e nunca é transferido noutras rotas.
3. **`vendor-motion` (`122.74 kB` raw / `34.99 KiB` Brotli):** Isolado do `/login`, `/welcome` e da Biblioteca, mas ainda consumido em `StudioDeskPage.tsx` para transições subtis entre perfis.
4. **Cache de módulos ES rejeitados no browser:** Embora a recuperação *in-place* tenha passado em Chromium no teste de falha de chunk (`recoveredInPlace: true`), o `RouteChunkErrorBoundary` mantém um botão secundário `Recarregar página` como salvaguarda para ambientes/browsers que retenham URLs de módulos ES falhados no mapa interno do documento.
