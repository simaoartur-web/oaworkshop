# Contrato de Integração Futura com `oa-workshop.com`

> **Estado actual:** Documental e simulado localmente. **Nenhuma ligação, sincronização ou escrita ocorre sobre o repositório público `oaworkshop` nesta fase.**

## 1. Princípio de Fronteira

O website público `oa-workshop.com` permanece estático/pré-renderizado, bilingue (`EN`/`PT`) e regido pelo seu próprio `AGENTS.md`. O **O+A Workspace** actuará no futuro como ambiente interno de preparação e curadoria, exportando **apenas representações públicas depuradas** após aprovação explícita.

## 2. Pipeline Editorial Previsto (5 Etapas)

1. **Preparação Interna (`publicationStatus = 'private'`):** A equipa cria o dossier do projecto no Workspace. Por omissão, todo o projecto nasce privado.
2. **Solicitação Editorial (`publicationStatus = 'requested'`):** O responsável preenche metadados públicos obrigatórios (título, localização, ano, área, âmbito, textos `PT` e `EN`, créditos fotográficos confirmados e textos alternativos) e submete à fila editorial. **Solicitar não publica.**
3. **Revisão de Comunicação:** Validação linguística (`PT`/`EN`), verificação de licenças de imagem e exclusão de dados confidenciais.
4. **Decisão da Direcção (`'approved' | 'rejected'`):** Aprovação ou devolução fundamentada com registo de autor e data.
5. **Projecção Pública Sanitizada (Futuro RFC):** Apenas os campos do contrato `PublicPortfolioProjection` seriam exportados, excluindo obrigatoriamente:
   - ficheiros `.skp`, `.glb` internos, CAD/BIM e PDFs técnicos privados;
   - orçamentos, horas, comentários internos, versões rascunho e nomes de clientes confidenciais;
   - histórico interno de tarefas e revisões.

## 3. Preservação de SEO do Website Público

Qualquer integração futura terá de preservar no repositório público:
- slugs estáveis, rotas bilingues e links `canonical`;
- pré-renderização estática (`scripts/prerender.mjs`), `sitemap.xml`, Open Graph e JSON-LD;
- pipeline `sharp` de optimização de imagens WebP.

---

## 4. Backlog Futuro — Integração com Google Calendar (Não Implementada)

> **Estado actual:** Registo conceptual de backlog (Fase futura com backend aprovado via RFC). **Não implementada nesta fase; zero dependências Google, zero tokens, zero APIs externas e zero controlos enganadores na UI.**

Quando existir um backend autenticado aprovado em `docs/DECISIONS.md`, a sincronização entre o calendário operacional interno (`/workspace/calendar`) e o **Google Calendar** deverá respeitar:

1. **Autorização OAuth 2.0 segura:** Fluxo Authorization Code + PKCE gerido por backend dedicado com escopos mínimos (`calendar.events` / leitura selectiva); tokens de acesso e *refresh* encriptados no servidor — **nunca** persistidos em `localStorage`, `sessionStorage` ou código cliente.
2. **Selecção de calendário:** Permitir ao utilizador/estúdio escolher explicitamente qual o calendário Google alvo (ex.: calendário dedicado «O+A Atelier» em vez do calendário pessoal por omissão).
3. **Sincronização de eventos:** Mapear de forma explícita e opt-in marcos de projecto (`project_milestone`), prazos de tarefas (`task_deadline`) e revisões de atelier (`studio_review`), distinguindo origem interna vs externa.
4. **Tratamento rigoroso de fusos horários (`Maputo` / `Milão`):** Persistir e enviar identificadores IANA oficiais (`Africa/Maputo` · `CAT` e `Europe/Rome` · `CET`/`CEST`), respeitando transições DST europeias sem desvios de dia em eventos *all-day* vs horários.
5. **Consentimento e protecção de credenciais:** Tela de consentimento explícito antes de ligar a conta, mecanismo imediato de revogação/desconexão e segregação estrita de dados privados de clientes.
6. **Gestão de conflitos e duplicações:** Chave de correlação imutável (`internalEventId` ↔ `googleEventId` + `etag` + `updatedAt`), operações idempotentes na criação/actualização e política explícita de resolução de conflitos sem sobrescrita silenciosa.
