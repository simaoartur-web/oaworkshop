# Plano 136 — Revisão Editorial, Visual e Funcional da Landing Page O+A (Novembro 2026)

> **Estado:** EM VALIDAÇÃO — Lotes 1, 2 e 3 implementados e verificados na branch `codex/feat-revisao-landing-oa-nov2026`; aguarda revisão final e declaração canónica pelo utilizador.
> **Data:** 2026-11-17
> **Base confirmada (`main`):** `e468fe7` (`merge: close SEO-03 production verification`)
> **Branch de execução:** `codex/feat-revisao-landing-oa-nov2026` (criada a partir de `codex/fix-slideshow-autoplay` @ `f934bbe` preservando o Plano 135 anterior e absorvendo as edições locais de slideshow)
> **Aprovação:** concedida em 2026-11-17 (`APROVADO: plans/136-revisao-landing-oa-nov2026.md`)
> **Documentos de referência:** `OA rev OL 161126.pdf` (9 páginas), [AGENTS.md](../AGENTS.md), [PROJECT_MAP.md](../PROJECT_MAP.md), [plans/README.md](README.md), [DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md), [OA_Design_Mastery_Playbook.md](../docs/OA_Design_Mastery_Playbook.md), [DESIGN_STUDY.md](../docs/DESIGN_STUDY.md), [QUALITY.md](../docs/QUALITY.md), [CONTENT_GUIDE.md](../docs/CONTENT_GUIDE.md), `ultimate-skills` v3.0.0.

---

## 1. Objectivo

Remodelar de forma incremental e sem reconstrução do zero a landing page O+A Workshop (`src/pages/Home.tsx`) e as rotas directamente articuladas, alinhando-as com o documento de revisão `OA rev OL 161126.pdf` (páginas 1 a 9), preservando a arquitectura React/Vite/Tailwind existente, o bilinguismo PT/EN e toda a infra-estrutura SEO-02/SEO-03 (pré-renderização estática, `canonical`, `hreflang`, `sitemap.xml` e JSON-LD `Organization`/`WebSite`).

---

## 2. Diagnóstico do Estado Actual (Factos Verificados)

### 2.1. Estado Git e preservação do Plano 135 anterior
- `main` e `origin/main` encontram-se em `e468fe7`, onde o último plano canónico é o `134-performance-imagens-autoplay-fades.md`.
- Na branch actual `codex/fix-slideshow-autoplay`, o [Plano 135](135-slideshow-autoplay-sem-playback.md) (`EM EXECUÇÃO`) trata da correcção inicial de autoplay e retirada de Play/Pause com alterações por commitar em `WorkshopSection.tsx`, `workshop.css`, `en.ts`, `pt.ts`, `PROJECT_MAP.md`, `docs/decisions/README.md` e `docs/decisions/0003-autoplay-workshop-sem-playback.md`.
- **Resolução adoptada após auditoria:** O Plano 135 anterior permanece preservado sem alteração de número nem descarte de trabalho, e esta proposta global passa a ocupar o número **`136`** (`plans/136-revisao-landing-oa-nov2026.md`), cumprindo a regra de não reutilização de números em [plans/README.md](README.md). O Lote 1 desta proposta absorve e evolui os requisitos de slideshow de `135` conforme o PDF (11–14 s, linha contínua progressiva e ausência de pausa por hover/foco/inactividade).

### 2.2. Auditoria secção a secção (Código vs. PDF)

