# Plano 004 — Fase 02.1A · Architectural Shell · UX Navigation & Scroll Refinement

- **Agente:** Argon A
- **Worktree exclusivo:** `oaworkspace-f021-shell`
- **Branch exclusiva:** `codex/f021-shell-ux`
- **Commit base de referência:** `3b9881dbbe59a3c507e7306030ba405d4e3f4570` (`codex/f02-integration-preview`)
- **Estado:** Concluído e verificado (correcções arquitecturais P0/P1 do Shell, navegação e acessibilidade)
- **Fronteira de responsabilidade:**
  - Âmbito próprio: `src/features/workspace-shell/**`, `src/design-system/tokens.css`, `src/app/App.tsx` (gestão de rotas e scroll), `src/features/workspace/**`, `src/locales/**` (etiquetas do Shell), testes do Shell e E2E.
  - Ficheiros preservados intactos (Argon B / Fase 01): `src/features/studio-desk/**`, `src/data/studioDeskFixtures.ts`, `src/data/studioDeskTypes.ts`, `src/test/studioDesk.test.tsx`. Sem alterações a `main`, ao site público `oa-workshop.com` ou branches SEO.

---

## 1. Diagnóstico Arquitectural do Problema P0 (Sidebar & Scroll)

Na baseline `3b9881d`, ao percorrer verticalmente páginas longas (ex.: `/workspace` com `StudioDeskPage`):

1. **`overflow-x: hidden` em `html` e `body` (`src/design-system/tokens.css`):** de acordo com a especificação CSS Overflow, declarar `overflow-x: hidden` força o eixo perpendicular (`overflow-y`) de `body` a computar como `auto`. Como `body` tem `min-height: 100dvh` sem limite máximo, expande-se com o conteúdo e cria um contentor de scroll implícito que invalida `position: sticky; top: 0` em `<aside>` (`ArchitecturalRail`) e `<header>` (`ContextualHeader`). Em consequência, a barra lateral sai do ecrã durante o scroll vertical da página e deixa um vazio inferior após os primeiros `100dvh`.
2. **Falta de `min-h-0` na coluna flex da `<nav>` lateral (`ArchitecturalRail.tsx`):** em janelas desktop de altura reduzida (ex.: `1440×680`, zoom `125%`), a ausência de `min-h-0` impede o scroll interno independente da lista de navegação e empurra o controlo inferior de recolha da prancha para fora do viewport.
3. **Reset de scroll desacoplado (`src/app/App.tsx`):** `ScrollResetOnRouteChange` reinicia apenas `window.scrollTo(0, 0)`, pelo que um contentor interno de scroll no desktop requer sincronização explícita por rota/histórico (`PUSH`/`REPLACE` vs `POP`) sem perturbar a posição da barra lateral nem o foco de teclado.

---

## 2. Arquitectura de Solução

### A. P0 — Estrutura Robusta de Scroll e Fixação do Shell (`WorkspaceShell.tsx`, `ArchitecturalRail.tsx`, `ContextualHeader.tsx`, `tokens.css`)

1. **`src/design-system/tokens.css`:**
   - Substituir `overflow-x: hidden` por `overflow-x: clip` em `html` e `body`, evitando contentores de scroll implícitos e permitindo `position: sticky` fiável em `/login`, `/welcome` e `/workspace` em mobile/tablet.
   - Adicionar `scroll-padding-top: 72px` em `html` para âncoras e o atalho `#workspace-main-content`.
   - Adicionar token `--oa-accent-text` com contraste WCAG 2.2 AA (`>= 4.5:1`) sobre fundos escuros (`#090909`–`#181818`), mantendo `#A65D4A` para bordas, indicadores, acentos activos e botões com texto branco.
2. **`WorkspaceShell.tsx`:**
   - Em desktop (`>= 1024px` / `lg:`): fixar o contentor raiz do shell à altura do viewport (`lg:h-dvh lg:overflow-hidden`), com:
     - Coluna esquerda (`ArchitecturalRail`): `lg:h-full` garantindo fundo contínuo `#090909` e hairline vertical constante em toda a altura sem área vazia.
     - Coluna direita (`flex-1 min-w-0 flex flex-col lg:h-full lg:min-h-0`): `<ContextualHeader>` em `shrink-0` no topo e viewport de trabalho `#workspace-main-scroll` em `flex-1 min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-gutter:stable]` que contém `<main id="workspace-main-content">` e o rodapé técnico (`<footer>`), eliminando saltos horizontais ao expandir/recolher e impedindo sobreposição de conteúdo pelo cabeçalho.
   - Em tablet/mobile (`< 1024px`, incluindo zoom a `200%` sobre `1440px`): preservar `min-h-dvh` com scroll natural de documento sem aprisionamento e `<ContextualHeader>` com `sticky top-0 z-30` funcional.
