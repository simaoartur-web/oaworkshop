# Plano 135 — Revisão Editorial, Visual e Funcional da Landing Page O+A (Novembro 2026)

> **Estado:** PROPOSTO
> **Data:** 2026-11-17
> **Base confirmada (`main`):** `e468fe7` (`merge: close SEO-03 production verification`)
> **Branch actual observada no workspace:** `codex/fix-slideshow-autoplay` (`3a106dd`, com alterações não commitadas do anterior `plans/135-slideshow-autoplay-sem-playback.md`)
> **Branch prevista para execução:** `codex/feat-revisao-landing-oa-nov2026` (a criar a partir de base limpa confirmada após decisão sobre `codex/fix-slideshow-autoplay`)
> **Aprovação:** pendente — **não implementar alterações de código ou interface antes de aprovação expressa**
> **Documentos de referência:** `OA rev OL 161126.pdf` (9 páginas), [AGENTS.md](../AGENTS.md), [PROJECT_MAP.md](../PROJECT_MAP.md), [plans/README.md](README.md), [DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md), [OA_Design_Mastery_Playbook.md](../docs/OA_Design_Mastery_Playbook.md), [DESIGN_STUDY.md](../docs/DESIGN_STUDY.md), [QUALITY.md](../docs/QUALITY.md), [CONTENT_GUIDE.md](../docs/CONTENT_GUIDE.md), `ultimate-skills` v3.0.0.

---

## 1. Objectivo

Remodelar de forma incremental e sem reconstrução do zero a landing page O+A Workshop (`src/pages/Home.tsx`) e as rotas directamente articuladas, alinhando-as com o documento de revisão `OA rev OL 161126.pdf` (páginas 1 a 9), preservando a arquitectura React/Vite/Tailwind existente, o bilinguismo PT/EN e toda a infra-estrutura SEO-02/SEO-03 (pré-renderização estática, `canonical`, `hreflang`, `sitemap.xml` e JSON-LD `Organization`/`WebSite`).

---

## 2. Diagnóstico do Estado Actual (Factos Verificados)

### 2.1. Estado Git e conflito de numeração do Plano 135
- `main` e `origin/main` encontram-se em `e468fe7`. Nesse histórico, o último plano indexado é o `134-performance-imagens-autoplay-fades.md`; o número `135` não existe em `main`.
- Contudo, o workspace actual encontra-se na branch `codex/fix-slideshow-autoplay` (`3a106dd`, dois commits à frente de `main`), com alterações por commitar referentes a `plans/135-slideshow-autoplay-sem-playback.md` (`EM EXECUÇÃO`), `WorkshopSection.tsx`, `workshop.css`, `en.ts`, `pt.ts`, `PROJECT_MAP.md`, `docs/decisions/README.md` e `docs/decisions/0003-autoplay-workshop-sem-playback.md`.
- **Implicação:** Antes de iniciar o Lote 1, é necessário decidir se a branch de implementação parte limpa de `main` @ `e468fe7` (absorvendo e superando o `135-slideshow-autoplay-sem-playback.md`) ou se `codex/fix-slideshow-autoplay` deve ser encerrada/arquivada separadamente para preservar trabalho existente sem violar a regra de numeração de `plans/README.md`.

### 2.2. Auditoria secção a secção (Código vs. PDF)

