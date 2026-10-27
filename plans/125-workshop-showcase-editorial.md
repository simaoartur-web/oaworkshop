# Plano 125 — Refinamento da secção de áreas de actuação

> **Estado:** SUBSTITUÍDO em 2026-10-27 por `plans/127-workshop-section-r02-1.md` (R02.1 — Protótipo 01 aprovado pelo utilizador).
> **Data:** 2026-09-06
> **Branch de planeamento:** `codex/plan-workshop-showcase`
> **Branch prevista para execução:** `codex/feature-workshop-showcase`
> **Execução do produto:** autorizada pelo pedido «Comece a implementar o plano. Depois abre o servidor para ver a mudança».
> **Revisão R1 — reprodução automática:** IMPLEMENTADA — EM VALIDAÇÃO; aprovada em 2026-09-07 pelo pedido «Aprovo a revisão». As regras R1 de reprodução prevalecem sobre a navegação exclusivamente manual da versão original.
> **Revisão R2 — reprodução contínua perceptível:** PROPOSTA — aguarda aprovação. Esta revisão responde ao relato «Os slides continua estático quando eu abri no meu browser» e, depois de aprovada e validada, será integrada em `main` conforme pedido do utilizador.

## Objectivo

Refinar exclusivamente a secção Architecture / Urban Planning / Research imediatamente depois do hero. Preservar a composição editorial e transformá-la numa apresentação de áreas controlada pelo visitante, com imagem nítida, navegação inequívoca e boa experiência nos dois idiomas e nos três formatos de ecrã.

O briefing e a imagem entregues pelo utilizador orientam esta proposta. A imagem é uma referência de composição, não prova do estado actual do navegador nem autorização para adoptar textos ou fotografias novos. O plano foi apresentado antes da implementação e posteriormente aprovado pelo pedido de execução acima registado.

## Fontes de verdade

- [Regras dos agentes](../AGENTS.md), [mapa do projecto](../PROJECT_MAP.md) e [processo de planos](README.md).
- [Sistema de design](../docs/DESIGN_SYSTEM.md), [playbook](../docs/OA_Design_Mastery_Playbook.md) e [estudo O+A](../docs/DESIGN_STUDY.md).
- [Conteúdo](../docs/CONTENT_GUIDE.md) e [qualidade](../docs/QUALITY.md).
- Componente actual: [WorkshopSection.tsx](../src/components/home/WorkshopSection.tsx).

## Diagnóstico da implementação

A análise desta fase baseia-se no código e na referência visual recebida. Medições de contraste, capturas do site em execução e comportamento real em dispositivos ficam para a primeira etapa da execução; não se afirma que já foram testados.

| Evidência no código | Consequência | Alteração proposta |
|---|---|---|
| `Home.tsx` monta `HeroSection`, depois `WorkshopSection` | O alvo está claramente separado da apresentação institucional | Preservar a composição de Home e todo o hero |
| Intervalos de 16 ms, progresso de 0,35 e estados `FILLING`/`RESETTING` | Avanço nominal em cerca de 4,6 s; selecção manual volta a iniciar o temporizador | Eliminar autoplay, progresso temporal e ciclo de retorno |
| Fotografia principal com `blur-[4px]` e opacidade animada para 0,32 | Conteúdo fotográfico perde nitidez e presença | Remover desfocagem e recuperar opacidade da fotografia |
| Frame com sombra ampla, `backdrop-blur-sm` e várias sobreposições | Tratamentos competem com a fotografia e divergem do briefing | Frame fino, rectilíneo e estável, com dois detalhes de canto |
| Imagem principal em `hidden ... md:flex` | A fotografia desaparece abaixo de 768 px | Apresentar a imagem também no telemóvel |
| Opacidade de 0,58 no botão inactivo combinada com texto a 50% | A navegação fica visualmente apagada; exige medição de contraste | Definir cores de texto legíveis sem reduzir a opacidade do botão inteiro |
| Botões inferiores sem semântica de tabs nem estado ARIA seleccionado | A selecção não está explicitamente comunicada às tecnologias de apoio | Implementar tabs com foco e activação por teclado |
| Transições de texto em `mode="wait"` e fundo com duração de 2,5 s | Trocas prolongadas, com risco de atraso perceptível e desfasamento | Transições curtas, coordenadas e interrompíveis |
| Fontes herdadas de `src/index.css`; descrição sem `font-serif` | A referência tem aparência serifada no corpo, mas a implementação usa Outfit | Preservar a fonte actualmente usada nesta secção |
| Traduções, imagens e destinos em estruturas separadas, ligadas parcialmente por índice | Reordenar conteúdos pode associar imagem errada a uma área | Relacionar conteúdos por identificador estável |
| Imagens remotas Unsplash com largura pedida de 2400 px | Dimensão não adaptada ao ecrã; não há política explícita de antecipação | Definir variantes responsivas e antecipação limitada |

