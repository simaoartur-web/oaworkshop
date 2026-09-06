# Sistema de design O+A

## Referências de estudo

Antes de planear, rever ou implementar design/UI/UX, consultar também o [O+A Design Mastery Playbook](OA_Design_Mastery_Playbook.md) e o [estudo aplicado à O+A](DESIGN_STUDY.md). O playbook fundamenta as decisões; este sistema continua a definir a identidade, as fontes e os tokens do projecto. Aplicar os princípios relevantes dentro do plano aprovado.

## Filosofia

A interface traduz uma prática de arquitectura e planeamento: estrutura antes de decoração, matéria antes de ornamento e movimento com propósito. O resultado deve ser editorial, sóbrio, preciso e humano.

Cada decisão visual deve reforçar pelo menos uma destas qualidades:

- clareza espacial;
- hierarquia editorial;
- confiança e permanência;
- atenção ao detalhe;
- protagonismo do projecto e da imagem.

## Princípios

### Minimalismo arquitectónico

Usar poucos elementos, bem alinhados e com relações espaciais claras. Evitar cartões, sombras, contornos ou ornamentos quando o espaço, a tipografia e a grelha já resolvem a hierarquia.

### Ritmo editorial

Alternar escala, silêncio e densidade como numa publicação de arquitectura. Títulos grandes convivem com etiquetas pequenas e precisas; o texto corrido deve permanecer confortável.

### Acento controlado

A terracota identifica acções, progressos e pormenores importantes. Não deve preencher grandes áreas nem competir com imagens e títulos.

### Movimento material

As animações devem sugerir deslocação, revelação e profundidade. Preferir transições lentas e subtis; evitar saltos, elasticidade excessiva e movimento simultâneo sem hierarquia.

## Tokens actuais

Os tokens canónicos estão em `src/index.css`.

### Cor

| Papel | Valor actual | Utilização |
|---|---:|---|
| fundo principal | `#111111` | superfícies gerais |
| fundo profundo | `#050505` | secções imersivas e sobreposições |
| preto secundário | `#222222` | separação discreta |
| terracota | `#A65D4A` | acento e estado activo |
| branco | `#FFFFFF` | texto principal e contraste |
| cinzentos | `#F5F5F5` a `#9E9E9E` | hierarquia secundária |

Não introduzir uma cor nova sem justificar o papel semântico e criar um token.

### Tipografia

- **Outfit:** corpo, navegação, dados e interface.
- **Playfair Display:** contraste editorial, itálicos expressivos e momentos seleccionados.
- Pesos leves são parte da identidade, mas não devem reduzir a legibilidade.
- Maiúsculas e `letter-spacing` amplo destinam-se a etiquetas curtas, não a parágrafos.

### Espaçamento e grelha

- Usar `container-custom` para a largura editorial principal.
- Manter alinhamentos consistentes entre secções.
- Preferir intervalos da escala Tailwind existente.
- Não criar valores arbitrários repetidos; transformar padrões comprovados em tokens.
- O espaço negativo é funcional: separa ideias e orienta a leitura.

## Imagem

- Privilegiar imagens arquitectónicas de boa resolução e enquadramento intencional.
- Usar `object-cover` apenas quando o corte foi verificado nas larguras críticas.
- Definir sempre texto alternativo significativo, excepto em imagens puramente decorativas.
- Evitar imagens remotas instáveis em conteúdo final; preferir recursos optimizados e versionados.
- Efeitos cinzento-cor, escala e sobreposição devem ser graduais e consistentes.

## Movimento

- Curva de referência: movimentos suaves semelhantes a `[0.22, 1, 0.36, 1]`.
- Durações longas são aceitáveis para imagens e revelações ambientais, não para controlos funcionais.
- Botões e ligações devem responder rapidamente.
- Respeitar `prefers-reduced-motion`; conteúdo e navegação devem continuar compreensíveis sem animação.
- Não usar animação para esconder atrasos ou tornar uma acção ambígua.

## Componentes

Antes de criar um componente:

1. Confirmar se existe um padrão equivalente em `PROJECT_MAP.md`.
2. Reutilizar tokens e comportamentos existentes.
3. Definir estados normal, hover, focus, activo, desactivado, carregamento e erro quando aplicável.
4. Verificar teclado, leitor de ecrã e movimento reduzido.
5. Testar em 375 px, 768 px e 1440 px.

Um componente partilhado só deve ser criado depois de existir repetição real ou um contrato claro entre consumidores.

## Acessibilidade visual

- Foco sempre visível e distinguível de hover.
- Contraste de texto conforme WCAG 2.2 AA.
- Áreas de toque confortáveis, idealmente pelo menos 44 por 44 px.
- A hierarquia não pode depender exclusivamente da cor.
- Texto sobre imagens exige sobreposição ou tratamento que mantenha contraste em todos os fotogramas.

## Sinais de desalinhamento

Rever uma proposta se ela introduzir:

- aparência de painel genérico ou modelo comercial;
- gradientes decorativos sem função;
- múltiplas cores de acento;
- excesso de caixas arredondadas e sombras;
- animações rápidas, elásticas ou concorrentes;
- texto pequeno ou espaçado em excesso;
- diferenças visuais entre componentes equivalentes.
