# O+A Workshop — SEO-02: Google Search Appearance Audit

> **Data da auditoria:** 3 de Novembro de 2026, UTC+2 (Maputo).
> **Âmbito:** Fases A, B e C, exclusivamente em leitura.
> **Base Git auditada:** `main` @ `7c5a708d44598ac0d9448a6b2b3513d72eeb74c8`, confirmada no remoto.
> **Estado:** diagnóstico entregue; proposta correctiva pendente de aprovação.
> **Registo documental:** autorizado posteriormente pelo pedido «Manda o relatorio para o git», conforme o [Plano 081](../plans/081-registo-relatorio-seo02.md). Esse pedido autoriza guardar e enviar o relatório, não executar a Fase D.

## 1. Resumo executivo

A infraestrutura SEO-01 está publicada e entrega os metadados actuais. O título antigo continua a aparecer na pesquisa Google observada, mas já não consta do HTML nem do DOM das páginas iniciais verificadas.

A investigação identificou três situações distintas:

- **Título antigo:** provavelmente associado a informação anteriormente processada pelo Google. Falta acesso ao Search Console para confirmar a versão indexada.
- **Descrição relatada:** «We are a African studio…» existe no conteúdo actual da página. O Google pode escolher esse texto para o excerto, mesmo existindo uma descrição nos metadados.
- **Auscultadores:** existe uma fotografia de auscultadores associada ao projecto demonstrativo `vancouver-waterfront`. Continua publicada no catálogo e nos metadados desse projecto; também esteve ligada à homepage antiga. É uma candidata forte à miniatura relatada, mas a associação exacta ao resultado Google permanece por confirmar.

Existem ainda pequenas incorrecções técnicas nas dimensões declaradas das imagens e no formato do favicon. Estas não demonstram a causa do título antigo ou dos auscultadores.

O impacto potencial é editorial e reputacional: manutenção da designação antiga nos resultados de pesquisa, reprodução de uma frase inglesa incorrecta e associação da instituição a uma fotografia sem relação com arquitectura ou planeamento.

## 2. Evidências

### 2.1. Respostas HTTP públicas

