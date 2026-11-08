# Plano 135 — Autoplay do Workshop e retirada dos controlos de reprodução

> **Estado:** EM EXECUÇÃO — implementação aprovada em 2026-11-08.
> **Data:** 2026-11-08
> **Base confirmada:** `main` e `origin/main` @ `e468fe7cb043844855c529477616f6e873c45190`.
> **Branch de preparação:** `codex/docs-slideshow-autoplay-plan`.
> **Branch de implementação:** `codex/fix-slideshow-autoplay`, criada de `origin/main` @ `e468fe7` após reconfirmação remota.
> **Pedido:** investigar o slideshow estático e retirar o controlo Play/Pause.
> **Decisão editorial confirmada:** o utilizador escolheu «Retirar qualquer controlo de reprodução», incluindo a alternativa de pausa apresentada apenas pelo teclado.
> **Aprovação da implementação:** concedida em 2026-11-08: `APROVADO: plans/135-slideshow-autoplay-sem-playback.md`, incluindo D1–D4.

## 1. Objectivo e âmbito

O visitante entra pelo logótipo ou pelo scroll, vê o Workshop e assiste à sequência Architecture → Urban Planning → Research → Architecture, com uma mudança a cada oito segundos. Uma entrada normal ou um ponteiro parado sobre a fotografia não devem bloquear essa sequência.

Retirar integralmente Play/Pause: botão circular, ícones, estado de reprodução manual, estilos específicos, rótulos sem consumidores e qualquer alternativa oculta ou atalho de reprodução. Preservar setas anterior/seguinte e abas, que servem a navegação manual entre áreas.

O âmbito activo é `WorkshopSection`, montado em `Home.tsx`. `NewsSection` tem um carrossel legado, mas não está montado na homepage e não possui o controlo Play/Pause em causa; não será alterado ou reactivado.

Fontes de verdade: [AGENTS.md](../AGENTS.md), [mapa](../PROJECT_MAP.md), [Plano 134](134-performance-imagens-autoplay-fades.md), [qualidade](../docs/QUALITY.md), [sistema de design](../docs/DESIGN_SYSTEM.md), [playbook](../docs/OA_Design_Mastery_Playbook.md), [estudo aplicado](../docs/DESIGN_STUDY.md) e [conteúdo](../docs/CONTENT_GUIDE.md).

## 2. Diagnóstico confirmado

### Percurso que bloqueia o autoplay

1. `HeroSection.enterWebsite()` desloca a página para `#workshop` e aplica `workshopSection.focus({ preventScroll: true })`, com `tabindex="-1"` temporário. Essa transferência de foco deve ser preservada para a navegação.
2. `WorkshopSection` usa `onFocusCapture={() => setIsFocused(true)}` para toda a secção, incluindo o foco recebido pelo próprio contentor.
3. `canAutoRotate` exige `!isFocused`. O foco programático da entrada é, por isso, interpretado como uma interacção que deve suspender o slideshow.
4. O foco pode permanecer no contentor sem outra acção do visitante. O temporizador automático deixa de ser armado.

### Bloqueios e temporizadores associados

- O hover de **toda a secção** também impõe `!isHovered`; um ponteiro parado sobre a imagem mantém essa condição falsa, independentemente da inactividade.
- `registerUserInteraction()` só incrementa `idleTick` após oito segundos. Não limpa `isFocused` ou `isHovered`; não consegue resolver os bloqueios anteriores.
- O temporizador de inactividade e o temporizador de avanço são distintos. Quando a interacção termina, o primeiro pode reiniciar o segundo, tornando a retoma mais demorada do que os oito segundos anunciados. Este encadeamento é uma fragilidade confirmada no código, sem uma duração adicional medida nesta inspecção.

### Evidência pública de 2026-11-08

Reproduzido no site publicado, entrando pelo botão do logótipo, num viewport de 1280 × 720:

| Sinal observado | Resultado |
|---|---|
| Slide após a entrada | `architecture` |
| Slide após **14,46 segundos** | Continua `architecture` |
| Elemento focado | `SECTION#workshop` |
| Foco visível | `false` — foco programático, sem navegação por teclado |
| Reprodução manual | Activada: botão indica `Pause slideshow`, `aria-pressed="false"` |
| Movimento reduzido | `false` |
| Página oculta | `false` |
| Secção após estabilizar o scroll | Totalmente visível: topo 0, altura 720 |
| Hover | Ausente na primeira leitura; presente após o scroll estabilizar |
| Consola | Sem avisos ou erros observados |

O bloqueio corresponde à lógica de pausa, não a uma preferência de movimento reduzido ou a uma pausa manual activada. Observações e captura guardadas nos artefactos locais, fora do repositório público. Não foram inspeccionados estados privados do React nem alterado o código em produção.

## 3. Alterações propostas

### D1 — Autoplay e foco

