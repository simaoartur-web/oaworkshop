# Plano 126 — Reforma da abertura do website (R01)

> **Estado:** CONCLUÍDO
> **Data:** 2026-10-26
> **Branch:** `codex/feature-hero-opening-reform`
> **Aprovação:** aprovado pelo utilizador («Aprovado») em 2026-10-26

## Objectivo

Reproduzir fielmente a abertura institucional definida no slide 2 do ficheiro de referência `OA.pptx` (`HeroSection`), aplicando a cor de fundo exacta `#ED7D31`, a composição minimalista de quatro elementos (`we are`, logótipo `O+A`, `ARCHITECTS AND PLANNERS` e `Click on O+A to start`), a padronização tipográfica em `Outfit` e a interacção acessível de entrada para `#workshop`, sem interferir nas restantes secções do website.

## Contexto e diagnóstico do estado inicial

### 1. Estado do repositório e Git

- **Branch inicial:** `codex/feature-workshop-showcase` (`HEAD` em `4fa4aee`, alinhado com `main`).
- **Branch criada para esta reforma:** `codex/feature-hero-opening-reform`.
- **Árvore de trabalho:** preservadas integralmente todas as alterações locais do Plano 125 (`WorkshopSection.tsx`, `WorkshopTabs.tsx`, `workshop.css` e `plans/125-workshop-showcase-editorial.md`).

### 2. Diagnóstico de `HeroSection.tsx` face ao slide 2

| Aspecto | Implementação anterior | Especificação do slide 2 (`OA.pptx`) | Implementação realizada |
|---|---|---|---|
| Cor de fundo | `bg-terracota` (`--color-terracota: #A65D4A`) | Laranja uniforme `#ED7D31` — `RGB(237, 125, 49)` | Criado token `--color-hero-bg: #ED7D31` aplicado exclusivamente à abertura |
| Texturas e sobreposições | Textura externa, escurecimento no scroll (`overlayOpacity` até `0.95`) e 3 camadas de brilho radial | Fundo plano e uniforme `#ED7D31`, sem texturas, gradientes ou vinhetas | Removidos textura granulada, overlay de scroll e brilhos radiais |
| Elemento A (`we are`) | `W E   A R E` em maiúsculas, `tracking-[0.4em] md:tracking-[1em]`, `text-white/80`, afastado do logótipo | `we are` em minúsculas, branco sólido (`#FFFFFF`), `Outfit` semibold (`600`), próximo do topo do logótipo | Padronizado em `Outfit` `600`, `#FFFFFF`, minúsculas, `clamp(1.125rem, 1.65vw, 1.5rem)` |
| Elemento B (Logótipo `O+A`) | `/logo.png` sobredimensionado (`384 px`), filtros `brightness-110 contrast-[1.05]`, `blur(10px)` e animação `heartbeat` | `/logo.png` centrado, sem filtros nem animações contínuas (`~276 px` em `1440 × 805`) | `/logo.png` com `filter: none`, `clamp(11rem, 19.2vw, 17.5rem)` e `max-h-[26vh]` |
| Nomes dos fundadores e divisória | `Osvaldo Luís \| Artur Simão` em `Playfair Display` itálico e linha animada | Ausentes na abertura | Retirados da abertura; dados dos fundadores mantidos em `src/data/team.ts` e `src/locales/` |
| Elemento C (`ARCHITECTS AND PLANNERS`) | Abaixo dos nomes dos fundadores, `text-white/60`, `tracking-[0.4em]` | Imediatamente abaixo do logótipo, branco `#FFFFFF`, `Outfit` regular (`400`), maiúsculas | Posicionado logo abaixo do símbolo em `#FFFFFF`, `clamp(0.75rem, 1.18vw, 1.0625rem)`, `tracking: 0.04em` |
| Elemento D (`Click on O+A to start`) | Ícone `ChevronDown` animado num `<motion.div>` sem semântica de botão | Texto centrado na zona inferior em branco sólido com destaque em **O+A** | Botão acessível com frase traduzível PT/EN e `<strong className="font-bold">O+A</strong>` |
| Interactividade e destino | `window.scrollTo` para `window.innerHeight` com `smooth` fixo | Clique ou teclado no logótipo (e na frase inferior) avança para `#workshop` respeitando `prefers-reduced-motion` | Ambos os botões avançam para `#workshop`, transferem foco e respeitam `prefers-reduced-motion` |

### 3. Auditoria do sistema tipográfico (Secção 5)

1. **Famílias instaladas (`src/index.css`):**
   - `--font-sans`: `"Outfit", "system-ui", "sans-serif"` (pesos `100;200;300;400;500;600;700`).
   - `--font-serif`: `"Playfair Display", "serif"` (`0,400;0,700;1,400`).