| Área / Página PDF | Estado verificado no código (`main` / workspace) | Lacunas e divergências face ao PDF |
|---|---|---|
| **Abertura (Pág. 1)** | `HeroSection.tsx`: fundo `#ED7D31` (`--color-hero-bg`), texto `we are`, logótipo `/logo.png` escuro, `ARCHITECTS AND PLANNERS`, prompt `Click on O+A to start`, foco acessível ao entrar em `#workshop`. | Alinhado com a Pág. 1. Requer apenas preservação integral durante os lotes seguintes (evitar que alterações no header/slideshow quebrem o salto de entrada). |
| **Header e Logótipo (Pág. 2)** | `Header.tsx`: barra fixa com opacidade ligada ao scroll (`0 → 1` entre `0` e `100px`) e ocultação ao descer (`y: -100%`). Usa `/logo.png` (692×511 RGBA com valores RGB médios ~20, ou seja, grafismo escuro/preto) com `brightness-110` sobre fundo `#070707/60`. | Sobre a barra escura, o logótipo escuro tem baixo contraste e visibilidade deficiente. A Pág. 2 pede expressamente o logótipo da barra superior em **branco** (também visível em branco nas Págs. 5 e 9). Além disso, o campo de pesquisa no `Header` (`searchValue`) actualmente não filtra nem submete pesquisa real. |
| **Slideshow `#workshop` (Pág. 2)** | Em `main`: `WorkshopSection.tsx` contém `isPlaying`, botão circular Play/Pause, suspensão por `isHovered` e `isFocused` (bloqueando o avanço automático após entrada pelo Hero) e `SLIDE_DURATION_MS = 8000`. Em `codex/fix-slideshow-autoplay`: Play/Pause removido em edição local, mas mantém `8000 ms`, pausa por `isKeyboardFocused` e barras fixas de `56%` (`workshop.css` L287–309) sem preenchimento contínuo. | O PDF pede: (1) linha temporal visualmente **contínua** a preencher progressivamente durante a duração do slide; (2) ausência total de botão Play/Pause; (3) **não interromper** a reprodução por hover, foco ou inactividade enquanto o visitante observa a secção; (4) temporização confortável de leitura (11–14 s iniciais); (5) manter clique/selecção directa nos tópicos. Pede também atenção à grafia nos textos PT (`Politecnico`, `Estrategico`, `junta-se GENO`). |
| **Secção `+ WORKSHOP` e `About` (Pág. 3)** | `StudioAboutSection.tsx` e `studio-about.css`: composição 70/30 funcional com `office-space.webp` e `founders-portrait.webp` + citação oficial. O texto `"About"` existe apenas como `<figcaption className="sr-only">` (`studioAbout.photoLabel`). Não existe botão visível nem rota `/about`. | Falta transformar `"About"` num botão/link real integrado arquitectonicamente no canto inferior esquerdo da fotografia (sem tapar o quadro de giz, mesa ou cadeiras) a navegar para uma página institucional dedicada com **história, missão, visão e objectivos** em PT/EN. |
| **Portfólio e Cards (Págs. 4–5)** | Existem **duas fontes desconectadas**: (1) `ProjectsSection.tsx` na Home usa uma constante local `PORTFOLIO_CARDS` (6 obras residenciais em Maputo com cópia em `locales.*.portfolio.items`) onde os cartões **não são clicáveis**; (2) `src/data/projects.ts` (`ALL_PROJECTS`) contém 12 projectos de demonstração internacionais (`editorialStatus: 'demo'`) consumidos por `/projects`, `/projects/:id`, `routes.ts`, `metadata.ts` e `prerender.mjs`. Em `portfolio.items`, os últimos 3 cartões repetem exactamente o mesmo título (`Wagner House - ...`), `wagner-house-3` tem todas as 7 categorias atribuídas e `pt.ts` tem filtros em inglês (`Show all`, `landscaping`) e `"Mozambique"` sem tradução. Não existe campo `client` no modelo nem modal quase-fullscreen. | Falta tornar os cartões da Home clicáveis abrindo um painel/modal imersivo (`~94vw × 90dvh` em desktop, adaptável em mobile) com imagem, título, localização, data, área, cliente e descrição disponíveis; sincronizar URL/histórico sem perder o scroll da Home (cuidado com `ScrollToTop` em `App.tsx` L15–31, que força `window.scrollTo(0, 0)` ao mudar `pathname`); unificar o modelo de dados em `src/data/projects.ts`; e corrigir/aguardar dados reais das fichas de obra pendentes. |
| **Equipa `Our Team` (Págs. 6–8)** | `TeamSection.tsx`, `TeamMember.tsx`, `TeamProfilePanel.tsx`, `src/data/team.ts`: mostra os dois fundadores em `Joint leadership` e esconde os 6 colaboradores atrás do botão `Discover our team`. Em `public/images/team/` **já existem** `osvaldo.webp` e `artur.webp`, mas `team.ts` mantém `image: null` e `bio: null` para todos, e `en.ts`/`pt.ts` têm `bios: {}` vazios. `team.ts` lista `'Neide'` (sem `'Daude'`). Os cartões não apresentam resumos académicos (`MSc...`, `Bch...`) nem há movimento/carrossel nos colaboradores. | Pág. 6: activar retratos B&W dos fundadores, corrigir `'Neide Daude'`, avaliar apresentação contínua/em movimento dos colaboradores (inspirada em `geno.group/foundation`, com controlo acessível e fallback estático em `prefers-reduced-motion`), e suportar resumo académico curto quando aprovado. Págs. 7–8: preencher os perfis detalhados (`TeamProfilePanel`) de Osvaldo Luís e Artur Simão com a cronologia académica e profissional apresentada no PDF (em EN e PT). |
| **Contactos e Footer (Pág. 9)** | `ContactSection.tsx` (formulário `mailto:` honesto para `oa@oa-workshop.com`, com moradas resumidas `"Milan, Italy"` e `"Maputo, Mozambique"`) e `Footer.tsx` (logótipo escuro, tagline curta, quick links, email, botão `Back to top`). Sem links de Políticas, sem endereços de rua, sem números de telefone. | A Pág. 9 consolida descrição institucional fundadora (Maio 2025), links `POLICIES` (`Privacy Policy`, `Cookie Policy`, `Terms and Conditions`, `Code of Conduct`), `MAIN OFFICE` (Av. Metical, Q 10, Katembe, Maputo + dois telefones), `REPRESENTATIVE OFFICE` (Viale Renato Serra, Milano + telefone), e o bloco `Start a conversation.`. **Erro tipográfico detectado no PDF:** a Pág. 9 grafa `ao@oa-worshop.com`; deve manter-se o endereço canónico verificado `oa@oa-workshop.com`. |

---

## 3. Âmbito Incluído (Divisão em Três Lotes)

### Lote 1 — Identidade (Header/Logótipo), Slideshow Automático e About Interativo

