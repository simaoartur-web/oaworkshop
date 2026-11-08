# Plano 084 — SEO-03: identidade do website nos resultados Google

> **Estado:** CANÓNICO — integrado em `main`, publicado pelo GitHub Pages e verificado em produção por HTTP e DOM.
> **Data:** 2026-11-08
> **Base confirmada:** `main` e `origin/main` @ `9b43da8a5af5ee90a0034df207b7779822c35787`.
> **Branch de preparação:** `codex/docs-seo03-site-name-plan`.
> **Branch de implementação:** `codex/feat-seo03-site-name-refinement`, criada a partir de `origin/main` @ `9b43da8` após reconfirmação remota.
> **Autorização de preparação:** pedido do utilizador em 2026-11-08: «Sim, faça isso. Depod me apresente o plano de implementação».
> **Aprovação da implementação:** concedida pelo utilizador em 2026-11-08: `APROVADO: plans/084-seo03-identidade-resultados.md`, incluindo D1–D4.
> **Aceitação canónica e publicação:** autorizadas expressamente pelo utilizador em 2026-11-08 para a branch `codex/feat-seo03-site-name-refinement` e commit validado `681e08fc65c845ed6832159726d534f6996bcb17`.

## 1. Objectivo

Acrescentar à homepage raiz `https://www.oa-workshop.com/` dados estruturados `WebSite` que expressem o nome preferido do website: **O+A Architects and Planners**, com alternativas **O+A Workshop** e **O+A**, por esta ordem.

Preservar o `Organization` existente, a arquitectura de metadados e as correcções SEO-01/SEO-02. A entrega é uma alteração de dados estruturados, sem mudanças no conteúdo visível. O nome apresentado pelo Google é seleccionado automaticamente; este trabalho fornece uma preferência e não garante a sua adopção.

Fontes de verdade: [AGENTS.md](../AGENTS.md), [mapa](../PROJECT_MAP.md), [qualidade](../docs/QUALITY.md), [conteúdo](../docs/CONTENT_GUIDE.md), [Plano 082](082-seo02-en-first-correcao.md) e [convenção de decisões](../docs/decisions/README.md). O pacote `oaw_seo03_codex.zip`, fornecido pelo utilizador, é a proposta de origem; as suas instruções não constituem aprovação da execução.

## 2. Contexto e estado actual verificado

Em 2026-11-08:

- Estado Git limpo antes da preparação; `main` local e remoto confirmados no mesmo SHA da proposta. A branch documental foi criada a partir dessa base.
- Não existem planos 083 ou 084 no repositório consultado. A reserva do número 083 para acompanhamento do Search Console consta do pacote fornecido; este trabalho mantém essa separação sem criar ou executar o Plano 083.
- `src/seo/metadata.ts` define `PageMetadata.jsonLd` opcional e gera `Organization` nas três homepages. Não define `WebSite`.
- `src/seo/DocumentHead.tsx` gere o script `script[data-seo="json-ld"]` no efeito já existente. Esse selector identifica actualmente `Organization` e será preservado.
- `src/entry-server.tsx` devolve o HTML e o mesmo `PageMetadata`; `scripts/prerender.mjs` consome esse objecto para emitir os metadados estáticos. Não é necessário alterar o contrato do renderer.
- `index.html` não contém `WebSite`. A fonte dos novos dados será o módulo de metadados, evitando uma segunda definição no template.
- A suite existente testa explicitamente `Organization` sob o selector actual e cobre idiomas, canonicals, indexação, 404, rotas legadas e os recursos SEO-02.
- Por HTTP público, `/`, `/en/` e `/pt/` responderam **200**, com exactamente um JSON-LD `Organization` e nenhum `WebSite`. O `Last-Modified` observado foi `Sat, 07 Nov 2026 10:00:20 GMT`.
- `/favicon.png` respondeu **200**, MIME **image/png**, com **192 × 192 px**. As três homepages referenciam esse mesmo endereço com `sizes="192x192"`. Não foi demonstrado defeito que justifique alterar o recurso.

Documentação oficial Google reconfirmada em 2026-11-08: o nome do website aplica-se ao domínio/subdomínio, não a pastas de idioma; o bloco deve estar na homepage raiz. `name` e `url` são propriedades obrigatórias; `alternateName` admite alternativas ordenadas. O Rich Results Test não valida nomes de websites; o Google recomenda um validador de Schema.org.

