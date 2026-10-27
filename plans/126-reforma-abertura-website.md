# Plano 126 — Reforma da abertura do website (R01 e Revisão R01.1)

> **Estado R01 (base):** IMPLEMENTADO em `codex/feature-hero-opening-reform` (commit `cf5b15e`)
> **Estado Revisão R01.1:** CANÓNICO em `codex/feature-hero-opening-reform`
> **Data:** 2026-10-27
> **Branch:** `codex/feature-hero-opening-reform`

## Objectivo

1. **R01 (concluída em `cf5b15e`):** reproduzir a estrutura base do slide 2 (`#ED7D31`, quatro elementos centrados, sem nomes dos fundadores e com entrada para `#workshop`).
2. **Revisão R01.1 (concluída):** evoluir a abertura implementada para a direcção visual premium do protótipo de referência, refinando a hierarquia tipográfica em `Outfit`, recuperando a pulsação suave (*heartbeat*) do logótipo acompanhada por anéis concêntricos subtis (*ripple*) e reintroduzindo o indicador minimalista de deslocação (*chevron* inferior), sem alterar a cor `#ED7D31` nem interferir nas restantes secções.

---

## Revisão R01.1 — Refinamento premium da abertura, tipografia e animação interactiva

### 1. Contexto e precedência

- **Branch e commit de partida:** branch `codex/feature-hero-opening-reform`, commit `cf5b15e` (`feat(hero): reform website opening to match slide 2 specification`).
- **Árvore de trabalho:** preserva intactas todas as alterações locais não comitadas do Plano 125 (`WorkshopSection.tsx`, `WorkshopTabs.tsx`, `workshop.css` e `plans/125-workshop-showcase-editorial.md`).
- **Precedência:** esta Revisão R01.1 substitui as disposições da R01 que proibiam a pulsação do logótipo, os anéis concêntricos, o indicador inferior de deslocação e o uso de maiúsculas espaçadas em `"WE ARE"`. Mantêm-se inalteradas a exclusão dos nomes dos fundadores na abertura, a cor exacta `#ED7D31` e a ausência de texturas ou escurecimento de fundo.

### 2. Medições do protótipo de referência (`1024 × 576`, escala `16:9` → `1440 × 810`)

| Elemento | Medição no protótipo (`1024 × 576`) | Equivalência desktop (`1440 × 810`) | Implementação R01.1 verificada (`1440 × 805`) |
|---|---|---|---|
| **Cor de fundo** | Laranja uniforme | `#ED7D31` (`RGB(237, 125, 49)`) | `rgb(237, 125, 49)` (`--color-hero-bg: #ED7D31`) uniforme |
| **Elemento A (`"WE ARE"`)** | `Y = 159..167`, `X = 462..558` (`W = 97 px`), centrado em `X = 510` | `font-size ≈ 16–18 px`, `~45 px` acima do logótipo | `Outfit`, maiúsculas, peso `300`, `16.56 px`, `letter-spacing: 6.96 px` (`0.42em`), `#FFFFFF` |
| **Elemento B (Logótipo `O+A`)** | `Y = 199..338` (`H = 140 px`), `X = 415..616` (`W = 202 px`) | `~284 × 197 px` (`19,7%` da largura, `24,3%` da altura) | `/logo.png` nítido (`filter: none`), `283.85 × 201.37 px`, com `hero-heartbeat` e anéis concêntricos `.hero-ripple-ring` |
| **Elemento C (`"ARCHITECTS AND PLANNERS"`)** | `Y = 364..371`, `X = 379..645` (`W = 267 px`), `26 px` abaixo do logótipo | `font-size ≈ 14–16 px`, `~36 px` abaixo do logótipo | `Outfit`, maiúsculas, peso `300`, `14.69 px`, `letter-spacing: 4.41 px` (`0.3em`), `#FFFFFF`, largura `302.89 px` |
| **Elemento D (`"Click on O+A to start"`)** | `Y = 476..486` (`82,6%` da altura), `X = 429..594` | `font-size ≈ 16–19 px`, posicionado acima do chevron inferior | `Outfit`, peso `300` com `<strong className="font-semibold">O+A</strong>` (`600`), `18 px`, `letter-spacing: 1.08 px` (`0.06em`), `#FFFFFF` |
| **Elemento E (Indicador inferior — Chevron)** | `Y = 522..530` (`91,3%` da altura), `X = 505..519` | `~20 px`, traço fino (`strokeWidth = 1.25`), centrado junto à margem inferior | Botão acessível com ícone `ChevronDown` (`size = 20`, `strokeWidth = 1.25`), `.hero-chevron-float` e avanço para `#workshop` |

