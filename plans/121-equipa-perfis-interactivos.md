# Plano 121 — Our Team: hierarquia espacial e perfis interactivos

> **Estado:** EM VALIDAÇÃO — implementação concluída; ensaios manuais e aceitação pendentes.
> **Data:** 2026-09-04
> **Base inspeccionada:** `codex/feature-team-organogram`, commit `6157029`.
> **Ramo documental:** `codex/plan-team-profiles`.
> **Ramo previsto para execução:** `codex/feature-team-profiles`, derivado desta base.
> **Entrega actual:** implementação no ramo `codex/feature-team-profiles`.

## 1. Objectivo e fronteira

Evoluir a secção existente para uma apresentação de equipa claramente hierárquica, humana e interactiva: liderança conjunta destacada, equipa multidisciplinar em composição leve e perfis consultáveis num painel. Manter a identidade escura e arquitectónica de `main`, sem importar o redesenho Atlas.

Este plano sucede à implementação do Plano 120. A sua aprovação autorizará, apenas nesta secção, as interacções, avatares e campos de fotografia/biografia que o plano anterior excluía. Não torna o Plano 120 canónico nem autoriza integração em `main`.

## 2. Diagnóstico da implementação actual

Análise baseada nos ficheiros actuais; não representa uma nova campanha de testes no navegador.

| Local | Evidência | Consequência |
|---|---|---|
| `TeamSection.tsx` | um único componente filtra `TEAM_MEMBERS` pelos níveis `leadership` e `practice` | a composição e a apresentação individual estão acopladas |
| Cabeçalho e listas | borda inferior do cabeçalho, borda superior de cada lista e borda inferior em cada pessoa | as linhas delimitam quase todas as células, criando aparência de tabela |
| Conectores | eixo central entre grupos e traço terracota em cada membro | excesso de marcas, sem comunicar uma relação adicional real |
| Hierarquia | duas colunas na direcção e três na equipa a partir de `md`; nomes da direcção maiores | a intenção existe, mas depende sobretudo da escala tipográfica |
| Interacção | nomes em `h4` e cargos em parágrafos, sem botões ou estado | não existe abertura de perfil nem indicação de interactividade |
| Dados | `id`, `name`, `level`, `role`; ordem definida pelo array | fonte pequena, tipada e apropriada para extensão local |
| Traduções | cargos em `team.roles`, chaves verificadas pelos tipos PT/EN | reutilizar; não voltar a colocar cargos literais em componentes |
| Integração | `Home.tsx` coloca a equipa depois de `NewsSection` e antes de Contactos | preservar sem reorganizar a página |
| Estilos | classes Tailwind no componente; tokens e `container-custom` em `src/index.css` | não existe necessidade de redesenhar o CSS global |

### O que preservar

- os oito membros e cargos já confirmados;
- Osvaldo Luís e Artur Simão em liderança conjunta, sem superioridade entre eles;
- identificadores estáveis, ordem editorial e traduções;
- título da secção, listas nomeadas e sequência de leitura;
- Administração omitida até existir uma pessoa confirmada;
- fundo `#111111`, superfície secundária `#222222`, terracota `#A65D4A`, Outfit e uso pontual de Playfair Display;
- largura editorial máxima de 1100 px e margens responsivas existentes.

### Reutilização de padrões existentes

`CategoryMapSection.tsx` contém um diálogo de projecto embutido, específico desse conteúdo, com sombras e arredondamento que não servem esta proposta. Não existe ali um componente de painel genérico a importar. Reutilizar convenções de fecho e ícones existentes, não copiar o diálogo inteiro nem refactorar mapas para criar uma abstracção global.

React, React DOM, Framer Motion e Lucide já estão instalados. Não se propõe biblioteca de organogramas, avatares, drawers ou UI adicional.

## 3. Direcção visual

### Liderança conjunta

Dois perfis com igual largura, proporção de retrato e escala de nome. Mais espaço acima e abaixo do que na equipa, com nome destacado, cargo visível e indicação persistente «Ver perfil». A liderança deve continuar evidente mesmo em preto e branco e sem conectores.

### Equipa multidisciplinar

