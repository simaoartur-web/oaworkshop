# Plano 006 — Fase 03A · Project Foundation & Library Engine

- **Agente:** Agente A
- **Worktree exclusivo:** `oaworkspace-f03-platform`
- **Branch exclusiva:** `codex/f03-project-platform`
- **Commit base de referência:** `e580f3e79dc1ccb61defbcde3b672f8fff075fe4` (`codex/f02-integration-preview`)
- **Estado:** Concluído e verificado (aguarda entrega do Agente B para integração sequencial da Fase 03)

---

## 1. Âmbito Técnico (Agente A)

1. **Modelo Canónico & Fonte Única de Verdade (`src/data/projectLibraryTypes.ts`, `src/data/projectLibraryAdapter.ts`, `src/data/projectLibraryRepository.ts`):**
   - Estrutura canónica `CanonicalProjectRecord` separando identidade, conteúdo editorial PT/EN, classificação/departamento, autoria/equipa, estúdio (Maputo/Milão), ciclo de vida (`projectStatus`), marcos, estado de revisão, entregáveis, referências fictícias de ficheiros, histórico de revisões, `publicationStatus` independente (`'private'` obrigatório na criação) e metadados temporais.
   - Base inicial hidratada directamente a partir de `STUDIO_DESK_PROJECTS` (sem duplicar projectos base).
   - Persistência local em `localStorage` (`oa_workspace_project_library_v1`) apenas com metadados fictícios e validação defensiva/recuperação automática contra dados corrompidos.
   - Operações: listar, consultar por ID/código, criar (forçando `publicationStatus: 'private'`), actualizar metadados, arquivar/restaurar (sem implicar publicação), adicionar revisão, adicionar referência de ficheiro fictício e restaurar fixtures iniciais no reset global.
2. **Camada de Adaptação & Contrato com o Agente B (`src/features/project-library/projectExperienceContract.ts`):**
   - Conversão bidireccional entre `CanonicalProjectRecord` e `StudioDeskProject` (`toStudioDeskProject`).
   - Interfaces de slots (`Gallery`, `Dossier`, `Creation`) desacopladas por props e callbacks para encaixe dos componentes visuais do Agente B (`src/features/project-experience/**`) aquando da integração sequencial.
3. **Rotas & Catálogo Técnico Temporário (`src/app/App.tsx`, `src/features/project-library/**`, `PlannedModuleView.tsx`):**
   - `/workspace/projects` — catálogo técnico acessível (pesquisa por código/nome, filtros por departamento/estado/fase, ordenação, alternância Todos vs. Associados ao colaborador, estados vazios, lista técnica acessível, entrada para criação e dossier).
   - `/workspace/projects/new` — criação técnica validada PT/EN com privacidade `'private'` garantida.
   - `/workspace/projects/:id` — dossier operacional (consulta segura com fallback para ID inválido, edição de metadados, arquivo/restauro, adição de revisão técnica e referência de ficheiro fictício).
   - `/workspace/projects/:id/model` — mantida explicitamente como prancha futura da Fase 04 (`PlannedModuleView`).
4. **Integração Workspace (`shellNavigation.ts`, `globalSearchIndex.ts`, `WorkspaceSessionContext.tsx`):**
   - Módulo `Projectos` (`02`) promovido a disponível agora na navegação global.
   - Pesquisa global passa a indexar dinamicamente projectos seed e projectos criados/editados localmente na Biblioteca, mantendo compatibilidade com `?project=`.
   - Reset global do Workspace limpa também `oa_workspace_project_library_v1`.

---

## 2. Fronteira Estrita A vs. B

- **Não modificar nesta branch:** `src/features/project-experience/**`, `src/features/studio-desk/**`, `src/data/studioDeskFixtures.ts`, `src/data/studioDeskTypes.ts`, `src/test/studioDesk.test.tsx`.
- **Não tocar em:** `main`, website público `oa-workshop.com` ou branches SEO.

---

## 3. Verificações Executadas

- `npm run lint`: 0 erros, 0 avisos.
- `npm run test`: 6 ficheiros de teste, 52/52 testes passados (`projectLibrary.test.tsx`, `workspaceShell.test.tsx`, `integrationPreview.test.tsx`, `studioDesk.test.tsx`, `entryExperience.test.tsx`, `hardeningAndTime.test.tsx`).
- `npm run build`: compilação estrita `tsc -b && vite build` concluída sem erros.
- `npm run test:e2e`: validação visual e funcional E2E concluída em `1440px`, `680px`, `768px`, `720px` e `375px`, incluindo criação, persistência após reload, privacidade `private`, módulo 3D Fase 04, arquivo/filtro e 404 honesto.