Os destinos existentes são as secções `architecture`, `urbanism` e `research` de Home. A aplicação usa HashRouter; as ligações `#architecture` actuais requerem verificação para não serem interpretadas como rotas. Se necessário, a correcção será local ao CTA desta secção.

## Direcção visual

Preservar fundo charcoal, branco, terracota, fontes e símbolo «+». A ordem visual será título → fotografia → descrição → CTA → navegação → atmosfera.

- **Fundo:** fotografia da área com baixa opacidade, contraste reduzido, desfocagem ligeira e sobreposição escura uniforme. Retirar os brilhos radiais decorativos. Não animar o filtro de blur.
- **Fotografia:** nítida, sem blur nem véu escuro pesado. Usar o mesmo motivo do fundo é aceitável porque o tratamento distingue atmosfera e conteúdo.
- **Frame:** borda fina e dois cantos geométricos discretos em terracota. Estrutura permanece montada enquanto muda apenas a fotografia. Sem vidro, sombra pesada ou cantos arredondados.
- **Título:** Outfit com escala de display e «+» em terracota. Escala fluida e quebra por palavras para “Planeamento Urbano”; não usar contagem de caracteres como única regra de tamanho.
- **Descrição:** preservar texto curto e família actual; largura aproximada de 38–45 caracteres, entrelinha confortável e contraste medido.
- **Marcador superior:** número, linha e label; evitar truncar o nome da área.
- **CTA:** outline compacto, acção explícita e seta existente. Hover subtil, active imediato e foco distinguível do hover.
- **Navegação:** três entradas editoriais com número, «+», nome e linha. Só a seleccionada recebe a linha terracota completa; não há preenchimento por tempo nem indicação de etapas já visitadas.

Os microtextos decorativos dos cantos da imagem de referência não serão acrescentados: não existem nesta secção e o briefing exclui novos blocos de conteúdo.

## Arquitectura mínima

Reutilizar React, Framer Motion, i18next, Lucide e Tailwind já instalados. Não adicionar dependências nem criar um carrossel genérico.

| Unidade | Responsabilidade |
|---|---|
| `WorkshopSection.tsx` existente | Secção `#workshop`, estado de área activa, composição, transições e CTA |
| `WorkshopTabs.tsx` novo | Lista reutilizada para as três áreas; selecção, foco, teclado e indicador |
| `workshop.css` novo | Apenas regras locais de layout, frame, estados e movimento reduzido, sob prefixo `.workshop-` |

Manter no módulo da secção um modelo pequeno e tipado, sem novo serviço ou camada de dados genérica: `WorkshopAreaId = 'architecture' | 'urbanism' | 'research'` e registos com `id`, `order`, `targetId`, imagem, variantes e posição de recorte. Associar os textos existentes em `workshop.slides` pelo `id`, não pelo índice. Acrescentar apenas chaves necessárias para alternativas das imagens, nomes acessíveis e erro de imagem.

O estado funcional principal será `activeAreaId`, inicialmente `architecture`. Foco das tabs e estado de carregamento das imagens têm responsabilidades separadas. Trocar PT/EN preserva a área escolhida. A mesma estrutura apresenta todas as áreas; não haverá três implementações independentes.

## Interacções e acessibilidade

