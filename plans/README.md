# Planos do projecto

Este directório é a fonte de verdade para iniciativas que alteram o projecto. Nenhuma execução começa sem um plano aprovado pelo utilizador.

A única excepção é a chave exacta e sensível a maiúsculas/minúsculas `Implementação forçada`, escrita pelo utilizador no pedido correspondente. A chave dispensa o plano e a aprovação prévios, mas mantém o âmbito declarado, o ramo alternativo, as salvaguardas, as verificações e a aceitação antes da integração em `main`.

## Numeração

- `000–009`: governação e decisões fundadoras;
- `010–099`: arquitectura, produto e qualidade;
- `100–899`: funcionalidades e correcções planeadas;
- `900–999`: RFCs e iniciativas futuras de grande impacto.

Usar nomes como `NNN-descrição-curta.md`. Não reutilizar um número com significado diferente.

## Estados

`RASCUNHO` → `PROPOSTO` → `APROVADO` → `EM EXECUÇÃO` → `EM VALIDAÇÃO` → `CONCLUÍDO` → `CANÓNICO`

Estados excepcionais: `BLOQUEADO`, `SUBSTITUÍDO` e `CANCELADO`. Registar sempre a razão e a data.

`CONCLUÍDO` significa que o trabalho e as verificações terminaram na branch. `CANÓNICO` significa que o utilizador aceitou o resultado para integração em `main`.

## Aprovação

Forma recomendada:

```text
APROVADO: plans/NNN-descrição-curta.md
```

Uma alteração material ao âmbito, riscos ou decisões invalida a aprovação anterior até nova confirmação.

## Modelo de plano

```markdown
# Título

> **Estado:** PROPOSTO
> **Data:** AAAA-MM-DD
> **Branch prevista:** codex/tipo-descrição
> **Aprovação:** pendente

## Objectivo

## Contexto e estado actual

## Âmbito incluído

## Fora do âmbito

## Ficheiros previstos

## Etapas

## Riscos e salvaguardas

## Critérios de aceitação

## Verificações

## Registo de decisões e desvios

## Resultado
```

## Índice

| Número | Estado | Plano |
|---:|---|---|
| 000 | CANÓNICO | `000-plano-mestre-governacao-e-front-end.md` |
| 010 | CONCLUÍDO | `010-limpeza-publica-e-bilingue.md` |

## Roteiro proposto

Os seguintes planos serão criados individualmente e submetidos a aprovação antes de execução:

| Número | Iniciativa | Resultado esperado |
|---:|---|---|
| 020 | Auditoria de design | consolidar tokens e padrões repetidos |
| 030 | Arquitectura de informação | validar páginas, navegação e percursos |
| 040 | Conteúdo e internacionalização | rever PT/EN, dados locais e microtexto |
| 050 | Acessibilidade e responsividade | corrigir teclado, contraste e multi-ecrã |
| 060 | Desempenho e recursos | reduzir JavaScript, imagens e custo de movimento |
| 070 | Qualidade e testes | acrescentar testes unitários e ponta-a-ponta |
| 080 | SEO e publicação | metadados, domínio e verificações de publicação |
| 900 | RFC de back-end futuro | avaliar necessidades apenas após o front-end canónico |
