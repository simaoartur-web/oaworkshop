# Plano 124 — Referência partilhada de design e auto-estudo

> **Estado:** CANÓNICO
> **Data:** 2026-09-06
> **Branch:** `codex/plan-design-mastery-playbook`
> **Aprovação:** o utilizador pediu a integração em main e o push para começar a trabalhar com as novas ordens, após apresentação deste plano.
> **Integração canónica:** autorizada pelo mesmo pedido, condicionada às verificações abaixo.

## Objectivo e âmbito aprovado

Disponibilizar o playbook fornecido e o estudo dirigido a qualquer agente com acesso ao repositório, através das instruções de consulta em AGENTS.md e PROJECT_MAP.md.

O pedido posterior autoriza a execução documental, commit, merge e push para main. Substitui a exclusão destas operações na proposta inicial.

## Fontes permanentes

- [Playbook original integral](../docs/OA_Design_Mastery_Playbook.md).
- [Estudo, adaptações O+A, fontes primárias e método para estudo futuro](../docs/DESIGN_STUDY.md).
- [Sistema de design](../docs/DESIGN_SYSTEM.md).

O original e o estudo foram extraídos deste plano para evitar duplicação permanente. O material de referência não autoriza funcionalidades de ERP, administração ou back-end, nem substitui o âmbito de cada plano aprovado.

## Ficheiros e etapas

1. Criar `docs/OA_Design_Mastery_Playbook.md` com o original integral.
2. Criar `docs/DESIGN_STUDY.md` com o estudo e respectivas fontes.
3. Acrescentar a consulta de ambos a `AGENTS.md` para planear, rever ou implementar design/UI/UX.
4. Actualizar `PROJECT_MAP.md`, `docs/DESIGN_SYSTEM.md` e `prompts/README.md` com as referências.
5. Registar este plano em `plans/README.md`.
6. Verificar o original, ligações, diferenças, lint e build.
7. Fazer commit na branch, integrar em main e publicar no remoto sem reescrever histórico.

## Regras preservadas

- Outfit, Playfair Display, tokens e identidade O+A continuam definidos no sistema de design.
- Nenhuma alteração de interface, mapas, equipa, dados ou dependências.
- Sem instalação de skill global, automatismos de estudo ou promessa de memória permanente.
- Estudos futuros distinguem requisitos, heurísticas, preferências de marca e hipóteses.
- Trabalho futuro continua sujeito a plano e aprovação, com a excepção já definida em AGENTS.md.
- Não incluir caminhos pessoais ou dados privados nos documentos partilhados.
- Preservar a branch depois da integração.

## Critérios de aceitação

- Conteúdo integral do original preservado, permitindo apenas normalização das quebras de linha e da linha final.
- Estudo e original separados, com fontes e limitações explícitas.
- Referências acessíveis a partir de AGENTS.md e PROJECT_MAP.md.
- Ligações locais válidas e ausência de diferenças fora dos oito ficheiros documentais previstos.
- `git diff --check`, `npm run lint` e `npm run build` verificados antes da integração.

## Registo e verificações

- Leitura integral e estudo dirigido de W3C, Nielsen Norman Group e Carbon: concluídos na preparação do plano.
- Aprovação da integração documental, merge e push: recebida em 2026-09-06.
- Integração documental concluída nos oito ficheiros previstos.
- Original comparado com o ficheiro fornecido: conteúdo integral idêntico após normalização das quebras de linha e da linha final.
- Ligações locais verificadas: válidas.
- `git diff --cached --check`: sem erros.
- `npm run lint`: concluído sem erros.
- `npm run build`: concluído; avisos sobre a base Browserslist desactualizada e o bloco JavaScript de 663,08 kB, acima do limiar de 500 kB. Não houve alterações de código ou dependências.
- Verificação visual não aplicável: alteração exclusivamente documental.
- Aceite como canónico pelo pedido de integração do utilizador; a presença deste documento em main regista a integração. O histórico Git identifica o commit e o merge.