| URL verificado | Resultado | Observação |
|---|---|---|
| [Homepage](https://www.oa-workshop.com/) | 200 | HTML pré-renderizado em inglês |
| [Versão inglesa](https://www.oa-workshop.com/en/) | 200 | Canonical próprio; `lang="en"` |
| [Versão portuguesa](https://www.oa-workshop.com/pt/) | 200 | Canonical próprio; `lang="pt"` |
| [Domínio sem www](https://oa-workshop.com/) | 301 → 200 | Redirecciona para `https://www.oa-workshop.com/` |
| [robots.txt](https://www.oa-workshop.com/robots.txt) | 200 | Permite rastreio e referencia o sitemap |
| [sitemap.xml](https://www.oa-workshop.com/sitemap.xml) | 200 | Contém apenas `/`, `/en/` e `/pt/` |

As respostas HTML apresentaram `Content-Type: text/html; charset=utf-8`, com texto UTF-8 válido. O servidor identificado foi GitHub Pages.

Nas três páginas iniciais foi confirmado:

- Um único título, descrição, canonical e bloco JSON-LD.
- `robots="index, follow"`, sem cabeçalho `X-Robots-Tag` contraditório nas respostas inspeccionadas.
- Canonical absoluto correspondente ao URL da página: raiz, `/en/` ou `/pt/`.
- `hreflang` recíproco para `en`, `pt` e `x-default`.
- Open Graph e Twitter Cards coerentes com o idioma; `twitter:card="summary_large_image"`.
- A mesma imagem institucional em `og:image`, `twitter:image` e `Organization.image`.
- Metadados principais coerentes antes e depois da hidratação, sem erros ou avisos nas consolas consultadas.

O título inglês entregue é:

```text
O+A Architects and Planners | Architecture, Urbanism & Research
```

O título português entregue é:

```text
O+A Arquitectos e Planeadores | Arquitectura, Urbanismo e Investigação
```

A descrição dos metadados apresenta o estúdio, as disciplinas, os fundadores, o ano de fundação e as localizações Maputo/Milão. A frase «We are a African studio…» pertence ao conteúdo da secção institucional, não ao valor actual de `meta[name="description"]`.

### 2.2. Ficheiros e linhas relevantes

As linhas referem-se à base auditada. Os módulos de aplicação inspeccionados no workspace não diferiam dessa `main`.

| Ficheiro | Linhas | Evidência ou responsabilidade |
|---|---:|---|
| [index.html](../index.html) | 11–33 | Título e metadados de base |
| [metadata.ts](../src/seo/metadata.ts) | 48–50 | Imagem institucional predefinida |
| [metadata.ts](../src/seo/metadata.ts) | 56–106 | JSON-LD `Organization`; dimensões do logótipo em 68–69 |
| [metadata.ts](../src/seo/metadata.ts) | 193–243 | Títulos, descrições, canonicals, alternates e imagens das homepages |
| [metadata.ts](../src/seo/metadata.ts) | 246–343 | Política de indexação e imagens dos projectos demonstrativos |
| [DocumentHead.tsx](../src/seo/DocumentHead.tsx) | 51–107 | Sincronização e limpeza dos metadados no cliente |
| [routes.ts](../src/seo/routes.ts) | 7; 114–228 | Domínio público e resolução das rotas legadas |
| [prerender.mjs](../scripts/prerender.mjs) | 61–138; 140–176 | Geração do HTML por rota e do sitemap |
| [entry-server.tsx](../src/entry-server.tsx) | 13–24 | Renderização e metadados determinados pelo URL |
| [main.tsx](../src/main.tsx) | 13–34 | Redireccionamento legado antes da hidratação |
| [i18n.ts](../src/i18n.ts) | 26–33 | Idioma inicial determinado pelo pathname |
| [App.tsx](../src/App.tsx) | 47 | Instância central de `DocumentHead` |
| [projects.ts](../src/data/projects.ts) | 35; 71–75 | Estatuto demonstrativo e referência aos auscultadores |
| [Projects.tsx](../src/pages/Projects.tsx) | 47–51 | Imagem da miniatura no catálogo |
| [en.ts](../src/locales/en.ts) | 96 | Frase inglesa com «a African» |
| [StudioAboutSection.tsx](../src/components/home/StudioAboutSection.tsx) | 90–93 | Apresentação da frase no corpo da homepage |
| [deploy.yml](../.github/workflows/deploy.yml) | 3–5; 40–57 | Build e publicação de `dist/` em alterações de `main` |
| [seo-verification.test.mjs](../tests/seo-verification.test.mjs) | 17; 143; 220; 308; 428 | Suites existentes de HTML estático, metadados, idiomas, HTTP e rotas legadas |

A auditoria confirmou o comportamento público por pedidos HTTP e acessos directos no navegador a `/`, `/en/` e `/pt/`. Não declarou uma nova execução da suite de testes a partir da leitura dos testes existentes.

### 2.3. Origem dos auscultadores

O registo `vancouver-waterfront` usa nos campos `mainImage` e `thumbnail` a fotografia Unsplash com identificador `photo-1545127398-14699f92334b`.

A [fotografia identificada](https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&q=80&w=600) foi aberta e inspeccionada visualmente: mostra efectivamente auscultadores.

| Página pública verificada | Presença da fotografia |
|---|---|
| [Catálogo demonstrativo](https://www.oa-workshop.com/projects/) | Imagem de um cartão |
| [Detalhe do projecto](https://www.oa-workshop.com/projects/vancouver-waterfront/) | Imagem principal, Open Graph e Twitter |
| [Detalhe inglês](https://www.oa-workshop.com/en/projects/vancouver-waterfront/) | Mesmas referências |
| [Detalhe português](https://www.oa-workshop.com/pt/projects/vancouver-waterfront/) | Mesmas referências |

Todas estas páginas responderam **200**, com **`noindex, nofollow`**. Não constam do sitemap.

A homepage actual não referencia esta fotografia. A imagem institucional em `og:image`, `twitter:image` e `Organization.image` é uma vista aérea do campus, acessível como JPEG e correspondente ao ficheiro versionado.

O histórico demonstra uma associação anterior à homepage: em `4fa4aee`, `src/pages/Home.tsx` incluía secções `CategoryMapSection`, que apresentavam as miniaturas dos projectos, incluindo esta fotografia. A remoção dessas secções ocorreu no commit `857d890`.

### 2.4. Recursos publicados

Foram verificados **35 recursos de imagem locais**, incluindo o logótipo: todos responderam 200, com MIME de imagem adequado e conteúdo idêntico ao ficheiro local por SHA-256. Este resultado confirma acesso HTTP e integridade dos ficheiros; não equivale a uma revisão editorial individual de todas as fotografias.

| Recurso | Dimensões reais | Dimensões declaradas |
|---|---:|---:|
| `public/images/og-oa-workshop.jpg` | 1376 × 768 | 1200 × 630 no Open Graph |
| `public/logo.png` | 692 × 511 | 512 × 512 no JSON-LD |

O favicon utiliza igualmente `logo.png`, que não é quadrado. O Google exige proporção 1:1 para esse recurso. [Documentação oficial sobre favicons](https://developers.google.com/search/docs/appearance/favicon-in-search).

As imagens da homepage estão presentes no HTML como elementos `img`, com `src` de fallback e variantes WebP em `picture`. As imagens abaixo da dobra usam carregamento diferido; a sua ausência momentânea em `currentSrc` antes de entrar na zona de carregamento não foi tratada como erro HTTP. Os ficheiros foram verificados directamente.

### 2.5. Histórico e publicação

| Marco | Evidência |
|---|---|
| `6f8d721`, 19/03/2026 | Introduziu a referência aos auscultadores nos dados do projecto |
| `4fa4aee`, publicado em 06/09/2026 | Incluía esse catálogo na homepage através de `CategoryMapSection` |
| `857d890`, 27/10/2026 | Retirou as secções antigas de mapas da homepage |
| `133f513`, 28/10/2026 | Substituiu o título antigo e acrescentou os metadados estáticos da SEO-01 |
| `7c5a708`, publicado em 30/10/2026 | Versão actual de `main`, com SEO-01 integrada |

O diff de `133f513` mostra a substituição de `<title>O+A Architecture and Planners</title>` pelo título actual. [Commit da alteração](https://github.com/simaoartur-web/oaworkshop/commit/133f513a76dd7c86269e304d7259fd5c5c850584).

A publicação mais recente de `main` terminou com sucesso em **30/10/2026, às 18:00:56 UTC+2**. [Execução de publicação](https://github.com/simaoartur-web/oaworkshop/actions/runs/41085863396).

O HTML público apresenta `Last-Modified: Fri, 30 Oct 2026 16:00:48 GMT`, correspondente a essa publicação. A SEO-01 foi, portanto, efectivamente publicada cerca de três dias antes desta auditoria. A data de criação dos commits não corresponde à data de actualização do índice.

### 2.6. Resultados das ferramentas Google

Na [pesquisa pública observada](https://www.google.com/search?q=site%3Awww.oa-workshop.com):

- Apareceu o título antigo **O+A Architecture and Planners**.
- O excerto começou por «Excellence in sustainable design…», diferente do relatado no pedido. Essa frase existe no histórico do conteúdo da homepage e permanece numa chave de uma secção antiga, sem aparecer no HTML inicial actual inspeccionado.
- Não apareceu uma miniatura de auscultadores nessa apresentação.

O **Rich Results Test**, executado para a homepage com agente smartphone, registou rastreio bem-sucedido em **03/11/2026, às 00:25 UTC+2**:

- **Uma organização válida**.
- **Quatro avisos não críticos:** ausência de `streetAddress` e `postalCode` nas duas localizações.
- O HTML apresentado pela ferramenta continha os metadados actuais.

[Resultado oficial do teste](https://search.google.com/test/rich-results/result?id=RGuz_-AtFLjHtuOsaIe9AA). O endereço identifica a execução efectuada; a sua disponibilidade futura depende do serviço Google.

Os avisos não justificam inventar moradas. O teste valida os dados estruturados da página actual; não confirma a versão indexada nem a apresentação orgânica.

O acesso à propriedade de domínio `oa-workshop.com` no Search Console foi recusado. Não foi efectuada verificação de propriedade, alteração de acessos ou solicitação de indexação.

## 3. Diagnóstico

| Hipótese | Classificação | Fundamentação |
|---|---|---|
| A homepage ainda publica o título antigo | **Descartada** | HTML e DOM apresentam o título novo |
| A SEO-01 ainda não foi publicada | **Descartada** | Publicação, HTTP e metadados confirmados |
| O Google conserva sinais anteriores à publicação | **Provável** | Título antigo observado e histórico correspondente |
| A descrição institucional está ausente | **Descartada** | Existe nas três páginas iniciais |
| A frase gramaticalmente incorrecta existe no conteúdo actual | **Confirmada** | Presente no HTML, DOM e tradução inglesa |
| O excerto relatado foi extraído desse conteúdo | **Provável** | Correspondência textual e comportamento documentado |
| A imagem institucional da homepage mostra auscultadores | **Descartada** | Mostra o campus |
| Existem auscultadores em recursos associados ao site | **Confirmada** | Catálogo, detalhe e metadados demonstrativos |
| Essa fotografia originou exactamente a miniatura relatada | **Não confirmada** | Não foi possível reproduzir a miniatura |
| A hidratação substitui os metadados correctos por antigos | **Descartada nos acessos testados** | Metadados mantiveram-se coerentes |

O Google gera títulos automaticamente a partir de várias fontes, incluindo título HTML, headings e referências externas. Precisa de voltar a rastrear e processar essas fontes para reconhecer alterações. [Documentação sobre títulos](https://developers.google.com/search/docs/appearance/title-link).

Os excertos dependem da pesquisa e podem vir do conteúdo da página, em vez da descrição nos metadados. [Documentação sobre excertos](https://developers.google.com/search/docs/appearance/snippet).

A selecção de imagens também é automática: `og:image` indica uma preferência, sem garantir a miniatura escolhida. [Documentação sobre imagens](https://developers.google.com/search/docs/appearance/google-images).

## 4. Causas identificadas

### Código e conteúdo

A referência errada aos auscultadores continua nos dados demonstrativos. A frase inglesa incorrecta permanece na tradução inglesa. As dimensões das imagens estão declaradas incorrectamente.

### Recursos publicados

Os ficheiros institucionais estão acessíveis e correspondem ao repositório. A imagem inadequada é externa e continua referenciada por páginas públicas demonstrativas. A sua presença foi confirmada; a sua selecção pelo Google não foi.

### Indexação

Há uma divergência confirmada entre o título público actual e o título apresentado na pesquisa. A causa exacta dessa divergência exige conhecer a versão indexada e o último rastreio. O estado actual de `noindex` das páginas demonstrativas não demonstra, por si só, quando o Google voltou a processá-las.

### Comportamentos automáticos do Google

O Google pode reescrever títulos, escolher excertos do corpo e seleccionar outra imagem. Canonical e sitemap são sinais de preferência; não permitem confirmar qual canonical foi escolhido pelo Google. [Documentação sobre canonicalização](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

## 5. Plano correctivo proposto

**Estado: proposta pendente de aprovação. Nenhuma intervenção abaixo foi executada nesta auditoria.**

| Prioridade | Intervenção | Âmbito |
|---|---|---|
| **P1** | Retirar a fotografia de auscultadores dos dados demonstrativos e usar um recurso neutro local aprovado | Preservar as rotas, o estatuto demonstrativo e o `noindex` |
| **P1** | Inspeccionar as páginas iniciais no Search Console com acesso autorizado | Confirmar versão indexada, último rastreio e canonical escolhido |
| **P2** | Corrigir «a African» para «an African», mediante aprovação editorial | Alteração localizada na tradução inglesa |
| **P2** | Fazer corresponder as dimensões declaradas às dimensões reais | Open Graph e JSON-LD, preservando as imagens |
| **P2** | Solicitar novo rastreio após as correcções e publicação autorizada | Acção separada no Search Console |
| **P3** | Preparar favicon quadrado derivado da identidade existente | Recurso próprio, sem substituir o logótipo usado na interface |
| **P3** | Acrescentar verificações das dimensões e da referência inadequada | Regressões directamente relacionadas com estes achados |

Não se recomenda reescrever a infraestrutura SEO-01 nem alterar os títulos correctos. A política de indexação dos projectos demonstrativos deve ser preservada.

A execução correctiva deverá ter plano próprio aprovado em `plans/` e branch criada a partir da `main` actual. Não são necessárias novas dependências. A aprovação do registo documental deste relatório não autoriza essa execução, merge, publicação ou operações no Search Console.

## 6. Critérios de aceitação

A resolução técnica deverá demonstrar:

- Ausência da referência aos auscultadores no HTML, DOM e metadados gerados.
- Dimensões declaradas iguais às dos ficheiros e favicon quadrado acessível.
- Correcção editorial aprovada, com paridade das traduções preservada.
- Um único conjunto coerente de metadados por página, antes e depois da hidratação.
- Preservação do `noindex` demonstrativo, das três entradas do sitemap e dos HTTP 404 legítimos.
- Aprovação de `npm run lint`, `npm run build`, `npm test` e `git diff --check`.
- Verificação visual proporcional em 375, 768 e 1440 px quando houver alteração de recursos visíveis.

O acompanhamento no Google deverá registar separadamente o novo rastreio, a versão indexada e a apresentação observada para pesquisas, idioma e dispositivo comparáveis. Um pedido de rastreio não garante actualização imediata; o Google indica que pode demorar dias ou semanas. [Documentação sobre novo rastreio](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

A aceitação técnica não deve depender de garantir um título ou miniatura específicos no Google. A apresentação no motor de pesquisa constitui uma verificação posterior, sujeita aos seus processos automáticos.

## 7. Limitações e estado da entrega

O Search Console recusou acesso à propriedade de domínio. Não foram confirmados o último rastreio de indexação, o HTML indexado, o canonical escolhido ou o processamento do sitemap. A falta de acesso à propriedade de domínio não demonstra a inexistência de outras propriedades ou contas autorizadas.

A miniatura relatada não foi reproduzida. Foi confirmada uma origem concreta e historicamente associada ao site, mas falta provar a correspondência exacta com essa apresentação do Google.

As observações de pesquisa são uma amostra da sessão utilizada; não representam todos os dispositivos, idiomas, países ou consultas. As verificações de hidratação corresponderam a acessos directos às três páginas iniciais, sem constituírem uma auditoria completa de todos os percursos interactivos.

Durante as Fases A, B e C não foram alterados ficheiros, criadas branches, realizados commits ou efectuadas publicações. O estado Git permaneceu limpo e `git diff --check` terminou sem erros. Não foram executados build nem a suite local nessa fase de leitura; as validações incidiram sobre produção, navegador, histórico Git e ferramentas oficiais.

Este relatório é um registo das observações de 3 de Novembro de 2026. O seu envio posterior para o Git é um lote exclusivamente documental, acompanhado no Plano 081. **A Fase D permanece pendente de aprovação.**
