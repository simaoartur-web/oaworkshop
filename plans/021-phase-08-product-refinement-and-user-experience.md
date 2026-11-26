# Plano 021 · Fase 08 — Product Refinement & User Experience

- **Estado:** **FASE 08.2 CONCLUÍDA (`PR #4` · `af9d596`, candidato `01675b8`) · FASE 08.3 EM EXECUÇÃO** *(aprovação inicial `37daad0` em `2026-11-25 11:27+02:00`; autorização de merge da Fase 08.2 e arranque da Fase 08.3 em `2026-11-26 19:06+02:00`)*
- **Branch documental:** `codex/docs-f08-plan-021`
- **Base canónica preservada (`origin/codex/f02-integration-preview`):** `1abaa9d26bc10bc44a65584479d36781494c9e60` (`1abaa9d` — Versão Demonstrativa Fases 00–07 oficialmente encerrada)
- **Estado de `main` / Website Público (`oaworkshop`):** `e468fe7cb043844855c529477616f6e873c45190` *(100% intocado)*
- **Governança:** Model Governance v1.1 (`T0–T2`; hierarquia Opus → OpenAI GPT proprietário → Gemini não-Argon; **proibido Argon sem autorização expressa e Extra High**).
  - *Estado real de quotas verificado:* `Claude Opus 5.5` a `0%` (reset `2026-11-26T18:55:38Z`); nenhum GPT proprietário listado (`gpt-oss-120b-medium` não é ChatGPT proprietário e está a `0%`); fallback Tier 3 autorizado: **`Gemini 4 Neon (Medium)`** (`T1`/`T2`) e **`Gemini 4 Neon (Low)`** (`T0`), com prioridade automática para Opus/GPT caso fiquem disponíveis antes de cada missão.

---

## 1. Contexto e Objectivo

A versão demonstrativa do **O+A Workspace** (`11/11` rotas operacionais, `1abaa9d`) foi apresentada à equipa da O+A e recebeu uma reação positiva. Preservando essa versão demonstrativa como **referência estável**, a **Fase 08** foca-se em **Product Refinement & User Experience**: consolidar o Design System O+A, eliminar fricção visual, léxico residual de fases antigas, fugas de tokens técnicos (`ISO`/enums/`Milão` em EN), optimizar o visualizador 3D, tornar a Biblioteca Técnica mais visual e organizada, e elevar a ergonomia mobile/tablet (`375px`/`768px`) com onboarding interactivo opcional — **sem** backend, novas dependências ou alterações em `main`.

> **Nota de rigor:** Todas as oportunidades abaixo resultam exclusivamente de **inspecções visuais e UX directas** em `http://127.0.0.1:5173/` (`1abaa9d`) nos viewports **`1440×900`**, **`768×1024`** e **`375×812`**, em **PT e EN**, nos perfis representativos **`DIR-01`**, **`ARQ-02`** e **`COM-05`**, cruzadas com `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_BRIEF.md` e `ADR-001`..`ADR-010`. Nenhum feedback específico da equipa foi inventado.

---

## 2. Evidências Visuais Directas (`1440px`, `768px`, `375px` · `PT/EN` · `DIR-01`, `ARQ-02`, `COM-05`)

### 2.1 Inspecção Desktop (`1440×900`, `DIR-01`, `PT`)
1. **Shell & Rail:** `11 Definições` aparece em 3.º lugar (entre `02` e `03`) em vez de no fim (`10` → `11`); `10×` selos `Activa` repetem ruído visual; inconsistência `FOLHA 03..07` vs `PRANCHA 08..11`; `Pesquisar` sem pista `Ctrl+K`/`⌘K`; botão de logout duplicado no topo; badge `GUARDADO NESTE NAVEGADOR (DEMO)` quebra para segunda linha em `10 Relatórios`.
2. **Copy obsoleta de fases encerradas:** Notificações ainda citam *"futuro arquivo Projectos (Fases 03-04)"*, *"Fase 05"* e *"Fase 06"* com `Ver Prancha Planeada`; Pesquisa Global mostra `Fase 02`/`Fases 02-03`, `Abrir no Studio Desk` para links de dossier e `Activar perfil` no perfil já activo; Dossier Tab 1 mantém *"previstos apenas na Fase 04"*.
3. **Tokens técnicos e truncamento:** datas ISO cruas (`2026-11-10`, `(2026-11-12)`) e enums ingleses (`in_progress`, `REQUESTED`, `mode: local-demo`) na UI PT (`03`, `04`, `09`, `10`); placeholders cortados em `03`/`06`/`08`/`09`; clipping de `COLABORADORES` (`05`), quebra de `CORREIO DEMO` (`06`), desalinhamento do KPI 5 (`10`), alturas diferentes entre `<select>` e `<input>` (`09`).
4. **Densidade & above-the-fold:** `/login` trunca os 6 nomes; `/welcome` coloca `Entrar no Workspace` abaixo dos `900px` e repete 3 CTAs idênticos; `01 Studio Desk` soma `3662px` e duplica `Modo Editorial | Lista Técnica`; `/projects/new` Passo 1 empurra `Seguinte` abaixo da dobra; `08 Publicações` expande `Nota editorial opcional` em todos os cartões; `09 Actividade` mostra `FILA EDITORIAL` em linhas não-editoriais; `11 Definições` mistura H1 com ponto final, checkbox isolado e chaves cruas `oa_workspace_*_v1` acima do reset.

