# Plano 120 — Organograma público da equipa

> **Estado:** CANÓNICO — aceite para integração em `main` em 2026-09-04.
> **Data:** 2026-09-01
> **Branch deste plano:** `codex/plan-team-organogram`
> **Branch prevista para execução:** `codex/feature-team-organogram`
> **Base:** `main` (`12cc809`)
> **Aprovação:** recebida; as cinco questões editoriais foram confirmadas em 2026-09-04.

## Objectivo

Introduzir na página inicial, imediatamente depois da secção Journal e antes dos Contactos, um organograma público, bilingue, responsivo e acessível que apresente a estrutura real da equipa O+A sem biografias, fotografias, relações hierárquicas ou dados pessoais não confirmados.

## Contexto e estado actual

- `src/pages/Home.tsx` apresenta `NewsSection` e, logo depois, `ContactSection`.
- `src/components/home/TeamSection.tsx` existe, mas não é consumido pela página inicial.
- esse componente contém nomes, cargos, percursos e fotografias demonstrativos que não correspondem à equipa agora indicada;
- a interface pública suporta português e inglês;
- o projecto continua exclusivamente front-end, com conteúdo local e versionado;
- o ramo Atlas Editorial permanece separado e não será usado como base desta iniciativa.

## Estrutura editorial proposta

O organograma terá duas camadas visuais. As linhas representam agrupamento organizacional e não relações jurídicas ou contratuais adicionais.

### 01 — Direcção

| Nome público | Cargo em português | Cargo em inglês |
|---|---|---|
| Osvaldo Luís | Director-Geral · Arquitecto e Urbanista Sénior | Managing Director · Senior Architect & Urbanist |
| Artur Simão | Director Técnico · Arquitecto e Urbanista Sénior | Technical Director · Senior Architect & Urbanist |

Os dois directores serão apresentados como liderança conjunta, com igual peso visual. O desenho não deverá sugerir que um director responde ao outro.

### 02 — Equipa multidisciplinar

| Nome público | Cargo em português | Cargo em inglês |
|---|---|---|
| Mivas Massingue | Arquitecto Júnior | Junior Architect |
| Edson Camba | Técnico de Construção | Construction Technician |
| Letícia Muguambe | Geógrafa | Geographer |
| Maxime Zabrodin | Arquitecto Sénior | Senior Architect |
| Neide | Arquitecta Júnior | Junior Architect |
| Imran Jafar | Tecnologias de Informação e Marketing | IT & Marketing |

### Administração

Administração não será apresentada na interface enquanto não existir um nome público confirmado. Não será criada uma pessoa fictícia nem uma mensagem «brevemente». Quando o nome for fornecido, a inclusão exigirá actualização do conteúdo nos dois idiomas, validação e registo no plano.

## Decisões de apresentação

- usar uma composição tipográfica e estrutural, sem fotografias nesta fase;
- manter a paleta, tipografia, espaçamento e terracota definidos no sistema de design canónico de `main`;
- usar linhas finas como conectores no computador e tablet;
- em telemóvel, converter a estrutura numa sequência vertical legível: Direcção → Equipa multidisciplinar;
- apresentar nomes próprios com capitalização natural, não integralmente em maiúsculas;
- reservar maiúsculas e espaçamento amplo para etiquetas curtas de nível;
- não usar modal, acordeão, carrossel, arrasto ou interacção necessária para revelar pessoas;
- não introduzir animações decorativas; uma revelação discreta só será aceitável se respeitar `prefers-reduced-motion`;
- manter os conectores como decoração com `aria-hidden`, preservando uma lista semântica compreensível sem CSS;
- não inventar biografias, habilitações, nacionalidades, contactos, fotografias ou relações de reporte.

## Modelo de conteúdo proposto

Reescrever `TeamSection.tsx` para consumir uma pequena fonte local tipada, separando dados estáveis de texto traduzível.

Cada membro terá apenas:

- `id` estável e não sensível;
- nome público;
- nível organizacional (`leadership` ou `practice`);
- chave do cargo;
- ordem editorial.

Os nomes poderão residir em `src/data/team.ts`; títulos, etiquetas e texto de apresentação residirão em `src/locales/pt.ts` e `src/locales/en.ts`. Não haverá código de transporte, API, adaptador remoto ou preparação de back-end.