1. Clique ou toque numa tab selecciona a área. Voltar a seleccionar a área actual não reinicia animações nem provoca pedidos desnecessários.
2. Usar `tablist`, `tab`, `tabpanel`, identificadores estáveis, `aria-selected`, `aria-controls` e `aria-labelledby` coerentes. Só o painel activo pode receber foco; cópias visuais de saída ficam ocultas às tecnologias de apoio.
3. Activação manual por teclado: setas esquerda/direita deslocam foco; Home/End vão à primeira/última tab; Enter/Espaço activam. Setas verticais continuam disponíveis para scroll. Um único ponto de entrada na lista através de Tab.
4. A navegação mantém-se visualmente em baixo. Definir uma ordem de foco que permita ir da tab ao painel activo/CTA e sair da secção, sem ciclos. Validar a relação entre ordem DOM e apresentação antes de fechar a implementação.
5. Foco visível com contraste verificado. Estado seleccionado expresso também pela linha e peso/contraste do texto, sem depender só da terracota. Áreas de toque preferencialmente com pelo menos 44 px de altura.
6. CTA conduz à secção correspondente na mesma página. Preservar os destinos e tratar o scroll localmente quando necessário, respeitando movimento reduzido, cabeçalho e foco do destino. Não criar páginas novas nem alterar o router global.
7. Background, símbolo decorativo e linhas sem anúncio redundante; imagem principal com descrição factual traduzida. Hierarquia de títulos coerente, sem novo h1.
8. A fotografia não terá cursor nem animação que sugira clique se não tiver acção. Evitar zoom de hover puramente ornamental.

A activação manual segue o [padrão de tabs da W3C](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), adequado aqui porque a fotografia pode ainda estar a carregar. O padrão é uma orientação de implementação; a conformidade depende das verificações reais.

## Movimento e estados de imagem

- Feedback de CTA e tabs: aproximadamente 150–200 ms; deslocação da seta até 4 px.
- Título, descrição e label: opacidade e deslocamento vertical até 8 px, aproximadamente 180–250 ms.
- Fotografia: crossfade de aproximadamente 300–450 ms, em camadas sobrepostas dentro do mesmo frame. Fundo acompanha a mudança sem apagar toda a secção.
- Indicador activo: transição curta de opacidade ou escala horizontal; representa selecção, nunca duração.
- Usar curvas suaves já adoptadas no projecto; sem springs, parallax ou zoom exagerado.
- Interacções rápidas privilegiam a última selecção. Não enfileirar animações nem permitir que uma imagem de pedido anterior substitua a mais recente.
- `prefers-reduced-motion`: eliminar deslocamentos, scroll suave e animação do indicador; conteúdo e foco actualizam-se imediatamente.
- Durante carregamento real, manter o espaço da imagem reservado. O texto, CTA e tabs respondem sem esperar pela rede. Não manter uma fotografia identificável da área anterior debaixo do novo título durante uma espera prolongada.
- Em falha, mostrar uma superfície sóbria com mensagem curta traduzida e possibilidade de nova tentativa. Evitar ícone de imagem quebrada; texto e CTA continuam utilizáveis.

## Responsividade

| Ecrã | Composição proposta |
|---|---|
| Desktop, a partir de 1024 px | Duas colunas; texto à esquerda, fotografia com cerca de metade da largura útil à direita; três tabs distribuídas na base |
| Tablet, 768–1023 px | Composição vertical espaçada para acomodar os títulos PT/EN; fotografia larga e tabs em três colunas quando os nomes couberem |
| Mobile, abaixo de 768 px | Label → título → descrição → fotografia → CTA → navegação; uma coluna, altura natural e fotografia sempre presente |

No mobile, tabs numa faixa horizontal com deslocação nativa apenas dentro da navegação, nomes completos e indicação visual de continuação. Trazer a tab focada para a área visível sem deslocar toda a página. Se a ampliação exigir, permitir reorganização para evitar perda de conteúdo.

Reservar proporção da imagem — ponto de partida 4:3 — e espaço de texto adequado ao maior conteúdo aprovado de cada formato. Evitar alturas fixas que cortem o conteúdo e evitar mudanças bruscas da altura entre áreas. Testar também largura de 320 CSS px, ampliação de texto e os dois idiomas.

## Imagens e desempenho

