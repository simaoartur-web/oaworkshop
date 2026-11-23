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
| **Fase 06** | Fila editorial de publicação (`/workspace/publications`), pré-visualização local PT/EN, registo de actividade (`/workspace/activity`) e relatórios derivados (`/workspace/reports`) | **Concluída e integrada (`codex/f02-integration-preview` · `9533d38`, 11/11 rotas activas)** |
| **Fase 07** | Auditoria final UX, WCAG 2.2 AA, performance, i18n, cobertura E2E `11/11`, matriz de evidências e documentação final de entrega | **Concluída (candidato `codex/f07-integration-candidate` em Quality Gate final)** |

## 3. Mapa de Rotas Previstas

- `/login` — Câmara de acesso interno demonstrativo (**activa**).
- `/welcome` — Caderno editorial de boas-vindas pós-login (**activa**, lazy-loaded).
- `/workspace` — Contentor reutilizável **`WorkspaceShell`** persistente com **`StudioDeskPage`** sincronizada com a Biblioteca canónica (**activa**).
- `/workspace/settings` — Preferências locais da sessão demo (`PT/EN`, `skipWelcomeOnLogin`, `reduceMotionOverride`, rail expandido/compacto, papéis e diagnóstico storage) (**activa**).
- `/workspace/projects`, `/workspace/projects/new`, `/workspace/projects/:id`, `/workspace/projects/:id/model` — Biblioteca de projectos, criação guiada, dossier vivo e visualizador 3D WebGL real (**activas**, lazy-loaded sem transferência 3D antecipada fora de `/model`).
- `/workspace/tasks`, `/workspace/calendar` — Operação de atelier (Fase 05 · Módulo 1: **activas**, lazy-loaded; lista/board acessível sincronizado com Studio Desk e agenda derivada de marcos + tarefas).
- `/workspace/departments`, `/workspace/team`, `/workspace/library` — Operação de atelier (Fase 05 · Módulo 2: **activas**, lazy-loaded; 9 departamentos derivados, 6 perfis demonstrativos e biblioteca técnica autónoma PT/EN).
- `/workspace/publications`, `/workspace/activity`, `/workspace/reports` — Editorial e controlo (Fase 06: **activas**, lazy-loaded; fila editorial com estados e pré-visualização local PT/EN sem envio público, feed cronológico unificado derivado e relatórios derivados com exportação JSON local e impressão limpa; `11/11` módulos do Shell activos).

## 4. Papéis Demonstrativos (`Role`)

1. `director` — Direcção Conjunta (visão transversal, prioridades e aprovação final editorial).
2. `architect` — Arquitectura & Urbanismo (dossiers, cortes, maquetes e modelos 3D).
3. `project_manager` — Gestão de Projectos (marcos, prazos, atribuições e coordenação).
4. `department_lead` — Coordenação Departamental (alocação técnica e revisões).
5. `communications` — Comunicação & Editorial (curadoria de portfólio PT/EN e pedidos de publicação).
6. `staff` — Equipa Técnica & Investigação (tarefas atribuídas, referências e documentação).

> **Aviso obrigatório na UI:** A selecção de papéis altera apenas a vista e os controlos demonstrativos no navegador; não constitui controlo de acesso real nem protecção de dados.

## 5. Limitações Demonstrativas (Permissões e Persistência)

1. **Permissões e Papéis (`Role`):** A troca entre os 6 perfis demonstrativos e os seus papéis (`director`, `architect`, `project_manager`, `department_lead`, `communications`, `staff`) controla apenas a vista editorial, os destaques do Studio Desk e a sinalização de acções na fila de publicações. Não existe autenticação real, gestão de contas, controlo de acesso server-side (RBAC) nem isolamento de dados entre utilizadores.
2. **Persistência Local (`localStorage`):** Sessão demo, preferências, projectos locais, tarefas, referências da Biblioteca Técnica e histórico editorial (`oa_workspace_*_v1`) são guardados exclusivamente no navegador actual, sujeitos à quota do dispositivo (com tratamento explícito de `QuotaExceededError` e rollback atómico) e limpos integralmente por `resetAllDemoData()`. Não existe base de dados remota, sincronização entre dispositivos nem envio de dados para o website público `oaworkshop`.
3. **Ficheiros 3D e Integrações Externas:** Os modelos `.glb`/`.gltf` são carregados apenas em memória local da sessão (sem upload remoto) e a integração com Google Calendar permanece exclusivamente em backlog documental (`docs/INTEGRATION_FUTURE.md`).
