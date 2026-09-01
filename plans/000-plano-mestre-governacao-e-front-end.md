# Plano mestre de governação e conclusão do front-end

> **Estado:** CANÓNICO
> **Data:** 31 de Agosto de 2026
> **Aprovação:** concedida pelo utilizador em 31 de Agosto de 2026
> **Aceitação canónica:** concedida pelo utilizador em 31 de Agosto de 2026
> **Decisão de base:** o projecto será exclusivamente front-end até este estar concluído e aceite

## 1. Objectivo

Preparar o projecto O+A Workshop para um desenvolvimento disciplinado, previsível e fácil de retomar por pessoas ou agentes. A primeira etapa remove a dependência de back-end e transforma o repositório numa aplicação React/Vite inteiramente estática. Em paralelo, estabelece fontes de verdade para regras, design, estrutura, planeamento, colaboração e gestão de prompts.

Este plano só pode passar a execução depois de o utilizador o aprovar expressamente. Qualquer alteração material de âmbito exige uma nova aprovação.

## 2. Estado actual observado

- A aplicação pública usa React 19, TypeScript, Vite 7, Tailwind CSS 4, Framer Motion, `react-i18next`, React Router e Leaflet.
- O conteúdo principal já pode ser apresentado a partir de dados locais em `src/data/projects.ts`.
- O repositório continha um CMS com servidor próprio.
- O front-end dependia desse servidor através de uma área administrativa, um cliente HTTP, configuração local e referências documentais.
- A publicação actual é estática, por GitHub Pages, e ocorre quando há alterações em `main`.
- A branch activa, `Side-Oa-workshop`, já é diferente de `main`.
- Existem alterações locais não registadas, incluindo alterações extensas no back-end e no painel administrativo. Estas alterações não podem ser eliminadas sem uma decisão explícita sobre a sua preservação.

## 3. Resultado pretendido

No fim da execução aprovada:

1. O projecto não contém nem executa qualquer back-end.
2. O site público funciona apenas com dados e recursos locais.
3. Não existem rotas, clientes HTTP, variáveis de ambiente ou elementos de navegação que dependam do CMS anterior.
4. Todas as regras permanentes estão centralizadas em `AGENTS.md` e nos documentos por ele referenciados.
5. Qualquer agente consulta `PROJECT_MAP.md` antes de procurar ficheiros no repositório.
6. Todos os planos ficam guardados em `plans/`, com estado, critérios de aceitação e registo de aprovação.
7. O trabalho ocorre sempre numa branch alternativa; `main` só recebe trabalho verificado e declarado canónico pelo utilizador.
8. O front-end mantém uma linguagem visual coerente, acessível, responsiva e fiel à identidade O+A.

## 4. Estrutura documental proposta

```text
/
├── AGENTS.md                         # Regras obrigatórias para qualquer agente
├── CONTRIBUTING.md                   # Fluxo de contribuição para pessoas e agentes
├── PROJECT_MAP.md                    # Índice autorizado da estrutura e finalidade dos ficheiros
├── README.md                         # Arranque, comandos e visão geral do projecto
├── docs/
│   ├── DESIGN_SYSTEM.md              # Filosofia visual, tokens, componentes e movimento
│   ├── CONTENT_GUIDE.md              # Voz, idiomas, imagens e regras editoriais
│   ├── QUALITY.md                    # Testes, acessibilidade, desempenho e validação
│   └── decisions/
│       └── README.md                 # Índice de decisões arquitecturais (ADR)
├── plans/
│   ├── README.md                     # Índice, estados e modelo obrigatório dos planos
│   └── NNN-titulo-do-plano.md        # Planos numerados e pesquisáveis
├── prompts/
│   ├── README.md                     # Regras de composição, versão e arquivo de prompts
│   └── templates/
│       ├── feature.md
│       ├── fix.md
│       ├── review.md
│       └── research.md
├── public/                            # Recursos públicos estáticos
├── src/                               # Código do front-end
└── .github/workflows/                 # Validação e publicação
```

