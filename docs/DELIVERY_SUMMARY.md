# Resumo de Entrega Final — O+A Workspace (Versão Demonstrativa Frontend)

- **Estado do Produto:** **Versão Demonstrativa Concluída (Fases 00–07)**
- **Rotas Operacionais:** **`11/11` pranchas activas** + Entrada (`/login`, `/welcome`)
- **Base de Preview:** `codex/f02-integration-preview` (`174b24a`) ← Candidato Fase 07 (`codex/f07-integration-candidate`)
- **Isolamento do Website Público:** `origin/main` (`e468fe7cb043844855c529477616f6e873c45190`) e website público `oaworkshop` **100% intocados**
- **Relatórios Fase 07:** [07-E2E-01-agent-b.md](agent-reports/phase-07/07-E2E-01-agent-b.md) · [07-QA-01-agent-d.md](agent-reports/phase-07/07-QA-01-agent-d.md)

---

## 1. Síntese Executiva

O **O+A Workspace** conclui integralmente o seu ciclo de desenvolvimento **Front-end Demonstrativo Autónomo** (Fases 00 a 07), oferecendo um ambiente interno editorial e arquitectónico bilingue (**PT / EN**) para a **O+A Arquitectos e Planeadores** (Maputo e Milão):

- **11/11 pranchas operacionais** em `WorkspaceShell` persistente com rail colapsável, drawer móvel acessível, pesquisa global pré-normalizada (`0` leituras de `localStorage` por tecla) e centro de notificações demo.
- **Domínio canónico unificado e sincronizado** (`projectLibraryRepository`, `tasksRepository`, `technicalLibraryRepository`, `publicationsRepository`, `DEPARTMENTS`, `DEMO_USERS`) com snapshots imutáveis, sincronização `StorageEvent` cross-tab, tratamento atómico de `QuotaExceededError` e limpeza completa em `resetAllDemoData()`.
- **Visualizador 3D WebGL isolado** (`.glb`/`.gltf` em memória de sessão + distinção documental `.skp`), mantendo **`0 B`** de `vendor-three`, `vendor-r3f` e `vendor-motion` no preload inicial (`dist/index.html`).
- **Qualidade verificada:** `npm run lint` (`0` erros/avisos), `npm run build` (`2 812` módulos), `19/19` suites / `133/133` testes Vitest PASS, `npm audit --omit=dev --audit-level=high` (`0` vulnerabilidades), `npm run test:e2e` (`11/11` áreas operacionais + `375px`/`768px`/`1440px`) PASS e validação real em Chromium dos `6/6` perfis demonstrativos (`0` P0 · `0` P1 · `0` P2).

---

## 2. Matriz Consolidada de Evidências por Módulo (`Entrada` + `11/11` Pranchas)

*(Evidência verificada em `07-QA-01` sobre `32187b9` — zero resultados fabricados.)*