#### 1.1. Header e Logótipo Branco
- Aplicar tratamento visual branco ao logótipo na barra superior (`Header.tsx`, drawer de navegação e posteriormente `Footer.tsx` / modal de projecto) mantendo `/logo.png` escuro na abertura (`HeroSection.tsx`) e nos metadados JSON-LD (`Organization.logo`).
- Opção técnica recomendada: gerar variante branca limpa ou aplicar classe CSS dedicada (ex.: `.oa-logo-white { filter: brightness-0 invert(1); }` verificada contra todos os navegadores-alvo, ou activo SVG/PNG branco derivado via `sharp` se necessário). Preferir CSS puro se mantiver nitidez total sem novo peso de rede; validar visualmente sobre fundo `#070707` e sobre fotografia clara do slideshow.
- Auditar visibilidade inicial do `Header` no limite entre `#top` e `#workshop` (garantir que ao entrar em `#workshop` o utilizador vê imediatamente a barra superior com logótipo branco, `ENG | PT`, pesquisa e `+` tal como na Pág. 2) e definir comportamento real para a lupa de pesquisa (ou ligá-la a filtragem/salto rápido de projectos/secções ou remover o controlo se não tiver função aprovada — nunca deixar input inerte).

#### 1.2. Slideshow Automático Contínuo (`WorkshopSection`, `WorkshopTabs`, `workshop.css`)
- **Temporização e ciclo:** Alterar `SLIDE_DURATION_MS` para **`12000` ms (12 segundos)** (dentro da janela pedida de 11–14 s, ajustável após validação de leitura), sincronizando numa única fonte de verdade (`activeId` + `cycleKey`/`startTimestamp`): imagem principal, etiqueta `DESTAQUE`, título, descrição e barra de progresso.
- **Remoção total de Play/Pause:** Remover botão `.workshop-nav-btn-playback`, estado `isPlaying`, ícones `Play`/`Pause` e chaves de locale sem consumidores. Preservar as setas `<` `>` e selecção directa nas 3 abas (`click` e teclado `ArrowLeft`/`ArrowRight`/`Home`/`End`).
- **Autoplay contínuo durante observação:** Remover pausa por `hover`, por `focus` (incluindo `:focus-visible` e foco programático vindo de `HeroSection`) e por temporizador secundário de inactividade. A rotação automática decorre continuamente enquanto `inViewport && pageVisible && !reducedMotion`. Ao clicar/seleccionar manualmente um tópico ou seta, muda imediatamente para o tópico escolhido e reinicia a contagem de 12 segundos a partir de 0%.
- **Linha temporal contínua com preenchimento progressivo (Pág. 2):**
  - Substituir as 3 linhas descontínuas de `56%` por uma faixa contínua unificada ao longo das 3 colunas (`.workshop-tabs` / `.workshop-tab-line`), com trilho base subtil (`rgba(255,255,255,0.18)`) e preenchimento laranja/terracota (`#ED7D31` / `--workshop-accent`).
  - Comportamento visual sugerido: cada coluna exibe o seu segmento da linha contínua; segmentos anteriores ao índice activo permanecem preenchidos (`100%`) ou em estado completo do ciclo, o segmento activo anima suavemente `scaleX(0 → 1)` durante exactamente `12s` (`linear`) sincronizado com o ciclo actual, e os segmentos seguintes mostram apenas o trilho base; ao reiniciar para o 1.º slide, toda a linha reinicia suavemente sem saltos.
  - Em mobile (`<= 767px`), manter a mesma leitura contínua em 3 colunas compactas abaixo do palco, evitando que a barra inferior empurre o palco para fora da dobra.
- **Crossfade e estabilidade:** Crossfade suave (`opacity` + micro-escala contida) apenas com propriedades GPU (`opacity`, `transform`), garantindo `aspect-ratio`/altura estável (`0` CLS) e pré-carregamento da imagem seguinte.
- **Documentação explícita do conflito WCAG 2.2 e suporte a movimento reduzido:**
  - Registar/actualizar ADR (`docs/decisions/0003-autoplay-workshop-sem-playback.md` ou novo ADR se em `main` ainda não existir): a ausência de botão Play/Pause e a não-interrupção por hover/foco violam intencionalmente o critério **WCAG 2.2 SC 2.2.2 (Pause, Stop, Hide — Nível A)** para conteúdo automático com duração superior a 5 segundos; a decisão resulta de requisito explícito do cliente e não deve ser reportada como conformidade AA plena nesse critério.
  - Para utilizadores com `prefers-reduced-motion: reduce`: desactivar autoplay automático, desactivar crossfade animado e exibir barra estática preenchida apenas no tópico seleccionado (`scaleX(1)` sem animação), mantendo 100% da navegação manual acessível por abas, setas e teclado.

#### 1.3. Botão `About` Interativo e Página Institucional O+A (`/about`)
- **Botão `About` sobre `StudioAboutSection.tsx` (Pág. 3):**
  - Substituir o texto invisível (`sr-only`) por um link real estilizado (`<Link to={aboutLink}>`), posicionado no canto inferior esquerdo de `.studio-about-office-figure` — zona de menor informação da fotografia (base escura/sombra junto à cadeira branca, preservando integralmente o quadro de giz, mesa, ecrãs e composição central).
  - Desenho arquitectónico coerente com a O+A: etiqueta tipográfica `About` / `Sobre o atelier` (ou `About` conforme direcção bilingue aprovada) com micro-subtítulo ou seta direccional `↗`/`→` em terracota (`#ED7D31`), fundo escuro translúcido localizado (`rgba(7,7,7,0.72)` com `backdrop-filter` subtil ou gradiente localizado no canto inferior esquerdo para garantir contraste **≥ 4,5:1** sobre a foto), área mínima de toque `44 × 44 px`, estados distintos de `hover` e `:focus-visible`.
