# ADR 0002 — Identidade do website em JSON-LD

> **Estado:** ACEITE — decisão e branch do Plano 084 aceites pelo utilizador; integração/publicação autorizadas em 2026-11-08.
> **Data:** 2026-11-08

## Contexto

O SEO-01/SEO-02 publica `Organization` nas homepages, com idioma, metadados e indexação definidos por rota. Falta uma entidade `WebSite` que expresse a preferência de nome para o domínio. O Google aplica esse nome ao website, sem nomes próprios por subdirectório de idioma.

## Decisão

- Identificar o website como `https://www.oa-workshop.com/#website`, com nome preferido `O+A Architects and Planners`, alternativas ordenadas `O+A Workshop` e `O+A`, e URL `https://www.oa-workshop.com/`.
- Publicar essa entidade apenas na raiz `/`, sem variação pelo idioma activo. Manter `Organization` e `#organization` com o contrato anterior.
- Usar o campo tipado opcional `websiteJsonLd` e o selector próprio `script[data-seo="website-json-ld"]`. A definição reside em `src/seo/metadata.ts`; cliente e prerender consomem o mesmo objecto.
- Reconciliar o script no efeito existente de `DocumentHead`, evitando duplicados e removendo-o fora da raiz. Não alterar a montagem, o router ou a política de idioma/hidratação.

## Consequências

O HTML estático e o DOM hidratado exprimem a mesma preferência. O `Organization` permanece nos três documentos iniciais e os restantes sinais SEO conservam o comportamento anterior. Não há nova dependência, serviço ou conteúdo visível.

A marcação não garante que o Google adopte o nome preferido. A validação comprova estrutura e coerência; não comprova a versão indexada nem substitui uma futura verificação autorizada do Search Console.

## Condições de revisão

Rever esta decisão através de plano aprovado se mudar a identidade editorial, o domínio, a arquitectura de idiomas ou o contrato de dados estruturados. Confirmar novamente a documentação oficial antes de alterar o âmbito da entidade.

## Referências

- [Plano 084](../../plans/084-seo03-identidade-resultados.md)
- [Google — nomes de websites](https://developers.google.com/search/docs/appearance/site-names)
