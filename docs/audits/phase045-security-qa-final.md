# Auditoria Independente de Segurança e QA — Fase 04.5 (O+A Workspace · Gemini D)

**Data:** 2026-11-19  
**Commit integrado auditado:** `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5` (`origin/codex/f02-integration-preview`)  
**Branch e worktree de auditoria:** `codex/f045-security-qa-final` (`D:\projects\O+A Architecture and Planners\Main\oaworkspace-f045-security-qa`)  
**Âmbito:** Auditoria independente pós-integração A+B da Fase 04.5 (cache canónica, sincronização multi-separador, `QuotaExceededError`, reset, limites, ciclo Biblioteca/Studio Desk/Dossiers/Pesquisa Global, PT/EN, 6 perfis, deep links, estados extremos, recuperação adversarial de chunks e não-regressão 3D/WebGL da Fase 04). Nenhuma alteração de código de produção ou merge foi efectuada.

---

## 1. Resumo Executivo

A integração `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5` **resolve os bloqueadores P0 identificados na auditoria pós-integração da Fase 04 (`phase04-security-postmerge.md`)** e introduz garantias sólidas de desempenho, consistência multi-separador e resiliência de chunks sem regressões de segurança ou privacidade:

- **Bloqueadores P0:** **0 em aberto.** URIs `data:image/svg+xml` e `data:text/html` passaram a ser bloqueadas em `.gltf` e `.glb` (com validação *case-insensitive* para `DATA:image/png;base64,...`), o fluxo de recuperação após `webglcontextlost` restaura o `<canvas>` e mantém o modelo activo, e o `logout` (`signOut`) limpa `sessionModelsByProjectId`.
- **Cache canónica e imutabilidade:** `getProjectLibrarySnapshot()` devolve snapshot profundamente congelado (`deepFreezeValue`), `lookupMap` encapsulado (`ReadonlyMap` congelado sem `set`/`delete`/`clear`), `0` leituras de `localStorage` e `0` `JSON.parse` em leituras e pesquisas repetidas após aquecimento.
- **Sincronização multi-separador e integridade de snapshots:** Eventos `StorageEvent` (`storage`) entre dois separadores reais no Chromium sincronizam criação, edição, arquivo, restauro e reset global em tempo real sem recarregamento do primeiro separador; envelopes corrompidos em `localStorage` são removidos automaticamente e registos adulterados com `origin: 'seed-fixture'` em `createdRecords` são descartados.
- **`QuotaExceededError` atómico:** Em `createProject`, `updateProjectMetadata`, `addProjectRevision` e `addProjectFileReference`, a falha de escrita em `localStorage` lança `QuotaExceededError` **antes** de actualizar `cachedSnapshot`, preservando intactos referência, versão e contagem em memória, e exibindo `[role="alert"]` na UI do Dossier.
- **Recuperação adversarial de chunks:** Interrupções reais de rede (`page.route(...abort('failed'))`) em chunks lazy filhos (`PlannedModuleView`, `ProjectModelEnginePage`) mantêm o `WorkspaceShell` (`<header>`, `<aside nav>`, sessão e navegação noutras rotas) totalmente funcional com recuperação *in-place* ao clicar `"Tentar novamente"`; a falha a frio do `WorkspaceShell` exibe o fallback `fullscreen` com opção de nova tentativa e recarregamento de salvaguarda.
- **Achados remanescentes:** **1 achado P1** (`scale`, `areaSqm` e `elevationDatum` em `projectLibraryRepository.ts` sem validação `assertWithinMaxLength`, aceitando `10 000` caracteres) e **3 notas P2** (timeout de `findByRole` em `workspaceShell.test.tsx:45` sob paralelismo `npm test`; notas sobre cache de módulos ES e limite de memória GPU/VRAM descomprimida; vulnerabilidades apenas em `devDependencies`).

---

## 2. Verificações Executadas e Evidências

### 2.1. Comandos Oficiais e Dependências