Preservar inicialmente as três fotografias actualmente utilizadas. Os ficheiros locais `public/images/architecture.png`, `urbanism.png` e `research.png` existem, mas não foi comprovado que correspondem às fotografias dos slides; não os substituir automaticamente.

- Usar dimensões responsivas nos endereços actuais, `srcset`/`sizes` e descodificação assíncrona.
- Iniciar o carregamento da primeira imagem quando a secção se aproxima da área visível, para não disputar prioridade com o hero.
- Antecipar no máximo uma área adicional através de intenção — foco ou hover — depois da imagem activa. Clique/toque inicia imediatamente o recurso necessário.
- Reutilizar um recurso já carregado entre fundo e frame sempre que possível, sem pedir duas versões pesadas de 2400 px.
- Reservar dimensões antes do carregamento; evitar layout shift.
- Recursos finais locais exigem verificação de correspondência, origem e direitos. Uma migração de imagens não é requisito para concluir este refinamento; não descarregar ou substituir fotografias arbitrariamente.
- A remoção do temporizador elimina actualizações React contínuas de progresso. Verificar que não restam temporizadores de autoplay nem pedidos repetidos em repouso.

## Ficheiros previstos

**Implementação:** `src/components/home/WorkshopSection.tsx`, `src/components/home/WorkshopTabs.tsx`, `src/components/home/workshop.css`, apenas as chaves `workshop` necessárias em `src/locales/pt.ts` e `src/locales/en.ts`.

**Documentação:** este plano, `plans/README.md` e `PROJECT_MAP.md` para registar as novas responsabilidades. O mapa deverá identificar WorkshopSection como apresentação interactiva de áreas de actuação.

**Consulta e verificação, sem alteração prevista:** `src/pages/Home.tsx`, `src/components/home/HeroSection.tsx`, `src/index.css`, `src/App.tsx`, `src/main.tsx`, secções de destino e manifestos.

## Implementação incremental após aprovação

1. **Registar a base:** criar a branch de execução; confirmar estado Git e capturar hero e workshop a 375, 768 e 1440 px, em PT/EN. Verificar as ligações existentes e registar eventuais limitações anteriores.
2. **Controlo manual e dados:** substituir o temporizador por selecção estável por id; implementar tabs, semântica, teclado e destinos internos. Validar o comportamento antes de alterar o desenho.
3. **Composição e fotografia:** separar atmosfera/fotografia, simplificar frame, corrigir contraste, escala e mobile com estilos locais. Manter as fontes.
4. **Transições e recursos:** acrescentar crossfade, estados reais de carregamento/erro, antecipação limitada e movimento reduzido. Testar cliques rápidos e ligações lentas.
5. **Validação:** lint, build, paridade das chaves alteradas, teclado, contraste medido, ampliação, navegação e comparação visual com a base e referência.
6. **Entrega:** actualizar plano e mapa; apresentar diferenças e verificações para aceitação. Merge, push e publicação exigem pedido posterior.

## Critérios de aceitação

- Hero, fontes globais e restantes secções preservados; diferenças limitadas aos ficheiros previstos.
- Nenhuma mudança automática de área, incluindo após clique, foco, scroll ou alteração de idioma.
- Fotografia principal nítida e visível nos três formatos; fundo perceptivelmente secundário.
- Frame permanece estável durante a troca; nenhuma espera artificial.
- Todas as áreas seleccionáveis com rato, toque e teclado; estado activo inequívoco e foco visível.
- Labels e títulos completos em PT/EN, sem cortes ou deslocação horizontal na página.
- CTA de cada área chega ao destino correcto sem rota inválida ou página vazia.
- Movimento reduzido funcional; trocas rápidas não deixam texto e imagem de áreas diferentes.
- Falha de imagem não impede leitura, selecção ou navegação.
- `npm run lint`, `npm run build` e `git diff --check` concluídos; avisos registados.
- Testes visuais a 375, 768 e 1440 px, mais reflow a 320 CSS px, contraste e teclado verificados.

## Fora do âmbito

Hero inicial, logótipo, fundadores, navegação global, equipa, Journal, catálogo de projectos, fornecedor de mapas, redesign global, Atlas Editorial anteriormente descartado, back-end, novas bibliotecas, novas famílias tipográficas, novos slogans, fotografias geradas ou alterações de conteúdo promocional.

