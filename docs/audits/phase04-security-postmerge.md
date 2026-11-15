# Auditoria Independente Pós-Integração — Fase 04 (O+A Workspace · Equipa 2 / Gemini D)

**Data:** 2026-11-15  
**Branch auditada:** `codex/f02-integration-preview`  
**SHA integrado:** `ac13ee14dad89c446546e65966b1a96983f6a44a`  
**Auditoria inicial de referência:** `codex/f04-security-qa` (`f92da9fe0310229f84466cf260397f2c6301f6aa` · `docs/audits/phase04-security-qa.md`)  
**Branch e worktree desta auditoria:** `codex/f04d-postmerge-security`  
**Âmbito:** Validação independente de segurança, privacidade e QA pós-integração do motor 3D (`src/data/modelAssetRepository.ts`, `src/features/model-engine/`) e do visualizador WebGL (`src/features/model-viewer/`), usando exclusivamente cargas sintéticas em memória/Chromium. Nenhuma alteração funcional foi aplicada nesta etapa.

---

## 1. Resumo Executivo e Estado Face à Auditoria Inicial

A integração realizada pela Equipa 1 (`ac13ee14dad89c446546e65966b1a96983f6a44a`) **corrigiu integralmente 3 dos riscos P0 previstos** na auditoria inicial (`V3D-F04-02`, `V3D-F04-03` quanto a cabeçalhos/truncamentos e `V3D-F04-05` ao unificar o limite em `50 MB`) e **mitigou parcialmente `V3D-F04-01` e `V3D-F04-04`**:

- **Bloqueio de rede e recursos externos (`http:`, `https:`, `//`, `../`, `file:`, `javascript:`, `blob:`):** **FUNCIONAL com ressalva na camada de entrada.** Todos os 10 vetores externos/relativos em `.gltf` e `.glb` foram bloqueados antes da renderização, com **0 pedidos de rede externos** observados em Node e em Chromium/Playwright. Contudo, em ficheiros `.glb`, a validação síncrona de entrada (`validateModelFileSelection` / `validateGlbHeaderBytes`) lê apenas os primeiros 20 bytes e devolve `ok: true`; o bloqueio depende integralmente da segunda linha de defesa assíncrona no visualizador (`validateModelBufferContents` / `findExternalRelativeUri`).
- **Lacuna P0 confirmada em URIs `data:` (Falta de allowlist de MIME + sensibilidade a maiúsculas):** Ambos os validadores (`validateGltfManifestText` em `src/data/modelAssetRepository.ts:441` e `findExternalRelativeUri` / `manager.setURLModifier` em `src/features/model-viewer/glbInspector.ts:213,220,476`) aceitam qualquer URI que comece por `data:` sem restringir tipos MIME. Em teste real em Chromium + WebGL, um ficheiro `.gltf` sintético com `data:image/svg+xml;base64,...` (contendo `<script>` e `<image href="https://evil.example/svg-ssrf.png"/>`) passou ambas as validações e **foi renderizado no palco WebGL** sem alertas. Adicionalmente, `data:text/html;charset=utf-8,<script>alert(1)</script>` também passou ambos os validadores em `.gltf` e `.glb`, enquanto `DATA:image/png;base64,...` em maiúsculas falhou por comparação `startsWith('data:')` sensível a maiúsculas.
- **Lacuna P0 confirmada na recuperação após perda de contexto WebGL:** Quando o evento `webglcontextlost` é disparado no `<canvas>`, `ArchitecturalModelViewer` muda `status` para `webgl_unavailable` e **desmonta** `<ModelViewerStage />` e o `<canvas>`. Em consequência:
  1. Clicar no botão `"Tentar novamente com o modelo demonstrativo"` chama `handleRestoreDemoModel`, que apenas limpa `viewerRuntimeError` sem alterar `activeSourceKey` nem forçar remontagem/nova tentativa, deixando o visualizador **preso indefinidamente no estado `WEBGL_UNAVAILABLE`**;
  2. Um posterior `webglcontextrestored` do navegador não recupera o palco porque o `<canvas>` já foi desmontado. Falta igualmente um `ErrorBoundary` React em torno de `<Canvas>` em `ModelViewerStage.tsx`.