### 3. Verificações realizadas na Revisão R01.1

- **`npm run lint`:** concluído sem erros nem avisos.
- **`npm run build`:** concluído com sucesso (`tsc -b && vite build`).
- **`git diff --check`:** sem erros de formatação ou *whitespace*.
- **Verificação visual e comportamental no navegador (`375 px`, `768 px`, `1440 px` em EN e PT):**
  1. **Cor de fundo exacta:** `rgb(237, 125, 49)` (`#ED7D31`) confirmada em todos os formatos; `--color-terracota: #A65D4A` intacto nas restantes secções.
  2. **Coerência tipográfica:** `Outfit` (`font-sans`) aplicada em todos os textos da abertura com pesos `300` (`font-light`) e `600` (`font-semibold` apenas em `O+A` dentro do convite) e compensação óptica do `letter-spacing` (`pl-[var(--tracking-*)]`) para alinhamento rigoroso ao centro do logótipo.
  3. **Pulsação (*Heartbeat*) e *Ripple*:** animação `hero-heartbeat` (`scale: 1 -> 1.04 -> 1`, ciclo `3.8s`) e 3 anéis concêntricos + onda expansiva (`hero-ripple-*`) centrados no símbolo e executados exclusivamente por `transform` e `opacity`.
  4. **Hover, clique e teclado:** o logótipo, o convite `"Click on O+A to start"` e o *chevron* inferior deslocam suavemente a página até `scrollY = 805` (`#workshop.offsetTop`) e transferem foco para `#workshop`. Durante a transição (`data-entering="true"`), a pulsação fica suspensa para não competir com o movimento.
  5. **Redução de movimento (`prefers-reduced-motion: reduce`):** verificado via emulação CDP que `animationName` passa a `"none"` no logótipo e nos anéis, a onda expansiva oculta-se (`display: "none"`) e o scroll passa a instantâneo (`auto`).
  6. **Paridade PT/EN e zero regressões:** testados EN (`WE ARE` / `ARCHITECTS AND PLANNERS` / `Click on O+A to start`) e PT (`SOMOS` / `ARQUITECTOS E PLANEADORES` / `Clique em O+A para começar`), sem barras horizontais (`scrollWidth <= innerWidth`), `0` erros na consola e restantes secções intactas.

### 4. Diferenças explicadas face à imagem do protótipo e limitações conhecidas

1. **Cor pura `#ED7D31` vs. vinheta/gradiente do protótipo rasterizado:** a imagem do protótipo apresenta uma ligeira variação de iluminação entre o centro e os cantos (`RGB(240, 122, 41)` nos cantos). Em cumprimento estrito da Secção 4 (*«A cor da abertura deve permanecer exatamente #ED7D31 ... não escurecer e não introduzir gradientes no fundo principal»*), o fundo foi mantido em `#ED7D31` uniforme.
2. **Contraste WCAG 2.2 AA (`2,77 : 1`):** o texto branco `#FFFFFF` em peso `300` sobre `#ED7D31` permanece abaixo dos limiares normativos WCAG 2.2 AA (3,0:1 / 4,5:1). Foi preservada a paleta oficial aprovada com opacidade a 100%, mantendo documentadas as alternativas caso se pretenda priorizar o rácio normativo numa etapa futura.