| Área / Página PDF | Estado verificado no código (`main` / workspace) | Lacunas e divergências face ao PDF |
|---|---|---|
| **Abertura (Pág. 1)** | `HeroSection.tsx`: fundo `#ED7D31` (`--color-hero-bg`), texto `we are`, logótipo `/logo.png` escuro, `ARCHITECTS AND PLANNERS`, prompt `Click on O+A to start`, foco acessível ao entrar em `#workshop`. | Alinhado com a Pág. 1. Preservar integralmente durante todos os lotes. |
| **Header e Logótipo (Pág. 2)** | `Header.tsx`: barra fixa com opacidade ligada ao scroll (`0 → 1` entre `0` e `100px`) e ocultação ao descer (`y: -100%`). Usa `/logo.png` (692×511 RGBA com valores RGB médios ~20, grafismo escuro) com `brightness-110` sobre `#070707/60`. | Sobre a barra escura, o logótipo escuro tem visibilidade deficiente. A Pág. 2 pede expressamente o logótipo da barra superior em **branco** (também visível em branco nas Págs. 5 e 9). *(Nota: a lupa de pesquisa existente no Header não executa filtragem real e fica registada como pendência independente fora do Lote 1.)* |
| **Slideshow `#workshop` (Pág. 2)** | Em `main`: `WorkshopSection.tsx` contém `isPlaying`, botão Play/Pause, suspensão por `isHovered` e `isFocused` (bloqueando o avanço após entrada pelo Hero) e `SLIDE_DURATION_MS = 8000`. Em `codex/fix-slideshow-autoplay` (alterações locais não commitadas): remove Play/Pause mas mantém `8000 ms`, pausa por `isKeyboardFocused` e barras fixas de `56%` (`workshop.css` L287–309) sem preenchimento contínuo. | O PDF pede: (1) linha temporal visualmente **contínua** a preencher progressivamente durante a duração do slide; (2) remoção integral de Play/Pause; (3) **não interromper** a reprodução por hover, foco ou inactividade enquanto o visitante observa a secção; (4) temporização confortável de leitura (11–14 s iniciais); (5) manter selecção directa nos tópicos. Rever também acentuação/grafia nos textos PT (`Politecnico`, `Estrategico`, `junta-se GENO`). |
| **Secção `+ WORKSHOP` e `About` (Pág. 3)** | `StudioAboutSection.tsx` e `studio-about.css`: composição 70/30 funcional com `office-space.webp` e `founders-portrait.webp` + citação oficial. O texto `"About"` existe apenas como `<figcaption className="sr-only">` (`studioAbout.photoLabel`). Não existe botão visível nem rota `/about`. | Falta transformar `"About"` num botão/link real integrado arquitectonicamente no canto inferior esquerdo da fotografia (sem tapar quadro de giz, mesa ou cadeiras) a navegar para uma página institucional dedicada com **história, missão, visão e objectivos** em PT/EN. |
| **Portfólio e Cards (Págs. 4–5)** | Existem **duas fontes desconectadas**: (1) `ProjectsSection.tsx` na Home usa a constante local `PORTFOLIO_CARDS` (6 obras residenciais em Maputo com cópia em `locales.*.portfolio.items`) onde os cartões **não são clicáveis**; (2) `src/data/projects.ts` (`ALL_PROJECTS`) contém 12 projectos de demonstração internacionais (`editorialStatus: 'demo'`) consumidos por `/projects`, `/projects/:id`, `routes.ts`, `metadata.ts` e `prerender.mjs`. Em `portfolio.items`, os últimos 3 cartões repetem exactamente o mesmo título (`Wagner House - ...`), `wagner-house-3` tem todas as 7 categorias atribuídas e `pt.ts` tem filtros em inglês (`Show all`, `landscaping`) e `"Mozambique"` sem tradução. Não existe campo `client` no modelo nem modal quase-fullscreen. | Falta tornar os cartões da Home clicáveis abrindo um painel/modal imersivo (`~94vw × 90dvh` em desktop, adaptável em mobile) com imagem, título, localização, data, área, cliente e descrição disponíveis; sincronizar URL/histórico sem perder o scroll da Home (atenção ao `ScrollToTop` em `App.tsx` L15–31, que força `window.scrollTo(0, 0)` ao mudar `pathname`); unificar o modelo de dados em `src/data/projects.ts`; e aguardar/confirmar dados reais das fichas de obra pendentes. |
| **Equipa `Our Team` (Págs. 6–8)** | `TeamSection.tsx`, `TeamMember.tsx`, `TeamProfilePanel.tsx`, `src/data/team.ts`: mostra os dois fundadores em `Joint leadership` e usa o botão `Discover our team` para revelar os 6 colaboradores. Em `public/images/team/` já existem `osvaldo.webp` e `artur.webp`, mas `team.ts` mantém `image: null` e `bio: null`, e `en.ts`/`pt.ts` têm `bios: {}` vazios. `team.ts` lista `'Neide'` (sem `'Daude'`) e `roles` inclui `"Senior Architect & Urbanist"` que não consta das Págs. 6–8 do PDF. | Pág. 6: activar retratos B&W dos fundadores, corrigir `'Neide Daude'`, preservar `Discover our team` como interacção principal e tratar eventual movimento dos colaboradores apenas como opção secundária. Págs. 7–8: popular os perfis detalhados (`TeamProfilePanel`) de Osvaldo Luís e Artur Simão **estritamente** com os dados documentados nas Págs. 7–8 do PDF, removendo conteúdo profissional não documentado salvo confirmação expressa. |
| **Contactos e Footer (Pág. 9)** | `ContactSection.tsx` (formulário `mailto:` honesto para `oa@oa-workshop.com`, com moradas resumidas `"Milan, Italy"` e `"Maputo, Mozambique"`) e `Footer.tsx` (logótipo escuro, tagline curta, quick links, email, botão `Back to top`). Sem links de Políticas, sem endereços de rua, sem números de telefone. | A Pág. 9 consolida descrição institucional fundadora (Maio 2025), `POLICIES` (`Privacy Policy`, `Cookie Policy`, `Terms and Conditions`, `Code of Conduct`), `MAIN OFFICE` (Av. Metical, Q 10, Katembe, Maputo + dois telefones), `REPRESENTATIVE OFFICE` (Viale Renato Serra, Milano + telefone), e o bloco `Start a conversation.`. **Erro tipográfico detectado no PDF:** a Pág. 9 grafa `ao@oa-worshop.com`; deve manter-se o endereço canónico verificado `oa@oa-workshop.com`. |

---

## 3. Âmbito Incluído (Divisão em Três Lotes)

### Lote 1 — Identidade (Header/Logótipo), Slideshow Automático e About Interativo

