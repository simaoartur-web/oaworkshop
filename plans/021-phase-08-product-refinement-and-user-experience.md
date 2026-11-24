# Plano 021 · Fase 08 — Product Refinement & User Experience

- **Estado:** **EM PLANEAMENTO (Fase 08.1)** *(aguarda aprovação expressa `APROVADO: plans/021-phase-08-product-refinement-and-user-experience.md` antes de iniciar a Fase 08.2; zero alterações em `src/` nesta etapa)*
- **Branch documental:** `codex/docs-f08-plan-021`
- **Base canónica preservada (`origin/codex/f02-integration-preview`):** `1abaa9d26bc10bc44a65584479d36781494c9e60` (`1abaa9d` — Versão Demonstrativa Fases 00–07 oficialmente encerrada)
- **Estado de `main` / Website Público (`oaworkshop`):** `e468fe7cb043844855c529477616f6e873c45190` *(100% intocado)*
- **Governança:** Model Governance v1.1 (`T0–T2`; hierarquia Opus → OpenAI GPT proprietário → Gemini não-Argon; **proibido Argon sem autorização expressa e Extra High**).
  - *Estado real de quotas verificado em `2026-11-24`:* `Claude Opus 5.5` a `0%` (reset `2026-11-26T18:55:38Z`); nenhum GPT proprietário listado (`gpt-oss-120b-medium` não é ChatGPT proprietário e está a `0%`); selecção autorizada de fallback Tier 3: **`Gemini 4 Neon (Medium)`** (`T1`/`T2`) e **`Gemini 4 Neon (Low)`** (`T0`), com reavaliação automática de Opus/GPT em missões futuras após reset de quota.

---

## 1. Contexto e Objectivo

A versão demonstrativa do **O+A Workspace** (`11/11` rotas operacionais, `1abaa9d`) foi apresentada à equipa da O+A e recebeu uma reação positiva. Preservando essa versão demonstrativa como **referência estável**, a **Fase 08** foca-se em **Product Refinement & User Experience**: eliminar fricção visual, léxico residual de fases antigas, fugas de identificadores técnicos (`ISO` / enums ingleses), clipping tipográfico e densidade excessiva — elevando a ergonomia quotidiana e a coerência do sistema de design O+A (`docs/DESIGN_SYSTEM.md`, `docs/DESIGN_BRIEF.md`, `ADR-001`..`ADR-010`) **sem** introduzir backend, novas dependências ou alterações em `main`.

> **Nota de rigor:** Todas as oportunidades listadas abaixo resultam exclusivamente de **inspecção visual e UX directa** sobre a aplicação em execução (`http://127.0.0.1:5173/`, `DIR-01`, `1440×900`, `PT`) e da análise do Design System e contratos canónicos. Nenhum feedback específico da equipa foi inventado.

---

## 2. Evidências Visuais e Achados Transversais (Inspecção `1abaa9d`)

1. **Ordenação e ruído no Rail lateral:** `11 Definições` surge em 3.º lugar (entre `02 Projectos` e `03 Tarefas`) em vez de encerrar a sequência (`10` → `11`); todos os `10` itens inactivos repetem o selo `Activa`, já sem função diferenciadora agora que `11/11` pranchas estão operacionais.
2. **Taxonomia incoerente de cabeçalhos:** Pranchas `03`–`07` exibem `FOLHA 03..07` enquanto `08`–`11` exibem `PRANCHA 08..11`; em `10 Relatórios`, a etiqueta `GUARDADO NESTE NAVEGADOR (DEMO)` quebra para segunda linha.
3. **Copy obsoleta de fases encerradas em overlays e dossiers:**
   - **Notificações:** ainda refere *"futuro arquivo Projectos (Fases 03-04)"*, *"Fase 05"* e *"Fase 06"* com botões `Ver Prancha Planeada` que quebram em 2 linhas;
   - **Pesquisa Global (`Ctrl+K`):** exibe tags antigas `Fase 02`/`Fases 02-03`, rotula resultados de projecto como `Abrir no Studio Desk` (embora abram `/workspace/projects/:id`), rotula o perfil já activo `DIR-01` como `Activar perfil`, e o botão `Pesquisar` no header não indica visualmente o atalho `Ctrl+K` / `⌘K`;
   - **Dossier de Projecto (Tab 1):** mantém texto antigo *"previstos apenas na Fase 04"*.