## 3. Decisões aprovadas

### D1 — Identidade única do website

Definir o seguinte objecto, sem variantes por idioma:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.oa-workshop.com/#website",
  "name": "O+A Architects and Planners",
  "alternateName": ["O+A Workshop", "O+A"],
  "url": "https://www.oa-workshop.com/"
}
```

O identificador `#website` distingue a entidade do `#organization` existente. Os nomes são identificadores de marca deliberadamente editoriais; não serão duplicados nas traduções nem usados para reescrever nomes portugueses existentes.

### D2 — Campo e script próprios

Adicionar um tipo explícito para os campos de `WebSite` e a propriedade opcional `websiteJsonLd` a `PageMetadata`. Manter `jsonLd` e o seu conteúdo `Organization` intactos; não converter a estrutura para `@graph` nem criar uma infraestrutura genérica de schemas.

Usar `data-seo="website-json-ld"` no script adicional, com `type="application/ld+json"`, tanto no HTML estático como no cliente. Criar o objecto numa única função em `metadata.ts`, consumida pelos dois percursos existentes.

### D3 — Presença exclusiva na raiz e reconciliação

Preencher `websiteJsonLd` exclusivamente quando `pathname === '/'`, com nome e URL independentes do idioma activo. `/en`, `/en/`, `/pt`, `/pt/`, catálogos, detalhes, caminhos desconhecidos e 404 não recebem esse bloco.

No efeito existente de `DocumentHead`, reutilizar ou criar o script próprio na raiz; actualizar o conteúdo e assegurar uma única ocorrência. Ao sair da raiz, remover os scripts desse selector. Ao regressar por navegação ou histórico, repor exactamente um. Esta gestão não altera o script `Organization`, a montagem React, o router ou a política de idioma/hidratação.

No prerender, emitir o novo script apenas quando o campo existir. Não acrescentar uma definição fixa ao template global, que seria copiada para outras rotas.

### D4 — Registo duradouro

Na implementação, registar a distinção entre `WebSite` e `Organization`, o identificador estável, o âmbito da raiz e a invariância por idioma em `docs/decisions/0002-identidade-website-json-ld.md`, com o índice actualizado. A convenção exige estado, data, contexto, decisão, consequências e condições de revisão. Não se trata de nova dependência ou reformulação da arquitectura.

## 4. Âmbito e ficheiros previstos

Nesta preparação autorizada, alterar exclusivamente este plano e os seus índices: `PROJECT_MAP.md` e `plans/README.md`.

Após aprovação:

| Ficheiro | Alteração prevista |
|---|---|
| `src/seo/metadata.ts` | Tipo explícito, construtor e campo opcional `websiteJsonLd`, exclusivo da raiz |
| `src/seo/DocumentHead.tsx` | Reconciliação do script próprio após hidratação e navegação, incluindo remoção e prevenção de duplicados |
| `scripts/prerender.mjs` | Emissão estática condicional do novo script a partir do mesmo objecto |
| `tests/seo-verification.test.mjs` | Regressões do contrato `WebSite`, presença/ausência, preservação de `Organization` e invariantes existentes |
| `docs/decisions/0002-identidade-website-json-ld.md` | Decisão duradoura D1–D3, sem copiar o plano integral |
| `docs/decisions/README.md` | Indexar a decisão |
| `PROJECT_MAP.md`, `plans/README.md`, este plano | Actualizar responsabilidades efectivas, estado, decisões e verificações |

### Fora do âmbito

- Títulos, descrições, `og:site_name`, restantes OG/Twitter, canonicals, alternates/hreflang, traduções, HTML visível, design, imagens e nomes de projectos.
- Recriar, renomear ou alterar o favicon, o logótipo ou o marcador neutro. Um defeito novo exige revisão do âmbito antes de qualquer correcção.
- `robots.txt`, sitemap, rotas, conteúdo PT/EN, número de páginas, estatuto demonstrativo e regras de `noindex`.
- Alterar `src/main.tsx`, `src/i18n.ts`, o router ou o renderer. `src/entry-server.tsx` foi consultado apenas para confirmar a propagação do contrato de metadados.
- Back-end, API própria, SaaS, autenticação, novas dependências ou alterações de package/lockfile e workflow.
- Criar ou executar o Plano 083; aceder/escrever no Search Console, pedir indexação ou prometer mudanças na pesquisa.
- Merge e deploy estavam fora da aprovação inicial de implementação. A autorização posterior expressa de 2026-11-08 abrange a integração da branch SEO-03 aceite e a publicação pelo GitHub Pages; Search Console continua excluído.