Os nomes técnicos permanecem em inglês para serem inequívocos no ecossistema de desenvolvimento; a documentação explicativa será redigida em português de Portugal.

### 4.1. `AGENTS.md`

Será a fonte de verdade para o comportamento dos agentes. Deve conter, no mínimo, as seguintes regras:

- Ler primeiro `AGENTS.md`, depois `PROJECT_MAP.md` e apenas depois os documentos específicos da tarefa.
- Não executar um plano sem aprovação expressa do utilizador.
- Não trabalhar directamente em `main`.
- Preservar alterações existentes e inspeccionar o estado do Git antes de editar.
- Não introduzir back-end, base de dados, autenticação, API ou serviço externo durante a fase “front-end primeiro”.
- Consultar `docs/DESIGN_SYSTEM.md` antes de alterar interfaces.
- Actualizar `PROJECT_MAP.md` quando um ficheiro for criado, movido, eliminado ou mudar de responsabilidade.
- Actualizar o plano activo durante a execução, mantendo decisões e desvios visíveis.
- Executar as verificações definidas em `docs/QUALITY.md` antes de declarar trabalho concluído.
- Não guardar segredos, credenciais, dados pessoais ou tokens em código, documentação, prompts ou registos.
- Parar e pedir nova aprovação quando surgir uma acção destrutiva não prevista, um conflito com alterações do utilizador ou uma expansão material do âmbito.

Os prompts antigos eram centrados no CMS e entravam em conflito com a nova direcção. Depois de preservado o histórico necessário, foram removidos; não são usados como regras activas.

### 4.2. `CONTRIBUTING.md`

Definirá:

- convenções de branches, commits e pedidos de integração;
- ciclo obrigatório “pedido → plano → aprovação → execução → verificação → aceitação → integração”;
- critérios de revisão e lista de verificações;
- política de alterações pequenas e commits atómicos;
- tratamento de conflitos, regressões e reversões;
- obrigação de manter documentação, traduções e mapa estrutural sincronizados.

### 4.3. `PROJECT_MAP.md`

Este ficheiro evitará explorações repetidas de todo o repositório. Será curto, actual e orientado à acção. Para cada zona ou ficheiro relevante registará:

- caminho exacto;
- responsabilidade;
- principais importações e consumidores;
- tipo de alteração que ali pertence;
- documento ou teste que deve ser consultado;
- estado: activo, temporário, obsoleto ou reservado.

Protocolo obrigatório do agente:

1. Procurar o alvo em `PROJECT_MAP.md`.
2. Abrir apenas os ficheiros mapeados e as dependências directas necessárias.
3. Só fazer uma pesquisa mais ampla se o mapa estiver incompleto ou demonstravelmente desactualizado.
4. Corrigir o mapa na mesma alteração estrutural que o tornou desactualizado.

O mapa não deve listar `node_modules/`, `dist/` ou todos os recursos individualmente; deve mapear responsabilidades, não produzir ruído.

### 4.4. `docs/DESIGN_SYSTEM.md`

A filosofia visual será extraída do próprio site e formalizada nestes princípios:

- **Expressão:** minimalismo arquitectónico e editorial; composição calma, precisa e intencional.
- **Paleta:** fundos quase pretos (`#050505` e `#111111`), branco e cinzentos refinados, com terracota (`#A65D4A`) como acento controlado.
- **Tipografia:** Outfit para clareza contemporânea; Playfair Display apenas como contraste editorial e expressivo.
- **Composição:** grelhas rigorosas, espaço negativo generoso, linhas finas, hierarquia nítida e imagens de grande escala.
- **Interacção:** movimento lento e subtil, com aceleração suave; nenhuma animação deve atrasar uma tarefa ou competir com o conteúdo.
- **Imagem:** tratamento sóbrio, enquadramento arquitectónico, transições graduais e uso criterioso de escala ou cinzento-cor.
- **Texto funcional:** etiquetas pequenas em maiúsculas e espaçamento amplo, sem comprometer legibilidade.
- **Consistência:** cores, espaçamentos, tipografia, raios, sombras, durações e curvas de animação passam a tokens reutilizáveis.
- **Acessibilidade:** contraste suficiente, foco visível, navegação por teclado, texto alternativo, HTML semântico e respeito por `prefers-reduced-motion`.
- **Responsividade:** cada componente deve ser concebido e verificado em telemóvel, tablet e computador, sem depender apenas da redução proporcional.

