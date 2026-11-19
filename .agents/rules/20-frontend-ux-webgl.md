---
trigger: glob
globs: "**/src/app/App.tsx, **/src/app/routePreload.ts, **/vite.config.ts, **/index.html, **/src/design-system/**/*.ts, **/src/design-system/**/*.tsx, **/src/design-system/**/*.css, **/src/features/loading/**/*.tsx, **/src/features/auth-demo/**/*.tsx, **/src/features/welcome/**/*.tsx, **/src/features/workspace-shell/**/*.tsx, **/src/features/studio-desk/**/*.tsx, **/src/features/project-experience/**/*.tsx, **/src/features/model-viewer/**/*.ts, **/src/features/model-viewer/**/*.tsx, **/src/features/model-engine/ModelEngineStageSlot.tsx, **/src/features/model-engine/ProjectModelEnginePage.tsx, **/src/features/workspace/**/*.tsx, **/src/locales/**/*.ts, **/src/utils/timeGreeting.ts"
---

# Regras de Frontend, UX, Acessibilidade & WebGL (`@agent-b`)

Aplicam-se a alterações de interface, roteamento, chunking, design system, i18n e visualizador 3D:

1. **Identidade O+A:** Seguir `docs/DESIGN_SYSTEM.md` e `docs/DESIGN_BRIEF.md` («um atelier, não um dashboard»; `#050505`, `#111111`, `#222222`, `#A65D4A`; `Outfit` e `Playfair Display`). Não introduzir bibliotecas UI genéricas nem linguagem desonesta de backend/cloud.
2. **WCAG 2.2 AA rigoroso:**
   - Contraste mínimo `4,5:1` para texto normal: usar `--oa-accent-text` (`#CE826D`, `≥ 5,9:1`) em micro-texto terracota sobre superfícies escuras e texto branco (`#FFFFFF`, `4,90:1`) sobre fundos `#A65D4A` (nunca `#050505` sobre `#A65D4A`).
   - Modais e drawers devem usar focus trap com portal + `inert` (`useDialogFocusTrap`), `Escape` e restauro de foco.
   - Evitar paragens de foco invisíveis em inputs `sr-only` (`tabIndex={-1}`, `aria-hidden="true"`) e manter atributos ARIA válidos (`aria-expanded`/`aria-controls`, `role="status"`, `role="alert"`).
   - Respeitar `prefers-reduced-motion` e propagar `reduceMotionOverride` a toda a interface, incluindo o palco WebGL 3D.
3. **Chunking, Shell persistente e recuperação de erros:**
   - Preservar `WorkspaceShell` (`<header>`, `<nav>`, sessão) entre navegações lazy e garantir reset/restauro determinístico de scroll.
   - Qualquer `RouteChunkErrorBoundary` deve limpar também o handle `createRetryableLazy` rejeitado quando o utilizador navega para outra rota (`resetKey`), evitando erro preso ao regressar.
   - Envolver mutações de UI ligadas ao repositório (incluindo Arquivar/Restaurar) em `try/catch` com feedback acessível `[role="alert"]`.
4. **Isolamento 3D/WebGL e performance visual:**
   - Garantir `0 B` de `vendor-three` e `vendor-r3f` fora de `/workspace/projects/:id/model` e `0` dependências circulares em `vite.config.ts`.
   - Preservar `disposeThreeObjectResources`, limpeza de `ObjectURL`, recuperação de `webglcontextlost` e evitar waterfalls evitáveis em recursos bloqueantes (`index.html` / palco 3D).
5. **Responsividade e Bilinguismo:** Sem overflow horizontal em `375px`, `768px` e `1440px`; manter paridade estrita de chaves entre `src/locales/pt.ts` e `src/locales/en.ts`.