| Verificação | Comando | Resultado Observado |
|---|---|---|
| ESLint | `npm run lint` | Saída `0` (0 erros/avisos) |
| Build de produção | `npm run build` (`tsc -b && vite build`) | Saída `0` (`2787` módulos transformados; `dist/` com chunks `vendor-react`, `vendor-router`, `vendor-icons`, `vendor-motion`, `vendor-r3f`, `vendor-three`) |
| E2E Chromium oficial | `npm run test:e2e` | Saída `0` (`E2E Verification PASSED cleanly`) |
| Vitest (paralelismo padrão `maxWorkers: 4`) | `npm test` | Saída `1`: **`98 passed \| 1 failed (99)`**, **`12 passed \| 1 failed (13)`** — falha pontual em `src/test/workspaceShell.test.tsx:45` por timeout padrão de `findByRole` (`1000ms`) durante carregamento lazy a frio de `WorkspaceShell` |
| Vitest (execução sequencial) | `npx vitest run --no-file-parallelism` | Saída `0`: **`13 passed (13)` ficheiros, `99 passed (99)` testes** em `196.52s` |
| Auditoria de dependências (produção) | `npm audit --omit=dev` | Saída `0`: **`found 0 vulnerabilities`** (as 10 vulnerabilidades reportadas em `npm audit` estão restritas a `devDependencies`) |

---

### 2.2. Sondagem API / Repositório (`f045_api_probe.mjs`)

Executada sobre `src/data/projectLibraryRepository.ts`, `src/features/workspace-shell/globalSearchIndex.ts`, `src/data/sessionRepository.ts`, `src/data/modelAssetRepository.ts` e `src/features/model-viewer/glbInspector.ts`:

- **Cache canónica e imutabilidade:**
  - `getProjectLibrarySnapshot()` devolveu a mesma referência (`sameSnapshotRef: true`) e `readsDuringRepeatedCalls: 0` em chamadas consecutivas a `listProjects()`, `getProjectById('OA-26-101')` e `listStudioDeskCompatibleProjects()`.
  - `Object.isFrozen` confirmado em `snapshot`, `allRecords[0]`, `allRecords[0].editorial.title` e `snapshot.lookupMap`; tentativas de mutação (`snap.allRecords[0].editorial.title.pt = ...` e `snap.lookupMap.set(...)`) lançaram `TypeError` (`mutRecordThrew: true`, `mutLookupThrew: true`).
- **Invalidação cross-tab e adulteração de storage:**
  - Disparo de `StorageEvent` (`key: 'oa_workspace_project_library_v1'`) incrementou a versão do snapshot (`2 -> 4`) e rejeitou registo adulterado em `createdRecords` com `origin: 'seed-fixture'`.
  - JSON malformado (`'{bad-json'`) + `StorageEvent(key: null)` removeu a chave corrompida (`corruptStorageKeyRemoved: true`) e recuperou os `5` projectos seed.
- **`QuotaExceededError` e rollback atómico:**
  - Simulação de `QuotaExceededError` em `createProject`, `updateProjectMetadata`, `addProjectRevision` e `addProjectFileReference`: todas lançaram erro com `name: 'QuotaExceededError'`; após as 4 falhas, `snapshotUnchangedRef: true`, `versionUnchanged: true` e `countUnchanged: true`.
- **Limites, sanitização e lacuna secundária P1:**
  - `addProjectFileReference`: rejeitou `../../evil.glb`, `https://evil.com/a.glb`, `payload.html` (`model_3d`), `xss.svg` (`photographic_log`) e `study.skp` (`model_3d`); aceitou `pavilion-v2.glb`.
  - `addProjectRevision`: rejeitou `2001` caracteres (`MAX_TEXT_LENGTH = 2000`).
  - `MAX_LOCAL_PROJECTS`: `50` projectos criados com sucesso; `51.º` rejeitado (`Limite máximo de 50 projectos locais atingido nesta demonstração.`).
  - **Achado P1-01:** `createProject` e `updateProjectMetadata` aceitaram strings de **`10 000` caracteres** em `scale`, `areaSqm` e `elevationDatum` (`scale_10000_len: 10000`, `area_10000_len: 10000`, `datum_10000_len: 10000`), por aplicarem apenas `.trim()` sem `assertWithinMaxLength`.
- **Sessão sem palavra-passe (`sessionRepository.ts`):**
  - Registo em `localStorage` adulterado com `password` e `token` devolveu apenas `["userId", "role", "authenticatedAt", "mode"]` (`hasPasswordKey: false`); `role: "superadmin"` inválido foi removido (`invalidRoleCleared: true`).
