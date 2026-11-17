# Plano 009 — Fase 04 · Integração da Equipa 1 (Agentes A + B)

- **Estado:** Em execução e verificação final
- **Branch de destino:** `codex/f02-integration-preview`
- **Worktree exclusivo:** `d:\projects\O+A Architecture and Planners\Main\oaworkspace-f02-preview`
- **Commit base:** `b91b056ddcb278234e2378f595bc4255f3ee77d0`
- **Agente A (`codex/f04-model-engine`):** `308cd91a0a37b75cf3060656fd4e5f2468c477ac`
- **Agente B (`codex/f04-viewer-experience`):** `cb95178ac4d964eeb5b54b434167f6d91dec224d`

---

## 1. Âmbito da Integração

Integrar o motor de modelos e contratos de sessão da Fase 04A (`codex/f04-model-engine`) com o visualizador Web 3D real da Fase 04B (`codex/f04-viewer-experience`), resolvendo as incompatibilidades identificadas na revisão técnica e validando a experiência 3D completa em WebGL real.

---

## 2. Correções P0 Aplicadas

### P0.1 — Catálogo de Modelos Canónico
- `DEMO_MODEL_CATALOG` em `src/data/modelAssetRepository.ts` aponta exclusivamente para ficheiros `.glb` existentes em `public/assets/models/`:
  - `/assets/models/oa-ponta-vermelha-pavilion-demo.glb` (`24 116` bytes, 16 malhas, 192 triângulos, unidade declarada `m`)
  - `/assets/models/oa-costa-terraces-massing-demo.glb` (`13 000` bytes, 8 malhas, 96 triângulos, unidade declarada `m`)
- Mantido o estudo seccional `.gltf` 2.0 auto-contido (`oa-26-101-canopy-section-study.gltf`) com manifesto e buffer embebidos em memória (`EMBEDDED_DEMO_GLTF_JSON` / `EMBEDDED_DEMO_GLTF_DATA_URI`).
- Removida qualquer referência ao ficheiro inexistente `/assets/models/oa-baia-modular-timber.glb`.

### P0.2 — Projeto Sem Modelo (`source === null`)
- Quando um projeto não possui modelo demonstrativo nem ficheiro de sessão (`activeModelSource === null` ou projetos como `OA-26-114` / `OA-25-089` / projetos criados na sessão), `findDemoModelForProject` devolve `null` e `ArchitecturalModelViewer` permanece em `status === 'empty'`, sem carregar automaticamente modelos de outro projeto.

### P0.3 — Fonte Única de Estado
- **Agente A (`useProjectModelEngine` + `modelAssetRepository`):** controla o modelo ativo por projeto, a seleção e validação de ficheiros locais, a criação e revogação de `ObjectURL`, a troca de modelos disponíveis e a limpeza de sessão.
- **Agente B (`ArchitecturalModelViewer` + `ModelViewerStage` + `glbInspector`):** controla o `GLTFLoader`, a cena Three.js, câmaras e presets, controlos orbitais, grelha/eixos/wireframe, telemetria geométrica real e libertação de recursos GPU (`geometry.dispose()`, `material.dispose()`, `texture.dispose()`).

### P0.4 — Sucesso Real Ligado ao Carregamento 3D
- Removido o `ModelEngineStageSlot` provisório, o botão de simulação de sucesso (`simulateReadyCta`) e as métricas fictícias (`1240` triângulos).
- `loadState === 'ready'` no motor do projeto só é declarado quando `ArchitecturalModelViewer` invoca `onModelLoaded(telemetry)` após `GLTFLoader` concluir o parsing e a cena 3D estar pronta (`status === 'loaded'`).
- Qualquer falha do `GLTFLoader`, cabeçalho inválido, recurso externo bloqueado ou indisponibilidade de WebGL propaga `onModelError(message)` para o motor (`loadState === 'error'`).

---

## 3. Correções P1 Aplicadas