- **Página dedicada (`/about`, `/en/about`, `/pt/about`):**
  - Criar `src/pages/About.tsx` reutilizando a linguagem editorial da O+A (`Outfit` + `Playfair Display`, fundos `#070707`/`#111111`, acento `#ED7D31`/`#A65D4A`, `container-custom`), estruturada em blocos claros:
    1. Enquadramento & História (fundação em Maio de 2025 por Osvaldo Luís e Artur Simão, raízes em Maputo e escritório representativo em Milão, conceito de *"workshop for ideas"* — dados já confirmados no PDF/repositório);
    2. Visão, Missão e Objectivos (conteúdos **a fornecer/validar pelo utilizador** antes de publicação; enquanto não aprovados, apresentar apenas secções com texto institucional já verificado no PDF ou sinalizar lacuna editorial no plano sem inventar texto promocional).
  - Ligação bidireccional: breadcrumb/retorno claro para `#studio-about` / Home e acesso directo no menu lateral (`Header.tsx`) e `Footer.tsx`.
  - **SEO & Rotas:** Registar `/about`, `/en/about`, `/pt/about` em `src/App.tsx`, `src/seo/routes.ts`, `src/seo/metadata.ts` (com `canonical`, `alternates` `hreflang` `en`/`pt`/`x-default` se aplicável), `scripts/prerender.mjs` e `sitemap.xml` (com actualização coordenada dos testes em `tests/seo-verification.test.mjs`).

---

### Lote 2 — Portfólio, Dados de Projectos e Cards Imersivos

#### 2.1. Unificação da Fonte de Dados e Saneamento de Metadados
- Mover a definição de projectos da Home (`PORTFOLIO_CARDS` em `ProjectsSection.tsx`) para `src/data/projects.ts`, criando um modelo unificado e tipado que suporte:
  - `id` (slug estável para URL), `categories` (multi-categoria para os 8 filtros), `featuredOnHome`, `editorialStatus` (`'verified' | 'demo'`), `year` / `date`, `area`, `client`, `mainImage` / `imageWebp` / `thumbnail`, `imageIsPlaceholder`, e referências de tradução em `src/locales/en.ts` e `src/locales/pt.ts`.
- **Saneamento imediato identificado na auditoria:**
  - Corrigir os 3 cartões duplicados de `Wagner House` (`wagner-house-1`, `wagner-house-2`, `wagner-house-3`) e a atribuição artificial de todas as 7 categorias a `wagner-house-3` assim que os nomes/categorias reais forem confirmados pelo atelier (ex.: *Katembe Family House* da Pág. 5).
  - Traduzir/harmonizar filtros e localizações em `pt.ts` (`Show all` → `Mostrar tudo` ou manter rótulo editorial se deliberadamente em inglês conforme decisão do utilizador; `"Maputo, Mozambique 2026"` → `"Maputo, Moçambique 2026"` em PT).
  - Suportar estado vazio elegante caso um filtro (ex.: `Competitions` ou `Furniture`) não possua projectos reais atribuídos (reutilizando `portfolio.emptyCategory` já existente em `en.ts`/`pt.ts`).

#### 2.2. Cards Clicáveis e Painel/Modal Imersivo Quase Fullscreen
- **Interacção dos cards:** Envolver a área visual + legenda de cada cartão num `<Link>` ou botão acessível com `href` real para `/projects/:id` (ou `/{lang}/projects/:id`), interceptando o clique normal para abrir o modal imersivo sobre a landing page, mantendo Ctrl/Cmd+clique (abrir em nova aba) funcional.
- **Dimensões e enquadramento:**
  - Desktop: diálogo modal (`<dialog>` nativo ou portal acessível com `role="dialog"` + `aria-modal="true"`) com dimensão de referência **`width: min(94vw, 1520px)` e `height: min(90dvh, 960px)`** (ou `94vw × 90dvh` dentro de `inset` seguro com margem respiratória sobre backdrop escuro `rgba(5,5,5,0.88)` + `backdrop-filter: blur(8px)`).
  - Mobile (`< 768px`): apresentação imersiva adaptada (`width: 100vw` ou `calc(100vw - 1rem)`, `max-height: 94dvh`, `env(safe-area-inset-*)`) garantindo legibilidade sem texto cortado ou botões inacessíveis.
- **Conteúdo do modal (alinhado com a Pág. 5 sem inventar dados):**
  - Barra superior discreta com logótipo O+A em branco (ou identificação da obra) e botão de fecho visível (`X`, mínimo `44 × 44 px`, `aria-label`).
  - Fotografia principal em destaque (ou marcador neutro `?` quando indisponível) + bloco de ficha técnica com os campos disponíveis: **Nome/Título**, **Localização** (`Location`), **Data** (`Date`), **Cliente** (`Client`), **Área do projecto** (`Project Area`) e **Descrição** / **Âmbito**. Campos ainda não fornecidos pelo atelier são **omitidos de forma limpa** (nunca preenchidos com dados inventados).
  - **Preparação para layouts individuais futuros:** Estruturar o conteúdo do modal e de `ProjectDetail.tsx` através de um componente partilhado de ficha/layout (`ProjectShowcaseContent` ou secções modulares) para que, quando os layouts específicos por obra forem partilhados, possam ser acoplados sem reescrever a lógica do modal nem das rotas.