- **Invalidação do índice de pesquisa (`globalSearchIndex.ts`):**
  - Criação -> pesquisa EN (`zeroStorageReadsOnSearch: true`) -> edição -> arquivo -> restauro -> reset reflectiram-se imediatamente em `searchWorkspaceDemo` (`false` após reset).
- **Segurança 3D Fase 04 (`.gltf` e `.glb`):**
  - `http://`, `https://`, `../`, `data:image/svg+xml;base64,...` e `data:text/html,...` bloqueados tanto em `validateModelFileSelection` (Agente A) como em `validateModelBufferContents` (Agente B) para `.gltf` e `.glb` (`externalFetches: []`).
  - `DATA:image/png;base64,...` (prefixo em maiúsculas) e `data:image/png;base64,...` aceites normalmente.
  - `.glb` truncado (`12 B`), `.skp` e tamanho `> 50 MB` rejeitados.

---

### 2.3. Sondagem em Chromium/WebGL Real (`f045_browser_probe.mjs` e `f045_extreme_deeplink_probe.mjs`)

Executada sobre build de produção (`vite preview`), com monitorização global de rede e erros (`externalRequests: []`, `pageErrors: []`):

- **Sincronização entre separadores (Tab A em `/workspace` · Tab B em `/workspace/projects/new`, `/workspace/projects/:id`, `/workspace/settings`):**
  - Criação de `"Pavilhão Cross-Tab Audit"` na Tab B reflectiu-se **sem recarregamento** na Mesa de Trabalho e Pesquisa Global da Tab A (`visibleInTabADeskAfterCreate: true`, `visibleInTabASearchAfterCreate: true`).
  - Arquivo na Tab B ocultou imediatamente o projecto dos activos na Tab A (`hiddenInTabAActiveAfterArchive: true`); restauro voltou a exibi-lo (`visibleInTabAAfterRestore: true`); reset na Tab B limpou `oa_workspace_project_library_v1`.
- **Estado extremo (todos os 5 projectos canónicos arquivados):**
  - Arquivados os 5 seeds (`sd-proj-oa-26-101`, `sd-proj-oa-26-108`, `sd-proj-oa-26-112`, `sd-proj-oa-26-119`, `sd-proj-oa-25-084`), `/workspace` exibiu `[data-testid="featured-all-archived-empty"]` (`"Sem projectos activos em destaque"`), botão `"Sem projecto activo em foco"` desactivado (`disabled: true`) e atalho `"Ver projectos arquivados"`, sem promover nenhum projecto arquivado a destaque activo.
- **Deep links, PT/EN, 6 perfis e `QuotaExceededError` na UI:**
  - Validados `/workspace?project=OA-26-101`, `/workspace?project=NONEXISTENT-999` (aviso não bloqueante), `/workspace/projects/NONEXISTENT-999` (404), `/workspace/projects/NONEXISTENT-999/model` (404) e `/workspace/projects/sd-proj-oa-26-101?section=documentation` (`aria-selected="true"`).
  - Alternância PT/EN validada (`document.documentElement.lang === 'en'`), bem como entrada sequencial nos **6 perfis demonstrativos** (`Helena Mondlane`, `Mateo Conti`, `Inês Macamo`, `Tomás Nhantumbo`, `Clara Ferraz`, `Diogo Tembe`).
  - `QuotaExceededError` na edição de metadados do Dossier exibiu `[role="alert"]` explícito sem falsa confirmação; alternância de tarefas em `StudioDeskPage` sob `QuotaExceededError` manteve a interface funcional (`hasHeader: true`, `pageErrors: []`).
- **Recuperação adversarial de chunks (`page.route` abort):**
  - Falha de `PlannedModuleView-*.js`: fallback `[data-testid="route-chunk-error-fallback"]` exibido dentro do `WorkspaceShell` intacto (`hasHeader: true`, `hasNav: true`, `sessionPreserved: true`); navegação para `/workspace/settings` permaneceu operacional (`otherRouteHealthy: true`); após remover o bloqueio e clicar `"Tentar novamente"`, `/workspace/tasks` recuperou *in-place* (`stillShowingFallback: false`, `h1Text: "Tarefas"`).
  - Falha de `ProjectModelEnginePage-*.js`: fallback dentro do Shell + recuperação *in-place* do palco WebGL (`hasCanvasOrStage: true`).
  - Falha a frio de `WorkspaceShell-*.js`: fallback `fullscreen` com sessão preservada e botões `"Tentar novamente"` + `"Recarregar página"`, recuperando `<header>` ao tentar novamente. Zero `pageerror` e zero `unhandledrejection`.
