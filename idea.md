# Plano de Refatoração O+A Architects and Planners (Projeto Lovable)

Este documento centraliza todas as informações do site atual `O+A Architects and Planners` e detalha os requisitos para o futuro desenvolvimento do site, com o objetivo de recriá-lo na plataforma **Lovable**, transformando-o numa plataforma dinâmica com um **CMS (Sistema de Gestão de Conteúdos)** integrado. 

## 1. Objetivo Principal e Visão de Design
Refazer o site utilizando Lovable, implementando um painel administrativo.
**Referência de Estilo e Originalidade:** O design deve inspirar-se nos princípios do site *https://www.fosterandpartners.com/* (como a hierarquia visual sofisticada, amplo uso de espaço em branco/whitespace, tipografia moderna e elegante, e um forte equilíbrio entre texto e foto). **No entanto, deve manter uma identidade visual única e original da O+A.** A cópia não deve ser literal; os padrões de UX luxuosos e a escala impactante das imagens da Foster devem ser adaptados com a própria personalidade pragmática e as obras marcantes da O+A Architects. O objetivo final é transmitir profissionalismo, minimalismo limpo, estética contemporânea e alta autoridade arquitetónica, mas com o "ADN" da O+A.

### 1.1. A Referência: Foster + Partners e o Peso Internacional
Porque escolhemos a Foster + Partners como bitola visual para um site de arquitetura internacional? O seu ecrã é um "case study" de como posicionar um estúdio a nível global:

- **A Atmosfera e o Sentimento:** O design grita *Luxo através do Espaço*, *Autoridade Global* e *Minimalismo Pragmático*. O uso abismal de "espaço em branco" não é ao acaso; diz silenciosamente ao visitante que "todos os nossos projetos merecem espaço para respirar e serem apreciados". Mistura projetos num país com projetos noutro sem atrito, afirmando a sua presença global.
- **A "Paleta Invisível":** O site em si quase não tem cor (usa branco, preto e cinzas técnicos). A cor é dada exclusivamente pelas fotografias das obras (Renderings ou Fotos Reais). Isso diz ao cliente que o protagonista não é quem fez o site, é a Arquitetura em si.
- **Tipografia Restrita e Elegante:** Uma fonte *sans-serif* limpa, onde títulos grandes (o "Nome da Obra") ganham o palco, enquanto os dados técnicos rigorosos (Ano, Local, Cliente) são mais subtis (cinza/pequenos). Ideal para falar para dois públicos ao mesmo tempo: o investidor comum (que vê o título grande e a foto) e o engenheiro/B2B (que pesquisa nos detalhes).
- **Imagens Full-Bleed (Ecrã Inteiro) e Interatividade:** O Hero e as galerias são gigantes e imersivos. Aos fazer hover (passar o rato), o site reage num "slow-zoom" sem parecer agressivo.
- **A Jornada de Continuidade:** O site nunca acaba "num beco sem saída". Ao ver os detalhes finais de uma obra, sugere sempre outro projeto a seguir, obrigando o cliente a ficar encantado pelo portfólio *ad eternum*. É isto que a O+A deve aspirar oferecer no seu Lovable: **um loop visual de inspiração para investidores onde a página não serve apenas para informar, mas para convencer.**

### 1.2. Dinamismo Intuitivo e Competição Internacional
Para garantir que o site agarra instantaneamente a atenção do internauta e compete a nível internacional com os maiores estúdios de arquitetura:
- **Navegação Sem Atrito (Frictionless):** O site deve ser altamente intuitivo. Não podem existir "cliques a mais" para chegar à informação. O menu deve ser limpo e estar sempre à mão, mas invisível quando o utilizador quer apenas apreciar a obra.
- **Animações com Propósito (Micro-Interactions):** O dinamismo não significa um site caótico. Significa que os botões reagem fisicamente ao toque, as galerias deslizam com uma física suave (ex: inércia ao fazer *swipe* ou *scroll*), e as transições de página (Page Transitions) fluem sem ecrãs em branco, tal como uma Aplicação Nativa premium moderna.
- **Poder de Captar nos Primeiros 3 Segundos:** O utilizador não precisa de ler um parágrafo longo para perceber a grandeza do estúdio. O site prova o seu valor internacional imediatamente pela qualidade intocável do seu design e pelo vídeo/imagem *hero* envolvente.

---

## 2. Conteúdos Atuais do Site (A Migrar)

