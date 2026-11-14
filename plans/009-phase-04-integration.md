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
