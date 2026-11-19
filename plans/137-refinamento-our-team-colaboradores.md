# Plano 137 — Refinamento Editorial e Visual da Secção Our Team (Colaboradores)

> **Estado:** EM VALIDAÇÃO — implementado e verificado na branch `codex/feat-refinamento-our-team`; aguarda revisão final antes de integração.
> **Data:** 2026-11-19
> **Base de referência (`codex/feat-revisao-landing-oa-nov2026`):** `ea3cf31` (`main` intacta em `e468fe7`)
> **Branch prevista (após aprovação):** `codex/feat-refinamento-our-team`
> **Aprovação:** concedida em 2026-11-19 (`APROVADO: plans/137-refinamento-our-team-colaboradores.md`)
> **Referências:** `OA rev OL 161126.pdf` (Pág. 6), `oa_team_portraits_from_pdf.zip`, [AGENTS.md](../AGENTS.md), [PROJECT_MAP.md](../PROJECT_MAP.md), [DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md), [OA_Design_Mastery_Playbook.md](../docs/OA_Design_Mastery_Playbook.md), [QUALITY.md](../docs/QUALITY.md), [Plano 136](136-revisao-landing-oa-nov2026.md).

---

## 1. Objectivo

Refinar exclusivamente a secção `Our Team` (`#team`) para reproduzir com fidelidade a composição editorial da página 6 de `OA rev OL 161126.pdf` — integrando as seis fotografias reais com fundo transparente extraídas do pacote `oa_team_portraits_from_pdf.zip`, reorganizando os colaboradores numa única faixa horizontal equilibrada em desktop e removendo a estética pesada de cartões e monogramas duplicados — preservando integralmente o comportamento interactivo, os textos existentes, a acessibilidade e o bilinguismo PT/EN.

Justificação formal de novo plano numerado (`AGENTS.md` § 2): o [Plano 136](136-revisao-landing-oa-nov2026.md) previa expressamente colaboradores sem fotografia (`image: null`) e manteve a grelha em cartões com monogramas; a inclusão de seis novos recursos binários e a remodelação visual da grelha para 6 colunas numa branch separada configuram expansão de âmbito que requer plano próprio aprovado antes da execução.

---

## 2. Diagnóstico do Estado Actual (Código + Browser vs. Pág. 6 do PDF + ZIP)

Inspecção realizada sobre `http://127.0.0.1:4173/` (`1440 × 900`), os componentes em `src/components/home/`, `src/data/team.ts`, `src/locales/en.ts`, `src/locales/pt.ts`, a Pág. 6 de `OA rev OL 161126.pdf` e o ficheiro `oa_team_portraits_from_pdf.zip`.

### 2.1. Desvios visuais e estruturais identificados