| Módulo / Rota | Fluxo | Resultado | Idioma (PT/EN) | Viewport (375 / 768 / 1440) | Acessibilidade (WCAG 2.2 AA) | Eventuais Problemas |
| --- | --- | --- | --- | --- | --- | --- |
| **Entrada** (`/login`, `/welcome`) | Guarda de rota, selecção dos 6 perfis demo, Estudo Espacial / Corte 1:100, aviso modal demo, transição `/login` → `/welcome` → `/workspace` e logout | **PASS** | **PT / EN** | **375 / 768 / 1440** | Focus trap, `inert`, `Escape`, restauro de foco; `0` passwords em `localStorage` | Nenhum (`0`) |
| **01 · Studio Desk** (`/workspace`) | Shell único, prioridades por perfil (`6/6`), pesquisa global por teclado, notificações demo e sincronização live | **PASS** | **PT / EN** | **375 / 768 / 1440** | Drawer móvel com focus trap/Escape; pesquisa por teclado; scroll independente | Nenhum (`0`) |
| **02 · Projectos & Motor 3D** (`/workspace/projects`, `/new`, `/:id`, `/:id/model`) | Galeria/Lista, assistente 4 passos, dossier 6 secções, arquivo/restauro, visualizador WebGL `.glb` em lazy load | **PASS** | **PT / EN** | **375 / 768 / 1440** | Teclado, `role="status"`/`role="alert"`, `0 B` de 3D no entry | Nenhum (`0`) |
| **03 · Tarefas** (`/workspace/tasks`) | Lista Técnica ↔ Quadro Operacional (3 colunas), criação modal, transições de estado, sync Studio Desk, `QuotaExceededError` | **PASS** | **PT / EN** | **375 / 768 / 1440** | `TaskEditorDialog` com focus trap e `role="alert"` em erro de quota | Nenhum (`0`) |
| **04 · Calendário** (`/workspace/calendar`) | Grelha Mensal ↔ Agenda Cronológica, filtros, links dossier/tarefas, zero UI enganosa de sync externo | **PASS** | **PT / EN** | **375 / 768 / 1440** | Cabeçalhos semânticos, filtros rotulados e navegação por teclado | Nenhum (`0`) |
| **05 · Departamentos** (`/workspace/departments`) | Directório canónico das `9` unidades (`DIR`..`RHU`), detalhe contextual, `0` honesto em `ADM`/`RHU`, links cruzados | **PASS** | **PT / EN** | **375 / 768 / 1440** | Selecção semântica, hierarquia de headings e contraste AA | Nenhum (`0`) |
| **06 · Equipa** (`/workspace/team`) | Directório dos `6` perfis (`DIR-01`..`INV-06`), filtros combináveis, sync URL `?dept=` em montagem, `0` exposição de `demoAccessKey` | **PASS** | **PT / EN** | **375 / 768 / 1440** | `<label>` associados, foco visível e links contextuais | Nenhum (`0`) |
| **07 · Biblioteca Técnica** (`/workspace/library`) | Catálogo autónomo em `3` categorias (apenas metadados, `0` uploads binários), registo modal, sync URL `?dept=`/`?project=` | **PASS** | **PT / EN** | **375 / 768 / 1440** | Focus trap/`inert`/`Escape`/restauro de foco e `role="alert"` em quota | Nenhum (`0`) |
| **08 · Publicações** (`/workspace/publications`) | Fila editorial privada por omissão, transições auditáveis, pré-visualização local PT/EN (`PublicationPreviewDialog`), sync URL | **PASS** | **PT / EN** | **375 / 768 / 1440** | `role="dialog"`, `aria-modal`, `inert`, `Escape`, restauro de foco, `aria-live` | Nenhum (`0`) |
| **09 · Actividade** (`/workspace/activity`) | Linha cronológica derivada dos `4` repositórios canónicos (`0` eventos inventados), filtros sincronizados no URL em montagem | **PASS** | **PT / EN** | **375 / 768 / 1440** | Agrupamento semântico, filtros rotulados e links directos | Nenhum (`0`) |
| **10 · Relatórios** (`/workspace/reports`) | Síntese derivada dos `4` repositórios + `9` departamentos (`0` honesto em `ADM`/`RHU`), exportação JSON local (`URL.revokeObjectURL`) e impressão | **PASS** | **PT / EN** | **375 / 768 / 1440** | Tabelas/`<dl>` semânticos, `aria-live="polite"`, folha `@media print` | Nenhum (`0`) |
| **11 · Definições** (`/workspace/settings`) | Idioma PT/EN, `reduceMotionOverride`, `skipWelcomeOnLogin`, `resetAllDemoData()` integral | **PASS** | **PT / EN** | **375 / 768 / 1440** | Controlos rotulados, respeito por movimento reduzido e gestão de foco | Nenhum (`0`) |

---

## 3. Validação dos 6 Perfis Demonstrativos (`DIR-01`..`INV-06`)

Todos os seis perfis foram validados em Chromium real (`07-QA-01`, `vite preview`, sessão limpa por perfil) nos fluxos `/login` → `/welcome` → Studio Desk → `/projects` → `/tasks` → `/team` → `/publications`, com `0` erros de consola, `0` overflow e `0` exposição de credenciais:

| Código | Perfil Demonstrativo | Papel (`Role`) | Base | Resultado |
| --- | --- | --- | --- | --- |
| `DIR-01` | Helena Mondlane (Demo) | `director` | Maputo | **PASS** |
| `ARQ-02` | Mateo Conti (Demo) | `architect` | Milão | **PASS** |
| `GPR-03` | Inês Macamo (Demo) | `project_manager` | Maputo | **PASS** |
| `URB-04` | Tomás Nhantumbo (Demo) | `department_lead` | Maputo | **PASS** |
| `COM-05` | Clara Ferraz (Demo) | `communications` | Milão | **PASS** |
| `INV-06` | Diogo Tembe (Demo) | `staff` | Maputo | **PASS** |

---

## 4. Como Executar e Verificar Localmente

```bash
npm ci
npm run dev       # Servidor local Vite
npm run lint      # ESLint (0 erros / 0 avisos)
npm run build     # TypeScript + Vite build de produção
npm run test      # Vitest (19/19 suites · 133/133 testes)
npm run test:e2e  # Playwright E2E (11/11 áreas + 1440px / 768px / 375px)
```

---

## 5. Limitações Demonstrativas e Backlog Futuro

- **Permissões e papéis (`Role`):** A troca entre perfis e papéis controla apenas a vista editorial, as prioridades do Studio Desk e a sinalização de acções na fila de publicações. Não existe autenticação real, RBAC server-side nem isolamento multi-utilizador.
- **Persistência local (`localStorage`):** Todos os dados criados/alterados (`oa_workspace_*_v1`) residem exclusivamente no navegador actual, com tratamento explícito de `QuotaExceededError` e reposição completa por `resetAllDemoData()`.
- **Modelos 3D:** Ficheiros `.glb`/`.gltf` carregados pelo utilizador existem apenas em memória da sessão (sem upload remoto).
- **Isolamento do website público:** Nenhuma acção em `/workspace/publications` altera o website público `oaworkshop` nem a branch `main`.
- **Integrações futuras (apenas backlog documental):** Qualquer back-end, autenticação real ou sincronização com **Google Calendar** permanece registada apenas em [INTEGRATION_FUTURE.md](INTEGRATION_FUTURE.md) e exige RFC aprovado antes de implementação.
