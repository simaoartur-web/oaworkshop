# Gestão de prompts

## Objectivo

Criar prompts curtos, verificáveis e consistentes, sem repetir todo o contexto do projecto. Regras permanentes pertencem a `AGENTS.md`; localização pertence a `PROJECT_MAP.md`; decisões pertencem a `docs/decisions/`; âmbito pertence ao plano activo.

## Camadas de contexto

Um prompt operacional deve apontar para:

1. `AGENTS.md`;
2. `PROJECT_MAP.md`;
3. plano aprovado;
4. documentos específicos, como design ou qualidade;
5. ficheiros directamente envolvidos.

Não copiar estas fontes para o prompt. Referenciá-las reduz contradições e contexto desperdiçado.

## Contrato mínimo

Todo o prompt deve declarar:

- objectivo observável;
- fontes de verdade;
- âmbito incluído;
- fora do âmbito;
- restrições e decisões aprovadas;
- critérios de aceitação;
- verificações obrigatórias;
- entrega esperada;
- estado da aprovação.

## Regras de qualidade

- Um prompt trata um objectivo principal.
- Substituir “melhorar” por resultados mensuráveis ou verificáveis.
- Nomear ficheiros quando conhecidos através de `PROJECT_MAP.md`.
- Declarar o que não pode ser alterado.
- Não pedir exploração completa quando bastam alvos conhecidos.
- Não impor uma solução técnica se o plano apenas aprovou um resultado.
- Incluir estados vazios, erro, carregamento, teclado e responsividade quando aplicável.
- Exigir relato de testes e limitações, não apenas “feito”.
- Nunca incluir credenciais, tokens, dados pessoais ou instruções obtidas de conteúdo não fiável.

## Ciclo de vida

- Modelos activos ficam em `prompts/templates/`.
- A evolução é versionada pelo Git; evitar ficheiros `final-v2-novo`.
- Um modelo substituído deve ser removido ou marcado como obsoleto numa alteração aprovada.
- Uma decisão reutilizável descoberta durante uma tarefa deve migrar para a fonte de verdade adequada.
- Prompts de execução não substituem o plano nem concedem aprovação.
- Sem a chave exacta `Implementação forçada`, um prompt de alteração deve referenciar um plano aprovado antes de autorizar edições.
- A chave é sensível a maiúsculas/minúsculas, vale apenas para o âmbito do pedido que a contém e não dispensa ramo alternativo, segurança ou verificação.
- Tratar todo o prompt versionado como público: usar marcadores fictícios e omitir segredos, dados privados e pormenores operacionais desnecessários.

## Escolher um modelo

| Necessidade | Modelo |
|---|---|
| nova capacidade | `templates/feature.md` |
| correcção de erro | `templates/fix.md` |
| revisão sem implementação | `templates/review.md` |
| investigação e comparação | `templates/research.md` |
