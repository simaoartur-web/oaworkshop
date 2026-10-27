# Implementação da secção institucional `+ WORKSHOP` (R05)

> **Estado:** CONCLUÍDO
> **Data:** 2026-10-27
> **Branch prevista:** `codex/feature-hero-opening-reform`
> **Aprovação:** aprovado pelo utilizador em 2026-10-27 (`Plano Aprovado`)

## Objectivo

Implementar a nova secção institucional **`+ WORKSHOP`** num componente autónomo (`src/components/home/StudioAboutSection.tsx`), posicionada imediatamente após o carrossel `WorkshopSection` (slides 3–5) e antes da galeria `ProjectsSection` (`+ PORTFOLIO`), reproduzindo fielmente a composição do Slide 6 de `OA.pptx` e do render aprovado (`03_workshop_seccao_render_fotos_originais.png`) com as duas fotografias originais fornecidas.

## Contexto e estado actual

Na página inicial (`src/pages/Home.tsx`), a sequência actual (após R01.1, R02.1, R03 e R04) é:
1. `HeroSection` (`#top`)
2. `WorkshopSection` (`#workshop` — carrossel Architecture / Urban Planning / Research)
3. `ProjectsSection` (`#portfolio` — galeria `+ PORTFOLIO`)
4. `TeamSection` (`#team`)
5. `ContactSection` (`#contact`)
6. `Footer`

Com a fase **R05**, a sequência obrigatória passa a ser:
1. `HeroSection` — abertura O+A
2. `WorkshopSection` — carrossel dos slides 3–5
3. **`StudioAboutSection` — nova secção institucional `+ WORKSHOP` (Slide 6)**
4. `ProjectsSection` — galeria `+ PORTFOLIO` de seis projectos
5. `TeamSection` — equipa
6. `ContactSection` — contactos
7. `Footer`

## Sinalização de segurança e privacidade (Quadro do Escritório)

- A fotografia original `01_workshop_espaco_original.png` mostra o quadro de ardósia do escritório com apontamentos manuscritos divididos em `ARCHITECTURE`, `PLANNING`, `RESEARCH` e `OFFICE`, contendo nomes de clientes/projectos (ex.: *Felício, Érica, DMG-Lodge, Campus-Vilanculos, Hanif, Nelson Sitoe, Metita, Massingir, Regina, Alex (JHB), Getulio, Hélio, Passuane, Wagner, Inhamissa, Vilson, Hermínio, PEU Maputo, Nhaliveu, Matidze, Edna, Ilha de Moç., Inhambane, WUF*) e tarefas internas (*Website, Starlink, Legalization, Furniture, Pintar parede quadro*).
- Conforme as regras absolutas da especificação R05 e de `AGENTS.md`, **a imagem não será modificada nem retocada silenciosamente**; solicita-se confirmação expressa do utilizador de que `01_workshop_espaco_original.png` está autorizada para publicação tal como fornecida.

## Âmbito incluído

1. **Assets originais (`public/images/workshop-about/`):**
   - `public/images/workshop-about/office-space.png` (cópia integral de `01_workshop_espaco_original.png`, `1435×721`, sem alteração de objectos ou filtros).
   - `public/images/workshop-about/founders-portrait.png` (cópia integral de `02_workshop_fundadores_original.png`, `552×385`, retrato original a preto e branco de Osvaldo Luís e Artur Simão, sem geração ou retoque por IA).
2. **Novo componente `src/components/home/StudioAboutSection.tsx` e estilos `src/components/home/studio-about.css`:**
   - Fundo preto/escuro canónico (`#050505`), sem gradientes decorativos, sombras exageradas ou cantos arredondados (`border-radius: 0`).
   - Cabeçalho alinhado à esquerda com espaçamento e escala consistentes com `+ PORTFOLIO`:
     - Símbolo `+` em laranja (`#ED7D31`) + `WORKSHOP` em branco puro (`#FFFFFF`), fonte `Outfit` (`font-weight: 700`).
   - **Composição Desktop (`1440 px`) — grelha assimétrica (~70% / ~30%):**
     - **Coluna esquerda (~70%):** fotografia original do escritório (`office-space.png`) em grande escala, preservando o enquadramento completo e a identificação `About` na região inferior esquerda.
     - **Coluna direita (~30%):** dividida verticalmente em dois blocos contíguos:
       1. Topo: retrato original dos fundadores (`founders-portrait.png`), garantindo visibilidade integral dos rostos e ombros sem cortes inadequados.
       2. Base: bloco institucional com fundo cinzento-escuro arquitectónico (`#555658`), bordas rectas e tipografia branca (`#FFFFFF`) em `Outfit`, exibindo a citação oficial e a assinatura `O+A`.
   - **Composição Tablet (`768 px`) e Mobile (`375 px`):**
     - Em `375 px`, empilhamento vertical na ordem exacta:
       1. Título `+ WORKSHOP`
       2. Fotografia do escritório com identificação `About`
       3. Retrato dos fundadores (visibilidade integral dos rostos)
       4. Bloco de texto institucional e assinatura `O+A`
     - Em `768 px`, adaptação proporcional sem comprimir o texto institucional nem cortar os rostos dos fundadores.
   - **Microinteracções e acessibilidade:**
     - Revelação suave durante o scroll (`framer-motion` com curva `[0.22, 1, 0.36, 1]`), respeitando integralmente `prefers-reduced-motion`.
     - Sem zoom agressivo nem distorção de retratos.
