# Plano 122 — Equipa: elegância editorial e precisão arquitectónica

> **Estado:** CANÓNICO — aceite para integração em `main` em 2026-09-04; ensaios manuais registados mantêm-se.
> **Data:** 2026-09-04
> **Base:** implementação do Plano 121, commit `d63e508`.
> **Ramo documental:** `codex/plan-team-editorial-refinement`.
> **Ramo de execução previsto:** `codex/feature-team-editorial-refinement`.
> **Restrição expressa:** não mudar fontes. Não executar alterações de interface antes da aprovação deste plano.

## Objectivo

Refinar exclusivamente a secção da equipa e o seu painel de perfil. A percepção de qualidade deve resultar de composição, proporção, alinhamento e detalhe — não de novos efeitos ou de tipografia diferente. Preservar Outfit e Playfair Display, fundo escuro, terracota e linguagem arquitectónica da O+A.

## Diagnóstico

Baseado na imagem fornecida e em TeamSection, TeamMember, TeamAvatar e team.css:

- O conector central e as margens acumuladas criam uma pausa excessiva entre direcção e equipa; o espaço afasta os grupos sem explicar melhor a relação.
- Os rectângulos sólidos de iniciais parecem placeholders técnicos. Na liderança, o espaço reservado para uma fotografia ainda inexistente domina a composição.
- Categoria, nome, cargo e «Ver perfil» têm demasiadas camadas. Em alguns membros, a categoria repete informação já transmitida pelo cargo.
- As acções isoladas numa linha inferior aumentam a altura de cada perfil e repetem um padrão de cartão.
- O rectângulo terracota visível na imagem corresponde ao tratamento de foco previsto no CSS. Não será simplesmente removido: o foco deve continuar inequívoco, mas concentrado numa acção bem desenhada.
- As fontes não são o problema; o refinamento incidirá sobre a sua escala, espaçamento e relação com o espaço disponível.

## Direcção proposta — Pessoas, não cartões

### 1. Composição e liderança

- Manter o título da secção e a introdução, alinhados à largura editorial existente.
- Dois perfis de liderança de igual dimensão, com o mesmo peso visual. Nenhum director fica subordinado ao outro.
- Sem fotografia: assinatura tipográfica compacta, iniciais discretas sobre o próprio fundo, nome como elemento principal e cargo logo abaixo. Eliminar o grande bloco cinzento vazio, não a capacidade de mostrar retratos.
- Com fotografia futura: retrato de proporção reservada num suporte de tamanho controlado, junto ao texto, em vez de um grande banner. A composição deve funcionar sem fotografia desde o primeiro dia.
- Usar uma única linha subtil para marcar a passagem para a equipa, associada ao respectivo título. Retirar o conector vertical isolado e reduzir a distância entre grupos para aproximadamente 48–64 px no computador e 32–40 px no telemóvel.
- A hierarquia continua explícita nos títulos «Direcção conjunta» e «Equipa multidisciplinar»; a linha não representa novas relações de reporte.

### 2. Equipa como composição editorial leve

- Preservar a ordem dos seis membros e a grelha 3/2/1; não criar agrupamentos departamentais fictícios.
- Organizar cada unidade por nome, cargo e pequeno monograma lateral. O nome deve ser o primeiro ponto de leitura, não a categoria.
- Retirar a categoria do resumo e conservá-la no painel: o cargo permanece sempre visível e não é abreviado nem alterado.
- Reduzir o monograma para um suporte discreto, aproximadamente 48–56 px na equipa e 64–80 px na liderança. Usar o fundo da secção ou contraste muito baixo; sem caixas pesadas, círculos decorativos ou novas fontes.
- Integrar «Ver perfil» e a seta na composição do perfil, com menos distância do cargo. Alinhar acções equivalentes através da grelha, sem alturas rígidas que cortem texto.
- Não desenhar bordas em torno de cada pessoa nem separadores em cada linha. A grelha deve ser percebida pelos alinhamentos e intervalos.

### 3. Tipografia e cor

