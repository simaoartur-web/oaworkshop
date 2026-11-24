# Roadmap de Evolução de Produto — O+A Workspace (Fases 09–14)

- **Estado:** **DOCUMENTO ESTRATÉGICO DE REFERÊNCIA** *(nenhuma fase abaixo está autorizada ou em execução; cada fase exigirá RFC/plano próprio e aprovação humana expressa)*
- **Linha de Base Canónica:** `codex/f02-integration-preview` (`1abaa9d` — Versão Demonstrativa Fases 00–07 concluída; Fase 08 planeada em `plans/021-phase-08-product-refinement-and-user-experience.md`)
- **Princípio de Continuidade:** Preservar integralmente o front-end minimalista O+A, os contratos canónicos de domínio e o isolamento estrito face ao website público `oaworkshop` (`main`).

---

## Visão Sequencial (Fases 09–14)

| Fase | Nome | Foco Estratégico | Pré-requisito Obrigatório |
|---|---|---|---|
| **Fase 09** | **Arquitectura de Backend, Persistência & RFC Fundacional** | Desenho e aprovação do RFC de backend, modelo relacional/documental, API versionada, migração dos repositórios locais (`oa_workspace_*_v1`) para adaptadores remotos mantendo modo offline/demo isolado | Fase 08 concluída + RFC aprovado em `docs/DECISIONS.md` |
| **Fase 10** | **Autenticação Real, Identidade & Controlo de Acessos (RBAC)** | Substituição da sessão demonstrativa por autenticação corporativa (SSO / OIDC / MFA), sessões seguras no servidor, RBAC efectivo por papel (`director`..`staff`) e trilho de auditoria imutável | Fase 09 concluída |
| **Fase 11** | **Gestão Documental Real & Pipeline de Activos 3D/CAD** | Armazenamento privado de ficheiros (object storage com URLs assinadas e controlo de vírus/quotas), versionamento real de desenhos/PDFs/modelos `.glb`/`.gltf` e referência segura a fontes `.skp`/BIM | Fases 09–10 concluídas |
| **Fase 12** | **Colaboração Multi-Utilizador, Notificações & Google Calendar** | Sincronização em tempo real entre Maputo e Milão, notificações persistentes accionáveis, comentários/menções em dossiers e tarefas, e integração **Google Calendar** (OAuth 2.0 + PKCE no backend, `Africa/Maputo` & `Europe/Rome`, gestão de conflitos conforme `docs/INTEGRATION_FUTURE.md` §4) | Fases 09–10 concluídas + consentimento OAuth aprovado |
| **Fase 13** | **Pipeline Editorial Seguro para `oa-workshop.com`** | Ligação sanitizada e unidireccional do módulo `08 Publicações` para o website público `oaworkshop` via contrato `PublicPortfolioProjection` (`docs/INTEGRATION_FUTURE.md` §1–§3), com aprovação dupla, pré-visualização staging e preservação integral de SEO/prerender/WebP | Fases 09–11 concluídas + aprovação de governança de publicação |
| **Fase 14** | **Operação em Produção, Observabilidade & Endurecimento** | Monitorização, logs estruturados sem PII, backups e recuperação de desastres, testes de carga, auditoria externa de segurança e certificação formal de acessibilidade WCAG 2.2 AA com tecnologias assistivas (NVDA/JAWS/VoiceOver) | Fases 09–13 concluídas |

---

## Detalhamento por Fase

### Fase 09 — Arquitectura de Backend, Persistência & RFC Fundacional
- **Objectivo:** Criar a camada de servidor e base de dados sem reescrever a interface nem misturar lógica de negócio nos componentes React.
- **Entregas previstas:** RFC arquitectónico (`ADR`), esquema de dados normalizado (Projectos, Revisões, Tarefas, Departamentos, Equipa, Biblioteca Técnica, Publicações, Actividade), camada de API tipada e estratégia de migração limpa a partir dos repositórios existentes.
- **Risco principal:** Deriva de contratos entre frontend e API. **Mitigação:** derivar schemas partilhados a partir dos tipos canónicos já estáveis (`src/data/*Types.ts`).