- **ObjectURLs e memória GPU:** Em trocas repetidas (6 carregamentos seguidos) e no botão `"Repor modelo demonstrativo"`, há paridade `1:1` de revogação (`6 criados / 6 revogados`) e libertação de geometrias/materiais/texturas via `disposeThreeObjectResources`. Contudo, ao navegar por SPA do `/model` de volta para o dossier (`/workspace/projects/:id`), a `sessionModelsByProjectId` (`Map` em memória de módulo) mantém o último `ObjectURL` vivo (`7 criados / 6 revogados`), o que é intencional durante a sessão da página, mas exige atenção no fluxo de **logout** (verificar se encerrar sessão limpa `sessionModelsByProjectId`, dado que hoje apenas `resetAllDemoData()` / `demoResetEpoch` e recarregamento completo chamam `clearAllSessionModels()`).
- **P1/P2 herdados das fases anteriores:** Permanecem abertos `SEC-F04-01` (aceitação de nomes com `../../` e extensão `.html` disfarçada sob `kind: 'model_3d'`), ausência de limites `maxLength` e tecto de registos, `QA-F04-03` (dessincronização entre `StudioDeskPage` e `useProjectLibrary`), `QA-F04-04` (textos desactualizados em `pt.ts`/`en.ts`) e `A11Y-F04-05` + novos achados de acessibilidade no visualizador 3D (ausência de região `aria-live` para mudanças de câmara/overlay e paragem de tabulação dupla no `<input type="file">` oculto).

---

## 2. Comparativo: Auditoria Inicial (`f92da9f`) vs. Código Integrado (`ac13ee14`)

| ID Inicial | Risco Original | Estado Pós-Integração | Evidência Observada em `ac13ee14` |
|---|---|---|---|
| **V3D-F04-01** (P0) | `.gltf` com `http:`, `https:`, caminhos relativos ou `data:` inseguros | **Parcialmente Corrigido (P0 aberto em `data:` MIME)** | Bloqueia `http:`, `https:`, `HTTPS:`, `//`, `../`, `./`, `file:`, `javascript:`, `blob:` em `.gltf` e `.glb` (0 pedidos externos). Contudo, aceita `data:image/svg+xml` e `data:text/html` sem allowlist de MIME, e `validateGlbHeaderBytes` não inspecciona URIs no chunk JSON do `.glb`. |
| **V3D-F04-02** (P0) | Persistência de modelos ou `blob:` URLs em storage | **Corrigido** | Sessão `.glb`/`.gltf` reside apenas em `Map` em memória (`sessionModelsByProjectId`); `localStorage`, `sessionStorage` e `IndexedDB` permanecem sem `blob:` nem payloads binários; recarregamento limpa o modelo temporário. |
| **V3D-F04-03** (P0) | Falta de validação de `.glb` truncado, cabeçalhos falsos ou corrupção | **Corrigido** | Rejeita `0 B`, `<20 B`, magic ZIP falso (`PK\x03\x04`), `declaredLength !== actualByteLength`, JSON inválido no chunk GLB, 0 malhas e `.skp` nativo (`NATIVE_SKP_UNSUPPORTED`). |
| **V3D-F04-04** (P0) | Fuga de `ObjectURL` e recursos GPU em trocas e desmontagem | **Parcialmente Corrigido (P1/P2)** | `selectSessionModelFile`, `clearSessionModelForProject` e `ArchitecturalModelViewer` revogam `ObjectURL`s em trocas e chamam `disposeThreeObjectResources`. Falta limpar `sessionModelsByProjectId` no `logout` (não apenas no reset demo). |
| **V3D-F04-05** (P1) | Ausência de limite unificado de tamanho e risco de OOM | **Parcialmente Corrigido (P2)** | Limite unificado em `50 MB` (`MAX_MODEL_FILE_SIZE_BYTES = 52_428_800`) rejeita `50 MB + 1 B` como `FILE_TOO_LARGE`. Permanece em aberto a protecção contra glTF/GLB altamente comprimido que expanda para dezenas de milhões de vértices/texturas gigantes em VRAM (Draco não está ligado, mas buffers/texturas grandes descompactados não têm teto de triângulos/dimensão de textura). |
| **SEC-F04-01** (P1) | Nomes de ficheiro sem sanitização nem correspondência extensão/tipo | **Ainda Aberto (P1)** | `addProjectFileReference` aceitou `../../evil\payload.html` com `kind: 'model_3d'` e classificou como `HTML · Fase 04`. |
| **SEC-F04-02** (P1) | `QuotaExceededError`, limites de texto e limite de registos | **Parcialmente Corrigido (P1)** | `saveEnvelope` em `projectLibraryRepository.ts` já captura erro de `localStorage.setItem` e lança erro explícito `(QuotaExceededError)`. Contudo, os campos de formulário e repositório continuam sem `maxLength` (aceitou `10 000` caracteres em revisão) e sem limite de quantidade de registos. |
| **QA-F04-03** (P2) | Dessincronização `StudioDeskPage` vs. Biblioteca Canónica | **Ainda Aberto (P2)** | `StudioDeskPage.tsx` continua a ler `STUDIO_DESK_PROJECTS` estático sem consumir `useProjectLibrary()`. |
| **QA-F04-04** (P2) | Textos desactualizados em `pt.ts` / `en.ts` | **Ainda Aberto (P2)** | `storageResetScopeNote` e `search.emptyBody` continuam desalinhados com a Biblioteca de Projectos. |
| **A11Y-F04-05** (P2) | Foco ao abrir formulários inline, `#rev-meta-summary` e acessibilidade do visualizador | **Ainda Aberto (P2)** | Formulário inline de Documentação abre com foco no botão disparador (`BUTTON`), não no campo inicial; falta `ErrorBoundary` e região `aria-live` para mudanças de câmara/overlay; `<input type="file" class="sr-only">` gera tabulação redundante após o botão. |