- Manter as famílias actuais e os seus ficheiros/importações intactos. Nomes e interface continuam em Outfit; iniciais mantêm o contraste pontual de Playfair Display já existente.
- Referências iniciais: nomes da direcção 32–40 px, equipa 22–26 px, cargos 14–16 px; ajustar dentro da escala existente após comparar os dois idiomas.
- Reduzir maiúsculas espaçadas ao título de cada grupo; evitar uma etiqueta adicional por pessoa.
- Conservar texto principal claro e secundário com contraste suficiente; não obter elegância tornando os cargos demasiado ténues.
- Terracota apenas na seta, numa pequena resposta interactiva e no foco. Sem novos tons dourados, gradientes, brilhos ou sombras.

### 4. Interacção precisa

- Conservar uma única paragem de teclado por perfil, o nome acessível da acção e a área de activação confortável.
- Hover: mudança discreta de contraste e deslocação da seta de, no máximo, 2 px; nunca deslocar o nome nem expandir o componente.
- Focus-visible: contorno de 2 px na acção «Ver perfil», com afastamento e contraste verificados, em vez de enquadrar todo o bloco. A superfície clicável alargada mantém a mesma acção, sem controlos aninhados.
- Não ocultar a acção até hover. Teclado e toque devem ter a mesma capacidade de descoberta.
- Preservar o diálogo nativo, Escape, botão de fecho, contenção/restauro de foco e scroll. Não reescrever o mecanismo modal por uma alteração estética.

### 5. Painel de perfil coerente

- Sem fotografia: apresentação compacta com monograma, nome e cargo, sem grande rectângulo vazio na abertura.
- Com fotografia: reutilizar o retrato local e o enquadramento já tipado. Não procurar nem inventar imagens.
- Área profissional e biografia aprovada constituem o segundo nível de informação, separados por espaço e, no máximo, uma linha subtil.
- Conservar fecho sempre acessível, scroll interno e largura completa no telemóvel. O painel com biografia vazia deve parecer uma ficha breve acabada, não conteúdo em falta.

## Responsividade

| Contexto | Tratamento |
|---|---|
| ≥1024 px | duas lideranças equivalentes; equipa em três colunas; acções e nomes alinhados, composição menos alta |
| 768–1023 px | duas lideranças e equipa em duas colunas; cargos quebram naturalmente, sem truncagem |
| <768 px | sequência vertical; monograma pequeno e texto predominante; sem árvore, carrossel ou scroll horizontal |

As dimensões são referências de composição, não autorizações para cortar nomes. Testar também 1920 px, pela captura fornecida, e zoom a 200%.

## Ficheiros e reutilização

| Ficheiro | Alteração prevista |
|---|---|
| `src/components/home/TeamSection.tsx` | ritmo entre grupos, transição e alinhamentos |
| `src/components/home/TeamMember.tsx` | resumo editorial, categoria apenas no detalhe, acção integrada |
| `src/components/home/TeamAvatar.tsx` | suporte discreto para iniciais e fotografia, preservando fallback |
| `src/components/home/TeamProfilePanel.tsx` | composição visual do perfil, sem substituir a lógica modal |
| `src/components/home/team.css` | estilos locais, hover, foco e movimento reduzido |
| `docs/CONTENT_GUIDE.md` | actualizar orientações de enquadramento se as proporções mudarem |
| `PROJECT_MAP.md` | actualizar apenas se as responsabilidades mudarem |
| `plans/122-equipa-refinamento-editorial.md` e `plans/README.md` | aprovação, estado e evidências |

Não alterar dados pessoais, cargos, identificadores, fontes, conteúdo global, Atlas, Journal, Contactos, rotas ou dependências. Não acrescentar back-end, fotografias, biografias, filtros, novas secções ou alegações institucionais.

## Etapas de execução após aprovação

1. Criar o ramo de execução sobre a base actual, preservando os perfis do Plano 121.
2. Refinar liderança, equipa e intervalo entre grupos; comparar com a captura fornecida antes de polir detalhes.
3. Ajustar monogramas e ficha lateral para ausência de fotografia; testar também fotografia local neutra temporária e falha de carregamento.
4. Afinar hover, foco, acções e responsividade. Não acrescentar dependências.
5. Validar PT/EN em 375, 768, 1440 e 1920 px, nomes/cargos longos, zoom e ausência de overflow.
6. Repetir abertura dos oito perfis, teclado, fecho e scroll. Retomar as verificações pendentes do Plano 121, especialmente backdrop, movimento reduzido, toque e leitor de ecrã; identificar explicitamente o que não puder ser testado.
7. Executar lint, build e diff-check; apresentar resultado visual e limitações. Aguardar aceitação antes de merge ou publicação.

