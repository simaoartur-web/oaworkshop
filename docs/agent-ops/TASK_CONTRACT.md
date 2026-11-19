# Contrato de Missão Reutilizável — O+A Workspace (`TASK_CONTRACT`)

> **Regra de uso:** Toda a missão de implementação, integração ou auditoria formal do O+A Workspace deve preencher este contrato (no plano em `plans/` ou no brief de coordenação) **antes** do arranque dos trabalhadores. O histórico Git é sempre a fonte de verdade.

---

```markdown
# Task Contract — <ID-DA-MISSÃO>

- **Data:** YYYY-MM-DD
- **Fase / Ciclo:** <ex.: Fase 04.5.1 · Fecho P1>
- **Tipo de Missão:** `audit` | `fix` | `feature` | `docs` | `governance`
- **Modo de Execução:** `single-agent` | `subagent` | `swarm` | `teamwork`
- **Repositório:** `simaoartur-web/oaworkshop` (linha O+A Workspace)
- **Branch Base & Commit SHA:** `origin/codex/f02-integration-preview` (`<40-char-sha>`)
- **Branch / Worktree de Trabalho:** `codex/<tipo>-<descrição-curta>` (`<caminho-worktree>` ou `read-only`)
- **Estado de Aprovação Humana:** `AGUARDA APROVAÇÃO` | `APROVADO: <referência do plano>`

---

## 1. Objectivo e Fronteiras
- **Objectivo verificável:** <1–3 frases objectivas com resultado mensurável>
- **Referências obrigatórias:** `AGENTS.md`, `PROJECT_MAP.md`, `docs/PRODUCT_SPEC.md`, `<planos/auditorias aplicáveis>`
- **Fora de âmbito (proibido):**
  - Não alterar `main`, website público `oaworkshop`, SEO ou `.github/workflows/deploy.yml`.
  - Não adicionar backend, autenticação real, dados reais de clientes ou novas dependências sem aprovação.
  - Não iniciar nova fase nem executar merge sem aprovação humana expressa.

---

## 2. Propriedade Exclusiva de Ficheiros (Sem Colisões)

| Agente | Papel nesta Missão | Ficheiros Permitidos (Exclusivos) | Ficheiros / Caminhos Proibidos |
|---|---|---|---|
| `@agent-a` | <implementar / read-only / standby> | `<lista exacta de caminhos>` | Tudo fora da lista + `main`/site público |
| `@agent-b` | <implementar / read-only / standby> | `<lista exacta de caminhos>` | Tudo fora da lista + `main`/site público |
| `@agent-c` | Auditor Perf/Arq (`read-only`) | Nenhum ficheiro versionado (`%TEMP%\oa-audit-c\`) | Qualquer escrita em ficheiros versionados |
| `@agent-d` | Auditor Sec/QA (`read-only`) | Nenhum ficheiro versionado (`%TEMP%\oa-audit-d\`) | Qualquer escrita em ficheiros versionados |

---

## 3. Limites Operacionais e Condições de Paragem
- **Máximo de repetições de teste falhado sem nova evidência:** `1` (após 1 repetição, publicar `@coordinator [blocked]`).
- **Quality Gate consolidado:** `1` por commit SHA auditado.
- **Trabalhadores adicionais:** `0` (proibido criar sem autorização humana).
- **Portas reservadas (quando aplicável):** `@agent-d` `4174` · `@agent-c` `4175`/`4176`.
- **Hard stops:** necessidade de editar ficheiro fora da lista, colisão entre agentes, achado P0, expansão de âmbito ou falta de aprovação.

---

## 4. Testes Obrigatórios e Critérios de Aceitação
- [ ] `npm run lint` (`0` erros, `0` avisos)
- [ ] `npm run test` (100% determinístico)
- [ ] `npm run build` (`0` erros, `0` dependências circulares, `0 B` de `three`/`r3f`/`motion` em `dist/index.html`)
- [ ] `npm run test:e2e` e/ou testes reproduzíveis específicos da missão
- [ ] `git status --short` limpo no encerramento e `git diff` estritamente dentro dos ficheiros permitidos

---

## 5. Formato Obrigatório de Entrega (`@coordinator [done]`)
Cada agente responsável publica um único relatório final contendo exactamente:
1. **Tarefa executada**
2. **Evidências** (medições, saídas de comando ou passos reproduzíveis)
3. **Ficheiros envolvidos**
4. **Testes realizados**
5. **Problemas `P0` / `P1` / `P2`**
6. **Recomendações**
7. **Commit SHA e branch** (ou `read-only / sem alterações`)
```
