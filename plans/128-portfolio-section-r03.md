# Plano 128 — Reforma da secção `+ PORTFOLIO` (R03)

> **Estado:** CONCLUÍDO
> **Data:** 2026-10-27
> **Branch prevista:** `codex/feature-hero-opening-reform`
> **Aprovação:** aprovado pelo utilizador em 2026-10-27 (`"Aprovado"`)

## Objectivo

Implementar a secção **`+ PORTFOLIO`** conforme o slide de referência anexado pelo utilizador (`media_1793087543476_b0d04527.jpg`), integrando as 5 fotografias oficiais fornecidas e mantendo o 6.º espaço com marcador visual de ponto de interrogação (`?`) para adição posterior.

---

## Âmbito implementado

1. **Cabeçalho e Barra de Filtros (`+ PORTFOLIO`):**
   - Título principal em maiúsculas: `+` em laranja (`#ED7D31`) + `PORTFOLIO` em branco puro (`font-weight: 700`).
   - Barra horizontal de 8 categorias separadas por `/`:
     `Show all / Architecture / Urban Planning / Competitions / Interior design / landscaping / furniture / Heritage`
   - Sublinhado laranja (`#ED7D31`) sob o filtro activo (`Show all` por omissão) e filtragem interactiva dos cartões por disciplina.
2. **Grelha 3×2 de Projectos (6 Cartões em Desktop):**
   - **Cartão 1:** `Professor House - Architecture` | `Maputo, Mozambique 2026` (`public/images/portfolio/professor-house.jpg`).
   - **Cartão 2:** `Metita House - Architecture + landscape` | `Maputo, Mozambique 2026` (`public/images/portfolio/metita-house.jpg`).
   - **Cartão 3:** `Nelson House - Architecture + interior design` | `Maputo, Mozambique 2026` (`public/images/portfolio/nelson-house.jpg`).
   - **Cartão 4:** `Wagner House - Architecture + landscape + interior design` | `Maputo, Mozambique 2026` (`public/images/portfolio/wagner-house.jpg`).
   - **Cartão 5:** `Wagner House - Architecture + landscape + interior design` | `Maputo, Mozambique 2026` (`public/images/portfolio/wagner-house-2.jpg` — residência com parede cobogó em terracota).
   - **Cartão 6:** `Wagner House - Architecture + landscape + interior design` | `Maputo, Mozambique 2026` (`public/images/portfolio/wagner-house-3.jpg` — residência com cobogó azul e pérgola de madeira).
   - Em cada cartão: barra vertical laranja (`2px`, `#ED7D31`) à esquerda do bloco de legenda.

---

## Ficheiros alterados

- `src/components/home/ProjectsSection.tsx`
- `src/components/home/portfolio.css`
- `src/locales/pt.ts`
- `src/locales/en.ts`
- `public/images/portfolio/professor-house.jpg`
- `public/images/portfolio/metita-house.jpg`
- `public/images/portfolio/nelson-house.jpg`
- `public/images/portfolio/wagner-house.jpg`
- `public/images/portfolio/wagner-house-2.jpg`
- `public/images/portfolio/wagner-house-3.jpg`
- `PROJECT_MAP.md`
- `plans/128-portfolio-section-r03.md`
- `plans/README.md`

---

## Verificações realizadas

- `npm run lint`: concluído sem erros (`0 errors`).
- `npm run build`: compilação TypeScript (`tsc -b`) e bundle Vite concluídos com sucesso.
- `git diff --check`: sem erros de formatação.
- **Verificação visual e DOM via CDP (`1440×980`, `768×1024`, `375×812`):**
  - `headingText: "+ PORTFOLIO"`, `filtersCount: 8`, `cardsCount: 6` (5 com imagens completas + 1 com `placeholderMark: "?"`), `horizontalOverflow: false`, `consoleErrors: []`.