## Estado desta entrega

Implementação realizada em `codex/feature-workshop-showcase`, sem alterações em `main`, merge, push ou publicação.

### Alterações realizadas

- Substituído autoplay por selecção manual tipada por identificador.
- Criados `WorkshopTabs.tsx` e `workshop.css`; responsabilidades registadas no mapa.
- Separadas fotografia nítida e atmosfera; frame estável e imagem visível no telemóvel.
- Implementados teclado, foco, carregamento, erro e nova tentativa, sem espera artificial.
- CTA com scroll e foco locais, margem para cabeçalho e compatibilidade com ligações directas `#/#research` e equivalentes; router global preservado.
- Adicionadas apenas as traduções acessíveis e os estados necessários em `workshop`; textos promocionais, fontes, hero, mapas e restantes secções preservados.

### Verificações realizadas em 2026-09-07

- `npm run lint` e `npm run build`: sem erros. Mantêm-se os avisos de Browserslist desactualizado e bloco JavaScript acima de 500 kB.
- `git diff --check`: sem erros de whitespace; ficheiros de código novos verificados separadamente. Git avisa sobre normalização futura LF/CRLF.
- Paridade estrutural de `workshop`: 23 chaves finais coincidentes em PT/EN.
- Navegador integrado: três áreas nos dois idiomas a 320, 375, 768 e 1440 CSS px; títulos dentro dos respectivos limites e sem overflow horizontal da página. Capturas revistas nas larguras de telemóvel, tablet e computador.
- Altura do frame constante entre áreas em cada largura; variação de cerca de 1 px no painel PT a 320 px. Tabs com 68 px de altura e CTA com pelo menos 52 px.
- Home/End e setas deslocam apenas o foco; Enter/Espaço activam; Tab conduz ao painel e depois ao CTA. Foco de 2 px verificado, incluindo a última tab na faixa móvel.
- Mudança PT/EN preserva a área seleccionada. Cliques rápidos terminam com texto e fotografia da última área. As três fotografias carregaram; fotografia principal com `filter: none` e fonte Outfit confirmados.
- CTAs das três áreas chegam ao título correcto; foco no destino e margem de cerca de 24 px após o cabeçalho. Ligação directa de Investigação verificada numa nova tab.
- Consola sem erros ou avisos capturados durante os percursos da secção.
- Contraste calculado a partir dos tokens e do limite superior da composição do fundo: texto cinzento cerca de 8,26:1, branco 15,52:1, terracota 3,17:1. Terracota reservada a texto grande, símbolos e decoração; números pequenos das tabs activos usam branco. Atmosfera limitada no contentor a 10%, inclusive durante sobreposição de imagens.

### Limitações e validação complementar

- Não foi recolhida a matriz completa de capturas anteriores à alteração; a comparação de base dispõe do código e de uma captura desktop, não de seis capturas PT/EN.
- Os estados de falha/nova tentativa e movimento reduzido estão implementados e revistos no código, mas não foram simulados no navegador. Falta testar rede lenta/falha forçada, activação de movimento reduzido no sistema, ampliação de texto e leitor de ecrã antes de encerrar a validação.
- Verificação executada no navegador integrado por indisponibilidade de `agent-browser`; não representa testes em dispositivos físicos nem auditoria integral de acessibilidade.
- Fotografias mantidas nos endereços remotos existentes; disponibilidade externa continua a ser um risco conhecido.
- Servidor de desenvolvimento disponibilizado para revisão; aceitação visual e qualquer integração/publicação dependem de pedido posterior.

## Revisão R1 — Reprodução automática dos slides

### Pedido e precedência

O utilizador gostou do resultado visual e pediu que o slide tenha reprodução automática. Esta revisão altera exclusivamente o comportamento da secção de áreas de actuação, não o hero nem o carrossel de projectos.

Esta revisão substitui as disposições anteriores que proibiam autoplay e que limitavam a antecipação de imagens exclusivamente a hover/foco. As restantes decisões do plano 125 mantêm-se.

### Comportamento proposto