---

## 3. Verificação Executada e Evidência Reproduzível

### 3.1. Comandos de Repositório e Auditoria de Dependências

| Verificação | Comando | Resultado Observado |
|---|---|---|
| Auditoria de dependências (total) | `npm audit` | Saída `1`: 10 vulnerabilidades (**8 moderadas**: `@vitest/mocker`, `minimatch`, `typescript-eslint`, `vitest`; **2 críticas**: `tinypool`). |
| Auditoria de dependências (produção) | `npm audit --omit=dev` | Saída `0`: **`found 0 vulnerabilities`** (todas as 10 vulnerabilidades afectam apenas `devDependencies`). |
| Análise estática ESLint | `npm run lint` | Saída `0` (sem erros ou avisos). |
| Build de produção | `npm run build` (`tsc -b && vite build`) | Saída `0`: `2784 modules transformed`, chunks `ProjectModelEnginePage` (`890.08 kB` / `228.37 kB` gzip) e `ModelViewerStage` (`199.01 kB` / `62.67 kB` gzip) gerados. |
| E2E Chromium oficial | `npm run test:e2e` (`node scripts/e2e-verify-entry.mjs`) | Saída `0`: `E2E Verification PASSED cleanly` (0 pedidos externos inesperados, 0 erros de runtime nas larguras desktop, 720px, tablet e 375px). |
| Suite Vitest (paralelismo padrão) | `npm test` (`vitest run`) | **Instável sob contenção de CPU:** `67 passed \| 6 failed (73)` em 3 ficheiros (`modelEngine.test.tsx`, `projectExperience.test.tsx`, `projectLibrary.test.tsx`), com 4 timeouts (`20000ms`/`45000ms`), 1 falha de timing em `aria-invalid` e 1 falha de espera no `GlobalSearchDialog`. |
| Suite Vitest (sequencial) | `npx vitest run --no-file-parallelism` (com `TEMP`/`TMP` em `D:`) | Saída `0`: **`9 passed (9)` ficheiros, `73 passed (73)` testes** em `243.53s`. Sem `TEMP` na unidade `D:`, houve falha prévia `ENOSPC` por `C:` estar a `0.04 GB` livres. |

### 3.2. Sondagem Sintética P0 (API + Chromium/WebGL Real)

