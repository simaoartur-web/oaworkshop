# Release 01 — Publicação da versão reformulada no domínio principal

> **Estado:** CANÓNICO
> **Data:** 2026-10-27
> **Branch de origem:** `codex/feature-hero-opening-reform`
> **Aprovação:** autorizado pelo utilizador para integração em `main` e publicação em `https://www.oa-workshop.com/`

## Objectivo

Auditar, consolidar e publicar em produção (`main` → GitHub Actions → GitHub Pages em `https://www.oa-workshop.com/`) a versão reformulada da página inicial O+A Workshop compreendendo as fases aprovadas R01.1, R02.1, R03 e R04.

## Contexto e estado actual

- **R01.1 (`plans/126-reforma-abertura-website.md`):** abertura institucional `#ED7D31` com logótipo O+A interactivo e entrada para `#workshop`.
- **R02.1 (`plans/127-workshop-section-r02-1.md`):** carrossel interactivo das três áreas (`Architecture`, `Urban Planning`, `Research`) segundo o Protótipo 01 e os slides 3, 4 e 5 do `OA.pptx`.
- **R03 (`plans/128-portfolio-section-r03.md`):** secção `+ PORTFOLIO` com 8 filtros e grelha 3×2 com as 6 fotografias oficiais (`professor-house.jpg`, `metita-house.jpg`, `nelson-house.jpg`, `wagner-house.jpg`, `wagner-house-2.jpg`, `wagner-house-3.jpg`).
- **R04 (`plans/129-simplificacao-estrutural-r04.md`):** remoção das secções antigas (3× `CategoryMapSection` e `NewsSection`), mantendo exclusivamente `HeroSection` → `WorkshopSection` → `ProjectsSection` (`+ PORTFOLIO`) → `TeamSection` → `ContactSection` → `Footer`.

## Âmbito incluído

1. **Auditoria pré-publicação:**
   - Ocultação do número de telefone fictício `+258 000 000 000` em `src/components/home/ContactSection.tsx` e `src/components/layout/Footer.tsx` até existir contacto telefónico público confirmado.
   - Confirmação da presença dos 6 recursos visuais do Portfolio em `public/images/portfolio/`.
   - Promoção dos planos `126`, `127`, `128`, `129` e `130` ao estado `CANÓNICO` em `plans/README.md`.
2. **Verificações técnicas e visuais:**
   - Execução de `npm run lint`, `npm run build` e `git diff --check`.
   - Verificação visual em `375 px`, `768 px` e `1440 px`.
3. **Integração e publicação:**
   - Push da branch `codex/feature-hero-opening-reform` para `origin`.
   - Integração (`merge --no-ff`) em `main` e push para `origin/main`.
   - Acompanhamento do workflow `.github/workflows/deploy.yml` e verificação em `https://www.oa-workshop.com/`.

## Fora do âmbito

- Alterações funcionais ou de design fora da auditoria de pré-publicação.
- Eliminação automática da branch `codex/feature-hero-opening-reform`.

## Ficheiros previstos

- `src/components/home/ContactSection.tsx`
- `src/components/layout/Footer.tsx`
- `plans/126-reforma-abertura-website.md`
- `plans/127-workshop-section-r02-1.md`
- `plans/128-portfolio-section-r03.md`
- `plans/129-simplificacao-estrutural-r04.md`
- `plans/130-release-01-publicacao-dominio-principal.md`
- `plans/README.md`

## Verificações

- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`
- [x] Verificação visual em `375 px`, `768 px` e `1440 px`
- [x] Verificação da publicação em `https://www.oa-workshop.com/`

## Resultado

Versão canónica preparada, validada e integrada em `main` para publicação no domínio principal.
