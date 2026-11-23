# Plano 020 · Fase 07 — Validação Transversal e Entrega Final da Versão Demonstrativa

- **Estado:** **CONCLUÍDA** *(integrada em `codex/f02-integration-preview` via PR `#3` · `baa5725` a partir do candidato `0e86ee1`, com `07-E2E-01` `11/11` e `07-QA-01` PASSED `0` P0/P1/P2, GitHub Actions `quality-gate` + `e2e-visual` 100% PASS em `2026-11-23`; versão demonstrativa do O+A Workspace encerrada oficialmente)*
- **Branch de planeamento:** `codex/docs-f07-plan-020`
- **Base canónica (`origin/codex/f02-integration-preview`):** `174b24a8964496c96480bc7e9018dcd79d153f03` (`174b24a`, contendo Fases 00–06 concluídas e `11/11` rotas operacionais)
- **Estado de `main` / Website Público:** `e468fe7cb043844855c529477616f6e873c45190` *(100% intocado)*
- **Governança:** Model Governance v1.1 (`T0–T1`; proibido Argon e Extra High; sem agentes adicionais desnecessários)

---

## 1. Objectivo Principal

Validar de ponta a ponta a **versão demonstrativa completa** do **O+A Workspace** (`11/11` rotas operacionais + entrada `/login` e `/welcome`), confirmar ausência de regressões visuais, funcionais, de acessibilidade, de responsividade ou de i18n, e consolidar a **documentação final de entrega** para decisão humana de encerramento do produto demonstrativo.

---

## 2. Restrições Estritas de Âmbito

- **Zero novas funcionalidades** sem bloqueio P0/P1 comprovado.
- **Zero back-end**, base de dados remota, API externa ou autenticação real.
- **Zero implementação de Google Calendar** (mantido exclusivamente no backlog documental `docs/INTEGRATION_FUTURE.md`).
- **Zero integração ou escrita** no website público `oaworkshop` ou na branch `main`.
- **Zero novas dependências** em `package.json`.

---

## 3. Eixos de Validação da Fase 07

### 3.1 Testes de Utilização End-to-End (11/11 Rotas + 6 Perfis Demonstrativos)
Validar os fluxos reais completos nas 11 áreas operacionais e nos **6 perfis demonstrativos** (`DIR-01` `director`, `ARQ-02` `architect`, `GPR-03` `project_manager`, `URB-04` `department_lead`, `COM-05` `communications`, `INV-06` `staff`) nos fluxos relevantes (Studio Desk, Projectos/Tarefas/Equipa e sinalização editorial em Publicações):
1. `/login` → `/welcome` → `/workspace` (**Studio Desk** — Prancha `01`);
2. `/workspace/projects` (Prancha `02`) → `/workspace/projects/new` → `/workspace/projects/:id` → `/workspace/projects/:id/model` (visualizador 3D);
3. `/workspace/tasks` (Prancha `03`) ↔ `/workspace/calendar` (Prancha `04`) ↔ `StudioDeskPage`;
4. `/workspace/departments` (Prancha `05`) ↔ `/workspace/team` (Prancha `06`) ↔ `/workspace/library` (Prancha `07`);
5. `/workspace/publications` (Prancha `08`, incluindo pré-visualização local PT/EN) ↔ `/workspace/activity` (Prancha `09`) ↔ `/workspace/reports` (Prancha `10`, incluindo exportação JSON local e `@media print`);
6. `/workspace/settings` (Prancha `11`), Pesquisa Global, Notificações demo, persistência após reload, `resetAllDemoData()` completo (todas as chaves `oa_workspace_*_v1`) e logout → `/login`.

### 3.2 Consistência Visual e Identidade O+A
- Verificar aderência a `docs/DESIGN_SYSTEM.md` nas 11 pranchas: hierarquia tipográfica, espaçamentos, bordas, tokens de cor/superfície, pranchas numeradas `01`..`11`, estados vazios honestos (`0` real) e avisos demonstrativos uniformes.

