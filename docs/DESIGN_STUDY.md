# Estudo de design O+A

> Estudo dirigido realizado em 2026-09-06. Referência de aplicação do [playbook original](OA_Design_Mastery_Playbook.md), subordinada ao [sistema de design](DESIGN_SYSTEM.md) e às regras de [AGENTS.md](../AGENTS.md).

## Auto-estudo realizado

### 1. Clareza e tarefas antes de decoração

A síntese das secções 1–7 é começar pelo visitante, pelas suas decisões e pelo resultado esperado. Na O+A, as hipóteses de percurso a validar são compreender o atelier, conhecer projectos, identificar competências e encontrar contacto.

As heurísticas de Nielsen orientam a revisão, mas não substituem observação de utilizadores. Cada problema deve ter evidência, consequência e recomendação. Estados seleccionados e rótulos visíveis reduzem a necessidade de recordar interacções anteriores.

Fonte consultada: [Nielsen Norman Group — 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/).

### 2. Hierarquia e expressão da marca

As secções 3–4, 8–10 e 20–22 reforçam o uso de escala, proximidade, alinhamento, contraste e espaço antes de acrescentar caixas. O valor premium deve resultar da composição, legibilidade e qualidade do conteúdo.

A distinção do Carbon entre tipografia produtiva e expressiva ajuda a calibrar densidade e escala segundo a tarefa. Aplicação à O+A: expressão nos projectos e apresentação institucional; contenção e previsibilidade em navegação e controlos. Não importar IBM Plex nem o aspecto visual da IBM.

Fonte consultada: [Carbon — Typography overview](https://carbondesignsystem.com/elements/typography/overview/).

### 3. Acessibilidade com critérios concretos

A lista do playbook é uma introdução, não uma auditoria completa. Para os critérios aplicáveis, 4,5:1 para texto normal e 3:1 para texto grande são limites mínimos, não valores aproximados. O contraste de componentes e informação gráfica significativa tem regras próprias e excepções; não se aplica indiscriminadamente a toda a decoração.

Verificar também foco não oculto, teclado, ordem de leitura, ampliação e reorganização do conteúdo. As larguras de QA da O+A não substituem a avaliação de reflow prevista nas WCAG.

Fonte consultada: [W3C — WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/).

O critério AA 2.5.8 prevê alvos de pelo menos 24 × 24 CSS px ou o cumprimento das suas excepções, incluindo espaçamento. O objectivo de 44 × 44 px já adoptado pela O+A continua a ser uma preferência útil para toque; não deve ser apresentado como o mínimo universal AA.

Fonte consultada: [W3C — Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Quando uma função depende de arrastar, avaliar uma alternativa por ponteiro simples, além do teclado, salvo excepção aplicável. Exemplo a estudar nos carrosséis: botões anterior/seguinte. Não afirmar conformidade sem testar.

Fonte consultada: [W3C — Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html).

### 4. Estados, responsividade e confiança

As secções 11–19 e 23–24 pedem contratos completos: normal, foco, selecção, carregamento real, vazio, erro e recuperação, quando aplicáveis. Um estado de carregamento deve corresponder a trabalho real; não acrescentar espera artificial para transmitir sofisticação.

No telemóvel, adaptar a organização e a interacção à tarefa. Para a equipa, isto favorece uma sequência vertical legível e perfis acessíveis. Para mapas, a localização textual e o acesso aos projectos devem continuar disponíveis quando a cartografia falhar.

Estas aplicações são hipóteses para planos futuros; não constituem uma auditoria nova dos componentes nem autorizam alterações.

## Adaptação ao projecto

| Tema do playbook | Aplicação proposta à O+A |
|---|---|
| Escala de 4/8 px | Usar primeiro a escala e os tokens existentes; não impor uma migração global |
| Tipografia | Preservar Outfit e Playfair Display; ajustar hierarquia apenas no âmbito aprovado |
| Expressão visual | Fundo escuro, terracota contida, composição arquitectónica e protagonismo dos projectos |
| Pesos tipográficos | Evitar texto pequeno ilegível; resolver caso a caso sem proibir todos os pesos leves |
| Movimento | Feedback rápido nos controlos; revelações ambientais apenas quando não atrasam a tarefa |
| Estados de sistema | Mostrar estados reais; contemplar erro e recuperação quando aplicáveis |
| Organograma | Comunicar liderança por posição e escala; detalhes por pessoa e estrutura móvel própria |
| Mapas e projectos | Preservar contexto, selecção e alternativas de navegação em situações de falha |
| ERP, dashboards, permissões | Referências gerais; fora do âmbito do site exclusivamente front-end |
| Formato de revisão | Adaptar extensão à tarefa; evitar relatórios repetitivos em alterações pequenas |

## Método de auto-estudo para trabalho futuro

Executar quando houver uma tarefa de design ou pedido de estudo, sem monitorização ou agendamento automático:

1. Formular a dúvida concreta do trabalho actual.
2. Consultar as secções relevantes e uma fonte primária adequada.
3. Distinguir requisito, heurística, preferência de marca e hipótese de projecto.
4. Registar a fonte, data de consulta e uma síntese curta.
5. Propor um exercício ou critério verificável: teclado, texto longo, falha, reflow, compreensão da hierarquia.
6. Aplicar apenas dentro do plano aprovado.
7. Documentar o que foi confirmado e o que permanece por validar.

Ficha breve de aprendizagem:

- Pergunta:
- Fonte e data:
- Princípio:
- Aplicação possível à O+A:
- Evidência ou teste:
- Limitação:
- Plano associado, se houver execução:

As outras referências do playbook — Apple, Fluent, Atlassian, GOV.UK, USWDS e Spectrum — são leituras futuras por necessidade. Não foram estudadas integralmente nesta sessão.