1. **Grelha 3 × 2 em vez de faixa horizontal de 6 colunas em desktop:** Em [team.css](../src/components/home/team.css#L658-L663), `.team-collaborators-grid` define `repeat(3, minmax(0, 1fr))` a partir de `1024 px` dentro de `max-width: 74rem`, produzindo duas filas de três cartões altos em `1440 × 900` em vez dos seis colaboradores lado a lado apresentados na Pág. 6 do PDF.
2. **Contentor envolvente e estética de cartões em conflito com a Pág. 6 e o Sistema de Design:** O bloco expandido envolve os colaboradores numa caixa arredondada com borda terracota, sombra densa e gradientes (`.team-collaborators-box`), precedida por anéis concêntricos (`.team-discover-ring`) e haste vertical (`.team-collaborators-stem`), enquanto cada colaborador usa moldura quadrada com borda laranja e brilhos radiais (`.team-avatar--collaborator`, `.team-avatar-glow`), contrariando também [DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md#L21-L24) e a composição sobre fundo preto limpo da Pág. 6.
3. **Ausência das fotografias reais nos colaboradores:** Em [src/data/team.ts](../src/data/team.ts#L74-L79), todos os seis colaboradores possuem `image: null`.
4. **Duplicação de iniciais dentro e abaixo dos avatares:** [TeamAvatar.tsx](../src/components/home/TeamAvatar.tsx#L47-L51) apresenta o monograma dentro do quadro e [TeamMember.tsx](../src/components/home/TeamMember.tsx#L25-L67) repete o mesmo monograma por baixo (`.team-member-initials`), gerando pares redundantes (`MM` + `MM`, `EC` + `EC`, `LM` + `LM`, `MZ` + `MZ`, `ND` + `ND`, `IJ` + `IJ`, bem como `OL`/`AS` junto aos retratos dos fundadores).
5. **Hierarquia cromática desalinhada da Pág. 6:** Nos colaboradores, os nomes estão a branco (`#FFFFFF`) e as funções a cinzento (`#b2aca6`), quando a referência da Pág. 6 utiliza **nome em laranja O+A (`#ED7D31`)**, **função em branco (`#FFFFFF`)**, **informação secundária em cinzento claro** e **`View profile` discreto** abaixo de cada perfil.

### 2.2. Auditoria técnica das 6 fotografias reais (`oa_team_portraits_from_pdf.zip`)

Todos os ficheiros verificados com `sharp` são PNG RGBA de 4 canais (`hasAlpha: true`), recortados em fundo transparente e com tratamento monocromático P&B:

| Ficheiro | Dimensões | Tamanho PNG | Observação técnica |
|---|---:|---:|---|
| `mivas-massingue.png` | `350 × 350 px` | `73 667` B | Recorte de tronco; boa nitidez |
| `edson-camba.png` | `375 × 376 px` | `66 877` B | Recorte de tronco; boa nitidez |
| `leticia-munguambe.png` | `131 × 198 px` | `21 656` B | **Resolução nativa inferior** — não ampliar excessivamente nem gerar detalhe artificial; exigir altura de palco contida (`max-height`) e `object-contain` alinhado pela base |
| `maxime-zabrodin.png` | `343 × 365 px` | `90 641` B | Recorte de tronco; boa nitidez |
| `neide-daude.png` | `321 × 420 px` | `82 507` B | Recorte ligeiramente mais alto; equilibrar escala visual pela altura do palco com `object-contain object-bottom` |
| `imran-jafar.png` | `326 × 350 px` | `71 704` B | Recorte de tronco; boa nitidez |

### 2.3. Divergências editoriais registadas separadamente (sem alteração neste plano)

Em cumprimento estrito da instrução de **não alterar nomes, cargos ou experiências profissionais** nesta tarefa:

- **Ortografia de nome:** `src/data/team.ts` grafa `Letícia Muguambe`, enquanto a Pág. 6 do PDF grafa `Leticia Munguambe` (mesma grafia do ficheiro `leticia-munguambe.png` no ZIP). Preserva-se `Letícia Muguambe` no código e associa-se o recurso `leticia-munguambe.webp`.
- **Gralhas do PDF já corrigidas no código:** mantêm-se as grafias actuais de `en.ts`/`pt.ts` (`Technical Director` em vez de `TECNICAL DIRECTOR`, `Construction Technician` em vez de `Construction Tecnician`, `IT & Marketing` em vez de `It & Marqueting`).
- **Linhas académicas visíveis na Pág. 6:** o PDF mostra linhas abaixo do cargo (`Bch Architect and Planner,`, `Bch Civil Eng and Construction,`, `Geography / Msc Geography (on going)`, `Architecture and urban Planner / Msc Enginneiring`, `Architecture and urban Planner`, `IT`) que não constam actualmente de `team.ts` nem das traduções. Sem aprovação editorial própria, não serão criadas nem reescritas; a linha secundária em cinzento claro utilizará exclusivamente o campo já existente e traduzido `team.categories[member.category]`.

---

## 3. Âmbito Incluído

1. **Ramo de trabalho isolado:** após aprovação expressa, criar `codex/feat-refinamento-our-team` a partir de `codex/feat-revisao-landing-oa-nov2026` (`1aed95a`).
2. **Integração e optimização de imagens (`public/images/team/`):**
   - Copiar os seis `.png` originais para `public/images/team/` sem reconstruir rostos nem adicionar conteúdo artificial.
   - Gerar os correspondentes `.webp` com transparência alfa preservada através de [scripts/optimize-images.mjs](../scripts/optimize-images.mjs) (`sharp` `quality: 84`, `effort: 6`, `reductionEffort: 6`), validando visualmente fundo transparente, ausência de halos claros e nitidez.
   - Associar as seis imagens WebP em [src/data/team.ts](../src/data/team.ts) a cada colaborador (`image: { src: '/images/team/<slug>.webp', objectPosition: '50% 100%' }`).
3. **Remodelação visual da composição (`TeamSection.tsx`, `TeamMember.tsx`, `TeamAvatar.tsx`, `team.css`):**
   - **Fundo e faixa editorial:** integrar o bloco dos colaboradores directamente sobre fundo preto/quase preto (`#070707` / `#090909`) removendo a caixa arredondada com borda laranja e brilhos decorativos, preservando o cabeçalho editorial horizontal `OUR TEAM` — linha — `OUR COLLABORATORS`.
   - **Grelha responsiva sem cartões gigantes:**
     - Desktop largo (`>= 1280 px`, ajustando se necessário para cobrir `1366 × 768` e `1440 × 900` com largura útil ampliada do contentor): **6 colunas numa única linha horizontal** equilibrada.
     - Tablet largo / desktop estreito (`1024 px–1279 px`, ex.: `1024 × 768`): **3 colunas** equilibradas (2 filas limpas sem comprimir rostos nem cortar texto).
     - Tablet (`640 px–1023 px`, ex.: `768 × 1024`): **2 ou 3 colunas** equilibradas consoante legibilidade sem overflow.
     - Mobile (`375 × 812`): **2 colunas** (ou `1 coluna` abaixo de `360 px`), com altura contida, sem cartões altos e sem deslocação horizontal.
   - **Retratos monocromáticos com transparência alinhados pela base:**
     - Criar variante visual limpa para retratos recortados (`variant="cutout"` ou equivalente em `TeamAvatar.tsx`) sem borda laranja, sem brilho radial nem grelha interna, usando `object-contain object-bottom` em palco de altura uniforme que mantenha os seis bustos proporcionais e preserve a integridade visual de `leticia-munguambe.webp`.
   - **Fim da duplicação de iniciais:**
     - Quando existir `member.image` com fonte válida e sem falha de carregamento, não renderizar `.team-member-initials` por baixo da fotografia nem mostrar o monograma sobreposto (aplicado nos colaboradores e também limpo em caso de retrato presente na liderança conjunta); manter o fallback de monograma apenas quando `image === null` ou em `onError`.
   - **Tipografia e acção `View profile`:**
     - Colaboradores com **nome em laranja O+A (`#ED7D31`)**, **função em branco (`#FFFFFF`)**, **área secundária (`team.categories.*`) em cinzento claro (`#B8B3AD`)** e ligação/botão **`View profile ↗` discreto e acessível** (alvo `>= 44 px` de altura, foco `:focus-visible`, alinhamento consistente pela base entre as 6 colunas).
4. **Preservação funcional:**
   - Dois fundadores sempre visíveis no topo da secção com proximidade visual melhorada em relação à faixa de colaboradores.
   - Botão `Discover our team` / `Close team` preservado e totalmente funcional (teclado, `aria-expanded`, `aria-controls`), recebendo tratamento visual discreto para eliminar os anéis concêntricos e a separação excessiva entre direcção e equipa.
   - `TeamProfilePanel` preservado com abertura/fecho acessível, trap/restauro de foco e exibição automática dos retratos no diálogo lateral.

---

## 4. Fora do Âmbito

- Alteração de outras secções da página inicial ou páginas secundárias (`HeroSection`, `WorkshopSection`, `StudioAboutSection`, `ProjectsSection`, `PortfolioProjectModal`, `ContactSection`, `Footer`, `/about`).
- Edição de nomes, cargos ou currículos/cronologias em `team.ts`, `en.ts` ou `pt.ts`.
- Carrossel horizontal automático dos colaboradores (mantido fora desta entrega conforme instrução).
- Criação de back-end, dependências npm ou integração/deploy na `main`.

---

## 5. Ficheiros Previstos

| Ficheiro | Alteração prevista |
|---|---|
| `public/images/team/*.png` (6 ficheiros) + `public/images/team/*.webp` (6 ficheiros) | Novos retratos reais transparentes dos 6 colaboradores + WebP optimizados via Sharp |
| `src/data/team.ts` | Associação dos 6 ficheiros `.webp` aos colaboradores e `objectPosition` de base |
| `src/components/home/TeamAvatar.tsx` | Variante limpa para recorte transparente alinhado pela base + supressão de monograma redundante |
| `src/components/home/TeamMember.tsx` | Remoção da duplicação `.team-member-initials` quando existe foto; linha de categoria secundária e alinhamento uniforme |
| `src/components/home/TeamSection.tsx` | Ajuste estrutural discreto do gatilho `Discover our team` e contentor da faixa horizontal |
| `src/components/home/team.css` | Grelha desktop de 6 colunas (`1366+` / `1440+`), breakpoints responsivos, remoção de caixa/bordas/gradientes nos colaboradores e nova hierarquia cromática |
| `PROJECT_MAP.md`, `plans/README.md`, `plans/137-refinamento-our-team-colaboradores.md` | Registo final de documentação e evidências |

---

## 6. Riscos e Salvaguardas

1. **Baixa resolução relativa de `leticia-munguambe.png` (`131 × 198 px`):**
   - *Salvaguarda:* definir palco de retrato em altura comedida (ex.: `~170–190 px` em desktop) com `object-contain object-bottom`, evitando upscaling excessivo que degrade o rosto ou torne inconsistentes as proporções entre os 6 bustos.
2. **Transparência e halos na conversão PNG → WebP:**
   - *Salvaguarda:* validar que `sharp(...).webp({ quality: 84, effort: 6, reductionEffort: 6 })` preserva integralmente o canal alfa sem auréola clara sobre `#070707`/`#090909` e confirmar peso optimizado.
3. **Compressão ou corte de nomes/cargos a `1366 × 768` com 6 colunas lado a lado:**
   - *Salvaguarda:* alargar o contentor da faixa de colaboradores em desktop (`max-width: min(92vw, 86rem)`), usar `minmax(0, 1fr)` com `gap` editorial moderado e tipografia proporcional, testando expressamente `1366 × 768` e `1440 × 900` em PT e EN.
4. **Regressão de acessibilidade ou de foco em `Discover our team` e `TeamProfilePanel`:**
   - *Salvaguarda:* preservar área clicável `>= 44 px`, `aria-expanded`, `aria-controls`, `:focus-visible` e restauro automático de foco após fechar o painel.

---

## 7. Critérios de Aceitação

- [x] 1. Os 6 colaboradores renderizam **numa única linha horizontal equilibrada** em desktop largo (`1366 × 768`: 6 colunas em `y = 268.75 px`, `188.33 px` cada; `1440 × 900`: 6 colunas em `y = 335.18 px`, `197.33 px` cada).
- [x] 2. As **6 fotografias reais** do ZIP estão correctamente associadas aos respectivos membros (com `.webp` optimizado e transparência RGBA 4 canais preservada sobre `#070707`).
- [x] 3. **Zero duplicação de iniciais** (`.team-member-initials` = `0` no DOM) e ausência de monogramas quando existe fotografia carregada.
- [x] 4. Retratos monocromáticos proporcionais e **alinhados pela base**, mantendo nitidez natural de `leticia-munguambe.webp` (`131 × 198 px`).
- [x] 5. Nomes em laranja O+A (`#ED7D31`), funções em branco (`#FFFFFF`) sem categoria redundante nos cartões (preservada nos perfis individuais `TeamProfilePanel`), e links discretos `View profile` com seta laranja alinhados consistentemente.
- [x] 6. `Discover our team` / `Close team` e abertura/fecho de perfis (`TeamProfilePanel`) funcionais em PT e EN.
- [x] 7. Navegação integral por teclado (`Tab`, `Enter`, `Escape`) e foco visível preservados.
- [x] 8. **Zero overflow horizontal** em `1440 × 900`, `1366 × 768`, `1024 × 768`, `768 × 1024` e `375 × 812`.
- [x] 9. Nenhuma regressão nas restantes secções nem nos testes SEO/Slideshow (`npm run lint`, `npm run build`, `npm test`, `git diff --check`).

---

## 8. Verificações Obrigatórias (pós-implementação)

1. Comandos: `npm run lint`, `npm run build`, `npm test` e `git diff --check`.
2. Capturas reais e inspecção no browser em **PT** e **EN** (estado fechado e estado expandido) para:
   - `1440 × 900`
   - `1366 × 768`
   - `1024 × 768`
   - `768 × 1024`
   - `375 × 812`
3. Comparação directa da renderização desktop com a Pág. 6 do PDF e entrega com SHA e ligação para o commit na branch de refinamento separada.

---

## 9. Registo de Decisões e Desvios

- **2026-11-19 (v1 — proposta):** Inspecção completa do estado actual no código e no servidor local (`http://127.0.0.1:4173/`) face à Pág. 6 do PDF e ao ZIP `oa_team_portraits_from_pdf.zip`. Proposta registada no Plano 137 (`PROPOSTO`); execução suspensa até aprovação expressa (`APROVADO: plans/137-refinamento-our-team-colaboradores.md`).
- **2026-11-19 (v2 — execução e validação):**
  - Ramificada a branch `codex/feat-refinamento-our-team` a partir de `codex/feat-revisao-landing-oa-nov2026` (`ea3cf31`).
  - Adicionados os 6 PNGs originais em `public/images/team/` e convertidos em `.webp` RGBA (`hasAlpha: true`) via `scripts/optimize-images.mjs` (reduções de `76,2%` a `83,8%`).
  - Mantido `objectPosition: '50% 18%'` em `src/data/team.ts` para preservar o rosto centrado em `TeamProfilePanel` (`variant="frame"` / `object-cover`), enquanto os colaboradores na faixa principal usam `variant="cutout"` (`object-contain object-bottom`, `opacity: 1`) garantindo alinhamento uniforme pela base sem cortar a cabeça/cabelo de `leticia-munguambe.webp`.
  - Mantido `Letícia Muguambe` (ortografia de código), nomes, funções e cronologias inalterados; usada a chave existente `team.categories.*` em cinzento claro (`#B8B3AD`) como linha secundária.
  - Nota de implementação ESLint: para evitar `react-hooks/set-state-in-effect` em `TeamAvatar.tsx`, imagens `variant="cutout"` renderizam com `opacity: 1` imediato (com fallback via `onError`) sem efeitos síncronos.
- **2026-11-19 (v3 — polish editorial pós-revisão):**
  - Removida dos cartões dos colaboradores a linha secundária redundante `team.categories.*` (`TeamMember.tsx` e `team.css`), mantendo `Practice area` integralmente dentro de `TeamProfilePanel.tsx`.
  - Transformados os botões rectangulares `View profile` dos colaboradores em links visuais discretos sem caixa/borda (`.team-profile-trigger--collaborator`), alinhados com os dos fundadores, mantendo alvo `min-h-11` (`44 px`), `:focus-visible` e seta laranja.
  - Ocultado o resíduo de silhueta/brilho inferior (`.team-backdrop-photo--bottom`, `.team-backdrop-glow--bottom`) para manter fundo preto puro sob os recortes P&B.
  - Uniformizada a escala visual dos bustos via `cutoutScale` CSS (`transform-origin: bottom center`, sem editar ficheiros de imagem) a partir dos limites alfa medidos com `sharp` (`edson: 1.02`, `leticia: 1.08`, `maxime: 1.01`, `neide: 1.14`, `mivas/imran: 1`), e ajustada a altura do palco em `>= 1200 px` (`10.25rem`) e `>= 1366 px` (`11.5rem`).

## 10. Resultado

- **Verificações automáticas (após última edição):**
  - `npm run lint`: `0` erros (`eslint .`).
  - `npm run build`: `optimize-images.mjs` (24 imagens WebP optimizadas, 82,1% redução total), `tsc -b`, `vite build` (`108.35 kB` CSS, `539.17 kB` JS) e `prerender.mjs` (64 rotas pré-renderizadas, `sitemap.xml` com 5 URLs canónicos).
  - `npm test`: **49/49 testes a passar** (`42` em `tests/seo-verification.test.mjs` + suíte `Slideshow regression invariants (Plan 136)` em `tests/slideshow-regression.test.mjs`, `0` falhas, `0` ignorados).
  - `git diff --check`: `0` problemas.
- **Verificação visual e funcional no navegador (`http://127.0.0.1:4173/`):**
  - `1440 × 900` (EN `/`): fechado e expandido (6 colunas horizontais uniformes em `y = 561.84 px`, `width = 197.33 px`), todos os 6 `.webp` carregados (`HTTP 200`), `.team-member-secondary` nos cartões = `0`, `.team-member-initials` = `0`, abertura do perfil de `Neide Daude` exibindo `Practice area: Architecture` + fecho por `Escape` + recolha `Close team`, `htmlWidth = 1432 <= 1440`.
  - `1200 × 900` (EN `/` e PT `/pt/`): 6 colunas horizontais numa única linha (`width = 164 px`, `y = 561.91 px` EN / `561.56 px` PT), zero corte de texto (`Tecnologias de Informação e Marketing` envolvido em `164 px`), links `View profile` discretos sem borda rectangular, `htmlWidth = 1192 <= 1200`.
  - `1024 × 768` (EN `/`): grelha responsiva 3 colunas × 2 linhas (`width = 280 px`), `htmlWidth = 1016 <= 1024`.
  - `768 × 1024` (PT `/pt/`): grelha responsiva 3 colunas × 2 linhas (`width = 205.33 px`), `Tecnologias de Informação e Marketing` sem corte, `htmlWidth = 760 <= 768`.
  - `375 × 812` (PT `/pt/` e EN `/`): grelha responsiva 2 colunas × 3 linhas (`width = 155.67 px`), `htmlWidth = 367.33 <= 375`, `0` erros de consola e `0` pedidos falhados.
  - Nota de sandbox: `page.evaluate` está desactivado na sandbox `webview_browser`; dimensões e ausência de overflow foram medidas via `boundingBox()` (`html`, `body`, cartões e textos) e estado `HTTP 200` + inspeção visual directa das capturas.
