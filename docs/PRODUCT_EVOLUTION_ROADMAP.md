# Roadmap de Evolução de Produto — O+A Workspace (Fases 09–14)

- **Estado:** **DOCUMENTO ESTRATÉGICO DE REFERÊNCIA** *(nenhuma fase abaixo está autorizada ou em execução; cada fase exigirá RFC/plano próprio e aprovação humana expressa)*
- **Linha de Base Canónica:** `codex/f02-integration-preview` (`1abaa9d` — Versão Demonstrativa Fases 00–07 concluída; Fase 08 planeada em `plans/021-phase-08-product-refinement-and-user-experience.md`)
- **Princípio de Continuidade:** Preservar integralmente o front-end minimalista O+A, os contratos canónicos de domínio e o isolamento estrito face ao website público `oaworkshop` (`main`).

> [!CAUTION]
> **Regra Obrigatória de Segurança de Dados:** É **estritamente proibido introduzir dados empresariais reais, dados confidenciais de clientes, ficheiros de obra reais ou PII de colaboradores** no O+A Workspace antes de estarem implementados, auditados e aprovados os controlos de segurança necessários nas Fases 09 e 10 (autenticação corporativa real, autorização RBAC aplicada no servidor, transporte/armazenamento encriptado, segregação de ambientes e trilho de auditoria).

---

## Visão Sequencial (Fases 09–14)

| Fase | Nome | Foco Estratégico | Pré-requisito Obrigatório |
|---|---|---|---|
| **Fase 09** | **Arquitectura de Backend, Persistência & RFC Fundacional** | Desenho e aprovação do RFC de backend, modelo relacional/documental, API versionada, migração dos repositórios locais (`oa_workspace_*_v1`) para adaptadores remotos mantendo modo offline/demo isolado | Fase 08 concluída + RFC aprovado em `docs/DECISIONS.md` |
| **Fase 10** | **Autenticação Real, Identidade & Controlo de Acessos (RBAC)** | Substituição da sessão demonstrativa por autenticação corporativa (SSO / OIDC / MFA), sessões seguras no servidor, RBAC efectivo por papel (`director`..`staff`), encriptação e trilho de auditoria imutável | Fase 09 concluída |
| **Fase 11** | **Gestão Documental Real, Gestão Avançada de Projectos & Activos 3D/CAD** | Armazenamento privado de ficheiros (object storage com URLs assinadas e validação binária), versionamento real de desenhos/PDFs/modelos `.glb`/`.gltf`, e **Gestão Avançada de Projectos** (dependências entre marcos/tarefas, alocação real por departamento, entregáveis por fase de obra e controlo de revisões) | Fases 09–10 concluídas (controlos de segurança activos) |
| **Fase 12** | **Colaboração Multi-Utilizador, Google Calendar & Business Intelligence (BI)** | Sincronização em tempo real Maputo–Milão, notificações persistentes accionáveis, integração **Google Calendar** (OAuth 2.0 + PKCE no backend, `Africa/Maputo` & `Europe/Rome`, `docs/INTEGRATION_FUTURE.md` §4) e camada de **Business Intelligence (BI)** (indicadores executivos derivados de dados reais: carga por departamento/estúdio, cumprimento de prazos/marcos, taxa de conclusão e séries históricas) | Fases 09–11 concluídas + consentimento OAuth aprovado |
| **Fase 13** | **Pipeline Editorial Seguro para `oa-workshop.com`** | Ligação sanitizada e unidireccional do módulo `08 Publicações` para o website público `oaworkshop` via contrato `PublicPortfolioProjection` (`docs/INTEGRATION_FUTURE.md` §1–§3), com aprovação dupla, pré-visualização staging e preservação integral de SEO/prerender/WebP | Fases 09–11 concluídas + aprovação de governança editorial |
| **Fase 14** | **Implementação Piloto com Colaboradores Reais, Produção & Endurecimento** | **Implementação piloto controlada com colaboradores reais da O+A** (ambiente staging/piloto isolado, recolha estruturada de métricas de adopção e usabilidade), observabilidade sem PII, backups/DR testados, auditoria externa de segurança OWASP e certificação formal WCAG 2.2 AA com tecnologias assistivas | Fases 09–13 concluídas + aprovação formal de segurança pré-piloto |

---

## Detalhamento por Fase

### Fase 09 — Arquitectura de Backend, Persistência & RFC Fundacional
- **Objectivo:** Criar a camada de servidor e base de dados sem reescrever a interface nem misturar lógica de negócio nos componentes React.
- **Entregas previstas:** RFC arquitectónico (`ADR`), esquema de dados normalizado (Projectos, Revisões, Tarefas, Departamentos, Equipa, Biblioteca Técnica, Publicações, Actividade), API tipada versionada e camada de adaptadores limpa.
- **Risco principal:** Deriva de contratos entre frontend e API. **Mitigação:** derivar schemas partilhados directamente dos tipos canónicos (`src/data/*Types.ts`).