## Critérios de aceitação

- Fontes, oito pessoas, cargos e ordem editorial preservados.
- Os dois directores continuam equivalentes e claramente destacados.
- Não existem grandes áreas cinzentas vazias à espera de retratos.
- A relação entre direcção e equipa é clara sem conector vertical isolado.
- Nome e cargo predominam; categorias continuam disponíveis nos perfis, sem repetição no resumo.
- Layout sem cartões pesados, efeitos ornamentais ou aparência de dashboard.
- Acções visíveis sem hover, foco inequívoco e nenhuma perda das funções existentes.
- Português e inglês legíveis nas quatro larguras; nenhum texto cortado ou scroll horizontal.
- Sem novas dependências, pedidos remotos ou alterações fora da equipa.
- Diferenças visuais, testes e limitações documentados antes da aceitação.

## Aprovação solicitada

Este plano refina a apresentação do Plano 121 e substitui apenas as suas decisões visuais incompatíveis: grande reserva para avatar, categoria no resumo, conector central e contorno de foco à volta do perfil completo. Os contratos de dados e de interacção mantêm-se.

Para avançar: `APROVADO: plans/122-equipa-refinamento-editorial.md`.

## Registo de execução — 2026-09-04

O utilizador aprovou este plano. Implementação realizada em `codex/feature-team-editorial-refinement`, sem alterar `main` ou Atlas e sem push, merge ou publicação.

### Resultado

- Monogramas sem caixas preenchidas: 48 px na equipa, 64 px na liderança e 80 px no painel; retratos locais mantêm o recorte 4:5 e o fallback.
- Categoria retirada apenas do resumo, conservada na ficha; nomes, cargos, ordem, fontes e dados intactos.
- Conector vertical substituído por uma linha subtil junto ao título da equipa; intervalo de 40 px no telemóvel e 56 px a partir do tablet.
- Acções aproximadas dos cargos e alinhadas pela altura natural da grelha, sem truncagem. Contorno de foco de 2 px na acção, não no perfil inteiro.
- Painel sem o grande bloco de avatar, mantendo a lógica modal existente.
- Cabeçalho em coluna até 1024 px para evitar comprimir o título no tablet. Guia de conteúdo actualizado quanto ao recorte dos retratos.
- Revisão React aplicada: nenhuma dependência, efeito ou estado novo; alteração limitada à apresentação dos componentes existentes.

### Verificações

- `npm run lint` e `npm run build`: aprovados. Bundle JavaScript: 661,35 kB / 204,76 kB gzip; sem aumento relevante face ao Plano 121. Mantêm-se os avisos pré-existentes de bundle superior a 500 kB e Browserslist antigo.
- Composição revista no navegador integrado em PT/EN a 375, 768, 1440 e 1920 px; oito nomes presentes e sem overflow horizontal nos perfis.
- Os oito perfis abrem e fecham em ambos os idiomas. Nos testes automatizados, foi necessário aguardar o diálogo ficar oculto antes da acção seguinte, respeitando a transição de fecho.
- Enter/Espaço, Tab/Shift+Tab, Escape e botão de fecho verificados; foco devolvido à acção original, contorno de 2 px confirmado e scroll desbloqueado.
- Consola sem erros no percurso final da aplicação.
- Ensaio temporário com imagem neutra: imagem válida, origem vazia e imagem inválida mantêm 48 × 60 px; os dois últimos casos apresentam iniciais. Ficheiros temporários removidos após verificação.
- `git diff --check`: sem erros de espaços. Avisos de conversão LF/CRLF correspondem à configuração Git local.

### Pendências e limites de aceitação

- Aceitação visual do utilizador ainda pendente; este ramo não é canónico.
- Continuam pendentes os ensaios manuais do Plano 121: leitor de ecrã real, toque físico, zoom real a 200%, movimento reduzido interactivo e fecho pelo fundo exterior. Os respectivos mecanismos não foram removidos; não se declara validação onde não houve ensaio comprovado.
- Não foram acrescentadas fotografias ou biografias reais. A ficha permanece deliberadamente breve até existir conteúdo aprovado.