#### 1.1. Header e Logótipo Branco
- Aplicar tratamento visual branco ao logótipo na barra superior (`Header.tsx`, drawer de navegação e posteriormente `Footer.tsx` / modal de projecto), mantendo `/logo.png` escuro na abertura (`HeroSection.tsx`) e nos metadados JSON-LD (`Organization.logo`).
- Opção técnica recomendada: classe CSS dedicada (ex.: `.oa-logo-white { filter: brightness-0 invert(1); }`) ou variante branca gerada via `sharp` se necessário, validada visualmente sobre `#070707` e sobre fotografia clara do slideshow.
- Auditar visibilidade inicial do `Header` no limite entre `#top` e `#workshop` para garantir leitura clara da barra superior ao entrar no slideshow.
- **Fora do âmbito obrigatório do Lote 1:** O comportamento do botão/campo de pesquisa do `Header` (`searchValue`) **não** integra os requisitos obrigatórios deste lote e fica registado em secção própria como **pendência independente**.

#### 1.2. Slideshow Automático Contínuo (`WorkshopSection`, `WorkshopTabs`, `workshop.css`)
- **Temporização e ciclo:** Definir `SLIDE_DURATION_MS` inicialmente na ordem dos **11–14 segundos (12 000 ms como ponto de partida)**, ajustável conforme leitura, sincronizando numa única fonte de verdade (`activeId` + ciclo temporal): imagem principal, etiqueta `DESTAQUE`, tópico, descrição e indicador de progresso.
- **Remoção total de Play/Pause:** Remover botão `.workshop-nav-btn-playback`, estado `isPlaying`, ícones `Play`/`Pause` e chaves de locale sem consumidores. Preservar as setas `<` `>` e a selecção directa nas 3 abas (`click` e teclado `ArrowLeft`/`ArrowRight`/`Home`/`End`).
- **Autoplay contínuo durante observação:** Não interromper a reprodução por `hover`, por `focus` (incluindo `:focus-visible` e foco programático vindo de `HeroSection`) nem por inactividade. O autoplay funciona continuamente enquanto `inViewport && pageVisible && !reducedMotion`. Ao seleccionar manualmente um tópico ou seta, muda imediatamente para o tópico escolhido e reinicia o ciclo completo a partir de 0%.
- **Linha temporal contínua com preenchimento progressivo (Pág. 2):**
  - Substituir as 3 linhas descontínuas de `56%` por uma linha contínua visualmente unificada ao longo das 3 colunas, com trilho base subtil (`rgba(255,255,255,0.18)`) e preenchimento progressivo terracota/laranja (`#ED7D31` / `--workshop-accent`).
  - Os segmentos anteriores ao tópico activo mantêm-se preenchidos durante o ciclo, o segmento activo anima suavemente `scaleX(0 → 1)` via propriedade GPU sincronizada com o temporizador de 11–14 s, e os restantes segmentos exibem o trilho base; ao reiniciar o ciclo, a linha reinicia suavemente sem saltos.
  - Em mobile (`<= 767px`), manter as 3 colunas compactas abaixo do palco sem empurrar o conteúdo principal para fora da dobra.
- **Crossfade e estabilidade:** Crossfade suave (`opacity` + micro-transição sem saltos nem CLS) e pré-carregamento da imagem seguinte.
- **Conflito WCAG 2.2 e movimento reduzido:**
  - Documentar formalmente em ADR (`docs/decisions/0003-autoplay-workshop-sem-playback.md` ou ADR associado) que a ausência de Play/Pause e a não-interrupção por hover/foco constituem uma excepção deliberada face ao critério **WCAG 2.2 SC 2.2.2 (Pause, Stop, Hide — Nível A)** para conteúdo automático com duração superior a 5 segundos, não podendo ser reportada conformidade AA nesse critério específico.
  - Preservar integralmente `prefers-reduced-motion: reduce`: desactivar o avanço automático e as animações contínuas (exibindo indicador estático no tópico activo), mantendo 100% da navegação manual acessível por abas, setas e teclado.

#### 1.3. Botão `About` Interativo e Página Institucional O+A (`/about`)
- **Botão `About` integrado em `StudioAboutSection.tsx` (Pág. 3):**
  - Substituir `<figcaption className="sr-only">` por um `<Link>` real estilizado e integrado arquitectonicamente no canto inferior esquerdo de `.studio-about-office-figure` (zona de sombra junto à base esquerda da fotografia, sem tapar o quadro de giz, a mesa, os computadores ou o centro da composição).
  - Tipografia coerente (`Outfit`), fundo/gradiente localizado para contraste **≥ 4,5:1**, acento terracota (`#ED7D31`), área mínima `44 × 44 px` e estados visíveis de `hover` e `:focus-visible`.
- **Página institucional dedicada (`/about`, `/en/about`, `/pt/about`):**
  - Criar `src/pages/About.tsx` seguindo tokens O+A (`Outfit` + `Playfair Display`, `#070707`/`#111111`, `#ED7D31`/`#A65D4A`, `container-custom`) para apresentar **história, missão, visão e objectivos** da O+A, utilizando **apenas conteúdos aprovados** em PT e EN.
  - Enquanto os textos de missão, visão e objectivos não forem fornecidos/aprovados, utilizar apenas factos institucionais já confirmados no PDF/repositório sem inventar prosa promocional.
  - Ligação clara no menu lateral (`Header.tsx`) e `Footer.tsx`, com registo em `src/App.tsx`, `src/seo/routes.ts`, `src/seo/metadata.ts`, `scripts/prerender.mjs` e actualização coordenada de `tests/seo-verification.test.mjs`.

