# Simplificação estrutural da página inicial e remoção das secções antigas (R04)

> **Estado:** CONCLUÍDO
> **Data:** 2026-10-27
> **Branch prevista:** `codex/feature-hero-opening-reform`
> **Aprovação:** aprovado pelo utilizador em 2026-10-27 (`Aprovado`)

## Objectivo

Simplificar a estrutura da página inicial (`src/pages/Home.tsx`), removendo as secções antigas e repetidas (três instâncias de `CategoryMapSection` para Architecture, Urban Planning e Research, bem como `NewsSection` / Journal) e preservando exclusivamente a sequência aprovada nas fases R01.1, R02.1 e R03.

## Contexto e estado actual

Na branch activa `codex/feature-hero-opening-reform`:

- **R01.1 (`HeroSection.tsx`):** abertura interactiva O+A aprovada (`#top`).
- **R02.1 (`WorkshopSection.tsx`):** carrossel interactivo das três áreas (`Architecture`, `Urban Planning`, `Research`) aprovado (`#workshop`).
- **R03 (`ProjectsSection.tsx`):** antiga secção "Our Projects / Os Nossos Projectos" já reformada e aprovada como a nova galeria `+ PORTFOLIO` (`#portfolio`), com grelha 3×2 e 8 filtros.
- **Secções antigas ainda presentes em `src/pages/Home.tsx`:**
  1. `CategoryMapSection` (`id="architecture"`) — secção independente com mapa de Arquitectura.
  2. `CategoryMapSection` (`id="urbanism"`) — secção independente com mapa de Urbanismo.
  3. `CategoryMapSection` (`id="research"`) — secção independente com mapa de Investigação.
  4. `NewsSection` — secção antiga Journal / publicações.
  *(Nota: a antiga secção "Our Projects" correspondia à versão anterior de `ProjectsSection.tsx`, que foi substituída in-place pela galeria `+ PORTFOLIO` na fase R03; por isso, `ProjectsSection.tsx` é preservado na posição 3 da página inicial.)*

## Âmbito incluído

1. **Composição de `src/pages/Home.tsx` (Etapa B):**
   - Manter apenas, nesta ordem exacta:
     1. `HeroSection` (`#top`)
     2. `WorkshopSection` (`#workshop`)
     3. `ProjectsSection` (`#portfolio` — galeria `+ PORTFOLIO` aprovada em R03)
     4. `TeamSection` (`#team`)
     5. `ContactSection` (`#contact`)
     6. `Footer` (renderizado em `src/App.tsx`)
   - Remover de `src/pages/Home.tsx` as três instâncias de `CategoryMapSection` (`architecture`, `urbanism`, `research`) e a instância de `NewsSection`.
   - Limpar as importações que deixam de ser utilizadas em `src/pages/Home.tsx` (`CategoryMapSection`, `NewsSection`, `ARCHITECTURE_PROJECTS`, `URBANISM_PROJECTS`, `RESEARCH_PROJECTS`, `COMMON_MARKERS`).
2. **Navegação e ligações internas (Etapa C):**
   - Em `src/components/home/WorkshopSection.tsx`: actualizar o efeito que escuta as âncoras `#architecture`, `#urbanism` e `#research` para activar o slide correspondente no carrossel (`setActiveId`) e encaminhar o foco/scroll para a secção `#workshop` (em vez de procurar as secções de mapa removidas).
   - Em `src/components/layout/Header.tsx` e `src/components/layout/Footer.tsx`: substituir a ligação obsoleta `/#expertise` (cujo destino não existe na página inicial) por `/#portfolio`, garantindo que todos os itens de navegação apontam para destinos reais e activos (`/#workshop`, `/#portfolio`, `/projects`, `/#contact`, `/#top`).
   - Em `src/App.tsx`: melhorar `ScrollToTop` para suportar deslocação suave até ao elemento identificado por `hash` (ex.: `#workshop`, `#portfolio`, `#team`, `#contact`, `#top`) quando presente na rota, evitando âncoras inertes em `HashRouter`.
3. **Preservação de dados e ficheiros (Etapa D):**
   - Preservar integralmente `src/data/projects.ts` e as rotas `/projects` (`src/pages/Projects.tsx`) e `/projects/:id` (`src/pages/ProjectDetail.tsx`).
   - Manter os ficheiros `src/components/home/CategoryMapSection.tsx` e `src/components/home/NewsSection.tsx` no repositório sem os renderizar em `Home.tsx`, registando o seu estado como não referenciados na página inicial em `PROJECT_MAP.md`.
4. **Acabamento visual e documentação (Etapa E):**
   - Confirmar a transição contínua entre `WorkshopSection` (`#050505`), `ProjectsSection` (`#0a0a0a`), `TeamSection` (`bg-black-900`) e `ContactSection` (`bg-black-800`), sem espaços vazios, divisórias duplicadas ou quebras de espaçamento.
   - Actualizar `PROJECT_MAP.md` para reflectir a nova composição de `Home.tsx`.

