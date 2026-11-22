# Especificação de Produto — O+A Workspace

## 1. Visão e Âmbito

O **O+A Workspace** é o ambiente digital interno de trabalho da **O+A Arquitectos e Planeadores** (uma única organização com múltiplos departamentos e perfis de colaboração). Não é um produto SaaS comercial multi-empresa, não inclui subscrições/facturação e encontra-se na fase **Frontend Demonstrativo Autónomo**.

## 2. Sequência de Fases e Estado Actual

| Fase | Âmbito | Estado |
|---|---|---|
| **Fase 00** | Isolamento de repositório, direcção de arte, `DESIGN_BRIEF`, tokens, contratos mock e arquitectura base | **Concluída** |
| **Fase 01** | Experiência de entrada (`/login`, `/welcome`), sessão mock, 6 perfis demo, PT/EN, preferências locais, recuperação demo honesta e destino `/workspace` | **Concluída e revista (Fase 02A)** |
| **Fase 02 / 02.1** | Hardening de acessibilidade, **Workspace Shell** (rail, cabeçalho contextual, pesquisa local, notificações demo, `/workspace/settings`) e **Studio Desk** (`/workspace`) integrados com ergonomia de scroll e foco | **Concluída e integrada (`codex/f02-integration-preview`)** |
| **Fase 03** | Biblioteca de projectos (galeria + lista técnica), criação guiada de 4 passos e dossier vivo de 6 secções | **Concluída e integrada (`codex/f02-integration-preview`)** |
| **Fase 04** | Motor de modelos 3D (`.glb`/`.gltf`), distinção de referências `.skp` documentais, visualizador WebGL interactivo e hardening de segurança/memória WebGL | **Concluída e integrada (`codex/f02-integration-preview`)** |
| **Fase 04.5** | Cache canónica imutável de projectos, pesquisa pré-normalizada sem leituras de storage por tecla, sincronização Studio Desk ↔ Biblioteca, code-splitting de rotas, `manualChunks`, recuperação de falhas de chunk e estados de carregamento em Shell persistente | **Concluída e integrada (`codex/f02-integration-preview`)** |
| **Fase 05** | Operação de equipa: Módulo 1 (Tarefas `/workspace/tasks` e Calendário `/workspace/calendar`) e Módulo 2 (Departamentos `/workspace/departments`, Equipa `/workspace/team` e Biblioteca Técnica `/workspace/library`) | **Concluída e integrada (`codex/f02-integration-preview` · `b384928`)** |
| **Fase 06** | Fila editorial de publicação, pré-visualização local do site e relatórios derivados | Planeada |
| **Fase 07** | Auditoria final UX, WCAG 2.2 AA, performance, i18n e regressão | Planeada |

## 3. Mapa de Rotas Previstas

- `/login` — Câmara de acesso interno demonstrativo (**activa**).
- `/welcome` — Caderno editorial de boas-vindas pós-login (**activa**, lazy-loaded).
- `/workspace` — Contentor reutilizável **`WorkspaceShell`** persistente com **`StudioDeskPage`** sincronizada com a Biblioteca canónica (**activa**).
- `/workspace/settings` — Preferências locais da sessão demo (`PT/EN`, `skipWelcomeOnLogin`, `reduceMotionOverride`, rail expandido/compacto, papéis e diagnóstico storage) (**activa**).
- `/workspace/projects`, `/workspace/projects/new`, `/workspace/projects/:id`, `/workspace/projects/:id/model` — Biblioteca de projectos, criação guiada, dossier vivo e visualizador 3D WebGL real (**activas**, lazy-loaded sem transferência 3D antecipada fora de `/model`).
- `/workspace/tasks`, `/workspace/calendar` — Operação de atelier (Fase 05 · Módulo 1: **activas**, lazy-loaded; lista/board acessível sincronizado com Studio Desk e agenda derivada de marcos + tarefas).
- `/workspace/departments`, `/workspace/team`, `/workspace/library` — Operação de atelier (Fase 05 · Módulo 2: **activas**, lazy-loaded; 9 departamentos derivados, 6 perfis demonstrativos e biblioteca técnica autónoma PT/EN).
- `/workspace/publications`, `/workspace/activity`, `/workspace/reports` — Editorial e síntese (Fases 05–06; pranchas honestas `PlannedModuleView`).

## 4. Papéis Demonstrativos (`Role`)

1. `director` — Direcção Conjunta (visão transversal, prioridades e aprovação final editorial).
2. `architect` — Arquitectura & Urbanismo (dossiers, cortes, maquetes e modelos 3D).
3. `project_manager` — Gestão de Projectos (marcos, prazos, atribuições e coordenação).
4. `department_lead` — Coordenação Departamental (alocação técnica e revisões).
5. `communications` — Comunicação & Editorial (curadoria de portfólio PT/EN e pedidos de publicação).
6. `staff` — Equipa Técnica & Investigação (tarefas atribuídas, referências e documentação).

> **Aviso obrigatório na UI:** A selecção de papéis altera apenas a vista e os controlos demonstrativos no navegador; não constitui controlo de acesso real nem protecção de dados.