---

### Lote 2 — Portfólio, Dados de Projectos e Cards Imersivos

#### 2.1. Unificação da Fonte de Dados e Saneamento de Metadados
- Mover `PORTFOLIO_CARDS` de `ProjectsSection.tsx` para `src/data/projects.ts`, num modelo unificado e tipado que suporte:
  - `id` (slug estável), `categories` (multi-categoria para os 8 filtros), `featuredOnHome`, `editorialStatus` (`'verified' | 'demo'`), `year` / `date`, `area`, `client`, `mainImage` / `imageWebp` / `thumbnail`, `imageIsPlaceholder`, e chaves de tradução em `src/locales/en.ts` e `src/locales/pt.ts`.
- **Saneamento pendente de confirmação editorial:**
  - Substituir os 3 cartões duplicados de `Wagner House` e a atribuição artificial de todas as 7 categorias a `wagner-house-3` assim que os dados reais das obras forem confirmados (ex.: *Design of a Family House in Katembe* da Pág. 5).
  - Harmonizar tradução PT em `portfolio.items` (`"Maputo, Moçambique 2026"`) e rótulos dos filtros conforme decisão bilingue, mantendo estado vazio limpo (`portfolio.emptyCategory`) para filtros sem obras atribuídas.

#### 2.2. Cards Clicáveis e Painel/Modal Imersivo Quase Fullscreen
- **Interacção dos cards:** Tornar cada cartão clicável com semântica acessível (`<Link>` com `href` real para `/projects/:id` localizado, interceptando o clique normal para abrir o modal e preservando Ctrl/Cmd+clique para abrir em nova aba).
- **Dimensões e responsividade:**
  - Desktop: painel/modal quase fullscreen sobre a landing page com dimensão de referência **`~94vw × 90dvh`** (`width: min(94vw, 1520px); height: min(90dvh, 960px)`), margens exteriores equilibradas e backdrop escuro (`rgba(5,5,5,0.88)` + `backdrop-filter: blur(8px)`).
  - Mobile (`< 768px`): apresentação imersiva adaptada e legível (`width: min(96vw, 100%); max-height: 94dvh`, respeito por `env(safe-area-inset-*)`).
- **Conteúdo do modal (Pág. 5, sem inventar dados):**
  - Fotografia principal (ou marcador neutro `?`), nome/título, localização, data, cliente, área e descrição — exibindo apenas os campos disponíveis para cada obra e omitindo campos ainda sem dados aprovados.
  - Estruturar através de componente modular partilhável com `ProjectDetail.tsx`, deixando a base pronta para acoplar os layouts individuais detalhados assim que forem partilhados.
- **Acessibilidade e preservação exacta do scroll:**
  - Scroll interno contido (`overflow-y: auto; overscroll-behavior: contain`) com bloqueio de scroll do documento de fundo e compensação de largura da barra de scroll (reutilizando o padrão de `TeamProfilePanel.tsx`).
  - Botão de fecho visível (`>= 44×44px`), clique fora controlado (`pointerDown` + `pointerUp`), tecla `Escape`, armadilha de foco (`Tab` / `Shift+Tab`) e restauro de foco ao cartão de origem.
  - **Ajuste obrigatório em `src/App.tsx` (`ScrollToTop`):** Reconhecer `location.state?.backgroundLocation` para impedir que a alteração de URL ao abrir ou fechar o modal dispare `window.scrollTo(0, 0)`, mantendo o visitante na mesma posição da secção `#portfolio`.

#### 2.3. Estratégia de URLs Individuais e SEO
- **Padrão `backgroundLocation` (React Router):**
  - Clique na Home navega para `/projects/:id` (ou `/en/projects/:id`, `/pt/projects/:id`) com `state={{ backgroundLocation: location }}`: actualiza o URL do browser, permite partilha directa e fecho pelo botão Voltar do browser mantendo a Home montada por baixo.
  - Acesso directo ao URL (nova aba, refresh ou motor de busca) renderiza `ProjectDetail.tsx` completo e pré-renderizado com `<DocumentHead />`, `canonical`, `hreflang` e metadados próprios.
- **Preservação SEO-02 / SEO-03:**
  - Manter `editorialStatus: 'demo'` → `noindex, nofollow` e alterar para `index, follow` apenas nas obras com `editorialStatus: 'verified'`, executando `scripts/prerender.mjs` e `tests/seo-verification.test.mjs` para validar zero regressões.

---

### Lote 3 — Equipa (`Our Team`), Contactos, Footer e Conteúdo

#### 3.1. Secção `Our Team` e Perfis dos Fundadores (Págs. 6–8)
- **Interacção principal e secundária (`TeamSection.tsx`):**
  - **Preservar `Discover our team`** (`isTeamExpanded` / painel `team-collaborators-panel`) como a **interacção principal** de revelação da equipa multidisciplinar.
  - **Movimento dos colaboradores apenas como opção secundária:** Caso a lista de colaboradores cresça ou haja confirmação posterior, considerar uma faixa horizontal em movimento suave (referência `geno.group/foundation`) dentro do painel expandido ou como variante secundária opcional, sempre com controlo explícito de pausa e conversão automática em grelha estática sob `prefers-reduced-motion: reduce`.
