# Plano 010 — Repositório público seguro, front-end autónomo e bilingue

## Estado

- **Estado:** CONCLUÍDO — aprovado em 2026-08-31 e concluído em 2026-09-01; aguarda decisão canónica.
- **Ramo deste documento:** `codex/plan-public-bilingual-cleanup`.
- **Ramo previsto para execução:** `codex/feature-public-bilingual-cleanup`.
- **Execução autorizada:** sim, por aprovação explícita do utilizador.
- **Excepção:** a frase exacta `Implementação forçada` permite avançar sem aprovação prévia do plano, apenas dentro do âmbito expressamente pedido e sem dispensar as regras de segurança, preservação de trabalho e utilização de um ramo alternativo.

## Objectivo

Transformar o projecto numa aplicação exclusivamente de front-end, sem dependências ou chamadas associadas ao back-end/CMS anterior; remover mensagens provisórias da interface; proteger o repositório público contra informação interna ou sensível; e tornar a experiência integralmente funcional em português e inglês.

## Interpretação correcta do âmbito público

Por «não deve ser muita coisa explícita do projecto», entende-se que **o repositório alojado no Git é público**. A restrição aplica-se aos ficheiros versionados, e não ao conteúdo editorial legítimo apresentado pelo site.

O repositório não deverá conter segredos, credenciais, contactos privados, dados pessoais não autorizados, informação confidencial de clientes, pormenores operacionais internos, endereços privados de infra-estrutura, registos de execução, cópias de respostas de serviços ou comentários que revelem informação desnecessária. A documentação continuará a conter apenas a informação técnica mínima necessária para desenvolver e manter o projecto com segurança.

Nomes, descrições, categorias, localizações, datas, imagens e contactos destinados ao público poderão continuar no site. Este plano não reduz conteúdo legítimo do portefólio nem adopta segurança por obscuridade.

## Decisões fundamentais

### 1. Regra obrigatória de planeamento

Antes de qualquer alteração por um agente ou IA:

1. criar ou actualizar um plano em `plans/`;
2. apresentar o ficheiro ao utilizador;
3. aguardar aprovação explícita;
4. executar apenas o âmbito aprovado num ramo alternativo.

A única excepção é a chave exacta e sensível a maiúsculas/minúsculas `Implementação forçada`. A chave não amplia o âmbito do pedido, não autoriza operações destrutivas implícitas e não permite trabalhar directamente em `main`.

Esta regra será formalizada em `AGENTS.md`, `CONTRIBUTING.md`, `plans/README.md` e nas instruções de gestão de prompts.

### 2. Limite de segurança dos ficheiros `.env`

O projecto poderá usar `.env` local para configuração não versionada, mas o ficheiro não torna seguro um valor usado pelo navegador. Em Vite, qualquer variável exposta ao código cliente — designadamente uma variável com prefixo `VITE_` — fica incluída no pacote público e pode ser lida por quem visita o site.

Assim:

- `.env`, `.env.local` e equivalentes privados continuarão ignorados pelo Git e não poderão ser forçados para o repositório;
- será criado ou restaurado `.env.example` apenas quando existirem configurações públicas reais, sem valores privados;
- palavras-passe, chaves privadas, tokens secretos e credenciais não poderão existir nem ser consumidos pelo front-end;
- contactos já publicados na interface não serão tratados como segredos;
- não serão inventadas variáveis de ambiente sem necessidade concreta;
- valores de exemplo serão fictícios e não permitirão inferir dados internos;
- se no futuro surgir uma função que exija um segredo, será necessário um novo plano e uma arquitectura fora do navegador, sujeita a aprovação.

Se for encontrado um segredo já confirmado no Git, apagá-lo apenas do ficheiro actual não será suficiente. O segredo deverá ser revogado ou rodado imediatamente; qualquer limpeza do histórico será tratada num plano próprio, porque altera referências partilhadas do repositório.

