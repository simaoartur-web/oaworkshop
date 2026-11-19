# Relatório de Quality Gate — `0451-QA-01` (`@agent-d`)

- **Identificador da Tarefa:** `0451-QA-01`
- **Agente:** `@agent-d` (Security & QA Auditor)
- **Fase / Ciclo:** Fase 04.5.1 · Onda 3 (Quality Gate Único Dirigido de Segurança, QA, WCAG 2.2 AA & Regressão)
- **Aprovação Humana:** `APROVADO: plans/015-phase-0451-closure.md` (Pacote Recomendado)
- **Branch de Trabalho:** `codex/f0451-qa-agent-d`
- **Commit Candidato Auditado:** `df6bd439a658a6161d9d07879a68909ffc5df211` (`origin/codex/f0451-integration-candidate`, integrando `e20a13e` de `@agent-a` e `3a44d9d` de `@agent-b`)
- **Commit Base Anterior:** `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5`
- **Worktree Exclusivo:** `D:/projects/O+A Architecture and Planners/Main/oaworkspace-f0451-qa`
- **Estado:** `FAILED` *(Todos os 8 itens `F0451-P1-1`..`F0451-P1-8`, `npm run lint`, `npm run test` ×2 `104/104`, `npm run build` e a suite Chromium dirigida `6/6` **PASSARAM**; `npm run test:e2e` falhou em `2/2` execuções na asserção síncrona de scroll da linha `425` de `scripts/e2e-verify-entry.mjs` antes do commit da transição lazy de `/workspace/settings` — ver `P1-E2E-SCROLL-TIMING` na Secção 5)*

---

## 1. Objectivo e Âmbito

Executar na Onda 3 da Fase 04.5.1 um único Quality Gate consolidado, independente e em modo *read-only* sobre o código de produção do candidato integrado `df6bd439a658a6161d9d07879a68909ffc5df211`, validando:
1. A bateria oficial completa (`npm run lint`, `npm run test` em **2 execuções consecutivas** paralelas, `npm run build`, `npm run test:e2e` na porta `4174`).
2. A verificação experimental em Chromium Headless (`vite preview --port 4174`) dos 5 P1 obrigatórios de QA/Segurança/WCAG (`F0451-P1-1`, `F0451-P1-2`, `F0451-P1-3`, `F0451-P1-4`, `F0451-P1-5`) e da integridade operacional das optimizações `F0451-P1-6`, `F0451-P1-7` e `F0451-P1-8`.
3. O smoke test de não-regressão das Fases 03 e 04 (WebGL real, isolamento de bundles 3D, revogação de `ObjectURL` em `signOut()` dinâmico, `resetAllDemoData()`, invariante zero-password e isolamento de `main` / website público `oaworkshop`).

**Fronteiras respeitadas:** zero alterações em `src/`, `index.html`, `vite.config.ts`, `package.json`, `PROJECT_MAP.md`, `main` ou repositório público `oaworkshop`.

---

## 2. Ficheiros Modificados

- `docs/agent-reports/phase-0451/0451-QA-01-agent-d.md` *(único ficheiro criado/modificado no worktree)*

---

## 3. Trabalho Executado

1. **Verificação estática do diff integrado (`4197c2e..df6bd439`):**
   - Confirmado que `src/app/WorkspaceSessionContext.tsx` removeu os 4 imports estáticos pesados (`modelAssetRepository`, `projectLibraryRepository`, `studioDeskFixtures`, `shellDemoState`), mantendo limpeza síncrona + `CustomEvent('oa:project-library-updated')` em `resetAllDemoData()` e `import('../data/modelAssetRepository')` em `signOut()`.
   - Confirmado que `src/data/projectLibraryRepository.ts` aplica `assertWithinMaxLength(..., MAX_SHORT_FIELD_LENGTH)` (`120` chars) a `scale`, `areaSqm`, `elevationDatum` e `discipline` em `createProject`, `updateProjectMetadata` e `validateCanonicalRecord`.
   - Confirmado que `src/features/loading/RouteLoadingStates.tsx` invoca `prevProps.onRetry?.()` em `RouteChunkErrorBoundary.componentDidUpdate` quando `resetKey` muda com `hasError === true`.
   - Confirmado que `src/features/project-experience/ProjectDossierView.tsx` e `src/features/project-library/ProjectDossierShellPage.tsx` protegem `onArchiveProject` e `onRestoreProject` com `try/catch` e `[role="alert"]` (incluindo restauro fora da aba `Identidade`).
   - Confirmado que os contrastes WCAG 2.2 AA foram corrigidos (`text-white` sobre `bg-[#A65D4A]` = `4,90:1`; micro-etiquetas `11px` em `text-[#CE826D]` = `≥ 5,9:1`).
   - Confirmado que `src/test/setup.ts` elevou `asyncUtilTimeout` para `15000 ms`, `index.html` carrega Google Fonts de forma não-bloqueante e `ArchitecturalModelViewer.tsx` dispara `loadModelViewerStage()` em paralelo com a carga do modelo 3D.