1. **Limite único de ficheiro (50 MB):** `DEFAULT_MAX_MODEL_FILE_SIZE_BYTES` em `src/features/model-viewer/demoModels.ts` e todas as mensagens PT/EN em `src/features/model-viewer/i18n.ts` foram alinhadas com `MAX_MODEL_FILE_SIZE_BYTES = 50 * 1024 * 1024` (50 MB).
2. **Proibição de URLs temporários falsos:** `createObjectUrlSafely` em `src/data/modelAssetRepository.ts` e `handleLocalFileSelection` em `src/features/model-viewer/ArchitecturalModelViewer.tsx` validam o resultado de `URL.createObjectURL` (`blob:` ou `data:`) e rejeitam o carregamento com erro explícito quando a API falha, sem inventar `blob:oa-workspace-session/...` nem `local-memory://`.
3. **Validação estrita do comprimento GLB:** `validateGlbHeaderBytes` e `validateModelBufferContents` validam `byteLength >= 20`, `magic === 0x46546C67`, `version === 2`, `declaredLength === buffer.byteLength` e cabeçalho do primeiro chunk JSON (`0x4E4F534A`).
4. **Bloqueio de dependências externas:** `validateGltfManifestText`, `validateModelBufferContents` e o `THREE.LoadingManager` em `parseGlbSceneAndTelemetry` bloqueiam qualquer URI externa ou relativa em `buffers` e `images` tanto para modelos locais como demonstrativos (permitindo apenas `data:` e `blob:` auto-contidos).
5. **Libertação de recursos:** `ObjectURL` revogado ao substituir modelo, limpar modelo ou desmontar; geometrias, materiais e texturas Three.js libertados via `disposeObjectTree` na troca de modelo ou desmontagem da cena.
6. **Preservação funcional:** distinção documental `.skp`, privacidade da sessão, avisos de demonstração fictícia, unidades honestas (`declaredUnit: null` -> `unid.` / `units`) e navegação Dossier ↔ Visualizador 3D ↔ Biblioteca de Projetos.

---

## 4. Verificações Reais Executadas (Quality Gate)

1. **`npm run lint`:** 0 erros, 0 avisos (`eslint .`).
2. **`npm run test`:** `9 passed (9)` ficheiros de teste, `73 passed (73)` testes unitários e de integração (`vitest run`).
3. **`npm run build`:** `tsc -b && vite build` concluído com sucesso (`2784 modules transformed`, code-split de `ModelViewerStage` e `ProjectModelEnginePage`).
4. **`npm run test:e2e`:** `E2E Verification PASSED cleanly` em Chromium real com WebGL ativo:
   - Validação de projeto sem modelo (`Pavilhão E2E Maputo` -> `data-viewer-status="empty"`, sem carregar automaticamente modelos de outro projeto).
   - Renderização WebGL real de `/workspace/projects/sd-proj-oa-26-101/model` (`oa-ponta-vermelha-pavilion-demo.glb`, 16 malhas, 192 triângulos, 384 vértices, 7 materiais, `24 m × 10.6 m × 16 m`) e `/workspace/projects/sd-proj-oa-26-108/model` (`oa-costa-terraces-massing-demo.glb`, 8 malhas, 96 triângulos).
   - Comutação entre `.GLB` (`MOD-OA-101-V3`) e `.GLTF` auto-contido (`MOD-OA-101-GLTF`), vistas ortogonais/isométrica, zoom, recentrar, repor vista inicial, grelha, eixos e modo malha (`wireframe`).
   - Verificação responsiva sem overflow horizontal em `1440px`, `768px` e `375px`, bilingue PT/EN e seis perfis demonstrativos.

---

## 5. Integração Final de Hardening (A + B) e Quality Gate Definitivo

- **Estado pós-hardening:** Aprovado e verificado em integração real (lint, unit/integration `86/86`, build, E2E WebGL e stress test Chromium de 10 ciclos)
- **Base antes da integração de hardening:** `ac13ee14dad89c446546e65966b1a96983f6a44a`
- **Agente A (`codex/f04a-security-hardening`):** `83cac2ca4c5e0ad5ed0e3a3909b34e3077260c21` (`git merge --no-ff`)
- **Agente B (`codex/f04b-webgl-hardening`):** `aa2fe1e8081dfd5c57138ff54f0d2236cd4374ed` (`git merge --no-ff`)

### 5.1 Correcções de Integração Efectuadas

