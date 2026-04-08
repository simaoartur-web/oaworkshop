# O+A Architecture & Planners - Feature & Optimization Backlog

Este documento contém uma lista organizada de melhorias, otimizações e novas funcionalidades para o site **O+A workshop**, focando em performance (evitar slowdowns) e fluidez de navegação.

---

## 🚀 Performance & Otimização (Evitar Slowdowns)

> [!IMPORTANT]
> Atualmente, a página Home carrega 3 instâncias do Leaflet Map simultaneamente. Isso é pesado para dispositivos móveis e navegadores menos potentes.

### 1. Otimização de Mapas
- [x] **Lazy Mounting de Mapas**: Implementar `IntersectionObserver` para apenas inicializar e renderizar o componente de mapa quando ele entrar no viewport.
- [ ] **Instância Única de Mapa (Opcional)**: Refatorar as seções de categorias para usar um único componente de mapa que troca os dados dinamicamente ao invés de ter 3 mapas independentes.
- [ ] **FlyTo Smoother**: Ajustar os tempos de animação do Leaflet para não travar a main thread durante transições de coordenadas.

### 2. Otimização de Imagens & Ativos
- [x] **Lazy Loading Nativo**: Adicionar `loading="lazy"` em todas as imagens de projetos e thumbnails.
- [x] **LCP Optimization**: Adicionar `fetchpriority="high"` e `loading="eager"` no logo principal do `HeroSection` para melhorar o tempo de carregamento percebido.
- [ ] **WebP Migration**: Converter assets locais para `.webp` ou `.avif` e usar plugins como `vite-plugin-image-optimizer` para compressão automática.
- [ ] **Local Assets**: Trazer imagens do Unsplash (hardcoded no código) para a pasta `public` ou `assets` para evitar dependência de rede externa e latência de DNS.

### 3. Melhorias de Renderização (Framer Motion)
- [ ] **Reduced Motion**: Adicionar suporte a `useReducedMotion` para desativar animações pesadas em dispositivos que preferem menos movimento.
- [ ] **Backdrop-blur Check**: O modal de detalhes usa `backdrop-blur-xl`. Verificar performance em Safari/Mobile e talvez reduzir para `blur-md` se houver jank.

---

## 🌊 Fluxo de Navegação & UX (Melhoria de Fluxo)

### 4. Transições de Página
- [x] **AnimatePresence Layout**: Implementar transições suaves entre as rotas (Home -> Projects -> Admin) usando `framer-motion`.
- [x] **Scroll-to-Top**: Garantir que a navegação para novas páginas sempre resete o scroll suavemente para o topo.

### 5. Interações & Feedback
- [ ] **Skeleton Loaders**: Adicionar placeholders (skeleton screens) para as imagens dos projetos enquanto elas carregam no `CategoryMapSection`.
- [ ] **Touch Optimization**: Refinar o "Drag Timeline" no `ProjectsSection` para funcionar melhor em touch screens (atualmente focado em mouse events).
- [ ] **Mobile Cursor**: Desativar o cursor customizado ("PULL/DRAG") em dispositivos móveis, pois ele interfere no toque nativo.

### 6. Arquitetura de Dados
- [ ] **Centralized Data Storage**: Mover todos os dados de `PROJECTS` e `SERVICES` para arquivos JSON ou um mini-CMS para facilitar edições sem tocar no código do componente.

---

## ✨ Funcionalidades a Desenvolver

### 7. Core Site Features
- [ ] **Language Switcher UI**: Implementar um seletor visual de idioma (PT/EN) integrado ao `i18next`.
- [ ] **Contact Form Logic**: Integrar o formulário de contacto com um serviço (ex: EmailJS, Netlify Forms ou backend próprio).
- [ ] **SEO & Metadata**: Implementar `react-helmet-async` para títulos dinâmicos e meta-descriptions em cada página de projeto.

### 8. Admin & Gestão
- [ ] **Project Editor**: Melhorar a página de Admin para permitir a edição visual das coordenadas do mapa e upload de imagens.
- [ ] **Auth Guard**: Implementar uma camada básica de proteção na rota `/admin`.

---

## 🛠️ Notas Técnicas para o PRÓXIMO Passo

Para começar a implementação, sugere-se seguir esta ordem:
1. **Lazy Loading de Mapas** (Ganho imediato de performance).
2. **Otimização de Assets** (Melhoria de LCP).
3. **Transições de Página** (Melhoria de feeling de app premium).
