# ADR 0001 — Front-end primeiro

> **Estado:** ACEITE
> **Data:** 31 de Agosto de 2026

## Contexto

O repositório continha uma aplicação pública React/Vite e um CMS com servidor próprio. O painel administrativo e a API aumentavam o âmbito antes de a experiência pública estar concluída.

## Decisão

O projecto permanece exclusivamente front-end até a interface pública estar concluída, validada e aceite. O conteúdo será local e versionado. Não existirão API própria, base de dados, autenticação ou área administrativa durante esta fase.

O back-end e os acoplamentos do front-end foram removidos de `main` e `Side-Oa-workshop`, incluindo as respectivas referências remotas.

## Consequências

- desenvolvimento, compilação e publicação são estáticos;
- conteúdo é alterado através do código e de ficheiros locais;
- não há edição administrativa nem recolha de dados no servidor;
- qualquer funcionalidade que dependa de persistência deve aguardar;
- o front-end pode ser estabilizado sem contratos de API prematuros.

## Condições de revisão

Esta decisão só pode ser revista depois de:

1. o front-end ser declarado canónico;
2. existir um inventário de necessidades reais de conteúdo e operações;
3. ser aprovado um RFC de back-end com alternativas, segurança, privacidade, custos, migração e manutenção;
4. ser registado um novo ADR que substitua este.