Perfis compactos, sem caixas preenchidas ou bordas em todos os lados. Avatar, nome, cargo e categoria organizam a leitura por proximidade. A grelha serve o alinhamento, não a aparência de tabela. Todos os nomes e cargos permanecem visíveis sem abrir um perfil.

### Relações organizacionais

Manter apenas um pequeno conector central entre liderança e equipa no computador/tablet, opcionalmente terminado por uma curta ramificação. Retirar as linhas horizontais repetidas e os traços individuais. Conectores decorativos com `aria-hidden`; títulos dos grupos comunicam a mesma relação de forma textual.

Não desenhar ligações pessoa-a-pessoa ou departamentos subordinados sem informação organizacional confirmada.

### Limites visuais

Sem glassmorphism, gradientes decorativos, sombras fortes, cores por departamento, cartões volumosos ou decoração de dashboard. Contorno visível reservado sobretudo ao foco. Terracota como pormenor, ícone e estado, não como cor obrigatória de texto pequeno sem validar contraste.

## 4. Modelo de dados

Evoluir `src/data/team.ts`, sem criar uma segunda fonte de membros.

| Campo | Contrato proposto | Utilização |
|---|---|---|
| `id` | identificador estável actual | chave React e selecção do perfil |
| `name` | nome público confirmado | nome visível e iniciais |
| `role` | chave tipada actual em `team.roles` | cargo localizado |
| `category` | identificador de área profissional | etiqueta localizada, não relação de reporte |
| `image` | objecto local `{ src, objectPosition? }` ou `null` | fotografia futura e enquadramento |
| `bio` | chave de biografia em `src/locales/` ou `null` | texto editorial confirmado, sem HTML arbitrário |
| `leadership` | booleano | distingue liderança de equipa |

Substituir `level` por `leadership`, em vez de manter dois campos que podem divergir. A ordem continua a ser a do array. Categorias e biografias não serão textos duplicados no componente.

Categorias iniciais propostas a partir dos cargos existentes:

- Osvaldo e Artur: arquitectura e urbanismo;
- Mivas, Maxime e Neide: arquitectura;
- Edson: construção;
- Letícia: geografia;
- Imran: tecnologias de informação e marketing.

São áreas profissionais de apresentação, não departamentos formais; não haverá filtros nesta fase.

Todos os registos começam com `image: null` e `bio: null`. Biografia ausente: omitir o bloco, sem inventar percurso ou apresentar «brevemente». O painel continua a mostrar nome, cargo, área e pertença à liderança/equipa. Este conteúdo inicial será deliberadamente curto até serem fornecidas biografias.

Validar identificadores únicos, nomes não vazios, categorias conhecidas, cargos PT/EN e eventuais chaves de biografia. Campos editoriais futuros só serão publicados após confirmação; a autorização anterior de nome/cargo não implica autorização de novas fotografias ou biografias.

## 5. Arquitectura de componentes

```text
TeamSection (existente)
├── grupo Direcção conjunta
│   └── TeamMember × 2, variant="leadership"
├── grupo Equipa multidisciplinar
│   └── TeamMember × 6, variant="standard"
└── TeamProfilePanel × 1

TeamMember e TeamProfilePanel
└── TeamAvatar
```

- **TeamSection:** preserva a integração, cria os dois grupos, guarda apenas `selectedMemberId: string | null` e a referência ao botão de origem. Deriva o membro seleccionado da fonte, sem copiar dados para estado.
- **TeamMember:** apresentação reutilizável para liderança/equipa. Nome e cargo semânticos; botão de perfil com nome acessível «Ver perfil de {name}», `aria-haspopup="dialog"` e ícone discreto. Evitar controlos aninhados e múltiplas paragens de Tab para a mesma acção.
- **TeamAvatar:** fotografia ou iniciais; proporções e tratamento visual comuns. Estado de erro de imagem local a este componente.
- **TeamProfilePanel:** um único painel para qualquer membro, responsável pelo ciclo acessível de abertura/fecho. Não criar um modal por pessoa.

Novos componentes permanecem em `src/components/home/`, junto de `TeamSection`. Não criar um design system genérico ou novas camadas de hooks, fontes ou serviços para oito registos locais.