## 5. Etapas da implementação

1. **Reconfirmar a autorização e a base:** verificar aprovação deste plano, `git status`, `origin/main` e eventuais alterações concorrentes nos módulos SEO. Criar a branch de implementação a partir da `main` actual, transportar apenas este plano e os respectivos índices e preservar branches anteriores. Se a base tiver alterações materiais, actualizar o plano antes de executar.
2. **Capturar a referência local:** executar o build actual e guardar fora dos ficheiros versionados a referência de títulos, metadados, JSON-LD, corpos HTML, sitemap, robots e hashes dos recursos preservados. Registar os resultados e avisos reais da base.
3. **Implementar D1–D3:** acrescentar o objecto tipado na raiz, emissão estática e gestão idempotente do script no efeito existente. Preservar o selector e os dados de `Organization`.
4. **Acrescentar regressões:** testar o comportamento observável dos artefactos gerados e do resolvedor de metadados, sem adicionar bibliotecas ou testes que se limitem a procurar linhas da implementação.
5. **Validar HTML, HTTP e navegador:** executar os comandos e percursos da secção seguinte, comparar com a referência e registar resultados reais. Validar o fragmento `WebSite` com o Schema Markup Validator, sem usar o Rich Results Test como prova deste tipo de resultado.
6. **Documentar e entregar:** registar D4, actualizar os índices/plano, rever o diff, criar commits atómicos e apresentar SHA, ficheiros, verificações, avisos e limitações. Aguardar aceitação expressa da branch antes de qualquer merge/publicação.

## 6. Critérios de aceitação e verificações

### Automáticos e artefactos estáticos

- Executar `npm run lint`, `npm run build`, `npm test` e `git diff --check`; registar falhas e avisos sem os ocultar.
- `dist/index.html`: exactamente um `WebSite` no selector novo e um `Organization` no selector actual; JSON válido, tipos e identidades distintos; valores de D1 exactos.
- Todas as restantes páginas estáticas, incluindo `/en/`, `/pt/`, catálogos, detalhes e `404.html`: nenhum script `WebSite` nem entidade residual desse tipo. Preservar `Organization` nas homepages e a sua ausência onde já não existia.
- Testar `getPageMetadata` na raiz e nos caminhos não raiz, incluindo variantes com/sem barra final, páginas desconhecidas e `getNotFoundMetadata`. O nome `WebSite` da raiz permanece constante mesmo perante um idioma activo diferente.
- Comparar o conteúdo `Organization` e os restantes metadados com a referência. Corpos HTML, traduções e recursos originais preservados; nenhum caminho ou política editorial alterados.
- Manter as 43 páginas estáticas e três URLs no sitemap, enquanto não houver alteração aprovada da base. Os 12 projectos demonstrativos e catálogos continuam `noindex, nofollow`, fora do sitemap; 404 sem canonical e sem JSON-LD.
- Manter `robots.txt` e sitemap iguais à referência, ressalvando apenas terminações de linha da plataforma. Favicon local com os mesmos bytes, endereço, MIME e dimensões 192 × 192.

### HTTP, hidratação e navegação

- Servir o build por HTTP estático sem fallback SPA. Verificar a raiz, `/en/`, `/pt/`, `/projects/`, detalhe de Vancouver, `404.html`, uma rota inexistente e `/favicon.png`, com códigos e MIME adequados. O erro HTTP real e o estado 404 do cliente são verificações distintas.
- Comparar HTML inicial e DOM hidratado no **mesmo caminho**: scripts e conteúdo JSON-LD, título, idioma, descrição, canonical, robots, OG/Twitter e alternates. Não comparar `/` com `/en/` como se fossem o mesmo documento.
- Testar acesso directo e refresh nos caminhos acima. Na raiz, navegar por ligações existentes para uma página de idioma ou catálogo; usar Voltar/Avançar para verificar remoção e reposição de `WebSite`, sem recarregar deliberadamente entre transições. Repetir o ciclo para detectar acumulação de scripts.
- Preservar a alternância PT/EN e observar ausência de avisos/erros de consola e de hidratação. Não executar mutações de estado por JavaScript de teste como substituto da navegação real.
- Não está prevista alteração de interface. A revisão responsiva integral do SEO-02 não será repetida por rotina; qualquer regressão visível exige avaliação e, se houver correcção de interface no âmbito revisto, validação a 375, 768 e 1440 px segundo `docs/QUALITY.md`.
- Guardar evidências locais fora do repositório público. Uma captura pode contextualizar a página verificada, mas não prova por si só a presença de JSON-LD; a prova inclui contagem e conteúdo do HTML/DOM.
- Se o navegador ou o validador externo estiver indisponível, identificar exactamente o que ficou por validar. Não marcar essa verificação como concluída por terem passado apenas os testes estáticos.