2. **Execução da bateria oficial (`oaworkspace-f0451-qa`):**
   - `npm run lint`
   - `npm run test` (Execução #1 e Execução #2 consecutivas em paralelo padrão `maxWorkers: 4`)
   - `npm run build`
   - `npm run test:e2e` (Execução inicial + 1 repetição máxima autorizada pelo contrato na porta `4174`)
3. **Execução da suite dirigida em Chromium (`%TEMP%\oa-audit-d-f0451\verify-f0451-qa.mjs` sobre `vite preview --port 4174`):**
   - `F0451-P1-6-P1-7-LOGIN-ENTRY`
   - `F0451-P1-1-CHUNK-NAV-AWAY-RECOVERY`
   - `F0451-P1-2-QUOTA-ARCHIVE-RESTORE`
   - `F0451-P1-3-WCAG-CONTRAST`
   - `F0451-P1-5-MAX-SHORT-FIELD-GUARD`
   - `F0451-SMOKE-3D-SIGNOUT-RESET`

---

## 4. Testes Realizados e Resultados Reais

### 4.1 Bateria Oficial

| Comando | Resultado | Evidência Exacta |
|---|---|---|
| `npm run lint` | **PASS** | `0` erros, `0` avisos (`LINT_EXIT=0`) |
| `npm run test` — **Execução #1** (`maxWorkers: 4`) | **PASS** | **`13/13` ficheiros · `104/104` testes** (`VITEST_1_EXIT=0`) — **F0451-P1-4 RESOLVIDO** |
| `npm run test` — **Execução #2 consecutiva** (`maxWorkers: 4`) | **PASS** | **`13/13` ficheiros · `104/104` testes** em `37.24s` (`VITEST_2_EXIT=0`) — **F0451-P1-4 RESOLVIDO** |
| `npm run build` (`tsc -b && vite build`) | **PASS** | `2 787` módulos transformados em `12.59s`, `0` erros, `0` dependências circulares; `index-CoiNU48b.js` reduzido de `160.11 kB` para **`73.75 kB` raw (`23.77 kB` gzip)**; `dist/index.html` com **`0 B`** de `vendor-three`, `vendor-r3f`, `ModelViewerStage`, `vendor-motion`, `projectLibraryRepository` ou `modelAssetRepository` (`BUILD_EXIT=0`) |
| `npm run test:e2e` (Tentativa 1/2 e 2/2, porta `4174`) | **FAIL** | `Error: Assertion failed: Route switch must reset main scroll to 0 (got 900)` em `scripts/e2e-verify-entry.mjs:425:7` (`E2E_EXIT=1`, `E2E_RETRY_EXIT=1` — diagnóstico detalhado na Secção 5) |

### 4.2 Verificação Dirigida em Chromium (`verify-f0451-qa.mjs` · Porta `4174` · `6/6 PASS`)

| ID do Teste | Alvo | Resultado | Evidência Chromium Recolhida |
|---|---|---|---|
| `F0451-P1-6-P1-7-LOGIN-ENTRY` | `P1-6` + `P1-7` | **PASS** | `loginScriptList: ["index-CoiNU48b.js","vendor-react-Bhi6XC7t.js","vendor-icons-IyKiPRs-.js","vendor-router-DtzEAF4P.js"]`, `hasHeavyRepoOnLogin: false`, Google Fonts com `preload` + `stylesheet` não-bloqueante (`media="all"`), `robots: "noindex, nofollow"` |
| `F0451-P1-1-CHUNK-NAV-AWAY-RECOVERY` | `F0451-P1-1` | **PASS** | Abort de `WorkspaceSettingsPage-*.js` → `Definições` (fallback) → navegar para `Studio Desk` sem clicar «Tentar novamente» → `unroute` → regressar a `Definições`: `stuckOnErrorFallback: false`, `settingsRecovered: true`, `pageErrors: []`, `unhandledAfterP11: []` |
| `F0451-P1-2-QUOTA-ARCHIVE-RESTORE` | `F0451-P1-2` | **PASS** | `QuotaExceededError` simulado em `Arquivar projecto` (aba Identidade) e em `Restaurar para Em curso` (a partir da aba Documentação): `archiveAlertVisible: true`, `restoreAlertOutsideIdentityVisible: true`, `falselyArchived: false`, `archivePageErrors: []`, `restorePageErrors: []` |
| `F0451-P1-3-WCAG-CONTRAST` | `F0451-P1-3` | **PASS** | CTA 404 (`a[href="/workspace/projects/new"]`): `color: "rgb(255, 255, 255)"` sobre `backgroundColor: "rgb(166, 93, 74)"` = **`4.90:1`** (`≥ 4.5:1`); `loginAnyRawTerracotta: false`; `welcomeAnyRawTerracotta: false`; `dialogEyebrowColor: "rgb(206, 130, 109)"`; `planned404EyebrowColor: "rgb(206, 130, 109)"` (`#CE826D`, `≥ 5.9:1`) |
| `F0451-P1-5-MAX-SHORT-FIELD-GUARD` | `F0451-P1-5` | **PASS** | Registo adulterado em `localStorage` com `scale` de `10 000` caracteres (`> 120`) descartado por `validateCanonicalRecord`, preservando `Galeria Cívica & Pátio da Ponta Vermelha` sem corrupção de cache (+ `projectLibrarySecurity.test.tsx` `4/4 PASS`) |
| `F0451-SMOKE-3D-SIGNOUT-RESET` | Fases 03–04 + `P1-7`/`P1-8` | **PASS** | `has3DBeforeModel: false`; WebGL real em `/workspace/projects/sd-proj-oa-26-101/model` (`tris: "192"`); upload `.glb` local cria `ObjectURL` revogado por `signOut()` (`blobRevokedOnSignOut: true`); `scrollAfterCommit: 0`; `resetAllDemoData()` limpa as 5 chaves (`session: null`, `notifs: null`, `rail: null`, `desk: null`, `lib: null`); `pageErrors: []`, `unhandled: []` |

---

## 5. Problemas `P0` / `P1` / `P2`

- **P0:** Nenhum.
- **P1 Resolvidos e Confirmados (`8/8`):**
  - `F0451-P1-1` (recuperação de chunk após navegar para fora): **RESOLVIDO & VERIFICADO**.
  - `F0451-P1-2` (`QuotaExceededError` em Arquivar/Restaurar no Dossier): **RESOLVIDO & VERIFICADO**.
  - `F0451-P1-3` (contraste WCAG 2.2 AA `≥ 4,5:1` em CTA 404 e micro-textos): **RESOLVIDO & VERIFICADO**.
  - `F0451-P1-4` (estabilidade determinística de `npm run test` ×2 consecutivo `104/104`): **RESOLVIDO & VERIFICADO**.
  - `F0451-P1-5` (`MAX_SHORT_FIELD_LENGTH = 120` em `scale`, `areaSqm`, `elevationDatum`, `discipline`): **RESOLVIDO & VERIFICADO**.
  - `F0451-P1-6` (Google Fonts não-bloqueante em `index.html`): **RESOLVIDO & VERIFICADO**.
  - `F0451-P1-7` (desacoplamento de `WorkspaceSessionContext` reduzindo `index-*.js` em `-53,9%` sem regredir `signOut`/`resetAllDemoData`): **RESOLVIDO & VERIFICADO**.
  - `F0451-P1-8` (pré-carregamento paralelo de `ModelViewerStage`): **RESOLVIDO & VERIFICADO**.

- **P1 Remanescente (`1` — Condição de corrida pré-commit no teste E2E `scripts/e2e-verify-entry.mjs:425`):**
  - **`P1-E2E-SCROLL-TIMING` (`scripts/e2e-verify-entry.mjs:420-425` / `src/features/workspace-shell/ArchitecturalRail.tsx`):**
    - *Sintoma:* Na 1.ª navegação a frio de `/workspace` (`scrollTop = 900`) para `/workspace/settings`, `scripts/e2e-verify-entry.mjs` executa:
      ```js
      await page.getByRole('link', { name: /Definições/i }).first().click();
      await page.waitForURL(`${BASE_URL}/workspace/settings`);
      const afterRouteScroll = await page.evaluate(
        () => document.getElementById('workspace-main-scroll')?.scrollTop ?? -1,
      );
      ```
      e obtém `afterRouteScroll = 900` em vez de `0`.
    - *Causa raiz:* Ao clicar em `<Link to="/workspace/settings">`, o React Router v7 actualiza `window.history.pushState` de imediato (fazendo `page.waitForURL` resolver em `0 ms`) e agenda a transição de rota via `React.startTransition`. Antes de `F0451-P1-7`, todas as dependências de `WorkspaceSettingsPage` já residiam em `index-*.js`; após `F0451-P1-7`, o grafo de chunks de `WorkspaceSettingsPage-DURuAcWt.js` resolve num turno assíncrono ligeiramente posterior, pelo que `page.evaluate` na linha `422` lê `scrollTop` **antes** de o React cometer a transição e executar o `useLayoutEffect` de `WorkspaceShell.tsx` (`scrollEl.scrollTop = 0`). Assim que o commit da transição ocorre (ou quando o chunk já está aquecido), `scrollTop` passa determinísticamente para `0` (comprovado em `verify-f0451-qa.mjs`: `scrollAfterCommit: 0` e `scrollImmediateAtWaitForUrl: 0`).
    - *Correcção cirúrgica recomendada (1 linha):* Em `ArchitecturalRail.tsx`, pré-aquecer o chunk no hover/focus (`onMouseEnter`/`onFocus` → `preloadMatchedWorkspaceChild(item.path)` para rotas não-3D) e/ou em `scripts/e2e-verify-entry.mjs:421` aguardar o commit da rota (`await page.getByRole('heading', { name: /Configuração local/i }).waitFor({ state: 'visible' })`) antes de ler `scrollTop`.

- **P2 (Backlog futuro fora do âmbito do Pacote Recomendado):**
  - `P2-1` (`images[].mimeType` via `bufferView` em `.glb`), `P2-2` (propagação de `reduceMotionOverride` ao `ModelViewerStage`), `P2-3` (`editorial.imageSrc` allowlist `/assets/...` e validação de `roleFocalNote` em `validateCanonicalRecord`), `P2-4` (sync `StorageEvent` de logout entre abas e token monotónico em `selectSessionModelFile`), `P2-5` (flags legadas `isPlannedRoute`/`isFutureModuleDemo` para `/workspace/projects`).

---

## 6. Limitações e Pendências

- Respeitado estritamente o limite de **1 repetição** em `npm run test:e2e` conforme Secção 3 do `TASK_CONTRACT.md`.
- Todos os scripts e screenshots temporários foram mantidos exclusivamente fora do repositório (`%TEMP%\oa-audit-d-f0451`) e limpos antes do fecho.

---

## 7. Recomendações

1. Aplicar a micro-correcção de sincronização em `ArchitecturalRail.tsx` (ou aguardar o heading da rota em `scripts/e2e-verify-entry.mjs:421`) para eliminar a janela de `0 ms` entre `history.pushState` e o commit do `useLayoutEffect` de `WorkspaceShell.tsx` em `npm run test:e2e`.
2. Após essa micro-correcção e confirmação de `npm run test:e2e` a `0`, a Fase 04.5.1 está pronta para merge final em `codex/f02-integration-preview` mediante aprovação humana.