### 3.3 Acessibilidade (WCAG 2.2 AA)
- Navegação completa por teclado (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`) nas 11 rotas e em todos os diálogos (`DemoNoticeDialog`, `TaskEditorDialog`, `TechnicalReferenceDialog`, `PublicationPreviewDialog`, drawer mobile e popovers).
- Foco visível, `inert` de fundo nos modais, restauro de foco ao botão de origem, contraste mínimo AA, hierarquia semântica de headings/landmarks, `[role="alert"]` em erros de quota e respeito por `prefers-reduced-motion` + override em Definições.

### 3.4 Responsividade e Ergonomia
- Verificação em **`375px` (telemóvel)**, **`768px` (tablet)** e **`1440px` (computador)**:
  - `0` overflow horizontal (`scrollWidth <= innerWidth + 1`);
  - `0` sobreposição de clusters no cabeçalho;
  - Scroll independente do contentor `<main>` e restauro em navegação `Back` (`POP`).

### 3.5 Regressões, i18n PT/EN e Performance
- Comutação **PT ↔ EN** sem texto misto, truncado ou não traduzido nas 11 rotas.
- Sincronização de parâmetros URL (`?dept=`, `?project=`, `?task=`, `?ref=`, `?member=`, `?status=`, `?domain=`) em página montada.
- Budget de performance preservado: `0 B` de `vendor-three`, `vendor-r3f` e `vendor-motion` no preload inicial (`dist/index.html`) e `0` leituras de `localStorage` por tecla na Pesquisa Global.
- **Extensão mínima obrigatória do E2E (`scripts/e2e-verify-entry.mjs`):** Estender obrigatoriamente o script E2E para cobrir de forma determinística as **11 áreas operacionais** (`01`..`11`, incluindo as pranchas `03` Tarefas, `04` Calendário, `05` Departamentos, `06` Equipa, `07` Biblioteca Técnica, `08` Publicações + pré-visualização local, `09` Actividade e `10` Relatórios) com verificação de renderização limpa, ausência de erros de consola/runtime e ausência de overflow horizontal, preservando integralmente todas as asserções existentes e sem aumentar timeouts artificialmente.

### 3.6 Documentação Final de Entrega e Matriz de Evidências
- **Matriz obrigatória de evidências por módulo (`01`..`11`):** Incluir no relatório `docs/agent-reports/phase-07/07-QA-01-agent-d.md` e consolidar em `docs/DELIVERY_SUMMARY.md` uma tabela estruturada com os campos: **Módulo / Rota**, **Fluxo**, **Resultado**, **Idioma (PT/EN)**, **Viewport (`375px` / `768px` / `1440px`)**, **Acessibilidade (WCAG 2.2 AA)** e **Eventuais Problemas**, complementada por uma secção dedicada de validação dos **6 perfis demonstrativos** nos fluxos relevantes.
- Criar `docs/DELIVERY_SUMMARY.md` com:
  - Resumo executivo da versão demonstrativa concluída (`Fases 00–07`, `11/11` rotas);
  - Matriz consolidada de evidências por módulo e validação dos 6 perfis demonstrativos;
  - Como executar localmente (`npm ci`, `npm run dev`, `npm run build`, `npm run test`, `npm run test:e2e`);
  - Limitações demonstrativas explícitas (permissões/papéis locais, persistência `localStorage`, modelos 3D em memória, isolamento do site público);
  - Referência ao backlog futuro (`docs/INTEGRATION_FUTURE.md`, incluindo Google Calendar).
- Atualizar `PROJECT_MAP.md`, `docs/PRODUCT_SPEC.md` (Fase 07 → Concluída após merge) e `README.md` se necessário.

---

## 4. Plano de Execução em Etapas Curtas

| Etapa | Tarefa | Responsável | Classe | Branch Dedicada | Entregável |
|---|---|---|---|---|---|
| **1** | `07-E2E-01` | `@agent-b` | `T1` | `codex/f07-e2e-coverage-agent-b` | **Extensão mínima obrigatória** de `scripts/e2e-verify-entry.mjs` cobrindo as **11/11** áreas operacionais (preservando todas as asserções anteriores) + validação local `lint`, `build`, `test` e `test:e2e` |
| **2** | `07-QA-01` | `@agent-d` | `T1` | `codex/f07-qa-audit-agent-d` | Auditoria dirigida (sem repetir auditorias já fechadas sem necessidade) com **matriz de evidências por módulo (`01`..`11`)** (fluxo, resultado, idioma, viewport, acessibilidade, problemas) e **validação dos 6 perfis demonstrativos** nos fluxos relevantes em `docs/agent-reports/phase-07/07-QA-01-agent-d.md` |
| **3** | `07-FIX-01` *(condicional)* | `@agent-b` (e `@agent-a` só se houver bug de dados) | `T1` | `codex/f07-fixes-agent-b` | Correcção cirúrgica apenas de eventuais P0/P1 ou desvios comprovados na Etapa 2 (zero novas funcionalidades) |
| **4** | `07-DOCS-01` | `@coordinator` | `T1` | `codex/f07-integration-candidate` | Consolidação de `docs/DELIVERY_SUMMARY.md` (com matriz de evidências), `PROJECT_MAP.md`, `docs/PRODUCT_SPEC.md`, Quality Gate local completo (`lint`, `build`, chunk check, Vitest, `audit`, `test:e2e`) |
| **5** | PR Final & CI | `@coordinator` | `T1` | PR → `codex/f02-integration-preview` | Pull Request com `quality-gate` + `e2e-visual` (`11/11` rotas) 100% PASS e relatório final para aprovação humana |

---

## 5. Critérios de Aceitação da Fase 07

1. `0` defeitos **P0** e `0` defeitos **P1** em todas as `11/11` rotas, entrada `/login`/`/welcome` e fluxos transversais.
2. **Extensão E2E obrigatória concluída:** `scripts/e2e-verify-entry.mjs` exercita e aprova todas as **11 áreas operacionais** localmente e no job `e2e-visual` do GitHub Actions.
3. **Matriz de evidências completa:** relatório final contém a matriz por módulo (`01`..`11`: fluxo, resultado, idioma, viewport, acessibilidade, eventuais problemas) e a validação dos **6 perfis demonstrativos** nos fluxos relevantes.
4. `npm run lint`, `npm run build` (`0 B` de `vendor-three`/`vendor-r3f`/`vendor-motion` em `dist/index.html`), Vitest (`100%` PASS), `npm audit --omit=dev --audit-level=high` (`0`), e `npm run test:e2e` verdes localmente e no GitHub Actions.
5. `docs/DELIVERY_SUMMARY.md`, `docs/PRODUCT_SPEC.md` e `PROJECT_MAP.md` atualizados com limitações demonstrativas claras.
6. `main` (`e468fe7`) e website público `oaworkshop` 100% intocados.

---

> **Próxima acção necessária:** Aprovação expressa do responsável humano (`APROVADO: plans/020-phase-07-validation-and-final-delivery.md`) antes de iniciar a Etapa 1 (`07-E2E-01`).