2. **Usos actuais de `Playfair Display` (`font-serif`):**
   - Retirado de `HeroSection.tsx` (que passa a usar exclusivamente `Outfit`).
   - Permanece em `src/components/home/ProjectsSection.tsx` (linha 114, símbolo `+` na metodologia) e `src/components/home/TeamAvatar.tsx` (linha 36, iniciais de reserva).
3. **Incoerências noutras secções documentadas para a próxima etapa (não alteradas nesta tarefa):**
   - *Faux-italic* em `Outfit` (`italic` sem `font-serif`) em `Header.tsx` (linhas 199, 207, 215, 223) e `CategoryMapSection.tsx` (linha 320).
   - Micro-tamanhos arbitrários sub-12px (`text-[8px]` a `text-[11px]`) em `Header.tsx`, `CategoryMapSection.tsx`, `NewsSection.tsx`, `ProjectsSection.tsx` e `StatsSection.tsx`.
   - Divergência de pesos em títulos `h2`: `font-light` (`300`) na base, `400` em `WorkshopSection` e `font-bold uppercase` (`700`) em `CategoryMapSection.tsx` e `ProjectsSection.tsx`.
   - `tracking-wide` (`0.025em`) aplicado globalmente no `body`.

## Ficheiros modificados

- `src/index.css`: adicionados `--color-hero-bg: #ED7D31` e os tokens tipográficos `--text-hero-greeting`, `--text-hero-discipline`, `--text-hero-prompt`, `--tracking-hero-discipline` e `--tracking-hero-prompt`.
- `src/components/home/HeroSection.tsx`: reconstruída a abertura fiel ao slide 2 com os quatro elementos, tipografia `Outfit`, semântica de botões e transição para `#workshop`.
- `src/locales/en.ts`: actualizado `hero.weAre` (`"we are"`), preservados `hero.osvaldo` e `hero.artur`, e adicionados `hero.startPromptPrefix`, `hero.startPromptBrand`, `hero.startPromptSuffix`, `hero.enterAriaLabel` e `hero.logoAlt`.
- `src/locales/pt.ts`: paridade estrutural com `en.ts` (`"somos"`, `"Clique em "`, `"O+A"`, `" para começar"`, `enterAriaLabel` e `logoAlt`).
- `PROJECT_MAP.md` e `plans/README.md`: actualizados com a nova responsabilidade da abertura e o estado deste plano.

## Verificações realizadas

- `npm run lint`: concluído sem erros nem avisos.
- `npm run build`: concluído com sucesso (`tsc -b && vite build`); mantêm-se apenas os avisos pré-existentes de Browserslist e do chunk JS > 500 kB.
- `git diff --check`: sem erros de whitespace.
- **Verificação visual e DOM no navegador (Edge headless via CDP em `http://localhost:5173/`):**
  - Larguras testadas: `375 × 812 px` (telemóvel), `768 × 1024 px` (tablet) e `1440 × 805 px` (computador), em EN e PT.
  - Cor de fundo computada: `rgb(237, 125, 49)` (`#ED7D31`) confirmada em todas as larguras.
  - Fonte computada: `Outfit, "system-ui", "sans-serif"` em todos os elementos da abertura.
  - Escala do logótipo em `1440 × 805`: `276,47 × 204,14 px` (`filter: none`), fiel aos `275,6 × 196 px` da referência proporcional do slide 2.
  - Zero deslocação horizontal (`scrollWidth <= innerWidth` em `375 px`, `768 px` e `1440 px`).
  - Interacção: clique e activação no logótipo deslocam `window.scrollY` de `0` para `805` (`#workshop.offsetTop`) e transferem foco para `#workshop`.
  - Idiomas EN (`we are` / `ARCHITECTS AND PLANNERS` / `Click on O+A to start`) e PT (`somos` / `ARQUITECTOS E PLANEADORES` / `Clique em O+A para começar`) verificados.
  - Consola do navegador: `0` erros.
  - Restantes secções (`#workshop`, `#architecture`, `#urbanism`, `#research`, `#team`, `#contact`): intactas.

## Registo de decisões e desvios

- Mantida a paleta fiel ao slide 2 (`#ED7D31` com texto `#FFFFFF` a 100% de opacidade, rácio de contraste `2,77:1`), registando a limitação face ao limiar WCAG 2.2 AA e mantendo disponíveis as alternativas de ajuste caso a direcção pretenda priorizar o rácio normativo sobre a cor original do slide.

## Resultado

- Reforma da abertura (R01) implementada, validada e comitada na branch `codex/feature-hero-opening-reform`, aguardando validação final do utilizador antes de qualquer integração em `main`.
