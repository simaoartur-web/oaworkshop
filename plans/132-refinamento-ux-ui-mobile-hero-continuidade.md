# Refinamento UX/UI — Mobile, Hero e Continuidade Visual

> **Estado:** CANÓNICO
> **Data:** 2026-10-28
> **Branch prevista:** `codex/refine-ux-ui-mobile-continuity`
> **Aprovação:** aprovado pelo utilizador em 2026-10-28 (`Aprovado, e depois faça upload no site`)

## Objectivo

Aperfeiçoar a experiência mobile (`360 px`, `375 px`, `390 px`, `430 px`, `768 px`), recuperar na `HeroSection` a pulsação original com iluminação difusa sincronizada (referência `4fa4aee`, sem anéis concêntricos nem ondas circulares) e harmonizar a continuidade visual e cromática entre todas as secções da página inicial, preservando integralmente o design, os conteúdos e os recursos aprovados nas fases R01.1–R05.

## Diagnóstico e Âmbito Incluído

### 1. Hero (`src/components/home/HeroSection.tsx` e `src/index.css`) — Recuperação da pulsação original
- **Problema actual:** a revisão anterior introduziu 4 elementos `.hero-ripple-ring` com `border: 1px solid rgb(255 255 255 / 90%)`, criando anéis concêntricos e ondas circulares visíveis em torno do logótipo.
- **Solução proposta:**
  - Remover integralmente os 4 elementos `.hero-ripple-ring` (`--outer`, `--mid`, `--inner`, `--wave`) e respectivas `@keyframes` de borda circular.
  - Restaurar o sistema de iluminação difusa do commit `4fa4aee`:
    - `heartglow-outer`: gradiente radial branco difuso (`radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)`, `margin: -30%`, `4s cubic-bezier(0.25, 0.1, 0.25, 1) infinite`).
    - `heartglow-inner`: gradiente radial branco suave (`radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 40%, transparent 65%)`, `margin: -10%`, `4s cubic-bezier(0.22, 1, 0.36, 1) infinite`).
    - Halo ambiental subtil (`bg-white/5 blur-[90px] rounded-full scale-150`) sincronizado com a pulsação `heartbeat` (`scale(1)` → `scale(1.05)` → `scale(1)`) do logótipo O+A.
  - Preservar o fundo `#ED7D31`, os 4 elementos aprovados do Slide 2, a transição para `#workshop` e o suporte a `prefers-reduced-motion`.

### 2. Mobile (`360 px`, `375 px`, `390 px`, `430 px`, `768 px`) — Composição e ergonomia
- **Header (`src/components/layout/Header.tsx`):**
  - Ajustar espaçamento horizontal e altura em ecrãs estreitos (`px-4 sm:px-6 md:px-10`, `h-16 md:h-20`), garantindo alvos de toque confortáveis (`min-h-[44px]`) nos seletores de idioma, pesquisa e menu `+`, sem compressão em `360 px`.
  - Refinar o painel lateral do menu em mobile (`p-6 sm:p-10 md:p-14`, `px-6 sm:px-10 md:px-16`, `gap-6 md:gap-10`) para leitura imediata sem scroll excessivo.
- **Workshop (`src/components/home/workshop.css`):**
  - Em mobile (`< 768 px`), substituir o empilhamento vertical longo das 3 abas por uma barra horizontal compacta de 3 colunas (`grid-template-columns: repeat(3, minmax(0, 1fr))`) com indicadores lineares activos em laranja (`#ED7D31`) e altura de toque adequada (`min-height: 3.25rem`), mantendo o texto completo de destaque no palco principal da fotografia.
  - Dar maior impacto visual à fotografia activa em mobile (`min-height: clamp(25rem, 66svh, 32rem)`) e organizar o bloco inferior com controlos `< >` acessíveis (`2.75rem × 2.75rem`).
- **Secção Institucional `+ WORKSHOP` (`src/components/home/studio-about.css`) e `+ PORTFOLIO` (`src/components/home/portfolio.css`):**
  - Harmonizar margens laterais (`clamp(1.25rem, 3.8vw, 4rem)`), escala dos títulos (`clamp(2rem, 4.5vw, 3.85rem)`), áreas de toque dos 8 filtros (`min-height: 2.5rem`) e proporção dos cartões em mobile.
- **Team (`src/components/home/TeamSection.tsx`), Contact (`src/components/home/ContactSection.tsx`) e Footer (`src/components/layout/Footer.tsx`):**
  - Ajustar espaçamentos verticais em mobile (`py-16 md:py-28`) e padding do formulário (`p-6 sm:p-8 md:p-12`), alinhando a grelha editorial com as secções anteriores.

### 3. Continuidade Visual entre Secções
- **Problema actual:** saltos cromáticos bruscos (`#070707` → `#000000` → `#030303` → `#111111` → `#222222` → `#111111`) combinados com linhas `border-top` de largura total em todas as secções fazem cada área parecer um bloco isolado.
- **Solução proposta:**
  - Unificar a progressão de fundo escuro arquitectónico (`#060606` → `#080808` → `#0a0a0a` → `#0d0d0d` → `#111111` → `#090909`) com transições suaves.
  - Remover bordas divisórias redundantes de largura total entre `WorkshopSection`, `StudioAboutSection`, `ProjectsSection`, `TeamSection` e `ContactSection`, recorrendo ao ritmo espacial (`padding-block` proporcional) e alinhamento de contentor para separar secções com naturalidade editorial.

## Fora do Âmbito

- Alterar textos, fotografias, estrutura de dados ou rotas existentes.
- Reconstruir o layout desktop aprovado nas fases R01.1–R05.
- Publicar automaticamente em `main` sem revisão do utilizador.

## Ficheiros Previstos

- `plans/132-refinamento-ux-ui-mobile-hero-continuidade.md`
- `plans/README.md`
- `src/components/home/HeroSection.tsx`
- `src/index.css`
- `src/components/layout/Header.tsx`
- `src/components/home/workshop.css`
- `src/components/home/studio-about.css`
- `src/components/home/portfolio.css`
- `src/components/home/TeamSection.tsx`
- `src/components/home/ContactSection.tsx`
- `src/components/layout/Footer.tsx`

## Critérios de Aceitação e Verificações

- [x] `HeroSection` sem anéis concêntricos/ondas circulares (`rippleRingsCount: 0`) e com pulsação + iluminação difusa `heartglow-inner` / `heartglow-outer` sincronizada.
- [x] Verificação visual e de ausência de overflow horizontal (`overflow: false`) em `360 px`, `375 px`, `390 px`, `430 px`, `768 px` e `1440 px`, em PT e EN.
- [x] Verificação de menus, filtros, carrosséis, formulários, scroll e `prefers-reduced-motion` (`Console Errors: 0`).
- [x] `npm run lint`, `npm run build` e `git diff --check` sem erros.

## Resultado

Refinamento UX/UI concluído, validado nas 6 larguras em PT e EN e integrado em `main` para publicação no domínio principal `https://www.oa-workshop.com/`.