### Fase 10 — Autenticação Real, Identidade & Controlo de Acessos (RBAC)
- **Objectivo:** Converter os `6` papéis demonstrativos em políticas de autorização efectivamente aplicadas no servidor.
- **Entregas previstas:** Login corporativo seguro (cookies `HttpOnly`/`Secure`/`SameSite`, zero tokens em `localStorage`), gestão de utilizadores/departamentos, permissões granulares por acção (ex.: apenas `director`/`communications` podem aprovar/publicar) e registo de auditoria com actor real.
- **Risco principal:** Fuga de dados entre papéis ou regressão na ergonomia de entrada. **Mitigação:** testes negativos de autorização no backend + preservação da entrada serena O+A.

### Fase 11 — Gestão Documental Real & Pipeline de Activos 3D/CAD
- **Objectivo:** Permitir upload, versionamento e consulta segura de documentos técnicos e modelos 3D reais entre estúdios.
- **Entregas previstas:** Object storage privado com URLs assinadas de curta duração, validação de assinaturas binárias no servidor (`.glb`/`.gltf`, PDFs, imagens), optimização/LOD opcional para WebGL e ligação controlada a ficheiros fonte `.skp`/CAD sem promessa falsa de renderização nativa de `.skp`.
- **Risco principal:** Ficheiros pesados degradarem performance em rede móvel. **Mitigação:** manter lazy-loading estrito de `/model` e quotas explícitas por ficheiro/projecto.

### Fase 12 — Colaboração Multi-Utilizador, Notificações & Google Calendar
- **Objectivo:** Tornar a coordenação diária Maputo–Milão verdadeiramente síncrona e interoperável com a agenda externa da equipa.
- **Entregas previstas:** Eventos em tempo real (SSE/WebSockets), centro de notificações real ligado a menções/prazos/decisões editoriais, e implementação backend-driven do **Google Calendar** respeitando integralmente os 6 requisitos de `docs/INTEGRATION_FUTURE.md` §4 (OAuth 2.0 + PKCE, selecção explícita de calendário, fusos `Africa/Maputo` / `Europe/Rome`, revogação imediata e idempotência por `etag`).
- **Risco principal:** Conflitos de fuso horário (DST europeu) e duplicação de eventos. **Mitigação:** testes determinísticos de fronteira DST e tabela de correlação `internalEventId ↔ googleEventId`.

### Fase 13 — Pipeline Editorial Seguro para `oa-workshop.com`
- **Objectivo:** Transformar a curadoria interna (`08 Publicações`) num fluxo real e seguro de publicação para o website público, mantendo privacidade por omissão.
- **Entregas previstas:** Exportação exclusiva dos campos de `PublicPortfolioProjection` (excluindo estritamente clientes confidenciais, tarefas, revisões internas, `.skp`/`.glb` privados e notas internas), geração de PR/staging automático no repositório público e verificação automática de SEO, slugs bilingues e `sitemap.xml`.
- **Risco principal:** Exposição acidental de material privado no site público. **Mitigação:** allowlist estrita de campos + dupla aprovação (`communications` + `director`) + revisão humana antes de deploy público.

### Fase 14 — Operação em Produção, Observabilidade & Endurecimento
- **Objectivo:** Garantir resiliência operacional, conformidade e confiança de longo prazo em produção.
- **Entregas previstas:** Telemetria de erros e latência sem PII, backups encriptados com testes periódicos de restauro, testes de penetração/segurança OWASP e auditoria formal de acessibilidade WCAG 2.2 AA com utilizadores e leitores de ecrã reais.

---

## Fronteira de Governança

Nenhuma fase deste roadmap pode ser iniciada automaticamente. Cada transição requer:
1. Conclusão e encerramento formal da fase anterior;
2. Plano dedicado em `plans/` (e ADR em `docs/DECISIONS.md` quando envolver backend/infraestrutura);
3. Aprovação expressa do responsável humano.
