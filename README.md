# O+A Architecture and Planners

Site institucional e portefólio da O+A, desenvolvido como aplicação front-end estática com React, TypeScript e Vite.

## Estado do projecto

- O projecto é exclusivamente front-end.
- O conteúdo é local e versionado com o código.
- Não existe back-end, API, base de dados, autenticação ou área administrativa.
- A publicação é feita através do GitHub Pages a partir de `main`.

Qualquer reintrodução de back-end exige um plano próprio, análise de necessidades, aprovação expressa do utilizador e uma decisão arquitectural registada.

## Começar

Requisitos: Node.js 20 ou posterior e npm.

```bash
npm ci
npm run dev
```

Comandos disponíveis:

```bash
npm run dev      # servidor local de desenvolvimento
npm run lint     # análise estática
npm run build    # TypeScript e compilação de produção
npm run preview  # pré-visualização da compilação
```

## Fontes de verdade

Antes de alterar o projecto, consultar por esta ordem:

1. `AGENTS.md` — regras obrigatórias.
2. `PROJECT_MAP.md` — localização e responsabilidade dos ficheiros.
3. `plans/` — plano aprovado da iniciativa.
4. `docs/DESIGN_SYSTEM.md` — identidade e comportamento visual.
5. `docs/QUALITY.md` e `docs/CONTENT_GUIDE.md` — validação e conteúdo.

## Fluxo obrigatório

Nenhuma alteração é executada sem um plano aprovado pelo utilizador. O trabalho decorre numa branch alternativa; `main` só recebe uma versão validada e declarada canónica pelo utilizador. Consultar `CONTRIBUTING.md` para o processo completo.

## Estrutura resumida

- `src/pages/` — páginas e composição de rotas.
- `src/components/` — componentes de interface por domínio.
- `src/data/` — conteúdo estruturado local.
- `src/locales/` — traduções PT/EN.
- `public/` — imagens e recursos públicos.
- `docs/` — regras duradouras e decisões.
- `plans/` — planos, estados e aprovações.
- `prompts/` — normas e modelos de prompts.

O índice completo está em `PROJECT_MAP.md`.
