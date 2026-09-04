# Plano 123 — Perfil individual e redes sociais

> **Estado:** CANÓNICO — aceite para integração em `main` em 2026-09-04; conteúdo real continua por fornecer.
> **Base:** Plano 122, commit `7760221`.
> **Ramo documental:** `codex/plan-team-profile-socials`.
> **Ramo de execução previsto:** `codex/feature-team-profile-socials`.

## Objectivo e interpretação

Ao seleccionar uma pessoa, apresentar a sua identidade, informação profissional e ligações sociais numa ficha individual coerente com o desenho editorial da equipa.

Este plano interpreta «loading da pessoa escolhida» como a abertura e apresentação do perfil seleccionado, com estado de carregamento apenas para recursos que estejam realmente a carregar. Recomenda-se evoluir o painel existente, não criar uma página separada. Se a intenção for uma página própria por pessoa, essa decisão deve ser confirmada antes da execução.

Manter fontes, fundo escuro, terracota e composição do Plano 122. A informação continua local e tipada; não existe consulta a back-end ou a APIs de redes sociais.

## Estado actual

- `TeamSection.tsx` selecciona uma pessoa pelo identificador e apresenta um único painel.
- `TeamProfilePanel.tsx` já mostra nome, cargo, categoria e pertença à direcção/equipa, com biografia condicional.
- `TeamAvatar.tsx` suporta fotografia e iniciais em caso de ausência ou erro, mas não distingue visualmente o carregamento real da imagem.
- `src/data/team.ts` contém oito membros com `image: null` e `bio: null`; não existe campo de ligações sociais.

## Experiência proposta

1. O visitante clica no membro ou activa «Ver perfil» com teclado.
2. O painel abre com o nome e cargo correctos imediatamente; não é introduzido um temporizador de espera.
3. A fotografia, quando fornecida, carrega num espaço reservado. Até estar pronta, manter as iniciais e uma indicação discreta de carregamento, sem shimmer nem animação contínua.
4. O perfil apresenta a biografia aprovada e a área profissional, quando disponíveis.
5. Um bloco final «Redes e portefólio» apresenta apenas as ligações públicas confirmadas dessa pessoa.
6. O visitante abre uma ligação externa ou fecha o painel e regressa ao ponto anterior na equipa.

### Conteúdo da ficha

- Fotografia local aprovada ou iniciais.
- Nome e cargo, já confirmados.
- Área profissional e pertença à direcção/equipa.
- Biografia curta, localizada em PT/EN, quando fornecida.
- Ligações de redes sociais e portefólio, quando fornecidas.

Não acrescentar qualificações, projectos pessoais, contactos privados ou percurso profissional por inferência. Informação ausente é omitida, sem «brevemente», links fictícios ou secções vazias.

## Modelo de dados

Estender `TeamMember` com `links: readonly TeamProfileLink[]`, inicialmente vazio para cada pessoa.

Contrato proposto de cada ligação:

- `id`: identificador estável dentro do perfil;
- `platform`: tipo reconhecido, por exemplo LinkedIn, Instagram, Behance ou website;
- `url`: endereço HTTPS público confirmado.

Os nomes de plataformas e textos de acessibilidade pertencem às traduções; não guardar biografias em duplicado nos componentes. O campo `bio` existente continua a referenciar uma chave PT/EN. Preservar os campos de fotografia e enquadramento actuais.

Não criar ligações iniciais de exemplo na aplicação pública. A estrutura pode ser implementada e testada com dados temporários sem publicar contas não confirmadas.

## Apresentação e interacção

- Ligações com nome legível da plataforma e seta externa; não depender apenas de logótipos ou ícones.
- Usar os ícones já disponíveis ou a seta genérica, sem instalar bibliotecas adicionais.
- Abrir em nova aba com `rel="noopener noreferrer"` e indicação acessível de nova aba. Nome acessível associa plataforma e pessoa.
- Validar protocolo HTTPS e rejeitar endereços inválidos, URLs com credenciais ou esquemas executáveis. Não adicionar embeds, widgets, contadores de seguidores ou rastreio.
- Conservar foco inicial no fecho, Tab/Shift+Tab contidos e restituição ao membro. Revalidar o ciclo de foco com várias ligações, pois o painel deixará de ter apenas o botão de fecho.
- Telemóvel: painel de largura completa, ligações com áreas de toque de pelo menos 44 px e conteúdo com scroll interno. Desktop/tablet: manter o painel lateral.

## Estados de fotografia

- **Sem origem:** iniciais imediatas, sem loading.
- **A carregar:** iniciais no espaço reservado e estado discreto restrito ao retrato; texto e ligações utilizáveis.
- **Carregada, incluindo cache:** retrato visível sem alterar dimensões.
- **Falhada:** retirar indicação de loading e manter iniciais; não repetir pedidos indefinidamente.
- **Origem alterada:** reiniciar correctamente o estado de imagem, sem apresentar a fotografia da pessoa anterior.
- **Fecho durante carregamento:** não bloquear o fecho nem executar actualizações inválidas depois da desmontagem.

Usar eventos reais de carregamento/erro; sem atraso mínimo artificial ou percentagens fictícias. Respeitar movimento reduzido.

## Ficheiros previstos