1. Iniciar automaticamente quando a secção estiver visível, com **7 segundos por área**, em ciclo Arquitectura → Planeamento Urbano → Investigação → Arquitectura. O intervalo é uma proposta ajustável, não um requisito de acessibilidade.
2. Manter as transições actuais, fontes, imagens, frame e composição. Não acrescentar barras de contagem nem animações por fotograma.
3. Acrescentar um controlo discreto **Pausar / Reproduzir**, junto da navegação inferior, visível também em mobile e fora da faixa horizontal das tabs. Usar ícones existentes, texto PT/EN e alvo mínimo de 44 × 44 px. Será o primeiro controlo da secção na ordem de teclado.
4. Pausar temporariamente durante hover de rato sobre o painel ou tabs; ao sair, iniciar um período completo de 7 segundos, se não houver outra causa de pausa. O controlo de reprodução não integra essa zona de hover, para permitir accionar Play sem bloqueio imediato.
5. Foco de teclado no conteúdo/tabs ou selecção manual de uma área pausa a reprodução até o visitante escolher Reproduzir. Não retomar automaticamente ao perder foco. A pausa explícita mantém-se enquanto o componente permanecer montado.
6. O botão Reproduzir permite retomar a partir da área actual, mesmo mantendo foco no próprio botão. Uma nova entrada de foco no painel/tabs volta a pausar. Nenhuma troca automática move foco ou desloca a página.
7. Suspender o temporizador quando a secção sair da área visível ou a tab do navegador ficar oculta. Ao regressar, começar um intervalo completo, sem compensar tempo acumulado nem percorrer slides em rajada. Uma pausa manual nunca é anulada por este regresso.
8. Com movimento reduzido, iniciar pausado. Permitir reprodução apenas por escolha explícita, mantendo as transições sem movimento; uma mudança posterior da preferência para movimento reduzido volta a pausar.
9. Mudança PT/EN preserva a área e a intenção de reprodução/pausa; reinicia apenas o tempo de leitura quando estiver a reproduzir.

### Imagens, temporizador e acessibilidade

- Usar um único timeout cancelável, sem intervalos de 16 ms nem actualizações contínuas de progresso. Limpar timeout e listeners ao desmontar e sempre que o estado de reprodução mudar.
- Distinguir intenção de reprodução, suspensões temporárias e estado real da imagem; não criar temporizadores concorrentes para cada tab.
- Contar os 7 segundos depois de a fotografia actual carregar ou apresentar erro, para não passar por um slide antes de este poder ser lido. Durante espera de rede, manter tabs, CTA e pausa utilizáveis.
- Antecipar no máximo uma fotografia seguinte quando a actual estiver pronta e a reprodução permitida. Reutilizar imagens carregadas; não repetir pedidos falhados automaticamente. Uma falha tem mensagem e nova tentativa existentes; a rotação pode continuar após os 7 segundos desse estado.
- Actualizar o ponto de entrada das tabs para a área activa quando o foco estiver fora da lista: actualmente `focusedId` só acompanha foco/blur manual e não basta para avanço automático.
- Preservar setas, Home/End, Enter/Espaço, relações tab/painel e foco visível. Não anunciar automaticamente cada mudança numa região live; manter informação acessível quando a pessoa navega manualmente.

### Ficheiros e execução incremental

Continuar em `codex/feature-workshop-showcase`, como revisão do mesmo plano, preservando todas as alterações locais e sem trabalhar em `main`.

1. Após aprovação, acrescentar estado e ciclo de reprodução em `src/components/home/WorkshopSection.tsx`.
2. Ajustar sincronização de foco em `src/components/home/WorkshopTabs.tsx` e o novo controlo em `src/components/home/workshop.css`.
3. Acrescentar rótulos apenas em `src/locales/pt.ts` e `src/locales/en.ts`.
4. Actualizar a responsabilidade da secção no `PROJECT_MAP.md` e o registo deste plano.
5. Validar e apresentar novamente no servidor local. Não criar dependências, back-end, ficheiros de configuração, commit, merge, push ou publicação neste âmbito.

### Critérios de aceitação e testes