## Âmbito incluído

1. substituir o conteúdo demonstrativo de `TeamSection.tsx` pelo organograma real;
2. criar a fonte local tipada da equipa, se a separação reduzir duplicação e tornar a manutenção mais segura;
3. inserir `TeamSection` imediatamente depois de `NewsSection` em `Home.tsx`;
4. criar textos PT/EN com paridade estrutural;
5. garantir estrutura semântica, foco correcto e leitura por tecnologia de assistência;
6. adaptar a composição às larguras de 375 px, 768 px e 1440 px;
7. actualizar `PROJECT_MAP.md` se a fonte de dados for criada ou a responsabilidade do componente mudar;
8. registar no plano decisões, desvios e resultados de validação.

## Fora do âmbito

- alterações ao ramo Atlas Editorial ou integração desse trabalho em `main`;
- fotografias, biografias, currículos, contactos individuais ou ligações sociais;
- painel de administração, CMS, API, base de dados ou qualquer back-end;
- página individual para cada membro;
- filtros, pesquisa, animação complexa ou organograma editável;
- publicação, `push`, merge ou alteração directa em `main`;
- apresentação pública de Administração sem um nome confirmado.

## Ficheiros previstos

- `src/pages/Home.tsx` — inserir a secção depois de Journal;
- `src/components/home/TeamSection.tsx` — substituir a demonstração pelo organograma;
- `src/data/team.ts` — dados locais tipados, caso seja criado;
- `src/locales/pt.ts` — etiquetas e cargos em português;
- `src/locales/en.ts` — etiquetas e cargos em inglês;
- `PROJECT_MAP.md` — actualizar responsabilidades e eventual nova fonte;
- `plans/120-organograma-da-equipa.md` — acompanhar execução e validação.

## Etapas

### Fase A — Confirmação editorial

1. confirmar grafia pública dos nomes;
2. resolver a divergência entre `Artur Tomás`, presente no componente demonstrativo, e `Artur Simão`, indicado para o organograma;
3. confirmar se «Neide» deve ser publicado sem apelido;
4. confirmar as traduções profissionais propostas;
5. confirmar que todos os membros autorizaram a apresentação pública do nome e cargo.

### Fase B — Estrutura de dados e idiomas

1. definir o tipo local mínimo;
2. criar identificadores estáveis;
3. manter nomes independentes das traduções;
4. criar cargos e etiquetas PT/EN com paridade exacta;
5. impedir registos incompletos ou níveis desconhecidos durante a compilação.

### Fase C — Componente e integração

1. reescrever `TeamSection.tsx` com `section`, título, listas e grupos semânticos;
2. criar a hierarquia visual dos dois directores e da equipa multidisciplinar;
3. tratar conectores como decoração;
4. inserir a secção depois de Journal;
5. remover integralmente os nomes, biografias e imagens demonstrativos actuais.

### Fase D — Responsividade e acessibilidade

1. validar a sequência vertical em 375 px;
2. validar agrupamento e comprimentos bilingues em 768 px;
3. validar conectores, alinhamento e equilíbrio em 1440 px;
4. percorrer o organograma por leitor de ecrã e confirmar ordem lógica;
5. garantir contraste WCAG 2.2 AA e ausência de informação dependente apenas de linhas ou cor;
6. confirmar o comportamento com movimento reduzido.

### Fase E — Qualidade e entrega

1. confirmar paridade das traduções;
2. procurar resíduos dos nomes e biografias demonstrativos;
3. executar `npm run lint`;
4. executar `npm run build`;
5. executar `git diff --check`;
6. rever a interface e a consola nas três larguras;
7. apresentar diferenças, limitações e questões editoriais antes de qualquer integração.

## Riscos e salvaguardas

- **Nomes públicos incorrectos:** bloquear a promoção canónica até confirmação da grafia e consentimento.
- **Hierarquia interpretada como relação laboral formal:** limitar conectores aos dois níveis confirmados e explicar a liderança conjunta.
- **Cargo traduzido de forma artificial:** usar equivalentes profissionais naturais e confirmar terminologia com a O+A.
- **Apelido em falta:** permitir temporariamente «Neide» apenas mediante confirmação explícita.
- **Administração vazia:** omitir da interface até existir conteúdo real.
- **Dados demonstrativos antigos:** substituir o componente por completo e pesquisar os resíduos antes da entrega.
- **Nomes longos em telemóvel:** usar grelha fluida, quebra controlada e teste com o conteúdo real.
- **Conflito futuro com Atlas:** manter esta implementação independente e resolver a adaptação visual num plano posterior.