Executada com cargas 100% sintéticas em memória (via Vite SSR loader `probe_api.mjs` e Playwright Chromium `probe_browser.mjs` / `probe_browser_followup.mjs` / `probe_en_quota.mjs` sobre `vite preview`).

#### Matriz P0 #1, #2 e #3 — Bloqueio de URIs Externos, Relativos e `data:` (`.gltf` e `.glb`)

| Vector Sintético | URI Testado | `.gltf` Agente A (`validateModelFileSelection`) | `.gltf` Agente B (`validateModelBufferContents`) | `.glb` Agente A (`validateModelFileSelection`) | `.glb` Agente B (`validateModelBufferContents`) | Chromium Rede Externa (`page.on('request')`) | Renderizou em WebGL? |
|---|---|---|---|---|---|---|---|
| `http_buffer` | `http://evil.example/model.bin` | Bloqueado (`GLTF_EXTERNAL_RESOURCES_MISSING`) | Bloqueado (`error_invalid`) | **PASSOU A** (`ok: true`) | Bloqueado (`Unresolved external dependency URI`) | **0 pedidos** | Não |
| `https_image` | `https://evil.example/tex.png` | Bloqueado (`GLTF_EXTERNAL_RESOURCES_MISSING`) | Bloqueado (`error_invalid`) | **PASSOU A** (`ok: true`) | Bloqueado (`Unresolved external dependency URI`) | **0 pedidos** | Não |
| `UPPER_HTTPS_image` | `HTTPS://evil.example/tex.png` | Bloqueado (`GLTF_EXTERNAL_RESOURCES_MISSING`) | Bloqueado (`error_invalid`) | **PASSOU A** (`ok: true`) | Bloqueado (`Unresolved external dependency URI`) | **0 pedidos** | Não |
| `protocol_relative_image` | `//evil.example/tex.png` | Bloqueado (`GLTF_EXTERNAL_RESOURCES_MISSING`) | Bloqueado (`error_invalid`) | **PASSOU A** (`ok: true`) | Bloqueado (`Unresolved external dependency URI`) | **0 pedidos** | Não |
| `parent_traversal_buffer` | `../secret.bin` | Bloqueado (`GLTF_EXTERNAL_RESOURCES_MISSING`) | Bloqueado (`error_invalid`) | **PASSOU A** (`ok: true`) | Bloqueado (`Unresolved external dependency URI`) | **0 pedidos** | Não |
| `relative_buffer` | `mesh.bin` | Bloqueado (`GLTF_EXTERNAL_RESOURCES_MISSING`) | Bloqueado (`error_invalid`) | **PASSOU A** (`ok: true`) | Bloqueado (`Unresolved external dependency URI`) | **0 pedidos** | Não |
| `dotslash_image` | `./tex.png` | Bloqueado (`GLTF_EXTERNAL_RESOURCES_MISSING`) | Bloqueado (`error_invalid`) | **PASSOU A** (`ok: true`) | Bloqueado (`Unresolved external dependency URI`) | **0 pedidos** | Não |
| `file_scheme` | `file:///C:/Windows/win.ini` | Bloqueado (`GLTF_EXTERNAL_RESOURCES_MISSING`) | Bloqueado (`error_invalid`) | **PASSOU A** (`ok: true`) | Bloqueado (`Unresolved external dependency URI`) | **0 pedidos** | Não |
| `javascript_scheme` | `javascript:alert(1)` | Bloqueado (`GLTF_EXTERNAL_RESOURCES_MISSING`) | Bloqueado (`error_invalid`) | **PASSOU A** (`ok: true`) | Bloqueado (`Unresolved external dependency URI`) | **0 pedidos** | Não |
| `blob_external` | `blob:https://evil.example/1234` | Bloqueado (`GLTF_EXTERNAL_RESOURCES_MISSING`) | Bloqueado (`error_invalid`) | **PASSOU A** (`ok: true`) | Bloqueado (`Unresolved external dependency URI`) | **0 pedidos** | Não |
| **`data_svg_base64`** | `data:image/svg+xml;base64,...` (c/ `<script>` e `<image href="https://...">`) | **ACEITE** (`ok: true`) | **ACEITE** (`valid: true`) | **ACEITE** (`ok: true`) | **ACEITE** (`valid: true`) | **0 pedidos** | **SIM (`hasCanvas: true`, 0 alertas)** |
| **`data_svg_plain`** | `data:image/svg+xml,<svg...>` | **ACEITE** (`ok: true`) | **ACEITE** (`valid: true`) | **ACEITE** (`ok: true`) | **ACEITE** (`valid: true`) | — | — |
| **`data_text_html`** | `data:text/html;charset=utf-8,<script>...` | **ACEITE** (`ok: true`) | **ACEITE** (`valid: true`) | **ACEITE** (`ok: true`) | **ACEITE** (`valid: true`) | — | — |
| `data_uppercase_png` | `DATA:image/png;base64,...` | Bloqueado (`GLTF_EXTERNAL_RESOURCES_MISSING`) | Bloqueado (`error_invalid`) | **PASSOU A** (`ok: true`) | Bloqueado (`error_invalid`) | — | — |
| `data_valid_png` / `octet-stream` | `data:image/png;base64,...` / `data:application/octet-stream;base64,...` | Aceite (`ok: true`) | Aceite (`valid: true`) | Aceite (`ok: true`) | Aceite (`valid: true`) | **0 pedidos** | Sim (1 mesh) |