- **Acessibilidade e preservação de scroll (crítico):**
  - Scroll interno contido (`overflow-y: auto; overscroll-behavior: contain`) com bloqueio seguro de scroll do fundo (reutilizando o padrão de compensação de `scrollbar` já testado em `TeamProfilePanel.tsx`).
  - Fecho por botão visível, clique no backdrop (verificando `pointerDown` + `pointerUp` fora, como em `TeamProfilePanel`), tecla `Escape`, armadilha de foco (`Tab` / `Shift+Tab`) e restauro exacto do foco ao cartão que abriu o modal.
  - **Correcção necessária em `App.tsx` (`ScrollToTop`):** Actualmente `ScrollToTop` executa `window.scrollTo({ top: 0 })` sempre que `location.pathname` muda. Se abrirmos o modal actualizando o URL para `/projects/:id` (via `navigate(..., { state: { modalBackground: location } })`), é **obrigatório** actualizar `ScrollToTop` e `<Routes>` em `App.tsx` para reconhecer `modalBackground` — mantendo `Home` montada na posição exacta de scroll e evitando que a página salte para o topo ao abrir ou fechar o modal.

#### 2.3. Estratégia de URLs Individuais e SEO
- **Padrão React Router "Background Location Modal":**
  - Ao clicar num cartão da Home, navegar para `getLocalizedInternalLink('/projects/' + id, location.pathname)` passando `state={{ backgroundLocation: location }}`.
  - O URL no browser muda realmente para `/projects/:id` (ou `/en/projects/:id`, `/pt/projects/:id`), permitindo copiar/partilhar o link e usar o botão **Voltar** do browser para fechar o modal mantendo o scroll exacto da Home.
  - Ao aceder directamente ao URL `/projects/:id` (ou recarregar a página, ou via motor de busca), não existe `backgroundLocation`: renderiza a página completa pré-renderizada `ProjectDetail.tsx` com `<DocumentHead />`, `canonical`, `hreflang` e metadados próprios.
- **Preservação SEO-02 / SEO-03:**
  - Manter `editorialStatus: 'demo'` → `noindex, nofollow` para projectos demonstrativos, passando a `index, follow` apenas para projectos com `editorialStatus: 'verified'` após aprovação editorial.
  - Garantir que `scripts/prerender.mjs` continua a pré-renderizar todas as rotas de `ALL_PROJECTS` e que `tests/seo-verification.test.mjs` passa integralmente.

---

### Lote 3 — Equipa (`Our Team`), Contactos, Footer e Conteúdo

#### 3.1. Secção `Our Team` e Perfis dos Fundadores (Págs. 6–8)
- **Retratos e dados em `src/data/team.ts`:**
  - Ligar `osvaldo-luis` a `/images/team/osvaldo.webp` e `artur-simao` a `/images/team/artur.webp` (recursos já existentes e optimizados em `public/images/team/`), ajustando `objectPosition` para enquadramento 4:5 / retrato B&W sem cortes de cabeça.
  - Corrigir o nome `'Neide'` → `'Neide Daude'` (conforme Pág. 6).
  - Adicionar campo opcional de resumo académico curto (`summary` / chave em `team.summaries`) para exibir as credenciais curtas abaixo do cargo nos cartões, conforme Pág. 6 (mediante revisão ortográfica das abreviações *BSc / MSc* e *Technical Director*).
- **Apresentação dos colaboradores (Pág. 6 + referência `geno.group/foundation`):**
  - Actualmente escondidos por defeito em `isTeamExpanded === false`. Remodelar para permitir visibilidade/descoberta imediata ou faixa em movimento suave horizontal (marquee/carrossel contínuo em desktop) quando o número de colaboradores justificar, **com requisitos obrigatórios de UX e acessibilidade**:
    - Controlo visível de pausa/navegação ou paragem automática ao interagir/focar (aqui, ao contrário do slideshow principal, o utilizador não proibiu pausa nos colaboradores);
    - Em `prefers-reduced-motion: reduce` e mobile estreito, apresentar grelha estática legível sem rolagem forçada;
    - Manter monogramas/iniciais (`TeamAvatar`) para colaboradores ainda sem retrato autorizado.
- **Painel de Perfil (`TeamProfilePanel.tsx`, Págs. 7–8):**
  - Estender o modelo de perfil em `team.ts` e `locales/*.ts` para suportar entradas estruturadas de **Formação e Percurso Profissional** (`timeline: Array<{ period: string; title: string; organization: string }>`), além da `bio` textual opcional.
  - Preencher os perfis de **Osvaldo Luís** (2018–2026: Politecnico di Milano, UEM, AVSI Foundation, Alder Clavuot Nunzi, Systematica, PDUL/Verde Azul, UN-Habitat, ARS Progetti, Vedor Lda) e **Artur Simão** (2015–presente: UEM, UNICEF, DELCAM/KPMG, RENOVO, FRORESCER, Witswatersrand/Emile Pinard) exactamente com os factos verificados das Págs. 7–8 em EN e versão equivalente fiel em PT.
  - Manter o painel dos colaboradores sem biografia inventada (`bio: null`, `timeline: []` omitidos silenciosamente).

