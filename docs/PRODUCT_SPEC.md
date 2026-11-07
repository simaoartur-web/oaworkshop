# Especificação de Produto — O+A Workspace

## 1. Visão e Âmbito

O **O+A Workspace** é o ambiente digital interno de trabalho da **O+A Arquitectos e Planeadores** (uma única organização com múltiplos departamentos e perfis de colaboração). Não é um produto SaaS comercial multi-empresa, não inclui subscrições/facturação e encontra-se na fase **Frontend Demonstrativo Autónomo**.

## 2. Sequência de Fases e Estado Actual

| Fase | Âmbito | Estado |
|---|---|---|
| **Fase 00** | Isolamento de repositório, direcção de arte, `DESIGN_BRIEF`, tokens, contratos mock e arquitectura base | **Concluída** |
| **Fase 01** | Experiência de entrada (`/login`, `/welcome`), sessão mock, 6 perfis demo, PT/EN, preferências locais, recuperação demo honesta e destino autenticado `/workspace` de fecho de percurso | **Implementada (aguarda avaliação do utilizador)** |
| **Fase 02** | Rail lateral arquitectónica, pesquisa global, notificações e mesa de trabalho personalizada por departamento/papel | Planeada (após aprovação da Fase 01) |
| **Fase 03** | Biblioteca de projectos (galeria + lista técnica), criação guiada e dossier vivo | Planeada |
| **Fase 04** | Visualizador Web 3D real (`.glb`/`.gltf`) + registo honesto de `.skp` original | Planeada |
| **Fase 05** | Operação de equipa: tarefas (lista/board acessível), calendário, departamentos, equipa e biblioteca | Planeada |
| **Fase 06** | Fila editorial de publicação, pré-visualização local do site e relatórios derivados | Planeada |
| **Fase 07** | Auditoria final UX, WCAG 2.2 AA, performance, i18n e regressão | Planeada |

## 3. Mapa de Rotas Previstas

- `/login` — Câmara de acesso interno demonstrativo (**activa na Fase 01**).
- `/welcome` — Caderno editorial de boas-vindas pós-login (**activa na Fase 01**).
- `/workspace` — Destino autenticado do percurso de entrada (**frame funcional de recepção de sessão na Fase 01**; mesa de trabalho completa na Fase 02).
- `/workspace/projects`, `/workspace/projects/new`, `/workspace/projects/:id`, `/workspace/projects/:id/model` — Módulo central de projectos e 3D (Fases 03–04).
- `/workspace/tasks`, `/workspace/calendar`, `/workspace/departments`, `/workspace/team`, `/workspace/library` — Operação de atelier (Fase 05).
- `/workspace/publications`, `/workspace/activity`, `/workspace/reports`, `/workspace/settings` — Editorial, síntese e preferências (Fases 02–06).

## 4. Papéis Demonstrativos (`Role`)

1. `director` — Direcção Conjunta (visão transversal, prioridades e aprovação final editorial).
2. `architect` — Arquitectura & Urbanismo (dossiers, cortes, maquetes e modelos 3D).
3. `project_manager` — Gestão de Projectos (marcos, prazos, atribuições e coordenação).
4. `department_lead` — Coordenação Departamental (alocação técnica e revisões).
5. `communications` — Comunicação & Editorial (curadoria de portfólio PT/EN e pedidos de publicação).
6. `staff` — Equipa Técnica & Investigação (tarefas atribuídas, referências e documentação).

> **Aviso obrigatório na UI:** A selecção de papéis altera apenas a vista e os controlos demonstrativos no navegador; não constitui controlo de acesso real nem protecção de dados.
