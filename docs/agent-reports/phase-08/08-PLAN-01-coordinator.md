# Relatório de Planeamento — `08-PLAN-01` (`@coordinator`)

| Campo | Valor |
| --- | --- |
| **Task ID** | `08-PLAN-01` |
| **Responsável** | `@coordinator` |
| **Fase / Missão** | Fase 08.1 — Product Refinement & User Experience (Planeamento) |
| **Classe / Modelo** | `T1` · `Gemini 4 Neon (Medium)` *(fallback Tier 3 conforme Model Governance v1.1; ver secção 2)* |
| **Branch documental** | `codex/docs-f08-plan-021` |
| **Base canónica preservada** | `codex/f02-integration-preview` · `1abaa9d26bc10bc44a65584479d36781494c9e60` |
| **Estado de `main` / `oaworkshop`** | `e468fe7cb043844855c529477616f6e873c45190` *(100% intocado)* |
| **Alterações em `src/`** | **`0` ficheiros** *(missão estritamente documental)* |

---

## 1. Actividades Executadas

1. **Consulta das fontes canónicas:** Revistos `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_BRIEF.md`, `docs/DECISIONS.md` (`ADR-001`..`ADR-010`), `docs/INTEGRATION_FUTURE.md`, `docs/DELIVERY_SUMMARY.md` e a skill operacional `ultimate-skills` (v3.0.0 — princípios de evidência, liderança de produto, UX/UI e design systems).
2. **Inspecção visual dirigida em execução real (`http://127.0.0.1:5173/`):** Inspeccionadas directamente, em Chromium (`1440×900`, perfil `DIR-01` Helena Mondlane, idioma `PT`), a entrada (`/login`, `/welcome`), overlays globais (Pesquisa Global `Ctrl+K`, Notificações, Menu de Utilizador) e todas as **`11/11` áreas operacionais** (`01`..`11`), sem repetir regressões já fechadas na Fase 07 e sem inventar feedback da equipa.
3. **Produção dos entregáveis documentais:**
   - `plans/021-phase-08-product-refinement-and-user-experience.md` — matriz completa de `11` frentes de melhoria (`R-01`..`R-11`) classificadas por impacto, esforço, risco e dependências, estruturadas em `4` missões incrementais (`08.2` → `08.5`) com critérios de aceitação.
   - `docs/PRODUCT_EVOLUTION_ROADMAP.md` — roadmap estratégico das **Fases 09–14** (Backend/RFC, Auth/RBAC, Gestão Documental/3D, Colaboração & Google Calendar, Pipeline Editorial para `oa-workshop.com`, Produção/Observabilidade), sem iniciar implementação.

---

## 2. Governança de Modelos (Model Governance v1.1)

Verificação de disponibilidade em `2026-11-24`:
- **Tier 1 (`Claude Opus 5.5`):** `0%` quota disponível (reset previsto `2026-11-26T18:55:38Z`).
- **Tier 2 (OpenAI GPT proprietário / ChatGPT):** não listado no ambiente (`gpt-oss-120b-medium` é modelo open-weight fora do Tier 2 e encontra-se a `0%`).
- **Tier 3 autorizado (Gemini não-Argon):** `Gemini 4 Neon (Medium)` (`95%` disponível) utilizado para planeamento/coordenação e previsto para `T1`/`T2` na Fase 08, com `Gemini 4 Neon (Low)` para `T0`. **Zero uso de Argon e zero uso de Extra High.** Caso `Claude Opus` ou GPT proprietário fiquem disponíveis antes da Fase 08.2, terão prioridade automática.
- **Inspecção visual no navegador:** subagente `browser` em `flash` (modo read-only sobre `http://127.0.0.1:5173/`, confirmado por `BROWSER_HOST_FACTS`).

---

## 3. Síntese dos Principais Achados para Priorização (Top 5)

1. **Coerência do Shell & Overlays (`R-01`, `R-02`):** `11 Definições` fora de ordem no rail (3.º item), `10×` selos `Activa` redundantes, divergência `FOLHA` vs `PRANCHA`, e textos obsoletos das Fases 02–06 nas Notificações e na Pesquisa Global.
2. **Higiene PT/EN de Datas & Enums (`R-04`):** Datas ISO cruas (`2026-11-10`) e tokens ingleses (`in_progress`, `REQUESTED`, `mode: local-demo`) expostos na interface em português (`03`, `04`, `09`, `10`).
3. **Ergonomia de Entrada & Above-the-Fold (`R-03`, `R-06`, `R-07`):** Truncamento dos 6 nomes em `/login`, CTA principal de `/welcome` abaixo dos `900px`, `01 Studio Desk` com `3662px` e switchers duplicados, e Passo 1 de `/projects/new` com botões abaixo da dobra.
4. **Clipping & Alinhamento de Controlos (`R-05`, `R-09`, `R-10`, `R-11`):** `COLABORADORES` cortado em `05`, `CORREIO DEMO` partido em `06`, KPI 5 desalinhado em `10`, placeholders truncados em `03`/`06`/`08`/`09`, alturas desalinhadas de filtros em `09` e chaves cruas `oa_workspace_*_v1` visíveis acima do reset em `11`.
5. **Densidade & Relevância Contextual (`R-08`, `R-10`):** Acção `CONCLUIR` preenchida a cobre em todas as linhas de `03`, nota editorial sempre expandida em todos os cartões de `08` e botão `FILA EDITORIAL` repetido em linhas não-editoriais de `09`.

---

## 4. Conformidade e Próximo Passo

- `src/**`, `package.json`, `main` e `oaworkshop`: **100% intocados**.
- Versão demonstrativa `1abaa9d` preservada como referência estável.
- **Estado:** Pronto para revisão humana. **Aguarda aprovação expressa** (`APROVADO: plans/021-phase-08-product-refinement-and-user-experience.md`) antes de iniciar a **Fase 08.2**.
