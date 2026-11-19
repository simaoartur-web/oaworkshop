# Relatório de Entrega — `0451-DATA-01` (`@agent-a`)

- **Identificador da tarefa:** `0451-DATA-01`
- **Agente:** `@agent-a` (Data & Architecture Engineer)
- **Fase / Ciclo:** Fase 04.5.1 · Onda 1 (Pacote Recomendado — `APROVADO: plans/015-phase-0451-closure.md`)
- **Branch de trabalho:** `codex/f0451-task-agent-a`
- **Commit base:** `290da337ce4c54d385a5cde30db05c5fbbc88419` (Onda 0 sobre `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5`)
- **Estado:** `PASSED`

---

## 1. Objectivo e Âmbito

Implementar na Onda 1 da Fase 04.5.1 as duas correcções P1 sob propriedade exclusiva de `@agent-a`:

1. **`F0451-P1-5` (`src/data/projectLibraryRepository.ts`):** Enforçar `assertWithinMaxLength(..., PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH)` sobre `scale`, `areaSqm` e `elevationDatum` em `createProject` e `updateProjectMetadata`, bem como sobre `discipline` (`pt` e `en`) em `updateProjectMetadata`, mantendo validação coerente em `validateCanonicalRecord` sem corromper o cache ou o `localStorage`.
2. **`F0451-P1-7` (`src/app/WorkspaceSessionContext.tsx`):** Remover os 4 imports estáticos pesados (`modelAssetRepository`, `projectLibraryRepository`, `studioDeskFixtures`, `shellDemoState`) do bundle inicial `index-*.js`, preservando limpeza determinística de `localStorage`, caches em memória e revogação de `ObjectURL`s em `signOut()` e `resetAllDemoData()`.

**Fronteiras respeitadas:** zero alterações em `PROJECT_MAP.md`, `package.json`, `src/test/setup.ts`, ficheiros UI, `main` ou repositório público `oaworkshop`.

---

## 2. Ficheiros Modificados

- `src/data/projectLibraryRepository.ts`
- `src/app/WorkspaceSessionContext.tsx`
- `src/test/projectLibrarySecurity.test.tsx`
- `src/test/projectLibraryConsistency.test.tsx`
- `docs/agent-reports/phase-0451/0451-DATA-01-agent-a.md` *(este relatório)*

---

## 3. Trabalho Executado

### 3.1 `F0451-P1-5` — Limites de Comprimento em Campos Curtos de Classificação (`src/data/projectLibraryRepository.ts`)
- **`createProject`:** Aplicado `assertWithinMaxLength(..., PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH)` (`120` caracteres) a `input.scale` (`Escala de estudo`), `input.areaSqm` (`Área aproximada`) e `input.elevationDatum` (`Cota de referência`) antes da criação e persistência do registo.
- **`updateProjectMetadata`:** Aplicado `assertWithinMaxLength(..., PROJECT_LIBRARY_LIMITS.MAX_SHORT_FIELD_LENGTH)` a `patch.discipline.pt`, `patch.discipline.en`, `patch.scale`, `patch.areaSqm` e `patch.elevationDatum` antes da persistência; qualquer violação lança erro explícito sem alterar `cachedSnapshot` nem `localStorage`.
- **`validateCanonicalRecord`:** Verificação consistente do limite `MAX_SHORT_FIELD_LENGTH` para `classification.discipline.{pt,en}`, `classification.scale`, `classification.areaSqm` e `classification.elevationDatum`, descartando registos adulterados acima do limite no carregamento a partir de `localStorage` e normalizando `trim()`.

### 3.2 `F0451-P1-7` — Desacoplamento de Imports Estáticos no Entry (`src/app/WorkspaceSessionContext.tsx`)
- Removidos os 4 imports estáticos pesados de `modelAssetRepository`, `projectLibraryRepository`, `studioDeskFixtures` e `shellDemoState`.
- **`resetAllDemoData()`:** Executa `resetDemoWorkspaceState()`, remove sincronamente as 4 chaves auxiliares em `localStorage` (`oa_workspace_demo_notifications_v1`, `oa_workspace_shell_rail_v1`, `oa_workspace_studio_desk_v1`, `oa_workspace_project_library_v1`) e dispara sincronamente `CustomEvent('oa:project-library-updated')` — invalidando de imediato os caches de `projectLibraryRepository` e `globalSearchIndex` (se carregados) e accionando o listener de `modelAssetRepository` (que verifica `oa_workspace_project_library_v1 === null` e revoga/limpa todos os `ObjectURL`s de sessão).
- **`signOut()`:** Executa `clearDemoSession()` + `setSession(null)` e invoca `import('../data/modelAssetRepository').then(({ clearAllSessionModels }) => clearAllSessionModels())` (com `.catch` defensivo), garantindo revogação de `ObjectURL`s e limpeza de `sessionModelsByProjectId` mesmo quando existem projectos locais persistidos em `oa_workspace_project_library_v1` (preservando os projectos locais entre sessões).