## Critérios de aceitação

- o organograma aparece imediatamente depois de Journal e antes de Contactos;
- Osvaldo Luís e Artur Simão aparecem como directores com o mesmo peso hierárquico;
- os seis restantes membros aparecem no nível da equipa multidisciplinar;
- Administração não aparece sem nome confirmado;
- nenhum nome, cargo, bio ou imagem demonstrativo permanece no componente;
- português e inglês apresentam os mesmos membros e estrutura;
- nomes próprios não são traduzidos nem alterados pela mudança de idioma;
- a interface continua legível e coerente a 375 px, 768 px e 1440 px;
- a ordem de leitura semântica é Direcção → Equipa multidisciplinar;
- não existem novas dependências, chamadas de rede ou código de back-end;
- `npm run lint`, `npm run build` e `git diff --check` terminam sem erros;
- não há erros na consola nem deslocação horizontal causada pela secção.

## Questões que exigem confirmação antes da execução

1. O nome público correcto é **Artur Simão**, substituindo integralmente «Artur Tomás»?
2. **Neide** deve ser publicada apenas com o primeiro nome ou falta indicar o apelido?
3. A tradução **Construction Technician** representa correctamente o cargo de Edson Camba?
4. Confirma-se a liderança conjunta dos dois directores e o agrupamento dos restantes membros num único nível, sem relações de reporte adicionais?
5. Os nomes e cargos indicados estão autorizados para publicação num repositório e site públicos?

## Registo de decisões e desvios

### 2026-09-01 — Proposta inicial

- plano criado em `codex/plan-team-organogram`, a partir de `main`;
- ramo Atlas não foi modificado nem integrado;
- escolhida uma apresentação tipográfica sem fotografias;
- Administração será omitida até existir um nome real;
- execução bloqueada até aprovação deste plano e resposta às cinco questões editoriais.

## Resultado

Organograma implementado no ramo `codex/feature-team-organogram`, depois de Journal e antes de Contactos. Aguarda aceitação visual e ensaio com leitor de ecrã real antes da promoção canónica.

### 2026-09-04 — Aprovação e execução

- confirmados Artur Simão, Neide sem apelido, Construction Technician, liderança conjunta e autorização pública dos nomes e cargos;
- ramo de execução criado a partir do ramo do plano, preservando a base de `main` e sem importar Atlas;
- dados locais tipados, cargos PT/EN e organograma estático sem fotografias ou animações;
- ordem editorial mantida pelo próprio array, sem campo numérico redundante;
- Administração omitida e conteúdo demonstrativo substituído;
- `npm run lint`, `npm run build` e paridade estrutural PT/EN passaram;
- teste da fonte local confirmou oito identificadores únicos, dois directores e cargos completos nos dois idiomas;
- revisão visual no navegador a 375, 768 e 1440 px em PT/EN: nomes legíveis, sem transbordamento da secção;
- árvore de acessibilidade confirmou título, dois grupos nomeados e ordem dos oito membros; ensaio com leitor de ecrã real não realizado;
- alternância PT/EN por teclado verificada; a secção não acrescenta controlos nem animações;
- consola consultada sem erros; não foram adicionadas chamadas de rede;
- compilação com bloco principal de 654,57 kB e aviso superior a 500 kB, já esperado nesta base; dados Browserslist desactualizados também assinalados, sem actualizar dependências fora do âmbito;
- a ferramenta de navegador actualmente disponível permitiu a revisão visual anteriormente pendente;
- `main`, Atlas, publicação e `push` não foram alterados.

## Aprovação solicitada

Forma recomendada:

```text
APROVADO: plans/120-organograma-da-equipa.md
```

A aprovação deve incluir as respostas às cinco questões editoriais acima. A aprovação não autoriza `push`, merge, publicação ou trabalho directo em `main`.
