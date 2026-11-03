# Plano 081 — Registo do relatório de auditoria SEO-02

> **Estado:** CONCLUÍDO (registo documental validado na branch)
> **Data:** 2026-11-03
> **Base:** `main` / `origin/main` @ `7c5a708d44598ac0d9448a6b2b3513d72eeb74c8`
> **Branch:** `codex/docs-seo02-google-search-audit`
> **Autorização do âmbito documental:** pedido expresso do utilizador em 2026-11-03: «Manda o relatorio para o git».
> **Correcções SEO:** aprovação pendente; este plano não autoriza a Fase D.

## Objectivo

Guardar no repositório o relatório SEO-02 já entregue na conversa e disponibilizá-lo no GitHub através de um commit documental numa branch própria.

## Contexto e estado actual

As Fases A, B e C da auditoria foram concluídas exclusivamente em leitura. O relatório distinguiu o estado actual de produção, o histórico Git, os resultados das ferramentas Google e as hipóteses que exigem acesso ao Search Console. O pedido seguinte autoriza o registo e envio desse relatório para o Git.

## Âmbito incluído

1. Criar `docs/SEO_02_GOOGLE_SEARCH_APPEARANCE_AUDIT.md` com o diagnóstico, evidências, limitações e proposta correctiva já apresentados.
2. Actualizar os índices em `PROJECT_MAP.md` e `plans/README.md`.
3. Rever o diff, executar `git diff --check`, criar um commit atómico e enviar a branch para `origin`.

## Fora do âmbito

- Implementar as intervenções correctivas propostas no relatório.
- Alterar código, imagens, metadados, indexação ou dependências.
- Solicitar indexação no Google, alterar acessos, integrar em `main` ou publicar o website.

## Ficheiros previstos

| Ficheiro | Responsabilidade |
|---|---|
| `docs/SEO_02_GOOGLE_SEARCH_APPEARANCE_AUDIT.md` | Relatório documental das Fases A, B e C da SEO-02 |
| `plans/081-registo-relatorio-seo02.md` | Âmbito, autorização e verificações deste registo documental |
| `PROJECT_MAP.md` | Localizar o relatório e o seu plano de registo |
| `plans/README.md` | Indexar o Plano 081 |

## Riscos e salvaguardas

- Preservar a distinção entre hipótese e facto, sobretudo quanto à miniatura e à versão indexada pelo Google.
- Não incluir dados privados da conta utilizada no navegador, credenciais, respostas brutas de serviços ou caminhos pessoais do computador.
- Preservar a branch anterior e manter este lote separado das correcções SEO e da publicação do website.

## Critérios de aceitação

- Relatório completo, com as sete secções pedidas e fontes rastreáveis.
- Apenas os quatro ficheiros documentais previstos constam do commit.
- `git diff --check` sem erros.
- Branch remota aponta para o commit local entregue.

## Verificações

- Estado Git inicial limpo; branch anterior `codex/r07-workshop-responsive-continuity` preservada.
- `origin/main` confirmado em `7c5a708`; branch documental criada a partir dessa base.
- Relatório revisto com as sete secções obrigatórias e 19 ligações locais verificadas.
- Diff dos índices revisto; apenas os quatro ficheiros documentais previstos integram o lote.
- `git diff --check` executado sem erros.
- O envio para `origin` e a igualdade do SHA remoto serão confirmados na entrega do commit.
- Lint, build e testes de aplicação não se aplicam a este lote exclusivamente documental.

## Registo de decisões e desvios

- **2026-11-03:** registada a autorização expressa para guardar e enviar o relatório. A proposta correctiva continua pendente de aprovação própria.
- **2026-11-03:** seleccionado um ficheiro Markdown versionado e uma branch documental própria. Nenhuma integração em `main` foi pedida.
- **2026-11-03:** revisão documental concluída, incluindo preservação das limitações da auditoria e da aprovação pendente das correcções.

## Resultado

Relatório completo guardado em `docs/SEO_02_GOOGLE_SEARCH_APPEARANCE_AUDIT.md`, com o mapa e o índice de planos actualizados. Lote documental validado para commit e envio na branch `codex/docs-seo02-google-search-audit`. A confirmação do envio remoto acompanha a entrega. A Fase D permanece pendente de aprovação.
