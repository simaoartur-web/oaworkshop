# Plano 082 — SEO-02 EN-first: correcção da apresentação inglesa

> **Estado:** CANÓNICO — integrado em `main`, publicado e verificado no domínio público; validação final no navegador concluída em 2026-11-07.
> **Data:** 2026-11-05
> **Base de aplicação confirmada:** `main` @ `7c5a708d44598ac0d9448a6b2b3513d72eeb74c8`
> **Branch de execução:** `codex/fix-seo02-en-search-appearance`, criada a partir de `main` @ `7c5a708` em 2026-11-07.
> **Preparação documental:** `codex/docs-seo02-google-search-audit` @ `2209dd81ae1b7b25fa9ef8e0a1ba116d02732350`.
> **Autorização de preparação:** confirmação pelo utilizador das duas entregas em 2026-11-05.
> **Aprovação da execução e da escolha editorial D1:** concedida pelo utilizador em 2026-11-07 («Esta aprovado»), em resposta à apresentação deste plano incluindo D1.

## 1. Objectivo e resultado esperado

Corrigir os defeitos comprovados que afectam a apresentação institucional inglesa de `/` e `/en/`: uma construção gramatical incorrecta, uma fotografia inadequada em conteúdo demonstrativo associado ao domínio, dimensões incorrectas de recursos SEO e um favicon não quadrado.

Preservar a arquitectura SEO-01, o funcionamento PT/EN e a identidade da O+A. Entregar correcções locais verificadas e commits numa branch isolada, antes de qualquer integração ou publicação.

