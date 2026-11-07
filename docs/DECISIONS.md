# Registo de Decisões Arquitecturais (`DECISIONS.md`)

## ADR-001 — Isolamento em Repositório Independente (`oaworkspace`)
- **Data:** 2026-11-07 · **Estado:** Aceite
- **Contexto:** O repositório público `oaworkshop` proíbe painel administrativo e backend em `AGENTS.md`.
- **Decisão:** Criar `oaworkspace` como directório e repositório Git autónomo ao lado de `oaworkshop`, em branch própria (`codex/feat-phase-00-01-entry-experience`), sem tocar num único ficheiro de `oaworkshop`.
- **Risco residual:** A reutilização do monograma oficial `logo.png` e `favicon.png` é feita por cópia estática controlada para evitar dependências cruzadas entre pastas.

## ADR-002 — Stack Frontend Enxuta (React 19 + TypeScript + Vite 7 + Tailwind v4)
- **Data:** 2026-11-07 · **Estado:** Aceite
- **Contexto:** Alinhar família técnica com a equipa O+A mantendo arranque rápido, tipagem estrita e ausência de kits genéricos.
- **Decisão:** Usar React 19, TypeScript estrito, React Router v7, Tailwind CSS v4 com tokens próprios (`tokens.css`), Framer Motion (com respeito integral a `useReducedMotion`) e Lucide React com traço fino (`1.25px`). Não importar bibliotecas de componentes pré-estilizados (shadcn, MUI, AntD).

## ADR-003 — Composição de Entrada: Prancha de Corte & Câmara de Acesso
- **Data:** 2026-11-07 · **Estado:** Aceite
- **Contexto:** `/login` e `/welcome` definem o carácter arquitectónico do produto e não podem parecer templates SaaS nem prejudicar o acesso diário.
- **Decisão:** Adoptar a **Composição A** documentada em `docs/DESIGN_BRIEF.md`: divisão assimétrica 58/42 em `/login` com alternância entre estudo fotográfico e corte técnico ortogonal SVG + índice visível de 6 perfis demo; caderno editorial 7/5 em `/welcome` com atalho imediato no topo e preferência persistente `skipWelcomeOnLogin`.

## ADR-004 — Sessão Demonstrativa Honesta e Zero Passwords em Storage
- **Data:** 2026-11-07 · **Estado:** Aceite
- **Contexto:** O protótipo não possui backend nem autenticação criptográfica real.
- **Decisão:** Persistir apenas `{ userId, role, authenticatedAt, mode: 'local-demo' }` e preferências de interface em `localStorage`. Nunca guardar palavras-passe. O diálogo «Esqueceu-se da palavra-passe?» informa com transparência que o envio de e-mail/SSO não existe em modo demo, sem simular envio.

## ADR-005 — Estudos Visuais Dedicados em Vez de Obras Reais Não Confirmadas
- **Data:** 2026-11-07 · **Estado:** Aceite
- **Contexto:** A especificação proíbe reutilizar nomes ou fotografias de projectos reais da empresa sem confirmação e exige protagonismo arquitectónico.
- **Decisão:** Utilizar estudos espaciais e de maquete gerados especificamente para o arquivo demonstrativo interno (`public/assets/studies/*.webp`), acompanhados de desenhos técnicos vectoriais (SVG) e identificados explicitamente como `Estudo Espacial Demo`.
