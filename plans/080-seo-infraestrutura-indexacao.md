# Plano 080 — SEO-01: Fundação técnica, indexação e descoberta orgânica

> **Estado:** PROPOSTO — preparado para auditoria e revisão
> **Data:** 2026-10-28
> **Repositório:** `simaoartur-web/oaworkshop`
> **Base auditada:** `main` @ `6e4f301b4549f9e8fc96e3690785c23d780b975e`
> **Branch deste plano:** `codex/plan-seo01-indexacao`
> **Branch prevista para execução:** `codex/feature-seo01-indexacao`
> **Aprovação:** pendente (`APROVADO: plans/080-seo-infraestrutura-indexacao.md`)

---

## 1. Objectivo

Preparar a presença pública do O+A Workshop (`https://www.oa-workshop.com/`) para descoberta e indexação orgânica através de:

- URLs canónicas reais e rastreáveis (sem dependência de `HashRouter` para rotas de página);
- HTML inicial pré-renderizado e significativo entregue directamente por HTTP (sem depender exclusivamente de execução de JavaScript no cliente);
- Metadados completos por página e idioma (`<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph, Twitter Cards e dados estruturados JSON-LD `Organization` estritamente verificáveis);
- Descoberta independente e indexável das variantes linguísticas PT/EN com `hreflang` recíproco;
- Inventário rigoroso de páginas publicáveis (`robots.txt`, `sitemap.xml` e controlo `noindex` para rotas demonstrativas ou não verificadas);
- Resposta `404` legítima compatível com GitHub Pages (eliminando o risco de *soft 404*).

Todo o design, identidade arquitectónica e editorial, conteúdo validado, animações e funcionamento actual são integralmente preservados, mantendo a política **exclusivamente front-end** (`AGENTS.md`) e o alojamento estático em GitHub Pages. Entrega técnica não equivale a promessa de posições, tráfego ou resultados comerciais garantidos.

---

## 2. Contexto, Estado Git e Diagnóstico Técnico Confirmado

### 2.1. Estado Git verificado
- **`main`:** `6e4f301b4549f9e8fc96e3690785c23d780b975e` (`merge: publish R05 + WORKSHOP and UX/UI mobile & hero refinements`).
- **`HEAD` actual no workspace:** branch `codex/redesign-our-team-section` @ `a3637b0` (`feat(team): redesign Our Team section with Joint Leadership and expandable collaborators`, 1 commit à frente de `main`, referente ao `plans/133-redesign-seccao-our-team.md`).
- **Salvaguarda de branches:** o trabalho existente em `codex/redesign-our-team-section` é integralmente respeitado. A criação da branch `codex/feature-seo01-indexacao` e a implementação técnica só ocorrerão após aprovação formal deste plano e sobre a base canónica indicada pelo utilizador.

### 2.2. Problemas técnicos confirmados no código-fonte

1. **`HashRouter` em `src/main.tsx` e rotas em `src/App.tsx`:**
   - `src/main.tsx` envolve `<App />` em `<HashRouter>`.
   - Embora `src/App.tsx` declare as rotas `/`, `/projects` e `/projects/:id`, no navegador todas as páginas dependem do fragmento `#` (`/#/`, `/#/projects`, `/#/projects/:id`).
   - Como o fragmento `#` não é enviado em pedidos HTTP e é ignorado pelos motores de pesquisa para indexação independente e `<link rel="canonical">`, os motores de busca vêem apenas um único URL raiz (`https://www.oa-workshop.com/`).
   - Adicionalmente, as ligações de secção em `src/components/layout/Header.tsx` e `src/components/layout/Footer.tsx` (`/#workshop`, `/#portfolio`, `/#contact`, `/#top`) partilham o mecanismo de hash com o router.

2. **Renderização exclusivamente Client-Side (CSR) em `index.html`:**
   - `index.html` contém apenas `<div id="root"></div>` vazio e `<script type="module" src="/src/main.tsx"></script>`.
   - Sem execução de JavaScript (ou para crawlers de redes sociais/mensagens como WhatsApp, LinkedIn, X/Twitter e bots sem renderização JS), a resposta HTTP não contém cabeçalhos semânticos (`<h1>`, `<h2>`), texto institucional, equipa nem ligações internas (`<a href="...">`).

3. **Metadados estáticos e insuficientes em `index.html`:**
   - `index.html` fixa `<html lang="en">` e define apenas `<title>O+A Architecture and Planners</title>` (divergindo da designação oficial nos locales: `O+A Architects and Planners` em `src/locales/en.ts` e `O+A Arquitectos e Planeadores` em `src/locales/pt.ts`).
   - Ausência total de `<meta name="description">`, `<link rel="canonical">`, `<link rel="alternate" hreflang="...">`, Open Graph (`og:title`, `og:description`, `og:url`, `og:image`, `og:type`, `og:locale`), Twitter Cards e JSON-LD (`Organization`).

4. **Idiomas PT/EN dependentes de `localStorage` sem URLs próprios (`src/i18n.ts`, `Header.tsx`):**
   - `src/i18n.ts` selecciona o idioma apenas através de `window.localStorage.getItem('oa-language')` com fallback fixo para `'en'`.
   - Os botões `ENG | PT` em `src/components/layout/Header.tsx` invocam `i18n.changeLanguage(lng)` sem alterar o URL.
   - Consequência: os motores de pesquisa rastreiam sem estado de `localStorage`, pelo que a versão em português (`src/locales/pt.ts`) não possui URL rastreável nem pode ser declarada em `hreflang` ou no `sitemap.xml`.

5. **Dois catálogos distintos de projectos e conteúdo demonstrativo (`src/data/projects.ts` vs. `src/components/home/ProjectsSection.tsx`):**
   - **Catálogo da Homepage (`src/components/home/ProjectsSection.tsx` — secção `+ PORTFOLIO`):** apresenta 6 projectos reais localizados em Maputo, Moçambique (`professor-house`, `metita-house`, `nelson-house`, `wagner-house-1`, `wagner-house-2`, `wagner-house-3`) com fotografias locais em `public/images/portfolio/`, sem páginas de detalhe individuais.
   - **Catálogo das rotas `/projects` e `/projects/:id` (`src/data/projects.ts`, `src/pages/Projects.tsx`, `src/pages/ProjectDetail.tsx`):** contém 12 entradas (`milan`, `karlatornet`, `carmichael`, `rivage`, `singapore-green`, `milan-urban`, `vancouver-waterfront`, `london-smart`, `modular-sanitation`, `drr-resilience`, `urban-heat-lab`, `resilient-housing`) com fotografias remotas de `images.unsplash.com` e descrições demonstrativas internacionais.
   - Indexar `/projects` e `/projects/:id` como portefólio real da O+A sem verificação editorial contraria `docs/CONTENT_GUIDE.md` e expõe o domínio a indexação de conteúdo demonstrativo.

6. **Ausência de `robots.txt` e `sitemap.xml` na árvore `public/`:**
   - `public/` contém apenas `CNAME` (`www.oa-workshop.com`), `logo.png` e `images/`.
   - Não existem `public/robots.txt` nem `public/sitemap.xml`.
   - *Nota metodológica:* a ausência está confirmada na árvore de origem inspecionada; antes de relatar o estado externo em produção (`https://www.oa-workshop.com/`), a Etapa A verificará as respostas HTTP reais do domínio.

7. **Mecanismo de publicação no GitHub Pages e risco de HTTP 404 / Soft 404 (`.github/workflows/deploy.yml`):**
   - `.github/workflows/deploy.yml` executa `npm run build` e `cp dist/index.html dist/404.html`.
   - No GitHub Pages, qualquer pedido para um caminho que não corresponda a um ficheiro físico em `dist/` serve `dist/404.html` com **status HTTP `404 Not Found`**.
   - Por conseguinte, substituir `HashRouter` por `BrowserRouter` **sem pré-renderizar ficheiros HTML estáticos por rota** faria com que todas as rotas (excepto `/`) devolvessem HTTP 404 aos motores de busca. Inversamente, copiar `dist/index.html` para `dist/404.html` faz com que URLs inexistentes sirvam a casca da homepage sem `noindex`.

8. **Ligação provisória no rodapé (`src/components/layout/Footer.tsx`):**
   - A linha 53 de `Footer.tsx` inclui `<a href="#">{t('nav.privacy')}</a>`, violando a regra de `docs/QUALITY.md` ("Não publicar ligações `#` como destino final sem plano para as substituir").

---

## 3. Abordagem Técnica Recomendada

### 3.1. Arquitectura de URLs, Router e Variantes Linguísticas PT/EN
- **Substituição de `HashRouter` por `BrowserRouter` (no cliente) e `StaticRouter` (na pré-renderização de build):**
  - As rotas públicas passam a usar caminhos limpos e canónicos no domínio `https://www.oa-workshop.com`.
  - Os hashes `#workshop`, `#portfolio`, `#team`, `#contact` e `#top` ficam reservados exclusivamente para âncoras de secção na página inicial, mantendo o funcionamento suave de `ScrollToTop` em `src/App.tsx`.
- **Estrutura de URLs bilingue proposta:**
  - Gerar páginas físicas estáticas para ambos os idiomas:
    - `/en/` (`dist/en/index.html`, `<html lang="en">`, conteúdo e metadados em inglês);
    - `/pt/` (`dist/pt/index.html`, `<html lang="pt">`, conteúdo e metadados em português);
    - `/` (`dist/index.html`, servindo a língua principal definida para a raiz canónica — por omissão `en` ou `pt` conforme decisão editorial na Secção 10 — com `canonical` coerente e `hreflang="x-default"`).
  - O selector `ENG | PT` em `Header.tsx` passa a navegar entre os caminhos equivalentes (`/en/...` ↔ `/pt/...`) através de ligações rastreáveis (`<a href="...">` / `<Link to="...">`), sincronizando também a preferência em `localStorage` (`oa-language`) e preservando eventual âncora de secção (`#workshop`, `#portfolio`, etc.).
  - **Compatibilidade retroactiva de URLs em hash:** adicionar no arranque cliente um redireccionamento limpo (`replace`) para converter acessos legados do tipo `/#/projects` ou `/#/projects/:id` para os novos caminhos sem hash.

### 3.2. Pré-renderização Estática em Tempo de Build (SSG Leve sem Backend)
- Criar um script de pré-renderização integrado em `npm run build` (ex.: `scripts/prerender.tsx` / entrada SSR do Vite usando `react-dom/server` `renderToString`):
  1. Compila o bundle cliente com `vite build`.
  2. Para cada rota estática elegível, renderiza a árvore `<App />` com o idioma correspondente (`i18n.changeLanguage(lng)`) e gera o ficheiro `dist/<rota>/index.html`.
  3. Injecta no `<head>` de cada ficheiro HTML gerado os metadados exactos da rota (`<title>`, `<meta name="description">`, `<link rel="canonical">`, `<link rel="alternate" hreflang="en|pt|x-default">`, Open Graph, Twitter Cards, `<meta name="robots">` e JSON-LD).
  4. No navegador, o cliente hidrata/monta sem alterar o comportamento interactivo nem as animações de `framer-motion`.
- **Benefício directo no GitHub Pages:** como `dist/index.html`, `dist/pt/index.html`, `dist/en/index.html` (e demais rotas geradas) existem como ficheiros físicos no artefacto do Pages, o servidor responde com **HTTP 200 OK** real em qualquer acesso directo ou rastreio do Googlebot.

### 3.3. Classificação Editorial de Projectos e Controlo de Indexação
- Introduzir no modelo de `src/data/projects.ts` um atributo explícito de estado editorial:
  ```ts
  export type EditorialStatus = 'verified' | 'demo' | 'unverified';
  ```
- Enquanto os 12 projectos de `src/data/projects.ts` permanecerem com estado `'demo'` (imagens Unsplash e dados demonstrativos):
  - As rotas `/projects` e `/projects/:id` (se mantidas acessíveis na navegação) são geradas com `<meta name="robots" content="noindex, nofollow">` no HTML estático e em runtime;
  - **Nenhuma** dessas rotas demonstrativas é incluída em `sitemap.xml` ou em JSON-LD;
  - Os metadados dessas páginas não as declaram como obra executada pela O+A até verificação editorial formal.

### 3.4. Tratamento de `404.html` Real no GitHub Pages
- Substituir o passo `cp dist/index.html dist/404.html` em `.github/workflows/deploy.yml` pela geração de um `dist/404.html` dedicado durante o build:
  - Contém `<meta name="robots" content="noindex, nofollow">`;
  - Não inclui `<link rel="canonical">` para a homepage;
  - Apresenta uma página 404 editorial coerente com o sistema de design O+A e ligações para regressar a `/pt/` ou `/en/`;
  - Quando o GitHub Pages serve `dist/404.html` com status HTTP `404`, os motores de pesquisa recebem simultaneamente o código HTTP `404` e o sinal `noindex`, eliminando qualquer *soft 404*.

### 3.5. Metadados, Open Graph, JSON-LD `Organization`, `robots.txt` e `sitemap.xml`
- **Metadados por página (`src/seo/metadata.ts` + chaves em `src/locales/pt.ts` e `src/locales/en.ts`):**
  - Títulos e descrições únicos, concisos e fiéis ao `docs/CONTENT_GUIDE.md` (sem superlativos vazios nem promessas não comprovadas).
  - Imagem Open Graph local e optimizada (`1200×630 px`) em `public/images/og-oa-workshop.jpg`, derivada de fotografia oficial já autorizada no repositório, referenciada com URL absoluto `https://www.oa-workshop.com/images/og-oa-workshop.jpg`.
- **JSON-LD `Organization`:**
  - Apenas na homepage (`/` / `/pt/` / `/en/`), contendo exclusivamente dados verificados no repositório:
    - `@type`: `"Organization"` (ou `"ArchitecturalFirm"` se aprovado)
    - `name`: `"O+A Architects and Planners"` / `"O+A Arquitectos e Planeadores"`
    - `alternateName`: `"O+A Workshop"`
    - `url`: `"https://www.oa-workshop.com/"`
    - `logo`: `"https://www.oa-workshop.com/logo.png"`
    - `email`: `"oa@oa-workshop.com"`
    - `founder`: `[{ "@type": "Person", "name": "Osvaldo Luís" }, { "@type": "Person", "name": "Artur Simão" }]`
    - `foundingDate`: `"2025"`
  - Sem inventar moradas de rua, números de telefone, registos comerciais ou perfis de redes sociais (`sameAs` apenas se confirmados pela O+A).
- **`robots.txt` e `sitemap.xml`:**
  - `public/robots.txt` com `User-agent: *`, `Allow: /` e `Sitemap: https://www.oa-workshop.com/sitemap.xml`.
  - `dist/sitemap.xml` gerado automaticamente no build apenas com as páginas canónicas aprovadas (`HTTP 200`, `indexable: true`), incluindo referências `xhtml:link rel="alternate" hreflang="..."` recíprocas e sem preencher `<lastmod>` com a data artificial de compilação.

---

## 4. Âmbito Incluído (Apenas Após Aprovação)

### Etapa A — Fotografia de referência
1. Confirmar `git status --short --branch`, `HEAD`, integridade do `AGENTS.md`, fluxo de publicação e base de trabalho antes de editar código.
2. Inventariar todos os URLs actuais, vínculos internos (`Header`, `Footer`, `HeroSection`, `WorkshopSection`, `ProjectsSection`, `Projects`, `ProjectDetail`), respostas HTTP em `https://www.oa-workshop.com/` (incluindo `/robots.txt` e `/sitemap.xml` se acessíveis) e estado real do domínio.
3. Registar a linha de base técnica: HTML entregue sem JavaScript, hierarquia de headings (`<h1>`–`<h4>`), atributos `lang`, ligações `#` e métricas visuais/estruturais.

### Etapa B — Solução de URLs, Router e Pré-renderização Estática
1. Implementar o esquema de rotas limpas e variantes linguísticas (`/`, `/pt/`, `/en/`), preservando as âncoras da homepage (`#workshop`, `#portfolio`, `#team`, `#contact`, `#top`) e redireccionamento de compatibilidade para links antigos em hash.
2. Actualizar o comutador de idioma em `Header.tsx` e a inicialização em `src/i18n.ts` para ler o idioma prioritariamente a partir do URL da rota, mantendo `localStorage` como preferência secundária.
3. Implementar o pipeline de pré-renderização estática no build (`npm run build`) para gerar ficheiros `index.html` autónomos por rota e idioma compatíveis com GitHub Pages (status HTTP 200 real).
4. Garantir `document.documentElement.lang` exacto no HTML estático de cada página e `hreflang` recíproco (`pt`, `en`, `x-default`) entre equivalentes publicados.

### Etapa C — Metadados, Dados Estruturados e Descoberta
1. Criar módulo tipado `src/seo/` e chaves PT/EN em `src/locales/` para gerar `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph e Twitter Cards únicos por página e idioma.
2. Criar imagem institucional de partilha social (`public/images/og-oa-workshop.jpg`) a partir dos recursos oficiais existentes.
3. Injectar JSON-LD `Organization` apenas com factos verificados.
4. Gerar `robots.txt` e `sitemap.xml` contendo exclusivamente URLs canónicas `200 OK` e aprovadas para indexação (zero URLs em hash, zero páginas `noindex`).
5. Gerar `dist/404.html` dedicado com `<meta name="robots" content="noindex, nofollow">` e actualizar `.github/workflows/deploy.yml` se necessário para não sobrescrever `dist/404.html` com `dist/index.html`.

### Etapa D — Confiabilidade de Conteúdo e Higiene de Links
1. Classificar explicitamente em `src/data/projects.ts` as 12 entradas actuais como demonstrativas (`editorialStatus: 'demo'`), aplicando `noindex, nofollow` às rotas `/projects` e `/projects/:id` e excluindo-as do `sitemap.xml` até validação editorial.
2. Corrigir ou remover a ligação morta `<a href="#">{t('nav.privacy')}</a>` em `src/components/layout/Footer.tsx` de acordo com a orientação editorial (ex.: omitir até existir política de privacidade aprovada, conforme a regra de `docs/QUALITY.md`).
3. Rever hierarquia semântica de cabeçalhos na página inicial (garantir presença de `<h1>` claro e descritivo na abertura/página inicial sem alterar a estética visual do `HeroSection`).

### Etapa E — Validação Técnica, Visual e Entrega
1. Testar em servidor estático local (`npm run build && npm run preview` / servidor estático sem fallback SPA) os códigos HTTP e o HTML bruto (`curl` / leitura sem JS) de `/`, `/pt/`, `/en/`, `/projects`, `/projects/milan` e de uma rota inexistente (`/rota-inexistente-404`).
2. Validar no navegador: navegação directa, refresh em sub-rotas, âncoras `#workshop`/`#portfolio`/`#team`/`#contact`/`#top`, filtros de portefólio, abertura de perfis da equipa, alternância PT/EN, navegação por teclado e `prefers-reduced-motion`.
3. Validar sintaxe de `sitemap.xml`, `robots.txt`, reciprocidade de `hreflang`, consistência de `canonical` e validade sintáctica do JSON-LD.
4. Executar `npm run lint`, `npm run build` e `git diff --check`, bem como verificação visual em `375 px`, `768 px` e `1440 px`.
5. Actualizar `PROJECT_MAP.md` e este plano com todos os ficheiros criados/alterados, decisões e resultados, entregando a branch para revisão sem merge em `main` nem publicação automática.

---

## 5. Fora do Âmbito

- Reformas visuais, alterações de layout ou redesign de `HeroSection`, `WorkshopSection`, `StudioAboutSection`, `ProjectsSection`, `TeamSection`, `ContactSection`, `Header` ou `Footer`.
- Criação de back-end, SSR de runtime (Node server em produção), funções serverless, base de dados, CMS ou mudança de alojamento fora do GitHub Pages.
- Adição de pacotes pesados de terceiros quando a gestão de `<head>` e a pré-renderização puderem ser feitas de forma nativa com React 19 / `react-dom/server` e TypeScript.
- Alteração de conteúdo editorial substantivo ou invenção de dados de projectos, clientes, moradas, telefones ou redes sociais.
- Configuração externa de DNS, Google Search Console, Google Business Profile ou ferramentas de analítica/cookies.
- Campanhas pagas, *link building* ou promessas de posicionamento comercial.

---

## 6. Ficheiros Previstos

### Ficheiros existentes a consultar / actualizar (após aprovação)
| Ficheiro | Responsabilidade na intervenção |
|---|---|
| `index.html` | Template HTML base com marcadores/estrutura limpa para pré-renderização e metadados por omissão |
| `src/main.tsx` | Hidratação/montagem cliente, substituição de `HashRouter` por `BrowserRouter` e compatibilidade com hashes antigos |
| `src/App.tsx` | Suporte às rotas linguísticas (`/`, `/pt/*`, `/en/*`), sincronização de idioma por rota, metadados e rota `*` (404) |
| `src/i18n.ts` | Detecção prioritária de idioma pela rota URL + persistência em `localStorage` |
| `src/components/layout/Header.tsx` | Comutador `ENG \| PT` e ligações de navegação adaptadas às rotas linguísticas limpas |
| `src/components/layout/Footer.tsx` | Ligações rápidas adaptadas ao idioma activo e remoção/tratamento do link provisório `href="#"` (`Privacidade`) |
| `src/data/projects.ts` | Adição do campo tipado `editorialStatus` (`'verified' \| 'demo'`) para controlo rigoroso de indexação |
| `src/pages/Projects.tsx` | Integração de metadados da página e directiva `noindex` enquanto o catálogo for demonstrativo |
| `src/pages/ProjectDetail.tsx` | Integração de metadados por projecto, directiva `noindex` para entradas demonstrativas e estado 404 |
| `src/locales/pt.ts`, `src/locales/en.ts` | Chaves de metadados SEO (`seo.home`, `seo.projects`, `seo.notFound`) com paridade estrita PT/EN |
| `package.json` | Ajuste do script `build` para executar a pré-renderização estática e geração do `sitemap.xml` após `vite build` |
| `.github/workflows/deploy.yml` | Preservar o `dist/404.html` dedicado gerado pelo build em vez de sobrescrevê-lo com `cp dist/index.html dist/404.html` |
| `PROJECT_MAP.md` | Registar os novos módulos de SEO, pré-renderização e ficheiros públicos (`robots.txt`, `sitemap.xml`) |
| `plans/README.md` | Registar e actualizar o estado do Plano 080 |

### Novos ficheiros previstos (após aprovação)
| Ficheiro | Responsabilidade |
|---|---|
| `src/seo/metadata.ts` | Definição tipada de metadados por rota/idioma, URLs canónicas, `hreflang`, Open Graph e JSON-LD `Organization` |
| `src/seo/DocumentHead.tsx` | Sincronização de `<title>`, `<meta>`, `<link rel="canonical">` e `hreflang` durante a navegação SPA no cliente |
| `src/pages/NotFound.tsx` | Página 404 editorial bilingue com sinalização explícita `noindex, nofollow` |
| `scripts/prerender.tsx` | Script de build (executado via Node/Vite SSR) que gera os ficheiros HTML estáticos por rota/idioma, `dist/404.html` e `dist/sitemap.xml` |
| `public/robots.txt` | Regras de rastreio público e referência canónica para `https://www.oa-workshop.com/sitemap.xml` |
| `public/images/og-oa-workshop.jpg` | Imagem institucional optimizada (`1200×630 px`) para partilha Open Graph / Twitter Card |

---

## 7. Riscos e Salvaguardas

| Risco | Impacto | Salvaguarda / Mitigação |
|---|---|---|
| **Quebra de deep links no GitHub Pages ao sair de `HashRouter`** | Alto (HTTP 404 em sub-rotas se não existir ficheiro físico) | Gerar obrigatoriamente `dist/<rota>/index.html` para todas as rotas públicas no passo de build e validar num servidor estático puro antes de qualquer entrega. |
| **Quebra de links antigos com `#/` (`/#/projects`, `/#workshop`)** | Médio | Manter suporte nativo às âncoras de secção (`#workshop`, `#portfolio`, `#team`, `#contact`, `#top`) e redireccionar no cliente hashes de rota antigos (`/#/projects...`) para os caminhos limpos equivalentes. |
| **Indexação acidental de projectos demonstrativos (Unsplash)** | Alto (risco editorial e reputacional) | Marcar explicitamente o catálogo `src/data/projects.ts` como `editorialStatus: 'demo'`, aplicar `<meta name="robots" content="noindex, nofollow">` em `/projects` e `/projects/:id` e excluí-los do `sitemap.xml`. |
| **Incompatibilidade de APIs do navegador (`window`, `localStorage`, `document`) durante o prerender em Node** | Médio (falha no `npm run build`) | Isolar acessos a `window`/`document`/`localStorage` com guardas `typeof window !== 'undefined'` (já presentes em `src/i18n.ts`) e testar o script `prerender` em todas as rotas. |
| **Conflito entre a branch actual (`codex/redesign-our-team-section`) e a futura branch SEO-01** | Baixo | Não alterar código nem fazer commits na branch `codex/redesign-our-team-section`; criar `codex/feature-seo01-indexacao` apenas após aprovação e definição da base pelo utilizador. |
| **Regressão visual na página inicial** | Alto | Não alterar estilos nem estrutura visual das secções; validar com capturas em `375 px`, `768 px` e `1440 px` antes e depois. |

---

## 8. Critérios de Aceitação

1. **HTML Estático Rastreável (HTTP 200):** As páginas principais aprovadas (`/`, `/pt/`, `/en/`) existem como ficheiros HTML estáticos reais em `dist/` e contêm, sem execução de JavaScript, o texto essencial da página, cabeçalhos semânticos (`<h1>`, `<h2>`), `<html lang="...">` correcto e ligações `<a href="...">` rastreáveis.
2. **Metadados Completos e Únicos:** Cada página gerada possui `<title>`, `<meta name="description">`, `<link rel="canonical">` absoluto (`https://www.oa-workshop.com/...`), Open Graph (`og:title`, `og:description`, `og:url`, `og:image`, `og:type`, `og:locale`) e Twitter Card coerentes com o idioma da página.
3. **Internacionalização SEO (`hreflang`):** As variantes `/pt/` e `/en/` possuem URLs independentes e referenciam-se mutuamente com `<link rel="alternate" hreflang="pt">`, `<link rel="alternate" hreflang="en">` e `<link rel="alternate" hreflang="x-default">`.
4. **Zero URLs em Hash no Sitemap/Canonical:** Nenhum `<link rel="canonical">`, `hreflang` ou entrada de `sitemap.xml` contém `#`.
5. **Protecção Editorial de Conteúdo Demonstrativo:** As rotas baseadas em `src/data/projects.ts` (`/projects` e `/projects/:id`), enquanto não verificadas editorialmente, apresentam `<meta name="robots" content="noindex, nofollow">` e estão ausentes de `sitemap.xml`.
6. **JSON-LD Verificável:** O bloco `application/ld+json` (`Organization`) contém apenas factos confirmados no repositório, sem dados inventados, e passa validação estrutural JSON.
7. **404 Real e Sem Soft 404:** `dist/404.html` é uma página 404 dedicada com `noindex, nofollow` e sem canonical para a homepage.
8. **Zero Regressões de UI/UX e Qualidade:** `npm run lint`, `npm run build` e `git diff --check` passam com zero erros; a navegação, âncoras, filtros, equipa, alternância PT/EN, teclado e `prefers-reduced-motion` funcionam sem regressão em `375 px`, `768 px` e `1440 px`.

---

## 9. Verificações Previstas (na fase de execução)

- [ ] `git status --short --branch` e criação limpa da branch `codex/feature-seo01-indexacao`
- [ ] `npm run lint`
- [ ] `npm run build` (incluindo pré-renderização estática e geração de `sitemap.xml` e `404.html`)
- [ ] `git diff --check`
- [ ] Inspecção do HTML gerado em `dist/index.html`, `dist/pt/index.html`, `dist/en/index.html`, `dist/projects/index.html` e `dist/404.html` sem JavaScript
- [ ] Validação de `dist/sitemap.xml` e `dist/robots.txt`
- [ ] Verificação visual e funcional em `375 px`, `768 px` e `1440 px` (PT e EN)

---

## 10. Questões de Alinhamento Editorial (Decisões para Aprovação)

As seguintes decisões têm recomendação técnica definida para não bloquear o planeamento, podendo o utilizador confirmá-las ou ajustá-las no momento da aprovação:

1. **Idioma da raiz `/` (`https://www.oa-workshop.com/`):**
   - *Recomendação:* Manter `/` renderizado em inglês (`en`, alinhado com o actual `defaultLanguage = 'en'` de `src/i18n.ts` e `lang="en"` de `index.html`) como `x-default`, disponibilizando `/pt/` (`lang="pt"`) e `/en/` (`lang="en"`) como rotas linguísticas explícitas. Em alternativa, `/` pode servir português (`pt`) se a O+A preferir priorizar o mercado lusófono na raiz.
2. **Destino das rotas demonstrativas `/projects` e `/projects/:id` (`src/data/projects.ts`):**
   - *Recomendação:* Manter as rotas acessíveis na aplicação mas marcadas com `<meta name="robots" content="noindex, nofollow">` e fora do `sitemap.xml` até que o conteúdo demonstrativo (Unsplash) seja substituído por fichas reais verificadas pela O+A; ou, se preferido pela O+A, apontar a ligação `Projects / Projectos` do menu directamente para a secção oficial `/#portfolio` da homepage.
3. **Ligação `Privacidade / Privacy` (`href="#"`) no rodapé (`Footer.tsx`):**
   - *Recomendação:* Omitir o link inactivo `href="#"` até existir texto/página de privacidade aprovada (cumprindo `docs/QUALITY.md` e `docs/CONTENT_GUIDE.md`).
4. **Base Git para a branch `codex/feature-seo01-indexacao`:**
   - *Recomendação:* Caso o trabalho concluído na branch actual `codex/redesign-our-team-section` (`plans/133-redesign-seccao-our-team.md`) deva fazer parte da versão pública, integrar primeiro o Plano 133 em `main` (ou criar `codex/feature-seo01-indexacao` a partir dessa base); caso contrário, criar `codex/feature-seo01-indexacao` directamente a partir de `main` (`6e4f301`).

---

## 11. Registo de Decisões e Desvios

- **2026-10-28:** Plano `080-seo-infraestrutura-indexacao.md` consolidado no estado `PROPOSTO` na branch dedicada `codex/plan-seo01-indexacao` para revisão e auditoria. Nenhum ficheiro de código da aplicação ou build foi alterado nesta branch; a implementação SEO só será executada após aprovação formal na branch `codex/feature-seo01-indexacao`.

---

## 12. Resultado

Plano consolidado no estado `PROPOSTO` e disponibilizado para auditoria na branch `codex/plan-seo01-indexacao`. Aguarda aprovação formal (`APROVADO: plans/080-seo-infraestrutura-indexacao.md`).
