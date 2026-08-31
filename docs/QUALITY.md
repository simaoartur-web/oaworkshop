# Qualidade e validação

## Regra de aceitação

Uma alteração não está concluída apenas porque compila. Deve cumprir os critérios do plano, não introduzir regressões e ser verificável por outra pessoa.

## Verificações automáticas mínimas

Depois de qualquer alteração de código:

```bash
npm run lint
npm run build
```

Usar `npm ci` quando for necessário confirmar uma instalação limpa. Não alterar o `package-lock.json` sem uma mudança deliberada de dependências.

Falhas já existentes devem ser documentadas com ficheiro e regra; novas falhas bloqueiam a entrega.

## Verificação visual

Alterações de interface exigem revisão no navegador, pelo menos em:

- 375 px — telemóvel;
- 768 px — tablet;
- 1440 px — computador.

Percursos críticos actuais:

1. abrir a página inicial;
2. abrir e fechar a navegação;
3. alternar PT/EN;
4. percorrer as secções da página inicial;
5. abrir a lista de projectos;
6. abrir um detalhe de projecto;
7. usar ligações internas e regressar ao topo.

Confirmar ausência de erros na consola, pedidos de API inesperados, conteúdo cortado, deslocação horizontal e controlos inacessíveis.

## Acessibilidade

- Navegar integralmente com teclado.
- Confirmar ordem de foco e indicador visível.
- Usar elementos semânticos e nomes acessíveis.
- Verificar texto alternativo das imagens.
- Confirmar contraste WCAG 2.2 AA.
- Testar `prefers-reduced-motion` quando houver animações.
- Não depender apenas de cor, hover ou movimento para comunicar estado.

## Desempenho

Rever quando uma alteração aumentar:

- o JavaScript inicial;
- imagens acima da dobra;
- fontes ou variantes tipográficas;
- número de animações simultâneas;
- trabalho do mapa ou de carrosséis durante o carregamento.

A compilação actual apresenta aviso quando um bloco JavaScript excede 500 kB. O plano de desempenho deverá definir um orçamento formal e divisão de código; até lá, qualquer aumento deve ser justificado.

## Conteúdo e internacionalização

- As chaves de `pt.ts` e `en.ts` devem corresponder.
- Não deixar chaves sem uso quando a funcionalidade for removida.
- Verificar textos longos e nomes reais em todas as larguras.
- Não publicar ligações `#` como destino final sem plano para as substituir.

## Git e entrega

Antes de entregar:

1. Rever `git diff` e confirmar que só existe âmbito aprovado.
2. Executar `git diff --check`.
3. Actualizar plano, mapa e documentos afectados.
4. Registar comandos executados e resultados.
5. Indicar avisos, limitações e riscos restantes.

## Publicação

O fluxo `.github/workflows/deploy.yml` publica alterações de `main` no GitHub Pages. Antes de integrar em `main`, confirmar que a branch foi declarada canónica e que `npm run build` termina com sucesso.