### 2.2 Inspecção Dirigida Mobile (`375×812`) & Tablet (`768×1024`) · `PT/EN` · `DIR-01`, `ARQ-02`, `COM-05`
1. **Overflow em `/login` (`375px`):** `body` expande para **`643.33px`** dentro do viewport de `375px` (linha de relógios, abas de prancha e cartões de perfil forçam scroll horizontal). Em `768px`, `/login` ajusta-se (`762px`).
2. **Fugas de tradução em `EN` (`ARQ-02`, `COM-05`, `DIR-01`):** `Milão` permanece por traduzir em EN em `/login`, `/welcome` (`Editorial base: Milão`), `01 Studio Desk` (`ARQ-02 / ARCHITECTURE · ARCHITECTURE · Milão`), `08 Publicações`, `10 Relatórios` e ecrã de carregamento; `/model` exibe `(Estudo Demo)` em EN.
3. **`01 Studio Desk` (`768px` e perfis):** Eyebrow indica `SHEET 02` em vez de `01`; badges `PLANNED` ainda listam `3D VIEWER (.GLB) · PHASE 04` e `PUBLISHING · PHASE 06`; em `768px` (`COM-05`), `NEXT PRIORITY` e `PROJECT NEEDING ATTENTION` truncam com reticências e quebram em 3 linhas.
4. **Motor 3D (`/workspace/projects/:id/model` em `375px` e `768px`):**
   - Links de retorno duplicados no cabeçalho (`Voltar ao Dossier` / `Voltar aos Projectos` repetidos no painel interno);
   - Barra de controlos empilha-se até **`518px` de altura** em `375px` e **`272px` (`5` linhas)** em `768px` acima do palco 3D;
   - `<canvas>` renderizado mediu `262.7×338.7px` dentro de contentor `608.7×420px` em `768px`, e o painel lateral `aside` empilha `1260px` (`375px`) / `991px` (`768px`) abaixo do palco.
5. **Ergonomia Mobile/Tablet (`03`, `05`, `07`, `10`):**
   - `03 Tarefas`: quadro empilhado verticalmente atinge `4603px` (`375px`) e `3730px` (`768px`); `IN PROGRESS` quebra em 2 linhas no KPI `375px`.
   - `05 Departamentos`: as 9 linhas da lista empilham-se acima do detalhe mesmo em `768px`, empurrando a ficha seleccionada abaixo da dobra.
   - `07 Biblioteca` & `10 Relatórios`: middot órfão (`·`) antes do badge demo em `375px`; em `07` (`768px`), pills de categoria quebram em 2–3 linhas e placeholder corta; em `10` (`375px`), tabela de 6 colunas ocupa `525.6px` dentro de `369.3px`.

---

## 3. Matriz Completa de Aprimoramentos por Módulo (`R-01`..`R-15`)

*(Todos os itens `R-01`..`R-11` originais preservados integralmente; adicionados `R-12`..`R-15` conforme revisão.)*