#### 3.2. Contactos, Escritórios, Políticas e Footer (Pág. 9)
- **Consolidação do rodapé e bloco de conversa (`ContactSection.tsx` + `Footer.tsx`):**
  - Alinhar visualmente a transição/integração entre o bloco `Start a conversation.` e as colunas institucionais da Pág. 9:
    1. **Coluna Institucional:** Logótipo O+A em branco, texto de fundação (Maio 2025, Osvaldo Luís e Artur Simão, *"workshop for ideas"*, Maputo e aberto ao mundo) + secção **POLICIES**.
    2. **MAIN OFFICE — Maputo, Mozambique:** `Av. Metical, Q 10, Katembe, Maputo City, Mozambique`, telefones clicáveis `tel:+258876569776` e `tel:+258847555427`, email `oa@oa-workshop.com` (**corrigindo** o lapso tipográfico `ao@oa-worshop.com` presente na Pág. 9 do PDF após confirmação).
    3. **REPRESENTATIVE OFFICE — Milano, Italy:** `Viale Renato Serra, Milano, Italy`, telefone clicável `tel:+393513531205`.
    4. **Bloco `Start a conversation.`:** Manter âncora `#contact`, formulário compacto escuro (`NAME *`, `EMAIL *`, `SUBJECT`, `MESSAGE *`, botão `CONTINUE IN EMAIL`) com acção `mailto:oa@oa-workshop.com` e nota transparente (`contact.formHelp`, exigida por `docs/QUALITY.md` L40).
- **Políticas (`Privacy Policy`, `Cookie Policy`, `Terms and Conditions`, `Code of Conduct`):**
  - De acordo com `docs/QUALITY.md` L69, **não publicar links `#` mortos**.
  - Plano: criar página(s) ou painel modal/rota dedicada (`/policies` ou rotas individuais `/privacy`, `/cookies`, `/terms`, `/code-of-conduct` com `noindex` ou conteúdo legal real aprovado pela O+A) contendo declarações verídicas para um site estático sem cookies de rastreio nem back-end; caso o texto das 4 políticas não esteja aprovado no arranque do Lote 3, ocultar/adiar os links não-funcionais ou abrir modal informativo mínimo após aprovação do texto pelo utilizador.

---

## 4. Fora do Âmbito

- Criação de back-end, base de dados, CMS, painel administrativo ou envio de formulários via servidor/API externa (`AGENTS.md` § 3).
- Invenção de biografias de colaboradores, dados de obras em falta (`area`, `client`, `date`) ou declarações jurídicas não aprovadas.
- Alteração directa em `main`, merge ou deploy para GitHub Pages (apenas após validação completa e declaração canónica pelo utilizador).
- Novas dependências npm (reutilizar React, React Router, Framer Motion, Lucide React e CSS existente).
- Layouts individuais detalhados de cada obra além da ficha base da Pág. 5 (ficarão preparados estruturalmente para acoplamento posterior).

---

## 5. Ficheiros Previstos por Lote

| Lote | Ficheiros a criar / alterar | Responsabilidade |
|---|---|---|
| **Transversal (início)** | `plans/135-revisao-landing-oa-nov2026.md`, `plans/README.md`, `PROJECT_MAP.md`, `docs/decisions/0003-...md` | Registo de decisão WCAG 2.2 SC 2.2.2, actualização do mapa e resolução de branch |
| **Lote 1** | `src/components/layout/Header.tsx`, `src/index.css` | Logótipo branco no header/drawer, comportamento de entrada e pesquisa |
| **Lote 1** | `src/components/home/WorkshopSection.tsx`, `src/components/home/WorkshopTabs.tsx`, `src/components/home/workshop.css` | Remoção de Play/Pause, autoplay contínuo 12s (sem pausa por hover/foco), linha contínua progressiva, `prefers-reduced-motion` |
| **Lote 1** | `src/components/home/StudioAboutSection.tsx`, `src/components/home/studio-about.css`, `src/pages/About.tsx` *(novo)* | Botão `About` integrado na fotografia + página institucional `/about` (PT/EN) |
| **Lote 1** | `src/App.tsx`, `src/seo/routes.ts`, `src/seo/metadata.ts`, `scripts/prerender.mjs`, `tests/seo-verification.test.mjs`, `src/locales/en.ts`, `src/locales/pt.ts` | Rotas `/about`, `/en/about`, `/pt/about`, metadados/sitemap e traduções Lote 1 |
| **Lote 2** | `src/data/projects.ts`, `src/components/home/ProjectsSection.tsx`, `src/components/home/portfolio.css` | Fonte única de dados, saneamento de filtros/títulos, cartões clicáveis |
| **Lote 2** | `src/components/home/PortfolioProjectModal.tsx` *(novo)*, `src/components/projects/ProjectShowcaseContent.tsx` *(opcional partilhado)*, `src/pages/ProjectDetail.tsx`, `src/App.tsx` | Modal `~94vw × 90dvh`, acessibilidade/teclado, preservação de scroll com `backgroundLocation` no `ScrollToTop`, links directos SEO |
| **Lote 2** | `src/locales/en.ts`, `src/locales/pt.ts`, `src/seo/metadata.ts`, `scripts/prerender.mjs` | Metadados de projecto (`client`, `date`, `area`, `description`) e pré-renderização |
| **Lote 3** | `src/data/team.ts`, `src/components/home/TeamSection.tsx`, `src/components/home/TeamMember.tsx`, `src/components/home/TeamProfilePanel.tsx`, `src/components/home/team.css` | Retratos `osvaldo.webp`/`artur.webp`, `Neide Daude`, CVs Págs. 7–8, colaboradores visíveis/em movimento acessível |
| **Lote 3** | `src/components/home/ContactSection.tsx`, `src/components/layout/Footer.tsx`, `src/pages/Policies.tsx` *(se textos aprovados)* | Logótipo branco, moradas/telefones Maputo & Milão, email `oa@oa-workshop.com`, texto institucional, políticas e formulário |
| **Lote 3** | `src/locales/en.ts`, `src/locales/pt.ts`, `PROJECT_MAP.md` | Traduções completas PT/EN e actualização final do mapa |