## 6. Desktop, tablet e mobile

| Largura | Liderança | Equipa | Painel |
|---|---|---|---|
| Computador, ≥1024 px | dois perfis amplos lado a lado, avatar maior e mais espaço negativo | três colunas leves, duas filas; separação por espaço | drawer lateral direito, máximo aproximado de 480 px e altura útil completa |
| Tablet, 768–1023 px | dois perfis equivalentes, nome/cargo podem ocupar várias linhas | duas colunas para evitar compressão dos nomes e cargos PT | painel lateral até 480 px, sem ultrapassar o ecrã |
| Telemóvel, <768 px | perfis empilhados, primeiro grupo claramente identificado | lista vertical com avatar compacto e conteúdo à direita | painel de largura completa, sem arrasto obrigatório |

Usar os breakpoints existentes. No mobile não reduzir à escala a árvore desktop: remover conectores e preservar a ordem Direcção → Equipa. Sem carrossel ou deslocação horizontal.

Reservar proporções iguais entre fotografias e iniciais. Títulos longos devem quebrar por palavras, sem truncagem que esconda nomes ou cargos.

## 7. Estados e interacções

| Estado | Resposta visual | Comportamento |
|---|---|---|
| Normal | nome/cargo legíveis, avatar e indicação «Ver perfil» | descoberta possível sem hover |
| Hover, só em apontador compatível | leve alteração de contraste e ícone terracota | não revelar conteúdo essencial apenas aqui |
| Focus-visible | contorno de 2 px com afastamento, contraste verificado | indicação tão clara como hover; sem remover outline |
| Pressionado/toque | alteração discreta da superfície | activar ao clicar/tocar, sem zoom brusco |
| Perfil aberto | painel identificado pelo nome da pessoa | fundo não interactivo; foco dentro do painel |
| Imagem ausente/falhada | iniciais no mesmo espaço | nunca mostrar ícone de imagem quebrada |
| Bio ausente | bloco omitido | sem conteúdo fictício nem erro |

### Painel acessível

Preferência por `<dialog>` nativo com `showModal()`, apresentado como drawer. Montá-lo num portal de React DOM para evitar os contextos de transformação dos contentores animados da página.

- título ligado por `aria-labelledby`, acção «Fechar perfil» sempre acessível;
- foco inicial no botão Fechar; Tab/Shift+Tab contidos no diálogo;
- Escape, botão Fechar e clique deliberado no backdrop fecham; clicar dentro do conteúdo não fecha;
- conteúdo de fundo inerte enquanto o diálogo está aberto;
- bloquear scroll da página guardando o valor anterior e restaurando-o no fecho/desmontagem;
- scroll interno no painel, cabeçalho de fecho acessível, `100dvh` e safe areas;
- devolver foco ao botão que abriu o perfil; se deixar de existir, usar o título da secção como alternativa;
- sincronizar eventos `cancel`/`close` com o estado React; evitar chamadas duplicadas de `showModal()` em Strict Mode;
- ao mudar de idioma, o conteúdo acompanha a localização sem trocar a identidade seleccionada;
- sem nova rota, URL de perfil, menu anterior/seguinte ou gesto de arrasto obrigatório.

### Movimento

Transições de estado aproximadamente 150–200 ms; entrada/saída do painel 200–250 ms, sem mola, atraso sequencial ou parallax. Usar recursos já instalados ou estilos locais simples. Com `prefers-reduced-motion`, retirar deslocação e animação, preservando abertura, fecho e foco imediatos.

## 8. Fotografias hardcoded posteriores

1. receber fotografia aprovada, com autorização de publicação e enquadramento;
2. optimizar e guardar em `public/images/team/<id>.webp` ou formato local adequado;
3. preencher `image.src` no registo correspondente; ajustar `objectPosition` se necessário;
4. reutilizar automaticamente no perfil resumido e no painel;
5. testar corte, carregamento e retorno às iniciais em caso de erro.

Não reutilizar fotografias antigas apenas porque os ficheiros existem. Não gerar rostos, ir buscar retratos à Internet ou associar imagens por aproximação de nome.