O site atual possui as seguintes secções principais e conteúdos:

### Geral
- **Nome:** O+A Architects and Planners
- **Slogan:** Arquitetura e Planeamento para um Mundo em Mudança. (Architecture and Planning for a Changing World)
- **Localizações Base:** Milão (Itália) e Maputo (Moçambique).
- **Idiomas Atuais:** Bilingue - Português (PT) e Inglês (EN).

### Secção 1: Cabeçalho (Header / Navegação)
- **Logo:** O+A (Mark).
- **Menu:** Workshop, Expertise, Projectos, Contactos.
- **Funcionalidade:** Seletor de idioma dinâmico (PT | ENG). Menu de overlay em mobile.

### Secção 2: Hero Section (Início)
- **Título principal:** "Projetando lugares que funcionam hoje e amanhã"
- **Descrição:** "Arquitetura, planeamento urbano e infraestrutura resiliente, com uma abordagem pragmática para a entrega, impacto na comunidade e manutenção a longo prazo."
- **Estatísticas Fixas:** 
  - 15+ Anos de Experiência
  - 50+ Projectos Concluídos
  - 2 Continentes
- **Call-to-actions (Botões):** "Nossa Expertise" e "Ver Projectos".

### Secção 3: Workshop (Filosofia e Abordagem)
- **Slogan:** "Arquitetura é sobre ouvir, projetar e realizar sonhos com precisão técnica."
- **Título:** "Abordagem Centrada no Cliente"
- **Passos (Metodologia):**
  1. *Listen:* Briefing, restrições, stakeholders, realidades do local.
  2. *Design:* Opções, do conceito ao detalhe, conformidade.
  3. *Deliver:* Desenhos, Mapas de quantidades, apoio à contratação.
  4. *Support:* Supervisão de obra, QA/QC, pensamento de O&M.
- **A Nossa Equipa (Antigo "Organograma"):** Membros fundadores (Artur Simão e Osvaldo), apresentados com fotografias bem alinhadas, tipografia elegante para cargo e nome, transmitindo proximidade e uma estética institucional, sem aspeto de diagrama rígido.

### Secção 4: Expertise (Serviços e Áreas de Atuação)
A apresentação das áreas de especialização **não pode ser aborrecida (not boring)** ou parecer uma simples lista de serviços corporativos. Deve ser desenhada como peças de museu, utilizando componentes visuais altamente interativos que recompensem o utilizador. 

- **A Estrutura Visual (O "Não-Boring"):** 
  - Em vez de pequenos ícones genéricos do lado de textos pesados, cada "Expertise" deve ser dominada por **uma imagem monumental (ou vídeo curto em loop silenciado)** que ilustre aquela capacidade.
  - **Interatividade Oculta (Reveal Effects):** Inicialmente, o utilizador vê apenas o grande título centrado sobre a imagem escurecida (ex: grande "ARQUITETURA" sobre a foto de um arranha-céus ou detalhe de betão cru). Quando orato passa por cima (*hover* em desktop) ou toca (mobile), a imagem ilumina-se, faz um zoom extremamente lento, e surge um parágrafo elegante com a descrição do serviço.
- **As Áreas a Apresentar:**
  - **Arquitetura (Architecture):** Design conceitual, suporte técnico à construção e interiores.
  - **Urbanismo (Urban Planning):** Planos de estrutura, visões estratégicas e zoneamento urbano.
  - **WASH (Water, Sanitation and Hygiene):** Saneamento modular e infraestrutura escolar resiliente (destaque para o compromisso pragmático para um mundo em mudança).
  - **DRR (Disaster Risk Reduction):** Design consciente de riscos e construção resiliente face às alterações climáticas.

### Secção 5: Projectos (Portfólio)
- **Estado atual:** Apresenta uma mensagem elegante e centralizada de "Em Construção" (Under Construction em inglês), evidenciando que os novos projetos estão a ser preparados, mantendo a sofisticação visual para evitar a perceção de uma página vazia.

### Secção 6: Contactos
- **Textos:** "Inicie uma conversa. Estamos disponíveis para colaborar consigo e concretizar a visão do seu próximo grande projeto."
- **Informações:** Email (oa@oa-workshop.com), Telefone/WhatsApp (+258 000 000 000), Localizações.
- **Formulário:** Nome, Email, Assunto, Mensagem.
- **Redes Sociais:** Facebook, Instagram, LinkedIn, YouTube.