---

## 6. Riscos, Conflitos e Salvaguardas

1. **Conflito de branch/plano (`codex/fix-slideshow-autoplay` vs `main`):**
   - *Risco:* Perder trabalho anterior ou colidir numeração em `plans/`.
   - *Salvaguarda:* Confirmar com o utilizador na aprovação se a execução deve nascer numa nova branch a partir de `main` @ `e468fe7` (substituindo o antigo `135-slideshow-autoplay-sem-playback.md`), mantendo preservada a branch anterior sem destruição de histórico.
2. **Conflito normativo WCAG 2.2 SC 2.2.2 (Pause, Stop, Hide):**
   - *Risco:* Um slideshow automático de 12s sem botão Play/Pause e sem pausa por hover/foco não cumpre WCAG 2.2 AA (critério 2.2.2).
   - *Salvaguarda:* Documentar expressamente a decisão do cliente em ADR (`docs/decisions/`), assegurar paragem total com `prefers-reduced-motion: reduce`, e garantir navegação manual completa por abas, setas e teclado sem roubo de foco.
3. **Dependência de conteúdos institucionais e de portfólio em falta:**
   - *Risco:* Inventar Visão/Missão/Objectivos para `/about`, distinguir manualmente os 3 cartões `Wagner House`, inventar `client`/`area` de obras ou publicar textos jurídicos não validados para as 4 Políticas.
   - *Salvaguarda:* Listar no pedido de aprovação os textos exactos necessários (ou definir explicitamente que campos ausentes são omitidos até entrega de conteúdo).
4. **Regressão de scroll ao abrir/fechar modal de portfólio:**
   - *Risco:* `ScrollToTop` em `App.tsx` repor `scrollY = 0` ao mudar para `/projects/:id`.
   - *Salvaguarda:* Implementar padrão `backgroundLocation` + detecção em `ScrollToTop` para não rolar quando o modal abre ou fecha, validando no navegador em 375/768/1440 px.
5. **Regressão SEO-02 / SEO-03 / Pré-renderização:**
   - *Risco:* Quebrar `tests/seo-verification.test.mjs` (ex.: número exacto de URLs em `sitemap.xml`, `robots.txt`, JSON-LD exclusivo na raiz `/`, ou `noindex` nos projectos `demo`).
   - *Salvaguarda:* Executar `npm run build` (que inclui pré-renderização) e `npm test` após cada lote, ajustando asserções de contagem de rotas em `tests/seo-verification.test.mjs` apenas para novas rotas indexáveis aprovadas (ex.: `/about`).
6. **Desempenho e CLS (bundle > 500 kB e imagens acima da dobra):**
   - *Risco:* Novos ficheiros/componentes aumentarem o bundle principal ou animação de progresso causar *layout shift*.
   - *Salvaguarda:* Animar a linha contínua exclusivamente via `transform: scaleX()` (ou `width` sem alterar altura), usar `React.lazy` para páginas secundárias/modais pesados se o bundle crescer, e manter imagens WebP com `width`/`height` explícitos.

---

## 7. Critérios de Aceitação por Lote

### Lote 1
- [ ] Logótipo O+A no `Header` (barra fixa e menu lateral) visível em branco com contraste nítido sobre fundo escuro e fotografia.
- [ ] Slideshow `#workshop` avança automaticamente a cada ~12s (`11–14s`) em ciclo contínuo `Architecture → Urban Planning → Research → Architecture` enquanto visível no viewport e aba activa.
- [ ] Não existe botão Play/Pause em código, DOM ou locales; hover, foco e inactividade não bloqueiam a rotação.
- [ ] Linha temporal inferior é visualmente contínua e preenche progressivamente sincronizada com o slide activo; clique em qualquer tópico actualiza imediatamente imagem, destaque, texto e barra.
- [ ] Com `prefers-reduced-motion: reduce`, não há avanço automático nem animação contínua da linha, mantendo navegação manual funcional.
- [ ] Botão `About` visível e bem contrastado sobre a fotografia de `+ WORKSHOP` sem tapar elementos-chave; clique abre `/about` (ou `/pt/about` / `/en/about`) com história, visão, missão e objectivos aprovados e regressos claros.
- [ ] SEO e pré-renderização íntegros para `/` e `/about` nos dois idiomas.