- Preservar o foco de entrada fornecido pelo Hero. Corrigir a interpretação desse foco em `WorkshopSection`, sem remover a navegação acessível da abertura.
- Distinguir foco programático no contentor/heading e foco real de teclado nos controlos ou painel. A entrada pelo Hero ou por hash não deve criar uma pausa permanente.
- Eliminar o bloqueio provocado por hover passivo da secção. O simples posicionamento do rato sobre a fotografia não pára a rotação.
- Conservar a suspensão enquanto o visitante usa por teclado os controlos/painel, retomando quando esse foco sai. O foco gerado por uma selecção com rato/toque não fica a bloquear a rotação.
- Manter as condições de página visível, secção na viewport e preferência de movimento reduzido. Fora da viewport, em segundo plano ou com movimento reduzido activo, a suspensão é intencional.

### D2 — Um único prazo de oito segundos

- Usar uma só contagem efectiva para o próximo avanço; retirar a cadeia de temporizador de inactividade seguida de outro temporizador de rotação.
- Ao seleccionar uma aba ou seta com rato/toque, mostrar imediatamente a área escolhida e reiniciar um prazo de oito segundos, inclusive quando se selecciona a área já activa.
- Ao retomar de uma suspensão legítima, começar um novo prazo, sem recuperar avanços acumulados nem saltar áreas.
- Limpar o temporizador ao desmontar ou suspender. Preservar a ordem e o crossfade actual, sem alterar as imagens ou criar abstracções/dependências novas.

### D3 — Retirada integral de Play/Pause

- Eliminar o botão `.workshop-nav-btn-playback`, os ícones `Play`/`Pause`, o estado `isPlaying` e o handler exclusivo de reprodução.
- Retirar as duas regras CSS exclusivas desse botão. Reutilizar o alinhamento e espaçamento existentes para as duas setas restantes; não redesenhar o palco ou a barra de abas.
- Remover dos dois idiomas as chaves de reprodução comprovadamente sem consumidores, mantendo paridade PT/EN. Não reescrever conteúdo institucional.
- Não acrescentar uma opção equivalente no menu, um botão oculto, um controlo só para teclado ou um atalho Play/Pause: essas alternativas foram rejeitadas expressamente pelo utilizador.

### D4 — Acessibilidade e decisão expressa

A retirada integral de uma pausa persistente altera a opção adoptada no Plano 134. A orientação de referência WCAG 2.2 do playbook prevê um mecanismo de pausa/paragem para conteúdo que se actualiza automaticamente; pausar apenas enquanto o foco está no carrossel não satisfaz esse mecanismo. Movimento reduzido e suspensão temporária por foco serão preservados, mas não serão apresentados como prova de conformidade com o critério 2.2.2.

O pedido posterior e explícito de retirada integral prevalece sobre a orientação de manter esse controlo. Registar esta escolha e a sua limitação no ADR `docs/decisions/0003-autoplay-workshop-sem-playback.md`; não introduzir uma alternativa de reprodução contrária à decisão do utilizador. Isto não dispensa foco visível, navegação manual acessível, semântica, contraste ou respeito por movimento reduzido.

## 4. Ficheiros previstos

Nesta preparação: apenas este plano, `plans/README.md` e `PROJECT_MAP.md`.

Após aprovação:

| Ficheiro | Alteração |
|---|---|
| `src/components/home/WorkshopSection.tsx` | Foco/hover, temporização única e retirada integral de Play/Pause |
| `src/components/home/workshop.css` | Retirar estilos exclusivos do botão e verificar alinhamento das setas |
| `src/locales/en.ts`, `src/locales/pt.ts` | Retirar apenas os rótulos de reprodução sem consumidores |
| `docs/decisions/0003-autoplay-workshop-sem-playback.md` | Registar autoplay, navegação manual e a decisão D4 |
| `docs/decisions/README.md` | Indexar o ADR |
| Este plano, `plans/README.md`, `PROJECT_MAP.md` | Estado, responsabilidades e resultados reais |

`HeroSection.tsx` e `WorkshopTabs.tsx` são dependências consultadas; não se prevê alterá-las. A correcção deve preservar os seus contratos. Qualquer necessidade concreta adicional será registada antes de ampliar o lote.

Ficam fora do âmbito: carrossel legado de notícias, novas funcionalidades, imagens/pipeline, intervalos editoriais diferentes, redesenho, SEO-01/02/03, rotas, bootstrap/hidratação, dependências, back-end, Search Console, merge e deploy. A autorização anterior de publicação era específica do Plano 084.

## 5. Execução e verificações

