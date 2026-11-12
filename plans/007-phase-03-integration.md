# Plano 007 · Fase 03 — Integração A+B, Correcções P0/P1 e Quality Gate

- **Estado:** Concluído (em validação de Quality Gate)
- **Branch de preview:** `codex/f02-integration-preview`
- **Worktree exclusivo:** `oaworkspace-f02-preview`
- **Commit base:** `e580f3e79dc1ccb61defbcde3b672f8fff075fe4`
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
