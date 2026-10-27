# Plano 127 — Reforma da secção Architecture / Urban Planning / Research (R02.1 — Protótipo 01)

> **Estado:** CONCLUÍDO
> **Data:** 2026-10-27
> **Branch prevista:** `codex/feature-hero-opening-reform` (preservando os commits `cf5b15e` e `74e4b2e` da abertura R01.1 aprovada)
> **Aprovação:** aprovado pelo utilizador em 2026-10-27 (`"Ja esta."` com envio das imagens dos slides)

## Objectivo

Reformar a secção [`WorkshopSection.tsx`](../src/components/home/WorkshopSection.tsx) (`#workshop`), transformando-a numa experiência arquitectónica imersiva e interactiva fiel ao **Protótipo 01** aprovado e utilizando o conteúdo real e as fotografias oficiais dos **Slides 3, 4 e 5 do ficheiro `OA.pptx`**, sem alterar a abertura `HeroSection.tsx` (R01.1) nem as restantes secções do website.

---

## Contexto e estado actual

1. **Estado do Git e preservação da abertura (R01.1):**
   - A branch activa é `codex/feature-hero-opening-reform`, com os commits `cf5b15e` (R01) e `74e4b2e` (R01.1) que implementam a abertura aprovada em [`HeroSection.tsx`](../src/components/home/HeroSection.tsx).
2. **Diagnóstico inicial e recursos fornecidos:**
   - A versão anterior em árvore de trabalho dividia a secção em duas colunas com moldura `4:3` e textos genéricos.
   - Após a solicitação documentada na proposta deste plano, o utilizador forneceu as imagens dos slides oficiais, a partir das quais foram preparados os três recursos locais limpos em `public/images/`:
     - `public/images/workshop-architecture.jpg` — Vista aérea do novo campus do Instituto Politécnico de Vilankulos (Slide 3).
     - `public/images/workshop-urbanism.jpg` — Fotografia de paisagem e barragem de Massingiri (Slide 4).
     - `public/images/workshop-research.jpg` — Fotografia aérea urbana ao pôr do sol para a parceria GENO (Slide 5).

---

## Âmbito implementado

1. **Área visual principal (~78% da altura da secção em desktop — `635 px` em `810 px`):**
   - Fotografia principal em largura total, nítida (`filter: none`), com transição crossfade suave (`480 ms`) e gradiente escuro subtil restrito à base e lateral inferior esquerda para garantir contraste de leitura.
   - Bloco informativo sobreposto no canto inferior esquerdo:
     - Etiqueta `DESTAQUE` em caixa alta (`0.6875rem`, `letter-spacing: 0.24em`).
     - Título de grande impacto precedido pelo símbolo `+` em laranja (`#ED7D31`): `+ Architecture`, `+ Urban Planning`, `+ Research`.
     - Descrição do projecto alinhada verticalmente com o início do título da área.
   - Botões circulares de navegação anterior/seguinte (`<` e `>`) no canto inferior direito da imagem, com aro laranja (`#ED7D31`) no botão de avanço.
2. **Barra de navegação inferior (~22% da altura da secção em desktop — `175 px` em `810 px`):**
   - Fundo preto (`#0d0d0d` → `#050505`) dividido em três colunas (`+ ARCHITECTURE`, `+ URBAN PLANNING`, `+ RESEARCH`).
   - Cada coluna exibe o símbolo `+`, o título em maiúsculas, o indicador linear horizontal (`2px` laranja `#ED7D31` na coluna activa; cinzento subtil nas inactivas), a etiqueta `DESTAQUE` e o resumo do projecto.
   - Suporte completo para selecção por clique, toque e teclado (`ArrowLeft`, `ArrowRight`, `Home`, `End`, `Enter`, `Space`) com semântica WAI-ARIA (`tablist`, `tab`, `tabpanel`).
3. **Conteúdo obrigatório dos Slides 3, 4 e 5 (`src/locales/pt.ts` e `src/locales/en.ts`):**
   - **Architecture (Slide 3):** `O+A Projecta novo campus do Instituto Politecnico de Vilankulos`
   - **Urban Planning (Slide 4):** `O+A junta-se a rede de empresas internacionais para apoiar na Elaboração do Plano Estrategico de Massingiri`
   - **Research (Slide 5):** `O+A junta-se GENO e juntos pesquisam ferramentas para orientar o desenvolvimento de Bairros estratégicos em países do Sul Global`

---

## Ficheiros alterados

- `src/components/home/WorkshopSection.tsx`
- `src/components/home/WorkshopTabs.tsx`
- `src/components/home/workshop.css`
- `src/locales/pt.ts`
- `src/locales/en.ts`
- `public/images/workshop-architecture.jpg`
- `public/images/workshop-urbanism.jpg`
- `public/images/workshop-research.jpg`
- `PROJECT_MAP.md`
- `plans/127-workshop-section-r02-1.md`
- `plans/README.md`

---

## Verificações realizadas

- `npm run lint`: concluído sem erros (`0 errors`).
- `npm run build`: compilação TypeScript (`tsc -b`) e bundle Vite concluídos com sucesso.
- `git diff --check`: sem erros de espaços em branco.
- **Verificação visual e DOM via CDP (`1440×810`, `768×1024`, `375×812`):**
  - `1440 px` (Architecture, Urban Planning e Research): palco fotográfico com `635 px` (78,4%) e barra inferior com `175 px` (21,6%), `+` em `rgb(237, 125, 49)` (`#ED7D31`), `photoFilter: "none"`, `horizontalOverflow: false`, `consoleErrors: []`.
  - `768 px` (Tablet): grelha de 3 colunas equilibrada, fotografia nítida (`544 px`) e barra inferior (`191 px`) sem truncamento.
  - `375 px` (Mobile): fotografia principal ampla (`384 px`) com bloco `DESTAQUE` + `+ Architecture` + descrição, e navegação inferior empilhada de forma limpa (exibindo o resumo apenas na aba activa para evitar repetição excessiva em ecrãs estreitos).

---

## Resultado

A secção `WorkshopSection.tsx` reproduz fielmente o **Protótipo 01** e os conteúdos e imagens oficiais dos Slides 3, 4 e 5, mantendo a abertura `HeroSection.tsx` (R01.1) e todas as restantes secções intactas.