O avatar normaliza `null`, caminho vazio ou só espaços antes de renderizar `img`, evitando `src=""`. Em erro, não repetir pedidos indefinidamente. Se a origem mudar, o estado de falha deve permitir uma nova tentativa.

Iniciais calculadas a partir da primeira e última palavra não vazia do nome: Osvaldo Luís → OL, Artur Simão → AS, Neide → N. Preservar caracteres Unicode; sem dados pessoais adicionais.

Imagem/avatar junto ao nome pode ser decorativo (`alt=""` ou `aria-hidden`) para não repetir a identificação. Usar proporção reservada, dimensões explícitas e carregamento diferido nas miniaturas abaixo da dobra. A inclusão de fotos não deve exigir alterações ao layout ou aos componentes.

## 9. Ficheiros previstos e limites

| Ficheiro | Acção |
|---|---|
| `src/components/home/TeamSection.tsx` | reduzir linhas, compor os grupos e gerir selecção |
| `src/components/home/TeamMember.tsx` | novo perfil resumido reutilizável |
| `src/components/home/TeamAvatar.tsx` | novo avatar/fotografia com fallback |
| `src/components/home/TeamProfilePanel.tsx` | novo painel único acessível |
| `src/data/team.ts` | estender contrato e migrar os oito registos |
| `src/locales/pt.ts`, `src/locales/en.ts` | categorias, microtexto, nomes acessíveis e futuras bios |
| `PROJECT_MAP.md` | registar as responsabilidades criadas durante execução |
| `docs/CONTENT_GUIDE.md` | breve regra de publicação de perfis e fotografias |
| `plans/121-equipa-perfis-interactivos.md` | aprovação, progresso e evidências |

`Home.tsx` deverá permanecer inalterado: já integra a secção na posição correcta. `src/index.css` serve de fonte de tokens, sem alterações globais previstas. Caso sejam necessários estilos de `::backdrop`, mantê-los estritamente limitados ao painel da equipa e registar o ficheiro na execução.

Não alterar mapas, Journal, cabeçalho, contactos, rotas, package manifests, alojamento, Atlas ou back-end. Não adicionar fotos/bios reais nesta implementação inicial, filtros, analytics, autenticação ou serviços externos.

## 10. Implementação incremental

1. **Aprovação e base:** obter aprovação deste Plano 121; criar o ramo de execução sobre o organograma existente. Não partir de `main` sem esta funcionalidade nem importar Atlas.
2. **Contrato e conteúdo:** estender o modelo, migrar os oito membros, criar categorias PT/EN; validar todos os registos. Inicializar imagem/bio vazias.
3. **Perfis resumidos:** extrair TeamMember e TeamAvatar; distinguir liderança por escala e espaço, retirar bordas repetidas; validar primeiro a composição estática.
4. **Painel:** introduzir um único diálogo, selecção por id, fecho, bloqueio/restauro do scroll e ciclo de foco; não activar botões de perfil sem painel funcional.
5. **Polimento:** hover/focus, movimento reduzido, imagens ausentes/falhadas e adaptação responsiva.
6. **Validação:** percorrer os oito perfis em PT/EN, teclado, toque e leitor de ecrã; testar 375, 768 e 1440 px, zoom a 200%, nomes e bios longos.
7. **Entrega:** actualizar mapa e plano, rever diff, apresentar evidências e limitações; aguardar aceitação antes de qualquer merge ou publicação.

Cada incremento deve permanecer verificável e limitado à equipa; não usar esta iniciativa para corrigir problemas globais já conhecidos.

## 11. Critérios de aceitação e testes

