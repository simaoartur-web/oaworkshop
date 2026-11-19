# Relatório Técnico — Fase 04.5 · Auditoria Independente de Segurança, QA, A11y & Regressões (`045-QA-01`)

- **Identificador da tarefa:** `045-QA-01`
- **Agente:** `@agent-d` (Security & QA Auditor)
- **Origem das evidências:** Publicação directa do relatório experimental concluído no Swarm Board (`#13`, `2026-11-19 19:10:28`) sem re-execução de testes
- **Objectivo e âmbito:** Auditoria independente de segurança, consistência e sincronização de dados, acessibilidade WCAG 2.2 AA, responsividade, recuperação de erros e ausência de regressões das Fases 03 e 04 sobre o commit integrado `4197c2e`.
- **Branch da tarefa:** `codex/f045-qa-agent-d`
- **Commit base:** `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5` (`origin/codex/f02-integration-preview`)
- **Estado:** `FAILED` *(Quality Gate reprovado por 4 achados P1 reproduzidos — incluindo falha determinística de `npm run test` em Windows e 3 falhas na bateria adversarial/WCAG; **0 achados P0**)*

---

## 1. Ficheiros Modificados

- `docs/agent-reports/phase-045/045-QA-01-agent-d.md` *(apenas este relatório; zero alterações em código de produção)*

### Ficheiros Auditados (Somente Leitura)
- Documentação e Planos: `AGENTS.md`, `PROJECT_MAP.md`, `docs/{PRODUCT_SPEC,MOCK_DATA_CONTRACTS,PHASE_04_MODEL_ENGINE_CONTRACT,DESIGN_SYSTEM}.md`, `plans/{011-phase-045a-data-consistency,012-phase-045b-loading-performance,013-phase-045-integration}.md`.
- Código auditado: `index.html`, `package.json`, `vite.config.ts`, `src/app/{App,routePreload,WorkspaceSessionContext}.*`, `src/data/{sessionRepository,projectLibraryRepository,modelAssetRepository}.ts`, `src/design-system/{tokens.css,useDialogFocusTrap.ts,DemoNoticeDialog.tsx}`, `src/features/loading/RouteLoadingStates.tsx`, `src/features/workspace-shell/{WorkspaceShell,ArchitecturalRail,ContextualHeader,GlobalSearchDialog,NotificationsPopover,globalSearchIndex,shellDemoState}.*`, `src/features/studio-desk/{StudioDeskPage,ProjectDossierDialog,useStudioDeskDialogFocusTrap}.*`, `src/features/project-library/{useProjectLibrary,ProjectDossierShellPage}.*`, `src/features/project-experience/{ProjectDossierView,ProjectCreationWizard}.tsx`, `src/features/model-engine/{useProjectModelEngine,ModelEngineStageSlot,ProjectModelEnginePage}.*`, `src/features/model-viewer/{ArchitecturalModelViewer,ModelViewerStage,ModelViewerFallback,glbInspector}.*`, `src/features/workspace/{WorkspaceSettingsPage,PlannedModuleView}.tsx`, `src/test/{setup,loadingPerformance,projectLibraryConsistency}.*`, `scripts/e2e-verify-entry.mjs`.

---

## 2. Trabalho Executado e Invariantes Confirmados