- **Retratos e correcções de equipa (`src/data/team.ts`):**
  - Ligar `osvaldo-luis` a `/images/team/osvaldo.webp` e `artur-simao` a `/images/team/artur.webp` (recursos B&W já presentes em `public/images/team/`), mantendo iniciais automáticas em `TeamAvatar` para colaboradores sem retrato autorizado.
  - Corrigir o nome `'Neide'` → `'Neide Daude'` (Pág. 6).
- **Perfis detalhados de Osvaldo Luís e Artur Simão — estritamente segundo Págs. 7–8 do PDF:**
  - **Regra obrigatória:** Incluir nos perfis (`TeamProfilePanel.tsx`) **exclusivamente** os títulos, qualificações e entradas cronológicas visíveis nas páginas 7 e 8 do PDF `OA rev OL 161126.pdf`. **Remover** quaisquer classificações não documentadas no PDF (como `"Senior Architect & Urbanist"` presente hoje em `locales.*.team.roles`, salvo confirmação expressa) e manter `bio: null` (prosa narrativa adicional) e `links: []` até aprovação explícita. Quaisquer entradas adicionais fora do que está visível nas págs. 7–8 não são consideradas verificadas e exigem confirmação prévia.
  - **Dados visíveis e confirmados para Osvaldo Luís (Págs. 6–7):**
    - Cargo / qualificações: `Managing Director` · `Architect and Planner`, `MSc in Regional and Urban Planning`, `MSc in Design for Development, Architecture, Urban Planning and Heritage`.
    - Cronologia (4 registos visíveis na Pág. 7):
      - `2026`: `MSc in Design for Development, Architecture, Urban Planning and Heritage in the Global South, Politecnico di Milano. Milan, Italy`
      - `2023`: `MSc in Regional and Urban Planning, Universidade Eduardo Mondlane, Maputo, Mozambique.`
      - `2018`: `Degree in Architecture and Physical Planning, Universidade Eduardo Mondlane, Maputo, Mozambique.`
      - `2025 - 2026`: `Architect and Urban Planner, AVSI Foundation, Nairobi, Kenya.`
  - **Dados visíveis e confirmados para Artur Simão (Págs. 6 e 8):**
    - Cargo / qualificações: `Technical Director` *(corrigindo `"TECNICAL"` da Pág. 6)* · `Architect, Planner and Lecturer`, `MSc in Regional and Urban Planning`.
    - Cronologia (5 registos visíveis na Pág. 8):
      - `2023`: `MSc in Regional and Urban Planning, Universidade Eduardo Mondlane. Maputo, Mozambique`
      - `2018`: `Degree in Architecture and Physical Planning, Universidade Eduardo Mondlane. Maputo, Mozambique`
      - `2025 - Present`: `Lecturer, Faculty of Architecture and Physical Planning, Eduardo Mondlane University, Mozambique. Maputo, Mozambique`
      - `2025 - 2026`: `Architect and WASH Consultant - UNICEF Mozambique. Maputo, Mozambique`
      - `2022 - 2026`: `Architect and Urban Planner, DELCAM / KPMG - Municipal Council of Maputo City, Mozambique. Maputo, Mozambique`
  - Traduzir estas entradas com fidelidade para PT em `src/locales/pt.ts`, mantendo nomes de instituições conforme política editorial. Qualquer cargo, registo cronológico adicional, texto biográfico ou link externo exige confirmação prévia.

#### 3.2. Contactos, Escritórios, Políticas e Footer (Pág. 9)
- **Consolidação `ContactSection.tsx` + `Footer.tsx`:**
  - **Coluna Institucional:** Logótipo O+A em branco, texto de fundação (Maio 2025, Osvaldo Luís e Artur Simão, *"workshop for ideas"*, Maputo e aberto ao mundo) + secção **POLICIES**.
  - **MAIN OFFICE — Maputo, Mozambique:** `Av. Metical, Q 10, Katembe, Maputo City, Mozambique`, telefones `tel:+258876569776` e `tel:+258847555427`, email canónico `oa@oa-workshop.com` (**preservando** o endereço correcto face ao lapso `ao@oa-worshop.com` na Pág. 9 do PDF).
  - **REPRESENTATIVE OFFICE — Milano, Italy:** `Viale Renato Serra, Milano, Italy`, telefone `tel:+393513531205`.
  - **Bloco `Start a conversation.`:** Manter âncora `#contact`, formulário compacto (`NAME *`, `EMAIL *`, `SUBJECT`, `MESSAGE *`, botão `CONTINUE IN EMAIL`) via `mailto:oa@oa-workshop.com` com aviso explícito (`contact.formHelp`, exigido por `docs/QUALITY.md` L40).
- **Políticas (`Privacy Policy`, `Cookie Policy`, `Terms and Conditions`, `Code of Conduct`):**
  - Respeitar `docs/QUALITY.md` L69: **não publicar links `#` mortos**. Criar rotas/conteúdos dedicados verídicos após aprovação do texto das 4 políticas pela O+A (ou manter os links omitidos/desacoplados até entrega dos textos aprovados).

---

