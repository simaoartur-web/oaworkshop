# Plano 134 — Performance de Imagens, Autoplay do Slideshow e Refinamento de Fades (R06)

**Estado:** EXECUTADO (Validações concluídas com sucesso)  
**Branch:** `codex/r06-performance-autoplay-images`  
**Data:** 2026-10-29  
**Missão:** R06 — Corrigir o congelamento do slideshow, implementar pipeline de otimização de imagens com Sharp no build, melhorar o crossfade e a continuidade visual entre secções, preservando a SEO-01.

---

## 1. Diagnóstico do Slideshow (Etapa 1)

Foi realizada a inspeção técnica de `src/components/home/WorkshopSection.tsx` e `src/components/home/WorkshopTabs.tsx`. Identificaram-se as causas reais do congelamento do slideshow:

1. **Bloqueio permanente por foco (`onFocusCapture` / `onBlurCapture`):**
   - O contentor principal possui `onFocusCapture={() => setIsPausedByInteraction(true)}`.
   - O painel activo `.workshop-panel` possui `tabIndex={0}`. Quando o visitante clica no painel ou navega por teclado até às abas ou botões, o foco é capturado.
   - O evento `onBlurCapture` só repõe `isPausedByInteraction(false)` se `!event.currentTarget.contains(event.relatedTarget)`. Ao clicar fora para elementos não focáveis ou na barra de scroll, `relatedTarget` é nulo em diversos motores de renderização, ou o foco permanece na secção após uma selecção de aba, mantendo `isPausedByInteraction = true` permanentemente.
2. **Ausência de temporizador de retoma (Idle Resume):**
   - Ao passar o rato (`onPointerEnter`) ou clicar nas setas/abas, o slideshow pausava sem nenhum temporizador para retomar a rotação automática quando o utilizador ficasse inativo.
3. **Threshold do `useInView(sectionRef, { amount: 0.3 })`:**
   - Em ecrãs móveis pequenos (com altura reduzida), a secção tem altura superior a 700 px; exigir 30% visível em simultâneo com a barra do navegador aberta podia falhar a ativação do autoplay durante o scroll.
4. **Ausência de controlo visual Play/Pause:**
   - As chaves de tradução `playSlideshow` e `pauseSlideshow` existiam em `en.ts` e `pt.ts`, mas não havia um botão acessível para o visitante visualizar o estado da rotação ou pausar/reproduzir manualmente.

---

## 2. Solução e Arquitetura Técnica

### 2.1. Temporizador Central Robusto do Slideshow (Etapa 2)
- **Ciclo contínuo de 8 segundos (`8000ms`):**
  - Rotação estrita: `+ Architecture` → `+ Urban Planning` → `+ Research` → `+ Architecture`.
- **Gestão de estados de pausa:**
  - **Pausa manual permanente:** Botão explícito Play/Pause nos controlos do palco com ícones de `lucide-react` (`Play` / `Pause`) e acessibilidade completa (`aria-label`, foco visível, teclado).
  - **Pausa temporária por interação:** Ao passar o rato ou focar os controlos/abas, pausa a rotação; após 8 segundos de inatividade sem interação, o temporizador retoma a rotação contínua automaticamente, impedindo congelamentos eternos.
  - **Visibilidade da página:** Pausa com `document.hidden` e retoma instantaneamente ao regressar ao separador.
  - **Visibilidade na viewport:** `IntersectionObserver` com threshold equilibrado (`0.15`), garantindo funcionamento fiável em desktop e mobile.
  - **Acessibilidade:** Desativação automática se `prefers-reduced-motion: reduce`.

### 2.2. Pipeline Automático de Imagens com Sharp (Etapa 3)
- **Instalação de `sharp`** como dependência de desenvolvimento (`devDependencies`).
- **Criação de `scripts/optimize-images.mjs`:**
  - Processa todas as fotografias em `public/images/` (incluindo `portfolio/`, `workshop-about/`, `team/`).
  - Converte ficheiros originais pesados (ex.: `office-space.png` com 2,27 MB, `workshop-architecture.jpg` com 1,07 MB) para o formato moderno **WebP** com compressão de alta qualidade visual (qualidade 82-85%, strip de metadados desnecessários).
  - Gera variantes responsivas quando aplicável (desktop, tablet, mobile) e versões optimizadas no mesmo diretório.
  - Facilita a inclusão futura de fotografias de colaboradores: qualquer nova fotografia adicionada a `public/images/team/` é automaticamente convertida no build seguinte.
  - Redução estimada do payload de imagens de **~14 MB** para **menos de 1,5 MB** (>89% de redução de transferência).
- **Integração no build do projeto:**
  - Atualização do script em `package.json`:
    `"build": "node scripts/optimize-images.mjs && tsc -b && vite build && node scripts/prerender.mjs"`.
  - Suporte nos componentes via `<picture>` com `<source type="image/webp">` e fallback nativo, sem exigir descarregar ficheiros pesados antes de converter no navegador.

### 2.3. Refinamento Visual — Crossfade e Continuidade (Etapa 4)
- **Crossfade arquitectónico suave no Workshop:**
  - Transição de opacidade simultânea (900ms com curva cúbica `[0.22, 1, 0.36, 1]`) com subtil drift de escala (`1.02` → `1.0`), garantindo que a imagem anterior se mantém visível por baixo até a nova estar 100% visível, eliminando qualquer flash preto.
- **Continuidade cromática e ritmo editorial:**
  - Transição suave entre `#ED7D31` (Hero) → `#070707` (Workshop) → `#090909` (+ Workshop institucional) → `#090909` (Portfolio) → `#0b0b0b` (Our Team) → `#111111` (Contact).
  - Divisórias lineares discretas e alinhamentos geométricos preservados.

