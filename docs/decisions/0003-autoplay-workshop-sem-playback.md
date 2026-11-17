# ADR 0003 — Autoplay Contínuo do Workshop sem Controlos de Reprodução

> **Estado:** ACEITE — actualizada pelo Plano 136 (anteriormente iniciada no Plano 135).
> **Data:** 2026-11-17

## Contexto

A entrada pelo Hero transfere o foco para a secção Workshop. O comportamento anterior interpretava foco e hover como pausas, e a revisão editorial em `OA rev OL 161126.pdf` (pág. 2) solicitou um slideshow em reprodução contínua com linha temporal contínua a preencher progressivamente, duração confortável de leitura (11–14 segundos iniciais) e ausência de botão Play/Pause, mantendo selecção directa por abas e setas.

## Decisão

- Definir temporização única de **12 segundos** (`SLIDE_DURATION_MS = 12000`) sincronizada com uma linha temporal visualmente contínua entre as três áreas (`Architecture → Urban Planning → Research → Architecture`).
- Não interromper o avanço automático por hover, foco ou inactividade enquanto a secção está visível na viewport e o separador do browser está activo.
- Retirar integralmente o botão, estado, ícones, estilos e rótulos de Play/Pause, sem alternativas ocultas de pausa. Preservar selecção directa pelas abas, teclado (`ArrowLeft`/`ArrowRight`/`Home`/`End`) e setas `<` `>`, reiniciando o ciclo de 12 segundos a partir de 0%.
- Preservar `prefers-reduced-motion: reduce`: quando activo, suspender o avanço automático e as animações contínuas, apresentando indicador estático e navegação manual integral.

## Consequências e Conflito WCAG 2.2

A ausência de mecanismo persistente de pausa/paragem (WCAG 2.2 SC 2.2.2 — *Pause, Stop, Hide*, Nível A) para conteúdo automático com duração superior a 5 segundos constitui uma **excepção documentada por requisito explícito do cliente**. O projecto não declara conformidade com o critério 2.2.2 para o slideshow em movimento normal; permanecem assegurados contraste, semântica de abas, navegação manual por teclado e paragem automática para utilizadores com preferência por movimento reduzido.

## Condições de revisão

Rever através de plano aprovado caso mude a política de acessibilidade ou a preferência editorial sobre controlo de pausa.

## Referências

- [Plano 135](../../plans/135-slideshow-autoplay-sem-playback.md)
- [Plano 136](../../plans/136-revisao-landing-oa-nov2026.md)
- [W3C — Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