## 4. Fora do Âmbito e Pendências Independentes

### Pendências independentes (não bloqueantes para o Plano 136)
- **Pesquisa no Header (`Header.tsx` — lupa / `searchValue`):** Retirada do âmbito obrigatório do Lote 1. Fica registada como iniciativa/pendência independente futura (decidir posteriormente entre ligar pesquisa local a projectos/secções ou remover o controlo inerte).
- **Movimento horizontal dos colaboradores (`Our Team`):** Opção secundária de evolução (referência `geno.group/foundation`) apenas após consolidação da lista real de colaboradores; não substitui `Discover our team`.

### Explicitamente fora do âmbito
- Criação de back-end, base de dados, CMS, autenticação ou envio de formulários via servidor (`AGENTS.md` § 3).
- Invenção de dados profissionais nos perfis dos fundadores ou colaboradores fora das Págs. 7–8 do PDF, invenção de metadados em falta de projectos, ou textos jurídicos não aprovados.
- Alteração directa em `main`, merge ou deploy para GitHub Pages antes de validação completa e declaração canónica.
- Adição de novas dependências npm.
- Layouts individuais detalhados de obras para além da estrutura base da Pág. 5 (ficam apenas preparados para acoplamento futuro).

---

## 5. Ficheiros Previstos por Lote

| Lote | Ficheiros a criar / alterar | Responsabilidade |
|---|---|---|
| **Transversal** | `plans/136-revisao-landing-oa-nov2026.md`, `plans/README.md`, `PROJECT_MAP.md`, `docs/decisions/0003-...md` | Registo de decisão WCAG 2.2 SC 2.2.2 e actualização documental |
| **Lote 1** | `src/components/layout/Header.tsx`, `src/index.css` | Logótipo branco no header/drawer e comportamento de entrada |
| **Lote 1** | `src/components/home/WorkshopSection.tsx`, `src/components/home/WorkshopTabs.tsx`, `src/components/home/workshop.css` | Remoção de Play/Pause, autoplay contínuo 11–14s (sem pausa por hover/foco/inactividade), linha contínua progressiva, `prefers-reduced-motion` |
| **Lote 1** | `src/components/home/StudioAboutSection.tsx`, `src/components/home/studio-about.css`, `src/pages/About.tsx` *(novo)* | Botão `About` integrado na fotografia + página institucional `/about` (PT/EN) |
| **Lote 1** | `src/App.tsx`, `src/seo/routes.ts`, `src/seo/metadata.ts`, `scripts/prerender.mjs`, `tests/seo-verification.test.mjs`, `src/locales/en.ts`, `src/locales/pt.ts` | Rotas `/about`, `/en/about`, `/pt/about`, metadados/sitemap e traduções Lote 1 |
| **Lote 2** | `src/data/projects.ts`, `src/components/home/ProjectsSection.tsx`, `src/components/home/portfolio.css` | Fonte única de dados, saneamento de filtros/títulos, cartões clicáveis |
| **Lote 2** | `src/components/home/PortfolioProjectModal.tsx` *(novo)*, `src/components/projects/ProjectShowcaseContent.tsx` *(opcional partilhado)*, `src/pages/ProjectDetail.tsx`, `src/App.tsx` | Modal `~94vw × 90dvh`, acessibilidade/teclado, preservação de scroll com `backgroundLocation` no `ScrollToTop`, links directos SEO |
| **Lote 2** | `src/locales/en.ts`, `src/locales/pt.ts`, `src/seo/metadata.ts`, `scripts/prerender.mjs` | Metadados de projecto (`client`, `date`, `area`, `description`) e pré-renderização |
| **Lote 3** | `src/data/team.ts`, `src/components/home/TeamSection.tsx`, `src/components/home/TeamMember.tsx`, `src/components/home/TeamProfilePanel.tsx`, `src/components/home/team.css` | Retratos `osvaldo.webp`/`artur.webp`, `Neide Daude`, preservação de `Discover our team`, CVs estritos das Págs. 7–8 (sem conteúdo extra não confirmado) |
| **Lote 3** | `src/components/home/ContactSection.tsx`, `src/components/layout/Footer.tsx`, `src/pages/Policies.tsx` *(se textos aprovados)* | Logótipo branco, moradas/telefones Maputo & Milão, email `oa@oa-workshop.com`, texto institucional, políticas e formulário |
| **Lote 3** | `src/locales/en.ts`, `src/locales/pt.ts`, `PROJECT_MAP.md` | Traduções completas PT/EN e actualização final do mapa |

---

## 6. Riscos, Conflitos e Salvaguardas

1. **Coexistência com o Plano 135 anterior (`codex/fix-slideshow-autoplay`):**
   - *Risco:* Misturar alterações locais de `135-slideshow-autoplay-sem-playback.md` com o Lote 1 de `136`.
   - *Salvaguarda:* Criar `codex/feat-revisao-landing-oa-nov2026` a partir de base limpa confirmada após decisão sobre `codex/fix-slideshow-autoplay`, mantendo o Plano 135 preservado sem perda de histórico.