| ID | Módulo / Área | Melhoria Concreta (Baseada em Evidência Directa) | Impacto | Esforço | Risco | Dependências | Missão |
|---|---|---|---|---|---|---|---|
| **R-01** | **Shell & Rail** | Reordenar `11 Definições` para o fim (`01`..`11`, desktop e drawer mobile), remover selos `Activa` redundantes mantendo realce claro do item em foco, unificar eyebrow `PRANCHA 01..11` / `PLATE 01..11` (corrigindo `SHEET 02` em Studio Desk), adicionar pista `⌘K` / `Ctrl+K` em `Pesquisar` e eliminar botão de logout duplicado no topo | **Alto** | Baixo | Baixo | `workspaceShell.test.tsx` | **08.2** |
| **R-02** | **Pesquisa Global & Notificações** | Remover copy obsoleta (`Fases 02–06`, `Ver Prancha Planeada`), apontar acções de notificações para pranchas activas, corrigir rótulo de projecto (`Abrir dossier`), marcar perfil activo (`Activo`) e evitar quebra de 2 linhas nos botões do popover | **Alto** | Baixo | Baixo | `workspaceShell.test.tsx`, `integrationPreview.test.tsx` | **08.2** |
| **R-03** | **Entrada (`/login`, `/welcome`)** | Eliminar overflow horizontal em `/login` (`375px`, hoje `643.33px`) e truncamento dos 6 nomes/departamentos; em `/welcome`, compactar o caderno superior para manter `Entrar no Workspace` acima da dobra em `1440×900` e remover CTAs duplicados | **Alto** | Médio | Baixo | `entryExperience.test.tsx` | **08.2** |
| **R-12** | **Design System Transversal** | Revisão sistemática de tipografia (`Outfit`/`Playfair`), hierarquia visual, contraste WCAG 2.2 AA, ritmo de espaçamento, superfícies (`#050505`/`#111111`/`#181818`/`#222222`) e componentes reutilizáveis (`PlateHeader`, `DemoBadge` sem middot órfão, `KpiTile`, `FilterBar`) preservando estritamente a identidade O+A (`docs/DESIGN_SYSTEM.md`) | **Alto** | Médio | Baixo | `docs/DESIGN_SYSTEM.md`, `tokens.css` | **08.2** |
| **R-04** | **Formatação & Higiene PT/EN (`01`, `03`, `04`, `08`, `09`, `10`, `/login`, `/welcome`, `/model`)** | Substituir datas ISO cruas (`2026-11-10`) por formatação editorial localizada (`10 Nov 2026`), traduzir enums (`in_progress`, `REQUESTED`, `mode: local-demo`), corrigir `Milão` → `Milan` e `(Estudo Demo)` em EN, e uniformizar etiqueta `(Demo)` em `09 Actividade` | **Alto** | Baixo | Baixo | Helper partilhado de formatação de datas/bases (`Intl` em cache) | **08.3** |
| **R-05** | **Ergonomia de Filtros & Inputs (`02`, `03`, `06`, `07`, `08`, `09`)** | Alargar/ajustar inputs e placeholders para eliminar truncamento a meio da palavra (`1440px`/`768px`/`375px`); igualar altura (`44px`) entre `<input>` e `<select>`; desactivar/atenuar `Limpar filtros` quando nenhum filtro está activo | **Médio** | Baixo | Baixo | **R-12** | **08.3** |
| **R-06** | **01 · Studio Desk** | Eliminar comutador duplicado `Modo Editorial | Lista Técnica`, remover badges `PLANNED` obsoletos (`PHASE 04`/`PHASE 06`) e disciplina duplicada (`ARQ-02`), reduzir redundância KPI strip vs acções rápidas, corrigir truncamentos `768px` e equilibrar grelha `2×2` para reduzir altura total (`3662px`) | **Alto** | Médio | Médio | **R-01**, **R-12**, `studioDesk.test.tsx` | **08.4** |
| **R-07** | **02 · Projectos (Catálogo, Dossier & Wizard)** | Deduplicar etiqueta disciplina/departamento nos cartões, esclarecer/ocultar `Por função (0)`, confirmar carregamento/fallback visual de miniaturas (`OA-26-119`, `OA-25-084`), remover duplicação de gatilhos e texto obsoleto *"Fase 04"* no Dossier, corrigir breadcrumb e altura de Passo 1 em `/projects/new` para manter `Seguinte` acima dos `900px` | **Alto** | Médio | Médio | **R-12**, `projectLibrary*.test.tsx`, `e2e-verify-entry.mjs` | **08.4** |
| **R-08** | **03 · Tarefas & 04 · Calendário** | Em `03`, reservar botão terracota preenchido para acção primária de criação/foco e usar acção contida (`Concluir`) nas linhas/cartões; em `04`, melhorar leitura de dias densos (`+N eventos`), compactar grelha mensal em `1440×900`, exibir contadores nos filtros e aproveitar largura útil na Agenda Cronológica | **Médio** | Médio | Baixo | **R-04**, `operationsExperience.test.tsx` | **08.4** |
| **R-13** | **Motor 3D (`/workspace/projects/:id/model`)** | Avaliar e refinar experiência espacial do visualizador 3D: **modo imersivo** (maximização da área do `<canvas>`), **controlos flutuantes compactos**, **painéis técnicos recolhíveis** (evitando barra de `518px` em mobile e `aside` de `1260px`), remoção de links de retorno duplicados e preenchimento integral do contentor em `768px` — **preservando integralmente** a segurança WebGL (`ADR-010`, allowlist, `50 MB`, `ObjectURL` efémero) e `0 B` de chunks 3D no entry | **Alto** | Médio | Médio | `ADR-010`, `modelEngine*.test.tsx`, `ProjectModelEnginePage.tsx` | **08.4** |
| **R-09** | **05 · Departamentos & 06 · Equipa** | Corrigir clipping de `COLABORADORES` (`05`) e quebra de `CORREIO DEMO` (`06`); compactar sub-painéis vazios em `05` e alinhar CTA principal com operação departamental; em `768px`, melhorar acesso rápido à ficha do departamento seleccionado sem obrigar a percorrer 9 linhas | **Médio** | Médio | Baixo | **R-05**, **R-12**, `studioStructureExperience.test.tsx` | **08.5** |
| **R-14** | **07 · Biblioteca Técnica (Apresentação Visual & Organização)** | Proposta de apresentação mais visual e organizada das referências técnicas (hierarquia visual por categoria `MAT`/`SYS`/`EST`, cartões técnicos estruturados com cabeçalho visual/etiqueta de norma/região, vista compacta vs ficha detalhada, gatilho de registo no topo evitando longo scroll por baixo de 9 cartões) — **estritamente local/metadados**, sem armazenamento remoto nem uploads binários | **Alto** | Médio | Baixo | **R-05**, **R-12**, `technicalLibraryRepository.ts` | **08.5** |
| **R-10** | **08 · Publicações, 09 · Actividade & 10 · Relatórios** | Em `08`, colapsar `Nota editorial opcional` sob expansão contextual por cartão; em `09`, mostrar `Fila editorial` apenas em eventos de `publications` e melhorar agrupamento temporal; em `10`, alinhar KPI 5, clarificar `Activos` vs `Concluídos` e alinhar link de `Síntese por Base` para `/workspace/projects` | **Alto** | Médio | Baixo | **R-04**, **R-05**, `editorialControlExperience.test.tsx` | **08.5** |
| **R-11** | **11 · Definições** | Padronizar H1 editorial sem ponto final, substituir checkbox isolado por toggle consistente, reduzir redundância com `PT | EN` do cabeçalho e recolher chaves `oa_workspace_*_v1` num `<details>` colapsável («Diagnóstico técnico local») separado do reset destrutivo | **Médio** | Baixo | Baixo | **R-12**, `workspaceShell.test.tsx` | **08.5** |
| **R-15** | **Experiência Mobile/Tablet (`375px`/`768px`), Onboarding Opcional & Validação Final Fase 08** | Refinar ergonomia dedicada `375px`/`768px` (ex.: tabela responsiva/cartões em `10 Relatórios` eliminando `525.6px` em `375px`, navegação por separador/coluna em `03 Tarefas` Board mobile, painéis compactos em `05`/`07`), adicionar **onboarding interactivo opcional e dispensável** (persistido em `localStorage`, limpo em `resetAllDemoData()`, respeitando `prefers-reduced-motion` e acessibilidade WCAG 2.2 AA), e executar validação final completa da Fase 08 (`1440`/`768`/`375`, `PT/EN`, `6` perfis) | **Alto** | Médio | Baixo | **08.2**–**08.5** concluídas | **08.6** |

