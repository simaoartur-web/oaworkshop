# Contribuir para o projecto

## Princípio central

O desenvolvimento segue um ciclo controlado:

`pedido → plano → aprovação → branch → execução → verificação → aceitação → integração`

Nenhuma etapa de execução deve começar antes de existir um plano aprovado.

## 1. Preparar uma iniciativa

1. Consultar `AGENTS.md` e `PROJECT_MAP.md`.
2. Confirmar o estado actual do Git e preservar alterações alheias.
3. Criar ou actualizar um plano numerado em `plans/`.
4. Definir objectivo, âmbito, exclusões, riscos, ficheiros previstos, critérios de aceitação e verificações.
5. Aguardar a aprovação expressa do utilizador.

Se o âmbito mudar durante a execução, parar, actualizar o plano e pedir nova aprovação.

## 2. Branches

- `main`: versão canónica e publicável.
- `codex/feature-<tema>`: nova capacidade.
- `codex/fix-<tema>`: correcção de comportamento.
- `codex/docs-<tema>`: documentação e governação.
- `codex/chore-<tema>`: manutenção sem nova funcionalidade.

Criar a branch a partir da versão canónica adequada. Não misturar iniciativas independentes. Uma excepção ao prefixo deve ser expressamente aceite no plano.

## 3. Execução

- Alterar apenas o âmbito aprovado.
- Manter o estilo e a arquitectura existentes, salvo refactorização aprovada.
- Fazer alterações pequenas e verificáveis.
- Actualizar documentação, traduções, testes e `PROJECT_MAP.md` juntamente com o código que os afecta.
- Não introduzir segredos ou dados pessoais.
- Não adicionar back-end enquanto vigorar a decisão front-end primeiro.

## 4. Commits

Preferir mensagens no formato:

```text
tipo: descrição curta no imperativo
```

Tipos recomendados: `feat`, `fix`, `docs`, `refactor`, `test`, `chore` e `perf`.

Cada commit deve representar uma unidade coerente, ser reversível e não incluir alterações alheias. Não alterar o histórico publicado sem autorização.

## 5. Verificação

Antes de apresentar uma branch para aceitação:

```bash
npm run lint
npm run build
```

Aplicar também a lista de verificações de `docs/QUALITY.md` e os critérios do plano. Falhas anteriores ao trabalho devem ser distinguidas de regressões introduzidas pela branch.

## 6. Revisão e versão canónica

A entrega deve incluir:

- resumo do resultado;
- ficheiros alterados;
- verificações executadas e respectivos resultados;
- diferenças face ao plano;
- riscos ou trabalho restante.

O utilizador decide se a branch é candidata canónica. Só depois dessa decisão se integra em `main`. A publicação de `main` é automática através do GitHub Pages, pelo que uma integração pode afectar imediatamente o site público.

## 7. Conflitos e reversão

- Resolver conflitos compreendendo ambos os lados; não escolher automaticamente uma versão completa.
- Parar quando o conflito envolver trabalho não documentado do utilizador.
- Preferir uma reversão explícita a reescrever o histórico publicado.
- Não eliminar branches, `stash` ou artefactos de salvaguarda sem confirmação.
