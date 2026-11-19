# Plano 015 · Fase 04.5.1 — Reconciliação de Integrações Pendentes & Fecho Técnico da Fase 04.5

- **Branch de destino (após aprovação final):** `codex/f02-integration-preview`
- **Commit base anterior:** `4197c2ef4c71dbdc7bd00617d16d77111eba0bc5`
- **Aprovação humana:** Aprovado pelo responsável sobre `phase_0451_closure_plan.md` (Pacote Recomendado: Onda 0 + 5 P1 obrigatórios `P1-1`..`P1-5` + 3 P1 de performance `P1-6`..`P1-8`, mantendo `package.json` intocado)
- **Estado:** Em execução (Onda 0 → Onda 1 → Onda 2 → Onda 3 → Aprovação Humana Final)

---

## 1. Âmbito Aprovado

1. **Onda 0 (Reconciliação Documental & Governança):**
   - Resolver contradição de commits documentais de `@agent-c` e `@agent-d` em `OPERATING_MODEL.md`, `TASK_CONTRACT.md` e `.agents/rules/30-audit-qa-security.md`.
   - Adicionar guarda contra PR para `main` e job `e2e-visual` em `.github/workflows/workspace-quality-gate.yml`.
   - Integrar em `codex/f02-integration-preview` as 7 branches documentais pendentes (`docs-agent-governance-v1`, `f045-security-qa-final`, `f045c-performance-final`, `f045-task-agent-a`, `f045-task-agent-b`, `f045-audit-agent-c`, `f045-qa-agent-d`) com resolução única de `PROJECT_MAP.md`.
2. **Onda 1 (Implementação Paralela — Pacote Recomendado, 0 colisões):**
   - **`@agent-a` (`codex/f0451-task-agent-a`):**
     - `F0451-P1-5`: `assertWithinMaxLength` em `scale`, `areaSqm`, `elevationDatum` (e `discipline` em update) em `src/data/projectLibraryRepository.ts`.
     - `F0451-P1-7`: desacoplar imports estáticos pesados em `src/app/WorkspaceSessionContext.tsx` (`signOut`/`resetAllDemoData`) para reduzir `index-*.js` sem regredir limpeza de sessão/modelos.
     - Testes unitários/segurança + relatório `docs/agent-reports/phase-0451/0451-DATA-01-agent-a.md`.
   - **`@agent-b` (`codex/f0451-task-agent-b`):**
     - `F0451-P1-1`: reset do handle `createRetryableLazy` quando `resetKey` muda em `RouteChunkErrorBoundary`.
     - `F0451-P1-2`: `try/catch` com `[role="alert"]` em Arquivar/Restaurar no Dossier (`ProjectDossierView.tsx`).
     - `F0451-P1-3`: contraste WCAG 2.2 AA `≥ 4,5:1` em CTA 404 (`text-white` em `#A65D4A`) e micro-textos `#A65D4A` → `#CE826D`.
     - `F0451-P1-4`: estabilização determinística de `npm run test` sob `React.lazy` frio (`src/test/setup.ts` e suites integradas).
     - `F0451-P1-6`: carregamento não-bloqueante de Google Fonts em `index.html` + redução de pesos não usados.
     - `F0451-P1-8`: pré-carregamento paralelo de `ModelViewerStage` ao iniciar carga 3D com `webglSupported` (`ArchitecturalModelViewer.tsx`), preservando `0 B` fora de `/model`.
     - Testes de regressão + relatório `docs/agent-reports/phase-0451/0451-FE-01-agent-b.md`.
3. **Onda 2 (Pré-Integração):** Branch candidata `codex/f0451-integration-candidate`, actualização de `PROJECT_MAP.md` e activação de `npm run test` padrão no CI.
4. **Onda 3 (Quality Gate Único Dirigido):** `@agent-c` (`codex/f0451-audit-agent-c`) mede deltas de `P1-6`/`P1-7`/`P1-8` vs `4197c2e`; `@agent-d` (`codex/f0451-qa-agent-d`) executa bateria oficial (`lint`, `npm run test` ×2, `build`, `test:e2e`) + verificação `P1-1`..`P1-5` + smoke Fases 03–04.
5. **Fecho:** Consolidação e pedido de aprovação humana antes do merge final em `codex/f02-integration-preview`. Fase 05 permanece bloqueada até autorização explícita.