1. **Correcção P0 — Coordenação de Recuperação WebGL Integrada (`onRetryRecovery`):**
   - Adicionado `onRetryRecovery?: () => void` em `ModelViewerCallbacks` (`src/features/model-engine/modelViewerContract.ts`), implementado `handleRetryRecovery` em `useProjectModelEngine.ts`, ligado em `ProjectModelEnginePage.tsx` e propagado em `ModelEngineStageSlot.tsx` para `<ArchitecturalModelViewer />`.
   - Em `ArchitecturalModelViewer.tsx`:
     - Adicionada guarda (`isContextLostRef` / `hasFatalExternalError`) para que um `externalErrorDetail` de perda WebGL (`status === 'webgl_unavailable'`) não desmonte prematuramente o `<Canvas>` nem liberte a cena montada enquanto `isContextLost === true`.
     - Separado `handleRetryRecovery` de `handleRestoreDemoModel`: em recuperação após perda de contexto WebGL ou falha transitória num modelo activo válido, retenta a fonte activa (incluindo ficheiro temporário local `.glb`/`.gltf` da sessão ou estudo alternado) sem apagar `sessionModelsByProjectId`, incrementando `stageResetKey` para montar um `<Canvas>` WebGL limpo, invocando `onRetryRecovery()` para limpar `viewerRuntimeError` e aguardando `onModelLoaded` antes de voltar a `loadState === 'ready'`. Quando um ficheiro local em si falha validação (`error_invalid`, `error_too_large`, `error_format`), mantém o regresso honesto ao modelo demonstrativo.
     - Em `handleWebGLContextRestored`, invoca igualmente `onRetryRecoveryRef.current?.()` antes de anunciar `onModelLoaded`.
2. **Consistência Estreita de Segurança A + B:**
   - Alinhada `extractDataUriMimeType` em `src/features/model-viewer/glbInspector.ts` com `isAllowedEmbeddedDataUri` em `src/data/modelAssetRepository.ts` para rejeitar igualmente caracteres de controlo ASCII, cabeçalhos sem `,`, MIME vazio e parâmetros com tentativas de smuggling (`svg`, `html`, `script`, `<`, `>`), mantendo a allowlist estrita: buffers (`application/octet-stream`, `application/gltf-buffer`) e imagens (`image/png`, `image/jpeg`, `image/webp`) com verificação case-insensitive.
   - Bloqueio confirmado em testes unitários e Chromium real para `.gltf` e `.glb` com `image/svg+xml`, `text/html`, `javascript`, esquemas externos e caminhos relativos antes da criação de `ObjectURL` ou invocação de `GLTFLoader` (`0` pedidos externos).
   - Validada limpeza de `ObjectURL`s no `signOut()` (`WorkspaceSessionContext.tsx`), validação de nomes documentais/extensões/limites (`projectLibraryRepository.ts`, `ProjectDossierView.tsx`, `ProjectCreationWizard.tsx`) e preservação de `QuotaExceededError`.

### 5.2 Registo dos Testes Executados

| Gate Executado | Estado | Resultado Exacto Observado |
|---|---|---|
| `npm run lint` (`eslint .`) | Passou | `0` erros, `0` avisos |
| `npm run build` (`tsc -b && vite build`) | Passou | `2 785` módulos em `19.76s` (`index` `850.09 kB`, `ProjectModelEnginePage` `894.34 kB`, `ModelViewerStage` `200.66 kB`) |
| `npm run test` (`vitest run`) | Passou | `11` ficheiros passados (`11/11`), **`86` testes passados (`86/86`)** em `28.84s` (inclui `modelEngineSecurity.test.tsx`, `projectLibrarySecurity.test.tsx`, `modelViewer.test.tsx` e novo teste de recuperação `modelEngine.test.tsx`) |
| `npm run test:e2e` (`scripts/e2e-verify-entry.mjs`) | Passou | `E2E Verification PASSED cleanly` em `1440×900`, `1440×680`, `768×1024`, `720×450` e `375×812` com WebGL real |
| Chromium + CDP Real (`verify-f04-hardening-webgl.mjs`) | Passou | Verificação WebGL real: troca `.glb` ↔ `.gltf` sem recriar `<Canvas>`, `loseContext()` → recuperação pelo botão até `loaded` + `ready`, rejeição `malicious-svg.gltf` com `0` pedidos externos, `0` erros de consola e `0` overflow em `375px` / `768px` |

### 5.3 Comparação de Desempenho Antes vs Depois (`docs/audits/phase04-performance-postmerge.md`)