---

## 3. Ficheiros a Alterar e Criar

| Ficheiro | Tipo | Responsabilidade |
|---|---|---|
| `package.json` | Modificação | Adicionar `sharp` em `devDependencies` e incluir script de optimização no build |
| `scripts/optimize-images.mjs` | Criação | Script de conversão e optimização de imagens com Sharp |
| `src/components/home/WorkshopSection.tsx` | Modificação | Temporizador central de 8s, botão Play/Pause, lógica de retoma automática por inatividade |
| `src/components/home/workshop.css` | Modificação | Estilos do botão Play/Pause e aperfeiçoamento do crossfade entre fotografias |
| `src/components/home/StudioAboutSection.tsx` | Modificação | Uso de variantes WebP otimizadas |
| `src/components/home/ProjectsSection.tsx` | Modificação | Uso de variantes WebP otimizadas no Portfolio |
| `src/components/home/TeamSection.tsx` | Modificação | Uso de backdrop WebP otimizado |
| `PROJECT_MAP.md` | Modificação | Atualizar mapa com novo script e responsabilidades |
| `plans/134-performance-imagens-autoplay-fades.md` | Criação | Registo formal do plano e verificações |

---

## 4. Plano de Testes e Validação (Etapa 5)

1. **Teste do Temporizador e Autoplay:**
   - Validar rotação contínua ao longo de 3 ciclos completos (mínimo 24 segundos) sem bloqueios.
   - Testar interação com hover, setas e abas, verificando que o slideshow retoma após inatividade.
   - Testar alternância entre Play e Pause através do novo botão manual.
   - Testar suspensão em segundo plano (`visibilitychange`) e `prefers-reduced-motion`.
2. **Teste de Performance e Otimização:**
   - Medir tamanho total das imagens antes e depois da conversão Sharp.
   - Testar carregamento com rede lenta simulada (Slow 4G) e cache desativada.
3. **Validação Responsiva e Visual:**
   - Testes visuais em `360 px`, `375 px`, `768 px` e `1440 px` em `ENG` e `PT`.
   - Verificação de ausência de overflow horizontal (`scrollWidth <= innerWidth`).
4. **Verificações Automáticas:**
   - `npm run lint`
   - `npm run build` (incluindo pré-renderização estática do SEO-01)
   - `git diff --check`


---

## 5. Resultados e Métricas Obtidas (Etapa 5)

### 5.1. Rotação Contínua e Autoplay (Edge CDP Headless)
- **Ciclo completo verificado (25,5s):**
  - T0: `+ Architecture`
  - T + 8.5s: `+ Urban Planning`
  - T + 17.0s: `+ Research`
  - T + 25.5s: `+ Architecture` (retorno contínuo ao início do ciclo)
- **Controlo manual Play/Pause:**
  - Botão integrado com ícones `Play` / `Pause` de `lucide-react` e atributos `aria-label` / `aria-pressed`.
  - Em pausa manual: permaneceu estável por 9s sem rotação inesperada.
  - Em retoma manual: rotação retomada perfeitamente.
- **Navegação manual Next/Prev:**
  - Controlos `workshop-nav-btn-next` e `workshop-nav-btn-prev` funcionais, registando interação sem bloquear o temporizador central.
- **Prevenção de congelamento por foco / hover:**
  - Idle recovery timer de 8 segundos restaura a rotação automática após inatividade do utilizador.
- **Erros no console:** 0 erros.

### 5.2. Otimização de Imagens com Sharp (Pipeline de Build)
- **Tamanho total das imagens públicas:**
  - **Antes:** 14,18 MB
  - **Depois:** 2,59 MB
  - **Redução total de transferência:** **81,7% (11,58 MB economizados)**
- **Principais reduções individuais:**
  - `office-space.png`: 2,17 MB → `office-space.webp`: 170,97 KB (**-92,3%**)
  - `founders-portrait.png`: 1,25 MB → `founders-portrait.webp`: 105,74 KB (**-91,7%**)
  - `artur.png`: 1,95 MB → `artur.webp`: 96,08 KB (**-95,2%**)
  - `osvaldo.png`: 1,95 MB → `osvaldo.webp`: 97,43 KB (**-95,1%**)
  - `workshop-architecture.jpg`: 1,02 MB → `workshop-architecture.webp`: 338,46 KB (**-67,7%**)
  - `portfolio/metita-house.jpg`: 761,34 KB → `portfolio/metita-house.webp`: 134,19 KB (**-82,4%**)
  - `portfolio/nelson-house.jpg`: 766,70 KB → `portfolio/nelson-house.webp`: 168,99 KB (**-78,0%**)
  - `portfolio/professor-house.jpg`: 763,53 KB → `portfolio/professor-house.webp`: 170,83 KB (**-77,6%**)
  - `portfolio/wagner-house.jpg`: 747,01 KB → `portfolio/wagner-house.webp`: 144,38 KB (**-80,7%**)
- **Componentes atualizados para `<picture>` com WebP e fallback:**
  - `WorkshopSection.tsx` (fotografias do palco)
  - `StudioAboutSection.tsx` (fotografia do estúdio e retrato dos fundadores)
  - `ProjectsSection.tsx` (6 projetos do portfolio)
  - `TeamSection.tsx` (backdrop arquitetónico)

### 5.3. Responsividade e Continuidade Visual
- **Viewports testados:** 360 px, 375 px, 768 px, 1440 px.
- **Transbordo horizontal (`overflow`):** Falso em todos os ecrãs (`document.documentElement.scrollWidth <= window.innerWidth`).
- **Artefactos visuais gerados:**
  - `r06-workshop-architecture-1440.png`
  - `r06-workshop-urbanism-1440.png`
  - `r06-workshop-mobile-375.png`
