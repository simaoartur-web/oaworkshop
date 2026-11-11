# Sistema de Design — O+A Workspace

> Interpretação operacional do sistema visual O+A para o ambiente interno de trabalho. Subordinado aos princípios de `DESIGN_BRIEF.md`.

## 1. Tokens Canónicos (`src/design-system/tokens.css`)

### Paleta Semântica

| Token CSS | Valor | Papel Semântico |
|---|---|---|
| `--oa-bg-deep` | `#050505` | Palco imersivo, pranchas visuais, visualizador 3D, sobreposições |
| `--oa-bg-primary` | `#111111` | Superfície principal de trabalho e leitura |
| `--oa-bg-secondary` | `#181818` | Superfície elevada discreta / linhas alternadas |
| `--oa-surface-panel` | `#222222` | Painéis secundários, cabeçalhos técnicos e controlos |
| `--oa-accent` | `#A65D4A` | Terracota O+A — único acento de marca, estados activos, botões com texto branco e foco |
| `--oa-accent-hover` | `#B86B57` | Realce de interacção sobre terracota |
| `--oa-accent-text` | `#CE826D` | Variante terracota legível para micro-texto em fundos escuros (≥ 5,9:1 em `#090909`–`#181818`) |
| `--oa-text-primary` | `#FFFFFF` | Texto principal e títulos |
| `--oa-text-secondary` | `#E0E0E0` | Corpo de leitura e dados primários |
| `--oa-text-muted` | `#BDBDBD` | Metadados, etiquetas e descrições secundárias (≥ 4,5:1 em `#111111`) |
| `--oa-text-subtle` | `#9E9E9E` | Cotas técnicas e numeração secundária (≥ 4,5:1 em `#050505`/`#111111`) |
| `--oa-border-hairline` | `rgba(255, 255, 255, 0.10)` | Divisórias estruturais de prancha (`1px`) |
| `--oa-border-strong` | `rgba(255, 255, 255, 0.24)` | Limites activos e inputs focados |
| `--oa-status-error` | `#E07A68` | Validação de erro legível em fundo escuro, acompanhada de ícone e texto |

> **Nota de Acessibilidade (WCAG 2.2 AA):** `#9E9E9E` sobre `#111111` apresenta rácio de contraste **6,8:1** (acima do mínimo 4,5:1). Texto informativo nunca utiliza opacidades inferiores equivalentes a < 4,5:1.

## 2. Tipografia

- **Interface, Dados e Controlos (`--font-sans`):** `'Outfit', system-ui, sans-serif`
  - Pesos usados na UI produtiva: `300` (títulos grandes ≥ 24px), `400` (corpo e inputs), `500` (botões e rótulos activos), `600` (códigos e estados).
- **Expressão Editorial (`--font-serif`):** `'Playfair Display', Georgia, serif`
  - Reservado exclusivamente a citações de atelier, subtítulos editoriais de recepção e momentos curatoriais. **Proibido** em tabelas, inputs, mensagens de erro ou etiquetas técnicas.
- **Microtipografia Técnica:**
  - Etiquetas de secção em maiúsculas com `letter-spacing: 0.20em–0.26em`, tamanho mínimo `11px` (`0.6875rem`) com peso `500` e contraste elevado.

## 3. Grelha, Superfícies e Geometria

- **Raio de borda zero ou mínimo (`0px` a `2px`):** alinhado ao carácter tectónico e ortogonal de prancha arquitectónica; sem cartões `rounded-2xl` genéricos.
- **Linhas estruturais (`1px`):** usar espaço negativo e linhas contínuas partilhadas antes de criar caixas isoladas.
- **Alvos interactivos:** altura mínima recomendada de `44px` em botões, links de acção, selectores de idioma e cartões de perfil.

## 4. Movimento e Performance

- **Curva canónica:** `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-architectural`).
- **Controlos funcionais:** resposta rápida (`150ms–220ms`), sem delays artificiais.
- **Transições espaciais:** revelação suave de `450ms–650ms` apenas na entrada de secções.
- **`prefers-reduced-motion: reduce`:** desactiva deslocações e animações contínuas, preservando feedback imediato de foco e estado.

## 5. Marca O+A em Fundo Escuro

O activo oficial `public/logo.png` (692 × 511 px, RGBA) possui formas escuras sobre fundo transparente pensadas originalmente para fundo laranja institucional. Em superfícies escuras (`#050505` / `#111111`), o componente `OABrandMark` aplica inversão tonal controlada (`invert(1)`), preservando rigorosamente a geometria oficial O+A (estádio `O` em cinza pedra claro `#C5C5C3`, cruz `+` em recorte negativo e triângulo `A` em branco `#FFFFFF`), com fallback tipográfico `O+A` caso a imagem falhe.