## Fora do âmbito

- Alterar o design ou conteúdo aprovados de `HeroSection`, `WorkshopSection`, `ProjectsSection` (`+ PORTFOLIO`), `TeamSection`, `ContactSection` ou `Footer`.
- Eliminar `src/data/projects.ts` ou as rotas `/projects` e `/projects/:id`.
- Introduzir novas dependências, funcionalidades ou back-end.
- Fazer merge em `main` ou publicar em produção.

## Ficheiros previstos

- `plans/129-simplificacao-estrutural-r04.md` (novo plano)
- `plans/README.md` (registo do plano 129)
- `src/pages/Home.tsx` (remoção das secções antigas e importações não utilizadas)
- `src/components/home/WorkshopSection.tsx` (ajuste de âncoras `#architecture`, `#urbanism`, `#research`)
- `src/components/layout/Header.tsx` (actualização de `/#expertise` para `/#portfolio`)
- `src/components/layout/Footer.tsx` (actualização de `/#expertise` para `/#portfolio`)
- `src/App.tsx` (suporte a scroll para âncoras de secção na página inicial)
- `PROJECT_MAP.md` (actualização do estado dos componentes da página inicial)

## Etapas

1. **Etapa A — Análise:** concluída; mapeadas todas as referências a `CategoryMapSection`, `NewsSection`, `#architecture`, `#urbanism`, `#research` e `#expertise`.
2. **Etapa B — Remoção em `Home.tsx`:** retirar as três instâncias de `CategoryMapSection` e `NewsSection` e limpar as importações.
3. **Etapa C — Correcção de navegação:** actualizar `WorkshopSection.tsx`, `Header.tsx`, `Footer.tsx` e `App.tsx`.
4. **Etapa D & E — Preservação de dados, acabamento visual e mapa:** actualizar `PROJECT_MAP.md` e verificar o alinhamento entre secções.
5. **Validação:** executar `npm run lint`, `npm run build`, `git diff --check` e verificar visualmente em `375 px`, `768 px` e `1440 px`.

## Riscos e salvaguardas

- **Risco:** confundir `ProjectsSection.tsx` com a secção antiga "Our Projects" e remover o novo Portfolio.
  - **Salvaguarda:** na fase R03 (`plans/128-portfolio-section-r03.md`), `ProjectsSection.tsx` foi transformado na nova secção `+ PORTFOLIO` (`id="portfolio"`). Por isso, `ProjectsSection.tsx` é mantido em `Home.tsx` como a 3.ª secção obrigatória.
- **Risco:** quebrar a página `/projects` ou `/projects/:id` ao mexer nas importações de `Home.tsx`.
  - **Salvaguarda:** `src/data/projects.ts` permanece intacto; apenas as importações não utilizadas em `Home.tsx` são removidas.

## Critérios de aceitação

1. As secções antigas (3× `CategoryMapSection` com mapa e `NewsSection` / Journal, além da antiga cronologia já substituída em R03) não aparecem na página inicial.
2. A página inicial exibe exclusivamente: `HeroSection` → `WorkshopSection` → `ProjectsSection` (`+ PORTFOLIO`) → `TeamSection` → `ContactSection` → `Footer`.
3. O carrossel Architecture / Urban Planning / Research e a galeria `+ PORTFOLIO` permanecem intactos e funcionais.
4. Não existem ligações quebradas nem referências órfãs a `#architecture`, `#urbanism`, `#research` ou `#expertise`.
5. `npm run lint`, `npm run build` e `git diff --check` passam sem erros.
6. Verificação visual validada em `375 px`, `768 px` e `1440 px`.

## Verificações

- [x] `npm run lint` (0 erros)
- [x] `npm run build` (`tsc -b && vite build` concluído com sucesso; bundle JS reduzido para `487.14 kB`)
- [x] `git diff --check` (0 problemas)
- [x] Inspecção visual em `375 px`, `768 px` e `1440 px` (`r04-375.png`, `r04-768.png`, `r04-1440.png`)

## Registo de decisões e desvios

- `ProjectsSection.tsx` corresponde à nova galeria `+ PORTFOLIO` implementada em R03, pelo que permanece na página inicial na posição 3 definida pela especificação R04.
- Os ficheiros `CategoryMapSection.tsx` e `NewsSection.tsx` foram desacoplados de `Home.tsx` sem apagar os ficheiros do disco nesta etapa, evitando remoções destrutivas desnecessárias.

## Resultado

Implementação R04 concluída e validada na branch `codex/feature-hero-opening-reform`. A página inicial apresenta exclusivamente `HeroSection` (`#top`) → `WorkshopSection` (`#workshop`) → `ProjectsSection` (`#portfolio`) → `TeamSection` (`#team`) → `ContactSection` (`#contact`) → `Footer`.