### Secção 7: Footer (Rodapé)
- Resumo, Links Rápidos, Informações de Contacto, Redes Sociais, Copyright dinâmico, Políticas e Termos.

---

## 3. Futuras Funcionalidades a Desenvolver (O CMS Completo)

Como o novo site será gerado com **Lovable**, devemos integrar uma infraestrutura de Banco de Dados (ex: Supabase) para transformar as secções estáticas numa aplicação verdadeiramente gerível pelo utilizador final.

### 3.1. Gestão de Projetos (Módulo Core do Portfólio)
- **Painel CRUDS (Criar, Ler, Atualizar, Eliminar)** de obras e projetos recém-terminados.
- **Atributos de cada Projeto:**
  - Título / Nome.
  - Categoria (Arquitetura, Urbanismo, WASH, DRR, Interiores, etc).
  - Data / Ano de Conclusão e Cliente (Opcional).
  - Localização geográfica (Cidade/País).
  - Descrição Rica (Editor de texto WYSIWYG).
  - Gestor de Media: Fazer upload de uma imagem de "Capa/Thumbnail" e várias imagens para criar galerias de alta qualidade imersivas.

### 3.2. Internacionalização a partir do CMS (i18n)
- Atualmente as traduções vivem estaticamente num ficheiro `translations.js`.
- O novo CMS deve permitir aos gestores do site preencher sempre os campos em **ambos os idiomas (PT e EN)** ao criarem novos Projetos, Perfis de Equipa ou atualizarem descrições da homepage.

### 3.3. Gestor da Equipa (Our Team Module)
- Permissão para adicionar, editar ou inativar membros da equipa (os Sócios e futuros arquitetos colaboradores).
- Campos no CMS: Fotografia corporativa com estética alinhada (preto e branco ou paleta padronizada), Nome, Cargo (ex: "Sócio Fundador", "Arquiteto Júnior"), e breve Biografia.

### 3.4. Caixa de Mensagens / CRM Básico (Formulário Leads)
- A atual secção de submissão do formulário de contactos enviará uma notificação por e-mail, **mas também irá guardar o conteúdo na base de dados (CMS)**.
- O painel admin deve ter uma lista de "Mensagens Submetidas", facilitando o controlo e permitindo que nenhum potencial cliente seja perdido.

### 3.5. Gestor de Secções Estáticas (HomePage e Sobre)
- **Estatísticas do Hero:** Permitir atualizar, via backend, os números do front-end (ex: de "50+" para "65+ Projetos", etc).
- **Expertise / Workshop:** Permitir a edição esporádica dos textos introdutórios e imagens conceituais que apoiam as áreas de negócio através do painel.

### 3.6. Otimização e SEO
- Os projetos carregados na base de dados deverão gerar URLs dinâmico (ex: `oa-architects.com/projects/maputo-villa`) com tags *Open Graph*, *Meta Title* e *Meta Description* customizadas a partir do título e thumbanils recém introduzidos no CMS, garantindo partilhas adequadas em redes sociais como o LinkedIn e WhatsApp.

---

## 4. Funcionamento do Site e Fluxo do Cliente

O site deve funcionar como uma ferramenta passiva de captação (montra institucional), mas ao mesmo tempo imersiva, focando em reter a atenção através do seu design e na facilidade de estabelecer um primeiro contacto. Tudo nele deve passar a mensagem de "alto nível" (premium).

### 4.1. Como o Site Deve Funcionar (Interatividade Geral)
- **Carregamento (Loading):** O utilizador entra no site e é recebido por uma animação fluída e elegante (ex: fade-in com elementos de construção em blocos). O tempo de espera deve transmitir sofisticação técnica e antecipação.
- **Navegação Progressiva:** A página inicial não atira toda a informação de uma vez. Baseada na premissa de *scroll longo*, ela vai revelando gradualmente blocos de texto e imagem (reveal up/fade-in), estimulando a continuação da leitura.
- **Interatividade (Hover):** As imagens de projetos e de secções (como *Expertise*) reagem subtilmente quando o rato passa por cima (por exemplo, um zoom muito leve e lento - *slow-zoom*, ou o aparecimento de informação extra), mantendo a página "viva" sob o rato do utilizador sem ser agressivo.
- **Portfólio (Deep Dive):** O Clique num projeto não deve recarregar uma página lenta. Pode abrir uma página ou um slide muito suave e focado puramente nessa obra: fotografias incrivelmente grandes, texto com respiro, mantendo sempre um botão de "Voltar à página inicial" ou de "Pedir uma proposta" próximo.