| Métrica Medida em Chromium + CDP (10 ciclos `/model` + swap `.gltf`/`.glb` + Dossier) | Pós-Merge Inicial (`ac13ee1`) | Pós-Hardening Integrado (`codex/f02-integration-preview`) | Evolução |
|---|---:|---:|---|
| Contextos WebGL criados em 10 ciclos | `70` (`40` detect + `30` stage) | **`11`** (`1` detect em cache + `10` stage) | **`-84.3%`** (`0` recriações em trocas `.glb`/`.gltf`) |
| Contextos `detect` sem `loseContext()` | `40` | **`0`** (`1` único teste em cache com `loseContext()`) | **Eliminado** |
| Recriação de `<Canvas>` ao trocar `.glb` ↔ `.gltf` | Sim (`3×` por visita) | **Não** (`sameCanvasElementAcrossSwaps: true`, `stageContextsCreated: 1`) | **Resolvido** |
| `preserveDrawingBuffer` (`gl.getContextAttributes()`) | `true` | **`false`** | **Corrigido** |
| `powerPreference` | `"high-performance"` rígido | **`"default"`** (perfil económico adaptativo) | **Corrigido** |
| DPR efectivo com `deviceScaleFactor: 2` (`637 × 468 px`) | `2.000` (`1273 × 936` = `1 191 528 px`) | **`1.498`** (`954 × 702` = `669 708 px`) | **`-43.8%` pixeis** |
| `requestAnimationFrame` / Draw calls em `3 000 ms` idle | `0` / `0` | **`0` / `0`** | Mantido `100%` |
| `liveBuffers` após 10 ciclos | `0` (`1 030 / 1 030` libertados) | **`0`** (`1 030 / 1 030` libertados) | Mantido `100%` |
| Handles WebGL internos vivos pós-saída (Ciclo 10: Texturas / Programas / Framebuffers) | `120` / `60` / `90` | **`40` / `20` / `30`** | **`-66.7%`** |
| Nós DOM CDP (Baseline → Ciclo 10 pós-GC) | `545` → `10 257` (`+9 712`) | `540` → `9 369` (`+8 829`) | Redução ligeira (`-9.1%`); crescimento linear de saída/entrada permanece observado |
| `JSEventListeners` (Baseline → Ciclo 10 pós-GC) | `223` → `683` | `195` → `644` | Redução ligeira (`-5.7%`) |
| JS Heap pós-GC (Ciclo 1 → Ciclo 10) | `8.87 MB` → `11.94 MB` | `8.46 MB` → `11.61 MB` | Estabilizado (`~3 MB` delta) |
| Recuperação real após `WEBGL_lose_context.loseContext()` | Falha potencial de dessincronização/Canvas | **Recuperado via CTA sem recarregar (`status="loaded"`, `loadState="ready"`, `16 meshes`)** | **Corrigido (`P0`)** |

### 5.4 Limitações e Problemas Conhecidos em Aberto (Fora do Âmbito WebGL/Segurança P0)

Mantêm-se registados para eventuais ciclos futuros de optimização geral (não bloqueantes para a Fase 04):
1. **Importações estáticas de rotas não-3D e acoplamento do chunk inicial (`PERF-P0-01` / `PERF-NEW-03`):** 8 rotas não-3D e `modelAssetRepository` continuam no chunk `index-*.js` (`850.09 kB` raw / `239.76 kB` gzip) e `vite.config.ts` não possui ainda `manualChunks` (`ProjectModelEnginePage` em `894.34 kB`). Three.js, R3F e Drei continuam 100% isolados da entrada inicial (`0` bytes carregados antes de `/model`).
2. **Escalabilidade em listas extensas (`PERF-P1-01`–`PERF-P1-04`):** `GlobalSearchDialog` e `useProjectLibrary` mantêm leituras/parsing repetido ao `localStorage` a escalas sintéticas de ~200 projectos; mitigado parcialmente na sessão local com o limite máximo de `50` projectos criados localmente (`PROJECT_LIBRARY_LIMITS.MAX_LOCAL_PROJECTS`).
3. **Retenção residual de nós DOM/handles WebGL internos R3F entre saídas completas de rota:** Embora as trocas internas de modelo consumam `0` novos contextos WebGL e todos os `1 030` `WebGLBuffer` sejam libertados, montar e desmontar 10 vezes seguidas toda a rota `/model` mantém incremento residual nos contadores CDP (`540 → 9 369` nós / `40` texturas / `20` programas / `30` framebuffers).

### 5.5 Capturas Reais Recolhidas

- Pasta portátil E2E (`npm run test:e2e`): `test-results/e2e-screenshots/`
- Capturas do Quality Gate WebGL & Recuperação em Chromium (`1440px`, `768px`, `375px`): artefactos `f04_final_glb_1440.png`, `f04_final_gltf_1440.png`, `f04_final_context_lost_1440.png`, `f04_final_recovered_1440.png`, `f04_final_svg_rejected_1440.png`, `f04_final_tablet_768.png` e `f04_final_mobile_375.png`.