4. **Fuga de tokens técnicos na interface PT:** datas ISO cruas (`2026-11-10`, `(2026-11-12)`) e enums ingleses (`in_progress`, `completed`, `pending`, `REQUESTED`, `"mode: local-demo"`) surgem em `03 Tarefas`, `04 Calendário`, `09 Actividade` e `10 Relatórios`.
5. **Truncamento e desalinhamento de controlos:** placeholders de pesquisa cortados a meio da palavra em `03`, `06`, `08` e `09`; nomes dos 6 perfis cortados em `/login`; `COLABORADORES` cortado no limite do cartão em `05`; `CORREIO DEMO` quebrado a meio da palavra em `06`; KPI 5 desalinhado em `10`; alturas diferentes entre `<select>` e `<input>` e botão `LIMPAR FILTROS` com aspecto activo sem filtros em `09`.
6. **Hierarquia above-the-fold e redundâncias:** `/welcome` empurra o CTA principal abaixo dos `900px` e repete 3 botões com o mesmo destino; `01 Studio Desk` soma `3662px` e duplica `Modo Editorial | Lista Técnica`; `02 Projectos/new` coloca `Cancelar`/`Seguinte` abaixo da dobra; `08 Publicações` expande permanentemente o input `Nota editorial opcional` em todos os cartões; `09 Actividade` exibe `FILA EDITORIAL` em todas as linhas (incluindo tarefas e biblioteca); `11 Definições` mistura H1 com ponto final, checkbox simples e chaves cruas `oa_workspace_*_v1` acima da acção destrutiva de reset.

---

## 3. Matriz de Aprimoramentos por Módulo

| ID | Módulo / Área | Melhoria Concreta (Baseada em Evidência Directa) | Impacto | Esforço | Risco | Dependências | Missão |
|---|---|---|---|---|---|---|---|
| **R-01** | **Shell & Rail** | Reordenar `11 Definições` para o fim (`01`..`11`), remover selos `Activa` redundantes mantendo realce claro do item em foco, unificar eyebrow canónico `PRANCHA 01..11` / `PLATE 01..11`, adicionar pista `⌘K` / `Ctrl+K` em `Pesquisar` e eliminar botão de logout duplicado no topo | **Alto** | Baixo | Baixo | Atualizar teste de ordem/rótulos em `workspaceShell.test.tsx` | **08.2** |
| **R-02** | **Pesquisa Global & Notificações** | Remover copy obsoleta (`Fases 02–06`, `Ver Prancha Planeada`), apontar acções de notificações para as pranchas activas reais, corrigir rótulo de projecto (`Abrir dossier`), marcar perfil activo (`Activo`) em vez de `Activar perfil` e evitar quebra de 2 linhas nos botões do popover | **Alto** | Baixo | Baixo | `workspaceShell.test.tsx`, `integrationPreview.test.tsx` | **08.2** |
| **R-03** | **Entrada (`/login`, `/welcome`)** | Evitar truncamento dos 6 nomes/departamentos na grelha de `/login` (hierarquia 2 linhas limpa); em `/welcome`, compactar o caderno superior para manter `Entrar no Workspace` acima da dobra em `1440×900` e remover CTAs duplicados | **Alto** | Médio | Baixo | `entryExperience.test.tsx` | **08.2** |
| **R-04** | **Formatação & Higiene PT/EN (`03`, `04`, `09`, `10`)** | Substituir datas ISO cruas (`2026-11-10`) por formatação editorial localizada (`10 Nov 2026`), traduzir enums (`in_progress`, `REQUESTED`, `mode: local-demo`) em PT/EN e uniformizar etiqueta `(Demo)` nos autores de `09 Actividade` | **Alto** | Baixo | Baixo | Helper partilhado de formatação de datas (`Intl` em cache) | **08.3** |
| **R-05** | **Ergonomia de Filtros & Inputs (`03`, `06`, `08`, `09`)** | Alargar/ajustar inputs de pesquisa e textos de placeholder para eliminar truncamento a meio da palavra; igualar altura (`44px`) entre `<input>` e `<select>`; desactivar/atenuar `Limpar filtros` quando nenhum filtro está activo | **Médio** | Baixo | Baixo | Nenhuma | **08.3** |
| **R-06** | **01 · Studio Desk** | Eliminar o comutador duplicado `Modo Editorial | Lista Técnica`, reduzir redundância entre KPI strip e barra de acções rápidas, evitar truncamento de títulos prioritários e ajustar grelha de 4 projectos (ex.: `2×2` equilibrada em vez de `3+1` com 2 colunas vazias) para reduzir altura total | **Alto** | Médio | Médio | `studioDesk.test.tsx`, `integrationPreview.test.tsx` | **08.4** |
| **R-07** | **02 · Projectos (Catálogo, Dossier & Wizard)** | Deduplicar etiqueta disciplina/departamento nos cartões, esclarecer/ocultar `Por função (0)` quando sem correspondência directa, confirmar carregamento/fallback visual de miniaturas (`OA-26-119`, `OA-25-084`), remover duplicação de gatilhos 3D/`+ Adicionar` e texto obsoleto *"Fase 04"* no Dossier, corrigir breadcrumb e altura de Passo 1 em `/projects/new` para manter `Seguinte` acima dos `900px` | **Alto** | Médio | Médio | `projectLibrary*.test.tsx`, `e2e-verify-entry.mjs` | **08.4** |
| **R-08** | **03 · Tarefas & 04 · Calendário** | Em Tarefas, reservar botão terracota preenchido apenas para acção principal de criação/foco e usar acção secundária contida (`Concluir`) nas linhas/cartões para reduzir ruído visual; em Calendário, melhorar legibilidade de dias densos (`+N eventos`), compactar grelha mensal para caber em `1440×900`, mostrar contadores nos filtros e aproveitar largura útil na Agenda Cronológica | **Médio** | Médio | Baixo | **R-04**, `operationsExperience.test.tsx` | **08.4** |
| **R-09** | **05 · Departamentos, 06 · Equipa & 07 · Biblioteca** | Corrigir clipping de `COLABORADORES` em `05` e quebra de `CORREIO DEMO` em `06`; compactar sub-painéis vazios em `05` e alinhar CTA principal com operação departamental; em `07`, mover o formulário de registo para diálogo/trigger no topo (ou atalho imediato) para evitar longo scroll por baixo de 9 cartões | **Médio** | Médio | Baixo | **R-05**, `studioStructureExperience.test.tsx` | **08.5** |
| **R-10** | **08 · Publicações, 09 · Actividade & 10 · Relatórios** | Em `08`, colapsar `Nota editorial opcional` sob expansão contextual por cartão (reduzindo altura total); em `09`, mostrar `Fila editorial` apenas em eventos do domínio `publications` e melhorar agrupamento/resumo temporal; em `10`, alinhar rótulo/altura do KPI 5, clarificar `Activos` vs `Concluídos` e alinhar o link de `Síntese por Base` para `/workspace/projects` | **Alto** | Médio | Baixo | **R-04**, **R-05**, `editorialControlExperience.test.tsx` | **08.5** |
| **R-11** | **11 · Definições** | Padronizar H1 editorial sem ponto final, substituir checkbox isolado por toggle/switch consistente com os controlos irmãos, reduzir redundância com `PT | EN` do cabeçalho e recolher chaves técnicas `oa_workspace_*_v1` num bloco colapsável `<details>` («Diagnóstico técnico local») separado da acção destrutiva de reset | **Médio** | Baixo | Baixo | `workspaceShell.test.tsx` | **08.5** |