Não serão aceites componentes genéricos que pareçam pertencer a outro produto, efeitos decorativos gratuitos, excesso de movimento, cores fora da paleta ou valores visuais duplicados sem token.

## 5. Gestão eficiente e inteligente de prompts

Os prompts deixam de ser documentos monolíticos que repetem todo o contexto. O contexto será disposto por camadas:

1. `AGENTS.md` contém regras permanentes e invariantes.
2. `PROJECT_MAP.md` contém a localização e a responsabilidade dos ficheiros.
3. `docs/` contém design, conteúdo e qualidade.
4. O plano activo contém decisões, âmbito e critérios de aceitação da iniciativa.
5. O prompt da tarefa contém apenas a acção concreta e ligações para as fontes de verdade relevantes.

Cada prompt operacional usará este contrato mínimo:

```markdown
# Objectivo
# Fontes de verdade a consultar
# Âmbito incluído
# Fora do âmbito
# Restrições e decisões já aprovadas
# Critérios de aceitação observáveis
# Verificações obrigatórias
# Entrega esperada
# Aprovação necessária
```

Regras adicionais:

- Um prompt trata um objectivo verificável; tarefas independentes recebem planos ou prompts separados.
- Referenciar ficheiros em vez de copiar grandes blocos de conteúdo.
- Declarar expressamente o que não deve ser alterado.
- Converter termos vagos, como “melhorar”, em critérios observáveis.
- Incluir comandos de validação e comportamento esperado.
- Registar decisões duradouras em `docs/decisions/`, não deixá-las escondidas no histórico de uma conversa.
- Versionar prompts com o Git; manter um único modelo activo por tipo e arquivar modelos substituídos.
- Remover instruções obsoletas ou contraditórias logo que a substituição seja aprovada.
- Nunca incluir credenciais, dados confidenciais ou conteúdo de produção desnecessário.

## 6. Protocolo obrigatório de planeamento e aprovação

Todo o trabalho que altere o projecto seguirá esta sequência:

1. **Pedido:** registar o objectivo, restrições e resultado esperado.
2. **Inspecção limitada:** consultar `PROJECT_MAP.md`, o estado do Git e apenas os ficheiros necessários para elaborar o plano.
3. **Plano:** criar ou actualizar um ficheiro em `plans/` com âmbito, riscos, ficheiros previstos, critérios de aceitação e verificações.
4. **Aprovação:** aguardar uma confirmação inequívoca do utilizador, preferencialmente `APROVADO: plans/<ficheiro>.md`.
5. **Branch:** confirmar que a execução decorrerá numa branch alternativa adequada e que as alterações existentes estão protegidas.
6. **Execução:** efectuar apenas as alterações aprovadas e manter o plano actualizado.
7. **Verificação:** executar testes, compilação, análise estática e validação visual proporcionais ao risco.
8. **Entrega:** apresentar resumo, ficheiros alterados, verificações, limitações e diferenças face ao plano.
9. **Aceitação canónica:** o utilizador decide se a branch é a candidata canónica.
10. **Integração:** só depois dessa decisão a branch pode ser integrada em `main`.

Estados normalizados dos planos:

`RASCUNHO` → `PROPOSTO` → `APROVADO` → `EM EXECUÇÃO` → `EM VALIDAÇÃO` → `CONCLUÍDO` → `CANÓNICO`

Também podem ser usados `BLOQUEADO`, `SUBSTITUÍDO` e `CANCELADO`, sempre com uma justificação.

## 7. Estratégia de branches e integração

