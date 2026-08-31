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

Os dados residem actualmente em `src/data/projects.ts`. Uma mudança de modelo exige actualizar tipos, consumidores, traduções relevantes, testes e `PROJECT_MAP.md`.

## Imagens e direitos

- Registar a origem e a licença dos recursos finais.
- Não usar imagens de terceiros como conteúdo definitivo sem autorização adequada.
- Optimizar dimensões, formato e compressão antes da publicação.
- Escrever texto alternativo que descreva o conteúdo e a intenção relevantes.
- Nomes de ficheiro devem ser estáveis, descritivos e sem dados pessoais desnecessários.

## Contactos e dados sensíveis

- Confirmar endereços, telefones, correio electrónico e nomes antes de publicar.
- Não inserir credenciais, dados privados de clientes ou informação contratual no repositório.
- Formulários futuros não podem recolher dados sem um plano de privacidade e tratamento aprovado.

## Revisão editorial

Antes de aceitar conteúdo:

1. Confirmar exactidão factual e autorização.
2. Rever ortografia, consistência e tom nos dois idiomas.
3. Verificar comprimentos reais no desenho responsivo.
4. Confirmar imagens, alternativas textuais e créditos.
5. Testar ligações, correio electrónico e telefones.
