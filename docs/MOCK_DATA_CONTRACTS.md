# Contratos de Dados Demonstrativos (`MOCK_DATA_CONTRACTS.md`)

> Define o esquema tipado do frontend e a política de armazenamento local para substituição futura sem refazer componentes.

## 1. Entidades Nucleares (`src/data/types.ts`)

- **`Role`:** `'director' | 'architect' | 'project_manager' | 'department_lead' | 'communications' | 'staff'`
- **`DepartmentId`:** `'architecture' | 'urbanism' | 'interiors' | 'research' | 'project_management' | 'communications' | 'finance' | 'hr' | 'direction'`
- **`DemoUser`:** identificador estável, código técnico (`DIR-01`, `ARQ-02`, etc.), nome fictício, e-mail institucional fictício (`*.demo@oa-workspace.local`), papel, departamento principal, localização de estúdio (`Maputo` | `Milão`), iniciais e nota de responsabilidade demonstrativa.
- **`DemoSession`:** `{ userId: string; role: Role; authenticatedAt: string; mode: 'local-demo' }` — **nunca** armazena palavra-passe nem tokens reais.
- **`UserPreferences`:** `{ language: 'pt' | 'en'; skipWelcomeOnLogin: boolean; reduceMotionOverride: 'system' | 'reduce'; updatedAt: string }`.
- **`Project` (contrato base preparado desde a Fase 00):** separa explicitamente `projectStatus` (`'concept' | 'design' | 'in_progress' | 'review' | 'completed' | 'archived'`) de `publicationStatus` (`'private' | 'requested' | 'approved' | 'published-demo' | 'rejected' | 'unpublished'`), com `private` como omissão obrigatória.
- **`StudioFocusBrief`:** destaque editorial e prioridades por papel consumidas na `/welcome` e, futuramente, na mesa de trabalho `/workspace`.

## 2. Chaves de Armazenamento Local (`localStorage`)

| Chave | Conteúdo | Persistência | Limitações conhecidas |
|---|---|---|---|
| `oa_workspace_demo_session_v1` | `DemoSession` (apenas `userId`, `role`, `authenticatedAt`, `mode`) | Persiste após refresh no mesmo navegador; limpa no logout ou reset | Exclusiva deste navegador/dispositivo; não é sessão segura |
| `oa_workspace_user_prefs_v1` | `UserPreferences` (`language`, `skipWelcomeOnLogin`, `reduceMotionOverride`) | Persiste entre sessões demo até reset explícito | Limpa se o armazenamento do browser for apagado |

## 3. Invariantes de Segurança e Honestidade

1. **Zero Passwords Persistidas:** As palavras-passe de demonstração existem apenas como referência efémera de validação local em memória (`demo`); nunca são escritas em `localStorage`.
2. **Reset Integral (`resetDemoWorkspaceState`):** Apaga as chaves locais e restaura as *fixtures* canónicas sem inconsistências.
3. **Nomenclatura Fictícia:** Nenhum nome de colaborador real não confirmado, nenhum cliente real e nenhuma fotografia de obra real sem confirmação são utilizados como dados demonstrativos.