### 4.2. O Fluxo de um Potencial Cliente (Lead Journey)

A jornada ideal que o design do site obriga (subtilmente) o potencial cliente a fazer:

**Passo 1: Descoberta e Impacto**
- Um Promotor Imobiliário ou cliente particular abre o site através de um contacto ou no telemóvel partilhado via WhatsApp.
- É atingido por um *Hero Section* imponente em ecrã total: Título marcante ("Projetando lugares hoje e amanhã") com as grandes métricas que passam segurança imediata (15+ Anos, 50+ Obras em 2 Continentes).
- Seleciona o seu idioma (EN - Inglês) se não for Português.

**Passo 2: Construção Racional de Confiança (Scroll de Assinatura)**
- Começando a descer pela página, a pessoa começa a construir logicamente a confiança na empresa.
- **A Abordagem:** O cliente lê sobre a seriedade metódica (Ouvir, Projetar, Entregar, Apoiar). Entende que não é só "desenhar", há rigor envolvido.
- **A Relação Humana:** Imediatamente abaixo, depara-se com as caras bem enquadradas do Artur e Osvaldo. Ganha empatia — sabem quem são as pessoas nos bastidores.
- **A Capacidade:** Vê graficamente as áreas abrangidas.

**Passo 3: A Validação Afetiva/Visual**
- A pessoa chega à zona de galerias (Portfólio/Projectos), clica e entra nos casos de estudo da O+A.
- Observa as ótimas fotos, entende a envergadura das peças (moradias, infraestruturas, escolas) e toma internamente a decisão de que a "O+A consegue fazer a minha obra".

**Passo 4: Entrada em Contacto (O Fundo do Funil)**
- No fim da jornada da página inicial — ou a qualquer momento no topo — a pessoa clica em "Contactos".
- A interface é limpa, acolhendo explicitamente o contacto: "Inicie uma conversa".
- **Sem barreiras:** Pode enviar imediatamente e-mail/clicar para WhatsApp num telemóvel, **ou** utilizar o formulário ultra-rápido no próprio ecrã.
- Ao clicar no botão `Enviar Mensagem`, o formulário tem de dar uma resposta gratificante: *"A sua mensagem foi enviada. Responderemos pelas vias fornecidas dentro de 24 horas."*

**Passo 5: Lado Administrativo (No CMS da O+A)**
- No bastidor da empresa, o gestor acede ao portal administrativo Lovable e visualiza no gestor de Leads todos os detalhes desse contacto que foi feito no "Passo 4".
- A partir daí, a relação sai da "internet" e entra para o mundo real, tendo sido mediada na perfeição pelo site.

---

## 5. Sugestões Finais e Funcionalidades a Ponderar (Premium Add-ons)

Ao analisar o plano, ele está robusto e pronto para ser executado no Lovable. No entanto, para garantir que o site alcança o **verdadeiro patamar internacional de estúdios de elite**, sugiro que as seguintes funcionalidades sejam consideradas (podem ser feitas numa fase 2 do projeto):

### 5.1. Sistema de Filtros Avançado no Portfólio (Tags)
Quando a O+A tiver dezenas de projetos carregados (os 50+ listados no Hero):
- **Sugestão:** O layout da página "Projectos" deve ter filtros subtis e animados no topo (Ex: *All | Residential | Masterplanning | WASH*). O utilizador clica e as fotos reorganizam-se na grelha instantaneamente, sem recarregar a página (efeito *isotope* ou *masonry* suave). 

### 5.2. Dark Mode Contextual (Opcional, mas muito premium)
- **Sugestão:** Em projetos de arquitetura, muitas grelhas de portfólio funcionam incrivelmente bem em fundos pretos escuros ou cinza muito escuro porque faz as cores quentes dos Renderings e madeiras saltar. Ponderar se o site inteiro tem um botão de *Dark Mode* ou se, nativamente, ao entrar num projeto o ecrã inverte a cor para dar um efeito de "sala de cinema" (foco total na imagem).

**Com este plano totalmente detalhado, o documento está completo, blindado e pronto a ser enviado para o planeamento e arranque do projeto na plataforma Lovable!**