- Observar pelo menos um ciclo completo de três áreas e confirmar intervalo de 7 segundos por estado apresentado, sem saltos nem temporizadores duplicados.
- Verificar Pausar/Reproduzir, hover, foco, selecção manual, idioma, saída/regresso ao viewport e ocultação/regresso à tab.
- Confirmar que a pausa explícita persiste, o CTA não muda sob foco e a reprodução nunca rouba foco nem provoca scroll vertical.
- Testar movimento reduzido, falha/nova tentativa, rede lenta e cliques rápidos; registar separadamente os cenários que não for possível simular.
- Verificar PT/EN a 375, 768 e 1440 px, reflow a 320 px e acessibilidade do controlo fora da faixa de tabs.
- Executar lint, build, paridade das traduções e verificação de diferenças. Preservar o aspecto visual já aceite.

### Aprovação registada

A revisão foi aprovada pelo pedido «Aprovo a revisão» e implementada na branch `codex/feature-workshop-showcase`, sem trabalhar em `main`.

### Implementação R1 realizada

- Acrescentado ciclo Arquitectura → Planeamento Urbano → Investigação com um único timeout cancelável de 7 segundos.
- A reprodução só decorre quando foi pedida, a página está visível, a secção está suficientemente no viewport, não existe hover e a imagem activa já terminou o carregamento ou apresentou erro.
- Acrescentado controlo Pausar/Reproduzir, traduzido, com ícones existentes, `aria-controls` e alvo mínimo de 44 × 44 px, fora da faixa deslocável das tabs.
- Interacção manual e foco no painel/tabs passam a pausa explícita; hover e saída do viewport suspendem o timeout sem perder a intenção de reprodução.
- A fotografia seguinte é antecipada apenas quando a actual está pronta e a rotação está permitida.
- As tabs actualizam o respectivo ponto de entrada quando a área activa muda automaticamente e o foco se encontra fora da lista.
- A preferência inicial por movimento reduzido inicia a secção pausada; uma mudança posterior para essa preferência também pausa.
- Mudança PT/EN preserva a área e a intenção de reprodução, actualizando imediatamente o controlo.
- Actualizados os textos PT/EN e a responsabilidade da secção em `PROJECT_MAP.md`; não foram acrescentados dependências, back-end ou configurações.

### Verificações R1 realizadas em 2026-09-09

- `npm run lint`, `npm run build`, paridade estrutural de `workshop` em PT/EN e `git diff --check`: concluídos sem erros. Mantêm-se apenas os avisos já conhecidos de Browserslist desactualizado, bloco JavaScript acima de 500 kB e futura normalização LF/CRLF pelo Git.
- Observado um ciclo completo e contínuo no navegador, mantendo a ordem prevista. As mudanças posteriores ocorreram aproximadamente a cada 7 segundos, sem avanço em rajada.
- Pausa explícita permaneceu estável durante mais de um intervalo; Reproduzir retomou a partir da área actual e o avanço não moveu o scroll nem roubou o foco do controlo.
- Foco no painel/tabs e selecção manual pausaram a reprodução. A área activa permaneceu estável durante a leitura.
- Fora da área útil do viewport, a selecção permaneceu estável durante mais de 7 segundos; ao regressar e retomar, iniciou-se um período completo antes da área seguinte.
- A troca entre inglês e português preservou Investigação e a intenção de reprodução. Foram confirmados `Pause slideshow`/`Play slideshow` e `Pausar slides`/`Reproduzir slides`, bem como `lang="pt"`.
- A estrutura `workshop` mantém paridade entre PT/EN; o controlo tem semântica acessível e não integra a faixa horizontal das tabs.
- Pré-visualização estreita a 468 CSS px: fotografia, CTA, tabs e controlo permanecem utilizáveis, sem overflow horizontal da página nem sobreposição. A matriz anterior a 320, 375, 768 e 1440 CSS px continua válida para a composição base; falta repetir todas essas larguras num ambiente que permita redimensionamento depois da R1.
- Consola da tab nova sem erros nem avisos da aplicação; apenas mensagens informativas do Vite, React e i18next em desenvolvimento.

### Limitações específicas da R1