### 3.3 Testes Adicionados
- `src/test/projectLibrarySecurity.test.tsx`: novo teste `F0451-P1-5` validando rejeição acima de `MAX_SHORT_FIELD_LENGTH` em `createProject` (`scale`, `areaSqm`, `elevationDatum`), `updateProjectMetadata` (`scale`, `areaSqm`, `elevationDatum`, `discipline.pt`, `discipline.en`), aceitação no limite exacto (`120`), integridade intacta de `getProjectLibrarySnapshot().version` e descarte de registo adulterado em `localStorage`.
- `src/test/projectLibraryConsistency.test.tsx`: novo teste `F0451-P1-7` validando `signOut()` desacoplado com projectos locais presentes no `localStorage` (revoga `ObjectURL` e limpa `sessionModelsByProjectId` sem apagar projectos locais) e `resetAllDemoData()` completo (limpa todas as chaves `localStorage`, invalida cache da biblioteca + pesquisa global e revoga `ObjectURL`s).

---

## 4. Testes Realizados e Resultados Reais

| Verificação | Comando | Resultado | Evidência |
|---|---|---|---|
| **Lint** | `npm run lint` | **PASS** | `0` erros, `0` avisos (`eslint .`) |
| **Build & Bundle** | `npm run build` (`tsc -b && vite build`) | **PASS** | `2 787` módulos, `0` erros, `0` ciclos, construído em `13.01s` |
| **Vitest (obrigatório)** | `npx vitest run src/test/projectLibrarySecurity.test.tsx src/test/projectLibraryConsistency.test.tsx src/test/entryExperience.test.tsx src/test/modelEngineSecurity.test.tsx` | **PASS** | `4/4` ficheiros · **`26/26` testes** em `21.76s` (`modelEngineSecurity`: `5/5`, `projectLibrarySecurity`: `4/4`, `projectLibraryConsistency`: `8/8`, `entryExperience`: `9/9`) |
| **Vitest (extra integração)** | `npx vitest run src/test/integrationPreview.test.tsx` | **PASS** | `1/1` ficheiro · **`7/7` testes** em `15.38s` |

### Delta Medido no Bundle Inicial (`dist/assets/` e `dist/index.html`)

| Artefacto | Base (`4197c2e`) | Após `F0451-P1-7` | Delta |
|---|---:|---:|---:|
| **`index-*.js` (entry app)** | `160.11 kB` raw (`47.30 KiB` gzip) | **`73.73 kB` raw (`23.75 kB` gzip)** | **`-86.38 kB` (`-53.95%` raw)** |
| **Entry total em `/login` (`index` + `vendor-react` + `vendor-router` + `vendor-icons`)** | `438.22 kB` (`427.94 KiB` raw) | **`351.84 kB` (`343.59 KiB` raw)** | **`-86.38 kB` (`-19.71%` raw)** |
| **Chunks extraídos do entry** | Embutidos em `index-*.js` | `projectLibraryRepository-*.js` (`62.70 kB`) + `modelAssetRepository-*.js` (`21.56 kB`) sob procura | `0 B` transferidos em `/login` e `/welcome` |
| **`dist/index.html` `modulepreload`** | `vendor-react`, `vendor-icons`, `vendor-router` | `vendor-react`, `vendor-icons`, `vendor-router` | **`0 B`** de `three`, `r3f`, `motion`, `projectLibraryRepository` ou `modelAssetRepository` |

---

## 5. Problemas `P0` / `P1` / `P2`

- **P0:** Nenhum.
- **P1:** Nenhum remanescente no âmbito de `0451-DATA-01` (`F0451-P1-5` e `F0451-P1-7` resolvidos e verificados).
- **P2 (fora do âmbito autorizado desta onda, registados para backlog futuro):**
  - Quando um utilizador nunca visitou rotas 3D e faz `signOut()`, o `import('../data/modelAssetRepository')` dispara um pedido lazy de `21.56 kB` (`7.49 kB` gzip) apenas no momento do logout (zero impacto em `/login`, `/welcome` ou navegação normal). Numa ronda futura, caso `modelAssetRepository.ts` possa receber um listener de `CustomEvent('oa:session-signed-out')`, esse fetch de logout pode ser reduzido para `0 B`.

---

## 6. Limitações e Pendências

- Sem bloqueios ou pendências para a Onda 2 (pré-integração) e Onda 3 (Quality Gate dirigido por `@agent-c` e `@agent-d`).
- O trabalho permanece isolado na branch `codex/f0451-task-agent-a` à espera de revisão e integração pelo coordenador.

---

## 7. Recomendações

- Integrar `codex/f0451-task-agent-a` com `codex/f0451-task-agent-b` na branch candidata `codex/f0451-integration-candidate` (Onda 2) e validar na Onda 3 com `@agent-c` (delta empírico de `/login` e `/welcome`) e `@agent-d` (bateria oficial completa).