- `src/data/team.ts`: contrato e listas de ligações locais.
- `src/components/home/TeamProfilePanel.tsx`: conteúdo e lista de ligações; reutilizar o diálogo existente.
- `src/components/home/TeamAvatar.tsx`: estados reais de fotografia, preservando o fallback.
- `src/components/home/team.css`: estados visuais locais, se necessário.
- `src/locales/pt.ts` e `src/locales/en.ts`: textos de ligações, nova aba e carregamento.
- `docs/CONTENT_GUIDE.md`: publicação de biografias e contas confirmadas.
- `PROJECT_MAP.md`: registar a responsabilidade das ligações nos dados e no painel.
- Este plano e `plans/README.md`: estado, decisões e evidências.

Não criar um novo componente só para uma lista pequena utilizada uma única vez. Não modificar a grelha ou navegação global.

## Etapas após aprovação

1. Criar ramo de execução sobre o Plano 122, sem alterar `main`.
2. Estender tipos, dados e traduções; manter listas vazias até existirem contas aprovadas.
3. Implementar ligações seguras e apresentação condicional no painel.
4. Implementar estados de imagem reais, sem bloquear a ficha.
5. Testar com recursos neutros e ligações de teste locais/temporárias; retirar todos os dados de ensaio antes da entrega.
6. Inserir fotografias, biografias e URLs reais apenas após serem fornecidos e autorizados para publicação.
7. Validar e apresentar o resultado; sem merge, push ou publicação automáticos.

## Validação e critérios de aceitação

- A pessoa seleccionada corresponde sempre ao nome, imagem, biografia e links apresentados.
- Perfil sem fotografia, sem biografia e sem links continua a parecer uma ficha acabada.
- Nenhuma espera artificial, chamada de API, embed social ou dependência nova.
- Carregamento lento, cache, erro e mudança de fotografia testados sem saltos de layout.
- Links válidos, inválidos e lista vazia testados; links externos não podem controlar a aba original.
- PT/EN, teclado, Escape, fecho, scroll e foco com várias ligações verificados.
- Rever 375, 768, 1440 e 1920 px, texto longo e movimento reduzido; registar separadamente ensaios manuais não realizados.
- `npm run lint`, `npm run build` e `git diff --check` aprovados.

## Conteúdo a fornecer

Para preencher cada perfil, o utilizador deve fornecer a fotografia autorizada, uma breve biografia e os endereços exactos das redes/portefólio que pretende tornar públicos. Não é necessário fornecer palavras-passe, tokens ou acesso às contas. Não procurar contas por nome e assumir que pertencem à pessoa.

A aprovação do plano permite preparar a funcionalidade, mas não autoriza inventar o conteúdo em falta. Sem esses dados, as ligações continuarão ocultas na interface pública.

## Aprovação solicitada

`APROVADO: plans/123-perfil-individual-e-redes-sociais.md`

## Registo de execução — 2026-09-04

Plano aprovado pelo utilizador e executado em `codex/feature-team-profile-socials`. Não houve alteração de fontes, back-end, `main`, push, merge ou publicação.

### Resultado

- `TeamMember` passa a incluir `links`, tipados por plataforma; os oito perfis mantêm listas vazias até existirem contas autorizadas.
- A validação aceita apenas HTTPS sem credenciais incorporadas. URLs inválidos e identificadores repetidos são omitidos antes da renderização.
- O painel apresenta condicionalmente «Redes e portefólio», com nome da plataforma, indicação acessível de nova aba, `target="_blank"` e `rel="noopener noreferrer"`.
- A fotografia apresenta iniciais enquanto carrega, uma linha terracota estática restrita ao retrato, transição curta quando conclui e iniciais definitivas em caso de erro. Ausência de fotografia não produz loading.
- O painel e restante informação permanecem utilizáveis durante o carregamento. A chave da origem no componente reinicia o estado quando a fotografia muda.
- Mapa do projecto e guia de conteúdo actualizados. Sem dependências, embeds, widgets, chamadas sociais ou atrasos artificiais.

### Verificações

- Validação programática: paridade PT/EN; oito listas sociais de produção vazias; HTTPS válido aceite; HTTP, JavaScript, credenciais incorporadas e texto inválido recusados.
- Ensaio temporário no navegador: uma ligação HTTPS surgiu com destino, `target` e `rel` correctos; uma ligação `javascript:` foi omitida. Os dados de ensaio foram retirados.
- O ciclo de Tab incluiu a ligação e regressou ao botão de fecho. Escape, restituição de foco e scroll preservados.
- Imagem inválida removeu o elemento quebrado, a indicação de loading e conservou `OL`; SVG neutro válido concluiu com largura natural de 80 px e sem indicador residual. O recurso temporário foi retirado.
- Estado final sem fotografia ou redes: iniciais presentes, zero imagens e zero secções sociais; perfil considerado completo sem mensagens provisórias.
- PT/EN verificados; composição sem overflow e oito membros presentes a 375, 768, 1440 e 1920 px. Consola sem erros no percurso final.
- `npm run lint`, `npm run build` e `git diff --check`: aprovados. Bundle final 663,08 kB / 205,31 kB gzip; mantém-se o aviso pré-existente acima de 500 kB e o aviso Browserslist antigo.
- Revisão React: estado local mínimo à imagem, dados derivados durante renderização, sem efeitos ou subscrições adicionais, e componente social mantido no único consumidor.

### Pendências

- Fotografias, biografias e URLs públicos reais ainda não foram fornecidos; não foram pesquisados nem inventados.
- Permanecem os ensaios manuais já registados: leitor de ecrã real, toque físico, zoom real a 200%, movimento reduzido interactivo e fecho pelo fundo exterior.
- Aceitação do utilizador é necessária antes de tornar o ramo canónico.