#### Matriz P0 #4 — Ficheiros Truncados, Cabeçalhos Falsos, Corrupção e Excesso de Tamanho

| Caso Sintético | Agente A (`validateModelFileSelection`) | Agente B (`validateModelBufferContents`) | `parseGlbSceneAndTelemetry` / UI Chromium | Resultado |
|---|---|---|---|---|
| `empty_0B_glb` (`0 B`) | Bloqueado (`EMPTY_FILE`) | Bloqueado (`File too short (0 bytes)`) | Rejeitado | PASS |
| `truncated_12B_glb` (`12 B`) | Bloqueado (`INVALID_GLB_HEADER`) | Bloqueado (`File too short (12 bytes)`) | UI exibiu alerta `ERROR_INVALID` | PASS |
| `fake_zip_as_glb` (`PK\x03\x04` como `.glb`) | Bloqueado (`INVALID_GLB_HEADER`) | Bloqueado (`error_invalid`) | Rejeitado | PASS |
| `declared_length_mismatch_glb` (`declaredLength=999999`) | Bloqueado (`INVALID_GLB_HEADER`) | Bloqueado (`Invalid GLB header... actual=452`) | Rejeitado | PASS |
| `corrupt_json_chunk_glb` (`{broken_json` c/ cabeçalho 20B válido) | Passa A (`ok: true`) | Bloqueado (`error_invalid`) | Rejeitado por B antes de WebGL | PASS (com nota de defesa em profundidade) |
| `zero_meshes_glb` (`meshes: []`) | Passa A (`ok: true`) | Passa inspeção JSON (`valid: true`) | Rejeitado no parser (`ok: false`) | PASS |
| `native_skp` (`.skp`) | Bloqueado (`NATIVE_SKP_UNSUPPORTED`) | Bloqueado (`error_invalid`) | Rejeitado | PASS |
| `oversized_50MB_plus_1` (`52 428 801 B`) | Bloqueado (`FILE_TOO_LARGE`) | Não invocado | Rejeitado | PASS |

#### P0 #5, #6 e #7 — Persistência, `ObjectURL`, Memória GPU e Perda de Contexto WebGL

- **P0 #5 (Persistência Zero):** Após carregar `synth-1.glb` em Chromium, `localStorage` continha apenas `oa_workspace_demo_session_v1` (106 bytes, sem `blob:` nem nomes/dados de modelos), `sessionStorage` estava vazio (`[]`) e `indexedDB.databases()` estava vazio (`[]`). Após recarregamento da página, `sessionSurvivedReload: false` (o modelo de sessão desaparece e volta o modelo demonstrativo).
- **P0 #6 (`ObjectURL` e GPU):**
  - Após 6 trocas sequenciais (`swap-1.glb` .. `swap-6.glb`): `created: 6`, `revoked: 5` (os 5 anteriores revogados imediatamente).
  - Após clicar `"Repor modelo demonstrativo"`: `created: 6`, `revoked: 6` (0 pendentes).
  - Após 7.ª carga e navegação SPA para o dossier (`Voltar ao dossier`): `created: 7`, `revoked: 6` (o 7.º permanece propositadamente no `Map` de sessão em memória enquanto não houver reset, nova carga ou reload). **Risco residual:** o `logout` em `WorkspaceSessionContext` deve invocar `clearAllSessionModels()` explicitamente para não manter um modelo temporário em RAM caso outro papel entre de seguida na mesma aba.