Referência técnica: [Variáveis de ambiente e modos do Vite](https://vite.dev/guide/env-and-mode).

### 3. Front-end sem back-end

O site não fará chamadas a API, não dependerá de serviços locais e não simulará o êxito de operações que necessitariam de um servidor. O conteúdo será local e versionado no próprio front-end.

Para o contacto, a solução recomendada é uma acção transparente que abra o cliente de correio (`mailto:`), podendo manter-se também a ligação directa para WhatsApp. Sem back-end ou serviço externo aprovado, o formulário não poderá prometer que uma mensagem foi enviada.

## Diagnóstico actual

- `src/pages/Projects.tsx` e `src/pages/ProjectDetail.tsx` consultam uma API local.
- `src/components/home/ContactSection.tsx` tenta enviar contactos para essa API.
- `SectionOverlayStatus.tsx` apresenta estados «under construction» e «coming soon» em várias páginas e secções.
- o herói e o menu apresentam `Workshop • Design • Research` ou a respectiva tradução.
- existem textos públicos, dados de projecto e estados ainda fixos em inglês.
- as traduções conservam chaves órfãs de administração, CMS, base de dados e funcionalidades futuras que já não pertencem ao front-end.
- a dependência CMS anterior já não consta dos manifestos, mas ainda existem referências históricas na documentação que devem ser neutralizadas.

## Fases de execução

### Fase A — Consolidar a governação

Actualizar:

- `AGENTS.md`;
- `CONTRIBUTING.md`;
- `plans/README.md`;
- `prompts/README.md` e instruções relacionadas, se aplicável;
- `PROJECT_MAP.md`, caso a estrutura documental seja alterada.

As regras deverão explicar o ciclo «plano → aprovação → execução», a chave de excepção, a obrigação de ramo alternativo e a promoção para `main` apenas quando o trabalho for canónico e aprovado.

### Fase B — Proteger o repositório público e definir a configuração

1. confirmar que `.env` e todas as variantes privadas permanecem ignorados e não estão versionados;
2. inspeccionar o estado actual do repositório à procura de credenciais, dados pessoais, informação de clientes, endereços internos e valores sensíveis, sem os reproduzir nos relatórios;
3. verificar código, documentação, comentários, dados de exemplo, configurações e ficheiros gerados;
4. criar `.env.example` apenas se houver configuração necessária, usando nomes explicativos e valores fictícios;
5. acrescentar validação tipada em `src/config/env.ts` apenas se existirem variáveis reais;
6. documentar que variáveis consumidas pelo cliente são públicas;
7. garantir que nenhum segredo é necessário para compilar ou usar o site;
8. se for detectado um segredo real, interromper a exposição, recomendar a sua revogação e propor separadamente qualquer alteração destrutiva do histórico Git.

### Fase C — Remover completamente o back-end e o CMS anterior

1. retirar as três chamadas `fetch` para `localhost:8000`;
2. usar uma única fonte de dados local para listagem e detalhe de projectos;
3. converter o contacto para correio/WhatsApp de forma transparente, ou retirar o formulário se a experiência não puder ser honesta;
4. remover imports, tipos, configurações e caminhos órfãos associados a API ou servidor;
5. neutralizar referências ao produto CMS anterior em documentação activa, mantendo apenas a decisão arquitectural genérica de «front-end primeiro»;
6. não reescrever o histórico Git nem apagar o `stash` de segurança sem autorização específica.

### Fase D — Limpar a interface

1. remover `Workshop • Design • Research` e a versão portuguesa da área inicial e do menu;
2. retirar todas as instâncias de «Coming Soon», «Under Construction» e equivalentes;
3. apagar `SectionOverlayStatus.tsx` quando deixar de ter consumidores;
4. remover chaves de tradução órfãs relacionadas com construção, lançamento futuro, administração, CMS, base de dados e leads;
5. remover da interface textos técnicos que já não correspondam ao produto;
6. impedir que erros de rede, URLs locais ou mensagens técnicas apareçam ao visitante.

### Fase E — Tornar o bilingue integralmente funcional

1. inventariar todo o texto visível em cabeçalho, herói, navegação, página inicial, projectos, detalhe, contacto e rodapé;
2. substituir texto fixo por chaves de tradução ou por conteúdo local com campos `pt` e `en`;
3. usar identificadores estáveis para categorias e traduzir apenas os rótulos apresentados;
4. eliminar o conjunto de dados duplicado existente como fallback nas páginas;
5. garantir paridade entre `src/locales/pt.ts` e `src/locales/en.ts`;
6. confirmar que a mudança de idioma actualiza imediatamente todos os componentes visíveis;
7. preservar o idioma após recarregar a página e manter o atributo `lang` do documento correcto;
8. definir comportamento previsível quando faltar uma tradução, sem mostrar chaves técnicas ao público.

### Fase F — Documentar e validar

Actualizar o mapa do projecto, o guia de conteúdo, as regras de qualidade e, se necessário, criar uma decisão arquitectural curta sobre a protecção do repositório público e a fronteira dos ficheiros `.env`. A documentação não deverá incluir valores reais, informação operacional desnecessária nem inventários sensíveis.

Executar:

- inspecção dos manifestos e da árvore de dependências — deverá confirmar a ausência do CMS anterior;
- pesquisa por `localhost:8000`, chamadas `fetch` e referências activas a API/back-end;
- pesquisa por imports e referências a `SectionOverlayStatus`;
- pesquisa prudente por padrões de credenciais e ficheiros privados versionados, sem imprimir valores sensíveis;
- comparação estrutural das chaves PT/EN;
- `npm run lint`;
- `npm run build`;
- verificação no navegador a 375 px, 768 px e 1440 px, em português e inglês;
- verificação da consola do navegador e dos fluxos de navegação, detalhe e contacto.

## Ficheiros previstos

Esta lista é indicativa e será confirmada no início da execução:

- governação: `AGENTS.md`, `CONTRIBUTING.md`, `plans/README.md`, `prompts/README.md`;
- configuração: `.gitignore`, `.env.example` e, apenas se necessário, `src/config/env.ts`;
- conteúdo e idiomas: `src/i18n.ts`, `src/locales/pt.ts`, `src/locales/en.ts`, `src/data/projects.ts`;
- páginas: `src/pages/Home.tsx`, `src/pages/Projects.tsx`, `src/pages/ProjectDetail.tsx`;
- componentes: `HeroSection.tsx`, `Header.tsx`, `ContactSection.tsx`, `ProjectsSection.tsx`, `CategoryMapSection.tsx`, `NewsSection.tsx` e `SectionOverlayStatus.tsx`;
- documentação: `README.md`, `PROJECT_MAP.md`, `docs/CONTENT_GUIDE.md`, `docs/QUALITY.md` e eventual ADR.

## Critérios de aceitação

- a regra do plano e a chave exacta estão documentadas de forma inequívoca;
- nenhuma execução acontece sem aprovação, salvo uso explícito de `Implementação forçada`;
- `.env` e variantes privadas não estão versionados e continuam cobertos por `.gitignore`;
- o repositório activo não contém credenciais, segredos, dados privados, registos ou informação interna desnecessária;
- `.env.example`, se necessário, contém somente nomes públicos e valores fictícios;
- não existe dependência, import, configuração ou código de execução ligado ao CMS anterior;
- não existem pedidos do navegador a `localhost:8000` nem a qualquer back-end;
- listagem e detalhe de projectos usam a mesma fonte local;
- o contacto não apresenta um falso estado de envio;
- a frase `Workshop • Design • Research` e a versão portuguesa não aparecem na interface;
- não aparecem «Coming Soon», «Under Construction» nem equivalentes;
- não restam chaves ou componentes órfãos de administração, base de dados ou desenvolvimento;
- todos os textos visíveis mudam correctamente entre português e inglês;
- o idioma escolhido persiste e o atributo HTML `lang` acompanha a escolha;
- não existem chaves de tradução em falta ou conjuntos PT/EN divergentes;
- o lint e a compilação terminam sem erros;
- a interface funciona nos três tamanhos de ecrã definidos e não produz erros na consola.

## Fora do âmbito

- criação de um novo back-end, função serverless, base de dados, autenticação ou painel administrativo;
- integração de um serviço externo de formulários sem novo plano e aprovação;
- reescrita do histórico Git;
- eliminação do `stash` de segurança existente;
- alteração do conteúdo editorial legítimo do portefólio além do necessário para a localização;
- publicação ou implantação em produção.

## Riscos e mitigação

- **Formulário sem servidor:** apresentar acção de correio/WhatsApp e texto honesto, sem confirmação fictícia.
- **Segredos no cliente:** bloquear a inclusão de qualquer segredo e documentar que configuração Vite é pública.
- **Segredo já presente no histórico:** revogar ou rodar a credencial; não reescrever o histórico sem plano e autorização próprios.
- **Documentação demasiado explícita:** registar decisões e caminhos necessários, omitindo valores, dados privados e pormenores operacionais sem utilidade para a manutenção.
- **Traduções incompletas:** validar paridade de chaves e percorrer visualmente todas as rotas nos dois idiomas.
- **Dados duplicados:** consolidar conteúdo antes de ajustar componentes.
- **Confusão entre repositório e site:** preservar os dados legítimos do portefólio; aplicar a minimização de informação aos ficheiros públicos do Git.

## Ordem de integração

1. obter aprovação explícita deste plano;
2. criar o ramo de execução a partir do estado canónico actualizado;
3. executar as fases A–F;
4. apresentar diferenças, validações e limitações ao utilizador;
5. obter aprovação para tornar o ramo canónico;
6. integrar em `main` sem reescrever histórico.

## Aprovação solicitada

Ao aprovar este plano, o utilizador aprova também as duas decisões recomendadas seguintes:

1. `.env` será tratado como configuração pública do front-end, nunca como armazenamento seguro de segredos;
2. o contacto deixará de simular envio para uma API e passará a usar correio/WhatsApp de forma transparente.

Qualquer alteração a estas decisões deverá ser indicada antes da execução.

## Resultado da execução

- As regras de planeamento, a chave de excepção, o ramo alternativo e a protecção do repositório público foram formalizados nas fontes de governação.
- Nenhum ficheiro `.env` ou variante privada está versionado. Não foi criado `.env.example`, porque o front-end não necessita de variáveis de ambiente.
- A inspecção dos ficheiros activos não encontrou candidatos a segredos, chamadas ao servidor anterior nem referências ao produto CMS removido.
- A listagem, o detalhe e os mapas utilizam uma única fonte local; o conteúdo traduzível reside nos ficheiros PT/EN.
- O contacto abre o programa de correio com a mensagem preenchida e não apresenta um falso estado de envio.
- A frase inicial e todas as sobreposições «Coming Soon»/«Under Construction» foram removidas; o componente partilhado deixou de existir.
- As 105 rotas de conteúdo verificadas mantêm paridade entre português e inglês.
- `npm run lint` terminou sem erros.
- `npm run build` terminou com sucesso. Mantém-se o aviso conhecido de bloco JavaScript superior a 500 kB e de dados Browserslist desactualizados; não foi introduzida uma nova dependência para os resolver.
- A verificação no navegador passou a 375 px, 768 px e 1440 px, nos dois idiomas, sem deslocação horizontal, sobreposição de erro ou mensagens de consola.
- Foram validados a persistência do idioma, a navegação, o catálogo, o detalhe, a abertura/fecho do diálogo de projecto e a comunicação transparente do contacto.

## Desvios

- A validação tipada de ambiente não foi criada, porque não existem variáveis de ambiente reais. Esta omissão segue a decisão aprovada de não inventar configuração.
- Não foi necessário alterar o histórico Git nem o `stash` de segurança.
