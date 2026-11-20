---
trigger: model_decision
description: "Apply when selecting, switching, verifying, or reporting AI models and reasoning effort for Coordinator or Swarm agents in O+A Workspace."
---

# O+A Workspace — Model Governance & Adaptive Reasoning Policy v1.1

Política obrigatória para Coordenador Principal, agentes A/B/C/D e auxiliares. O Coordenador deve **avaliar a complexidade e o risco de cada tarefa antes de escolher o modelo e o esforço**. Esta política complementa o núcleo `always_on` em `.agents/rules/00-governance-core.md`.

## 1. Invariantes absolutos

1. **Argon proibido sem autorização humana expressa e específica.** Nunca selecionar Gemini 4 Argon, Orchestrator (Argon), qualquer variante futura de Argon ou um Orchestrator/fallback cujo encaminhamento possa utilizar Argon. Falta de quota não é autorização.
2. **Extra High proibido.** Nunca selecionar `Extra`, `Extra High`, `xhigh`, `max` ou nível equivalente superior a `High`, em qualquer modelo. A expressão «Light» do responsável equivale a `Low`, quando essa opção existe no seletor.
3. **Hierarquia de fornecedores preservada:** (1) Claude Opus disponível, (2) modelo GPT *proprietário* da OpenAI disponível no seletor, (3) Gemini não-Argon apenas se Opus e GPT proprietários não estiverem disponíveis ou estiverem sem quota. Não confundir `GPT-OSS` com um modelo GPT proprietário.
4. **Sem configurações fictícias.** Confirmar no seletor e no Swarm Board o nome real e os níveis disponíveis. Se o modelo só tiver esforço fixo, indicar «fixo/não configurável», em vez de dizer Medium ou High.
5. **Sem fallback silencioso ou troca no meio de uma execução válida.** Alterar apenas na próxima tarefa/turno ou quando o agente estiver em espera. Se não existir um modelo permitido, estado `BLOCKED` e pedido de decisão humana.
6. **Autoridade do Coordenador:** o Coordenador define a seleção dentro dos limites; nenhum trabalhador pode mudar de fornecedor, elevar esforço ou ativar Orchestrator por iniciativa própria.

## 2. Matriz de complexidade T0–T3

| Classe | Critério prático | Esforço inicial | Estratégia |
|---|---|---|---|
| **T0 — Simples** | Leitura dirigida, documentação curta, alterações isoladas e reversíveis sem risco de dados/segurança | `Low` (Light), ou `Medium` quando Low indisponível | Um agente; sem Swarm |
| **T1 — Moderada** | Bug localizado, UI comum, 1–5 ficheiros, testes dirigidos e risco baixo/médio | `Medium` | Um agente especializado |
| **T2 — Complexa** | Vários módulos, dependências, React.lazy, race conditions, sincronização, WebGL, performance ou regressões | `Medium`; `High` apenas com justificação | Implementação por proprietário; C/D fazem auditoria independente conforme risco |
| **T3 — Crítica** | Segurança, integridade, grandes alterações arquiteturais, migrações, incidentes P0 ou integração arriscada | `High`; **nunca** Extra High | Plano/contrato, autorização humana, verificação independente |

Classificar por **risco e dependências**, não apenas pelo número de ficheiros. Um bug de segurança num único ficheiro pode ser T3. Um bloqueio não justifica subir automaticamente o esforço: diagnosticar primeiro.

## 3. Roteamento Gemini, somente quando fallback autorizado

Esta matriz só se aplica quando Claude Opus e GPT proprietário não estão disponíveis ou não têm quota. Se Opus/GPT estão disponíveis, preferir esses modelos e aplicar o menor esforço permitido apropriado à classe. Não presumir que Opus/GPT suportam os mesmos níveis do Gemini.

| Modelo | Casos adequados | Esforço | Condições |
|---|---|---|---|
| **Gemini 4 Hydrogen** | T0/T1, pequenas mudanças, leitura, tarefas repetitivas e testes com âmbito bem definido | Low para T0, Medium para T1; High excepcional, fundamentado | Não atribuir T3 só para economizar quota |
| **Gemini 4 Neon** | T1/T2 exigentes, algoritmos, depuração, regressões, arquitetura e auditoria | Medium por defeito; High para T2/T3 fundamentado; Low opcional em T0 | **Nunca** Extra/xhigh/max |
| **Orchestrator (Neon)** ou **Orchestrator (Carbon)** | Missões T3 longas, com planeamento e execução de múltiplas etapas, quando o benefício excede a sobrecarga | **Esforço fixo**, não ajustável com Low/Medium/High | Confirmar a composição exata, sem Argon. Se a cadeia não for verificável, pedir aprovação em vez de ativar |
| **Orchestrator (Argon)** ou composição desconhecida | **Proibido** | Não aplicável | Exige autorização humana expressa e específica |

**Limitação importante:** um Orchestrator pode selecionar modelos internamente e não oferece controlo direto de esforço. Não alegar que está em Medium/High nem garantir um teto interno não verificável. Quando for obrigatório assegurar esforço no máximo High, **não usar Orchestrator**; escolher um modelo configurável ou pedir autorização explícita.

## 4. Recomendações por função

- **Coordenador:** Low para estado curto, Medium para coordenação, High apenas para conflitos técnicos T2/T3 e decisões de integração. Não duplicar auditorias.
- **Agente A (Dados/Arquitetura):** Medium por defeito; High para invariantes, segurança e arquitetura transversal.
- **Agente B (Frontend/UX):** Low em T0, Medium em T1/T2, High para bugs complexos ou WebGL crítico.
- **Agente C (Performance):** Medium para benchmarks e comparação, High para investigação causal complexa.
- **Agente D (QA/Segurança):** Medium para suíte dirigida, High para auditorias adversariais e risco T3.

Manter agentes sem missão em `waiting`. Preferir `single-agent` em T0/T1. Não criar Swarm desnecessário.

## 5. Seleção e prestação de contas

Antes de atribuir uma tarefa, o Coordenador deve apresentar **ID | Classe T0–T3 | Risco | Modelo | Esforço (ou fixo) | Justificação breve | Alternativa permitida**. Isso deve ser compacto para não gastar contexto em burocracia.

- Medir eficiência por tarefas corretas concluídas, retrabalho e verificações, não apenas por tokens por resposta.
- Após falha, diagnosticar antes de aumentar esforço; máximo de uma repetição de teste sem evidência nova, seguindo os contratos existentes.
- Justificar alterações para High, troca de modelo e proposta de Orchestrator. Mudanças proibidas exigem aprovação humana específica.
- O relatório em Git deve guardar classe, modelo e esforço inicialmente selecionados e efetivamente utilizados, desvios e motivo de fallback. Nunca incluir segredos ou dados privados.
- Confirmar modelos e disponibilidade no seletor/Swarm Board. Não afirmar aplicação automática de uma configuração que a plataforma não permite impor.
- Não criar novos trabalhadores, modificar código funcional, fazer merges ou alterar `main` por causa desta política.