3. **`ArchitecturalRail.tsx`:**
   - Adicionar `min-h-0 overscroll-contain` na `<nav>` lateral desktop para assegurar scroll próprio em alturas reduzidas sem ocultar o cabeçalho ou rodapé do rail.

### B. P0 — Reavaliação de Navegação, Disponibilidade e Orientação (`shellNavigation.ts`, `ArchitecturalRail.tsx`, `ContextualHeader.tsx`, `PlannedModuleView.tsx`, `pt.ts`/`en.ts`)

1. **Agrupamento orientado por disponibilidade real vs. futura:**
   - **Grupo 1 — Disponível Agora / Available Now:** `Studio Desk` (mesa principal, activa) e `Definições` / `Settings` (preferências locais da sessão demo, activas).
   - **Grupos 2 e 3 — Em Breve (Módulos Futuros) / Coming Soon (Unavailable Now):** secções estruturadas por domínio (`Operação de Atelier` e `Editorial & Análise`) claramente identificadas como indisponíveis nesta etapa com etiqueta legível **`Em breve`** (`PT`) / **`Soon`** (`EN`) e estilo subordinado, mantendo códigos `F03`/`F05`/`F06` apenas nos metadados técnicos e pesquisa.
2. **Regresso imediato à Mesa de Trabalho (`Studio Desk`):**
   - `Studio Desk` no topo absoluto da navegação; migalha contextual interactiva (`Link` para `/workspace`) no `ContextualHeader` em subpáginas; faixa de regresso directo quando o utilizador está numa secção planeada ou em `/workspace/settings`.
3. **Experiência do Rail Recolhido (`72px`) e Mobile/Tablet (`< 1024px`):**
   - Indicador claro de activo vs. disponível vs. em breve; etiqueta visual flutuante fora do fluxo `overflow-y-auto` em hover/focus no modo compacto (sem `overflow` clipping), com rótulo completo acessível (`aria-label`) e tamanho mínimo legível (`>= 11px`).
   - Drawer mobile com distinção explícita de módulos disponíveis agora vs. em breve e separadores de grupo com contraste reforçado.

### C. P1 — Scroll Inter-rotas, Foco e Modais (`App.tsx`, `WorkspaceShell.tsx`)

- Sincronizar reinício de scroll para `#workspace-main-scroll` em transições `PUSH`/`REPLACE` entre rotas `/workspace/*`, restaurando posição registada em navegação `POP` (Back/Forward do browser) e mantendo a posição do scroll da barra lateral intacta.
- Garantir funcionamento limpo do atalho `#workspace-main-content` (focus + scroll ao topo sem ocultar cabeçalho) e camada modal via portal acima de toda a UI.

### D. P1 — Contraste e Legibilidade (`tokens.css` & componentes Shell)

- Garantir tamanho mínimo efectivo `>= 11px` em etiquetas técnicas (eliminando `9px`/`10px` pouco legíveis) e elevar texto secundário/metadados para `>= 4.5:1` sobre `#090909` / `#111111` / `#141414`.

---

## 3. Verificações Executadas (`codex/f021-shell-ux`)

- `npm run lint` (`eslint .`) -> passou sem avisos nem erros.
- `npm run test` (`vitest run`) -> `5` ficheiros, `43/43` testes aprovados (incluindo agrupamento/disponibilidade na prancha lateral e reset/restauro de `#workspace-main-scroll` em `PUSH`/`POP`).
- `npm run build` (`tsc -b && vite build`) -> build limpo em `28.87s`.
- `npm run test:e2e` (`node scripts/e2e-verify-entry.mjs`) -> aprovado (`0` erros de consola/rede; verificação de não truncamento na rail a `264px`, scroll completo até ao fundo a `1440×900`, tooltip não cortado em modo compacto a scroll `750px`, altura reduzida `1440×680`, reflow zoom `200%` a `720×450`, tablet `768px`, mobile `375px` e navegação inter-rotas + `Back` do navegador).