- oito pessoas e cargos preservados; duas lideranças equivalentes e destacadas;
- equipas reconhecíveis sem linhas ou cor; sem alegações de reporte novas;
- no máximo um conjunto de conectores entre os dois grupos; sem linhas por membro;
- layout de três colunas no computador, duas no tablet e lista vertical no mobile;
- nomes, cargos e abertura de perfil disponíveis sem hover;
- Enter/Espaço abrem; Escape e Fechar encerram; foco contido e restituído correctamente;
- fundo não recebe cliques/foco durante abertura; scroll é restaurado após fecho e navegação;
- inicial, imagem válida, origem vazia e falha de imagem tratados sem salto de layout;
- biografia vazia omitida; biografia longa não esconde o fecho nem transborda;
- PT/EN mantêm paridade de chaves e selecção de pessoa estável;
- sem novas dependências, pedidos remotos de perfis ou fotografias externas;
- `npm run lint`, `npm run build`, validação dos dados e `git diff --check` passam;
- consola sem erros novos; verificar ausência de regressões junto de Journal e Contactos;
- medir diferença do bundle face aos 654,57 kB registados no Plano 120, sem esconder o aviso pré-existente;
- registar separadamente testes de árvore de acessibilidade e ensaio com leitor de ecrã real; não tratar um como substituto do outro.

Testar o fallback de fotografia com recurso local temporário de teste, não com imagens pessoais não aprovadas. Não promover o ramo se o comportamento modal, foco ou fecho falhar.

## 12. Aprovação e registo de execução — 2026-09-04

Implementação autorizada pelo pedido «Comece a implementar seguindo o plano». Trabalho realizado em `codex/feature-team-profiles`, sobre a base do organograma existente. A aprovação não autoriza merge, push ou publicação. `main` e Atlas permanecem intactos.

### Resultado

- Modelo local migrado para cargo, categoria, fotografia, biografia e liderança; oito pessoas preservadas, com duas lideranças equivalentes.
- Componentes TeamMember, TeamAvatar e TeamProfilePanel extraídos; TeamSection gere apenas a selecção por identificador e a composição.
- Um conector entre grupos, grelha responsiva 3/2/1 e avatares preparados para imagens locais.
- Diálogo nativo em portal, fecho com Escape/botão, contenção e restituição de foco, bloqueio/restauro de scroll e animação curta com alternativa de movimento reduzido.
- CSS restrito à equipa; traduções, mapa e guia de conteúdo actualizados. Sem dependências novas, alterações globais, back-end ou fotografias/bios inventadas.

### Verificações concluídas

- `npm run lint`: aprovado, sem avisos.
- `npm run build`: aprovado. JavaScript 661,35 kB (204,77 kB gzip), mais 6,78 kB que a referência de 654,57 kB. Permanece o aviso pré-existente de bundle superior a 500 kB e de dados Browserslist antigos; optimização global fora do âmbito.
- Validação programática: paridade das chaves PT/EN, oito identificadores únicos, duas lideranças, cargos/categorias válidos, imagem e bio nulas.
- Navegador integrado: composição revista a 375, 768 e 1440 px em PT/EN; os oito perfis abrem com a pessoa correcta, um único diálogo de cada vez.
- Enter e Espaço abrem; Tab e Shift+Tab mantêm o foco; Escape e botão fecham; foco regressa ao botão de origem e o bloqueio de scroll é removido.
- Consola da aplicação sem erros nos fluxos percorridos. Journal e Contactos continuam adjacentes, sem alterações nos respectivos ficheiros.
- Ensaio local temporário: origem vazia e imagem inválida apresentam iniciais; SVG neutro válido carrega; os três avatares mantêm 80 × 96 px. Ficheiros temporários removidos após o ensaio.
- Nome extenso e biografia longa ensaiados a 375 px: texto adapta-se, conteúdo tem scroll interno, fecho permanece visível. Desmontagem do painel em StrictMode restitui foco e estilos de scroll.
- Revisão React: estado derivado, referências estáveis, limpeza de efeitos/temporizadores e componentes de responsabilidade limitada.

### Validação ainda pendente antes de promoção

- Ensaio com leitor de ecrã real, toque em dispositivo físico e zoom real a 200%.
- Confirmação interactiva de movimento reduzido e fecho pelo fundo exterior. O tratamento está implementado, mas as tentativas de clique posicional com a ferramenta não comprovaram o percurso; não é registado como teste aprovado.
- Aceitação visual do utilizador. Fotografias e biografias reais continuam por fornecer e só devem ser adicionadas quando aprovadas.

A árvore de acessibilidade e os testes de teclado não substituem o ensaio com leitor de ecrã. O comando da skill agent-browser não estava instalado; foi usado o navegador integrado como alternativa de verificação.
