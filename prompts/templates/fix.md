# Prompt — Correcção

## Problema observável

[Sintoma, percurso e resultado actual.]

## Resultado esperado

[Comportamento correcto e verificável.]

## Fontes de verdade

- `AGENTS.md`
- `PROJECT_MAP.md`
- `[plano aprovado]`
- `[ficheiros ou registos relevantes]`

## Limites

- Corrigir a causa com o menor âmbito seguro.
- Não refactorizar áreas independentes.
- Não ocultar erros nem enfraquecer validações.

## Critérios de aceitação

- O caso descrito deixa de falhar.
- Casos adjacentes continuam funcionais.
- Existe verificação que impediria a regressão, quando proporcional.

## Verificações e entrega

Executar `npm run lint`, `npm run build` e o percurso afectado. Entregar causa, correcção, ficheiros, testes e riscos.

## Aprovação

[Pendente ou referência da aprovação.]
