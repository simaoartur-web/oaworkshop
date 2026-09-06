# Mapa do projecto

> **Finalidade:** localizar responsabilidades sem explorar repetidamente todo o repositório.
> **Regra:** actualizar este mapa na mesma alteração que cria, move, elimina ou redefine um ficheiro.

## Entrada rápida por tarefa

| Tarefa | Começar por | Consultar também |
|---|---|---|
| Alterar rotas ou estrutura global | `src/App.tsx` | `src/main.tsx`, páginas afectadas |
| Alterar a página inicial | `src/pages/Home.tsx` | `src/components/home/`, `src/data/projects.ts` |
| Alterar listagem de projectos | `src/pages/Projects.tsx` | `src/data/projects.ts`, `src/pages/ProjectDetail.tsx` |
| Alterar cabeçalho ou navegação | `src/components/layout/Header.tsx` | `src/App.tsx`, `src/locales/` |
| Alterar rodapé | `src/components/layout/Footer.tsx` | `src/locales/` |
| Alterar aparência global | `src/index.css` | `docs/DESIGN_SYSTEM.md` |
| Planear, rever ou implementar design/UI/UX | `docs/DESIGN_SYSTEM.md` | `docs/OA_Design_Mastery_Playbook.md`, `docs/DESIGN_STUDY.md`, plano da tarefa |
| Alterar textos PT/EN | `src/locales/pt.ts`, `src/locales/en.ts` | `src/i18n.ts`, `docs/CONTENT_GUIDE.md` |
| Alterar dados de projectos | `src/data/projects.ts` | páginas e mapas consumidores |
| Alterar equipa e perfis | `src/components/home/TeamSection.tsx`, `src/data/team.ts` | `TeamMember.tsx`, `TeamAvatar.tsx`, `TeamProfilePanel.tsx`, `team.css`, `src/locales/` |
| Alterar imagens públicas | `public/` | componente consumidor, `docs/CONTENT_GUIDE.md` |
| Alterar publicação | `.github/workflows/deploy.yml` | `vite.config.ts`, `CNAME`, `public/CNAME` |
| Preparar trabalho novo | `plans/README.md` | `AGENTS.md`, modelo de plano |
| Criar um prompt | `prompts/README.md` | modelo em `prompts/templates/` |

## Raiz e configuração

| Caminho | Responsabilidade | Estado |
|---|---|---|
| `README.md` | visão geral, arranque e fontes de verdade | activo |
| `AGENTS.md` | regras obrigatórias dos agentes | activo |
| `CONTRIBUTING.md` | fluxo de contribuição, branches e integração | activo |
| `PROJECT_MAP.md` | este índice estrutural | activo |
| `package.json` | scripts e dependências do front-end | activo |
| `package-lock.json` | resolução reprodutível das dependências | gerado, versionado |
| `vite.config.ts` | configuração do Vite e base pública | activo |
| `eslint.config.js` | análise estática de TypeScript e React | activo |
| `postcss.config.js` | integração PostCSS/Tailwind | activo |
| `tsconfig.json` | referências dos projectos TypeScript | activo |
| `tsconfig.app.json` | TypeScript da aplicação | activo |
| `tsconfig.node.json` | TypeScript das ferramentas | activo |
| `index.html` | documento HTML de entrada | activo |
| `CNAME`, `public/CNAME` | domínio personalizado no GitHub Pages | activo; manter sincronizados |

## Aplicação

| Caminho | Responsabilidade | Consumidores principais |
|---|---|---|
| `src/main.tsx` | montagem React, `HashRouter`, estilos e i18n | navegador |
| `src/App.tsx` | estrutura global, rotas e transições entre páginas | `src/main.tsx` |
| `src/index.css` | tokens Tailwind, estilos base e utilitários globais | `src/main.tsx` |
| `src/i18n.ts` | inicialização e selecção de idioma | aplicação inteira |
| `src/vite-env.d.ts` | tipos de ambiente do Vite | TypeScript |

## Páginas

| Caminho | Responsabilidade |
|---|---|
| `src/pages/Home.tsx` | composição da página inicial e das secções temáticas |
| `src/pages/Projects.tsx` | catálogo geral de projectos |
| `src/pages/ProjectDetail.tsx` | detalhe de um projecto identificado pela rota |

Não existe página administrativa. Qualquer proposta para a criar exige novo plano e a revogação aprovada da decisão front-end primeiro.

