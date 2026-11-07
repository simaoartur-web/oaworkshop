# Contrato de Integração Futura com `oa-workshop.com`

> **Estado actual:** Documental e simulado localmente. **Nenhuma ligação, sincronização ou escrita ocorre sobre o repositório público `oaworkshop` nesta fase.**

## 1. Princípio de Fronteira

O website público `oa-workshop.com` permanece estático/pré-renderizado, bilingue (`EN`/`PT`) e regido pelo seu próprio `AGENTS.md`. O **O+A Workspace** actuará no futuro como ambiente interno de preparação e curadoria, exportando **apenas representações públicas depuradas** após aprovação explícita.

## 2. Pipeline Editorial Previsto (5 Etapas)

1. **Preparação Interna (`publicationStatus = 'private'`):** A equipa cria o dossier do projecto no Workspace. Por omissão, todo o projecto nasce privado.
2. **Solicitação Editorial (`publicationStatus = 'requested'`):** O responsável preenche metadados públicos obrigatórios (título, localização, ano, área, âmbito, textos `PT` e `EN`, créditos fotográficos confirmados e textos alternativos) e submete à fila editorial. **Solicitar não publica.**
3. **Revisão de Comunicação:** Validação linguística (`PT`/`EN`), verificação de licenças de imagem e exclusão de dados confidenciais.
4. **Decisão da Direcção (`'approved' | 'rejected'`):** Aprovação ou devolução fundamentada com registo de autor e data.
5. **Projecção Pública Sanitizada (Futuro RFC):** Apenas os campos do contrato `PublicPortfolioProjection` seriam exportados, excluindo obrigatoriamente:
   - ficheiros `.skp`, `.glb` internos, CAD/BIM e PDFs técnicos privados;
   - orçamentos, horas, comentários internos, versões rascunho e nomes de clientes confidenciais;
   - histórico interno de tarefas e revisões.

## 3. Preservação de SEO do Website Público

Qualquer integração futura terá de preservar no repositório público:
- slugs estáveis, rotas bilingues e links `canonical`;
- pré-renderização estática (`scripts/prerender.mjs`), `sitemap.xml`, Open Graph e JSON-LD;
- pipeline `sharp` de optimização de imagens WebP.