- **Segurança & Isolamento:** Zero ocorrências de `dangerouslySetInnerHTML`, `innerHTML`, `eval` ou linguagem desonesta em `src/`. Zero palavras-passe em `localStorage`/`sessionStorage` (`lsHasPassword: false`, `ssLength: 0`). `<meta name="robots" content="noindex, nofollow">` presente. Allowlist estrita de `data:` URIs e bloqueio de URIs externas (`https://evil.example/...`), `javascript:` e path traversal (`../`) em `.gltf` e `.glb` antes de `GLTFLoader` (`0` pedidos externos). Payloads XSS em títulos, notas, marcos, pesquisa e `?project=` escapados (`window.__xss === null`); extensões/caminhos perigosos em documentos bloqueados (`5/5`). `MAX_LOCAL_PROJECTS = 50` bloqueia o 51.º projecto sem falsa confirmação. `ObjectURL` revogado em substituição e no logout (`replacedRevoked: true`, `logoutRevoked: true`, `lsHasBlob: false`, `sessionCleared: true`). `main` e website público `oaworkshop` intocados.
- **Consistência & Dados:** Sincronização real entre duas abas Chromium via `StorageEvent` sem reload (`visibleInTabADesk: true`, `visibleInTabASearch: true`). Recuperação limpa de JSON corrompido em `localStorage` (`cleanedCorruptedKey: true`, `0` `pageerror`). Estado extremo (5/5 seed arquivados) exibe `featured-all-archived-empty` sem promover projecto arquivado. Imutabilidade de `getProjectLibrarySnapshot()` e encapsulamento `ReadonlyMap` de `lookupMap` confirmados.
- **Acessibilidade, Recuperação & Regressões (Fases 03–04):** `WorkspaceContentLoadingState` (`role="status"`, `aria-live="polite"`) e `RouteChunkErrorBoundary` (`role="alert"`) preservam os nós DOM de `<header>` e `<aside nav>` (`sameHeader: true`, `sameNav: true`); recuperação *in-place* via «Tentar novamente» confirmada com `0` `pageerror` e `0` `unhandledrejection`. Focus traps (`inert`, `Tab`/`Shift+Tab`, `Escape`, restauro de foco) confirmados em Login Forgot Password, Pesquisa Global, Dossier Studio Desk, Wizard Leave Modal e Mobile Drawer (`375px`). Zero overflow horizontal em `375px`, `768px` e `1440px` em 6 rotas (`18/18`). Paridade PT/EN (`<html lang>`), 6 perfis demo, `prefers-reduced-motion` (`1e-05s`), navegação de 6 secções por teclado (`ArrowRight`/`End`/`Home`), WebGL real (`192` e `96` triângulos) isolado a `/model` (`has3DBeforeModel: false`), fallback `webgl_unavailable` (`role="alert"`, `0` `pageerror`), erros `.glb` corrompido / `.skp` / `> 50 MB`, e Back/Forward com reset/restauro de scroll (`0` → `900`).

---

## 3. Testes Realizados e Resultados

1. **Bateria oficial (`oaworkspace-f045-security-qa`, commit `4197c2e`):**
   - `npm run lint`: **PASS** (`0` erros, `0` avisos).
   - `npm run build` (`tsc -b && vite build`): **PASS** (`2 787` módulos, `16.37s`, `dist/index.html` com `0 B` de `three`/`r3f`/`motion`).
   - `npm run test:e2e` (`OA_E2E_PORT=4174`): **PASS** (`E2E Verification PASSED cleanly`).
   - `npm run test` (`vitest run`): **FAIL reproduzível por timeout de chunks lazy (P1-4)** — 1.ª execução (carga paralela): `7/99` falhas (`6/13` ficheiros); 2.ª execução (sem carga externa): `5/99` falhas (`5/13` ficheiros); 3.ª execução isolada (`--maxWorkers=1` nos 5 ficheiros): `3/37` falhas, todas no 1.º teste frio aos `5.2–5.8s` contra `asyncUtilTimeout: 5000`.