---

## 4. Organização Incremental da Fase 08 (`08.2` → `08.6`): Branches, Dependências, Entregáveis e Critérios de Aceitação

### Missão **08.2** — Design System Transversal, Shell, Overlays & Entrada (`R-01`, `R-02`, `R-03`, `R-12`)
- **Branches:** `codex/f082-shell-ds-agent-b` (`@agent-b`, `T2`) → `codex/f082-qa-agent-d` (`@agent-d`, `T1`) → `codex/f082-integration-candidate` → PR para `codex/f02-integration-preview`
- **Dependências:** Base `1abaa9d` + Plano 021 aprovado
- **Entregáveis:**
  - Componentes reutilizáveis alinhados a `docs/DESIGN_SYSTEM.md` (`PlateHeader`, `DemoBadge`, `KpiTile`, `FilterBar`) sem alterar identidade O+A;
  - Rail ordenado `01`..`11`, sem selos `Activa` redundantes, eyebrow unificado `PRANCHA 01..11`, atalho `Ctrl+K`/`⌘K` visível e logout único no menu;
  - Notificações e Pesquisa Global sem copy obsoleta F02–F06;
  - `/login` sem overflow em `375px` e sem truncamento dos 6 perfis; `/welcome` com CTA above-the-fold em `1440×900`;
  - Relatórios `08-2-FE-01` e `08-2-QA-01`.
