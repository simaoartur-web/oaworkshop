# Plano 008 — Fase 04A · Model Engine, File Contracts & Workspace Integration

- **Agente:** Agente A
- **Worktree exclusivo:** `oaworkspace-f04a-engine`
- **Branch exclusiva:** `codex/f04-model-engine`
- **Commit base de referência:** `b91b056ddcb278234e2378f595bc4255f3ee77d0` (`codex/f02-integration-preview`)
- **Estado:** Concluído e verificado (aguarda entrega do Agente B para integração sequencial da Fase 04)

---

## 1. Objectivo e Âmbito (Agente A)

Construir a infraestrutura de domínio, validação de ficheiros 3D, gestão segura de `ObjectURL` em sessão, contrato de integração com o Agente B e activação da rota `/workspace/projects/:id/model` ligada à Biblioteca de Projectos da Fase 03, sem reconstruir o visualizador gráfico WebGL (`src/features/model-viewer/**`) nem modificar `public/assets/models/**` ou `package.json`.

### 1.1 Distinção obrigatória de 3 categorias (`src/data/modelAssetTypes.ts`, `src/data/modelAssetRepository.ts`)
1. **A. Referência documental (`document-reference`)**:
   - Registo de ficheiro no dossier (`ProjectFileReference`, ex.: `edificio.skp`, `maquete.glb`, `corte.pdf`) composto exclusivamente por metadados.
   - Nunca implica existência de binário carregável no navegador.
   - Distingue explicitamente:
     - **`.skp` nativo SketchUp (`source_skp`)**: referência documental de autoria, sem carregamento directo em WebGL e sem conversor automático ou simulado.
     - **`.glb` / `.gltf` apenas referenciado**: metadado registado no dossier sem ficheiro binário disponível na sessão, assinalado como `metadata-only`.
2. **B. Modelo demonstrativo disponível (`demo-asset`)**:
   - Estudo 3D fictício (`.glb` ou `.gltf` completo com recursos incorporados/resolvidos) associado a um projecto demonstrativo do atelier.
   - Inclui obrigatoriamente aviso explícito de honestidade (`isFictiveStudy: true`), esclarecendo que se trata de um **estudo fictício demonstrativo** e não da representação autêntica da obra.
   - Inclui pelo menos um exemplo `.gltf` 2.0 completo e autónomo no catálogo demonstrativo (geometria volumétrica com buffer base64 incorporado e manifesto validável).
3. **C. Modelo selecionado na sessão (`session-file`)**:
   - Ficheiro local `.glb` ou `.gltf` autónomo escolhido pelo utilizador no dispositivo durante a sessão actual (`URL.createObjectURL`).
   - Temporário em memória: **nunca** persiste `blob:`, `File`, `ArrayBuffer` ou binários em `localStorage`.
   - Liberta automaticamente `URL.revokeObjectURL` ao substituir ficheiro, ao limpar selecção, ao desmontar/encerrar ou durante o reset global da demonstração.

### 1.2 Formatos e Validação Estrita
- Limite máximo documentado: **50 MB** (`52_428_800` bytes, `MAX_MODEL_FILE_SIZE_BYTES`), rejeitando ficheiros acima do limite com mensagem legível PT/EN.
- Rejeição de ficheiros vazios (`0 bytes`).
- Rejeição explícita de `.skp` para pré-visualização WebGL directa (orientando para exportação prévia `.glb`/`.gltf` sem prometer conversão automática).
- Rejeição de extensões não suportadas (`.pdf`, `.dwg`, `.obj`, `.fbx`, `.ifc`, `.zip`, etc.).
- Validação binária de cabeçalho `.glb` (magic ASCII `glTF` `0x46546C67`, versão `2`, comprimento coerente).
- Validação estrutural de manifesto `.gltf` (`asset.version` 2.x, presença de cena/malha/nós e verificação de `buffers`/`images`: aceita recursos `data:` incorporados ou resolvidos com segurança; rejeita pacotes `.gltf` locais incompletos que dependam de `.bin` ou texturas externas não fornecidas).

### 1.3 Integração com a Fase 03 e Rota `/workspace/projects/:id/model`
- Rota `/workspace/projects/:id/model` carregada por *lazy loading* (`React.lazy`) em `src/app/App.tsx` para não sobrecarregar o bundle inicial de `/login`, `/welcome` ou `/workspace`.
- Validação do `:id` do projecto com estado 404 honesto para IDs inexistentes.
- Preservação do estado privado (`publicationStatus: 'private'`) e tratamento de projectos arquivados sem eliminar referências documentais ou modelos associados.
- Ligação clara entre a secção Documentação do `ProjectDossierShellPage` e `/workspace/projects/:id/model`, distinguindo `.skp` documental, `.glb` apenas referenciado, modelo demonstrativo fictício e modelo seleccionado na sessão.

### 1.4 Contrato com o Agente B (`docs/PHASE_04_MODEL_ENGINE_CONTRACT.md` & `src/features/model-engine/modelViewerContract.ts`)
- Definição formal de `ModelSource`, `ModelContext`, `ModelLoadState` (`'idle' | 'loading' | 'ready' | 'error'`) e callbacks (`onModelLoaded`, `onModelError`, `onBackToDossier`, `onSelectLocalFile`, `onClearLocalFile`, `onSelectDemoAsset`).

---

## 2. Fronteiras Estritas de Ficheiros

- **Permitido modificar/criar:**
  - `src/data/modelAssetTypes.ts`, `src/data/modelAssetRepository.ts`
  - `src/features/model-engine/**`
  - `src/app/App.tsx`
  - `src/features/project-library/ProjectDossierShellPage.tsx` e adaptadores em `src/features/project-library/projectExperienceContract.ts` / `src/features/project-library/i18n.ts`
  - `src/test/modelEngine.test.tsx`, `src/test/projectLibrary.test.tsx`, `scripts/e2e-verify-entry.mjs`
  - `docs/PHASE_04_MODEL_ENGINE_CONTRACT.md`, `docs/PRODUCT_SPEC.md`, `docs/DECISIONS.md`, `PROJECT_MAP.md`, `plans/008-phase-04a-model-engine.md`
- **Proibido modificar:**
  - `src/features/model-viewer/**`
  - `public/assets/models/**`
  - `package.json` e `package-lock.json`
  - `main`, branches SEO ou website público `oaworkshop`.

---

## 3. Verificações Executadas

- `npm run lint`: **0 erros, 0 avisos** (`eslint .`).
- `npm run test`: **8 ficheiros de teste / 66 testes aprovados** (`modelEngine.test.tsx`, `projectLibrary.test.tsx`, `projectExperience.test.tsx`, `studioDesk.test.tsx`, `workspaceShell.test.tsx`, `integrationPreview.test.tsx`, `entryExperience.test.tsx`, `hardeningAndTime.test.tsx`).
- `npm run build`: **sucesso** (`tsc -b && vite build`), com `ProjectModelEnginePage` separado em chunk autónomo por *lazy loading* (`dist/assets/ProjectModelEnginePage-CqVwwIUV.js`, `26.43 kB` / `5.66 kB` gzip).
- `npm run test:e2e`: **sucesso** em Playwright Chromium (`OA_E2E_PORT=4192`), validando a rota `/workspace/projects/:id/model` e o regresso ao Dossier sem overflow horizontal (`1440px`, `768px`, `375px` e `720px`).