- **Não-regressão Fase 04 (WebGL real em Chromium):**
  - `.gltf` com `data:image/svg+xml`, `.glb` com `https://` embutido e `.glb` truncado (`12 B`) foram rejeitados com `[role="alert"]` (`hasCanvas: false`, `0` pedidos externos).
  - `.glb` sintético válido carregou em WebGL (`hasCanvas: true`) sem persistir em `localStorage`.
  - Disparo de `webglcontextlost` manteve o palco oculto montado (`stageKeptMountedHidden: true`) com overlay `WEBGL_UNAVAILABLE`; clicar `"Tentar novamente com o modelo demonstrativo"` restaurou o `<canvas>` e limpou o alerta (`hasWebglAlert: false`, `hasCanvas: true`).
  - `Terminar sessão demo` (`signOut`) seguido de novo login limpou o modelo temporário da sessão (`hasLeftoverLocalModel: false`, `hasDemoRestored: true`).

---

## 3. Classificação P0 / P1 / P2

| Prioridade | ID | Descrição & Localização | Recomendação |
|---|---|---|---|
| **P0** | — | *(Nenhum risco P0 em aberto)* | Os bloqueadores P0 da Fase 04 (`data:` MIME allowlist, recuperação `webglcontextlost`, isolamento `ObjectURL`/logout) foram verificados como corrigidos e sem regressão. |
| **P1** | **P1-01** | **Campos `scale`, `areaSqm` e `elevationDatum` sem limite de comprimento:** `createProject` ([src/data/projectLibraryRepository.ts:1230-1232](../../src/data/projectLibraryRepository.ts#L1230-L1232)) e `updateProjectMetadata` ([L1460-1463](../../src/data/projectLibraryRepository.ts#L1460-L1463)) aceitam strings arbitrárias (`10 000` chars testados), pois não invocam `assertWithinMaxLength`. | Aplicar `assertWithinMaxLength(..., PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH)` a `scale`, `areaSqm` e `elevationDatum` em criação, edição e `validateCanonicalRecord`. |
| **P2** | **P2-01** | **Flakiness de arranque a frio no Vitest paralelo (`npm test`):** `src/test/workspaceShell.test.tsx:45` excedeu o timeout padrão de `1000ms` de `findByRole` enquanto o chunk `React.lazy` resolvia sob `maxWorkers: 4` (passa `99/99` em `--no-file-parallelism`). | Definir `{ timeout: 5000 }` em `findByRole` nessa asserção inicial em `src/test/workspaceShell.test.tsx:45` ou pré-carregar os chunks no setup do teste. |
| **P2** | **P2-02** | **Persistência silenciosa em `StudioDeskPage` sob `QuotaExceededError`:** `saveStudioDeskLocalState` absorve excepções sem notificar o utilizador caso `localStorage` esteja cheio (embora a UI não quebre). | Opcionalmente expor aviso não-bloqueante em `StudioDeskPage` quando a gravação local de estado falhar por quota. |
| **P2** | **P2-03** | **Dependências de desenvolvimento & orçamento VRAM 3D:** `npm audit` reporta 10 alertas em `devDependencies` (`tinypool`/`vitest`/tooling; `0` em produção); modelos glTF/GLB `< 50 MB` ainda não têm limite explícito de resolução de texturas ou contagem máxima de vértices descomprimidos em VRAM. | Actualizar tooling de teste em janela de manutenção e avaliar teto de triângulos/dimensões de textura em `glbInspector.ts` antes de modelos reais de produção. |

---

## 4. Critérios de Fecho e Próximos Passos

1. **Aprovação técnica da Fase 04.5:** As garantias de segurança, privacidade, integridade de cache, sincronização multi-separador, recuperação de chunks e não-regressão 3D/WebGL encontram-se **validadas sem bloqueadores P0**.
2. **Correcções recomendadas antes de dados reais (Fase 05+):**
   - Aplicar `assertWithinMaxLength` a `scale`, `areaSqm` e `elevationDatum` (**P1-01**).
   - Ajustar o timeout de espera da montagem inicial em `workspaceShell.test.tsx:45` (**P2-01**) para estabilizar `npm test` a `99/99` determinísticos em paralelo.