- **Critérios de Aceitação:** `0` overflow em `/login` (`375px`/`768px`/`1440px`); `0` referências obsoletas a "prancha planeada" ou fases encerradas; `lint`, `build`, chunk check (`0 B` 3D/motion), Vitest e `e2e-visual` 100% PASS.

### Missão **08.3** — Higiene PT/EN de Datas/Enums & Ergonomia de Filtros (`R-04`, `R-05`)
- **Branches:** `codex/f083-format-agent-a` (`@agent-a`, `T1`) → `codex/f083-filters-agent-b` (`@agent-b`, `T1`) → `codex/f083-qa-agent-d` (`@agent-d`, `T1`) → `codex/f083-integration-candidate` → PR para `codex/f02-integration-preview`
- **Dependências:** Missão **08.2** integrada no preview
- **Entregáveis:**
  - Helper partilhado de formatação localizada (`Intl` em cache) para datas, bases (`Maputo` / `Milão` ↔ `Milan`) e etiquetas de estado/domínio;
  - Eliminação total de datas ISO cruas, enums ingleses em PT e strings `Milão`/`(Estudo Demo)` por traduzir em EN;
  - Inputs/selects uniformizados a `44px`, placeholders legíveis sem truncamento e estado desactivado em `Limpar filtros` quando vazio;
  - Testes unitários de formatação + relatórios `08-3-DATA-01`, `08-3-FE-01`, `08-3-QA-01`.
- **Critérios de Aceitação:** `0` datas ISO cruas ou enums internos em PT/EN nos módulos `01`..`11`; `0` placeholders truncados em `1440px`/`768px`; `quality-gate` + `e2e-visual` 100% PASS.

### Missão **08.4** — Produtividade do Núcleo Operacional (`01`–`04`) & Refinamento do Motor 3D (`R-06`, `R-07`, `R-08`, `R-13`)
- **Branches:** `codex/f084-core-3d-agent-b` (`@agent-b`, `T2`) → `codex/f084-qa-agent-d` (`@agent-d`, `T1`) → `codex/f084-integration-candidate` → PR para `codex/f02-integration-preview`
- **Dependências:** Missões **08.2** e **08.3** integradas no preview
- **Entregáveis:**
  - `01 Studio Desk` compacto (sem switchers duplicados, sem badges `PLANNED` antigos, grelha `2×2` equilibrada);
  - `02 Projectos` sem tags duplicadas, Dossier sem gatilhos duplicados nem texto *"Fase 04"*, `/projects/new` Passo 1 above-the-fold e breadcrumb completo;
  - `03 Tarefas` e `04 Calendário` com hierarquia de acções contida, contadores nos filtros e agenda aproveitando largura útil;
  - **Motor 3D (`/model`):** modo imersivo de palco maximizado, controlos flutuantes compactos, painéis recolhíveis e remoção de links de retorno duplicados, preservando `ADR-010`, validação `.glb`/`.gltf`/`.skp`, limite `50 MB`, revogação de `ObjectURL` e `0 B` de WebGL no entry;
  - Relatórios `08-4-FE-01` e `08-4-QA-01`.
- **Critérios de Aceitação:** Área útil do `<canvas>` 3D maximizada em `1440px`/`768px`/`375px` com painéis recolhíveis acessíveis por teclado; `0 B` de `vendor-three`/`vendor-r3f` em `dist/index.html`; todos os testes `modelEngine*`, `projectLibrary*`, `studioDesk`, `operationsExperience` e `e2e-visual` 100% PASS.

