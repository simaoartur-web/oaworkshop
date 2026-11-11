# Registo de Decisões Arquitecturais (`DECISIONS.md`)

## ADR-001 — Isolamento em Repositório Independente (`oaworkspace`)
- **Data:** 2026-11-07 · **Estado:** Aceite
- **Contexto:** O repositório público `oaworkshop` proíbe painel administrativo e backend em `AGENTS.md`.
- **Decisão:** Criar `oaworkspace` como directório e repositório Git autónomo ao lado de `oaworkshop`, em branch própria (`codex/feat-phase-00-01-entry-experience`), sem tocar num único ficheiro de `oaworkshop`.
- **Risco residual:** A reutilização do monograma oficial `logo.png` e `favicon.png` é feita por cópia estática controlada para evitar dependências cruzadas entre pastas.

## ADR-002 — Stack Frontend Enxuta (React 19 + TypeScript + Vite 7 + Tailwind v4)
- **Data:** 2026-11-07 · **Estado:** Aceite
- **Contexto:** Alinhar família técnica com a equipa O+A mantendo arranque rápido, tipagem estrita e ausência de kits genéricos.
- **Decisão:** Usar React 19, TypeScript estrito, React Router v7, Tailwind CSS v4 com tokens próprios (`tokens.css`), Framer Motion (com respeito integral a `useReducedMotion`) e Lucide React com traço fino (`1.25px`). Não importar bibliotecas de componentes pré-estilizados (shadcn, MUI, AntD).

## ADR-003 — Composição de Entrada: Prancha de Corte & Câmara de Acesso
- **Data:** 2026-11-07 · **Estado:** Aceite
- **Contexto:** `/login` e `/welcome` definem o carácter arquitectónico do produto e não podem parecer templates SaaS nem prejudicar o acesso diário.
- **Decisão:** Adoptar a **Composição A** documentada em `docs/DESIGN_BRIEF.md`: divisão assimétrica 58/42 em `/login` com alternância entre estudo fotográfico e corte técnico ortogonal SVG + índice visível de 6 perfis demo; caderno editorial 7/5 em `/welcome` com atalho imediato no topo e preferência persistente `skipWelcomeOnLogin`.

## ADR-004 — Sessão Demonstrativa Honesta e Zero Passwords em Storage
- **Data:** 2026-11-07 · **Estado:** Aceite (Endurecido na Fase 02A)
- **Contexto:** O protótipo não possui backend nem autenticação criptográfica real.
- **Decisão:** Persistir apenas `{ userId, role, authenticatedAt, mode: 'local-demo' }` e preferências de interface em `localStorage`. Nunca guardar palavras-passe. Na Fase 02A, `loadDemoSession` elimina automaticamente entradas corrompidas ou adulteradas de `localStorage` e `/login` utiliza redireccionamento declarativo sem dupla navegação.

## ADR-005 — Estudos Visuais Dedicados em Vez de Obras Reais Não Confirmadas
- **Data:** 2026-11-07 · **Estado:** Aceite
- **Contexto:** A especificação proíbe reutilizar nomes ou fotografias de projectos reais da empresa sem confirmação e exige protagonismo arquitectónico.
- **Decisão:** Utilizar estudos espaciais e de maquete gerados especificamente para o arquivo demonstrativo interno (`public/assets/studies/*.webp`), acompanhados de desenhos técnicos vectoriais (SVG) e identificados explicitamente como `Estudo Espacial Demo`.

## ADR-006 — Workspace Shell Desacoplado e Contrato de Integração com Argon B
- **Data:** 2026-11-08 · **Estado:** Aceite (Fase 02A)
- **Contexto:** O Shell principal (`/workspace/*`) e a página operacional `StudioDeskPage` são desenvolvidos em paralelo por Argon A e Argon B.
- **Decisão:** Encapsular toda a moldura de navegação (`ArchitecturalRail`, `ContextualHeader`, `GlobalSearchDialog`, `NotificationsPopover`) num componente `WorkspaceShell` montado sobre uma rota-pai protegida por `RequireDemoSession`, fornecendo tanto `<Outlet />` como suporte opcional a `children`. O índice `/workspace` aloja `WorkspaceEntryGatePage` na Fase 02A para substituição directa e isolada por `{ StudioDeskPage }` na integração.

## ADR-007 — Regra de Saudação por Base de Estúdio e Detecção Dinâmica `CET`/`CEST`
- **Data:** 2026-11-08 · **Estado:** Aceite (Fase 02A)
- **Contexto:** A Fase 01 usava `date.getHours()` (hora local do dispositivo) e fixava `'CET'` literalmente para Milão, falhando em horário de verão europeu (`CEST`) ou quando o utilizador acede fora do fuso do seu estúdio.
- **Decisão:** Calcular a hora do colaborador e a data editorial estritamente no fuso IANA oficial da sua `studioBase` (`Africa/Maputo` ou `Europe/Rome`, com `Maputo` como eixo por omissão) e determinar `CET` (`UTC+1`) vs `CEST` (`UTC+2`) matematicamente a partir dos componentes zonados da data via `Intl.DateTimeFormat`.

## ADR-008 — Confinamento Modal via Portal React + Neutralização `inert` do Fundo
- **Data:** 2026-11-08 · **Estado:** Aceite (Fase 02A)
- **Contexto:** Diálogos e drawers renderizados dentro da árvore principal podem permitir que leitores de ecrã ou `Tab`/`jsdom` escapem para controlos exteriores, ou perderem a referência de retorno do foco durante re-renders do componente-pai.
- **Decisão:** Centralizar a gestão modal em `useDialogFocusTrap`: renderizar o modal/drawer num portal em `document.body`, aplicar `inert` e `aria-hidden="true"` aos restantes filhos visíveis de `document.body` enquanto aberto, confinar `Tab`/`Shift+Tab`/`Escape`/`focusin` com referência estável (`onCloseRef` via efeito) e remover `inert` **antes** de devolver o foco ao elemento desencadeador no fecho.

## ADR-009 — Arquitectura de Scroll Independente do Shell, Navegação por Disponibilidade e Contraste AA em Texto Terracota
- **Data:** 2026-11-11 · **Estado:** Aceite (Fase 02.1A)
- **Contexto:** `overflow-x: hidden` aplicado em `html` e `body` forçava `overflow-y: auto` implícito sobre `body`, anulando `position: sticky` na barra lateral (`ArchitecturalRail`) e no cabeçalho (`ContextualHeader`). Em paralelo, a navegação misturava secções activas e futuras sob etiquetas técnicas (`F03`, `F05`, `F06`), e texto pequeno em `#A65D4A` sobre fundos escuros situava-se abaixo de 4,5:1.
- **Decisão:** Substituir `overflow-x: hidden` por `overflow-x: clip`; fixar o shell desktop (`lg:h-dvh lg:overflow-hidden`) com scroll independente para `<nav>` lateral (`min-h-0 overflow-y-auto`) e contentor `#workspace-main-scroll` (`scrollbar-gutter: stable`), preservando scroll natural de documento abaixo de `1024px` (incluindo zoom `200%`); gerir reposição de scroll para transições `PUSH`/`REPLACE` e restauro em `POP` (Back); agrupar o rail por **Disponível agora** (`Studio Desk`, `Definições`) vs. **Em breve** em linguagem simples; e introduzir `--oa-accent-text` (`#CE826D`, ≥ 5,9:1) para micro-texto terracota mantendo `#A65D4A` em acentos estruturais e botões com texto branco.