## 7. Riscos e salvaguardas

| Risco | Salvaguarda |
|---|---|
| Dois nomes ou entidades de website divergentes | Um único objecto, `#website` estável, apenas na raiz, sem tradução por pasta |
| Quebrar o contrato `Organization` e a suite SEO-02 | Campo/selector próprios; comparar a estrutura existente com a referência |
| Deixar scripts da raiz em rotas não raiz ou duplicá-los ao regressar | Reconciliação idempotente e ciclos reais de navegação/histórico |
| O template propagar `WebSite` para todo o site | Emissão no prerender condicionada pelo campo de metadados; verificar todas as páginas geradas |
| Confundir marcação válida com resultado indexado | Validar estrutura e domínio de aplicação; não prometer adopção, prazo ou resultado do Google |
| Base concorrente ou novo defeito ampliar o lote | Reconfirmar a base após aprovação e rever materialmente o plano quando necessário |

## 8. Registo da preparação e desvios face ao pacote

- **2026-11-08:** lidos AGENTS, mapa, índice de planos, Plano 082, qualidade, conteúdo, convenção de decisões e os módulos directamente envolvidos. `entry-server.tsx` e `index.html` consultados para confirmar o percurso SSR e a ausência de marcação fixa no template. Não houve exploração geral do repositório.
- **2026-11-08:** confirmados a base Git, a ausência do Plano 084, o estado público das três homepages e o favicon. Nenhum acesso ao Search Console ou alteração da publicação.
- **2026-11-08:** proposta do ZIP revista com tipo explícito, `@id` e selector concretos, teste de histórico, distinção entre verificação estática/DOM e erro HTTP, e referência ao ADR exigido por AGENTS. A branch de implementação recebeu o tipo `feat` para seguir a convenção do projecto; a preparação fica numa branch `docs` própria.
- **2026-11-08:** a reserva de 083 é atribuída ao pacote, sem afirmar que já exista esse plano no repositório. Não foi importado o prompt do ZIP, pois esta entrega prepara o plano e não cria um prompt de execução.
- **2026-11-08:** preparação limitada a três ficheiros documentais. Lint, build, testes de implementação, comparação de DOM e validação externa do novo schema não foram executados nesta fase; ainda não existe implementação para os avaliar.
- **2026-11-08 — Verificação documental:** seis ligações locais resolvidas, UTF-8 legível e ausência de espaços finais nos três documentos; `git diff --cached --check` sem erros e diff limitado ao âmbito documental. O Git apresentou apenas o aviso de normalização futura LF/CRLF no novo Markdown, sem erro de conteúdo.

## 9. Aprovação e resultado esperado

Implementação aprovada expressamente pelo utilizador em 2026-11-08, incluindo D1–D4, com a seguinte declaração:

```text
APROVADO: plans/084-seo03-identidade-resultados.md
```

Essa aprovação autoriza implementação e verificações na branch própria. Merge, publicação e Search Console permanecem sujeitos às autorizações expressas descritas acima.

**Autorização posterior de integração e publicação, em 2026-11-08:** o utilizador declarou a branch canónica e aprovou a integração do Plano 084 na `main` e publicação em produção, identificando o commit validado `681e08fc65c845ed6832159726d534f6996bcb17`. Autorizados merge normal, acompanhamento do GitHub Pages, verificação em produção e actualização do estado documental. Preservar todas as branches e interromper perante conflitos materiais ou falhas de publicação; não executar alterações no Search Console.

## 10. Registo da execução