### Missão **08.5** — Biblioteca Técnica Visual & Refinamento Estrutural/Editorial `05`–`11` (`R-09`, `R-10`, `R-11`, `R-14`)
- **Branches:** `codex/f085-structure-editorial-agent-b` (`@agent-b`, `T2`) → `codex/f085-qa-agent-d` (`@agent-d`, `T1`) → `codex/f085-integration-candidate` → PR para `codex/f02-integration-preview`
- **Dependências:** Missões **08.2** e **08.3** integradas no preview
- **Entregáveis:**
  - `05 Departamentos` e `06 Equipa` sem clipping (`COLABORADORES`, `CORREIO DEMO`) e sub-painéis equilibrados;
  - **`07 Biblioteca Técnica`:** apresentação visual e organizada das fichas técnicas (separação clara por categoria `MAT`/`SYS`/`EST`, cartões visuais estruturados com metadados técnicos legíveis, vista compacta/detalhe e acção de registo acessível no topo), **100% local/metadados** (zero armazenamento remoto);
  - `08 Publicações` com nota editorial sob expansão contextual; `09 Actividade` com `Fila editorial` restrita a eventos editoriais; `10 Relatórios` com KPI 5 alinhado, rótulo `Activos`/`Concluídos` claro e link coerente;
  - `11 Definições` com H1 padronizado, toggle consistente e bloco `<details>` para chaves técnicas locais;
  - Relatórios `08-5-FE-01` e `08-5-QA-01`.
- **Critérios de Aceitação:** `0` clipping visual em `05`/`06`/`10`; `0` uploads binários ou armazenamento remoto em `07`; testes `studioStructure*`, `editorialControl*`, `workspaceShell` e `e2e-visual` 100% PASS.

### Missão **08.6** — Experiência Mobile/Tablet (`375px`/`768px`), Onboarding Interactivo Opcional & Validação Final Fase 08 (`R-15`)
- **Branches:** `codex/f086-mobile-onboarding-agent-b` (`@agent-b`, `T2`) → `codex/f086-qa-final-agent-d` (`@agent-d`, `T1`) → `codex/f086-integration-candidate` → PR final da Fase 08 para `codex/f02-integration-preview`
- **Dependências:** Missões **08.2**, **08.3**, **08.4** e **08.5** integradas no preview
- **Entregáveis:**
  - Adaptações responsivas dedicadas `375px`/`768px` (tabela responsiva/cartões em `10 Relatórios` sem scroll horizontal forçado, selector de coluna em `03 Tarefas` Board mobile, acesso imediato ao detalhe em `05 Departamentos` tablet/mobile);
  - **Onboarding interactivo opcional** (guia curto de 3–4 passos focado nas 11 pranchas e atalhos como `Ctrl+K`, dispensável a qualquer momento com `Escape`/botão, reativável em `11 Definições`, persistido apenas em `localStorage`, limpo em `resetAllDemoData()`, compatível com `prefers-reduced-motion` e focus trap `ADR-008`);
  - Validação final transversal da Fase 08 (`1440px`/`768px`/`375px`, `PT/EN`, perfis `DIR-01`..`INV-06`), atualização de `docs/DELIVERY_SUMMARY.md`, `docs/PRODUCT_SPEC.md` e `PROJECT_MAP.md`;
  - Relatórios `08-6-FE-01` e `08-6-QA-01`.
- **Critérios de Aceitação:** `0` overflow horizontal em todas as `11/11` rotas em `375px`, `768px` e `1440px`; onboarding 100% opcional, acessível por teclado e sem bloquear o fluxo diário; `0` P0/P1; `quality-gate` + `e2e-visual` 100% PASS e autorização humana antes do merge final.

---

## 5. Critérios Globais e Restrições Invariáveis da Fase 08

1. **Preservação da base demonstrativa (`1abaa9d`):** `11/11` rotas, `6/6` perfis, `PT/EN`, `resetAllDemoData()` e `0` regressões funcionais.
2. **Design System & WCAG 2.2 AA:** tokens de `docs/DESIGN_SYSTEM.md`, raio `0–2px`, alvos ≥ `44px`, contraste AA e `prefers-reduced-motion`.
3. **Performance & Segurança:** `0 B` de `vendor-three`/`vendor-r3f`/`vendor-motion` em `dist/index.html`; `0` leituras de `localStorage` por tecla na Pesquisa Global; `0` novas dependências em `package.json`; segurança WebGL (`ADR-010`) intacta.
4. **Isolamento absoluto:** `main` (`e468fe7`) e website público `oaworkshop` 100% intocados; zero backend, zero armazenamento remoto, zero Google Calendar.

---

> **Próxima acção necessária:** Aprovação expressa do responsável humano (`APROVADO: plans/021-phase-08-product-refinement-and-user-experience.md`) antes de iniciar a **Fase 08.2**.