Fontes de verdade: [AGENTS.md](../AGENTS.md), [mapa](../PROJECT_MAP.md), [qualidade](../docs/QUALITY.md), [conteúdo](../docs/CONTENT_GUIDE.md), [Plano 080](080-seo-infraestrutura-indexacao.md) e [relatório SEO-02](https://github.com/simaoartur-web/oaworkshop/blob/2209dd81ae1b7b25fa9ef8e0a1ba116d02732350/docs/SEO_02_GOOGLE_SEARCH_APPEARANCE_AUDIT.md). O relatório pertence ao commit documental `2209dd8`, disponível na branch de auditoria; ainda não integra `main`.

## 2. Contexto e estado actual reconfirmado

Em 2026-11-05:

- `main` remoto continua em `7c5a708`; a branch remota do relatório continua em `2209dd8`.
- O estado Git estava limpo antes da preparação. O código da aplicação nesta branch documental não difere de `main`.
- O número 082 está livre.
- `/`, `/en/` e `/pt/` respondem HTTP 200. Os títulos novos e os canonicals próprios continuam presentes; as homepages permanecem `index, follow`.
- `/` e `/en/` continuam a conter `We are a African`; `/pt/` não contém essa construção.
- `/projects/` e `/projects/vancouver-waterfront/` respondem 200 e mantêm `noindex, nofollow`. Ambos referenciam `photo-1545127398-14699f92334b`; no detalhe, a referência também consta do Open Graph e Twitter.
- A fotografia inadequada não aparece nos três documentos iniciais actuais. A sua selecção como miniatura Google continua por provar, conforme a auditoria.
- O JPEG institucional responde 200, com MIME `image/jpeg`, mede **1376 × 768** e corresponde ao ficheiro local. Open Graph continua a declarar **1200 × 630**.
- `logo.png` responde 200, com MIME `image/png`, mede **692 × 511**, possui canal alfa e corresponde ao ficheiro local. JSON-LD continua a declarar **512 × 512**.
- `index.html:6` usa o mesmo logótipo rectangular como favicon. O original foi inspeccionado visualmente durante a preparação.
- As respostas inspeccionadas mantêm `Last-Modified` de 30/10/2026. Isso descreve a publicação, não a versão indexada pelo Google.
- Não foi obtido novo acesso ao Search Console nem feita nova observação do resultado Google nesta preparação. O acesso recusado e o Rich Results Test do relatório são evidências datadas de 03/11/2026.

O sistema de design, o playbook e o estudo aplicado foram consultados. Aplicam-se o uso de recursos locais, a fidelidade da marca, a contenção visual e o texto alternativo coerente. Nenhuma dessas referências autoriza um redesign.

## 3. Alteração → causa confirmada → evidência → impacto → teste

| Alteração proposta | Causa confirmada | Evidência | Impacto e limite | Teste de aceitação |
|---|---|---|---|---|
| **P1:** `a African` → `an African` | Erro gramatical no conteúdo inglês elegível para excertos | `src/locales/en.ts:96`; HTTP de `/` e `/en/` em 05/11 | Melhora o texto inglês; não impõe o excerto que o Google escolherá | HTML estático e DOM de `/` e `/en/` contêm a forma corrigida; nenhum outro trecho institucional é reescrito |
| **P1 / D1:** substituir os auscultadores por marcador neutro local | `mainImage` e `thumbnail` de Vancouver apontam para fotografia sem relação com o projecto | `src/data/projects.ts:71–75`; catálogo e detalhe públicos; auditoria visual anterior | Retira o recurso inadequado; marcador não representa uma obra nem uma fotografia de Vancouver | Identificador proibido ausente do código público relevante, HTML e bundle gerados; marcador local usado no catálogo, detalhe e metadados |
| **P2:** corrigir dimensões do recurso OG institucional | Valores anunciados divergem dos ficheiros | `metadata.ts` e `index.html`; medição Sharp e HTTP: 1376 × 768 | Correcção partilhada de metadados; imagem e enquadramento preservados | Comparar declarações do HTML/DOM com dimensões descodificadas do ficheiro efectivamente referenciado |
| **P2:** corrigir dimensões do logótipo no JSON-LD | `ImageObject` anuncia 512 × 512 em vez de 692 × 511 | `metadata.ts:65–70`; medição local e pública | Corrige informação estruturada partilhada, sem substituir o logótipo da interface | JSON-LD válido e dimensões iguais às do `logo.png`; hash do original preservado |
| **P3:** favicon quadrado derivado do logótipo | Recurso actual tem proporção rectangular | `index.html:6`; PNG 692 × 511; regra Google 1:1 | Recurso de identidade próprio para navegador/pesquisa; sem redesign da marca | PNG quadrado, MIME correcto, HTTP local 200 e inspecção de legibilidade a 16, 32 e 48 px |
| Preservar títulos, descrição e arquitectura de idiomas | Títulos e metadados principais actuais estão correctos nos acessos verificados | HTML público e relatório SEO-02 | Evita alterações sem defeito demonstrado | Comparação dos metadados e conteúdo PT antes/depois, ressalvando apenas as alterações partilhadas aprovadas |

## 4. Decisões editoriais e técnicas para aprovação

### D1 — Substituto seguro para os auscultadores

Não foi identificado um recurso local cuja aprovação editorial o associe a Vancouver. As fotografias de Maputo, do campus, do escritório e da equipa não serão atribuídas a esse projecto.

**Proposta principal:** criar `public/images/project-placeholder.png`, com 1200 × 630 px, fundo neutro da paleta existente e um pequeno sinal gráfico de imagem indisponível. Sem fotografia, edifício inventado, texto, logótipo, efeitos ou conteúdo que aparente ser uma obra. A linguagem neutra segue o tratamento de ausência de imagem já existente no portefólio, sem alterar esse componente.

O marcador substituirá exclusivamente `mainImage` e `thumbnail` de `vancouver-waterfront`. O projecto, os seus textos, identificadores e a política de indexação permanecem existentes. A escolha afecta também a imagem desse projecto nas variantes portuguesa e inglesa porque os dados são partilhados; isso é uma excepção editorial expressa ao isolamento EN-first, limitada à retirada da mesma fotografia inadequada.

O marcador terá identificação tipada nos dados, se necessária para a semântica dos consumidores. Nas imagens do conteúdo, usar `alt=""` quando o título adjacente já identifica o projecto. Nos metadados, não descrever o marcador como fotografia real do projecto. Não adicionar textos PT nem duplicar traduções para resolver essa ausência.

**A aprovação deste plano deverá incluir explicitamente a decisão D1.** Sem essa autorização editorial, a substituição fica por executar; as outras intervenções só poderão avançar se forem aprovadas separadamente. Uma fotografia real diferente exigirá identificação e aprovação editorial próprias.

### D2 — Dimensões reais, sem transformação das fotografias

Manter o JPEG institucional em 1376 × 768 e o logótipo em 692 × 511. Corrigir as declarações nas fontes de metadados e no template, incluindo os consumidores que já usam o mesmo recurso global. Não redimensionar, recortar, esticar ou substituir esses originais.

As dimensões corrigidas também aparecerão em `/pt/` e nos fallbacks que usam esses recursos. É uma correcção partilhada justificada, sem alterar conteúdo português, idiomas, URLs ou política de indexação. As dimensões dos restantes recursos remotos demonstrativos não serão reinterpretadas sem medição e âmbito próprios.

### D3 — Favicon institucional

Criar `public/favicon.png` em **192 × 192 px**, a partir do logótipo original, com proporção preservada, centragem e margem sobre fundo branco. Preservar a transparência interna da fonte durante a composição; o ficheiro final terá fundo definido para manter o símbolo escuro legível em separadores claros e escuros.

Não desenhar uma marca nova nem eliminar partes do símbolo. Rever o resultado em tamanho pequeno; se a legibilidade exigir redesenhar o símbolo, parar essa intervenção e apresentar a decisão editorial. `public/logo.png` permanece intacto e continua a servir a interface e o JSON-LD.

Apontar apenas `rel="icon"` para o novo PNG, com `type` e `sizes` coerentes. O recurso será global também em `/pt/`; essa é uma correcção técnica partilhada da identificação do site.

### D4 — Dados estruturados e ferramentas

Manter o `Organization` existente. **Não acrescentar `primaryImageOfPage` neste lote:** a homepage já publica `og:image` e `Organization.image` correctos; não existe evidência de que outro bloco resolveria a miniatura relatada. A avaliação pedida fica registada, sem criar dados duplicados ou promessas de controlo sobre o Google.

Usar Sharp já instalado para medir recursos e gerar deterministicamente os dois recursos gráficos locais. Um script pequeno de manutenção permitirá reproduzi-los sem dependências novas ou serviços externos; não alterar a execução da aplicação nem introduzir uma dependência de runtime.

Aplicar os princípios das Ultimate Skills v3.0.0 já consultadas e da competência PT-PT pré-AO90. Para a execução, usar controlo de navegador disponível e a checklist React quando houver alterações a múltiplos TSX. Não foram identificadas no catálogo fornecido skills autónomas de SEO técnico ou auditoria Git; a investigação usa código, Git, testes existentes e documentação oficial, sem alegar execução de ferramentas ou skills inexistentes.

## 5. Âmbito e ficheiros previstos

### Preparação autorizada nesta Entrega A

| Ficheiro | Alteração documental |
|---|---|
| `plans/082-seo02-en-first-correcao.md` | Criar e apresentar este plano no estado PROPOSTO |
| `plans/README.md` | Indexar o Plano 082 |
| `PROJECT_MAP.md` | Localizar o plano e a sua responsabilidade |

### Implementação apenas após aprovação

| Ficheiro | Alteração limitada prevista |
|---|---|
| `src/locales/en.ts` | Corrigir apenas o artigo de `studioAbout.quote` |
| `src/data/projects.ts` | Substituir as duas referências de Vancouver pelo marcador; identificar o marcador de forma tipada se necessário |
| `src/pages/Projects.tsx` | Semântica alternativa do marcador, sem alterar grelha, links ou filtros |
| `src/pages/ProjectDetail.tsx` | Semântica alternativa do marcador, sem alterar layout ou navegação |
| `src/components/home/CategoryMapSection.tsx` | Apenas semântica do mesmo marcador nos consumidores legados; não voltar a montar a secção na homepage |
| `src/seo/metadata.ts` | Dimensões reais dos recursos globais e descrição alternativa coerente do marcador |
| `index.html` | Dimensões OG do template e referência ao favicon novo |
| `scripts/generate-seo-assets.mjs` | Gerador determinístico de favicon e marcador, com Sharp existente |
| `public/favicon.png` | Favicon quadrado derivado do símbolo original |
| `public/images/project-placeholder.png` | Marcador neutro aprovado por D1 |
| `public/images/project-placeholder.webp` | Derivado, caso seja gerado pelo pipeline WebP existente |
| `tests/seo-verification.test.mjs` | Testes de regressão específicos dos defeitos e invariantes preservadas |
| `PROJECT_MAP.md`, `plans/README.md`, este plano | Registar ficheiros efectivamente criados, decisões e resultados da execução |

Não se prevê alterar `package.json`, lockfile ou dependências. O relatório histórico de 03/11 permanece preservado; as verificações e resultados novos serão registados neste plano.

### Fora do âmbito

- `src/main.tsx`, `src/i18n.ts`, `BrowserRouter`, `hydrateRoot`, migração de hashes, navegação e estratégia geral de canonicalização.
- Eliminar ou redireccionar `/pt/`, alterar texto português, retirar `hreflang` ou simplificar a gestão de idiomas.
- Alterar o estatuto `demo`, `noindex, nofollow`, número/identificadores de projectos ou elegibilidade no sitemap.
- Reformar layout, animações, fotografias reais, portefólio ou logótipo original.
- SaaS, back-end, APIs, autenticação, dashboard, CRM, base de dados ou serviços de runtime.
- Merge, deploy, escrita no Search Console ou reindexação. Estas acções exigem autorização posterior expressa.

## 6. Etapas da Entrega B

1. **Confirmar a aprovação concreta**, incluindo D1, e voltar a verificar `git status`, `main` remoto e a relevância das evidências. Se houver mudança material, rever o plano antes de editar.
2. Criar `codex/fix-seo02-en-search-appearance` a partir da `main` actual, preservando as branches existentes. Transportar apenas este plano aprovado e os respectivos registos documentais necessários; não incorporar código de outras iniciativas.
3. Capturar a referência local de conteúdo, metadados, HTTP, recursos e ecrãs relevantes antes da alteração, incluindo PT e a imagem de Vancouver.
4. Implementar a correcção inglesa e a substituição editorial D1; gerar os recursos locais; corrigir as dimensões e o favicon sem reabrir a hidratação.
5. Executar as verificações abaixo, rever o diff e registar resultados, avisos e limitações.
6. Criar commits atómicos na branch, entregar SHA/diff/evidências e parar antes de merge/deploy. A aprovação deste plano não declara a branch canónica.

## 7. Testes e critérios de aceitação

### Automáticos

- `npm ci` apenas se for necessário restaurar as dependências existentes, sem alteração deliberada de lockfile.
- `npm run lint`, `npm run build`, `npm test` e `git diff --check`, com resultados reais registados.
- Teste negativo de `photo-1545127398-14699f92334b` no código público responsável, HTML gerado e bundles de aplicação; não pesquisar a documentação histórica, onde a referência deve continuar como evidência.
- Testar `an African` no HTML de `/` e `/en/`, ausência da forma incorrecta e preservação do restante texto.
- Medir os recursos com Sharp e comparar com as declarações efectivas em HTML/JSON-LD. Verificar também que os hashes do logótipo e JPEG institucional originais não mudaram.
- Verificar favicon quadrado, marcador 1200 × 630, formato, MIME servido e ausência de recursos quebrados.
- Confirmar os 12 identificadores demonstrativos: todas as variantes geradas mantêm `noindex, nofollow` e não entram no sitemap. O sitemap continua a conter apenas as três homepages com alternates recíprocos.
- Preservar `robots.txt`, `404.html` dedicado com `noindex` e sem canonical; manter os testes existentes de idiomas e rotas legadas.

### HTTP e navegador

- Servir o build num servidor estático sem fallback SPA: verificar `/`, `/en/`, `/pt/`, catálogos, detalhe de Vancouver, novos recursos e rota inexistente. O MIME e o HTTP 200 dos recursos novos serão comprovados localmente; a comprovação no domínio público depende de publicação posterior autorizada.
- Comparar os metadados sem JavaScript com o DOM hidratado de `/` e `/en/`, e repetir a verificação de não regressão em `/pt/`: título, descrição, canonical, robots, Open Graph, Twitter e JSON-LD sem duplicações nem conflitos.
- Rever em **375, 768 e 1440 px**, com conteúdo e estado comparáveis: homepage inglesa, homepage portuguesa, catálogo e detalhe afectado. Verificar o marcador e a legibilidade do favicon, sem reabrir o design.
- Testar alternância PT/EN, acesso directo/refresh, ligações existentes e foco por teclado nos percursos afectados; verificar ausência de erros de consola e de hidratação.
- Confirmar que o texto português e a apresentação da homepage PT permanecem iguais, excepto as declarações globais e o favicon aprovados. Nas rotas demonstrativas PT, aceitar exclusivamente a substituição partilhada de Vancouver e a semântica correspondente, aprovadas em D1.
- Se o navegador não estiver operacional, declarar quais verificações não foram executadas; não substituir a observação por uma alegação de sucesso.

## 8. Riscos e salvaguardas

| Risco | Salvaguarda |
|---|---|
| Trocar os auscultadores por uma fotografia falsa de Vancouver | Aprovação editorial D1; marcador não fotográfico, sem imagem de outra obra |
| EN-first introduzir divergência ou regressão em PT | Fonte única de dados e metadados; excepções partilhadas expressas; comparação PT antes/depois |
| Retirada da referência alterar `noindex` ou sitemap | Asserções sobre todos os projectos demonstrativos e os três URLs indexáveis |
| Favicon exigir deformação ou redesenho do símbolo | Preservar original, proporção e margens; parar essa intervenção se exigir nova decisão visual |
| Build gerar alterações fora do lote em imagens já versionadas | Inspeccionar o diff após a optimização e não incluir regenerações alheias sem necessidade comprovada |
| Confundir teste local com publicação ou indexação | Separar resultados locais, estado público e dados do Search Console; não realizar acções externas nesta entrega |
| Concluir que corrigir metadados garante a aparência Google | Documentar o alcance dos sinais e acompanhar a apresentação apenas após publicação autorizada |

## 9. Search Console e acompanhamento posterior

Depois de eventuais correcções e publicação aprovadas, obter acesso autorizado para inspeccionar `/` e `/en/`: data do último rastreio, versão indexada, canonical seleccionado e estado do sitemap. Solicitação de indexação será uma acção posterior, sujeita a aprovação expressa.

Sem acesso, entregar esses passos como pendentes. O Rich Results Test poderá comprovar a leitura actual e os dados estruturados, mas não a versão indexada ou a substituição de uma miniatura. Não inventar moradas para eliminar avisos opcionais.

Documentação oficial consultada novamente em 05/11/2026:

- [Google — excertos e descrições](https://developers.google.com/search/docs/appearance/snippet): a descrição pode vir do conteúdo da página.
- [Google — imagens](https://developers.google.com/search/docs/appearance/google-images): selecção automática e sinais de imagem preferida, incluindo `og:image` e `primaryImageOfPage`.
- [Google — favicon](https://developers.google.com/search/docs/appearance/favicon-in-search): proporção 1:1, acesso dos crawlers e ausência de garantia de apresentação.

## 10. Verificações da Entrega A e registo

- [x] AGENTS, mapa, regras de qualidade/conteúdo, Plano 080 e relatório consultados; documentos técnicos conhecidos mantêm-se sem alterações desde `2209dd8`.
- [x] Referências de design consultadas para limitar as decisões dos dois recursos gráficos.
- [x] `main` e branch do relatório confirmadas remotamente; código local comparado com `main` sem diferenças.
- [x] Cinco páginas públicas e os dois recursos globais reconfirmados por HTTP; dimensões/MIME descodificados com Sharp existente.
- [x] Número 082 confirmado livre; alternativa editorial D1 e âmbito partilhado explícitos.
- [x] Plano e seis ligações locais verificados; `git diff --check` sem erros. Preparação limitada a este plano e aos dois índices, sem alterações de código ou recursos.
- [x] Aprovação expressa do plano e de D1 em 2026-11-07.
- [x] Implementação e testes automáticos/HTTP da Entrega B.
- [x] Comparação final de DOM hidratado e verificação visual responsiva: concluídas após publicação, no navegador interno, em 375, 768 e 1440 CSS px; interrupção anterior preservada no registo histórico.

**2026-11-05:** o utilizador confirmou as duas entregas. Preparada a Entrega A, preservando a instrução de apresentar o plano concreto antes de implementar. Não foram executados testes de implementação, gerados recursos, alterado código ou efectuadas acções de publicação/indexação nesta preparação.

## 11. Porta de aprovação e resultado

Entrega A concluída. Entrega B aprovada em 2026-11-07, incluindo D1, com implementação e verificações automáticas/HTTP concluídas. Após conhecer a limitação da validação no navegador, o utilizador pediu expressamente «Faz o merge e publica diretamente na main.». Esse pedido aceita a branch candidata para integração e autoriza a publicação. O merge, a publicação e a verificação do domínio público foram concluídos em 2026-11-07. A validação final do DOM e das três larguras foi executada no navegador interno após a publicação; a interrupção anterior permanece documentada como ocorrência histórica.

Forma de aprovação sugerida:

```text
APROVADO: plans/082-seo02-en-first-correcao.md, incluindo D1 (marcador neutro local para Vancouver).
```

A aprovação inicial autorizou exclusivamente as correcções e verificações locais previstas na Entrega B, numa branch própria. A autorização posterior expressa de 2026-11-07 abrange integração em `main` e deploy no GitHub Pages. Escrita/reindexação no Search Console continua fora dessa autorização.

## 12. Registo da execução

- **2026-11-07:** `main` remoto reconfirmado em `7c5a708`. Criada a branch aprovada a partir dessa base; o relatório histórico permanece na sua branch documental. Transportados apenas o Plano 082 e os seus índices. Preservadas as branches anteriores e os originais de imagem.
- **2026-11-07 — Implementação:** corrigido apenas o artigo inglês; Vancouver passou a usar o marcador neutro PNG 1200 × 630, com identificação tipada e sem alternativa que o apresente como fotografia. Actualizados os consumidores activos e legados desse dado. A imagem local recebe URL absoluto nos metadados. Corrigidas as dimensões OG para 1376 × 768 e do logótipo no JSON-LD para 692 × 511. Criado favicon 192 × 192 sem deformar o símbolo; o gerador Sharp e a proveniência dos dois recursos estão versionados. O WebP do marcador é gerado pelo pipeline existente.
- **2026-11-07 — Originais e âmbito:** verificados por SHA-256 os dois originais de imagem, a tradução PT, `main.tsx`, `i18n.ts`, rotas e cabeçalho/rodapé: os oito ficheiros permanecem intactos. Sem dependências novas ou alteração de package/lockfile. O pipeline de imagens regenerou apenas o novo marcador.
- **2026-11-07 — HTML e HTTP:** o corpo HTML de `/pt/` é idêntico byte a byte ao build de referência. Os corpos de `/` e `/en/` diferem apenas no artigo corrigido. `robots.txt` e `sitemap.xml` são idênticos aos da referência. Verificados HTTP 200 e conteúdo correspondente aos ficheiros em todas as 43 páginas físicas; os três novos recursos respondem 200 com MIME correcto. Uma rota inexistente responde 404 com o documento dedicado, `noindex` e sem canonical.
- **2026-11-07 — Testes:** `npm run lint` sem erros; `npm run build` concluído, com 43 rotas e três URLs no sitemap; `npm test`: 36 testes passaram, zero falhas; `git diff --check` sem erros. A suite SEO-02 cobre a frase inglesa, dimensões medidas, favicon, ausência do identificador inadequado no HTML/JavaScript publicado, semântica do marcador e manutenção de `noindex` nos 12 projectos em todas as variantes e nos catálogos.
- **2026-11-07 — Avisos da base:** build antes e depois da alteração apresenta os mesmos avisos: Browserslist/caniuse-lite desactualizado; regra CSS gerada `padding-left: var(--tracking-*)` inválida; bundle superior a 500 kB. O bundle passou de 509,69 kB para 509,72 kB. Não foram suprimidos avisos nem alteradas dependências/CSS fora do lote.
- **2026-11-07 — Verificação visual:** favicon inspeccionado a 16, 32, 48 e 192 px; marcador inspeccionado directamente. Foi capturada referência no navegador antes da alteração do build, incluindo EN, PT, catálogo e Vancouver. A emulação revelou zoom de 80% e a largura CSS 375 foi confirmada; as capturas iniciais das outras larguras não equivalem a 768/1440 CSS px e não são contabilizadas como verificações nessas larguras. Durante a tentativa de calibração, a ferramenta interrompeu o controlo por não conseguir confirmar o URL da janela Windows. Respeitada a interrupção, sem novas acções de UI. Não foi executada a comparação final do DOM hidratado, alternância PT/EN, foco nem a revisão final em 375/768/1440 px. Essas verificações permanecem pendentes; os testes de HTML/HTTP não as substituem.
- **2026-11-07 — Limites externos:** nenhuma integração em `main`, publicação ou escrita no Search Console. Os resultados HTTP referem-se ao servidor estático local do build. Não se afirma actualização do índice, título ou miniatura públicos.
- **2026-11-07 — Revisão React:** as alterações TSX limitam-se ao texto alternativo decorativo do marcador identificado nos dados. Não foram acrescentados hooks, efeitos, eventos, estilos ou dependências. A localização preserva o novo atributo tipado; o título continua adjacente nos consumidores. O URL local é convertido para absoluto apenas nos metadados. A revisão do diff confirmou o âmbito aprovado.
- **2026-11-07 — Integração e publicação autorizadas:** após a entrega dos commits `6082cb6` e `faac0e8`, o utilizador ordenou o merge e publicação directa em `main`. Registada a aceitação da branch `codex/fix-seo02-en-search-appearance`, mantendo a ressalva de validação no navegador anteriormente comunicada. Integrar o lote validado sem desenvolvimento de código em `main`, preservar a branch e acompanhar o workflow de Pages e o conteúdo HTTP público. O resultado efectivo da publicação será confirmado na entrega, sem o confundir com actualização do índice Google.
- **2026-11-07 — Publicação efectiva:** merge `b9085d1e30896ad9bf225fbdaf041d1e08f3617d` enviado a `origin/main`, com a branch de execução preservada. O [workflow GitHub Pages 42361465289](https://github.com/simaoartur-web/oaworkshop/actions/runs/42361465289) concluiu com sucesso, incluindo build, upload e deploy. O domínio público apresentou `Last-Modified: Sat, 07 Nov 2026 09:52:12 GMT`.
- **2026-11-07 — HTTP público:** as 43 rotas estáticas responderam 200, com um único título e sem a referência à fotografia inadequada; os projectos demonstrativos mantiveram `noindex`. Sete recursos públicos responderam 200 com MIME correcto; os cinco recursos de imagem comparados coincidem por SHA-256 com o build local. `robots.txt` e sitemap coincidem após normalização das terminações de linha. A rota inexistente respondeu 404, com `noindex` e sem canonical. A comparação literal do corpo HTML encontrou uma quebra de linha final adicional no build Windows; não se apresenta o HTML público como idêntico byte a byte.
- **2026-11-07 — Navegador público:** concluídos 15 casos, combinando `/`, `/en/`, `/pt/`, catálogo inglês e Vancouver inglês com 375, 768 e 1440 CSS px efectivamente medidos. Título, idioma, descrição, robots, canonical, alternates, Open Graph, Twitter e JSON-LD do DOM hidratado coincidem com o HTML público, sem conflitos. Sem transbordo horizontal; marcador carregado e com `alt=""` no catálogo/detalhe. Confirmadas visualmente a frase inglesa corrigida e a apresentação das páginas afectadas. A alternância para PT preservou o projecto, o marcador e `noindex`; o regresso a EN e refresh funcionaram. A navegação por Tab apresentou foco visível no link institucional. Não foram observados avisos/erros de consola na consulta final. Evidências HTTP, DOM, navegação e capturas das três larguras guardadas nos artefactos locais da entrega, sem versionar registos de execução.
- **2026-11-07 — Fecho:** a limitação inicial de validação no navegador ficou resolvida com o navegador interno; nenhuma alteração adicional de código foi necessária. O fecho documental é preparado na branch de execução antes de integração. A apresentação efectivamente indexada pelo Google e o Search Console permanecem por verificar, sem pedido de indexação nem promessa de prazo.