### Lote 2
- [ ] Todos os cartões do portfólio na Home são clicáveis (rato, toque e teclado `Enter`/`Space`).
- [ ] O clique normal abre um modal sobreposto quase fullscreen (`~94vw × 90dvh` em desktop; adaptado e legível em mobile) exibindo foto principal, título, localização, data, cliente, área e descrição disponíveis (sem dados inventados).
- [ ] Modal possui scroll interno fluido, botão de fecho visível (`>= 44×44px`), fecho por `Escape` e backdrop, armadilha de foco e restauro de foco ao cartão de origem.
- [ ] Ao fechar o modal, o visitante permanece exactamente na mesma posição de scroll da secção `#portfolio`.
- [ ] URL actualiza para `/projects/:id` (localizado) e links directos / nova aba carregam `ProjectDetail` pré-renderizado sem quebrar SEO-02/SEO-03.
- [ ] Filtros funcionam em EN e PT com títulos/categorias saneados e estado vazio limpo caso alguma categoria fique sem projectos.

### Lote 3
- [ ] `Osvaldo Luís` e `Artur Simão` apresentam retratos B&W reais (`osvaldo.webp`, `artur.webp`); `Neide Daude` corrigido; colaboradores exibidos de forma fluida/acessível (com pausa/estático em movimento reduzido e sem fotos inventadas).
- [ ] `TeamProfilePanel` exibe a cronologia académica e profissional das Págs. 7–8 para os dois fundadores em PT e EN.
- [ ] Footer e Contactos exibem logótipo branco, descrição fundadora de Maio 2025, moradas completas e telefones clicáveis de Maputo e Milão, email verificado `oa@oa-workshop.com`, formulário `Start a conversation.` (`mailto:`) com aviso honesto e links de Políticas funcionais (sem `#` mortos).

---

## 8. Verificações Obrigatórias (após execução de cada lote)

1. **Estáticas e build:**
   - `npm run lint` (zero erros; documentar quaisquer avisos pré-existentes);
   - `npm run build` (inclui `vite build` + `scripts/prerender.mjs` sem falhas);
   - `npm test` (`tests/seo-verification.test.mjs` 100% a passar);
   - `git diff --check`.
2. **Navegador — QA Visual e Funcional (`375 px`, `768 px`, `1440 px`, EN e PT):**
   - Fluxo completo: Abertura `#top` → clique em O+A → entrada em `#workshop` → observar 1 ciclo completo (~36s) + selecção manual → abrir `About` (`/about` e retorno) → filtrar e abrir modal de portfólio (`94vw × 90dvh`, scroll interno, `Escape`, retorno à mesma posição da página) → abrir URL directo de projecto → verificar retratos e perfis de Osvaldo Luís e Artur Simão + colaboradores → testar `mailto:`, telefones e políticas no rodapé.
   - Confirmar `0` erros na consola, ausência de overflow horizontal e carregamento correcto das imagens `.webp`.
3. **Acessibilidade:**
   - Navegação integral apenas com teclado (`Tab`, `Shift+Tab`, setas nas abas, `Enter`, `Escape`);
   - Contraste WCAG 2.2 AA verificado em botões sobre fotografia (`About`, setas, barra de tabs, textos do modal);
   - Emulação de `prefers-reduced-motion: reduce` em `#workshop`, modal, `#team`.

---

## 9. Sequência de Implementação e Decisões Pendentes Antes do Arranque

Antes de emitir `APROVADO: plans/135-revisao-landing-oa-nov2026.md`, confirmar apenas os pontos que dependem de decisão editorial/estratégica do utilizador:

1. **Base Git:** Confirmar criação da nova branch de implementação a partir de `main` (`e468fe7`), deixando a branch `codex/fix-slideshow-autoplay` intacta/arquivada (ou indicar se pretende outra estratégia).
2. **Conteúdos institucionais pendentes (Lote 1 e Lote 3):**
   - Textos aprovados para **Visão, Missão e Objectivos** na página `About` (ou confirmação para manter secções provisórias estritamente factuais enquanto redigem os textos).
   - Textos/destino das **4 Políticas** (`Privacy Policy`, `Cookie Policy`, `Terms and Conditions`, `Code of Conduct`).
3. **Dados das obras do Portfólio (Lote 2):**
   - Nomes, categorias, datas, clientes, áreas e descrições para substituir os 3 títulos repetidos de `Wagner House` e preencher as fichas do modal (sem inventar informação).
4. **Email e grafia no rodapé/slides (Lote 1 e Lote 3):**
   - Confirmar manutenção do endereço canónico `oa@oa-workshop.com` (corrigindo o lapso `ao@oa-worshop.com` da Pág. 9) e autorização para corrigir acentos ortográficos em PT nos destaques (`Politécnico`, `Estratégico`, etc.) mantendo os nomes das obras intactos.
5. **Pesquisa no Header (Lote 1):**
   - Confirmar se a lupa no `Header` deve passar a pesquisar projectos/secções localmente ou ser simplificada/removida até existir pesquisa dedicada.

---

## 10. Registo de Decisões e Desvios

- **2026-11-17:** Análise integral do repositório e do PDF `OA rev OL 161126.pdf` (9 páginas) concluída. Nenhuma alteração de código ou interface foi aplicada. Detectado que o workspace está em `codex/fix-slideshow-autoplay` com plano `135-slideshow-autoplay-sem-playback.md` inacabado, enquanto `main` (`e468fe7`) tem o número `135` livre. Detectados também os recursos `public/images/team/osvaldo.webp` e `artur.webp` já disponíveis no repositório, a discrepância de email `ao@oa-worshop.com` na Pág. 9 do PDF, e o impacto do `ScrollToTop` em `src/App.tsx` sobre URLs de modal no portfólio.

## 11. Resultado

*Pendente de aprovação e execução.*