- `main` representa sempre a versão canónica e publicável.
- Nenhuma alteração de desenvolvimento é feita directamente em `main`.
- O trabalho dos agentes usa, por omissão, `codex/<tipo>-<descrição-curta>`; exemplos: `codex/docs-governance`, `codex/chore-remove-backend` e `codex/feature-project-gallery`.
- Uma branch nasce da versão canónica mais recente, salvo decisão expressa em contrário.
- Cada branch deve corresponder a um plano aprovado ou a uma correcção pequena claramente identificada.
- Antes da integração: actualizar a branch, resolver conflitos conscientemente, executar todas as verificações e apresentar o resultado ao utilizador.
- A declaração de que a branch é canónica cabe ao utilizador. Só então se integra em `main`.
- A integração não apaga automaticamente a branch; a eliminação será uma decisão separada e recuperável quando possível.
- Nunca serão usados `force push`, reescrita destrutiva de histórico ou comandos que descartem alterações sem autorização explícita.

## 8. Plano de remoção do back-end

### Fase 0 — Salvaguarda obrigatória

Antes de qualquer eliminação:

1. Apresentar a lista exacta de alterações locais relacionadas com o back-end.
2. Pedir ao utilizador que escolha como preservá-las: branch/commit de arquivo, `git diff` guardado como patch fora da árvore activa, ou descarte consciente.
3. Confirmar a branch de execução.
4. Registar a decisão no plano e, se necessário, num ADR.

Esta fase é obrigatória porque o estado actual contém trabalho não registado. A intenção geral de remover o back-end não autoriza a perda silenciosa dessas alterações.

### Fase 1 — Desligar o front-end

- Retirar a rota `/admin` de `src/App.tsx`.
- Retirar a ligação de área reservada de `src/components/layout/Footer.tsx`.
- Remover a página administrativa e o cliente HTTP anterior, depois de confirmar que não têm consumidores restantes.
- Remover configuração de ligação ao servidor e actualizar ou eliminar o exemplo de ambiente se deixar de ter variáveis úteis.
- Remover configurações que apenas ignoram ou observam `backend/` em Vite e ESLint.
- Garantir que páginas, projectos, investigação, equipa e restantes secções usam apenas dados locais tipados.
- Manter a possibilidade de um back-end futuro apenas como decisão documental; não deixar adaptadores, autenticação ou código morto “para mais tarde”.

### Fase 2 — Remover o back-end e documentação obsoleta

- Eliminar o directório `backend/` depois da salvaguarda aprovada.
- Remover ou arquivar os prompts operacionais obsoletos.
- Remover referências activas ao CMS anterior, à sua API, às portas locais e ao painel administrativo.
- Actualizar `README.md`, `PROJECT_MAP.md`, `.gitignore`, fluxos de CI e documentação afectada.
- Não remover dependências do sistema operativo, serviços externos ou dados fora deste repositório.

### Fase 3 — Verificação do projecto exclusivamente front-end

- Confirmar que não existe dependência de execução ou compilação de back-end.
- Executar `npm ci`, `npm run lint` e `npm run build`.
- Verificar visualmente página inicial, lista de projectos, detalhe de projecto, navegação, alternância de idioma e ligações internas.
- Verificar pelo menos larguras de 375 px, 768 px e 1440 px.
- Confirmar ausência de erros na consola e de pedidos de rede para a API anterior.
- Confirmar que a publicação estática do GitHub Pages continua funcional.

## 9. Planos subsequentes propostos

Depois de concluída a governação inicial, cada iniciativa terá o seu próprio ficheiro em `plans/`:

