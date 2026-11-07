# Regras dos Agentes — O+A Workspace

Este repositório aloja o **O+A Workspace** (*Architectural Operating Space*), uma aplicação interna de demonstração concebida para o atelier O+A Arquitectos e Planeadores.

## 1. Isolamento obrigatório

- Este projecto é **autónomo e separado** do website público `oaworkshop` (`oa-workshop.com`).
- Nunca modificar ficheiros, rotas, SEO, `main` ou deploys do repositório público `oaworkshop` a partir deste workspace.
- Consultar `PROJECT_MAP.md` antes de explorar ficheiros. Actualizar `PROJECT_MAP.md` sempre que ficheiros forem criados, movidos ou redefinidos.

## 2. Fase tecnológica — Frontend com Mock Data Honesto

- Sem backend, Supabase, PostgreSQL, APIs privadas, OAuth, env secrets, envio de e-mail ou armazenamento remoto nesta fase.
- Nunca guardar palavras-passe (mesmo fictícias) em `localStorage`, `sessionStorage` ou `IndexedDB`.
- Nunca rotular operações simuladas como «login seguro», «e-mail enviado», «guardado na cloud» ou «publicado no website». Usar formulações transparentes: `Sessão demonstrativa local`, `Guardado neste navegador (demo)` e `Pré-visualização local`.
- Todos os colaboradores, credenciais, orçamentos e projectos são **fictícios e etiquetados como Demo**.

## 3. Direcção de Arte e Usabilidade

- Seguir `docs/DESIGN_BRIEF.md` e `docs/DESIGN_SYSTEM.md`.
- Conceito central: **um atelier, não um dashboard** — prancha técnica, escala editorial, matéria escura (`#050505`, `#111111`, `#222222`) e terracota contida (`#A65D4A`), com `Outfit` e `Playfair Display`.
- Cumprir WCAG 2.2 AA: contraste mínimo 4,5:1 para texto normal, foco visível, operação integral por teclado, áreas de toque confortáveis e respeito por `prefers-reduced-motion`.
- Conceber composições específicas para mobile (`375px`), tablet (`768px`) e desktop (`1440px+`), sem scroll horizontal.

## 4. Git, Idiomas e Qualidade

- Trabalhar em branches dedicadas (`codex/...`), nunca directamente em `main`.
- Português por omissão (grafia institucional O+A) e Inglês completo em paridade de chaves (`src/locales/pt.ts` e `src/locales/en.ts`).
- Executar `npm run lint`, `npm run test`, `npm run build` e verificação E2E visual nas larguras críticas antes de fechar cada fase.