2. **Conflito normativo WCAG 2.2 SC 2.2.2 (Pause, Stop, Hide):**
   - *Risco:* Slideshow contínuo de 11–14 s sem Play/Pause e sem pausa por hover/foco não cumpre WCAG 2.2 SC 2.2.2 (Nível A).
   - *Salvaguarda:* Decisão registada em ADR, paragem estática garantida em `prefers-reduced-motion: reduce`, e navegação manual completa acessível sem roubo de foco.
3. **Rigor factual nos perfis e conteúdos institucionais:**
   - *Risco:* Publicar cargos/experiências não confirmados nos perfis dos fundadores, textos fictícios em `/about`, obras `Wagner House` duplicadas ou links `#` em Políticas.
   - *Salvaguarda:* Limitar perfis dos fundadores estritamente às Págs. 7–8 do PDF; omitir campos ausentes de portfólio/políticas até entrega aprovada.
4. **Regressão de scroll ao abrir/fechar modal de portfólio:**
   - *Risco:* `ScrollToTop` em `App.tsx` repor `scrollY = 0` ao mudar para `/projects/:id`.
   - *Salvaguarda:* Suportar `backgroundLocation` em `ScrollToTop` e `<Routes>`, validando no navegador que a Home mantém exactamente o mesmo `scrollY`.
5. **Regressão SEO-02 / SEO-03 / Pré-renderização:**
   - *Risco:* Quebrar `tests/seo-verification.test.mjs` (contagem de URLs no sitemap, JSON-LD da raiz, `noindex` nos projectos demo).
   - *Salvaguarda:* Executar `npm run build` + `npm test` em cada lote, actualizando testes apenas para novas rotas indexáveis explicitamente aprovadas (ex.: `/about`).

---

## 7. Critérios de Aceitação por Lote

### Lote 1
- [x] Logótipo O+A no `Header` (barra fixa e menu lateral) visível em branco (`.oa-logo-white`) com contraste nítido.
- [x] Slideshow `#workshop` avança continuamente a cada `12 000 ms` (`12 s`, dentro de `11–14 s`) enquanto visível e activo, sem botão Play/Pause e sem pausa por hover, foco ou inactividade.
- [x] Linha temporal contínua preenche progressivamente sincronizada com imagem, tópico e destaque; clique manual muda imediatamente e reinicia o ciclo.
- [x] Com `prefers-reduced-motion: reduce`, slideshow e linha contínua permanecem estáticos, com navegação manual funcional (verificado em CSS/Framer Motion).
- [x] Botão `About` visível e bem contrastado sobre a fotografia de `+ WORKSHOP` sem tapar elementos-chave; clique abre `/about` (`/en/about`, `/pt/about`) com conteúdos aprovados baseados em factos verificados.
- [x] SEO, `canonical`, `hreflang`, pré-renderização e `tests/seo-verification.test.mjs` íntegros (5 URLs canónicos em `sitemap.xml`).

### Lote 2
- [x] Cartões do portfólio clicáveis (rato, toque, teclado) abrindo modal quase fullscreen (`~94vw × 90dvh` em desktop: medido `1353.59 × 810` a `1440 × 900`; imersivo e legível em mobile: `363.33 × 763.27` a `375 × 812`).
- [x] Modal exibe foto principal, título, localização, data, cliente, área e descrição disponíveis (sem dados inventados), com scroll interno, botão de fecho visível, `Escape`, armadilha e restauro de foco.
- [x] Posição de scroll da secção `#portfolio` preservada integralmente após fechar o modal (`scrollDeltaY = 0` tanto a partir de `/` como a partir de `/#studio-about`).
- [x] URL actualiza para `/projects/:id` (localizado) e links directos (`/projects/professor-house/`) carregam `ProjectDetail` pré-renderizado sem regressão SEO-02/SEO-03.
- [x] Filtros funcionam em PT/EN com estado vazio limpo quando aplicável.

### Lote 3
- [x] `Osvaldo Luís` e `Artur Simão` exibem retratos B&W (`osvaldo.webp`, `artur.webp`); `Neide Daude` corrigido; `Discover our team` preservado como interacção principal.
- [x] `TeamProfilePanel` exibe **apenas** os dados visíveis nas Págs. 7–8 do PDF para Osvaldo Luís (`4` registos) e Artur Simão (`5` registos) em PT/EN, sem conteúdo profissional não documentado.
- [x] Footer e Contactos exibem logótipo branco, descrição fundadora de Maio 2025, moradas e telefones clicáveis de Maputo e Milão e email canónico `oa@oa-workshop.com`, mantendo formulário `Start a conversation.` (`mailto:`) com aviso honesto. Links de Políticas mantidos omitidos até entrega dos 4 textos legais aprovados (evitando links `#` mortos).

---

## 8. Verificações Obrigatórias (após execução de cada lote)

1. `npm run lint`, `npm run build` (inclui `scripts/prerender.mjs`), `npm test` (`tests/seo-verification.test.mjs`) e `git diff --check`.
2. QA visual e funcional no navegador a **`375 px`**, **`768 px`** e **`1440 px`** em EN e PT (abertura `#top`, slideshow contínuo + selecção manual, `/about`, modal de portfólio e retorno sem salto de scroll, link directo `/projects/:id`, equipa `Discover our team` + perfis, contactos/políticas, consola sem erros, ausência de overflow horizontal).
3. Navegação integral por teclado (`Tab`, `Shift+Tab`, setas, `Enter`, `Escape`), verificação de contraste WCAG 2.2 AA e teste com `prefers-reduced-motion: reduce`.