---

## 4. Organização Incremental da Fase 08 (Missões)

| Missão | Foco | Itens | Agentes / Classe | Critério de Saída |
|---|---|---|---|---|
| **Fase 08.2** | **Shell, Navegação, Overlays & Entrada** | `R-01`, `R-02`, `R-03` | `@agent-b` (`T2`), `@agent-d` (`T1`) | Rail `01`..`11` ordenado, `0` copy obsoleta F02–F06, `PRANCHA` unificada, `/login` sem truncamento, `/welcome` CTA above-the-fold, CI + E2E verdes |
| **Fase 08.3** | **Higiene de Dados/Datas PT/EN & Ergonomia de Filtros** | `R-04`, `R-05` | `@agent-a` (`T1` helper datas/labels), `@agent-b` (`T1` inputs/filtros), `@agent-d` (`T1`) | `0` datas ISO cruas ou enums ingleses em UI PT, `0` placeholders truncados, alturas de filtros uniformes (`44px`), CI + E2E verdes |
| **Fase 08.4** | **Refinamento de Produtividade: Núcleo Operacional (`01`–`04`)** | `R-06`, `R-07`, `R-08` | `@agent-b` (`T2`), `@agent-d` (`T1`) | Studio Desk compacto sem duplicação de switchers, Wizard/Dossier limpos, Tarefas/Calendário com densidade calibrada, CI + E2E verdes |
| **Fase 08.5** | **Refinamento Editorial & Estrutural (`05`–`11`) + Fecho Fase 08** | `R-09`, `R-10`, `R-11` | `@agent-b` (`T2`), `@agent-d` (`T1`) | `0` clipping (`05`/`06`/`10`), `08` Publicações compacto, `09` Actividade sem CTAs fora de domínio, `11` Definições padronizado, Quality Gate + E2E `11/11` 100% PASS |

---

## 5. Critérios Globais de Aceitação da Fase 08

1. **Preservação absoluta da base demonstrativa:** `11/11` rotas operacionais, `6/6` perfis demonstrativos, `PT/EN`, `resetAllDemoData()` e `0` regressões funcionais.
2. **Aderência estrita ao Design System O+A:** tokens de `docs/DESIGN_SYSTEM.md`, raio `0–2px`, alvos ≥ `44px`, contraste WCAG 2.2 AA e `prefers-reduced-motion`.
3. **Budget de performance intacto:** `0 B` de `vendor-three`, `vendor-r3f` e `vendor-motion` em `dist/index.html`; `0` leituras de `localStorage` por tecla na Pesquisa Global; `0` novas dependências em `package.json`.
4. **Quality Gate obrigatório em cada missão:** `npm run lint`, `npm run build`, chunk check, Vitest (`100%` PASS), `npm audit --omit=dev --audit-level=high` (`0`), `npm run test:e2e` (`11/11` áreas + `375/768/1440`) e PR aprovado pelo utilizador para `codex/f02-integration-preview`.
5. **Isolamento absoluto:** `main` (`e468fe7`) e website público `oaworkshop` 100% intocados; zero backend ou integrações externas.

---

> **Próxima acção necessária:** Aprovação expressa do responsável humano (`APROVADO: plans/021-phase-08-product-refinement-and-user-experience.md`) antes de iniciar a **Fase 08.2**.
