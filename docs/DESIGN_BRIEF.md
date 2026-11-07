# Fase 00 — Design Brief & Direcção de Arte
## O+A Workspace: Architectural Operating Space

> **Estado:** Aprovado internamente na Fase 00 para orientar a Fase 01 (`/login` e `/welcome`) e a arquitectura visual das fases seguintes.
> **Referências consultadas:** `oaworkshop/docs/DESIGN_SYSTEM.md`, `OA_Design_Mastery_Playbook.md`, `DESIGN_STUDY.md`, `CONTENT_GUIDE.md`.

---

## 1. Tese de Design: Um Atelier, Não um Dashboard

O **O+A Workspace** rejeita a estética padronizada de templates SaaS (grelhas de cartões arredondados, barras coloridas, sombras difusas, glassmorphism decorativo e KPIs arbitrários). A sua referência estrutural é o **atelier físico de arquitectura** — entre Milão e Maputo:

1. **A Prancha Técnica (*Drawing Sheet*):** linhas divisórias de `1px` com rigor ortogonal, cotas, códigos de referência (`OA-26-014`), legendas estruturadas (*title blocks*) e alinhamentos partilhados.
2. **A Matéria Escura e a Luz Rasante:** planos sólidos em `#050505` (palco imersivo) e `#111111` (mesa de trabalho), separados por `#222222` e linhas subtis, onde a fotografia espacial, os cortes técnicos e as maquetes assumem protagonismo absoluto.
3. **A Terracota Contida (`#A65D4A`):** único acento cromático da marca, reservado para indicar estado activo, foco intencional, acção primária ou eixo de leitura — nunca diluído em gradientes decorativos.
4. **Dualidade Expressiva vs. Produtiva:**
   - **Momentos Expressivos (`/login`, `/welcome`, Dossier de Projecto, Viewer 3D):** escala tipográfica ampla, contraste entre `Outfit` e itálicos pontuais em `Playfair Display`, espaço negativo generoso e presença espacial.
   - **Momentos Produtivos (Formulários, Selecção de Papéis, Tarefas, Fila Editorial):** densidade calibrada, rótulos persistentes, zero atrasos artificiais e acções imediatas.

---

## 2. Exploração Comparativa — Duas Composições Contrastantes (Fase 00)

Antes de implementar a Fase 01, foram avaliadas duas direcções estruturais distintas para os dois primeiros momentos (`/login` e `/welcome`):

### Composição A — *Prancha de Corte & Câmara de Entrada* (Seleccionada)

- **`/login`:** Composição assimétrica full-viewport dividida verticalmente num rácio arquitectónico **58% / 42%** em desktop (`1440px+`), **48% / 52%** em tablet paisagem e **sequência vertical dedicada** em tablet retrato/mobile (`768px` / `375px`):
  - **Zona Esquerda (58% — *Palco Espacial / Prancha 00*):** Fundo `#050505` com peça espacial de estudo arquitectónico em luz rasante, acompanhada por cotas discretas (`EIXO MILÃO · MAPUTO`), relógio operacional dos dois estúdios e alternador interactivo entre **Estudo Fotográfico** e **Corte Ortogonal Técnico (SVG)**, ancorado por tese editorial em `Playfair Display`.
  - **Zona Direita (42% — *Câmara de Acesso & Legenda de Papéis*):** Superfície mate `#111111` estruturada como bloco de título técnico: monograma oficial O+A, alternador `PT / EN`, aviso explícito de `Modo Demonstração`, formulário com inputs de linha de base arquitectónica, diálogo honesto de recuperação indisponível em demo e **índice estruturado de 6 perfis demonstrativos** (`DIR`, `ARQ`, `GPR`, `DEP`, `COM`, `EQP`) com preenchimento imediato ou entrada directa por teclado/clique.
- **`/welcome`:** *Caderno de Entrada do Atelier* — grelha editorial assimétrica de 12 colunas (`7 + 5`) com barra superior de acesso rápido (**«Ir directamente para o workspace»** visível sem scroll), saudação temporal serena, destaque do estudo em foco (*Pavilhão Cívico da Baía*, maquete + planta/corte técnico sobreposto), síntese de prioridades adaptada ao papel demonstrativo activo, botão principal **«Entrar no Workspace»** e controlo persistente local para **saltar a introdução em visitas futuras**.

### Composição B — *Mesa de Luz Central / Cartão Flutuante sobre Tela Cheia* (Rejeitada)

- **`/login`:** Fotografia arquitectónica a ocupar 100% do ecrã com cartão central semitransparente (`backdrop-blur`) contendo o formulário e um dropdown simples de perfis.
- **`/welcome`:** Ecrã hero centrado a 100vh exigindo deslocação vertical (*scroll*) para revelar o projecto em foco e a acção de entrada.

### Justificação da Escolha (Por que vence a Composição A)

| Critério | Composição A (*Prancha & Câmara*) | Composição B (*Cartão Flutuante*) |
|---|---|---|
| **Identidade O+A** | Evoca uma prancha de atelier e arquivo editorial; inconfundível mesmo sem logótipo. | Aproxima-se de ecrãs de login SaaS/OS comuns e recorre a *glassmorphism* proibido pelo sistema. |
| **Legibilidade & WCAG 2.2 AA** | Controlos sobre plano sólido `#111111` garantem contraste estável ≥ 7:1 em qualquer ecrã. | Contraste depende da fotografia subjacente e degrada-se em recortes responsivos. |
| **Usabilidade quotidiana** | Perfis demo visíveis de imediato sem abrir menus ocultos; `/welcome` oferece saída rápida no topo e opção de desactivar. | Dropdown esconde papéis demo; scroll na `/welcome` atrasa o trabalho diário. |
| **Performance** | Sem `backdrop-filter` pesado em tela cheia; SVG técnico instantâneo + imagem `webp` optimizada. | Blur em grande área penaliza GPUs integradas e telemóveis. |
| **Mobile (`375px`)** | Cabeçalho espacial compacto + folha técnica táctil sem comprimir colunas. | Cartão sobre foto gera margens desperdiçadas e conflito com teclado virtual. |

---

## 3. Adaptação Mobile Radical (`375px` e `768px`)

Em vez de encolher duas colunas:
- **`375px` (Mobile):** `/login` abre com um cabeçalho arquitectónico compacto (monograma O+A, `PT/EN`, recorte espacial horizontal com cota técnica) seguido imediatamente pelo formulário de acesso com alvos tácteis ≥ `44px` e pela grelha vertical compacta de perfis demo. `/welcome` coloca a saudação, o atalho rápido e o botão «Entrar no Workspace» acima ou logo após o destaque visual contido, sem exigir longo scroll para trabalhar.
- **`768px` (Tablet):** Grelha editorial equilibrada com prancha superior panorâmica (rácio `16:7`) e bloco duplo inferior (autenticação + matriz de 2 colunas de perfis demo), preservando hierarquia e conforto de toque.