3. **Conteúdo bilingue (`src/locales/en.ts` e `src/locales/pt.ts`):**
   - **Título:** `+ WORKSHOP`
   - **Identificação da fotografia:** `About`
   - **Texto institucional (EN — literal do Slide 6):**
     `“We are a African studio for sustainable architecture, urbanism, research and design, founded by the Architects Osvaldo Luís and Artur Simão in 2025”`
   - **Texto institucional (PT — tradução fiel):**
     `“Somos um estúdio africano de arquitectura sustentável, urbanismo, investigação e design, fundado pelos Arquitectos Osvaldo Luís e Artur Simão em 2025”`
   - **Assinatura inferior:** `O+A`
4. **Integração em `src/pages/Home.tsx` e documentação em `PROJECT_MAP.md`:**
   - Inserir `<StudioAboutSection />` entre `<WorkshopSection />` e `<ProjectsSection />`.
   - Actualizar `PROJECT_MAP.md` com o novo componente, estilos e pasta de imagens.

## Fora do âmbito

- Modificar `HeroSection`, `WorkshopSection` (carrossel), `ProjectsSection` (`+ PORTFOLIO`), `TeamSection`, `ContactSection`, `Footer`, rotas ou `src/data/projects.ts`.
- Adicionar botões, links ou elementos não previstos no Slide 6 / render aprovado.
- Fazer merge em `main` ou publicar em produção sem autorização específica após a validação.

## Ficheiros previstos

- `plans/131-seccao-institucional-workshop-r05.md` (novo plano)
- `plans/README.md` (registo do plano 131)
- `public/images/workshop-about/office-space.png` (fotografia original 01)
- `public/images/workshop-about/founders-portrait.png` (fotografia original 02)
- `src/components/home/StudioAboutSection.tsx` (novo componente institucional `+ WORKSHOP`)
- `src/components/home/studio-about.css` (estilos dedicados da secção `+ WORKSHOP`)
- `src/pages/Home.tsx` (inserção de `StudioAboutSection` após `WorkshopSection` e antes de `ProjectsSection`)
- `src/locales/en.ts` e `src/locales/pt.ts` (textos institucionais e `alt` acessíveis)
- `PROJECT_MAP.md` (registo dos novos ficheiros)

## Critérios de aceitação

1. A secção `+ WORKSHOP` surge entre o carrossel `WorkshopSection` e `ProjectsSection` (`+ PORTFOLIO`).
2. As fotografias originais do escritório e dos fundadores são preservadas sem geração de rostos, filtros ou cortes inadequados.
3. O conteúdo textual reproduz exactamente o Slide 6 em inglês e a tradução fiel em português, com assinatura `O+A`.
4. Composição validada em `1440 px`, `768 px` e `375 px` sem scroll horizontal nem erros na consola.
5. `npm run lint`, `npm run build` e `git diff --check` passam sem erros.

## Verificações

- [x] `npm run lint` (0 erros)
- [x] `npm run build` (`tsc -b && vite build` concluído com sucesso)
- [x] `git diff --check` (0 problemas)
- [x] Verificação visual em `375 px`, `768 px` e `1440 px` (`r05-375.png`, `r05-768.png`, `r05-1440.png`, `r05-1440-pt.png`)

## Resultado

Secção institucional `+ WORKSHOP` (`StudioAboutSection.tsx`) implementada e validada na branch `codex/feature-hero-opening-reform`, posicionada entre o carrossel `WorkshopSection` e a galeria `ProjectsSection` (`+ PORTFOLIO`).
