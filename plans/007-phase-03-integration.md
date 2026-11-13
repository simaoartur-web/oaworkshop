# Plano 007 · Fase 03 — Integração A+B, Correcções P0/P1 e Quality Gate

- **Estado:** Concluído e validado (Quality Gate Final aprovado)
- **Branch de preview:** `codex/f02-integration-preview`
- **Worktree exclusivo:** `oaworkspace-f02-preview`
- **Commit base:** `e580f3e79dc1ccb61defbcde3b672f8fff075fe4`
- **Commit de integração validado:** `506f9203cb0dab21d4a24286e268887766125934`
- **Branches integradas (`--no-ff`):**
  - Agente A (`codex/f03-project-platform`): `9d71e36e43d927e1a4c33a26157970698746fc2e`
  - Agente B (`codex/f03-project-experience`): `d45fb73ae04cd55f884338735da704249874fd35`

## Âmbito integrado

1. Ligação das experiências editoriais do Agente B (`ProjectGalleryView`, `ProjectDossierView`, `ProjectCreationWizard`) ao motor canónico do Agente A (`useProjectLibrary`, `projectLibraryRepository`, adaptadores explícitos em `projectExperienceContract.ts`) nas rotas `/workspace/projects`, `/workspace/projects/new` e `/workspace/projects/:id`, mantendo `/workspace/projects/:id/model` como prancha honesta da Fase 04.
2. Eliminação de interfaces provisórias duplicadas (`TechnicalCatalogView.tsx`) e remoção de estado documental paralelo (`localExtraDocs` ignorado quando `documents` canónico está presente).
3. Correcções obrigatórias P0/P1:
   - Fonte única canónica em `oa_workspace_project_library_v1` para projectos, documentos e revisões.
   - Propagação real de falhas de persistência em `saveEnvelope()` sem falsos sucessos no wizard ou dossier e preservação integral do rascunho.
   - Códigos únicos gerados a partir de `OA-26-125` sem colisões e validação explícita contra códigos duplicados.
   - Datas dinâmicas reais (`getTodayIsoDate`, `getOffsetIsoDate(14)`) e validação estrita de calendário (`isValidIsoCalendarDate`).
   - Separação rigorosa entre atribuição individual (`leadUserId`/`contributorUserIds`) em «Os meus projectos» e correspondência apenas por função (`assignedRoles`).
   - Continuidade pós-criação («Abrir dossier do projecto», «Voltar aos projectos», «Criar outro») com recarregamento seguro por URL.

## Validação Final e Quality Gate

Validação executada no worktree exclusivo `oaworkspace-f02-preview` (`codex/f02-integration-preview`, sobre o commit de integração `506f9203cb0dab21d4a24286e268887766125934`):

- `npm run lint`: **0 erros** (`eslint .`).
- `npm run test`: **7 ficheiros de teste / 61 testes aprovados** (sem falhas ou testes ignorados):
  - `src/test/hardeningAndTime.test.tsx` (4)
  - `src/test/integrationPreview.test.tsx` (7)
  - `src/test/entryExperience.test.tsx` (9)
  - `src/test/projectExperience.test.tsx` (6)
  - `src/test/workspaceShell.test.tsx` (8)
  - `src/test/studioDesk.test.tsx` (17)
  - `src/test/projectLibrary.test.tsx` (10)
- `npm run build`: **sucesso** (`tsc -b && vite build`), emitindo `dist/index.html`, `dist/assets/index-BqJR3YWo.css` (`59.25 kB`) e `dist/assets/index-D-jY1y0Z.js` (`810.54 kB`).
- `npm run test:e2e`: **sucesso** via Playwright Chromium (`scripts/e2e-verify-entry.mjs`, porta dedicada `OA_E2E_PORT=4191`):
  - Fluxo completo validado em browser real: Login → Welcome/Workspace → `/workspace/projects` → alternância Galeria ↔ Lista Técnica → alternância PT/EN → criação nos 4 passos (`Pavilhão E2E Maputo`, `OA-26-125`) → «Abrir dossier do projecto» → edição de metadados (`Projecto de Execução`), registo de revisão (`Revisão E2E persistente v02.`) e referência documental (`e2e-planta-terreo.pdf`) → reload integral da página e confirmação da persistência nas abas → prancha honesta Fase 04 `/model` → arquivar, filtrar por `Arquivado` e restaurar para `Em curso` → Pesquisa Global (`Ctrl+K`) para o novo projecto e navegação Back/Forward → rota inexistente 404 segura → validação responsiva e scroll independente (`1440px`, `768px`, `375px` e `720px` zoom), além dos 6 perfis demonstrativos e comutação PT/EN cobertos em `projectLibrary.test.tsx`.

## Ajustes efectuados durante o Quality Gate

Não foram detectados defeitos funcionais no código da aplicação durante os ensaios finais. As únicas alterações introduzidas nesta etapa incidiram sobre cobertura automatizada e documentação do Quality Gate:

- `src/test/projectLibrary.test.tsx`: adicionados os testes integrais de restauro pós-arquivo, pesquisa global e cobertura transversal aos 6 perfis demonstrativos em PT/EN; alinhado o selector da Pesquisa Global (`role="combobox"` e `aria-label` real) e ajustado para `45_000 ms` o timeout do teste longo de fluxo integral sob execução paralela.
- `scripts/e2e-verify-entry.mjs`: ampliado o percurso E2E para cobrir Lista Técnica, PT/EN, edição + revisão + documentação pós-reload (incluindo verificação explícita da aba `Desenvolvimento` para a fase actualizada), restauro de arquivo, Pesquisa Global para dossiers locais e navegação Back/Forward.

## Limitações assumidas

- Persistência exclusivamente local no navegador (`localStorage`), sem sincronização externa ou back-end nesta fase.
- Ficheiros `.skp`, `.glb`, plantas e cadernos permanecem referências tipadas locais (sem upload binário real); a rota `/workspace/projects/:id/model` mantém-se uma prancha honesta reservada para a Fase 04.
- `vite build` assinala aviso de tamanho de bundle único (`dist/assets/index-D-jY1y0Z.js` > 500 kB), sem impacto funcional na demonstração actual e passível de code-splitting em fase futura.