### Fase 10 — Autenticação Real, Identidade & Controlo de Acessos (RBAC)
- **Objectivo:** Converter os `6` papéis demonstrativos em políticas de autorização efectivamente aplicadas no servidor — **gate obrigatório antes de qualquer dado empresarial real**.
- **Entregas previstas:** Login corporativo seguro (cookies `HttpOnly`/`Secure`/`SameSite`, MFA, zero tokens em `localStorage`), gestão de utilizadores/departamentos, permissões granulares por acção e registo de auditoria imutável.
- **Risco principal:** Fuga de dados entre papéis ou regressão na ergonomia de entrada. **Mitigação:** testes negativos de autorização no backend + preservação da entrada serena O+A.

### Fase 11 — Gestão Documental Real, Gestão Avançada de Projectos & Activos 3D/CAD
- **Objectivo:** Suportar operação real de atelier com documentação versionada, modelos 3D seguros e **gestão avançada de projectos**.
- **Entregas previstas:**
  - Object storage privado com URLs assinadas de curta duração, validação de assinaturas binárias no servidor (`.glb`/`.gltf`, PDFs, imagens) e referência controlada a `.skp`/BIM;
  - **Gestão Avançada de Projectos:** planeamento por fases arquitectónicas com dependências entre marcos e tarefas, linha de tempo/cronograma operacional, registo formal de aprovações de revisão e visibilidade de capacidade por departamento.
- **Risco principal:** Complexidade excessiva degradar a clareza editorial O+A ou ficheiros pesados degradarem rede móvel. **Mitigação:** divulgação progressiva na UI e manutenção do lazy-loading estrito de `/model`.

### Fase 12 — Colaboração Multi-Utilizador, Google Calendar & Business Intelligence (BI)
- **Objectivo:** Tornar a coordenação Maputo–Milão síncrona, interoperável com agenda externa e orientada por **Business Intelligence** fiável.
- **Entregas previstas:**
  - Eventos em tempo real (SSE/WebSockets) e centro de notificações persistente ligado a menções, prazos e decisões;
  - **Google Calendar** backend-driven conforme `docs/INTEGRATION_FUTURE.md` §4 (OAuth 2.0 + PKCE, selecção explícita de calendário, fusos `Africa/Maputo` / `Europe/Rome`, revogação imediata e idempotência por `etag`);
  - **Business Intelligence (BI):** painéis executivos e operacionais derivados exclusivamente de dados reais auditáveis (distribuição de carga Maputo/Milão, desvio de prazos por fase/departamento, throughput de revisões e exportações estruturadas para direcção), sem KPIs decorativos.
- **Risco principal:** Conflitos de fuso horário (DST) e métricas enviesadas por dados incompletos. **Mitigação:** testes determinísticos DST, tabela `internalEventId ↔ googleEventId` e definições auditáveis de cada indicador BI.

### Fase 13 — Pipeline Editorial Seguro para `oa-workshop.com`
- **Objectivo:** Transformar `08 Publicações` num fluxo real e seguro de publicação para o website público, preservando privacidade por omissão.
- **Entregas previstas:** Exportação exclusiva dos campos de `PublicPortfolioProjection` (excluindo estritamente clientes confidenciais, tarefas, revisões internas, `.skp`/`.glb` privados e notas internas), geração de PR/staging automático no repositório público e preservação integral de SEO, slugs bilingues e `sitemap.xml`.
- **Risco principal:** Exposição acidental de material privado no site público. **Mitigação:** allowlist estrita + dupla aprovação (`communications` + `director`) + revisão humana antes de deploy.

### Fase 14 — Implementação Piloto com Colaboradores Reais, Produção & Endurecimento
- **Objectivo:** Validar o sistema em operação controlada com colaboradores reais da O+A antes da adopção generalizada em produção.
- **Entregas previstas:**
  - **Implementação Piloto com Colaboradores Reais:** grupo piloto definido (Maputo + Milão) sobre ambiente endurecido com todos os controlos das Fases 09–13 activos, sessões de recolha de feedback operacional real, métricas de adopção e plano de correcção pré-produção;
  - **Produção & Endurecimento:** observabilidade e logs estruturados sem PII, backups encriptados com restauro testado, auditoria externa de segurança OWASP e certificação formal de acessibilidade WCAG 2.2 AA com leitores de ecrã reais (NVDA/JAWS/VoiceOver).

---

## Fronteira de Governança

Nenhuma fase deste roadmap pode ser iniciada automaticamente, e **nenhum dado empresarial real** pode ser carregado antes da conclusão e validação de segurança das Fases 09–10. Cada transição requer:
1. Conclusão e encerramento formal da fase anterior;
2. Plano dedicado em `plans/` (e ADR em `docs/DECISIONS.md` para backend/segurança/infraestrutura);
3. Aprovação expressa do responsável humano.
