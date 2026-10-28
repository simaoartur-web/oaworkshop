# Plano 133 — Redesign da Secção Our Team

**Estado:** CONCLUÍDO (Implementado e validado na branch `codex/redesign-our-team-section`)  
**Branch:** `codex/redesign-our-team-section`  
**Data:** 2026-10-28  
**Referência Visual Principal:** Protótipo anexado (`Our team` — Joint Leadership + botão `Discover our team ↓` + grelha expansível `OUR TEAM / OUR COLLABORATORS`)

---

## 1. Diagnóstico e Objectivo

Substituir a apresentação da secção `Our Team` (`#team`) por uma composição arquitectónica editorial fiel ao protótipo visual fornecido, mantendo a arquitectura front-end do projecto, a fonte única de dados (`TEAM_MEMBERS` em `src/data/team.ts`), a abertura do painel individual (`TeamProfilePanel.tsx`), as traduções PT/EN e a acessibilidade (WCAG 2.2 AA).

---

## 2. Alterações Implementadas

### 2.1. Composição Visual e Atmosfera (`TeamSection.tsx` & `team.css`)
- **Fundo e Continuidade Visual:**
  - Base em preto profundo/carvão (`#090909` → `#0b0a09` → `#0b0b0b`), integrada suavemente entre `ProjectsSection` (`#portfolio`) e `ContactSection` (`#contact`).
  - Camada decorativa (`aria-hidden="true"`) com fotografia arquitectónica local existente (`/images/architecture.png`), tratada com máscara diagonal, vinheta escura e iluminação quente subtil (`#ED7D31` / `#A65D4A`), reproduzindo o enquadramento superior direito e o recorte arquitectónico inferior do protótipo.
- **Cabeçalho Editorial em Duas Colunas (Desktop):**
  - **Coluna esquerda:** Eyebrow `PEOPLE AND PRACTICE` / `PESSOAS E PRÁTICA` (`team.eyebrow`) em laranja quente + título principal `Our team` / `A nossa equipa` em `Outfit` Light + parágrafo introdutório + traço horizontal laranja (`#ED7D31`).
  - **Coluna direita (Manifesto):** Linha vertical arquitectónica fina + traço horizontal superior + manifesto em três linhas maiúsculas (`DIFFERENT` / `DISCIPLINES.` / `A SHARED VISION.` em EN; `DIFERENTES` / `DISCIPLINAS.` / `UMA VISÃO PARTILHADA.` em PT).

### 2.2. Apresentação Inicial — Joint Leadership (`TeamSection.tsx`, `TeamMember.tsx`, `TeamAvatar.tsx`)
- Apresenta permanentemente apenas os 2 membros com `leadership: true` (`Osvaldo Luís` e `Artur Simão`), permanecendo sempre visíveis independentemente de a secção de colaboradores estar recolhida ou expandida.
- Dois perfis horizontais lado a lado em desktop/tablet (`>= 640px`) e em apresentação vertical equilibrada em mobile (`< 640px`).
- Cada perfil inclui:
  - Moldura de retrato (`TeamAvatar.tsx`) com iluminação quente subtil nos cantos e monograma tipográfico editorial (`OL`, `AS`) enquanto `member.image === null` (sem rostos gerados por IA).
  - Iniciais estilizadas em serif (`Playfair Display`, `OL` e `AS`), nome em destaque em `Outfit`, cargo e especialização em duas linhas, separador fino e botão `View profile ↗` que abre o `TeamProfilePanel`.

### 2.3. Botão Interactivo `Discover our team ↓` / `Close team ↑`
- Centralizado abaixo de `Joint Leadership`, enquadrado por linhas horizontais subtis e anéis geométricos finos no fundo.
- Estado inicial recolhido (`aria-expanded="false"`, colaboradores completamente ausentes da árvore DOM e da ordem de tabulação).
- Ao clicar, revela suavemente o painel de colaboradores abaixo do botão e actualiza para `Close team ↑` (EN) / `Fechar equipa ↑` (PT), com rotação da seta e suporte completo a `prefers-reduced-motion`.

### 2.4. Secção Expansível de Colaboradores — Multidisciplinary Team
- Filtra exclusivamente `TEAM_MEMBERS.filter((member) => !member.leadership)` (6 colaboradores: **Mivas Massingue**, **Edson Camba**, **Letícia Muguambe**, **Maxime Zabrodin**, **Neide**, **Imran Jafar**). **Osvaldo Luís e Artur Simão não aparecem novamente nesta listagem.**
- Contentor emoldurado com cabeçalho `OUR TEAM` — `OUR COLLABORATORS` e grelha responsiva editorial:
  - **Desktop (`>= 1024px`):** 3 colunas (`3×2`).
  - **Tablet (`768px`):** 2 colunas (`2×3`).
  - **Mobile (`360px–430px`):** 2 colunas fluidas (1 coluna abaixo de `360px`) sem truncagem nem overflow horizontal.

---

## 3. Ficheiros Alterados

- `src/components/home/TeamSection.tsx`
- `src/components/home/TeamMember.tsx`
- `src/components/home/TeamAvatar.tsx`
- `src/components/home/team.css`
- `src/data/team.ts` (exportação da função utilitária `getTeamInitials`)
- `src/locales/en.ts`
- `src/locales/pt.ts`
- `PROJECT_MAP.md`
- `plans/133-redesign-seccao-our-team.md`

---

## 4. Verificações Executadas

- **`npm run lint`:** `0` erros, `0` avisos.
- **`npm run build`:** Compilação limpa (`tsc -b && vite build`).
- **`git diff --check`:** `0` erros de formatação ou whitespace.
- **Matriz Visual e Funcional (`360`, `375`, `390`, `430`, `768`, `1024` e `1440 px` em `ENG` e `PT`):**
  - Estado inicial recolhido (`aria-expanded="false"`, `collabPanelPresent: false`, apenas `Osvaldo Luís` e `Artur Simão` visíveis).
  - Estado expandido (`aria-expanded="true"`, `collaboratorsCount: 6`, `hasLeadersInCollaborators: false`, rótulo `Close team` / `Fechar equipa`).
  - Abertura e fecho de `TeamProfilePanel` validados com restauro de foco.
  - `overflow: false` (`scrollWidth <= innerWidth`) nas 14 combinações de largura × idioma.
  - `prefers-reduced-motion: reduce` validado (`transition-duration: 0s`).