| Ordem | Plano | Resultado principal |
|---:|---|---|
| 001 | Governação documental | Criar regras, contribuição, mapa, índice de planos e modelos de prompts |
| 010 | Retirada do back-end | Obter uma aplicação exclusivamente estática e sem código morto |
| 020 | Auditoria de design | Consolidar tokens, componentes e regras da identidade O+A |
| 030 | Arquitectura de informação | Rever páginas, navegação, hierarquia e percursos do utilizador |
| 040 | Conteúdo e internacionalização | Uniformizar PT/EN, microtexto, dados locais e fluxo editorial |
| 050 | Acessibilidade e responsividade | Alcançar navegação robusta por teclado e comportamento multi-ecrã |
| 060 | Desempenho e recursos | Optimizar imagens, fontes, animações, mapa e carregamento inicial |
| 070 | Qualidade e testes | Introduzir testes unitários, de integração visual e ponta-a-ponta |
| 080 | SEO e publicação | Metadados, partilha social, `sitemap`, domínio e controlo de publicação |
| 900 | RFC de back-end futuro | Só depois do front-end canónico: necessidades, alternativas, segurança e migração |

### Recomendações adicionais

- Criar `docs/CONTENT_GUIDE.md` antes de aumentar o volume de conteúdo, para manter voz e traduções consistentes.
- Adoptar ADRs curtos para decisões difíceis de reverter: roteamento, origem de conteúdo, biblioteca de mapas e eventual back-end.
- Acrescentar validação contínua em branches e pedidos de integração; a publicação continua reservada a `main`.
- Criar uma pequena biblioteca de componentes de interface apenas quando houver padrões repetidos, evitando abstracções prematuras.
- Definir orçamentos de desempenho para imagens, JavaScript e animações.
- Introduzir testes visuais das páginas críticas antes de grandes refactorizações de design.
- Rever acessibilidade e movimento reduzido em todas as novas secções, não apenas no fim do projecto.

## 10. Critérios de aceitação deste programa

O programa é aceite quando:

- a preservação ou o descarte das alterações actuais do back-end foi decidido explicitamente;
- o directório `backend/` e todas as dependências de execução associadas desapareceram;
- o site compila, passa a análise estática e funciona sem API;
- `AGENTS.md`, `CONTRIBUTING.md`, `PROJECT_MAP.md`, `docs/`, `plans/` e `prompts/` existem e não se contradizem;
- o mapa estrutural permite localizar cada responsabilidade principal sem explorar todo o repositório;
- as regras de design reflectem a interface existente e incluem acessibilidade e responsividade;
- cada plano contém aprovação, estado, âmbito, riscos, critérios de aceitação e verificações;
- nenhuma alteração foi feita directamente em `main`;
- o utilizador reviu o resultado e declarou a branch candidata como canónica antes da integração.

## 11. Decisões aplicadas

1. As alterações locais anteriores foram preservadas no `stash` de segurança `safety: pre-backend-removal 2026-08-31`.
2. A remoção foi registada separadamente em `Side-Oa-workshop` e `main`, sem reescrever histórico.
3. O utilizador determinou que o back-end fosse removido primeiro de todas as branches activas.
4. A área reservada, a rota administrativa, o painel, a variável de API e as respectivas referências foram removidos.
5. A governação documental prosseguiu em `Side-Oa-workshop`, mantendo `main` apenas com a retirada prioritária já autorizada.

## 12. Registo de execução

- `Side-Oa-workshop`: commit `51f659c` — remoção do back-end e integração administrativa.
- `main`: commit `53f67df` — remoção equivalente, adaptada à estrutura própria dessa branch.
- `origin/Side-Oa-workshop` e `origin/main`: actualizadas sem `force push`.
- Verificação estrutural: zero ficheiros sob `backend/` nas quatro referências activas.
- `Side-Oa-workshop`: `npm run lint` e `npm run build` concluídos com sucesso.
- `main`: `npm run build` concluído com sucesso; `npm run lint` mantém duas falhas anteriores e fora do âmbito em `StatsSection.tsx` e `Header.tsx`.
- Governação em `Side-Oa-workshop`: `git diff --check`, pesquisa de acoplamentos, `npm run lint` e `npm run build` concluídos com sucesso.
- Observação de desempenho: a compilação assinala um bloco JavaScript superior a 500 kB; a optimização pertence ao plano 060.
- Salvaguarda: o `stash` não foi eliminado e pode ser inspeccionado ou recuperado.
- Aceitação canónica: confirmada pelo utilizador; integração em `main` autorizada.