- **P0 #7 (Perda e Recuperação WebGL):**
  - Disparo de `webglcontextlost` (`cancelable: true`) no `<canvas>` resultou em `defaultPrevented: true`, transição para `role="alert"` com `WEBGL_UNAVAILABLE` e remoção do `<canvas>` (`hasCanvas: false`).
  - Clicar no botão `"Tentar novamente com o modelo demonstrativo"` **falhou a recuperação** (`hasCanvas: false`, alerta `WEBGL_UNAVAILABLE` inalterado).
  - Disparo posterior de `window.dispatchEvent(new Event('webglcontextrestored'))` também **não recuperou o `<canvas>`** (`canvasMountedAfterWindowRestored: false`), porque `<ModelViewerStage />` já tinha sido desmontado pelo estado de erro em `ArchitecturalModelViewer.tsx`.

---

## 4. Classificação Consolidada de Achados (P0 / P1 / P2)

### Prioridade P0 — Bloqueadores antes de avançar para Fase 05 / dados reais

1. **[P0-01] Falta de allowlist de tipos MIME em URIs `data:` (`.gltf`, `.glb` e `LoadingManager`)**
   - **Localização:** `src/data/modelAssetRepository.ts:441` (`validateGltfManifestText`); `src/features/model-viewer/glbInspector.ts:213,220` (`findExternalRelativeUri`) e `src/features/model-viewer/glbInspector.ts:476` (`manager.setURLModifier`).
   - **Descrição:** Qualquer URI que comece por `data:` (ex.: `data:image/svg+xml`, `data:text/html`) é aceite sem validar o MIME. Em Chromium, `.gltf` com `data:image/svg+xml;base64,...` carregou e renderizou no WebGL. Além disso, a verificação é sensível a maiúsculas (`DATA:` falha).
   - **Recomendação de correção:**
     - Criar um validador partilhado `isAllowedEmbeddedDataUri(uri, kind: 'buffer' | 'image')` (case-insensitive no prefixo `data:`).
     - Permitir estritamente para `buffers[]`: `application/octet-stream`, `application/gltf-buffer`.
     - Permitir estritamente para `images[]`: `image/png`, `image/jpeg`, `image/webp` (e opcionalmente `image/ktx2` se suportado); **rejeitar explicitamente `image/svg+xml`, `text/html`, `application/javascript` e quaisquer outros MIMEs** tanto no validador do motor como em `glbInspector.ts` (`validateModelBufferContents` e `manager.setURLModifier`).
     - Inspeccionar também o chunk JSON dentro de `.glb` logo em `validateGlbHeaderBytes` / `validateModelFileSelection` (ou partilhar `validateModelBufferContents`) para não depender apenas da segunda camada em ficheiros `.glb`.

2. **[P0-02] Falha de recuperação após `webglcontextlost` e ausência de React `ErrorBoundary` no `<Canvas>`**
   - **Localização:** `src/features/model-viewer/ArchitecturalModelViewer.tsx:365-372,554-564`, `src/features/model-engine/useProjectModelEngine.ts:253-265`, `src/features/model-viewer/ModelViewerStage.tsx`.
   - **Descrição:** Ao perder o contexto WebGL, `ArchitecturalModelViewer` desmonta `<ModelViewerStage />` e fica bloqueado em `status === 'webgl_unavailable'`:
     - O botão `"Tentar novamente com o modelo demonstrativo"` não altera `activeSourceKey` nem `webglSupported`, pelo que o `useEffect` de carregamento não volta a correr;
     - Sem `<canvas>` montado, o evento `webglcontextrestored` não consegue restaurar o visualizador;
     - Excepções de renderização R3F dentro de `<Canvas>` não têm `ErrorBoundary` dedicado.
   - **Recomendação de correção:**
     - Introduzir um contador `retryEpoch` (ou callback explícito de retry no `ArchitecturalModelViewer` e `useProjectModelEngine`) que limpe `errorDetail`, reavalie `detectWebGLSupport()`, reponha `status = 'loading'` e inclua `retryEpoch` nas dependências do `useEffect` de carga;
     - Em vez de destruir irreversivelmente o estado sem hipótese de retorno, permitir que o CTA de recuperação force remontagem controlada com novo `key` ou escute recuperação;
     - Envolver `<ModelViewerStage />` com um `ErrorBoundary` React específico que capture falhas de criação de contexto WebGL e as encaminhe para `onModelError` / `error_invalid`.