2. **Suite adversarial & regressão Chromium (`vite preview --port 4174`, scripts em `%TEMP%\oa-audit-d\`):**
   - `audit-d-adversarial.mjs` (22 cenários de segurança, quotas, cross-tab, corrupção, chunks, WebGL, contraste): **19 PASS / 3 FAIL** (`P1-1`, `P1-2`, `P1-3`).
   - `audit-d-a11y-reg.mjs` (8 cenários reduced-motion, 6 perfis, PT/EN, focus traps, teclado 6 secções, Back/Forward scroll, `375`/`768`/`1440`): **7/8 PASS funcional** + **1 achado P2-2**.

---

## 4. Problemas Classificados (`P0` / `P1` / `P2`)

- **P0:** Nenhum identificado.
- **P1:**
  1. **P1-1 · Recuperação de chunk falha ao navegar para fora e regressar sem clicar «Tentar novamente» (`src/features/loading/RouteLoadingStates.tsx:158-162`, `src/app/App.tsx:169-181`):** Interceptar `WorkspaceSettingsPage-*.js` com `route.abort('failed')` → clicar `Definições` (fallback aparece) → clicar `Studio Desk` → `unroute` → clicar `Definições` → `route-chunk-error-fallback` reaparece (`stuckOnErrorFallback: true`) porque `createRetryableLazy` mantém a rejeição em cache.
  2. **P1-2 · Excepção síncrona não tratada (`pageerror`) ao arquivar/restaurar projecto sob `QuotaExceededError` (`src/features/project-experience/ProjectDossierView.tsx:556,726`, `src/features/project-library/ProjectDossierShellPage.tsx:160-165`):** Abrir `/workspace/projects/sd-proj-oa-26-101`, simular `DOMException('QuotaExceededError')` em `Storage.prototype.setItem` e clicar `Arquivar projecto` → `pageerror` disparado sem `[role="alert"]` (cache permanece íntegro).
  3. **P1-3 · Contraste WCAG 2.2 AA abaixo de `4,5:1` (`ProjectDossierShellPage.tsx:117`, `PlannedModuleView.tsx:39,126,148`, `DemoNoticeDialog.tsx:64`, `LoginPage.tsx:264,472`, `WelcomePage.tsx:148,201,399,493`):** Botão `Registar novo projecto` na página 404 do Dossier usa `text-[#050505]` sobre `bg-[#A65D4A]` = **`4.16:1`** (`< 4.5:1`, contrariando `#FFFFFF` = `4.90:1` em `DESIGN_SYSTEM.md`); micro-etiquetas `11px` em `text-[#A65D4A]` sobre `#111111` medem **`3.85:1`** (devem usar `--oa-accent-text` `#CE826D`, `≥ 5.9:1`).
  4. **P1-4 · Falhas determinísticas de timeout em `npm run test` para rotas `React.lazy` frias (`src/test/setup.ts:14`):** `asyncUtilTimeout: 5000` excedido em `5.2–5.8s` no 1.º teste frio em Windows.
- **P2:**
  1. **P2-1:** `images[].mimeType` via `bufferView` em `.glb` aceita `image/svg+xml` fora da allowlist `PNG/JPEG/WebP` (`modelAssetRepository.ts:515-522`, `glbInspector.ts:340-355`).
  2. **P2-2:** `reduceMotionOverride: 'reduce'` não propagado ao visualizador 3D (`ModelEngineStageSlot.tsx:243-278`; mantém `data-dpr-cap="1.5"`).
  3. **P2-3:** `scale`, `areaSqm`, `elevationDatum` (e `discipline` em update) sem `assertWithinMaxLength`; `editorial.imageSrc` e `review.roleFocalNote` sem validação estrita em `projectLibraryRepository.ts`.
  4. **P2-4:** Cross-tab de sessão/logout em `WorkspaceSessionContext` e race assíncrona em `selectSessionModelFile`.
  5. **P2-5:** Copy/flags legados de Fase 02 (`globalSearchIndex.ts:181-183`, `shellDemoState.ts:49-56`, `PlannedModuleView.tsx:35-143`).

---

## 5. Limitações e Pendências

- Nota transparente de ambiente: no worktree pré-existente `oaworkspace-f045-security-qa`, a branch `codex/f045-security-qa-final` continha o commit externo puramente documental `48804fe` (`docs/audits/phase045-security-qa-final.md`), com `git diff 4197c2e..HEAD -- src/ package.json vite.config.ts index.html public/` 100% vazio; esse relatório pré-existente permaneceu intocado.

---

## 6. Recomendações

1. **(P1-1)** Em `RouteChunkErrorBoundary.componentDidUpdate`, invocar `prevProps.onRetry?.()` ao mudar `resetKey` quando `this.state.hasError === true`.
2. **(P1-2)** Envolver `onArchiveProject()` e `onRestoreProject()` em `ProjectDossierView.tsx` com `try/catch` ligado a `setMetadataEditError(...)` (`role="alert"`).
3. **(P1-3)** Trocar `text-[#050505]` por `text-white` em `ProjectDossierShellPage.tsx:117` (e `PlannedModuleView.tsx:126`) e `text-[#A65D4A]` por `text-[#CE826D]` nas micro-etiquetas listadas.
4. **(P1-4)** Aumentar `asyncUtilTimeout` em `src/test/setup.ts` (`12000–15000ms`) ou pré-aquecer imports lazy no `beforeAll` das suites integradas.
5. **(P2-1 a P2-5)** Aplicar endurecimentos de `bufferView` MIME, `reduceMotion` 3D, `assertWithinMaxLength`/`imageSrc`, geração monotónica em `selectSessionModelFile` + sync cross-tab, e limpeza de flags legados após aprovação humana.