- **2026-11-08 — Início:** estado Git limpo e `origin/main` reconfirmado em `9b43da8`. Criada a branch aprovada sem tracking de `main`; transportado apenas o commit documental do Plano 084 e respectivos índices. Preservadas as branches anteriores. Segue-se a captura da referência local antes de alterar código.
- **2026-11-08 — Referência:** build da base concluído com 43 páginas e três URLs no sitemap; nenhuma imagem regenerada. Guardada referência externa ao repositório com metadados, JSON-LD e hash do corpo das 43 páginas, sete recursos do build e 52 ficheiros protegidos de conteúdo/configuração/recursos. Mantêm-se os avisos anteriores de Browserslist desactualizado, `padding-left: var(--tracking-*)` inválido e bundle de 509,72 kB acima de 500 kB.
- **2026-11-08 — Implementação:** adicionado o tipo `WebSiteJsonLd`, o construtor único e `PageMetadata.websiteJsonLd`, preenchido exclusivamente na raiz. O prerender emite `data-seo="website-json-ld"` apenas nessa página. O efeito existente do cliente actualiza/cria o script, remove duplicados e elimina-o fora da raiz. Mantidos o selector, contrato e conteúdo `Organization`. Registada a decisão aprovada no ADR 0002 e actualizadas as responsabilidades no mapa.
- **2026-11-08 — Verificação automática:** `npm run lint` sem erros; `npm run build` concluído com 43 páginas e três URLs no sitemap; `npm test`: **41 testes passaram, zero falhas**, incluindo as quatro novas verificações SEO-03. A suite anterior foi preservada. O build não regenerou imagens nem alterou dependências.
- **2026-11-08 — Comparação com a base:** nas 43 páginas, os corpos HTML e os metadados anteriores permanecem iguais; o JSON-LD `Organization` permanece igual onde existia. A raiz tem exactamente o `WebSite` aprovado, uma vez, ao lado de `Organization`; as restantes 42 páginas não têm essa entidade ou selector. Os sete recursos do build, incluindo sitemap e robots, e os 52 ficheiros protegidos coincidem por SHA-256 com a referência. A folha de estilos gerada mantém o mesmo hash.
- **2026-11-08 — HTTP local:** servidor estático sem fallback SPA: as 43 páginas responderam 200 e coincidem com os ficheiros compilados; favicon 200 `image/png`, com os bytes e dimensões 192 × 192 preservados. A rota inexistente respondeu HTTP 404 com o documento dedicado, `noindex, nofollow`, sem canonical nem JSON-LD. O acesso directo a `404.html` respondeu 200, distinguindo o recurso estático do erro HTTP real.
- **2026-11-08 — DOM e navegação:** **21 estados verificados** no navegador interno, com raiz, EN, PT, catálogo, detalhe de Vancouver, documento 404 e rota inexistente. HTML e DOM coincidem em título, idioma, metadados, links e JSON-LD no mesmo caminho; tags alternativas vazias são comparadas pela equivalência semântica já existente no cliente. Confirmados refresh, alternância PT/EN, remoção do bloco ao sair da raiz, reposição única em ciclos de Voltar/Avançar e regresso da página 404 pela ligação institucional. Consultas finais de consola sem avisos/erros, incluindo ausência de erros de hidratação. Não houve alterações de interface que exigissem repetir a matriz responsiva SEO-02.
- **2026-11-08 — Validador externo:** submetido ao Schema Markup Validator o fragmento efectivamente gerado no HTML da raiz: **um WebSite, zero erros e zero avisos**, com os nomes e identificador aprovados. Guardada captura do resultado, juntamente com as evidências de comparação/HTTP/DOM, fora dos ficheiros versionados. Não foi usado o Rich Results Test como prova deste tipo de resultado.
- **2026-11-08 — Avisos e impacto:** mantêm-se os três avisos anteriores: Browserslist/caniuse-lite desactualizado, regra CSS gerada `padding-left: var(--tracking-*)` inválida e bundle acima de 500 kB. O JavaScript passou de 509,72 para 510,31 kB (gzip: 160,08 para 160,18 kB), aumento correspondente à identidade e reconciliação aprovadas. Não foram suprimidos avisos nem executadas optimizações alheias ao lote.
- **2026-11-08 — Fecho e limites:** diff revisto e limitado aos nove ficheiros previstos; servidor de verificação local encerrado. Sem desvio material de âmbito, novas dependências ou alteração de configuração, conteúdo visível, idiomas, imagens, rotas ou indexação. `origin/main` foi reconfirmado em `9b43da8`; sem merge, deploy ou Search Console. A branch é candidata a revisão; o estado CONCLUÍDO não a declara canónica nem comprova alteração dos resultados Google.

