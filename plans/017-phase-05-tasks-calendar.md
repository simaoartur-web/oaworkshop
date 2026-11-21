# Plano 017 · Fase 05 · Módulo 1 — Tarefas (`/workspace/tasks`) & Calendário (`/workspace/calendar`)

- **Branch candidata:** `codex/f05-m1-integration-candidate`
- **Base:** `d65689ab3fcd7051058d83526d09ba2f11fdf87b` (`origin/codex/f0451-integration-candidate`)
- **Agente A (`codex/f05-task-agent-a`):** `5ce97cd8bfd90df89c74a1383ab86dd77a5e5a0f` (`05-DATA-01`, `T2`, `Gemini 4 Neon (Medium)`)
- **Agente B (`codex/f05-task-agent-b`):** `ac13b86c2a81bcbb20829fe65bc6b013f140fedb` (`05-FE-01`, `T2`, `Gemini 4 Neon (Medium)`)
- **Aprovação humana:** `APROVADO: phase_05_tasks_calendar_plan.md`
- **Estado:** Implementação A + B concluída (`15/15` suites · `114/114` testes, `lint` e `build` verdes); em verificação final independente (`05-QA-01`, `@agent-d`).

---

## Âmbito Entregue

1. **Camada Canónica de Operações (`@agent-a`):** `operationsTypes.ts`, `tasksRepository.ts` (`oa_workspace_tasks_v1`, snapshot imutável, `MAX_LOCAL_TASKS = 150`, escrita atómica `QuotaExceededError`, sync `StorageEvent`), `calendarSelector.ts` (marcos de projecto + prazos de tarefas + 5 revisões Maputo/Milão), `useStudioOperations.ts`, indexação na Pesquisa Global (`0` leituras de storage por tecla) e limpeza no `resetAllDemoData()` sem novos imports estáticos no entry.
2. **Experiência Editorial & Sincronização (`@agent-b`):** `TasksPage.tsx` (Lista Técnica + `TaskBoardView.tsx` 3 colunas acessível por teclado + `TaskEditorDialog.tsx` com `useDialogFocusTrap` + `?task=`), `CalendarPage.tsx` (Vista Mensal + Agenda Cronológica + links dossier/tarefa), promoção de `tasks`/`calendar` em `shellNavigation.ts`, lazy loading em `App.tsx`/`routePreload.ts`, sincronização live em `StudioDeskPage.tsx` e PT/EN completo em `src/features/operations/i18n.ts`.
