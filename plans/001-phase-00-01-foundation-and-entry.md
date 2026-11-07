# Plano 001 — Fase 00 (Direcção de Arte e Arquitectura) & Fase 01 (Login e Welcome Page)

- **Branch:** `codex/feat-phase-00-01-entry-experience`
- **Estado:** Em execução / verificação final da Fase 01
- **Fronteira de paragem:** Não avançar para a Fase 02 sem avaliação explícita do utilizador sobre a experiência de entrada.

## 1. Objectivos Verificáveis

1. **Fase 00:**
   - Isolar `oaworkspace` fora de `oaworkshop` (confirmar `git status` limpo em `oaworkshop`).
   - Documentar `DESIGN_BRIEF.md` (duas composições contrastantes avaliadas e escolha fundamentada), `DESIGN_SYSTEM.md`, `PRODUCT_SPEC.md`, `MOCK_DATA_CONTRACTS.md`, `INTEGRATION_FUTURE.md`, `DECISIONS.md`, `AGENTS.md` e `PROJECT_MAP.md`.
   - Definir tokens CSS canónicos (`#050505`, `#111111`, `#222222`, `#A65D4A`, `#FFFFFF`, cinzentos acessíveis, `Outfit` + `Playfair Display`, curva `[0.22, 1, 0.36, 1]`).
2. **Fase 01:**
   - `/login`: composição assimétrica de atelier, monograma oficial O+A adaptado a fundo escuro, alternância PT/EN, validação específica não destrutiva, mostrar/ocultar palavra-passe, Enter-to-submit, diálogo honesto de palavra-passe esquecida, selector explícito de 6 perfis demo, alternância entre fotografia de estudo e corte técnico SVG, relógio operacional Maputo/Milão e layout mobile/tablet dedicado.
   - `/welcome`: caderno editorial pós-login com saudação ajustada à hora do dia, perfil e departamento demo, projecto de estudo em destaque (maquete + sobreposição técnica), prioridades por papel, CTA «Entrar no Workspace», atalho rápido «Ir directamente para o workspace» e preferência local «Saltar introdução nas próximas entradas».
   - `/workspace`: destino funcional de fecho do percurso `/login -> /welcome -> /workspace`, com estado real da sessão demo, troca de perfil/idioma, inversão da preferência de welcome, reset de dados demo e logout funcional para `/login` (sem construir prematuramente os módulos da Fase 02+).

## 2. Riscos Identificados e Mitigação

- **Contraste do monograma `logo.png` em fundo `#111111`:** resolvido com variante luminosa controlada (`invert(1)`) e fallback tipográfico.
- **Peso das imagens de estudo:** converter `.jpg` para `.webp` optimizado via `sharp` antes do build.
- **Contraste WCAG 2.2 AA em microtipografia:** usar `#BDBDBD` e `#9E9E9E` (≥ 6,8:1 em `#111111`) em vez de opacidades baixas ilegíveis.
- **Armazenamento indevido de credenciais:** testes unitários verificam que nenhuma chave de `localStorage` contém o campo `password` ou o valor da palavra-passe.

## 3. Verificações Obrigatórias

- [x] `npm run lint` sem erros nem avisos.
- [x] `npm run test` (Vitest: 7/7 testes aprovados cobrindo paridade PT/EN, saudação horária, guardas de rota, validação não destrutiva, diálogo honesto de palavra-passe, percurso `/login -> /welcome -> /workspace -> logout`, `skipWelcomeOnLogin`, reset e invariante zero-password em `localStorage`).
- [x] `npm run build` (`tsc -b && vite build` concluído com code splitting por rota).
- [x] Verificação E2E real em browser Chromium (`1440×900`, `768×1024`, `375×812`) com capturas visuais de `/login`, `/welcome` e `/workspace`, zero overflow horizontal, `prefers-reduced-motion`, zero pedidos externos de API e `oaworkshop` intacto.
