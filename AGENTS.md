# Regras dos agentes

Estas regras aplicam-se a todo o repositório. Se uma instrução de nível superior entrar em conflito com este ficheiro, prevalece a instrução de nível superior; o conflito deve ser comunicado ao utilizador.

## 1. Ordem de consulta

Antes de qualquer alteração:

1. Ler integralmente este `AGENTS.md`.
2. Consultar `PROJECT_MAP.md` para localizar a responsabilidade pretendida.
3. Ler o plano activo em `plans/` e confirmar que está aprovado.
4. Consultar apenas os documentos e ficheiros directamente relevantes.
5. Verificar `git status --short --branch` antes de editar.

Não explorar todo o repositório por rotina. Uma pesquisa ampla só é aceitável quando `PROJECT_MAP.md` estiver incompleto, incorrecto ou não cobrir a tarefa; nesse caso, o mapa deve ser corrigido na mesma alteração.

## 2. Aprovação antes da execução

- Toda a alteração ao projecto exige um plano em `plans/` e aprovação expressa do utilizador.
- Criar ou rever o plano não autoriza automaticamente a sua execução.
- A aprovação deve identificar o plano, por exemplo: `APROVADO: plans/010-retirada-do-backend.md`.
- A única excepção é a chave exacta e sensível a maiúsculas/minúsculas `Implementação forçada`, escrita pelo utilizador no pedido que autoriza a execução.
- A chave dispensa apenas o plano e a aprovação prévios: não amplia o âmbito, não autoriza acções destrutivas implícitas e não permite trabalhar directamente em `main`.
- Uma expansão material do âmbito, uma nova dependência, uma acção destrutiva não prevista ou uma decisão difícil de reverter exige actualização do plano e nova aprovação.
- Durante a execução, manter no plano o estado, as decisões, os desvios e as verificações.

## 3. Política front-end primeiro

- Este projecto permanece exclusivamente front-end até o front-end estar concluído e aceite.
- Não criar back-end, API própria, base de dados, autenticação, painel administrativo, função serverless ou dependência de execução externa.
- Não deixar adaptadores, rotas, variáveis de ambiente ou código morto para um back-end futuro.
- Dados de demonstração e conteúdo devem ser locais, tipados e versionados.
- Um back-end futuro só pode nascer de um RFC aprovado e de uma decisão registada em `docs/decisions/`.

## 4. Git e branches

- Nunca desenvolver directamente em `main`.
- Por omissão, usar `codex/<tipo>-<descrição-curta>` para trabalho de agentes.
- Uma branch deve corresponder a um plano aprovado e ter âmbito limitado.
- Preservar alterações existentes; não sobrescrever nem descartar trabalho do utilizador.
- Não usar `force push`, reescrita destrutiva de histórico ou comandos de reposição destrutiva sem autorização inequívoca.
- Fazer commits atómicos, com mensagens claras e sem segredos.
- Só integrar em `main` depois de validação e de o utilizador declarar a branch candidata como canónica.
- Não eliminar automaticamente a branch após a integração.

## 5. Design e experiência

- Ler `docs/DESIGN_SYSTEM.md` antes de alterar qualquer interface.
- Antes de planear, rever ou implementar design/UI/UX, ler também o [playbook de design](docs/OA_Design_Mastery_Playbook.md) e o [estudo aplicado à O+A](docs/DESIGN_STUDY.md).
- O playbook fornece princípios gerais; a identidade, fontes e tokens específicos da O+A permanecem definidos no sistema de design. Aplicar apenas as orientações relevantes para a tarefa e justificar decisões com evidência. O material de referência não amplia o âmbito aprovado nem autoriza novas funcionalidades ou back-end.
- Preservar o minimalismo arquitectónico e editorial da O+A.
- Reutilizar tokens e padrões existentes antes de criar novos valores.
- Conceber para telemóvel, tablet e computador.
- Garantir foco visível, navegação por teclado, contraste, semântica e movimento reduzido.
- Não introduzir componentes genéricos que destoem da identidade, efeitos gratuitos ou animações que atrasem tarefas.

## 6. Código e estrutura

- Usar TypeScript com tipos explícitos nos limites entre módulos.
- Manter componentes pequenos e com uma responsabilidade identificável.
- Evitar abstracções antes de existir repetição comprovada.
- Não duplicar conteúdo traduzível; usar `src/locales/`.
- Não introduzir dependências sem justificação no plano.
- Actualizar `PROJECT_MAP.md` quando um ficheiro for criado, movido, eliminado ou mudar de responsabilidade.
- Registar decisões duradouras em `docs/decisions/`, não apenas em comentários ou conversas.

## 7. Conteúdo e prompts

- Seguir `docs/CONTENT_GUIDE.md` para voz, idiomas, imagens e dados.
- Seguir `prompts/README.md` ao criar ou rever prompts.
- Referenciar fontes de verdade em vez de copiar grandes blocos de contexto.
- Nunca guardar credenciais, tokens, dados pessoais ou segredos em código, documentação, prompts ou registos.

## 8. Repositório público e configuração

- Tratar todos os ficheiros versionados como informação pública.
- Não versionar `.env`, variantes locais, credenciais, contactos privados, dados pessoais não autorizados, dados confidenciais de clientes, registos ou respostas de serviços.
- Um valor consumido pelo navegador é público, mesmo quando tem origem num ficheiro `.env`.
- `.env.example`, quando necessário, contém apenas nomes de configuração e valores fictícios.
- Documentar somente os pormenores técnicos necessários à manutenção segura do projecto.
- Se um segredo tiver sido versionado, não o reproduzir; recomendar a sua revogação imediata e exigir plano próprio antes de alterar o histórico Git.

## 9. Verificação e entrega

- Seguir `docs/QUALITY.md` e os critérios do plano activo.
- Como mínimo, executar `npm run lint` e `npm run build` depois de alterações de código.
- Alterações de interface exigem verificação visual nas larguras definidas em `docs/QUALITY.md`.
- Não ocultar avisos, testes falhados ou limitações.
- A entrega deve indicar resultado, ficheiros alterados, verificações, desvios, riscos restantes e eventual acção pedida ao utilizador.