- O navegador integrado mantém `document.hidden === false` mesmo quando outra tab interna é seleccionada; o listener de `visibilitychange` foi revisto no código, mas ocultação/regresso real da tab continua por simular.
- A ferramenta de pré-visualização não permite alterar a preferência de movimento do sistema. O arranque pausado e a mudança dinâmica estão implementados, mas não foram simulados.
- A acção disponível para posicionar o ponteiro também atribui foco ao painel; por isso, pausa por hover isolado não foi medida separadamente da pausa por foco. O cancelamento e reinício do timeout por `hovered` foram revistos no código.
- Rede lenta e falha/nova tentativa mantêm a cobertura de código e as limitações já registadas na implementação base; continuam por simular no navegador.

## Revisão R2 — Reprodução contínua perceptível

### Diagnóstico reproduzido em 2026-09-09

- Servidor e consola do Edge sem erros ou avisos da aplicação.
- No navegador do utilizador, com a secção 86,9% visível, imagem pronta, `document.hidden === false`, movimento reduzido desligado, foco no `body` e cursor fora do painel, o estado avançou de Planeamento Urbano para Investigação em 7,6 segundos sem mover scroll ou foco.
- O botão indicava reprodução activa. Assim, o timeout funciona; a apresentação pode parecer estática quando uma suspensão invisível permanece activa.
- A principal causa é o hover aprovado na R1: em computador, o painel ocupa grande parte da secção e o cursor pode ficar sobre ele durante a leitura, cancelando o timeout indefinidamente. Foco ou selecção manual também convertem actualmente a reprodução em pausa persistente.

### Alteração proposta

1. Tornar o estado inequívoco: quando o controlo mostra **Pausar**, a apresentação avança enquanto a secção estiver visível e a página activa, independentemente da posição do cursor.
2. Retirar a suspensão por hover e a pausa implícita por foco. A forma intencional de parar será o controlo **Pausar**, sempre visível e acessível.
3. Uma selecção manual muda imediatamente de área e, se a reprodução estiver activa, reinicia um período completo de 7 segundos sem a desligar. Se o utilizador já tiver escolhido Pausar, a selecção preserva essa pausa.
4. Manter as protecções não ambíguas: suspender fora do viewport ou quando a tab do navegador estiver oculta; iniciar pausado com movimento reduzido; aguardar apenas enquanto a imagem estiver efectivamente a carregar.
5. Preservar semântica de tabs, foco, controlo por teclado, PT/EN, fotografias, composição e ausência de movimento do scroll/foco durante trocas automáticas.
6. Não acrescentar barra de progresso, dependências, back-end ou alterações fora desta secção.

### Ficheiros e validação previstos

- Alterar somente `src/components/home/WorkshopSection.tsx` e este registo; actualizar `PROJECT_MAP.md` apenas se a descrição da responsabilidade deixar de ser exacta.
- Testar no Edge do utilizador: abertura/reload, cursor sobre o painel por mais de 7 segundos, selecção manual seguida de avanço, Pausar/Reproduzir, saída/regresso ao viewport e PT/EN.
- Repetir `npm run lint`, `npm run build`, paridade PT/EN e `git diff --check`.
- Depois da validação, criar commit atómico na branch `codex/feature-workshop-showcase`, integrar essa branch em `main` sem reescrever histórico e não eliminar a branch.
- O pedido deste turno autoriza o merge depois da correcção; não autoriza force push nem publicação manual. O workflow existente poderá publicar automaticamente o novo `main` quando houver push posterior.

### Critérios de aceitação R2

- A apresentação avança após 7 segundos mesmo com o cursor parado sobre o painel ou as tabs.
- Clique numa tab não deixa a apresentação permanentemente estática quando o controlo indica **Pausar**.
- Só o controlo Pausar, movimento reduzido, tab oculta, secção fora do viewport ou espera real de imagem podem impedir o avanço.
- O controlo representa sempre a intenção efectiva do utilizador; nenhuma suspensão invisível contradiz o respectivo texto.
- Merge em `main` apenas depois de todos os testes concluírem sem erros.

### Aprovação necessária

`APROVADO: plano 125, revisão R2 — reprodução contínua perceptível e merge em main`.