1. Confirmar aprovação deste plano, estado Git e `main` remota. Criar `codex/fix-slideshow-autoplay` a partir da base actual e transportar apenas o plano e os seus índices.
2. Guardar a referência do build e os ecrãs EN/PT. Implementar D1–D3 no componente e CSS existentes; registar D4 sem alterar a decisão do utilizador.
3. Testar no navegador a entrada pelos três botões do Hero, scroll normal e hashes das áreas. Com a secção visível e movimento normal, o primeiro avanço deve ocorrer em cerca de oito segundos, mesmo com foco programático na secção e o rato sobre a fotografia.
4. Observar **três ciclos completos, pelo menos 72 segundos**, mantendo a sequência de três áreas. Não confundir três transições/24 segundos com três ciclos completos.
5. Testar setas, selecção da mesma aba e de outra aba, rato/toque e teclado. Confirmar resposta imediata, reinício do prazo único, ausência de roubo de foco e ausência de bloqueio após uma selecção por ponteiro.
6. Testar saída/entrada da viewport, retorno ao separador e movimento reduzido com os mecanismos de emulação disponíveis. Não alterar definições reais do sistema do utilizador; se alguma simulação não for suportada, identificar a limitação sem alegar sucesso.
7. Rever EN/PT em **375, 768 e 1440 CSS px**, incluindo foco, toque, alinhamento, ausência de overflow e ausência do botão de reprodução em todos os estados. Preservar setas, abas, semântica e legibilidade.
8. Executar `npm run lint`, `npm run build`, `npm test` e `git diff --check`. A suite SEO existente deve continuar a passar: 43 páginas, três URLs no sitemap e JSON-LD/idiomas/recursos preservados. Comparar os metadados com a referência; a mudança de corpo HTML prevista limita-se à retirada do controlo e ao comportamento autorizado.
9. Registar tempos, estados, avisos, limitações e capturas fora dos ficheiros versionados. Rever o diff, criar commits na branch e entregar o resultado antes de integração/publicação.

## 6. Riscos e salvaguardas

- **Confundir foco da entrada com interacção de teclado:** testar explicitamente os dois percursos, preservando o foco do Hero.
- **Retoma duplicada, tardia ou com saltos:** uma só contagem efectiva; testar selecção manual, suspensão e desmontagem.
- **Rotação interromper navegação por teclado:** suspensão enquanto o teclado opera nos controlos/painel, sem retirar foco.
- **Retirada da pausa explícita:** decisão do utilizador registada, com a limitação WCAG descrita em D4; sem afirmação de conformidade integral.
- **Afectar SEO ou conteúdo:** lote restrito e execução da suite/comparação existentes; sem nova dependência.

## 7. Registo e aprovação

- **2026-11-08:** AGENTS, mapa, Plano 134 e referências de design consultados. Estado Git limpo e `main` local/remota em `e468fe7`; número 135 livre. Pesquisa limitada aos componentes activos, consumidores e documentação relevante.
- **2026-11-08:** fluxo verificado: entrada pelo Hero → foco na secção → condições do temporizador → slide activo. A competência de verificação foi aplicada ao front-end estático; não existem API, base de dados ou variáveis de ambiente neste percurso.
- **2026-11-08:** reproduzido o bloqueio durante 14,46 segundos, com movimento normal e reprodução activada. Identificada a causa no foco de entrada e as condições de hover/retoma associadas. Capturado o controlo actualmente publicado.
- **2026-11-08:** oferecida uma alternativa de pausa disponível apenas pelo teclado; o utilizador escolheu retirar qualquer controlo de reprodução. A preferência está incorporada em D3/D4; não será novamente submetida como se estivesse em aberto.
- **2026-11-08:** preparação apenas documental; código, traduções e site publicado continuam intactos. Build, lint e testes de implementação não foram executados nesta fase.
- **2026-11-08 — Verificação documental:** oito ligações locais válidas, UTF-8 legível, sem espaços finais e `git diff --cached --check` sem erros. Diff limitado aos três documentos previstos; apenas aviso de normalização futura LF/CRLF no novo Markdown.

O utilizador autorizou a execução deste plano concreto, incluindo D1–D4:

```text
APROVADO: plans/135-slideshow-autoplay-sem-playback.md
```

## 8. Registo da execução

- **2026-11-08 — Início:** workspace limpo e `main` remota reconfirmada em `e468fe7`. Criada a branch de implementação sem tracking de `main`; transportados apenas o plano e os seus índices. Preservadas as branches anteriores. Aprovação de implementação não autoriza merge ou publicação.
- **2026-11-08 — Referência:** build da base concluído com 43 páginas e três URLs no sitemap, sem imagens regeneradas. Guardados metadados/JSON-LD das 43 páginas, corpos HTML iniciais, traduções e hashes de sete recursos e 55 ficheiros protegidos; referências visuais EN/PT disponíveis nos artefactos locais. Os avisos anteriores mantêm-se: Browserslist desactualizado, `padding-left: var(--tracking-*)` inválido e bundle de 510,31 kB acima de 500 kB.

## Fontes externas

- [W3C — Understanding 2.2.2: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), consultado em 2026-11-08: pausa persistente e limites de uma pausa dependente de foco.
- [W3C — Carousels: Animations](https://www.w3.org/WAI/tutorials/carousels/animations/), consultado em 2026-11-08: controlo de animação e suspensão por interacção.