## Componentes

| Zona | Ficheiros | Responsabilidade |
|---|---|---|
| `src/components/layout/` | `Header.tsx`, `Footer.tsx` | navegação e enquadramento persistente |
| `src/components/home/HeroSection.tsx` | apresentação inicial e imagem de entrada | página inicial |
| `src/components/home/WorkshopSection.tsx` | narrativa e apresentação do atelier | página inicial |
| `src/components/home/ProjectsSection.tsx` | chamada editorial para projectos | página inicial |
| `src/components/home/CategoryMapSection.tsx` | mapa e cartões por disciplina | página inicial, dados de projectos |
| `src/components/home/NewsSection.tsx` | carrossel editorial/notícias locais | página inicial |
| `src/components/home/ContactSection.tsx` | informação e acção de contacto | página inicial |
| `src/components/home/ExpertiseSection.tsx` | apresentação de competências | disponível; confirmar consumidor antes de alterar |
| `src/components/home/StatsSection.tsx` | indicadores animados | secções da página inicial |
| `src/components/home/TeamSection.tsx` | organograma público bilingue da equipa | página inicial, depois de Journal e antes de Contactos |
| `src/components/home/TeamMember.tsx` | perfil resumido e abertura acessível por pessoa | TeamSection |
| `src/components/home/TeamAvatar.tsx` | estados de carregamento do retrato local e iniciais automáticas, incluindo falha de imagem | TeamMember, TeamProfilePanel |
| `src/components/home/TeamProfilePanel.tsx` | diálogo lateral com informação e ligações sociais, foco, fecho e restauro de scroll | TeamSection |
| `src/components/home/team.css` | estilos exclusivos da equipa e do diálogo, movimento reduzido | TeamSection |

## Dados, idiomas e recursos

Equipa: `src/data/team.ts` contém identificadores, nomes públicos, referências tipadas de cargo/categoria/biografia, imagem opcional, ligações HTTPS confirmadas, liderança e ordem editorial. Os textos pertencem a `src/locales/pt.ts` e `src/locales/en.ts`. Não existe serviço remoto de perfis ou redes sociais.

| Caminho | Responsabilidade | Regra de alteração |
|---|---|---|
| `src/data/projects.ts` | fonte local tipada de identificadores, recursos e localização de projectos | manter identificadores únicos; conteúdo público traduzível pertence a `src/locales/` |
| `src/locales/en.ts` | textos da interface em inglês | manter as mesmas chaves de `pt.ts` |
| `src/locales/pt.ts` | textos da interface em português | seguir `docs/CONTENT_GUIDE.md` |
| `public/logo.png` | logótipo público | não substituir sem validação visual |
| `public/images/` | imagens locais por tema e equipa | optimizar e fornecer texto alternativo no consumidor |

## Documentação e processo

| Caminho | Responsabilidade |
|---|---|
| `docs/DESIGN_SYSTEM.md` | filosofia visual, tokens e comportamento |
| `docs/OA_Design_Mastery_Playbook.md` | playbook original integral; princípios gerais de design e UX |
| `docs/DESIGN_STUDY.md` | estudo aplicado à O+A, fontes, limitações e método de auto-estudo |
| `docs/CONTENT_GUIDE.md` | voz, idiomas, conteúdo e imagens |
| `docs/QUALITY.md` | verificações técnicas, visuais e de acessibilidade |
| `docs/decisions/` | decisões arquitecturais duradouras |
| `plans/` | planos numerados, aprovação e estado |
| `plans/124-design-mastery-playbook.md` | integração das referências de design nas instruções dos agentes |
| `prompts/` | normas e modelos de prompts |

## Publicação

| Caminho | Responsabilidade |
|---|---|
| `.github/workflows/deploy.yml` | instala, compila e publica `dist/` no GitHub Pages em alterações de `main` |

## Caminhos deliberadamente inexistentes

- `backend/` — removido; proibido durante a fase front-end primeiro.
- páginas e clientes do CMS anterior — removidos; não fazem parte da árvore activa.
- `.env.example` — removido por não existirem variáveis de ambiente necessárias.

## Exclusões de exploração

Não inspeccionar por rotina:

- `node_modules/` — dependências instaladas;
- `dist/` — resultado gerado da compilação;
- `.git/` — armazenamento interno do Git.

Usar `rg` e caminhos específicos quando o mapa não for suficiente.