---

### Prioridade P1 — Correções recomendadas antes de aceitar dados de atelier/clientes

3. **[P1-01] `logout` não limpa explicitamente `sessionModelsByProjectId` em memória (`ObjectURL`s residuais na mesma aba)**
   - **Localização:** `src/app/WorkspaceSessionContext.tsx` e `src/data/modelAssetRepository.ts` (`clearAllSessionModels`).
   - **Descrição:** Embora `resetAllDemoData()` incremente `demoResetEpoch` e limpe os modelos temporários, o simples encerramento de sessão (`logout`) não invoca `clearAllSessionModels()`, deixando um `ObjectURL` carregado por um utilizador demo acessível na memória da aba se outro utilizador entrar logo a seguir sem fechar o separador.
   - **Recomendação:** Invocar `clearAllSessionModels()` também dentro de `logout()` em `WorkspaceSessionContext.tsx`.

4. **[P1-02] Validação de nomes de ficheiros e correspondência extensão/tipo ausente no Dossier (`SEC-F04-01`)**
   - **Localização:** `src/data/projectLibraryRepository.ts:1198-1209` (`addProjectFileReference`).
   - **Descrição:** Aceitou `../../evil\payload.html` sob `kind: 'model_3d'` sem sanitizar separadores/`..` e exibiu `HTML · Fase 04` numa referência 3D.
   - **Recomendação:** Rejeitar sequências `/`, `\`, `..`, esquemas de URL e caracteres de controlo nos nomes de ficheiro; validar whitelist de extensões por `ProjectFileKind` (ex.: `.glb`, `.gltf`, `.obj` para `model_3d`; `.skp` para `source_skp`).

5. **[P1-03] Ausência de limites `maxLength` e teto de registos em `localStorage` (`SEC-F04-02` parcial)**
   - **Localização:** `src/data/projectLibraryRepository.ts`, `src/features/project-experience/ProjectDossierView.tsx`, `src/features/project-experience/ProjectCreationWizard.tsx`.
   - **Descrição:** Embora `saveEnvelope` já capture erros de escrita e lance uma excepção tratável em `QuotaExceededError`, os campos de texto não possuem atributo `maxLength` (`maxLength: null` verificado em Chromium) e o repositório aceitou `10 000` caracteres numa nota de revisão sem limite de tamanho ou número máximo de revisões/ficheiros/projectos.
   - **Recomendação:** Definir limites explícitos de caracteres na UI (`maxLength`) e no repositório (ex.: títulos `<= 160`, descrições/notas `<= 2000`, revisões/ficheiros por projecto `<= 100`, projectos locais `<= 50`), e verificar em teste de UI dedicado o comportamento de `QuotaExceededError` na submissão do formulário de documentação com todos os campos obrigatórios preenchidos.

6. **[P1-04] Consumo potencial de VRAM/RAM em glTF/GLB descomprimido dentro do teto de 50 MB**
   - **Localização:** `src/features/model-viewer/glbInspector.ts`.
   - **Descrição:** Um ficheiro `< 50 MB` pode declarar dimensões extremas de malha ou texturas embutidas (ex.: dezenas de imagens 8K/16K em data URI) causando falha GPU/tab crash apesar do limite de bytes de ficheiro.
   - **Recomendação:** Validar contagem máxima razoável de vértices/primitivas e dimensões máximas de imagem/buffer no chunk JSON ou antes de enviar texturas ao GPU.

---

### Prioridade P2 — Qualidade, Consistência e Acessibilidade

7. **[P2-01] Instabilidade de testes Vitest sob contenção paralela (`npm test`)**
   - **Evidência:** Em `npm test` padrão (execução paralela em workers no Windows), `6/73` testes falharam por timeout (`20000ms`/`45000ms`) ou atraso de renderização em `modelEngine.test.tsx`, `projectExperience.test.tsx` e `projectLibrary.test.tsx`, apesar de passarem em execução sequencial (`--no-file-parallelism`).
   - **Recomendação:** Rever a configuração `test` em `vite.config.ts` (ex.: `fileParallelism` ou `maxWorkers: 2` / timeouts em testes pesados com `Three.js` + `userEvent`) para tornar `npm test` determinístico em máquinas de desenvolvimento e CI.

8. **[P2-02] Dessincronização entre `StudioDeskPage` e `ProjectLibrary` (`QA-F04-03`)**
   - **Localização:** `src/features/studio-desk/StudioDeskPage.tsx`.
   - **Descrição:** Continua ligado a `STUDIO_DESK_PROJECTS` estático; projectos criados/editados/arquivados na Biblioteca não se reflectem na Mesa de Trabalho.

9. **[P2-03] Paridade textual residual em `src/locales/pt.ts` e `src/locales/en.ts` (`QA-F04-04`)**
   - **Descrição:** `storageResetScopeNote` ainda omite `oa_workspace_project_library_v1` e `search.emptyBody` ainda refere apenas 5 projectos do Studio Desk.

10. **[P2-04] Melhorias WCAG 2.2 AA no Visualizador 3D e Dossier (`A11Y-F04-05`)**
    - **Evidência em Chromium:**
      - No Dossier, abrir o formulário inline de documentação manteve foco no botão (`BUTTON`) em vez de mover o foco para o primeiro input (`#doc-meta-filename`);
      - No visualizador 3D, `<canvas>` não possui descrição/instrução acessível nem anúncios em região `aria-live` ao trocar vistas ortogonais/isométrica ou toggles de grelha/eixos/malha;
      - Na ordem de tabulação do visualizador, após o botão `"Seleccionar ficheiro .glb / .gltf"`, o `<input type="file" class="sr-only">` recebe um segundo foco redundante.
    - **Recomendação:** Aplicar `tabIndex={-1}` no `<input type="file">` disparado por botão; adicionar uma região `aria-live="polite"` no `ArchitecturalModelViewer` para anunciar alterações de câmara/grelha/eixos/malha; mover foco programaticamente ao abrir formulários inline do Dossier.