---

## 9. Sequência de Implementação e Decisões Pendentes Antes do Arranque

Antes de emitir `APROVADO: plans/136-revisao-landing-oa-nov2026.md`, confirmar:

1. **Base Git de execução:** Confirmar criação de `codex/feat-revisao-landing-oa-nov2026` a partir de `main` (`e468fe7`) ou após resolução explícita da branch `codex/fix-slideshow-autoplay` (Plano 135).
2. **Conteúdos institucionais pendentes:** Textos aprovados para **Visão, Missão e Objectivos** (`/about`) e textos/destino das **4 Políticas** no rodapé.
3. **Dados das obras do Portfólio (Lote 2):** Títulos, categorias, datas, clientes, áreas e descrições para substituir as 3 entradas repetidas de `Wagner House` e preencher as fichas do modal.
4. **Confirmações editoriais pontuais:** Manutenção de `oa@oa-workshop.com` (corrigindo `ao@oa-worshop.com` da Pág. 9), revisão ortográfica em PT nos destaques (`Politécnico`, `Estratégico`), eventual confirmação sobre inclusão de `"Senior Architect & Urbanist"` ou remoção estrita conforme Págs. 6–8, e validação de qualquer dado profissional adicional nos perfis dos fundadores.

---

## 10. Registo de Decisões e Desvios

- **2026-11-17 (v1):** Análise integral do repositório e do PDF `OA rev OL 161126.pdf` (9 páginas) concluída sem alterações de código ou interface.
- **2026-11-17 (v2 — revisão de auditoria):** Proposta renumerada de `135` para `136` (`plans/136-revisao-landing-oa-nov2026.md`) preservando integralmente o Plano 135 anterior (`plans/135-slideshow-autoplay-sem-playback.md`); perfis de Osvaldo Luís e Artur Simão restritos estritamente aos registos visíveis nas Págs. 7–8 do PDF; `Discover our team` restaurado como interacção principal; pesquisa do Header retirada do âmbito obrigatório do Lote 1 e registada como pendência independente.
- **2026-11-17 (v3 — execução Lotes 1–3):**
  - Branch `codex/feat-revisao-landing-oa-nov2026` criada a partir de `codex/fix-slideshow-autoplay` (`f934bbe`), preservando `main` (`e468fe7`) intacta.
  - Desvio controlado de conteúdos pendentes: sem textos jurídicos aprovados para as 4 Políticas do rodapé, os links permanecem omitidos (cumprindo `docs/QUALITY.md` L69 — zero links `#` mortos); em `/about`, os pilares Visão, Missão e Objectivos usam apenas factos institucionais verificados no PDF; no Portfólio, os 3 títulos repetidos de `Wagner House` permanecem até entrega dos nomes/fichas definitivos, tendo sido corrigida a localização PT (`Moçambique`) e a atribuição artificial de todas as categorias em `wagner-house-3`.
  - Corrigida em `src/App.tsx` e `PortfolioProjectModal.tsx` a restauração de scroll via `scrollRestoration = 'manual'` + `behavior: 'instant'` para eliminar salto de âncora ao fechar o modal vindo de `/#studio-about`.

## 11. Resultado

- **Verificações automáticas (após última edição):**
  - `npm run lint`: 0 erros (`eslint .`).
  - `npm run build`: `optimize-images.mjs` (18 imagens WebP intactas), `tsc -b`, `vite build` (chunk principal `538.46 kB` — aviso pré-existente > 500 kB, aviso pré-existente de `Browserslist` e `.pl-[var(--tracking-*)]`), `prerender.mjs` (64 rotas estáticas pré-renderizadas, `sitemap.xml` com 5 URLs canónicos: `/`, `/en/`, `/pt/`, `/en/about`, `/pt/about`).
  - `npm test`: **42/42 testes a passar** (`tests/seo-verification.test.mjs`, 0 falhas).
- **Verificação no navegador (`http://127.0.0.1:4173/`):**
  - Testado em `1440 × 900`, `768 × 1024` e `375 × 812`: zero overflow horizontal, `0` erros de consola em `/` e `/projects/professor-house/`, slideshow contínuo sem Play/Pause a avançar sem pausa por hover/foco, `+ About` → `/about` → retorno funcional, modal `1353.59 × 810` (`94vw × 90dvh`) em desktop e `363.33 × 763.27` em mobile com `scrollDeltaY = 0` ao fechar com `Escape` tanto em `/` como a partir de `/#studio-about`, retratos `osvaldo.webp` e `artur.webp` carregados, `Discover our team` com `Neide Daude`, perfis com exactamente `4` e `5` registos cronológicos, e rodapé com Maputo e Milão.
  - Nota conhecida em `vite preview` local: acesso sem barra final (`/projects/professor-house`) serve fallback `dist/index.html` no `vite preview` (gerando mismatch React #418 nesse servidor de desenvolvimento), enquanto `/projects/professor-house/` serve o HTML estático correcto com `0` erros, comportamento validado para GitHub Pages na Suite 4 de `tests/seo-verification.test.mjs`.
