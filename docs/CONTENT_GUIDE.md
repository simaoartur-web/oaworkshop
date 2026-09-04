# Guia de conteúdo

## Voz O+A

A voz deve ser clara, culta, concreta e confiante. Comunica arquitectura e planeamento com rigor, sem linguagem promocional vazia.

Preferir:

- verbos activos e frases directas;
- descrições espaciais, materiais e sociais concretas;
- contexto, intenção e impacto observável;
- linguagem acessível a clientes, parceiros e comunidade.

Evitar:

- superlativos sem prova;
- jargão empresarial;
- repetição de adjectivos como “inovador”, “único” ou “premium”;
- promessas ambientais não sustentadas;
- texto genérico que poderia pertencer a qualquer atelier.

## Idiomas

- A interface suporta português e inglês.
- `src/locales/pt.ts` e `src/locales/en.ts` devem conservar o mesmo conjunto de chaves.
- Não colocar texto traduzível directamente em componentes, salvo nomes próprios, marcas ou dados deliberadamente editoriais.
- O português institucional segue português de Portugal, com grafia pré-AO90 enquanto esta regra estiver activa.
- A tradução deve preservar intenção e naturalidade; não traduzir literalmente estruturas que soem artificiais.

## Projectos

Cada projecto deve ter, quando aplicável:

- identificador único e estável;
- título;
- disciplina ou categoria;
- localização;
- ano;
- descrição concisa e factual;
- âmbito dos serviços;
- área;
- imagem principal e miniatura;
- coordenadas verificadas quando apresentado no mapa.

Os identificadores, recursos, anos e coordenadas residem em `src/data/projects.ts`. O conteúdo traduzível reside em `src/locales/pt.ts` e `src/locales/en.ts`. Uma mudança de modelo exige actualizar tipos, consumidores, traduções relevantes, testes e `PROJECT_MAP.md`.

## Imagens e direitos

### Perfis da equipa

- Editar `src/data/team.ts`: conservar `id` estável e usar `leadership` apenas para os dois membros da direcção conjunta, salvo nova aprovação.
- Cargos e categorias são chaves de `team.roles` e `team.categories`, presentes nos dois idiomas.
- Até existirem retratos autorizados, manter `image: null`. Para uma fotografia local aprovada, usar `image: { src: '/images/team/retrato.webp', objectPosition: '50% 35%' }`; `objectPosition` é opcional e ajusta o enquadramento sem alterar o componente.
- Preparar retratos optimizados, adequados aos recortes 4:5 e 5:3. Não acrescentar pastas ou imagens fictícias só para preencher a estrutura.
- Imagem nula, caminho vazio ou erro de carregamento apresentam automaticamente as iniciais, sem alterar as dimensões do avatar. O retrato é decorativo para tecnologias de apoio, pois o nome já está identificado no perfil.
- Manter `bio: null` enquanto não existir texto aprovado. Posteriormente, adicionar a mesma chave em `team.bios` nos dois idiomas e referenciá-la no campo `bio`. O TypeScript exige paridade das chaves utilizáveis.
- Não inventar formação, qualificações, datas ou biografias. A ausência de biografia omite a secção, sem mensagens provisórias públicas.

### Normas gerais

- Registar a origem e a licença dos recursos finais.
- Não usar imagens de terceiros como conteúdo definitivo sem autorização adequada.
- Optimizar dimensões, formato e compressão antes da publicação.
- Escrever texto alternativo que descreva o conteúdo e a intenção relevantes.
- Nomes de ficheiro devem ser estáveis, descritivos e sem dados pessoais desnecessários.

## Contactos e dados sensíveis

- Confirmar endereços, telefones, correio electrónico e nomes antes de publicar.
- Não inserir credenciais, dados privados de clientes ou informação contratual no repositório.
- O contacto actual abre o programa de correio do visitante e não declara que a mensagem foi enviada.
- Formulários futuros não podem transmitir ou recolher dados sem um plano de privacidade e tratamento aprovado.
- Tratar documentação, comentários, dados de exemplo e prompts versionados como conteúdo público.

## Revisão editorial

Antes de aceitar conteúdo:

1. Confirmar exactidão factual e autorização.
2. Rever ortografia, consistência e tom nos dois idiomas.
3. Verificar comprimentos reais no desenho responsivo.
4. Confirmar imagens, alternativas textuais e créditos.
5. Testar ligações, correio electrónico e telefones.