---

## 5. Critérios Recomendados para Aprovação Final da Fase 04

Para encerramento completo da Fase 04 (pré-requisito antes da Fase 05 / integração real):

1. **[Obrigatório P0-01]** Bloquear `data:image/svg+xml`, `data:text/html` e quaisquer MIMEs fora da allowlist estrita (`application/octet-stream`, `application/gltf-buffer`, `image/png`, `image/jpeg`, `image/webp`) de forma **case-insensitive**, tanto no Agente A (`modelAssetRepository.ts`) quanto no Agente B (`glbInspector.ts` + `LoadingManager.setURLModifier`), e inspeccionar URIs do chunk JSON de `.glb` logo na selecção do ficheiro.
2. **[Obrigatório P0-02]** Corrigir o ciclo de recuperação após `webglcontextlost` (botão de tentativa + suporte a `webglcontextrestored`) e adicionar `ErrorBoundary` React em torno do `<Canvas>`.
3. **[Recomendado P1]** Chamar `clearAllSessionModels()` no `logout()`, sanitizar nomes de ficheiros no Dossier (`addProjectFileReference`) e adicionar limites `maxLength` + teto de registos no repositório.
4. **[Regressão]** Adicionar testes automatizados (Vitest + Playwright) cobrindo especificamente: (a) rejeição de `data:image/svg+xml` e `data:text/html` em `.gltf` e `.glb`; (b) simulação de `webglcontextlost` seguida de recuperação efectiva por clique no CTA de retry.
