# Relatório de Planeamento — `08-PLAN-01` (`@coordinator`)

| Campo | Valor |
| --- | --- |
| **Task ID** | `08-PLAN-01` |
| **Responsável** | `@coordinator` |
| **Fase / Missão** | Fase 08.1 — Product Refinement & User Experience (Planeamento & Revisão) |
| **Classe / Modelo** | `T1` · `Gemini 4 Neon (Medium)` *(fallback Tier 3 conforme Model Governance v1.1; ver secção 2)* |
| **Branch documental** | `codex/docs-f08-plan-021` |
| **Base canónica preservada** | `codex/f02-integration-preview` · `1abaa9d26bc10bc44a65584479d36781494c9e60` |
| **Estado de `main` / `oaworkshop`** | `e468fe7cb043844855c529477616f6e873c45190` *(100% intocado)* |
| **Alterações em `src/`** | **`0` ficheiros** *(missão estritamente documental)* |

---

## 1. Actividades Executadas

1. **Consulta das fontes canónicas:** Revistos `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_BRIEF.md`, `docs/DECISIONS.md` (`ADR-001`..`ADR-010`), `docs/INTEGRATION_FUTURE.md`, `docs/DELIVERY_SUMMARY.md` e a skill operacional `ultimate-skills` (v3.0.0 — evidência, liderança de produto, UX/UI e design systems).
2. **Inspecção visual dirigida Desktop (`1440×900`, `DIR-01`, `PT`):** Inspeccionadas diretamente em `http://127.0.0.1:5173/` (`1abaa9d`) a entrada (`/login`, `/welcome`), overlays globais (Pesquisa Global `Ctrl+K`, Notificações, Menu de Utilizador) e todas as **`11/11` áreas operacionais** (`01`..`11`).
3. **Inspecção complementar dirigida Mobile (`375×812`) & Tablet (`768×1024`) · `PT/EN` · Perfis `DIR-01`, `ARQ-02`, `COM-05`:**
   - Confirmado overflow real em `/login` (`375px`: `body` a `643.33px`);
   - Confirmadas fugas de tradução EN (`Milão` em `/login`, `/welcome`, `01`, `08`, `10` e loading; `(Estudo Demo)` em `/model`);
   - Medida a ergonomia real do **Motor 3D** (`/model`): barra de controlos empilha `518px` (`375px`) e `272px` (`768px`), `<canvas>` ocupa `262.7×338.7px` dentro de `608.7×420px` em `768px`, links de retorno duplicados e `aside` com `1260px`/`991px` abaixo;
   - Confirmados pontos mobile/tablet em `01` (`SHEET 02`, badges `PLANNED` obsoletos, truncamento `768px`), `03` (Board `4603px`/`3730px`), `05` (9 linhas acima do detalhe em `768px`), `07`/`10` (middot órfão `·` em `375px`, tabela `525.6px` em `375px`).
4. **Entregáveis documentais revistos e consolidados:**
   - `plans/021-phase-08-product-refinement-and-user-experience.md` — matriz completa **`R-01`..`R-15`** (preservando integralmente `R-01`..`R-11` e adicionando `R-12` Design System, `R-13` Motor 3D imersivo/recolhível, `R-14` Biblioteca Técnica visual/organizada e `R-15` Mobile/Tablet + Onboarding opcional + Validação final) estruturada em **`5` missões (`08.2` → `08.6`)** com branches, dependências, entregáveis e critérios de aceitação.
   - `docs/PRODUCT_EVOLUTION_ROADMAP.md` — roadmap **Fases 09–14** incorporando **Gestão Avançada de Projectos** (F11), **Business Intelligence** (F12), **Implementação Piloto com Colaboradores Reais** (F14) e proibição explícita de dados empresariais reais antes dos controlos de segurança (F09–F10).

---

## 2. Governança de Modelos (Model Governance v1.1)

- **Tier 1 (`Claude Opus 5.5`):** `0%` disponível (reset `2026-11-26T18:55:38Z`).
- **Tier 2 (OpenAI GPT proprietário):** não listado (`gpt-oss-120b-medium` é open-weight e está a `0%`).
- **Tier 3 autorizado (Gemini não-Argon):** `Gemini 4 Neon (Medium)` (`95%` disponível) utilizado para coordenação/planeamento; **zero Argon e zero Extra High**. Prioridade automática para Opus/GPT caso fiquem disponíveis antes da Fase 08.2.
- **Inspecções visuais no navegador (`1440px`, `768px`, `375px`):** subagentes `browser` em `flash` (modo read-only sobre `http://127.0.0.1:5173/`, verificados por `BROWSER_HOST_FACTS`).

---

## 3. Conformidade e Próximo Passo

- `src/**`, `package.json`, `main` e `oaworkshop`: **100% intocados**.
- Nenhum feedback da equipa foi inventado; todas as recomendações assentam em evidência directa.
- **Estado:** Revisão concluída e pronta para aprovação definitiva (`APROVADO: plans/021-phase-08-product-refinement-and-user-experience.md`) antes de iniciar a **Fase 08.2**.