## 11. Integração e publicação

- **2026-11-08 — Reconfirmação:** workspace limpo, `main` local/remota em `9b43da8a5af5ee90a0034df207b7779822c35787` e branch local/remota no commit aprovado `681e08fc65c845ed6832159726d534f6996bcb17`. Sem divergência entre referências; `main` é antepassada da branch, com os três commits SEO-03 previstos. Nenhuma alteração concorrente ou conflito identificado.
- **2026-11-08 — Aceitação:** actualizados apenas os registos documentais de estado e autorização antes da integração. A aplicação é a versão já validada por lint, build, 41 testes, comparação estática, HTTP, navegador e Schema.org. A confirmação efectiva do deploy e as verificações públicas serão acrescentadas após observação dos resultados.
- **2026-11-08 — Integração efectiva:** integrado o commit validado `681e08fc65c845ed6832159726d534f6996bcb17`, juntamente com `da7d732` (plano), `6e69f86` (aprovação/referência) e `ef652f3` (aceitação canónica), pelo merge `aa02abc45f3343f0594d3ef1fea6f12ae4d90125`. Enviado normalmente a `origin/main`, sem conflitos, force push, reescrita de histórico ou eliminação de branches. As diferenças face ao commit validado são exclusivamente documentais.
- **2026-11-08 — GitHub Pages:** o [workflow 42496373654](https://github.com/simaoartur-web/oaworkshop/actions/runs/42496373654) concluiu com sucesso, incluindo instalação, build, upload do artefacto e deploy. As três homepages apresentaram `Last-Modified: Sun, 08 Nov 2026 15:45:37 GMT` na verificação posterior.
- **2026-11-08 — HTTP em produção:** verificadas as 43 páginas estáticas, todas com HTTP 200 e um único título, comparando metadados e JSON-LD com a versão validada. Apenas a raiz contém um `WebSite`, ao lado de um `Organization`; `/en/` e `/pt/` contêm apenas o `Organization` anterior. Comparadas também com uma captura pública anterior ao merge: títulos, descrições, canonicals, hreflang, OG/Twitter e conteúdo `Organization` preservados. Os corpos HTML coincidem com o build após remover apenas espaço em branco nas extremidades do corpo, decorrente da plataforma de compilação.
- **2026-11-08 — Recursos e indexação:** sete recursos públicos com HTTP 200 e MIME correcto. Favicon `/favicon.png` inalterado, PNG 192 × 192; logótipo, OG institucional e marcadores locais coincidem por bytes com o build. `robots.txt` e sitemap coincidem após normalização de terminações de linha, com três URLs canónicas e alternates preservados. Directivas das páginas coincidem com a referência: homepages indexáveis, demonstrações em `noindex`. Rota inexistente responde HTTP 404 com `noindex`, sem canonical nem JSON-LD.
- **2026-11-08 — DOM em produção:** nove estados no navegador interno confirmaram a identidade e os metadados após hidratação na raiz, EN e PT, incluindo refresh e ciclos de Voltar/Avançar. O bloco `WebSite` é removido fora da raiz e reposto uma única vez ao regressar; `Organization` permanece correcto no idioma e caminho correspondentes. Consola sem avisos/erros na consulta final. Captura da página publicada e evidências de HTTP/DOM guardadas fora dos ficheiros versionados.
- **2026-11-08 — Encerramento:** publicação sem falhas observadas ou desvios materiais; mantêm-se os avisos anteriores documentados na secção 10. Este fecho documental é preparado na branch de execução antes de integração, sem nova alteração da aplicação. Branches preservadas e nenhuma alteração ou solicitação no Search Console. A implementação pública está pronta para acompanhamento do rastreio e da preferência de nome pelo Google; não se afirma que o índice ou o nome apresentado já tenham sido actualizados.

## Fontes oficiais consultadas em 2026-11-08

- [Google — nomes de websites](https://developers.google.com/search/docs/appearance/site-names): âmbito do domínio, homepage raiz, propriedades, alternativas, consistência e validação.
- [Google — favicon](https://developers.google.com/search/docs/appearance/favicon-in-search): proporção quadrada, acesso dos crawlers e estabilidade do URL.
- [Schema Markup Validator](https://validator.schema.org/): ferramenta indicada pelo Google para a verificação de marcação; a validação do novo fragmento está prevista para a implementação.
